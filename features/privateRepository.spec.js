var expect = require("chai").expect;

var api = require('./assets/api');
var utils = require('./assets/utils');
var tools = require('./assets/tools');
var Server = require('./assets/server');

describe('PrivateRepository', function() {
    var _server;

    beforeEach(function() {
        _server = new Server();

        _server.start();
    });

    afterEach(function() {
        _server.stop();
    });

    describe('install private package', function() {
        it('should return 201 if the install succeeds', function(done) {
            api.post('/packages', {
                name: 'testPackage',
                url: 'git://something.com/testRepoUrl.git'
            })
                .then(loaded, loaded);

            function loaded(response) {
                expect(response.status).to.equal(201);

                done();
            }
        });

        it('should register package', function(done) {
            api.post('/packages', {
                name: 'testPackage2',
                url: 'git://something.com/testRepoUrl2.git'
            })
                .then(tools.getPackages)
                .then(loaded, loaded);

            function loaded(response) {
                utils.catch(done, function() {
                    expect(response.body).to.deep.equal([{
                        name: 'testPackage2',
                        hits: 0,
                        url: 'git://something.com/testRepoUrl2.git'
                    }]);
                });
            }
        });

        it('should register a specific package', function(done) {
            api.post('/packages/testPackage5', {
                url: 'git://something.com/testRepoUrl5.git'
            })
                .then(tools.getPackages)
                .then(loaded, loaded);

            function loaded(response) {
                utils.catch(done, function() {
                    expect(response.body).to.deep.equal([{
                        name: 'testPackage5',
                        hits: 0,
                        url: 'git://something.com/testRepoUrl5.git'
                    }]);
                });
            }
        });

        it('should register multiple packages', function(done) {
            api.post('/packages', {
                packages: [
                    {
                        name: 'testPackage3',
                        url: 'git://something.com/testRepoUrl3.git'
                    },
                    {
                        name: 'testPackage4',
                        url: 'git://something.com/testRepoUrl4.git'
                    }
                ]

            })
                .then(tools.getPackages)
                .then(loaded, loaded);

            function loaded(response) {
                utils.catch(done, function() {
                    expect(response.body).to.deep.equal([
                        {
                            hits: 0,
                            name: 'testPackage3',
                            url: 'git://something.com/testRepoUrl3.git'
                        },
                        {
                            hits: 0,
                            name: 'testPackage4',
                            url: 'git://something.com/testRepoUrl4.git'
                        }
                    ]);
                });
            }
        });
    });

    describe('get packages', function() {
        it('should return every packages', function(done) {
            tools.registerPackage('testPackage', 'git://something.com/testRepoUrl.git')
                .then(function() {
                    return tools.registerPackage('testPackage2', 'git://something.com/testRepoUrl2.git')
                })
                .then(function() {
                    return tools.registerPackage('testPackage3', 'git://something.com/testRepoUrl3.git')
                })
                .then(function() {
                    return api.get('/packages')
                })
                .then(loaded, loaded);

            function loaded(response) {
                utils.catch(done, function() {
                    expect(response.body).to.deep.equal([
                        {
                            hits: 0,
                            name: 'testPackage',
                            url: 'git://something.com/testRepoUrl.git'
                        },
                        {
                            hits: 0,
                            name: 'testPackage2',
                            url: 'git://something.com/testRepoUrl2.git'
                        },
                        {
                            hits: 0,
                            name: 'testPackage3',
                            url: 'git://something.com/testRepoUrl3.git'
                        }
                    ]);
                });
            }
        });

        it('should return separate package', function(done) {
            tools.registerPackage('testPackage', 'git://something.com/testRepoUrl.git')
                .then(function() {
                    return api.get('/packages/testPackage');
                })
                .then(loaded, loaded);

            function loaded(response) {
                utils.catch(done, function() {
                    expect(response.body).to.deep.equal({
                        name: 'testPackage',
                        url: 'git://something.com/testRepoUrl.git',
                        hits: 1
                    });
                });
            }
        });

        it('should increase hit count on getting separate package', function(done) {
            tools.registerPackage('testPackage', 'git://something.com/testRepoUrl.git')
                .then(function() {
                    return api.get('/packages/testPackage');
                })
                .then(function() {
                    return api.get('/packages/testPackage');
                })
                .then(loaded, loaded);

            function loaded(response) {
                utils.catch(done, function() {
                    expect(response.body).to.deep.equal({
                        name: 'testPackage',
                        url: 'git://something.com/testRepoUrl.git',
                        hits: 2
                    });
                });
            }
        });
    });
});