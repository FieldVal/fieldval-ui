var gulp = require('gulp');
var gutil = require('gulp-util');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gulpImports = require('gulp-imports');
var rename = require('gulp-rename');
var less = require('gulp-less');
var path = require('path');

var docs_to_json = require('sa-docs-to-json');

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
    gulp.watch(['themes/**/*.subless','themes/**/*.less'], ['less']);
    gulp.watch(['docs_src/**/*'], ['docs']);
});

gulp.task('docs', function() {
    return gulp.src('./docs_src/*.json')
    .pipe(docs_to_json())
    .pipe(gulp.dest('./docs/'))
});