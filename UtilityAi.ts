class Action {
  description: string;

  private _scores: any[];
  private _condition: (data: any) => boolean;
  private _print_debug: boolean;

  constructor(
    description: string, 
    callback: (action: Action) => unknown
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
    callback: () => unknown
  ) {
    if (!description) {
      throw Error("UtilityAi#Action#score: Missing description")
    }

    if (!callback) {
      throw Error("UtilityAi#Action#score: Missing callback")
    }

    this._scores.push({
      description,
      callback
    })
  }

  _validateScore(score?: number) {
    if (!isNaN(score) && typeof score === "number") {
      return score
    }
    return 0
  }

  log(...msg: unknown[]) {
    if (!this._print_debug) return
    console.log(...msg)
  }

  evaluate(
    data: any,
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

export class UtilityAi {
  private _actions: Action[];
  constructor() {
    this._actions = []
  }

  addAction(
    description: Action['description'], 
    callback: (action: Action) => unknown,
  ) {
    if (!description) {
      throw Error("UtilityAi#addAction: Missing description")
    }
    if (!callback) {
      throw Error("UtilityAi#addAction: Missing callback")
    }

    const action = new Action(description, callback)

    this._actions.push(action)
  }

  evaluate(data: any, debug = false) {
    return this._actions
      .map(action => ({
        action: action.description,
        score: action.evaluate(data, debug)
      }))
      .reduce(
        (acc, action) => 
          acc.score !== undefined && acc.score > action.score 
            ? acc 
            : action, 
        { score: undefined })
  }
}

export default UtilityAi;
