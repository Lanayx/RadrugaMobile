define(["../../RadrugaMobile/scripts/geoLocation/GeoCoordinate", "../../RadrugaMobile/scripts/geoLocation/GeoTools"], function (coord, geoTools) {
    describe("distance test", function () {
        beforeEach(function () {
            navigator.geolocation = navigator.geolocation || {
                clearWatch: function (watchId) { },
                getCurrentPosition: function (successCallback, errorCallback, options) { },
                watchPosition: function (successCallback, errorCallback, options) { return 0; }
            };
        });
        describe("calculate distance on west", function () {
            var distance;
            beforeEach(function (done) {
                var homeCoord = new coord.GeoCoordinate();
                homeCoord.latitude = 53.922824;
                homeCoord.longitude = 27.634876;
                var shopCoord = new coord.GeoCoordinate();
                shopCoord.latitude = 53.923166;
                shopCoord.longitude = 27.637144;
                geoTools.getDistanceInDirection(homeCoord, shopCoord, 1).then(function (dist) {
                    distance = dist;
                    done();
                });
            });
            it("calculates right", function () {
                expect(distance).toBe(150);
            });
        });
        describe("calculate distance on east", function () {
            var distance;
            beforeEach(function (done) {
                var homeCoord = new coord.GeoCoordinate();
                homeCoord.latitude = 53.922824;
                homeCoord.longitude = 27.634876;
                var shopCoord = new coord.GeoCoordinate();
                shopCoord.latitude = 53.923166;
                shopCoord.longitude = 27.637144;
                geoTools.getDistanceInDirection(homeCoord, shopCoord, 0).then(function (dist) {
                    distance = dist;
                    done();
                });
            });
            it("calculates right", function () {
                expect(distance).toBe(-150);
            });
        });
    });
});
