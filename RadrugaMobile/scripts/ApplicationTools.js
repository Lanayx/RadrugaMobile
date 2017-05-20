define(["require", "exports", "ServiceApi", "models/AppErrorInfo", "Storage", "Configuration"], function (require, exports, serviceApi, appErrInfo, storage, conf) {
    "use strict";
    function getKendoApplication() {
        var app = getApp();
        return app.application;
    }
    exports.getKendoApplication = getKendoApplication;
    function getApp() {
        var appWindow = window;
        if (!appWindow.app) {
            appWindow.app = {
                appInit: {},
                application: generateKendoApplication(),
                isOnline: isOnline(),
                onlineWaitingEvents: [],
                isRussian: false,
                notifications: {}
            };
        }
        return appWindow.app;
    }
    exports.getApp = getApp;
    function getText(key) {
        var app = getApp();
        return app.langDictionary[key];
    }
    exports.getText = getText;
    function logError(error) {
        var _this = this;
        var app = getApp();
        if (conf.Configuration.sendTelemetry)
            appInsights.trackEvent("LogError", {
                "errorData": error,
                "userId": storage.PermanentStorage.get("UserId")
            });
        getAllErrorInfo(error).done(function (errorInfo) {
            var errorString = JSON.stringify(errorInfo);
            console.log(errorString);
            if (app.isOnline) {
                sendErrorInfo(errorString);
            }
            else {
                app.onlineWaitingEvents.push(wrapFunction(sendErrorInfo, _this, [errorString]));
            }
        });
    }
    exports.logError = logError;
    function rebindNeeded() {
        var kendoApp = getKendoApplication();
        var dic = getRebindDictionary();
        return !dic[kendoApp.view().options.title];
    }
    exports.rebindNeeded = rebindNeeded;
    function viewBinded() {
        var kendoApp = getKendoApplication();
        var dic = getRebindDictionary();
        dic[kendoApp.view().options.title] = true;
        setRebindDictionary(dic);
    }
    exports.viewBinded = viewBinded;
    function forceRebind() {
        var viewName = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            viewName[_i - 0] = arguments[_i];
        }
        var dic = getRebindDictionary();
        for (var _a = 0, viewName_1 = viewName; _a < viewName_1.length; _a++) {
            var view = viewName_1[_a];
            dic[view] = false;
        }
        setRebindDictionary(dic);
    }
    exports.forceRebind = forceRebind;
    function getRequiredFields() {
        var fields = storage.PermanentStorage.get("loadRequiredFields");
        return fields ? JSON.parse(fields) : null;
    }
    exports.getRequiredFields = getRequiredFields;
    function loadRequiredFields(flag, requiredFields) {
        if (flag)
            storage.PermanentStorage.set("loadRequiredFields", JSON.stringify(requiredFields));
        else
            storage.PermanentStorage.remove("loadRequiredFields");
    }
    exports.loadRequiredFields = loadRequiredFields;
    var backCounter;
    function overrideBackButton() {
        backCounter = 0;
        document.addEventListener("backbutton", backButtonCallback, false);
    }
    exports.overrideBackButton = overrideBackButton;
    function defaultBackButton() {
        document.removeEventListener("backbutton", backButtonCallback, false);
    }
    exports.defaultBackButton = defaultBackButton;
    function backButtonCallback() {
        if (backCounter > 0)
            navigator.app.exitApp();
        else
            backCounter++;
    }
    function generateKendoApplication() {
        var app = new kendo.mobile.Application($(document.body), {
            layout: "empty-layout",
            useNativeScrolling: true,
            init: function () {
                getLanguageDictionary().done(function (dic) {
                    var appWindow = window;
                    appWindow.app.langDictionary = dic;
                    appWindow.app.application.changeLoadingMessage(dic["cmLoading"]);
                });
            }
        });
        return app;
    }
    function getAllErrorInfo(error) {
        var kendoApp = getKendoApplication();
        var memoryInfo = getMemoryInfo();
        var diskInfo = getDiskInfo();
        var versionNumber = getAppVersionNumber();
        return $.when(memoryInfo, diskInfo, versionNumber).then(function (mem, disk, versNumber) {
            var errorInfo = new appErrInfo.AppErrorInfo();
            errorInfo.currentViewName = kendoApp.view().options.title;
            errorInfo.deviceModel = device.model;
            errorInfo.devicePlatform = device.platform;
            errorInfo.deviceVersion = device.version;
            if (disk && disk !== -1)
                errorInfo.diskSpaceAvailableKb = disk;
            errorInfo.errorData = error;
            errorInfo.errorTime = new Date();
            errorInfo.appVersion = versNumber;
            if (mem)
                errorInfo.memoryAvailableKb = mem.availableCapacity / 1024;
            return errorInfo;
        }).fail(function (error) { return alert(error); });
    }
    function getAppVersionNumber() {
        if (!cordova.getAppVersion || !cordova.getAppVersion.getVersionNumber) {
            return $.Deferred().resolve("x.x");
        }
        return cordova.getAppVersion.getVersionNumber();
    }
    function getDiskInfo() {
        var deferred = $.Deferred();
        cordova.exec(function (res) {
            if (device.platform === "Android")
                deferred.resolve(res);
            else
                deferred.resolve(res / 1024);
        }, function () {
            deferred.resolve(-1);
        }, "File", "getFreeDiskSpace", []);
        return deferred;
    }
    function getLanguageDictionary() {
        var deferred = $.Deferred();
        navigator.globalization.getLocaleName(function (locale) {
            getLanguageFile(locale.value).then(function (val) { deferred.resolve(val); });
        }, function () {
            getLanguageFile("ru-RU").then(function (val) { deferred.resolve(val); });
        });
        return deferred.promise();
    }
    function getRebindDictionary() {
        var dic = JSON.parse(storage.PermanentStorage.get("rebindDictionary"));
        if (!dic) {
            storage.PermanentStorage.set("rebindDictionary", "{}");
            return {};
        }
        return dic;
    }
    function setRebindDictionary(dictionary) {
        storage.PermanentStorage.set("rebindDictionary", JSON.stringify(dictionary));
    }
    function getLanguageFile(local) {
        var app = getApp();
        var deferred = $.Deferred();
        app.isRussian = true;
        require(["../resources/ru"], function (ruJson) {
            deferred.resolve(ruJson.getDictionary());
        });
        return deferred.promise();
    }
    function getMemoryInfo() {
        var deferred = $.Deferred();
        if (device.platform !== "Win32NT") {
            cordova.exec(function (res) {
                deferred.resolve(res);
            }, function () {
                deferred.resolve();
            }, "ChromeSystemMemory", "getInfo", []);
        }
        else {
            deferred.resolve();
        }
        return deferred;
    }
    function isOnline() {
        var networkState = navigator.connection.type;
        return (networkState !== Connection.NONE);
    }
    function sendErrorInfo(errorInfoSerialized) {
        var api = new serviceApi.ServiceApi();
        api.callService({
            method: "appErrorInfo/post",
            requestType: "POST",
            data: errorInfoSerialized
        });
    }
    function wrapFunction(fn, context, params) {
        return function () {
            fn.apply(context, params);
        };
    }
});
