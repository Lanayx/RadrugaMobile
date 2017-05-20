var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../scripts/ServiceApi", "../../scripts/ApplicationTools", "../../scripts/models/Mission", "../../scripts/models/User", "../Enums", "../../scripts/geoLocation/GeoCoordinate", "../../scripts/geoLocation/GeoTools"], function (require, exports, serviceApi, appTools, mission, user, enums, geoCoordinate, GeoTools) {
    "use strict";
    var User = user.User;
    var HintsModalView = (function (_super) {
        __extends(HintsModalView, _super);
        function HintsModalView(mission) {
            _super.call(this);
            //resources
            this.modalTitleRes = appTools.getText("hintModalTitle");
            this.takeRes = appTools.getText("hintTake");
            this.showRes = appTools.getText("hintShow");
            this.hints = mission.hints;
            this._missionId = mission.id;
            this._missionAccuracyRadius = mission.accuracyRadius;
            _super.prototype.init.call(this, this);
        }
        HintsModalView.prototype.getHint = function (event) {
            var _this = this;
            var hint = event.data;
            if (hint.isPayed && hint.type == enums.HintType.Text) {
                this.calculateHintText(hint);
                this.showHint(hint.text);
            }
            else {
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
                }).done(function (result) {
                    if (result.Status == 0) {
                        hint.text = result.Hint;
                        if (!hint.isPayed) {
                            hint.isPayed = true;
                            currentUser.coinsCount = currentUser.coinsCount - hint.score;
                            User.saveToStorage(currentUser);
                            $("#hintsList").data('kendoMobileListView').refresh();
                            appTools.forceRebind("Account");
                        }
                        _this.calculateHintText(hint).then(function () {
                            mission.Mission.updateMissionHint(hint);
                            _this.showHint(hint.text);
                        });
                    }
                    else if (result.Status == 2 && result.RequestStatus == enums.HintRequestStatus.CommonPlaceNotExist) {
                        _this.showHint(appTools.getText("hintTemporarilyUnavailable"));
                    }
                    else {
                        navigator.notification.alert(result.Description, function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                    }
                }).fail(function () {
                    navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                }).always(function () {
                    appTools.getKendoApplication().hideLoading();
                });
            }
        };
        HintsModalView.prototype.closeModalView = function () {
            var _this = this;
            $(HintsModalView.ModalViewId).data('kendoMobileModalView').close();
            setTimeout(function () { return _this.hideHint(); }, 500); //don't hide it before close animation finishes
        };
        HintsModalView.prototype.calculateHintText = function (hint) {
            var _this = this;
            var deferred = $.Deferred();
            switch (hint.type) {
                case enums.HintType.Direction:
                    {
                        geoCoordinate.GeoCoordinate.getCurrent()
                            .then(function (coordinate) {
                            var currentCoordinate = coordinate;
                            var missionCoordinate = geoCoordinate.GeoCoordinate.getFromString(hint.text);
                            currentCoordinate.getDistance(missionCoordinate).then(function (distance) {
                                if (distance > _this._missionAccuracyRadius) {
                                    var direction = GeoTools.getDirection(currentCoordinate, missionCoordinate);
                                    hint.text = appTools.getText("hint" + direction);
                                }
                                else
                                    hint.text = appTools.getText("hintAlreadyArrived");
                                deferred.resolve();
                            });
                        }).fail(function () {
                            navigator.notification.alert(appTools.getText("geoCantObtainCoordinateMessage"), function () { }, appTools.getText("geoCantObtainCoordinateTitle"), "OK");
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
        };
        HintsModalView.prototype.showHint = function (hint) {
            this.set("isHintVisible", true);
            this.set("hintText", hint);
        };
        HintsModalView.prototype.hideHint = function () {
            this.set("isHintVisible", false);
            this.set("hintText", null);
        };
        HintsModalView.ModalViewId = "#vmHints";
        return HintsModalView;
    }(kendo.data.ObservableObject));
    exports.HintsModalView = HintsModalView;
});
