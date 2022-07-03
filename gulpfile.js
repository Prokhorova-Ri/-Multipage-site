const { src, dest, watch, parallel, series } = require('gulp');
const concat       = require('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const scss         = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const imagemin     = require('gulp-imagemin');
const del          = require('del');
const gulp         = require('gulp');
const ghPages      = require('gulp-gh-pages');

function browsersync() {
  browserSync.init({
    server: {
        baseDir: "docs/"
    }
  });
}

function cleanDist() {
  return del('dist')
}

function images() {
  return src('docs/images/**/*')
  .pipe(imagemin(
      [
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
          plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
      })
    ]
  ))
  .pipe(dest('dist/images'))
}

function scripts () {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    'node_modules/mixitup/dist/mixitup.js',
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
    'docs/js/main.js'
  ])
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('docs/js'))
  .pipe(browserSync.stream())
}

function styles() {
  return src('docs/scss/style.scss')
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'],
      grid: true
    }))
    .pipe(dest('docs/css'))
    .pipe(browserSync.stream())
}

function build() {
  return src([
    'docs/css/style.min.css',
    'docs/fonts/**/*',
    'docs/js/main.min.js',
    'docs/*.html'
  ], {base: 'docs'})
  .pipe(dest('dist'))
}

function watching() {
  watch(['docs/scss/**/*.scss'], styles);
  watch(['docs/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['docs/*.html']).on('change', browserSync.reload);
}

gulp.task('deploy', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});

exports.styles      = styles;
exports.images      = images;
exports.scripts     = scripts;
exports.watching    = watching;
exports.browsersync = browsersync;
exports.cleanDist   = cleanDist;

exports.build       = series(cleanDist, images, build)
exports.default     = parallel(styles, scripts, browsersync, watching);
