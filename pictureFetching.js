//Lots of unused information here simply because formatting is a pain.

Commands.anipic = {
  name: 'anipic',
  help: 'Anime-Pictures Search function',
  aliases: ['animepic'],
  level: 4,
  nsfw: true,
  fn: function (msg, suffix) {
    msg.channel.sendTyping()
    
	var baseUrl = "http://anime-pictures.net/pictures/view_posts/0?type=json&lang=en&posts_per_page=100";
	if(suffix.length > 1){
		tags = "&search_tag=" +suffix;
	} else {
		tags = "";
	}
	
	//First, get search response\
	var resolveSelection = new Promise(
	function(resolve, reject) {
		url = baseUrl + tags;
		console.log(url)
		request(url, function(error, response, body) {
			if (!error) {
				//console.log(body)
				body = JSON.parse(body)
				var totalR = body["response_posts_count"]
				var posts = body["posts"]
				var selected = Math.floor(Math.random() * totalR)
				console.log("I found " + totalR + " results, and selected #" + selected)
			
			
				if(totalR < 1){
					msg.reply("I couldn't find anything matching that! :<")
				} else {
				var sPost = (posts[selected])
				var pImage = sPost.big_preview
				var pID = sPost.id
				var date = sPost.pubtime
				//console.log(sPost)
				//msg.reply(pImage)
				
				var resultArray = []
				
				resultArray.push(pImage)
				resultArray.push(pID)
				resultArray.push(date)
				
				resolve(resultArray)
				}
			} else {
				msg.reply("Something went wrong, Nya! #1")
				console.log(body)
			}
		})
	}
	);
	

    //Then, pull item's page for stats? Maybe later.
	var doStuff = new function() {
            resolveSelection.then(function(resultArray) {
				var image = resultArray[0]
				var id = resultArray[1]
				var date = resultArray[2]
				
				var temporaryDate = date.substring(0, date.indexOf('.'))
				
				pUrl = "https://anime-pictures.net/pictures/view_post/" + id + "?lang=en&type=json";
				
				msg.reply(image)
				msgArray = []
				msgArray.push("```")
				msgArray.push(temporaryDate)
				msgArray.push("```")
				msg.channel.sendMessage(msgArray.join('\n'))
				
			})
	}
	}
}

Commands.hentai = {
  name: 'hentai',
  help: 'Gelbooru search function. Format requests like "cat_ears+red_hair+rating:explicit"',
  aliases: ['gelbooru'],
  level: 0,
  nsfw: true,
  fn: function (msg, suffix) {
    msg.channel.sendTyping()
    
	var baseUrl = "http://gelbooru.com/index.php?page=dapi&s=post&q=index";
	if(suffix.length > 1){
		var sLimit = "&limit=6969";
		tags = "&tags=" +suffix;
	} else {
		var sLimit = ""; //ALL THE THINGS
		tags = "";
	}

	url = baseUrl + tags + sLimit;
	request(url, function(error, response, body) {
		if (!error) {
			//Madness
			try {
				var xml2js = require('xml2js')
				xml2js.parseString(body, (err, reply) => {
					
				if (err) {
					msg.channel.sendMessage('The API returned an unconventional response.')
					console.log(reply)
				} else {
					var count = Math.floor(Math.random() * reply.posts.post.length)
					var totals = (reply.posts.post.length)
					if(count == 0){
						count = 1;
					}
					console.log('Selected #' + count + ' out of ' + totals)
					
					var post = (reply.posts.post[count]["$"])

					var iURL = post["file_url"]
					var rURL = "http:" + iURL
					var iScore = post["score"]
					var iTags = post["tags"]
					var iTags = iTags.substring(0, 150)
					var iID = post["id"]
					var siteURL = "http://gelbooru.com/index.php?page=post&s=view&id="+iID
					var iconURL = "http://gelbooru.com/favicon.png"
					var hasChildren = post["has_children"]
					var iDate = post["created_at"]
					var iSource = post["source"]
					var iHeight = post["sample_height"]
					var iWidth = post["sample_width"]
					var iRating = post["rating"]
					
					if(iSource.length < 3){
						iSource = "Unknown";
					}
					
					var msgArray = []
					msgArray.push('```')
					msgArray.push('Sauce: ' + iSource)
					msgArray.push('')
					msgArray.push('Tags: ' + iTags + "...")
					msgArray.push('')
					msgArray.push(iHeight + "x" + iWidth + " - " + iDate)
					msgArray.push('```')
					
					//send that bad boy
					msg.reply(rURL)
					msg.channel.sendMessage(msgArray.join('\n'))
					
					
				}
				
				})
				
				
				
			} catch(err){
				msg.reply("I couldn't find anything matching that, sorry :<")
			}
			
		} else {
			msg.reply("Something went wrong, Nya! #2")
		}
  })
}
}

Commands.danbooru = {
  name: 'danbooru',
  help: 'Danbooru search function.',
  level: 0,
  nsfw: true,
  fn: function (msg, suffix) {
    msg.channel.sendTyping()
    
	baseUrl = "http://danbooru.donmai.us";
	url = "https://danbooru.donmai.us/posts.xml?limit=200&tags=" + suffix + "+rating:explicit"
	request(url, function(error, response, body) {
		if (!error) {
			//console.log(body)
			
			try {
			var xml2js = require('xml2js')
			xml2js.parseString(body, (err, reply) => {
            if (err) {
              msg.channel.sendMessage('The API returned an unconventional response.')
			  console.log(reply)
            } else {
				
              var count = Math.floor(Math.random() * reply.posts.post.length)
			  var totals = (reply.posts.post.length)
			  console.log('Selected #' + count + ' out of ' + totals)
			  
			  var postID = (reply.posts.post[count]['id'][0])
			  var postID = JSON.stringify(postID)
			  var postID = postID.replace ( /[^\d.]/g, '' );
			  
			  var postURL = "http://danbooru.donmai.us/posts/" + postID
			  
			  var artist = (reply.posts.post[count]['tag-string-artist'])
			  
			  var characters = (reply.posts.post[count]['tag-string-character'])
			  
			  var copyright = (reply.posts.post[count]['tag-string-copyright'])
			  
			  var hasChildren = (reply.posts.post[count]['has-visible-children'])
			  var hasChildren = JSON.stringify(hasChildren)
			  if (hasChildren.indexOf("true") !== -1){
				  hasChildren = "True";
			  } else {
				  hasChildren = "False";
			  }
			  
			  console.log("post id: " + postID)
			  console.log("post URL: " + postURL)
			  console.log("artist: " + artist)
			  console.log("characters: " + characters)
			  console.log("copyright: " + copyright)
			  console.log("hasChildren: " + hasChildren)
			  
			  
              var FurryArray = []
              if (!suffix) {
                FurryArray.push(msg.author.mention + ", you've searched for `random`")
              } else {
                FurryArray.push(msg.author.mention + ", you've searched for `" + suffix + '`')
              }
			  safeUrl = reply.posts.post[count]['file-url'];
			  if (safeUrl == null){
				  msg.reply('API returned an invalid result, sorry :<')
			  }
			  
              FurryArray.push(baseUrl + safeUrl)
              msg.channel.sendMessage(FurryArray.join('\n'))
            }
          })
		} catch(err){
			msg.reply("Be sure you search only one tag with the proper format, Nya! eg. ``blonde_hair``")
		}
			
		} else {
			msg.reply("Something went wrong!")
		}
  })
}
}