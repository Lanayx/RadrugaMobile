import appTools = require("../../scripts/ApplicationTools");
import navigation = require("../../scripts/Navigation");
import enums = require("../../scripts/Enums");
import serviceApi = require("../../scripts/ServiceApi");
import wsInterfaces = require("../../scripts/Models/WsInterfaces");

export class AchievementViewModel extends kendo.data.ObservableObject {
    constructor() {
        super();
        super.init(this);
    }

    achievementDefaultImage = "url(styles/svg/badge.svg)";
    achievementDataSource = [];

    load() {
        this.getAchievements();
    }

    private getAchievements() {
        var api = new serviceApi.ServiceApi();
        app.application.pane.showLoading();//hotfix for not showing loader
        api.callService({
            method: "user/GetAchievements",
            requestType: "GET"
        }).done((result: wsInterfaces.IAchievement[]) => {
            this.set("achievementDataSource",result.map((ach: wsInterfaces.IAchievement) => {
                return {
                    achievementDescription: ach.Description,
                    achievementProgress: ach.Percentage,
                    inProgress: ach.Percentage < 100,
                    finished: ach.Percentage === 100
                }
            }));
            this.drawBadgeProgress();
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
        });
    }

    private drawBadgeProgress() {
        var svgs = $(".progressStrip");

        svgs.each((ind, elem) => {
            var svg = $(elem).closest("svg");
            var percent = +svg.attr("data-progress");
            if (percent === 100) {
                return;
            }
            var result = this.getProgressPath(percent);
            $(elem).attr("d", result);
        });
    }

    private getProgressPath(percent): string {

        var start = "M65,8 L65,0 ";

        if (percent === 0) {
            return start+"Z";
        }
        var degreesAngle = 3.6 * percent - 90;
        var thirdCoord = this.polarToCartesian(65, 65, 65, degreesAngle);
        var forthCoord = this.polarToCartesian(65, 65, 57, degreesAngle);

        var largeArc = percent > 50 ? 1 : 0;

        start += "A65 65 0 " + largeArc+ " 1 " + thirdCoord[0] + "," + thirdCoord[1]+" ";
        start += "L" + forthCoord[0] + "," + forthCoord[1] + " ";
        start += "A57 57 0 " + largeArc + " 0 65,8 Z";
        return start;
    }

    private polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = angleInDegrees * Math.PI / 180.0;
        var x = centerX + radius * Math.cos(angleInRadians);
        var y = centerY + radius * Math.sin(angleInRadians);
        return [x, y];
    }
}

function bindCloseButton() {
    $("#vAchievement").on("click", ".closeIcon", backButtonCallback);
}

function bindModel() {
    var viewModel = new AchievementViewModel();
    kendo.bind($("#vAchievement"), viewModel, kendo.mobile.ui);
    viewModel.load();
    appTools.viewBinded();
}

function backButtonCallback() {
    navigation.navigateToProfileView(enums.Direction.up);
}

var app = appTools.getApp();
app.appInit.achievementViewModelInit = () => {
    bindModel();
    bindCloseButton();
};
app.appInit.achievementViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.achievementViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};
