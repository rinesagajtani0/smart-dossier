import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const hasOpenAI = Boolean(apiKey);

const client = apiKey ? new OpenAI({ apiKey }) : null;

export async function askJson(system, user, fallback) {
  if (!client) return fallback();

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    return JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.warn("OpenAI JSON call failed, using fallback:", error.message);
    return fallback();
  }
}

export async function askText(system, user, fallback) {
  if (!client) return fallback();

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    return response.choices[0]?.message?.content?.trim() || fallback();
  } catch (error) {
    console.warn("OpenAI text call failed, using fallback:", error.message);
    return fallback();
  }
}
