var packageManager = require('../../../service/packageManager');

module.exports = function(req, res) {
    var packages = req.body.packages;
    
    packageManager.removePackages(packages);

    res.sendStatus(200);
};