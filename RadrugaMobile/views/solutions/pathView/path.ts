import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import wsInterfaces = require("../../../scripts/models/WsInterfaces");
import enums = require("../../../scripts/Enums");
import serviceApi = require("../../../scripts/ServiceApi");
import miss = require("../../../scripts/models/Mission");
import storage = require("../../../scripts/Storage");
import geoCoordinate = require("../../../scripts/geoLocation/GeoCoordinate");
import interfaces = require("../../../scripts/Interfaces");
import user = require("../../../scripts/models/User");
import umissManager = require("../../../scripts/game/UniqueMissionsManager");
import modalView = require("../../../scripts/models/HintsModalView");

var showTimer: boolean;

export interface IPoint {
    pointName: string;
    reached: boolean;
    pointClass: string;
    currentClass: string;
}

export class PathModel extends kendo.data.ObservableObject {

    missionId = "";
    missionName = "";
    missionImagePath = "";
    timerVisibility: string;
    congratsMessage: string;
    isHasHints = false;
    timeLeftRepresentation: string = "--:--";

    points: IPoint[];

    //labels below
    actionButtonText = appTools.getText("pathStart");
    timeLeftRes = appTools.getText("pathTimeLeft");

    private _timeLeft: number;
    private _requiredCoordinates: miss.ICoordinateWithCompletion[] = [];
    private _accuracyRadius: number;
    private _timeLimit: number;
    private _loopTimer: boolean = true;
    private _processStarted = false;
    private onResumeCallbackBinded: () => {};

    constructor() {
        super();
        super.init(this);
        this.onResumeCallbackBinded = this.onResumeCallback.bind(this);
    }

    onBack() {
        this.disableInsomnia();
        backButtonCallback();
    }

    onCompletePoint() {

        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;

        var currentExecutableCoordinate: miss.ICoordinateWithCompletion = null;
        var nextCoordinate: miss.ICoordinateWithCompletion = null;
        var firstPoint = !this.firstPointReached();
        for (let coordinate of this._requiredCoordinates) {
            if (coordinate.reached) {
                continue;
            }
            if (currentExecutableCoordinate == null) {
                currentExecutableCoordinate = coordinate;
                continue;
            }
            if (nextCoordinate == null) {
                nextCoordinate = coordinate;
                continue;
            }
        }

        if (currentExecutableCoordinate == null && this._requiredCoordinates.every(coord => coord.reached)){//somehow missed the final below
            this._loopTimer = false;
            this.completeMission();
            appTools.logError("Stub late path completion");
            return;
        }

        var highAccuracy = this._accuracyRadius < 500;
        geoCoordinate.GeoCoordinate.getCurrent(highAccuracy)
            .done((coordinate) => {
                coordinate.getDistance(currentExecutableCoordinate.requiredCoordinate.coordinate).then((distance) => {
                    if (distance > this._accuracyRadius && !currentExecutableCoordinate.requiredCoordinate.test) {
                        if (distance > this._accuracyRadius * 2)
                            navigator.notification.alert(appTools.getText("pathPointIncorrectMessage"),
                                () => { }, appTools.getText("pathPointIncorrectTitle"), "OK");
                        else
                            navigator.notification.alert(appTools.getText("pathPointIsNearMessage"),
                                () => { }, appTools.getText("pathPointIncorrectTitle"), "OK");
                        this._processStarted = false;
                    } else {
                        currentExecutableCoordinate.reached = true;
                        currentExecutableCoordinate.reachedCoordinate = coordinate;
                        miss.Mission.setCurrentMissionCompletedCoordinates(this._requiredCoordinates);
                        if (nextCoordinate === null) {//final
                            this._loopTimer = false;
                            this.completeMission();
                        } else {
                            if (firstPoint) {
                                var model: miss.Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
                                this.startMission(model);
                            }
                            this._processStarted = false;
                        }
                        this.points.splice(0, this.points.length);
                        this.points.push.apply(this.points, this.getPoints());
                        this.scrollToCurrent();
                    }
                });
            }).fail(() => {
                navigator.notification.alert(appTools.getText("geoCantObtainCoordinateMessage"),
                    () => { }, appTools.getText("geoCantObtainCoordinateTitle"), "OK");
                this._processStarted = false;
            });
    }

    onBinded() {
        var model: miss.Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        if (!model.isFullFilled) {
            miss.Mission.fillMissionCoordinates(model);
            if (!model.isFullFilled) {
                throw "Not enough parameters";
            }
        }

        this.set("missionId", model.id);
        this.set("congratsMessage", model.congratMessage);
        this.set("missionImagePath", "url(" + model.imageUrl + ")");
        this.set("missionName", model.name);
        this.set("timerVisibility", showTimer ? "visible" : "hidden");
        this._requiredCoordinates = model.requiredCoordinates;
        this.set("points", this.getPoints());
        this._accuracyRadius = model.accuracyRadius;
        this._timeLimit = model.timeLimit;
        this.set("isHasHints", model.hints.length > 0);

        var hintsModalViewModel = new modalView.HintsModalView(model);
        kendo.bind($(modalView.HintsModalView.ModalViewId), hintsModalViewModel, kendo.mobile.ui); 

        if (!this.firstPointReached()) {
            this._timeLeft = this._timeLimit;
            return;
        }

        this.startMission(model);
        // ReSharper disable once Html.EventNotResolved
        document.addEventListener("resume", this.onResumeCallbackBinded, false);        
    }

    openHintModal() {
        $(modalView.HintsModalView.ModalViewId).data("kendoMobileModalView").open();
    }

    private onResumeCallback(event: Event): any {
        var model: miss.Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        this._timeLeft = this._timeLimit - Math.round(((new Date()).getTime() - (new Date(model.startExecutionTime)).getTime()) / 1000);
        this.refreshTime(this._timeLeft);
    }

