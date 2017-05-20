var gulp = require('gulp');
var gulpFilter = require('gulp-filter');
var less = require('gulp-less');
var autoprefix = require('less-plugin-autoprefix');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
require('es6-promise').polyfill();


var browsers = [
    "Explorer >= 8",
    "Chrome >= 21",
    "Firefox ESR",
    "Opera >= 15",
    "Android >= 4.0",
    "Safari >= 6.2.6",
    "ExplorerMobile >= 10",
    "iOS >= 6",
    "BlackBerry >= 10"
].join(",");

var cleanCssOptions = {
    compatibility: 'ie7',
    aggressiveMerging: false,
    advanced: false
};

//gulp.task('prefix', function() {
//    return gulp.src([
//            'styles/kendo/kendo-mobile/*.css','!styles/kendo/kendo-mobile/*.pref.css',
//            'views/**/*.css','!views/**/*.pref.css',
//            'styles/*.css', '!styles/*.pref.css'
//        ])
//        .pipe(autoprefixer({
//            browsers: browsers
//        }))
//        .pipe(rename({
//            suffix: ".pref"
//        }))
//        .pipe(gulp.dest(function(file) {
//            return file.base;
//        }));
//});

gulp.task('prefix', function() {
    return gulp.src([
            'styles/kendo/kendo-mobile/kendo.mobile.all.less',
            'styles/all.less',
            'views/**/*.less'
        ])
        .pipe(less ({ relativeUrls: true, plugins: [new autoprefix({ browsers: browsers })] }))
        .pipe(gulp.dest(function(file) {
            return file.base;
        }));
});

gulp.task('process', ['prefix'], function() {
    return gulp.src([
            'styles/kendo/kendo-mobile/kendo.mobile.all.css',
            'styles/all.css',
            'views/**/*.css'
        ])
        .pipe(gulpFilter(function (file) {
            return !(/\.min/.test(file.path));
        }))
        .pipe(minifyCSS(cleanCssOptions))
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest(function(file) {
            return file.base;
        }));
});

gulp.task("watch", function () {

    gulp.watch([
        "views/**/*.less",
        'styles/**/*.less'
    ], ["process"]);

});

