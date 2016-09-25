
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var GitPackageDetailsProvider = require('./gitPackageDetailsProvider');
var SvnPackageDetailsProvider = require('./svnPackageDetailsProvider');

var utils = require('../infrastructure/utils');

module.exports = function PackageDetailsProvider() {
    function _getPackageDetails(packageUrl) {
        if(packageUrl.startsWith('svn+')) {
            return SvnPackageDetailsProvider.getPackageDetails(packageUrl);
        }
        return GitPackageDetailsProvider.getPackageDetails(packageUrl);
    }

    return {
        getPackageDetails: _getPackageDetails
    };
}();
