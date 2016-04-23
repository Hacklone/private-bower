
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var utils = require('../infrastructure/utils');

module.exports = function PackageDetailsProvider() {
    var tempFolder = path.join(utils.dirname, 'temp/packageDetails');

    function _getPackageDetails(packageUrl) {
        if (packageUrl.startsWith('svn')) {
            return _getPackageDetailsSvn(packageUrl);
        }
        return _getPackageDetailsGit(packageUrl);
    }

    function _getPackageDetailsGit(packageUrl) {
        return new Promise(function(resolve, reject) {
            var tempName = utils.getRandomString();
            var gitCloneFolder = path.join(tempFolder, tempName);

            utils.exec('git clone {0} \"{1}\" --depth=1'.format(packageUrl, gitCloneFolder))
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

    function _getPackageDetailsSvn(packageUrl) {
        return new Promise(function(resolve, reject) {
            var tempName = utils.getRandomString();
            var svnExportBowerFile = path.join(tempFolder, tempName);

            packageUrl = packageUrl.replace(/svn\+/, '');
            utils.exec('svn export {0}/trunk/bower.json {1}'.format(packageUrl, svnExportBowerFile))
            .then(function() {
                var fileContent = fs.readFileSync(svnExportBowerFile);
                var bowerJson = JSON.parse(fileContent);

                fs.unlinkSync(svnExportBowerFile);

                resolve(bowerJson);
            })
            .catch(reject);
        });
    }

    return {
        getPackageDetails: _getPackageDetails
    };
}();
