var packageStore = require('../../packageStore');

module.exports = function(req, res) {
    packageStore.registerPackages(req.body.packages);

    res.send('ok');
};