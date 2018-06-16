const gulp = require('gulp');

/**
 * Copy static html files to /dist/pages.
 */

module.exports = function copy_html() {
    return gulp
            .src("./src/pages/*.html")
            .pipe(gulp.dest("./dist/pages"));
};