# Perplex Chat

[Demo](https://remahy.com/perplex-chat/?channel=twitchmedia_qs_10) (Tip: Change `?channel=` value in URL to another livestreamer, or append `&noembed` in URL to disable the live video.)

## Remake of Wild Chat

### What it does

<p align="center">
  <img src="./Example.png" alt="A normal Twitch chat." />
  <br>A normal Twitch chat.
</p>

### What it uses

* [dank-twitch-irc](https://github.com/mastondzn/dank-twitch-irc) for retrieving Twitch messages.
* [uHTML](https://github.com/WebReflection/uhtml) for rendering HTML nodes.
* [Sfc32](https://github.com/michaeldzjap/rand-seed/blob/develop/src/Algorithms/Sfc32.ts) for PRNG.
* [xmur3](https://github.com/bryc/code/blob/master/jshash/PRNGs.md#addendum-a-seed-generating-functions) for seeding the PRNG.
* [sass](https://github.com/sass/dart-sass) for stylesheet management.
* [Parceljs](https://github.com/parcel-bundler/parcel/) for packing the files for use in the browser.

### How to build it yourself

1. Make sure you have NodeJS (Latest LTS works).
2. `npm i` to install modules.
3. `npm build` to build it.
4. You can now host the contents of the `/dist` folder wherever you'd like.

* For testing purposes you can try it out locally with python3:
  * `npm run preview`

### Ideas for the future

* Settings modal:
  * Text colors to be changed.
  * Customization of the text shadow.
  * Font changer (?).
  * Change font sizes.
  * Enable / Disable emotes (Twitch, BTTV, FFZ).
  * Enable / Disable AutoMod filter (IDENTITY, AGGRESSIVE, SEXUAL, PROFANITY).
* Add bits & cheer emotes.

Thanks to Twitch users `@idmgroup` & `@miaam` for the inspiration & the original Wild Chat software for the idea.
