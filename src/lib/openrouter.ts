const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";

type OpenRouterResult = {
  ok: boolean;
  output: string;
  model?: string;
  error?: string;
};

export async function callOpenRouter(prompt: string, model = "gpt-4o-mini"): Promise<OpenRouterResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      output: "",
      error: "OpenRouter API key missing. Set OPENROUTER_API_KEY in .env.local",
    };
  }

  try {
    const response = await fetch(OPENROUTER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "XLInteractive Mission Control",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are an operations copilot summarizing mission control data.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 256,
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        output: "",
        error: `OpenRouter request failed (${response.status})`,
      };
    }

    const data = await response.json();
    const output = data?.choices?.[0]?.message?.content ?? "";

    return { ok: true, output, model: data?.model };
  } catch (error) {
    return {
      ok: false,
      output: "",
      error: error instanceof Error ? error.message : "Unknown OpenRouter error",
    };
  }
}
