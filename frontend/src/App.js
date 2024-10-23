import React, { useState, useEffect } from "react";
import Header from "./components/Header.js";
import URLShortener from "./components/URLShortener.js";
import URLList from "./components/URLList.js";

function App() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch("https://shawty-server.vercel.app/api/urls");
      if (!response.ok) throw new Error("Failed to fetch URLs");
      const data = await response.json();
      setUrls(data);
    } catch (err) {
      console.error("Error fetching URLs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShorten = async (newUrl) => {
    try {
      const response = await fetch(
        "https://shawty-server.vercel.app/api/shorten",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUrl),
        }
      );
      if (!response.ok) throw new Error("Failed to shorten URL");
      const data = await response.json();
      setUrls([data, ...urls]);
    } catch (err) {
      console.error("Error shortening URL:", err);
      setError(err.message);
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 pb-8">
        <div className="text-center max-w-4xl mx-auto mt-16 mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Making <span className="text-pink-500">loooong</span> links{" "}
            <span className="text-blue-500">little..</span>
          </h2>
          <p className="text-gray-400">
            This is an efficient and easy-to-use URL shortening service that
            streamlines your online experience.
          </p>
        </div>

        <URLShortener onShorten={handleShorten} />

        {error && (
          <div className="text-red-500 text-center mt-4">Error: {error}</div>
        )}

        {loading ? (
          <div className="text-center mt-8">Loading...</div>
        ) : (
          <URLList urls={urls} />
        )}
      </main>
    </div>
  );
}

export default App;
