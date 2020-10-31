const cbcCiphers = [
  '4ca00ff4c898d61e1edbf1800618fb2828a226d160dad07883d04e008a7897ee2e4b7465d5290d0c0e6c6822236e1daafb94ffe0c5da05d9476be028ad7c1d81',
  '5b68629feb8606f9a6667670b75b38a5b4832d0f26e1ab7da33249de7d4afc48e713ac646ace36e872ad5fb8a512428a6e21364b0c374df45503473c5242a253'
];

const ctrCiphers = [
  '69dda8455c7dd4254bf353b773304eec0ec7702330098ce7f7520d1cbbb20fc388d1b0adb5054dbd7370849dbf0b88d393f252e764f1f5f7ad97ef79d59ce29f5f51eeca32eabedd9afa9329',
  '770b80259ec33beb2561358a9f2dc617e46218c0a53cbeca695ae45faa8952aa0e311bde9d4e01726d3184c34451'
];

const cbcKey = '140b41b22a29beb4061bda66b6747e14';
const ctrKey = '36f18357be4dbd77f050515c73fcf9f2';

const crypto = require('crypto');

const createDecryptBlock = key => {
  let decrypted = '';
  const decipher = crypto.createDecipheriv(
    'aes-128-ecb',
    hexStringToArray(key),
    null
  );
  decipher.on('data', chunk => {
    console.log(`Received ${chunk.length} bytes of data.`);
    console.log(chunk);
  });
  return block => {
    decipher.write(block, 'hex');
    return decrypted;
  };
};

const cbcDecrypt = (cipherText, key) => {
  const buf = Buffer.from(cipherText, 'hex');
  const iv = hexStringToArray(cipherTextBlocks.splice(0, 1));
  const ss = createDecryptBlock(cbcKey);

  const res = [];
  for(let i = 0; i < cipherTextBlocks.length; ++i) {
    console.log('in for')
    console.log(cipherTextBlocks[i])
    res.push(ss(cipherTextBlocks[i]));
  }
  return res;
};

const hexStringToArray = hexString => Uint8Array.from(Array.from(hexString).reduce((acc, val, i) => i % 2 ? (acc[i >> 1]+=parseInt(val, 16), acc) : (acc.push(parseInt(val, 16) << 4), acc), []));

const cipherTextBlocks = cbcCiphers[0].match(/.{16}/g);





const ctrDecrypt = (cipherText, key) => {

};

//console.log(cbcDecrypt(cbcCiphers[0], '140b41b22a29beb4061bda66b6747e14'));
const buf = Buffer.from(cbcCiphers[0], 'hex');
//console.log(buf.toString('hex'))
//console.log(cbcDecrypt(cbcCiphers[1], '140b41b22a29beb4061bda66b6747e14'));


const b = Buffer.from(cbcCiphers[1] + '00', 'hex');
const k = Buffer.from(cbcKey, 'hex');

const decipher = crypto.createDecipheriv(
  'aes-128-ecb', k, null
);
let c;
decipher.on('data', chunk => {
  console.log(`Received ${chunk.length} bytes of data.`);
  console.log(chunk);
  c = chunk;
});
decipher.write(b, 'hex');

const d = Buffer.alloc(c.length - 1, 0);
for(let i = 16; i < d.length; ++i) {
  d[i] = b[i-16] ^ c[i];
}

console.log(b);
console.log(c);
console.log(d);
console.log(d.toString('utf8'));


const y = Buffer.from(ctrCiphers[1], 'hex');
const x = Buffer.from(ctrKey, 'hex');
const iv = Buffer.from(y.buffer, y.byteOffset, 16);
const z = Buffer.alloc(y.length - 16);

let w = Buffer.alloc(0);

for(let i = 16; i < y.length; i = i + 16) {
  const decipher = crypto.createCipheriv(
    'aes-128-ecb', x, null
  );
  decipher.on('data', chunk => {
    console.log(`Received ${chunk.length} bytes of data.`);
    console.log(chunk);
    w = Buffer.concat([w, chunk]);
  });
  decipher.write(iv, 'hex');
  ++iv[15];
}

for(let i = 0; i < z.length; ++i) {
  z[i] = w[i] ^ y[i+16];
}

console.log(y);
console.log(x);
console.log(w.length);
console.log(w);
console.log(z.toString('utf8'));
