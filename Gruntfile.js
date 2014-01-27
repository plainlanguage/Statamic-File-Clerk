/*global module:false*/
module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! =========================================================\n' +
		' * <%= pkg.name %> v<%= pkg.version %>\n' +
		' * <%= pkg.description %>\n' +
		' * <%= pkg.homepage %>\n' +
		' * =========================================================\n' +
		' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
		' *\n' +
		' * This file built on <%= grunt.template.today("yyyy-mm-dd") %>\n' +
		' * ========================================================= */',
		concat: {
			options: {
				separator: ';',
				banner: '<%= banner %>',
				stripBanners: true
			},
			dist: {
				src: [
				//'_add-ons/s3files/js/vendor/*.js',
				'_add-ons/s3files/js/s3files.js'
				],
				dest: '_add-ons/s3files/js/s3files.min.js'
			}
		},
		uglify: {
			options: {
				//banner: '<%= banner %>',
				preserveComments: 'some'
			},
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: '<%= concat.dist.dest %>'
			}
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				browser: true,
				globals: {}
			},
			gruntfile: {
				src: 'Gruntfile.js'
			}
		},
		sass: {
			dist: {
				options: {
					banner: '<%= banner %>',
					style: 'compressed',
				},
				files: {
					'_add-ons/s3files/css/s3files.css': '_add-ons/s3files/scss/s3files.scss'
				}
			}
		},
		sync: {
			main: {
				files: [
					{
						cwd: '_add-ons/s3files/',
						src: '**',
						dest: '/Users/chad/Sites/personal/sandbox.statamic.dev/httpdocs/_add-ons/s3files/'
					}
				]
			}
		},
		watch: {
			options: { livereload: true },
			css: {
				files: ['_add-ons/s3files/scss/**'],
				tasks: ['sass']
			},
			scripts: {
				files: ['!_add-ons/s3files/js/s3files.min.js', '_add-ons/s3files/js/**'],
				tasks: ['jshint', 'concat', 'uglify']
			},
			php: {
				files: ['_add-ons/s3files/**/*.*'],
				tasks: ['sync']
			}
		}
	});

grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-sass');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-sync');

// Default task.
grunt.registerTask('default', ['jshint', 'concat', 'sass', 'uglify', 'sync']);

};