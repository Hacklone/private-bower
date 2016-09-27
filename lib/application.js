var fs = require('fs');
var path = require('path');
var utils = require('./infrastructure/utils');
var logger = require('./infrastructure/logger');
var privatePackageStore = require('./service/packageStores/privatePackageStore');
var repoCacheHandler = require('./service/repoCaches/repoCacheHandler');
var publicPackageStore = require('./service/packageStores/publicPackageStore');
var configurationManager = require('./infrastructure/configurationManager');

module.exports = function Application() {
    var _serverApp;
    var _staticHandler;
    var _repoCacheHandler;
    var _listeningServer;
    var _siteBaseUrl;

    function _setup(serverApp, staticHandler, siteBaseUrl) {
        _serverApp = serverApp;
        _staticHandler = staticHandler;
        _siteBaseUrl = siteBaseUrl;
    }

    function _startPrivatePackageStore(registryFile) {
        privatePackageStore.start({
            persistFilePath: registryFile
        });
    }
    
    function _startPublicPackageStore() {
        return publicPackageStore.start();
    }
    
    function _startPublicRepositoryCache(repoCacheOptions) {
        repoCacheHandler.start(repoCacheOptions);
    }
    
    function _listen(port, hostName) {
        _listeningServer = _serverApp.listen(port, hostName);
    }
    
    function _serveStatic(staticPath) {
        _addMiddleware(_staticHandler(staticPath));
    }

    function _addMiddleware(middleware) {
        if (_siteBaseUrl) {
            _serverApp.use(_siteBaseUrl, middleware);
        }
        else {
            _serverApp.use(middleware);
        }
    }

    function _addMiddlewareWithMount(route,middleware) {
        _serverApp.use(route, middleware);
    }

    function _loadControllers(controllersRoot) {
        fs.readdirSync(controllersRoot).forEach(loadControllerAtByName);
        
        function loadControllerAtByName(controllerPath) {
            var controller = require(path.join(controllersRoot, controllerPath));
            controller.bind(_serverApp, _siteBaseUrl);
        }
    }

    function _shutDown() {
        logger.log('Shutting down private-bower');
        if(_listeningServer){
            _listeningServer.close();
        }
        
        publicPackageStore.shutDown();

        if(_repoCacheHandler) {
            _repoCacheHandler.shutDown();
        }
    }

    function _restart() {
        logger.log('Shutting down server for restart');

        _shutDown();

        logger.log('Restarting private-bower with config set to ' + configurationManager.configPath);

        utils.startDetachedChildProcess('private-bower', ['--config',  configurationManager.configPath]);
    }
    
    return {
        setup: _setup,
        restart: _restart,

        listen: _listen,
        addMiddleware: _addMiddleware,
        addMiddlewareWithMount: _addMiddlewareWithMount,
        loadControllers: _loadControllers,
        serveStatic: _serveStatic,

        shutDown: _shutDown,
        
        startPrivatePackageStore: _startPrivatePackageStore,
        startPublicPackageStore: _startPublicPackageStore,
        startPublicRepositoryCache: _startPublicRepositoryCache
    };
}();