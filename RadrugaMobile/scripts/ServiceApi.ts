/// <reference path="tsDefinitions/cordova/plugins/FileTransfer.d.ts" />
/// <reference path="tsDefinitions/cordova/plugins/Window.d.ts" />
import auth = require("Authorization");
import interfaces = require("Interfaces");
import conf = require("Configuration");


export class ServiceApi {  

    //private functions
    private addAuthHeader(xhr: JQueryXHR) {
        var accessToken = auth.getAccessToken();
        if (accessToken) {
            xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
        }
    }

    callService(options: interfaces.IApiCallOptions): JQueryXHR {
        return $.ajax({
            url: conf.Configuration.apiUrl + options.method +
            (options.parameters ? '?' + options.parameters : ''),
            type: options.requestType,
            data: options.data,
            dataType: "json",
            contentType: "application/json; charset=utf-8",

            //Add HTTP headers if configured
            beforeSend: xhr => {
                if (typeof options.httpHeader !== 'undefined' && typeof options.headerValue !== 'undefined')
                    xhr.setRequestHeader(options.httpHeader, options.headerValue);
                this.addAuthHeader(xhr);
            }
        });
    }

    uploadFile(options: interfaces.IFileUploadOptions): JQueryPromise<FileUploadResult> {
        var $deffered = $.Deferred();
        var ft = new FileTransfer();
        var accessToken = auth.getAccessToken();

        var uploadOptions: FileUploadOptions = {
            fileName: options.fileName,
            mimeType: "image/jpeg",
            params: options.params,
            headers: {
                "Authorization": "Bearer " + accessToken
            }
        };

        ft.upload(options.filePath, conf.Configuration.apiUrl + options.method,
            (result: FileUploadResult) => {
                $deffered.resolve(result);
            }, (error: FileTransferError) => {
                $deffered.reject(error);
            },
            uploadOptions);
        return $deffered;
    }
}