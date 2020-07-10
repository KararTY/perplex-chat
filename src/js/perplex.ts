import { html } from 'uhtml'
import { ChatClient } from 'dank-twitch-irc'
import Random from './random'

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

    const parent = document.getElementById('perplexchat').querySelector('.marquee')

    const date = msg.serverTimestamp
    const seededRandom = new Random(date.getTime())

    const { size, color, direction, y, duration } = seededRandom
    const sSize = size()

    const words = msg.messageText.split(' ')

    const node = html.node`<p data-message="${msg.messageID}" data-user="${msg.senderUsername}" class="${`message ${direction()} ${duration()} ${color()}`}" onanimationend="${ev => { ev.currentTarget.outerHTML = '' }}" style="${`top:${y(sSize.px)}px;font-size:${sSize.rem};height:${sSize.rem};`}">${msg.messageText}</p>`

    // Replace emotes with placeholders
    for (let index = 0; index < words.length; index++) {
      const word = words[index]

      let url: string
      const regex = new RegExp(escapeRegExp(word))

      const matchesFlags = msg.flags.find(flag => flag.word === word)
      const matchesTwitch = msg.emotes.find(emote => emote.code === word)
      const matchesFFZ = ffzEmotes.find(emote => emote.name === word)
      const matchesBTTV = bttvEmotes.find(emote => emote.code === word)

      if (matchesFlags !== undefined) {
        const censorStars = Array(word.length).fill('*').join('')
        node.innerHTML = node.innerHTML.replace(new RegExp(escapeRegExp(word)), censorStars)
      } else if (matchesTwitch !== undefined) {
        url = `//static-cdn.jtvnw.net/emoticons/v1/${matchesTwitch.id}/3.0`
      } else if (matchesFFZ !== undefined) {
        const emoteUrls = Object.keys(matchesFFZ.urls).map(key => matchesFFZ.urls[key])
        url = emoteUrls[emoteUrls.length - 1]
      } else if (matchesBTTV !== undefined) {
        url = `//cdn.betterttv.net/emote/${matchesBTTV.id}/3x`
      }

      if (url) {
        node.innerHTML = node.innerHTML.replace(regex, `<img src="${url}"/>`)
      }
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
    const node = document.querySelector(`[data-message="${ev.targetMessageID}"]`)
    if (node !== null) node.outerHTML = ''
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
