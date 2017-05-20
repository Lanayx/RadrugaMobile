import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import enums = require("../../../scripts/Enums");
import serviceApi = require("../../../scripts/ServiceApi");
import wsInterfaces = require("../../../scripts/Models/WsInterfaces");
import user = require("../../../scripts/models/User");
import interfaces = require("../../../scripts/Interfaces");

const kindActionsOnPage = 5;
var userId: string, currentUserList: boolean, points, avatar;
export class KindActionListViewModel extends kendo.data.ObservableObject {
    constructor() {
        super();
        super.init(this);
    }
    
    currentPage = 0;
    kindActionDefaultImage = "url(styles/images/noimage.png)";
    kindActionListDataSource: wsInterfaces.IKindAction[] = [];
    historyBackVisible: string;
    historyForwardVisible: string;

    //resources
    resKindActionHistory = appTools.getText("kindActionListHistory");


    closeList() {
        backButtonCallback();
    }

    load() {
        this.getKindActionLists();
    }

    historyBack() {
        this.currentPage--;
        this.getKindActionLists();
    }

    historyForward() {
        this.currentPage++;
        this.getKindActionLists();
    }

    kindActionChosen(event) {
        var target = $(event.currentTarget);
        var kindActionId = target.attr("data-action-id");
        var kindAction = this.kindActionListDataSource.filter((elem) => elem.Id === kindActionId)[0];
        navigation.navigateToKindActionReadView(enums.Direction.left, {
            alreadyLiked : kindAction.AlreadyLiked,
            imageUrl : kindAction.ImageUrl,
            description : kindAction.Description,
            dislikesCount : kindAction.DislikesCount,
            kineActionId : kindAction.Id,
            likesCount: kindAction.LikesCount,
            userId: userId,
            points: points, 
            avatar: avatar
        });
    }

    private getKindActionLists() {
        var api = new serviceApi.ServiceApi();
        app.application.pane.showLoading();//hotfix for not showing loader

        var odata =
            `?$filter=UserId eq ${userId}&$orderby=DateAdded desc&$top=${kindActionsOnPage + 1}&$skip=${this.currentPage * kindActionsOnPage}`;

        api.callService({
            method: "kindAction" + odata,
            requestType: "GET"
        }).done((result: wsInterfaces.IKindAction[]) => {
            result = result.map(kindAction => {
                if (kindAction.ImageUrl) {
                    kindAction.ImageUrl = `url(${kindAction.ImageUrl})`;
                } else
                    kindAction.ImageUrl = this.kindActionDefaultImage;
                kindAction.ViewsCount = kindAction.LikesCount + kindAction.DislikesCount;
                kindAction.AlreadyLiked = kindAction.AlreadyLiked || currentUserList;
                return kindAction;
            });
            this.set("kindActionListDataSource", result.length > kindActionsOnPage
                ? result.slice(0, result.length - 1)
                : result);
            this.set("historyForwardVisible", (result.length > kindActionsOnPage) ? "visible" : "hidden");
            this.set("historyBackVisible", (this.currentPage > 0) ? "visible" : "hidden");
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
        });
    }
}

function bindModel() {
    var viewModel = new KindActionListViewModel();
    kendo.bind($("#vKindActionList"), viewModel, kendo.mobile.ui);
    viewModel.load();
    appTools.viewBinded();
}

function backButtonCallback() {
    currentUserList
        ? navigation.navigateToProfileView(enums.Direction.up)
        : navigation.navigateToProfileReadView(enums.Direction.up, { userId: userId, avatar: avatar, points: points});
}

export function init(options: interfaces.IUserNavigationProperties) {
    if (userId !== options.userId) {
        userId = options.userId;
        appTools.forceRebind("KindActionList");
    }
    points = options.points;
    avatar = options.avatar;
    currentUserList = userId === user.User.getFromStorage().id;
}

var app = appTools.getApp();
app.appInit.kindActionListViewModelInit = () => {
    bindModel();
};
app.appInit.kindActionListViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.kindActionListViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};
