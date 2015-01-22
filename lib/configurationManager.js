var fs = require('fs');
var path = require('path');
var log4js = require('log4js');
var utils = require('./utils.js');

var logger = require('./logger.js');

module.exports = function ConfigurationManager() {
    var self = {
        config: {
            port: 5678,
            timeout: 2 * 60 * 1200
        },
        loadConfiguration: _loadConfiguration
    };
    
    function _loadConfiguration(configPath) {
        if(!fs.existsSync(configPath)) {
            logger.error('config file not found at ' + configPath);
        }

        self.configPath = configPath;
    
        var configDirectory = path.join(configPath, '../');
    
        var json = fs.readFileSync(configPath).toString();
        var configFile = JSON.parse(json);
        
        utils.extend(self.config, configFile);
    
        setConfigValues();
        configureLog4Js();
        
        function setConfigValues() {
            self.config.registryFile = path.resolve(configFile.registryFile || path.join(configDirectory, './bowerRepository.json'));
            self.config.registryFilePublic = path.resolve(configFile.registryFilePublic || path.join(configDirectory, './bowerRepositoryPublic.json'));
            self.config.publicRegistry = self.config.publicRegistry || 'http://bower.herokuapp.com/packages/';

            self.config.repoCacheOptions = {};

            if(self.config.repositoryCache.svn && self.config.repositoryCache.svn.enabled) {
                self.config.repoCacheOptions.svn = {
                    repoCacheRoot: path.resolve(self.config.repositoryCache.svn.cacheDirectory || path.join(self.configDirectory, './svnRepoCache')),
                    hostName: self.config.repositoryCache.svn.host || 'localhost',
                    port: self.config.repositoryCache.svn.port || 7891,
                    refreshTimeout: self.config.repositoryCache.svn.refreshTimeout || 10,
                    parameters: self.config.repositoryCache.svn.parameters
                };
            }

            if(self.config.repositoryCache.git && self.config.repositoryCache.git.enabled) {
                self.config.repoCacheOptions.git = {
                    repoCacheRoot: path.resolve(self.config.repositoryCache.git.cacheDirectory || path.join(self.configDirectory, './gitRepoCache')),
                    hostName: self.config.repositoryCache.git.host || 'localhost',
                    publicAccessURL: self.config.repositoryCache.git.publicAccessURL || null,
                    port: self.config.repositoryCache.git.port || 6789,
                    refreshTimeout: self.config.repositoryCache.git.refreshTimeout || 10,
                    parameters: self.config.repositoryCache.git.parameters
                };
            }

            self.config.repositoryCache.enabled = self.config.repoCacheOptions.svn || self.config.repoCacheOptions.git;
        }
        
        function configureLog4Js() {
            if(self.config.log4js && self.config.log4js.enabled)  {
                log4js.configure(self.config.log4js.configPath);
            }
        }
    }
    
    return self;
}();