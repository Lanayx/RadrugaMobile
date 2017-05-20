export function getGuid(): any {
    return b();
}
/* tslint:disable */
function b(a?) { return a ? (a ^ Math.random() * 16 >> a / 4).toString(16):(''+1e7+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, b); }
/* tslint:enable */

export function getParametersString(parametersObject): any {
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


export function getUrlParameters(urlParams: string): any {
    var parameterArray = urlParams.split("&");
    var x = {};

    for (var i = 0; i < parameterArray.length; i++) {
        var parameterAndValue = parameterArray[i].split("=");
        x[parameterAndValue[0]] = decodeURIComponent(parameterAndValue[1]);
    }
    return x;

}

var loadedViewsCss = [];
export function loadCss(url: string): void {
    if (loadedViewsCss.indexOf(url) < 0) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
        loadedViewsCss.push(url);
    }

}


export function validateEmail(email: string) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

export function validatePassword(password: string) {
    return password.length >= 6;
}

export function getContrastColor(backgroundColor) {
    var r = parseInt(backgroundColor.substr(0, 2), 16);
    var g = parseInt(backgroundColor.substr(2, 2), 16);
    var b = parseInt(backgroundColor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq > 125) ? 'black' : 'white';
}