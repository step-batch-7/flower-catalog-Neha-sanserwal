// eslint-disable-next-line no-unused-vars
const hideJar = function() {
  // eslint-disable-next-line no-undef
  const jar = document.getElementById('waterJar');
  jar.style.visibility = 'hidden';
  const timeOut = 1000;
  setTimeout(() => {
    jar.removeAttribute('style');
  }, timeOut);
};
