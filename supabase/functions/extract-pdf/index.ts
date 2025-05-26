import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const { base64Pdf } = await req.json();
    
    if (!base64Pdf) {
      throw new Error("No PDF content provided");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Extract all text content from this PDF document.
      Focus on:
      - Professional experience
      - Skills and technologies
      - Education
      - Projects
      - Achievements
      
      Return the content in a clear, structured format.
      Include all relevant details but remove any formatting or unnecessary whitespace.
    `;

    const result = await model.generateContent([prompt, { inlineData: { data: base64Pdf, mimeType: "application/pdf" } }]);
    const response = result.response;
    const extractedText = response.text().trim();

    return new Response(JSON.stringify({ text: extractedText }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }), 
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});