var api = require('./api');

module.exports = function() {
    function _registerPackage(name, url, authKey) {
        return api.post('/packages', {
            name: name,
            url: url
        }, authKey ? { 'Auth-Key': authKey } : undefined);
    }

    function _getPackages() {
        return api.get('/packages');
    }

    return {
        getPackages: _getPackages,
        registerPackage: _registerPackage
    };
}();