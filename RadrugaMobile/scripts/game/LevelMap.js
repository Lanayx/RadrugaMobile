define(["require", "exports"], function (require, exports) {
    "use strict";
    /// <reference path="../tsDefinitions/require.d.ts" />
    var LevelMap = (function () {
        function LevelMap() {
        }
        //analogue of static constructor
        LevelMap.ctor = function () {
            LevelMap.levelMap.push(0); //fake start to match indexes
            LevelMap.levelMap.push(LevelMap.onFirstLevel);
            LevelMap.levelMap.push(LevelMap.onSecondLevel);
            for (var i = 3; i < LevelMap.unreachableLevel; i++) {
                LevelMap.levelMap.push(2 * LevelMap.levelMap[i - 1] - LevelMap.levelMap[i - 2] + LevelMap.increasePerLevel);
            }
            return null;
        };
        LevelMap.getMaxLevelPoints = function (level) {
            return LevelMap.levelMap[level];
        };
        LevelMap.increasePerLevel = 5;
        LevelMap.onFirstLevel = 44;
        LevelMap.onSecondLevel = 65;
        LevelMap.perDifficultyPoint = 10;
        LevelMap.unreachableLevel = 15;
        LevelMap.levelMap = [];
        LevelMap.ctorRun = LevelMap.ctor();
        return LevelMap;
    }());
    exports.LevelMap = LevelMap;
});
