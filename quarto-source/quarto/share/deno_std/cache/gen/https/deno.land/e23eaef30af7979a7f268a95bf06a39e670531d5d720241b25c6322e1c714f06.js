// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Converts the byte array to a UUID string
 * @param bytes Used to convert Byte to Hex
 */ export function bytesToUuid(bytes) {
    const bits = [
        ...bytes
    ].map((bit)=>{
        const s = bit.toString(16);
        return bit < 0x10 ? "0" + s : s;
    });
    return [
        ...bits.slice(0, 4),
        "-",
        ...bits.slice(4, 6),
        "-",
        ...bits.slice(6, 8),
        "-",
        ...bits.slice(8, 10),
        "-",
        ...bits.slice(10, 16), 
    ].join("");
}
/**
 * Converts a string to a byte array by converting the hex value to a number.
 * @param uuid Value that gets converted.
 */ export function uuidToBytes(uuid) {
    const bytes = [];
    uuid.replace(/[a-fA-F0-9]{2}/g, (hex)=>{
        bytes.push(parseInt(hex, 16));
        return "";
    });
    return bytes;
}
/**
 * Converts a string to a byte array using the char code.
 * @param str Value that gets converted.
 */ export function stringToBytes(str) {
    str = unescape(encodeURIComponent(str));
    const bytes = Array.from({
        length: str.length
    });
    for(let i = 0; i < str.length; i++){
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
}
/**
 * Creates a buffer for creating a SHA-1 hash.
 * @param content Buffer for SHA-1 hash.
 */ export function createBuffer(content) {
    const arrayBuffer = new ArrayBuffer(content.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for(let i = 0; i < content.length; i++){
        uint8Array[i] = content[i];
    }
    return arrayBuffer;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE1My4wL3V1aWQvX2NvbW1vbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBieXRlIGFycmF5IHRvIGEgVVVJRCBzdHJpbmdcbiAqIEBwYXJhbSBieXRlcyBVc2VkIHRvIGNvbnZlcnQgQnl0ZSB0byBIZXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ5dGVzVG9VdWlkKGJ5dGVzOiBudW1iZXJbXSB8IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICBjb25zdCBiaXRzID0gWy4uLmJ5dGVzXS5tYXAoKGJpdCkgPT4ge1xuICAgIGNvbnN0IHMgPSBiaXQudG9TdHJpbmcoMTYpO1xuICAgIHJldHVybiBiaXQgPCAweDEwID8gXCIwXCIgKyBzIDogcztcbiAgfSk7XG4gIHJldHVybiBbXG4gICAgLi4uYml0cy5zbGljZSgwLCA0KSxcbiAgICBcIi1cIixcbiAgICAuLi5iaXRzLnNsaWNlKDQsIDYpLFxuICAgIFwiLVwiLFxuICAgIC4uLmJpdHMuc2xpY2UoNiwgOCksXG4gICAgXCItXCIsXG4gICAgLi4uYml0cy5zbGljZSg4LCAxMCksXG4gICAgXCItXCIsXG4gICAgLi4uYml0cy5zbGljZSgxMCwgMTYpLFxuICBdLmpvaW4oXCJcIik7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBzdHJpbmcgdG8gYSBieXRlIGFycmF5IGJ5IGNvbnZlcnRpbmcgdGhlIGhleCB2YWx1ZSB0byBhIG51bWJlci5cbiAqIEBwYXJhbSB1dWlkIFZhbHVlIHRoYXQgZ2V0cyBjb252ZXJ0ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1dWlkVG9CeXRlcyh1dWlkOiBzdHJpbmcpOiBudW1iZXJbXSB7XG4gIGNvbnN0IGJ5dGVzOiBudW1iZXJbXSA9IFtdO1xuXG4gIHV1aWQucmVwbGFjZSgvW2EtZkEtRjAtOV17Mn0vZywgKGhleDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBieXRlcy5wdXNoKHBhcnNlSW50KGhleCwgMTYpKTtcbiAgICByZXR1cm4gXCJcIjtcbiAgfSk7XG5cbiAgcmV0dXJuIGJ5dGVzO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgc3RyaW5nIHRvIGEgYnl0ZSBhcnJheSB1c2luZyB0aGUgY2hhciBjb2RlLlxuICogQHBhcmFtIHN0ciBWYWx1ZSB0aGF0IGdldHMgY29udmVydGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nVG9CeXRlcyhzdHI6IHN0cmluZyk6IG51bWJlcltdIHtcbiAgc3RyID0gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KHN0cikpO1xuICBjb25zdCBieXRlcyA9IEFycmF5LmZyb208bnVtYmVyPih7IGxlbmd0aDogc3RyLmxlbmd0aCB9KTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBieXRlc1tpXSA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICB9XG4gIHJldHVybiBieXRlcztcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgYnVmZmVyIGZvciBjcmVhdGluZyBhIFNIQS0xIGhhc2guXG4gKiBAcGFyYW0gY29udGVudCBCdWZmZXIgZm9yIFNIQS0xIGhhc2guXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCdWZmZXIoY29udGVudDogbnVtYmVyW10pOiBBcnJheUJ1ZmZlciB7XG4gIGNvbnN0IGFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGNvbnRlbnQubGVuZ3RoKTtcbiAgY29uc3QgdWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb250ZW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgdWludDhBcnJheVtpXSA9IGNvbnRl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