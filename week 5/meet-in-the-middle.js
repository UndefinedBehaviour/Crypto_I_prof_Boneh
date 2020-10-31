const fs = require('fs');
const v8 = require('v8');

const p = 13407807929942597099574024998205846127479365820592393377723561443721764030073546976801874298166903427690031858186486050853753882811946569946433649006084171n;
const g = 11717829880366207009516117596335367088558084999998952205599979459063929499736583746670572176471460312928594829675428279466566527115212748467589894601965568n;
const h = 3239475104050450443565264378728065788649097520952449527834792452971981976143292558073856937958553180532878928001494706097394108577585732452307673444020333n;

const extendedEuclidean = (a, b) => {
  return b ?
    (({z, s, t}) => ({ z, s: t - a / b * s, t: s }))(extendedEuclidean(b, a % b)) :
    { z: b, s: 0n, t: 1n };
};

const inverseModulo = (x, p) => (extendedEuclidean(x, p).t + p) % p;

const hashT = Array(1 << 20);
let tempVal = 1n;
for (let i = 0; i < 1 << 20; ++i) {
  if (!(i % (1 << 13))) console.log(i);
  hashT[i] = (h * inverseModulo(tempVal, p)) % p;
  tempVal *= g;
  tempVal %= p;
}
console.log('done');

const hashS = new Set(hashT);

let g_b = 1n;
for (let i = 0; i < 1 << 20; ++i) {
  g_b *= g;
  g_b %= p;
}
console.log('g_b computed')

let res;
tempVal = 1n;
let x0 = x1 = -1;
for (let i = 0; i < 1 << 20; ++i) {
  if(hashS.has(tempVal)) {
    x0 = i;
    for (let j = 0; j < 1 << 20; ++j) {
      if (tempVal === hashT[j]) {
        x1 = j;
        break;
      };
    }
  }
  if (x1 > -1) {
    res = x0 * (1 << 20) + x1;
    break;
  }
  tempVal *= g_b;
  tempVal %= p;
}

console.log(res)

const elevate = (a, c) => {
  let mul = a;
  let res = 1n;
  let b = BigInt(c);
  while (b) {
    if (b % 2n) {
      res *= mul;
      res %= p;
    }
    b >>= 1n;
    mul *= mul;
    mul %= p;
  }
  return res;
};

console.log(elevate(g, res))
console.log(h)
