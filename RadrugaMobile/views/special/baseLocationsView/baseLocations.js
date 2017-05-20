var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/Navigation", "../../../scripts/ApplicationTools", "../../../scripts/Enums", "../../../scripts/models/User"], function (require, exports, navigation, appTools, enums, user) {
    "use strict";
    var BaseLocationsViewModel = (function (_super) {
        __extends(BaseLocationsViewModel, _super);
        function BaseLocationsViewModel() {
            _super.call(this);
            this.baseLocationsDataSource = [];
            _super.prototype.init.call(this, this);
        }
        BaseLocationsViewModel.prototype.onBinded = function () {
            var u = user.User.getFromStorage();
            if (u.homeCoordinate)
                this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsCommandPoint"), coordinate: u.homeCoordinate.latitude + ", " + u.homeCoordinate.longitude });
            if (u.baseNorthCoordinate)
                this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsNorthPoint"), coordinate: u.baseNorthCoordinate.latitude + ", " + u.baseNorthCoordinate.longitude });
            if (u.baseEastCoordinate)
                this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsEastPoint"), coordinate: u.baseEastCoordinate.latitude + ", " + u.baseEastCoordinate.longitude });
            if (u.baseSouthCoordinate)
                this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsSouthPoint"), coordinate: u.baseSouthCoordinate.latitude + ", " + u.baseSouthCoordinate.longitude });
            if (u.baseWestCoordinate)
                this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsWestPoint"), coordinate: u.baseWestCoordinate.latitude + ", " + u.baseWestCoordinate.longitude });
            if (u.radarCoordinate)
                this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsRadar"), coordinate: u.radarCoordinate.latitude + ", " + u.radarCoordinate.longitude });
            if (u.outpostCoordinate)
                this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsOutpost"), coordinate: u.outpostCoordinate.latitude + ", " + u.outpostCoordinate.longitude });
        };
        return BaseLocationsViewModel;
    }(kendo.data.ObservableObject));
    exports.BaseLocationsViewModel = BaseLocationsViewModel;
    function bindBackButton() {
        $("#vBaseLocations").on("click", ".closeIcon", backButtonCallback);
    }
    function bindModel() {
        var model = new BaseLocationsViewModel();
        kendo.bind($("#vBaseLocations"), model, kendo.mobile.ui);
        model.onBinded();
    }
    function backButtonCallback() {
        navigation.navigateToProfileView(enums.Direction.up);
    }
    var app = appTools.getApp();
    app.appInit.baseLocationsViewModelInit = function () {
        bindModel();
        bindBackButton();
    };
    app.appInit.baseLocationsViewModelShow = function () {
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.baseLocationsViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
