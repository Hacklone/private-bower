var Promise = require('bluebird');
var request = require('superagent');

module.exports = function() {
    function _catch(done, fn) {
        try {
            fn();
            done();
        } catch(err) {
            done(err);
        }
    }
    
    function _get(url, headers) {
        return new Promise(function(resolve, reject) {
            var req = request.get(url);

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
    
    function _setHeaders(request, headers) {
        for(var prop in headers) {
            if(headers.hasOwnProperty(prop)) {
                request.set(prop, headers[prop]);
            }
        }
    }

    return {
        get: _get,
        catch: _catch
    };
}();