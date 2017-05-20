/// <reference path="tsDefinitions/require.d.ts" />
require.config({
    baseUrl: "scripts",
    paths: {
        'jquery': '../kendo/js/jquery.min',
        'kendo.mobile.min': '../kendo/js/kendo.mobile.min',
        'imgcache': "libs/imgcache",
        'geolib': "libs/geolib",
        'fastclick': "libs/fastclick",
        'mobiscroll': "libs/mobiscroll.custom",
        'cryptojs': "libs/CryptoJS"
    },
    shim: {
        "mobiscroll": {
            "deps": ["jquery"],
            "exports": "Mobiscroll"
        }
    }
});
require(["jquery", "kendo.mobile.min", "fastclick", "Main"], function (j, k, f, main) {
    f.attach(document.body);
    main.initialize();
});