    private startMission(model: miss.Mission, firstPointPassed?: boolean) {
        this.set("actionButtonText", appTools.getText("pathOnThePosition"));
        this.enableInsomia();
        if (!showTimer)
            return;

        if (model.startExecutionTime) {
            this._timeLeft = this._timeLimit - Math.round(((new Date()).getTime() - (new Date(model.startExecutionTime)).getTime()) / 1000);
        } else {
            this._timeLeft = this._timeLimit;
            miss.Mission.setCurrentMissionStartExecution();
        }
        this.refreshTime(this._timeLeft);
        this.startTimer();
    }

    private refreshTime(time: number) {
        var minutes = Math.floor(time / 60);
        var seconds = time - minutes * 60;
        var finalTime = this.formatTimeComponent(minutes) + ":" + this.formatTimeComponent(seconds);
        this.set("timeLeftRepresentation", finalTime);
    }

    private formatTimeComponent(string) {
        return (new Array(3).join("0") + string).slice(-2);
    }

    private startTimer() {
        setTimeout(() => {
            var newTime = this._timeLeft - 1;
            this._timeLeft = newTime;
            if (newTime <= 0) {
                this._loopTimer = false;
                this._timeLeft = -1;
                this.completeMission();
            }

            this.refreshTime(newTime);

            if (this._loopTimer) {
                this.startTimer();
            }
        }, 1000);
    }

    private completeMission() {
        // ReSharper disable once Html.EventNotResolved
        document.removeEventListener("resume", this.onResumeCallbackBinded, false);
        this.disableInsomnia();
        var wsCoordinates: wsInterfaces.IWsCoordinate[] = [];
        for (let coordinate of this._requiredCoordinates) {
            if (coordinate.reached) {
                wsCoordinates.push(geoCoordinate.GeoCoordinate.convertToWsData(coordinate.reachedCoordinate));
            }
        }
        var missionProof: wsInterfaces.IMissionProof = {
            TimeElapsed: this._timeLimit - this._timeLeft,
            Coordinates: wsCoordinates
        };

        var api = new serviceApi.ServiceApi();
        api.callService({
            method: `mission/CompleteMission?missionId=${this.get("missionId") }`,
            requestType: "POST",
            data: JSON.stringify(missionProof)
        }).done((result) => {
            if (result.Status === 0) {
                switch (result.MissionCompletionStatus) {
                    case enums.MissionCompletionStatus.Success:
                        this.checkUniqueMission();
                        navigation.navigateToSucessView(enums.Direction.right, {
                            missionId: this.get("missionId"),
                            imageUrl: this.get("missionImagePath"),
                            experiencePoints: result.Points,
                            missionName: this.get("missionName"),
                            starsCount: result.StarsCount,
                            congratsMessage: this.get("congratsMessage")
                        });
                        return;
                    case enums.MissionCompletionStatus.Fail:
                        navigation.navigateToFailView(enums.Direction.right, {
                            imageUrl: this.get("missionImagePath"),
                            missionName: this.get("missionName"),
                            missionId: this.get("missionId")
                        });
                        return;
                }
            }
            navigator.notification.alert(result.Description,
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        });
    }

    private getPoints(): IPoint[] {

        var result: IPoint[] = [];
        this._requiredCoordinates.forEach((coord, index) => {
            result.push({
                pointName: coord.requiredCoordinate.name,
                reached: coord.reached,
                pointClass: coord.reached ? "reached" : "unreached",
                currentClass: (index === 0 && !coord.reached) || (!coord.reached && result[index - 1].reached) ? "current" : ""
            });
        });
        return result;

    }

    private firstPointReached(): boolean {
        return this._requiredCoordinates[0].reached;
    }

    private scrollToCurrent() {
        var scroller = $("#pointScroller");
        var activeElem = scroller.find(".current");
        var elemHeight = activeElem.height();

        var prevAll = activeElem.parent().prevAll();
        if (prevAll.length >= 2 && prevAll.length <= this.points.length - 2) {
            scroller.data("kendoMobileScroller").animatedScrollTo(0, -(elemHeight * (prevAll.length - 1)));
        }
    }

    private disableInsomnia() {
        if (window.plugins && window.plugins.insomnia)
            window.plugins.insomnia.allowSleepAgain();
    }

    private enableInsomia() {
        if (window.plugins && window.plugins.insomnia)
            window.plugins.insomnia.keepAwake();
    }

    private checkUniqueMission() {
        var missionId = this.get("missionId");
        var u: user.User,
            missionName = umissManager.UniqueMissionsManager.getMissionName(missionId);
        switch (missionName) {
            case "YourBase":
                u = user.User.getFromStorage();
                u.baseNorthCoordinate = this._requiredCoordinates[0].reachedCoordinate;
                u.baseEastCoordinate = this._requiredCoordinates[1].reachedCoordinate;
                u.baseSouthCoordinate = this._requiredCoordinates[2].reachedCoordinate;
                u.baseWestCoordinate = this._requiredCoordinates[3].reachedCoordinate;
                user.User.saveToStorage(u);
                break;
        }
    }
}

export function init(data: interfaces.IPathNavigationProperties) {
    if (!data) {
        showTimer = true;
    } else {
        showTimer = !(data.showTimer === false);
    }

}

function bindModel() {
    var model = new PathModel();
    kendo.bind($("#vPathSolution"), model, kendo.mobile.ui);
    model.onBinded();
    appTools.viewBinded();
}

function backButtonCallback() {
    navigation.navigateToMissionView(enums.Direction.right);
}

var app = appTools.getApp();
app.appInit.pathViewModelInit = () => {
    bindModel();
};

app.appInit.pathViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.pathViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};