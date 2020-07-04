import { render, html } from 'uhtml'
import { ChatClient } from 'dank-twitch-irc'

const client = new ChatClient({
  connection: {
    type: 'websocket',
    secure: true
  }
})

render(document.body, html`
  <h1>µhtml works!</h1>
  <br>
  <pre>${JSON.stringify(client.configuration, null, 2)}</pre>
`)
