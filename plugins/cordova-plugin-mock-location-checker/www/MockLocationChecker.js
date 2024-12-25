var exec = require('cordova/exec');

module.exports = {
    isMockLocation: function(successCallback, errorCallback) {
        exec(successCallback, errorCallback, 'MockLocationChecker', 'isMockLocation', []);
    }
};
