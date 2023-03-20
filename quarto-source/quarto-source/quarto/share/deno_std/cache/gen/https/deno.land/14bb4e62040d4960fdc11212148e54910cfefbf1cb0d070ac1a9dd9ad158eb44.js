// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { assert } from "../../_util/assert.ts";
import { ERR_BARE_QUOTE, ERR_FIELD_COUNT, ERR_INVALID_DELIM, ERR_QUOTE, ParseError } from "./_io.ts";
export class Parser {
    #input = "";
    #cursor = 0;
    #options;
    constructor({ separator ="," , trimLeadingSpace =false , comment , lazyQuotes , fieldsPerRecord  } = {}){
        this.#options = {
            separator,
            trimLeadingSpace,
            comment,
            lazyQuotes,
            fieldsPerRecord
        };
    }
    #readLine() {
        if (this.#isEOF()) return null;
        if (!this.#input.startsWith("\r\n", this.#cursor) || !this.#input.startsWith("\n", this.#cursor)) {
            let buffer = "";
            let hadNewline = false;
            while(this.#cursor < this.#input.length){
                if (this.#input.startsWith("\r\n", this.#cursor)) {
                    hadNewline = true;
                    this.#cursor += 2;
                    break;
                }
                if (this.#input.startsWith("\n", this.#cursor)) {
                    hadNewline = true;
                    this.#cursor += 1;
                    break;
                }
                buffer += this.#input[this.#cursor];
                this.#cursor += 1;
            }
            if (!hadNewline && buffer.endsWith("\r")) {
                buffer = buffer.slice(0, -1);
            }
            return buffer;
        }
        return null;
    }
    #isEOF() {
        return this.#cursor >= this.#input.length;
    }
    #parseRecord(startLine) {
        let line = this.#readLine();
        if (line === null) return null;
        if (line.length === 0) {
            return [];
        }
        function runeCount(s) {
            // Array.from considers the surrogate pair.
            return Array.from(s).length;
        }
        let lineIndex = startLine + 1;
        // line starting with comment character is ignored
        if (this.#options.comment && line[0] === this.#options.comment) {
            return [];
        }
        assert(this.#options.separator != null);
        let fullLine = line;
        let quoteError = null;
        const quote = '"';
        const quoteLen = quote.length;
        const separatorLen = this.#options.separator.length;
        let recordBuffer = "";
        const fieldIndexes = [];
        parseField: for(;;){
            if (this.#options.trimLeadingSpace) {
                line = line.trimStart();
            }
            if (line.length === 0 || !line.startsWith(quote)) {
                // Non-quoted string field
                const i = line.indexOf(this.#options.separator);
                let field = line;
                if (i >= 0) {
                    field = field.substring(0, i);
                }
                // Check to make sure a quote does not appear in field.
                if (!this.#options.lazyQuotes) {
                    const j = field.indexOf(quote);
                    if (j >= 0) {
                        const col = runeCount(fullLine.slice(0, fullLine.length - line.slice(j).length));
                        quoteError = new ParseError(startLine + 1, lineIndex, col, ERR_BARE_QUOTE);
                        break parseField;
                    }
                }
                recordBuffer += field;
                fieldIndexes.push(recordBuffer.length);
                if (i >= 0) {
                    line = line.substring(i + separatorLen);
                    continue parseField;
                }
                break parseField;
            } else {
                // Quoted string field
                line = line.substring(quoteLen);
                for(;;){
                    const i1 = line.indexOf(quote);
                    if (i1 >= 0) {
                        // Hit next quote.
                        recordBuffer += line.substring(0, i1);
                        line = line.substring(i1 + quoteLen);
                        if (line.startsWith(quote)) {
                            // `""` sequence (append quote).
                            recordBuffer += quote;
                            line = line.substring(quoteLen);
                        } else if (line.startsWith(this.#options.separator)) {
                            // `","` sequence (end of field).
                            line = line.substring(separatorLen);
                            fieldIndexes.push(recordBuffer.length);
                            continue parseField;
                        } else if (0 === line.length) {
                            // `"\n` sequence (end of line).
                            fieldIndexes.push(recordBuffer.length);
                            break parseField;
                        } else if (this.#options.lazyQuotes) {
                            // `"` sequence (bare quote).
                            recordBuffer += quote;
                        } else {
                            // `"*` sequence (invalid non-escaped quote).
                            const col1 = runeCount(fullLine.slice(0, fullLine.length - line.length - quoteLen));
                            quoteError = new ParseError(startLine + 1, lineIndex, col1, ERR_QUOTE);
                            break parseField;
                        }
                    } else if (line.length > 0 || !this.#isEOF()) {
                        // Hit end of line (copy all data so far).
                        recordBuffer += line;
                        const r = this.#readLine();
                        lineIndex++;
                        line = r ?? ""; // This is a workaround for making this module behave similarly to the encoding/csv/reader.go.
                        fullLine = line;
                        if (r === null) {
                            // Abrupt end of file (EOF or error).
                            if (!this.#options.lazyQuotes) {
                                const col2 = runeCount(fullLine);
                                quoteError = new ParseError(startLine + 1, lineIndex, col2, ERR_QUOTE);
                                break parseField;
                            }
                            fieldIndexes.push(recordBuffer.length);
                            break parseField;
                        }
                        recordBuffer += "\n"; // preserve line feed (This is because TextProtoReader removes it.)
                    } else {
                        // Abrupt end of file (EOF on error).
                        if (!this.#options.lazyQuotes) {
                            const col3 = runeCount(fullLine);
                            quoteError = new ParseError(startLine + 1, lineIndex, col3, ERR_QUOTE);
                            break parseField;
                        }
                        fieldIndexes.push(recordBuffer.length);
                        break parseField;
                    }
                }
            }
        }
        if (quoteError) {
            throw quoteError;
        }
        const result = [];
        let preIdx = 0;
        for (const i2 of fieldIndexes){
            result.push(recordBuffer.slice(preIdx, i2));
            preIdx = i2;
        }
        return result;
    }
    parse(input) {
        this.#input = input;
        this.#cursor = 0;
        const result = [];
        let _nbFields;
        let lineResult;
        let first = true;
        let lineIndex = 0;
        const INVALID_RUNE = [
            "\r",
            "\n",
            '"'
        ];
        const options = this.#options;
        if (INVALID_RUNE.includes(options.separator) || typeof options.comment === "string" && INVALID_RUNE.includes(options.comment) || options.separator === options.comment) {
            throw new Error(ERR_INVALID_DELIM);
        }
        for(;;){
            const r = this.#parseRecord(lineIndex);
            if (r === null) break;
            lineResult = r;
            lineIndex++;
            // If fieldsPerRecord is 0, Read sets it to
            // the number of fields in the first record
            if (first) {
                first = false;
                if (options.fieldsPerRecord !== undefined) {
                    if (options.fieldsPerRecord === 0) {
                        _nbFields = lineResult.length;
                    } else {
                        _nbFields = options.fieldsPerRecord;
                    }
                }
            }
            if (lineResult.length > 0) {
                if (_nbFields && _nbFields !== lineResult.length) {
                    throw new ParseError(lineIndex, lineIndex, null, ERR_FIELD_COUNT);
                }
                result.push(lineResult);
            }
        }
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE1My4wL2VuY29kaW5nL2Nzdi9fcGFyc2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiLi4vLi4vX3V0aWwvYXNzZXJ0LnRzXCI7XG5pbXBvcnQge1xuICBFUlJfQkFSRV9RVU9URSxcbiAgRVJSX0ZJRUxEX0NPVU5ULFxuICBFUlJfSU5WQUxJRF9ERUxJTSxcbiAgRVJSX1FVT1RFLFxuICBQYXJzZUVycm9yLFxuICBSZWFkT3B0aW9ucyxcbn0gZnJvbSBcIi4vX2lvLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBQYXJzZXIge1xuICAjaW5wdXQgPSBcIlwiO1xuICAjY3Vyc29yID0gMDtcbiAgI29wdGlvbnM6IHtcbiAgICBzZXBhcmF0b3I6IHN0cmluZztcbiAgICB0cmltTGVhZGluZ1NwYWNlOiBib29sZWFuO1xuICAgIGNvbW1lbnQ/OiBzdHJpbmc7XG4gICAgbGF6eVF1b3Rlcz86IGJvb2xlYW47XG4gICAgZmllbGRzUGVyUmVjb3JkPzogbnVtYmVyO1xuICB9O1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgc2VwYXJhdG9yID0gXCIsXCIsXG4gICAgdHJpbUxlYWRpbmdTcGFjZSA9IGZhbHNlLFxuICAgIGNvbW1lbnQsXG4gICAgbGF6eVF1b3RlcyxcbiAgICBmaWVsZHNQZXJSZWNvcmQsXG4gIH06IFJlYWRPcHRpb25zID0ge30pIHtcbiAgICB0aGlzLiNvcHRpb25zID0ge1xuICAgICAgc2VwYXJhdG9yLFxuICAgICAgdHJpbUxlYWRpbmdTcGFjZSxcbiAgICAgIGNvbW1lbnQsXG4gICAgICBsYXp5UXVvdGVzLFxuICAgICAgZmllbGRzUGVyUmVjb3JkLFxuICAgIH07XG4gIH1cbiAgI3JlYWRMaW5lKCk6IHN0cmluZyB8IG51bGwge1xuICAgIGlmICh0aGlzLiNpc0VPRigpKSByZXR1cm4gbnVsbDtcblxuICAgIGlmIChcbiAgICAgICF0aGlzLiNpbnB1dC5zdGFydHNXaXRoKFwiXFxyXFxuXCIsIHRoaXMuI2N1cnNvcikgfHxcbiAgICAgICF0aGlzLiNpbnB1dC5zdGFydHNXaXRoKFwiXFxuXCIsIHRoaXMuI2N1cnNvcilcbiAgICApIHtcbiAgICAgIGxldCBidWZmZXIgPSBcIlwiO1xuICAgICAgbGV0IGhhZE5ld2xpbmUgPSBmYWxzZTtcbiAgICAgIHdoaWxlICh0aGlzLiNjdXJzb3IgPCB0aGlzLiNpbnB1dC5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHRoaXMuI2lucHV0LnN0YXJ0c1dpdGgoXCJcXHJcXG5cIiwgdGhpcy4jY3Vyc29yKSkge1xuICAgICAgICAgIGhhZE5ld2xpbmUgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuI2N1cnNvciArPSAyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLiNpbnB1dC5zdGFydHNXaXRoKFwiXFxuXCIsIHRoaXMuI2N1cnNvcilcbiAgICAgICAgKSB7XG4gICAgICAgICAgaGFkTmV3bGluZSA9IHRydWU7XG4gICAgICAgICAgdGhpcy4jY3Vyc29yICs9IDE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgYnVmZmVyICs9IHRoaXMuI2lucHV0W3RoaXMuI2N1cnNvcl07XG4gICAgICAgIHRoaXMuI2N1cnNvciArPSAxO1xuICAgICAgfVxuICAgICAgaWYgKCFoYWROZXdsaW5lICYmIGJ1ZmZlci5lbmRzV2l0aChcIlxcclwiKSkge1xuICAgICAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoMCwgLTEpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYnVmZmVyO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICAjaXNFT0YoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuI2N1cnNvciA+PSB0aGlzLiNpbnB1dC5sZW5ndGg7XG4gIH1cbiAgI3BhcnNlUmVjb3JkKHN0YXJ0TGluZTogbnVtYmVyKTogc3RyaW5nW10gfCBudWxsIHtcbiAgICBsZXQgbGluZSA9IHRoaXMuI3JlYWRMaW5lKCk7XG4gICAgaWYgKGxpbmUgPT09IG51bGwpIHJldHVybiBudWxsO1xuICAgIGlmIChsaW5lLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJ1bmVDb3VudChzOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgLy8gQXJyYXkuZnJvbSBjb25zaWRlcnMgdGhlIHN1cnJvZ2F0ZSBwYWlyLlxuICAgICAgcmV0dXJuIEFycmF5LmZyb20ocykubGVuZ3RoO1xuICAgIH1cblxuICAgIGxldCBsaW5lSW5kZXggPSBzdGFydExpbmUgKyAxO1xuXG4gICAgLy8gbGluZSBzdGFydGluZyB3aXRoIGNvbW1lbnQgY2hhcmFjdGVyIGlzIGlnbm9yZWRcbiAgICBpZiAodGhpcy4jb3B0aW9ucy5jb21tZW50ICYmIGxpbmVbMF0gPT09IHRoaXMuI29wdGlvbnMuY29tbWVudCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGFzc2VydCh0aGlzLiNvcHRpb25zLnNlcGFyYXRvciAhPSBudWxsKTtcblxuICAgIGxldCBmdWxsTGluZSA9IGxpbmU7XG4gICAgbGV0IHF1b3RlRXJyb3I6IFBhcnNlRXJyb3IgfCBudWxsID0gbnVsbDtcbiAgICBjb25zdCBxdW90ZSA9ICdcIic7XG4gICAgY29uc3QgcXVvdGVMZW4gPSBxdW90ZS5sZW5ndGg7XG4gICAgY29uc3Qgc2VwYXJhdG9yTGVuID0gdGhpcy4jb3B0aW9ucy5zZXBhcmF0b3IubGVuZ3RoO1xuICAgIGxldCByZWNvcmRCdWZmZXIgPSBcIlwiO1xuICAgIGNvbnN0IGZpZWxkSW5kZXhlcyA9IFtdIGFzIG51bWJlcltdO1xuICAgIHBhcnNlRmllbGQ6XG4gICAgZm9yICg7Oykge1xuICAgICAgaWYgKHRoaXMuI29wdGlvbnMudHJpbUxlYWRpbmdTcGFjZSkge1xuICAgICAgICBsaW5lID0gbGluZS50cmltU3RhcnQoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGxpbmUubGVuZ3RoID09PSAwIHx8ICFsaW5lLnN0YXJ0c1dpdGgocXVvdGUpKSB7XG4gICAgICAgIC8vIE5vbi1xdW90ZWQgc3RyaW5nIGZpZWxkXG4gICAgICAgIGNvbnN0IGkgPSBsaW5lLmluZGV4T2YodGhpcy4jb3B0aW9ucy5zZXBhcmF0b3IpO1xuICAgICAgICBsZXQgZmllbGQgPSBsaW5lO1xuICAgICAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgICAgZmllbGQgPSBmaWVsZC5zdWJzdHJpbmcoMCwgaSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgdG8gbWFrZSBzdXJlIGEgcXVvdGUgZG9lcyBub3QgYXBwZWFyIGluIGZpZWxkLlxuICAgICAgICBpZiAoIXRoaXMuI29wdGlvbnMubGF6eVF1b3Rlcykge1xuICAgICAgICAgIGNvbnN0IGogPSBmaWVsZC5pbmRleE9mKHF1b3RlKTtcbiAgICAgICAgICBpZiAoaiA+PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBjb2wgPSBydW5lQ291bnQoXG4gICAgICAgICAgICAgIGZ1bGxMaW5lLnNsaWNlKDAsIGZ1bGxMaW5lLmxlbmd0aCAtIGxpbmUuc2xpY2UoaikubGVuZ3RoKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBxdW90ZUVycm9yID0gbmV3IFBhcnNlRXJyb3IoXG4gICAgICAgICAgICAgIHN0YXJ0TGluZSArIDEsXG4gICAgICAgICAgICAgIGxpbmVJbmRleCxcbiAgICAgICAgICAgICAgY29sLFxuICAgICAgICAgICAgICBFUlJfQkFSRV9RVU9URSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBicmVhayBwYXJzZUZpZWxkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZWNvcmRCdWZmZXIgKz0gZmllbGQ7XG4gICAgICAgIGZpZWxkSW5kZXhlcy5wdXNoKHJlY29yZEJ1ZmZlci5sZW5ndGgpO1xuICAgICAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKGkgKyBzZXBhcmF0b3JMZW4pO1xuICAgICAgICAgIGNvbnRpbnVlIHBhcnNlRmllbGQ7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWsgcGFyc2VGaWVsZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFF1b3RlZCBzdHJpbmcgZmllbGRcbiAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKHF1b3RlTGVuKTtcbiAgICAgICAgZm9yICg7Oykge1xuICAgICAgICAgIGNvbnN0IGkgPSBsaW5lLmluZGV4T2YocXVvdGUpO1xuICAgICAgICAgIGlmIChpID49IDApIHtcbiAgICAgICAgICAgIC8vIEhpdCBuZXh0IHF1b3RlLlxuICAgICAgICAgICAgcmVjb3JkQnVmZmVyICs9IGxpbmUuc3Vic3RyaW5nKDAsIGkpO1xuICAgICAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKGkgKyBxdW90ZUxlbik7XG4gICAgICAgICAgICBpZiAobGluZS5zdGFydHNXaXRoKHF1b3RlKSkge1xuICAgICAgICAgICAgICAvLyBgXCJcImAgc2VxdWVuY2UgKGFwcGVuZCBxdW90ZSkuXG4gICAgICAgICAgICAgIHJlY29yZEJ1ZmZlciArPSBxdW90ZTtcbiAgICAgICAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKHF1b3RlTGVuKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKHRoaXMuI29wdGlvbnMuc2VwYXJhdG9yKSkge1xuICAgICAgICAgICAgICAvLyBgXCIsXCJgIHNlcXVlbmNlIChlbmQgb2YgZmllbGQpLlxuICAgICAgICAgICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcoc2VwYXJhdG9yTGVuKTtcbiAgICAgICAgICAgICAgZmllbGRJbmRleGVzLnB1c2gocmVjb3JkQnVmZmVyLmxlbmd0aCk7XG4gICAgICAgICAgICAgIGNvbnRpbnVlIHBhcnNlRmllbGQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKDAgPT09IGxpbmUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIC8vIGBcIlxcbmAgc2VxdWVuY2UgKGVuZCBvZiBsaW5lKS5cbiAgICAgICAgICAgICAgZmllbGRJbmRleGVzLnB1c2gocmVjb3JkQnVmZmVyLmxlbmd0aCk7XG4gICAgICAgICAgICAgIGJyZWFrIHBhcnNlRmllbGQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuI29wdGlvbnMubGF6eVF1b3Rlcykge1xuICAgICAgICAgICAgICAvLyBgXCJgIHNlcXVlbmNlIChiYXJlIHF1b3RlKS5cbiAgICAgICAgICAgICAgcmVjb3JkQnVmZmVyICs9IHF1b3RlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gYFwiKmAgc2VxdWVuY2UgKGludmFsaWQgbm9uLWVzY2FwZWQgcXVvdGUpLlxuICAgICAgICAgICAgICBjb25zdCBjb2wgPSBydW5lQ291bnQoXG4gICAgICAgICAgICAgICAgZnVsbExpbmUuc2xpY2UoMCwgZnVsbExpbmUubGVuZ3RoIC0gbGluZS5sZW5ndGggLSBxdW90ZUxlbiksXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHF1b3RlRXJyb3IgPSBuZXcgUGFyc2VFcnJvcihcbiAgICAgICAgICAgICAgICBzdGFydExpbmUgKyAxLFxuICAgICAgICAgICAgICAgIGxpbmVJbmRleCxcbiAgICAgICAgICAgICAgICBjb2wsXG4gICAgICAgICAgICAgICAgRVJSX1FVT1RFLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBicmVhayBwYXJzZUZpZWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAobGluZS5sZW5ndGggPiAwIHx8ICEodGhpcy4jaXNFT0YoKSkpIHtcbiAgICAgICAgICAgIC8vIEhpdCBlbmQgb2YgbGluZSAoY29weSBhbGwgZGF0YSBzbyBmYXIpLlxuICAgICAgICAgICAgcmVjb3JkQnVmZmVyICs9IGxpbmU7XG4gICAgICAgICAgICBjb25zdCByID0gdGhpcy4jcmVhZExpbmUoKTtcbiAgICAgICAgICAgIGxpbmVJbmRleCsrO1xuICAgICAgICAgICAgbGluZSA9IHIgPz8gXCJcIjsgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIG1ha2luZyB0aGlzIG1vZHVsZSBiZWhhdmUgc2ltaWxhcmx5IHRvIHRoZSBlbmNvZGluZy9jc3YvcmVhZGVyLmdvLlxuICAgICAgICAgICAgZnVsbExpbmUgPSBsaW5lO1xuICAgICAgICAgICAgaWYgKHIgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgLy8gQWJydXB0IGVuZCBvZiBmaWxlIChFT0Ygb3IgZXJyb3IpLlxuICAgICAgICAgICAgICBpZiAoIXRoaXMuI29wdGlvbnMubGF6eVF1b3Rlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbCA9IHJ1bmVDb3VudChmdWxsTGluZSk7XG4gICAgICAgICAgICAgICAgcXVvdGVFcnJvciA9IG5ldyBQYXJzZUVycm9yKFxuICAgICAgICAgICAgICAgICAgc3RhcnRMaW5lICsgMSxcbiAgICAgICAgICAgICAgICAgIGxpbmVJbmRleCxcbiAgICAgICAgICAgICAgICAgIGNvbCxcbiAgICAgICAgICAgICAgICAgIEVSUl9RVU9URSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrIHBhcnNlRmllbGQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZmllbGRJbmRleGVzLnB1c2gocmVjb3JkQnVmZmVyLmxlbmd0aCk7XG4gICAgICAgICAgICAgIGJyZWFrIHBhcnNlRmllbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWNvcmRCdWZmZXIgKz0gXCJcXG5cIjsgLy8gcHJlc2VydmUgbGluZSBmZWVkIChUaGlzIGlzIGJlY2F1c2UgVGV4dFByb3RvUmVhZGVyIHJlbW92ZXMgaXQuKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBBYnJ1cHQgZW5kIG9mIGZpbGUgKEVPRiBvbiBlcnJvcikuXG4gICAgICAgICAgICBpZiAoIXRoaXMuI29wdGlvbnMubGF6eVF1b3Rlcykge1xuICAgICAgICAgICAgICBjb25zdCBjb2wgPSBydW5lQ291bnQoZnVsbExpbmUpO1xuICAgICAgICAgICAgICBxdW90ZUVycm9yID0gbmV3IFBhcnNlRXJyb3IoXG4gICAgICAgICAgICAgICAgc3RhcnRMaW5lICsgMSxcbiAgICAgICAgICAgICAgICBsaW5lSW5kZXgsXG4gICAgICAgICAgICAgICAgY29sLFxuICAgICAgICAgICAgICAgIEVSUl9RVU9URSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgYnJlYWsgcGFyc2VGaWVsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpZWxkSW5kZXhlcy5wdXNoKHJlY29yZEJ1ZmZlci5sZW5ndGgpO1xuICAgICAgICAgICAgYnJlYWsgcGFyc2VGaWVsZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHF1b3RlRXJyb3IpIHtcbiAgICAgIHRocm93IHF1b3RlRXJyb3I7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IFtdIGFzIHN0cmluZ1tdO1xuICAgIGxldCBwcmVJZHggPSAwO1xuICAgIGZvciAoY29uc3QgaSBvZiBmaWVsZEluZGV4ZXMpIHtcbiAgICAgIHJlc3VsdC5wdXNoKHJlY29yZEJ1ZmZlci5zbGljZShwcmVJZHgsIGkpKTtcbiAgICAgIHByZUlkeCA9IGk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgcGFyc2UoaW5wdXQ6IHN0cmluZyk6IHN0cmluZ1tdW10ge1xuICAgIHRoaXMuI2lucHV0ID0gaW5wdXQ7XG4gICAgdGhpcy4jY3Vyc29yID0gMDtcbiAgICBjb25zdCByZXN1bHQ6IHN0cmluZ1tdW10gPSBbXTtcbiAgICBsZXQgX25iRmllbGRzOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gICAgbGV0IGxpbmVSZXN1bHQ6IHN0cmluZ1tdO1xuICAgIGxldCBmaXJzdCA9IHRydWU7XG4gICAgbGV0IGxpbmVJbmRleCA9IDA7XG5cbiAgICBjb25zdCBJTlZBTElEX1JVTkUgPSBbXCJcXHJcIiwgXCJcXG5cIiwgJ1wiJ107XG5cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy4jb3B0aW9ucztcbiAgICBpZiAoXG4gICAgICBJTlZBTElEX1JVTkUuaW5jbHVkZXMob3B0aW9ucy5zZXBhcmF0b3IpIHx8XG4gICAgICAodHlwZW9mIG9wdGlvbnMuY29tbWVudCA9PT0gXCJzdHJpbmdcIiAmJlxuICAgICAgICBJTlZBTElEX1JVTkUuaW5jbHVkZXMob3B0aW9ucy5jb21tZW50KSkgfHxcbiAgICAgIG9wdGlvbnMuc2VwYXJhdG9yID09PSBvcHRpb25zLmNvbW1lbnRcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihFUlJfSU5WQUxJRF9ERUxJTSk7XG4gICAgfVxuXG4gICAgZm9yICg7Oykge1xuICAgICAgY29uc3QgciA9IHRoaXMuI3BhcnNlUmVjb3JkKGxpbmVJbmRleCk7XG4gICAgICBpZiAociA9PT0gbnVsbCkgYnJlYWs7XG4gICAgICBsaW5lUmVzdWx0ID0gcjtcbiAgICAgIGxpbmVJbmRleCsrO1xuICAgICAgLy8gSWYgZmllbGRzUGVyUmVjb3JkIGlzIDAsIFJlYWQgc2V0cyBpdCB0b1xuICAgICAgLy8gdGhlIG51bWJlciBvZiBmaWVsZHMgaW4gdGhlIGZpcnN0IHJlY29yZFxuICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICAgIGlmIChvcHRpb25zLmZpZWxkc1BlclJlY29yZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMuZmllbGRzUGVyUmVjb3JkID09PSAwKSB7XG4gICAgICAgICAgICBfbmJGaWVsZHMgPSBsaW5lUmVzdWx0Lmxlbmd0aDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX25iRmllbGRzID0gb3B0aW9ucy5maWVsZHNQZXJSZWNvcmQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChsaW5lUmVzdWx0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKF9uYkZpZWxkcyAmJiBfbmJGaWVsZHMgIT09IGxpbmVSZXN1bHQubGVuZ3RoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFBhcnNlRXJyb3IobGluZUluZGV4LCBsaW5lSW5kZXgsIG51bGwsIEVSUl9GSUVMRF9DT1VOVCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2gobGluZVJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsU0FBUyxNQUFNLFFBQVEsdUJBQXVCLENBQUM7QUFDL0MsU0FDRSxjQUFjLEVBQ2QsZUFBZSxFQUNmLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsVUFBVSxRQUVMLFVBQVUsQ0FBQztBQUVsQixPQUFPLE1BQU0sTUFBTTtJQUNqQixDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDWixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDWixDQUFDLE9BQU8sQ0FNTjtJQUNGLFlBQVksRUFDVixTQUFTLEVBQUcsR0FBRyxDQUFBLEVBQ2YsZ0JBQWdCLEVBQUcsS0FBSyxDQUFBLEVBQ3hCLE9BQU8sQ0FBQSxFQUNQLFVBQVUsQ0FBQSxFQUNWLGVBQWUsQ0FBQSxFQUNILEdBQUcsRUFBRSxDQUFFO1FBQ25CLElBQUksQ0FBQyxDQUFDLE9BQU8sR0FBRztZQUNkLFNBQVM7WUFDVCxnQkFBZ0I7WUFDaEIsT0FBTztZQUNQLFVBQVU7WUFDVixlQUFlO1NBQ2hCLENBQUM7SUFDSjtJQUNBLENBQUMsUUFBUSxHQUFrQjtRQUN6QixJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDO1FB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