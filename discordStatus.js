Commands.discordStatus = {
  name: 'discordStatus',
  help: "Discord, are you okay?",
  aliases: ['ds'],
  module: 'default',
  timeout: 10,
  typing: true,
  level: '0',
  fn: function (msg, suffix, bot) {
	  var url = "https://discord.statuspage.io/history.atom"
	  request(url, function(error, response, body) {
			if (!error) {
				var xml2js = require('xml2js')
				xml2js.parseString(body, (err, reply) => {
					
				if (err) {
					msg.channel.sendMessage('The API returned an unconventional response.')
					console.log(reply)
				} else {
					
					var title = reply.feed.title;
					var updated = reply.feed.updated;
					var latestEntry = reply.feed.entry[0];
					
					var safeC = latestEntry.content[0]["_"];
					
					
					//html entity and unicode filtering
					entities = new Entities();
					safeC = entities.decode(safeC)
			
					rec = /\\u([\d\w]{4})/gi;
					safeC = safeC.replace(rec, function (match, grp) {
						return String.fromCharCode(parseInt(grp, 16)); } );
					safeC = unescape(safeC);
					
					
					safeC = safeC.replace(/<(?:.|\n)*?>/gm, ' ');
					
					var fullR = safeC;
					
					var sForm = safeC.split(/(\r\s\r)+/)
					firstPlz = sForm[0]
					firstPlz = firstPlz.trim()
					
					if(suffix === "full"){
						if (fullR.length >= 1500) {
							report = fullR.substring(0,1500) + "... (report truncated, read full online.)";
						} else {
							report = fullR;
						}
					} else {
						if (firstPlz.length >= 1500) {
							report == firstPlz.substring(0,1500) + "... (report truncated, read full online.)";
						} else {
							report = firstPlz;
						}
					}
					
					msgArray = []
					
					msgArray.push("```")
					msgArray.push(title)
					msgArray.push(latestEntry.title)
					msgArray.push(" ")
					msgArray.push(report)
					msgArray.push("```")
					msgArray.push("https://status.discordapp.com/")
					
					msg.channel.sendMessage(msgArray.join('\n'))
					
				}
				})
				
			} else {
				msg.reply("Something went wrong, Nya! #1")
				console.log(body)
			}
		})
}
}