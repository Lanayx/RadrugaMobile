define(["require", "exports", "../Storage", "../Enums", "../ApplicationTools", "../models/User", "../game/UniqueMissionsManager"], function (require, exports, storage, enums, appTools, us, umissManager) {
    "use strict";
    var Mission = (function () {
        function Mission() {
            this.requiredCoordinates = [];
        }
        Mission.setCurrentMissionTempPhotoUrls = function (tempPhotoDatasourceJson) {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
            model.tempPhotoDatasourceJson = tempPhotoDatasourceJson;
            storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
            storage.PermanentStorage.set("MissionDetailsTempPhotoUrls_" + model.id, tempPhotoDatasourceJson);
            Mission.updateMission(model.id, function () {
                // ReSharper disable once SuspiciousThisUsage
                this.tempPhotoDatasourceJson = tempPhotoDatasourceJson;
            });
        };
        Mission.setCurrentMissionTryCount = function (tryCount) {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
            model.currentTry = tryCount;
            storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
            storage.PermanentStorage.set("MissionDetailsTryCount_" + model.id, tryCount.toString());
            Mission.updateMission(model.id, function () {
                // ReSharper disable once SuspiciousThisUsage
                this.currentTry = tryCount;
            });
        };
        Mission.setCurrentMissionStartExecution = function () {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
            model.startExecutionTime = new Date();
            storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
            storage.PermanentStorage.set("MissionDetailsStartExecution_" + model.id, model.startExecutionTime.toString());
            Mission.updateMission(model.id, function () {
                // ReSharper disable once SuspiciousThisUsage
                this.startExecutionTime = model.startExecutionTime;
            });
        };
        Mission.setCurrentMissionStarted = function (started) {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
            model.missionStarted = started;
            storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
            storage.PermanentStorage.set("MissionDetailsMissionStarted_" + model.id, started.toString());
            Mission.updateMission(model.id, function () {
                // ReSharper disable once SuspiciousThisUsage
                this.missionStarted = started;
            });
        };
        Mission.setCurrentMissionCompletedCoordinates = function (requiredCoordinates) {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
            model.requiredCoordinates = requiredCoordinates;
            storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
            storage.PermanentStorage.set("MissionDetailsCompletedCoordinates_" + model.id, JSON.stringify(requiredCoordinates));
            Mission.updateMission(model.id, function () {
                // ReSharper disable once SuspiciousThisUsage
                this.requiredCoordinates = model.requiredCoordinates;
            });
        };
        Mission.setMissionDisplayStatus = function (id, status) {
            Mission.updateMission(id, function () {
                // ReSharper disable once SuspiciousThisUsage
                var mission = this;
                mission.displayStatus = status;
                if (mission.dependentMissionIds) {
                    for (var _i = 0, _a = mission.dependentMissionIds; _i < _a.length; _i++) {
                        var dependentMissionId = _a[_i];
                        (function (savedId) {
                            switch (status) {
                                case enums.MissionDisplayStatus.Succeeded:
                                    {
                                        setTimeout(function () {
                                            Mission.setMissionDisplayStatus(savedId, enums.MissionDisplayStatus.Available);
                                        }, 0);
                                        break;
                                    }
                                case enums.MissionDisplayStatus.Failed:
                                    {
                                        setTimeout(function () {
                                            Mission.setMissionDisplayStatus(savedId, enums.MissionDisplayStatus.Failed);
                                        }, 0);
                                        break;
                                    }
                            }
                        })(dependentMissionId);
                    }
                }
            });
        };
        Mission.getById = function (id) {
            var missions = Mission.getMissionsFromStorage();
            var counter = 0;
            while (missions === null) {
                if (counter <= 3) {
                    appTools.logError("Mission getbyid missions are null: " + counter);
                    counter++;
                }
                missions = Mission.getMissionsFromStorage();
            }
            return $.grep(missions, function (mission) {
                return mission.id === id;
            })[0];
        };
        Mission.updateMissionHint = function (hint) {
            var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
            for (var _i = 0, _a = model.hints; _i < _a.length; _i++) {
                var missionHint = _a[_i];
                if (missionHint.id === hint.id) {
                    missionHint.isPayed = hint.isPayed;
                    missionHint.text = hint.text;
                    break;
                }
            }
            Mission.updateMission(model.id, function () {
                for (var _i = 0, _a = this.hints; _i < _a.length; _i++) {
                    var missionHint = _a[_i];
                    if (missionHint.id === hint.id) {
                        missionHint.isPayed = hint.isPayed;
                        missionHint.text = hint.text;
                        break;
                    }
                }
            });
            storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
        };
        Mission.getFromWsData = function (wsMission) {
            var mission = new Mission();
            mission.id = wsMission.Id;
            mission.name = wsMission.Name;
            mission.imageUrl = wsMission.PhotoUrl;
            mission.description = wsMission.Description;
            mission.difficulty = wsMission.Difficulty;
            mission.solutionType = wsMission.ExecutionType;
            mission.answersCount = wsMission.AnswersCount;
            mission.isFinal = wsMission.IsFinal;
            mission.maxTries = wsMission.TriesFor1Star;
            mission.currentTry = wsMission.TryCount + 1;
            mission.displayStatus = wsMission.DisplayStatus;
            mission.dependentMissionIds = wsMission.DependentMissionIds;
            mission.congratMessage = wsMission.MessageAfterCompletion;
            mission.numberOfPhotos = wsMission.NumberOfPhotos;
            mission.accuracyRadius = wsMission.AccuracyRadius;
            mission.timeLimit = wsMission.SecondsFor1Star;
            mission.hints = wsMission.Hints.map(Hint.getFromWsData);
            if (wsMission.CoordinatesCalculationFunction) {
                Mission.fillMissionCoordinates(mission, wsMission);
            }
            Mission.fillPartialCompletions(mission);
            return mission;
        };
        Mission.fillMissionCoordinates = function (mission, wsMission) {
            // occurance of the wsMission means initial filling
            var functionParametersFromServer = wsMission ? wsMission.CalculationFunctionParameters : mission.tempCalculationFunctionParameters;
            var functionBodyFromServer = wsMission ? wsMission.CoordinatesCalculationFunction : mission.tempCoordinatesCalculationFunction;
            var functionParameters = [];
            var user = JSON.parse(storage.PermanentStorage.get("UserInfo"));
            var allCoordinatesExist = true;
            for (var _i = 0, functionParametersFromServer_1 = functionParametersFromServer; _i < functionParametersFromServer_1.length; _i++) {
                var parameter = functionParametersFromServer_1[_i];
                if (user[parameter]) {
                    functionParameters.push({
                        test: false,
                        name: appTools.getText(Mission.getDictionaryKey(parameter)),
                        coordinate: user[parameter]
                    });
                }
                else {
                    allCoordinatesExist = false;
                    break;
                }
            }
            if (!allCoordinatesExist) {
                mission.tempCoordinatesCalculationFunction = functionBodyFromServer;
                mission.tempCalculationFunctionParameters = functionParametersFromServer;
                mission.isFullFilled = false;
                return;
            }
            var fn = eval("(" + functionBodyFromServer + ")");
            var calculatedCoordinates = fn.apply(this, functionParameters);
            var modelCoordinates = [];
            for (var _a = 0, calculatedCoordinates_1 = calculatedCoordinates; _a < calculatedCoordinates_1.length; _a++) {
                var calculatedCoordinate = calculatedCoordinates_1[_a];
                modelCoordinates.push({
                    requiredCoordinate: {
                        coordinate: calculatedCoordinate.coordinate,
                        name: calculatedCoordinate.name,
                        test: calculatedCoordinate.test
                    },
                    reached: false
                });
            }
            mission.requiredCoordinates = modelCoordinates;
            mission.tempCoordinatesCalculationFunction = undefined;
            mission.tempCalculationFunctionParameters = undefined;
            mission.isFullFilled = true;
            if (!wsMission) {
                storage.PermanentStorage.set("MissionDetails", JSON.stringify(mission));
                Mission.updateMission(mission.id, function () {
                    // ReSharper disable SuspiciousThisUsage
                    this.requiredCoordinates = mission.requiredCoordinates;
                    this.tempCoordinatesCalculationFunction = mission.tempCoordinatesCalculationFunction;
                    this.tempCalculationFunctionParameters = mission.tempCalculationFunctionParameters;
                    this.isFullFilled = mission.isFullFilled;
                    // ReSharper restore SuspiciousThisUsage
                });
            }
        };
        Mission.getDictionaryKey = function (parameterName) {
            switch (parameterName) {
                case "homeCoordinate":
                    return "baseLocationsCommandPoint";
                case "baseNorthCoordinate":
                    return "baseLocationsNorthPoint";
                case "baseEastCoordinate":
                    return "baseLocationsEastPoint";
                case "baseSouthCoordinate":
                    return "baseLocationsSouthPoint";
                case "baseWestCoordinate":
                    return "baseLocationsWestPoint";
                case "radarCoordinate":
                    return "baseLocationsRadar";
                case "outpostCoordinate":
                    return "baseLocationsOutpost";
                default:
                    return parameterName;
            }
        };
        Mission.fillPartialCompletions = function (mission) {
            var solutionType = mission.solutionType;
            if (solutionType === enums.SolutionType.Unique) {
                var missionName = umissManager.UniqueMissionsManager.getMissionName(mission.id);
                switch (missionName) {
                    case "YourBase":
                        solutionType = enums.SolutionType.GeoCoordinates;
                        break;
                    case "FriendBase":
                    case "Radar":
                    case "Outpost":
                        solutionType = enums.SolutionType.CommonPlace;
                        break;
                    case "PerpetumMobile":
                        break;
                    default:
                        return;
                }
            }
            switch (solutionType) {
                case enums.SolutionType.CommonPlace:
                case enums.SolutionType.RightAnswer:
                    var currentTryCount = storage.PermanentStorage.get("MissionDetailsTryCount_" + mission.id);
                    if (currentTryCount) {
                        mission.currentTry = +currentTryCount;
                    }
                    break;
                case enums.SolutionType.PhotoCreation:
                    var currentPhotos = storage.PermanentStorage.get("MissionDetailsTempPhotoUrls_" + mission.id);
                    if (currentPhotos) {
                        mission.tempPhotoDatasourceJson = currentPhotos;
                    }
                    break;
                case enums.SolutionType.GeoCoordinates:
                    var currentCoordinates = storage.PermanentStorage.get("MissionDetailsCompletedCoordinates_" + mission.id);
                    if (currentCoordinates) {
                        mission.requiredCoordinates = JSON.parse(currentCoordinates);
                    }
                    var currentStartExecution = storage.PermanentStorage.get("MissionDetailsStartExecution_" + mission.id);
                    if (currentStartExecution) {
                        mission.startExecutionTime = new Date(currentStartExecution);
                    }
                    break;
                case enums.SolutionType.Unique:
                    var currentStartedFlag = storage.PermanentStorage.get("MissionDetailsStartExecution_" + mission.id);
                    if (currentStartedFlag) {
                        mission.missionStarted = Boolean(currentStartedFlag);
                    }
                    break;
            }
        };
        Mission.getMissionsFromStorage = function () {
            var missionSets = MissionSet.getMissionSetsFromStorage();
            return Mission.getMissionsFromMissionSets(missionSets);
        };
        Mission.getMissionsFromMissionSets = function (missionSets) {
            if (missionSets && missionSets.length > 0)
                return missionSets.map(function (missionSet) { return missionSet.missions; }).reduce(function (previousValue, currentValue) {
                    return previousValue.concat(currentValue);
                });
            else
                return null;
        };
        Mission.updateMission = function (id, updateFunc) {
            var missionSets = MissionSet.getMissionSetsFromStorage();
            var selectedMissionSet = null;
            for (var _i = 0, missionSets_1 = missionSets; _i < missionSets_1.length; _i++) {
                var missionSet = missionSets_1[_i];
                for (var _a = 0, _b = missionSet.missions; _a < _b.length; _a++) {
                    var mission = _b[_a];
                    if (mission.id === id) {
                        updateFunc.apply(mission);
                        selectedMissionSet = missionSet;
                        break;
                    }
                    if (selectedMissionSet != null)
                        break;
                }
            }
            if (selectedMissionSet == null) {
                console.log("Mission was not found by id");
                return;
            }
            var setIsFinished = !($.grep(selectedMissionSet.missions, function (m) {
                return m.displayStatus !== enums.MissionDisplayStatus.Succeeded && m.displayStatus !== enums.MissionDisplayStatus.Succeeded;
            }));
            if (setIsFinished)
                MissionSet.forceRefresh();
            MissionSet.saveMissionSetsToStorage(missionSets);
        };
        return Mission;
    }());
    exports.Mission = Mission;
    var MissionSet = (function () {
        function MissionSet() {
        }
        MissionSet.getFromWsData = function (wsMissionSet) {
            var missionSet = new MissionSet();
            missionSet.id = wsMissionSet.Id;
            missionSet.missions = wsMissionSet.Missions.map(Mission.getFromWsData);
            return missionSet;
        };
        MissionSet.getMissionSetsFromStorage = function () {
            return JSON.parse(storage.PermanentStorage.get("AllSetsWithMissions") || null);
        };
        MissionSet.saveMissionSetsToStorage = function (value) {
            if (value !== null)
                storage.PermanentStorage.set("AllSetsWithMissions", JSON.stringify(value));
        };
        MissionSet.forceRefresh = function () {
            us.User.forceRefresh();
            MissionSet.saveMissionSetsToStorage([]);
            storage.PermanentStorage.set("MissionDetails", "");
            appTools.forceRebind("MissionChain", "Profile", "Achievement");
        };
        return MissionSet;
    }());
    exports.MissionSet = MissionSet;
    var Hint = (function () {
        function Hint() {
        }
        Hint.getFromWsData = function (wsHint) {
            var hint = new Hint();
            hint.id = wsHint.Id;
            hint.text = wsHint.Text;
            hint.type = wsHint.Type;
            hint.score = wsHint.Score;
            hint.isPayed = wsHint.IsPayed;
            return hint;
        };
        return Hint;
    }());
    exports.Hint = Hint;
});
