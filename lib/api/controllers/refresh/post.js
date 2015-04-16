var packageManager = require('../../../service/packageManager');

module.exports = function(req, res) {
    packageManager.refresh()
        .then(function() {
            res.send('Refreshed');
        })
        .catch(function() {
            res.sendStatus(500);
        });
};