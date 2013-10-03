module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
      all: {
        files: {
          'dist/ws.js': ['lib/index.js'],
        },
        options: {
          standalone: 'rtree'
        }
      }
    },
	});
	grunt.loadNpmTasks('grunt-browserify');
	grunt.registerTask('default', ['browserify']);
};
