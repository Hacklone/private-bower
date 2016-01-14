
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var utils = require('../infrastructure/utils');

module.exports = function SvnPackageDetailsProvider() {
    var tempFolder = path.join(utils.dirname, 'temp/packageDetails');

    function _getPackageDetails(packageUrl) {
        return new Promise(function(resolve, reject) {
            var tempName = utils.getRandomString();
            var svnCloneFolder = path.join(tempFolder, tempName);

            // remove string 'svn+' if isn't 'ssh' url.
            if (packageUrl.indexOf('ssh://') == -1) {
                packageUrl = packageUrl.replace('svn+', '');
            }

            // set to trunk to get the info.
            if (packageUrl.slice(-1) === '/') {
                packageUrl = packageUrl + 'trunk';
            } else {
                packageUrl = packageUrl + '/trunk';
            }

            utils.exec('svn co {0} {1} --depth files'.format(packageUrl, svnCloneFolder))
                .then(function() {
                    var bowerJsonLocation = path.join(svnCloneFolder, 'bower.json');

                    var fileContent = fs.readFileSync(bowerJsonLocation);
                    var bowerJson = JSON.parse(fileContent);

                    utils.removeDirectory(svnCloneFolder);

                    resolve(bowerJson);
                })
                .catch(reject);
        });
    }

    return {
        getPackageDetails: _getPackageDetails
    };
}();
