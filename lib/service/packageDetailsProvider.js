
var fs = require('fs');
var path = require('path');
var url = require('url');
var Promise = require('bluebird');

var utils = require('../infrastructure/utils');

module.exports = function PackageDetailsProvider() {
    var tempFolder = path.join(utils.dirname, 'temp/packageDetails');
    
    function _getPackageDetails(packageUrl) {
        return new Promise(function(resolve, reject) {
            var tempName = utils.getRandomString();
            var targetFolder = path.join(tempFolder, tempName);

            var successHandler = function() {
                var bowerJsonLocation = path.join(targetFolder, 'bower.json');

                var fileContent = fs.readFileSync(bowerJsonLocation);
                var bowerJson = JSON.parse(fileContent);

                utils.removeDirectory(targetFolder);

                resolve(bowerJson);
            };

            var parsedUrl = url.parse(packageUrl);
            var cloneUrl = packageUrl;
            var tool;

            var protocolSep = parsedUrl.protocol.indexOf('+');

            if (protocolSep > -1) {
                tool = cloneUrl.substring(0, protocolSep);
                cloneUrl = cloneUrl.substring(protocolSep + 1);
            }

            var execCommand;
            if (tool == 'svn') {
                execCommand = 'svn co {0}/trunk {1} --depth=immediates'.format(cloneUrl, targetFolder);
            } else {
                execCommand = 'git clone {0} {1} --depth=1'.format(cloneUrl, targetFolder);
            }

            utils.exec(execCommand)
                .then(successHandler)
                .catch(reject);
        });
    }
    
    return {
        getPackageDetails: _getPackageDetails
    };
}();
