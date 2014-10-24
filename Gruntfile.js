'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        projectName: require('./bower.json').name || grunt.fail.fatal('cannot find project name in bower.json'),
        // TODO: find a way for more convenient configuration
        directivesMainModuleName: 'de.cismet.crisma.widgets.worldstateTreeWidget.directives',
        
        src: 'app',
        dist: 'dist',
        
        target: 'target',
        targetDist: '<%= target %>/dist',
        targetMin: '<%= target %>/minDist',
        targetConcat: '<%= target %>/concat',
        
        // clean target
        doclean: {
            target: {
                files: [{
                        dot: true,
                        src: [
                            '<%= target %>/*'
                        ]
                    }]
            }
        },
        
        // build target
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                '<%= src %>/scripts/{,*/}*.js'
            ]
        },
        sync: {
            targetDist: {
                files: [{
                    cwd: '<%= src %>',
                    src: ['**'],
                    dest: '<%= targetDist %>'
                }]
            }
        },
        autoprefixer: {
            options: ['last 1 version'],
            gen_css: {
                files: [{
                        expand: true,
                        cwd: '<%= targetDist %>/styles/',
                        src: '{,*/}*.css',
                        dest: '<%= targetDist %>/styles/'
                    }]
            }
        },
        
        // run target
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            serve: {
                options: {
                    open: true,
                    base: [
                        '<%= targetDist %>'
                    ]
                }
            }/*,
            test: {
                options: {
                    port: 9001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= yeoman.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%= yeoman.dist %>'
                }
            }*/
        },
        watch: {
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: ['<%= src %>/**', '!<%= src %>/bower_components/**'],
                tasks: ['build']
            }
        },
        
        // several targets
        concurrent: {
            concat: [
                'concat_js',
                'concat_css',
                'ngtemplates:concat'
            ],
            min: [
                'imagemin',
                'svgmin',
                'cssmin',
                'uglify',
                'htmlmin'
            ]
        },
        
        // concat target
        concat_js: {
            js: {
                src: [
                    '<%= targetDist %>/scripts/**/*.js'],
                dest: '<%= targetConcat %>/scripts/<%= projectName %>.js'
            }
        },
        concat_css: {
            css: {
                src: ['<%= targetDist %>/styles/**/*.css'],
                dest: '<%= targetConcat %>/styles/<%= projectName %>.css'
            }
        },
        
        // prepareMin target
        // ngmin creates the initial min.js file
        ngmin: {
            min: {
                src: '<%= targetConcat %>/scripts/<%= projectName %>.js',
                dest: '<%= targetMin %>/scripts/<%= projectName %>.min.js'
            }
        },
        ngtemplates: {
            min: {
                options: {
                    module: '<%= directivesMainModuleName %>',
                    htmlmin: {
                        removeComments: true,
                        removeCommentsFromCDATA: true,
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true,
                        removeAttributeQuotes: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true,
                        removeOptionalTags: true
                    },
                    append: true
                },
                cwd: '<%= targetDist %>',
                src: 'templates/**.html',
                dest: '<%= targetMin %>/scripts/<%= projectName %>.min.js'
            },
            concat: {
                options: {
                    module: '<%= directivesMainModuleName %>'
                },
                cwd: '<%= targetDist %>',
                src: 'templates/**.html',
                dest: '<%= targetConcat %>/scripts/<%= projectName %>-tpl.js'
            }
        },
        // TODO: missing cdnify
        replace: {
            // we would like to use uglify but its dead code removal won't find the debug statements as they don't use a 
            // global var but an injected one, maybe reconsider debug config in the future
            debugCode: {
                // this is the concatenated file
                src: ['<%= targetMin %>/scripts/<%= projectName %>.min.js'],
                dest: ['<%= targetMin %>/scripts/<%= projectName %>.min.js'],
                replacements: [
                    // unfortunately we cannot simply match opening { and count other opening { and then match the last closing one
                    // if this is needed some time in the future, we have to match everything and process the text in a to-function
                    // 
                    {from: /if\s*\(\s*DEBUG\s*\)\s*\{\s*console\s*\.\s*log\s*\(\s*('|").*\1??\s*\)\s*;?\s*\}/g, to: ''}
                ]

            }
        },
        copy: {
            html: {
                preserveTimestamp: true,
                files: [{
                        expand: true,
                        dot: true,
                        cwd: '<%= targetDist %>',
                        dest: '<%= targetMin %>',
                        src: ['index.html', 'views/*.html']
                    }]
            }
        },
        usemin: {
            html: '<%= targetMin %>/index.html',
            options: {
                blockReplacements: {
                    css: function (block) {
                        return '<link rel="stylesheet" href="styles/'+ grunt.config.get('projectName') + '.min.css">';
                    },
                    js: function (block) {
                        return '<script src="scripts/'+ grunt.config.get('projectName') + '.min.js"></script>';
                    }
                }
            }
        },
        
        // min target
        imagemin: {
            min: {
                files: [{
                        expand: true,
                        cwd: '<%= targetDist %>/images',
                        src: '{,*/}*.{png,jpg,jpeg}',
                        dest: '<%= targetMin %>/images'
                    }]
            }
        },
        svgmin: {
            min: {
                files: [{
                        expand: true,
                        cwd: '<%= targetDist %>/images',
                        src: '{,*/}*.svg',
                        dest: '<%= targetMin %>/images'
                    }]
            }
        },
        cssmin: {
            min: {
                src: '<%= targetConcat %>/styles/<%= projectName %>.css',
                dest: '<%= targetMin %>/styles/<%= projectName %>.min.css'
            }
        },
        uglify: {
            options: {
                mangle: true,
                compress: true,
                sourceMap: true
            },
            min: {
                src: '<%= targetMin %>/scripts/<%= projectName %>.min.js',
                dest: '<%= targetMin %>/scripts/<%= projectName %>.min.js'
            }
        },
        htmlmin: {
            min: {
                options: {
                    removeCommentsFromCDATA: true,
                    // TODO: fix
//                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true
                },
                files: [{
                        expand: true,
                        cwd: '<%= targetMin %>',
                        src: ['*.html', 'views/*.html'],
                        dest: '<%= targetMin %>'
                    }]
            }
        },
        
        // test target
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },
    });
    
    grunt.task.renameTask('clean', 'doclean');
    grunt.task.renameTask('concat', 'concat_js');
    
    grunt.registerTask('clean', [
        'doclean:target'
    ]);
    
    // TODO: detect the invoking task and add to execution list
    grunt.registerTask('depend', function() {
        var doExecute, i, j, task;
        
        if(!grunt.executedDependencies) {
            grunt.executedDependencies = [];
        }
        
        for (i = 0; i < arguments.length; ++i) {
            task = arguments[i];
            
            if (grunt.task.exists(task)) {
                doExecute = true;
                
                for (j = 0; j < grunt.executedDependencies.length; ++j) {
                    if (task === grunt.executedDependencies[j]) {
                        grunt.verbose.writeln('skipping task execution, already executed: ' + task);
                        doExecute = false;
                        break;
                    }
                }
                
                if(doExecute) {
                    grunt.verbose.writeln('executing dependency task: ' + task);
                    grunt.task.run(task);
                    grunt.executedDependencies.push(arguments[i]);
                }
                
            } else {
                grunt.log.error('ignoring invalid task: ' + task);
            }
        }
    });
    
    grunt.registerTask('build', [
        'jshint',
        'sync:targetDist',
        'autoprefixer'
    ]);
    
    grunt.registerTask('serve', [
        'depend:build',
        'connect:serve',
        'watch'
    ]);
    
    grunt.registerTask('run', ['serve']);
    
//    grunt.registerTask('concat', [
//        'depend:build',
//        'concurrent:concat'
//    ]);
    
//    grunt.registerTask('prepareMin', [
//       'depend:concat',
//       'ngmin',
//       'ngtemplates:min',
//       'replace:debugCode',
//       'copy',
//       'usemin'
//    ]);
    
//    grunt.registerTask('min', [
//       'depend:prepareMin',
//       'concurrent:min'
//    ]);
    
    // TODO: depend test
    grunt.registerTask('package', [
//       'concat',
//       'prepareMin',
//       'min'
        'depend:build',
        'concurrent:concat',
        'ngmin',
        'ngtemplates:min',
        'replace:debugCode',
        'copy',
        'usemin',
        'concurrent:min'
    ]);

    // TODO: not implemented yet
    grunt.registerTask('test', [
        'depend:build',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('default', [
        'package'
    ]);
};
