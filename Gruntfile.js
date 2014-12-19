module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			options: {
				separator:'',
				banner: '/*! JStion — <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			'build/JStion-<%= pkg.version %>.js'		:[ '_src/core/*.js'	],
			'build/JStion.Plans-<%= pkg.version %>.js'	:[ '_src/plan/*.js'	],
			'build/JStion.Exts-<%= pkg.version %>.js'	:[ '_src/ext/*.js'	],
			'build/JStion.UI-backbone-<%= pkg.version %>.js':[ '_src/backbone/*.js'	]
		},

		uglify: {
			'build/JStion.min.js'			: 'build/JStion-<%= pkg.version %>.js',
			'build/JStion.Plans.min.js'		: 'build/JStion.Plans-<%= pkg.version %>.js',
			'build/JStion.Exts.min.js'		:'build/JStion.Exts-<%= pkg.version %>.js',
			'build/JStion.UI-backbone.min.js'	: 'build/JStion.UI-backbone-<%= pkg.version %>.js'
		},

		jshint: {
			files:[
				'build/JStion-<%= pkg.version %>.js',
				'build/JStion.Plans-<%= pkg.version %>.js',
				'build/JStion.Exts-<%= pkg.version %>.js',
				'build/JStion.UI-backbone-<%= pkg.version %>.js'
			]
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
			JStion_behaviours:{
				src:		[],
				files:		[ '_dep/rollups/hmac-sha1.js', '_t/bind.js', 'build/JStion-<%= pkg.version %>.js', 'build/JStion.Plans-<%= pkg.version %>.js', 'build/JStion.Exts-<%= pkg.version %>.js', '_t/behaviours/*.js' ],
			},
			JStion_internals:{
				src:		[],
				files:		[ '_dep/rollups/hmac-sha1.js', '_t/bind.js', 'build/JStion-<%= pkg.version %>.js', 'build/JStion.Plans-<%= pkg.version %>.js', '_t/internals/*.js' ],
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
