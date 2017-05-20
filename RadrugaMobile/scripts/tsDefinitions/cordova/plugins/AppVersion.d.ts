// Type definitions for cordova-plugin-app-version v0.1.7
// Project: https://github.com/whiteoctober/cordova-plugin-app-version
// Definitions by: Markus Wagner <https://github.com/Ritzlgrmft/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped


interface Cordova {
    getAppVersion: {
        getAppName: () => JQueryPromise<string>;
        getPackageName: () => JQueryPromise<string>;
        getVersionCode: () =>  JQueryPromise<string>;
        getVersionNumber: () => JQueryPromise<string>;
    };
}