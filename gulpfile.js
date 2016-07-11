var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');


gulp.task('browserify', function() {
  var bundleStream = browserify('./src/main.js').bundle()
 
  return bundleStream
    .pipe(source('index.js'))
    .pipe(streamify(uglify()))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(connect.reload());
});

gulp.task('connect', function() {
  return connect.server({
    root: 'dist',
    livereload: true
  });
});

gulp.task('html', function() {
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
  gulp.watch('./src/**/*.js', ['browserify']);
  gulp.watch('./src/**/*.html', ['html']);
})

gulp.task('default', ['browserify', 'html', 'connect', 'watch']);