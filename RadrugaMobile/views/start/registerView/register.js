var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/Tools", "../../../scripts/Enums", "../../../scripts/Authorization"], function (require, exports, appTools, navigation, tools, enums, auth) {
    var RegisterViewModel = (function (_super) {
        __extends(RegisterViewModel, _super);
        function RegisterViewModel() {
            _super.call(this);
            this.email = "";
            this.password = "";
            this.approvalCode = "";
            this.showEmailInput = true;
            this.showApprovalInput = false;
            //resources below
            this.passwordRes = appTools.getText("cmPassword");
            this.registerButtonRes = appTools.getText("cmNext");
            this.backRes = appTools.getText("cmBack");
            this.approvalCodeRes = appTools.getText("cmApprovalCode");
            this.registerApprovalNotifyRes = appTools.getText("registerApprovalNotify");
            this.registerApprovalHeaderRes = appTools.getText("registerApprovalHeader");
            this.resendButtonRes = appTools.getText("registerResendCode");
            this._processStarted = false;
            _super.prototype.init.call(this, this);
        }
        RegisterViewModel.prototype.backToEnter = function () {
            backButtonCallback();
        };
        RegisterViewModel.prototype.onRegister = function () {
            var emailParam = this.get("email"), passwordParam = this.get("password");
            if (emailParam === "" || passwordParam === "") {
                navigator.notification.alert(appTools.getText("cmAllFieldsAreRequired"), function () { }, appTools.getText("registerRegistrationFailed"), 'OK');
                return;
            }
            if (!tools.validateEmail(emailParam)) {
                navigator.notification.alert(appTools.getText("registerInvalidEmail"), function () { }, appTools.getText("registerRegistrationFailed"), 'OK');
                return;
            }
            if (!tools.validatePassword(passwordParam)) {
                navigator.notification.alert(appTools.getText("registerInvalidPassword"), function () { }, appTools.getText("registerRegistrationFailed"), 'OK');
                return;
            }
            //prevent double clicking
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            this.register(emailParam, passwordParam);
        };
        RegisterViewModel.prototype.onValidateCode = function () {
            auth.checkApprovalCode({
                ApprovalCode: this.get("approvalCode"),
                Email: this.get("email")
            }).done(function (result) {
                if (result.Status === 0) {
                    navigation.navigateToRequiredFieldsView(enums.Direction.left, ["nickName", "bdate", "sex"]);
                }
                else {
                    navigator.notification.alert(result.Description, function () { }, appTools.getText("registerApprovalFailed"), "OK");
                }
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
        };
        RegisterViewModel.prototype.onResendCode = function () {
            this.register(this.get("email"), this.get("password"));
        };
        RegisterViewModel.prototype.register = function (email, password) {
            var _this = this;
            auth.register(email, password)
                .done(function (validateResult) {
                if (validateResult.Status === 0) {
                    _this.set("showEmailInput", false);
                    _this.set("showApprovalInput", true);
                }
                else {
                    navigator.notification.alert(validateResult.Description, function () { }, appTools.getText("registerRegistrationFailed"), "OK");
                }
                _this._processStarted = false;
            })
                .fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        return RegisterViewModel;
    })(kendo.data.ObservableObject);
    exports.RegisterViewModel = RegisterViewModel;
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
    app.appInit.registerViewModelInit = function () {
        bindModel();
    };
    app.appInit.registerViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.registerViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
