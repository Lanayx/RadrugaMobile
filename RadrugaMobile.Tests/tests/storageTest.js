define(['../../RadrugaMobile/scripts/storage'], function (storage) {
    describe("first test", function () {
        it("can do", function () {
            var num = "1";
            storage.PermanentStorage.set("key", num);
            expect(storage.PermanentStorage.get("key")).toBe(num);
        });
    });
});
