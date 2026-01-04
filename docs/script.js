
// /************************************
//  * OCR FUNCTION (IMAGE → TEXT)
//  ************************************/

// async function extractTextFromImage(file) {
//   const result = await Tesseract.recognize(
//     file,
//     "eng",
//     {
//       logger: info => console.log(info) // progress logs
//     }
//   );

//   return result.data.text;
// }

// /************************************
//  * 0️⃣ TAB SWITCHING
//  ************************************/

// const tabButtons = document.querySelectorAll(".tab-button");
// const imagePanel = document.getElementById("image-panel");
// const textPanel = document.getElementById("text-panel");

// const imageUploadInput = document.getElementById("image-upload");
// const cameraInput = document.getElementById("camera-capture");
// const imagePreview = document.getElementById("image-preview");

// imagePanel.style.display = "block";
// textPanel.style.display = "none";

// tabButtons.forEach(button => {
//   button.addEventListener("click", () => {
//     tabButtons.forEach(btn => btn.classList.remove("active"));
//     button.classList.add("active");

//     if (button.dataset.tab === "image") {
//       imagePanel.style.display = "block";
//       textPanel.style.display = "none";
//     } else {
//       imagePanel.style.display = "none";
//       textPanel.style.display = "block";
//     }
//   });
// });


// /************************************
//  * 1️⃣ IMAGE PREVIEW
//  ************************************/

// function showImagePreview(file) {
//   if (!file) return;
//   const reader = new FileReader();
//   reader.onload = () => {
//     imagePreview.innerHTML = `<img src="${reader.result}" alt="Preview" />`;
//   };
//   reader.readAsDataURL(file);
// }

// imageUploadInput.addEventListener("change", e => showImagePreview(e.target.files[0]));
// cameraInput.addEventListener("change", e => showImagePreview(e.target.files[0]));


// /************************************
//  * 2️⃣ ELEMENT REFERENCES
//  ************************************/

// const ingredientText = document.getElementById("ingredient-text");
// const analyzeBtn = document.getElementById("analyze-btn");

// const loadingState = document.getElementById("loading-state");
// const resultsSection = document.getElementById("results-section");

// const intentContent = document.getElementById("intent-content");
// const findingsGrid = document.getElementById("findings-grid");
// const analysisContent = document.getElementById("analysis-content");
// const uncertaintyContent = document.getElementById("uncertainty-content");
// const recommendationsContent = document.getElementById("recommendations-content");

// const newAnalysisBtn = document.getElementById("new-analysis-btn");
// const saveBtn = document.getElementById("save-btn");

// let lastResult = null;


// /************************************
//  * 3️⃣ ANALYZE BUTTON
//  ************************************/

// analyzeBtn.addEventListener("click", async () => {

//   let text = "";
//   const isTextMode = textPanel.style.display === "block";

//   if (isTextMode) {
//     text = ingredientText.value.trim();
//     if (!text) {
//       alert("Please paste ingredient text first!");
//       return;
//     }
//   } else {
//     const file = imageUploadInput.files[0] || cameraInput.files[0];
//     if (!file) {
//       alert("Please upload or capture an image first!");
//       return;
//     }
//     text = await extractTextFromImage(file);
//   }

//   loadingState.style.display = "block";
//   resultsSection.style.display = "none";

//   try {
//     const response = await fetch("http://localhost:3000/analyze", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ text })
//     });

//     if (!response.ok) {
//       throw new Error("Backend error");
//     }

//     const result = await response.json();
//     lastResult = result;
//     renderResults(result);

//   } catch (error) {
//     console.error(error);
//     alert("AI failed. Check backend.");
//   }
// });



// /************************************
//  * 4️⃣ ANALYSIS LOGIC (SMART RULE BASED)
//  ************************************/

// function analyzeIngredients(text) {

//   const ingredients = text.split(",").map(i => i.trim()).filter(Boolean);

//   let findings = [];
//   let harmfulCount = 0;
//   let moderateCount = 0;

//   ingredients.forEach(item => {
//     let level = "Safe";
//     let description = "This ingredient is generally considered safe.";

//     const lower = item.toLowerCase();

