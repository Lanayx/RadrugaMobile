var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/camera/cameraTools", "../../../scripts/Enums", "../../../scripts/Storage", "../../../scripts/ServiceApi", "../../../scripts/models/User"], function (require, exports, appTools, navigation, cameraTools, enums, storage, serviceApi, user) {
    "use strict";
    var ShowYourselfModel = (function (_super) {
        __extends(ShowYourselfModel, _super);
        function ShowYourselfModel() {
            _super.call(this);
            this.missionId = "";
            this.missionName = "";
            this.missionImagePath = "";
            this.readyButton = appTools.getText("cmReady");
            this._processStarted = false;
            _super.prototype.init.call(this, this);
        }
        ShowYourselfModel.prototype.onCancel = function () {
            backButtonCallback();
        };
        ShowYourselfModel.prototype.takePicture = function () {
            var _this = this;
            cameraTools.takePhoto().done(function (image) {
                _this._avatarRawUrl = image.localUrl;
                _this.set("avatarUrl", "url(" + image.localUrl + ")");
            }).fail(function (message) {
                navigator.notification.alert(message, function () { }, appTools.getText("cameraErrorTitle"), "OK");
            });
        };
        ShowYourselfModel.prototype.onRemovePhoto = function (event) {
            this._avatarRawUrl = undefined;
            this.set("avatarUrl", undefined);
        };
        ShowYourselfModel.prototype.onReadySend = function () {
            var _this = this;
            if (!this._avatarRawUrl)
                return;
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            var api = new serviceApi.ServiceApi();
            var avatarUrl;
            api.uploadFile({
                filePath: navigator.simulator ? "test.jpg" : this._avatarRawUrl,
                method: "user/UploadAvatar",
                fileName: "avatar.jpg"
            }).then(function (result) {
                var response = JSON.parse(result.response);
                if (response.Status === 0) {
                    var missionProof = {};
                    avatarUrl = response.Url;
                    return api.callService({
                        method: "mission/CompleteMission?missionId=" + _this.get("missionId"),
                        requestType: "POST",
                        data: JSON.stringify(missionProof)
                    });
                }
                else {
                    var def = $.Deferred();
                    def.resolve({
                        Status: 1,
                        Description: response.Description
                    });
                    return def;
                }
            }).done(function (missionResult) {
                if (missionResult.Status === 0 && missionResult.MissionCompletionStatus === enums.MissionCompletionStatus.Success) {
                    var u = user.User.getFromStorage();
                    u.avatarUrl = avatarUrl;
                    user.User.saveToStorage(u);
                    navigation.navigateToSucessView(enums.Direction.right, {
                        missionId: _this.get("missionId"),
                        imageUrl: _this.get("missionImagePath"),
                        experiencePoints: missionResult.Points,
                        missionName: _this.get("missionName"),
                        starsCount: missionResult.StarsCount,
                        congratsMessage: appTools.getText("showYourSelfCongratMessage")
                    });
                }
                else {
                    navigator.notification.alert(missionResult.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                }
                _this._processStarted = false;
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        ShowYourselfModel.prototype.onBinded = function () {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
            this.set("missionImagePath", "url(" + model.imageUrl + ")");
            this.set("missionName", model.name);
            this.set("missionId", model.id);
        };
        return ShowYourselfModel;
    }(kendo.data.ObservableObject));
    exports.ShowYourselfModel = ShowYourselfModel;
    function bindModel() {
        var model = new ShowYourselfModel();
        kendo.bind($("#vShowYourself"), model, kendo.mobile.ui);
        model.onBinded();
        appTools.viewBinded();
    }
    function backButtonCallback() {
        navigation.navigateToMissionView(enums.Direction.right);
    }
    var app = appTools.getApp();
    app.appInit.showYourselfViewModelInit = function () {
        bindModel();
    };
    app.appInit.showYourselfViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.showYourselfViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
