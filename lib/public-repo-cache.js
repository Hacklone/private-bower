require('./utils');
var q = require('q');
var path = require('path');
var logger = require('./logger');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;

module.exports = function PublicRepoCache(options) {
	_init();
	function _init() {
		return _createDirectory(options.repoCacheRoot)
			.then(_startGitDaemon)
			.fail(function(err) {
				logger.log('Failed to initialize public repository cache'.red);
				throw new Error(err);
			});
	}
	
	function _cacheRepo(repoName, repoUrl) {
		var deferred = q.defer();
	
		var packageDirectory = path.join(options.repoCacheRoot, repoName);
		
		_createDirectory(packageDirectory)
			.then(function() {
                logger.log('clone')
				return _cloneGitRepo(repoUrl, packageDirectory, repoName);
			})
			.then(function() {
                logger.log('git')
				deferred.resolve({
					name: repoName,
					repo: 'git://{0}:{1}/{2}'
                        .format(options.hostName, options.port, repoName)
				});
			})
			.fail(function() {
				logger.log('Failed to clone '.red + repoUrl);
				deferred.reject();
			});
		
		return deferred.promise;
	}
	
	function _createDirectory(dir) {
		var deferred = q.defer();
        logger.log('create dir')
        mkdirp(dir, function(err) {
			if(err) {
                logger.log('error creating dir.')
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
		
		var gitCommand = 'git daemon --verbose --base-path="{0}" --listen={1} --port={2} --export-all'
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

        logger.log('Cloning {0} ...'.format(repoName));
exec('git config --global http.proxy http://localhost:3128');
        exec('git config --global https.proxy http://localhost:3128');


        logger.log('repo url ' +repoUrl)


        exec('git clone {0} ./'.format(repoUrl), function(error, stdout, stderr) {
            if(error) {
                logger.log('error ' +error)
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