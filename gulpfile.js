var gulp = require('gulp');
var gutil = require('gulp-util');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var gulpImports = require('gulp-imports');
var rename = require('gulp-rename');
var less = require('gulp-less');
var path = require('path');

var mochaPhantomJS = require('gulp-mocha-phantomjs');
var istanbul = require('gulp-istanbul');
var istanbulReport = require('gulp-istanbul-report');

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
    .on('error', gutil.log)
    .on('end', function(){
        return gulp.start('test');
    });
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

gulp.task('test', function(done){
    
    gulp.src("fieldval-ui.js")
    .pipe(istanbul({coverageVariable: "__coverage__"}))
    .pipe(gulp.dest('./test_tmp/'))
    .on('finish', function() {
    
        gulp.src('test/init.js')
        .pipe(gulpImports())
        .pipe(concat("test.js"))
        .pipe(gulp.dest('./test'))
        .on('finish', function() {
            
            var coverageFile = './coverage/coverage.json';

            gulp.src('test/test.html', {read: false})
            .pipe(mochaPhantomJS({
                phantomjs: {
                    hooks: 'mocha-phantomjs-istanbul',
                    coverageFile: coverageFile
                }
            }))
            .on('finish', function() {
                gulp.src(coverageFile)
                .pipe(istanbulReport())
                done();
            });    
        })
    })
    
});

gulp.task('default', function(){
    gulp.watch(['docs_src/**/*'], ['docs']);
    gulp.watch(['themes/**/*.subless','themes/**/*.less'], ['less']);
    gulp.watch(['src/**/*.js','bower_components/**/*.js'], ['js']);
    gulp.watch(['test/**/*.js'], ['test']);
    gulp.start('docs','less','js');
});

gulp.task('docs', function() {
    return gulp.src('./docs_src/*.json')
    .pipe(docs_to_json())
    .pipe(gulp.dest('./docs/'))
});