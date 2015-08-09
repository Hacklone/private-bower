var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var utils = require('../../infrastructure/utils');
var Promise = require('bluebird');
var logger = require('../../infrastructure/logger');
var exec = require('child_process').exec;

var RepoCacheBase = require('./repoCacheBase');

module.exports = function GitRepoCache(options) {
    var base = new RepoCacheBase(options);
    var _daemon;

    _init();
    function _init() {
        return _createDirectory(options.repoCacheRoot)
            .then(_checkGitInstalled)
            .then(function() {
                return new Promise(function(resolve) {
                    setInterval(_getLatestForRepos, options.refreshTimeout * 60 * 1000);
                    resolve();
                });
            })
            .then(_startGitDaemon)
            .catch(function(err) {
                logger.error('Failed to initialize public repository cache');
                process.nextTick(function() {
                    throw err;
                });
            });
    }

    function _cacheRepo(repoName, repoUrl) {
        return new Promise(function(resolve, reject) {
            var repoAccessAddress = base.getRepoAccessAddress();
            var repo = '{0}://{1}/{2}'.format(options.protocol, repoAccessAddress, repoName);

            var repoObject = {
                name: repoName,
                url: repo
            };

            var repoDirectory = path.join(options.repoCacheRoot, repoName);

            if(fs.existsSync(repoDirectory)) {
                resolve(repoObject);

                return promise;
            }

            _cloneGitRepo(repoUrl, repoName)
                .then(function() {
                    resolve(repoObject);
                })
                .catch(function(err) {
                    logger.error('Failed to clone (maybe folder exists)' + repoUrl);
                    logger.error(err);

                    reject();
                });
        });
    }

    function _checkGitInstalled() {
        return utils.exec('git --version')
            .catch(function(error) {
                logger.error('Git must be installed');
                return error;
            });
    }

    function _createDirectory(dir) {
        return new Promise(function(resolve, reject) {
            mkdirp(dir, function(err) {
                if(err) {
                    reject();
                    return;
                }

                resolve();
            });
        });
    }

    function _startGitDaemon() {
        return new Promise(function(resolve, reject) {
            var customParameters = base.generateCustomParameters();

            var gitCommand = 'git daemon --reuseaddr --base-path="{0}" --listen={1} --port={2} --export-all{3}';
            if (!options.hostName) {
                gitCommand = 'git daemon --reuseaddr --base-path="{0}" --port={2} --export-all{3}';
            }
            gitCommand = gitCommand.format(options.repoCacheRoot, options.hostName, options.port, customParameters);

            logger.log('Starting git cache server');

            _daemon = exec(gitCommand, {cwd: options.repoCacheRoot}, function(error) {
                if(error) {
                    reject(error);
                    return;
                }

                logger.log('Git cache server started');

                resolve();
            });
        });
    }

    function _cloneGitRepo(repoUrl, repoName) {
        var gitCommand = 'git clone {0} {1}'.format(repoUrl, repoName);

        logger.log('Cloning {0} ...'.format(repoName));

        return utils.exec(gitCommand, options.repoCacheRoot)
            .then(function() {
                logger.log('Cloned {0} git repository to private'.format(repoName));
            });
    }

    function _getLatestForRepos() {
        logger.log('Refreshing cached public git repositories');

        return base.getLatestForRepos(pullLatest);

        function pullLatest(packageDirectory) {
            var packageDirPath = path.join(options.repoCacheRoot, packageDirectory);

            return new Promise(function(resolve, reject) {
                if(fs.existsSync(packageDirPath)) {
                    fetchRepository()
                        .then(hardResetRepository)
                        .then(pullRepository)
                        .then(function() {
                            logger.log('Pulled latest for {0}'.format(path.basename(packageDirectory)));
                            resolve();
                        })
                        .catch(function(error) {
                            if(error && error.message) {
                                logger.error(error.message)
                            }
                            reject(error);
                        });
                }
                else {
                    logger.log('Could not pull latest, because "{0}" directory cannot be found'.format(packageDirPath));

                    resolve();
                }
            });

            function fetchRepository() {
                return utils.exec('git fetch --prune --tags', packageDirPath);
            }

            function hardResetRepository() {
                return utils.exec('git reset --hard', packageDirPath);
            }

            function pullRepository() {
                return utils.exec('git pull', packageDirPath);
            }
        }
    }

    function _shutDown() {
        logger.log('Stopping git cache server');

        if(_daemon) {
            _daemon.kill();
        }
    }

    return utils.extend({}, base, {
        shutDown: _shutDown,
        cacheRepo: _cacheRepo,
        getLatestForRepos: _getLatestForRepos
    });
};
