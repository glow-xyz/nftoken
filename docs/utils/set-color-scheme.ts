export const setColorScheme = () => {
  function setTheme(theme: "dark" | "light") {
    document.body.className = theme;
  }
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  setTheme(query.matches ? "dark" : "light");
  query.addEventListener("change", (event) => {
    setTheme(event.matches ? "dark" : "light");
  });
};
