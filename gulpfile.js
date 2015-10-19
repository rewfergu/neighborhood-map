var gulp = require('gulp');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var requirejsOptimize = require('gulp-requirejs-optimize');
var minifyHTML = require('gulp-htmlmin');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var ghPages = require('gulp-gh-pages');

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
gulp.task('minify-js', function() {
  return gulp.src('src/js/app.js')
    .pipe(requirejsOptimize({
      baseUrl: 'src/js',
      name: 'app',
      shim: {
        bootstrap: {
          deps: ['jquery'],
        },
      },
      paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        bootstrap: '../bower_components/bootstrap-sass/assets/javascripts/bootstrap',
        knockout: '../bower_components/knockout/dist/knockout',
        async: '../bower_components/requirejs-plugins/src/async',
        getMap: 'getMap',
        geocode: 'geocode',
        skycons: '../bower_components/skycons-html5/skycons',
        weather: 'weather',
        viewModel: 'viewModel',
        lodash: '../bower_components/lodash/lodash',
        wikipedia: 'wikipedia',
        foursquare: 'foursquare',
        TweenLite: '../bower_components/gsap/src/minified/TweenLite.min',
        Ease: '../bower_components/gsap/src/minified/easing/EasePack.min',
        googlePlaces: 'googlePlaces',
        flickr: 'flickr',
        packery: '../bower_components/packery/dist/packery.pkgd.min',
        imagesloaded: '../bower_components/imagesloaded/imagesloaded.pkgd.min',
        keys: 'keys',
      },
      optimize: 'uglify',
    }))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('minify-css', function() {
  // already minified, so just move the files over
  gulp.src('src/css/**/*').
  pipe(gulp.dest('dist/css'));
});

gulp.task('minify-img', function() {
  // just move the files over
  gulp.src('src/img/*').
  pipe(gulp.dest('dist/img'));
});

gulp.task('minify-html', ['minify-html-assets'], function() {
  gulp.src('src/index.html')
  .pipe(minifyHTML({collapseWhitespace: true}))
  .pipe(gulp.dest('dist/'));
});

gulp.task('minify-html-assets', function() {
  var assets = useref.assets();

  gulp.src('src/index.html')
  .pipe(assets)
  .pipe(gulpif('*.js', uglify()))
  .pipe(gulpif('*.css', minifyCSS()))
  .pipe(assets.restore())
  .pipe(useref())
  .pipe(gulp.dest('dist'));
});

gulp.task('copy-fonts', function() {
  gulp.src('src/bower_components/font-awesome/fonts/*.*')
  .pipe(gulp.dest('dist/fonts'));
});

gulp.task('build', [
  'minify-js',
  'minify-img',
  'copy-fonts',
  'minify-html-assets',
]);

gulp.task('deploy', function() {
  return gulp.src('dist/**/*')
    .pipe(ghPages());
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
