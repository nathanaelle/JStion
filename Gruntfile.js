module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			options: {
				separator:'',
				banner: '/*! JStion — <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			'build/JStion-<%= pkg.version %>.js'		:[ '_src/core/*.js'	],
			'build/JStion.UI-backbone-<%= pkg.version %>.js':[ '_src/backbone/*.js'	]
		},

		uglify: {
			'build/JStion.min.js': 'build/JStion-<%= pkg.version %>.js',
			'build/JStion.UI-backbone.min.js': 'build/JStion.UI-backbone-<%= pkg.version %>.js'
		},

		jshint: {
			files:[ 'build/JStion-<%= pkg.version %>.js', 'build/JStion.UI-backbone-<%= pkg.version %>.js' ]
		},

		karma: {
			options:{
				frameworks:	[ 'jasmine'	],
				exclude:	[ '*.js.ex'	],
				singleRun:	true,
				browsers:	[ 'PhantomJS'	],
				reporters:	[ 'progress'	],
				autoWatch:	false,
				captureTimeout: 60000
			},
			JStion:{
				src:		[],
				files:		[ '_dep/rollups/hmac-sha1.js', 'build/JStion.min.js', '_t/core/*.js' ],
			}

		}

	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-karma');

	grunt.registerTask('test'	,[ 'concat', 'jshint', 'uglify', 'karma' ]);
	grunt.registerTask('default'	,[ 'concat', 'uglify' ]);
};
