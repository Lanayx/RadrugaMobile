import appTools = require("../../scripts/ApplicationTools");
import navigation = require("../../scripts/Navigation");
import enums = require("../../scripts/Enums");
import usr = require ("../../scripts/models/User");

export class AccountViewModel extends kendo.data.ObservableObject {
    constructor() {
        super();
        super.init(this);
    }

    coinsCount: number;
    coinsDescription: string;

    load() {
        console.log("start load");
        var user = usr.User.getFromStorage();
        this.set("coinsCount", user.coinsCount || 0);
        this.set("coinsDescription", appTools.getText("accountCoinsDescription"));
    }
    
}

function bindCloseButton() {
    $("#vAccount").on("click", ".closeIcon", backButtonCallback);
}

function bindModel() {
    var viewModel = new AccountViewModel();
    kendo.bind($("#vAccount"), viewModel, kendo.mobile.ui);
    viewModel.load();
    appTools.viewBinded();
}

function backButtonCallback() {
    navigation.navigateToProfileView(enums.Direction.up);
}

var app = appTools.getApp();
app.appInit.accountViewModelInit = () => {
    bindModel();
    bindCloseButton();
};
app.appInit.accountViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.accountViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};
