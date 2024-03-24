(async () => {
  const src = browser.runtime.getURL('content_script.js');
  await import(src);
})();
