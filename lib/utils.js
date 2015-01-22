var fs = require('fs');
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
            exec(command, {cwd: cwd}, function(error, stdout) {
                if(error) {
                    logger.log('Error during "{0}" in "{1}"'.format(command, cwd));

                    reject(error);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    }

    function _extend(destination, source) {
        for(var propertyName in source) {
            if(source.hasOwnProperty(propertyName)) {
                destination[propertyName] = source[propertyName];
            }
        }

        return destination;
    }

    function _startDetachedChildProcess(command, args) {
        var child = spawn(command, args, {
            detached: true
        });

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);

        child.unref();
    }

    return {
        exec: _exec,
        extend: _extend,
        process: process,
        dirname: __dirname,
        removeDirectory: _removeDirectory,
        getChildDirectories: _getChildDirectories,
        startDetachedChildProcess: _startDetachedChildProcess
    };
}();
