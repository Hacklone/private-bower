String.prototype.format = String.prototype.format || function format() {
    var args = arguments;

    return this.replace(/\{(\d+)\}/g, function($0, $1) {
        return args[+$1];
    });
};

String.prototype.startsWith = String.prototype.startsWith || function startsWith(searchString, position) {
   position = position || 0;

    return this.indexOf(searchString, position) === position;
};