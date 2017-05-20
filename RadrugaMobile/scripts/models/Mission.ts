import wsInterfaces = require("../models/WsInterfaces");
import storage = require("../Storage");
import enums = require("../Enums");
import appTools = require("../ApplicationTools");
import geoCoordinate = require("../geoLocation/GeoCoordinate");
import us = require("../models/User");
import umissManager = require("../game/UniqueMissionsManager");

export interface ICoordinateWithCompletion {
    requiredCoordinate: ICoordinateWithName;
    reachedCoordinate?: geoCoordinate.GeoCoordinate;
    reached: boolean;
}
export interface ICoordinateWithName {
    coordinate: geoCoordinate.GeoCoordinate;
    name: string;
    test?: boolean;
}

export class Mission {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    missionImageBorder: string;
    difficulty: number;
    solutionType: number;
    answersCount: number;
    isFinal: boolean;
    currentTry: number;
    maxTries: number;
    displayStatus: enums.MissionDisplayStatus;
    displayStatusImage: string;
    numberOfPhotos: number;
    dependentMissionIds: string[];
    congratMessage: string;
    missionStarted: boolean;
    dependsOnMissionNames: string[];
    hints: Hint[];

    //path properties
    accuracyRadius: number;
    timeLimit: number;
    startExecutionTime: any;
    requiredCoordinates: ICoordinateWithCompletion[] = [];
    isFullFilled: boolean;
    tempCoordinatesCalculationFunction: string;
    tempCalculationFunctionParameters: string[];

    //photo properties
    tempPhotoDatasourceJson: string;


    public static setCurrentMissionTempPhotoUrls(tempPhotoDatasourceJson: string) {
        var model: Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        model.tempPhotoDatasourceJson = tempPhotoDatasourceJson;
        storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
        storage.PermanentStorage.set("MissionDetailsTempPhotoUrls_" + model.id, tempPhotoDatasourceJson);
        Mission.updateMission(model.id, function() {
            // ReSharper disable once SuspiciousThisUsage
            (<Mission>this).tempPhotoDatasourceJson = tempPhotoDatasourceJson;
        });
    }

    public static setCurrentMissionTryCount(tryCount: number) {
        var model: Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        model.currentTry = tryCount;
        storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
        storage.PermanentStorage.set(`MissionDetailsTryCount_${model.id}`, tryCount.toString());
        Mission.updateMission(model.id, function() {
            // ReSharper disable once SuspiciousThisUsage
            (<Mission>this).currentTry = tryCount;
        });
    }

    public static setCurrentMissionStartExecution() {
        var model: Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        model.startExecutionTime = new Date();
        storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
        storage.PermanentStorage.set(`MissionDetailsStartExecution_${model.id}`, model.startExecutionTime.toString());
        Mission.updateMission(model.id, function() {
            // ReSharper disable once SuspiciousThisUsage
            (<Mission>this).startExecutionTime = model.startExecutionTime;
        });
    }

    public static setCurrentMissionStarted(started: boolean) {
        var model: Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        model.missionStarted = started;
        storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
        storage.PermanentStorage.set(`MissionDetailsMissionStarted_${model.id}`, started.toString());
        Mission.updateMission(model.id, function() {
            // ReSharper disable once SuspiciousThisUsage
            (<Mission>this).missionStarted = started;
        });
    }

    public static setCurrentMissionCompletedCoordinates(requiredCoordinates: ICoordinateWithCompletion[]) {
        var model: Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        model.requiredCoordinates = requiredCoordinates;
        storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
        storage.PermanentStorage.set(`MissionDetailsCompletedCoordinates_${model.id}`, JSON.stringify(requiredCoordinates));
        Mission.updateMission(model.id, function() {
            // ReSharper disable once SuspiciousThisUsage
            (<Mission>this).requiredCoordinates = model.requiredCoordinates;
        });
    }

