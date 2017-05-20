import navigation = require("../../../scripts/Navigation");
import appTools = require("../../../scripts/ApplicationTools");
import enums = require("../../../scripts/Enums");
import user = require("../../../scripts/models/User");

export interface IDisplayCoordinate {
    description: string;
    coordinate: string;
}

export class BaseLocationsViewModel extends kendo.data.ObservableObject {
    baseLocationsDataSource: IDisplayCoordinate[] = [];
    constructor() {
        super();
        super.init(this);
    }


    public onBinded() {
        var u = user.User.getFromStorage();
        if (u.homeCoordinate)
            this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsCommandPoint"), coordinate: `${u.homeCoordinate.latitude}, ${u.homeCoordinate.longitude}` });
        if (u.baseNorthCoordinate)
            this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsNorthPoint"), coordinate: `${u.baseNorthCoordinate.latitude}, ${u.baseNorthCoordinate.longitude}` });
        if (u.baseEastCoordinate)
            this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsEastPoint"), coordinate: `${u.baseEastCoordinate.latitude}, ${u.baseEastCoordinate.longitude}` });
        if (u.baseSouthCoordinate)
            this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsSouthPoint"), coordinate: `${u.baseSouthCoordinate.latitude}, ${u.baseSouthCoordinate.longitude}` });
        if (u.baseWestCoordinate)
            this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsWestPoint"), coordinate: `${u.baseWestCoordinate.latitude}, ${u.baseWestCoordinate.longitude}` });
        if (u.radarCoordinate)
            this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsRadar"), coordinate: `${u.radarCoordinate.latitude}, ${u.radarCoordinate.longitude}` });
        if (u.outpostCoordinate)
            this.baseLocationsDataSource.push({ description: appTools.getText("baseLocationsOutpost"), coordinate: `${u.outpostCoordinate.latitude}, ${u.outpostCoordinate.longitude}` });
    }
}

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
app.appInit.baseLocationsViewModelInit = () => {
    bindModel();
    bindBackButton();
};
app.appInit.baseLocationsViewModelShow = () => {
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.baseLocationsViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};


