/// <reference path="../../../scripts/tsDefinitions/custom/mobiscroll.d.ts" />

import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import tools = require("../../../scripts/Tools");
import enums = require("../../../scripts/Enums");
import api = require("../../../scripts/ServiceApi");

var app = appTools.getApp(),
    nickNameDisplay = false, bdateDisplay = false, sexDisplay = false;

export class RequiredFieldsViewModel extends kendo.data.ObservableObject {
    nickName = "";
    dateOfBirth = "";
    sex = "";
    nickNameVisible = nickNameDisplay;
    dateOfBirthVisible = bdateDisplay;
    sexVisible = sexDisplay;

    //resources below
    nickNameRes = appTools.getText("cmNickName");
    dateOfBirthRes = appTools.getText("requiredFieldsDateOfBirth");
    sexRes = appTools.getText("requiredFieldsSex");
    maleRes = appTools.getText("requiredFieldsMale");
    femaleRes = appTools.getText("requiredFieldsFemale");
    readyRes = appTools.getText("cmReady");
    msLang = app.isRussian ? "ru" : "";

    private _processStarted = false;

    constructor() {
        super();
        super.init(this);
    }


    fieldsFilled() {
        if ((this.get("nickNameVisible") && !this.get("nickName")) ||
            (this.get("dateOfBirthVisible") && !this.get("dateOfBirth")) ||
            (this.get("sexVisible") && !this.get("sex"))) {
            navigator.notification.alert(appTools.getText("cmAllFieldsAreRequired"),
                () => { }, appTools.getText("registerViewRegistrationFailed"), "OK");
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
        }).done((apiResultData) => {
            if (apiResultData.Status === 0) {
                appTools.loadRequiredFields(false);
                navigation.navigateToProfileView(enums.Direction.left);
            } else {
                navigator.notification.alert(apiResultData.Description,
                    () => { }, appTools.getText("registerViewRegistrationFailed"), "OK");
            }
            this._processStarted = false;
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        });
    }
}

export function init(requiredFields: string[]) {
    for (let field of requiredFields) {
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

function bindModel() {
    var model = new RequiredFieldsViewModel();
    var $view = $("#vRequiredFields");
    kendo.bind($view, model, kendo.mobile.ui);
    appTools.viewBinded();
}

app.appInit.requiredFieldsViewModelInit = () => {
    var settings: MobiscrollOptions = {
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
app.appInit.requiredFieldsViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    appTools.overrideBackButton();
};
app.appInit.requiredFieldsViewModelHide = () => {
    appTools.defaultBackButton();
};