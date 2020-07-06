import { html } from 'uhtml'
import { ChatClient } from 'dank-twitch-irc'
import Twister from './mersenne-twister'

// This is a "Proof of Concept".

const urlParams = new URLSearchParams(window.location.search)

class Random {
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
      innerHeight -= (fontSize + 32)
    }
    return innerHeight
  }

  duration = () => {
    const durations = ['slower', 'slow', 'normal', 'fast', 'faster']
    return durations[this.number(0, durations.length)]
  }
}

const escapeRegExp = (text: string) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

const channel = urlParams.get('channel') || 'harmfulopinions'

const ffzEmotes = []
const bttvEmotes = []

let loadedEmotes = false

function getEmotes (channelId) {
  // All of these should be allowed to fail.

  fetch(`https://api.frankerfacez.com/v1/room/${channel}`).then(res => res.json()).then(res => {
    if (!res.error) {
      ffzEmotes.push(...res.sets[res.room.set].emoticons)
    }
  })

  fetch('https://api.frankerfacez.com/v1/set/global').then(res => res.json()).then(res => {
    ffzEmotes.push(...res.sets[res.default_sets[0]].emoticons)
  })

  fetch('https://api.betterttv.net/3/cached/emotes/global').then(res => res.json()).then(res => {
    bttvEmotes.push(...res)
  })

  fetch(`https://api.betterttv.net/3/cached/users/twitch/${channelId}`).then(res => res.json()).then(res => {
    if (!res.message) {
      bttvEmotes.push(...res.sharedEmotes)
      bttvEmotes.push(...res.channelEmotes)
    }
  })
}

const client = new ChatClient({
  connection: {
    type: 'websocket',
    secure: true
  }
})

client.on('ready', () => console.log('Successfully connected to chat'))
client.on('close', error => {
  if (error != null) {
    console.error('Client closed due to error', error)
  }
})

client.on('PRIVMSG', msg => {
  if (!loadedEmotes) {
    loadedEmotes = true
    getEmotes(msg.channelID)
  }

  if (document.visibilityState === 'hidden') {
    return
  }

  const parent = document.getElementById('perplexchat').querySelector('.marquee')

  const date = msg.serverTimestamp
  const seededRandom = new Random(date.getTime())

  const { size, color, direction, y, duration, number: rNumber } = seededRandom
  const sSize = size()

  const words = msg.messageText.split(' ')

  const node = html.node`<p data-message="${msg.messageID}" data-user="${msg.senderUsername}" class="${`message ${direction()} ${duration()} ${color()}`}" onanimationend="${ev => { ev.currentTarget.outerHTML = '' }}" style="${`top:${y(sSize.px)}px;font-size:${sSize.rem};height:${sSize.rem};`}"></p>`

  let message = msg.messageText

  const placeholders = []

  // Replace Twitch emotes with placeholders
  for (let index = 0; index < msg.emotes.length; index++) {
    const emote = msg.emotes[index]
    const timestamp = String(Date.now() + rNumber(1, 10))

    const regex = new RegExp(`${escapeRegExp(msg.messageText.substring(emote.startIndex, emote.endIndex))}`)
    message = message.replace(regex, `-@${timestamp}-`)
    placeholders.push({
      timestamp,
      url: `//static-cdn.jtvnw.net/emoticons/v1/${emote.id}/3.0`
    })
  }

  // Replace FFZ & BTTV emotes with placeholders
  for (let index = 0; index < words.length; index++) {
    const word = words[index]

    const matchesFFZ = ffzEmotes.find(emote => emote.name === word)
    const matchesBTTV = bttvEmotes.find(emote => emote.code === word)

    const timestamp = String(Date.now() + rNumber(1, 10))
    if (matchesFFZ !== undefined) {
      const regex = new RegExp(`${escapeRegExp(word)}`)
      const emoteUrls = Object.keys(matchesFFZ.urls).map(key => matchesFFZ.urls[key])
      message = message.replace(regex, `-@${timestamp}-`)
      placeholders.push({
        timestamp,
        url: emoteUrls[emoteUrls.length - 1]
      })
    } else if (matchesBTTV !== undefined) {
      const regex = new RegExp(`${escapeRegExp(word)}`)
      const emoteUrl = `//cdn.betterttv.net/emote/${matchesBTTV.id}/3x`
      message = message.replace(regex, `-@${timestamp}-`)
      placeholders.push({
        timestamp,
        url: emoteUrl
      })
    }
  }

  node.innerHTML = message

  const emoteMatch = message.match(/-@[0-9]{13}-/g)
  for (let index = 0; index < (emoteMatch ? emoteMatch.length : 0); index++) {
    const match = emoteMatch[index]
    const placeholderMatch = placeholders.find(placeholder => placeholder.timestamp === match.replace(/[^0-9]/g, ''))

    const htmlString = `<img src="${placeholderMatch.url}"/>`
    node.innerHTML = node.innerHTML.replace(match, htmlString)
  }

  parent.append(node)
})

function deleteMessage (ev) {
  if (ev.wasChatCleared && ev.wasChatCleared()) {
    document.querySelector('.marquee').innerHTML = ''
  } else if (ev.targetMessageID) {
    document.querySelector(`[data-message="${ev.targetMessageID}"]`).outerHTML = ''
  } else if (ev.targetUsername) {
    document.querySelectorAll(`[data-user="${ev.targetUsername}"`).forEach(el => {
      el.outerHTML = ''
    })
  }
}

client.on('CLEARMSG', deleteMessage)
client.on('CLEARCHAT', deleteMessage)

client.connect()

client.join(channel)
