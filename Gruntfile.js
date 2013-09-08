module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			options: {
				separator:'',
				banner: '/*! <%= pkg.name %> — <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			'build/<%= pkg.name %>-<%= pkg.version %>.js' : [ '_src/core/*.js' ],
			'build/<%= pkg.name %>.UI-backbone-<%= pkg.version %>.js' : [ '_src/backbone/*.js' ]
		},

		uglify: {
			'build/<%= pkg.name %>.min.js': 'build/<%= pkg.name %>-<%= pkg.version %>.js',
			'build/<%= pkg.name %>.UI-backbone.min.js': 'build/<%= pkg.name %>.UI-backbone-<%= pkg.version %>.js'
		},

		jshint: {
			files:[ 'build/<%= pkg.name %>-<%= pkg.version %>.js', 'build/<%= pkg.name %>.UI-backbone-<%= pkg.version %>.js' ],
			options:{

			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('test', [ 'concat', 'jshint' ]);
	grunt.registerTask('default', [ 'concat', 'uglify' ]);
};