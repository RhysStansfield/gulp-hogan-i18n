'use strict';

var gulp      = require('gulp');
var rename    = require('gulp-rename');
var hogani18n = require('hogan-i18n');
var es        = require('event-stream');
var fs        = require('fs');
var templates = __dirname + '/templates/**/*.html';
var through   = require('through');
var path      = require('path');
var gutil     = require('gulp-util');
var File      = gutil.File;
var exec      = require('child_process').exec;
var replace   = require('gulp-replace');

var _       = require('lodash-node');
var Gettext = require('node-gettext');
var gt      = new Gettext();

var supportedLocales = ['en', 'de'];

gulp.task('compile-i18n-templates', ['convert-locale-files', 'normalize-po-files'], function() {
  configureGettext();

  _.each(supportedLocales, function(locale) {
    gulp.src(templates)
        .pipe(compiler(locale))
        .pipe(concatenator(locale))
        .pipe(gulp.dest(__dirname + '/build/templates'));
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
  var fileContents = {
    en: fs.readFileSync(__dirname + '/build/locales/en.po'),
    de: fs.readFileSync(__dirname + '/build/locales/de.po')
  };

  _.each(fileContents, function(fileCont, locale) {
    gt.addTextdomain(locale, fileCont);
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

function concatenator(locale) {
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
      path:     './' + locale + '.js',
      contents: new Buffer(lines.join('\n'))
    }));

    this.emit('end');
  }
}
