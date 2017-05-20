var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../../scripts/ApplicationTools", "../../../scripts/Navigation", "../../../scripts/Enums", "../../../scripts/ServiceApi", "../../../scripts/models/Mission", "../../../scripts/Storage", "../../../scripts/models/HintsModalView"], function (require, exports, appTools, navigation, enums, serviceApi, miss, storage, modalView) {
    "use strict";
    var showTries;
    var RightAnswerModel = (function (_super) {
        __extends(RightAnswerModel, _super);
        function RightAnswerModel() {
            _super.call(this);
            this.missionId = "";
            this.missionName = "";
            this.missionImagePath = "";
            this.congratMessage = "";
            this.isHasHints = false;
            this.isMultiAnswer = false;
            this.answersSource = [];
            this._processStarted = false;
            this.checkAnswerButtonRes = appTools.getText("slnCheckAnswer");
            this.fromRes = appTools.getText("cmFrom");
            this.tryRes = appTools.getText("rightAnswerTry");
            this.enterAnswerRes = appTools.getText("cmEnterAnswer");
            _super.prototype.init.call(this, this);
        }
        RightAnswerModel.prototype.onBack = function () {
            backButtonCallback();
        };
        RightAnswerModel.prototype.onCheckAnswer = function () {
            var _this = this;
            var answerToSend = "";
            if (this.isMultiAnswer) {
                for (var _i = 0, _a = this.answersSource; _i < _a.length; _i++) {
                    var answer = _a[_i];
                    if (!answer.value || answer.value === "") {
                        return;
                    }
                    answerToSend += this.replaceAll(answer.value, ";", ",") + ";";
                }
                answerToSend = answerToSend.substring(0, answerToSend.length - 1);
            }
            else {
                var value = this.get("answer");
                if (!value) {
                    return;
                }
                answerToSend = this.replaceAll(value, ";", ",");
            }
            if (this._processStarted)
                return;
            else
                this._processStarted = true;
            var missionProof = {
                CreatedText: answerToSend
            };
            var api = new serviceApi.ServiceApi();
            api.callService({
                method: "mission/CompleteMission?missionId=" + this.get("missionId"),
                requestType: "POST",
                data: JSON.stringify(missionProof)
            }).done(function (result) {
                if (result.Status === 0) {
                    switch (result.MissionCompletionStatus) {
                        case enums.MissionCompletionStatus.Success:
                            navigation.navigateToSucessView(enums.Direction.right, {
                                missionId: _this.get("missionId"),
                                imageUrl: _this.get("missionImagePath"),
                                experiencePoints: result.Points,
                                missionName: _this.get("missionName"),
                                starsCount: result.StarsCount,
                                congratsMessage: _this.get("congratsMessage")
                            });
                            break;
                        case enums.MissionCompletionStatus.Fail:
                            navigation.navigateToFailView(enums.Direction.right, {
                                missionId: _this.get("missionId"),
                                imageUrl: _this.get("missionImagePath"),
                                missionName: _this.get("missionName")
                            });
                            break;
                        case enums.MissionCompletionStatus.IntermediateFail:
                            if (_this.isMultiAnswer) {
                                var answerStatuses = result.AnswerStatuses;
                                for (var i = 0; i < _this.answersSource.length; i++) {
                                    var current = _this.answersSource[i];
                                    current.validationClass = answerStatuses[i];
                                    _this.answersSource.splice(i, 1, current);
                                }
                                navigator.notification.alert(appTools.getText("rightAnswerPartialIncorrectMessage"), function () { }, appTools.getText("rightAnswerIncorrectTitle"), "OK");
                            }
                            else {
                                navigator.notification.alert(appTools.getText("rightAnswerIncorrectMessage"), function () { }, appTools.getText("rightAnswerIncorrectTitle"), "OK");
                            }
                            var currentyTry = result.TryCount + 1;
                            _this.set("currentTry", currentyTry);
                            miss.Mission.setCurrentMissionTryCount(currentyTry);
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
        RightAnswerModel.prototype.textChange = function (event) {
            var i = +$(event.target).data("index");
            if (this.answersSource && this.answersSource[i] !== undefined) {
                var current = this.answersSource[i];
                current.validationClass = "";
                this.answersSource.splice(i, 1, current);
            }
        };
        RightAnswerModel.prototype.onBinded = function () {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
            this.set("missionImagePath", "url(" + model.imageUrl + ")");
            this.set("missionName", model.name);
            this.set("currentTry", model.currentTry);
            this.set("maxTries", model.maxTries);
            this.set("answersCount", model.answersCount);
            this.set("missionId", model.id);
            this.set("congratsMessage", model.congratMessage);
            this.set("triesVisibility", showTries ? "visible" : "hidden");
            this.setMultiAnswerSource(model);
            this.set("isHasHints", model.hints.length > 0);
            var hintsModalViewModel = new modalView.HintsModalView(model);
            kendo.bind($(modalView.HintsModalView.ModalViewId), hintsModalViewModel, kendo.mobile.ui);
        };
        RightAnswerModel.prototype.openHintModal = function () {
            $(modalView.HintsModalView.ModalViewId).data("kendoMobileModalView").open();
        };
        RightAnswerModel.prototype.setMultiAnswerSource = function (model) {
            if (model.answersCount > 1) {
                this.set("isMultiAnswer", true);
                for (var i = 0; i < model.answersCount; i++) {
                    this.answersSource.push({ validationClass: "", index: i });
                }
            }
        };
        RightAnswerModel.prototype.escapeRegExp = function (string) {
            return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        };
        RightAnswerModel.prototype.replaceAll = function (src, find, replace) {
            return src.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
        };
        return RightAnswerModel;
    }(kendo.data.ObservableObject));
    exports.RightAnswerModel = RightAnswerModel;
    function bindModel() {
        var model = new RightAnswerModel();
        kendo.bind($("#vRightAnswerSolution"), model, kendo.mobile.ui);
        model.onBinded();
        appTools.viewBinded();
    }
    function backButtonCallback() {
        navigation.navigateToMissionView(enums.Direction.right);
    }
    function init(data) {
        if (!data) {
            showTries = true;
            return;
        }
        showTries = !(data.showTries === false);
    }
    exports.init = init;
    var app = appTools.getApp();
    app.appInit.rightAnswerViewModelInit = function () {
        bindModel();
    };
    app.appInit.rightAnswerViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.rightAnswerViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
