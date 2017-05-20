import auth = require("../../../scripts/Authorization");
import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import enums = require("../../../scripts/Enums");

export class ResetPasswordViewModel extends kendo.data.ObservableObject {
    email:string = "";
    newPassword: string = "";
    approvalCode: string = "";
    showEmailInput: boolean = true;
    showApprovalInput:boolean = false;
    showPasswordInput: boolean = false;


    constructor() {
        super();
        super.init(this);
    }

    onEmailEnter() {
        var email = this.get("email");

        if (email === "" ) {
            navigator.notification.alert("Email field is required!",
                () => { }, "Check email failed", "OK");
            return;
        }
        
        auth.forgotPassword(email)
            .done((validateResult) => {
                if (validateResult.data.Status === 0) {
                    this.set("showEmailInput", false);
                    this.set("showApprovalInput", true);
                    this.set("_emailToProcess", this.email);
                    this.set("email", "");
                } else if (validateResult.data.Status === 2) {
                    navigator.notification.alert(validateResult.data.Description,
                        () => { }, "Check email warning", "OK");
                } else {
                    navigator.notification.alert(validateResult.data.Description,
                        () => { }, "Check email failed" , "OK");
                }
            })
            .fail(() => {
                navigator.notification.alert(appTools.getText("cmApiError"),
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
    }

    onValidateCode() {
        var codeParam = this.get("approvalCode");
        var emailParam = this.get("email");

        if (codeParam === "") {
            navigator.notification.alert("Approval code field is required!",
                () => { }, "Validate approval code failed", "OK");
            return;
        }
        
        auth.checkApprovalCode({ Email: emailParam, ApprovalCode: codeParam })
            .done((checkResult) => {
                if (checkResult.data.Status === 0) {
                    this.set("showApprovalInput", false);
                    this.set("showPasswordInput", true);
                    this.set("approvalCode", "");
                } else if (checkResult.data.Status === 2) {
                    navigator.notification.alert(checkResult.data.Description,
                    () => {}, "Check approval warning", "OK");
                } else {
                    navigator.notification.alert(checkResult.data.Description,
                    () => {}, "Check approval failed", "OK");
                }
            })
            .fail(() => {
                navigator.notification.alert(appTools.getText("cmApiError"),
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
    }

    onResetPassword() {
        var newPasswordParam = this.get("newPassword");

        if (newPasswordParam === "" ) {
            navigator.notification.alert("New password field is required!",
                () => { }, "Reset password failed", "OK");
            return;
        }

        auth.resetPassword(newPasswordParam)
            .done((operationResult) => {
                if (operationResult.data.Status === 0) {
                    navigation.navigateToProfileView(enums.Direction.left);
                } else if (operationResult.data.Status === 2) {
                    navigator.notification.alert(operationResult.data.Description,
                    () => {}, "Reset password warning", "OK");
                } else {
                    navigator.notification.alert(operationResult.data.Description,
                    () => {}, "Reset password failed", "OK");
                }
            })
            .fail(() => {
                navigator.notification.alert(appTools.getText("cmApiError"),
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
    }

}

function bindNewModel() {
    kendo.bind($("#vResetPassword"), new ResetPasswordViewModel());
}

var app = appTools.getApp();
app.appInit.resetPasswordViewModelInit = () => {
    bindNewModel();
};
app.appInit.requiredFieldsViewModelShow = () => {
    appTools.overrideBackButton();
};
app.appInit.requiredFieldsViewModelHide = () => {
    appTools.defaultBackButton();
};