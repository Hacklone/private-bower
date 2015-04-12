var packageManager = require('../../../../service/packageManager');

module.exports = function(req, res) {
    var packageName = req.params.name;
    
    packageManager.getPackageForInstall(packageName)
        .then(function(installPackage) {
            res.send(installPackage);
        })
        .catch(function() {
            res.status(404).send('Not found');
        });
};