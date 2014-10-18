module.exports = {

	compress: {
		options: {
			archive: 'fileclerk.zip',
			mode: 'zip',
			level: 1,
			pretty: true
		},
		files: [
			{src: ['_add-ons/fileclerk/assets/build/img/**.*']}, // Optimized images
			{src: ['_add-ons/fileclerk/css/fileclerk.min.css'], filter: 'isFile'}, // Minified CSS
			{src: ['_add-ons/fileclerk/js/build/**.js'], filter: 'isFile'}, // Minified JS
			{src: ['_add-ons/fileclerk/js/fileclerk.js'], filter: 'isFile'}, // Un-minified JS (for Dev env)
			{src: ['_add-ons/fileclerk/js/plugins.combined.js'], filter: 'isFile'}, // Un-minified Plugins JS (for Dev env)
			{src: ['_add-ons/fileclerk/views/**.html'], filter: 'isFile'}, // Fieldtype Views
			{src: ['_add-ons/fileclerk/config.php'], filter: 'isFile'}, // Config File
			{src: ['_add-ons/fileclerk/**.php'], filter: 'isFile'},

			{src: ['_add-ons/fileclerk/vendor/autoload.php'], filter: 'isFile'}, // Autoload file
			{src: ['_add-ons/fileclerk/vendor/composer/**/*']}, // Composer Files
			{src: ['_add-ons/fileclerk/vendor/guzzle/**/*']}, // Guzzle
			{src: ['_add-ons/fileclerk/vendor/symfony/**/*']}, // Symfony Finder, etc.
			{src: ['_add-ons/fileclerk/vendor/aws/aws-sdk-php/build/**/*']}, // AWS SDK Build Folder
			{src: ['_add-ons/fileclerk/vendor/aws/aws-sdk-php/src/Aws/Common/**/*']}, // AWS SDK S3 Library
			{src: ['_add-ons/fileclerk/vendor/aws/aws-sdk-php/src/Aws/S3/**/*']}, // AWS SDK S3 Library

			{src: ['_config/add-ons/fileclerk/fileclerk.yaml'], filter: 'isFile'}, // File Clerk main config
			{src: ['_config/add-ons/fileclerk/destinations/**.*']} // File Clerk Destination Example(s)
		]
	}

};
