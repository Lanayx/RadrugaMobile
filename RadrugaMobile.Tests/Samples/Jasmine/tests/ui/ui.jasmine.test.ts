/// <reference path="../../../../../RadrugaMobile/scripts/tsDefinitions/require.d.ts" />
/// <reference path="../../../../scripts/definitions/jasmine.d.ts" />
define(['ui/screen'],
    function (screen) {
        describe("ui/screen", function () {
            it("will build display version", function () {
                var disp = screen.displayVersion;
                expect(disp).toEqual("Version: 8");
            });
        });
    });

//define(['ui/screen'],
//    function (screen) {
//        describe("ui/screen", function () {
//            it("will build display version", function () {
//                var disp = screen.displayVersion;
//                expect(disp).toEqual("Version: 8");
//            });
//        });
//    });

