export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nom, tel, email, service, date, heure, duree, prix, note } = req.body;

  const dateObj = new Date(date + 'T00:00:00');
  const dateStr = dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Cocoon by Sabrina <onboarding@resend.dev>',
        to: 'sabvaliente@hotmail.fr',
        subject: `🌿 Nouveau RDV — ${nom} · ${dateStr} à ${heure}`,
        html: `
          <div style="font-family:'Georgia',serif;max-width:560px;margin:0 auto;background:#f7f4ef;padding:40px 20px;">
            <div style="text-align:center;margin-bottom:28px;">
              <div style="font-size:36px;">🌿</div>
              <h1 style="font-family:Georgia,serif;font-weight:300;font-style:italic;font-size:1.6rem;color:#3a3530;margin:8px 0 4px;">Nouveau rendez-vous</h1>
              <p style="font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:#8a9e8a;">Cocoon by Sabrina</p>
            </div>

            <div style="background:white;border-radius:14px;padding:28px;border:1px solid #d8e3d4;margin-bottom:20px;">
              <h2 style="font-family:Georgia,serif;font-weight:400;font-size:1.1rem;color:#3a3530;margin-bottom:16px;">Détails du rendez-vous</h2>
              <table style="width:100%;font-size:0.85rem;border-collapse:collapse;">
                <tr style="border-bottom:1px solid #d8e3d4;">
                  <td style="padding:8px 0;color:#7a7068;">Client</td>
                  <td style="padding:8px 0;color:#3a3530;font-weight:500;text-align:right;">${nom}</td>
                </tr>
                <tr style="border-bottom:1px solid #d8e3d4;">
                  <td style="padding:8px 0;color:#7a7068;">Téléphone</td>
                  <td style="padding:8px 0;color:#3a3530;font-weight:500;text-align:right;">${tel}</td>
                </tr>
                <tr style="border-bottom:1px solid #d8e3d4;">
                  <td style="padding:8px 0;color:#7a7068;">Email</td>
                  <td style="padding:8px 0;color:#3a3530;font-weight:500;text-align:right;">${email || 'Non renseigné'}</td>
                </tr>
                <tr style="border-bottom:1px solid #d8e3d4;">
                  <td style="padding:8px 0;color:#7a7068;">Prestation</td>
                  <td style="padding:8px 0;color:#3a3530;font-weight:500;text-align:right;">${service}</td>
                </tr>
                <tr style="border-bottom:1px solid #d8e3d4;">
                  <td style="padding:8px 0;color:#7a7068;">Date</td>
                  <td style="padding:8px 0;color:#3a3530;font-weight:500;text-align:right;">${dateStr}</td>
                </tr>
                <tr style="border-bottom:1px solid #d8e3d4;">
                  <td style="padding:8px 0;color:#7a7068;">Heure</td>
                  <td style="padding:8px 0;color:#3a3530;font-weight:500;text-align:right;">${heure}</td>
                </tr>
                <tr style="border-bottom:1px solid #d8e3d4;">
                  <td style="padding:8px 0;color:#7a7068;">Durée</td>
                  <td style="padding:8px 0;color:#3a3530;font-weight:500;text-align:right;">${duree}</td>
                </tr>
                ${note ? `
                <tr style="border-bottom:1px solid #d8e3d4;">
                  <td style="padding:8px 0;color:#7a7068;">Note client</td>
                  <td style="padding:8px 0;color:#3a3530;font-weight:500;text-align:right;">${note}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding:10px 0 0;color:#7a7068;">Prix</td>
                  <td style="padding:10px 0 0;color:#6b5b4e;font-family:Georgia,serif;font-size:1.2rem;font-weight:600;text-align:right;">${prix} €</td>
                </tr>
              </table>
            </div>

            <div style="text-align:center;">
              <a href="https://cocoon-sabrina.vercel.app/admin.html" style="display:inline-block;background:#8a9e8a;color:white;padding:12px 32px;border-radius:50px;text-decoration:none;font-size:0.82rem;letter-spacing:0.12em;text-transform:uppercase;font-family:Georgia,serif;">
                → Accéder au back-office
              </a>
            </div>

            <p style="text-align:center;font-size:0.72rem;color:#b5c4b0;margin-top:24px;">Cocoon by Sabrina · 13010 Marseille · 07 81 02 01 29</p>
          </div>
        `
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Notify error:', error);
    return res.status(500).json({ error: error.message });
  }
}
