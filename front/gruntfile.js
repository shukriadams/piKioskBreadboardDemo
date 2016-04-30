module.exports = function(grunt) {

    'use strict';

   
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        bower: {
          default : { 
            options : {
              copy : false
            }
          }        
        },

        connect: {
            server: {
                options: {
                    keepalive :true,
                    port: 8001,
                    base: 'dev'
                }
            }
        },

        copy: {
            default : {
                files: [
                    { src: [ 'bower_components/jquery/dist/jquery.js'], dest : 'src/js/jquery.js', filter: 'isFile' },
                    { src: [ 'bower_components/fullPagejs/jquery.fullPage.css'], dest : 'src/css/jquery.fullPage.css', filter: 'isFile' },
                    { src: [ 'bower_components/fullPagejs/jquery.fullPage.js'], dest : 'src/js/jquery.fullPage.js', filter: 'isFile' }

                ]
            }
        },
        
        shell: {
            setup: {
            	options : {
                    execOptions : {
                        cwd : 'gloo',
                    },
                },
                command: ['npm install', 'bower install'].join('&&')
            }
        },

        hub: {
            gloo : {
                 src: ['gloo/gruntfile.js']
            }
            
        }

    });

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', ['copy']);

};