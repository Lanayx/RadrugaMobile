/// <reference path="../../../scripts/tsDefinitions/custom/screen.d.ts" />
import navigation = require("../../../scripts/Navigation");
import appTools = require("../../../scripts/ApplicationTools");
import serviceApi = require("../../../scripts/ServiceApi");
import enums = require("../../../scripts/Enums");
import interfaces = require("../../../scripts/Interfaces");
import user = require("../../../scripts/models/User");

var likesCount, dislikesCount, imageUrl, alreadyLiked, kindActionId, description, userId, points, avatar;
export class KindActionReadViewModel extends kendo.data.ObservableObject {

    photoTaken = imageUrl !== "url(styles/images/noimage.png)";    
    photoPath = this.photoTaken ? imageUrl.slice(4, imageUrl.length -1) : "";
    alreadyLiked = alreadyLiked;
    likesCount = likesCount;
    dislikesCount = dislikesCount;
    kindActionDescription = description;

    private _processStarted = false;

    //resources 
    likeRes = appTools.getText("kindActionReadLike");
    dislikeRes = appTools.getText("kindActionReadDislike");


    constructor() {
        super();
        super.init(this);
    }

    like() {
        if (this.alreadyLiked)
            return;
        this.likeOrDislike("Like");
        this.set("likesCount", likesCount + 1);
        points++;
    }

    dislike() {
        if (this.alreadyLiked)
            return;
        this.likeOrDislike("Dislike");
        this.set("dislikesCount", dislikesCount + 1);
        points--;
    }

    private likeOrDislike(method) {
        if (this._processStarted)
            return;
        this._processStarted = true;
        var api = new serviceApi.ServiceApi();
        api.callService({
            method: `kindAction/${method}`,
            requestType: "POST",
            data: JSON.stringify({
                KindActionId: kindActionId,
                UserId: userId
            })
        }).done((result) => {
            if (result.Status === 0) {
                this.set("alreadyLiked", true);
                appTools.forceRebind("KindActionList", "ProfileRead");
            }
            else
                navigator.notification.alert(result.Description,
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        });
    }

    //---------------------

}

export function init(options: interfaces.IKindActionNavigationProperties) {
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

function bindModel() {
    var viewModel = new KindActionReadViewModel();
    kendo.bind($("#vKindActionRead"), viewModel, kendo.mobile.ui);
    appTools.viewBinded();
}

function bindBackButton() {
    $("#vKindActionRead").on("click", ".backIcon", backButtonCallback);
}

function backButtonCallback() {
    navigation.navigateToKindActionListView(enums.Direction.right, {userId: userId, avatar: avatar, points: points});
}

var app = appTools.getApp();
app.appInit.kindActionReadViewModelInit = () => {
    bindBackButton();
};
app.appInit.kindActionReadViewModelShow = () => {  
    bindModel();
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.kindActionReadViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};

