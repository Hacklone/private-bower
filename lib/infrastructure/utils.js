var fs = require('fs');
var os = require('os');
var path = require('path');
var logger = require('./logger');
var Promise = require('bluebird');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

module.exports = function Utils() {
    _init();
    function _init() {
        initExtensions();

        function initExtensions() {
            String.prototype.format = String.prototype.format || function format() {
                var args = arguments;

                return this.replace(/\{(\d+)\}/g, function($0, $1) {
                    return args[+$1];
                });
            };

            String.prototype.startsWith = String.prototype.startsWith || function startsWith(searchString, position) {
                position = position || 0;

                return this.indexOf(searchString, position) === position;
            };
        }
    }

    function _getChildDirectories(directory) {
        return fs.readdirSync(directory).filter(function(file) {
            var filePath = path.join(directory, file);

            return fs.lstatSync(filePath).isDirectory();
        });
    }

    function _removeDirectory(dirPath) {
        if(!fs.existsSync(dirPath)) {
            return;
        }

        fs.readdirSync(dirPath).forEach(function(file) {
            var currentFilePathPath = path.join(dirPath, file);

            if(fs.lstatSync(currentFilePathPath).isDirectory()) {
                _removeDirectory(currentFilePathPath);
            }
            else {
                fs.unlinkSync(currentFilePathPath);
            }
        });

        fs.rmdirSync(dirPath);
    }

    function _exec(command, cwd) {
        return new Promise(function(resolve, reject) {
            exec(command, {cwd: cwd}, function(error, stdout, stderr) {
                if(error) {
                    logger.log('Error during "{0}" in "{1}".\n\tOutput:\n\t\tstdout: {2}\n\t\tstderr: {3}'.format(command, cwd, stdout, stderr));

                    reject(error);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    }

    function _extend(destination) {
        var args = Array.prototype.slice.call(arguments, 1);

        args.forEach(function(srcArg) {
            extendObject(destination, srcArg);
        });

        return destination;

        function extendObject(dest, src) {
            for(var propertyName in src) {
                if(src.hasOwnProperty(propertyName)) {
                    dest[propertyName] = src[propertyName];
                }
            }

            return dest;
        }
    }

    function _startDetachedChildProcess(command, args) {
        var child = spawn(command, args, {
            detached: true
        });

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);

        child.unref();
    }
    
    function _getRandomString() {
        return Math.random().toString(36).substring(2);
    }

    function _mktmpdir(prefix) {
        prefix = (prefix || '') + '-' + process.pid + '-';

        var maxTries = 5;
        for(var i = 0; i < maxTries; ++i) {
            try {
                var p = path.join(os.tmpdir(), prefix + _getRandomString());
                fs.mkdirSync(p, 0700);
                return p;
            } catch(e) {
                if(e.code != 'EEXIST') {
                    throw e;
                }
            }
        }
        throw new Error('Could not create a temporary directory after ' + maxTries + ' tentatives');
    }

    return {
        exec: _exec,
        extend: _extend,
        process: process,
        getRandomString: _getRandomString,
        dirname: path.join(__dirname, '../'),
        mktmpdir: _mktmpdir,
        removeDirectory: _removeDirectory,
        getChildDirectories: _getChildDirectories,
        startDetachedChildProcess: _startDetachedChildProcess
    };
}();
