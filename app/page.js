'use client'
import { useState, useEffect } from "react";
import Form from "./components/Form";

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [predictionDescription, setPredictionDescription] = useState('');
  const [history, setHistory] = useState([]); // State for search history
  const [hasSearchHistory, setHasSearchHistory] = useState(false); // State to track if history exists

  // Load history from localStorage when the component mounts
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setHistory(savedHistory);
    if (savedHistory.length > 0) {
      setHasSearchHistory(true); // Set to true if there is search history
    }
  }, []);

  const handleFormSubmit = async (url) => {
    setPrediction(null);  // Reset prediction
    setError(null);       // Reset error
    setPredictionDescription(''); // Reset description

    try {
      // Clean the URL by removing "https://" only, while keeping "http://"
      let cleanedUrl = url.replace(/^https:\/\//, "www");
    
      // Truncate the URL at ".com" if it exists
      const comIndex = cleanedUrl.indexOf(".com");
      if (comIndex !== -1) {
        cleanedUrl = cleanedUrl.substring(0, comIndex + 4); // Keep ".com"
      }
    
      const response = await fetch("http://localhost:8000/api/predict/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: cleanedUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }

      const data = await response.json();
      setPrediction(data.prediction);

      // Set the description based on the prediction
      setPredictionDescription(getPredictionDescription(data.prediction));

      // Update search history with the result and emoji
      updateSearchHistory(url, data.prediction);

    } catch (error) {
      setError(error.message);
    }
  };

  const getPredictionDescription = (prediction) => {
    switch (prediction) {
      case 'benign':
        return "This URL is safe to visit. It doesn't contain any malicious content.";
      case 'defacement':
        return "This URL has been altered to display unauthorized content, possibly a hacker's message.";
      case 'phishing':
        return "This URL is designed to trick you into providing sensitive information, such as passwords or credit card details.";
      case 'malware':
        return "This URL links to a site that could install malicious software on your device.";
      default:
        return "Unknown prediction. Please try again with a valid URL.";
    }
  };

  const renderEmoji = (prediction) => {
    switch (prediction) {
      case 'benign':
        return '✅'; // Green check mark for benign
      case 'defacement':
        return '💥'; // Explosion for defacement
      case 'phishing':
        return '🎣'; // Fishing hook for phishing
      case 'malware':
        return '💻'; // Computer with malware for malware
      default:
        return '❓'; // Question mark for unknown
    }
  };

  const updateSearchHistory = (url, prediction) => {
    // Get the current history from localStorage
    const savedHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

    // Add the new search URL and its prediction result to the beginning of the array
    const updatedHistory = [{ url, prediction, emoji: renderEmoji(prediction) }, ...savedHistory];

    // Keep only the top 3 searches
    const limitedHistory = updatedHistory.slice(0, 3);

    // Save the updated history to localStorage
    localStorage.setItem("searchHistory", JSON.stringify(limitedHistory));

    // Update state to reflect the changes
    setHistory(limitedHistory);
    setHasSearchHistory(true); // Ensure history is visible after the first search
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-800 via-indigo-600 to-purple-700 text-black">
      <h1 className="text-4xl font-bold mt-6 mb-6 text-black">URL Prediction WebApp</h1>
      
      <div className="mb-5 w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-center mb-4 text-black">Enter a URL to get the prediction</h2>
        <Form onSubmit={handleFormSubmit} />

        {error && <p className="text-red-500 text-center mt-4 text-black">{error}</p>}

        {prediction && (
          <div className="mt-6 text-center">
            <h3 className="text-xl font-medium mb-2 text-black">Prediction Result</h3>
            <p className="text-3xl text-black">{renderEmoji(prediction)} {prediction}</p>
            <p className="mt-4 text-black text-lg">{predictionDescription}</p>
          </div>
        )}

        {/* Display search history only after the first search */}
        {hasSearchHistory && (
          <div className="mt-6 text-center w-full">
            <h3 className="text-xl font-medium mb-2 text-black">Recent Searches</h3>
            {history.length > 0 ? (
              <table className="w-full border-collapse border border-gray-300 table-auto">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">URL</th>
                    <th className="border border-gray-300 px-4 py-2">Prediction</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, index) => (
                    <tr key={index} className="break-words">
                      <td className="border border-gray-300 px-4 py-2 break-words">{entry.url}</td>
                      <td className="border border-gray-300 px-4 py-2">{entry.prediction} {entry.emoji}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No recent searches</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
