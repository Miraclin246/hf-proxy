import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/v1/chat/completions", async (req, res) => {
  try {
    const { messages, model } = req.body;

    // Forward request to Hugging Face
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

    // Wrap Hugging Face response in OpenAI-style format
    res.json({
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
});

export default app;
