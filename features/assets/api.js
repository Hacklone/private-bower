var Promise = require('bluebird');
var request = require('superagent');

module.exports = function() {
    var baseUrl = 'http://localhost:5678';

    function _get(url) {
        return new Promise(function(resolve, reject) {
            request
                .get(baseUrl + url)
                .end(function(err, res) {
                    if(err) {
                        reject(res, err);
                    }
                    else {
                        resolve(res);
                    }
                });
        });
    }

    function _post(url, data) {
        return new Promise(function(resolve, reject) {
            request
                .post(baseUrl + url)
                .send(data)
                .end(function(err, res) {
                    if(err) {
                        reject(res, err);
                    }
                    else {
                        resolve(res);
                    }
                });
        });
    }

    function _delete(url, data) {
        return new Promise(function(resolve, reject) {
            request
                .delete(baseUrl + url)
                .send(data)
                .end(function(err, res) {
                    if(err) {
                        reject(res, err);
                    }
                    else {
                        resolve(res);
                    }
                });
        });
    }

    return {
        get: _get,
        post: _post,
        delete: _delete
    };
}();