var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/Navigation", "../../../scripts/ApplicationTools", "../../../scripts/VkManager", "../../../scripts/Authorization", "../../../scripts/Enums"], function (require, exports, navigation, appTools, vk, auth, enums) {
    "use strict";
    var EnterViewModel = (function (_super) {
        __extends(EnterViewModel, _super);
        function EnterViewModel() {
            _super.call(this);
            this._processStarted = false;
            //resources 
            this.vkEnterRes = appTools.getText("enterVkLoginOrRegister");
            this.emailEnterRes = appTools.getText("enterLoginWithEmail");
            _super.prototype.init.call(this, this);
        }
        EnterViewModel.prototype.emailEnter = function () {
            //prevent double clicking
            if (this._processStarted)
                return;
            navigation.navigateToLoginView(enums.Direction.left);
        };
        EnterViewModel.prototype.vkEnter = function () {
            var _this = this;
            //prevent double clicking
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            var vkAuth = new vk.Authorization();
            vkAuth.login()
                .then(function () {
                var vkApi = new vk.VkApi();
                return vkApi.getProfileInfo();
            }).then(function (profileResultData) {
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
            }).done(function (apiResultData) {
                if (apiResultData.Status === 0) {
                    navigation.navigateToProfileView(enums.Direction.left);
                }
                else if (apiResultData.Status === 2) {
                    navigation.navigateToRequiredFieldsView(enums.Direction.left, apiResultData.Description.split(";"));
                }
                else
                    navigator.notification.alert(apiResultData.Description, function () { }, appTools.getText("cmVkError"), "OK");
                _this._processStarted = false;
            })
                .fail(function (error) {
                navigator.notification.alert(appTools.getText("enterVkRegisterFail"), function () { }, appTools.getText("cmVkError"), "OK");
                if (error !== "User denied your request" && error !== "Vk window exit")
                    appTools.logError(JSON.stringify(error));
                _this._processStarted = false;
            });
        };
        return EnterViewModel;
    }(kendo.data.ObservableObject));
    exports.EnterViewModel = EnterViewModel;
    function bindModel() {
        var viewModel = new EnterViewModel();
        kendo.bind($("#vEnter"), viewModel, kendo.mobile.ui);
        appTools.viewBinded();
    }
    var app = appTools.getApp();
    app.appInit.enterViewModelInit = function () {
        bindModel();
    };
    app.appInit.enterViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        appTools.overrideBackButton();
    };
    app.appInit.enterViewModelHide = function () {
        appTools.defaultBackButton();
    };
});
