import gulp from "gulp";
import gpug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
import autoprefixer from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import bro from "gulp-bro";
import babelify from "babelify";
import ghPages from "gulp-gh-pages"

const sass = require('gulp-sass')(require('sass'));

const routes = {
    pug: {
        watch: "src/**/*.pug",
        src: "src/*.pug",    
        dest: "build"
    },
    img: {
        src: "src/img/*",
        dest: "build/img"
    },
    scss: {
        watch: "src/scss/**/*.scss",
        src: "src/scss/style.scss",
        dest: "build/css"
    },
    css: {
        src: "src/css/**/*.css",
        dest: "build/css"
    },
    library: {
        src: "src/lib/**/*",
        dest: "build/lib"
    },
    js: {
        watch: "src/js/**/*.js",
        src: "src/js/main.js",
        dest: "build/js"
    }
}

// Tasks
const pug = () => 
    gulp
    .src(routes.pug.src)
    .pipe(gpug({
        doctype: 'html',
        pretty: true
    }))                                   // pug 컴파일 
    .pipe(gulp.dest(routes.pug.dest));

const clean = () => del(["build", ".publish"]);

const webserver = () => gulp.src("build").pipe(ws({livereload: true, open: true}));

const img = () => 
    gulp
    .src(routes.img.src)
    .pipe(image())                                  // 이미지 최적화.
    .pipe(gulp.dest(routes.img.dest));

const scss = () =>
    gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))        // css 컴파일 
    .pipe(autoprefixer())                           // 하위 브라우저 호환코드 지원.
    .pipe(miniCSS())                                // css파일 용량 최소화.
    .pipe(gulp.dest(routes.scss.dest));

const css = () => 
    gulp
    .src(routes.css.src)
    .pipe(gulp.dest(routes.css.dest));

const library = () => 
    gulp
    .src(routes.library.src)
    .pipe(gulp.dest(routes.library.dest));

const js = () =>
    gulp.src(routes.js.src)
      .pipe(bro({
        transform: [
          babelify.configure({ presets: ['@babel/preset-env'] }),
          [ 'uglifyify', { global: true } ]
        ]
      }))
      .pipe(gulp.dest(routes.js.dest));

const ghDeploy = () => gulp.src("build/**/*").pipe(ghPages());

// Watching
const watch = () => { 
    gulp.watch(routes.pug.watch, pug);
    gulp.watch(routes.img.src, img);
    gulp.watch(routes.scss.watch, scss);
    gulp.watch(routes.js.watch, js);
};

//----------------------------------------------------------------------------------- 

// 준비과정.
const prepare = gulp.series([clean, img, css, library]);

// 컴파일.
const assets = gulp.series([pug, scss, js]);

// 웹서버 실행하고 파일의 변동사항을 지켜본다. 
const live = gulp.parallel([webserver, watch]);

// dev task를 순차적으로 실행한다.
// export하지 않는다면, console이나 package.json에서 dev를 사용하지 못한다.
export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, ghDeploy, clean]);