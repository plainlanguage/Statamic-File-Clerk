
// Set Plugin Variables
var gulp = require('gulp') // Gulp!
	changed 	= require('gulp-changed'), // Watch for changed files
	concat		= require('gulp-concat'), // Concat
	debug 		= require('gulp-debug'), // Debug
	imagemin 	= require('gulp-imagemin'), // Image Minifying
	include     = require('gulp-include'), // Include
	jshint		= require('gulp-jshint'), // JS Hinting
	livereload 	= require('gulp-livereload'), // Live Reload
	notify		= require('gulp-notify'), // Notify
	pngcrush 	= require('imagemin-pngcrush'); // PNG Crush
	rename		= require('gulp-rename'), // Rename
	sass		= require('gulp-ruby-sass'), // Sass (We have to use Ruby Sass until LibSass supports 3.3)
	uglify		= require('gulp-uglify') // Uglify JS
;

// Set the name of the add-on, used for name of .js, .css, etc.
var addonName = 'fileclerk';
// Set asset path variables
var paths = {
	build: 'assets/build/',
	js   : 'js/',
	scss : 'scss/',
	css  : 'css/',
	img  : 'assets/img/',
	bower: 'bower_components/'
};

// Error Logging
function handleError(err) {
	console.log(err.toString());
	this.emit('end');
}

// TODO
var filesToMove = [

];

// TODO
gulp.task('jscopy', function() {
//	gulp.src(filesToMove)
		//.pipe(gulp.dest(paths.build + 'js/vendor/'))
});

// JS Hint
gulp.task('jshint', function() {
	gulp.src(paths.js + addonName + '.js')
		.on('error', handleError)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
});

// File Include
gulp.task('fileInclude', function() {
	gulp.src(paths.js + 'plugins.js')
		.pipe(include())
		.pipe(rename( 'plugins.combined.js' ))
		.pipe(gulp.dest(paths.js + 'build'))
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
	gulp.src([
		paths.js + 'build/plugins.combined.js',
		paths.js + addonName + '.js'
	])
		.pipe(concat(addonName + '.js'))
		.pipe(rename( addonName + '.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.js + 'build'))
		.pipe(notify('JS Compiled'))
});

// SCSS
gulp.task('styles', function() {
	return sass(paths.scss + addonName + '.scss', {
		sourcemaps: false,
		style: 'compressed'
	})
	//.pipe(debug({verbose: true}))
	.on('error', function (err) { console.log(err.message); })
	.pipe(gulp.dest(paths.css))
	.pipe(notify('SCSS Processed'))
});

// Image Minifying
gulp.task('imagemin', function() {
	var imgSrc = paths.img + '**/*',
		imgDst = paths.build + 'img'
	;

	gulp.src(imgSrc)
		.pipe(changed(imgDst))
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [
				{ collapseGroups            : false },
				{ removeUnknownsAndDefaults : false },
				{ removeUselessStrokeAndFill: false },
				{ removeViewBox             : false }
			],
			use: [pngcrush()]
		}))
		.pipe(gulp.dest(imgDst))
		.pipe(notify('Images Optimized'))
});

// Watch
gulp.task('watch', function() {
	gulp.watch(paths.js + addonName + '.js', ['jshint', 'scripts']);
	gulp.watch(paths.js + 'plugins.js', ['fileInclude', 'scripts']);
	gulp.watch(paths.scss + '**/*.scss', ['styles']);
	gulp.watch(paths.img + '**/*.*', ['imagemin']);
	livereload.listen();
	gulp.watch([paths.build + '**', '!' + paths.build + 'css/*.css.map']).on('change', livereload.changed); // Live reload if anything in /assets/build changes
});

// Default Task
gulp.task('default', ['jshint', 'scripts', 'styles', 'imagemin', 'fileInclude', 'watch']);