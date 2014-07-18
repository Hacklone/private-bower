var utils = require('./../utils');
var q = require('q');
var path = require('path');
var logger = require('./../logger');
var exec = require('child_process').exec;

module.exports = function RepoCacheBase(options) {
    function _getLatestForRepos() {
        var deferred = q.defer();

        var childDirectories = utils.getChildDirectories(options.repoCacheRoot);

        pullLatestForAllRepos(childDirectories)
            .then(deferred.resolve)
            .fail(deferred.reject);

        return deferred.promise;

        function pullLatestForAllRepos(childDirectories) {
            var deferred = q.defer();

            var pullLatestProcesses = [];

            childDirectories.forEach(function(directory) {
                pullLatestProcesses.push(pullLatest(directory));
            });

            q.all(pullLatestProcesses)
                .then(deferred.resolve)
                .fail(deferred.reject);

            return deferred.promise;

            function pullLatest(packageDirectory) {
                var deferred = q.defer();

                process.chdir(packageDirectory);

                exec('git pull', function(error, stdout, stderr) {
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
    }

    function _getRepoAccessAddress() {
        if(options.publicAccessURL){
            return options.publicAccessURL;
        }
        else {
            return options.hostName + ':' + options.port;
        }
    }

    function _removeRepo(repoName) {
        var childDirectories = utils.getChildDirectories(options.repoCacheRoot);

        if(!childDirectories.contains(repoName)) {
            return;
        }

        utils.removeDirectory(path.join(options.repoCacheRoot, repoName));
    }

    return {
        getLatestForRepos: _getLatestForRepos,
        getRepoAccessAddress: _getRepoAccessAddress,
        removeRepo: _removeRepo
    };
};