/// <reference path="tsDefinitions/cordova/cordova.d.ts" />
/// <reference path="tsDefinitions/custom/screen.d.ts" />
/// <reference path="tsDefinitions/custom/error.d.ts" />
/// <reference path="tsDefinitions/AppInsights.d.ts" />
import auth = require("Authorization");
import appTools = require("ApplicationTools");
import navigation = require("Navigation");
import enums = require("Enums");
import missionNotif = require("notifications/MissionNotification");
import miss = require("models/Mission");
import conf = require("Configuration");

export function initialize() {
    document.addEventListener('deviceready', onDeviceReady, false);
    if (screen && screen.lockOrientation)
        screen.lockOrientation('portrait');
}

function onDeviceReady() {
    var kendoApplication = appTools.getKendoApplication();
    bindTriggerEvents();
    bindNotificationEvents();
    bindWindowEvents();

    //hide splashscreen on first load
    navigator.splashscreen.hide();

    // Display loading on every ajax call
    $(document).ajaxStart(() => {
        // application.showLoading calls the showLoading() 
        // method of the pane Object inside the app
        // During the app's initial view's init 
        // method this pane object may not be initialized
        // and so application.showLoading() may throw error.
        // To prevent this we need to do a check for existence 
        // application.pane before calling 
        // application.showLoading
        if (kendoApplication.pane) {
            kendoApplication.showLoading();
        }
    });

    // Hide loading after ajax call
    $(document).ajaxStop(() => {
        if (kendoApplication.pane) {
            kendoApplication.hideLoading();
        }
    });

    registerAppStart();
}

function bindWindowEvents() {
    window.onerror = (msg, url, line, col, error?) => {
        // Note that col & error are new to the HTML 5 spec and may not be 
        // supported in every browser.  It worked for me in Chrome.
        var extra = !col ? '' : '\ncolumn: ' + col;
        extra += !error ? '' : '\nstack: ' + error.stack;
        // You can view the information in an alert to see things working like this:
        var errorFull = "Error: " + msg + "\nurl: " + url + "\nline: " + line + extra;
        appTools.logError(errorFull);
        if (conf.Configuration.sendTelemetry)
            appInsights.trackException(error);
        alert(appTools.getText("cmClientError"));

        // On windows if window.onerror returns true, the application exits immediately
        // so to properly report an exception we need to return true here
        return true;
    };
}

function bindTriggerEvents() {
    var app = appTools.getApp();

    document.addEventListener("online", () => {
        app.isOnline = true;
        // Remove and execute all items in the array
        while (app.onlineWaitingEvents.length > 0) {
            (app.onlineWaitingEvents.shift())();
        }
    }, false);
    document.addEventListener("offline", () => {
        app.isOnline = false;
    }, false);
}

function bindNotificationEvents() {
    var app = appTools.getApp();

    app.notifications.onMissionNotificationAPN = (event) => {
        if (event.alert) {
            // Display the alert message in an alert.
            displayMissionApprovalResult(event.alert);
        }
        miss.MissionSet.forceRefresh();
    }

    app.notifications.onMissionNotificationGCM = (e) => {
        switch (e.event) {
            case 'registered':
                // Handle the registration.
                if (e.regid.length > 0) {
                    missionNotif.MissionNotification.androidRegister(e.regid);
                }
                break;
            case 'message':
                if (e.foreground) {
                    // Handle the received notification when the app is running
                    // and display the alert message. 
                    displayMissionApprovalResult(e.payload.message);
                }
                miss.MissionSet.forceRefresh();
                break;
            case 'error':
                appTools.logError('GCM error: ' + e.message);
                break;
        }
    }

    app.notifications.onMissionNotificationMPNS = (event) => {
        if (event.jsonContent) {
            // Display the alert message in an alert.
            displayMissionApprovalResult(event.jsonContent['wp:Text1']);
        }
        miss.MissionSet.forceRefresh();

    }

    app.notifications.channelHandlerMPNS = (result) => {
        if (result.uri !== "") {
            alert("callback " + JSON.stringify(result));
            missionNotif.MissionNotification.wp8Register(result.uri);
        }
        else
            appTools.logError("Channel URI could not be obtained at callback!");
    }

    app.notifications.errorHandlerMPNS = (error) => {
        appTools.logError('MPNS error: ' + error.code + ", " + error.message);
    }
}

function displayMissionApprovalResult(message: string) {
    alert(message);
}

function registerAppStart() {
    var app = appTools.getApp();
    if (app.langDictionary) { //fix for the first start
        if (!auth.isLoggedIn()) {
            navigation.navigateToEnterView(enums.Direction.left);
            return;
        }
        var requiredFields = appTools.getRequiredFields();
        if (requiredFields) {
            navigation.navigateToRequiredFieldsView(enums.Direction.left, requiredFields);
        } else {
            navigation.navigateToProfileView(enums.Direction.left);
        }
    } else {
        setTimeout(registerAppStart, 20);
    }    
}
