import { Bitcoin } from "../generator/step3/bitcoin";
import { getcontrolBlock } from "./equivocation-tapnode";

export enum CodecType {
    lamport = 'lamport',
    winternitz32 = 'winternitz32',
    winternitz256 = 'winternitz256',
}


export interface DecodeData {
    data: Buffer;
}
export interface DecodeError {
    error: string;
}
export interface Decodeconflict {
    index: number;
    prv1: Buffer;
    prv2: Buffer;
    script: Buffer
}



export abstract class CodecProvider {
    public folder: string;
    public codecType: CodecType;
    public valuesPerUnit: number;
    public prvToPubHashCount: number;
    public hashsInUnit: number;
    public tmpInnerPubKey: Buffer
    public prvKeyFileName: string;
    public pubKeyFileName: string;
    public cacheFileName: string;



    constructor(folder: string,
        codecType: CodecType,
        valuesPerUnit: number,
        prvToPubHashCount: number,
        hashsInUnit: number,
        tmpInnerPubKey: Buffer,
        prvKeyFileName: string,
        pubKeyFileName: string,
        cacheFileName: string) {

        this.folder = folder;
        this.codecType = codecType;
        this.valuesPerUnit = valuesPerUnit;
        this.prvToPubHashCount = prvToPubHashCount;
        this.hashsInUnit = hashsInUnit
        this.tmpInnerPubKey = tmpInnerPubKey;
        this.prvKeyFileName = prvKeyFileName;
        this.pubKeyFileName = pubKeyFileName;
        this.cacheFileName = cacheFileName;
    }



    abstract computeKeySetsCount(sizeInEncodeUnits: number): number;
    abstract getKeySetsStartPosByUnitIndex(unitIndex: number): number;
    abstract getKeySetsLengthByDataSize(dataSizeInBytes: number, isDataEncoded?: boolean): number
    abstract getCacheSectionStart(unitIndex: number): number;
    abstract getCacheSectionLength(encodedSizeInBytes: number): number;
    abstract calculateCacheSize(): number;
    abstract getUnitCount(): number;

    abstract encodeBit(b: number, indexInBits: number): Buffer | never
    abstract encodeBuffer(data: Buffer, prvKeyBuffer: Buffer): Buffer;
    abstract decodeBuffer(encoded: Buffer, indexInUnits: number, pubKeySets: Buffer, cache: Buffer): DecodeData | DecodeError | Decodeconflict;
    abstract decodePrvByPub(encoded: Buffer, pubKeySets: Buffer): DecodeData | DecodeError;

    abstract generateEquivocationScript(bitcoin: Bitcoin, unitIndex: number): void;

    protected isEmpty(buffer: Buffer) {
        return buffer.compare(Buffer.alloc(buffer.length)) === 0;
    }

    public isConflict(iCache: Buffer, iEncoded: Buffer) {
        return !this.isEmpty(iCache) && iCache.compare(iEncoded) !== 0;
    }


    protected returnDecodedConflict(iCache: Buffer, iEncoded: Buffer, despuitedIndex: number): Decodeconflict {
        return {
            prv1: Buffer.from(iCache),
            prv2: Buffer.from(iEncoded),
            index: despuitedIndex,
            script: getcontrolBlock(
                this.tmpInnerPubKey,
                this,
                despuitedIndex)
        };
    }

    protected returnDecodedError(decodeError: string): DecodeError {
        return {
            error: decodeError
        };
    }

    protected returnDecodedSuccess(resultData: Buffer): DecodeData {
        return {
            data: resultData
        };
    }
}