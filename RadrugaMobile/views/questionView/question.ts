/// <reference path="../../kendo/typescript/kendo.mobile.d.ts" />
import storage = require("../../scripts/Storage");
import wsInterfaces = require("../../scripts/models/WsInterfaces");
import navigation = require("../../scripts/Navigation");
import appTools = require("../../scripts/ApplicationTools");
import serviceApi = require("../../scripts/ServiceApi");
import enums = require("../../scripts/Enums");
import usr = require("../../scripts/models/User");

export class QuestionViewModel extends kendo.data.ObservableObject {
    questionNumber = 0;
    totalQuestionsNumber = 0;
    answersDataSource = [];
    questionText = "";
    questionsVisible = true;
    completeTextVisible = false;

    private _processStarted = false;

    //resources 
    completeTextRes = appTools.getText("questionSuccessText");
    fromRes = appTools.getText("cmFrom");

    constructor() {
        super();
        super.init(this);
    }


    navigateToProfile() {
        backButtonCallback();
    }

    answerChosen(event) {
        //prevent double clicking
        if (this._processStarted)
            return;
        else
            this._processStarted = true;

        var answerQuality = event.data.personQualityId;
        var answerScore = event.data.score;
       
        if (this.getCurrentQuestionNumber() === -1) {
            this.submitLastQuestion();
            return;
        }

        var currentScores = this.getCurrentScores();
        currentScores[answerQuality] =
            currentScores[answerQuality] === undefined ?
            answerScore :
            currentScores[answerQuality] + answerScore;

        this.setCurrentScores(currentScores);
        this.setCurrentQuestionNumber(this.getCurrentQuestionNumber() + 1);

        var nextQuestion = this.getAllQuestions()[this.getCurrentQuestionNumber() - 1];
        if (nextQuestion === undefined || nextQuestion === null) {
            this.submitLastQuestion();
        } else {
            this.bindQuestion(nextQuestion);
            this._processStarted = false;
        }

    }

    loadQuestions() {
        if (usr.User.getFromStorage().radrugaColor) {
            this.showResult();
            return;
        } else {
            navigator.notification.alert(appTools.getText("questionDescription"),
                () => { }, appTools.getText("cmRadruga"), "OK");
        }

        var api = new serviceApi.ServiceApi();
        app.application.pane.showLoading(); //hotfix for not showing loader
        api.callService({
            method: "question?$expand=Options&$orderby=Name&$select=Text,Options",
            requestType: "GET"
        }).done((result) => {
            this.setAllQuestions(result);
            this.setCurrentQuestionNumber(1);
            this.bindCurrentQuestion();
        }).fail(() => {
            this.handleFailure();
        });
    }

    bindCurrentQuestion() {
        var allQuestions = this.getAllQuestions();
        this.set("totalQuestionsNumber", allQuestions.length);
        this.bindQuestion(allQuestions[this.getCurrentQuestionNumber() - 1]);
    }

    submitLastQuestion() {
        this.clearQuestions();
        var api = new serviceApi.ServiceApi();
        var scoresArray: wsInterfaces.IPersonQualityWithScore[] = Object.keys(this.getCurrentScores()).map((key) => {
            return {
                "PersonQualityId": key,
                "Score": this.getCurrentScores()[key]
            };
        });

        api.callService({
            method: "question/PostQuestionsResults",
            requestType: "POST",
            data: JSON.stringify(scoresArray)
        }).done((result) => {
            if (result.Status === 0) {
                this.showResult();
                appTools.forceRebind("MissionChain", "Profile");
                

                //updating user color
                var user = usr.User.getFromStorage();
                user.radrugaColor = result.Color;
                usr.User.saveToStorage(user);

                this.clearScoresAndQuestionNumber();
            } else {
                this.handleFailure();
                navigator.notification.alert(appTools.getText("cmApiError"),
                    () => { }, result.Description, "OK");
            }
            this._processStarted = false;
        }).fail(() => {
            this.handleFailure();
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
            this._processStarted = false;
        });
    }


    getCurrentQuestionNumber(): number {
        return +storage.PermanentStorage.get("currentQuestionNumber");
    }

    setCurrentQuestionNumber(value: number) {
        if (value != null)
            storage.PermanentStorage.set("currentQuestionNumber", value.toString());
    }

    getCurrentScores(): { [quality: string]: number; } {
        return JSON.parse(storage.PermanentStorage.get("currentQuestionsScores")) || {};
    }

    setCurrentScores(value: { [quality: string]: number; }) {
        if (value != null)
            storage.PermanentStorage.set("currentQuestionsScores", JSON.stringify(value));
    }

    getAllQuestions(): wsInterfaces.IQuestion[] {
        return JSON.parse(storage.PermanentStorage.get("allQuestions"));
    }

    setAllQuestions(value: wsInterfaces.IQuestion[]) {
        if (value != null)
            storage.PermanentStorage.set("allQuestions", JSON.stringify(value));
    }

    //---------------------


    private clearQuestions(): void {
        storage.PermanentStorage.remove("allQuestions");
    }

    private clearScoresAndQuestionNumber(): void {
        storage.PermanentStorage.remove("currentQuestionsScores");
        storage.PermanentStorage.remove("currentQuestionNumber");
    }

    private handleFailure() {
        this.setCurrentQuestionNumber(-1); //indicator of the error
    }

    private bindQuestion(nextQuestion: wsInterfaces.IQuestion) {
        this.set("questionNumber", this.getCurrentQuestionNumber());
        this.set("questionText", nextQuestion.Text);
        this.set("answersDataSource", nextQuestion.Options.map(option => {
            //currently each answer should have only one person quality with score
            return {
                "text": option.Text,
                "personQualityId": option.PersonQualitiesWithScores[0].PersonQualityId,
                "score": option.PersonQualitiesWithScores[0].Score
            };
        }));
    }

    private showResult() {
        this.set("completeTextVisible", true);
        this.set("questionsVisible", false);
    }
}


var viewModel: QuestionViewModel;
function bindModel() {
    viewModel = new QuestionViewModel();
    kendo.bind($("#vQuestion"), viewModel, kendo.mobile.ui);
    if (viewModel.getCurrentQuestionNumber() !== -1) {
        var allQuestions = viewModel.getAllQuestions();
        if (allQuestions && allQuestions[0])
            viewModel.bindCurrentQuestion();
        else
            viewModel.loadQuestions();
    }
    appTools.viewBinded();
}

function backButtonCallback() {
    navigation.navigateToProfileView(enums.Direction.up);
}

var app = appTools.getApp();
app.appInit.questionViewModelInit = () => {
    bindModel();
};

app.appInit.questionViewModelShow = () => {
    if (appTools.rebindNeeded()) {
        bindModel();
    }
    if (viewModel.getCurrentQuestionNumber() === -1) {
        viewModel.submitLastQuestion();
    }
    document.addEventListener("backbutton", backButtonCallback, false);
};
app.appInit.questionViewModelHide = () => {
    document.removeEventListener("backbutton", backButtonCallback, false);
};