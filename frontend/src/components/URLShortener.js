import React, { useState } from "react";

const URLShortener = ({ onShorten }) => {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, slug }),
      });
      const data = await response.json();
      onShorten(data);
      setUrl("");
      setSlug("");
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="mt-8 mb-4 space-y-4">
        <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter the link here"
            className="flex-grow p-4 bg-transparent text-white focus:outline-none"
            required
          />
        </div>
        <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden">
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Custom short URL (optional)"
            className="flex-grow p-4 bg-transparent text-white focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-8 py-4 bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 rounded-lg"
        >
          {loading ? "Shortening..." : "Shorten Now!"}
        </button>
      </form>
    </div>
  );
};

export default URLShortener;
