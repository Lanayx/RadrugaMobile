/// <reference path="../tsDefinitions/cryptojs.d.ts" />
/// <reference path="../../kendo/typescript/jquery.d.ts" />

import interfaces = require("NotificationInterfaces");
import storage = require("../Storage");
import appTools = require("../ApplicationTools");

export class NotificationHub {


    private _connectionString = "Endpoint=sb://radruganotificationhub-ns.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=TZxG3GG6iTViVHaLRkUdweaImkF9mZhJIEVbJSZ6zx8=";
    private _notificationHubPath = "radruganotificationhub";
    private _hubVersion = "2015-01";

    private _parts = this._connectionString.split(';');

    private _endpoint: string;
    private _sasKeyName: string;
    private _sasKeyValue: string;

    constructor() {
        this._parts.forEach(part => {
            if (part.indexOf('Endpoint') == 0) {
                this._endpoint = 'https' + part.substring(11);
            } else if (part.indexOf('SharedAccessKeyName') == 0) {
                this._sasKeyName = part.substring(20);
            } else if (part.indexOf('SharedAccessKey') == 0) {
                this._sasKeyValue = part.substring(16);
            }
        });
    }

    // #region private functions
    private upsertRegistration(registration: interfaces.Registration) {
        console.log("Create registration: " + JSON.stringify(registration));
        var registrationPayload = this.buildCreatePayload(registration);
        var registrationPath = this._notificationHubPath + "/Registrations";
        var serverUrl = `${this._endpoint}${registrationPath}?api-version=${this._hubVersion}`;

        var deferred = $.Deferred();

        this.getSelfSignedToken(serverUrl, this._sasKeyValue, this._sasKeyName, 60)
            .then((token) => {

                console.log("Server url: " + serverUrl);
                console.log("Token: " + token);
                console.log("Data: " + registrationPayload);
                $.ajax({
                    type: "POST",
                    url: serverUrl,
                    headers: {
                        "Content-Type": "application/atom+xml;type=entry;charset=utf-8",
                        "Authorization": token,
                        "x-ms-version": this._hubVersion
                    },
                    data: registrationPayload
                }).done((data, status, response) => {
                    console.log("Response:" + response.responseText);
                    var responseXml = $.parseXML(response.responseText);
                    var location = $(responseXml).find("id").text();
                    deferred.resolve(location);
                    console.log("create registration succeded");
                }).fail((response, status, error) => {
                    appTools.logError(JSON.stringify(response) + " " + status + " " + error);
                    deferred.reject("Error: " + error);
                });
            });
        return deferred.promise();
    }


    private removeRegistration(location: string) {
        console.log("Remove registration: " + location);

        var serverUrl = location;
        var deferred = $.Deferred();
        this.getSelfSignedToken(serverUrl, this._sasKeyValue, this._sasKeyName, 60)
            .then((token) => {
                console.log("Server url: " + serverUrl);
                console.log("Token: " + token);
                $.ajax({
                    type: "DELETE",
                    url: serverUrl,
                    headers: {
                        "Content-Type": "application/atom+xml;type=entry;charset=utf-8",
                        "Authorization": token,
                        "x-ms-version": this._hubVersion,
                        "If-Match": "\"*\""
                    }
                }).done(() => {
                    console.log("remove registration succeded");
                    deferred.resolve();
                }).fail((response, status, error) => {
                    appTools.logError(JSON.stringify(response) + " " + status + " " + error);
                    deferred.reject("Error: " + error);
                });
            });
        return deferred.promise();
    }

    private buildCreatePayload(registration: interfaces.Registration) {
        var registrationPayload = registration.template.replace('{1}', registration.registrationId);
        var tagstring = registration.tags.join(',');
        registrationPayload = registrationPayload.replace('{0}', tagstring);
        return registrationPayload;
    }

    private getSelfSignedToken(targetUri, sharedKey, ruleId, expiresInMins) {
        targetUri = encodeURIComponent(targetUri.toLowerCase()).toLowerCase();

        var deferred = $.Deferred();
        // Set expiration in seconds
        var expireOnDate = new Date();
        expireOnDate.setMinutes(expireOnDate.getMinutes() + expiresInMins);
        var expires = Date.UTC(expireOnDate.getUTCFullYear(), expireOnDate
            .getUTCMonth(), expireOnDate.getUTCDate(), expireOnDate
                .getUTCHours(), expireOnDate.getUTCMinutes(), expireOnDate
                    .getUTCSeconds()) / 1000;
        var tosign = targetUri + '\n' + expires;

        // using CryptoJS


        require(["cryptojs"], () => {
            var signature = CryptoJS.HmacSHA256(tosign, sharedKey);
            var base64signature = signature.toString(CryptoJS.enc.Base64);
            var base64UriEncoded = encodeURIComponent(base64signature);

            // construct autorization string
            var token = `SharedAccessSignature sr=${targetUri}&sig=${base64UriEncoded}&se=${expires}&skn=${ruleId}`;
            // console.log("signature:" + token);
            return deferred.resolve(token);
        });

        return deferred.promise();
    }
    private getFromStorage(storageKey: string): interfaces.Registration {
        var registration = storage.PermanentStorage.get(storageKey);
        if (typeof registration === 'string') {
            return JSON.parse(registration);
        }
        return undefined;
    }
    private setToStorage(storageKey: string, registration: interfaces.Registration) {
        storage.PermanentStorage.set(storageKey, JSON.stringify(registration));
    }

    private removeFromStorage(storageKey: string) {
        storage.PermanentStorage.remove(storageKey);
    }

    // #endregion private functions

    // #region public API
    public register(registrationId: string, storageKey: string, template: string, tags: string[]): JQueryPromise<any> {
        // Build the key used to store info in local storage,
        // then get the stored registration--if it exists.
        var regInfo: interfaces.Registration = {
            template: template,
            registrationId: registrationId,
            tags: tags
        };

        // create new registration.
        return this.upsertRegistration(regInfo).then(
            (location: string) => {
                // Store registration info with the returned ID.
                regInfo.location = location;
                this.setToStorage(storageKey, regInfo);
            });
    }

    public unregister(storageKey: string): JQueryPromise<any> {
        var regInfo = this.getFromStorage(storageKey);
        if (typeof regInfo !== 'undefined') {
            return this.removeRegistration(regInfo.location).then(() => {
                this.removeFromStorage(storageKey);
            });
        }
        return $.Deferred().resolve();//skip removal at the moment if not in the storage
    }

    // #endregion public API


}