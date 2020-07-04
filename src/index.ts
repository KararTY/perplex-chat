import { html } from 'uhtml'
import { ChatClient } from 'dank-twitch-irc'

// This is a "Proof of Concept", it's not complete yet.

const urlParams = new URLSearchParams(window.location.search)

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
const randomNumber = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}

const randomSize = () => {
  const sizes = [16, 24, 32, 48, 64]
  return sizes[randomNumber(0, sizes.length)]
}

const randomColor = () => {
  const colors = ['blue', 'coral', 'dodgerBlue',
    'springGreen', 'yellowGreen', 'green', 'orangeRed',
    'red', 'goldenRod', 'hotPink', 'cadetBlue', 'seaGreen',
    'chocolate', 'blueViolet', 'firebrick'
  ]

  return colors[randomNumber(0, colors.length)]
}

const randomDirection = () => {
  const directions = ['left', 'right']
  return directions[randomNumber(0, directions.length)]
}

const randomY = (fontSize: number) => {
  let innerHeight = randomNumber(0, window.innerHeight)

  const maximumHeight = window.innerHeight - fontSize

  if (innerHeight >= maximumHeight) {
    innerHeight -= fontSize
  }

  return innerHeight
}

const client = new ChatClient({
  connection: {
    type: 'websocket',
    secure: true
  }
})

client.on('ready', () => console.log('Successfully connected to chat'))
client.on('close', (error) => {
  if (error != null) {
    console.error('Client closed due to error', error)
  }
})

client.on('PRIVMSG', (msg) => {
  const parent = document.getElementById('perplexchat').querySelector('.marquee')

  const size = randomSize()

  const node = html.node`<span class="${`${randomDirection()} ${randomColor()}`}" onanimationend="${(ev) => { ev.currentTarget.outerHTML = '' }}" style="${`top:${randomY(size)}px;font-size:${size}px;`}">${msg.messageText}</span>`

  parent.append(node)
})

client.connect()

client.join(urlParams.get('channel') || 'harmfulopinions')
