export enum LoginLayout { LoginView = 0, RegisterView = 1 };

export enum MainLayout { ProfileView = 0, MissionView = 1 };

export enum Direction { left = 0, right = 1, up = 2, down = 3 };

export enum SolutionType { RightAnswer = 0, TextCreation = 1, PhotoCreation = 2, GeoCoordinates = 3, CommonPlace = 5, Unique = 6, Video = 7 };

export enum MissionCompletionStatus { Success = 0, Fail = 1, Waiting = 2, IntermediateFail = 3 };

export enum MissionDisplayStatus { Succeeded = 0, Failed = 1, Waiting = 2, Available = 3, NotAvailable = 4 };

export enum RatingType { Common = 0, Country = 1, City = 2, Friends = 3 }

export enum HintType { Text = 0, Direction = 1, Coordinate = 2 }

export enum HintRequestStatus { Success = 1, UserDontHaveThatMissionInActiveStatus = 2, HintNotFound = 3, UserDontHaveCoins = 4, CommonPlaceNotExist = 5 }