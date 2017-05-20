define(["require", "exports", "../scripts/Configuration", "../scripts/Storage"], function (require, exports, conf, storage) {
    "use strict";
    function login(username, password) {
        return $.post(conf.Configuration.tokenUrl, "grant_type=password&username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password), null, "json")
            .then(function (resultData) {
            setHasEmail();
            storage.PermanentStorage.set("access_token", resultData.access_token);
            return resultData.requiredFields;
        });
    }
    exports.login = login;
    function register(email, password) {
        var regObject = {
            loginemail: email,
            password: password,
            device: device.platform + " " + device.version + " " + device.model
        };
        return makeRequest(regObject, "/Register");
    }
    exports.register = register;
    function forgotPassword(email) {
        return makeRequest(email, "/ForgotPassword");
    }
    exports.forgotPassword = forgotPassword;
    function checkApprovalCode(data) {
        return makeRequest(data, "/ValidateApprovalCode").then(function (resultData) {
            if (resultData.Status === 0) {
                setHasEmail();
                storage.PermanentStorage.set("access_token", resultData.OAuthToken);
            }
            return resultData;
        });
    }
    exports.checkApprovalCode = checkApprovalCode;
    function resetPassword(data) {
        return makeRequest(data, "/ResetPassword");
    }
    exports.resetPassword = resetPassword;
    function vkRegister(vkData) {
        vkData.device = device.platform + " " + device.version + " " + device.model;
        return makeRequest(vkData, "/RegisterVk").then(function (resultData) {
            if (resultData.Status === 0 || resultData.Status === 2) {
                storage.PermanentStorage.set("access_token", resultData.OAuthToken);
            }
            return resultData;
        });
    }
    exports.vkRegister = vkRegister;
    function makeRequest(data, method) {
        return $.ajax({
            type: "POST",
            url: conf.Configuration.identityUrl + method,
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        });
    }
    exports.makeRequest = makeRequest;
    function setHasEmail() {
        storage.PermanentStorage.set("hasEmail", "true");
    }
    exports.setHasEmail = setHasEmail;
    function hasEmail() {
        return !!storage.PermanentStorage.get("hasEmail");
    }
    exports.hasEmail = hasEmail;
    function isLoggedIn() {
        var token = getAccessToken();
        return (!!token);
    }
    exports.isLoggedIn = isLoggedIn;
    function getAccessToken() {
        return storage.PermanentStorage.get("access_token");
    }
    exports.getAccessToken = getAccessToken;
});
