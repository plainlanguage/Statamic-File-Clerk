module.exports = {

	options: {
		full: true,
		plugins: [
			{ removeViewBox: false }
		]
	},
	build: {
		files: [{
			expand: true,
			cwd: '_add-ons/s3files/img/',
			src: ['**/*.svg'],
			dest: '_add-ons/s3files/img/build/'
		}]
	}

};
