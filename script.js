// ===========================
// 1. القواعد والبيانات الأساسية
// ===========================
const defaultLang = "ar";
const savedLang = localStorage.getItem("lang");
const langToUse = savedLang || defaultLang;

const langList = document.getElementById("lang-list");
const langDisplayButton = document.querySelector(".current-lang-display");
const currentLangFlag = document.getElementById("current-lang-flag");

const STATUS_URL = "https://3rb.io/cdn-cgi/trace";

// متغيرات عالمية لحفظ حالة البيانات وتجنب إعادة طلبها عند تغيير اللغة
let lastTraceData = null;
const stats = {
  current7: 1510,
  previous7: 1300,
  current30: 5310,
  previous30: 5240,
  updatedAt: "1 سبتمبر 2025",
};

// ===========================
// 2. منطق الترجمة واللغات
// ===========================

async function loadLanguage(lang) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-lang-script="${lang}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `../assets/lang/${lang}.js`;
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
  if (!window.translations || !translations[lang]) return;

  // ترجمة النصوص العامة في الصفحة
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
      if (key === "site_title") document.title = translations[lang][key];
    }
  });

  // تحديث نصوص "حالة الشبكة" فوراً باستخدام البيانات المخزنة
  updateStatusUI(lang);
  refreshAnimatedNumbers();
  renderChange(stats.current7, stats.previous7, "change-7d");
  renderChange(stats.current30, stats.previous30, "change-30d");
  // هذا السطر هو المسؤول عن عكس اتجاه العناصر (ProgressBar والنصوص)
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  // دعم اتجاه النصوص RTL/LTR
  document.body.classList.toggle("rtl", lang === "ar");
  const hero = document.querySelector(".heroBanner .container");
  if (hero) {
    hero.style.gridTemplateColumns = lang === "ar" ? "1.5fr 1fr" : "1fr 1.5fr";
  }
}

// ===========================
// 3. حالة الموقع ومعلومات الشبكة
// ===========================

function updateStatusUI(lang) {
  if (!lastTraceData) return;

  const t = translations[lang] || {};
  const text = document.getElementById("status-text");
  const lastCheck = document.getElementById("last-check");
  const traceTLS = document.getElementById("trace-tls");
  const traceScheme = document.getElementById("trace-scheme");

  // ترجمة تقييم TLS
  const tls = lastTraceData.tls || "";
  if (/TLSv1\.3/i.test(tls)) traceTLS.textContent = t.tls_strong || "Strong";
  else if (/TLSv1\.2/i.test(tls))
    traceTLS.textContent = t.tls_medium || "Medium";
  else if (/TLSv1\.0|TLSv1\.1/i.test(tls))
    traceTLS.textContent = t.tls_weak || "Weak";
  else traceTLS.textContent = "—";

  // ترجمة تقييم Scheme
  const scheme = lastTraceData.visit_scheme || "";
  if (scheme.toLowerCase() === "https")
    traceScheme.textContent = t.scheme_secure || "Secure";
  else if (scheme.toLowerCase() === "http")
    traceScheme.textContent = t.scheme_weak || "Weak";
  else traceScheme.textContent = "—";

  // حالة الاتصال والوقت المحلي حسب اللغة
  text.textContent = lastTraceData.isOnline
    ? t.status_online || "Site Status"
    : t.status_offline || "Site Status";
  lastCheck.textContent = new Date(lastTraceData.timestamp).toLocaleTimeString(
    lang === "ar" ? "ar-EG" : "en-US"
  );
}

function checkStatus() {
  const indicator = document.getElementById("status-indicator");
  const text = document.getElementById("status-text");
  const lang = localStorage.getItem("lang") || "ar";
  const t = translations[lang] || {};

  indicator.classList.remove("online", "offline");
  indicator.classList.add("checking");
  text.textContent = t.status_checking || "Checking...";

  fetch(STATUS_URL + "?t=" + Date.now(), { cache: "no-store" })
    .then((res) => res.text())
    .then((data) => {
      const parsed = {};
      data.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) parsed[key.trim()] = value.trim();
      });

      // حفظ البيانات عالمياً وتثبيت الوقت
      lastTraceData = { ...parsed, isOnline: true, timestamp: new Date() };

      document.getElementById("trace-country").textContent = parsed.loc || "—";
      indicator.classList.remove("checking");
      indicator.classList.add("online");

      updateStatusUI(lang);
    })
    .catch(() => {
      lastTraceData = { isOnline: false, timestamp: new Date() };
      indicator.classList.remove("checking");
      indicator.classList.add("offline");
      updateStatusUI(lang);
    });
}

