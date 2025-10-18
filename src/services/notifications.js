const fetch = require("node-fetch");

/**
 * Send push notification via Expo Push API
 * @param {string|string[]} expoTokens - One or multiple Expo push tokens (ExponentPushToken[...])
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional extra payload
 */
async function sendPush(expoTokens, title, body, data = {}) {
  if (!expoTokens) return;

  const tokens = Array.isArray(expoTokens) ? expoTokens : [expoTokens];

  const messages = tokens
    .filter(Boolean)
    .map((to) => ({
      to,
      sound: "default",
      title,
      body,
      data,
    }));

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const resData = await response.json();
    // console.log("Expo push response:", resData);
    return resData;
  } catch (err) {
    console.error("Expo push error:", err);
    throw err;
  }
}

module.exports = { sendPush };

