var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var mockery = require('mockery');

describe('Main', function() {
    var applicationMock;
    var expressCons, expressMock;
    var configurationManagerMock, fakeConfig;
    var utilsMock;
    var bodyparserMock;
    var main;
    
    beforeEach(function() {
        applicationMock = {
            setup: sinon.stub(),
            listen: sinon.stub(),
            addMiddleware: sinon.stub(),
            serveStatic: sinon.stub(),
            loadControllers: sinon.stub(),

            shutDown: sinon.stub(),

            startPrivatePackageStore: sinon.stub(),
            startPublicPackageStore: sinon.stub(),
            startPublicRepositoryCache: sinon.stub()
        };
        
        expressMock = {
            listen: sinon.stub()
        };
        
        expressCons = sinon.stub().returns(expressMock);
        expressCons.static = sinon.stub();
        
        fakeConfig = {
            port: 11123,
            repositoryCache: {
                enabled: true
            }
        };
        
        configurationManagerMock = {
            loadConfiguration: function() {}
        };

        sinon.stub(configurationManagerMock, 'loadConfiguration', function() {
            configurationManagerMock.config = fakeConfig;
        });

        var jsonReturn = {abc:1};
        var urlencodedReturn = {abc:2};

        bodyparserMock = {
            urlencodedReturn: urlencodedReturn,
            urlencoded: sinon.stub().returns(urlencodedReturn),
            jsonReturn: jsonReturn,
            json: sinon.stub().returns(jsonReturn)
        };
        
        utilsMock = {
            dirname: 'thisIsADir',
            process: {
                on: sinon.stub(),
                exit: sinon.stub()
            }
        };
        
        mockery.registerMock('./utils', utilsMock);
        mockery.registerMock('./application', applicationMock);
        mockery.registerMock('./configurationManager', configurationManagerMock);
        mockery.registerMock('express', expressCons);
        mockery.registerMock('body-parser', bodyparserMock);

        mockery.warnOnUnregistered(false);

        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
        
        createMain();
    });
    
    afterEach(function() {
        mockery.deregisterAll();
        mockery.disable();
    });
    
    function createMain() {
        main = require('../main');
    }
    
    it('should have these properties', function() {
       expect(main.start).to.be.a('function');
    });
    
    describe('start()', function() {
        it('should create express app', function() {
            main.start();
            
            expect(expressCons).to.have.been.calledWith();
        });
        
        it('should setup the Application and pass the serverApp', function() {
            main.start();
            
            expect(applicationMock.setup).to.have.been.calledWith(expressMock, expressCons.static);
        });
        
        it('should loadControllers on Application', function() {
            main.start();
            
            expect(applicationMock.loadControllers).to.have.been.calledWith('../lib/controllers');
        });
        
        it('should load configuration', function() {
            main.start();
            
            expect(configurationManagerMock.loadConfiguration).to.have.been.calledWith();
        });
        
        it('should call load configuration with default config path', function() {
            main.start();
            
            expect(configurationManagerMock.loadConfiguration).to.have.been.calledWith('bower.conf.json');
        });
        
        it('should call load configuration with parametered config path', function() {
            var fakeConfigPath = 'fakeConfig.conf';
            mockery.registerMock('optimist', { argv: { config: fakeConfigPath } });
            
            configurationManagerMock.loadConfiguration.reset();
            mockery.resetCache();
            
            createMain();
            
            main.start();
            
            expect(configurationManagerMock.loadConfiguration).to.have.been.calledWith(fakeConfigPath);
            
            mockery.deregisterMock('optimist');
        });
        
        it('should start the private package store', function() {
            main.start();
            
            expect(applicationMock.startPrivatePackageStore).to.have.been.calledWith();
        });
        
        it('should startPublicPackageStore if the configuration is not disabled', function() {
            main.start();
            
            expect(applicationMock.startPublicPackageStore).to.have.been.calledWith();
        });
        
        it('should NOT startPublicPackageStore if the configuration is disabled', function() {
            fakeConfig = {
                disablePublic: true  
            };
            
            mockery.resetCache();
            
            createMain();
            
            main.start();
            
            expect(applicationMock.startPublicPackageStore).not.to.have.been.calledWith();
        });
        
        it('should startPublicRepositoryCache if the configuration is enabled', function() {
            main.start();
            
            expect(applicationMock.startPublicRepositoryCache).to.have.been.calledWith();
        });
        
        it('should NOT startPublicRepositoryCache if the configuration is enabled but the public is disabled', function() {
            fakeConfig = {
                disablePublic: true,
                repositoryCache: {}
            };
            
            mockery.resetCache();
            
            createMain();
            
            main.start();
            
            expect(applicationMock.startPublicRepositoryCache).not.to.have.been.calledWith();
        });

        it('should NOT startPublicRepositoryCache if the configuration is disabled', function() {
            fakeConfig = {
                disablePublic: false,
                repositoryCache: {
                    enabled: false
                }
            };

            mockery.resetCache();

            createMain();

            main.start();

            expect(applicationMock.startPublicRepositoryCache).not.to.have.been.calledWith();
        });
        
        it('should use bodyparser', function() {
            main.start();

            expect(bodyparserMock.urlencoded).to.have.been.calledWith({ extended: true });
            expect(bodyparserMock.json).to.have.been.calledWith();

            expect(applicationMock.addMiddleware).to.have.been.calledWith(bodyparserMock.jsonReturn);
            expect(applicationMock.addMiddleware).to.have.been.calledWith(bodyparserMock.urlencodedReturn);
        });
        
        it('should serve the site', function() {
            main.start();
            
            expect(applicationMock.serveStatic).to.have.been.calledWith('site');
        });
        
        it('should start listening on config port', function() {
            main.start();
            
            expect(applicationMock.listen).to.have.been.calledWith(configurationManagerMock.config.port);
        });
    });
});