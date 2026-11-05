import { UUID, cleanName, nameTaken } from './_db.js';

// is this name free for this device?
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET.' });
  const nome = cleanName(req.query?.nome), device = String(req.query?.device || '');
  if (!nome) return res.status(400).json({ error: 'Informe um nome.' });
  if (!UUID.test(device)) return res.status(400).json({ error: 'Aparelho inválido.' });
  try {
    return res.status(200).json({ livre: !(await nameTaken(nome, device)) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Não deu para conferir o nome agora.' });
  }
}
