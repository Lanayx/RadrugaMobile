/// <reference path="../../scripts/tsDefinitions/custom/navigator.d.ts" />

import appTools = require("../../scripts/ApplicationTools");
import imgCache = require("../../scripts/ImageCache");
import usr = require("../../scripts/models/User");
import storage = require("../../scripts/Storage");
import serviceApi = require("../../scripts/ServiceApi");
import camera = require("../../scripts/camera/cameraTools");
import navigation = require("../../scripts/Navigation");
import enums = require("../../scripts/Enums");
import auth = require("../../scripts/Authorization");
import vk = require("../../scripts/VkManager");
import missionNotificaiton = require("../../scripts/notifications/MissionNotification");
import conf = require("../../scripts/Configuration");


export class SettingsViewModel extends kendo.data.ObservableObject {
    photoPath = "";
    nickName = "";
    vkNotAttached = false;
    emailNotAttached = false;
    notificationsEnabled = true;
    txtNickNameDisabled = false;
    //-----------------------
    nickNameRes = appTools.getText("cmNickName");
    attachVkRes = appTools.getText("settingsAttachVk");
    attachEmailRes = appTools.getText("settingsAttachEmail");
    notificationsRes = appTools.getText("settingsEnableNotifications");
    messageForDevRes = appTools.getText("settingsMessageForDevelopers");
    aboutRes = appTools.getText("settingsAbout");
    logoutRes = appTools.getText("settingsLogout");
    //-------------------------
    private _user: usr.User;
    private _processStarted = false;

    initModel() {
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
            imgCache.ImageCache.getImagePathWithInit(user.avatarUrl).done((result) => {
                this.set("photoPath", `url(${result})`);
            });
        } else {
            this.set("photoPath", "url(styles/images/nophoto.png)");
        }
    }

    navigateToProfile() {
        backButtonCallback();
    }

    nicknameChanged(e) {
        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;

        var api = new serviceApi.ServiceApi();
        var nickName = this.get("nickName");
        api.callService({
            method: "user/ChangeNickName",
            data: `"${nickName}"`, //quotes are hotfix for posting string value
            requestType: "POST"
        }).done(() => {
            this._user.nickName = nickName;
            usr.User.saveToStorage(this._user);
            appTools.forceRebind("Profile");
            this._processStarted = false;
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        });
    }

    photoChange() {
        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;


        camera.getPicture()
            .then<any>((image) => {
                this.set("photoPath", `url(${image.localUrl})`);

                //TO test this you need to create file test.jpg in your simulator storage
                var filePath = navigator.simulator ? "test.jpg" : image.localUrl;
                var api = new serviceApi.ServiceApi();
                return api.uploadFile({
                    filePath: filePath,
                    method: "user/UploadAvatar",
                    fileName: "avatar.jpg"
                });
            }).done((result) => {
                var response = JSON.parse(result.response);
                if (response.Status === 0) {
                    this._user.avatarUrl = response.Url;
                    usr.User.saveToStorage(this._user);
                    appTools.forceRebind("Profile");
                } else {
                    navigator.notification.alert(response.Description,
                        () => { }, appTools.getText("cmApiErrorTitle"), "OK");
                }
                this._processStarted = false;
            }).fail((message) => {
                navigator.notification.alert(message || appTools.getText("cmApiError"),
                    () => { }, appTools.getText("cameraErrorTitle"), "OK");
                this._processStarted = false;
            });

    }

    addVkProfile() {
        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;


        var vkAuth = new vk.Authorization();
        vkAuth.login()
            .then<any>(() => {
                var vkApi = new vk.VkApi();
                return vkApi.getProfileInfo();
            })
            .then<any>((profileResultData) => {
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
            .done((result) => {
                if (result.Status === 0) {
                    this.set("vkNotAttached", false);
                } else {
                    vk.Fields.clear();
                    navigator.notification.alert(result.Description,
                        () => { }, appTools.getText("cmApiErrorTitle"), "OK");
                }
                this._processStarted = false;
            })
            .fail(() => {
                navigator.notification.alert(appTools.getText("cmApiError"),
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
                this._processStarted = false;
            });
    }

    addEmail() {
        navigation.navigateToAddEmail(enums.Direction.left);
    }

    notificationsChange(e) {
        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;


        this.registerPushNotification(e.checked)
            .then(() => {
                return this.saveNotificationsSettings(e.checked);
            })
            .done(() => {
                this._processStarted = false;
                if (device.platform === "Win32NT" && e.checked) {
                    navigator.notification.alert(appTools.getText("settingsPushAfterRestart"),
                        () => { }, appTools.getText("cmWarning"), "OK");
                }
            }).fail((error) => {
                appTools.logError(JSON.stringify(error));
                this._processStarted = false;
            });
        ;
    }

    leaveMessage() {
        navigation.navigateToFeedBackMessageView(enums.Direction.right);
    }

    showAbout() {
        navigation.navigateToAboutView(enums.Direction.right);
    }

    logout() {
        storage.PermanentStorage.clear();
        imgCache.ImageCache.clearCache();
        navigation.navigateToEnterView(enums.Direction.up);
    }

    private saveNotificationsSettings(value): JQueryPromise<any> {
        var api = new serviceApi.ServiceApi();
        return api.callService({
            method: "user/ChangeNotificationsSettings",
            data: `"${value}"`, //quotes are hotfix for posting string value
            requestType: "POST"
        }).then((result) => {
            if (result.Status === 0) {
                this._user.enablePushNotifications = value;
                usr.User.saveToStorage(this._user);
            } else {
                navigator.notification.alert(result.Description,
                () => {}, appTools.getText("cmApiErrorTitle"), "OK");
            }
        });
    }

    private registerPushNotification(value): JQueryPromise<any> {
        if (value) {
            return missionNotificaiton.MissionNotification.registerToMission();

        } else {
            return missionNotificaiton.MissionNotification.unregisterFromMission();
        }
    }
}

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
app.appInit.settingsViewModelInit = () => {
    bindModel();
};

app.appInit.settingsViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }

    if (device.platform === "Android") //stub for autofocus
    {
        viewModel.set("txtNickNameDisabled", true);
        setTimeout(() => {
            viewModel.set("txtNickNameDisabled", false);
        }, conf.Configuration.androidAutoFocusStubDelay);
    }

    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.settingsViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};