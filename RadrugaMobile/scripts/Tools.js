define(["require", "exports"], function (require, exports) {
    "use strict";
    function getGuid() {
        return b();
    }
    exports.getGuid = getGuid;
    function b(a) { return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b); }
    function getParametersString(parametersObject) {
        var result = "";
        for (var property in parametersObject) {
            if (parametersObject.hasOwnProperty(property)) {
                result += property + "=" + parametersObject[property] + "&";
            }
        }
        if (result.length > 0) {
            result = result.substr(0, result.length - 1);
        }
        return result;
    }
    exports.getParametersString = getParametersString;
    function getUrlParameters(urlParams) {
        var parameterArray = urlParams.split("&");
        var x = {};
        for (var i = 0; i < parameterArray.length; i++) {
            var parameterAndValue = parameterArray[i].split("=");
            x[parameterAndValue[0]] = decodeURIComponent(parameterAndValue[1]);
        }
        return x;
    }
    exports.getUrlParameters = getUrlParameters;
    var loadedViewsCss = [];
    function loadCss(url) {
        if (loadedViewsCss.indexOf(url) < 0) {
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = url;
            document.getElementsByTagName("head")[0].appendChild(link);
            loadedViewsCss.push(url);
        }
    }
    exports.loadCss = loadCss;
    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    exports.validateEmail = validateEmail;
    function validatePassword(password) {
        return password.length >= 6;
    }
    exports.validatePassword = validatePassword;
    function getContrastColor(backgroundColor) {
        var r = parseInt(backgroundColor.substr(0, 2), 16);
        var g = parseInt(backgroundColor.substr(2, 2), 16);
        var b = parseInt(backgroundColor.substr(4, 2), 16);
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq > 125) ? 'black' : 'white';
    }
    exports.getContrastColor = getContrastColor;
});
