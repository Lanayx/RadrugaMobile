var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../scripts/ImageCache", "../../scripts/ApplicationTools", "../../scripts/Tools", "../../scripts/models/User", "../../scripts/Navigation", "../../scripts/Enums"], function (require, exports, imgCache, appTools, tools, usr, navigation, enums) {
    "use strict";
    var ProfileViewModel = (function (_super) {
        __extends(ProfileViewModel, _super);
        function ProfileViewModel() {
            _super.call(this);
            this.menuHideDelay = 500;
            this.nickName = "";
            this.photoPath = "";
            this.level = "";
            this.levelProgress = "";
            this.kindScale = "";
            this.radrugaColor = "";
            this.menuTextColor = "";
            this.questionMarkVisible = false;
            //resources 
            this.levelRes = appTools.getText("cmLevel");
            this.ratingRes = appTools.getText("cmRating");
            this.settingsRes = appTools.getText("cmSettings");
            this.achievementsRes = appTools.getText("cmAchievements");
            this.kindScaleRes = appTools.getText("cmKindScale");
            this.radrugaColorRes = appTools.getText("cmRadrugaColor");
            this.missionsRes = appTools.getText("profileMissions");
            this.kindActionsRes = appTools.getText("profileKindActions");
            this.moneyAccountRes = appTools.getText("profileMoneyAccount");
            this.openLocationsRes = appTools.getText("profileOpenLocations");
            _super.prototype.init.call(this, this);
        }
        ProfileViewModel.prototype.onBinded = function () {
            var _this = this;
            var user = usr.User.getFromStorage();
            if (usr.User.refreshIsNeeded() || !user) {
                usr.User.getFromApi()
                    .done(function (freshUser) {
                    _this.fillModel(freshUser);
                })
                    .fail(function () {
                    if (user)
                        _this.fillModel(user);
                });
            }
            else {
                this.fillModel(user);
            }
        };
        ProfileViewModel.prototype.navigateToMissions = function () {
            navigation.navigateToMissionChainView(enums.Direction.left);
        };
        ProfileViewModel.prototype.navigateToAddKindAction = function () {
            navigation.navigateToKindActionNewView(enums.Direction.down);
        };
        ProfileViewModel.prototype.navigateToRating = function () {
            navigation.navigateToRatingView(enums.Direction.down);
        };
        ProfileViewModel.prototype.navigateToAchievement = function () {
            navigation.navigateToAchievementView(enums.Direction.down);
        };
        ProfileViewModel.prototype.navigateToQuestions = function () {
            var _this = this;
            navigation.navigateToQuestionView(enums.Direction.down);
            setTimeout(function () {
                _this.toggleMenu();
            }, this.menuHideDelay);
        };
        ProfileViewModel.prototype.navigateToOpenLocations = function () {
            var _this = this;
            navigation.navigateToBaseLocationsView(enums.Direction.down);
            setTimeout(function () {
                _this.toggleMenu();
            }, this.menuHideDelay);
        };
        ProfileViewModel.prototype.navigateToAccount = function () {
            var _this = this;
            navigation.navigateToAccountView(enums.Direction.down);
            setTimeout(function () {
                _this.toggleMenu();
            }, this.menuHideDelay);
        };
        ProfileViewModel.prototype.navigateToKindActions = function () {
            var _this = this;
            navigation.navigateToKindActionListView(enums.Direction.down, { userId: this.userId });
            setTimeout(function () {
                _this.toggleMenu();
            }, this.menuHideDelay);
        };
        ProfileViewModel.prototype.navigateToSettings = function () {
            var _this = this;
            navigation.navigateToSettingsView(enums.Direction.right);
            setTimeout(function () {
                _this.toggleMenu();
            }, this.menuHideDelay);
        };
        ProfileViewModel.prototype.toggleMenu = function () {
            var hamburger = $(".c-hamburger");
            hamburger.toggleClass("is-active");
            $(".c-menu").toggleClass('is-active');
            $(".c-mask").toggleClass('is-active');
            if (hamburger.hasClass("is-active"))
                $("span", hamburger).css("background-color", this.get("menuTextColor"));
            else
                $("span", hamburger).css("background-color", "white");
        };
        ProfileViewModel.prototype.fillModel = function (user) {
            var _this = this;
            this.userId = user.id;
            this.set("nickName", user.nickName);
            this.set("level", user.level);
            this.set("levelProgress", user.levelPercentage);
            this.set("levelPoints", user.levelPoints);
            this.set("maxLevelPoints", user.maxLevelPoints);
            this.set("kindScale", user.kindScale);
            this.set("hasRadrugaColor", !!user.radrugaColor);
            var color = this.hasRadrugaColor
                ? user.radrugaColor
                : "30323a";
            this.set("radrugaColor", "#" + color);
            this.set("menuTextColor", tools.getContrastColor(color));
            //STUB for devices not binding the color
            $(".svgNav").attr("fill", this.get("menuTextColor"));
            if (user.avatarUrl) {
                imgCache.ImageCache.getImagePathWithInit(user.avatarUrl).done(function (result) {
                    _this.set("photoPath", "url(" + result + ")");
                });
            }
            else {
                this.set("photoPath", "url(styles/images/nophoto.png)");
            }
        };
        return ProfileViewModel;
    }(kendo.data.ObservableObject));
    exports.ProfileViewModel = ProfileViewModel;
    function bindModel() {
        var viewModel = new ProfileViewModel();
        kendo.bind($("#vProfile"), viewModel, kendo.mobile.ui);
        viewModel.onBinded();
        appTools.viewBinded();
    }
    var app = appTools.getApp();
    app.appInit.profileViewModelInit = function () {
        bindModel();
    };
    app.appInit.profileViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        appTools.overrideBackButton();
    };
    app.appInit.profileViewModelHide = function () {
        appTools.defaultBackButton();
    };
});
