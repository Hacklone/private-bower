var gulp = require('gulp');
var mocha = require('gulp-mocha');
var runSequence = require('run-sequence');

gulp.task('test', function(callback) {
    runSequence('unit-test', 'feature-test', callback);
});

gulp.task('unit-test', function () {
    var files = [
        'lib/**/*.js'
    ];
    
    return gulp.src(files, {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('feature-test', function() {
    var files = [
        'lib/**/*.js',
        '!lib/**/*.spec.js',
        'features/**/*.js'
    ];

    return gulp.src(files, {read: false})
        .pipe(mocha({
            timeout: 6000,
            reporter: 'nyan'
        }));
});