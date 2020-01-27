const hideJar = function() {
  const jar = document.getElementById("waterJar");
  jar.style.visibility = "hidden";
  setTimeout(() => {
    jar.removeAttribute("style");
  }, 1 * 1000);
};
