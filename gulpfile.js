const gulp = require('gulp');
const clean = require('gulp-clean');
const ts = require('gulp-typescript');
const rename = require('gulp-rename');

const tsProject = ts.createProject('tsconfig.json');

// 清理构建目录
gulp.task('clean', () => {
  return gulp.src(['dist'], { allowEmpty: true })
    .pipe(clean());
});

// 编译 TypeScript
gulp.task('compile', () => {
  return tsProject.src()
    .pipe(tsProject())
    .pipe(gulp.dest('dist'));
});

// 复制其他资源
gulp.task('copy', () => {
  return gulp.src([
    'miniprogram/**/*',
    '!miniprogram/**/*.ts'
  ]).pipe(gulp.dest('dist'));
});

// 构建任务
gulp.task('build', gulp.series('clean', 'compile', 'copy'));

// 开发模式
gulp.task('dev', () => {
  gulp.watch('miniprogram/**/*', gulp.series('build'));
});