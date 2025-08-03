"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import AuthButton from "../components/AuthButton";
import LoginModal from "../components/LoginModal";

interface SearchEntry {
  word: string;
  result: string;
  timestamp: number;
}

export default function Home() {
  const { data: session } = useSession();
  const [word, setWord] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Navigation history for back/forward functionality
  const [navigationHistory, setNavigationHistory] = useState<SearchEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Guest search limit management
  const [guestSearchCount, setGuestSearchCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingSearch, setPendingSearch] = useState<string | null>(null);

  // Load guest search count on mount
  useEffect(() => {
    const savedCount = localStorage.getItem('guestSearchCount');
    if (savedCount) {
      setGuestSearchCount(parseInt(savedCount, 10));
    }
  }, []);

  // Load user data from localStorage on mount
  useEffect(() => {
    if (session?.user?.id) {
      const userKey = `user_${session.user.id}`;
      const savedData = localStorage.getItem(userKey);
      if (savedData) {
        try {
          const userData = JSON.parse(savedData);
          setSearchHistory(userData.searchHistory || []);
          setNavigationHistory(userData.navigationHistory || []);
          setCurrentIndex(userData.currentIndex || -1);
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      }
      // Reset guest search count when user logs in
      setGuestSearchCount(0);
      localStorage.removeItem('guestSearchCount');
    }
  }, [session?.user?.id]);

  // Save guest search count to localStorage
  useEffect(() => {
    if (!session?.user?.id && guestSearchCount > 0) {
      localStorage.setItem('guestSearchCount', guestSearchCount.toString());
    }
  }, [guestSearchCount, session?.user?.id]);

  // Save user data to localStorage whenever data changes
  useEffect(() => {
    if (session?.user?.id) {
      const userKey = `user_${session.user.id}`;
      const userData = {
        searchHistory,
        navigationHistory,
        currentIndex,
        lastUpdated: Date.now()
      };
      localStorage.setItem(userKey, JSON.stringify(userData));
    }
  }, [session?.user?.id, searchHistory, navigationHistory, currentIndex]);

  const searchWord = async (searchTerm: string, addToHistory: boolean = true) => {
    if (!searchTerm.trim()) return;

    // Check search limit for guest users
    if (!session?.user && guestSearchCount >= 2) {
      setPendingSearch(searchTerm.trim());
      setShowLoginModal(true);
      return;
    }

    // Execute the search
    await searchWordInternal(searchTerm.trim(), addToHistory);

    // Increment guest search count
    if (!session?.user) {
      setGuestSearchCount(prev => prev + 1);
    }
  };

  const searchWordInternal = useCallback(async (searchTerm: string, addToHistory: boolean = true) => {
    setLoading(true);
    setResult("");
    setWord(searchTerm);

    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ word: searchTerm }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch definition");
      }

      const data = await response.json();
      setResult(data.definition);
      
      // Add to search history (recent searches)
      setSearchHistory(prev => {
        const newHistory = [searchTerm, ...prev.filter(w => w !== searchTerm)];
        return newHistory.slice(0, 10); // Keep only last 10 searches
      });

      // Add to navigation history if not navigating
      if (addToHistory && !isNavigating) {
        const newEntry: SearchEntry = {
          word: searchTerm,
          result: data.definition,
          timestamp: Date.now()
        };
        
        setNavigationHistory(prev => {
          // Remove any entries after current index (when going back and then searching new word)
          const newHistory = prev.slice(0, currentIndex + 1);
          return [...newHistory, newEntry];
        });
        
        setCurrentIndex(prev => prev + 1);
      }
    } catch {
      const errorMsg = "Sorry, something went wrong. Please try again.";
      setResult(errorMsg);
      
      // Add error to navigation history too
      if (addToHistory && !isNavigating) {
        const newEntry: SearchEntry = {
          word: searchTerm,
          result: errorMsg,
          timestamp: Date.now()
        };
        
        setNavigationHistory(prev => {
          const newHistory = prev.slice(0, currentIndex + 1);
          return [...newHistory, newEntry];
        });
        
        setCurrentIndex(prev => prev + 1);
      }
    } finally {
      setLoading(false);
      setIsNavigating(false);
    }
  }, [currentIndex, isNavigating]);

  // Handle pending search after login
  useEffect(() => {
    if (session?.user && pendingSearch) {
      searchWordInternal(pendingSearch);
      setPendingSearch(null);
      setShowLoginModal(false);
    }
  }, [session?.user, pendingSearch, searchWordInternal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchWord(word);
  };

  const handleWordClick = async (clickedWord: string) => {
    await searchWord(clickedWord);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setIsNavigating(true);
      const prevEntry = navigationHistory[currentIndex - 1];
      setWord(prevEntry.word);
      setResult(prevEntry.result);
      setCurrentIndex(currentIndex - 1);
      setIsNavigating(false);
    }
  };

  const goForward = () => {
    if (currentIndex < navigationHistory.length - 1) {
      setIsNavigating(true);
      const nextEntry = navigationHistory[currentIndex + 1];
      setWord(nextEntry.word);
      setResult(nextEntry.result);
      setCurrentIndex(currentIndex + 1);
      setIsNavigating(false);
    }
  };

  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < navigationHistory.length - 1;

  const navigateToEntry = (index: number) => {
    if (index >= 0 && index < navigationHistory.length && index !== currentIndex) {
      setIsNavigating(true);
      const entry = navigationHistory[index];
      setWord(entry.word);
      setResult(entry.result);
      setCurrentIndex(index);
      setIsNavigating(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const makeWordsClickable = (text: string) => {
    // Split the text into chunks to process smaller segments
    const chunks = text.split(/(\s{2,}|[.!?]\s+)/); // Split by multiple spaces or sentence endings
    const allParts: (string | React.JSX.Element)[] = [];
    
    chunks.forEach((chunk, chunkIndex) => {
      if (/^\s*$/.test(chunk)) {
        // If chunk is just whitespace, add it as-is
        allParts.push(chunk);
        return;
      }
      
      // Process each chunk for clickable words
      const wordRegex = /\b[a-zA-Z]{2,}\b/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = wordRegex.exec(chunk)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push(chunk.slice(lastIndex, match.index));
        }

        // Add the clickable word
        const matchedWord = match[0];
        parts.push(
          <button
            key={`chunk-${chunkIndex}-${match.index}-${matchedWord}`}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWordClick(matchedWord);
            }}
            className="text-gray-700 dark:text-gray-300 hover:underline cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-0.5 inline select-none"
            disabled={loading}
            type="button"
            tabIndex={0}
          >
            {matchedWord}
          </button>
        );

        lastIndex = match.index + matchedWord.length;
      }

      // Add remaining text from this chunk
      if (lastIndex < chunk.length) {
        parts.push(chunk.slice(lastIndex));
      }
      
      // Add all parts from this chunk to the main parts array
      allParts.push(...parts);
    });

    return allParts;
  };

  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim() === '') {
        // Empty line - add spacing
        elements.push(<div key={key++} className="h-4" />);
        continue;
      }

      // Handle headers with pronunciation (e.g., **Word** /pronunciation/ (*part of speech*))
      if (line.match(/^\*\*[^*]+\*\*\s*\/[^/]+\/\s*\([^)]+\)\s*$/)) {
        const headerMatch = line.match(/^\*\*([^*]+)\*\*\s*\/([^/]+)\/\s*\(([^)]+)\)\s*$/);
        if (headerMatch) {
          elements.push(
            <div key={key++} className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 inline">
                {makeWordsClickable(headerMatch[1])}
              </h3>
              <span className="ml-3 text-xl text-gray-700 dark:text-gray-300 font-mono">
                /{headerMatch[2]}/
              </span>
              <span className="ml-3 text-lg text-gray-600 dark:text-gray-400 italic">
                ({headerMatch[3]})
              </span>
            </div>
          );
          continue;
        }
      }

      // Handle headers without pronunciation (e.g., **Word** (*part of speech*))
      if (line.match(/^\*\*[^*]+\*\*\s*\([^)]+\)\s*$/)) {
        const headerMatch = line.match(/^\*\*([^*]+)\*\*\s*\(([^)]+)\)\s*$/);
        if (headerMatch) {
          elements.push(
            <div key={key++} className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 inline">
                {makeWordsClickable(headerMatch[1])}
              </h3>
              <span className="ml-3 text-lg text-gray-600 dark:text-gray-400 italic">
                ({headerMatch[2]})
              </span>
            </div>
          );
          continue;
        }
      }

      // Handle **Definition:** header (with or without content)
      if (line.match(/^\*\*Definition:\*\*(.*)$/)) {
        const definitionMatch = line.match(/^\*\*Definition:\*\*\s*(.*)$/);
        elements.push(
          <h4 key={key++} className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
            Definition:
          </h4>
        );
        
        // If there's content after "Definition:", process it as a regular paragraph
        if (definitionMatch && definitionMatch[1].trim()) {
          elements.push(
            <p key={key++} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 select-none">
              {makeWordsClickable(definitionMatch[1].trim())}
            </p>
          );
        }
        continue;
      }

      // Handle **Examples:** header
      if (line.match(/^\*\*Examples:\*\*\s*$/)) {
        elements.push(
          <h4 key={key++} className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
            Examples:
          </h4>
        );
        continue;
      }

      // Handle related words sections (Synonyms, Antonyms, Similar words)
      const relatedWordMatch = line.match(/^\*\*([^:]+):\*\*\s+(.+)$/);
      if (relatedWordMatch) {
        const [, category, wordsText] = relatedWordMatch;
        const words = wordsText.split(',').map(w => w.trim()).filter(w => w);
        
        if (words.length > 0) {
          let categoryColor = '';
          let categoryBg = '';
          
          if (category === 'Synonyms') {
            categoryColor = 'text-emerald-600 dark:text-emerald-400';
            categoryBg = 'bg-emerald-50 dark:bg-emerald-950';
          } else if (category === 'Antonyms') {
            categoryColor = 'text-rose-600 dark:text-rose-400';
            categoryBg = 'bg-rose-50 dark:bg-rose-950';
          } else if (category === 'Similar words') {
            categoryColor = 'text-violet-600 dark:text-violet-400';
            categoryBg = 'bg-violet-50 dark:bg-violet-950';
          }

          elements.push(
            <div key={key++} className="mt-6">
              <h4 className={`text-lg font-semibold ${categoryColor} mb-3`}>
                {category}:
              </h4>
              <div className="flex flex-wrap gap-2">
                {words.map((word, idx) => (
                  <button
                    key={`${category}-${word}-${idx}`}
                    onClick={() => handleWordClick(word)}
                    disabled={loading}
                    className={`px-3 py-1 text-sm ${categoryBg} ${categoryColor} rounded-full hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          );
          continue;
        }
      }

      // Handle list items (- item)
      if (line.match(/^-\s+/)) {
        const listContent = line.replace(/^-\s+/, '');
        elements.push(
          <div key={key++} className="ml-6 mb-2 flex items-start">
            <span className="text-blue-500 dark:text-blue-400 mr-3 mt-1">•</span>
            <div className="text-gray-700 dark:text-gray-300">
              {makeWordsClickable(listContent)}
            </div>
          </div>
        );
        continue;
      }

      // Handle regular paragraph with bold text
      const processInlineFormatting = (text: string) => {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let partKey = 0;

        // Match **bold** text
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let match;

        while ((match = boldRegex.exec(text)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            const beforeText = text.slice(lastIndex, match.index);
            const beforeParts = makeWordsClickable(beforeText);
            beforeParts.forEach(part => {
              if (typeof part === 'string') {
                parts.push(part);
              } else {
                parts.push(<span key={partKey++}>{part}</span>);
              }
            });
          }

          // Add the bold text
          parts.push(
            <strong key={partKey++} className="font-bold text-gray-900 dark:text-gray-100">
              {makeWordsClickable(match[1]).map((part, idx) => 
                typeof part === 'string' ? part : <span key={idx}>{part}</span>
              )}
            </strong>
          );

          lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
          const remainingText = text.slice(lastIndex);
          const remainingParts = makeWordsClickable(remainingText);
          remainingParts.forEach(part => {
            if (typeof part === 'string') {
              parts.push(part);
            } else {
              parts.push(<span key={partKey++}>{part}</span>);
            }
          });
        }

        return parts;
      };

      // Regular paragraph
      elements.push(
        <p key={key++} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 select-none">
          {processInlineFormatting(line)}
        </p>
      );
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex h-screen max-md:flex-col">
        {/* Sidebar */}
        {navigationHistory.length > 0 && (
          <div className={`${sidebarOpen ? 'w-72 max-md:w-full' : 'w-12 max-md:w-full'} ${sidebarOpen ? 'max-md:h-64' : 'max-md:h-12'} bg-white dark:bg-gray-800 border-r max-md:border-b border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col shrink-0`}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              {sidebarOpen && (
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  検索履歴
                </h2>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  )}
                </svg>
              </button>
            </div>
            
            {/* History List */}
            {sidebarOpen && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                  {navigationHistory.map((entry, index) => (
                    <button
                      key={`${entry.word}-${entry.timestamp}`}
                      onClick={() => navigateToEntry(index)}
                      disabled={loading}
                      className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                        index === currentIndex
                          ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-600'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                      } disabled:opacity-50`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {entry.word}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {entry.result.slice(0, 60)}...
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto max-md:h-auto">
          <div className="container mx-auto px-6 py-8 max-md:px-4 max-md:py-6">
            <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="flex justify-between items-center mb-6 max-md:flex-col max-md:gap-4">
              <h1 className="text-3xl max-md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                Junior English Dictionary
              </h1>
              <AuthButton />
            </div>
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                英単語を調べて、分かりやすい英語で意味を学ぼう
              </p>
            </div>
          </header>

          {/* Navigation buttons */}
          {navigationHistory.length > 1 && (
            <div className="flex gap-2 mb-4">
              {canGoBack && (
                <button
                  onClick={goBack}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  戻る
                </button>
              )}
              {canGoForward && (
                <button
                  onClick={goForward}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 transition-colors"
                >
                  進む
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                {currentIndex + 1} / {navigationHistory.length}
              </div>
            </div>
          )}

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
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed select-none">
                      {parseMarkdown(result)}
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
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setPendingSearch(null);
        }}
        searchCount={guestSearchCount + 1}
      />
    </div>
  );
}
