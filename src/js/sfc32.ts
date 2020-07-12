/**
 * Yet another chaotic PRNG, the sfc stands for "Small Fast Counter". It is part of the PracRand PRNG test suite. It passes PractRand, as well as Crush/BigCrush (TestU01).
 *
 * From [github/michaeldzjap/rand-seed](https://github.com/michaeldzjap/rand-seed/blob/develop/src/Algorithms/Sfc32.ts)
 */
export default class Sfc32 {
  /**
   * Seed parameters.
   *
   * @var {number}
   */
  private _a: number
  private _b: number
  private _c: number
  private _d: number

  /**
   * Create a new sfc32 instance.
   */
  constructor (str: string) {
    // Create the seed for the random number algorithm
    const seed = this.xmur3(str)
    this._a = seed()
    this._b = seed()
    this._c = seed()
    this._d = seed()
  }

   xmur3 = (str: string) => {
     for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
       h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
       h = h << 13 | h >>> 19
     }
     return function () {
       h = Math.imul(h ^ h >>> 16, 2246822507)
       h = Math.imul(h ^ h >>> 13, 3266489909)
       return (h ^= h >>> 16) >>> 0
     }
   }

   /**
    * Generate a random number using the sfc32 algorithm.
    */
  number = () => {
    this._a >>>= 0; this._b >>>= 0; this._c >>>= 0; this._d >>>= 0
    let t = (this._a + this._b) | 0
    this._a = this._b ^ this._b >>> 9
    this._b = this._c + (this._c << 3) | 0
    this._c = (this._c << 21 | this._c >>> 11)
    this._d = this._d + 1 | 0
    t = t + this._d | 0
    this._c = this._c + t | 0

    return (t >>> 0) / 4294967296
  }
}
