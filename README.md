private-bower
=============

A simple private bower registry for private package handling.

- [Features](#features)
- [Features to come](#features-to-come)
- [Installation](#installation)
- [Parameters](#parameters)
- [Config file](#config-file)
- [Usage](#usage)
  - [Web interface](#web-interface)
  - [Project](#project)
  - [List packages](#list-packages)
  - [Search packages](#search-packages)
  - [Register package](#register-package)
  - [Register packages](#register-packages)
  - [Remove package](#remove-package)
  - [Remove packages](#remove-packages)
  - [Authentication](#authentication)
  - [Log4js configuration examples](#log4js-configuration-examples)
- [License](#license)

#Features

*   Register private packages
*   Fallback to public packages
*   Cache public registry
*   Cache public git repositories
*   Cache public svn repositories
*   Web UI

#Features to come

*   Web UI management

#Installation

Install
> npm install -g private-bower

Run
> private-bower

Run with config file specified
> private-bower --config ./myBowerConfig.json

If there's no private package with requested package name the servers calls through to the public bower registry.

#Parameters

| name       | description                                    |
|------------|------------------------------------------------|
| --help     | print out help                                 |
| --config   | path to config file (Must be a valid json)     |

#Config file

Must be a valid JSON
```javascript
{
    "port": 5678,
    "registryFile": "./bowerRepository.json",
    "disablePublic": false,
    "publicRegistry": "http://bower.herokuapp.com/packages/",
    "authentication": {
        "enabled": false,
        "key": "password"
    },
    "repositoryCache": {
        "cachePrivate": false,
        "git": {
            "enabled": false,
            "cacheDirectory": "./gitRepoCache",
            "host": "localhost",
            "port": 6789,
            "publicAccessURL" : null,
            "refreshTimeout": 10
        },
        "svn": {
            "enabled": false,
            "cacheDirectory": "./svnRepoCache",
            "host": "localhost",
            "port": 7891,
            "publicAccessURL" : null,
            "refreshTimeout": 10
        }
    },
    "proxySettings" : {
        "enabled": false,
        "host": "proxy",
        "username": "name",
        "password" : "pass",
        "port": 8080,
        "tunnel": false
    },
    "log4js" : {
        "enabled": false,
        "configPath" : "log4js.conf.json"
    }
}
```

| name                                       | description                                                                          | default                               |
|--------------------------------------------|--------------------------------------------------------------------------------------|---------------------------------------|
| port                                       | Port on which the private bower server will listen                                   | 5678                                  |
| registryFile                               | File for persisting private packages (must be a valid json)                          | ./bowerRepository.json                |
| disablePublic                              | Disable fallback feature for public packages                                         | false                                 |
| publicRegistry                             | Public bower registry's url                                                          | http://bower.herokuapp.com/packages/  |
| authentication.enabled                     | Authentication enabled for registering packages                                      | false                                 |
| authentication.key                         | Authentication key (Auth-Key header)                                                 | password                              |
| repositoryCache.(svn, git).enabled         | Public repository caching enabled                                                    | false                                 |
| repositoryCache.cachePrivate               | Also cache privately registered packages                                             | false                                 |
| repositoryCache.(svn, git).host            | Server's host name for repository access                                             | localhost                             |
| repositoryCache.(svn, git).port            | Port to open repository server on                                                    | 7891, 6789                            |
| repositoryCache.(svn, git).publicAccessURL | Public address to access repository cache (useful if repository is behind an apache) | null                                  |
| repositoryCache.(svn, git).cacheDirectory  | Directory where the public repository cache will save repositories                   | ./svnRepoCache, ./gitRepoCache        |
| repositoryCache.(svn, git).refreshTimeout  | Time to wai between repository cache refresh (minutes)                               | 10 minutes                            |
| repositoryCache.(svn, git).parameters.X    | Custom parameters for git-daemon and svnserve                                        | undefined                             |
| proxySettings.enabled                      | Enable the proxy, use the proxy to call the bower remote repo                        | false                                 |
| proxySettings.host                         | Proxy host                                                                           | proxy                                 |
| proxySettings.username                     | Proxy username                                                                       | name                                  |
| proxySettings.password                     | Proxy password                                                                       | pass                                  |
| proxySettings.port                         | Proxy port                                                                           | 8080                                  |
| proxySettings.tunnel                       | Use tunnel?                                                                          | false                                 |
| log4js.enabled                             | Use log4js ?                                                                         | false                                 |
| log4js.configPath                          | Log4js configuration file. See: log4js-node for configuration options                | none                                  |
| packageStore                               | Specify a node-module to be used as a custom package store                           | none                                  |



#Usage

##Web interface
Convenient way for viewing your packages in a browser
> http://localhost:5678/

##Project
Create .bowerrc file with content:
> { "registry": "http://yourPrivateBowerRepo:5678" }

##List packages
GET
> bower-server:5678/packages

##Search packages
> bower search \[packageName\]

##Register package
> bower register \[packageName\] \[gitRepo\]

or
POST
> bower-server:5678/registerPackage

> { "name": "package-name", "repo": "git://repoPath" }

##Register packages
POST
> bower-server:5678/registerPackages

> { "packages": [ { "name": "package-name", "repo": "git://repoPath" } ] }

##Remove package
POST
> bower-server:5678/removePackage

> { "name": "package-name" }

##Remove packages
POST
> bower-server:5678/removePackages

> { "packages": ["package-name"] }

##Authentication

Authentication can be enabled for the following features:
*   Register package
*   Register packages
*   Remove package
*   Remove packages

Add ```Auth-Key``` header to request.
> Auth-Key = password


##Log4js configuration
>There are two appenders set in the example configuration.
>You need to remove one of the two if you want to use it.
>fileDate appender will write the log to a file which will be rotated daily.
>Console will write the logging to the console in the log4js format.
>You need to set the replaceConsole to true if you want to write the logging to the log4j appenders.
>See github.com/nomiddlename/log4js-node for more information

#License
> The MIT License (MIT)

> Copyright (c) 2014 Hacklone
> https://github.com/Hacklone

> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:

> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.
