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
        test: 'test',
        
        target: 'target',
        targetDist: '<%= target %>/dist',
        targetMin: '<%= target %>/minDist',
        targetConcat: '<%= target %>/concat',
        targetTest: '<%= target %>/test',
        
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
        
        // validate target
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                '<%= src %>/scripts/{,*/}*.js'
            ]
        },
        bower: {
            install: {
                options: {
                    cleanup: false,
                    copy: false
                }
            }
        },
        
        // generateSources target
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
        // ngAnnotate creates the initial min.js file
        ngAnnotate: {
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
        cdnify: {
            google: {
                options: {
                    cdn: require('google-cdn-data')
                },
                html: ['<%= targetMin %>/index.html']
            },
            cdn: {
                options: {
                    cdn: require('cdnjs-cdn-data')
                },
                html: ['<%= targetMin %>/index.html']
            },
            jsdelivr: {
                options: {
                    cdn: require('jsdelivr-cdn-data')
                },
                html: ['<%= targetMin %>/index.html']
            },
            custom: {
                options: {
                    cdn: {
                        angular: {
                            versions: ['1.2.25'],
                            url: function (version) {
                               return '//ajax.googleapis.com/ajax/libs/angularjs/' + version + '/angular.min.js';
                            }
                        },
                        'angular-resource': {
                            versions: ['1.2.25'],
                            url: function (version) {
                               return '//ajax.googleapis.com/ajax/libs/angularjs/' + version + '/angular-resource.min.js';
                            }
                        },
                        bootstrap : {
                            versions: ['3.1.1'],
                            url: function (version) {
                                return '//maxcdn.bootstrapcdn.com/bootstrap/' + version + '/js/bootstrap.min.js';
                            }
                        }
                    }
                },
                html: ['<%= targetMin %>/index.html']
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
                    removeComments: true,
                    removeCommentsFromCDATA: true,
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    removeOptionalTags: true,
                    removeIgnored: true,
                    //lint: true,
                    minifyJs: {
                mangle: true,
                compress: true,
                sourceMap: true
            },
                    minifyCss: true
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
                options: {
                    files: [
                        '<%= targetDist %>/**/*.js',
                        '<%= test %>/**/*.js'
                    ]
                },
                configFile: 'karma.conf.js',
                singleRun: true
            }
        }
    });

    
    /*
     * =============================================================================================================
     * ============================================= TASK SECTION ==================================================
     * =============================================================================================================
     */
    
    grunt.task.renameTask('clean', 'doclean');
    grunt.task.renameTask('concat', 'concat_js');
    
    /* 
     * unfortunately we cannot access the task registry so we don't know what is actually queued and we don't know 
     * which tasks actually configured the dependency so we have to force users to actively declare what task is the
     * invoking task, resulting in something like this:
     * 
     * 'depend:<taskDependency>:<taskDependency>:...:<invokingTask>'
     */
    grunt.registerTask('depend', function () {
        var doExecute, i, invokingTask, j, task;
        
        if(!grunt.executedDependencies) {
            grunt.executedDependencies = [];
        }
        
        if(arguments.length === 1) {
            grunt.fail.fatal('invalid dependency configuration, did you provide the invoking task?');
        }
        
        invokingTask = arguments[arguments.length - 1];
        
        if (!grunt.task.exists(invokingTask)) {
            grunt.fail.fatal('invalid dependency configuration, the invoking task does not exist: ' + invokingTask);
        }
        
        grunt.executedDependencies.push(invokingTask);
        
        for (i = 0; i < arguments.length - 1; ++i) {
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
    
    /*
     * cdnify does not support css (yet?) -.-
     */
    grunt.registerTask('cdnifyCss', function () {
        var bowerJson, bootstrapVersion, indexhtml, match, regex;
        
        indexhtml = grunt.file.read('./' + grunt.config.get('targetMin') + '/index.html');
        bowerJson = require('./bower.json');
        if (bowerJson.dependencies) {
            bootstrapVersion = bowerJson.dependencies.bootstrap;
            
            if (bootstrapVersion) {
                grunt.log.writeln('found bootstrap dependency, cdnify: ' + bootstrapVersion);
                indexhtml = indexhtml.replace(
                    /bower_components.+bootstrap(\.min)?\.css/, 
                    "//maxcdn.bootstrapcdn.com/bootstrap/" + bootstrapVersion + "/css/bootstrap.min.css");
                grunt.file.write('./' + grunt.config.get('targetMin') + '/index.html', indexhtml);
            } else {
                grunt.log.writeln('Nothing to do');
            }
        }
    });
    
    /*
     * cdnify may not know the versions already or has some other trouble so we copy the minified versions to the min 
     * dist and update the index.html
     */
    grunt.registerTask('copyUncdnified', function () {
        var copypath, indexhtml, match, minpath, path, regex;
        
        indexhtml = grunt.file.read('./' + grunt.config.get('targetMin') + '/index.html');

        regex = /="(bower_components\/)([^\/]+)(.+)(\.js|\.css)"/g;
        match = regex.exec(indexhtml);
        
        if (match === null) {
            grunt.log.writeln('NICE, no uncdnified libraries');
        } else {
            grunt.log.writeln('found uncdnified libraries, copying to minified distribution');
        }
        
        while (match !== null) {
            path = match[1] + match[2] + match[3];
            minpath = match[1] + '.min' + match[2];
            
            if (grunt.file.exists(grunt.config.get('targetDist') + '/' + minpath)) {
                copypath = minpath;
            } else {
                grunt.log.error('minified version not available, using regular one: ' + path);
                copypath = path;
            }
            
            grunt.verbose.writeln('copy ' + copypath + ' to minified distribution')
            grunt.file.copy(
                grunt.config.get('targetDist') + '/' + copypath, 
                grunt.config.get('targetMin') + '/' + copypath);
                
            indexhtml = indexhtml.replace(path, copypath);
            match = regex.exec(indexhtml);
        }
        
        grunt.file.write('./' + grunt.config.get('targetMin') + '/index.html', indexhtml);
    });
    
    grunt.registerTask('checkDependencies', function () {
        var filename, lastCheck, now;
        
        filename = '.checkDependencies';
        
        if(!grunt.file.exists(filename)) {
            grunt.file.write(filename, '{}');
        }
        
        lastCheck = grunt.file.readJSON(filename).lastCheck;

        if (lastCheck === undefined || lastCheck === null) {
            lastCheck = 0;
        }
        
        now = Date.now();
        
        if (now - lastCheck > 1000 * 60 * 60) {
            grunt.log.writeln('last check over an hour ago, checking dependencies');
            grunt.task.run(['npm-install', 'bower:install']);
        } else {
            grunt.log.writeln('last check less than an hour ago, skipping dependency check');
        }
        
        grunt.file.write(filename, JSON.stringify({lastCheck: now}));
    });
    
    grunt.registerTask('clean', [
        'doclean:target'
    ]);
    
    grunt.registerTask('validate', [
        'checkDependencies',
        'jshint'
    ]);
    
    grunt.registerTask('generateSources', [
        'depend:validate:generateSources',
        'sync:targetDist',
        'autoprefixer'
    ]);
    
    grunt.registerTask('build', [
        'depend:test:build'
    ]);
    
    grunt.registerTask('serve', [
        'depend:build:serve',
        'connect:serve',
        'watch'
    ]);
    
    grunt.registerTask('run', ['serve']);
    
    grunt.registerTask('concat', [
        'depend:build:concat',
        'concurrent:concat'
    ]);
    
    grunt.registerTask('prepareMin', [
       'depend:concat:prepareMin',
       'ngAnnotate',
       'ngtemplates:min',
       'replace:debugCode',
       'copy',
       'cdnify',
       'cdnifyCss',
       'copyUncdnified',
       'usemin'
    ]);
    
    grunt.registerTask('min', [
       'depend:prepareMin:min',
       'concurrent:min'
    ]);
    
    grunt.registerTask('package', [
       'depend:min:package'
    ]);

    // TODO: not implemented yet
    grunt.registerTask('test', [
        'depend:generateSources:test',
//        'connect:serve',
        //'karma'
    ]);

    grunt.registerTask('default', [
        'package'
    ]);
};
