import serviceApi = require("../../scripts/ServiceApi");
import imgCache = require("../../scripts/ImageCache");
import appTools = require("../../scripts/ApplicationTools");
import tools = require("../../scripts/Tools");
import usr = require("../../scripts/models/UserViewInfo");
import navigation = require("../../scripts/Navigation");
import enums = require("../../scripts/Enums");
import interfaces = require("../../scripts/Interfaces");
var userId: string, avatar: string, points: string;
export class ProfileReadViewModel extends kendo.data.ObservableObject {
    nickName = "";
    photoPath = "";
    level = "";
    city:string;
    country:string;
    levelPoints: number;
    maxLevelPoints: number;
    levelProgress = "";
    kindScale = "";
    radrugaColor = "";
    missionsPassed: number;
    missionsFailed: number;
    achievementsCount: number;
    globalRank: string;
    countryRank: string;
    cityRank: string;
    points: string;
    kindActionsCount: number;
    kindActionMarksCount: number;

    //resources 
    levelRes = appTools.getText("cmLevel");
    ratingRes = appTools.getText("cmRating");
    achievementsRes = appTools.getText("cmAchievements");
    kindScaleRes = appTools.getText("cmKindScale");
    missionsRes = appTools.getText("cmMissions");
    kindActionsRes = appTools.getText("cmKindActions");

    constructor() {
        super();
        super.init(this);
    }

    onBinded() {
        this.getModelFromApi().then(user => {
            this.fillModel(user);
        });
    }

    navigateToRating() {
        navigation.navigateToRatingView(enums.Direction.down);
    }

    navigateToKindActions() {
        navigation.navigateToKindActionListView(enums.Direction.right, { userId: userId, avatar: avatar, points: points });
    }

    private fillModel(user: usr.UserViewInfo) {
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
        this.set("radrugaColor",
            `background-image: linear-gradient(#${color},#${color}); background-image: -webkit-linear-gradient(#${color},#${color});color:${contrastColor}`);
        //STUB for devices not binding the color
        $(".profileReadBack").attr("fill", contrastColor);

        this.set("photoPath", avatar);
        this.set("points", points);
        this.set("globalRank", user.globalRank > 0 ? user.globalRank : "x");
        this.set("countryRank", user.countryRank > 0 ? user.countryRank : "x");
        this.set("cityRank", user.cityRank > 0 ? user.cityRank : "x");
        this.set("kindActionsCount", user.kindActionsCount || 0);
        this.set("kindActionMarksCount", user.kindActionMarksCount || 0);
    }

    private getModelFromApi(): JQueryPromise<usr.UserViewInfo> {
        var def = $.Deferred();
        var api = new serviceApi.ServiceApi();
        appTools.getKendoApplication().showLoading();
        api.callService({
            method: "user/GetById/"+userId,
            requestType: "GET"
        }).done((profileReadData) => {          
            var user = usr.UserViewInfo.getFromWsData(profileReadData);
            def.resolve(user);
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            def.reject();
        });
        return def.promise();
    }
}

var viewModel;
export function init(options: interfaces.IUserNavigationProperties) {
    if (userId !== options.userId)
        appTools.forceRebind("ProfileRead");
    else
        viewModel && viewModel.set("points", options.points);//likes should always be updated
    userId = options.userId;
    avatar = options.avatar;
    points = options.points;
}

function bindModel() {
    viewModel = new ProfileReadViewModel();
    kendo.bind($("#vProfileRead"), viewModel, kendo.mobile.ui);
    viewModel.onBinded();
    appTools.viewBinded();
}

var app = appTools.getApp();
app.appInit.profileReadViewModelInit = () => {
    bindModel();
};

app.appInit.profileReadViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    appTools.overrideBackButton();
};

app.appInit.profileReadViewModelHide = () => {
    appTools.defaultBackButton();
};


