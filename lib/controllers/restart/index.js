var Controller = require('../../controller');

var restartController = module.exports = new Controller('/restart');

restartController.post('/', require('./post'));