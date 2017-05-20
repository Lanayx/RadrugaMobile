/// <reference path="../scripts/definitions/jasmine.d.ts" />

define(['../../RadrugaMobile/scripts/storage'], (storage) => {

    describe("first test", () => {
        it("can do", () => {
            //Arrange
            var num = "1";
            //Act
            storage.PermanentStorage.set("key", num);
            //Assert
            expect(storage.PermanentStorage.get("key")).toBe(num);

        });
    });
});