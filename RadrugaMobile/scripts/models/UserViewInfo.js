define(["require", "exports", "../game/LevelMap"], function (require, exports, levelMap) {
    "use strict";
    var UserViewInfo = (function () {
        function UserViewInfo() {
        }
        UserViewInfo.getFromWsData = function (wsUser) {
            var userViewInfo = new UserViewInfo();
            userViewInfo.id = wsUser.Id;
            userViewInfo.kindScale = wsUser.KindScale;
            userViewInfo.level = wsUser.Level;
            userViewInfo.levelPoints = wsUser.LevelPoints;
            UserViewInfo.getLevelPercentage(userViewInfo);
            userViewInfo.nickName = wsUser.NickName;
            userViewInfo.radrugaColor = wsUser.RadrugaColor;
            userViewInfo.maxLevelPoints = levelMap.LevelMap.getMaxLevelPoints(userViewInfo.level);
            userViewInfo.completedMissionIdsCount = wsUser.CompletedMissionIdsCount;
            userViewInfo.failedMissionIdsCount = wsUser.FailedMissionIdsCount;
            userViewInfo.cityShortName = wsUser.CityShortName;
            userViewInfo.countryShortName = wsUser.CountryShortName;
            userViewInfo.threeFiveStarsBadge = wsUser.ThreeFiveStarsBadge;
            userViewInfo.fiveSetsBadge = wsUser.FiveSetsBadge;
            userViewInfo.kindScaleBadge = wsUser.KindScaleBadge;
            userViewInfo.fiveRepostsBadge = wsUser.FiveRepostsBadge;
            userViewInfo.ratingGrowthBadge = wsUser.RatingGrowthBadge;
            userViewInfo.globalRank = wsUser.GlobalRank;
            userViewInfo.countryRank = wsUser.CountryRank;
            userViewInfo.cityRank = wsUser.CityRank;
            userViewInfo.kindActionsCount = wsUser.KindActionsCount;
            userViewInfo.kindActionMarksCount = wsUser.KindActionMarksCount;
            return userViewInfo;
        };
        UserViewInfo.getLevelPercentage = function (user) {
            var maxLevelPoints = levelMap.LevelMap.getMaxLevelPoints(user.level);
            user.levelPercentage = user.levelPoints / maxLevelPoints * 100;
        };
        return UserViewInfo;
    }());
    exports.UserViewInfo = UserViewInfo;
});
