module.exports = {

	build: {
		files: [{
			expand: true,
			cwd: '_add-ons/s3files/assets/img/',
			src: ['**/*.{png,jpg,gif}'],
			dest: '_add-ons/s3files/assets/img/build/'
		}]
	}

};
