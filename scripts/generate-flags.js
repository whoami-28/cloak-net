const fs = require('fs');
const path = require('path');

const flagsDir = path.join(__dirname, '..', 'icons', 'flags');
if (!fs.existsSync(flagsDir)) {
  fs.mkdirSync(flagsDir, { recursive: true });
}

const flags = {
  nl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <rect width="640" height="160" fill="#ae1c28"/>
    <rect y="160" width="640" height="160" fill="#ffffff"/>
    <rect y="320" width="640" height="160" fill="#21468b"/>
  </svg>`,
  
  us: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <rect width="640" height="480" fill="#b22234"/>
    <path stroke="#fff" stroke-width="37" d="M0,55H640M0,129H640M0,203H640M0,277H640M0,351H640M0,425H640"/>
    <rect width="256" height="259" fill="#3c3b6e"/>
    <circle cx="128" cy="129" r="60" fill="#ffffff" opacity="0.9"/>
    <circle cx="128" cy="129" r="45" fill="#3c3b6e"/>
  </svg>`,

  de: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <rect width="640" height="160" fill="#000000"/>
    <rect y="160" width="640" height="160" fill="#dd0000"/>
    <rect y="320" width="640" height="160" fill="#ffce00"/>
  </svg>`,

  gb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <clipPath id="s"><path d="M0,0 v480 h640 v-480 z"/></clipPath>
    <path fill="#012169" d="M0,0 v480 h640 v-480 z"/>
    <path stroke="#fff" stroke-width="60" d="M0,0 L640,480 M640,0 L0,480"/>
    <path stroke="#c8102e" stroke-width="40" d="M0,0 L640,480 M640,0 L0,480"/>
    <path stroke="#fff" stroke-width="100" d="M320,0 v480 M0,240 h640"/>
    <path stroke="#c8102e" stroke-width="60" d="M320,0 v480 M0,240 h640"/>
  </svg>`,

  sg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <rect width="640" height="240" fill="#ed2939"/>
    <rect y="240" width="640" height="240" fill="#ffffff"/>
    <circle cx="120" cy="120" r="70" fill="#ffffff"/>
    <circle cx="145" cy="120" r="65" fill="#ed2939"/>
  </svg>`,

  fr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <rect width="213.3" height="480" fill="#002395"/>
    <rect x="213.3" width="213.4" height="480" fill="#ffffff"/>
    <rect x="426.7" width="213.3" height="480" fill="#ed2939"/>
  </svg>`,

  ca: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <rect width="160" height="480" fill="#ff0000"/>
    <rect x="160" width="320" height="480" fill="#ffffff"/>
    <rect x="480" width="160" height="480" fill="#ff0000"/>
    <path fill="#ff0000" d="M320,130 L340,190 L390,190 L350,225 L365,280 L320,250 L275,280 L290,225 L250,190 L300,190 Z"/>
  </svg>`,

  jp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
    <rect width="640" height="480" fill="#ffffff"/>
    <circle cx="320" cy="240" r="144" fill="#bc002d"/>
  </svg>`
};

Object.entries(flags).forEach(([code, svg]) => {
  fs.writeFileSync(path.join(flagsDir, `${code}.svg`), svg.trim());
});
console.log(`Generated ${Object.keys(flags).length} country flags.`);
