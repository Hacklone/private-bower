var fs = require('fs');
var path = require('path');
var log4js = require('log4js');
var utils = require('./utils');
var pathIsAbsolute = require('path-is-absolute');

var logger = require('./logger');

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
            self.config.registryFile = getRelativeFilePath(configFile.registryFile || './bowerRepository.json');

            self.config.public = self.config.public || {};

            self.config.public.registryFile = getRelativeFilePath(configFile.public.registryFile || './bowerRepositoryPublic.json');
            self.config.public.registry = self.config.public.registry || 'http://bower.herokuapp.com/packages/';

            self.config.public.whitelist = self.config.public.whitelist || [];
            self.config.public.whitelist.enabled = !!self.config.public.whitelist.length;

            self.config.public.blacklist = self.config.public.blacklist || [];
            self.config.public.blacklist.enabled = !!self.config.public.blacklist.length;

            self.config.repoCacheOptions = {};

            if(self.config.repositoryCache.svn && self.config.repositoryCache.svn.enabled) {
                self.config.repoCacheOptions.svn = {
                    repoCacheRoot: getRelativeFilePath(self.config.repositoryCache.svn.cacheDirectory || './svnRepoCache'),
                    hostName: self.config.repositoryCache.svn.host,
                    port: self.config.repositoryCache.svn.port || 7891,
                    refreshTimeout: self.config.repositoryCache.svn.refreshTimeout || 10,
                    parameters: self.config.repositoryCache.svn.parameters
                };
            }

            if(self.config.repositoryCache.git && self.config.repositoryCache.git.enabled) {
                self.config.repoCacheOptions.git = {
                    repoCacheRoot: getRelativeFilePath(self.config.repositoryCache.git.cacheDirectory || './gitRepoCache'),
                    hostName: self.config.repositoryCache.git.host,
                    publicAccessURL: self.config.repositoryCache.git.publicAccessURL || null,
                    port: self.config.repositoryCache.git.port || 6789,
                    refreshTimeout: self.config.repositoryCache.git.refreshTimeout || 10,
                    parameters: self.config.repositoryCache.git.parameters
                };
            }

            self.config.repositoryCache.enabled = self.config.repoCacheOptions.svn || self.config.repoCacheOptions.git;

            function getRelativeFilePath(filePath) {
                if((path.isAbsolute && path.isAbsolute(filePath)) || pathIsAbsolute(filePath)) {
                    return filePath;
                }

                return path.resolve(path.join(configDirectory, filePath));
            }
        }
        
        function configureLog4Js() {
            if(self.config.log4js && self.config.log4js.enabled)  {
                log4js.configure(self.config.log4js.configPath);
            }
        }
    }
    
    return self;
}();