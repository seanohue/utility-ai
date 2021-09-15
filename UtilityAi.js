"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilityAi = void 0;
var Action = /** @class */ (function () {
    function Action(description, callback) {
        this.description = description;
        this._scores = [];
        this._condition = function () { return true; };
        callback(this);
    }
    Action.prototype.condition = function (callback) {
        if (!callback) {
            throw Error("UtilityAi#Action#condition: Missing callback");
        }
        this._condition = callback;
    };
    Action.prototype.score = function (description, callback) {
        if (!description) {
            throw Error("UtilityAi#Action#score: Missing description");
        }
        if (!callback) {
            throw Error("UtilityAi#Action#score: Missing callback");
        }
        this._scores.push({
            description: description,
            callback: callback
        });
    };
    Action.prototype._validateScore = function (score) {
        if (!isNaN(score) && typeof score === "number") {
            return score;
        }
        return 0;
    };
    Action.prototype.log = function () {
        var msg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            msg[_i] = arguments[_i];
        }
        if (!this._print_debug)
            return;
        console.log.apply(console, msg);
    };
    Action.prototype.evaluate = function (data, debug) {
        var _this = this;
        if (debug === void 0) { debug = false; }
        this._print_debug = debug;
        this.log("Evaluate Action: ", this.description);
        if (!this._condition(data)) {
            this.log("Condition not fulfilled");
            return -Infinity;
        }
        var score = this._scores
            .map(function (score) {
            var _score = _this._validateScore(score.callback(data));
            _this.log("- ", score.description, _score);
            return _score;
        })
            .reduce(function (acc, score) { return acc + score; }, 0);
        this.log("Final Score: ", score);
        return score;
    };
    return Action;
}());
var UtilityAi = /** @class */ (function () {
    function UtilityAi() {
        this._actions = [];
    }
    UtilityAi.prototype.addAction = function (description, callback) {
        if (!description) {
            throw Error("UtilityAi#addAction: Missing description");
        }
        if (!callback) {
            throw Error("UtilityAi#addAction: Missing callback");
        }
        var action = new Action(description, callback);
        this._actions.push(action);
    };
    UtilityAi.prototype.evaluate = function (data, debug) {
        if (debug === void 0) { debug = false; }
        return this._actions
            .map(function (action) { return ({
            action: action.description,
            score: action.evaluate(data, debug)
        }); })
            .reduce(function (acc, action) {
            return acc.score !== undefined && acc.score > action.score
                ? acc
                : action;
        }, { score: undefined });
    };
    return UtilityAi;
}());
exports.UtilityAi = UtilityAi;
exports.default = UtilityAi;
//# sourceMappingURL=UtilityAi.js.map