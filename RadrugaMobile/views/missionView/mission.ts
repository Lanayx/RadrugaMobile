import storage = require("../../scripts/Storage");
import imgCache = require("../../scripts/ImageCache");
import appTools = require("../../scripts/ApplicationTools");
import interfaces = require("../../scripts/Interfaces");
import navigation = require("../../scripts/Navigation");
import miss = require("../../scripts/models/Mission");
import enums = require("../../scripts/Enums");
import uiCommon = require("../../scripts/UiCommon");
import uniqueManager = require("../../scripts/game/UniqueMissionsManager");

var currentMissionId;

export class MissionViewModel extends kendo.data.ObservableObject {
    missionImagePath = "";
    missionName = "";
    missionDetails = "";
    missionDifficulty: number;
    solutionType: number;

    private missions = [];

    constructor() {
        super();
        super.init(this);
    }

    onBinded() {
        var mission = this.getMissionDetails();
        if (!mission || mission.id !== currentMissionId) {
            var model = miss.Mission.getById(currentMissionId);
            this.setMissionDetails(model);//save missions before image processing
            this.fillModel(model, true).done(() => {
                this.setMissionDetails(model);//save missions after image processing
            });
            appTools.forceRebind("Camera", "CommonPlace", "Path", "RightAnswer", "TextCreation", "Video", "PerpetumMobile", "ShowYourself");
        } else {
            this.fillModel(mission, false);
        }

        uiCommon.displayDifficulty("#missionBody");
        this.manageMissionButtons();
    }

    private manageMissionButtons() {
        $("#solveButton").text(appTools.getText("missionSolve")).off("click").click(() => {
            this.onSolve();
        });
        $("#surrenderButton").text(appTools.getText("missionViewSurrender")).off("click").click(() => {
            this.onSurrender();
        });
    }

    getMissionDetails(): miss.Mission {
        return JSON.parse(storage.PermanentStorage.get("MissionDetails") || null);
    }

    setMissionDetails(value: miss.Mission) {
        if (value !== null) {
            storage.PermanentStorage.set("MissionDetails", JSON.stringify(value));
        }
    }

    clearMissionDetails() {
        storage.PermanentStorage.set("MissionDetails", null);
    }


    navigateToMissionChain() {
        backButtonCallback();
    }

    onSurrender() {
        navigation.navigateToFailWarningView(enums.Direction.right, { missionId: currentMissionId, imageUrl: this.get("missionImagePath") });
    }

    onSolve() {
        switch (this.get("solutionType")) {
            case enums.SolutionType.RightAnswer:
                navigation.navigateToRightAnswerView(enums.Direction.left);
                break;
            case enums.SolutionType.TextCreation:
                navigation.navigateToTextCreationView(enums.Direction.left);
                break;
            case enums.SolutionType.CommonPlace:
                navigation.navigateToCommonPlaceView(enums.Direction.left);
                break;
            case enums.SolutionType.PhotoCreation:
                navigation.navigateToCameraView(enums.Direction.left);
                break;
            case enums.SolutionType.Video:
                navigation.navigateToVideoView(enums.Direction.left);
                break;
            case enums.SolutionType.GeoCoordinates:
                navigation.navigateToPathView(enums.Direction.left);
                break;
            case enums.SolutionType.Unique:
                uniqueManager.UniqueMissionsManager.goToMission(currentMissionId);
                break;
            default:
                throw "Unsupported misison type";
        }
    }

    private fillModel(data: miss.Mission, convertUrl: boolean): any {
        this.set("missionName", data.name);
        this.set("missionDetails", data.description.replace(/\r\n/g, "<br>"));
        this.set("missionDifficulty", data.difficulty);
        this.set("solutionType", data.solutionType);

        if (!convertUrl) {
            this.set("missionImagePath", "url(" + data.imageUrl + ")");
            return undefined;
        }

        return imgCache.ImageCache.getImagePathWithInit(data.imageUrl).then((result) => {
            data.imageUrl = result;
            this.set("missionImagePath", "url(" + result + ")");
        });
    }

}


export function init(options: interfaces.IMissionNavigationProperties) {
    currentMissionId = options.missionId;
}

function bindModel() {
    var model = new MissionViewModel();
    kendo.bind($("#vMission"), model, kendo.mobile.ui);
    model.onBinded();
}

function backButtonCallback() {
    navigation.navigateToMissionChainView(enums.Direction.right);
}

var app = appTools.getApp();
app.appInit.missionViewModelShow = () => {
    bindModel();
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.missionViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};