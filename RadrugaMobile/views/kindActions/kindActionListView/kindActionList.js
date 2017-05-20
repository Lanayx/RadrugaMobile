var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/Enums", "../../../scripts/ServiceApi", "../../../scripts/models/User"], function (require, exports, appTools, navigation, enums, serviceApi, user) {
    "use strict";
    var kindActionsOnPage = 5;
    var userId, currentUserList, points, avatar;
    var KindActionListViewModel = (function (_super) {
        __extends(KindActionListViewModel, _super);
        function KindActionListViewModel() {
            _super.call(this);
            this.currentPage = 0;
            this.kindActionDefaultImage = "url(styles/images/noimage.png)";
            this.kindActionListDataSource = [];
            //resources
            this.resKindActionHistory = appTools.getText("kindActionListHistory");
            _super.prototype.init.call(this, this);
        }
        KindActionListViewModel.prototype.closeList = function () {
            backButtonCallback();
        };
        KindActionListViewModel.prototype.load = function () {
            this.getKindActionLists();
        };
        KindActionListViewModel.prototype.historyBack = function () {
            this.currentPage--;
            this.getKindActionLists();
        };
        KindActionListViewModel.prototype.historyForward = function () {
            this.currentPage++;
            this.getKindActionLists();
        };
        KindActionListViewModel.prototype.kindActionChosen = function (event) {
            var target = $(event.currentTarget);
            var kindActionId = target.attr("data-action-id");
            var kindAction = this.kindActionListDataSource.filter(function (elem) { return elem.Id === kindActionId; })[0];
            navigation.navigateToKindActionReadView(enums.Direction.left, {
                alreadyLiked: kindAction.AlreadyLiked,
                imageUrl: kindAction.ImageUrl,
                description: kindAction.Description,
                dislikesCount: kindAction.DislikesCount,
                kineActionId: kindAction.Id,
                likesCount: kindAction.LikesCount,
                userId: userId,
                points: points,
                avatar: avatar
            });
        };
        KindActionListViewModel.prototype.getKindActionLists = function () {
            var _this = this;
            var api = new serviceApi.ServiceApi();
            app.application.pane.showLoading(); //hotfix for not showing loader
            var odata = "?$filter=UserId eq " + userId + "&$orderby=DateAdded desc&$top=" + (kindActionsOnPage + 1) + "&$skip=" + this.currentPage * kindActionsOnPage;
            api.callService({
                method: "kindAction" + odata,
                requestType: "GET"
            }).done(function (result) {
                result = result.map(function (kindAction) {
                    if (kindAction.ImageUrl) {
                        kindAction.ImageUrl = "url(" + kindAction.ImageUrl + ")";
                    }
                    else
                        kindAction.ImageUrl = _this.kindActionDefaultImage;
                    kindAction.ViewsCount = kindAction.LikesCount + kindAction.DislikesCount;
                    kindAction.AlreadyLiked = kindAction.AlreadyLiked || currentUserList;
                    return kindAction;
                });
                _this.set("kindActionListDataSource", result.length > kindActionsOnPage
                    ? result.slice(0, result.length - 1)
                    : result);
                _this.set("historyForwardVisible", (result.length > kindActionsOnPage) ? "visible" : "hidden");
                _this.set("historyBackVisible", (_this.currentPage > 0) ? "visible" : "hidden");
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
        };
        return KindActionListViewModel;
    }(kendo.data.ObservableObject));
    exports.KindActionListViewModel = KindActionListViewModel;
    function bindModel() {
        var viewModel = new KindActionListViewModel();
        kendo.bind($("#vKindActionList"), viewModel, kendo.mobile.ui);
        viewModel.load();
        appTools.viewBinded();
    }
    function backButtonCallback() {
        currentUserList
            ? navigation.navigateToProfileView(enums.Direction.up)
            : navigation.navigateToProfileReadView(enums.Direction.up, { userId: userId, avatar: avatar, points: points });
    }
    function init(options) {
        if (userId !== options.userId) {
            userId = options.userId;
            appTools.forceRebind("KindActionList");
        }
        points = options.points;
        avatar = options.avatar;
        currentUserList = userId === user.User.getFromStorage().id;
    }
    exports.init = init;
    var app = appTools.getApp();
    app.appInit.kindActionListViewModelInit = function () {
        bindModel();
    };
    app.appInit.kindActionListViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.kindActionListViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
