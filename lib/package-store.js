var fs = require('fs');
var logger = require('./logger');

module.exports = function PackageStore(options) {
    var _packages = {};

    _init();
    function _init() {
        logger.log('package-store._init()');
        _loadPackages();
    }

    function _getPackage(packageName) {
        logger.log('package-store._getPackage(packageName:{0})'.format(packageName));
        var item = _packages[packageName];

        if(!item) {
            return null;
        }

        item.name = packageName;
        item.hits = item.hits || 0;
        item.hits++;

        //could use yield
        setTimeout(function() {logger.log("(timeout) call _persistPackage()"); _persistPackages()}, 1000); // Set to 1 second

        return item;
    }

    function _registerPackages(register) {
        logger.log('package-store._registerPackages(register:[');
        for(var i = 0, len = register.length; i < len; i++) {
            var registerPackage = register[i];
            _packages[registerPackage.name] = {
                name: registerPackage.name,
                repo: registerPackage.repo,
                hits: 0
            };

//            logger.log('Registered package: ' + registerPackage.name);
            logger.log('  { name: {0}, repo: {1}, hits: {2} },'.format(registerPackage.name, registerPackage.repo, registerPackage.hits));
        }
        logger.log('])');

        _persistPackages();
    }

    function _removePackages(remove) {
        logger.log('package-store._removePackages(remove:{0})'.format(remove));
        for(var i = 0, len = remove.length; i < len; i++) {
            delete _packages[remove[i]];

            logger.log('Removed package: ' + remove[i]);
        }

        _persistPackages();
    }

    function _persistPackages() {
        logger.log('package-store._persistPackages()');
        if(fs.existsSync(options.persistFilePath)) {
            fs.unlinkSync(options.persistFilePath);
        }

        fs.writeFileSync(options.persistFilePath, JSON.stringify(_packages, null, '    '));
    }

    function _loadPackages() {
        logger.log('package-store._loadPackages()');
        if(!fs.existsSync(options.persistFilePath)) {
            return;
        }

        var json = fs.readFileSync(options.persistFilePath).toString();
        _packages = JSON.parse(json);
    }

    function _searchPackage(name) {
        logger.log('package-store._searchPackage(name:{0})'.format(name));
        var searchName = name.toLowerCase();
        var packages = [];

        for(var packageName in _packages) {
            if(_packages.hasOwnProperty(packageName) &&
                packageName.toLowerCase().indexOf(searchName) !== -1) {

                var item = _packages[packageName];
                packages.push({
                    name: item.name,
                    url: item.repo
                });
            }
        }

        return packages;
    }

    return {
        packages: _packages,

        getPackage: _getPackage,
        registerPackages: _registerPackages,
        removePackages: _removePackages,

        searchPackage: _searchPackage
    };
};