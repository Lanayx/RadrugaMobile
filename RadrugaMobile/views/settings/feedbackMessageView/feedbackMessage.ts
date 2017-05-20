/// <reference path="../../../scripts/tsDefinitions/custom/screen.d.ts" />
import navigation = require("../../../scripts/Navigation");
import appTools = require("../../../scripts/ApplicationTools");
import serviceApi = require("../../../scripts/ServiceApi");
import enums = require("../../../scripts/Enums");
import conf = require("../../../scripts/Configuration");

export class FeedbackMessageViewModel extends kendo.data.ObservableObject {
    feedbackMessageDescription = "";
    feedbackMessageDescriptionDisabled = false;
    feedbackSent = false;
    //resources 
    btnSendRes = appTools.getText("cmSend");
    feedbackMessageDescriptionRes = appTools.getText("feedbackMessageDescription");
    feedbackSentRes = appTools.getText("feedbackSent");
    constructor() {
        super();
        super.init(this);
    }

    sendFeedbackMessage() {
        if (!this.get("feedbackMessageDescription")) {
            return;
        }
        var api = new serviceApi.ServiceApi();
        api.callService({
            method: "Specials/PostMessageToDevelopers",
            requestType: "POST",
            data: '"' + this.get("feedbackMessageDescription") + '"'
        }).done((result) => {
                if (result.Status === 0) {
                    this.set("feedbackSent", true);
                }
            }).fail(() => {
                navigator.notification.alert(appTools.getText("cmApiError"),
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
    }
}


function bindBackButton() {
    $("#vFeedbackMessage").on("click", ".backIcon", backButtonCallback);
}

var viewModel;
function bindModel() {
    viewModel = new FeedbackMessageViewModel();
    kendo.bind($("#vFeedbackMessage"), viewModel, kendo.mobile.ui);

    appTools.viewBinded();
}

function backButtonCallback() {
    navigation.navigateToSettingsView(enums.Direction.left);
}

var app = appTools.getApp();
app.appInit.feedbackMessageViewModelInit = () => {
    bindBackButton();
};

app.appInit.feedbackMessageViewModelShow = () => {
    if (device.platform === "Android") {//stub for autofocus
        viewModel.set("feedbackMessageDescriptionDisabled", true);
        setTimeout(() => {
            viewModel.set("feedbackMessageDescriptionDisabled", false);
        }, conf.Configuration.androidAutoFocusStubDelay);
    }
    bindModel();
    document.addEventListener("backbutton", backButtonCallback, false);
    if (screen && screen.unlockOrientation)
        screen.unlockOrientation();
};
app.appInit.feedbackMessageViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
    if (screen && screen.lockOrientation)
        screen.lockOrientation("portrait");
};