//     if (lower.includes("sugar")) {
//       level = "Moderate";
//       description = "High sugar intake may increase the risk of diabetes and weight gain.";
//       moderateCount++;
//     }

//     if (lower.includes("oil") || lower.includes("palm")) {
//       level = "Harmful";
//       description = "May contain unhealthy fats that affect heart health.";
//       harmfulCount++;
//     }

//     findings.push({ name: item, level, description });
//   });

//   // Dynamic Detailed Analysis
//   let detailedAnalysis = `This product contains ${ingredients.length} ingredients. `;

//   if (harmfulCount > 0) {
//     detailedAnalysis += `Some ingredients may pose health risks if consumed frequently. `;
//   } else if (moderateCount > 0) {
//     detailedAnalysis += `Most ingredients are safe, but moderation is advised. `;
//   } else {
//     detailedAnalysis += `All listed ingredients are considered safe for general consumption. `;
//   }

//   detailedAnalysis += `Understanding ingredient composition helps in making healthier food choices.`;

//   return {
//     intent: "You are evaluating whether this product is safe for regular consumption.",
//     findings,
//     detailedAnalysis,
//     uncertainty: "Exact ingredient quantities and processing levels are not available from the label.",
//     recommendations:
//       harmfulCount > 0
//         ? "Limit frequent consumption and look for healthier alternatives."
//         : "This product can be consumed safely as part of a balanced diet."
//   };
// }


// /************************************
//  * 5️⃣ RENDER RESULTS
//  ************************************/

// function renderResults(data) {

//   loadingState.style.display = "none";
//   resultsSection.style.display = "block";

//   intentContent.innerText = data.intent;
//   analysisContent.innerText = data.detailedAnalysis;
//   uncertaintyContent.innerText = data.uncertainty;
//   recommendationsContent.innerText = data.recommendations;

//   findingsGrid.innerHTML = "";
//   data.findings.forEach(item => {
//     const card = document.createElement("div");
//     card.className = "finding-card";
//     card.innerHTML = `
//       <h5>${item.name}</h5>
//       <p><strong>Risk:</strong> ${item.level}</p>
//       <p>${item.description}</p>
//     `;
//     findingsGrid.appendChild(card);
//   });
// }


// /************************************
//  * 6️⃣ ANALYZE ANOTHER PRODUCT
//  ************************************/

// newAnalysisBtn.addEventListener("click", () => {
//   ingredientText.value = "";
//   imageUploadInput.value = "";
//   cameraInput.value = "";
//   imagePreview.innerHTML = "";

//   resultsSection.style.display = "none";
//   loadingState.style.display = "none";

//   tabButtons.forEach(btn => btn.classList.remove("active"));
//   tabButtons[0].classList.add("active");

//   imagePanel.style.display = "block";
//   textPanel.style.display = "none";

//   document.getElementById("analyzer").scrollIntoView({ behavior: "smooth" });
// });


// /************************************
//  * 7️⃣ SAVE RESULTS
//  ************************************/

// saveBtn.addEventListener("click", () => {
//   if (!lastResult) {
//     alert("No results to save!");
//     return;
//   }
//   localStorage.setItem("intellifood_result", JSON.stringify(lastResult));
//   alert("Results saved successfully!");
// });

/************************************
 * OCR FUNCTION (IMAGE → TEXT)
 ************************************/
async function extractTextFromImage(file) {
  const result = await Tesseract.recognize(file, "eng", {
    logger: info => console.log(info)
  });
  return result.data.text;
}

/************************************
 * BACKEND URL (RENDER)
 ************************************/
const BACKEND_URL = "https://intellifood.onrender.com";

/************************************
 * TAB SWITCHING
 ************************************/
const tabButtons = document.querySelectorAll(".tab-button");
const imagePanel = document.getElementById("image-panel");
const textPanel = document.getElementById("text-panel");

const imageUploadInput = document.getElementById("image-upload");
const cameraInput = document.getElementById("camera-capture");
const imagePreview = document.getElementById("image-preview");

