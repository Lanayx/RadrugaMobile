/// <reference path="../tsDefinitions/require.d.ts" />
export class LevelMap {
   
    private static increasePerLevel = 5;
    private static onFirstLevel = 44;
    private static onSecondLevel = 65;
    private static perDifficultyPoint = 10;
    private static unreachableLevel = 15;
    private static levelMap = [];

    private static ctorRun = LevelMap.ctor();

    //analogue of static constructor
    static ctor() {
        LevelMap.levelMap.push(0);//fake start to match indexes
        LevelMap.levelMap.push(LevelMap.onFirstLevel);
        LevelMap.levelMap.push(LevelMap.onSecondLevel);
        for (let i = 3; i < LevelMap.unreachableLevel; i++) {
            LevelMap.levelMap.push(2 * LevelMap.levelMap[i - 1] - LevelMap.levelMap[i - 2] + LevelMap.increasePerLevel);
        }
        return null;
    }


    public static getMaxLevelPoints(level: number) {
        return LevelMap.levelMap[level];
    }


}