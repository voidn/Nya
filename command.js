var Entities = require('html-entities').AllHtmlEntities;
ent = require("entities");
var cheerio = require("cheerio");
var speedTest = require('speedtest-net');

//Note: Regex is messy as shit, I know. Lots of old code mixed with new here.

//To-do:
//  [x]   Make sauce multi-sourced: separate pixiv results from others, identify as such
//  [x]   Awwnime pictures
//  [o]   Bot deletes command input, use "bot.Messages.get('message_ID')" > Delete.
//  [o]   Catch Seiga sauce results to properly link	
//  [o]   Room limit CDL
//  [o]   Reverse google sauce as well?


Commands.color = {
  name: 'color',
  help: "Provide me with a Hexdecimal color code and i can change your primary role color!",
  aliases: ['c'],
  module: 'default',
  timeout: 10,
  typing: true,
  level: '0',
  fn: function (msg, suffix, bot) {
	//hex color converter
	if(/(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i.test(suffix)){
		safeColor = parseInt(suffix, 16);
	try{
		top = msg.member.roles.map(function(role){return role.position}).sort(function (a,b){ return a-b}).reverse()[0];
		role = msg.guild.roles.filter(function( role ) { return role.position == top})[0];
		role.commit(role.name, safeColor);
		msg.reply("I've changed your primary role color to " + suffix) 
	} catch (err) {
		console.log(err)
	}		
	} else {
		msg.reply("Please provide a 6 character Hexidecimal color code(no #) https://www.google.com/search?q=hex+color")
	}
}
}

Commands.sauce = {
    name: 'sauce',
    help: "Submit an image for indexing on IQDB.",
    aliases: ['source'],
    module: 'default',
    timeout: 10,
    level: 0,
    //To-Do: Fucking yeah

    fn: function(msg, suffix, bot) {
        if (suffix.length < 1) {
            msg.reply('You need an image to search!');
        } else {
            msg.channel.sendTyping()
            var request = require("request"),
                url = "https://saucenao.com/search.php?db=999&output_type=2&numres=16&url="+suffix+"&api_key="+config.api_keys.sauce;

            //Alert for non-image
            if (suffix.match(/\.(jpeg|jpg|gif|png)$/)) {

                request(url, function(error, response, body) {
                    if (!error) {
						var sbody = JSON.parse(body)
						var results = (sbody.results[0])
						var similarity = (sbody.results[0].header.similarity)
						var indexer = (sbody.results[0].header.index_name)
						var thumbnail = (sbody.results[0].header.thumbnail)
						console.log(results)
						
						//result sorting
						//Grabs availiable link, in order of this set priority, and defaults eventually
						//This way, only a single link is displayed (the most relevant one?)
						//Do all of these need (sbody.results[0].data.source) checks?
						
						if (indexer.indexOf("Pixiv") !== -1){
							var author = (sbody.results[0].data.member_name)
							var link = (sbody.results[0].data.pixiv_id)
							var rTitle = (sbody.results[0].data.title)
							var link = "http://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + link;
						} else if(indexer.indexOf("Sankaku") !== -1){
							var author = (sbody.results[0].data.member_name)
							var sID = (sbody.results[0].data.sankaku_id)
							var link = "https://chan.sankakucomplex.com/post/show/" + sID;
						} else if(indexer.indexOf("e621") !== -1){
							var author = (sbody.results[0].data.creator)
							var sID = (sbody.results[0].data.e621_id)
							var link = "https://e621.net/post/show/" + sID;
						} else {
							var author = (sbody.results[0].data.creator)
							var link = (sbody.results[0].data.source)
							var rTitle = "Untitled"
						}
						
						if(similarity > 90){
							mReaction = "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧ "
						}else{
							mReaction = "¯\\_(ツ)\_/¯"
						}

						//Array the uncommon artist links if present
						//Do this on a case-by-case basis
						linkArray = []
						
						
						
						//Deliver message
                        msg.reply("", false, {
                                    color: 0x3498db,
                                    author: {
                                        name: similarity + "% match " + mReaction
                                    },
                                    thumbnail: {
                                        url: thumbnail
                                    },
                                    //description takes lots of room on mobile, so disabled for now
                                    title: "",
                                    //timestamp: date,
                                    fields: [{
                                        name: "Author: " + author + " -- ["+rTitle+"]",
                                        value: "Sauce: " + link,
                                    }],
                                    footer: {
                                        text: "" + indexer
                                    }
                                })

                    } else {
                        console.log("We’ve encountered an error: " + error);
                    }
                });
            } else {
                msg.reply("I'm only able to search images, make sure it's a valid image extension! (jpeg | jpg | gif | png)");
            };
        }
    }
}

//Awwnime reddit picture fetch
Commands.awwnime = {
  name: 'awwnime',
  help: "I'll get a randome picture from the front page of /r/awwnime for you!",
  aliases: ['awwnime', 'a', 'schoolgirl'],
  module: 'default',
  timeout: 10,
  level: '0',
  fn: function (msg, suffix) {
	/// Until Snoowrap is fixed do dirty
		msg.channel.sendTyping()
		var request = require("request"),
		cheerio = require("cheerio"),
		//Lul Api
		sites = ["https://www.reddit.com/r/awwnime/.api","https://www.reddit.com/r/animegifs/.api"]
		chosen = sites[Math.floor(Math.random() * sites.length)];
		url = chosen;
  
		request(url, function (error, response, body) {
		if (!error) {
			var $ = cheerio.load(body),
			  stuff = body;
			  matches = body.match(/url(.+?)created_utc/g)
			
			rSelector = Math.floor((Math.random() * matches.length));
			rSelection = matches[rSelector];
			rSelection = JSON.stringify(rSelection)
		
			
			//Get Title
			title = rSelection.match(/title(.+?)created_utc/g)
			title = JSON.stringify(title)
			title = title.replace('["title\\\\\\"','')
			title = title.replace(': \\\\\\','')
			title = title.replace('\\\\\\','')
			title = title.replace(', \\\\\\"created_utc"]','')
			title = title.replace(/<(?:.|\n)*?>/gm, ' ');
			
			//html entity and unicode filtering
			entities = new Entities();
			title = entities.decode(title)
			
			rec = /\\u([\d\w]{4})/gi;
			title = title.replace(rec, function (match, grp) {
				return String.fromCharCode(parseInt(grp, 16)); } );
			title = unescape(title);
			//Get rid of those stupid escapes that get everywhere
			title = title.replace(/\\/g, "")
			
			
			//Get Link
			link = rSelection.match(/created(.+?)author_flair_text/g)
			link = JSON.stringify(link)
			link = link.replace('[\"created\\\\\\\":','Timestamp:')
			link = link.replace(', \\\\\\\"url\\\\\\\": \\\\\\\"',' \n')
			link = link.replace('\\\\\\\", \\\\\\"author_flair_text\"]','')
			
			
			
			//Get time from link
			numberPattern = /\d+/g;
			timestamp = link.match(numberPattern)
			
			if (title == null) {
				title == "Unknown"
			}
			
			try {
			if (timestamp[0] != null){
				selectedtime = timestamp[0]
				//and convert from unix timestamp
				//Is this format Okay?
				date = new Date(selectedtime*1000);
			} else {
				date = "Unknown Date"
				console.log("Nya!")
			}}
			
			catch (error) {
				date = "Unknown Date"
				console.log("Date error encountered")
				console.log(link)
				console.log(title)
			}
			
			
			//Remove Unix stamp from link
			link_array = link.split(' ')
			linkx = link_array[2]
			
			
			//Non-image filtering/Non-link filtering
			if (linkx != null){
			if (linkx.match(/\.(jpeg|jpg|gif|png|gifv)$/)){
				msg.reply("```" + title + "``` " + date + " " + linkx)
			} else {
				msg.reply(linkx)
			}} else {
				msg.reply("Result ```" + title + "``` Has no image. :<")
			}
			
			
		} else {
			msg.reply('Oops! Something went wrong. Let Void know :sob:' + error)
			console.log("We’ve encountered an error: " + error);
		}	
})	
}
}

Commands.urlping = {
  name: 'urlping',
  help: "I'll ping a url for you!",
  module: 'default',
  timeout: 10,
  level: 1,
  fn: function (msg, suffix) {
	if(suffix.length < 1){
		msg.reply('You need to supply me with a url to ping!');
	} else {
		//url open
		msg.channel.sendTyping()
		var request = require("request"),
		cheerio = require("cheerio"),
		url = "http://api.hackertarget.com/nping/?q=" + suffix;
		
		//pull response
		request(url, function (error, response, body) {
	if (!error) {
		var $ = cheerio.load(body),
		  status = 'active';
		  //cut info
		  matches = body.match(/Max[\s\S]*seconds/g)
		  matches = JSON.stringify(matches)
		  matches = matches.replace('["','')
		  matches = matches.replace('"]','')
		  matches = matches.replace(/\\n/g, ' ')
		  console.log(matches)
		  
		  var msgArray = []
		  msgArray.push('```xl\n')
		  msgArray.push(matches)
		  msgArray.push('```')
		msg.reply(msgArray)
	} else {
		msg.reply('Oops! Something went wrong. Let Void know :sob:' + error)
		console.log("We’ve encountered an error: " + error);
	};
	})
  }	
}
}

//Magical message stuff, this is highly experimental
Commands.magicmessage = {
  name: 'magicmessage',
  help: "Magic Message Testing~",
  aliases: ['mm'],
  module: 'default',
  timeout: 10,
  level: 'master',
  fn: function (msg, suffix, bot) {
	//Zeb's constructor
	display = new Display();
	
	display.dimensions.y = 20;
	
	//a1.map supplied
	display.loadFromFile("a1.map", "primary", false, false, undefined, undefined, new display.Vector2(0, 20))
	display.loadFromString("Hello!", "overlay", false, false, new display.Rect(0, 1, 3, 29), new display.Vector2(29, 3), new display.Vector2(0, 1));
	display.loadFromString("Scrolling up in heer yo", "overlay2", false, false, new display.Rect(0, 15, 4, 29), new display.Vector2(29, 3), new display.Vector2(0, 1));

	display.hBars = [4, 15];

	display.startClock("update", 1500, function(){

		display.textBlocks["primary"].scroll.x++;
		display.textBlocks["overlay"].scroll.x += 4;
    
    
	Content = display.drawBorderedDisplay();
	newC = ("```" + Content + "```")
	
	//Select where to update static message
	bot.Messages.editMessage(newC, "-----", "-----");
});
	
  }
}

exports.Commands = Commands
