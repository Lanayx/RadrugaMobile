/// <reference path="../scripts/definitions/jasmine.d.ts" />


define(['../../RadrugaMobile/scripts/Authorization'], (auth) => {


    describe("auth login", () => {

        beforeEach(() => {
            jasmine.Ajax.install();
        });

        afterEach(() => {
            jasmine.Ajax.uninstall();
        });


        it("right password", () => {

            var onSuccess = jasmine.createSpy('onSuccess');
            var onFailure = jasmine.createSpy('onFailure');

            //Assign
            var login = "Login", password = "Password";

            //Act
            auth.login(login, password, {
                success: () => {
                    onSuccess();
                },
                fail: () => {
                    onFailure();
                }
            });

            var request = jasmine.Ajax.requests.mostRecent();
            request.response({
                "status": 200,
                "contentType": 'application/json;charset=UTF-8',
                "responseText":
                /* tslint:disable */
                    '{"access_token":"nrduXqe7nwN0V6LPHQvDKn-haXm9SA39jWlw6SxJYflYjQAXogcqz_9fcKkZhztHHqEMjgotvwLcPSU1JlbSh-3DggP5SzJ94iJZ16y-5bWrRA2YdFZw-LI6QQsVhueDHFBHaVOl_nvsPOaTsdYUVwoG1UJE9rp3RcKFw1qv9vey8dylyGkYmXtlPIRuKwZVxXoqIm3xoAAn-wIhqnk7ZpmJkw_bi2dxeeFT-kN97yh4vs_j11Vh_C_4eyzppPFrVBTefnHdASEFI3yokR41brQFEVxBPhq1XBuioymwDD-rt5wOBQKkOfyXQsAMZrAt",' +
                /* tslint:enable */
                    '"token_type":"bearer","expires_in":86399}'
            });

            //Assert
            expect(onSuccess).toHaveBeenCalled();
        });

        it("wrong password", () => {

            var onSuccess = jasmine.createSpy('onSuccess');
            var onFailure = jasmine.createSpy('onFailure');

            //Assign
            var login = "Login", password = "WrongPassword";

            //Act
            auth.login(login, password, {
                success: () => {
                    onSuccess();
                },
                fail: () => {
                    onFailure();
                }
            });

            var request = jasmine.Ajax.requests.mostRecent();
            request.response({
                "status": 400,
                "contentType": 'application/x-www-form-urlencoded; charset=UTF-8',
                "responseText": '{"error":"invalid_grant"}'
            });

            //Assert
            expect(onFailure).toHaveBeenCalled();
        });
    });
});
