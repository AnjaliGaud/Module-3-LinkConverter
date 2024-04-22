const { Telegraf } = require("telegraf");

const conversionCycle = require("./conversionCycle.js");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("Welcome to LinkConverter bot. 😎😎😎 "));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));

bot.command("startConversion", async (ctx, next) => {
  await ctx.reply("Starting Conversion Cycle");
  conversionCycle.startConversionCycle(bot, ctx, next);
  next();
});

bot.command("stopConversion", async (ctx, next) => {
  await ctx.reply("Stopping Conversion Cycle");
  conversionCycle.stopConversionCycle();
  next();
});

bot.use(conversionCycle.convertedMsgListener);
bot.use(conversionCycle.updateMsgDocListener);

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

module.exports = { bot };
