class FaselHD {
  constructor() {
    this.baseUrl = "https://web21312x.faselhdx.best";
    this.headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": this.baseUrl
    };
  }

  getManifest() {
    return {
      id: "com.faselhdx.provider",
      name: "FaselHD",
      version: 1,
      type: ["Movies", "TV"],
      lang: ["ar"],
      description: "Arabic movies and series from FaselHD",
      icon: "https://web21312x.faselhdx.best/wp-content/themes/faselhd/assets/images/logo.png"
    };
  }

  async search(query) {
    const encodedQuery = encodeURIComponent(query);
    const url = `${this.baseUrl}/?s=${encodedQuery}`;
    const response = await fetch(url, { headers: this.headers });
    const html = await response.text();
    
    // SkyStream uses a 'createDocument' or similar parser wrapper. 
    // Assuming standard DOM parser availability or a helper:
    const doc = new DOMParser().parseFromString(html, "text/html");
    const results = [];

    const elements = doc.querySelectorAll("div.blockMovie");
    elements.forEach(element => {
      const linkTag = element.querySelector("a");
      const imgTag = element.querySelector("img");
      
      if (linkTag && imgTag) {
        const title = imgTag.getAttribute("alt") || "No Title";
        const href = linkTag.getAttribute("href");
        const poster = imgTag.getAttribute("data-src") || imgTag.getAttribute("src");
        
        if (href) {
          results.push({
            title: title,
            url: href,
            poster: poster,
            type: href.includes("/series/") || href.includes("/seasons/") ? "TV" : "Movie"
          });
        }
      }
    });

    return results;
  }

  async load(url) {
    const response = await fetch(url, { headers: this.headers });
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const title = doc.querySelector("title")?.textContent.trim() || "Unknown";
    const poster = doc.querySelector("div.poster img")?.getAttribute("src");
    const description = doc.querySelector("div.singleDesc p")?.textContent.trim();

    // Check if it has episodes/seasons
    const episodes = [];
    const episodeElements = doc.querySelectorAll("div.epsa a"); // Common selector for episodes
    
    if (episodeElements.length > 0) {
      episodeElements.forEach(ep => {
        episodes.push({
          name: ep.textContent.trim(),
          url: ep.getAttribute("href")
        });
      });
      return {
        title: title,
        poster: poster,
        description: description,
        type: "TV",
        episodes: episodes
      };
    } else {
      // Movie
      return {
        title: title,
        poster: poster,
        description: description,
        type: "Movie",
        url: url // Direct link to stream/player page
      };
    }
  }

  async stream(url) {
    const response = await fetch(url, { headers: this.headers });
    const html = await response.text();
    
    // Extract iframe or stream URL
    // FaselHD often puts the iframe in a specific container
    const match = html.match(/iframe src="([^"]+)"/);
    if (match) {
      return [{
        url: match[1],
        quality: "Auto"
      }];
    }
    
    return [];
  }
}

// Register the provider
// Note: This line depends on SkyStream's exact registration method. 
// It might simply be exporting the class or calling a global function.
// If 'provider' global exists:
if (typeof provider !== 'undefined') {
    provider(new FaselHD());
} else {
    // Or it might expect the class instance to be returned or assigned
    new FaselHD();
}