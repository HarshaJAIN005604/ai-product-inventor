const mockDatasets = {
  "vitamin-c": {
    title: "Vitamin C",
    total_reviews: 18420,
    trend_growth_percent: 34,
    competition_proxy: 0.61,
    complaints: {
      Reaction: { complaint_frequency: 78, severity_score: 84, unmet_score: 76 },
      Ineffectiveness: { complaint_frequency: 69, severity_score: 72, unmet_score: 79 },
      Texture: { complaint_frequency: 62, severity_score: 58, unmet_score: 66 },
      Pricing: { complaint_frequency: 54, severity_score: 48, unmet_score: 63 },
      Packaging: { complaint_frequency: 39, severity_score: 44, unmet_score: 57 }
    }
  },
  "hair-serum": {
    title: "Hair Serum",
    total_reviews: 23150,
    trend_growth_percent: 41,
    competition_proxy: 0.56,
    complaints: {
      Reaction: { complaint_frequency: 58, severity_score: 77, unmet_score: 70 },
      Ineffectiveness: { complaint_frequency: 82, severity_score: 80, unmet_score: 85 },
      Texture: { complaint_frequency: 64, severity_score: 61, unmet_score: 69 },
      Pricing: { complaint_frequency: 47, severity_score: 50, unmet_score: 60 },
      Packaging: { complaint_frequency: 42, severity_score: 46, unmet_score: 54 }
    }
  }
};

const bucketKeywords = {
  Reaction: ["burn", "sting", "rash", "redness", "itch", "allergy", "irritation", "breakout"],
  Ineffectiveness: ["no result", "didn't work", "ineffective", "useless", "no change", "waste"],
  Texture: ["sticky", "greasy", "thick", "oily", "watery", "residue", "smell"],
  Pricing: ["expensive", "overpriced", "price", "cost", "cheap", "value"],
  Packaging: ["leak", "broken", "pump", "bottle", "cap", "packaging", "damaged"]
};

function calculateOpportunityScore(cf, sev, um, trendGrowthPercent, competitionProxy) {
  const trendGrowthNormalized = trendGrowthPercent / 100;
  const rawScore = (cf * 0.35) + (sev * 0.25) + (um * 0.2) + (trendGrowthNormalized * 100 * 0.2);
  return Number((rawScore * (1 - competitionProxy)).toFixed(2));
}

function rankComplaints(dataset) {
  return Object.entries(dataset.complaints)
    .map(([bucket, metrics]) => {
      const score = calculateOpportunityScore(
        metrics.complaint_frequency,
        metrics.severity_score,
        metrics.unmet_score,
        dataset.trend_growth_percent,
        dataset.competition_proxy
      );
      return { bucket, score, ...metrics };
    })
    .sort((a, b) => b.score - a.score);
}

function generateConcepts(title, ranked, count = 6) {
  const personas = [
    "Results-driven urban professionals",
    "Sensitive-skin skincare minimalists",
    "Ingredient-aware beauty enthusiasts",
    "Value-seeking Gen Z shoppers",
    "Time-starved premium routine users",
    "Postpartum and stress-hairfall consumers",
    "Salon-familiar experimental buyers",
    "Early adopters in tier-1 D2C markets"
  ];

  const conceptPool = ranked.slice(0, Math.min(4, ranked.length));
  return Array.from({ length: count }).map((_, idx) => {
    const focus = conceptPool[idx % conceptPool.length];
    const priceLow = 699 + idx * 100;
    const priceHigh = priceLow + 300;

    return {
      name: `${title} ${focus.bucket} Reset ${idx + 1}`,
      persona: personas[idx % personas.length],
      problem: `${focus.bucket} concerns are blocking repeat purchase and reducing trust in efficacy claims.`,
      ingredientLogic: focus.bucket === "Reaction"
        ? "Use barrier-first actives (panthenol + ectoin + madecassoside) to lower irritation risk while preserving visible performance."
        : focus.bucket === "Ineffectiveness"
          ? "Increase bioavailable active concentration with encapsulation and add a clinically validated booster to speed perceived results."
          : focus.bucket === "Texture"
            ? "Adopt light ester systems, fast-break emulsifiers, and dry-touch polymers to improve sensorial acceptance."
            : focus.bucket === "Pricing"
              ? "Create a high-value formula stack using proven hero ingredients at optimized percentages for cost-effective outcomes."
              : "Move to oxygen-safe, dosage-controlled packaging with low contamination risk and premium usability.",
      format: focus.bucket === "Texture" ? "Feather-light gel serum in airless pump" : "Stabilized serum with controlled dispensing",
      priceBand: `₹${priceLow}–₹${priceHigh}`,
      competitiveGap: `Most incumbents over-index on claims but under-address ${focus.bucket.toLowerCase()} friction in reviews at scale.`,
      dataPoints: `CF ${focus.complaint_frequency}, SEV ${focus.severity_score}, UM ${focus.unmet_score}, Growth ${focus.score}`,
      score: focus.score
    };
  });
}

