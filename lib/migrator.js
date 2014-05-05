var fs = require('fs');
var path = require('path');
var xml2js = require('xml2js');

module.exports = function() {
    function _migrate(filePath) {
        filePath = typeof(filePath) === 'string' ? filePath : path.join(__dirname, '../bin', 'bowerRepository.xml');

        if(!fs.existsSync(filePath)) {
            throw new Error('Can\'t find ' + filePath);
        }

        var parser = new xml2js.Parser();
        var xml = fs.readFileSync(filePath).toString();

        var migratedFilePath = filePath.replace('.xml', '.json');

        parser.parseString(xml, function (err, result) {
            if(fs.existsSync(migratedFilePath)) {
                fs.unlinkSync(migratedFilePath);
            }

            var packages = {};
            for(var packageName in result.packages) {
                if(result.packages.hasOwnProperty(packageName)) {
                    packages[packageName] = {
                        repo: result.packages[packageName][0]
                    }
                }
            }

            fs.writeFileSync(migratedFilePath, JSON.stringify(packages, null, '    '));

            console.log('successfully migrated to ' + migratedFilePath);
        });
    }

    return {
        migrate: _migrate
    }
}();