Pull the repo

```
  $ git clone git@github.com:RhysStansfield/gulp-hogan-i18n.git && cd gulp-hogan-i18n
```

```
  $ npm install
```

```
  $ gulp compile-i18n-templates
```

Check out the /build directory - you will see compiled i18n templates per configured locale, as well as generated .po files for each locale

Try the app out:

```
  $ node index.js
```

Visit localhost:3005/test, localhost:3005/de/test, localhost:3005/weekdays & localhost:3005/de/weekdays to see the pre-compiled templates being rendered in different languages
