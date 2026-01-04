// const express = require("express");
// const cors = require("cors");
// const fetch = require("node-fetch");   // ✅ IMPORTANT
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const GROQ_API_KEY = process.env.GROQ_API_KEY;

// app.post("/analyze", async (req, res) => {
//   try {
//     const { text } = req.body;

//     if (!text) {
//       return res.status(400).json({ error: "No text provided" });
//     }

//     const prompt = `
// You are a strict food nutrition expert.

// Rules:
// - Processed foods (pizza, pancakes, burgers, chips, soda) → Harmful
// - High sugar foods → Moderate
// - Natural whole foods → Safe

// Respond ONLY with valid JSON:
// {
//   "intent": "",
//   "findings": [
//     { "name": "", "level": "Safe|Moderate|Harmful", "description": "" }
//   ],
//   "detailedAnalysis": "",
//   "uncertainty": "",
//   "recommendations": ""
// }

// Ingredients:
// ${text}
// `;

//     const response = await fetch(
//       "https://api.groq.com/openai/v1/chat/completions",
//       {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${GROQ_API_KEY}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           model: "llama-3.3-70b-versatile",
//           temperature: 0.2,
//           messages: [
//             { role: "system", content: "You analyze food health impact strictly." },
//             { role: "user", content: prompt }
//           ]
//         })
//       }
//     );

//     const data = await response.json();

//     if (!data.choices || !data.choices[0]) {
//       throw new Error("Invalid response from Groq");
//     }

//     const clean = data.choices[0].message.content.trim();
//     res.json(JSON.parse(clean));

//   } catch (error) {
//     console.error("Backend error:", error.message);
//     res.status(500).json({ error: "AI analysis failed" });
//   }
// });

// app.listen(3000, () => {
//   console.log("✅ Backend running at http://localhost:3000");
// });


import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

// 🔧 __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/************************************
 * MIDDLEWARE
 ************************************/
app.use(cors());
app.use(express.json());

/************************************
 * SERVE FRONTEND (docs folder)
 ************************************/
const frontendPath = path.join(__dirname, "../docs");
console.log("📁 Serving frontend from:", frontendPath);

app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/************************************
 * ANALYZE API (AI + RISK LEVEL)
 ************************************/
app.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        error: "No ingredient text provided",
      });
    }

    const prompt = `
You are an AI-native consumer health co-pilot.

Your role:
- Explain ingredient health impact clearly
- Avoid medical advice or numeric limits
- Use human-friendly guidance

For EACH ingredient:
1. Explain why it matters
2. Assign a risk level:
   - Safe (generally fine for regular intake)
   - Moderate (okay occasionally)
   - Harmful (best kept infrequent)
3. Explain how much or how often is okay (relative terms)
4. Explain tradeoffs honestly
5. Communicate uncertainty

Respond ONLY with valid JSON:

{
  "inferredIntent": "",
  "keyInsights": [
    {
      "ingredient": "",
      "whyItMatters": "",
      "riskLevel": "Safe | Moderate | Harmful",
      "howMuchIsOkay": "",
      "tradeoff": ""
    }
  ],
  "overallReasoning": "",
  "uncertainty": "",
  "practicalGuidance": ""
}

Ingredients: ${text}
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content:
                "You explain food ingredient impact with balance, clarity, and uncertainty.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Groq API error:", errText);
      return res.status(500).json({
        error: "Groq API request failed",
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("🧠 RAW AI RESPONSE:\n", content);

    if (!content) {
      return res.status(500).json({
        error: "Empty AI response",
      });
    }

    const match = content.match(/\{[\s\S]*\}/);

    if (!match) {
      return res.status(500).json({
        error: "AI response not valid JSON",
        raw: content,
      });
    }

    const parsed = JSON.parse(match[0]);
    res.json(parsed);
  } catch (error) {
    console.error("❌ Backend crash:", error.message);
    res.status(500).json({
      error: "AI analysis failed",
    });
  }
});

/************************************
 * START SERVER
 ************************************/
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
