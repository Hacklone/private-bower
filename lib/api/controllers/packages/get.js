var packageManager = require('../../../service/packageManager');

module.exports = function(req, res) {
    var packages = packageManager.getPrivatePackages();

    res.send(packages);
};