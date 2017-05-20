define(["require", "exports", "Authorization", "Configuration"], function (require, exports, auth, conf) {
    "use strict";
    var ServiceApi = (function () {
        function ServiceApi() {
        }
        ServiceApi.prototype.addAuthHeader = function (xhr) {
            var accessToken = auth.getAccessToken();
            if (accessToken) {
                xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
            }
        };
        ServiceApi.prototype.callService = function (options) {
            var _this = this;
            return $.ajax({
                url: conf.Configuration.apiUrl + options.method +
                    (options.parameters ? '?' + options.parameters : ''),
                type: options.requestType,
                data: options.data,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                beforeSend: function (xhr) {
                    if (typeof options.httpHeader !== 'undefined' && typeof options.headerValue !== 'undefined')
                        xhr.setRequestHeader(options.httpHeader, options.headerValue);
                    _this.addAuthHeader(xhr);
                }
            });
        };
        ServiceApi.prototype.uploadFile = function (options) {
            var $deffered = $.Deferred();
            var ft = new FileTransfer();
            var accessToken = auth.getAccessToken();
            var uploadOptions = {
                fileName: options.fileName,
                mimeType: "image/jpeg",
                params: options.params,
                headers: {
                    "Authorization": "Bearer " + accessToken
                }
            };
            ft.upload(options.filePath, conf.Configuration.apiUrl + options.method, function (result) {
                $deffered.resolve(result);
            }, function (error) {
                $deffered.reject(error);
            }, uploadOptions);
            return $deffered;
        };
        return ServiceApi;
    }());
    exports.ServiceApi = ServiceApi;
});
