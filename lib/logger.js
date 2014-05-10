require('colors');

module.exports = function() {
    function _log(text) {
        console.log('[bower] '.green, text);
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

        logHelp: _logHelp
    };
}();