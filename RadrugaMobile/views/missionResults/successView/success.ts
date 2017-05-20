import navigation = require("../../../scripts/Navigation");
import appTools = require("../../../scripts/ApplicationTools");
import enums = require("../../../scripts/Enums");
import interfaces = require("../../../scripts/Interfaces");
import vk = require("../../../scripts/VkManager");
import serviceApi = require("../../../scripts/ServiceApi");
import miss = require("../../../scripts/models/Mission");
import user = require("../../../scripts/models/User");
import conf = require("../../../scripts/Configuration");


var imageUrl, experiencePoints, missionName, starsCount, missionId, congrats;

export class SucessViewModel extends kendo.data.ObservableObject {
    missionImagePath = imageUrl;
    displayVkButton = vk.Fields.hasVk();
    experiencePoints = `+${experiencePoints}${appTools.getText("cmExperienceR")}`;
    congratsMessage: string;
    secondStarVisible = false;
    thirdStarVisible = false;

    //resources 
    successTitleRes = appTools.getText("sucessMissionCompleted");
    goToMissionsRes = appTools.getText("cmGoToMissions");
    shareInVkRes = appTools.getText("sucessShareInVk");

    constructor() {
        super();
        super.init(this);
    }

    goToMissions() {
        backButtonCallback();
    }

    shareInVk() {
        var vkApi = new vk.VkApi();
        //slice url(..) before passing
        vkApi.post(appTools.getText("sucessShareMessage") + missionName, imageUrl.slice(4, -1)).done(() => {
            this.set("displayVkButton", false);
            var api = new serviceApi.ServiceApi();
            api.callService({
                requestType: "POST",
                method: "user/VkRepostDone"
            }).done(() => {
                appTools.forceRebind("Achievement");
            });
        }).fail(() => {
            navigator.notification.alert(appTools.getText("successVkShareFail"),
                () => { }, appTools.getText("cmVkError"), "OK");
        });
    }

    onBinded() {
        this.set("congratsMessage", congrats);
        if (starsCount > 1) {
            this.set("secondStarVisible", true);
            if (starsCount === 3) {
                this.set("thirdStarVisible", true);
            }
        }
        var missionPassedCount = user.User.incrementPassedMissions();
        if (conf.Configuration.enableRating) {
            if (missionPassedCount % 5 === 0 && missionPassedCount < 16) {
                setTimeout(() => {
                    this.showRateMessage();
                }, 1000);
            }
        }
    }

    showRateMessage() {
        var api = new serviceApi.ServiceApi();
        api.callService({
            requestType: "GET",
            method: "specials/GetRatePageUrl",
            data: { platform: device.platform }
        }).done((url) => {
            navigator.notification.confirm(
                // The message
                appTools.getText("sucessRateAppDescription"),
                // A callback when the user clicks a button
                (index) => {
                    // index is the 1-based index of the clicked button.
                    // 1 == Sure, 2 == Later
                    if (index === 1) {
                        user.User.incrementPassedMissions(1000);
                        window.open(url, "_blank");
                    }
                },
                // The title of the notification
                appTools.getText("sucessRateAppTitle"),
                // The text for the two buttons
                [appTools.getText("sucessRateAppYes"), appTools.getText("sucessRateAppLater")]
            );
        });
    }

    //---------------------
}

export function init(options: interfaces.IMissionNavigationProperties) {
    imageUrl = options.imageUrl;
    experiencePoints = options.experiencePoints;
    missionName = options.missionName;
    starsCount = options.starsCount;
    missionId = options.missionId;
    congrats = options.congratsMessage;
}


function bindModel() {
    var viewModel = new SucessViewModel();
    kendo.bind($("#vSuccess"), viewModel, kendo.mobile.ui);
    viewModel.onBinded();
}

function backButtonCallback() {
    navigation.navigateToMissionChainView(enums.Direction.right);
}

var app = appTools.getApp();
app.appInit.successViewModelShow = () => {
    bindModel();
    miss.Mission.setMissionDisplayStatus(missionId, enums.MissionDisplayStatus.Succeeded);
    user.User.updateLevelPoints(experiencePoints);
    appTools.forceRebind("MissionChain", "Profile");
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.successViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};