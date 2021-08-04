import { Client } from 'discord.js';
import configFile from '../config';

const client = new Client({"intents":["GUILDS", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGES"], allowedMentions:{parse:[]}});
const config:Config = configFile;

client.once("ready", () => {
    console.log(`${client.user.tag} is ready.`)
})

client.on("messageReactionAdd", async (reaction) => {
    if(!reaction.message.author.bot && reaction.emoji.name == config.reaction && config.channels.includes(reaction.message.channel.id) && reaction.message.guild.me.permissionsIn(reaction.message.channel.id).has("MANAGE_MESSAGES")){
        if(reaction.count == config.requiredCount){
            reaction.message.reply({
                "content":`🗑 This message has been voted to be deleted.`
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