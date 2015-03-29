var packageStore = require('../../packageStore');
var repoCacheHandler = require('../../repoCacheHandler');

module.exports = function(req, res) {
    var packages = req.body.packages;

    packageStore.removePackages(packages);

    if(repoCacheHandler.enabled) {
        repoCacheHandler.removePackages(packages);
    }

    res.sendStatus(200);
};