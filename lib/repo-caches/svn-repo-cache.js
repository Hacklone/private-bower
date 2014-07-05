require('./../utils');
var q = require('q');
var path = require('path');
var logger = require('./../logger');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;

var RepoCacheBase = require('./repo-cache-base');

module.exports = function SvnRepoCache(options) {
    var base = new RepoCacheBase(options);

    _init();
    function _init() {
        return _createDirectory(options.repoCacheRoot)
            .then(_checkSvnInstalled)
            .then(function() {
                var deferred = q.defer();

                setInterval(_getLatestForRepos, options.refreshTimeout * 60 * 1000);

                deferred.resolve();
                return deferred.promise;
            })
            .then(_startSvnDaemon)
            .fail(function(err) {
                logger.log('Failed to initialize public repository cache'.red);
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
                return _cloneSvnRepo(repoUrl, packageDirectory, repoName);
            })
            .then(function() {
                var repo = 'svn://{0}:{1}/{2}'.format(options.hostName, options.port, repoName);

                deferred.resolve({
                    name: repoName,
                    repo: repo
                });
            })
            .fail(function() {
                logger.log('Failed to clone '.red + repoUrl);
                deferred.reject();
            });

        return deferred.promise;
    }

    function _checkSvnInstalled() {
        var deferred = q.defer();

        exec('svnserve --version', function(error, stdout, stderr) {
            if(stdout.indexOf('svnserve, version') === -1) {
                deferred.reject(stderr);
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

    function _startSvnDaemon() {
        var deferred = q.defer();

        process.chdir(options.repoCacheRoot);

        var svnCommand = 'svnserve -d --foreground -r "{0}" --listen-host {1} --listen-port {2}'
            .format(options.repoCacheRoot, options.hostName, options.port);

        logger.log('Starting svn cache server');

        exec(svnCommand, function(error, stdout, stderr) {
            if(error) {
                deferred.reject(stderr);
                return;
            }

            logger.log('Svn cache server started');

            deferred.resolve();
        });

        return deferred.promise;
    }

    function _cloneSvnRepo(repoUrl, packageDirectory, repoName) {
        var deferred = q.defer();

        process.chdir(packageDirectory);

        var svnCommand = 'svn co {0} ./'.format(repoUrl);

        logger.log('Cloning {0} ...'.format(repoName));

        exec(svnCommand, function(error, stdout, stderr) {
            if(error) {
                deferred.reject(stderr);
                return;
            }

            logger.log('Cloned {0} svn repository to private'.format(repoName));

            deferred.resolve();
        });

        return deferred.promise;
    }

    function _getLatestForRepos() {
        logger.log('Refreshing cached public svn repositories');

        return base.getLatestForRepos(pullLatest);

        function pullLatest(packageDirectory) {
            var deferred = q.defer();

            process.chdir(packageDirectory);

            exec('svn update', function(error, stdout, stderr) {
                if(error) {
                    deferred.reject(stderr);
                    return;
                }

                logger.log('Updated latest for {0}'.format(path.basename(packageDirectory)));

                deferred.resolve();
            });

            return deferred.promise;
        }
    }

    return {
        cacheRepo: _cacheRepo
    };
};