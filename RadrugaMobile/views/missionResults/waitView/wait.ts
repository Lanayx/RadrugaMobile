import navigation = require("../../../scripts/Navigation");
import appTools = require("../../../scripts/ApplicationTools");
import enums = require("../../../scripts/Enums");
import interfaces = require("../../../scripts/Interfaces");
import usr = require("../../../scripts/models/User");
import miss = require("../../../scripts/models/Mission");


var imageUrl, missionId;

export class WaitViewModel extends kendo.data.ObservableObject {
    missionImagePath = imageUrl;
    settingsButtonVisible: boolean;
    missionButtonMarginTop: string;

    //resources 
    waitMessageRes = "";
    waitTitleRes = appTools.getText("waitTitle");
    goToMissionsRes = appTools.getText("cmGoToMissions");
    goToSettingsRes = appTools.getText("waitGoToSettings");

    constructor() {
        super();
        super.init(this);

        var notificationsEnabled = usr.User.getFromStorage().enablePushNotifications;
        this.settingsButtonVisible = !notificationsEnabled;
        this.missionButtonMarginTop = notificationsEnabled ?
            "3.5rem" : "0";
        this.waitMessageRes = notificationsEnabled
            ? appTools.getText("waitMessage")
            : appTools.getText("waitMessageWithReminder");
    }


    goToMissions() {
        backButtonCallback();
    }

    goToSettings() {
        navigation.navigateToSettingsView(enums.Direction.left);
    }
    
    //---------------------
}

export function init(options: interfaces.IMissionNavigationProperties) {
    imageUrl = options.imageUrl;
    missionId = options.missionId;
}

function bindModel() {
    var viewModel = new WaitViewModel();
    kendo.bind($("#vWait"), viewModel, kendo.mobile.ui);
}

function backButtonCallback() {
    navigation.navigateToMissionChainView(enums.Direction.left);
}


var app = appTools.getApp();
app.appInit.waitViewModelShow = () => {
    bindModel();
    miss.Mission.setMissionDisplayStatus(missionId, enums.MissionDisplayStatus.Waiting);
    appTools.forceRebind("MissionChain");
    document.addEventListener("backbutton", backButtonCallback, false);
};

app.appInit.waitViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};