import { sql, UUID, position } from './_db.js';

// top 10 plus where the asking device stands
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET.' });
  const device = String(req.query?.device || '');
  try {
    const top = await sql`
      SELECT device_id, nome, personagem, pontos, fase
      FROM barquinho_ranking
      ORDER BY pontos DESC, atualizado_em ASC
      LIMIT 10`;
    const [{ total }] = await sql`SELECT count(*)::int AS total FROM barquinho_ranking`;
    let eu = null;
    if (UUID.test(device)) {
      const [r] = await sql`SELECT nome, personagem, pontos, fase FROM barquinho_ranking WHERE device_id = ${device}`;
      if (r) eu = { ...r, pos: await position(r.pontos) };
    }
    return res.status(200).json({
      total,
      top: top.map(({ device_id, ...r }, i) => ({ ...r, pos: i + 1, voce: device_id === device })),
      eu,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Não deu para carregar o ranking.' });
  }
}
