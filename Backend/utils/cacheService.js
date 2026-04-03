// backend/utils/cacheService.js
import NodeCache from 'node-cache';

// stdTTL: 300 means the data stays fresh for 5 minutes (300 seconds)
const appCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export default appCache;