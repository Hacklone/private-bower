var fs = require('fs');
var logger = require('./logger');
var _ = require('lodash');

module.exports = function PackageStore(config) {
    options = _.defaults(config, {
        persistFilePath: config.registryFile
    })
    var _packages = {};    

    function _init() {
        _loadPackages();
    }

    function _getPackage(packageName, callback) {
        var item = _packages[packageName];

        if(item) {
            item.name = packageName;
            item.hits = item.hits || 0;
            item.hits++;

            //could use yield
            setTimeout(_persistPackages, 10);
        }
        callback(null, item);
    }

    function _registerPackages(register, callback) {
        for(var i = 0, len = register.length; i < len; i++) {
            var registerPackage = register[i];

            if(!registerPackage.name) {
                logger.log('Undefined package name');

                continue;
            }

            _packages[registerPackage.name] = {
                name: registerPackage.name,
                repo: registerPackage.repo,
                hits: 0
            };

            logger.log('Registered package: ' + registerPackage.name);
        }

        _persistPackages(callback);
        
    }

    function _removePackages(remove, callback) {
        for(var i = 0, len = remove.length; i < len; i++) {
            delete _packages[remove[i]];

            logger.log('Removed package: ' + remove[i]);
        }

        _persistPackages(callback);
    }

    function _persistPackages(callback) {
        if(fs.existsSync(options.persistFilePath)) {
            fs.unlinkSync(options.persistFilePath);
        }

        fs.writeFileSync(options.persistFilePath, JSON.stringify(_packages, null, '    '));
        if(_.isFunction(callback)){
            callback();
        }
    }

    function _loadPackages() {
        if(!fs.existsSync(options.persistFilePath)) {
            return;
        }

        var json = fs.readFileSync(options.persistFilePath).toString();

        try {
            _packages = JSON.parse(json);
        }
        catch(e) {
            logger.error('Malformed registry file. It must be a valid json: ' + options.persistFilePath);

            throw e;
        }
    }

    function _searchPackage(name, callback) {
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

        callback(null, packages);
    }

    function _listPackages(callback) {
        callback(null, _.values(_packages));
    }

    function _updatePackage(package, callback){
        _getPackage(package.name, function(){
            _persistPackages(callback);            
        })
        
    }

    return {
        packages: _listPackages,

        getPackage: _getPackage,
        registerPackages: _registerPackages,
        removePackages: _removePackages,

        searchPackage: _searchPackage,
        updatePackage: _updatePackage,
        init: _init
    };
};
