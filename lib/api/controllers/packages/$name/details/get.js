var packageManager = require('../../../../../service/packageManager');

module.exports = function(req, res) {
    var packageName = req.params.name;
    
    packageManager.getPackageDetails(packageName)
        .then(function(packageDetails) {
            res.send(packageDetails);
        })
        .catch(function() {
            res.status(404).send('Not found');
        });
};