const gulp = require("gulp");
const del = require("del");

module.exports = function clean_dist() {
    return del("dist/**/*");
};