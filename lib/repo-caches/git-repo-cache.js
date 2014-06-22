require('./../utils');
var q = require('q');
var path = require('path');
var logger = require('./../logger');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;

module.exports = function GitRepoCache(options) {
    _init();
    function _init() {
        return _createDirectory(options.repoCacheRoot)
            .then(_checkGitInstalled)
            .then(_startGitDaemon)
            .fail(function(err) {
                logger.log('Failed to initialize public repository cache'.red);
                process.nextTick(function() {
                    throw new Error(err);
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
                var repo = 'git://{0}:{1}/{2}'.format(options.hostName, options.port, repoName);

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

    function _checkGitInstalled() {
        var deferred = q.defer();

        exec('git daemon --version', function(error, stdout, stderr) {
            // git-daemon is often installed separately from git.
            switch(error && error.code) {
                case 129: // If git && git-daemon is installed, the error code will be 129.
                    deferred.resolve();
                    break;
                case 127: // If git isn't installed, the error code will be 127.
                    logger.log('Git must be installed and added to path'.red);
                    deferred.reject(stderr);
                    break;
                case 1: // If git is installed but git-daemon is not, the error code will be 1.
                    logger.log('Git-daemon must be installed'.red);
                    deferred.reject(stderr);
                    break;
                default: // This shouldn't happen. The command passed and error is null, or some other error has occurred.
                    logger.log('Unknown error verifying git dependencies'.red);
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

        var gitCommand = 'git daemon --reuseaddr --verbose --base-path="{0}" --listen={1} --port={2} --export-all'
            .format(options.repoCacheRoot, options.hostName, options.port);

        logger.log('Starting git cache server');

        exec(gitCommand, function(error, stdout, stderr) {
            if(error) {
                deferred.reject(stderr);
                return;
            }

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
                deferred.reject(stderr);
                return;
            }

            logger.log('Cloned {0} git repository to private'.format(repoName));

            deferred.resolve();
        });

        return deferred.promise;
    }

    return {
        cacheRepo: _cacheRepo
    };
};