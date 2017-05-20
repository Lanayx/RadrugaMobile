define(['../../RadrugaMobile/scripts/Authorization'], function (auth) {
    describe("auth login", function () {
        beforeEach(function () {
            jasmine.Ajax.install();
        });
        afterEach(function () {
            jasmine.Ajax.uninstall();
        });
        it("right password", function () {
            var onSuccess = jasmine.createSpy('onSuccess');
            var onFailure = jasmine.createSpy('onFailure');
            var login = "Login", password = "Password";
            auth.login(login, password, {
                success: function () {
                    onSuccess();
                },
                fail: function () {
                    onFailure();
                }
            });
            var request = jasmine.Ajax.requests.mostRecent();
            request.response({
                "status": 200,
                "contentType": 'application/json;charset=UTF-8',
                "responseText": '{"access_token":"nrduXqe7nwN0V6LPHQvDKn-haXm9SA39jWlw6SxJYflYjQAXogcqz_9fcKkZhztHHqEMjgotvwLcPSU1JlbSh-3DggP5SzJ94iJZ16y-5bWrRA2YdFZw-LI6QQsVhueDHFBHaVOl_nvsPOaTsdYUVwoG1UJE9rp3RcKFw1qv9vey8dylyGkYmXtlPIRuKwZVxXoqIm3xoAAn-wIhqnk7ZpmJkw_bi2dxeeFT-kN97yh4vs_j11Vh_C_4eyzppPFrVBTefnHdASEFI3yokR41brQFEVxBPhq1XBuioymwDD-rt5wOBQKkOfyXQsAMZrAt",' +
                    '"token_type":"bearer","expires_in":86399}'
            });
            expect(onSuccess).toHaveBeenCalled();
        });
        it("wrong password", function () {
            var onSuccess = jasmine.createSpy('onSuccess');
            var onFailure = jasmine.createSpy('onFailure');
            var login = "Login", password = "WrongPassword";
            auth.login(login, password, {
                success: function () {
                    onSuccess();
                },
                fail: function () {
                    onFailure();
                }
            });
            var request = jasmine.Ajax.requests.mostRecent();
            request.response({
                "status": 400,
                "contentType": 'application/x-www-form-urlencoded; charset=UTF-8',
                "responseText": '{"error":"invalid_grant"}'
            });
            expect(onFailure).toHaveBeenCalled();
        });
    });
});
