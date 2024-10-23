import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const URLList = ({ urls, currentPage, totalPages, onPageChange }) => {
  if (!urls.length) {
    return (
      <div className="text-center text-gray-400 py-8">
        No shortened URLs found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {urls.map((url) => (
          <div key={url.slug} className="bg-gray-800 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-start">
              <div className="text-blue-400 font-medium break-all">
                <a
                  href={`${API_BASE_URL}/${url.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`${API_BASE_URL}/${url.slug}`}
                </a>
              </div>
              <span className="text-gray-400 text-sm">
                {new Date(url.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="text-gray-400 text-sm break-all">{url.url}</div>
            <div className="text-gray-500 text-sm">
              Clicks: {url.clicks.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchUrls = async (page) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/urls?page=${page}&limit=${itemsPerPage}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUrls(data.urls);
      setTotalPages(data.pagination.totalPages);
      setError(null);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      setError("Failed to load URLs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls(currentPage);
  }, [currentPage, itemsPerPage]);

  const handleShorten = (newUrl) => {
    setUrls((prevUrls) => [newUrl, ...prevUrls]);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <URLShortener onShorten={handleShorten} />

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <URLList
          urls={urls}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default App;
