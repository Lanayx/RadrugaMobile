/// <reference path="tsDefinitions/require.d.ts" />
require.config({
    baseUrl: "scripts",
    paths: {
        'jquery': '../kendo/js/jquery.min',
        'kendo': '../kendo/js/kendo.mobile.min',
        'imgcache': "libs/imgcache",
        'geolib': "libs/geolib"
    }
});

require(["jquery", "kendo", "Main"], function (j, k, main) {
    main.initialize();
});
//# sourceMappingURL=startup.js.map
