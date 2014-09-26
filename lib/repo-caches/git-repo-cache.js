require('./../utils');
var q = require('q');
var path = require('path');
var logger = require('./../logger');
var mkdirp = require('mkdirp');
var spawn = require('./../spawn');

var RepoCacheBase = require('./repo-cache-base');

module.exports = function GitRepoCache(options) {
    var base = new RepoCacheBase(options);
    var _daemon;

    var cloningPromises = {};

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

        _daemon = spawn('git', ['daemon', '--version'], function(error, stdout, stderr) {
            // git-daemon is often installed separately from git.
            switch(error) {
                case 129: // If git && git-daemon is installed, the error code will be 129.
                    deferred.resolve();
                    break;
                case 127: // If git isn't installed, the error code will be 127.
                    logger.error('Git must be installed and added to path');
                    deferred.reject(stderr);
                    break;
                case 1: // If git is installed but git-daemon is not, the error code will be 1.
                    logger.error('Git-daemon must be installed');
                    deferred.reject(stderr);
                    break;
                default: // This shouldn't happen. The command passed and error is null, or some other error has occurred.
                    logger.error('Unknown error verifying git dependencies');
                    deferred.reject(stderr);
                    break;
            }
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

        var gitCommand = base.generateCustomParameters(
          [ 'daemon', '--reuseaddr', '--verbose',
            '--base-path=' + options.repoCacheRoot,
            '--listen=' + options.hostName,
            '--port=' + options.port,
            '--export-all' ]);

        logger.log('Starting git cache server');

        spawn('git', gitCommand, function(error, stdout, stderr) {
            if(error) {
                deferred.reject(stderr);
                return;
            }

            logger.log('Git cache server started');

            deferred.resolve();
        });

        return deferred.promise;
    }

    function _cloneGitRepo(repoUrl, packageDirectory, repoName) {

        //prevent concurrent clonings
        if(cloningPromises[packageDirectory]) {
          return cloningPromises[packageDirectory];
        }


        var deferred = q.defer();
        cloningPromises[packageDirectory] = deferred.promise;

        process.chdir(packageDirectory);

        logger.log('Cloning {0} ...'.format(repoName));

        spawn('git', ['clone', repoUrl, './'], function(error, stdout, stderr) {

            delete cloningPromises[packageDirectory];

            if(error) {
                deferred.reject(stderr);
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

            process.chdir(packageDirectory);

            spawn('git', ['pull'], function(error, stdout, stderr) {
                if(error) {
                    deferred.reject(stderr);
                    return;
                }

                logger.log('Pulled latest for {0}'.format(path.basename(packageDirectory)));

                deferred.resolve();
            });

            return deferred.promise;
        }
    }

    function _shutDown() {
        logger.log('Stopping git cache server');

        _daemon.kill();
    }

    return {
        cacheRepo: _cacheRepo,

        removeRepo: base.removeRepo,

        shutDown: _shutDown
    };
};
