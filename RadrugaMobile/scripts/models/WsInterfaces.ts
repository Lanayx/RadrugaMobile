// ReSharper disable InconsistentNaming
import enums = require("../Enums");

export interface IWsCoordinate {
    Altitude: number;
    Course: number;
    HorizontalAccuracy: number;
    Latitude: number;
    Longitude: number;
    Speed: number;
    VerticalAccuracy: number;
}

export interface IWsUser {
    Id: string;
    AvatarUrl: string;
    DateOfBirth: Date;
    EnablePushNotifications: boolean;
    KindScale: number;
    Level: number;
    NickName: string;
    LevelPoints: number;
    Sex: number;
    CoinsCount: number;
    RadrugaColor: string;
    HasEmail: boolean;
    HasVk: boolean;

    HomeCoordinate: IWsCoordinate;
    BaseNorthCoordinate: IWsCoordinate;
    BaseEastCoordinate:IWsCoordinate;
    BaseSouthCoordinate: IWsCoordinate;
    BaseWestCoordinate: IWsCoordinate;
    OutpostCoordinate: IWsCoordinate;
    RadarCoordinate:IWsCoordinate;
}

export interface IWsUserViewInfo {
    Id: string;
    AvatarUrl: string;
    KindScale: number;
    Level: number;
    NickName: string;
    LevelPoints: number;
    RadrugaColor: string;

    CompletedMissionIdsCount: number;
    FailedMissionIdsCount: number;
    CityShortName: string;
    CountryShortName: string;

    ThreeFiveStarsBadge: boolean;
    FiveSetsBadge: boolean;
    KindScaleBadge: boolean;
    FiveRepostsBadge: boolean;
    RatingGrowthBadge: boolean;
    GlobalRank: number;
    CountryRank: number
    CityRank: number;
    KindActionsCount: number;
    KindActionMarksCount: number;
}

export interface IWsMissionSet {
    Id: string;
    Missions: IWsMission[];
}

export interface IWsMission {
    Id: string;
    Name: string;
    Description: string;
    PhotoUrl: string;
    Difficulty: number;
    ExecutionType: number;
    AnswersCount: number;
    IsFinal: boolean;
    TriesFor1Star: number;
    TryCount: number;
    DisplayStatus: number;
    NumberOfPhotos: number;
    DependentMissionIds: string[];
    MessageAfterCompletion: string;
    Hints: IWsHint[];

    CoordinatesCalculationFunction: string;
    CalculationFunctionParameters: string[];
    AccuracyRadius: number;
    SecondsFor1Star: number;
}

export interface IWsHint {
    Id: string;
    Text: string;
    Type: enums.HintType;
    Score: number;
    IsPayed: boolean;
}

export interface IPersonQualityWithScore {
    PersonQualityId: string;
    Score: number;
}

export interface IQuestion {
    Text: string;
    Options: IQuestionOption[];
}

export interface IQuestionOption {
    Text: string;
    PersonQualitiesWithScores: IPersonQualityWithScore[];
}

export interface ICommonRegistrationModel {
    LoginEmail: string;
    Password: string;
    NickName: string;
    DateOfBirth: Date;
    Sex: string;
}

export interface ICheckApprovalModel {
    Email: string;
    ApprovalCode: string;
}

export interface IAchievement {
    Description: string;
    Percentage: number;
}

export interface IRatingInfo {
    Place: number;
    NickName: string;
    Points: number;
    AvatarUrl: string;
    UserId: string;
}

export interface IRatingsWithUsersCount {
    UsersCount: number;
    Ratings: IRatingInfo[];
}

export interface IMissionProof {
    CreatedText?: string;
    ImageUrls?: string[];
    Coordinates?: IWsCoordinate[];
    NumberOfTries?: number;
    Rejected?: boolean;
    TimeElapsed?: number;
}

export interface IKindAction {
    Id: string;
    ImageUrl?: string;
    Description: string;
    DateAdded: Date;
    LikesCount: number;
    DislikesCount: number;
    ViewsCount?: number;
    AlreadyLiked: boolean;
}
