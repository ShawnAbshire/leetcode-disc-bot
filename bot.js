const { Client, Events, EmbedBuilder, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const prefix = '!problem';
const levels = ['easy', 'medium', 'hard'];
const problems = [];
const leetcodeProblemUrl = 'https://leetcode.com/problems/';
const leetcodeApiUrl = 'https://leetcode.com/api/problems/all/';
let totalProblems = 0;

function Problem(problemObject) {
  this.id = problemObject.stat.question_id;
  this.title = problemObject.stat.question__title;
  this.titleSlug = problemObject.stat.question__title_slug;
  this.difficulty = problemObject.difficulty.level === 3 ? 'Hard' : problemObject.difficulty.level === 2 ? 'Medium' : 'Easy';
  this.paidOnly = problemObject.paid_only;
  this.description = `Problem ID: ${this.id}\nTitle: ${this.title}\nSlug Title: ${this.titleSlug}\nDifficulty: ${this.difficulty}\nIs Paid? ${this.paidOnly}`;
}

function sendProblem(msg, difficulty) {
  let data = [...problems];
  if (difficulty != -1) {
    data = data.filter(x => x.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  const randomProblem = Math.floor(Math.random() * data.length);
  const problem = data[randomProblem];
  const problemUrl = `${leetcodeProblemUrl}${problem.titleSlug}/`;
  const embed = new EmbedBuilder()
    .setTitle(problem.title)
    .setColor('#f89f1b')
    .setThumbnail('https://leetcode.com/static/images/LeetCode_logo_rvs.png')
    .setDescription(`${problem.difficulty} - ${problem.title}`)
    .setURL(problemUrl);
  msg.channel.send({ embeds: [embed]});
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

  if (msg.content.startsWith(prefix)) {
    const args = msg.content.slice(prefix.length).trim().split(' ');
    let difficulty = -1;

    if (typeof args[0] != undefined) {
      if (levels.indexOf(args[0].toLowerCase()) > -1) {
        difficulty = args[0].toLowerCase();
      }
    }

    sendProblem(msg, difficulty);
  }
});

bot.login(process.env.DISCORD_BOT_TOKEN);