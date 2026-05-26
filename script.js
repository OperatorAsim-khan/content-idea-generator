const generateBtn = document.getElementById("generateBtn");
const captionMainBtn = document.getElementById("captionMainBtn");
const nicheInput = document.getElementById("nicheInput");
const output = document.getElementById("output");
const captionResult = document.getElementById("captionResult");
const platformBtns = document.querySelectorAll(".platform-btn");
const formatBtnsContainer = document.getElementById("formatBtns");
const toneBtns = document.querySelectorAll(".tone-btn");

let selectedPlatform = "YouTube";
let selectedFormat = "Tutorial";
let selectedTone = "Informative";

const formatOptions = {
  YouTube: ["Tutorial", "Vlog", "Short", "Review", "Challenge"],
  Instagram: ["Reel", "Carousel", "Story", "Post"],
  TikTok: ["Trend", "Skit", "Tutorial", "POV", "Storytime"]
};

const platformContext = {
  YouTube: "long-form videos, tutorials, vlogs, and educational content. Ideas should suit 8-20 minute videos.",
  Instagram: "Reels, carousels, and short visual posts. Ideas should be eye-catching and scroll-stopping.",
  TikTok: "short viral videos under 60 seconds. Ideas should be trendy, fast-paced, and hook viewers in the first 2 seconds."
};

// ── Tone Buttons ──────────────────────────────────────
toneBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    toneBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTone = btn.dataset.tone;
  });
});

// ── Format Buttons ────────────────────────────────────
function buildFormatBtns(platform) {
  formatBtnsContainer.innerHTML = "";
  const formats = formatOptions[platform];
  selectedFormat = formats[0];
  formats.forEach((format, index) => {
    const btn = document.createElement("button");
    btn.className = "format-btn" + (index === 0 ? " active" : "");
    btn.textContent = format;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".format-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedFormat = format;
    });
    formatBtnsContainer.appendChild(btn);
  });
}

platformBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    platformBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedPlatform = btn.dataset.platform;
    buildFormatBtns(selectedPlatform);
  });
});

buildFormatBtns(selectedPlatform);

// ── Caption Prompts per Platform ──────────────────────
function getCaptionPrompt(topic) {
  if (selectedPlatform === "YouTube") {
    return `Generate a ${selectedTone} YouTube caption package for this topic: "${topic}"
Respond in this exact JSON format and nothing else:
{
  "title": "An engaging YouTube video title (max 70 chars)",
  "description": "A compelling YouTube description (3-4 sentences with keywords naturally included)",
  "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10"
}`;
  } else if (selectedPlatform === "Instagram") {
    return `Generate a ${selectedTone} Instagram caption package for this topic: "${topic}"
Respond in this exact JSON format and nothing else:
{
  "caption": "An engaging Instagram caption with emojis and a call to action at the end (3-5 sentences)",
  "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5"
}`;
  } else {
    return `Generate a ${selectedTone} TikTok caption package for this topic: "${topic}"
Respond in this exact JSON format and nothing else:
{
  "hook": "A scroll-stopping opening line (max 1 sentence)",
  "caption": "Short punchy TikTok caption with emojis (2-3 sentences)",
  "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5 #fyp #foryou"
}`;
  }
}

// ── Render Caption Result ─────────────────────────────
function renderCaption(parsed, container) {
  container.innerHTML = "";

  if (selectedPlatform === "YouTube") {
    container.innerHTML = `
      ${captionBlock("🎬 Title", parsed.title)}
      ${captionBlock("📝 Description", parsed.description)}
      ${captionBlock("🏷️ Hashtags", parsed.hashtags)}
    `;
  } else if (selectedPlatform === "Instagram") {
    container.innerHTML = `
      ${captionBlock("📸 Caption", parsed.caption)}
      ${captionBlock("🏷️ Hashtags", parsed.hashtags)}
    `;
  } else {
    container.innerHTML = `
      ${captionBlock("⚡ Hook", parsed.hook)}
      ${captionBlock("🎵 Caption", parsed.caption)}
      ${captionBlock("🏷️ Hashtags", parsed.hashtags)}
    `;
  }

  // Copy buttons
  container.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const content = btn.closest(".caption-block").querySelector(".caption-block-content").textContent;
      navigator.clipboard.writeText(content).then(() => {
        btn.textContent = "✅ Copied";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 2000);
      });
    });
  });
}

function captionBlock(title, content) {
  return `
    <div class="caption-block">
      <div class="caption-block-title">${title}</div>
      <div class="caption-block-content">${content}</div>
      <button class="copy-btn">Copy</button>
    </div>
  `;
}

