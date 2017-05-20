import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import enums = require("../../../scripts/Enums");
import miss = require("../../../scripts/models/Mission");
import storage = require("../../../scripts/Storage");
import serviceApi = require("../../../scripts/ServiceApi");
import wsInterfaces = require("../../../scripts/models/WsInterfaces");

export class VideoModel extends kendo.data.ObservableObject {
    missionId = "";
    missionImagePath = "";  
    answer: string = "";

    //labels below
    sendForApprovalButtonRes = appTools.getText("slnSendForApproval");
    enterAnswerRes = "https://www.youtube.com/...";
    descriptionRes = appTools.getText("videoDescription");

    private _processStarted = false;

    constructor() {
        super();
        super.init(this);
    }

    onBack() {
        backButtonCallback();
    }

    onSendAnswer() {
        if (!this.get("answer") || this.get("answer").length < 6)
            return;

        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;

        var missionProof: wsInterfaces.IMissionProof = {
            CreatedText: this.get("answer")
        };

        var api = new serviceApi.ServiceApi();
        api.callService({
            method: "mission/CompleteMission?missionId=" + this.get("missionId"),
            requestType: "POST",
            data: JSON.stringify(missionProof)
        }).done((result) => {
            if (result.Status === 0 && result.MissionCompletionStatus === enums.MissionCompletionStatus.Waiting) {
                navigation.navigateToWaitView(enums.Direction.right, {
                    imageUrl: this.get("missionImagePath"),
                    missionId: this.get("missionId")
                });
            } else
                navigator.notification.alert(result.Description,
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
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
        this.set("missionId", model.id);
        this.set("isHasHints", model.hints.length > 0);       
    }
}


function bindModel() {
    var model = new VideoModel();
    kendo.bind($("#vVideoSolution"), model, kendo.mobile.ui);
    model.onBinded();
    appTools.viewBinded();
}

function backButtonCallback() {
    navigation.navigateToMissionView(enums.Direction.right);
}

var app = appTools.getApp();
app.appInit.videoViewModelInit = () => {
    bindModel();
};

app.appInit.videoViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.videoViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};