var gulp = require('gulp');
var gutil = require('gulp-util');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var gulpImports = require('gulp-imports');
var less = require('gulp-less');
var path = require('path');

gulp.task('js', function(){

    return gulp.src([
        'src/fieldval-ui.js'
    ])
    .pipe(gulpImports())
    .pipe(concat('fieldval-ui.js'))
    .pipe(gulp.dest('./'))
    .pipe(uglify())
    .pipe(concat('fieldval-ui.min.js'))
    .pipe(gulp.dest('./'))
    .on('error', gutil.log);
})

gulp.task('less', function(){

    return gulp.src([
        'themes/*.less'
    ])
    .pipe(less())
    .pipe(rename({
        extname: ".css"
    }))
    .pipe(gulp.dest('./themes'))
    .on('error', gutil.log);
})


gulp.task('default', function(){
    gulp.watch(['src/**/*.js','bower_components/**/*.js'], ['js']);
    gulp.watch(['themes/**.subless','themes/**/*.less'], ['less']);
});


gulp.task('nodemon', function () {
  nodemon({ script: 'mocha test/test.js', watch: "src/", ext: 'js', ignore: ['src/'] })
    .on('restart', function () {
      console.log('restarted!')
    })
})