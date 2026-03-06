const { Client, GatewayIntentBits } = require("discord.js");
const http = require("http");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = "1391379856360734812";
const ROLE_ID = "1400405101738459247";

let currentCount = 0;

client.once("ready", async () => {
  console.log(`Bot ready: ${client.user.tag}`);

  const guild = await client.guilds.fetch(GUILD_ID);
  await guild.members.fetch();

  updateRoleCount(guild);
  setInterval(() => updateRoleCount(guild), 60000);
});

function updateRoleCount(guild) {
  const role = guild.roles.cache.get(ROLE_ID);
  currentCount = role ? role.members.size : 0;
  console.log(`Role count updated: ${currentCount}`);
}

// HTTP server — website fetches /count from here
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  // CORS headers so Cloudflare Pages can fetch this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/count") {
    res.writeHead(200);
    res.end(JSON.stringify({ count: currentCount }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  }
}).listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});

client.login(TOKEN);