function renderDashboard(containerId, dataset) {
  const container = document.getElementById(containerId);
  const ranked = rankComplaints(dataset);
  const top = ranked[0];
  const concepts = generateConcepts(dataset.title, ranked, 6);

  container.innerHTML = `
    <section class="card">
      <h2 class="section-title">SECTION 1 — Overview Cards</h2>
      <div class="grid-cards">
        <div class="card"><div class="metric-label">Total Reviews</div><div class="metric-value">${dataset.total_reviews.toLocaleString()}</div></div>
        <div class="card"><div class="metric-label">Trend Growth %</div><div class="metric-value">${dataset.trend_growth_percent}%</div></div>
        <div class="card"><div class="metric-label">Top Complaint Bucket</div><div class="metric-value">${top.bucket}</div></div>
        <div class="card"><div class="metric-label">Highest Opportunity Score</div><div class="metric-value">${top.score}</div></div>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">SECTION 2 — Complaint Strength Bar Chart</h2>
      ${ranked.map((row) => {
        const maxScore = ranked[0].score || 1;
        return `
          <div class="bar-row">
            <div class="bar-label-wrap"><span>${row.bucket}</span><span>${row.score}</span></div>
            <div class="bar"><div class="bar-fill" style="width:${(row.score / maxScore) * 100}%"></div></div>
          </div>
        `;
      }).join("")}
    </section>

    <section class="card">
      <h2 class="section-title">SECTION 3 — Opportunity Ranking Table</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Rank</th><th>Bucket</th><th>Opportunity Score</th><th>CF</th><th>SEV</th><th>UM</th></tr>
          </thead>
          <tbody>
            ${ranked.map((row, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${row.bucket}</td>
                <td>${row.score}</td>
                <td>${row.complaint_frequency}</td>
                <td>${row.severity_score}</td>
                <td>${row.unmet_score}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">SECTION 4 — Product Concept Generator</h2>
      <div class="concept-grid">
        ${concepts.map((concept) => `
          <article class="card concept-card">
            <h4>${concept.name}</h4>
            <ul>
              <li><strong>Core Consumer Persona:</strong> ${concept.persona}</li>
              <li><strong>Primary Problem:</strong> ${concept.problem}</li>
              <li><strong>Ingredient/Formulation Logic:</strong> ${concept.ingredientLogic}</li>
              <li><strong>Format Justification:</strong> ${concept.format}</li>
              <li><strong>Suggested Price Band (₹):</strong> ${concept.priceBand}</li>
              <li><strong>Competitive Gap:</strong> ${concept.competitiveGap}</li>
              <li><strong>Supporting Data Points:</strong> ${concept.dataPoints}</li>
              <li><strong>Final Opportunity Score:</strong> ${concept.score}</li>
            </ul>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function parseCsv(text) {
  const rows = text.split(/\r?\n/).filter(Boolean);
  if (!rows.length) return [];
  const headers = rows[0].split(",").map((h) => h.trim());
  const reviewIdx = headers.indexOf("review_text");
  if (reviewIdx === -1) {
    throw new Error("CSV must include a review_text column.");
  }

  return rows.slice(1).map((row) => {
    const values = row.split(",");
    return (values[reviewIdx] || "").replace(/^"|"$/g, "").toLowerCase();
  });
}

function analyzeUploadedReviews(reviews) {
  const counts = Object.fromEntries(Object.keys(bucketKeywords).map((bucket) => [bucket, 0]));
  const wordFrequency = {};

  reviews.forEach((review) => {
    const words = review.split(/\W+/).filter((w) => w.length > 2);
    words.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    Object.entries(bucketKeywords).forEach(([bucket, keywords]) => {
      if (keywords.some((kw) => review.includes(kw))) counts[bucket] += 1;
    });
  });

  const total = reviews.length || 1;
  const dataset = {
    title: "Uploaded Dataset",
    total_reviews: reviews.length,
    trend_growth_percent: 26,
    competition_proxy: 0.52,
    complaints: Object.fromEntries(
      Object.entries(counts).map(([bucket, freq]) => {
        const complaint_frequency = Math.min(100, Number(((freq / total) * 100).toFixed(1)));
        const severity_score = Math.min(100, 35 + complaint_frequency * 0.7);
        const unmet_score = Math.min(100, 40 + complaint_frequency * 0.65);
        return [bucket, {
          complaint_frequency,
          severity_score: Number(severity_score.toFixed(1)),
          unmet_score: Number(unmet_score.toFixed(1))
        }];
      })
    )
  };

  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => `${word} (${count})`);

  return { dataset, topWords };
}

