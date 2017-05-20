var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/Authorization", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/Enums"], function (require, exports, auth, appTools, navigation, enums) {
    var ResetPasswordViewModel = (function (_super) {
        __extends(ResetPasswordViewModel, _super);
        function ResetPasswordViewModel() {
            _super.call(this);
            this.email = "";
            this.newPassword = "";
            this.approvalCode = "";
            this.showEmailInput = true;
            this.showApprovalInput = false;
            this.showPasswordInput = false;
            _super.prototype.init.call(this, this);
        }
        ResetPasswordViewModel.prototype.onEmailEnter = function () {
            var _this = this;
            var email = this.get("email");
            if (email === "") {
                navigator.notification.alert("Email field is required!", function () { }, "Check email failed", "OK");
                return;
            }
            auth.forgotPassword(email)
                .done(function (validateResult) {
                if (validateResult.data.Status === 0) {
                    _this.set("showEmailInput", false);
                    _this.set("showApprovalInput", true);
                    _this.set("_emailToProcess", _this.email);
                    _this.set("email", "");
                }
                else if (validateResult.data.Status === 2) {
                    navigator.notification.alert(validateResult.data.Description, function () { }, "Check email warning", "OK");
                }
                else {
                    navigator.notification.alert(validateResult.data.Description, function () { }, "Check email failed", "OK");
                }
            })
                .fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
        };
        ResetPasswordViewModel.prototype.onValidateCode = function () {
            var _this = this;
            var codeParam = this.get("approvalCode");
            var emailParam = this.get("email");
            if (codeParam === "") {
                navigator.notification.alert("Approval code field is required!", function () { }, "Validate approval code failed", "OK");
                return;
            }
            auth.checkApprovalCode({ Email: emailParam, ApprovalCode: codeParam })
                .done(function (checkResult) {
                if (checkResult.data.Status === 0) {
                    _this.set("showApprovalInput", false);
                    _this.set("showPasswordInput", true);
                    _this.set("approvalCode", "");
                }
                else if (checkResult.data.Status === 2) {
                    navigator.notification.alert(checkResult.data.Description, function () { }, "Check approval warning", "OK");
                }
                else {
                    navigator.notification.alert(checkResult.data.Description, function () { }, "Check approval failed", "OK");
                }
            })
                .fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
        };
        ResetPasswordViewModel.prototype.onResetPassword = function () {
            var newPasswordParam = this.get("newPassword");
            if (newPasswordParam === "") {
                navigator.notification.alert("New password field is required!", function () { }, "Reset password failed", "OK");
                return;
            }
            auth.resetPassword(newPasswordParam)
                .done(function (operationResult) {
                if (operationResult.data.Status === 0) {
                    navigation.navigateToProfileView(enums.Direction.left);
                }
                else if (operationResult.data.Status === 2) {
                    navigator.notification.alert(operationResult.data.Description, function () { }, "Reset password warning", "OK");
                }
                else {
                    navigator.notification.alert(operationResult.data.Description, function () { }, "Reset password failed", "OK");
                }
            })
                .fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
        };
        return ResetPasswordViewModel;
    })(kendo.data.ObservableObject);
    exports.ResetPasswordViewModel = ResetPasswordViewModel;
    function bindNewModel() {
        kendo.bind($("#vResetPassword"), new ResetPasswordViewModel());
    }
    var app = appTools.getApp();
    app.appInit.resetPasswordViewModelInit = function () {
        bindNewModel();
    };
    app.appInit.requiredFieldsViewModelShow = function () {
        appTools.overrideBackButton();
    };
    app.appInit.requiredFieldsViewModelHide = function () {
        appTools.defaultBackButton();
    };
});
