const http = require('http');

const targetPrefix = 'http://crypto-class.appspot.com/po?er='
const cipherText = 'f20bdba6ff29eed7b046d1df9fb7000058b1ffb4210a580f748b4ac714c001bd4a61044426fb515dad3f21f18aa577c0bdf302936266926ff37dbf7035d5eeb4';

const cipherTextBufOriginal = Buffer.from(cipherText, 'hex');
let cipherTextBuf = Buffer.from(cipherText, 'hex');

const BLOCK_SIZE_IN_BYTES = 16;

const MESSAGE_SIZE_IN_BLOCKS = cipherTextBuf.length / BLOCK_SIZE_IN_BYTES;

if (!Promise.any) {
  //Promise.any = promises => new Promise(res => promises.forEach(p => p.then(res)));
  Promise.any = promises => Promise.allSettled(promises).then(
    results => {
      const found = results.find(({status}) => status === 'fulfilled');
      if (found) return Promise.resolve(found.value);
      return Promise.reject(results[0].reason);
    }
  );
}

function testByte(val, pos) {
  return new Promise((resolve, reject) => {
    const bup = cipherTextBuf[pos];
    cipherTextBuf[pos] = val;
    http.get(targetPrefix + cipherTextBuf.toString('hex'), ({statusCode}) => {
      if (statusCode === 404) {
        resolve({val, pos});
      }
      if (statusCode === 200 && pos % 16 !== 15) {
        resolve({val, pos});
      }
      reject({pos});
    });
  })
};

function byteAtPosition(position) {
  const promises = [];
  for (let j = 0; j < 256; ++j) {
    promises.push(testByte(j, position))
  }
  return Promise.any(promises);
}

function findBlock(n) {
  cipherTextBuf = Buffer.from(cipherText, 'hex');
  cipherTextBuf = cipherTextBuf.slice(0, BLOCK_SIZE_IN_BYTES * (n+1));
  plainTextBuf = Buffer.alloc(BLOCK_SIZE_IN_BYTES);
  let position = cipherTextBuf.length - BLOCK_SIZE_IN_BYTES - 1;
  let p = byteAtPosition(position);
  let isPadding = true;
  let i = 2, j = 2;
  while (i < 17) {
    p = p.then(({val, pos}) => {
      cipherTextBuf[pos] = val;
      plainTextBuf[pos % BLOCK_SIZE_IN_BYTES] = val ^ (j - 1) ^ cipherTextBufOriginal[pos];
      if (isPadding) {
        for (let z = 0; z < j - 1; ++z) {
          cipherTextBuf[pos + z] ^= (j - 1) ^ j;
        }
        j++;
      }
      console.log(val);
      console.log(plainTextBuf[pos % BLOCK_SIZE_IN_BYTES] + ' ' + pos);
      return byteAtPosition(pos - 1)
    }).catch(({pos}) => {
      isPadding = false;
      for (let z = 0; z < j - 2; ++z) {
        cipherTextBuf[pos + 1 +z] ^= (j - 2) ^ (j-1);
      }
      return byteAtPosition(pos)});
    ++i;
  };
  return p.then(({val, pos}) => {
    cipherTextBuf[pos] = val;
    plainTextBuf[pos % BLOCK_SIZE_IN_BYTES] = val ^ (j - 1) ^ cipherTextBufOriginal[pos];
    return Promise.resolve(plainTextBuf);
  });
};

let plainText = '';

(z = j => findBlock(j).then((block) => {
  plainText += block.toString('utf8');
  if (j < MESSAGE_SIZE_IN_BLOCKS - 1)
    return z(++j);
  else
    console.log(plainText);
}))(1); // start at block 1 (block 0 is the iv)
