var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/Navigation", "../../../scripts/ApplicationTools", "../../../scripts/ServiceApi", "../../../scripts/Enums", "../../../scripts/Configuration"], function (require, exports, navigation, appTools, serviceApi, enums, conf) {
    "use strict";
    var FeedbackMessageViewModel = (function (_super) {
        __extends(FeedbackMessageViewModel, _super);
        function FeedbackMessageViewModel() {
            _super.call(this);
            this.feedbackMessageDescription = "";
            this.feedbackMessageDescriptionDisabled = false;
            this.feedbackSent = false;
            //resources 
            this.btnSendRes = appTools.getText("cmSend");
            this.feedbackMessageDescriptionRes = appTools.getText("feedbackMessageDescription");
            this.feedbackSentRes = appTools.getText("feedbackSent");
            _super.prototype.init.call(this, this);
        }
        FeedbackMessageViewModel.prototype.sendFeedbackMessage = function () {
            var _this = this;
            if (!this.get("feedbackMessageDescription")) {
                return;
            }
            var api = new serviceApi.ServiceApi();
            api.callService({
                method: "Specials/PostMessageToDevelopers",
                requestType: "POST",
                data: '"' + this.get("feedbackMessageDescription") + '"'
            }).done(function (result) {
                if (result.Status === 0) {
                    _this.set("feedbackSent", true);
                }
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
        };
        return FeedbackMessageViewModel;
    }(kendo.data.ObservableObject));
    exports.FeedbackMessageViewModel = FeedbackMessageViewModel;
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
    app.appInit.feedbackMessageViewModelInit = function () {
        bindBackButton();
    };
    app.appInit.feedbackMessageViewModelShow = function () {
        bindModel();
        if (device.platform === "Android") {
            viewModel.set("feedbackMessageDescriptionDisabled", true);
            setTimeout(function () {
                viewModel.set("feedbackMessageDescriptionDisabled", false);
            }, conf.Configuration.androidAutoFocusStubDelay);
        }
        document.addEventListener("backbutton", backButtonCallback, false);
        if (screen && screen.unlockOrientation)
            screen.unlockOrientation();
    };
    app.appInit.feedbackMessageViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
        if (screen && screen.lockOrientation)
            screen.lockOrientation("portrait");
    };
});
