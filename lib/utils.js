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

    return {
        getChildDirectories: _getChildDirectories,
        removeDirectory: _removeDirectory
    };
}();
