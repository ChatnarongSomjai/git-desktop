cordova.define("com.tanyakron.cordovadetectmocklocation.CordovaDetectMockLocationPlugin", function(require, exports, module) {
var exec = require('cordova/exec');

module.exports.detectMockLocation = function (success, error) {
    exec(success, error, 'CordovaDetectMockLocationPlugin', 'detectMockLocation', []);
};

});
