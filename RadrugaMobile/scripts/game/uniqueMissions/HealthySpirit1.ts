import enums = require("../../Enums");
import navigation = require("../../Navigation");

export function navigate() {
    navigation.navigateToRightAnswerView(enums.Direction.left, { showTries: false });
}