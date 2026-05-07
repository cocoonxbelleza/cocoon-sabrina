export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nom, email, service, date, heure, duree, prix } = req.body;

  if (!email) {
    return res.status(200).json({ success: true, skipped: 'no email' });
  }

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
        to: email,
        subject: '✅ Votre rendez-vous est confirmé — Cocoon by Sabrina',
        html: `
          <div style="font-family:'Georgia',serif;max-width:560px;margin:0 auto;background:#f7f4ef;padding:40px 20px;">
            <div style="text-align:center;margin-bottom:32px;">
              <div style="font-size:40px;">🌿</div>
              <h1 style="font-family:Georgia,serif;font-weight:300;font-style:italic;font-size:1.8rem;color:#3a3530;margin:8px 0 4px;">Cocoon by Sabrina</h1>
              <p style="font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:#8a9e8a;">Massage bien-être & Madérothérapie</p>
            </div>

            <div style="background:white;border-radius:14px;padding:32px;border:1px solid #d8e3d4;">
              <h2 style="font-family:Georgia,serif;font-weight:400;font-size:1.3rem;color:#3a3530;margin-bottom:20px;">Bonjour ${nom},</h2>
              <p style="color:#7a7068;font-size:0.9rem;line-height:1.8;margin-bottom:24px;">
                Votre rendez-vous a été <strong style="color:#27ae60;">confirmé</strong> par Sabrina. Voici le récapitulatif :
              </p>

              <div style="background:#eef3ec;border-radius:10px;padding:20px;margin-bottom:24px;">
                <table style="width:100%;font-size:0.85rem;border-collapse:collapse;">
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
                  <tr style="border-bottom:1px solid #d8e3d4;">
                    <td style="padding:8px 0;color:#7a7068;">Lieu</td>
                    <td style="padding:8px 0;color:#3a3530;font-weight:500;text-align:right;">13010 Marseille<br><span style="font-size:0.75rem;color:#8a9e8a;">Adresse exacte communiquée par Sabrina</span></td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0 0;color:#7a7068;">Total</td>
                    <td style="padding:10px 0 0;color:#6b5b4e;font-family:Georgia,serif;font-size:1.2rem;font-weight:600;text-align:right;">${prix} €</td>
                  </tr>
                </table>
              </div>

              <p style="color:#7a7068;font-size:0.82rem;line-height:1.8;margin-bottom:8px;">
                💵 <strong>Paiement uniquement en espèces, sur place.</strong>
              </p>
              <p style="color:#7a7068;font-size:0.82rem;line-height:1.8;">
                En cas d'empêchement, merci de prévenir Sabrina au moins 24h à l'avance au <strong>07 81 02 01 29</strong>.
              </p>
            </div>

            <div style="text-align:center;margin-top:28px;">
              <p style="font-size:0.75rem;color:#8a9e8a;letter-spacing:0.08em;">À très bientôt 🌿</p>
              <p style="font-size:0.72rem;color:#b5c4b0;margin-top:8px;">Cocoon by Sabrina · 13010 Marseille · 07 81 02 01 29</p>
            </div>
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
    console.error('Email error:', error);
    return res.status(500).json({ error: error.message });
  }
}
