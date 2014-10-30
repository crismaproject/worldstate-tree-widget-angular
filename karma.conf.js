// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
        'target/dist/bower_components/es5-shim/es5-shim.js',
        'target/dist/bower_components/json3/lib/json3.min.js',
        'target/dist/bower_components/jquery/dist/jquery.js',
        'target/dist/bower_components/angular/angular.js',
        'target/dist/bower_components/angular-resource/angular-resource.js',
        'target/dist/bower_components/angular-commons/dist/scripts/angular-commons.js',
        'target/dist/bower_components/bootstrap/dist/js/bootstrap.js',
        'target/dist/bower_components/jquery-ui/ui/jquery-ui.js',
        'target/dist/bower_components/dynatree/dist/jquery.dynatree.js',
        'target/dist/bower_components/icmm_js/dist/scripts/icmm_js.js',
        'target/dist/scripts/app.js',
        'target/dist/scripts/controllers/_module.js',
        'target/dist/scripts/controllers/main.js',
        'target/dist/scripts/controllers/worldstateTreeController.js',
        'target/dist/scripts/directives/_module.js',
        'target/dist/scripts/directives/catalogue-tree.js',
        'target/dist/scripts/directives/worldstateTree.js',
        'app/templates/catalogue-tree.html',
        'app/templates/worldstate-tree.html',
        'test/spec/directives/catalogue-tree.js',
        'test/spec/services/nodes.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,
    
    reporters: ['progress', 'junit'],
    junitReporter: {
        outputFile: 'test-results.xml'
    }
  });
};
