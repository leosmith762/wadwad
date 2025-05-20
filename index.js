const { Highrise } = require("highrise-js-sdk");
const { settings, authentication } = require("./config/config");

const bot = new Highrise(authentication.token, authentication.room);

// Keep track of connected users manually
const users = new Map(); // userId => username

// Store coin balances
const balances = {};

// 8ball answers
const answers = [
  "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes – definitely.",
  "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.",
  "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.",
  "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
  "Don't count on it.", "My reply is no.", "My sources say no.",
  "Outlook not so good.", "Very doubtful."
];

// Your emotes list
const emotes = [
  ["Sit", "idle-loop-sitfloor"],
  ["Enthused", "idle-enthusiastic"],
  ["Yes", "emote-yes"],
  ["The Wave", "emote-wave"],
  ["Tired", "emote-tired"],
  ["Snowball Fight!", "emote-snowball"],
  ["Snow Angel", "emote-snowangel"],
  ["Shy", "emote-shy"],
  ["Sad", "emote-sad"],
  ["No", "emote-no"],
  ["Model", "emote-model"],
  ["Flirty Wave", "emote-lust"],
  ["Laugh", "emote-laughing"],
  ["Kiss", "emote-kiss"],
  ["Sweating", "emote-hot"],
  ["Hello", "emote-hello"],
  ["Greedy Emote", "emote-greedy"],
  ["Face Palm", "emote-exasperatedb"],
  ["Curtsy", "emote-curtsy"],
  ["Confusion", "emote-confused"],
  ["Charging", "emote-charging"],
  ["Bow", "emote-bow"],
  ["Thumbs Up", "emoji-thumbsup"],
  ["Tummy Ache", "emoji-gagging"],
  ["Flex", "emoji-flex"],
  ["Cursing Emote", "emoji-cursing"],
  ["Raise The Roof", "emoji-celebrate"],
  ["Angry", "emoji-angry"],
  ["Savage Dance", "dance-tiktok8"],
  ["Don't Start Now", "dance-tiktok2"],
  ["Let's Go Shopping", "dance-shoppingcart"],
  ["Russian Dance", "dance-russian"],
  ["Penny's Dance", "dance-pennywise"],
  ["Macarena", "dance-macarena"],
  ["K-Pop Dance", "dance-blackpink"],
  ["Hyped", "emote-hyped"],
  ["Jinglebell", "dance-jinglebell"],
  ["Nervous", "idle-nervous"],
  ["Toilet", "idle-toilet"],
  ["Astronaut", "emote-astronaut"],
  ["Dance Zombie", "dance-zombie"],
  ["Heart Eyes", "emote-hearteyes"],
  ["Swordfight", "emote-swordfight"],
  ["TimeJump", "emote-timejump"],
  ["Snake", "emote-snake"],
  ["Heart Fingers", "emote-heartfingers"],
  ["Float", "emote-float"],
  ["Telekinesis", "emote-telekinesis"],
  ["Penguin dance", "dance-pinguin"],
  ["Creepy puppet", "dance-creepypuppet"],
  ["Sleigh", "emote-sleigh"],
  ["Maniac", "emote-maniac"],
  ["Energy Ball", "emote-energyball"],
  ["Singing", "idle_singing"],
  ["Frog", "emote-frog"],
  ["Superpose", "emote-superpose"],
  ["Cute", "emote-cute"],
  ["TikTok Dance 9", "dance-tiktok9"],
  ["Weird Dance", "dance-weird"],
  ["TikTok Dance 10", "dance-tiktok10"],
  ["Pose 7", "emote-pose7"],
  ["Pose 8", "emote-pose8"],
  ["Casual Dance", "idle-dance-casual"],
  ["Pose 1", "emote-pose1"],
  ["Pose 3", "emote-pose3"],
  ["Pose 5", "emote-pose5"],
  ["Cutey", "emote-cutey"],
  ["Punk Guitar", "emote-punkguitar"],
  ["Fashionista", "emote-fashionista"],
  ["Gravity", "emote-gravity"],
  ["Ice Cream Dance", "dance-icecream"],
  ["Wrong Dance", "dance-wrong"],
  ["UwU", "idle-uwu"],
  ["TikTok Dance 4", "idle-dance-tiktok4"],
  ["Advanced Shy", "emote-shy2"],
  ["Anime Dance", "dance-anime"],
  ["Kawaii", "dance-kawai"],
  ["Scritchy", "idle-wild"],
  ["Ice Skating", "emote-iceskating"],
  ["SurpriseBig", "emote-pose6"],
  ["Celebration Step", "emote-celebrationstep"],
  ["Creepycute", "emote-creepycute"],
  ["Pose 10", "emote-pose10"],
  ["Boxer", "emote-boxer"],
  ["Head Blowup", "emote-headblowup"],
  ["Ditzy Pose", "emote-pose9"],
  ["Teleporting", "emote-teleporting"],
  ["Touch", "dance-touch"],
  ["Air Guitar", "idle-guitar"],
  ["This Is For You", "emote-gift"],
  ["Push it", "dance-employee"]
];

