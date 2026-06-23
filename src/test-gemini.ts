import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();


const GEMINI_API_KEY = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY_2 || ""

console.log("Script started");
console.log("API key loaded:", GEMINI_API_KEY);

async function testGemini() {
    try {
        console.log("Creating Gemini client...");

        const genAI = new GoogleGenerativeAI(
            GEMINI_API_KEY
        );

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        console.log("Sending request...");

        const result = await model.generateContent(
            "Say hello in one sentence."
        );

        console.log("Response received:");
        console.log(result.response.text());

    } catch (error) {
        console.error("Gemini Error:");
        console.error(error);
    }
}

testGemini();