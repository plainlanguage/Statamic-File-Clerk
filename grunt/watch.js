module.exports = {

	scripts: {
		files: ['_add-ons/s3files/js/**/*.js', '!_add-ons/s3files/js/plugins/*.js', '!_add-ons/s3files/js/vendor/*.js'],
		tasks: ['newer:bake', 'newer:concat', 'newer:uglify', 'newer:jshint', 'notify:scripts'],
		options: {
			spawn: false,
			livereload: true
		}
	},
	scss: {
		files: ['_add-ons/s3files/scss/**/*.scss'],
		tasks: ['sass', 'notify:scss'],
	},
	css: {
		files: ['_add-ons/s3files/css/s3files.css'],
		tasks: ['newer:cssmin', 'notify:css'],
		options: {
			livereload: true
		}
	},
	images: {
		files: ['_add-ons/s3files/assets/img/**/*.{png,jpg,gif}'],
		tasks: ['newer:imagemin']
	},
	svg: {
		files: ['_add-ons/s3files/img/**/*.svg'],
		tasks: ['newer:svgmin']
	}

};
