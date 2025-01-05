// api/enviarMensaje.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { numero, mensaje } = req.body;

    // Aquí se implementará la lógica para enviar el mensaje con Twilio
    // Por ahora, respondamos con los datos recibidos
    res.status(200).json({ numero, mensaje });
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}

