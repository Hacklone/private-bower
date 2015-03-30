var packageStore = require('../../../packageStore');

module.exports = function(req, res) {
    packageStore.registerPackages([
        {
            name: req.body.name,
            url: req.body.url
        }
    ]);

    res.sendStatus(201);
};