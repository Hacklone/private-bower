var q = require('q');
var fs = require('fs');
var path = require('path');

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
        var deferred = q.defer();

        var childDirectories = [];

        fs.readdir(directory, function(err, files) {
            files.forEach(function(file) {
                if(file.startsWith('.')) {
                    return;
                }

                var filePath = path.join(directory, file);

                fs.stat(filePath, function(err, stat) {
                    if(stat.isDirectory()) {
                        childDirectories.push(files[i]);
                    }
                });
            });

            deferred.resolve(childDirectories);
        });

        return deferred.promise;
    }

    return {
        getChildDirectories: _getChildDirectories
    };
}();