# game-barquinho

Barquinho de Papel: um jogo de corrida infinita em pixel art. Você escolhe um integrante do grupo, desce o rio num barquinho de papel e tenta ir o mais longe possível.

- Pule pedras, troncos e ondas (toque na tela, ou Espaço/↑; toque de novo no ar para o pulo duplo).
- Abaixe para passar sob gaivotas e cipós (botão Abaixar, ou ↓).
- 7 fases em ciclo: mar aberto, tempestade, floresta, floresta à noite, mar à noite, tempestade noturna e amanhecer.
- Ranking online com a melhor distância de cada jogador.
- Pode ser instalado no celular (PWA).

## Estrutura

| Arquivo | O que é |
|---|---|
| `game.html` | O jogo inteiro (HTML, CSS e JS, sem framework). Também é a versão publicada no claude.ai. |
| `build.sh` | Gera o `index.html` a partir do `game.html`, com as tags de PWA. |
| `api/score.js`, `api/ranking.js` | Funções da Vercel que salvam e listam o ranking. |
| `sw.js`, `manifest.webmanifest`, `icons/` | PWA. |
| `img/`, `musica.mp3` | Desenhos dos integrantes e a música de fundo. |

## Rodar localmente

```sh
npm install
echo 'DATABASE_URL="postgresql://..."' > .env.local
npm run dev           # http://localhost:3050, sem ranking (não grava no banco)
npm run dev:ranking   # com ranking, usando o DATABASE_URL do .env.local
```

Depois de editar o `game.html`, rode `sh build.sh` para atualizar o `index.html`.

## Banco

O ranking usa a tabela `barquinho_ranking` no Postgres (Neon). Cada aparelho tem uma linha com a melhor pontuação.

```sql
CREATE TABLE barquinho_ranking (
  device_id     uuid PRIMARY KEY,
  nome          text NOT NULL CHECK (char_length(nome) BETWEEN 1 AND 20),
  personagem    text NOT NULL CHECK (char_length(personagem) <= 20),
  pontos        integer NOT NULL CHECK (pontos BETWEEN 0 AND 100000),
  fase          integer NOT NULL DEFAULT 1 CHECK (fase BETWEEN 1 AND 1000),
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX barquinho_ranking_pontos_idx ON barquinho_ranking (pontos DESC, atualizado_em);
```

## Deploy (Vercel)

Configure a variável de ambiente `DATABASE_URL` no projeto da Vercel e faça o deploy da raiz do repositório. Não há etapa de build: o `index.html` já vai pronto no repositório.
