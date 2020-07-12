import Twister from './mersenne-twister'

export default class Random {
  private twister: Twister

  constructor (seed: number) {
    this.twister = new Twister(seed)
  }

  /** min inclusive, max exclusive */
  number = (min: number, max: number) => {
    max--
    const rnd = this.twister.random()
    const floored = Math.floor(rnd * (max - min + 1) + min)
    return floored
  }

  size = (userstate = false) => {
    const sizes = [1, 1.5, 2, 2.5, 3]
    return userstate ? sizes[sizes.length - 1] : sizes[this.number(0, sizes.length - 1)]
  }

  color = () => {
    const colors = ['blue', 'coral', 'dodgerBlue',
      'springGreen', 'yellowGreen', 'green', 'orangeRed',
      'red', 'goldenRod', 'hotPink', 'cadetBlue', 'seaGreen',
      'chocolate', 'blueViolet', 'firebrick'
    ]
    return colors[this.number(0, colors.length)]
  }

  direction = () => {
    const directions = ['left', 'right']
    return directions[this.number(0, directions.length)]
  }

  y = (fontSize: number) => {
    let innerHeight = this.number(0, window.innerHeight)
    const maximumHeight = window.innerHeight - (fontSize * 16)
    if (innerHeight >= maximumHeight) {
      innerHeight -= (fontSize * 16)
    }
    return innerHeight
  }

  duration = (userstate = false) => {
    const durations = ['slower', 'slow', 'normal', 'fast', 'faster']
    return userstate ? durations[0] : durations[this.number(0, durations.length)]
  }
}
