var config = require('../../infrastructure/configurationManager').config;

module.exports = function Authentication(req, res, next) {
    if(!config.authentication || !config.authentication.enabled) {
        return next();
    }

    if(req.get('Auth-Key') === config.authentication.key) {
        return next();
    }

    res.status(401);
    res.send('Unauthorized');
};