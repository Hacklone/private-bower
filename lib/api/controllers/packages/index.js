var Controller = require('../../infrastructure/controller');
var authenticate = require('../../infrastructure/authentication');

var packagesController = module.exports = new Controller('/packages');

packagesController.get('/', require('./get'));
packagesController.post('/', authenticate, require('./post'));
packagesController.delete('/', authenticate, require('./delete'));

packagesController.get('/:name', require('./:name/get'));
packagesController.post('/:name', authenticate, require('./:name/post'));
packagesController.delete('/:name', authenticate, require('./:name/delete'));

packagesController.get('/search/:name', require('./search/:name/get'));
