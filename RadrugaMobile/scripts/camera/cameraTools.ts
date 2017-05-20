import proxyImage = require("../camera/Image");


function takePicture(sourceType): JQueryPromise<proxyImage.Image> {
    var deferred = $.Deferred();

    navigator.camera.getPicture((tempUrl: string) => {
        var gottenImage = new proxyImage.Image(tempUrl);
        deferred.resolve(gottenImage);
    },
        (message) => {
            deferred.reject(message);
        },
        {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: sourceType,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            targetHeight: 500,
            targetWidth: 500,
            correctOrientation: true,
            saveToPhotoAlbum: false //neeeded for old androids
        });
    return deferred;
}


export function takePhoto(): JQueryPromise<proxyImage.Image> {
    return takePicture(Camera.PictureSourceType.CAMERA);
}

export function getPicture(): JQueryPromise<proxyImage.Image> {
    return takePicture(Camera.PictureSourceType.SAVEDPHOTOALBUM);
}