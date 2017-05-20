/// <reference path="../../../scripts/tsDefinitions/custom/screen.d.ts" />
import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import enums = require("../../../scripts/Enums");
import miss = require("../../../scripts/models/Mission");
import storage = require("../../../scripts/Storage");
import serviceApi = require("../../../scripts/ServiceApi");
import wsInterfaces = require("../../../scripts/models/WsInterfaces");
import modalView = require("../../../scripts/models/HintsModalView");

export class TextCreationModel extends kendo.data.ObservableObject {
    missionId = "";
    missionImagePath = "";

    answer: string = "";
    //labels below
    sendForApprovalButtonRes = appTools.getText("slnSendForApproval");
    enterAnswerRes = appTools.getText("cmEnterAnswer");
    descriptionRes = appTools.getText("textCreationDescription");

    private _processStarted = false;

    constructor() {
        super();
        super.init(this);
    }

    onBack() {
        backButtonCallback();
    }

    onSendAnswer() {
        if (!this.get("answer"))
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
    }
}


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
app.appInit.textCreationViewModelInit = () => {
    bindModel();
};

app.appInit.textCreationViewModelShow = () => {
    if (appTools.rebindNeeded()) {
         bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
    if (screen && screen.unlockOrientation)
        screen.unlockOrientation();
};
app.appInit.textCreationViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
    if (screen && screen.lockOrientation)
        screen.lockOrientation("portrait");
};