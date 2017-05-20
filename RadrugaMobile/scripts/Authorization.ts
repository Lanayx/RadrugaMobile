/// <reference path="../kendo/typescript/jquery.d.ts" />

import conf = require("../scripts/Configuration");
import storage = require("../scripts/Storage");
import serviceApi = require("ServiceApi");
import models = require("models/WsInterfaces");



export function login(username: string, password: string): JQueryPromise<string> {
    return $.post(
        conf.Configuration.tokenUrl,
        `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, null, "json")
        .then((resultData) => {
            //var result =
            //{
            //    "access_token": "2YotnFZFEjr1zCsicMWpAA",
            //    "token_type": "example",
            //    "expires_in": 3600,
            //    "refresh_token": "tGzv3JOkF0XG5Qx2TlKWIA",
            //    "requiredFields": "bdate;sex;nickName",
            //};
            setHasEmail();
            storage.PermanentStorage.set("access_token", resultData.access_token);
            return resultData.requiredFields;
        });

}

export function register(email: string, password: string): JQueryPromise<any> {
    var regObject = {
        loginemail: email,
        password: password,
        device: device.platform + " " + device.version + " " + device.model
    };

    return makeRequest(regObject, "/Register");
}
export function forgotPassword(email: string): JQueryPromise<any> {
    return makeRequest(email, "/ForgotPassword");
}

export function checkApprovalCode(data: models.ICheckApprovalModel): JQueryPromise<any> {
    return makeRequest(data, "/ValidateApprovalCode").then((resultData) => {
        if (resultData.Status === 0) {
            setHasEmail();
            storage.PermanentStorage.set("access_token", resultData.OAuthToken);
        }
        return resultData;
    });
}

export function resetPassword(data: string): JQueryPromise<any> {
    return makeRequest(data, "/ResetPassword");
}

export function vkRegister(vkData: any): JQueryPromise<any> {
    vkData.device = device.platform + " " + device.version + " " + device.model;
    return makeRequest(vkData, "/RegisterVk").then((resultData) => {
        if (resultData.Status === 0 || resultData.Status === 2) {
            storage.PermanentStorage.set("access_token", resultData.OAuthToken);
        }
        return resultData;
    });
}

export function makeRequest(data: any, method: string): JQueryXHR {
    return $.ajax({
        type: "POST",
        url: conf.Configuration.identityUrl + method,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    });
}

//specials

export function setHasEmail() {
    storage.PermanentStorage.set("hasEmail", "true");
}

export function hasEmail(): boolean {
    return !!storage.PermanentStorage.get("hasEmail");
}

export function isLoggedIn(): boolean {
    var token = getAccessToken();
    return (!!token);
}

export function getAccessToken(): string {
    return storage.PermanentStorage.get("access_token");
}
