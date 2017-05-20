define(["require", "exports"], function (require, exports) {
    "use strict";
    function getDictionary() {
        return {
            //common
            "cmAchievements": "Ачивки",
            "cmAllFieldsAreRequired": "Все поля обязательны",
            "cmApiError": "Сервер временно недоступен",
            "cmClientError": "Произошла ошибка приложения, попробуй перезапустить игру.",
            "cmApiErrorTitle": "Ошибка сервера",
            "cmApprovalCode": "Код подтверждения",
            "cmBack": "Назад",
            "cmCancel": "Отмена",
            "cmDetails": "Детали",
            "cmDifficulty": "Сложность",
            "cmExperienceR": " опыта",
            "cmFrom": "из",
            "cmGoToMissions": "Вернуться к миссиям",
            "cmKindScale": "Доброта",
            "cmKindActions": "Добрые дела",
            "cmLevel": "Уровень",
            "cmLoading": "Загрузка...",
            "cmLogin": "Вход",
            "cmMission": "Миссия",
            "cmMissions": "Миссии",
            "cmNext": "Далее",
            "cmNickName": "Никнэйм",
            "cmPassword": "Пароль",
            "cmProfile": "Профиль",
            "cmRadruga": "Радруга",
            "cmRadrugaColor": "Цвет Радруги",
            "cmRating": "Рейтинг",
            "cmReady": "Готово",
            "cmRegistration": "Регистрация",
            "cmRetakePhoto": "Переснять",
            "cmSend": "Отправить",
            "cmSettings": "Настройки",
            "cmVkError": "Ошибка Вконтакте",
            "cmEnterAnswer": "Введи ответ",
            "cmSec": "сек.",
            "cmWarning": "Внимание",
            //location module
            "geoCantObtainCoordinateTitle": "Ошибка геолокации",
            "geoCantObtainCoordinateMessage": "Невозможно получить местоположение. Попробуй \r\n1)проверить наличие интернета и включен ли GPS \r\n2)перезагрузить приложение \r\n3)попытаться еще раз через 10 минут \r\n4)перезагрузить устройство",
            //enterView
            "enterLoginWithEmail": "Войти с помощью Email",
            "enterVkLoginOrRegister": "Войти через Вконтакте",
            "enterVkRegisterFail": "К сожалению, в данный момент невозможно зарегистрироваться через Vk, используй регистрацию через email или попробуй позже.",
            "enterVkGetProfileIncorrect": "Мы не можем получить данные из профиля Vk",
            //loginView
            "loginForgotPassword": "Забыл(а) пароль?",
            "loginLoginError": "Ошибка логина",
            "loginWrongCredentials": "Неверные логин и пароль",
            //registerView
            "registerApprovalFailed": "Ошибка подтверждения",
            "registerApprovalHeader": "Код подтверждения в течение 2х минут будет выслан на почту ",
            "registerApprovalNotify": "(если  письмо не придет, проверь папку 'Спам')",
            "registerInvalidEmail": "Неверный емейл",
            "registerInvalidPassword": "Слишком короткий пароль",
            "registerRegistrationFailed": "Ошибка регистрации",
            "registerResendCode": "Повторить отправку",
            //requiredFieldsView
            "requiredFieldsDateOfBirth": "Дата рождения",
            "requiredFieldsSex": "Пол",
            "requiredFieldsMale": "Мужской",
            "requiredFieldsFemale": "Женский",
            //missionChainView
            "chainMissionInaccessibleTitle": "Миссия недоступна",
            "chainMissionSucceeded": "Ты уже прошел эту миссию!",
            "chainMissionFailed": "Кажется, в прошлом твои попытки пройти эту миссию не увенчались успехом. Попробуй что-нибудь другое.",
            "chainMissionNotAvailable": "Чтобы приступить к этой миссии, придется сначала выполнить миссию ",
            "chainMissionNotAvailableMultipleDependency": "Чтобы приступить к этой миссии, придется сначала выполнить миссии ",
            "chainMissionWaiting": "Ты уже прошел эту миссию, и она все еще проверяется. А пока можешь приступить к выполнению других :)",
            "chainTestRequired": "Сейчас тебе нужно пройти тесты и получить свой начальный цвет Радруги. После этого ты сможешь приступить к новым миссиям.",
            "chainFinished": "Ты завершил все миссии! Вступай в нашу группу Вконтакте и следи за обновлениями!",
            "chainNoMissions": "Нет доступных миссий",
            //missionView
            "missionViewOnSurrenderMessage": "Переходим к следующей.",
            "missionViewOnSurrenderTitle": "Отказ от миссии",
            "missionViewIncorrectSolutionTypeMessage": "Неверный тип миссии.",
            "missionViewIncorrectSolutionTypeTitle": "Внутренняя ошибка",
            "missionViewSurrender": "Сдаюсь",
            "missionSolve": "Выполнить",
            //cameraView
            "cameraErrorTitle": "Съемка не удалась",
            //rightAnswerView
            "rightAnswerIncorrectTitle": "Неверный ответ",
            "rightAnswerIncorrectMessage": "Попробуй еще раз.",
            "rightAnswerPartialIncorrectMessage": "Не все ответы верны. Попробуй еще раз.",
            "rightAnswerTry": "Попытка",
            //solutions common
            "slnSendForApproval": "Отправить на проверку",
            "slnApprovalMessage": "Мы пришлем тебе подверждение, как только запрос будет обработан.",
            "slnApprovalTitle": "Запрос отправлен",
            "slnTriesLeft": "Осталось попыток: ",
            "slnCheckAnswer": "Проверить ответ",
            //profileView
            "profileMissions": "Миссии",
            "profileKindActions": "Добрые дела",
            "profileMoneyAccount": "Счет монет",
            "profileOpenLocations": "Открытые локации",
            //profileReadView
            //kindActionNew
            "kindActionNewComplete": "Я сделал это!",
            "kindActionNewDescription": "Что я сделал сегодня хорошего?",
            "kindActionNewCompleted": "Доброе дело засчитано!",
            "kindActionNewAnotherAction": "Ещё одно доброе дело",
            "kindActionNewValidationShort": "А расскажи о своем добром деле подробнее!",
            "kindActionNewValidationLong": "Попробуй немного сократить рассказ!",
            "kindActionNewReward": "к шкале добра",
            "kindActionNewCoins": "монеты",
            //kindActionList
            "kindActionListHistory": "История",
            //kindActionRead
            "kindActionReadLike": "Молодец",
            "kindActionReadDislike": "Не пойдет",
            //settingsView
            "settingsAttachVk": "Привяжи аккаунт Вконтакте",
            "settingsAttachEmail": "Укажи свой email",
            "settingsChangePassword": "Сменить пароль",
            "settingsEnableNotifications": "Уведомления",
            "settingsMessageForDevelopers": "Сообщение для разработчиков",
            "settingsAbout": "О программе",
            "settingsLogout": "Выйти из аккаунта",
            "settingsPushAfterRestart": "Для правильной работы уведомлений нужно перезапустить игру",
            //feedBackMessageView
            "feedbackMessageDescription": "Твое сообщение для нас",
            "feedbackSent": "Спасибо за обратную связь! Ты можешь писать нам и дальше в любое время",
            //successView
            "sucessMissionCompleted": "Миссия выполнена!",
            "sucessShareInVk": "Поделись успехом Vk",
            "sucessShareMessage": "Ахаха! Я снова прокачался и позади пройденная миссия ",
            "successVkShareFail": "Ошибка добавления поста Vk",
            "sucessRateAppDescription": "Ты прошел уже 5 миссий! Поблагодари Радругу, оценив ее в магазине приложений!",
            "sucessRateAppTitle": "Оцени Радругу",
            "sucessRateAppYes": "Отлично",
            "sucessRateAppLater": "Позже",
            //failView
            "failMissionFailed": "Миссия провалена.",
            "failMessage": "Но не печалься! Впереди тебя ждут новые мисии.",
            //failWarningView
            "failWarningMessage": "Если ты откажешься от миссии сейчас, то не сможешь больше выполнить ее и все зависимые от нее миссии. Ты уверен, что хочешь отказаться?",
            "failWarningTitle": "Постой!",
            "failWarningGoToMission": "Вернуться",
            "failWarningGoToFail": "Отказаться",
            //waitView
            "waitMessage": "После подтверждения тебе придет уведомление. А пока ты можешь приступить к выполнению других миссий :)",
            "waitMessageWithReminder": "Чтобы сразу же узнать о результате, включи уведомления в настройках. А пока, ты можешь приступить к выполнению других миссий :)",
            "waitTitle": "Миссия проверяется!",
            "waitGoToSettings": "К настройкам",
            //questionView
            "questionSuccessText": "Ура! Ты открыл новые миссии и заработал собственный цвет! Теперь работай над его осветлением, проходя миссии и делая добрые дела. P.S. Взгляни на подложку меню",
            "questionDescription": "Для того, чтобы открыть свой цвет, ты должен вдумчиво ответить на все вопросы! (не обязательно за один присест)",
            //aboutView
            "aboutVkGroup": "Наша группа Вконтакте",
            //addEmailView
            "addEmailHeader": "Дополнительный логин:",
            "addEmailAddCompleted": "Ты успешно добавил свой почтовый адрес, теперь можешь использовать его для входа в игру.",
            "addEmailAddFailed": "Ошибка добавления email",
            //ratingView
            "ratingPoints1": "очко",
            "ratingPoints2_4": "очка",
            "ratingPoints5_0": "очков",
            "ratingPlayers1": "игрок",
            "ratingPlayers2_4": "игрока",
            "ratingPlayers5_0": "игроков",
            "ratingPlace": "место",
            "ratingCommonView": "общий",
            "ratingCountryView": "по стране",
            "ratingCityView": "по городу",
            //commonPlaceView
            "commonPlaceTryButton": "Я на месте!",
            "commonPlaceTryCount": "Номер попытки",
            "commonPlaceIncorrectTitle": "Неверное место",
            "commonPlaceIncorrectMessage": "Попробуй еще раз.",
            "commonPlaceIsNearMessage": "Ты уже близко!",
            "commonPlaceStillHomeMessage": "Ты все еще в командном пункте!",
            //pathView
            "pathOnThePosition": "На позиции!",
            "pathTimeLeft": "Осталось времени",
            "pathPointIncorrectTitle": "Неверная точка",
            "pathPointIncorrectMessage": "Ты все еще далеко от нужной точки.",
            "pathPointIsNearMessage": "Ты достаточно близок к нужной точке!",
            "pathStart": "Я на старте",
            //textCreationView
            "textCreationDescription": "Ты можешь писать все сюда или добавить ссылку на свой общедоступный(!) пост с ответом",
            //showYourSelf
            "showYourSelfCongratMessage": "Ты можешь менять свою аватарку на странице настроек.",
            //perpetumMobileView
            "perpetumMobileTimeLeft": "Осталось времени",
            "perpetumMobileCurrentTry": "Попытка №",
            "perpetumMobileStart": "Поехали!",
            "perpetumMobileAccelerometerFailTitle": "Ошибка датчика",
            "perpetumMobileAccelerometerFail": "Невозможно запустить акселерометр!",
            //videoView
            "videoDescription": "Отправь в ответе ссылку на общедоступное(!) видео с твоим выполнением миссии",
            //baseLocations
            "baseLocationsCommandPoint": "Командный пункт",
            "baseLocationsNorthPoint": "Северная граница",
            "baseLocationsEastPoint": "Восточная граница",
            "baseLocationsSouthPoint": "Южная граница",
            "baseLocationsWestPoint": "Западная граница",
            "baseLocationsRadar": "Радар",
            "baseLocationsOutpost": "Форпост",
            //account
            "accountCoinsDescription": "Монеты можно тратить на подсказки к миссиям, а зарабатывать, заполняя дневную шкалу добра на 100%. Несколько монет на старте помогут тебе освоиться :)",
            //hintModal
            "hintNotEnoughCoins": "Не хватает монет! Зарабатывай их, делая добрые дела.",
            "hintModalTitle": "Подсказки",
            "hintTake": "Взять",
            "hintShow": "Показать",
            "hintTemporarilyUnavailable": "Эта подсказка временно недоступна",
            "hintNorth": "Возьми к северу",
            "hintEast": "Иди на восток",
            "hintSouth": "Двигайся на юг",
            "hintWest": "Бери западней",
            "hintAlreadyArrived": "Ты уже на месте"
        };
    }
    exports.getDictionary = getDictionary;
});
