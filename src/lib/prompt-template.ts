// Gemma 4 Chat-Template (canonical Jinja from HF tokenizer_config):
// <start_of_turn>user\n{content}<end_of_turn>\n
// <start_of_turn>model\n{content}<end_of_turn>\n
// ...
// <start_of_turn>model\n   ← Prompt-Ende, Modell generiert ab hier
//
// BOS wird NICHT manuell prepended — MediaPipes Tokenizer fuegt BOS automatisch
// hinzu (Gemmas tokenizer config: add_bos_token=true). Doppel-BOS verwirrt das
// Modell.
//
// Historische Nachrichten werden defensiv von geleakten Stop-Tokens bereinigt,
// falls noch welche aus frueheren Sessions in IndexedDB liegen.

export type Role = "user" | "assistant" | "system";
export type Turn = { role: Role; content: string };

const STOP_TOKEN_BLEED =
  /<\s*\/?(?:end_of_turn|start_of_turn|eos|s|bos)\b[^>]*>|[\uFFFD\uE000-\uF8FF]/giu;

function sanitize(content: string): string {
  return content.replace(STOP_TOKEN_BLEED, "").trim();
}

export function renderGemmaPrompt(turns: Turn[]): string {
  const systemParts = turns.filter((t) => t.role === "system").map((t) => t.content);
  const system = systemParts.map(sanitize).filter(Boolean).join("\n\n");
  const convo = turns.filter((t) => t.role !== "system");

  let out = "";
  let firstUser = true;
  for (const t of convo) {
    const clean = sanitize(t.content);
    if (!clean) continue;
    if (t.role === "user") {
      const content = firstUser && system ? `${system}\n\n${clean}` : clean;
      out += `<start_of_turn>user\n${content}<end_of_turn>\n`;
      firstUser = false;
    } else {
      out += `<start_of_turn>model\n${clean}<end_of_turn>\n`;
    }
  }
  out += "<start_of_turn>model\n";
  return out;
}
