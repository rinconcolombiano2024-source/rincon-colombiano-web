export type ChatInput = { question: string; locale: string; history?: { role: "user" | "assistant"; text: string }[] };
export function nativeRestaurantChat(): { configured(): boolean; answer(input: ChatInput): Promise<string> };
