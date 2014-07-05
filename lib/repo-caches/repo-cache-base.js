var utils = require('./../utils');
var q = require('q');
var path = require('path');
var logger = require('./../logger');
var exec = require('child_process').exec;

module.exports = function RepoCacheBase(options) {
    function _getLatestForRepos() {
        var deferred = q.defer();

        utils.getChildDirectories(options.repoCacheRoot)
            .then(pullLatestForAllRepos)
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

    return {
        getLatestForRepos: _getLatestForRepos
    };
};