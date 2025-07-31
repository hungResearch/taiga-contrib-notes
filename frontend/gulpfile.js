const gulp = require('gulp');
const coffee = require('gulp-coffee');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();

// Compile CoffeeScript → JS (Dev)
gulp.task('coffee', function () {
    return gulp.src(['src/coffee/module.coffee', 'src/coffee/controller.coffee'])
        .pipe(sourcemaps.init())
        .pipe(coffee())
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.stream()); // BrowserSync reload JS
});

// Compile Jade (Pug) → HTML
gulp.task('pug', function () {
    return gulp.src('src/templates/*.jade')
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream()); // BrowserSync reload HTML
});

// Compile partials (views)
gulp.task('partials', function () {
    return gulp.src('src/templates/partials/*.jade')
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest('dist/partials'))
        .pipe(browserSync.stream());
});

gulp.task('css', function () {
    return gulp.src('src/styles/**/*.css')
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});


// Serve + Watch task
gulp.task('serve', function () {
    // Khởi tạo server, thư mục gốc là dist
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        port: 3000,
        open: false, // true nếu muốn tự mở browser khi start
        notify: false
    });

    // Watch file, khi thay đổi sẽ chạy lại task và reload
    gulp.watch('src/coffee/**/*.coffee', gulp.series('coffee'));
    gulp.watch('src/templates/**.*.jade', gulp.series('pug', 'partials'));
    gulp.watch('src/styles/**/*.css', gulp.series('css'));
    gulp.watch('dist/*.html').on('change', browserSync.reload); // Reload khi HTML ngoài thay đổi

});

// Default task: build 1 lần, rồi serve
gulp.task('default', gulp.series(
    gulp.parallel('coffee', 'pug', 'partials', 'css'),
    'serve'
));
