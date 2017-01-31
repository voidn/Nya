var internetradio = require('node-internet-radio');

Commands.radio = {
  name: 'radio',
  help: "I'll get the currently playing radio track!",
  timeout: 10,
  level: 0,
  fn: function (msg) {
	var resLink = new Promise(
		function(resolve, reject){
			var link = v.fetchList(msg).then((r) => r.link[0]);
			resolve(link);
		}
		);


	var getLink = function() {		
		resLink.then(function (fulfilled){
			var sLink = fulfilled;
			
			internetradio.getStationInfo(sLink, function(error, station) {
				if (station == null){
					var sTitle = "Unknown Track/Station";
				} else {
					var sTitle = station.title;
				}
				
				var track = sTitle;
				var msgArray = []
				msgArray.push("Radio is currently playing:")
				msgArray.push("```")
				msgArray.push(track)
				msgArray.push("```")
				msg.channel.sendMessage(msgArray.join('\n'))	
			})
		})
	.catch(function (error){
		console.log(error)
	});
	};
	getLink()
  }
}