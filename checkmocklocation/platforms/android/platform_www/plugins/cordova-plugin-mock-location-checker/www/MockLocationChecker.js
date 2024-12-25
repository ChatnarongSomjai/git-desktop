cordova.define("cordova-plugin-mock-location-checker.MockLocationChecker", function(require, exports, module) {
var exec = require('cordova/exec');

module.exports = {
    isMockLocation: function(successCallback, errorCallback) {
        exec(successCallback, errorCallback, 'MockLocationChecker', 'isMockLocation', []);
    }
};

});
