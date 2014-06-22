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
        if(repoUrl.indexOf('svn+') !== -1) {
            return _svnRepoCache;
        }

        return _gitRepoCache;
    }

    return {
        getRepoCache: _getRepoCache
    };
};