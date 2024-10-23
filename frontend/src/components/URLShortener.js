import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import dotenv from "dotenv";
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL;

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
      const response = await fetch(`${API_BASE_URL}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ url, slug }),
      });

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
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
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
          className="w-full px-8 py-4 bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Shortening..." : "Shorten Now!"}
        </button>
      </form>
    </div>
  );
};
