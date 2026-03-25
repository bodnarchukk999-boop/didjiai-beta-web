// Netlify Serverless Function: send-telegram
// Призначення: отримує дані форми з клієнта та надсилає повідомлення в Telegram.
//
// Важливо:
// - TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID потрібно задати в Netlify Environment variables.
// - Не зберігайте токен у фронтенді.

exports.handler = async (event) => {
  try {
    if (event.httpMethod && event.httpMethod.toUpperCase() !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Telegram env vars are not set" }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};

    const name = body.name || "";
    const phone = body.phone || "";
    const tableType = body.tableType || "";
    const date = body.date || "";
    const timeFrom = body.timeFrom || "";
    const timeTo = body.timeTo || "";
    const totalPrice = body.totalPrice ?? "";

    const message =
      "🔔 Нове бронювання DIDJIAI\n" +
      `👤 Клієнт: ${name}\n` +
      `📞 Телефон: ${phone}\n` +
      `🎱 Стіл: ${tableType}\n` +
      `📅 Дата: ${date}\n` +
      `⏰ Час: з ${timeFrom} до ${timeTo}\n` +
      `💰 Сума до сплати: ${totalPrice} грн`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Telegram API error (${res.status})`, details: text }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

