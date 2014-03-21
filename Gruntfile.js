module.exports = function(grunt) {

	// Measures the time each task takes
	require('time-grunt')(grunt);

	// Load Grunt config
	require('load-grunt-config')(grunt);

};

// 'use strict';
// module.exports = function(grunt) {

// 	// Initialize config
// 	grunt.initConfig({
// 		pkg: require('./package.json'),
// 	});

// 	// Load per-task config from separate files
// 	grunt.loadTasks('grunt');

// 	// Register alias tasks
// 	grunt.registerTask('dev', ['connect', 'watch']);
// 	grunt.registerTask('build', ['concat', 'uglify', 'sass', 'imagemin', 'svgmin']);
// 	grunt.registerTask('default', ['dev']);

// };