// ── Main Caption Button ───────────────────────────────
captionMainBtn.addEventListener("click", async () => {
  const topic = nicheInput.value.trim();
  if (!topic) {
    captionResult.classList.remove("hidden");
    captionResult.innerHTML = `<div class="error">⚠️ Please enter a topic or niche first!</div>`;
    return;
  }

  captionResult.classList.remove("hidden");
  captionResult.innerHTML = `
    <div class="loader">
      <div class="spinner"></div>
      Writing your ${selectedPlatform} caption...
    </div>
  `;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert social media copywriter. Always respond only in valid JSON format with no extra text." },
          { role: "user", content: getCaptionPrompt(topic) }
        ]
      })
    });

    if (!response.ok) throw new Error("API request failed.");
    const data = await response.json();
    const clean = data.choices[0].message.content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    renderCaption(parsed, captionResult);

  } catch (err) {
    captionResult.innerHTML = `<div class="error">⚠️ ${err.message || "Something went wrong."}</div>`;
  }
});

// ── Generate Ideas ────────────────────────────────────
generateBtn.addEventListener("click", generateIdeas);
nicheInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") generateIdeas();
});

async function generateIdeas() {
  const niche = nicheInput.value.trim();
  if (!niche) { showError("Please enter your niche first!"); return; }
  setLoading(true);

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a creative content strategist specializing in ${selectedPlatform}.
Generate exactly 10 unique, engaging, and specific content ideas.
The content type is: ${selectedFormat} on ${selectedPlatform}.
Platform context: ${platformContext[selectedPlatform]}
Format your response as a numbered list from 1 to 10.
Each idea should be one clear sentence.
No extra explanation, just the 10 ideas.`
          },
          {
            role: "user",
            content: `Generate 10 ${selectedFormat} ideas for ${selectedPlatform} in this niche: ${niche}`
          }
        ]
      })
    });

    if (!response.ok) throw new Error("API request failed. Check your API key.");
    const data = await response.json();
    displayIdeas(data.choices[0].message.content);
    setTimeout(() => {
      output.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

  } catch (err) {
    showError(err.message || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
}

// ── Display Ideas ─────────────────────────────────────
function displayIdeas(text) {
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.match(/^\d+[\.\)]/));

  output.classList.remove("hidden");
  output.innerHTML = `<p class="platform-label">✨ ${selectedPlatform} ${selectedFormat} ideas for <strong>${nicheInput.value.trim()}</strong></p>`;

  const saved = getSaved();
  const niche = nicheInput.value.trim();

  lines.forEach((line, index) => {
    const ideaText = line.replace(/^\d+[\.\)]\s*/, "");
    const isAlreadySaved = saved.find(i => i.text === ideaText);

    const card = document.createElement("div");
    card.className = "idea-card";
    card.style.animationDelay = `${index * 0.06}s`;
    card.innerHTML = `
      <div class="idea-top">
        <div class="idea-number">${index + 1}</div>
        <div class="idea-text">${ideaText}</div>
        <button class="save-btn ${isAlreadySaved ? "saved" : ""}" 
          data-text="${ideaText.replace(/"/g, '&quot;')}" 
          title="Save idea">
          ${isAlreadySaved ? "❤️" : "🤍"}
        </button>
      </div>
      <div class="explanation"></div>
    `;

    const saveBtn = card.querySelector(".save-btn");
    saveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (saveBtn.classList.contains("saved")) {
        unsaveIdea(ideaText);
        saveBtn.classList.remove("saved");
        saveBtn.textContent = "🤍";
      } else {
        saveIdea({ text: ideaText, platform: selectedPlatform, format: selectedFormat, niche });
        saveBtn.classList.add("saved");
        saveBtn.textContent = "❤️";
      }
    });

    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("save-btn") || 
          e.target.classList.contains("card-caption-btn") ||
          e.target.classList.contains("copy-btn")) return;
      toggleExplanation(card, ideaText);
    });

    output.appendChild(card);
  });
}

// ── Explanation ───────────────────────────────────────
async function toggleExplanation(card, ideaText) {
  const expDiv = card.querySelector(".explanation");

  if (card.classList.contains("expanded")) {
    card.classList.remove("expanded");
    return;
  }

  if (expDiv.dataset.loaded === "true") {
    card.classList.add("expanded");
    return;
  }

  card.classList.add("expanded");
  expDiv.innerHTML = `
    <div class="explanation-loading">
      <div class="spinner"></div>
      Analyzing this idea...
    </div>
  `;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an expert content strategist. When given a content idea, respond in this exact JSON format and nothing else:
{
  "why": "2-3 sentences explaining why this idea works psychologically and strategically",
  "steps": ["step 1", "step 2", "step 3", "step 4"],
  "hook": "An attention-grabbing opening line for this content"
}`
          },
          {
            role: "user",
            content: `Explain this ${selectedPlatform} ${selectedFormat} idea: "${ideaText}"`
          }
        ]
      })
    });

    if (!response.ok) throw new Error("Failed to load explanation.");
    const data = await response.json();
    const clean = data.choices[0].message.content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    expDiv.innerHTML = `
      <div class="exp-section">
        <div class="exp-title">💡 Why This Works</div>
        <div class="exp-content">${parsed.why}</div>
      </div>
      <div class="exp-section">
        <div class="exp-title">📋 How To Make It</div>
        <ul class="exp-steps">
          ${parsed.steps.map(s => `<li>${s}</li>`).join("")}
        </ul>
      </div>
      <div class="exp-section">
        <div class="exp-title">🎯 Hook</div>
        <div class="hook-box">${parsed.hook}</div>
      </div>
      <button class="card-caption-btn" id="captionBtn-${Date.now()}">✍️ Write Caption for this Idea</button>
      <div class="card-caption-result hidden"></div>
    `;

    // Caption button inside card
    const cardCaptionBtn = expDiv.querySelector(".card-caption-btn");
    const cardCaptionResult = expDiv.querySelector(".card-caption-result");

    cardCaptionBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await generateCardCaption(ideaText, cardCaptionBtn, cardCaptionResult);
    });

    expDiv.dataset.loaded = "true";

  } catch (err) {
    expDiv.innerHTML = `<div class="exp-content" style="color:#ff8080">⚠️ Could not load explanation. Try again.</div>`;
  }
}

