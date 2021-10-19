const protectedHeaders = {
  // 'CSRF-Token': document.querySelector('meta[property="csrf-token"]').getAttribute('content'),
  Accept: "application/json",
  "Content-Type": "application/json",
};

export { protectedHeaders as default };
