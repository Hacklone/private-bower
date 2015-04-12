var fs = require('fs');
var logger = require('../../infrastructure/logger');

module.exports = function PackageStore() {
    var self = {
        start: _start,

        packages: {},

        getPackage: _getPackage,
        registerPackages: _registerPackages,
        removePackages: _removePackages,

        searchPackage: _searchPackage,

        persistPackages: _persistPackages
    };
    
    var _options;

    function _start(options) {
        _options = options;

        _loadPackages();
    }

    function _getPackage(packageName) {
        var item = self.packages[packageName];

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

            if(!registerPackage.name) {
                logger.log('Undefined package name');

                continue;
            }

            self.packages[registerPackage.name] = {
                name: registerPackage.name,
                url: registerPackage.url,
                hits: 0
            };

            logger.log('Registered package: ' + registerPackage.name);
        }

        _persistPackages();
    }

    function _removePackages(remove) {
        for(var i = 0, len = remove.length; i < len; i++) {
            delete self.packages[remove[i]];

            logger.log('Removed package: ' + remove[i]);
        }

        _persistPackages();
    }

    function _persistPackages() {
        if(fs.existsSync(_options.persistFilePath)) {
            fs.unlinkSync(_options.persistFilePath);
        }

        fs.writeFileSync(_options.persistFilePath, JSON.stringify(self.packages, null, '    '));
    }

    function _loadPackages() {
        if(!fs.existsSync(_options.persistFilePath)) {
            return;
        }

        var json = fs.readFileSync(_options.persistFilePath).toString();

        try {
            self.packages = JSON.parse(json);
        }
        catch(e) {
            logger.error('Malformed registry file. It must be a valid json: ' + _options.persistFilePath);

            throw e;
        }
    }

    function _searchPackage(name) {
        var searchName = name.toLowerCase();
        var packages = [];

        for(var packageName in self.packages) {
            if(self.packages.hasOwnProperty(packageName) &&
                packageName.toLowerCase().indexOf(searchName) !== -1) {

                var item = self.packages[packageName];
                packages.push({
                    name: item.name,
                    url: item.url
                });
            }
        }

        return packages;
    }

    return self;
}();