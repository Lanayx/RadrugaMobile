import auth = require("../../../scripts/Authorization");
import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import enums = require("../../../scripts/Enums");

export class LoginViewModel extends kendo.data.ObservableObject {
    email = "";
    password = "";
    //labels below
    passwordRes = appTools.getText("cmPassword");
    loginRes = appTools.getText("cmLogin");
    regEmailRes = appTools.getText("cmRegistration");
    backRes = appTools.getText("cmBack");

    private _processStarted = false;

    constructor() {
        super();
        super.init(this);
    }

    onLogin() {
        var email = this.get("email"),
            password = this.get("password");

        if (!email || !password) {
            navigator.notification.alert(appTools.getText("cmAllFieldsAreRequired"),
                () => { }, appTools.getText("loginLoginError"), "OK");
            return;
        }

        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;
        
        auth.login(email, password)
            .done((requiredFields) => {
                if (requiredFields) {
                    navigation.navigateToRequiredFieldsView(enums.Direction.left, requiredFields.split(";"));
                } else {
                    navigation.navigateToProfileView(enums.Direction.left);
                }
                this._processStarted = false;
            }).fail(() => {
                navigator.notification.alert(appTools.getText("loginWrongCredentials"),
                    () => { }, appTools.getText("loginLoginError"), "OK");
                this.clearForm();
                this._processStarted = false;
            });
    }

    backToEnter() {
        backButtonCallback();
    }

    onRegister() {
        navigation.navigateToRegisterView();
    }

    private clearForm() {
        this.set("username", "");
        this.set("password", "");
    }
}

function bindModel() {
    var model = new LoginViewModel();
    kendo.bind($("#vLogin"), model, kendo.mobile.ui);
    appTools.viewBinded();
}

function backButtonCallback() {
    navigation.navigateToEnterView(enums.Direction.right);
}

var app = appTools.getApp();
app.appInit.loginViewModelInit = () => {
    bindModel();
};
app.appInit.loginViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.loginViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};