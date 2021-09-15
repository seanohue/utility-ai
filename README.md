# Utility AI TypeScript

[![Build Status](https://travis-ci.org/exane/utility-ai.svg?branch=master)](https://travis-ci.org/exane/utility-ai)
[![npm version](https://badge.fury.io/js/utility-ai.svg)](https://badge.fury.io/js/utility-ai)

---

## A small Utility Ai Framework

### Install

```sh
npm install utility-ai
yarn add utility-ai
```

### Note of breaking change

There is one breaking change if you choose to use this fork over the non-TypeScript fork. Imports have changed if you still use `require`:

```js
// Works now:
const { UtilityAi } = require('utility-ai');

// Does not work anymore:
const UtilityAi = require('utility-ai');s

// Both work
import UtilityAi from 'utility-ai';
import { UtilityAi } from 'utility-ai';
```

### Usage

```js
  const { UtilityAi } = require("utility-ai")

  utility_ai = new UtilityAi

  // define your actions e.g "Move to Enemy", "Fire at Enemy", "Move to Cover", "Reload Gun"
  utility_ai.addAction("Move to Enemy", action => {

    // pre-conditions for actions, if not fulfilled all actions will be skipped
    action.condition(({ player }) => {
      if (player.isStuck()) {
        return false
      }

      // explicit return of true needed to fulfill condition
      return true
    })

    // each score expects a number as return value, the higher the better the action will be weighted
    action.score("Distance to Enemy", ({ player, enemy }) => {
      return player.distanceTo(enemy)
    })

    action.score("Gun is not loaded", ({ player }) => {
      return player.gunEmpty() && -100
    })

  })

  utility_ai.addAction("Fire at Enemy", action => {

    action.score("Proximity to Enemy < 50", ({ player, enemy }) => {
      return player.distanceTo(enemy) < 50 && 75
    })

    action.score("Cannot make it to cover", ({ player }) => {
      return player.nextCoverDistance() > 25 && 50
    })

    action.score("Gun is not loaded", ({ player }) => {
      return player.gunEmpty() && -125
    })

  })

  utility_ai.addAction("Move to Cover", action => {

    action.score("Is not in cover", ({ player }) => {
      return !player.isInCover() && 50
    })

    action.score("Proximity to Cover < 50", ({ player }) => {
      return player.nextCoverDistance() < 50 && 50
    })

  })

  utility_ai.addAction("Reload Gun", action => {

    action.score("Gun is not loaded", ({ player }) => {
      return player.gunEmpty() && 75
    })

    action.score("Is in Cover", ({ player }) => {
      return player.isInCover() && 50
    })

    action.score("Gun is loaded", ({ player }) => {
      return !player.gunEmpty() && -125
    })

  })

  const data = {
    player: {...},
    enemy: {...}
  }

  // starts the evaluation of a given world state and returns its best action
  const result = utility_ai.evaluate(data)
  // e.g. result = { action: "Move to Cover", score: 100 }
```
