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
			cwd: '_add-ons/fileclerk/img/',
			src: ['**/*.svg'],
			dest: '_add-ons/fileclerk/img/build/'
		}]
	}

};
