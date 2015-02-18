var utils = require('./../utils');
var q = require('q');
var path = require('path');
var exec = require('child_process').exec;

module.exports = function RepoCacheBase(options) {
    function _getLatestForRepos(pullLatest) {
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

        if(childDirectories.indexOf(repoName) === -1) {
            return;
        }

        utils.removeDirectory(path.join(options.repoCacheRoot, repoName));
    }

    function _generateCustomParameters() {
        if(!options.parameters) {
            return '';
        }

        var customParameters = '';

        for(var prop in options.parameters) {
            if(options.parameters.hasOwnProperty(prop)) {
                customParameters += ' --{0}={1}'.format(prop, options.parameters[prop]);
            }
        }

        return customParameters;
    }

    return {
        getLatestForRepos: _getLatestForRepos,
        getRepoAccessAddress: _getRepoAccessAddress,
        removeRepo: _removeRepo,

        generateCustomParameters: _generateCustomParameters
    };
};
