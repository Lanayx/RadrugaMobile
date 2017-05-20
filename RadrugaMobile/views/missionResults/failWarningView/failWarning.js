var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/Navigation", "../../../scripts/ApplicationTools", "../../../scripts/Enums", "../../../scripts/ServiceApi"], function (require, exports, navigation, appTools, enums, serviceApi) {
    var missionId, imageUrl;
    var FailWarningViewModel = (function (_super) {
        __extends(FailWarningViewModel, _super);
        function FailWarningViewModel() {
            _super.call(this);
            this.missionImagePath = imageUrl;
            //resources 
            this.failWarningMessageRes = appTools.getText("failWarningMessage");
            this.failWarningTitleRes = appTools.getText("failWarningTitle");
            this.goToMissionRes = appTools.getText("failWarningGoToMission");
            this.goToFailRes = appTools.getText("failWarningGoToFail");
            this._processStarted = false;
            _super.prototype.init.call(this, this);
        }
        FailWarningViewModel.prototype.goToMission = function () {
            backButtonCallback();
        };
        FailWarningViewModel.prototype.goToFail = function () {
            var _this = this;
            //prevent double clicking
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            var api = new serviceApi.ServiceApi();
            api.callService({
                method: "mission/DeclineMission?missionId=" + missionId,
                requestType: "POST"
            }).done(function (result) {
                if (result.Status === 0) {
                    switch (result.MissionCompletionStatus) {
                        case enums.MissionCompletionStatus.Success:
                            navigation.navigateToSucessView(enums.Direction.right, {
                                missionId: missionId,
                                imageUrl: _this.get("missionImagePath"),
                                experiencePoints: result.Points,
                                missionName: _this.get("missionName"),
                                starsCount: result.StarsCount
                            });
                            break;
                        case enums.MissionCompletionStatus.Fail:
                            navigation.navigateToFailView(enums.Direction.right, {
                                missionId: missionId,
                                imageUrl: _this.get("missionImagePath"),
                                missionName: _this.get("missionName")
                            });
                            break;
                    }
                }
                else
                    navigator.notification.alert(result.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            }).fail(function () {
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        return FailWarningViewModel;
    })(kendo.data.ObservableObject);
    exports.FailWarningViewModel = FailWarningViewModel;
    function init(options) {
        missionId = options.missionId;
        imageUrl = options.imageUrl;
    }
    exports.init = init;
    function bindModel() {
        var viewModel = new FailWarningViewModel();
        kendo.bind($("#vFailWarning"), viewModel, kendo.mobile.ui);
    }
    function backButtonCallback() {
        navigation.navigateToMissionView(enums.Direction.left);
    }
    var app = appTools.getApp();
    app.appInit.failWarningViewModelShow = function () {
        bindModel();
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.failWarningViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
