const axios = require("axios");

const rand = () => Math.floor(Math.random() * (80 - 45 + 1) + 45) * 100;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==== Variables ====
const API_ENDPOINT = process.env.API_ENDPOINT;
const CHAT_ID = process.env.CHAT_ID;
const messagesToConvertArray = [];
let msg,
  stop,
  counter = 0;

// ==== Functions ====
module.exports.startConversionCycle = async (bot, ctx, next) => {
  if (!messagesToConvertArray.length) await getMsgsToConvert();

  stop = true;

  while (stop && counter < 49) {
    msg = messagesToConvertArray[0];

    await sendMsgToChannel(bot, msg);

    await delay(rand());
    counter++;
  }
  await ctx.reply("Conversion Cycle Completed");
  next();
};

module.exports.stopConversionCycle = async () => {
  stop = false;
};

// ========= Middlewares / Listeners ==========
module.exports.convertedMsgListener = async (ctx, next) => {
  if (ctx.chat.id !== CHAT_ID * 1) return next();
  if (!ctx.text.includes(`--Converted Links--`)) return next();

  ctx.convertedMsg = {};
  ctx.convertedMsg._id = ctx.text.match(/<(.*?)>/)?.[1];

  ctx.convertedMsg.convertedLinksArray = extractLinks(
    ctx.text,
    `https://teraboxapp.com`
  );
  next(ctx);
};

module.exports.updateMsgDocListener = async (ctx, next) => {
  messagesToConvertArray.shift();

  if (
    !ctx.convertedMsg ||
    !ctx.convertedMsg._id ||
    !ctx.convertedMsg.convertedLinksArray?.length
  )
    return next();
  const update = {
    convertedLinksArray: ctx.convertedMsg.convertedLinksArray,
    isLinkConverted: true,
  };
  try {
    await axios.patch(`${API_ENDPOINT}/${ctx.convertedMsg._id}`, update);
  } catch (err) {
    console.log(err.message);
  }
  next();
};

// ========= Helper Functions ==========
function extractLinks(mainString, substring) {
  const regex = new RegExp(substring + "[^\\s]*", "g");
  const matches = mainString.match(regex) || [];
  const extractedLinks = matches.map((match) => match);

  return extractedLinks;
}

async function getMsgsToConvert() {
  try {
    const response = await axios.get(`${API_ENDPOINT}/msgs-to-convert`);

    if (response.data.status !== "success") return null;

    messagesToConvertArray.push(...response.data.data);

    return true;
  } catch (error) {
    console.error(
      `Error getting Messages to convert form API: ${error.message}`
    );
    return false;
  }
}

async function sendMsgToChannel(bot, msg) {
  try {
    let strToSend = `\n<${msg._id}>,\n👇 👇\n${msg.linksArray.join("\n")}`;
    await bot.telegram.sendMessage(CHAT_ID, strToSend);
  } catch (error) {
    console.error(`Error sending message to channel: ${error.message}`);
  }
}
