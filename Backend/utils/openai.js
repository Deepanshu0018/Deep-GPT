import "dotenv/config";

const getOpenAI = async (messages) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:8080",
          "X-Title": "DeepGPT",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages,
        }),
      },
    );

    const data = await response.json();

    console.log("FULL API RESPONSE:", JSON.stringify(data, null, 2));

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response choices from AI");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter Error:", error.message);
    throw error;
  }
};

export default getOpenAI;
