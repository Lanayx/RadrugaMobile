var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/Enums", "../../../scripts/ServiceApi", "../../../scripts/models/Mission", "../../../scripts/models/User", "../../../scripts/Storage", "../../../scripts/geoLocation/GeoCoordinate", "../../../scripts/game/UniqueMissionsManager", "../../../scripts/models/HintsModalView"], function (require, exports, appTools, navigation, enums, serviceApi, miss, user, storage, geoCoordinate, umissManager, modalView) {
    "use strict";
    var showTries, maxTries;
    var CommonPlaceModel = (function (_super) {
        __extends(CommonPlaceModel, _super);
        function CommonPlaceModel() {
            _super.call(this);
            this.missionId = "";
            this.missionName = "";
            this.missionImagePath = "";
            this.isHasHints = false;
            this.tryButtonRes = appTools.getText("commonPlaceTryButton");
            this.tryRes = appTools.getText("commonPlaceTryCount");
            this.fromRes = appTools.getText("cmFrom");
            this._processStarted = false;
            _super.prototype.init.call(this, this);
        }
        CommonPlaceModel.prototype.onBack = function () {
            backButtonCallback();
        };
        CommonPlaceModel.prototype.onTry = function () {
            var _this = this;
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            var highAccuracy = !this._accuracyRadius || this._accuracyRadius < 500;
            var currentCoordinate;
            geoCoordinate.GeoCoordinate.getCurrent(highAccuracy)
                .then(function (coordinate) {
                currentCoordinate = coordinate;
                var missionProof = {
                    Coordinates: [geoCoordinate.GeoCoordinate.convertToWsData(currentCoordinate)]
                };
                var api = new serviceApi.ServiceApi();
                return api.callService({
                    method: "mission/CompleteMission?missionId=" + _this.get("missionId"),
                    requestType: "POST",
                    data: JSON.stringify(missionProof)
                });
            }).done(function (result) {
                if (result.Status === 0) {
                    switch (result.MissionCompletionStatus) {
                        case enums.MissionCompletionStatus.Success:
                            _this.checkUniqueMission(currentCoordinate);
                            navigation.navigateToSucessView(enums.Direction.right, {
                                missionId: _this.get("missionId"),
                                imageUrl: _this.get("missionImagePath"),
                                experiencePoints: result.Points,
                                missionName: _this.get("missionName"),
                                starsCount: result.StarsCount,
                                congratsMessage: _this.get("congratsMessage")
                            });
                            break;
                        case enums.MissionCompletionStatus.Fail:
                            navigation.navigateToFailView(enums.Direction.right, {
                                missionId: _this.get("missionId"),
                                imageUrl: _this.get("missionImagePath"),
                                missionName: _this.get("missionName")
                            });
                            break;
                        case enums.MissionCompletionStatus.IntermediateFail:
                            navigator.notification.alert(appTools.getText("commonPlace" + result.Description + "Message"), function () { }, appTools.getText("commonPlaceIncorrectTitle"), "OK");
                            var currentyTry = result.TryCount + 1;
                            _this.set("currentTry", currentyTry);
                            miss.Mission.setCurrentMissionTryCount(currentyTry);
                            break;
                    }
                }
                else
                    navigator.notification.alert(result.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            }).fail(function () {
                navigator.notification.alert(appTools.getText("geoCantObtainCoordinateMessage"), function () { }, appTools.getText("geoCantObtainCoordinateTitle"), "OK");
                _this._processStarted = false;
            });
        };
        CommonPlaceModel.prototype.onBinded = function () {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
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
        };
        CommonPlaceModel.prototype.openHintModal = function () {
            $(modalView.HintsModalView.ModalViewId).data("kendoMobileModalView").open();
        };
        CommonPlaceModel.prototype.checkUniqueMission = function (geoCoordinate) {
            var missionId = this.get("missionId");
            var u, missionName = umissManager.UniqueMissionsManager.getMissionName(missionId);
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
        };
        return CommonPlaceModel;
    }(kendo.data.ObservableObject));
    exports.CommonPlaceModel = CommonPlaceModel;
    function bindModel() {
        var model = new CommonPlaceModel();
        kendo.bind($("#vCommonPlaceSolution"), model, kendo.mobile.ui);
        model.onBinded();
        appTools.viewBinded();
    }
    function init(data) {
        if (!data) {
            showTries = true;
            return;
        }
        showTries = !(data.showTries === false);
        maxTries = data.maxTries;
    }
    exports.init = init;
    function backButtonCallback() {
        navigation.navigateToMissionView(enums.Direction.right);
    }
    var app = appTools.getApp();
    app.appInit.commonPlaceViewModelInit = function () {
        bindModel();
    };
    app.appInit.commonPlaceViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.commonPlaceViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
