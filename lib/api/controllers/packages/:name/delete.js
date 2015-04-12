var packageManager = require('../../../../service/packageManager');

module.exports = function(req, res) {
    var packageName = req.params.name;
    
    packageManager.removePackages([packageName]);

    res.sendStatus(200);
};