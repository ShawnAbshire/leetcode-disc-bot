const { Client, Events, EmbedBuilder, GatewayIntentBits, messageLink } = require('discord.js');
const axios = require('axios');
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const prefix = ['!p', '!problem'];
const levels = ['easy', 'medium', 'hard'];
const problems = [];
const leetcodeProblemUrl = 'https://leetcode.com/problems/';
const leetcodeApiUrl = 'https://leetcode.com/api/problems/all/';
const completedProblems = [];
let totalProblems = 0;

function Problem(problemObject) {
  this.id = problemObject.stat.question_id;
  this.title = problemObject.stat.question__title;
  this.titleSlug = problemObject.stat.question__title_slug;
  this.difficulty = problemObject.difficulty.level === 3 ? 'Hard' : problemObject.difficulty.level === 2 ? 'Medium' : 'Easy';
  this.paidOnly = problemObject.paid_only;
  this.description = `Problem ID: ${this.id}\nTitle: ${this.title}\nSlug Title: ${this.titleSlug}\nDifficulty: ${this.difficulty}\nIs Paid? ${this.paidOnly}`;
}

function getProblem(data) {
	const randProblem = Math.floor(Math.random() * data.length);
	const problem = data[randProblem];
	if (completedProblems.includes(problem.id)) {
		getProblem(data);
	}

  completedProblems.push(problem.id);
	return problem;
}

function sendProblems(msg, difficulty, amount = 1) {
  let data = [...problems];
  if (difficulty != -1) {
    data = data.filter(x => x.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  for (let i = 0; i < amount; i++) {
    const problem = getProblem(data);
    const problemUrl = `${leetcodeProblemUrl}${problem.titleSlug}/`;
    const embed = new EmbedBuilder()
      .setTitle(problem.title)
      .setColor('#f89f1b')
      .setThumbnail('https://leetcode.com/static/images/LeetCode_logo_rvs.png')
      .setDescription(`${problem.difficulty} - ${problem.title}`)
      .setURL(problemUrl);
    msg.channel.send({ embeds: [embed]});
  }
}

const sanitizeAndConvertToArray = (value) => value.replace(/[^0-9,]/g, '').split(',').map(Number);
function removeDuplicates(value) {
  const results = value.filter(x => !completedProblems.includes(x));

  return [...results];
}

axios.get(leetcodeApiUrl)
  .then((resp) => {
    totalProblems = resp.data.num_total;
    resp.data.stat_status_pairs.filter(x => !x.paid_only).forEach((problem) => { problems.push(new Problem(problem)); });
  }).catch((err) => { console.log(err); });

bot.on(Events.ClientReady, () => { console.log(`Logged in as ${bot.user.username}`); });
bot.on(Events.Error, (err) => { console.error(err); });
bot.on(Events.MessageCreate, (msg) => {
  if (msg.author.bot) return;
  if (msg.content === '!ping') {
    bot.createMessage(msg.channel.id, 'Pong!');
  }

  if (msg.content.startsWith(prefix[0]) || msg.content.startsWith(prefix[1])) {
    const args = msg.content.slice(prefix.length).trim().split(' ');
    let difficulty = -1;
    let amount = 1;

    if (typeof args[0] != undefined) {
      if (args[0].toLowerCase() === 'help') {
        msg.channel.send(
          '```Usage:\n\n\t!problem | !p (without args) - gives you a random problem of any difficulty either paid/free.' +
          '\n\nAdding difficulty modifiers:\n\n\t!problem | !p <easy | medium | hard> - lets you pick a random free problem of the chosen difficulty.' +
          '\n\nAdding amount modifier:\n\n\t!problem | !p <easy | medium | hard> <1-4> - lets you pick a specified number of random free problem (max 4) of the chosen difficulty.```',
        );

        return;
      }

      if (args[0].toLowerCase() === 'cache') {
        msg.channel.send(`Completed problem ids:\n \`\`\`[${completedProblems}]\`\`\``);
        return;
      }

      if (args[0].toLowerCase() === 'set') {
        const argument = sanitizeAndConvertToArray(args[1]);
        if (argument != null && argument.length > 0) {
          const newProblems = removeDuplicates(argument);
          if (newProblems.length > 0) {
            completedProblems.push(...newProblems);
          }

          msg.channel.send(`Set new completed problem ids:\n \`\`\`[${completedProblems}]\`\`\``);
        } else {
          msg.channel.send('Improper arugment provided.');
        }

        return;
      }

      if (levels.indexOf(args[0].toLowerCase()) > -1 && Number(args[0]) !== 'NaN') {
        difficulty = args[0].toLowerCase();
      }

      if (args[1] != null && levels.indexOf(args[1].toLowerCase()) > -1 && Number(args[1]) !== 'NaN') {
        difficulty = args[1].toLowerCase();
      }

      if (Number(args[0])) {
        amount = Math.min(Number(args[0]), 4);
      }

      if (Number(args[1])) {
        amount = Math.min(Number(args[1]), 4);
      }
    }

    sendProblems(msg, difficulty, amount);
  }
});

bot.login(process.env.DISCORD_BOT_TOKEN);