import { GoogleGenAI } from "@google/genai";

function getGenAI() {
  // @ts-ignore
  const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) 
    ? process.env.API_KEY 
    // @ts-ignore
    : (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY)
    ? process.env.GEMINI_API_KEY
    // @ts-ignore
    : (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY)
    ? import.meta.env.VITE_GEMINI_API_KEY
    : "";
    
  return new GoogleGenAI({ apiKey: apiKey });
}

export async function generateMapInfographic(userDescription: string) {
  const ai = getGenAI();
  const prompt = `A breathtaking, high-resolution, 3D isometric dark-mode infographic trail map based strictly on this user request: "${userDescription}". 
  CRITICAL STYLISTIC DIRECTIVES:
  - Perspective: 3D isometric angle, beautifully angled down to show terrain depth, natural elements like water reflections, and architectural massing of monuments or buildings.
  - Base map: Hyper-realistic 3D satellite terrain, stylized in deep '#08080C' space-blacks and midnight blues. Water should have subtle realistic reflections.
  - Routing path: Glowing neon cyan ('#00FF9C') and soft blue energy lines tracing the route, emitting a vibrant drop-shadow, with small sharp directional arrows pointing the way.
  - Waypoints & Markers: Add glowing auras around major landmarks based on the location. Include floating, glowing 'P' icons for accurate parking locations. Include small stylish text labels along the path indicating time/distance (e.g. '5-10 min').
  - UI Overlays: Incorporate high-tech, frosted glassmorphism overlay panels (dark glass, translucent blur, crisp white text) organically into the image. This should include a 'Legend' floating in the corner listing Total Distance, Total Time, and a list of 'Accurate Parking Locations'. 
  - Typography: Clean, modern sans-serif. Use thin, precise leader lines pointing from labels to the specific 3D landmarks.
  - Vibe: Grand Theft Auto 6 hacker UI meets museum-grade geographic infographic. Perfectly crisp 4K resolution, cinematic studio lighting, highly precise geographic rendering.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "4K"
        }
      }
    });

    if (response.candidates && response.candidates[0] && response.candidates[0].content) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data returned from AI");
  } catch (error: any) {
    console.error("Image Generation Error", error);
    throw new Error(error?.message || "Failed to generate HQ Image. Verify your API Key and billing status.");
  }
}

