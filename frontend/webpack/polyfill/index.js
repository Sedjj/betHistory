import "url-search-params-polyfill";
import "raf/polyfill"; // https://ru.react.js.org/docs/javascript-environment-requirements.html
import "core-js/features/reflect";
import "core-js/es/array";

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, "startsWith", {
    value: function (search, rawPos) {
      let pos = rawPos > 0 ? rawPos | 0 : 0;
      return this.substring(pos, pos + search.length) === search;
    },
  });
}