function renderUploadResults(dataset, topWords) {
  const container = document.getElementById("upload-results");
  const ranked = rankComplaints(dataset);
  const concepts = generateConcepts("Custom Insight", ranked, 4);

  container.innerHTML = `
    <section class="card">
      <h2 class="section-title">Detected Frequent Complaint Words</h2>
      <p>${topWords.join(", ") || "No meaningful tokens found."}</p>
      <small>Mapped buckets: Reaction, Ineffectiveness, Texture, Pricing, Packaging</small>
    </section>
  `;

  const dynamicSection = document.createElement("section");
  dynamicSection.id = "upload-rendered-dashboard";
  container.appendChild(dynamicSection);

  renderDashboard("upload-rendered-dashboard", {
    ...dataset,
    title: "Upload & Analyze"
  });

  const conceptsContainer = container.querySelector(".concept-grid");
  if (conceptsContainer) {
    conceptsContainer.innerHTML = concepts.map((concept) => `
      <article class="card concept-card">
        <h4>${concept.name}</h4>
        <ul>
          <li><strong>Core Consumer Persona:</strong> ${concept.persona}</li>
          <li><strong>Primary Problem:</strong> ${concept.problem}</li>
          <li><strong>Ingredient/Formulation Logic:</strong> ${concept.ingredientLogic}</li>
          <li><strong>Format Justification:</strong> ${concept.format}</li>
          <li><strong>Suggested Price Band (₹):</strong> ${concept.priceBand}</li>
          <li><strong>Competitive Gap:</strong> ${concept.competitiveGap}</li>
          <li><strong>Supporting Data Points:</strong> ${concept.dataPoints}</li>
          <li><strong>Final Opportunity Score:</strong> ${concept.score}</li>
        </ul>
      </article>
    `).join("");
  }
}

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");

      document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));
      document.getElementById(button.dataset.tab).classList.add("active");
    });
  });
}

function setupUploadFlow() {
  const button = document.getElementById("analyze-btn");
  const input = document.getElementById("csv-input");

  button.addEventListener("click", async () => {
    if (!input.files?.length) {
      alert("Please choose a CSV file first.");
      return;
    }

    const fileText = await input.files[0].text();
    try {
      const reviews = parseCsv(fileText);
      const { dataset, topWords } = analyzeUploadedReviews(reviews);
      renderUploadResults(dataset, topWords);
    } catch (error) {
      alert(error.message);
    }
  });
}

renderDashboard("vitamin-c", mockDatasets["vitamin-c"]);
renderDashboard("hair-serum", mockDatasets["hair-serum"]);
setupTabs();
setupUploadFlow();
