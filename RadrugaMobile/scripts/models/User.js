define(["require", "exports", "../geoLocation/GeoCoordinate", "../Storage", "../Authorization", "../VkManager", "../game/LevelMap", "../../scripts/ApplicationTools", "../../scripts/ServiceApi"], function (require, exports, coord, storage, auth, vkManager, levelMap, appTools, serviceApi) {
    "use strict";
    var User = (function () {
        function User() {
        }
        User.prototype.fillCoordinates = function (wsUser) {
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
        };
        User.getFromApi = function () {
            var def = $.Deferred();
            var api = new serviceApi.ServiceApi();
            appTools.getKendoApplication().showLoading();
            api.callService({
                method: "user",
                requestType: "GET"
            }).done(function (profileData) {
                if (!profileData) {
                    appTools.logError("User is empty on profile");
                    def.reject();
                    return;
                }
                var user = User.getFromWsData(profileData);
                User.saveToStorage(user);
                User.setLastRefreshDate();
                def.resolve(user);
            }).fail(function () {
                def.reject();
            });
            return def.promise();
        };
        User.getFromWsData = function (wsUser) {
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
        };
        User.getLevelPercentage = function (user) {
            var maxLevelPoints = levelMap.LevelMap.getMaxLevelPoints(user.level);
            user.levelPercentage = user.levelPoints / maxLevelPoints * 100;
        };
        User.updateLevelPoints = function (points) {
            var user = User.getFromStorage();
            var newPoints = user.levelPoints + points;
            var poinstDifference = newPoints - user.maxLevelPoints;
            if (poinstDifference < 0) {
                user.levelPoints = newPoints;
                User.getLevelPercentage(user);
            }
            else {
                user.levelPoints = poinstDifference;
                user.level++;
                user.maxLevelPoints = levelMap.LevelMap.getMaxLevelPoints(user.level);
                User.getLevelPercentage(user);
            }
            User.saveToStorage(user);
        };
        User.incrementPassedMissions = function (incrementCount) {
            var currentCount = (+storage.PermanentStorage.get("MissionsPassedCount")) || 0;
            currentCount = currentCount + (incrementCount || 1);
            storage.PermanentStorage.set("MissionsPassedCount", JSON.stringify(currentCount));
            return currentCount;
        };
        User.getFromStorage = function () {
            return JSON.parse(storage.PermanentStorage.get("UserInfo") || null);
        };
        User.saveToStorage = function (value) {
            if (value !== null) {
                storage.PermanentStorage.set("UserInfo", JSON.stringify(value));
                storage.PermanentStorage.set("UserId", value.id);
            }
        };
        User.forceRefresh = function () {
            storage.PermanentStorage.set("UserInfoDate", null);
        };
        User.refreshIsNeeded = function () {
            var date = JSON.parse(storage.PermanentStorage.get("UserInfoDate") || null);
            if (date) {
                var d = new Date(date);
                var refreshDate = new Date(d.setDate(d.getDate() + 1)); //refresh once a day
                return (new Date()) > refreshDate;
            }
            return true;
        };
        User.setLastRefreshDate = function () {
            storage.PermanentStorage.set("UserInfoDate", JSON.stringify(new Date()));
        };
        return User;
    }());
    exports.User = User;
});
