var path = require('path');
var Express = require('express');
var logger = require('./logger');
var argv = require('optimist').argv;
var bodyParser = require('body-parser');

var utils = require('./utils');
var application = require('./application');
var configurationManager = require('./configurationManager');

module.exports = function Main() {
    var _config;
    
    function _start(configPath) {
        _handleErrors();
        _handleShutDown();

        var serverApp = Express();
        
        var defaultConfigPath = path.join(utils.dirname, '../bower.conf.json');
        configurationManager.loadConfiguration(configPath || argv.config || defaultConfigPath);
        
        _config = configurationManager.config;
        
        application.setup(serverApp, Express.static);
        
        _initializePackageStores();
        _initializeService();

        logger.log('private-bower server started');
    }

    function _initializePackageStores() {
        application.startPrivatePackageStore(_config.registryFile);

        if(!_config.disablePublic) {
            initializePublic();
        }

        function initializePublic() {
            application.startPublicPackageStore();

            if(_config.repositoryCache.enabled) {
                application.startPublicRepositoryCache(_config.repoCacheOptions);
            }
        }
    }

    function _initializeService() {
        application.addMiddleware(bodyParser.urlencoded({
            extended: true
        }));
        application.addMiddleware(bodyParser.json());

        application.serveStatic(path.join(utils.dirname, '../site'));

        application.loadControllers(path.join(utils.dirname, '../lib/controllers'));
        application.listen(_config.port);
    }

    function _handleErrors() {
        utils.process.on('uncaughtException', function(err) {
            logger.log('Exception message:' + (err.stack || err.message));

            _shutDown();
        });
    }

    function _handleShutDown() {
        utils.process.on('SIGINT', _shutDown);
    }

    function _shutDown(skipProcessExit) {
        application.shutDown();

        if(!skipProcessExit) {
            utils.process.exit();
        }
    }
    
    return {
        start: _start,
        shutDown: _shutDown
    };
};