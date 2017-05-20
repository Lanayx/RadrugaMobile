import interfaces = require("WsInterfaces");
import levelMap = require("../game/LevelMap");
import storage = require("../Storage");

export class UserViewInfo {
    id: string;
    kindScale: number;
    level: number;
    nickName: string;
    levelPoints: number;
    levelPercentage: number;
    maxLevelPoints: number;
    radrugaColor: string;

    completedMissionIdsCount: number;
    failedMissionIdsCount: number;
    cityShortName: string;
    countryShortName: string;

    threeFiveStarsBadge: boolean;
    fiveSetsBadge: boolean;
    kindScaleBadge: boolean;
    fiveRepostsBadge: boolean;
    ratingGrowthBadge: boolean;
    globalRank: number;
    countryRank: number;
    cityRank: number;
    kindActionsCount: number;
    kindActionMarksCount: number;

    public static getFromWsData(wsUser: interfaces.IWsUserViewInfo): UserViewInfo {
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
    }


    private static getLevelPercentage(user: UserViewInfo) {
        var maxLevelPoints = levelMap.LevelMap.getMaxLevelPoints(user.level);
        user.levelPercentage = user.levelPoints / maxLevelPoints * 100;
    }
}