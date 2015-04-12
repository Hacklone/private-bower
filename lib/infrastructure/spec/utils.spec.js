var sinon = require("sinon");
var chai = require("chai");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var path = require('path');
var mockery = require('mockery');

describe('Utils', function() {
    var execMock;
    var loggerMock;
    var utils;
    
    beforeEach(function() {
        loggerMock = {
            log: sinon.stub()
        };
        
        execMock = sinon.stub();
        
        mockery.registerMock('./logger', loggerMock);
        mockery.registerMock('child_process', {
            exec: execMock
        });

        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });
        
        createUtils();
    });
    
    afterEach(function() {
        mockery.deregisterAll();
        mockery.disable();
    });
    
    function createUtils() {
        utils = require('../utils');
    }
    
    it('should have these properties', function() {
        expect(utils.exec).to.be.a('function');
        expect(utils.getChildDirectories).to.be.a('function');
        expect(utils.removeDirectory).to.be.a('function');
        expect(utils.extend).to.be.a('function');
        expect(utils.dirname).to.be.a('string');
    });
    
    describe('dirname', function() {
        it('should be the current __dirname of root', function() {
           expect(utils.dirname).to.equal(path.join(__dirname, '../../'));
        });
    });
    
    describe('extend()', function() {
        it('should extend a object', function() {
            var a = {
                a: { text: 'a' },
                b: { text: 'b' },
                c: { text: 'c' }
            };
            
            var b = {
                c: { text: 'otherC' },
                d: { text: 'd' }
            };
            
            var result = utils.extend(a, b);
            
            expect(result.a).to.equal(a.a);
            expect(result.b).to.equal(a.b);
            expect(result.c).to.equal(b.c);
            expect(result.d).to.equal(b.d);
        });
    });
    
    describe('exec()', function() {
        it('should call child_process.exec() with the correct parameters', function() {
            var command = 'testCommand';
            var cwd = 'testCWD';
            
            utils.exec(command, cwd);
            
            expect(execMock).to.have.been.calledWith();
            
            var args = execMock.args[0];
            
            expect(args[0]).to.equal(command);
            expect(args[1]).to.deep.equal({ cwd: cwd });
            expect(args[2]).to.be.a('function');
        });
        
        it.skip('should return a Promise that resolves if the exec succeeds', function() {
            var stdOut = 'thisIsSTDOut';
            var resolved = sinon.stub();
            var rejected = sinon.stub();
            
            utils.exec('testCommand', 'testCWD')
                .then(resolved)
                .catch(rejected);

            var callback = execMock.args[0][2];
            
            callback(undefined, stdOut);
            
            expect(resolved).to.have.been.calledWith(stdOut);
            expect(rejected).not.to.have.been.calledWith();
        });
        
        it.skip('should return a Promise that rejects if the exec fails', function() {
            var error = 'error';
            var resolved = sinon.stub();
            var rejected = sinon.stub();
            
            utils.exec('testCommand', 'testCWD')
                .then(resolved)
                .catch(rejected);

            var callback = execMock.args[0][2];

            callback(error);
            
            expect(rejected).to.have.been.calledWith(error);
            expect(resolved).not.to.have.been.calledWith();
        });
        
        it('should return log if error occurs', function() {
            var error = 'error';
            
            utils.exec('testCommand', 'testCWD')
                .catch(function() {});
                
            var callback = execMock.args[0][2];
            
            callback('someError', null);
            
            expect(loggerMock.log).to.have.been.calledWith('Error during "testCommand" in "testCWD"');
        });
    });
    
    describe('getChildDirectories()', function() {
        var directoryName = 'directory';
        var childDirectories = [ 'a', 'b', 'c', 'd' ];
        var childDirectoriesPaths = childDirectories.map(function(file) {
                return directoryName + '/' + file;
            });
        
        var filesInDirectory = [
            'a.js',
            'b.doc',
            'c.xml',
            'd.html'
        ];
        
        var allFilesInDirectory = [].concat(childDirectories, filesInDirectory);
        
        it('should return child directories', function() {
            var fsMock = {
                readdirSync: sinon.stub().returns(allFilesInDirectory),
                lstatSync: function() {}
            };

            sinon.stub(fsMock, 'lstatSync', function(filePath) {
                return {
                    isDirectory: function() {
                        return childDirectoriesPaths.indexOf(filePath) !== -1
                    }
                };
            });

            mockery.registerMock('fs', fsMock);

            mockery.resetCache();
            
            createUtils();
            
            var resultChildDirectories = utils.getChildDirectories(directoryName);
            
            expect(resultChildDirectories).to.deep.equal(childDirectories);
        });
    });
    
    //TODO: TEST - removeDirectory
});
