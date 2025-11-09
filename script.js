// ===========================
// Language and Translation Logic
// ===========================

const defaultLang = "ar";
const savedLang = localStorage.getItem("lang");
const langToUse = savedLang || defaultLang;

const langList = document.getElementById("lang-list");
const langDisplayButton = document.querySelector(".current-lang-display");
const currentLangFlag = document.getElementById("current-lang-flag");

async function loadLanguage(lang) {
  return new Promise((resolve, reject) => {
    // prevent reloading the same script twice
    if (document.querySelector(`script[data-lang-script="${lang}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `assets/lang/${lang}.js`;
    script.dataset.langScript = lang;
    script.onload = () => resolve();
    script.onerror = () => reject(`Could not load language file: ${lang}`);
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
  if (!window.translations || !translations[lang]) {
    console.error(`No translations found for ${lang}`);
    return;
  }

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
      if (key === "site_title") document.title = translations[lang][key];
    }
  });

  // RTL support
  document.body.classList.toggle("rtl", lang === "ar");

  // Adjust hero banner layout
  const hero = document.querySelector(".heroBanner .container");
  if (hero) {
    hero.style.gridTemplateColumns = lang === "ar" ? "1.5fr 1fr" : "1fr 1.5fr";
  }
}

function toggleDropdown() {
  const isVisible = langList.classList.toggle("visible");
  langDisplayButton.setAttribute("aria-expanded", isVisible);
}

// ===========================
// Language Events
// ===========================

langDisplayButton.addEventListener("click", toggleDropdown);

langList.addEventListener("click", async (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const newLang = li.getAttribute("data-lang");
  try {
    await loadLanguage(newLang);
    applyTranslations(newLang);
    updateLangDisplay(newLang);
    localStorage.setItem("lang", newLang);
    toggleDropdown();
  } catch (err) {
    console.error(err);
  }
});

document.addEventListener("click", (e) => {
  const customSwitch = document.getElementById("custom-lang-switch");
  if (
    customSwitch &&
    !customSwitch.contains(e.target) &&
    langList.classList.contains("visible")
  ) {
    toggleDropdown();
  }
});

// ===========================
// Initialize Page
// ===========================

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadLanguage(langToUse);
    applyTranslations(langToUse);
    updateLangDisplay(langToUse);
    if (!savedLang) localStorage.setItem("lang", defaultLang);
  } catch (err) {
    console.error(err);
  }

  // ===========================
  // Expand Button Logic
  // ===========================
  const newsCards = document.querySelectorAll(".news-card");

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

  newsCards.forEach((card) => {
    const expandBtn = card.querySelector(".expand-btn");
    const header = card.querySelector(".card-header");

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

  // ===========================
  // Mobile Menu Toggle
  // ===========================
  const toggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      mobileNav.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (!toggle.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove("show");
      }
    });
  }

  // ===========================
  // Site Title Click (Home)
  // ===========================
  const siteTitle = document.querySelector(".site-title");
  if (siteTitle) {
    siteTitle.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }
});

// ===========================
// Splash Screen
// ===========================

window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const body = document.body;
  if (splash) {
    setTimeout(() => {
      splash.classList.add("fade-out");
      body.classList.remove("no-scroll");
    }, 1000);
  }
});

// ===========================
// Load Header & Footer
// ===========================

function loadHTML(selector, file) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      document.querySelector(selector).innerHTML = data;
    })
    .catch((err) => console.error(`Failed to load ${file}: ${err}`));
}
