import{g as c}from"./main-PhZfN2Qm.js";function h(n,i){for(var o=0;o<i.length;o++){const e=i[o];if(typeof e!="string"&&!Array.isArray(e)){for(const t in e)if(t!=="default"&&!(t in n)){const a=Object.getOwnPropertyDescriptor(e,t);a&&Object.defineProperty(n,t,a.get?a:{enumerable:!0,get:()=>e[t]})}}}return Object.freeze(Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}))}var r,s;function f(){return s||(s=1,r=[{name:"Accordion",paramsTypes:{pleats:"int",direction:"vec2",shading:"float",perspective:"float",backColor:"vec4"},defaultParams:{pleats:4,direction:[-1,0],shading:.7,perspective:1.5,backColor:[0,0,0,1]},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image folds up like a pleated paper toward one side while the incoming one unfolds out of the other, both in 3D with lit and shadowed pleats
// Tags: fold, 3d, slide, stripes

// @range(1, 12, 1) Number of pleats in each image (a pleat is a pair of panels, one lit and one in the shade)
uniform int pleats; // = 4
// @param Direction in which the images move, snapped to its main axis (left, right, up or down): the outgoing image folds up toward it, the incoming one unfolds from the opposite side
uniform vec2 direction; // = vec2(-1.0, 0.0)
// @range(0, 1) Contrast between the lit and the shaded panels
uniform float shading; // = 0.7
// @range(0, 3) Amount of perspective: the valleys between the pleats recede
uniform float perspective; // = 1.5
// @color Color seen around the folded images, where the valleys recede
uniform vec4 backColor; // = vec4(0.0, 0.0, 0.0, 1.0)

// light from the front and the side: its sideways and front components
const float LIGHT_SIDE = 0.55;
const float LIGHT_FRONT = 0.835;
// width of the anti-aliased folds and edges, in frame heights
const float EDGE = 0.0015;

// brightness of a panel folded by angle (c, s) = (cos, sin), facing the light (sign 1) or away (-1)
float panelLight(float c, float s, float facing) {
  float lambert = (c * LIGHT_FRONT + facing * s * LIGHT_SIDE) / LIGHT_FRONT;
  return mix(1.0, clamp(lambert, 0.08, 1.25), shading);
}

// one folded image: f is the position along it (0 to 1, from its anchored side), c the visible part
// of its length (cos of the fold angle), len its length and b the position across it, in frame heights
vec4 pleated(float f, float c, float len, float b, float bLen, bool incoming, bool flipA, bool vertical) {
  float m = 2.0 * float(pleats > 1 ? pleats : 1);
  float s = sqrt(max(1.0 - c * c, 0.0));
  float u = f * m;
  // f = 1 is the end of the last panel, not the start of one more
  float panel = min(floor(u), m - 1.0);
  float fu = u - panel;
  // the ridges (odd boundaries) stay in the frame's plane, the valleys (even ones) recede
  float tri = 1.0 - abs(mod(u, 2.0) - 1.0);
  float panelLen = len / m;
  float z = panelLen * s * (1.0 - tri);
  // farther parts look smaller
  float scale = 1.0 / (1.0 + perspective * z);
  float bb = (b - 0.5 * bLen) / scale / bLen + 0.5;
  // soft top and bottom edges while folded (sharp when flat, to keep the first and last frames exact)
  float edge = EDGE * min(1.0, 20.0 * s * c) + 1e-6;
  float cover = clamp(min(bb, 1.0 - bb) * bLen * scale / edge, 0.0, 1.0);
  float a = flipA ? 1.0 - f : f;
  vec2 st = clamp(vertical ? vec2(bb, a) : vec2(a, bb), 0.0, 1.0);
  vec4 img = incoming ? getToColor(st) : getFromColor(st);
  // even panels face the light, odd ones turn away; blend across each fold over a pixel or so
  float facing = mod(panel, 2.0) < 0.5 ? 1.0 : -1.0;
  float toEdge = min(fu, 1.0 - fu) * panelLen * c;
  float k = 0.5 + 0.5 * clamp(toEdge / EDGE, 0.0, 1.0);
  float light = mix(panelLight(c, s, -facing), panelLight(c, s, facing), k);
  // a touch of shade deep in the valleys
  float valley = 1.0 - tri;
  light *= 1.0 - 0.4 * shading * s * valley * valley;
  return mix(backColor, vec4(img.rgb * light, img.a), cover);
}

vec4 transition(vec2 uv) {
  bool vertical = abs(direction.y) > abs(direction.x);
  bool positive = vertical ? direction.y > 0.0 : direction.x > 0.0;
  // a: along the motion, 0 on the side the outgoing image folds up toward; b: across it
  float a = vertical ? uv.y : uv.x;
  if (positive) a = 1.0 - a;
  float b = vertical ? uv.x : uv.y;
  float len = vertical ? 1.0 : ratio;
  float bLen = vertical ? ratio : 1.0;

  float p = progress;
  float e = p * p * (3.0 - 2.0 * p);
  e = mix(p, e, 0.8);
  // visible part of each image's length
  float cFrom = 1.0 - e;
  float cTo = e;
  if (a < cFrom || cTo <= 0.0) {
    // the outgoing image, anchored on its side
    return pleated(a / cFrom, cFrom, len, b * bLen, bLen, false, positive, vertical);
  }
  // the incoming image, anchored on the opposite side
  return pleated(1.0 - (1.0 - a) / cTo, cTo, len, b * bLen, bLen, true, positive, vertical);
}
`,author:"gre",license:"MIT",description:"The outgoing image folds up like a pleated paper toward one side while the incoming one unfolds out of the other, both in 3D with lit and shadowed pleats",tags:["fold","3d","slide","stripes"],params:{pleats:{type:"int",default:4,min:1,max:12,step:1,description:"Number of pleats in each image (a pleat is a pair of panels, one lit and one in the shade)"},direction:{type:"vec2",default:[-1,0],description:"Direction in which the images move, snapped to its main axis (left, right, up or down): the outgoing image folds up toward it, the incoming one unfolds from the opposite side"},shading:{type:"float",default:.7,min:0,max:1,description:"Contrast between the lit and the shaded panels"},perspective:{type:"float",default:1.5,min:0,max:3,description:"Amount of perspective: the valleys between the pleats recede"},backColor:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color seen around the folded images, where the valleys recede"}},textures:[],createdAt:"Sun, 1 Nov 2026 20:36:49 +0100",updatedAt:"Sun, 1 Nov 2026 20:36:49 +0100"},{name:"ApertureWipe",paramsTypes:{blades:"int",rotation:"float",shadow:"float"},defaultParams:{blades:6,rotation:60,shadow:.5},glsl:`// Author: gre
// License: MIT
// Description: A camera aperture opens its turning blades to reveal the incoming image
// Tags: shape, wipe, iris, rotate

#define PI 3.141592653589793

// @range(3, 12) Number of blades
uniform int blades; // = 6
// @range(-180, 180) How much the blades turn while opening, in degrees
uniform float rotation; // = 60.0
// @range(0, 1) How dark the blades are shaded along their edges
uniform float shadow; // = 0.5

const float AA = 0.006;

vec4 transition (vec2 uv) {
  // Square pixels, normalized so the frame's corners are at distance 1
  vec2 q = (uv - 0.5) * vec2(ratio, 1.0) / (0.5 * length(vec2(ratio, 1.0)));
  float n = clamp(float(blades), 3.0, 12.0);
  float sector = 2.0 * PI / n;
  float turn = radians(rotation) * progress;
  // Each blade's straight edge is at distance r from the center: the opening is the polygon they enclose
  float r = mix(-AA, 1.0 + AA, progress);
  float dist = -1e3;
  float seam = 0.0;
  for (int i = 0; i < 12; i++) {
    if (float(i) < n) {
      float angle = turn + float(i) * sector;
      float d = dot(q, vec2(cos(angle), sin(angle))) - r;
      float next = dot(q, vec2(cos(angle + sector), sin(angle + sector))) - r;
      dist = max(dist, d);
      // Past its corner, the edge of a blade lies over the next blade and casts a shadow on it
      float s = 1.0 - smoothstep(0.0, 0.12, -d);
      seam = max(seam, (1.0 - smoothstep(0.0, AA, d)) * s * s * smoothstep(0.0, AA, next));
    }
  }
  // The blades are also shaded along the opening; the shading fades in as the aperture starts to open
  float rim = 1.0 - smoothstep(0.0, 0.08, dist);
  float shade = shadow * max(rim * rim, seam) * smoothstep(0.0, 0.1, progress);
  vec4 from = getFromColor(uv);
  from.rgb *= 1.0 - shade;
  return mix(from, getToColor(uv), 1.0 - smoothstep(0.0, AA, dist));
}
`,author:"gre",license:"MIT",description:"A camera aperture opens its turning blades to reveal the incoming image",tags:["shape","wipe","iris","rotate"],params:{blades:{type:"int",default:6,min:3,max:12,description:"Number of blades"},rotation:{type:"float",default:60,min:-180,max:180,description:"How much the blades turn while opening, in degrees"},shadow:{type:"float",default:.5,min:0,max:1,description:"How dark the blades are shaded along their edges"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:17:51 +0100",updatedAt:"Sat, 31 Oct 2026 18:17:51 +0100"},{name:"ArrowWipe",paramsTypes:{direction:"vec2",notch:"float",width:"float",count:"int",origin:"bool",smoothness:"float"},defaultParams:{direction:[1,0],notch:.4,width:80,count:1,origin:!1,smoothness:.004},glsl:`// Author: gre
// License: MIT
// Description: A notched arrowhead window onto the incoming image flies in from the edge behind it (or appears at the center), then swells until it fills the frame
// Tags: shape, wipe, arrow, chevron, directional

// @param Direction the arrow points and flies toward
uniform vec2 direction; // = vec2(1.0, 0.0)
// @range(0, 0.9) Depth of the notch at the back of the arrowhead (0 for a plain triangle)
uniform float notch; // = 0.4
// @range(20, 160) Opening angle of the arrowhead's tip, in degrees
uniform float width; // = 80.0
// @range(1, 3, 1) Number of nested chevrons flying in a row
uniform int count; // = 1
// @param Grow the arrow from the center of the frame instead of flying it in
uniform bool origin; // = false
// @range(0, 0.1) Softness of the arrow's edges
uniform float smoothness; // = 0.004

// Signed distance (in frame heights) to an arrowhead whose tip is at x = tip and whose notch
// reaches back to x = back, in the arrow's frame (x along the direction, y = |across|)
float arrow(vec2 q, float tip, float back, vec2 tipN, vec2 notchN) {
  float front = dot(vec2(q.x - tip, q.y), tipN);
  float rear = dot(vec2(back - q.x, -q.y), notchN);
  return max(front, rear);
}

vec4 transition(vec2 uv) {
  vec2 dir = length(direction) > 0.0 ? normalize(direction) : vec2(1.0, 0.0);
  vec2 across = vec2(-dir.y, dir.x);
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0);
  vec2 q = vec2(dot(p, dir), abs(dot(p, across)));

  float s = max(smoothness, 0.001);
  float n = clamp(notch, 0.0, 0.9);
  float h = radians(0.5 * clamp(width, 20.0, 160.0));
  float cot = cos(h) / sin(h);
  // outward normals of the tip's edges and of the notch's edges
  vec2 tipN = vec2(sin(h), cos(h));
  float notchLen = length(vec2(1.0, n * cot));
  vec2 notchN = vec2(1.0, n * cot) / notchLen;
  // how far the tip must pass a point for the soft edge to clear it
  float tipPad = s / sin(h);

  // The frame's corners in the arrow's frame
  vec2 c1 = vec2(0.5 * ratio, 0.5);
  vec2 c2 = vec2(0.5 * ratio, -0.5);
  vec2 k1 = vec2(abs(dot(c1, dir)), abs(dot(c1, across)));
  vec2 k2 = vec2(abs(dot(c2, dir)), abs(dot(c2, across)));
  // half extent of the frame along the direction, and where its back edge crosses the axis
  float e = max(k1.x, k2.x);
  float r = 0.5 / max(abs(dir.x) / ratio, abs(dir.y));
  // To cover the frame, the tip must be ahead of every corner, and the notch behind every
  // corner and behind the back edge's middle (with room for the soft edge)
  float tipMin = max(k1.x + k1.y * cot, k2.x + k2.y * cot) + tipPad;
  float notchMax = min(min(n * cot * k1.y - k1.x, n * cot * k2.y - k2.x), -r) - s * notchLen;

  // The arrow (length 1 from tip to barbs) turns around the middle of its axis: its tip is
  // half its body ahead of that point, its notch half its body behind
  float body = 0.5 * (1.0 - n);
  // The scale at which the arrow centered on the frame covers it
  float cover = max(tipMin, -notchMax) / body;

  float t = progress;
  float o; // middle of the arrow
  float l; // size of the arrow
  if (origin) {
    o = 0.0;
    l = cover * t * (0.4 + 0.6 * t);
  } else {
    // while it flies, its larger side (length or span) is about the frame's smaller side
    float l0 = 0.92 * min(1.0, ratio) / max(1.0, 2.0 * tan(h));
    // starts just behind the frame, flies to the middle, then swells
    float o0 = -e - 2.0 * tipPad - body * l0;
    // it is already moving when it enters, and slows down as it starts to swell
    float u = 1.0 - clamp(t / 0.65, 0.0, 1.0);
    float fly = 1.0 - u * u * u;
    // the swell speeds up and still moves at the end, so the last corners do not linger
    float grow = clamp((t - 0.3) / 0.7, 0.0, 1.0);
    o = mix(o0, 0.0, fly);
    l = mix(l0, cover, grow * grow * (2.0 - grow));
  }

  // the nested chevrons follow the first one, each tucked behind the previous one's notch
  float gap = (1.0 - n) * 1.35;
  float d = arrow(q, o + body * l, o - body * l, tipN, notchN);
  for (int i = 1; i < 3; i++) {
    if (i < count) {
      float back = o - float(i) * gap * l;
      d = min(d, arrow(q, back + body * l, back - body * l, tipN, notchN));
    }
  }
  // the soft edge slides from outside the arrow to inside it, so nothing shows at the start
  float m = 1.0 - smoothstep(-s, s, d + 2.0 * s * (1.0 - t));

  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  vec4 c = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"A notched arrowhead window onto the incoming image flies in from the edge behind it (or appears at the center), then swells until it fills the frame",tags:["shape","wipe","arrow","chevron","directional"],params:{direction:{type:"vec2",default:[1,0],description:"Direction the arrow points and flies toward"},notch:{type:"float",default:.4,min:0,max:.9,description:"Depth of the notch at the back of the arrowhead (0 for a plain triangle)"},width:{type:"float",default:80,min:20,max:160,description:"Opening angle of the arrowhead's tip, in degrees"},count:{type:"int",default:1,min:1,max:3,step:1,description:"Number of nested chevrons flying in a row"},origin:{type:"bool",default:!1,description:"Grow the arrow from the center of the frame instead of flying it in"},smoothness:{type:"float",default:.004,min:0,max:.1,description:"Softness of the arrow's edges"}},textures:[],createdAt:"Wed, 4 Nov 2026 16:31:10 +0100",updatedAt:"Wed, 4 Nov 2026 16:31:10 +0100"},{name:"Ascii",paramsTypes:{cellSize:"float",colored:"bool",ink:"vec4",background:"vec4"},defaultParams:{cellSize:.04,colored:!0,ink:[.3,1,.45,1],background:[0,0,0,1]},glsl:`// Author: gre
// License: MIT
// Description: The image turns into text-mode characters, denser where it is brighter, the characters scramble into those of the incoming image, then resolve back into it
// Tags: text, pattern, retro, digital

// @range(0.01, 0.1) Height of a character, in frame heights
uniform float cellSize; // = 0.04
// @param Color the characters with the image (otherwise, with the ink color)
uniform bool colored; // = true
// @color Color of the characters when they are not colored with the image
uniform vec4 ink; // = vec4(0.3, 1.0, 0.45, 1.0)
// @color Color behind the characters
uniform vec4 background; // = vec4(0.0, 0.0, 0.0, 1.0)

// width of a character cell, in cell heights
const float ASPECT = 0.6;
// half width of the strokes, in cell heights
const float STROKE = 0.05;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// distance to the segment from a to b
float segment(vec2 q, vec2 a, vec2 b) {
  vec2 pa = q - a;
  vec2 ba = b - a;
  return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0));
}

// distance to the strokes of the character of this density, from 0 (" ") to 9 ("@"),
// at q, in cell heights from the cell's center
float glyph(float g, vec2 q) {
  if (g < 0.5) return 1.0; // " "
  if (g < 1.5) return length(q - vec2(0.0, -0.27)) - 0.035; // "."
  if (g < 2.5) return min(length(q - vec2(0.0, -0.25)), length(q - vec2(0.0, 0.1))) - 0.035; // ":"
  if (g < 3.5) return segment(q, vec2(-0.17, 0.0), vec2(0.17, 0.0)) - STROKE; // "-"
  if (g < 4.5) { // "="
    return min(segment(q, vec2(-0.18, 0.1), vec2(0.18, 0.1)), segment(q, vec2(-0.18, -0.1), vec2(0.18, -0.1))) - STROKE;
  }
  if (g < 5.5) { // "+"
    return min(segment(q, vec2(-0.19, 0.0), vec2(0.19, 0.0)), segment(q, vec2(0.0, -0.19), vec2(0.0, 0.19))) - STROKE;
  }
  if (g < 6.5) { // "*"
    float d = segment(q, vec2(0.0, -0.2), vec2(0.0, 0.2));
    d = min(d, segment(q, vec2(-0.18, -0.11), vec2(0.18, 0.11)));
    d = min(d, segment(q, vec2(-0.18, 0.11), vec2(0.18, -0.11)));
    return d - STROKE;
  }
  if (g < 7.5) { // "#"
    float d = min(segment(q, vec2(-0.06, -0.3), vec2(-0.1, 0.3)), segment(q, vec2(0.12, -0.3), vec2(0.08, 0.3)));
    d = min(d, min(segment(q, vec2(-0.24, 0.11), vec2(0.24, 0.11)), segment(q, vec2(-0.24, -0.11), vec2(0.24, -0.11))));
    return d - STROKE;
  }
  if (g < 8.5) { // "%"
    float d = segment(q, vec2(-0.2, -0.3), vec2(0.2, 0.3));
    d = min(d, abs(length(q - vec2(-0.13, 0.19)) - 0.08));
    d = min(d, abs(length(q - vec2(0.13, -0.19)) - 0.08));
    return d - STROKE;
  }
  // "@": a ring around a small "a"
  float d = abs(length(q) - 0.25);
  d = min(d, abs(length(q - vec2(-0.02, 0.0)) - 0.1));
  d = min(d, segment(q, vec2(0.08, 0.1), vec2(0.08, -0.12)));
  return d - 0.8 * STROKE;
}

// the brightness of a color, from 0 to 1, as a character density
float density(vec4 c) {
  return floor(pow(clamp(dot(c.rgb, vec3(0.299, 0.587, 0.114)) * c.a, 0.0, 1.0), 0.75) * 9.99);
}

// the average color of a cell, from 4 samples
vec4 cellColor(vec2 center, vec2 dims, bool incoming) {
  vec4 c = vec4(0.0);
  for (int i = 0; i < 4; i++) {
    vec2 o = (vec2(mod(float(i), 2.0), floor(float(i) / 2.0)) - 0.5) * 0.5 * dims;
    vec2 st = clamp((center + o) / vec2(ratio, 1.0) + 0.5, 0.0, 1.0);
    c += incoming ? getToColor(st) : getFromColor(st);
  }
  return c * 0.25;
}

vec4 transition(vec2 uv) {
  float p = progress;
  float h = cellSize;
  vec2 fp = (uv - 0.5) * vec2(ratio, 1.0);
  vec2 dims = vec2(ASPECT * h, h);
  vec2 cell = floor(fp / dims);
  vec2 center = (cell + 0.5) * dims;
  vec2 q = (fp - center) / h;

  // each cell switches to the incoming image at its own time, scrambling through
  // random characters around it
  float r = hash12(cell + 100.0);
  float at = 0.4 + 0.2 * r;
  bool incoming = p > at;
  vec4 c = cellColor(center, dims, incoming);
  float g = density(c);
  float scramble = 1.0 - smoothstep(0.02, 0.045, abs(p - at));
  if (hash12(cell + floor(p * 40.0) * vec2(17.0, 31.0)) < scramble) {
    g = 1.0 + floor(9.0 * hash12(cell * 1.7 + floor(p * 40.0) * vec2(5.0, 11.0)));
  }

  float cover = 1.0 - smoothstep(-0.02, 0.02, glyph(g, q));
  vec3 tint = colored ? mix(c.rgb, c.rgb / max(max(c.r, max(c.g, c.b)), 0.05), 0.7) : ink.rgb;
  float alpha = colored ? c.a : ink.a * c.a;
  // where the image is transparent, so are the characters and their background
  // colored characters glow faintly over their cell, so the picture stays readable
  vec3 behind = colored ? mix(background.rgb, c.rgb, 0.3) : background.rgb;
  vec4 back = vec4(behind, background.a * c.a);
  vec4 text = mix(back, vec4(clamp(tint, 0.0, 1.0), alpha), cover);

  // each cell dissolves into its character at its own time, from 0.05 to 0.35,
  // and back into the incoming image from 0.65 to 0.95
  float into = 0.05 + 0.22 * hash12(cell + 200.0);
  float outof = 0.95 - 0.22 * hash12(cell + 300.0);
  float show = smoothstep(into, into + 0.08, p) * (1.0 - smoothstep(outof - 0.08, outof, p));
  vec4 image = p < 0.5 ? getFromColor(uv) : getToColor(uv);
  return mix(image, text, show);
}
`,author:"gre",license:"MIT",description:"The image turns into text-mode characters, denser where it is brighter, the characters scramble into those of the incoming image, then resolve back into it",tags:["text","pattern","retro","digital"],params:{cellSize:{type:"float",default:.04,min:.01,max:.1,description:"Height of a character, in frame heights"},colored:{type:"bool",default:!0,description:"Color the characters with the image (otherwise, with the ink color)"},ink:{type:"vec4",default:[.3,1,.45,1],color:!0,description:"Color of the characters when they are not colored with the image"},background:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color behind the characters"}},textures:[],createdAt:"Sun, 1 Nov 2026 20:41:06 +0100",updatedAt:"Sun, 1 Nov 2026 20:41:06 +0100"},{name:"BandWipe",paramsTypes:{bands:"int",vertical:"bool",smoothness:"float",stagger:"float"},defaultParams:{bands:8,vertical:!1,smoothness:.02,stagger:.1},glsl:`// Author: gre
// License: MIT
// Description: Alternating bands wipe in from opposite sides together and interleave like fingers, while both images stay still
// Tags: wipe, stripes, interleave, horizontal

// @range(2, 40, 1) Number of bands
uniform int bands; // = 8
// @param Cut the frame into columns that wipe up and down instead of rows that wipe sideways
uniform bool vertical; // = false
// @range(0, 0.2) Softness of the bands' leading edges
uniform float smoothness; // = 0.02
// @range(0, 0.8) Delay between the first and the last band, so they cascade from the top (or the left)
uniform float stagger; // = 0.1

// half width of the antialiased edges, in frame heights
const float AA = 0.0015;

// how far band i has wiped in (0..1) at position a along the bands (0..l), alternate bands
// entering from opposite ends
float bandMask(float i, float n, float a, float l, float s) {
  // each band takes the same time, starting a little after the one before it from the top
  // (or the left)
  float k = vertical ? i : n - 1.0 - i;
  float g = clamp(stagger, 0.0, 0.95);
  float t = clamp((progress - g * k / max(n - 1.0, 1.0)) / (1.0 - g), 0.0, 1.0);
  t = mix(t, t * t * (3.0 - 2.0 * t), 0.5);
  float x = mod(i, 2.0) > 0.5 ? l - a : a;
  // the edge starts fully before the band and ends fully past it
  float c = mix(-s, l + s, t);
  return 1.0 - smoothstep(c - s, c + s, x);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  float n = float(bands < 1 ? 1 : bands);
  // along: position along the bands, in frame heights; across: position across them (0..1)
  float along = vertical ? uv.y : uv.x * ratio;
  float across = vertical ? uv.x : uv.y;
  float l = vertical ? 1.0 : ratio;
  // the antialiasing across the bands, in units of across
  float aaAcross = vertical ? AA / ratio : AA;
  float s = max(smoothness, AA);

  float f = across * n;
  float i = clamp(floor(f), 0.0, n - 1.0);
  float m = bandMask(i, n, along, l, s);

  // near a cut between two bands, blend with the neighbor band over a pixel or so so the cut
  // does not alias (at the frame's borders the neighbor is the band itself)
  float fr = f - i;
  float edge = min(fr, 1.0 - fr) / n;
  if (edge < aaAcross) {
    float j = clamp(fr < 0.5 ? i - 1.0 : i + 1.0, 0.0, n - 1.0);
    m = mix(bandMask(j, n, along, l, s), m, 0.5 + 0.5 * smoothstep(0.0, aaAcross, edge));
  }

  if (m <= 0.0) return getFromColor(uv);
  if (m >= 1.0) return getToColor(uv);
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  // mixed premultiplied, so transparent images do not bleed their color
  vec4 c = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"Alternating bands wipe in from opposite sides together and interleave like fingers, while both images stay still",tags:["wipe","stripes","interleave","horizontal"],params:{bands:{type:"int",default:8,min:2,max:40,step:1,description:"Number of bands"},vertical:{type:"bool",default:!1,description:"Cut the frame into columns that wipe up and down instead of rows that wipe sideways"},smoothness:{type:"float",default:.02,min:0,max:.2,description:"Softness of the bands' leading edges"},stagger:{type:"float",default:.1,min:0,max:.8,description:"Delay between the first and the last band, so they cascade from the top (or the left)"}},textures:[],createdAt:"Thu, 5 Nov 2026 07:30:55 +0100",updatedAt:"Thu, 5 Nov 2026 07:30:55 +0100"},{name:"BlockCover",paramsTypes:{blocks:"int",color:"vec4",pop:"float",smoothness:"float"},defaultParams:{blocks:16,color:[.95,.32,.26,1],pop:.5,smoothness:.03},glsl:`// Author: gre
// License: MIT
// Description: Blocks of a solid color pop in at random over the outgoing image until they cover the frame, then pop out in another random order to show the incoming image
// Tags: blocks, grid, squares, color, cover

// @range(1, 40, 1) Number of blocks along the longer side of the frame (the blocks stay about square)
uniform int blocks; // = 16
// @color Color of the blocks
uniform vec4 color; // = vec4(0.95, 0.32, 0.26, 1.0)
// @range(0, 1) How much a block overshoots its cell as it pops in
uniform float pop; // = 0.5
// @range(0, 0.5) Softness of the blocks' edges, in blocks
uniform float smoothness; // = 0.03

const float duration = 0.14; // of one block's pop, in progress
const float cut = 0.45; // the frame is fully covered from cut - hold to cut + hold
const float hold = 0.02;

float hash (vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// eases from 0 to 1, a little past 1 (more with a larger c) and back
float backOut (float t, float c) {
  float u = t - 1.0;
  return 1.0 + (c + 1.0) * u * u * u + c * u * u;
}

// when a cell's block starts to pop in (.x) and to pop out (.y)
vec2 timing (vec2 cell) {
  return vec2(
    (cut - hold - duration) * hash(cell + 0.5),
    cut + hold + (1.0 - cut - hold - duration) * hash(cell + 71.7));
}

// scale of the block of a cell: 0 when it is not there, 1 when it fills its cell
float blockScale (vec2 cell, float c) {
  vec2 t = timing(cell);
  float a = clamp((progress - t.x) / duration, 0.0, 1.0);
  float b = clamp((progress - t.y) / duration, 0.0, 1.0);
  // it grows from nothing with an overshoot, and shrinks back to nothing
  return b > 0.0 ? (1.0 - b) * (1.0 - b) : backOut(a, c);
}

// how much of the point q (in cells) the block of a cell covers
float coverage (vec2 q, vec2 cell, float s, float sm) {
  // at scale 1, its solid part fills the whole cell, so that a covered frame shows no seams
  float h = s * (0.5 + sm);
  vec2 d = abs(q - cell - 0.5);
  return s > 0.0 ? 1.0 - smoothstep(h - sm, h, max(d.x, d.y)) : 0.0;
}

vec4 transition (vec2 uv) {
  float nLong = max(float(blocks), 1.0);
  vec2 n = ratio >= 1.0
    ? vec2(nLong, max(1.0, floor(nLong / ratio + 0.5)))
    : vec2(max(1.0, floor(nLong * ratio + 0.5)), nLong);
  vec2 q = uv * n;
  vec2 cell = floor(q);
  float sm = max(smoothness, 0.001);
  float c = 2.0 * clamp(pop, 0.0, 1.0);
  float s = blockScale(cell, c);
  if (s >= 1.0) return color;
  float cover = coverage(q, cell, s, sm);
  // a neighbour's block can overshoot onto this cell, near its border only
  float u = -2.0 * c / (3.0 * (c + 1.0));
  float reach = backOut(1.0 + u, c) * (0.5 + sm);
  vec2 o = abs(q - cell - 0.5);
  if (max(o.x, o.y) > 1.0 - reach) {
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 nb = cell + vec2(float(i), float(j));
        vec2 inside = step(vec2(0.0), nb) * step(nb, n - 1.0);
        if (inside.x * inside.y > 0.0 && (i != 0 || j != 0)) {
          cover = max(cover, coverage(q, nb, blockScale(nb, c), sm));
        }
      }
    }
  }
  // each cell switches to the incoming image while its own block covers it
  vec2 t = timing(cell);
  vec4 under = progress < 0.5 * (t.x + duration + t.y) ? getFromColor(uv) : getToColor(uv);
  return mix(under, color, cover);
}
`,author:"gre",license:"MIT",description:"Blocks of a solid color pop in at random over the outgoing image until they cover the frame, then pop out in another random order to show the incoming image",tags:["blocks","grid","squares","color","cover"],params:{blocks:{type:"int",default:16,min:1,max:40,step:1,description:"Number of blocks along the longer side of the frame (the blocks stay about square)"},color:{type:"vec4",default:[.95,.32,.26,1],color:!0,description:"Color of the blocks"},pop:{type:"float",default:.5,min:0,max:1,description:"How much a block overshoots its cell as it pops in"},smoothness:{type:"float",default:.03,min:0,max:.5,description:"Softness of the blocks' edges, in blocks"}},textures:[],createdAt:"Mon, 2 Nov 2026 09:50:49 +0100",updatedAt:"Mon, 2 Nov 2026 09:50:49 +0100"},{name:"BlockSlide",paramsTypes:{grid:"ivec2",direction:"vec2",stagger:"float",zoom:"float",background:"vec4"},defaultParams:{grid:[5,4],direction:[1,0],stagger:.6,zoom:.35,background:[0,0,0,1]},glsl:`// Author: gre
// License: MIT
// Description: The frame is cut into a grid of blocks that slide out one after another in a staggered cascade, some of them shrinking as they go, while the blocks of the incoming image slide in behind them to take their place
// Tags: slide, blocks, grid, directional, zoom

// @param Number of blocks (columns, rows), at most 40 along the direction
uniform ivec2 grid; // = ivec2(5, 4)
// @param Direction the blocks slide toward (rounded to the nearest axis)
uniform vec2 direction; // = vec2(1.0, 0.0)
// @range(0, 0.95) Share of the transition over which the blocks set off one after another (0 slides them all together)
uniform float stagger; // = 0.6
// @range(0, 0.9) How much the zooming blocks shrink on their way, as a share of their size
uniform float zoom; // = 0.35
// @color Color seen in the gaps between the blocks
uniform vec4 background; // = vec4(0.0, 0.0, 0.0, 1.0)

// blocks per strip, at most
const int MAX_BLOCKS = 40;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  bool vertical = abs(direction.y) > abs(direction.x);
  bool backward = vertical ? direction.y < 0.0 : direction.x < 0.0;
  vec2 g = max(vec2(grid), 1.0);
  // a: position along the motion, toward which the blocks slide, b: across it
  float a = vertical ? uv.y : uv.x;
  float b = vertical ? uv.x : uv.y;
  if (backward) a = 1.0 - a;
  float n = min(vertical ? g.y : g.x, float(MAX_BLOCKS));
  float strips = vertical ? g.x : g.y;
  // every block of a strip slides along it, so a point can only show a block of its own strip
  float r = min(floor(b * strips), strips - 1.0);
  // the strips set off one after another, from the top (or the left)
  float rowOrder = strips > 1.0 ? (vertical ? r : strips - 1.0 - r) / (strips - 1.0) : 0.0;
  float st = clamp(stagger, 0.0, 0.95);
  float z = clamp(zoom, 0.0, 0.9);
  // in blocks
  float an = a * n;
  float bn = b * strips - r;

  // the incoming blocks follow the last outgoing block to leave, the rear one: they all
  // stay behind it, so no block ever overlaps another, and each one gets closer to the
  // block ahead of it until they all arrive together
  float rear = clamp((progress - st * mix(rowOrder, 1.0, 0.2)) / (1.0 - st), 0.0, 1.0);
  rear = rear * rear * (3.0 - 2.0 * rear);

  for (int k = 0; k < MAX_BLOCKS; k++) {
    float i = float(k);
    if (i >= n) break;
    // the block at the front sets off first, so that the outgoing blocks move apart
    float order = mix(rowOrder, n > 1.0 ? (n - 1.0 - i) / (n - 1.0) : 0.0, 0.2);
    float p = clamp((progress - st * order) / (1.0 - st), 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);
    float pin = max(0.0, 1.0 - (1.0 - rear) * (1.0 + (n - 1.0 - i) / n));
    // about half of the blocks shrink as they leave, and their incoming blocks grow as they come
    float zi = hash(vec2(i, r) + 3.7) < 0.5 ? z : 0.0;
    // position in the block, from its corner, for the outgoing block (xy), which travels the
    // frame's length to leave it, and the incoming one (zw), from one length behind; at rest,
    // the blocks tile the frame exactly
    float sFrom = 1.0 - zi * p * p;
    float sTo = 1.0 - zi * (1.0 - pin) * (1.0 - pin);
    vec4 l = vec4(
      (an - i - p * n - 0.5 * (1.0 - sFrom)) / sFrom,
      (bn - 0.5 * (1.0 - sFrom)) / sFrom,
      (an - i - (pin - 1.0) * n - 0.5 * (1.0 - sTo)) / sTo,
      (bn - 0.5 * (1.0 - sTo)) / sTo);
    bool inFrom = all(greaterThanEqual(l.xy, vec2(0.0))) && all(lessThan(l.xy, vec2(1.0)));
    bool inTo = all(greaterThanEqual(l.zw, vec2(0.0))) && all(lessThan(l.zw, vec2(1.0)));
    if (inFrom || inTo) {
      // back to the frame's coordinates
      vec2 q = (vec2(i, r) + (inTo ? l.zw : l.xy)) / vec2(n, strips);
      if (backward) q.x = 1.0 - q.x;
      q = vertical ? q.yx : q;
      return inTo ? getToColor(q) : getFromColor(q);
    }
  }
  return background;
}
`,author:"gre",license:"MIT",description:"The frame is cut into a grid of blocks that slide out one after another in a staggered cascade, some of them shrinking as they go, while the blocks of the incoming image slide in behind them to take their place",tags:["slide","blocks","grid","directional","zoom"],params:{grid:{type:"ivec2",default:[5,4],description:"Number of blocks (columns, rows), at most 40 along the direction"},direction:{type:"vec2",default:[1,0],description:"Direction the blocks slide toward (rounded to the nearest axis)"},stagger:{type:"float",default:.6,min:0,max:.95,description:"Share of the transition over which the blocks set off one after another (0 slides them all together)"},zoom:{type:"float",default:.35,min:0,max:.9,description:"How much the zooming blocks shrink on their way, as a share of their size"},background:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color seen in the gaps between the blocks"}},textures:[],createdAt:"Wed, 4 Nov 2026 20:11:46 +0100",updatedAt:"Wed, 4 Nov 2026 20:11:46 +0100"},{name:"BloomDissolve",paramsTypes:{spread:"float",threshold:"float",intensity:"float",tint:"vec3"},defaultParams:{spread:.25,threshold:.6,intensity:1.5,tint:[1,.9,.75]},glsl:`// Author: gre
// License: MIT
// Description: The highlights of the outgoing image blow out into a soft, wide glow that floods the frame; under it the incoming image takes over, then the glow subsides back into its highlights while the image stays sharp
// Tags: light, glow, bloom, dissolve

// @range(0, 0.6) Reach of the glow at the peak, in frame heights
uniform float spread; // = 0.25
// @range(0, 1) Brightness above which the image glows (the whole frame does at the peak)
uniform float threshold; // = 0.6
// @range(0, 4) Brightness of the glow
uniform float intensity; // = 1.5
// @color Tint of the glow, toward its edges
uniform vec3 tint; // = vec3(1.0, 0.9, 0.75)

// pairs of opposite taps: 20 reads per pixel
const int PAIRS = 10;
const float GOLDEN_ANGLE = 2.399963;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// the image on screen at a point, premultiplied: one image, or both during the short switch
vec4 image(vec2 st, float m) {
  if (m <= 0.0) {
    vec4 c = getFromColor(st);
    return vec4(c.rgb * c.a, c.a);
  }
  if (m >= 1.0) {
    vec4 c = getToColor(st);
    return vec4(c.rgb * c.a, c.a);
  }
  vec4 a = getFromColor(st);
  vec4 b = getToColor(st);
  return mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);
}

// the light of a pixel (premultiplied): its color above the knee, full well before white
vec3 glow(vec4 c, float knee) {
  float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  return c.rgb * smoothstep(knee, knee + max(0.3 * (1.0 - knee), 1e-3), lum);
}

vec4 transition(vec2 uv) {
  float p = progress;
  // the glow blooms on the outgoing image, and subsides on the incoming one
  float amount = 4.0 * p * (1.0 - p);
  float peak = amount * amount;
  // around the middle, the whole frame catches the light and floods with glow
  float flood = peak * peak * peak;
  // the switch, under the glow at its brightest
  float m = smoothstep(0.44, 0.56, p);
  if (amount <= 0.0) return m < 0.5 ? getFromColor(uv) : getToColor(uv);

  // the image stays sharp underneath (premultiplied colors, only the images on screen are read)
  vec4 c = image(uv, m);
  if (c.a <= 0.0) return vec4(0.0);
  c.rgb /= c.a;

  // more and more of the image catches the light as the glow grows
  float knee = threshold * (1.0 - 0.3 * peak) * (1.0 - flood);
  float radius = spread * amount;
  // a rotation and a radial shift of the spiral for each pixel blend the taps into a smooth glow;
  // hashed by integer cell so that every GPU computes the same values
  vec2 cell = floor(uv * vec2(ratio, 1.0) * 997.0);
  float spin = 6.2831853 * hash12(cell);
  float shift = hash12(cell + 71.0);

  // a golden-angle spiral, denser toward the center so the glow is bright at its core with a wide soft tail;
  // each tap is read with its opposite, which cancels most of the noise across smooth gradients
  vec3 bloom = vec3(0.0);
  vec4 soft = vec4(0.0);
  float total = 0.0;
  for (int i = 0; i < PAIRS; i++) {
    float s = (float(i) + shift) / float(PAIRS);
    float r = s * s;
    float a = float(i) * GOLDEN_ANGLE + spin;
    vec2 offset = radius * r * vec2(cos(a) / ratio, sin(a));
    vec4 i0 = image(mirror(uv + offset), m);
    vec4 i1 = image(mirror(uv - offset), m);
    vec3 l = glow(i0, knee) + glow(i1, knee);
    // the sparse outer taps weigh less, so the tail of the glow stays smooth
    float w = 1.0 - 0.75 * s;
    // white at the core, tinted toward the edges
    bloom += w * mix(vec3(1.0), tint, smoothstep(0.0, 0.5, r)) * l;
    total += w;
    // a closer blur of the image, to soften it
    float sw = (1.0 - s) * (1.0 - s);
    soft += sw * (i0 + i1);
  }
  bloom /= 2.0 * total;
  // at the peak the light softens the image itself, which hides the switch
  vec3 blurred = soft.a > 0.0 ? soft.rgb / soft.a : c.rgb;
  vec3 base = mix(c.rgb, blurred, 0.7 * flood);
  bloom *= intensity * peak * (1.0 + 2.0 * flood);
  // compressed, so that the glow floods the frame without flattening into white
  bloom = 0.92 * (1.0 - exp(-bloom));

  // the glow is a light screened over the image: it adds nothing to its alpha
  base = min(base * (1.0 + 0.25 * peak), 1.0);
  return vec4(base + bloom - base * bloom, c.a);
}
`,author:"gre",license:"MIT",description:"The highlights of the outgoing image blow out into a soft, wide glow that floods the frame; under it the incoming image takes over, then the glow subsides back into its highlights while the image stays sharp",tags:["light","glow","bloom","dissolve"],params:{spread:{type:"float",default:.25,min:0,max:.6,description:"Reach of the glow at the peak, in frame heights"},threshold:{type:"float",default:.6,min:0,max:1,description:"Brightness above which the image glows (the whole frame does at the peak)"},intensity:{type:"float",default:1.5,min:0,max:4,description:"Brightness of the glow"},tint:{type:"vec3",default:[1,.9,.75],color:!0,description:"Tint of the glow, toward its edges"}},textures:[],createdAt:"Mon, 2 Nov 2026 21:47:56 +0100",updatedAt:"Mon, 2 Nov 2026 21:47:56 +0100"},{name:"BokehDissolve",paramsTypes:{radius:"float",blades:"int",threshold:"float",intensity:"float"},defaultParams:{radius:.05,blades:0,threshold:.7,intensity:1},glsl:`// Author: gre
// License: MIT
// Description: The image falls out of focus like a camera lens, its highlights swelling into large bright bokeh discs, and the incoming image sharpens back out of its own bokeh
// Tags: blur, bokeh, lens, dissolve, light

// @range(0.01, 0.15) Radius of the bokeh discs at the peak, in frame heights
uniform float radius; // = 0.05
// @range(0, 9) Number of aperture blades, which shape the discs into polygons (below 3: round)
uniform int blades; // = 0
// @range(0, 1) Brightness above which a pixel is a highlight that swells into a disc
uniform float threshold; // = 0.7
// @range(0, 3) Brightness of the bokeh discs
uniform float intensity; // = 1.0

#define PI 3.141592653589793
const int TAPS = 16;

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// a hash of an integer cell, stable across precisions
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// how much a pixel is a highlight: none below the threshold, full at white
float highlight(vec4 c, float t) {
  float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  // nothing is brighter than white, so a threshold of 1 makes no highlights
  if (t >= 1.0) return 0.0;
  float h = smoothstep(t, 1.0, lum);
  return h * h * c.a;
}

vec4 transition(vec2 uv) {
  // the lens defocuses then focuses back: 0 at both ends, 1 at the peak
  float t = 1.0 - abs(2.0 * progress - 1.0);
  float k = t * t * (3.0 - 2.0 * t);
  // the incoming image takes over while everything is out of focus
  float w = smoothstep(0.35, 0.65, progress);
  float r = radius * k;
  // the highlights weigh more as they swell, so they read as bright discs
  float boost = 12.0 * intensity * k;

  // fewer than 3 blades: a round aperture
  float n = blades >= 3 ? float(blades) : 0.0;
  float sector = n > 0.0 ? 2.0 * PI / n : 1.0;
  float apothem = cos(0.5 * sector);

  // per-pixel stratification of the taps over the disc, so its edge stays crisp
  vec2 cell = floor(uv * vec2(ratio, 1.0) * 997.0);
  float spin = 2.0 * PI * hash12(cell);
  float jitter = hash12(cell + 17.0);

  // each image is only read while it shows
  bool useFrom = w < 1.0;
  bool useTo = w > 0.0;
  // premultiplied, weighted sums of each image, and the light of their highlights,
  // starting with the pixel itself
  vec4 s0 = vec4(0.0);
  vec4 s1 = vec4(0.0);
  float t0 = 0.0;
  float t1 = 0.0;
  vec3 l0 = vec3(0.0);
  vec3 l1 = vec3(0.0);
  if (useFrom) {
    vec4 c = getFromColor(uv);
    float h = highlight(c, threshold);
    float wt = 1.0 + boost * h;
    s0 = wt * vec4(c.rgb * c.a, c.a);
    t0 = wt;
    l0 = h * c.rgb;
  }
  if (useTo) {
    vec4 c = getToColor(uv);
    float h = highlight(c, threshold);
    float wt = 1.0 + boost * h;
    s1 = wt * vec4(c.rgb * c.a, c.a);
    t1 = wt;
    l1 = h * c.rgb;
  }
  for (int i = 0; i < TAPS; i++) {
    float fi = float(i);
    float a = fi * 2.39996323 + spin;
    float d = sqrt((fi + jitter) / float(TAPS));
    if (n > 0.0) {
      // the aperture's polygon: its boundary in the direction of the tap
      float s = mod(a, sector) - 0.5 * sector;
      d *= apothem / cos(s);
    }
    vec2 st = mirror(uv + r * d * vec2(cos(a) / ratio, sin(a)));
    if (useFrom) {
      vec4 c = getFromColor(st);
      float h = highlight(c, threshold);
      float wt = 1.0 + boost * h;
      s0 += wt * vec4(c.rgb * c.a, c.a);
      t0 += wt;
      l0 += h * c.rgb;
    }
    if (useTo) {
      vec4 c = getToColor(st);
      float h = highlight(c, threshold);
      float wt = 1.0 + boost * h;
      s1 += wt * vec4(c.rgb * c.a, c.a);
      t1 += wt;
      l1 += h * c.rgb;
    }
  }
  vec4 b = mix(useFrom ? s0 / t0 : vec4(0.0), useTo ? s1 / t1 : vec4(0.0), w);
  if (b.a <= 0.0) {
    return vec4(0.0);
  }
  vec3 rgb = b.rgb / b.a;
  // the discs glow: light lifts the color, never the alpha
  vec3 light = mix(l0, l1, w) * (intensity * k * 4.0 / float(TAPS + 1));
  rgb = 1.0 - (1.0 - clamp(rgb, 0.0, 1.0)) * exp(-light);
  return vec4(rgb, b.a);
}
`,author:"gre",license:"MIT",description:"The image falls out of focus like a camera lens, its highlights swelling into large bright bokeh discs, and the incoming image sharpens back out of its own bokeh",tags:["blur","bokeh","lens","dissolve","light"],params:{radius:{type:"float",default:.05,min:.01,max:.15,description:"Radius of the bokeh discs at the peak, in frame heights"},blades:{type:"int",default:0,min:0,max:9,description:"Number of aperture blades, which shape the discs into polygons (below 3: round)"},threshold:{type:"float",default:.7,min:0,max:1,description:"Brightness above which a pixel is a highlight that swells into a disc"},intensity:{type:"float",default:1,min:0,max:3,description:"Brightness of the bokeh discs"}},textures:[],createdAt:"Mon, 2 Nov 2026 20:51:47 +0100",updatedAt:"Mon, 2 Nov 2026 20:51:47 +0100"},{name:"BookFlip",paramsTypes:{perspective:"float",shading:"float",curl:"float"},defaultParams:{perspective:.5,shading:.6,curl:.5},glsl:`// Author: hong
// License: MIT
// Description: The right half of the outgoing image is a book page that turns over from right to left on the spine at the middle of the frame, curling near its free edge, its back bringing the left half of the incoming image
// Tags: page, flip, 3d

// @range(0, 1) Strength of the perspective: the page grows as it lifts toward the viewer
uniform float perspective; // = 0.5
// @range(0, 1) How much the page darkens as it turns away from the light, and the shadows it casts
uniform float shading; // = 0.6
// @range(0, 1) How much the page bends near its free edge, which trails behind as it turns
uniform float curl; // = 0.5

const float PI = 3.141592653589793;
// width of the anti-aliased edges, as a part of the frame's height
const float EDGE = 0.0015;
// part of the page's width that curls
const float CURL_PART = 0.45;
// direction of the light, in (x, height toward the viewer)
const vec2 LIGHT = vec2(-0.447214, 0.894427);

float cross2(vec2 a, vec2 b) {
  return a.x * b.y - a.y * b.x;
}

// the page's angle, 0 lying on the right to PI lying on the left: eased, but never at rest
float pageAngle() {
  float p = clamp(progress, 0.0, 1.0);
  return PI * p * (0.35 + p * (1.95 - 1.3 * p));
}

// The page is seen in a cross-section across the spine, in (x, height toward the viewer) from the spine:
// a straight part at angle a from the spine, then, when k is not 0, an arc of curvature k centered on c up to its free edge,
// extruded along y. Returns the nearest point of the page hit by the ray from eye along dir:
// (ray length, distance along the page, angle there), with a negative ray length when it is missed.
vec3 hitPage(vec2 eye, vec2 dir, float a, float k, float straight, vec2 c, float w) {
  vec3 best = vec3(-1.0, 0.0, 0.0);
  vec2 d = vec2(cos(a), sin(a));
  // the straight part
  float den = cross2(d, dir);
  if (abs(den) > 1e-7) {
    float u = cross2(eye, dir) / den;
    float t = cross2(eye, d) / den;
    if (t > 0.0 && u >= 0.0 && u <= straight) best = vec3(t, u, a);
  }
  if (k != 0.0) {
    float r = 1.0 / k;
    vec2 oc = eye - c;
    float qa = dot(dir, dir);
    float qb = dot(oc, dir);
    float disc = qb * qb - qa * (dot(oc, oc) - r * r);
    if (disc >= 0.0) {
      float sq = sqrt(disc);
      for (int i = 0; i < 2; i++) {
        float t = (-qb + (i == 0 ? -sq : sq)) / qa;
        if (t > 0.0 && (best.x < 0.0 || t < best.x)) {
          // (sin(b), -cos(b)) where b is the angle of the page at that point
          vec2 v = (oc + t * dir) * k;
          float db = atan(v.x, -v.y) - a;
          db -= 2.0 * PI * floor((db + PI) / (2.0 * PI));
          float s = db / k;
          if (s >= 0.0 && s <= w - straight) best = vec3(t, straight + s, a + db);
        }
      }
    }
  }
  return best;
}

// the point of the curled part of the page where its angle is b
vec2 curlPoint(vec2 c, float k, float b) {
  return c + vec2(sin(b), -cos(b)) / k;
}

vec4 transition (vec2 uv) {
  float a = pageAngle();
  float lift = sin(a);
  // half the frame's width: the page's width
  float w = 0.5 * ratio;
  float x = uv.x * ratio - w;
  // the viewer is above the spine, the page lifting toward it
  float dist = w * (1.0 + 1.5 / max(perspective, 0.01));
  vec2 eye = vec2(0.0, dist);
  vec2 dir = vec2(x, -dist);

  // the shape of the page: straight, then curled with its free edge trailing behind (a negative curvature)
  vec2 d = vec2(cos(a), sin(a));
  float k = -clamp(curl, 0.0, 1.0) * lift / (CURL_PART * w);
  if (abs(k) * CURL_PART * w <= 1e-4) k = 0.0;
  float straight = k != 0.0 ? (1.0 - CURL_PART) * w : w;
  vec2 c = straight * d + vec2(-d.y, d.x) / (k != 0.0 ? k : 1.0);
  vec2 bend = straight * d;
  vec2 middle = k != 0.0 ? curlPoint(c, k, a + 0.5 * k * (w - straight)) : bend;
  vec2 edge = k != 0.0 ? curlPoint(c, k, a + k * (w - straight)) : bend;

  // anti-aliased edges, only once the page has left the frame's plane, so that it covers it exactly at both ends
  float aa = EDGE * min(20.0 * lift, 1.0);
  vec4 img = vec4(0.0);
  float m = 0.0;
  vec3 hit = hitPage(eye, dir, a, k, straight, c, w);
  if (hit.x > 0.0) {
    float t = hit.x;
    float u = hit.y;
    float b = hit.z;
    vec2 pt = eye + t * dir;
    // the height on the page, magnified as it comes closer (its top and bottom edges are out of the frame)
    float y = clamp(0.5 + (uv.y - 0.5) * t, 0.0, 1.0);
    // near its free edge, the distance to it on the screen
    float edgeX = edge.x * dist / max(dist - edge.y, 1e-4);
    m = aa > 0.0 && u > (k != 0.0 ? straight : 0.5 * w) ? clamp(abs(x - edgeX) / aa, 0.0, 1.0) : 1.0;
    vec2 normal = vec2(-sin(b), cos(b));
    bool front = dot(normal, eye - pt) > 0.0;
    img = front
      ? getFromColor(vec2(clamp(w + u, w, ratio) / ratio, y))
      : getToColor(vec2(clamp(w - u, 0.0, w) / ratio, y));
    // lit from the upper left: brighter as it turns toward the light, darker as it turns away, with a soft crease along the spine
    float diffuse = max(dot(front ? normal : -normal, LIGHT), 0.0) / LIGHT.y;
    float shade = mix(1.0, 0.25 + 0.75 * diffuse, shading);
    shade *= 1.0 - 0.35 * shading * lift * exp(-u / (0.04 * w));
    img.rgb *= shade;
    if (m >= 1.0) return img;
  }

  // the pages beneath: the outgoing image on the left, the incoming one on the right
  vec4 color = x < 0.0 ? getFromColor(uv) : getToColor(uv);
  // the lifted page shades them, the more it hides of the sky (and so the more near the spine and its free edge)
  vec2 toEdge = edge - vec2(x, 0.0);
  float cosEdge = toEdge.x / max(length(toEdge), 1e-6);
  float blocked = 0.5 * abs((x < 0.0 ? 1.0 : -1.0) - cosEdge);
  float shadow = blocked * blocked * (3.0 - 2.0 * blocked);
  // and casts a shadow, the light coming from the upper left, softer as the page is higher
  float slope = -LIGHT.x / LIGHT.y;
  vec3 reach = vec3(bend.x, middle.x, edge.x) + slope * vec3(bend.y, middle.y, edge.y);
  float lo = min(0.0, min(reach.x, min(reach.y, reach.z)));
  float hi = max(0.0, max(reach.x, max(reach.y, reach.z)));
  float soft = max(0.25 * edge.y, 1e-5);
  shadow = max(0.5 * shadow, 0.85 * clamp(min(x - lo, hi - x) / soft + 0.5, 0.0, 1.0) * min(4.0 * lift, 1.0));
  color.rgb *= 1.0 - shading * shadow;
  return mix(color, img, m);
}
`,author:"hong",license:"MIT",description:"The right half of the outgoing image is a book page that turns over from right to left on the spine at the middle of the frame, curling near its free edge, its back bringing the left half of the incoming image",tags:["page","flip","3d"],params:{perspective:{type:"float",default:.5,min:0,max:1,description:"Strength of the perspective: the page grows as it lifts toward the viewer"},shading:{type:"float",default:.6,min:0,max:1,description:"How much the page darkens as it turns away from the light, and the shadows it casts"},curl:{type:"float",default:.5,min:0,max:1,description:"How much the page bends near its free edge, which trails behind as it turns"}},textures:[],createdAt:"Fri, 27 May 2022 19:13:57 +0800",updatedAt:"Sat, 7 Nov 2026 18:51:37 +0100"},{name:"Bounce",paramsTypes:{shadow_colour:"vec4",shadow_height:"float",bounces:"float"},defaultParams:{shadow_colour:[0,0,0,.6],shadow_height:.075,bounces:3},glsl:`// Author: Adrian Purser
// License: MIT
// Description: The outgoing image drops out of the frame with a few bounces, revealing the incoming one
// Tags: bounce, slide, vertical, shadow

// @color Color of the shadow cast on the incoming image
uniform vec4 shadow_colour; // = vec4(0.,0.,0.,.6)
// @range(0.01, 0.5) Height of the shadow, relative to the image height
uniform float shadow_height; // = 0.075
// @range(1, 10, 1) Number of bounces before settling
uniform float bounces; // = 3.0

const float PI = 3.14159265358;

vec4 transition (vec2 uv) {
  float time = progress;
  float stime = sin(time * PI / 2.);
  float phase = time * PI * bounces;
  float y = (abs(cos(phase))) * (1.0 - stime);
  float d = uv.y - y;
  vec4 to = getToColor(uv);
  return mix(
    mix(
      to,
      vec4(shadow_colour.rgb, 1.0), // shadow_colour.a is in the amount: the shadow darkens, it does not make the image transparent
      step(d, shadow_height) * (1. - mix(
        ((d / shadow_height) * shadow_colour.a) + (1.0 - shadow_colour.a),
        1.0,
        smoothstep(0.95, 1., progress) // fade-out the shadow at the end
      )) * to.a // cast on the incoming image, not on its transparent areas
    ),
    getFromColor(vec2(uv.x, uv.y + (1.0 - y))),
    step(d, 0.0)
  );
}
`,author:"Adrian Purser",license:"MIT",description:"The outgoing image drops out of the frame with a few bounces, revealing the incoming one",tags:["bounce","slide","vertical","shadow"],params:{shadow_colour:{type:"vec4",default:[0,0,0,.6],color:!0,description:"Color of the shadow cast on the incoming image"},shadow_height:{type:"float",default:.075,min:.01,max:.5,description:"Height of the shadow, relative to the image height"},bounces:{type:"float",default:3,min:1,max:10,step:1,description:"Number of bounces before settling"}},textures:[],createdAt:"Fri, 10 Nov 2017 17:01:45 +0000",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"BowTie",paramsTypes:{adjust:"float",reverse:"bool"},defaultParams:{adjust:.5,reverse:!1},glsl:`// Author: KMojek
// License: MIT
// Description: Two triangles grow from the top and bottom edges into a bow tie that reveals the incoming image, with an adjustable shape, and can run in reverse
// Tags: wipe, shape

uniform float adjust; // = 0.5
// @param Run the wipe in reverse
uniform bool reverse; // = false

float check(vec2 p1, vec2 p2, vec2 p3)
{
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

bool pointInTriangle(vec2 pt, vec2 p1, vec2 p2, vec2 p3)
{

    bool b1 = check(pt, p1, p2) < 0.0;
    bool b2 = check(pt, p2, p3) < 0.0;
    bool b3 = check(pt, p3, p1) < 0.0;
    return b1 == b2 && b2 == b3;
}

const float height = 0.5;

vec4 transition_firstHalf( vec2 uv, float prog )
{
  if ( uv.y < 0.5 )
  {
    vec2 botLeft = vec2( -0., prog-height );
    vec2 botRight = vec2( 1., prog-height );
    vec2 tip = vec2( adjust, prog );
    if ( pointInTriangle( uv, botLeft, botRight, tip ) )
        return getToColor(uv);
    }
  else
  {
    vec2 topLeft = vec2( -0., 1.-prog+height );
    vec2 topRight = vec2( 1., 1.-prog+height );
    vec2 tip = vec2( adjust, 1.-prog );
    if ( pointInTriangle( uv, topLeft, topRight, tip ) )
      return getToColor( uv );
  }
  return getFromColor( uv );
}

vec4 transition_secondHalf( vec2 uv, float prog )
{
  if ( uv.x > adjust )
  {
    vec2 top = vec2( prog + height,  1. );
    vec2 bot = vec2( prog + height, -0. );
    vec2 tip = vec2( mix( adjust, 1.0, 2.0 * (prog - 0.5) ), 0.5 );
    if ( pointInTriangle( uv, top, bot, tip) )
      return getFromColor( uv );
  }
  else
  {
    vec2 top = vec2( 1.0-prog - height,  1. );
    vec2 bot = vec2( 1.0-prog - height, -0. );
    vec2 tip = vec2( mix( adjust, 0.0, 2.0 * (prog - 0.5)  ), 0.5 );
    if ( pointInTriangle( uv, top, bot, tip) )
      return getFromColor( uv );
  }
  return getToColor( uv );
}

vec4 transition (vec2 uv) {
  if ( reverse )
    return ( progress < 0.5 ) ? transition_secondHalf( uv, 1.-progress ) : transition_firstHalf( uv, 1.-progress );
  else
    return ( progress < 0.5 ) ? transition_firstHalf( uv, progress ) : transition_secondHalf( uv, progress );
}`,author:"KMojek",license:"MIT",description:"Two triangles grow from the top and bottom edges into a bow tie that reveals the incoming image, with an adjustable shape, and can run in reverse",tags:["wipe","shape"],params:{adjust:{type:"float",default:.5},reverse:{type:"bool",default:!1,description:"Run the wipe in reverse"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Thu, 5 Nov 2026 11:34:33 +0100"},{name:"BowTieHorizontal",paramsTypes:{},defaultParams:{},glsl:`// Author: huynx
// License: MIT
// Description: Two triangles grow from the left and right edges into a bow tie that reveals the incoming image
// Tags: wipe, shape, horizontal

const vec2 bottom_left = vec2(0.0, 1.0);
const vec2 bottom_right = vec2(1.0, 1.0);
const vec2 top_left = vec2(0.0, 0.0);
const vec2 top_right = vec2(1.0, 0.0);
const vec2 center = vec2(0.5, 0.5);

float check(vec2 p1, vec2 p2, vec2 p3)
{
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

bool PointInTriangle (vec2 pt, vec2 p1, vec2 p2, vec2 p3)
{
    bool b1, b2, b3;
    b1 = check(pt, p1, p2) < 0.0;
    b2 = check(pt, p2, p3) < 0.0;
    b3 = check(pt, p3, p1) < 0.0;
    return ((b1 == b2) && (b2 == b3));
}

bool in_left_triangle(vec2 p){
  vec2 vertex1, vertex2, vertex3;
  vertex1 = vec2(progress, 0.5);
  vertex2 = vec2(0.0, 0.5-progress);
  vertex3 = vec2(0.0, 0.5+progress);
  if (PointInTriangle(p, vertex1, vertex2, vertex3))
  {
    return true;
  }
  return false;
}

bool in_right_triangle(vec2 p){
  vec2 vertex1, vertex2, vertex3;
  vertex1 = vec2(1.0-progress, 0.5);
  vertex2 = vec2(1.0, 0.5-progress);
  vertex3 = vec2(1.0, 0.5+progress);
  if (PointInTriangle(p, vertex1, vertex2, vertex3))
  {
    return true;
  }
  return false;
}

float blur_edge(vec2 bot1, vec2 bot2, vec2 top, vec2 testPt)
{
  vec2 lineDir = bot1 - top;
  vec2 perpDir = vec2(lineDir.y, -lineDir.x);
  vec2 dirToPt1 = bot1 - testPt;
  float dist1 = abs(dot(normalize(perpDir), dirToPt1));
  
  lineDir = bot2 - top;
  perpDir = vec2(lineDir.y, -lineDir.x);
  dirToPt1 = bot2 - testPt;
  float min_dist = min(abs(dot(normalize(perpDir), dirToPt1)), dist1);
  
  if (min_dist < 0.005) {
    return min_dist / 0.005;
  }
  else  {
    return 1.0;
  };
}


vec4 transition (vec2 uv) {
  if (in_left_triangle(uv))
  {
    if (progress < 0.1)
    {
      return getFromColor(uv);
    }
    if (uv.x < 0.5)
    {
      vec2 vertex1 = vec2(progress, 0.5);
      vec2 vertex2 = vec2(0.0, 0.5-progress);
      vec2 vertex3 = vec2(0.0, 0.5+progress);
      return mix(
        getFromColor(uv),
        getToColor(uv),
        blur_edge(vertex2, vertex3, vertex1, uv)
      );
    }
    else
    {
      if (progress > 0.0)
      {
        return getToColor(uv);
      }
      else
      {
        return getFromColor(uv);
      }
    }    
  }
  else if (in_right_triangle(uv))
  {
    if (uv.x >= 0.5)
    {
      vec2 vertex1 = vec2(1.0-progress, 0.5);
      vec2 vertex2 = vec2(1.0, 0.5-progress);
      vec2 vertex3 = vec2(1.0, 0.5+progress);
      return mix(
        getFromColor(uv),
        getToColor(uv),
        blur_edge(vertex2, vertex3, vertex1, uv)
      );  
    }
    else
    {
      return getFromColor(uv);
    }
  }
  else {
    return getFromColor(uv);
  }
}`,author:"huynx",license:"MIT",description:"Two triangles grow from the left and right edges into a bow tie that reveals the incoming image",tags:["wipe","shape","horizontal"],params:{},textures:[],createdAt:"Sat, 24 Mar 2018 12:54:26 +0100",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"BrushWipe",paramsTypes:{strokes:"float",angle:"float",roughness:"float",waviness:"float"},defaultParams:{strokes:4,angle:-7,roughness:.6,waviness:.5},glsl:`// Author: gre
// License: MIT
// Description: A few broad brush strokes sweep across the frame in turn, back and forth, painting in the incoming image with streaky bristle edges and dry, ragged ends
// Tags: wipe, paint, brush, organic

// @range(1, 8, 1) Number of brush strokes needed to cover the frame
uniform float strokes; // = 4.0
// @range(-45, 45) Angle of the strokes, in degrees
uniform float angle; // = -7.0
// @range(0, 1) How rough the bristles make the edges and ends of the strokes
uniform float roughness; // = 0.6
// @range(0, 1) How much the strokes wave along their way
uniform float waviness; // = 0.5

const float PI = 3.141592653589793;

float hash (vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// value noise, smooth along both axes
float vnoise (vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// bristle streaks: fine across the stroke (t), long along it (u)
float bristles (float t, float u, float seed) {
  return 0.6 * vnoise(vec2(t * 26.0 + seed, u * 1.3 + seed)) + 0.4 * vnoise(vec2(t * 8.0 - seed, u * 0.7));
}

// one stroke: k its index, t the position across it (-1..1 is its core), u along it
// returns (coverage, wet streak shading)
vec2 stroke (float k, float t, float u, float U, float n, float h) {
  float dir = mod(k, 2.0) < 0.5 ? 1.0 : -1.0;
  float x = u * dir;
  float dur = min(1.0, 1.8 / (n + 0.8));
  float start = n > 1.0 ? k * (1.0 - dur) / (n - 1.0) : 0.0;
  float s = clamp((progress - start) / dur, 0.0, 1.0);
  s = mix(s, s * s * (3.0 - 2.0 * s), 0.7);
  float r = roughness;
  float lag = (0.15 + 0.6 * r) * h; // how far the longest bristles run ahead of the shortest
  float dry = (0.1 + 0.9 * r) * h; // length of the streaky, dry trail behind the head of the stroke
  // at the end even the shortest bristles, at the rounded corners, are past the far edge with their dry trail
  float head = mix(-U, U + lag + 0.3 * h + 1.15 * dry + 0.01, s);
  float b = bristles(t, k * 3.7, k * 17.0);
  float front = head - lag * (1.0 - b) - 0.3 * h * t * t; // a rounded, ragged head
  float streak = bristles(t * 1.7, x * 2.0 / h, k * 5.0 + 9.0);
  float along = clamp(((front - x) / (dry + 0.001) - 0.1 - 0.8 * streak) * 6.0, 0.0, 1.0);
  float fringe = 0.1 + 0.7 * r;
  float e = (abs(t) - 1.0) / fringe; // < 0 in the core of the stroke
  float reach = 0.5 + 0.5 * vnoise(vec2(x * 2.5 / h, k * 7.0 + (t > 0.0 ? 3.0 : 0.0))); // the edge wanders
  float hair = clamp(bristles(t * 1.4, x * 3.0 / h, k * 11.0 + 3.0) * 2.0 - 0.5, 0.0, 1.0);
  float side = clamp((reach * hair - e) * 12.0 + 1.0, 0.0, 1.0);
  float cover = along * side;
  float wet = (1.0 - clamp((progress - start - dur) / 0.25, 0.0, 1.0)) * min(1.0, (1.0 - progress) * 6.0);
  return vec2(cover, cover * wet * (bristles(t * 2.0, x * 2.0 / h, k) - 0.5));
}

vec4 transition (vec2 uv) {
  float a = angle * PI / 180.0;
  float c = cos(a);
  float sn = sin(a);
  vec2 q = (uv - 0.5) * vec2(ratio, 1.0);
  float u = c * q.x + sn * q.y; // along the strokes
  float v = -sn * q.x + c * q.y; // across them
  float U = 0.5 * (abs(c) * ratio + abs(sn));
  float V = 0.5 * (abs(sn) * ratio + abs(c));
  float n = max(1.0, floor(strokes + 0.5));
  float h = 2.0 * V / n; // height of a stroke
  // waves shared by the neighbouring strokes so that they always tile the frame
  float A = 0.12 * waviness * h;
  float w = v + A * sin(u * 5.0 / U + v * 2.0 / h + 1.3) + 0.5 * A * sin(u * 11.0 / U - v * 3.0 / h);
  float y = (V + 1.5 * A - w) / (2.0 * V + 3.0 * A) * n; // strokes go from top to bottom
  float hh = (2.0 * V + 3.0 * A) / n;
  float k = clamp(floor(y), 0.0, n - 1.0);
  float cover = 0.0;
  float shade = 0.0;
  for (int i = -1; i <= 1; i++) {
    float j = k + float(i);
    if (j >= 0.0 && j <= n - 1.0) {
      vec2 s = stroke(j, (y - j - 0.5) * 2.0, u, U, n, hh);
      cover = max(cover, s.x);
      shade = mix(shade, s.y, s.x); // the latest stroke is on top
    }
  }
  vec4 from = getFromColor(uv);
  vec4 to = getToColor(uv);
  to.rgb = min(to.rgb * (1.0 + 0.2 * shade), 1.0);
  return mix(from, to, cover);
}
`,author:"gre",license:"MIT",description:"A few broad brush strokes sweep across the frame in turn, back and forth, painting in the incoming image with streaky bristle edges and dry, ragged ends",tags:["wipe","paint","brush","organic"],params:{strokes:{type:"float",default:4,min:1,max:8,step:1,description:"Number of brush strokes needed to cover the frame"},angle:{type:"float",default:-7,min:-45,max:45,description:"Angle of the strokes, in degrees"},roughness:{type:"float",default:.6,min:0,max:1,description:"How rough the bristles make the edges and ends of the strokes"},waviness:{type:"float",default:.5,min:0,max:1,description:"How much the strokes wave along their way"}},textures:[],createdAt:"Sun, 1 Nov 2026 20:25:47 +0100",updatedAt:"Sun, 1 Nov 2026 20:25:47 +0100"},{name:"BurnThrough",paramsTypes:{burnColor:"vec3"},defaultParams:{burnColor:[1,.5,0]},glsl:`// Author: liubailin2020@gmail.com
// License: MIT
// Description: The outgoing image burns away in noisy, glowing patches
// Tags: burn, fire, noise

// @color Color of the burning edges
uniform vec3 burnColor; // = vec3(1.0, 0.5, 0.0)

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 4
float fbm (in vec2 st) {
    float value = 0.0;
    float amplitude = .5;
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

vec4 transition (vec2 uv) {
    if (progress <= 0.0) return getFromColor(uv);
    if (progress >= 1.0) return getToColor(uv);
    vec4 from = getFromColor(uv);
    vec4 to = getToColor(uv);
    float n = fbm(uv * 4.);
    float l = smoothstep(progress, progress + 0.05, n);
    float edge = (1.0 - l) * l * 5.0;
    return mix(to, from, l) + vec4(burnColor, 0.0) * edge;
}
`,author:"liubailin2020@gmail.com",license:"MIT",description:"The outgoing image burns away in noisy, glowing patches",tags:["burn","fire","noise"],params:{burnColor:{type:"vec3",default:[1,.5,0],color:!0,description:"Color of the burning edges"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"ButterflyWaveScrawler",paramsTypes:{amplitude:"float",waves:"float",colorSeparation:"float"},defaultParams:{amplitude:1,waves:30,colorSeparation:.3},glsl:`// Author: mandubian
// License: MIT
// Description: Wavy, color-separated ripples scramble the outgoing image into the incoming one
// Tags: wave, distort, chromatic
uniform float amplitude; // = 1.0
uniform float waves; // = 30.0
uniform float colorSeparation; // = 0.3
const float PI = 3.14159265358979323846264;
float compute(vec2 p, float progress, vec2 center) {
vec2 o = p*sin(progress * amplitude)-center;
// horizontal vector
vec2 h = vec2(1., 0.);
// butterfly polar function (don't ask me why this one :))
float theta = acos(dot(o, h)) * waves;
float s = sin((2.*theta - PI) / 24.);
float s2 = s * s;
return (exp(cos(theta)) - 2.*cos(4.*theta) + s2 * s2 * s) / 10.;
}
vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);
  vec2 p = uv;
  float inv = 1. - progress;
  float disp = compute(p, progress, vec2(0.5, 0.5));
  vec4 texTo = getToColor(p + inv*disp);
  vec4 fromCenter = getFromColor(p + progress*disp);
  vec4 texFrom = vec4(
    getFromColor(p + progress*disp*(1.0 - colorSeparation)).r,
    fromCenter.g,
    getFromColor(p + progress*disp*(1.0 + colorSeparation)).b,
    fromCenter.a);
  return texTo*progress + texFrom*inv;
}
`,author:"mandubian",license:"MIT",description:"Wavy, color-separated ripples scramble the outgoing image into the incoming one",tags:["wave","distort","chromatic"],params:{amplitude:{type:"float",default:1},waves:{type:"float",default:30},colorSeparation:{type:"float",default:.3}},textures:[],createdAt:"Thu, 1 Jun 2017 11:47:17 +0200",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"CameraShake",paramsTypes:{strength:"float",jolts:"float",blur:"float",split:"float"},defaultParams:{strength:.5,jolts:12,blur:.5,split:.5},glsl:`// Author: gre
// License: MIT
// Description: The camera jolts violently in random directions, with motion blur and color fringes along each jolt; the cut happens at the peak of the shake, which then settles on the incoming image
// Tags: shake, camera, motion-blur, chromatic, impact

// @range(0, 1) How far the camera jolts (and rolls) at the peak of the shake
uniform float strength; // = 0.5
// @range(4, 32) Number of jolts over the transition
uniform float jolts; // = 12.0
// @range(0, 1) Length of the motion blur along each jolt
uniform float blur; // = 0.5
// @range(0, 1) How far the color channels split apart along each jolt
uniform float split; // = 0.5

const int TAPS = 10;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// the camera position at jolt key k: offset (x, y) and roll, each in -1..1
vec3 jolt(float k) {
  // successive jolts go in nearly opposite directions
  float a = 2.4 * k + 1.2 * hash12(vec2(k, 11.0));
  float m = 0.55 + 0.45 * hash12(vec2(k, 23.0));
  return vec3(m * cos(a), m * sin(a), 2.0 * hash12(vec2(k, 37.0)) - 1.0);
}

// how strong the shake is at time t: it builds up quickly, peaks around the cut, then settles
float envelope(float t) {
  float h = clamp(1.6 * (1.0 - abs(2.0 * t - 1.0)), 0.0, 1.0);
  return h * h * (3.0 - 2.0 * h);
}

// the image seen by the camera at time t (in progress units), premultiplied
vec4 shot(vec2 uv, float t, bool incoming) {
  float env = envelope(t);
  // a key every 1/jolts, one of them exactly at the cut
  float s = (t - 0.5) * jolts;
  float k = floor(s);
  float g = 1.0 - (s - k);
  float e = 1.0 - g * g * g; // snaps to the next key, then holds
  vec3 j = mix(jolt(k), jolt(k + 1.0), e) * env;
  float omax = 0.14 * strength * env;
  float rmax = 0.07 * strength * env;
  vec2 off = j.xy * omax;
  float roll = j.z * rmax;
  // zoom in just enough that the frame edges never show, for any offset and roll up to these
  float zoom = (cos(rmax) + sin(rmax) * max(ratio, 1.0 / ratio)) / (1.0 - 2.0 * omax);
  vec2 q = (uv - 0.5) * vec2(ratio, 1.0);
  q = mat2(cos(roll), sin(roll), -sin(roll), cos(roll)) * q / zoom;
  vec2 p = mirror(q / vec2(ratio, 1.0) + 0.5 + off);
  vec4 c = incoming ? getToColor(p) : getFromColor(p);
  return vec4(c.rgb * c.a, c.a);
}

vec4 transition(vec2 uv) {
  // the exposure follows the shake: no blur at the very ends
  float open = envelope(progress);
  float shutter = 0.8 * blur / jolts * open;
  float lag = 0.2 * split / jolts * open;
  // each channel, premultiplied, and its alpha
  vec2 sumR = vec2(0.0);
  vec2 sumG = vec2(0.0);
  vec2 sumB = vec2(0.0);
  float wsum = 0.0;
  for (int i = 0; i < TAPS; i++) {
    float u = (float(i) + 0.5) / float(TAPS) - 0.5;
    float t = progress + u * shutter;
    // the trails fade out at both ends of the exposure
    float w = 1.0 - 1.4 * abs(u);
    // the cut happens during the exposure: the channels of a tap show the same image
    bool incoming = t >= 0.5;
    // red leads and blue trails the motion, so they split by the speed of the jolt
    vec4 r = shot(uv, t + lag, incoming);
    vec4 c = shot(uv, t, incoming);
    vec4 b = shot(uv, t - lag, incoming);
    sumR += w * r.ra;
    sumG += w * c.ga;
    sumB += w * b.ba;
    wsum += w;
  }
  float alpha = (sumR.y + sumG.y + sumB.y) / (3.0 * wsum);
  if (alpha <= 0.0) return vec4(0.0);
  vec3 color = vec3(
    sumR.x / max(sumR.y, 1e-5),
    sumG.x / max(sumG.y, 1e-5),
    sumB.x / max(sumB.y, 1e-5)
  );
  return vec4(color, alpha);
}
`,author:"gre",license:"MIT",description:"The camera jolts violently in random directions, with motion blur and color fringes along each jolt; the cut happens at the peak of the shake, which then settles on the incoming image",tags:["shake","camera","motion-blur","chromatic","impact"],params:{strength:{type:"float",default:.5,min:0,max:1,description:"How far the camera jolts (and rolls) at the peak of the shake"},jolts:{type:"float",default:12,min:4,max:32,description:"Number of jolts over the transition"},blur:{type:"float",default:.5,min:0,max:1,description:"Length of the motion blur along each jolt"},split:{type:"float",default:.5,min:0,max:1,description:"How far the color channels split apart along each jolt"}},textures:[],createdAt:"Tue, 3 Nov 2026 13:10:45 +0100",updatedAt:"Tue, 3 Nov 2026 13:10:45 +0100"},{name:"CardDeal",paramsTypes:{grid:"ivec2",deck:"vec2",spin:"float",shadow:"float"},defaultParams:{grid:[4,3],deck:[.5,-.4],spin:.6,shadow:.5},glsl:`// Author: gre
// License: MIT
// Description: The incoming image is dealt onto the frame like a hand of cards: tile after tile is flicked from below the frame, spinning through the air with a lifting shadow, and slides to a stop in its place until the picture is complete
// Tags: tiles, card, rotate, shadow, 3d

// @param Number of cards (columns, rows), at most 6 by 6
uniform ivec2 grid; // = ivec2(4, 3)
// @param Point the cards are dealt from, can be outside the frame
uniform vec2 deck; // = vec2(0.5, -0.4)
// @range(0, 2) Turns a card makes on its way, before it settles straight
uniform float spin; // = 0.6
// @range(0, 1) Darkness of the shadows the cards cast
uniform float shadow; // = 0.5

const float PI = 3.141592653589793;
const int MAX_CARDS = 36;
// time between two cards, relative to the time a card takes from the deck to its place
const float DEAL = 0.16;
// part of its way after which a card touches down and starts sliding
const float TOUCH = 0.55;
// speed of the throw, relative to an even pace
const float THROW = 2.2;
// length of the slide, in card heights
const float SLIDE = 0.35;
// highest point of a card's flight, and distance of the eye to the table, in frame heights
const float LIFT = 0.45;
const float EYE = 2.4;
// width of the anti-aliased edges, in frame heights
const float EDGE = 0.0015;

float hash(float n) {
  vec2 p = fract(vec2(n) * vec2(0.1031, 0.1030));
  p += dot(p, p.yx + 33.33);
  return fract((p.x + p.y) * p.x);
}

vec2 gridSize() {
  return clamp(vec2(grid), 1.0, 6.0);
}

// local time of card j: 0 on the deck, 1 once it lies still in its place
float cardTime(float j, float n) {
  // the last card lands at the end
  float flight = 1.0 / (1.0 + (n - 1.0) * DEAL);
  return clamp((progress - j * DEAL * flight) / flight, 0.0, 1.0);
}

// center of the place of card j, dealt in reading order from the top left
vec2 cardCell(float j, vec2 g) {
  float row = floor(j / g.x);
  return vec2(j - row * g.x, g.y - 1.0 - row);
}

// signed distance to the edge of a card (positive inside), from its local coordinates q (0..1) and its size
float cardDist(vec2 q, vec2 size) {
  vec2 e = min(q, 1.0 - q) * size;
  return min(e.x, e.y);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  vec2 g = gridSize();
  float n = g.x * g.y;
  vec2 asp = vec2(ratio, 1.0);
  vec2 size = asp / g;
  vec2 p = uv * asp;
  vec2 origin = deck * asp;
  float darkness = clamp(shadow, 0.0, 1.0);

  // the table: the cards already in their place, the outgoing image elsewhere
  vec2 own = min(floor(uv * g), g - 1.0);
  float ownIndex = (g.y - 1.0 - own.y) * g.x + own.x;
  vec4 col = cardTime(ownIndex, n) >= 1.0 ? getToColor(uv) : getFromColor(uv);

  // the cards on their way, from the first dealt to the last: later cards lie on top
  for (int i = 0; i < MAX_CARDS; i++) {
    float j = float(i);
    if (j >= n) break;
    float u = cardTime(j, n);
    if (u <= 0.0) break;
    if (u >= 1.0) continue;

    vec2 cell = cardCell(j, g);
    vec2 target = (cell + 0.5) * size;
    vec2 way = target - origin;
    float len = max(length(way), 1e-3);
    vec2 side = vec2(-way.y, way.x);
    float r1 = hash(j + 1.0);
    float r2 = hash(j + 60.0);
    float turn = r2 < 0.5 ? -1.0 : 1.0;
    // share of its way the card slides on the table once it has touched down
    float slide = min(SLIDE * size.y / len, 0.5);
    // thrown fast, it flies (a), touches down and slides to a stop (s), braked by the table
    float a = min(u / TOUCH, 1.0);
    float s = clamp((u - TOUCH) / (1.0 - TOUCH), 0.0, 1.0);
    // the flight ends at the speed the slide starts with
    float v1 = 2.0 * slide * TOUCH / ((1.0 - TOUCH) * (1.0 - slide));
    float f = (3.0 - 2.0 * a) * a * a + THROW * (a * a * a - 2.0 * a * a + a) + v1 * (a * a * a - a * a);
    float e = u < TOUCH ? (1.0 - slide) * f : 1.0 - slide * (1.0 - s) * (1.0 - s);
    // a slight curve, bending the way the card spins
    vec2 c = origin + way * e + side * turn * (0.05 + 0.05 * r1) * sin(PI * e);
    // height above the table, zero from the touch down on
    float h = LIFT * (0.7 + 0.3 * r1) * sin(PI * a) * (1.0 - 0.35 * a);
    float angle = turn * spin * (0.8 + 0.4 * r2) * 2.0 * PI * (1.0 - e);
    // tilt of the card in the air, which wobbles as it spins
    float tilt = 0.45 * sin(PI * a) * cos(angle * 0.5 + 6.0 * r1);
    // 1 in the air, 0 once on the table
    float air = 1.0 - a * a;
    float fade = smoothstep(0.0, 0.05, u);

    // shadow on the table, pushed away from the light and softened with height
    vec2 sp = p - c - vec2(0.18, -0.3) * h - vec2(0.002, -0.003);
    float ca = cos(angle), sa = sin(angle);
    mat2 rot = mat2(ca, -sa, sa, ca);
    vec2 sq = rot * sp / size + 0.5;
    float soft = 0.006 + 0.08 * h;
    float sh = smoothstep(-soft, soft, cardDist(sq, size));
    // dark under a card in the air, a thin contact shadow fading as it comes to rest
    float dark = mix(0.8 * (1.0 - s), 0.65 - 0.3 * h / LIFT, air);
    col.rgb *= 1.0 - fade * darkness * dark * sh;

    // the card, closer to the eye as it rises, seen in perspective as it tilts
    vec2 d = rot * (p - c) * (EYE - h) / EYE;
    float ct = cos(tilt), st = sin(tilt);
    // past the horizon of the tilted card, the point is off the card
    float den = EYE * ct + d.y * st;
    float k = den > 1e-3 ? EYE * ct / den : 1e3;
    vec2 q = vec2(k * d.x, k * d.y * ct + EYE * (1.0 - k) * st) / size + 0.5;
    // its edges sharpen as it comes to rest, to meet its neighbors without a seam
    float edge = EDGE * (1.0 + 2.0 * air) * min(10.0 * (1.0 - s), 1.0);
    float m = fade * clamp(cardDist(q, size) / max(edge, 1e-6) + 0.5, 0.0, 1.0);
    if (m > 0.0) {
      vec4 face = getToColor((cell + clamp(q, 0.0, 1.0)) / g);
      // light from the upper left: a tilted card catches it or turns away from it
      float light = 1.0 + 0.6 * st * (0.6 - 0.4 * turn * sin(angle));
      // a thin bright rim while it travels
      float rim = 1.0 - smoothstep(0.0, 0.008, cardDist(q, size));
      face.rgb = mix(min(face.rgb * light, vec3(face.a)), vec3(face.a), 0.45 * air * rim);
      col = mix(col, face, m);
    }
  }
  return col;
}
`,author:"gre",license:"MIT",description:"The incoming image is dealt onto the frame like a hand of cards: tile after tile is flicked from below the frame, spinning through the air with a lifting shadow, and slides to a stop in its place until the picture is complete",tags:["tiles","card","rotate","shadow","3d"],params:{grid:{type:"ivec2",default:[4,3],description:"Number of cards (columns, rows), at most 6 by 6"},deck:{type:"vec2",default:[.5,-.4],description:"Point the cards are dealt from, can be outside the frame"},spin:{type:"float",default:.6,min:0,max:2,description:"Turns a card makes on its way, before it settles straight"},shadow:{type:"float",default:.5,min:0,max:1,description:"Darkness of the shadows the cards cast"}},textures:[],createdAt:"Fri, 13 Nov 2026 18:45:03 +0100",updatedAt:"Fri, 13 Nov 2026 18:45:03 +0100"},{name:"CardSwipe",paramsTypes:{direction:"vec2",rotation:"float",depth:"float",backColor:"vec4"},defaultParams:{direction:[1,.25],rotation:.5,depth:.15,backColor:[.06,.06,.07,1]},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image is flicked off like the top card of a stack, swinging around a point below it as it flies out, while the incoming card behind it grows to fill the frame
// Tags: card, swipe, stack, rotate, slide, directional

// @param Direction in which the outgoing card is flicked
uniform vec2 direction; // = vec2(1.0, 0.25)
// @range(0, 1) How much the outgoing card swings as it flies out
uniform float rotation; // = 0.5
// @range(0, 0.5) How much smaller the incoming card starts
uniform float depth; // = 0.15
// @color Color seen around the incoming card while it is smaller than the frame
uniform vec4 backColor; // = vec4(0.06, 0.06, 0.07, 1.0)

const float RADIUS = 0.045; // corner radius of the cards, in frame heights
const float AA = 0.002; // width of the antialiased card edges

// signed distance to a rounded box of half size b and corner radius r
float roundedBox(vec2 q, vec2 b, float r) {
  vec2 d = abs(q) - b + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

vec4 premultiply(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

vec4 transition(vec2 uv) {
  float dl = length(direction);
  vec2 d = dl > 1e-6 ? direction / dl : vec2(0.970143, 0.242536);
  vec2 q = (uv - 0.5) * vec2(ratio, 1.0);
  vec2 b = vec2(0.5 * ratio, 0.5);
  float p = progress;

  // the incoming card, behind: grows from a smaller card to the full frame,
  // and its corners straighten as it fills it
  float h = clamp((p - 0.2) / 0.8, 0.0, 1.0);
  float g = h * h * (3.0 - 2.0 * h);
  float k = 1.0 - g;
  float sc = 1.0 - depth * k;
  float rb = RADIUS * min(1.0, 12.0 * k);
  float db = roundedBox(q, b * sc, rb);
  float cb = clamp(0.5 - db / max(AA * min(1.0, 40.0 * k), 1e-6), 0.0, 1.0);
  vec4 tc = getToColor(clamp(0.5 + (uv - 0.5) / sc, 0.0, 1.0));
  // still in the shade of the top card at first
  tc.rgb *= 1.0 - 0.35 * k * k;
  // the cards are opaque: each one replaces what is behind it, keeping its image's alpha
  vec4 col = mix(premultiply(backColor), premultiply(tc), cb);

  // the outgoing card, on top: swings around a point below it as it is flicked away
  float t = clamp(p / 0.75, 0.0, 1.0);
  float lift = smoothstep(0.0, 0.15, p);
  float u = min(t / 0.7, 1.0);
  float swing = u * u * (3.0 - 2.0 * u);
  // it tilts toward the side it is flicked to
  float a = (d.x < 0.0 ? 1.3 : -1.3) * rotation * swing;
  vec2 pivot = vec2(0.0, -1.1);
  // where the swing alone takes the center of the card, to throw it far enough
  float ca = cos(a), sa = sin(a);
  vec2 swung = pivot + mat2(ca, sa, -sa, ca) * -pivot;
  float far = 2.0 * length(b) + length(swung) + 0.3;
  vec2 shift = d * far * t * t * (0.4 + 0.6 * t);
  mat2 unrotate = mat2(ca, -sa, sa, ca);
  vec2 r = unrotate * (q - shift - pivot) + pivot;
  float rf = RADIUS * lift;

  // its soft shadow on the card behind, cast down and away as it lifts
  float sh = 0.6 * lift * (1.0 - t);
  if (sh > 0.0) {
    vec2 rs = unrotate * (q - (0.03 * d + vec2(0.0, -0.03)) * lift - shift - pivot) + pivot;
    float ds = roundedBox(rs, b, rf);
    col.rgb *= 1.0 - sh * (1.0 - smoothstep(-0.05, 0.08, ds));
  }

  float df = roundedBox(r, b, rf);
  float cf = clamp(0.5 - df / max(AA * min(1.0, 40.0 * lift), 1e-6), 0.0, 1.0);
  vec4 fc = getFromColor(clamp(r / vec2(ratio, 1.0) + 0.5, 0.0, 1.0));
  col = mix(col, premultiply(fc), cf);
  return col.a > 0.0 ? vec4(col.rgb / col.a, col.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The outgoing image is flicked off like the top card of a stack, swinging around a point below it as it flies out, while the incoming card behind it grows to fill the frame",tags:["card","swipe","stack","rotate","slide","directional"],params:{direction:{type:"vec2",default:[1,.25],description:"Direction in which the outgoing card is flicked"},rotation:{type:"float",default:.5,min:0,max:1,description:"How much the outgoing card swings as it flies out"},depth:{type:"float",default:.15,min:0,max:.5,description:"How much smaller the incoming card starts"},backColor:{type:"vec4",default:[.06,.06,.07,1],color:!0,description:"Color seen around the incoming card while it is smaller than the frame"}},textures:[],createdAt:"Tue, 3 Nov 2026 21:55:02 +0100",updatedAt:"Tue, 3 Nov 2026 21:55:02 +0100"},{name:"CellDissolve",paramsTypes:{cells:"float",smoothness:"float",border:"float",borderColor:"vec4",seed:"float"},defaultParams:{cells:8,smoothness:.1,border:.006,borderColor:[1,.95,.8,1],seed:0},glsl:`// Author: gre
// License: MIT
// Description: Irregular cells, like cracked mud or soap foam, switch to the incoming image one by one, with an optional bright border glowing along the cracks between them
// Tags: dissolve, cells, voronoi, random

// @range(1, 40) Number of cells across the height of the frame
uniform float cells; // = 8.0
// @range(0, 1) Duration of each cell's switch, as a fraction of the transition (0: each cell switches at once)
uniform float smoothness; // = 0.1
// @range(0, 0.05) Width of the border along the cell edges, in frame heights (0: no border)
uniform float border; // = 0.006
// @color Color of the border
uniform vec4 borderColor; // = vec4(1.0, 0.95, 0.8, 1.0)
// @param Random seed: another value gives other cells, switching in another order
uniform float seed; // = 0.0

// half width of the antialiased edges, in frame heights
const float AA = 0.0015;

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

vec4 transition(vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  if (progress <= 0.0) return a;
  if (progress >= 1.0) return b;

  float n = max(cells, 1.0);
  // measured in square pixels, so the cells are not stretched
  vec2 p = uv * vec2(ratio, 1.0) * n;
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 offset = vec2(17.31, 41.97) * seed;

  // nearest cell point
  vec2 mg = vec2(0.0);
  vec2 mr = vec2(0.0);
  float md = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 r = g + hash22(i + g + offset) - f;
      float d = dot(r, r);
      if (d < md) {
        md = d;
        mr = r;
        mg = g;
      }
    }
  }

  // distance to the nearest cell edge: the bisector with the closest neighbor point,
  // searched over 5x5 cells around the nearest one so that no edge is missed
  float edge = 8.0;
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 g = mg + vec2(float(x), float(y));
      vec2 r = g + hash22(i + g + offset) - f;
      vec2 dr = r - mr;
      if (dot(dr, dr) > 0.00001) {
        edge = min(edge, dot(0.5 * (mr + r), normalize(dr)));
      }
    }
  }
  // in frame heights
  edge /= n;

  // the cell's own switch time, from its hash
  float h = hash22(i + mg + offset + 97.13).x;
  float w = clamp(smoothness, 0.0, 1.0);
  float start = h * (1.0 - w);
  float m = w > 0.0 ? smoothstep(start, start + w, progress) : step(start, progress);

  // mixed premultiplied, so transparent images do not bleed their color
  vec4 c = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);

  // the cracks open at the start and close at the end
  float open = smoothstep(0.0, 0.2, progress) * (1.0 - smoothstep(0.8, 1.0, progress));
  float bw = max(border, 0.0) * open;
  if (bw > 0.0) {
    float l = 1.0 - smoothstep(0.5 * bw - AA, 0.5 * bw + AA, edge);
    float ba = borderColor.a * l * min(1.0, bw / (2.0 * AA));
    c = vec4(borderColor.rgb * ba, ba) + c * (1.0 - ba);
  }
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"Irregular cells, like cracked mud or soap foam, switch to the incoming image one by one, with an optional bright border glowing along the cracks between them",tags:["dissolve","cells","voronoi","random"],params:{cells:{type:"float",default:8,min:1,max:40,description:"Number of cells across the height of the frame"},smoothness:{type:"float",default:.1,min:0,max:1,description:"Duration of each cell's switch, as a fraction of the transition (0: each cell switches at once)"},border:{type:"float",default:.006,min:0,max:.05,description:"Width of the border along the cell edges, in frame heights (0: no border)"},borderColor:{type:"vec4",default:[1,.95,.8,1],color:!0,description:"Color of the border"},seed:{type:"float",default:0,description:"Random seed: another value gives other cells, switching in another order"}},textures:[],createdAt:"Wed, 4 Nov 2026 20:14:00 +0100",updatedAt:"Wed, 4 Nov 2026 20:14:00 +0100"},{name:"Chessboard",paramsTypes:{grid_num:"float"},defaultParams:{grid_num:10},glsl:`// Author: lql
// License: MIT
// Description: A chessboard pattern of squares reveals the incoming image
// Tags: grid, squares, pattern

// @param Number of squares per row
uniform float grid_num; // = 10.0

vec4 transition(vec2 uv) {
    vec2 st = uv * grid_num;
    vec2 idx = floor(st);
    vec2 grid = fract(st);

    vec4 a = getFromColor(uv);
    vec4 b = getToColor(uv);

    float checker = mod(idx.x + idx.y, 2.0);
    float mixFactor;

    if (progress <= 0.5) {
        mixFactor = (checker > 0.5) ? step(grid.x, progress * 2.0) : 0.0;
    } else {
        mixFactor = (checker < 0.5) ? step(grid.x, (progress - 0.5) * 2.0) : 1.0;
    }

    return mix(a, b, mixFactor);
}
`,author:"lql",license:"MIT",description:"A chessboard pattern of squares reveals the incoming image",tags:["grid","squares","pattern"],params:{grid_num:{type:"float",default:10,description:"Number of squares per row"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"CircleBurst",paramsTypes:{center:"vec2",color1:"vec4",color2:"vec4",color3:"vec4",stagger:"float"},defaultParams:{center:[.5,.5],color1:[.99,.79,.29,1],color2:[.95,.38,.33,1],color3:[.13,.15,.3,1],stagger:.3},glsl:`// Author: gre
// License: MIT
// Description: Discs of three solid colors burst out of a point one after another, each covering the last, then a hole bursts open from the same point in the last one to reveal the incoming image
// Tags: circle, burst, color, reveal, motion-graphics

// @param Point the discs burst out of, in texture coordinates
uniform vec2 center; // = vec2(0.5, 0.5)
// @color Color of the first disc
uniform vec4 color1; // = vec4(0.99, 0.79, 0.29, 1.0)
// @color Color of the second disc
uniform vec4 color2; // = vec4(0.95, 0.38, 0.33, 1.0)
// @color Color of the third disc, which opens onto the incoming image
uniform vec4 color3; // = vec4(0.13, 0.15, 0.3, 1.0)
// @range(0, 1) Delay between the discs, relative to the burst of one disc (at 0, they burst as one: a single circle opens onto the incoming image)
uniform float stagger; // = 0.3

// half width of the antialiased edges, in frame heights
const float AA = 0.0015;
// width and opacity of the soft shadow each disc casts on what is under it
const float SW = 0.03;
const float SO = 0.32;

// local progress of a layer starting at s and lasting d
float phase(float s, float d) {
  return clamp((progress - s) / d, 0.0, 1.0);
}

// radius of the edge of a layer at local progress t: it bursts out of just before the point and
// leaves the frame still moving, its shadow last
float radius(float t, float R) {
  float u = 1.0 - t;
  return mix(-SW - AA, R, mix(t, 1.0 - u * u * u, 0.8));
}

// fold texture coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(abs(v), 2.0));
}

// a layer of color c and radius r laid over p (premultiplied), with its shadow around it, at distance x
vec4 layer(vec4 p, vec4 c, float r, float x) {
  float k = smoothstep(r - AA, r + AA, x);
  float s = SO * c.a * k * (1.0 - smoothstep(0.0, SW, x - r));
  p = p * (1.0 - s) + vec4(0.0, 0.0, 0.0, s);
  k = c.a * (1.0 - k);
  return p * (1.0 - k) + vec4(c.rgb, 1.0) * k;
}

vec4 transition(vec2 uv) {
  vec2 asp = vec2(ratio, 1.0);
  float x = length((uv - center) * asp);
  // past the farthest corner, with room for the shadows
  float R = length(max(center, 1.0 - center) * asp) + SW + AA;
  float k = clamp(stagger, 0.0, 1.0);
  float d = 1.0 / (1.0 + 3.0 * k);

  // the outgoing image is pushed in by the first burst
  float t = phase(0.0, d);
  vec4 a = getFromColor(mirror(center + (uv - center) / (1.0 + 0.06 * t * (2.0 - t))));
  vec4 p = vec4(a.rgb * a.a, a.a);
  p = layer(p, color1, radius(t, R), x);
  p = layer(p, color2, radius(phase(k * d, d), R), x);
  float r = radius(phase(2.0 * k * d, d), R);
  p = layer(p, color3, r, x);

  // the hole in the last disc shows the incoming image, which pops in slightly zoomed, overshoots
  // and settles, shaded along the hole's rim as much as the disc around it is wide
  t = phase(3.0 * k * d, d);
  float h = radius(t, R);
  float u = 1.0 - t;
  vec4 b = getToColor(mirror(center + (uv - center) / (1.0 + 0.14 * u * u * (1.0 - 2.4 * t))));
  float s = SO * color3.a * clamp((r - h) / SW, 0.0, 1.0) * (1.0 - smoothstep(0.0, SW, h - x));
  vec4 q = vec4(b.rgb * b.a * (1.0 - s), b.a * (1.0 - s) + s);
  p = mix(p, q, 1.0 - smoothstep(h - AA, h + AA, x));
  return p.a > 0.0 ? vec4(p.rgb / p.a, p.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"Discs of three solid colors burst out of a point one after another, each covering the last, then a hole bursts open from the same point in the last one to reveal the incoming image",tags:["circle","burst","color","reveal","motion-graphics"],params:{center:{type:"vec2",default:[.5,.5],description:"Point the discs burst out of, in texture coordinates"},color1:{type:"vec4",default:[.99,.79,.29,1],color:!0,description:"Color of the first disc"},color2:{type:"vec4",default:[.95,.38,.33,1],color:!0,description:"Color of the second disc"},color3:{type:"vec4",default:[.13,.15,.3,1],color:!0,description:"Color of the third disc, which opens onto the incoming image"},stagger:{type:"float",default:.3,min:0,max:1,description:"Delay between the discs, relative to the burst of one disc (at 0, they burst as one: a single circle opens onto the incoming image)"}},textures:[],createdAt:"Mon, 9 Nov 2026 09:04:35 +0100",updatedAt:"Mon, 9 Nov 2026 09:04:35 +0100"},{name:"CircleIris",paramsTypes:{center:"vec2",backColor:"vec4"},defaultParams:{center:[.5,.5],backColor:[.1,.1,.1,1]},glsl:`// Author: Fernando Kuteken
// License: MIT
// Description: The outgoing image closes into a circle over a background color, then the incoming one opens from it
// Tags: circle, iris, shape

// @param Center of the circle
uniform vec2 center; // = vec2(0.5, 0.5)
// @color Background color
uniform vec4 backColor; // = vec4(0.1, 0.1, 0.1, 1.0)

vec4 transition (vec2 uv) {
  
  float distance = length(uv - center);
  float radius = sqrt(8.0) * abs(progress - 0.5);
  
  if (distance > radius) {
    return backColor;
  }
  else {
    if (progress < 0.5) return getFromColor(uv);
    else return getToColor(uv);
  }
}
`,author:"Fernando Kuteken",license:"MIT",description:"The outgoing image closes into a circle over a background color, then the incoming one opens from it",tags:["circle","iris","shape"],params:{center:{type:"vec2",default:[.5,.5],description:"Center of the circle"},backColor:{type:"vec4",default:[.1,.1,.1,1],color:!0,description:"Background color"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"CircleOpen",paramsTypes:{smoothness:"float",opening:"bool"},defaultParams:{smoothness:.3,opening:!0},glsl:`// Author: gre
// License: MIT
// Description: A soft-edged circle opens from the center to reveal the incoming image
// Tags: circle, iris, wipe
// @param Softness of the circle's edge
uniform float smoothness; // = 0.3
// @param Open the circle; false closes it instead
uniform bool opening; // = true

const vec2 center = vec2(0.5, 0.5);
const float SQRT_2 = 1.414213562373;

vec4 transition (vec2 uv) {
  float x = opening ? progress : 1.-progress;
  float m = smoothstep(-smoothness, 0.0, SQRT_2*distance(center, uv) - x*(1.+smoothness));
  return mix(getFromColor(uv), getToColor(uv), opening ? 1.-m : m);
}
`,author:"gre",license:"MIT",description:"A soft-edged circle opens from the center to reveal the incoming image",tags:["circle","iris","wipe"],params:{smoothness:{type:"float",default:.3,description:"Softness of the circle's edge"},opening:{type:"bool",default:!0,description:"Open the circle; false closes it instead"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"ClockWipe",paramsTypes:{startingAngle:"float"},defaultParams:{startingAngle:90},glsl:`// Author: Fernando Kuteken
// License: MIT
// Description: A wipe that sweeps around the center from a starting angle
// Tags: wipe, radial, clock

#define PI 3.141592653589

// @range(0, 360) Angle where the wipe starts, in degrees
uniform float startingAngle; // = 90

vec4 transition (vec2 uv) {
  
  float offset = startingAngle * PI / 180.0;
  float angle = atan(uv.y - 0.5, uv.x - 0.5) + offset;
  float normalizedAngle = (angle + PI) / (2.0 * PI);
  
  normalizedAngle = normalizedAngle - floor(normalizedAngle);

  return mix(
    getFromColor(uv),
    getToColor(uv),
    step(normalizedAngle, progress)
    );
}
`,author:"Fernando Kuteken",license:"MIT",description:"A wipe that sweeps around the center from a starting angle",tags:["wipe","radial","clock"],params:{startingAngle:{type:"float",default:90,min:0,max:360,description:"Angle where the wipe starts, in degrees"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"Clothesline",paramsTypes:{direction:"float",sway:"float",size:"float",background:"vec4",lineColor:"vec4",pinColor:"vec4"},defaultParams:{direction:1,sway:.5,size:.72,background:[.86,.84,.8,1],lineColor:[.42,.34,.26,1],pinColor:[.84,.68,.47,1]},glsl:`// Author: gre
// License: MIT
// Description: The camera pulls back to show the outgoing image as a print hung by two clothespins on a line in front of a wall, the line is pulled sideways and carries it away while the incoming print slides in, both prints swinging and tilting like hanging paper, then the camera moves back in on the incoming print until it fills the frame
// Tags: 3d, perspective, slide, swing, paper, directional

// @param Way the line is pulled: 1 brings the incoming print in from the right, -1 from the left
uniform float direction; // = 1.0
// @range(0, 1) How much the prints swing and tilt as the line moves
uniform float sway; // = 0.5
// @range(0.4, 0.95) Size of the prints when the camera is farthest, as a part of the frame
uniform float size; // = 0.72
// @color Color of the wall behind the line
uniform vec4 background; // = vec4(0.86, 0.84, 0.8, 1.0)
// @color Color of the line
uniform vec4 lineColor; // = vec4(0.42, 0.34, 0.26, 1.0)
// @color Color of the clothespins
uniform vec4 pinColor; // = vec4(0.84, 0.68, 0.47, 1.0)

const float FOCAL = 2.0; // distance from the camera to a print when it fills the frame
const float GAP = 0.35; // space between two prints on the line, in frame heights
const float WALL = 0.14; // distance from the line to the wall behind it
const float ROPE = 0.0055; // half thickness of the line
const vec2 PIN = vec2(0.021, 0.072); // half size of a clothespin
const float PIN_Y = -0.01; // center of a clothespin below the top edge of its print
const float AA = 0.0015; // width of the antialiased edges, in frame heights
const vec3 LIGHT = vec3(-0.28, 0.48, 0.83); // toward the light: above, a bit on the left, in front
const float PIN_X = 0.32; // clothespins from the center of their print, in print widths
const int STEPS = 32; // steps of the swing simulation over the whole transition

// the line moves between these progress values
const float SLIDE_START = 0.1;
const float SLIDE_END = 0.86;

vec4 premultiply(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

// time of the line's move at p, from 0 to 1
float slideTime(float p) {
  return clamp((p - SLIDE_START) / (SLIDE_END - SLIDE_START), 0.0, 1.0);
}

// part of its travel done (smootherstep of the time)
float slideAmount(float u) {
  return u * u * u * (u * (u * 6.0 - 15.0) + 10.0);
}

// acceleration of the travel at p, per progress squared
float slideAccel(float p) {
  float u = slideTime(p);
  float dur = SLIDE_END - SLIDE_START;
  return 60.0 * u * (1.0 - u) * (1.0 - 2.0 * u) / (dur * dur);
}

// the sideways swing of the prints' bottoms, along the travel: a damped pendulum driven by the
// line's acceleration, lagging behind it at the start and overshooting at the stop
float swing(float p) {
  const float OMEGA = 10.0; // about 1.6 swings over the transition
  const float DAMP = 0.28;
  const float STEP = 1.0 / float(STEPS);
  float x = 0.0;
  float v = 0.0;
  // fixed steps, the last one cut at p, so that every frame follows the same curve
  for (int i = 0; i < STEPS; i++) {
    float t0 = float(i) * STEP;
    float dt = clamp(p - t0, 0.0, STEP);
    float a = slideAccel(t0 + 0.5 * dt) - OMEGA * OMEGA * x - 2.0 * DAMP * OMEGA * v;
    v += a * dt;
    x += v * dt;
  }
  // it settles as the camera moves back in
  return x * (1.0 - smoothstep(0.7, 1.0, p));
}

// signed distance to a rounded box of half size b and corner radius r
float roundedBox(vec2 q, vec2 b, float r) {
  vec2 d = abs(q) - b + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

// the point (u across, v down from the top edge) where the ray o + t d meets the plane of a print
// hanging from (cx, 0.5, 0) and swung back by psi around its top edge, and t
vec3 printHit(vec3 o, vec3 d, float cx, float psi) {
  vec3 dn = vec3(0.0, -cos(psi), -sin(psi));
  vec3 n = vec3(0.0, sin(psi), -cos(psi));
  vec3 p0 = vec3(cx, 0.5, 0.0);
  float t = dot(p0 - o, n) / dot(d, n);
  vec3 q = o + d * t - p0;
  return vec3(q.x, dot(q, dn), t);
}

// the bottom of the print bends sideways by bend frame heights
float bendShift(float v, float bend) {
  float h = clamp(v, 0.0, 1.0);
  return bend * h * (0.6 + 0.4 * h);
}

// signed distance to the paper (negative inside), in frame heights
float paperDist(vec2 uv, float bend) {
  vec2 q = abs(vec2(uv.x - bendShift(uv.y, bend), uv.y - 0.5)) - vec2(0.5 * ratio, 0.5);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

// signed distance to the two clothespins of a print
float pinDist(vec2 uv) {
  vec2 q = vec2(abs(uv.x) - PIN_X * ratio, uv.y - PIN_Y);
  return roundedBox(q, PIN, 0.012);
}

// the print hanging at cx over col (premultiplied), then its clothespins
vec4 drawPrint(vec4 col, vec3 h, bool isFrom, float bend, float psi, float aa, float vis) {
  vec2 lp = h.xy;
  float d = paperDist(lp, bend);
  float cov = clamp(0.5 - d / (h.z * aa), 0.0, 1.0);
  if (cov > 0.0) {
    vec2 st = clamp(vec2((lp.x - bendShift(lp.y, bend)) / ratio + 0.5, 1.0 - lp.y), 0.0, 1.0);
    vec4 c = premultiply(isFrom ? getFromColor(st) : getToColor(st));
    // the paper darkens as it swings back and bends, and under the clothespins
    float shade = 1.0 - 1.2 * abs(sin(psi)) * lp.y - 0.35 * abs(bend) * lp.y;
    float ps = pinDist(lp - vec2(0.006, 0.01));
    shade -= 0.35 * vis * (1.0 - smoothstep(-0.004, 0.012, ps));
    c.rgb *= clamp(shade, 0.0, 1.0);
    col = c * cov + col * (1.0 - c.a * cov);
  }
  return col;
}

vec4 drawPins(vec4 col, vec3 h, float aa, float vis) {
  vec2 lp = h.xy;
  float d = pinDist(lp);
  float cov = vis * clamp(0.5 - d / (h.z * aa), 0.0, 1.0);
  if (cov > 0.0) {
    // rounded wood, with the steel spring across it
    float k = clamp((abs(lp.x) - PIN_X * ratio) / PIN.x, -1.0, 1.0);
    vec3 c = pinColor.rgb * (0.62 + 0.45 * sqrt(1.0 - k * k));
    float y = lp.y - PIN_Y;
    float spring = 1.0 - smoothstep(0.004, 0.007, abs(y + 0.02));
    c = mix(c, vec3(0.3, 0.31, 0.33) * (0.6 + 0.8 * sqrt(1.0 - k * k)), spring);
    // the groove that grips the paper
    c *= 1.0 - 0.3 * (1.0 - smoothstep(0.002, 0.005, abs(y - 0.012)));
    vec4 pc = premultiply(vec4(c, pinColor.a));
    col = pc * cov + col * (1.0 - pc.a * cov);
  }
  return col;
}

vec4 transition(vec2 uv) {
  float p = progress;
  float s = direction < 0.0 ? -1.0 : 1.0;
  float sw = clamp(sway, 0.0, 1.0);

  // the camera pulls back, then moves back in on the incoming print
  float back = smoothstep(0.0, 0.3, p) * (1.0 - smoothstep(0.6, 1.0, p));
  float zoom = mix(1.0, clamp(size, 0.1, 1.0), back);
  float vis = smoothstep(0.0, 0.35, back);
  vec3 o = vec3(0.0, 0.05 * back, FOCAL / zoom);
  vec3 d = vec3((uv - 0.5) * vec2(ratio, 1.0), -FOCAL);
  float aa = max(AA * min(1.0, 40.0 * back), 1e-6);

  // the line carries the prints along
  float u = slideTime(p);
  float m = slideAmount(u);
  float speed = 16.0 * u * u * (1.0 - u) * (1.0 - u);
  float spacing = ratio + GAP;
  float cFrom = -s * spacing * m;
  float cTo = s * spacing * (1.0 - m);
  // the bottoms lag behind and overshoot, and swing back in the wind of the move
  float bend = s * 0.65 * sw * swing(p);
  float psi = 0.45 * sw * speed;

  vec3 hf = printHit(o, d, cFrom, psi);
  vec3 ht = printHit(o, d, cTo, psi);

  // the wall, seen around the prints (only behind their transparent parts at the ends),
  // with the soft shadows of the prints, the pins and the line
  vec4 col = premultiply(background);
  float cover = max(
    clamp(0.5 - paperDist(hf.xy, bend) / (hf.z * aa), 0.0, 1.0),
    clamp(0.5 - paperDist(ht.xy, bend) / (ht.z * aa), 0.0, 1.0));
  col *= mix(1.0, back, cover);
  if (back > 0.0) {
    vec3 w = o + d * ((o.z + WALL) / FOCAL);
    vec3 sf = printHit(w, LIGHT, cFrom, psi);
    vec3 st = printHit(w, LIGHT, cTo, psi);
    float blur = 0.025;
    float sh = 1.0 - smoothstep(-blur, blur, min(paperDist(sf.xy, bend), paperDist(st.xy, bend)));
    sh = max(sh, 1.0 - smoothstep(-0.012, 0.02, min(pinDist(sf.xy), pinDist(st.xy))));
    float ry = w.y + LIGHT.y * (WALL / LIGHT.z) - (0.5 - 0.012);
    sh = max(sh, 0.8 * (1.0 - smoothstep(0.0, 0.012, abs(ry))));
    // and a soft falloff of the light away from the top left
    float fall = 0.1 * clamp(length(w.xy - vec2(-0.4 * ratio, 0.6)) / (1.2 * ratio + 0.6), 0.0, 1.0);
    col.rgb *= (1.0 - 0.42 * vis * sh) * (1.0 - fall * vis);
  }

  col = drawPrint(col, hf, true, bend, psi, aa, vis);
  col = drawPrint(col, ht, false, bend, psi, aa, vis);

  // the line, in front of the top of the prints
  if (vis > 0.0) {
    float tl = (o.z - 0.004) / FOCAL;
    float ly = o.y + d.y * tl - (0.5 - 0.012);
    float lc = vis * clamp(0.5 - (abs(ly) - ROPE) / (tl * aa), 0.0, 1.0);
    if (lc > 0.0) {
      float k = clamp(ly / ROPE, -1.0, 1.0);
      // twisted strands, carried along with the line, lit from above
      float lx = o.x + d.x * tl + s * spacing * m;
      float strand = 0.88 + 0.12 * sin((lx + ly * 0.6) * 360.0);
      vec3 c = lineColor.rgb * (0.7 + 0.45 * sqrt(1.0 - k * k) + 0.15 * k) * strand;
      vec4 lcp = premultiply(vec4(c, lineColor.a));
      col = lcp * lc + col * (1.0 - lcp.a * lc);
    }
    col = drawPins(col, hf, aa, vis);
    col = drawPins(col, ht, aa, vis);
  }
  return col.a > 0.0 ? vec4(col.rgb / col.a, col.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The camera pulls back to show the outgoing image as a print hung by two clothespins on a line in front of a wall, the line is pulled sideways and carries it away while the incoming print slides in, both prints swinging and tilting like hanging paper, then the camera moves back in on the incoming print until it fills the frame",tags:["3d","perspective","slide","swing","paper","directional"],params:{direction:{type:"float",default:1,description:"Way the line is pulled: 1 brings the incoming print in from the right, -1 from the left"},sway:{type:"float",default:.5,min:0,max:1,description:"How much the prints swing and tilt as the line moves"},size:{type:"float",default:.72,min:.4,max:.95,description:"Size of the prints when the camera is farthest, as a part of the frame"},background:{type:"vec4",default:[.86,.84,.8,1],color:!0,description:"Color of the wall behind the line"},lineColor:{type:"vec4",default:[.42,.34,.26,1],color:!0,description:"Color of the line"},pinColor:{type:"vec4",default:[.84,.68,.47,1],color:!0,description:"Color of the clothespins"}},textures:[],createdAt:"Sat, 7 Nov 2026 18:51:16 +0100",updatedAt:"Sat, 7 Nov 2026 18:51:16 +0100"},{name:"CodeRain",paramsTypes:{cellSize:"float",trail:"float",tint:"float",glow:"vec4"},defaultParams:{cellSize:.045,trail:.5,tint:.5,glow:[.2,1,.4,1]},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image darkens into a grid of flickering code characters tinted by its colors, then glowing streams of characters fall down the columns at their own speeds, each with a bright head and a fading tail, leaving the incoming image behind
// Tags: text, digital, rain, reveal

// @range(0.02, 0.1) Height of a character, in frame heights
uniform float cellSize; // = 0.045
// @range(0.05, 1) Average length of the streams' fading tails, in frame heights
uniform float trail; // = 0.5
// @range(0, 1) How much the characters of the outgoing image take its colors, instead of the glow color
uniform float tint; // = 0.5
// @color Color of the falling streams and their glow
uniform vec4 glow; // = vec4(0.2, 1.0, 0.4, 1.0)

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec4 hash42(vec2 p) {
  vec4 p4 = fract(vec4(p.xyxy) * vec4(0.1031, 0.1030, 0.0973, 0.1099));
  p4 += dot(p4, p4.wzxy + 33.33);
  return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}

// 1 inside a stroke, fading out from 0.3 to 0.6 dot of distance
vec4 band(vec4 d) {
  return 1.0 - smoothstep(0.3, 0.6, d);
}

// coverage of the character of this cell at this time, drawn on a 5x7 dot grid in a 6x8 cell
// (local: 0..1 in the cell, from its top left), made of strokes picked by hashes
float glyph(vec2 cell, float t, vec2 local) {
  vec2 b = local * vec2(6.0, 8.0) - 0.5;
  float x = b.x;
  float y = b.y;
  float d = 0.667 * y;
  // how far outside the spans 0..4, 0..6, 0..3 and 3..6, in dots
  float x04 = abs(x - 2.0) - 2.0;
  float y06 = abs(y - 3.0) - 3.0;
  float y03 = abs(y - 1.5) - 1.5;
  float y36 = abs(y - 4.5) - 1.5;
  vec2 seed = cell + t * vec2(37.0, 61.0);
  // strokes: three bars and a diagonal, the halves of the side verticals,
  // the halves of the middle vertical, the other diagonal and a short bar
  vec4 sa = band(abs(vec4(y, y - 3.0, y - 6.0, x - d))) * band(vec4(x04, x04, x04, y06));
  vec4 sb = band(abs(vec4(x, x, x - 4.0, x - 4.0))) * band(vec4(y03, y36, y03, y36));
  vec4 sc = band(abs(vec4(x - 2.0, x - 2.0, x + d - 4.0, y - 1.0))) * band(vec4(y03, y36, y06, abs(x - 2.0) - 1.0));
  float on = dot(step(0.68, hash42(seed)), sa);
  on += dot(step(0.68, hash42(seed + 41.0)), sb);
  on += dot(step(0.68, hash42(seed + 83.0)), sc);
  return min(on, 1.0);
}

vec4 transition(vec2 uv) {
  float h = max(cellSize, 0.005);
  vec2 dims = vec2(0.75 * h, h);
  // frame coordinates from the top left, in frame heights
  vec2 fp = vec2(uv.x * ratio, 1.0 - uv.y);
  // (shifted by odd fractions of a cell, so that pixel centers don't fall on its lines at usual sizes)
  vec2 grid = fp / dims + vec2(0.389, 0.278);
  vec2 cell = floor(grid);
  vec2 local = grid - cell;
  float rc = hash12(cell + vec2(97.0, 131.0));

  // each column has its own stream: its start, speed and tail length
  float r1 = hash12(vec2(cell.x, 11.0));
  float r2 = hash12(vec2(cell.x, 23.0));
  float r3 = hash12(vec2(cell.x, 37.0));
  float T = mix(progress, progress * progress * (3.0 - 2.0 * progress), 0.5);
  float len = max(trail, 0.01) * (0.5 + r3);
  float u = clamp((T - 0.03 - 0.5 * r1) / (0.3 + 0.12 * r2), 0.0, 1.0);
  // the head falls from above the frame, speeding up a little, until its tail has left the frame
  float head = mix(-0.2, 1.0 + h + len, u * (0.7 + 0.3 * u));
  // how far the head has gone past the cell's top
  float dy = head - (cell.y - 0.278) * h;

  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);

  // ahead of the stream: the outgoing image darkens into characters tinted by its cell's color,
  // over time and as the head comes near
  vec2 cuv = clamp(vec2((cell.x + 0.111) * dims.x / ratio, 1.0 - (cell.y + 0.222) * h), 0.0, 1.0);
  vec4 ca = getFromColor(cuv);
  float lum = dot(ca.rgb, vec3(0.299, 0.587, 0.114));
  vec3 hue = ca.rgb / max(max(ca.r, max(ca.g, ca.b)), 0.05);
  vec3 ink = mix(glow.rgb * glow.a, hue, tint) * (0.1 + 0.6 * lum);
  float near = smoothstep(-0.15, 0.0, dy);
  float dim = max(smoothstep(0.0, 0.3, T), near);
  float g = max(smoothstep(0.0, 0.2, T - 0.12 * rc), near);
  float passed = step(0.0, dy);
  // the characters change slowly ahead of the stream and fast in it
  float slow = mod(floor(T * 12.0 + rc * 7.0), 32.0);
  float fast = 32.0 + mod(floor(T * 40.0 + rc * 13.0), 32.0);
  float chr = glyph(cell, mix(slow, fast, passed), local);
  vec3 code = a.rgb * (1.0 - 0.8 * dim) + ink * chr * g;

  // behind the head: bright characters changing fast, fading along the tail, over a shadow that
  // clears in the tail's last two thirds to leave the incoming image
  float fade = clamp(1.0 - dy / len, 0.0, 1.0);
  float shade = 1.0 - smoothstep(0.3 * len, len, dy);
  float hot = 1.0 - smoothstep(h, 3.0 * h, dy);
  vec3 col = mix(glow.rgb * 1.2, vec3(1.0), 0.8 * hot) * glow.a;
  vec3 stream = b.rgb * (1.0 - 0.8 * shade) + col * chr * (fade * (2.0 - fade) + hot * fade);

  // a soft glow around the head, within its column
  float yy = (head - fp.y) / (1.5 * h);
  float halo = 1.6 * u * (1.0 - u) * exp(-yy * yy) * (1.0 - smoothstep(0.25, 0.5, abs(local.x - 0.5)));
  vec3 rgb = mix(code, stream, passed) + glow.rgb * glow.a * halo;
  // the outgoing image's opacity stays under the tail's shadow, then gives way to the incoming one's
  return vec4(clamp(rgb, 0.0, 1.0), mix(a.a, mix(b.a, a.a, shade), passed));
}
`,author:"gre",license:"MIT",description:"The outgoing image darkens into a grid of flickering code characters tinted by its colors, then glowing streams of characters fall down the columns at their own speeds, each with a bright head and a fading tail, leaving the incoming image behind",tags:["text","digital","rain","reveal"],params:{cellSize:{type:"float",default:.045,min:.02,max:.1,description:"Height of a character, in frame heights"},trail:{type:"float",default:.5,min:.05,max:1,description:"Average length of the streams' fading tails, in frame heights"},tint:{type:"float",default:.5,min:0,max:1,description:"How much the characters of the outgoing image take its colors, instead of the glow color"},glow:{type:"vec4",default:[.2,1,.4,1],color:!0,description:"Color of the falling streams and their glow"}},textures:[],createdAt:"Mon, 9 Nov 2026 09:04:44 +0100",updatedAt:"Mon, 9 Nov 2026 09:04:44 +0100"},{name:"ColorCoords",paramsTypes:{},defaultParams:{},glsl:`// Author: haiyoucuv
// License: MIT
// Description: A crossfade in which the colors of one image displace the other
// Tags: displace, distort, blend

vec4 transition (vec2 uv) {

  vec4 coordTo = getToColor(uv);
  vec4 coordFrom = getFromColor(uv);

  return mix(
    getFromColor(mix(uv, coordTo.rg, progress)),
    getToColor(mix(coordFrom.rg, uv, progress)),
    progress
  );

}
`,author:"haiyoucuv",license:"MIT",description:"A crossfade in which the colors of one image displace the other",tags:["displace","distort","blend"],params:{},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"ColorDistance",paramsTypes:{power:"float"},defaultParams:{power:5},glsl:`// License: MIT
// Author: P-Seebauer
// Description: Pixels switch to the incoming image in order of how close their colors are
// Tags: blend, color
// ported by gre from https://gist.github.com/P-Seebauer/2a5fa2f77c883dd661f9

uniform float power; // = 5.0

vec4 transition(vec2 p) {
  vec4 fTex = getFromColor(p);
  vec4 tTex = getToColor(p);
  float m = step(distance(fTex, tTex), progress);
  return mix(
    mix(fTex, tTex, m),
    tTex,
    pow(progress, power)
  );
}
`,author:"P-Seebauer",license:"MIT",description:"Pixels switch to the incoming image in order of how close their colors are",tags:["blend","color"],params:{power:{type:"float",default:5}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"ColorPanelWipe",paramsTypes:{direction:"vec2",panels:"int",color1:"vec4",color2:"vec4",color3:"vec4",stagger:"float",skew:"float"},defaultParams:{direction:[1,0],panels:3,color1:[.98,.76,.22,1],color2:[.93,.33,.36,1],color3:[.16,.2,.42,1],stagger:.35,skew:.25},glsl:`// Author: gre
// License: MIT
// Description: Solid color panels, slightly staggered, sweep across and cover the frame, then sweep off the far side and reveal the incoming image
// Tags: wipe, panels, color, slanted, motion-graphics

// @param Direction the panels sweep toward
uniform vec2 direction; // = vec2(1.0, 0.0)
// @range(1, 3, 1) Number of panels
uniform int panels; // = 3
// @color Color of the first panel
uniform vec4 color1; // = vec4(0.98, 0.76, 0.22, 1.0)
// @color Color of the second panel
uniform vec4 color2; // = vec4(0.93, 0.33, 0.36, 1.0)
// @color Color of the third panel
uniform vec4 color3; // = vec4(0.16, 0.2, 0.42, 1.0)
// @range(0, 1) Delay between the panels, relative to the sweep of one panel (at 0, they move as one and only the last shows)
uniform float stagger; // = 0.35
// @range(-1, 1) Slant of the panels' edges
uniform float skew; // = 0.25

// the frame is fully covered from cut - hold to cut + hold, where the image switches
const float cut = 0.46;
const float hold = 0.01;
// half width of the antialiased edges, in frame heights
const float aa = 0.0015;

// a short acceleration, a fast sweep, and a long settle
float ease(float t) {
  float s = clamp(t, 0.0, 1.0);
  float u = 1.0 - s * s * (3.0 - 2.0 * s);
  return 1.0 - u * u * u;
}

// how much of x a panel between the edges back and front covers
float cover(float x, float back, float front) {
  return smoothstep(back - aa, back + aa, x) * (1.0 - smoothstep(front - aa, front + aa, x));
}

vec4 transition(vec2 uv) {
  vec2 dir = length(direction) > 0.0 ? normalize(direction) : vec2(1.0, 0.0);
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0);
  float k = clamp(skew, -1.0, 1.0);
  // position along the sweep, slanted across it, in frame heights across the edges
  vec2 a = (dir + k * vec2(-dir.y, dir.x)) / sqrt(1.0 + k * k);
  float x = dot(p, a);
  // half extent of the frame along x
  float e = 0.5 * (abs(a.x) * ratio + abs(a.y));
  float start = -e - 2.0 * aa;
  float span = 2.0 * (e + 2.0 * aa);

  int n = panels < 1 ? 1 : panels > 3 ? 3 : panels;
  float m = float(n - 1);
  float st = clamp(stagger, 0.0, 1.0);
  // durations of a panel's sweep in and out
  vec2 d = vec2(cut - hold, 1.0 - cut - hold) / (1.0 + m * st);

  // the first panel enters first and leaves last: the outgoing image is ahead of it, the incoming one behind it
  // (both are sampled, so that no texture read sits in a branch that differs between pixels)
  float front0 = start + span * ease(progress / d.x);
  float back0 = start + span * ease((progress - 1.0 + d.y) / d.y);
  vec4 c = mix(getToColor(uv), getFromColor(uv), step(0.5 * (front0 + back0), x));
  c = mix(c, color1, cover(x, back0, front0));

  // each next panel covers the ones before it, enters after them and leaves before them
  for (int i = 1; i < 3; i++) {
    if (i < n) {
      vec2 t = float(i) * st * d;
      float front = start + span * ease((progress - t.x) / d.x);
      float back = start + span * ease((progress - 1.0 + d.y + t.y) / d.y);
      c = mix(c, i == 1 ? color2 : color3, cover(x, back, front));
    }
  }
  return c.a > 0.0 ? c : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"Solid color panels, slightly staggered, sweep across and cover the frame, then sweep off the far side and reveal the incoming image",tags:["wipe","panels","color","slanted","motion-graphics"],params:{direction:{type:"vec2",default:[1,0],description:"Direction the panels sweep toward"},panels:{type:"int",default:3,min:1,max:3,step:1,description:"Number of panels"},color1:{type:"vec4",default:[.98,.76,.22,1],color:!0,description:"Color of the first panel"},color2:{type:"vec4",default:[.93,.33,.36,1],color:!0,description:"Color of the second panel"},color3:{type:"vec4",default:[.16,.2,.42,1],color:!0,description:"Color of the third panel"},stagger:{type:"float",default:.35,min:0,max:1,description:"Delay between the panels, relative to the sweep of one panel (at 0, they move as one and only the last shows)"},skew:{type:"float",default:.25,min:-1,max:1,description:"Slant of the panels' edges"}},textures:[],createdAt:"Wed, 4 Nov 2026 08:57:58 +0100",updatedAt:"Wed, 4 Nov 2026 08:57:58 +0100"},{name:"ColorPhase",paramsTypes:{fromStep:"vec4",toStep:"vec4"},defaultParams:{fromStep:[0,.2,.4,0],toStep:[.6,.8,1,1]},glsl:`// Author: gre
// License: MIT
// Description: A crossfade in which each color channel changes at a different time
// Tags: fade, color

// Usage: fromStep and toStep must be in [0.0, 1.0] range 
// and all(fromStep) must be < all(toStep)

// @range(0, 1) When each channel (r, g, b, a) starts changing
uniform vec4 fromStep; // = vec4(0.0, 0.2, 0.4, 0.0)
// @range(0, 1) When each channel (r, g, b, a) finishes changing
uniform vec4 toStep; // = vec4(0.6, 0.8, 1.0, 1.0)

vec4 transition (vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  return mix(a, b, smoothstep(fromStep, toStep, vec4(progress)));
}
`,author:"gre",license:"MIT",description:"A crossfade in which each color channel changes at a different time",tags:["fade","color"],params:{fromStep:{type:"vec4",default:[0,.2,.4,0],min:0,max:1,description:"When each channel (r, g, b, a) starts changing"},toStep:{type:"vec4",default:[.6,.8,1,1],min:0,max:1,description:"When each channel (r, g, b, a) finishes changing"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"ColorWrap",paramsTypes:{r_strength:"float",g_strength:"float",b_strength:"float"},defaultParams:{r_strength:1,g_strength:1,b_strength:1},glsl:`// Author: Yoni Maltsman @friendlyspinach
// License: MIT
// Description: Each color channel of the outgoing image is shifted and wraps around into psychedelic bands, while crossfading to the incoming image
// Tags: color, glitch, psychedelic, fade

// @range(-2, 2) Shift of the red channel over the transition
uniform float r_strength; // = 1.0
// @range(-2, 2) Shift of the green channel over the transition
uniform float g_strength; // = 1.0
// @range(-2, 2) Shift of the blue channel over the transition
uniform float b_strength; // = 1.0

vec4 transition (vec2 uv) {
  vec4 from = getFromColor(uv);
  vec4 to = getToColor(uv);
  vec3 c = from.rgb + vec3(r_strength, g_strength, b_strength)*progress;
  // The wrap flips bright (or, with negative strengths, dark) channels at once: fade it in over the first frames
  from.rgb = mix(from.rgb, mod(c, 1.0), smoothstep(0.0, 0.1, progress));
  return mix(from, to, progress);
}
`,author:"Yoni Maltsman @friendlyspinach",license:"MIT",description:"Each color channel of the outgoing image is shifted and wraps around into psychedelic bands, while crossfading to the incoming image",tags:["color","glitch","psychedelic","fade"],params:{r_strength:{type:"float",default:1,min:-2,max:2,description:"Shift of the red channel over the transition"},g_strength:{type:"float",default:1,min:-2,max:2,description:"Shift of the green channel over the transition"},b_strength:{type:"float",default:1,min:-2,max:2,description:"Shift of the blue channel over the transition"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"Comb",paramsTypes:{strips:"int",vertical:"bool"},defaultParams:{strips:10,vertical:!1},glsl:`// Author: gre
// License: MIT
// Description: The frame is cut into interleaved strips that slide in opposite directions, each pushing the outgoing image out and the incoming one in
// Tags: slide, stripes, push, horizontal

// @range(2, 40, 1) Number of strips
uniform int strips; // = 10
// @param Cut the frame into columns that slide up and down instead
uniform bool vertical; // = false

vec4 transition (vec2 uv) {
  // a: the axis along which the strips slide, b: the axis across them
  float a = vertical ? uv.y : uv.x;
  float b = vertical ? uv.x : uv.y;
  // alternate strips slide in opposite directions
  float dir = mod(floor(b * float(strips)), 2.0) < 0.5 ? 1.0 : -1.0;
  // ease in and out, but keep moving from the first frame
  float t = mix(progress, progress * progress * (3.0 - 2.0 * progress), 0.6);
  float fa = a - dir * t;
  if (fa >= 0.0 && fa <= 1.0) {
    return getFromColor(vertical ? vec2(b, fa) : vec2(fa, b));
  }
  float ta = fa + dir;
  return getToColor(vertical ? vec2(b, ta) : vec2(ta, b));
}
`,author:"gre",license:"MIT",description:"The frame is cut into interleaved strips that slide in opposite directions, each pushing the outgoing image out and the incoming one in",tags:["slide","stripes","push","horizontal"],params:{strips:{type:"int",default:10,min:2,max:40,step:1,description:"Number of strips"},vertical:{type:"bool",default:!1,description:"Cut the frame into columns that slide up and down instead"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:17:22 +0100",updatedAt:"Sat, 31 Oct 2026 18:17:22 +0100"},{name:"ComicPanels",paramsTypes:{gutter:"float",gutterColor:"vec4",borderColor:"vec4",seed:"float"},defaultParams:{gutter:.03,gutterColor:[1,1,1,1],borderColor:[0,0,0,1],seed:0},glsl:`// Author: gre
// License: MIT
// Description: The frame splits into slanted comic-book panels with gutters and ink borders; one after another in reading order, each panel lifts off the page with a zoom kick and a drop shadow and punches over to the incoming image, then the gutters close up over the full incoming image
// Tags: comic, panels, grid, zoom

// @range(0, 0.1) Width of the gutters between the panels, as a part of the frame's height
uniform float gutter; // = 0.03
// @color Color of the gutters and of the page's margin
uniform vec4 gutterColor; // = vec4(1.0, 1.0, 1.0, 1.0)
// @color Color of the ink borders around the panels
uniform vec4 borderColor; // = vec4(0.0, 0.0, 0.0, 1.0)
// @range(0, 100, 1) Changes the layout of the panels
uniform float seed; // = 0.0

const float PI = 3.141592653589793;
// width of the ink borders, as a part of the frame's height
const float INK = 0.005;
// width of the anti-aliased edges, as a part of the frame's height
const float EDGE = 0.0012;
// part of the transition taken by each panel's punch
const float PUNCH = 0.3;
// the first panel's punch starts at START, the last one ends at END
const float START = 0.05;
const float END = 0.97;
// number of spikes of the burst that brings the incoming image into a panel
const float SPIKES = 11.0;

float hash(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

// number of panels in row r (0 is the top row)
float cols(float r) {
  float h = hash(vec2(r * 7.0 + 3.0, seed * 1.37 + 11.0));
  float n = h < 0.15 ? 1.0 : (h < 0.6 ? 2.0 : 3.0);
  // the middle row is never a single panel, a narrow frame takes at most 2 panels per row
  if (r == 1.0) n = max(n, 2.0);
  if (ratio < 0.8) n = min(n, 2.0);
  return n;
}

// signed distance of p (x from 0 to ratio, y from 0 at the top to 1) below the gutter k between the rows
// (0 is the top of the frame, 3 its bottom)
float rowDist(float k, vec2 p) {
  if (k < 0.5) return p.y;
  if (k > 2.5) return p.y - 1.0;
  float y = (k + (hash(vec2(k * 5.0 + 1.0, seed * 1.37)) - 0.5) * 0.35) / 3.0;
  float s = (hash(vec2(k * 9.0 + 4.0, seed * 1.37 + 5.0)) - 0.5) * 0.24;
  return (p.y - y - s * (p.x / ratio - 0.5)) / sqrt(1.0 + s * s / (ratio * ratio));
}

// signed distance of p right of the gutter j of row r, which has n panels (0 is the left of the frame, n its right)
float colDist(float r, float j, float n, vec2 p) {
  if (j < 0.5) return p.x;
  if (j > n - 0.5) return p.x - ratio;
  float x = (j + (hash(vec2(r * 3.0 + j * 13.0, seed * 1.37 + 2.0)) - 0.5) * 0.45) / n;
  float s = (hash(vec2(r * 11.0 + j * 5.0, seed * 1.37 + 7.0)) - 0.5) * 0.5;
  return (p.x - ratio * (x + s * (p.y - 0.5))) / sqrt(1.0 + ratio * ratio * s * s);
}

// signed distance to the edges of panel c of row r, positive inside
float panelDist(float r, float c, float n, vec2 p) {
  return min(min(rowDist(r, p), -rowDist(r + 1.0, p)), min(colDist(r, c, n, p), -colDist(r, c + 1.0, n, p)));
}

// a point inside panel c of row r, as far from its top as from its bottom and from its left as from its right
vec2 panelCenter(float r, float c, float n) {
  // the sums of the distances to the opposite edges are linear: find where they are 0
  float y0 = rowDist(r, vec2(0.5 * ratio, 0.0)) + rowDist(r + 1.0, vec2(0.5 * ratio, 0.0));
  float y1 = rowDist(r, vec2(0.5 * ratio, 1.0)) + rowDist(r + 1.0, vec2(0.5 * ratio, 1.0));
  float y = y0 / (y0 - y1);
  float x0 = colDist(r, c, n, vec2(0.0, y)) + colDist(r, c + 1.0, n, vec2(0.0, y));
  float x1 = colDist(r, c, n, vec2(1.0, y)) + colDist(r, c + 1.0, n, vec2(1.0, y));
  return vec2(x0 / (x0 - x1), y);
}

// the panel's punch, 0 to 1: panel k of the n panels of the page, in reading order
float panelTime(float k, float total) {
  float t0 = START + (END - START - PUNCH) * k / max(total - 1.0, 1.0);
  return clamp((progress - t0) / PUNCH, 0.0, 1.0);
}

// how high the panel is lifted off the page: a quick rise, a slower settle
float lift(float t) {
  float u = 1.0 - (1.0 - t) * (1.0 - t);
  return sin(PI * u);
}

// the panel's image at the page point p: the outgoing one until the incoming one bursts out of the panel's center
// in a jagged star with an ink outline
vec4 panelImage(vec2 p, vec2 center, float t) {
  float k = lift(t);
  // the image zooms in with the kick, then settles
  vec2 q = center + (p - center) / (1.0 + 0.1 * k);
  vec2 uv = vec2(q.x / ratio, 1.0 - q.y);
  if (t <= 0.0) return getFromColor(uv);
  if (t >= 1.0) return getToColor(uv);
  vec2 v = p - center;
  float a = (atan(v.y, v.x + 1e-6) + PI) / (2.0 * PI) * SPIKES + center.x * 7.0;
  float i = floor(a);
  // the spikes, of uneven lengths
  // (the spike index wraps around so that the star has no seam where the angle wraps)
  float spike = (1.0 - abs(2.0 * (a - i) - 1.0)) * (0.5 + 0.5 * hash(vec2(mod(i, SPIKES), center.y * 13.0 + seed)));
  // large enough to cover the widest panel, a whole row of a wide frame
  float burst = 1.5 * max(1.0, ratio / 1.8) * smoothstep(0.06, 0.42, t);
  float d = length(v) - burst * (0.62 + 0.38 * spike);
  float w = 1.4 * INK;
  vec4 c = mix(getToColor(uv), borderColor, smoothstep(-w - EDGE, -w + EDGE, d));
  return mix(c, getFromColor(uv), smoothstep(-EDGE, EDGE, d));
}

// the panel drawn over color: its gutter edge at g from its edges, its ink border inside it
vec4 drawPanel(vec4 color, vec4 img, float d, float g, float ink, float fade) {
  vec4 c = mix(borderColor, img, mix(1.0, smoothstep(g + ink - EDGE, g + ink + EDGE, d), fade));
  return mix(color, c, mix(1.0, smoothstep(g - EDGE, g + EDGE, d), fade));
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);
  vec2 p = vec2(uv.x * ratio, 1.0 - uv.y);

  // the gutters open at the start and close over the incoming image at the end
  float open = smoothstep(0.0, 0.14, progress) * (1.0 - smoothstep(0.8, 1.0, progress));
  float g = 0.5 * gutter * open;
  float ink = INK * open;
  // the edges come in gently instead of popping in at half coverage
  float fade = clamp(open * 6.0, 0.0, 1.0);

  float n0 = cols(0.0);
  float n1 = cols(1.0);
  float n2 = cols(2.0);
  float total = n0 + n1 + n2;

  // the panel under the point, on the page
  float r = rowDist(1.0, p) < 0.0 ? 0.0 : (rowDist(2.0, p) < 0.0 ? 1.0 : 2.0);
  float n = r == 0.0 ? n0 : (r == 1.0 ? n1 : n2);
  float c = colDist(r, 1.0, n, p) < 0.0 ? 0.0 : (colDist(r, 2.0, n, p) < 0.0 || n < 2.5 ? 1.0 : 2.0);
  c = min(c, n - 1.0);
  float first = r == 0.0 ? 0.0 : (r == 1.0 ? n0 : n0 + n1);
  float t = panelTime(first + c, total);

  vec4 color = gutterColor;
  if (t <= 0.0 || t >= 1.0) {
    color = drawPanel(color, panelImage(p, panelCenter(r, c, n), t), panelDist(r, c, n, p), g, ink, fade);
  }

  // the panels lifted off the page, the later ones on top: at most 4 of them punch at once
  float spacing = (END - START - PUNCH) / max(total - 1.0, 1.0);
  // (with a margin, so that a panel at the very end of its punch is not missed to rounding)
  float kFirst = floor((progress - START - PUNCH) / spacing - 0.01) + 1.0;
  for (int i = 0; i < 4; i++) {
    float pk = kFirst + float(i);
    if (pk < 0.0 || pk > total - 0.5) continue;
    float pt = panelTime(pk, total);
    if (pt <= 0.0 || pt >= 1.0) continue;
    float pr = pk < n0 ? 0.0 : (pk < n0 + n1 ? 1.0 : 2.0);
    float pn = pr == 0.0 ? n0 : (pr == 1.0 ? n1 : n2);
    float pc = pk - (pr == 0.0 ? 0.0 : (pr == 1.0 ? n0 : n0 + n1));
    float k = lift(pt);
    vec2 center = panelCenter(pr, pc, pn);
    float s = 1.0 + 0.08 * k;
    // its soft shadow on the page, down and to the right
    vec2 sq = center + (p - vec2(0.012, 0.018) * k - center) / s;
    float sd = panelDist(pr, pc, pn, sq) - g;
    color.rgb *= 1.0 - 0.4 * k * fade * smoothstep(-0.02, 0.01, sd);
    vec2 q = center + (p - center) / s;
    color = drawPanel(color, panelImage(q, center, pt), panelDist(pr, pc, pn, q), g, ink, 1.0);
  }
  return color;
}
`,author:"gre",license:"MIT",description:"The frame splits into slanted comic-book panels with gutters and ink borders; one after another in reading order, each panel lifts off the page with a zoom kick and a drop shadow and punches over to the incoming image, then the gutters close up over the full incoming image",tags:["comic","panels","grid","zoom"],params:{gutter:{type:"float",default:.03,min:0,max:.1,description:"Width of the gutters between the panels, as a part of the frame's height"},gutterColor:{type:"vec4",default:[1,1,1,1],color:!0,description:"Color of the gutters and of the page's margin"},borderColor:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color of the ink borders around the panels"},seed:{type:"float",default:0,min:0,max:100,step:1,description:"Changes the layout of the panels"}},textures:[],createdAt:"Sun, 8 Nov 2026 10:39:01 +0100",updatedAt:"Sun, 8 Nov 2026 10:39:01 +0100"},{name:"CrazyParametricFun",paramsTypes:{a:"float",b:"float",amplitude:"float",smoothness:"float"},defaultParams:{a:4,b:1,amplitude:120,smoothness:.1},glsl:`// Author: mandubian
// License: MIT
// Description: The outgoing image is pulled along a parametric curve into a psychedelic swirl
// Tags: distort, psychedelic

uniform float a; // = 4
uniform float b; // = 1
uniform float amplitude; // = 120
uniform float smoothness; // = 0.1

vec4 transition(vec2 uv) {
  vec2 p = uv.xy / vec2(1.0).xy;
  vec2 dir = p - vec2(.5);
  float dist = length(dir);
  float x = (a - b) * cos(progress) + b * cos(progress * ((a / b) - 1.) );
  float y = (a - b) * sin(progress) - b * sin(progress * ((a / b) - 1.));
  vec2 offset = dir * vec2(sin(progress  * dist * amplitude * x), sin(progress * dist * amplitude * y)) / smoothness;
  return mix(getFromColor(p + offset), getToColor(p), smoothstep(0.2, 1.0, progress));
}
`,author:"mandubian",license:"MIT",description:"The outgoing image is pulled along a parametric curve into a psychedelic swirl",tags:["distort","psychedelic"],params:{a:{type:"float",default:4},b:{type:"float",default:1},amplitude:{type:"float",default:120},smoothness:{type:"float",default:.1}},textures:[],createdAt:"Thu, 1 Jun 2017 13:03:12 +0200",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"CrossWarp",paramsTypes:{},defaultParams:{},glsl:`// Author: Eke Péter <peterekepeter@gmail.com>
// License: MIT
// Description: The outgoing image zooms in while the incoming one zooms out into place, sweeping from right to left
// Tags: warp, zoom, horizontal
vec4 transition(vec2 p) {
  float x = progress;
  x=smoothstep(.0,1.0,(x*2.0+p.x-1.0));
  return mix(getFromColor((p-.5)*(1.-x)+.5), getToColor((p-.5)*x+.5), x);
}
`,author:"Eke Péter <peterekepeter@gmail.com>",license:"MIT",description:"The outgoing image zooms in while the incoming one zooms out into place, sweeping from right to left",tags:["warp","zoom","horizontal"],params:{},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"CrossZoom",paramsTypes:{strength:"float"},defaultParams:{strength:.4},glsl:`// License: MIT
// Author: rectalogic
// Description: A crossfade through a strong zoom blur
// Tags: zoom, blur, blend
// ported by gre from https://gist.github.com/rectalogic/b86b90161503a0023231

// Converted from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/CrossZoom/CrossZoom.frag
// Which is based on https://github.com/evanw/glfx.js/blob/master/src/filters/blur/zoomblur.js
// With additional easing functions from https://github.com/rectalogic/rendermix-basic-effects/blob/master/assets/com/rendermix/Easing/Easing.glsllib

// @range(0, 1) Blur strength
uniform float strength; // = 0.4

const float PI = 3.141592653589793;

float Linear_ease(in float begin, in float change, in float duration, in float time) {
    return change * time / duration + begin;
}

float Exponential_easeInOut(in float begin, in float change, in float duration, in float time) {
    if (time == 0.0)
        return begin;
    else if (time == duration)
        return begin + change;
    time = time / (duration / 2.0);
    if (time < 1.0)
        return change / 2.0 * pow(2.0, 10.0 * (time - 1.0)) + begin;
    return change / 2.0 * (-pow(2.0, -10.0 * (time - 1.0)) + 2.0) + begin;
}

float Sinusoidal_easeInOut(in float begin, in float change, in float duration, in float time) {
    return -change / 2.0 * (cos(PI * time / duration) - 1.0) + begin;
}

float rand (vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 crossFade(in vec2 uv, in float dissolve) {
    return mix(getFromColor(uv), getToColor(uv), dissolve);
}

vec4 transition(vec2 uv) {
    vec2 texCoord = uv.xy / vec2(1.0).xy;

    // Linear interpolate center across center half of the image
    vec2 center = vec2(Linear_ease(0.25, 0.5, 1.0, progress), 0.5);
    float dissolve = Exponential_easeInOut(0.0, 1.0, 1.0, progress);

    // Mirrored sinusoidal loop. 0->strength then strength->0
    float strength = Sinusoidal_easeInOut(0.0, strength, 0.5, progress);

    vec4 color = vec4(0.0);
    float total = 0.0;
    vec2 toCenter = center - texCoord;

    /* randomize the lookup values to hide the fixed number of samples */
    float offset = rand(uv);

    for (float t = 0.0; t <= 40.0; t++) {
        float percent = (t + offset) / 40.0;
        float weight = 4.0 * (percent - percent * percent);
        color += crossFade(texCoord + toCenter * percent * strength, dissolve) * weight;
        total += weight;
    }
    return color / total;
}
`,author:"rectalogic",license:"MIT",description:"A crossfade through a strong zoom blur",tags:["zoom","blur","blend"],params:{strength:{type:"float",default:.4,min:0,max:1,description:"Blur strength"}},textures:[],createdAt:"Mon, 12 Jun 2017 12:33:07 +0800",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"Crosshatch",paramsTypes:{center:"vec2",threshold:"float",fadeEdge:"float"},defaultParams:{center:[.5,.5],threshold:3,fadeEdge:.1},glsl:`// License: MIT
// Author: pthrasher
// Description: The incoming image appears through a crosshatch of lines spreading from the center
// Tags: pattern, lines, noise
// adapted by gre from https://gist.github.com/pthrasher/04fd9a7de4012cbb03f6

// @param Point the lines spread from
uniform vec2 center; // = vec2(0.5)
uniform float threshold; // = 3.0
uniform float fadeEdge; // = 0.1

float rand(vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
vec4 transition(vec2 p) {
  float dist = distance(center, p) / threshold;
  float r = progress - min(rand(vec2(p.y, 0.0)), rand(vec2(0.0, p.x)));
  return mix(getFromColor(p), getToColor(p), mix(0.0, mix(step(dist, r), 1.0, smoothstep(1.0-fadeEdge, 1.0, progress)), smoothstep(0.0, fadeEdge, progress)));    
}
`,author:"pthrasher",license:"MIT",description:"The incoming image appears through a crosshatch of lines spreading from the center",tags:["pattern","lines","noise"],params:{center:{type:"vec2",default:[.5,.5],description:"Point the lines spread from"},threshold:{type:"float",default:3},fadeEdge:{type:"float",default:.1}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"Crumple",paramsTypes:{creases:"int",size:"float",direction:"vec2",paper:"vec4",shadow:"vec4"},defaultParams:{creases:16,size:.2,direction:[1,.4],paper:[.96,.95,.91,1],shadow:[0,0,0,.45]},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image crumples into a creased paper ball, shaded along its folds, which is then tossed away to reveal the incoming image
// Tags: paper, 3d, shrink, shadow

// @range(1, 32, 1) Number of folds creasing the paper
uniform int creases; // = 16
// @range(0.05, 0.4) Radius of the paper ball, relative to the image height
uniform float size; // = 0.2
// @param Direction the ball is tossed toward
uniform vec2 direction; // = vec2(1.0, 0.4)
// @color Color of the bare paper showing through the ink along the sharpest creases
uniform vec4 paper; // = vec4(0.96, 0.95, 0.91, 1.0)
// @color Color of the shadow cast on the incoming image
uniform vec4 shadow; // = vec4(0.0, 0.0, 0.0, 0.45)

const float PI = 3.14159265;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

// distance from the center to the edge of the frame in the direction a (unit vector)
float frame(vec2 a) {
  return min(0.5 * ratio / max(abs(a.x), 1e-4), 0.5 / max(abs(a.y), 1e-4));
}

// distance from the center to the edge of the paper in the direction a (unit vector):
// the frame shrinking and buckling while it crumples (c), turning into a lumpy ball (k)
float outline(vec2 a, float c, float k, float radius) {
  float rect = frame(a);
  float th = atan(a.y, a.x);
  float buckle = 0.03 + 0.05 * abs(sin(4.0 * th + 0.7)) + 0.03 * abs(sin(9.0 * th + 2.0)) + 0.015 * abs(sin(23.0 * th + 1.3));
  // the ball is a polygon with irregular corners
  float i = floor((th / (2.0 * PI) + 0.5) * 9.0);
  float a0 = i * 2.0 * PI / 9.0 - PI;
  float a1 = a0 + 2.0 * PI / 9.0;
  vec2 v0 = vec2(cos(a0), sin(a0)) * (0.78 + 0.27 * hash2(vec2(mod(i, 9.0), 3.0)).x);
  vec2 v1 = vec2(cos(a1), sin(a1)) * (0.78 + 0.27 * hash2(vec2(mod(i + 1.0, 9.0), 3.0)).x);
  vec2 e = v1 - v0;
  float ball = radius * (v0.x * e.y - v0.y * e.x) / (a.x * e.y - a.y * e.x);
  return mix(rect * mix(1.0, 0.75, c) * (1.0 - c * buckle), ball, k);
}

// n straight creases of random position, orientation and length, in a space where the
// paper spans about [-span, span]; each one tilts the paper on its two sides (a sharp ridge
// or valley between flat facets) and swallows a strip of the image. They come one after
// another as c grows; px is the half width of a crease line, in the units of x.
void fold(vec2 x, float seed, int n, vec2 span, float len, float c, float px, float weight,
          inout vec2 grad, inout vec2 shift, inout float valley, inout float ridge) {
  float tilt = 2.0 / sqrt(float(n));
  for (int i = 0; i < 32; i++) {
    if (i >= n) break;
    float fi = float(i);
    vec2 h = hash2(vec2(fi, seed));
    vec2 g = hash2(vec2(fi, seed + 11.8));
    vec2 o = (h - 0.5) * 2.0 * span;
    vec2 nrm = vec2(cos(2.0 * PI * g.x), sin(2.0 * PI * g.x));
    float d = dot(x - o, nrm);
    float along = dot(x - o, vec2(-nrm.y, nrm.x));
    float l = len * (0.5 + g.y);
    float start = 0.4 * fi / float(n);
    float act = weight * smoothstep(start, start + 0.3, c) * (1.0 - smoothstep(0.5 * l, l, abs(along)));
    float amp = (h.x > 0.5 ? 1.0 : -1.0) * (0.5 + 0.5 * h.y);
    float side = d / (abs(d) + px);
    grad += act * amp * side * nrm * tilt;
    shift += act * 0.03 * side * nrm;
    float line = 1.0 - smoothstep(0.0, 2.0 * px, abs(d));
    if (amp < 0.0) valley += act * line;
    else ridge += act * line * amp;
  }
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  vec4 b = getToColor(uv);
  if (progress >= 1.0) return b;

  // crumpling (c), balling up (k), then tossing (t)
  float c = smoothstep(0.0, 0.6, progress);
  float k = smoothstep(0.1, 0.62, progress);
  float t = smoothstep(0.58, 1.0, progress);
  t *= t;

  vec2 dir = length(direction) > 0.0 ? normalize(direction) : vec2(1.0, 0.0);
  float radius = max(size, 0.01) * mix(1.0, 0.6, t);
  // far enough along the direction for the ball and its shadow (offset and blurred by up
  // to about 0.09 each) to leave the frame
  float reach = 0.5 * (abs(dir.x) * ratio + abs(dir.y)) + 1.2 * radius + 0.3;
  float bend = dir.x < 0.0 ? -1.0 : 1.0;
  vec2 center = dir * reach * t + vec2(-dir.y, dir.x) * 0.15 * bend * sin(PI * t);
  float angle = 0.6 * c - 5.0 * bend * t;
  // how high the paper is above the incoming image
  float lift = 0.012 * c + 0.06 * t;

  vec2 p = (uv - 0.5) * vec2(ratio, 1.0);

  // soft shadow on the incoming image
  vec2 sp = rot(angle) * (p - center - vec2(0.6, -1.0) * lift);
  float sl = length(sp);
  float sd = sl - outline(sl > 1e-5 ? sp / sl : vec2(1.0, 0.0), c, k, radius);
  float blur = 0.005 + 1.2 * lift;
  vec4 col = vec4(mix(b.rgb, shadow.rgb, shadow.a * c * (1.0 - smoothstep(-blur, blur, sd))), b.a);

  vec2 q = rot(angle) * (p - center);
  float l = length(q);
  vec2 dq = l > 1e-5 ? q / l : vec2(1.0, 0.0);
  float edge = outline(dq, c, k, radius);
  // the edge (about a pixel at 300 px high) is antialiased only once the sheet has left the
  // borders of the frame
  float aa = 0.003 * smoothstep(0.0, 0.1, progress) + 1e-5;
  float inside = 1.0 - smoothstep(-aa, aa, l - edge);
  if (inside <= 0.0) return col;

  // back onto the flat sheet: the outline is mapped onto the frame, the middle of the ball
  // holds more of it, as if the edges were tucked under
  float r = l / edge;
  float rect = frame(dq);
  vec2 s = dq * rect * mix(r, r * (0.6 + 0.4 * r), k);

  // the creases of the sheet, then those of the ball, that crumpling adds over them
  int count = creases < 1 ? 1 : creases;
  vec2 grad = vec2(0.0);
  vec2 shift = vec2(0.0);
  float valley = 0.0;
  float ridge = 0.0;
  fold(s, 7.3, count, 0.45 * vec2(ratio, 1.0), 0.6, c, 0.003 * rect / edge, 1.0 - 0.8 * k, grad, shift, valley, ridge);
  vec2 g2 = vec2(0.0);
  vec2 s2 = vec2(0.0);
  float v2 = 0.0;
  float r2 = 0.0;
  fold(q / radius, 2.9, count, vec2(0.7), 8.0, k, 0.003 / radius, k, g2, s2, v2, r2);
  grad += g2 * 0.8;
  vec2 piece = s + shift + s2 * 3.0;

  // the facets over the volume of the ball, lit from the top left (the light does not turn
  // with the ball)
  float rr = clamp(l / (radius * 1.1), 0.0, 1.0);
  vec3 sphere = vec3(q / (radius * 1.1) * k * 0.8, sqrt(1.0 - 0.64 * rr * rr * k));
  vec3 n = normalize(sphere + vec3(grad, 0.0));
  n.xy = rot(-angle) * n.xy;
  vec3 light = normalize(vec3(-0.5, 0.6, 0.8));
  float diffuse = max(dot(n, light), 0.0);
  vec3 hv = normalize(light + vec3(0.0, 0.0, 1.0));
  // only what facets add over the flat sheet
  float spec = max(pow(max(dot(n, hv), 0.0), 20.0) - pow(hv.z, 20.0), 0.0);
  float level = light.z;
  float relief = min(2.0 * c, 1.0);
  float shade = 1.0 + relief * ((0.12 + diffuse) / (0.12 + level) - 1.0) + 0.7 * spec * relief;
  shade -= 0.2 * relief * min(valley, 1.0);
  // occlusion toward the rim of the ball
  shade *= 1.0 - 0.3 * k * smoothstep(0.6, 1.0, r);

  // the edges of the sheet that the folds pull in are mirrored, as if folded back
  vec2 f = piece / vec2(ratio, 1.0) + 0.5;
  vec4 img = getFromColor(1.0 - abs(1.0 - mod(f, 2.0)));
  // the ink cracks along the ridges
  img.rgb = mix(img.rgb, paper.rgb, 0.6 * min(ridge, 1.0) * paper.a * c);
  vec4 ball = vec4(img.rgb * shade, img.a);

  // mixed premultiplied, so transparent images do not bleed their color
  float m = inside * ball.a;
  vec4 o = vec4(mix(col.rgb * col.a, ball.rgb, m), mix(col.a, 1.0, m));
  return o.a > 0.0 ? vec4(o.rgb / o.a, o.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The outgoing image crumples into a creased paper ball, shaded along its folds, which is then tossed away to reveal the incoming image",tags:["paper","3d","shrink","shadow"],params:{creases:{type:"int",default:16,min:1,max:32,step:1,description:"Number of folds creasing the paper"},size:{type:"float",default:.2,min:.05,max:.4,description:"Radius of the paper ball, relative to the image height"},direction:{type:"vec2",default:[1,.4],description:"Direction the ball is tossed toward"},paper:{type:"vec4",default:[.96,.95,.91,1],color:!0,description:"Color of the bare paper showing through the ink along the sharpest creases"},shadow:{type:"vec4",default:[0,0,0,.45],color:!0,description:"Color of the shadow cast on the incoming image"}},textures:[],createdAt:"Wed, 4 Nov 2026 20:12:49 +0100",updatedAt:"Wed, 4 Nov 2026 20:12:49 +0100"},{name:"Cube",paramsTypes:{persp:"float",unzoom:"float",reflection:"float",floating:"float",shading:"float"},defaultParams:{persp:.7,unzoom:.3,reflection:.4,floating:3,shading:.5},glsl:`// Author: gre
// License: MIT
// Description: The two images are faces of a box that turns a quarter turn in perspective, the outgoing face darkening as it turns away, above a reflective floor
// Tags: 3d, cube, rotate, reflection
// @range(0, 1) Amount of perspective
uniform float persp; // = 0.7
// @range(0, 1) How far the camera pulls back mid-turn, as a part of the frame
uniform float unzoom; // = 0.3
// @range(0, 1) Strength of the reflection
uniform float reflection; // = 0.4
// @range(0, 20) Gap between the box and its reflection, as a percentage of the frame height
uniform float floating; // = 3.0
// @range(0, 1) How much the faces darken as they turn away, and the shadow on the floor
uniform float shading; // = 0.5

const float PI = 3.141592653589793;
// width of the anti-aliased edges, as a part of the frame's height at the box's front
const float EDGE = 0.002;

// the ray (eye, dir) in the box's frame, the box turned by (c, s) around its vertical axis:
// returns (distance along the ray, horizontal position on the face, height, face) with face 0 for
// the outgoing image's face, 1 for the incoming one's, and a negative distance where it misses
vec4 hitBox(vec3 eye, vec3 dir, float w, float c, float s) {
  vec2 pivot = vec2(0.5 * w);
  vec2 e = eye.xz - pivot;
  vec2 o = vec2(e.x * c + e.y * s, -e.x * s + e.y * c) + pivot;
  vec2 d = vec2(dir.x * c + dir.z * s, -dir.x * s + dir.z * c);
  // the side faces seen from outside: the box spans [0, w] on x and z
  vec2 inv = 1.0 / vec2(d.x < 0.0 ? min(d.x, -1e-6) : max(d.x, 1e-6), d.y < 0.0 ? min(d.y, -1e-6) : max(d.y, 1e-6));
  vec2 t0 = (vec2(0.0) - o) * inv;
  vec2 t1 = (vec2(w) - o) * inv;
  vec2 tn = min(t0, t1);
  vec2 tf = max(t0, t1);
  float tin = max(tn.x, tn.y);
  if (tin <= 0.0 || tin > min(tf.x, tf.y)) return vec4(-1.0);
  vec2 hit = o + tin * d;
  float y = eye.y + tin * dir.y;
  if (y < 0.0 || y > 1.0) return vec4(-1.0);
  // the face first entered: z = 0 is the outgoing face, x = 0 the incoming one, the others are hidden
  if (tn.y >= tn.x) {
    if (d.y <= 0.0) return vec4(-1.0);
    return vec4(tin, hit.x / w, y, 0.0);
  }
  if (d.x <= 0.0) return vec4(-1.0);
  return vec4(tin, 1.0 - hit.y / w, y, 1.0);
}

vec4 transition(vec2 uv) {
  float w = ratio;
  // the turn starts and ends softly
  float turn = progress * progress * (3.0 - 2.0 * progress);
  float a = 0.5 * PI * turn;
  float c = cos(a), s = sin(a);
  if (progress >= 1.0) { c = 0.0; s = 1.0; }
  // 0 at both ends, for exact images and hard edges there
  float motion = sin(PI * clamp(progress, 0.0, 1.0));
  float zoom = 1.0 + max(unzoom, 0.0) * motion;

  // the front of the box is the screen: the camera keeps it framed, pulling back mid-turn
  float dist = 0.8 * max(w, 1.0) / clamp(persp, 0.01, 1.0);
  vec3 eye = vec3(0.5 * w, 0.5, -dist);
  vec2 sp = (uv - 0.5) * zoom + 0.5;
  vec3 dir = vec3(sp.x * w, sp.y, 0.0) - eye;

  // pixel footprint on the screen plane, for the anti-aliased edges
  float px = EDGE * zoom * min(10.0 * motion, 1.0);
  float shade0 = 1.0 - shading * (1.0 - c);
  float shade1 = 1.0 - shading * (1.0 - s);

  // the box in front, premultiplied
  vec4 front = vec4(0.0);
  vec4 b = hitBox(eye, dir, w, c, s);
  if (b.x > 0.0) {
    vec4 img = b.w < 0.5 ? getFromColor(vec2(b.y, b.z)) : getToColor(vec2(b.y, b.z));
    float m = 1.0;
    if (px > 0.0) {
      // the silhouette: top, bottom and the outer vertical edge of the face, seen foreshortened
      float e = px * b.x;
      vec3 n = b.w < 0.5 ? vec3(s, 0.0, -c) : vec3(-c, 0.0, -s);
      float fore = max(abs(dot(n, normalize(dir))), 0.05);
      float edge = b.w < 0.5 ? 1.0 - b.y : b.y;
      m = clamp(min(b.z, 1.0 - b.z) / e, 0.0, 1.0)
        * clamp(edge * w * fore / e, 0.0, 1.0);
    }
    // where the box covers the pixel, nothing behind it shows: the exact image at both ends
    if (m >= 1.0 && img.a >= 1.0) {
      return vec4(img.rgb * (b.w < 0.5 ? shade0 : shade1), img.a);
    }
    front = vec4(img.rgb * (b.w < 0.5 ? shade0 : shade1) * img.a, img.a) * m;
  }

  // the floor, h below the box, premultiplied; it fades in and out with the motion
  vec4 ground = vec4(0.0);
  float h = 0.005 * max(floating, 0.0);
  if (dir.y < 0.0 && motion > 0.0) {
    float tf = -(eye.y + h) / dir.y;
    vec3 f = eye + tf * dir;
    // the reflection: the same ray mirrored by the floor, fading with the height on the box
    vec3 meye = vec3(eye.x, -2.0 * h - eye.y, eye.z);
    vec3 mdir = vec3(dir.x, -dir.y, dir.z);
    vec4 r = hitBox(meye, mdir, w, c, s);
    if (r.x > 0.0) {
      vec4 img = r.w < 0.5 ? getFromColor(vec2(r.y, r.z)) : getToColor(vec2(r.y, r.z));
      float k = clamp(reflection, 0.0, 1.0) * (1.0 - r.z) * (1.0 - r.z);
      ground = vec4(img.rgb * (r.w < 0.5 ? shade0 : shade1) * img.a, img.a) * k;
    }
    // the contact shadow around the box, softer as it floats higher
    vec2 q = f.xz - vec2(0.5 * w);
    vec2 l = vec2(q.x * c + q.y * s, -q.x * s + q.y * c);
    float soft = 0.03 + 1.5 * h;
    float sh = shading * 0.7 * exp(-length(max(abs(l) - vec2(0.5 * w), 0.0)) / soft);
    // only as opaque as the bottom of the nearest face
    vec2 bl = l + vec2(0.5 * w);
    sh *= l.y < l.x
      ? getFromColor(vec2(clamp(bl.x / w, 0.0, 1.0), 0.0)).a
      : getToColor(vec2(clamp(1.0 - bl.y / w, 0.0, 1.0), 0.0)).a;
    ground = ground * (1.0 - sh) + vec4(0.0, 0.0, 0.0, sh);
    ground *= min(6.0 * motion, 1.0);
  }

  vec4 color = front + ground * (1.0 - front.a);
  return color.a > 0.0 ? vec4(color.rgb / color.a, color.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The two images are faces of a box that turns a quarter turn in perspective, the outgoing face darkening as it turns away, above a reflective floor",tags:["3d","cube","rotate","reflection"],params:{persp:{type:"float",default:.7,min:0,max:1,description:"Amount of perspective"},unzoom:{type:"float",default:.3,min:0,max:1,description:"How far the camera pulls back mid-turn, as a part of the frame"},reflection:{type:"float",default:.4,min:0,max:1,description:"Strength of the reflection"},floating:{type:"float",default:3,min:0,max:20,description:"Gap between the box and its reflection, as a percentage of the frame height"},shading:{type:"float",default:.5,min:0,max:1,description:"How much the faces darken as they turn away, and the shadow on the floor"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 8 Nov 2026 17:39:40 +0100"},{name:"CurtainRise",paramsTypes:{swags:"float",sag:"float",ruffles:"float",shading:"float"},defaultParams:{swags:3,sag:.14,ruffles:14,shading:.7},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image rises like a theater festoon curtain: cords lift its hem into scalloped swags while the fabric gathers into shaded ruffles, and it is drawn up out of the frame over the incoming image
// Tags: 3d, fold, vertical

// @range(1, 8, 1) Number of swags across a 16:9 frame (fewer in a portrait image)
uniform float swags; // = 3.0
// @range(0, 0.3) How low each swag droops between two cords, as a part of the frame's height
uniform float sag; // = 0.14
// @range(4, 30, 1) Number of gathered ruffles in the fabric
uniform float ruffles; // = 14.0
// @range(0, 1) Depth of the shading on the ruffles and swags, and of the shadow under the hem
uniform float shading; // = 0.7

const float PI = 3.141592653589793;

vec4 transition (vec2 uv) {
  float p = progress;
  // the fabric gathers early, then the cords pull it up
  float f = 1.0 - (1.0 - p) * (1.0 - p) * (1.0 - p);
  // the cords start pulling at once and are fastest midway
  float e = mix(p, p * p * (3.0 - 2.0 * p), 0.4);
  float s = sag * f;
  float lift = mix(-0.01, 1.0 + sag + 0.08, e);
  // across a swag, -1 and 1 at the cords
  float n = max(1.0, floor(swags * sqrt(ratio / 1.78) + 0.5)); // fewer swags in portrait
  float u = fract(uv.x * n) * 2.0 - 1.0;
  float bump = 1.0 - u * u;
  float hem = lift - s * bump;
  float aa = 0.002 + 0.004 * f;
  float inside = smoothstep(hem - aa, hem + aa, uv.y);

  vec4 c = vec4(0.0);
  if (inside > 0.0) {
    // q goes from 0 at the top rod to 1 at the hem; the whole height of fabric is gathered into it
    float h = max(1.0 - max(hem, 0.0), 1e-4);
    float q = clamp((1.0 - uv.y) / h, 0.0, 1.0);
    // ruffles: the fabric bunches where cos(a) > 0, rows parallel to the scalloped hem
    // as the curtain shortens, its ruffles merge so none gets thinner than 2% of the frame
    float m = min(max(1.0, floor(ruffles + 0.5)), h / 0.02);
    float a = 2.0 * PI * m * q;
    // the ruffles puff out most in the middle of each swag
    float g = 0.85 * f * min(1.0, 0.3 + 5.0 * (1.0 - h)) * (0.6 + 0.4 * bump);
    float v = clamp(q + g * sin(a) / (2.0 * PI * m), 0.0, 1.0);
    // the fabric is also pulled in toward the cords near the hem
    float pull = 0.25 * f * q * q * sin(PI * u) / (PI * n);
    c = getFromColor(vec2(uv.x - pull, 1.0 - v));

    // light from the front and a bit above
    float slope = 2.5 * g * cos(a);
    float diffuse = (1.0 - 0.35 * slope) / sqrt(1.0 + slope * slope);
    float crease = 0.5 + 0.5 * sin(a);
    float light = mix(1.0, diffuse * (1.0 - 0.45 * crease * crease), shading * g);
    // a soft sheen on the crest of each ruffle
    light += 0.18 * shading * g * smoothstep(0.4, 1.0, -cos(a));
    // each swag bulges toward the light in its middle and is pinched dark along the cords
    float depth = f * q * (0.3 + 0.7 * q);
    light *= 1.0 - shading * depth * (0.35 * u * u + 0.5 * exp(-(1.0 - abs(u)) * 14.0));
    // the hem rolls under a little
    light *= 1.0 - 0.35 * shading * f * exp(-(uv.y - hem) * 120.0);
    c.rgb *= light;
    if (inside >= 1.0) return c;
  }
  vec4 to = getToColor(uv);
  // soft shadow of the curtain just under its hem
  float below = max(hem - uv.y, 0.0);
  float shadow = 0.6 * shading * exp(-below * 22.0) * smoothstep(0.0, 0.05, lift) * (1.0 - smoothstep(1.0, 1.06, lift - s));
  to.rgb *= 1.0 - shadow;
  return mix(to, c, inside);
}
`,author:"gre",license:"MIT",description:"The outgoing image rises like a theater festoon curtain: cords lift its hem into scalloped swags while the fabric gathers into shaded ruffles, and it is drawn up out of the frame over the incoming image",tags:["3d","fold","vertical"],params:{swags:{type:"float",default:3,min:1,max:8,step:1,description:"Number of swags across a 16:9 frame (fewer in a portrait image)"},sag:{type:"float",default:.14,min:0,max:.3,description:"How low each swag droops between two cords, as a part of the frame's height"},ruffles:{type:"float",default:14,min:4,max:30,step:1,description:"Number of gathered ruffles in the fabric"},shading:{type:"float",default:.7,min:0,max:1,description:"Depth of the shading on the ruffles and swags, and of the shadow under the hem"}},textures:[],createdAt:"Mon, 9 Nov 2026 09:04:22 +0100",updatedAt:"Mon, 9 Nov 2026 09:04:22 +0100"},{name:"Curtains",paramsTypes:{folds:"float",shading:"float",bunch:"float",sway:"float"},defaultParams:{folds:7,shading:.7,bunch:.12,sway:.4},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image parts in the middle like stage curtains, gathering into shaded folds as it is pulled to the sides
// Tags: split, horizontal, fold, 3d

// @range(1, 16, 1) Number of folds in each curtain (fewer in a portrait image)
uniform float folds; // = 7.0
// @range(0, 1) Depth of the shading on the folds
uniform float shading; // = 0.7
// @range(0, 0.4) Width of each curtain once gathered, relative to the image width
uniform float bunch; // = 0.12
// @range(0, 1) How much the bottom of the curtains lags behind the top
uniform float sway; // = 0.4

const float PI = 3.141592653589793;

vec4 transition (vec2 uv) {
  // the bottom of the fabric follows the top with a little delay
  float lag = sway * (1.0 - uv.y);
  float p = progress * (1.0 - lag * (1.0 - progress));
  float open = mix(p, p * p * (3.0 - 2.0 * p), 0.75);
  // each curtain hangs from its outer edge, gathers to the bunch width, then leaves the frame
  float edge = -bunch * open * open;
  float w = mix(0.5, bunch, open);
  float x = min(uv.x, 1.0 - uv.x) - edge; // distance to the outer edge of the curtain
  if (x >= w) {
    // soft shadow of the curtain on the stage, fading as the curtain leaves the frame
    vec4 to = getToColor(uv);
    float shadow = 0.4 * exp((w - x) * 25.0) * clamp((edge + w) * 20.0, 0.0, 1.0);
    return vec4(to.rgb * (1.0 - shadow * open), to.a);
  }
  float t = x / w;
  // pleats: the fabric bunches up where cos(a) > 0 and is stretched elsewhere
  float n = max(1.0, floor(folds * min(ratio, 1.0) + 0.5)); // folds keep their size in portrait
  float a = 2.0 * PI * n * t;
  float f = 1.0 - (1.0 - open) * (1.0 - open) * (1.0 - open); // the folds form early
  float gather = 0.92 * f;
  float s = 0.5 * (t + gather * sin(a) / (2.0 * PI * n)); // position in the fabric
  vec4 c = getFromColor(vec2(uv.x < 0.5 ? s : 1.0 - s, uv.y));
  // light comes from the front, a bit from the middle of the stage
  float slope = 3.0 * gather * cos(a) * (uv.x < 0.5 ? 1.0 : -1.0);
  float diffuse = (1.0 + 0.5 * slope) / sqrt(1.25 * (1.0 + slope * slope));
  float crease = 0.5 + 0.5 * sin(a); // the back of each pleat is in the dark
  float light = mix(1.0, diffuse * (1.0 - 0.6 * crease * crease), shading * f);
  return vec4(c.rgb * light, c.a);
}
`,author:"gre",license:"MIT",description:"The outgoing image parts in the middle like stage curtains, gathering into shaded folds as it is pulled to the sides",tags:["split","horizontal","fold","3d"],params:{folds:{type:"float",default:7,min:1,max:16,step:1,description:"Number of folds in each curtain (fewer in a portrait image)"},shading:{type:"float",default:.7,min:0,max:1,description:"Depth of the shading on the folds"},bunch:{type:"float",default:.12,min:0,max:.4,description:"Width of each curtain once gathered, relative to the image width"},sway:{type:"float",default:.4,min:0,max:1,description:"How much the bottom of the curtains lags behind the top"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:18:48 +0100",updatedAt:"Sat, 31 Oct 2026 18:18:48 +0100"},{name:"CurvedWipe",paramsTypes:{direction:"vec2",curvature:"float",smoothness:"float",shadow:"vec4"},defaultParams:{direction:[0,1],curvature:.6,smoothness:.02,shadow:[0,0,0,.4]},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image is pulled away by its middle: the wipe edge bulges into a smooth curve that leads the way, then flattens as it reaches the far side
// Tags: wipe, curve, directional, shadow

// @param Direction the edge moves toward
uniform vec2 direction; // = vec2(0.0, 1.0)
// @range(0, 1) How far the middle of the edge leads its sides
uniform float curvature; // = 0.6
// @range(0, 0.2) Softness of the edge
uniform float smoothness; // = 0.02
// @color Color of the soft shadow the lifted edge casts on the incoming image (its alpha is its strength; 0 for none)
uniform vec4 shadow; // = vec4(0.0, 0.0, 0.0, 0.4)

const float PI = 3.141592653589793;

// a gentle ease in and out, which does not linger at the ends
float ease (float t) {
  return 0.5 * (t + t * t * (3.0 - 2.0 * t));
}

vec4 transition (vec2 uv) {
  vec2 dir = length(direction) > 0.0 ? normalize(direction) : vec2(0.0, 1.0);
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0);
  // half extents of the frame along the direction and across it
  float e = 0.5 * (abs(dir.x) * ratio + abs(dir.y));
  float w = 0.5 * (abs(dir.y) * ratio + abs(dir.x));
  vec2 across = vec2(-dir.y, dir.x);
  float d = dot(p, dir);
  // where the pixel is across the frame, from -1 to 1 (on a diagonal, these are the corners); it is the same
  // all along the direction, so the edge is a single curve, centered on the middle of the frame
  float x = clamp(dot(p, across) / w, -1.0, 1.0);
  float s = max(smoothness, 0.001);
  // each point of the edge runs on its own clock: the middle runs ahead and slows down at the far side,
  // where the sides catch up with it; the lead keeps the curve's shape alike on wide and narrow frames
  float k = clamp(curvature, 0.0, 1.0) * min(1.0, w / e) * (1.0 - x * x);
  float t = progress + k * progress * (1.0 - progress);
  float travel = 2.0 * (e + s);
  float edge = -e - s + travel * ease(t);
  float side = -e - s + travel * ease(progress);
  float m = 1.0 - smoothstep(-s, s, d - edge);
  // the more the edge is lifted, the wider and softer the shadow it casts on the incoming image
  float lift = edge - side;
  float spread = 0.012 + 0.25 * lift;
  // it falls behind the edge only, on the incoming image, cast by the outgoing image at the edge
  vec4 to = getToColor(uv);
  vec2 caster = clamp((p + (edge - d) * dir) / vec2(ratio, 1.0) + 0.5, 0.0, 1.0);
  float sh = shadow.a * sin(PI * progress) * exp(-max(edge - d, 0.0) / spread) * m * getFromColor(caster).a * to.a;
  to.rgb = mix(to.rgb, shadow.rgb, sh);
  return mix(getFromColor(uv), to, m);
}
`,author:"gre",license:"MIT",description:"The outgoing image is pulled away by its middle: the wipe edge bulges into a smooth curve that leads the way, then flattens as it reaches the far side",tags:["wipe","curve","directional","shadow"],params:{direction:{type:"vec2",default:[0,1],description:"Direction the edge moves toward"},curvature:{type:"float",default:.6,min:0,max:1,description:"How far the middle of the edge leads its sides"},smoothness:{type:"float",default:.02,min:0,max:.2,description:"Softness of the edge"},shadow:{type:"vec4",default:[0,0,0,.4],color:!0,description:"Color of the soft shadow the lifted edge casts on the incoming image (its alpha is its strength; 0 for none)"}},textures:[],createdAt:"Mon, 2 Nov 2026 09:49:41 +0100",updatedAt:"Mon, 2 Nov 2026 09:49:41 +0100"},{name:"CylinderRoll",paramsTypes:{curvature:"float",blur:"float",shading:"float",chroma:"float",downward:"bool"},defaultParams:{curvature:.8,blur:.5,shading:.6,chroma:.5,downward:!1},glsl:`// Author: gre
// License: MIT
// Description: The frame wraps around a drum that rolls up, the outgoing image turning away over its top in a motion blur and the incoming one coming around from below and unrolling flat
// Tags: 3d, roll, motion-blur, vertical, chromatic

// @range(0, 1) How much the frame wraps around the drum
uniform float curvature; // = 0.8
// @range(0, 1) Length of the motion blur at full speed
uniform float blur; // = 0.5
// @range(0, 1) How much the drum darkens as it turns away
uniform float shading; // = 0.6
// @range(0, 1) Amount of RGB split along the roll, growing with speed
uniform float chroma; // = 0.5
// @param Roll downward instead, the incoming image coming around from above
uniform bool downward; // = false

const int SAMPLES = 24;
// the half angle of the drum seen in the frame height, at full curvature
const float MAX_ANGLE = 1.1;
// distance from the camera to the drum's axis, in drum radii
const float DIST = 2.6;
// how much the horizontal lines arc away from the middle, per frame height squared
const float ARC = 0.12;

float hash(vec2 c) {
  vec2 q = fract(c * vec2(0.1031, 0.1030));
  q += dot(q, q.yx + 33.33);
  return fract((q.x + q.y) * q.x);
}

// mirrored coordinate, folded back into 0..1
float fold(float v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// the strip around the drum: the outgoing image, with the incoming one below it (or above)
vec4 strip(float x, float v) {
  if (downward ? v > 1.0 : v < 0.0) {
    return getToColor(vec2(x, fold(downward ? v - 1.0 : v + 1.0)));
  }
  return getFromColor(vec2(x, fold(v)));
}

// angle on the drum seen at the projected height c (the drum has a radius of 1)
float angleAt(float c) {
  c = clamp(c, -0.98 / sqrt(DIST * DIST - 1.0), 0.98 / sqrt(DIST * DIST - 1.0));
  return asin(c * DIST / sqrt(1.0 + c * c)) - atan(c);
}

vec4 transition(vec2 uv) {
  float p = progress;
  // ease in, roll fast in the middle, ease out
  float h = 1.0 - abs(2.0 * p - 1.0); // 0 at both ends, 1 in the middle
  float e = 0.5 * h * (0.1 + 0.9 * h * h);
  float roll = p < 0.5 ? e : 1.0 - e;
  // the blur and the RGB split stay low until the peak of the roll
  float h3 = h * h * h;
  float peak = h3 * h3;

  // the frame wraps around the drum early, and unwraps to flat sooner as the incoming image settles
  float bend = curvature * (p < 0.5 ? h * (2.0 - h) : h * h * (3.0 - 2.0 * h));
  float phi = MAX_ANGLE * bend + 1e-4;
  float arcK = ARC * bend;
  // the height of the frame's edge, projected with perspective
  float edgeY = sin(phi) / (DIST - cos(phi));

  vec2 n = 2.0 * uv - 1.0;
  // the horizontal lines arc away from the middle, toward the left and right edges
  float xr = n.x * ratio;
  float yn = n.y * (1.0 + arcK * xr * xr);
  float theta = angleAt(yn * edgeY);
  // nearer parts of the drum look wider: the drum is made wide enough to fill the frame's corners
  float thetaCorner = angleAt((1.0 + arcK * ratio * ratio) * edgeY);
  float width = (DIST - 1.0) / (DIST - cos(theta));
  float zoom = (DIST - cos(thetaCorner)) / (DIST - 1.0);
  float x = 0.5 + 0.5 * n.x / (zoom * width);
  // lit from the camera: darker as the surface turns away
  float facing = (DIST * cos(theta) - 1.0)
    / sqrt(1.0 + DIST * DIST - 2.0 * DIST * cos(theta)) ;
  float light = mix(1.0, clamp(facing, 0.0, 1.0), shading);

  // position on the strip (the frame height when flat), rolling the outgoing image away
  float v = 0.5 * (theta / phi + 1.0) + (downward ? roll : -roll);
  float len = 0.5 * blur * peak;
  float split = chroma * peak;
  float jitter = hash(uv * 1000.0);
  vec3 color = vec3(0.0);
  vec3 weight = vec3(0.0);
  float alpha = 0.0;
  for (int i = 0; i < SAMPLES; i++) {
    float t = (float(i) + jitter) / float(SAMPLES) - 0.5;
    vec4 img = strip(x, v + t * len);
    // the channels weigh the samples differently along the roll: an RGB split
    vec3 w = vec3(max(1.0 - 4.0 * split * t, 0.0), 1.0, max(1.0 + 4.0 * split * t, 0.0));
    color += img.rgb * img.a * w;
    weight += img.a * w;
    alpha += img.a;
  }
  color = color / max(weight, vec3(1e-5));
  return vec4(color * light, alpha / float(SAMPLES));
}
`,author:"gre",license:"MIT",description:"The frame wraps around a drum that rolls up, the outgoing image turning away over its top in a motion blur and the incoming one coming around from below and unrolling flat",tags:["3d","roll","motion-blur","vertical","chromatic"],params:{curvature:{type:"float",default:.8,min:0,max:1,description:"How much the frame wraps around the drum"},blur:{type:"float",default:.5,min:0,max:1,description:"Length of the motion blur at full speed"},shading:{type:"float",default:.6,min:0,max:1,description:"How much the drum darkens as it turns away"},chroma:{type:"float",default:.5,min:0,max:1,description:"Amount of RGB split along the roll, growing with speed"},downward:{type:"bool",default:!1,description:"Roll downward instead, the incoming image coming around from above"}},textures:[],createdAt:"Sat, 31 Oct 2026 23:20:50 +0100",updatedAt:"Sat, 31 Oct 2026 23:20:50 +0100"},{name:"DefocusBlur",paramsTypes:{blurSize:"float"},defaultParams:{blurSize:.02},glsl:`// Author: Sergey Kosarevsky
// License: MIT
// Description: A crossfade through an out-of-focus blur
// Tags: blur, blend
// Ported from https://gist.github.com/corporateshark/b9f8e5675c647e615419

// @param Amount of blur
uniform float blurSize; // = 0.02

// 12-tap Poisson disk
// https://github.com/spite/Wagner/blob/master/fragment-shaders/poisson-disc-blur-fs.glsl

vec4 transition(vec2 uv) {
  float T = progress;
  float half_ = 0.5;
  float D = (T < half_) ? mix(0.0, blurSize, T / half_) : mix(blurSize, 0.0, (T - half_) / half_);
  vec4 C0 = getFromColor(uv);
  vec4 C1 = getToColor(uv);
  C0 += getFromColor(vec2(-0.326, -0.406) * D + uv);
  C1 += getToColor(vec2(-0.326, -0.406) * D + uv);
  C0 += getFromColor(vec2(-0.840, -0.074) * D + uv);
  C1 += getToColor(vec2(-0.840, -0.074) * D + uv);
  C0 += getFromColor(vec2(-0.696,  0.457) * D + uv);
  C1 += getToColor(vec2(-0.696,  0.457) * D + uv);
  C0 += getFromColor(vec2(-0.203,  0.621) * D + uv);
  C1 += getToColor(vec2(-0.203,  0.621) * D + uv);
  C0 += getFromColor(vec2( 0.962, -0.195) * D + uv);
  C1 += getToColor(vec2( 0.962, -0.195) * D + uv);
  C0 += getFromColor(vec2( 0.473, -0.480) * D + uv);
  C1 += getToColor(vec2( 0.473, -0.480) * D + uv);
  C0 += getFromColor(vec2( 0.519,  0.767) * D + uv);
  C1 += getToColor(vec2( 0.519,  0.767) * D + uv);
  C0 += getFromColor(vec2( 0.185, -0.893) * D + uv);
  C1 += getToColor(vec2( 0.185, -0.893) * D + uv);
  C0 += getFromColor(vec2( 0.507,  0.064) * D + uv);
  C1 += getToColor(vec2( 0.507,  0.064) * D + uv);
  C0 += getFromColor(vec2( 0.896,  0.412) * D + uv);
  C1 += getToColor(vec2( 0.896,  0.412) * D + uv);
  C0 += getFromColor(vec2(-0.322, -0.933) * D + uv);
  C1 += getToColor(vec2(-0.322, -0.933) * D + uv);
  C0 += getFromColor(vec2(-0.792, -0.598) * D + uv);
  C1 += getToColor(vec2(-0.792, -0.598) * D + uv);
  C0 /= 13.0;
  C1 /= 13.0;
  return mix(C0, C1, T);
}
`,author:"Sergey Kosarevsky",license:"MIT",description:"A crossfade through an out-of-focus blur",tags:["blur","blend"],params:{blurSize:{type:"float",default:.02,description:"Amount of blur"}},textures:[],createdAt:"Sun, 29 Mar 2026 20:32:54 +0200",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"DiamondWipe",paramsTypes:{center:"vec2",smoothness:"float"},defaultParams:{center:[.5,.5],smoothness:.03},glsl:`// Author: gre
// License: MIT
// Description: A soft-edged diamond grows from the center to reveal the incoming image
// Tags: shape, wipe, iris

// @param Center of the diamond
uniform vec2 center; // = vec2(0.5)
// @range(0, 0.5) Softness of the diamond's edge
uniform float smoothness; // = 0.03

vec4 transition (vec2 uv) {
  // Measured in square pixels, so the diamond is not stretched
  vec2 d = abs(uv - center) * vec2(ratio, 1.0);
  // The diamond covers the frame once it reaches the farthest corner
  vec2 far = max(center, 1.0 - center) * vec2(ratio, 1.0);
  float dist = (d.x + d.y) / (far.x + far.y);
  float s = max(smoothness, 0.001);
  float m = smoothstep(0.0, s, progress * (1.0 + s) - dist);
  return mix(getFromColor(uv), getToColor(uv), m);
}
`,author:"gre",license:"MIT",description:"A soft-edged diamond grows from the center to reveal the incoming image",tags:["shape","wipe","iris"],params:{center:{type:"vec2",default:[.5,.5],description:"Center of the diamond"},smoothness:{type:"float",default:.03,min:0,max:.5,description:"Softness of the diamond's edge"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:17:51 +0100",updatedAt:"Sat, 31 Oct 2026 18:17:51 +0100"},{name:"Directional",paramsTypes:{direction:"vec2"},defaultParams:{direction:[0,1]},glsl:`// Author: Gaëtan Renaudeau
// License: MIT
// Description: The incoming image pushes the outgoing one out in a given direction
// Tags: slide, push, directional

// @param Direction of the movement
uniform vec2 direction; // = vec2(0.0, 1.0)

vec4 transition (vec2 uv) {
  vec2 p = uv + progress * sign(direction);
  vec2 f = fract(p);
  return mix(
    getToColor(f),
    getFromColor(f),
    step(0.0, p.y) * step(p.y, 1.0) * step(0.0, p.x) * step(p.x, 1.0)
  );
}
`,author:"Gaëtan Renaudeau",license:"MIT",description:"The incoming image pushes the outgoing one out in a given direction",tags:["slide","push","directional"],params:{direction:{type:"vec2",default:[0,1],description:"Direction of the movement"}},textures:[],createdAt:"Thu, 19 Apr 2018 12:20:29 +0200",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"DirectionalEased",paramsTypes:{direction:"vec2"},defaultParams:{direction:[0,1]},glsl:`// Author: Max Plotnikov
// License: MIT
// Description: Like Directional, with an eased movement
// Tags: slide, push, directional

// @param Direction of the movement
uniform vec2 direction; // = vec2(0.0, 1.0)

vec4 transition (vec2 uv) {
  float easing = sqrt((2.0 - progress) * progress);
  vec2 p = uv + easing * sign(direction);
  vec2 f = fract(p);
  return mix(
    getToColor(f),
    getFromColor(f),
    step(0.0, p.y) * step(p.y, 1.0) * step(0.0, p.x) * step(p.x, 1.0)
  );
}
`,author:"Max Plotnikov",license:"MIT",description:"Like Directional, with an eased movement",tags:["slide","push","directional"],params:{direction:{type:"vec2",default:[0,1],description:"Direction of the movement"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"DirectionalScaled",paramsTypes:{direction:"vec2",scale:"float"},defaultParams:{direction:[0,1],scale:.7},glsl:`// Author: Thibaut Foussard
// based on Directional transition by Gaëtan Renaudeau
// https://gl-transitions.com/editor/Directional
// License: MIT
// Description: Like Directional, with both images scaled down while they slide
// Tags: slide, push, zoom, directional

#define PI acos(-1.0)

// @param Direction of the movement
uniform vec2 direction; // = vec2(0.0, 1.0)
uniform float scale; // = .7

float parabola(float x) {
  float y = pow(sin(x * PI), 1.);
  return y;
}

vec4 transition (vec2 uv) {
  float easedProgress = pow(sin(progress  * PI / 2.), 3.);
  vec2 p = uv + easedProgress * sign(direction);
  vec2 f = fract(p);
  
  float s = 1. - (1. - (1. / scale)) * parabola(progress);
  f = (f - 0.5) * s  + 0.5;
  
  float mixer = step(0.0, p.y) * step(p.y, 1.0) * step(0.0, p.x) * step(p.x, 1.0);
  vec4 col = mix(getToColor(f), getFromColor(f), mixer);
  
  float border = step(0., f.x) * step(0., (1. - f.x)) * step(0., f.y) * step(0., 1. - f.y);
  col *= border;
  
  return col;
}
`,author:"Thibaut Foussard",license:"MIT",description:"Like Directional, with both images scaled down while they slide",tags:["slide","push","zoom","directional"],params:{direction:{type:"vec2",default:[0,1],description:"Direction of the movement"},scale:{type:"float",default:.7}},textures:[],createdAt:"Tue, 4 Apr 2023 03:29:34 -0400",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"DirectionalWarp",paramsTypes:{smoothness:"float",direction:"vec2"},defaultParams:{smoothness:.1,direction:[-1,1]},glsl:`// Author: pschroen
// License: MIT
// Description: A diagonal wipe with a warped, smeared edge
// Tags: wipe, warp, directional

// @param Softness of the edge
uniform float smoothness; // = 0.1
// @param Direction of the wipe
uniform vec2 direction; // = vec2(-1.0, 1.0)

const vec2 center = vec2(0.5, 0.5);

vec4 transition (vec2 uv) {
  vec2 v = normalize(direction);
  v /= abs(v.x) + abs(v.y);
  float d = v.x * center.x + v.y * center.y;
  float m = 1.0 - smoothstep(-smoothness, 0.0, v.x * uv.x + v.y * uv.y - (d - 0.5 + progress * (1.0 + smoothness)));
  return mix(getFromColor((uv - 0.5) * (1.0 - m) + 0.5), getToColor((uv - 0.5) * m + 0.5), m);
}
`,author:"pschroen",license:"MIT",description:"A diagonal wipe with a warped, smeared edge",tags:["wipe","warp","directional"],params:{smoothness:{type:"float",default:.1,description:"Softness of the edge"},direction:{type:"vec2",default:[-1,1],description:"Direction of the wipe"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"DirectionalWipe",paramsTypes:{direction:"vec2",smoothness:"float"},defaultParams:{direction:[1,-1],smoothness:.5},glsl:`// Author: gre
// License: MIT
// Description: A straight wipe in any direction, diagonal and soft-edged by default; a smoothness of 0 gives a hard edge
// Tags: wipe, directional

// @param Direction of the wipe
uniform vec2 direction; // = vec2(1.0, -1.0)
// @param Softness of the edge
uniform float smoothness; // = 0.5
 
const vec2 center = vec2(0.5, 0.5);
 
vec4 transition (vec2 uv) {
  vec2 v = normalize(direction);
  v /= abs(v.x)+abs(v.y);
  float d = v.x * center.x + v.y * center.y;
  float m =
    (1.0-step(progress, 0.0)) * // there is something wrong with our formula that makes m not equals 0.0 with progress is 0.0
    (1.0 - smoothstep(-smoothness, 0.0, v.x * uv.x + v.y * uv.y - (d-0.5+progress*(1.+smoothness))));
  return mix(getFromColor(uv), getToColor(uv), m);
}
`,author:"gre",license:"MIT",description:"A straight wipe in any direction, diagonal and soft-edged by default; a smoothness of 0 gives a hard edge",tags:["wipe","directional"],params:{direction:{type:"vec2",default:[1,-1],description:"Direction of the wipe"},smoothness:{type:"float",default:.5,description:"Softness of the edge"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Thu, 5 Nov 2026 11:34:33 +0100"},{name:"Disintegrate",paramsTypes:{particleSize:"float",direction:"vec2",spread:"float"},defaultParams:{particleSize:.008,direction:[1,-.15],spread:.75},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image crumbles into fine dust from one side, its grains blown away by the wind and fading out, revealing the incoming image underneath
// Tags: particles, dust, wind, directional

// @range(0.0075, 0.03) Size of the dust grains, in frame heights
uniform float particleSize; // = 0.008
// @param Direction in which the wind blows the dust
uniform vec2 direction; // = vec2(1.0, -0.15)
// @range(0, 1) How far the dust flies and scatters before it fades out
uniform float spread; // = 0.75

// the grains a pixel looks back to, along the wind: every grain up to 16 cells away,
// one in 2 up to 32 cells, one in 4 up to 64 cells (only those stay visible that far,
// so the dust thins out as it flies): 35 candidates, without unrolling a long loop
const int NEAR = 17;
const int CANDIDATES = 35;
// part of the transition during which a grain flies, from its release to its fade-out
const float LIFE = 0.45;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// smooth value noise, between -1 and 1
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return 2.0 * mix(mix(a, b, f.x), mix(c, d, f.x), f.y) - 1.0;
}

// the grains' sideways drift, in gusts along the wind, between -1 and 1: it depends only
// on where a grain comes from along the wind, so that a pixel knows which row to look in
float gust(float x) {
  float i = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return 2.0 * mix(hash12(vec2(i, 7.0)), hash12(vec2(i + 1.0, 7.0)), f) - 1.0;
}

// when the grain at this center (in cells) is released, from the downwind side first,
// along a ragged front
float release(vec2 center, float h, float halfLength, float s) {
  float front = 1.0 - (center.x + halfLength) / (2.0 * halfLength) + 0.14 * noise(center * s * 6.0) + 0.08 * (h - 0.5);
  return clamp((front + 0.12) / 1.24, 0.0, 1.0) * (1.0 - LIFE);
}

vec4 transition(vec2 uv) {
  vec2 d = length(direction) > 0.0 ? normalize(direction) : vec2(1.0, 0.0);
  vec2 n = vec2(-d.y, d.x);
  // grid of grains aligned with the wind: x along it, y across it, in cells
  vec2 fp = (uv - 0.5) * vec2(ratio, 1.0);
  float s = particleSize;
  vec2 g = vec2(dot(fp, d), dot(fp, n)) / s;
  float halfLength = 0.5 * (ratio * abs(d.x) + abs(d.y)) / s;
  // the longest flight, in cells (at most 60, within the 64 cells looked back to)
  float reach = min(spread * 0.45 / s, 60.0);
  float px = floor(g.x);

  // this pixel's own grain: once it has left, the incoming image shows through
  vec2 own = floor(g);
  vec4 under = progress > release(own + 0.5, hash12(own), halfLength, s) ? getToColor(uv) : getFromColor(uv);
  vec2 grainUV = vec2(0.5);
  float cover = 0.0;
  for (int i = 0; i < CANDIDATES; i++) {
    // the column of the candidate grain
    float fi = float(i);
    float cx = px - fi;
    if (i >= NEAR + 9) {
      cx = floor(px / 4.0) * 4.0 - 4.0 * (fi - float(NEAR + 9) + 8.0);
    } else if (i >= NEAR) {
      cx = floor(px / 2.0) * 2.0 - 2.0 * (fi - float(NEAR) + 8.0);
    }
    // how far the grain stays visible (in cells): further when its column is a multiple
    // of 2, and of 4, as far as the pixels look back to
    float visible = mod(cx, 4.0) < 0.5 ? 63.0 : mod(cx, 2.0) < 0.5 ? 31.0 : 15.0;
    float drift = 0.3 * gust(cx * s * 4.0);
    // the row the grain comes from: its sideways drift is known from its column and how
    // far it has flown to get here
    vec2 cell = vec2(cx, floor(g.y - drift * (g.x - cx - 0.5)));
    vec2 center = cell + 0.5;
    vec2 cuv = (center.x * d + center.y * n) * s / vec2(ratio, 1.0) + 0.5;
    if (cuv.x < 0.0 || cuv.x > 1.0 || cuv.y < 0.0 || cuv.y > 1.0) continue;
    float h = hash12(cell);
    float t = (progress - release(center, h, halfLength, s)) / LIFE;
    if (t <= 0.0 || t >= 1.0) continue;
    float r2 = fract(h * 13.7);
    // the grain speeds up, drifts sideways, shrinks and fades out
    float travel = reach * (0.4 + 0.6 * r2) * t * (0.2 + 0.8 * t);
    // it first fills its cell, then crumbles to a smaller speck
    float crumble = smoothstep(0.0, 0.25, t);
    vec2 pos = center + vec2(travel + (fract(h * 71.1) - 0.5) * 0.3 * crumble, drift * travel);
    vec2 local = abs(g - pos);
    float size = mix(0.5, 0.3 * (1.0 - 0.5 * t) * (0.6 + 0.4 * h), crumble);
    float feather = 0.001 + 0.12 * crumble;
    float a = (1.0 - smoothstep(size - feather, size, max(local.x, local.y))) * (1.0 - smoothstep(0.15, 1.0, t))
      * (1.0 - smoothstep(0.6 * visible, visible, travel));
    if (a > cover) {
      cover = a;
      grainUV = cuv;
    }
  }
  return mix(under, getFromColor(grainUV), cover);
}
`,author:"gre",license:"MIT",description:"The outgoing image crumbles into fine dust from one side, its grains blown away by the wind and fading out, revealing the incoming image underneath",tags:["particles","dust","wind","directional"],params:{particleSize:{type:"float",default:.008,min:.0075,max:.03,description:"Size of the dust grains, in frame heights"},direction:{type:"vec2",default:[1,-.15],description:"Direction in which the wind blows the dust"},spread:{type:"float",default:.75,min:0,max:1,description:"How far the dust flies and scatters before it fades out"}},textures:[],createdAt:"Sun, 1 Nov 2026 20:55:33 +0100",updatedAt:"Sun, 1 Nov 2026 20:55:33 +0100"},{name:"DisplacementMap",paramsTypes:{strength:"float"},defaultParams:{strength:.5},glsl:`// Author: Travis Fischer
// License: MIT
// Description: A crossfade in which a displacement map (an extra grayscale texture) warps both images
// Tags: displace, distort, blend
//
// Adapted from a Codrops article by Robin Delaporte
// https://tympanus.net/Development/DistortionHoverEffect

uniform sampler2D displacementMap;

// @param Strength of the displacement
uniform float strength; // = 0.5

vec4 transition (vec2 uv) {
  float displacement = texture2D(displacementMap, uv).r * strength;

  vec2 uvFrom = vec2(uv.x + progress * displacement, uv.y);
  vec2 uvTo = vec2(uv.x - (1.0 - progress) * displacement, uv.y);

  return mix(
    getFromColor(uvFrom),
    getToColor(uvTo),
    progress
  );
}
`,author:"Travis Fischer",license:"MIT",description:"A crossfade in which a displacement map (an extra grayscale texture) warps both images",tags:["displace","distort","blend"],params:{strength:{type:"float",default:.5,description:"Strength of the displacement"}},textures:["displacementMap"],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"DitherDissolve",paramsTypes:{dotSize:"float"},defaultParams:{dotSize:.02},glsl:`// Author: gre
// License: MIT
// Description: The incoming image appears through a regular 8x8 ordered dither pattern, like a retro computer screen
// Tags: dissolve, pattern, retro, pixelate

// @range(0.002, 0.05) Size of a dither dot, relative to the height
uniform float dotSize; // = 0.02

// Threshold of the 8x8 Bayer matrix at integer cell c, in (0, 1)
float bayer(vec2 c) {
  float v = 0.0;
  float scale = 16.0;
  for (int i = 0; i < 3; i++) {
    vec2 bit = mod(floor(c), 2.0);
    // a 2x2 step: 0 2 / 3 1, i.e. 2 * (x xor y) + y
    v += scale * (2.0 * abs(bit.x - bit.y) + bit.y);
    c *= 0.5;
    scale *= 0.25;
  }
  return (v + 0.5) / 64.0;
}

vec4 transition(vec2 uv) {
  vec2 cell = floor(uv * vec2(ratio, 1.0) / dotSize);
  return progress < bayer(cell) ? getFromColor(uv) : getToColor(uv);
}
`,author:"gre",license:"MIT",description:"The incoming image appears through a regular 8x8 ordered dither pattern, like a retro computer screen",tags:["dissolve","pattern","retro","pixelate"],params:{dotSize:{type:"float",default:.02,min:.002,max:.05,description:"Size of a dither dot, relative to the height"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:16:40 +0100",updatedAt:"Sat, 31 Oct 2026 18:16:40 +0100"},{name:"DominoFall",paramsTypes:{count:"int",reverse:"bool",knock:"float",lean:"float",perspective:"float",shading:"float"},defaultParams:{count:12,reverse:!1,knock:.2,lean:.8,perspective:.8,shading:.6},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image is cut into standing slats that topple backward like dominoes in a chain reaction across the frame, each one leaning onto the next and knocking it over, until they all lie flat and reveal the incoming image
// Tags: 3d, stripes, rotate

// @range(2, 40, 1) Number of slats
uniform int count; // = 12
// @param The chain runs from right to left instead of left to right
uniform bool reverse; // = false
// @range(0.05, 1) Part of a slat's fall after which it knocks the next one: lower runs the chain faster, with more slats falling at once
uniform float knock; // = 0.2
// @range(0, 1) How far each slat's top leans sideways onto the next one, as a part of a slat's width
uniform float lean; // = 0.8
// @range(0, 1) Strength of the perspective
uniform float perspective; // = 0.8
// @range(0, 1) How much the slats darken as they fall, and the shadows they cast
uniform float shading; // = 0.6

const float PI = 3.141592653589793;
// width of the anti-aliased edges, as a part of the frame's height
const float EDGE = 0.0015;

float knockPart() {
  return clamp(knock, 0.05, 1.0);
}

// the fall of slat j, 0 standing to 1 lying flat
float fallTime(float j, float n) {
  if (progress >= 1.0) return 1.0;
  float k = knockPart();
  // each slat falls during d and knocks the next one after k * d
  float d = 1.0 / (1.0 + (n - 1.0) * k);
  return clamp((progress - j * k * d) / d, 0.0, 1.0);
}

// the slat's angle: it starts with the push of the previous one, then gravity takes over
float fallAngle(float t) {
  return 0.5 * PI * t * (0.2 + 0.8 * t);
}

// where slat j is seen at the point (xc, y) of the frame: (x across the slat, height on it, its fall, its angle),
// with a negative fall where it is not seen (its height can exceed 1, above its top)
vec4 slatPoint(float j, float n, float w, float xc, float y) {
  vec4 none = vec4(0.0, 0.0, -1.0, 0.0);
  if (j < 0.0 || j > n - 1.0) return none;
  float t = fallTime(j, n);
  if (t >= 1.0) return none;
  float a = fallAngle(t);
  float c = cos(a), s = sin(a);
  // a camera in front of the slat goes down to the level of the hinge as the slat falls,
  // so that the slat ends edge-on
  vec3 eye = vec3((j + 0.5) * w, 0.5 * c, -1.0 / max(perspective, 0.01));
  vec3 dir = vec3(xc, y, 0.0) - eye;
  // cast a ray onto the slat turned back by a around its bottom edge
  float den = dir.z * c - dir.y * s;
  if (den <= 0.0) return none;
  float r = (eye.y * s - eye.z * c) / den;
  vec3 hit = eye + r * dir;
  float h = hit.y * c + hit.z * s;
  if (r <= 0.0 || h < 0.0) return none;
  // the top leans sideways toward the next slat until it touches it
  float side = clamp(lean, 0.0, 1.0) * w * min(t / knockPart(), 1.0) * h;
  return vec4(hit.x - side - j * w, h, t, a);
}

// draws slat j, seen at pt, over color; front is where the next slat, which may stand in front of it, is seen
vec4 drawSlat(vec4 color, float j, vec4 pt, vec4 front, float w) {
  float t = pt.z;
  if (t < 0.0) return color;
  float s = sin(pt.w);
  float d = min(pt.x, w - pt.x);
  float m;
  if (t <= 0.0) {
    // standing still: the slats tile the frame exactly
    m = d >= 0.0 && pt.y <= 1.0 ? 1.0 : 0.0;
  } else {
    // anti-aliased edges, widened as the slat is seen narrower and shorter
    float e = EDGE * min(10.0 * t, 1.0) * (1.0 + max(perspective, 0.0) * pt.y * s);
    m = clamp(d / e + 0.5, 0.0, 1.0) * clamp((1.0 - pt.y) * max(cos(pt.w), 0.05) / e + 0.5, 0.0, 1.0);
  }
  if (m <= 0.0) return color;
  float sx = (j * w + clamp(pt.x, 0.0, w)) / ratio;
  vec4 img = getFromColor(vec2(reverse ? 1.0 - sx : sx, min(pt.y, 1.0)));
  // darker as it falls away, more toward its top
  float shade = 1.0 - shading * s * (0.4 + 0.6 * pt.y);
  // the next slat, less fallen and so in front, shades the one leaning onto it along its edge, up to its top
  if (front.z >= 0.0 && front.z < t && front.x < 0.0) {
    float reach = clamp(1.0 - (front.y - 1.0) / 0.05, 0.0, 1.0);
    shade *= 1.0 - 0.6 * shading * exp(front.x / (0.15 * w)) * reach;
  }
  img.rgb *= shade;
  return mix(color, img, m);
}

vec4 transition (vec2 uv) {
  float n = float(count < 1 ? 1 : count);
  float w = ratio / n;
  // x along the chain, in frame heights
  float xc = (reverse ? 1.0 - uv.x : uv.x) * ratio;
  float col = clamp(floor(xc / w), 0.0, n - 1.0);

  vec4 color = getToColor(uv);
  // the contact shadow of the falling slat on the floor
  float t0 = fallTime(col, n);
  color.rgb *= 1.0 - 2.4 * shading * t0 * (1.0 - t0) * exp(-40.0 * uv.y);

  // the slats are seen narrower as they fall, and their tops lean over the next column at most:
  // the slat before this column, behind, then the one of this column
  vec4 cur = slatPoint(col, n, w, xc, uv.y);
  color = drawSlat(color, col - 1.0, slatPoint(col - 1.0, n, w, xc, uv.y), cur, w);
  color = drawSlat(color, col, cur, slatPoint(col + 1.0, n, w, xc, uv.y), w);
  return color;
}
`,author:"gre",license:"MIT",description:"The outgoing image is cut into standing slats that topple backward like dominoes in a chain reaction across the frame, each one leaning onto the next and knocking it over, until they all lie flat and reveal the incoming image",tags:["3d","stripes","rotate"],params:{count:{type:"int",default:12,min:2,max:40,step:1,description:"Number of slats"},reverse:{type:"bool",default:!1,description:"The chain runs from right to left instead of left to right"},knock:{type:"float",default:.2,min:.05,max:1,description:"Part of a slat's fall after which it knocks the next one: lower runs the chain faster, with more slats falling at once"},lean:{type:"float",default:.8,min:0,max:1,description:"How far each slat's top leans sideways onto the next one, as a part of a slat's width"},perspective:{type:"float",default:.8,min:0,max:1,description:"Strength of the perspective"},shading:{type:"float",default:.6,min:0,max:1,description:"How much the slats darken as they fall, and the shadows they cast"}},textures:[],createdAt:"Fri, 6 Nov 2026 14:28:19 +0100",updatedAt:"Fri, 6 Nov 2026 14:28:19 +0100"},{name:"DoomMelt",paramsTypes:{bars:"int",amplitude:"float",noise:"float",frequency:"float",dripScale:"float"},defaultParams:{bars:30,amplitude:2,noise:.1,frequency:.5,dripScale:.5},glsl:`// Author: Zeh Fernando
// License: MIT
// Description: The outgoing image melts down in uneven columns, like the Doom screen wipe
// Tags: melt, columns, retro


// Transition parameters --------

// Number of total bars/columns
uniform int bars; // = 30

// Multiplier for speed ratio. 0 = no variation when going down, higher = some elements go much faster
uniform float amplitude; // = 2

// Further variations in speed. 0 = no noise, 1 = super noisy (ignore frequency)
uniform float noise; // = 0.1

// Speed variation horizontally. the bigger the value, the shorter the waves
uniform float frequency; // = 0.5

// How much the bars seem to "run" from the middle of the screen first (sticking to the sides). 0 = no drip, 1 = curved drip
uniform float dripScale; // = 0.5


// The code proper --------

float rand(int num) {
  return fract(mod(float(num) * 67123.313, 12.0) * sin(float(num) * 10.3) * cos(float(num)));
}

float wave(int num) {
  float fn = float(num) * frequency * 0.1 * float(bars);
  return cos(fn * 0.5) * cos(fn * 0.13) * sin((fn+10.0) * 0.3) / 2.0 + 0.5;
}

float drip(int num) {
  return sin(float(num) / float(bars - 1) * 3.141592) * dripScale;
}

float pos(int num) {
  return (noise == 0.0 ? wave(num) : mix(wave(num), rand(num), noise)) + (dripScale == 0.0 ? 0.0 : drip(num));
}

vec4 transition(vec2 uv) {
  int bar = int(uv.x * (float(bars)));
  float scale = 1.0 + pos(bar) * amplitude;
  float phase = progress * scale;
  float posY = uv.y / vec2(1.0).y;
  vec2 p;
  vec4 c;
  if (phase + posY < 1.0) {
    p = vec2(uv.x, uv.y + mix(0.0, vec2(1.0).y, phase)) / vec2(1.0).xy;
    c = getFromColor(p);
  } else {
    p = uv.xy / vec2(1.0).xy;
    c = getToColor(p);
  }

  // Finally, apply the color
  return c;
}
`,author:"Zeh Fernando",license:"MIT",description:"The outgoing image melts down in uneven columns, like the Doom screen wipe",tags:["melt","columns","retro"],params:{bars:{type:"int",default:30},amplitude:{type:"float",default:2},noise:{type:"float",default:.1},frequency:{type:"float",default:.5},dripScale:{type:"float",default:.5}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"Doorway",paramsTypes:{reflection:"float",perspective:"float",depth:"float"},defaultParams:{reflection:.4,perspective:.4,depth:3},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image opens like double doors swinging toward the viewer, as the incoming one comes forward from the dark room behind, with a floor reflection
// Tags: doors, 3d, reflection

// @range(0, 1) Strength of the floor reflection under the incoming image
uniform float reflection; // = 0.4
// @range(0, 1) Amount of perspective on the swinging doors
uniform float perspective; // = 0.4
// @range(1, 10) How far back the incoming image starts (1: no distance)
uniform float depth; // = 3

const float PI = 3.141592653589793;

// cast the view ray of screen point x (aspect units, the frame is 0..w) onto a leaf of
// width w/2 hinged on the left edge and turned toward the viewer by angle a.
// The eye is at (w/2, 0.5, -eye) and the frame at z = 0; returns (t, distance along the leaf)
// where t scales the ray so that t = 1 is the frame plane
vec2 leafHit (float x, float w, float eye, float a) {
  float c = cos(a), s = sin(a);
  float t = (eye * c - 0.5 * w * s) / (s * (x - 0.5 * w) + eye * c);
  vec2 hit = vec2(0.5 * w + t * (x - 0.5 * w), eye * (t - 1.0));
  return vec2(t, hit.x * c - hit.y * s);
}

// screen x of a point (x, z) seen from the eye
float project (vec2 p, float w, float eye) {
  return 0.5 * w + (p.x - 0.5 * w) * eye / (eye + p.y);
}

float easeInOut (float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - 4.0 * (1.0 - t) * (1.0 - t) * (1.0 - t);
}

// the room behind: the incoming image coming forward, and its reflection on the floor
vec4 room (vec2 uv, float x, float edgeL, float edgeR, float close, float dolly) {
  float size = mix(max(depth, 1.0), 1.0, dolly);
  vec2 p = (uv - 0.5) * size + 0.5;
  // soft border while it is far, exactly sharp once it fills the frame
  float soft = 0.004 * (size - 1.0) + 1e-6;
  vec2 m = smoothstep(-soft, soft, p) * smoothstep(-soft, soft, 1.0 - p);
  vec4 c = getToColor(clamp(p, 0.0, 1.0)) * (m.x * m.y);
  if (p.y < 0.0) {
    vec2 r = vec2(p.x, -1.2 * p.y - 0.02);
    float f = reflection * (1.0 - r.y) * m.x * smoothstep(0.0, 0.01, r.y);
    c += getToColor(clamp(r, 0.0, 1.0)) * f * (1.0 - m.y);
  }
  // the lit room spills its light through the opening, and the leaves cast soft shadows
  // along their edges; both settle as the doors open
  float wl = 0.03 + 0.12 * close;
  float shadow = (1.0 - smoothstep(0.0, wl, x - edgeL)) + (1.0 - smoothstep(0.0, wl, edgeR - x));
  float light = (1.0 + 0.6 * close * close) * (1.0 - 0.7 * close * min(shadow, 1.0));
  return vec4(min(c.rgb * light, vec3(c.a)), c.a);
}

vec4 transition (vec2 uv) {
  float w = ratio;
  float x = uv.x * w;
  // camera distance: the leaves always stay in front of it
  float eye = max(w, 1.0) * (0.5 + 0.2 / max(perspective, 0.01));
  // the leaves swing until their free edges have just left the frame
  float swing = progress * progress * (3.0 - 2.0 * progress);
  float a = min(atan(2.0 * eye / w) + 0.1, 0.5 * PI) * swing;
  float dolly = mix(easeInOut(progress), progress, 0.3);
  // the free edge of the left leaf, front and back of its thickness, as (x, z)
  float hw = 0.5 * w;
  vec2 front = hw * vec2(cos(a), -sin(a));
  float thick = 0.02 * w * (1.0 - smoothstep(0.8, 1.0, swing));
  float edgeL = project(front, w, eye);
  float backL = project(front + thick * vec2(sin(a), cos(a)), w, eye);
  float close = 1.0 - swing;
  vec4 back = room(uv, x, backL, w - backL, close, dolly);
  // the leaf on this side of the frame (each one stays in its own half)
  bool left = x < hw;
  float lx = left ? x : w - x;
  vec2 hit = leafHit(lx, w, eye, a);
  float s = clamp(hit.y, 0.0, hw);
  // the ray meets the leaf nearer to the eye, where it looks bigger
  float v = 0.5 + (uv.y - 0.5) * hit.x;
  vec4 leaf = getFromColor(clamp(vec2(left ? s / w : 1.0 - s / w, v), 0.0, 1.0));
  // turned away from the light, and darker toward the free edge as the opening deepens
  leaf.rgb *= 1.0 - 0.5 * (1.0 - cos(a)) - 0.25 * sin(a) * (s / hw);
  // the edge of the leaf catches the light coming from the room
  vec4 side = getFromColor(clamp(vec2(left ? 0.499 : 0.501, v), 0.0, 1.0));
  side.rgb = min(side.rgb * 1.5, vec3(side.a));
  // sharp at both ends, so that nothing of the doors is left at the start and the end
  float aa = 0.003 * min(1.0, 20.0 * min(a, close)) + 1e-6;
  vec4 c = mix(back, side, smoothstep(-aa, aa, backL - lx));
  return mix(c, leaf, smoothstep(-aa, aa, edgeL - lx));
}
`,author:"gre",license:"MIT",description:"The outgoing image opens like double doors swinging toward the viewer, as the incoming one comes forward from the dark room behind, with a floor reflection",tags:["doors","3d","reflection"],params:{reflection:{type:"float",default:.4,min:0,max:1,description:"Strength of the floor reflection under the incoming image"},perspective:{type:"float",default:.4,min:0,max:1,description:"Amount of perspective on the swinging doors"},depth:{type:"float",default:3,min:1,max:10,description:"How far back the incoming image starts (1: no distance)"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 8 Nov 2026 10:38:44 +0100"},{name:"Drape",paramsTypes:{folds:"float",depth:"float",sway:"float",shadow:"float"},defaultParams:{folds:6,depth:.7,sway:.4,shadow:.5},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image hangs like a sheet of fabric that is let go at the top: it collapses into soft, uneven folds that hide one another as the cloth bunches up and slides down out of the frame, revealing the incoming image behind it
// Tags: fabric, fold, vertical, 3d, shadow

// @range(1, 16, 1) Number of folds across the cloth (fewer in a portrait image)
uniform float folds; // = 6.0
// @range(0, 1) Depth of the folds and of their shading
uniform float depth; // = 0.7
// @range(0, 1) How much the cloth sways sideways as it falls
uniform float sway; // = 0.4
// @range(0, 1) Strength of the soft shadow cast by the cloth on the incoming image
uniform float shadow; // = 0.5

const float PI = 3.141592653589793;
const int STEPS = 24;
const float DEPTH = 0.8; // height of the deepest folds, times the fold width

// folds a coordinate back into 0..1, mirroring the image at its edges
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// integer-free hash of an integer cell, smoothed into a 1D value noise in 0..1
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float noise1(float x) {
  float i = floor(x);
  float f = x - i;
  return mix(hash11(i), hash11(i + 1.0), f * f * (3.0 - 2.0 * f));
}

// height of the top edge above x, sagging in the middle (m: see cloth)
float topEdge(float x, vec4 m) {
  float c = 2.0 * x - 1.0;
  return m.y - 0.08 * m.x * (1.0 - c * c);
}

// how far the sides are pulled in at the height sy, more so at the bunched top
float sidePull(float sy, float gT) {
  return 0.035 * gT * (0.3 + 0.7 * clamp(sy, 0.0, 1.0));
}

// height of the cloth at the point (x, y) of the screen plane, toward the viewer,
// or -1 where there is no cloth. Also gives the cloth's own coordinates and fold phase.
// m: how far the folds have formed (0 at rest), height of the top edge, height of the hem, sideways swing
vec4 cloth(vec2 p, vec4 m, float foldN) {
  float gT = m.x;
  float botY = m.z;
  float x = p.x - m.w;
  float top = topEdge(x, m);
  float sy = (p.y - botY) / max(top - botY, 1e-4); // 0 at the hem, 1 at the top edge
  float pull = sidePull(sy, gT);
  float xc = (x - pull) / (1.0 - 2.0 * pull);
  // uneven folds: their width, depth and course along the cloth all wander
  float wander = (noise1(0.5 * foldN * xc + 2.5 * sy + 5.3) - 0.5) * 2.4 * (1.0 - sy);
  float ph = 2.0 * PI * (foldN * xc + 0.6 * noise1(0.7 * foldN * xc + 1.7)) + wander;
  float d = 0.15 + 0.85 * noise1(1.1 * foldN * xc + 1.4 * sy + 7.0);
  // deepest near the bunched top, relaxing toward the hem
  float amp = DEPTH * depth * gT * (0.3 + 0.7 * sy * sqrt(max(sy, 0.0))) / max(foldN, 2.0);
  // the free sides of the cloth hang flat
  float w = 0.6 / foldN;
  amp *= smoothstep(0.0, w, xc) * smoothstep(0.0, w, 1.0 - xc);
  float prof = 0.5 - 0.5 * cos(ph); // 1 on a ridge, 0 in a valley
  // small sagging creases where the fabric piles up under the top edge
  float dt = (1.0 - sy) * (top - botY);
  float crease = exp(-30.0 * dt) * (0.5 + 0.5 * sin(80.0 * dt + 0.7 * ph));
  bool on = sy >= 0.0 && sy <= 1.0 && xc >= 0.0 && xc <= 1.0;
  return on ? vec4(amp * (d * prof + 0.15 * crease), xc, sy, ph) : vec4(-1.0);
}

vec4 transition (vec2 uv) {
  float t = progress;
  // the top edge falls first and the hem follows later: the cloth collapses as it slides down
  float topY = 1.0 - 1.06 * t * (0.35 + 0.65 * t);
  float botY = -0.75 * t * t * t;
  // the folds form as soon as the top is let go
  float f = 1.0 - (1.0 - t) * (1.0 - t) * (1.0 - t);
  float foldN = max(1.0, floor(folds * min(ratio, 1.0) + 0.5));
  float shiftX = sway * 0.035 * sin(2.0 * PI * t) * f;
  // the cloth is seen a little from the left and from above: ridges hide the valleys behind them
  vec2 view = vec2(0.75 + 0.5 * sway * sin(PI * t) * f, -0.35);
  float zMax = 1.15 * DEPTH * depth * f / max(foldN, 2.0); // a single fold is no deeper than two
  vec4 m = vec4(f, topY, botY, shiftX);
  // march from the front toward the screen plane, the first point inside the cloth is visible
  float zA = zMax; // last step in front of the cloth
  float zB = 0.0; // first step inside it
  bool found = false;
  float dA = 0.0;
  float dB = 0.0;
  bool onA = false; // whether the last step in front was over the cloth (else the ray came in through its edge)
  for (int i = 0; i < STEPS; i++) {
    if (!found) {
      float z = max(zMax * (1.0 - float(i) / float(STEPS - 1)), 0.0);
      vec4 s = cloth(uv - view * z, m, foldN);
      float dz = s.x - z;
      if (s.x >= 0.0 && dz >= 0.0) {
        found = true;
        zB = z;
        dB = dz;
      } else {
        zA = z;
        dA = dz;
        onA = s.x >= 0.0;
      }
    }
  }
  float zHit = zB;
  if (found && zA > zB) {
    if (onA) {
      // crossed the surface: refine between the last two steps
      zHit = mix(zA, zB, dA / (dA - dB));
    } else {
      // came in through the top edge: find where the ray first meets the cloth,
      // on its surface or through the edge (then it sees the inside of the fold)
      float za = zA;
      for (int j = 0; j < 5; j++) {
        float zm = 0.5 * (za + zHit);
        if (cloth(uv - view * zm, m, foldN).x >= zm) zHit = zm;
        else za = zm;
      }
    }
  }
  vec2 hp = uv - view * zHit;
  vec4 hit = found ? cloth(hp, m, foldN) : vec4(-1.0);
  if (found && hit.x < 0.0) {
    zHit = zB;
    hp = uv - view * zB;
    hit = cloth(hp, m, foldN);
  }
  vec4 col = vec4(0.0);
  float cover = 0.0;
  if (hit.x >= 0.0) {
    float xc = hit.y;
    float sy = hit.z;
    float ph = hit.w;
    // the fabric is gathered: more of it goes into the slopes of the folds
    float slope = PI * zMax * foldN;
    // (capped so that the texture never runs backwards where the folds bunch up)
    float mu = min(0.25 * slope * slope / (1.0 + 0.25 * slope * slope), 0.5);
    float u = xc - mu * sin(2.0 * ph) / (4.0 * PI * foldN);
    // and pushed together under the top edge
    float h = max(topY - botY, 1e-4);
    float comp = max(1.0 - h, 0.0);
    float v = sy * (1.0 - comp) + comp * sy * sy * sy;
    vec4 tex = getFromColor(mirror(vec2(u, v)));
    float span = topEdge(hp.x - shiftX, m) - botY; // local height of the cloth
    // surface normal from the height of the cloth around the visible point
    float e = 0.002;
    float hx = cloth(hp + vec2(e, 0.0), m, foldN).x;
    float hy = cloth(hp + vec2(0.0, e), m, foldN).x;
    float hx0 = hx >= 0.0 ? hx : hit.x;
    float hy0 = hy >= 0.0 ? hy : hit.x;
    vec3 nrm = normalize(vec3(-(hx0 - hit.x) / e, -(hy0 - hit.x) / e, 1.0));
    vec3 light = normalize(vec3(-0.45, 0.35, 1.0));
    float diffuse = mix(1.0, max(dot(nrm, light), 0.0) / light.z, min(1.0, 3.0 * f));
    // soft ambient occlusion in the valleys, deeper where the folds are deep
    float valley = 1.0 - (0.5 - 0.5 * cos(ph));
    float ao = 1.0 - 0.6 * depth * f * valley * valley * (0.35 + 0.65 * sy);
    // the rolled top edge gets less light
    float rim = exp(-(1.0 - sy) * span * 70.0) * 0.35 * f;
    // below the surface, the ray sees the shaded inside of a fold through the top edge
    float under = max(hit.x - zHit, 0.0);
    float back = min(1.0, under / max(0.1 * zMax, 1e-6));
    tex.rgb *= diffuse * ao * (1.0 - rim) * (1.0 - 0.6 * back);
    col = tex;
    // anti-aliased outline, sharp at rest so the first frame is exact
    float aa = 0.003 * f;
    float inside = min((1.0 - sy) * span - view.y * under, min(xc, 1.0 - xc));
    cover = aa > 0.0 ? clamp(inside / aa, 0.0, 1.0) : 1.0;
    if (cover >= 1.0) return col;
  }
  // soft shadow of the cloth, held a little away from the incoming image, gone once it has left
  vec4 to = getToColor(uv);
  float x = uv.x - shiftX;
  float pull = sidePull((uv.y - botY) / max(topEdge(x, m) - botY, 1e-4), f);
  float outside = max(uv.y - topEdge(x, m), max(-x, x - 1.0) - pull);
  float sh = shadow * exp(-max(outside, 0.0) * 16.0) * f * clamp(8.0 * (1.0 - t), 0.0, 1.0);
  return mix(vec4(to.rgb * (1.0 - 0.8 * sh), to.a), col, cover);
}
`,author:"gre",license:"MIT",description:"The outgoing image hangs like a sheet of fabric that is let go at the top: it collapses into soft, uneven folds that hide one another as the cloth bunches up and slides down out of the frame, revealing the incoming image behind it",tags:["fabric","fold","vertical","3d","shadow"],params:{folds:{type:"float",default:6,min:1,max:16,step:1,description:"Number of folds across the cloth (fewer in a portrait image)"},depth:{type:"float",default:.7,min:0,max:1,description:"Depth of the folds and of their shading"},sway:{type:"float",default:.4,min:0,max:1,description:"How much the cloth sways sideways as it falls"},shadow:{type:"float",default:.5,min:0,max:1,description:"Strength of the soft shadow cast by the cloth on the incoming image"}},textures:[],createdAt:"Sat, 7 Nov 2026 13:50:00 +0100",updatedAt:"Sat, 7 Nov 2026 18:52:38 +0100"},{name:"Dreamy",paramsTypes:{},defaultParams:{},glsl:`// Author: mikolalysenko
// License: MIT
// Description: A crossfade with a gentle wavy distortion
// Tags: wave, blend

vec2 offset(float progress, float x, float theta) {
  float phase = progress*progress + progress + theta;
  float shifty = 0.03*progress*cos(10.0*(progress+x));
  return vec2(0, shifty);
}
vec4 transition(vec2 p) {
  return mix(getFromColor(p + offset(progress, p.x, 0.0)), getToColor(p + offset(1.0-progress, p.x, 3.14)), progress);
}
`,author:"mikolalysenko",license:"MIT",description:"A crossfade with a gentle wavy distortion",tags:["wave","blend"],params:{},textures:[],createdAt:"Mon, 12 Jun 2017 12:27:38 +0800",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"DreamyZoom",paramsTypes:{rotation:"float",scale:"float"},defaultParams:{rotation:6,scale:1.2},glsl:`// Author: Zeh Fernando
// License: MIT
// Description: Zooms and rotates into a bright flash, then out to the incoming image
// Tags: zoom, rotate, flash

// Definitions --------
#define DEG2RAD 0.03926990816987241548078304229099 // 1/180*PI


// Transition parameters --------

// In degrees
uniform float rotation; // = 6

// Multiplier
uniform float scale; // = 1.2


// The code proper --------

vec4 transition(vec2 uv) {
  // Massage parameters
  float phase = progress < 0.5 ? progress * 2.0 : (progress - 0.5) * 2.0;
  float angleOffset = progress < 0.5 ? mix(0.0, rotation * DEG2RAD, phase) : mix(-rotation * DEG2RAD, 0.0, phase);
  float newScale = progress < 0.5 ? mix(1.0, scale, phase) : mix(scale, 1.0, phase);
  
  vec2 center = vec2(0, 0);

  // Calculate the source point
  vec2 assumedCenter = vec2(0.5, 0.5);
  vec2 p = (uv.xy - vec2(0.5, 0.5)) / newScale * vec2(ratio, 1.0);

  // This can probably be optimized (with distance())
  float angle = atan(p.y, p.x) + angleOffset;
  float dist = distance(center, p);
  p.x = cos(angle) * dist / ratio + 0.5;
  p.y = sin(angle) * dist + 0.5;
  vec4 c = progress < 0.5 ? getFromColor(p) : getToColor(p);

  // Finally, apply the color
  // The flash lights up the image, not the transparent areas around it.
  return vec4(c.rgb + (progress < 0.5 ? mix(0.0, 1.0, phase) : mix(1.0, 0.0, phase)), c.a);
}
`,author:"Zeh Fernando",license:"MIT",description:"Zooms and rotates into a bright flash, then out to the incoming image",tags:["zoom","rotate","flash"],params:{rotation:{type:"float",default:6},scale:{type:"float",default:1.2}},textures:[],createdAt:"Tue, 30 May 2017 10:44:06 -0700",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"DuotoneFade",paramsTypes:{shadowInk:"vec4",highlightInk:"vec4",contrast:"float",grain:"float"},defaultParams:{shadowInk:[.11,.09,.46,1],highlightInk:[1,.45,.62,1],contrast:.6,grain:.4},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image is printed in two inks, shadows first, as a bold high-contrast duotone; the incoming image is printed over it in the same two inks, its dark tones landing before its highlights, then its own colors come back, highlights first
// Tags: color, duotone, print, poster, gradient-map, luminance

// @color Ink printed in the shadows (its alpha is its strength)
uniform vec4 shadowInk; // = vec4(0.11, 0.09, 0.46, 1.0)
// @color Ink printed in the highlights (its alpha is its strength)
uniform vec4 highlightInk; // = vec4(1.0, 0.45, 0.62, 1.0)
// @range(0, 1) How hard the tones are pushed apart toward the two inks
uniform float contrast; // = 0.6
// @range(0, 1) Amount of print grain in the inks and along the handoff
uniform float grain; // = 0.4

float dfHash(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

float dfLuma(vec4 c) {
  return clamp(dot(c.rgb, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
}

vec4 transition(vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  float la = dfLuma(a);
  float lb = dfLuma(b);
  // fixed print grain, in cells of about 1/360 of the shorter side
  vec2 q = uv * 360.0 * vec2(max(ratio, 1.0), max(1.0 / ratio, 1.0));
  float g = dfHash(floor(q)) - 0.5;

  // the inks land on the outgoing image (shadows first), then lift off the incoming one (highlights first)
  float inks = smoothstep(0.0, 0.35, progress);
  float lift = smoothstep(0.65, 1.0, progress);
  float amount = min(
    clamp(inks * 1.35 - 0.35 * la, 0.0, 1.0),
    clamp((1.0 - lift) * 1.35 - 0.35 * lb, 0.0, 1.0)
  );
  amount = amount * amount * (3.0 - 2.0 * amount);

  // the incoming image is printed over the outgoing one, darkest tones first, along a grainy edge
  float x = smoothstep(0.25, 0.75, progress) * 1.6 - 0.3;
  float t = lb + 0.2 * grain * g;
  float s = smoothstep(t - 0.15, t + 0.15, x);

  // gradient map on luminance, with the tones pushed toward the two inks
  float c = 0.4 * contrast;
  float tone = smoothstep(c + 0.03, 1.03 - c, mix(la, lb, s) + 0.08 * grain * g);
  vec4 ink = mix(shadowInk, highlightInk, tone);

  // the images are blended with premultiplied alpha, and where neither is drawn nothing is printed
  vec4 base = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), s);
  if (base.a <= 0.0) return vec4(0.0);
  return vec4(mix(base.rgb / base.a, ink.rgb, amount * ink.a), base.a);
}
`,author:"gre",license:"MIT",description:"The outgoing image is printed in two inks, shadows first, as a bold high-contrast duotone; the incoming image is printed over it in the same two inks, its dark tones landing before its highlights, then its own colors come back, highlights first",tags:["color","duotone","print","poster","gradient-map","luminance"],params:{shadowInk:{type:"vec4",default:[.11,.09,.46,1],color:!0,description:"Ink printed in the shadows (its alpha is its strength)"},highlightInk:{type:"vec4",default:[1,.45,.62,1],color:!0,description:"Ink printed in the highlights (its alpha is its strength)"},contrast:{type:"float",default:.6,min:0,max:1,description:"How hard the tones are pushed apart toward the two inks"},grain:{type:"float",default:.4,min:0,max:1,description:"Amount of print grain in the inks and along the handoff"}},textures:[],createdAt:"Sun, 8 Nov 2026 12:37:11 +0100",updatedAt:"Sun, 8 Nov 2026 12:37:11 +0100"},{name:"EchoSlide",paramsTypes:{direction:"vec2",echoes:"int",trail:"float",decay:"float"},defaultParams:{direction:[1,0],echoes:4,trail:.25,decay:.5},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image slides away leaving a trail of discrete fading copies of itself, a stroboscopic echo, and the incoming image's echoes converge into place
// Tags: slide, echo, strobe, directional

// @param Direction in which the images slide
uniform vec2 direction; // = vec2(1.0, 0.0)
// @range(1, 7, 1) Number of echoes between the two images
uniform int echoes; // = 4
// @range(0.05, 0.6) How long the echoes trail behind each image, as a part of the transition
uniform float trail; // = 0.25
// @range(0, 1) How fast the echoes of the outgoing image fade out into those of the incoming one
uniform float decay; // = 0.5

// width of the anti-aliased edges, along the slide
const float EDGE = 0.002;
// the most echoes, the bound of the loop
const int MAX_ECHOES = 7;

float easeInOut(float t) {
  return t * t * (3.0 - 2.0 * t);
}

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// coverage of the part of the frame past an edge at x, anti-aliased only inside the frame
float past(float s, float x) {
  return x <= 0.0 ? 1.0 : x >= 1.0 ? 0.0 : clamp((s - x) / EDGE + 0.5, 0.0, 1.0);
}

// the edge between the copies at the time t of the slide
float edgeAt(float t) {
  return easeInOut(clamp(t, 0.0, 1.0));
}

// step j between the two images, from the edge e0 to the edge e1: the echo of the outgoing image
// whose trailing edge is e0, fading out toward the incoming image, over the echo of the incoming
// image whose leading edge is e1
vec4 echoStep(vec2 uv, float s, vec2 shift, float j, float t0, float lag, float n) {
  float e0 = edgeAt(t0 + j * lag);
  float e1 = edgeAt(t0 + (j + 1.0) * lag);
  vec4 a = getFromColor(mirror(uv - shift * e0));
  vec4 b = getToColor(mirror(uv - shift * (e1 - 1.0)));
  vec4 c = mix(b, a, pow((j + 0.5) / n, 0.5 + 2.0 * clamp(decay, 0.0, 1.0)));
  // each copy casts a soft shadow behind it onto the older ones
  c.rgb *= 1.0 - 0.25 * exp(-max(e1 - s, 0.0) / 0.02) * min((e1 - e0) / 0.02, 1.0);
  return c;
}

vec4 transition(vec2 uv) {
  float dl = length(direction);
  vec2 d = dl > 1e-6 ? direction / dl : vec2(1.0, 0.0);
  // s: position along the slide, from 0 (trailing side) to 1 (leading side)
  float ext = abs(d.x) + abs(d.y);
  vec2 shift = d * ext;
  float s = 0.5 + dot(uv - 0.5, d) / ext;

  float n = clamp(float(echoes), 1.0, float(MAX_ECHOES));
  float tr = clamp(trail, 0.05, 0.6);
  float lag = tr / n;
  // the incoming image follows the outgoing one tr behind; the copies of both images sit at
  // the times between them, the stroboscopic echoes of the outgoing image trailing behind it
  // and those of the incoming image ahead of it
  float t0 = progress >= 1.0 ? 1.0 : progress * (1.0 + tr) - tr;
  float eIn = edgeAt(t0);
  float eOut = edgeAt(t0 + tr);

  float wIn = 1.0 - past(s, eIn);
  float wOut = past(s, eOut);
  float wGap = max(1.0 - wIn - wOut, 0.0);
  vec4 c = vec4(0.0);
  if (wGap > 0.0) {
    // the step of this point, and how far it is past the next edge, to anti-alias it
    float jf = 0.0;
    for (int k = 1; k < MAX_ECHOES; k++) {
      float m = float(k);
      if (m >= n) break;
      jf += past(s, edgeAt(t0 + m * lag));
    }
    float j = floor(jf);
    c = echoStep(uv, s, shift, j, t0, lag, n);
    if (jf > j) c = mix(c, echoStep(uv, s, shift, j + 1.0, t0, lag, n), jf - j);
    c *= wGap;
  }
  // the two images on both sides of their echoes
  if (wIn > 0.0) c += wIn * getToColor(mirror(uv - shift * (eIn - 1.0)));
  if (wOut > 0.0) c += wOut * getFromColor(mirror(uv - shift * eOut));
  return c;
}
`,author:"gre",license:"MIT",description:"The outgoing image slides away leaving a trail of discrete fading copies of itself, a stroboscopic echo, and the incoming image's echoes converge into place",tags:["slide","echo","strobe","directional"],params:{direction:{type:"vec2",default:[1,0],description:"Direction in which the images slide"},echoes:{type:"int",default:4,min:1,max:7,step:1,description:"Number of echoes between the two images"},trail:{type:"float",default:.25,min:.05,max:.6,description:"How long the echoes trail behind each image, as a part of the transition"},decay:{type:"float",default:.5,min:0,max:1,description:"How fast the echoes of the outgoing image fade out into those of the incoming one"}},textures:[],createdAt:"Fri, 13 Nov 2026 20:04:15 +0100",updatedAt:"Fri, 13 Nov 2026 20:04:15 +0100"},{name:"EdgeGlow",paramsTypes:{edge_thickness:"float",edge_brightness:"float"},defaultParams:{edge_thickness:.001,edge_brightness:8},glsl:`// Author: Woohyun Kim
// License: MIT
// Description: Both images fade through black with their edges glowing
// Tags: edges, fade

uniform float edge_thickness; // = 0.001
uniform float edge_brightness; // = 8.0

vec3 detectEdgeColor(vec3[9] c) {
  /* adjacent texel array for texel c[4]
    036
    147
    258
  */
  vec3 dx = 2.0 * abs(c[7]-c[1]) + abs(c[2] - c[6]) + abs(c[8] - c[0]);
	vec3 dy = 2.0 * abs(c[3]-c[5]) + abs(c[6] - c[8]) + abs(c[0] - c[2]);
  float delta = length(0.25 * (dx + dy) * 0.5);
	return clamp(edge_brightness * delta, 0.0, 1.0) * c[4];
}

vec4 getFromEdgeColor(vec2 uv) {
	vec3 c[9];
	float alpha = 0.0;
	for (int i=0; i < 3; ++i) for (int j=0; j < 3; ++j)
	{
	  vec4 color = getFromColor(uv + edge_thickness * vec2(i-1,j-1));
    c[3*i + j] = color.rgb;
    if (i == 1 && j == 1) alpha = color.a;
	}
	return vec4(detectEdgeColor(c), alpha);
}

vec4 getToEdgeColor(vec2 uv) {
	vec3 c[9];
	float alpha = 0.0;
	for (int i=0; i < 3; ++i) for (int j=0; j < 3; ++j)
	{
	  vec4 color = getToColor(uv + edge_thickness * vec2(i-1,j-1));
    c[3*i + j] = color.rgb;
    if (i == 1 && j == 1) alpha = color.a;
	}
	return vec4(detectEdgeColor(c), alpha);
}

vec4 transition (vec2 uv) {
  vec4 start = mix(getFromColor(uv), getFromEdgeColor(uv), clamp(2.0 * progress, 0.0, 1.0));
  vec4 end = mix(getToEdgeColor(uv), getToColor(uv), clamp(2.0 * (progress - 0.5), 0.0, 1.0));
  return mix(
    start,
    end,
    progress
  );
}
`,author:"Woohyun Kim",license:"MIT",description:"Both images fade through black with their edges glowing",tags:["edges","fade"],params:{edge_thickness:{type:"float",default:.001},edge_brightness:{type:"float",default:8}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"EyeBlink",paramsTypes:{blur:"float",softness:"float",blinks:"int",color:"vec4"},defaultParams:{blur:.5,softness:.12,blinks:1,color:[.03,.02,.02,1]},glsl:`// Author: gre
// License: MIT
// Description: Curved eyelids close from the top and bottom over the outgoing image, which blurs and dims, then open on the incoming image as it comes back into focus, as if the viewer blinked
// Tags: blink, eye, blur, shape

// @range(0, 1) How much the image blurs and dims while the eyes are closed
uniform float blur; // = 0.5
// @range(0.01, 0.3) Width of the soft shadow along the rim of the eyelids
uniform float softness; // = 0.12
// @range(1, 2, 1) Number of blinks: 1, or 2 for a quick double blink (the cut happens on the first one)
uniform int blinks; // = 1
// @color Color of the eyelids
uniform vec4 color; // = vec4(0.03, 0.02, 0.02, 1.0)

const int TAPS = 16;
// how much the eyelids curve: the opening is widest at the center and the corners close first
const float CURVE = 0.25;
// where the eyelids meet, below the middle: the upper lid travels further than the lower one
const float MEET = 0.44;

vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// a blink fully closed at c (held for 2 * hold): the lids close over wc before it
// and open over wo after it, slower, like a real blink
float lidBlink(float t, float c, float wc, float wo, float hold) {
  return 1.0 - smoothstep(hold, t < c ? wc : wo, abs(t - c));
}

vec4 image(vec2 uv, bool incoming) {
  vec4 c = incoming ? getToColor(uv) : getFromColor(uv);
  return vec4(c.rgb * c.a, c.a);
}

vec4 transition(vec2 uv) {
  bool two = blinks > 1;
  // the moment the eyes are fully closed, when the images are swapped
  float cut = two ? 0.3 : 0.42;
  // how closed the eyes are: 0 open, 1 closed
  float closed = two
    ? max(lidBlink(progress, cut, 0.26, 0.26, 0.015), lidBlink(progress, 0.7, 0.14, 0.24, 0.01))
    : lidBlink(progress, cut, 0.36, 0.5, 0.02);
  bool incoming = progress >= cut;

  // the rim of each eyelid is an arc; fully open, even its corners clear the frame by the widest shadow
  float soft = clamp(softness, 0.001, 0.3);
  float x = 2.0 * uv.x - 1.0;
  float rim = (1.0 - closed) * (1.31 + CURVE) - CURVE * x * x;
  // distance inside the opening from the nearest lid, as a share of that lid's travel
  float y = uv.y - MEET;
  float d = rim - max(y / (1.0 - MEET), -y / MEET);
  // the lid fills beyond its rim, with a soft shadow falling inside the opening
  float s = 1.0 - smoothstep(0.0, soft, d);
  float lid = s * s;
  if (lid >= 1.0) return color;

  // how out of focus and dim the view is: it peaks at the cut, follows the lids, and clears at both ends
  float f = progress < cut ? progress / cut : (1.0 - progress) / (1.0 - cut);
  f = clamp(f, 0.0, 1.0);
  f = max(f * (2.0 - f), closed) * blur;

  vec4 c;
  if (f <= 0.0) {
    c = incoming ? getToColor(uv) : getFromColor(uv);
  } else {
    // a disc of taps along a golden-angle spiral, premultiplied
    float r = 0.025 * f;
    c = vec4(0.0);
    for (int i = 0; i < TAPS; i++) {
      float k = float(i) + 0.5;
      float a = 2.39996 * k;
      vec2 o = sqrt(k / float(TAPS)) * vec2(cos(a), sin(a)) * r;
      c += image(mirror(uv + o * vec2(1.0 / ratio, 1.0)), incoming);
    }
    c /= float(TAPS);
    c = c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
    // less light reaches the eye as it closes
    c.rgb *= 1.0 - 0.35 * f;
  }
  return mix(c, color, lid);
}
`,author:"gre",license:"MIT",description:"Curved eyelids close from the top and bottom over the outgoing image, which blurs and dims, then open on the incoming image as it comes back into focus, as if the viewer blinked",tags:["blink","eye","blur","shape"],params:{blur:{type:"float",default:.5,min:0,max:1,description:"How much the image blurs and dims while the eyes are closed"},softness:{type:"float",default:.12,min:.01,max:.3,description:"Width of the soft shadow along the rim of the eyelids"},blinks:{type:"int",default:1,min:1,max:2,step:1,description:"Number of blinks: 1, or 2 for a quick double blink (the cut happens on the first one)"},color:{type:"vec4",default:[.03,.02,.02,1],color:!0,description:"Color of the eyelids"}},textures:[],createdAt:"Wed, 4 Nov 2026 08:57:38 +0100",updatedAt:"Wed, 4 Nov 2026 08:57:38 +0100"},{name:"FacetedGlass",paramsTypes:{facets:"float",refraction:"float",bevel:"float",highlight:"vec4",seed:"float"},defaultParams:{facets:5,refraction:.1,bevel:.6,highlight:[1,.98,.92,1],seed:0},glsl:`// Author: gre
// License: MIT
// Description: The frame is seen through a pane of irregular cut-glass facets, each one showing its own shifted, zoomed and tilted view of the image, with bright beveled edges and thin dark seams; the facets turn to the incoming image one by one, then the glass flattens out and clears
// Tags: glass, refraction, facets, voronoi, distortion

// @range(2, 20) Number of facets across the height of the frame
uniform float facets; // = 5.0
// @range(0, 0.3) How far each facet shifts its view of the image at the peak
uniform float refraction; // = 0.1
// @range(0, 1) Strength of the highlights and shadows along the beveled edges, and of the glint as each facet turns
uniform float bevel; // = 0.6
// @color Color of the light caught by the bevels
uniform vec4 highlight; // = vec4(1.0, 0.98, 0.92, 1.0)
// @param Random seed: another value gives other facets, turning in another order
uniform float seed; // = 0.0

// half width of the antialiased seams, in frame heights
const float AA = 0.0015;

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  // 0 at both ends, 1 in the middle: the glass builds up, then flattens out
  float h = 1.0 - abs(2.0 * progress - 1.0);
  float amount = h * h * (3.0 - 2.0 * h);

  float n = max(facets, 1.0);
  vec2 aspect = vec2(ratio, 1.0);
  // measured in square pixels, so the facets are not stretched
  vec2 p = uv * aspect * n;
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 offset = vec2(17.31, 41.97) * seed;
  // width of the bevels, in facet sizes
  float bw = 0.18 * amount;

  // nearest facet center
  vec2 mg = vec2(0.0);
  vec2 mr = vec2(0.0);
  float md = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 r = g + 0.1 + 0.8 * hash22(i + g + offset) - f;
      float d = dot(r, r);
      if (d < md) {
        md = d;
        mr = r;
        mg = g;
      }
    }
  }

  // distance to the nearest facet edge, and the direction toward the edges, blended
  // between neighboring edges near the corners so the bevel lighting turns smoothly
  float edge = 8.0;
  vec2 normal = vec2(0.0);
  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 g = mg + vec2(float(x), float(y));
      vec2 r = g + 0.1 + 0.8 * hash22(i + g + offset) - f;
      vec2 dr = r - mr;
      if (dot(dr, dr) > 0.00001) {
        vec2 dn = normalize(dr);
        float e = dot(0.5 * (mr + r), dn);
        edge = min(edge, e);
        float w = max(1.0 - e / bw, 0.0);
        normal += dn * w * w;
      }
    }
  }
  float nl = length(normal);
  normal = nl > 0.0 ? normal / nl : vec2(0.0);

  // the facet's own random cut: a shift, a zoom and a tilt
  vec2 id = i + mg + offset;
  vec2 h1 = hash22(id + 31.7);
  vec2 h2 = hash22(id + 59.3);
  vec2 h3 = hash22(id + 97.1);
  float angle = 6.2831853 * h1.x;
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 shift = dir * (0.4 + 0.6 * h1.y) * refraction;
  float zoom = (h2.x - 0.5) * 6.0 * refraction;
  float tilt = (h2.y - 0.5) * 2.0 * refraction;

  // from the facet center to the pixel, in frame heights
  vec2 q = -mr / n;
  vec2 view = -q * zoom + vec2(-q.y, q.x) * sin(tilt) + q * (cos(tilt) - 1.0);

  // the bevel along the facet's edge: 1 on the edge, 0 inside
  float bv = 1.0 - smoothstep(0.0, bw, edge);
  bv *= bv;
  // the bevel bends the image outward, more strongly than the flat facet
  vec2 bend = normal * bv * 0.4 * refraction;

  // the facet turns to the incoming image at its own time, and its view turns over with it
  float start = 0.15 + 0.5 * h3.x;
  float m = smoothstep(start, start + 0.2, progress);
  vec2 d = amount * (view + bend);
  vec2 s = amount * shift;
  vec4 ca = getFromColor(mirror(uv + (s + d) / aspect));
  vec4 cb = getToColor(mirror(uv + (d - s) / aspect));
  // mixed premultiplied, so transparent images do not bleed their color
  vec4 c = mix(vec4(ca.rgb * ca.a, ca.a), vec4(cb.rgb * cb.a, cb.a), m);

  // light from the top left: each flat facet catches it a little differently
  vec2 light = normalize(vec2(-0.6, 0.8));
  vec2 slope = dir * (0.4 + 0.6 * h1.y);
  float facetLight = 0.12 * amount * dot(slope, light);
  // the bevels catch it strongly on one side and shade the other
  float lit = dot(normal, light);
  float k = clamp(bevel, 0.0, 1.0);
  float glow = k * bv * max(lit, 0.0) * 1.1 * amount;
  float shade = k * bv * max(-lit, 0.0) * 0.6 * amount;
  // a glint as the facet turns over
  float turn = sin(3.14159265 * m);
  glow += k * 0.15 * amount * turn * turn;
  // thin dark seams between the facets
  float seam = 0.6 * amount * (1.0 - smoothstep(0.0, 2.0 * AA, edge / n - 0.5 * AA));

  c.rgb *= (1.0 + facetLight) * (1.0 - shade) * (1.0 - seam);
  c.rgb += highlight.rgb * highlight.a * glow * c.a;
  return c.a > 0.0 ? vec4(clamp(c.rgb / c.a, 0.0, 1.0), c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The frame is seen through a pane of irregular cut-glass facets, each one showing its own shifted, zoomed and tilted view of the image, with bright beveled edges and thin dark seams; the facets turn to the incoming image one by one, then the glass flattens out and clears",tags:["glass","refraction","facets","voronoi","distortion"],params:{facets:{type:"float",default:5,min:2,max:20,description:"Number of facets across the height of the frame"},refraction:{type:"float",default:.1,min:0,max:.3,description:"How far each facet shifts its view of the image at the peak"},bevel:{type:"float",default:.6,min:0,max:1,description:"Strength of the highlights and shadows along the beveled edges, and of the glint as each facet turns"},highlight:{type:"vec4",default:[1,.98,.92,1],color:!0,description:"Color of the light caught by the bevels"},seed:{type:"float",default:0,description:"Random seed: another value gives other facets, turning in another order"}},textures:[],createdAt:"Fri, 6 Nov 2026 19:40:38 +0100",updatedAt:"Fri, 6 Nov 2026 19:40:38 +0100"},{name:"Fade",paramsTypes:{},defaultParams:{},glsl:`// Author: gre
// License: MIT
// Description: A linear crossfade between the two images
// Tags: fade, blend

vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv),
    getToColor(uv),
    progress
  );
}
`,author:"gre",license:"MIT",description:"A linear crossfade between the two images",tags:["fade","blend"],params:{},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"FadeColor",paramsTypes:{color:"vec4",colorPhase:"float"},defaultParams:{color:[0,0,0,1],colorPhase:.4},glsl:`// Author: gre
// License: MIT
// Description: A fade through a solid color, black by default
// Tags: fade, color
// @color Color to fade through
uniform vec4 color; // = vec4(0.0, 0.0, 0.0, 1.0)
// @range(0, 1) How long the color shows in the middle
uniform float colorPhase; // = 0.4 ; // if 0.0, there is no black phase, if 0.9, the black phase is very important
vec4 transition (vec2 uv) {
  return mix(
    mix(color, getFromColor(uv), smoothstep(1.0-colorPhase, 0.0, progress)),
    mix(color, getToColor(uv), smoothstep(    colorPhase, 1.0, progress)),
    progress);
}
`,author:"gre",license:"MIT",description:"A fade through a solid color, black by default",tags:["fade","color"],params:{color:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color to fade through"},colorPhase:{type:"float",default:.4,min:0,max:1,description:"How long the color shows in the middle"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"FadeGrayscale",paramsTypes:{intensity:"float"},defaultParams:{intensity:.3},glsl:`// Author: gre
// License: MIT
// Description: A crossfade through grayscale
// Tags: fade, grayscale, color

// @range(0, 1) How long the grayscale phase lasts
uniform float intensity; // = 0.3; // if 0.0, the image directly turn grayscale, if 0.9, the grayscale transition phase is very important
 
vec3 grayscale (vec3 color) {
  return vec3(0.2126*color.r + 0.7152*color.g + 0.0722*color.b);
}
 
vec4 transition (vec2 uv) {
  vec4 fc = getFromColor(uv);
  vec4 tc = getToColor(uv);
  return mix(
    mix(vec4(grayscale(fc.rgb), fc.a), fc, smoothstep(1.0-intensity, 0.0, progress)),
    mix(vec4(grayscale(tc.rgb), tc.a), tc, smoothstep(    intensity, 1.0, progress)),
    progress);
}
`,author:"gre",license:"MIT",description:"A crossfade through grayscale",tags:["fade","grayscale","color"],params:{intensity:{type:"float",default:.3,min:0,max:1,description:"How long the grayscale phase lasts"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"FallOver",paramsTypes:{perspective:"float",shading:"float"},defaultParams:{perspective:.8,shading:.7},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image falls over backward, hinged on its bottom edge, revealing the incoming one behind it
// Tags: rotate, vertical, 3d

// @range(0, 1) Strength of the perspective
uniform float perspective; // = 0.8
// @range(0, 1) How much the image darkens as it falls
uniform float shading; // = 0.7

const float PI = 3.141592653589793;

vec4 transition (vec2 uv) {
  // it starts slowly, then gravity takes over
  float fall = progress * (0.25 + 0.75 * progress);
  float angle = 0.5 * PI * fall;
  float c = cos(angle), s = sin(angle);
  // a camera in front of the middle of the image goes down to the level of the hinge,
  // so that the image ends edge-on
  float dist = 1.0 / max(perspective, 0.01);
  vec3 eye = vec3(0.5 * ratio, 0.5 * c, -dist);
  vec3 dir = vec3(uv.x * ratio, uv.y, 0.0) - eye;
  // cast a ray onto the plane of the image turned back by angle around its bottom edge
  float den = dir.z * c - dir.y * s;
  if (den > 0.0) {
    float t = (eye.y * s - eye.z * c) / den;
    vec3 hit = eye + t * dir;
    vec2 puv = vec2(hit.x / ratio, hit.y * c + hit.z * s);
    if (t > 0.0 && puv.y > 0.0 && puv.y <= 1.0 && puv.x >= 0.0 && puv.x <= 1.0) {
      vec4 col = getFromColor(puv);
      return vec4(col.rgb * (1.0 - shading * s), col.a);
    }
  }
  return getToColor(uv);
}
`,author:"gre",license:"MIT",description:"The outgoing image falls over backward, hinged on its bottom edge, revealing the incoming one behind it",tags:["rotate","vertical","3d"],params:{perspective:{type:"float",default:.8,min:0,max:1,description:"Strength of the perspective"},shading:{type:"float",default:.7,min:0,max:1,description:"How much the image darkens as it falls"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:18:48 +0100",updatedAt:"Sat, 31 Oct 2026 18:18:48 +0100"},{name:"FilmBurn",paramsTypes:{Seed:"float"},defaultParams:{Seed:2.31},glsl:`// Author: Anastasia Dunbar
// License: MIT
// Description: Glowing film-burn light leaks wash over the image and reveal the incoming one
// Tags: burn, film, light-leak
// @param Random seed
uniform float Seed; // = 2.31
float sigmoid(float x, float a) {
    float b = pow(x*2.,a)/2.;
    if (x > .5) {
        b = 1.-pow(2.-(x*2.),a)/2.;
    }
	return b;
}
float rand(float co){
    return fract(sin((co*24.9898)+Seed)*43758.5453);
}
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
float apow(float a,float b) { return pow(abs(a),b)*sign(b); }
vec3 pow3(vec3 a,vec3 b) { return vec3(apow(a.r,b.r),apow(a.g,b.g),apow(a.b,b.b)); }
float smooth_mix(float a,float b,float c) { return mix(a,b,sigmoid(c,2.)); }
float random(vec2 co, float shft){
    co += 10.;
    return smooth_mix(fract(sin(dot(co.xy ,vec2(12.9898+(floor(shft)*.5),78.233+Seed))) * 43758.5453),fract(sin(dot(co.xy ,vec2(12.9898+(floor(shft+1.)*.5),78.233+Seed))) * 43758.5453),fract(shft));
}
float smooth_random(vec2 co, float shft) {
	return smooth_mix(smooth_mix(random(floor(co),shft),random(floor(co+vec2(1.,0.)),shft),fract(co.x)),smooth_mix(random(floor(co+vec2(0.,1.)),shft),random(floor(co+vec2(1.,1.)),shft),fract(co.x)),fract(co.y));
}
vec4 blendedColor(vec2 p) {
    return mix(getFromColor(p), getToColor(p), sigmoid(progress,10.));
}
#define pi 3.14159265358979323
#define clamps(x) clamp(x,0.,1.)

vec4 transition(vec2 p) {
  vec3 f = vec3(0.);
  for (float i = 0.; i < 13.; i++) {
    f += sin(((p.x*rand(i)*6.)+(progress*8.))+rand(i+1.43))*sin(((p.y*rand(i+4.4)*6.)+(progress*6.))+rand(i+2.4));
    f += 1.-clamps(length(p-vec2(smooth_random(vec2(progress*1.3),i+1.),smooth_random(vec2(progress*.5),i+6.25)))*mix(20.,70.,rand(i)));
  }
  f += 4.;
  f /= 11.;
  f = pow3(f*vec3(1.,0.7,0.6),vec3(1.,2.-sin(progress*pi),1.3));
  f *= sin(progress*pi);
  
  p -= .5;
  p *= 1.+(smooth_random(vec2(progress*5.),6.3)*sin(progress*pi)*.05);
  p += .5;
  
  vec4 blurred_image = vec4(0.);
  float bluramount = sin(progress*pi)*.03;
  #define repeats  50.
  for (float i = 0.; i < repeats; i++) { 
      vec2 q = vec2(cos(degrees((i/repeats)*360.)),sin(degrees((i/repeats)*360.))) *  (rand(vec2(i,p.x+p.y))+bluramount); 
      vec2 uv2 = p+(q*bluramount);
      blurred_image += blendedColor(uv2);
  }
  blurred_image /= repeats;
  
  return blurred_image+vec4(f,0.);
}
`,author:"Anastasia Dunbar",license:"MIT",description:"Glowing film-burn light leaks wash over the image and reveal the incoming one",tags:["burn","film","light-leak"],params:{Seed:{type:"float",default:2.31,description:"Random seed"}},textures:[],createdAt:"Wed, 21 Feb 2018 20:52:13 +0100",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"FilmDissolve",paramsTypes:{overlap:"float",smoothness:"float"},defaultParams:{overlap:.25,smoothness:.5},glsl:`// Author: gre
// License: MIT
// Description: A cross-dissolve blended in linear light, as light adds up on film: the frame keeps its brightness all the way through and the highlights of each image shine through the other
// Tags: dissolve, fade, blend, light

// @range(0, 1) Extra light where the two images overlap at mid-dissolve, softly rolled off so it never clips
uniform float overlap; // = 0.25
// @range(0, 1) Easing of the dissolve: 0 is linear, 1 eases in and out
uniform float smoothness; // = 0.5

// sRGB to linear light (the exact piecewise curve)
vec3 toLinear(vec3 c) {
  vec3 lo = c / 12.92;
  vec3 hi = pow((c + 0.055) / 1.055, vec3(2.4));
  return mix(lo, hi, vec3(greaterThan(c, vec3(0.04045))));
}

// linear light back to sRGB
vec3 toSrgb(vec3 c) {
  vec3 lo = c * 12.92;
  vec3 hi = 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055;
  return mix(lo, hi, vec3(greaterThan(c, vec3(0.0031308))));
}

vec4 transition(vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  if (progress <= 0.0) return a;
  if (progress >= 1.0) return b;

  float t = mix(progress, smoothstep(0.0, 1.0, progress), smoothness);

  // premultiplied linear light
  vec3 la = toLinear(clamp(a.rgb, 0.0, 1.0)) * a.a;
  vec3 lb = toLinear(clamp(b.rgb, 0.0, 1.0)) * b.a;
  vec3 base = mix(la, lb, t);
  float alpha = mix(a.a, b.a, t);

  // the overlap: each image stays brighter for longer, as in an additive dissolve,
  // rolled off toward full exposure so that bright areas glow instead of clipping
  float extra = overlap * min(t, 1.0 - t);
  vec3 excess = extra * (la + lb);
  vec3 room = max(vec3(alpha) - base, vec3(1e-5));
  vec3 color = base + room * (1.0 - exp(-excess / room));

  if (alpha <= 0.0) return vec4(0.0);
  return vec4(toSrgb(clamp(color / alpha, 0.0, 1.0)), alpha);
}
`,author:"gre",license:"MIT",description:"A cross-dissolve blended in linear light, as light adds up on film: the frame keeps its brightness all the way through and the highlights of each image shine through the other",tags:["dissolve","fade","blend","light"],params:{overlap:{type:"float",default:.25,min:0,max:1,description:"Extra light where the two images overlap at mid-dissolve, softly rolled off so it never clips"},smoothness:{type:"float",default:.5,min:0,max:1,description:"Easing of the dissolve: 0 is linear, 1 eases in and out"}},textures:[],createdAt:"Sun, 1 Nov 2026 20:33:12 +0100",updatedAt:"Sun, 1 Nov 2026 20:33:12 +0100"},{name:"FilmStrip",paramsTypes:{frames:"int",shrink:"float",blur:"float",weave:"float",filmColor:"vec4",holeColor:"vec4"},defaultParams:{frames:2,shrink:.2,blur:.5,weave:.5,filmColor:[.06,.05,.05,1],holeColor:[.96,.93,.85,1]},glsl:`// Author: gre
// License: MIT
// Description: The picture slips like film in a projector gate: it shrinks to show the sprocket holes, the strip runs down with motion blur and a slight weave, then the incoming frame lands in place
// Tags: retro, vertical, motion-blur, film

// @range(1, 6, 1) Number of frames that slip by
uniform int frames; // = 2
// @range(0, 0.4) How much the picture shrinks during the slip, showing the film's edges
uniform float shrink; // = 0.2
// @range(0, 1) Length of the motion blur at full speed
uniform float blur; // = 0.5
// @range(0, 1) Amount of horizontal weave and vertical jitter
uniform float weave; // = 0.5
// @color Color of the film around the pictures and of the line between frames
uniform vec4 filmColor; // = vec4(0.06, 0.05, 0.05, 1.0)
// @color Color of the light through the sprocket holes
uniform vec4 holeColor; // = vec4(0.96, 0.93, 0.85, 1.0)

// height of the line between two frames, in frame heights
const float FRAME_LINE = 0.08;
// sprocket holes per frame
const float HOLES = 4.0;
const int SAMPLES = 16;

// a fine, evenly spread dither pattern over small cells of the frame
float dither(vec2 cell) {
  return fract(52.9829189 * fract(dot(cell, vec2(0.06711056, 0.00583715))));
}

// the film at (x, y): x across it (0 to 1 over the picture), y along it from the start of frame
// number base, in frame heights; holes fades the sprocket holes in
vec4 film(float x, float y, float base, float n, float aa, float holeX, vec2 holeSize, float holes) {
  float pitch = 1.0 + FRAME_LINE;
  float jy = floor(y / pitch);
  float j = base + jy;
  float fy = y - jy * pitch;
  vec4 c = filmColor;
  if (x >= 0.0 && x <= 1.0 && fy <= 1.0) {
    vec2 q = vec2(x, fy);
    c = j < n ? getFromColor(q) : getToColor(q);
  }
  // soft edges for the picture during the slip (none at rest, where it fills the frame)
  float inside = min(min(x, 1.0 - x) * ratio, min(fy, 1.0 - fy));
  c = mix(filmColor, c, clamp(inside / aa + 0.5, 0.0, 1.0));
  // the sprocket holes, in the margins on both sides, in frame heights
  float hy = mod(y, pitch / HOLES) - 0.5 * pitch / HOLES;
  float hx = (abs(x - 0.5) - holeX) * ratio;
  vec2 dd = abs(vec2(hx, hy)) - holeSize + 0.3 * holeSize.x;
  float sd = length(max(dd, 0.0)) + min(max(dd.x, dd.y), 0.0) - 0.3 * holeSize.x;
  return mix(c, holeColor, clamp(0.5 - sd / aa, 0.0, 1.0) * holes);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);
  float n = max(float(frames), 1.0);
  float pitch = 1.0 + FRAME_LINE;
  float p = progress;
  // the picture shrinks first, slips, then grows back
  float env = smoothstep(0.0, 0.3, p) * (1.0 - smoothstep(0.7, 1.0, p));
  float k = 1.0 - shrink * env;
  // the slip, in frames: smooth start and landing
  float x0 = clamp((p - 0.15) / 0.7, 0.0, 1.0);
  float slip = x0 * x0 * x0 * (x0 * (x0 * 6.0 - 15.0) + 10.0);
  float speed = 30.0 * x0 * x0 * (1.0 - x0) * (1.0 - x0) / 0.7; // d(slip)/d(progress), up to ~2.7
  // weave and jitter, only while the film moves
  float wob = weave * env;
  // (the weave stays within the film's margin)
  float dx = wob * smoothstep(0.0, 0.1, shrink) * (0.006 * sin(p * 47.0) + 0.004 * sin(p * 113.0 + 1.3));
  float dy = wob * 0.012 * sin(p * 71.0 + 0.4) * (1.0 - speed / 2.7);

  // the frames slipped by so far: whole frames, and the position within the current one
  float frameSlip = slip * n;
  float base = floor(frameSlip);
  float x = (uv.x - 0.5) / k + 0.5 + dx;
  float y = (uv.y - 0.5) / k + 0.5 + dy + (frameSlip - base) * pitch;
  // anti-aliasing width, in frame heights: none at rest or without margin
  float aa = 0.002 * min(1.0, 10.0 * env) * min(1.0, 20.0 * shrink) + 1e-4;
  // the holes sit in the middle of the margin the shrinking picture shows
  float margin = 0.5 * shrink / max(1.0 - shrink, 0.01);
  float holeX = 0.5 + 0.5 * margin;
  vec2 holeSize = vec2(0.28 * margin * ratio, 0.11 * pitch / HOLES);
  float holes = smoothstep(0.0, 0.02, margin);

  // motion blur along the strip, dithered to hide the steps
  float len = blur * 0.06 * speed * n;
  vec4 color = vec4(0.0);
  if (len < 1e-5) {
    color = film(x, y, base, n, aa, holeX, holeSize, holes);
  } else {
    // averaged with premultiplied colors, so transparent parts don't darken the others
    float jitter = dither(floor(uv * vec2(ratio, 1.0) * 540.0));
    for (int i = 0; i < SAMPLES; i++) {
      float t = (float(i) + jitter) / float(SAMPLES) - 0.5;
      vec4 c = film(x, y + t * len, base, n, aa, holeX, holeSize, holes);
      color += vec4(c.rgb * c.a, c.a);
    }
    color /= float(SAMPLES);
    color.rgb = color.a > 0.0 ? color.rgb / color.a : vec3(0.0);
  }
  // the projector's light flickers a little while the film runs
  color.rgb *= 1.0 - 0.08 * wob * (0.5 + 0.5 * sin(p * 157.0));
  return color;
}
`,author:"gre",license:"MIT",description:"The picture slips like film in a projector gate: it shrinks to show the sprocket holes, the strip runs down with motion blur and a slight weave, then the incoming frame lands in place",tags:["retro","vertical","motion-blur","film"],params:{frames:{type:"int",default:2,min:1,max:6,step:1,description:"Number of frames that slip by"},shrink:{type:"float",default:.2,min:0,max:.4,description:"How much the picture shrinks during the slip, showing the film's edges"},blur:{type:"float",default:.5,min:0,max:1,description:"Length of the motion blur at full speed"},weave:{type:"float",default:.5,min:0,max:1,description:"Amount of horizontal weave and vertical jitter"},filmColor:{type:"vec4",default:[.06,.05,.05,1],color:!0,description:"Color of the film around the pictures and of the line between frames"},holeColor:{type:"vec4",default:[.96,.93,.85,1],color:!0,description:"Color of the light through the sprocket holes"}},textures:[],createdAt:"Sun, 1 Nov 2026 20:37:57 +0100",updatedAt:"Sun, 1 Nov 2026 20:37:57 +0100"},{name:"Fisheye",paramsTypes:{strength:"float"},defaultParams:{strength:.8},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image bulges toward the viewer through a strong fisheye lens, then the incoming one flattens back into place
// Tags: lens, distort, zoom, blend

// @range(0, 1) Strength of the lens at its peak
uniform float strength; // = 0.8

vec4 transition(vec2 uv) {
  // lens amount: grows, peaks in the middle, then relaxes, eased so that
  // the magnification of the center (1 / (1 - k)) changes at an even pace
  float h = smoothstep(0.0, 1.0, 1.0 - abs(2.0 * progress - 1.0));
  float k = 1.0 - pow(max(1.0 - strength, 0.01), h);
  // round lens: aspect-corrected coordinates, 1.0 at the corners
  vec2 aspect = vec2(ratio, 1.0);
  vec2 c = (uv - 0.5) * aspect;
  float r = length(c) / length(0.5 * aspect);
  // barrel mapping that keeps the corners in place: the center is magnified,
  // the edges squeezed, and every sample stays inside the image
  vec2 q = 0.5 + (uv - 0.5) * (1.0 - k + k * r * r);
  return mix(getFromColor(q), getToColor(q), smoothstep(0.38, 0.62, progress));
}
`,author:"gre",license:"MIT",description:"The outgoing image bulges toward the viewer through a strong fisheye lens, then the incoming one flattens back into place",tags:["lens","distort","zoom","blend"],params:{strength:{type:"float",default:.8,min:0,max:1,description:"Strength of the lens at its peak"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:20:26 +0100",updatedAt:"Sat, 31 Oct 2026 18:20:26 +0100"},{name:"FlameWipe",paramsTypes:{direction:"vec2",height:"float",scorch:"float",glow:"float",color:"vec3"},defaultParams:{direction:[0,1],height:.4,scorch:.7,glow:.6,color:[1,.4,.08]},glsl:`// Author: gre
// License: MIT
// Description: A wall of flames sweeps across the frame, scorching the outgoing image ahead of it and leaving the incoming image under a fading warm glow
// Tags: fire, flame, burn, wipe, directional

// @param Direction in which the flames sweep across the frame
uniform vec2 direction; // = vec2(0.0, 1.0)
// @range(0, 1) Height of the flames, as a fraction of the frame height
uniform float height; // = 0.4
// @range(0, 1) How much the outgoing image browns and chars ahead of the flames
uniform float scorch; // = 0.7
// @range(0, 1) Strength of the warm glow left on the incoming image
uniform float glow; // = 0.6
// @color Tint of the body of the flames
uniform vec3 color; // = vec3(1.0, 0.4, 0.08)

// width of the scorched band ahead of the flames, and of the glow behind them
const float BAND = 0.45;
// how far off the frame the front starts and ends
const float PAD = 0.3;
// how far the front of the fire wanders around its straight line
const float RAGGED = 0.05;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

float noise(vec2 v) {
  vec2 i = floor(v);
  vec2 f = v - i;
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 v) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise(v);
    v = v * 2.03 + vec2(17.3, 9.1);
    amp *= 0.5;
  }
  return sum / 0.9375;
}

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// color of the fire by its heat: dark red tips, a tinted body, a white-yellow core
vec3 fire(float h) {
  vec3 c = mix(vec3(0.22, 0.01, 0.0), color * color * vec3(1.0, 0.6, 0.4), smoothstep(0.0, 0.3, h));
  c = mix(c, color, smoothstep(0.25, 0.55, h));
  c = mix(c, vec3(1.0, 0.8, 0.35), smoothstep(0.55, 0.8, h));
  return mix(c, vec3(1.0, 0.96, 0.82), smoothstep(0.8, 1.0, h));
}

// width of a flame tongue climbing along an upright line, from its base (s = 0) to its tip
// (s = 1), with a random size
float climbing(float s, float size) {
  return (0.42 + 0.56 * size) * 6.75 * s * (1.0 - s) * (1.0 - s);
}

vec4 transition(vec2 uv) {
  vec2 dir = length(direction) > 1e-5 ? normalize(direction) : vec2(1.0, 0.0);
  vec2 q = (uv - 0.5) * vec2(ratio, 1.0);
  // the flames rise upward from the front: over this distance along the direction
  float rise = height * dir.y;
  // half-width of the burning line, and how far it swells
  float w = 0.05 + 0.35 * height;
  float reach = w * (1.75 + 0.6 * abs(dir.x));
  // the front crosses the frame at the same pace whatever the height of the flames
  float extent = 0.5 * (abs(dir.x) * ratio + abs(dir.y)) + PAD;
  float e = mix(progress, progress * progress * (3.0 - 2.0 * progress), 0.3);
  // the fire catches at the start and dies out at the end, the scorch grows in, the glow fades
  float burn = smoothstep(0.0, 0.12, progress) * (1.0 - smoothstep(0.88, 1.0, progress));
  float scorchAmount = scorch * smoothstep(0.0, 0.2, progress);
  float glowAmount = glow * (1.0 - smoothstep(0.75, 1.0, progress));
  // the flames flicker as they go
  float t = progress * 5.0;

  float side = dot(q, vec2(-dir.y, dir.x));
  float front = mix(-extent, extent, e) + RAGGED * (2.0 * noise(vec2(side * 4.0, t * 0.4)) - 1.0);
  // > 0 ahead of the fire, on the outgoing image
  float k = dot(q, dir) - front;

  // heat before the turbulence: the burning line, and the flames rising from it.
  // Billows rising in screen space swell and thin the line; where it stands upright,
  // they are tongues climbing along it, each widest at its base and pointed at its tip
  float billow = noise(vec2(q.x * 3.0 + 5.0, q.y * 2.5 - t * 1.6));
  float y = q.y * 3.0 - t * 1.4;
  float y2 = y + 0.5;
  float climb = max(climbing(fract(y), hash12(vec2(floor(y), 3.0))),
                    climbing(fract(y2), hash12(vec2(floor(y2), 7.0))));
  billow = mix(billow, 0.4 * billow + climb, abs(dir.x));
  float lineWidth = w * (0.25 + 1.5 * billow);
  float line = 1.0 - smoothstep(0.0, lineWidth, abs(k));
  float tongue = 0.0;
  if (abs(rise) > 1e-4) {
    float s = k / rise;
    if (s >= 0.0) tongue = clamp(1.0 - s, 0.0, 1.0);
  }
  float heat = max(line, tongue) * burn;
  float near = 1.0 - smoothstep(0.0, BAND, abs(k));

  // the outgoing image shimmers in the heat ahead of the fire
  vec2 h = q * vec2(9.0, 5.0) + vec2(0.0, -t * 3.0);
  vec2 shimmer = (vec2(noise(h), noise(h + 31.7)) - 0.5) * 0.012 * min(near + heat, 1.0) * burn;
  vec4 a = getFromColor(mirror(uv + shimmer));
  vec4 b = getToColor(uv);

  // the outgoing image browns, then chars close to the flames
  float brown = k > 0.0 ? scorchAmount * near : 0.0;
  float lum = dot(a.rgb, vec3(0.299, 0.587, 0.114));
  a.rgb = mix(a.rgb, lum * vec3(0.9, 0.55, 0.28), brown) * (1.0 - 0.35 * brown) * (1.0 - 0.9 * brown * near * near);
  // the incoming image under a warm glow fading away from the fire
  float g = k < 0.0 ? glowAmount * near : 0.0;
  b.rgb = b.rgb * mix(vec3(1.0), vec3(1.0, 0.6, 0.35), 0.7 * g) + color * 0.4 * g * g;

  // far from the fire, only one of the images shows
  if (k >= max(BAND, max(rise, reach))) return a.a > 0.0 ? a : vec4(0.0);
  if (-k >= max(BAND, max(-rise, reach))) return b.a > 0.0 ? b : vec4(0.0);

  // the two images meet under the burning line (mixed premultiplied)
  float m = smoothstep(-0.5 * w, 0.5 * w, k);
  vec4 c = mix(vec4(b.rgb * b.a, b.a), vec4(a.rgb * a.a, a.a), m);
  if (c.a <= 0.0) return vec4(0.0);
  vec3 col = c.rgb / c.a;

  // turbulence rising in screen space, stretched upward and swaying into pointed tongues
  vec2 f = vec2(q.x * mix(10.0, 6.0, abs(dir.x)), q.y * mix(1.8, 3.2, abs(dir.x)) - t * 2.4);
  float sway = fbm(vec2(q.x * 2.5, q.y * 1.5 - t * 1.2));
  float n = fbm(f + vec2(1.5 * sway - 0.75, 0.0));
  n = clamp(1.7 * n - 0.35, 0.0, 1.0);
  // a continuous hot core hugging the base of the flames
  float core = (1.0 - smoothstep(0.0, 0.35 * lineWidth, abs(k + 0.4 * w * (sway - 0.5)))) * burn * (1.0 - 0.5 * abs(dir.x));
  // under the flames, where they take root, the turbulence calms down into a soft glow
  float root = rise > 0.0 ? clamp(-k / w, 0.0, 1.0) : rise < 0.0 ? clamp(k / w, 0.0, 1.0) : 0.0;
  root *= abs(dir.y);
  float flame = clamp(heat * 0.95 + 0.45 * core * (0.75 + 0.25 * n) - (1.0 - n) * 1.1 * (1.0 - 0.8 * root), 0.0, 1.0);

  // the flames darken what is behind their body and add their light, with a soft halo;
  // the alpha stays the image's
  // crisp around the tongues, soft at their roots
  float body = smoothstep(0.0, 0.08 + 0.5 * root, flame);
  col = col * (1.0 - 0.7 * body) + fire(flame) * (0.45 + 0.65 * flame) * body;
  col += color * 0.25 * heat * heat * (1.0 - body);
  return vec4(clamp(col, 0.0, 1.0), c.a);
}
`,author:"gre",license:"MIT",description:"A wall of flames sweeps across the frame, scorching the outgoing image ahead of it and leaving the incoming image under a fading warm glow",tags:["fire","flame","burn","wipe","directional"],params:{direction:{type:"vec2",default:[0,1],description:"Direction in which the flames sweep across the frame"},height:{type:"float",default:.4,min:0,max:1,description:"Height of the flames, as a fraction of the frame height"},scorch:{type:"float",default:.7,min:0,max:1,description:"How much the outgoing image browns and chars ahead of the flames"},glow:{type:"float",default:.6,min:0,max:1,description:"Strength of the warm glow left on the incoming image"},color:{type:"vec3",default:[1,.4,.08],color:!0,description:"Tint of the body of the flames"}},textures:[],createdAt:"Tue, 3 Nov 2026 09:42:36 +0100",updatedAt:"Tue, 3 Nov 2026 09:42:36 +0100"},{name:"FlashFade",paramsTypes:{color:"vec3"},defaultParams:{color:[.9,.4,.2]},glsl:`// Author: gre
// License: MIT
// Description: A crossfade that brightens toward a color in the middle
// Tags: fade, color, flash
// @color Color the images brighten toward
uniform vec3 color /* = vec3(0.9, 0.4, 0.2) */;
vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv) + vec4(progress*color, 0.0),
    getToColor(uv) + vec4((1.0-progress)*color, 0.0),
    progress
  );
}
`,author:"gre",license:"MIT",description:"A crossfade that brightens toward a color in the middle",tags:["fade","color","flash"],params:{color:{type:"vec3",default:[.9,.4,.2],color:!0,description:"Color the images brighten toward"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"FlowerWipe",paramsTypes:{segments:"int"},defaultParams:{segments:5},glsl:`// Author: Fernando Kuteken
// License: MIT
// Description: A flower shape with several petals grows to reveal the incoming image
// Tags: shape, wipe, polar

#define PI 3.14159265359

// @param Number of petals
uniform int segments; // = 5

vec4 transition (vec2 uv) {
  
  float angle = atan(uv.y - 0.5, uv.x - 0.5) - 0.5 * PI;
  float normalized = (angle + 1.5 * PI) * (2.0 * PI);
  
  float radius = (cos(float(segments) * angle) + 4.0) / 4.0;
  float difference = length(uv - vec2(0.5, 0.5));
  
  if (difference > radius * progress)
    return getFromColor(uv);
  else
    return getToColor(uv);
}
`,author:"Fernando Kuteken",license:"MIT",description:"A flower shape with several petals grows to reveal the incoming image",tags:["shape","wipe","polar"],params:{segments:{type:"int",default:5,description:"Number of petals"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"FlyEye",paramsTypes:{size:"float",zoom:"float",colorSeparation:"float"},defaultParams:{size:.04,zoom:50,colorSeparation:.3},glsl:`// Author: gre
// License: MIT
// Description: The image breaks into a fly's-eye grid of lenses with color separation
// Tags: lens, distort, chromatic
uniform float size; // = 0.04
uniform float zoom; // = 50.0
uniform float colorSeparation; // = 0.3

vec4 transition(vec2 p) {
  float inv = 1. - progress;
  vec2 disp = size*vec2(cos(zoom*p.x), sin(zoom*p.y));
  vec4 texTo = getToColor(p + inv*disp);
  vec4 fromCenter = getFromColor(p + progress*disp);
  vec4 texFrom = vec4(
    getFromColor(p + progress*disp*(1.0 - colorSeparation)).r,
    fromCenter.g,
    getFromColor(p + progress*disp*(1.0 + colorSeparation)).b,
    fromCenter.a);
  return texTo*progress + texFrom*inv;
}
`,author:"gre",license:"MIT",description:"The image breaks into a fly's-eye grid of lenses with color separation",tags:["lens","distort","chromatic"],params:{size:{type:"float",default:.04},zoom:{type:"float",default:50},colorSeparation:{type:"float",default:.3}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"Fold",paramsTypes:{},defaultParams:{},glsl:`// Author: nwoeanhinnogaehr
// License: MIT
// Description: The incoming image unfolds from the left while the outgoing one folds away to the right
// Tags: fold, slide, horizontal
// Ported from https://gist.github.com/nwoeanhinnogaehr/f6fc39f4cfcbb97f96a6

vec4 transition(vec2 uv) {
  // Only sample the visible side: the other one divides by zero at progress 0 and 1.
  if (progress == 0.0 || uv.x > progress) return getFromColor((uv - vec2(progress, 0.0)) / vec2(1.0 - progress, 1.0));
  return getToColor(uv / vec2(progress, 1.0));
}
`,author:"nwoeanhinnogaehr",license:"MIT",description:"The incoming image unfolds from the left while the outgoing one folds away to the right",tags:["fold","slide","horizontal"],params:{},textures:[],createdAt:"Sun, 29 Mar 2026 20:32:54 +0200",updatedAt:"Sat, 10 Oct 2026 11:26:01 +0200"},{name:"FrostWipe",paramsTypes:{spread:"float",scale:"float",blur:"float",color:"vec4"},defaultParams:{spread:.5,scale:5,blur:.5,color:[.86,.93,1,1]},glsl:`// Author: gre
// License: MIT
// Description: Ice crystals grow in from the edges of the frame with feathery, branching fronts, frosting the outgoing image white and blurry until it is covered, then thaw back out to the edges on the incoming image
// Tags: frost, ice, crystal, blur, cover

// @range(0, 1) How far the crystal fingers reach ahead of the frost
uniform float spread; // = 0.5
// @range(2, 12) Size of the crystals: more, smaller ones with a larger value
uniform float scale; // = 5.0
// @range(0, 1) How much the frost blurs the image under it
uniform float blur; // = 0.5
// @color Color of the frost
uniform vec4 color; // = vec4(0.86, 0.93, 1.0, 1.0)

const int TAPS = 12;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

float vnoise(vec2 v) {
  vec2 i = floor(v);
  vec2 f = fract(v);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
    mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// ridged noise: thin bright veins where the noise crosses its middle, like crystal ferns
float ridged(vec2 v) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    float n = 1.0 - abs(2.0 * vnoise(v) - 1.0);
    sum += amp * n * n;
    v = mat2(1.6, 1.2, -1.2, 1.6) * v + 4.7;
    amp *= 0.5;
  }
  return sum / 0.9375;
}

// crystal grains, cells of size 1: x is how far from the boundary between two grains
// (0 on it, where the crystals start), y a random number for the grain, zw the position
// relative to the grain's seed
vec4 grains(vec2 v) {
  vec2 i = floor(v);
  vec2 f = fract(v);
  float d1 = 8.0;
  float d2 = 8.0;
  vec3 seed = vec3(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 c = vec2(float(x), float(y));
      vec2 o = c + vec2(hash12(i + c), hash12(i + c + 17.3)) - f;
      float d = dot(o, o);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        seed = vec3(hash12(i + c + 41.9), -o);
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  return vec4(sqrt(d2) - sqrt(d1), seed);
}

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// the image under the frost: the outgoing one, then the incoming one, switched under full cover
vec4 image(vec2 uv, float m) {
  if (m <= 0.0) return getFromColor(uv);
  if (m >= 1.0) return getToColor(uv);
  return mix(getFromColor(uv), getToColor(uv), m);
}

vec4 transition(vec2 uv) {
  float p = progress;
  // 0 at both ends, 1 while the frost covers the whole frame (from 0.425 to 0.575)
  float h = 1.0 - abs(2.0 * p - 1.0);
  float a = clamp(h / 0.85, 0.0, 1.0);
  a = a * (1.6 - 0.6 * a); // fast start, slowing down as the frost closes in
  float m = smoothstep(0.47, 0.53, p);
  if (a <= 0.0) return image(uv, m);

  // how deep in the frame the pixel is: 0 on the edges, 1 at the center
  vec2 q = uv * vec2(ratio, 1.0);
  vec2 dEdge = min(uv, 1.0 - uv) * vec2(ratio, 1.0);
  float depth = min(dEdge.x, dEdge.y) / (0.5 * min(ratio, 1.0));
  depth = 1.0 - (1.0 - depth) * (1.0 - depth); // the covered area grows evenly

  // the front, which moves from the edges past the deepest point; the crystals below only
  // hold it back, so nothing is frosted (yet, or any more) deeper than it
  float reach = 0.2 + 0.6 * clamp(spread, 0.0, 1.0);
  float front = mix(-0.1, 1.0 + reach + 0.2, a);
  if (depth > front + 0.08) return image(uv, m);

  // crystals: ferns grow from the boundaries between grains, with parallel needles shooting
  // off them at an angle that changes from grain to grain
  vec2 gv = q * scale;
  // the stems bend a little
  vec4 gr = grains(gv + 0.35 * vec2(vnoise(gv * 1.7), vnoise(gv * 1.7 + 23.1)));
  // the needles' direction, any angle (a rational point on the unit circle)
  float u = 2.0 * gr.y - 1.0;
  vec2 dir = vec2(1.0 - u * u, 2.0 * u) / (1.0 + u * u);
  float t = dot(gr.zw, dir) * 7.0;
  float needle = 1.0 - abs(2.0 * fract(t) - 1.0); // 1 along each needle, 0 between them
  float nh = fract(gr.y + 0.618034 * floor(t));
  float len = mix(0.15, 0.6, nh); // each needle has its own length
  float r = ridged(gv * 1.3);
  float rf = ridged(gv * 4.0 + 11.0);
  // when the frost reaches the pixel, after the edges: the stems first, then the needles, then
  // the gaps between them
  float grow = min(gr.x * 3.5, gr.x / len * 0.5 + (1.0 - needle) * 1.2 + 0.2 * fract(nh * 13.7));
  float field = depth + reach * (0.8 * min(grow, 1.0) + 0.2 * (1.0 - r)) + 0.1 * (1.0 - rf);
  float inside = front - field; // > 0 under the frost
  float f = smoothstep(0.0, 0.03, inside);
  // a thin, faint haze of fine crystals just ahead of the front
  float haze = 0.4 * smoothstep(0.9, 1.0, rf) * smoothstep(-0.08, 0.0, inside);
  float frost = max(f, haze);
  if (frost <= 0.0) return image(uv, m);

  // thicker ice close to the edges, where it started growing
  float thick = smoothstep(0.0, 0.5, inside);
  float full = smoothstep(0.75, 0.95, h); // the frost turns opaque to hide the switch

  // frosted glass: blur over a small jittered disc, scattered along the crystals
  float radius = (0.004 + 0.03 * blur) * frost * (0.5 + 0.5 * thick);
  float rot = 6.2831853 * hash12(floor(q * 90.0));
  vec3 rgb = vec3(0.0);
  float alpha = 0.0;
  for (int i = 0; i < TAPS; i++) {
    float k = (float(i) + 0.5) / float(TAPS);
    float th = rot + float(i) * 2.3999632;
    vec2 off = sqrt(k) * vec2(cos(th), sin(th)) * radius;
    vec4 c = image(mirror(uv + off / vec2(ratio, 1.0)), m);
    rgb += c.rgb * c.a;
    alpha += c.a;
  }
  alpha /= float(TAPS);
  rgb = alpha > 0.0 ? rgb / (alpha * float(TAPS)) : vec3(0.0);

  // a cool white crystal tint, brighter on the stems, the needles (fading out toward their tips)
  // and the growing front
  float stem = 1.0 - smoothstep(0.0, 0.03, gr.x);
  float needles = smoothstep(0.7, 1.0, needle) * (1.0 - smoothstep(0.0, len, gr.x));
  float glint = 0.4 + 0.6 * rf;
  float veins = clamp(glint * max(0.35 * stem, 0.55 * needles) + 0.3 * smoothstep(0.6, 0.95, r), 0.0, 1.0);
  float rim = smoothstep(0.0, 0.02, inside) * (1.0 - smoothstep(0.02, 0.07, inside));
  vec3 ice = clamp(color.rgb * (0.82 + 0.25 * veins), 0.0, 1.0);
  float cover = frost * (0.35 + 0.3 * thick + 0.25 * veins);
  cover = clamp(mix(cover, frost, full), 0.0, 1.0);
  vec4 under = vec4(rgb * mix(vec3(1.0), color.rgb, 0.5 * frost), alpha);
  // the frost color mixes as straight RGBA, like every fill color
  vec4 res = mix(under, vec4(ice, color.a), cover);

  // fine sparkles on the ice, twinkling as it grows
  vec2 sq = q * 36.0;
  vec2 cell = floor(sq);
  vec2 d = abs(sq - cell - 0.25 - 0.5 * vec2(hash12(cell + 1.3), hash12(cell + 5.9)));
  float star = max(0.0, 1.0 - 9.0 * length(d)) + max(0.0, 1.0 - 4.0 * (d.x + d.y) - 30.0 * min(d.x, d.y));
  float tw = 0.5 + 0.5 * sin(6.2831853 * (hash12(cell + 9.1) + 2.0 * p));
  float sparkle = step(0.82, hash12(cell + 3.7)) * min(star, 1.0) * tw * f * (0.4 + 0.6 * veins);
  float light = clamp(0.4 * rim + 0.8 * sparkle, 0.0, 1.0);
  res = mix(res, vec4(mix(color.rgb, vec3(1.0), 0.6), color.a), light);
  return clamp(res, 0.0, 1.0);
}
`,author:"gre",license:"MIT",description:"Ice crystals grow in from the edges of the frame with feathery, branching fronts, frosting the outgoing image white and blurry until it is covered, then thaw back out to the edges on the incoming image",tags:["frost","ice","crystal","blur","cover"],params:{spread:{type:"float",default:.5,min:0,max:1,description:"How far the crystal fingers reach ahead of the frost"},scale:{type:"float",default:5,min:2,max:12,description:"Size of the crystals: more, smaller ones with a larger value"},blur:{type:"float",default:.5,min:0,max:1,description:"How much the frost blurs the image under it"},color:{type:"vec4",default:[.86,.93,1,1],color:!0,description:"Color of the frost"}},textures:[],createdAt:"Fri, 6 Nov 2026 08:07:55 +0100",updatedAt:"Fri, 6 Nov 2026 08:07:55 +0100"},{name:"Funnel",paramsTypes:{target:"float",curvature:"float",shadow:"float"},defaultParams:{target:.7,curvature:.8,shadow:.5},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image narrows into a curved funnel toward a point on the bottom edge and slides into it, its sides bending like a window minimized into a dock, revealing the incoming image behind it
// Tags: distort, slide, vertical, shadow

// @range(0, 1) Point of the bottom edge where the image disappears, from left (0) to right (1)
uniform float target; // = 0.7
// @range(0, 1) Shape of the funnel's sides: 0 straight, 1 bent into an S curve
uniform float curvature; // = 0.8
// @range(0, 1) Strength of the shading of the bent image and of the shadow it casts
uniform float shadow; // = 0.5

// width of the funnel's neck, as a part of the frame's height
const float NECK = 0.04;
// how far below the bottom edge the image's top ends, so it is gone at the end
const float OVERSHOOT = 0.03;
// width of the anti-aliased edges, as a part of the frame's height
const float EDGE = 0.0015;
// reach of the soft shadow, as a part of the frame's height
const float SOFT = 0.06;

vec4 transition(vec2 uv) {
  float t = progress;
  // one eased timing: the funnel forms from the very start while the slide accelerates into it
  float f = smoothstep(0.0, 1.0, 1.0 - (1.0 - t) * (1.0 - t) * (1.0 - t));
  float slide = (1.0 + OVERSHOOT) * t * t * (1.5 - 0.5 * t);

  float r = max(ratio, 1e-4);
  float nh = 0.5 * NECK / r;
  // the whole neck stays in the frame
  float tx = clamp(target, nh, 1.0 - nh);
  float c = clamp(curvature, 0.0, 1.0);

  // the funnel's profile, 0 at the neck on the bottom edge to 1 at the top of the frame
  float q = clamp(uv.y, 0.0, 1.0);
  float w = mix(q, q * q * (3.0 - 2.0 * q), c);
  float dw = mix(1.0, 6.0 * q * (1.0 - q), c);
  float L = f * mix(tx - nh, 0.0, w);
  float R = 1.0 - f * (1.0 - mix(tx + nh, 1.0, w));
  float dL = -f * (tx - nh) * dw;
  float dR = f * (1.0 - tx - nh) * dw;
  float v = uv.y + slide;

  // anti-aliased coverage, measured across the slanted sides (a side on the frame's border is not an edge)
  float e = EDGE * min(1.0, 10.0 * t) + 1e-6;
  float left = L > 0.0 ? (uv.x - L) * r / sqrt(1.0 + dL * dL * r * r) : 1.0;
  float right = R < 1.0 ? (R - uv.x) * r / sqrt(1.0 + dR * dR * r * r) : 1.0;
  float cov = clamp(min(min(left, right), 1.0 - v) / e + 0.5, 0.0, 1.0);

  vec4 img = vec4(0.0);
  float s = clamp(shadow, 0.0, 1.0);
  if (cov > 0.0) {
    float width = R - L;
    vec2 src = clamp(vec2((uv.x - L) / width, v), 0.0, 1.0);
    img = getFromColor(src);
    // the squeezed rows round like a bent sheet, darker on their sides and toward the neck
    float across = 2.0 * src.x - 1.0;
    img.rgb *= 1.0 - s * (1.0 - width) * (0.5 * across * across + 0.3 * (1.0 - w));
    if (cov >= 1.0) return img;
  }

  vec4 bg = getToColor(uv);
  // soft shadow of the funnel cast on the incoming image
  float ox = max(L - uv.x, uv.x - R) * r;
  float oy = uv.y - (1.0 - slide);
  float dist = length(max(vec2(ox, oy), 0.0));
  bg.rgb *= 1.0 - s * 0.6 * f * (1.0 - t) * (1.0 - smoothstep(0.0, SOFT, dist));

  return mix(bg, img, cov);
}
`,author:"gre",license:"MIT",description:"The outgoing image narrows into a curved funnel toward a point on the bottom edge and slides into it, its sides bending like a window minimized into a dock, revealing the incoming image behind it",tags:["distort","slide","vertical","shadow"],params:{target:{type:"float",default:.7,min:0,max:1,description:"Point of the bottom edge where the image disappears, from left (0) to right (1)"},curvature:{type:"float",default:.8,min:0,max:1,description:"Shape of the funnel's sides: 0 straight, 1 bent into an S curve"},shadow:{type:"float",default:.5,min:0,max:1,description:"Strength of the shading of the bent image and of the shadow it casts"}},textures:[],createdAt:"Sat, 7 Nov 2026 18:51:02 +0100",updatedAt:"Sat, 7 Nov 2026 18:51:02 +0100"},{name:"Gallery",paramsTypes:{direction:"float",tilt:"float",gap:"float",zoom:"float",reflection:"float",background:"vec4"},defaultParams:{direction:1,tilt:.6,gap:.15,zoom:2,reflection:.3,background:[.07,.07,.08,1]},glsl:`// Author: gre
// License: MIT
// Description: The camera pulls back from the outgoing image to show it as a slide hanging in a row on a wall in perspective, the row glides along as each slide turns away from the center, and the camera moves back in on the incoming slide until it fills the frame
// Tags: 3d, perspective, gallery, slide, reflection, directional

// @param Way the row moves: 1 brings the incoming slide in from the right, -1 from the left
uniform float direction; // = 1.0
// @range(0, 1) How much the slides turn as they leave the center
uniform float tilt; // = 0.6
// @range(0, 1) Space between two slides, in slide widths
uniform float gap; // = 0.15
// @range(0.2, 3) How far the camera pulls back
uniform float zoom; // = 2.0
// @range(0, 1) Strength of the reflection of the slides on the floor
uniform float reflection; // = 0.3
// @color Color of the wall and the floor around the slides
uniform vec4 background; // = vec4(0.07, 0.07, 0.08, 1.0)

const float FOCAL = 1.6; // distance from the camera to a slide when it fills the frame
const float MAX_ANGLE = 1.4; // turn of a side slide at tilt = 1, in radians
const float NEIGHBOUR = 0.3; // how visible the repeats beyond the two images are
const float AA = 0.002; // width of the antialiased slide edges, in frame heights

vec4 premultiply(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

// how far slide k sits from the center of the view, in slides, clamped to one slide on each side
float offset(float k, float camQ, float spacing) {
  return clamp((k * spacing - camQ) / spacing, -1.0, 1.0);
}

// the ray o + t d against slide k of the row (a plane turned around its vertical axis):
// returns (u, v, t, coverage), coverage antialiased over aa frame heights at the slide's edges
vec4 slideHit(vec3 o, vec3 d, float k, float s, float camQ, float spacing, float aa) {
  // a side slide turns away from the center: its outer edge goes back into the wall
  float a = -s * MAX_ANGLE * tilt * offset(k, camQ, spacing);
  vec3 c = vec3(s * k * spacing, 0.0, 0.0);
  vec3 tg = vec3(cos(a), 0.0, sin(a)); // along the slide, left to right
  vec3 n = vec3(-tg.z, 0.0, tg.x);
  float dn = dot(d, n);
  if (abs(dn) < 1e-5) return vec4(0.0, 0.0, -1.0, 0.0);
  float t = dot(c - o, n) / dn;
  vec3 q = o + d * t - c;
  float lx = dot(q, tg) + 0.5 * ratio;
  float ly = q.y + 0.5;
  // distances to the edges on screen: along the slide, how fast its local x moves with the screen x
  float jx = abs(t * (tg.x - dot(d, tg) * n.x / dn));
  float ex = min(lx, ratio - lx) / max(jx, 1e-6);
  float ey = min(ly, 1.0 - ly) / max(t, 1e-6);
  float cov = t > 0.0 ? clamp(0.5 + min(ex, ey) / aa, 0.0, 1.0) : 0.0;
  return vec4(lx / ratio, ly, t, cov);
}

// the premultiplied color of slide k where the ray hit it; the row is from (k = 0), to (k = 1),
// and faint repeats beyond them on their own side; refl > 0 is the strength of its reflection
vec4 slideColor(vec4 h, float k, float camQ, float spacing, float refl, vec4 bg) {
  if (h.w <= 0.0) return vec4(0.0);
  vec2 st = clamp(h.xy, 0.0, 1.0);
  vec4 c = premultiply(k < 0.5 ? getFromColor(st) : getToColor(st));
  // turned away from the light as it turns away from the center
  c.rgb *= 1.0 - 0.3 * tilt * abs(offset(k, camQ, spacing));
  if (k < -0.5 || k > 1.5) c = mix(bg, c, NEIGHBOUR);
  // the reflection fades out below the bottom of the slide
  float f = refl > 0.0 ? refl * (1.0 - smoothstep(0.0, 0.6, st.y)) : 1.0;
  return c * (h.w * f);
}

// how much the slides cover along the ray, whatever their images' alpha
float sceneCover(vec3 o, vec3 d, float s, float camQ, float spacing, float aa) {
  float kc = floor(s * (o.x + d.x * o.z / -d.z) / spacing + 0.5);
  float w0 = slideHit(o, d, kc - 1.0, s, camQ, spacing, aa).w;
  float w1 = slideHit(o, d, kc, s, camQ, spacing, aa).w;
  float w2 = slideHit(o, d, kc + 1.0, s, camQ, spacing, aa).w;
  return 1.0 - (1.0 - w0) * (1.0 - w1) * (1.0 - w2);
}

// the slides seen along the ray, composited back to front (premultiplied)
vec4 scene(vec3 o, vec3 d, float s, float camQ, float spacing, float aa, float refl, vec4 bg) {
  // the slide in front of which the ray crosses the wall, and its two neighbours
  float wallQ = s * (o.x + d.x * o.z / -d.z);
  float kc = floor(wallQ / spacing + 0.5);
  vec4 h0 = slideHit(o, d, kc - 1.0, s, camQ, spacing, aa);
  vec4 h1 = slideHit(o, d, kc, s, camQ, spacing, aa);
  vec4 h2 = slideHit(o, d, kc + 1.0, s, camQ, spacing, aa);
  vec4 c0 = slideColor(h0, kc - 1.0, camQ, spacing, refl, bg);
  vec4 c1 = slideColor(h1, kc, camQ, spacing, refl, bg);
  vec4 c2 = slideColor(h2, kc + 1.0, camQ, spacing, refl, bg);
  float t0 = h0.w > 0.0 ? h0.z : 1e6;
  float t1 = h1.w > 0.0 ? h1.z : 1e6;
  float t2 = h2.w > 0.0 ? h2.z : 1e6;
  // sort far to near: t0 >= t1 >= t2
  vec4 tc;
  float tt;
  if (t0 < t1) { tc = c0; c0 = c1; c1 = tc; tt = t0; t0 = t1; t1 = tt; }
  if (t1 < t2) { tc = c1; c1 = c2; c2 = tc; tt = t1; t1 = t2; t2 = tt; }
  if (t0 < t1) { tc = c0; c0 = c1; c1 = tc; }
  vec4 col = c0;
  col = c1 + col * (1.0 - c1.a);
  col = c2 + col * (1.0 - c2.a);
  return col;
}

vec4 transition(vec2 uv) {
  float p = progress;
  float s = direction < 0.0 ? -1.0 : 1.0;
  float spacing = ratio * (1.0 + gap);
  // the camera pulls back, glides along the row, and moves back in
  float back = smoothstep(0.0, 0.42, p) * (1.0 - smoothstep(0.58, 1.0, p));
  float m = clamp((p - 0.18) / 0.64, 0.0, 1.0);
  float glide = m * m * m * (m * (m * 6.0 - 15.0) + 10.0);
  float camQ = spacing * glide;
  vec3 o = vec3(s * camQ, 0.0, FOCAL * (1.0 + zoom * back));
  vec3 d = vec3((uv - 0.5) * vec2(ratio, 1.0), -FOCAL);
  float amount = min(1.0, 40.0 * back);
  float aa = max(AA * amount, 1e-6);
  vec4 bg = premultiply(background);

  vec4 col = scene(o, d, s, camQ, spacing, aa, 0.0, bg);
  if (col.a < 1.0) {
    vec4 under = bg;
    // the floor, below the slides, reflects them
    if (d.y < 0.0 && reflection > 0.0) {
      vec4 r = scene(vec3(o.x, -1.0 - o.y, o.z), vec3(d.x, -d.y, d.z), s, camQ, spacing, aa, reflection, bg);
      under = r + bg * (1.0 - r.a);
    }
    // the wall shows around the slides, and only fades in behind their transparent parts,
    // so that the images keep their own alpha at the start and the end
    col += under * (mix(1.0, amount, sceneCover(o, d, s, camQ, spacing, aa)) * (1.0 - col.a));
  }
  return col.a > 0.0 ? vec4(col.rgb / col.a, col.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The camera pulls back from the outgoing image to show it as a slide hanging in a row on a wall in perspective, the row glides along as each slide turns away from the center, and the camera moves back in on the incoming slide until it fills the frame",tags:["3d","perspective","gallery","slide","reflection","directional"],params:{direction:{type:"float",default:1,description:"Way the row moves: 1 brings the incoming slide in from the right, -1 from the left"},tilt:{type:"float",default:.6,min:0,max:1,description:"How much the slides turn as they leave the center"},gap:{type:"float",default:.15,min:0,max:1,description:"Space between two slides, in slide widths"},zoom:{type:"float",default:2,min:.2,max:3,description:"How far the camera pulls back"},reflection:{type:"float",default:.3,min:0,max:1,description:"Strength of the reflection of the slides on the floor"},background:{type:"vec4",default:[.07,.07,.08,1],color:!0,description:"Color of the wall and the floor around the slides"}},textures:[],createdAt:"Wed, 4 Nov 2026 08:03:21 +0100",updatedAt:"Wed, 4 Nov 2026 08:03:21 +0100"},{name:"GeometricCollage",paramsTypes:{cells:"int",stagger:"float",plates:"bool",color1:"vec4",color2:"vec4",color3:"vec4",shadow:"float"},defaultParams:{cells:2,stagger:1,plates:!0,color1:[.89,.22,.17,1],color2:[.97,.77,.15,1],color3:[.14,.32,.66,1],shadow:.6},glsl:`// Author: gre
// License: MIT
// Description: The incoming image arrives cut into a geometric poster of quarter discs, half discs, triangles and their complements: piece after piece swings in around a corner of its cell, a flat plate of color just ahead of it, and lands flat with a soft paper shadow
// Tags: geometric, shapes, collage, rotate, color

// @range(1, 5, 1) Number of cells along the short side of the frame, the long side gets as many as keep them about square
uniform int cells; // = 2
// @range(0, 1) How spread out in time the pieces arrive: 0 swings them all in together, 1 lands them one after another
uniform float stagger; // = 1.0
// @param Show a flat plate of color swinging in just ahead of each piece
uniform bool plates; // = true
// @color First plate color
uniform vec4 color1; // = vec4(0.89, 0.22, 0.17, 1.0)
// @color Second plate color
uniform vec4 color2; // = vec4(0.97, 0.77, 0.15, 1.0)
// @color Third plate color
uniform vec4 color3; // = vec4(0.14, 0.32, 0.66, 1.0)
// @range(0, 1) Darkness of the shadows the pieces cast while they swing in
uniform float shadow; // = 0.6

const float PI = 3.141592653589793;
// shortest duration of the swing of one layer, delay of a cell's second piece, lead of a plate over its piece
const float DUR = 0.24;
const float GAP = 0.07;
const float LEAD = 0.06;
// part of a swing after which a layer has turned into place, and only comes down flat onto the paper
const float SETTLE = 0.8;
// width of the anti-aliased edges, in frame heights
const float EDGE = 0.002;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

// the cell's layout seen from its first piece: the local point turned by k quarter turns around the cell center
vec2 orient(vec2 l, float k) {
  vec2 c = l - 0.5;
  if (k < 0.5) return l;
  if (k < 1.5) return vec2(-c.y, c.x) + 0.5;
  if (k < 2.5) return 0.5 - c;
  return vec2(c.y, -c.x) + 0.5;
}

// the cell corner that orient(., k) maps to the corner (0, 0): the first piece's pivot
vec2 pivotCorner(float k) {
  if (k < 0.5) return vec2(0.0, 0.0);
  if (k < 1.5) return vec2(0.0, 1.0);
  if (k < 2.5) return vec2(1.0, 1.0);
  return vec2(1.0, 0.0);
}

// signed distance (in cell units) to the cell's first piece, negative inside; the second piece is its complement
float shapeDist(vec2 o, float type) {
  if (type < 0.5) return length(o) - 1.0;                  // quarter disc around the pivot
  if (type < 1.5) return length(o - vec2(0.5, 0.0)) - 0.5; // half disc on an edge
  return (o.x + o.y - 1.0) * 0.70710678;                    // triangle
}

// signed distance (in cell units) to a piece of a cell at the local point l, negative inside
float pieceDist(vec2 l, vec2 cell, float piece) {
  float k = floor(hash12(cell + 1.7) * 4.0);
  // cells side by side never share a shape
  float sd = shapeDist(orient(l, k), mod(cell.x + 2.0 * cell.y + 1.0, 3.0));
  return piece > 0.5 ? -sd : sd;
}

float boxDist(vec2 l) {
  return min(min(l.x, l.y), min(1.0 - l.x, 1.0 - l.y));
}

float easeOutCubic(float t) {
  float u = 1.0 - clamp(t, 0.0, 1.0);
  return 1.0 - u * u * u;
}

// how high a layer floats above the paper along its swing, 0 once landed
float lift(float t) {
  return 1.0 - smoothstep(0.3, 1.0, t);
}

// the time over which the cells start one after another, and the duration of a swing, which gets
// longer when the cells start closer together, so that the last piece always lands just before the end
float spread() {
  return (1.0 - DUR - GAP - LEAD - 0.02) * clamp(stagger, 0.0, 1.0);
}
float swing() {
  return 1.0 - GAP - LEAD - 0.02 - spread();
}

// when the first piece of a cell starts to swing in; the second one starts GAP later, and a plate LEAD before its piece
float startTime(vec2 cell, vec2 n) {
  float order = (cell.x + (n.y - 1.0 - cell.y)) / max(n.x + n.y - 2.0, 1.0);
  order = clamp(order * 0.75 + 0.25 * hash12(cell + 4.4), 0.0, 1.0);
  return LEAD + spread() * order;
}

// the local point in the cell of a swinging layer at its local time t (0 < t < 1), seen at the frame point p,
// and its scale
vec3 swingPoint(vec2 p, vec2 cell, vec2 cs, float piece, float t) {
  vec2 pc = pivotCorner(floor(hash12(cell + 1.7) * 4.0));
  // the first piece turns around its pivot corner, its complement around the opposite one
  vec2 piv = (cell + (piece < 0.5 ? pc : 1.0 - pc)) * cs;
  float sgn = hash12(cell + vec2(piece * 3.3, 5.2)) < 0.5 ? -1.0 : 1.0;
  // grows out of the corner while it swings a quarter turn into place, a bit bigger while it floats
  float s = smoothstep(0.0, 0.45, t) * (1.0 + 0.1 * lift(t));
  // the swing settles first, then the layer comes down flat onto the paper
  float a = sgn * 0.5 * PI * (1.0 - easeOutCubic(t / SETTLE));
  float ca = cos(a), sa = sin(a);
  vec2 d = p - piv;
  d = vec2(ca * d.x + sa * d.y, -sa * d.x + ca * d.y) / max(s, 0.001);
  return vec3((piv + d) / cs - cell, s);
}

// the coverage of a swinging layer and its local point in the cell
vec3 layerCover(vec2 p, vec2 cell, vec2 cs, float piece, float t) {
  vec3 q = swingPoint(p, cell, cs, piece, t);
  if (q.z < 0.01) return vec3(0.0);
  float e = EDGE / (min(cs.x, cs.y) * q.z);
  float m = clamp(boxDist(q.xy) / e + 0.5, 0.0, 1.0) * clamp(-pieceDist(q.xy, cell, piece) / e + 0.5, 0.0, 1.0);
  return vec3(m, clamp(q.xy, 0.0, 1.0));
}

// the coverage of the soft shadow of a swinging layer: it falls down and to the right, further away the higher it floats
float layerShadow(vec2 p, vec2 cell, vec2 cs, float piece, float t) {
  float h = lift(t);
  vec3 q = swingPoint(p - vec2(0.07, -0.1) * h * cs.y, cell, cs, piece, t);
  if (q.z < 0.01) return 0.0;
  float soft = 0.02 + 0.05 * h;
  return h * (1.0 - smoothstep(-soft, soft, pieceDist(q.xy, cell, piece))) * smoothstep(-soft, soft, boxDist(q.xy));
}

vec4 plateColor(vec2 cell, float piece) {
  float c = mod(floor(hash12(cell * 1.3 + 0.7) * 3.0) + piece, 3.0);
  return c < 0.5 ? color1 : c < 1.5 ? color2 : color3;
}

vec4 premultiplied(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

vec4 transition(vec2 uv) {
  float kc = float(cells < 1 ? 1 : cells);
  vec2 n = ratio >= 1.0 ? vec2(max(1.0, floor(ratio * kc + 0.5)), kc) : vec2(kc, max(1.0, floor(kc / ratio + 0.5)));
  vec2 cs = vec2(ratio, 1.0) / n;
  vec2 p = uv * vec2(ratio, 1.0);
  vec2 cell0 = floor(p / cs);
  float sw = swing();

  // the paper: the outgoing image, where the pieces that have landed show the incoming one. They lie flat side by side
  // and tile the frame exactly, with hard cell edges and anti-aliased edges between the two pieces of a cell
  vec2 l0 = p / cs - cell0;
  float t00 = startTime(cell0, n);
  float sd0 = pieceDist(l0, cell0, 0.0);
  float e0 = EDGE / min(cs.x, cs.y);
  float landed = (progress >= t00 + sw ? clamp(-sd0 / e0 + 0.5, 0.0, 1.0) : 0.0)
    + (progress >= t00 + GAP + sw ? clamp(sd0 / e0 + 0.5, 0.0, 1.0) : 0.0);
  // the layers still in the air, and the plates not yet covered by their pieces: the top one at p and the one
  // under it by start time, as (start, coverage, plate, piece) and (cell, local point)
  vec4 top = vec4(-1.0, 0.0, 0.0, 0.0);
  vec4 topPos = vec4(0.0);
  vec4 und = vec4(-1.0, 0.0, 0.0, 0.0);
  vec4 undPos = vec4(0.0);
  for (int dy = -1; dy <= 1; dy++) {
    for (int dx = -1; dx <= 1; dx++) {
      vec2 cell = cell0 + vec2(float(dx), float(dy));
      if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= n.x || cell.y >= n.y) continue;
      float tc = startTime(cell, n);
      for (int pc = 0; pc < 2; pc++) {
        float piece = float(pc);
        float t0 = tc + GAP * piece;
        // how far the piece is in its swing
        float tp = (progress - t0) / sw;
        for (int ly = 0; ly < 2; ly++) {
          float isPlate = ly == 0 ? 1.0 : 0.0;
          if (isPlate > 0.5 && !plates) continue;
          float ts = t0 - LEAD * isPlate;
          float t = (progress - ts) / sw;
          // a landed piece is part of the paper, and its plate fades out under it once it has turned into place
          if (t <= 0.0 || tp >= 1.0 || (isPlate > 0.5 && tp >= SETTLE)) continue;
          vec3 L = layerCover(p, cell, cs, piece, min(t, 1.0));
          if (isPlate > 0.5) L.x *= 1.0 - smoothstep(SETTLE - 0.1, SETTLE, tp);
          if (L.x <= 0.0) continue;
          vec4 cur = vec4(ts, L.x, isPlate, piece);
          vec4 curPos = vec4(cell, L.yz);
          if (ts > top.x) {
            und = top;
            undPos = topPos;
            top = cur;
            topPos = curPos;
          } else if (ts > und.x) {
            und = cur;
            undPos = curPos;
          }
        }
      }
    }
  }
  // a piece coming down next to its landed complement does not overlap it along their common edge: their coverages add up
  if (top.z < 0.5 && und.x < 0.0 && topPos.x == cell0.x && topPos.y == cell0.y) {
    landed = top.y < 1.0 ? landed / (1.0 - top.y) : 1.0;
  }
  vec4 c = mix(premultiplied(getFromColor(uv)), premultiplied(getToColor(uv)), clamp(landed, 0.0, 1.0));
  if (und.x >= 0.0) {
    vec4 uc = und.z > 0.5 ? plateColor(undPos.xy, und.w) : getToColor((undPos.xy + undPos.zw) * cs / vec2(ratio, 1.0));
    c = mix(c, premultiplied(uc), und.y);
  }
  if (top.x >= 0.0) {
    vec4 tc = top.z > 0.5 ? plateColor(topPos.xy, top.w) : getToColor((topPos.xy + topPos.zw) * cs / vec2(ratio, 1.0));
    c = mix(c, premultiplied(tc), top.y);
  }

  // the soft shadows of the layers floating above the top one
  float sh = 0.0;
  if (shadow > 0.0) {
    for (int dy = -1; dy <= 1; dy++) {
      for (int dx = -1; dx <= 1; dx++) {
        vec2 cell = cell0 + vec2(float(dx), float(dy));
        if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= n.x || cell.y >= n.y) continue;
        float tc = startTime(cell, n);
        for (int pc = 0; pc < 2; pc++) {
          float piece = float(pc);
          float t0 = tc + GAP * piece;
          float tp = (progress - t0) / sw;
          for (int ly = 0; ly < 2; ly++) {
            float isPlate = ly == 0 ? 1.0 : 0.0;
            if (isPlate > 0.5 && (!plates || tp >= SETTLE)) continue;
            float ts = t0 - LEAD * isPlate;
            float t = (progress - ts) / sw;
            if (ts <= top.x || t <= 0.0 || t >= 1.0) continue;
            sh = max(sh, layerShadow(p, cell, cs, piece, t));
          }
        }
      }
    }
  }
  c.rgb *= 1.0 - 0.7 * clamp(shadow, 0.0, 1.0) * sh;
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The incoming image arrives cut into a geometric poster of quarter discs, half discs, triangles and their complements: piece after piece swings in around a corner of its cell, a flat plate of color just ahead of it, and lands flat with a soft paper shadow",tags:["geometric","shapes","collage","rotate","color"],params:{cells:{type:"int",default:2,min:1,max:5,step:1,description:"Number of cells along the short side of the frame, the long side gets as many as keep them about square"},stagger:{type:"float",default:1,min:0,max:1,description:"How spread out in time the pieces arrive: 0 swings them all in together, 1 lands them one after another"},plates:{type:"bool",default:!0,description:"Show a flat plate of color swinging in just ahead of each piece"},color1:{type:"vec4",default:[.89,.22,.17,1],color:!0,description:"First plate color"},color2:{type:"vec4",default:[.97,.77,.15,1],color:!0,description:"Second plate color"},color3:{type:"vec4",default:[.14,.32,.66,1],color:!0,description:"Third plate color"},shadow:{type:"float",default:.6,min:0,max:1,description:"Darkness of the shadows the pieces cast while they swing in"}},textures:[],createdAt:"Fri, 13 Nov 2026 09:32:16 +0100",updatedAt:"Fri, 13 Nov 2026 09:32:16 +0100"},{name:"GlintDissolve",paramsTypes:{size:"float",threshold:"float",intensity:"float",diagonals:"bool",rotation:"float",rainbow:"float",tint:"vec3"},defaultParams:{size:.15,threshold:.6,intensity:2,diagonals:!1,rotation:0,rainbow:.35,tint:[1,.95,.85]},glsl:`// Author: gre
// License: MIT
// Description: The bright points of the outgoing image sparkle into crisp four-point star glints that swell and twinkle up to the cut, then shrink back into the highlights of the incoming image, which stays sharp
// Tags: light, glints, sparkle, dissolve

// @range(0.02, 0.3) Length of the longest rays of the glints at the peak, in frame heights
uniform float size; // = 0.15
// @range(0, 1) Brightness above which the image sparkles
uniform float threshold; // = 0.6
// @range(0, 4) Brightness of the glints
uniform float intensity; // = 2.0
// @param Add a shorter, softer pair of diagonal rays to each glint
uniform bool diagonals; // = false
// @range(-45, 45) Angle of the cross, in degrees
uniform float rotation; // = 0.0
// @range(0, 1) Rainbow fringes along the rays
uniform float rainbow; // = 0.35
// @color Tint of the glints, added as light
uniform vec3 tint; // = vec3(1.0, 0.95, 0.85)

// the long rays reach over this many cells of the glint grid
const float REACH = 6.0;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

// one thin ray along x, from the glint center to its tip at x = len (in cells)
float ray(vec2 d, float len, float width) {
  float a = abs(d.x) / len;
  if (a >= 1.0) return 0.0;
  float fall = (1.0 - a) * (1.0 - a);
  float w = width * (1.0 - 0.7 * a);
  return fall * exp(-d.y * d.y / (w * w));
}

vec3 spectrum(float a) {
  return 0.5 + 0.5 * cos(6.2831853 * (a + vec3(0.0, 0.33, 0.67)));
}

vec4 transition(vec2 uv) {
  float p = progress;
  // the glints swell up to the cut, then shrink back: 0 at both ends
  float t = 1.0 - abs(2.0 * p - 1.0);
  float amount = t * (2.0 - t);
  // a short crossfade under the glints at their brightest
  float m = smoothstep(0.42, 0.58, p);
  if (amount <= 0.0) return m < 0.5 ? getFromColor(uv) : getToColor(uv);

  vec4 fromColor = getFromColor(uv);
  vec4 toColor = getToColor(uv);
  vec4 c = mix(vec4(fromColor.rgb * fromColor.a, fromColor.a), vec4(toColor.rgb * toColor.a, toColor.a), m);
  if (c.a <= 0.0) return vec4(0.0);
  vec3 base = c.rgb / c.a;

  // a grid of glint cells, turned with the cross so that its long rays run along the rows and columns
  float cell = size / REACH;
  float ang = radians(rotation);
  vec2 cs = vec2(cos(ang), sin(ang));
  vec2 aspect = vec2(ratio, 1.0);
  vec2 o = (uv - 0.5) * aspect;
  vec2 q = vec2(o.x * cs.x + o.y * cs.y, o.y * cs.x - o.x * cs.y) / cell;
  vec2 home = floor(q);
  // thin rays, in cells, thin enough to vanish before the next row of cells
  float width = min(0.0022 / cell, 0.07);

  vec3 light = vec3(0.0);
  // the glints of the own cell, of the cells along its row and column (whose long rays reach this
  // pixel) and of its four diagonal neighbours (for their short diagonal rays and their cores)
  for (int k = 0; k < 29; k++) {
    float fk = float(k);
    vec2 off = vec2(0.0);
    if (k >= 1 && k <= 12) off = vec2(fk < 7.0 ? fk - 7.0 : fk - 6.0, 0.0);
    else if (k >= 13 && k <= 24) off = vec2(0.0, fk < 19.0 ? fk - 19.0 : fk - 18.0);
    else if (k >= 25) off = vec2(mod(fk, 2.0) * 2.0 - 1.0, fk < 27.0 ? -1.0 : 1.0);
    // the rays are never longer than this, so farther glints cannot reach the pixel
    if (max(abs(off.x), abs(off.y)) > REACH * amount + 1.0) continue;
    vec2 id = home + off;
    // only some of the cells hold a glint
    if (hash12(id + 89.5) > 0.55) continue;
    float h0 = hash12(id + 0.5);
    float h1 = hash12(id + 19.5);
    float h2 = hash12(id + 41.5);
    float h3 = hash12(id + 67.5);
    // the glint: somewhere in its cell, so that the grid never shows
    vec2 center = id + 0.5 + 0.6 * (vec2(h0, h1) - 0.5);
    vec2 cw = center * cell;
    vec2 st = vec2(cw.x * cs.x - cw.y * cs.y, cw.x * cs.y + cw.y * cs.x) / aspect + 0.5;
    if (st.x < 0.0 || st.x > 1.0 || st.y < 0.0 || st.y > 1.0) continue;
    // each glint reads one image: it blinks out at its own moment of the crossfade and comes back
    // on the incoming image
    float turn = 0.15 + 0.7 * h3;
    vec4 src = m < turn ? getFromColor(st) : getToColor(st);
    float lum = dot(src.rgb, vec3(0.2126, 0.7152, 0.0722)) * src.a;
    // the brighter the image, the more of its cells sparkle
    float knee = threshold + 0.8 * (1.0 - threshold) * h2;
    float b = smoothstep(knee, knee + 0.2 * (1.0 - threshold) + 1e-3, lum);
    if (b <= 0.0) continue;
    // each glint twinkles at its own pace
    float twinkle = (0.6 + 0.4 * sin(6.2831853 * (h2 + (1.5 + h0) * p))) * smoothstep(0.0, 0.12, abs(m - turn));
    float len = REACH * amount * (0.45 + 0.55 * b) * (0.3 + 0.7 * h1 * h1) * (0.85 + 0.15 * twinkle);
    vec2 d = q - center;
    float r = length(d);
    float star = ray(d, len, width) + ray(d.yx, len, width);
    if (diagonals) {
      vec2 e = vec2(d.x + d.y, d.x - d.y) * 0.70710678;
      star += 0.5 * (ray(e, 0.25 * len, width) + ray(e.yx, 0.25 * len, width));
    }
    // a bright core and a faint halo
    float cr = r / (0.08 * len);
    star += exp(-cr * cr) + 0.3 * exp(-r / 0.2);
    // white light with the hue of the highlight, and rainbow fringes toward the tips
    float along = r / len;
    vec3 hue = mix(vec3(1.0), spectrum(1.3 * along + h0), rainbow * smoothstep(0.05, 0.4, along));
    vec3 col = mix(src.rgb / max(max(src.r, max(src.g, src.b)), 1e-3), vec3(1.0), 0.6);
    light += b * twinkle * star * hue * col;
  }
  light *= tint * intensity * amount * amount;
  // compressed, so that crossing rays never flatten into white
  light = 1.0 - exp(-light);
  return vec4(clamp(base + light - base * light, 0.0, 1.0), c.a);
}
`,author:"gre",license:"MIT",description:"The bright points of the outgoing image sparkle into crisp four-point star glints that swell and twinkle up to the cut, then shrink back into the highlights of the incoming image, which stays sharp",tags:["light","glints","sparkle","dissolve"],params:{size:{type:"float",default:.15,min:.02,max:.3,description:"Length of the longest rays of the glints at the peak, in frame heights"},threshold:{type:"float",default:.6,min:0,max:1,description:"Brightness above which the image sparkles"},intensity:{type:"float",default:2,min:0,max:4,description:"Brightness of the glints"},diagonals:{type:"bool",default:!1,description:"Add a shorter, softer pair of diagonal rays to each glint"},rotation:{type:"float",default:0,min:-45,max:45,description:"Angle of the cross, in degrees"},rainbow:{type:"float",default:.35,min:0,max:1,description:"Rainbow fringes along the rays"},tint:{type:"vec3",default:[1,.95,.85],color:!0,description:"Tint of the glints, added as light"}},textures:[],createdAt:"Thu, 5 Nov 2026 11:34:15 +0100",updatedAt:"Thu, 5 Nov 2026 11:34:15 +0100"},{name:"GlitchBands",paramsTypes:{ampx:"float",ampy:"float"},defaultParams:{ampx:1,ampy:1},glsl:`// Author: Yoni Maltsman @friendlyspinach
// License: MIT
// Description: A crossfade with glitchy horizontal bands and color shifts
// Tags: glitch, blend



// @param Horizontal amplitude of the glitch
uniform float ampx; // =1.0
// @param Vertical amplitude of the glitch
uniform float ampy; //=1.0

vec4 transition (vec2 uv) {
  vec4 from = getFromColor(uv);
  vec4 to = getToColor(uv);
  float r = from.r;
  float g = from.g;
  float b = from.b;
  float sphere = r*r + g*g + b*b - 1.0; //3 to 1
  float spiralX = cos(sphere - uv.x/(progress + .01));
  float spiralY = sin(sphere - uv.y/(progress+.01));
  vec2 st = uv;
  st.x = fract(ampx*st.x*spiralX); //1 to 2
  st.y = fract(ampy*st.y*spiralY);
  vec2 diff = uv - st;
  from = getFromColor(uv + progress*diff);
  return mix(from, to, progress);
}
`,author:"Yoni Maltsman @friendlyspinach",license:"MIT",description:"A crossfade with glitchy horizontal bands and color shifts",tags:["glitch","blend"],params:{ampx:{type:"float",default:1,description:"Horizontal amplitude of the glitch"},ampy:{type:"float",default:1,description:"Vertical amplitude of the glitch"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"GlitchDisplace",paramsTypes:{},defaultParams:{},glsl:`// Author: Matt DesLauriers
// License: MIT
// Description: Blocks of the image are displaced in a glitch that flashes into the incoming image
// Tags: glitch, displace

float random(vec2 co)
{
    float a = 12.9898;
    float b = 78.233;
    float c = 43758.5453;
    float dt= dot(co.xy ,vec2(a,b));
    float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}
float voronoi( in vec2 x ) {
    vec2 p = floor( x );
    vec2 f = fract( x );
    float res = 8.0;
    for( float j=-1.; j<=1.; j++ )
    for( float i=-1.; i<=1.; i++ ) {
        vec2  b = vec2( i, j );
        vec2  r = b - f + random( p + b );
        float d = dot( r, r );
        res = min( res, d );
    }
    return sqrt( res );
}

vec2 displace(vec4 tex, vec2 texCoord, float dotDepth, float textureDepth, float strength) {
    float b = voronoi(.003 * texCoord + 2.0);
    float g = voronoi(0.2 * texCoord);
    float r = voronoi(texCoord - 1.0);
    vec4 dt = tex * 1.0;
    vec4 dis = dt * dotDepth + 1.0 - tex * textureDepth;

    dis.x = dis.x - 1.0 + textureDepth*dotDepth;
    dis.y = dis.y - 1.0 + textureDepth*dotDepth;
    dis.x *= strength;
    dis.y *= strength;
    vec2 res_uv = texCoord ;
    res_uv.x = res_uv.x + dis.x - 0.0;
    res_uv.y = res_uv.y + dis.y;
    return res_uv;
}

float ease1(float t) {
  return t == 0.0 || t == 1.0
    ? t
    : t < 0.5
      ? +0.5 * pow(2.0, (20.0 * t) - 10.0)
      : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;
}
float ease2(float t) {
  return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);
}



vec4 transition(vec2 uv) {
  vec2 p = uv.xy / vec2(1.0).xy;
  vec4 color1 = getFromColor(p);
  vec4 color2 = getToColor(p);
  vec2 disp = displace(color1, p, 0.33, 0.7, 1.0-ease1(progress));
  vec2 disp2 = displace(color2, p, 0.33, 0.5, ease2(progress));
  vec4 dColor1 = getToColor(disp);
  vec4 dColor2 = getFromColor(disp2);
  float val = ease1(progress);
  vec3 gray = vec3(dot(min(dColor2, dColor1).rgb, vec3(0.299, 0.587, 0.114)));
  dColor2 = vec4(gray * 2.0, dColor2.a);
  color1 = mix(color1, dColor2, smoothstep(0.0, 0.5, progress));
  color2 = mix(color2, dColor1, smoothstep(1.0, 0.5, progress));
  return mix(color1, color2, val);
  //gl_FragColor = mix(gl_FragColor, dColor, smoothstep(0.0, 0.5, progress));

   //gl_FragColor = mix(texture2D(from, p), texture2D(to, p), progress);
}
`,author:"Matt DesLauriers",license:"MIT",description:"Blocks of the image are displaced in a glitch that flashes into the incoming image",tags:["glitch","displace"],params:{},textures:[],createdAt:"Tue, 30 May 2017 14:53:04 -0400",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"GlitchFlicker",paramsTypes:{frameRate:"float",rgbOffset:"float",blockAmount:"float",ghostAmount:"float",redCyan:"float",scanline:"float"},defaultParams:{frameRate:24,rgbOffset:.014,blockAmount:.72,ghostAmount:.62,redCyan:.58,scanline:.075},glsl:`// Author: bread
// License: MIT
// Description: A flickering glitch with RGB offset, ghosting and scanlines that flashes back to the outgoing image
// Tags: glitch, flicker, chromatic, scanlines
// Drop_Zone_Flicker.glsl
// gl-transitions compatible: progress, ratio, getFromColor, getToColor
uniform float frameRate;    // = 24.0
uniform float rgbOffset;    // = 0.014
uniform float blockAmount;  // = 0.72
uniform float ghostAmount;  // = 0.62
uniform float redCyan;      // = 0.58
uniform float scanline;     // = 0.075

float sat(float x) {
  return clamp(x, 0.0, 1.0);
}

float hash12(vec2 p) {
  p = fract(p * vec2(443.8975, 397.2973));
  p += dot(p, p.yx + 19.19);
  return fract(p.x * p.y);
}

vec2 safeUv(vec2 uv) {
  return clamp(uv, vec2(0.001), vec2(0.999));
}

// 24fps reference-matched reveal curve.
// Non-monotonic on purpose: the reference flashes back to the old clip.
float frameReveal(float f) {
  if (f < 0.5) return 0.00;
  if (f < 1.5) return 0.28;
  if (f < 2.5) return 0.43;
  if (f < 3.5) return 0.46;
  if (f < 4.5) return 0.38;
  if (f < 5.5) return 0.48;
  if (f < 6.5) return 0.26;
  if (f < 7.5) return 0.10;
  if (f < 8.5) return 0.00;
  if (f < 9.5) return 0.00;
  if (f < 10.5) return 0.30;
  if (f < 11.5) return 0.58;
  if (f < 12.5) return 1.00;
  if (f < 13.5) return 0.70;
  if (f < 14.5) return 0.42;
  if (f < 15.5) return 0.55;
  if (f < 16.5) return 0.72;
  if (f < 17.5) return 0.88;
  if (f < 18.5) return 0.34;
  if (f < 19.5) return 0.48;
  if (f < 20.5) return 0.56;
  if (f < 21.5) return 0.76;
  if (f < 22.5) return 0.93;
  return 1.00;
}

float frameGlitch(float f) {
  if (f < 0.5) return 0.00;
  if (f < 6.5) return 0.92;
  if (f < 10.5) return 0.38;
  if (f < 11.5) return 0.78;
  if (f < 12.5) return 0.12;
  if (f < 17.5) return 0.74;
  if (f < 22.5) return 0.88;
  if (f < 23.5) return 0.28;
  return 0.00;
}

vec4 chromaFrom(vec2 uv, float amt) {
  vec2 o = vec2(amt, 0.0);
  vec4 center = getFromColor(safeUv(uv));
  return vec4(
    getFromColor(safeUv(uv + o)).r,
    center.g,
    getFromColor(safeUv(uv - o)).b,
    center.a
  );
}

vec4 chromaTo(vec2 uv, float amt) {
  vec2 o = vec2(amt, 0.0);
  vec4 center = getToColor(safeUv(uv));
  return vec4(
    getToColor(safeUv(uv - o)).r,
    center.g,
    getToColor(safeUv(uv + o)).b,
    center.a
  );
}

float blockMask(vec2 uv, float f) {
  vec2 big = floor(uv * vec2(4.0, 2.0));
  vec2 small = floor(uv * vec2(8.0, 4.0));

  float wide = step(0.48, hash12(vec2(big.x, f * 1.37)));
  float chunks = step(0.56, hash12(small + vec2(f * 2.11, f * 0.73)));

  float verticalCut = smoothstep(
    -0.035,
    0.035,
    uv.x - mix(0.18, 0.78, hash12(vec2(f, 4.7)))
  );

  return sat(mix(wide, chunks, 0.38) * 0.72 + verticalCut * 0.28);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  float f = floor(progress * frameRate);
  float reveal = frameReveal(f);
  float glitch = frameGlitch(f);

  float rnd = hash12(vec2(f, 9.13));
  vec2 jitter = vec2(
    (rnd - 0.5) * 0.042,
    (hash12(vec2(f, 2.71)) - 0.5) * 0.010
  ) * glitch;

  vec2 fromUv = safeUv(uv + jitter);
  vec2 toUv = safeUv(uv - jitter * 0.55);

  float block = blockMask(uv, f);
  float localReveal = sat(
    reveal +
    (block - 0.5) * blockAmount * glitch +
    (hash12(vec2(f, floor(uv.y * 9.0))) - 0.5) * 0.18 * glitch
  );

  localReveal = smoothstep(0.22, 0.78, localReveal);

  vec4 oldClip = chromaFrom(fromUv, rgbOffset * glitch);
  vec4 newClip = chromaTo(toUv, rgbOffset * glitch);

  vec4 color = mix(oldClip, newClip, localReveal);

  float leftWash = (1.0 - smoothstep(0.10, 0.78, uv.x)) * glitch;
  float cyanWash = smoothstep(0.08, 0.62, uv.x) * (1.0 - smoothstep(0.86, 1.0, uv.x)) * glitch;

  vec3 redGhost = oldClip.rgb * vec3(1.34, 0.42, 0.38);
  vec3 cyanGhost = newClip.rgb * vec3(0.48, 1.12, 1.24);

  color.rgb = mix(color.rgb, redGhost, leftWash * redCyan * 0.42);
  color.rgb = mix(color.rgb, cyanGhost, cyanWash * redCyan * 0.30);

  // Keeps the old circular "drop zone" visible as a translucent flash,
  // especially after the first full new-frame hit.
  float oldReturn = glitch * (1.0 - smoothstep(0.94, 1.0, reveal));
  oldReturn *= 0.18 + 0.52 * (1.0 - abs(localReveal - 0.5) * 2.0);
  color.rgb = mix(color.rgb, oldClip.rgb, oldReturn * ghostAmount);

  float lines = sin((uv.y + f * 0.017) * 1080.0);
  color.rgb += lines * scanline * glitch;

  float exposurePulse = (hash12(vec2(f, 12.4)) - 0.35) * 0.10 * glitch;
  color.rgb += exposurePulse;

  return vec4(sat(color.r), sat(color.g), sat(color.b), color.a);
}
`,author:"bread",license:"MIT",description:"A flickering glitch with RGB offset, ghosting and scanlines that flashes back to the outgoing image",tags:["glitch","flicker","chromatic","scanlines"],params:{frameRate:{type:"float",default:24},rgbOffset:{type:"float",default:.014},blockAmount:{type:"float",default:.72},ghostAmount:{type:"float",default:.62},redCyan:{type:"float",default:.58},scanline:{type:"float",default:.075}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"GlitchMemories",paramsTypes:{},defaultParams:{},glsl:`// Author: Gunnar Roth
// based on work from natewave
// License: MIT
// Description: A crossfade with glitchy, color-shifted blocks
// Tags: glitch, chromatic, blend
vec4 transition(vec2 p) {
  vec2 block = floor(p.xy / vec2(16));
  vec2 uv_noise = block / vec2(64);
  uv_noise += floor(vec2(progress) * vec2(1200.0, 3500.0)) / vec2(64);
  vec2 dist = progress > 0.0 ? (fract(uv_noise) - 0.5) * 0.3 *(1.0 -progress) : vec2(0.0);
  vec2 red = p + dist * 0.2;
  vec2 green = p + dist * .3;
  vec2 blue = p + dist * .5;

  vec4 center = mix(getFromColor(green), getToColor(green), progress);
  return vec4(mix(getFromColor(red), getToColor(red), progress).r, center.g, mix(getFromColor(blue), getToColor(blue), progress).b, center.a);
}

`,author:"Gunnar Roth",license:"MIT",description:"A crossfade with glitchy, color-shifted blocks",tags:["glitch","chromatic","blend"],params:{},textures:[],createdAt:"Wed, 21 Feb 2018 00:52:15 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"GlitterDissolve",paramsTypes:{tiles:"float",hexagons:"bool",sparkle:"float",glint:"vec3",seed:"float",backColor:"vec4"},defaultParams:{tiles:20,hexagons:!1,sparkle:1,glint:[1,.97,.9],seed:0,backColor:[.04,.04,.05,1]},glsl:`// Author: gre
// License: MIT
// Description: The image becomes a shimmering field of tiny diamond sequins that flip over in 3D at random moments, each lifting and tilting on its own axis and flashing a glint of light, and land on the incoming image
// Tags: tiles, flip, 3d, sparkle, dissolve

// @range(6, 60) Number of tiles stacked across the height of the frame
uniform float tiles; // = 20.0
// @param Hexagonal tiles instead of diamonds
uniform bool hexagons; // = false
// @range(0, 2) Strength of the glints the tiles catch as they turn
uniform float sparkle; // = 1.0
// @color Color of the glints, added as light
uniform vec3 glint; // = vec3(1.0, 0.97, 0.9)
// @range(0, 100) Changes the order and the axes of the flips (whole numbers)
uniform float seed; // = 0.0
// @color Color seen behind a tile while it is edge-on
uniform vec4 backColor; // = vec4(0.04, 0.04, 0.05, 1.0)

// share of the transition each tile takes to flip over
const float FLIP = 0.28;
// how much a tile grows as it lifts toward the viewer, halfway through its flip
const float LIFT = 0.3;
// width of the soft edge of the tiles, in tiles
const float EDGE = 0.04;
// the grid is shifted off the pixel centers, so that no pixel sits right on the border of two tiles
const vec2 SHIFT = vec2(0.37, 0.21);
const float PI = 3.14159265;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// folds uv back into 0..1, so the tiles on the border of the frame stay filled
vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

// how far the tile has flipped, 0 before it starts and 1 once it has landed
float flipOf(vec2 id) {
  float t = clamp((progress - hash12(id) * (1.0 - FLIP)) / FLIP, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

// the direction perpendicular to the axis the tile turns around
vec2 axisOf(vec2 id) {
  float a = 2.0 * PI * hash12(id + 41.7);
  return vec2(cos(a), sin(a));
}

// the point of the flat tile seen at offset s from its center, through the foreshortening and the lift
vec2 unproject(vec2 s, vec2 n, float f) {
  float c = abs(cos(PI * f));
  float along = dot(s, n);
  return (s + n * (along / max(c, 1e-4) - along)) / (1.0 + LIFT * sin(PI * f));
}

// 0.5 on the edges of a tile one unit tall: a diamond one unit wide, or a flat-top hexagon
float shape(vec2 v) {
  v = abs(v);
  return hexagons ? max(v.y, dot(v, vec2(0.8660254, 0.5))) : v.x + v.y;
}

// the id of the tile centered at center
vec2 idOf(vec2 center) {
  // the centers sit on multiples of (0.866, 0.5) for hexagons, of (0.5, 0.5) for diamonds
  vec2 grid = hexagons ? vec2(1.1547005, 2.0) : vec2(2.0);
  return floor(center * grid + 0.5) + vec2(13.0, 7.0) * floor(seed) + 3.0;
}

// how much of the flipping tile centered at center covers the point p, with an edge soft on screen
float coverOf(vec2 p, vec2 center) {
  vec2 id = idOf(center);
  float f = flipOf(id);
  if (f <= 0.0 || f >= 1.0) return 0.0;
  float z = sin(PI * f);
  // the tile is foreshortened by |cos| along its axis and grown by the lift
  float onScreen = (1.0 + LIFT * z) * max(abs(cos(PI * f)), 0.15);
  // the edge softens in as the tile starts turning, so that nothing pops
  float edge = EDGE * min(1.0, 4.0 * z) + 1e-4;
  return clamp((0.5 - shape(unproject(p - center, axisOf(id), f))) * onScreen / edge, 0.0, 1.0);
}

// the flipping tile centered at center, seen at the point p: shaded, with its glint
vec4 tileColor(vec2 p, vec2 center) {
  vec2 id = idOf(center);
  float f = flipOf(id);
  vec2 n = axisOf(id);
  float c = cos(PI * f);
  float z = sin(PI * f);
  vec2 s0 = unproject(p - center, n, f);
  vec2 suv = mirrored((center + s0 - SHIFT) / tiles / vec2(ratio, 1.0) + 0.5);
  vec4 col = c > 0.0 ? getFromColor(suv) : getToColor(suv);
  // the face turned to the viewer, slightly cupped like a sequin, lit from the top left
  vec3 nrm = normalize(vec3(n * z * (c < 0.0 ? -1.0 : 1.0) + 0.5 * s0, abs(c)));
  vec3 L = normalize(vec3(-0.3, 0.4, 1.0));
  float shade = 0.45 + 0.55 * clamp(dot(nrm, L) / L.z, 0.0, 1.6);
  // a glint where the face mirrors the light toward the viewer, and on the rim when edge-on
  vec3 H = normalize(vec3(-0.45, 0.55, 1.0));
  float spec = smoothstep(0.94, 0.995, dot(nrm, H)) * 2.0 + pow(1.0 - abs(c), 6.0) * 0.6;
  vec3 light = clamp(glint * sparkle * spec * z, 0.0, 1.0);
  vec3 base = clamp(col.rgb * mix(1.0, shade, z), 0.0, 1.0);
  return vec4(base + light - base * light, col.a);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  // in units where the tiles are one unit tall
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0) * tiles + SHIFT;
  // the center of the tile of the pixel
  vec2 home;
  if (hexagons) {
    vec2 s = vec2(1.7320508, 1.0);
    vec2 a = mod(p, s) - 0.5 * s;
    vec2 b = mod(p - 0.5 * s, s) - 0.5 * s;
    home = dot(a, a) < dot(b, b) ? p - a : p - b;
  } else {
    // a square grid turned by 45 degrees
    vec2 q = floor(vec2(p.x + p.y, p.y - p.x)) + 0.5;
    home = vec2(q.x - q.y, q.x + q.y) * 0.5;
  }

  // what lies under the flipping tiles: the image while the own tile rests, else the backing
  float fHome = flipOf(idOf(home));
  vec4 under = fHome <= 0.0 ? getFromColor(uv) : fHome >= 1.0 ? getToColor(uv) : backColor;

  // the two topmost flipping tiles at the pixel, among its own and the lifted neighbours
  // reaching over it: the higher a tile is in its flip, the closer it is to the viewer
  float z1 = -1.0;
  float z2 = -1.0;
  float cover1 = 0.0;
  float cover2 = 0.0;
  vec2 center1 = home;
  vec2 center2 = home;
  for (int k = 0; k < 9; k++) {
    float fk = float(k);
    vec2 off;
    if (hexagons) {
      if (k > 6) break;
      off = k == 0 ? vec2(0.0) : k < 3 ? vec2(0.0, fk * 2.0 - 3.0) : vec2(mod(fk, 2.0) * 1.7320508 - 0.8660254, fk < 5.0 ? -0.5 : 0.5);
    } else {
      vec2 o = vec2(mod(fk, 3.0) - 1.0, floor(fk / 3.0) - 1.0);
      off = vec2(o.x - o.y, o.x + o.y) * 0.5;
    }
    vec2 center = home + off;
    float cover = coverOf(p, center);
    if (cover <= 0.0) continue;
    float z = sin(PI * flipOf(idOf(center)));
    if (z > z1) {
      z2 = z1;
      cover2 = cover1;
      center2 = center1;
      z1 = z;
      cover1 = cover;
      center1 = center;
    } else if (z > z2) {
      z2 = z;
      cover2 = cover;
      center2 = center;
    }
  }
  if (z1 < 0.0) return under;
  vec4 c = under;
  if (z2 >= 0.0 && cover1 < 1.0) c = mix(c, tileColor(p, center2), cover2);
  return mix(c, tileColor(p, center1), cover1);
}
`,author:"gre",license:"MIT",description:"The image becomes a shimmering field of tiny diamond sequins that flip over in 3D at random moments, each lifting and tilting on its own axis and flashing a glint of light, and land on the incoming image",tags:["tiles","flip","3d","sparkle","dissolve"],params:{tiles:{type:"float",default:20,min:6,max:60,description:"Number of tiles stacked across the height of the frame"},hexagons:{type:"bool",default:!1,description:"Hexagonal tiles instead of diamonds"},sparkle:{type:"float",default:1,min:0,max:2,description:"Strength of the glints the tiles catch as they turn"},glint:{type:"vec3",default:[1,.97,.9],color:!0,description:"Color of the glints, added as light"},seed:{type:"float",default:0,min:0,max:100,description:"Changes the order and the axes of the flips (whole numbers)"},backColor:{type:"vec4",default:[.04,.04,.05,1],color:!0,description:"Color seen behind a tile while it is edge-on"}},textures:[],createdAt:"Sat, 7 Nov 2026 13:50:41 +0100",updatedAt:"Sat, 7 Nov 2026 13:50:41 +0100"},{name:"GlowDissolve",paramsTypes:{uLineWidth:"float",uSpreadClr:"vec3",uHotClr:"vec3",uPow:"float",uIntensity:"float"},defaultParams:{uLineWidth:.1,uSpreadClr:[1,0,0],uHotClr:[.9,.9,.2],uPow:5,uIntensity:1},glsl:`// Author: hjm1fb
// License: MIT
// Description: The incoming image spreads over the outgoing one with a hot, glowing edge
// Tags: dissolve, burn, glow

uniform float uLineWidth; // = 0.1
// @color Color of the spreading edge
uniform vec3 uSpreadClr; // = vec3(1.0, 0.0, 0.0)
// @color Color of the hottest part of the edge
uniform vec3 uHotClr; // = vec3(0.9, 0.9, 0.2)
uniform float uPow; // = 5.0
uniform float uIntensity; // = 1.0

vec2 hash(vec2 p)  // replace this by something better
{
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(in vec2 p) {
  const float K1 = 0.366025404;  // (sqrt(3)-1)/2;
  const float K2 = 0.211324865;  // (3-sqrt(3))/6;

  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
  return dot(n, vec3(70.0));
}

vec4 transition(vec2 uv) {
  vec4 from = getFromColor(uv);
  vec4 to = getToColor(uv);
  vec4 outColor;
  float burn;
  burn = 0.5 + 0.5 * (0.299 * from.r + 0.587 * from.g + 0.114 * from.b);

  float show = burn - progress;
  if (show < 0.001) {
    outColor = to;
  } else {
    float factor = 1.0 - smoothstep(0.0, uLineWidth, show);
    vec3 burnColor = mix(uSpreadClr, uHotClr, factor);
    burnColor = pow(burnColor, vec3(uPow)) * uIntensity;
    vec3 finalRGB = mix(from.rgb, burnColor, factor * step(0.0001, progress));
    outColor = vec4(finalRGB, from.a); // straight alpha, like the images
  }
  return outColor;
}
`,author:"hjm1fb",license:"MIT",description:"The incoming image spreads over the outgoing one with a hot, glowing edge",tags:["dissolve","burn","glow"],params:{uLineWidth:{type:"float",default:.1},uSpreadClr:{type:"vec3",default:[1,0,0],color:!0,description:"Color of the spreading edge"},uHotClr:{type:"vec3",default:[.9,.9,.2],color:!0,description:"Color of the hottest part of the edge"},uPow:{type:"float",default:5},uIntensity:{type:"float",default:1}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"GooeyWipe",paramsTypes:{blobs:"float",smoothness:"float",highlight:"vec4",shadow:"vec4"},defaultParams:{blobs:5,smoothness:.5,highlight:[1,1,1,.7],shadow:[0,0,0,.3]},glsl:`// Author: gre
// License: MIT
// Description: Soft, glossy blobs of liquid pop up over the outgoing image, swell and melt into each other, revealing the incoming image until they cover the whole frame
// Tags: blob, liquid, organic, reveal

// @range(2, 12, 1) Number of blobs across the frame
uniform float blobs; // = 5.0
// @range(0, 1) How smoothly neighbouring blobs melt into each other
uniform float smoothness; // = 0.5
// @color Color of the glossy highlight on the rim of the blobs (its alpha is its strength)
uniform vec4 highlight; // = vec4(1.0, 1.0, 1.0, 0.7)
// @color Color of the soft shadow that the blobs cast on the outgoing image
uniform vec4 shadow; // = vec4(0.0, 0.0, 0.0, 0.3)

float hash (vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 fold (vec2 p) {
  return 1.0 - abs(1.0 - mod(p, 2.0));
}

// signed distance to the blob of a grid cell (in cells), its center returned in .yz
vec3 blob (vec2 cell, float rStart, float rEnd) {
  vec2 c = cell + 0.5 + 0.7 * (vec2(hash(cell + 0.5), hash(cell + 41.3)) - 0.5);
  float t0 = 0.02 + 0.43 * hash(cell + 17.9); // when it pops up
  float s = clamp((progress - t0) / (1.0 - t0), 0.0, 1.0);
  // it pops up fast with a little wobble, then swells slowly
  float pop = clamp((progress - t0) / 0.12, 0.0, 1.0);
  pop = 1.0 - (1.0 - pop) * (1.0 - pop) * (1.0 - pop);
  float r = mix(rStart, 0.18, pop) + (rEnd - 0.18) * s * sqrt(s);
  r += 0.05 * sin(pop * 9.0) * (1.0 - s) * pop;
  return vec3(r, c);
}

vec4 transition (vec2 uv) {
  float n = max(1.0, floor(blobs + 0.5));
  float cellSize = max(ratio, 1.0) / n;
  vec2 q = vec2(uv.x * ratio, uv.y) / cellSize; // in cells
  vec2 base = floor(q);
  float k = 0.02 + 0.25 * smoothness; // melting distance, in cells
  float w = 0.16; // width of the rounded rim, in cells
  // a blob starts far enough below the surface not to show (the union of 49 blobs bulges by up to k * log(49)),
  // and ends up covering the whole of its cell (its center is at most 0.85 * sqrt(2) cells away) and its rim
  float rStart = -(0.03 + 4.0 * k);
  float rEnd = 0.85 * sqrt(2.0) + w + 0.05;
  // smooth union (log-sum-exp, computed online) of the blobs around, with its gradient;
  // blobs further than 3 cells away weigh less than exp(-7) and are left out
  float m = 1e3; // distance to the nearest blob
  float sum = 0.0;
  vec2 grad = vec2(0.0);
  float rNear = 0.0; // radius of the nearest blob
  for (int j = -3; j <= 3; j++) {
    for (int i = -3; i <= 3; i++) {
      vec3 b = blob(base + vec2(float(i), float(j)), rStart, rEnd);
      vec2 dq = q - b.yz;
      float l = length(dq);
      float dist = l - b.x;
      vec2 g = dq / max(l, 1e-4);
      if (dist < m) {
        float scale = exp((dist - m) / k);
        sum = sum * scale + 1.0;
        grad = grad * scale + g;
        m = dist;
        rNear = b.x;
      } else {
        float wt = exp((m - dist) / k);
        sum += wt;
        grad += wt * g;
      }
    }
  }
  float d = m - k * log(sum); // < 0 inside the goo
  grad /= sum;
  float aa = 0.012 * n / 5.0;
  float inside = 1.0 - smoothstep(-aa, aa, d);
  // a rounded, glossy surface near the edge, flat further inside; the goo settles flat at the end
  float h = clamp(-d / w, 0.0, 1.0);
  float settle = 1.0 - smoothstep(0.45, 0.85, progress);
  float tilt = (1.0 - h) * (1.0 - h) * settle;
  vec3 nrm = normalize(vec3(grad * tilt * 3.0, 1.0));
  vec3 halfway = normalize(vec3(-0.35, 0.45, 1.0) + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(nrm, halfway), 0.0), 200.0) * settle;
  // thick, opaque goo: darker toward its edge, more so on the side away from the light
  float shade = 1.0 - tilt * (0.25 + 0.3 * clamp(dot(grad, vec2(0.6, -0.8)) + 0.3, 0.0, 1.0));
  vec4 to = getToColor(fold(uv - grad * tilt * 0.01 * cellSize / vec2(ratio, 1.0)));
  float t2 = tilt * tilt;
  float gloss = 0.3 * t2 * t2; // a thin bright line right on the rim
  to.rgb = mix(to.rgb * shade, highlight.rgb, clamp(spec + gloss, 0.0, 1.0) * highlight.a);
  vec4 from = getFromColor(uv);
  float sh = shadow.a * (1.0 - smoothstep(0.0, 0.15, d + 0.03)) * smoothstep(0.0, 0.3, rNear);
  from.rgb = mix(from.rgb, shadow.rgb, sh);
  return mix(from, to, inside);
}
`,author:"gre",license:"MIT",description:"Soft, glossy blobs of liquid pop up over the outgoing image, swell and melt into each other, revealing the incoming image until they cover the whole frame",tags:["blob","liquid","organic","reveal"],params:{blobs:{type:"float",default:5,min:2,max:12,step:1,description:"Number of blobs across the frame"},smoothness:{type:"float",default:.5,min:0,max:1,description:"How smoothly neighbouring blobs melt into each other"},highlight:{type:"vec4",default:[1,1,1,.7],color:!0,description:"Color of the glossy highlight on the rim of the blobs (its alpha is its strength)"},shadow:{type:"vec4",default:[0,0,0,.3],color:!0,description:"Color of the soft shadow that the blobs cast on the outgoing image"}},textures:[],createdAt:"Sun, 1 Nov 2026 20:35:40 +0100",updatedAt:"Sun, 1 Nov 2026 20:35:40 +0100"},{name:"GravityLens",paramsTypes:{center:"vec2",strength:"float",glow:"float",hole:"vec4"},defaultParams:{center:[.5,.5],strength:.6,glow:.6,hole:[0,0,0,1]},glsl:`// Author: gre
// License: MIT
// Description: A black disk appears and grows, bending the outgoing image around it like a heavy mass bends light: the image is stretched into a bright ring at the disk's edge and swallowed until the frame is black, then the disk shrinks back, unbending the incoming image
// Tags: distort, lens, space, circular, dark

// Center of the disk
uniform vec2 center; // = vec2(0.5, 0.5)
// @range(0, 1.5) How strongly the light bends: radius of the lensed ring beyond the disk's edge, in disk radii
uniform float strength; // = 0.6
// @range(0, 1) Brightness of the lensed ring and of the thin ring of light hugging the disk's edge
uniform float glow; // = 0.6
// @color Color of the disk
uniform vec4 hole; // = vec4(0.0, 0.0, 0.0, 1.0)

// how far past the farthest corner the disk grows, so the frame is fully covered for a brief moment
const float OVERSHOOT = 0.12;
// moment the frame is black: the swallow takes a little longer than the release
const float PEAK = 0.55;
// half width of the antialiased edge of the disk, in frame heights
const float AA = 0.002;
// tint of the light piled up around the disk
const vec3 WARM = vec3(1.0, 0.86, 0.68);

// fold the coordinates back into the frame, so the image stays filled without smearing its border
vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

vec4 transition(vec2 uv) {
  // the disk grows with an accelerating swallow, then shrinks back a little faster: exactly 0 at both ends
  bool swallowing = progress < PEAK;
  float u = swallowing ? progress / PEAK : (1.0 - progress) / (1.0 - PEAK);
  float u2 = u * u;
  float k = u2 * (0.6 + 0.4 * u2);

  // measured in frame heights, so the disk is round
  vec2 aspect = vec2(ratio, 1.0);
  vec2 far = max(center, 1.0 - center) * aspect;
  float rh = length(far) * (1.0 + OVERSHOOT) * k;
  // radius where the light coming from right behind the disk shows up as a ring
  float re = rh * (1.0 + max(strength, 0.0));

  vec2 d = (uv - center) * aspect;
  float r = max(length(d), 1e-5);
  // a point mass deflects the light by an angle falling off as 1/r
  vec2 q = mirrored(center + d * (1.0 - re * re / (r * r)) / aspect);
  vec4 c = swallowing ? getFromColor(q) : getToColor(q);
  // the shading fades in with the disk, so it is exactly 0 at both ends
  float amount = smoothstep(0.0, 0.04, rh);
  // the second, flipped image squeezed between the ring and the disk is dimmer
  float inner = clamp((r - rh) / (re - rh + 1e-4), 0.0, 1.0);
  c.rgb *= 1.0 - 0.7 * amount * (1.0 - inner * inner * (3.0 - 2.0 * inner));

  // light piles up into a ring where the image is most stretched, and into a thin ring hugging the edge
  float g = max(glow, 0.0) * amount;
  float einstein = (r - re) / (0.3 * (re - rh) + 0.01);
  float photon = max(r - rh, 0.0) / (0.006 + 0.012 * rh);
  float light = g * (0.7 * exp(-einstein * einstein) + 1.6 * exp(-photon * photon));
  c.rgb = min(c.rgb * (1.0 + light) + WARM * (0.35 * light * c.a), vec3(1.0));

  // antialiased horizon, kept inside the disk so it vanishes with it
  float cov = clamp((rh - r) / (2.0 * AA), 0.0, 1.0);
  return mix(c, hole, cov);
}
`,author:"gre",license:"MIT",description:"A black disk appears and grows, bending the outgoing image around it like a heavy mass bends light: the image is stretched into a bright ring at the disk's edge and swallowed until the frame is black, then the disk shrinks back, unbending the incoming image",tags:["distort","lens","space","circular","dark"],params:{center:{type:"vec2",default:[.5,.5]},strength:{type:"float",default:.6,min:0,max:1.5,description:"How strongly the light bends: radius of the lensed ring beyond the disk's edge, in disk radii"},glow:{type:"float",default:.6,min:0,max:1,description:"Brightness of the lensed ring and of the thin ring of light hugging the disk's edge"},hole:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color of the disk"}},textures:[],createdAt:"Sun, 8 Nov 2026 21:29:33 +0100",updatedAt:"Sun, 8 Nov 2026 21:29:33 +0100"},{name:"GridFlip",paramsTypes:{size:"ivec2",pause:"float",dividerWidth:"float",bgcolor:"vec4",randomness:"float"},defaultParams:{size:[4,4],pause:.1,dividerWidth:.05,bgcolor:[0,0,0,1],randomness:.1},glsl:`// License: MIT
// Author: TimDonselaar
// Description: The image splits into a grid of cards that lift apart and turn over in perspective one after another, each one showing its part of the incoming image on its back
// Tags: grid, tiles, flip, 3d
// ported by gre from https://gist.github.com/TimDonselaar/9bcd1c4b5934ba60087bdb55c2ea92e5

// @param Number of tiles (columns, rows)
uniform ivec2 size; // = ivec2(4)
// @range(0, 0.4) Part of the transition at the start and at the end during which the gaps between the tiles open and close
uniform float pause; // = 0.1
// @range(0, 0.4) Width of the gaps between the tiles, as a part of a tile's shorter side
uniform float dividerWidth; // = 0.05
// @color Color behind the tiles
uniform vec4 bgcolor; // = vec4(0.0, 0.0, 0.0, 1.0)
// @range(0, 1) How much the order of the flips is shuffled, from a diagonal wave across the grid to random
uniform float randomness; // = 0.1

const float PI = 3.141592653589793;
// width of the anti-aliased edges, as a part of the frame's height
const float EDGE = 0.0012;
// distance of the eye from each tile, in tile sizes
const float EYE = 2.2;
// part of the flips during which the last tile waits for its turn
const float STAGGER = 0.55;
// light direction (x, y over z): from the upper left, in front of the frame
const vec2 LIGHT = vec2(-0.45, 0.3);

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

// eased turn: smooth start and landing, without lingering at either end
float easeInOut(float t) {
  return mix(t, t * t * (3.0 - 2.0 * t), 0.7);
}

// time the gaps take to open and to close
float pausePart() {
  return clamp(pause, 0.05, 0.4);
}

// the turn of a tile, 0 showing the outgoing image to 1 showing the incoming one,
// at q the progress of the flips and with stagger the delay of the last tile
float flipTime(vec2 cell, vec2 grid, float q, float stagger) {
  // a diagonal wave from the top left corner, shuffled by randomness
  float wave = (cell.x + (grid.y - 1.0 - cell.y)) / max(grid.x + grid.y - 2.0, 1.0);
  float order = mix(wave, hash12(cell + 7.31), clamp(randomness, 0.0, 1.0));
  return easeInOut(clamp((q - order * stagger) / (1.0 - stagger), 0.0, 1.0));
}

// how open the gaps are: they open at the start and close at the end
float gapAmount() {
  float pp = pausePart();
  return smoothstep(0.0, pp, progress) * (1.0 - smoothstep(1.0 - pp, 1.0, progress));
}

// coverage of a signed distance (positive inside) with an edge of width e
float aa(float d, float e) {
  return clamp(d / max(2.0 * e, 1e-6) + 0.5, 0.0, 1.0);
}

float boxShadow(vec2 p, vec2 halfSize, float blur) {
  vec2 d = abs(p) - halfSize;
  float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  return 1.0 - smoothstep(-blur, blur, dist);
}

vec4 transition(vec2 uv) {
  vec2 grid = max(vec2(size), 1.0);
  vec2 frame = vec2(ratio, 1.0);
  vec2 tileSize = frame / grid;
  vec2 cell = clamp(floor(uv * grid), vec2(0.0), grid - 1.0);
  vec2 pos = uv * frame;
  float gapOpen = gapAmount();
  float minSide = min(tileSize.x, tileSize.y);
  float gap = clamp(dividerWidth, 0.0, 0.4) * minSide * gapOpen;
  vec2 halfTile = 0.5 * tileSize - gap;
  float eye = EYE * max(tileSize.x, tileSize.y);
  // the flips start while the gaps finish opening, and end while they start closing
  float pp = 0.6 * pausePart();
  float q = clamp((progress - pp) / (1.0 - 2.0 * pp), 0.0, 1.0);
  // a single tile takes all the time to turn
  float stagger = grid.x * grid.y > 1.5 ? STAGGER : 0.0;

  // the two nearest layers of the tiles that cover this point
  vec4 c1 = vec4(0.0);
  vec4 c2 = vec4(0.0);
  float m1 = 0.0;
  float m2 = 0.0;
  float z1 = 1e9;
  float z2 = 1e9;
  bool rest1 = true;
  bool rest2 = true;
  float shadowBg = 0.0;
  float shadowFlip = 0.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 nc = cell + vec2(float(i), float(j));
      if (nc.x < 0.0 || nc.y < 0.0 || nc.x > grid.x - 1.0 || nc.y > grid.y - 1.0) continue;
      float t = flipTime(nc, grid, q, stagger);
      float a = PI * t;
      float ca = cos(a);
      float sa = sin(a);
      bool rest = t <= 0.0 || t >= 1.0;
      if (rest) {
        ca = t <= 0.0 ? 1.0 : -1.0;
        sa = 0.0;
      }
      vec2 center = (nc + 0.5) * tileSize;
      vec2 q = pos - center;

      // shadows on the background: the tiles float a little above it, and higher while they turn
      float lift = 0.05 * gapOpen * minSide + 0.35 * halfTile.x * sa;
      vec2 shOffset = -LIGHT * lift;
      vec2 shHalf = vec2(halfTile.x * abs(ca) + 0.5 * lift, halfTile.y);
      float sh = boxShadow(q - shOffset, shHalf, 0.01 * minSide + 0.5 * lift);
      shadowBg = 1.0 - (1.0 - shadowBg) * (1.0 - 0.45 * gapOpen * sh);
      shadowFlip = max(shadowFlip, 0.45 * sa * sa * sh);

      // ray from the eye in front of the tile's center, through this point, to the turned tile
      // the tile turns around its vertical axis: its local x axis is (ca, 0, -sa), its normal (sa, 0, ca)
      float den = eye * ca - q.x * sa;
      if (abs(den) < 1e-6) continue;
      float s = eye * ca / den;
      if (s <= 0.0) continue;
      vec3 hit = vec3(s * q.x, s * q.y, eye * (1.0 - s));
      float u = hit.x * ca - hit.z * sa;
      // the edges seen on screen, to anti-alias them
      float xa = halfTile.x * ca * eye / (eye + halfTile.x * sa);
      float xb = -halfTile.x * ca * eye / (eye - halfTile.x * sa);
      float dx = min(q.x - min(xa, xb), max(xa, xb) - q.x);
      float dy = (halfTile.y - abs(hit.y)) / s;
      // soft edges, except where the tiles touch each other
      float e = max(min(EDGE, gap), EDGE * min(8.0 * sa, 1.0));
      float m = aa(min(dx, dy), e);
      if (m <= 0.0) continue;

      // the front shows the outgoing image, the back the incoming one, seen from behind
      bool front = ca > 0.0;
      vec2 src = (center + vec2(front ? u : -u, hit.y)) / frame;
      vec4 col = front ? getFromColor(src) : getToColor(src);
      if (!rest) {
        // lit from the upper left: the turning side facing the light brightens a little, the other darkens
        float nx = front ? sa : -sa;
        float lit = abs(ca) + nx * LIGHT.x;
        col.rgb *= mix(0.35, 1.0, clamp(lit, 0.0, 1.0)) + 0.25 * max(lit - 1.0, 0.0);
        // a thin bright rim on the edges of the turning card
        col.rgb += 0.12 * sa * (1.0 - smoothstep(0.0, 3.0 * EDGE, min(dx, dy)));
      }

      if (s < z1) {
        c2 = c1; m2 = m1; z2 = z1; rest2 = rest1;
        c1 = col; m1 = m; z1 = s; rest1 = rest;
      } else if (s < z2) {
        c2 = col; m2 = m; z2 = s; rest2 = rest;
      }
    }
  }

  // the flipping tiles cast their shadows on the background and on the tiles lying still
  vec4 color = bgcolor;
  color.rgb *= 1.0 - clamp(max(shadowBg, shadowFlip), 0.0, 1.0);
  if (rest2) c2.rgb *= 1.0 - shadowFlip;
  if (rest1) c1.rgb *= 1.0 - shadowFlip;
  color = mix(color, c2, m2);
  color = mix(color, c1, m1);
  return color;
}
`,author:"TimDonselaar",license:"MIT",description:"The image splits into a grid of cards that lift apart and turn over in perspective one after another, each one showing its part of the incoming image on its back",tags:["grid","tiles","flip","3d"],params:{size:{type:"ivec2",default:[4,4],description:"Number of tiles (columns, rows)"},pause:{type:"float",default:.1,min:0,max:.4,description:"Part of the transition at the start and at the end during which the gaps between the tiles open and close"},dividerWidth:{type:"float",default:.05,min:0,max:.4,description:"Width of the gaps between the tiles, as a part of a tile's shorter side"},bgcolor:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color behind the tiles"},randomness:{type:"float",default:.1,min:0,max:1,description:"How much the order of the flips is shuffled, from a diagonal wave across the grid to random"}},textures:[],createdAt:"Mon, 12 Jun 2017 11:32:51 +0800",updatedAt:"Sat, 7 Nov 2026 18:51:43 +0100"},{name:"Halftone",paramsTypes:{dots:"float",angle:"float",paper:"vec4"},defaultParams:{dots:28,angle:45,paper:[1,1,1,1]},glsl:`// Author: gre
// License: MIT
// Description: The image breaks into printed halftone dots whose size follows its shades, the dots reshape into the incoming image, then merge back into it
// Tags: dots, pattern, retro

// @range(4, 80) Number of dots across the shorter side
uniform float dots; // = 28.0
// @range(0, 90) Angle of the dot grid, in degrees
uniform float angle; // = 45.0
// @color Color of the paper between the dots
uniform vec4 paper; // = vec4(1.0, 1.0, 1.0, 1.0)

// Dot radius, in cells, of a halftone printing this color (darker is bigger)
float dotRadius(vec4 c) {
  float shade = 1.0 - dot(c.rgb, vec3(0.299, 0.587, 0.114));
  return mix(0.1, 0.74, sqrt(clamp(shade, 0.0, 1.0))) * c.a;
}

vec4 transition(vec2 uv) {
  // the image turns into dots until 0.3, the dots reshape from left to right, then merge back from 0.7
  float h = smoothstep(0.0, 0.3, progress) * (1.0 - smoothstep(0.7, 1.0, progress));
  float t = (progress - 0.3) / 0.4;
  // rotated square grid, in cells
  float a = radians(angle);
  mat2 rot = mat2(cos(a), sin(a), -sin(a), cos(a));
  vec2 scale = vec2(ratio, 1.0) * dots / min(ratio, 1.0);
  vec2 g = rot * ((uv - 0.5) * scale);
  vec2 base = floor(g - 0.5) + 0.5;
  vec4 pixel = progress < 0.5 ? getFromColor(uv) : getToColor(uv);
  // the dots of the 4 nearest cells may overlap this point: keep the one it is deepest in
  float best = 1e3;
  vec4 ink = pixel;
  for (int i = 0; i < 4; i++) {
    vec2 center = base + vec2(mod(float(i), 2.0), floor(float(i) / 2.0));
    vec2 cuv = (center * rot) / scale + 0.5; // inverse rotation
    vec4 cf = getFromColor(cuv);
    vec4 ct = getToColor(cuv);
    float m = smoothstep(0.0, 1.0, clamp(2.5 * t - 1.5 * cuv.x, 0.0, 1.0));
    // at h = 0, the dots cover their whole cell with the image itself
    float r = mix(0.78, mix(dotRadius(cf), dotRadius(ct), m), h);
    float sd = length(g - center) - r;
    if (sd < best) {
      best = sd;
      ink = mix(pixel, mix(cf, ct, m), h);
    }
  }
  return mix(paper, ink, 1.0 - smoothstep(-0.06, 0.06, best));
}
`,author:"gre",license:"MIT",description:"The image breaks into printed halftone dots whose size follows its shades, the dots reshape into the incoming image, then merge back into it",tags:["dots","pattern","retro"],params:{dots:{type:"float",default:28,min:4,max:80,description:"Number of dots across the shorter side"},angle:{type:"float",default:45,min:0,max:90,description:"Angle of the dot grid, in degrees"},paper:{type:"vec4",default:[1,1,1,1],color:!0,description:"Color of the paper between the dots"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:26:58 +0100",updatedAt:"Sat, 31 Oct 2026 18:26:58 +0100"},{name:"HeartWipe",paramsTypes:{center:"vec2",smoothness:"float",pulse:"float",glowColor:"vec3",glow:"float"},defaultParams:{center:[.5,.5],smoothness:.006,pulse:.5,glowColor:[1,.85,.9],glow:.3},glsl:`// Author: gre
// License: MIT
// Description: A heart grows from the center with a little heartbeat to reveal the incoming image
// Tags: shape, wipe, heart

// @param Center of the heart
uniform vec2 center; // = vec2(0.5, 0.5)
// @range(0, 0.1) Softness of the heart's edge
uniform float smoothness; // = 0.006
// @range(0, 1) Strength of the heartbeat throb as the heart grows
uniform float pulse; // = 0.5
// @color Color of the soft light glowing along the heart's edge
uniform vec3 glowColor; // = vec3(1.0, 0.85, 0.9)
// @range(0, 1) Strength of the glow (0 for a clean edge)
uniform float glow; // = 0.3

// The heart shape: tip at (0, 0), notch at (0, 1), lobes are circles of radius sqrt(2)/4
// centered at (+-0.25, 0.75), tangent to the lines y = |x|. HEART_O is its center.
#define HEART_O vec2(0.0, 0.55)
#define LOBE vec2(0.25, 0.75)
#define LOBE_R 0.35355339

float dot2(vec2 v) { return dot(v, v); }

// Exact signed distance to the heart
float sdHeart(vec2 p) {
  p.x = abs(p.x);
  if (p.x + p.y > 1.0) return sqrt(dot2(p - LOBE)) - LOBE_R;
  return sqrt(min(dot2(p - vec2(0.0, 1.0)), dot2(p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}

// Scale of the smallest heart (centered on HEART_O) that contains p: the heart is the union of a
// lobe disk and the triangle |x| <= y, |x| + y <= 1, both convex around HEART_O, so the boundary
// along a ray is the farthest of their exits.
float heartScale(vec2 p) {
  float l = length(p);
  if (l < 1e-6) return 0.0;
  vec2 d = vec2(abs(p.x), p.y) / l;
  vec2 m = HEART_O - LOBE;
  float b = dot(m, d);
  float tDisk = -b + sqrt(b * b - dot2(m) + LOBE_R * LOBE_R);
  float tSide = d.x > d.y ? HEART_O.y / (d.x - d.y) : 1e6;
  float tTop = d.x + d.y > 0.0 ? (1.0 - HEART_O.y) / (d.x + d.y) : 1e6;
  return l / max(tDisk, min(tSide, tTop));
}

vec4 transition (vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  vec2 asp = vec2(ratio, 1.0);
  vec2 c = center * asp;
  // Scale at which the heart covers the whole frame: the corners, plus the point of the top edge
  // in line with the notch (the only concave part of the heart)
  float cx = clamp(center.x, 0.0, 1.0) * ratio;
  float full = max(
    max(max(heartScale(vec2(0.0, 0.0) - c), heartScale(vec2(ratio, 0.0) - c)),
        max(heartScale(vec2(0.0, 1.0) - c), heartScale(vec2(ratio, 1.0) - c))),
    heartScale(vec2(cx, 1.0) - c));
  float sm = max(smoothness, 0.001);
  // Margin so the soft edge is past the frame at progress = 1
  full += 4.0 * sm;

  // Eased growth with two heartbeats riding on it: the heart surges, then almost stops
  float p = progress;
  float e = p * p * (2.0 - p);
  float env = max(sin(3.14159265 * p), 0.0);
  float beat = sin(6.28318531 * 2.0 * p) * env * env;
  float s = full * clamp(e + 0.09 * pulse * beat, 0.0, 1.0);
  if (s <= 0.0) return a;

  vec2 q = uv * asp - c;
  float d = s * sdHeart(q / s + HEART_O);
  float m = smoothstep(0.0, sm, -d);
  vec4 col = mix(a, b, m);
  // Soft light just outside the edge, faded in and out with the transition (adds no alpha)
  float light = exp(-max(d, 0.0) / (0.008 + sm)) * (1.0 - m) * glow * min(1.0, 4.0 * env);
  return col + vec4(glowColor * light, 0.0);
}
`,author:"gre",license:"MIT",description:"A heart grows from the center with a little heartbeat to reveal the incoming image",tags:["shape","wipe","heart"],params:{center:{type:"vec2",default:[.5,.5],description:"Center of the heart"},smoothness:{type:"float",default:.006,min:0,max:.1,description:"Softness of the heart's edge"},pulse:{type:"float",default:.5,min:0,max:1,description:"Strength of the heartbeat throb as the heart grows"},glowColor:{type:"vec3",default:[1,.85,.9],color:!0,description:"Color of the soft light glowing along the heart's edge"},glow:{type:"float",default:.3,min:0,max:1,description:"Strength of the glow (0 for a clean edge)"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sat, 7 Nov 2026 18:49:54 +0100"},{name:"HeatHaze",paramsTypes:{strength:"float",scale:"float",speed:"float"},defaultParams:{strength:.04,scale:6,speed:2},glsl:`// Author: gre
// License: MIT
// Description: Shimmering heat waves rise through the frame, strongest at the bottom, making the outgoing image wobble like the air over hot asphalt; the incoming image shows through the haze and settles as it calms
// Tags: distort, heat, shimmer, noise, organic, blend

// @range(0, 0.1) How far the haze bends the image, in frame heights (the strongest waves bend it about 1.5 times as far)
uniform float strength; // = 0.04
// @range(1, 12) Size of the heat waves: more, smaller ones with a larger value
uniform float scale; // = 6.0
// @range(0, 6) How fast the heat waves rise
uniform float speed; // = 2.0

// reflects coordinates that leave the frame back into it, so the edges do not smear
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

float vnoise(vec2 v) {
  vec2 i = floor(v);
  vec2 f = fract(v);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
    mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// centered on 0, within [-1.5, 1.5]
float fbm(vec2 v) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * vnoise(v);
    v = mat2(1.6, 1.2, -1.2, 1.6) * v + 5.3;
    amp *= 0.5;
  }
  return (sum / 0.9375 - 0.5) * 3.0;
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  const float PI = 3.141592653589793;
  float p = progress;
  // the haze builds up then calms down
  float amount = sin(PI * p);
  // the waves scroll upward and slowly churn as they rise
  float t = p * speed;
  // in square pixels, then squashed vertically into the thin bands of rising air
  vec2 q = vec2(uv.x * ratio, uv.y * 2.5) * scale;
  q.y -= t * scale;
  // the bands are bent by a slower, larger turbulence so they do not stay straight
  vec2 w = vec2(fbm(q * 0.35 + vec2(0.0, t)), fbm(q * 0.35 + vec2(7.1, -t)));
  q += 1.5 * w;
  vec2 offset = vec2(fbm(q), 0.5 * fbm(q + vec2(3.7, 1.9)));
  // the hot air is near the ground: strongest at the bottom, fainter at the top
  float ground = mix(1.0, 0.3, uv.y);
  offset *= strength * amount * ground * vec2(1.0 / ratio, 1.0);

  vec2 d = mirror(uv + offset);
  // the images swap in the thick of the haze
  float m = smoothstep(0.3, 0.7, p);
  if (m <= 0.0) return getFromColor(d);
  if (m >= 1.0) return getToColor(d);
  vec4 a = getFromColor(d);
  vec4 b = getToColor(d);
  // mixed premultiplied, so transparent images do not bleed their color
  vec4 c = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"Shimmering heat waves rise through the frame, strongest at the bottom, making the outgoing image wobble like the air over hot asphalt; the incoming image shows through the haze and settles as it calms",tags:["distort","heat","shimmer","noise","organic","blend"],params:{strength:{type:"float",default:.04,min:0,max:.1,description:"How far the haze bends the image, in frame heights (the strongest waves bend it about 1.5 times as far)"},scale:{type:"float",default:6,min:1,max:12,description:"Size of the heat waves: more, smaller ones with a larger value"},speed:{type:"float",default:2,min:0,max:6,description:"How fast the heat waves rise"}},textures:[],createdAt:"Wed, 4 Nov 2026 20:12:23 +0100",updatedAt:"Wed, 4 Nov 2026 20:12:23 +0100"},{name:"Hexagonalize",paramsTypes:{steps:"int",horizontalHexagons:"float"},defaultParams:{steps:50,horizontalHexagons:20},glsl:`// Author: Fernando Kuteken
// License: MIT
// Description: Both images turn into hexagons, crossfade, then sharpen again
// Tags: pixelate, hexagon, blend
// Hexagonal math from: http://www.redblobgames.com/grids/hexagons/

uniform int steps; // = 50
// @param Number of hexagons across
uniform float horizontalHexagons; // = 20

struct Hexagon {
  float q;
  float r;
  float s;
};

Hexagon createHexagon(float q, float r){
  Hexagon hex;
  hex.q = q;
  hex.r = r;
  hex.s = -q - r;
  return hex;
}

Hexagon roundHexagon(Hexagon hex){
  
  float q = floor(hex.q + 0.5);
  float r = floor(hex.r + 0.5);
  float s = floor(hex.s + 0.5);

  float deltaQ = abs(q - hex.q);
  float deltaR = abs(r - hex.r);
  float deltaS = abs(s - hex.s);

  if (deltaQ > deltaR && deltaQ > deltaS)
    q = -r - s;
  else if (deltaR > deltaS)
    r = -q - s;
  else
    s = -q - r;

  return createHexagon(q, r);
}

Hexagon hexagonFromPoint(vec2 point, float size) {
  
  point.y /= ratio;
  point = (point - 0.5) / size;
  
  float q = (sqrt(3.0) / 3.0) * point.x + (-1.0 / 3.0) * point.y;
  float r = 0.0 * point.x + 2.0 / 3.0 * point.y;

  Hexagon hex = createHexagon(q, r);
  return roundHexagon(hex);
  
}

vec2 pointFromHexagon(Hexagon hex, float size) {
  
  float x = (sqrt(3.0) * hex.q + (sqrt(3.0) / 2.0) * hex.r) * size + 0.5;
  float y = (0.0 * hex.q + (3.0 / 2.0) * hex.r) * size + 0.5;
  
  return vec2(x, y * ratio);
}

vec4 transition (vec2 uv) {
  
  float dist = 2.0 * min(progress, 1.0 - progress);
  dist = steps > 0 ? ceil(dist * float(steps)) / float(steps) : dist;
  
  float size = (sqrt(3.0) / 3.0) * dist / horizontalHexagons;
  
  vec2 point = dist > 0.0 ? pointFromHexagon(hexagonFromPoint(uv, size), size) : uv;

  return mix(getFromColor(point), getToColor(point), progress);
  
}
`,author:"Fernando Kuteken",license:"MIT",description:"Both images turn into hexagons, crossfade, then sharpen again",tags:["pixelate","hexagon","blend"],params:{steps:{type:"int",default:50},horizontalHexagons:{type:"float",default:20,description:"Number of hexagons across"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"HingedSquares",paramsTypes:{cells:"int",shading:"float",zoom:"float"},defaultParams:{cells:5,shading:.6,zoom:.5},glsl:`// Author: gre
// License: MIT
// Description: The image is cut into squares that turn in alternate directions while staying hinged at their corners, so the sheet opens into a checkerboard of diamonds showing the incoming image; those diamonds then turn back into place and close the sheet
// Tags: grid, tiles, geometric, rotate

// @range(1, 20, 1) Number of squares across the height of the frame
uniform int cells; // = 5
// @range(0, 1) Strength of the bevel on the turning squares and of the soft shadow they cast into the gaps
uniform float shading; // = 0.6
// @range(0, 1) How much the view zooms out to keep the opening sheet in frame (0: the sheet grows past the frame edges)
uniform float zoom; // = 0.5

const float PI = 3.141592653589793;
// half width of the anti-aliased edges, as a part of the frame's height
const float EDGE = 0.0012;

// turns v clockwise by the angle whose cosine and sine are cs
vec2 rot(vec2 v, vec2 cs) {
  return vec2(cs.x * v.x + cs.y * v.y, -cs.y * v.x + cs.x * v.y);
}

// one of the 4 lattice nodes around a point
vec2 node(float i) {
  return vec2(mod(i, 2.0), floor(i * 0.5));
}

// alternate squares turn in opposite directions
float parity(vec2 n) {
  return mod(n.x + n.y, 2.0) < 0.5 ? 1.0 : -1.0;
}

// The square nearest to w among the 4 around the cell g of a hinged lattice of unit squares
// centered at (n + off) * spacing, each turned by +-the angle of cs:
// returns its local coordinates, the signed distance to it and its node index.
vec4 nearest(vec2 w, vec2 g, float spacing, vec2 off, vec2 cs) {
  vec4 best = vec4(0.0, 0.0, 1e5, 0.0);
  for (int i = 0; i < 4; i++) {
    vec2 n = g + node(float(i));
    vec2 l = rot(w - (n + off) * spacing, vec2(cs.x, parity(n) * cs.y));
    vec2 q = abs(l) - 0.5;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
    if (d < best.z) best = vec4(l, d, float(i));
  }
  return best;
}

// The gap of that lattice around w: a rhombus of unit sides centered at a node of the other
// lattice, with half diagonals cs.x and cs.y. Returns the local coordinates of the piece of the
// other image it shows, held at 45 degrees, and its node index.
vec3 gap(vec2 w, vec2 g, float spacing, vec2 off, vec2 cs) {
  vec3 best = vec3(0.0, 0.0, 0.0);
  float r = 1e5;
  for (int i = 0; i < 4; i++) {
    vec2 n = g + node(float(i));
    vec2 v = w - (n + off) * spacing;
    vec2 h = parity(n) > 0.0 ? cs.yx : cs;
    // inside the rhombus when |v.x| / h.x + |v.y| / h.y < 1, scaled by h.x * h.y to avoid dividing by 0
    float ri = abs(v.x) * h.y + abs(v.y) * h.x;
    if (ri < r) {
      r = ri;
      best = vec3(rot(v, vec2(0.7071068, parity(n) * 0.7071068)), float(i));
    }
  }
  return best;
}

// lattice coordinates (in squares, centered) to a mirrored texture uv that stays in the frame
vec2 toUV(vec2 c, float n) {
  vec2 uv = c / (n * vec2(ratio, 1.0)) + 0.5;
  return abs(mod(uv + 1.0, 2.0) - 1.0);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);
  float n = max(float(cells), 1.0);
  float e = progress * progress * (3.0 - 2.0 * progress);
  float a = 0.5 * PI * e;
  // turn of the squares in front: 0 to 45 degrees for the outgoing ones, then 45 to 0 for the incoming ones
  float th = min(a, 0.5 * PI - a);
  // the hinged lattice spreads while it opens
  vec2 cs = vec2(cos(th), sin(th));
  float spacing = cs.x + cs.y;
  float scale = n * mix(1.0, spacing, clamp(zoom, 0.0, 1.0));
  vec2 w = (uv - 0.5) * vec2(ratio, 1.0) * scale;
  bool first = a < 0.25 * PI;
  vec2 offF = first ? vec2(0.0) : vec2(0.5);
  vec2 offB = vec2(0.5) - offF;
  vec2 gF = floor(w / spacing - offF);
  vec2 gB = floor(w / spacing - offB);
  // front: the turning squares; back: the pieces of the other image held at 45 degrees in the gaps
  vec4 f = nearest(w, gF, spacing, offF, cs);
  vec3 b = gap(w, gB, spacing, offB, cs);
  vec2 nf = gF + node(f.w);
  vec2 nb = gB + node(b.z);
  vec2 uvF = toUV(nf + offF + f.xy, n);
  vec2 uvB = toUV(nb + offB + b.xy, n);
  vec4 colF = first ? getFromColor(uvF) : getToColor(uvF);
  vec4 colB = first ? getToColor(uvB) : getFromColor(uvB);

  // relief: none when the sheet is closed or fully open, strongest in between
  float depth = clamp(shading, 0.0, 1.0) * sin(4.0 * th);
  // soft shadow cast by the front squares toward the lower right
  if (depth > 0.0) {
    vec2 ws = w - vec2(0.12, -0.12) * depth;
    vec4 sh = nearest(ws, floor(ws / spacing - offF), spacing, offF, cs);
    colB.rgb *= 1.0 - 0.75 * depth * (1.0 - smoothstep(-0.12, 0.25, sh.z));
  }
  // bevel lit from the upper left, along each square's nearest side
  vec2 side = abs(f.x) > abs(f.y) ? vec2(sign(f.x), 0.0) : vec2(0.0, sign(f.y));
  float facing = dot(rot(side, vec2(cs.x, -parity(nf) * cs.y)), vec2(-0.7071, 0.7071));
  float rim = smoothstep(-0.07, -0.01, f.z);
  colF.rgb *= 1.0 + 0.35 * depth * rim * facing;

  // anti-aliased edges; the squares overlap a little to hide the gaps until they are a few pixels wide
  float aa = EDGE * scale;
  float seal = aa * (1.0 - smoothstep(0.0, 3.0 * aa, cs.y));
  float cover = 1.0 - smoothstep(-aa, aa, f.z - seal);
  return mix(colB, colF, cover);
}
`,author:"gre",license:"MIT",description:"The image is cut into squares that turn in alternate directions while staying hinged at their corners, so the sheet opens into a checkerboard of diamonds showing the incoming image; those diamonds then turn back into place and close the sheet",tags:["grid","tiles","geometric","rotate"],params:{cells:{type:"int",default:5,min:1,max:20,step:1,description:"Number of squares across the height of the frame"},shading:{type:"float",default:.6,min:0,max:1,description:"Strength of the bevel on the turning squares and of the soft shadow they cast into the gaps"},zoom:{type:"float",default:.5,min:0,max:1,description:"How much the view zooms out to keep the opening sheet in frame (0: the sheet grows past the frame edges)"}},textures:[],createdAt:"Fri, 13 Nov 2026 08:21:02 +0100",updatedAt:"Fri, 13 Nov 2026 08:21:02 +0100"},{name:"Hologram",paramsTypes:{tint:"vec3",background:"vec4",scanlines:"float",jitter:"float",flicker:"float"},defaultParams:{tint:[.2,.75,1],background:[0,.02,.05,1],scanlines:150,jitter:.04,flicker:.6},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image turns into a flickering hologram (blue by default) with scanlines and jittering rows, breaks up, and the hologram resolves into the incoming image in full color
// Tags: hologram, sci-fi, scanlines, flicker, glitch

// @color Color of the hologram
uniform vec3 tint; // = vec3(0.2, 0.75, 1.0)
// @color Color behind the hologram, seen between its scanlines and where it breaks up
uniform vec4 background; // = vec4(0.0, 0.02, 0.05, 1.0)
// @range(20, 300) Number of scanlines over the frame height
uniform float scanlines; // = 150.0
// @range(0, 0.2) How far rows of the hologram jump sideways, relative to the frame width
uniform float jitter; // = 0.04
// @range(0, 1) Strength of the flicker and of the rows that drop out
uniform float flicker; // = 0.6

const float PI = 3.14159265;
// steps per transition of the flicker and the jitter
const float STEPS = 32.0;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

vec4 premultiplied(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

// the image the hologram shows: rows switch from the outgoing image to the incoming one
// while the hologram breaks up
vec4 source(vec2 uv, float m) {
  return m > 0.5 ? getToColor(uv) : getFromColor(uv);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  float p = progress;
  // how much of the hologram shows, and how broken up it is (peaking mid-transition)
  float h = smoothstep(0.0, 0.3, p) * (1.0 - smoothstep(0.7, 1.0, p));
  float b = smoothstep(0.0, 1.0, 1.0 - abs(p - 0.5) / 0.22);
  float f = floor(p * STEPS);

  // rows of the hologram jump sideways, more while it breaks up
  float band = floor(uv.y * 36.0);
  float jump = step(1.0 - (0.2 + 0.6 * b) * h, hash(vec2(band, f)));
  float offset = (hash(vec2(band, f + 0.37)) - 0.5) * 2.0 * jitter * jump * (0.3 + 0.7 * b);
  offset += sin(uv.y * 23.0 + f * 1.7) * 0.0015 * h;
  vec2 q = uv + vec2(offset, 0.0);

  // when each row of the hologram switches to the incoming image
  float m = step(hash(vec2(floor(uv.y * 24.0), 7.0)), (p - 0.35) / 0.3);

  // the hologram: the luma of the image in the tint, with colored fringes
  // (sampled inside the frame, the fringes weighted by the alpha of their texels)
  vec4 c = source(clamp(q, 0.0, 1.0), m);
  vec2 dx = vec2(0.003 + 0.01 * b, 0.0);
  float l = luma(c.rgb);
  vec4 cr = source(clamp(q + dx, 0.0, 1.0), m);
  vec4 cb = source(clamp(q - dx, 0.0, 1.0), m);
  float lr = luma(cr.rgb) * cr.a;
  float lb = luma(cb.rgb) * cb.a;
  vec3 g = smoothstep(0.05, 0.9, vec3(lr, l, lb));
  // the brightest parts burn toward white
  vec3 holo = tint * (0.06 + 1.25 * g) + 0.45 * g * g * g;
  // brighter scan band rolling down
  float roll = fract(uv.y + 2.0 * p);
  holo += tint * 0.35 * smoothstep(0.85, 1.0, roll) * (1.0 - smoothstep(0.98, 1.0, roll));
  holo = clamp(holo, 0.0, 1.0);
  // nothing outside the image where a row jumped out of the frame
  float inside = step(0.0, q.x) * step(q.x, 1.0);

  // opacity of the hologram: scanlines, flicker and missing rows
  float lines = 0.5 + 0.5 * sin((uv.y * scanlines - p * 6.0) * 2.0 * PI);
  float vis = mix(1.0, 0.15 + 0.85 * lines, h);
  vis *= 1.0 - flicker * (0.25 + 0.75 * b) * hash(vec2(f, 3.1)) * h;
  float gap = step(hash(vec2(floor(uv.y * 90.0), f + 0.71)), flicker * 0.45 * b);
  vis *= 1.0 - gap;
  vec4 layer = vec4(holo, c.a * vis * inside);
  // the hologram over its background, transparent where neither the image nor the
  // hologram is
  vec4 plain = premultiplied(source(uv, m));
  vec4 back = premultiplied(vec4(background.rgb, background.a * max(plain.a, layer.a)));
  vec4 holoColor = premultiplied(layer) + back * (1.0 - layer.a);

  // the images in full color, then the hologram over them
  vec4 o = mix(plain, holoColor, h);
  return o.a > 0.0 ? vec4(o.rgb / o.a, o.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The outgoing image turns into a flickering hologram (blue by default) with scanlines and jittering rows, breaks up, and the hologram resolves into the incoming image in full color",tags:["hologram","sci-fi","scanlines","flicker","glitch"],params:{tint:{type:"vec3",default:[.2,.75,1],color:!0,description:"Color of the hologram"},background:{type:"vec4",default:[0,.02,.05,1],color:!0,description:"Color behind the hologram, seen between its scanlines and where it breaks up"},scanlines:{type:"float",default:150,min:20,max:300,description:"Number of scanlines over the frame height"},jitter:{type:"float",default:.04,min:0,max:.2,description:"How far rows of the hologram jump sideways, relative to the frame width"},flicker:{type:"float",default:.6,min:0,max:1,description:"Strength of the flicker and of the rows that drop out"}},textures:[],createdAt:"Wed, 4 Nov 2026 20:14:30 +0100",updatedAt:"Wed, 4 Nov 2026 20:14:30 +0100"},{name:"Honeycomb",paramsTypes:{size:"float"},defaultParams:{size:6},glsl:`// Author: gre
// License: MIT
// Description: The image splits into hexagons that spin and shrink away in a wave from the center, uncovering the incoming image
// Tags: hexagon, tiles, rotate, radial

// @range(2, 30) Number of hexagons across the shorter side
uniform float size; // = 6.0

// Distance to the center of a pointy-top hexagon, 0.5 on the edges of a cell
float hexDist(vec2 p) {
  p = abs(p);
  return max(p.x, dot(p, vec2(0.5, 0.8660254)));
}

mat2 rotation(float a) {
  return mat2(cos(a), sin(a), -sin(a), cos(a));
}

// Coverage of a hexagon turned by a and scaled by s inside its cell, with soft edges of width e
// (unturned at s = 1, it covers its whole cell)
float hexMask(vec2 local, float s, float a, float e) {
  float r = (0.52 + e) * s;
  return 1.0 - smoothstep(r - e, r, hexDist(rotation(-a) * local));
}

// Where the image is sampled, for a point of a hexagon turned by a and scaled by s
vec2 hexUv(vec2 uv, vec2 local, vec2 cellToUv, float s, float a) {
  return uv + cellToUv * (rotation(-a) * local / max(s, 0.001) - local);
}

vec4 transition(vec2 uv) {
  // nearest hexagon center, on two interleaved rectangular grids (centers 1 apart)
  vec2 toCells = vec2(ratio, 1.0) * size / min(ratio, 1.0);
  vec2 p = (uv - 0.5) * toCells;
  const vec2 grid = vec2(1.0, 1.7320508);
  vec2 a = (floor(p / grid) + 0.5) * grid;
  vec2 b = (floor((p - 0.5 * grid) / grid) + 1.0) * grid;
  vec2 center = dot(p - a, p - a) < dot(p - b, p - b) ? a : b;
  vec2 local = p - center;

  // each hexagon starts later the further it is from the center
  float d = min(length(center / toCells * vec2(ratio, 1.0)) / (0.5 * length(vec2(ratio, 1.0))), 1.0);
  float t = clamp((progress - 0.6 * d) / 0.4, 0.0, 1.0);

  // the outgoing hexagon spins (opening gaps at the corners of its cell), shrinks away and darkens,
  // casting a soft shadow on the incoming image
  float s = 1.0 - smoothstep(0.1, 1.0, t);
  float turn = 1.8 * t * (2.0 - t);
  vec4 fromTile = getFromColor(hexUv(uv, local, 1.0 / toCells, s, turn));
  fromTile.rgb *= 1.0 - 0.3 * t;
  vec4 below = getToColor(uv);
  below.rgb *= 1.0 - 0.5 * hexMask(local - vec2(0.06, -0.08) * s, s, turn, 0.2);
  return mix(below, fromTile, hexMask(local, s, turn, 0.03));
}
`,author:"gre",license:"MIT",description:"The image splits into hexagons that spin and shrink away in a wave from the center, uncovering the incoming image",tags:["hexagon","tiles","rotate","radial"],params:{size:{type:"float",default:6,min:2,max:30,description:"Number of hexagons across the shorter side"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:26:58 +0100",updatedAt:"Sat, 31 Oct 2026 18:26:58 +0100"},{name:"HorizontalClose",paramsTypes:{},defaultParams:{},glsl:`// Author: martiniti
// License: MIT
// Description: The incoming image closes in from the top and bottom edges toward the middle
// Tags: wipe, split

vec4 transition (vec2 uv) {

  float s = 2.0 - abs((uv.y - 0.5) / (progress - 1.0)) - 2.0 * progress;
  
  return mix(
    getFromColor(uv),
    getToColor(uv),
    smoothstep(0.5, 0.0, s)
  ); 
}
`,author:"martiniti",license:"MIT",description:"The incoming image closes in from the top and bottom edges toward the middle",tags:["wipe","split"],params:{},textures:[],createdAt:"Tue, 4 Apr 2023 10:35:23 +0300",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"HorizontalHold",paramsTypes:{slips:"int",shear:"float",barWidth:"float",barColor:"vec4"},defaultParams:{slips:3,shear:1.25,barWidth:.14,barColor:[.02,.02,.03,1]},glsl:`// Author: gre
// License: MIT
// Description: The picture loses its horizontal hold like an old TV: it shears into diagonal bands that slide sideways and wrap around, separated by a slanted blanking bar that carries the incoming image in, then the shear straightens, wobbles and locks
// Tags: retro, horizontal, shear, scanlines

// @range(2, 6, 1) Number of times the picture slips sideways before it locks
uniform int slips; // = 3
// @range(0, 4) How far the lines lag from top to bottom at the worst of the tearing, in picture widths
uniform float shear; // = 1.25
// @range(0, 0.5) Width of the blanking bar between the copies of the picture
uniform float barWidth; // = 0.14
// @color Color of the blanking bar
uniform vec4 barColor; // = vec4(0.02, 0.02, 0.03, 1.0)

float slipCount() {
  return max(float(slips), 1.0);
}

// The picture stream at x: outgoing copies, then incoming ones, with a bar between them
vec4 stream(float x, float y, float unsync) {
  float period = 1.0 + barWidth;
  float n = floor(x / period);
  float xm = x - n * period;
  vec2 q = vec2(min(xm, 1.0), y);
  vec4 c = n >= floor(0.5 * slipCount() + 0.5) ? getToColor(q) : getFromColor(q);
  // distance to the nearest bar, negative inside it
  float d = min(xm, 1.0 - xm);
  // the picture overshoots to white next to the bar
  float g = max(1.0 - d / 0.05, 0.0);
  c.rgb += 0.3 * unsync * g * g * c.a;
  float soft = min(0.012 * unsync, 0.5 * barWidth) + 1e-5;
  return mix(barColor, c, clamp(d / soft, 0.0, 1.0));
}

vec4 transition(vec2 uv) {
  float period = 1.0 + barWidth;
  // the sync error grows then fades; the slip is its integral, a whole number of periods
  float t = min(progress / 0.88, 1.0);
  float err = 16.0 * t * t * (1.0 - t) * (1.0 - t);
  float slip = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  // the hold overshoots and wobbles before it locks
  float u = clamp((progress - 0.74) / 0.26, 0.0, 1.0);
  float lock = u * (1.0 - u) * (1.0 - u);
  float tilt = -0.5 * max(shear, 0.5) * lock * sin(9.42478 * u);
  float unsync = min(err + 3.0 * lock, 1.0);
  // lines lower in the frame lag behind, and ripple a little
  float ripple = 0.012 * sin(uv.y * 9.0 + progress * 40.0) + 0.005 * sin(uv.y * 31.0 - progress * 70.0);
  float x = uv.x + period * (slipCount() * slip + shear * err * (1.0 - uv.y) + tilt * (1.0 - uv.y)) + err * ripple;
  // the slip smears the picture sideways
  float blur = 0.002 * err * slipCount();
  vec4 c = stream(x, uv.y, unsync);
  if (blur > 0.0) {
    for (int i = 0; i < 4; i++) {
      c += stream(x + blur * (float(i) - 1.5), uv.y, unsync);
    }
    c /= 5.0;
  }
  // the unsynced picture dims and shows its scanlines
  c.rgb *= 1.0 - unsync * (0.1 + 0.08 * sin(uv.y * 480.0));
  return c;
}
`,author:"gre",license:"MIT",description:"The picture loses its horizontal hold like an old TV: it shears into diagonal bands that slide sideways and wrap around, separated by a slanted blanking bar that carries the incoming image in, then the shear straightens, wobbles and locks",tags:["retro","horizontal","shear","scanlines"],params:{slips:{type:"int",default:3,min:2,max:6,step:1,description:"Number of times the picture slips sideways before it locks"},shear:{type:"float",default:1.25,min:0,max:4,description:"How far the lines lag from top to bottom at the worst of the tearing, in picture widths"},barWidth:{type:"float",default:.14,min:0,max:.5,description:"Width of the blanking bar between the copies of the picture"},barColor:{type:"vec4",default:[.02,.02,.03,1],color:!0,description:"Color of the blanking bar"}},textures:[],createdAt:"Fri, 13 Nov 2026 08:22:44 +0100",updatedAt:"Fri, 13 Nov 2026 08:22:44 +0100"},{name:"HorizontalOpen",paramsTypes:{},defaultParams:{},glsl:`// Author: martiniti
// License: MIT
// Description: The incoming image opens from a line in the middle toward the top and bottom edges
// Tags: wipe, split

vec4 transition (vec2 uv) {
  
  float regress = 1.0 - progress;

  float s = 2.0 - abs((uv.y - 0.5) / (regress - 1.0)) - 2.0 * regress;
  
  return mix(
    getFromColor(uv),
    getToColor(uv),
    smoothstep(0.0, 0.5, s)
  );
}
`,author:"martiniti",license:"MIT",description:"The incoming image opens from a line in the middle toward the top and bottom edges",tags:["wipe","split"],params:{},textures:[],createdAt:"Tue, 4 Apr 2023 10:35:30 +0300",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"HsvFade",paramsTypes:{},defaultParams:{},glsl:`// Author: nwoeanhinnogaehr
// License: MIT
// Description: A crossfade through the HSV color space that cycles through hues
// Tags: fade, color, hue
// Ported from https://gist.github.com/nwoeanhinnogaehr/b185145363d65751009b

// HSV functions from http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl

vec3 hsv2rgb(vec3 c) {
  const vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgb2hsv(vec3 c) {
  const vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + 0.001)), d / (q.x + 0.001), q.x);
}

vec4 transition(vec2 uv) {
  vec4 from = getFromColor(uv);
  vec4 to = getToColor(uv);
  vec3 m = mix(rgb2hsv(from.rgb), rgb2hsv(to.rgb), progress);
  return vec4(hsv2rgb(m), mix(from.a, to.a, progress));
}
`,author:"nwoeanhinnogaehr",license:"MIT",description:"A crossfade through the HSV color space that cycles through hues",tags:["fade","color","hue"],params:{},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"InkBleed",paramsTypes:{drops:"float",tendrils:"float",rim:"float",seed:"float"},defaultParams:{drops:4,tendrils:.7,rim:.5,seed:3},glsl:`// Author: gre
// License: MIT
// Description: The incoming image spreads over the outgoing one like drops of ink in water, blooming from a few points with curling, wispy edges and a darker rim, until it fills the frame
// Tags: ink, organic, fluid, noise

// @range(1, 8, 1) Number of ink drops
uniform float drops; // = 4.0
// @range(0, 1) How far the curling tendrils reach out of the blooms
uniform float tendrils; // = 0.7
// @range(0, 1) How dark the rim of ink at the front of the blooms is
uniform float rim; // = 0.5
// @param Random seed for the drop positions and the swirls
uniform float seed; // = 3.0

float hash (vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise (vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm (vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p + 7.3;
    a *= 0.5;
  }
  return v / 0.9375;
}

vec2 fold (vec2 p) {
  return 1.0 - abs(1.0 - mod(p, 2.0));
}

vec4 transition (vec2 uv) {
  float p = progress;
  vec2 q = vec2(uv.x * ratio, uv.y);
  // swirls: noise warped twice by itself, drifting as the ink spreads
  vec2 o = vec2(seed * 3.1, seed * 1.7);
  vec2 sq = q * 2.2 + o;
  vec2 w1 = vec2(fbm(sq + vec2(0.0, 0.6 * p)), fbm(sq + vec2(5.2, 1.3) - vec2(0.5 * p, 0.0)));
  vec2 w2 = vec2(fbm(sq + 3.0 * w1 + vec2(1.7, 9.2)), fbm(sq + 3.0 * w1 + vec2(8.3, 2.8)));
  float swirl = fbm(sq * 0.8 + 2.5 * w2) - 0.5; // marbled, curling pattern
  vec2 flow = w2 - 0.5;
  float amp = 0.05 + 0.35 * tendrils;
  float n = clamp(floor(drops + 0.5), 1.0, 8.0);
  float rimW = 0.1;
  float feather = 0.05; // soft, diluted ink around the front
  float margin = 1.2 * amp + rimW + 0.08; // how far the swirls can pull the front back
  float f = -1e3; // > 0 inside the ink
  float fs = -1e3; // the same, only for the drops already fallen, which fades their haze in
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    if (fi < n) {
      vec2 hs = vec2(fi * 7.13 + seed, fi * 3.71 - seed);
      vec2 c = vec2(mix(0.15, 0.85, hash(hs)) * ratio, mix(0.15, 0.85, hash(hs + 19.7)));
      float start = 0.2 * fi / n;
      float s = clamp((p - start) / (1.0 - start), 0.0, 1.0);
      // distance to the farthest corner: each bloom alone covers the frame in the end
      vec2 m = max(c, vec2(ratio, 1.0) - c);
      float far = length(m) + margin;
      float s3 = s * s * s;
      float r = (far + 0.02) * s * (0.35 + 0.65 * s3 * s3) - 0.02;
      // a drop starts round, then its front curls more and more as it spreads
      float reach = amp * min(1.0, max(r, 0.0) * 5.0);
      float g = r - length(q - c + 1.3 * reach * flow) + reach * 0.9 * swirl;
      f = max(f, g);
      fs = max(fs, g - 0.15 * (1.0 - min(1.0, s * 12.0)));
    }
  }
  float aa = 0.003;
  float inside = smoothstep(-aa, aa, f);
  // feathered wisps of diluted ink, streaked along the swirls, ahead of the front
  float wisp = 1.0 - smoothstep(0.0, 0.08, abs(fbm(sq * 2.0 + 5.0 * w2) - 0.5));
  float soft = smoothstep(-feather, 0.0, fs) * (0.35 + 0.4 * wisp);
  float haze = 0.35 * wisp * (1.0 - smoothstep(0.0, 0.1, -fs));
  float cover = max(inside, max(soft, haze));
  // the ink is denser, and still moving, close to its front
  float edge = 1.0 - smoothstep(0.0, rimW, f);
  vec4 to = getToColor(fold(uv - 0.015 * edge * flow / vec2(ratio, 1.0)));
  to.rgb = mix(to.rgb, to.rgb * to.rgb * 0.7, rim * edge);
  return mix(getFromColor(uv), to, cover);
}
`,author:"gre",license:"MIT",description:"The incoming image spreads over the outgoing one like drops of ink in water, blooming from a few points with curling, wispy edges and a darker rim, until it fills the frame",tags:["ink","organic","fluid","noise"],params:{drops:{type:"float",default:4,min:1,max:8,step:1,description:"Number of ink drops"},tendrils:{type:"float",default:.7,min:0,max:1,description:"How far the curling tendrils reach out of the blooms"},rim:{type:"float",default:.5,min:0,max:1,description:"How dark the rim of ink at the front of the blooms is"},seed:{type:"float",default:3,description:"Random seed for the drop positions and the swirls"}},textures:[],createdAt:"Sun, 1 Nov 2026 20:34:30 +0100",updatedAt:"Sun, 1 Nov 2026 20:34:30 +0100"},{name:"InsetWipe",paramsTypes:{anchor:"vec2",smoothness:"float",borderWidth:"float",borderColor:"vec4",reverse:"bool"},defaultParams:{anchor:[1,1],smoothness:0,borderWidth:0,borderColor:[1,1,1,1],reverse:!1},glsl:`// Author: gre
// License: MIT
// Description: A rectangle anchored in a corner, on an edge or in the center grows until the incoming image fills the frame, revealing it in place without scaling it; in reverse, the outgoing image shrinks into the rectangle
// Tags: wipe, shape, box

// @param Where the rectangle grows from: (0, 0) bottom left, (1, 1) top right, (0.5, 0) middle of the bottom edge, (0.5, 0.5) center
uniform vec2 anchor; // = vec2(1.0, 1.0)
// @range(0, 0.2) Softness of the rectangle's edge
uniform float smoothness; // = 0.0
// @range(0, 0.1) Width of a border drawn around the rectangle, in frame heights (0: no border)
uniform float borderWidth; // = 0.0
// @color Color of the border
uniform vec4 borderColor; // = vec4(1.0, 1.0, 1.0, 1.0)
// @param The outgoing image shrinks into the rectangle instead, toward the anchor
uniform bool reverse; // = false

// half width of the antialiased edge, in frame heights
const float AA = 0.001;

vec4 premultiplied(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

vec4 transition(vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  if (progress <= 0.0) return a;
  if (progress >= 1.0) return b;

  vec2 an = clamp(anchor, 0.0, 1.0);
  vec2 sq = vec2(ratio, 1.0);
  // the rectangle keeps the proportions that make it reach every far side of the frame
  // at once; measured in square pixels so its edge and border have an even width
  vec2 ext = max(an, 1.0 - an) * sq;
  vec2 d = abs(uv - an) * sq;
  float s = max(smoothness, AA);
  float bw = max(borderWidth, 0.0);

  // eased growth, from a rectangle whose border is not yet in the frame to one whose
  // soft edge has left it on every side
  float t = reverse ? 1.0 - progress : progress;
  float p = mix(t, t * t * (3.0 - 2.0 * t), 0.3);
  vec2 size = p * ext + mix(-(bw + s), s, p);
  // signed distance to the rectangle's edge, square-cornered, < 0 inside
  float e = max(d.x - size.x, d.y - size.y);

  // the rectangle shows the incoming image, or the outgoing one in reverse
  vec4 inside = reverse ? a : b;
  vec4 c = premultiplied(reverse ? b : a);
  if (bw > 0.0) {
    // laid over the image outside the rectangle, so a translucent border tints it
    float m = 1.0 - smoothstep(bw - s, bw + s, e);
    c = premultiplied(borderColor) * m + c * (1.0 - borderColor.a * m);
  }
  c = mix(c, premultiplied(inside), 1.0 - smoothstep(-s, s, e));
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"A rectangle anchored in a corner, on an edge or in the center grows until the incoming image fills the frame, revealing it in place without scaling it; in reverse, the outgoing image shrinks into the rectangle",tags:["wipe","shape","box"],params:{anchor:{type:"vec2",default:[1,1],description:"Where the rectangle grows from: (0, 0) bottom left, (1, 1) top right, (0.5, 0) middle of the bottom edge, (0.5, 0.5) center"},smoothness:{type:"float",default:0,min:0,max:.2,description:"Softness of the rectangle's edge"},borderWidth:{type:"float",default:0,min:0,max:.1,description:"Width of a border drawn around the rectangle, in frame heights (0: no border)"},borderColor:{type:"vec4",default:[1,1,1,1],color:!0,description:"Color of the border"},reverse:{type:"bool",default:!1,description:"The outgoing image shrinks into the rectangle instead, toward the anchor"}},textures:[],createdAt:"Thu, 5 Nov 2026 07:31:05 +0100",updatedAt:"Thu, 5 Nov 2026 11:34:33 +0100"},{name:"InsideCube",paramsTypes:{direction:"vec2",fov:"float",shading:"float",background:"vec4"},defaultParams:{direction:[1,0],fov:90,shading:.6,background:[.09,.09,.1,1]},glsl:`// Author: gre
// License: MIT
// Description: The camera stands inside a cube: the outgoing image covers the wall in front of it and the view turns toward the next inner wall, so the outgoing image swings away in perspective as the incoming one turns into view, the walls darkening into the shaded inner corner between them
// Tags: 3d, cube, rotate, perspective, directional

// @param Direction the view turns toward, snapped to its main axis (left, right, up or down): the incoming image is on the wall on that side
uniform vec2 direction; // = vec2(1.0, 0.0)
// @range(60, 120) Field of view along the turn, in degrees: at 90 the camera stays at the center of the cube, a wider view makes the walls recede more
uniform float fov; // = 90.0
// @range(0, 1) How much the walls darken as they turn away, and the shadow in the inner corners of the cube
uniform float shading; // = 0.6
// @color Color of the other faces of the cube, seen where the two walls leave the frame uncovered during the turn
uniform vec4 background; // = vec4(0.09, 0.09, 0.1, 1.0)

const float PI = 3.141592653589793;
// width of the anti-aliased edges, in frame heights
const float EDGE = 0.002;

vec4 premultiply(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

// shadow of a concave edge of the cube, at a distance dist from it
float cornerShadow(float dist, float size) {
  float k = 1.0 - smoothstep(0.0, size, dist);
  return k * k;
}

// the image on a wall at the point l of the wall, in frame heights from its center (l.x along
// the turn, l.y across), premultiplied; s and vertical undo the mirroring and the swap of axes
// that transition() applies to the frame coordinates
vec4 wallColor(vec2 l, bool incoming, bool vertical, float s) {
  vec2 h = vec2(l.x * s, l.y);
  vec2 p = vertical ? h.yx : h;
  vec2 st = clamp(p / vec2(ratio, 1.0) + 0.5, 0.0, 1.0);
  return premultiply(incoming ? getToColor(st) : getFromColor(st));
}

vec4 transition(vec2 uv) {
  bool vertical = abs(direction.y) > abs(direction.x);
  float s = (vertical ? direction.y : direction.x) < 0.0 ? -1.0 : 1.0;
  // q.x: along the turn, toward the incoming wall; q.y: across; in frame heights
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0);
  vec2 q = vertical ? p.yx : p;
  q.x *= s;
  // half sizes of a wall along and across the turn
  float A = vertical ? 0.5 : 0.5 * ratio;
  float B = vertical ? 0.5 * ratio : 0.5;
  // focal length: a wall exactly fills the frame when seen square from that distance
  // (below about 53 degrees the camera would stand outside the cube)
  float F = A / tan(radians(clamp(fov, 55.0, 170.0)) * 0.5);

  float e = smoothstep(0.0, 1.0, progress);
  float th = 0.5 * PI * e;
  float c = cos(th);
  float sn = sin(th);
  float amount = max(sin(PI * e), 0.0); // 0 at both ends, so the images are untouched there
  float aa = EDGE * min(1.0, 40.0 * amount) + 1e-6;
  float shadow = shading * min(1.0, 4.0 * amount);

  // in the plane of the turn (a: along, z: depth), the outgoing wall is z = F, a in [-A, A],
  // the incoming wall is a = A, z in [F - 2A, F]; the camera starts in front of the center of
  // the first one and ends in front of the center of the second one
  vec2 cam = (A - F) * e * vec2(1.0, -1.0);
  vec2 d = vec2(q.x * c + F * sn, F * c - q.x * sn);

  // the inner corner between the two walls projects to a line across the frame
  vec2 P = vec2(A, F) - cam;
  float sc = F * (P.x * c - P.y * sn) / max(P.x * sn + P.y * c, 1e-6);

  // outgoing wall
  float tf = d.y > 1e-6 ? (F - cam.y) / d.y : 1e6;
  float af = cam.x + tf * d.x;
  vec2 lf = vec2(af, q.y * tf);
  // incoming wall
  float ti = d.x > 1e-6 ? (A - cam.x) / d.x : 1e6;
  float ai = (F - A) - (cam.y + ti * d.y);
  vec2 li = vec2(ai, q.y * ti);

  // each wall darkens as it turns away from the view, and toward the concave edges
  float size = 0.8 * min(A, B);
  float edgeF = cornerShadow(A - af, size) + 0.5 * cornerShadow(B - abs(lf.y), size);
  float edgeI = cornerShadow(ai + A, size) + 0.5 * cornerShadow(B - abs(li.y), size);
  float shadeF = (1.0 - shading * 0.8 * (1.0 - c)) * (1.0 - 0.7 * shadow * min(edgeF, 1.0));
  float shadeI = (1.0 - shading * 0.8 * (1.0 - sn)) * (1.0 - 0.7 * shadow * min(edgeI, 1.0));

  // how much of the pixel each wall covers, from distances on screen in frame heights: split at
  // the corner line, cut across by the edges of the walls (lb = q.y * t), and at their far
  // edges (along the wall, a moves F * t / d.depth times faster than q.x)
  float wF = clamp(0.5 + (sc - q.x) / aa, 0.0, 1.0);
  float covF = wF * clamp(0.5 + (B / tf - abs(q.y)) / aa, 0.0, 1.0)
    * clamp(0.5 + (af + A) * d.y / (tf * F * aa), 0.0, 1.0);
  float covI = (1.0 - wF) * clamp(0.5 + (B / ti - abs(q.y)) / aa, 0.0, 1.0)
    * clamp(0.5 + (A - ai) * d.x / (ti * F * aa), 0.0, 1.0);
  // only sample the walls that show in this pixel
  vec4 colF = covF > 0.0 ? wallColor(lf, false, vertical, s) : vec4(0.0);
  vec4 colI = covI > 0.0 ? wallColor(li, true, vertical, s) : vec4(0.0);
  colF.rgb *= shadeF;
  colI.rgb *= shadeI;

  // the other faces of the cube, with the same shadow along their edges with the two walls
  vec4 bg = premultiply(background);
  float cov = covF + covI;
  if (cov < 1.0) {
    // where the ray meets the floor or the ceiling, never beyond the walls
    float tb = min(B / max(abs(q.y), 1e-6), min(tf, ti));
    vec2 fl = cam + tb * d;
    float edgeB = cornerShadow(F - fl.y, size) + cornerShadow(A - fl.x, size);
    bg.rgb *= 1.0 - 0.5 * shadow * min(edgeB, 1.0);
  }
  vec4 col = colF * covF + colI * covI + bg * (1.0 - cov);
  return col.a > 0.0 ? vec4(col.rgb / col.a, col.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The camera stands inside a cube: the outgoing image covers the wall in front of it and the view turns toward the next inner wall, so the outgoing image swings away in perspective as the incoming one turns into view, the walls darkening into the shaded inner corner between them",tags:["3d","cube","rotate","perspective","directional"],params:{direction:{type:"vec2",default:[1,0],description:"Direction the view turns toward, snapped to its main axis (left, right, up or down): the incoming image is on the wall on that side"},fov:{type:"float",default:90,min:60,max:120,description:"Field of view along the turn, in degrees: at 90 the camera stays at the center of the cube, a wider view makes the walls recede more"},shading:{type:"float",default:.6,min:0,max:1,description:"How much the walls darken as they turn away, and the shadow in the inner corners of the cube"},background:{type:"vec4",default:[.09,.09,.1,1],color:!0,description:"Color of the other faces of the cube, seen where the two walls leave the frame uncovered during the turn"}},textures:[],createdAt:"Sat, 7 Nov 2026 18:51:09 +0100",updatedAt:"Sat, 7 Nov 2026 18:51:09 +0100"},{name:"InvertedPageCurl",paramsTypes:{},defaultParams:{},glsl:`// Author: Hewlett-Packard
// License: BSD 3 Clause
// Description: The outgoing image curls away like a page, revealing the incoming one
// Tags: page, curl, 3d
// Adapted by Sergey Kosarevsky from:
// http://rectalogic.github.io/webvfx/examples_2transition-shader-pagecurl_8html-example.html

/*
Copyright (c) 2010 Hewlett-Packard Development Company, L.P. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

   * Redistributions of source code must retain the above copyright
     notice, this list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above
     copyright notice, this list of conditions and the following disclaimer
     in the documentation and/or other materials provided with the
     distribution.
   * Neither the name of Hewlett-Packard nor the names of its
     contributors may be used to endorse or promote products derived from
     this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
in vec2 texCoord;
*/

const float MIN_AMOUNT = -0.16;
const float MAX_AMOUNT = 1.5;

const float PI = 3.141592653589793;

const float scale = 512.0;
const float sharpness = 3.0;

const float cylinderRadius = 1.0 / PI / 2.0;

// These depend on the progress uniform and must be computed per-fragment.
// Global initializers with uniforms are invalid in GLSL ES and fail on Mesa.
float amount;
float cylinderCenter;
float cylinderAngle;

vec3 hitPoint(float hitAngle, float yc, vec3 point, mat3 rrotation)
{
        float hitPoint = hitAngle / (2.0 * PI);
        point.y = hitPoint;
        return rrotation * point;
}

vec4 antiAlias(vec4 color1, vec4 color2, float distanc)
{
        distanc *= scale;
        if (distanc < 0.0) return color2;
        if (distanc > 2.0) return color1;
        float dd = pow(1.0 - distanc / 2.0, sharpness);
        return ((color2 - color1) * dd) + color1;
}

float distanceToEdge(vec3 point)
{
        float dx = abs(point.x > 0.5 ? 1.0 - point.x : point.x);
        float dy = abs(point.y > 0.5 ? 1.0 - point.y : point.y);
        if (point.x < 0.0) dx = -point.x;
        if (point.x > 1.0) dx = point.x - 1.0;
        if (point.y < 0.0) dy = -point.y;
        if (point.y > 1.0) dy = point.y - 1.0;
        if ((point.x < 0.0 || point.x > 1.0) && (point.y < 0.0 || point.y > 1.0)) return sqrt(dx * dx + dy * dy);
        return min(dx, dy);
}

vec4 seeThrough(float yc, vec2 p, mat3 rotation, mat3 rrotation)
{
        float hitAngle = PI - (acos(clamp(yc / cylinderRadius, -1.0, 1.0)) - cylinderAngle);
        vec3 point = hitPoint(hitAngle, yc, rotation * vec3(p, 1.0), rrotation);
        if (yc <= 0.0 && (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0))
        {
            return getToColor(p);
        }

        if (yc > 0.0) return getFromColor(p);

        vec4 color = getFromColor(point.xy);
        vec4 tcolor = vec4(0.0);

        return antiAlias(color, tcolor, distanceToEdge(point));
}

vec4 seeThroughWithShadow(float yc, vec2 p, vec3 point, mat3 rotation, mat3 rrotation)
{
        float shadow = distanceToEdge(point) * 30.0;
        shadow = (1.0 - shadow) / 3.0;

        if (shadow < 0.0) shadow = 0.0; else shadow *= amount;

        vec4 shadowColor = seeThrough(yc, p, rotation, rrotation);
        shadowColor.r -= shadow;
        shadowColor.g -= shadow;
        shadowColor.b -= shadow;

        return shadowColor;
}

vec4 backside(float yc, vec3 point)
{
        vec4 color = getFromColor(point.xy);
        float gray = (color.r + color.b + color.g) / 15.0;
        gray += (8.0 / 10.0) * (pow(max(0.0, 1.0 - abs(yc / cylinderRadius)), 2.0 / 10.0) / 2.0 + (5.0 / 10.0));
        color.rgb = vec3(gray);
        return color;
}

vec4 behindSurface(vec2 p, float yc, vec3 point, mat3 rrotation)
{
        float safeAmount = amount >= 0.0 ? max(amount, 1e-4) : min(amount, -1e-4);
        float shado = (1.0 - ((-cylinderRadius - yc) / safeAmount * 7.0)) / 6.0;
        shado *= 1.0 - abs(point.x - 0.5);

        yc = (-cylinderRadius - cylinderRadius - yc);

        float hitAngle = (acos(clamp(yc / cylinderRadius, -1.0, 1.0)) + cylinderAngle) - PI;
        point = hitPoint(hitAngle, yc, point, rrotation);

        if (yc < 0.0 && point.x >= 0.0 && point.y >= 0.0 && point.x <= 1.0 && point.y <= 1.0 && (hitAngle < PI || amount > 0.5))
        {
                float dx = point.x - 0.5;
                float dy = point.y - 0.5;
                shado = 1.0 - (sqrt(dx * dx + dy * dy) / (71.0 / 100.0));
                float nyc = -yc / cylinderRadius;
                shado *= nyc * nyc * nyc;
                shado *= 0.5;
        }
        else
        {
                shado = 0.0;
        }
        vec4 to = getToColor(p);
        return vec4(to.rgb - shado, to.a);
}

vec4 transition(vec2 p) {
  amount = progress * (MAX_AMOUNT - MIN_AMOUNT) + MIN_AMOUNT;
  cylinderCenter = amount;
  cylinderAngle = 2.0 * PI * amount;

  const float angle = 100.0 * PI / 180.0;
        float c = cos(-angle);
        float s = sin(-angle);

        mat3 rotation = mat3( c, s, 0,
                                                                -s, c, 0,
                                                                -0.801, 0.8900, 1
                                                                );
        c = cos(angle);
        s = sin(angle);

        mat3 rrotation = mat3(	c, s, 0,
                                                                        -s, c, 0,
                                                                        0.98500, 0.985, 1
                                                                );

        vec3 point = rotation * vec3(p, 1.0);

        float yc = point.y - cylinderCenter;

        if (yc < -cylinderRadius)
        {
                // Behind surface
                return behindSurface(p,yc, point, rrotation);
        }

        if (yc > cylinderRadius)
        {
                // Flat surface
                return getFromColor(p);
        }

        float hitAngle = (acos(clamp(yc / cylinderRadius, -1.0, 1.0)) + cylinderAngle) - PI;

        float hitAngleMod = mod(hitAngle, 2.0 * PI);
        if ((hitAngleMod > PI && amount < 0.5) || (hitAngleMod > PI/2.0 && amount < 0.0))
        {
                return seeThrough(yc, p, rotation, rrotation);
        }

        point = hitPoint(hitAngle, yc, point, rrotation);

        if (point.x < 0.0 || point.y < 0.0 || point.x > 1.0 || point.y > 1.0)
        {
                return seeThroughWithShadow(yc, p, point, rotation, rrotation);
        }

        vec4 color = backside(yc, point);

        vec4 otherColor;
        if (yc < 0.0)
        {
                float dx2 = point.x - 0.5;
                float dy2 = point.y - 0.5;
                float shado = 1.0 - (sqrt(dx2 * dx2 + dy2 * dy2) / 0.71);
                float nyc2 = -yc / cylinderRadius;
                shado *= nyc2 * nyc2 * nyc2;
                shado *= 0.5;
                otherColor = vec4(0.0, 0.0, 0.0, shado * getToColor(p).a); // a shadow on the incoming image
        }
        else
        {
                otherColor = getFromColor(p);
        }

        color = antiAlias(color, otherColor, cylinderRadius - abs(yc));

        vec4 cl = seeThroughWithShadow(yc, p, point, rotation, rrotation);
        float dist = distanceToEdge(point);

        return antiAlias(color, cl, dist);
}
`,author:"Hewlett-Packard",license:"BSD 3 Clause",description:"The outgoing image curls away like a page, revealing the incoming one",tags:["page","curl","3d"],params:{},textures:[],createdAt:"Wed, 21 Feb 2018 01:13:49 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"Kaleidoscope",paramsTypes:{speed:"float",angle:"float",power:"float"},defaultParams:{speed:1,angle:1,power:1.5},glsl:`// Author: nwoeanhinnogaehr
// License: MIT
// Description: A crossfade through a spinning kaleidoscope
// Tags: kaleidoscope, distort, blend

uniform float speed; // = 1.0
uniform float angle; // = 1.0
uniform float power; // = 1.5

vec4 transition(vec2 uv) {
  vec2 p = uv.xy / vec2(1.0).xy;
  vec2 q = p;
  float t = pow(progress, power)*speed;
  p = p -0.5;
  for (int i = 0; i < 7; i++) {
    p = vec2(sin(t)*p.x + cos(t)*p.y, sin(t)*p.y - cos(t)*p.x);
    t += angle;
    p = abs(mod(p, 2.0) - 1.0);
  }
  abs(mod(p, 1.0));
  return mix(
    mix(getFromColor(q), getToColor(q), progress),
    mix(getFromColor(p), getToColor(p), progress), 1.0 - 2.0*abs(progress - 0.5));
}
`,author:"nwoeanhinnogaehr",license:"MIT",description:"A crossfade through a spinning kaleidoscope",tags:["kaleidoscope","distort","blend"],params:{speed:{type:"float",default:1},angle:{type:"float",default:1},power:{type:"float",default:1.5}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"KeyholeWipe",paramsTypes:{center:"vec2",rim:"float",smoothness:"float"},defaultParams:{center:[.5,.5],rim:.6,smoothness:.002},glsl:`// Author: gre
// License: MIT
// Description: A keyhole grows steadily from the center until the incoming image fills the frame, its bevelled rim and inner shadow making it read as a hole cut in a plate
// Tags: shape, wipe, keyhole, iris, reveal

// @param Center of the keyhole
uniform vec2 center; // = vec2(0.5, 0.5)
// @range(0, 1) Strength of the bevelled rim around the keyhole and the shadow inside it (0 for a clean cut)
uniform float rim; // = 0.6
// @range(0, 0.05) Softness of the keyhole's edge
uniform float smoothness; // = 0.002

// The keyhole, in its own units (0.85 tall, from y = -0.4 to 0.45): a round head on top of a slot
// that widens downward.
#define HEAD vec2(0.0, 0.2)
#define HEAD_R 0.25
#define SLOT_Y -0.17
const float SLOT_HE = 0.23;
const float SLOT_TOP = 0.085;
const float SLOT_BOTTOM = 0.165;
const float SLOT_ROUND = 0.025;
// height of the point the keyhole grows around, in its head
const float GROW_Y = 0.1;
// widths of the bevel and of the rim's shadows, in keyhole units
const float BEVEL = 0.028;
const float SHADE = 0.05;

float dot2(vec2 v) { return dot(v, v); }

// Signed distance to the slot, a trapezoid with rounded corners
float sdSlot(vec2 p) {
  p.y -= SLOT_Y;
  float r1 = SLOT_BOTTOM - SLOT_ROUND;
  float r2 = SLOT_TOP - SLOT_ROUND;
  float he = SLOT_HE - SLOT_ROUND;
  vec2 k1 = vec2(r2, he);
  vec2 k2 = vec2(r2 - r1, 2.0 * he);
  p.x = abs(p.x);
  vec2 ca = vec2(p.x - min(p.x, p.y < 0.0 ? r1 : r2), abs(p.y) - he);
  vec2 cb = p - k1 + k2 * clamp(dot(k1 - p, k2) / dot2(k2), 0.0, 1.0);
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot2(ca), dot2(cb))) - SLOT_ROUND;
}

float sdKeyhole(vec2 p) {
  return min(length(p - HEAD) - HEAD_R, sdSlot(p));
}

// Scale at which the keyhole's head, a disk, reaches the point p (seen from the growth point):
// the root of |p - s h| = s HEAD_R, h being the head's center
float reach(vec2 p) {
  vec2 h = HEAD - vec2(0.0, GROW_Y);
  float k = HEAD_R * HEAD_R - dot2(h);
  float b = dot(p, h);
  return (sqrt(b * b + k * dot2(p)) - b) / k;
}

vec4 transition (vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  vec2 asp = vec2(ratio, 1.0);
  vec2 c = center * asp;
  float sm = max(smoothness, 0.0005);

  // The keyhole grows around a point of its head, at the center. It covers the frame (grown by a
  // margin, so the soft edge is past it) once its head, a disk, reaches the frame's corners.
  vec2 o = c;
  vec2 lo = -o - 2.5 * sm;
  vec2 hi = asp - o + 2.5 * sm;
  float full = max(max(reach(lo), reach(hi)), max(reach(vec2(lo.x, hi.y)), reach(vec2(hi.x, lo.y))));

  // The keyhole grows linearly until it fills the frame
  float p = progress;
  float s = full * p;
  if (s <= 0.0) return a;

  vec2 q = (uv * asp - o) / s + vec2(0.0, GROW_Y);
  float d = sdKeyhole(q);
  // the soft edge is just inside the outline, so a tiny keyhole shows nothing
  float hole = 1.0 - smoothstep(-sm, sm, d * s + sm);

  float fade = smoothstep(0.0, 0.08, p) * (1.0 - smoothstep(0.7, 1.0, p));
  float rimA = rim * fade;
  if (rimA > 0.0) {
    // Plate around the hole: a bevel lit from above going down into the hole, and a soft shadow
    // on its rim
    vec2 e = vec2(0.002, 0.0);
    vec2 n = vec2(sdKeyhole(q + e) - sdKeyhole(q - e), sdKeyhole(q + e.yx) - sdKeyhole(q - e.yx));
    float lit = -dot(n / max(length(n), 1e-6), vec2(-0.35, 0.94));
    float bevel = 1.0 - smoothstep(0.0, BEVEL, d);
    float shade = exp(-max(d, 0.0) / SHADE);
    a.rgb *= 1.0 - rimA * (0.35 * shade + bevel * 0.4 * max(-lit, 0.0));
    a.rgb += rimA * bevel * bevel * 0.3 * max(lit, 0.0) * a.a;

    // Inside the hole: the plate's thickness shades the incoming image under the top of the rim,
    // with a softer vignette all around the edge
    float wall = smoothstep(-0.03, 0.03, sdKeyhole(q + vec2(0.0, 0.05)));
    float vign = exp(min(d, 0.0) / SHADE);
    b.rgb *= 1.0 - rimA * (0.5 * wall + 0.3 * vign);
  }

  return mix(a, b, hole);
}
`,author:"gre",license:"MIT",description:"A keyhole grows steadily from the center until the incoming image fills the frame, its bevelled rim and inner shadow making it read as a hole cut in a plate",tags:["shape","wipe","keyhole","iris","reveal"],params:{center:{type:"vec2",default:[.5,.5],description:"Center of the keyhole"},rim:{type:"float",default:.6,min:0,max:1,description:"Strength of the bevelled rim around the keyhole and the shadow inside it (0 for a clean cut)"},smoothness:{type:"float",default:.002,min:0,max:.05,description:"Softness of the keyhole's edge"}},textures:[],createdAt:"Sun, 8 Nov 2026 13:21:54 +0100",updatedAt:"Sun, 8 Nov 2026 13:21:54 +0100"},{name:"LayoutGrid",paramsTypes:{gutter:"float",overlap:"float",band:"float",shadow:"float",paper:"vec4",accent:"vec4"},defaultParams:{gutter:.04,overlap:.55,band:.22,shadow:.4,paper:[.96,.95,.91,1],accent:[.93,.27,.2,1]},glsl:`// Author: gre
// License: MIT
// Description: The frame splits into an asymmetric magazine grid as paper gutters open between the panels; panel after panel in reading order, the incoming image pushes the outgoing one out of its panel from a different side, a colored accent band between them, then the gutters close over the full incoming image
// Tags: grid, panels, magazine, push, slide, layout

// @range(0, 0.08) Width of the gutters at their widest, as a part of the frame's shorter side
uniform float gutter; // = 0.04
// @range(0, 0.9) How much the panels' pushes overlap in time (0 pushes them one strictly after another, 0.9 almost all together)
uniform float overlap; // = 0.55
// @range(0, 0.6) Length of the accent band between the two images, as a part of the panel's length along its push
uniform float band; // = 0.22
// @range(0, 1) Darkness of the soft shadows the panels cast on the paper and the incoming image casts on the band
uniform float shadow; // = 0.4
// @color Color of the paper seen in the gutters
uniform vec4 paper; // = vec4(0.96, 0.95, 0.91, 1.0)
// @color Color of the accent band between the outgoing and incoming images
uniform vec4 accent; // = vec4(0.93, 0.27, 0.2, 1.0)

const int PANELS = 6;
// the gutters open over [0, OPEN] and close over [1 - OPEN, 1]
const float OPEN = 0.28;
// the first push starts at START, the last one ends at 1 - START
const float START = 0.1;
// width of the antialiased edges, as a part of the frame's shorter side
const float EDGE = 0.0025;

// panel i of the layout: xy its bottom-left corner, zw its top-right corner, in uv; panels in reading order
vec4 panelRect(int i, bool portrait) {
  if (portrait) {
    if (i == 0) return vec4(0.0, 0.68, 0.62, 1.0);
    if (i == 1) return vec4(0.62, 0.68, 1.0, 1.0);
    if (i == 2) return vec4(0.0, 0.36, 1.0, 0.68);
    if (i == 3) return vec4(0.0, 0.0, 0.46, 0.36);
    if (i == 4) return vec4(0.46, 0.17, 1.0, 0.36);
    return vec4(0.46, 0.0, 1.0, 0.17);
  }
  if (i == 0) return vec4(0.0, 0.42, 0.4, 1.0);
  if (i == 1) return vec4(0.4, 0.64, 1.0, 1.0);
  if (i == 2) return vec4(0.4, 0.0, 0.7, 0.64);
  if (i == 3) return vec4(0.7, 0.32, 1.0, 0.64);
  if (i == 4) return vec4(0.7, 0.0, 1.0, 0.32);
  return vec4(0.0, 0.0, 0.4, 0.42);
}

// direction the outgoing image of panel i is pushed toward (the incoming one enters from the opposite side)
vec2 panelDir(int i, bool portrait) {
  if (portrait) {
    if (i == 0) return vec2(1.0, 0.0);
    if (i == 1) return vec2(0.0, -1.0);
    if (i == 2) return vec2(-1.0, 0.0);
    if (i == 3) return vec2(0.0, 1.0);
    if (i == 4) return vec2(1.0, 0.0);
    return vec2(-1.0, 0.0);
  }
  if (i == 0) return vec2(0.0, -1.0);
  if (i == 1) return vec2(-1.0, 0.0);
  if (i == 2) return vec2(0.0, 1.0);
  if (i == 3) return vec2(1.0, 0.0);
  if (i == 4) return vec2(-1.0, 0.0);
  return vec2(1.0, 0.0);
}

float easeInOut(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - 4.0 * (1.0 - t) * (1.0 - t) * (1.0 - t);
}

// coverage of the interval [lo, hi] at x, with antialiased ends: the coverages of adjacent intervals add up to 1
float span1(float x, float lo, float hi, float aa) {
  return smoothstep(lo - aa, lo + aa, x) * (1.0 - smoothstep(hi - aa, hi + aa, x));
}

// signed distance from p to the box [lo, hi]
float boxDist(vec2 p, vec2 lo, vec2 hi) {
  vec2 d = abs(p - 0.5 * (lo + hi)) - 0.5 * (hi - lo);
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  bool portrait = ratio < 1.0;
  // frame coordinates, in shorter sides
  vec2 aspect = vec2(ratio, 1.0) / min(ratio, 1.0);
  vec2 p = uv * aspect;
  // the gutters open then close, 0 at both ends
  float open = smoothstep(0.0, OPEN, progress) * (1.0 - smoothstep(1.0 - OPEN, 1.0, progress));
  float g = gutter * open;
  float ov = clamp(overlap, 0.0, 0.9);
  // duration of a push, the pushes starting one after another over [START, 1 - START]
  float span = (1.0 - 2.0 * START) / (1.0 + float(PANELS - 1) * (1.0 - ov));

  vec4 color = vec4(0.0);
  float cover = 0.0;
  float shade = 0.0;
  for (int i = 0; i < PANELS; i++) {
    vec4 r = panelRect(i, portrait);
    vec2 lo = r.xy * aspect + 0.5 * g;
    vec2 hi = r.zw * aspect - 0.5 * g;
    // no gutter along the frame's border: the panels there run past it
    lo = mix(lo, vec2(-1.0), step(r.xy, vec2(0.0)));
    hi = mix(hi, aspect + 1.0, step(vec2(1.0), r.zw));
    float t = clamp((progress - START - float(i) * span * (1.0 - ov)) / span, 0.0, 1.0);
    // the panel being pushed lifts off the paper: its shadow grows longer and softer
    float lift = 1.0 + 1.2 * sin(3.141592653589793 * t);
    // soft drop shadow down and to the right on the paper
    float sd = boxDist(p - vec2(0.2, -0.35) * g * lift, lo, hi);
    shade = max(shade, (1.0 - smoothstep(-0.2 * g, 0.6 * g * lift + 1e-4, sd)) / sqrt(lift));
    // separable coverage, so that the panels of the grid add up to exactly 1 once the gutters close
    float inside = span1(p.x, lo.x, hi.x, EDGE) * span1(p.y, lo.y, hi.y, EDGE);
    if (inside > 0.0) {
      vec2 dir = panelDir(i, portrait);
      vec4 c;
      if (t <= 0.0) {
        c = getFromColor(uv);
      } else if (t >= 1.0) {
        c = getToColor(uv);
      } else {
        float e = easeInOut(t);
        // a train slides along dir through the panel: outgoing image, accent band, incoming image
        float len = abs(dot(r.zw - r.xy, dir));
        float w = band * len;
        vec2 q = uv - dir * e * (len + w);
        // position along dir from the outgoing image's trailing edge (inside it when >= 0)
        float a = dot(q - (dir.x + dir.y < 0.0 ? r.zw : r.xy), dir);
        // the same in frame units, for antialiasing
        float af = a * abs(dot(aspect, dir));
        float wf = w * abs(dot(aspect, dir));
        float fromW = smoothstep(-EDGE, 0.0, af);
        float toW = 1.0 - smoothstep(-wf, -wf + EDGE, af);
        // the incoming image's leading edge casts a soft shadow on the band
        float bandShade = 1.0 - shadow * 0.5 * (1.0 - smoothstep(-wf, -wf + 0.35 * wf + 1e-4, af));
        vec4 b = vec4(accent.rgb * bandShade, accent.a);
        // the antialiased ends of the images are sampled inside the panel
        c = mix(b, getFromColor(clamp(q, r.xy, r.zw)), fromW);
        c = mix(c, getToColor(clamp(q + dir * (len + w), r.xy, r.zw)), toW);
      }
      color += c * inside;
      cover += inside;
    }
  }
  color /= max(cover, 1.0);
  cover = min(cover, 1.0);
  vec4 bg = vec4(paper.rgb * (1.0 - shadow * shade * open), paper.a);
  return color + bg * (1.0 - cover);
}
`,author:"gre",license:"MIT",description:"The frame splits into an asymmetric magazine grid as paper gutters open between the panels; panel after panel in reading order, the incoming image pushes the outgoing one out of its panel from a different side, a colored accent band between them, then the gutters close over the full incoming image",tags:["grid","panels","magazine","push","slide","layout"],params:{gutter:{type:"float",default:.04,min:0,max:.08,description:"Width of the gutters at their widest, as a part of the frame's shorter side"},overlap:{type:"float",default:.55,min:0,max:.9,description:"How much the panels' pushes overlap in time (0 pushes them one strictly after another, 0.9 almost all together)"},band:{type:"float",default:.22,min:0,max:.6,description:"Length of the accent band between the two images, as a part of the panel's length along its push"},shadow:{type:"float",default:.4,min:0,max:1,description:"Darkness of the soft shadows the panels cast on the paper and the incoming image casts on the band"},paper:{type:"vec4",default:[.96,.95,.91,1],color:!0,description:"Color of the paper seen in the gutters"},accent:{type:"vec4",default:[.93,.27,.2,1],color:!0,description:"Color of the accent band between the outgoing and incoming images"}},textures:[],createdAt:"Fri, 13 Nov 2026 10:04:55 +0100",updatedAt:"Fri, 13 Nov 2026 10:04:55 +0100"},{name:"LeafWipe",paramsTypes:{},defaultParams:{},glsl:`// Author: @Flexi23
// License: MIT
// Description: A leaf shape grows from the center to reveal the incoming image
// Tags: shape, wipe

// inspired by http://www.wolframalpha.com/input/?i=cannabis+curve

vec4 transition (vec2 uv) {
  if(progress == 0.0){
    return getFromColor(uv);
  }
  vec2 leaf_uv = (uv - vec2(0.5))/10./pow(progress,3.5);
	leaf_uv.y += 0.35;
	float r = 0.18;
	float o = atan(leaf_uv.y, leaf_uv.x);
  return mix(getFromColor(uv), getToColor(uv), 1.-step(1. - length(leaf_uv)+r*(1.+sin(o))*(1.+0.9 * cos(8.*o))*(1.+0.1*cos(24.*o))*(0.9+0.05*cos(200.*o)), 1.));
}
`,author:"@Flexi23",license:"MIT",description:"A leaf shape grows from the center to reveal the incoming image",tags:["shape","wipe"],params:{},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"LedWall",paramsTypes:{cells:"float",glow:"float",flash:"float",zoom:"float",triads:"bool",direction:"vec2",panel:"vec4"},defaultParams:{cells:24,glow:.6,flash:.7,zoom:.15,triads:!1,direction:[1,0],panel:[.02,.02,.025,1]},glsl:`// Author: gre
// License: MIT
// Description: The picture zooms into a giant LED screen of round glowing diodes on a dark panel; a refresh wave sweeps across it, each diode flicking with a bright pop as it switches to the incoming image, then the diodes melt back into the plain picture
// Tags: dots, glow, grid, wave

// @range(6, 80) Number of diodes across the shorter side
uniform float cells; // = 24.0
// @range(0, 1) Strength of the glow bleeding from the diodes into the dark panel
uniform float glow; // = 0.6
// @range(0, 1) Brightness of the flash of each diode as it switches
uniform float flash; // = 0.7
// @range(0, 0.5) How much the picture zooms in while it is a screen
uniform float zoom; // = 0.15
// @param Each diode is made of red, green and blue sub-diodes
uniform bool triads; // = false
// @param Direction in which the refresh wave sweeps across the screen
uniform vec2 direction; // = vec2(1.0, 0.0)
// @color Color of the panel between the diodes
uniform vec4 panel; // = vec4(0.02, 0.02, 0.025, 1.0)

// radius of a lit diode, in cells
const float RADIUS = 0.36;
// width of the soft edge of the diodes, in cells
const float EDGE = 0.05;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// folds uv back into 0..1, so the frame stays filled
vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

// 1 inside a disc of radius r, with a soft edge
float disc(float d, float r) {
  return 1.0 - smoothstep(r - EDGE, r + EDGE, d);
}

vec4 transition(vec2 uv) {
  // how much the picture is a screen: it resolves into diodes until 0.3, and back from 0.7
  float led = smoothstep(0.0, 0.3, progress) * (1.0 - smoothstep(0.7, 1.0, progress));
  float z = 1.0 + max(zoom, 0.0) * smoothstep(0.0, 0.45, progress) * (1.0 - smoothstep(0.55, 1.0, progress));
  vec2 p = 0.5 + (uv - 0.5) / z;

  // the grid of diodes, in cells, with a diode at the center of the frame
  vec2 aspect = vec2(ratio, 1.0);
  vec2 toCells = aspect * max(cells, 1.0) / min(ratio, 1.0);
  vec2 q = (p - 0.5) * toCells;
  vec2 id = floor(q + 0.5);
  vec2 local = q - id;
  vec2 side = vec2(local.x < 0.0 ? -1.0 : 1.0, local.y < 0.0 ? -1.0 : 1.0);

  // the refresh wave runs along dir, from 0 to 1 across the frame
  vec2 dir = length(direction) > 1e-4 ? normalize(direction) : vec2(1.0, 0.0);
  float extent = abs(dir.x) * ratio + abs(dir.y);

  vec4 own = vec4(0.0);
  float ownSwitch = 0.0;
  vec4 halo = vec4(0.0);
  float haloWeight = 0.0;
  // this diode and the three nearest ones, whose glow reaches this point
  for (int i = 0; i < 4; i++) {
    // without glow, only this diode matters
    if (i > 0 && glow * led <= 0.0) break;
    vec2 o = vec2(mod(float(i), 2.0), floor(float(i) / 2.0)) * side;
    vec2 c = id + o;
    vec2 cuv = c / toCells + 0.5;
    // where the diode is seen in the frame, so that the wave crosses the visible screen
    float s = clamp(dot((cuv - 0.5) * z * aspect, dir) / extent + 0.5, 0.0, 1.0);
    float when = 0.2 + 0.52 * s + 0.05 * (hash12(c + 71.0) - 0.5);
    float sw = smoothstep(when - 0.012, when + 0.012, progress);
    // the diode blinks off just before it switches, then pops bright
    float x = (progress - when) / 0.018;
    float pop = exp(-x * x) - 0.5 * exp(-(x + 1.6) * (x + 1.6));
    vec2 suv = mirrored(cuv);
    vec4 col = mix(getFromColor(suv), getToColor(suv), sw);
    col.rgb = col.rgb * (1.0 + 1.4 * flash * pop) + 0.2 * flash * max(pop, 0.0);
    if (i == 0) {
      own = col;
      ownSwitch = sw;
    }
    float d = length(local - o);
    float w = 0.9 * glow * exp(-6.0 * max(d - RADIUS, 0.0)) * (1.0 + 0.8 * flash * max(pop, 0.0));
    // the neighbors fade out where the next ones in the other direction take over, so the glow has no seam
    if (o.x != 0.0) w *= smoothstep(0.0, 0.2, abs(local.x));
    if (o.y != 0.0) w *= smoothstep(0.0, 0.2, abs(local.y));
    halo += w * col;
    haloWeight += w;
  }

  // the plain picture, switched along with its diode
  vec4 plain = mix(getFromColor(p), getToColor(p), ownSwitch);
  float d = length(local);
  // the diodes cover their whole cell with the plain picture when led = 0: the dark panel
  // shows up first between them, then they light up with the color of their center
  float r = mix(0.8, RADIUS, smoothstep(0.0, 0.6, led));
  vec4 gap = vec4(panel.rgb, panel.a * own.a);
  if (haloWeight > 0.0) {
    gap = mix(gap, halo / haloWeight, clamp(haloWeight * led, 0.0, 1.0));
  }
  vec4 body = own;
  if (triads) {
    // three sub-diodes on the panel, red at the top, green and blue below
    vec3 sub = vec3(
      disc(length(local - vec2(0.0, 0.15)), 0.2),
      disc(length(local - vec2(-0.13, -0.075)), 0.2),
      disc(length(local - vec2(0.13, -0.075)), 0.2));
    float m = max(sub.r, max(sub.g, sub.b));
    body = vec4(gap.rgb * (1.0 - m) + own.rgb * 1.5 * sub, mix(gap.a, own.a, m));
    // the sub-diodes reach out to 0.4 cells
    r = max(r, 0.45);
  } else {
    // brighter at the core of the diode
    float k = clamp(d / RADIUS, 0.0, 1.0);
    body.rgb *= 0.8 + 0.45 * (1.0 - k * k);
  }
  // the color of the center spreads from it over the diode
  float lit = smoothstep(0.0, 0.8, led);
  body = mix(plain, body, lit * mix(1.0, lit, smoothstep(0.0, 0.7, d)));
  vec4 color = mix(gap, body, disc(d, r));
  return clamp(color, 0.0, 1.0);
}
`,author:"gre",license:"MIT",description:"The picture zooms into a giant LED screen of round glowing diodes on a dark panel; a refresh wave sweeps across it, each diode flicking with a bright pop as it switches to the incoming image, then the diodes melt back into the plain picture",tags:["dots","glow","grid","wave"],params:{cells:{type:"float",default:24,min:6,max:80,description:"Number of diodes across the shorter side"},glow:{type:"float",default:.6,min:0,max:1,description:"Strength of the glow bleeding from the diodes into the dark panel"},flash:{type:"float",default:.7,min:0,max:1,description:"Brightness of the flash of each diode as it switches"},zoom:{type:"float",default:.15,min:0,max:.5,description:"How much the picture zooms in while it is a screen"},triads:{type:"bool",default:!1,description:"Each diode is made of red, green and blue sub-diodes"},direction:{type:"vec2",default:[1,0],description:"Direction in which the refresh wave sweeps across the screen"},panel:{type:"vec4",default:[.02,.02,.025,1],color:!0,description:"Color of the panel between the diodes"}},textures:[],createdAt:"Fri, 6 Nov 2026 17:50:17 +0100",updatedAt:"Fri, 6 Nov 2026 17:50:17 +0100"},{name:"LeftRight",paramsTypes:{},defaultParams:{},glsl:`// Author: zhmy
// License: MIT
// Description: The outgoing image shrinks away to the left while the incoming one slides in from the right
// Tags: slide, zoom, horizontal

const vec4 black = vec4(0.0); // where no image is drawn: transparent
const vec2 boundMin = vec2(0.0, 0.0);
const vec2 boundMax = vec2(1.0, 1.0);

bool inBounds (vec2 p) {
    return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
}

vec4 transition (vec2 uv) {
    vec2 spfr,spto = vec2(-1.);

    float size = mix(1.0, 3.0, progress*0.2);
    spto = (uv + vec2(-0.5,-0.5))*vec2(size,size)+vec2(0.5,0.5);
    spfr = (uv - vec2(1.-progress, 0.0));
    if(inBounds(spfr)){
        return getToColor(spfr);
    }else if(inBounds(spto)){
        return getFromColor(spto) * (1.0 - progress);
    } else{
        return black;
    }
}`,author:"zhmy",license:"MIT",description:"The outgoing image shrinks away to the left while the incoming one slides in from the right",tags:["slide","zoom","horizontal"],params:{},textures:[],createdAt:"Thu, 17 Dec 2020 11:50:34 +0800",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"LensFlare",paramsTypes:{angle:"float",height:"float",intensity:"float",color:"vec3"},defaultParams:{angle:-12,height:.18,intensity:1,color:[.35,.6,1]},glsl:`// Author: gre
// License: MIT
// Description: A bright light sweeps across the frame and flares the lens: a long thin horizontal streak, a glowing core and a trail of colored ghost reflections; at its peak the incoming image spreads out from the light under its glare
// Tags: light, flare, glow, streak

// @range(-90, 90) Angle of the path of the light, in degrees (0 sweeps from left to right)
uniform float angle; // = -12.0
// @range(-0.5, 0.5) How far above the center of the frame the light passes
uniform float height; // = 0.18
// @range(0, 2) Brightness of the flare
uniform float intensity; // = 1.0
// @color Color of the streak and of the glare
uniform vec3 color; // = vec3(0.35, 0.6, 1.0)

const int BLOOM_TAPS = 12;
const int GHOSTS = 6;

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

vec4 premultiplied(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

// the image on screen (premultiplied): the outgoing one, then the incoming one after the cut
vec4 frame(vec2 st, float m) {
  if (m <= 0.0) return premultiplied(getFromColor(st));
  if (m >= 1.0) return premultiplied(getToColor(st));
  return mix(premultiplied(getFromColor(st)), premultiplied(getToColor(st)), m);
}

// the light of a pixel (premultiplied): its color above a knee
vec3 highlight(vec4 c) {
  float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  return c.rgb * smoothstep(0.55, 0.95, lum);
}

vec4 transition(vec2 uv) {
  float p = progress;
  if (p <= 0.0) return getFromColor(uv);
  if (p >= 1.0) return getToColor(uv);

  // 0 at both ends, 1 at the peak
  float env = 4.0 * p * (1.0 - p);
  float peak = pow(env, 24.0);
  // frame coordinates, centered, with square units
  vec2 aspect = vec2(ratio, 1.0);
  vec2 q = (uv - 0.5) * aspect;
  float r = radians(angle);
  vec2 dir = vec2(cos(r), -sin(r));
  vec2 normal = vec2(-dir.y, dir.x);
  // the light crosses the frame, slowing down as it passes the middle
  float t = p - 0.5;
  float travel = 0.5 * (abs(dir.x) * ratio + abs(dir.y)) + 0.3;
  float along = travel * (2.0 * t) * (0.55 + 1.8 * t * t);
  vec2 src = dir * along + normal * height;

  vec2 d = q - src;
  float dist = length(d);
  float k = intensity * env;

  // the cut, under the glare: the incoming image spreads out from the light in a soft circle,
  // slower as the flare gets dimmer so that it still reads as intended
  float cut = mix(0.2, 0.06, clamp(intensity, 0.0, 1.0));
  float s = clamp((p - 0.5 + cut) / (2.0 * cut), 0.0, 1.0);
  float soft = 0.3;
  float reach = 0.5 * length(aspect) + length(src) + soft;
  float front = s * (reach + soft);
  float m = smoothstep(front, front - soft, dist);
  vec4 base = frame(uv, m);

  // the anamorphic streak: long and thin, always horizontal, white at the center and tinted along
  float ax = abs(d.x);
  float ay = abs(d.y);
  float thin = exp(-ay * 140.0) * exp(-ax * 0.7);
  float wide = exp(-ay * 30.0) * exp(-ax * 1.6);
  vec3 tint = color;
  vec3 streak = (thin * mix(vec3(1.0), tint, smoothstep(0.0, 0.3, ax)) + 0.5 * wide * tint) * 3.0;

  // the core and its halo
  vec3 core = vec3(1.0, 0.97, 0.92) * exp(-dist * dist * 600.0) * 3.0 + mix(vec3(1.0), tint, 0.5) * exp(-dist * 7.0) * 0.6;

  // ghosts on the line from the light through the center of the frame
  vec3 ghosts = vec3(0.0);
  for (int i = 0; i < GHOSTS; i++) {
    float fi = float(i);
    float f = -0.45 + 0.42 * fi + 0.08 * sin(fi * 2.3);
    vec2 g = -src * f;
    float size = 0.025 + 0.06 * fract(fi * 0.618 + 0.2);
    float gd = length(q - g) / size;
    // a soft disc with a brighter rim
    float disc = smoothstep(1.0, 0.8, gd) * (0.35 + 0.65 * smoothstep(0.4, 0.95, gd));
    vec3 hue = mix(tint, vec3(1.0, 0.65, 0.35), fract(fi * 0.53));
    hue = mix(hue, vec3(0.5, 1.0, 0.6), step(4.5, fi) * 0.6);
    ghosts += disc * hue * 0.45;
  }

  // the highlights of the image bloom at the peak
  vec3 bloom = vec3(0.0);
  if (peak > 1e-3) {
    float radius = 0.06 * env;
    for (int i = 0; i < BLOOM_TAPS; i++) {
      float fi = float(i);
      float a = fi * 2.39996;
      float rr = radius * sqrt((fi + 0.5) / float(BLOOM_TAPS));
      vec2 o = vec2(cos(a), sin(a)) * rr / aspect;
      bloom += highlight(frame(mirror(uv + o), m));
    }
    bloom /= float(BLOOM_TAPS);
  }

  // at the peak, the glare: a wide halo around the light and a light veil over the frame, to hide the cut
  vec3 glare = mix(vec3(1.0), tint, 0.5) * peak * (0.45 + 2.2 * exp(-dist * 3.0));

  vec3 light = k * (streak + core + ghosts) + intensity * (bloom * 2.5 * peak + glare);
  light = 1.0 - exp(-light);

  // screened over the image; the flare only shows on the image, so transparency is kept
  vec3 c = base.rgb + light * base.a - base.rgb * light;
  if (base.a <= 0.0) return vec4(0.0);
  return vec4(clamp(c / base.a, 0.0, 1.0), base.a);
}
`,author:"gre",license:"MIT",description:"A bright light sweeps across the frame and flares the lens: a long thin horizontal streak, a glowing core and a trail of colored ghost reflections; at its peak the incoming image spreads out from the light under its glare",tags:["light","flare","glow","streak"],params:{angle:{type:"float",default:-12,min:-90,max:90,description:"Angle of the path of the light, in degrees (0 sweeps from left to right)"},height:{type:"float",default:.18,min:-.5,max:.5,description:"How far above the center of the frame the light passes"},intensity:{type:"float",default:1,min:0,max:2,description:"Brightness of the flare"},color:{type:"vec3",default:[.35,.6,1],color:!0,description:"Color of the streak and of the glare"}},textures:[],createdAt:"Sun, 1 Nov 2026 18:52:13 +0100",updatedAt:"Sun, 1 Nov 2026 18:52:13 +0100"},{name:"LightRays",paramsTypes:{center:"vec2",drift:"float",reach:"float",threshold:"float",intensity:"float",tint:"vec3"},defaultParams:{center:[.5,.6],drift:.15,reach:.6,threshold:.65,intensity:1.5,tint:[1,.82,.55]},glsl:`// Author: gre
// License: MIT
// Description: Shafts of light burst from the highlights of the outgoing image and stream outward from a slowly drifting center; at their peak the incoming image takes over and its own rays shrink back into its highlights
// Tags: light, glow, rays, radial

// @param Point the rays stream away from, at the middle of the transition
uniform vec2 center; // = vec2(0.5, 0.6)
// @range(0, 0.5) How far the center drifts during the transition, from left to right
uniform float drift; // = 0.15
// @range(0, 1) Length of the rays at the peak, as a fraction of their distance to the center
uniform float reach; // = 0.6
// @range(0, 0.8) Brightness above which the image casts rays
uniform float threshold; // = 0.65
// @range(0, 4) Brightness of the rays
uniform float intensity; // = 1.5
// @color Tint of the rays, toward their ends
uniform vec3 tint; // = vec3(1.0, 0.82, 0.55)

const int TAPS = 20;
// number of shafts around the center
const float SHAFTS = 23.0;
const float PI = 3.141592653589793;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

// smooth noise around the center, wrapping over a full turn (t in 0..1)
float shaftNoise(float t, float n, float seed) {
  float x = t * n;
  float i = floor(x);
  float f = x - i;
  float a = hash12(vec2(mod(i, n), seed));
  float b = hash12(vec2(mod(i + 1.0, n), seed));
  return mix(a, b, f * f * (3.0 - 2.0 * f));
}

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// the light of a pixel (premultiplied): its color above the threshold
vec3 glow(vec4 c, float knee) {
  float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  return c.rgb * c.a * smoothstep(knee, knee + 0.2, lum);
}

// the light at a ray tap: one image, or both during the short switch
vec3 light(vec2 st, float knee, float m) {
  if (m <= 0.0) return glow(getFromColor(st), knee);
  if (m >= 1.0) return glow(getToColor(st), knee);
  return mix(glow(getFromColor(st), knee), glow(getToColor(st), knee), m);
}

vec4 transition(vec2 uv) {
  float p = progress;
  // the rays grow on the outgoing image, and shrink back into the incoming one
  float amount = p < 0.5 ? smoothstep(0.0, 0.5, p) : 1.0 - smoothstep(0.5, 1.0, p);
  float peak = amount * amount * amount;
  float m = smoothstep(0.46, 0.54, p);
  vec4 fromColor = getFromColor(uv);
  vec4 toColor = getToColor(uv);
  if (amount <= 0.0) return m < 0.5 ? fromColor : toColor;

  // the rays stream away from a center drifting slowly across the frame
  vec2 origin = center + vec2(drift * (p - 0.5), 0.0);
  float len = reach * amount;
  // more and more of the image catches the light as the rays grow
  float knee = mix(threshold, 0.75 * threshold, peak);
  // a small shift of the taps, under their spacing, blends them into smooth shafts;
  // hashed by integer cell so that every GPU computes the same shift
  float jitter = hash12(floor(uv * vec2(ratio, 1.0) * 997.0));

  // the light gathered on the way to the center, fading with the distance it travels
  vec3 rays = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < TAPS; i++) {
    float s = (float(i) + jitter) / float(TAPS);
    float w = exp(-2.0 * s);
    // warm white near the sources, tinted further along the rays
    vec3 hue = mix(vec3(1.0), tint, smoothstep(0.0, 0.6, s));
    rays += w * hue * light(mirror(mix(uv, origin, s * len)), knee, m);
    total += w;
  }
  // the light breaks into shafts of different strengths, slowly turning
  vec2 d = (uv - origin) * vec2(ratio, 1.0);
  // atan is undefined at the center itself
  float turn = length(d) > 1e-6 ? atan(d.y, d.x) / (2.0 * PI) + 0.5 : 0.0;
  float shafts = 0.6 * shaftNoise(fract(turn + 0.03 * p), SHAFTS, 1.0) + 0.4 * shaftNoise(fract(turn - 0.05 * p), 2.0 * SHAFTS + 1.0, 7.0);
  // merged back into a soft glow close to the center, where the shafts would meet in a point
  rays *= mix(1.0, mix(0.2, 1.6, smoothstep(0.15, 0.85, shafts)), smoothstep(0.0, 0.3, length(d)));
  rays *= intensity * amount * (1.0 + 3.0 * peak) / total;
  // compressed, so that bright areas never flatten into white
  rays = 0.9 * (1.0 - exp(-rays));

  // the image stays sharp, with a slight lift of the exposure at the peak; the rays are screened
  // on top of its colors and add nothing to its alpha
  vec4 c = mix(vec4(fromColor.rgb * fromColor.a, fromColor.a), vec4(toColor.rgb * toColor.a, toColor.a), m);
  if (c.a <= 0.0) return vec4(0.0);
  vec3 base = min(c.rgb / c.a * (1.0 + 0.2 * peak), 1.0);
  return vec4(base + rays - base * rays, c.a);
}
`,author:"gre",license:"MIT",description:"Shafts of light burst from the highlights of the outgoing image and stream outward from a slowly drifting center; at their peak the incoming image takes over and its own rays shrink back into its highlights",tags:["light","glow","rays","radial"],params:{center:{type:"vec2",default:[.5,.6],description:"Point the rays stream away from, at the middle of the transition"},drift:{type:"float",default:.15,min:0,max:.5,description:"How far the center drifts during the transition, from left to right"},reach:{type:"float",default:.6,min:0,max:1,description:"Length of the rays at the peak, as a fraction of their distance to the center"},threshold:{type:"float",default:.65,min:0,max:.8,description:"Brightness above which the image casts rays"},intensity:{type:"float",default:1.5,min:0,max:4,description:"Brightness of the rays"},tint:{type:"vec3",default:[1,.82,.55],color:!0,description:"Tint of the rays, toward their ends"}},textures:[],createdAt:"Mon, 2 Nov 2026 20:30:21 +0100",updatedAt:"Mon, 2 Nov 2026 20:30:21 +0100"},{name:"LightStreaks",paramsTypes:{reach:"float",threshold:"float",intensity:"float",tint:"vec3",blur:"float",vertical:"bool"},defaultParams:{reach:.6,threshold:.7,intensity:1.5,tint:[.45,.7,1],blur:.1,vertical:!1},glsl:`// Author: gre
// License: MIT
// Description: The highlights of the outgoing image flare into long horizontal (or vertical) lens streaks while it smears with motion blur; at the peak the incoming image takes over and its streaks shrink back into its highlights as it sharpens
// Tags: light, flare, motion-blur, glow

// @range(0, 2) Length of the streaks at the peak, in frame widths
uniform float reach; // = 0.6
// @range(0, 1) Brightness above which the image flares
uniform float threshold; // = 0.7
// @range(0, 4) Brightness of the streaks
uniform float intensity; // = 1.5
// @color Tint of the streaks, toward their ends
uniform vec3 tint; // = vec3(0.45, 0.7, 1.0)
// @range(0, 0.5) Length of the motion blur at the peak
uniform float blur; // = 0.1
// @param Streak and smear vertically instead
uniform bool vertical; // = false

const int BLUR_TAPS = 6;
// taps on each side of a streak, spaced further and further apart along its falloff
const int STREAK_TAPS = 11;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// the image on screen: the outgoing one, then the incoming one after a short switch
vec4 frame(vec2 st, float m) {
  if (m <= 0.0) return getFromColor(st);
  if (m >= 1.0) return getToColor(st);
  return mix(getFromColor(st), getToColor(st), m);
}

// the light of a pixel: its color above the threshold
vec3 glow(vec4 c, float knee) {
  float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  return c.rgb * c.a * smoothstep(knee, knee + 0.2, lum);
}

// one image only, for the blur and streak taps: during the switch, every other tap reads each image
vec4 light(vec2 st, float m, bool incoming) {
  if (m <= 0.0) return getFromColor(st);
  if (m >= 1.0) return getToColor(st);
  return incoming ? getToColor(st) : getFromColor(st);
}

float lightWeight(float m, bool incoming) {
  if (m <= 0.0 || m >= 1.0) return 1.0;
  return incoming ? 2.0 * m : 2.0 * (1.0 - m);
}

vec4 transition(vec2 uv) {
  float p = progress;
  // eased in on the outgoing side, and quickly out after the switch so the incoming image lands sharp
  float amount = p < 0.5 ? smoothstep(0.0, 0.5, p) : pow(2.0 - 2.0 * p, 3.0);
  float peak = amount * amount * amount;
  float m = smoothstep(0.44, 0.56, p);
  vec2 axis = vertical ? vec2(0.0, 1.0) : vec2(1.0, 0.0);
  // a small shift of the taps, under their spacing, blends their copies into a smooth smear;
  // hashed by integer cell so that every GPU computes the same shift
  float jitter = hash12(floor(uv * vec2(ratio, 1.0) * 997.0)) - 0.5;

  // the image smears along the streaks (a tent filter)
  float smear = blur * amount;
  vec3 base = vec3(0.0);
  float alpha = 0.0;
  float total = 0.0;
  for (int i = 0; i < BLUR_TAPS; i++) {
    float t = (float(i) + 0.5 + jitter) / float(BLUR_TAPS) - 0.5;
    float w = 1.0 - abs(t);
    total += w;
    bool incoming = mod(float(i), 2.0) > 0.5;
    w *= lightWeight(m, incoming);
    vec4 c = light(mirror(uv + axis * t * smear), m, incoming);
    base += w * c.rgb * c.a;
    alpha += w * c.a;
  }
  base /= total;
  alpha /= total;

  // the streaks: the light above the threshold, spread along the axis with an exponential falloff
  float falloff = 0.25 * reach * amount;
  float knee = mix(threshold, 0.8 * threshold, peak);
  vec3 streak = glow(frame(uv, m), knee);
  float weights = 1.0;
  for (int k = 1; k <= STREAK_TAPS; k++) {
    // the distance in units of the falloff, and the stretch of the streak this tap stands for
    float d = exp(0.14 * (float(k) + 0.8 * jitter)) - 1.0;
    float span = 0.14 * (d + 1.0);
    // white at the source, tinted along the streak, red fading first so the tails turn blue and violet
    vec3 hue = mix(vec3(1.0), tint, smoothstep(0.0, 0.8, d));
    hue *= exp(-d * vec3(0.6, 0.2, -0.15));
    float w = exp(-d) * span * 4.0;
    bool incoming = mod(float(k), 2.0) > 0.5;
    vec4 ahead = light(mirror(uv + axis * d * falloff), m, incoming);
    vec4 behind = light(mirror(uv - axis * d * falloff), m, !incoming);
    streak += w * hue * (glow(ahead, knee) * lightWeight(m, incoming) + glow(behind, knee) * lightWeight(m, !incoming));
    weights += 2.0 * w;
  }
  streak *= intensity * amount * (0.6 + 2.4 * peak) * 2.0 / weights;
  // compressed, so that bright skies never flatten into white
  streak = 0.85 * (1.0 - exp(-streak));

  // a lift of the exposure at the peak, then the streaks screened on top (premultiplied colors)
  base = min(base * (1.0 + 0.2 * peak), vec3(alpha));
  vec3 color = base + streak - base * streak;
  float a = alpha + max(streak.r, max(streak.g, streak.b)) * (1.0 - alpha);
  return vec4(clamp(color / max(a, 1e-5), 0.0, 1.0), a);
}
`,author:"gre",license:"MIT",description:"The highlights of the outgoing image flare into long horizontal (or vertical) lens streaks while it smears with motion blur; at the peak the incoming image takes over and its streaks shrink back into its highlights as it sharpens",tags:["light","flare","motion-blur","glow"],params:{reach:{type:"float",default:.6,min:0,max:2,description:"Length of the streaks at the peak, in frame widths"},threshold:{type:"float",default:.7,min:0,max:1,description:"Brightness above which the image flares"},intensity:{type:"float",default:1.5,min:0,max:4,description:"Brightness of the streaks"},tint:{type:"vec3",default:[.45,.7,1],color:!0,description:"Tint of the streaks, toward their ends"},blur:{type:"float",default:.1,min:0,max:.5,description:"Length of the motion blur at the peak"},vertical:{type:"bool",default:!1,description:"Streak and smear vertically instead"}},textures:[],createdAt:"Sat, 31 Oct 2026 23:20:50 +0100",updatedAt:"Sat, 31 Oct 2026 23:20:50 +0100"},{name:"LightWipe",paramsTypes:{direction:"vec2",width:"float",intensity:"float",color:"vec3"},defaultParams:{direction:[1,-.35],width:.04,intensity:1.2,color:[1,.86,.66]},glsl:`// Author: gre
// License: MIT
// Description: A band of intense light sweeps across the frame like a glint on glass, blooming the highlights of both images, and leaves the incoming image behind it
// Tags: wipe, light, glow, glint

// @param Direction the band of light moves toward
uniform vec2 direction; // = vec2(1.0, -0.35)
// @range(0.005, 0.2) Width of the bright core of the band, in frame heights
uniform float width; // = 0.04
// @range(0, 3) Brightness of the light
uniform float intensity; // = 1.2
// @color Tint of the light, toward the edges of the band (its core burns white)
uniform vec3 color; // = vec3(1.0, 0.86, 0.66)

const int TAPS = 12;

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// a gentle ease in and out, which does not linger at the ends
float ease(float t) {
  return 0.5 * (t + t * t * (3.0 - 2.0 * t));
}

// the image on screen at a point: the outgoing one ahead of the switch, the incoming one behind it
// (both always sampled, so that no texture read sits in a branch that differs between pixels)
vec4 frame(vec2 st, float m) {
  return mix(getFromColor(st), getToColor(st), m);
}

// the light of a pixel (premultiplied): its color above a soft knee
vec3 highlight(vec4 c) {
  float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  return c.rgb * c.a * smoothstep(0.45, 1.0, lum);
}

vec4 transition(vec2 uv) {
  vec2 dir = length(direction) > 0.0 ? normalize(direction) : vec2(1.0, 0.0);
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0);
  // half extent of the frame along the direction
  float e = 0.5 * (abs(dir.x) * ratio + abs(dir.y));
  float w = max(width, 0.001);
  float s = 0.35 * w;
  // the band starts and ends outside of the frame, with the switch out of sight
  float margin = s + 2.0 * w;
  float pos = -e - margin + 2.0 * (e + margin) * ease(progress);
  // signed distance to the middle of the band: < 0 has been swept
  float d = dot(p, dir) - pos;
  float m = 1.0 - smoothstep(-s, s, d);

  // the light ignites as it enters and dies away as it leaves: exactly none at both ends
  float env = smoothstep(0.0, 0.2, progress) * (1.0 - smoothstep(0.8, 1.0, progress));
  // a hot core, a thinner glint trailing behind it, and a wide soft halo
  float core = exp(-d * d / (w * w));
  float g = (d + 2.2 * w) / (0.3 * w);
  float glint = 0.45 * exp(-g * g);
  float halo = 0.35 * exp(-abs(d) / (5.0 * w));
  float band = (core + glint + halo) * env * intensity;
  // the moving glint itself, where the highlights bloom
  float glow = (core + glint) * env * intensity;

  vec4 c = frame(uv, m);

  // the highlights near the band bloom along it: taps across the band, sampled where the band is brightest
  vec3 bloom = vec3(0.0);
  // spread over the band, short enough that its taps blend into a smooth glow
  float spread = min(3.0 * w, 0.12);
  for (int i = 0; i < TAPS; i++) {
    float t = (float(i) + 0.5) / float(TAPS) * 2.0 - 1.0;
    vec2 st = mirror((p + dir * (t * spread)) / vec2(ratio, 1.0) + 0.5);
    // the image on screen where the tap reads, on the same side of the switch
    float dq = dot((st - 0.5) * vec2(ratio, 1.0), dir) - pos;
    bloom += (1.0 - abs(t)) * highlight(frame(st, 1.0 - smoothstep(-s, s, dq)));
  }
  // the sum of the tent weights
  bloom /= 0.5 * float(TAPS);

  // white at the heart of the core, tinted toward the edges of the band
  vec3 hue = mix(color, vec3(1.0), core * core);
  float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  // the light lifts the image, the bright parts more: exposure that rolls off softly to white, never clipping
  vec3 light = hue * band * (0.3 + 0.9 * lum) + hue * bloom * glow * 4.0 + hue * core * env * intensity * 1.6;
  vec3 rgb = 1.0 - (1.0 - c.rgb) * exp(-light);
  // light adds to the image, not to its alpha
  return vec4(rgb, c.a);
}
`,author:"gre",license:"MIT",description:"A band of intense light sweeps across the frame like a glint on glass, blooming the highlights of both images, and leaves the incoming image behind it",tags:["wipe","light","glow","glint"],params:{direction:{type:"vec2",default:[1,-.35],description:"Direction the band of light moves toward"},width:{type:"float",default:.04,min:.005,max:.2,description:"Width of the bright core of the band, in frame heights"},intensity:{type:"float",default:1.2,min:0,max:3,description:"Brightness of the light"},color:{type:"vec3",default:[1,.86,.66],color:!0,description:"Tint of the light, toward the edges of the band (its core burns white)"}},textures:[],createdAt:"Mon, 2 Nov 2026 12:39:22 +0100",updatedAt:"Mon, 2 Nov 2026 12:39:22 +0100"},{name:"LightningFlash",paramsTypes:{bolts:"int",strike:"float",seed:"float",color:"vec3",glow:"float",flashes:"int"},defaultParams:{bolts:2,strike:.55,seed:0,color:[.75,.85,1],glow:.5,flashes:3},glsl:`// Author: gre
// License: MIT
// Description: Forked lightning bolts crack down from the top of the frame, the screen flashes white in a few stuttering strobes, and the incoming image appears lit by the last flickers as they fade out
// Tags: light, flash, weather, strobe

// @range(1, 3, 1) Number of bolts: the main one strikes the ground, the others fork out higher in the sky
uniform int bolts; // = 2
// @range(0, 1) Where the main bolt strikes, from the left (0) to the right (1) of the frame
uniform float strike; // = 0.55
// @range(0, 100, 1) Changes the shape of the bolts
uniform float seed; // = 0.0
// @color Color of the light, added to the images
uniform vec3 color; // = vec3(0.75, 0.85, 1.0)
// @range(0, 1) Size and brightness of the glow around the bolts
uniform float glow; // = 0.5
// @range(1, 4, 1) Number of strobes; the images switch during the brightest one
uniform int flashes; // = 3

// the bolts crack down until this time, then the strobes start
const float LEADER = 0.3;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// a value noise that is linear between its cells: a jagged polyline, centered on 0
float jag(float s, float k) {
  float i = floor(s);
  return mix(hash(vec2(i, k)), hash(vec2(i + 1.0, k)), fract(s)) - 0.5;
}

// the zigzag of a bolt around its straight line, at height y (narrower in a portrait frame)
float zigzag(float y, float k) {
  return min(ratio, 1.0) * (0.15 * jag(y * 5.0, k) + 0.06 * jag(y * 13.0, k + 1.0) + 0.03 * jag(y * 31.0, k + 2.0) + 0.012 * jag(y * 67.0, k + 3.0));
}

// the x of a bolt at height y: from x0 at the top (y = 1) to x1 at its end (y = y1),
// given z0 and z1, its zigzag at both ends
float boltX(float y, float x0, float x1, float y1, float z0, float z1, float k) {
  float t = (1.0 - y) / (1.0 - y1);
  return mix(x0 - z0, x1 - z1, t) + zigzag(y, k);
}

// the x of a branch at height y: it leaves its bolt at (xb, yb), where its own zigzag is zb,
// and drifts sideways by dir per unit of height
float branchX(float y, float xb, float yb, float zb, float dir, float k) {
  return xb + dir * (yb - y) + 0.6 * (zigzag(y, k) - zb);
}

// distance to a curve x = f(y), knowing its x and its slope at the pixel's height,
// and how far above or below its ends the pixel is; the slope only corrects the distance
// close to the curve, so the glow farther away does not streak along the zigzags
float curveDist(vec2 q, float x, float slope, float outside) {
  float dx = abs(q.x - x);
  float d = dx * mix(inversesqrt(1.0 + slope * slope), 1.0, smoothstep(0.0, 0.08, dx));
  return length(vec2(d, max(outside, 0.0)));
}

// a strobe at time t0: a quick rise, a plateau of length hold, then a decay
float pulse(float p, float t0, float hold, float decay) {
  float x = p - t0;
  if (x < 0.0) return smoothstep(-0.012, 0.0, x);
  return exp(-max(x - hold, 0.0) / decay);
}

vec4 transition(vec2 uv) {
  float p = progress;
  vec2 q = vec2(uv.x * ratio, uv.y);
  // (seeds far apart, so that neighboring seeds share no hash keys)
  float k0 = floor(seed) * 61.0;
  int nb = bolts < 1 ? 1 : (bolts > 3 ? 3 : bolts);
  int nf = flashes < 1 ? 1 : (flashes > 4 ? 4 : flashes);
  // the images switch during the brightest strobe, the second one (or the only one)
  int cut = nf > 1 ? 1 : 0;

  // the strobes, a bit irregular; the bolts are lit by all of them, the screen mostly by the brightest
  float flash = 0.0;
  float lit = 0.0;
  float tCut = LEADER;
  float tLast = LEADER;
  float t = LEADER;
  for (int i = 0; i < 4; i++) {
    if (i < nf) {
      bool isCut = i == cut;
      float amp = isCut ? 1.0 : (i < cut ? 0.55 : 0.7 * pow(0.75, float(i - cut - 1)));
      float s = amp * pulse(p, t, isCut ? 0.025 : 0.004, isCut ? 0.03 : 0.022);
      flash = max(flash, s);
      lit = max(lit, pulse(p, t, 0.01, 0.045));
      if (isCut) tCut = t;
      tLast = t;
      t += (isCut ? 0.12 : 0.08) + 0.04 * hash(vec2(float(i), k0 + 5.0));
    }
  }
  // the stutter: the light jumps from one level to another a few times per strobe
  float stutter = mix(0.7, 1.0, hash(vec2(floor(p * 70.0), k0 + 9.0)));
  flash *= stutter;
  // the brightest strobe whites the screen out while the images switch
  float whiteout = pulse(p, tCut, 0.025, 0.02);
  // then a few last flickers, fading out
  float tail = p > tLast ? exp(-(p - tLast) / 0.1) * smoothstep(0.03, 0.06, p - tLast) : 0.0;
  flash = max(flash, 0.35 * tail * step(0.45, hash(vec2(floor(p * 40.0), k0 + 13.0))));

  // the bolts crack down in a few jumps while faintly lit, then light up with the strobes and go out
  float grow = clamp(p / LEADER, 0.0, 1.0);
  grow = (floor(grow * 7.0) + smoothstep(0.0, 1.0, fract(grow * 7.0))) / 7.0;
  float faint = 0.5 * mix(0.6, 1.0, hash(vec2(floor(p * 50.0), k0 + 11.0)));
  float boltLight = p < LEADER ? faint * smoothstep(0.0, 0.06, p) : max(lit * stutter, faint * exp(-(p - LEADER) / 0.12));
  boltLight = max(boltLight, 0.6 * flash * tail);
  boltLight *= 1.0 - smoothstep(tLast + 0.1, tLast + 0.3, p);

  // the bolts: the main one strikes the ground at strike, the others stop in the sky
  float core = 0.0;
  float halo = 0.0;
  float near = 10.0;
  bool lightsOn = boltLight > 0.0 || flash > 0.0;
  for (int b = 0; b < 3; b++) {
    if (b < nb && lightsOn) {
      float fb = float(b);
      float kb = k0 + fb * 17.0;
      float x1 = strike * ratio;
      float y1 = -0.05;
      float bright = 1.0;
      if (b > 0) {
        // the second bolt goes to the roomier side, the third to the other side if there is room there
        float roomy = strike < 0.5 ? 1.0 : -1.0;
        bool cramped = min(strike, 1.0 - strike) < 0.25;
        float side = b == 1 || cramped ? roomy : -roomy;
        float dist = b == 2 && cramped ? 0.5 : 0.22;
        x1 = clamp(x1 + side * ratio * (dist + 0.12 * hash(vec2(fb, kb))), 0.08 * ratio, 0.92 * ratio);
        y1 = 0.25 + 0.25 * hash(vec2(fb, kb + 1.0));
        bright = 0.7;
      }
      float x0 = clamp(x1 + (hash(vec2(fb, kb + 2.0)) - 0.5) * 0.5 * min(ratio, 1.0), 0.1 * ratio, 0.9 * ratio);
      // the tip of the bolt while it cracks down
      float tip = mix(1.02, y1, grow);
      // (the slope is measured over a few pixels, so it changes smoothly at the corners)
      float e = 0.01;
      float z0 = zigzag(1.0, kb);
      float z1 = zigzag(y1, kb);
      float x = boltX(q.y, x0, x1, y1, z0, z1, kb);
      float slope = (boltX(q.y + e, x0, x1, y1, z0, z1, kb) - boltX(q.y - e, x0, x1, y1, z0, z1, kb)) / (2.0 * e);
      float d = curveDist(q, x, slope, max(max(y1, tip) - q.y, q.y - 1.05));
      near = min(near, d);
      float w = 0.003 * mix(1.0, 0.7, fb / 2.0);
      core += bright * exp(-d * d / (w * w));
      halo += bright * (0.7 * exp(-d * 24.0) + 0.25 * exp(-d * 6.0));
      // three branches, leaving the bolt on either side and fading toward their ends
      for (int j = 0; j < 3; j++) {
        float fj = float(j);
        float kj = kb + 3.0 + fj * 5.0;
        float tb = 0.12 + 0.2 * fj + 0.15 * hash(vec2(fj, kj));
        float yb = mix(1.0, y1, tb);
        float len = (0.3 + 0.25 * hash(vec2(fj, kj + 1.0))) * (1.0 - tb) * (1.0 - y1);
        float dir = (j == 1 ? -1.0 : 1.0) * (0.2 + 0.45 * hash(vec2(fj, kj + 2.0))) * min(ratio, 1.0);
        float xb = boltX(yb, x0, x1, y1, z0, z1, kb);
        float zb = zigzag(yb, kj);
        float bx = branchX(q.y, xb, yb, zb, dir, kj);
        float bs = (branchX(q.y + e, xb, yb, zb, dir, kj) - branchX(q.y - e, xb, yb, zb, dir, kj)) / (2.0 * e);
        float bd = curveDist(q, bx, bs, max(max(yb - len, tip) - q.y, q.y - yb));
        near = min(near, bd);
        float along = clamp((yb - q.y) / len, 0.0, 1.0);
        float fade = bright * (1.0 - 0.8 * along);
        float bw = w * mix(0.8, 0.4, along);
        core += fade * exp(-bd * bd / (bw * bw));
        halo += fade * 0.6 * (0.7 * exp(-bd * 24.0) + 0.25 * exp(-bd * 6.0));
      }
    }
  }

  // the outgoing image gives way to the incoming one at the brightest strobe, hidden by it
  float m = smoothstep(tCut, tCut + 0.025, p);
  vec4 c = vec4(0.0);
  if (m < 1.0) {
    vec4 a = getFromColor(uv);
    c += (1.0 - m) * vec4(a.rgb * a.a, a.a);
  }
  if (m > 0.0) {
    vec4 a = getToColor(uv);
    c += m * vec4(a.rgb * a.a, a.a);
  }
  if (c.a <= 0.0) return vec4(0.0);
  vec3 col = c.rgb / c.a;

  // the effect fades in at the start and is gone at the end
  float live = smoothstep(0.0, 0.03, p) * (1.0 - smoothstep(0.85, 1.0, p));
  // the sky darkens a little as the storm builds, then the strobes overexpose the image,
  // more around the bolts, and the bolts glow over it
  float dim = 0.4 * smoothstep(0.0, LEADER, p) * (1.0 - smoothstep(tCut, tLast + 0.15, p));
  float f = flash * mix(0.6 + 0.4 * exp(-near * 4.0), 1.0, smoothstep(0.6, 1.0, flash));
  col *= 1.0 - dim * live;
  col = col * (1.0 + 2.5 * f * live) + color * (1.1 * f * live);
  float g = 0.4 + 1.2 * glow;
  vec3 light = mix(color, vec3(1.0), 0.75) * min(core, 1.5) * 1.6 + color * g * halo;
  col += light * boltLight * live;
  col = mix(col, vec3(1.0), 0.92 * whiteout * live);
  return vec4(clamp(col, 0.0, 1.0), c.a);
}
`,author:"gre",license:"MIT",description:"Forked lightning bolts crack down from the top of the frame, the screen flashes white in a few stuttering strobes, and the incoming image appears lit by the last flickers as they fade out",tags:["light","flash","weather","strobe"],params:{bolts:{type:"int",default:2,min:1,max:3,step:1,description:"Number of bolts: the main one strikes the ground, the others fork out higher in the sky"},strike:{type:"float",default:.55,min:0,max:1,description:"Where the main bolt strikes, from the left (0) to the right (1) of the frame"},seed:{type:"float",default:0,min:0,max:100,step:1,description:"Changes the shape of the bolts"},color:{type:"vec3",default:[.75,.85,1],color:!0,description:"Color of the light, added to the images"},glow:{type:"float",default:.5,min:0,max:1,description:"Size and brightness of the glow around the bolts"},flashes:{type:"int",default:3,min:1,max:4,step:1,description:"Number of strobes; the images switch during the brightest one"}},textures:[],createdAt:"Thu, 5 Nov 2026 11:34:09 +0100",updatedAt:"Thu, 5 Nov 2026 11:34:09 +0100"},{name:"LiquidFill",paramsTypes:{direction:"vec2",amplitude:"float",waves:"float",highlight:"vec4",refraction:"float",bubbles:"float"},defaultParams:{direction:[0,1],amplitude:.06,waves:1.5,highlight:[1,1,1,.8],refraction:.03,bubbles:.5},glsl:`// Author: gre
// License: MIT
// Description: The incoming image rises over the outgoing one like liquid filling a glass, its surface sloshing in waves, lit by a bright meniscus line, bending the image just below it, with a few bubbles rising through it
// Tags: liquid, water, wave, directional, reveal

// @param Direction the liquid rises toward
uniform vec2 direction; // = vec2(0.0, 1.0)
// @range(0, 0.3) Height of the waves on the surface, in frame heights
uniform float amplitude; // = 0.06
// @range(0.5, 6) Number of waves across the frame
uniform float waves; // = 1.5
// @color Color of the bright line along the surface and the rims of the bubbles (its alpha is its strength)
uniform vec4 highlight; // = vec4(1.0, 1.0, 1.0, 0.8)
// @range(0, 0.1) How much the incoming image is bent just below the surface
uniform float refraction; // = 0.03
// @range(0, 1) How many bubbles rise through the liquid
uniform float bubbles; // = 0.5

const float PI = 3.141592653589793;
// half width of the antialiased edges, in frame heights
const float AA = 0.0015;
// width of the meniscus line, in frame heights
const float LINE = 0.006;
// size of the cells the bubbles are scattered in, in frame heights
const float CELL = 0.08;

float hash (vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// height of the surface above its mean level at x (across the frame, from -1 to 1), between -1 and 1:
// a slosh from side to side and a smaller wave running along it
float surface (float x, float t) {
  float k = PI * max(waves, 0.01);
  return 0.6 * sin(k * x + 0.5 * PI) * cos(2.0 * PI * 1.3 * t)
       + 0.4 * sin(1.7 * k * x - 9.0 * t + 1.3);
}

vec4 transition (vec2 uv) {
  vec4 a = getFromColor(uv);
  if (progress <= 0.0) return a;
  if (progress >= 1.0) return getToColor(uv);

  vec2 dir = length(direction) > 0.0 ? normalize(direction) : vec2(0.0, 1.0);
  vec2 across = vec2(-dir.y, dir.x);
  // measured in square pixels, so the waves and bubbles are not stretched
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0);
  // half extents of the frame along the direction and across it
  float e = 0.5 * (abs(dir.x) * ratio + abs(dir.y));
  float w = 0.5 * (abs(dir.y) * ratio + abs(dir.x));
  float d = dot(p, dir);
  float x = dot(p, across);
  float t = progress;
  // the liquid moves most in the middle of the transition and settles at the ends
  float stir = sin(PI * t);
  float amp = max(amplitude, 0.0) * (0.35 + 0.65 * stir);
  // the surface starts fully below the frame and ends fully above it, waves and meniscus included
  float margin = max(amplitude, 0.0) + 2.0 * LINE + AA;
  float mean = mix(-e - margin, e + margin, mix(t, t * t * (3.0 - 2.0 * t), 0.5));
  float level = mean + amp * surface(x / w, t);
  // > 0 below the surface, in the liquid
  float depth = level - d;
  float m = smoothstep(-AA, AA, depth);

  // the incoming image is bent by the waves just below the surface, less and less deeper down
  float bend = refraction * stir * exp(-max(depth, 0.0) / 0.06);
  vec2 offset = bend * (dir * sin(18.0 * x - 7.0 * t) + across * cos(13.0 * x + 5.0 * t));
  vec4 b = getToColor(clamp(uv + offset / vec2(ratio, 1.0), 0.0, 1.0));

  // bubbles rise in columns through the liquid, carried up with it and rising faster still
  float glow = 0.0;
  float rise = mean + 0.5 * t;
  vec2 bq = vec2(x, d - rise) / CELL;
  vec2 cell = floor(bq);
  float hs = hash(cell + 7.1);
  float r = (0.12 + 0.18 * hash(cell + 3.7)) * stir;
  float px = AA / CELL;
  if (hs < bubbles * 0.6 && r > px) {
    // placed so that it stays inside its cell, wobble and soft edge included
    vec2 c = cell + 0.5 + (0.42 - r - px) * (vec2(hash(cell + 1.3), hash(cell + 9.4)) * 2.0 - 1.0);
    // a slight wobble as it rises
    c.x += 0.08 * sin(6.0 * t + 6.28 * hs);
    float dist = length(bq - c);
    // its rim, and a small glint near its top
    float rim = smoothstep(0.7 * r - px, 0.7 * r + px, dist) * (1.0 - smoothstep(r - px, r + px, dist));
    float glint = 1.0 - smoothstep(0.25 * r - px, 0.25 * r + px, length(bq - c - 0.45 * r * vec2(-0.7, 0.7)));
    // only in the liquid, and fading out as it nears the surface
    glow = max(rim * 0.6, glint) * smoothstep(0.0, 0.05, depth) * stir;
  }
  // the meniscus: a bright line along the surface, on the liquid side
  float line = 1.0 - smoothstep(LINE - AA, LINE + AA, abs(depth - LINE));
  line += 0.35 * stir * exp(-max(depth, 0.0) / 0.03) * m;
  float light = highlight.a * clamp(max(line, glow), 0.0, 1.0) * (0.4 + 0.6 * stir);
  b.rgb = mix(b.rgb, highlight.rgb, light);

  // mixed premultiplied, so transparent images do not bleed their color
  vec4 c = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The incoming image rises over the outgoing one like liquid filling a glass, its surface sloshing in waves, lit by a bright meniscus line, bending the image just below it, with a few bubbles rising through it",tags:["liquid","water","wave","directional","reveal"],params:{direction:{type:"vec2",default:[0,1],description:"Direction the liquid rises toward"},amplitude:{type:"float",default:.06,min:0,max:.3,description:"Height of the waves on the surface, in frame heights"},waves:{type:"float",default:1.5,min:.5,max:6,description:"Number of waves across the frame"},highlight:{type:"vec4",default:[1,1,1,.8],color:!0,description:"Color of the bright line along the surface and the rims of the bubbles (its alpha is its strength)"},refraction:{type:"float",default:.03,min:0,max:.1,description:"How much the incoming image is bent just below the surface"},bubbles:{type:"float",default:.5,min:0,max:1,description:"How many bubbles rise through the liquid"}},textures:[],createdAt:"Wed, 4 Nov 2026 20:12:38 +0100",updatedAt:"Wed, 4 Nov 2026 20:12:38 +0100"},{name:"LissajousTiles",paramsTypes:{speed:"float",freq:"vec2",offset:"float",zoom:"float",fade:"float"},defaultParams:{speed:.5,freq:[2,3],offset:2,zoom:.8,fade:3},glsl:`// Author: Boundless <info@boundless-beta.com>
// License: MIT
// Description: The image breaks into a grid of tiles that swirl along Lissajous curves, in a Scanimate style, and flip one by one to the incoming image before settling back
// Tags: tiles, grid, motion, retro
// <3

// @param Speed of the tiles along their curves
uniform float speed; // = 0.5;
// @param Number of loops of the curve, horizontally and vertically
uniform vec2 freq; // = vec2(2.,3.);
// @param Extra vertical speed, which bends the curve
uniform float offset; // = 2.;
// @range(0, 2) Size of the curve, relative to the image
uniform float zoom; // = 0.8;
// @range(0, 10) Spread of the tile-by-tile switch to the incoming image
uniform float fade; // = 3.;

const vec2 grid = vec2(10.,10.); // grid size
const float TAU = 6.283185307;

vec4 transition (vec2 uv) {
  // The tiles leave and come back with zero speed, so the image does not break apart in the first frame
  float p = 1.-pow(1.-smoothstep(0.,1.,1.-abs(1.-2.*progress)),3.); // transition curve
  // Find the last tile that covers this pixel (looping backwards, the first hit), then sample the images once
  for (float jBig = grid.y-1.; jBig >= 0.; jBig--) {
    for (float iBig = grid.x-1.; iBig >= 0.; iBig--) {
      float i = iBig/grid.x;
      float j = jBig/grid.y;
      float k = i/grid.y+j; // order of the tile along the curve
      vec2 uv0 = uv + vec2(i,j) - 0.5 + 0.5/grid + vec2(cos(k*TAU*freq.x+progress*6.*speed),sin(k*TAU*freq.y+progress*6.*(1.+offset)*speed))*zoom/2.;
      uv0 = mix(uv, uv0, p);
      if (uv0.x >= i && uv0.x < i+1./grid.x && uv0.y >= j && uv0.y < j+1./grid.y) { // mask for each (i,j) tile
        float tileMix = clamp(progress*((1.+fade)*2.*progress)-fade+k*fade, 0., 1.);
        return mix(getFromColor(uv0), getToColor(uv0), tileMix);
      }
    }
  }
  return vec4(0.); // between the tiles: transparent
}
`,author:"Boundless <info@boundless-beta.com>",license:"MIT",description:"The image breaks into a grid of tiles that swirl along Lissajous curves, in a Scanimate style, and flip one by one to the incoming image before settling back",tags:["tiles","grid","motion","retro"],params:{speed:{type:"float",default:.5,description:"Speed of the tiles along their curves"},freq:{type:"vec2",default:[2,3],description:"Number of loops of the curve, horizontally and vertically"},offset:{type:"float",default:2,description:"Extra vertical speed, which bends the curve"},zoom:{type:"float",default:.8,min:0,max:2,description:"Size of the curve, relative to the image"},fade:{type:"float",default:3,min:0,max:10,description:"Spread of the tile-by-tile switch to the incoming image"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"LumaWipe",paramsTypes:{},defaultParams:{},glsl:`// Author: gre
// License: MIT
// Description: A wipe that follows the brightness of a grayscale mask (the luma texture)
// Tags: wipe, luma, mask

uniform sampler2D luma;

vec4 transition(vec2 uv) {
  return mix(
    getToColor(uv),
    getFromColor(uv),
    step(progress, texture2D(luma, uv).r)
  );
}
`,author:"gre",license:"MIT",description:"A wipe that follows the brightness of a grayscale mask (the luma texture)",tags:["wipe","luma","mask"],params:{},textures:["luma"],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"LuminanceMelt",paramsTypes:{direction:"bool",l_threshold:"float",above:"bool"},defaultParams:{direction:!0,l_threshold:.8,above:!1},glsl:`// Author: 0gust1
// License: MIT
// Description: The outgoing image melts away in noisy vertical streaks, depending on its brightness
// Tags: melt, noise, luma
//My own first transition — based on crosshatch code (from pthrasher), using  simplex noise formula (copied and pasted)
//-> cooler with high contrasted images (isolated dark subject on light background f.e.)
//TODO : try to rebase it on DoomTransition (from zeh)?
//optimizations :
//luminance (see http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color#answer-596241)
// Y = (R+R+B+G+G+G)/6
//or Y = (R+R+R+B+G+G+G+G)>>3 


//direction of movement :  0 : up, 1, down
// @param Direction of the melt (false: up, true: down)
uniform bool direction; // = true
//luminance threshold
// @range(0, 1) Luminance threshold
uniform float l_threshold; // = 0.8 
//does the movement takes effect above or below luminance threshold ?
// @param Melt the parts above the threshold instead of below
uniform bool above; // = false 


//Random function borrowed from everywhere
float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}


// Simplex noise :
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : MIT  
//               2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Simplex noise -- end

float luminance(vec4 color){
  //(0.299*R + 0.587*G + 0.114*B)
  return color.r*0.299+color.g*0.587+color.b*0.114;
}

vec4 transition(vec2 uv) {
  vec2 center = vec2(1.0, direction);
  vec2 p = uv.xy / vec2(1.0).xy;
  if (progress == 0.0) {
    return getFromColor(p);
  } else if (progress == 1.0) {
    return getToColor(p);
  } else {
    float x = progress;
    float dist = distance(center, p)- progress*exp(snoise(vec2(p.x, 0.0)));
    float r = x - rand(vec2(p.x, 0.1));
    float m;
    if(above){
     m = dist <= r && luminance(getFromColor(p))>l_threshold ? 1.0 : (progress*progress*progress);
    }
    else{
     m = dist <= r && luminance(getFromColor(p))<l_threshold ? 1.0 : (progress*progress*progress);  
    }
    return mix(getFromColor(p), getToColor(p), m);    
  }
}
`,author:"0gust1",license:"MIT",description:"The outgoing image melts away in noisy vertical streaks, depending on its brightness",tags:["melt","noise","luma"],params:{direction:{type:"bool",default:!0,description:"Direction of the melt (false: up, true: down)"},l_threshold:{type:"float",default:.8,min:0,max:1,description:"Luminance threshold"},above:{type:"bool",default:!1,description:"Melt the parts above the threshold instead of below"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"MoireWipe",paramsTypes:{density:"float",bands:"float",drift:"float",lines:"float"},defaultParams:{density:36,bands:3,drift:.25,lines:.5},glsl:`// Author: gre
// License: MIT
// Description: Two sets of fine concentric rings, centered on two points that drift toward each other, overlay the image and interfere into a shifting moire of wide bands; the bands open onto the incoming image and widen until it fills the frame, while the thin dark and light ring lines fade away
// Tags: moire, rings, interference, pattern, graphic, reveal

// @range(10, 80) Number of rings per frame height in each set
uniform float density; // = 36.0
// @range(1, 8) How many moire bands the rings make at the start; they get fewer and wider as the centers come together
uniform float bands; // = 3.0
// @range(-1, 1) How far the two centers turn around each other, in turns
uniform float drift; // = 0.25
// @range(0, 1) Strength of the ring lines drawn over the image
uniform float lines; // = 0.5

const float PI = 3.141592653589793;
// half width of the antialiased edges, in frame heights
const float AA = 0.0012;
// half width of a ring line, in ring spacings
const float LINE = 0.1;
// widest antialiased edge of the bands, in bands, which also sets when they start and finish
// opening
const float EDGE = 0.05;
// angle of the line between the two centers at the start, in radians
const float START = 0.35;
// strength of the ring lines at lines = 1, so the image always shows through them
const float INK = 0.7;

// coverage of the ring lines at radius r, box-filtered over the antialiasing width, and
// faded to their mean coverage when the rings get too fine to resolve
float ringLines(float r, float f) {
  float q = abs(fract(r * f + 0.5) - 0.5);
  float aa = AA * f;
  float c = clamp((LINE - q) / (2.0 * aa) + 0.5, 0.0, 1.0);
  return mix(c, 2.0 * LINE, clamp(10.0 * aa - 0.5, 0.0, 1.0));
}

vec4 transition(vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  if (progress <= 0.0) return a;
  if (progress >= 1.0) return b;

  float t = progress * progress * (3.0 - 2.0 * progress);
  float f = max(density, 1.0);
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0);

  // the two centers turn around the middle of the frame and come together
  float ang = 2.0 * PI * drift * t + START;
  float k = max(bands, 1.0) * (1.0 - 0.75 * t);
  vec2 axis = vec2(cos(ang), sin(ang)) * 0.5 * k / f;
  float r1 = length(p - axis);
  float r2 = length(p + axis);
  // the second set is slightly finer than the first, which bends the bands into curves
  float f2 = f + 1.2 * k;

  // the beat of the two ring sets: wide bands where their rings line up, at this distance
  // from the middle of the nearest band, in bands
  float beat = abs(fract(f2 * r2 - f * r1 + 0.5) - 0.5);
  // the bands open from their middles and widen until they cover the frame
  // with an edge antialiased from the analytic gradient of the beat
  vec2 grad = f2 * (p + axis) / max(r2, AA) - f * (p - axis) / max(r1, AA);
  float s = min(AA * length(grad) + 0.004, EDGE);
  float w = mix(-EDGE, 0.5 + EDGE, t);
  float m = 1.0 - smoothstep(w - s, w + s, beat);

  vec4 c = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);

  // the thin lines of both sets, dark over the outgoing image and light over the incoming
  // one, fade in and out
  float o = INK * clamp(lines, 0.0, 1.0) * sin(PI * t);
  float l = 1.0 - (1.0 - o * ringLines(r1, f)) * (1.0 - o * ringLines(r2, f2));
  c.rgb = mix(c.rgb, vec3(c.a * m), l);
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"Two sets of fine concentric rings, centered on two points that drift toward each other, overlay the image and interfere into a shifting moire of wide bands; the bands open onto the incoming image and widen until it fills the frame, while the thin dark and light ring lines fade away",tags:["moire","rings","interference","pattern","graphic","reveal"],params:{density:{type:"float",default:36,min:10,max:80,description:"Number of rings per frame height in each set"},bands:{type:"float",default:3,min:1,max:8,description:"How many moire bands the rings make at the start; they get fewer and wider as the centers come together"},drift:{type:"float",default:.25,min:-1,max:1,description:"How far the two centers turn around each other, in turns"},lines:{type:"float",default:.5,min:0,max:1,description:"Strength of the ring lines drawn over the image"}},textures:[],createdAt:"Sun, 8 Nov 2026 17:40:10 +0100",updatedAt:"Sun, 8 Nov 2026 17:40:10 +0100"},{name:"Morph",paramsTypes:{strength:"float"},defaultParams:{strength:.1},glsl:`// Author: paniq
// License: MIT
// Description: A crossfade in which each image is displaced by the other's colors, like a morph
// Tags: morph, distort, blend
// @param Strength of the displacement
uniform float strength; // = 0.1

vec4 transition(vec2 p) {
  vec4 ca = getFromColor(p);
  vec4 cb = getToColor(p);
  
  vec2 oa = (((ca.rg+ca.b)*0.5)*2.0-1.0);
  vec2 ob = (((cb.rg+cb.b)*0.5)*2.0-1.0);
  vec2 oc = mix(oa,ob,0.5)*strength;
  
  float w0 = progress;
  float w1 = 1.0-w0;
  return mix(getFromColor(p+oc*w0), getToColor(p-oc*w1), progress);
}
`,author:"paniq",license:"MIT",description:"A crossfade in which each image is displaced by the other's colors, like a morph",tags:["morph","distort","blend"],params:{strength:{type:"float",default:.1,description:"Strength of the displacement"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"Mosaic",paramsTypes:{endx:"int",endy:"int"},defaultParams:{endx:2,endy:-1},glsl:`// License: MIT
// Author: Xaychru
// Description: The view pans across a mosaic of rotated tiles from both images and settles on the incoming one
// Tags: mosaic, tiles, zoom
// ported by gre from https://gist.github.com/Xaychru/130bb7b7affedbda9df5

#define PI 3.14159265358979323
#define POW2(X) X*X
#define POW3(X) X*X*X
uniform int endx; // = 2
uniform int endy; // = -1

float Rand(vec2 v) {
  return fract(sin(dot(v.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
vec2 Rotate(vec2 v, float a) {
  mat2 rm = mat2(cos(a), -sin(a),
                 sin(a), cos(a));
  return rm*v;
}
float CosInterpolation(float x) {
  return -cos(x*PI)/2.+.5;
}
vec4 transition(vec2 uv) {
  vec2 p = uv.xy / vec2(1.0).xy - .5;
  vec2 rp = p;
  float rpr = (progress*2.-1.);
  float z = -(rpr*rpr*2.) + 3.;
  float az = abs(z);
  rp *= az;
  rp += mix(vec2(.5, .5), vec2(float(endx) + .5, float(endy) + .5), POW2(CosInterpolation(progress)));
  vec2 mrp = mod(rp, 1.);
  vec2 crp = rp;
  bool onEnd = int(floor(crp.x))==endx&&int(floor(crp.y))==endy;
  if(!onEnd) {
    float ang = float(int(Rand(floor(crp))*4.))*.5*PI;
    mrp = vec2(.5) + Rotate(mrp-vec2(.5), ang);
  }
  if(onEnd || Rand(floor(crp))>.5) {
    return getToColor(mrp);
  } else {
    return getFromColor(mrp);
  }
}
`,author:"Xaychru",license:"MIT",description:"The view pans across a mosaic of rotated tiles from both images and settles on the incoming one",tags:["mosaic","tiles","zoom"],params:{endx:{type:"int",default:2},endy:{type:"int",default:-1}},textures:[],createdAt:"Mon, 12 Jun 2017 10:26:51 +0800",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"MultiplyBlend",paramsTypes:{},defaultParams:{},glsl:`// Author: Fernando Kuteken
// License: MIT
// Description: A crossfade through the multiplied blend of both images
// Tags: blend, fade

vec4 blend(vec4 a, vec4 b) {
  return a * b;
}

vec4 transition (vec2 uv) {
  
  vec4 blended = blend(getFromColor(uv), getToColor(uv));
  
  if (progress < 0.5)
    return mix(getFromColor(uv), blended, 2.0 * progress);
  else
    return mix(blended, getToColor(uv), 2.0 * progress - 1.0);
}

`,author:"Fernando Kuteken",license:"MIT",description:"A crossfade through the multiplied blend of both images",tags:["blend","fade"],params:{},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"NoiseDissolve",paramsTypes:{},defaultParams:{},glsl:`// Author: towrabbit
// License: MIT
// Description: The incoming image appears pixel by pixel in random noise
// Tags: dissolve, noise

float random (vec2 st) {
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}
vec4 transition (vec2 uv) {
  vec4 leftSide = getFromColor(uv);
  vec4 rightSide = getToColor(uv);
  float uvz = floor(random(uv)+progress);
  return mix(leftSide,rightSide,uvz);
}
`,author:"towrabbit",license:"MIT",description:"The incoming image appears pixel by pixel in random noise",tags:["dissolve","noise"],params:{},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"Overexposure",paramsTypes:{strength:"float"},defaultParams:{strength:.6},glsl:`// Author: Ben Zhang
// License: MIT
// Description: A crossfade through a washed-out, overexposed white
// Tags: flash, light, fade

// @param Amount of overexposure
uniform float strength; // = 0.6
const float PI = 3.141592653589793;

vec4 transition (vec2 uv) {
  vec4 from = getFromColor(uv);
  vec4 to = getToColor(uv);

  // Multipliers
  float from_m = 1.0 - progress + sin(PI * progress) * strength;
  float to_m = progress + sin(PI * progress) * strength;
  
  return vec4(
    from.r * from.a * from_m + to.r * to.a * to_m,
    from.g * from.a * from_m + to.g * to.a * to_m,
    from.b * from.a * from_m + to.b * to.a * to_m,
    mix(from.a, to.a, progress)
  );
}
`,author:"Ben Zhang",license:"MIT",description:"A crossfade through a washed-out, overexposed white",tags:["flash","light","fade"],params:{strength:{type:"float",default:.6,description:"Amount of overexposure"}},textures:[],createdAt:"Tue, 15 Mar 2022 20:21:15 +0800",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"PaperFold",paramsTypes:{direction:"vec2",tilt:"float",shading:"float",paper:"vec4"},defaultParams:{direction:[1,.5],tilt:.6,shading:.6,paper:[.95,.94,.9,1]},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image is a sheet of paper that folds in half in 3D along a vertical crease, then in half again along a horizontal one, its lit and shaded faces turning to show the back of the paper, and the small folded packet flies off the frame, leaving its shadow on the incoming image underneath
// Tags: paper, fold, 3d, shadow

// @param Direction the folded packet flies off toward
uniform vec2 direction; // = vec2(1.0, 0.5)
// @range(0, 1) How much the sheet tilts and recedes while it folds, so that the folds are seen in 3D
uniform float tilt; // = 0.6
// @range(0, 1) How much the faces darken as they turn away from the light, and the shadows they cast
uniform float shading; // = 0.6
// @color Color of the back of the paper, through which the print faintly shows
uniform vec4 paper; // = vec4(0.95, 0.94, 0.9, 1.0)

const float PI = 3.141592653589793;
// width of the anti-aliased edges, as a part of the frame's height
const float EDGE = 0.0015;
// how much the print shows through the back of the paper
const float SHOW = 0.1;
// width of the shaded crease, in frame heights
const float CREASE = 0.02;
// direction of the light, from the top left and the front
const vec3 LIGHT = vec3(-0.3995, 0.4494, 0.799);

vec4 front(vec2 st) {
  return getFromColor(st / vec2(ratio, 1.0));
}

vec4 back(vec2 st) {
  vec4 c = front(st);
  return vec4(mix(paper.rgb, c.rgb, SHOW), c.a * paper.a);
}

// the face of the packet's top layer: the image itself during the first fold, then the back
// of the right half, laid mirrored over the left half
vec4 topFace(vec2 st, bool second) {
  return second ? back(vec2(ratio - st.x, st.y)) : front(st);
}

// distance inside the rectangle [0, h] x [0, k] (negative outside)
float inside(vec2 p, float h, float k) {
  return min(min(p.x, h - p.x), min(p.y, k - p.y));
}

// The sheet in its own frame: a flat part [0, h] x [0, k] lying at z = 0 and a flap of the same
// size hinged on its edge x = h, turned toward the viewer so that it lies along \`along\`, with the
// normal n. During the second fold, x and y are swapped so that the crease is always along y.
// Where the ray o + t * v meets the flap's plane: (t, distance from the hinge, y), t < 0 if never.
vec3 hitFlap(vec3 o, vec3 v, float h, vec3 n, vec3 along) {
  float den = dot(n, v);
  if (abs(den) < 1e-5) return vec3(-1.0, 0.0, 0.0);
  vec3 hinge = vec3(h, 0.0, 0.0);
  float t = dot(n, hinge - o) / den;
  vec3 q = o + t * v;
  return vec3(t, dot(q - hinge, along), q.y);
}

// how much the point q is shaded, lit by l: by the flap, and by the flat part once it lifts
// above the incoming image
float shadowAt(vec3 q, vec3 l, float h, float k, vec3 n, vec3 along) {
  float sh = 0.0;
  if (q.z < -1e-4) {
    float soft = 0.004 - 0.4 * q.z;
    sh = smoothstep(-soft, soft, inside(q.xy - q.z / l.z * l.xy, h, k));
  }
  vec3 hit = hitFlap(q, l, h, n, along);
  if (hit.x > 0.0) {
    float height = hit.x * l.z;
    float soft = 0.004 + 0.3 * height;
    // the flap's shadow appears as it lifts and vanishes as it lands
    sh = max(sh, min(4.0 * n.x * n.x, 1.0) * smoothstep(-soft, soft, inside(hit.yz, h, k)) / (1.0 + 3.0 * height));
  }
  return sh;
}

// a vector of the frame into the frame of the sheet, turned by yaw (around y), pitch (around x)
// and spin (around z), each given as (cos, sin)
vec3 toSheet(vec3 v, vec2 yaw, vec2 pitch, vec2 spin) {
  v = vec3(yaw.x * v.x + yaw.y * v.z, v.y, yaw.x * v.z - yaw.y * v.x);
  v = vec3(v.x, pitch.x * v.y + pitch.y * v.z, pitch.x * v.z - pitch.y * v.y);
  return vec3(spin.x * v.x + spin.y * v.y, spin.x * v.y - spin.y * v.x, v.z);
}

vec4 transition(vec2 uv) {
  float w = ratio;
  float shade = clamp(shading, 0.0, 1.0);
  // the two folds, one right after the other, then the flight of the packet
  float s = 2.0 * smoothstep(0.0, 0.62, progress);
  bool second = s > 1.0;
  float x = second ? s - 1.0 : s;
  float a = PI * mix(x, x * x * (3.0 - 2.0 * x), 0.6);
  float f = clamp((progress - 0.5) / 0.47, 0.0, 1.0);

  // the sheet tilts and recedes while it folds, so that the folds are seen in 3D, and lies flat
  // again as the packet flies off
  float turn = clamp(tilt, 0.0, 1.0) * (smoothstep(0.0, 0.25, progress) - smoothstep(0.4, 0.8, progress));
  vec2 yaw = vec2(cos(0.45 * turn), sin(0.45 * turn));
  vec2 pitch = vec2(cos(0.55 * turn), -sin(0.55 * turn));
  float dist = 2.5 * max(w, 1.0);
  float recede = dist * 0.35 * turn;

  vec2 dir = length(direction) > 0.0 ? normalize(direction) : vec2(1.0, 0.0);
  // the point of the sheet held in the middle of the frame slides to the middle of the packet
  vec2 c = vec2(0.5 * w - 0.25 * w * min(s, 1.0), 0.5 - 0.25 * max(s - 1.0, 0.0));
  // far enough for the packet and its shadow to leave the frame
  float reach = 0.5 * (abs(dir.x) * w + abs(dir.y)) + length(vec2(0.25 * w, 0.25)) + 0.4;
  float lift = 0.3 * smoothstep(0.0, 0.5, f);
  float turned = (dir.x < 0.0 ? 0.7 : -0.7) * f * f;
  vec2 spin = vec2(cos(turned), sin(turned));

  // the eye, the ray toward the point of the frame and the light, in the frame of the sheet,
  // where the sheet lies on the plane z = 0 and the incoming image on z = -lift
  vec3 center = vec3(vec2(0.5 * w, 0.5) + dir * reach * f * f, -recede);
  vec3 eye = vec3(0.5 * w, 0.5, dist);
  vec3 e = toSheet(eye - center, yaw, pitch, spin) + vec3(c, 0.0);
  vec3 d = toSheet(vec3(uv.x * w, uv.y, 0.0) - eye, yaw, pitch, spin);
  vec3 l = toSheet(LIGHT, yaw, pitch, spin);
  if (second) {
    e.xy = e.yx;
    d.xy = d.yx;
    l.xy = l.yx;
  }
  float h = second ? 0.5 : 0.5 * w;
  float k = second ? 0.5 * w : 1.0;
  float creased = sin(a);
  vec3 n = vec3(-creased, 0.0, cos(a));
  vec3 along = vec3(cos(a), 0.0, creased);

  vec4 col = getToColor(uv);
  if (d.z < 0.0) {
    vec3 g = e + d * (e.z + lift) / -d.z;
    // the shadow fades as the packet flies higher
    col.rgb *= 1.0 - 0.7 * shade * (1.0 - f * f) * shadowAt(g, l, h, k, n, along);
  }

  // the flat part
  float t = d.z < 0.0 ? e.z / -d.z : -1.0;
  vec3 p = e + t * d;
  float m = clamp(inside(p.xy, h, k) / (EDGE * t) + 1.0, 0.0, 1.0);
  if (t > 0.0 && m > 0.0) {
    vec4 img = topFace(second ? p.yx : p.xy, second);
    float sh = shadowAt(p, l, h, k, n, along);
    img.rgb *= (1.0 - 0.7 * shade * sh) * (1.0 - 0.5 * shade * creased * exp(-abs(h - p.x) / CREASE));
    col = mix(col, img, m);
  }

  // the flap
  vec3 hit = hitFlap(e, d, h, n, along);
  if (hit.x > 0.0) {
    float r = hit.y;
    // edges seen at a grazing angle are narrower on screen
    float dr = dot(along, normalize(d));
    float fore = sqrt(max(1.0 - dr * dr, 0.0025));
    float mf = clamp(min(min(r, h - r) * fore, min(hit.z, k - hit.z)) / (EDGE * hit.x) + 1.0, 0.0, 1.0);
    if (mf > 0.0) {
      bool up = dot(n, e - vec3(h, 0.0, 0.0)) > 0.0;
      vec2 st = vec2(h + r, hit.z);
      if (second) st = st.yx;
      vec4 img = up ? topFace(st, second) : back(st);
      // lit by the light, relative to the sheet lying flat
      float lit = dot(up ? n : -n, l) - l.z;
      img.rgb *= max(1.0 + 0.6 * shade * lit, 0.0) * (1.0 - 0.5 * shade * creased * exp(-abs(r) / CREASE));
      col = mix(col, img, mf);
    }
  }
  return col;
}
`,author:"gre",license:"MIT",description:"The outgoing image is a sheet of paper that folds in half in 3D along a vertical crease, then in half again along a horizontal one, its lit and shaded faces turning to show the back of the paper, and the small folded packet flies off the frame, leaving its shadow on the incoming image underneath",tags:["paper","fold","3d","shadow"],params:{direction:{type:"vec2",default:[1,.5],description:"Direction the folded packet flies off toward"},tilt:{type:"float",default:.6,min:0,max:1,description:"How much the sheet tilts and recedes while it folds, so that the folds are seen in 3D"},shading:{type:"float",default:.6,min:0,max:1,description:"How much the faces darken as they turn away from the light, and the shadows they cast"},paper:{type:"vec4",default:[.95,.94,.9,1],color:!0,description:"Color of the back of the paper, through which the print faintly shows"}},textures:[],createdAt:"Sun, 8 Nov 2026 17:40:00 +0100",updatedAt:"Sun, 8 Nov 2026 17:40:00 +0100"},{name:"PaperTear",paramsTypes:{roughness:"float",tilt:"float",rim:"float",paper:"vec4",shadow:"vec4"},defaultParams:{roughness:.12,tilt:.1,rim:.012,paper:[1,.98,.94,1],shadow:[0,0,0,.35]},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image tears in two along a ragged line, and the halves are pulled apart to reveal the incoming one
// Tags: split, horizontal, shadow

// @range(0, 0.3) How far the tear wanders from the middle, relative to the image height
uniform float roughness; // = 0.12
// @range(0, 0.5) How much the top of each half leans away first, so that the tear opens from the top
uniform float tilt; // = 0.1
// @range(0, 0.05) Width of the white torn edge, relative to the image height
uniform float rim; // = 0.012
// @color Color of the paper fibers on the torn edges
uniform vec4 paper; // = vec4(1.0, 0.98, 0.94, 1.0)
// @color Color of the shadow cast on the incoming image
uniform vec4 shadow; // = vec4(0.0, 0.0, 0.0, 0.35)

float tri (float x) {
  return abs(fract(x) - 0.5) - 0.25;
}

// horizontal position of the tear at height y: smooth meanders...
float meander (float y) {
  return 0.5 * ratio + roughness * (0.5 * sin(y * 4.7 + 1.3) + 0.25 * sin(y * 11.3 + 4.1));
}

// ...and sharp jags
float tear (float y) {
  return meander(y) + roughness * (0.1 * sin(y * 29.0 + 0.7) + 0.35 * tri(y * 19.0 + sin(y * 7.0)) + 0.12 * tri(y * 47.0 + 0.6 * sin(y * 13.0)));
}

// width of the torn edge along it, so that the fibers look uneven
float fibers (float y, float seed) {
  return rim * (0.7 + 0.3 * sin(y * 37.0 + seed) + 0.4 * tri(y * 83.0 + seed));
}

// the left half (or the mirrored right half) slides out, its top leaning away first:
// from a point on screen to the point of the paper (the frame edges stay covered)
vec2 unfold (vec2 q, float away, float lean) {
  return vec2(q.x + away + lean * q.y, q.y);
}

// a torn half over the background, with its fibers and an anti-aliased edge
// e: distance past the torn edge, limit: how far the fibers reach, aa: edge softness
vec4 torn (vec4 bg, vec4 col, float e, float limit, float aa) {
  vec4 c = vec4(mix(col.rgb, paper.rgb, clamp(0.5 + e / aa, 0.0, 1.0) * paper.a), col.a);
  return mix(bg, c, clamp(0.5 - (e - limit) / aa, 0.0, 1.0));
}

vec4 transition (vec2 uv) {
  float p = progress;
  float away = p * p * (0.5 * ratio + 0.1 + roughness + 2.0 * rim); // far enough to leave the frame
  float lean = tilt * p * (2.0 - p);
  float fiber = smoothstep(0.0, 0.15, p); // no torn edge on the intact image
  float aa = 0.002 * fiber + 1e-6;
  vec2 q = vec2(uv.x * ratio, uv.y);
  vec2 l = unfold(q, away, lean);
  vec2 r = unfold(vec2(ratio - q.x, q.y), away, lean);
  float el = l.x - tear(l.y); // > 0 right of the left half's torn edge
  float er = r.x - (ratio - tear(r.y)); // > 0 left of the right half's torn edge
  // soft shadow of the two halves on the incoming image, cast toward the right
  vec2 sq = q - vec2(0.01, 0.0);
  float dl = unfold(sq, away, lean).x - meander(sq.y);
  float dr = unfold(vec2(ratio - sq.x, sq.y), away, lean).x - (ratio - meander(sq.y));
  vec4 to = getToColor(uv);
  float sh = shadow.a * (1.0 - smoothstep(-0.02, 0.08, min(dl, dr)));
  vec4 c = vec4(mix(to.rgb, shadow.rgb, sh), to.a);
  // the image stops at the tear; the bare paper fibers stick out a little beyond it
  if (r.x >= 0.0) {
    c = torn(c, getFromColor(vec2(1.0 - r.x / ratio, r.y)), er, fibers(r.y, 2.0) * 1.5 * fiber, aa);
  }
  if (l.x >= 0.0) {
    c = torn(c, getFromColor(vec2(l.x / ratio, l.y)), el, fibers(l.y, 0.0) * fiber, aa);
  }
  return c;
}
`,author:"gre",license:"MIT",description:"The outgoing image tears in two along a ragged line, and the halves are pulled apart to reveal the incoming one",tags:["split","horizontal","shadow"],params:{roughness:{type:"float",default:.12,min:0,max:.3,description:"How far the tear wanders from the middle, relative to the image height"},tilt:{type:"float",default:.1,min:0,max:.5,description:"How much the top of each half leans away first, so that the tear opens from the top"},rim:{type:"float",default:.012,min:0,max:.05,description:"Width of the white torn edge, relative to the image height"},paper:{type:"vec4",default:[1,.98,.94,1],color:!0,description:"Color of the paper fibers on the torn edges"},shadow:{type:"vec4",default:[0,0,0,.35],color:!0,description:"Color of the shadow cast on the incoming image"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:18:48 +0100",updatedAt:"Sat, 31 Oct 2026 18:18:48 +0100"},{name:"PerlinDissolve",paramsTypes:{scale:"float",smoothness:"float",seed:"float"},defaultParams:{scale:4,smoothness:.01,seed:12.9898},glsl:`// Author: Rich Harris
// License: MIT
// Description: The incoming image appears through blobs of Perlin noise
// Tags: noise, dissolve

// @param Scale of the noise; higher values make smaller blobs
uniform float scale; // = 4.0
// @param Softness of the blob edges
uniform float smoothness; // = 0.01

// @param Random seed
uniform float seed; // = 12.9898

// http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
float random(vec2 co)
{
    float a = seed;
    float b = 78.233;
    float c = 43758.5453;
    float dt= dot(co.xy ,vec2(a,b));
    float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners porcentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

vec4 transition (vec2 uv) {
  vec4 from = getFromColor(uv);
  vec4 to = getToColor(uv);
  float n = noise(uv * scale);

  float p = mix(-smoothness, 1.0 + smoothness, progress);
  float lower = p - smoothness;
  float higher = p + smoothness;

  float q = smoothstep(lower, higher, n);

  return mix(
    from,
    to,
    1.0 - q
  );
}
`,author:"Rich Harris",license:"MIT",description:"The incoming image appears through blobs of Perlin noise",tags:["noise","dissolve"],params:{scale:{type:"float",default:4,description:"Scale of the noise; higher values make smaller blobs"},smoothness:{type:"float",default:.01,description:"Softness of the blob edges"},seed:{type:"float",default:12.9898,description:"Random seed"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"PhotoDevelop",paramsTypes:{card:"vec4",wash:"float",tint:"float"},defaultParams:{card:[.93,.91,.85,1],wash:.35,tint:.8},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image washes out to a blank cream card, then the incoming image develops on it like an instant photo: shadows first, faint and tinted, then its contrast and colors come up and it settles
// Tags: fade, color, photo, retro

// @color Color of the blank card between the two images
uniform vec4 card; // = vec4(0.93, 0.91, 0.85, 1.0)
// @range(0, 1) How long the outgoing image takes to wash out (from 10% to 70% of the transition)
uniform float wash; // = 0.35
// @range(0, 1) Strength of the cyan and magenta cast while the image develops
uniform float tint; // = 0.8

vec3 saturation(vec3 c, float s) {
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  return mix(vec3(lum), c, s);
}

vec4 transition(vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  float p = progress;
  if (p <= 0.0) return a;
  if (p >= 1.0) return b;

  // the card only shows where the images are: it takes the alpha of the outgoing image, then the incoming one's
  float split = mix(0.1, 0.7, clamp(wash, 0.0, 1.0));
  float cardAlpha = card.a * mix(a.a, b.a, smoothstep(0.6 * split, split + 0.1, p));
  vec3 cardColor = card.rgb * cardAlpha;

  // the outgoing image fades and loses its contrast into the card, its lights first
  float w = smoothstep(0.0, split, p);
  float fromLum = dot(a.rgb, vec3(0.2126, 0.7152, 0.0722));
  float wl = clamp(w * (1.0 + 0.5 * fromLum), 0.0, 1.0);
  vec3 washed = mix(a.rgb, mix(vec3(fromLum), a.rgb, 0.4), w) * a.a;
  vec3 outgoing = mix(washed, cardColor, wl);
  float outAlpha = mix(a.a, cardAlpha, wl);

  // development of the incoming image: quick at first, then slowly settling
  float x = clamp((p - split) / max(1.0 - split, 1e-3), 0.0, 1.0);
  float d = 1.0 - pow(1.0 - x, 1.5);
  float lum = dot(b.rgb, vec3(0.2126, 0.7152, 0.0722));
  // the shadows develop first, the highlights last
  float dev = clamp((d - 0.45 * lum) / 0.55, 0.0, 1.0);
  dev = dev * dev * (3.0 - 2.0 * dev);
  // low contrast and nearly no colors at first, with a cast: cyan in the shadows, magenta in the lights
  float early = 1.0 - smoothstep(0.2, 0.95, d);
  vec3 tinted = saturation(b.rgb, smoothstep(0.3, 1.0, d));
  tinted = mix(vec3(0.6), tinted, mix(0.55, 1.0, d));
  vec3 tone = mix(vec3(-0.2, 0.06, 0.1), vec3(0.12, -0.1, 0.06), smoothstep(0.15, 0.6, lum));
  tinted += tone * tint * early;
  vec3 incoming = mix(cardColor, clamp(tinted, 0.0, 1.0) * b.a, dev);
  float inAlpha = mix(cardAlpha, b.a, dev);

  vec3 color = p < split ? outgoing : incoming;
  float alpha = p < split ? outAlpha : inAlpha;
  if (alpha <= 0.0) return vec4(0.0);
  return vec4(clamp(color / alpha, 0.0, 1.0), alpha);
}
`,author:"gre",license:"MIT",description:"The outgoing image washes out to a blank cream card, then the incoming image develops on it like an instant photo: shadows first, faint and tinted, then its contrast and colors come up and it settles",tags:["fade","color","photo","retro"],params:{card:{type:"vec4",default:[.93,.91,.85,1],color:!0,description:"Color of the blank card between the two images"},wash:{type:"float",default:.35,min:0,max:1,description:"How long the outgoing image takes to wash out (from 10% to 70% of the transition)"},tint:{type:"float",default:.8,min:0,max:1,description:"Strength of the cyan and magenta cast while the image develops"}},textures:[],createdAt:"Sun, 1 Nov 2026 20:33:18 +0100",updatedAt:"Sun, 1 Nov 2026 20:33:18 +0100"},{name:"Pinwheel",paramsTypes:{speed:"float"},defaultParams:{speed:2},glsl:`// Author: Mr Speaker
// License: MIT
// Description: A spinning pinwheel reveals the incoming image
// Tags: pinwheel, radial, rotate

// @param Rotation speed
uniform float speed; // = 2.0

vec4 transition(vec2 uv) {
  
  vec2 p = uv.xy / vec2(1.0).xy;
  
  float circPos = atan(p.y - 0.5, p.x - 0.5) + progress * speed;
  float modPos = mod(circPos, 3.1415 / 4.);
  float signed = sign(progress - modPos);
  
  return mix(getToColor(p), getFromColor(p), step(signed, 0.5));
  
}
`,author:"Mr Speaker",license:"MIT",description:"A spinning pinwheel reveals the incoming image",tags:["pinwheel","radial","rotate"],params:{speed:{type:"float",default:2,description:"Rotation speed"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"PixelStretch",paramsTypes:{direction:"vec2",stretch:"float",chroma:"float",softness:"float",jitter:"float"},defaultParams:{direction:[1,0],stretch:.45,chroma:.5,softness:.03,jitter:.5},glsl:`// Author: gre
// License: MIT
// Description: A line sweeps across the frame and drags the outgoing image's pixels behind it as long streaks, which shorten as it goes and reveal the incoming image
// Tags: smear, streaks, directional, chromatic

// @param Direction in which the line sweeps
uniform vec2 direction; // = vec2(1.0, 0.0)
// @range(0, 1) Length of the streaks at the middle of the sweep, as a part of the frame
uniform float stretch; // = 0.45
// @range(0, 1) Amount of RGB split along the streaks
uniform float chroma; // = 0.5
// @range(0, 0.2) Softness of the line and of the streaks' ends, as a part of the frame
uniform float softness; // = 0.03
// @range(0, 1) How much the streaks jitter, each row at its own length
uniform float jitter; // = 0.5

float hash(float n) {
  n = fract(n * 0.1031);
  n *= n + 33.33;
  n *= n + n;
  return fract(n);
}

// smooth max with a compact support: exactly max(x, y) when they are k apart
float smax(float x, float y, float k) {
  float h = max(k - abs(x - y), 0.0) / k;
  return max(x, y) + h * h * k * 0.25;
}

// position s along the sweep (0 to 1 across the frame) to a frame coordinate
vec2 at(vec2 uv, float s0, float s, vec2 d, float ext) {
  return clamp(uv + d * (s - s0) * ext, 0.0, 1.0);
}

vec4 transition(vec2 uv) {
  vec2 d = normalize(direction + vec2(1e-6, 0.0));
  // ext: length of the frame along the sweep, in uv units
  float ext = abs(d.x) + abs(d.y);
  float s = 0.5 + dot(uv - 0.5, d) / ext;
  // rows across the streaks (about one per pixel line), in frame heights
  vec2 n = vec2(-d.y, d.x);
  float t = dot((uv - 0.5) * vec2(ratio, 1.0), n);
  float row = floor(t * 540.0);
  float clump = floor(t * 60.0);
  float rnd = 0.6 * hash(row + 17.0) + 0.4 * hash(clump + 311.0);

  float p = progress;
  float k = softness + 1e-4;
  // the line starts and ends at rest just beyond the frame, past its soft edge, so both ends are exact;
  // it enters at once and slows down a little toward the end
  float margin = k + 0.002;
  float a = mix(-margin, 1.0 + margin, mix(p, p * p * (3.0 - 2.0 * p), 0.5));

  // the streaks are longest when the line crosses the middle and vanish as it reaches the edges,
  // so they never repeat the frame's own border (often dark, or letterboxing)
  float h = clamp(4.0 * a * (1.0 - a), 0.0, 1.0);
  float len = stretch * h * (1.0 - 0.6 * jitter * rnd);
  float split = 0.02 * chroma * h;

  // ahead of the line the outgoing image is intact; behind it, each pixel repeats the pixel at the line
  vec4 fr = getFromColor(at(uv, s, smax(s, a + split, k), d, ext));
  vec4 fg = getFromColor(at(uv, s, smax(s, a, k), d, ext));
  vec4 fb = getFromColor(at(uv, s, smax(s, a - split, k), d, ext));
  vec4 streak = vec4(fr.r, fg.g, fb.b, fg.a);
  // a faint flicker along the streaks
  float behind = step(s, a);
  streak.rgb *= 1.0 + 0.06 * jitter * h * (hash(row * 3.0 + 5.0) - 0.5) * behind;

  // past the end of its streak, each row shows the incoming image as it is
  float w = smoothstep(len - k, len + k, a - s);
  return mix(streak, getToColor(uv), w);
}
`,author:"gre",license:"MIT",description:"A line sweeps across the frame and drags the outgoing image's pixels behind it as long streaks, which shorten as it goes and reveal the incoming image",tags:["smear","streaks","directional","chromatic"],params:{direction:{type:"vec2",default:[1,0],description:"Direction in which the line sweeps"},stretch:{type:"float",default:.45,min:0,max:1,description:"Length of the streaks at the middle of the sweep, as a part of the frame"},chroma:{type:"float",default:.5,min:0,max:1,description:"Amount of RGB split along the streaks"},softness:{type:"float",default:.03,min:0,max:.2,description:"Softness of the line and of the streaks' ends, as a part of the frame"},jitter:{type:"float",default:.5,min:0,max:1,description:"How much the streaks jitter, each row at its own length"}},textures:[],createdAt:"Sun, 1 Nov 2026 09:38:52 +0100",updatedAt:"Sun, 1 Nov 2026 09:38:52 +0100"},{name:"Pixelize",paramsTypes:{squaresMin:"ivec2",steps:"int"},defaultParams:{squaresMin:[20,20],steps:50},glsl:`// Author: gre
// License: MIT
// Description: Both images pixelate, crossfade, then sharpen again
// Tags: pixelate, blend
// forked from https://gist.github.com/benraziel/c528607361d90a072e98

// minimum number of squares (when the effect is at its higher level)
// @param Number of squares at the strongest pixelation
uniform ivec2 squaresMin; // = ivec2(20)
// zero disable the stepping
// @param Number of pixelation steps; 0 for a continuous effect
uniform int steps; // = 50

vec4 transition(vec2 uv) {
  float d = min(progress, 1.0 - progress);
  float dist = steps>0 ? ceil(d * float(steps)) / float(steps) : d;
  vec2 squareSize = 2.0 * dist / vec2(squaresMin);
  vec2 p = dist>0.0 ? (floor(uv / squareSize) + 0.5) * squareSize : uv;
  return mix(getFromColor(p), getToColor(p), progress);
}
`,author:"gre",license:"MIT",description:"Both images pixelate, crossfade, then sharpen again",tags:["pixelate","blend"],params:{squaresMin:{type:"ivec2",default:[20,20],description:"Number of squares at the strongest pixelation"},steps:{type:"int",default:50,description:"Number of pixelation steps; 0 for a continuous effect"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"PlasmaDissolve",paramsTypes:{scale:"float",smoothness:"float",flow:"float",edgeColor:"vec3",edgeStrength:"float"},defaultParams:{scale:3,smoothness:.1,flow:1,edgeColor:[1,.45,.9],edgeStrength:.6},glsl:`// Author: gre
// License: MIT
// Description: A flowing plasma of sine waves, as in the old demos, draws moving bands through which the incoming image spreads like tendrils, with a glowing edge
// Tags: wipe, plasma, organic, glow

// @range(0.5, 10) Size of the plasma: higher values make more, thinner bands
uniform float scale; // = 3.0
// @range(0, 0.5) Softness of the band edges
uniform float smoothness; // = 0.1
// @range(0, 1) How much the plasma flows during the transition (at most 1, so a revealed area never goes back)
uniform float flow; // = 1.0
// @color Color of the glow along the edges
uniform vec3 edgeColor; // = vec3(1.0, 0.45, 0.9)
// @range(0, 2) Strength of the glow along the edges
uniform float edgeStrength; // = 0.6

const float PI = 3.14159265;

vec4 transition(vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  if (progress <= 0.0) return a;
  if (progress >= 1.0) return b;

  // measured in square pixels, so the waves are not stretched
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0) * max(scale, 0.0) * 2.0 * PI;
  // the phase of the waves; the folded plasma below then changes by at most 0.9 * flow per
  // unit of progress, slower than the threshold, so the reveal never goes back
  float t = clamp(flow, 0.0, 1.0) * progress * 0.5;
  // the classic plasma: sines of x, y, a diagonal and the distance to an off-center point
  float v = sin(p.x * 0.6 + t)
    + sin(p.y * 0.8 - t * 0.8)
    + sin((p.x * 0.5 + p.y * 0.7) * 0.7 + t * 0.6)
    + sin(length(p - vec2(0.15, -0.1) * max(scale, 0.0) * 2.0 * PI) * 0.9 - t * 1.2);
  // folded into bands in [0, 1]
  v = abs(fract(v * 0.25 + 0.5) * 2.0 - 1.0);

  // the soft edge is fully below every band at the start and above every band at the end
  float s = max(smoothness, 0.001);
  float threshold = mix(-s, 1.0 + s, progress);
  // > 0 where the incoming image shows
  float m = 1.0 - smoothstep(threshold - s, threshold + s, v);

  // mixed premultiplied, so transparent images do not bleed their color
  vec4 col = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);
  if (col.a <= 0.0) return vec4(0.0);
  // a light along the edge, adding nothing to the alpha
  float glow = 4.0 * m * (1.0 - m) * max(edgeStrength, 0.0);
  return vec4(col.rgb / col.a + edgeColor * glow, col.a);
}
`,author:"gre",license:"MIT",description:"A flowing plasma of sine waves, as in the old demos, draws moving bands through which the incoming image spreads like tendrils, with a glowing edge",tags:["wipe","plasma","organic","glow"],params:{scale:{type:"float",default:3,min:.5,max:10,description:"Size of the plasma: higher values make more, thinner bands"},smoothness:{type:"float",default:.1,min:0,max:.5,description:"Softness of the band edges"},flow:{type:"float",default:1,min:0,max:1,description:"How much the plasma flows during the transition (at most 1, so a revealed area never goes back)"},edgeColor:{type:"vec3",default:[1,.45,.9],color:!0,description:"Color of the glow along the edges"},edgeStrength:{type:"float",default:.6,min:0,max:2,description:"Strength of the glow along the edges"}},textures:[],createdAt:"Wed, 4 Nov 2026 20:14:11 +0100",updatedAt:"Wed, 4 Nov 2026 20:14:11 +0100"},{name:"PlusWipe",paramsTypes:{smoothness:"float",reverse:"bool"},defaultParams:{smoothness:.01,reverse:!1},glsl:`// Author: gre
// License: MIT
// Description: A plus-shaped cross grows from the center and widens its arms until the incoming image fills the frame
// Tags: shape, wipe, cross, plus

// @range(0, 0.1) Softness of the cross's edge
uniform float smoothness; // = 0.01
// @param Close four corner rectangles in toward the middle instead
uniform bool reverse; // = false

float boxDist (vec2 p, vec2 halfSize) {
  vec2 d = abs(p) - halfSize;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// 1 inside the cross at time t, 0 outside
float plus (vec2 q, float t, float s) {
  vec2 frame = vec2(0.5 * ratio, 0.5);
  float k = min(frame.x, frame.y);
  // The arms start equally thick, then widen with the frame's proportions,
  // so the four corners left uncovered vanish together
  vec2 halfWidth = k * t + (frame - k) * t * t;
  // The arms reach out at the same speed in every direction
  float halfLength = 3.0 * max(frame.x, frame.y) * t;
  float d = min(boxDist(q, vec2(halfLength, halfWidth.y)), boxDist(q, vec2(halfWidth.x, halfLength)));
  // The soft edge slides from outside to inside the cross, so nothing shows at
  // t = 0 and everything at t = 1, whatever the softness
  return 1.0 - smoothstep(0.0, s, d + s * (1.0 - t));
}

vec4 transition (vec2 uv) {
  // Measured in square pixels, so the cross is not stretched
  vec2 q = (uv - 0.5) * vec2(ratio, 1.0);
  float s = max(smoothness, 0.001);
  float m = reverse ? 1.0 - plus(q, 1.0 - progress, s) : plus(q, progress, s);
  return mix(getFromColor(uv), getToColor(uv), m);
}
`,author:"gre",license:"MIT",description:"A plus-shaped cross grows from the center and widens its arms until the incoming image fills the frame",tags:["shape","wipe","cross","plus"],params:{smoothness:{type:"float",default:.01,min:0,max:.1,description:"Softness of the cross's edge"},reverse:{type:"bool",default:!1,description:"Close four corner rectangles in toward the middle instead"}},textures:[],createdAt:"Mon, 2 Nov 2026 08:39:06 +0100",updatedAt:"Mon, 2 Nov 2026 08:39:06 +0100"},{name:"PolkaDotsCurtain",paramsTypes:{dots:"float",center:"vec2"},defaultParams:{dots:20,center:[0,0]},glsl:`// Author: bobylito
// License: MIT
// Description: The incoming image appears through growing polka dots
// Tags: dots, pattern
const float SQRT_2 = 1.414213562373;
// @param Number of dots across the image
uniform float dots; // = 20.0
uniform vec2 center; // = vec2(0, 0)

vec4 transition(vec2 uv) {
  bool nextImage = distance(fract(uv * dots), vec2(0.5, 0.5)) < ( progress / distance(uv, center));
  return nextImage ? getToColor(uv) : getFromColor(uv);
}
`,author:"bobylito",license:"MIT",description:"The incoming image appears through growing polka dots",tags:["dots","pattern"],params:{dots:{type:"float",default:20,description:"Number of dots across the image"},center:{type:"vec2",default:[0,0]}},textures:[],createdAt:"Tue, 20 Feb 2018 23:41:45 +0100",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"PopIn",paramsTypes:{center:"vec2",bounce:"float",corner:"float",shadow:"float"},defaultParams:{center:[.5,.5],bounce:1,corner:.12,shadow:.5},glsl:`// Author: gre
// License: MIT
// Description: The incoming image pops in as a rounded card over the outgoing one, with an elastic overshoot: too big, a bit small, then it settles into the full frame as its corners square off
// Tags: pop, scale, zoom, elastic, bounce, shadow

// @param Point of the frame the incoming image pops from
uniform vec2 center; // = vec2(0.5, 0.5)
// @range(0, 1.5) How far the card overshoots (too big, then a bit small) before it settles
uniform float bounce; // = 1.0
// @range(0, 0.5) Corner radius of the card while it pops, relative to its shorter side
uniform float corner; // = 0.12
// @range(0, 1) Darkness of the drop shadow the card casts on the outgoing image
uniform float shadow; // = 0.5

const float PI = 3.141592653589793;

// signed distance to a rounded box of half size b and corner radius r
float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec4 transition(vec2 uv) {
  float t = progress;
  // scale of the card: an ease-out, plus a damped spring that overshoots and lands exactly at t = 1
  float easeOut = 1.0 - (1.0 - t) * (1.0 - t) * (1.0 - t);
  float spring = 1.0 - exp(-1.5 * t) * cos(2.5 * PI * t) * (1.0 - t);
  float s = mix(easeOut, spring, bounce);

  // the card is the incoming frame scaled by s around the center, in aspect-corrected space
  vec2 asp = vec2(ratio, 1.0);
  float side = min(ratio, 1.0);
  vec2 cardCenter = center + (0.5 - center) * s;
  vec2 halfSize = 0.5 * s * asp;
  float r = corner * s * side * (1.0 - t);
  float aa = 0.002;
  // the edge is pushed out by one antialiasing width, so at t = 1 the card covers the whole frame
  float d = roundedBox((uv - cardCenter) * asp, halfSize, r) - aa;
  float cover = clamp(0.5 - d / aa, 0.0, 1.0) * smoothstep(0.0, 0.08, t);

  // drop shadow on the outgoing image, offset down and blurred, growing with the card
  float k = min(s, 1.0) * side;
  float blur = 0.05 * k + 1e-4;
  vec2 offset = vec2(0.0, -0.03 * k);
  float ds = roundedBox((uv - cardCenter - offset) * asp, halfSize, r);
  float shade = shadow * (1.0 - smoothstep(-blur, blur, ds)) * smoothstep(0.0, 0.15, t);

  vec4 a = getFromColor(uv);
  // the shadow darkens the outgoing image, it does not change its alpha (no shadow on transparent areas)
  a.rgb *= 1.0 - shade;
  // clamped: only the antialiased rim, one pixel or two outside the card, reads past the edge
  vec4 b = getToColor(clamp((uv - center) / max(s, 1e-4) + center, 0.0, 1.0));
  // blend premultiplied, then back to straight alpha
  vec4 c = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), cover);
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The incoming image pops in as a rounded card over the outgoing one, with an elastic overshoot: too big, a bit small, then it settles into the full frame as its corners square off",tags:["pop","scale","zoom","elastic","bounce","shadow"],params:{center:{type:"vec2",default:[.5,.5],description:"Point of the frame the incoming image pops from"},bounce:{type:"float",default:1,min:0,max:1.5,description:"How far the card overshoots (too big, then a bit small) before it settles"},corner:{type:"float",default:.12,min:0,max:.5,description:"Corner radius of the card while it pops, relative to its shorter side"},shadow:{type:"float",default:.5,min:0,max:1,description:"Darkness of the drop shadow the card casts on the outgoing image"}},textures:[],createdAt:"Tue, 3 Nov 2026 21:54:13 +0100",updatedAt:"Tue, 3 Nov 2026 21:54:13 +0100"},{name:"PowerKaleido",paramsTypes:{scale:"float",z:"float",speed:"float"},defaultParams:{scale:2,z:1.5,speed:5},glsl:`// Name: Power Kaleido
// Author: Boundless
// License: MIT
// Description: The image folds into an animated kaleidoscope before revealing the incoming one
// Tags: kaleidoscope, distort
#define PI 3.14159265358979
const float rad = 120.; // change this value to get different mirror effects
const float deg = rad / 180. * PI;
uniform float scale; // = 2.0
uniform float z; // = 1.5
uniform float speed; // = 5.
vec2 refl(vec2 p,vec2 o,vec2 n)
{
	return 2.0*o+2.0*n*dot(p-o,n)-p;
}

vec2 rot(vec2 p, vec2 o, float a)
{
    float s = sin(a);
    float c = cos(a);
	return o + mat2(c, -s, s, c) * (p - o);
}

vec4 mainImage(vec2 uv)
{
  float dist = scale / 10.;
  vec2 uv0 = uv;
	uv -= 0.5;
  uv.x *= ratio;
  uv *= z;
  uv = rot(uv, vec2(0.0), progress*speed);
  // uv.x = fract(uv.x/l/3.0)*l*3.0;
	float theta = progress*6.+PI/.5;
	for(int iter = 0; iter < 10; iter++) {
    for(float i = 0.; i < 2. * PI; i+=deg) {
	    float ts = sign(asin(cos(i))) == 1.0 ? 1.0 : 0.0;
      if(((ts == 1.0) && (uv.y-dist*cos(i) > tan(i)*(uv.x+dist*+sin(i)))) || ((ts == 0.0) && (uv.y-dist*cos(i) < tan(i)*(uv.x+dist*+sin(i))))) {
        uv = refl(vec2(uv.x+sin(i)*dist*2.,uv.y-cos(i)*dist*2.), vec2(0.,0.), vec2(cos(i),sin(i)));
      }
    }
  }
  uv += 0.5;
  uv = rot(uv, vec2(0.5), progress*-speed);
  uv -= 0.5;
  uv.x /= ratio;
  uv += 0.5;
  uv = 2.*abs(uv/2.-floor(uv/2.+0.5));
  vec2 uvMix = mix(uv,uv0,cos(progress*PI*2.)/2.+0.5);
  vec4 color = mix(getFromColor(uvMix),getToColor(uvMix),cos((progress-1.)*PI)/2.+0.5);
	return color;
    
}
vec4 transition (vec2 uv) {
  vec4 color = mainImage(uv);
  return color;
}
`,author:"Boundless",license:"MIT",description:"The image folds into an animated kaleidoscope before revealing the incoming one",tags:["kaleidoscope","distort"],params:{scale:{type:"float",default:2},z:{type:"float",default:1.5},speed:{type:"float",default:5}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"Prisms",paramsTypes:{slats:"int",stagger:"float",perspective:"float",shading:"float",horizontal:"bool",backColor:"vec4"},defaultParams:{slats:8,stagger:.45,perspective:1,shading:.6,horizontal:!1,backColor:[0,0,0,1]},glsl:`// Author: gre
// License: MIT
// Description: The frame is cut into 3D prisms that turn in a cascade, like a rotating billboard, from the outgoing image on one face to the incoming one on the next
// Tags: 3d, rotate, stripes

// @range(2, 40, 1) Number of prisms
uniform int slats; // = 8
// @range(0, 0.9) Delay of the last prism's turn, as a part of the transition
uniform float stagger; // = 0.45
// @range(0, 4) Amount of perspective
uniform float perspective; // = 1.0
// @range(0, 1) How much the faces darken as they turn away
uniform float shading; // = 0.6
// @param Cut the frame into horizontal prisms instead
uniform bool horizontal; // = false
// @color Color seen where the turning prisms leave the frame uncovered
uniform vec4 backColor; // = vec4(0.0, 0.0, 0.0, 1.0)

const float PI = 3.141592653589793;
// width of the anti-aliased edges, in frame heights
const float EDGE = 0.002;

vec4 transition (vec2 uv) {
  float n = float(slats);
  // a: the axis across the prisms, b: the axis they turn around
  float a = horizontal ? uv.y : uv.x;
  float b = horizontal ? uv.x : uv.y;
  // the prisms' half width in frame heights, and the perspective from their depth
  float hw = 0.5 / n * (horizontal ? 1.0 : ratio);
  float k = min(perspective * hw, 0.5);
  float bScale = horizontal ? ratio : 1.0;
  // a turning prism is wider than its strip: keep the two nearest faces
  vec4 near1 = vec4(0.0), near2 = vec4(0.0);
  float cover1 = 0.0, cover2 = 0.0;
  float z1 = -2.0, z2 = -2.0;
  for (int d = -1; d <= 1; d++) {
    float i = floor(a * n) + float(d);
    if (i < 0.0 || i > n - 1.0) continue;
    // each prism turns after a delay that grows across the frame, left to right or top to bottom
    float order = (horizontal ? n - 1.0 - i : i) / (n - 1.0);
    float t = clamp((progress - stagger * order) / (1.0 - stagger), 0.0, 1.0);
    t = mix(t, t * t * (3.0 - 2.0 * t), 0.7);
    float c = cos(0.5 * PI * t);
    float s = sin(0.5 * PI * t);
    // soft edges while turning (sharp at rest, to keep the first and last frames exact)
    float edge = EDGE * min(1.0, 20.0 * s * c) + 1e-6;
    // x: position across the strip, -1 to 1; the prism's square section has its faces at distance 1
    float x = 2.0 * (a * n - i) - 1.0;
    for (int f = 0; f < 2; f++) {
      // f = 0: the outgoing face turning away, f = 1: the incoming face turning in
      float cf = f == 0 ? c : s;
      if (cf < 1e-4) continue;
      // u: position on the face, z: depth (1 for a face at rest)
      float u = f == 0 ? (x + s) / c : (x - c) / s;
      float z = f == 0 ? u * s + c : s - u * c;
      if (abs(u) > 1.0 || z <= z2) continue;
      // nearer parts look bigger
      float scale = 1.0 - k * (z - 1.0);
      float y = (b - 0.5) * scale + 0.5;
      if (y < 0.0 || y > 1.0) continue;
      // soften the outer edges only: the faces meet at the prism's corner
      float outer = f == 0 ? 1.0 + u : 1.0 - u;
      float cover = clamp(outer * hw * cf / edge, 0.0, 1.0)
        * clamp(min(y, 1.0 - y) * bScale / scale / edge, 0.0, 1.0);
      float sa = (i + 0.5 + 0.5 * u) / n;
      vec2 p = horizontal ? vec2(y, sa) : vec2(sa, y);
      vec4 img = f == 0 ? getFromColor(p) : getToColor(p);
      // lit from the front and the incoming side: the outgoing face darkens as it turns away
      float lambert = clamp(f == 0 ? c - 0.6 * s : s + 0.6 * c, 0.0, 1.0);
      vec4 color = vec4(img.rgb * mix(1.0 - shading, 1.0, lambert), img.a);
      if (z > z1) {
        near2 = near1; cover2 = cover1; z2 = z1;
        near1 = color; cover1 = cover; z1 = z;
      } else {
        near2 = color; cover2 = cover; z2 = z;
      }
    }
  }
  return mix(mix(backColor, near2, cover2), near1, cover1);
}
`,author:"gre",license:"MIT",description:"The frame is cut into 3D prisms that turn in a cascade, like a rotating billboard, from the outgoing image on one face to the incoming one on the next",tags:["3d","rotate","stripes"],params:{slats:{type:"int",default:8,min:2,max:40,step:1,description:"Number of prisms"},stagger:{type:"float",default:.45,min:0,max:.9,description:"Delay of the last prism's turn, as a part of the transition"},perspective:{type:"float",default:1,min:0,max:4,description:"Amount of perspective"},shading:{type:"float",default:.6,min:0,max:1,description:"How much the faces darken as they turn away"},horizontal:{type:"bool",default:!1,description:"Cut the frame into horizontal prisms instead"},backColor:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color seen where the turning prisms leave the frame uncovered"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:17:22 +0100",updatedAt:"Sat, 31 Oct 2026 18:17:22 +0100"},{name:"ProjectorThrow",paramsTypes:{darkness:"float",keystone:"float",blur:"float"},defaultParams:{darkness:.8,keystone:.45,blur:.015},glsl:`// Author: gre
// License: MIT
// Description: The lights go down on the outgoing image and a projector throws the incoming one onto it: a small, blurred, keystoned picture of light lands on the scene, tinted by the colors it falls on, then grows, comes into focus and squares up until it fills the frame as the scene beneath it fades away
// Tags: light, projector, projection, keystone, focus, reveal

// @range(0, 1) How dark the outgoing image gets once the lights go down
uniform float darkness; // = 0.8
// @range(0, 0.8) How much wider the top of the projected picture is than its bottom when it lands
uniform float keystone; // = 0.45
// @range(0, 0.05) How out of focus the projected picture is when it lands, in frame heights
uniform float blur; // = 0.015

// folds coordinates back into the frame, so the picture never shows its clamped edges
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// the projected picture, sampled with 8 taps on a disc of radius r (in its own coordinates),
// averaged premultiplied so transparent texels do not bleed into it
vec4 projected(vec2 q, vec2 r) {
  vec4 c = vec4(0.0);
  for (int i = 0; i < 8; i++) {
    float a = float(i) * 2.39996;
    vec2 o = sqrt((float(i) + 0.5) / 8.0) * vec2(cos(a), sin(a));
    vec4 t = getToColor(mirror(q + o * r));
    c += vec4(t.rgb * t.a, t.a);
  }
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a / 8.0) : vec4(0.0);
}

vec4 transition(vec2 uv) {
  float p = progress;
  if (p <= 0.0) return getFromColor(uv);
  if (p >= 1.0) return getToColor(uv);
  vec4 from = getFromColor(uv);

  // the lamp warms up as the room lights go down
  float on = smoothstep(0.06, 0.26, p);
  float ambient = 1.0 - darkness * smoothstep(0.0, 0.2, p);
  // the picture grows and squares up, while it comes into focus
  float g = smoothstep(0.02, 1.0, p);
  float focus = 1.0 - smoothstep(0.15, 0.85, p);
  float size = mix(0.32, 1.0, g * (0.6 + 0.4 * g));
  float k = keystone * (1.0 - g);
  float cy = mix(0.58, 0.5, g);

  // keystone: the picture is a trapezoid seen in perspective, its rows spaced wider where it is wider
  float y = (uv.y - cy) / size + 0.5;
  float wy = max(1.0 - 0.5 * k + k * y, 0.05);
  vec2 q = vec2((uv.x - 0.5) / (size * wy) + 0.5, y * (1.0 + 0.5 * k) / wy);

  // soft edges of the beam, in frame heights, sharp once in focus
  float e = min((0.5 * size * wy - abs(uv.x - 0.5)) * ratio, size * min(y, 1.0 - y));
  float soft = 0.0015 + 0.035 * focus;
  float cov = mix(smoothstep(-soft, soft, e), 1.0, smoothstep(0.9, 1.0, p));
  // stray light spilling around the beam
  float halo = 0.15 * focus * on * exp(-24.0 * max(-e, 0.0)) * (1.0 - cov);

  // the light of the picture: brighter while concentrated on a small area, with a lamp vignette
  vec2 d = q - 0.5;
  float gain = on * mix(1.25, 1.0, g) * (1.0 + focus * (0.15 - 1.2 * dot(d, d)));
  // the blur is round on the frame: picture coordinates stretch with the keystone
  vec2 r = blur * focus / (size * wy) * vec2(1.0 / ratio, (1.0 - 0.25 * k * k) / wy);
  vec4 pic = projected(q, r);
  vec3 light = pic.rgb * gain * cov + halo;

  // light lands on the dimmed scene and is tinted by its colors; under the picture, the scene
  // fades to a plain screen
  float screen = smoothstep(0.35, 0.95, p);
  vec3 surface = mix(from.rgb, vec3(1.0), 0.35 + 0.65 * screen);
  vec3 col = from.rgb * ambient * (1.0 - cov * screen) + surface * light;
  // the picture of light shows even over a transparent scene
  return vec4(col, mix(max(from.a, pic.a * cov * on), pic.a, cov * screen));
}
`,author:"gre",license:"MIT",description:"The lights go down on the outgoing image and a projector throws the incoming one onto it: a small, blurred, keystoned picture of light lands on the scene, tinted by the colors it falls on, then grows, comes into focus and squares up until it fills the frame as the scene beneath it fades away",tags:["light","projector","projection","keystone","focus","reveal"],params:{darkness:{type:"float",default:.8,min:0,max:1,description:"How dark the outgoing image gets once the lights go down"},keystone:{type:"float",default:.45,min:0,max:.8,description:"How much wider the top of the projected picture is than its bottom when it lands"},blur:{type:"float",default:.015,min:0,max:.05,description:"How out of focus the projected picture is when it lands, in frame heights"}},textures:[],createdAt:"Fri, 13 Nov 2026 10:05:06 +0100",updatedAt:"Fri, 13 Nov 2026 10:05:06 +0100"},{name:"Puzzle",paramsTypes:{pieces:"float",shadow:"float"},defaultParams:{pieces:5,shadow:.6},glsl:`// Author: gre
// License: MIT
// Description: The image is cut into jigsaw puzzle pieces that lift one after another and fall away, revealing the incoming image
// Tags: tiles, shadow, rotate, fragments

// @range(2, 12) Number of pieces across the shorter side
uniform float pieces; // = 5.0
// @range(0, 1) Darkness of the shadows of the lifted pieces
uniform float shadow; // = 0.6

// Hash of a cell, without sin, in [0, 1)
float hash(vec2 c) {
  vec2 p = fract(c * vec2(0.1031, 0.1030));
  p += dot(p, p.yx + 33.33);
  return fract((p.x + p.y) * p.x);
}

float boxDist(vec2 p, vec2 halfSize) {
  vec2 q = abs(p) - halfSize;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

// Signed distance of a point, relative to the center of piece c, to that piece (cell units).
// Each edge has a knob (a round head on a neck): a tab for one piece, a blank for its neighbor; border edges are flat.
float pieceDist(vec2 p, vec2 c, vec2 grid, float aspect) {
  vec2 halfSize = vec2(0.5 * aspect, 0.5);
  float d = boxDist(p, halfSize);
  float tabs = 1e3;
  for (int e = 0; e < 4; e++) {
    // right, left, top, bottom: the edge key is the cell on its left or below
    vec2 dir = e == 0 ? vec2(1.0, 0.0) : e == 1 ? vec2(-1.0, 0.0) : e == 2 ? vec2(0.0, 1.0) : vec2(0.0, -1.0);
    vec2 key = c + min(dir, 0.0);
    vec2 next = c + dir;
    if (next.x >= 0.0 && next.y >= 0.0 && next.x < grid.x && next.y < grid.y) {
      float h = hash(key + (e < 2 ? vec2(0.0) : vec2(71.0, 37.0)));
      // the knob points right or up from the key cell when h < 0.5
      bool tab = (h < 0.5) == (dir.x + dir.y > 0.0);
      vec2 out1 = dir * (tab ? 1.0 : -1.0);
      vec2 along = vec2(abs(dir.y), abs(dir.x));
      vec2 edge = dir * halfSize + along * (fract(h * 2.0) - 0.5) * 0.16;
      float k = min(
        length(p - edge - out1 * 0.15) - 0.125,
        boxDist(p - edge - out1 * 0.06, abs(dir) * 0.08 + along * 0.085));
      if (tab) tabs = min(tabs, k);
      else d = max(d, -k);
    }
  }
  return min(d, tabs);
}

vec4 transition(vec2 uv) {
  // a grid of nearly square cells that fits the frame exactly
  float rows = ratio < 1.0 ? floor(pieces / ratio + 0.5) : pieces;
  float cols = ratio < 1.0 ? pieces : floor(pieces * ratio + 0.5);
  vec2 grid = vec2(cols, rows);
  float aspect = ratio * rows / cols;
  vec2 g = uv * grid;
  vec2 cell = floor(g);

  const float aa = 0.01; // soft edges, in cells
  float boardSum = 0.0;
  float allSum = 0.0;
  // the two top moving pieces under this point
  float prio1 = -1.0, prio2 = -1.0, cov1 = 0.0, cov2 = 0.0, shade1 = 1.0, shade2 = 1.0;
  vec2 uv1 = uv, uv2 = uv;
  float shadowAll = 0.0;
  float seam = 1.0;
  for (int i = 0; i < 9; i++) {
    vec2 c = cell + vec2(mod(float(i), 3.0), floor(float(i) / 3.0)) - 1.0;
    if (c.x < 0.0 || c.y < 0.0 || c.x >= cols || c.y >= rows) continue;
    vec2 center = c + 0.5;
    vec2 local = (g - center) * vec2(aspect, 1.0);
    float h = hash(c + vec2(13.0, 7.0));
    // diagonal order from the top left, a little shuffled
    float diag = (c.x / max(cols - 1.0, 1.0) + (rows - 1.0 - c.y) / max(rows - 1.0, 1.0)) * 0.5;
    float delay = (diag + 1.2 * (h - 0.5) * diag * (1.0 - diag)) * 0.6;
    float t = clamp((progress - delay) / 0.4, 0.0, 1.0);

    // where the piece was: the board keeps the outgoing image where pieces are still in place
    float d0 = pieceDist(local, c, grid, aspect);
    float w = 1.0 - smoothstep(-aa, aa, d0);
    allSum += w;
    if (t <= 0.0) {
      boardSum += w;
      seam = min(seam, abs(d0));
      continue;
    }
    // lift, then fall away: shrink, spin, drift down and darken
    float lift = smoothstep(0.0, 0.25, t);
    float fall = clamp((t - 0.2) / 0.8, 0.0, 1.0);
    fall *= fall;
    float s = max(1.0 - fall, 0.001);
    float a = (h - 0.5) * 3.0 * fall;
    vec2 off = vec2(0.0, -1.2 * fall);
    mat2 rot = mat2(cos(a), -sin(a), sin(a), cos(a));
    vec2 pl = rot * (local - off) / s;
    float dp = pieceDist(pl, c, grid, aspect);
    float cov = (1.0 - smoothstep(-aa, aa, dp * s)) * min(s * 20.0, 1.0); // fades when tiny
    // darker when falling, and on its edges when lifted
    float shade = (1.0 - 0.5 * fall) * (1.0 - 0.3 * lift * (1.0 - smoothstep(0.0, 0.035, -dp)));
    vec2 puv = (center + pl / vec2(aspect, 1.0)) / grid;
    // soft shadow, offset to the bottom right while lifted
    vec2 sl = rot * (local - off - vec2(0.08, -0.1) * lift) / s;
    float sh = (1.0 - smoothstep(-0.05, 0.12, pieceDist(sl, c, grid, aspect) * s)) * lift * (1.0 - fall) * shadow;
    // the hole it leaves is in its shadow too
    shadowAll = max(shadowAll, max(sh, w * lift * (1.0 - smoothstep(0.2, 0.5, t)) * shadow));
    float prio = delay;
    if (cov > 0.0 && prio > prio1) {
      prio2 = prio1; cov2 = cov1; uv2 = uv1; shade2 = shade1;
      prio1 = prio; cov1 = cov; uv1 = puv; shade1 = shade;
    } else if (cov > 0.0 && prio > prio2) {
      prio2 = prio; cov2 = cov; uv2 = puv; shade2 = shade;
    }
  }
  vec4 base = mix(getToColor(uv), getFromColor(uv), boardSum / max(allSum, 0.001));
  // the cuts show on the board as the transition starts
  base.rgb *= (1.0 - shadowAll) * (1.0 - 0.4 * smoothstep(0.0, 0.1, progress) * (1.0 - smoothstep(0.0, 0.015, seam)));
  vec4 p2 = getFromColor(uv2);
  p2.rgb *= shade2;
  vec4 p1 = getFromColor(uv1);
  p1.rgb *= shade1;
  return mix(mix(base, p2, cov2), p1, cov1);
}
`,author:"gre",license:"MIT",description:"The image is cut into jigsaw puzzle pieces that lift one after another and fall away, revealing the incoming image",tags:["tiles","shadow","rotate","fragments"],params:{pieces:{type:"float",default:5,min:2,max:12,description:"Number of pieces across the shorter side"},shadow:{type:"float",default:.6,min:0,max:1,description:"Darkness of the shadows of the lifted pieces"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:26:58 +0100",updatedAt:"Sat, 31 Oct 2026 18:26:58 +0100"},{name:"PuzzleCube",paramsTypes:{size:"int",gap:"float",shading:"float",background:"vec4"},defaultParams:{size:3,gap:.012,shading:.6,background:[.04,.04,.05,1]},glsl:`// Author: gre
// License: MIT
// Description: The frame becomes the face of a twisty cube puzzle: dark gaps open between its cubies, then whole columns and rows of cubies turn a quarter turn around the cube one after another in 3D, each bringing the incoming image from the cube's side to the front, until the gaps close on the incoming image
// Tags: 3d, rotate, grid

// @range(2, 8, 1) Number of cubies along each side of the face
uniform int size; // = 3
// @range(0, 0.05) Width of the gaps between the cubies, as a part of the frame's height
uniform float gap; // = 0.012
// @range(0, 1) How much the turning sides darken away from the light, and the shadows inside the cube
uniform float shading; // = 0.6
// @color Color of the cubies' body, seen in the gaps, on their inner sides and around the cube
uniform vec4 background; // = vec4(0.04, 0.04, 0.05, 1.0)

const float PI = 3.141592653589793;
// delay between the turns of a group, as a part of a turn
const float STAGGER = 0.45;
// width of the anti-aliased edges, in frame heights
const float EDGE = 0.0012;

float gridSize() {
  return float(size < 2 ? 2 : (size > 8 ? 8 : size));
}

// the turns run in 3 groups, one after the other: the even columns, the even rows (counted from the top),
// then the odd columns; the turns of a group overlap
float groupLength(float m) {
  return m > 0.0 ? 1.0 + (m - 1.0) * STAGGER : 0.0;
}

// the time in turn units, and the length of the groups of even and odd slices
vec3 timeline(float n) {
  float lenEven = groupLength(floor((n + 1.0) * 0.5));
  float lenOdd = groupLength(floor(n * 0.5));
  float u = clamp((progress - 0.05) / 0.85, 0.0, 1.0) * (2.0 * lenEven + lenOdd);
  return vec3(u, lenEven, lenOdd);
}

// the turn of a column (isCol) or of a row, 0 at rest to 1 turned
float turnTime(vec3 tl, bool isCol, float idx, float n) {
  // rows are counted from the top
  float k = isCol ? idx : n - 1.0 - idx;
  bool odd = mod(k, 2.0) > 0.5;
  // the odd rows never turn: the columns already brought the incoming image there
  if (odd && !isCol) return 0.0;
  float start = (odd ? 2.0 * tl.y : (isCol ? 0.0 : tl.y)) + floor(k * 0.5) * STAGGER;
  return clamp(tl.x - start, 0.0, 1.0);
}

// the turn's direction: +1 brings the side of the cube at higher coordinates to the front
float turnDir(bool isCol, float idx) {
  return mod(idx + (isCol ? 0.0 : 1.0), 2.0) < 0.5 ? 1.0 : -1.0;
}

// eased angle, landing with a little speed left like a click
float turnAngle(float t) {
  return 0.5 * PI * mix(t, t * t * (3.0 - 2.0 * t), 0.8);
}

// 1 on the cubies' faces, 0 in the gaps, at the point fp of the face (frame heights)
float faceMask(vec2 fp, float n, float g) {
  if (g <= 0.0) return 1.0;
  vec2 cell = vec2(ratio, 1.0) / n;
  vec2 c = fp / cell;
  vec2 r = floor(c + 0.5);
  // distance to the nearest cubie edge inside the face (the face's own border has no gap)
  vec2 d = abs(c - r) * cell;
  d.x = (r.x < 0.5 || r.x > n - 0.5) ? 1.0 : d.x;
  d.y = (r.y < 0.5 || r.y > n - 0.5) ? 1.0 : d.y;
  float e = min(EDGE, 0.5 * g);
  return smoothstep(0.5 * g - e, 0.5 * g + e, min(d.x, d.y));
}

// does the cubie of the face at fp show the incoming image, from the turns done so far
bool isDone(vec3 tl, vec2 fp, float n) {
  vec2 cell = clamp(floor(fp / (vec2(ratio, 1.0) / n)), 0.0, n - 1.0);
  return turnTime(tl, true, cell.x, n) >= 1.0 || turnTime(tl, false, cell.y, n) >= 1.0;
}

vec4 sticker(vec2 fp, bool incoming, float light, float n, float g) {
  vec2 uv = clamp(fp / vec2(ratio, 1.0), 0.0, 1.0);
  vec4 img = incoming ? getToColor(uv) : getFromColor(uv);
  vec4 body = vec4(background.rgb * light, background.a);
  return mix(body, vec4(img.rgb * light, img.a), faceMask(fp, n, g));
}

// brightness of a face of normal nrm (across the slices, along the turn, depth) in the turn's space, 1 facing the viewer
float lighting(vec3 nrm, bool isCol) {
  vec3 l = normalize(vec3(-0.35, 0.55, 1.0));
  if (isCol) l = l.yxz;
  return 1.0 - shading * (1.0 - clamp(dot(nrm, l) / l.z, 0.0, 1.0));
}

vec2 rot(vec2 v, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

// casts the ray (o, d), in the turn's space (across the slices, along the turn, depth), onto the slice
// [a0, a0 + w] turned by the angle a around the middle of the cube (a square section of side S):
// returns the ray's parameter at the hit (or -1), the face hit (0 front, 1 back, 2 and 3 the sides
// at higher and lower coordinates along the turn at rest, 4 the slice's ends), and the point hit
// (across the slices, and across the face, -1 to 1)
vec4 sliceHit(vec3 o, vec3 d, float a0, float w, float S, float a) {
  vec2 lo = rot(o.yz - vec2(0.5 * S, -0.5 * S), -a);
  vec2 ld = rot(d.yz, -a);
  ld = vec2(abs(ld.x) < 1e-6 ? 1e-6 : ld.x, abs(ld.y) < 1e-6 ? 1e-6 : ld.y);
  float dx = abs(d.x) < 1e-6 ? 1e-6 : d.x;
  vec3 t1 = vec3((a0 - o.x) / dx, (-0.5 * S - lo) / ld);
  vec3 t2 = vec3((a0 + w - o.x) / dx, (0.5 * S - lo) / ld);
  vec3 tn = min(t1, t2);
  vec3 tf = max(t1, t2);
  float tNear = max(tn.x, max(tn.y, tn.z));
  float tFar = min(tf.x, min(tf.y, tf.z));
  if (tNear > tFar || tNear <= 0.0) return vec4(-1.0);
  vec2 q = (lo + tNear * ld) / (0.5 * S);
  float across = o.x + tNear * d.x;
  if (tn.x >= tn.y && tn.x >= tn.z) return vec4(tNear, 4.0, across, sign(-dx));
  if (tn.y > tn.z) return vec4(tNear, ld.x < 0.0 ? 2.0 : 3.0, across, q.y);
  return vec4(tNear, ld.y < 0.0 ? 0.0 : 1.0, across, q.x);
}

// the color of a turning slice at its hit
vec4 sliceColor(vec4 hit, vec3 tl, bool isCol, float a, float dir, float S, float n, float g) {
  float f = hit.y;
  if (f > 3.5) return vec4(background.rgb * lighting(vec3(hit.w, 0.0, 0.0), isCol), background.a);
  vec2 nl = f < 0.5 ? vec2(0.0, 1.0) : f < 1.5 ? vec2(0.0, -1.0) : f < 2.5 ? vec2(1.0, 0.0) : vec2(-1.0, 0.0);
  float light = lighting(vec3(0.0, rot(nl, a)), isCol);
  // the front shows what the cubies showed before this turn, the side that comes to the front
  // shows the incoming image where it lands
  bool front = f < 0.5;
  bool coming = nl.x * dir > 0.5;
  if (!front && !coming) return vec4(background.rgb * light, background.a);
  // on the side coming to the front, the point across lands at -dir times its depth
  float r = 0.5 * S * (1.0 + (front ? hit.w : -dir * hit.w));
  vec2 fp = isCol ? vec2(hit.z, r) : vec2(r, hit.z);
  return sticker(fp, coming || isDone(tl, fp, n), light, n, g);
}

vec4 transition(vec2 uv) {
  float n = gridSize();
  vec3 tl = timeline(n);
  // the gaps open at the start and close at the end, after the last turn
  float g = gap * smoothstep(0.0, 0.1, progress) * (1.0 - smoothstep(0.9, 1.0, progress));
  vec2 P = vec2(uv.x * ratio, uv.y);

  // the turns going on are of columns or of rows, never both
  bool isCol = tl.x < tl.y || tl.x >= 2.0 * tl.y;
  // the turn's space: (across the slices, along the turn, depth toward the viewer);
  // a column turns around the horizontal axis through the middle of the cube, a row around the vertical one
  float w = (isCol ? ratio : 1.0) / n;
  float S = isCol ? 1.0 : ratio;
  vec2 pp = isCol ? P : P.yx;
  vec3 o = vec3(isCol ? vec2(0.5 * ratio, 0.5) : vec2(0.5, 0.5 * ratio), 1.2 + 0.6 * max(ratio, 1.0));
  // the ray reaches the face (z = 0) at t = 1
  vec3 d = vec3(pp, 0.0) - o;

  float k0 = clamp(floor(pp.x / w), 0.0, n - 1.0);
  float t0 = turnTime(tl, isCol, k0, n);

  float nearest = 1.0;
  vec4 color;
  if (t0 <= 0.0 || t0 >= 1.0) {
    // the face at rest: the exact image
    color = isDone(tl, P, n) ? getToColor(uv) : getFromColor(uv);
    color = mix(background, color, faceMask(P, n, g));
    // the shade of the turning slices next to this one, deepest mid-turn
    for (int j = -1; j <= 1; j += 2) {
      float k = k0 + float(j);
      if (k < 0.0 || k > n - 1.0) continue;
      float tk = turnTime(tl, isCol, k, n);
      if (tk <= 0.0 || tk >= 1.0) continue;
      float dist = abs(pp.x - (k + 0.5) * w) - 0.5 * w;
      color.rgb *= 1.0 - 0.5 * shading * sin(2.0 * turnAngle(tk)) * exp(-dist / (0.2 * w));
    }
  } else {
    // inside the hollow left by the turning slice: the sides of the slices next to it and the cube's inside, in the dark
    float tw = abs(d.x) < 1e-6 ? 1e6 : (d.x < 0.0 ? k0 * w - o.x : (k0 + 1.0) * w - o.x) / d.x;
    float tb = (o.z + S) / -d.z;
    nearest = min(tw, tb);
    float along = o.y + nearest * d.y;
    float depth = (o.z + nearest * d.z) / -S;
    float light = tw < tb ? lighting(vec3(-sign(d.x), 0.0, 0.0), isCol) : 1.0;
    light *= 1.0 - shading * (0.5 + 0.4 * clamp(depth, 0.0, 1.0));
    // beyond the cube's edges: the background
    color = along < 0.0 || along > S ? background : vec4(background.rgb * light, background.a);
  }

  // the turning slices, which come out in front of the face as they turn
  for (int j = -1; j <= 1; j++) {
    float k = k0 + float(j);
    if (k < 0.0 || k > n - 1.0) continue;
    float tk = turnTime(tl, isCol, k, n);
    if (tk <= 0.0 || tk >= 1.0) continue;
    float dir = turnDir(isCol, k);
    float a = dir * turnAngle(tk);
    vec4 hit = sliceHit(o, d, k * w, w, S, a);
    if (hit.x > 0.0 && hit.x < nearest) {
      nearest = hit.x;
      color = sliceColor(hit, tl, isCol, a, dir, S, n, g);
    }
  }
  return color;
}
`,author:"gre",license:"MIT",description:"The frame becomes the face of a twisty cube puzzle: dark gaps open between its cubies, then whole columns and rows of cubies turn a quarter turn around the cube one after another in 3D, each bringing the incoming image from the cube's side to the front, until the gaps close on the incoming image",tags:["3d","rotate","grid"],params:{size:{type:"int",default:3,min:2,max:8,step:1,description:"Number of cubies along each side of the face"},gap:{type:"float",default:.012,min:0,max:.05,description:"Width of the gaps between the cubies, as a part of the frame's height"},shading:{type:"float",default:.6,min:0,max:1,description:"How much the turning sides darken away from the light, and the shadows inside the cube"},background:{type:"vec4",default:[.04,.04,.05,1],color:!0,description:"Color of the cubies' body, seen in the gaps, on their inner sides and around the cube"}},textures:[],createdAt:"Sat, 7 Nov 2026 18:50:04 +0100",updatedAt:"Sat, 7 Nov 2026 18:50:04 +0100"},{name:"RadialWipe",paramsTypes:{smoothness:"float"},defaultParams:{smoothness:1},glsl:`// License: MIT
// Author: Xaychru
// Description: A radial wipe that sweeps around the center like a clock hand
// Tags: wipe, radial, clock
// ported by gre from https://gist.github.com/Xaychru/ce1d48f0ce00bb379750

uniform float smoothness; // = 1.0

const float PI = 3.141592653589;

vec4 transition(vec2 p) {
  vec2 rp = p*2.-1.;
  return mix(
    getToColor(p),
    getFromColor(p),
    smoothstep(0., smoothness, atan(rp.y,rp.x) - (progress-.5) * PI * 2.5)
  );
}
`,author:"Xaychru",license:"MIT",description:"A radial wipe that sweeps around the center like a clock hand",tags:["wipe","radial","clock"],params:{smoothness:{type:"float",default:1}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"RandomSquares",paramsTypes:{size:"ivec2",smoothness:"float"},defaultParams:{size:[10,10],smoothness:.5},glsl:`// Author: gre
// License: MIT
// Description: The incoming image appears in random squares
// Tags: squares, grid, dissolve

// @param Number of squares (columns, rows)
uniform ivec2 size; // = ivec2(10, 10)
// @param Softness of each square's switch
uniform float smoothness; // = 0.5
 
float rand (vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 transition(vec2 p) {
  float r = rand(floor(vec2(size) * p));
  float m = smoothstep(0.0, -smoothness, r - (progress * (1.0 + smoothness)));
  return mix(getFromColor(p), getToColor(p), m);
}
`,author:"gre",license:"MIT",description:"The incoming image appears in random squares",tags:["squares","grid","dissolve"],params:{size:{type:"ivec2",default:[10,10],description:"Number of squares (columns, rows)"},smoothness:{type:"float",default:.5,description:"Softness of each square's switch"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"Reassemble",paramsTypes:{rows:"int",depth:"float",spread:"float",backColor:"vec4"},defaultParams:{rows:4,depth:.8,spread:.05,backColor:[.04,.04,.05,1]},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image cracks into irregular shards that burst apart toward the viewer, each one turning over in 3D at its own moment, then fly back together and lock into place as the incoming image carried on their backs
// Tags: 3d, shards, flip, explode

// @range(2, 8, 1) Number of rows of shards
uniform int rows; // = 4
// @range(0, 1) How far the shards come toward the viewer
uniform float depth; // = 0.8
// @range(0, 0.5) How far the shards spread apart, as a part of their distance from the center
uniform float spread; // = 0.05
// @color Color seen between the shards
uniform vec4 backColor; // = vec4(0.04, 0.04, 0.05, 1.0)

const float PI = 3.141592653589793;
// distance of the eye, in frame heights
const float EYE = 2.5;
// width of the anti-aliased edges and half width of the open cracks, in frame heights
const float EDGE = 0.0015;
const float CRACK = 0.005;
// the shards leave between START and START + DELAY, and each one flies for FLIGHT
const float START = 0.03;
const float DELAY = 0.08;
const float FLIGHT = 0.86;

vec3 hash3(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  q += dot(q, q.yxz + 33.33);
  return fract((q.xxy + q.yzz) * q.zyx);
}

// the seed of the shard of grid cell g, in frame heights from the center
vec2 seed(vec2 g, float size) {
  return (g + 0.5 + 0.7 * (hash3(g).xy - 0.5)) * size;
}

// distance from q to the border of the shard of cell g (its Voronoi cell), negative outside it
float shardDist(vec2 q, vec2 g, float size) {
  vec2 sj = seed(g, size);
  float d = 1e9;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      if (x == 0 && y == 0) continue;
      vec2 sk = seed(g + vec2(float(x), float(y)), size);
      vec2 dir = sk - sj;
      d = min(d, dot(0.5 * (sj + sk) - q, dir) / length(dir));
    }
  }
  return d;
}

float ease(float t) {
  return t * t * (3.0 - 2.0 * t);
}

// how far a shard is out of place along its flight t: a quick burst, then a soft landing
float burst(float t) {
  float u = clamp(t / 0.4, 0.0, 1.0);
  float v = clamp((t - 0.4) / 0.6, 0.0, 1.0);
  return t < 0.4 ? 1.0 - (1.0 - u) * (1.0 - u) : 1.0 - ease(v);
}

vec4 transition(vec2 uv) {
  vec2 aspect = vec2(ratio, 1.0);
  vec2 x = (uv - 0.5) * aspect;
  float size = 1.0 / clamp(float(rows), 1.0, 8.0);
  float E = clamp(spread, 0.0, 0.5);
  float Z = clamp(depth, 0.0, 1.0);
  float p = clamp(progress, 0.0, 1.0);
  vec3 L = normalize(vec3(-0.45, 0.55, 1.0));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  vec3 eye = vec3(0.0, 0.0, EYE);
  vec3 dir = vec3(x, -EYE);
  // the cracks open as the image breaks and close as the shards lock back into place
  float act = smoothstep(0.0, START + DELAY, p) * (1.0 - smoothstep(START + FLIGHT, 1.0, p));

  // where this point roughly comes from, to find the shards that can cover it
  float b0 = burst(clamp((p - START - 0.5 * DELAY) / FLIGHT, 0.0, 1.0));
  vec2 x0 = x * (EYE - 0.75 * Z * b0) / EYE / (1.0 + E * b0);
  vec2 cell0 = floor(x0 / size);

  // the two nearest shards seen here: depth, image point, side (1 front), coverage, shading, rim
  float z1 = 1e9, z2 = 1e9;
  vec2 q1 = x, q2 = x;
  float f1 = 1.0, f2 = 1.0, m1 = 0.0, m2 = 0.0;
  float s1 = 1.0, s2 = 1.0, r1 = 0.0, r2 = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = cell0 + vec2(float(i), float(j));
      vec3 h = hash3(g + 17.0);
      float t = clamp((p - START - DELAY * h.x) / FLIGHT, 0.0, 1.0);
      float b = burst(t);
      // each shard turns over around its own axis at its own moment, while it is out of place
      float th = PI * ease(clamp((t - 0.1 - 0.48 * h.z) / 0.24, 0.0, 1.0));
      float ct = cos(th), st = sin(th);
      // and turns a little in the frame, back straight when it lands
      float phi = PI * h.y;
      float rz = 0.5 * (h.z - 0.5) * b;
      vec2 a0 = vec2(cos(phi), sin(phi));
      vec2 p0 = vec2(-a0.y, a0.x);
      vec3 a = vec3(cos(phi + rz), sin(phi + rz), 0.0);
      vec3 w = vec3(-a.y, a.x, 0.0) * ct + vec3(0.0, 0.0, st);
      vec2 c = seed(g, size);
      vec3 center = vec3(c * (1.0 + E * b), Z * b * (0.5 + 0.5 * h.x));
      vec3 nrm = cross(a, w);
      float den = dot(dir, nrm);
      if (abs(den) < 1e-6) continue;
      float lam = dot(center - eye, nrm) / den;
      if (lam <= 0.0) continue;
      vec3 hit = eye + lam * dir - center;
      float u = dot(hit, a), v = dot(hit, w);
      // the front carries the outgoing image, the back the incoming one, mirrored so that it lands in place;
      // the side seen is the one facing the eye, which swaps where the shard is seen edge-on
      float front = den < 0.0 ? 1.0 : -1.0;
      vec2 q = c + u * a0 + front * v * p0;
      // anti-aliased edges, scaled to the screen; at rest the shards overlap a little to hide their seams
      float k = EYE / (EYE - center.z);
      float e = shardDist(q, g, size) - CRACK * act;
      vec2 box = 0.5 * aspect - abs(q);
      e = min(e, min(box.x, box.y)) * k * mix(1.0, max(abs(ct), 0.2), min(b * 8.0, 1.0)) + 4.0 * EDGE * (1.0 - act);
      float m = clamp(e / (2.0 * EDGE) + 0.5, 0.0, 1.0);
      // at rest the shards lie at the same depth: the one that covers this point fully comes first
      float zk = lam - 0.001 * m;
      if (m <= 0.0 || zk >= z2) continue;
      // lit from the upper left, with a glint as a shard faces the light; unchanged at rest
      vec3 n = nrm * front;
      float lit = mix(0.45, 1.0, clamp(dot(n, L) / L.z, 0.0, 1.0));
      float glint = 0.2 * min(b * 4.0, 1.0) * pow(max(dot(n, H), 0.0), 24.0);
      // a pale rim on the broken edges while they fly, flashing as each shard locks into place
      float lock = sin(PI * clamp((t - 0.86) / 0.14, 0.0, 1.0));
      float rim = (0.3 * act * min(b * 4.0, 1.0) + 0.35 * lock) * (1.0 - smoothstep(0.0, 0.006, e));
      if (zk < z1) {
        z2 = z1; q2 = q1; f2 = f1; m2 = m1; s2 = s1; r2 = r1;
        z1 = zk; q1 = q; f1 = front; m1 = m; s1 = lit + glint; r1 = rim;
      } else {
        z2 = zk; q2 = q; f2 = front; m2 = m; s2 = lit + glint; r2 = rim;
      }
    }
  }

  vec4 col = backColor;
  if (m2 > 0.0) {
    vec2 src = q2 / aspect + 0.5;
    vec4 img = f2 > 0.0 ? getFromColor(src) : getToColor(src);
    img.rgb = mix(min(img.rgb * s2, vec3(img.a)), vec3(img.a), r2);
    col = mix(col, img, m2);
  }
  if (m1 > 0.0) {
    vec2 src = q1 / aspect + 0.5;
    vec4 img = f1 > 0.0 ? getFromColor(src) : getToColor(src);
    img.rgb = mix(min(img.rgb * s1, vec3(img.a)), vec3(img.a), r1);
    col = mix(col, img, m1);
  }
  return col;
}
`,author:"gre",license:"MIT",description:"The outgoing image cracks into irregular shards that burst apart toward the viewer, each one turning over in 3D at its own moment, then fly back together and lock into place as the incoming image carried on their backs",tags:["3d","shards","flip","explode"],params:{rows:{type:"int",default:4,min:2,max:8,step:1,description:"Number of rows of shards"},depth:{type:"float",default:.8,min:0,max:1,description:"How far the shards come toward the viewer"},spread:{type:"float",default:.05,min:0,max:.5,description:"How far the shards spread apart, as a part of their distance from the center"},backColor:{type:"vec4",default:[.04,.04,.05,1],color:!0,description:"Color seen between the shards"}},textures:[],createdAt:"Fri, 13 Nov 2026 18:44:56 +0100",updatedAt:"Fri, 13 Nov 2026 18:44:56 +0100"},{name:"RectangleCover",paramsTypes:{bgcolor:"vec4"},defaultParams:{bgcolor:[0,0,0,1]},glsl:`// Author: martiniti
// License: MIT
// Description: A rectangle grows from the center to cover the outgoing image, then shrinks to reveal the incoming one
// Tags: box, shape, iris

// @color Color of the rectangle
uniform vec4 bgcolor; // = vec4(0.0, 0.0, 0.0, 1.0)

vec4 transition(vec2 p) {
  float s = pow(2.0 * abs(progress - 0.5), 3.0);
  
   vec2 sq = p.xy / vec2(1.0).xy;
   
    // bottom-left
    vec2 bl = step(vec2(abs(1. - 2.*progress)), sq + .25);
    float dist = bl.x * bl.y;

    // top-right
    vec2 tr = step(vec2(abs(1. - 2.*progress)), 1.25-sq);
    dist *= 1. * tr.x * tr.y;
  
  return mix(
    progress < 0.5 ? getFromColor(p) : getToColor(p),
    bgcolor,
    step(s, dist)
  );
  
}
`,author:"martiniti",license:"MIT",description:"A rectangle grows from the center to cover the outgoing image, then shrinks to reveal the incoming one",tags:["box","shape","iris"],params:{bgcolor:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color of the rectangle"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"RectangleIris",paramsTypes:{bgcolor:"vec4"},defaultParams:{bgcolor:[0,0,0,1]},glsl:`// License: MIT
// Author: martiniti
// Description: The outgoing image shrinks into a small rectangle over a background color, then the incoming one grows from it
// Tags: box, iris, zoom

// @color Background color
uniform vec4 bgcolor; // = vec4(0.0, 0.0, 0.0, 1.0)

vec4 transition(vec2 uv) {
  
  float s = pow(2.0 * abs(progress - 0.5), 3.0);
              
  vec2 q = uv.xy / vec2(1.0).xy;
  
  // bottom-left
  vec2 bl = step(vec2(1.0 - 2.0*abs(progress - 0.5)), q + 0.25);
  
  // top-right
  vec2 tr = step(vec2(1.0 - 2.0*abs(progress - 0.5)), 1.25 - q);
  
  float dist = length(1.0 - bl.x * bl.y * tr.x * tr.y);
  
  return mix(
    progress < 0.5 ? getFromColor(uv) : getToColor(uv),
    bgcolor,
    step(s, dist)
  );
  
}
`,author:"martiniti",license:"MIT",description:"The outgoing image shrinks into a small rectangle over a background color, then the incoming one grows from it",tags:["box","iris","zoom"],params:{bgcolor:{type:"vec4",default:[0,0,0,1],color:!0,description:"Background color"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"Refraction",paramsTypes:{strength:"float",scale:"float",dispersion:"float",brightness:"float"},defaultParams:{strength:.15,scale:2.5,dispersion:.5,brightness:1},glsl:`// Author: gre
// License: MIT
// Description: The frame is seen through flowing liquid glass that bends the outgoing image more and more, with rainbow fringes, flares up as the incoming image takes over, then calms down and clears
// Tags: distortion, refraction, chromatic-aberration, glow

// @range(0, 0.3) How far the glass bends the image at the peak
uniform float strength; // = 0.15
// @range(0.5, 8) Size of the flowing waves: higher makes smaller waves
uniform float scale; // = 2.5
// @range(0, 1) Spread of the rainbow fringes
uniform float dispersion; // = 0.5
// @range(0, 3) Brightness of the flare at the peak
uniform float brightness; // = 1.0

// the wavelengths sampled from red to violet
const int TAPS = 7;

// the glass surface: smooth waves of a few sizes, warped into each other and flowing over time
float surface(vec2 q, float t) {
  q += 0.45 * vec2(sin(1.3 * q.y + 0.9 * t), sin(1.1 * q.x - 1.2 * t));
  float h = sin(q.x + 0.6 * t) * sin(1.2 * q.y - 0.8 * t);
  h += 0.5 * sin(dot(q, vec2(1.6, -1.2)) + 1.4 * t);
  h += 0.3 * sin(dot(q, vec2(-1.1, 2.9)) - 1.9 * t + 1.7 * sin(0.9 * q.x));
  h += 0.15 * sin(dot(q, vec2(4.3, 3.1)) + 2.6 * t);
  return h;
}

// a hash without sin, to jitter the wavelengths from pixel to pixel
float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// rough spectral response of a wavelength w (0 = red, 1 = violet), in RGB
vec3 spectrum(float w) {
  vec3 c = vec3(
    1.0 - smoothstep(0.0, 0.55, w) + 0.35 * smoothstep(0.75, 1.0, w),
    1.0 - abs(2.0 * w - 1.0) * 1.2,
    smoothstep(0.45, 1.0, w)
  );
  return clamp(c, 0.0, 1.0);
}

vec4 transition(vec2 uv) {
  float p = progress;
  // 0 at both ends, 1 in the middle: the glass builds up slowly, then calms down
  float h = 1.0 - abs(2.0 * p - 1.0);
  float amount = h * h * (2.0 - h);

  // the glass refracts along the slope of its surface
  vec2 q = (uv - 0.5) * vec2(ratio, 1.0) * scale;
  float t = 3.0 * p;
  float e = 0.01;
  vec2 slope = vec2(
    surface(q + vec2(e, 0.0), t) - surface(q - vec2(e, 0.0), t),
    surface(q + vec2(0.0, e), t) - surface(q - vec2(0.0, e), t)
  ) / (2.0 * e);
  vec2 offset = slope * strength * amount / scale;
  // the switch to the incoming image, around the peak: it appears through the glass's waves,
  // the crests first, then the troughs
  float wave = clamp(0.5 * surface(q, t), -1.0, 1.0);
  float m = smoothstep(-0.015, 0.015, p - 0.5 + 0.1 * wave);

  // each wavelength bends a little differently: red the least, violet the most
  vec3 color = vec3(0.0);
  vec3 weights = vec3(0.0);
  float alpha = 0.0;
  // jittered wavelengths blend the fringes into a continuous rainbow
  float jitter = hash12(uv * vec2(ratio, 1.0) * 1000.0) - 0.5;
  for (int i = 0; i < TAPS; i++) {
    float w = float(i) / float(TAPS - 1);
    float wj = (float(i) + jitter) / float(TAPS - 1);
    vec2 st = mirror(uv + offset * (1.0 + dispersion * (wj - 0.5) * 1.6));
    vec4 c = mix(getFromColor(st), getToColor(st), m);
    vec3 s = spectrum(w);
    color += s * c.rgb * c.a;
    weights += s;
    alpha += c.a;
  }
  alpha /= float(TAPS);
  color = color / weights / max(alpha, 1e-5);

  // a flare at the peak: the image is pushed toward an overexposed white
  float flare = 2.0 * brightness * pow(h, 8.0);
  color = color * (1.0 + flare) / (1.0 + flare * color);
  color += 0.1 * flare * dot(color, vec3(0.3333));
  return vec4(clamp(color, 0.0, 1.0), alpha);
}
`,author:"gre",license:"MIT",description:"The frame is seen through flowing liquid glass that bends the outgoing image more and more, with rainbow fringes, flares up as the incoming image takes over, then calms down and clears",tags:["distortion","refraction","chromatic-aberration","glow"],params:{strength:{type:"float",default:.15,min:0,max:.3,description:"How far the glass bends the image at the peak"},scale:{type:"float",default:2.5,min:.5,max:8,description:"Size of the flowing waves: higher makes smaller waves"},dispersion:{type:"float",default:.5,min:0,max:1,description:"Spread of the rainbow fringes"},brightness:{type:"float",default:1,min:0,max:3,description:"Brightness of the flare at the peak"}},textures:[],createdAt:"Sat, 31 Oct 2026 23:20:50 +0100",updatedAt:"Sat, 31 Oct 2026 23:20:50 +0100"},{name:"Revolve",paramsTypes:{center:"vec2",direction:"float",maxRotation:"float",peakZoom:"float",swirl:"float",barrel:"float",motionBlur:"float",switchStart:"float",switchEnd:"float",shadow:"float"},defaultParams:{center:[.46,.52],direction:-1,maxRotation:1.95,peakZoom:2.22,swirl:2.85,barrel:.38,motionBlur:1,switchStart:.3,switchEnd:.5,shadow:.16},glsl:`// Author: bread
// License: MIT
// Description: The outgoing image swirls and zooms with motion blur into the incoming one
// Tags: swirl, zoom, rotate, blur
// gl-transitions v1 compatible

// @param Center of the swirl
uniform vec2 center;       // = vec2(0.46, 0.52)
uniform float direction;   // = -1.0
uniform float maxRotation; // = 1.95
uniform float peakZoom;    // = 2.22
uniform float swirl;       // = 2.85
uniform float barrel;      // = 0.38
uniform float motionBlur;  // = 1.0
uniform float switchStart; // = 0.30
uniform float switchEnd;   // = 0.50
uniform float shadow;      // = 0.16

float sat(float x) {
  return clamp(x, 0.0, 1.0);
}

float ease(float x) {
  x = sat(x);
  return x * x * (3.0 - 2.0 * x);
}

float revolveEnvelope(float t) {
  float rise = ease((t - 0.10) / 0.33);
  float fall = 1.0 - ease((t - 0.43) / 0.29);
  return rise * fall;
}

vec2 rotate2(vec2 p, float a) {
  float s = sin(a);
  float c = cos(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

vec2 warpUv(vec2 uv, float t) {
  float e = revolveEnvelope(t);

  vec2 p = uv - center;
  p.x *= ratio;

  float r = length(p);
  float edgeSpin = maxRotation * e;
  float coreSpin = swirl * e * pow(1.0 - sat(r / 0.96), 1.55);
  float visibleAngle = direction * (edgeSpin + coreSpin);

  p = rotate2(p, -visibleAngle);

  float sc = 1.0 + (peakZoom - 1.0) * pow(e, 0.85);
  p /= sc;

  float rr = length(p);
  p *= 1.0 + barrel * e * rr * rr * 2.8;

  p.x /= ratio;
  return clamp(p + center, vec2(0.001), vec2(0.999));
}

vec4 sampleRevolve(vec2 uv, float t) {
  vec2 p = warpUv(uv, t);
  float reveal = smoothstep(switchStart, switchEnd, t);
  return mix(getFromColor(p), getToColor(p), reveal);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  float e = revolveEnvelope(progress);
  float span = 0.060 * motionBlur * e;

  vec4 color = vec4(0.0);
  float total = 0.0;

  for (int i = -8; i <= 8; i++) {
    float x = float(i) / 8.0;
    float w = 1.0 - abs(x);
    w = w * w + 0.01;

    float t = sat(progress + x * span);
    color += sampleRevolve(uv, t) * w;
    total += w;
  }

  color /= total;

  vec2 q = uv - vec2(0.5);
  q.x *= ratio;
  float vignette = 1.0 - shadow * e * smoothstep(0.35, 0.95, length(q));
  color.rgb *= vignette;

  return color;
}
`,author:"bread",license:"MIT",description:"The outgoing image swirls and zooms with motion blur into the incoming one",tags:["swirl","zoom","rotate","blur"],params:{center:{type:"vec2",default:[.46,.52],description:"Center of the swirl"},direction:{type:"float",default:-1},maxRotation:{type:"float",default:1.95},peakZoom:{type:"float",default:2.22},swirl:{type:"float",default:2.85},barrel:{type:"float",default:.38},motionBlur:{type:"float",default:1},switchStart:{type:"float",default:.3},switchEnd:{type:"float",default:.5},shadow:{type:"float",default:.16}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"RibbonTwist",paramsTypes:{spread:"float",perspective:"float",shading:"float",vertical:"bool",backColor:"vec4"},defaultParams:{spread:.8,perspective:.4,shading:.6,vertical:!1,backColor:[0,0,0,1]},glsl:`// Author: gre
// License: MIT
// Description: The image twists like a ribbon around its horizontal center line, the twist travelling smoothly across its width, the outgoing image on its front and the incoming one on its back
// Tags: 3d, flip, rotate

// @range(0.1, 2) Length of the twisted section, as a part of the frame's width
uniform float spread; // = 0.8
// @range(0, 0.8) Amount of perspective: the edge turning toward the viewer grows
uniform float perspective; // = 0.4
// @range(0, 1) How much the ribbon darkens as it turns away
uniform float shading; // = 0.6
// @param Twist around the vertical center line instead, travelling from top to bottom
uniform bool vertical; // = false
// @color Color seen where the twisting ribbon leaves the frame uncovered
uniform vec4 backColor; // = vec4(0.0, 0.0, 0.0, 1.0)

const float PI = 3.141592653589793;
// width of the anti-aliased edges, in frame heights
const float EDGE = 0.002;

vec4 transition (vec2 uv) {
  // q.x: along the ribbon, the way the twist travels; q.y: across the ribbon
  vec2 q = vertical ? vec2(1.0 - uv.y, uv.x) : uv;
  // the ribbon's half width across, in frame heights
  float halfSize = vertical ? 0.5 * ratio : 0.5;
  // each line across the ribbon turns half a turn, a little later than the one before
  float t = smoothstep(0.0, 1.0, (progress * (1.0 + spread) - q.x) / spread);
  // the visible face (outgoing front, incoming back) and its angle from its rest position
  bool front = t < 0.5;
  float angle = PI * (front ? t : t - 1.0);
  float c = cos(angle);
  float s = sin(angle);
  // w: screen position across the ribbon, -1 to 1 at rest; v: the matching position on the face
  // a point v of the face goes to v * c across and v * s in depth, nearer points look bigger
  float w = 2.0 * q.y - 1.0;
  float den = c + perspective * w * s;
  if (den <= 0.0) return backColor;
  float v = w / den;
  if (abs(v) >= 1.0) return backColor;
  // soft edges while twisting (sharp at rest, to keep the first and last frames exact)
  float edge = max(EDGE * min(1.0, 20.0 * abs(s)), 1e-4);
  float top = c / (1.0 - perspective * s);
  float bottom = -c / (1.0 + perspective * s);
  float cover = clamp(min(top - w, w - bottom) * halfSize / edge, 0.0, 1.0);
  vec2 p = vec2(q.x, 0.5 + 0.5 * v);
  p = vertical ? vec2(p.y, 1.0 - p.x) : p;
  vec4 img = front ? getFromColor(p) : getToColor(p);
  // lit from the front and slightly from one side of the axis
  float lambert = clamp(c - 0.25 * s, 0.0, 1.0);
  vec4 color = vec4(img.rgb * mix(1.0 - shading, 1.0, lambert), img.a);
  return mix(backColor, color, cover);
}
`,author:"gre",license:"MIT",description:"The image twists like a ribbon around its horizontal center line, the twist travelling smoothly across its width, the outgoing image on its front and the incoming one on its back",tags:["3d","flip","rotate"],params:{spread:{type:"float",default:.8,min:.1,max:2,description:"Length of the twisted section, as a part of the frame's width"},perspective:{type:"float",default:.4,min:0,max:.8,description:"Amount of perspective: the edge turning toward the viewer grows"},shading:{type:"float",default:.6,min:0,max:1,description:"How much the ribbon darkens as it turns away"},vertical:{type:"bool",default:!1,description:"Twist around the vertical center line instead, travelling from top to bottom"},backColor:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color seen where the twisting ribbon leaves the frame uncovered"}},textures:[],createdAt:"Fri, 6 Nov 2026 08:07:28 +0100",updatedAt:"Fri, 6 Nov 2026 08:07:28 +0100"},{name:"RingSpin",paramsTypes:{rings:"int",square:"bool",turns:"int",stagger:"float",blur:"float",settle:"float"},defaultParams:{rings:6,square:!1,turns:1,stagger:.5,blur:.6,settle:.5},glsl:`// Author: gre
// License: MIT
// Description: The frame is cut into concentric rings that spin like the dials of a combination lock, in alternating directions and blurred with speed, one after another from the center outward; each ring overshoots a little and locks into place on the incoming image
// Tags: rotate, circle, rings, motion-blur

// @range(2, 12, 1) Number of rings, from the center to the farthest corner
uniform int rings; // = 6
// @param Square rings, like nested frames, instead of round ones
uniform bool square; // = false
// @range(1, 3, 1) Full turns made by each ring
uniform int turns; // = 1
// @range(0, 0.8) Delay between the first ring and the last one, as a part of the transition
uniform float stagger; // = 0.5
// @range(0, 1) Amount of angular motion blur while the rings spin fast
uniform float blur; // = 0.6
// @range(0, 1) Size of the overshoot when a ring locks
uniform float settle; // = 0.5

const float PI = 3.141592653589793;
// part of a ring's time spent overshooting and coming back
const float SETTLE = 0.2;
// half width of the gaps between the rings, width of their rims and of the anti-aliased edges, in frame heights
const float GAP = 0.0035;
const float RIM = 0.012;
const float EDGE = 0.0015;

vec2 mirrorUV(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

vec2 rotate(vec2 v, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * v.x + s * v.y, c * v.y - s * v.x);
}

// the delay between two rings, kept shorter than the time a ring moves so that the motion never pauses
float ringDelay(float n) {
  float m = max(n - 1.0, 1.0);
  return min(clamp(stagger, 0.0, 0.8) / m, 0.7 / (1.0 + 0.7 * m));
}

// local time of ring i: 0 until it starts, 1 once it is locked
float ringTime(float i, float n) {
  float d = ringDelay(n);
  return progress >= 1.0 ? 1.0 : clamp((progress - d * i) / (1.0 - d * (n - 1.0)), 0.0, 1.0);
}

// how much a ring is moving, which opens the gaps around it
float activity(float i, float n) {
  float t = ringTime(i, n);
  return smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.88, 1.0, t));
}

// the ring's angle at its time t: it speeds up, reaches \`total\` a little fast, overshoots and springs back
float spin(float t, float total) {
  float amp = 0.1 * settle * sign(total);
  float stopT = 1.0 - SETTLE;
  // speed at the stop, matched with the start of the overshoot
  float v1 = amp * PI * stopT / (total * SETTLE);
  float u = clamp(t / stopT, 0.0, 1.0);
  float b = clamp((t - stopT) / SETTLE, 0.0, 1.0);
  return total * (u * u * (3.0 - 2.0 * u) + v1 * (u * u * u - u * u)) + amp * sin(PI * b) * (1.0 - b) * (1.0 - b);
}

vec4 transition(vec2 uv) {
  vec2 aspect = vec2(ratio, 1.0);
  vec2 c = (uv - 0.5) * aspect;
  float r = square ? max(abs(c.x), abs(c.y)) : length(c);
  float n = clamp(float(rings), 1.0, 12.0);
  float w = (square ? 0.5 * max(ratio, 1.0) : length(0.5 * aspect)) / n;
  float f = r / w;
  float i = min(floor(f), n - 1.0);
  float t = ringTime(i, n);

  vec4 col;
  if (t <= 0.0) col = getFromColor(uv);
  else if (t >= 1.0) col = getToColor(uv);
  else {
    float total = 2.0 * PI * max(float(turns), 1.0) * (mod(i, 2.0) < 0.5 ? 1.0 : -1.0);
    float a = spin(t, total);
    // angular speed per unit of progress, without the small overshoot; the blur spans what the ring
    // travels in about a frame, at most a short arc so that the 8 taps stay close together
    float u = min(t / (1.0 - SETTLE), 1.0);
    float omega = abs(total) * 6.0 * u * (1.0 - u) / ((1.0 - SETTLE) * (1.0 - ringDelay(n) * (n - 1.0)));
    float span = blur * min(omega * 0.015, 0.1 / max(r, 0.01));
    // the incoming image takes over at full speed, hidden by the blur; the whole turns bring it back upright
    float m = smoothstep(0.3, 0.5, t);
    col = vec4(0.0);
    float ws = 0.0;
    for (int k = 0; k < 8; k++) {
      float x = float(k) / 7.0 - 0.5;
      vec2 q = mirrorUV(rotate(c, a + span * x) / aspect + 0.5);
      vec4 s = mix(getFromColor(q), getToColor(q), m);
      col += (1.0 - abs(x)) * s;
      ws += 1.0 - abs(x);
    }
    col /= ws;
  }

  // the nearest boundary between two rings, open while one of them moves: a dark gap
  // with a bevelled rim on each side, lit from the top left
  float bj = clamp(floor(f + 0.5), 1.0, max(n - 1.0, 1.0));
  float act = n > 1.5 ? max(activity(bj - 1.0, n), activity(bj, n)) : 0.0;
  float d = (f - bj) * w;
  vec2 nr = square ? (abs(c.x) > abs(c.y) ? vec2(sign(c.x), 0.0) : vec2(0.0, sign(c.y))) : c / max(r, 1e-4);
  // the outer ring's inner rim faces the center, the inner ring's outer rim faces away from it
  float light = -sign(d) * dot(nr, vec2(-0.6, 0.8)) * (1.0 - smoothstep(GAP, GAP + RIM, abs(d))) * act;
  col.rgb = light > 0.0 ? mix(col.rgb, vec3(col.a), 0.35 * light) : col.rgb * (1.0 + 0.45 * light);
  col.rgb *= 1.0 - 0.85 * act * (1.0 - smoothstep(GAP - EDGE, GAP + EDGE, abs(d)));
  return col;
}
`,author:"gre",license:"MIT",description:"The frame is cut into concentric rings that spin like the dials of a combination lock, in alternating directions and blurred with speed, one after another from the center outward; each ring overshoots a little and locks into place on the incoming image",tags:["rotate","circle","rings","motion-blur"],params:{rings:{type:"int",default:6,min:2,max:12,step:1,description:"Number of rings, from the center to the farthest corner"},square:{type:"bool",default:!1,description:"Square rings, like nested frames, instead of round ones"},turns:{type:"int",default:1,min:1,max:3,step:1,description:"Full turns made by each ring"},stagger:{type:"float",default:.5,min:0,max:.8,description:"Delay between the first ring and the last one, as a part of the transition"},blur:{type:"float",default:.6,min:0,max:1,description:"Amount of angular motion blur while the rings spin fast"},settle:{type:"float",default:.5,min:0,max:1,description:"Size of the overshoot when a ring locks"}},textures:[],createdAt:"Mon, 9 Nov 2026 20:48:31 +0100",updatedAt:"Mon, 9 Nov 2026 20:48:31 +0100"},{name:"RingsWipe",paramsTypes:{count:"int",center:"vec2",stagger:"float",radial:"bool",borderWidth:"float",borderColor:"vec4",smoothness:"float"},defaultParams:{count:6,center:[.5,.5],stagger:.5,radial:!1,borderWidth:.008,borderColor:[1,1,1,1],smoothness:.004},glsl:`// Author: gre
// License: MIT
// Description: Concentric rings ripple out from the center and, one after another, each sweeps around like a clock hand in the opposite direction of its neighbors to reveal the incoming image, or fills across its width, with optional colored borders between the rings
// Tags: wipe, circle, radial, rings, clock

// @range(1, 20, 1) Number of rings, from the center to the farthest corner
uniform int count; // = 6
// @param Center of the rings, in texture coordinates
uniform vec2 center; // = vec2(0.5, 0.5)
// @range(0, 1) Delay between the starts of two rings: 0 moves them all together, 1 starts each one when the previous one is done
uniform float stagger; // = 0.5
// @param Each ring fills across its width, outward and inward in turn, instead of sweeping around
uniform bool radial; // = false
// @range(0, 0.05) Width of the borders between the rings while they move, in frame heights (0 disables them)
uniform float borderWidth; // = 0.008
// @color Color of the borders between the rings
uniform vec4 borderColor; // = vec4(1.0, 1.0, 1.0, 1.0)
// @range(0, 0.1) Softness of the edges
uniform float smoothness; // = 0.004

const float PI = 3.141592653589793;
// half width of the antialiased edge, in frame heights
const float AA = 0.0015;

// progress of ring i, from 0 (not started) to 1 (done), each ring lasting d and starting
// k * d after the previous one
float ringProgress(float i, float k, float d, float t) {
  return clamp((t - i * k * d) / d, 0.0, 1.0);
}

// how much ring i, of width w and progress lp, shows the incoming image at radius rad and
// turn a (0 to 1)
float ringMask(float i, float lp, float w, float rad, float a, float s) {
  bool odd = mod(i, 2.0) > 0.5;
  if (radial) {
    // the filled part grows across the ring, from its inner edge or from its outer one,
    // starting and ending a soft edge past the ring; measured within the ring, so a ring
    // that has not started does not leak into its neighbor's antialiased boundary
    float e = s / w;
    float f = mix(-e, 1.0 + e, lp);
    float x = clamp((rad - i * w) / w, 0.0, 1.0);
    float dist = (odd ? f - (1.0 - x) : f - x) * w;
    return smoothstep(-s, s, dist);
  }
  // the filled part is a growing arc from the top, clockwise on even rings and
  // counterclockwise on odd ones; both of its ends are soft, and it starts empty and
  // ends full, wrapping around, by a soft edge measured along the circle (no shorter than
  // the softness itself near the center, so the center is not left half blended)
  float aa = odd ? 1.0 - a : a;
  float arc = 2.0 * PI * max(rad, s);
  float e = s / arc;
  float lo = mix(e, -e, lp);
  float hi = mix(-e, 1.0 + e, lp);
  float dist = max(min(aa - lo, hi - aa), min(aa - 1.0 - lo, hi - aa + 1.0));
  return smoothstep(-s, s, dist * arc);
}

vec4 transition(vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  if (progress <= 0.0) return a;
  if (progress >= 1.0) return b;

  float n = float(count < 1 ? 1 : count);
  // measured in square pixels, so the rings are round
  vec2 p = (uv - center) * vec2(ratio, 1.0);
  // the rings reach the farthest corner
  vec2 far = max(center, 1.0 - center) * vec2(ratio, 1.0);
  float R = length(far) + AA;
  float w = R / n;
  float rad = length(p);
  float turn = rad > 0.0 ? fract(atan(p.x, p.y) / (2.0 * PI)) : 0.0;
  float s = max(min(smoothness, 0.25 * w), AA);
  float t = mix(progress, progress * progress * (3.0 - 2.0 * progress), 0.35);
  float k = clamp(stagger, 0.0, 1.0);
  float d = 1.0 / (1.0 + k * (n - 1.0));

  // blend the two rings on either side of the nearest boundary, so it is antialiased
  float j = floor(rad / w + 0.5);
  float inner = clamp(j - 1.0, 0.0, n - 1.0);
  float outer = clamp(j, 0.0, n - 1.0);
  float li = ringProgress(inner, k, d, t);
  float lo = ringProgress(outer, k, d, t);
  float m = mix(
    ringMask(inner, li, w, rad, turn, s),
    ringMask(outer, lo, w, rad, turn, s),
    smoothstep(-AA, AA, rad - j * w)
  );

  // mixed premultiplied, so transparent images do not bleed their color
  vec4 c = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);

  // the border between two rings shows from when the inner one starts until the outer one
  // is done, without dimming when one hands over to the other
  if (borderWidth > 0.0 && j >= 1.0 && j <= n - 1.0) {
    float on = min(1.0, 4.0 * li * (1.0 - lo));
    // never wider than the ring, and thinner than the antialiasing only by fading out
    float hw = min(0.5 * borderWidth, 0.5 * w - AA);
    float line = (1.0 - smoothstep(hw - AA, hw + AA, abs(rad - j * w)))
      * min(1.0, borderWidth / (2.0 * AA));
    float o = borderColor.a * line * on;
    c = vec4(borderColor.rgb * o, o) + c * (1.0 - o);
  }
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"Concentric rings ripple out from the center and, one after another, each sweeps around like a clock hand in the opposite direction of its neighbors to reveal the incoming image, or fills across its width, with optional colored borders between the rings",tags:["wipe","circle","radial","rings","clock"],params:{count:{type:"int",default:6,min:1,max:20,step:1,description:"Number of rings, from the center to the farthest corner"},center:{type:"vec2",default:[.5,.5],description:"Center of the rings, in texture coordinates"},stagger:{type:"float",default:.5,min:0,max:1,description:"Delay between the starts of two rings: 0 moves them all together, 1 starts each one when the previous one is done"},radial:{type:"bool",default:!1,description:"Each ring fills across its width, outward and inward in turn, instead of sweeping around"},borderWidth:{type:"float",default:.008,min:0,max:.05,description:"Width of the borders between the rings while they move, in frame heights (0 disables them)"},borderColor:{type:"vec4",default:[1,1,1,1],color:!0,description:"Color of the borders between the rings"},smoothness:{type:"float",default:.004,min:0,max:.1,description:"Softness of the edges"}},textures:[],createdAt:"Wed, 4 Nov 2026 20:11:21 +0100",updatedAt:"Wed, 4 Nov 2026 20:11:21 +0100"},{name:"Ripple",paramsTypes:{amplitude:"float",speed:"float"},defaultParams:{amplitude:100,speed:50},glsl:`// Author: gre
// License: MIT
// Description: Ripples spread from the center while crossfading
// Tags: ripple, wave, blend
// @param Frequency of the ripples
uniform float amplitude; // = 100.0
// @param Speed of the ripples
uniform float speed; // = 50.0

vec4 transition (vec2 uv) {
  vec2 dir = uv - vec2(.5);
  float dist = length(dir);
  vec2 offset = dir * (sin(progress * dist * amplitude - progress * speed) + .5) / 30. * progress;
  return mix(
    getFromColor(uv + offset),
    getToColor(uv),
    smoothstep(0.2, 1.0, progress)
  );
}
`,author:"gre",license:"MIT",description:"Ripples spread from the center while crossfading",tags:["ripple","wave","blend"],params:{amplitude:{type:"float",default:100,description:"Frequency of the ripples"},speed:{type:"float",default:50,description:"Speed of the ripples"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"Rolls",paramsTypes:{type:"int",RotDown:"bool"},defaultParams:{type:0,RotDown:!1},glsl:`// Author: Mark Craig
// mrmcsoftware on github and youtube ( http://www.youtube.com/MrMcSoftware )
// License: MIT
// Description: The outgoing image rolls away around a corner, revealing the incoming one
// Tags: rotate, roll

// Rolls Transition by Mark Craig (Copyright © 2022)

// @range(0, 3, 1) Corner to roll around
uniform int type; // = 0
// @param Roll the outgoing image down instead of up
uniform bool RotDown; // = false
// type (0-3): Rotate/Roll from which corner
// RotDown: if true rotate old image down, otherwise rotate old image up

#define M_PI 3.14159265358979323846

vec4 transition(vec2 uv)
{
float theta, c1, s1;
vec2 iResolution = vec2(ratio, 1.0);
vec2 uvi;
// I used if/else instead of switch in case it's an old GPU
if (type == 0) { theta = (RotDown ? M_PI : -M_PI) / 2.0 * progress; uvi.x = 1.0 - uv.x; uvi.y = uv.y; }
else if (type == 1) { theta = (RotDown ? M_PI : -M_PI) / 2.0 * progress; uvi = uv; }
else if (type == 2) { theta = (RotDown ? -M_PI : M_PI) / 2.0 * progress; uvi.x = uv.x; uvi.y = 1.0 - uv.y; }
else if (type == 3) { theta = (RotDown ? -M_PI : M_PI) / 2.0 * progress; uvi = 1.0 - uv; }
c1 = cos(theta); s1 = sin(theta);
vec2 uv2;
uv2.x = (uvi.x * iResolution.x * c1 - uvi.y * iResolution.y * s1);
uv2.y = (uvi.x * iResolution.x * s1 + uvi.y * iResolution.y * c1);
if ((uv2.x >= 0.0) && (uv2.x <= iResolution.x) && (uv2.y >= 0.0) && (uv2.y <= iResolution.y))
	{
	uv2 /= iResolution;
	if (type == 0) { uv2.x = 1.0 - uv2.x; }
	else if (type == 2) { uv2.y = 1.0 - uv2.y; }
	else if (type == 3) { uv2 = 1.0 - uv2; }
	return(getFromColor(uv2));
	}
return(getToColor(uv));
}
`,author:"Mark Craig",license:"MIT",description:"The outgoing image rolls away around a corner, revealing the incoming one",tags:["rotate","roll"],params:{type:{type:"int",default:0,min:0,max:3,step:1,description:"Corner to roll around"},RotDown:{type:"bool",default:!1,description:"Roll the outgoing image down instead of up"}},textures:[],createdAt:"Tue, 4 Apr 2023 03:31:55 -0400",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"RotateScaleFade",paramsTypes:{center:"vec2",rotations:"float",scale:"float",backColor:"vec4"},defaultParams:{center:[.5,.5],rotations:1,scale:8,backColor:[.15,.15,.15,1]},glsl:`// Author: Fernando Kuteken
// License: MIT
// Description: The outgoing image spins and zooms while fading to the incoming one, over a background color
// Tags: rotate, zoom, fade

#define PI 3.14159265359

// @param Center of the rotation
uniform vec2 center; // = vec2(0.5, 0.5)
// @param Number of turns
uniform float rotations; // = 1
// @param Maximum zoom
uniform float scale; // = 8
// @color Background color
uniform vec4 backColor; // = vec4(0.15, 0.15, 0.15, 1.0)

vec4 transition (vec2 uv) {
  
  vec2 difference = uv - center;
  vec2 dir = normalize(difference);
  float dist = length(difference);
  
  float angle = 2.0 * PI * rotations * progress;
  
  float c = cos(angle);
  float s = sin(angle);
  
  float currentScale = mix(scale, 1.0, 2.0 * abs(progress - 0.5));
  
  vec2 rotatedDir = vec2(dir.x  * c - dir.y * s, dir.x * s + dir.y * c);
  vec2 rotatedUv = center + rotatedDir * dist / currentScale;
  
  if (rotatedUv.x < 0.0 || rotatedUv.x > 1.0 ||
      rotatedUv.y < 0.0 || rotatedUv.y > 1.0)
    return backColor;
    
  return mix(getFromColor(rotatedUv), getToColor(rotatedUv), progress);
}
`,author:"Fernando Kuteken",license:"MIT",description:"The outgoing image spins and zooms while fading to the incoming one, over a background color",tags:["rotate","zoom","fade"],params:{center:{type:"vec2",default:[.5,.5],description:"Center of the rotation"},rotations:{type:"float",default:1,description:"Number of turns"},scale:{type:"float",default:8,description:"Maximum zoom"},backColor:{type:"vec4",default:[.15,.15,.15,1],color:!0,description:"Background color"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"RotateScaleVanish",paramsTypes:{FadeInSecond:"bool",ReverseEffect:"bool",ReverseRotation:"bool"},defaultParams:{FadeInSecond:!0,ReverseEffect:!1,ReverseRotation:!1},glsl:`// Author: Mark Craig
// mrmcsoftware on github and youtube ( http://www.youtube.com/MrMcSoftware )
// License: MIT
// Description: The outgoing image spins and shrinks away over the incoming one
// Tags: rotate, zoom, spin

// RotateScaleVanish Transition by Mark Craig (Copyright © 2022)

// @param Fade in the incoming image
uniform bool FadeInSecond; // = true
// @param Run the effect in reverse
uniform bool ReverseEffect; // = false
// @param Rotate the other way
uniform bool ReverseRotation; // = false

#define M_PI 3.14159265358979323846
#define _TWOPI 6.283185307179586476925286766559

vec4 transition(vec2 uv)
{
vec2 iResolution = vec2(ratio, 1.0);
float t = ReverseEffect ? 1.0 - progress : progress;
float theta = ReverseRotation ? _TWOPI * t : -_TWOPI * t;
float c1 = cos(theta);
float s1 = sin(theta);
float rad = max(0.00001, 1.0 - t);
float xc1 = (uv.x - 0.5) * iResolution.x;
float yc1 = (uv.y - 0.5) * iResolution.y;
float xc2 = (xc1 * c1 - yc1 * s1) / rad;
float yc2 = (xc1 * s1 + yc1 * c1) / rad;
vec2 uv2 = vec2(xc2 + iResolution.x / 2.0, yc2 + iResolution.y / 2.0);
vec4 col3;
vec4 ColorTo = ReverseEffect ? getFromColor(uv) : getToColor(uv);
if ((uv2.x >= 0.0) && (uv2.x <= iResolution.x) && (uv2.y >= 0.0) && (uv2.y <= iResolution.y))
	{
	uv2 /= iResolution;
	col3 = ReverseEffect ? getToColor(uv2) : getFromColor(uv2);
	}
else { col3 = FadeInSecond ? vec4(0.0) : ColorTo; } // transparent around the shrinking image
return((1.0 - t) * col3 + t * ColorTo); // could have used mix
}
`,author:"Mark Craig",license:"MIT",description:"The outgoing image spins and shrinks away over the incoming one",tags:["rotate","zoom","spin"],params:{FadeInSecond:{type:"bool",default:!0,description:"Fade in the incoming image"},ReverseEffect:{type:"bool",default:!1,description:"Run the effect in reverse"},ReverseRotation:{type:"bool",default:!1,description:"Rotate the other way"}},textures:[],createdAt:"Tue, 4 Apr 2023 03:31:48 -0400",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"SawtoothWipe",paramsTypes:{direction:"vec2",teeth:"int",depth:"float",jaws:"bool",smoothness:"float"},defaultParams:{direction:[1,0],teeth:8,depth:1,jaws:!1,smoothness:.004},glsl:`// Author: gre
// License: MIT
// Description: A wipe whose edge is a row of sharp, regular triangular teeth sweeps across the frame, or two toothed edges that start interlocked part from the middle like jaws opening
// Tags: wipe, shape, directional, zigzag

// @param Direction the toothed edge moves toward (with jaws, the axis along which the two edges part)
uniform vec2 direction; // = vec2(1.0, 0.0)
// @range(1, 40, 1) Number of teeth along the edge
uniform int teeth; // = 8
// @range(0, 3) Length of the teeth, relative to their width
uniform float depth; // = 1.0
// @param Two toothed edges part from the middle instead of one sweeping across
uniform bool jaws; // = false
// @range(0, 0.1) Softness of the edge
uniform float smoothness; // = 0.004

// half width of the antialiased edge, in frame heights
const float AA = 0.0015;

// signed distance to a zigzag line of period w and peak-to-peak height h, centered on y = 0,
// its tips pointing up at x = 0; positive above it
float zigzag(vec2 q, float w, float h) {
  // fold into half a tooth: the slope from the bottom of a notch to the tip of a tooth
  float x = abs(fract(q.x / w) - 0.5) * w;
  vec2 a = vec2(0.0, -0.5 * h);
  vec2 ab = vec2(0.5 * w, h);
  vec2 aq = vec2(x, q.y) - a;
  float d = length(aq - ab * clamp(dot(aq, ab) / dot(ab, ab), 0.0, 1.0));
  return q.y > h * (2.0 * x / w - 0.5) ? d : -d;
}

vec4 transition(vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  if (progress <= 0.0) return a;
  if (progress >= 1.0) return b;

  vec2 dir = length(direction) > 0.0 ? normalize(direction) : vec2(1.0, 0.0);
  // measured in square pixels, so the teeth are not stretched
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0);
  // half extents of the frame along the direction and across it
  float e = 0.5 * (abs(dir.x) * ratio + abs(dir.y));
  float w = 0.5 * (abs(dir.y) * ratio + abs(dir.x));
  float period = 2.0 * w / float(teeth < 1 ? 1 : teeth);
  // position across the edge, with the notches on the sides of the frame so that it shows
  // whole teeth, and along the direction
  vec2 q = vec2(dot(p, vec2(-dir.y, dir.x)) + w + 0.5 * period, dot(p, dir));
  float h = max(depth, 0.0) * period;
  // the soft edge never gets wide enough to blur small teeth away
  float s = max(min(smoothness, 0.25 * period), AA);
  float t = mix(progress, progress * progress * (3.0 - 2.0 * progress), 0.35);

  float d;
  if (jaws) {
    // the two edges are the same zigzag, interlocked at the start (crossed by the soft
    // edge, measured across the slopes of the teeth), then moving apart until each one
    // has left the frame on its side
    float overlap = s * sqrt(1.0 + 4.0 * h * h / (period * period));
    float o = mix(-overlap, e + 0.5 * h + s, t);
    d = max(zigzag(q - vec2(0.0, o), period, h), -zigzag(q + vec2(0.0, o), period, h));
  } else {
    // the edge starts fully ahead of the frame and ends fully past it
    float c = mix(-e - 0.5 * h - s, e + 0.5 * h + s, t);
    d = zigzag(q - vec2(0.0, c), period, h);
  }
  // > 0 where the incoming image shows
  float m = 1.0 - smoothstep(-s, s, d);

  // mixed premultiplied, so transparent images do not bleed their color
  vec4 c = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"A wipe whose edge is a row of sharp, regular triangular teeth sweeps across the frame, or two toothed edges that start interlocked part from the middle like jaws opening",tags:["wipe","shape","directional","zigzag"],params:{direction:{type:"vec2",default:[1,0],description:"Direction the toothed edge moves toward (with jaws, the axis along which the two edges part)"},teeth:{type:"int",default:8,min:1,max:40,step:1,description:"Number of teeth along the edge"},depth:{type:"float",default:1,min:0,max:3,description:"Length of the teeth, relative to their width"},jaws:{type:"bool",default:!1,description:"Two toothed edges part from the middle instead of one sweeping across"},smoothness:{type:"float",default:.004,min:0,max:.1,description:"Softness of the edge"}},textures:[],createdAt:"Wed, 4 Nov 2026 16:31:59 +0100",updatedAt:"Wed, 4 Nov 2026 16:31:59 +0100"},{name:"Shatter",paramsTypes:{center:"vec2",shards:"float",gravity:"float",seed:"float"},defaultParams:{center:[.5,.5],shards:6,gravity:1,seed:0},glsl:`// Author: lbl
// License: MIT
// Description: The outgoing image cracks like a pane of glass from an impact point, then its shards break loose from the impact outward, tumbling in 3D and falling away with gravity to reveal the incoming image behind
// Tags: shatter, fragments, glass, 3d

// @param Impact point where the cracks start, from (0, 0) at the bottom left to (1, 1) at the top right
uniform vec2 center; // = vec2(0.5, 0.5)
// @range(3, 8) Approximate number of rows of shards across the height of the frame
uniform float shards; // = 6.0
// @range(0.5, 3) Strength of the gravity: the shards fall faster, and break loose over a longer time
uniform float gravity; // = 1.0
// @param Random seed: another value gives other shards, tumbling another way
uniform float seed; // = 0.0

// distance from the camera to the pane, as a part of the frame's height
const float EYE = 2.5;
// how far the corners of the shards are moved from a regular grid, as a part of a cell
const float JITTER = 0.32;
// width of the anti-aliased edges, the crack lines and the bevels, as a part of the frame's height
const float EDGE = 0.0012;
const float CRACK_WIDTH = 0.0025;
const float BEVEL = 0.006;

vec3 hash32(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yzz) * p3.zyx);
}

float cellSize() {
  return 1.0 / clamp(shards, 3.0, 8.0);
}

vec2 seedOffset() {
  return vec2(37.0, 17.0) * floor(seed);
}

// a corner of the cracks: the point p of a grid, moved at random
vec2 corner(vec2 p) {
  return (p + JITTER * (2.0 * hash32(p + seedOffset()).xy - 1.0)) * cellSize();
}

// signed distance from q to the line a -> b, positive on its left
float side(vec2 q, vec2 a, vec2 b) {
  vec2 d = b - a;
  return (d.x * (q.y - a.y) - d.y * (q.x - a.x)) / length(d);
}

// the cell c is cut into two triangular shards along one of its diagonals, picked at random
bool diagonalUp(vec2 c) {
  return hash32(c + seedOffset() + 0.5).z > 0.5;
}

// distance from q to the edges of the triangle p0 p1 p2 (counterclockwise), positive inside
float triangleDist(vec2 q, vec2 p0, vec2 p1, vec2 p2) {
  return min(min(side(q, p0, p1), side(q, p1, p2)), side(q, p2, p0));
}

// the shard that contains q on the unbroken pane: (its cell, its triangle, the distance from q to its nearest crack)
vec4 locate(vec2 q) {
  vec2 c = floor(q / cellSize());
  // the cells' sides are not straight: step to the neighbor cell when q is beyond one of them
  vec2 a, b, cc, d;
  for (int i = 0; i < 2; i++) {
    a = corner(c);
    b = corner(c + vec2(1.0, 0.0));
    cc = corner(c + 1.0);
    d = corner(c + vec2(0.0, 1.0));
    c.x += side(q, d, a) < 0.0 ? -1.0 : (side(q, b, cc) < 0.0 ? 1.0 : 0.0);
    a = corner(c);
    b = corner(c + vec2(1.0, 0.0));
    cc = corner(c + 1.0);
    d = corner(c + vec2(0.0, 1.0));
    c.y += side(q, a, b) < 0.0 ? -1.0 : (side(q, cc, d) < 0.0 ? 1.0 : 0.0);
  }
  a = corner(c);
  b = corner(c + vec2(1.0, 0.0));
  cc = corner(c + 1.0);
  d = corner(c + vec2(0.0, 1.0));
  bool up = diagonalUp(c);
  float d0 = up ? triangleDist(q, a, b, cc) : triangleDist(q, a, b, d);
  float d1 = up ? triangleDist(q, a, cc, d) : triangleDist(q, b, cc, d);
  return vec4(c, d1 > d0 ? 1.0 : 0.0, abs(max(d0, d1)));
}

// Rodrigues' rotation of v around the unit axis k
vec3 rotate(vec3 v, vec3 k, float angle) {
  float c = cos(angle), s = sin(angle);
  return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c);
}

vec2 impact() {
  return clamp(center, 0.0, 1.0) * vec2(ratio, 1.0);
}

// distance from the impact to the farthest corner of the frame
float reach() {
  vec2 c = impact();
  return length(max(c, vec2(ratio, 1.0) - c));
}

// how far below its center a shard must fall to leave the frame
float fallMargin() {
  return 0.1 + 1.5 * cellSize();
}

// the time a shard breaks loose: the nearer the impact the sooner, and late enough to fall out of the frame by the end
// (dn: its distance to the impact, as a part of the reach)
float releaseTime(vec2 mid, float dn, float h, float g, float margin) {
  float latest = max(0.98 - sqrt(2.0 * (mid.y + margin) / g), 0.04);
  return 0.04 + (latest - 0.04) * (0.8 * pow(dn, 0.8) + 0.2 * h);
}

// a flash at the impact, at the start
float flash(vec2 q) {
  float f = sin(3.141592653589793 * clamp(progress / 0.12, 0.0, 1.0));
  vec2 d = q - impact();
  return 0.6 * f * exp(-dot(d, d) / (0.004 + 0.02 * progress));
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);
  float s = cellSize();
  vec2 a = vec2(uv.x * ratio, uv.y);
  vec3 eye = vec3(0.5 * ratio, 0.5, -EYE);
  vec3 ray = vec3(a, 0.0) - eye;
  vec3 light = normalize(vec3(-0.35, 0.55, -1.0));
  vec3 halfway = normalize(light - normalize(ray));
  float g = 12.0 * clamp(gravity, 0.5, 3.0);
  vec2 imp = impact();
  float rch = reach();
  float margin = fallMargin();
  // the cracks run from the impact to the farthest corner, before the last shards break loose
  float crackTime = clamp(0.6 * (0.94 - sqrt(2.0 * (1.0 + margin) / g)), 0.05, 0.22);

  // the part of the pane still in place, behind the loose shards
  vec4 pane = vec4(0.0);
  float paneDepth = 1e9;
  vec4 here = locate(a);
  vec2 hc = here.xy;
  vec2 ha = corner(hc), hb = corner(hc + vec2(1.0, 0.0)), hcc = corner(hc + 1.0), hd = corner(hc + vec2(0.0, 1.0));
  bool hup = diagonalUp(hc);
  vec2 hcenter = here.z < 0.5 ? (hup ? ha + hb + hcc : ha + hb + hd) : (hup ? ha + hcc + hd : hb + hcc + hd);
  vec3 hh = hash32(hc + vec2(0.31, 0.57) * (here.z + 1.0) + seedOffset());
  hcenter /= 3.0;
  if (progress < releaseTime(hcenter, clamp(length(hcenter - imp) / rch, 0.0, 1.0), hh.x, g, margin)) {
    vec4 col = getFromColor(uv);
    float crack = clamp((progress - crackTime * length(a - imp) / rch) / 0.03, 0.0, 1.0);
    // cracked shards settle at slightly different angles (no change while flat: dot(n, light) = -light.z)
    vec3 n = rotate(vec3(0.0, 0.0, -1.0), normalize(vec3(hh.yz - 0.5, 0.0) + 1e-4), 0.06 * crack * (hh.x - 0.5));
    col.rgb *= 1.0 + 1.2 * (dot(n, light) + light.z);
    col.rgb += crack * 0.35 * pow(max(dot(n, halfway), 0.0), 400.0) * col.a;
    float line = crack * (1.0 - smoothstep(0.0, CRACK_WIDTH, here.w));
    col.rgb = mix(col.rgb, vec3(0.95, 0.98, 1.0) * col.a, 0.85 * line);
    pane = col;
    paneDepth = 1.0;
  }

  // the two nearest loose shards: depth along the ray, color, coverage
  float t1 = 1e9, t2 = 1e9;
  vec4 c1 = vec4(0.0), c2 = vec4(0.0);
  float a1 = 0.0, a2 = 0.0;
  float shadow = 0.0;

  // the shards that broke loose, searched in the cells around and above the pixel since they fall,
  // looking a bit toward the impact and the middle since they drift away and grow toward the camera
  vec2 look = a - 0.06 * progress * (a - imp) / rch - (a - eye.xy) * 0.06 * progress;
  vec2 g0 = floor(look / s) - 1.0;
  float rows = ceil(1.0 / s);
  for (int ri = 0; ri < 11; ri++) {
    float j = g0.y + float(ri);
    if (j > rows) break;
    if (j < -1.0) continue;
    for (int ci = 0; ci < 3; ci++) {
      vec2 c = vec2(g0.x + float(ci), j);
      vec2 ca = corner(c), cb = corner(c + vec2(1.0, 0.0)), ccc = corner(c + 1.0), cd = corner(c + vec2(0.0, 1.0));
      bool up = diagonalUp(c);
      for (int k = 0; k < 2; k++) {
        // the corners of the triangle k of the cell, counterclockwise
        vec2 p0 = (k == 1 && !up) ? cb : ca;
        vec2 p1 = k == 0 ? cb : ccc;
        vec2 p2 = (k == 0 && up) ? ccc : cd;
        vec2 mid = (p0 + p1 + p2) / 3.0;
        vec3 h1 = hash32(c + vec2(0.31, 0.57) * float(k + 1) + seedOffset());
        vec2 away = mid - imp;
        float dist = length(away);
        float dn = clamp(dist / rch, 0.0, 1.0);
        float e = progress - releaseTime(mid, dn, h1.x, g, margin);
        if (e <= 0.0) continue;
        vec3 h2 = hash32(c + vec2(0.73, 0.19) * float(k + 1) + seedOffset());
        // pushed away from the impact and toward the camera, spinning around a random axis, falling
        float near = 1.0 - dn;
        vec3 vel = vec3(away / max(dist, 1e-3) * (0.03 + 0.08 * h1.y) * (0.4 + near), -(0.05 + 0.2 * near * h1.z));
        vec3 pos = vec3(mid, 0.0) + vel * e - vec3(0.0, 0.5 * g * e * e, 0.0);
        // already out of the frame
        if (pos.y + 1.5 * s < -0.05) continue;
        vec3 axis = normalize(vec3(h2.x - 0.5, h2.y - 0.5, 0.3 * (h2.z - 0.5)) + 1e-4);
        float angle = (3.0 + 5.0 * h2.z) * (h2.x < 0.5 ? -1.0 : 1.0) * e;
        vec3 n = rotate(vec3(0.0, 0.0, -1.0), axis, angle);
        float rel = smoothstep(0.0, 0.04, e);

        // the camera ray, hidden behind the pane still in place
        float den = dot(ray, n);
        float t = dot(pos - eye, n) / (abs(den) > 1e-4 ? den : 1e-4);
        vec2 q = mid + rotate(eye + t * ray - pos, axis, -angle).xy;
        float border = min(min(q.x, ratio - q.x), min(q.y, 1.0 - q.y));
        float inside = triangleDist(q, p0, p1, p2);
        float ed = min(inside, border);
        if (t > 0.0 && t < t2 && t < paneDepth && ed > 0.0) {
          vec3 nf = den > 0.0 ? -n : n;
          vec4 col = getFromColor(vec2(q.x / ratio, q.y));
          col.rgb *= mix(1.0, clamp(dot(nf, light) / -light.z, 0.45, 1.1), rel);
          float glint = max(dot(nf, halfway), 0.0);
          col.rgb += rel * 0.3 * pow(glint, 60.0) * col.a;
          // the crack line it carried turns into a bright bevel
          float line = 0.85 * (1.0 - smoothstep(0.0, CRACK_WIDTH, inside)) * (1.0 - rel);
          float bevel = 0.8 * rel * (1.0 - smoothstep(0.0, BEVEL, ed)) * (0.3 + 0.7 * pow(glint, 6.0));
          col.rgb = mix(col.rgb, vec3(0.92, 0.97, 0.97) * col.a, max(line, bevel));
          float cover = mix(1.0, smoothstep(0.0, 2.0 * EDGE, ed), rel);
          if (t < t1) {
            t2 = t1; c2 = c1; a2 = a1;
            t1 = t; c1 = col; a1 = cover;
          } else {
            t2 = t; c2 = col; a2 = cover;
          }
        }

        // the shadow on the pane and on the incoming image behind
        float lden = dot(light, n);
        float ts = dot(pos - vec3(a, 0.0), n) / (abs(lden) > 1e-4 ? lden : 1e-4);
        vec2 qs = mid + rotate(vec3(a, 0.0) + ts * light - pos, axis, -angle).xy;
        float eds = min(triangleDist(qs, p0, p1, p2), min(min(qs.x, ratio - qs.x), min(qs.y, 1.0 - qs.y)));
        if (ts > 0.0 && eds > 0.0) {
          shadow = max(shadow, rel * smoothstep(0.0, 0.004 + 0.08 * ts, eds) * 0.45 * (1.0 - smoothstep(0.1, 0.9, ts)));
        }
      }
    }
  }

  // the incoming image behind, then the pane still in place, then the loose shards in front
  vec4 back = getToColor(uv);
  back.rgb *= 1.0 - shadow;
  pane.rgb *= 1.0 - shadow;
  if (paneDepth == 1.0) back = pane;
  vec4 color = c1 * a1 + c2 * min(a2, 1.0 - a1) + back * max(1.0 - a1 - a2, 0.0);
  color.rgb += flash(a) * color.a;
  return color;
}
`,author:"lbl",license:"MIT",description:"The outgoing image cracks like a pane of glass from an impact point, then its shards break loose from the impact outward, tumbling in 3D and falling away with gravity to reveal the incoming image behind",tags:["shatter","fragments","glass","3d"],params:{center:{type:"vec2",default:[.5,.5],description:"Impact point where the cracks start, from (0, 0) at the bottom left to (1, 1) at the top right"},shards:{type:"float",default:6,min:3,max:8,description:"Approximate number of rows of shards across the height of the frame"},gravity:{type:"float",default:1,min:.5,max:3,description:"Strength of the gravity: the shards fall faster, and break loose over a longer time"},seed:{type:"float",default:0,description:"Random seed: another value gives other shards, tumbling another way"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sat, 7 Nov 2026 23:12:12 +0100"},{name:"Shockwave",paramsTypes:{tileSize:"float",scatter:"float",diagonal:"float",prism:"float",glow:"float"},defaultParams:{tileSize:.035,scatter:.85,diagonal:.9,prism:.65,glow:.75},glsl:` // Author: Gilad Levi, github @Giladx
 // License: MIT
 // Description: A diagonal shockwave breaks the outgoing image into tiny falling glass tiles. Each tile slips away with a brief chromatic split and neon edge glow, revealing the incoming image beneath it.
 // Tags: diagonal, mosaic, pixel, cascade, glass, prism, chromatic, neon, cinematic

 // @range(0.012, 0.10) Size of each square tile relative to slide height
 uniform float tileSize; // = 0.035
 // @range(0.0, 1.5) How far the tiles slide and fall
 uniform float scatter; // = 0.85
 // @range(0.0, 1.0) 0 is a horizontal sweep; 1 is a strongly diagonal sweep
 uniform float diagonal; // = 0.9
 // @range(0.0, 1.0) Amount of red/blue optical separation at the moving edges
 uniform float prism; // = 0.65
 // @range(0.0, 1.0) Brightness of the colored edges around moving tiles
 uniform float glow; // = 0.75

 // A deterministic pseudo-random value per cell, stable between frames.
 float toseeHash(vec2 p) {
   return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
 }

 vec4 transition(vec2 uv) {
   // Preserve perfect, undistorted source and destination frames.
   if (progress <= 0.0) return getFromColor(uv);
   if (progress >= 1.0) return getToColor(uv);

   // Build an aspect-correct grid: square cells on wide and tall sliders.
   float size = max(tileSize, 0.008);
   vec2 grid = max(vec2(1.0), floor(vec2(ratio, 1.0) / size));
   vec2 cell = floor(uv * grid);
   vec2 cellUV = fract(uv * grid);
   vec2 centerUV = (cell + 0.5) / grid;

   // Schedule each tile in a diagonal wave with random stagger.
   float sweep = mix(
     centerUV.x,
     0.64 * centerUV.x + 0.36 * (1.0 - centerUV.y),
     clamp(diagonal, 0.0, 1.0)
   );

   float noise = toseeHash(cell);
   float start = 0.62 * sweep + 0.07 * noise;
   float t = clamp((progress - start) / 0.29, 0.0, 1.0);
   float movement = t * clamp(scatter, 0.0, 1.5);

   // Move each outgoing image tile sideways and downward.
   float wobble = toseeHash(cell + vec2(19.3, 7.7)) * 2.0 - 1.0;
   vec2 drift = vec2(0.65 * wobble, -0.95) * movement;
   vec2 movingCellUV = cellUV - drift;

   // Clip moving tiles to their cells, revealing the next image.
   float inside =
     step(0.012, movingCellUV.x) *
     step(movingCellUV.x, 0.988) *
     step(0.012, movingCellUV.y) *
     step(movingCellUV.y, 0.988);

   float tileShape = mix(1.0, inside, smoothstep(0.0, 0.13, t));
   float oldVisibility = 1.0 - smoothstep(0.48, 0.87, t);
   float oldMask = tileShape * oldVisibility;

   // Sample the old image using the tile's displaced position.
   vec2 oldUV = clamp(uv - drift / grid, 0.0, 1.0);
   vec4 oldColor = getFromColor(oldUV);

   // Add chromatic separation while each tile is moving.
   float flare = sin(3.14159265 * t);
   vec2 shift = vec2(0.006, -0.002) * prism * flare;
   vec4 offsetColor = getFromColor(
     clamp(oldUV + shift, 0.0, 1.0)
   );
   oldColor.r = offsetColor.r;

   // Reveal the incoming image below the falling tiles.
   vec4 result = mix(getToColor(uv), oldColor, oldMask);

   // Draw a temporary cyan or pink glowing rim around moving tiles.
   float edgeDistance = min(
     min(movingCellUV.x, 1.0 - movingCellUV.x),
     min(movingCellUV.y, 1.0 - movingCellUV.y)
   );

   float edge =
     (1.0 - smoothstep(0.0, 0.10, edgeDistance)) * inside;

   vec3 cyan = vec3(0.12, 0.95, 1.0);
   vec3 pink = vec3(1.0, 0.20, 0.65);

   vec3 rimColor = mix(
     cyan,
     pink,
     toseeHash(cell + vec2(5.4, 28.6))
   );

   result.rgb = clamp(
     result.rgb + rimColor * edge * flare * glow * oldMask * 0.60,
     0.0,
     1.0
   );

   return result;
 }
`,author:"Gilad Levi, github @Giladx",license:"MIT",description:"A diagonal shockwave breaks the outgoing image into tiny falling glass tiles. Each tile slips away with a brief chromatic split and neon edge glow, revealing the incoming image beneath it.",tags:["diagonal","mosaic","pixel","cascade","glass","prism","chromatic","neon","cinematic"],params:{tileSize:{type:"float",default:.035,min:.012,max:.1,description:"Size of each square tile relative to slide height"},scatter:{type:"float",default:.85,min:0,max:1.5,description:"How far the tiles slide and fall"},diagonal:{type:"float",default:.9,min:0,max:1,description:"0 is a horizontal sweep; 1 is a strongly diagonal sweep"},prism:{type:"float",default:.65,min:0,max:1,description:"Amount of red/blue optical separation at the moving edges"},glow:{type:"float",default:.75,min:0,max:1,description:"Brightness of the colored edges around moving tiles"}},textures:[],createdAt:"Fri, 13 Nov 2026 21:03:40 +0200",updatedAt:"Fri, 13 Nov 2026 21:03:40 +0200"},{name:"ShoreWash",paramsTypes:{direction:"vec2",foam:"float",refraction:"float",water:"vec4"},defaultParams:{direction:[0,1],foam:.7,refraction:.02,water:[.1,.6,.62,.4]},glsl:`// Author: gre
// License: MIT
// Description: A thin sheet of water runs up over the outgoing image like the last of a wave on a beach, its lobed front edged with bubbly foam; it slows, stops just past the far edge and drains back, leaving the incoming image wet and glossy as it dries
// Tags: water, foam, beach, liquid, directional, reveal

// @param Direction the water runs up toward
uniform vec2 direction; // = vec2(0.0, 1.0)
// @range(0, 1) Amount of foam on the front and left behind
uniform float foam; // = 0.7
// @range(0, 0.05) How much the sheet of water bends the image under it
uniform float refraction; // = 0.02
// @color Color of the water (its alpha is its strength)
uniform vec4 water; // = vec4(0.1, 0.6, 0.62, 0.4)

// half width of the antialiased edges, in frame heights
const float AA = 0.002;
// how far the lobes of the front lead or trail, in frame heights
const float LOBE = 0.06;
// width of the band of foam lace behind the front, in frame heights
const float LACE = 0.3;
// size of the foam bubbles, in frame heights
const float CELL = 0.045;
// part of the transition the water runs up during; it drains back during the rest
const float RUNUP = 0.4;
// width of the dense band of foam right behind the front, in frame heights
const float FOAMW = 0.1;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
    mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// foam: bubbles packed side by side, white where they touch and open at their centers.
// Sparse foam is a faint lace; the denser it is, the brighter it is and the smaller the
// holes, until they close (density 1)
float bubbles(vec2 p, float density) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d1 = 8.0;
  float d2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 o = vec2(float(x), float(y));
      vec2 c = o + 0.15 + 0.7 * hash22(i + o) - f;
      float d = dot(c, c);
      if (d < d1) {
        d2 = d1;
        d1 = d;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  float e = sqrt(d2) - sqrt(d1);
  float w = 0.12 + 0.6 * density;
  return (1.0 - smoothstep(w - 0.12, w + 0.12, e)) * smoothstep(0.0, 0.35, density);
}

vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

vec4 transition(vec2 uv) {
  vec2 dir = length(direction) > 0.0 ? normalize(direction) : vec2(0.0, 1.0);
  vec2 q = (uv - 0.5) * vec2(ratio, 1.0);
  // distance along the run-up, 0 at the middle of the frame, and across it
  float a = dot(q, dir);
  float b = dot(q, vec2(-dir.y, dir.x));
  // half the extent of the frame along the run-up
  float extent = 0.5 * (abs(dir.x) * ratio + abs(dir.y));
  float start = -extent - LOBE - 0.1;
  float stop = extent + LOBE + 0.01;

  // the front races in, slows down and stops (run-up), then drains back faster and faster
  float up = clamp(progress / RUNUP, 0.0, 1.0);
  float back = clamp((progress - RUNUP) / (1.0 - RUNUP), 0.0, 1.0);
  float front = mix(start, stop, 1.0 - pow(1.0 - up, 1.6)) - (stop - start) * pow(back, 1.5);

  // lobed front: tongues of water run ahead in some places, and drift sideways a little
  float lobes = vnoise(vec2(b * 7.0 + 3.1, progress * 2.0)) * 0.7 + vnoise(vec2(b * 17.0, 5.0 + progress * 3.0)) * 0.3;
  float behind = front + LOBE * (lobes - 0.5) * 2.0 - a; // > 0 under the water
  float sheet = smoothstep(-AA, AA, behind);

  // the image swaps under the dense foam right behind the running front, and finishes
  // swapping under the water as it stops by the far edge
  float swapped = max(smoothstep(0.01, 0.8 * FOAMW, behind), (progress < RUNUP ? sheet : 1.0) * smoothstep(RUNUP - 0.08, RUNUP, progress));

  // the sheet of water ripples (stretched across the flow) and bends what is under it
  vec2 rp = vec2(a * 20.0, b * 5.0 + 3.0 * vnoise(q * 4.0)) - vec2(7.0 * min(progress, RUNUP) - 5.0 * back, 0.0);
  float n0 = vnoise(rp);
  vec2 g = (vnoise(rp + vec2(0.15, 0.0)) - n0) / 0.15 * dir + (vnoise(rp + vec2(0.0, 0.15)) - n0) / 0.15 * vec2(-dir.y, dir.x);
  // the water is thin at its edge and deeper behind it
  float thick = sheet * smoothstep(0.0, 0.12, behind);
  vec2 off = g * refraction * thick * vec2(1.0 / ratio, 1.0);

  vec4 c = mix(getFromColor(mirror(uv + off)), getToColor(mirror(uv + off)), swapped);
  c.rgb = mix(c.rgb, water.rgb, water.a * sheet * (0.3 + 0.7 * smoothstep(0.0, 0.35, behind)));
  // soft glints on the ripples
  float glint = pow(max(dot(normalize(vec3(-g, 3.0)), normalize(vec3(-0.3, 0.6, 1.0))), 0.0), 14.0);
  c.rgb += glint * 0.4 * thick;

  // wet: what the water has drained off is darker and glossier, and dries out
  float wet = (1.0 - sheet) * exp(min(behind, 0.0) * 2.5) * smoothstep(RUNUP, RUNUP + 0.05, progress) * (1.0 - smoothstep(0.7, 1.0, progress));
  c.rgb *= mix(vec3(1.0), c.rgb, 0.55 * wet);
  c.rgb += 0.1 * wet * smoothstep(0.4, 0.9, vnoise(vec2(a * 30.0, b * 6.0)));

  // foam: thick and bubbly right behind the running front, a lace trailing behind it,
  // and a thin line on the draining front; none is left on the image the water has drained off
  // the foam drifts with the water as it runs up, then stays where it is
  vec2 lp = vec2(a - 0.4 * (progress < RUNUP ? front : stop), b) / CELL;
  // the lace gathers in streaks along the front, broken into patches
  float patches = smoothstep(0.45, 0.8, 0.6 * vnoise(lp * vec2(0.4, 0.1) + 4.0) + 0.4 * vnoise(lp * 0.3 + 9.0));
  float bandW = FOAMW * (0.5 + vnoise(vec2(b * 25.0, 2.0)));
  float density = (1.0 - smoothstep(0.0, bandW, behind)) * (1.0 - smoothstep(RUNUP - 0.05, RUNUP + 0.12, progress));
  density = max(density, 0.55 * patches * (1.0 - smoothstep(0.0, LACE, behind)) * (1.0 - 0.5 * back));
  density = max(density, 0.9 * (1.0 - smoothstep(0.0, 0.012 + 0.02 * vnoise(vec2(b * 40.0, 1.0)), behind)));
  density *= sheet;
  // bubbles of two sizes, over a milky haze where the foam is dense
  float f = 0.0;
  if (density > 0.0) {
    f = max(bubbles(lp, density), 0.85 * bubbles(lp * 1.7 + 7.0, density * 0.9));
    f = max(f, 0.45 * smoothstep(0.15, 0.7, density)) * foam;
  }
  // the foam shades the water around it a little
  c.rgb *= 1.0 - 0.25 * sheet * foam * (1.0 - f) * smoothstep(0.0, 0.6, density);
  c.rgb = mix(c.rgb, vec3(0.97, 0.98, 0.97), clamp(f, 0.0, 1.0));
  // a thin shadow just ahead of the running front
  float sh = smoothstep(-0.03, 0.0, behind);
  c.rgb *= 1.0 - 0.35 * (1.0 - sheet) * sh * sh * (1.0 - smoothstep(RUNUP - 0.05, RUNUP, progress));
  return c;
}
`,author:"gre",license:"MIT",description:"A thin sheet of water runs up over the outgoing image like the last of a wave on a beach, its lobed front edged with bubbly foam; it slows, stops just past the far edge and drains back, leaving the incoming image wet and glossy as it dries",tags:["water","foam","beach","liquid","directional","reveal"],params:{direction:{type:"vec2",default:[0,1],description:"Direction the water runs up toward"},foam:{type:"float",default:.7,min:0,max:1,description:"Amount of foam on the front and left behind"},refraction:{type:"float",default:.02,min:0,max:.05,description:"How much the sheet of water bends the image under it"},water:{type:"vec4",default:[.1,.6,.62,.4],color:!0,description:"Color of the water (its alpha is its strength)"}},textures:[],createdAt:"Fri, 13 Nov 2026 12:57:43 +0100",updatedAt:"Fri, 13 Nov 2026 12:57:43 +0100"},{name:"Shred",paramsTypes:{strips:"int",stagger:"float",tilt:"float",shadow:"float"},defaultParams:{strips:20,stagger:.4,tilt:.1,shadow:.5},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image is cut into paper strips that drop away at uneven speeds, tilting as they fall, revealing the incoming image
// Tags: slices, stripes, vertical, shadow

// @range(4, 60, 1) Number of strips
uniform int strips; // = 20
// @range(0, 0.8) Spread of the strips' start times, as a part of the transition
uniform float stagger; // = 0.4
// @range(0, 0.3) Largest tilt of a falling strip, in radians
uniform float tilt; // = 0.1
// @range(0, 1) Darkness of the strips' cut edges and of their shadow
uniform float shadow; // = 0.5

// a deterministic random value in [0, 1) for each strip
float hash (float n) {
  n = fract(n * 0.1031);
  n *= n + 33.33;
  n *= n + n;
  return fract(n);
}

vec4 transition (vec2 uv) {
  float n = float(strips);
  float w = ratio / n; // strip width, in frame heights
  vec2 q = vec2(uv.x * ratio, uv.y);
  vec4 color = getToColor(uv);
  float cover = -1.0;
  float shade = 0.0;
  // narrow strips tilt less, so that they only reach over their neighbours
  float maxTilt = min(tilt, 2.0 * w);
  for (int d = -3; d <= 3; d++) {
    float i = floor(uv.x * n) + float(d);
    if (i < 0.0 || i > n - 1.0) continue;
    // about one strip in five starts right away
    float delay = stagger * max(0.0, 1.25 * hash(i + 1.0) - 0.25);
    float speed = 1.0 + 0.5 * hash(i + 71.0);
    float t = clamp((progress - delay) / (1.0 - delay), 0.0, 1.0);
    // a pull then a fall that speeds up, long enough to leave the frame
    float fall = (0.4 * t + 0.6 * t * t) * (1.0 + w * (0.5 + tilt)) * speed;
    float angle = maxTilt * (2.0 * hash(i + 37.0) - 1.0) * t;
    // the strips are cut apart as they start moving
    float lift = min(1.0, 8.0 * t);
    float gap = 0.06 * w * lift;
    // position in the strip's own frame, relative to its center
    vec2 v = q - vec2((i + 0.5) * w, 0.5 - fall);
    float ca = cos(angle), sa = sin(angle);
    vec2 l = vec2(ca * v.x + sa * v.y, ca * v.y - sa * v.x);
    vec2 edge = vec2(0.5 * w - gap, 0.5) - abs(l);
    // a soft shadow, cast down and right by the moving strip
    vec2 so = abs(l - lift * vec2(0.15 * w, -0.25 * w)) - vec2(0.5 * w - gap, 0.5);
    shade = max(shade, lift * (1.0 - smoothstep(0.0, 0.5 * w, max(so.x, so.y))));
    if (min(edge.x, edge.y) >= 0.0 && fall > cover) {
      vec2 p = vec2((i + 0.5) * w + l.x, 0.5 + l.y);
      vec4 img = getFromColor(vec2(p.x / ratio, p.y));
      // darker cut edges
      float cut = lift * (1.0 - smoothstep(0.0, 0.25 * w, edge.x));
      color = vec4(img.rgb * (1.0 - 0.5 * shadow * cut), img.a);
      cover = fall;
    }
  }
  if (cover < 0.0) {
    color = vec4(color.rgb * (1.0 - 0.6 * shadow * shade), color.a);
  }
  return color;
}
`,author:"gre",license:"MIT",description:"The outgoing image is cut into paper strips that drop away at uneven speeds, tilting as they fall, revealing the incoming image",tags:["slices","stripes","vertical","shadow"],params:{strips:{type:"int",default:20,min:4,max:60,step:1,description:"Number of strips"},stagger:{type:"float",default:.4,min:0,max:.8,description:"Spread of the strips' start times, as a part of the transition"},tilt:{type:"float",default:.1,min:0,max:.3,description:"Largest tilt of a falling strip, in radians"},shadow:{type:"float",default:.5,min:0,max:1,description:"Darkness of the strips' cut edges and of their shadow"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:17:22 +0100",updatedAt:"Sat, 31 Oct 2026 18:17:22 +0100"},{name:"ShutterWipe",paramsTypes:{blades:"int",tilt:"float",gate:"float",color:"vec4"},defaultParams:{blades:5,tilt:.06,gate:.035,color:[.09,.09,.1,1]},glsl:`// Author: gre
// License: MIT
// Description: A camera's focal-plane shutter fires across the frame, seen through the camera's gate: thin metal blades fan down from a tight stack above it until they overlap over the whole frame, then keep running down and stack below it, uncovering the incoming image from the top
// Tags: camera, shutter, wipe, metal

// @range(3, 10, 1) Number of metal blades
uniform int blades; // = 5
// @range(0, 0.2) How much the blades tilt on their arms while they travel
uniform float tilt; // = 0.06
// @range(0, 0.08) Width of the camera's gate framing the image while the shutter fires, in frame heights
uniform float gate; // = 0.035
// @color Color of the metal blades
uniform vec4 color; // = vec4(0.09, 0.09, 0.1, 1.0)

// spacing of the blades in their stacks, and how far the stacks rest outside the frame, in frame heights
const float STACK = 0.016;
const float REST = 0.05;

vec4 transition(vec2 uv) {
  float n = clamp(float(blades), 3.0, 10.0);
  // tall enough to still overlap, past their blurred edges, when they are spread the most
  float h = 1.7 / n + 0.02;
  float pile = (n - 1.0) * STACK;
  // the bottoms of the blades run from a stack above the frame to a stack below it: the
  // lowest blade leads, the highest one trails
  float travel = 1.0 + 2.0 * REST + h + pile;
  vec2 t = clamp((progress - vec2(0.0, 0.3)) / 0.7, 0.0, 1.0);
  vec2 pos = 1.0 + REST + vec2(0.0, pile) - travel * t * t * (3.0 - 2.0 * t);
  vec2 vel = travel * 6.0 * t * (1.0 - t) / 0.7;

  float x = (uv.x - 0.5) * ratio;
  // the images are swapped halfway, behind the closed shutter
  vec4 col = progress < 0.5 ? getFromColor(uv) : getToColor(uv);
  // painted from the lowest blade to the highest, each one over the top of the one below it
  for (int i = 0; i < 10; i++) {
    float k = float(i) / (n - 1.0);
    if (k < 1.0001) {
      float v = mix(vel.x, vel.y, k);
      // the blades ride on arms, so the fast ones tilt a little, and their travel blurs their edges
      float d = uv.y - mix(pos.x, pos.y, k) + tilt * 0.1 * v * x;
      // contact shadow cast on what lies just below the leading edge
      float aa = 0.002 + 0.005 * v;
      float sh = (1.0 - smoothstep(0.0, 0.03 + 0.012 * v, -d)) * (1.0 - smoothstep(-aa, aa, d));
      col.rgb *= 1.0 - 0.65 * color.a * sh * sh;
      // matte metal, slightly curved: lighter toward the leading edge, which ends in a bright
      // rolled lip, darker toward the top where it slides under the next blade, with a sheen
      // that crosses each blade as it passes the light
      float l = clamp(d / h, 0.0, 1.0);
      float lip = smoothstep(0.003, 0.007, d) * (1.0 - smoothstep(0.007, 0.014, d));
      float s = (uv.y - d - 0.55 + 0.3 * x) * 2.5;
      float sheen = 0.3 * exp(-s * s) * (1.0 - l) * (1.0 - l);
      vec3 metal = color.rgb * (1.3 - 0.75 * l) + (0.25 * lip + sheen) * (0.6 + 0.4 * color.rgb) * color.a;
      metal *= 0.4 + 0.6 * smoothstep(0.0, 0.005, d);
      float cover = smoothstep(-aa, aa, d) * (1.0 - smoothstep(h - aa, h + aa, d));
      col = mix(col, vec4(clamp(metal, 0.0, 1.0), color.a), cover);
    }
  }
  // the camera's gate frames the image while the shutter fires
  float g = gate * smoothstep(0.0, 0.12, progress) * (1.0 - smoothstep(0.88, 1.0, progress));
  vec2 c = abs(uv - 0.5) * vec2(ratio, 1.0) - vec2(0.5 * ratio, 0.5) + 1.5 * g;
  float e = length(max(c, 0.0)) + min(max(c.x, c.y), 0.0) - 0.5 * g;
  float on = smoothstep(0.0, 0.002, gate) * smoothstep(0.0, 0.04, progress) * (1.0 - smoothstep(0.96, 1.0, progress));
  // it shades the image along its inner edge
  col.rgb *= 1.0 - 0.5 * color.a * on * smoothstep(-0.4 * g - 0.001, 0.0, e);
  vec3 housing = min(color.rgb * (1.5 - smoothstep(0.0, 0.2 * g + 0.001, e)), 1.0);
  return mix(col, vec4(housing, color.a), on * smoothstep(-0.002, 0.002, e));
}
`,author:"gre",license:"MIT",description:"A camera's focal-plane shutter fires across the frame, seen through the camera's gate: thin metal blades fan down from a tight stack above it until they overlap over the whole frame, then keep running down and stack below it, uncovering the incoming image from the top",tags:["camera","shutter","wipe","metal"],params:{blades:{type:"int",default:5,min:3,max:10,step:1,description:"Number of metal blades"},tilt:{type:"float",default:.06,min:0,max:.2,description:"How much the blades tilt on their arms while they travel"},gate:{type:"float",default:.035,min:0,max:.08,description:"Width of the camera's gate framing the image while the shutter fires, in frame heights"},color:{type:"vec4",default:[.09,.09,.1,1],color:!0,description:"Color of the metal blades"}},textures:[],createdAt:"Fri, 13 Nov 2026 08:23:04 +0100",updatedAt:"Fri, 13 Nov 2026 08:23:04 +0100"},{name:"SimpleFlip",paramsTypes:{},defaultParams:{},glsl:`// Author: nwoeanhinnogaehr
// License: MIT
// Description: The outgoing image flips around the vertical axis into the incoming one
// Tags: flip, horizontal
// Ported from https://gist.github.com/nwoeanhinnogaehr/408045772d255df97520

vec4 transition(vec2 uv) {
  vec2 q = uv;
  uv.x = (uv.x - 0.5) / abs(progress - 0.5) * 0.5 + 0.5;
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  // Transparent beside the flipping image
  return mix(a, b, step(0.5, progress)) * step(abs(q.x - 0.5), abs(progress - 0.5));
}
`,author:"nwoeanhinnogaehr",license:"MIT",description:"The outgoing image flips around the vertical axis into the incoming one",tags:["flip","horizontal"],params:{},textures:[],createdAt:"Sun, 29 Mar 2026 20:32:54 +0200",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"SimpleZoom",paramsTypes:{zoom_quickness:"float"},defaultParams:{zoom_quickness:.8},glsl:`// Author: 0gust1
// License: MIT
// Description: Zooms into the outgoing image, then fades to the incoming one
// Tags: zoom, fade

// @range(0.2, 1) Part of the transition spent zooming
uniform float zoom_quickness; // = 0.8
vec2 zoom(vec2 uv, float amount) {
  return 0.5 + ((uv - 0.5) * (1.0-amount));	
}

vec4 transition (vec2 uv) {
  float nQuick = clamp(zoom_quickness,0.2,1.0);
  return mix(
    getFromColor(zoom(uv, smoothstep(0.0, nQuick, progress))),
    getToColor(uv),
   smoothstep(nQuick-0.2, 1.0, progress)
  );
}`,author:"0gust1",license:"MIT",description:"Zooms into the outgoing image, then fades to the incoming one",tags:["zoom","fade"],params:{zoom_quickness:{type:"float",default:.8,min:.2,max:1,description:"Part of the transition spent zooming"}},textures:[],createdAt:"Tue, 6 Mar 2018 00:43:47 +0100",updatedAt:"Sat, 10 Oct 2026 10:11:31 +0200"},{name:"SimpleZoomOut",paramsTypes:{zoom_quickness:"float",fade:"bool"},defaultParams:{zoom_quickness:.8,fade:!0},glsl:`// Author: Tianshuo
// License: MIT
// Description: The incoming image zooms out into place while fading in
// Tags: zoom, fade


// @range(0.2, 1) Part of the transition spent zooming
uniform float zoom_quickness; // = 0.8
// @param Fade instead of cutting to the incoming image
uniform bool fade; // = true
vec2 zoom(vec2 uv, float amount) {
  return 0.5 + ((uv - 0.5) * (1.0-amount));	
}

vec4 transition (vec2 uv) {
  float nQuick = clamp(zoom_quickness,0.2,1.0);
  return mix(
    getFromColor(uv),
    getToColor(zoom(uv,1.-smoothstep(1.-nQuick, 1., progress))),
   fade?smoothstep(1.0-nQuick, 1., progress):(progress<1.0-nQuick?0.0:1.0)
  );
}
`,author:"Tianshuo",license:"MIT",description:"The incoming image zooms out into place while fading in",tags:["zoom","fade"],params:{zoom_quickness:{type:"float",default:.8,min:.2,max:1,description:"Part of the transition spent zooming"},fade:{type:"bool",default:!0,description:"Fade instead of cutting to the incoming image"}},textures:[],createdAt:"Sun, 29 Mar 2026 19:32:53 +0200",updatedAt:"Sat, 10 Oct 2026 10:11:31 +0200"},{name:"SketchDissolve",paramsTypes:{lineWidth:"float",edges:"float",hatching:"float",paper:"vec4",ink:"vec4"},defaultParams:{lineWidth:1.5,edges:1,hatching:.6,paper:[.96,.94,.89,1],ink:[.16,.16,.2,1]},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image fades back to blank paper while the incoming one is drawn on it in pencil, outlines first and then hatching in the shadows, before its shading and colors fill in until the picture is complete
// Tags: pencil, drawing, sketch, edges, dissolve

// @range(0.5, 4) Thickness of the pencil outlines, in thousandths of the frame height
uniform float lineWidth; // = 1.5
// @range(0, 2) How many outlines are drawn: higher also traces the fainter edges of the picture
uniform float edges; // = 1.0
// @range(0, 1) Amount of diagonal hatching drawn in the shadows
uniform float hatching; // = 0.6
// @color Color of the paper
uniform vec4 paper; // = vec4(0.96, 0.94, 0.89, 1.0)
// @color Color of the pencil
uniform vec4 ink; // = vec4(0.16, 0.16, 0.2, 1.0)

float sdHash (vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float sdNoise (vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(sdHash(i), sdHash(i + vec2(1.0, 0.0)), f.x),
    mix(sdHash(i + vec2(0.0, 1.0)), sdHash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// luma and alpha of the incoming image: outlines follow both
vec2 sdTone (vec2 uv) {
  vec4 c = getToColor(uv);
  return vec2(dot(c.rgb, vec3(0.299, 0.587, 0.114)), c.a);
}

// one family of hatching strokes along direction d, as thick as the shadow is dark
float sdHatch (vec2 q, vec2 d, float dark) {
  float s = dot(q, d) * 60.0 + 0.5 * sdNoise(q * 9.0 + d * 13.0);
  float row = floor(s);
  // each row is made of strokes of uneven length and pressure, with small gaps
  float along = dot(q, vec2(-d.y, d.x)) * 8.0 + sdHash(vec2(row, d.y * 7.0)) * 5.0;
  float cell = floor(along);
  float k = sdHash(vec2(row, cell) + d * 31.0);
  float gap = smoothstep(0.0, 0.12, fract(along)) * (1.0 - smoothstep(0.75 - 0.2 * k, 1.0, fract(along)));
  float w = 0.5 * clamp(dark, 0.0, 1.0) * (0.7 + 0.3 * k);
  return (1.0 - smoothstep(w - 0.24, w, abs(fract(s) - 0.5))) * gap * (0.6 + 0.4 * k);
}

vec4 transition (vec2 uv) {
  vec2 q = vec2(uv.x * ratio, uv.y);
  // a slightly wobbly hand: the outlines are traced a bit off the real edges
  vec2 wob = (vec2(sdNoise(q * 6.0), sdNoise(q * 6.0 + 17.0)) - 0.5) * 0.004;
  vec2 su = uv + wob * (1.0 - progress);
  vec2 dx = vec2(0.001 * lineWidth / ratio, 0.0);
  vec2 dy = vec2(0.0, 0.001 * lineWidth);
  vec2 tl = sdTone(su - dx + dy), tm = sdTone(su + dy), tr = sdTone(su + dx + dy);
  vec2 ml = sdTone(su - dx), mr = sdTone(su + dx);
  vec2 bl = sdTone(su - dx - dy), bm = sdTone(su - dy), br = sdTone(su + dx - dy);
  vec2 gx = (tr + 2.0 * mr + br) - (tl + 2.0 * ml + bl);
  vec2 gy = (tl + 2.0 * tm + tr) - (bl + 2.0 * bm + br);
  float g = max(length(vec2(gx.x, gy.x)), length(vec2(gx.y, gy.y))) * max(edges, 0.0);
  float outline = smoothstep(0.12, 0.5, g);
  vec4 toC = getToColor(uv);
  float l = clamp((tm.x + bm.x + ml.x + mr.x) * 0.25, 0.0, 1.0);

  // graphite grain, and the order in which the strokes are laid down
  float grain = 0.65 + 0.35 * sdNoise(q * vec2(180.0, 60.0));
  float order = sdNoise(q * 3.0 + 4.0);
  float fine = sdNoise(q * 24.0);
  float drawOutline = smoothstep(0.0, 0.1, progress - (0.22 * order + 0.05 * fine));
  float drawHatch = smoothstep(0.0, 0.12, progress - (0.2 + 0.2 * order + 0.05 * fine));

  // the shading builds up from the darkest parts to the lightest, then the colors come in
  float fill = smoothstep(0.0, 0.22, progress - (0.4 + 0.25 * l + 0.1 * order));

  // hatching: one direction in the shadows, crossed in the darkest parts
  float dark = 1.0 - l;
  float h1 = sdHatch(q, vec2(0.7071, 0.7071), smoothstep(0.35, 0.9, dark));
  float h2 = sdHatch(q, vec2(0.7071, -0.7071), smoothstep(0.65, 1.0, dark));
  float hatch = hatching * 0.8 * max(h1, 0.8 * h2) * toC.a;

  // the hatching is absorbed by the shading as it fills in
  hatch *= drawHatch * (1.0 - 0.6 * fill);
  float pencil = max(outline * drawOutline, hatch) * grain;
  // the pencil lines give way to the finished picture at the end
  pencil *= 1.0 - smoothstep(0.7, 1.0, progress);

  // the outgoing image fades back to paper
  vec4 base = mix(getFromColor(uv), paper, smoothstep(0.02, 0.38, progress));
  float sat = smoothstep(0.55, 1.0, progress);
  vec4 tone = vec4(paper.rgb * mix(0.3, 1.0, l), paper.a * toC.a);
  vec4 col = mix(tone, toC, sat);
  base = mix(base, col, fill);
  return mix(base, ink, pencil);
}
`,author:"gre",license:"MIT",description:"The outgoing image fades back to blank paper while the incoming one is drawn on it in pencil, outlines first and then hatching in the shadows, before its shading and colors fill in until the picture is complete",tags:["pencil","drawing","sketch","edges","dissolve"],params:{lineWidth:{type:"float",default:1.5,min:.5,max:4,description:"Thickness of the pencil outlines, in thousandths of the frame height"},edges:{type:"float",default:1,min:0,max:2,description:"How many outlines are drawn: higher also traces the fainter edges of the picture"},hatching:{type:"float",default:.6,min:0,max:1,description:"Amount of diagonal hatching drawn in the shadows"},paper:{type:"vec4",default:[.96,.94,.89,1],color:!0,description:"Color of the paper"},ink:{type:"vec4",default:[.16,.16,.2,1],color:!0,description:"Color of the pencil"}},textures:[],createdAt:"Fri, 6 Nov 2026 20:57:10 +0100",updatedAt:"Fri, 6 Nov 2026 20:57:10 +0100"},{name:"SlideAwayRight",paramsTypes:{},defaultParams:{},glsl:`// Author: lizhongjian
// License: MIT
// Description: The outgoing image slides to the right, uncovering a crossfade to the incoming one
// Tags: slide, horizontal, blend

vec4 transition (vec2 uv) {
  vec2 newUV = uv;
  newUV.x -= progress;
  if(uv.x >= progress)
  {
    return getFromColor(newUV);
  }

  
  return mix(
    getFromColor(uv),
    getToColor(uv),
    progress
  );
}
`,author:"lizhongjian",license:"MIT",description:"The outgoing image slides to the right, uncovering a crossfade to the incoming one",tags:["slide","horizontal","blend"],params:{},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"Slides",paramsTypes:{type:"int",In:"bool"},defaultParams:{type:0,In:!1},glsl:`// Author: Mark Craig
// mrmcsoftware on github and youtube ( http://www.youtube.com/MrMcSoftware )
// License: MIT
// Description: The outgoing image slides out, or the incoming one slides in, toward an edge, a corner or the center
// Tags: slide, directional

// Slides Transition by Mark Craig (Copyright © 2022)

uniform int type; // = 0
// @param Slide the incoming image in instead of the outgoing one out
uniform bool In; // = false
// type: slide to/from which edge, which corner, or center
// In: if true slide new image in, otherwise slide old image out

#define rad2 rad / 2.0

vec4 transition(vec2 uv)
{
vec2 uv0 = uv;
float rad = In ? progress : 1.0 - progress;
float xc1, yc1;
// I used if/else instead of switch in case it's an old GPU
if (type == 0) { xc1 = .5 - rad2; yc1 = 0.0; }
else if (type == 1) { xc1 = 1.0 - rad; yc1 = .5 - rad2; }
else if (type == 2) { xc1 = .5 - rad2; yc1 = 1.0 - rad; }
else if (type == 3) { xc1 = 0.0; yc1 = .5 - rad2; }
else if (type == 4) { xc1 = 1.0 - rad; yc1 = 0.0; }
else if (type == 5) { xc1 = 1.0 - rad; yc1 = 1.0 - rad; }
else if (type == 6) { xc1 = 0.0; yc1 = 1.0 - rad; }
else if (type == 7) { xc1 = 0.0; yc1 = 0.0; }
else if (type == 8) { xc1 = .5 - rad2; yc1 = .5 - rad2; }
uv.y = 1.0 - uv.y;
vec2 uv2;
if ((uv.x >= xc1) && (uv.x <= xc1 + rad) && (uv.y >= yc1) && (uv.y <= yc1 + rad))
	{
	uv2 = vec2((uv.x - xc1) / rad, 1.0 - (uv.y - yc1) / rad);
	return(In ? getToColor(uv2) : getFromColor(uv2));
	}
return(In ? getFromColor(uv0) : getToColor(uv0));
}
`,author:"Mark Craig",license:"MIT",description:"The outgoing image slides out, or the incoming one slides in, toward an edge, a corner or the center",tags:["slide","directional"],params:{type:{type:"int",default:0},In:{type:"bool",default:!1,description:"Slide the incoming image in instead of the outgoing one out"}},textures:[],createdAt:"Tue, 4 Apr 2023 03:32:13 -0400",updatedAt:"Sat, 10 Oct 2026 10:11:31 +0200"},{name:"SlotReels",paramsTypes:{reels:"int",blur:"float",stagger:"float",bounce:"float",separator:"vec4"},defaultParams:{reels:5,blur:.6,stagger:.45,bounce:.5,separator:[.04,.04,.05,1]},glsl:`// Author: gre
// License: MIT
// Description: The frame is cut into vertical reels that spin downward like drums, motion-blurred with speed, carrying the outgoing image then the incoming one, and stop one after another from left to right with a small mechanical bounce
// Tags: 3d, spin, stripes, motion-blur

// @range(1, 16, 1) Number of reels
uniform int reels; // = 5
// @range(0, 1) Amount of vertical motion blur while the reels spin fast
uniform float blur; // = 0.6
// @range(0, 0.9) Delay between the first and the last reel's stop, as a part of the transition
uniform float stagger; // = 0.45
// @range(0, 1) Size of the bounce when a reel stops
uniform float bounce; // = 0.5
// @color Color of the separators between the reels
uniform vec4 separator; // = vec4(0.04, 0.04, 0.05, 1.0)

const float PI = 3.141592653589793;
// half of the arc of the drum seen in the frame, in radians
const float ARC = 1.15;
// duration of the bounce, as a part of the transition
const float SETTLE = 0.1;
// width of the separators, in frame heights
const float LINE = 0.006;
// width of the anti-aliased edges, in frame heights
const float EDGE = 0.0015;

// the time at which the reel stops, before its bounce
float stopTime(float i, float n) {
  float order = n > 1.0 ? i / (n - 1.0) : 1.0;
  return (1.0 - SETTLE) * (1.0 - clamp(stagger, 0.0, 0.9) * (1.0 - order));
}

// how far the reel has turned at time t, in image heights: it speeds up, slows down to its stop
// a little past the incoming image and springs back onto it
float reelOffset(float t, float stopT, float turns) {
  float amp = 0.07 * bounce;
  // speed at the stop, matched with the start of the bounce
  float v1 = amp * PI * stopT / (turns * SETTLE);
  float u = clamp(t / stopT, 0.0, 1.0);
  float g = u * u * (3.0 - 2.0 * u) + v1 * (u * u * u - u * u);
  float b = clamp((t - stopT) / SETTLE, 0.0, 1.0);
  return turns * g + amp * sin(PI * b) * (1.0 - b) * (1.0 - b);
}

// the reel's speed at time t, the derivative of reelOffset, in image heights per transition
float reelSpeed(float t, float stopT, float turns) {
  float amp = 0.07 * bounce;
  float v1 = amp * PI * stopT / (turns * SETTLE);
  if (t < stopT) {
    float u = max(t / stopT, 0.0);
    return turns * (6.0 * u * (1.0 - u) + v1 * u * (3.0 * u - 2.0)) / stopT;
  }
  float b = min((t - stopT) / SETTLE, 1.0);
  return amp * (1.0 - b) * (PI * cos(PI * b) * (1.0 - b) - 2.0 * sin(PI * b)) / SETTLE;
}

vec4 transition (vec2 uv) {
  float n = max(float(reels), 1.0);
  float i = min(floor(uv.x * n), n - 1.0);
  float lx = uv.x * n - i;
  float stopT = stopTime(i, n);
  // an odd number of turns, more for the reels that spin longer, so they land on the incoming image
  float turns = 2.0 * floor(stopT * 4.0) + 1.0;

  // the reel is a drum while it spins, and flattens back as it settles
  float drum = smoothstep(0.0, 0.12, progress) * (1.0 - smoothstep(stopT, stopT + SETTLE, progress));
  float y = 2.0 * uv.y - 1.0;
  // theta: the angle around the drum's axis, 0 facing the viewer
  float theta = asin(clamp(y * sin(ARC), -1.0, 1.0));
  float v = mix(uv.y, 0.5 + theta / (2.0 * ARC), drum);
  // the far edges of the drum look narrower
  float depth = (1.0 - cos(theta)) * drum;
  float px = 0.5 + (lx - 0.5) * (1.0 + 0.2 * depth);

  // offset from the resting position, -turns at the start, 0 once landed
  float off = reelOffset(progress, stopT, turns) - turns;
  float speed = abs(reelSpeed(progress, stopT, turns));
  // the blur spans the distance the reel travels in about a frame
  float spread = blur * min(speed * 0.02, 0.22) * drum;

  // up to 8 taps along the reel, weighted toward the middle, one when it stands still
  vec4 c = vec4(0.0);
  float wsum = 0.0;
  for (int k = 0; k < 8; k++) {
    float f = float(k) / 7.0 - 0.5;
    float w = 1.0 - abs(f);
    float vv = v + off + spread * f;
    float seg = floor(vv);
    vec2 q = vec2((i + clamp(px, 0.0, 1.0)) / n, vv - seg);
    // the drum carries the incoming image on even segments, the outgoing one on odd segments
    vec4 s = mod(seg, 2.0) < 0.5 ? getToColor(q) : getFromColor(q);
    // a thin shadow at the seams between the images, not at the frame's top and bottom edges
    s.rgb *= 1.0 - 0.6 * drum * (1.0 - y * y) * (1.0 - smoothstep(0.0, 0.02, min(q.y, 1.0 - q.y)));
    c += w * s;
    wsum += w;
    if (spread < 1e-4) break;
  }
  c /= wsum;

  // the drum's faces darken as they turn away, with a soft highlight above its middle
  float facing = cos(theta);
  c.rgb *= mix(1.0, 0.25 + 0.75 * facing * facing, drum);
  c.rgb += drum * 0.07 * c.a * exp(-12.0 * (y - 0.3) * (y - 0.3));

  // separators between the reels, and the background around the narrower far edges of the drums
  float env = smoothstep(0.0, 0.1, progress) * (1.0 - smoothstep(0.9, 1.0, progress));
  float reelW = ratio / n;
  float persp = reelW / (1.0 + 0.2 * depth);
  // distance to the reel's sides, and to its sides next to the other reels
  float dSide = min(px, 1.0 - px) * persp;
  float dInner = min(i > 0.5 ? px : 2.0, i < n - 1.5 ? 1.0 - px : 2.0) * persp;
  float line = 1.0 - smoothstep(0.5 * LINE - EDGE, 0.5 * LINE + EDGE, dInner);
  float outside = 1.0 - smoothstep(-EDGE, 0.0, dSide);
  // a soft shadow cast by the separators on the reels
  c.rgb *= 1.0 - 0.35 * env * (1.0 - smoothstep(0.0, 0.03 * reelW + LINE, dInner));
  return mix(c, separator, max(line * env, outside));
}
`,author:"gre",license:"MIT",description:"The frame is cut into vertical reels that spin downward like drums, motion-blurred with speed, carrying the outgoing image then the incoming one, and stop one after another from left to right with a small mechanical bounce",tags:["3d","spin","stripes","motion-blur"],params:{reels:{type:"int",default:5,min:1,max:16,step:1,description:"Number of reels"},blur:{type:"float",default:.6,min:0,max:1,description:"Amount of vertical motion blur while the reels spin fast"},stagger:{type:"float",default:.45,min:0,max:.9,description:"Delay between the first and the last reel's stop, as a part of the transition"},bounce:{type:"float",default:.5,min:0,max:1,description:"Size of the bounce when a reel stops"},separator:{type:"vec4",default:[.04,.04,.05,1],color:!0,description:"Color of the separators between the reels"}},textures:[],createdAt:"Sun, 8 Nov 2026 10:38:52 +0100",updatedAt:"Sun, 8 Nov 2026 10:38:52 +0100"},{name:"SmokeDissolve",paramsTypes:{direction:"vec2",scale:"float",spread:"float",softness:"float",color:"vec4"},defaultParams:{direction:[.5,.1],scale:2.5,spread:.4,softness:.5,color:[.86,.86,.88,1]},glsl:`// Author: gre
// License: MIT
// Description: Billowing smoke drifts in across the outgoing image, with lit tops, darker folds and wispy edges, and thickens until it covers the frame; as it thins out and drifts away, the incoming image shows through
// Tags: smoke, fog, organic, noise, cover

// @param Direction the smoke drifts toward (it comes in from the opposite side); its length is how far it drifts, in frame heights
uniform vec2 direction; // = vec2(0.5, 0.1)
// @range(1, 8) Size of the billows: more, smaller ones with a larger value
uniform float scale; // = 2.5
// @range(0, 1) How much the smoke rolls in from one side rather than everywhere at once
uniform float spread; // = 0.4
// @range(0.05, 1) Softness of the smoke: wispier, more see-through edges with a larger value
uniform float softness; // = 0.5
// @color Color of the smoke, lit from above
uniform vec4 color; // = vec4(0.86, 0.86, 0.88, 1.0)

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

float vnoise(vec2 v) {
  vec2 i = floor(v);
  vec2 f = fract(v);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
    mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 v) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * vnoise(v);
    v = mat2(1.6, 1.2, -1.2, 1.6) * v + 5.3;
    amp *= 0.5;
  }
  return sum / 0.9375;
}

vec4 transition(vec2 uv) {
  float p = progress;
  vec2 pos = (uv - 0.5) * vec2(ratio, 1.0);

  // where along the drift the pixel is: 0 on the side the smoke comes from, 1 on the other
  float len = length(direction);
  vec2 dir = len > 1e-4 ? direction / len : vec2(0.0);
  float ext = 0.5 * (abs(dir.x) * ratio + abs(dir.y)) + 1e-4;
  float along = len > 1e-4 ? 0.5 + 0.5 * dot(pos, dir) / ext : 0.5;

  // the smoke rolls in (until 0.45), covers the whole frame, then thins out (from 0.55),
  // each side of the frame in turn
  float arrive = (p / 0.45) * (1.0 + spread) - spread * along;
  float leave = ((p - 0.55) / 0.45) * (1.0 + spread) - spread * along;
  float body = smoothstep(0.0, 1.0, arrive) * (1.0 - smoothstep(0.0, 1.0, leave));
  // the images switch while the smoke is fully dense everywhere
  float m = smoothstep(0.48, 0.52, p);
  // no smoke here (yet, or any more): one image only
  if (body <= 0.0) return m < 0.5 ? getFromColor(uv) : getToColor(uv);

  // billows: noise warped by itself, drifting with the smoke and slowly churning
  vec2 q = (pos - direction * (p - 0.5)) * scale;
  vec2 churn = vec2(0.5 * p, -0.35 * p);
  vec2 warp = vec2(fbm(q + vec2(3.1, 1.7) + churn), fbm(q + vec2(8.3, 2.8) - churn));
  vec2 w = q + 1.1 * (warp - 0.5);
  float n = fbm(w);
  // the billows catch the light from above: brighter where the smoke rises toward it
  // (on the coarse octave only, which shapes them)
  float lit = 0.53 * (vnoise(w) - vnoise(w + vec2(0.0, 0.2)));
  // finer curls that fray the edges into wisps
  float wisp = vnoise(w * 3.3 - 2.0 * churn) - 0.5;

  // density: the billows fill in first, the gaps between them last, and thin out first
  float edge = 2.0 * body - (1.0 - smoothstep(0.1, 0.6, n)) + 1.6 * body * (1.0 - body) * wisp;
  float d = smoothstep(0.0, softness, edge) * mix(0.5, 1.0, smoothstep(0.2, 0.9, body));

  // the image under the smoke: one image, or both mixed (premultiplied) during the switch
  vec4 base;
  if (m <= 0.0) base = getFromColor(uv);
  else if (m >= 1.0) base = getToColor(uv);
  else {
    vec4 a = getFromColor(uv);
    vec4 b = getToColor(uv);
    base = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);
    base = base.a > 0.0 ? vec4(base.rgb / base.a, base.a) : vec4(0.0);
  }
  if (d <= 0.0) return base;

  // soft volumetric shading: lit tops, darker folds deep in the smoke, lighter thin wisps
  float shade = 0.92 + 1.3 * lit;
  shade *= mix(0.76, 1.04, smoothstep(0.25, 0.75, n));
  shade = mix(1.0, shade, 0.3 + 0.7 * d);
  vec3 smoke = clamp(color.rgb * shade, 0.0, 1.0);

  // the smoke color mixes as straight RGBA, like every fill color
  return mix(base, vec4(smoke, color.a), d);
}
`,author:"gre",license:"MIT",description:"Billowing smoke drifts in across the outgoing image, with lit tops, darker folds and wispy edges, and thickens until it covers the frame; as it thins out and drifts away, the incoming image shows through",tags:["smoke","fog","organic","noise","cover"],params:{direction:{type:"vec2",default:[.5,.1],description:"Direction the smoke drifts toward (it comes in from the opposite side); its length is how far it drifts, in frame heights"},scale:{type:"float",default:2.5,min:1,max:8,description:"Size of the billows: more, smaller ones with a larger value"},spread:{type:"float",default:.4,min:0,max:1,description:"How much the smoke rolls in from one side rather than everywhere at once"},softness:{type:"float",default:.5,min:.05,max:1,description:"Softness of the smoke: wispier, more see-through edges with a larger value"},color:{type:"vec4",default:[.86,.86,.88,1],color:!0,description:"Color of the smoke, lit from above"}},textures:[],createdAt:"Tue, 3 Nov 2026 09:42:39 +0100",updatedAt:"Tue, 3 Nov 2026 09:42:39 +0100"},{name:"SnakeBlockWipe",paramsTypes:{grid:"ivec2",vertical:"bool",smoothness:"float"},defaultParams:{grid:[8,6],vertical:!1,smoothness:.5},glsl:`// Author: gre
// License: MIT
// Description: Blocks switch to the incoming image one at a time, row after row from the top (or column after column from the left), each line running the opposite way to the one before, like a snake winding across the frame
// Tags: wipe, blocks, grid, zigzag

// @param Number of blocks (columns, rows)
uniform ivec2 grid; // = ivec2(8, 6)
// @param Wind down the columns instead of along the rows
uniform bool vertical; // = false
// @range(0, 4) How long each block takes to fade in, in turns of one block (0 switches it at once)
uniform float smoothness; // = 0.5

vec4 transition(vec2 uv) {
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  if (progress <= 0.0) return a;
  if (progress >= 1.0) return b;

  vec2 g = max(vec2(grid), 1.0);
  // block coordinates from the top left corner
  vec2 cell = min(floor(vec2(uv.x, 1.0 - uv.y) * g), g - 1.0);
  // the snake runs along the rows, or along the columns when vertical
  float lines = vertical ? g.x : g.y;
  float len = vertical ? g.y : g.x;
  float line = vertical ? cell.x : cell.y;
  float pos = vertical ? cell.y : cell.x;
  // every other line runs backward
  if (mod(line, 2.0) > 0.5) pos = len - 1.0 - pos;
  float order = line * len + pos;

  // block k fades in from k to k + w, on a timeline from 0 to n - 1 + w
  float n = lines * len;
  float w = max(smoothness, 0.001);
  float m = clamp((progress * (n - 1.0 + w) - order) / w, 0.0, 1.0);

  // mixed premultiplied, so transparent images do not bleed their color
  vec4 c = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"Blocks switch to the incoming image one at a time, row after row from the top (or column after column from the left), each line running the opposite way to the one before, like a snake winding across the frame",tags:["wipe","blocks","grid","zigzag"],params:{grid:{type:"ivec2",default:[8,6],description:"Number of blocks (columns, rows)"},vertical:{type:"bool",default:!1,description:"Wind down the columns instead of along the rows"},smoothness:{type:"float",default:.5,min:0,max:4,description:"How long each block takes to fade in, in turns of one block (0 switches it at once)"}},textures:[],createdAt:"Wed, 4 Nov 2026 20:13:39 +0100",updatedAt:"Wed, 4 Nov 2026 20:13:39 +0100"},{name:"Snapshot",paramsTypes:{tilt:"float",border:"float",flash:"float",shadow:"float",borderColor:"vec4"},defaultParams:{tilt:.35,border:.04,flash:.85,shadow:.45,borderColor:[.96,.94,.89,1]},glsl:`// Author: gre
// License: MIT
// Description: A camera flash freezes the outgoing image into a printed photo with a white border, which shrinks, tilts and drops out of the frame, revealing the incoming image behind it
// Tags: photo, flash, scale, rotate, fall, shadow

// @range(0, 1) How much the photo turns as it drops
uniform float tilt; // = 0.35
// @range(0, 0.15) Width of the photo's border, relative to the frame height
uniform float border; // = 0.04
// @range(0, 1) Strength of the camera flash
uniform float flash; // = 0.85
// @range(0, 1) Darkness of the soft shadow the photo casts on the incoming image
uniform float shadow; // = 0.45
// @color Color of the photo's border
uniform vec4 borderColor; // = vec4(0.96, 0.94, 0.89, 1.0)

const float SHRINK = 0.24; // how much smaller the photo gets before it drops
const float RADIUS = 0.008; // corner radius of the photo, in frame heights
const float AA = 0.0015; // width of the antialiased edges, in frame heights

// signed distance to a rounded box of half size b and corner radius r
float roundedBox(vec2 q, vec2 b, float r) {
  vec2 d = abs(q) - b + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

vec4 premultiply(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

vec4 transition(vec2 uv) {
  float p = progress;
  vec2 asp = vec2(ratio, 1.0);
  vec2 q = (uv - 0.5) * asp;
  vec2 halfImage = 0.5 * asp;
  vec2 halfCard = halfImage + border;

  // the photo shrinks right after the flash, then falls with gravity, turning as it goes
  float k = smoothstep(0.05, 0.4, p);
  float t = clamp((p - 0.3) / 0.7, 0.0, 1.0);
  float fall = t * t;
  float s = 1.0 - SHRINK * k;
  float a = -tilt * (0.12 * k + 0.88 * fall);
  // fall far enough for the turned photo and its shadow to be out of the frame at the end
  float bound = (abs(sin(tilt)) * halfCard.x + abs(cos(tilt)) * halfCard.y) * (1.0 - SHRINK);
  // it is lifted a little toward the viewer before it falls
  float lift = 0.035 * k * (1.0 - fall);
  vec2 center = vec2(0.08 * fall, lift - (0.5 + bound + 0.1) * fall);

  float rad = RADIUS * k;

  float ca = cos(a), sa = sin(a);
  mat2 unrotate = mat2(ca, -sa, sa, ca);

  // the incoming image, already behind the photo, in its soft shadow
  vec4 col = getToColor(uv);
  float sh = shadow * k;
  if (sh > 0.0) {
    vec2 rs = unrotate * (q - center - vec2(0.012, -0.022) * k) / s;
    float ds = roundedBox(rs, halfCard, rad) * s;
    float blur = 0.035 * s;
    col.rgb *= 1.0 - sh * (1.0 - smoothstep(-blur, blur, ds));
  }
  col = premultiply(col);

  // the photo: the outgoing image, framed by its border
  vec2 r = unrotate * (q - center) / s;
  float dCard = roundedBox(r, halfCard, rad) * s;
  float dImage = roundedBox(r, halfImage, 0.0) * s;
  // the edges are pushed out by one antialiasing width, so the photo covers the full frame at the start
  float cardCover = clamp(1.5 - dCard / AA, 0.0, 1.0);
  float imageCover = clamp(1.5 - dImage / AA, 0.0, 1.0);
  // the image replaces what is behind it, while the border is laid over the incoming image, which shows through a translucent border
  vec4 photo = premultiply(getFromColor(clamp(r / asp + 0.5, 0.0, 1.0)));
  vec4 paper = premultiply(borderColor);
  vec4 card = mix(paper + col * (1.0 - paper.a), photo, imageCover);
  col = mix(col, card, cardCover);
  if (col.a <= 0.0) return vec4(0.0);
  col.rgb /= col.a;

  // the flash only adds light: a quick bloom to white that fades as the photo comes out
  float f = flash * smoothstep(0.0, 0.05, p) * (1.0 - smoothstep(0.05, 0.3, p));
  col.rgb = 1.0 - (1.0 - col.rgb) * (1.0 - f);
  return col;
}
`,author:"gre",license:"MIT",description:"A camera flash freezes the outgoing image into a printed photo with a white border, which shrinks, tilts and drops out of the frame, revealing the incoming image behind it",tags:["photo","flash","scale","rotate","fall","shadow"],params:{tilt:{type:"float",default:.35,min:0,max:1,description:"How much the photo turns as it drops"},border:{type:"float",default:.04,min:0,max:.15,description:"Width of the photo's border, relative to the frame height"},flash:{type:"float",default:.85,min:0,max:1,description:"Strength of the camera flash"},shadow:{type:"float",default:.45,min:0,max:1,description:"Darkness of the soft shadow the photo casts on the incoming image"},borderColor:{type:"vec4",default:[.96,.94,.89,1],color:!0,description:"Color of the photo's border"}},textures:[],createdAt:"Wed, 4 Nov 2026 12:50:01 +0100",updatedAt:"Wed, 4 Nov 2026 12:50:01 +0100"},{name:"Sphere",paramsTypes:{direction:"vec2",size:"float",shading:"float",shadow:"float"},defaultParams:{direction:[1,0],size:.3,shading:.6,shadow:.5},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image wraps itself onto a shaded ball that shrinks and rolls away, revealing the incoming image under its shadow
// Tags: 3d, sphere, roll, wrap, shape

// @param Direction the ball rolls away toward
uniform vec2 direction; // = vec2(1.0, 0.0)
// @range(0.1, 0.5) Radius of the ball once wrapped, relative to the shorter side of the frame
uniform float size; // = 0.3
// @range(0, 1) Strength of the light and shading on the ball
uniform float shading; // = 0.6
// @range(0, 1) Darkness of the soft shadow the ball casts on the incoming image
uniform float shadow; // = 0.5

const float PI = 3.14159265;
// half width of the antialiased ball edge, in frame heights
const float AA = 0.0015;
// toward the light, from the top left
const vec3 LIGHT = vec3(-0.5, 0.6, 1.0) / 1.2689;

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  vec4 b = getToColor(uv);
  if (progress >= 1.0) return b;

  vec2 dir = length(direction) > 0.0 ? normalize(direction) : vec2(1.0, 0.0);
  vec2 side = vec2(-dir.y, dir.x);
  // measured in square pixels, so the ball is round
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0);
  float shorter = min(ratio, 1.0);
  float r0 = clamp(size, 0.1, 0.5) * shorter;

  // the image curves into a ball (infinite radius: exactly flat at the start), then the
  // ball shrinks while rolling away until it and its shadow have left the frame
  float w = clamp(progress / 0.45, 0.0, 1.0);
  w = 1.0 - (1.0 - w) * (1.0 - w);
  float away = smoothstep(0.3, 1.0, progress);
  away *= away;
  float wrapped = r0 / max(w, 1e-4);
  float radius = wrapped * mix(1.0, 0.5, away);
  // the image is pulled tighter as it wraps, so that it ends up covering the whole ball
  // (its shortest half extent reaches around to the back)
  float tight = mix(1.0, min(1.0, 0.48 * shorter / (PI * r0)), w * w);
  float paper = radius * tight;
  // half extent of the frame along the direction
  float e = 0.5 * (abs(dir.x) * ratio + abs(dir.y));
  // far enough that the ball (0.5 * r0 by then) and its shadow (within 0.9 * r0 of it) have left
  float full = e + 1.1 * r0 + 2.0 * AA;
  float travel = away * full;
  vec2 center = dir * travel;
  // rolling without slipping: the integral of dtravel / radius while the radius shrinks
  float angle = -2.0 * full * log(1.0 - 0.5 * away) / wrapped;

  vec2 d = p - center;
  float r = length(d);

  // soft shadow on the incoming image, below and to the right of the ball (light from the top left)
  vec2 sd = d - vec2(0.25, -0.3) * radius * w;
  float sh = shadow * w * (1.0 - smoothstep(0.6 * radius, 1.4 * radius, length(sd)));
  vec4 bg = vec4(b.rgb * b.a * (1.0 - sh), b.a);

  vec4 ball = vec4(0.0);
  float cover = 1.0 - smoothstep(radius - AA, radius + AA, r);
  if (cover > 0.0) {
    // normal of the visible point of the ball (no squared radius, which overflows when it is huge)
    vec2 nd = d / radius;
    vec3 n = vec3(nd, sqrt(max(1.0 - dot(nd, nd), 0.0)));
    // undo the roll: rotate around the axis across the direction
    float u = dot(n.xy, dir);
    float s = dot(n.xy, side);
    float cu = cos(angle), su = sin(angle);
    vec3 q = vec3(u * cu - n.z * su, s, u * su + n.z * cu);
    // the image is wrapped around the ball from its front point, distances kept along the surface
    float lq = length(q.xy);
    float arc = atan(lq, q.z) * paper;
    vec2 img = lq > 0.0 ? (q.x * dir + q.y * side) / lq * arc : vec2(0.0);
    vec2 iuv = img / vec2(ratio, 1.0) + 0.5;
    // distance to the edge of the image, antialiased like the ball's outline
    vec2 edge = min(iuv, 1.0 - iuv) * vec2(ratio, 1.0);
    float inside = cover * smoothstep(-AA, AA, min(edge.x, edge.y));
    if (inside > 0.0) {
      vec4 c = getFromColor(clamp(iuv, 0.0, 1.0));
      float diff = max(dot(n, LIGHT), 0.0);
      float spec = pow(max(reflect(-LIGHT, n).z, 0.0), 24.0);
      float k = shading * w;
      vec3 lit = c.rgb * mix(1.0, 0.25 + 0.85 * diff, k) + 0.35 * k * spec;
      ball = vec4(clamp(lit, 0.0, 1.0) * c.a, c.a) * inside;
    }
  }

  // the ball over the incoming image, premultiplied so transparent images do not bleed their color
  vec4 c = ball + bg * (1.0 - ball.a);
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The outgoing image wraps itself onto a shaded ball that shrinks and rolls away, revealing the incoming image under its shadow",tags:["3d","sphere","roll","wrap","shape"],params:{direction:{type:"vec2",default:[1,0],description:"Direction the ball rolls away toward"},size:{type:"float",default:.3,min:.1,max:.5,description:"Radius of the ball once wrapped, relative to the shorter side of the frame"},shading:{type:"float",default:.6,min:0,max:1,description:"Strength of the light and shading on the ball"},shadow:{type:"float",default:.5,min:0,max:1,description:"Darkness of the soft shadow the ball casts on the incoming image"}},textures:[],createdAt:"Wed, 4 Nov 2026 20:11:57 +0100",updatedAt:"Wed, 4 Nov 2026 20:11:57 +0100"},{name:"SpiralBlockWipe",paramsTypes:{grid:"ivec2",inward:"bool",clockwise:"bool",smoothness:"float"},defaultParams:{grid:[8,6],inward:!0,clockwise:!0,smoothness:.05},glsl:`// Author: gre
// License: MIT
// Description: Square blocks switch to the incoming image one after another along a rectangular spiral, from the border inward or from the center outward
// Tags: wipe, grid, blocks, spiral

// @param Number of blocks (columns, rows)
uniform ivec2 grid; // = ivec2(8, 6)
// @param Spiral from the top left corner inward; false spirals from the center outward, ending at the top left corner
uniform bool inward; // = true
// @param Turn clockwise; false turns counterclockwise
uniform bool clockwise; // = true
// @range(0, 0.5) Duration of each block's fade, as a fraction of the transition
uniform float smoothness; // = 0.05

// Position of the cell c (from the top left corner) along the spiral that runs clockwise
// from the top left corner of a n.x by n.y grid inward, from 0 to n.x * n.y - 1
float spiralIndex(vec2 c, vec2 n) {
  // ring: distance to the border, in cells
  float k = min(min(c.x, c.y), min(n.x - 1.0 - c.x, n.y - 1.0 - c.y));
  // size of the ring, and the cell's position in it
  vec2 s = n - 2.0 * k;
  vec2 l = c - k;
  // the outer rings come first
  float before = n.x * n.y - s.x * s.y;
  float along;
  if (l.y == 0.0) along = l.x; // top side, to the right
  else if (l.x == s.x - 1.0) along = s.x - 1.0 + l.y; // right side, down
  else if (l.y == s.y - 1.0) along = 2.0 * s.x + s.y - 3.0 - l.x; // bottom side, to the left
  else along = 2.0 * (s.x - 1.0) + 2.0 * (s.y - 1.0) - l.y; // left side, up
  return before + along;
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  vec2 n = max(vec2(grid), vec2(1.0));
  // the cell, counted from the top left corner
  vec2 c = min(floor(vec2(uv.x, 1.0 - uv.y) * n), n - 1.0);
  // the transposed spiral turns the other way from the same corner; walking the spiral
  // outward reverses it too
  if (clockwise != inward) {
    c = c.yx;
    n = n.yx;
  }
  float count = n.x * n.y;
  float i = spiralIndex(c, n);
  if (!inward) i = count - 1.0 - i;

  // the blocks switch one after another, each one fading in over w blocks of time, the first
  // fade starting at 0 and the last ending at 1; without fade, block i switches at (i + 0.5) / count
  float w = max(smoothness, 0.0) * count;
  float o = max(0.5 * (1.0 - w), 0.0);
  float x = progress * (count - 1.0 + 2.0 * o + w) - i - o;
  float m = w > 0.0 ? smoothstep(0.0, w, x) : step(0.0, x);

  if (m <= 0.0) return getFromColor(uv);
  if (m >= 1.0) return getToColor(uv);
  vec4 a = getFromColor(uv);
  vec4 b = getToColor(uv);
  // mixed premultiplied, so transparent images do not bleed their color
  vec4 col = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), m);
  return col.a > 0.0 ? vec4(col.rgb / col.a, col.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"Square blocks switch to the incoming image one after another along a rectangular spiral, from the border inward or from the center outward",tags:["wipe","grid","blocks","spiral"],params:{grid:{type:"ivec2",default:[8,6],description:"Number of blocks (columns, rows)"},inward:{type:"bool",default:!0,description:"Spiral from the top left corner inward; false spirals from the center outward, ending at the top left corner"},clockwise:{type:"bool",default:!0,description:"Turn clockwise; false turns counterclockwise"},smoothness:{type:"float",default:.05,min:0,max:.5,description:"Duration of each block's fade, as a fraction of the transition"}},textures:[],createdAt:"Wed, 4 Nov 2026 20:58:21 +0100",updatedAt:"Wed, 4 Nov 2026 20:58:21 +0100"},{name:"SpiralWipe",paramsTypes:{turns:"float",smoothness:"float",clockwise:"bool"},defaultParams:{turns:3,smoothness:.05,clockwise:!0},glsl:`// Author: gre
// License: MIT
// Description: A spiral arm winds out from the center and widens to reveal the incoming image
// Tags: shape, wipe, radial

#define PI 3.141592653589793

// @range(2, 8) Number of turns of the spiral
uniform float turns; // = 3.0
// @range(0, 0.5) Softness of the arm's edges
uniform float smoothness; // = 0.05
// @param Wind clockwise; false winds counterclockwise
uniform bool clockwise; // = true

// Coverage of the arm turn at position s (in turns along the spiral), d away from its middle line
float arm (float s, float d) {
  // The tip reaches the frame's corners at 60% of the transition, and the whole arm widens until the end
  float end = -0.5 + (turns + 0.5) / 0.6;
  float tip = mix(-0.5, end, progress);
  s = max(s, -0.5);
  float width = sqrt(clamp((tip - s) / max(end - s, 0.001), 0.0, 1.0));
  // Edge softness in arm widths, at least a pixel wide
  float e = smoothness + 0.005 * turns;
  return smoothstep(0.0, e, width * (0.5 + e) - d);
}

vec4 transition (vec2 uv) {
  // Square pixels, normalized so the frame's corners are at distance 1
  vec2 q = (uv - 0.5) * vec2(ratio, 1.0) / (0.5 * length(vec2(ratio, 1.0)));
  // Fraction of a turn, starting at the top
  float a = dot(q, q) < 1e-12 ? 0.0 : atan(q.x, q.y) / (2.0 * PI);
  a = fract(clockwise ? a : -a);
  // Radius in turns of the spiral, and the arm turn the point is in
  float w = length(q) * turns - a;
  float n = floor(w);
  float f = w - n;
  // The arm turns around it can overlap it near the edges
  float m = max(arm(n + a, abs(f - 0.5)), max(arm(n + 1.0 + a, 1.5 - f), arm(n - 1.0 + a, f + 0.5)));
  return mix(getFromColor(uv), getToColor(uv), m);
}
`,author:"gre",license:"MIT",description:"A spiral arm winds out from the center and widens to reveal the incoming image",tags:["shape","wipe","radial"],params:{turns:{type:"float",default:3,min:2,max:8,description:"Number of turns of the spiral"},smoothness:{type:"float",default:.05,min:0,max:.5,description:"Softness of the arm's edges"},clockwise:{type:"bool",default:!0,description:"Wind clockwise; false winds counterclockwise"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:17:51 +0100",updatedAt:"Sat, 31 Oct 2026 18:17:51 +0100"},{name:"SplatterWipe",paramsTypes:{splats:"float",spikiness:"float",droplets:"float",drips:"float",rim:"float",seed:"float"},defaultParams:{splats:4,spikiness:.6,droplets:.6,drips:.5,rim:.5,seed:3},glsl:`// Author: gre
// License: MIT
// Description: Splats of paint land one after another, each popping in with a spiky outline, flung droplets and a few drips running down, revealing the incoming image until they cover the frame
// Tags: paint, splash, organic, reveal

// @range(2, 10, 1) Number of splats across the frame
uniform float splats; // = 4.0
// @range(0, 1) How long the spikes around each splat are
uniform float spikiness; // = 0.6
// @range(0, 1) How many droplets are flung around each splat
uniform float droplets; // = 0.6
// @range(0, 1) How far the paint drips run down
uniform float drips; // = 0.5
// @range(0, 1) How dark and glossy the rim of the splats is
uniform float rim; // = 0.5
// @param Random seed for the splats
uniform float seed; // = 3.0

const float PI = 3.141592653589793;
// number of spikes around a splat
const float SPIKES = 14.0;
// furthest reach of the shapes of a splat from its center, in cells. Splats are looked for in the 3x3 cells
// around a pixel, and the center of a splat 2 cells away is more than 1.35 cells away; on top of REACH, the
// smooth unions add up to 0.02 and the antialiasing 0.025 (at 10 splats), which leaves a margin of 0.055
// so that no splat is ever cut by the search
const float REACH = 1.25;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

// smooth noise around a splat, wrapping over a full turn (t in 0..1)
float turnNoise(float t, float n, vec2 key) {
  float x = t * n;
  float i = floor(x);
  float f = x - i;
  float a = hash12(key + vec2(mod(i, n), 61.0));
  float b = hash12(key + vec2(mod(i + 1.0, n), 61.0));
  return mix(a, b, f * f * (3.0 - 2.0 * f));
}

// smooth union of two signed distances (> 0 inside)
float smax(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return max(a, b) + h * h * k * 0.25;
}

// signed distance (approximately, in cells, > 0 inside) to the splat of a grid cell
float splat(vec2 q, vec2 cell, vec2 key) {
  float t0 = 0.01 + 0.6 * hash12(key + vec2(3.0, 0.0)); // when it lands
  if (progress <= t0) return -1.0;
  vec2 c = cell + 0.5 + 0.3 * (vec2(hash12(key + vec2(5.0, 1.0)), hash12(key + vec2(9.0, 2.0))) - 0.5);
  vec2 d = q - c;
  float l = length(d);
  // nothing of the splat reaches this far (its distance there would be below -0.08 anyway)
  if (l > REACH + 0.1) return -1.0;
  // a fast pop-in, then the paint slowly spreads until it covers its whole cell
  float pop = clamp((progress - t0) / 0.08, 0.0, 1.0);
  pop = 1.0 - (1.0 - pop) * (1.0 - pop) * (1.0 - pop);
  float x = clamp((progress - t0) / (0.96 - t0), 0.0, 1.0);
  float grow = x * x * x;
  float r0 = 0.42 + 0.2 * hash12(key + vec2(11.0, 3.0));
  // the farthest corner of the cell is at most 0.65 * sqrt(2) ~ 0.92 cells away, and the body dents by 6% at most in the end
  float rc = mix(r0 * pop, 1.03, grow);

  float a = l > 1e-5 ? atan(d.y, d.x) / (2.0 * PI) + 0.5 : 0.0;
  // an irregular body
  float lumps = mix(0.3, 0.06, grow) * (turnNoise(a, 5.0, key) - 0.5) + mix(0.18, 0.06, grow) * (turnNoise(a, 19.0, key + 3.0) - 0.5);
  float f = rc * (1.0 + lumps) - l;

  // a spike in each slice of the turn: a ray that tapers from a wide base, the long ones ending in a bead;
  // the slices on both sides are looked at too, as their spikes can lean over the boundary
  float s = floor(a * SPIKES);
  float spike = -1.0;
  for (int k = -1; k <= 1; k++) {
    float sl = s + float(k);
    vec2 sk = key + vec2(mod(sl, SPIKES), 17.0);
    float h = hash12(sk);
    float w0 = (0.022 + 0.03 * hash12(sk + 1.5)) * pop;
    float len = max(min(spikiness * (0.06 + 0.6 * h * h) * pop, REACH - 1.2 * w0 - rc), 0.0);
    if (len > 0.0) {
      // short spikes are thin too, so that no spikiness leaves a clean body
      float w = w0 * min(len / 0.06, 1.0);
      float ang = (sl + 0.5 + 0.4 * (hash12(sk + 0.5) - 0.5)) / SPIKES * 2.0 * PI - PI;
      vec2 dir = vec2(cos(ang), sin(ang));
      float along = dot(d, dir);
      float across = abs(d.x * dir.y - d.y * dir.x);
      float u = clamp((along - rc) / len, 0.0, 1.0);
      float ray = min(w * (1.0 - 0.7 * u) - across, rc + len - along);
      if (h > 0.5) ray = max(ray, w * 1.2 - length(d - dir * (rc + len)));
      spike = max(spike, ray);
    }
  }
  f = smax(f, spike, 0.08);

  // droplets flung out around the splat
  for (int j = 0; j < 5; j++) {
    vec2 dk = key + vec2(float(j), 29.0);
    float hr = hash12(dk + 0.5);
    float rad = (0.015 + 0.05 * hr * hr) * clamp(droplets * 5.0 - float(j), 0.0, 1.0) * pop;
    if (rad > 0.0) {
      float da = 2.0 * PI * hash12(dk);
      float dist = min(r0 + 0.08 + 0.5 * hash12(dk + 1.5), REACH - rad) * mix(0.5, 1.0, pop);
      f = max(f, rad - length(d - dist * vec2(cos(da), sin(da))));
    }
  }

  // drips running down from the bottom of the splat
  if (drips > 0.0) {
    float run = clamp((progress - t0 - 0.03) / 0.45, 0.0, 1.0);
    run = run * (2.0 - run);
    for (int j = 0; j < 2; j++) {
      vec2 dk = key + vec2(float(j), 43.0);
      float xo = (hash12(dk) - 0.5) * r0;
      float dw = (0.03 + 0.02 * hash12(dk + 0.5)) * pop;
      float top = sqrt(r0 * r0 - xo * xo) * pop;
      float bottom = min(top + drips * (0.25 + 0.75 * hash12(dk + 1.5)) * run, sqrt(REACH * REACH - xo * xo) - 1.6 * dw);
      float dx = abs(d.x - xo);
      float drip = min(dw - dx, min(d.y + bottom, -d.y));
      float tip = dw * 1.4 - length(vec2(dx, d.y + bottom + 0.2 * dw));
      f = smax(f, max(drip, tip), 0.05);
    }
  }
  return f;
}

vec4 transition(vec2 uv) {
  float n = max(1.0, floor(splats + 0.5));
  float cellSize = max(ratio, 1.0) / n;
  vec2 q = vec2(uv.x * ratio, uv.y) / cellSize; // in cells
  vec2 base = floor(q);
  vec2 sd = seed * vec2(7.0, 13.0);
  float f = -1.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 cell = base + vec2(float(i), float(j));
      f = max(f, splat(q, cell, cell + sd));
    }
  }
  float aa = 0.0025 / cellSize; // about a pixel or two, in cells
  float inside = smoothstep(-aa, aa, f);
  vec4 from = getFromColor(uv);
  vec4 to = getToColor(uv);
  // thick paint: a darker rim with a thin glossy line just inside it, gone once the frame is covered
  float e = clamp(f / 0.045, 0.0, 1.0);
  float amount = rim * (1.0 - smoothstep(0.75, 1.0, progress));
  float dark = (1.0 - e) * (1.0 - e) * 0.6;
  float gloss = smoothstep(0.2, 0.4, e) * (1.0 - smoothstep(0.4, 0.7, e)) * 0.3;
  to.rgb = mix(to.rgb * (1.0 - dark * amount), vec3(1.0), gloss * amount * to.a);
  return mix(from, to, inside);
}
`,author:"gre",license:"MIT",description:"Splats of paint land one after another, each popping in with a spiky outline, flung droplets and a few drips running down, revealing the incoming image until they cover the frame",tags:["paint","splash","organic","reveal"],params:{splats:{type:"float",default:4,min:2,max:10,step:1,description:"Number of splats across the frame"},spikiness:{type:"float",default:.6,min:0,max:1,description:"How long the spikes around each splat are"},droplets:{type:"float",default:.6,min:0,max:1,description:"How many droplets are flung around each splat"},drips:{type:"float",default:.5,min:0,max:1,description:"How far the paint drips run down"},rim:{type:"float",default:.5,min:0,max:1,description:"How dark and glossy the rim of the splats is"},seed:{type:"float",default:3,description:"Random seed for the splats"}},textures:[],createdAt:"Mon, 2 Nov 2026 22:33:20 +0100",updatedAt:"Mon, 2 Nov 2026 22:33:20 +0100"},{name:"SplitFlap",paramsTypes:{size:"ivec2",stagger:"float",randomness:"float",flaps:"int",gap:"float",perspective:"float",shading:"float",background:"vec4"},defaultParams:{size:[8,6],stagger:.6,randomness:.3,flaps:1,gap:.004,perspective:.35,shading:.4,background:[0,0,0,1]},glsl:`// Author: gre
// License: MIT
// Description: The frame becomes a split-flap board: in each cell the top half of the outgoing image flips down on a hinge across the middle, cell after cell, its back bringing the bottom half of the incoming image
// Tags: 3d, flip, grid

// @param Number of cells (columns, rows)
uniform ivec2 size; // = ivec2(8, 6)
// @range(0, 0.9) Delay of the last cell's flip, as a part of the transition
uniform float stagger; // = 0.6
// @range(0, 1) How much the order of the cells is shuffled, from a wave across the board to random
uniform float randomness; // = 0.3
// @range(1, 4, 1) Number of flaps that fall in each cell, the ones before the last showing other parts of the incoming image
uniform int flaps; // = 1
// @range(0, 0.05) Width of the gaps between the cells, as a part of the frame's shorter side (the hinges get half of it)
uniform float gap; // = 0.004
// @range(0, 1) Amount of perspective: the falling flaps grow as they come toward the viewer
uniform float perspective; // = 0.35
// @range(0, 1) How much the flaps darken as they turn away from the light, and the shadows they cast
uniform float shading; // = 0.4
// @color Color seen in the gaps between the cells
uniform vec4 background; // = vec4(0.0, 0.0, 0.0, 1.0)

const float PI = 3.141592653589793;
// width of the anti-aliased edges, as a part of the frame's shorter side
const float EDGE = 0.001;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

// the cell's flip, 0 to 1
float cellTime(vec2 cell, vec2 grid) {
  float wave = (cell.x + 0.5 * (grid.y - 1.0 - cell.y)) / max(grid.x - 1.0 + 0.5 * (grid.y - 1.0), 1.0);
  float order = mix(wave, hash12(cell + 17.0), randomness);
  float delay = clamp(stagger, 0.0, 0.99);
  return clamp((progress - order * delay) / (1.0 - delay), 0.0, 1.0);
}

// the card on the front of the falling flap, at the cell's flip t
float flapIndex(float t, float n) {
  return min(floor(t * n), n - 1.0);
}

// the falling flap's angle, 0 upright to PI down: it starts gently and lands fast
float flapAngle(float t, float n) {
  float u = t * n - flapIndex(t, n);
  return PI * u * (0.3 + 0.7 * u);
}

// card i of a cell at the point lc of the card: the outgoing image first, the incoming one last,
// and in between the incoming image of another cell
vec4 card(float i, float n, vec2 cell, vec2 grid, vec2 lc) {
  if (i < 0.5) return getFromColor((cell + lc) / grid);
  vec2 src = cell;
  if (i < n - 0.5) src = floor(vec2(hash12(cell * 3.7 + i * 11.3), hash12(cell * 5.3 + i * 7.9 + 1.7)) * grid);
  return getToColor((src + lc) / grid);
}

// 1 inside a half card, 0 in the gaps: x across the card and f the distance from the hinge, in cell sizes
float cardMask(float x, float f, vec2 cellSize, float g) {
  if (g <= 0.0) return 1.0;
  float e = EDGE * min(1.0, g / max(gap, 1e-4));
  // the gap at the hinge is half as wide as the one between the cells
  float d = min(min(x, 1.0 - x) * cellSize.x, min(2.0 * f, 0.5 - f) * cellSize.y);
  return smoothstep(0.5 * g - e, 0.5 * g + e, d);
}

vec4 transition (vec2 uv) {
  vec2 grid = max(vec2(size), 1.0);
  float n = max(float(flaps), 1.0);
  vec2 cellSize = vec2(ratio, 1.0) / grid / min(ratio, 1.0);
  vec2 cell = floor(uv * grid);
  vec2 l = uv * grid - cell;
  // the gaps open at the start and close at the end
  float g = gap * smoothstep(0.0, 0.12, progress) * (1.0 - smoothstep(0.88, 1.0, progress));
  // w: height above the hinge, in cell heights
  float w = l.y - 0.5;
  bool upper = w >= 0.0;

  // the board behind the falling flaps: the top half of the next card once the flap has left it,
  // the bottom half of the current card until the flap has landed on it
  float t = cellTime(cell, grid);
  float k = flapIndex(t, n);
  float a = flapAngle(t, n);
  bool started = t * n > k;
  bool landed = t >= 1.0;
  vec4 color = card(k + (upper ? (started ? 1.0 : 0.0) : (landed ? 1.0 : 0.0)), n, cell, grid, l);
  // shadows of the flap leaning over the top half, then falling onto the bottom half
  if (started && !landed) color.rgb *= 1.0 - 0.45 * shading * max(upper ? cos(a) : -cos(a), 0.0);
  color = mix(background, color, cardMask(l.x, abs(w), cellSize, g));

  // the falling flaps of this cell and of its neighbors, which grow beyond their cells as they come closer
  float nearest = -1.0;
  for (int d = -1; d <= 1; d++) {
    vec2 nc = cell + vec2(float(d), 0.0);
    if (nc.x < 0.0 || nc.x > grid.x - 1.0) continue;
    float nt = d == 0 ? t : cellTime(nc, grid);
    float na = d == 0 ? a : flapAngle(nt, n);
    float fc = cos(na);
    float fs = sin(na);
    // a point at distance f from the hinge is at height f * fc and depth f * fs, nearer points look wider
    if (abs(fc) < 1e-5 || (w >= 0.0) != (fc > 0.0)) continue;
    float f = w / fc;
    if (f > 0.5) continue;
    float z = f * fs;
    if (z <= nearest) continue;
    float lx = 0.5 + (l.x - float(d) - 0.5) * (1.0 - perspective * z);
    if (lx < 0.0 || lx > 1.0) continue;
    bool front = fc > 0.0;
    vec2 lc = vec2(lx, front ? 0.5 + f : 0.5 - f);
    float m = cardMask(lx, f, cellSize, g);
    if (m <= 0.0) continue;
    vec4 img = card(flapIndex(nt, n) + (front ? 0.0 : 1.0), n, nc, grid, lc);
    // lit from above the viewer: the front darkens as it turns down, the back brightens as it lands
    float lambert = (front ? 0.92 * fc - 0.4 * fs : 0.4 * fs - 0.92 * fc) / 0.92;
    img.rgb *= mix(1.0 - shading, 1.0, clamp(lambert, 0.0, 1.0));
    color = mix(color, img, m);
    nearest = z;
  }
  return color;
}
`,author:"gre",license:"MIT",description:"The frame becomes a split-flap board: in each cell the top half of the outgoing image flips down on a hinge across the middle, cell after cell, its back bringing the bottom half of the incoming image",tags:["3d","flip","grid"],params:{size:{type:"ivec2",default:[8,6],description:"Number of cells (columns, rows)"},stagger:{type:"float",default:.6,min:0,max:.9,description:"Delay of the last cell's flip, as a part of the transition"},randomness:{type:"float",default:.3,min:0,max:1,description:"How much the order of the cells is shuffled, from a wave across the board to random"},flaps:{type:"int",default:1,min:1,max:4,step:1,description:"Number of flaps that fall in each cell, the ones before the last showing other parts of the incoming image"},gap:{type:"float",default:.004,min:0,max:.05,description:"Width of the gaps between the cells, as a part of the frame's shorter side (the hinges get half of it)"},perspective:{type:"float",default:.35,min:0,max:1,description:"Amount of perspective: the falling flaps grow as they come toward the viewer"},shading:{type:"float",default:.4,min:0,max:1,description:"How much the flaps darken as they turn away from the light, and the shadows they cast"},background:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color seen in the gaps between the cells"}},textures:[],createdAt:"Fri, 6 Nov 2026 10:06:28 +0100",updatedAt:"Fri, 6 Nov 2026 10:06:28 +0100"},{name:"SplitSlideInHorizontal",paramsTypes:{reverse:"bool"},defaultParams:{reverse:!1},glsl:`// Author: OllyOllyOlly
// License: MIT
// Description: The incoming image slides in as two halves moving horizontally in opposite directions
// Tags: slide, split, horizontal

// @param Swap the directions of the halves
uniform bool reverse; // = false

const vec2 boundMin = vec2(0.0, 0.0);
const vec2 boundMax = vec2(1.0, 1.0);

bool inBounds (vec2 p) {
  return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
}

vec4 transition (vec2 uv) {
  float modifier = reverse ? -1.0 : 1.0;
  vec2 toP = (uv.y > 0.5) ?
    vec2((uv.x - (progress * modifier)) + modifier, uv.y) :
    vec2((uv.x + (progress * modifier)) - modifier, uv.y);

  vec2 fromP = uv;

  return inBounds(toP) ? getToColor(toP) : getFromColor(fromP);
}
`,author:"OllyOllyOlly",license:"MIT",description:"The incoming image slides in as two halves moving horizontally in opposite directions",tags:["slide","split","horizontal"],params:{reverse:{type:"bool",default:!1,description:"Swap the directions of the halves"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"SplitSlideInOutHorizontal",paramsTypes:{reverse:"bool"},defaultParams:{reverse:!1},glsl:`// Author: OllyOllyOlly
// License: MIT
// Description: The halves of both images slide horizontally in opposite directions, out and in at once
// Tags: slide, split, horizontal

// @param Swap the directions of the halves
uniform bool reverse; // = false

const vec2 boundMin = vec2(0.0, 0.0);
const vec2 boundMax = vec2(1.0, 1.0);

bool inBounds (vec2 p) {
  return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
}

vec4 transition (vec2 uv) {
  float modifier = (uv.y > 0.5 ? 1.0 : -1.0) * (reverse ? -1.0 : 1.0) ;
  vec2 fromP = vec2(uv.x + (progress * modifier), uv.y);
  vec2 toP = vec2((uv.x + (progress * modifier)) - modifier, uv.y);

  return inBounds(fromP) ? getFromColor(fromP) : getToColor(toP);
}
`,author:"OllyOllyOlly",license:"MIT",description:"The halves of both images slide horizontally in opposite directions, out and in at once",tags:["slide","split","horizontal"],params:{reverse:{type:"bool",default:!1,description:"Swap the directions of the halves"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"SplitSlideInOutVertical",paramsTypes:{reverse:"bool"},defaultParams:{reverse:!1},glsl:`// Author: OllyOllyOlly
// License: MIT
// Description: The halves of both images slide vertically in opposite directions, out and in at once
// Tags: slide, split, vertical

// @param Swap the directions of the halves
uniform bool reverse; // = false

const vec2 boundMin = vec2(0.0, 0.0);
const vec2 boundMax = vec2(1.0, 1.0);

bool inBounds (vec2 p) {
  return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
}

vec4 transition (vec2 uv) {
  float modifier = (uv.x > 0.5 ? 1.0 : -1.0) * (reverse ? -1.0 : 1.0) ;
  vec2 fromP = vec2(uv.x, uv.y + (progress * modifier));
  vec2 toP = vec2(uv.x, (uv.y + (progress * modifier)) - modifier);

  return inBounds(fromP) ? getFromColor(fromP) : getToColor(toP);
}
`,author:"OllyOllyOlly",license:"MIT",description:"The halves of both images slide vertically in opposite directions, out and in at once",tags:["slide","split","vertical"],params:{reverse:{type:"bool",default:!1,description:"Swap the directions of the halves"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"SplitSlideInVertical",paramsTypes:{reverse:"bool"},defaultParams:{reverse:!1},glsl:`// Author: OllyOllyOlly
// License: MIT
// Description: The incoming image slides in as two halves moving vertically in opposite directions
// Tags: slide, split, vertical

// @param Swap the directions of the halves
uniform bool reverse; // = false

const vec2 boundMin = vec2(0.0, 0.0);
const vec2 boundMax = vec2(1.0, 1.0);

bool inBounds (vec2 p) {
  return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
}

vec4 transition (vec2 uv) {
  float modifier = reverse ? -1.0 : 1.0;
  vec2 p = (uv.x > 0.5) ?
    vec2(uv.x, (uv.y - (progress * modifier)) + modifier) :
    vec2(uv.x, (uv.y + (progress * modifier)) - modifier);

  return inBounds(p) ? getToColor(p) : getFromColor(uv);
}
`,author:"OllyOllyOlly",license:"MIT",description:"The incoming image slides in as two halves moving vertically in opposite directions",tags:["slide","split","vertical"],params:{reverse:{type:"bool",default:!1,description:"Swap the directions of the halves"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"SplitSlideOutHorizontal",paramsTypes:{reverse:"bool"},defaultParams:{reverse:!1},glsl:`// Author: OllyOllyOlly
// License: MIT
// Description: The outgoing image slides out as two halves moving horizontally in opposite directions
// Tags: slide, split, horizontal

// @param Swap the directions of the halves
uniform bool reverse; // = false

const vec2 boundMin = vec2(0.0, 0.0);
const vec2 boundMax = vec2(1.0, 1.0);

bool inBounds (vec2 p) {
  return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
}

vec4 transition (vec2 uv) {
  float modifier = (uv.y > 0.5 ? 1.0 : -1.0) * (reverse ? -1.0 : 1.0) ;
  vec2 p = vec2(uv.x + (progress * modifier), uv.y);

  return inBounds(p) ? getFromColor(p) : getToColor(uv);
}
`,author:"OllyOllyOlly",license:"MIT",description:"The outgoing image slides out as two halves moving horizontally in opposite directions",tags:["slide","split","horizontal"],params:{reverse:{type:"bool",default:!1,description:"Swap the directions of the halves"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"SplitSlideOutVertical",paramsTypes:{reverse:"bool"},defaultParams:{reverse:!1},glsl:`// Author: OllyOllyOlly
// License: MIT
// Description: The outgoing image slides out as two halves moving vertically in opposite directions
// Tags: slide, split, vertical

// @param Swap the directions of the halves
uniform bool reverse; // = false

const vec2 boundMin = vec2(0.0, 0.0);
const vec2 boundMax = vec2(1.0, 1.0);

bool inBounds (vec2 p) {
  return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
}

vec4 transition (vec2 uv) {
  float modifier = (uv.x > 0.5 ? 1.0 : -1.0) * (reverse ? -1.0 : 1.0) ;
  vec2 p = vec2(uv.x, uv.y + (progress * modifier));

  return inBounds(p) ? getFromColor(p) : getToColor(uv);
}
`,author:"OllyOllyOlly",license:"MIT",description:"The outgoing image slides out as two halves moving vertically in opposite directions",tags:["slide","split","vertical"],params:{reverse:{type:"bool",default:!1,description:"Swap the directions of the halves"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"SpotlightWipe",paramsTypes:{center:"vec2",size:"float",darkness:"float",warmth:"vec3"},defaultParams:{center:[.5,.5],size:.3,darkness:.85,warmth:[1,.93,.8]},glsl:`// Author: gre
// License: MIT
// Description: The stage lights go down on the outgoing image and a soft oval spotlight searches across it along a curved path, comes to rest and lights the incoming image inside it, then widens until the stage lights come back up on the incoming image
// Tags: light, spotlight, stage, iris, reveal

// @param Point where the spotlight comes to rest and opens from
uniform vec2 center; // = vec2(0.5, 0.5)
// @range(0.08, 0.45) Width of the spotlight while it searches, in frame heights
uniform float size; // = 0.3
// @range(0, 1) How dark the stage gets around the spotlight
uniform float darkness; // = 0.85
// @color Tint of the spotlight
uniform vec3 warmth; // = vec3(1.0, 0.93, 0.8)

// height of the oval over its width: a cone of light hitting a stage seen at an angle
const float FLAT = 0.72;
// distance to the spotlight's center, in oval radii, inside which the incoming image is fully lit
const float LIT = 0.74;

// a point of the curved path the spotlight searches along, from the lower left to its resting point
vec2 path(float t, vec2 c) {
  vec2 a = vec2(0.08, 0.3);
  vec2 b = vec2(0.35, 1.15);
  vec2 d = vec2(1.05, 0.95);
  float s = 1.0 - t;
  return s * s * s * a + 3.0 * s * s * t * b + 3.0 * s * t * t * d + t * t * t * c;
}

vec4 transition(vec2 uv) {
  vec2 asp = vec2(ratio, 1.0);
  float p = progress;

  // the spotlight slides along its path and eases to rest, its last few steps overlapping the start
  // of its widening so the motion never stops
  float t = clamp(p / 0.5, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec2 c = path(t, center);

  // it widens until its lit core covers the farthest corner of the frame
  vec2 far = max(center, 1.0 - center) * asp;
  float full = length(vec2(far.x, far.y / FLAT)) / LIT;
  float g = smoothstep(0.44, 1.0, p);
  float radius = mix(0.5 * size, full, g * (0.3 + 0.7 * g));

  // distance to the spotlight's center, 1 on the oval's edge
  vec2 q = (uv - c) * asp;
  float r = length(vec2(q.x, q.y / FLAT)) / radius;

  // light of the spotlight: a flat core, a soft penumbra, a slightly brighter rim and a faint spill
  float core = 1.0 - smoothstep(0.72, 1.08, r);
  float ring = (r - 0.9) / 0.09;
  float spot = max(core * (1.0 - 0.1 * r * r), 0.12 * (1.0 - smoothstep(0.9, 2.4, r))) + 0.16 * exp(-ring * ring);

  // the stage lights go down at the start and come back up at the end
  float s = darkness * smoothstep(0.0, 0.18, p) * (1.0 - smoothstep(0.72, 1.0, p));
  vec3 light = 1.0 - s + s * spot * warmth;

  // as it comes to rest, the spotlight lights the incoming image inside it
  float lit = smoothstep(0.42, 0.58, p) * (1.0 - smoothstep(LIT, 1.0, r));
  vec4 col = mix(getFromColor(uv), getToColor(uv), lit);
  return vec4(col.rgb * light, col.a);
}
`,author:"gre",license:"MIT",description:"The stage lights go down on the outgoing image and a soft oval spotlight searches across it along a curved path, comes to rest and lights the incoming image inside it, then widens until the stage lights come back up on the incoming image",tags:["light","spotlight","stage","iris","reveal"],params:{center:{type:"vec2",default:[.5,.5],description:"Point where the spotlight comes to rest and opens from"},size:{type:"float",default:.3,min:.08,max:.45,description:"Width of the spotlight while it searches, in frame heights"},darkness:{type:"float",default:.85,min:0,max:1,description:"How dark the stage gets around the spotlight"},warmth:{type:"vec3",default:[1,.93,.8],color:!0,description:"Tint of the spotlight"}},textures:[],createdAt:"Sun, 8 Nov 2026 21:30:20 +0100",updatedAt:"Sun, 8 Nov 2026 21:30:20 +0100"},{name:"SquaresWipe",paramsTypes:{squares:"ivec2",direction:"vec2",smoothness:"float"},defaultParams:{squares:[10,10],direction:[1,-.5],smoothness:1.6},glsl:`// Author: gre
// License: MIT
// Description: Squares grow along a diagonal sweep to reveal the incoming image
// Tags: squares, grid, wipe, directional
 
// @param Number of squares (columns, rows)
uniform ivec2 squares;// = ivec2(10,10)
// @param Direction of the sweep
uniform vec2 direction;// = vec2(1.0, -0.5)
// @param Softness of the sweep
uniform float smoothness; // = 1.6

const vec2 center = vec2(0.5, 0.5);
vec4 transition (vec2 p) {
  vec2 v = normalize(direction);
  v /= abs(v.x)+abs(v.y);
  float d = v.x * center.x + v.y * center.y;
  float offset = smoothness;
  float pr = smoothstep(-offset, 0.0, v.x * p.x + v.y * p.y - (d-0.5+progress*(1.+offset)));
  vec2 squarep = fract(p*vec2(squares));
  vec2 squaremin = vec2(pr/2.0);
  vec2 squaremax = vec2(1.0 - pr/2.0);
  float a = (1.0 - step(progress, 0.0)) * step(squaremin.x, squarep.x) * step(squaremin.y, squarep.y) * step(squarep.x, squaremax.x) * step(squarep.y, squaremax.y);
  return mix(getFromColor(p), getToColor(p), a);
}
`,author:"gre",license:"MIT",description:"Squares grow along a diagonal sweep to reveal the incoming image",tags:["squares","grid","wipe","directional"],params:{squares:{type:"ivec2",default:[10,10],description:"Number of squares (columns, rows)"},direction:{type:"vec2",default:[1,-.5],description:"Direction of the sweep"},smoothness:{type:"float",default:1.6,description:"Softness of the sweep"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"Squeeze",paramsTypes:{colorSeparation:"float"},defaultParams:{colorSeparation:.04},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image is squeezed into a line with color separation, revealing the incoming one
// Tags: squeeze, chromatic, vertical
 
// @param Amount of color separation
uniform float colorSeparation; // = 0.04
 
vec4 transition (vec2 uv) {
  float y = 0.5 + (uv.y-0.5) / (1.0-progress);
  if (y < 0.0 || y > 1.0) {
     return getToColor(uv);
  }
  else {
    vec2 fp = vec2(uv.x, y);
    vec2 off = progress * vec2(0.0, colorSeparation);
    vec4 c = getFromColor(fp);
    vec4 cn = getFromColor(fp - off);
    vec4 cp = getFromColor(fp + off);
    return vec4(cn.r, c.g, cp.b, c.a);
  }
}
`,author:"gre",license:"MIT",description:"The outgoing image is squeezed into a line with color separation, revealing the incoming one",tags:["squeeze","chromatic","vertical"],params:{colorSeparation:{type:"float",default:.04,description:"Amount of color separation"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"StarWipe",paramsTypes:{border_thickness:"float",star_rotation:"float",border_color:"vec4",star_center:"vec2"},defaultParams:{border_thickness:.01,star_rotation:.75,border_color:[1,1,1,1],star_center:[.5,.5]},glsl:`// Author: Ben Lucas
// License: MIT
// Description: A growing star reveals the incoming image
// Tags: wipe, shape, star
#define PI 3.141592653589793
#define STAR_ANGLE 1.2566370614359172

// @param Thickness of the star's border
uniform float border_thickness;// = 0.01
uniform float star_rotation;// = 0.75
// @color Color of the star's border
uniform vec4 border_color; // = vec4(1.0)
// @param Center of the star
uniform vec2 star_center;// = vec2(0.5)

vec2 rotate(vec2 v, float theta) {
    float cosTheta = cos(theta);
    float sinTheta = sin(theta);

    return vec2(
        cosTheta * v.x - sinTheta * v.y,
        sinTheta * v.x + cosTheta * v.y
    );
}

bool inStar(vec2 uv, vec2 center, float radius){
  vec2 uv_centered = uv - center;
  uv_centered = rotate(uv_centered, star_rotation * STAR_ANGLE);
  float theta = atan(uv_centered.y, uv_centered.x) + PI;

  vec2 uv_rotated = rotate(uv_centered, -STAR_ANGLE * (floor(theta / STAR_ANGLE) + 0.5));

  float slope = 0.3;
  if(uv_rotated.y > 0.0){
      return (radius + uv_rotated.x * slope > uv_rotated.y);
  } else {
     return (-radius - uv_rotated.x * slope < uv_rotated.y);
  }
}

vec4 transition (vec2 uv) {
  float progressScaled = (2.0 * border_thickness + 1.0) * progress - border_thickness;
  if(inStar(uv, star_center, progressScaled)){
    return getToColor(uv);
  } else if(inStar(uv, star_center, progressScaled+border_thickness)){
    return border_color;
  } else {
    return getFromColor(uv);
  }
}
`,author:"Ben Lucas",license:"MIT",description:"A growing star reveals the incoming image",tags:["wipe","shape","star"],params:{border_thickness:{type:"float",default:.01,description:"Thickness of the star's border"},star_rotation:{type:"float",default:.75},border_color:{type:"vec4",default:[1,1,1,1],color:!0,description:"Color of the star's border"},star_center:{type:"vec2",default:[.5,.5],description:"Center of the star"}},textures:[],createdAt:"Wed, 1 Apr 2026 10:31:54 -0700",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"StaticFade",paramsTypes:{n_noise_pixels:"float",static_luminosity:"float"},defaultParams:{n_noise_pixels:200,static_luminosity:.8},glsl:`// Author: Ben Lucas
// License: MIT
// Description: Cuts to the incoming image halfway, hidden behind a burst of TV static
// Tags: static, noise, retro

uniform float n_noise_pixels ; // = 200.0
uniform float static_luminosity ; // = 0.8

float rnd (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(10.5302340293,70.23492931)))*
        12345.5453123);
}

vec4 staticNoise (vec2 st, float offset, float luminosity, float alpha) {
  float staticR = luminosity * rnd(st * vec2(offset * 2.0, offset * 3.0));
  float staticG = luminosity * rnd(st * vec2(offset * 3.0, offset * 5.0));
  float staticB = luminosity * rnd(st * vec2(offset * 5.0, offset * 7.0));
  return vec4(staticR, staticG, staticB, alpha);
}

float staticIntensity(float t)
{
  float transitionProgress = abs(2.0*(t-0.5));
  float transformedThreshold =1.2*(1.0 - transitionProgress)-0.1;
  return min(1.0, transformedThreshold);
}
  
vec4 transition (vec2 uv) {

  float baseMix = step(0.5, progress);
  vec4 transitionMix = mix(
    getFromColor(uv),
    getToColor(uv),
    baseMix
  );
  
  vec2 uvStatic = floor(uv * n_noise_pixels)/n_noise_pixels;
  
  vec4 staticColor = staticNoise(uvStatic, progress, static_luminosity, transitionMix.a); // static where the image is

  float staticThresh = staticIntensity(progress);
  float staticMix = step(rnd(uvStatic), staticThresh);

  return mix(transitionMix, staticColor, staticMix);
}
`,author:"Ben Lucas",license:"MIT",description:"Cuts to the incoming image halfway, hidden behind a burst of TV static",tags:["static","noise","retro"],params:{n_noise_pixels:{type:"float",default:200},static_luminosity:{type:"float",default:.8}},textures:[],createdAt:"Fri, 2 Jun 2023 04:27:43 -0400",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"StaticWipe",paramsTypes:{u_transitionUpToDown:"bool",u_max_static_span:"float"},defaultParams:{u_transitionUpToDown:!0,u_max_static_span:.5},glsl:`// Author: Ben Lucas
// License: MIT
// Description: A wipe from top to bottom with a band of TV static at its edge
// Tags: wipe, static, noise, vertical

#define PI 3.14159265359

float rnd (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(10,70)))*
        12345.5453123);
}

// @param Wipe from top to bottom; false wipes from bottom to top
uniform bool u_transitionUpToDown; // = true
// @param Maximum height of the static band
uniform float u_max_static_span; // = 0.5

vec4 transition (vec2 uv) {
  

  float span = u_max_static_span*pow(sin(PI*progress),0.5);
  
  float transitionEdge = u_transitionUpToDown ? 1.0-uv.y : uv.y;
  float mixRatio = 1.0 - step(progress, transitionEdge);

  vec4 transitionMix = mix(
    getFromColor(uv),
    getToColor(uv),
    mixRatio
  );
  
  float noiseEnvelope = smoothstep(progress-span, progress, transitionEdge) * (1.0 - smoothstep(progress, progress + span, transitionEdge));
  vec4 noise = vec4(vec3(rnd(uv*(1.0+progress))), transitionMix.a); // static where the image is
  

  return mix(transitionMix, noise, noiseEnvelope);
}
`,author:"Ben Lucas",license:"MIT",description:"A wipe from top to bottom with a band of TV static at its edge",tags:["wipe","static","noise","vertical"],params:{u_transitionUpToDown:{type:"bool",default:!0,description:"Wipe from top to bottom; false wipes from bottom to top"},u_max_static_span:{type:"float",default:.5,description:"Maximum height of the static band"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"StereoViewer",paramsTypes:{zoom:"float",corner_radius:"float"},defaultParams:{zoom:.88,corner_radius:.22},glsl:`// Tunable parameters
// How much to zoom (out) for the effect ~ 0.5 - 1.0
// @range(0.5, 1) How much the images zoom out
uniform float zoom; // = 0.88
// Corner radius as a fraction of the image height
uniform float corner_radius;  // = 0.22

// Author: Ted Schundler
// License: BSD 2 Clause
// Description: Both images shrink into rounded cards that swap, like a stereo viewer toy
// Tags: cards, zoom, retro
// Free for use and modification by anyone with credit

// Copyright (c) 2016, Theodore K Schundler
// All rights reserved.

// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

// 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

// 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

///////////////////////////////////////////////////////////////////////////////
// Stereo Viewer Toy Transition                                              //
//                                                                           //
// Inspired by ViewMaster / Image3D image viewer devices.                    //
// This effect is similar to what you see when you press the device's lever. //
// There is a quick zoom in / out to make the transition 'valid' for GLSL.io //
///////////////////////////////////////////////////////////////////////////////

const vec4 black = vec4(0.0); // where no image is drawn: transparent
const vec2 c00 = vec2(0.0, 0.0); // the four corner points
const vec2 c01 = vec2(0.0, 1.0);
const vec2 c11 = vec2(1.0, 1.0);
const vec2 c10 = vec2(1.0, 0.0);

// Check if a point is within a given corner
bool in_corner(vec2 p, vec2 corner, vec2 radius) {
  // determine the direction we want to be filled
  vec2 axis = (c11 - corner) - corner;

  // warp the point so we are always testing the bottom left point with the
  // circle centered on the origin
  p = p - (corner + axis * radius);
  p *= axis / radius;
  return (p.x > 0.0 && p.y > -1.0) || (p.y > 0.0 && p.x > -1.0) || dot(p, p) < 1.0;
}

// Check all four corners
// return a float for v2 for anti-aliasing?
bool test_rounded_mask(vec2 p, vec2 corner_size) {
  return
      in_corner(p, c00, corner_size) &&
      in_corner(p, c01, corner_size) &&
      in_corner(p, c10, corner_size) &&
      in_corner(p, c11, corner_size);
}

// Screen blend mode - https://en.wikipedia.org/wiki/Blend_modes
// This more closely approximates what you see than linear blending
vec4 screen(vec4 a, vec4 b) {
  return 1.0 - (1.0 - a) * (1.0 -b);
}

// Given RGBA, find a value that when screened with itself
// will yield the original value.
vec4 unscreen(vec4 c) {
  return 1.0 - sqrt(1.0 - c);
}

// Grab a pixel, only if it isn't masked out by the rounded corners
vec4 sample_with_corners_from(vec2 p, vec2 corner_size) {
  p = (p - 0.5) / zoom + 0.5;
  if (!test_rounded_mask(p, corner_size)) {
    return black;
  }
  return unscreen(getFromColor(p));
}

vec4 sample_with_corners_to(vec2 p, vec2 corner_size) {
  p = (p - 0.5) / zoom + 0.5;
  if (!test_rounded_mask(p, corner_size)) {
    return black;
  }
  return unscreen(getToColor(p));
}

// special sampling used when zooming - extra zoom parameter and don't unscreen
vec4 simple_sample_with_corners_from(vec2 p, vec2 corner_size, float zoom_amt) {
  p = (p - 0.5) / (1.0 - zoom_amt + zoom * zoom_amt) + 0.5;
  if (!test_rounded_mask(p, corner_size)) {
    return black;
  }
  return getFromColor(p);
}

vec4 simple_sample_with_corners_to(vec2 p, vec2 corner_size, float zoom_amt) {
  p = (p - 0.5) / (1.0 - zoom_amt + zoom * zoom_amt) + 0.5;
  if (!test_rounded_mask(p, corner_size)) {
    return black;
  }
  return getToColor(p);
}

// Basic 2D affine transform matrix helpers
// These really shouldn't be used in a fragment shader - I should work out the
// the math for a translate & rotate function as a pair of dot products instead

mat3 rotate2d(float angle, float ratio) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    c, s ,0.0,
    -s, c, 0.0,
    0.0, 0.0, 1.0);
}

mat3 translate2d(float x, float y) {
  return mat3(
    1.0, 0.0, 0,
    0.0, 1.0, 0,
    -x, -y, 1.0);
}

mat3 scale2d(float x, float y) {
  return mat3(
    x, 0.0, 0,
    0.0, y, 0,
    0, 0, 1.0);
}

// Split an image and rotate one up and one down along off screen pivot points
vec4 get_cross_rotated(vec3 p3, float angle, vec2 corner_size, float ratio) {
  angle = angle * angle; // easing
  angle /= 2.4; // works out to be a good number of radians

  mat3 center_and_scale = translate2d(-0.5, -0.5) * scale2d(1.0, ratio);
  mat3 unscale_and_uncenter = scale2d(1.0, 1.0/ratio) * translate2d(0.5,0.5);
  mat3 slide_left = translate2d(-2.0,0.0);
  mat3 slide_right = translate2d(2.0,0.0);
  mat3 rotate = rotate2d(angle, ratio);

  mat3 op_a = center_and_scale * slide_right * rotate * slide_left * unscale_and_uncenter;
  mat3 op_b = center_and_scale * slide_left * rotate * slide_right * unscale_and_uncenter;

  vec4 a = sample_with_corners_from((op_a * p3).xy, corner_size);
  vec4 b = sample_with_corners_from((op_b * p3).xy, corner_size);

  return screen(a, b);
}

// Image stays put, but this time move two masks
vec4 get_cross_masked(vec3 p3, float angle, vec2 corner_size, float ratio) {
  angle = 1.0 - angle;
  angle = angle * angle; // easing
  angle /= 2.4;

  vec4 img;

  mat3 center_and_scale = translate2d(-0.5, -0.5) * scale2d(1.0, ratio);
  mat3 unscale_and_uncenter = scale2d(1.0 / zoom, 1.0 / (zoom * ratio)) * translate2d(0.5,0.5);
  mat3 slide_left = translate2d(-2.0,0.0);
  mat3 slide_right = translate2d(2.0,0.0);
  mat3 rotate = rotate2d(angle, ratio);

  mat3 op_a = center_and_scale * slide_right * rotate * slide_left * unscale_and_uncenter;
  mat3 op_b = center_and_scale * slide_left * rotate * slide_right * unscale_and_uncenter;

  bool mask_a = test_rounded_mask((op_a * p3).xy, corner_size);
  bool mask_b = test_rounded_mask((op_b * p3).xy, corner_size);

  if (mask_a || mask_b) {
    img = sample_with_corners_to(p3.xy, corner_size);
    return screen(mask_a ? img : black, mask_b ? img : black);
  } else {
    return black;
  }
}

vec4 transition(vec2 uv) {
  float a;
  vec2 p=uv.xy/vec2(1.0).xy;
  vec3 p3 = vec3(p.xy, 1.0); // for 2D matrix transforms

  // corner is warped to represent to size after mapping to 1.0, 1.0
  vec2 corner_size = vec2(corner_radius / ratio, corner_radius);

  if (progress <= 0.0) {
    // 0.0: start with the base frame always
    return getFromColor(p);
  } else if (progress < 0.1) {
    // 0.0-0.1: zoom out and add rounded corners
    a = progress / 0.1;
    return  simple_sample_with_corners_from(p, corner_size * a, a);
  } else if (progress < 0.48) {
    // 0.1-0.48: Split original image apart
    a = (progress - 0.1)/0.38;
    return get_cross_rotated(p3, a, corner_size, ratio);
  } else if (progress < 0.9) {
    // 0.48-0.52: black
    // 0.52 - 0.9: unmask new image
    return get_cross_masked(p3, (progress - 0.52)/0.38, corner_size, ratio);
  } else if (progress < 1.0) {
    // zoom out and add rounded corners
    a = (1.0 - progress) / 0.1;
    return simple_sample_with_corners_to(p, corner_size * a, a);
  } else {
    // 1.0 end with base frame
    return getToColor(p);
  }
}
`,author:"Ted Schundler",license:"BSD 2 Clause",description:"Both images shrink into rounded cards that swap, like a stereo viewer toy",tags:["cards","zoom","retro"],params:{zoom:{type:"float",default:.88,min:.5,max:1,description:"How much the images zoom out"},corner_radius:{type:"float",default:.22}},textures:[],createdAt:"Tue, 20 Feb 2018 23:20:29 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"StopMotion",paramsTypes:{steps:"int",jitter:"float",shadow:"float",backColor:"vec4",rimColor:"vec4"},defaultParams:{steps:12,jitter:.5,shadow:.5,backColor:[.8,.71,.56,1],rimColor:[.97,.96,.93,1]},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image is a paper cutout that jerks off the frame in choppy stop-motion steps, with a tiny new tilt and offset each step and a drop shadow, while the incoming cutout jerks in the same way and lands
// Tags: stop-motion, paper, cutout, slide, shadow, choppy

// @range(6, 30, 1) Number of held poses during the transition: fewer is choppier
uniform int steps; // = 12
// @range(0, 1) Size of the small random tilt and offset given to the cutouts at each step
uniform float jitter; // = 0.5
// @range(0, 1) Darkness of the drop shadow the cutouts cast
uniform float shadow; // = 0.5
// @color Color of the background behind the cutouts
uniform vec4 backColor; // = vec4(0.80, 0.71, 0.56, 1.0)
// @color Color of the paper rim around the cutouts
uniform vec4 rimColor; // = vec4(0.97, 0.96, 0.93, 1.0)

const float SHRINK = 0.2; // how much smaller the cutouts are than the frame while they move
const float RIM = 0.012; // width of the paper rim around the cutouts, in frame heights
const float RADIUS = 0.006; // corner radius of the cutouts, in frame heights
const float AA = 0.0015; // width of the antialiased edges, in frame heights

// Hoskins' hash of an integer step
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

// signed distance to a rounded box of half size b and corner radius r
float roundedBox(vec2 q, vec2 b, float r) {
  vec2 d = abs(q) - b + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

vec4 premultiply(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

// distance from the center far enough for a cutout of half size h turned by a, and its shadow, to be out of the frame
float offFrame(vec2 h, float a) {
  return 0.5 * ratio + abs(cos(a)) * h.x + abs(sin(a)) * h.y + 0.08;
}

// half size of a cutout scaled by s, with its rim for the lift l
vec2 cutoutSize(float s, float l) {
  return (0.5 * vec2(ratio, 1.0) + RIM * l) * s;
}

// draws over col (premultiplied) a cutout of the outgoing or incoming image, centered at c, turned by a, scaled by s, lifted by l
vec4 drawCutout(vec4 col, vec2 q, vec2 c, float a, float s, float l, bool incoming) {
  vec2 asp = vec2(ratio, 1.0);
  vec2 halfImage = 0.5 * asp;
  vec2 halfCut = halfImage + RIM * l;
  float rad = RADIUS * l;
  float ca = cos(a), sa = sin(a);
  mat2 unrotate = mat2(ca, -sa, sa, ca);

  // the drop shadow, cast down and to the right, softer and further as the cutout is lifted,
  // as dark as the image casting it is opaque
  vec2 rs = unrotate * (q - c - vec2(0.018, -0.026) * l) / s;
  vec2 ss = clamp(rs / asp + 0.5, 0.0, 1.0);
  float sAlpha = max(incoming ? getToColor(ss).a : getFromColor(ss).a, rimColor.a);
  float ds = roundedBox(rs, halfCut, rad) * s;
  float blur = 0.004 + 0.016 * l;
  col.rgb *= 1.0 - clamp(shadow, 0.0, 1.0) * 0.75 * l * sAlpha * (1.0 - smoothstep(-blur, blur, ds));

  vec2 r = unrotate * (q - c) / s;
  float dCut = roundedBox(r, halfCut, rad) * s;
  float dImage = roundedBox(r, halfImage, 0.0) * s;
  float cutCover = clamp(0.5 - dCut / AA, 0.0, 1.0);
  float imageCover = clamp(0.5 - dImage / AA, 0.0, 1.0);
  vec2 st = clamp(r / asp + 0.5, 0.0, 1.0);
  vec4 img = premultiply(incoming ? getToColor(st) : getFromColor(st));
  // the image on its paper rim, laid over what is below
  vec4 cut = mix(premultiply(rimColor), img, imageCover) * cutCover;
  return cut + col * (1.0 - cut.a);
}

vec4 transition(vec2 uv) {
  float n = float(steps < 2 ? 2 : steps);
  // the pose held at this time: the first and last are the full images, held half a step each
  float k = floor(progress * n + 0.5);
  if (k <= 0.0) return getFromColor(uv);
  if (k >= n) return getToColor(uv);

  vec2 q = (uv - 0.5) * vec2(ratio, 1.0);
  float j = clamp(jitter, 0.0, 1.0);

  // the outgoing cutout is picked up off the frame in two poses, then jerked out to the left, faster and faster
  float l0 = min(k / 2.0, 1.0);
  float m0 = clamp((k - 1.0) / (0.45 * n), 0.0, 1.0);
  m0 = m0 * m0 * (0.4 + 0.6 * m0);
  float s0 = 1.0 - SHRINK * l0;
  float a0 = 0.22 * m0 + l0 * j * 0.2 * (hash11(k) - 0.5);
  vec2 c0 = vec2(-offFrame(cutoutSize(s0, l0), a0) * m0, 0.05 * m0 * m0)
    + l0 * j * vec2(0.07 * (hash11(k + 100.0) - 0.5), 0.05 * (hash11(k + 200.0) - 0.5));

  // the incoming cutout is jerked in from the right, slowing down, then laid flat onto the frame in two poses
  float l1 = min((n - k) / 2.0, 1.0);
  float m1 = clamp((n - 2.0 - k) / (0.45 * n), 0.0, 1.0);
  m1 = m1 * m1 * (0.4 + 0.6 * m1);
  float s1 = 1.0 - SHRINK * l1;
  float a1 = -0.25 * m1 + l1 * j * 0.2 * (hash11(k + 300.0) - 0.5);
  vec2 c1 = vec2(offFrame(cutoutSize(s1, l1), a1) * m1, -0.06 * m1 * m1)
    + l1 * j * vec2(0.07 * (hash11(k + 400.0) - 0.5), 0.05 * (hash11(k + 500.0) - 0.5));

  // the background, then the outgoing cutout, then the incoming one on top
  vec4 col = premultiply(backColor);
  if (m0 < 1.0) col = drawCutout(col, q, c0, a0, s0, l0, false);
  if (m1 < 1.0) col = drawCutout(col, q, c1, a1, s1, l1, true);
  if (col.a <= 0.0) return vec4(0.0);
  col.rgb /= col.a;
  // the light dims a little from one shot to the next
  col.rgb *= 1.0 - 0.04 * j * hash11(k + 600.0);
  return col;
}
`,author:"gre",license:"MIT",description:"The outgoing image is a paper cutout that jerks off the frame in choppy stop-motion steps, with a tiny new tilt and offset each step and a drop shadow, while the incoming cutout jerks in the same way and lands",tags:["stop-motion","paper","cutout","slide","shadow","choppy"],params:{steps:{type:"int",default:12,min:6,max:30,step:1,description:"Number of held poses during the transition: fewer is choppier"},jitter:{type:"float",default:.5,min:0,max:1,description:"Size of the small random tilt and offset given to the cutouts at each step"},shadow:{type:"float",default:.5,min:0,max:1,description:"Darkness of the drop shadow the cutouts cast"},backColor:{type:"vec4",default:[.8,.71,.56,1],color:!0,description:"Color of the background behind the cutouts"},rimColor:{type:"vec4",default:[.97,.96,.93,1],color:!0,description:"Color of the paper rim around the cutouts"}},textures:[],createdAt:"Fri, 13 Nov 2026 20:04:00 +0100",updatedAt:"Fri, 13 Nov 2026 20:04:00 +0100"},{name:"StretchSlide",paramsTypes:{direction:"vec2",stretch:"float",bounce:"float"},defaultParams:{direction:[-1,0],stretch:.6,bounce:.6},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image stretches out long as it shoots away to one side, pulling in the incoming one squashed behind it, which overshoots and springs back to its shape
// Tags: slide, stretch, squash, elastic, bounce, directional

// @param Direction in which the images slide
uniform vec2 direction; // = vec2(-1.0, 0.0)
// @range(0, 1) How long the outgoing image stretches and how much the squashed incoming one bulges
uniform float stretch; // = 0.6
// @range(0, 1) How far the incoming image overshoots before it springs back to its shape
uniform float bounce; // = 0.6

const float PI = 3.14159265;

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

vec4 transition(vec2 uv) {
  float dl = length(direction);
  vec2 d = dl > 1e-6 ? direction / dl : vec2(-1.0, 0.0);
  vec2 n = vec2(-d.y, d.x);
  // s: position along the slide across the frame, from 0 (trailing side) to 1 (leading side)
  float ext = abs(d.x) + abs(d.y);
  vec2 q = uv - 0.5;
  float s = 0.5 + dot(q, d) / ext;
  float t = progress;

  // the slide accelerates into the landing (a smoothstep when there is no bounce)
  float land = mix(1.0, 0.5, bounce);
  float m = 3.0 * bounce; // speed at the landing, relative to a linear slide
  float x = clamp(t / land, 0.0, 1.0);
  float e = x * x * (3.0 - 2.0 * x) + m * x * x * (x - 1.0);
  // then a damped spring, starting at the landing speed, that comes to rest exactly at the end
  float w = 2.5 * PI;
  float u = clamp((t - land) / max(1.0 - land, 1e-4), 0.0, 1.0);
  float osc = m * (1.0 - land) / (land * w) * exp(-u) * sin(w * u) * (1.0 - u) * (1.0 - u);
  // past the landing the frame stays covered: the spring stretches the incoming image
  // along the slide, and squashes it back into a sideways bulge
  float len = e + max(osc, 0.0);
  float bulge = 1.0 - e + 3.0 * max(-osc, 0.0);

  // the incoming image is pinned at the trailing side and spans up to the seam
  float g = 1.0 + 0.6 * stretch * bulge;
  vec2 pt = q + d * (s / max(len, 1e-4) - s) * ext;
  pt -= n * dot(pt, n) * (1.0 - 1.0 / g);
  vec4 b = getToColor(mirror(pt + 0.5));

  // the outgoing image hangs from the seam and stretches out long ahead of it,
  // the most near the seam, where it is pulled
  float l = 1.0 + 4.0 * stretch * e;
  float k = clamp(1.6 * stretch * e, 0.0, 0.8);
  float y = max(s - e, 0.0) / l;
  // invert y = (1 + k) v - k v^2
  float v = 2.0 * y / ((1.0 + k) + sqrt((1.0 + k) * (1.0 + k) - 4.0 * k * y));
  vec4 a = getFromColor(mirror(q + d * (v - s) * ext + 0.5));

  // past the landing, only the incoming image is left
  return (s < len || t >= land) ? b : a;
}
`,author:"gre",license:"MIT",description:"The outgoing image stretches out long as it shoots away to one side, pulling in the incoming one squashed behind it, which overshoots and springs back to its shape",tags:["slide","stretch","squash","elastic","bounce","directional"],params:{direction:{type:"vec2",default:[-1,0],description:"Direction in which the images slide"},stretch:{type:"float",default:.6,min:0,max:1,description:"How long the outgoing image stretches and how much the squashed incoming one bulges"},bounce:{type:"float",default:.6,min:0,max:1,description:"How far the incoming image overshoots before it springs back to its shape"}},textures:[],createdAt:"Tue, 3 Nov 2026 13:10:31 +0100",updatedAt:"Tue, 3 Nov 2026 13:10:31 +0100"},{name:"StripDatamoshGlitch",paramsTypes:{strength:"float",horizontalBars:"float",verticalSlits:"float",tear:"float",chroma:"float",residue:"float",noiseAmount:"float",scanAmount:"float",flashAmount:"float"},defaultParams:{strength:1,horizontalBars:42,verticalSlits:18,tear:.18,chroma:.032,residue:.62,noiseAmount:.16,scanAmount:.13,flashAmount:.2},glsl:`// Author: bread
// License: MIT
// Description: A datamosh glitch: torn strips, chroma shifts and scan noise drag the outgoing image into the incoming one
// Tags: glitch, datamosh, chromatic

uniform float strength;       // = 1.0
uniform float horizontalBars; // = 42.0
uniform float verticalSlits;  // = 18.0
uniform float tear;           // = 0.18
uniform float chroma;         // = 0.032
uniform float residue;        // = 0.62
uniform float noiseAmount;    // = 0.16
uniform float scanAmount;     // = 0.13
uniform float flashAmount;    // = 0.20

const float PI = 3.141592653589793;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float sat(float v) {
  return clamp(v, 0.0, 1.0);
}

float burst() {
  return pow(max(0.0, sin(progress * PI)), 0.42) * strength;
}

vec2 safeUv(vec2 uv) {
  return clamp(uv, vec2(0.0), vec2(1.0));
}

float stripeY(vec2 uv, float density, float seed, float minWidth, float maxWidth) {
  float y = uv.y * density + seed * 0.137;
  float id = floor(y);
  float f = fract(y);
  float c = hash(vec2(id, seed));
  float w = mix(minWidth, maxWidth, hash(vec2(id + 9.17, seed + 2.31)));
  return 1.0 - smoothstep(w, w + 0.018, abs(f - c));
}

float stripeX(vec2 uv, float density, float seed, float minWidth, float maxWidth) {
  float x = uv.x * density + seed * 0.091;
  float id = floor(x);
  float f = fract(x);
  float c = hash(vec2(id, seed + 41.0));
  float w = mix(minWidth, maxWidth, hash(vec2(id + 4.7, seed + 8.9)));
  return 1.0 - smoothstep(w, w + 0.012, abs(f - c));
}

float brokenGate(vec2 uv, float row, float rnd, float frame) {
  float segs = mix(1.0, 9.0, hash(vec2(row, frame + 44.0)));
  float seg = floor(uv.x * segs);
  return step(0.16, hash(vec2(seg, row + frame * 3.0 + rnd)));
}

float horizontalMask(vec2 uv, float frame) {
  float r1 = floor((uv.y + hash(frame) * 0.031) * horizontalBars * 0.38);
  float r2 = floor((uv.y + hash(frame + 2.0) * 0.013) * horizontalBars);
  float r3 = floor((uv.y + hash(frame + 7.0) * 0.006) * horizontalBars * 3.4);

  float thick = stripeY(uv, horizontalBars * 0.38, frame + 1.0, 0.035, 0.22);
  float mid   = stripeY(uv, horizontalBars,        frame + 4.0, 0.014, 0.11);
  float hair  = stripeY(uv, horizontalBars * 3.4,  frame + 9.0, 0.004, 0.035);

  thick *= step(0.42, hash(vec2(r1, frame + 10.0)));
  mid   *= step(0.48, hash(vec2(r2, frame + 20.0)));
  hair  *= step(0.62, hash(vec2(r3, frame + 30.0)));

  thick *= brokenGate(uv, r1, hash(vec2(r1, frame)), frame);
  mid   *= brokenGate(uv, r2, hash(vec2(r2, frame)), frame + 3.0);

  return sat(max(thick, max(mid, hair)));
}

float verticalMask(vec2 uv, float frame) {
  float col = floor((uv.x + hash(frame + 12.0) * 0.017) * verticalSlits);
  float slit = stripeX(uv, verticalSlits, frame + 13.0, 0.01, 0.075);
  slit *= step(0.66, hash(vec2(col, frame + 19.0)));
  return sat(slit);
}

vec4 chromaFrom(vec2 uv, vec2 s) {
  uv = safeUv(uv);
  vec4 center = getFromColor(uv);
  return vec4(
    getFromColor(safeUv(uv + s)).r,
    center.g,
    getFromColor(safeUv(uv - s)).b,
    center.a
  );
}

vec4 chromaTo(vec2 uv, vec2 s) {
  uv = safeUv(uv);
  vec4 center = getToColor(uv);
  return vec4(
    getToColor(safeUv(uv - s)).r,
    center.g,
    getToColor(safeUv(uv + s)).b,
    center.a
  );
}

vec2 distortUv(vec2 uv, float dir, float b, float h, float v, float frame) {
  float row = floor(uv.y * horizontalBars);
  float col = floor(uv.x * verticalSlits);

  float rowRnd = hash(vec2(row, frame));
  float colRnd = hash(vec2(col, frame + 27.0));

  float xTear = (rowRnd - 0.5) * 2.0 * tear * b * h;
  xTear += sin(uv.y * 120.0 + progress * 95.0) * 0.006 * b;

  float yDrag = (colRnd - 0.5) * 0.13 * b * v;
  float micro = (hash(vec2(row, col + frame)) - 0.5) * 0.018 * b * max(h, v);

  return uv + vec2(xTear * dir + micro, yDrag);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  float b = burst();
  float frame = floor(progress * 30.0);

  float h = horizontalMask(uv, frame);
  float v = verticalMask(uv, frame);
  float glitch = sat(max(h, v * 0.75));

  float row = floor(uv.y * horizontalBars);
  float rowRnd = hash(vec2(row, frame + 5.0));

  float bandDelay = (rowRnd - 0.5) * 0.30 * h;
  float reveal = smoothstep(0.18, 0.84, progress + bandDelay);

  vec2 split = vec2(chroma * b * (1.0 + 1.7 * glitch), chroma * 0.22 * b * v);

  vec2 fromUv = distortUv(uv,  1.0, b, h, v, frame);
  vec2 toUv   = distortUv(uv, -1.0, b, h, v, frame);

  vec4 color = mix(
    chromaFrom(fromUv, split),
    chromaTo(toUv, split),
    reveal
  );

  // Horizontal time-slice residue: old/new frames dragged through uneven scan bands.
  vec2 smearUv = uv;
  smearUv.x += (rowRnd - 0.5) * 0.46 * b * h;
  smearUv.y += (hash(vec2(row, frame + 31.0)) - 0.5) * 0.045 * b * h;

  float sliceReveal = smoothstep(0.28, 0.78, progress + (rowRnd - 0.5) * 0.22);
  vec4 sliceColor = mix(
    chromaFrom(smearUv, split * 1.65),
    chromaTo(smearUv - vec2((rowRnd - 0.5) * 0.18 * b, 0.0), split * 1.65),
    sliceReveal
  );

  color = mix(color, sliceColor, h * b * residue);

  // Thin scan sparks and broken white lines, like the reference clip's bright horizontal noise.
  float hairLine = stripeY(uv, 190.0, frame + 55.0, 0.002, 0.012);
  hairLine *= step(0.70, hash(vec2(floor(uv.y * 190.0), frame + 56.0)));
  color.rgb += vec3(0.72, 0.90, 1.0) * hairLine * b * 0.28;

  float scan = 0.5 + 0.5 * sin(uv.y * 980.0 + progress * 130.0);
  color.rgb *= 1.0 - scanAmount * b * scan;

  vec2 nCell = floor(uv * vec2(360.0 * ratio, 210.0));
  float n = hash(nCell + vec2(frame * 7.0, frame * 13.0));
  color.rgb += (n - 0.5) * noiseAmount * b * (0.55 + glitch);

  // Slight desaturation during the damage peak makes it feel more like broadcast/video signal corruption.
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(color.rgb, vec3(luma), 0.18 * b * glitch);

  float strobe = step(0.78, hash(vec2(frame, 3.14))) * pow(b, 1.65);
  color.rgb += vec3(strobe * flashAmount);

  return vec4(clamp(color.rgb, vec3(0.0), vec3(1.0)), color.a);
}
`,author:"bread",license:"MIT",description:"A datamosh glitch: torn strips, chroma shifts and scan noise drag the outgoing image into the incoming one",tags:["glitch","datamosh","chromatic"],params:{strength:{type:"float",default:1},horizontalBars:{type:"float",default:42},verticalSlits:{type:"float",default:18},tear:{type:"float",default:.18},chroma:{type:"float",default:.032},residue:{type:"float",default:.62},noiseAmount:{type:"float",default:.16},scanAmount:{type:"float",default:.13},flashAmount:{type:"float",default:.2}},textures:[],createdAt:"Fri, 12 Jun 2026 15:15:42 +0800",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"Swap",paramsTypes:{reflection:"float",perspective:"float",depth:"float"},defaultParams:{reflection:.4,perspective:.2,depth:3},glsl:`// Author: gre
// License: MIT
// Description: The two images swap places in 3D, with a floor reflection
// Tags: 3d, swap, reflection
// General parameters
// @param Strength of the reflection
uniform float reflection; // = 0.4
// @param Amount of perspective
uniform float perspective; // = 0.2
uniform float depth; // = 3.0
 
const vec4 black = vec4(0.0); // where no image is drawn: transparent
const vec2 boundMin = vec2(0.0, 0.0);
const vec2 boundMax = vec2(1.0, 1.0);
 
bool inBounds (vec2 p) {
  return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
}
 
vec2 project (vec2 p) {
  return p * vec2(1.0, -1.2) + vec2(0.0, -0.02);
}
 
vec4 bgColor (vec2 p, vec2 pfr, vec2 pto) {
  vec4 c = black;
  pfr = project(pfr);
  if (inBounds(pfr)) {
    c += mix(black, getFromColor(pfr), reflection * mix(1.0, 0.0, pfr.y));
  }
  pto = project(pto);
  if (inBounds(pto)) {
    c += mix(black, getToColor(pto), reflection * mix(1.0, 0.0, pto.y));
  }
  return c;
}
 
vec4 transition(vec2 p) {
  vec2 pfr, pto = vec2(-1.);
 
  float size = mix(1.0, depth, progress);
  float persp = perspective * progress;
  pfr = (p + vec2(-0.0, -0.5)) * vec2(size/(1.0-perspective*progress), size/(1.0-size*persp*p.x)) + vec2(0.0, 0.5);
 
  size = mix(1.0, depth, 1.-progress);
  persp = perspective * (1.-progress);
  pto = (p + vec2(-1.0, -0.5)) * vec2(size/(1.0-perspective*(1.0-progress)), size/(1.0-size*persp*(0.5-p.x))) + vec2(1.0, 0.5);

  if (progress < 0.5) {
    if (inBounds(pfr)) {
      return getFromColor(pfr);
    }
    if (inBounds(pto)) {
      return getToColor(pto);
    }  
  }
  if (inBounds(pto)) {
    return getToColor(pto);
  }
  if (inBounds(pfr)) {
    return getFromColor(pfr);
  }
  return bgColor(p, pfr, pto);
}
`,author:"gre",license:"MIT",description:"The two images swap places in 3D, with a floor reflection",tags:["3d","swap","reflection"],params:{reflection:{type:"float",default:.4,description:"Strength of the reflection"},perspective:{type:"float",default:.2,description:"Amount of perspective"},depth:{type:"float",default:3}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"Swirl",paramsTypes:{strength:"float",radius:"float",center:"vec2"},defaultParams:{strength:1,radius:.9,center:[.5,.5]},glsl:`// License: MIT
// Author: Sergey Kosarevsky
// Description: The image twists into a round swirl around the center that peaks mid-way, where the outgoing image dissolves into the incoming one, then untwists
// Tags: swirl, rotate, blend
// ( http://www.linderdaum.com )
// ported by gre from https://gist.github.com/corporateshark/cacfedb8cca0f5ce3f7c

// @range(-3, 3) Turns of the swirl at its center at the peak (negative turns clockwise)
uniform float strength; // = 1.0
// @range(0.1, 2) Radius of the swirl, in frame heights
uniform float radius; // = 0.9
// Center of the swirl
uniform vec2 center; // = vec2(0.5, 0.5)

const float PI = 3.141592653589793;
const float TAU = 6.283185307179586;
// how much the swirl pulls the image toward its center at the peak
const float ZOOM = 0.12;
// spread of the motion blur, as a fraction of the swirl's speed
const float BLUR = 0.05;
const int TAPS = 12;

// fold the coordinates back into the frame, so the image stays filled without smearing its border
vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

vec4 transition(vec2 uv) {
  // the swirl eases in and out, and is exactly 0 at both ends
  float s = sin(PI * progress);
  float amount = s * s;
  // its speed, used for the motion blur, also 0 at both ends
  float speed = PI * sin(TAU * progress);
  // the switch from the outgoing to the incoming image happens around the peak
  float reveal = smoothstep(0.3, 0.7, progress);

  // measured in frame heights, so the swirl is round
  vec2 aspect = vec2(ratio, 1.0);
  vec2 d = (uv - center) * aspect;
  float x = clamp(length(d) / max(radius, 1e-3), 0.0, 1.0);
  // the twist fades out smoothly toward the edge of the swirl
  float falloff = (1.0 - x) * (1.0 - x);
  float twist = strength * TAU * falloff;
  float angle = twist * amount;
  // capped so the blur taps never spread apart into visible streaks
  float spread = clamp(twist * speed * BLUR, -1.2, 1.2);
  // the swirl also slightly pulls the image toward its center
  d *= 1.0 - ZOOM * amount * falloff;

  vec4 col = vec4(0.0);
  float total = 0.0;
  for (int i = 0; i < TAPS; i++) {
    float k = float(i) / float(TAPS - 1) - 0.5;
    float w = 1.0 - abs(k);
    float a = angle + spread * k;
    float c = cos(a);
    float sn = sin(a);
    vec2 q = mirrored(center + vec2(c * d.x - sn * d.y, sn * d.x + c * d.y) / aspect);
    col += mix(getFromColor(q), getToColor(q), reveal) * w;
    total += w;
  }
  return col / total;
}
`,author:"Sergey Kosarevsky",license:"MIT",description:"The image twists into a round swirl around the center that peaks mid-way, where the outgoing image dissolves into the incoming one, then untwists",tags:["swirl","rotate","blend"],params:{strength:{type:"float",default:1,min:-3,max:3,description:"Turns of the swirl at its center at the peak (negative turns clockwise)"},radius:{type:"float",default:.9,min:.1,max:2,description:"Radius of the swirl, in frame heights"},center:{type:"vec2",default:[.5,.5]}},textures:[],createdAt:"Mon, 12 Jun 2017 12:38:27 +0800",updatedAt:"Sat, 7 Nov 2026 18:51:57 +0100"},{name:"TangentMotionBlur",paramsTypes:{},defaultParams:{},glsl:`
// License: MIT
// Author: chenkai
// Description: The outgoing image is flung away along a curve with motion blur
// Tags: motion-blur, rotate, slide
// ported from https://codertw.com/%E7%A8%8B%E5%BC%8F%E8%AA%9E%E8%A8%80/671116/

float rand (vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
 
// motion blur for texture from
vec4 motionBlurFrom(vec2 _st, vec2 speed) {
    vec2 texCoord = _st.xy / vec2(1.0).xy;
    // Premultiplied sums, so that transparent samples do not darken the blur
    vec3 color = vec3(0.0);
    float alpha = 0.0;
    float total = 0.0;
    float offset = rand(_st);
    for (float t = 0.0; t <= 20.0; t++) {
        float percent = (t + offset) / 20.0;
        float weight = 4.0 * (percent - percent * percent);
        vec2 newuv = texCoord + speed * percent;
        newuv = fract(newuv);
        vec4 c = getFromColor(newuv);
        color += c.rgb * c.a * weight;
        alpha += c.a * weight;
        total += weight;
    }
    return vec4(color / max(alpha, 1e-5), alpha / total);
}

// motion blur for texture to
vec4 motionBlurTo(vec2 _st, vec2 speed) {
    vec2 texCoord = _st.xy / vec2(1.0).xy;
    vec3 color = vec3(0.0);
    float alpha = 0.0;
    float total = 0.0;
    float offset = rand(_st);
    for (float t = 0.0; t <= 20.0; t++) {
        float percent = (t + offset) / 20.0;
        float weight = 4.0 * (percent - percent * percent);
        vec2 newuv = texCoord + speed * percent;
        newuv = fract(newuv);
        vec4 c = getToColor(newuv);
        color += c.rgb * c.a * weight;
        alpha += c.a * weight;
        total += weight;
    }
    return vec4(color / max(alpha, 1e-5), alpha / total);
}


// bezier in gpu
float A(float aA1, float aA2) {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}
float B(float aA1, float aA2) {
    return 3.0 * aA2 - 6.0 * aA1;
}
float C(float aA1) {
    return 3.0 * aA1;
}
float GetSlope(float aT, float aA1, float aA2) {
    return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
}
float CalcBezier(float aT, float aA1, float aA2) {
    return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT;
}
float GetTForX(float aX, float mX1, float mX2) {
    // iteration to solve
    float aGuessT = aX;
    for (int i = 0; i < 4; ++i) {
        float currentSlope = GetSlope(aGuessT, mX1, mX2);
        if (currentSlope == 0.0) return aGuessT;
        float currentX = CalcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
}
float KeySpline(float aX, float mX1, float mY1, float mX2, float mY2) {
    if (mX1 == mY1 && mX2 == mY2) return aX; // linear
    return CalcBezier(GetTForX(aX, mX1, mX2), mY1, mY2); // x to t, t to y
}

// norm distribution
float normpdf(float x) {
    float d = x - .5;
    return exp(-20.*d*d);
}

vec2 rotateUv(vec2 uv, float angle, vec2 anchor, float zDirection) {
    uv = uv - anchor; // anchor to origin
    float s = sin(angle);
	float c = cos(angle);
	mat2 m = mat2(c, -s, s, c);
    uv = m * uv;
    uv += anchor; // anchor back
    return uv;
}



vec4 transition (vec2 uv) {
    
    vec2 myst = uv;
    float animationTime = progress; //getAnimationTime();
    float easingTime = KeySpline(animationTime, .68,.01,.17,.98);
    float blur = normpdf(easingTime);
    float r = 0.;
    float rotation = 180./180.*3.14159;
    if (easingTime <= .5) {
        r = rotation * easingTime;
    } else {
        r = -rotation + rotation * easingTime;
    }

    // rotation for current frame
    vec2 mystCurrent = myst;
    mystCurrent.y *= 1./ratio;
    mystCurrent = rotateUv(mystCurrent, r, vec2(1., 0.), -1.);
    mystCurrent.y *= ratio;
    
    // frame timeInterval by fps=30
    float timeInterval = 0.0167*2.0;
    if (easingTime <= .5) {
        r = rotation * (easingTime+timeInterval);
    } else {
        r = -rotation + rotation * (easingTime+timeInterval);
    }
    
    // rotation for next frame
    vec2 mystNext = myst;
    mystNext.y *= 1./ratio;
    mystNext = rotateUv(mystNext, r, vec2(1., 0.), -1.);
    mystNext.y *= ratio;
    
    // get speed at tagent direction
    vec2 speed  = (mystNext - mystCurrent) / timeInterval * blur * 0.5;
    if (easingTime <= .5) {
        return motionBlurFrom(mystCurrent, speed);
    } else {
        return motionBlurTo(mystCurrent, speed);
    }
}

`,author:"chenkai",license:"MIT",description:"The outgoing image is flung away along a curve with motion blur",tags:["motion-blur","rotate","slide"],params:{},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"TilesWave",paramsTypes:{tileCount:"ivec2",flipX:"bool",flipY:"bool"},defaultParams:{tileCount:[8,8],flipX:!0,flipY:!1},glsl:`// Author: numb3r23
// License: MIT
// Description: The incoming image is revealed tile by tile in a diagonal wave
// Tags: tiles, wave, wipe
// Ported from https://gist.github.com/numb3r23/169781bb76f310e2bfde

// @param Number of tiles (columns, rows)
uniform ivec2 tileCount; // = ivec2(8, 8)
uniform bool flipX; // = true
uniform bool flipY; // = false

vec4 transition(vec2 uv) {
  vec2 tileSize = 1.0 / vec2(tileCount);
  vec2 posInTile = fract(uv * vec2(tileCount));
  vec2 tileNum = floor(uv * vec2(tileCount));
  float countTiles = float(tileCount.x * tileCount.y);

  // Diagonal wave from bottom-left to top-right
  float offset = (tileNum.y + tileNum.x * float(tileCount.y)) / countTiles;
  float timeOffset = clamp((progress - offset) * countTiles, 0.0, 0.5);
  float sinTime = 1.0 - abs(cos(fract(timeOffset) * 3.1415926));

  vec2 texC = posInTile;

  if (sinTime <= 0.5) {
    if (flipX) {
      if (texC.x < sinTime || texC.x > 1.0 - sinTime)
        return getFromColor(uv);
      texC.x = texC.x < 0.5
        ? (texC.x - sinTime) * 0.5 / (0.5 - sinTime)
        : (texC.x - 0.5) * 0.5 / (0.5 - sinTime) + 0.5;
    }
    if (flipY) {
      if (texC.y < sinTime || texC.y > 1.0 - sinTime)
        return getFromColor(uv);
      texC.y = texC.y < 0.5
        ? (texC.y - sinTime) * 0.5 / (0.5 - sinTime)
        : (texC.y - 0.5) * 0.5 / (0.5 - sinTime) + 0.5;
    }
    vec2 globalUV = tileNum * tileSize + texC * tileSize;
    return getFromColor(globalUV);
  } else {
    if (flipX) {
      if (texC.x > sinTime || texC.x < 1.0 - sinTime)
        return getToColor(uv);
      texC.x = texC.x < 0.5
        ? (texC.x - sinTime) * 0.5 / (0.5 - sinTime)
        : (texC.x - 0.5) * 0.5 / (0.5 - sinTime) + 0.5;
      texC.x = 1.0 - texC.x;
    }
    if (flipY) {
      if (texC.y > sinTime || texC.y < 1.0 - sinTime)
        return getToColor(uv);
      texC.y = texC.y < 0.5
        ? (texC.y - sinTime) * 0.5 / (0.5 - sinTime)
        : (texC.y - 0.5) * 0.5 / (0.5 - sinTime) + 0.5;
      texC.y = 1.0 - texC.y;
    }
    vec2 globalUV = tileNum * tileSize + texC * tileSize;
    return getToColor(globalUV);
  }
}
`,author:"numb3r23",license:"MIT",description:"The incoming image is revealed tile by tile in a diagonal wave",tags:["tiles","wave","wipe"],params:{tileCount:{type:"ivec2",default:[8,8],description:"Number of tiles (columns, rows)"},flipX:{type:"bool",default:!0},flipY:{type:"bool",default:!1}},textures:[],createdAt:"Sun, 29 Mar 2026 20:32:54 +0200",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"TopBottom",paramsTypes:{},defaultParams:{},glsl:`// Author: zhmy
// License: MIT
// Description: The outgoing image shrinks away upward while the incoming one slides in from the bottom
// Tags: slide, zoom, vertical

const vec4 black = vec4(0.0); // where no image is drawn: transparent
const vec2 boundMin = vec2(0.0, 0.0);
const vec2 boundMax = vec2(1.0, 1.0);

bool inBounds (vec2 p) {
    return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
}

vec4 transition (vec2 uv) {
    vec2 spfr,spto = vec2(-1.);
    float size = mix(1.0, 3.0, progress*0.2);
    spto = (uv + vec2(-0.5,-0.5))*vec2(size,size)+vec2(0.5,0.5);
    spfr = (uv + vec2(0.0, 1.0 - progress));
    if(inBounds(spfr)){
        return getToColor(spfr);
    } else if(inBounds(spto)){
        return getFromColor(spto) * (1.0 - progress);
    } else{
        return black;
    }
}`,author:"zhmy",license:"MIT",description:"The outgoing image shrinks away upward while the incoming one slides in from the bottom",tags:["slide","zoom","vertical"],params:{},textures:[],createdAt:"Thu, 17 Dec 2020 11:50:34 +0800",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"TruchetWipe",paramsTypes:{cells:"float",outline:"float",spread:"float"},defaultParams:{cells:8,outline:.6,spread:.75},glsl:`// Author: gre
// License: MIT
// Description: A grid of square tiles, each holding two quarter-circle arcs, links into long winding paths; starting from the middle and spreading outward, the paths are drawn as thin lines of the incoming image, then thicken into bands with a dark outline and a soft shadow until they merge over the whole frame
// Tags: truchet, pattern, tiles, paths, graphic, reveal

// @range(3, 20, 1) Number of tiles across the frame's height
uniform float cells; // = 8.0
// @range(0, 1) Strength of the dark outline and of the shadow along the bands
uniform float outline; // = 0.6
// @range(0, 1) How much the paths are staggered from the middle outward: 0 draws them all at once
uniform float spread; // = 0.75

// half width of the antialiased edges, in frame heights
const float AA = 0.0012;
// width of the outline, in frame heights
const float LINE = 0.003;
// how far the shadow reaches outside a band, in frame heights
const float SHADOW = 0.025;
// half width of the thin line a path is first drawn as, in tiles
const float STROKE = 0.08;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

float vnoise(vec2 v) {
  vec2 i = floor(v);
  vec2 f = fract(v);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
    mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  float n = max(floor(cells + 0.5), 1.0);
  // aspect-correct square tiles, centered on the frame
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0);
  vec2 g = p * n + 0.5;
  vec2 cell = floor(g);
  vec2 q = fract(g);
  // each tile is mirrored at random, so its two arcs (centered on opposite corners) link up with its neighbors' in two ways
  if (hash12(cell + 17.0) > 0.5) q.x = 1.0 - q.x;
  // distance to the nearest arc, in tiles: continuous across the tiles' edges, at most 0.5 (at the corners)
  float d = min(abs(length(q) - 0.5), abs(length(q - 1.0) - 0.5));

  // when the paths reach this point: from the middle outward, made irregular by a noise
  float T = clamp(length(p) / (0.5 * length(vec2(ratio, 1.0))) + 0.4 * (vnoise(p * 3.0 + 4.0) - 0.5), 0.0, 1.0);
  float lag = 0.8 * clamp(spread, 0.0, 1.0);
  // every point is fully covered at progress 0.95
  float s = clamp((progress - lag * T) / (0.95 - lag), 0.0, 1.0);
  // in tiles: the paths are first drawn as thin lines, then the bands widen past the tiles' corners
  float aa = AA * n;
  float k = clamp((s - 0.25) / 0.75, 0.0, 1.0);
  float w = STROKE * smoothstep(0.0, 0.3, s) + (0.5 + LINE * n + 3.0 * aa - STROKE) * k * k;
  // signed distance to the edge of the bands (negative inside), in tiles
  float e = d - w;

  float band = 1.0 - smoothstep(-2.0 * aa, 0.0, e);
  // outside the bands: a thin outline on their edge and a soft shadow, fading in with the line
  float gap = max(e + aa, 0.0);
  float fall = 1.0 - smoothstep(0.0, SHADOW * n, gap);
  float edge = max(0.8 * (1.0 - smoothstep(LINE * n, LINE * n + 2.0 * aa, gap)), 0.4 * fall * fall);
  float shade = clamp(outline, 0.0, 1.0) * smoothstep(0.0, STROKE, w) * edge;

  vec4 a = getFromColor(uv);
  a.rgb *= 1.0 - shade;
  vec4 b = getToColor(uv);
  // mixed premultiplied, so transparent images do not bleed their color
  vec4 o = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), band);
  return o.a > 0.0 ? vec4(o.rgb / o.a, o.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"A grid of square tiles, each holding two quarter-circle arcs, links into long winding paths; starting from the middle and spreading outward, the paths are drawn as thin lines of the incoming image, then thicken into bands with a dark outline and a soft shadow until they merge over the whole frame",tags:["truchet","pattern","tiles","paths","graphic","reveal"],params:{cells:{type:"float",default:8,min:3,max:20,step:1,description:"Number of tiles across the frame's height"},outline:{type:"float",default:.6,min:0,max:1,description:"Strength of the dark outline and of the shadow along the bands"},spread:{type:"float",default:.75,min:0,max:1,description:"How much the paths are staggered from the middle outward: 0 draws them all at once"}},textures:[],createdAt:"Sun, 8 Nov 2026 13:35:44 +0100",updatedAt:"Sun, 8 Nov 2026 13:35:44 +0100"},{name:"Tumble",paramsTypes:{flips:"float",spin:"float",direction:"vec2",perspective:"float",shading:"float"},defaultParams:{flips:2,spin:.15,direction:[0,.3],perspective:.6,shading:.7},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image is thrown away like a rigid card, tumbling end over end with a slight spin as it flies off into the distance in perspective, its darker back showing on every flip and its soft shadow shrinking on the incoming image behind it
// Tags: 3d, rotate, flip, card, perspective

// @range(-4, 4) Number of turns end over end, negative to tumble the other way
uniform float flips; // = 2.0
// @range(-1, 1) Turns of the secondary spin around the line of sight
uniform float spin; // = 0.15
// @param Where the card flies toward on screen, in frame heights from the center
uniform vec2 direction; // = vec2(0.0, 0.3)
// @range(0.1, 1) Strength of the perspective
uniform float perspective; // = 0.6
// @range(0, 1) Shading of the card as it turns, darkness of its back and of its shadow
uniform float shading; // = 0.7

const float PI = 3.141592653589793;
// width of the anti-aliased card edges, in frame heights
const float EDGE = 0.0015;
// direction toward the light: above, to the right, in front
const vec3 LIGHT = vec3(0.348, 0.696, -0.628);

// rotates v around the line of sight
vec3 roll(vec3 v, float c, float s) {
  return vec3(c * v.x - s * v.y, s * v.x + c * v.y, v.z);
}

// signed distance to the card's rectangle, in its plane
float cardDistance(vec2 q) {
  vec2 e = abs(q) - vec2(0.5 * ratio, 0.5);
  return max(e.x, e.y);
}

// casts the ray d from the eye onto the card's plane, rel being the card's center from the eye:
// (the point hit in the card's axes, the distance along d), or a negative distance when it misses
vec3 castOnCard(vec3 d, vec3 rel, vec3 U, vec3 V, vec3 N) {
  float dn = dot(d, N);
  if (abs(dn) < 1e-6) return vec3(0.0, 0.0, -1.0);
  float k = dot(rel, N) / dn;
  vec3 h = k * d - rel;
  return vec3(dot(h, U), dot(h, V), k);
}

vec2 cardUv(vec2 q) {
  return clamp(vec2(q.x / ratio, q.y) + 0.5, 0.0, 1.0);
}

vec4 transition(vec2 uv) {
  // the card is gone a little before the end
  float t = clamp(progress / 0.95, 0.0, 1.0);
  // its size on screen shrinks faster and faster, down to a few percent
  float size = exp(-2.8 * t * t * (0.4 + 0.6 * t));
  float away = 1.0 - size;
  // it spins at its own pace, starting smoothly
  float turn = t * t * (3.0 - 2.0 * t);
  float a = 2.0 * PI * flips * turn;
  float r = 2.0 * PI * spin * turn;
  float cr = cos(r), sr = sin(r);
  // end over end around its horizontal axis, then around the line of sight
  vec3 U = roll(vec3(1.0, 0.0, 0.0), cr, sr);
  vec3 V = roll(vec3(0.0, cos(a), sin(a)), cr, sr);
  vec3 N = roll(vec3(0.0, -sin(a), cos(a)), cr, sr);

  // the camera, at dist in front of the plane z = 0, sees the frame at rest on it
  float dist = 1.0 / clamp(perspective, 0.1, 1.0);
  // the card's center, seen at direction * away on screen while it goes away, with a slight rise
  vec2 seen = direction * away + vec2(0.0, 0.12 * t * (1.0 - t));
  vec3 rel = vec3(seen / size, dist / size);
  float fade = 1.0 - smoothstep(0.8, 1.0, t);
  float shadowAmount = 0.6 * shading * sqrt(size) * fade;

  vec2 p = vec2((uv.x - 0.5) * ratio, uv.y - 0.5);
  vec4 color = getToColor(uv);

  // the soft shadow on the incoming image, cast down and to the left, shrinking with the card
  if (shadowAmount > 0.0) {
    vec3 ds = vec3(p - vec2(-0.05, -0.08) * min(4.0 * t, 1.0) * size, dist);
    vec3 hs = castOnCard(ds, rel, U, V, N);
    if (hs.z > 0.0) {
      float blur = 0.005 + 0.06 * min(3.0 * t, 1.0) * size;
      float sd = cardDistance(hs.xy) * max(abs(dot(ds, N)) / length(ds), 0.05) / hs.z;
      float sh = (1.0 - smoothstep(-blur, blur, sd)) * getFromColor(cardUv(hs.xy)).a;
      color.rgb *= 1.0 - shadowAmount * sh;
    }
  }

  // cast the ray onto the card
  vec3 d = vec3(p, dist);
  vec3 hit = castOnCard(d, rel, U, V, N);
  if (hit.z <= 0.0) return color;
  float dn = dot(d, N);
  // anti-aliased edges: a screen pixel covers more of the card when it is far or seen at a grazing angle
  float grazing = max(abs(dn) / length(d), 0.05);
  float e = EDGE * min(20.0 * t, 1.0) * hit.z / grazing;
  float m = clamp(0.5 - cardDistance(hit.xy) / max(e, 1e-6), 0.0, 1.0) * fade;
  if (m <= 0.0) return color;

  vec4 card = getFromColor(cardUv(hit.xy));
  // the side facing the camera: the front, or the back which shows the image through, darker and duller
  bool front = dn > 0.0;
  vec3 facing = front ? -N : N;
  float lit = min((0.35 + 0.65 * max(dot(facing, LIGHT), 0.0)) / (0.35 + 0.65 * -LIGHT.z), 1.0);
  float shade = mix(1.0, lit * (front ? 1.0 : 0.55), shading);
  if (!front) card.rgb = mix(card.rgb, vec3(dot(card.rgb, vec3(0.299, 0.587, 0.114))), 0.4 * shading);
  // a glint as the card turns through the light, a light added to the image
  float glint = pow(max(dot(facing, normalize(LIGHT - normalize(d))), 0.0), 60.0);
  card.rgb = card.rgb * shade + 0.35 * shading * glint * smoothstep(0.0, 0.2, t);
  if (m >= 1.0) return card;
  // blend premultiplied, so that a transparent layer gives no color to the other one
  vec4 mixed = mix(vec4(color.rgb * color.a, color.a), vec4(card.rgb * card.a, card.a), m);
  return mixed.a > 0.0 ? vec4(mixed.rgb / mixed.a, mixed.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The outgoing image is thrown away like a rigid card, tumbling end over end with a slight spin as it flies off into the distance in perspective, its darker back showing on every flip and its soft shadow shrinking on the incoming image behind it",tags:["3d","rotate","flip","card","perspective"],params:{flips:{type:"float",default:2,min:-4,max:4,description:"Number of turns end over end, negative to tumble the other way"},spin:{type:"float",default:.15,min:-1,max:1,description:"Turns of the secondary spin around the line of sight"},direction:{type:"vec2",default:[0,.3],description:"Where the card flies toward on screen, in frame heights from the center"},perspective:{type:"float",default:.6,min:.1,max:1,description:"Strength of the perspective"},shading:{type:"float",default:.7,min:0,max:1,description:"Shading of the card as it turns, darkness of its back and of its shadow"}},textures:[],createdAt:"Sun, 8 Nov 2026 17:40:18 +0100",updatedAt:"Sun, 8 Nov 2026 17:40:18 +0100"},{name:"Tunnel",paramsTypes:{speed:"float",twist:"float"},defaultParams:{speed:6,twist:.5},glsl:`// Author: gre
// License: MIT
// Description: The camera flies down a tunnel lined with the outgoing image toward the incoming one, which opens at its far end and grows to fill the frame
// Tags: zoom, 3d, warp, radial

// @range(0.5, 10) How far and fast the camera flies down the tunnel
uniform float speed; // = 6.0
// @range(-2, 2) How much the walls spiral as they rush by
uniform float twist; // = 0.5

vec2 rotate(vec2 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

vec4 transition(vec2 uv) {
  vec2 aspect = vec2(ratio, 1.0);
  vec2 c = (uv - 0.5) * aspect;
  float r = length(c);
  // A tube as wide as the frame's corners runs from the camera to an end wall
  // at depth \`far\`; the outgoing image is projected onto it from the starting
  // point of view, so it looks flat at first. The camera flies to one unit
  // before the end wall, where the incoming image hangs.
  float R = length(0.5 * aspect);
  float far = 1.0 + speed;
  // the distance to the end wall shrinks geometrically, so the end grows evenly
  float e = mix(progress, progress * progress * (3.0 - 2.0 * progress), 0.7);
  float d = pow(far, 1.0 - e);
  float t = far - d; // distance flown
  // the end wall covers the center of the view, the tube's walls the rest
  float k = r * d < R ? d / far : R / (R + t * r); // image scale at that point
  float a = twist * min(t * r / R, t / d); // spiral, continuous at the end wall
  vec4 walls = getFromColor(0.5 + rotate(c * k, a) / aspect);
  walls.rgb *= 0.4 + 0.6 * sqrt(k); // darker where the walls are close
  // the incoming image opens in the end wall
  float open = smoothstep(0.0, 0.6, progress);
  vec2 q = 0.5 + (uv - 0.5) * d / max(open, 1e-4);
  vec2 inside = step(0.0, q) * step(q, vec2(1.0));
  return mix(walls, getToColor(q), inside.x * inside.y * step(r * d, R));
}
`,author:"gre",license:"MIT",description:"The camera flies down a tunnel lined with the outgoing image toward the incoming one, which opens at its far end and grows to fill the frame",tags:["zoom","3d","warp","radial"],params:{speed:{type:"float",default:6,min:.5,max:10,description:"How far and fast the camera flies down the tunnel"},twist:{type:"float",default:.5,min:-2,max:2,description:"How much the walls spiral as they rush by"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:20:26 +0100",updatedAt:"Sat, 31 Oct 2026 18:20:26 +0100"},{name:"TvLostSignal",paramsTypes:{},defaultParams:{},glsl:`// Author: mernking (gitlab.com/Godswork)
// License: MIT
// Description: A crossfade with drifting tracking lines and tearing, like a TV losing its signal
// Tags: retro, glitch, scanlines

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec4 transition(vec2 uv) {

    float p = progress;
    float strength = sin(p * 3.14159265);

    vec2 tv = uv;

    vec4 fromColor = getFromColor(tv);
    vec4 toColor   = getToColor(tv);

    vec4 color = mix(fromColor, toColor, p);

    // horizontal tracking lines (key effect)
    float lineY = floor(tv.y * 120.0);

    float noise = hash(vec2(lineY, p * 20.0));

    float line = step(0.92, noise);

    // make lines drift during transition
    float drift =
        sin(tv.y * 30.0 + p * 10.0)
        * 0.02
        * strength;

    vec4 shiftedFrom = getFromColor(tv + vec2(drift, 0.0));
    vec4 shiftedTo   = getToColor(tv + vec2(drift, 0.0));

    vec4 lineColor = mix(shiftedFrom, shiftedTo, p);

    // apply tearing only on selected scanlines
    color = mix(color, lineColor, line * strength);

    // mild scanline darkening (CRT feel)
    float scan =
        sin(tv.y * 900.0) * 0.03;

    color.rgb -= scan * strength;

    return color;
}
`,author:"mernking (gitlab.com/Godswork)",license:"MIT",description:"A crossfade with drifting tracking lines and tearing, like a TV losing its signal",tags:["retro","glitch","scanlines"],params:{},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"TvRoll",paramsTypes:{rolls:"int",barHeight:"float",barColor:"vec4"},defaultParams:{rolls:3,barHeight:.12,barColor:[0,0,0,1]},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image rolls faster and faster, like an old TV losing its vertical hold, then the roll slows down and locks on the incoming image
// Tags: retro, vertical, scanlines

// @range(1, 8) Number of frames that roll by
uniform int rolls; // = 3
// @range(0, 0.5) Height of the bar between the frames
uniform float barHeight; // = 0.12
// @color Color of the bar between the frames
uniform vec4 barColor; // = vec4(0.0, 0.0, 0.0, 1.0)

// The rolling picture at a vertical position y, in frames of height 1 + barHeight
vec4 picture(vec2 uv, float y, float m) {
  float period = 1.0 + barHeight;
  y = mod(y, period);
  if (y > 1.0) return barColor;
  vec2 q = vec2(uv.x, y);
  return mix(getFromColor(q), getToColor(q), m);
}

vec4 transition(vec2 uv) {
  float period = 1.0 + barHeight;
  // smooth start and stop: the picture locks again after a whole number of frames
  float s = progress * progress * (3.0 - 2.0 * progress);
  float offset = period * fract(float(rolls) * s);
  float speed = 4.0 * progress * (1.0 - progress); // 0 at both ends, 1 in the middle
  float m = smoothstep(0.42, 0.58, progress); // the channel changes at full speed
  // the horizontal sync wobbles a little
  vec2 p = uv + vec2(0.004 * speed * sin(uv.y * 9.0 + progress * 30.0), 0.0);
  // vertical motion blur
  vec4 c = vec4(0.0);
  for (int i = 0; i < 5; i++) {
    c += picture(p, p.y + offset - 0.0015 * float(rolls) * speed * float(i), m);
  }
  c /= 5.0;
  // scanlines and a flickering brightness
  float scan = 0.5 + 0.5 * sin(uv.y * 400.0);
  float flicker = 0.08 * (0.5 + 0.5 * sin(progress * 97.0));
  c.rgb *= 1.0 - speed * (0.08 * scan + flicker);
  return c;
}
`,author:"gre",license:"MIT",description:"The outgoing image rolls faster and faster, like an old TV losing its vertical hold, then the roll slows down and locks on the incoming image",tags:["retro","vertical","scanlines"],params:{rolls:{type:"int",default:3,min:1,max:8,description:"Number of frames that roll by"},barHeight:{type:"float",default:.12,min:0,max:.5,description:"Height of the bar between the frames"},barColor:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color of the bar between the frames"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:16:40 +0100",updatedAt:"Sat, 31 Oct 2026 18:16:40 +0100"},{name:"TvStatic",paramsTypes:{offset:"float"},defaultParams:{offset:.05},glsl:`// Author: Brandon Anzaldi
// License: MIT
// Description: Cuts to full-screen TV static, then to the incoming image
// Tags: static, noise, retro
// @param Part of the transition, at each end, that shows the images instead of static
uniform float offset; // = 0.05

// Pseudo-random noise function
// http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float noise(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy * progress, vec2(a, b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

vec4 transition(vec2 p) {
  if (progress < offset) {
    return getFromColor(p);
  } else if (progress > (1.0 - offset)) {
    return getToColor(p);
  } else {
    return vec4(vec3(noise(p)), max(getFromColor(p).a, getToColor(p).a)); // static where the images are
  }
}
`,author:"Brandon Anzaldi",license:"MIT",description:"Cuts to full-screen TV static, then to the incoming image",tags:["static","noise","retro"],params:{offset:{type:"float",default:.05,description:"Part of the transition, at each end, that shows the images instead of static"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"TvTurnOff",paramsTypes:{color:"vec4",glow:"float"},defaultParams:{color:[0,0,0,1],glow:1},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image collapses into a glowing line and a dot, like an old TV turned off, then the incoming image powers on from the dot
// Tags: retro, vertical, flash

// @color Color of the switched-off screen
uniform vec4 color; // = vec4(0.0, 0.0, 0.0, 1.0)
// @range(0, 2) Strength of the glow around the line and the dot
uniform float glow; // = 1.0

vec4 getColor(vec2 uv, bool isFrom) {
  return isFrom ? getFromColor(uv) : getToColor(uv);
}

// The screen at a time t of its power-off: 0 is the full image, 1 is off
vec4 screen(vec2 uv, float t, bool isFrom) {
  float collapse = smoothstep(0.0, 0.4, t); // the image squeezes into a line
  float shrink = smoothstep(0.3, 0.65, t); // the line shrinks into a dot
  float fade = 0.4 * smoothstep(0.75, 1.0, t); // the dot dims
  float radius = 0.01 * (1.0 - fade);
  // half size of the picture, in height units (x is scaled by ratio)
  vec2 size = vec2(mix(0.5 * ratio, radius, shrink), mix(0.5, radius, collapse));
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0);
  vec2 q = clamp(0.5 + 0.5 * p / size, 0.0, 1.0);
  vec4 c = getColor(q, isFrom);
  // the squeezed picture gets brighter and burns to white
  float white = smoothstep(0.4, 1.0, collapse);
  vec4 light = vec4(mix(min(c.rgb * (1.0 + 2.0 * collapse), 1.0), vec3(1.0), white), c.a);
  // soft edges, outside the picture so that t = 0 is the exact image
  vec2 d = abs(p) - size;
  float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  float inside = clamp(1.0 - dist / 0.004, 0.0, 1.0);
  // a glow around the line, tinted by the center of the picture, then warm white around the dot
  vec4 mid = getColor(vec2(0.5), isFrom);
  vec4 halo = vec4(mix(mix(mid.rgb, vec3(1.0), 0.7), vec3(1.0, 0.92, 0.8), shrink), mid.a);
  float h = 1.0 - exp(-2.0 * glow * white * exp(-max(dist, 0.0) / (0.02 + 0.04 * shrink)));
  vec4 col = mix(color, halo, h * (1.0 - fade));
  return mix(col, light, inside * (1.0 - fade));
}

vec4 transition(vec2 uv) {
  if (progress < 0.5) {
    return screen(uv, 2.0 * progress, true);
  }
  return screen(uv, 2.0 - 2.0 * progress, false);
}
`,author:"gre",license:"MIT",description:"The outgoing image collapses into a glowing line and a dot, like an old TV turned off, then the incoming image powers on from the dot",tags:["retro","vertical","flash"],params:{color:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color of the switched-off screen"},glow:{type:"float",default:1,min:0,max:2,description:"Strength of the glow around the line and the dot"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:16:40 +0100",updatedAt:"Sat, 31 Oct 2026 18:16:40 +0100"},{name:"UndulatingBurnOut",paramsTypes:{smoothness:"float",center:"vec2",color:"vec4"},defaultParams:{smoothness:.03,center:[.5,.5],color:[0,0,0,1]},glsl:`// License: MIT
// Author: pthrasher
// Description: A circle with a wavy edge burns out from the center to reveal the incoming image
// Tags: circle, burn, wipe
// adapted by gre from https://gist.github.com/pthrasher/8e6226b215548ba12734

// @param Softness of the edge
uniform float smoothness; // = 0.03
// @param Center of the circle
uniform vec2 center; // = vec2(0.5)
// @color Color of the burning edge
uniform vec4 color; // = vec4(0.0, 0.0, 0.0, 1.0)

const float M_PI = 3.14159265358979323846;

float quadraticInOut(float t) {
  float p = 2.0 * t * t;
  return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
}

float getGradient(float r, float dist) {
  float d = r - dist;
  return mix(
    smoothstep(-smoothness, 0.0, r - dist * (1.0 + smoothness)),
    -1.0 - step(0.005, d),
    step(-0.005, d) * step(d, 0.01)
  );
}

float getWave(vec2 p){
  vec2 _p = p - center; // offset from center
  float rads = atan(_p.y, _p.x);
  float degs = degrees(rads) + 180.0;
  vec2 range = vec2(0.0, M_PI * 30.0);
  vec2 domain = vec2(0.0, 360.0);
  float ratio = (M_PI * 30.0) / 360.0;
  degs = degs * ratio;
  float x = progress;
  float magnitude = mix(0.02, 0.09, smoothstep(0.0, 1.0, x));
  float offset = mix(40.0, 30.0, smoothstep(0.0, 1.0, x));
  float ease_degs = quadraticInOut(sin(degs));
  float deg_wave_pos = (ease_degs * magnitude) * sin(x * offset);
  // The soft edge reaches \`smoothness\` beyond the radius and the burn band 0.005 inside it:
  // start the radius below both so nothing but the outgoing image shows at progress 0
  // (unchanged from progress 0.1 on).
  return x - max(smoothness, 0.01) * (1.0 - smoothstep(0.0, 0.1, x)) + deg_wave_pos;
}

vec4 transition(vec2 p) {
  float dist = distance(center, p);
  float m = getGradient(getWave(p), dist);
  vec4 cfrom = getFromColor(p);
  vec4 cto = getToColor(p);
  return mix(mix(cfrom, cto, m), mix(cfrom, color, 0.75), step(m, -2.0));
}
`,author:"pthrasher",license:"MIT",description:"A circle with a wavy edge burns out from the center to reveal the incoming image",tags:["circle","burn","wipe"],params:{smoothness:{type:"float",default:.03,description:"Softness of the edge"},center:{type:"vec2",default:[.5,.5],description:"Center of the circle"},color:{type:"vec4",default:[0,0,0,1],color:!0,description:"Color of the burning edge"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 18:38:36 +0100"},{name:"Vaporize",paramsTypes:{direction:"vec2",rise:"float",swirl:"float",color:"vec4"},defaultParams:{direction:[0,1],rise:.4,swirl:.6,color:[.92,.92,.94,1]},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image goes up in smoke: from one side, the picture itself turns to vapour that rises over what is still intact, curls into wisps and pales as it thins out, revealing the incoming image underneath
// Tags: smoke, organic, noise, directional, reveal

// @param Direction the vapour rises toward (the image starts turning to vapour on the opposite side)
uniform vec2 direction; // = vec2(0.0, 1.0)
// @range(0.1, 0.6) How high the vapour rises above the image before it is gone, in frame heights
uniform float rise; // = 0.4
// @range(0, 1) How much the vapour swirls and curls as it rises
uniform float swirl; // = 0.6
// @color Color the vapour pales to as it thins out
uniform vec4 color; // = vec4(0.92, 0.92, 0.94, 1.0)

// raggedness of the line where the image turns to vapour, and the width over which it dissolves
const float RAGGED = 0.09;
const float BAND = 0.12;
// how long the vapour lives, as a part of the transition
const float LIFE = 0.16;
const int TAPS = 6;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
    mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  return 0.55 * vnoise(p) + 0.3 * vnoise(p * 2.03 + 5.1) + 0.15 * vnoise(p * 4.1 + 9.7);
}

// a swirling flow without sources or sinks: the curl of a noise field
vec2 curl(vec2 p) {
  float e = 0.1;
  float n = vnoise(p);
  float nx = vnoise(p + vec2(e, 0.0));
  float ny = vnoise(p + vec2(0.0, e));
  return vec2(ny - n, n - nx) / e;
}

// where the line is at time t, as a part of its way across: quicker through the margins
// outside the frame, slower across it
float sweep(float t) {
  return t + 0.6 * t * (1.0 - t) * (1.0 - 2.0 * t);
}

vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

vec4 transition(vec2 uv) {
  vec2 dir = length(direction) > 0.0 ? normalize(direction) : vec2(0.0, 1.0);
  vec2 side = vec2(-dir.y, dir.x);
  vec2 q = (uv - 0.5) * vec2(ratio, 1.0);
  float along = dot(q, dir);
  float across = dot(q, side);
  float ext = 0.5 * (abs(dir.x) * ratio + abs(dir.y));

  // the line where the image turns to vapour sweeps across the frame, ragged
  float ragged = RAGGED * (2.0 * fbm(q * 2.5 + 1.3) - 1.0);
  float start = -ext - RAGGED;
  float travel = 2.0 * ext + 2.0 * RAGGED + BAND;
  float front = start + travel * sweep(progress) + ragged;

  // under the vapour: the outgoing image where it is still intact, dissolving into the
  // incoming one just behind the line
  float gone = smoothstep(0.0, BAND, front - along);
  vec4 base = mix(getFromColor(uv), getToColor(uv), gone);

  // the vapour above the line: the higher it is, the longer ago it left the image
  float height = max(rise, 0.05) * (0.7 + 0.6 * vnoise(vec2(across * 3.0 + 2.7, 0.5)));
  float age = (along - front) / height;
  float released = progress - age * LIFE;
  if (age <= 0.0 || age >= 1.0 || released <= 0.0) return base;

  // where it came from: the line, back when it was released
  float origin = start + travel * sweep(released) + ragged;
  vec2 org = q - dir * (along - origin);

  // it swirls and curls as it rises
  vec2 sw = curl(org * 3.0 + dir * progress * 1.5) * (swirl * 0.08 * sqrt(age));
  vec2 src = org - sw;

  // and spreads out sideways, blurring as it rises
  vec2 spreadOut = (side * 0.07 + dir * 0.02) * sqrt(age);
  vec4 c = vec4(0.0);
  for (int i = 0; i < TAPS; i++) {
    float t = float(i) / float(TAPS - 1) - 0.5;
    vec4 img = getFromColor(mirror((src + spreadOut * t) / vec2(ratio, 1.0) + 0.5));
    c += vec4(img.rgb * img.a, img.a);
  }
  c = c.a > 0.0 ? vec4(c.rgb / c.a, c.a / float(TAPS)) : vec4(0.0);

  // it breaks up into wisps that rise with it and thin out: thin parts go first
  vec2 wq = (q - 0.6 * sw - dir * (progress * 2.5)) * 4.0;
  float w = fbm(vec2(dot(wq, side), dot(wq, dir) * 0.6) + 2.0);
  float density = smoothstep(1.2 * age - 0.2, 1.2 * age + 0.1, w);
  density *= 1.0 - smoothstep(0.3, 1.0, age);
  // (only the image turns to vapour, not what lies beyond its edge)
  density *= smoothstep(-ext, -ext + 0.05, origin);

  // it pales and loses its colour as it thins
  float pale = smoothstep(0.0, 0.5, age);
  float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  c = mix(c, vec4(mix(vec3(l), color.rgb, 0.7), c.a * color.a), pale * 0.85);
  // the edges of the wisps catch the light
  c.rgb = min(c.rgb + 0.12 * pale * density * (1.0 - density), vec3(1.0));
  // laid over what is under it
  float a = density * c.a;
  float outA = a + base.a * (1.0 - a);
  if (outA <= 0.0) return vec4(0.0);
  return vec4((c.rgb * a + base.rgb * base.a * (1.0 - a)) / outA, outA);
}
`,author:"gre",license:"MIT",description:"The outgoing image goes up in smoke: from one side, the picture itself turns to vapour that rises over what is still intact, curls into wisps and pales as it thins out, revealing the incoming image underneath",tags:["smoke","organic","noise","directional","reveal"],params:{direction:{type:"vec2",default:[0,1],description:"Direction the vapour rises toward (the image starts turning to vapour on the opposite side)"},rise:{type:"float",default:.4,min:.1,max:.6,description:"How high the vapour rises above the image before it is gone, in frame heights"},swirl:{type:"float",default:.6,min:0,max:1,description:"How much the vapour swirls and curls as it rises"},color:{type:"vec4",default:[.92,.92,.94,1],color:!0,description:"Color the vapour pales to as it thins out"}},textures:[],createdAt:"Fri, 13 Nov 2026 19:56:02 +0100",updatedAt:"Fri, 13 Nov 2026 19:56:02 +0100"},{name:"VerticalClose",paramsTypes:{},defaultParams:{},glsl:`// Author: martiniti
// License: MIT
// Description: The incoming image closes in from the left and right edges toward the middle
// Tags: wipe, split

vec4 transition (vec2 uv) {

  float s = 2.0 - abs((uv.x - 0.5) / (progress - 1.0)) - 2.0 * progress;
  
  return mix(
    getFromColor(uv),
    getToColor(uv),
    smoothstep(0.5, 0.0, s)
  );
}
`,author:"martiniti",license:"MIT",description:"The incoming image closes in from the left and right edges toward the middle",tags:["wipe","split"],params:{},textures:[],createdAt:"Tue, 4 Apr 2023 10:35:17 +0300",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"VerticalOpen",paramsTypes:{},defaultParams:{},glsl:`// Author: martiniti
// License: MIT
// Description: The incoming image opens from a line in the middle toward the left and right edges
// Tags: wipe, split

vec4 transition (vec2 uv) {

  float regress = 1.0 - progress;
  float s = 2.0 - abs((uv.x - 0.5) / (regress - 1.0)) - 2.0 * regress;
  
  return mix(
    getFromColor(uv),
    getToColor(uv),
    smoothstep(0.0, 0.5, s)
  );
}
`,author:"martiniti",license:"MIT",description:"The incoming image opens from a line in the middle toward the left and right edges",tags:["wipe","split"],params:{},textures:[],createdAt:"Tue, 4 Apr 2023 10:35:12 +0300",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"VhsTracking",paramsTypes:{bands:"int",noise:"float",bleed:"float",wobble:"float"},defaultParams:{bands:3,noise:.6,bleed:.5,wobble:.5},glsl:`// Author: gre
// License: MIT
// Description: Tape-tracking bands of white snow roll down the frame, tearing the lines around them, with smeared color, wobbling lines, a jittering strip at the bottom and a dropout flash, as the incoming image is recorded over the outgoing one under the densest band
// Tags: retro, glitch, noise, tape, scanlines

// @range(1, 4, 1) Number of noise bands rolling down (the first one carries the cut)
uniform int bands; // = 3
// @range(0, 1) Amount of snow and tearing in the bands
uniform float noise; // = 0.6
// @range(0, 1) How far the color smears to the right of the picture
uniform float bleed; // = 0.5
// @range(0, 1) How much the lines wobble sideways
uniform float wobble; // = 0.5

const float LINES = 220.0; // tape lines over the frame height
const float FRAMES = 40.0; // the noise changes this many times over the transition
const float BAND = 0.11; // half height of the main band
const float STRIP = 0.06; // height of the jittering strip at the bottom
const int TAPS = 6;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// the tape image on the outgoing (or, once re-recorded, incoming) side, premultiplied
vec4 tape(vec2 p, bool fresh) {
  p = mirror(p);
  vec4 c = fresh ? getToColor(p) : getFromColor(p);
  return vec4(c.rgb * c.a, c.a);
}

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

// how dense a band centered at y = c of half height w is on line y, with ragged edges
float bandDensity(float y, float c, float w, float jitter) {
  float d = abs(y - c) / w + 0.35 * jitter;
  return 1.0 - smoothstep(0.0, 1.0, d);
}

vec4 transition(vec2 uv) {
  // the effects build up quickly and settle at the end: exactly 0 at both ends
  float h = clamp(2.5 * (1.0 - abs(2.0 * progress - 1.0)), 0.0, 1.0);
  float env = h * h * (3.0 - 2.0 * h);
  // a short dropout flash when the main band crosses the middle of the frame
  float f = clamp(1.0 - abs(progress - 0.5) / 0.04, 0.0, 1.0);
  float flash = f * f * (3.0 - 2.0 * f);

  float frame = floor(progress * FRAMES);
  float line = floor(uv.y * LINES);
  float jitter = hash12(vec2(line, frame + 7.0)) - 0.5;

  // the main band rolls from above the frame to below it; the incoming image is above it
  float c0 = mix(1.0 + 1.2 * BAND, -1.2 * BAND, progress);
  // (the cut is ragged, line by line)
  bool fresh = uv.y > c0 + 0.8 * BAND * jitter;
  float dens = bandDensity(uv.y, c0, BAND, jitter);
  float tear = 1.0 - smoothstep(0.0, 1.0, abs(uv.y - c0) / (2.5 * BAND));
  // thinner and weaker bands roll faster, wrapping around the frame
  for (int i = 1; i < 4; i++) {
    if (i < bands) {
      float k = float(i);
      float w = BAND * (0.35 + 0.2 * hash12(vec2(k, 3.0)));
      float speed = 1.3 + 0.9 * k;
      float cy = -w + (1.0 + 2.0 * w) * fract(hash12(vec2(k, 5.0)) - speed * progress);
      dens = max(dens, 0.6 * bandDensity(uv.y, cy, w, jitter));
      tear = max(tear, 0.5 * (1.0 - smoothstep(0.0, 1.0, abs(uv.y - cy) / (2.5 * w))));
    }
  }
  dens *= env;
  tear *= env;

  // horizontal displacement of the line: a slow wobble, a fine jitter and the tearing
  float rowTear = hash12(vec2(floor(uv.y * LINES * 0.5), frame + 31.0)) - 0.5;
  float dx = wobble * env * (0.006 * sin(uv.y * 7.0 + progress * 23.0) + 0.004 * jitter);
  dx += (0.3 + 0.7 * noise) * tear * 0.18 * rowTear;
  // the head-switching strip at the bottom: lines skewed sideways and jittering
  float strip = env * (1.0 - smoothstep(0.0, STRIP, uv.y));
  dx += strip * (0.03 + 0.06 * (1.0 - uv.y / STRIP)) * (0.6 + 0.8 * hash12(vec2(frame, 41.0)));
  vec2 q = vec2(uv.x + dx, uv.y);

  vec4 c = tape(q, fresh);
  if (c.a <= 0.0) return vec4(0.0);
  // chroma bleed: the color is smeared to the right of the luma
  float len = bleed * (0.02 + 0.05 * dens) * env;
  vec4 avg = c;
  if (len > 0.0) {
    avg = vec4(0.0);
    for (int i = 0; i < TAPS; i++) {
      float u = (float(i) + 0.5) / float(TAPS);
      avg += tape(q - vec2(len * (0.4 + u), 0.0), fresh);
    }
    avg /= float(TAPS);
  }
  vec3 chroma = (avg.rgb - luma(avg.rgb)) / max(avg.a, 1e-5);
  vec3 rgb = luma(c.rgb) + chroma * c.a; // premultiplied by c.a
  // the signal fades and loses color under the bands
  rgb = mix(rgb, vec3(luma(rgb)), 0.6 * dens);

  // snow: short white streaks on the tape lines, denser in the bands
  // (the streaks of each line start at a random offset so they never line up vertically)
  vec2 cell = vec2(floor(uv.x * LINES * 0.3 * ratio + 40.0 * jitter), line);
  float n = hash12(cell + frame * vec2(37.0, 17.0));
  float amount = clamp(noise * max(1.3 * dens, 0.8 * strip) + 0.35 * flash, 0.0, 1.0);
  float snow = amount > 0.0 ? smoothstep(1.0 - amount, 1.0 - 0.6 * amount, n) : 0.0;
  snow *= 0.55 + 0.45 * hash12(cell.yx + frame);
  // and a finer sparkle between them
  float g = hash12(vec2(floor(uv.x * LINES * ratio), line) + frame * vec2(13.0, 29.0));
  snow = max(snow, amount > 0.0 ? 0.7 * smoothstep(1.0 - 0.4 * amount, 1.0, g) : 0.0);
  // and a few dark specks
  float dark = g < 0.1 * amount ? 1.0 : 0.0;
  // the dropout: whole stretches of a few lines go white
  float group = floor(uv.y * LINES / 3.0);
  float drop = step(1.0 - 0.15 * flash, hash12(vec2(group, floor(uv.x * 6.0 + 5.0 * hash12(vec2(group, frame))) + frame * 7.0)));
  rgb *= 1.0 - 0.5 * dark;
  rgb += (clamp(snow + drop + 0.12 * flash, 0.0, 1.0)) * (c.a - rgb);

  return vec4(clamp(rgb / c.a, 0.0, 1.0), c.a);
}
`,author:"gre",license:"MIT",description:"Tape-tracking bands of white snow roll down the frame, tearing the lines around them, with smeared color, wobbling lines, a jittering strip at the bottom and a dropout flash, as the incoming image is recorded over the outgoing one under the densest band",tags:["retro","glitch","noise","tape","scanlines"],params:{bands:{type:"int",default:3,min:1,max:4,step:1,description:"Number of noise bands rolling down (the first one carries the cut)"},noise:{type:"float",default:.6,min:0,max:1,description:"Amount of snow and tearing in the bands"},bleed:{type:"float",default:.5,min:0,max:1,description:"How far the color smears to the right of the picture"},wobble:{type:"float",default:.5,min:0,max:1,description:"How much the lines wobble sideways"}},textures:[],createdAt:"Wed, 4 Nov 2026 08:02:59 +0100",updatedAt:"Wed, 4 Nov 2026 08:02:59 +0100"},{name:"Vortex",paramsTypes:{grid:"int",center:"vec2",spin:"float",randomness:"float"},defaultParams:{grid:24,center:[.5,.5],spin:1,randomness:.2},glsl:`// Author: gre
// License: MIT
// Description: The outgoing image breaks into hundreds of small squares that a tornado carries away along a spiral around the center, from the eye outward, uncovering the incoming image
// Tags: tiles, spiral, rotation, shatter

// @range(4, 40, 1) Number of rows of squares
uniform int grid; // = 24
// Center of the tornado
uniform vec2 center; // = vec2(0.5, 0.5)
// @range(-4, 4) Turns each square makes around the center as it flies away (negative turns clockwise)
uniform float spin; // = 1.0
// @range(0, 1) How randomly the squares leave: 0 from the center outward, 1 in any order
uniform float randomness; // = 0.2

// the squares leave in GROUPS waves, each one flying for DURATION of the transition
const int GROUPS = 24;
const float DURATION = 0.25;
// half width of the antialiased edge of the squares, in frame heights
const float AA = 0.0015;
const float TAU = 6.2831853;

float hash(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 78.233))) * 43758.5453);
}

// the wave a square (by its cell index) leaves with
int groupOf(vec2 n, float h, vec2 c, float maxR) {
  // only the very corners leave last
  float r = min(length((n + 0.5) * h - c) / (0.85 * maxR), 1.0);
  float key = clamp(mix(r * sqrt(r), hash(n), clamp(randomness, 0.0, 1.0)), 0.0, 0.9999);
  return int(floor(key * float(GROUPS)));
}

// local time of a wave's flight, 0 before it leaves, 1 once it has vanished
float flight(int g) {
  float delay = float(g) / float(GROUPS) * (1.0 - DURATION);
  return clamp((progress - delay) / DURATION, 0.0, 1.0);
}

vec4 premultiplied(vec4 c) {
  return vec4(c.rgb * c.a, c.a);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  // measured in square pixels, so the squares stay square
  vec2 aspect = vec2(ratio, 1.0);
  vec2 p = uv * aspect;
  vec2 c = center * aspect;
  float maxR = max(max(length(c), length(c - vec2(ratio, 0.0))), max(length(c - vec2(0.0, 1.0)), length(c - aspect)));
  float h = 1.0 / float(grid < 1 ? 1 : grid);
  // how far a square is pushed away from the center by the end of its flight
  float reach = 0.7 * maxR;

  // the incoming image, under the squares that have not left yet
  vec2 n0 = floor(p / h);
  vec4 col = flight(groupOf(n0, h, c, maxR)) <= 0.0 ? premultiplied(getFromColor(uv)) : premultiplied(getToColor(uv));

  // the flying squares, painted from the last wave to leave (lowest) to the first (highest)
  for (int k = 0; k < GROUPS; k++) {
    int g = GROUPS - 1 - k;
    float s = flight(g);
    if (s <= 0.0 || s >= 1.0) continue;
    float e = s * s;
    // like in a tornado, the squares near the eye (the first to leave) spin much faster than
    // the outer ones; all of them orbit before they are flung out
    float angle = spin * TAU * e * 2.0 / (1.0 + 6.0 * float(g) / float(GROUPS));
    float push = reach * e * s;
    // the squares lift toward the viewer, then shrink away
    float size = (1.0 + 0.35 * sin(3.1415927 * s)) * (1.0 - s * s * s);
    float ca = cos(angle);
    float sa = sin(angle);
    mat2 rot = mat2(ca, sa, -sa, ca);
    // undo the wave's spiral to guess which square lands here, then test its neighbors exactly
    vec2 u = (p - c) * rot;
    float ru = length(u);
    vec2 guess = c + (ru > 0.0 ? u / ru : vec2(0.0)) * max(ru - push, 0.0);
    vec2 ng = floor(guess / h);
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 n = ng + vec2(float(i), float(j));
        if (groupOf(n, h, c, maxR) != g) continue;
        vec2 home = (n + 0.5) * h;
        vec2 rel = home - c;
        float rr = length(rel);
        vec2 dir = rr > 0.0 ? rel / rr : vec2(0.0);
        vec2 pos = c + rot * (dir * (rr + push));
        // each square also tumbles on itself
        float tumble = angle + (hash(n + 17.0) - 0.5) * 3.0 * e * sign(spin);
        float ct = cos(tumble);
        float st = sin(tumble);
        vec2 d = ((p - pos) * mat2(ct, st, -st, ct)) / max(size, 1e-4);
        float edge = 0.5 * h - max(abs(d.x), abs(d.y));
        float cov = clamp(edge * size / (2.0 * AA) + 0.5, 0.0, 1.0);
        vec2 src = home + d;
        if (cov <= 0.0 || src.x < 0.0 || src.y < 0.0 || src.x > ratio || src.y > 1.0) continue;
        vec4 piece = premultiplied(getFromColor(src / aspect)) * cov;
        col = piece + col * (1.0 - piece.a);
      }
    }
  }
  return col.a > 0.0 ? vec4(col.rgb / col.a, col.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The outgoing image breaks into hundreds of small squares that a tornado carries away along a spiral around the center, from the eye outward, uncovering the incoming image",tags:["tiles","spiral","rotation","shatter"],params:{grid:{type:"int",default:24,min:4,max:40,step:1,description:"Number of rows of squares"},center:{type:"vec2",default:[.5,.5]},spin:{type:"float",default:1,min:-4,max:4,description:"Turns each square makes around the center as it flies away (negative turns clockwise)"},randomness:{type:"float",default:.2,min:0,max:1,description:"How randomly the squares leave: 0 from the center outward, 1 in any order"}},textures:[],createdAt:"Wed, 4 Nov 2026 20:13:09 +0100",updatedAt:"Wed, 4 Nov 2026 20:13:09 +0100"},{name:"WarpSpeed",paramsTypes:{center:"vec2",streaks:"float",streakColor:"vec4",strength:"float",flash:"float"},defaultParams:{center:[.5,.5],streaks:160,streakColor:[.78,.88,1,1],strength:.6,flash:.5},glsl:`// Author: gre
// License: MIT
// Description: The camera jumps to light speed: star streaks shoot out from the center and stretch longer and longer while the outgoing image is pulled into a radial smear, then after a flash the incoming image emerges from the center as the streaks shrink back
// Tags: zoom, radial, light, motion-blur, space

// @param Point the camera flies toward, from (0, 0) at the bottom left to (1, 1) at the top right
uniform vec2 center; // = vec2(0.5, 0.5)
// @range(20, 400) Number of star streaks around the center
uniform float streaks; // = 160.0
// @color Color of the streaks and of the flash, added as light
uniform vec4 streakColor; // = vec4(0.78, 0.88, 1.0, 1.0)
// @range(0, 1) Length of the streaks and of the radial smear
uniform float strength; // = 0.6
// @range(0, 1) Brightness of the flash at the peak of the jump
uniform float flash; // = 0.5

const float PI = 3.141592653589793;
const int TAPS = 12;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// one layer of stars: one per angular cell, flying outward and stretched along its ray
float stars(float a, float r, float n, float layer, float travel, float speed, float reach) {
  float cell = floor(a * n);
  float h1 = hash(vec2(cell, layer));
  float h2 = hash(vec2(cell, layer + 17.0));
  float h3 = hash(vec2(cell, layer + 31.0));
  // where the star is in its flight, from near the center to past the corners,
  // speeding up as it comes closer
  float life = fract(h1 + travel * (0.6 + 0.8 * h2));
  float head = reach * (0.05 + 1.05 * pow(life, 1.4));
  // the streak is the path of the star during the exposure: longer when the camera is faster
  float tail = head * (1.0 - min(0.9, speed * (0.15 + 0.5 * h3)));
  float along = clamp((r - tail) / max(head - tail, 1e-4), 0.0, 1.0);
  float inside = step(tail, r) * (1.0 - smoothstep(head - 0.006, head, r));
  // brightest at the head, fading toward the tail
  float profile = inside * along * along;
  // thin across the ray, a bit wider away from the center, with a faint halo,
  // faded out before the edges of the cell so that no seam shows between cells
  float f = fract(a * n);
  float cellWidth = 2.0 * PI * r / n;
  float offset = 0.3 + 0.4 * h3;
  float across = (f - offset) * cellWidth;
  float width = min(0.0014 + 0.002 * r / reach, 0.15 * cellWidth);
  float x = across * across / (width * width);
  float line = (exp(-x) + 0.25 * exp(-x / 9.0)) * smoothstep(0.0, 0.2, min(f, 1.0 - f));
  // fade in from far away, out past the frame, and only some cells hold a star
  float fade = smoothstep(0.0, 0.2, life) * (1.0 - smoothstep(0.9, 1.0, life));
  return profile * line * fade * (0.4 + 0.6 * h2) * step(0.25, hash(vec2(cell, layer + 43.0)));
}

// an image pulled into a radial smear toward the center: scaled by k, blurred over a fraction b
vec4 smear(vec2 uv, float k, float b, float jitter, bool incoming) {
  if (b <= 0.0 && k >= 1.0) {
    vec4 c = incoming ? getToColor(uv) : getFromColor(uv);
    return vec4(c.rgb * c.a, c.a);
  }
  vec4 sum = vec4(0.0);
  for (int i = 0; i < TAPS; i++) {
    float s = k * (1.0 - b * (float(i) + jitter) / float(TAPS));
    vec2 q = center + (uv - center) * s;
    vec4 c = incoming ? getToColor(q) : getFromColor(q);
    sum += vec4(c.rgb * c.a, c.a);
  }
  return sum / float(TAPS);
}

vec4 transition(vec2 uv) {
  float p = progress;
  vec2 aspect = vec2(ratio, 1.0);
  vec2 d = (uv - center) * aspect;
  float r = length(d);
  // (nudged off zero, where atan is undefined)
  float a = atan(d.y, d.x + 1e-6) / (2.0 * PI) + 0.5;
  // distance from the center to the farthest corner
  vec2 far = max(center, 1.0 - center) * aspect;
  float reach = length(far);

  // the camera speeds up to the jump, at the middle, then slows down
  float speed = sin(PI * p);
  speed *= speed;
  float travel = 3.0 * (p - sin(2.0 * PI * p) / (2.0 * PI));
  float jitter = hash(floor(uv * aspect * 997.0));

  // the outgoing image is pulled forward into the smear; the incoming one arrives
  // magnified and smeared, and settles
  float goOut = smoothstep(0.0, 0.55, p);
  float goIn = 1.0 - smoothstep(0.45, 1.0, p);
  // the incoming image emerges from the center and spreads out to the corners
  float soft = 0.35 * reach;
  float edge = mix(-soft, reach + soft, smoothstep(0.42, 0.78, p));
  float m = 1.0 - smoothstep(edge - soft, edge, r);
  vec4 before = vec4(0.0);
  vec4 after = vec4(0.0);
  if (m < 1.0) before = smear(uv, 1.0 - 0.3 * strength * goOut * goOut, 0.6 * strength * goOut, jitter, false);
  if (m > 0.0) after = smear(uv, 1.0 - 0.3 * strength * goIn * goIn, 0.6 * strength * goIn, jitter, true);
  vec4 c = mix(before, after, m);
  // darker while in the jump, so that the streaks stand out, and brighter soon after it
  // so the incoming image comes out clear
  float dark = p < 0.5 ? speed : speed * speed * speed;
  c.rgb *= 1.0 - 0.65 * (0.5 + 0.5 * strength) * dark;

  // the streaks: two layers of stars, their length growing with the speed
  float n = max(floor(streaks), 1.0);
  float len = speed * (0.5 + 1.5 * strength);
  float s = stars(a, r, n, 1.0, travel, len, reach);
  s += stars(fract(a + 0.37), r, max(floor(n * 0.71), 1.0), 2.0, travel * 1.3, len, reach);
  // the flash, brightest at the center, where the incoming image emerges
  float core = r / (0.35 * reach);
  float peak = (p - 0.5) * 9.0;
  float glow = flash * exp(-peak * peak) * speed * (0.35 + 0.9 * exp(-core * core));
  vec3 light = streakColor.rgb * streakColor.a * (2.2 * s * speed + glow);
  // light is added to the image, but adds no opacity
  return c.a > 0.0 ? vec4(clamp(c.rgb / c.a + light, 0.0, 1.0), c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"The camera jumps to light speed: star streaks shoot out from the center and stretch longer and longer while the outgoing image is pulled into a radial smear, then after a flash the incoming image emerges from the center as the streaks shrink back",tags:["zoom","radial","light","motion-blur","space"],params:{center:{type:"vec2",default:[.5,.5],description:"Point the camera flies toward, from (0, 0) at the bottom left to (1, 1) at the top right"},streaks:{type:"float",default:160,min:20,max:400,description:"Number of star streaks around the center"},streakColor:{type:"vec4",default:[.78,.88,1,1],color:!0,description:"Color of the streaks and of the flash, added as light"},strength:{type:"float",default:.6,min:0,max:1,description:"Length of the streaks and of the radial smear"},flash:{type:"float",default:.5,min:0,max:1,description:"Brightness of the flash at the peak of the jump"}},textures:[],createdAt:"Thu, 5 Nov 2026 07:29:56 +0100",updatedAt:"Thu, 5 Nov 2026 07:29:56 +0100"},{name:"WaterDrop",paramsTypes:{amplitude:"float",speed:"float",center:"vec2",refraction:"float",highlight:"float"},defaultParams:{amplitude:30,speed:30,center:[.5,.5],refraction:.015,highlight:.5},glsl:`// Author: Paweł Płóciennik
// License: MIT
// Description: A drop falls into the image like into still water: round ripples spread out from where it hits, bending the image with glints on their slopes, the incoming image shows up inside the leading ripple, and the water calms down
// Tags: ripple, water, refraction, circle
// @range(10, 80) Frequency of the ripples: higher makes them closer together
uniform float amplitude; // = 30
// @range(0, 80) Speed of the ripples as they run outward through the spreading rings
uniform float speed; // = 30
// @param Where the drop falls, in texture coordinates
uniform vec2 center; // = vec2(0.5, 0.5)
// @range(0, 0.08) How far the ripples bend the image, in frame heights
uniform float refraction; // = 0.015
// @range(0, 1) Brightness of the glints on the ripples
uniform float highlight; // = 0.5

// mirror the coordinates back into the frame
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// height of the water, from -1 to 1, at a distance s inside the front
float wave(float s, float k, float lambda, float t) {
  // it rises just ahead of the front and dies out a few ripples behind it
  float env = smoothstep(-0.3 * lambda, 0.6 * lambda, s) * exp(-s / (3.5 * lambda));
  // the ripples run out through the train, faster than the train itself spreads
  return env * sin(k * s + speed * t);
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);

  float k = 2.0 * max(amplitude, 1.0);
  float lambda = 6.2831853 / k;
  // measured in square pixels, so the ripples are round
  vec2 q = (uv - center) * vec2(ratio, 1.0);
  float r = length(q);
  vec2 dir = r > 0.0 ? q / r : vec2(0.0);
  // the farthest corner of the frame
  vec2 far = max(center, 1.0 - center) * vec2(ratio, 1.0);
  float R = length(far);

  // the incoming image shows from a little behind the front, with a soft edge
  float edge = 0.35 * lambda;
  float soft = 0.1 * lambda;
  // the front spreads out, slowing down a little, from just before the drop hits until
  // its revealed area is past the farthest corner
  float t = progress;
  float e = mix(t, 1.0 - (1.0 - t) * (1.0 - t), 0.4);
  float front = mix(-0.3 * lambda, R + edge + soft + 0.01, e);
  float s = front - r;

  // the water calms down at the end
  float calm = 1.0 - smoothstep(0.55, 1.0, t);
  calm *= calm;
  // slope of the water along the radius, normalized to at most about 1
  // (one-sided at the very center)
  float d = 0.02 * lambda;
  float r0 = max(r - d, 0.0);
  float slope = calm * (wave(front - r - d, k, lambda, t) - wave(front - r0, k, lambda, t)) / ((r + d - r0) * k);
  vec2 offset = dir * slope * refraction / vec2(ratio, 1.0);

  vec4 ca = getFromColor(mirror(uv - offset));
  vec4 cb = getToColor(mirror(uv - offset));
  float m = smoothstep(edge - soft, edge + soft, s);
  // mixed premultiplied, so transparent images do not bleed their color
  vec4 c = mix(vec4(ca.rgb * ca.a, ca.a), vec4(cb.rgb * cb.a, cb.a), m);

  // the slopes facing the light glint, the ones facing away darken a little,
  // and the crests are a little brighter than the troughs
  float h = calm * wave(s, k, lambda, t);
  float lit = -dot(dir, normalize(vec2(-0.6, 0.8))) * slope;
  float glint = highlight * (0.2 * h + 0.6 * smoothstep(0.2, 0.9, lit) - 0.3 * smoothstep(0.2, 0.9, -lit));
  c.rgb = clamp(c.rgb + glint * c.a, 0.0, c.a);
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"Paweł Płóciennik",license:"MIT",description:"A drop falls into the image like into still water: round ripples spread out from where it hits, bending the image with glints on their slopes, the incoming image shows up inside the leading ripple, and the water calms down",tags:["ripple","water","refraction","circle"],params:{amplitude:{type:"float",default:30,min:10,max:80,description:"Frequency of the ripples: higher makes them closer together"},speed:{type:"float",default:30,min:0,max:80,description:"Speed of the ripples as they run outward through the spreading rings"},center:{type:"vec2",default:[.5,.5],description:"Where the drop falls, in texture coordinates"},refraction:{type:"float",default:.015,min:0,max:.08,description:"How far the ripples bend the image, in frame heights"},highlight:{type:"float",default:.5,min:0,max:1,description:"Brightness of the glints on the ripples"}},textures:[],createdAt:"Wed, 21 Feb 2018 19:37:15 +0100",updatedAt:"Sat, 7 Nov 2026 18:52:06 +0100"},{name:"WaveWipe",paramsTypes:{direction:"vec2",curl:"float",foam:"float",refraction:"float",water:"vec4",foamColor:"vec4"},defaultParams:{direction:[1,0],curl:.3,foam:.6,refraction:.04,water:[.05,.36,.46,.75],foamColor:[1,1,1,1]},glsl:`// Author: gre
// License: MIT
// Description: A breaking wave crashes across the frame, its lip curling over in front of its face and throwing foam and spray ahead, its shadow darkening the outgoing image; the incoming image is left behind it, tinted and bent by the water, clearing as the wave passes
// Tags: water, wave, ocean, foam, directional, reveal

// @param Direction the wave travels toward
uniform vec2 direction; // = vec2(1.0, 0.0)
// @range(0.1, 0.45) Size of the curling lip, in wave heights: how far it overhangs ahead of the face
uniform float curl; // = 0.3
// @range(0, 1) Amount of foam on the crest and spray thrown ahead of it
uniform float foam; // = 0.6
// @range(0, 0.1) How much the water bends the incoming image behind the wave
uniform float refraction; // = 0.04
// @color Color of the water tinting the incoming image behind the wave (its alpha is its strength)
uniform vec4 water; // = vec4(0.05, 0.36, 0.46, 0.75)
// @color Color of the foam and spray (its alpha is its strength)
uniform vec4 foamColor; // = vec4(1.0, 1.0, 1.0, 1.0)

const float PI = 3.141592653589793;
// half width of the antialiased edges, in wave heights
const float AA = 0.002;
// how far the base of the face trails behind its top, in wave heights
const float TRAIL = 0.35;
// how far behind the face the water still tints the incoming image, in wave heights
const float BAND = 0.4;
// how far ahead of the lip the spray reaches, in wave heights
const float REACH = 0.25;

float hash12(vec2 v) {
  vec3 v3 = fract(vec3(v.xyx) * 0.1031);
  v3 += dot(v3, v3.yzx + 33.33);
  return fract((v3.x + v3.y) * v3.z);
}

float vnoise(vec2 v) {
  vec2 i = floor(v);
  vec2 f = fract(v);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x),
    mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// folds coordinates back into the frame, so a displaced image never shows its clamped edges
vec2 mirror(vec2 v) {
  return 1.0 - abs(1.0 - mod(v, 2.0));
}

// droplets scattered in cells, one per cell at most, kept inside their cell
float droplets(vec2 q, float cell, float density, float seed) {
  vec2 g = q / cell;
  vec2 id = floor(g);
  if (hash12(id + seed) >= density) return 0.0;
  float r = 0.1 + 0.2 * hash12(id + seed + 4.7);
  vec2 c = id + 0.5 + (0.45 - r) * (vec2(hash12(id + seed + 1.3), hash12(id + seed + 8.1)) * 2.0 - 1.0);
  float px = AA / cell;
  return 1.0 - smoothstep(r - px, r + px, length(g - c));
}

vec4 transition(vec2 uv) {
  if (progress <= 0.0) return getFromColor(uv);
  if (progress >= 1.0) return getToColor(uv);
  float t = progress;

  vec2 dir = length(direction) > 0.0 ? normalize(direction) : vec2(1.0, 0.0);
  // the crest points up the frame, or to the left when the wave travels straight up or down
  vec2 up = vec2(-dir.y, dir.x);
  if (up.y < 0.0 || (up.y == 0.0 && up.x > 0.0)) up = -up;
  // half extents of the frame along the travel and across it, in frame heights
  float e = 0.5 * (abs(dir.x) * ratio + abs(dir.y));
  float w = 0.5 * (abs(up.x) * ratio + abs(up.y));
  // in wave heights: u along the travel, v from the trough (0) to the crest (1)
  vec2 p = (uv - 0.5) * vec2(ratio, 1.0) / (2.0 * w);
  vec2 q = vec2(dot(p, dir), dot(p, up) + 0.5);
  float E = e / (2.0 * w);

  float R = max(curl, 0.01);
  // radius of the hollow at the back of the curl, where it meets the face
  float Rb = 0.5 * R;
  // the lip pitches forward, then curls further down as the wave travels
  float tipAngle = PI * (0.08 - 0.5 * smoothstep(0.0, 0.85, t));
  // the wave sweeps from fully ahead of the frame, spray included, to fully past it, tinted water included
  float travel = mix(t, t * t * (3.0 - 2.0 * t), 0.25);
  vec2 C = vec2(mix(-E - R - REACH, E + Rb + TRAIL + BAND, travel), 1.02 - R);

  // polar coordinates around the center of the curl
  vec2 d = q - C;
  // atan is undefined at the very center
  if (d.x == 0.0) d.x = 1e-6;
  float r = length(d);
  float ang = atan(d.y, d.x);
  // the inner surface of the curl spirals in from the tip of the lip (zero thickness) to the back of the hollow
  float k = clamp((ang - tipAngle) / (PI - tipAngle), 0.0, 1.0);
  float rIn = R - (R - Rb) * (1.0 - (1.0 - k) * (1.0 - k));
  bool curled = ang >= tipAngle;
  // the face below the curl: vertical where it meets the hollow, its base trailing behind
  float s = 1.0 - clamp(q.y / C.y, 0.0, 1.0);
  float face = C.x - Rb - TRAIL * s * s;
  float behind = face - q.x; // > 0 behind the face

  float wet;
  if (curled) {
    wet = smoothstep(-AA, AA, r - rIn) * (ang > 0.5 * PI ? 1.0 : 1.0 - smoothstep(-AA, AA, r - R));
  } else {
    wet = smoothstep(-AA, AA, behind);
  }
  // the lip: the curl in front of the top of the wave
  float lip = curled ? 1.0 - smoothstep(0.5 * PI - 0.3, 0.5 * PI + 0.5, ang) : 0.0;

  float n = vnoise(q * vec2(14.0, 10.0) + vec2(-9.0 * t, 3.0 * t));

  // outgoing image, darkened in the hollow and in the shadow of the overhang just ahead of it
  vec4 a = getFromColor(uv);
  float gap = max(min(r - R, -behind), 0.0);
  float shade = 0.55 * exp(-gap / 0.1) * (1.0 - smoothstep(0.0, REACH, gap)) * smoothstep(0.0, 0.6, q.y) * (1.0 - smoothstep(C.y + 0.2 * R, C.y + 1.1 * R, q.y));
  shade += 0.25 * (1.0 - smoothstep(0.0, R, r));
  a.rgb *= 1.0 - shade;
  // spray thrown ahead of the crest, drifting forward and falling, and a mist along it
  float fwd = max(r - R, 0.0);
  float zone = smoothstep(tipAngle - 0.4, tipAngle + 0.2, ang) * (1.0 - smoothstep(0.0, REACH, fwd)) * step(0.0, r - R);
  // stretched along the throw, so the droplets streak forward
  vec2 sq = (d - t * vec2(0.5, -0.25)) * vec2(0.55, 1.0);
  float thin = exp(-fwd / 0.12);
  float spray = droplets(sq, 0.02, foam * thin, 1.0) + 0.6 * droplets(sq * 1.6 + 3.1, 0.02, foam * thin, 7.0);
  // the mist hugs the outside of the lip only
  float mist = foam * n * n * exp(-fwd / 0.06) * (1.0 - smoothstep(0.0, REACH, fwd)) * smoothstep(-AA, AA, r - R) * smoothstep(tipAngle, tipAngle + 0.3, ang);
  a.rgb = mix(a.rgb, foamColor.rgb, foamColor.a * clamp(spray * zone + mist, 0.0, 1.0));

  // incoming image behind the face, bent and tinted by the water, clearing further behind
  float band = max(1.0 - smoothstep(0.05, BAND, behind), lip);
  float bend = refraction * band * band;
  vec2 off = bend * (dir * sin(17.0 * q.y + 2.0 * sin(9.0 * q.x) - 6.0 * t) + up * cos(13.0 * q.x - 5.0 * t));
  vec4 b = getToColor(mirror(uv + off * 2.0 * w / vec2(ratio, 1.0)));
  float luma = dot(b.rgb, vec3(0.299, 0.587, 0.114));
  // lit near the top of the face and through the thin lip, darker on the underside of the lip
  vec3 tinted = water.rgb * (0.4 + 0.9 * luma) * (1.0 + 0.6 * q.y);
  tinted += 0.18 * lip * (1.0 - k) * vec3(0.5, 1.0, 0.9);
  tinted *= 1.0 - 0.35 * lip * (1.0 - smoothstep(0.0, 0.06, r - rIn));
  // a bright line along the surface of the face, fading up into the hollow
  tinted += 0.35 * (curled ? k * (1.0 - smoothstep(0.0, 0.015, r - rIn)) : 1.0 - smoothstep(0.0, 0.015, behind)) * vec3(0.7, 0.95, 1.0);
  b.rgb = mix(b.rgb, tinted, water.a * band);

  // foam: whitewater along the outer edge of the lip, and churning at the base of the face
  float crest = curled ? (1.0 - smoothstep(0.01, 0.02 + 0.12 * n, abs(R - r))) * smoothstep(tipAngle, tipAngle + 0.4, ang) * (1.0 - smoothstep(0.5 * PI + 0.2, 0.5 * PI + 0.8, ang)) : 0.0;
  float churn = (1.0 - smoothstep(0.0, 0.15 + 0.1 * n, q.y)) * (1.0 - smoothstep(0.0, 0.3, abs(behind))) * smoothstep(0.3, 0.7, n);
  b.rgb = mix(b.rgb, foamColor.rgb, foamColor.a * clamp(foam * 1.5 * (crest + churn), 0.0, 1.0));

  // mixed premultiplied, so transparent images do not bleed their color
  vec4 c = mix(vec4(a.rgb * a.a, a.a), vec4(b.rgb * b.a, b.a), wet);
  return c.a > 0.0 ? vec4(c.rgb / c.a, c.a) : vec4(0.0);
}
`,author:"gre",license:"MIT",description:"A breaking wave crashes across the frame, its lip curling over in front of its face and throwing foam and spray ahead, its shadow darkening the outgoing image; the incoming image is left behind it, tinted and bent by the water, clearing as the wave passes",tags:["water","wave","ocean","foam","directional","reveal"],params:{direction:{type:"vec2",default:[1,0],description:"Direction the wave travels toward"},curl:{type:"float",default:.3,min:.1,max:.45,description:"Size of the curling lip, in wave heights: how far it overhangs ahead of the face"},foam:{type:"float",default:.6,min:0,max:1,description:"Amount of foam on the crest and spray thrown ahead of it"},refraction:{type:"float",default:.04,min:0,max:.1,description:"How much the water bends the incoming image behind the wave"},water:{type:"vec4",default:[.05,.36,.46,.75],color:!0,description:"Color of the water tinting the incoming image behind the wave (its alpha is its strength)"},foamColor:{type:"vec4",default:[1,1,1,1],color:!0,description:"Color of the foam and spray (its alpha is its strength)"}},textures:[],createdAt:"Fri, 6 Nov 2026 17:50:09 +0100",updatedAt:"Fri, 6 Nov 2026 17:50:09 +0100"},{name:"WedgeWipe",paramsTypes:{angle:"float",smoothness:"float",center:"vec2"},defaultParams:{angle:0,smoothness:.01,center:[.5,.5]},glsl:`// Author: gre
// License: MIT
// Description: Two hands sweep away from each other around the center, opening a widening wedge that reveals the incoming image
// Tags: wipe, radial, clock, wedge

#define PI 3.141592653589793

// @range(-180, 180) Direction the wedge opens from, in degrees clockwise from 12 o'clock
uniform float angle; // = 0.0
// @range(0, 0.2) Softness of the hands' edges
uniform float smoothness; // = 0.01
// @param Point the hands turn around
uniform vec2 center; // = vec2(0.5)

vec4 transition (vec2 uv) {
  // At the end, float PI rounds above pi and sin(spread) can turn slightly negative
  if (progress >= 1.0) return getToColor(uv);
  // Measured in square pixels, so the angles are not stretched
  vec2 q = (uv - center) * vec2(ratio, 1.0);
  float a = radians(angle);
  // Local frame: y along the starting direction, x across it (the wedge is symmetric)
  vec2 p = vec2(abs(q.x * cos(a) - q.y * sin(a)), q.x * sin(a) + q.y * cos(a));
  // Each hand has turned by half a turn at the end
  float spread = PI * progress;
  vec2 hand = vec2(sin(spread), cos(spread));
  // Signed distance to the wedge: the nearest hand, negative inside
  float l = length(p);
  float d = length(p - hand * clamp(dot(p, hand), 0.0, l)) * sign(hand.y * p.x - hand.x * p.y);
  // The soft edge keeps an even width and slides from outside to inside the hands,
  // so nothing is revealed at the start and everything is at the end
  float s = max(smoothness, 0.001);
  float m = 1.0 - smoothstep(0.0, s, d + s * (1.0 - progress));
  return mix(getFromColor(uv), getToColor(uv), m);
}
`,author:"gre",license:"MIT",description:"Two hands sweep away from each other around the center, opening a widening wedge that reveals the incoming image",tags:["wipe","radial","clock","wedge"],params:{angle:{type:"float",default:0,min:-180,max:180,description:"Direction the wedge opens from, in degrees clockwise from 12 o'clock"},smoothness:{type:"float",default:.01,min:0,max:.2,description:"Softness of the hands' edges"},center:{type:"vec2",default:[.5,.5],description:"Point the hands turn around"}},textures:[],createdAt:"Mon, 2 Nov 2026 09:49:36 +0100",updatedAt:"Mon, 2 Nov 2026 09:49:36 +0100"},{name:"WhipPan",paramsTypes:{direction:"vec2",blur:"float"},defaultParams:{direction:[-1,0],blur:.4},glsl:`// Author: gre
// License: MIT
// Description: A fast camera pan that streaks both images with motion blur, the incoming one arriving from the opposite side
// Tags: slide, motion-blur, directional

// @param Direction in which the images move
uniform vec2 direction; // = vec2(-1.0, 0.0)
// @range(0, 1) Length of the motion blur at full speed
uniform float blur; // = 0.4

const int SAMPLES = 24;

// The panned strip: the outgoing image, then the incoming one behind it
vec4 strip(vec2 q, vec2 d) {
  vec2 qt = q + d;
  // which side of the seam between the two images (works for diagonals too)
  if (dot(q - 0.5, -d) < 0.5 * dot(d, d)) {
    return getFromColor(clamp(q, 0.0, 1.0));
  }
  return getToColor(clamp(qt, 0.0, 1.0));
}

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec4 transition(vec2 uv) {
  vec2 d = sign(direction);
  // ease in and out: slow start, whip in the middle, slow landing
  float p = progress;
  float h = 1.0 - abs(2.0 * p - 1.0); // 0 at both ends, 1 in the middle
  // mostly cubic, with a bit of linear so that it starts moving at once
  float e = 0.5 * h * (0.1 + 0.9 * h * h);
  float pos = p < 0.5 ? e : 1.0 - e;
  float len = blur * h * (0.1 + 2.7 * h * h) / 2.8; // follows the speed

  vec2 q = uv - d * pos;
  // average along the motion, jittered to hide the sample steps
  float jitter = rand(uv);
  vec3 color = vec3(0.0);
  float alpha = 0.0;
  for (int i = 0; i < SAMPLES; i++) {
    float t = (float(i) + jitter) / float(SAMPLES) - 0.5;
    vec4 c = strip(q + d * t * len, d);
    color += c.rgb * c.a;
    alpha += c.a;
  }
  return vec4(color / max(alpha, 1e-5), alpha / float(SAMPLES));
}
`,author:"gre",license:"MIT",description:"A fast camera pan that streaks both images with motion blur, the incoming one arriving from the opposite side",tags:["slide","motion-blur","directional"],params:{direction:{type:"vec2",default:[-1,0],description:"Direction in which the images move"},blur:{type:"float",default:.4,min:0,max:1,description:"Length of the motion blur at full speed"}},textures:[],createdAt:"Sat, 31 Oct 2026 18:20:26 +0100",updatedAt:"Sat, 31 Oct 2026 18:20:26 +0100"},{name:"WhipSpin",paramsTypes:{turns:"float",blur:"float",chroma:"float",zoom:"float"},defaultParams:{turns:1,blur:.5,chroma:.6,zoom:.25},glsl:`// Author: gre
// License: MIT
// Description: The camera rolls faster and faster around the center of the frame, streaking the outgoing image in a spin blur, then the incoming one takes over mid-spin and slows to a stop
// Tags: rotate, motion-blur, spin

// @range(-3, 3) Total rotation, in turns, split between the two images (negative turns clockwise)
uniform float turns; // = 1.0
// @range(0, 1) Length of the motion blur along the spin
uniform float blur; // = 0.5
// @range(0, 1) How much the color channels split apart as the spin speeds up
uniform float chroma; // = 0.6
// @range(0, 1) How much the camera zooms in at the fastest point
uniform float zoom; // = 0.25

const float PI = 3.141592653589793;
const int SAMPLES = 24;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// fold the coordinates back into the image so that the rotated frame stays filled
vec2 mirror(vec2 v) {
  vec2 m = mod(v, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

// the camera's roll angle at time t: the outgoing image speeds up until the middle,
// then the incoming one, already turning, slows down to rest
float rollAngle(float t) {
  float halfTurn = PI * turns;
  if (t < 0.5) {
    float x = 2.0 * t;
    return halfTurn * x * x * x;
  }
  float x = 2.0 - 2.0 * t;
  return -halfTurn * x * x * x;
}

vec4 transition(vec2 uv) {
  float p = progress;
  float h = 1.0 - abs(2.0 * p - 1.0); // 0 at both ends, 1 at the cut
  // the shutter is open longer as the spin speeds up, and closed at both ends
  float shutter = blur * 0.1 * h;
  float scale = 1.0 + zoom * h * h * h;
  vec2 q = (uv - 0.5) * vec2(ratio, 1.0);
  float jitter = hash(uv * vec2(ratio, 1.0) * 731.0);
  vec3 color = vec3(0.0);
  vec3 weight = vec3(0.0);
  float alpha = 0.0;
  for (int i = 0; i < SAMPLES; i++) {
    float s = (float(i) + jitter) / float(SAMPLES) - 0.5;
    float t = clamp(p + s * shutter, 0.0, 1.0);
    float a = rollAngle(t);
    float c = cos(a), sn = sin(a);
    vec2 r = vec2(c * q.x + sn * q.y, -sn * q.x + c * q.y) / scale;
    vec2 suv = mirror(r / vec2(ratio, 1.0) + 0.5);
    vec4 col = t < 0.5 ? getFromColor(suv) : getToColor(suv);
    // red trails behind and blue leads along the arc: the channels split with the speed
    vec3 w = max(vec3(1.0 - 4.0 * chroma * s, 1.0, 1.0 + 4.0 * chroma * s), 0.0);
    color += col.rgb * col.a * w;
    weight += col.a * w;
    alpha += col.a;
  }
  return vec4(color / max(weight, vec3(1e-5)), alpha / float(SAMPLES));
}
`,author:"gre",license:"MIT",description:"The camera rolls faster and faster around the center of the frame, streaking the outgoing image in a spin blur, then the incoming one takes over mid-spin and slows to a stop",tags:["rotate","motion-blur","spin"],params:{turns:{type:"float",default:1,min:-3,max:3,description:"Total rotation, in turns, split between the two images (negative turns clockwise)"},blur:{type:"float",default:.5,min:0,max:1,description:"Length of the motion blur along the spin"},chroma:{type:"float",default:.6,min:0,max:1,description:"How much the color channels split apart as the spin speeds up"},zoom:{type:"float",default:.25,min:0,max:1,description:"How much the camera zooms in at the fastest point"}},textures:[],createdAt:"Sat, 31 Oct 2026 23:20:50 +0100",updatedAt:"Sat, 31 Oct 2026 23:20:50 +0100"},{name:"WhipTilt",paramsTypes:{down:"bool",blur:"float",chroma:"float",perspective:"float"},defaultParams:{down:!1,blur:.5,chroma:.5,perspective:.7},glsl:`// Author: gre
// License: MIT
// Description: The camera tilts fast from the outgoing image to the incoming one, set edge to edge at an angle above it, streaking both in perspective with a vertical motion blur
// Tags: 3d, rotate, motion-blur, vertical

// @param Tilt the camera down to an incoming image below instead of above
uniform bool down; // = false
// @range(0, 1) Length of the motion blur along the tilt
uniform float blur; // = 0.5
// @range(0, 1) How much the color channels split apart as the tilt speeds up
uniform float chroma; // = 0.5
// @range(0, 1) Strength of the perspective (field of view of the camera)
uniform float perspective; // = 0.7

const float PI = 3.141592653589793;
const int SAMPLES = 24;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// fold the coordinates back into the image, only a safety at the far edges
vec2 mirror(vec2 v) {
  vec2 m = mod(v, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

// how far the camera has tilted at time t, from 0 to 1: slow start, whip in the middle, slow landing
float tilt(float t) {
  float h = 1.0 - abs(2.0 * t - 1.0);
  float e = 0.5 * h * h * h * h;
  return t < 0.5 ? e : 1.0 - e;
}

vec4 transition(vec2 uv) {
  float p = progress;
  float h = 1.0 - abs(2.0 * p - 1.0); // 0 at both ends, 1 in the middle
  // the shutter is open longer as the tilt speeds up, and closed at both ends
  float shutter = blur * 0.25 * h * h;
  // the images are two faces of a drum around the camera, each filling the frame from the
  // middle: they meet edge to edge at the angle of the field of view, which the camera turns by
  float halfFov = mix(15.0, 45.0, perspective) * PI / 180.0;
  float dist = 0.5 / tan(halfFov);
  vec2 q = (uv - 0.5) * vec2(ratio, 1.0);
  if (down) q.y = -q.y;
  float jitter = hash(uv * vec2(ratio, 1.0) * 731.0);
  vec3 color = vec3(0.0);
  vec3 weight = vec3(0.0);
  float alpha = 0.0;
  for (int i = 0; i < SAMPLES; i++) {
    float s = (float(i) + jitter) / float(SAMPLES) - 0.5;
    float t = clamp(p + s * shutter, 0.0, 1.0);
    float a = 2.0 * halfFov * tilt(t);
    // zoom in just enough that the faces always cover the frame, wherever their edge is
    vec2 r = q * cos(halfFov) / cos(halfFov - a);
    // the ray in the frame of the outgoing face, then of the incoming one
    float c0 = cos(a), s0 = sin(a);
    vec2 d0 = vec2(r.y * c0 + dist * s0, dist * c0 - r.y * s0);
    float b = a - 2.0 * halfFov;
    float c1 = cos(b), s1 = sin(b);
    vec2 d1 = vec2(r.y * c1 + dist * s1, dist * c1 - r.y * s1);
    // the ray leaves the drum through the nearest face
    bool incoming = d1.y > d0.y;
    vec2 d = incoming ? d1 : d0;
    vec2 hit = dist / d.y * vec2(r.x, d.x);
    if (down) hit.y = -hit.y;
    vec2 suv = mirror(hit / vec2(ratio, 1.0) + 0.5);
    vec4 col = incoming ? getToColor(suv) : getFromColor(suv);
    // red trails behind and blue leads along the motion: the channels split with the speed
    vec3 w = max(vec3(1.0 - 4.0 * chroma * s, 1.0, 1.0 + 4.0 * chroma * s), 0.0);
    color += col.rgb * col.a * w;
    weight += col.a * w;
    alpha += col.a;
  }
  return vec4(color / max(weight, vec3(1e-5)), alpha / float(SAMPLES));
}
`,author:"gre",license:"MIT",description:"The camera tilts fast from the outgoing image to the incoming one, set edge to edge at an angle above it, streaking both in perspective with a vertical motion blur",tags:["3d","rotate","motion-blur","vertical"],params:{down:{type:"bool",default:!1,description:"Tilt the camera down to an incoming image below instead of above"},blur:{type:"float",default:.5,min:0,max:1,description:"Length of the motion blur along the tilt"},chroma:{type:"float",default:.5,min:0,max:1,description:"How much the color channels split apart as the tilt speeds up"},perspective:{type:"float",default:.7,min:0,max:1,description:"Strength of the perspective (field of view of the camera)"}},textures:[],createdAt:"Sat, 31 Oct 2026 23:20:50 +0100",updatedAt:"Sat, 31 Oct 2026 23:20:50 +0100"},{name:"Wind",paramsTypes:{size:"float",reversed:"bool"},defaultParams:{size:.2,reversed:!1},glsl:`// Author: gre
// License: MIT
// Description: A ragged left-to-right wipe, as if the image was blown away by the wind
// Tags: wipe, horizontal, noise

// @range(0, 1) Width of the ragged edge
uniform float size; // = 0.2
// @param Wipe from right to left instead
uniform bool reversed; // = false

float rand (vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 transition (vec2 uv) {
  float x = reversed ? 1. - uv.x : uv.x;
  float r = rand(vec2(0, uv.y));
  float m = smoothstep(0.0, -size, x*(1.0-size) + size*r - (progress * (1.0 + size)));
  return mix(
    getFromColor(uv),
    getToColor(uv),
    m
  );
}
`,author:"gre",license:"MIT",description:"A ragged left-to-right wipe, as if the image was blown away by the wind",tags:["wipe","horizontal","noise"],params:{size:{type:"float",default:.2,min:0,max:1,description:"Width of the ragged edge"},reversed:{type:"bool",default:!1,description:"Wipe from right to left instead"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"WindowBlinds",paramsTypes:{},defaultParams:{},glsl:`// Author: Fabien Benetou
// License: MIT
// Description: A crossfade through horizontal window blinds
// Tags: blinds, stripes, blend

vec4 transition (vec2 uv) {
  float t = progress;
  
  if (mod(floor(uv.y*100.*progress),2.)==0.)
    t*=2.-.5;
  
  return mix(
    getFromColor(uv),
    getToColor(uv),
    mix(t, progress, smoothstep(0.8, 1.0, progress))
  );
}
`,author:"Fabien Benetou",license:"MIT",description:"A crossfade through horizontal window blinds",tags:["blinds","stripes","blend"],params:{},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"WindowSlices",paramsTypes:{count:"float",smoothness:"float"},defaultParams:{count:10,smoothness:.5},glsl:`// Author: gre
// License: MIT
// Description: The incoming image appears through vertical slices that widen
// Tags: slices, stripes, wipe

// @param Number of slices
uniform float count; // = 10.0
// @param Softness of the slices' edges
uniform float smoothness; // = 0.5

vec4 transition (vec2 p) {
  float pr = smoothstep(-smoothness, 0.0, p.x - progress * (1.0 + smoothness));
  float s = step(pr, fract(count * p.x));
  return mix(getFromColor(p), getToColor(p), s);
}
`,author:"gre",license:"MIT",description:"The incoming image appears through vertical slices that widen",tags:["slices","stripes","wipe"],params:{count:{type:"float",default:10,description:"Number of slices"},smoothness:{type:"float",default:.5,description:"Softness of the slices' edges"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"ZoomInCircles",paramsTypes:{},defaultParams:{},glsl:`// License: MIT
// Author: dycm8009
// Description: Concentric rings of the outgoing image zoom at different speeds before revealing the incoming one
// Tags: zoom, circle
// ported by gre from https://gist.github.com/dycm8009/948e99b1800e81ad909a

vec2 zoom(vec2 uv, float amount) {
  return 0.5 + ((uv - 0.5) * amount);	
}

vec4 transition(vec2 uv) {
  vec2 ratio2 = vec2(1.0, 1.0 / ratio);
  // TODO: some timing are hardcoded but should be one or many parameters
  // TODO: should also be able to configure how much circles
  // TODO: if() branching should be avoided when possible, prefer use of step() & other functions
  vec2 r = 2.0 * ((vec2(uv.xy) - 0.5) * ratio2);
  float pro = progress / 0.8;
  float z = pro * 0.2;
  float t = 0.0;
  if (pro > 1.0) {
    z = 0.2 + (pro - 1.0) * 5.;
    t = clamp((progress - 0.8) / 0.07, 0.0, 1.0);
  }
  if (length(r) < 0.5+z) {
    // uv = zoom(uv, 0.9 - 0.1 * pro);
  }
  else if (length(r) < 0.8+z*1.5) {
    uv = zoom(uv, 1.0 - 0.15 * pro);
    t = t * 0.5;
  }
  else if (length(r) < 1.2+z*2.5) {
    uv = zoom(uv, 1.0 - 0.2 * pro);
    t = t * 0.2;
  }
  else {
    uv = zoom(uv, 1.0 - 0.25 * pro);
  }
  return mix(getFromColor(uv), getToColor(uv), t);
}
`,author:"dycm8009",license:"MIT",description:"Concentric rings of the outgoing image zoom at different speeds before revealing the incoming one",tags:["zoom","circle"],params:{},textures:[],createdAt:"Mon, 12 Jun 2017 11:24:34 +0800",updatedAt:"Fri, 9 Oct 2026 23:10:29 +0200"},{name:"ZoomInOut",paramsTypes:{},defaultParams:{},glsl:`// Author: OllyOllyOlly
// License: MIT
// Description: Zooms into the outgoing image until it blurs into a flat color, then out to the incoming one
// Tags: zoom, blur

vec2 zoom(vec2 uv, float amount) {
  return 0.5 + ((uv - 0.5) * (1.0 - amount));
}

vec4 transition (vec2 uv) {
  float zoomFrom = smoothstep(0.0, 1.0, progress * 2.0);
  float zoomTo = smoothstep(0.0, 1.0, (1.0 - progress) * 2.0);
  float crossfade = smoothstep(0.4, 0.6, progress);
  return mix(
    getFromColor(zoom(uv, zoomFrom)),
    getToColor(zoom(uv, zoomTo)),
    crossfade
  );
}
`,author:"OllyOllyOlly",license:"MIT",description:"Zooms into the outgoing image until it blurs into a flat color, then out to the incoming one",tags:["zoom","blur"],params:{},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"ZoomWipeLeft",paramsTypes:{zoom_quickness:"float"},defaultParams:{zoom_quickness:.8},glsl:`// Author: Handk
// License: MIT
// Description: Zooms into the outgoing image, then the incoming one wipes in from right to left
// Tags: zoom, wipe, horizontal

// @param Part of the first half spent zooming (capped at 0.5)
uniform float zoom_quickness; // = 0.8
vec2 zoom(vec2 uv, float amount) {
  if(amount<0.5)
  return 0.5 + ((uv - 0.5) * (1.0-amount));
  else
  return 0.5 + ((uv - 0.5) * (amount));
  
}

vec4 transition (vec2 uv) {
  float nQuick = clamp(zoom_quickness,0.0,0.5);
  if(progress<0.5){
    vec4 c= mix(
      getFromColor(zoom(uv, smoothstep(0.0, nQuick, progress))),
      getToColor(uv),
     step(0.5, progress)
    );
    
    return c;
  }
  else{
    vec2 p=uv.xy/vec2(1.0).xy;
    vec4 d=getFromColor(p);
    vec4 e=getToColor(p);
    vec4 f= mix(d, e, step(1.0-p.x,(progress-0.5)*2.0));
    
    return f;
  }
}
`,author:"Handk",license:"MIT",description:"Zooms into the outgoing image, then the incoming one wipes in from right to left",tags:["zoom","wipe","horizontal"],params:{zoom_quickness:{type:"float",default:.8,description:"Part of the first half spent zooming (capped at 0.5)"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"},{name:"ZoomWipeRight",paramsTypes:{zoom_quickness:"float"},defaultParams:{zoom_quickness:.8},glsl:`// Author: Handk
// License: MIT
// Description: Zooms into the outgoing image, then the incoming one wipes in from left to right
// Tags: zoom, wipe, horizontal

// @param Part of the first half spent zooming (capped at 0.5)
uniform float zoom_quickness; // = 0.8
vec2 zoom(vec2 uv, float amount) {
  if(amount<0.5)
  return 0.5 + ((uv - 0.5) * (1.0-amount));
  else
  return 0.5 + ((uv - 0.5) * (amount));
  
}

vec4 transition (vec2 uv) {
  float nQuick = clamp(zoom_quickness,0.0,0.5);
  if(progress<0.5){
    vec4 c= mix(
      getFromColor(zoom(uv, smoothstep(0.0, nQuick, progress))),
      getToColor(uv),
     step(0.5, progress)
    );
    
    return c;
  }
  else{
    vec2 p=uv.xy/vec2(1.0).xy;
    vec4 d=getFromColor(p);
    vec4 e=getToColor(p);
    vec4 f= mix(d, e, step(0.0+p.x,(progress-0.5)*2.0));
    
    return f;
  }
}
`,author:"Handk",license:"MIT",description:"Zooms into the outgoing image, then the incoming one wipes in from left to right",tags:["zoom","wipe","horizontal"],params:{zoom_quickness:{type:"float",default:.8,description:"Part of the first half spent zooming (capped at 0.5)"}},textures:[],createdAt:"Sun, 25 Oct 2026 17:48:47 +0100",updatedAt:"Sun, 25 Oct 2026 17:48:47 +0100"}]),r}var l=f();const d=c(l),g=h({__proto__:null,default:d},[l]);export{g as i};
