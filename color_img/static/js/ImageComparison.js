const slider = document.querySelector(".slider");
const beforeImage = document.querySelector(".before-image");
const sliderLine = document.querySelector(".slider-line");
const sliderIcon = document.querySelector(".slider-icon");

slider.addEventListener("input", (e) => {
  let sliderValue = e.target.value + "%";

  beforeImage.style.width = sliderValue;
  sliderLine.style.left = sliderValue;
  sliderIcon.style.left = sliderValue;
});

