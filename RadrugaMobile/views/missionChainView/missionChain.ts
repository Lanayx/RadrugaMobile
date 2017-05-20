import appTools = require("../../scripts/ApplicationTools");
import navigation = require("../../scripts/Navigation");
import enums = require("../../scripts/Enums");
import uiCommon = require("../../scripts/UiCommon");
import serviceApi = require("../../scripts/ServiceApi");
import wsInterfaces = require("../../scripts/models/WsInterfaces");
import miss = require("../../scripts/models/Mission");
import us = require("../../scripts/models/User");
import imgCache = require("../../scripts/ImageCache");

export class MissionChainViewModel extends kendo.data.ObservableObject {
    constructor() {
        super();
        super.init(this);
    }

    missionChainDataSource = [];

    navigateToProfile() {
        backButtonCallback();
    }

    missionChosen(event: Event) {
        var target = $(event.currentTarget);
        var missionId = target.attr("data-mission-id");
        if (this.parseMissionStatus(target.attr("data-mission-status"), missionId)) {
            navigation.navigateToMissionView(enums.Direction.left, { missionId: missionId });
        }
    }

    refreshMissions() {
        miss.MissionSet.forceRefresh();
        bindModel();
    }

    onBinded() {
        var sets = miss.MissionSet.getMissionSetsFromStorage();
        if (!sets || sets.length === 0) {
            this.processMissionsFromApi();
        } else {
            this.checkRefreshMissions(sets);
        }
    }

