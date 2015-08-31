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
    
    function _getPackage(packageName) {
        return api.get('/packages/{0}'.format(packageName));
    }
    
    function _getPackageDetails(packageName) {
        return api.get('/packages/{0}/details'.format(packageName));
    }

    return {
        getPackage: _getPackage,
        getPackages: _getPackages,
        registerPackage: _registerPackage,
        getPackageDetails: _getPackageDetails
    };
}();