'use strict';

var gulp      = require('gulp');
var rename    = require('gulp-rename');
var hogani18n = require('hogan-i18n');
var es        = require('event-stream');
var fs        = require('fs');
var through   = require('through');
var path      = require('path');
var gutil     = require('gulp-util');
var File      = gutil.File;
var exec      = require('child_process').exec;
var replace   = require('gulp-replace');
var sass      = require('gulp-sass');
var path      = require("path");

var themes          = ['red', 'blue'];
var templatesDir    = __dirname + '/templates';
var sharedPages     = templatesDir + '/shared/pages/**/*.html';
var sharedPartials  = templatesDir + '/shared/partials/**/*.html';
var sharedTemplates = {
  pages:    sharedPages,
  partials: sharedPartials
};

var _       = require('lodash-node');
var Gettext = require('node-gettext');
var gt      = new Gettext();


var supportedLocales = require('./supportedLocales');

gulp.task('sass', function() {
  gulp.src(__dirname + '/styles/**/*.scss')
      .pipe(sass())
      .pipe(rename({ basename: 'app' }))
      .pipe(gulp.dest(__dirname + '/build/css'));
});

gulp.task('compile-i18n-templates', ['convert-locale-files', 'normalize-po-files'], function() {
  configureGettext();

  var defaultTemplates, themeTemplates;

  _.each(['pages', 'partials'], function(type) {
    _.each(themes, function(theme) {
      _.each(supportedLocales, function(locale) {
        defaultTemplates = sharedTemplates[type];
        themeTemplates   = templatesDir + '/' + theme + '/' + type + '/**/*.html';

        gulp.src([defaultTemplates, themeTemplates])
            .pipe(compiler(locale))
            .pipe(concatenator(locale, theme, type))
            .pipe(gulp.dest(__dirname + '/build/templates'));
      });
    });
  });
});

gulp.task('convert-locale-files', function(cb) {
  var src, targDir, target, execStr, index = 0;
  var supportedLocalesLength = supportedLocales.length - 1;

  _.each(supportedLocales, function(locale) {
    src     = __dirname + '/locales/' + locale + '.json';
    targDir = __dirname + '/build/locales/'
    target  = targDir + locale + '.po';
    execStr = 'i18next-conv -l ' + locale + ' -s ' + src + ' -t ' + target;

    exec(execStr, function(err) {
      if (index === supportedLocalesLength) {
        return cb();
      }

      index++;
    });
  });
});

gulp.task('normalize-po-files', ['convert-locale-files'], function() {
  var stream = gulp.src(__dirname + '/build/locales/**/*.po')
      .pipe(replace('##', '.'))
      .pipe(gulp.dest(__dirname + '/build/locales'));

  return stream;
});

gulp.task('templates-i18n', ['convert-locale-files', 'compile-i18n-templates']);

function configureGettext() {
  var fileContent;

  _.each(supportedLocales, function(locale) {
    fileContent = fs.readFileSync(__dirname + '/build/locales/' + locale + '.po');

    gt.addTextdomain(locale, fileContent);
  });
}

function compiler(locale) {
  var gettext = function(str) {
    return gt.dgettext(locale, str)
  };

  return es.map(function(file, cb) {
    var content = hogani18n.compile(String(file.contents), { asString: true }, gettext);

    file.contents = new Buffer(content);
    return cb(null, file);
  });
}

function concatenator(locale, theme, type) {
  var templates = {};

  return through(filesBuffer, endStream);

  function filesBuffer(file) {
    var fileName = path.basename(file.path, '.html');

    templates[fileName] = file.contents.toString('utf8');
  }

  function endStream() {
    var lines = [];

    lines.push('module.exports = (function() {');
    lines.push('  var Hogan = require(\'hogan\');');
    lines.push('  var templates = {};');

    for (var name in templates) {
      lines.push('  templates[\'' + name + '\'] = new Hogan.Template(' + templates[name] + ');');
    }

    lines.push('  return templates;');
    lines.push('})();');

    this.emit('data', new File({
      cwd:      './',
      path:     './' + theme + '/' + locale + '/' + type + '.js',
      contents: new Buffer(lines.join('\n'))
    }));

    this.emit('end');
  }
}
