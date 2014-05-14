String.prototype.format = String.prototype.format || function format() {
    var args = arguments;

    return this.replace(/\{(\d+)\}/g, function($0, $1) {
        return args[+$1];
    });
};