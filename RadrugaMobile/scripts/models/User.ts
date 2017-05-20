import interfaces = require("WsInterfaces");
import coord = require("../geoLocation/GeoCoordinate");
import storage = require("../Storage");
import auth = require("../Authorization");
import vkManager = require("../VkManager");
import levelMap = require("../game/LevelMap");
import appTools = require("../../scripts/ApplicationTools");
import serviceApi = require("../../scripts/ServiceApi");

export class User {
    id: string;
    avatarUrl: string;
    dateOfBirth: Date;
    enablePushNotifications: boolean;
    kindScale: number;
    level: number;
    levelPercentage: number;
    nickName: string;
    levelPoints: number;
    coinsCount: number;
    sex:number;
    radrugaColor: string;
    maxLevelPoints: number;

    //coordinates
    homeCoordinate: coord.GeoCoordinate;
    radarCoordinate: coord.GeoCoordinate;
    outpostCoordinate: coord.GeoCoordinate;
    baseNorthCoordinate: coord.GeoCoordinate;
    baseEastCoordinate: coord.GeoCoordinate;
    baseSouthCoordinate: coord.GeoCoordinate;
    baseWestCoordinate: coord.GeoCoordinate;


    private fillCoordinates(wsUser: interfaces.IWsUser) {
        if (wsUser.HomeCoordinate)
            this.homeCoordinate = coord.GeoCoordinate.getFromWsData(wsUser.HomeCoordinate);
        if (wsUser.BaseNorthCoordinate)
            this.baseNorthCoordinate = coord.GeoCoordinate.getFromWsData(wsUser.BaseNorthCoordinate);
        if (wsUser.BaseEastCoordinate)
            this.baseEastCoordinate = coord.GeoCoordinate.getFromWsData(wsUser.BaseEastCoordinate);
        if (wsUser.BaseSouthCoordinate)
            this.baseSouthCoordinate = coord.GeoCoordinate.getFromWsData(wsUser.BaseSouthCoordinate);
        if (wsUser.BaseWestCoordinate)
            this.baseWestCoordinate = coord.GeoCoordinate.getFromWsData(wsUser.BaseWestCoordinate);
        if (wsUser.OutpostCoordinate)
            this.outpostCoordinate = coord.GeoCoordinate.getFromWsData(wsUser.OutpostCoordinate);
        if (wsUser.RadarCoordinate)
            this.radarCoordinate = coord.GeoCoordinate.getFromWsData(wsUser.RadarCoordinate);
    }

    public static getFromApi(): JQueryPromise<User> {
        var def = $.Deferred();
        var api = new serviceApi.ServiceApi();
        appTools.getKendoApplication().showLoading();
        api.callService({
            method: "user",
            requestType: "GET"
        }).done((profileData) => {
            if (!profileData) {
                appTools.logError("User is empty on profile");
                def.reject();
                return;
            }
            var user = User.getFromWsData(profileData);
            User.saveToStorage(user);
            User.setLastRefreshDate();
            def.resolve(user);

        }).fail(() => {
            def.reject();
        });
        return def.promise();
    }

    private static getFromWsData(wsUser: interfaces.IWsUser): User {
        var user = new User();
        user.id = wsUser.Id;
        user.avatarUrl = wsUser.AvatarUrl;
        user.dateOfBirth = wsUser.DateOfBirth;
        user.enablePushNotifications = wsUser.EnablePushNotifications;
        
        user.kindScale = wsUser.KindScale;
        user.level = wsUser.Level;
        user.levelPoints = wsUser.LevelPoints;
        User.getLevelPercentage(user);
        user.nickName = wsUser.NickName;
        user.sex = wsUser.Sex;
        user.radrugaColor = wsUser.RadrugaColor;
        user.coinsCount = wsUser.CoinsCount;
        user.maxLevelPoints = levelMap.LevelMap.getMaxLevelPoints(user.level);

        user.fillCoordinates(wsUser);

        if (wsUser.HasEmail)
            auth.setHasEmail();
        if (wsUser.HasVk)
            vkManager.Fields.setHasVk();
        return user;
    }

    private static getLevelPercentage(user:User) {
        var maxLevelPoints = levelMap.LevelMap.getMaxLevelPoints(user.level);
        user.levelPercentage = user.levelPoints / maxLevelPoints * 100;
    }

    public static updateLevelPoints(points: number) {
        var user = User.getFromStorage();
        var newPoints = user.levelPoints + points;
        var poinstDifference = newPoints - user.maxLevelPoints;
        if (poinstDifference < 0) {
            user.levelPoints = newPoints;
            User.getLevelPercentage(user);
        } else {
            user.levelPoints = poinstDifference;
            user.level++;
            user.maxLevelPoints = levelMap.LevelMap.getMaxLevelPoints(user.level);
            User.getLevelPercentage(user);
        }
        User.saveToStorage(user);
    }   

    public static incrementPassedMissions(incrementCount?:number):number {
        var currentCount = (+storage.PermanentStorage.get("MissionsPassedCount")) || 0;
        currentCount = currentCount + (incrementCount || 1);
        storage.PermanentStorage.set("MissionsPassedCount", JSON.stringify(currentCount));
        return currentCount;
    }


    public static getFromStorage(): User {
        return JSON.parse(storage.PermanentStorage.get("UserInfo") || null);
    }

    public static saveToStorage(value: User) {
        if (value !== null) {
            storage.PermanentStorage.set("UserInfo", JSON.stringify(value));
            storage.PermanentStorage.set("UserId", value.id);
        }
    }

    public static forceRefresh() {
        storage.PermanentStorage.set("UserInfoDate", null);
    }

    public static refreshIsNeeded(): boolean {
        var date : string = JSON.parse(storage.PermanentStorage.get("UserInfoDate") || null);
        if (date) {
            var d = new Date(date);
            var refreshDate = new Date(d.setDate(d.getDate() + 1));//refresh once a day
            return (new Date()) > refreshDate;
        }
        return true;
    }

    public static setLastRefreshDate() {
        storage.PermanentStorage.set("UserInfoDate", JSON.stringify(new Date()));
    }
}