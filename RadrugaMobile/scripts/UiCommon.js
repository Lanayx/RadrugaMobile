define(["require", "exports"], function (require, exports) {
    "use strict";
    function displayDifficulty(jqueryContext) {
        $(".missionDifficulty", $(jqueryContext)).each(function (index, elem) {
            var difficulty = +$(elem).attr("data-difficulty");
            $(elem).children(".star").each(function (iconIndex, iconElem) {
                var iconIndexReal = iconIndex + 1;
                var halfOfDiffuclty = difficulty / 2;
                if (iconIndexReal <= halfOfDiffuclty) {
                    $(iconElem).removeClass("starHalf").removeClass("starEmpty").addClass("starFull");
                }
                else if (iconIndexReal - halfOfDiffuclty < 0.9) {
                    $(iconElem).removeClass("starFull").removeClass("starEmpty").addClass("starHalf");
                }
                else {
                    $(iconElem).removeClass("starFull").removeClass("starHalf").addClass("starEmpty");
                }
            });
        });
    }
    exports.displayDifficulty = displayDifficulty;
});
