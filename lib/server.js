var PackageStore = require('./package-store');
var PublicPackageStore = require('./public-package-store');
var PublicRepoCache = require('./public-repo-cache');

var argv = require('optimist').argv;
var fs = require('fs');
var path = require('path');

var express = require('express');
var app = express();

var logger = require('./logger');

var _config, _configDirectory;
var _persistFilePath, _repoCacheEnabled;
var _packageStore, _publicPackageStore, _publicRepoCache;

module.exports.run = _init;
function _init() {
    if(argv.h || argv.help) {
        logger.logHelp();

        process.exit();
    }

    _loadConfig();

    _persistFilePath = path.join(_configDirectory, _config.registryFile || './bowerRepository.json');
    _repoCacheEnabled = _config.repositoryCache && _config.repositoryCache.enabled;

    _packageStore = new PackageStore({
        persistFilePath: _persistFilePath
    });

    if(!_config.disablePublic) {
        _publicPackageStore = new PublicPackageStore(_config);

        if(_repoCacheEnabled) {
            _publicRepoCache = new PublicRepoCache({
                repoCacheRoot: path.join(_configDirectory, _config.repositoryCache.cacheDirectory || './repoCache'),
                hostName: _config.repositoryCache.gitHost || 'git://localhost',
                port: _config.repositoryCache.gitPort || 6789
            });
        }
    }

    _initService();
}

function _loadConfig() {
    var configPath = path.join(__dirname, argv.config || '../bower.conf.json');

    if(!fs.existsSync(configPath)) {
        logger.log('config file not found at '.red + configPath);
    }

    _configDirectory = path.join(configPath, '../');

    var json = fs.readFileSync(configPath).toString();
    _config = JSON.parse(json);

    //defaults
    _config.port = _config.port || 5678;
    _config.registryFile = _config.registryFile || './bowerRepository.json';
}

function _initService() {
    app.use(express.bodyParser());
    app.use(express.static(path.join(__dirname, '../site')));

    app.post('/registerPackage', function(req, res) {
        _packageStore.registerPackages([
            {
                name: req.body.name,
                repo: req.body.repo
            }
        ]);

        res.send('ok');
    });

    app.post('/packages', function(req, res) {
        _packageStore.registerPackages([
            {
                name: req.body.name,
                repo: req.body.url
            }
        ]);

        res.send(201);
    });

    app.post('/registerPackages', function(req, res) {
        _packageStore.registerPackages(req.body.packages);

        res.send('ok');
    });

    app.post('/removePackage', function(req, res) {
        _packageStore.removePackages([ req.body.name ]);

        res.send('ok');
    });

    app.post('/removePackages', function(req, res) {
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
                    _publicRepoCache.cacheRepo(req.params.name, publicPackage.url)
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
                else {
                    res.send(publicPackage);
                }
            }
        }
        else {
            res.status(404).send('Not found');
        }
    });

    app.listen(_config.port, function() {
        logger.log('Bower server started on port ' + _config.port);
    });
}

