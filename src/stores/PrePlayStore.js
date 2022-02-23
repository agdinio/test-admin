import { observable, action } from 'mobx'
import _ from 'lodash'

class PrePlayStore {
  PlayColors = {
    LivePlay: '#c61818',
    GameMaster: '#19d1bf',
    Sponsor: '#495bdb',
    Prize: '#9368aa',
  }

  @observable
  isLoading = false
  @action
  setIsLoading(val) {
    this.isLoading = val
  }

  @observable
  teams = []
  @action
  setTeams(val) {
    this.teams = val
  }

  @observable
  preplayItems = []
  @action
  setPrePlayItems(val) {
    this.preplayItems = val
  }

  @observable
  nextPlayItem = null
  @action
  setNextPlayItem(val) {
    this.nextPlayItem = val
  }

  @observable
  currentPlayItem = null
  @action
  setCurrentPlayItem(val) {
    this.currentPlayItem = val
  }

  @observable
  unresolvedItems = []
  @action
  setUnresolvedItems(val) {
    this.unresolvedItems = val
  }

  @observable
  resolvedItems = []
  @action
  setResolvedItems(val) {
    this.resolvedItems = val
  }

  @observable
  tmpPreplayItem = null

  @observable
  multiplierChoices = []

  @observable
  groupPlays = []
  @action
  setGroupPlays(val) {
    this.groupPlays = val
  }

  @observable
  sessionButtons = {
    start: {
      backgroundColor: '#18c5ff',
      color: '#000000',
      text: 'start session',
      locked: true,
    },
    session: {
      text: '',
      locked: true,
    },
    interruption: {
      value: '',
      text: '',
      locked: false,
    },
    end: {
      backgroundColor: '#18c5ff',
      color: '#000000',
      text: 'end session',
      locked: true,
    },
  }

  @observable
  timePeriods = []
  @action
  setTimePeriods(val) {
    this.timePeriods = val
  }

  @observable
  interruptPlays = []
  @action
  setInterruptPlays(val) {
    this.interruptPlays = val
  }

  @observable
  sponsors = []

  sponsorsxxx = [
    {
      id: 1,
      name: 'sponsor platinum',
      initial: 'p',
      initialColor: '#383644',
      backgroundColor: '#b2cbce',
      circleBorderColor: '#91a5c1',
      circleFill: '#a3c2cc',
      count: 10,
      length: 5,
    },
    {
      id: 2,
      name: 'sponsor bronze',
      initial: 'b',
      initialColor: '#3f2919',
      backgroundColor: '#e2a069',
      circleBorderColor: '#7c4724',
      circleFill: '#af643e',
      count: 2,
      length: 7,
    },
    {
      id: 3,
      name: 'sponsor silver',
      initial: 's',
      initialColor: '#4c4c4c',
      backgroundColor: '#bababa',
      circleBorderColor: '#999999',
      circleFill: '#cecece',
      count: 5,
      length: 5,
    },
    {
      id: 4,
      name: 'sponsor gold',
      initial: 'g',
      initialColor: '#754b00',
      backgroundColor: '#ffde9c',
      circleBorderColor: '#f4a300',
      circleFill: '#ffda3e',
      count: 4,
      length: 5,
    },
  ]

  TypeButtons = [
    {
      type: 'LivePlay',
      width: 10,
      text: 'live',
      color: '#c61818',
    },
    {
      type: 'GameMaster',
      width: 18,
      text: 'gamemaster',
      color: '#19d1bf',
    },
    {
      type: 'Sponsor',
      width: 18,
      text: 'sponsor',
      color: '#495bdb',
    },
    {
      type: 'Prize',
      width: 18,
      text: 'prize',
      color: '#9368aa',
    },
    {
      type: 'Announce',
      width: 18,
      text: 'announce',
      color: '#000000',
    },
  ]

  /*
  @action
  resetTmpPreplayItem() {
    if (this.tmpPreplayItem && this.tmpPreplayItem.choices) {
      this.tmpPreplayItem.choices = []
    }
  }
  @action
  setTmpPreplayItemChoice(val) {
    if (this.tmpPreplayItem && this.tmpPreplayItem.choices) {
      this.tmpPreplayItem.choices.push(val)
    }
  }

*/

  @action
  setTmpPreplayItem(val) {
    this.tmpPreplayItem = val
  }

  @observable
  presetItems = []
  //FROM DEMO presetItems = presetScript
  @action
  resetPresetItems() {
    this.presetItems = []
  }

  @observable
  addToStackItem = null
  @action
  setAddToStackItem(val) {
    this.addToStackItem = val
  }

  @observable
  selectedTeam = null
  @action
  setSelectedTeam(val) {
    this.selectedTeam = val
  }

  @observable
  selectedSponsor = null
  @action
  setSelectedSponsor(val) {
    this.selectedSponsor = val
  }

  @observable
  isAddingStack = false
  @action
  setIsAddingStack(val) {
    this.isAddingStack = val
  }

  getPresetItemById(id) {
    return this.presetItems.filter(o => o.id === id)[0]
  }

  getPresetItemsByType(type) {
    return this.presetItems.filter(o => o.type.match(type) && !o.isMultiplier)
  }

  pullMultiplierChoices(id) {
    this.multiplierChoices = []
    return new Promise(resolve => {
      this.setMultiplierChoicesById(id)
      resolve(this.multiplierChoices)
    })
  }

  setMultiplierChoicesById(id) {
    debugger
    let parent = this.presetItems.filter(o => o.id === id)[0]
    if (parent) {
      parent.locked = false
      const exists = this.multiplierChoices.filter(o => o.id === parent.id)[0]
      if (!exists) {
        this.multiplierChoices.push(parent)
      }
      if (parent.choices && parent.choices.length >= 2) {
        for (let i = 0; i < parent.choices.length; i++) {
          let nextId = parent.choices[i].nextId
          if (nextId > 0) {
            this.setMultiplierChoicesByNextId(nextId)
          }
        }
      }
    }
  }

  setMultiplierChoicesByNextId(nextId) {
    debugger
    let item = this.presetItems.filter(o => o.id === nextId)[0]
    if (item) {
      this.setMultiplierChoicesById(item.id)
    }
  }

  levels = []

  getStarMax(presets) {
    this.levels = []
    let max = 1
    return new Promise(resolve => {
      const major = presets[0]
      this.levels.push(max)
      major.choices.forEach(a => {
        if (a.nextId) {
          this.levels.push(max + 1)
          this.deepStarMax(presets, a, max + 1)
        }
      })

      const returnValue = _.max(this.levels)
      resolve(returnValue)
    })
  }

  deepStarMax(presets, pre, max) {
    const b = presets.filter(o => o.id === pre.nextId)[0]
    if (b) {
      b.choices.forEach(c => {
        if (c.nextId) {
          this.levels.push(max + 1)
          this.deepStarMax(presets, c, max + 1)
        }
      })
    }
  }
}

export default new PrePlayStore()
