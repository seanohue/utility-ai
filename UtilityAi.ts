
interface IScoreEvaluator<T = any> {
  callback: (data: T) => number | false;
  description: Action['description'];
}

interface IScoreEvaluation {
  score: number;
  action: Action['description'];
}

class Action<T = any> {
  description: string;

  private _scores: IScoreEvaluator<T>[];
  private _condition: (data: T) => boolean;
  private _print_debug: boolean;

  constructor(
    description: string,
    callback: (action: Action<T>) => unknown
  ) {
    this.description = description
    this._scores = []
    this._condition = () => true

    callback(this)
  }

  condition(
    callback: typeof this._condition
  ) {
    if (!callback) {
      throw Error("UtilityAi#Action#condition: Missing callback")
    }

    this._condition = callback
  }

  score(
    description: string,
    callback: IScoreEvaluator<T>['callback']
  ) {
    if (!description) {
      throw Error("UtilityAi#Action#score: Missing description")
    }

    if (!callback) {
      throw Error("UtilityAi#Action#score: Missing callback")
    }

    this._scores.push({
      description,
      callback,
    })
  }

  _validateScore(score?: number | false): number {
    if (!isNaN(score as number) && typeof score === "number") {
      return score
    }
    return 0
  }

  log(...msg: unknown[]) {
    if (!this._print_debug) return
    console.log(...msg)
  }

  evaluate(
    data: T,
    debug = false
  ) {
    this._print_debug = debug

    this.log("Evaluate Action: ", this.description)
    if (!this._condition(data)) {
      this.log("Condition not fulfilled")
      return -Infinity
    }

    const score = this._scores
      .map(score => {
        const _score = this._validateScore(score.callback(data))
        this.log("- ", score.description, _score)
        return _score
      })
      .reduce((acc, score) => acc + score, 0)

    this.log("Final Score: ", score)

    return score
  }

}

export class UtilityAi<T = any> {
  private _actions: Action<T>[];
  constructor() {
    this._actions = []
  }

  addAction(
    description: Action<T>['description'],
    callback: (action: Action<T>) => unknown,
  ) {
    if (!description) {
      throw Error("UtilityAi#addAction: Missing description")
    }
    if (!callback) {
      throw Error("UtilityAi#addAction: Missing callback")
    }

    const action = new Action<T>(description, callback)

    this._actions.push(action)
  }

  evaluate(data: T, debug = false) {
    return this._actions
      .map(action => ({
        action: action.description,
        score: action.evaluate(data, debug)
      } as IScoreEvaluation))
      .reduce(
        (acc, action) =>
          acc.score !== undefined && acc.score > action.score
            ? acc
            : action,
        { score: undefined } as IScoreEvaluation)
  }
}

export default UtilityAi;
