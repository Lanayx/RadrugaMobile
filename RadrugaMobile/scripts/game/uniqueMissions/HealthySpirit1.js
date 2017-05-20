define(["require", "exports", "../../Enums", "../../Navigation"], function (require, exports, enums, navigation) {
    function navigate() {
        navigation.navigateToRightAnswerView(enums.Direction.left, { showTries: false });
    }
    exports.navigate = navigate;
});
