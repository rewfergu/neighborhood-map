var gulp = require('gulp');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var requirejsOptimize = require('gulp-requirejs-optimize');

// process styles
gulp.task('sass', function() {
  var one = gulp.src('src/scss/styles.scss')
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false,
    }))
    .pipe(sourcemaps.init())
    .pipe(minifyCSS({
      keepBreaks: false,
      keepSpecialComments: 1,
    }))
    .pipe(sourcemaps.write('./sourcemaps'))
    .pipe(gulp.dest('src/css/'));
});

// optimize js and move to the 'dist' folder
gulp.task('build', function() {
  return gulp.src('src/main.js')
    .pipe(requirejsOptimize())
    .pipe(gulp.dest('dist'));
});

// watch the scss folder
gulp.task('watch', function() {
  var watcher = gulp.watch(['src/scss/**/*.scss', 'src/js/*.js'], ['sass']);
  livereload.listen();
  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    livereload.changed();
  });
});
