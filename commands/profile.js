const { User } = require('../database');
const { prefix } = require('../config.json');
const { getIdFromMention } = require('../functions');

module.exports = {
    name: 'profile',
    description: 'View user profiles and manage your information.',
    usage: '[view, view @user, edit]',
    cooldown: 3,
    execute(message, args) {
        if (args.length == 0 || args[0] == 'view') {
            if (args[1]) { // return profile of mentioned user
                const id = getIdFromMention(args[1]);
                if (id) {
                    User.findOne({ id: id}, (err, res) => {
                        if (err) {
                            console.error(err);
                            message.reply("Something went wrong!");
                        } else {
                            if (res != null) {
                                const data = [];
                                data.push("Here's the profile you asked for:")
                                data.push(`**Name:** ${res.name}`);
                                data.push(`**Bio:** ${res.bio}`);
                                data.push(`**Age:** ${res.age}`);
                                data.push(`**Location:** ${res.location}`);
                                data.push(`**Links:** ${res.links.join(", ")}`);
                                data.push(`**Cohorts:** ${res.cohorts.join(", ")}`);
                                data.push(`**Goals:** ${res.goals.join("\n")}`);
    
                                message.reply(data, { split: true })
                            } else {
                                message.reply("The profile you asked for can't be found, it most likely hasn't been set up yet.");
                            }
                        }
                    })
                } else {
                    message.reply("Something went wrong!");
                }
            } else { // return profile of user
                const id = message.author.id;
                User.findOne({ id: id }, (err, res) => {
                    if (err) {
                        console.error(err);
                        message.reply("Something went wrong!")
                    } else {
                        if (res != null) {
                            const data = [];
                            data.push("Here's your profile:")
                            data.push(`**Name:** ${res.name}`);
                            data.push(`**Bio:** ${res.bio}`);
                            data.push(`**Age:** ${res.age}`);
                            data.push(`**Location:** ${res.location}`);
                            data.push(`**Links:** ${res.links.join(", ")}`);
                            data.push(`**Cohorts:** ${res.cohorts.join(", ")}`);
                            data.push(`**Goals:** ${res.goals.join("\n")}`);

                            message.reply(data, { split: true });
                        } else {
                            message.reply("Please set up a profile first!");
                        }
                    }
                })
            }
        } else if (args[0] == 'edit') {
            if (message.channel.type === 'dm') {
                const id = message.author.id;
                User.findOne({ id: id }, (err, res) => {
                    if (err) {
                        console.error(err);
                        message.reply("Something went wrong!")
                    } else {
                        if (res != null) {
                            const data = [];
                            data.push("Here's your profile:")
                            data.push(`**Name:** ${res.name}`);
                            data.push(`**Bio:** ${res.bio}`);
                            data.push(`**Age:** ${res.age}`);
                            data.push(`**Location:** ${res.location}`);
                            data.push(`**Links:** ${res.links.join(", ")}`);
                            data.push(`**Cohorts:** ${res.cohorts.join(", ")}`);
                            data.push(`**Goals:** ${res.goals.join("\n")}`);
                            data.push(`Would you like to edit it? (yes/no)`);

                            message.reply(data, { split: true });
                            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                max: 1,
                                time: 60000,
                                errors: ['time']
                            }).then(message => {
                                message = message.first();
                                const messageContent = message.content.toLowerCase();
                                if (messageContent == 'yes' || messageContent == 'y') {
                                    message.reply("Great! For each field, please respond with the updated value or respond with \`!\` to keep it the way it is.");
                                    message.channel.send(`What would you like to change your name from \`${res.name}\` to?`);
                                    message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                        max: 1,
                                        time: 60000,
                                        errors: ['time']
                                    }).then(message => {
                                        message = message.first();
                                        if (message.content.trim() != '!') {
                                            res.name = message.content
                                        }
                                        message.channel.send(`What would you like to change your bio from \`${res.bio}\` to?`);
                                        message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                            max: 1,
                                            time: 600000,
                                            errors: ['time']
                                        }).then(message => {
                                            message = message.first();
                                            if (message.content.trim() != '!') {
                                                res.bio = message.content
                                            }
                                            message.channel.send(`What would you like to change your age from \`${res.age}\` to?`);
                                            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                max: 1,
                                                time: 60000,
                                                errors: ['time']
                                            }).then(message => {
                                                message = message.first();
                                                if (message.content.trim() != '!') {
                                                    if (isNaN(parseInt(message.content))) {
                                                        message.channel.send("Sorry, that's not a valid response!");
                                                    } else {
                                                        res.age = parseInt(message.content);
                                                    }
                                                }
                                                message.channel.send(`What would you like to change your location from \`${res.location}\` to?`);
                                                message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                    max: 1,
                                                    time: 60000,
                                                    errors: ['time']
                                                }).then(message => {
                                                    message = message.first();
                                                    if (message.content.trim() != '!') {
                                                        res.location = message.content;
                                                    }
                                                    message.channel.send(`What would you like to update your links from \`${res.links.join(", ")}\` to?)`);
                                                    message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                        max: 1,
                                                        time: 300000,
                                                        errors: ['time']
                                                    }).then(message => {
                                                        message = message.first();
                                                        if (message.content.trim() != '!') {
                                                            let links = []
                                                            message.content.split(",").forEach(link => {
                                                                links.push(link.trim());
                                                            })
                                                            res.links = links;
                                                        }
                                                        message.channel.send(`What would you like to change you cohorts from \`${res.cohorts.join(", ")}\` to?`);
                                                        message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                            max: 1,
                                                            time: 300000,
                                                            errors: ['time']
                                                        }).then(message => {
                                                            message = message.first();
                                                            if (message.content.trim() != '!') {
                                                                let cohorts = []
                                                                message.content.split(",").forEach(cohort => {
                                                                    cohorts.push(cohort.trim());
                                                                })
                                                                res.cohorts = cohorts;
                                                            }
                                                            const data = [];
                                                            data.push("Great! This is what I have:");
                                                            data.push(`**Name:** ${res.name}`);
                                                            data.push(`**Bio:** ${res.bio}`);
                                                            data.push(`**Age:** ${res.age}`);
                                                            data.push(`**Location:** ${res.location}`);
                                                            data.push(`**Links:** ${res.links.join(", ")}`);
                                                            data.push(`**Cohorts:** ${res.cohorts.join(", ")}`);
                                                            data.push("Does this look right? (yes/no)");
                                                            
                                                            message.channel.send(data, { split: true });
                                                            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                                max: 1,
                                                                time: 60000,
                                                                errors: ['time']
                                                            }).then(message => {
                                                                message = message.first();
                                                                const messageContent = message.content.toLowerCase();
                                                                if (messageContent == 'yes' || messageContent == 'y') {
                                                                    res.save((err) => {
                                                                        if (err) {
                                                                            console.error(err);
                                                                        } else {
                                                                            message.channel.send(`Your profile was succesfully updated!`);
                                                                        }
                                                                    })
                                                                } else if (messageContent == 'no' || messageContent == 'n') {
                                                                    message.channel.send(`Oh no, if you would like to make any changes please run the \`${prefix}profile edit\` command again`);
                                                                } else {
                                                                    message.channel.send("Sorry, that's not a valid response!");
                                                                }
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                } else if (messageContent == 'no' || messageContent == 'n') {
                                    message.reply("Okay, sounds good!")
                                } else {
                                    message.reply("Sorry, that's not a valid response!");
                                }
                            })
                        } else {
                            message.reply("Please set up a profile first!");
                        }
                    }
                })
            } else {
                message.reply("I can only execute that command inside DMs!");
            }
        } else {
            message.reply(`The command was used incorrectly! Send \`${prefix}help profile\` for more information about this command.`);
        }
    }
};