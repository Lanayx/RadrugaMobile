var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/Navigation", "../../../scripts/ApplicationTools", "../../../scripts/Enums", "../../../scripts/models/Mission"], function (require, exports, navigation, appTools, enums, miss) {
    "use strict";
    var imageUrl, missionName, missionId;
    var FailViewModel = (function (_super) {
        __extends(FailViewModel, _super);
        function FailViewModel() {
            _super.call(this);
            this.missionImagePath = imageUrl;
            //resources 
            this.failTitleRes = appTools.getText("failMissionFailed");
            this.failMessageRes = appTools.getText("failMessage");
            this.goToMissionsRes = appTools.getText("cmGoToMissions");
            _super.prototype.init.call(this, this);
        }
        FailViewModel.prototype.goToMissions = function () {
            backButtonCallback();
        };
        return FailViewModel;
    }(kendo.data.ObservableObject));
    exports.FailViewModel = FailViewModel;
    function init(options) {
        imageUrl = options.imageUrl;
        missionName = options.missionName;
        missionId = options.missionId;
    }
    exports.init = init;
    function bindModel() {
        var viewModel = new FailViewModel();
        kendo.bind($("#vFail"), viewModel, kendo.mobile.ui);
    }
    function backButtonCallback() {
        navigation.navigateToMissionChainView(enums.Direction.down);
    }
    var app = appTools.getApp();
    app.appInit.failViewModelShow = function () {
        bindModel();
        miss.Mission.setMissionDisplayStatus(missionId, enums.MissionDisplayStatus.Failed);
        appTools.forceRebind("MissionChain", "Profile");
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.failViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
