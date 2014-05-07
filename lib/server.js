var PackageStore = require('./package-store');
var PublicPackageStore = require('./public-package-store');

var argv = require('optimist').argv;
var path = require('path');

var express = require('express');
var app = express();

var logger = require('./logger');

var _port, _persistFilePath, _packageStore, _publicPackageStore;

module.exports.run = _init;
function _init() {
    if(argv.h || argv.help) {
        logger.logHelp();

        process.exit();
    }
    else if(argv.migrate) {
        require('./migrator').migrate(argv.migrate);

        process.exit();
    }

    _port = argv.p || argv.port || 5678;
    _persistFilePath = argv.o || argv.output || path.join(__dirname, '../bowerRepository.json');

    if(path.extname(_persistFilePath) === '.xml') {
        logger.log('Warning: xml persist format is deprecated please use --migrate to migrate to a new format'.red);

        process.exit();
    }

    _packageStore = new PackageStore({
        persistFilePath: _persistFilePath
    });

    _publicPackageStore = new PublicPackageStore();

    _initService();
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

        logger.log('registered package: ' + req.body.name);
        res.send('ok');
    });

    app.post('/registerPackages', function(req, res) {
        _packageStore.registerPackages(req.body.packages);

        logger.log('registered several packages');
        res.send('ok');
    });

    app.post('/removePackage', function(req, res) {
        _packageStore.removePackages([ req.body.name ]);

        logger.log('removed package: ' + req.body.name);
        res.send('ok');
    });

    app.post('/removePackages', function(req, res) {
        _packageStore.removePackages(req.body.packages);

        logger.log('removed packages: ' + req.body.packages.join(', '));
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

    //bower service
    app.get('/packages/:name', function(req, res) {
        var privatePackage = _packageStore.getPackage(req.params.name);

        if(privatePackage) {
            res.send({
                name: req.params.name,
                url: privatePackage.repo,
                hits: privatePackage.hits
            });

            return;
        }

        var publicPackage = _publicPackageStore.getPackage(req.params.name);
        if(publicPackage) {
            res.send(publicPackage);

            return;
        }

        res.status(404).send('Not found');
    });

    app.listen(_port, function() {
        logger.log('Bower server started on port ' + _port);
    });
}

