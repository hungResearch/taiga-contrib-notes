const gulp = require('gulp');
const coffee = require('gulp-coffee');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const pug = require('gulp-pug');

// Compile CoffeeScript → JS (Dev)
gulp.task('coffee', function () {
    return gulp.src(['src/coffee/module.coffee', 'src/coffee/controller.coffee'])
        .pipe(sourcemaps.init())
        .pipe(coffee())
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js'));
});

// Compile Jade (Pug) → HTML
gulp.task('pug', function () {
    return gulp.src('src/templates/*.jade')
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest('dist'));
});

// Compile partials (views)
gulp.task('partials', function () {
    return gulp.src('src/templates/partials/*.jade')
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest('dist/partials'));
});

// Watch task
gulp.task('watch', function () {
    gulp.watch('src/coffee/**/*.coffee', gulp.series('coffee'));
    gulp.watch('src/templates/**/*.jade', gulp.series('pug', 'partials'));
});

// Default task
gulp.task('default', gulp.parallel('coffee', 'pug', 'partials'));
