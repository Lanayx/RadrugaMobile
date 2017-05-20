define(["require", "exports"], function (require, exports) {
    "use strict";
    (function (LoginLayout) {
        LoginLayout[LoginLayout["LoginView"] = 0] = "LoginView";
        LoginLayout[LoginLayout["RegisterView"] = 1] = "RegisterView";
    })(exports.LoginLayout || (exports.LoginLayout = {}));
    var LoginLayout = exports.LoginLayout;
    ;
    (function (MainLayout) {
        MainLayout[MainLayout["ProfileView"] = 0] = "ProfileView";
        MainLayout[MainLayout["MissionView"] = 1] = "MissionView";
    })(exports.MainLayout || (exports.MainLayout = {}));
    var MainLayout = exports.MainLayout;
    ;
    (function (Direction) {
        Direction[Direction["left"] = 0] = "left";
        Direction[Direction["right"] = 1] = "right";
        Direction[Direction["up"] = 2] = "up";
        Direction[Direction["down"] = 3] = "down";
    })(exports.Direction || (exports.Direction = {}));
    var Direction = exports.Direction;
    ;
    (function (SolutionType) {
        SolutionType[SolutionType["RightAnswer"] = 0] = "RightAnswer";
        SolutionType[SolutionType["TextCreation"] = 1] = "TextCreation";
        SolutionType[SolutionType["PhotoCreation"] = 2] = "PhotoCreation";
        SolutionType[SolutionType["GeoCoordinates"] = 3] = "GeoCoordinates";
        SolutionType[SolutionType["CommonPlace"] = 5] = "CommonPlace";
        SolutionType[SolutionType["Unique"] = 6] = "Unique";
        SolutionType[SolutionType["Video"] = 7] = "Video";
    })(exports.SolutionType || (exports.SolutionType = {}));
    var SolutionType = exports.SolutionType;
    ;
    (function (MissionCompletionStatus) {
        MissionCompletionStatus[MissionCompletionStatus["Success"] = 0] = "Success";
        MissionCompletionStatus[MissionCompletionStatus["Fail"] = 1] = "Fail";
        MissionCompletionStatus[MissionCompletionStatus["Waiting"] = 2] = "Waiting";
        MissionCompletionStatus[MissionCompletionStatus["IntermediateFail"] = 3] = "IntermediateFail";
    })(exports.MissionCompletionStatus || (exports.MissionCompletionStatus = {}));
    var MissionCompletionStatus = exports.MissionCompletionStatus;
    ;
    (function (MissionDisplayStatus) {
        MissionDisplayStatus[MissionDisplayStatus["Succeeded"] = 0] = "Succeeded";
        MissionDisplayStatus[MissionDisplayStatus["Failed"] = 1] = "Failed";
        MissionDisplayStatus[MissionDisplayStatus["Waiting"] = 2] = "Waiting";
        MissionDisplayStatus[MissionDisplayStatus["Available"] = 3] = "Available";
        MissionDisplayStatus[MissionDisplayStatus["NotAvailable"] = 4] = "NotAvailable";
    })(exports.MissionDisplayStatus || (exports.MissionDisplayStatus = {}));
    var MissionDisplayStatus = exports.MissionDisplayStatus;
    ;
    (function (RatingType) {
        RatingType[RatingType["Common"] = 0] = "Common";
        RatingType[RatingType["Country"] = 1] = "Country";
        RatingType[RatingType["City"] = 2] = "City";
        RatingType[RatingType["Friends"] = 3] = "Friends";
    })(exports.RatingType || (exports.RatingType = {}));
    var RatingType = exports.RatingType;
    (function (HintType) {
        HintType[HintType["Text"] = 0] = "Text";
        HintType[HintType["Direction"] = 1] = "Direction";
        HintType[HintType["Coordinate"] = 2] = "Coordinate";
    })(exports.HintType || (exports.HintType = {}));
    var HintType = exports.HintType;
    (function (HintRequestStatus) {
        HintRequestStatus[HintRequestStatus["Success"] = 1] = "Success";
        HintRequestStatus[HintRequestStatus["UserDontHaveThatMissionInActiveStatus"] = 2] = "UserDontHaveThatMissionInActiveStatus";
        HintRequestStatus[HintRequestStatus["HintNotFound"] = 3] = "HintNotFound";
        HintRequestStatus[HintRequestStatus["UserDontHaveCoins"] = 4] = "UserDontHaveCoins";
        HintRequestStatus[HintRequestStatus["CommonPlaceNotExist"] = 5] = "CommonPlaceNotExist";
    })(exports.HintRequestStatus || (exports.HintRequestStatus = {}));
    var HintRequestStatus = exports.HintRequestStatus;
});
