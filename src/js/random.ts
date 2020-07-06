import Twister from './mersenne-twister'

export default class Random {
  private twister: Twister

  constructor (seed: number) {
    this.twister = new Twister(seed)
  }

  number = (min: number, max: number) => {
    max--
    const rnd = this.twister.random()
    const floored = Math.floor(rnd * (max - min + 1) + min)
    return floored
  }

  size = () => {
    const sizes = [
      { rem: '1rem', px: 16 },
      { rem: '1.5rem', px: 24 },
      { rem: '2rem', px: 32 },
      { rem: '2.5rem', px: 40 },
      { rem: '3rem', px: 48 }
    ]
    return sizes[this.number(0, sizes.length)]
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
    const maximumHeight = window.innerHeight - fontSize
    if (innerHeight >= maximumHeight) {
      innerHeight -= fontSize
    }
    return innerHeight
  }

  duration = () => {
    const durations = ['slower', 'slow', 'normal', 'fast', 'faster']
    return durations[this.number(0, durations.length)]
  }
}
