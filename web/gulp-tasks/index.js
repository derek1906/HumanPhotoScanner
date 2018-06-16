const gulp = require("gulp");
const webpack = require("./webpack");
const copy_html = require("./copy-html");
const clean = require("./clean");
const auto_build = require("./auto_build");

/**
 * Build production
 */
gulp.task("build", gulp.series(
    function(done) {
        webpack.config.mode = "production";
        done();
    },
    clean, 
    gulp.parallel(webpack.task_func, copy_html)
));

/**
 * Build development
 */
gulp.task("build-dev", gulp.series(
    function (done) {
        webpack.config.mode = "development";
        done();
    },
    clean,
    gulp.parallel(webpack.task_func, copy_html)
));

/**
 * Clean up all generated files
 */
gulp.task("clean", gulp.series(
    clean
));

/**
 * Auto build for dev
 */
gulp.task("watch", gulp.series(
    "build-dev",
    auto_build.generate(gulp.series("build-dev"))
));