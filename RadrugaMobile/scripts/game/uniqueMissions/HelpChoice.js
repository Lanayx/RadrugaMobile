define(["require", "exports", "../../Enums", "../../Navigation", "../../Storage"], function (require, exports, enums, navigation, storage) {
    function navigate() {
        var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        model.maxTries = 1;
        storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
        navigation.navigateToRightAnswerView(enums.Direction.left);
    }
    exports.navigate = navigate;
});
