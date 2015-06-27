var Promise = require('bluebird');
var request = require('superagent');

module.exports = function() {
    var baseUrl = 'http://localhost:5678';

    function _get(url, headers) {
        return new Promise(function(resolve, reject) {
            var req = request.get(baseUrl + url);

            _setHeaders(req, headers);

            req.end(function(err, res) {
                if(err) {
                    reject({
                        response: res, 
                        error: err
                    });
                }
                else {
                    resolve(res);
                }
            });
        });
    }

    function _post(url, data, headers) {
        return new Promise(function(resolve, reject) {
            var req = request
                .post(baseUrl + url)
                .send(data);

            _setHeaders(req, headers);

            req.end(function(err, res) {
                if(err) {
                    reject(res, err);
                }
                else {
                    resolve(res);
                }
            });
        });
    }

    function _delete(url, data, headers) {
        return new Promise(function(resolve, reject) {
            var req = request
                .del(baseUrl + url)
                .send(data);

            _setHeaders(req, headers);

            req.end(function(err, res) {
                if(err) {
                    reject(res, err);
                }
                else {
                    resolve(res);
                }
            });
        });
    }

    function _setHeaders(request, headers) {
        for(var prop in headers) {
            if(headers.hasOwnProperty(prop)) {
                request.set(prop, headers[prop]);
            }
        }
    }

    return {
        get: _get,
        post: _post,
        delete: _delete
    };
}();