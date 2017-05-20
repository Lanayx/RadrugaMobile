import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import cameraTools = require("../../../scripts/camera/cameraTools");
import proxyImage = require("../../../scripts/camera/Image");
import enums = require("../../../scripts/Enums");
import miss = require("../../../scripts/models/Mission");
import storage = require("../../../scripts/Storage");
import serviceApi = require("../../../scripts/ServiceApi");
import user = require("../../../scripts/models/User");
import wsInterfaces = require("../../../scripts/models/WsInterfaces");

export class ShowYourselfModel extends kendo.data.ObservableObject {
    missionId = "";
    missionName = "";
    missionImagePath = "";
	
    avatarUrl: string;        
    //labels below
    readyButton = appTools.getText("cmReady");

    private _processStarted = false;
    private _avatarRawUrl: string;

    constructor() {
        super();
        super.init(this);
    }

    onCancel() {
        backButtonCallback();
    }       

    takePicture() {
        cameraTools.takePhoto().done((image: proxyImage.Image) => {
            this._avatarRawUrl = image.localUrl;
            this.set("avatarUrl", `url(${image.localUrl})`);
        }).fail((message: any) => {
            navigator.notification.alert(message,
                () => { }, appTools.getText("cameraErrorTitle"), "OK");
        });
    }

    onRemovePhoto(event: Event) {
        this._avatarRawUrl = undefined;
        this.set("avatarUrl", undefined);
    }

    onReadySend() {
        if (!this._avatarRawUrl)
            return;

        //prevent double clicking
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
        }).then<any>((result) => {
            var response = JSON.parse(result.response);
            if (response.Status === 0) {
                var missionProof: wsInterfaces.IMissionProof = {};
                avatarUrl = response.Url;
                return api.callService({
                    method: `mission/CompleteMission?missionId=${this.get("missionId") }`,
                    requestType: "POST",
                    data: JSON.stringify(missionProof)
                });
            } else {
                var def = $.Deferred();
                def.resolve({
                    Status: 1,
                    Description: response.Description
                });
                return def;
            }
        }).done((missionResult) => {
            if (missionResult.Status === 0 && missionResult.MissionCompletionStatus === enums.MissionCompletionStatus.Success) {
                var u = user.User.getFromStorage();
                u.avatarUrl = avatarUrl;
                user.User.saveToStorage(u);
                navigation.navigateToSucessView(enums.Direction.right, {
                    missionId: this.get("missionId"),
                    imageUrl: this.get("missionImagePath"),
                    experiencePoints: missionResult.Points,
                    missionName: this.get("missionName"),
                    starsCount: missionResult.StarsCount,
                    congratsMessage: appTools.getText("showYourSelfCongratMessage")
                });
            } else {
                navigator.notification.alert(missionResult.Description,
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            }
            this._processStarted = false;
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        });
    }

    onBinded() {
        var model: miss.Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        this.set("missionImagePath", "url(" + model.imageUrl + ")");
        this.set("missionName", model.name);
        this.set("missionId", model.id);
    }
}

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
app.appInit.showYourselfViewModelInit = () => {
    bindModel();
};

app.appInit.showYourselfViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.showYourselfViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};