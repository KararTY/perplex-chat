import { html } from 'uhtml'
import { ChatClient } from 'dank-twitch-irc'
import Random from './random'
import autoModCheck from './automod'

// This is a "Proof of Concept".

const urlParams = new URLSearchParams(window.location.search)

const escapeRegExp = (text: string) => {
  return text.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
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
  try {
    if (!loadedEmotes) {
      loadedEmotes = true
      getEmotes(msg.channelID)
    }

    if (document.visibilityState === 'hidden') {
      return
    }

    let message = msg.messageText

    const wordsToCensor = autoModCheck(msg.ircTags.flags, msg.messageText)

    for (let index = 0; index < wordsToCensor.length; index++) {
      const word = wordsToCensor[index].WORD
      const censorStars = Array(word.length).fill('*').join('')
      message = message.replace(new RegExp(escapeRegExp(word)), censorStars)
    }

    const parent = document.getElementById('perplexchat').querySelector('.marquee')

    const date = msg.serverTimestamp
    const seededRandom = new Random(date.getTime())

    const { size, color, direction, y, duration } = seededRandom
    const sSize = size()

    const words = msg.messageText.split(' ')

    const node = html.node`<p data-message="${msg.messageID}" data-user="${msg.senderUsername}" class="${`message ${direction()} ${duration()} ${color()}`}" onanimationend="${ev => { ev.currentTarget.outerHTML = '' }}" style="${`top:${y(sSize.px)}px;font-size:${sSize.rem};height:${sSize.rem};`}"></p>`

    const placeholders = []

    // Replace Twitch emotes with placeholders
    for (let index = 0; index < msg.emotes.length; index++) {
      const emote = msg.emotes[index]
      const string = String(placeholders.length)

      const regex = new RegExp(escapeRegExp(msg.messageText.substring(emote.startIndex, emote.endIndex)))
      message = message.replace(regex, `-@${string}-`)
      placeholders.push({
        string,
        url: `//static-cdn.jtvnw.net/emoticons/v1/${emote.id}/3.0`
      })
    }

    // Replace FFZ & BTTV emotes with placeholders
    for (let index = 0; index < words.length; index++) {
      const word = words[index]

      const matchesFFZ = ffzEmotes.find(emote => emote.name === word)
      const matchesBTTV = bttvEmotes.find(emote => emote.code === word)

      const string = String(placeholders.length)
      if (matchesFFZ !== undefined) {
        const regex = new RegExp(escapeRegExp(word))
        const emoteUrls = Object.keys(matchesFFZ.urls).map(key => matchesFFZ.urls[key])
        message = message.replace(regex, `-@${string}-`)
        placeholders.push({
          string,
          url: emoteUrls[emoteUrls.length - 1]
        })
      } else if (matchesBTTV !== undefined) {
        const regex = new RegExp(escapeRegExp(word))
        const emoteUrl = `//cdn.betterttv.net/emote/${matchesBTTV.id}/3x`
        message = message.replace(regex, `-@${string}-`)
        placeholders.push({
          string,
          url: emoteUrl
        })
      }
    }

    node.innerHTML = message

    const emoteMatch = message.match(/-@[0-9]+-/g)
    for (let index = 0; index < (emoteMatch ? emoteMatch.length : 0); index++) {
      const match = emoteMatch[index]
      const placeholderMatch = placeholders.find(placeholder => placeholder.string === match.replace(/[^0-9]/g, ''))

      const htmlString = `<img src="${placeholderMatch.url}"/>`
      node.innerHTML = node.innerHTML.replace(match, htmlString)
    }

    parent.append(node)
  } catch (error) {
    console.error(error)
  }
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
