import {existsSync, writeFileSync, readFileSync} from 'fs';
import { Client } from 'discord.js';
import configFile from '../config';

if(!existsSync("./allowedChannels.json"))
    writeFileSync("./allowedChannels.json", JSON.stringify([]));

const client = new Client({"intents":["GUILDS", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGES"], allowedMentions:{parse:[]}});
const config:Config = configFile;

client.once("ready", () => {
    console.log(`${client.user.tag} is ready.`);
});

client.on("messageCreate", message => {
    if(message.mentions.members.first() && message.mentions.members.first().id == client.user.id && config.whitelistedMembers.includes(message.author.id)){
        let allowedChannels:string[] = JSON.parse(readFileSync("./allowedChannels.json").toString())
        if(allowedChannels.includes(message.channelId)){
            message.reply({
                "content":`🤦 You already have that channel whitelisted.`
            })
        }else{
            allowedChannels.push(message.channelId)
            writeFileSync("./allowedChannels.json", JSON.stringify(allowedChannels))
            message.reply({
                "content":`👍 Added this channel as whitelisted.`
            })
        }
    };
});

client.on("messageReactionAdd", async (reaction) => {
    let allowedChannels:string[] = JSON.parse(readFileSync("./allowedChannels.json").toString())
    if(!reaction.message.author.bot && reaction.emoji.name == config.reaction && allowedChannels.includes(reaction.message.channel.id) && reaction.message.guild.me.permissionsIn(reaction.message.channel.id).has("MANAGE_MESSAGES")){
        if(reaction.count == config.requiredCount){
            let allowedPings = reaction.users.cache.map(u => u.id);
            allowedPings.push(reaction.message.author.id)
            reaction.message.reply({
                "content":`🗑 The following users have voted to delete this message:\n${reaction.users.cache.map(user => `<@${user.id}>`).join("\n")}`,
                "allowedMentions":{
                    "users":allowedPings
                }
            }).then(botMsg => {
                setTimeout(() => {
                    reaction.message.delete();
                    botMsg.delete();
                }, 1500);
            });
        };
    };
});

client.login(config.token);