import React, { useEffect, useState } from "react";

const App = () => {
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await fetch(
          "https://shawty-server.vercel.app/api/urls",
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
        setUrls(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching URLs:", error);
        setError("Failed to load URLs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <URLList urls={urls} />;
};

export default App;
