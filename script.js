// 3rb.io Multilingual Script
//     ===

const defaultLang = "ar";
const savedLang = localStorage.getItem("lang");
const langToUse = savedLang || defaultLang;

//   ==
// DOM Elements
//   ==
const langList = document.getElementById("lang-list");
const langDisplayButton = document.querySelector(".current-lang-display");
const currentLangFlag = document.getElementById("current-lang-flag");

//   ==

// Functions
//   ==

// Dynamic Language Loader
//   ==
/* function loadLanguage(lang) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = `assets/lang/${lang}.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(`Could not load language file: ${lang}`);
    document.head.appendChild(script);
  });
} */

function loadLanguage(lang) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const path = window.location.pathname;
    console(`path is ` + path);
    const isLocal = window.location.protocol === "file:";

    let srcPath = "";

    if (isLocal) {
      // 🖥 Local testing (file://) - Use RELATIVE path
      if (
        path.includes("/fixes") ||
        path.includes("/news") ||
        path.includes("/updates")
      ) {
        // We are in a subfolder, so go up one level (..) to find assets/
        srcPath = "../assets/lang/" + lang + ".js";
      } else {
        // We are at the root index.html, so access assets/ directly
        srcPath = "assets/lang/" + lang + ".js";
      }
    } else {
      // 🌐 Live Server (http/https) - Use ABSOLUTE path from domain root (/)
      // This is the most reliable path for ANY live server (unless it's a specific GitHub Pages repo)
      srcPath = "/assets/lang/" + lang + ".js";

      // IMPORTANT: If you are on GitHub Pages (user.github.io/repo-name/)
      /*
      if (window.location.hostname.includes("github.io")) {
         const pathSegments = path.split('/').filter(Boolean);
         const repoName = pathSegments[0] || ""; 
         srcPath = `/${repoName}/assets/lang/${lang}.js`;
      }
      */
    }

    // Load the script
    script.src = srcPath;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(`Could not load language file: ${script.src}`);
    document.head.appendChild(script);
  });
}
function updateLangDisplay(lang) {
  langList.querySelectorAll("li").forEach((li) => {
    li.classList.remove("selected");
    if (li.getAttribute("data-lang") === lang) {
      li.classList.add("selected");
      const flag = li.getAttribute("data-flag");
      const name = li.getAttribute("data-name");
      currentLangFlag.textContent = flag;
      langDisplayButton.setAttribute(
        "aria-label",
        `Current language: ${name}. Click to change.`
      );
    }
  });
}

function applyTranslations(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
      if (key === "site_title") {
        document.title = translations[lang][key];
      }
    }
  });

  // RTL support
  if (lang === "ar") {
    document.body.classList.add("rtl");
  } else {
    document.body.classList.remove("rtl");
  }

  // انعكاس heroBanner تلقائي
  const hero = document.querySelector(".heroBanner .container");
  if (lang === "ar") {
    hero.style.gridTemplateColumns = "1.5fr 1fr"; // النص أولًا
  } else {
    hero.style.gridTemplateColumns = "1fr 1.5fr"; // الصورة أولًا
  }
}

function toggleDropdown() {
  const isVisible = langList.classList.toggle("visible");
  langDisplayButton.setAttribute("aria-expanded", isVisible);
}

//   ==
// Event Listeners
//   ==
langDisplayButton.addEventListener("click", toggleDropdown);

langList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    const newLang = e.target.getAttribute("data-lang");
    applyTranslations(newLang);
    updateLangDisplay(newLang);
    localStorage.setItem("lang", newLang);
    toggleDropdown();
  }
});
// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  const customSwitch = document.getElementById("custom-lang-switch");
  if (
    !customSwitch.contains(e.target) &&
    langList.classList.contains("visible")
  ) {
    toggleDropdown();
  }
});

