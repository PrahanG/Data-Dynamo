
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

async function listModels() {
    console.log("Listing Models...");
    try {
        const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        // Actually the SDK doesn't expose listModels directly on the main class easily in all versions?
        // Wait, it does usually require fetch direct call or using the model manager if available.
        // Let's use direct REST call for listing to be sure, using the key.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBy8xWCiw4jxuj7YF3Rt7HMpQiuds7jaQw`);

        if (!response.ok) {
            const text = await response.text();
            fs.writeFileSync('error.log', `ListModels Error: ${response.status} - ${text}`);
            console.log("❌ ListModels Failed. See error.log");
            return;
        }

        const data = await response.json();
        console.log("Available Models:", JSON.stringify(data, null, 2));
        fs.writeFileSync('error.log', JSON.stringify(data, null, 2)); // Save success output to log for reading
    } catch (err) {
        console.error("Test Failed:", err);
        fs.writeFileSync('error.log', `Exception: ${err.message}`);
    }
}

listModels();
