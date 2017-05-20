/// <reference path="tsDefinitions/require.d.ts" />
import interfaces = require("Interfaces");
import appTools = require("ApplicationTools");
import enums = require("Enums");
import tools = require("Tools");
import storage = require("Storage");
import conf = require("Configuration");

/*Navigation inside login-layout*/

export function navigateToEnterView(direction: enums.Direction) {
    require(["../views/start/enterView/enter"], () => {
        navigateToView("views/start/enterView/enter.html", direction);
    });
}

export function navigateToRequiredFieldsView(direction: enums.Direction, fields:string[]) {
    require(["../views/start/requiredFieldsView/requiredFields", "mobiscroll"], (requiredFields) => {
        requiredFields.init(fields);
        navigateToView("views/start/requiredFieldsView/requiredFields.html", direction);
    });
}

export function navigateToLoginView(direction: enums.Direction) {
    require(["../views/start/loginView/login"], () => {
        navigateToView("views/start/loginView/login.html", direction);
    });
}

export function navigateToRegisterView(data?: any) {
    require(["../views/start/registerView/register"], (registration) => {
        if (data) {
            registration.init(data);
        }
        navigateToView("views/start/registerView/register.html");
    });
}

export function navigateToResetPasswordView(data?: any) {
    require(["../views/start/resetPasswordView/resetPassword"], (resetPassword) => {
        if (data) {
            resetPassword.init(data);
        }
        navigateToView("views/start/resetPasswordView/resetPassword.html");
    });
}

/*Navigation inside main-layout*/

export function navigateToSettingsView(direction: enums.Direction) {
    require(["../views/settingsView/settings"], () => {
        navigateToView("views/settingsView/settings.html", direction);
    });
}

export function navigateToMissionChainView(direction: enums.Direction) {
    require(["../views/missionChainView/missionChain"], () => {
        navigateToView("views/missionChainView/missionChain.html", direction);
    });
}

export function navigateToMissionView(direction: enums.Direction, data?: interfaces.IMissionNavigationProperties) {
    require(["../views/missionView/mission"], (mission) => {
        if (data) {
            mission.init(data);
        }
        navigateToView("views/missionView/mission.html", direction);
    });
}

export function navigateToKindActionNewView(direction: enums.Direction) {
    require(["../views/kindActions/kindActionNewView/kindActionNew"], () => {
        navigateToView("views/kindActions/kindActionNewView/kindActionNew.html", direction);
    });
}

export function navigateToRatingView(direction: enums.Direction) {
    require(["../views/ratingView/rating"], () => {
        navigateToView("views/ratingView/rating.html", direction);
    });
}

export function navigateToAchievementView(direction: enums.Direction) {
    require(["../views/achievementView/achievement"], () => {
        navigateToView("views/achievementView/achievement.html", direction);
    });
}

export function navigateToAccountView(direction: enums.Direction) {
    require(["../views/accountView/account"], () => {
        navigateToView("views/accountView/account.html", direction);
    });
}

/*Navigation inside mission*/
export function navigateToCameraView(direction: enums.Direction) {
    require(["../views/solutions/cameraView/camera"], () => {
        navigateToView("views/solutions/cameraView/camera.html", direction);
    });
}

export function navigateToRightAnswerView(direction: enums.Direction, data?: interfaces.ITriesNavigationProperties) {
    require(["../views/solutions/rightAnswerView/rightAnswer"], (rightAnswer) => {
        rightAnswer.init(data);
        navigateToView("views/solutions/rightAnswerView/rightAnswer.html", direction);
    });
}

export function navigateToTextCreationView(direction: enums.Direction) {
    require(["../views/solutions/textCreationView/textCreation"], () => {
        navigateToView("views/solutions/textCreationView/textCreation.html", direction);
    });
}

export function navigateToVideoView(direction: enums.Direction) {
    require(["../views/solutions/videoView/video"], () => {
        navigateToView("views/solutions/videoView/video.html", direction);
    });
}

export function navigateToCommonPlaceView(direction: enums.Direction, data?: interfaces.ITriesNavigationProperties) {
    require(["../views/solutions/commonPlaceView/commonPlace"], (commonPlace) => {
        commonPlace.init(data);
        navigateToView("views/solutions/commonPlaceView/commonPlace.html", direction);
    });
}

export function navigateToPathView(direction: enums.Direction, data?: interfaces.IPathNavigationProperties) {
    require(["../views/solutions/pathView/path"], (path) => {
        path.init(data);
        navigateToView("views/solutions/pathView/path.html", direction);
    });
}

