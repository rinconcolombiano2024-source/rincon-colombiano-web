/** Keep chat history bounded without cutting an emoji's surrogate pair in half. */
function truncateCharacters(value: string, maxCharacters: number): string {
  return Array.from(value).slice(0, maxCharacters).join("");
}

/** Match the server's byte limit even for Polish characters and emoji. */
export function buildChatPayload(question: string, locale: string, messages: readonly { role: "user" | "assistant"; text: string }[]): string {
  const history = messages.slice(-6).map(message => ({ role: message.role, text: truncateCharacters(message.text, 800) }));
  const input = { question: truncateCharacters(question.trim(), 800), locale, history };
  let body = JSON.stringify(input);
  while (new TextEncoder().encode(body).byteLength > 5000 && history.length > 0) {
    history.shift();
    body = JSON.stringify(input);
  }
  return body;
}
