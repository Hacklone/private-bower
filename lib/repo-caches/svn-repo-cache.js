var exec = require('child_process').exec;
var q = require('q');
var path = require('path');
var logger = require('./../logger');
var mkdirp = require('mkdirp');
var utils = require('./../utils');

var RepoCacheBase = require('./repo-cache-base');

module.exports = function SvnRepoCache(options) {
    var base = new RepoCacheBase(options);
    var _daemon;

    _init();
    function _init() {
        return _createDirectory(options.repoCacheRoot)
            .then(_checkSvnInstalled)
            .then(function() {
                setInterval(_getLatestForRepos, options.refreshTimeout * 60 * 1000);
            })
            .then(_startSvnDaemon)
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
                return _cloneSvnRepo(repoUrl, packageDirectory, repoName);
            })
            .then(function() {
                var repoAccessAddress = base.getRepoAccessAddress();
                var repo = 'svn://{0}/{1}'.format(repoAccessAddress, repoName);

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

    function _checkSvnInstalled() {
        return utils.exec('svnserve --version');
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

        var customParameters = base.generateCustomParameters();

        var svnCommand = 'svnserve -d --foreground -r "{0}" --listen-host {1} --listen-port {2}{3}'
            .format(options.repoCacheRoot, options.hostName, options.port, customParameters);

        logger.log('Starting svn cache server');

        _daemon = exec(svnCommand, { cwd: options.repoCacheRoot }, function(error, stdout, stderr) {
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
        logger.log('Cloning {0} ...'.format(repoName));

        var svnCommand = 'svn co {0} ./'.format(repoUrl);

        return utils.exec(svnCommand, packageDirectory)
          .then(function() {
              logger.log('Cloned {0} svn repository to private'.format(repoName));
          });
    }

    function _getLatestForRepos() {
        logger.log('Refreshing cached public svn repositories');

        return base.getLatestForRepos(pullLatest);

        function pullLatest(packageDirectory) {
            return utils.exec('svn update', packageDirectory)
              .then(function() {
                  logger.log('Updated latest for {0}'.format(path.basename(packageDirectory)));
              });
        }
    }

    function _shutDown() {
        logger.log('Stopping svn cache server');

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