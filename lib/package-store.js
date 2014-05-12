var fs = require('fs');
var logger = require('./logger');

module.exports = function PackageStore(options) {
    var _packages = {};

    _init();
    function _init() {
        _loadPackages();
    }

    function _getPackage(packageName) {
        var item = _packages[packageName];

        if(!item) {
            return null;
        }

        item.name = packageName;
        item.hits = item.hits || 0;
        item.hits++;

        //could use yield
        setTimeout(_persistPackages, 10);

        return item;
    }

    function _registerPackages(register) {
        for(var i = 0, len = register.length; i < len; i++) {
            var registerPackage = register[i];
            _packages[registerPackage.name] = {
                name: registerPackage.name,
                repo: registerPackage.repo,
                hits: 0
            };

            logger.log('Registered package: ' + registerPackage.name);
        }

        _persistPackages();


    }

    function _removePackages(remove) {
        for(var i = 0, len = remove.length; i < len; i++) {
            delete _packages[remove[i]];

            logger.log('Removed package: ' + remove[i]);
        }

        _persistPackages();
    }

    function _persistPackages() {
        if(fs.existsSync(options.persistFilePath)) {
            fs.unlinkSync(options.persistFilePath);
        }

        fs.writeFileSync(options.persistFilePath, JSON.stringify(_packages, null, '    '));
    }

    function _loadPackages() {
        if(!fs.existsSync(options.persistFilePath)) {
            return;
        }

        var json = fs.readFileSync(options.persistFilePath).toString();
        _packages = JSON.parse(json);
    }

    function _searchPackage(name) {
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