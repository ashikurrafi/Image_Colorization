//Toggle Script for Mobile Menu
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

menuBtn.addEventListener("click", () => {
  if (mobileMenu.classList.contains("hidden")) {
    mobileMenu.classList.remove("hidden");
    mobileMenu.classList.add("flex", "translate-y-0", "opacity-100");
  } else {
    mobileMenu.classList.add("hidden");
    mobileMenu.classList.remove("flex", "translate-y-0", "opacity-100");
  }
});
