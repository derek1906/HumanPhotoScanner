const gulp = require("gulp");

module.exports = {
    generate: function(tasks){
        return function watch_for_changes() {
            gulp.watch("src/**/*", tasks);
        };
    }
};