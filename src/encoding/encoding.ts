import { createHash } from "crypto";

export interface Key { prvt: bigint, pblc: bigint }

export function strToBigint(s: string): bigint {
    let n = 0n;
    for (let i = 0; i < s.length; i++) {
        n = n << 8n;
        n += BigInt(s.charCodeAt(i));
    }
    return n;
}

export function bigintToBufferBE(n: bigint, bytes: number): Buffer {
    return Buffer.from(padHex(n.toString(16), bytes), 'hex');
}

export function bufferToBigints256BE(buffer: Buffer): bigint[] {
    if (buffer.length % 32 != 0) throw new Error('invalid size');
    return bufferToBigintsBE(buffer, 32);
}

export function bufferToBigintsBE(buffer: Buffer, size: number): bigint[] {
    const output: bigint[] = [];
    for (let i = 0; i < buffer.length;) {
        let n = 0n;
        for (let j = 0; j < size; j++) {
            n = (n << 8n) + BigInt(buffer[i++]);
        }
        output.push(n);
    }
    return output;
}

export function padHex(s: string, bytes: number): string {
    while (s.length < bytes * 2) s = '0' + s;
    return s;
}

export function hash(input: bigint, times: number = 1): bigint {
    let t = input;
    for (let i = 0; i < times; i++) {
        const s1 = padHex(t.toString(16), 32);
        const s2 = createHash('sha256').update(s1, 'hex').digest('hex');
        t = BigInt('0x' + s2);
    }
    return t;
}

export function hashPair(inputA: bigint, inputB: bigint): bigint {
    const s = padHex(inputA.toString(16), 32) + padHex(inputB.toString(16), 32);
    return BigInt('0x' + createHash('sha256')
        .update(s, 'hex')
        .digest('hex'));
}

export function bitsToBigint(bits: number[]): bigint {
    let n = 0n;
    for (let i = 0; i < bits.length; i++) {
        n += BigInt(bits[i]) << BigInt(i);
    }
    return n;
}

export function nibblesToBigint(nibbles: number[]): bigint {
    let n = 0n;
    for (let i = 0; i < nibbles.length; i++) {
        n += BigInt(nibbles[i]) << BigInt(i * 3);
    }
    return n;
}

export function _256To32LE(n: bigint): bigint[] {
    const r: bigint[] = [];
    for (let i = 0; i < 8; i++) {
        r.push(n & 0xffffffffn);
        n = n >> 32n;
    }
    return r;
}

export function _256To32BE(n: bigint): bigint[] {
    const r: bigint[] = [];
    const s = padHex(n.toString(16), 32);
    for (let i = 0; i < 8; i++) {
        r.push(BigInt('0x' + s.slice(i * 8, i * 8 + 8)));
    }
    return r;
}

export function _32To256LE(na: bigint[]): bigint {
    let n = 0n;
    for (let i = 0; i < 8; i++) {
        n += na[i] << BigInt(i * 32);
    }
    return n;
}

export function _32To256BE(na: bigint[]): bigint {
    let n = 0n;
    for (let i = 0; i < 8; i++) {
        n = n << 32n;
        n += na[i];
    }
    return n;
}
