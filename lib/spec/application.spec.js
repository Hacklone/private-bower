var path = require('path');
var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var mockery = require('mockery');


describe('Application', function() {
    var fs;
    var mockServerApp;
    var staticHandlerMock, staticHandlerMiddleware;
    var application;
    var testModule1, testModule2;

    beforeEach(function() {
        testModule1 = {
            bind: sinon.stub()
        };
        
        testModule2 = {
            bind: sinon.stub()
        };
        
        fs = {
            readdirSync: sinon.stub().returns([
                'mock1',
                'mock2'
            ])
        };
        
        mockery.registerMock('fs', fs);
        mockery.registerMock(path.join('testModules', 'mock1'), testModule1);
        mockery.registerMock(path.join('testModules', 'mock2'), testModule2);

        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        application = require('../application');
        mockServerApp = {
            use: sinon.stub(),
            listen: sinon.stub()
        };
        
        staticHandlerMiddleware = function() {};
        staticHandlerMock = sinon.stub().returns(staticHandlerMiddleware);
        
        application.setup(mockServerApp, staticHandlerMock);
    });
    
    afterEach(function() {
        mockery.deregisterAll();
        mockery.disable();
    });
    
    it('should have these properties', function() {
        expect(application.setup).to.be.a('function');
        expect(application.shutDown).to.be.a('function');
        expect(application.loadControllers).to.be.a('function');
        expect(application.listen).to.be.a('function');
        expect(application.addMiddleware).to.be.a('function');
        expect(application.serveStatic).to.be.a('function');
        expect(application.startPrivatePackageStore).to.be.a('function');
        expect(application.startPublicPackageStore).to.be.a('function');
        expect(application.startPublicRepositoryCache).to.be.a('function');
    });
    
    describe('loadControllers(controllersRoot)', function() {
        beforeEach(function() {
            application.loadControllers('testModules');
        });
        
        it('should bind all controllers', function() {
            expect(testModule1.bind).to.have.been.calledWith(mockServerApp);
            expect(testModule2.bind).to.have.been.calledWith(mockServerApp);
        });
    });
    
    describe('addMiddleware()', function() {
        it('should call serverApp use', function() {
            var middleware = function() {};
            
            application.addMiddleware(middleware);
            
            expect(mockServerApp.use).to.have.been.calledWith(middleware);
        });
    });
    
    describe('listen()', function() {
        it('should call serverApp listen', function() {
            var port = 1234;
        
            application.listen(port);
            
            expect(mockServerApp.listen).to.have.been.calledWith(port);
        });
    });
    
    describe('serveStatic()', function() {
        it('should call serverApp static with the given path', function() {
            var path = 'fakePath';
            
            application.serveStatic(path);
            
            expect(staticHandlerMock).to.have.been.calledWith(path);
        });
        
        it('should register the middleware', function() {
            application.serveStatic('fakePath');
            
            expect(mockServerApp.use).to.have.been.calledWith(staticHandlerMiddleware);
        });
    });
    
    describe('startPrivatePackageStore()', function() {
        //TODO
    });
    
    describe('startPublicPackageStore()', function() {
        //TODO
    });
    
    describe('startPublicRepositoryCache', function() {
        //TODO
    });
});