# Leetcode-discord-bot
Discord bot that posts a random [leetcode](https://leetcode.com/) question based on custom commands.

### Installation and running locally

1. Clone this project to your system using
2. `cd leetcode-disc-bot` to switch directory to the bot's directory
3. `npm i` or `npm install` to get all its dependencies
4. Create a `.env` file at the root of the project folder
5. Add a variable `DISCORD_BOT_TOKEN=` and leave it empty for now.
6. Now make sure to create a `New Application` on Discord from their [portal](https://discord.com/developers/applications/)
    - once created, visit its `Bot` tab and grab the `token` and paste it as the value for `DISCORD_BOT_TOKEN`
7. Run the bot using `npm start` and you should be able to use the commands once you invite your own app to a server of your choice.


### Usage

`!problem (without args) - gives you a random problem of any difficulty either paid/free.`

`!problem <'easy' | 'medium' | 'hard'> - gives you a random freely accessible problem of any difficulty.`