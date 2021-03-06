# Nya
A public forum for things I (and Zeb) have made for my Discord bot Nya, running [Wildbeast](https://github.com/TheSharks/WildBeast).
For simplicity, commands shall be included in "command.js", as they are in the custom commands option of Wildbeast. Everything else, filenames point the way.

# Changes

## In-Line
1. Altered relog handler to allow reconnections up to 10 times (instead of dying on the second attempt).
2. Altered startup to reflect such onto the bot's "Now playing", since my external libraries load after the bot connects.
3. Added "youtube tripping", which fires when the bot detects a youtube link, to provide useful information(selectively ignores itself and other bots/rooms). 

![YTTrip](http://i.imgur.com/SaVsrti.png)


## Commands
1. [color (args)]: Resolves user's main role (The one that defines their color), and sets it to a user supplied value.
	- This requires [manage roles] and the bot to be elevated above those It's changing. 
2. [awwnime]: Returns random picture from the front page of Awwnime and related reddit boards. 
3. [radio]: Attempts to retrieve title information from the current audio stream.
4. [mm]: Magic message test iterator. Still used for testing.

![MagicMessage](http://i.imgur.com/abLK3Fv.gif "MagicMessage")

5. [sauce (args)]: Submits user supplied image to SauceNao (or IQDB) image search.
	- Embed displays -guessed- image from search, to aid visibility of result correctness.
	- Currently, only link are the defining order, and are sorted from highest to lowest priority:
	- Pixiv > Sankaku > e621 > default(if present)

![Pixiv result type](http://i.imgur.com/wfT7e28.png "Pixiv result type")
![Nonstandard/Other](http://i.imgur.com/rwc3XMn.png "Nonstandard/Other result type")
![Incorrect result](http://i.imgur.com/HF5jSUi.png "Incorrect result")




