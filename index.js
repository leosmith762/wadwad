const { Highrise } = require("highrise-js-sdk");
const { settings, authentication } = require("./config/config");

const bot = new Highrise(authentication.token, authentication.room);

// Full emotes list as provided
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

// Dance-only emotes (for autodance)
const danceEmotes = emotes.filter(e => e[1].startsWith("dance") || e[1].startsWith("idle-dance"));

const userAutoDanceIntervals = new Map();

function sendEmoteList(userId) {
  const chunkSize = 20;
  for (let i = 0; i < emotes.length; i += chunkSize) {
    const chunk = emotes.slice(i, i + chunkSize)
      .map((e, idx) => `${i + idx + 1}: ${e[0]}`)
      .join("\n");
    bot.whisper.send(userId, `📃 Emote List:\n${chunk}`);
  }
}

bot.on('ready', () => {
  console.log("✅ Bot is ready.");
});

bot.on('playerJoin', async (player) => {
  bot.whisper.send(player.id, `👋 Welcome to the room, ${player.username}! Type /emote list to see emotes or /autodanceself start to start dancing!`);
});

// Simple coin system
const userBalances = new Map();

function getBalance(userId) {
  if (!userBalances.has(userId)) userBalances.set(userId, 100);
  return userBalances.get(userId);
}

function updateBalance(userId, amount) {
  const newBal = getBalance(userId) + amount;
  userBalances.set(userId, newBal < 0 ? 0 : newBal);
  return userBalances.get(userId);
}

const eightBallAnswers = [
  "It is certain.",
  "Without a doubt.",
  "You may rely on it.",
  "Yes – definitely.",
  "As I see it, yes.",
  "Most likely.",
  "Outlook good.",
  "Yes.",
  "Signs point to yes.",
  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Concentrate and ask again.",
  "Don't count on it.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Very doubtful."
];

let currentMusicUrl = null;

bot.on('chatMessageCreate', async (user, message) => {
  if (!message.startsWith("/")) return;

  const args = message.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'emote') {
    if (args[0] === 'list') return sendEmoteList(user.id);

    const index = parseInt(args[0]);
    if (isNaN(index) || index < 1 || index > emotes.length) {
      return bot.whisper.send(user.id, `❌ Invalid emote number.`);
    }

    const emoteId = emotes[index - 1][1];
    try {
      await bot.player.emote(user.id, emoteId);
      bot.whisper.send(user.id, `🎉 Emoting: ${emotes[index - 1][0]}`);
    } catch {
      bot.whisper.send(user.id, `❌ Failed to play emote.`);
    }
  }

  else if (command === "play") {
    const url = args[0];
    if (!url) return bot.whisper.send(user.id, "❗ Usage: /play <music-url>");
    try {
      await bot.music.play(url);
      currentMusicUrl = url;
      bot.whisper.send(user.id, `🎵 Now playing: ${url}`);
    } catch {
      bot.whisper.send(user.id, "❌ Failed to play music.");
    }
  }

  else if (command === "stopmusic") {
    if (!currentMusicUrl) return bot.whisper.send(user.id, "❗ No music is currently playing.");
    try {
      await bot.music.stop();
      currentMusicUrl = null;
      bot.whisper.send(user.id, "🛑 Music stopped.");
    } catch {
      bot.whisper.send(user.id, "❌ Failed to stop music.");
    }
  }

  else if (command === "autodanceself") {
    const sub = args[0]?.toLowerCase();
    if (!sub || !["start", "stop"].includes(sub)) {
      return bot.whisper.send(user.id, "❗ Usage: /autodanceself <start|stop>");
    }
  }