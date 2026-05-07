const { google } = require('googleapis');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nom, tel, service, date, heure, duree } = req.body;

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Parse date and time - fix timezone
    const startDateTime = `${date}T${heure}:00`;
    const [year, month, day] = date.split('-');
    const [hour, minute] = heure.split(':');
    
    const durationMap = {
      '1h': 60, '1h45': 105, '45min': 45,
      '5 séances': 60, '10 séances': 60
    };
    const durationMin = durationMap[duree] || 60;

    const endHour = Math.floor((parseInt(hour) * 60 + parseInt(minute) + durationMin) / 60);
    const endMinute = (parseInt(minute) + durationMin) % 60;
    const endDateTime = `${date}T${String(endHour).padStart(2,'0')}:${String(endMinute).padStart(2,'0')}:00`;

    const event = {
      summary: `🌿 RDV - ${service}`,
      description: `Client : ${nom}\nTéléphone : ${tel}\nPrestation : ${service}\nDurée : ${duree}\n\nPaiement en espèces sur place.`,
      start: {
        dateTime: startDateTime,
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'Europe/Paris',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 1440 }, // 24h avant
        ],
      },
    };

    await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Calendar error:', error);
    return res.status(500).json({ error: error.message });
  }
}
