var fs = require('fs');
var logger = require('../../infrastructure/logger');
var Client = require('node-rest-client').Client;
var config = require('../../infrastructure/configurationManager').config;

module.exports = function PublicPackageStore() {
    var _packages = {};
    var _publicBowerUrl;

    var _timer;

    function _start() {
        logger.log('Refreshing public packages...');

        _publicBowerUrl = config.publicRegistry;

        _loadPublicRegistryFromCache();

        _loadPublicPackagesPeriodically();
    }

    function _getPackage(packageName) {
        return _packages[packageName];
    }

    function _parsePackage(data) {
        try {
            var jsonData = JSON.parse(data);

            for(var i = 0, len = jsonData.length; i < len; i++) {
                var item = jsonData[i];
                _packages[item.name] = item;
            }

            return true;
        }
        catch(e) {
            logger.error('Could not load public packages, invalid data!');
            logger.error('data = ' + data);
        }
    }

    function _loadPublicRegistryFromCache() {
        if(!config.registryFilePublic || !fs.existsSync(config.registryFilePublic)) {
            return;
        }

        var data = fs.readFileSync(config.registryFilePublic);

        var result = _parsePackage(data);

        if(result) {
            logger.log("Cached public packages loaded");
        }
    }

    function _cachePublicRegistry(data) {
        if(!config.registryFilePublic) {
            return;
        }

        fs.writeFile(config.registryFilePublic, data, function(err) {
            if(err) {
                logger.error('Error caching public registry');
            }
            else {
                logger.log('Public registry cached');
            }
        });
    }

    function _loadPublicPackagesPeriodically() {
        var client = createClient();

        client.get(_publicBowerUrl, function(data) {
            processData(data);
        }).on('error', function(err) {
            console.log('something went wrong on the request', err.request.options);
        });

        client.on('error', function(err) {
            console.error('Something went wrong on the client', err);
        });

        function processData(data) {
            try {
                var result = _parsePackage(data);

                if(result) {
                    _cachePublicRegistry(data);

                    logger.log('Loaded public packages');
                }
            }
            catch (e) {
                logger.error('Could not load public packages: data=' + data);
            }
        }

        function createClient() {
            var clientOptions;

            if(config.proxySettings && config.proxySettings.enabled) {
                clientOptions = {
                    proxy: {
                        host: config.proxySettings.host,
                        port: config.proxySettings.port,
                        user: config.proxySettings.username,
                        password: config.proxySettings.password,
                        tunnel: config.proxySettings.tunnel
                    }
                };
            }

            return new Client(clientOptions);
        }

        // re-schedule the function
        _timer = setTimeout(_loadPublicPackagesPeriodically, 1000 * 60 * 30);
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
                    url: item.url
                });
            }
        }

        return packages;
    }

    function _shutDown() {
        clearTimeout(_timer);
    }

    return {
        start: _start,

        getPackage: _getPackage,
        searchPackage: _searchPackage,
        shutDown: _shutDown
    };
}();