import React from "react";

const URLList = ({ urls }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full mt-8">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-800">
            <th className="py-3 px-4">Short Link</th>
            <th className="py-3 px-4">Original Link</th>
            <th className="py-3 px-4">QR Code</th>
            <th className="py-3 px-4">Clicks</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url) => (
            <tr
              key={url.slug}
              className="border-b border-gray-800 hover:bg-gray-800"
            >
              <td className="py-4 px-4">
                <a
                  href={`/${url.slug}`}
                  className="text-blue-500 hover:text-blue-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  /{url.slug}
                </a>
              </td>
              <td className="py-4 px-4 truncate max-w-xs">
                <a
                  href={url.url}
                  className="text-gray-300 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {" "}
                  {url.url}
                </a>
              </td>
              <td className="py-4 px-4">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </td>
              <td className="py-4 px-4">{url.clicks}</td>
              <td className="py-4 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    url.active
                      ? "bg-green-900 text-green-300"
                      : "bg-yellow-900 text-yellow-300"
                  }`}
                >
                  {url.active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-4 px-4 text-gray-400">
                {new Date(url.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default URLList;
