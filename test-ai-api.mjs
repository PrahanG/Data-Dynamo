async function testAI() {
    console.log("Testing AI API...");
    try {
        const response = await fetch('http://localhost:3002/api/ai-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                boxes: [
                    { weight: 600, isFragile: false },
                    { weight: 50, isFragile: true }
                ],
                truckDimensions: { width: 8, height: 9, length: 28 },
                scores: { stability: 85, safety: 90, optimization: 75 },
                loadingSequence: []
            })
        });

        if (!response.ok) {
            const text = await response.text();
            const fs = await import('fs');
            fs.writeFileSync('error.log', text);
            console.log("❌ API Error. Details written to error.log");
            return;
        }
        const data = await response.json();
        console.log("AI Response:", data);
    } catch (err) {
        console.error("Test Failed:", err);
    }
}

testAI();
