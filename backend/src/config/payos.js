const { PayOS } = require('@payos/node');
const env = require("./env");

// Initialize PayOS client
const payOS = new PayOS({
  clientId: env.PAYOS_CLIENT_ID,
  apiKey: env.PAYOS_API_KEY,
  checksumKey: env.PAYOS_CHECKSUM_KEY,
});

module.exports = { payOS };