// ===========================
// 4. إحصائيات الزوار والأنميشن
// ===========================

function getI18nClickSiteN() {
  const el = document.querySelector("[data-i18n='clickSiteN']");
  return el ? el.textContent.trim() : "ألف";
}

function formatShortNumber(value) {
  if (value >= 1000) {
    let shortVal = (value / 1000).toFixed(1);
    if (shortVal.endsWith(".0")) shortVal = shortVal.slice(0, -2);
    return shortVal + " " + getI18nClickSiteN();
  }
  return value.toString();
}

function animateValueShort(el, end, duration) {
  let startTime = null;
  el.dataset.value = end; // تخزين القيمة الرقمية للرجوع إليها لاحقاً
  function animate(time) {
    if (!startTime) startTime = time;
    const progress = Math.min((time - startTime) / duration, 1);
    const currentValue = Math.floor(progress * end);
    el.textContent = formatShortNumber(currentValue);
    if (progress < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function refreshAnimatedNumbers() {
  const v7 = document.getElementById("visits-7d");
  const v30 = document.getElementById("visits-30d");

  if (v7 && v7.dataset.value) {
    v7.textContent = formatShortNumber(parseInt(v7.dataset.value));
  }
  if (v30 && v30.dataset.value) {
    v30.textContent = formatShortNumber(parseInt(v30.dataset.value));
  }
}

function renderChange(current, previous, id) {
  const el = document.getElementById(id);
  if (!el) return;
  const diff = current - previous;
  const lang = localStorage.getItem("lang") || "ar";
  const t = translations[lang] || {};

  if (diff > 0) {
    el.textContent = `↑ +${diff.toLocaleString(lang)}`;
    el.className = "stat-change up";
  } else if (diff < 0) {
    el.textContent = `↓ ${diff.toLocaleString(lang)}`;
    el.className = "stat-change down";
  } else {
    el.textContent = t.no_change;
    el.className = "stat-change";
  }
}

// ===========================
// 5. الأحداث وتفاعلات الواجهة
// ===========================

langDisplayButton.addEventListener("click", () => {
  const isVisible = langList.classList.toggle("visible");
  langDisplayButton.setAttribute("aria-expanded", isVisible);
});

langList.addEventListener("click", async (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const newLang = li.getAttribute("data-lang");
  try {
    await loadLanguage(newLang);
    updateLangDisplay(newLang);
    localStorage.setItem("lang", newLang);
    applyTranslations(newLang);
    langList.classList.remove("visible");
  } catch (err) {
    console.error(err);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadLanguage(langToUse);
    applyTranslations(langToUse);
    updateLangDisplay(langToUse);
    checkStatus(); // تشغيل فحص الحالة عند التحميل

    // تشغيل أنميشن الأرقام
    animateValueShort(
      document.getElementById("visits-7d"),
      stats.current7,
      1200
    );
    animateValueShort(
      document.getElementById("visits-30d"),
      stats.current30,
      1500
    );
    document.getElementById("stats-updated").textContent = stats.updatedAt;
  } catch (err) {
    console.error(err);
  }

  // منطق تمديد بطاقات الأخبار
  const newsCards = document.querySelectorAll(".news-card");
  newsCards.forEach((card) => {
    const expandBtn = card.querySelector(".expand-btn");
    const header = card.querySelector(".card-header");
    const toggle = () => {
      const isExp = card.getAttribute("data-expanded") === "true";
      newsCards.forEach((c) => {
        c.setAttribute("data-expanded", "false");
        c.querySelector(".expand-btn").setAttribute("aria-expanded", "false");
      });
      if (!isExp) {
        card.setAttribute("data-expanded", "true");
        expandBtn.setAttribute("aria-expanded", "true");
      }
    };
    expandBtn.addEventListener("click", toggle);
    header.addEventListener("click", (e) => {
      if (!e.target.closest(".expand-btn")) toggle();
    });
  });

  // قائمة الموبايل
  const toggleMenu = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if (toggleMenu && mobileNav) {
    toggleMenu.addEventListener("click", () =>
      mobileNav.classList.toggle("show")
    );
  }
});

// إخفاء الـ Splash Screen
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  if (splash) {
    setTimeout(() => {
      splash.classList.add("fade-out");
      document.body.classList.remove("no-scroll");
    }, 1000);
  }
});
