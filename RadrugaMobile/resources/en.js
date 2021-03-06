define(["require", "exports"], function (require, exports) {
    "use strict";
    function getDictionary() {
        return {
            //common
            "cmAchievements": "Achieved",
            "cmAllFieldsAreRequired": "All the fields are required",
            "cmApiError": "Server temporary unavailable",
            "cmClientError": "Application error, please try restart the game",
            "cmApiErrorTitle": "Server error",
            "cmApprovalCode": "Approval code",
            "cmBack": "Back",
            "cmCancel": "Cancel",
            "cmDetails": "Details",
            "cmDifficulty": "Difficulty",
            "cmExperienceR": " experience points",
            "cmFrom": "from",
            "cmGoToMissions": "Return to missions",
            "cmKindScale": "Kindness",
            "cmKindActions": "Kind actions",
            "cmLevel": "Level",
            "cmLoading": "Loading...",
            "cmLogin": "Login",
            "cmMission": "Mission",
            "cmMissions": "Missions",
            "cmNext": "Next",
            "cmNickName": "NickName",
            "cmPassword": "Password",
            "cmProfile": "Profile",
            "cmRadruga": "Radruga",
            "cmRadrugaColor": "Radruga color",
            "cmRating": "Rating",
            "cmReady": "Ready",
            "cmRegistration": "Registration",
            "cmRetakePhoto": "Retake",
            "cmSend": "Send",
            "cmSettings": "Settings",
            "cmVkError": "VK Error",
            "cmEnterAnswer": "Enter the answer",
            "cmSec": "sec.",
            "cmWarning": "Warning",
            //location module
            "geoCantObtainCoordinateTitle": "Geolocation error",
            "geoCantObtainCoordinateMessage": "Can't obtain current location. Try to \r\n1)check internet connection and if the GPS is enabled \r\n2)restart application \r\n3)wait for 10 minutes and try again \r\n4)reboot the device",
            //enterView
            "enterLoginWithEmail": "Enter via Email",
            "enterVkLoginOrRegister": "Enter via Vkontakte",
            "enterVkRegisterFail": "Unfortunately, we can't register you using Vk, please register using email or try later",
            "enterVkGetProfileIncorrect": "We can't get data from Vk",
            //loginView
            "loginForgotPassword": "Forgot password?",
            "loginLoginError": "Login error",
            "loginWrongCredentials": "Wrong credentials",
            //registerView
            "registerApprovalFailed": "Approval failed",
            "registerApprovalHeader": "During 2 minutes approval code will be sent to the email ",
            "registerApprovalNotify": "(if you don't get the email, check out the 'Spam' folder)",
            "registerInvalidEmail": "Invalid email",
            "registerInvalidPassword": "Password is too short",
            "registerRegistrationFailed": "Registration failed",
            "registerResendCode": "Resend",
            //requiredFieldsView
            "requiredFieldsDateOfBirth": "Date of birth",
            "requiredFieldsSex": "Sex",
            "requiredFieldsMale": "Male",
            "requiredFieldsFemale": "Female",
            //missionChainView
            "chainMissionInaccessibleTitle": "Mission unavailable",
            "chainMissionSucceeded": "You have already passed this mission!",
            "chainMissionFailed": "Looks like you had problems with this mission. Try take another one.",
            "chainMissionNotAvailable": "Before starting this you need to pass mission ",
            "chainMissionNotAvailableMultipleDependency": "Before starting this you need to pass missions ",
            "chainMissionWaiting": "You have already passed this mission and it is still being checked. Go ahead with another mission in the meanwhile :)",
            "chainTestRequired": "Now pass test and get your start Radruga color. After that you get access to new missions.",
            "chainFinished": "You have finished all the missions! Join our Vkontakte group and keep an eye on updates!",
            "chainNoMissions": "No missions are available",
            //missionView
            "missionViewOnSurrenderMessage": "Switching to the next mission",
            "missionViewOnSurrenderTitle": "Surrender",
            "missionViewIncorrectSolutionTypeMessage": "Incorrect mission type.",
            "missionViewIncorrectSolutionTypeTitle": "Internal Error",
            "missionViewSurrender": "I surrender",
            "missionSolve": "Solve",
            //cameraView
            "cameraErrorTitle": "Photo failed",
            //rightAnswerView
            "rightAnswerIncorrectTitle": "Incorrect answer",
            "rightAnswerIncorrectMessage": "Try once again.",
            "rightAnswerPartialIncorrectMessage": "Some of answers are invalid. Try once again.",
            "rightAnswerTry": "Try",
            //solutions common
            "slnSendForApproval": "Send for approval",
            "slnApprovalMessage": "When your request is processed, we'll send you a notification",
            "slnApprovalTitle": "Request sent",
            "slnTriesLeft": "Tries left: ",
            "slnCheckAnswer": "Check answer",
            //profileView
            "profileMissions": "Missions",
            "profileKindActions": "KindActions",
            "profileMoneyAccount": "Coins",
            "profileOpenLocations": "Discovered locations",
            //profileReadView
            //kindActionNew
            "kindActionNewComplete": "I did it!",
            "kindActionNewDescription": "What have I done well today?",
            "kindActionNewCompleted": "Kind action was completed!",
            "kindActionNewAnotherAction": "Submit another kind action",
            "kindActionNewValidationShort": "Please, tell about it in more details!",
            "kindActionNewValidationLong": "Please, try to make your story shorter!",
            "kindActionNewReward": "to the kind scale",
            "kindActionNewCoins": "coins",
            //kindActionList
            "kindActionListHistory": "History",
            //kindActionRead
            "kindActionReadLike": "Good",
            "kindActionReadDislike": "Bad",
            //settingsView
            "settingsAttachVk": "Attach Vkontakte profile",
            "settingsAttachEmail": "Specify your email",
            "settingsChangePassword": "Change password",
            "settingsEnableNotifications": "Notifications",
            "settingsMessageForDevelopers": "Message for the developers",
            "settingsAbout": "About",
            "settingsLogout": "Logout",
            "settingsPushAfterRestart": "Restart is needed for the correct notifications work",
            //feedBackMessageView
            "feedbackMessageDescription": "You message for us",
            "feedbackSent": "Thank you for your feedback! You can send even more any time later",
            //successView
            "sucessMissionCompleted": "Mission is completed!",
            "sucessShareInVk": "Share the sucess in Vk",
            "sucessShareMessage": "Hehe! I made it again, today was beaten the mission ",
            "successVkShareFail": "Erorr when posting to Vk",
            "sucessRateAppDescription": "You have completed 5 missions! Honor the Radruga by rating it in the Store!",
            "sucessRateAppTitle": "Rate Radruga",
            "sucessRateAppYes": "Perfect",
            "sucessRateAppLater": "Later",
            //failView
            "failMissionFailed": "Mission failed.",
            "failMessage": "Don't be upset! You can shine in other missions.",
            //failWarningView
            "failWarningMessage": "If you cancel this mission, you won't be able to pass it again and all missions that depend on it too. Are you sure you want to surrender?",
            "failWarningTitle": "Wait!",
            "failWarningGoToMission": "Return",
            "failWarningGoToFail": "Surrender",
            //waitView
            "waitMessage": "You'll get a notification after the administrator's approval. Go ahead with other mission in the meanwhile :)",
            "waitMessageWithReminder": "To get notified about it's approval, enable notifications on the settings page. Go ahead with other missions in the meanwhile :)",
            "waitTitle": "Mission is being checked!",
            "waitGoToSettings": "To settings",
            //questionView
            "questionSuccessText": "Wow! You have just opened new missions and earned a personal color! Make it lighter now by passing missions and doing kind actions. P.S. Check out the menu background",
            "questionDescription": "You need to answer all the questions thoughtfully to get your color! (Not necessary at once)",
            //aboutView
            "aboutVkGroup": "Our group in Vkontakte",
            //addEmailView
            "addEmailHeader": "Additional login:",
            "addEmailAddCompleted": "You've successfully added the email and now you are able to use it as login.",
            "addEmailAddFailed": "Add email failed",
            //ratingView
            "ratingPoints1": "points",
            "ratingPoints2_4": "points",
            "ratingPoints5_0": "points",
            "ratingPlayers1": "players",
            "ratingPlayers2_4": "players",
            "ratingPlayers5_0": "players",
            "ratingPlace": "place",
            "ratingCommonView": "common",
            "ratingCountryView": "country",
            "ratingCityView": "city",
            //commonPlaceView
            "commonPlaceTryButton": "I have arrived!",
            "commonPlaceTryCount": "Try count",
            "commonPlaceIncorrectTitle": "Incorrect place",
            "commonPlaceIncorrectMessage": "Try once again.",
            "commonPlaceIsNearMessage": "You are close enough!",
            "commonPlaceStillHomeMessage": "You are still at command point!",
            //pathView
            "pathOnThePosition": "On the position!",
            "pathTimeLeft": "Time left",
            "pathPointIncorrectTitle": "Incorrect point",
            "pathPointIncorrectMessage": "Still too far from the correct point",
            "pathPointIsNearMessage": "The correct point is closer now",
            "pathNextPoint": "Next point: ",
            "pathStart": "I'm on the start!",
            //textCreationView
            "textCreationDescription": "You can write right here or give a link to the public(!) post containing your answer",
            //showYourSelf
            "showYourSelfCongratMessage": "You can change avatar at the settings page",
            //perpetumMobileView
            "perpetumMobileTimeLeft": "Time left",
            "perpetumMobileCurrentTry": "Try #",
            "perpetumMobileStart": "Let's go!",
            "perpetumMobileAccelerometerFailTitle": "Sensor error",
            "perpetumMobileAccelerometerFail": "Accelerometer is unavailable!",
            //videoView
            "videoDescription": "Give us a link to your public(!) mission execution video",
            //baseLocations
            "baseLocationsCommandPoint": "Command point",
            "baseLocationsNorthPoint": "North border",
            "baseLocationsEastPoint": "East border",
            "baseLocationsSouthPoint": "South border",
            "baseLocationsWestPoint": "West border",
            "baseLocationsRadar": "Radar",
            "baseLocationsOutpost": "Outpost",
            //account
            "accountCoinsDescription": "Coins can be spent on mission hints and gained by filling kind scale to 100%. Several coins to start with are already with you :)",
            //hintModal
            "hintNotEnoughCoins": "Not enough coins! Earn them, doing kind actions.",
            "hintModalTitle": "Hints",
            "hintTake": "Take",
            "hintShow": "Show",
            "hintTemporarilyUnavailable": "This hint is temporarily unavailable",
            "hintNorth": "Take to the north",
            "hintEast": "Go to the east",
            "hintSouth": "Move to the south",
            "hintWest": "Keep to the west",
            "hintAlreadyArrived": "You have already arrived"
        };
    }
    exports.getDictionary = getDictionary;
});
