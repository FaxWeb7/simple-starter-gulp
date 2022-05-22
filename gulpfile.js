const { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require('browser-sync').create(),
  fileinclude = require('gulp-file-include'),
  del = require('del'),
  scss = require('gulp-sass')(require('sass')),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  clean_css = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify-es').default,
  imagemin = require('gulp-imagemin'),
  webp = require('gulp-webp'),
  webphtml = require('gulp-webp-html'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  fonter = require('gulp-fonter'),
  htmlmin = require('gulp-htmlmin');
  


const fs = require('fs');

const projectFolder = "build"; 
const sourceFolder = "src";

const path = { 
  build: { 
    html: `${projectFolder}/`,
    css: `${projectFolder}/css/`,
    js: `${projectFolder}/js/`,
    img: `${projectFolder}/img/`,
    fonts: `${projectFolder}/fonts/`
  },
  src: {
    html: [`${sourceFolder}/*.html`, `${sourceFolder}/views/pages/*.html`],
    css: [`${sourceFolder}/scss/*.scss`, `${sourceFolder}/scss/*.css`, `!${sourceFolder}/scss/_*.scss`],
    js: `${sourceFolder}/js/*.js`,
    img: `${sourceFolder}/img/**/*.{jpg,png,svg,gif,ico,webp}`,
    fonts: `${sourceFolder}/fonts/*.ttf`
  },
  watch: { 
    html: `${sourceFolder}/*.html`, 
    html2: `${sourceFolder}/views/**/*.html`,
    css: `${sourceFolder}/scss/*.scss`,
    css2: `${sourceFolder}/scss/*.css`,
    js: `${sourceFolder}/js/**/*.js`,
    img: `${sourceFolder}/img/**/*.{jpg,png,svg,gif,ico,webp}`
  },
  clean: `./${projectFolder}/`
}

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: `./${projectFolder}`  
    },
    port: 3000,
    notify: false
  })
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function css() { 
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() { 
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function images() { 
  return src(path.src.img)
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 2
      })
    )
    .pipe(
      webp({
        quality: 80
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function watchFiles(params) {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.html2], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.css2], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], images)
}

function clean(params) {
  return del(path.clean);
}

const build = gulp.series(clean, gulp.parallel(html, css, js, images)); 
const watch = gulp.parallel(build, watchFiles, browserSync);


exports.js = js;
exports.images = images;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;