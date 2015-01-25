var utils = require('./../utils');
var q = require('q');
var path = require('path');
var logger = require('./../logger');
var mkdirp = require('mkdirp');
var fs = require('fs');
var exec = require('child_process').exec;

var RepoCacheBase = require('./repo-cache-base');

module.exports = function GitRepoCache(options) {
    var base = new RepoCacheBase(options);
    var _daemon;

    _init();
    function _init() {
        return _createDirectory(options.repoCacheRoot)
            .then(_checkGitInstalled)
            .then(function() {
                var deferred = q.defer();

                setInterval(_getLatestForRepos, options.refreshTimeout * 60 * 1000);

                deferred.resolve();
                return deferred.promise;
            })
            .then(_startGitDaemon)
            .fail(function(err) {
                logger.error('Failed to initialize public repository cache');
                process.nextTick(function() {
                    throw err;
                });
            });
    }

    function _cacheRepo(repoName, repoUrl) {
        var deferred = q.defer();

        var repoAccessAddress = base.getRepoAccessAddress();
        var repo = 'git://{0}/{1}'.format(repoAccessAddress, repoName);

        var repoObject = {
            name: repoName,
            repo: repo
        };

        var repoDirectory = path.join(options.repoCacheRoot, repoName);

        if(fs.existsSync(repoDirectory)) {
            deferred.resolve(repoObject);

            return deferred.promise;
        }

        _cloneGitRepo(repoUrl, repoName)
            .then(function() {
                deferred.resolve(repoObject);
            })
            .fail(function(err) {
                logger.error('Failed to clone (maybe folder exists)' + repoUrl);
                logger.error(err);

                deferred.reject();
            });

        return deferred.promise;
    }

    function _checkGitInstalled() {
        return utils.exec('git --version')
          .fail(function(error) {
              logger.error('Git must be installed');
              return error;
          });
    }

    function _createDirectory(dir) {
        var deferred = q.defer();

        mkdirp(dir, function(err) {
            if(err) {
                deferred.reject();
                return;
            }

            deferred.resolve();
        });

        return deferred.promise;
    }

    function _startGitDaemon() {
        var deferred = q.defer();

        var customParameters = base.generateCustomParameters();

        var gitCommand = 'git daemon --reuseaddr --verbose --base-path="{0}" --listen={1} --port={2} --export-all{3}'
            .format(options.repoCacheRoot, options.hostName, options.port, customParameters);

        logger.log('Starting git cache server');

        _daemon = exec(gitCommand, { cwd: options.repoCacheRoot }, function(error, stdout, stderr) {
            if(error) {
                deferred.reject(error);
                return;
            }

            logger.log('Git cache server started');

            deferred.resolve();
        });

        return deferred.promise;
    }

    function _cloneGitRepo(repoUrl, repoName) {
        var gitCommand = 'git clone {0} {1}'.format(repoUrl, repoName);

        logger.log('Cloning {0} ...'.format(repoName));

        return utils.exec(gitCommand, options.repoCacheRoot)
          .then(function() {
              logger.log('Cloned {0} git repository to private'.format(repoName));
          })
          .fail(function(error) {
              logger.log('Error during cloning in ' + repoName);
              logger.error(error.message);
          });
    }

    function _getLatestForRepos() {
        logger.log('Refreshing cached public git repositories');

        return base.getLatestForRepos(pullLatest);

        function pullLatest(packageDirectory) {
            var deferred = q.defer();

            var packageDirPath = path.join(options.repoCacheRoot, packageDirectory);

            if(fs.existsSync(packageDirPath)) {
                fetchRepository()
                    .then(hardResetRepository)
                    .then(pullRepository)
                    .then(function() {
                        logger.log('Pulled latest for {0}'.format(path.basename(packageDirectory)));
                        deferred.resolve();
                    })
                    .catch(function(error) {
                        if(error && error.message) {
                            logger.error(error.message)
                        }
                        deferred.reject(error);
                    });
            }
            else {
                logger.log('Could not pull latest, because "{0}" directory cannot be found'.format(packageDirPath));

                deferred.resolve();
            }

            return deferred.promise;

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

    return {
        cacheRepo: _cacheRepo,

        removeRepo: base.removeRepo,

        shutDown: _shutDown
    };
};
