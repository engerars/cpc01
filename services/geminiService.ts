
import { GoogleGenAI } from "@google/genai";
import { FlattenedTracking } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeFinancials = async (records: FlattenedTracking[]) => {
  if (!process.env.API_KEY) return "AI insights unavailable: No API key.";
  
  const summary = records.map(r => ({
    project: r.projectName,
    amount: r.amount,
    paid: r.totalPaid,
    due: r.paymentDue,
    status: r.status
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Phân tích tình hình tài chính dựa trên dữ liệu thanh toán sau và đưa ra 3 lời khuyên ngắn gọn (Tiếng Việt): ${JSON.stringify(summary)}`,
      config: {
        systemInstruction: "Bạn là một chuyên gia phân tích tài chính dự án xây dựng.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Không thể tải phân tích AI vào lúc này.";
  }
};
