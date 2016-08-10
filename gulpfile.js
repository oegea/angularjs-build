'use strict';
(function(){
    //Load gulp and required plugins
    var gulp = require('gulp'),
        concat = require('gulp-concat'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        maps = require('gulp-sourcemaps'),
        cleanCss = require('gulp-clean-css'),
        ngHtml2Js = require('gulp-ng-html2js'),
        del = require('del');
        
    var angularModuleName = "YourAppName";

    //Javascript files paths (app.js, controllers and services)
    var javascriptFiles = [
        'src/app.js',
        'src/modules/**/*.js',
        'dist/views.js'
    ];

    //Css files paths
    var cssFiles = [
        'src/css/*.css'
    ];

    //Views files paths
    var viewFiles = [
        'src/modules/**/*.html'
    ];

    //Removes "dist" directory and its files
    gulp.task('clean', function(){
        del('dist');
    });

    /**
     * Concatenates all AngularJS views in a unique javascript file
     */
    gulp.task('concatViews', function(){
        return gulp.src(viewFiles)
            .pipe(ngHtml2Js({moduleName: angularModuleName, prefix: 'modules/'}))
            .pipe(concat('views.js'))
            .pipe(gulp.dest('dist'))
    });

    /**
     * Concatenates all javascript files into a single app.js file. It depends on 'concatViews'
     */
    gulp.task('concatScripts', ['concatViews'], function(){
        return gulp.src(javascriptFiles)
            .pipe(maps.init())
            .pipe(concat('app.js'))
            .pipe(maps.write('./'))
            .pipe(gulp.dest("dist"));
    });

    /**
     * Minifies app.js concatenated file and store 
     */
    gulp.task('minifyScripts', ['concatScripts'], function(){
        gulp.src('dist/app.js')
            .pipe(uglify({mangle: false}))
            .pipe(rename('app.min.js'))
            .pipe(gulp.dest('dist'));

        //Finnally, delete views.js file
        return del(['dist/views.js']);
    });

    /**
     * Concatenates all css src files in a unique css file
     */
    gulp.task('concatCss', function(){
        return gulp.src(cssFiles)
            .pipe(maps.init())
            .pipe(concat('style.css'))
            .pipe(maps.write('./'))
            .pipe(gulp.dest("dist"));
    });

    /**
     * Minifies the css dist file. It depends on concatCss
     */
    gulp.task('minifyCss', ['concatCss'], function(){
        return gulp.src('dist/style.css')
            .pipe(cleanCss({compatibility: 'ie8'}))
            .pipe(rename('style.min.css'))
            .pipe(gulp.dest('dist'))

    });

    /**
     * Re-concatenate css or javascript files when changes are made
     */
    gulp.task('watchFiles', function(){
        gulp.watch(cssFiles,['concatCss']);
        gulp.watch(javascriptFiles,['concatScripts']);
        gulp.watch(viewFiles, ['concatScripts']);
    });

    //Task for starting watching for changes
    gulp.task('serve', ['watchFiles']);

    //Task for rebuild all application
    gulp.task('build', ['minifyScripts', 'minifyCss']);

    //If no task is specified, then we will delete dist folder, and recompile all again
    gulp.task('default', ['clean'], function(){
        gulp.start('build');
    });
}())
