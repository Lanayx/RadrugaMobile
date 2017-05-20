var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/Enums", "../../../scripts/Storage", "../../../scripts/ServiceApi"], function (require, exports, appTools, navigation, enums, storage, serviceApi) {
    "use strict";
    var TextCreationModel = (function (_super) {
        __extends(TextCreationModel, _super);
        function TextCreationModel() {
            _super.call(this);
            this.missionId = "";
            this.missionImagePath = "";
            this.answer = "";
            this.sendForApprovalButtonRes = appTools.getText("slnSendForApproval");
            this.enterAnswerRes = appTools.getText("cmEnterAnswer");
            this.descriptionRes = appTools.getText("textCreationDescription");
            this._processStarted = false;
            _super.prototype.init.call(this, this);
        }
        TextCreationModel.prototype.onBack = function () {
            backButtonCallback();
        };
        TextCreationModel.prototype.onSendAnswer = function () {
            var _this = this;
            if (!this.get("answer"))
                return;
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            var missionProof = {
                CreatedText: this.get("answer")
            };
            var api = new serviceApi.ServiceApi();
            api.callService({
                method: "mission/CompleteMission?missionId=" + this.get("missionId"),
                requestType: "POST",
                data: JSON.stringify(missionProof)
            }).done(function (result) {
                if (result.Status === 0 && result.MissionCompletionStatus === enums.MissionCompletionStatus.Waiting) {
                    navigation.navigateToWaitView(enums.Direction.right, {
                        imageUrl: _this.get("missionImagePath"),
                        missionId: _this.get("missionId")
                    });
                }
                else
                    navigator.notification.alert(result.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        TextCreationModel.prototype.onBinded = function () {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
            this.set("missionImagePath", "url(" + model.imageUrl + ")");
            this.set("missionId", model.id);
        };
        return TextCreationModel;
    }(kendo.data.ObservableObject));
    exports.TextCreationModel = TextCreationModel;
    function bindModel() {
        var model = new TextCreationModel();
        kendo.bind($("#vTextCreationSolution"), model, kendo.mobile.ui);
        model.onBinded();
        appTools.viewBinded();
    }
    function backButtonCallback() {
        navigation.navigateToMissionView(enums.Direction.right);
    }
    var app = appTools.getApp();
    app.appInit.textCreationViewModelInit = function () {
        bindModel();
    };
    app.appInit.textCreationViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
        if (screen && screen.unlockOrientation)
            screen.unlockOrientation();
    };
    app.appInit.textCreationViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
        if (screen && screen.lockOrientation)
            screen.lockOrientation("portrait");
    };
});
