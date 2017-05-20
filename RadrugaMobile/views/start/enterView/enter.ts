import navigation = require("../../../scripts/Navigation");
import appTools = require("../../../scripts/ApplicationTools");
import vk = require("../../../scripts/VkManager");
import auth = require("../../../scripts/Authorization");
import enums = require("../../../scripts/Enums");

export class EnterViewModel extends kendo.data.ObservableObject {

    private _processStarted = false;

    //resources 
    vkEnterRes = appTools.getText("enterVkLoginOrRegister");
    emailEnterRes = appTools.getText("enterLoginWithEmail");
    constructor() {
        super();
        super.init(this);
    }

    emailEnter() {
        //prevent double clicking
        if (this._processStarted)
            return;
        navigation.navigateToLoginView(enums.Direction.left);
    }

    vkEnter() {
        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;

        var vkAuth = new vk.Authorization();
        vkAuth.login()
            .then<any>(() => {
                var vkApi = new vk.VkApi();
                return vkApi.getProfileInfo();
            }).then<any>((profileResultData) => {
                if (profileResultData && profileResultData.response) {
                    var userData = profileResultData.response[0];
                    userData.access_token = vk.Fields.token;
                    return auth.vkRegister(userData);
                }
                var def = $.Deferred();
                def.resolve({
                    Status: 1,
                    Description: appTools.getText("enterVkGetProfileIncorrect")
                });
                return def;


            }).done((apiResultData) => {
                if (apiResultData.Status === 0) {
                    navigation.navigateToProfileView(enums.Direction.left);
                } else if (apiResultData.Status === 2) {
                    navigation.navigateToRequiredFieldsView(enums.Direction.left, apiResultData.Description.split(";"));
                } else
                    navigator.notification.alert(apiResultData.Description,
                        () => { }, appTools.getText("cmVkError"), "OK");
                this._processStarted = false;
            })
            .fail((error) => {
                navigator.notification.alert(appTools.getText("enterVkRegisterFail"),
                    () => { }, appTools.getText("cmVkError"), "OK");
                if (error !== "User denied your request" && error !== "Vk window exit")
                    appTools.logError(JSON.stringify(error));
                this._processStarted = false;
            });
    }
}


function bindModel() {
    var viewModel = new EnterViewModel();
    kendo.bind($("#vEnter"), viewModel, kendo.mobile.ui);
    appTools.viewBinded();
}

var app = appTools.getApp();
app.appInit.enterViewModelInit = () => {
    bindModel();
};

app.appInit.enterViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    appTools.overrideBackButton();
};

app.appInit.enterViewModelHide = () => {
    appTools.defaultBackButton();
};


