module.exports = {

	compress: {
		main: {
			options: {
				archive: 'fileclerk.zip',
				mode: 'zip',
				level: 1,
				pretty: true
			},
			files: [
				{src: ['_add-ons/fileclerk/assets/build/img/'], dest: 'fileclerk/assets/build/img/'}, // Optimized images
				{src: ['_add-ons/fileclerk/css/fileclerk.min.css'], dest: 'fileclerk/css/', filter: 'isFile'}, // Minified CSS
				{src: ['_add-ons/fileclerk/js/build/'], dest: 'fileclerk/js/build/', filter: 'isFile'}, // Minified JS
				{src: ['_add-ons/fileclerk/views/'], dest: 'fileclerk/views/', filter: 'isFile'}, // Fieldtype Views
				{src: ['_add-ons/fileclerk/config.php'], dest: '_add-ons/fileclerk/', filter: 'isFile'}, // Config File
				{src: ['_add-ons/fileclerk/ft.fileclerk.php'], dest: '_add-ons/fileclerk/', filter: 'isFile'}, // Fieldtype File
				{src: ['_add-ons/fileclerk/hooks.fileclerk.php'], dest: '_add-ons/fileclerk/', filter: 'isFile'}, // Hooks File
				{src: ['_add-ons/fileclerk/pi.fileclerk.php'], dest: '_add-ons/fileclerk/', filter: 'isFile'}, // Plugin File
				{src: ['_add-ons/fileclerk/tasks.fileclerk.php'], dest: '_add-ons/fileclerk/', filter: 'isFile'} // Tasks File
			]
		}
	}

};
