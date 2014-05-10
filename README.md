private-bower
=============

A simple private bower registry for private package handling.

#Features

*   Register private packages
*   Fallback to public packages
*   Cache public registry
*   Cache public git repositories
*   Web UI

_Features to come: Web UI management, ..._

#Installion

Install
> npm install -g private-bower

Run
> private-bower

Run with config file specified
> private-bower --conf /myBowerConfig.json

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
    "repositoryCache": {
        "enabled": false,
        "gitHost": "git://localhost",
        "gitPort": 6789,
        "cacheDirectory": "./repoCache"
    }
}
```

| name                           | description                                                            | default                |
|--------------------------------|------------------------------------------------------------------------|------------------------|
| port                           | Port on which the private bower server will listen                     | 5678                   |
| registryFile                   | File for persisting private packages                                   | ./bowerRepository.json |
| disablePublic                  | Disable fallback feature for public packages                           | false                  |
| repositoryCache.enabled        | Public git repository caching enabled                                  | false                  |
| repositoryCache.gitHost        | Server's host name for git access                                      | git://localhost        |
| repositoryCache.gitPort        | Port to open git server on                                             | 6789                   |
| repositoryCache.cacheDirectory | Directory where the public git repository cache will save repositories | ./repoCache            |

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

##Register package
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
