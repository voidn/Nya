//Main changes: 
//1. Changed reconnection handler to allow the bot to relog up to 10 times
//2. On startup, set game to "Starting up!" and swap to "X" on first message recieved

var restarted = 0

bot.Dispatcher.on(Event.GATEWAY_READY, function () {
  bot.Users.fetchMembers()
  runtime.internal.versioncheck.versionCheck(function (err, res) {
    if (err) {
      Logger.error('Version check failed, ' + err)
    } else if (res) {
      Logger.info(`Version check: ${res}`)
    }
  })
  Logger.info('Ready to start!')
  
  //Set Starting up
  var game = {name: "Starting up!"};
  bot.User.setStatus("idle", game);
  
  Logger.info(`Logged in as ${bot.User.username}#${bot.User.discriminator} (ID: ${bot.User.id}) and serving ${bot.Users.length} users in ${bot.Guilds.length} servers.`)
  if (argv.shutdownwhenready) {
    console.log('o okei bai')
    process.exit(0)
  }
})

bot.Dispatcher.on(Event.MESSAGE_CREATE, function (c) {
  if (!bot.connected) return
  
  //Message recieved, bot is online.
  var game = {name: "with Allie's Pizza"};
  bot.User.setStatus("online", game);
  
  datacontrol.users.isKnown(c.message.author)
  var prefix
  datacontrol.customize.prefix(c.message).then(function (p) {
    if (!p) {
      prefix = Config.settings.prefix
    } else {
      prefix = p
    }
    var cmd
    var suffix
    if (c.message.content.indexOf(prefix) === 0) {
      cmd = c.message.content.substr(prefix.length).split(' ')[0].toLowerCase()
      suffix = c.message.content.substr(prefix.length).split(' ')
      suffix = suffix.slice(1, suffix.length).join(' ')
    } else if (c.message.content.indexOf(bot.User.mention) === 0) {
      cmd = c.message.content.substr(bot.User.mention.length + 1).split(' ')[0].toLowerCase()
      suffix = c.message.content.substr(bot.User.mention.length).split(' ')
      suffix = suffix.slice(2, suffix.length).join(' ')
    } else if (c.message.content.indexOf(bot.User.nickMention) === 0) {
      cmd = c.message.content.substr(bot.User.nickMention.length + 1).split(' ')[0].toLowerCase()
      suffix = c.message.content.substr(bot.User.nickMention.length).split(' ')
      suffix = suffix.slice(2, suffix.length).join(' ')
    }
    if (c.message.author.bot || c.message.author.id === bot.User.id) {
      return
    }
    if (cmd === 'help') {
      runtime.commandcontrol.helpHandle(c.message, suffix)
    }
    if (aliases[cmd]) {
      cmd = aliases[cmd].name
    }
    if (commands[cmd]) {
      if (typeof commands[cmd] !== 'object') {
        return // ignore JS build-in array functions
      }
      Logger.info(`Executing <${c.message.resolveContent()}> from ${c.message.author.username}`)
      if (commands[cmd].level === 'master') {
        if (Config.permissions.master.indexOf(c.message.author.id) > -1) {
          try {
            commands[cmd].fn(c.message, suffix, bot)
          } catch (e) {
            c.message.channel.sendMessage('An error occured while trying to process this command, you should let the bot author know. \n```' + e + '```')
            Logger.error(`Command error, thrown by ${commands[cmd].name}: ${e}`)
          }
        } else {
          c.message.channel.sendMessage('This command is only for the bot owner.')
        }
      } else if (!c.message.isPrivate) {
        timeout.check(commands[cmd], c.message.guild.id, c.message.author.id).then((y) => {
          if (y !== true) {
            datacontrol.customize.reply(c.message, 'timeout').then((x) => {
              if (x === null || x === 'default') {
                c.message.channel.sendMessage(`Wait ${Math.round(y)} more seconds before using that again.`)
              } else {
                c.message.channel.sendMessage(x.replace(/%user/g, c.message.author.mention).replace(/%server/g, c.message.guild.name).replace(/%channel/, c.message.channel.name).replace(/%timeout/, Math.round(y)))
              }
            })
          } else {
            datacontrol.permissions.checkLevel(c.message, c.message.author.id, c.message.member.roles).then(function (r) {
              if (r >= commands[cmd].level) {
                if (!commands[cmd].hasOwnProperty('nsfw')) {
                  try {
                    commands[cmd].fn(c.message, suffix, bot)
                  } catch (e) {
                    c.message.channel.sendMessage('An error occured while trying to process this command, you should let the bot author know. \n```' + e + '```')
                    Logger.error(`Command error, thrown by ${commands[cmd].name}: ${e}`)
                  }
                } else {
                  datacontrol.permissions.checkNSFW(c.message).then(function (q) {
                    if (q) {
                      try {
                        commands[cmd].fn(c.message, suffix, bot)
                      } catch (e) {
                        c.message.channel.sendMessage('An error occured while trying to process this command, you should let the bot author know. \n```' + e + '```')
                        Logger.error(`Command error, thrown by ${commands[cmd].name}: ${e}`)
                      }
                    } else {
                      datacontrol.customize.reply(c.message, 'nsfw').then((d) => {
                        if (d === null || d === 'default') {
                          c.message.channel.sendMessage('This channel does not allow NSFW commands, enable them first with `setnsfw`')
                        } else {
                          c.message.channel.sendMessage(d.replace(/%user/g, c.message.author.mention).replace(/%server/g, c.message.guild.name).replace(/%channel/, c.message.channel.name))
                        }
                      }).catch((e) => {
                        Logger.error('Reply check error, ' + e)
                      })
                    }
                  }).catch(function (e) {
                    Logger.error('Permission error: ' + e)
                  })
                }
              } else {
                datacontrol.customize.reply(c.message, 'perms').then((u) => {
                  if (u === null || u === 'default') {
                    if (r > -1 && !commands[cmd].hidden) {
                      var reason = (r > 4) ? '**This is a master user only command**, ask the bot owner to add you as a master user if you really think you should be able to use this command.' : 'Ask the server owner to modify your level with `setlevel`.'
                      c.message.channel.sendMessage('You have no permission to run this command!\nYou need level ' + commands[cmd].level + ', you have level ' + r + '\n' + reason)
                    }
                  } else {
                    c.message.channel.sendMessage(u.replace(/%user/g, c.message.author.mention).replace(/%server/g, c.message.guild.name).replace(/%channel/, c.message.channel.name).replace(/%nlevel/, commands[cmd].level).replace(/%ulevel/, r))
                  }
                }).catch((e) => {
                  Logger.error('Reply check error, ' + e)
                })
              }
            }).catch(function (e) {
              Logger.error('Permission error: ' + e)
            })
          }
        })
      } else {
        if (commands[cmd].noDM) {
          c.message.channel.sendMessage('This command cannot be used in DM, invite the bot to a server and try this command again.')
          return
        }
        datacontrol.permissions.checkLevel(c.message, c.message.author.id, []).then(function (r) {
          if (r >= commands[cmd].level) {
            try {
              commands[cmd].fn(c.message, suffix, bot)
            } catch (e) {
              c.message.channel.sendMessage('An error occured while trying to process this command, you should let the bot author know. \n```' + e + '```')
              Logger.error(`Command error, thrown by ${commands[cmd].name}: ${e}`)
            }
          } else {
            c.message.channel.sendMessage('You have no permission to run this command in DM, you probably tried to use restricted commands that are either for master users only or only for server owners.')
          }
        }).catch(function (e) {
          Logger.error('Permission error: ' + e)
        })
      }
    }
  }).catch(function (e) {
    if (e === 'No database') {
      Logger.warn('Database file missing for a server, creating one now...')
    } else {
      Logger.error('Prefix error: ' + e)
    }
  })
})

bot.Dispatcher.on(Event.DISCONNECTED, function (e) {
  Logger.error('Disconnected from the Discord gateway: ' + e.error)
  if (restarted != 10) {
    restarted = restarted + 1
    Logger.info('Trying to login again...')
	Logger.info("Logger at " + restarted + " of 10")
    start()
  } else {
    Logger.warn('Reconnection limit reached. Not trying to login again, exiting...')
    process.exit(1)
  }
})