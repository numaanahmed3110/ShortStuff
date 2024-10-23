import React, { useState } from "react";

const URLShortener = ({ onShorten }) => {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://shawty-server.vercel.app/api/shorten",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ url, slug }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to shorten URL");
      }

      const data = await response.json();
      onShorten(data);
      setUrl("");
      setSlug("");
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Failed to shorten URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
          {error}
        </div>
      )}
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
            pattern="[a-zA-Z0-9-]*"
            title="Only letters, numbers, and hyphens are allowed"
            className="flex-grow p-4 bg-transparent text-white focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-8 py-4 bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
        >
          {loading ? "Shortening..." : "Shorten Now!"}
        </button>
      </form>
    </div>
  );
};

export default URLShortener;
