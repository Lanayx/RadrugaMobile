var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../scripts/ApplicationTools", "../../scripts/Navigation", "../../scripts/Enums", "../../scripts/ServiceApi"], function (require, exports, appTools, navigation, enums, serviceApi) {
    var AchievementViewModel = (function (_super) {
        __extends(AchievementViewModel, _super);
        function AchievementViewModel() {
            _super.call(this);
            this.achievementDefaultImage = "url(styles/svg/badge.svg)";
            this.achievementDataSource = [];
            _super.prototype.init.call(this, this);
        }
        AchievementViewModel.prototype.load = function () {
            this.getAchievements();
        };
        AchievementViewModel.prototype.getAchievements = function () {
            var _this = this;
            var api = new serviceApi.ServiceApi();
            app.application.pane.showLoading(); //hotfix for not showing loader
            api.callService({
                method: "user/GetAchievements",
                requestType: "GET"
            }).done(function (result) {
                _this.set("achievementDataSource", result.map(function (ach) {
                    return {
                        achievementDescription: ach.Description,
                        achievementProgress: ach.Percentage,
                        inProgress: ach.Percentage < 100,
                        finished: ach.Percentage === 100
                    };
                }));
                _this.drawBadgeProgress();
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
        };
        AchievementViewModel.prototype.drawBadgeProgress = function () {
            var _this = this;
            var svgs = $(".progressStrip");
            svgs.each(function (ind, elem) {
                var svg = $(elem).closest("svg");
                var percent = +svg.attr("data-progress");
                if (percent === 100) {
                    return;
                }
                var result = _this.getProgressPath(percent);
                $(elem).attr("d", result);
            });
        };
        AchievementViewModel.prototype.getProgressPath = function (percent) {
            var start = "M65,8 L65,0 ";
            if (percent === 0) {
                return start + "Z";
            }
            var degreesAngle = 3.6 * percent - 90;
            var thirdCoord = this.polarToCartesian(65, 65, 65, degreesAngle);
            var forthCoord = this.polarToCartesian(65, 65, 57, degreesAngle);
            var largeArc = percent > 50 ? 1 : 0;
            start += "A65 65 0 " + largeArc + " 1 " + thirdCoord[0] + "," + thirdCoord[1] + " ";
            start += "L" + forthCoord[0] + "," + forthCoord[1] + " ";
            start += "A57 57 0 " + largeArc + " 0 65,8 Z";
            return start;
        };
        AchievementViewModel.prototype.polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
            var angleInRadians = angleInDegrees * Math.PI / 180.0;
            var x = centerX + radius * Math.cos(angleInRadians);
            var y = centerY + radius * Math.sin(angleInRadians);
            return [x, y];
        };
        return AchievementViewModel;
    })(kendo.data.ObservableObject);
    exports.AchievementViewModel = AchievementViewModel;
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
    app.appInit.achievementViewModelInit = function () {
        bindModel();
        bindCloseButton();
    };
    app.appInit.achievementViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.achievementViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
