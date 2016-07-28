var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    header  = require('gulp-header'),
    rename = require('gulp-rename'),
    cssnano = require('gulp-cssnano'),
    sassLint = require('gulp-sass-lint'),
    jade = require('gulp-jade'),
    jadeInheritance = require('gulp-jade-inheritance'),
    filter = require('gulp-filter'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    eslint = require('gulp-eslint'),
    sassLint = require('gulp-sass-lint'),
    imagemin = require('gulp-imagemin');

var eslintOptions = require('./.eslintrc.js'),
    package = require('./package.json'),
    scsslintOptions = './.scss-lint.yml';

var
  concat = require('gulp-concat'),
  filter = require('gulp-filter'),
  order = require('gulp-order'),
  mainBowerFiles = require('main-bower-files');

var config = {
    destPath: 'src',
    prodPath: 'public'
};

var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');




gulp.task('csslinter', function () {
    return gulp.src(config.destPath+'/scss/**/*.scss')
    .pipe(sassLint({
        configFile: scsslintOptions
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
});
gulp.task('css', ['csslinter'], function () {
    return gulp.src(config.destPath+'/scss/style.scss')
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer('last 4 version'))
    .pipe(gulp.dest(config.prodPath+'/css'))
    .pipe(cssnano())
    .pipe(rename({ suffix: '.min' }))
    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest(config.prodPath+'/css'))
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('js',function(){
  gulp.src(config.destPath+'/js/scripts.js')
    .pipe(plumber({
      errorHandler: notify.onError("Error: <%= error.message %>")
    }))

    .pipe(eslint(eslintOptions))
    .pipe(eslint.format())
    .pipe(eslint.failOnError())

    .pipe(header(banner, { package : package }))
    .pipe(gulp.dest(config.prodPath+'/js'))
    .pipe(uglify())
    .pipe(header(banner, { package : package }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(config.prodPath+'/js'))
    .pipe(browserSync.reload({stream:true, once: true}));
});



gulp.task('images', function() {
    return gulp.src(config.destPath+'/images/**/*.{png,jpg,jpeg,gif,svg}')
        .pipe(plumber({
          errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(config.prodPath+'/img'))
        .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('views', function() {
    return gulp.src(config.destPath+'/views/**/*.jade')
        .pipe(plumber({
          errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(jadeInheritance({ basedir: config.destPath+'/views/' }))
        .pipe(jade({
          pretty: true
        }))
        .pipe(filter(function(file) {
            var exclude;
            if (true) exclude = new RegExp('templates|mixins', 'g');
            else exclude = new RegExp('templates|mixins|includes', 'g');

            return !exclude.test(file.path);
        }))
        .pipe(gulp.dest(config.prodPath));
});

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: config.prodPath+'/'
        }
    });
});
gulp.task('bs-reload', function () {
    browserSync.reload();
});

gulp.task('scripts:vendor', function () {
  return gulp.src(mainBowerFiles({
    filter:'**/*.js', //css
      paths: {
          bowerDirectory: 'src/libs',
          bowerrc: './.bowerrc',
          bowerJson: './bower.json'
      }
  }))
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.prodPath+'/js'));
});


gulp.task('styles:vendor', function () {
  return gulp.src(mainBowerFiles({
    filter:'**/*.css', //css
      paths: {
          bowerDirectory: 'src/libs',
          bowerrc: './.bowerrc',
          bowerJson: './bower.json'
      }
  }))
    .pipe(concat('vendor.css'))
    .pipe(cssnano())
    .pipe(gulp.dest(config.prodPath+'/css'));
});

gulp.task('bower-components', ['scripts:vendor', 'styles:vendor']);

gulp.task('default', ['css', 'js', 'views', 'browser-sync', 'images'], function () {
    gulp.watch(config.destPath+"/scss/*/*.scss", ['css']);
    gulp.watch(config.destPath+"/js/*.js", ['js']);
    gulp.watch(config.prodPath+"/*.html", ['bs-reload']);
    gulp.watch(config.destPath+'/views/**/*.jade', ['views']);
    gulp.watch(config.destPath+'/images/**/*.{png,jpg,jpeg,gif,svg}', ['images']);
});
