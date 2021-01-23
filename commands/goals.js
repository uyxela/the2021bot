const { Goal, User } = require('../database');
const { prefix } = require('../config.json');

module.exports = {
    name: 'goals',
    description: 'View a list of your goals, add a new goal, or delete a goal.',
    usage: '[list, add, delete]',
    cooldown: 2,
    dmOnly: true,
    execute(message, args) {
        if (args.length == 0 || args[0] == 'list') {
            const id = message.author.id;
            User.findOne({ id: id}, (err, res) => {
                if (err) {
                    console.error(err);
                    message.reply("Something went wrong!");
                } else {
                    if (res == null) {
                        message.reply(`Please set up a profile first!`);
                    } else if (res.goals.length == 0) {
                        message.reply(`You haven't set any goals yet! Use the \`${prefix}goals add\` command to add your first goal`)
                    } else {
                        let data = [];
                        data.push("Here are your goals:")
                        res.goals.forEach(goal => {
                            data.push(`  - **${goal.name}:** ${goal.description}`);
                            if (goal.type == 'Frequency') {
                                data.push(`     **Frequency:** ${goal.frequency.times} times per ${goal.frequency.per}`);
                            } else if (goal.type == 'Percentage') {
                                data.push(`     **Progress:** ${Math.round((goal.percentage.numerator/goal.percentage.denominator)*1000)/10}% completed`);
                            } else if (goal.type == 'Completion') {
                                data.push(`     **Status:** ${goal.completion ? "Completed!" : "Working on it"}`)
                            }
                        });
                        message.channel.send(data, {split: true });
                    }
                }
            });
        } else if (args[0] == 'add') {
            message.channel.send("Please enter a name for your new goal. You'll use this name to edit and update your goal so a shorter name is better.");
            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                max: 1,
                time: 120000,
                errors: ['time']
            }).then(message => {
                message = message.first();
                const id = message.author.id;
                User.findOne({ id: id }, (err, res) => {
                    if (err) {
                        console.error(err);
                        message.reply("Something went wrong!");
                    } else {
                        if (res == null) {
                            message.reply(`Please set up a profile first!`);
                        } else if (res.goals.some(goal => goal.name == message.content)) {
                            message.reply(`You already have a goal with that name!`);
                        } else {
                            let goal = {
                                name: message.content,
                                description: "",
                                type: "",
                                frequency: {
                                    times: -1,
                                    per: "",
                                },
                                percentage: {
                                    numerator: -1,
                                    denominator: -1,
                                },
                                completion: false
                            }
                            message.channel.send("Please enter a description for your goal.");
                            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                max: 1,
                                time: 600000,
                                errors: ['time']
                            }).then(message => {
                                message = message.first();
                                goal.description = message.content.trim();
                                message.channel.send("Please indicate the type of goal you would like to add by sending the corresponding number:\n  1. Frequency: \`x\` times per \`period\` (1 blog post per week)\n  2. Percentage: \`x\` out of \`y\` (Reach 100K subscribers on YouTube)\n  3. Completion: \`completed\` or \`incomplete\` (Get a job at x company)");
                                message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                    max: 1,
                                    time: 60000,
                                    errors: ['time']
                                }).then(message => {
                                    message = message.first();
                                    let selection = parseInt(message.content.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim());
                                    if (isNaN(selection)) {
                                        message.channel.send("Sorry, that's not a valid response!");
                                    } else {
                                        if (selection == 1) { // Frequency
                                            goal.type = "Frequency";
                                            message.channel.send("Please enter the number of times per period separated by a space, for example: 2 times per month becomes \`2 month\`");
                                            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                max: 1,
                                                time: 300000,
                                                errors: ['time']
                                            }).then(message => {
                                                message = message.first();
                                                let values = message.content.split(" ");
                                                if (values.length == 2) {
                                                    if (isNaN(parseInt(values[0]))) {
                                                        message.channel.send("Sorry, that's not a valid response!");
                                                    } else {
                                                        goal.frequency.times = parseInt(values[0]);
                                                        goal.frequency.per = values[1];
                                                        let data = [];
                                                        data.push(`Great! This is what I have:`);
                                                        data.push(`**Name:** ${goal.name}`);
                                                        data.push(`**Description:** ${goal.description}`);
                                                        data.push(`**Type:** ${goal.type} (${goal.frequency.times} ${goal.frequency.times == 1 ? "time" : "times"} per ${goal.frequency.per})`);
                                                        data.push(`Does this look right? (yes/no)`);

                                                        message.channel.send(data, { split: true });
                                                        message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                            max: 1,
                                                            time: 60000,
                                                            errors: ['time']
                                                        }).then(message => {
                                                            message = message.first();
                                                            const messageContent = message.content.toLowerCase();
                                                            if (messageContent == 'yes' || messageContent == 'y') {
                                                                const goalInfo = new Goal(goal);
                                                                res.goals.push(goalInfo);
                                                                res.save((err) => {
                                                                    if (err) {
                                                                        console.error(err);
                                                                        message.channel.send(`Oh no, something went wrong!`);
                                                                    } else {
                                                                        message.channel.send(`Your goal was succesfully added!`);
                                                                    }
                                                                });
                                                            } else if (messageContent == 'no' || messageContent == 'n') {
                                                                message.channel.send(`Oh no, please add a new goal with the \`${prefix}goal add\` command`)
                                                            } else {
                                                                message.channel.send("Sorry, that's not a valid repsonse!");
                                                            }
                                                        })
                                                    }
                                                } else {
                                                    message.channel.send("Sorry, that's not a valid response!");
                                                }
                                            })
                                        } else if (selection == 2) { // Percentage
                                            goal.type = "Percentage"
                                            message.channel.send("Please enter your progress and goal total separated by a space, for example: 200 subscribers out of 100K becomes \`200 100000\`");
                                            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                max: 1,
                                                time: 300000,
                                                errors: ['time']
                                            }).then(message => {
                                                message = message.first();
                                                let values = message.content.split(" ");
                                                if (values.length == 2) {
                                                    if (isNaN(parseInt(values[0].trim())) || isNaN(parseInt(values[1].trim()))) {
                                                        message.channel.send("Sorry, that's not a valid response!");
                                                    } else {
                                                        goal.percentage.numerator = parseInt(values[0].trim());
                                                        goal.percentage.denominator = parseInt(values[1].trim());
                                                        let data = [];
                                                        data.push(`Great! This is what I have:`);
                                                        data.push(`**Name:** ${goal.name}`);
                                                        data.push(`**Description:** ${goal.description}`);
                                                        data.push(`**Type:** ${goal.type} (${Math.round((goal.percentage.numerator/goal.percentage.denominator)*1000)/10}%)`);
                                                        data.push(`Does this look right? (yes/no)`);

                                                        message.channel.send(data, { split: true });
                                                        message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                            max: 1,
                                                            time: 60000,
                                                            errors: ['time']
                                                        }).then(message => {
                                                            message = message.first();
                                                            const messageContent = message.content.toLowerCase();
                                                            if (messageContent == 'yes' || messageContent == 'y') {
                                                                const goalInfo = new Goal(goal);
                                                                res.goals.push(goalInfo);
                                                                res.save((err) => {
                                                                    if (err) {
                                                                        console.error(err);
                                                                        message.channel.send(`Oh no, something went wrong!`);
                                                                    } else {
                                                                        message.channel.send(`Your goal was succesfully added!`);
                                                                    }
                                                                });
                                                            } else if (messageContent == 'no' || messageContent == 'n') {
                                                                message.channel.send(`Oh no, please add a new goal with the \`${prefix}goal add\` command`)
                                                            } else {
                                                                message.channel.send("Sorry, that's not a valid repsonse!");
                                                            }
                                                        })
                                                    }
                                                } else {
                                                    message.channel.send("Sorry, that's not a valid response!");
                                                }
                                            })
                                        } else if (selection == 3) { // Completion
                                            goal.type="Completion"
                                            message.channel.send("Have you completed your goal yet? (yes/no)");
                                            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                max: 1,
                                                time: 120000,
                                                errors: ['time']
                                            }).then(message => {
                                                message = message.first();
                                                const messageContent = message.content.toLowerCase();
                                                if (messageContent == 'yes' || messageContent == 'y') {
                                                    goal.completion == true;
                                                    let data = [];
                                                    data.push(`Great! This is what I have:`);
                                                    data.push(`**Name:** ${goal.name}`);
                                                    data.push(`**Description:** ${goal.description}`);
                                                    data.push(`**Type:** ${goal.type} (${goal.completion ? "Completed!" : "Working on it"})`);
                                                    data.push(`Does this look right? (yes/no)`);

                                                    message.channel.send(data, { split: true });
                                                    message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                        max: 1,
                                                        time: 60000,
                                                        errors: ['time']
                                                    }).then(message => {
                                                        message = message.first();
                                                        const messageContent = message.content.toLowerCase();
                                                        if (messageContent == 'yes' || messageContent == 'y') {
                                                            const goalInfo = new Goal(goal);
                                                            res.goals.push(goalInfo);
                                                            res.save((err) => {
                                                                if (err) {
                                                                    console.error(err);
                                                                    message.channel.send(`Oh no, something went wrong!`);
                                                                } else {
                                                                    message.channel.send(`Your goal was succesfully added!`);
                                                                }
                                                            });
                                                        } else if (messageContent == 'no' || messageContent == 'n') {
                                                            message.channel.send(`Oh no, please add a new goal with the \`${prefix}goal add\` command`)
                                                        } else {
                                                            message.channel.send("Sorry, that's not a valid repsonse!");
                                                        }
                                                    })
                                                } else if (messageContent == 'no' || messageContent == 'n') {
                                                    goal.completion == false;
                                                    let data = [];
                                                    data.push(`Great! This is what I have:`);
                                                    data.push(`**Name:** ${goal.name}`);
                                                    data.push(`**Description:** ${goal.description}`);
                                                    data.push(`**Type:** ${goal.type} (${goal.completion ? "Completed!" : "Working on it"})`);
                                                    data.push(`Does this look right? (yes/no)`);

                                                    message.channel.send(data, { split: true });
                                                    message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                                        max: 1,
                                                        time: 60000,
                                                        errors: ['time']
                                                    }).then(message => {
                                                        message = message.first();
                                                        const messageContent = message.content.toLowerCase();
                                                        if (messageContent == 'yes' || messageContent == 'y') {
                                                            const goalInfo = new Goal(goal);
                                                            res.goals.push(goalInfo);
                                                            res.save((err) => {
                                                                if (err) {
                                                                    console.error(err);
                                                                    message.channel.send(`Oh no, something went wrong!`);
                                                                } else {
                                                                    message.channel.send(`Your goal was succesfully added!`);
                                                                }
                                                            });
                                                        } else if (messageContent == 'no' || messageContent == 'n') {
                                                            message.channel.send(`Oh no, please add a new goal with the \`${prefix}goal add\` command`)
                                                        } else {
                                                            message.channel.send("Sorry, that's not a valid repsonse!");
                                                        }
                                                    })
                                                } else {
                                                    message.channel.send("Sorry, that's not a valid response!");
                                                }
                                            })
                                        } else {
                                            message.channel.send("Sorry, that's not a valid response!");
                                        }
                                    }
                                })
                            })
                        }
                    }
                });
            })
        } 
        
        // else if (args[0] == 'update') {
            
        // } else if (args[0] == 'edit') {
            
        // } 
        
        else if (args[0] == 'delete') {
            message.channel.send("Please enter the name of the goal you want to delete.");
            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                max: 1,
                time: 120000,
                errors: ['time']
            }).then(message => {
                message = message.first();
                const id = message.author.id;
                User.findOne({ id: id }, (err, res) => {
                    if (err) {
                        console.error(err);
                        message.reply(`Something went wrong!`);
                    } else {
                        if (res == null) {
                            message.reply(`Please set up a profile first!`);
                        } else if (res.goals.some(goal => goal.name == message.content)) {
                            res.goals = res.goals.filter(goal => goal.name != message.content);
                            res.save((err) => {
                                if (err) {
                                    console.error(err);
                                    message.channel.send(`Oh no, something went wrong!`);
                                } else {
                                    message.channel.send(`Your goal was succesfully deleted!`);
                                }
                            });
                        } else {
                            message.reply(`No goal with that name exists!`);
                        }
                    }
                })
            });
        } else {
            message.reply(`The command was used incorrectly! Send \`${prefix}help goals\` for more information about this command.`);
        }
    }
};