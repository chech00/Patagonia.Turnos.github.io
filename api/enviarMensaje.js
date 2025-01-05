// api/enviarMensaje.js

import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { numero, mensaje } = req.body;

    // Validar entrada
    if (!numero || !mensaje) {
      return res.status(400).json({ error: 'Número y mensaje son requeridos.' });
    }

    // Configurar Twilio Client
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    const client = twilio(accountSid, authToken);

    try {
      const message = await client.messages.create({
        body: mensaje,
        from: whatsappNumber,
        to: `whatsapp:${numero}`,
      });

      res.status(200).json({ success: true, sid: message.sid });
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp:', error);
      res.status(500).json({ success: false, error: 'Error al enviar el mensaje.' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}

