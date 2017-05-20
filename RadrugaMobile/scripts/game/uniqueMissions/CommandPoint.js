define(["require", "exports", "../../Enums", "../../Navigation"], function (require, exports, enums, navigation) {
    "use strict";
    function navigate() {
        navigation.navigateToCommonPlaceView(enums.Direction.left, { showTries: false });
    }
    exports.navigate = navigate;
});
