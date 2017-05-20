import navigation = require("../../../scripts/Navigation");
import appTools = require("../../../scripts/ApplicationTools");
import enums = require("../../../scripts/Enums");

export class AboutViewModel extends kendo.data.ObservableObject {
    
    //resources 
    vkGroupRes = appTools.getText("aboutVkGroup");
    constructor() {
        super();
        super.init(this);
    }
}

function bindBackButton() {
    $("#vAbout").on("click", ".backIcon", backButtonCallback);
}

function bindModel() {
    var viewModel = new AboutViewModel();
    kendo.bind($("#vAbout"), viewModel, kendo.mobile.ui);
}

function backButtonCallback() {
    navigation.navigateToSettingsView(enums.Direction.left);
}

var app = appTools.getApp();
app.appInit.aboutViewModelInit = () => {
    bindModel();
    bindBackButton();
};
app.appInit.aboutViewModelShow = () => {
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.aboutViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};


