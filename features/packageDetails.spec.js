var expect = require("chai").expect;

var api = require('./assets/api');
var utils = require('./assets/utils');
var tools = require('./assets/tools');
var Server = require('./assets/server');

var Promise = require('bluebird');

describe.skip('PackageDetails', function() {
    var _server;

    beforeEach(function() {
        _server = new Server();

        _server.start();
    });

    afterEach(function() {
        _server.stop();
    });
    
    describe('Get package details', function() {
        it('should get the bower.json of the package', function(done) {
            var bowerJsonFromRepo;
            
            Promise.all([
                tools.registerPackage('angular', 'git://github.com/angular/bower-angular.git'),
                utils.get('http://cdn.rawgit.com/angular/bower-angular/master/bower.json')
            ])
            .then(function(data) {
                bowerJsonFromRepo = JSON.stringify(data[1].body);
            })
            .then(function() {
                return tools.getPackageDetails('angular');
            })
            .then(function(data) {
                var bowerJsonFromDetailsAPI = JSON.stringify(data.body);
                
                utils.catch(done, function() {
                    expect(bowerJsonFromDetailsAPI).to.equal(bowerJsonFromRepo);
                });
            })
            .catch(function(err) {
                utils.catch(done, function() {
                    console.log(err.error);
                    
                    expect(false).to.be.true;
                });
            });
        });
    });
});