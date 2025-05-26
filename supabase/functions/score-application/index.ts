import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ApplicationData {
  firstName: string;
  lastName: string;
  coverLetter: string;
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
  mustHaveSkills: string[];
  preferredBackground: string;
  niceToHaveSkills: string[];
  priorities: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const { firstName, lastName, coverLetter, resumeText, jobTitle, jobDescription, mustHaveSkills, preferredBackground, niceToHaveSkills, priorities } = await req.json() as ApplicationData;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are an expert AI recruiter with extensive experience in technical hiring. Analyze this job application with extreme precision and provide a detailed assessment.
      
      Job Requirements:
      - Position: ${jobTitle}
      - Description: ${jobDescription}
      - Required Skills: ${mustHaveSkills.join(", ")}
      - Background: ${preferredBackground}
      - Bonus Skills: ${niceToHaveSkills.join(", ")}
      - Key Priorities: ${priorities.join(", ")}
      
      Candidate Information:
      - Name: ${firstName} ${lastName}
      - Cover Letter: ${coverLetter}
      - Resume Text: ${resumeText}
      
      Instructions for Analysis:
      1. Skills Assessment:
         - Carefully identify exact matches and close variations of required skills
         - Look for evidence of practical experience with each skill
         - Consider skill proficiency levels mentioned
      
      2. Experience Evaluation:
         - Calculate total years of relevant experience
         - Identify specific projects or roles matching job requirements
         - Evaluate leadership and team experience if relevant
      
      3. Background Fit:
         - Compare candidate's career progression with preferred background
         - Assess industry experience alignment
         - Evaluate company size and environment experience
      
      4. Priority Matching:
         - Score how well the candidate matches each priority
         - Look for specific examples demonstrating priorities
         - Consider both direct and indirect evidence
      
      5. Overall Evaluation:
         - Consider skill gaps vs. potential for quick learning
         - Weigh technical skills against soft skills
         - Factor in career trajectory and growth potential
      
      Return a detailed JSON object with this structure:
      {
        "matchScore": number (0-100, weighted heavily on must-have skills),
        "skillsAssessment": {
          "matchedMustHave": [exact matches with confidence levels],
          "matchedNiceToHave": [exact matches with confidence levels],
          "missingCritical": [missing must-have skills],
          "skillDetails": {
            "proficiencyLevels": object with skill:level pairs,
            "yearsOfExperience": object with skill:years pairs
          }
        },
        "backgroundFit": {
          "alignment": detailed assessment of career fit,
          "yearsRelevant": precise calculation of relevant experience,
          "industryMatch": percentage of industry relevance,
          "environmentFit": assessment of company culture fit
        },
        "strengths": [
          detailed strength descriptions with specific examples
        ],
        "concerns": [
          specific concerns with impact assessment
        ],
        "priorityMatching": {
          "overallScore": number (0-100),
          "details": object with priority:score pairs
        },
        "recommendation": "Strongly Consider" (>80%), "Consider" (60-80%), or "Pass" (<60%),
        "recommendationDetails": detailed explanation of the recommendation
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text().trim();
    
    // Clean up the response
    text = text.replace(/```json\s*|\s*```/g, '');
    
    try {
      const analysis = JSON.parse(text);
      return new Response(JSON.stringify(analysis), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Return a more detailed default analysis
      const defaultAnalysis = {
        matchScore: 30,
        skillsAssessment: {
          matchedMustHave: [],
          matchedNiceToHave: [],
          missingCritical: mustHaveSkills,
          skillDetails: {
            proficiencyLevels: {},
            yearsOfExperience: {}
          }
        },
        backgroundFit: {
          alignment: "Unable to properly assess career alignment",
          yearsRelevant: 0,
          industryMatch: 0,
          environmentFit: "Unable to assess"
        },
        strengths: [],
        concerns: [
          "Unable to properly parse candidate qualifications",
          "Recommend manual review of application"
        ],
        priorityMatching: {
          overallScore: 0,
          details: {}
        },
        recommendation: "Pass",
        recommendationDetails: "Unable to properly analyze application. Manual review recommended."
      };
      
      return new Response(JSON.stringify(defaultAnalysis), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
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