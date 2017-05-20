var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/Enums", "../../../scripts/ServiceApi", "../../../scripts/models/Mission", "../../../scripts/Storage", "../../../scripts/geoLocation/GeoCoordinate", "../../../scripts/models/User", "../../../scripts/game/UniqueMissionsManager", "../../../scripts/models/HintsModalView"], function (require, exports, appTools, navigation, enums, serviceApi, miss, storage, geoCoordinate, user, umissManager, modalView) {
    "use strict";
    var showTimer;
    var PathModel = (function (_super) {
        __extends(PathModel, _super);
        function PathModel() {
            _super.call(this);
            this.missionId = "";
            this.missionName = "";
            this.missionImagePath = "";
            this.isHasHints = false;
            this.timeLeftRepresentation = "--:--";
            this.actionButtonText = appTools.getText("pathStart");
            this.timeLeftRes = appTools.getText("pathTimeLeft");
            this._requiredCoordinates = [];
            this._loopTimer = true;
            this._processStarted = false;
            _super.prototype.init.call(this, this);
            this.onResumeCallbackBinded = this.onResumeCallback.bind(this);
        }
        PathModel.prototype.onBack = function () {
            this.disableInsomnia();
            backButtonCallback();
        };
        PathModel.prototype.onCompletePoint = function () {
            var _this = this;
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            var currentExecutableCoordinate = null;
            var nextCoordinate = null;
            var firstPoint = !this.firstPointReached();
            for (var _i = 0, _a = this._requiredCoordinates; _i < _a.length; _i++) {
                var coordinate = _a[_i];
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
            if (currentExecutableCoordinate == null && this._requiredCoordinates.every(function (coord) { return coord.reached; })) {
                this._loopTimer = false;
                this.completeMission();
                appTools.logError("Stub late path completion");
                return;
            }
            var highAccuracy = this._accuracyRadius < 500;
            geoCoordinate.GeoCoordinate.getCurrent(highAccuracy)
                .done(function (coordinate) {
                coordinate.getDistance(currentExecutableCoordinate.requiredCoordinate.coordinate).then(function (distance) {
                    if (distance > _this._accuracyRadius && !currentExecutableCoordinate.requiredCoordinate.test) {
                        if (distance > _this._accuracyRadius * 2)
                            navigator.notification.alert(appTools.getText("pathPointIncorrectMessage"), function () { }, appTools.getText("pathPointIncorrectTitle"), "OK");
                        else
                            navigator.notification.alert(appTools.getText("pathPointIsNearMessage"), function () { }, appTools.getText("pathPointIncorrectTitle"), "OK");
                        _this._processStarted = false;
                    }
                    else {
                        currentExecutableCoordinate.reached = true;
                        currentExecutableCoordinate.reachedCoordinate = coordinate;
                        miss.Mission.setCurrentMissionCompletedCoordinates(_this._requiredCoordinates);
                        if (nextCoordinate === null) {
                            _this._loopTimer = false;
                            _this.completeMission();
                        }
                        else {
                            if (firstPoint) {
                                var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
                                _this.startMission(model);
                            }
                            _this._processStarted = false;
                        }
                        _this.points.splice(0, _this.points.length);
                        _this.points.push.apply(_this.points, _this.getPoints());
                        _this.scrollToCurrent();
                    }
                });
            }).fail(function () {
                navigator.notification.alert(appTools.getText("geoCantObtainCoordinateMessage"), function () { }, appTools.getText("geoCantObtainCoordinateTitle"), "OK");
                _this._processStarted = false;
            });
        };
        PathModel.prototype.onBinded = function () {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
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
            document.addEventListener("resume", this.onResumeCallbackBinded, false);
        };
        PathModel.prototype.openHintModal = function () {
            $(modalView.HintsModalView.ModalViewId).data("kendoMobileModalView").open();
        };
        PathModel.prototype.onResumeCallback = function (event) {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
            this._timeLeft = this._timeLimit - Math.round(((new Date()).getTime() - (new Date(model.startExecutionTime)).getTime()) / 1000);
            this.refreshTime(this._timeLeft);
        };
        PathModel.prototype.startMission = function (model, firstPointPassed) {
            this.set("actionButtonText", appTools.getText("pathOnThePosition"));
            this.enableInsomia();
            if (!showTimer)
                return;
            if (model.startExecutionTime) {
                this._timeLeft = this._timeLimit - Math.round(((new Date()).getTime() - (new Date(model.startExecutionTime)).getTime()) / 1000);
            }
            else {
                this._timeLeft = this._timeLimit;
                miss.Mission.setCurrentMissionStartExecution();
            }
            this.refreshTime(this._timeLeft);
            this.startTimer();
        };
        PathModel.prototype.refreshTime = function (time) {
            var minutes = Math.floor(time / 60);
            var seconds = time - minutes * 60;
            var finalTime = this.formatTimeComponent(minutes) + ":" + this.formatTimeComponent(seconds);
            this.set("timeLeftRepresentation", finalTime);
        };
        PathModel.prototype.formatTimeComponent = function (string) {
            return (new Array(3).join("0") + string).slice(-2);
        };
        PathModel.prototype.startTimer = function () {
            var _this = this;
            setTimeout(function () {
                var newTime = _this._timeLeft - 1;
                _this._timeLeft = newTime;
                if (newTime <= 0) {
                    _this._loopTimer = false;
                    _this._timeLeft = -1;
                    _this.completeMission();
                }
                _this.refreshTime(newTime);
                if (_this._loopTimer) {
                    _this.startTimer();
                }
            }, 1000);
        };
        PathModel.prototype.completeMission = function () {
            var _this = this;
            document.removeEventListener("resume", this.onResumeCallbackBinded, false);
            this.disableInsomnia();
            var wsCoordinates = [];
            for (var _i = 0, _a = this._requiredCoordinates; _i < _a.length; _i++) {
                var coordinate = _a[_i];
                if (coordinate.reached) {
                    wsCoordinates.push(geoCoordinate.GeoCoordinate.convertToWsData(coordinate.reachedCoordinate));
                }
            }
            var missionProof = {
                TimeElapsed: this._timeLimit - this._timeLeft,
                Coordinates: wsCoordinates
            };
            var api = new serviceApi.ServiceApi();
            api.callService({
                method: "mission/CompleteMission?missionId=" + this.get("missionId"),
                requestType: "POST",
                data: JSON.stringify(missionProof)
            }).done(function (result) {
                if (result.Status === 0) {
                    switch (result.MissionCompletionStatus) {
                        case enums.MissionCompletionStatus.Success:
                            _this.checkUniqueMission();
                            navigation.navigateToSucessView(enums.Direction.right, {
                                missionId: _this.get("missionId"),
                                imageUrl: _this.get("missionImagePath"),
                                experiencePoints: result.Points,
                                missionName: _this.get("missionName"),
                                starsCount: result.StarsCount,
                                congratsMessage: _this.get("congratsMessage")
                            });
                            return;
                        case enums.MissionCompletionStatus.Fail:
                            navigation.navigateToFailView(enums.Direction.right, {
                                imageUrl: _this.get("missionImagePath"),
                                missionName: _this.get("missionName"),
                                missionId: _this.get("missionId")
                            });
                            return;
                    }
                }
                navigator.notification.alert(result.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        PathModel.prototype.getPoints = function () {
            var result = [];
            this._requiredCoordinates.forEach(function (coord, index) {
                result.push({
                    pointName: coord.requiredCoordinate.name,
                    reached: coord.reached,
                    pointClass: coord.reached ? "reached" : "unreached",
                    currentClass: (index === 0 && !coord.reached) || (!coord.reached && result[index - 1].reached) ? "current" : ""
                });
            });
            return result;
        };
        PathModel.prototype.firstPointReached = function () {
            return this._requiredCoordinates[0].reached;
        };
        PathModel.prototype.scrollToCurrent = function () {
            var scroller = $("#pointScroller");
            var activeElem = scroller.find(".current");
            var elemHeight = activeElem.height();
            var prevAll = activeElem.parent().prevAll();
            if (prevAll.length >= 2 && prevAll.length <= this.points.length - 2) {
                scroller.data("kendoMobileScroller").animatedScrollTo(0, -(elemHeight * (prevAll.length - 1)));
            }
        };
        PathModel.prototype.disableInsomnia = function () {
            if (window.plugins && window.plugins.insomnia)
                window.plugins.insomnia.allowSleepAgain();
        };
        PathModel.prototype.enableInsomia = function () {
            if (window.plugins && window.plugins.insomnia)
                window.plugins.insomnia.keepAwake();
        };
        PathModel.prototype.checkUniqueMission = function () {
            var missionId = this.get("missionId");
            var u, missionName = umissManager.UniqueMissionsManager.getMissionName(missionId);
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
        };
        return PathModel;
    }(kendo.data.ObservableObject));
    exports.PathModel = PathModel;
    function init(data) {
        if (!data) {
            showTimer = true;
        }
        else {
            showTimer = !(data.showTimer === false);
        }
    }
    exports.init = init;
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
    app.appInit.pathViewModelInit = function () {
        bindModel();
    };
    app.appInit.pathViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.pathViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
