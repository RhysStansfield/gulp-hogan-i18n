Pull the repo

```
  $ git clone git@github.com:RhysStansfield/gulp-hogan-i18n.git && cd gulp-hogan-i18n
```

```
  $ npm install
```

```
  $ gulp templates-i18n
```

Check out the /build directory - you will see compiled i18n templates per configured locale, as well as generated .po files for each locale

Try the app out:

```
  $ node index.js
```

Visit localhost:3005 to see a list of the available stores and move between them, then try out the pages links at the bottom of the page and click around between pages and returning to the home page.

Current stores you can try are:

* uk
* de
* fr
* es
* pt
* au
* ie

Try adding a store translating to another language if you like - just do the following:

1. Create a new json file for your locale in the locales dir
2. Add the locale to `supportedLocales.js`
3. Add the mapping between store code and locale in `index.js` in the `storeCodeToLocale` object
4. Run `gulp templates-i18n`
4. Restart the server
