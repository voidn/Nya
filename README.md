# Nya
A public forum for things I (and Zeb) have made for my Discord bot Nya, running [Wildbeast](https://github.com/TheSharks/WildBeast).
For simplicity, commands shall be included in "command.js", as they are in the custom commands option of Wildbeast. Everything else, filenames point the way.

# Changes

## In-Line
1. Altered relog handler to allow reconnections up to 10 times (instead of dying on the second attempt).
2. Altered startup to reflect such onto the bot's "Now playing", since my external libraries load after the bot connects.
3. Added "youtube tripping", which fires when the bot detects a youtube link, to provide useful information(selectively ignores itself and other bots/rooms). 
<p align="center">
![YTTrip](http://i.imgur.com/SaVsrti.png "YTTrip")
</p>

## Commands
1. [color (args)]: Resolves user's main role (The one that defines their color), and sets it to a user supplied value. 
2. [awwnime]: Returns random picture from the front page of Awwnime and related reddit boards. 
3. [radio]: Attempts to retrieve title information from the current audio stream.
4. [mm]: Magic message test iterator. Still used for testing.
<p align="center">
![MagicMessage](http://i.imgur.com/abLK3Fv.gif "MagicMessage")
</p>
5. [sauce (args)]: Submits user supplied image to SauceNao (or IQDB) image search.
<p align="center">
![Pixiv result type](http://i.imgur.com/spLPspF.png "Pixiv result type")
![Pixiv result type](http://i.imgur.com/RmxprjD.png "Twitter result type")
![Nonstandard/Unknown result type](http://i.imgur.com/UXZ4uDE.png "Nonstandard/Unknown result type")
</p>


