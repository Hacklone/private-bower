var Controller = require('../../infrastructure/controller');
var authenticate = require('../../infrastructure/authentication');

var restartController = module.exports = new Controller('/restart');

restartController.post('/', authenticate, require('./post'));