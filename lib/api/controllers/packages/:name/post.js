var packageManager = require('../../../../service/packageManager');

module.exports = function(req, res) {
    packageManager.registerPackages([
        {
            name: req.params.name,
            url: req.body.url
        }
    ]);

    res.sendStatus(201);
};