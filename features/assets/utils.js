module.exports = function() {
    function _catch(done, fn) {
        try {
            fn();
            done();
        } catch(err) {
            done(err);
        }
    }

    return {
        catch: _catch
    };
}();