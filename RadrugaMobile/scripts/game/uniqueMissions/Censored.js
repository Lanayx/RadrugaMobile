define(["require", "exports", "../../Enums", "../../Navigation"], function (require, exports, enums, navigation) {
    function navigate() {
        navigation.navigateToVideoView(enums.Direction.left);
    }
    exports.navigate = navigate;
});
