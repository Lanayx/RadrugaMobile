/// <reference path="../tsDefinitions/cryptojs.d.ts" />
/// <reference path="../../kendo/typescript/jquery.d.ts" />
define(["require", "exports", "../Storage", "../ApplicationTools"], function (require, exports, storage, appTools) {
    "use strict";
    var NotificationHub = (function () {
        function NotificationHub() {
            var _this = this;
            this._connectionString = "Endpoint=sb://radruganotificationhub-ns.servicebus.windows.net/;SharedAccessKeyName=DefaultFullSharedAccessSignature;SharedAccessKey=TZxG3GG6iTViVHaLRkUdweaImkF9mZhJIEVbJSZ6zx8=";
            this._notificationHubPath = "radruganotificationhub";
            this._hubVersion = "2015-01";
            this._parts = this._connectionString.split(';');
            this._parts.forEach(function (part) {
                if (part.indexOf('Endpoint') == 0) {
                    _this._endpoint = 'https' + part.substring(11);
                }
                else if (part.indexOf('SharedAccessKeyName') == 0) {
                    _this._sasKeyName = part.substring(20);
                }
                else if (part.indexOf('SharedAccessKey') == 0) {
                    _this._sasKeyValue = part.substring(16);
                }
            });
        }
        // #region private functions
        NotificationHub.prototype.upsertRegistration = function (registration) {
            var _this = this;
            console.log("Create registration: " + JSON.stringify(registration));
            var registrationPayload = this.buildCreatePayload(registration);
            var registrationPath = this._notificationHubPath + "/Registrations";
            var serverUrl = "" + this._endpoint + registrationPath + "?api-version=" + this._hubVersion;
            var deferred = $.Deferred();
            this.getSelfSignedToken(serverUrl, this._sasKeyValue, this._sasKeyName, 60)
                .then(function (token) {
                console.log("Server url: " + serverUrl);
                console.log("Token: " + token);
                console.log("Data: " + registrationPayload);
                $.ajax({
                    type: "POST",
                    url: serverUrl,
                    headers: {
                        "Content-Type": "application/atom+xml;type=entry;charset=utf-8",
                        "Authorization": token,
                        "x-ms-version": _this._hubVersion
                    },
                    data: registrationPayload
                }).done(function (data, status, response) {
                    console.log("Response:" + response.responseText);
                    var responseXml = $.parseXML(response.responseText);
                    var location = $(responseXml).find("id").text();
                    deferred.resolve(location);
                    console.log("create registration succeded");
                }).fail(function (response, status, error) {
                    appTools.logError(JSON.stringify(response) + " " + status + " " + error);
                    deferred.reject("Error: " + error);
                });
            });
            return deferred.promise();
        };
        NotificationHub.prototype.removeRegistration = function (location) {
            var _this = this;
            console.log("Remove registration: " + location);
            var serverUrl = location;
            var deferred = $.Deferred();
            this.getSelfSignedToken(serverUrl, this._sasKeyValue, this._sasKeyName, 60)
                .then(function (token) {
                console.log("Server url: " + serverUrl);
                console.log("Token: " + token);
                $.ajax({
                    type: "DELETE",
                    url: serverUrl,
                    headers: {
                        "Content-Type": "application/atom+xml;type=entry;charset=utf-8",
                        "Authorization": token,
                        "x-ms-version": _this._hubVersion,
                        "If-Match": "\"*\""
                    }
                }).done(function () {
                    console.log("remove registration succeded");
                    deferred.resolve();
                }).fail(function (response, status, error) {
                    appTools.logError(JSON.stringify(response) + " " + status + " " + error);
                    deferred.reject("Error: " + error);
                });
            });
            return deferred.promise();
        };
        NotificationHub.prototype.buildCreatePayload = function (registration) {
            var registrationPayload = registration.template.replace('{1}', registration.registrationId);
            var tagstring = registration.tags.join(',');
            registrationPayload = registrationPayload.replace('{0}', tagstring);
            return registrationPayload;
        };
        NotificationHub.prototype.getSelfSignedToken = function (targetUri, sharedKey, ruleId, expiresInMins) {
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
            require(["cryptojs"], function () {
                var signature = CryptoJS.HmacSHA256(tosign, sharedKey);
                var base64signature = signature.toString(CryptoJS.enc.Base64);
                var base64UriEncoded = encodeURIComponent(base64signature);
                // construct autorization string
                var token = "SharedAccessSignature sr=" + targetUri + "&sig=" + base64UriEncoded + "&se=" + expires + "&skn=" + ruleId;
                // console.log("signature:" + token);
                return deferred.resolve(token);
            });
            return deferred.promise();
        };
        NotificationHub.prototype.getFromStorage = function (storageKey) {
            var registration = storage.PermanentStorage.get(storageKey);
            if (typeof registration === 'string') {
                return JSON.parse(registration);
            }
            return undefined;
        };
        NotificationHub.prototype.setToStorage = function (storageKey, registration) {
            storage.PermanentStorage.set(storageKey, JSON.stringify(registration));
        };
        NotificationHub.prototype.removeFromStorage = function (storageKey) {
            storage.PermanentStorage.remove(storageKey);
        };
        // #endregion private functions
        // #region public API
        NotificationHub.prototype.register = function (registrationId, storageKey, template, tags) {
            var _this = this;
            // Build the key used to store info in local storage,
            // then get the stored registration--if it exists.
            var regInfo = {
                template: template,
                registrationId: registrationId,
                tags: tags
            };
            // create new registration.
            return this.upsertRegistration(regInfo).then(function (location) {
                // Store registration info with the returned ID.
                regInfo.location = location;
                _this.setToStorage(storageKey, regInfo);
            });
        };
        NotificationHub.prototype.unregister = function (storageKey) {
            var _this = this;
            var regInfo = this.getFromStorage(storageKey);
            if (typeof regInfo !== 'undefined') {
                return this.removeRegistration(regInfo.location).then(function () {
                    _this.removeFromStorage(storageKey);
                });
            }
            return $.Deferred().resolve(); //skip removal at the moment if not in the storage
        };
        return NotificationHub;
    }());
    exports.NotificationHub = NotificationHub;
});