    public static setMissionDisplayStatus(id: string, status: enums.MissionDisplayStatus) {
        Mission.updateMission(id, function() {
            // ReSharper disable once SuspiciousThisUsage
            var mission = (<Mission>this);
            mission.displayStatus = status;
            if (mission.dependentMissionIds) {
                for (let dependentMissionId of mission.dependentMissionIds) {
                    ((savedId) => {
                        switch (status) {
                        case enums.MissionDisplayStatus.Succeeded:
                        { //timeouts because we need to update current mission first, then start updating dependents
                            setTimeout(() => {
                                Mission.setMissionDisplayStatus(savedId, enums.MissionDisplayStatus.Available);
                            }, 0);
                            break;
                        }
                        case enums.MissionDisplayStatus.Failed:
                        {
                            setTimeout(() => {
                                Mission.setMissionDisplayStatus(savedId, enums.MissionDisplayStatus.Failed);
                            }, 0);
                            break;
                        }
                        }
                    })(dependentMissionId);

                }
            }
        });
    }

    public static getById(id: string) {
        var missions: Mission[] = Mission.getMissionsFromStorage();
        var counter = 0;
        while (missions === null) {
            if (counter <= 3) {
                appTools.logError("Mission getbyid missions are null: " + counter);
                counter++;
            }
            missions = Mission.getMissionsFromStorage();
        }

        return $.grep(missions, (mission) => {
            return mission.id === id;
        })[0];
    }

    public static updateMissionHint(hint: Hint) {
        var model: Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        for (let missionHint of model.hints) {            
            if (missionHint.id === hint.id) {
                missionHint.isPayed = hint.isPayed;
                missionHint.text = hint.text;
                break;
            }             
        }                
        Mission.updateMission(model.id, function () {                        
            for (let missionHint of (<Mission>this).hints) {
                if (missionHint.id === hint.id) {
                    missionHint.isPayed = hint.isPayed;
                    missionHint.text = hint.text;
                    break;
                }
            }   
        });
        storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
    }

    public static getFromWsData(wsMission: wsInterfaces.IWsMission): Mission {
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
    }

