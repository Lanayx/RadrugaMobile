/// <reference path="../kendo/typescript/kendo.mobile.d.ts" />

/*Window Extensions*/
export interface IAppWindow extends Window {
    app?: IApp;
}

export interface IApp {
    alertSupportedStyles?: any;
    appInit?: IAppInit;
    application?: kendo.mobile.Application;
    langDictionary?: Object;
    navigators?: INavigators;
    isOnline: boolean;
    onlineWaitingEvents: Array<any>;
    notifications:any;
    isRussian: boolean;
}

export interface INavigators {
    navigateToLogin?: any;
    navigateToRegister?: any;
    navigateToProfile?: any;
    navigateToMission?: any;
    navigateToKindAction?: any;
}

export interface IAppInit {
    aboutViewModelInit?: () => void;
    aboutViewModelShow?: () => void;
    aboutViewModelHide?: () => void;
    //----------------------    
    accountViewModelInit?: () => void;
    accountViewModelShow?: () => void;
    accountViewModelHide?: () => void;
    //----------------------
    achievementViewModelInit?: () => void;
    achievementViewModelShow?: () => void;
    achievementViewModelHide?: () => void;
    //----------------------
    baseLocationsViewModelInit?:()=>void;
    baseLocationsViewModelShow?:()=>void;
    baseLocationsViewModelHide?: () => void;
    //----------------------
    addEmailViewModelInit?: () => void;
    addEmailViewModelShow?: () => void;
    addEmailViewModelHide?: () => void;
    //----------------------
    cameraViewModelInit?: () => void;
    cameraViewModelShow?: () => void;
    cameraViewModelHide?: () => void;
    //----------------------
    commonPlaceViewModelInit?: () => void;
    commonPlaceViewModelShow?: () => void;
    commonPlaceViewModelHide?: () => void;
    //----------------------
    enterViewModelInit?: () => void;
    enterViewModelShow?: () => void;
    enterViewModelHide?: () => void;
    //----------------------
    failViewModelShow?: () => void;
    failViewModelHide?: () => void;
    //----------------------
    failWarningViewModelShow?: () => void;
    failWarningViewModelHide?: () => void;
    //----------------------
    feedbackMessageViewModelInit?: () => void;
    feedbackMessageViewModelShow?: () => void;
    feedbackMessageViewModelHide?: () => void;
    //----------------------
    kindActionNewViewModelInit?: () => void;
    kindActionNewViewModelShow?: () => void;
    kindActionNewViewModelHide?: () => void;
    //----------------------
    kindActionListViewModelInit?: () => void;
    kindActionListViewModelShow?: () => void;
    kindActionListViewModelHide?: () => void;
    //----------------------
    kindActionReadViewModelInit?: () => void;
    kindActionReadViewModelShow?: () => void;
    kindActionReadViewModelHide?: () => void;
    //----------------------
    loginViewModelInit?: () => void;
    loginViewModelShow?: () => void;
    loginViewModelHide?: () => void;
    //----------------------
    missionChainViewModelInit?: () => void;
    missionChainViewModelShow?: () => void;
    missionChainViewModelHide?: () => void;
    //----------------------
    missionViewModelShow?: () => void;
    missionViewModelHide?: () => void;
    //----------------------
    profileViewModelInit?: () => void;
    profileViewModelShow?: () => void;
    profileViewModelHide?: () => void;
    //----------------------
    profileReadViewModelInit?: () => void;
    profileReadViewModelShow?: () => void;
    profileReadViewModelHide?: () => void;
    //----------------------
    questionViewModelInit?: () => void;
    questionViewModelShow?: () => void;
    questionViewModelHide?: () => void;
    //----------------------
    ratingViewModelShow?: () => void;
    ratingViewModelHide?: () => void;
    //----------------------
    registerViewModelInit?: () => void;
    registerViewModelShow?: () => void;
    registerViewModelHide?: () => void;
    //----------------------
    requiredFieldsViewModelInit?: () => void;
    requiredFieldsViewModelShow?: () => void;
    requiredFieldsViewModelHide?: () => void;
    //----------------------
    resetPasswordViewModelInit?: () => void;
    resetPasswordViewModelShow?: () => void;
    resetPasswordViewModelHide?: () => void;
    //----------------------
    rightAnswerViewModelInit?: () => void;
    rightAnswerViewModelShow?: () => void;
    rightAnswerViewModelHide?: () => void;
    //----------------------
    videoViewModelInit?: () => void;
    videoViewModelShow?: () => void;
    videoViewModelHide?: () => void;
    //----------------------
    settingsViewModelInit?: () => void;
    settingsViewModelShow?: () => void;
    settingsViewModelHide?: () => void;
    //----------------------
    successViewModelShow?: () => void;
    successViewModelHide?: () => void;
    //----------------------
    textCreationViewModelInit?: () => void;
    textCreationViewModelShow?: () => void;
    textCreationViewModelHide?: () => void;
    //----------------------
    pathViewModelInit?: () => void;
    pathViewModelShow?: () => void;
    pathViewModelHide?: () => void;
    //----------------------
    perpetumMobileViewModelInit?: () => void;
    perpetumMobileViewModelShow?: () => void;
    perpetumMobileViewModelHide?: () => void;
    //----------------------
    showYourselfViewModelInit?: () => void;
    showYourselfViewModelShow?: () => void;
    showYourselfViewModelHide?: () => void;
    //----------------------
    waitViewModelShow?: () => void;
    waitViewModelHide?: () => void;
}


/*Models*/
export interface IResetPasswordModel {
    email: string;
    newpassword: string;
}

/*Api Options*/
export interface IApiCallOptions {
    method: string;
    parameters?: string;
    requestType: string;
    data?: any;
    httpHeader?: string;
    headerValue?: string;
}

export interface IVkApiCallOptions {
    method: string;
    parameters?:string;
    requestType: string;
    data?: string;
}

export interface IFileUploadOptions {
    filePath: string;
    method: string;
    fileName: string;
    onProgress?: any;
    params?: Object;
}


/*Navigation properties*/

export interface IMissionNavigationProperties {
    missionId?: string;
    imageUrl?: string;
    missionName?:string;
    experiencePoints?: number;
    starsCount?: number;
    congratsMessage?: string;
}


export interface ITriesNavigationProperties {
    showTries?: boolean;
    maxTries?: number;
}

export interface IPathNavigationProperties {
    showTimer?: boolean;
}

export interface IKindActionNavigationProperties {
    kineActionId: string;
    imageUrl?: string;
    description: string;
    likesCount?: number;
    dislikesCount?: number;
    alreadyLiked: boolean;
    userId: string;
    points?: any;
    avatar?: any;
}

export interface IUserNavigationProperties {
    userId: string;
    avatar?: string;
    points?: any;
}

/*External wsInterfaces*/
export interface IMemoryInfo {
    capacity: number;
    availableCapacity: number;
}
