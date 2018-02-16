'use strict';

module.exports = function(grunt) {
	const HTTP_PORT = 9001;
	const RELOAD_PORT = 9002;
	
	// init config
	grunt.initConfig({
		'connect': {
			'dev': {
				'options': {
					'hostname': "127.0.0.1",
					'port': HTTP_PORT,
					'base': "src",
					'index': "index.html",
					'livereload': RELOAD_PORT,
					'open': true
				}
			}
		},
		'watch': {
			'options': {
				'livereload': RELOAD_PORT
			},
			'dev': {
				'files': [
					"src/**/*.js",
					"src/**/*.css",
					"src/**/*.html",
					"src/**/*.png",
					"src/**/*.jpg",
					"src/**/*.gif"
				]
			}
		}
	});
	
	// load grunt plugin tasks
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	
	// default task
	grunt.registerTask('default', [
		"connect",
		"watch"
	]);
	
};
