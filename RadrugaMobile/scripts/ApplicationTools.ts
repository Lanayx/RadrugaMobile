/// <reference path="tsDefinitions/cordova/plugins/AppVersion.d.ts" />
/// <reference path="tsDefinitions/cordova/cordova.d.ts" />
/// <reference path="tsDefinitions/custom/navigator.d.ts" />
/// <reference path="tsDefinitions/AppInsights.d.ts" />
import interfaces = require("Interfaces");
import serviceApi = require("ServiceApi");
import appErrInfo = require("models/AppErrorInfo");
import storage = require("Storage");
import conf = require("Configuration");


export function getKendoApplication(): kendo.mobile.Application {
    var app = getApp();
    return app.application;
}

export function getApp(): interfaces.IApp {
    var appWindow = <interfaces.IAppWindow>window;
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

export function getText(key: string): string {
    var app = getApp();
    return app.langDictionary[key];
}

export function logError(error: string) {
    var app = getApp();
    if (conf.Configuration.sendTelemetry)
        appInsights.trackEvent("LogError", {
            "errorData": error,
            "userId": storage.PermanentStorage.get("UserId")
        });
    getAllErrorInfo(error).done((errorInfo) => {
        var errorString = JSON.stringify(errorInfo);
        console.log(errorString);
        if (app.isOnline) {
            sendErrorInfo(errorString);
        } else {
            app.onlineWaitingEvents.push(
                wrapFunction(sendErrorInfo, this, [errorString])
            );
        }
    });
}

export function rebindNeeded(): boolean {
    var kendoApp = getKendoApplication();
    var dic = getRebindDictionary();
    return !dic[kendoApp.view().options.title];
}

export function viewBinded(): void {
    var kendoApp = getKendoApplication();
    var dic = getRebindDictionary();
    dic[kendoApp.view().options.title] = true;
    setRebindDictionary(dic);
}


export function forceRebind(...viewName: string[]) {
    var dic = getRebindDictionary();
    for (let view of viewName) {
        dic[view] = false;
    }
    setRebindDictionary(dic);
}

export function getRequiredFields(): string[] {
    var fields = storage.PermanentStorage.get("loadRequiredFields");
    return fields ? JSON.parse(fields) : null;
}

//set to true to load required fields view after application start
export function loadRequiredFields(flag: boolean, requiredFields?: string[]): void {
    if (flag)
        storage.PermanentStorage.set("loadRequiredFields", JSON.stringify(requiredFields));
    else
        storage.PermanentStorage.remove("loadRequiredFields");
}


var backCounter: number;

export function overrideBackButton() {
    backCounter = 0;
    // ReSharper disable Html.EventNotResolved
    document.addEventListener("backbutton", backButtonCallback, false);

}

export function defaultBackButton() {
    document.removeEventListener("backbutton", backButtonCallback, false);
    // ReSharper restore Html.EventNotResolved
}

//---------------------Private functions


function backButtonCallback() {
    if (backCounter > 0)
        navigator.app.exitApp();
    else
        backCounter++;
}

function generateKendoApplication() {
    var app = new kendo.mobile.Application($(document.body),
        {
            layout: "empty-layout",
            useNativeScrolling: true,//prevent http://www.telerik.com/forums/white-stripe-over-the-keyboard
            init: () => {
                //async dictionary init
                getLanguageDictionary().done((dic) => {
                    var appWindow = <interfaces.IAppWindow>window;
                    appWindow.app.langDictionary = dic;
                    appWindow.app.application.changeLoadingMessage(dic["cmLoading"]);
                });
            }
        });
    return app;
}

function getAllErrorInfo(error: string): JQueryPromise<appErrInfo.AppErrorInfo> {
    var kendoApp = getKendoApplication();
    var memoryInfo = getMemoryInfo();
    var diskInfo = getDiskInfo();
    var versionNumber = getAppVersionNumber();
    return $.when(memoryInfo, diskInfo, versionNumber).then((mem: interfaces.IMemoryInfo, disk: number, versNumber: string) => {
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
    }).fail(error => alert(error));
}


function getAppVersionNumber(): JQueryPromise<string> {
    if (!cordova.getAppVersion || !cordova.getAppVersion.getVersionNumber) {
        return $.Deferred().resolve("x.x");
    }
    return cordova.getAppVersion.getVersionNumber();
}


function getDiskInfo(): JQueryPromise<number> {
    var deferred = $.Deferred();
    cordova.exec((res) => {
        //result in kylobytes for android bytes for the rest
        if (device.platform === "Android")
            deferred.resolve(res);
        else
            deferred.resolve(res / 1024);
    }, () => {
        deferred.resolve(-1);
    }, "File", "getFreeDiskSpace", []);
    return deferred;
}

function getLanguageDictionary(): JQueryPromise<Object> {
    var deferred = $.Deferred();

    navigator.globalization.getLocaleName(
        locale => {
            getLanguageFile(locale.value).then((val) => { deferred.resolve(val); });
        },
        () => {
            getLanguageFile("ru-RU").then((val) => { deferred.resolve(val); });
        });


    return deferred.promise();
}

function getRebindDictionary(): Object {
    var dic = JSON.parse(storage.PermanentStorage.get("rebindDictionary"));
    if (!dic) {
        storage.PermanentStorage.set("rebindDictionary", "{}");
        return {};
    }
    return dic;
}

function setRebindDictionary(dictionary: Object): void {
    storage.PermanentStorage.set("rebindDictionary", JSON.stringify(dictionary));
}


function getLanguageFile(local: string): JQueryPromise<Object> {
    var app = getApp();
    var deferred = $.Deferred();
    //if (local !== "en-US") {
    app.isRussian = true;
    require(["../resources/ru"], (ruJson) => {
        deferred.resolve(<Object>ruJson.getDictionary());

    });
    //} else {
    //    require(["../resources/en"], (enJson) => {
    //        deferred.resolve(<Object>enJson.getDictionary());

    //    });
    //}
    return deferred.promise();
}

//memory plugin is only for ios and android
function getMemoryInfo(): JQueryPromise<interfaces.IMemoryInfo> {
    var deferred = $.Deferred();
    //check for windows phone
    if (device.platform !== "Win32NT") {
        cordova.exec((res) => {
            deferred.resolve(res);
        }, () => {
            deferred.resolve();
        }, "ChromeSystemMemory", "getInfo", []);
    } else {
        deferred.resolve();
    }
    return deferred;
}

function isOnline(): boolean {
    var networkState = navigator.connection.type;
    return (networkState !== Connection.NONE);
}

function sendErrorInfo(errorInfoSerialized: string) {
    var api = new serviceApi.ServiceApi();
    api.callService({
        method: "appErrorInfo/post",
        requestType: "POST",
        data: errorInfoSerialized
    });
}

// Function wrapping code.
// fn - reference to function.
// context - what you want "this" to be.
// params - array of parameters to pass to function.
function wrapFunction(fn, context, params) {
    return () => {
        fn.apply(context, params);
    };
}