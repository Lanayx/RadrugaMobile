/// <reference path="../../../scripts/tsDefinitions/custom/screen.d.ts" />
import navigation = require("../../../scripts/Navigation");
import cameraTools = require("../../../scripts/camera/cameraTools");
import proxyImage = require("../../../scripts/camera/Image");
import appTools = require("../../../scripts/ApplicationTools");
import serviceApi = require("../../../scripts/ServiceApi");
import enums = require("../../../scripts/Enums");
import conf = require("../../../scripts/Configuration");
import usr = require("../../../scripts/models/User");

export class KindActionNewViewModel extends kendo.data.ObservableObject {
    private _kindActionNewDescriptionMinLength = 20;
    private _kindActionNewDescriptionMaxLength = 400;

    private _processStarted = false;

    kindActionNewDescription = "";
    kindActionNewSubmitted = false;
    kindActionNewDescriptionDisabled = false;
    photoPath = "";
    kindScaleGained = "";
    coinsGained = "";
    photoTaken = false;
    //resources 
    btnCompleteRes = appTools.getText("kindActionNewComplete");
    btnCancelRes = appTools.getText("cmCancel");
    btnAnotherKindActionNewRes = appTools.getText("kindActionNewAnotherAction");
    kindActionNewDescriptionRes = appTools.getText("kindActionNewDescription");
    kindActionNewCompletedRes = appTools.getText("kindActionNewCompleted");

    constructor() {
        super();
        super.init(this);
    }


    takePicture() {
        cameraTools.takePhoto().done((image: proxyImage.Image) => {
            this.set("photoTaken", true);
            this.set("photoPath", image.localUrl);
            this.set("btnTakePictureRes", appTools.getText("cmRetakePhoto"));

        }).fail((message: any) => {
            navigator.notification.alert(message,
                () => { }, appTools.getText("cameraErrorTitle"), 'OK');
        });
    }

    submitKindActionNew() {
        var description = this.get("kindActionNewDescription");
        if (description.length < this._kindActionNewDescriptionMinLength) {
            navigator.notification.alert(appTools.getText("kindActionNewValidationShort"),
                () => { }, appTools.getText("cmWarning"), "OK");
            return;
        }
        if (description.length > this._kindActionNewDescriptionMaxLength) {
            navigator.notification.alert(appTools.getText("kindActionNewValidationLong"),
                () => { }, appTools.getText("cmWarning"), "OK");
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
        } else {
            this.submitKindActionNewWithoutImage();
        }
    }

    submitAnotherKindActionNew() {
        this.set("kindActionNewSubmitted", false);
    }

    removePhoto() {
        this.set("photoPath", "");
        this.set("photoTaken", false);
    }


    //---------------------

    private submitKindActionNewWithImage(filePath: string) {
        var api = new serviceApi.ServiceApi();
        api.uploadFile({
            filePath: filePath,
            method: "kindAction/Post",
            fileName: "kindAction.jpg",
            params: {
                KindActionDescription: encodeURIComponent(this.get("kindActionNewDescription"))//needed because we can't pass clear UTF
            }
        }).done((result) => {
            var jsonResult = JSON.parse(result.response);
            if (jsonResult.Status === 0) {
                this.removePhoto();
                this.showResult(true);
                this.updateUser(jsonResult);
            } else
                navigator.notification.alert(jsonResult.Description,
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        });
    }
    private submitKindActionNewWithoutImage() {
        var api = new serviceApi.ServiceApi();
        api.callService({
            method: "kindAction/PostWithoutImage",
            requestType: "POST",
            data: '"' + this.get("kindActionNewDescription") + '"' //quotes are hotfix for posting string value
        }).done((result) => {
            if (result.Status === 0) {
                this.showResult(false);
                this.updateUser(result);
            }
            else
                navigator.notification.alert(result.Description,
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        });
    }

    //TODO: need refactoring, for what use bonus parameter?
    private showResult(bonus: boolean) {
        this.set("coinsGained", "");
        this.set("kindScaleGained", "");
        this.set("kindActionNewSubmitted", true);
        this.set("kindActionNewDescription", "");        
        appTools.forceRebind("KindActionList");
    }
    private updateUser(kindActionResult: any) {
        var user = usr.User.getFromStorage();
        var coinsGained = kindActionResult.Coins - user.coinsCount;
        var kindScaleGained = kindActionResult.KindScale - user.kindScale;
        if (coinsGained > 0) {
            this.set("coinsGained", `+${coinsGained} ${appTools.getText("kindActionNewCoins")}`);
            user.coinsCount = kindActionResult.Coins;
        }
        if (kindScaleGained > 0) {
            this.set("kindScaleGained", `+${kindScaleGained}% ${appTools.getText("kindActionNewReward")}`);
            user.kindScale = kindActionResult.KindScale;
        }
        if (kindScaleGained > 0 || coinsGained > 0) {
            usr.User.saveToStorage(user);
            appTools.forceRebind("Profile");
        }
        if (coinsGained > 0) {
            appTools.forceRebind("Account");
        }
    }
}

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
app.appInit.kindActionNewViewModelInit = () => {
    bindModel();
    bindCloseButton();
};
app.appInit.kindActionNewViewModelShow = () => {
    if (device.platform === "Android") {//stub for autofocus
        viewModel.set("kindActionNewDescriptionDisabled", true);
        setTimeout(() => {
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
app.appInit.kindActionNewViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
    if (screen && screen.lockOrientation)
        screen.lockOrientation("portrait");
};

