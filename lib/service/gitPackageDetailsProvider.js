
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var utils = require('../infrastructure/utils');

module.exports = function GitPackageDetailsProvider() {
    var tempFolder = path.join(utils.dirname, 'temp/packageDetails');

    function _getPackageDetails(packageUrl) {
        return new Promise(function(resolve, reject) {
            var tempName = utils.getRandomString();
            var gitCloneFolder = path.join(tempFolder, tempName);

            utils.exec('git clone {0} {1} --depth=1'.format(packageUrl, gitCloneFolder))
                .then(function() {
                    var bowerJsonLocation = path.join(gitCloneFolder, 'bower.json');

                    var fileContent = fs.readFileSync(bowerJsonLocation);
                    var bowerJson = JSON.parse(fileContent);

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
