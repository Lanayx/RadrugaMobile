import appTools = require("../../scripts/ApplicationTools");
import navigation = require("../../scripts/Navigation");
import enums = require("../../scripts/Enums");
import serviceApi = require("../../scripts/ServiceApi");
import wsInterfaces = require("../../scripts/Models/WsInterfaces");
import imgCache = require("../../scripts/ImageCache");
import us = require("../../scripts/models/User");

const leadersCount: number = 10;
var lastType = enums.RatingType.Common;
export class RatingViewModel extends kendo.data.ObservableObject {
    place = "";
    pointsCount = "";
    playersCount = "";
    method = "";
    commonSelected: boolean;
    countrySelected: boolean;
    citySelected: boolean;
    currentUserId: string;
    userHasLocation: boolean;

    //resources
    commonViewRes = appTools.getText("ratingCommonView");
    countryViewRes = appTools.getText("ratingCountryView");
    cityViewRes = appTools.getText("ratingCityView");

    constructor() {
        super();
        super.init(this);
    }

    load() {
        var currentUser = us.User.getFromStorage();
        this.currentUserId = currentUser.id;
        this.set("userHasLocation", !!currentUser.homeCoordinate);
        this.changeView(lastType);
    }

    topPlayersDataSource = [];

    nearPlayersDataSource = [];

    navigateToProfile() {
        backButtonCallback();
    }

    commonView() {
        this.changeView(enums.RatingType.Common);
    }

    countryView() {
        this.changeView(enums.RatingType.Country);
    }

    cityView() {
        this.changeView(enums.RatingType.City);
    }

    userChosen(event: Event) {
        var target = $(event.currentTarget);
        var userId = target.attr("data-user-id");
        var avatar = target.attr("data-avatar");
        var points = target.attr("data-points");
        navigation.navigateToProfileReadView(enums.Direction.left, { userId: userId, avatar: avatar, points: points });
    }

    private changeView(type: enums.RatingType) {
        switch (type) {
            case enums.RatingType.Common:
                this.set("commonSelected", true);
                this.set("countrySelected", false);
                this.set("citySelected", false);
                break;
            case enums.RatingType.Country:
                this.set("commonSelected", false);
                this.set("countrySelected", true);
                this.set("citySelected", false);
                break;
            case enums.RatingType.City:
                this.set("commonSelected", false);
                this.set("countrySelected", false);
                this.set("citySelected", true);
                break;
        }
        lastType = type;
        this.method = "user/GetRatings/" + type;
        this.getRatings();
    }

    private getRatings() {
        var api = new serviceApi.ServiceApi();
        app.application.pane.showLoading();//hotfix for not showing loader
        api.callService({
            method: this.method,
            requestType: "GET"
        }).done((result: wsInterfaces.IRatingsWithUsersCount) => {
            if (result.Ratings && result.Ratings.length > 0) {
                
                imgCache.ImageCache.init().then(() => {
                    var length = result.Ratings.length;
                    var task = this.getRatingInfo(result.Ratings[0], this.currentUserId);
                    var ratings = [];
                    for (let i = 1; i < length; i++) {
                        (ratingInfo => {
                            task = task.then<any>((ratingInfoWithImage) => {
                                ratings.push(ratingInfoWithImage);
                                return this.getRatingInfo(ratingInfo, this.currentUserId);
                            });
                        })(result.Ratings[i]);
                    }
                    task.done((ratingInfoWithImage) => {
                        ratings.push(ratingInfoWithImage);
                        if (ratings.length <= leadersCount) {
                            this.set("topPlayersDataSource", ratings);
                            this.set("nearPlayersDataSource", []);
                        } else {
                            var neighbours = [];
                            var neighboursCount = ratings.length - leadersCount;
                            for (var i = 0; i < neighboursCount; i++) {
                                neighbours.push(ratings[leadersCount + i]);
                            }
                            ratings.splice(leadersCount, neighboursCount);
                            this.set("nearPlayersDataSource", neighbours);
                            this.set("topPlayersDataSource", ratings);
                        }
                    }).fail(() => {
                        alert("fail");
                    });
                });
            }

            this.set("playersCount", result.UsersCount);
            this.set("playersCountRes", this.getPlayersResource(result.UsersCount % 100));

        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
        });

    }

    private getRatingInfo(rating: wsInterfaces.IRatingInfo, currentUserId: string) {
        var deferred = $.Deferred();
        var ratingInfo = {
            playerPlace: rating.Place === -1 ? "*" : rating.Place.toString(),
            playerNickName: rating.NickName,
            playerPointsCount: rating.Points,
            userId: rating.UserId,
            playerAvatar: ""
        }
        if (rating.UserId === currentUserId) {
            this.setTopCounters(ratingInfo.playerPointsCount, ratingInfo.playerPlace);
        }

        if (!rating.AvatarUrl) {
            ratingInfo.playerAvatar = "url(styles/images/nophoto.png)";
            return deferred.resolve(ratingInfo);
        }

        imgCache.ImageCache.getImagePathWithInit(rating.AvatarUrl).done((url) => {
            ratingInfo.playerAvatar = "url(" + url + ")";
            deferred.resolve(ratingInfo);
        }).fail(() => {
            deferred.fail();
        });
        return deferred.promise();
    }

    private setTopCounters(points: number, place: string) {
        this.set("pointsCount", points);
        this.set("pointsCountRes", this.getPointsResource(points % 100));
        this.set("place", place);
        this.set("placeRes", appTools.getText("ratingPlace"));
    }

    private getPointsResource(lastDigits: number) {
        if (lastDigits > 10 && lastDigits <= 20) {
            return appTools.getText("ratingPoints5_0");
        }
        var lastDigit = lastDigits % 10;
        switch (lastDigit) {
            case 1:
                return appTools.getText("ratingPoints1");
            case 2:
            case 3:
            case 4:
                return appTools.getText("ratingPoints2_4");
            default:
                return appTools.getText("ratingPoints5_0");
        }
    }

    private getPlayersResource(lastDigits: number) {
        if (lastDigits > 10 && lastDigits <= 20) {
            return appTools.getText("ratingPlayers5_0");
        }
        var lastDigit = lastDigits % 10;
        switch (lastDigit) {
            case 1:
                return appTools.getText("ratingPlayers1");
            case 2:
            case 3:
            case 4:
                return appTools.getText("ratingPlayers2_4");
            default:
                return appTools.getText("ratingPlayers5_0");
        }
    }
}

function bindModel() {
    var viewModel = new RatingViewModel();
    kendo.bind($("#vRating"), viewModel, kendo.mobile.ui);
    viewModel.load();
}

function backButtonCallback() {
    navigation.navigateToProfileView(enums.Direction.up);
}

var app = appTools.getApp();
app.appInit.ratingViewModelShow = () => {
    bindModel();
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.ratingViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};

