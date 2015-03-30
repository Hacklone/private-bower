var api = require('./api');

module.exports = function() {
    function _registerPackage(name, url) {
        return api.post('/packages', {
            name: name,
            url: url
        });
    }

    function _getPackages() {
        return api.get('/packages');
    }

    return {
        getPackages: _getPackages,
        registerPackage: _registerPackage
    };
}();