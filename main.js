import './src/style.css'

console.log('Jeefry Nicolas Archila Romero - Resume');

// Typewriter Effect
const typewriterElement = document.getElementById('typewriter');
const textToType = "https://coralgamer.github.io/hojadevida/";
let index = 0;
let isTyping = false;

function type() {
  if (index < textToType.length) {
    typewriterElement.textContent += textToType.charAt(index);
    index++;
    setTimeout(type, 100);
  }
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !isTyping) {
      isTyping = true;
      type();
    }
  });
}, { threshold: 0.5 });

if (typewriterElement) {
  observer.observe(typewriterElement);
}
