export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, model } = req.body;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: messages.map(m => m.content).join("\n"),
        }),
      }
    );

    const data = await response.json();

    res.status(200).json({
      id: "chatcmpl-" + Date.now(),
      object: "chat.completion",
      created: Date.now(),
      model,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: data[0]?.generated_text || "" },
          finish_reason: "stop",
        },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
