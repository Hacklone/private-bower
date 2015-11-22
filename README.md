[npm-url]: https://npmjs.org/package/private-bower
[npm-image]: https://img.shields.io/npm/v/private-bower.svg
[downloads-image]: https://img.shields.io/npm/dm/private-bower.svg
[total-downloads-image]:
https://img.shields.io/npm/dt/private-bower.svg
[codeship-url]: https://codeship.com/projects/54990
[codeship-image]: https://img.shields.io/codeship/662b04e0-7427-0132-ff21-2aca0eeadc1e/master.svg

private-bower [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url]  [![Total Downloads][total-downloads-image]][npm-url] [![Tests][codeship-image]][codeship-url]
============
<img src="https://raw.githubusercontent.com/Hacklone/private-bower/master/site/logo.png" alt="private-bower" width="250" height="250" />

The ultimate private bower server.

<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XD9FKUJYSPP74" target="_blank">
  <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" />
</a> 

Twitter: <a href="https://twitter.com/private_bower">@private_bower</a>, <a href="https://twitter.com/hashtag/private_bower?src=hash">#private_bower</a>

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
  - [Restart server](#restart-server)
  - [Refresh caches](#refresh-caches)
  - [Authentication](#authentication)
  - [Log4js configuration examples](#log4js-configuration-examples)
- [License](#license)
- [Tips for usage](#tips-for-usage)
- [Contributing](#contributing)

#Features

*   Register private packages
*   Fallback to public packages
*   Cache public registry
*   Cache public git repositories
*   Cache public svn repositories
*   Web UI with package details
*   Web UI package management
*   Blacklist public packages
*   Whitelist public packages

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
    "registryFile": "./bowerRepository.json",
    "timeout": 144000,
    "server": {
        "port": 5678,
        "hostName": null,
        "siteBaseUrl": null,
    },
    "public": {
        "disabled": false,
        "registry": "http://bower.herokuapp.com/packages/",
        "registryFile": "./bowerRepositoryPublic.json",
        "whitelist": [],
        "blacklist": []
    },
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
            "protocol": "git",
            "publicAccessURL" : null,
            "refreshTimeout": 10
        },
        "svn": {
            "enabled": false,
            "cacheDirectory": "./svnRepoCache",
            "host": "localhost",
            "port": 7891,
            "protocol": "svn",
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
| server.port                                | Port on which the private bower server will listen                                   | 5678 (process.env.PORT if set)        |
| server.hostName                            | Host name on which the private bower server will listen                              | null (process.env.IP if set)          |
| server.siteBaseUrl                         | Load private bower server on a specific path, useful for using a reverse proxy       | null                                  |
| registryFile                               | File for persisting private packages (must be a valid json)                          | ./bowerRepository.json                |
| timeout                                    | server package timeout                                                               | 144 000                               |
| public.disabled                            | Disable fallback feature for public packages                                         | false                                 |
| public.registry                            | Public bower registry's url                                                          | http://bower.herokuapp.com/packages/  |
| public.registryFile                        | File for persisting public packages (must be a valid json)                           | ./bowerRepositoryPublic.json          |
| public.whitelist                           | Define public packages that are allowed to be installed                              | \[\]                                  |
| public.blacklist                           | Define public packages that are not allowed to be installed                          | \[\]                                  |
| authentication.enabled                     | Authentication enabled for registering packages                                      | false                                 |
| authentication.key                         | Authentication key (Auth-Key header)                                                 | password                              |
| repositoryCache.(svn, git).enabled         | Public repository caching enabled                                                    | false                                 |
| repositoryCache.cachePrivate               | Also cache privately registered packages                                             | false                                 |
| repositoryCache.(svn, git).host            | Server's host name for repository access                                             | localhost                             |
| repositoryCache.(svn, git).port            | Port to open repository server on                                                    | 7891, 6789                            |
| repositoryCache.(svn, git).protocol        | Protocol the mirrored repositories will use                                          | git, svn, https, http                 |
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




#Usage

##Web interface
Convenient way for viewing your packages in a browser.  The web interface will only list your private packages, it will 
not list the public packages if you have a public registry enabled.  However, when searching for packages in bower, the 
public ones will show up just fine.
   
> http://localhost:5678/

##Project
Within your project, you will need to create a .bowerrc file containing the URL of your private bower server:
```json
{
  "registry": "http://yourPrivateBowerRepo:5678",
  "timeout": 300000
}
```

If you are using private bower with `server.siteBaseURL` option, you need to add the same path the registry url in your .bowerrc file:

Config
```json
{
  "server": {
    "port": 6789,
    "hostName": "yourPrivateBowerRepo",
    "setBaseURL": "/my-private-bower"
  }
}
```

.bowerrc
```json
{
  "registry": "http://yourPrivateBowerRepo:6789/my-private-bower",
  "timeout": 300000
}
```

##List packages
GET
> bower-server:5678/packages

##Search packages
> bower search \[packageName\]

##Register package
> bower register \[packageName\] \[gitRepo\]

or
POST
> bower-server:5678/packages

> { "name": "package-name", "url": "git://repoPath" }

or
POST
> bower-server:5678/packages/\<package name\>

> { "url": "git://repoPath" }

##Register packages
POST
> bower-server:5678/packages

> [ { "name": "package-name", "url": "git://repoPath" } ]

##Remove package
DELETE
> bower-server:5678/packages/\<package name\>

##Remove packages
DELETE
> bower-server:5678/packages

> ["package-name"]

##Restart server
POST
> bower-server:5678/restart

##Refresh caches
POST
> bower-server:5678/refresh

##Authentication

Authentication can be enabled for the following features:
*   Register package
*   Register packages
*   Remove package
*   Remove packages
*   Restart server

Add ```Auth-Key``` header to request.
> Auth-Key = password


##Log4js configuration
>There are two appenders set in the example configuration.
>You need to remove one of the two if you want to use it.
>fileDate appender will write the log to a file which will be rotated daily.
>Console will write the logging to the console in the log4js format.
>You need to set the replaceConsole to true if you want to write the logging to the log4j appenders.
>See github.com/nomiddlename/log4js-node for more information

#Tips for usage
##Server as a service
- [Installing on Ubuntu](https://github.com/Hacklone/private-bower/wiki/Installing%20on%20Ubuntu)
- [Install as a Windows service](https://github.com/Hacklone/private-bower/wiki/Install%20as%20a%20Windows%20service)

##Use behind proxy
> git config --global url."https://".insteadOf git://

##Calling the API
- do not forget to set the ```Content-Type``` header to ```application/json```

#Contributing
Please read the rules of contributing on the [contribution page](https://github.com/Hacklone/private-bower/blob/master/CONTRIBUTING.md).

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
