define(["require", "exports"], function (require, exports) {
    "use strict";
    var Image = (function () {
        function Image(localUrl, description, geoTag) {
            this.localUrl = localUrl;
            this.description = description || "";
            this.geoTag = geoTag || null;
        }
        return Image;
    }());
    exports.Image = Image;
});
