var application = require('./../../application');

module.exports = function(req, res) {
    res.send('Restarting...');

    application.restart();
};