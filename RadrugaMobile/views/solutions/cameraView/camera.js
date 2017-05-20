var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/camera/cameraTools", "../../../scripts/Enums", "../../../scripts/models/Mission", "../../../scripts/Storage", "../../../scripts/ServiceApi"], function (require, exports, appTools, navigation, cameraTools, enums, miss, storage, serviceApi) {
    "use strict";
    var addPhotoUrl = "styles/svg/addPhoto.svg";
    var CameraViewModel = (function (_super) {
        __extends(CameraViewModel, _super);
        function CameraViewModel() {
            _super.call(this);
            this.photosDataSource = [];
            this.missionImagePath = "";
            this.noPhotos = true;
            this._missionId = "";
            this._numberOfPhotos = 0;
            this.sendForApprovalButton = appTools.getText("slnSendForApproval");
            this.cancelButton = appTools.getText("cmCancel");
            this._processStarted = false;
            _super.prototype.init.call(this, this);
        }
        CameraViewModel.prototype.onCancel = function () {
            backButtonCallback();
        };
        CameraViewModel.prototype.takePicture = function () {
            var _this = this;
            cameraTools.takePhoto().done(function (image) {
                if (_this.photosDataSource.length > 1)
                    _this.photosDataSource.pop();
                _this.photosDataSource.push({ imageUrl: image.localUrl, canBeRemoved: true });
                _this.set("noPhotos", false);
                if (_this.photosDataSource.length > 0 && _this.photosDataSource.length < _this._numberOfPhotos)
                    _this.photosDataSource.push({ imageUrl: addPhotoUrl, canBeRemoved: false, isAddButton: true });
                _this.storeTempPhotos();
            }).fail(function (message) {
                navigator.notification.alert(message, function () { }, appTools.getText("cameraErrorTitle"), "OK");
            });
        };
        CameraViewModel.prototype.onRemovePhoto = function (event) {
            var photoUrl = $(event.currentTarget).attr("data-url");
            for (var i = 0; i < this.photosDataSource.length; i++)
                if (this.photosDataSource[i].imageUrl === photoUrl) {
                    this.photosDataSource.splice(i, 1);
                    break;
                }
            if (this.photosDataSource.length === 1)
                if (this.photosDataSource[0].imageUrl === addPhotoUrl)
                    this.photosDataSource.pop();
            if (this.photosDataSource.length > 0 && this.photosDataSource[this.photosDataSource.length - 1].imageUrl !== addPhotoUrl)
                this.photosDataSource.push({ imageUrl: addPhotoUrl, canBeRemoved: false, isAddButton: true });
            this.set("noPhotos", !this.photosDataSource[0]);
            this.storeTempPhotos();
        };
        CameraViewModel.prototype.onApproveSend = function () {
            if (this.photosDataSource.length !== this._numberOfPhotos || this.photosDataSource[this.photosDataSource.length - 1].imageUrl === addPhotoUrl)
                return;
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            if (this.photosDataSource.length === 1) {
                this.sendOnePhotoApprove();
            }
            else {
                this.sendMultiPhotoApprove();
            }
        };
        CameraViewModel.prototype.onBinded = function () {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
            this.set("missionImagePath", "url(" + model.imageUrl + ")");
            this.set("missionName", model.name);
            this._missionId = model.id;
            this._numberOfPhotos = model.numberOfPhotos;
            if (model.tempPhotoDatasourceJson) {
                var data = JSON.parse(model.tempPhotoDatasourceJson);
                if (data[0]) {
                    this.photosDataSource.push.apply(this.photosDataSource, data);
                    this.set("noPhotos", false);
                }
            }
        };
        CameraViewModel.prototype.sendOnePhotoApprove = function () {
            var _this = this;
            var api = new serviceApi.ServiceApi();
            api.uploadFile({
                filePath: navigator.simulator ? "test.jpg" : this.photosDataSource[0].imageUrl,
                method: "mission/CompleteOnePhotoMission",
                fileName: "mission.jpg",
                params: {
                    MissionId: this._missionId
                }
            }).done(function (result) {
                var jsonResult = JSON.parse(result.response);
                if (jsonResult.Status === 0 && jsonResult.MissionCompletionStatus === enums.MissionCompletionStatus.Waiting) {
                    navigation.navigateToWaitView(enums.Direction.right, {
                        imageUrl: _this.get("missionImagePath"),
                        missionId: _this._missionId
                    });
                }
                else
                    navigator.notification.alert(jsonResult.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        CameraViewModel.prototype.sendMultiPhotoApprove = function () {
            var _this = this;
            var api = new serviceApi.ServiceApi();
            this.sendImagesToServer(api)
                .then(function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                var arrayUrls = args.length === 1 ? args[0] : $.makeArray(args);
                var proof = {
                    ImageUrls: arrayUrls.map(function (result) {
                        return JSON.parse(result.response);
                    })
                };
                return api.callService({
                    method: "mission/CompleteMission?missionId=" + _this._missionId,
                    requestType: "POST",
                    data: JSON.stringify(proof)
                });
            }).done(function (result) {
                if (result.Status === 0 && result.MissionCompletionStatus === enums.MissionCompletionStatus.Waiting) {
                    navigation.navigateToWaitView(enums.Direction.right, {
                        imageUrl: _this.get("missionImagePath"),
                        missionId: _this._missionId
                    });
                }
                else
                    navigator.notification.alert(result.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            }).fail(function (error) {
                alert(JSON.stringify(error));
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        CameraViewModel.prototype.sendImagesToServer = function (api) {
            var _this = this;
            if (device.platform !== "Win32NT") {
                var uploadFilesTasks = this.photosDataSource.map(function (image, index) {
                    return _this.uploadImage(api, image.imageUrl);
                });
                return $.when.apply(this, uploadFilesTasks);
            }
            else {
                var length = this.photosDataSource.length;
                var results = [];
                var task = this.uploadImage(api, this.photosDataSource[0].imageUrl);
                var deferred = $.Deferred();
                for (var i = 1; i < length; i++) {
                    (function (image) {
                        task = task.then(function (result) {
                            results.push(result);
                            return _this.uploadImage(api, image.imageUrl);
                        });
                    })(this.photosDataSource[i]);
                }
                task.done(function (result) {
                    results.push(result);
                    deferred.resolve(results);
                }).fail(function (error) {
                    deferred.reject(error);
                });
                return deferred.promise();
            }
        };
        CameraViewModel.prototype.uploadImage = function (api, imageUrl) {
            return api.uploadFile({
                filePath: navigator.simulator ? "test.jpg" : imageUrl,
                method: "mission/AddProofImage",
                fileName: this._missionId + ".jpg"
            });
        };
        CameraViewModel.prototype.storeTempPhotos = function () {
            miss.Mission.setCurrentMissionTempPhotoUrls(JSON.stringify(this.photosDataSource));
        };
        return CameraViewModel;
    }(kendo.data.ObservableObject));
    exports.CameraViewModel = CameraViewModel;
    function bindModel() {
        var model = new CameraViewModel();
        kendo.bind($("#vCamera"), model, kendo.mobile.ui);
        model.onBinded();
        appTools.viewBinded();
    }
    function backButtonCallback() {
        navigation.navigateToMissionView(enums.Direction.right);
    }
    var app = appTools.getApp();
    app.appInit.cameraViewModelInit = function () {
        bindModel();
    };
    app.appInit.cameraViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.cameraViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
