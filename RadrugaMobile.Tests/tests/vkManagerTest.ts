/// <reference path="../scripts/definitions/jasmine.d.ts" />


define(['../../RadrugaMobile/scripts/VkManager'], (vk) => {

    describe("vk api", () => {

        beforeEach(() => {
            jasmine.Ajax.install();
        });

        afterEach(() => {
            jasmine.Ajax.uninstall();
        });

        it("passed", () => {

            var onSuccess = jasmine.createSpy('onSuccess');
            var onFailure = jasmine.createSpy('onFailure');


            var api = new vk.VkApi();
            api.getProfileInfo((profileResult) => {
                if (profileResult.success)
                    onSuccess();
                else
                    onFailure();
            });
            var request = jasmine.Ajax.requests.mostRecent();
            request.response({
                "status": 200,
                "contentType": 'application/json; charset=utf-8 ',
                "responseText":
                '{ "response": [{ "id": 6243431, "first_name": "Владимир", "last_name": "Щур", "sex": 2, "nickname": "Odin",' +
                    ' "screen_name": "odin_cool", "bdate": "13.3.1989", ' + ' "city": { "id": 282, "title": "Менск" },' +
                    ' "country": { "id": 3, "title": "Беларусь" }, "timezone": 2, ' +
                /* tslint:disable */
                    ' "counters": { "albums": 5, "videos": 7, "audios": 299, "notes": 6, "photos": 192, "groups": 159, "friends": 377, "online_friends": 58, "user_photos": 69, "user_videos": 5, "followers": 51, "subscriptions": 1, "pages": 20 },' +
                /* tslint:enable */
                     ' "university": 1066, "university_name": "БГУ", "faculty": 4802, "faculty_name": "RFE", ' +
                    ' "graduation": 2011, "education_form": "Дзённае аддзяленьне", "education_status": "Студэнт (спэцыяліст)" }] }'
            });

            //Assert
            expect(onSuccess).toHaveBeenCalled();
        });


        it("failed", () => {

            var onSuccess = jasmine.createSpy('onSuccess');
            var onFailure = jasmine.createSpy('onFailure');


            var api = new vk.VkApi();
            api.getProfileInfo((profileResult) => {
                if (profileResult.success)
                    onSuccess();
                else
                    onFailure();
            });
            var request = jasmine.Ajax.requests.mostRecent();
            request.response({
                "status": 200,
                "contentType": 'application/json; charset=utf-8 ',
                "responseText": '{"error":{"error_code":10,"error_msg":"Internal server error: could not get application",' +
                    '"request_params":[{"key":"oauth","value":"1"},{"key":"method","value":"users.get"},' +
                    '{"key":"fields","value":"nickname,sex,bdate,city,country,education,timezone,screen_name,counters"},' +
                    '{"key":"v","value":"5.23"},' +
                /* tslint:disable */
                    '{"key":"access_token","value":"98ba2b23068a7871697040b4c88351b26d4aaaa22e72c92967dc9e0a9521660bff5837b5a7764d5213de"}]}}'
                /* tslint:enable */
            });

            //Assert
            expect(onFailure).toHaveBeenCalled();
        });


    });
});