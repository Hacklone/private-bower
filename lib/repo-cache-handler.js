var GitRepoCache = require('./repo-caches/git-repo-cache');
var SvnRepoCache = require('./repo-caches/svn-repo-cache');

module.exports = function RepoCacheHandler(options) {
    var _gitRepoCache;
    var _svnRepoCache;

    _init();
    function _init() {
        if(options.git) {
            _gitRepoCache = new GitRepoCache(options.git);
        }

        if(options.svn) {
            _svnRepoCache = new SvnRepoCache(options.svn);
        }
    }

    function _getRepoCache(repoUrl) {
        if(repoUrl.indexOf('svn+') !== -1 || (repoUrl.indexOf("https://") === 0 && !/\.git$/.test(repoUrl))) {
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

    return {
        getRepoCache: _getRepoCache,
        getRepoAllCaches: _getRepoAllCaches
    };
};
