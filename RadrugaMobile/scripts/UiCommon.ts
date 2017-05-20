export  function  displayDifficulty(jqueryContext:string) : void {
    $(".missionDifficulty", $(jqueryContext)).each((index, elem) => {
        var difficulty = +$(elem).attr("data-difficulty");
        $(elem).children(".star").each((iconIndex, iconElem) => {
            var iconIndexReal = iconIndex + 1;
            var halfOfDiffuclty = difficulty / 2;
            if (iconIndexReal <= halfOfDiffuclty) {
                $(iconElem).removeClass("starHalf").removeClass("starEmpty").addClass("starFull");
            } else if (iconIndexReal - halfOfDiffuclty < 0.9) {
                $(iconElem).removeClass("starFull").removeClass("starEmpty").addClass("starHalf");
            } else {
                $(iconElem).removeClass("starFull").removeClass("starHalf").addClass("starEmpty");
            }
        });
    });
}
