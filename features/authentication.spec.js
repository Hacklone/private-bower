var expect = require("chai").expect;

var api = require('./assets/api');
var utils = require('./assets/utils');
var tools = require('./assets/tools');
var Server = require('./assets/server');

describe('Authentication', function() {
    var _testAuthKey = 'testKey';
    var _server;

    beforeEach(function() {
        _server = new Server();

        _server.start(function(config) {
            config.authentication = {
                enabled: true,
                key: _testAuthKey
            };

            return config;
        });
    });

    afterEach(function() {
        _server.stop();
    });
    
    describe('install package', function() {
        it('should fail without auth key', function(done) {
            api.post('/packages/testPackage', {
                url: 'git://something.com/testRepoUrl.git'
            })
                .then(loaded, loaded);

            function loaded(response) {
                expect(response.status).to.equal(401);
                expect(response.text).to.equal('Unauthorized');

                done();
            }
        });

        it('should succeed with auth key', function(done) {
            api.post('/packages/testPackage', {
                url: 'git://something.com/testRepoUrl.git'
            }, { 'Auth-Key': _testAuthKey })
                .then(loaded, loaded);

            function loaded(response) {
                expect(response.status).to.equal(201);

                done();
            }
        });
    });

    describe('install packages', function() {
        it('should be authenticated', function(done) {
            api.post('/packages', [
                {
                    name: 'testPackage',
                    url: 'git://something.com/testRepoUrl.git'
                },
                {
                    name: 'testPackage2',
                    url: 'git://something.com/testRepoUrl2.git'
                }
            ])
                .then(loaded, loaded);

            function loaded(response) {
                expect(response.status).to.equal(401);
                expect(response.text).to.equal('Unauthorized');

                done();
            }
        });

        it('should succeed with auth key', function(done) {
            api.post('/packages', [
                {
                    name: 'testPackage',
                    url: 'git://something.com/testRepoUrl.git'
                },
                {
                    name: 'testPackage2',
                    url: 'git://something.com/testRepoUrl2.git'
                }
            ], { 'Auth-Key': _testAuthKey })
                .then(loaded, loaded);

            function loaded(response) {
                expect(response.status).to.equal(201);

                done();
            }
        });
    });

    describe('remove package', function() {
        it('should fail without auth key', function(done) {
            tools.registerPackage('testPackage', 'testUrl')
                .then(function() {
                    return api.delete('/packages/testPackage')
                })
                .then(loaded, loaded);

            function loaded(response) {
                expect(response.status).to.equal(401);
                expect(response.text).to.equal('Unauthorized');

                done();
            }
        });

        it('should succeed with auth key', function(done) {
            tools.registerPackage('testPackage', 'testUrl', _testAuthKey)
                .then(function() {
                    return api.delete('/packages/testPackage', {}, { 'Auth-Key': _testAuthKey })
                })
                .then(loaded, loaded);

            function loaded(response) {
                expect(response.status).to.equal(200);

                done();
            }
        });
    });

    describe('remove packages', function() {
        it('should fail without auth key', function(done) {
            tools.registerPackage('testPackage', 'testUrl')
                .then(function() {
                    return tools.registerPackage('testPackage1', 'testUrl')
                })
                .then(function() {
                    return api.delete('/packages', ['testPackage', 'testPackage1']);
                })
                .then(loaded, loaded);

            function loaded(response) {
                expect(response.status).to.equal(401);
                expect(response.text).to.equal('Unauthorized');

                done();
            }
        });

        it('should succeed with auth key', function(done) {
            tools.registerPackage('testPackage', 'testUrl', _testAuthKey)
                .then(function() {
                    return tools.registerPackage('testPackage1', 'testUrl', _testAuthKey)
                })
                .then(function() {
                    return api.delete('/packages', ['testPackage', 'testPackage1'], { 'Auth-Key': _testAuthKey });
                })
                .then(loaded, loaded);

            function loaded(response) {
                expect(response.status).to.equal(200);

                done();
            }
        });
    });
});