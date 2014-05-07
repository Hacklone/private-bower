var http = require('http');
var logger = require('./logger');

var publicBowerUrl = 'http://bower.herokuapp.com/packages/';

module.exports = function PublicPackageStore() {
    var _packages = {};

    _init();
    function _init() {
        logger.log('Refreshing public packages...');

        _loadPublicPackages();
    }

    function _getPackage(packageName) {
        return _packages[packageName];
    }

    function _loadPublicPackages() {
        http.get(publicBowerUrl, function(response) {
            var body = '';

            response.on('data', function(chunk) {
                body += chunk;
            });

            response.on('end', function() {
                processData(body);
            });
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

    return {
        getPackage: _getPackage
    };
};