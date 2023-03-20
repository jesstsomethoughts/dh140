// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// @ts-nocheck Bypass static errors for missing --unstable.
export function serve(...args) {
    if (typeof Deno.serve == "function") {
        return Deno.serve(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function upgradeHttpRaw(...args) {
    if (typeof Deno.upgradeHttpRaw == "function") {
        return Deno.upgradeHttpRaw(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function addSignalListener(...args) {
    if (typeof Deno.addSignalListener == "function") {
        return Deno.addSignalListener(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function createHttpClient(...args) {
    if (typeof Deno.createHttpClient == "function") {
        return Deno.createHttpClient(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function consoleSize(...args) {
    if (typeof Deno.consoleSize == "function") {
        return Deno.consoleSize(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function futime(...args) {
    if (typeof Deno.futime == "function") {
        return Deno.futime(...args);
    } else {
        return Promise.reject(new TypeError("Requires --unstable"));
    }
}
export function futimeSync(...args) {
    if (typeof Deno.futimeSync == "function") {
        return Deno.futimeSync(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function getUid(...args) {
    if (typeof Deno.getUid == "function") {
        return Deno.getUid(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function hostname(...args) {
    if (typeof Deno.hostname == "function") {
        return Deno.hostname(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function loadavg(...args) {
    if (typeof Deno.loadavg == "function") {
        return Deno.loadavg(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function osRelease(...args) {
    if (typeof Deno.osRelease == "function") {
        return Deno.osRelease(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function removeSignalListener(...args) {
    if (typeof Deno.removeSignalListener == "function") {
        return Deno.removeSignalListener(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function setRaw(...args) {
    if (typeof Deno.setRaw == "function") {
        return Deno.setRaw(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function systemMemoryInfo(...args) {
    if (typeof Deno.systemMemoryInfo == "function") {
        return Deno.systemMemoryInfo(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function utime(...args) {
    if (typeof Deno.utime == "function") {
        return Deno.utime(...args);
    } else {
        return Promise.reject(new TypeError("Requires --unstable"));
    }
}
export function utimeSync(...args) {
    if (typeof Deno.utimeSync == "function") {
        return Deno.utimeSync(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function networkInterfaces(...args) {
    if (typeof Deno.networkInterfaces == "function") {
        return Deno.networkInterfaces(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export async function connect(options) {
    return await Deno.connect(options);
}
export function listen(options) {
    return Deno.listen(options);
}
export function listenDatagram(options) {
    return Deno.listenDatagram(options);
}
export function ListenerRef(listener, ...args) {
    if (typeof listener.ref == "function") {
        return listener.ref(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function ListenerUnref(listener, ...args) {
    if (typeof listener.unref == "function") {
        return listener.unref(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
export function unrefTimer(...args) {
    if (typeof Deno.unrefTimer == "function") {
        return Deno.unrefTimer(...args);
    } else {
        throw new TypeError("Requires --unstable");
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE1My4wL19kZW5vX3Vuc3RhYmxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBAdHMtbm9jaGVjayBCeXBhc3Mgc3RhdGljIGVycm9ycyBmb3IgbWlzc2luZyAtLXVuc3RhYmxlLlxuXG5leHBvcnQgdHlwZSBIdHRwQ2xpZW50ID0gRGVuby5IdHRwQ2xpZW50O1xuZXhwb3J0IHR5cGUgVW5peENvbm5lY3RPcHRpb25zID0gRGVuby5Vbml4Q29ubmVjdE9wdGlvbnM7XG5leHBvcnQgdHlwZSBVbml4TGlzdGVuT3B0aW9ucyA9IERlbm8uVW5peExpc3Rlbk9wdGlvbnM7XG5leHBvcnQgdHlwZSBEYXRhZ3JhbUNvbm4gPSBEZW5vLkRhdGFncmFtQ29ubjtcbmV4cG9ydCB0eXBlIFNlcnZlSGFuZGxlciA9IERlbm8uU2VydmVIYW5kbGVyO1xuXG5leHBvcnQgZnVuY3Rpb24gc2VydmUoXG4gIC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIERlbm8uc2VydmU+XG4pOiBSZXR1cm5UeXBlPHR5cGVvZiBEZW5vLnNlcnZlPiB7XG4gIGlmICh0eXBlb2YgRGVuby5zZXJ2ZSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4gRGVuby5zZXJ2ZSguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUmVxdWlyZXMgLS11bnN0YWJsZVwiKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBncmFkZUh0dHBSYXcoXG4gIC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIERlbm8udXBncmFkZUh0dHBSYXc+XG4pOiBSZXR1cm5UeXBlPHR5cGVvZiBEZW5vLnVwZ3JhZGVIdHRwUmF3PiB7XG4gIGlmICh0eXBlb2YgRGVuby51cGdyYWRlSHR0cFJhdyA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4gRGVuby51cGdyYWRlSHR0cFJhdyguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUmVxdWlyZXMgLS11bnN0YWJsZVwiKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkU2lnbmFsTGlzdGVuZXIoXG4gIC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIERlbm8uYWRkU2lnbmFsTGlzdGVuZXI+XG4pOiBSZXR1cm5UeXBlPHR5cGVvZiBEZW5vLmFkZFNpZ25hbExpc3RlbmVyPiB7XG4gIGlmICh0eXBlb2YgRGVuby5hZGRTaWduYWxMaXN0ZW5lciA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4gRGVuby5hZGRTaWduYWxMaXN0ZW5lciguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUmVxdWlyZXMgLS11bnN0YWJsZVwiKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSHR0cENsaWVudChcbiAgLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgRGVuby5jcmVhdGVIdHRwQ2xpZW50PlxuKTogUmV0dXJuVHlwZTx0eXBlb2YgRGVuby5jcmVhdGVIdHRwQ2xpZW50PiB7XG4gIGlmICh0eXBlb2YgRGVuby5jcmVhdGVIdHRwQ2xpZW50ID09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBEZW5vLmNyZWF0ZUh0dHBDbGllbnQoLi4uYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlJlcXVpcmVzIC0tdW5zdGFibGVcIik7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnNvbGVTaXplKFxuICAuLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBEZW5vLmNvbnNvbGVTaXplPlxuKTogUmV0dXJuVHlwZTx0eXBlb2YgRGVuby5jb25zb2xlU2l6ZT4ge1xuICBpZiAodHlwZW9mIERlbm8uY29uc29sZVNpemUgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIERlbm8uY29uc29sZVNpemUoLi4uYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlJlcXVpcmVzIC0tdW5zdGFibGVcIik7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZ1dGltZShcbiAgLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgRGVuby5mdXRpbWU+XG4pOiBSZXR1cm5UeXBlPHR5cGVvZiBEZW5vLmZ1dGltZT4ge1xuICBpZiAodHlwZW9mIERlbm8uZnV0aW1lID09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBEZW5vLmZ1dGltZSguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcihcIlJlcXVpcmVzIC0tdW5zdGFibGVcIikpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmdXRpbWVTeW5jKFxuICAuLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBEZW5vLmZ1dGltZVN5bmM+XG4pOiBSZXR1cm5UeXBlPHR5cGVvZiBEZW5vLmZ1dGltZVN5bmM+IHtcbiAgaWYgKHR5cGVvZiBEZW5vLmZ1dGltZVN5bmMgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIERlbm8uZnV0aW1lU3luYyguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUmVxdWlyZXMgLS11bnN0YWJsZVwiKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VWlkKFxuICAuLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBEZW5vLmdldFVpZD5cbik6IFJldHVyblR5cGU8dHlwZW9mIERlbm8uZ2V0VWlkPiB7XG4gIGlmICh0eXBlb2YgRGVuby5nZXRVaWQgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIERlbm8uZ2V0VWlkKC4uLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJSZXF1aXJlcyAtLXVuc3RhYmxlXCIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBob3N0bmFtZShcbiAgLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgRGVuby5ob3N0bmFtZT5cbik6IFJldHVyblR5cGU8dHlwZW9mIERlbm8uaG9zdG5hbWU+IHtcbiAgaWYgKHR5cGVvZiBEZW5vLmhvc3RuYW1lID09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBEZW5vLmhvc3RuYW1lKC4uLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJSZXF1aXJlcyAtLXVuc3RhYmxlXCIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkYXZnKFxuICAuLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBEZW5vLmxvYWRhdmc+XG4pOiBSZXR1cm5UeXBlPHR5cGVvZiBEZW5vLmxvYWRhdmc+IHtcbiAgaWYgKHR5cGVvZiBEZW5vLmxvYWRhdmcgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIERlbm8ubG9hZGF2ZyguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUmVxdWlyZXMgLS11bnN0YWJsZVwiKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3NSZWxlYXNlKFxuICAuLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBEZW5vLm9zUmVsZWFzZT5cbik6IFJldHVyblR5cGU8dHlwZW9mIERlbm8ub3NSZWxlYXNlPiB7XG4gIGlmICh0eXBlb2YgRGVuby5vc1JlbGVhc2UgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIERlbm8ub3NSZWxlYXNlKC4uLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJSZXF1aXJlcyAtLXVuc3RhYmxlXCIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVTaWduYWxMaXN0ZW5lcihcbiAgLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgRGVuby5yZW1vdmVTaWduYWxMaXN0ZW5lcj5cbik6IFJldHVyblR5cGU8dHlwZW9mIERlbm8ucmVtb3ZlU2lnbmFsTGlzdGVuZXI+IHtcbiAgaWYgKHR5cGVvZiBEZW5vLnJlbW92ZVNpZ25hbExpc3RlbmVyID09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBEZW5vLnJlbW92ZVNpZ25hbExpc3RlbmVyKC4uLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJSZXF1aXJlcyAtLXVuc3RhYmxlXCIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRSYXcoXG4gIC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIERlbm8uc2V0UmF3PlxuKTogUmV0dXJuVHlwZTx0eXBlb2YgRGVuby5zZXRSYXc+IHtcbiAgaWYgKHR5cGVvZiBEZW5vLnNldFJhdyA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4gRGVuby5zZXRSYXcoLi4uYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlJlcXVpcmVzIC0tdW5zdGFibGVcIik7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN5c3RlbU1lbW9yeUluZm8oXG4gIC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIERlbm8uc3lzdGVtTWVtb3J5SW5mbz5cbik6IFJldHVyblR5cGU8dHlwZW9mIERlbm8uc3lzdGVtTWVtb3J5SW5mbz4ge1xuICBpZiAodHlwZW9mIERlbm8uc3lzdGVtTWVtb3J5SW5mbyA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4gRGVuby5zeXN0ZW1NZW1vcnlJbmZvKC4uLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJSZXF1aXJlcyAtLXVuc3RhYmxlXCIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1dGltZShcbiAgLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgRGVuby51dGltZT5cbik6IFJldHVyblR5cGU8dHlwZW9mIERlbm8udXRpbWU+IHtcbiAgaWYgKHR5cGVvZiBEZW5vLnV0aW1lID09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBEZW5vLnV0aW1lKC4uLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKFwiUmVxdWlyZXMgLS11bnN0YWJsZVwiKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHV0aW1lU3luYyhcbiAgLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgRGVuby51dGltZVN5bmM+XG4pOiBSZXR1cm5UeXBlPHR5cGVvZiBEZW5vLnV0aW1lU3luYz4ge1xuICBpZiAodHlwZW9mIERlbm8udXRpbWVTeW5jID09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBEZW5vLnV0aW1lU3luYyguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUmVxdWlyZXMgLS11bnN0YWJsZVwiKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV0d29ya0ludGVyZmFjZXMoXG4gIC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIERlbm8ubmV0d29ya0ludGVyZmFjZXM+XG4pOiBSZXR1cm5UeXBlPHR5cGVvZiBEZW5vLm5ldHdvcmtJbnRlcmZhY2VzPiB7XG4gIGlmICh0eXBlb2YgRGVuby5uZXR3b3JrSW50ZXJmYWNlcyA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4gRGVuby5uZXR3b3JrSW50ZXJmYWNlcyguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUmVxdWlyZXMgLS11bnN0YWJsZVwiKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29ubmVjdChcbiAgb3B0aW9uczogVW5peENvbm5lY3RPcHRpb25zLFxuKTogUHJvbWlzZTxEZW5vLlVuaXhDb25uPiB7XG4gIHJldHVybiBhd2FpdCBEZW5vLmNvbm5lY3Qob3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaXN0ZW4oXG4gIG9wdGlvbnM6IFVuaXhMaXN0ZW5PcHRpb25zICYgeyB0cmFuc3BvcnQ6IFwidW5peFwiIH0sXG4pOiBSZXR1cm5UeXBlPHR5cGVvZiBEZW5vLmxpc3Rlbj4ge1xuICByZXR1cm4gRGVuby5saXN0ZW4ob3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaXN0ZW5EYXRhZ3JhbShcbiAgb3B0aW9uczogRGVuby5MaXN0ZW5PcHRpb25zICYgeyB0cmFuc3BvcnQ6IFwidWRwXCIgfSxcbik6IFJldHVyblR5cGU8dHlwZW9mIERlbm8ubGlzdGVuRGF0YWdyYW0+IHtcbiAgcmV0dXJuIERlbm8ubGlzdGVuRGF0YWdyYW0ob3B0aW9ucyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBMaXN0ZW5lclJlZihcbiAgbGlzdGVuZXI6IERlbm8uTGlzdGVuZXIsXG4gIC4uLmFyZ3M6IFBhcmFtZXRlcnM8RGVuby5MaXN0ZW5lcltcInJlZlwiXT5cbik6IFJldHVyblR5cGU8RGVuby5MaXN0ZW5lcltcInJlZlwiXT4ge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyLnJlZiA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4gbGlzdGVuZXIucmVmKC4uLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJSZXF1aXJlcyAtLXVuc3RhYmxlXCIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBMaXN0ZW5lclVucmVmKFxuICBsaXN0ZW5lcjogRGVuby5MaXN0ZW5lcixcbiAgLi4uYXJnczogUGFyYW1ldGVyczxEZW5vLkxpc3RlbmVyW1widW5yZWZcIl0+XG4pOiBSZXR1cm5UeXBlPERlbm8uTGlzdGVuZXJbXCJ1bnJlZlwiXT4ge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyLnVucmVmID09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBsaXN0ZW5lci51bnJlZiguLi5hcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUmVxdWlyZXMgLS11bnN0YWJsZVwiKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5yZWZUaW1lcihcbiAgLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgRGVuby51bnJlZlRpbWVyPlxuKTogUmV0dXJuVHlwZTx0eXBlb2YgRGVuby51bnJlZlRpbWVyPiB7XG4gIGlmICh0eXBlb2YgRGVuby51bnJlZlRpbWVyID09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBEZW5vLnVucmVmVGltZXIoLi4uYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlJlcXVpcmVzIC0tdW5zdGFibGVcIik7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsMkRBQTJEO0FBUTNELE9BQU8sU0FBUyxLQUFLLENBQ25CLEdBQUcsSUFBSSxBQUErQixFQUNQO0lBQy9CLElBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLFVBQVUsRUFBRTtRQUNuQyxPQUFPLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUM7SUFDN0IsT0FBTztRQUNMLE1BQU0sSUFBSSxTQUFTLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUM3QyxDQUFDO0FBQ0gsQ0FBQztBQUVELE9BQU8sU0FBUyxjQUFjLENBQzVCLEdBQUcsSUFBSSxBQUF3QyxFQUNQO0lBQ3hDLElBQUksT0FBTyxJQUFJLENBQUMsY0FBYyxJQUFJLFVBQVUsRUFBRTtRQUM1QyxPQUFPLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLENBQUM7SUFDdEMsT0FBTztRQUNMLE1BQU0sSUFBSSxTQUFTLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUM3QyxDQUFDO0FBQ0gsQ0FBQztBQUVELE9BQU8sU0FBUyxpQkFBaUIsQ0FDL0IsR0FBRyxJQUFJLEFBQTJDLEVBQ1A7SUFDM0MsSUFBSSxPQUFPLElBQUksQ0FB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