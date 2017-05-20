define(["require", "exports", "../../Enums", "../../Navigation"], function (require, exports, enums, navigation) {
    function navigate() {
        navigation.navigateToCommonPlaceView(enums.Direction.left, { showTries: true, maxTries: 1 });
    }
    exports.navigate = navigate;
});
