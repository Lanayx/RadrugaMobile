/// <reference path="../../../scripts/tsDefinitions/custom/mobiscroll.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/Tools", "../../../scripts/Enums", "../../../scripts/ServiceApi"], function (require, exports, appTools, navigation, tools, enums, api) {
    "use strict";
    var app = appTools.getApp(), nickNameDisplay = false, bdateDisplay = false, sexDisplay = false;
    var RequiredFieldsViewModel = (function (_super) {
        __extends(RequiredFieldsViewModel, _super);
        function RequiredFieldsViewModel() {
            _super.call(this);
            this.nickName = "";
            this.dateOfBirth = "";
            this.sex = "";
            this.nickNameVisible = nickNameDisplay;
            this.dateOfBirthVisible = bdateDisplay;
            this.sexVisible = sexDisplay;
            //resources below
            this.nickNameRes = appTools.getText("cmNickName");
            this.dateOfBirthRes = appTools.getText("requiredFieldsDateOfBirth");
            this.sexRes = appTools.getText("requiredFieldsSex");
            this.maleRes = appTools.getText("requiredFieldsMale");
            this.femaleRes = appTools.getText("requiredFieldsFemale");
            this.readyRes = appTools.getText("cmReady");
            this.msLang = app.isRussian ? "ru" : "";
            this._processStarted = false;
            _super.prototype.init.call(this, this);
        }
        RequiredFieldsViewModel.prototype.fieldsFilled = function () {
            var _this = this;
            if ((this.get("nickNameVisible") && !this.get("nickName")) ||
                (this.get("dateOfBirthVisible") && !this.get("dateOfBirth")) ||
                (this.get("sexVisible") && !this.get("sex"))) {
                navigator.notification.alert(appTools.getText("cmAllFieldsAreRequired"), function () { }, appTools.getText("registerViewRegistrationFailed"), "OK");
                return;
            }
            //prevent double clicking
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            var serviceApi = new api.ServiceApi();
            serviceApi.callService({
                data: JSON.stringify({
                    NickName: this.get("nickName"),
                    DateOfBirth: this.get("dateOfBirth"),
                    Sex: this.get("sex")
                }),
                method: "useridentity/RequiredFields",
                requestType: "POST"
            }).done(function (apiResultData) {
                if (apiResultData.Status === 0) {
                    appTools.loadRequiredFields(false);
                    navigation.navigateToProfileView(enums.Direction.left);
                }
                else {
                    navigator.notification.alert(apiResultData.Description, function () { }, appTools.getText("registerViewRegistrationFailed"), "OK");
                }
                _this._processStarted = false;
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        return RequiredFieldsViewModel;
    }(kendo.data.ObservableObject));
    exports.RequiredFieldsViewModel = RequiredFieldsViewModel;
    function init(requiredFields) {
        for (var _i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
            var field = requiredFields_1[_i];
            switch (field) {
                case "nickName":
                    nickNameDisplay = true;
                    break;
                case "bdate":
                    bdateDisplay = true;
                    break;
                case "sex":
                    sexDisplay = true;
                    break;
            }
        }
        appTools.loadRequiredFields(true, requiredFields);
        tools.loadCss("styles/mobiscroll/mobiscroll.custom.css");
    }
    exports.init = init;
    function bindModel() {
        var model = new RequiredFieldsViewModel();
        var $view = $("#vRequiredFields");
        kendo.bind($view, model, kendo.mobile.ui);
        appTools.viewBinded();
    }
    app.appInit.requiredFieldsViewModelInit = function () {
        var settings = {
            theme: "mobiscroll-dark",
            display: "bottom",
            dateFormat: 'dd.mm.yy',
            endYear: new Date().getFullYear() - 8
        };
        if (app.isRussian)
            settings.lang = "ru";
        $('#txtDateOfBirth').mobiscroll().date(settings);
        bindModel();
    };
    app.appInit.requiredFieldsViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        appTools.overrideBackButton();
    };
    app.appInit.requiredFieldsViewModelHide = function () {
        appTools.defaultBackButton();
    };
});
