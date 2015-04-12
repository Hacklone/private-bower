var Controller = require('../../infrastructure/controller');

var packagesController = module.exports = new Controller('/packages');

packagesController.get('/', require('./get'));
packagesController.post('/', require('./post'));
packagesController.delete('/', require('./delete'));

packagesController.get('/:name', require('./:name/get'));
packagesController.post('/:name', require('./:name/post'));
packagesController.delete('/:name', require('./:name/delete'));

packagesController.get('/search/:name', require('./search/:name/get'));
