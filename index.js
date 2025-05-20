const { Highrise } = require("highrise-js-sdk");
const { settings, authentication } = require("./config/config");

const bot = new Highrise(authentication.token, authentication.room);

const users = new Map(); // userId => username
const balances = {};
const answers = [
  "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes – definitely.",
  "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.",
  "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.",
  "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
  "Don't count on it.", "My reply is no.", "My sources say no.",
  "Outlook not so good.", "Very doubtful."
];

const emotes = [
  ["Sit", "idle-loop-sitfloor"],
  ["Enthused", "idle-enthusiastic"],
  ["Yes", "emote-yes"],
  // ... keep all your emotes here
];

// Add user when joined
bot.on("userJoined", (user) => {
  users.set(user.id, user.username);
  if (!(user.id in balances)) balances[user.id] = 100; // starting coins
  console.log(`User joined: ${user.username} (${user.id})`);
});

// Remove user when left
bot.on("userLeft", (user) => {
  users.delete(user.id);
  console.log(`User left: ${user.username} (${user.id})`);
});

// Track command usage
let totalCommands = 0;

bot.on("chat", async (user, message) => {
    // Emit chat events to the website
    global.emitBotEvent?.('chat', { username: user.username, message });
  console.log(`Chat from ${user.username}: ${message}`);
  if (!message.startsWith("/")) return;

  const [command, ...args] = message.slice(1).trim().split(/\s+/);

  try {
    totalCommands++;
    global.emitBotEvent?.('command', { username: user.username, command });
    
    switch (command.toLowerCase()) {
      case "balance":
        if (!(user.id in balances)) balances[user.id] = 100;
        await bot.whisper.send(user.id, `💰 Your balance: ${balances[user.id]} coins.`);
        break;

      case "gamble":
        if (args.length === 0) {
          await bot.whisper.send(user.id, "❗ Usage: /gamble <positive number>");
          break;
        }
        const amount = parseInt(args[0], 10);
        if (isNaN(amount) || amount <= 0) {
          await bot.whisper.send(user.id, "❗ Usage: /gamble <positive number>");
          break;
        }
        if (!(user.id in balances)) balances[user.id] = 100;

        if (balances[user.id] < amount) {
          await bot.whisper.send(user.id, `❌ You only have ${balances[user.id]} coins.`);
          break;
        }

        const win = Math.random() < 0.5;
        if (win) {
          balances[user.id] += amount;
          await bot.whisper.send(user.id, `🎉 You won ${amount} coins! New balance: ${balances[user.id]}.`);
        } else {
          balances[user.id] -= amount;
          await bot.whisper.send(user.id, `😢 You lost ${amount} coins. New balance: ${balances[user.id]}.`);
        }
        break;

      case "8ball":
        const question = args.join(" ");
        if (!question) {
          await bot.whisper.send(user.id, "🎱 Ask a question to get an answer!");
          break;
        }
        const response = answers[Math.floor(Math.random() * answers.length)];
        await bot.whisper.send(user.id, `🎱 ${response}`);
        break;

      case "emote":
        if (args.length === 0 || args[0].toLowerCase() === "list") {
          // Send emote list in chunks
          const chunkSize = 10;
          for (let i = 0; i < emotes.length; i += chunkSize) {
            const chunk = emotes.slice(i, i + chunkSize)
              .map((e, idx) => `${i + idx + 1}. ${e[0]}`)
              .join("\n");
            await bot.whisper.send(user.id, `📃 Emote List (${i + 1}-${Math.min(i + chunkSize, emotes.length)}):\n${chunk}`);
          }
          break;
        }

        const index = parseInt(args[0], 10) - 1;
        if (isNaN(index) || index < 0 || index >= emotes.length) {
          await bot.whisper.send(user.id, "❌ Invalid emote number! Use '/emote list' to see available emotes.");
          break;
        }

        try {
          await bot.emote.play(user.id, emotes[index][1]);
          await bot.chat.send(`🎭 ${user.username} is performing: ${emotes[index][0]}`);
        } catch (err) {
          console.error("Emote error:", err);
          await bot.whisper.send(user.id, "❌ Failed to perform emote. Please try again.");
        }
        break;

      default:
        await bot.whisper.send(user.id, "❓ Unknown command. Available commands: /balance, /gamble, /8ball, /emote");
    }
  } catch (error) {
    console.error("Error handling command:", error);
    await bot.whisper.send(user.id, "❌ An error occurred while processing your command.");
  }
});

console.log("Bot is running...");
