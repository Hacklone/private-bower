var packageStore = require('../../packageStore');

module.exports = function(req, res) {
    if(req.body.packages) {
        packageStore.registerPackages(req.body.packages);
    }
    else {
        packageStore.registerPackages([
            {
                name: req.body.name,
                repo: req.body.url
            }
        ]);
    }

    res.sendStatus(201);
};