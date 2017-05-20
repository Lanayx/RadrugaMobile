define(["require", "exports", "../../Enums", "../../Navigation"], function (require, exports, enums, navigation) {
    "use strict";
    function navigate() {
        navigation.navigateToCommonPlaceView(enums.Direction.left, { showTries: true, maxTries: 10 });
    }
    exports.navigate = navigate;
});
