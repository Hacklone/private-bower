require('colors');

var moment = require('moment');

module.exports = function() {
    function _log(text) {
        var timeStamp = moment().format('D/M/YY H:m:s');

        console.log('[bower] '.green, timeStamp.cyan, ' ', text);
    }

    function _error(text) {
        _log(text.red);
    }

    function _logHelp() {
        console.log([
            'usage: private-bower [options]',
            '',
            'options:',
            '  --h --help          Print this list and exit.',
            '  --config            Path to the config file (Must be a valid json)'
        ].join('\n'));
    }

    return {
        log: _log,
        error: _error,

        logHelp: _logHelp
    };
}();