var Controller = require('../../infrastructure/controller');
var authenticate = require('../../infrastructure/authentication');

var refreshController = module.exports = new Controller('/refresh');

refreshController.post('/', authenticate, require('./post'));