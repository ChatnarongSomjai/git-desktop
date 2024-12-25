cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-android-permissions.Permissions",
      "file": "plugins/cordova-plugin-android-permissions/www/permissions.js",
      "pluginId": "cordova-plugin-android-permissions",
      "clobbers": [
        "cordova.plugins.permissions"
      ]
    },
    {
      "id": "cordova-plugin-geolocation.geolocation",
      "file": "plugins/cordova-plugin-geolocation/www/android/geolocation.js",
      "pluginId": "cordova-plugin-geolocation",
      "clobbers": [
        "navigator.geolocation"
      ]
    },
    {
      "id": "cordova-plugin-geolocation.PositionError",
      "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
      "pluginId": "cordova-plugin-geolocation",
      "runs": true
    },
    {
      "id": "cordova-plugin-mock-location-checker.MockLocationChecker",
      "file": "plugins/cordova-plugin-mock-location-checker/www/MockLocationChecker.js",
      "pluginId": "cordova-plugin-mock-location-checker",
      "clobbers": [
        "cordova.plugins.mockLocationChecker"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-android-permissions": "1.1.5",
    "cordova-plugin-geolocation": "5.0.0",
    "cordova-plugin-mock-location-checker": "1.0.0"
  };
});