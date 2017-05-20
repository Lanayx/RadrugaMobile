import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import interfaces = require("../../../scripts/Interfaces");
import wsInterfaces = require("../../../scripts/models/WsInterfaces");
import enums = require("../../../scripts/Enums");
import serviceApi = require("../../../scripts/ServiceApi");
import miss = require("../../../scripts/models/Mission");
import user = require("../../../scripts/models/User");
import storage = require("../../../scripts/Storage");
import geoCoordinate = require("../../../scripts/geoLocation/GeoCoordinate");
import umissManager = require("../../../scripts/game/UniqueMissionsManager");
import modalView = require("../../../scripts/models/HintsModalView");

var showTries: boolean,
    maxTries: number;


export class CommonPlaceModel extends kendo.data.ObservableObject {

    missionId = "";
    missionName = "";
    missionImagePath = "";
    congratsMessage: string;
    isHasHints = false;
    maxTries: number;
    currentTry: number;
    triesVisibility: string;

    //labels below
    tryButtonRes = appTools.getText("commonPlaceTryButton");
    tryRes = appTools.getText("commonPlaceTryCount");
    fromRes = appTools.getText("cmFrom");

    private _accuracyRadius: number;
    private _processStarted = false;

    constructor() {
        super();
        super.init(this);
    }

    onBack() {
        backButtonCallback();
    }

    onTry() {

        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;

        var highAccuracy = !this._accuracyRadius || this._accuracyRadius < 500;
        var currentCoordinate;
        geoCoordinate.GeoCoordinate.getCurrent(highAccuracy)
            .then<any>((coordinate) => {
                currentCoordinate = coordinate;

                var missionProof: wsInterfaces.IMissionProof = {
                    Coordinates: [geoCoordinate.GeoCoordinate.convertToWsData(currentCoordinate)]
                };

                var api = new serviceApi.ServiceApi();
                return api.callService({
                    method: `mission/CompleteMission?missionId=${this.get("missionId") }`,
                    requestType: "POST",
                    data: JSON.stringify(missionProof)
                });
            }).done((result) => {
                if (result.Status === 0) {
                    switch (result.MissionCompletionStatus) {
                        case enums.MissionCompletionStatus.Success:
                            this.checkUniqueMission(currentCoordinate);
                            navigation.navigateToSucessView(enums.Direction.right, {
                                missionId: this.get("missionId"),
                                imageUrl: this.get("missionImagePath"),
                                experiencePoints: result.Points,
                                missionName: this.get("missionName"),
                                starsCount: result.StarsCount,
                                congratsMessage: this.get("congratsMessage")
                            });
                            break;
                        case enums.MissionCompletionStatus.Fail:
                            navigation.navigateToFailView(enums.Direction.right, {
                                missionId: this.get("missionId"),
                                imageUrl: this.get("missionImagePath"),
                                missionName: this.get("missionName")
                            });
                            break;
                        case enums.MissionCompletionStatus.IntermediateFail:
                            navigator.notification.alert(appTools.getText(`commonPlace${result.Description}Message`),
                                () => { }, appTools.getText("commonPlaceIncorrectTitle"), "OK");
                            var currentyTry = result.TryCount + 1;
                            this.set("currentTry", currentyTry);
                            miss.Mission.setCurrentMissionTryCount(currentyTry);
                            break;
                    }
                } else
                    navigator.notification.alert(result.Description,
                        () => { }, appTools.getText("cmApiErrorTitle"), "OK");
                this._processStarted = false;
            }).fail(() => {
                navigator.notification.alert(appTools.getText("geoCantObtainCoordinateMessage"),
                    () => { }, appTools.getText("geoCantObtainCoordinateTitle"), "OK");
                this._processStarted = false;
            });
    }


    onBinded() {
        var model: miss.Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        this.set("missionImagePath", "url(" + model.imageUrl + ")");
        this.set("missionName", model.name);
        this.set("currentTry", model.currentTry);
        this.set("maxTries", model.maxTries || maxTries);
        this.set("missionId", model.id);
        this.set("triesVisibility", showTries ? "visible" : "hidden");
        this.set("congratsMessage", model.congratMessage);
        this._accuracyRadius = model.accuracyRadius;
        this.set("isHasHints", model.hints.length > 0);

        var hintsModalViewModel = new modalView.HintsModalView(model);
        kendo.bind($(modalView.HintsModalView.ModalViewId), hintsModalViewModel, kendo.mobile.ui);
    }

    openHintModal() {
        $(modalView.HintsModalView.ModalViewId).data("kendoMobileModalView").open();
    }

    checkUniqueMission(geoCoordinate: geoCoordinate.GeoCoordinate) {
        var missionId = this.get("missionId");
        var u: user.User,
            missionName = umissManager.UniqueMissionsManager.getMissionName(missionId);
        switch (missionName) {
            case "CommandPoint":
                u = user.User.getFromStorage();
                u.homeCoordinate = geoCoordinate;
                user.User.saveToStorage(u);
                break;
            case "Radar":
                u = user.User.getFromStorage();
                u.radarCoordinate = geoCoordinate;
                user.User.saveToStorage(u);
                break;
            case "Outpost":
                u = user.User.getFromStorage();
                u.outpostCoordinate = geoCoordinate;
                user.User.saveToStorage(u);
                break;
        }
    }
}

function bindModel() {
    var model = new CommonPlaceModel();
    kendo.bind($("#vCommonPlaceSolution"), model, kendo.mobile.ui);
    model.onBinded();
    appTools.viewBinded();
}

export function init(data: interfaces.ITriesNavigationProperties) {
    if (!data) {
        showTries = true;
        return;
    }
    showTries = !(data.showTries === false);
    maxTries = data.maxTries;
}

function backButtonCallback() {
    navigation.navigateToMissionView(enums.Direction.right);
}

var app = appTools.getApp();
app.appInit.commonPlaceViewModelInit = () => {
    bindModel();
};

app.appInit.commonPlaceViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.commonPlaceViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};