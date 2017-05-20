/// <reference path="../../../scripts/tsDefinitions/cordova/plugins/Vibration.d.ts" />
import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import wsInterfaces = require("../../../scripts/models/WsInterfaces");
import enums = require("../../../scripts/Enums");
import serviceApi = require("../../../scripts/ServiceApi");
import miss = require("../../../scripts/models/Mission");
import storage = require("../../../scripts/Storage");

const restLimitSeconds: number = 5;
const watcherTimeoutMS: number = 1000;
const totalTimeSeconds: number = 2700;
const accelerationRange: number = 0.5;
const noTime: string = "--:--";
const indicatorErrorColor: string = "red";
const indicatorSuccessColor: string = "green";


export class PerpetumMobileModel extends kendo.data.ObservableObject {

    missionId = "";
    missionName = "";
    missionImagePath = "";

    currentTry: number;
    indicatorBackground: string = indicatorErrorColor;
    timeLeftRepresentation: string = noTime;
    showStartButton: boolean = true;

    //labels below
    timeLeftRes = appTools.getText("perpetumMobileTimeLeft");
    tryRes = appTools.getText("perpetumMobileCurrentTry");
    startButton = appTools.getText("perpetumMobileStart");

    private _timeLeft: number = totalTimeSeconds;
    private _restSecondsCounter: number = 0;
    private _lastAccelleration: number = 9.81;
    private _watchId: WatchHandle;
    spanDirectionX: any;
    spanDirectionY: any;
    spanDirectionZ: any;
    delta: any;

    constructor() {
        super();
        super.init(this);
    }

    onBack() {
        this.stopWatch();
        backButtonCallback();
    }

    onStart() {
        this.startWatch();
    }

    onBinded() {
        var model: miss.Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        this.set("missionImagePath", "url(" + model.imageUrl + ")");
        this.set("missionName", model.name);        
        this.set("missionId", model.id);
        this.set("currentTry", model.currentTry);
        if (model.missionStarted) {
            this.increaseCurrentTry();
            miss.Mission.setCurrentMissionStarted(false);
        } 
    }

    // Start watching the acceleration
    private startWatch() {
        // Only start testing if watchID is currently undefined.
        if (!this._watchId) {
            this.enableInsomia();
            this.changeButtonVisibility(false);
            this.resetCounter();
            this.resetTimer();
            miss.Mission.setCurrentMissionStarted(true);

            this._watchId = navigator.accelerometer.watchAcceleration((acceleration) => {
                this.onAccelerometerSuccess(acceleration);
            }, (error) => {
                this.onAccelerometerError(error);
            // ReSharper disable once RedundantTypeCast
            }, { frequency: <number>watcherTimeoutMS });
        }
    }

    // Stop watching the acceleration
    private stopWatch(fromErrorState?: boolean) {
        if (this._watchId !== undefined) {
            navigator.accelerometer.clearWatch(this._watchId);
            this._watchId = undefined;
            if (!fromErrorState) {
                this.increaseCurrentTry();
            }

            this.changeButtonVisibility(true);
            this.resetCounter();
            this.resetTimer(fromErrorState);
            miss.Mission.setCurrentMissionStarted(false);
            this.disableInsomnia();
        }
    }

    //Get a snapshot of the current acceleration
    private onAccelerometerSuccess(acceleration: Acceleration) {
        this.set("spanDirectionX", acceleration.x);
        this.set("spanDirectionY", acceleration.y);
        this.set("spanDirectionZ", acceleration.z);

        var x = acceleration.x;
        var y = acceleration.y;
        var z = acceleration.z;
        var currentAccelleration = Math.sqrt(x * x + y * y + z * z);
        var delta = currentAccelleration - this._lastAccelleration;
        this.set("delta", delta);

        if (-accelerationRange < delta && delta < accelerationRange) {
            if (this._restSecondsCounter === restLimitSeconds) {
                this.stopWatch();
                navigator.vibrate(1000);
                return;
            } else {
                this._restSecondsCounter++;
                if (this._restSecondsCounter > 1) {
                    navigator.vibrate(500);
                }
            }
            this.setIndicatorColor(false);
        } else {
            this.resetCounter();
            this.setIndicatorColor(true);
        }

        var newTime = --this._timeLeft;
        if (newTime <= 0) {
            this.stopWatch();
            this.completeMission();
        }

        this.refreshTime(newTime);
    }

