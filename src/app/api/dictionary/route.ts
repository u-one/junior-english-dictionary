import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { word } = await request.json();

    if (!word || typeof word !== "string") {
      return NextResponse.json(
        { error: "Word is required and must be a string" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const prompt = `You are an English-English dictionary designed for Japanese junior high school students (ages 12-15). 

Your task is to explain the English word "${word}" in simple, easy-to-understand English that Japanese middle school students can comprehend.

Guidelines:
- Use simple vocabulary (elementary to intermediate level)
- Keep sentences short and clear
- Include the part of speech (noun, verb, adjective, etc.)
- ALWAYS include pronunciation using IPA (International Phonetic Alphabet)
- Provide 1-2 simple example sentences
- Include related words when available: synonyms, antonyms, and similar words
- If it's a common word with multiple meanings, focus on the most common 1-2 meanings
- Use present tense when possible
- Avoid complex grammar structures
- Make it educational and friendly

Format your response as:
**[Word]** /[IPA pronunciation]/ (*part of speech*)

[Simple definition in 1-2 sentences]

**Examples:**
- [Example sentence 1]
- [Example sentence 2]

**Synonyms:** word1, word2, word3
**Antonyms:** word1, word2
**Similar words:** word1, word2, word3

Please explain the word "${word}":`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful English dictionary assistant for Japanese junior high school students. Always respond in simple, clear English.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const definition = completion.choices[0]?.message?.content?.trim();

    if (!definition) {
      return NextResponse.json(
        { error: "Failed to generate definition" },
        { status: 500 }
      );
    }

    return NextResponse.json({ definition });
  } catch (error) {
    console.error("Error in dictionary API:", error);
    
    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}