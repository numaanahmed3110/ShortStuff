document.getElementById("urlForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const urlInput = document.getElementById("url").value;
  const slugInput = document.getElementById("slug").value;

  fetch("/url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: urlInput,
      slug: slugInput,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      fetch(`/url/${data.slug}`)
        .then((response) => response.json())
        .then((urlData) => {
          document.getElementById("result").innerHTML = `
            <p>Shortened URL: <a href="${urlData.fullShortUrl}" target="_blank">${urlData.fullShortUrl}</a></p>
          `;
        });
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("result").innerHTML =
        "An error occurred while processing the URL.";
    });
});
