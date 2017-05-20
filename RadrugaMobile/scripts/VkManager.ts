/// <reference path="tsDefinitions/custom/navigator.d.ts" />
/// <reference path="tsDefinitions/cordova/plugins/InAppBrowser.d.ts" />
/// <reference path="tsDefinitions/cordova/plugins/FileTransfer.d.ts" />

import conf = require("../scripts/Configuration");
import tools = require("../scripts/Tools");
import storage = require("../scripts/Storage");
import interfaces = require("Interfaces");
import appTools = require("ApplicationTools");


export class Authorization {
    private _wwwref: Window;
    private _defferredResolved: boolean;

    login(): JQueryPromise<{}> {
        var deffered = jQuery.Deferred();
        this._defferredResolved = false;

        if (!Fields.token) {
            this._wwwref = window.open(encodeURI(conf.Configuration.vkTokenUrl), '_blank', 'location=no');
            // ReSharper disable once Html.EventNotResolved
            this._wwwref.addEventListener('loadstop', this.authEventUrl.bind(this, deffered));
            this._wwwref.addEventListener('loaderror', this.onerror.bind(this, deffered));
            this._wwwref.addEventListener('exit', this.onerror.bind(this, deffered));
        } else {
            deffered.resolve();
            this._defferredResolved = true;
        }
        return deffered.promise();
    }

    private authEventUrl(deffered: JQueryDeferred<{}>, event: InAppBrowserEvent) {
        var urlParts = event.url.split("#");
        if (urlParts[0] === 'https://oauth.vk.com/blank.html') {
            this._wwwref.close();
            var urlParams = tools.getUrlParameters(urlParts[1]);
            if (urlParams.error) {
                deffered.reject(urlParams.error_description);
            } else {
                Fields.token = urlParams.access_token;
                Fields.setHasVk();
                deffered.resolve();
            }
            this._defferredResolved = true;
        }
    }

    private onerror(deffered: JQueryDeferred<{}>, event: InAppBrowserEvent) {
        if (!this._defferredResolved) {
            if (event.type === "loaderror") {
                deffered.reject("Vk window: " + JSON.stringify(event));
            } else
                deffered.reject("Vk window " + event.type);
            this._defferredResolved = true;
        }
    }
}

export class VkApi {
    getProfileInfo(): JQueryPromise<any> {

        var parameters: any = {};
        parameters.fields = "nickname,sex,bdate,city,country,education,timezone,screen_name,counters";
        var paramString = tools.getParametersString(parameters);

        return this.makeRequest({
            method: "users.get",
            requestType: "GET",
            parameters: paramString
        });
    }

    getFriends(): JQueryXHR {
        return this.makeRequest({
            method: "friends.get",
            requestType: "GET"
        });
    }

    post(message: string, imageUrl: string) {
        return this.makeRequest({
            method: "photos.getWallUploadServer",
            requestType: "GET"
        }).then<FileUploadResult>((getServerResult) => {
            //TO test this you need to create file test.jpg in your simulator storage
            var filePath = navigator.simulator ? "test.jpg" : imageUrl;
            if (!getServerResult.response) {
                appTools.logError("Vk share server result: " + JSON.stringify(getServerResult));
                return $.Deferred().reject();
            }
            return this.uploadFile(filePath, getServerResult.response.upload_url);
        }).then<any>((uploadResult) => {
            var jsonResult = JSON.parse(uploadResult.response);
            return this.makeRequest({
                method: "photos.saveWallPhoto",
                requestType: "GET",
                parameters: "photo=" + jsonResult.photo + "&server=" + jsonResult.server + "&hash=" + jsonResult.hash
            });
        }).then((photoResult) => {
            var photoId = photoResult.response[0].id;
            var ownerId = photoResult.response[0].owner_id;
            var messageWithTag = "%23" + encodeURIComponent(appTools.getText("cmRadruga")) + "%0A" + encodeURIComponent(message);

            return this.makeRequest({
                method: "wall.post",
                requestType: "GET",
                parameters: "message=" + messageWithTag +"&attachments=photo" + ownerId + "_" + photoId
            });
        });
    }


    private makeRequest(options: interfaces.IVkApiCallOptions): JQueryXHR {
        var url = conf.Configuration.vkApiUrl + options.method + '?' + options.parameters + "&v=" + conf.Configuration.vkVersion +
            "&access_token=" + Fields.token;
        return $.ajax({
            url: url,
            type: options.requestType,
            data: options.data,
            dataType: options.data ? "json" : ""
        });
    }

    private uploadFile(fileUrl:string, serverUrl:string ): JQueryPromise<FileUploadResult> {
        var $deffered = $.Deferred();
        var ft = new FileTransfer();

        var uploadOptions: FileUploadOptions = {
            fileKey:"photo",
            mimeType: "image/jpeg",
            fileName: "mission.jpg"
        };

        ft.upload(fileUrl, serverUrl,
            (result: FileUploadResult) => {
                $deffered.resolve(result);
            }, (error: FileTransferError) => {
                $deffered.reject(error);
            },
            uploadOptions);
        return $deffered;
    }
}

export class Fields {

    public static setHasVk() {
        storage.PermanentStorage.set("hasVk", "true");
    }

    public static hasVk(): boolean {
        return !!storage.PermanentStorage.get("hasVk");
    }

    public static set token(value: string) {
        storage.PermanentStorage.set("vkToken", value);
    }
    public static get token() {
        return storage.PermanentStorage.get("vkToken");
    }

    public static clear() {
        storage.PermanentStorage.remove("vkToken");
        storage.PermanentStorage.remove("hasVk");
    }
}
