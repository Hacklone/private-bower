var GitRepoCache = require('./repoCaches/gitRepoCache');
var SvnRepoCache = require('./repoCaches/svnRepoCache');

module.exports = function RepoCacheHandler() {
    var self = {
        start: _start,

        getRepoCache: _getRepoCache,
        getRepoAllCaches: _getRepoAllCaches,
        removePackages: _removePackages,

        shutDown: _shutDown
    };

    var _gitRepoCache;
    var _svnRepoCache;

    function _start(options) {
        self.enabled = true;

        if(options.git) {
            _gitRepoCache = new GitRepoCache(options.git);
        }

        if(options.svn) {
            _svnRepoCache = new SvnRepoCache(options.svn);
        }
    }

    function _getRepoCache(repoUrl) {
        if(repoUrl.indexOf('svn+') !== -1) {
            return _svnRepoCache;
        }

        return _gitRepoCache;
    }

    function _getRepoAllCaches() {
        var repoCaches = [];

        if(_gitRepoCache) {
            repoCaches.push(_gitRepoCache);
        }

        if(_svnRepoCache) {
            repoCaches.push(_svnRepoCache);
        }

        return repoCaches;
    }

    function _shutDown() {
        _getRepoAllCaches().forEach(function(repoCache) {
            repoCache.shutDown();
        });
    }

    function _removePackages(packageNames) {
        _getRepoAllCaches().forEach(function(repoCache) {
            packageNames.forEach(function(packageName) {
                repoCache.removeRepo(packageName);
            });
        });
    }

    return self;
}();