define(["require", "exports", "Authorization", "ApplicationTools", "Navigation", "Enums", "notifications/MissionNotification", "models/Mission", "Configuration"], function (require, exports, auth, appTools, navigation, enums, missionNotif, miss, conf) {
    "use strict";
    function initialize() {
        document.addEventListener('deviceready', onDeviceReady, false);
        if (screen && screen.lockOrientation)
            screen.lockOrientation('portrait');
    }
    exports.initialize = initialize;
    function onDeviceReady() {
        var kendoApplication = appTools.getKendoApplication();
        bindTriggerEvents();
        bindNotificationEvents();
        bindWindowEvents();
        navigator.splashscreen.hide();
        $(document).ajaxStart(function () {
            if (kendoApplication.pane) {
                kendoApplication.showLoading();
            }
        });
        $(document).ajaxStop(function () {
            if (kendoApplication.pane) {
                kendoApplication.hideLoading();
            }
        });
        registerAppStart();
    }
    function bindWindowEvents() {
        window.onerror = function (msg, url, line, col, error) {
            var extra = !col ? '' : '\ncolumn: ' + col;
            extra += !error ? '' : '\nstack: ' + error.stack;
            var errorFull = "Error: " + msg + "\nurl: " + url + "\nline: " + line + extra;
            appTools.logError(errorFull);
            if (conf.Configuration.sendTelemetry)
                appInsights.trackException(error);
            alert(appTools.getText("cmClientError"));
            return true;
        };
    }
    function bindTriggerEvents() {
        var app = appTools.getApp();
        document.addEventListener("online", function () {
            app.isOnline = true;
            while (app.onlineWaitingEvents.length > 0) {
                (app.onlineWaitingEvents.shift())();
            }
        }, false);
        document.addEventListener("offline", function () {
            app.isOnline = false;
        }, false);
    }
    function bindNotificationEvents() {
        var app = appTools.getApp();
        app.notifications.onMissionNotificationAPN = function (event) {
            if (event.alert) {
                displayMissionApprovalResult(event.alert);
            }
            miss.MissionSet.forceRefresh();
        };
        app.notifications.onMissionNotificationGCM = function (e) {
            switch (e.event) {
                case 'registered':
                    if (e.regid.length > 0) {
                        missionNotif.MissionNotification.androidRegister(e.regid);
                    }
                    break;
                case 'message':
                    if (e.foreground) {
                        displayMissionApprovalResult(e.payload.message);
                    }
                    miss.MissionSet.forceRefresh();
                    break;
                case 'error':
                    appTools.logError('GCM error: ' + e.message);
                    break;
            }
        };
        app.notifications.onMissionNotificationMPNS = function (event) {
            if (event.jsonContent) {
                displayMissionApprovalResult(event.jsonContent['wp:Text1']);
            }
            miss.MissionSet.forceRefresh();
        };
        app.notifications.channelHandlerMPNS = function (result) {
            if (result.uri !== "") {
                alert("callback " + JSON.stringify(result));
                missionNotif.MissionNotification.wp8Register(result.uri);
            }
            else
                appTools.logError("Channel URI could not be obtained at callback!");
        };
        app.notifications.errorHandlerMPNS = function (error) {
            appTools.logError('MPNS error: ' + error.code + ", " + error.message);
        };
    }
    function displayMissionApprovalResult(message) {
        alert(message);
    }
    function registerAppStart() {
        var app = appTools.getApp();
        if (app.langDictionary) {
            if (!auth.isLoggedIn()) {
                navigation.navigateToEnterView(enums.Direction.left);
                return;
            }
            var requiredFields = appTools.getRequiredFields();
            if (requiredFields) {
                navigation.navigateToRequiredFieldsView(enums.Direction.left, requiredFields);
            }
            else {
                navigation.navigateToProfileView(enums.Direction.left);
            }
        }
        else {
            setTimeout(registerAppStart, 20);
        }
    }
});
