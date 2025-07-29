"use client";

import { useState } from "react";

export default function Home() {
  const [word, setWord] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: word.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch definition");
      }

      const data = await response.json();
      setResult(data.definition);
    } catch (error) {
      setResult("Sorry, something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result}
                    </p>
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
