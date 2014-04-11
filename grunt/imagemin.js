module.exports = {

	build: {
		files: [{
			expand: true,
			cwd: '_add-ons/fileclerk/assets/img/',
			src: ['**/*.{png,jpg,gif}'],
			dest: '_add-ons/fileclerk/assets/build/img'
		}]
	}

};
