var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/Enums", "../../../scripts/ServiceApi", "../../../scripts/models/Mission", "../../../scripts/Storage"], function (require, exports, appTools, navigation, enums, serviceApi, miss, storage) {
    "use strict";
    var restLimitSeconds = 5;
    var watcherTimeoutMS = 1000;
    var totalTimeSeconds = 2700;
    var accelerationRange = 0.5;
    var noTime = "--:--";
    var indicatorErrorColor = "red";
    var indicatorSuccessColor = "green";
    var PerpetumMobileModel = (function (_super) {
        __extends(PerpetumMobileModel, _super);
        function PerpetumMobileModel() {
            _super.call(this);
            this.missionId = "";
            this.missionName = "";
            this.missionImagePath = "";
            this.indicatorBackground = indicatorErrorColor;
            this.timeLeftRepresentation = noTime;
            this.showStartButton = true;
            this.timeLeftRes = appTools.getText("perpetumMobileTimeLeft");
            this.tryRes = appTools.getText("perpetumMobileCurrentTry");
            this.startButton = appTools.getText("perpetumMobileStart");
            this._timeLeft = totalTimeSeconds;
            this._restSecondsCounter = 0;
            this._lastAccelleration = 9.81;
            _super.prototype.init.call(this, this);
        }
        PerpetumMobileModel.prototype.onBack = function () {
            this.stopWatch();
            backButtonCallback();
        };
        PerpetumMobileModel.prototype.onStart = function () {
            this.startWatch();
        };
        PerpetumMobileModel.prototype.onBinded = function () {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
            this.set("missionImagePath", "url(" + model.imageUrl + ")");
            this.set("missionName", model.name);
            this.set("missionId", model.id);
            this.set("currentTry", model.currentTry);
            if (model.missionStarted) {
                this.increaseCurrentTry();
                miss.Mission.setCurrentMissionStarted(false);
            }
        };
        PerpetumMobileModel.prototype.startWatch = function () {
            var _this = this;
            if (!this._watchId) {
                this.enableInsomia();
                this.changeButtonVisibility(false);
                this.resetCounter();
                this.resetTimer();
                miss.Mission.setCurrentMissionStarted(true);
                this._watchId = navigator.accelerometer.watchAcceleration(function (acceleration) {
                    _this.onAccelerometerSuccess(acceleration);
                }, function (error) {
                    _this.onAccelerometerError(error);
                }, { frequency: watcherTimeoutMS });
            }
        };
        PerpetumMobileModel.prototype.stopWatch = function (fromErrorState) {
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
        };
        PerpetumMobileModel.prototype.onAccelerometerSuccess = function (acceleration) {
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
                }
                else {
                    this._restSecondsCounter++;
                    if (this._restSecondsCounter > 1) {
                        navigator.vibrate(500);
                    }
                }
                this.setIndicatorColor(false);
            }
            else {
                this.resetCounter();
                this.setIndicatorColor(true);
            }
            var newTime = --this._timeLeft;
            if (newTime <= 0) {
                this.stopWatch();
                this.completeMission();
            }
            this.refreshTime(newTime);
        };
        PerpetumMobileModel.prototype.onAccelerometerError = function (error) {
            if (navigator.simulator) {
                alert(error);
            }
            else {
                navigator.notification.alert(appTools.getText("perpetumMobileAccelerometerFailTitle"), function () { }, appTools.getText("perpetumMobileAccelerometerFail"), "OK");
                appTools.logError(error);
            }
            this.stopWatch(true);
        };
        PerpetumMobileModel.prototype.completeMission = function () {
            var _this = this;
            var missionProof = {
                NumberOfTries: this.currentTry
            };
            var api = new serviceApi.ServiceApi();
            api.callService({
                method: "mission/CompleteMission?missionId=" + this.get("missionId"),
                requestType: "POST",
                data: JSON.stringify(missionProof)
            }).done(function (result) {
                alert(JSON.stringify(result));
                if (result.Status === 0 && result.MissionCompletionStatus === enums.MissionCompletionStatus.Success) {
                    _this.stopWatch();
                    navigation.navigateToSucessView(enums.Direction.right, {
                        missionId: _this.get("missionId"),
                        imageUrl: _this.get("missionImagePath"),
                        experiencePoints: result.Points,
                        missionName: _this.get("missionName"),
                        starsCount: result.StarsCount
                    });
                }
                else
                    navigator.notification.alert(result.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
        };
        PerpetumMobileModel.prototype.changeButtonVisibility = function (show) {
            this.set("showStartButton", show);
        };
        PerpetumMobileModel.prototype.setIndicatorColor = function (success) {
            var color = success ? indicatorSuccessColor : indicatorErrorColor;
            this.set("indicatorBackground", color);
        };
        PerpetumMobileModel.prototype.increaseCurrentTry = function () {
            var nextTry = this.get("currentTry") + 1;
            this.set("currentTry", nextTry);
            miss.Mission.setCurrentMissionTryCount(nextTry);
        };
        PerpetumMobileModel.prototype.resetCounter = function () {
            this._restSecondsCounter = 0;
        };
        PerpetumMobileModel.prototype.resetTimer = function (fromErrorState) {
            this._timeLeft = totalTimeSeconds;
            if (fromErrorState) {
                this.set("timeLeftRepresentation", noTime);
            }
            else {
                this.refreshTime(totalTimeSeconds);
            }
        };
        PerpetumMobileModel.prototype.refreshTime = function (time) {
            var minutes = Math.floor(time / 60);
            var seconds = time - minutes * 60;
            var finalTime = this.formatTimeComponent(minutes) + ":" + this.formatTimeComponent(seconds);
            this.set("timeLeftRepresentation", finalTime);
            console.log("Time refreshed: " + new Date());
        };
        PerpetumMobileModel.prototype.formatTimeComponent = function (string) {
            return (new Array(3).join("0") + string).slice(-2);
        };
        PerpetumMobileModel.prototype.disableInsomnia = function () {
            if (window.plugins && window.plugins.insomnia)
                window.plugins.insomnia.allowSleepAgain();
        };
        PerpetumMobileModel.prototype.enableInsomia = function () {
            if (window.plugins && window.plugins.insomnia)
                window.plugins.insomnia.keepAwake();
        };
        return PerpetumMobileModel;
    }(kendo.data.ObservableObject));
    exports.PerpetumMobileModel = PerpetumMobileModel;
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
    app.appInit.perpetumMobileViewModelInit = function () {
        bindModel();
    };
    app.appInit.perpetumMobileViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.perpetumMobileViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
