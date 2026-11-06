import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const PERSONAGENS = new Set(['adila', 'bequi', 'breno', 'davi', 'debora', 'iago', 'ingrid', 'jael', 'levi', 'milena', 'najla', 'regis', 'sarah', 'thais', 'victor']);
// top speed is ~25 m/s, so anything above this is not a real run
export const MAX_PONTOS = 50000;

export function cleanName(v) {
  return String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
}

export async function position(pontos) {
  const [{ pos }] = await sql`SELECT count(*)::int + 1 AS pos FROM barquinho_ranking WHERE pontos > ${pontos}`;
  return pos;
}

// "Débora", "debora " and "DEBORA" are the same name
export function nameKey(v) {
  return cleanName(v).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// a name belongs to the first device that saved a score with it
export async function nameTaken(nome, device) {
  const key = nameKey(nome);
  const rows = await sql`SELECT nome FROM barquinho_ranking WHERE device_id <> ${device}`;
  return rows.some(r => nameKey(r.nome) === key);
}
