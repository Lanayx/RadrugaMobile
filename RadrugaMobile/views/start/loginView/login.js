var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/Authorization", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/Enums"], function (require, exports, auth, appTools, navigation, enums) {
    "use strict";
    var LoginViewModel = (function (_super) {
        __extends(LoginViewModel, _super);
        function LoginViewModel() {
            _super.call(this);
            this.email = "";
            this.password = "";
            //labels below
            this.passwordRes = appTools.getText("cmPassword");
            this.loginRes = appTools.getText("cmLogin");
            this.regEmailRes = appTools.getText("cmRegistration");
            this.backRes = appTools.getText("cmBack");
            this._processStarted = false;
            _super.prototype.init.call(this, this);
        }
        LoginViewModel.prototype.onLogin = function () {
            var _this = this;
            var email = this.get("email"), password = this.get("password");
            if (!email || !password) {
                navigator.notification.alert(appTools.getText("cmAllFieldsAreRequired"), function () { }, appTools.getText("loginLoginError"), "OK");
                return;
            }
            //prevent double clicking
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            auth.login(email, password)
                .done(function (requiredFields) {
                if (requiredFields) {
                    navigation.navigateToRequiredFieldsView(enums.Direction.left, requiredFields.split(";"));
                }
                else {
                    navigation.navigateToProfileView(enums.Direction.left);
                }
                _this._processStarted = false;
            }).fail(function () {
                navigator.notification.alert(appTools.getText("loginWrongCredentials"), function () { }, appTools.getText("loginLoginError"), "OK");
                _this.clearForm();
                _this._processStarted = false;
            });
        };
        LoginViewModel.prototype.backToEnter = function () {
            backButtonCallback();
        };
        LoginViewModel.prototype.onRegister = function () {
            navigation.navigateToRegisterView();
        };
        LoginViewModel.prototype.clearForm = function () {
            this.set("username", "");
            this.set("password", "");
        };
        return LoginViewModel;
    }(kendo.data.ObservableObject));
    exports.LoginViewModel = LoginViewModel;
    function bindModel() {
        var model = new LoginViewModel();
        kendo.bind($("#vLogin"), model, kendo.mobile.ui);
        appTools.viewBinded();
    }
    function backButtonCallback() {
        navigation.navigateToEnterView(enums.Direction.right);
    }
    var app = appTools.getApp();
    app.appInit.loginViewModelInit = function () {
        bindModel();
    };
    app.appInit.loginViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.loginViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
