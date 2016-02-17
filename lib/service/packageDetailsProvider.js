
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var utils = require('../infrastructure/utils');

module.exports = function PackageDetailsProvider() {
    var tempFolder = path.join(utils.dirname, 'temp/packageDetails');
    
    function _getPackageDetails(packageUrl) {
        return new Promise(function(resolve, reject) {
            var tempName = utils.getRandomString();
            var gitCloneFolder = path.join(tempFolder, tempName);
            
            utils.exec('git clone {0} {1} --depth=1'.format(packageUrl, gitCloneFolder))
                .then(function() {
                    var bowerJsonLocation = path.join(gitCloneFolder, 'bower.json');
                    var bowerJsonIsExist = true;
                    var fileContent;
                    var bowerJson;

                    try {
                        fs.accessSync(bowerJsonLocation);
                    }
                    catch (e) {
                        bowerJsonIsExist = false;
                    }

                    if (bowerJsonIsExist) {
                        fileContent = fs.readFileSync(bowerJsonLocation);
                        bowerJson = JSON.parse(fileContent);
                    }
                    else {
                        bowerJson = 'Not found bower.json in this package';

                    }

                    utils.removeDirectory(gitCloneFolder);

                    resolve(bowerJson);
                })
                .catch(reject);
        });
    }
    
    return {
        getPackageDetails: _getPackageDetails
    };
}();