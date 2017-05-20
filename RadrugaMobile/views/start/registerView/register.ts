//import auth = require("../../../scripts/Authorization");
import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import tools = require("../../../scripts/Tools");
import enums = require("../../../scripts/Enums");
import auth = require("../../../scripts/Authorization");

export class RegisterViewModel extends kendo.data.ObservableObject {
    email = "";
    password = "";
    approvalCode = "";
    showEmailInput = true;
    showApprovalInput = false;

    //resources below
    passwordRes = appTools.getText("cmPassword");
    registerButtonRes = appTools.getText("cmNext");
    backRes = appTools.getText("cmBack");
    approvalCodeRes = appTools.getText("cmApprovalCode");
    registerApprovalNotifyRes = appTools.getText("registerApprovalNotify");
    registerApprovalHeaderRes = appTools.getText("registerApprovalHeader");
    resendButtonRes = appTools.getText("registerResendCode");

    private _processStarted = false;

    constructor() {
        super();
        super.init(this);
    }

    backToEnter() {
        backButtonCallback();
    }

    onRegister() {
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

        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;

        this.register(emailParam, passwordParam);
    }

    onValidateCode() {
        auth.checkApprovalCode({
            ApprovalCode: this.get("approvalCode"),
            Email: this.get("email")
        }).done((result) => {
                if (result.Status === 0) {
                    navigation.navigateToRequiredFieldsView(enums.Direction.left, ["nickName", "bdate", "sex"]);
                } else {
                    navigator.notification.alert(result.Description,
                        () => { }, appTools.getText("registerApprovalFailed"), "OK");
                }
            }).fail(() => {
                navigator.notification.alert(appTools.getText("cmApiError"),
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
    }

    onResendCode() {
        this.register(this.get("email"), this.get("password"));
    }

    private register(email: string, password:string) {
        auth.register(email, password)
            .done((validateResult) => {
                if (validateResult.Status === 0) {
                    this.set("showEmailInput", false);
                    this.set("showApprovalInput", true);
                } else {
                    navigator.notification.alert(validateResult.Description,
                        () => { }, appTools.getText("registerRegistrationFailed"), "OK");
                }
                this._processStarted = false;
            })
            .fail(() => {
                navigator.notification.alert(appTools.getText("cmApiError"),
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
                this._processStarted = false;
            });
    }
}

function bindModel() {
    var model = new RegisterViewModel();
    var $view = $("#vRegister");
    kendo.bind($view, model, kendo.mobile.ui);
    appTools.viewBinded();
}

function backButtonCallback() {
    navigation.navigateToLoginView(enums.Direction.right);
}


var app = appTools.getApp();
app.appInit.registerViewModelInit = () => {
    bindModel();
};
app.appInit.registerViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.registerViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};