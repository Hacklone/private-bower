require('colors');

var moment = require('moment');

module.exports = function() {
    function _log(text) {
        var timeStamp = moment().format('D/M/YY HH:mm:ss');

        console.log('[bower] '.green, timeStamp.cyan, ' ', text);
    }

    function _error(text) {
        _log(text.red);
    }

    function _logHelp() {
        console.log([
        '              _          _           _',
        '     _ __ _ _(_)_ ____ _| |_ ___ ___| |__  _____ __ _____ _ _',
        '    | \'_ \\ \'_| \\ V / _` |  _/ -_)___| \'_ \\/ _ \\ V  V / -_) \'_|',
        '    | .__/_| |_|\\_/\\__,_|\\__\\___|   |_.__/\\___/\\_/\\_/\\___|_|',
        '    |_|',
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
