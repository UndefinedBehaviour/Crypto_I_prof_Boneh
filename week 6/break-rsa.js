const n1 = 179769313486231590772930519078902473361797697894230657273430081157732675805505620686985379449212982959585501387537164015710139858647833778606925583497541085196591615128057575940752635007475935288710823649949940771895617054361149474865046711015101563940680527540071584560878577663743040086340742855278549092581n;
const n2 = 648455842808071669662824265346772278726343720706976263060439070378797308618081116462714015276061417569195587321840254520655424906719892428844841839353281972988531310511738648965962582821502504990264452100885281673303711142296421027840289307657458645233683357077834689715838646088239640236866252211790085787877n;
const n3 = 720062263747350425279564435525583738338084451473999841826653057981916355690188337790423408664187663938485175264994017897083524079135686877441155132015188279331812309091996246361896836573643119174094961348524639707885238799396839230364676670221627018353299443241192173812729276147530748597302192751375739387929n;
const cipherText = 22096451867410381776306561134883418017410069787892831071731839143676135600120538004282329650473509424343946219751512256465839967942889460764542040581564748988013734864120452325229320176487916666402997509188729971690526083222067771600019329260870009579993724077458967773697817571267229951148662959627934791540n;
const e = 65537n;

const sqrtCeil = v => {
  const newtonIteration = (n, x0) => {
    const x1 = ((n / x0) + x0) >> 1n;
    if (x0 === x1 || x0 === (x1 - 1n)) {
      return x0 * x0 - n ? x0 + 1n : x0;
    }
    return newtonIteration(n, x1);
  }
  return newtonIteration(v, 1n);
}

// challenge 1
(n => {
  const a = sqrtCeil(n); // avg of prime factors of n
  const x = sqrtCeil(a * a - n);
  const [p, q] = [a + x, a - x];
  console.log(p);
  console.log(q);
})(n1);

// challenge 2
(n => {
  let a = sqrtCeil(n);
  for (let i = 0; i < 1 << 20;  ++i) {
    const x = sqrtCeil(a * a - n);
    const [p, q] = [a + x, a - x];
    if (p * q === n) {
      console.log(p);
      console.log(q);
      break;
    }
    a++;
  }
})(n2);

// challenge 3
(n => {
  const a = sqrtCeil(n); // avg of 3p and 2q + 0.5
  const sum = a + a - 1n; // sum of 3p and 2q
  // 3p * (sum - 3p) = n
  // 3p = (sum +- sqrt(sum^2 - 4n))/2
  const p3 = (sum - sqrtCeil(sum * sum - 4n * n)) / 2n
  const q2 = sum - p3;
  const p = p3 / 3n;
  const q = q2 / 2n;
  console.log(p);
  console.log(q);
  console.log(q * p === n3);
})(6n * n3);

const extendedEuclidean = (a, b) => {
  return b ?
    (({z, s, t}) => ({ z, s: t - a / b * s, t: s }))(extendedEuclidean(b, a % b)) :
    { z: b, s: 0n, t: 1n };
};

const inverseModulo = (x, p) => (extendedEuclidean(x, p).t + p) % p;

// challenge 3
(n => {
  const a = sqrtCeil(n); // avg of 3p and 2q + 0.5
  const sum = a + a - 1n; // sum of 3p and 2q
  // 3p * (sum - 3p) = n
  // 3p = (sum + sqrt(sum^2 - 4n))/2
  const p3 = (sum - sqrtCeil(sum * sum - 4n * n)) / 2n
  const q2 = sum - p3;
  const p = p3 / 3n;
  const q = q2 / 2n;
  console.log(p);
  console.log(q);
  console.log(q * p === n3);
})(6n * n3);

const elevate = (a, c, p) => {
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

// challenge 4
(c => {
  const a = sqrtCeil(n1); // avg of prime factors of n
  const x = sqrtCeil(a * a - n1);
  const [p, q] = [a + x, a - x];
  const phi = (p - 1n) * (q - 1n);
  const d = inverseModulo(e, phi);
  const plainText = elevate(cipherText, d, n1);
  const plainTextHex = plainText.toString(16);
  console.log(plainTextHex.split('00')[1]);
  console.log(Buffer.from(plainTextHex.split('00')[1], 'hex').toString('utf8'));
  console.log(cipherText === elevate(plainText, e, n1));
})(cipherText);
