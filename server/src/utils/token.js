function getTokenNumber(token) {
  const match = String(token || '').match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function formatToken(number) {
  return `T-${number}`;
}

function nextToken(lastToken) {
  return formatToken(getTokenNumber(lastToken) + 1 || 1);
}

module.exports = { getTokenNumber, formatToken, nextToken };