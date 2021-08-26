import {existsSync, writeFileSync, readFileSync} from 'fs';
import { Client } from 'discord.js';
import configFile from '../config';

if(!existsSync("./allowedChannels.json"))
    writeFileSync("./allowedChannels.json", JSON.stringify([]));

const client = new Client({"intents":["GUILDS", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGES"], allowedMentions:{parse:[]}});
const config:Config = configFile;

client.once("ready", () => {
    console.log(`${client.user.tag} is ready.`);
    if(!existsSync("./commands_created.flag") && config.guild_id){
        client.guilds.cache.get(config.guild_id).commands.set([
            {
                "name":"add",
                "description":"Add this channel to whitelisted",
                "type":"CHAT_INPUT"
            },
            {
                "name":"check",
                "description":`Check if this channel is being monitored by ${client.user.tag}.`,
                "type":"CHAT_INPUT"
            },
            {
                "name":"remove",
                "description":"Remove this channel from whitelisted",
                "type":"CHAT_INPUT"
            }
        ])
        writeFileSync("./commands_created.flag", "true")
    }
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
                "content":`👍 Added this channel to whitelisted.`
            })
        }
    };
});

client.on("interactionCreate", (interaction) => {
    //Everyone commands
    if(interaction.isCommand() && interaction.commandName == "check"){
        let allowedChannels:string[] = JSON.parse(readFileSync("./allowedChannels.json").toString())
        if(allowedChannels.includes(interaction.channelId)){
            interaction.reply({
                "content":`✅ This channel **is** currently being monitored by <@${interaction.client.user.id}> for the ${config.reaction} reaction.`,
                "ephemeral":true
            })
        }else{
            interaction.reply({
                "content":`❌ This channel **is not** currently being monitored by <@${interaction.client.user.id}>.`,
                "ephemeral":true
            })
        }
    }

    //Staff only commands
    if(interaction.isCommand() && !config.whitelistedMembers.includes(interaction.member.user.id))
        return interaction.reply({
            "content":"🛑 Only whitelisted members may use this feature.",
            "ephemeral":true
        })
    if(interaction.isCommand() && interaction.commandName == "add"){
        let allowedChannels:string[] = JSON.parse(readFileSync("./allowedChannels.json").toString())
        if(allowedChannels.includes(interaction.channelId)){
            interaction.reply({
                "content":`🤦 You already have that channel whitelisted.`
            })
        }else{
            allowedChannels.push(interaction.channelId)
            writeFileSync("./allowedChannels.json", JSON.stringify(allowedChannels))
            interaction.reply({
                "content":`👍 Added this channel to whitelisted.`
            })
        }
    }
    if(interaction.isCommand() && interaction.commandName == "remove"){
        let allowedChannels:string[] = JSON.parse(readFileSync("./allowedChannels.json").toString())
        if(!allowedChannels.includes(interaction.channelId)){
            interaction.reply({
                "content":`🤦 This channel isn't already whitelisted.`
            })
        }else{
            allowedChannels = allowedChannels.filter(c => c != interaction.channelId)
            writeFileSync("./allowedChannels.json", JSON.stringify(allowedChannels))
            interaction.reply({
                "content":`👍 Removed this channel from whitelisted.`
            })
        }
    }
})

client.on("messageReactionAdd", async (reaction) => {
    let allowedChannels:string[] = JSON.parse(readFileSync("./allowedChannels.json").toString())
    if(reaction.emoji.name == config.reaction && allowedChannels.includes(reaction.message.channel.id) && reaction.message.guild.me.permissionsIn(reaction.message.channel.id).has("MANAGE_MESSAGES")){
        if(reaction.count == config.requiredCount){
            let allowedPings = reaction.users.cache.map(u => u.id);
            if(!allowedPings.includes(reaction.message.author.id))
                allowedPings.push(reaction.message.author.id);
            reaction.message.reply({
                "content":`🗑 The following users have voted to delete this message:\n${reaction.users.cache.map(user => `<@${user.id}>`).join("\n")}`,
                "allowedMentions":{
                    "users":allowedPings
                }
            }).then(botMsg => {
                setTimeout(() => {
                    reaction.message.delete();
                    botMsg.delete();
                }, 2500);
            });
        };
    };
});

client.login(config.token);