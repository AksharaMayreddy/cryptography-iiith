// Random number generator - requires a PRNG backend, e.g. prng4.js

// For best results, put code like
// <body onClick='rng_seed_time();' onKeyPress='rng_seed_time();'>
// in your main HTML document.

var rng_state;
var rngPool;
var rngPptr;

// Mix in a 32-bit integer into the pool
function rng_seed_int(x) {
  rngPool[rngPptr++] ^= x & 255;
  rngPool[rngPptr++] ^= (x >> 8) & 255;
  rngPool[rngPptr++] ^= (x >> 16) & 255;
  rngPool[rngPptr++] ^= (x >> 24) & 255;
  if(rngPptr >= rng_psize) rngPptr -= rng_psize;
}

// Mix in the current time (w/milliseconds) into the pool
function rng_seed_time() {
  rng_seed_int(new Date().getTime());
}

// Initialize the pool with junk if needed.
if(rngPool == null) {
  rngPool = new Array();
  rngPptr = 0;
  var t;
  if(navigator.appName == "Netscape" && navigator.appVersion < "5" && window.crypto) {
    // Extract entropy (256 bits) from NS4 RNG if available
    var z = window.crypto.random(32);
    for(t = 0; t < z.length; ++t)
      rngPool[rngPptr++] = z.charCodeAt(t) & 255;
  }  
  while(rngPptr < rng_psize) {  // extract some randomness from Math.random()
    t = Math.floor(65536 * Math.random());
    rngPool[rngPptr++] = t >>> 8;
    rngPool[rngPptr++] = t & 255;
  }
  rngPptr = 0;
  rng_seed_time();
  //rng_seed_int(window.screenX);
  //rng_seed_int(window.screenY);
}

function rng_get_byte() {
  if(rng_state == null) {
    rng_seed_time();
    rng_state = prng_newstate();
    rng_state.init(rngPool);
    for(rngPptr = 0; rngPptr < rngPool.length; ++rngPptr)
      rngPool[rngPptr] = 0;
    rngPptr = 0;
    //rng_pool = null;
  }
  // TODO: allow reseeding after first request
  return rng_state.next();
}

function rng_get_bytes(ba) {
  var i;
  for(i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
}

function SecureRandom() {}

SecureRandom.prototype.nextBytes = rng_get_bytes;
