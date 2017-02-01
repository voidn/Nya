//Youtube response
//TO-DO: 
// 		Update bot and channel checking to use external server file
bot.Dispatcher.on(Event.MESSAGE_CREATE, e => {
    var vRX = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        if (e.message.content.search(vRX) !== -1) {
            //trip youtube info fetch

			//New sorting, move to dynamic server file later
			var users = ['']
			var bots = ['Allie','weedle','Nya'];
			var guilds = [''];
			var channels = ['music_queue'];
			
            if (bots.includes(e.message.author.username)) {
                //Well shit son
            } else if (users.includes(e.message.author.username)) {
                //Well shit son
            } else if (channels.includes(e.message.channel.name)) {
                //Well shit son
            } else if (guilds.includes(e.message.guild.name)) {
                //Well shit son
            } else {
                //Get video URL from message, since it may contain content other than video
                var sMessage = (e.message.content)
                var match = sMessage.match(vRX);
                if (match && match[2].length == 11) {
                    match = match[2];
                } else {
                    //Well shit son, you somehow ballsed up the url
					return
                }
                var request = require("request"),
                    //No more CHEERIO!?!? 
                    url = "https://www.googleapis.com/youtube/v3/videos?id=" + match + "&part=statistics,snippet&fields=items(snippet(title)),items(snippet(publishedAt)),items(statistics(likeCount)),items(statistics(dislikeCount)),items(statistics(viewCount))&key=" + Config.api_keys.google;

                //pull response
                request(url, function(error, response, body) {
                    if (!error) {
                        try {
                            var sbody = JSON.parse(body)
                            var title = (sbody.items[0].snippet.title);
                            var views = (sbody.items[0].statistics.viewCount);
                            views = views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            var date = (sbody.items[0].snippet.publishedAt);
                            var likes = (sbody.items[0].statistics.likeCount);
                            likes = Number(likes)
                            var dislikes = (sbody.items[0].statistics.dislikeCount);
                            dislikes = Number(dislikes)

                            //Global catch, for video id's that don't really exist
                            if (title == null) {
                                //You cheeky bugger, that's not a real video
                            } else {
                                //html entity and unicode filtering for title
                                var entities = new Entities();
                                title = entities.decode(title)

                                //Like ratio
                                var total = (likes + dislikes);
                                var ratio = (likes / total)

                                //ratio = parseFloat(ratio).toFixed(4)
                                ratio = ((ratio * 100).toFixed(2) + "%")

                                //Deliver message
                                e.message.channel.sendMessage("", false, {
                                    color: 0x3498db,
                                    author: {
										icon_url: "https://i.ytimg.com/vi/" + match + "/hqdefault.jpg",
                                        name: title
                                    },
                                    //thumbnail: {
                                        //url: "https://i.ytimg.com/vi/" + match + "/hqdefault.jpg"
                                    //},
                                    //description takes lots of room on mobile, so disabled for now
                                    title: "",
                                    timestamp: date,
                                    fields: [{
                                        name: "Views: " + views,
                                        value: "Likes: " + ratio
                                    }],
                                    footer: {
                                        text: "Published on"
                                    }
                                }).then((m) => {
								setTimeout(() => {
									m.delete()
								}, 15000)
								})
                            }
                        } catch (e) {
                            console.log("Youtube's API returned an unconventional response.")
                            return
                        }
                    } else {
                        e.message.channel.sendMessage('Oops! Something went wrong. Let Void know :sob:' + error)
                        console.log("We’ve encountered an error: " + error);
                        console.log(suffix)
                        console.log(url)
                    };
                })
            }
        } //Nothing ಠ_ಠ
});
