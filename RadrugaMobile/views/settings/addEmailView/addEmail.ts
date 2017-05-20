//import auth = require("../../../scripts/Authorization");
import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import tools = require("../../../scripts/Tools");
import enums = require("../../../scripts/Enums");
import api = require("../../../scripts/ServiceApi");
import auth = require("../../../scripts/Authorization");


export class AddEmailViewModel extends kendo.data.ObservableObject {
    email = "";
    password = "";

    //resources below
    passwordRes = appTools.getText("cmPassword");
    addEmailButtonRes = appTools.getText("cmReady");
    addEmailHeaderRes = appTools.getText("addEmailHeader");

    constructor() {
        super();
        super.init(this);
    }


    onAddEmail() {
        var emailParam = this.get("email"),
            passwordParam = this.get("password");

        if (emailParam === "" || passwordParam === "") {
            navigator.notification.alert(appTools.getText("cmAllFieldsAreRequired"),
                () => { }, appTools.getText("registerRegistrationFailed"), 'OK');
            return;
        }
        if (!tools.validateEmail(emailParam)) {
            navigator.notification.alert(appTools.getText("registerInvalidEmail"),
                () => { }, appTools.getText("registerRegistrationFailed"), 'OK');
            return;
        }
        if (!tools.validatePassword(passwordParam)) {
            navigator.notification.alert(appTools.getText("registerInvalidPassword"),
                () => { }, appTools.getText("registerRegistrationFailed"), 'OK');
            return;
        }

        this.addEmail(emailParam, passwordParam);
    }


    private addEmail(email: string, password: string) {
        (new api.ServiceApi()).callService({
            data: JSON.stringify({
                LoginEmail: email,
                Password: password
            }),
            method: "useridentity/AddEmail",
            requestType: "POST"
        })
            .done((result) => {
                if (result.Status === 0) {
                    auth.setHasEmail();
                    $("#divAddEmailBody").text(appTools.getText("addEmailAddCompleted"));
                    appTools.forceRebind("Settings");
                } else {
                    navigator.notification.alert(result.Description,
                        () => { }, appTools.getText("addEmailAddFailed"), "OK");
                }
            })
            .fail(() => {
                navigator.notification.alert(appTools.getText("cmApiError"),
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
    }
}

function bindBackButton() {
    $("#vAddEmail").on("click", ".backIcon", backButtonCallback);
}

function bindModel() {
    var model = new AddEmailViewModel();
    var $view = $("#vAddEmail");
    kendo.bind($view, model, kendo.mobile.ui);
}

function backButtonCallback() {
    navigation.navigateToSettingsView(enums.Direction.right);
}

var app = appTools.getApp();
app.appInit.addEmailViewModelInit = () => {
    bindModel();
    bindBackButton();
};
app.appInit.addEmailViewModelShow = () => {
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.addEmailViewModelHide = () => {
    document.addEventListener("backbutton", backButtonCallback, false);
};