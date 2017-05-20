var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../scripts/ApplicationTools", "../../scripts/Navigation", "../../scripts/Enums", "../../scripts/models/User"], function (require, exports, appTools, navigation, enums, usr) {
    "use strict";
    var AccountViewModel = (function (_super) {
        __extends(AccountViewModel, _super);
        function AccountViewModel() {
            _super.call(this);
            _super.prototype.init.call(this, this);
        }
        AccountViewModel.prototype.load = function () {
            console.log("start load");
            var user = usr.User.getFromStorage();
            this.set("coinsCount", user.coinsCount || 0);
            this.set("coinsDescription", appTools.getText("accountCoinsDescription"));
        };
        return AccountViewModel;
    }(kendo.data.ObservableObject));
    exports.AccountViewModel = AccountViewModel;
    function bindCloseButton() {
        $("#vAccount").on("click", ".closeIcon", backButtonCallback);
    }
    function bindModel() {
        var viewModel = new AccountViewModel();
        kendo.bind($("#vAccount"), viewModel, kendo.mobile.ui);
        viewModel.load();
        appTools.viewBinded();
    }
    function backButtonCallback() {
        navigation.navigateToProfileView(enums.Direction.up);
    }
    var app = appTools.getApp();
    app.appInit.accountViewModelInit = function () {
        bindModel();
        bindCloseButton();
    };
    app.appInit.accountViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.accountViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
