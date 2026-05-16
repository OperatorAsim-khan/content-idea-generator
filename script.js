const GROQ_API_KEY = "Paste your API Key here"; // 🔑 Your Groq API key

const generateBtn = document.getElementById("generateBtn");
const nicheInput = document.getElementById("nicheInput");
const output = document.getElementById("output");
const platformBtns = document.querySelectorAll(".platform-btn");

let selectedPlatform = "YouTube"; // default

// Platform button selection
platformBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    platformBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedPlatform = btn.dataset.platform;
  });
});

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

  const platformContext = {
    YouTube: "long-form videos, tutorials, vlogs, and educational content. Ideas should suit 8-20 minute videos.",
    Instagram: "Reels, carousels, and short visual posts. Ideas should be eye-catching and scroll-stopping.",
    TikTok: "short viral videos under 60 seconds. Ideas should be trendy, fast-paced, and hook viewers in the first 2 seconds."
  };

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
            content: `You are a creative content strategist specializing in ${selectedPlatform}. 
            Generate exactly 10 unique, engaging, and specific content ideas for ${selectedPlatform}, which focuses on ${platformContext[selectedPlatform]}
            Format your response as a numbered list from 1 to 10.
            Each idea should be one clear sentence.
            No extra explanation, just the 10 ideas.`
          },
          {
            role: "user",
            content: `Generate 10 ${selectedPlatform} content ideas for this niche: ${niche}`
          }
        ],
        temperature: 0.85,
        max_tokens: 700
      })
    });

    if (!response.ok) throw new Error("API request failed. Check your API key.");

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
  output.innerHTML = `<p class="platform-label">✨ ${selectedPlatform} ideas for <strong>${nicheInput.value.trim()}</strong></p>`;

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
        Generating ${selectedPlatform} ideas...
      </div>
    `;
  }
}

function showError(message) {
  output.classList.remove("hidden");
  output.innerHTML = `<div class="error">⚠️ ${message}</div>`;
}