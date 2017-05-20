var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../scripts/ServiceApi", "../../scripts/ApplicationTools", "../../scripts/Tools", "../../scripts/models/UserViewInfo", "../../scripts/Navigation", "../../scripts/Enums"], function (require, exports, serviceApi, appTools, tools, usr, navigation, enums) {
    "use strict";
    var userId, avatar, points;
    var ProfileReadViewModel = (function (_super) {
        __extends(ProfileReadViewModel, _super);
        function ProfileReadViewModel() {
            _super.call(this);
            this.nickName = "";
            this.photoPath = "";
            this.level = "";
            this.levelProgress = "";
            this.kindScale = "";
            this.radrugaColor = "";
            //resources 
            this.levelRes = appTools.getText("cmLevel");
            this.ratingRes = appTools.getText("cmRating");
            this.achievementsRes = appTools.getText("cmAchievements");
            this.kindScaleRes = appTools.getText("cmKindScale");
            this.missionsRes = appTools.getText("cmMissions");
            this.kindActionsRes = appTools.getText("cmKindActions");
            _super.prototype.init.call(this, this);
        }
        ProfileReadViewModel.prototype.onBinded = function () {
            var _this = this;
            this.getModelFromApi().then(function (user) {
                _this.fillModel(user);
            });
        };
        ProfileReadViewModel.prototype.navigateToRating = function () {
            navigation.navigateToRatingView(enums.Direction.down);
        };
        ProfileReadViewModel.prototype.navigateToKindActions = function () {
            navigation.navigateToKindActionListView(enums.Direction.right, { userId: userId, avatar: avatar, points: points });
        };
        ProfileReadViewModel.prototype.fillModel = function (user) {
            this.set("nickName", user.nickName);
            this.set("level", user.level);
            this.set("levelProgress", user.levelPercentage);
            this.set("levelPoints", user.levelPoints);
            this.set("maxLevelPoints", user.maxLevelPoints);
            this.set("kindScale", user.kindScale);
            this.set("missionsPassed", user.completedMissionIdsCount);
            this.set("missionsFailed", user.failedMissionIdsCount);
            this.set("country", user.countryShortName);
            this.set("city", user.cityShortName);
            this.set("achievementsCount", (+user.fiveRepostsBadge) + (+user.fiveSetsBadge) + (+user.threeFiveStarsBadge) + (+user.kindScaleBadge) + (+user.ratingGrowthBadge));
            var color = user.radrugaColor || "30323a";
            var contrastColor = tools.getContrastColor(color);
            this.set("radrugaColor", "background-image: linear-gradient(#" + color + ",#" + color + "); background-image: -webkit-linear-gradient(#" + color + ",#" + color + ");color:" + contrastColor);
            //STUB for devices not binding the color
            $(".profileReadBack").attr("fill", contrastColor);
            this.set("photoPath", avatar);
            this.set("points", points);
            this.set("globalRank", user.globalRank > 0 ? user.globalRank : "x");
            this.set("countryRank", user.countryRank > 0 ? user.countryRank : "x");
            this.set("cityRank", user.cityRank > 0 ? user.cityRank : "x");
            this.set("kindActionsCount", user.kindActionsCount || 0);
            this.set("kindActionMarksCount", user.kindActionMarksCount || 0);
        };
        ProfileReadViewModel.prototype.getModelFromApi = function () {
            var def = $.Deferred();
            var api = new serviceApi.ServiceApi();
            appTools.getKendoApplication().showLoading();
            api.callService({
                method: "user/GetById/" + userId,
                requestType: "GET"
            }).done(function (profileReadData) {
                var user = usr.UserViewInfo.getFromWsData(profileReadData);
                def.resolve(user);
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                def.reject();
            });
            return def.promise();
        };
        return ProfileReadViewModel;
    }(kendo.data.ObservableObject));
    exports.ProfileReadViewModel = ProfileReadViewModel;
    var viewModel;
    function init(options) {
        if (userId !== options.userId)
            appTools.forceRebind("ProfileRead");
        else
            viewModel && viewModel.set("points", options.points); //likes should always be updated
        userId = options.userId;
        avatar = options.avatar;
        points = options.points;
    }
    exports.init = init;
    function bindModel() {
        viewModel = new ProfileReadViewModel();
        kendo.bind($("#vProfileRead"), viewModel, kendo.mobile.ui);
        viewModel.onBinded();
        appTools.viewBinded();
    }
    var app = appTools.getApp();
    app.appInit.profileReadViewModelInit = function () {
        bindModel();
    };
    app.appInit.profileReadViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        appTools.overrideBackButton();
    };
    app.appInit.profileReadViewModelHide = function () {
        appTools.defaultBackButton();
    };
});
