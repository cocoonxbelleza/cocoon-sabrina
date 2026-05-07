const { google } = require('googleapis');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nom, service, date, heure } = req.body;

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Chercher l'événement correspondant avec le bon fuseau horaire
    const startDateTime = `${date}T${heure}:00`;
    const [year, month, day] = date.split('-');
    const [hour, minute] = heure.split(':');
    
    const endHour = Math.min(parseInt(hour) + 3, 23);
    const endDateTime = `${date}T${String(endHour).padStart(2,'0')}:${minute}:00`;

    const events = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: `${startDateTime}+02:00`,
      timeMax: `${endDateTime}+02:00`,
      singleEvents: true,
    });

    const items = events.data.items || [];
    
    // Supprimer tous les événements trouvés sur ce créneau
    for (const event of items) {
      if (event.summary && event.summary.includes('RDV')) {
        await calendar.events.delete({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          eventId: event.id,
        });
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Calendar delete error:', error);
    return res.status(500).json({ error: error.message });
  }
}
