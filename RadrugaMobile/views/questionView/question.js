var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../../scripts/Storage", "../../scripts/Navigation", "../../scripts/ApplicationTools", "../../scripts/ServiceApi", "../../scripts/Enums", "../../scripts/models/User"], function (require, exports, storage, navigation, appTools, serviceApi, enums, usr) {
    "use strict";
    var QuestionViewModel = (function (_super) {
        __extends(QuestionViewModel, _super);
        function QuestionViewModel() {
            _super.call(this);
            this.questionNumber = 0;
            this.totalQuestionsNumber = 0;
            this.answersDataSource = [];
            this.questionText = "";
            this.questionsVisible = true;
            this.completeTextVisible = false;
            this._processStarted = false;
            this.completeTextRes = appTools.getText("questionSuccessText");
            this.fromRes = appTools.getText("cmFrom");
            _super.prototype.init.call(this, this);
        }
        QuestionViewModel.prototype.navigateToProfile = function () {
            backButtonCallback();
        };
        QuestionViewModel.prototype.answerChosen = function (event) {
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
            }
            else {
                this.bindQuestion(nextQuestion);
                this._processStarted = false;
            }
        };
        QuestionViewModel.prototype.loadQuestions = function () {
            var _this = this;
            if (usr.User.getFromStorage().radrugaColor) {
                this.showResult();
                return;
            }
            else {
                navigator.notification.alert(appTools.getText("questionDescription"), function () { }, appTools.getText("cmRadruga"), "OK");
            }
            var api = new serviceApi.ServiceApi();
            app.application.pane.showLoading();
            api.callService({
                method: "question?$expand=Options&$orderby=Name&$select=Text,Options",
                requestType: "GET"
            }).done(function (result) {
                _this.setAllQuestions(result);
                _this.setCurrentQuestionNumber(1);
                _this.bindCurrentQuestion();
            }).fail(function () {
                _this.handleFailure();
            });
        };
        QuestionViewModel.prototype.bindCurrentQuestion = function () {
            var allQuestions = this.getAllQuestions();
            this.set("totalQuestionsNumber", allQuestions.length);
            this.bindQuestion(allQuestions[this.getCurrentQuestionNumber() - 1]);
        };
        QuestionViewModel.prototype.submitLastQuestion = function () {
            var _this = this;
            this.clearQuestions();
            var api = new serviceApi.ServiceApi();
            var scoresArray = Object.keys(this.getCurrentScores()).map(function (key) {
                return {
                    "PersonQualityId": key,
                    "Score": _this.getCurrentScores()[key]
                };
            });
            api.callService({
                method: "question/PostQuestionsResults",
                requestType: "POST",
                data: JSON.stringify(scoresArray)
            }).done(function (result) {
                if (result.Status === 0) {
                    _this.showResult();
                    appTools.forceRebind("MissionChain", "Profile");
                    var user = usr.User.getFromStorage();
                    user.radrugaColor = result.Color;
                    usr.User.saveToStorage(user);
                    _this.clearScoresAndQuestionNumber();
                }
                else {
                    _this.handleFailure();
                    navigator.notification.alert(appTools.getText("cmApiError"), function () { }, result.Description, "OK");
                }
                _this._processStarted = false;
            }).fail(function () {
                _this.handleFailure();
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
                _this._processStarted = false;
            });
        };
        QuestionViewModel.prototype.getCurrentQuestionNumber = function () {
            return +storage.PermanentStorage.get("currentQuestionNumber");
        };
        QuestionViewModel.prototype.setCurrentQuestionNumber = function (value) {
            if (value != null)
                storage.PermanentStorage.set("currentQuestionNumber", value.toString());
        };
        QuestionViewModel.prototype.getCurrentScores = function () {
            return JSON.parse(storage.PermanentStorage.get("currentQuestionsScores")) || {};
        };
        QuestionViewModel.prototype.setCurrentScores = function (value) {
            if (value != null)
                storage.PermanentStorage.set("currentQuestionsScores", JSON.stringify(value));
        };
        QuestionViewModel.prototype.getAllQuestions = function () {
            return JSON.parse(storage.PermanentStorage.get("allQuestions"));
        };
        QuestionViewModel.prototype.setAllQuestions = function (value) {
            if (value != null)
                storage.PermanentStorage.set("allQuestions", JSON.stringify(value));
        };
        QuestionViewModel.prototype.clearQuestions = function () {
            storage.PermanentStorage.remove("allQuestions");
        };
        QuestionViewModel.prototype.clearScoresAndQuestionNumber = function () {
            storage.PermanentStorage.remove("currentQuestionsScores");
            storage.PermanentStorage.remove("currentQuestionNumber");
        };
        QuestionViewModel.prototype.handleFailure = function () {
            this.setCurrentQuestionNumber(-1);
        };
        QuestionViewModel.prototype.bindQuestion = function (nextQuestion) {
            this.set("questionNumber", this.getCurrentQuestionNumber());
            this.set("questionText", nextQuestion.Text);
            this.set("answersDataSource", nextQuestion.Options.map(function (option) {
                return {
                    "text": option.Text,
                    "personQualityId": option.PersonQualitiesWithScores[0].PersonQualityId,
                    "score": option.PersonQualitiesWithScores[0].Score
                };
            }));
        };
        QuestionViewModel.prototype.showResult = function () {
            this.set("completeTextVisible", true);
            this.set("questionsVisible", false);
        };
        return QuestionViewModel;
    }(kendo.data.ObservableObject));
    exports.QuestionViewModel = QuestionViewModel;
    var viewModel;
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
    app.appInit.questionViewModelInit = function () {
        bindModel();
    };
    app.appInit.questionViewModelShow = function () {
        if (appTools.rebindNeeded()) {
            bindModel();
        }
        if (viewModel.getCurrentQuestionNumber() === -1) {
            viewModel.submitLastQuestion();
        }
        document.addEventListener("backbutton", backButtonCallback, false);
    };
    app.appInit.questionViewModelHide = function () {
        document.removeEventListener("backbutton", backButtonCallback, false);
    };
});
