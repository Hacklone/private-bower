var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function () {
    var files = [
        'lib/**/*.js'
    ];
    
    return gulp.src(files, {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});