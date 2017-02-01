'use strict';

module.exports = function (grunt) {
    // Load tasks from grunt-* dependencies in package.json
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take
    require('time-grunt')(grunt);

    // Project configuration
    grunt.initConfig({
        exec: {
            emscripten: {
                cmd: function (arch) {
                    if (typeof arch === 'undefined') {
                        return 'python build.py'
                    } else {
                        return 'python build.py ' + arch;
                    }
                }
            }
        },
        uglify: {
            dist: {
                options: {
                    compress: true,
                },
                files: {
                    'dist/keystone.min.js': [
                        'src/**/*.js'
                    ]
                }
            }
        },
        concat: {
            dist: {
                src: [
                    'src/libkeystone<%= lib.suffix %>.out.js',
                    'src/keystone-wrapper.js'
                ],
                dest: 'dist/keystone<%= lib.suffix %>.min.js'
            }
        },
        connect: {
            options: {
                port: 9001,
                livereload: 35729,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true
                }
            }
        },
        watch: {
            livereload: {
                files: [
                    'index.html',
                    'dist/*.js'
                ],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
        }
    });

    // Project tasks
    grunt.registerTask('build', 'Build for specific architecture', function (arch) {
        if (typeof arch === 'undefined') {
            grunt.config.set('lib.suffix', '');
            grunt.task.run('exec:emscripten');
            grunt.task.run('concat');
        } else {
            grunt.config.set('lib.suffix', '-'+arch);
            grunt.task.run('exec:emscripten:'+arch);
            grunt.task.run('concat');
        }
    });
    grunt.registerTask('release', [
        'build',
        'build:aarch64',
        'build:arm',
        'build:hexagon',
        'build:mips',
        'build:powerpc',
        'build:sparc',
        'build:systemz',
        'build:x86',
    ]);
    grunt.registerTask('serve', [
        'connect',
        'watch'
    ]);
};
