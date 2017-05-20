import navigation = require("../../../scripts/Navigation");
import appTools = require("../../../scripts/ApplicationTools");
import enums = require("../../../scripts/Enums");
import interfaces = require("../../../scripts/Interfaces");
import miss = require("../../../scripts/models/Mission");

var imageUrl, missionName, missionId;

export class FailViewModel extends kendo.data.ObservableObject {
    missionImagePath = imageUrl;

    //resources 
    failTitleRes = appTools.getText("failMissionFailed");
    failMessageRes = appTools.getText("failMessage");
    goToMissionsRes = appTools.getText("cmGoToMissions");
    
    constructor() {
        super();
        super.init(this);
    }


    goToMissions() {
        backButtonCallback();
    }
    //---------------------
}

export function init(options: interfaces.IMissionNavigationProperties) {
    imageUrl = options.imageUrl;
    missionName = options.missionName;
    missionId = options.missionId;
}



function bindModel() {
    var viewModel = new FailViewModel();
    kendo.bind($("#vFail"), viewModel, kendo.mobile.ui);
}

function backButtonCallback() {
    navigation.navigateToMissionChainView(enums.Direction.down);
}

var app = appTools.getApp();
app.appInit.failViewModelShow = () => {
    bindModel();
    miss.Mission.setMissionDisplayStatus(missionId, enums.MissionDisplayStatus.Failed);
    appTools.forceRebind("MissionChain", "Profile");
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.failViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};


