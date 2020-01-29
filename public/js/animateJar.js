const hideJar = function() {
  const jar = document.getElementById('waterJar');
  jar.style.visibility = 'hidden';
  const timeOut = 1000;
  setTimeout(() => {
    jar.removeAttribute('style');
  }, timeOut);
};
