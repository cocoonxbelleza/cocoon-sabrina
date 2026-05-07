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

    // Chercher l'événement correspondant
    const [year, month, day] = date.split('-');
    const [hour, minute] = heure.split(':');
    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60000); // +2h

    const events = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      q: nom,
    });

    const items = events.data.items || [];
    
    // Supprimer tous les événements trouvés correspondant
    for (const event of items) {
      if (event.summary && event.summary.includes(service.substring(0, 10))) {
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
