import bigInt from 'big-integer'
import { findPrimitive, generatePrime, modPower } from './math'

function init() {
    let p, g
    const a = bigInt.randBetween(2, 2**16).toJSNumber()

    while(true) {
        p = generatePrime()
        if(!bigInt((p - 1) / 2).isPrime()) continue
        g = findPrimitive(p)
        if(g !== -1) break
    }

    const A = modPower(g, a, p)

    return {g, a, p, A}
}

function accept({g, p, A}) {
    const b = bigInt.randBetween(2, 2**16).toJSNumber()
    const B = modPower(g, b, p)

    const k = modPower(A, b, p)

    return {B, k}
}

function finish({B, a, p}) {
    return modPower(B, a, p)
}

const DiffieHallman =  { init, accept, finish }

export default DiffieHallman