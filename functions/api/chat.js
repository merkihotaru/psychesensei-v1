// Cloudflare Pages Function: /api/chat
//
// This runs on Cloudflare's servers (not in the user's browser), so your
// API key stays secret. The frontend calls this endpoint instead of
// calling the AI provider directly.
//
// Uses Google's Gemini API, which has a generous free tier (no credit
// card required). Get a free key at https://aistudio.google.com/apikey
//
// Setup: in your Cloudflare Pages project settings, add an environment
// variable/secret named GEMINI_API_KEY with that key.

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, system, max_tokens } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages array is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const MAX_TOKENS_CAP = 500;
  const safeMaxTokens = Math.min(Number(max_tokens) || 300, MAX_TOKENS_CAP);

  if (!env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Server is not configured with an API key yet." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        generationConfig: {
          maxOutputTokens: safeMaxTokens,
        },
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || "Upstream error" }), {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";

    return new Response(JSON.stringify({ content: [{ type: "text", text }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to reach AI service" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
