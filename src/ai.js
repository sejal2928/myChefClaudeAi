
export async function getRecipeFromMistral(ingredientsArr) {
    const response = await fetch("http://localhost:3001/api/recipe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ingredients: ingredientsArr
        })
    })

    const data = await response.json()
    console.log("datta from server.js", data)
    if (!response.ok) {
        throw new Error(data.error || "Failed to generate recipe.")
    }

    return data
}