    public static fillMissionCoordinates(mission: Mission, wsMission?: wsInterfaces.IWsMission) {
        // occurance of the wsMission means initial filling
        var functionParametersFromServer = wsMission ? wsMission.CalculationFunctionParameters : mission.tempCalculationFunctionParameters;
        var functionBodyFromServer = wsMission ? wsMission.CoordinatesCalculationFunction : mission.tempCoordinatesCalculationFunction;
        var functionParameters: ICoordinateWithName[] = [];
        var user: us.User = JSON.parse(storage.PermanentStorage.get("UserInfo"));
        var allCoordinatesExist = true;
        for (let parameter of functionParametersFromServer) {
            if (user[parameter]) {
                functionParameters.push({
                    test: false,
                    name: appTools.getText(Mission.getDictionaryKey(parameter)),
                    coordinate: <geoCoordinate.GeoCoordinate>user[parameter]
                });
            } else {
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

        var fn = eval(`(${functionBodyFromServer})`);
        var calculatedCoordinates: ICoordinateWithName[] = fn.apply(this, functionParameters);
        var modelCoordinates: ICoordinateWithCompletion[] = [];
        for (let calculatedCoordinate of calculatedCoordinates) {
            modelCoordinates.push({
                requiredCoordinate:
                {
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
            Mission.updateMission(mission.id, function() {
                // ReSharper disable SuspiciousThisUsage
                (<Mission>this).requiredCoordinates = mission.requiredCoordinates;
                (<Mission>this).tempCoordinatesCalculationFunction = mission.tempCoordinatesCalculationFunction;
                (<Mission>this).tempCalculationFunctionParameters = mission.tempCalculationFunctionParameters;
                (<Mission>this).isFullFilled = mission.isFullFilled;
                // ReSharper restore SuspiciousThisUsage
            });
        }
    }

    private static getDictionaryKey(parameterName: string) : string{
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
    }

    private static fillPartialCompletions(mission: Mission) {
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
                let currentTryCount = storage.PermanentStorage.get(`MissionDetailsTryCount_${mission.id}`);
                if (currentTryCount) {
                    mission.currentTry = +currentTryCount;
                }
                break;
            case enums.SolutionType.PhotoCreation:
                let currentPhotos = storage.PermanentStorage.get(`MissionDetailsTempPhotoUrls_${mission.id}`);
                if (currentPhotos) {
                    mission.tempPhotoDatasourceJson = currentPhotos;
                }
                break;
            case enums.SolutionType.GeoCoordinates:
                let currentCoordinates = storage.PermanentStorage.get(`MissionDetailsCompletedCoordinates_${mission.id}`);
                if (currentCoordinates) {
                    mission.requiredCoordinates = JSON.parse(currentCoordinates);
                }
                let currentStartExecution = storage.PermanentStorage.get(`MissionDetailsStartExecution_${mission.id}`);
                if (currentStartExecution) {
                    mission.startExecutionTime = new Date(currentStartExecution);
                }
                break;
            case enums.SolutionType.Unique: //for perpetum mobile only
                let currentStartedFlag = storage.PermanentStorage.get(`MissionDetailsStartExecution_${mission.id}`);
                if (currentStartedFlag) {
                    mission.missionStarted = Boolean(currentStartedFlag);
                }
                break;
        }
    }

    public static getMissionsFromStorage(): Mission[] {
        var missionSets = MissionSet.getMissionSetsFromStorage();
        return Mission.getMissionsFromMissionSets(missionSets);
    }

    public static getMissionsFromMissionSets(missionSets: MissionSet[]): Mission[] {
        if (missionSets && missionSets.length > 0)
            return missionSets.map(missionSet => missionSet.missions).reduce(
            (previousValue, currentValue) => {
                return previousValue.concat(currentValue);
            });
        else
            return null;
    }

    private static updateMission(id: string, updateFunc: () => void) {
        var missionSets: MissionSet[] = MissionSet.getMissionSetsFromStorage();
        var selectedMissionSet: MissionSet = null;
        for (let missionSet of missionSets) {
            for (let mission of missionSet.missions) {
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
        var setIsFinished = !($.grep(selectedMissionSet.missions, (m) => {
            return m.displayStatus !== enums.MissionDisplayStatus.Succeeded && m.displayStatus !== enums.MissionDisplayStatus.Succeeded;
        }));
        if (setIsFinished)
            MissionSet.forceRefresh();

        MissionSet.saveMissionSetsToStorage(missionSets);
    }
}

export class MissionSet {
    id: string;
    missions: Mission[];

    public static getFromWsData(wsMissionSet: wsInterfaces.IWsMissionSet): MissionSet {
        var missionSet = new MissionSet();
        missionSet.id = wsMissionSet.Id;
        missionSet.missions = wsMissionSet.Missions.map(Mission.getFromWsData);
        return missionSet;
    }

    public static getMissionSetsFromStorage(): MissionSet[] {
        return JSON.parse(storage.PermanentStorage.get("AllSetsWithMissions") || null);
    }

    public static saveMissionSetsToStorage(value: MissionSet[]) {
        if (value !== null)
            storage.PermanentStorage.set("AllSetsWithMissions", JSON.stringify(value));
    }

    public static forceRefresh() {
        us.User.forceRefresh();
        MissionSet.saveMissionSetsToStorage([]);
        storage.PermanentStorage.set("MissionDetails", "");
        appTools.forceRebind("MissionChain", "Profile", "Achievement");
    }
}

export class Hint {
    id: string;
    text: string;
    type: enums.HintType;
    score: number;
    isPayed: boolean;

    public static getFromWsData(wsHint: wsInterfaces.IWsHint): Hint {
        var hint = new Hint();
        hint.id = wsHint.Id;
        hint.text = wsHint.Text;
        hint.type = wsHint.Type;
        hint.score = wsHint.Score;
        hint.isPayed = wsHint.IsPayed;
        return hint;
    }
}