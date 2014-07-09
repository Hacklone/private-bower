var PackageStore = require('./package-store');
var PublicPackageStore = require('./public-package-store');
var RepoCacheHandler = require('./repo-cache-handler');

var argv = require('optimist').argv;
var fs = require('fs');
var path = require('path');
var log4js = require('log4js');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

var logger = require('./logger');

var _config, _configDirectory;
var _repoCacheEnabled;
var _packageStore, _publicPackageStore, _repoCacheHandler;

module.exports.run = _init;
function _init() {
    if(argv.h || argv.help) {
        logger.logHelp();

        process.exit();
    }

    _loadConfig();

    _packageStore = new PackageStore({
        persistFilePath: _config.registryFile
    });

    if(!_config.disablePublic) {
        _publicPackageStore = new PublicPackageStore(_config);

        if(_config.repositoryCache) {
            initPublicRepoCache();
        }
    }

    _initService();

        function initPublicRepoCache() {
        var repoCacheOptions = {};

        if(_config.repositoryCache.svn && _config.repositoryCache.svn.enabled) {
            repoCacheOptions.svn = {
                repoCacheRoot: path.resolve(_config.repositoryCache.svn.cacheDirectory || path.join(_configDirectory, './svnRepoCache')),
                hostName: _config.repositoryCache.svn.host || 'localhost',
                port: _config.repositoryCache.svn.port || 7891,
                refreshTimeout: _config.repositoryCache.svn.refreshTimeout || 10
            };
        }

        if(_config.repositoryCache.git && _config.repositoryCache.git.enabled) {
            repoCacheOptions.git = {
                repoCacheRoot: path.resolve(_config.repositoryCache.git.cacheDirectory || path.join(_configDirectory, './gitRepoCache')),
                hostName: _config.repositoryCache.git.host || 'localhost',
                publicAccessURL: _config.repositoryCache.git.publicAccessURL || null,
                port: _config.repositoryCache.git.port || 6789,
                refreshTimeout: _config.repositoryCache.git.refreshTimeout || 10
            };
        }

        if(repoCacheOptions.svn || repoCacheOptions.git) {
            _repoCacheEnabled = true;

            _repoCacheHandler = new RepoCacheHandler(repoCacheOptions);
        }
    }
}

function _loadConfig() {
    var configPath = path.resolve(argv.config || '../bower.conf.json');

    if(!fs.existsSync(configPath)) {
        logger.log('config file not found at '.red + configPath);
    }

    _configDirectory = path.join(configPath, '../');

    var json = fs.readFileSync(configPath).toString();
    _config = JSON.parse(json);

    //defaults
    _config.port = _config.port || 5678;
    _config.registryFile = path.resolve(_config.registryFile || path.join(_configDirectory, './bowerRepository.json'));

    if(_config.log4js && _config.log4js.enabled)  {
        log4js.configure(_config.log4js.configPath);
    }
}

function _initService() {
    app.use(bodyParser());
    app.use(express.static(path.join(__dirname, '../site')));

    app.post('/registerPackage', function(req, res) {
        if(!authenticate(req, res)) {
            return;
        }

        _packageStore.registerPackages([
            {
                name: req.body.name,
                repo: req.body.repo
            }
        ]);

        res.send('ok');
    });

    app.post('/packages', function(req, res) {
        if(!authenticate(req, res)) {
            return;
        }

        _packageStore.registerPackages([
            {
                name: req.body.name,
                repo: req.body.url
            }
        ]);

        res.send(201);
    });

    app.post('/registerPackages', function(req, res) {
        if(!authenticate(req, res)) {
            return;
        }

        _packageStore.registerPackages(req.body.packages);

        res.send('ok');
    });

    app.post('/removePackage', function(req, res) {
        if(!authenticate(req, res)) {
            return;
        }

        _packageStore.removePackages([ req.body.name ]);

        res.send('ok');
    });

    app.post('/removePackages', function(req, res) {
        if(!authenticate(req, res)) {
            return;
        }

        _packageStore.removePackages(req.body.packages);

        res.send('ok');
    });

    app.get('/packages', function(req, res) {
        var packages = [];

        for(var packageName in _packageStore.packages) {
            if(_packageStore.packages.hasOwnProperty(packageName)) {
                var item = _packageStore.packages[packageName];

                packages.push({
                    name: packageName,
                    repo: item.repo,
                    hits: item.hits
                });
            }
        }

        res.send(packages);
    });

    app.get('/packages/search/:name', function(req, res) {
        var searchName = req.params.name;
        var packages = _packageStore.searchPackage(searchName);

        if(!_config.disablePublic) {
            Array.prototype.push.apply(packages, _publicPackageStore.searchPackage(searchName));
        }

        res.send(packages);
    });

    //bower service
    app.get('/packages/:name', function(req, res) {
        var name = req.params.name;
        var privatePackage = _packageStore.getPackage(name);

        if(privatePackage) {
            res.send({
                name: req.params.name,
                url: privatePackage.repo,
                hits: privatePackage.hits
            });

            return;
        }

        if(!_config.disablePublic) {
            var publicPackage = _publicPackageStore.getPackage(name);
            if(publicPackage) {
                if(_repoCacheEnabled) {
                    cacheRepo();
                }
                else {
                    res.send(publicPackage);
                }
            }
        }
        else {
            res.status(404).send('Not found');
        }

        function cacheRepo() {
            var repoCache = _repoCacheHandler.getRepoCache(publicPackage.url);

            repoCache.cacheRepo(req.params.name, publicPackage.url)
                .then(function(pack) {
                    var privatePackage = {
                        name: name,
                        repo: pack.repo,
                        hits: publicPackage.hits
                    };

                    _packageStore.registerPackages([ privatePackage ]);

                    res.send(privatePackage);
                })
                .fail(function() {
                    res.send(publicPackage);
                });
        }
    });

        app.listen(_config.port, function() {
        logger.log('Bower server started on port ' + _config.port);
    });

    process.on('SIGINT', function() {
        logger.log('Shutting down private-bower');

        process.exit();
    });

    function authenticate(req, res) {
        if(!_config.authentication || !_config.authentication.enabled) {
            return true;
        }

        if(req.get('Auth-Key') === _config.authentication.key) {
            return true;
        }

        res.status(401);
        res.send('Unauthorized');

        return false;
    }
}