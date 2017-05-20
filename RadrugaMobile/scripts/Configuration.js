define(["require", "exports"], function (require, exports) {
    "use strict";
    var Configuration = (function () {
        function Configuration() {
        }
        Configuration.apiUrl = "https://radrugadev.azurewebsites.net/api/";
        Configuration.sendTelemetry = false;
        Configuration.tokenUrl = Configuration.apiUrl + "token";
        Configuration.identityUrl = Configuration.apiUrl + "useridentity";
        Configuration.vkVersion = "5.37";
        Configuration.vkTokenUrl = "https://oauth.vk.com/authorize?client_id=4452546&scope=friends,notify,offline,wall,photos&redirect_uri=https://oauth.vk.com/blank.html&display=mobile&v=" + Configuration.vkVersion + "&response_type=token";
        Configuration.vkApiUrl = "https://api.vk.com/method/";
        Configuration.enableRating = false;
        Configuration.baseGeolocationAccuracy = 5;
        Configuration.androidAutoFocusStubDelay = 300;
        return Configuration;
    }());
    exports.Configuration = Configuration;
});
