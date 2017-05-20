import appTools = require("../../../scripts/ApplicationTools");
import navigation = require("../../../scripts/Navigation");
import wsInterfaces = require("../../../scripts/models/WsInterfaces");
import enums = require("../../../scripts/Enums");
import serviceApi = require("../../../scripts/ServiceApi");
import miss = require("../../../scripts/models/Mission");
import storage = require("../../../scripts/Storage");
import interfaces = require("../../../scripts/Interfaces");
import modalView = require("../../../scripts/models/HintsModalView");

export interface IMultiAnswer {
    value?: string;
    validationClass: string;
    index: number;
}


var showTries: boolean;
export class RightAnswerModel extends kendo.data.ObservableObject {

    missionId = "";
    missionName = "";
    missionImagePath = "";
    congratMessage = "";
    isHasHints = false;
    maxTries: number;
    currentTry: number;
    answer: string;
    answersCount: number;
    isMultiAnswer: boolean = false;
    answersSource: IMultiAnswer[] = [];

    private _processStarted = false;

    //labels below
    checkAnswerButtonRes = appTools.getText("slnCheckAnswer");
    fromRes = appTools.getText("cmFrom");
    tryRes = appTools.getText("rightAnswerTry");
    enterAnswerRes = appTools.getText("cmEnterAnswer");

    constructor() {
        super();
        super.init(this);
    }

    onBack() {
        backButtonCallback();
    }

    onCheckAnswer() {
        var answerToSend = "";
        if (this.isMultiAnswer) {
            for (let answer of this.answersSource) {
                if (!answer.value || answer.value === "") {
                    return;
                }
                answerToSend += this.replaceAll(answer.value, ";", ",") + ";";
            }
            answerToSend = answerToSend.substring(0, answerToSend.length - 1);
        } else {
            var value = this.get("answer");
            if (!value) {
                return;
            }
            answerToSend = this.replaceAll(value, ";", ",");
        }

        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;


        var missionProof: wsInterfaces.IMissionProof = {
            CreatedText: answerToSend
        };

        var api = new serviceApi.ServiceApi();
        api.callService({
            method: `mission/CompleteMission?missionId=${this.get("missionId") }`,
            requestType: "POST",
            data: JSON.stringify(missionProof)
        }).done((result) => {
            if (result.Status === 0) {
                switch (result.MissionCompletionStatus) {
                    case enums.MissionCompletionStatus.Success:
                        navigation.navigateToSucessView(enums.Direction.right, {
                            missionId: this.get("missionId"),
                            imageUrl: this.get("missionImagePath"),
                            experiencePoints: result.Points,
                            missionName: this.get("missionName"),
                            starsCount: result.StarsCount,
                            congratsMessage: this.get("congratsMessage")
                        });
                        break;
                    case enums.MissionCompletionStatus.Fail:
                        navigation.navigateToFailView(enums.Direction.right, {
                            missionId: this.get("missionId"),
                            imageUrl: this.get("missionImagePath"),
                            missionName: this.get("missionName")
                        });
                        break;
                    case enums.MissionCompletionStatus.IntermediateFail:
                        if (this.isMultiAnswer) {
                            var answerStatuses = result.AnswerStatuses;
                            for (var i = 0; i < this.answersSource.length; i++) {
                                var current = this.answersSource[i];
                                current.validationClass = answerStatuses[i];
                                this.answersSource.splice(i, 1, current);
                            }

                            navigator.notification.alert(appTools.getText("rightAnswerPartialIncorrectMessage"),
                                () => { }, appTools.getText("rightAnswerIncorrectTitle"), "OK");
                        } else {
                            navigator.notification.alert(appTools.getText("rightAnswerIncorrectMessage"),
                                () => { }, appTools.getText("rightAnswerIncorrectTitle"), "OK");
                        }
                        var currentyTry = result.TryCount + 1;
                        this.set("currentTry", currentyTry);
                        miss.Mission.setCurrentMissionTryCount(currentyTry);
                        break;
                }
            } else
                navigator.notification.alert(result.Description,
                    () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        }).fail(() => {
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        });
    }

    textChange(event: Event) {
        var i = +$(event.target).data("index");
        if (this.answersSource && this.answersSource[i] !== undefined) {
            var current = this.answersSource[i];
            current.validationClass = "";
            this.answersSource.splice(i, 1, current);
        }

    }

    onBinded() {
        var model: miss.Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
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
    }

    openHintModal() {
        $(modalView.HintsModalView.ModalViewId).data("kendoMobileModalView").open();
    }

    private setMultiAnswerSource(model: miss.Mission) {
        if (model.answersCount > 1) {
            this.set("isMultiAnswer", true);
            for (let i = 0; i < model.answersCount; i++) {
                this.answersSource.push({ validationClass: "", index: i });
            }
        }
    }

    private escapeRegExp(string) {
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }

    private replaceAll(src, find, replace) {
        return src.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
    }
}

function bindModel() {
    var model = new RightAnswerModel();
    kendo.bind($("#vRightAnswerSolution"), model, kendo.mobile.ui);
    model.onBinded();
    appTools.viewBinded();
}

function backButtonCallback() {
    navigation.navigateToMissionView(enums.Direction.right);
}

export function init(data: interfaces.ITriesNavigationProperties) {
    if (!data) {
        showTries = true;
        return;
    }
    showTries = !(data.showTries === false);
}


var app = appTools.getApp();
app.appInit.rightAnswerViewModelInit = () => {
    bindModel();
};

app.appInit.rightAnswerViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.rightAnswerViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};