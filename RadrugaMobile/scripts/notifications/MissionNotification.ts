import nhub = require("../notifications/NotificationHub");
import templates = require("../notifications/NotificationTemplates");
import user = require("../models/User");

export class MissionNotification {

    private static _gcmSenderId = "547588245145";
    private static _storageKey = "missionRegistration";
    private static _wpChannelName = "missionChannel";
    private static _hub = new nhub.NotificationHub();

    public static registerToMission(): JQueryPromise<any> {

        var deffered = $.Deferred();

        if (!window.plugins || !window.plugins.pushNotification)
            return deffered.resolve();
        var pushNotification = window.plugins.pushNotification;

        switch (device.platform) {
            case "android":
            case "Android":
                {
                    pushNotification.register(
                        (data) => {
                            deffered.resolve();
                        },
                        (error) => {
                            deffered.reject(error);
                        },
                        {
                            "senderID": MissionNotification._gcmSenderId,
                            "ecb": "app.notifications.onMissionNotificationGCM"
                        });
                    break;
                }
            case "iOS":
            {
                    pushNotification.register(
                        (registrationId) => {
                            MissionNotification.iphoneRegister(registrationId).done(() => {
                                deffered.resolve();
                            }).fail((error: any) => {
                                deffered.reject(error);
                            });
                        },
                        (error) => {
                            deffered.reject(error);
                        },
                        {
                            "ecb": "app.notifications.onMissionNotificationAPN"
                        });
                    break;
                }
            case "Win32NT":
                {
                    pushNotification.register(
                        (result) => {
                            if (result.uri !== "") {
                                MissionNotification.wp8Register(result.uri).done(() => {
                                    deffered.resolve();
                                }).fail((error: any) => {
                                    deffered.reject(error);
                                });
                            } else {
                                deffered.reject(<any>"Channel URI could not be obtained at once!");
                            }
                        },
                        (error) => {
                            deffered.reject(error);
                        },
                        {
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
    }

    public static unregisterFromMission(): JQueryPromise<any> {

        var deffered = $.Deferred();

        if (!window.plugins || !window.plugins.pushNotification)
            return deffered.resolve();


        var pushNotification = window.plugins.pushNotification;

        switch (device.platform) {
            case "android":
            case "Android":
            case "iOS":
                {
                    pushNotification.unregister(
                        () => {
                            MissionNotification.unRegister().done(() => {
                                deffered.resolve();
                            }).fail((error) => {
                                deffered.reject(error);
                            });
                        },
                        (error) => {
                            deffered.reject(error);
                        });
                    break;
                }
            case "Win32NT":
                {
                    pushNotification.unregister(
                        () => {
                            MissionNotification.unRegister().done(() => {
                                deffered.resolve();
                            }).fail((error) => {
                                deffered.reject(error);
                            });
                        },
                        (error) => {
                            //temporary treat error as success
                            MissionNotification.unRegister().done(() => {
                                deffered.resolve();
                            }).fail((error) => {
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
    }

    public static iphoneRegister(registrationId: string): JQueryPromise<any> {
        return MissionNotification._hub.register(registrationId, MissionNotification._storageKey,
            templates.MissionTemplates.getApnTemplate(), [user.User.getFromStorage().id]);
    }

    public static wp8Register(registrationId: string): JQueryPromise<any> {
        return MissionNotification._hub.register(registrationId, MissionNotification._storageKey,
            templates.MissionTemplates.getMpnsTemplate(), [user.User.getFromStorage().id]);
    }

    public static androidRegister(registrationId: string): JQueryPromise<any> {
        return MissionNotification._hub.register(registrationId, MissionNotification._storageKey,
            templates.MissionTemplates.getGcmTemplate(), [user.User.getFromStorage().id]);
    }

    public static unRegister(): JQueryPromise<any> {
        return MissionNotification._hub.unregister(MissionNotification._storageKey);
    }

}