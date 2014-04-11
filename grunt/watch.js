module.exports = {

	scripts: {
		files: ['_add-ons/fileclerk/js/*.js', '!_add-ons/fileclerk/js/plugins/*.js', '!_add-ons/fileclerk/js/vendor/*.js'],
		tasks: ['newer:bake', 'newer:uglify', 'newer:jshint', 'notify:scripts'],
		options: {
			spawn: false,
			livereload: false
		}
	},
	scss: {
		files: ['_add-ons/fileclerk/scss/**/*.scss'],
		tasks: ['sass', 'notify:scss'],
	},
	css: {
		files: ['_add-ons/fileclerk/css/fileclerk.css'],
		tasks: ['newer:cssmin', 'notify:css'],
		options: {
			livereload: false
		}
	},
	images: {
		files: ['_add-ons/fileclerk/assets/img/**/*.{png,jpg,gif}'],
		tasks: ['newer:imagemin']
	},
	svg: {
		files: ['_add-ons/fileclerk/img/**/*.svg'],
		tasks: ['newer:svgmin']
	}

};
