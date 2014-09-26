require('./../utils');
var q = require('q');
var path = require('path');
var logger = require('./../logger');
var mkdirp = require('mkdirp');
var spawn = require('./../spawn');
var tmp = require('tmp');

var RepoCacheBase = require('./repo-cache-base');

module.exports = function SvnRepoCache(options) {
    var base = new RepoCacheBase(options);
    var _daemon;

    var cloningPromises = {};

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
            .then(_initRepository)
            .then(_startSvnDaemon)
            .fail(function(err) {
                logger.error('Failed to initialize public repository cache');
                process.nextTick(function() {
                    throw err;
                });
            });
    }

    function _initRepository() {
      var deferred = q.defer();

      process.chdir(options.repoCacheRoot);
      spawn('svnlook', ['info',  '.' ], function(error, stdout, stderr) {
        if(error) {
          //need to initialize repository
          spawn('svnadmin', ['create', '.'], function(error, stdout, stderr) {
            if(error) {
              deferred.reject(stderr);
            } else {
              deferred.resolve();
            }
          });
        } else {
          deferred.resolve();
        }
      });

      return deferred.promise;

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
        var deferred = q.defer();

        spawn('svnserve', ['--version'], function(error, stdout, stderr) {
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

        var svnCommand = base.generateCustomParameters(['-d', '--foreground',
                          '-r', options.repoCacheRoot,
                          '--listen-host', options.hostName,
                          '--listen-port', options.port]);

        logger.log('Starting svn cache server');

        _daemon = spawn('svnserve', svnCommand, function(error, stdout, stderr) {
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

        //prevent concurrent clonings
        if(cloningPromises[packageDirectory]) {
          return cloningPromises[packageDirectory];
        }


        var deferred = q.defer();
        cloningPromises[packageDirectory] = deferred.promise;

        tmp.dir(
          { keep: true,
            unsafeCleanup: true },
          function(err, path, cleanup) {
            if(err) {
              deferred.reject(err);
              return
            }

            process.chdir(path);

            logger.log('Checking out {0} ...'.format(repoName));

            spawn('svn', ['co', repoUrl, './'] , function(error, stdout, stderr) {

              if(error) {
                delete cloningPromises[packageDirectory];
                deferred.reject(stderr);
                cleanup()
                return;
              }

              logger.log('Importing {0} ...'.format(repoName));

              spawn('svn', ['import', '.', 'file://'+packageDirectory, '-m', 'IMPORT'], function(error, stdout, stderr) {
                delete cloningPromises[packageDirectory];
                cleanup()
                if(error) {
                  deferred.reject(stderr);
                  return;
                }
                logger.log('Cloned {0} svn repository to private'.format(repoName));

                deferred.resolve();
              });
            });
          });
        return deferred.promise;
    }

    function _getLatestForRepos() {
        logger.log('Refreshing cached public svn repositories');

        return base.getLatestForRepos(pullLatest);

        function pullLatest(packageDirectory) {
            var deferred = q.defer();

            process.chdir(packageDirectory);

            spawn('svn', ['update'], function(error, stdout, stderr) {
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

    function _shutDown() {
        logger.log('Stopping svn cache server');

        _daemon.kill();
    }

    return {
        cacheRepo: _cacheRepo,

        removeRepo: base.removeRepo,

        shutDown: _shutDown
    };
};
