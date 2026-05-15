const GROQ_API_KEY = "your_api_key_here"; // 🔑 Replace with your actual Groq API key

const generateBtn = document.getElementById("generateBtn");
const nicheInput = document.getElementById("nicheInput");
const output = document.getElementById("output");

generateBtn.addEventListener("click", generateIdeas);

nicheInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateIdeas();
});

async function generateIdeas() {
  const niche = nicheInput.value.trim();

  if (!niche) {
    showError("Please enter your niche first!");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a creative content strategist for social media creators. 
            When given a niche, generate exactly 10 unique, engaging, and specific content ideas.
            Format your response as a numbered list from 1 to 10.
            Each idea should be one clear sentence.
            No extra explanation, just the 10 ideas.`
          },
          {
            role: "user",
            content: `Generate 10 content ideas for this niche: ${niche}`
          }
        ],
        temperature: 0.85,
        max_tokens: 700
      })
    });

    if (!response.ok) {
      throw new Error("API request failed. Check your API key.");
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    displayIdeas(text);

  } catch (err) {
    showError(err.message || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
}

function displayIdeas(text) {
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.match(/^\d+[\.\)]/));

  output.classList.remove("hidden");
  output.innerHTML = "";

  lines.forEach((line, index) => {
    const ideaText = line.replace(/^\d+[\.\)]\s*/, "");

    const card = document.createElement("div");
    card.className = "idea-card";
    card.style.animationDelay = `${index * 0.06}s`;

    card.innerHTML = `
      <div class="idea-number">${index + 1}</div>
      <div class="idea-text">${ideaText}</div>
    `;

    output.appendChild(card);
  });
}

function setLoading(isLoading) {
  generateBtn.disabled = isLoading;

  if (isLoading) {
    output.classList.remove("hidden");
    output.innerHTML = `
      <div class="loader">
        <div class="spinner"></div>
        Generating your ideas...
      </div>
    `;
  }
}

function showError(message) {
  output.classList.remove("hidden");
  output.innerHTML = `<div class="error">⚠️ ${message}</div>`;
}