//   ==
// Initialize Page
//   ==
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadLanguage(langToUse);
    applyTranslations(langToUse);
    updateLangDisplay(langToUse);
    if (!savedLang) localStorage.setItem("lang", defaultLang);
  } catch (err) {
    console.error(err);
  }

  //    =====
  // Expand Button Logic
  //    =====
  const newsCards = document.querySelectorAll(".news-card");

  const collapseCard = (card) => {
    card.setAttribute("data-expanded", "false");
    const expandBtn = card.querySelector(".expand-btn");
    const details = card.querySelector(".news-details");
    expandBtn.setAttribute("aria-expanded", "false");
    details.setAttribute("aria-hidden", "true");
  };

  const expandCard = (card) => {
    card.setAttribute("data-expanded", "true");
    const expandBtn = card.querySelector(".expand-btn");
    const details = card.querySelector(".news-details");
    expandBtn.setAttribute("aria-expanded", "true");
    details.setAttribute("aria-hidden", "false");
  };

  newsCards.forEach((card) => {
    const expandBtn = card.querySelector(".expand-btn");
    const header = card.querySelector(".card-header");

    const toggleCard = () => {
      const isExpanded = card.getAttribute("data-expanded") === "true";
      if (isExpanded) {
        collapseCard(card);
        return;
      }
      // Collapse all others
      newsCards.forEach((otherCard) => {
        if (otherCard !== card) collapseCard(otherCard);
      });
      expandCard(card);
    };

    expandBtn.addEventListener("click", toggleCard);
    header.addEventListener("click", (e) => {
      if (e.target.closest(".expand-btn")) return;
      toggleCard();
    });
  });
});

document.querySelector(".site-title").addEventListener("click", () => {
  window.location.href = "index.html";
});
// Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      mobileNav.classList.toggle("show");
    });

    // Optional: close when clicking outside
    document.addEventListener("click", (e) => {
      if (!toggle.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove("show");
      }
    });
  }
});

/* r */

document.addEventListener("DOMContentLoaded", async () => {
  if (!skipTranslation) {
    try {
      await loadLanguage(langToUse);
      applyTranslations(langToUse);
      updateLangDisplay(langToUse);
      if (!savedLang) localStorage.setItem("lang", defaultLang);
    } catch (err) {
      console.error(err);
    }
  } else {
    console.log("Translation disabled on index.html");
  }

  // Expand button logic and other scripts can run normally
  const newsCards = document.querySelectorAll(".news-card");
  newsCards.forEach((card) => {
    const expandBtn = card.querySelector(".expand-btn");
    const header = card.querySelector(".card-header");

    const collapseCard = (card) => {
      card.setAttribute("data-expanded", "false");
      card.querySelector(".expand-btn").setAttribute("aria-expanded", "false");
      card.querySelector(".news-details").setAttribute("aria-hidden", "true");
    };

    const expandCard = (card) => {
      card.setAttribute("data-expanded", "true");
      card.querySelector(".expand-btn").setAttribute("aria-expanded", "true");
      card.querySelector(".news-details").setAttribute("aria-hidden", "false");
    };

    const toggleCard = () => {
      const isExpanded = card.getAttribute("data-expanded") === "true";
      if (isExpanded) {
        collapseCard(card);
        return;
      }
      newsCards.forEach((otherCard) => {
        if (otherCard !== card) collapseCard(otherCard);
      });
      expandCard(card);
    };

    expandBtn.addEventListener("click", toggleCard);
    header.addEventListener("click", (e) => {
      if (e.target.closest(".expand-btn")) return;
      toggleCard();
    });
  });
});
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const body = document.body;

  setTimeout(() => {
    splash.classList.add("fade-out");
    body.classList.remove("no-scroll");
  }, 1000); // show for 3 seconds
});

document.addEventListener("click", (e) => {
  const customSwitch = document.getElementById("custom-lang-switch");
  if (
    !customSwitch.contains(e.target) &&
    langList.classList.contains("visible")
  ) {
    toggleDropdown();
  }
});

//   ==
// Initialize on DOM Ready
//   ==
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "ar";
  applyTranslations(savedLang);
  updateLangDisplay(savedLang);
});
function loadHTML(selector, file) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      document.querySelector(selector).innerHTML = data;
    })
    .catch((err) => console.error(`Failed to load ${file}: ${err}`));
}

// Load header and footer
loadHTML("#header-container", "header.html");
loadHTML("#footer-container", "footer.html");