export function navigateToSucessView(direction: enums.Direction, data: interfaces.IMissionNavigationProperties) {
    require(["../views/missionResults/successView/success"], (success) => {
        success.init(data);
        navigateToView("views/missionResults/successView/success.html", direction);
    });
}

export function navigateToFailWarningView(direction: enums.Direction, data: interfaces.IMissionNavigationProperties) {
    require(["../views/missionResults/failWarningView/failWarning"], (warning) => {
        warning.init(data);
        navigateToView("views/missionResults/failWarningView/failWarning.html", direction);
    });
}

export function navigateToFailView(direction: enums.Direction, data: interfaces.IMissionNavigationProperties) {
    require(["../views/missionResults/failView/fail"], (fail) => {
        fail.init(data);
        navigateToView("views/missionResults/failView/fail.html", direction);
    });
}

export function navigateToWaitView(direction: enums.Direction, data: interfaces.IMissionNavigationProperties) {
    require(["../views/missionResults/waitView/wait"], (wait) => {
        wait.init(data);
        navigateToView("views/missionResults/waitView/wait.html", direction);
    });
}


/*Navigation inside settings*/

export function navigateToAboutView(direction: enums.Direction) {
    require(["../views/settings/aboutView/about"], () => {
        navigateToView("views/settings/aboutView/about.html", direction);
    });
}

export function navigateToAddEmail(direction: enums.Direction) {
    require(["../views/settings/addEmailView/addEmail"], () => {
        navigateToView("views/settings/addEmailView/addEmail.html", direction);
    });
}

export function navigateToProfileView(direction: enums.Direction) {
    require(["../views/profileView/profile"], () => {
        navigateToView("views/profileView/profile.html", direction);
    });
}
export function navigateToProfileReadView(direction: enums.Direction, data: interfaces.IUserNavigationProperties) {
    require(["../views/profileReadView/profileRead"], (profileRead) => {
        profileRead.init(data);
        navigateToView("views/profileReadView/profileRead.html", direction);
    });
}


export function navigateToFeedBackMessageView(direction: enums.Direction) {
    require(["../views/settings/feedbackMessageView/feedbackMessage"], () => {
        navigateToView("views/settings/feedbackMessageView/feedbackMessage.html", direction);
    });
}

export function navigateToQuestionView(direction: enums.Direction) {
    require(["../views/questionView/question"], () => {
        navigateToView("views/questionView/question.html", direction);
    });
}

export function navigateToPerpetumMobileView(direction: enums.Direction) {
    require(["../views/unique/perpetumMobileView/perpetumMobile"], () => {
        navigateToView("views/unique/perpetumMobileView/perpetumMobile.html", direction);
    });
}

export function navigateToShowYourselfView(direction: enums.Direction) {
    require(["../views/unique/showYourselfView/showYourself"], () => {
        navigateToView("views/unique/showYourselfView/showYourself.html", direction);
    });
}

export function navigateToBaseLocationsView(direction: enums.Direction) {
    require(["../views/special/baseLocationsView/baseLocations"], () => {
        navigateToView("views/special/baseLocationsView/baseLocations.html", direction);
    });
}

export function navigateToKindActionListView(direction: enums.Direction, data: interfaces.IUserNavigationProperties) {
    require(["../views/kindActions/kindActionListView/kindActionList"], (kindActionList) => {
        kindActionList.init(data);
        navigateToView("views/kindActions/kindActionListView/kindActionList.html", direction);
    });
}

export function navigateToKindActionReadView(direction: enums.Direction, data: interfaces.IKindActionNavigationProperties) {
    require(["../views/kindActions/kindActionReadView/kindActionRead"], (read) => {
        read.init(data);
        navigateToView("views/kindActions/kindActionReadView/kindActionRead.html", direction);
    });
}


/*Private functions*/


function navigateToView(view: string, direction?: enums.Direction) {
    tools.loadCss(view.slice(0, -4) + "min.css");

    if (conf.Configuration.sendTelemetry)
        appInsights.trackPageView(view, null, {
            "userId": storage.PermanentStorage.get("UserId")
        });

    if (window.plugins && window.plugins.nativepagetransitions) { //temporary for windows phone
        window.plugins.nativepagetransitions.slide(
            {
                "href": "#" + view,// # is needed for remote views
                "direction": direction ? enums.Direction[direction] : "left"
            },
            () => { /*do nothing*/ },
            (msg) => { appTools.logError("Navigation error: " +msg); });
    } else {
        var app = appTools.getKendoApplication();
        setTimeout(() => {
            app.navigate(view, direction ? "slide:" + enums.Direction[direction] : "slide");
        }, 0);
    }
}