import { describe, expect, it } from "vitest";
import { historyForRequest, type ChatMessage } from "./plannerChat";

const turn = (i: number): ChatMessage[] => [
  { role: "user", content: `question ${i}` },
  { role: "assistant", content: `answer ${i}` },
];

describe("historyForRequest", () => {
  it("sends short conversations as they are", () => {
    const messages = [...turn(1), { role: "user" as const, content: "next" }];
    expect(historyForRequest(messages)).toEqual(messages);
  });

  it("keeps only the most recent messages and always starts with the visitor", () => {
    const messages = [...Array.from({ length: 15 }, (_, i) => turn(i)).flat(), { role: "user" as const, content: "latest" }];
    const sent = historyForRequest(messages);
    expect(sent.length).toBeLessThanOrEqual(20);
    expect(sent[0].role).toBe("user");
    expect(sent.at(-1)).toEqual({ role: "user", content: "latest" });
  });

  it("trims very long messages", () => {
    const sent = historyForRequest([{ role: "user", content: "x".repeat(5000) }]);
    expect(sent[0].content).toHaveLength(2000);
  });
});
