/// <reference path="../../kendo/typescript/kendo.mobile.d.ts" />
/// <reference path="../../scripts/tsDefinitions/cordova/plugins/FileTransfer.d.ts" />
/// <reference path="../../scripts/tsDefinitions/cordova/plugins/Dialogs.d.ts" />
import imgCache = require("../../scripts/ImageCache");
import appTools = require("../../scripts/ApplicationTools");
import tools = require("../../scripts/Tools");
import usr = require("../../scripts/models/User");
import navigation = require("../../scripts/Navigation");
import enums = require("../../scripts/Enums");

export class ProfileViewModel extends kendo.data.ObservableObject {
    userId:string;
    menuHideDelay = 500;
    nickName = "";
    photoPath = "";
    level = "";
    levelPoints: number;
    maxLevelPoints: number;
    levelProgress = "";
    kindScale = "";
    radrugaColor = "";
    menuTextColor = "";
    questionMarkVisible = false;
    hasRadrugaColor: boolean;
    //resources 
    levelRes = appTools.getText("cmLevel");
    ratingRes = appTools.getText("cmRating");
    settingsRes = appTools.getText("cmSettings");
    achievementsRes = appTools.getText("cmAchievements");
    kindScaleRes = appTools.getText("cmKindScale");
    radrugaColorRes = appTools.getText("cmRadrugaColor");
    missionsRes = appTools.getText("profileMissions");
    kindActionsRes = appTools.getText("profileKindActions");
    moneyAccountRes = appTools.getText("profileMoneyAccount");
    openLocationsRes = appTools.getText("profileOpenLocations");

    constructor() {
        super();
        super.init(this);
    }

    onBinded() {
        var user = usr.User.getFromStorage();
        if (usr.User.refreshIsNeeded() || !user) {
            usr.User.getFromApi()
                .done((freshUser) => {
                    this.fillModel(freshUser);
                })
                .fail(() => {
                    if (user)
                        this.fillModel(user);
                });
        } else {
            this.fillModel(user);
        }
    }


    navigateToMissions() {
        navigation.navigateToMissionChainView(enums.Direction.left);
    }

    navigateToAddKindAction() {
        navigation.navigateToKindActionNewView(enums.Direction.down);
    }

    navigateToRating() {
        navigation.navigateToRatingView(enums.Direction.down);
    }

    navigateToAchievement() {
        navigation.navigateToAchievementView(enums.Direction.down);
    }

    navigateToQuestions() {
        navigation.navigateToQuestionView(enums.Direction.down);
        setTimeout(() => {
            this.toggleMenu();
        }, this.menuHideDelay);
    }

    navigateToOpenLocations() {
        navigation.navigateToBaseLocationsView(enums.Direction.down);
        setTimeout(() => {
            this.toggleMenu();            
        }, this.menuHideDelay);
    }

    navigateToAccount() {
        navigation.navigateToAccountView(enums.Direction.down);
        setTimeout(() => {
            this.toggleMenu();
        }, this.menuHideDelay);
    }

    navigateToKindActions() {
        navigation.navigateToKindActionListView(enums.Direction.down, {userId: this.userId});
        setTimeout(() => {
            this.toggleMenu();
        }, this.menuHideDelay);
    }

    navigateToSettings() {
        navigation.navigateToSettingsView(enums.Direction.right);
        setTimeout(() => {
            this.toggleMenu()
        }, this.menuHideDelay);
    }


    toggleMenu() {
        var hamburger = $(".c-hamburger");

        hamburger.toggleClass("is-active");

        $(".c-menu").toggleClass('is-active');
        $(".c-mask").toggleClass('is-active');


        if (hamburger.hasClass("is-active"))
            $("span", hamburger).css("background-color", this.get("menuTextColor"));
        else
            $("span", hamburger).css("background-color", "white");
    }


    private fillModel(user: usr.User) {
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
        this.set("radrugaColor", `#${color}`);
        this.set("menuTextColor", tools.getContrastColor(color));

        //STUB for devices not binding the color
        $(".svgNav").attr("fill", this.get("menuTextColor"));

        if (user.avatarUrl) {
            imgCache.ImageCache.getImagePathWithInit(user.avatarUrl).done((result) => {
                this.set("photoPath", `url(${result})`);
            });
        } else {
            this.set("photoPath", "url(styles/images/nophoto.png)");
        }
    }

    
}

function bindModel() {
    var viewModel = new ProfileViewModel();
    kendo.bind($("#vProfile"), viewModel, kendo.mobile.ui);
    viewModel.onBinded();
    appTools.viewBinded();
}

var app = appTools.getApp();
app.appInit.profileViewModelInit = () => {
    bindModel();
};

app.appInit.profileViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    appTools.overrideBackButton();
};

app.appInit.profileViewModelHide = () => {
    appTools.defaultBackButton();
};


