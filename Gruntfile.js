module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		traceur: {
			all: {
				files: {
					'lib/': ['es6/**/*.js'] // dest : [source files]
				}
			}

		}
	});
	grunt.loadNpmTasks('grunt-traceur');
	grunt.registerTask('default', ['traceur']);
};