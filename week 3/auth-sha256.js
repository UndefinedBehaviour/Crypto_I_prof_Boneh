const fs = require('fs');
const crypto = require('crypto');

const filePath = '../../../Downloads/6.1.intro.mp4';
const chunkSize = 1024;

const fd = fs.openSync(filePath);
const fileSize = fs.statSync(filePath).size;
let startPos = fileSize - fileSize % chunkSize;
let hash = Buffer.alloc(0);

while(startPos >= 0) {
  const buf = Buffer.alloc(Math.min(chunkSize, fileSize - startPos));
  fs.readSync(fd, buf, 0, buf.length, startPos);
  hash = crypto.createHash('sha256').update(buf).update(hash).digest();
  startPos -= chunkSize;
}

console.log(hash.toString('hex'));