    //Failed to get the acceleration
    private onAccelerometerError(error) {
        if (navigator.simulator) {
            alert(error);
        } else {
            navigator.notification.alert(appTools.getText("perpetumMobileAccelerometerFailTitle"),
                () => { }, appTools.getText("perpetumMobileAccelerometerFail"), "OK");
            appTools.logError(error);
        }

        this.stopWatch(true);
    }

    private completeMission() {
        var missionProof: wsInterfaces.IMissionProof = {
            NumberOfTries: this.currentTry
        };

        var api = new serviceApi.ServiceApi();
        api.callService({
            method: `mission/CompleteMission?missionId=${this.get("missionId")}`,
            requestType: "POST",
            data: JSON.stringify(missionProof)
        }).done((result) => {
            alert(JSON.stringify(result));
            if (result.Status === 0 && result.MissionCompletionStatus === enums.MissionCompletionStatus.Success) {
                this.stopWatch();
                navigation.navigateToSucessView(enums.Direction.right, {
                    missionId: this.get("missionId"),
                    imageUrl: this.get("missionImagePath"),
                    experiencePoints: result.Points,
                    missionName: this.get("missionName"),
                    starsCount: result.StarsCount
                });
            }
            else
                navigator.notification.alert(result.Description,
                    () => {}, appTools.getText("cmApiErrorTitle"), "OK");

        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
            () => {}, appTools.getText("cmApiErrorTitle"), "OK");
        });
    }

    private changeButtonVisibility(show: boolean) {
        this.set("showStartButton", show);
    }

    private setIndicatorColor(success: boolean) {
        var color = success ? indicatorSuccessColor : indicatorErrorColor;
        this.set("indicatorBackground", color);
    }

    private increaseCurrentTry() {
        var nextTry = this.get("currentTry") + 1;
        this.set("currentTry", nextTry);
        miss.Mission.setCurrentMissionTryCount(nextTry);
    }

    private resetCounter() {
        this._restSecondsCounter = 0;
    }

    private resetTimer(fromErrorState?: boolean) {
        this._timeLeft = totalTimeSeconds;
        if (fromErrorState) {
            this.set("timeLeftRepresentation", noTime);
        } else {
            this.refreshTime(totalTimeSeconds);
        }
    }

    private refreshTime(time: number) {
        var minutes = Math.floor(time / 60);
        var seconds = time - minutes * 60;
        var finalTime = this.formatTimeComponent(minutes) + ":" + this.formatTimeComponent(seconds);
        this.set("timeLeftRepresentation", finalTime);
        console.log(`Time refreshed: ${new Date()}`);
    }

    private formatTimeComponent(string) {
        return (new Array(3).join("0") + string).slice(-2);
    }

    private disableInsomnia() {
        if (window.plugins && window.plugins.insomnia)
            window.plugins.insomnia.allowSleepAgain();
    }

    private enableInsomia() {
        if (window.plugins && window.plugins.insomnia)
            window.plugins.insomnia.keepAwake();
    }
}

function bindModel() {
    var model = new PerpetumMobileModel();
    kendo.bind($("#vPerpetumMobileSolution"), model, kendo.mobile.ui);
    model.onBinded();
    appTools.viewBinded();
}

function backButtonCallback() {
    navigation.navigateToMissionView(enums.Direction.right);
}

var app = appTools.getApp();
app.appInit.perpetumMobileViewModelInit = () => {
    bindModel();
};

app.appInit.perpetumMobileViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.perpetumMobileViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};