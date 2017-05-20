var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/Navigation", "../../../scripts/ApplicationTools", "../../../scripts/Enums"], function (require, exports, navigation, appTools, enums) {
    var AboutViewModel = (function (_super) {
        __extends(AboutViewModel, _super);
        function AboutViewModel() {
            _super.call(this);
            //resources 
            this.vkGroupRes = appTools.getText("aboutVkGroup");
            _super.prototype.init.call(this, this);
        }
        return AboutViewModel;
    })(kendo.data.ObservableObject);
    exports.AboutViewModel = AboutViewModel;
    function bindBackButton() {
        $("#vAbout").on("click", ".backIcon", backButtonCallback);
    }
    function bindModel() {
        var viewModel = new AboutViewModel();
        kendo.bind($("#vAbout"), viewModel, kendo.mobile.ui);
    }
    function backButtonCallback() {
        navigation.navigateToSettingsView(enums.Direction.left);
    }
    var app = appTools.getApp();
    app.appInit.aboutViewModelInit = function () {
        bindModel();
        bindBackButton();
    };
    app.appInit.aboutViewModelShow = function () {
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.aboutViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
