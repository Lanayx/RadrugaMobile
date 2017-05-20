var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../scripts/ApplicationTools", "../../scripts/Navigation", "../../scripts/Enums", "../../scripts/ServiceApi", "../../scripts/ImageCache", "../../scripts/models/User"], function (require, exports, appTools, navigation, enums, serviceApi, imgCache, us) {
    "use strict";
    var leadersCount = 10;
    var lastType = enums.RatingType.Common;
    var RatingViewModel = (function (_super) {
        __extends(RatingViewModel, _super);
        function RatingViewModel() {
            _super.call(this);
            this.place = "";
            this.pointsCount = "";
            this.playersCount = "";
            this.method = "";
            //resources
            this.commonViewRes = appTools.getText("ratingCommonView");
            this.countryViewRes = appTools.getText("ratingCountryView");
            this.cityViewRes = appTools.getText("ratingCityView");
            this.topPlayersDataSource = [];
            this.nearPlayersDataSource = [];
            _super.prototype.init.call(this, this);
        }
        RatingViewModel.prototype.load = function () {
            var currentUser = us.User.getFromStorage();
            this.currentUserId = currentUser.id;
            this.set("userHasLocation", !!currentUser.homeCoordinate);
            this.changeView(lastType);
        };
        RatingViewModel.prototype.navigateToProfile = function () {
            backButtonCallback();
        };
        RatingViewModel.prototype.commonView = function () {
            this.changeView(enums.RatingType.Common);
        };
        RatingViewModel.prototype.countryView = function () {
            this.changeView(enums.RatingType.Country);
        };
        RatingViewModel.prototype.cityView = function () {
            this.changeView(enums.RatingType.City);
        };
        RatingViewModel.prototype.userChosen = function (event) {
            var target = $(event.currentTarget);
            var userId = target.attr("data-user-id");
            var avatar = target.attr("data-avatar");
            var points = target.attr("data-points");
            navigation.navigateToProfileReadView(enums.Direction.left, { userId: userId, avatar: avatar, points: points });
        };
        RatingViewModel.prototype.changeView = function (type) {
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
        };
        RatingViewModel.prototype.getRatings = function () {
            var _this = this;
            var api = new serviceApi.ServiceApi();
            app.application.pane.showLoading(); //hotfix for not showing loader
            api.callService({
                method: this.method,
                requestType: "GET"
            }).done(function (result) {
                if (result.Ratings && result.Ratings.length > 0) {
                    imgCache.ImageCache.init().then(function () {
                        var length = result.Ratings.length;
                        var task = _this.getRatingInfo(result.Ratings[0], _this.currentUserId);
                        var ratings = [];
                        for (var i = 1; i < length; i++) {
                            (function (ratingInfo) {
                                task = task.then(function (ratingInfoWithImage) {
                                    ratings.push(ratingInfoWithImage);
                                    return _this.getRatingInfo(ratingInfo, _this.currentUserId);
                                });
                            })(result.Ratings[i]);
                        }
                        task.done(function (ratingInfoWithImage) {
                            ratings.push(ratingInfoWithImage);
                            if (ratings.length <= leadersCount) {
                                _this.set("topPlayersDataSource", ratings);
                                _this.set("nearPlayersDataSource", []);
                            }
                            else {
                                var neighbours = [];
                                var neighboursCount = ratings.length - leadersCount;
                                for (var i = 0; i < neighboursCount; i++) {
                                    neighbours.push(ratings[leadersCount + i]);
                                }
                                ratings.splice(leadersCount, neighboursCount);
                                _this.set("nearPlayersDataSource", neighbours);
                                _this.set("topPlayersDataSource", ratings);
                            }
                        }).fail(function () {
                            alert("fail");
                        });
                    });
                }
                _this.set("playersCount", result.UsersCount);
                _this.set("playersCountRes", _this.getPlayersResource(result.UsersCount % 100));
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
        };
        RatingViewModel.prototype.getRatingInfo = function (rating, currentUserId) {
            var deferred = $.Deferred();
            var ratingInfo = {
                playerPlace: rating.Place === -1 ? "*" : rating.Place.toString(),
                playerNickName: rating.NickName,
                playerPointsCount: rating.Points,
                userId: rating.UserId,
                playerAvatar: ""
            };
            if (rating.UserId === currentUserId) {
                this.setTopCounters(ratingInfo.playerPointsCount, ratingInfo.playerPlace);
            }
            if (!rating.AvatarUrl) {
                ratingInfo.playerAvatar = "url(styles/images/nophoto.png)";
                return deferred.resolve(ratingInfo);
            }
            imgCache.ImageCache.getImagePathWithInit(rating.AvatarUrl).done(function (url) {
                ratingInfo.playerAvatar = "url(" + url + ")";
                deferred.resolve(ratingInfo);
            }).fail(function () {
                deferred.fail();
            });
            return deferred.promise();
        };
        RatingViewModel.prototype.setTopCounters = function (points, place) {
            this.set("pointsCount", points);
            this.set("pointsCountRes", this.getPointsResource(points % 100));
            this.set("place", place);
            this.set("placeRes", appTools.getText("ratingPlace"));
        };
        RatingViewModel.prototype.getPointsResource = function (lastDigits) {
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
        };
        RatingViewModel.prototype.getPlayersResource = function (lastDigits) {
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
        };
        return RatingViewModel;
    }(kendo.data.ObservableObject));
    exports.RatingViewModel = RatingViewModel;
    function bindModel() {
        var viewModel = new RatingViewModel();
        kendo.bind($("#vRating"), viewModel, kendo.mobile.ui);
        viewModel.load();
    }
    function backButtonCallback() {
        navigation.navigateToProfileView(enums.Direction.up);
    }
    var app = appTools.getApp();
    app.appInit.ratingViewModelShow = function () {
        bindModel();
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.ratingViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
