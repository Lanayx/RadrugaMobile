define(["require", "exports", "../notifications/NotificationHub", "../notifications/NotificationTemplates", "../models/User"], function (require, exports, nhub, templates, user) {
    "use strict";
    var MissionNotification = (function () {
        function MissionNotification() {
        }
        MissionNotification.registerToMission = function () {
            var deffered = $.Deferred();
            if (!window.plugins || !window.plugins.pushNotification)
                return deffered.resolve();
            var pushNotification = window.plugins.pushNotification;
            switch (device.platform) {
                case "android":
                case "Android":
                    {
                        pushNotification.register(function (data) {
                            deffered.resolve();
                        }, function (error) {
                            deffered.reject(error);
                        }, {
                            "senderID": MissionNotification._gcmSenderId,
                            "ecb": "app.notifications.onMissionNotificationGCM"
                        });
                        break;
                    }
                case "iOS":
                    {
                        pushNotification.register(function (registrationId) {
                            MissionNotification.iphoneRegister(registrationId).done(function () {
                                deffered.resolve();
                            }).fail(function (error) {
                                deffered.reject(error);
                            });
                        }, function (error) {
                            deffered.reject(error);
                        }, {
                            "ecb": "app.notifications.onMissionNotificationAPN"
                        });
                        break;
                    }
                case "Win32NT":
                    {
                        pushNotification.register(function (result) {
                            if (result.uri !== "") {
                                MissionNotification.wp8Register(result.uri).done(function () {
                                    deffered.resolve();
                                }).fail(function (error) {
                                    deffered.reject(error);
                                });
                            }
                            else {
                                deffered.reject("Channel URI could not be obtained at once!");
                            }
                        }, function (error) {
                            deffered.reject(error);
                        }, {
                            "channelName": MissionNotification._wpChannelName,
                            "uccb": "app.notifications.channelHandlerMPNS",
                            "ecb": "app.notifications.onMissionNotificationMPNS",
                            "errcb": "app.notifications.errorHandlerMPNS"
                        });
                        break;
                    }
                default:
                    throw "Unrecognized device type";
            }
            return deffered.promise();
        };
        MissionNotification.unregisterFromMission = function () {
            var deffered = $.Deferred();
            if (!window.plugins || !window.plugins.pushNotification)
                return deffered.resolve();
            var pushNotification = window.plugins.pushNotification;
            switch (device.platform) {
                case "android":
                case "Android":
                case "iOS":
                    {
                        pushNotification.unregister(function () {
                            MissionNotification.unRegister().done(function () {
                                deffered.resolve();
                            }).fail(function (error) {
                                deffered.reject(error);
                            });
                        }, function (error) {
                            deffered.reject(error);
                        });
                        break;
                    }
                case "Win32NT":
                    {
                        pushNotification.unregister(function () {
                            MissionNotification.unRegister().done(function () {
                                deffered.resolve();
                            }).fail(function (error) {
                                deffered.reject(error);
                            });
                        }, function (error) {
                            //temporary treat error as success
                            MissionNotification.unRegister().done(function () {
                                deffered.resolve();
                            }).fail(function (error) {
                                deffered.reject(error);
                            });
                        }, {
                            "channelName": MissionNotification._wpChannelName
                        });
                        break;
                    }
                default:
                    throw "Unrecognized device type";
            }
            return deffered.promise();
        };
        MissionNotification.iphoneRegister = function (registrationId) {
            return MissionNotification._hub.register(registrationId, MissionNotification._storageKey, templates.MissionTemplates.getApnTemplate(), [user.User.getFromStorage().id]);
        };
        MissionNotification.wp8Register = function (registrationId) {
            return MissionNotification._hub.register(registrationId, MissionNotification._storageKey, templates.MissionTemplates.getMpnsTemplate(), [user.User.getFromStorage().id]);
        };
        MissionNotification.androidRegister = function (registrationId) {
            return MissionNotification._hub.register(registrationId, MissionNotification._storageKey, templates.MissionTemplates.getGcmTemplate(), [user.User.getFromStorage().id]);
        };
        MissionNotification.unRegister = function () {
            return MissionNotification._hub.unregister(MissionNotification._storageKey);
        };
        MissionNotification._gcmSenderId = "547588245145";
        MissionNotification._storageKey = "missionRegistration";
        MissionNotification._wpChannelName = "missionChannel";
        MissionNotification._hub = new nhub.NotificationHub();
        return MissionNotification;
    }());
    exports.MissionNotification = MissionNotification;
});
