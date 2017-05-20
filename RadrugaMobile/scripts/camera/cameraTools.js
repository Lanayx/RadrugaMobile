define(["require", "exports", "../camera/Image"], function (require, exports, proxyImage) {
    "use strict";
    function takePicture(sourceType) {
        var deferred = $.Deferred();
        navigator.camera.getPicture(function (tempUrl) {
            var gottenImage = new proxyImage.Image(tempUrl);
            deferred.resolve(gottenImage);
        }, function (message) {
            deferred.reject(message);
        }, {
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
    function takePhoto() {
        return takePicture(Camera.PictureSourceType.CAMERA);
    }
    exports.takePhoto = takePhoto;
    function getPicture() {
        return takePicture(Camera.PictureSourceType.SAVEDPHOTOALBUM);
    }
    exports.getPicture = getPicture;
});
