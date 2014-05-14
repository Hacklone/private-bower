var http = require('http');
var logger = require('./logger');
var Client = require('node-rest-client').Client;

var publicBowerUrl = 'http://bower.herokuapp.com/packages/';

module.exports = function PublicPackageStore(config) {
    var _packages = {};
    var _config = config;

    _init();
    function _init() {
        logger.log('Refreshing public packages...');

        _loadPublicPackages();
    }

    function _getPackage(packageName) {
        return _packages[packageName];
    }

    function _loadPublicPackages() {

        var options;
        if (_config.proxySettings.enabled) {
            var options_proxy={
                    proxy:{
                        host:_config.proxySettings.host,
                        port:_config.proxySettings.port,
                        user:_config.proxySettings.username,
                        password:_config.proxySettings.password,
                        tunnel:_config.proxySettings.tunnel
                    }
                },

                client = new Client(options_proxy);
        } else {
            client = new Client();
        }

        client.get(publicBowerUrl, function(data, response) {
            processData(data);
        }).on('error',function(err){
            console.log('something went wrong on the request', err.request.options);
        });

        client.on('error',function(err){
            console.error('Something went wrong on the client', err);
        });

        setTimeout(_loadPublicPackages, 1000 * 60 * 30);

        function processData(data) {
            if(data.indexOf('Not Found')!== -1) {
                return;
            }

            var jsonData = JSON.parse(data);

            for(var i = 0, len = jsonData.length; i < len; i++) {
                var item = jsonData[i];

                _packages[item.name] = item;
            }

            logger.log('Loaded public packages');
        }
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
        getPackage: _getPackage,
        searchPackage: _searchPackage
    };
};