// On user join
bot.on("userJoined", (user) => {
  users.set(user.id, user.username);
  balances[user.id] ??= 100; // start balance
  global.emitBotEvent?.('join', { username: user.username });
});

// On user leave
bot.on("userLeft", (user) => {
  users.delete(user.id);
  global.emitBotEvent?.('leave', { username: user.username });
});

// Command handler
bot.on("chat", async (user, message) => {
  if (!message.startsWith("/")) return;

  const [command, ...args] = message.slice(1).trim().split(/\s+/);

  try {
    switch (command.toLowerCase()) {
      case "balance":
        balances[user.id] ??= 100;
        await bot.whisper.send(user.id, `💰 Your balance: ${balances[user.id]} coins.`);
        break;

      case "gamble":
        if (!args[0]) {
          await bot.whisper.send(user.id, "❗ Usage: /gamble <amount>");
          return;
        }
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) {
          await bot.whisper.send(user.id, "❗ Please enter a valid positive number to gamble.");
          return;
        }
        balances[user.id] ??= 100;
        if (balances[user.id] < amount) {
          await bot.whisper.send(user.id, `❌ You only have ${balances[user.id]} coins.`);
          return;
        }
        if (Math.random() < 0.5) {
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
          await bot.whisper.send(user.id, "🎱 Ask me a question!");
          return;
        }
        const response = answers[Math.floor(Math.random() * answers.length)];
        await bot.whisper.send(user.id, `🎱 ${response}`);
        break;

      case "emote":
        if (args.length === 0 || args[0].toLowerCase() === "list") {
          const chunkSize = 10;
          for (let i = 0; i < emotes.length; i += chunkSize) {
            const chunk = emotes.slice(i, i + chunkSize)
              .map((e, idx) => `${i + idx + 1}. ${e[0]}`)
              .join("\n");
            await bot.whisper.send(user.id, `📃 Emote List (${i+1}-${Math.min(i+chunkSize, emotes.length)}):\n${chunk}`);
          }
          return;
        }

        const idx = parseInt(args[0], 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= emotes.length) {
          await bot.whisper.send(user.id, "❌ Invalid emote number! Use '/emote list' to see available emotes.");
          return;
        }

        try {
          // Note: SDK method may vary. Here we assume bot.emote.play(userId, emoteId) works.
          await bot.emote.play(user.id, emotes[idx][1]);
          await bot.chat.send(`🎭 ${user.username} is performing: ${emotes[idx][0]}`);
        } catch (err) {
          console.error("Emote error:", err);
          await bot.whisper.send(user.id, "❌ Failed to perform emote. Please try again.");
        }
        break;

      default:
        await bot.whisper.send(user.id, "❓ Unknown command. Available commands: /balance, /gamble, /8ball, /emote");
    }
  } catch (err) {
    console.error("Command error:", err);
    await bot.whisper.send(user.id, "❌ An error occurred processing your command.");
  }
});

console.log("Bot is running...");