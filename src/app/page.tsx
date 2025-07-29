"use client";

import { useState } from "react";

export default function Home() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const searchWord = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setResult("");
    setWord(searchTerm.trim());

    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: searchTerm.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch definition");
      }

      const data = await response.json();
      setResult(data.definition);
      
      // Add to search history
      setSearchHistory(prev => {
        const newHistory = [searchTerm.trim(), ...prev.filter(w => w !== searchTerm.trim())];
        return newHistory.slice(0, 10); // Keep only last 10 searches
      });
    } catch (error) {
      setResult("Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchWord(word);
  };

  const handleWordClick = async (clickedWord: string) => {
    await searchWord(clickedWord);
  };

  const makeWordsClickable = (text: string) => {
    // Regular expression to match English words (excluding punctuation)
    const wordRegex = /\b[a-zA-Z]{2,}\b/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = wordRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add the clickable word
      const matchedWord = match[0];
      parts.push(
        <button
          key={`${match.index}-${matchedWord}`}
          onClick={() => handleWordClick(matchedWord)}
          className="text-gray-700 dark:text-gray-300 hover:underline cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-0.5 inline"
          disabled={loading}
        >
          {matchedWord}
        </button>
      );

      lastIndex = match.index + matchedWord.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Junior English Dictionary
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              英単語を調べて、分かりやすい英語で意味を学ぼう
            </p>
          </header>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="調べたい英単語を入力してください"
                className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !word.trim()}
                className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "調べています..." : "検索"}
              </button>
            </div>
          </form>

          {(loading || result) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-300">調べています...</span>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    「{word}」の意味
                  </h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {makeWordsClickable(result)}
                    </div>
                    {searchHistory.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                          最近の検索:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {searchHistory.map((historyWord, index) => (
                            <button
                              key={`${historyWord}-${index}`}
                              onClick={() => handleWordClick(historyWord)}
                              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              disabled={loading}
                            >
                              {historyWord}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
