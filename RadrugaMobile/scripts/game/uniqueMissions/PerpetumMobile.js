define(["require", "exports", "../../Enums", "../../Navigation"], function (require, exports, enums, navigation) {
    function navigate() {
        navigation.navigateToPerpetumMobileView(enums.Direction.left);
    }
    exports.navigate = navigate;
});
