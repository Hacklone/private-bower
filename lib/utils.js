var exec = require('child_process').exec;
var fs = require('fs');
var logger = require('./logger');
var path = require('path');
var q = require('q');

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
        var deferred = q.defer();

        process.chdir(cwd);
        exec(command, function(error, stdout) {
            if(error) {
                logger.log('Error during "{0}" in "{1}"'.format(command,cwd));
                deferred.reject(error);
                return;
            }

            deferred.resolve(stdout);
        });

        return deferred.promise;
    }

    return {
        exec: _exec,
        getChildDirectories: _getChildDirectories,
        removeDirectory: _removeDirectory
    };
}();
