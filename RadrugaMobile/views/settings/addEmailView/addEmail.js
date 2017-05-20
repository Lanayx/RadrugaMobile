var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/Tools", "../../../scripts/Enums", "../../../scripts/ServiceApi", "../../../scripts/Authorization"], function (require, exports, appTools, navigation, tools, enums, api, auth) {
    var AddEmailViewModel = (function (_super) {
        __extends(AddEmailViewModel, _super);
        function AddEmailViewModel() {
            _super.call(this);
            this.email = "";
            this.password = "";
            //resources below
            this.passwordRes = appTools.getText("cmPassword");
            this.addEmailButtonRes = appTools.getText("cmReady");
            this.addEmailHeaderRes = appTools.getText("addEmailHeader");
            _super.prototype.init.call(this, this);
        }
        AddEmailViewModel.prototype.onAddEmail = function () {
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
            this.addEmail(emailParam, passwordParam);
        };
        AddEmailViewModel.prototype.addEmail = function (email, password) {
            (new api.ServiceApi()).callService({
                data: JSON.stringify({
                    LoginEmail: email,
                    Password: password
                }),
                method: "useridentity/AddEmail",
                requestType: "POST"
            })
                .done(function (result) {
                if (result.Status === 0) {
                    auth.setHasEmail();
                    $("#divAddEmailBody").text(appTools.getText("addEmailAddCompleted"));
                    appTools.forceRebind("Settings");
                }
                else {
                    navigator.notification.alert(result.Description, function () { }, appTools.getText("addEmailAddFailed"), "OK");
                }
            })
                .fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
        };
        return AddEmailViewModel;
    })(kendo.data.ObservableObject);
    exports.AddEmailViewModel = AddEmailViewModel;
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
    app.appInit.addEmailViewModelInit = function () {
        bindModel();
        bindBackButton();
    };
    app.appInit.addEmailViewModelShow = function () {
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.addEmailViewModelHide = function () {
        document.addEventListener("backbutton", backButtonCallback, false);
    };
});
