import bigInt from 'big-integer'

export function generatePrime() {
    let n = bigInt.randBetween(2**8, 2**22)
    while(true) {
        if(n.isPrime()) return n.toJSNumber()
            
        n = bigInt(n.add(1n))
    }
}

export function modPower(x, y, p) {
    let res = 1; 
 
    x = x % p; 
 
    while (y > 0) {

        if (y & 1)
            res = (res * x) % p;
 
        y = y >> 1;
        x = (x * x) % p;
    }
    return res;
}

export function findPrimefactors(s, n) {

    while (n % 2 === 0) {
        s.add(2);
        n = n / 2;
    }
 
    for (let i = 3; i <= Math.sqrt(n); i = i + 2) {

        while (n % i === 0) {
            s.add(i);
            n = n / i;
        }
    }
 
    if (n > 2)
        s.add(n);
}

export  
function findPrimitive(n) {
    let s = new Set();
 
    let phi = n - 1;
 
    findPrimefactors(s, phi);
    const primitives = []

    for (let r = 2; r <= phi; r++) {

        let flag = false
        for (let it of s) {
 
            if (modPower(r, phi / it, n) === 1) {
                flag = true
                primitives.push(r)
                break
            }
        }   

        if (flag === false && primitives.length === 100) {
            const primePrimitives = primitives.filter(pr => bigInt(pr).isPrime())

            return primePrimitives[bigInt.randBetween(0, primePrimitives.length - 1)];

        }
    }
 
    return -1
}
