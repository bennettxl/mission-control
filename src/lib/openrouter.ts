const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_REFERRER = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
const OPENROUTER_REFERRER = process.env.OPENROUTER_REFERRER ?? process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_REFERRER;
const OPENROUTER_APP_TITLE = process.env.OPENROUTER_APP_TITLE ?? "XLInteractive Mission Control";

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
        "HTTP-Referer": OPENROUTER_REFERRER,
        "X-Title": OPENROUTER_APP_TITLE,
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

    const raw = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        output: "",
        error: `OpenRouter request failed (${response.status}): ${raw}`.slice(0, 500),
      };
    }

    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch (parseError) {
      console.warn("Failed to parse OpenRouter response", parseError);
    }

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
