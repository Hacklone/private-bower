var packageStore = require('../../../../packageStore');
var config = require('../../../../configurationManager').config;
var publicPackageStore = require('../../../../publicPackageStore');

module.exports = function(req, res) {
    var searchName = req.params.name;
    var packages = packageStore.searchPackage(searchName);

    if(!config.disablePublic) {
        var publicPackages = publicPackageStore.searchPackage(searchName);

        packages = packages.concat(publicPackages);
    }

    res.send(packages);
};