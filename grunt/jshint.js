module.exports = {

	options: {
		jshintrc: '.jshintrc',
		ignores: ['_add-ons/s3files/js/plugins.js','_add-ons/s3files/js/plugins.processed.js']
	},
	beforeconcat: ['_add-ons/s3files/js/*.js']

};