imagePanel.style.display = "block";
textPanel.style.display = "none";

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    tabButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    if (button.dataset.tab === "image") {
      imagePanel.style.display = "block";
      textPanel.style.display = "none";
    } else {
      imagePanel.style.display = "none";
      textPanel.style.display = "block";
    }
  });
});

/************************************
 * IMAGE PREVIEW
 ************************************/
function showImagePreview(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.innerHTML = `<img src="${reader.result}" alt="Preview" />`;
  };
  reader.readAsDataURL(file);
}

imageUploadInput.addEventListener("change", e =>
  showImagePreview(e.target.files[0])
);
cameraInput.addEventListener("change", e =>
  showImagePreview(e.target.files[0])
);

/************************************
 * ELEMENT REFERENCES
 ************************************/
const ingredientText = document.getElementById("ingredient-text");
const analyzeBtn = document.getElementById("analyze-btn");

const loadingState = document.getElementById("loading-state");
const resultsSection = document.getElementById("results-section");

const intentContent = document.getElementById("intent-content");
const findingsGrid = document.getElementById("findings-grid");
const analysisContent = document.getElementById("analysis-content");
const uncertaintyContent = document.getElementById("uncertainty-content");
const recommendationsContent = document.getElementById("recommendations-content");

const newAnalysisBtn = document.getElementById("new-analysis-btn");
const saveBtn = document.getElementById("save-btn");

let lastResult = null;

/************************************
 * ANALYZE BUTTON
 ************************************/
analyzeBtn.addEventListener("click", async () => {
  let text = "";
  const isTextMode = textPanel.style.display === "block";

  if (isTextMode) {
    text = ingredientText.value.trim();
    if (!text) {
      alert("Please paste ingredient text first!");
      return;
    }
  } else {
    const file = imageUploadInput.files[0] || cameraInput.files[0];
    if (!file) {
      alert("Please upload or capture an image first!");
      return;
    }
    text = await extractTextFromImage(file);
  }

  loadingState.style.display = "block";
  resultsSection.style.display = "none";

  try {
    const response = await fetch(`${BACKEND_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend error:", data);
      alert("AI analysis failed. Please try again.");
      return;
    }

    lastResult = data;
    renderResults(data);

  } catch (error) {
    console.error(error);
    alert("Server connection failed.");
  }
});

/************************************
 * RENDER RESULTS
 ************************************/
function renderResults(data) {
  loadingState.style.display = "none";
  resultsSection.style.display = "block";

  intentContent.innerText = data.inferredIntent;
  findingsGrid.innerHTML = "";

  data.keyInsights.forEach(item => {
    const card = document.createElement("div");
    card.className = "finding-card";

    card.innerHTML = `
      <h5>${item.ingredient}</h5>
      <p><strong>Why it matters:</strong> ${item.whyItMatters}</p>
      <p><strong>Risk level:</strong>
        <span class="level ${item.riskLevel.toLowerCase()}">
          ${item.riskLevel}
        </span>
      </p>
      <p><strong>How much is okay:</strong> ${item.howMuchIsOkay}</p>
      <p><strong>Tradeoff:</strong> ${item.tradeoff}</p>
    `;

    findingsGrid.appendChild(card);
  });

  analysisContent.innerText = data.overallReasoning;
  uncertaintyContent.innerText = data.uncertainty;
  recommendationsContent.innerText = data.practicalGuidance;
}

/************************************
 * ANALYZE ANOTHER PRODUCT
 ************************************/
newAnalysisBtn.addEventListener("click", () => {
  ingredientText.value = "";
  imageUploadInput.value = "";
  cameraInput.value = "";
  imagePreview.innerHTML = "";

  resultsSection.style.display = "none";
  loadingState.style.display = "none";

  tabButtons.forEach(btn => btn.classList.remove("active"));
  tabButtons[0].classList.add("active");

  imagePanel.style.display = "block";
  textPanel.style.display = "none";
});

/************************************
 * SAVE RESULTS
 ************************************/
saveBtn.addEventListener("click", () => {
  if (!lastResult) {
    alert("No results to save!");
    return;
  }
  localStorage.setItem("intellifood_result", JSON.stringify(lastResult));
  alert("Results saved successfully!");
});
