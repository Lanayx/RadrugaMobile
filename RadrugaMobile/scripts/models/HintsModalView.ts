import serviceApi = require("../../scripts/ServiceApi");
import appTools = require("../../scripts/ApplicationTools");
import mission = require("../../scripts/models/Mission");
import user = require("../../scripts/models/User");
import enums = require("../Enums");
import geoCoordinate = require("../../scripts/geoLocation/GeoCoordinate");
import navigation = require("../../scripts/Navigation");
import GeoTools = require("../../scripts/geoLocation/GeoTools");
import User = user.User;

export class HintsModalView extends kendo.data.ObservableObject {

    public static ModalViewId = "#vmHints";

    hints: mission.Hint[];
    isHintVisible: boolean;
    hintText: string;
    //resources
    modalTitleRes = appTools.getText("hintModalTitle");
    takeRes = appTools.getText("hintTake");
    showRes = appTools.getText("hintShow");

    private _missionId: string;
    private _missionAccuracyRadius: number;

    constructor(mission: mission.Mission) {
        super();
        this.hints = mission.hints;
        this._missionId = mission.id;
        this._missionAccuracyRadius = mission.accuracyRadius;
        super.init(this);
    }

    getHint(event) {

        var hint = <mission.Hint>event.data;

        if (hint.isPayed && hint.type == enums.HintType.Text) {
            this.calculateHintText(hint);
            this.showHint(hint.text);
        } else {
            var currentUser = user.User.getFromStorage();
            if (!currentUser.coinsCount || currentUser.coinsCount < hint.score) {
                this.showHint(appTools.getText("hintNotEnoughCoins"));
                return;
            }

            var api = new serviceApi.ServiceApi();
            appTools.getKendoApplication().showLoading();
            return api.callService({
                method: "mission/GetHint",
                requestType: "GET",
                data: {
                    missionId: this._missionId,
                    hintId: hint.id
                }
            }).done((result) => {
                if (result.Status == 0) {
                    hint.text = result.Hint;
                    if (!hint.isPayed) {
                        hint.isPayed = true;
                        currentUser.coinsCount = currentUser.coinsCount - hint.score;
                        User.saveToStorage(currentUser);
                        $("#hintsList").data('kendoMobileListView').refresh();
                        appTools.forceRebind("Account");
                    }
                    this.calculateHintText(hint).then(() => {
                        mission.Mission.updateMissionHint(hint);
                        this.showHint(hint.text);
                    });
                } else if (result.Status == 2 && result.RequestStatus == enums.HintRequestStatus.CommonPlaceNotExist) {
                    this.showHint(appTools.getText("hintTemporarilyUnavailable"));
                } else {
                    navigator.notification.alert(result.Description, () => { }, appTools.getText("cmApiErrorTitle"), "OK");
                }
            }).fail(() => {
                navigator.notification.alert(appTools.getText("cmApiError"), () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            }).always(() => {
                appTools.getKendoApplication().hideLoading();
            });
        }
    }

    closeModalView() {
        $(HintsModalView.ModalViewId).data('kendoMobileModalView').close();
        setTimeout(() => this.hideHint(), 500);//don't hide it before close animation finishes
    }

    private calculateHintText(hint: mission.Hint): JQueryDeferred<{}> {
        var deferred = $.Deferred();
        switch (hint.type) {
            case enums.HintType.Direction:
                {
                    geoCoordinate.GeoCoordinate.getCurrent()
                        .then(coordinate => {
                            var currentCoordinate = coordinate;
                            var missionCoordinate = geoCoordinate.GeoCoordinate.getFromString(hint.text);
                            currentCoordinate.getDistance(missionCoordinate).then((distance) => {
                                if (distance > this._missionAccuracyRadius) {
                                    var direction = GeoTools.getDirection(currentCoordinate, missionCoordinate);
                                    hint.text = appTools.getText("hint" + direction);
                                } else
                                    hint.text = appTools.getText("hintAlreadyArrived");
                                deferred.resolve();
                            });
                        }).fail(() => {
                            navigator.notification.alert(appTools.getText("geoCantObtainCoordinateMessage"), () => { }, appTools.getText("geoCantObtainCoordinateTitle"), "OK");
                            deferred.fail();
                        });
                    break;
                }
            default:
                {
                    deferred.resolve();
                }               
        }
        return deferred;
    }

    private showHint(hint: string) {
        this.set("isHintVisible", true);
        this.set("hintText", hint);
    }

    private hideHint() {
        this.set("isHintVisible", false);
        this.set("hintText", null);
    }
}