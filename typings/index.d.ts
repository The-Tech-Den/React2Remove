interface Config {
    /** Emoji (ex: ❌) that must be reacted to remove a message. */
    reaction:string,
    /** Amount of reactions for a certain emoji is required before deleting a message */
    requiredCount:number,
    /** Discord bot token */
    token:string,
    /** Discord ids of who are allowed to add to the allowed channels list */
    whitelistedMembers:string[]
}