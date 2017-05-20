define(["require", "exports"], function (require, exports) {
    "use strict";
    var PermanentStorage = (function () {
        function PermanentStorage() {
        }
        PermanentStorage.set = function (key, value) {
            localStorage.setItem(key, value);
        };
        PermanentStorage.get = function (key) {
            return localStorage.getItem(key);
        };
        PermanentStorage.remove = function (key) {
            localStorage.removeItem(key);
        };
        PermanentStorage.clear = function () {
            localStorage.clear();
        };
        return PermanentStorage;
    }());
    exports.PermanentStorage = PermanentStorage;
});
