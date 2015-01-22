var packageStore = require('../../../packageStore');
var repoCacheHandler = require('../../../repoCacheHandler');

module.exports = function(req, res) {
    var packageName = req.params.name;

    packageStore.removePackages([packageName]);

    if(repoCacheHandler.enabled) {
        repoCacheHandler.removePackages([packageName]);
    }

    res.send('ok');
};