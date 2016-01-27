const fs = require('fs');
const exports = module.exports;
exports.extensions = {};
exports.extensionsInfo = {};
exports.errors = {};

let DO_ONCE = false;

if (!DO_ONCE) {
  fs.readFile('extensions/registeredExtensions.json', 'utf8', (err, file) => {
    const namespaces = JSON.parse(file);
    let name, extensions, path, namespace;
    for (namespace in namespaces) {
      extensions = namespaces[namespace];
      if (!(namespace in exports.extensions)) {
        exports.extensions[namespace] = {};
      }
      if (!(namespace in exports.extensionsInfo)) {
        exports.extensionsInfo[namespace] = {};
      }
      if (!(namespace in exports.errors)) {
        exports.errors[namespace] = {};
      }
      for (name in extensions) {
        try {
          path = extensions[name].path;
          exports.extensions[namespace][name] = require(path);
          exports.extensionsInfo[namespace][name] = require(path + '/package.json');
        } catch (exception) {
          exports.errors[namespace][name] = exception.message;
          console.log(exception.message);
        }
      }
    }
    DO_ONCE = true;
    console.log("Extensions loaded");
  });
}
