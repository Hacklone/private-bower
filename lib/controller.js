var Router = require('express').Router;

function Controller(basePath) {
    this.basePath = basePath;

    this.router = Router();
}

Controller.prototype = {
    get: function(path, handler) {
        this.router.get(path, handler);
    },
    post: function(path, handler) {
        this.router.post(path, handler);
    },
    put: function(path, handler) {
        this.router.put(path, handler);
    },
    delete: function(path, handler) {
        this.router.delete(path, handler);
    },
    bind: function(app) {
        app.use(this.basePath, this.router);
    }
};

module.exports = Controller;