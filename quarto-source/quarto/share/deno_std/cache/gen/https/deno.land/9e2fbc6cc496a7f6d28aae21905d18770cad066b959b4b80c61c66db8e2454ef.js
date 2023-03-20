// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { assert } from "./assert.ts";
export function deepAssign(// deno-lint-ignore no-explicit-any
target, // deno-lint-ignore no-explicit-any
...sources) {
    for(let i = 0; i < sources.length; i++){
        const source = sources[i];
        if (!source || typeof source !== `object`) {
            return;
        }
        Object.entries(source).forEach(([key, value])=>{
            if (value instanceof Date) {
                target[key] = new Date(value);
                return;
            }
            if (value instanceof RegExp) {
                target[key] = new RegExp(value);
                return;
            }
            if (!value || typeof value !== `object`) {
                target[key] = value;
                return;
            }
            if (Array.isArray(value)) {
                target[key] = [];
            }
            // value is an Object
            if (typeof target[key] !== `object` || !target[key]) {
                target[key] = {};
            }
            assert(value);
            deepAssign(target[key], value);
        });
    }
    return target;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE1My4wL191dGlsL2RlZXBfYXNzaWduLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IGFzc2VydCB9IGZyb20gXCIuL2Fzc2VydC50c1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVlcEFzc2lnbjxULCBVPih0YXJnZXQ6IFQsIHNvdXJjZTogVSk6IFQgJiBVO1xuZXhwb3J0IGZ1bmN0aW9uIGRlZXBBc3NpZ248VCwgVSwgVj4oXG4gIHRhcmdldDogVCxcbiAgc291cmNlMTogVSxcbiAgc291cmNlMjogVixcbik6IFQgJiBVICYgVjtcbmV4cG9ydCBmdW5jdGlvbiBkZWVwQXNzaWduPFQsIFUsIFYsIFc+KFxuICB0YXJnZXQ6IFQsXG4gIHNvdXJjZTE6IFUsXG4gIHNvdXJjZTI6IFYsXG4gIHNvdXJjZTM6IFcsXG4pOiBUICYgVSAmIFYgJiBXO1xuZXhwb3J0IGZ1bmN0aW9uIGRlZXBBc3NpZ24oXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIHRhcmdldDogUmVjb3JkPHN0cmluZywgYW55PixcbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgLi4uc291cmNlczogYW55W11cbik6IC8vIGRlbm8tbGludC1pZ25vcmUgYmFuLXR5cGVzXG5vYmplY3QgfCB1bmRlZmluZWQge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzb3VyY2UgPSBzb3VyY2VzW2ldO1xuICAgIGlmICghc291cmNlIHx8IHR5cGVvZiBzb3VyY2UgIT09IGBvYmplY3RgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIE9iamVjdC5lbnRyaWVzKHNvdXJjZSkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgIHRhcmdldFtrZXldID0gbmV3IERhdGUodmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgdGFyZ2V0W2tleV0gPSBuZXcgUmVnRXhwKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09IGBvYmplY3RgKSB7XG4gICAgICAgIHRhcmdldFtrZXldID0gdmFsdWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB0YXJnZXRba2V5XSA9IFtdO1xuICAgICAgfVxuICAgICAgLy8gdmFsdWUgaXMgYW4gT2JqZWN0XG4gICAgICBpZiAodHlwZW9mIHRhcmdldFtrZXldICE9PSBgb2JqZWN0YCB8fCAhdGFyZ2V0W2tleV0pIHtcbiAgICAgICAgdGFyZ2V0W2tleV0gPSB7fTtcbiAgICAgIH1cbiAgICAgIGFzc2VydCh2YWx1ZSk7XG4gICAgICBkZWVwQXNzaWduKHRhcmdldFtrZXldIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCB2YWx1ZSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsTUFBTSxRQUFRLGFBQWEsQ0FBQztBQWNyQyxPQUFPLFNBQVMsVUFBVSxDQUN4QixtQ0FBbUM7QUFDbkMsTUFBMkIsRUFDM0IsbUNBQW1DO0FBQ25DLEdBQUcsT0FBTyxBQUFPLEVBRUE7SUFDakIsSUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUU7UUFDdkMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxBQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxNQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QyxPQUFPO1FBQ1QsQ0FBQztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUs7WUFDL0MsSUFBSSxLQUFLLFlBQVksSUFBSSxFQUFFO2dCQUN6QixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlCLE9BQU87WUFDVCxDQUFDO1lBQ0QsSUFBSSxLQUFLLFlBQVksTUFBTSxFQUFFO2dCQUMzQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLE9BQU87WUFDVCxDQUFDO1lBQ0QsSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN2QyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUNwQixPQUFPO1lBQ1QsQ0FBQztZQUNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDeEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNuQixDQUFDO1lBQ0QscUJBQXFCO1lBQ3JCLElBQUksT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbkQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNuQixDQUFDO1lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2QsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBNkIsS0FBSyxDQUFDLENBQUM7UUFDNUQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyJ9