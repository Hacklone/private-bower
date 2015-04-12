var packageManager = require('../../../../../service/packageManager');

module.exports = function(req, res) {
    var searchName = req.params.name;
    
    var packages = packageManager.searchPackage(searchName);

    res.send(packages);
};