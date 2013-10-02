var path = require('path');

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		traceur: {
			all: {
				files: {
					'lib/': ['src/**/*.js'] // dest : [source files]
				}
			}

		}
	});
	grunt.registerMultiTask('traceur','compile it',function(){
	var done = this.async();
	    this.files.forEach(function(files){
	        var dst = files.dest;
	        grunt.file.mkdir(dst);
	         grunt.util.async.forEach(files.src,function(v,cb){
	            var base = path.basename(v);
	            grunt.util.spawn({
	                cmd:'traceur',
	                args:['--out', dst+base,'--experimental',v]
	            },function(err){
	                if(err){
	                    grunt.log.errorlns(err);
	                }else{
	                    grunt.log.oklns('wrote '+v+' to '+dst+base);
	                }
	            });
	         },function(err){
	            if(err){
	                done(false);
	            }else{
	                done();
	            }
	         });
	    });
	});
	grunt.registerTask('default', ['traceur']);
};
