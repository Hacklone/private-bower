var fs = require('fs');
var js2xmlparser = require("js2xmlparser");
var xml2js = require('xml2js');


module.exports = function PackageStore(options) {
    var _packages = {};

    _init();
    function _init() {
        _loadPackages();
    }

    function _registerPackages(register) {
        for(var i = 0, len = register.length; i < len; i ++) {
            var registerPackage = register[i];
            _packages[registerPackage.name] = registerPackage.repo;
        }

        _persistPackages();
    }

    function _removePackages(remove) {
        for(var i = 0, len = remove.length; i < len; i ++) {
            delete _packages[remove[i]];
        }

        _persistPackages();
    }

    function _persistPackages() {
        if(fs.existsSync(options.persistFilePath)) {
            fs.unlinkSync(options.persistFilePath);
        }

        var xml = js2xmlparser('packages', _packages);

        fs.writeFile(options.persistFilePath, xml);
    }

    function _loadPackages() {
        if(!fs.existsSync(options.persistFilePath)) {
            return;
        }

        var parser = new xml2js.Parser();
        var xml = fs.readFileSync(options.persistFilePath).toString();

        parser.parseString(xml, function (err, result) {
            for(var packageName in result.packages) {
                if(result.packages.hasOwnProperty(packageName)) {
                    _packages[packageName] = result.packages[packageName][0];
                }
            }
        });
    }

    return {
        packages: _packages,

        registerPackages: _registerPackages,
        removePackages: _removePackages
    };
};