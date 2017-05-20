var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/Navigation", "../../../scripts/ApplicationTools", "../../../scripts/ServiceApi", "../../../scripts/Enums"], function (require, exports, navigation, appTools, serviceApi, enums) {
    "use strict";
    var likesCount, dislikesCount, imageUrl, alreadyLiked, kindActionId, description, userId, points, avatar;
    var KindActionReadViewModel = (function (_super) {
        __extends(KindActionReadViewModel, _super);
        function KindActionReadViewModel() {
            _super.call(this);
            this.photoTaken = imageUrl !== "url(styles/images/noimage.png)";
            this.photoPath = this.photoTaken ? imageUrl.slice(4, imageUrl.length - 1) : "";
            this.alreadyLiked = alreadyLiked;
            this.likesCount = likesCount;
            this.dislikesCount = dislikesCount;
            this.kindActionDescription = description;
            this._processStarted = false;
            //resources 
            this.likeRes = appTools.getText("kindActionReadLike");
            this.dislikeRes = appTools.getText("kindActionReadDislike");
            _super.prototype.init.call(this, this);
        }
        KindActionReadViewModel.prototype.like = function () {
            if (this.alreadyLiked)
                return;
            this.likeOrDislike("Like");
            this.set("likesCount", likesCount + 1);
            points++;
        };
        KindActionReadViewModel.prototype.dislike = function () {
            if (this.alreadyLiked)
                return;
            this.likeOrDislike("Dislike");
            this.set("dislikesCount", dislikesCount + 1);
            points--;
        };
        KindActionReadViewModel.prototype.likeOrDislike = function (method) {
            var _this = this;
            if (this._processStarted)
                return;
            this._processStarted = true;
            var api = new serviceApi.ServiceApi();
            api.callService({
                method: "kindAction/" + method,
                requestType: "POST",
                data: JSON.stringify({
                    KindActionId: kindActionId,
                    UserId: userId
                })
            }).done(function (result) {
                if (result.Status === 0) {
                    _this.set("alreadyLiked", true);
                    appTools.forceRebind("KindActionList", "ProfileRead");
                }
                else
                    navigator.notification.alert(result.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        return KindActionReadViewModel;
    }(kendo.data.ObservableObject));
    exports.KindActionReadViewModel = KindActionReadViewModel;
    function init(options) {
        likesCount = options.likesCount;
        dislikesCount = options.dislikesCount;
        imageUrl = options.imageUrl;
        alreadyLiked = options.alreadyLiked;
        kindActionId = options.kineActionId;
        description = options.description;
        userId = options.userId;
        points = options.points;
        avatar = options.avatar;
    }
    exports.init = init;
    function bindModel() {
        var viewModel = new KindActionReadViewModel();
        kendo.bind($("#vKindActionRead"), viewModel, kendo.mobile.ui);
        appTools.viewBinded();
    }
    function bindBackButton() {
        $("#vKindActionRead").on("click", ".backIcon", backButtonCallback);
    }
    function backButtonCallback() {
        navigation.navigateToKindActionListView(enums.Direction.right, { userId: userId, avatar: avatar, points: points });
    }
    var app = appTools.getApp();
    app.appInit.kindActionReadViewModelInit = function () {
        bindBackButton();
    };
    app.appInit.kindActionReadViewModelShow = function () {
        bindModel();
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.kindActionReadViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
