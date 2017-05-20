var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../scripts/ApplicationTools", "../../scripts/Navigation", "../../scripts/Enums", "../../scripts/UiCommon", "../../scripts/ServiceApi", "../../scripts/models/Mission", "../../scripts/models/User", "../../scripts/ImageCache"], function (require, exports, appTools, navigation, enums, uiCommon, serviceApi, miss, us, imgCache) {
    "use strict";
    var MissionChainViewModel = (function (_super) {
        __extends(MissionChainViewModel, _super);
        function MissionChainViewModel() {
            _super.call(this);
            this.missionChainDataSource = [];
            _super.prototype.init.call(this, this);
        }
        MissionChainViewModel.prototype.navigateToProfile = function () {
            backButtonCallback();
        };
        MissionChainViewModel.prototype.missionChosen = function (event) {
            var target = $(event.currentTarget);
            var missionId = target.attr("data-mission-id");
            if (this.parseMissionStatus(target.attr("data-mission-status"), missionId)) {
                navigation.navigateToMissionView(enums.Direction.left, { missionId: missionId });
            }
        };
        MissionChainViewModel.prototype.refreshMissions = function () {
            miss.MissionSet.forceRefresh();
            bindModel();
        };
        MissionChainViewModel.prototype.onBinded = function () {
            var sets = miss.MissionSet.getMissionSetsFromStorage();
            if (!sets || sets.length === 0) {
                this.processMissionsFromApi();
            }
            else {
                this.checkRefreshMissions(sets);
            }
        };
        MissionChainViewModel.prototype.processMissionsFromApi = function () {
            var _this = this;
            app.application.pane.showLoading(); //hotfix for not showing loader
            this.getSetsFromApi().done(function () {
                var missions = miss.Mission.getMissionsFromStorage();
                _this.bindMissionsOrShowNotification(missions);
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
        };
        MissionChainViewModel.prototype.showRequiredTestNotification = function () {
            navigator.notification.alert(appTools.getText("chainTestRequired"), function () { }, appTools.getText("chainNoMissions"), "OK");
        };
        MissionChainViewModel.prototype.showFinalNotification = function () {
            navigator.notification.alert(appTools.getText("chainFinished"), function () { }, appTools.getText("chainNoMissions"), "OK");
        };
        MissionChainViewModel.prototype.checkRefreshMissions = function (missionSets) {
            var setIndicesToRemove = [];
            for (var i = 0; i < missionSets.length; i++) {
                var completedMissions = $.grep(missionSets[i].missions, function (mission) {
                    return mission.displayStatus === enums.MissionDisplayStatus.Succeeded || mission.displayStatus === enums.MissionDisplayStatus.Failed;
                }).length;
                if (missionSets[i].missions.length === completedMissions) {
                    setIndicesToRemove.push(i);
                }
            }
            for (var _i = 0, setIndicesToRemove_1 = setIndicesToRemove; _i < setIndicesToRemove_1.length; _i++) {
                var index = setIndicesToRemove_1[_i];
                missionSets.splice(index, 1);
            }
            miss.MissionSet.saveMissionSetsToStorage(missionSets);
            if (missionSets.length < 3) {
                this.tryRefreshMissionsFromApi(missionSets);
            }
            else {
                this.bindMissionsOrShowNotification(miss.Mission.getMissionsFromStorage());
            }
        };
        MissionChainViewModel.prototype.tryRefreshMissionsFromApi = function (currentSets) {
            var lastMissionSetExist = $.grep(currentSets, function (set) {
                return set.id === "ab2ccc5f-ff6d-484b-a73b-e4265be6ef7f";
            }).length > 0;
            var user = us.User.getFromStorage();
            if (user.radrugaColor && !lastMissionSetExist) {
                this.processMissionsFromApi();
            }
            else {
                this.bindMissionsOrShowNotification(miss.Mission.getMissionsFromStorage());
            }
        };
        MissionChainViewModel.prototype.getSetsFromApi = function () {
            var _this = this;
            var api = new serviceApi.ServiceApi();
            appTools.getKendoApplication().showLoading();
            return api.callService({
                method: "mission/GetMissionSets",
                requestType: "GET"
            }).then(function (missionSets) {
                if (missionSets) {
                    var convertedSets = missionSets.map(miss.MissionSet.getFromWsData);
                    _this.setDependenciesForMission(convertedSets);
                    miss.MissionSet.saveMissionSetsToStorage(convertedSets);
                }
                else
                    miss.MissionSet.saveMissionSetsToStorage([]);
            });
        };
        MissionChainViewModel.prototype.setDependenciesForMission = function (missionSets) {
            var missions = miss.Mission.getMissionsFromMissionSets(missionSets);
            if (!missions) {
                return;
            }
            for (var _i = 0, missions_1 = missions; _i < missions_1.length; _i++) {
                var mission = missions_1[_i];
                if (mission.dependentMissionIds && mission.dependentMissionIds.length > 0) {
                    for (var _a = 0, missions_2 = missions; _a < missions_2.length; _a++) {
                        var dependentMission = missions_2[_a];
                        if (mission.dependentMissionIds.indexOf(dependentMission.id) >= 0) {
                            if (!dependentMission.dependsOnMissionNames) {
                                dependentMission.dependsOnMissionNames = [];
                            }
                            dependentMission.dependsOnMissionNames.push(mission.name);
                        }
                    }
                }
            }
        };
        MissionChainViewModel.prototype.bindMissions = function (missions) {
            var _this = this;
            if (!missions || missions.length < 1)
                return;
            this.bindStatusImages(missions);
            this.set("missionChainDataSource", missions); //display without images first
            uiCommon.displayDifficulty("#divMissionChainBody");
            imgCache.ImageCache.init().then(function () {
                var length = missions.length;
                var task = _this.updateMissionPath(missions[0]);
                for (var i = 1; i < length; i++) {
                    (function (mission) {
                        task = task.then(function () {
                            return _this.updateMissionPath(mission);
                        });
                    })(missions[i]);
                }
                task.done(function () {
                    _this.set("missionChainDataSource", missions);
                    uiCommon.displayDifficulty("#divMissionChainBody");
                }).fail(function (error) {
                    appTools.logError(JSON.stringify(error));
                });
            });
        };
        MissionChainViewModel.prototype.updateMissionPath = function (m) {
            return imgCache.ImageCache.getImagePath(m.imageUrl).then(function (result) {
                m.imageUrl = "url(" + result + ")";
            });
        };
        MissionChainViewModel.prototype.bindStatusImages = function (missions) {
            missions.map(function (m) {
                switch (m.displayStatus) {
                    case enums.MissionDisplayStatus.Succeeded:
                        m.displayStatusImage = "url(styles/svg/checkmark2.svg)";
                        break;
                    case enums.MissionDisplayStatus.Failed:
                        m.displayStatusImage = "url(styles/svg/circle-cross.svg)";
                        break;
                    case enums.MissionDisplayStatus.NotAvailable:
                        m.displayStatusImage = "url(styles/svg/circle-question.svg)";
                        break;
                    case enums.MissionDisplayStatus.Waiting:
                        m.displayStatusImage = "url(styles/svg/clock13.svg)";
                        break;
                }
            });
        };
        MissionChainViewModel.prototype.parseMissionStatus = function (missionStatus, missionId) {
            switch (missionStatus) {
                case enums.MissionDisplayStatus.Succeeded.toString():
                    navigator.notification.alert(appTools.getText("chainMissionSucceeded"), function () { }, appTools.getText("chainMissionInaccessibleTitle"), "OK");
                    return false;
                case enums.MissionDisplayStatus.Failed.toString():
                    navigator.notification.alert(appTools.getText("chainMissionFailed"), function () { }, appTools.getText("chainMissionInaccessibleTitle"), "OK");
                    return false;
                case enums.MissionDisplayStatus.NotAvailable.toString():
                    var mission = miss.Mission.getById(missionId);
                    var dependsOn = mission.dependsOnMissionNames;
                    var messageBody;
                    if (dependsOn.length === 1) {
                        messageBody = appTools.getText("chainMissionNotAvailable") + "'" + dependsOn[0] + "'.";
                    }
                    else {
                        var namesString = "";
                        for (var i = 0; i < dependsOn.length; i++) {
                            if (i !== 0) {
                                namesString += ", ";
                            }
                            namesString += "'" + dependsOn[i] + "'";
                        }
                        messageBody = appTools.getText("chainMissionNotAvailableMultipleDependency") + namesString + ".";
                    }
                    navigator.notification.alert(messageBody, function () { }, appTools.getText("chainMissionInaccessibleTitle"), "OK");
                    return false;
                case enums.MissionDisplayStatus.Waiting.toString():
                    navigator.notification.alert(appTools.getText("chainMissionWaiting"), function () { }, appTools.getText("chainMissionInaccessibleTitle"), "OK");
                    return false;
                default:
                    return true;
            }
        };
        MissionChainViewModel.prototype.bindMissionsOrShowNotification = function (missions) {
            if (missions) {
                this.bindMissions(missions);
            }
            else {
                var user = us.User.getFromStorage();
                if (!user.radrugaColor) {
                    this.showRequiredTestNotification();
                }
                else {
                    this.showFinalNotification();
                }
            }
        };
        return MissionChainViewModel;
    }(kendo.data.ObservableObject));
    exports.MissionChainViewModel = MissionChainViewModel;
    function bindModel() {
        var viewModel = new MissionChainViewModel();
        kendo.bind($("#vMissionChain"), viewModel, kendo.mobile.ui);
        viewModel.onBinded();
        appTools.viewBinded();
    }
    function backButtonCallback() {
        navigation.navigateToProfileView(enums.Direction.right);
    }
    var app = appTools.getApp();
    app.appInit.missionChainViewModelInit = function () {
        bindModel();
    };
    app.appInit.missionChainViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.missionChainViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
