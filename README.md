# Perplex Chat
## Remake of Wild Chat

### What it does
A chat message gets a random color, font size, speed and direction (Comes in from the left or right).
The message then gets assigned a random Y position, and starts the animation.

### How to try it out
Browse to https://alremahy.com/perplex-chat.html?channel=harmfulopinions, enter a chat name and watch the magic happen.

### What it uses
In no particular order:
  * [dank-twitch-irc](https://github.com/robotty/dank-twitch-irc) for retrieving Twitch messages.
  * [uHTML](https://github.com/WebReflection/uhtml) for rendering HTML templates.
  * [Mersenne Twister](https://gist.github.com/banksean/300494) for seeded randomization.
  * [node-sass](https://github.com/sass/node-sass) for stylesheet management.
  * [Parcel 2](https://github.com/parcel-bundler/parcel/) for packing the files for use in the browser.

### How to build it yourself
  1. Make sure you have NodeJS (Latest LTS works).
  2. `npm i` to install modules.
  3. `npm start` to build it.
  4. You can now host the contents of the `/dist` folder wherever you'd like.
  * For testing purposes you can try it out locally with python3:
    * `cd ./dist && python -m http.server`

### Ideas for the future
  * Settings modal:
    * Background color
    * Font changer (?)
    * Disable emotes (Twitch, BTTV, FFZ)
    * Change font sizes.

Thanks to Twitch users `@idmgroup` & `@miaam` for the idea & inspiration.
