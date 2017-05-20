/// <reference path="../../scripts/tsDefinitions/custom/navigator.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../scripts/ApplicationTools", "../../scripts/ImageCache", "../../scripts/models/User", "../../scripts/Storage", "../../scripts/ServiceApi", "../../scripts/camera/cameraTools", "../../scripts/Navigation", "../../scripts/Enums", "../../scripts/Authorization", "../../scripts/VkManager", "../../scripts/notifications/MissionNotification", "../../scripts/Configuration"], function (require, exports, appTools, imgCache, usr, storage, serviceApi, camera, navigation, enums, auth, vk, missionNotificaiton, conf) {
    "use strict";
    var SettingsViewModel = (function (_super) {
        __extends(SettingsViewModel, _super);
        function SettingsViewModel() {
            _super.apply(this, arguments);
            this.photoPath = "";
            this.nickName = "";
            this.vkNotAttached = false;
            this.emailNotAttached = false;
            this.notificationsEnabled = true;
            this.txtNickNameDisabled = false;
            //-----------------------
            this.nickNameRes = appTools.getText("cmNickName");
            this.attachVkRes = appTools.getText("settingsAttachVk");
            this.attachEmailRes = appTools.getText("settingsAttachEmail");
            this.notificationsRes = appTools.getText("settingsEnableNotifications");
            this.messageForDevRes = appTools.getText("settingsMessageForDevelopers");
            this.aboutRes = appTools.getText("settingsAbout");
            this.logoutRes = appTools.getText("settingsLogout");
            this._processStarted = false;
        }
        SettingsViewModel.prototype.initModel = function () {
            var _this = this;
            var user = usr.User.getFromStorage();
            var counter = 0;
            while (user === null) {
                if (counter <= 3) {
                    appTools.logError("Settings initModel user is null: " + counter);
                    counter++;
                }
                user = usr.User.getFromStorage();
            }
            this._user = user;
            this.set("nickName", user.nickName);
            this.set("notificationsEnabled", user.enablePushNotifications);
            this.set("vkNotAttached", !vk.Fields.hasVk());
            this.set("emailNotAttached", !auth.hasEmail());
            if (user.avatarUrl) {
                imgCache.ImageCache.getImagePathWithInit(user.avatarUrl).done(function (result) {
                    _this.set("photoPath", "url(" + result + ")");
                });
            }
            else {
                this.set("photoPath", "url(styles/images/nophoto.png)");
            }
        };
        SettingsViewModel.prototype.navigateToProfile = function () {
            backButtonCallback();
        };
        SettingsViewModel.prototype.nicknameChanged = function (e) {
            var _this = this;
            //prevent double clicking
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            var api = new serviceApi.ServiceApi();
            var nickName = this.get("nickName");
            api.callService({
                method: "user/ChangeNickName",
                data: "\"" + nickName + "\"",
                requestType: "POST"
            }).done(function () {
                _this._user.nickName = nickName;
                usr.User.saveToStorage(_this._user);
                appTools.forceRebind("Profile");
                _this._processStarted = false;
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        SettingsViewModel.prototype.photoChange = function () {
            var _this = this;
            //prevent double clicking
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            camera.getPicture()
                .then(function (image) {
                _this.set("photoPath", "url(" + image.localUrl + ")");
                //TO test this you need to create file test.jpg in your simulator storage
                var filePath = navigator.simulator ? "test.jpg" : image.localUrl;
                var api = new serviceApi.ServiceApi();
                return api.uploadFile({
                    filePath: filePath,
                    method: "user/UploadAvatar",
                    fileName: "avatar.jpg"
                });
            }).done(function (result) {
                var response = JSON.parse(result.response);
                if (response.Status === 0) {
                    _this._user.avatarUrl = response.Url;
                    usr.User.saveToStorage(_this._user);
                    appTools.forceRebind("Profile");
                }
                else {
                    navigator.notification.alert(response.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                }
                _this._processStarted = false;
            }).fail(function (message) {
                navigator.notification.alert(message || appTools.getText("cmApiError"), function () { }, appTools.getText("cameraErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        SettingsViewModel.prototype.addVkProfile = function () {
            var _this = this;
            //prevent double clicking
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            var vkAuth = new vk.Authorization();
            vkAuth.login()
                .then(function () {
                var vkApi = new vk.VkApi();
                return vkApi.getProfileInfo();
            })
                .then(function (profileResultData) {
                if (profileResultData && profileResultData.response) {
                    var userData = profileResultData.response[0];
                    userData.access_token = vk.Fields.token;
                    return (new serviceApi.ServiceApi()).callService({
                        method: "useridentity/AddVkIdentity",
                        data: JSON.stringify(userData),
                        requestType: "POST"
                    });
                }
                var def = $.Deferred();
                def.resolve({
                    Status: 1,
                    Description: appTools.getText("enterVkGetProfileIncorrect")
                });
                return def;
            })
                .done(function (result) {
                if (result.Status === 0) {
                    _this.set("vkNotAttached", false);
                }
                else {
                    vk.Fields.clear();
                    navigator.notification.alert(result.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                }
                _this._processStarted = false;
            })
                .fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        SettingsViewModel.prototype.addEmail = function () {
            navigation.navigateToAddEmail(enums.Direction.left);
        };
        SettingsViewModel.prototype.notificationsChange = function (e) {
            var _this = this;
            //prevent double clicking
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            this.registerPushNotification(e.checked)
                .then(function () {
                return _this.saveNotificationsSettings(e.checked);
            })
                .done(function () {
                _this._processStarted = false;
                if (device.platform === "Win32NT" && e.checked) {
                    navigator.notification.alert(appTools.getText("settingsPushAfterRestart"), function () { }, appTools.getText("cmWarning"), "OK");
                }
            }).fail(function (error) {
                appTools.logError(JSON.stringify(error));
                _this._processStarted = false;
            });
            ;
        };
        SettingsViewModel.prototype.leaveMessage = function () {
            navigation.navigateToFeedBackMessageView(enums.Direction.right);
        };
        SettingsViewModel.prototype.showAbout = function () {
            navigation.navigateToAboutView(enums.Direction.right);
        };
        SettingsViewModel.prototype.logout = function () {
            storage.PermanentStorage.clear();
            imgCache.ImageCache.clearCache();
            navigation.navigateToEnterView(enums.Direction.up);
        };
        SettingsViewModel.prototype.saveNotificationsSettings = function (value) {
            var _this = this;
            var api = new serviceApi.ServiceApi();
            return api.callService({
                method: "user/ChangeNotificationsSettings",
                data: "\"" + value + "\"",
                requestType: "POST"
            }).then(function (result) {
                if (result.Status === 0) {
                    _this._user.enablePushNotifications = value;
                    usr.User.saveToStorage(_this._user);
                }
                else {
                    navigator.notification.alert(result.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                }
            });
        };
        SettingsViewModel.prototype.registerPushNotification = function (value) {
            if (value) {
                return missionNotificaiton.MissionNotification.registerToMission();
            }
            else {
                return missionNotificaiton.MissionNotification.unregisterFromMission();
            }
        };
        return SettingsViewModel;
    }(kendo.data.ObservableObject));
    exports.SettingsViewModel = SettingsViewModel;
    var viewModel;
    function bindModel() {
        viewModel = new SettingsViewModel();
        kendo.bind($("#vSettings"), viewModel, kendo.mobile.ui);
        viewModel.initModel();
        appTools.viewBinded();
    }
    function backButtonCallback() {
        navigation.navigateToProfileView(enums.Direction.left);
    }
    var app = appTools.getApp();
    app.appInit.settingsViewModelInit = function () {
        bindModel();
    };
    app.appInit.settingsViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        if (device.platform === "Android") {
            viewModel.set("txtNickNameDisabled", true);
            setTimeout(function () {
                viewModel.set("txtNickNameDisabled", false);
            }, conf.Configuration.androidAutoFocusStubDelay);
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.settingsViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
