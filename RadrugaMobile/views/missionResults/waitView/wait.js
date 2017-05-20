var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/Navigation", "../../../scripts/ApplicationTools", "../../../scripts/Enums", "../../../scripts/models/User", "../../../scripts/models/Mission"], function (require, exports, navigation, appTools, enums, usr, miss) {
    "use strict";
    var imageUrl, missionId;
    var WaitViewModel = (function (_super) {
        __extends(WaitViewModel, _super);
        function WaitViewModel() {
            _super.call(this);
            this.missionImagePath = imageUrl;
            //resources 
            this.waitMessageRes = "";
            this.waitTitleRes = appTools.getText("waitTitle");
            this.goToMissionsRes = appTools.getText("cmGoToMissions");
            this.goToSettingsRes = appTools.getText("waitGoToSettings");
            _super.prototype.init.call(this, this);
            var notificationsEnabled = usr.User.getFromStorage().enablePushNotifications;
            this.settingsButtonVisible = !notificationsEnabled;
            this.missionButtonMarginTop = notificationsEnabled ?
                "3.5rem" : "0";
            this.waitMessageRes = notificationsEnabled
                ? appTools.getText("waitMessage")
                : appTools.getText("waitMessageWithReminder");
        }
        WaitViewModel.prototype.goToMissions = function () {
            backButtonCallback();
        };
        WaitViewModel.prototype.goToSettings = function () {
            navigation.navigateToSettingsView(enums.Direction.left);
        };
        return WaitViewModel;
    }(kendo.data.ObservableObject));
    exports.WaitViewModel = WaitViewModel;
    function init(options) {
        imageUrl = options.imageUrl;
        missionId = options.missionId;
    }
    exports.init = init;
    function bindModel() {
        var viewModel = new WaitViewModel();
        kendo.bind($("#vWait"), viewModel, kendo.mobile.ui);
    }
    function backButtonCallback() {
        navigation.navigateToMissionChainView(enums.Direction.left);
    }
    var app = appTools.getApp();
    app.appInit.waitViewModelShow = function () {
        bindModel();
        miss.Mission.setMissionDisplayStatus(missionId, enums.MissionDisplayStatus.Waiting);
        appTools.forceRebind("MissionChain");
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.waitViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
