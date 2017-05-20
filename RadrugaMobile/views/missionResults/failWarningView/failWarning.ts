import navigation = require("../../../scripts/Navigation");
import appTools = require("../../../scripts/ApplicationTools");
import enums = require("../../../scripts/Enums");
import interfaces = require("../../../scripts/Interfaces");
import serviceApi = require("../../../scripts/ServiceApi");

var missionId, imageUrl;

export class FailWarningViewModel extends kendo.data.ObservableObject {
    missionImagePath = imageUrl;
    //resources 
    failWarningMessageRes = appTools.getText("failWarningMessage");
    failWarningTitleRes = appTools.getText("failWarningTitle");
    goToMissionRes = appTools.getText("failWarningGoToMission");
    goToFailRes = appTools.getText("failWarningGoToFail");

    private _processStarted = false;

    constructor() {
        super();
        super.init(this);
    }

    goToMission() {
        backButtonCallback();
    }

    goToFail() {
        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;

        var api = new serviceApi.ServiceApi();
        api.callService({
            method: "mission/DeclineMission?missionId=" + missionId,
            requestType: "POST"
        }).done((result) => {
            if (result.Status === 0) {
                switch (result.MissionCompletionStatus) {
                    case enums.MissionCompletionStatus.Success:
                        navigation.navigateToSucessView(enums.Direction.right, {
                            missionId: missionId,
                            imageUrl: this.get("missionImagePath"),
                            experiencePoints: result.Points,
                            missionName: this.get("missionName"),
                            starsCount: result.StarsCount
                        });
                        break;
                    case enums.MissionCompletionStatus.Fail:
                        navigation.navigateToFailView(enums.Direction.right, {
                            missionId: missionId,
                            imageUrl: this.get("missionImagePath"),
                            missionName: this.get("missionName")
                        });
                        break;
                }
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
    //---------------------
}

export function init(options: interfaces.IMissionNavigationProperties) {
    missionId = options.missionId;
    imageUrl = options.imageUrl;
}

function bindModel() {
    var viewModel = new FailWarningViewModel();
    kendo.bind($("#vFailWarning"), viewModel, kendo.mobile.ui);
}

function backButtonCallback() {
    navigation.navigateToMissionView(enums.Direction.left);
}

var app = appTools.getApp();
app.appInit.failWarningViewModelShow = () => {
    bindModel();
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.failWarningViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};


