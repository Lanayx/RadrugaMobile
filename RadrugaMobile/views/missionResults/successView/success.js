var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/Navigation", "../../../scripts/ApplicationTools", "../../../scripts/Enums", "../../../scripts/VkManager", "../../../scripts/ServiceApi", "../../../scripts/models/Mission", "../../../scripts/models/User", "../../../scripts/Configuration"], function (require, exports, navigation, appTools, enums, vk, serviceApi, miss, user, conf) {
    "use strict";
    var imageUrl, experiencePoints, missionName, starsCount, missionId, congrats;
    var SucessViewModel = (function (_super) {
        __extends(SucessViewModel, _super);
        function SucessViewModel() {
            _super.call(this);
            this.missionImagePath = imageUrl;
            this.displayVkButton = vk.Fields.hasVk();
            this.experiencePoints = "+" + experiencePoints + appTools.getText("cmExperienceR");
            this.secondStarVisible = false;
            this.thirdStarVisible = false;
            //resources 
            this.successTitleRes = appTools.getText("sucessMissionCompleted");
            this.goToMissionsRes = appTools.getText("cmGoToMissions");
            this.shareInVkRes = appTools.getText("sucessShareInVk");
            _super.prototype.init.call(this, this);
        }
        SucessViewModel.prototype.goToMissions = function () {
            backButtonCallback();
        };
        SucessViewModel.prototype.shareInVk = function () {
            var _this = this;
            var vkApi = new vk.VkApi();
            //slice url(..) before passing
            vkApi.post(appTools.getText("sucessShareMessage") + missionName, imageUrl.slice(4, -1)).done(function () {
                _this.set("displayVkButton", false);
                var api = new serviceApi.ServiceApi();
                api.callService({
                    requestType: "POST",
                    method: "user/VkRepostDone"
                }).done(function () {
                    appTools.forceRebind("Achievement");
                });
            }).fail(function () {
                navigator.notification.alert(appTools.getText("successVkShareFail"), function () { }, appTools.getText("cmVkError"), "OK");
            });
        };
        SucessViewModel.prototype.onBinded = function () {
            var _this = this;
            this.set("congratsMessage", congrats);
            if (starsCount > 1) {
                this.set("secondStarVisible", true);
                if (starsCount === 3) {
                    this.set("thirdStarVisible", true);
                }
            }
            var missionPassedCount = user.User.incrementPassedMissions();
            if (conf.Configuration.enableRating) {
                if (missionPassedCount % 5 === 0 && missionPassedCount < 16) {
                    setTimeout(function () {
                        _this.showRateMessage();
                    }, 1000);
                }
            }
        };
        SucessViewModel.prototype.showRateMessage = function () {
            var api = new serviceApi.ServiceApi();
            api.callService({
                requestType: "GET",
                method: "specials/GetRatePageUrl",
                data: { platform: device.platform }
            }).done(function (url) {
                navigator.notification.confirm(
                // The message
                appTools.getText("sucessRateAppDescription"), 
                // A callback when the user clicks a button
                function (index) {
                    // index is the 1-based index of the clicked button.
                    // 1 == Sure, 2 == Later
                    if (index === 1) {
                        user.User.incrementPassedMissions(1000);
                        window.open(url, "_blank");
                    }
                }, 
                // The title of the notification
                appTools.getText("sucessRateAppTitle"), 
                // The text for the two buttons
                [appTools.getText("sucessRateAppYes"), appTools.getText("sucessRateAppLater")]);
            });
        };
        return SucessViewModel;
    }(kendo.data.ObservableObject));
    exports.SucessViewModel = SucessViewModel;
    function init(options) {
        imageUrl = options.imageUrl;
        experiencePoints = options.experiencePoints;
        missionName = options.missionName;
        starsCount = options.starsCount;
        missionId = options.missionId;
        congrats = options.congratsMessage;
    }
    exports.init = init;
    function bindModel() {
        var viewModel = new SucessViewModel();
        kendo.bind($("#vSuccess"), viewModel, kendo.mobile.ui);
        viewModel.onBinded();
    }
    function backButtonCallback() {
        navigation.navigateToMissionChainView(enums.Direction.right);
    }
    var app = appTools.getApp();
    app.appInit.successViewModelShow = function () {
        bindModel();
        miss.Mission.setMissionDisplayStatus(missionId, enums.MissionDisplayStatus.Succeeded);
        user.User.updateLevelPoints(experiencePoints);
        appTools.forceRebind("MissionChain", "Profile");
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.successViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
