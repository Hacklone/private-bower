var fs = require('fs');
var path = require('path');

var Server = require('../../lib/main');

var sandboxPath = path.resolve('features/sandbox/');
var configPath = path.join(sandboxPath, 'bower.conf.json');
var originalConfigPath = path.resolve('bower.conf.json');

module.exports = function() {
    var server;

    function _start(configurationModifier) {
        createSandbox();

        goToSandbox();

        copyConfig();

        startServer();

        function createSandbox() {
            if(!fs.existsSync(sandboxPath)) {
                fs.mkdir(sandboxPath);
            }
        }

        function goToSandbox() {
            if(process.cwd() !== sandboxPath) {
                process.chdir(sandboxPath);
            }
        }

        function copyConfig() {
            var config = JSON.parse(fs.readFileSync(originalConfigPath).toString());

            if(configurationModifier) {
                configurationModifier(config);
            }

            fs.writeFileSync(configPath, JSON.stringify(config, null, '    '));
        }

        function startServer() {
            server = Server();

            server.start(configPath);
        }
    }

    function _stop() {
        server.shutDown(true);

        require('../../lib/packageStore').packages = {};

        clearSandbox();

        function clearSandbox() {
            forAllItemsInDirectory(sandboxPath, deleteItemsSync);

            function deleteItemsSync(itemPath) {
                if(fs.statSync(itemPath).isDirectory()) {
                    forAllItemsInDirectory(itemPath, deleteItemsSync);

                    fs.rmdirSync(itemPath);
                }
                else {
                    fs.unlinkSync(itemPath);
                }
            }

            function forAllItemsInDirectory(folderPath, callback) {
                fs.readdirSync(folderPath)
                    .forEach(function(childName) {
                        callback(path.join(folderPath, childName));
                    });
            }
        }
    }

    return {
        start: _start,
        stop: _stop
    };
};