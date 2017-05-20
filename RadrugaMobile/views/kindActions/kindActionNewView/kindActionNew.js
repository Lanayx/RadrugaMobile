var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/Navigation", "../../../scripts/camera/cameraTools", "../../../scripts/ApplicationTools", "../../../scripts/ServiceApi", "../../../scripts/Enums", "../../../scripts/Configuration", "../../../scripts/models/User"], function (require, exports, navigation, cameraTools, appTools, serviceApi, enums, conf, usr) {
    "use strict";
    var KindActionNewViewModel = (function (_super) {
        __extends(KindActionNewViewModel, _super);
        function KindActionNewViewModel() {
            _super.call(this);
            this._kindActionNewDescriptionMinLength = 20;
            this._kindActionNewDescriptionMaxLength = 400;
            this._processStarted = false;
            this.kindActionNewDescription = "";
            this.kindActionNewSubmitted = false;
            this.kindActionNewDescriptionDisabled = false;
            this.photoPath = "";
            this.kindScaleGained = "";
            this.coinsGained = "";
            this.photoTaken = false;
            //resources 
            this.btnCompleteRes = appTools.getText("kindActionNewComplete");
            this.btnCancelRes = appTools.getText("cmCancel");
            this.btnAnotherKindActionNewRes = appTools.getText("kindActionNewAnotherAction");
            this.kindActionNewDescriptionRes = appTools.getText("kindActionNewDescription");
            this.kindActionNewCompletedRes = appTools.getText("kindActionNewCompleted");
            _super.prototype.init.call(this, this);
        }
        KindActionNewViewModel.prototype.takePicture = function () {
            var _this = this;
            cameraTools.takePhoto().done(function (image) {
                _this.set("photoTaken", true);
                _this.set("photoPath", image.localUrl);
                _this.set("btnTakePictureRes", appTools.getText("cmRetakePhoto"));
            }).fail(function (message) {
                navigator.notification.alert(message, function () { }, appTools.getText("cameraErrorTitle"), 'OK');
            });
        };
        KindActionNewViewModel.prototype.submitKindActionNew = function () {
            var description = this.get("kindActionNewDescription");
            if (description.length < this._kindActionNewDescriptionMinLength) {
                navigator.notification.alert(appTools.getText("kindActionNewValidationShort"), function () { }, appTools.getText("cmWarning"), "OK");
                return;
            }
            if (description.length > this._kindActionNewDescriptionMaxLength) {
                navigator.notification.alert(appTools.getText("kindActionNewValidationLong"), function () { }, appTools.getText("cmWarning"), "OK");
                return;
            }
            //TO test this you need to create file test.jpg in your simulator storage
            var filePath = this.get("photoPath");
            //prevent double clicking
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            if (filePath) {
                this.submitKindActionNewWithImage(navigator.simulator ? "test.jpg" : filePath);
            }
            else {
                this.submitKindActionNewWithoutImage();
            }
        };
        KindActionNewViewModel.prototype.submitAnotherKindActionNew = function () {
            this.set("kindActionNewSubmitted", false);
        };
        KindActionNewViewModel.prototype.removePhoto = function () {
            this.set("photoPath", "");
            this.set("photoTaken", false);
        };
        //---------------------
        KindActionNewViewModel.prototype.submitKindActionNewWithImage = function (filePath) {
            var _this = this;
            var api = new serviceApi.ServiceApi();
            api.uploadFile({
                filePath: filePath,
                method: "kindAction/Post",
                fileName: "kindAction.jpg",
                params: {
                    KindActionDescription: encodeURIComponent(this.get("kindActionNewDescription")) //needed because we can't pass clear UTF
                }
            }).done(function (result) {
                var jsonResult = JSON.parse(result.response);
                if (jsonResult.Status === 0) {
                    _this.removePhoto();
                    _this.showResult(true);
                    _this.updateUser(jsonResult);
                }
                else
                    navigator.notification.alert(jsonResult.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        KindActionNewViewModel.prototype.submitKindActionNewWithoutImage = function () {
            var _this = this;
            var api = new serviceApi.ServiceApi();
            api.callService({
                method: "kindAction/PostWithoutImage",
                requestType: "POST",
                data: '"' + this.get("kindActionNewDescription") + '"' //quotes are hotfix for posting string value
            }).done(function (result) {
                if (result.Status === 0) {
                    _this.showResult(false);
                    _this.updateUser(result);
                }
                else
                    navigator.notification.alert(result.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        //TODO: need refactoring, for what use bonus parameter?
        KindActionNewViewModel.prototype.showResult = function (bonus) {
            this.set("coinsGained", "");
            this.set("kindScaleGained", "");
            this.set("kindActionNewSubmitted", true);
            this.set("kindActionNewDescription", "");
            appTools.forceRebind("KindActionList");
        };
        KindActionNewViewModel.prototype.updateUser = function (kindActionResult) {
            var user = usr.User.getFromStorage();
            var coinsGained = kindActionResult.Coins - user.coinsCount;
            var kindScaleGained = kindActionResult.KindScale - user.kindScale;
            if (coinsGained > 0) {
                this.set("coinsGained", "+" + coinsGained + " " + appTools.getText("kindActionNewCoins"));
                user.coinsCount = kindActionResult.Coins;
            }
            if (kindScaleGained > 0) {
                this.set("kindScaleGained", "+" + kindScaleGained + "% " + appTools.getText("kindActionNewReward"));
                user.kindScale = kindActionResult.KindScale;
            }
            if (kindScaleGained > 0 || coinsGained > 0) {
                usr.User.saveToStorage(user);
                appTools.forceRebind("Profile");
            }
            if (coinsGained > 0) {
                appTools.forceRebind("Account");
            }
        };
        return KindActionNewViewModel;
    }(kendo.data.ObservableObject));
    exports.KindActionNewViewModel = KindActionNewViewModel;
    var viewModel;
    function bindModel() {
        viewModel = new KindActionNewViewModel();
        kendo.bind($("#vKindActionNew"), viewModel, kendo.mobile.ui);
        appTools.viewBinded();
    }
    function bindCloseButton() {
        $("#vKindActionNew").on("click", ".closeIcon", backButtonCallback);
    }
    function backButtonCallback() {
        navigation.navigateToProfileView(enums.Direction.up);
    }
    var app = appTools.getApp();
    app.appInit.kindActionNewViewModelInit = function () {
        bindModel();
        bindCloseButton();
    };
    app.appInit.kindActionNewViewModelShow = function () {
        if (device.platform === "Android") {
            viewModel.set("kindActionNewDescriptionDisabled", true);
            setTimeout(function () {
                viewModel.set("kindActionNewDescriptionDisabled", false);
            }, conf.Configuration.androidAutoFocusStubDelay);
        }
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
        if (screen && screen.unlockOrientation)
            screen.unlockOrientation();
    };
    app.appInit.kindActionNewViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
        if (screen && screen.lockOrientation)
            screen.lockOrientation("portrait");
    };
});
