private-bower
=============

A simple private bower registry

#Installion

Install
> npm install -g private-bower

Run
> private-bower

Optional Parameters
> private-bower -p 5678 -o "output file path"

#Usage

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
