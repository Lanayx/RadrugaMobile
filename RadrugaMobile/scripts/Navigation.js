define(["require", "exports", "ApplicationTools", "Enums", "Tools", "Storage", "Configuration"], function (require, exports, appTools, enums, tools, storage, conf) {
    "use strict";
    /*Navigation inside login-layout*/
    function navigateToEnterView(direction) {
        require(["../views/start/enterView/enter"], function () {
            navigateToView("views/start/enterView/enter.html", direction);
        });
    }
    exports.navigateToEnterView = navigateToEnterView;
    function navigateToRequiredFieldsView(direction, fields) {
        require(["../views/start/requiredFieldsView/requiredFields", "mobiscroll"], function (requiredFields) {
            requiredFields.init(fields);
            navigateToView("views/start/requiredFieldsView/requiredFields.html", direction);
        });
    }
    exports.navigateToRequiredFieldsView = navigateToRequiredFieldsView;
    function navigateToLoginView(direction) {
        require(["../views/start/loginView/login"], function () {
            navigateToView("views/start/loginView/login.html", direction);
        });
    }
    exports.navigateToLoginView = navigateToLoginView;
    function navigateToRegisterView(data) {
        require(["../views/start/registerView/register"], function (registration) {
            if (data) {
                registration.init(data);
            }
            navigateToView("views/start/registerView/register.html");
        });
    }
    exports.navigateToRegisterView = navigateToRegisterView;
    function navigateToResetPasswordView(data) {
        require(["../views/start/resetPasswordView/resetPassword"], function (resetPassword) {
            if (data) {
                resetPassword.init(data);
            }
            navigateToView("views/start/resetPasswordView/resetPassword.html");
        });
    }
    exports.navigateToResetPasswordView = navigateToResetPasswordView;
    /*Navigation inside main-layout*/
    function navigateToSettingsView(direction) {
        require(["../views/settingsView/settings"], function () {
            navigateToView("views/settingsView/settings.html", direction);
        });
    }
    exports.navigateToSettingsView = navigateToSettingsView;
    function navigateToMissionChainView(direction) {
        require(["../views/missionChainView/missionChain"], function () {
            navigateToView("views/missionChainView/missionChain.html", direction);
        });
    }
    exports.navigateToMissionChainView = navigateToMissionChainView;
    function navigateToMissionView(direction, data) {
        require(["../views/missionView/mission"], function (mission) {
            if (data) {
                mission.init(data);
            }
            navigateToView("views/missionView/mission.html", direction);
        });
    }
    exports.navigateToMissionView = navigateToMissionView;
    function navigateToKindActionNewView(direction) {
        require(["../views/kindActions/kindActionNewView/kindActionNew"], function () {
            navigateToView("views/kindActions/kindActionNewView/kindActionNew.html", direction);
        });
    }
    exports.navigateToKindActionNewView = navigateToKindActionNewView;
    function navigateToRatingView(direction) {
        require(["../views/ratingView/rating"], function () {
            navigateToView("views/ratingView/rating.html", direction);
        });
    }
    exports.navigateToRatingView = navigateToRatingView;
    function navigateToAchievementView(direction) {
        require(["../views/achievementView/achievement"], function () {
            navigateToView("views/achievementView/achievement.html", direction);
        });
    }
    exports.navigateToAchievementView = navigateToAchievementView;
    function navigateToAccountView(direction) {
        require(["../views/accountView/account"], function () {
            navigateToView("views/accountView/account.html", direction);
        });
    }
    exports.navigateToAccountView = navigateToAccountView;
    /*Navigation inside mission*/
    function navigateToCameraView(direction) {
        require(["../views/solutions/cameraView/camera"], function () {
            navigateToView("views/solutions/cameraView/camera.html", direction);
        });
    }
    exports.navigateToCameraView = navigateToCameraView;
    function navigateToRightAnswerView(direction, data) {
        require(["../views/solutions/rightAnswerView/rightAnswer"], function (rightAnswer) {
            rightAnswer.init(data);
            navigateToView("views/solutions/rightAnswerView/rightAnswer.html", direction);
        });
    }
    exports.navigateToRightAnswerView = navigateToRightAnswerView;
    function navigateToTextCreationView(direction) {
        require(["../views/solutions/textCreationView/textCreation"], function () {
            navigateToView("views/solutions/textCreationView/textCreation.html", direction);
        });
    }
    exports.navigateToTextCreationView = navigateToTextCreationView;
    function navigateToVideoView(direction) {
        require(["../views/solutions/videoView/video"], function () {
            navigateToView("views/solutions/videoView/video.html", direction);
        });
    }
    exports.navigateToVideoView = navigateToVideoView;
    function navigateToCommonPlaceView(direction, data) {
        require(["../views/solutions/commonPlaceView/commonPlace"], function (commonPlace) {
            commonPlace.init(data);
            navigateToView("views/solutions/commonPlaceView/commonPlace.html", direction);
        });
    }
    exports.navigateToCommonPlaceView = navigateToCommonPlaceView;
    function navigateToPathView(direction, data) {
        require(["../views/solutions/pathView/path"], function (path) {
            path.init(data);
            navigateToView("views/solutions/pathView/path.html", direction);
        });
    }
    exports.navigateToPathView = navigateToPathView;
    function navigateToSucessView(direction, data) {
        require(["../views/missionResults/successView/success"], function (success) {
            success.init(data);
            navigateToView("views/missionResults/successView/success.html", direction);
        });
    }
    exports.navigateToSucessView = navigateToSucessView;
    function navigateToFailWarningView(direction, data) {
        require(["../views/missionResults/failWarningView/failWarning"], function (warning) {
            warning.init(data);
            navigateToView("views/missionResults/failWarningView/failWarning.html", direction);
        });
    }
    exports.navigateToFailWarningView = navigateToFailWarningView;
    function navigateToFailView(direction, data) {
        require(["../views/missionResults/failView/fail"], function (fail) {
            fail.init(data);
            navigateToView("views/missionResults/failView/fail.html", direction);
        });
    }
    exports.navigateToFailView = navigateToFailView;
    function navigateToWaitView(direction, data) {
        require(["../views/missionResults/waitView/wait"], function (wait) {
            wait.init(data);
            navigateToView("views/missionResults/waitView/wait.html", direction);
        });
    }
    exports.navigateToWaitView = navigateToWaitView;
    /*Navigation inside settings*/
    function navigateToAboutView(direction) {
        require(["../views/settings/aboutView/about"], function () {
            navigateToView("views/settings/aboutView/about.html", direction);
        });
    }
    exports.navigateToAboutView = navigateToAboutView;
    function navigateToAddEmail(direction) {
        require(["../views/settings/addEmailView/addEmail"], function () {
            navigateToView("views/settings/addEmailView/addEmail.html", direction);
        });
    }
    exports.navigateToAddEmail = navigateToAddEmail;
    function navigateToProfileView(direction) {
        require(["../views/profileView/profile"], function () {
            navigateToView("views/profileView/profile.html", direction);
        });
    }
    exports.navigateToProfileView = navigateToProfileView;
    function navigateToProfileReadView(direction, data) {
        require(["../views/profileReadView/profileRead"], function (profileRead) {
            profileRead.init(data);
            navigateToView("views/profileReadView/profileRead.html", direction);
        });
    }
    exports.navigateToProfileReadView = navigateToProfileReadView;
    function navigateToFeedBackMessageView(direction) {
        require(["../views/settings/feedbackMessageView/feedbackMessage"], function () {
            navigateToView("views/settings/feedbackMessageView/feedbackMessage.html", direction);
        });
    }
    exports.navigateToFeedBackMessageView = navigateToFeedBackMessageView;
    function navigateToQuestionView(direction) {
        require(["../views/questionView/question"], function () {
            navigateToView("views/questionView/question.html", direction);
        });
    }
    exports.navigateToQuestionView = navigateToQuestionView;
    function navigateToPerpetumMobileView(direction) {
        require(["../views/unique/perpetumMobileView/perpetumMobile"], function () {
            navigateToView("views/unique/perpetumMobileView/perpetumMobile.html", direction);
        });
    }
    exports.navigateToPerpetumMobileView = navigateToPerpetumMobileView;
    function navigateToShowYourselfView(direction) {
        require(["../views/unique/showYourselfView/showYourself"], function () {
            navigateToView("views/unique/showYourselfView/showYourself.html", direction);
        });
    }
    exports.navigateToShowYourselfView = navigateToShowYourselfView;
    function navigateToBaseLocationsView(direction) {
        require(["../views/special/baseLocationsView/baseLocations"], function () {
            navigateToView("views/special/baseLocationsView/baseLocations.html", direction);
        });
    }
    exports.navigateToBaseLocationsView = navigateToBaseLocationsView;
    function navigateToKindActionListView(direction, data) {
        require(["../views/kindActions/kindActionListView/kindActionList"], function (kindActionList) {
            kindActionList.init(data);
            navigateToView("views/kindActions/kindActionListView/kindActionList.html", direction);
        });
    }
    exports.navigateToKindActionListView = navigateToKindActionListView;
    function navigateToKindActionReadView(direction, data) {
        require(["../views/kindActions/kindActionReadView/kindActionRead"], function (read) {
            read.init(data);
            navigateToView("views/kindActions/kindActionReadView/kindActionRead.html", direction);
        });
    }
    exports.navigateToKindActionReadView = navigateToKindActionReadView;
    /*Private functions*/
    function navigateToView(view, direction) {
        tools.loadCss(view.slice(0, -4) + "min.css");
        if (conf.Configuration.sendTelemetry)
            appInsights.trackPageView(view, null, {
                "userId": storage.PermanentStorage.get("UserId")
            });
        if (window.plugins && window.plugins.nativepagetransitions) {
            window.plugins.nativepagetransitions.slide({
                "href": "#" + view,
                "direction": direction ? enums.Direction[direction] : "left"
            }, function () { }, function (msg) { appTools.logError("Navigation error: " + msg); });
        }
        else {
            var app = appTools.getKendoApplication();
            setTimeout(function () {
                app.navigate(view, direction ? "slide:" + enums.Direction[direction] : "slide");
            }, 0);
        }
    }
});
