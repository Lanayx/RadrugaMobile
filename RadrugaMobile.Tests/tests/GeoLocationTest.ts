/// <reference path="../scripts/definitions/jasmine.d.ts" />

define(["../../RadrugaMobile/scripts/geoLocation/GeoCoordinate", "../../RadrugaMobile/scripts/geoLocation/GeoTools"],
    (coord, geoTools) => {

    describe("distance test", () => {

        beforeEach(() => {
            //stub for geolocation
            navigator.geolocation = navigator.geolocation || {
                clearWatch: (watchId: number) => { },
                getCurrentPosition: (successCallback: PositionCallback,
                    errorCallback?: PositionErrorCallback, options?: PositionOptions) => { },
                watchPosition: (successCallback: PositionCallback,
                    errorCallback?: PositionErrorCallback, options?: PositionOptions) => { return 0; }
            };
        });

        describe("calculate distance on west", () => {
            var distance;
            beforeEach((done) => {
                var homeCoord = new coord.GeoCoordinate();
                homeCoord.latitude = 53.922824;
                homeCoord.longitude = 27.634876;

                var shopCoord = new coord.GeoCoordinate();
                shopCoord.latitude = 53.923166;
                shopCoord.longitude = 27.637144;

                geoTools.getDistanceInDirection(homeCoord, shopCoord, 1).then((dist) => {
                    distance = dist;
                    done();
                });
            });

            it("calculates right", () => {
                expect(distance).toBe(150);
            });
        });

        describe("calculate distance on east", () => {
            var distance;
            beforeEach((done) => {
                var homeCoord = new coord.GeoCoordinate();
                homeCoord.latitude = 53.922824;
                homeCoord.longitude = 27.634876;

                var shopCoord = new coord.GeoCoordinate();
                shopCoord.latitude = 53.923166;
                shopCoord.longitude = 27.637144;

                geoTools.getDistanceInDirection(homeCoord,shopCoord,0).then((dist) => {
                    distance = dist;
                    done();
                });
            });

            it("calculates right", () => {
                expect(distance).toBe(-150);
            });
        });
    });
});

