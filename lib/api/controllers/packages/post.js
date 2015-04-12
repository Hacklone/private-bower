var packageManager = require('../../../service/packageManager');

module.exports = function(req, res) {
    if(req.body.packages) {
        packageManager.registerPackages(req.body.packages);
    }
    else {
        packageManager.registerPackages([
            {
                name: req.body.name,
                url: req.body.url
            }
        ]);
    }

    res.sendStatus(201);
};