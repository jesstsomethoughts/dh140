// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
const { hasOwn  } = Object;
function resolveYamlSet(data) {
    if (data === null) return true;
    for(const key in data){
        if (hasOwn(data, key)) {
            if (data[key] !== null) return false;
        }
    }
    return true;
}
function constructYamlSet(data) {
    return data !== null ? data : {};
}
export const set = new Type("tag:yaml.org,2002:set", {
    construct: constructYamlSet,
    kind: "mapping",
    resolve: resolveYamlSet
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE1My4wL2VuY29kaW5nL195YW1sL3R5cGUvc2V0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjIgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IFR5cGUgfSBmcm9tIFwiLi4vdHlwZS50c1wiO1xuaW1wb3J0IHR5cGUgeyBBbnkgfSBmcm9tIFwiLi4vdXRpbHMudHNcIjtcblxuY29uc3QgeyBoYXNPd24gfSA9IE9iamVjdDtcblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxTZXQoZGF0YTogQW55KTogYm9vbGVhbiB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gdHJ1ZTtcblxuICBmb3IgKGNvbnN0IGtleSBpbiBkYXRhKSB7XG4gICAgaWYgKGhhc093bihkYXRhLCBrZXkpKSB7XG4gICAgICBpZiAoZGF0YVtrZXldICE9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxTZXQoZGF0YTogc3RyaW5nKTogQW55IHtcbiAgcmV0dXJuIGRhdGEgIT09IG51bGwgPyBkYXRhIDoge307XG59XG5cbmV4cG9ydCBjb25zdCBzZXQgPSBuZXcgVHlwZShcInRhZzp5YW1sLm9yZywyMDAyOnNldFwiLCB7XG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbFNldCxcbiAga2luZDogXCJtYXBwaW5nXCIsXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sU2V0LFxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBRTFFLFNBQVMsSUFBSSxRQUFRLFlBQVksQ0FBQztBQUdsQyxNQUFNLEVBQUUsTUFBTSxDQUFBLEVBQUUsR0FBRyxNQUFNLEFBQUM7QUFFMUIsU0FBUyxjQUFjLENBQUMsSUFBUyxFQUFXO0lBQzFDLElBQUksSUFBSSxLQUFLLElBQUksRUFBRSxPQUFPLElBQUksQ0FBQztJQUUvQixJQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBRTtRQUN0QixJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDckIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxFQUFFLE9BQU8sS0FBSyxDQUFDO1FBQ3ZDLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxJQUFZLEVBQU87SUFDM0MsT0FBTyxJQUFJLEtBQUssSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbkMsQ0FBQztBQUVELE9BQU8sTUFBTSxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7SUFDbkQsU0FBUyxFQUFFLGdCQUFnQjtJQUMzQixJQUFJLEVBQUUsU0FBUztJQUNmLE9BQU8sRUFBRSxjQUFjO0NBQ3hCLENBQUMsQ0FBQyJ9