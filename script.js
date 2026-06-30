const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const siteHeader = document.getElementById("siteHeader");
const langButtons = document.querySelectorAll(".lang-btn");
const translatable = document.querySelectorAll("[data-ka][data-en]");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const introExperience = document.getElementById("introExperience");
const introSkip = document.getElementById("introSkip");

/* MOBILE MENU */
navToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
  });
});

/* HEADER SCROLL */
function updateHeader() {
  siteHeader?.classList.toggle("scrolled", window.scrollY > 24);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

/* INTRO */
function closeIntro() {
  introExperience?.classList.add("hide");
}

if (introExperience) {
  window.addEventListener("load", () => {
    setTimeout(closeIntro, 2100);
  });

  introSkip?.addEventListener("click", closeIntro);
}

/* LANGUAGE SWITCH */
function setLanguage(lang) {
  document.documentElement.lang = lang;

  translatable.forEach((el) => {
    const value = el.dataset[lang];

    if (value) {
      el.innerHTML = value;
    }
  });

  langButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
  });

  localStorage.setItem("inviteLang", lang);
}

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setLanguage(btn.dataset.lang);
  });
});

setLanguage(localStorage.getItem("inviteLang") || "ka");

/* REVEAL ANIMATION */
const revealItems = document.querySelectorAll(
  ".reveal-block, .feat-card, .case-card, .service-row, .contact-form"
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealItems.forEach((item, index) => {
  item.classList.add("reveal-block");
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 0.06}s`;
  revealObserver.observe(item);
});

/* MAGNETIC BUTTONS */
document.querySelectorAll(".magnetic").forEach((el) => {
  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    el.style.transform = `translate(${x * 0.12}px, ${y * 0.22}px)`;
  });

  el.addEventListener("mouseleave", () => {
    el.style.transform = "";
  });
});

/* GOOGLE SHEETS FORM */
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwZZWDoWjTqf_-XvD1ogK36s15QNYbaD9dEyAel8NY1nN2ELyR1ylaTpo-SD5FqMmrvgA/exec";

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const currentLang = document.documentElement.lang || "ka";
  const submitBtn = contactForm.querySelector("button[type='submit']");

  formStatus.textContent =
    currentLang === "ka" ? "იგზავნება..." : "Sending...";

  submitBtn.disabled = true;

  const formData = new FormData(contactForm);

  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    service: formData.get("service"),
    message: formData.get("message"),
  };

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload),
    });

    formStatus.textContent =
      currentLang === "ka"
        ? "გმადლობთ, თქვენი მოთხოვნა წარმატებით გაიგზავნა. მალე დაგიკავშირდებით."
        : "Thank you! Your request has been sent successfully. We'll contact you soon.";

    contactForm.reset();
  } catch (error) {
    formStatus.textContent =
      currentLang === "ka"
        ? "შეცდომა დაფიქსირდა. გთხოვთ, სცადოთ ხელახლა."
        : "Something went wrong. Please try again.";
  } finally {
    submitBtn.disabled = false;
  }
});