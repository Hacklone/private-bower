var Promise = require('bluebird');

var GitRepoCache = require('./gitRepoCache');
var SvnRepoCache = require('./svnRepoCache');

module.exports = function RepoCacheHandler() {
    var self = {
        start: _start,

        getRepoCache: _getRepoCache,
        removePackages: _removePackages,
        getRepoAllCaches: _getRepoAllCaches,

        getLatestForRepos: _getLatestForRepos,

        shutDown: _shutDown
    };

    var _gitRepoCache;
    var _svnRepoCache;

    var _repoCaches = [];

    function _start(options) {
        self.enabled = true;

        if(options.git) {
            _gitRepoCache = new GitRepoCache(options.git);
            _repoCaches.push(_gitRepoCache);
        }

        if(options.svn) {
            _svnRepoCache = new SvnRepoCache(options.svn);
            _repoCaches.push(_svnRepoCache);
        }
    }

    function _getRepoCache(repoUrl) {
        if(repoUrl.indexOf('svn+') !== -1) {
            return _svnRepoCache;
        }

        return _gitRepoCache;
    }

    function _getRepoAllCaches() {
        return _repoCaches;
    }

    function _shutDown() {
        _repoCaches.forEach(function(repoCache) {
            repoCache.shutDown();
        });
    }

    function _removePackages(packageNames) {
        _repoCaches.forEach(function(repoCache) {
            packageNames.forEach(function(packageName) {
                repoCache.removeRepo(packageName);
            });
        });
    }

    function _getLatestForRepos() {
        return Promise.all(_repoCaches.map(function(repoCache) {
            return repoCache.getLatestForRepos();
        }));
    }

    return self;
}();