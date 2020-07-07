interface AutoModdedWord {
  WORD: string
  COORDS: [number, number]
  IDENTITY?: number
  SEXUAL?: number
  AGGRESSIVE?: number
  PROFANITY?: number
}

export default function check (filter: string, string: string) {
  const autoModFlags = []

  if (filter.length > 0) {
    const matches = filter.split(',')

    // Lodash library regexp for matching emojis.
    const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g

    const emojiIndexes = []

    let m
    while ((m = regex.exec(string))) {
      emojiIndexes.push(m.index)
    }

    for (let index = 0; index < matches.length; index++) {
      const match = matches[index]

      const coordsAndScores = match.split(':')

      let [startIndex, endIndexInclusive] = coordsAndScores[0].split('-').map(i => Number(i))

      // Fix coords here
      // Fix for when emojis exist before this emote.
      const emojiCount = emojiIndexes.reduce((acc, emojiIndex) => {
        const addOne = emojiIndex <= startIndex + acc
        return addOne ? acc + 1 : acc
      }, 0)

      startIndex += emojiCount
      endIndexInclusive += emojiCount + 1

      const word = string.substring(startIndex, endIndexInclusive)

      const flag: AutoModdedWord = {
        WORD: word,
        COORDS: [startIndex, endIndexInclusive]
      }

      const scores = coordsAndScores[1].split('/')

      for (let index = 0; index < scores.length; index++) {
        const scoreStr = scores[index]

        const score = scoreStr.split('.')

        switch (score[0]) {
          case 'I':
            flag.IDENTITY = Number(score[1])
            break
          case 'S':
            flag.SEXUAL = Number(score[1])
            break
          case 'A':
            flag.AGGRESSIVE = Number(score[1])
            break
          case 'P':
            flag.PROFANITY = Number(score[1])
            break
        }
      }

      autoModFlags.push(flag)
    }
  }

  return autoModFlags
}
