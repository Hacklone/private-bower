var packageManager = require('../../../service/packageManager');

module.exports = function(req, res) {
    if(Array.isArray(req.body)) {
        packageManager.registerPackages(req.body);
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