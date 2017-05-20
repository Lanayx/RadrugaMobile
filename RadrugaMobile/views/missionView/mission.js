var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../scripts/Storage", "../../scripts/ImageCache", "../../scripts/ApplicationTools", "../../scripts/Navigation", "../../scripts/models/Mission", "../../scripts/Enums", "../../scripts/UiCommon", "../../scripts/game/UniqueMissionsManager"], function (require, exports, storage, imgCache, appTools, navigation, miss, enums, uiCommon, uniqueManager) {
    "use strict";
    var currentMissionId;
    var MissionViewModel = (function (_super) {
        __extends(MissionViewModel, _super);
        function MissionViewModel() {
            _super.call(this);
            this.missionImagePath = "";
            this.missionName = "";
            this.missionDetails = "";
            this.missions = [];
            _super.prototype.init.call(this, this);
        }
        MissionViewModel.prototype.onBinded = function () {
            var _this = this;
            var mission = this.getMissionDetails();
            if (!mission || mission.id !== currentMissionId) {
                var model = miss.Mission.getById(currentMissionId);
                this.setMissionDetails(model);
                this.fillModel(model, true).done(function () {
                    _this.setMissionDetails(model);
                });
                appTools.forceRebind("Camera", "CommonPlace", "Path", "RightAnswer", "TextCreation", "Video", "PerpetumMobile", "ShowYourself");
            }
            else {
                this.fillModel(mission, false);
            }
            uiCommon.displayDifficulty("#missionBody");
            this.manageMissionButtons();
        };
        MissionViewModel.prototype.manageMissionButtons = function () {
            var _this = this;
            $("#solveButton").text(appTools.getText("missionSolve")).off("click").click(function () {
                _this.onSolve();
            });
            $("#surrenderButton").text(appTools.getText("missionViewSurrender")).off("click").click(function () {
                _this.onSurrender();
            });
        };
        MissionViewModel.prototype.getMissionDetails = function () {
            return JSON.parse(storage.PermanentStorage.get("MissionDetails") || null);
        };
        MissionViewModel.prototype.setMissionDetails = function (value) {
            if (value !== null) {
                storage.PermanentStorage.set("MissionDetails", JSON.stringify(value));
            }
        };
        MissionViewModel.prototype.clearMissionDetails = function () {
            storage.PermanentStorage.set("MissionDetails", null);
        };
        MissionViewModel.prototype.navigateToMissionChain = function () {
            backButtonCallback();
        };
        MissionViewModel.prototype.onSurrender = function () {
            navigation.navigateToFailWarningView(enums.Direction.right, { missionId: currentMissionId, imageUrl: this.get("missionImagePath") });
        };
        MissionViewModel.prototype.onSolve = function () {
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
        };
        MissionViewModel.prototype.fillModel = function (data, convertUrl) {
            var _this = this;
            this.set("missionName", data.name);
            this.set("missionDetails", data.description.replace(/\r\n/g, "<br>"));
            this.set("missionDifficulty", data.difficulty);
            this.set("solutionType", data.solutionType);
            if (!convertUrl) {
                this.set("missionImagePath", "url(" + data.imageUrl + ")");
                return undefined;
            }
            return imgCache.ImageCache.getImagePathWithInit(data.imageUrl).then(function (result) {
                data.imageUrl = result;
                _this.set("missionImagePath", "url(" + result + ")");
            });
        };
        return MissionViewModel;
    }(kendo.data.ObservableObject));
    exports.MissionViewModel = MissionViewModel;
    function init(options) {
        currentMissionId = options.missionId;
    }
    exports.init = init;
    function bindModel() {
        var model = new MissionViewModel();
        kendo.bind($("#vMission"), model, kendo.mobile.ui);
        model.onBinded();
    }
    function backButtonCallback() {
        navigation.navigateToMissionChainView(enums.Direction.right);
    }
    var app = appTools.getApp();
    app.appInit.missionViewModelShow = function () {
        bindModel();
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.missionViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
