// Telegram delivery now goes through our own server endpoint.
// The bot token and chat id must never be stored in browser JavaScript.
async function sendFormToTelegram(type, data) {
  try {
    const res = await fetch('/api/telegram.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    });

    let payload = {};
    try { payload = await res.json(); } catch (_) {}

    if (!res.ok || !payload.ok) {
      console.error('Telegram delivery failed:', payload.details || payload.error || res.status);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Form send error:', err);
    return false;
  }
}

async function submitModalForm({ title, name, phone, comment }) {
  return sendFormToTelegram('modal', { title, name, phone, comment });
}

async function submitCalcForm({ flagType, flagSize, print, kit, delivery, qty, price, phone, name }) {
  return sendFormToTelegram('calc', { flagType, flagSize, print, kit, delivery, qty, price, phone, name });
}

async function submitQuestionForm({ name, phone, message }) {
  return sendFormToTelegram('question', { name, phone, message });
}
