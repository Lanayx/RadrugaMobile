import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import cameraTools = require("../../../scripts/camera/cameraTools");
import proxyImage = require("../../../scripts/camera/Image");
import enums = require("../../../scripts/Enums");
import miss = require("../../../scripts/models/Mission");
import storage = require("../../../scripts/Storage");
import serviceApi = require("../../../scripts/ServiceApi");

var addPhotoUrl = "styles/svg/addPhoto.svg";

export interface ICameraImage {
    imageUrl: string;
    canBeRemoved: boolean;
    isAddButton?: boolean;
}

export class CameraViewModel extends kendo.data.ObservableObject {
    photosDataSource: ICameraImage[] = [];


    missionImagePath = "";
    noPhotos = true;

    private _missionId = "";
    private _numberOfPhotos = 0;

    //labels below
    sendForApprovalButton = appTools.getText("slnSendForApproval");
    cancelButton = appTools.getText("cmCancel");

    private _processStarted = false;

    constructor() {
        super();
        super.init(this);

    }

    onCancel() {
        backButtonCallback();
    }

    takePicture() {
        cameraTools.takePhoto().done((image: proxyImage.Image) => {
            if (this.photosDataSource.length > 1) //remove AddButton
                this.photosDataSource.pop();
            this.photosDataSource.push({ imageUrl: image.localUrl, canBeRemoved: true });
            this.set("noPhotos", false);
            if (this.photosDataSource.length > 0 && this.photosDataSource.length < this._numberOfPhotos)
                this.photosDataSource.push({ imageUrl: addPhotoUrl, canBeRemoved: false, isAddButton: true }); //add AddButton
            this.storeTempPhotos();
        }).fail((message: any) => {
            navigator.notification.alert(message,
                () => { }, appTools.getText("cameraErrorTitle"), "OK");
        });
    }

    onRemovePhoto(event: Event) {
        var photoUrl = $(event.currentTarget).attr("data-url");
        for (let i = 0; i < this.photosDataSource.length; i++)
            if (this.photosDataSource[i].imageUrl === photoUrl) {
                this.photosDataSource.splice(i, 1);
                break;
            }
        if (this.photosDataSource.length === 1) //remove last photo
            if (this.photosDataSource[0].imageUrl === addPhotoUrl)
                this.photosDataSource.pop();
        if (this.photosDataSource.length > 0 && this.photosDataSource[this.photosDataSource.length - 1].imageUrl !== addPhotoUrl) //add AddButton
            this.photosDataSource.push({ imageUrl: addPhotoUrl, canBeRemoved: false, isAddButton: true });

        this.set("noPhotos", !this.photosDataSource[0]);
        this.storeTempPhotos();
    }

    onApproveSend() {
        if (this.photosDataSource.length !== this._numberOfPhotos || this.photosDataSource[this.photosDataSource.length - 1].imageUrl === addPhotoUrl)
            return;

        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;

        if (this.photosDataSource.length === 1) {
            this.sendOnePhotoApprove();
        } else {
            this.sendMultiPhotoApprove();
        }
    }

    onBinded() {
        var model: miss.Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
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
    }

    private sendOnePhotoApprove() {
        var api = new serviceApi.ServiceApi();
        api.uploadFile({
            filePath: navigator.simulator ? "test.jpg" : this.photosDataSource[0].imageUrl,
            method: "mission/CompleteOnePhotoMission",
            fileName: "mission.jpg",
            params: {
                MissionId: this._missionId
            }
        }).done((result) => {
            var jsonResult = JSON.parse(result.response);
            if (jsonResult.Status === 0 && jsonResult.MissionCompletionStatus === enums.MissionCompletionStatus.Waiting) {
                navigation.navigateToWaitView(enums.Direction.right, {
                    imageUrl: this.get("missionImagePath"),
                    missionId: this._missionId
                });
            }
            else
                navigator.notification.alert(jsonResult.Description,
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        });
    }

    private sendMultiPhotoApprove() {
        var api = new serviceApi.ServiceApi();
        this.sendImagesToServer(api)
            .then<any>((...args) => {
                var arrayUrls = args.length === 1 ? args[0] : $.makeArray(args);//for windows phone we already have an array, for others we should have multiple results
                var proof = {
                    ImageUrls: arrayUrls.map(result => {
                        return JSON.parse(result.response);
                    })
                };
                return api.callService({
                    method: `mission/CompleteMission?missionId=${this._missionId}`,
                    requestType: "POST",
                    data: JSON.stringify(proof)
                });
            }).done((result) => {
                if (result.Status === 0 && result.MissionCompletionStatus === enums.MissionCompletionStatus.Waiting) {
                    navigation.navigateToWaitView(enums.Direction.right, {
                        imageUrl: this.get("missionImagePath"),
                        missionId: this._missionId
                    });
                } else
                    navigator.notification.alert(result.Description,
                        () => { }, appTools.getText("cmApiErrorTitle"), "OK");
                this._processStarted = false;
            }).fail((error) => {
                alert(JSON.stringify(error));
                navigator.notification.alert(appTools.getText("cmApiError"),
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
                this._processStarted = false;
            });
    }

    private sendImagesToServer(api: serviceApi.ServiceApi): JQueryPromise<any> {
        if (device.platform !== "Win32NT") {
            var uploadFilesTasks = this.photosDataSource.map((image, index) => {
                return this.uploadImage(api, image.imageUrl);
            });
            return $.when.apply(this, uploadFilesTasks);
        } else {
            var length = this.photosDataSource.length;
            var results = [];
            var task = this.uploadImage(api, this.photosDataSource[0].imageUrl);
            var deferred = $.Deferred();
            for (let i = 1; i < length; i++) {
                (image => {
                    task = task.then<any>((result) => {
                        results.push(result);
                        return this.uploadImage(api, image.imageUrl);
                    });
                })(this.photosDataSource[i]);
            }
            task.done((result) => {
                results.push(result);
                deferred.resolve(results);
            }).fail((error) => {
                deferred.reject(error);
            });

            return deferred.promise();
        }
       
    }

    private uploadImage(api: serviceApi.ServiceApi, imageUrl: string): JQueryPromise<FileUploadResult> {
        return api.uploadFile({
            filePath: navigator.simulator ? "test.jpg" : imageUrl,
            method: "mission/AddProofImage",
            fileName: this._missionId + ".jpg"
        });
    }

    private storeTempPhotos() {
        miss.Mission.setCurrentMissionTempPhotoUrls(JSON.stringify(this.photosDataSource));
    }
}

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
app.appInit.cameraViewModelInit = () => {
    bindModel();
};

app.appInit.cameraViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.cameraViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};