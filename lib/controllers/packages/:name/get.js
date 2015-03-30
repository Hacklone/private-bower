var packageStore = require('../../../packageStore');
var publicPackageStore = require('../../../publicPackageStore');
var repoCacheHandler = require('../../../repoCacheHandler');
var config = require('../../../configurationManager').config;

//TODO: should refactor this
module.exports = function(req, res) {
    var packageName = req.params.name;
    var privatePackage = packageStore.getPackage(packageName);

    if(privatePackage) {
        handlePrivatePackage();
    }
    else if(!config.disablePublic) {
        handlePublicPackage();
    }
    else {
        res.status(404).send('Not found');
    }

    function handlePrivatePackage() {
        if(config.repositoryCache && config.repositoryCache.cachePrivate) {
            if(privatePackage.cachedRepo) {
                res.send({
                    name: packageName,
                    url: privatePackage.cachedRepo,
                    hits: privatePackage.hits
                });
            }
            else if(repoCacheHandler) {
                cachePrivateRepoAndSend();
            }
            else {
                sendPrivatePackage();
            }
        }
        else {
            sendPrivatePackage();
        }

        function cachePrivateRepoAndSend() {
            var repoCache = repoCacheHandler.getRepoCache(privatePackage.url);

            repoCache.cacheRepo(packageName, privatePackage.url)
                .then(function(pack) {
                    privatePackage.cachedRepo = pack.url;
                    packageStore.persistPackages();

                    res.send({
                        name: packageName,
                        url: privatePackage.cachedRepo,
                        hits: privatePackage.hits
                    });
                })
                .catch(sendPrivatePackage);
        }

        function sendPrivatePackage() {
            res.send({
                name: packageName,
                url: privatePackage.url,
                hits: privatePackage.hits
            });
        }
    }

    function handlePublicPackage() {
        var publicPackage = publicPackageStore.getPackage(packageName);
        if(publicPackage) {
            if(repoCacheHandler.enabled) {
                cachePublicRepo();
            }
            else {
                res.send(publicPackage);
            }
        }
        else {
            res.status(404).send('Not found');
        }

        function cachePublicRepo() {
            var repoCache = repoCacheHandler.getRepoCache(publicPackage.url);

            repoCache.cacheRepo(packageName, publicPackage.url)
                .then(function(pack) {
                    var privatePackage = {
                        name: packageName,
                        url: pack.url,
                        hits: publicPackage.hits
                    };

                    packageStore.registerPackages([ privatePackage ]);

                    res.send({
                        name: privatePackage.name,
                        url: privatePackage.url,
                        hits: privatePackage.hits
                    });
                })
                .catch(function() {
                    res.send(publicPackage);
                });
        }
    }

};