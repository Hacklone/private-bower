require('./../utils');
var q = require('q');
var path = require('path');
var logger = require('./../logger');
var mkdirp = require('mkdirp');
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

        var packageDirectory = path.join(options.repoCacheRoot, repoName);

        _createDirectory(packageDirectory)
            .then(function() {
                return _cloneGitRepo(repoUrl, packageDirectory, repoName);
            })
            .then(function() {
                var repoAccessAddress = base.getRepoAccessAddress();
                var repo = 'git://{0}/{1}'.format(repoAccessAddress, repoName);

                deferred.resolve({
                    name: repoName,
                    repo: repo
                });
            })
            .fail(function(err) {
                logger.error('Failed to clone (maybe folder exists)' + repoUrl);
                logger.error(err);

                deferred.reject();
            });

        return deferred.promise;
    }

    function _checkGitInstalled() {
        var deferred = q.defer();

        exec('git --version', function(error, stdout, stderr) {
            if(error) {
                logger.error('Git must be installed');

                deferred.reject(error);
                return;
            }

            deferred.resolve();
        });

        return deferred.promise;
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

        process.chdir(options.repoCacheRoot);

        var customParameters = base.generateCustomParameters();

        var gitCommand = 'git daemon --reuseaddr --verbose --base-path="{0}" --listen={1} --port={2} --export-all{3}'
            .format(options.repoCacheRoot, options.hostName, options.port, customParameters);

        logger.log('Starting git cache server');

        _daemon = exec(gitCommand, function(error, stdout, stderr) {
            if(error) {
                deferred.reject(error);
                return;
            }

            logger.log('Git cache server started');

            deferred.resolve();
        });

        return deferred.promise;
    }

    function _cloneGitRepo(repoUrl, packageDirectory, repoName) {
        var deferred = q.defer();

        process.chdir(packageDirectory);

        var gitCommand = 'git clone {0} ./'.format(repoUrl);

        logger.log('Cloning {0} ...'.format(repoName));

        exec(gitCommand, function(error, stdout, stderr) {
            if(error) {
                logger.log('Error during cloning in ' + packageDirectory);
                logger.error(error.message);

                deferred.reject(error);
                return;
            }

            logger.log('Cloned {0} git repository to private'.format(repoName));

            deferred.resolve();
        });

        return deferred.promise;
    }

    function _getLatestForRepos() {
        logger.log('Refreshing cached public git repositories');

        return base.getLatestForRepos(pullLatest);

        function pullLatest(packageDirectory) {
            var deferred = q.defer();

            var packageDirPath = path.join(options.repoCacheRoot, packageDirectory);

            if(fs.existsSync(packageDirPath)) {
                process.chdir(packageDirPath);

                exec('git pull', function(error, stdout, stderr) {
                    if(error) {
                        logger.log('Error during "git pull" in ' + packageDirectory);
                        logger.error(error.message);

                        deferred.reject(stderr);
                        return;
                    }

                    logger.log('Pulled latest for {0}'.format(path.basename(packageDirectory)));

                    deferred.resolve();
                });
            }
            else {
                logger.log('Could not pull latest, because "{0}" directory cannot be found'.format(packageDirPath));

                deferred.resolve();
            }

            return deferred.promise;
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