(() => {
  "use strict";
  const button = document.getElementById("help-language");
  const initial = new URLSearchParams(location.search).get("lang");
  let language = initial === "en" || initial === "ja" ? initial : (localStorage.getItem("citrus-language") === "en" ? "en" : "ja");

  function render() {
    document.documentElement.lang = language;
    document.querySelectorAll("[data-lang]").forEach(element => {
      element.style.display = element.dataset.lang === language ? "block" : "none";
    });
    document.querySelectorAll("[data-text-ja]").forEach(element => {
      element.textContent = language === "ja" ? element.dataset.textJa : element.dataset.textEn;
    });
    button.textContent = language === "ja" ? "English" : "日本語";
    localStorage.setItem("citrus-language", language);
  }

  button.addEventListener("click", () => {
    language = language === "ja" ? "en" : "ja";
    render();
  });
  render();
})();
