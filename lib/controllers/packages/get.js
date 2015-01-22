var packageStore = require('../../packageStore');

module.exports = function(req, res) {
    var packages = [];

    for(var packageName in packageStore.packages) {
        if(packageStore.packages.hasOwnProperty(packageName)) {
            var item = packageStore.packages[packageName];

            packages.push({
                name: item.name,
                repo: item.repo,
                hits: item.hits
            });
        }
    }

    res.send(packages);
};