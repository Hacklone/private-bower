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
            '  -p                 Port to use [5678]',
            '  -o                 Repository persist file [bowerRepository.json]',
            '  -np                Turn off public bower registry fallback',
            '  --migrate          Migrates from xml file format to json',
            '  -h --help          Print this list and exit.'
        ].join('\n'));
    }

    return {
        log: _log,

        logHelp: _logHelp
    };
}();