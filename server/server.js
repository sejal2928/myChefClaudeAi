
import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/recipe", async (req, res) => {
    try {
        const { ingredients } = req.body;

        // 1. Check ingredients
        if (!Array.isArray(ingredients) || ingredients.length < 3) {
            return res.status(400).json({
                error: "Please add at least 3 ingredients."
            });
        }

        // 2. Check API key
        if (!process.env.GOOGLE_API_KEY) {
            return res.status(500).json({
                error: "Google API key is missing from .env"
            });
        }

        // 3. Create prompt 
        const prompt = `
Suggest a practical recipe using these ingredients:
${ingredients.join(", ")}
You may add a few extra ingredients if needed.
Return the recipe in Markdown with a title, ingredients,
quantities, and numbered cooking steps.
`;

// 4. Call Gemini API
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": process.env.GOOGLE_API_KEY
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );

        // 5. Read response
        const data = await response.json();

        // 6. Handle Gemini errors
        if (!response.ok) {
            console.error("Gemini API error:", data);

            return res.status(response.status).json({
                error: data.error?.message ||
                    `Gemini request failed: ${response.status}`
            });
        }

        // 7. Extract recipe text
        const recipe = data.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("\n")
            .trim();

        if (!recipe) {
            console.error("No recipe in Gemini response:", data);

            return res.status(502).json({
                error: "Gemini did not return a recipe."
            });
        }

        // 8. Send recipe to React frontend
        return res.json({ recipe });

    } catch (error) {
        console.error("Backend error:", error.message);

        return res.status(500).json({
            error: "Recipe generation failed. Check the backend terminal."
        });
    }
});

app.listen(3001, () => {
    console.log("Recipe backend running at http://localhost:3001");
});
