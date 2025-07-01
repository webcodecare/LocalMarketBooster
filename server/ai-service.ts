import OpenAI from "openai";
import { storage } from "./storage";
import { InsertAiAnalysis } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AnalysisResult {
  overallScore: number;
  titleScore: number;
  descriptionScore: number;
  categoryMatch: number;
  improvementSuggestions: string;
  titleSuggestions?: string;
  descriptionSuggestions?: string;
  categorySuggestions?: string;
  marketingTips?: string;
}

export class AIAnalysisService {
  private static instance: AIAnalysisService;

  static getInstance(): AIAnalysisService {
    if (!AIAnalysisService.instance) {
      AIAnalysisService.instance = new AIAnalysisService();
    }
    return AIAnalysisService.instance;
  }

  async analyzeOffer(offerId: number): Promise<AnalysisResult | null> {
    try {
      const offer = await storage.getOffer(offerId);
      if (!offer) {
        throw new Error("Offer not found");
      }

      const prompt = `
        Analyze this business offer for effectiveness and provide improvement suggestions in Arabic:

        **Offer Details:**
        Title: ${offer.title}
        Description: ${offer.description}
        Category: ${offer.category.nameAr}
        Original Price: ${offer.originalPrice} SAR
        Discounted Price: ${offer.discountedPrice} SAR
        Discount Percentage: ${offer.discountPercentage}%
        Valid Until: ${offer.validUntil}
        Business: ${offer.business.businessName}
        City: ${offer.city}

        **Analysis Requirements:**
        Please provide a comprehensive analysis in JSON format with the following structure:
        {
          "overallScore": (1-100 score for overall offer effectiveness),
          "titleScore": (1-100 score for title effectiveness),
          "descriptionScore": (1-100 score for description quality),
          "categoryMatch": (1-100 score for category appropriateness),
          "improvementSuggestions": "General improvement suggestions in Arabic",
          "titleSuggestions": "Specific title improvement suggestions in Arabic",
          "descriptionSuggestions": "Specific description improvement suggestions in Arabic",
          "categorySuggestions": "Category optimization suggestions in Arabic",
          "marketingTips": "Marketing and promotion tips specific to Saudi market in Arabic"
        }

        **Evaluation Criteria:**
        - Title: Clear, attractive, includes discount info, appeals to local market
        - Description: Detailed, compelling, includes terms, creates urgency
        - Category: Appropriate classification for the offer type
        - Pricing: Competitive discount, clear value proposition
        - Local Appeal: Relevance to Saudi Arabian market and culture
        - Marketing Effectiveness: Ability to drive customer action

        Respond only with valid JSON.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert marketing analyst specializing in the Saudi Arabian market. Analyze business offers and provide actionable insights in Arabic."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500
      });

      const analysisContent = response.choices[0].message.content;
      if (!analysisContent) {
        throw new Error("No analysis content received from AI");
      }

      const analysis: AnalysisResult = JSON.parse(analysisContent);

      // Validate scores are within 1-100 range
      analysis.overallScore = Math.max(1, Math.min(100, analysis.overallScore));
      analysis.titleScore = Math.max(1, Math.min(100, analysis.titleScore));
      analysis.descriptionScore = Math.max(1, Math.min(100, analysis.descriptionScore));
      analysis.categoryMatch = Math.max(1, Math.min(100, analysis.categoryMatch));

      // Save analysis to database
      const analysisData: InsertAiAnalysis = {
        offerId: offerId,
        overallScore: analysis.overallScore,
        titleScore: analysis.titleScore,
        descriptionScore: analysis.descriptionScore,
        categoryMatch: analysis.categoryMatch,
        improvementSuggestions: analysis.improvementSuggestions,
        titleSuggestions: analysis.titleSuggestions || null,
        descriptionSuggestions: analysis.descriptionSuggestions || null,
        categorySuggestions: analysis.categorySuggestions || null,
        marketingTips: analysis.marketingTips || null,
        status: "completed"
      };

      await storage.createAiAnalysis(analysisData);

      return analysis;
    } catch (error) {
      console.error("AI Analysis Error:", error);
      
      // Save failed analysis record
      try {
        const failedAnalysis: InsertAiAnalysis = {
          offerId: offerId,
          overallScore: 0,
          titleScore: 0,
          descriptionScore: 0,
          categoryMatch: 0,
          improvementSuggestions: "فشل في تحليل العرض. يرجى المحاولة مرة أخرى.",
          status: "failed"
        };
        await storage.createAiAnalysis(failedAnalysis);
      } catch (dbError) {
        console.error("Failed to save error analysis:", dbError);
      }

      return null;
    }
  }

  async getOfferAnalysis(offerId: number) {
    return await storage.getAiAnalysis(offerId);
  }

  async reanalyzeOffer(offerId: number): Promise<AnalysisResult | null> {
    // Delete existing analysis
    await storage.deleteAiAnalysis(offerId);
    
    // Perform new analysis
    return await this.analyzeOffer(offerId);
  }
}

export const aiAnalysisService = AIAnalysisService.getInstance();