/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        paper: "#EFF2ED",
        paperRaised: "#F8FAF6",
        ink: "#16241F",
        inkSoft: "#3B4A44",
        muted: "#6E7D75",
        line: "#D3DBD1",
        forest: "#2F6F4E",
        forestDeep: "#1F5138",
        amber: "#C7902E",
        amberSoft: "#EFDCB4"
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
