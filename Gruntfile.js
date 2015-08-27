module.exports = function(grunt) {
    grunt.initConfig({
        ngtemplates:    {
            app:          {
                src: [
                    'partials/**.html'
                ],
                dest: '../Target/temp/templates.js',
                options:    {
                    htmlmin:  { collapseWhitespace: true, collapseBooleanAttributes: true },
                    module: 'MainApp',
                    prefix: '/'
                }
            }
        },
        concat: {
            options: {
            },
            basic: {
              src: [
                'core/public/js/main.public.module.js', 
                'core/public/js/main.public.controllers.js', 
                'core/public/js/main.public.directives.js', 
                'core/public/js/main.public.services.js', 

                'core/public/js/Modules/Player/*js',
                'core/public/js/Modules/Popup/*js',
                'core/public/js/Modules/Socket/*js',
                'core/public/js/Modules/Spinner/*js',
                'events/public/js/*js',
                'friends/public/*js',

                'playlists/public/js/playlist.public.module.js',
                'playlists/public/js/playlist.public.controller.js',
                'playlists/public/js/playlist.public.service.js',

                'sharedPlaylists/public/*js',
                'sharedPlaylists/public/controllers/*js',
                'sharedPlaylists/public/directives/*js',
                'sharedPlaylists/public/services/*js',

                '../Target/temp/templates.js'
              ],
              dest: '../Target/temp/app.js'
            },
            extras: {
              src: [
                'guest/*js',
                'core/public/js/Modules/Player/*js',
                'core/public/js/main.public.services.js'
              ],
              dest: '../Target/temp/guest.js'
            }
        },

        strip: {
            main: {
                src: '../Target/temp/app.js',
                dest: '../Target/temp/app.js'
            }
        },

        uglify: {
            options: {
                banner: '/*! Music App - v0.1 - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            public_app_target: {
                files: {
                    '../Target/public/js/app/app.min.js': [
                      '../Target/temp/app.js'
                    ]
                }
            },
            public_guest_target: {
                files: {
                    '../Target/public/js/app/guest.min.js': [
                      '../Target/temp/guest.js'
                    ]
                }
            }
        },

        //SERVER
        copy: {
            main: {
                files: [
                  // Partials
                  { cwd: 'core/public/partials', src: '**', dest: '../Target/public/partials', expand: true },
                  { cwd: 'core/public/js/Modules/Player', src: '*.html', dest: '../Target/public/partials', expand: true },
                  { cwd: 'core/public/js/Modules/Popup', src: '*.html', dest: '../Target/public/partials', expand: true },
                  { cwd: 'events/public/partials', src: '**', dest: '../Target/public/partials', expand: true },
                  { cwd: 'friends/public/partials', src: '**', dest: '../Target/public/partials', expand: true },
                  { cwd: 'playlists/public/partials', src: '**', dest: '../Target/public/partials', expand: true },
                  { cwd: 'sharedPlaylists/public/partials', src: '**', dest: '../Target/public/partials', expand: true },
                  // css
                  { cwd: 'core/public/css', src: '**/*', dest: '../Target/public/css', expand: true },
                  // img
                  { cwd: 'core/public/img', src: '**', dest: '../Target/public/img', expand: true },
                  // -- SERVER --
                  { cwd: '', src: ['package.json','server.js'], dest: '../Target/server', expand: true},
                  { cwd: 'core/server', src: ['**/*', '!**/*express.js', '!**/*.ejs', '!pages/*.html'], dest: '../Target/server/core/server', expand: true},
                  { cwd: 'events/server', src: ['**/*'], dest: '../Target/server/events/server', expand: true},
                  { cwd: 'playlists/server', src: ['**/*'], dest: '../Target/server/playlists/server', expand: true},
                  { cwd: 'sharedPlaylists/server', src: ['**/*'], dest: '../Target/server/sharedPlaylists/server', expand: true}
                ]
            },
            templates: {
              files: [
                  { cwd: 'core/public/partials', src: '**', dest: 'partials', expand: true },
                  { cwd: 'core/public/js/Modules/Player', src: '*.html', dest: 'partials', expand: true },
                  { cwd: 'core/public/js/Modules/Popup', src: '*.html', dest: 'partials', expand: true },
                  { cwd: 'events/public/partials', src: '**', dest: 'partials', expand: true },
                  { cwd: 'friends/public/partials', src: '**', dest: 'partials', expand: true },
                  { cwd: 'playlists/public/partials', src: '**', dest: 'partials', expand: true },
                  { cwd: 'sharedPlaylists/public/partials', src: '**', dest: 'partials', expand: true },
              ]
            },
            all: {
              files: [
                  { cwd: 'core/server', src: ['**/*', '!**/*express.js', '!**/*.ejs', '!pages/*.html'], dest: '../Target/server/core/server', expand: true},

                  { cwd: '../Target/server/events/server/', src: '**', dest: '../../../../Apps/Heroku/MusicCenter/events/server', expand: true },
                  { cwd: '../Target/server/playlists/server/', src: '**', dest: '../../../../Apps/Heroku/MusicCenter/playlists/server', expand: true },
                  { cwd: '../Target/server/sharedPlaylists/', src: '**', dest: '../../../../Apps/Heroku/MusicCenter/sharedPlaylists', expand: true },

                  { cwd: '../Target/server', src: 'server.js', dest: '../../../../Apps/Heroku/MusicCenter/', expand: true },

                  { cwd: '../Target/public/', src: '**', dest: '../../../../Apps/Heroku/MusicCenter/public', expand: true }
              ]
            }
        }
    });

    /*

        PUBLIC  UPDATE
          1) grunt copy:templates
          2) grunt ngtemplates
          3) grunt concat
          4) grunt strip
          5) grunt uglify

        SERVER UPDATE
          1) grunt copy:main

        COPY ACROSS
          1) grunt copy:all

    */

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy'); // load the given tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-strip');


    grunt.registerTask('default', ['concat']);
    //grunt.registerTask('default', ['uglify', 'copy']); // Default grunt tasks maps to grunt
};