    private processMissionsFromApi() {
        app.application.pane.showLoading();//hotfix for not showing loader
        this.getSetsFromApi().done(() => {
            var missions = miss.Mission.getMissionsFromStorage();
            this.bindMissionsOrShowNotification(missions);
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
            () => {}, appTools.getText("cmApiErrorTitle"), "OK");
        });
    }

    private showRequiredTestNotification() {
        navigator.notification.alert(appTools.getText("chainTestRequired"),
            () => { }, appTools.getText("chainNoMissions"), "OK");
    }
    private showFinalNotification() {
        navigator.notification.alert(appTools.getText("chainFinished"),
            () => { }, appTools.getText("chainNoMissions"), "OK");
    }

    private checkRefreshMissions(missionSets: miss.MissionSet[]) {
        var setIndicesToRemove = [];
        for (var i = 0; i < missionSets.length; i++) {
            var completedMissions = $.grep(missionSets[i].missions, (mission) => {
                return mission.displayStatus === enums.MissionDisplayStatus.Succeeded || mission.displayStatus === enums.MissionDisplayStatus.Failed;
            }).length;
            if (missionSets[i].missions.length === completedMissions) {
                setIndicesToRemove.push(i);
            }
        }
        for (let index of setIndicesToRemove) {
            missionSets.splice(index, 1);
        }

        miss.MissionSet.saveMissionSetsToStorage(missionSets);
        if (missionSets.length < 3) {
            this.tryRefreshMissionsFromApi(missionSets);
        } else {
            this.bindMissionsOrShowNotification(miss.Mission.getMissionsFromStorage());
        }
    }

    private tryRefreshMissionsFromApi(currentSets: miss.MissionSet[]) {
        var lastMissionSetExist = $.grep(currentSets, (set) => {
            return set.id === "ab2ccc5f-ff6d-484b-a73b-e4265be6ef7f";
        }).length > 0;
        var user = us.User.getFromStorage();
        if (user.radrugaColor && !lastMissionSetExist) {
            this.processMissionsFromApi();
        } else {
            this.bindMissionsOrShowNotification(miss.Mission.getMissionsFromStorage());
        }
    }

    private getSetsFromApi(): JQueryPromise<any> {
        var api = new serviceApi.ServiceApi();
        appTools.getKendoApplication().showLoading();
        return api.callService({
            method: "mission/GetMissionSets",
            requestType: "GET"
        }).then((missionSets: wsInterfaces.IWsMissionSet[]) => {
            if (missionSets) {
                var convertedSets = missionSets.map(miss.MissionSet.getFromWsData);
                this.setDependenciesForMission(convertedSets);
                miss.MissionSet.saveMissionSetsToStorage(convertedSets);
            } else
                miss.MissionSet.saveMissionSetsToStorage([]);
        });
    }

    private setDependenciesForMission(missionSets: miss.MissionSet[]) {
        var missions = miss.Mission.getMissionsFromMissionSets(missionSets);
        if (!missions) {
            return;
        }
        for (let mission of missions) {
            if (mission.dependentMissionIds && mission.dependentMissionIds.length > 0) {
                for (let dependentMission of missions) {
                    if (mission.dependentMissionIds.indexOf(dependentMission.id) >= 0) {
                        if (!dependentMission.dependsOnMissionNames) {
                            dependentMission.dependsOnMissionNames = [];
                        }

                        dependentMission.dependsOnMissionNames.push(mission.name);
                    }
                }
            }
        }
    }

    private bindMissions(missions: miss.Mission[]) {
        if (!missions || missions.length < 1)
            return;

        this.bindStatusImages(missions);
        this.set("missionChainDataSource", missions); //display without images first
        uiCommon.displayDifficulty("#divMissionChainBody");
        imgCache.ImageCache.init().then(
            () => {
                var length = missions.length;
                var task = this.updateMissionPath(missions[0]);
                for (let i = 1; i < length; i++) {
                    (mission => {
                        task = task.then<any>(() => {
                            return this.updateMissionPath(mission);
                        });
                    })(missions[i]);
                }
                task.done(() => {
                    this.set("missionChainDataSource", missions);
                    uiCommon.displayDifficulty("#divMissionChainBody");
                }).fail((error) => {
                    appTools.logError(JSON.stringify(error));
                });

            }
        );
    }

    private updateMissionPath(m: miss.Mission): JQueryPromise<any> {
        return imgCache.ImageCache.getImagePath(m.imageUrl).then((result) => {
            m.imageUrl = `url(${result})`;
        });
    }

    private bindStatusImages(missions: miss.Mission[]) {
        missions.map(m => {
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
    }

    private parseMissionStatus(missionStatus: string, missionId: string) {
        switch (missionStatus) {
        case enums.MissionDisplayStatus.Succeeded.toString():
            navigator.notification.alert(appTools.getText("chainMissionSucceeded"),
            () => {}, appTools.getText("chainMissionInaccessibleTitle"), "OK");
            return false;
        case enums.MissionDisplayStatus.Failed.toString():
            navigator.notification.alert(appTools.getText("chainMissionFailed"),
            () => {}, appTools.getText("chainMissionInaccessibleTitle"), "OK");
            return false;
        case enums.MissionDisplayStatus.NotAvailable.toString():
            var mission = miss.Mission.getById(missionId);
            var dependsOn = mission.dependsOnMissionNames;
            var messageBody;
            if (dependsOn.length === 1) {
                messageBody = appTools.getText("chainMissionNotAvailable") + "'" + dependsOn[0] + "'.";
            } else {
                var namesString = "";
                for (var i = 0; i < dependsOn.length; i++) {
                    if (i !== 0) {
                        namesString += ", ";
                    }
                    namesString += `'${dependsOn[i]}'`;
                }
                messageBody = appTools.getText("chainMissionNotAvailableMultipleDependency") + namesString + ".";
            }

            navigator.notification.alert(messageBody,
            () => {}, appTools.getText("chainMissionInaccessibleTitle"), "OK");
            return false;
        case enums.MissionDisplayStatus.Waiting.toString():
            navigator.notification.alert(appTools.getText("chainMissionWaiting"),
            () => {}, appTools.getText("chainMissionInaccessibleTitle"), "OK");
            return false;
        default:
            return true;
        }
    }

    private bindMissionsOrShowNotification(missions: miss.Mission[]) {
        if (missions) {
            this.bindMissions(missions);
        } else {
            var user = us.User.getFromStorage();
            if (!user.radrugaColor) {
                this.showRequiredTestNotification();
            } else {
                this.showFinalNotification();
            }
        }
    }
}

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
app.appInit.missionChainViewModelInit = () => {
    bindModel();
};

app.appInit.missionChainViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }

    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.missionChainViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};