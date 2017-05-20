define(["require", "exports", "../scripts/Configuration", "../scripts/Tools", "../scripts/Storage", "ApplicationTools"], function (require, exports, conf, tools, storage, appTools) {
    "use strict";
    var Authorization = (function () {
        function Authorization() {
        }
        Authorization.prototype.login = function () {
            var deffered = jQuery.Deferred();
            this._defferredResolved = false;
            if (!Fields.token) {
                this._wwwref = window.open(encodeURI(conf.Configuration.vkTokenUrl), '_blank', 'location=no');
                this._wwwref.addEventListener('loadstop', this.authEventUrl.bind(this, deffered));
                this._wwwref.addEventListener('loaderror', this.onerror.bind(this, deffered));
                this._wwwref.addEventListener('exit', this.onerror.bind(this, deffered));
            }
            else {
                deffered.resolve();
                this._defferredResolved = true;
            }
            return deffered.promise();
        };
        Authorization.prototype.authEventUrl = function (deffered, event) {
            var urlParts = event.url.split("#");
            if (urlParts[0] === 'https://oauth.vk.com/blank.html') {
                this._wwwref.close();
                var urlParams = tools.getUrlParameters(urlParts[1]);
                if (urlParams.error) {
                    deffered.reject(urlParams.error_description);
                }
                else {
                    Fields.token = urlParams.access_token;
                    Fields.setHasVk();
                    deffered.resolve();
                }
                this._defferredResolved = true;
            }
        };
        Authorization.prototype.onerror = function (deffered, event) {
            if (!this._defferredResolved) {
                if (event.type === "loaderror") {
                    deffered.reject("Vk window: " + JSON.stringify(event));
                }
                else
                    deffered.reject("Vk window " + event.type);
                this._defferredResolved = true;
            }
        };
        return Authorization;
    }());
    exports.Authorization = Authorization;
    var VkApi = (function () {
        function VkApi() {
        }
        VkApi.prototype.getProfileInfo = function () {
            var parameters = {};
            parameters.fields = "nickname,sex,bdate,city,country,education,timezone,screen_name,counters";
            var paramString = tools.getParametersString(parameters);
            return this.makeRequest({
                method: "users.get",
                requestType: "GET",
                parameters: paramString
            });
        };
        VkApi.prototype.getFriends = function () {
            return this.makeRequest({
                method: "friends.get",
                requestType: "GET"
            });
        };
        VkApi.prototype.post = function (message, imageUrl) {
            var _this = this;
            return this.makeRequest({
                method: "photos.getWallUploadServer",
                requestType: "GET"
            }).then(function (getServerResult) {
                var filePath = navigator.simulator ? "test.jpg" : imageUrl;
                if (!getServerResult.response) {
                    appTools.logError("Vk share server result: " + JSON.stringify(getServerResult));
                    return $.Deferred().reject();
                }
                return _this.uploadFile(filePath, getServerResult.response.upload_url);
            }).then(function (uploadResult) {
                var jsonResult = JSON.parse(uploadResult.response);
                return _this.makeRequest({
                    method: "photos.saveWallPhoto",
                    requestType: "GET",
                    parameters: "photo=" + jsonResult.photo + "&server=" + jsonResult.server + "&hash=" + jsonResult.hash
                });
            }).then(function (photoResult) {
                var photoId = photoResult.response[0].id;
                var ownerId = photoResult.response[0].owner_id;
                var messageWithTag = "%23" + encodeURIComponent(appTools.getText("cmRadruga")) + "%0A" + encodeURIComponent(message);
                return _this.makeRequest({
                    method: "wall.post",
                    requestType: "GET",
                    parameters: "message=" + messageWithTag + "&attachments=photo" + ownerId + "_" + photoId
                });
            });
        };
        VkApi.prototype.makeRequest = function (options) {
            var url = conf.Configuration.vkApiUrl + options.method + '?' + options.parameters + "&v=" + conf.Configuration.vkVersion +
                "&access_token=" + Fields.token;
            return $.ajax({
                url: url,
                type: options.requestType,
                data: options.data,
                dataType: options.data ? "json" : ""
            });
        };
        VkApi.prototype.uploadFile = function (fileUrl, serverUrl) {
            var $deffered = $.Deferred();
            var ft = new FileTransfer();
            var uploadOptions = {
                fileKey: "photo",
                mimeType: "image/jpeg",
                fileName: "mission.jpg"
            };
            ft.upload(fileUrl, serverUrl, function (result) {
                $deffered.resolve(result);
            }, function (error) {
                $deffered.reject(error);
            }, uploadOptions);
            return $deffered;
        };
        return VkApi;
    }());
    exports.VkApi = VkApi;
    var Fields = (function () {
        function Fields() {
        }
        Fields.setHasVk = function () {
            storage.PermanentStorage.set("hasVk", "true");
        };
        Fields.hasVk = function () {
            return !!storage.PermanentStorage.get("hasVk");
        };
        Object.defineProperty(Fields, "token", {
            get: function () {
                return storage.PermanentStorage.get("vkToken");
            },
            set: function (value) {
                storage.PermanentStorage.set("vkToken", value);
            },
            enumerable: true,
            configurable: true
        });
        Fields.clear = function () {
            storage.PermanentStorage.remove("vkToken");
            storage.PermanentStorage.remove("hasVk");
        };
        return Fields;
    }());
    exports.Fields = Fields;
});
