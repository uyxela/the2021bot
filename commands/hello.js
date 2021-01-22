const { User } = require('../database');
const { prefix } = require('../config.json');

module.exports = {
    name: 'hello',
    description: 'Set up your profile for The 2021 Club Discord Server',
    usage: '',
    dmOnly: true,
    cooldown: 30,
    execute(message, args) {
        // Check if user already exists
        const id = message.author.id;
        User.findOne({ id: id }, (err, res) => {
            if (err) {
                console.log(err)
            } else {
                if (res === null) { // User does not exist
                    let user = {
                        id: message.author.id,
                        name: "",
                        bio: "",
                        age: -1,
                        location: "",
                        links: [],
                        cohorts: [],
                        goals: []
                    }
                    message.channel.send("Welcome to The 2021 Club, let's get your profile set up!\nWe'll ask some questions about you and your goals for 2021. Once you're done, your responses will be shared with the server, is that okay? (yes/no)").then(() => {
                        message.channel.awaitMessages(m => m.author.id === message.author.id, {
                            max: 1,
                            time: 60000,
                            errors: ['time']
                        }).then(message => {
                            message = message.first()
                            const messageContent = message.content.toLowerCase();
                            if (messageContent == 'yes' || messageContent == 'y') {
                                message.channel.send("Okay! What's your name?")
                                message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                    max: 1,
                                    time: 60000,
                                    errors: ['time']
                                }).then(message => {
                                    message = message.first();
                                    user.name = message.content;
                                    message.channel.send(`Hi ${user.name.split(" ")[0]}! Please tell me a little bit about yourself (~80 words)`);
                                    message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                        max: 1,
                                        time: 600000,
                                        errors: ['time']
                                    }).then(message => {
                                        message = message.first();
                                        user.bio = message.content.trim();
                                        message.channel.send("How old are you?");
                                        message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                            max: 1,
                                            time: 60000,
                                            errors: ['time']
                                        }).then(message => {
                                            message = message.first();
                                            user.age = parseInt(message.content);
                                            if (isNaN(user.age)) {
                                                message.channel.send("Sorry, that's not a valid response!");
                                            } else {
                                                message.channel.send("Where are you from?");
                                                message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                    max: 1,
                                                    time: 60000,
                                                    errors: ['time']
                                                }).then(message => {
                                                    message = message.first();
                                                    user.location = message.content;
                                                    message.channel.send("Where can we find you on the internet?\nPlease response with a list of links in a single message separated by a comma:\n\`the2021.club, linkedin.com, github.com\`");
                                                    message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                        max: 1,
                                                        time: 300000,
                                                        errors: ['time']
                                                    }).then(message => {
                                                        message = message.first();
                                                        message.content.split(",").forEach(link => {
                                                            user.links.push(link.trim());
                                                        })
                                                        message.channel.send("What cohorts are you interested in? (investing, entrepreneurship, programming, content, growth)\nPlease respond with a list of cohorts in a single message separated by a comma:\n\`investing, content\`");
                                                        message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                            max: 1,
                                                            time: 300000,
                                                            errors: ['time']
                                                        }).then(message => {
                                                            message = message.first();
                                                            message.content.split(",").forEach(cohort => {
                                                                user.cohorts.push(cohort.trim());
                                                            })
                                                            const data = [];
                                                            data.push("Great! This is what I have:");
                                                            data.push(`**Name:** ${user.name}`);
                                                            data.push(`**Bio:** ${user.bio}`);
                                                            data.push(`**Age:** ${user.age}`);
                                                            data.push(`**Location:** ${user.location}`);
                                                            data.push(`**Links:** ${user.links.join(", ")}`);
                                                            data.push(`**Cohorts:** ${user.cohorts.join(", ")}`);
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
                                                                    const userProfile = new User(user);
                                                                    userProfile.save((err, res) => {
                                                                        if (err) {
                                                                            console.error(err);
                                                                        } else {
                                                                            console.log(res);
                                                                            message.channel.send(`Your profile was succesfully created!\nYou can now add your 2021 goals with the \`${prefix}goals\` or manage your profile with the \`${prefix}profile\`!\nUse \`${prefix}help\` to learn how to use a specific command.`);
                                                                        }
                                                                    })
                                                                } else if (messageContent == 'no' || messageContent == 'n') {
                                                                    message.channel.send(`Oh no, please set up your profile again with the \`${prefix}hello\` command`);
                                                                } else {
                                                                    message.channel.send("Sorry, that's not a valid response!");
                                                                }
                                                            })
                                                        })
                                                    })
                                                })
                                            }
                                        })
                                    })
                                })
                            } else if (messageContent == 'no' || messageContent == 'n') {
                                message.channel.send("You must agree in order to set up your profile!");
                            } else {
                                message.channel.send("Sorry, that's not a valid response!");
                            }
                        })
                    })

                } else { // User already exists
                    message.channel.send(`Your profile has already been set up!\nPlease use the \`${prefix}profile\` command to manage your profile.`);
                }
            }
        })
    }
};