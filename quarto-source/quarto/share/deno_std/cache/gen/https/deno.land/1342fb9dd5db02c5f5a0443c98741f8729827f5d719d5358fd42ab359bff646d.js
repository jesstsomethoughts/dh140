// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
/*!
 * Adapted directly from negotiator at https://github.com/jshttp/negotiator/
 * which is licensed as follows:
 *
 * (The MIT License)
 *
 * Copyright (c) 2012-2014 Federico Romero
 * Copyright (c) 2012-2014 Isaac Z. Schlueter
 * Copyright (c) 2014-2015 Douglas Christopher Wilson
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */ import { compareSpecs, isQuality } from "./common.ts";
const simpleEncodingRegExp = /^\s*([^\s;]+)\s*(?:;(.*))?$/;
function parseEncoding(str, i) {
    const match = simpleEncodingRegExp.exec(str);
    if (!match) {
        return undefined;
    }
    const encoding = match[1];
    let q = 1;
    if (match[2]) {
        const params = match[2].split(";");
        for (const param of params){
            const p = param.trim().split("=");
            if (p[0] === "q") {
                q = parseFloat(p[1]);
                break;
            }
        }
    }
    return {
        encoding,
        q,
        i
    };
}
function specify(encoding, spec, i = -1) {
    if (!spec.encoding) {
        return;
    }
    let s = 0;
    if (spec.encoding.toLocaleLowerCase() === encoding.toLocaleLowerCase()) {
        s = 1;
    } else if (spec.encoding !== "*") {
        return;
    }
    return {
        i,
        o: spec.i,
        q: spec.q,
        s
    };
}
function parseAcceptEncoding(accept) {
    const accepts = accept.split(",");
    const parsedAccepts = [];
    let hasIdentity = false;
    let minQuality = 1;
    for(let i = 0; i < accepts.length; i++){
        const encoding = parseEncoding(accepts[i].trim(), i);
        if (encoding) {
            parsedAccepts.push(encoding);
            hasIdentity = hasIdentity || !!specify("identity", encoding);
            minQuality = Math.min(minQuality, encoding.q || 1);
        }
    }
    if (!hasIdentity) {
        parsedAccepts.push({
            encoding: "identity",
            q: minQuality,
            i: accepts.length - 1
        });
    }
    return parsedAccepts;
}
function getEncodingPriority(encoding, accepted, index) {
    let priority = {
        o: -1,
        q: 0,
        s: 0,
        i: 0
    };
    for (const s of accepted){
        const spec = specify(encoding, s, index);
        if (spec && (priority.s - spec.s || priority.q - spec.q || priority.o - spec.o) < 0) {
            priority = spec;
        }
    }
    return priority;
}
/** Given an `Accept-Encoding` string, parse out the encoding returning a
 * negotiated encoding based on the `provided` encodings otherwise just a
 * prioritized array of encodings. */ export function preferredEncodings(accept, provided) {
    const accepts = parseAcceptEncoding(accept);
    if (!provided) {
        return accepts.filter(isQuality).sort(compareSpecs).map((spec)=>spec.encoding);
    }
    const priorities = provided.map((type, index)=>getEncodingPriority(type, accepts, index));
    return priorities.filter(isQuality).sort(compareSpecs).map((priority)=>provided[priorities.indexOf(priority)]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE1My4wL2h0dHAvX25lZ290aWF0aW9uL2VuY29kaW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vKiFcbiAqIEFkYXB0ZWQgZGlyZWN0bHkgZnJvbSBuZWdvdGlhdG9yIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9qc2h0dHAvbmVnb3RpYXRvci9cbiAqIHdoaWNoIGlzIGxpY2Vuc2VkIGFzIGZvbGxvd3M6XG4gKlxuICogKFRoZSBNSVQgTGljZW5zZSlcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTItMjAxNCBGZWRlcmljbyBSb21lcm9cbiAqIENvcHlyaWdodCAoYykgMjAxMi0yMDE0IElzYWFjIFouIFNjaGx1ZXRlclxuICogQ29weXJpZ2h0IChjKSAyMDE0LTIwMTUgRG91Z2xhcyBDaHJpc3RvcGhlciBXaWxzb25cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbiAqIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuICogJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuICogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG4gKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbiAqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcbiAqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC5cbiAqIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZXG4gKiBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULFxuICogVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEVcbiAqIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbmltcG9ydCB7IGNvbXBhcmVTcGVjcywgaXNRdWFsaXR5LCBTcGVjaWZpY2l0eSB9IGZyb20gXCIuL2NvbW1vbi50c1wiO1xuXG5pbnRlcmZhY2UgRW5jb2RpbmdTcGVjaWZpY2l0eSBleHRlbmRzIFNwZWNpZmljaXR5IHtcbiAgZW5jb2Rpbmc/OiBzdHJpbmc7XG59XG5cbmNvbnN0IHNpbXBsZUVuY29kaW5nUmVnRXhwID0gL15cXHMqKFteXFxzO10rKVxccyooPzo7KC4qKSk/JC87XG5cbmZ1bmN0aW9uIHBhcnNlRW5jb2RpbmcoXG4gIHN0cjogc3RyaW5nLFxuICBpOiBudW1iZXIsXG4pOiBFbmNvZGluZ1NwZWNpZmljaXR5IHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgbWF0Y2ggPSBzaW1wbGVFbmNvZGluZ1JlZ0V4cC5leGVjKHN0cik7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgY29uc3QgZW5jb2RpbmcgPSBtYXRjaFsxXTtcbiAgbGV0IHEgPSAxO1xuICBpZiAobWF0Y2hbMl0pIHtcbiAgICBjb25zdCBwYXJhbXMgPSBtYXRjaFsyXS5zcGxpdChcIjtcIik7XG4gICAgZm9yIChjb25zdCBwYXJhbSBvZiBwYXJhbXMpIHtcbiAgICAgIGNvbnN0IHAgPSBwYXJhbS50cmltKCkuc3BsaXQoXCI9XCIpO1xuICAgICAgaWYgKHBbMF0gPT09IFwicVwiKSB7XG4gICAgICAgIHEgPSBwYXJzZUZsb2F0KHBbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBlbmNvZGluZywgcSwgaSB9O1xufVxuXG5mdW5jdGlvbiBzcGVjaWZ5KFxuICBlbmNvZGluZzogc3RyaW5nLFxuICBzcGVjOiBFbmNvZGluZ1NwZWNpZmljaXR5LFxuICBpID0gLTEsXG4pOiBTcGVjaWZpY2l0eSB8IHVuZGVmaW5lZCB7XG4gIGlmICghc3BlYy5lbmNvZGluZykge1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgcyA9IDA7XG4gIGlmIChzcGVjLmVuY29kaW5nLnRvTG9jYWxlTG93ZXJDYXNlKCkgPT09IGVuY29kaW5nLnRvTG9jYWxlTG93ZXJDYXNlKCkpIHtcbiAgICBzID0gMTtcbiAgfSBlbHNlIGlmIChzcGVjLmVuY29kaW5nICE9PSBcIipcIikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaSxcbiAgICBvOiBzcGVjLmksXG4gICAgcTogc3BlYy5xLFxuICAgIHMsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHBhcnNlQWNjZXB0RW5jb2RpbmcoYWNjZXB0OiBzdHJpbmcpOiBFbmNvZGluZ1NwZWNpZmljaXR5W10ge1xuICBjb25zdCBhY2NlcHRzID0gYWNjZXB0LnNwbGl0KFwiLFwiKTtcbiAgY29uc3QgcGFyc2VkQWNjZXB0czogRW5jb2RpbmdTcGVjaWZpY2l0eVtdID0gW107XG4gIGxldCBoYXNJZGVudGl0eSA9IGZhbHNlO1xuICBsZXQgbWluUXVhbGl0eSA9IDE7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY2NlcHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZW5jb2RpbmcgPSBwYXJzZUVuY29kaW5nKGFjY2VwdHNbaV0udHJpbSgpLCBpKTtcblxuICAgIGlmIChlbmNvZGluZykge1xuICAgICAgcGFyc2VkQWNjZXB0cy5wdXNoKGVuY29kaW5nKTtcbiAgICAgIGhhc0lkZW50aXR5ID0gaGFzSWRlbnRpdHkgfHwgISFzcGVjaWZ5KFwiaWRlbnRpdHlcIiwgZW5jb2RpbmcpO1xuICAgICAgbWluUXVhbGl0eSA9IE1hdGgubWluKG1pblF1YWxpdHksIGVuY29kaW5nLnEgfHwgMSk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFoYXNJZGVudGl0eSkge1xuICAgIHBhcnNlZEFjY2VwdHMucHVzaCh7XG4gICAgICBlbmNvZGluZzogXCJpZGVudGl0eVwiLFxuICAgICAgcTogbWluUXVhbGl0eSxcbiAgICAgIGk6IGFjY2VwdHMubGVuZ3RoIC0gMSxcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBwYXJzZWRBY2NlcHRzO1xufVxuXG5mdW5jdGlvbiBnZXRFbmNvZGluZ1ByaW9yaXR5KFxuICBlbmNvZGluZzogc3RyaW5nLFxuICBhY2NlcHRlZDogU3BlY2lmaWNpdHlbXSxcbiAgaW5kZXg6IG51bWJlcixcbik6IFNwZWNpZmljaXR5IHtcbiAgbGV0IHByaW9yaXR5OiBTcGVjaWZpY2l0eSA9IHsgbzogLTEsIHE6IDAsIHM6IDAsIGk6IDAgfTtcblxuICBmb3IgKGNvbnN0IHMgb2YgYWNjZXB0ZWQpIHtcbiAgICBjb25zdCBzcGVjID0gc3BlY2lmeShlbmNvZGluZywgcywgaW5kZXgpO1xuXG4gICAgaWYgKFxuICAgICAgc3BlYyAmJlxuICAgICAgKHByaW9yaXR5LnMhIC0gc3BlYy5zISB8fCBwcmlvcml0eS5xIC0gc3BlYy5xIHx8XG4gICAgICAgICAgcHJpb3JpdHkubyEgLSBzcGVjLm8hKSA8XG4gICAgICAgIDBcbiAgICApIHtcbiAgICAgIHByaW9yaXR5ID0gc3BlYztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcHJpb3JpdHk7XG59XG5cbi8qKiBHaXZlbiBhbiBgQWNjZXB0LUVuY29kaW5nYCBzdHJpbmcsIHBhcnNlIG91dCB0aGUgZW5jb2RpbmcgcmV0dXJuaW5nIGFcbiAqIG5lZ290aWF0ZWQgZW5jb2RpbmcgYmFzZWQgb24gdGhlIGBwcm92aWRlZGAgZW5jb2RpbmdzIG90aGVyd2lzZSBqdXN0IGFcbiAqIHByaW9yaXRpemVkIGFycmF5IG9mIGVuY29kaW5ncy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmVmZXJyZWRFbmNvZGluZ3MoXG4gIGFjY2VwdDogc3RyaW5nLFxuICBwcm92aWRlZD86IHN0cmluZ1tdLFxuKTogc3RyaW5nW10ge1xuICBjb25zdCBhY2NlcHRzID0gcGFyc2VBY2NlcHRFbmNvZGluZyhhY2NlcHQpO1xuXG4gIGlmICghcHJvdmlkZWQpIHtcbiAgICByZXR1cm4gYWNjZXB0c1xuICAgICAgLmZpbHRlcihpc1F1YWxpdHkpXG4gICAgICAuc29ydChjb21wYXJlU3BlY3MpXG4gICAgICAubWFwKChzcGVjKSA9PiBzcGVjLmVuY29kaW5nISk7XG4gIH1cblxuICBjb25zdCBwcmlvcml0aWVzID0gcHJvdmlkZWQubWFwKCh0eXBlLCBpbmRleCkgPT5cbiAgICBnZXRFbmNvZGluZ1ByaW9yaXR5KHR5cGUsIGFjY2VwdHMsIGluZGV4KVxuICApO1xuXG4gIHJldHVybiBwcmlvcml0aWVzXG4gICAgLmZpbHRlcihpc1F1YWxpdHkpXG4gICAgLnNvcnQoY29tcGFyZVNwZWNzKVxuICAgIC5tYXAoKHByaW9yaXR5KSA9PiBwcm92aWRlZFtwcmlvcml0aWVzLmluZGV4T2YocHJpb3JpdHkpXSk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNEJDLEdBRUQsU0FBUyxZQUFZLEVBQUUsU0FBUyxRQUFxQixhQUFhLENBQUM7QUFNbkUsTUFBTSxvQkFBb0IsZ0NBQWdDLEFBQUM7QUFFM0QsU0FBUyxhQUFhLENBQ3BCLEdBQVcsRUFDWCxDQUFTLEVBQ3dCO0lBQ2pDLE1BQU0sS0FBSyxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQUFBQztJQUM3QyxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1YsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUVELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQUFBQztJQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLEFBQUM7SUFDVixJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNaLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEFBQUM7UUFDbkMsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLENBQUU7WUFDMUIsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQUFBQztZQUNsQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBQ2hCLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLE1BQU07WUFDUixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPO1FBQUUsUUFBUTtRQUFFLENBQUM7UUFBRSxDQUFDO0tBQUUsQ0FBQztBQUM1QixDQUFDO0FBRUQsU0FBUyxPQUFPLENBQ2QsUUFBZ0Is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