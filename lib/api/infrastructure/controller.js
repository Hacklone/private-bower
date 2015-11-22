var Router = require('express').Router;

function Controller(basePath) {
    this.basePath = basePath;

    this.router = Router();
}

Controller.prototype = {
    get: function(path, middleware, handler) {
        if(handler) {
            this.router.get(path, middleware, handler);
        }
        else {
            this.router.get(path, middleware);
        }
    },
    post: function(path, middleware, handler) {
        if(handler) {
            this.router.post(path, middleware, handler);
        }
        else {
            this.router.post(path, middleware);
        }
    },
    put: function(path, middleware, handler) {
        if(handler) {
            this.router.put(path, middleware, handler);
        }
        else {
            this.router.put(path, middleware);
        }
    },
    delete: function(path, middleware, handler) {
        if(handler) {
            this.router.delete(path, middleware, handler);
        }
        else {
            this.router.delete(path, middleware);
        }
    },
    bind: function(app, siteBasePath) {
        if (siteBasePath) {
            this.basePath = siteBasePath + this.basePath;
        }
        app.use(this.basePath, this.router);
    }
};

module.exports = Controller;