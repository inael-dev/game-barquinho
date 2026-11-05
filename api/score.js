import { sql, UUID, PERSONAGENS, MAX_PONTOS, cleanName, position, nameTaken } from './_db.js';

// saves a run; the table keeps only each device's best score
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ error: 'Corpo inválido.' });

  const device = String(b.device || '');
  const nome = cleanName(b.nome);
  const personagem = String(b.personagem || '');
  const pontos = Number(b.pontos), fase = Number(b.fase);
  if (!UUID.test(device)) return res.status(400).json({ error: 'Aparelho inválido.' });
  if (!nome) return res.status(400).json({ error: 'Informe um nome.' });
  if (!PERSONAGENS.has(personagem)) return res.status(400).json({ error: 'Personagem inválido.' });
  if (!Number.isInteger(pontos) || pontos < 0 || pontos > MAX_PONTOS) return res.status(400).json({ error: 'Pontuação inválida.' });
  if (!Number.isInteger(fase) || fase < 1 || fase > 1000) return res.status(400).json({ error: 'Fase inválida.' });

  try {
    if (await nameTaken(nome, device)) return res.status(409).json({ error: 'nome_em_uso', nome });
    const [row] = await sql`
      INSERT INTO barquinho_ranking (device_id, nome, personagem, pontos, fase)
      VALUES (${device}, ${nome}, ${personagem}, ${pontos}, ${fase})
      ON CONFLICT (device_id) DO UPDATE SET
        nome = EXCLUDED.nome,
        personagem = EXCLUDED.personagem,
        fase = CASE WHEN EXCLUDED.pontos > barquinho_ranking.pontos THEN EXCLUDED.fase ELSE barquinho_ranking.fase END,
        atualizado_em = CASE WHEN EXCLUDED.pontos > barquinho_ranking.pontos THEN now() ELSE barquinho_ranking.atualizado_em END,
        pontos = GREATEST(barquinho_ranking.pontos, EXCLUDED.pontos)
      RETURNING pontos`;
    return res.status(200).json({ best: row.pontos, pos: await position(row.pontos), novo: pontos >= row.pontos && pontos > 0 });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Não deu para salvar agora.' });
  }
}