// ── Caption from Idea Card ────────────────────────────
async function generateCardCaption(ideaText, btn, resultDiv) {
  if (resultDiv.dataset.loaded === "true") {
    resultDiv.classList.toggle("hidden");
    return;
  }

  resultDiv.classList.remove("hidden");
  resultDiv.innerHTML = `
    <div class="explanation-loading">
      <div class="spinner"></div>
      Writing caption...
    </div>
  `;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert social media copywriter. Always respond only in valid JSON format with no extra text." },
          { role: "user", content: getCaptionPrompt(ideaText) }
        ]
      })
    });

    if (!response.ok) throw new Error("API request failed.");
    const data = await response.json();
    const clean = data.choices[0].message.content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    renderCaption(parsed, resultDiv);
    resultDiv.dataset.loaded = "true";

  } catch (err) {
    resultDiv.innerHTML = `<div class="error">⚠️ ${err.message}</div>`;
  }
}

// ── Saved Ideas ───────────────────────────────────────
function getSaved() {
  return JSON.parse(localStorage.getItem("savedIdeas") || "[]");
}

function saveIdea(idea) {
  const saved = getSaved();
  if (!saved.find(i => i.text === idea.text)) {
    saved.unshift(idea);
    localStorage.setItem("savedIdeas", JSON.stringify(saved));
  }
  renderSaved();
}

function unsaveIdea(text) {
  const saved = getSaved().filter(i => i.text !== text);
  localStorage.setItem("savedIdeas", JSON.stringify(saved));
  renderSaved();
}

function renderSaved() {
  let section = document.getElementById("savedSection");
  if (!section) {
    section = document.createElement("div");
    section.id = "savedSection";
    section.className = "saved-section";
    document.querySelector(".container").appendChild(section);
  }

  const saved = getSaved();

  if (saved.length === 0) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");
  section.innerHTML = `
    <div class="saved-header">
      <div class="saved-title">🔖 Saved Ideas (${saved.length})</div>
      <button class="clear-btn" id="clearAllBtn">Clear All</button>
    </div>
    ${saved.map(idea => `
      <div class="saved-card">
        <div>
          <div class="saved-card-text">${idea.text}</div>
          <div class="saved-card-meta">${idea.platform} · ${idea.format} · ${idea.niche}</div>
        </div>
        <button class="unsave-btn" data-text="${idea.text.replace(/"/g, '&quot;')}" title="Remove">🗑️</button>
      </div>
    `).join("")}
  `;

  document.getElementById("clearAllBtn").addEventListener("click", () => {
    localStorage.removeItem("savedIdeas");
    renderSaved();
  });

  section.querySelectorAll(".unsave-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      unsaveIdea(btn.dataset.text);
      document.querySelectorAll(".save-btn").forEach(sb => {
        if (sb.dataset.text === btn.dataset.text) {
          sb.classList.remove("saved");
          sb.textContent = "🤍";
        }
      });
    });
  });
}

// ── Helpers ───────────────────────────────────────────
function setLoading(isLoading) {
  generateBtn.disabled = isLoading;
  if (isLoading) {
    output.classList.remove("hidden");
    output.innerHTML = `
      <div class="loader">
        <div class="spinner"></div>
        Generating ${selectedPlatform} ${selectedFormat} ideas...
      </div>
    `;
  }
}

function showError(message) {
  output.classList.remove("hidden");
  output.innerHTML = `<div class="error">⚠️ ${message}</div>`;
}
// ── Clear Input Button ────────────────────────────────
const clearInputBtn = document.getElementById("clearInputBtn");

nicheInput.addEventListener("input", () => {
  if (nicheInput.value.length > 0) {
    clearInputBtn.classList.remove("hidden");
  } else {
    clearInputBtn.classList.add("hidden");
  }
});

clearInputBtn.addEventListener("click", () => {
  nicheInput.value = "";
  clearInputBtn.classList.add("hidden");
  nicheInput.focus();

  // Reset everything
  output.classList.add("hidden");
  output.innerHTML = "";
  captionResult.classList.add("hidden");
  captionResult.innerHTML = "";
});
renderSaved();