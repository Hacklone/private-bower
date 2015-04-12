var path = require('path');
var utils = require('../../infrastructure/utils');
var Promise = require('bluebird');
var exec = require('child_process').exec;

module.exports = function RepoCacheBase(options) {
    function _getLatestForRepos(pullLatest) {
        return new Promise(function(resolve, reject) {
            var childDirectories = utils.getChildDirectories(options.repoCacheRoot);

            pullLatestForAllRepos(childDirectories)
                .then(resolve)
                .catch(reject);
        });

        function pullLatestForAllRepos(childDirectories) {
            return new Promise(function(resolve, reject) {
                var pullLatestProcesses = [];

                childDirectories.forEach(function(directory) {
                    pullLatestProcesses.push(pullLatest(directory));
                });

                Promise.all(pullLatestProcesses)
                    .then(resolve)
                    .catch(reject);
            });
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

    function _shutDown() {
        throw new Error('Must implement shutDown function on repoCache');
    }

    return {
        getLatestForRepos: _getLatestForRepos,
        getRepoAccessAddress: _getRepoAccessAddress,
        removeRepo: _removeRepo,

        generateCustomParameters: _generateCustomParameters,

        shutDown: _shutDown
    };
};