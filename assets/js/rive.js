(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["rive"] = factory();
	else
		root["rive"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

var Rive = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(moduleArg = {}) {

var k = moduleArg, aa, ca;
k.ready = new Promise((a, b) => {
  aa = a;
  ca = b;
});
function da() {
  function a(g) {
    const l = d;
    c = b = 0;
    d = new Map();
    l.forEach(p => {
      try {
        p(g);
      } catch (m) {
        console.error(m);
      }
    });
    this.kb();
    e && e.Nb();
  }
  let b = 0, c = 0, d = new Map(), e = null, f = null;
  this.requestAnimationFrame = function(g) {
    b || (b = requestAnimationFrame(a.bind(this)));
    const l = ++c;
    d.set(l, g);
    return l;
  };
  this.cancelAnimationFrame = function(g) {
    d.delete(g);
    b && 0 == d.size && (cancelAnimationFrame(b), b = 0);
  };
  this.Lb = function(g) {
    f && (document.body.remove(f), f = null);
    g || (f = document.createElement("div"), f.style.backgroundColor = "black", f.style.position = "fixed", f.style.right = 0, f.style.top = 0, f.style.color = "white", f.style.padding = "4px", f.innerHTML = "RIVE FPS", g = function(l) {
      f.innerHTML = "RIVE FPS " + l.toFixed(1);
    }, document.body.appendChild(f));
    e = new function() {
      let l = 0, p = 0;
      this.Nb = function() {
        var m = performance.now();
        p ? (++l, m -= p, 1000 < m && (g(1000 * l / m), l = p = 0)) : (p = m, l = 0);
      };
    }();
  };
  this.kb = function() {
  };
}
function ea() {
  console.assert(!0);
  const a = new Map();
  let b = -Infinity;
  this.push = function(c) {
    c = c + 255 >> 8;
    a.has(c) && clearTimeout(a.get(c));
    a.set(c, setTimeout(function() {
      a.delete(c);
      0 == a.length ? b = -Infinity : c == b && (b = Math.max(...a.keys()), console.assert(b < c));
    }, 1000));
    b = Math.max(c, b);
    return b << 8;
  };
}
const fa = k.onRuntimeInitialized;
k.onRuntimeInitialized = function() {
  fa && fa();
  let a = k.decodeAudio;
  k.decodeAudio = function(e, f) {
    e = a(e);
    f(e);
  };
  let b = k.decodeFont;
  k.decodeFont = function(e, f) {
    e = b(e);
    f(e);
  };
  const c = k.FileAssetLoader;
  k.ptrToAsset = e => {
    let f = k.ptrToFileAsset(e);
    return f.isImage ? k.ptrToImageAsset(e) : f.isFont ? k.ptrToFontAsset(e) : f.isAudio ? k.ptrToAudioAsset(e) : f;
  };
  k.CustomFileAssetLoader = c.extend("CustomFileAssetLoader", {__construct:function({loadContents:e}) {
    this.__parent.__construct.call(this);
    this.Bb = e;
  }, loadContents:function(e, f) {
    e = k.ptrToAsset(e);
    return this.Bb(e, f);
  },});
  k.CDNFileAssetLoader = c.extend("CDNFileAssetLoader", {__construct:function() {
    this.__parent.__construct.call(this);
  }, loadContents:function(e) {
    let f = k.ptrToAsset(e);
    e = f.cdnUuid;
    if ("" === e) {
      return !1;
    }
    (function(g, l) {
      var p = new XMLHttpRequest();
      p.responseType = "arraybuffer";
      p.onreadystatechange = function() {
        4 == p.readyState && 200 == p.status && l(p);
      };
      p.open("GET", g, !0);
      p.send(null);
    })(f.cdnBaseUrl + "/" + e, g => {
      f.decode(new Uint8Array(g.response));
    });
    return !0;
  },});
  k.FallbackFileAssetLoader = c.extend("FallbackFileAssetLoader", {__construct:function() {
    this.__parent.__construct.call(this);
    this.gb = [];
  }, addLoader:function(e) {
    this.gb.push(e);
  }, loadContents:function(e, f) {
    for (let g of this.gb) {
      if (g.loadContents(e, f)) {
        return !0;
      }
    }
    return !1;
  },});
  let d = k.computeAlignment;
  k.computeAlignment = function(e, f, g, l, p = 1.0) {
    return d.call(this, e, f, g, l, p);
  };
};
const ha = k.onRuntimeInitialized;
k.onRuntimeInitialized = function() {
  function a(q) {
    this.F = q;
    this.Ab = q.getContext("2d");
    this.Db = d;
    this.S = [];
    this.la = 0;
    this.clear = function() {
      console.assert(0 == this.la);
      this.S = [];
      e.delete(this);
    };
    this.save = function() {
      ++this.la;
      this.S.push(d.save.bind(d));
    };
    this.restore = function() {
      0 < this.la && (this.S.push(d.restore.bind(d)), --this.la);
    };
    this.transform = function(u) {
      this.S.push(d.transform.bind(d, u));
    };
    this.align = function(u, y, z, A, H = 1.0) {
      this.S.push(d.align.bind(d, u, y, z, A, H));
    };
    this.flush = function() {
      console.assert(0 == this.la);
      e.add(this);
      d.Va || c();
    };
    this["delete"] = function() {
    };
  }
  function b(q, u = !1) {
    var y = {alpha:!0, depth:u, stencil:u, antialias:u, premultipliedAlpha:!0, preserveDrawingBuffer:0, powerPreference:"high-performance", failIfMajorPerformanceCaveat:0, enableExtensionsByDefault:!1, explicitSwapControl:0, renderViaOffscreenBackBuffer:0,};
    u = q.getContext("webgl2", y);
    if (!u) {
      return null;
    }
    y = ia(u, y);
    ja(y);
    const z = f(q.width, q.height);
    z.Ka = y;
    z.F = q;
    z.La = q.width;
    z.Wa = q.height;
    z.T = u;
    var A = z.delete;
    z.delete = function() {
      A.call(this);
      var H = this.Ka;
      r === w[H] && (r = null);
      "object" == typeof JSEvents && JSEvents.Oc(w[H].C.canvas);
      w[H] && w[H].C.canvas && (w[H].C.canvas.zb = void 0);
      this.Ka = this.F = this.La = this.T = w[H] = null;
    };
    return z;
  }
  function c() {
    if (d) {
      var q = d.Cb, u = 0, y = 0, z = 0, A = Array(e.size), H = 0;
      for (var I of e) {
        I.ga = Math.min(I.F.width, q), I.fa = Math.min(I.F.height, q), I.Ia = I.fa * I.ga, u = Math.max(u, I.ga), y = Math.max(y, I.fa), z += I.Ia, A[H++] = I;
      }
      e.clear();
      if (!(0 >= z)) {
        u = 1 << (0 >= u ? 0 : 32 - Math.clz32(u - 1));
        for (y = 1 << (0 >= y ? 0 : 32 - Math.clz32(y - 1)); y * u < z;) {
          u <= y ? u *= 2 : y *= 2;
        }
        u = Math.min(u, q);
        u = Math.min(y, q);
        A.sort((ba, tb) => tb.Ia - ba.Ia);
        z = new k.DynamicRectanizer(q);
        for (I = 0; I < A.length;) {
          z.reset(u, y);
          for (H = I; H < A.length; ++H) {
            var L = A[H], E = z.addRect(L.ga, L.fa);
            if (0 > E) {
              console.assert(H > I);
              break;
            }
            L.ra = E & 65535;
            L.sa = E >> 16;
          }
          L = p.push(z.drawWidth());
          E = m.push(z.drawHeight());
          console.assert(L >= z.drawWidth());
          console.assert(E >= z.drawHeight());
          console.assert(L <= q);
          console.assert(E <= q);
          d.F.width != L && (d.F.width = L);
          d.F.height != E && (d.F.height = E);
          d.clear();
          for (L = I; L < H; ++L) {
            E = A[L];
            d.saveClipRect(E.ra, E.sa, E.ra + E.ga, E.sa + E.fa);
            let ba = new k.Mat2D();
            ba.xx = E.ga / E.F.width;
            ba.yy = E.fa / E.F.height;
            ba.xy = ba.yx = 0;
            ba.tx = E.ra;
            ba.ty = E.sa;
            d.transform(ba);
            for (const tb of E.S) {
              tb();
            }
            d.restoreClipRect();
            E.S = [];
          }
          for (d.flush(); I < H; ++I) {
            L = A[I], E = L.Ab, E.globalCompositeOperation = "copy", E.drawImage(d.F, L.ra, L.sa, L.ga, L.fa, 0, 0, L.F.width, L.F.height);
          }
          I = H;
        }
      }
    }
  }
  ha && ha();
  let d = null;
  const e = new Set(), f = k.makeRenderer;
  k.makeRenderer = function(q, u) {
    if (!d) {
      function y(z) {
        var A = document.createElement("canvas");
        A.width = 1;
        A.height = 1;
        d = b(A, z);
        d.Va = !!d.T.getExtension("WEBGL_shader_pixel_local_storage");
        d.Cb = Math.min(d.T.getParameter(d.T.MAX_RENDERBUFFER_SIZE), d.T.getParameter(d.T.MAX_TEXTURE_SIZE));
        d.Ja = !d.Va;
        if (z = d.T.getExtension("WEBGL_debug_renderer_info")) {
          A = d.T.getParameter(z.UNMASKED_RENDERER_WEBGL), d.T.getParameter(z.UNMASKED_VENDOR_WEBGL).includes("Google") && A.includes("ANGLE Metal Renderer") && (d.Ja = !1);
        }
        return d;
      }
      d = y(!0);
      d.Ja || (d = y(!1));
    }
    return u ? new a(q) : b(q, d.Ja);
  };
  const g = k.Artboard.prototype["delete"];
  k.Artboard.prototype["delete"] = function() {
    this.Eb = !0;
    g.call(this);
  };
  const l = k.Artboard.prototype.draw;
  k.Artboard.prototype.draw = function(q) {
    q.S ? q.S.push(() => {
      this.Eb || l.call(this, q.Db);
    }) : l.call(this, q);
  };
  const p = new ea(), m = new ea(), t = new da();
  k.requestAnimationFrame = t.requestAnimationFrame.bind(t);
  k.cancelAnimationFrame = t.cancelAnimationFrame.bind(t);
  k.enableFPSCounter = t.Lb.bind(t);
  t.kb = c;
  k.resolveAnimationFrame = c;
  let v = k.load;
  k.load = function(q, u, y = !0) {
    const z = new k.FallbackFileAssetLoader();
    void 0 !== u && z.addLoader(u);
    y && (u = new k.CDNFileAssetLoader(), z.addLoader(u));
    return Promise.resolve(v(q, z));
  };
  const x = k.WebGL2Renderer.prototype.clear;
  k.WebGL2Renderer.prototype.clear = function() {
    ja(this.Ka);
    const q = this.F;
    if (this.La != q.width || this.Wa != q.height) {
      this.resize(q.width, q.height), this.La = q.width, this.Wa = q.height;
    }
    x.call(this);
  };
  k.decodeImage = function(q, u) {
    q = k.decodeWebGL2Image(q);
    u(q);
  };
  let n = k.Renderer.prototype.align;
  k.Renderer.prototype.align = function(q, u, y, z, A = 1.0) {
    n.call(this, q, u, y, z, A);
  };
};
var ka = Object.assign({}, k), la = "./this.program", ma = "object" == typeof window, na = "function" == typeof importScripts, B = "", oa, pa;
if (ma || na) {
  na ? B = self.location.href : "undefined" != typeof document && document.currentScript && (B = document.currentScript.src), _scriptDir && (B = _scriptDir), 0 !== B.indexOf("blob:") ? B = B.substr(0, B.replace(/[?#].*/, "").lastIndexOf("/") + 1) : B = "", na && (pa = a => {
    var b = new XMLHttpRequest();
    b.open("GET", a, !1);
    b.responseType = "arraybuffer";
    b.send(null);
    return new Uint8Array(b.response);
  }), oa = (a, b, c) => {
    var d = new XMLHttpRequest();
    d.open("GET", a, !0);
    d.responseType = "arraybuffer";
    d.onload = () => {
      200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
    };
    d.onerror = c;
    d.send(null);
  };
}
var qa = k.print || console.log.bind(console), ra = k.printErr || console.error.bind(console);
Object.assign(k, ka);
ka = null;
k.thisProgram && (la = k.thisProgram);
var sa;
k.wasmBinary && (sa = k.wasmBinary);
var noExitRuntime = k.noExitRuntime || !0;
"object" != typeof WebAssembly && ta("no native wasm support detected");
var ua, C, va = !1, D, F, G, wa, J, K, xa, ya;
function za() {
  var a = ua.buffer;
  k.HEAP8 = D = new Int8Array(a);
  k.HEAP16 = G = new Int16Array(a);
  k.HEAP32 = J = new Int32Array(a);
  k.HEAPU8 = F = new Uint8Array(a);
  k.HEAPU16 = wa = new Uint16Array(a);
  k.HEAPU32 = K = new Uint32Array(a);
  k.HEAPF32 = xa = new Float32Array(a);
  k.HEAPF64 = ya = new Float64Array(a);
}
var Aa, Ba = [], Ca = [], Da = [];
function Ea() {
  var a = k.preRun.shift();
  Ba.unshift(a);
}
var Fa = 0, Ga = null, Ha = null;
function ta(a) {
  if (k.onAbort) {
    k.onAbort(a);
  }
  a = "Aborted(" + a + ")";
  ra(a);
  va = !0;
  a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
  ca(a);
  throw a;
}
function Ia(a) {
  return a.startsWith("data:application/octet-stream;base64,");
}
var Ja;
Ja = "webgl2_advanced.wasm";
if (!Ia(Ja)) {
  var Ka = Ja;
  Ja = k.locateFile ? k.locateFile(Ka, B) : B + Ka;
}
function La(a) {
  if (a == Ja && sa) {
    return new Uint8Array(sa);
  }
  if (pa) {
    return pa(a);
  }
  throw "both async and sync fetching of the wasm failed";
}
function Ma(a) {
  if (!sa && (ma || na)) {
    if ("function" == typeof fetch && !a.startsWith("file://")) {
      return fetch(a, {credentials:"same-origin"}).then(b => {
        if (!b.ok) {
          throw "failed to load wasm binary file at '" + a + "'";
        }
        return b.arrayBuffer();
      }).catch(() => La(a));
    }
    if (oa) {
      return new Promise((b, c) => {
        oa(a, d => b(new Uint8Array(d)), c);
      });
    }
  }
  return Promise.resolve().then(() => La(a));
}
function Na(a, b, c) {
  return Ma(a).then(d => WebAssembly.instantiate(d, b)).then(d => d).then(c, d => {
    ra("failed to asynchronously prepare wasm: " + d);
    ta(d);
  });
}
function Oa(a, b) {
  var c = Ja;
  return sa || "function" != typeof WebAssembly.instantiateStreaming || Ia(c) || c.startsWith("file://") || "function" != typeof fetch ? Na(c, a, b) : fetch(c, {credentials:"same-origin"}).then(d => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
    ra("wasm streaming compile failed: " + e);
    ra("falling back to ArrayBuffer instantiation");
    return Na(c, a, b);
  }));
}
var Pa, Qa, Ua = {516495:(a, b, c, d, e) => {
  if ("undefined" === typeof window || void 0 === (window.AudioContext || window.webkitAudioContext)) {
    return 0;
  }
  if ("undefined" === typeof window.h) {
    window.h = {Da:0};
    window.h.I = {};
    window.h.I.Ba = a;
    window.h.I.capture = b;
    window.h.I.Na = c;
    window.h.ja = {};
    window.h.ja.stopped = d;
    window.h.ja.tb = e;
    let f = window.h;
    f.D = [];
    f.oc = function(g) {
      for (var l = 0; l < f.D.length; ++l) {
        if (null == f.D[l]) {
          return f.D[l] = g, l;
        }
      }
      f.D.push(g);
      return f.D.length - 1;
    };
    f.yb = function(g) {
      for (f.D[g] = null; 0 < f.D.length;) {
        if (null == f.D[f.D.length - 1]) {
          f.D.pop();
        } else {
          break;
        }
      }
    };
    f.Qc = function(g) {
      for (var l = 0; l < f.D.length; ++l) {
        if (f.D[l] == g) {
          return f.yb(l);
        }
      }
    };
    f.va = function(g) {
      return f.D[g];
    };
    f.xb = ["touchend", "click"];
    f.unlock = function() {
      for (var g = 0; g < f.D.length; ++g) {
        var l = f.D[g];
        null != l && null != l.J && l.state === f.ja.tb && l.J.resume().then(() => {
          Ra(l.lb);
        }, p => {
          console.error("Failed to resume audiocontext", p);
        });
      }
      f.xb.map(function(p) {
        document.removeEventListener(p, f.unlock, !0);
      });
    };
    f.xb.map(function(g) {
      document.addEventListener(g, f.unlock, !0);
    });
  }
  window.h.Da += 1;
  return 1;
}, 518673:() => {
  "undefined" !== typeof window.h && (--window.h.Da, 0 === window.h.Da && delete window.h);
}, 518837:() => void 0 !== navigator.mediaDevices && void 0 !== navigator.mediaDevices.getUserMedia, 518941:() => {
  try {
    var a = new (window.AudioContext || window.webkitAudioContext)(), b = a.sampleRate;
    a.close();
    return b;
  } catch (c) {
    return 0;
  }
}, 519112:(a, b, c, d, e, f) => {
  if ("undefined" === typeof window.h) {
    return -1;
  }
  var g = {}, l = {};
  a == window.h.I.Ba && 0 != c && (l.sampleRate = c);
  g.J = new (window.AudioContext || window.webkitAudioContext)(l);
  g.J.suspend();
  g.state = window.h.ja.stopped;
  c = 0;
  a != window.h.I.Ba && (c = b);
  g.Z = g.J.createScriptProcessor(d, c, b);
  g.Z.onaudioprocess = function(p) {
    if (null == g.wa || 0 == g.wa.length) {
      g.wa = new Float32Array(xa.buffer, e, d * b);
    }
    if (a == window.h.I.capture || a == window.h.I.Na) {
      for (var m = 0; m < b; m += 1) {
        for (var t = p.inputBuffer.getChannelData(m), v = g.wa, x = 0; x < d; x += 1) {
          v[x * b + m] = t[x];
        }
      }
      Sa(f, d, e);
    }
    if (a == window.h.I.Ba || a == window.h.I.Na) {
      for (Ta(f, d, e), m = 0; m < p.outputBuffer.numberOfChannels; ++m) {
        for (t = p.outputBuffer.getChannelData(m), v = g.wa, x = 0; x < d; x += 1) {
          t[x] = v[x * b + m];
        }
      }
    } else {
      for (m = 0; m < p.outputBuffer.numberOfChannels; ++m) {
        p.outputBuffer.getChannelData(m).fill(0.0);
      }
    }
  };
  a != window.h.I.capture && a != window.h.I.Na || navigator.mediaDevices.getUserMedia({audio:!0, video:!1}).then(function(p) {
    g.Ea = g.J.createMediaStreamSource(p);
    g.Ea.connect(g.Z);
    g.Z.connect(g.J.destination);
  }).catch(function(p) {
    console.log("Failed to get user media: " + p);
  });
  a == window.h.I.Ba && g.Z.connect(g.J.destination);
  g.lb = f;
  return window.h.oc(g);
}, 521989:a => window.h.va(a).J.sampleRate, 522062:a => {
  a = window.h.va(a);
  void 0 !== a.Z && (a.Z.onaudioprocess = function() {
  }, a.Z.disconnect(), a.Z = void 0);
  void 0 !== a.Ea && (a.Ea.disconnect(), a.Ea = void 0);
  a.J.close();
  a.J = void 0;
  a.lb = void 0;
}, 522462:a => {
  window.h.yb(a);
}, 522512:a => {
  a = window.h.va(a);
  a.J.resume();
  a.state = window.h.ja.tb;
}, 522651:a => {
  a = window.h.va(a);
  a.J.suspend();
  a.state = window.h.ja.stopped;
}}, Va = a => {
  for (; 0 < a.length;) {
    a.shift()(k);
  }
}, Wa = (a, b) => {
  for (var c = 0, d = a.length - 1; 0 <= d; d--) {
    var e = a[d];
    "." === e ? a.splice(d, 1) : ".." === e ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
  }
  if (b) {
    for (; c; c--) {
      a.unshift("..");
    }
  }
  return a;
}, Xa = a => {
  var b = "/" === a.charAt(0), c = "/" === a.substr(-1);
  (a = Wa(a.split("/").filter(d => !!d), !b).join("/")) || b || (a = ".");
  a && c && (a += "/");
  return (b ? "/" : "") + a;
}, Ya = a => {
  var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
  a = b[0];
  b = b[1];
  if (!a && !b) {
    return ".";
  }
  b && (b = b.substr(0, b.length - 1));
  return a + b;
}, Za = a => {
  if ("/" === a) {
    return "/";
  }
  a = Xa(a);
  a = a.replace(/\/$/, "");
  var b = a.lastIndexOf("/");
  return -1 === b ? a : a.substr(b + 1);
}, $a = () => {
  if ("object" == typeof crypto && "function" == typeof crypto.getRandomValues) {
    return a => crypto.getRandomValues(a);
  }
  ta("initRandomDevice");
}, ab = a => (ab = $a())(a);
function bb() {
  for (var a = "", b = !1, c = arguments.length - 1; -1 <= c && !b; c--) {
    b = 0 <= c ? arguments[c] : "/";
    if ("string" != typeof b) {
      throw new TypeError("Arguments to path.resolve must be strings");
    }
    if (!b) {
      return "";
    }
    a = b + "/" + a;
    b = "/" === b.charAt(0);
  }
  a = Wa(a.split("/").filter(d => !!d), !b).join("/");
  return (b ? "/" : "") + a || ".";
}
var cb = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, M = (a, b, c) => {
  var d = b + c;
  for (c = b; a[c] && !(c >= d);) {
    ++c;
  }
  if (16 < c - b && a.buffer && cb) {
    return cb.decode(a.subarray(b, c));
  }
  for (d = ""; b < c;) {
    var e = a[b++];
    if (e & 128) {
      var f = a[b++] & 63;
      if (192 == (e & 224)) {
        d += String.fromCharCode((e & 31) << 6 | f);
      } else {
        var g = a[b++] & 63;
        e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | g : (e & 7) << 18 | f << 12 | g << 6 | a[b++] & 63;
        65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
      }
    } else {
      d += String.fromCharCode(e);
    }
  }
  return d;
}, db = [], eb = a => {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var d = a.charCodeAt(c);
    127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
  }
  return b;
}, fb = (a, b, c, d) => {
  if (!(0 < d)) {
    return 0;
  }
  var e = c;
  d = c + d - 1;
  for (var f = 0; f < a.length; ++f) {
    var g = a.charCodeAt(f);
    if (55296 <= g && 57343 >= g) {
      var l = a.charCodeAt(++f);
      g = 65536 + ((g & 1023) << 10) | l & 1023;
    }
    if (127 >= g) {
      if (c >= d) {
        break;
      }
      b[c++] = g;
    } else {
      if (2047 >= g) {
        if (c + 1 >= d) {
          break;
        }
        b[c++] = 192 | g >> 6;
      } else {
        if (65535 >= g) {
          if (c + 2 >= d) {
            break;
          }
          b[c++] = 224 | g >> 12;
        } else {
          if (c + 3 >= d) {
            break;
          }
          b[c++] = 240 | g >> 18;
          b[c++] = 128 | g >> 12 & 63;
        }
        b[c++] = 128 | g >> 6 & 63;
      }
      b[c++] = 128 | g & 63;
    }
  }
  b[c] = 0;
  return c - e;
};
function gb(a, b) {
  var c = Array(eb(a) + 1);
  a = fb(a, c, 0, c.length);
  b && (c.length = a);
  return c;
}
var hb = [];
function ib(a, b) {
  hb[a] = {input:[], G:[], V:b};
  jb(a, kb);
}
var kb = {open:function(a) {
  var b = hb[a.node.Ca];
  if (!b) {
    throw new N(43);
  }
  a.s = b;
  a.seekable = !1;
}, close:function(a) {
  a.s.V.ua(a.s);
}, ua:function(a) {
  a.s.V.ua(a.s);
}, read:function(a, b, c, d) {
  if (!a.s || !a.s.V.fb) {
    throw new N(60);
  }
  for (var e = 0, f = 0; f < d; f++) {
    try {
      var g = a.s.V.fb(a.s);
    } catch (l) {
      throw new N(29);
    }
    if (void 0 === g && 0 === e) {
      throw new N(6);
    }
    if (null === g || void 0 === g) {
      break;
    }
    e++;
    b[c + f] = g;
  }
  e && (a.node.timestamp = Date.now());
  return e;
}, write:function(a, b, c, d) {
  if (!a.s || !a.s.V.Qa) {
    throw new N(60);
  }
  try {
    for (var e = 0; e < d; e++) {
      a.s.V.Qa(a.s, b[c + e]);
    }
  } catch (f) {
    throw new N(29);
  }
  d && (a.node.timestamp = Date.now());
  return e;
},}, lb = {fb:function() {
  a: {
    if (!db.length) {
      var a = null;
      "undefined" != typeof window && "function" == typeof window.prompt ? (a = window.prompt("Input: "), null !== a && (a += "\n")) : "function" == typeof readline && (a = readline(), null !== a && (a += "\n"));
      if (!a) {
        a = null;
        break a;
      }
      db = gb(a, !0);
    }
    a = db.shift();
  }
  return a;
}, Qa:function(a, b) {
  null === b || 10 === b ? (qa(M(a.G, 0)), a.G = []) : 0 != b && a.G.push(b);
}, ua:function(a) {
  a.G && 0 < a.G.length && (qa(M(a.G, 0)), a.G = []);
}, Xb:function() {
  return {uc:25856, wc:5, tc:191, vc:35387, sc:[3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]};
}, Yb:function() {
  return 0;
}, Zb:function() {
  return [24, 80];
},}, mb = {Qa:function(a, b) {
  null === b || 10 === b ? (ra(M(a.G, 0)), a.G = []) : 0 != b && a.G.push(b);
}, ua:function(a) {
  a.G && 0 < a.G.length && (ra(M(a.G, 0)), a.G = []);
},};
function nb(a, b) {
  var c = a.j ? a.j.length : 0;
  c >= b || (b = Math.max(b, c * (1048576 > c ? 2.0 : 1.125) >>> 0), 0 != c && (b = Math.max(b, 256)), c = a.j, a.j = new Uint8Array(b), 0 < a.v && a.j.set(c.subarray(0, a.v), 0));
}
var O = {O:null, U() {
  return O.createNode(null, "/", 16895, 0);
}, createNode(a, b, c, d) {
  if (24576 === (c & 61440) || 4096 === (c & 61440)) {
    throw new N(63);
  }
  O.O || (O.O = {dir:{node:{Y:O.l.Y, P:O.l.P, ma:O.l.ma, za:O.l.za, rb:O.l.rb, wb:O.l.wb, sb:O.l.sb, pb:O.l.pb, Fa:O.l.Fa}, stream:{ba:O.m.ba}}, file:{node:{Y:O.l.Y, P:O.l.P}, stream:{ba:O.m.ba, read:O.m.read, write:O.m.write, ta:O.m.ta, hb:O.m.hb, jb:O.m.jb}}, link:{node:{Y:O.l.Y, P:O.l.P, na:O.l.na}, stream:{}}, Xa:{node:{Y:O.l.Y, P:O.l.P}, stream:ob}});
  c = pb(a, b, c, d);
  16384 === (c.mode & 61440) ? (c.l = O.O.dir.node, c.m = O.O.dir.stream, c.j = {}) : 32768 === (c.mode & 61440) ? (c.l = O.O.file.node, c.m = O.O.file.stream, c.v = 0, c.j = null) : 40960 === (c.mode & 61440) ? (c.l = O.O.link.node, c.m = O.O.link.stream) : 8192 === (c.mode & 61440) && (c.l = O.O.Xa.node, c.m = O.O.Xa.stream);
  c.timestamp = Date.now();
  a && (a.j[b] = c, a.timestamp = c.timestamp);
  return c;
}, Bc(a) {
  return a.j ? a.j.subarray ? a.j.subarray(0, a.v) : new Uint8Array(a.j) : new Uint8Array(0);
}, l:{Y(a) {
  var b = {};
  b.zc = 8192 === (a.mode & 61440) ? a.id : 1;
  b.Dc = a.id;
  b.mode = a.mode;
  b.Lc = 1;
  b.uid = 0;
  b.Cc = 0;
  b.Ca = a.Ca;
  16384 === (a.mode & 61440) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.v : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
  b.qc = new Date(a.timestamp);
  b.Jc = new Date(a.timestamp);
  b.xc = new Date(a.timestamp);
  b.Fb = 4096;
  b.rc = Math.ceil(b.size / b.Fb);
  return b;
}, P(a, b) {
  void 0 !== b.mode && (a.mode = b.mode);
  void 0 !== b.timestamp && (a.timestamp = b.timestamp);
  if (void 0 !== b.size && (b = b.size, a.v != b)) {
    if (0 == b) {
      a.j = null, a.v = 0;
    } else {
      var c = a.j;
      a.j = new Uint8Array(b);
      c && a.j.set(c.subarray(0, Math.min(b, a.v)));
      a.v = b;
    }
  }
}, ma() {
  throw qb[44];
}, za(a, b, c, d) {
  return O.createNode(a, b, c, d);
}, rb(a, b, c) {
  if (16384 === (a.mode & 61440)) {
    try {
      var d = rb(b, c);
    } catch (f) {
    }
    if (d) {
      for (var e in d.j) {
        throw new N(55);
      }
    }
  }
  delete a.parent.j[a.name];
  a.parent.timestamp = Date.now();
  a.name = c;
  b.j[c] = a;
  b.timestamp = a.parent.timestamp;
  a.parent = b;
}, wb(a, b) {
  delete a.j[b];
  a.timestamp = Date.now();
}, sb(a, b) {
  var c = rb(a, b), d;
  for (d in c.j) {
    throw new N(55);
  }
  delete a.j[b];
  a.timestamp = Date.now();
}, pb(a) {
  var b = [".", ".."], c;
  for (c in a.j) {
    a.j.hasOwnProperty(c) && b.push(c);
  }
  return b;
}, Fa(a, b, c) {
  a = O.createNode(a, b, 41471, 0);
  a.link = c;
  return a;
}, na(a) {
  if (40960 !== (a.mode & 61440)) {
    throw new N(28);
  }
  return a.link;
},}, m:{read(a, b, c, d, e) {
  var f = a.node.j;
  if (e >= a.node.v) {
    return 0;
  }
  a = Math.min(a.node.v - e, d);
  if (8 < a && f.subarray) {
    b.set(f.subarray(e, e + a), c);
  } else {
    for (d = 0; d < a; d++) {
      b[c + d] = f[e + d];
    }
  }
  return a;
}, write(a, b, c, d, e, f) {
  b.buffer === D.buffer && (f = !1);
  if (!d) {
    return 0;
  }
  a = a.node;
  a.timestamp = Date.now();
  if (b.subarray && (!a.j || a.j.subarray)) {
    if (f) {
      return a.j = b.subarray(c, c + d), a.v = d;
    }
    if (0 === a.v && 0 === e) {
      return a.j = b.slice(c, c + d), a.v = d;
    }
    if (e + d <= a.v) {
      return a.j.set(b.subarray(c, c + d), e), d;
    }
  }
  nb(a, e + d);
  if (a.j.subarray && b.subarray) {
    a.j.set(b.subarray(c, c + d), e);
  } else {
    for (f = 0; f < d; f++) {
      a.j[e + f] = b[c + f];
    }
  }
  a.v = Math.max(a.v, e + d);
  return d;
}, ba(a, b, c) {
  1 === c ? b += a.position : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.v);
  if (0 > b) {
    throw new N(28);
  }
  return b;
}, ta(a, b, c) {
  nb(a.node, b + c);
  a.node.v = Math.max(a.node.v, b + c);
}, hb(a, b, c, d, e) {
  if (32768 !== (a.node.mode & 61440)) {
    throw new N(43);
  }
  a = a.node.j;
  if (e & 2 || a.buffer !== D.buffer) {
    if (0 < c || c + b < a.length) {
      a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
    }
    c = !0;
    ta();
    b = void 0;
    if (!b) {
      throw new N(48);
    }
    D.set(a, b);
  } else {
    c = !1, b = a.byteOffset;
  }
  return {o:b, M:c};
}, jb(a, b, c, d) {
  O.m.write(a, b, 0, d, c, !1);
  return 0;
},},};
function sb(a, b) {
  var c = 0;
  a && (c |= 365);
  b && (c |= 146);
  return c;
}
var ub = null, vb = {}, wb = [], xb = 1, yb = null, zb = !0, N = null, qb = {}, Bb = (a, b = {}) => {
  a = bb(a);
  if (!a) {
    return {path:"", node:null};
  }
  b = Object.assign({cb:!0, Sa:0}, b);
  if (8 < b.Sa) {
    throw new N(32);
  }
  a = a.split("/").filter(g => !!g);
  for (var c = ub, d = "/", e = 0; e < a.length; e++) {
    var f = e === a.length - 1;
    if (f && b.parent) {
      break;
    }
    c = rb(c, a[e]);
    d = Xa(d + "/" + a[e]);
    c.Aa && (!f || f && b.cb) && (c = c.Aa.root);
    if (!f || b.bb) {
      for (f = 0; 40960 === (c.mode & 61440);) {
        if (c = Ab(d), d = bb(Ya(d), c), c = Bb(d, {Sa:b.Sa + 1}).node, 40 < f++) {
          throw new N(32);
        }
      }
    }
  }
  return {path:d, node:c};
}, Cb = a => {
  for (var b;;) {
    if (a === a.parent) {
      return a = a.U.ib, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
    }
    b = b ? `${a.name}/${b}` : a.name;
    a = a.parent;
  }
}, Db = (a, b) => {
  for (var c = 0, d = 0; d < b.length; d++) {
    c = (c << 5) - c + b.charCodeAt(d) | 0;
  }
  return (a + c >>> 0) % yb.length;
}, rb = (a, b) => {
  var c;
  if (c = (c = Eb(a, "x")) ? c : a.l.ma ? 0 : 2) {
    throw new N(c, a);
  }
  for (c = yb[Db(a.id, b)]; c; c = c.bc) {
    var d = c.name;
    if (c.parent.id === a.id && d === b) {
      return c;
    }
  }
  return a.l.ma(a, b);
}, pb = (a, b, c, d) => {
  a = new Fb(a, b, c, d);
  b = Db(a.parent.id, a.name);
  a.bc = yb[b];
  return yb[b] = a;
}, Gb = a => {
  var b = ["r", "w", "rw"][a & 3];
  a & 512 && (b += "w");
  return b;
}, Eb = (a, b) => {
  if (zb) {
    return 0;
  }
  if (!b.includes("r") || a.mode & 292) {
    if (b.includes("w") && !(a.mode & 146) || b.includes("x") && !(a.mode & 73)) {
      return 2;
    }
  } else {
    return 2;
  }
  return 0;
}, Hb = (a, b) => {
  try {
    return rb(a, b), 20;
  } catch (c) {
  }
  return Eb(a, "wx");
}, Ib = () => {
  for (var a = 0; 4096 >= a; a++) {
    if (!wb[a]) {
      return a;
    }
  }
  throw new N(33);
}, Jb = a => {
  a = wb[a];
  if (!a) {
    throw new N(8);
  }
  return a;
}, Lb = (a, b = -1) => {
  Kb || (Kb = function() {
    this.h = {};
  }, Kb.prototype = {}, Object.defineProperties(Kb.prototype, {object:{get() {
    return this.node;
  }, set(c) {
    this.node = c;
  }}, flags:{get() {
    return this.h.flags;
  }, set(c) {
    this.h.flags = c;
  },}, position:{get() {
    return this.h.position;
  }, set(c) {
    this.h.position = c;
  },},}));
  a = Object.assign(new Kb(), a);
  -1 == b && (b = Ib());
  a.X = b;
  return wb[b] = a;
}, ob = {open:a => {
  a.m = vb[a.node.Ca].m;
  a.m.open && a.m.open(a);
}, ba:() => {
  throw new N(70);
},}, jb = (a, b) => {
  vb[a] = {m:b};
}, Mb = (a, b) => {
  var c = "/" === b, d = !b;
  if (c && ub) {
    throw new N(10);
  }
  if (!c && !d) {
    var e = Bb(b, {cb:!1});
    b = e.path;
    e = e.node;
    if (e.Aa) {
      throw new N(10);
    }
    if (16384 !== (e.mode & 61440)) {
      throw new N(54);
    }
  }
  b = {type:a, Nc:{}, ib:b, ac:[]};
  a = a.U(b);
  a.U = b;
  b.root = a;
  c ? ub = a : e && (e.Aa = b, e.U && e.U.ac.push(b));
}, P = (a, b, c) => {
  var d = Bb(a, {parent:!0}).node;
  a = Za(a);
  if (!a || "." === a || ".." === a) {
    throw new N(28);
  }
  var e = Hb(d, a);
  if (e) {
    throw new N(e);
  }
  if (!d.l.za) {
    throw new N(63);
  }
  return d.l.za(d, a, b, c);
}, Nb = (a, b, c) => {
  "undefined" == typeof c && (c = b, b = 438);
  P(a, b | 8192, c);
}, Ob = (a, b) => {
  if (!bb(a)) {
    throw new N(44);
  }
  var c = Bb(b, {parent:!0}).node;
  if (!c) {
    throw new N(44);
  }
  b = Za(b);
  var d = Hb(c, b);
  if (d) {
    throw new N(d);
  }
  if (!c.l.Fa) {
    throw new N(63);
  }
  c.l.Fa(c, b, a);
}, Ab = a => {
  a = Bb(a).node;
  if (!a) {
    throw new N(44);
  }
  if (!a.l.na) {
    throw new N(28);
  }
  return bb(Cb(a.parent), a.l.na(a));
}, Qb = (a, b, c) => {
  if ("" === a) {
    throw new N(44);
  }
  if ("string" == typeof b) {
    var d = {r:0, "r+":2, w:577, "w+":578, a:1089, "a+":1090,}[b];
    if ("undefined" == typeof d) {
      throw Error(`Unknown file open mode: ${b}`);
    }
    b = d;
  }
  c = b & 64 ? ("undefined" == typeof c ? 438 : c) & 4095 | 32768 : 0;
  if ("object" == typeof a) {
    var e = a;
  } else {
    a = Xa(a);
    try {
      e = Bb(a, {bb:!(b & 131072)}).node;
    } catch (f) {
    }
  }
  d = !1;
  if (b & 64) {
    if (e) {
      if (b & 128) {
        throw new N(20);
      }
    } else {
      e = P(a, c, 0), d = !0;
    }
  }
  if (!e) {
    throw new N(44);
  }
  8192 === (e.mode & 61440) && (b &= -513);
  if (b & 65536 && 16384 !== (e.mode & 61440)) {
    throw new N(54);
  }
  if (!d && (c = e ? 40960 === (e.mode & 61440) ? 32 : 16384 === (e.mode & 61440) && ("r" !== Gb(b) || b & 512) ? 31 : Eb(e, Gb(b)) : 44)) {
    throw new N(c);
  }
  if (b & 512 && !d) {
    c = e;
    c = "string" == typeof c ? Bb(c, {bb:!0}).node : c;
    if (!c.l.P) {
      throw new N(63);
    }
    if (16384 === (c.mode & 61440)) {
      throw new N(31);
    }
    if (32768 !== (c.mode & 61440)) {
      throw new N(28);
    }
    if (d = Eb(c, "w")) {
      throw new N(d);
    }
    c.l.P(c, {size:0, timestamp:Date.now()});
  }
  b &= -131713;
  e = Lb({node:e, path:Cb(e), flags:b, seekable:!0, position:0, m:e.m, pc:[], error:!1});
  e.m.open && e.m.open(e);
  !k.logReadFiles || b & 1 || (Pb || (Pb = {}), a in Pb || (Pb[a] = 1));
  return e;
}, Rb = (a, b, c) => {
  if (null === a.X) {
    throw new N(8);
  }
  if (!a.seekable || !a.m.ba) {
    throw new N(70);
  }
  if (0 != c && 1 != c && 2 != c) {
    throw new N(28);
  }
  a.position = a.m.ba(a, b, c);
  a.pc = [];
}, Sb = () => {
  N || (N = function(a, b) {
    this.name = "ErrnoError";
    this.node = b;
    this.ec = function(c) {
      this.aa = c;
    };
    this.ec(a);
    this.message = "FS error";
  }, N.prototype = Error(), N.prototype.constructor = N, [44].forEach(a => {
    qb[a] = new N(a);
    qb[a].stack = "<generic error, no stack>";
  }));
}, Tb, Vb = (a, b, c) => {
  a = Xa("/dev/" + a);
  var d = sb(!!b, !!c);
  Ub || (Ub = 64);
  var e = Ub++ << 8 | 0;
  jb(e, {open:f => {
    f.seekable = !1;
  }, close:() => {
    c && c.buffer && c.buffer.length && c(10);
  }, read:(f, g, l, p) => {
    for (var m = 0, t = 0; t < p; t++) {
      try {
        var v = b();
      } catch (x) {
        throw new N(29);
      }
      if (void 0 === v && 0 === m) {
        throw new N(6);
      }
      if (null === v || void 0 === v) {
        break;
      }
      m++;
      g[l + t] = v;
    }
    m && (f.node.timestamp = Date.now());
    return m;
  }, write:(f, g, l, p) => {
    for (var m = 0; m < p; m++) {
      try {
        c(g[l + m]);
      } catch (t) {
        throw new N(29);
      }
    }
    p && (f.node.timestamp = Date.now());
    return m;
  }});
  Nb(a, d, e);
}, Ub, Wb = {}, Kb, Pb, Xb = void 0;
function Yb() {
  Xb += 4;
  return J[Xb - 4 >> 2];
}
function Zb(a) {
  if (void 0 === a) {
    return "_unknown";
  }
  a = a.replace(/[^a-zA-Z0-9_]/g, "$");
  var b = a.charCodeAt(0);
  return 48 <= b && 57 >= b ? `_${a}` : a;
}
function $b(a, b) {
  a = Zb(a);
  return {[a]:function() {
    return b.apply(this, arguments);
  }}[a];
}
function ac() {
  this.M = [void 0];
  this.eb = [];
}
var Q = new ac(), bc = void 0;
function R(a) {
  throw new bc(a);
}
var S = a => {
  a || R("Cannot use deleted val. handle = " + a);
  return Q.get(a).value;
}, T = a => {
  switch(a) {
    case void 0:
      return 1;
    case null:
      return 2;
    case !0:
      return 3;
    case !1:
      return 4;
    default:
      return Q.ta({qb:1, value:a});
  }
};
function cc(a) {
  var b = Error, c = $b(a, function(d) {
    this.name = a;
    this.message = d;
    d = Error(d).stack;
    void 0 !== d && (this.stack = this.toString() + "\n" + d.replace(/^Error(:[^\n]*)?\n/, ""));
  });
  c.prototype = Object.create(b.prototype);
  c.prototype.constructor = c;
  c.prototype.toString = function() {
    return void 0 === this.message ? this.name : `${this.name}: ${this.message}`;
  };
  return c;
}
var dc = void 0, ec = void 0;
function U(a) {
  for (var b = ""; F[a];) {
    b += ec[F[a++]];
  }
  return b;
}
var fc = [];
function gc() {
  for (; fc.length;) {
    var a = fc.pop();
    a.g.ia = !1;
    a["delete"]();
  }
}
var hc = void 0, ic = {};
function jc(a, b) {
  for (void 0 === b && R("ptr should not be undefined"); a.A;) {
    b = a.pa(b), a = a.A;
  }
  return b;
}
var kc = {};
function lc(a) {
  a = mc(a);
  var b = U(a);
  nc(a);
  return b;
}
function oc(a, b) {
  var c = kc[a];
  void 0 === c && R(b + " has unknown type " + lc(a));
  return c;
}
function pc() {
}
var qc = !1;
function rc(a) {
  --a.count.value;
  0 === a.count.value && (a.H ? a.L.W(a.H) : a.u.i.W(a.o));
}
function sc(a, b, c) {
  if (b === c) {
    return a;
  }
  if (void 0 === c.A) {
    return null;
  }
  a = sc(a, b, c.A);
  return null === a ? null : c.Jb(a);
}
var tc = {};
function uc(a, b) {
  b = jc(a, b);
  return ic[b];
}
var vc = void 0;
function wc(a) {
  throw new vc(a);
}
function xc(a, b) {
  b.u && b.o || wc("makeClassHandle requires ptr and ptrType");
  !!b.L !== !!b.H && wc("Both smartPtrType and smartPtr must be specified");
  b.count = {value:1};
  return yc(Object.create(a, {g:{value:b,},}));
}
function yc(a) {
  if ("undefined" === typeof FinalizationRegistry) {
    return yc = b => b, a;
  }
  qc = new FinalizationRegistry(b => {
    rc(b.g);
  });
  yc = b => {
    var c = b.g;
    c.H && qc.register(b, {g:c}, b);
    return b;
  };
  pc = b => {
    qc.unregister(b);
  };
  return yc(a);
}
var zc = {};
function Ac(a) {
  for (; a.length;) {
    var b = a.pop();
    a.pop()(b);
  }
}
function Bc(a) {
  return this.fromWireType(J[a >> 2]);
}
var Cc = {}, Dc = {};
function V(a, b, c) {
  function d(l) {
    l = c(l);
    l.length !== a.length && wc("Mismatched type converter count");
    for (var p = 0; p < a.length; ++p) {
      W(a[p], l[p]);
    }
  }
  a.forEach(function(l) {
    Dc[l] = b;
  });
  var e = Array(b.length), f = [], g = 0;
  b.forEach((l, p) => {
    kc.hasOwnProperty(l) ? e[p] = kc[l] : (f.push(l), Cc.hasOwnProperty(l) || (Cc[l] = []), Cc[l].push(() => {
      e[p] = kc[l];
      ++g;
      g === f.length && d(e);
    }));
  });
  0 === f.length && d(e);
}
function Ec(a) {
  switch(a) {
    case 1:
      return 0;
    case 2:
      return 1;
    case 4:
      return 2;
    case 8:
      return 3;
    default:
      throw new TypeError(`Unknown type size: ${a}`);
  }
}
function Fc(a, b, c = {}) {
  var d = b.name;
  a || R(`type "${d}" must have a positive integer typeid pointer`);
  if (kc.hasOwnProperty(a)) {
    if (c.Ub) {
      return;
    }
    R(`Cannot register type '${d}' twice`);
  }
  kc[a] = b;
  delete Dc[a];
  Cc.hasOwnProperty(a) && (b = Cc[a], delete Cc[a], b.forEach(e => e()));
}
function W(a, b, c = {}) {
  if (!("argPackAdvance" in b)) {
    throw new TypeError("registerType registeredInstance requires argPackAdvance");
  }
  Fc(a, b, c);
}
function Gc(a) {
  R(a.g.u.i.name + " instance already deleted");
}
function Hc() {
}
function Ic(a, b, c) {
  if (void 0 === a[b].B) {
    var d = a[b];
    a[b] = function() {
      a[b].B.hasOwnProperty(arguments.length) || R(`Function '${c}' called with an invalid number of arguments (${arguments.length}) - expects one of (${a[b].B})!`);
      return a[b].B[arguments.length].apply(this, arguments);
    };
    a[b].B = [];
    a[b].B[d.ha] = d;
  }
}
function Jc(a, b, c) {
  k.hasOwnProperty(a) ? ((void 0 === c || void 0 !== k[a].B && void 0 !== k[a].B[c]) && R(`Cannot register public name '${a}' twice`), Ic(k, a, a), k.hasOwnProperty(c) && R(`Cannot register multiple overloads of a function with the same number of arguments (${c})!`), k[a].B[c] = b) : (k[a] = b, void 0 !== c && (k[a].Mc = c));
}
function Kc(a, b, c, d, e, f, g, l) {
  this.name = a;
  this.constructor = b;
  this.N = c;
  this.W = d;
  this.A = e;
  this.Ob = f;
  this.pa = g;
  this.Jb = l;
  this.mb = [];
}
function Lc(a, b, c) {
  for (; b !== c;) {
    b.pa || R(`Expected null or instance of ${c.name}, got an instance of ${b.name}`), a = b.pa(a), b = b.A;
  }
  return a;
}
function Mc(a, b) {
  if (null === b) {
    return this.Pa && R(`null is not a valid ${this.name}`), 0;
  }
  b.g || R(`Cannot pass "${Nc(b)}" as a ${this.name}`);
  b.g.o || R(`Cannot pass deleted object as a pointer of type ${this.name}`);
  return Lc(b.g.o, b.g.u.i, this.i);
}
function Oc(a, b) {
  if (null === b) {
    this.Pa && R(`null is not a valid ${this.name}`);
    if (this.ya) {
      var c = this.Ra();
      null !== a && a.push(this.W, c);
      return c;
    }
    return 0;
  }
  b.g || R(`Cannot pass "${Nc(b)}" as a ${this.name}`);
  b.g.o || R(`Cannot pass deleted object as a pointer of type ${this.name}`);
  !this.xa && b.g.u.xa && R(`Cannot convert argument of type ${b.g.L ? b.g.L.name : b.g.u.name} to parameter type ${this.name}`);
  c = Lc(b.g.o, b.g.u.i, this.i);
  if (this.ya) {
    switch(void 0 === b.g.H && R("Passing raw pointer to smart pointer is illegal"), this.jc) {
      case 0:
        b.g.L === this ? c = b.g.H : R(`Cannot convert argument of type ${b.g.L ? b.g.L.name : b.g.u.name} to parameter type ${this.name}`);
        break;
      case 1:
        c = b.g.H;
        break;
      case 2:
        if (b.g.L === this) {
          c = b.g.H;
        } else {
          var d = b.clone();
          c = this.dc(c, T(function() {
            d["delete"]();
          }));
          null !== a && a.push(this.W, c);
        }
        break;
      default:
        R("Unsupporting sharing policy");
    }
  }
  return c;
}
function Pc(a, b) {
  if (null === b) {
    return this.Pa && R(`null is not a valid ${this.name}`), 0;
  }
  b.g || R(`Cannot pass "${Nc(b)}" as a ${this.name}`);
  b.g.o || R(`Cannot pass deleted object as a pointer of type ${this.name}`);
  b.g.u.xa && R(`Cannot convert argument of type ${b.g.u.name} to parameter type ${this.name}`);
  return Lc(b.g.o, b.g.u.i, this.i);
}
function Qc(a, b, c, d) {
  this.name = a;
  this.i = b;
  this.Pa = c;
  this.xa = d;
  this.ya = !1;
  this.W = this.dc = this.Ra = this.ob = this.jc = this.cc = void 0;
  void 0 !== b.A ? this.toWireType = Oc : (this.toWireType = d ? Mc : Pc, this.K = null);
}
function Rc(a, b, c) {
  k.hasOwnProperty(a) || wc("Replacing nonexistant public symbol");
  void 0 !== k[a].B && void 0 !== c ? k[a].B[c] = b : (k[a] = b, k[a].ha = c);
}
var Sc = [], Tc = a => {
  var b = Sc[a];
  b || (a >= Sc.length && (Sc.length = a + 1), Sc[a] = b = Aa.get(a));
  return b;
}, Uc = (a, b) => {
  var c = [];
  return function() {
    c.length = 0;
    Object.assign(c, arguments);
    if (a.includes("j")) {
      var d = k["dynCall_" + a];
      d = c && c.length ? d.apply(null, [b].concat(c)) : d.call(null, b);
    } else {
      d = Tc(b).apply(null, c);
    }
    return d;
  };
};
function X(a, b) {
  a = U(a);
  var c = a.includes("j") ? Uc(a, b) : Tc(b);
  "function" != typeof c && R(`unknown function pointer with signature ${a}: ${b}`);
  return c;
}
var Vc = void 0;
function Wc(a, b) {
  function c(f) {
    e[f] || kc[f] || (Dc[f] ? Dc[f].forEach(c) : (d.push(f), e[f] = !0));
  }
  var d = [], e = {};
  b.forEach(c);
  throw new Vc(`${a}: ` + d.map(lc).join([", "]));
}
function Xc(a, b, c, d, e) {
  var f = b.length;
  2 > f && R("argTypes array size mismatch! Must at least get return value and 'this' types!");
  var g = null !== b[1] && null !== c, l = !1;
  for (c = 1; c < b.length; ++c) {
    if (null !== b[c] && void 0 === b[c].K) {
      l = !0;
      break;
    }
  }
  var p = "void" !== b[0].name, m = f - 2, t = Array(m), v = [], x = [];
  return function() {
    arguments.length !== m && R(`function ${a} called with ${arguments.length} arguments, expected ${m} args!`);
    x.length = 0;
    v.length = g ? 2 : 1;
    v[0] = e;
    if (g) {
      var n = b[1].toWireType(x, this);
      v[1] = n;
    }
    for (var q = 0; q < m; ++q) {
      t[q] = b[q + 2].toWireType(x, arguments[q]), v.push(t[q]);
    }
    q = d.apply(null, v);
    if (l) {
      Ac(x);
    } else {
      for (var u = g ? 1 : 2; u < b.length; u++) {
        var y = 1 === u ? n : t[u - 2];
        null !== b[u].K && b[u].K(y);
      }
    }
    n = p ? b[0].fromWireType(q) : void 0;
    return n;
  };
}
function Yc(a, b) {
  for (var c = [], d = 0; d < a; d++) {
    c.push(K[b + 4 * d >> 2]);
  }
  return c;
}
function Zc(a, b, c) {
  a instanceof Object || R(`${c} with invalid "this": ${a}`);
  a instanceof b.i.constructor || R(`${c} incompatible with "this" of type ${a.constructor.name}`);
  a.g.o || R(`cannot call emscripten binding method ${c} on deleted object`);
  return Lc(a.g.o, a.g.u.i, b.i);
}
function $c(a) {
  a >= Q.h && 0 === --Q.get(a).qb && Q.Tb(a);
}
function ad(a, b, c) {
  switch(b) {
    case 0:
      return function(d) {
        return this.fromWireType((c ? D : F)[d]);
      };
    case 1:
      return function(d) {
        return this.fromWireType((c ? G : wa)[d >> 1]);
      };
    case 2:
      return function(d) {
        return this.fromWireType((c ? J : K)[d >> 2]);
      };
    default:
      throw new TypeError("Unknown integer type: " + a);
  }
}
function Nc(a) {
  if (null === a) {
    return "null";
  }
  var b = typeof a;
  return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
}
function bd(a, b) {
  switch(b) {
    case 2:
      return function(c) {
        return this.fromWireType(xa[c >> 2]);
      };
    case 3:
      return function(c) {
        return this.fromWireType(ya[c >> 3]);
      };
    default:
      throw new TypeError("Unknown float type: " + a);
  }
}
function cd(a, b, c) {
  switch(b) {
    case 0:
      return c ? function(d) {
        return D[d];
      } : function(d) {
        return F[d];
      };
    case 1:
      return c ? function(d) {
        return G[d >> 1];
      } : function(d) {
        return wa[d >> 1];
      };
    case 2:
      return c ? function(d) {
        return J[d >> 2];
      } : function(d) {
        return K[d >> 2];
      };
    default:
      throw new TypeError("Unknown integer type: " + a);
  }
}
var dd = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, ed = (a, b) => {
  var c = a >> 1;
  for (var d = c + b / 2; !(c >= d) && wa[c];) {
    ++c;
  }
  c <<= 1;
  if (32 < c - a && dd) {
    return dd.decode(F.subarray(a, c));
  }
  c = "";
  for (d = 0; !(d >= b / 2); ++d) {
    var e = G[a + 2 * d >> 1];
    if (0 == e) {
      break;
    }
    c += String.fromCharCode(e);
  }
  return c;
}, fd = (a, b, c) => {
  void 0 === c && (c = 2147483647);
  if (2 > c) {
    return 0;
  }
  c -= 2;
  var d = b;
  c = c < 2 * a.length ? c / 2 : a.length;
  for (var e = 0; e < c; ++e) {
    G[b >> 1] = a.charCodeAt(e), b += 2;
  }
  G[b >> 1] = 0;
  return b - d;
}, gd = a => 2 * a.length, hd = (a, b) => {
  for (var c = 0, d = ""; !(c >= b / 4);) {
    var e = J[a + 4 * c >> 2];
    if (0 == e) {
      break;
    }
    ++c;
    65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);
  }
  return d;
}, jd = (a, b, c) => {
  void 0 === c && (c = 2147483647);
  if (4 > c) {
    return 0;
  }
  var d = b;
  c = d + c - 4;
  for (var e = 0; e < a.length; ++e) {
    var f = a.charCodeAt(e);
    if (55296 <= f && 57343 >= f) {
      var g = a.charCodeAt(++e);
      f = 65536 + ((f & 1023) << 10) | g & 1023;
    }
    J[b >> 2] = f;
    b += 4;
    if (b + 4 > c) {
      break;
    }
  }
  J[b >> 2] = 0;
  return b - d;
}, kd = a => {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var d = a.charCodeAt(c);
    55296 <= d && 57343 >= d && ++c;
    b += 4;
  }
  return b;
}, ld = {};
function md(a) {
  var b = ld[a];
  return void 0 === b ? U(a) : b;
}
var nd = [];
function od(a) {
  var b = nd.length;
  nd.push(a);
  return b;
}
function pd(a, b) {
  for (var c = Array(a), d = 0; d < a; ++d) {
    c[d] = oc(K[b + 4 * d >> 2], "parameter " + d);
  }
  return c;
}
var qd = [], rd = [];
function sd(a) {
  a.Ac = a.getExtension("WEBGL_draw_instanced_base_vertex_base_instance");
}
function td(a) {
  a.Ic = a.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance");
}
var ud = 1, vd = [], wd = [], xd = [], yd = [], zd = [], Ad = [], Bd = [], w = [], Cd = {};
function Y(a) {
  Dd || (Dd = a);
}
function Ed(a) {
  for (var b = ud++, c = a.length; c < b; c++) {
    a[c] = null;
  }
  return b;
}
function ia(a, b) {
  var c = Ed(w), d = {handle:c, attributes:b, version:b.Ec, C:a};
  a.canvas && (a.canvas.zb = d);
  w[c] = d;
  ("undefined" == typeof b.Kb || b.Kb) && Fd(d);
  return c;
}
function ja(a) {
  r = w[a];
  k.yc = Z = r && r.C;
  return !(a && !Z);
}
function Fd(a) {
  a || (a = r);
  if (!a.Vb) {
    a.Vb = !0;
    var b = a.C;
    sd(b);
    td(b);
    2 <= a.version && (b.$a = b.getExtension("EXT_disjoint_timer_query_webgl2"));
    if (2 > a.version || !b.$a) {
      b.$a = b.getExtension("EXT_disjoint_timer_query");
    }
    Gd(b);
    (b.getSupportedExtensions() || []).forEach(function(c) {
      c.includes("lose_context") || c.includes("debug") || b.getExtension(c);
    });
  }
}
var Dd, r;
function Gd(a) {
  a.Kc = a.getExtension("WEBGL_multi_draw");
}
var Hd = {}, Jd = () => {
  if (!Id) {
    var a = {USER:"web_user", LOGNAME:"web_user", PATH:"/", PWD:"/", HOME:"/home/web_user", LANG:("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _:la || "./this.program"}, b;
    for (b in Hd) {
      void 0 === Hd[b] ? delete a[b] : a[b] = Hd[b];
    }
    var c = [];
    for (b in a) {
      c.push(`${b}=${a[b]}`);
    }
    Id = c;
  }
  return Id;
}, Id, Kd = [];
function Ld(a, b, c, d) {
  for (var e = 0; e < a; e++) {
    var f = Z[c](), g = f && Ed(d);
    f ? (f.name = g, d[g] = f) : Y(1282);
    J[b + 4 * e >> 2] = g;
  }
}
function Md(a, b) {
  if (b) {
    var c = void 0;
    switch(a) {
      case 36346:
        c = 1;
        break;
      case 36344:
        return;
      case 34814:
      case 36345:
        c = 0;
        break;
      case 34466:
        var d = Z.getParameter(34467);
        c = d ? d.length : 0;
        break;
      case 33309:
        if (2 > r.version) {
          Y(1282);
          return;
        }
        c = 2 * (Z.getSupportedExtensions() || []).length;
        break;
      case 33307:
      case 33308:
        if (2 > r.version) {
          Y(1280);
          return;
        }
        c = 33307 == a ? 3 : 0;
    }
    if (void 0 === c) {
      switch(d = Z.getParameter(a), typeof d) {
        case "number":
          c = d;
          break;
        case "boolean":
          c = d ? 1 : 0;
          break;
        case "string":
          Y(1280);
          return;
        case "object":
          if (null === d) {
            switch(a) {
              case 34964:
              case 35725:
              case 34965:
              case 36006:
              case 36007:
              case 32873:
              case 34229:
              case 36662:
              case 36663:
              case 35053:
              case 35055:
              case 36010:
              case 35097:
              case 35869:
              case 32874:
              case 36389:
              case 35983:
              case 35368:
              case 34068:
                c = 0;
                break;
              default:
                Y(1280);
                return;
            }
          } else {
            if (d instanceof Float32Array || d instanceof Uint32Array || d instanceof Int32Array || d instanceof Array) {
              for (a = 0; a < d.length; ++a) {
                J[b + 4 * a >> 2] = d[a];
              }
              return;
            }
            try {
              c = d.name | 0;
            } catch (e) {
              Y(1280);
              ra("GL_INVALID_ENUM in glGet0v: Unknown object returned from WebGL getParameter(" + a + ")! (error: " + e + ")");
              return;
            }
          }
          break;
        default:
          Y(1280);
          ra("GL_INVALID_ENUM in glGet0v: Native code calling glGet0v(" + a + ") and it returns " + d + " of type " + typeof d + "!");
          return;
      }
    }
    J[b >> 2] = c;
  } else {
    Y(1281);
  }
}
var Od = a => {
  var b = eb(a) + 1, c = Nd(b);
  c && fb(a, F, c, b);
  return c;
};
function Pd(a) {
  return "]" == a.slice(-1) && a.lastIndexOf("[");
}
var Qd = a => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), Rd = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Sd = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Td = (a, b, c, d) => {
  function e(n, q, u) {
    for (n = "number" == typeof n ? n.toString() : n || ""; n.length < q;) {
      n = u[0] + n;
    }
    return n;
  }
  function f(n, q) {
    return e(n, q, "0");
  }
  function g(n, q) {
    function u(z) {
      return 0 > z ? -1 : 0 < z ? 1 : 0;
    }
    var y;
    0 === (y = u(n.getFullYear() - q.getFullYear())) && 0 === (y = u(n.getMonth() - q.getMonth())) && (y = u(n.getDate() - q.getDate()));
    return y;
  }
  function l(n) {
    switch(n.getDay()) {
      case 0:
        return new Date(n.getFullYear() - 1, 11, 29);
      case 1:
        return n;
      case 2:
        return new Date(n.getFullYear(), 0, 3);
      case 3:
        return new Date(n.getFullYear(), 0, 2);
      case 4:
        return new Date(n.getFullYear(), 0, 1);
      case 5:
        return new Date(n.getFullYear() - 1, 11, 31);
      case 6:
        return new Date(n.getFullYear() - 1, 11, 30);
    }
  }
  function p(n) {
    var q = n.da;
    for (n = new Date((new Date(n.ea + 1900, 0, 1)).getTime()); 0 < q;) {
      var u = n.getMonth(), y = (Qd(n.getFullYear()) ? Rd : Sd)[u];
      if (q > y - n.getDate()) {
        q -= y - n.getDate() + 1, n.setDate(1), 11 > u ? n.setMonth(u + 1) : (n.setMonth(0), n.setFullYear(n.getFullYear() + 1));
      } else {
        n.setDate(n.getDate() + q);
        break;
      }
    }
    u = new Date(n.getFullYear() + 1, 0, 4);
    q = l(new Date(n.getFullYear(), 0, 4));
    u = l(u);
    return 0 >= g(q, n) ? 0 >= g(u, n) ? n.getFullYear() + 1 : n.getFullYear() : n.getFullYear() - 1;
  }
  var m = J[d + 40 >> 2];
  d = {mc:J[d >> 2], lc:J[d + 4 >> 2], Ga:J[d + 8 >> 2], Ta:J[d + 12 >> 2], Ha:J[d + 16 >> 2], ea:J[d + 20 >> 2], R:J[d + 24 >> 2], da:J[d + 28 >> 2], Pc:J[d + 32 >> 2], kc:J[d + 36 >> 2], nc:m ? m ? M(F, m) : "" : ""};
  c = c ? M(F, c) : "";
  m = {"%c":"%a %b %d %H:%M:%S %Y", "%D":"%m/%d/%y", "%F":"%Y-%m-%d", "%h":"%b", "%r":"%I:%M:%S %p", "%R":"%H:%M", "%T":"%H:%M:%S", "%x":"%m/%d/%y", "%X":"%H:%M:%S", "%Ec":"%c", "%EC":"%C", "%Ex":"%m/%d/%y", "%EX":"%H:%M:%S", "%Ey":"%y", "%EY":"%Y", "%Od":"%d", "%Oe":"%e", "%OH":"%H", "%OI":"%I", "%Om":"%m", "%OM":"%M", "%OS":"%S", "%Ou":"%u", "%OU":"%U", "%OV":"%V", "%Ow":"%w", "%OW":"%W", "%Oy":"%y",};
  for (var t in m) {
    c = c.replace(new RegExp(t, "g"), m[t]);
  }
  var v = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), x = "January February March April May June July August September October November December".split(" ");
  m = {"%a":n => v[n.R].substring(0, 3), "%A":n => v[n.R], "%b":n => x[n.Ha].substring(0, 3), "%B":n => x[n.Ha], "%C":n => f((n.ea + 1900) / 100 | 0, 2), "%d":n => f(n.Ta, 2), "%e":n => e(n.Ta, 2, " "), "%g":n => p(n).toString().substring(2), "%G":n => p(n), "%H":n => f(n.Ga, 2), "%I":n => {
    n = n.Ga;
    0 == n ? n = 12 : 12 < n && (n -= 12);
    return f(n, 2);
  }, "%j":n => {
    for (var q = 0, u = 0; u <= n.Ha - 1; q += (Qd(n.ea + 1900) ? Rd : Sd)[u++]) {
    }
    return f(n.Ta + q, 3);
  }, "%m":n => f(n.Ha + 1, 2), "%M":n => f(n.lc, 2), "%n":() => "\n", "%p":n => 0 <= n.Ga && 12 > n.Ga ? "AM" : "PM", "%S":n => f(n.mc, 2), "%t":() => "\t", "%u":n => n.R || 7, "%U":n => f(Math.floor((n.da + 7 - n.R) / 7), 2), "%V":n => {
    var q = Math.floor((n.da + 7 - (n.R + 6) % 7) / 7);
    2 >= (n.R + 371 - n.da - 2) % 7 && q++;
    if (q) {
      53 == q && (u = (n.R + 371 - n.da) % 7, 4 == u || 3 == u && Qd(n.ea) || (q = 1));
    } else {
      q = 52;
      var u = (n.R + 7 - n.da - 1) % 7;
      (4 == u || 5 == u && Qd(n.ea % 400 - 1)) && q++;
    }
    return f(q, 2);
  }, "%w":n => n.R, "%W":n => f(Math.floor((n.da + 7 - (n.R + 6) % 7) / 7), 2), "%y":n => (n.ea + 1900).toString().substring(2), "%Y":n => n.ea + 1900, "%z":n => {
    n = n.kc;
    var q = 0 <= n;
    n = Math.abs(n) / 60;
    return (q ? "+" : "-") + String("0000" + (n / 60 * 100 + n % 60)).slice(-4);
  }, "%Z":n => n.nc, "%%":() => "%"};
  c = c.replace(/%%/g, "\x00\x00");
  for (t in m) {
    c.includes(t) && (c = c.replace(new RegExp(t, "g"), m[t](d)));
  }
  c = c.replace(/\0\0/g, "%");
  t = gb(c, !1);
  if (t.length > b) {
    return 0;
  }
  D.set(t, a);
  return t.length - 1;
};
function Fb(a, b, c, d) {
  a || (a = this);
  this.parent = a;
  this.U = a.U;
  this.Aa = null;
  this.id = xb++;
  this.name = b;
  this.mode = c;
  this.l = {};
  this.m = {};
  this.Ca = d;
}
Object.defineProperties(Fb.prototype, {read:{get:function() {
  return 365 === (this.mode & 365);
}, set:function(a) {
  a ? this.mode |= 365 : this.mode &= -366;
}}, write:{get:function() {
  return 146 === (this.mode & 146);
}, set:function(a) {
  a ? this.mode |= 146 : this.mode &= -147;
}}});
Sb();
yb = Array(4096);
Mb(O, "/");
P("/tmp", 16895, 0);
P("/home", 16895, 0);
P("/home/web_user", 16895, 0);
(() => {
  P("/dev", 16895, 0);
  jb(259, {read:() => 0, write:(d, e, f, g) => g,});
  Nb("/dev/null", 259);
  ib(1280, lb);
  ib(1536, mb);
  Nb("/dev/tty", 1280);
  Nb("/dev/tty1", 1536);
  var a = new Uint8Array(1024), b = 0, c = () => {
    0 === b && (b = ab(a).byteLength);
    return a[--b];
  };
  Vb("random", c);
  Vb("urandom", c);
  P("/dev/shm", 16895, 0);
  P("/dev/shm/tmp", 16895, 0);
})();
(() => {
  P("/proc", 16895, 0);
  var a = P("/proc/self", 16895, 0);
  P("/proc/self/fd", 16895, 0);
  Mb({U:() => {
    var b = pb(a, "fd", 16895, 73);
    b.l = {ma:(c, d) => {
      var e = Jb(+d);
      c = {parent:null, U:{ib:"fake"}, l:{na:() => e.path},};
      return c.parent = c;
    }};
    return b;
  }}, "/proc/self/fd");
})();
Object.assign(ac.prototype, {get(a) {
  return this.M[a];
}, has(a) {
  return void 0 !== this.M[a];
}, ta(a) {
  var b = this.eb.pop() || this.M.length;
  this.M[b] = a;
  return b;
}, Tb(a) {
  this.M[a] = void 0;
  this.eb.push(a);
}});
bc = k.BindingError = class extends Error {
  constructor(a) {
    super(a);
    this.name = "BindingError";
  }
};
Q.M.push({value:void 0}, {value:null}, {value:!0}, {value:!1},);
Q.h = Q.M.length;
k.count_emval_handles = function() {
  for (var a = 0, b = Q.h; b < Q.M.length; ++b) {
    void 0 !== Q.M[b] && ++a;
  }
  return a;
};
dc = k.PureVirtualError = cc("PureVirtualError");
for (var Ud = Array(256), Vd = 0; 256 > Vd; ++Vd) {
  Ud[Vd] = String.fromCharCode(Vd);
}
ec = Ud;
k.getInheritedInstanceCount = function() {
  return Object.keys(ic).length;
};
k.getLiveInheritedInstances = function() {
  var a = [], b;
  for (b in ic) {
    ic.hasOwnProperty(b) && a.push(ic[b]);
  }
  return a;
};
k.flushPendingDeletes = gc;
k.setDelayFunction = function(a) {
  hc = a;
  fc.length && hc && hc(gc);
};
vc = k.InternalError = class extends Error {
  constructor(a) {
    super(a);
    this.name = "InternalError";
  }
};
Hc.prototype.isAliasOf = function(a) {
  if (!(this instanceof Hc && a instanceof Hc)) {
    return !1;
  }
  var b = this.g.u.i, c = this.g.o, d = a.g.u.i;
  for (a = a.g.o; b.A;) {
    c = b.pa(c), b = b.A;
  }
  for (; d.A;) {
    a = d.pa(a), d = d.A;
  }
  return b === d && c === a;
};
Hc.prototype.clone = function() {
  this.g.o || Gc(this);
  if (this.g.ka) {
    return this.g.count.value += 1, this;
  }
  var a = yc, b = Object, c = b.create, d = Object.getPrototypeOf(this), e = this.g;
  a = a(c.call(b, d, {g:{value:{count:e.count, ia:e.ia, ka:e.ka, o:e.o, u:e.u, H:e.H, L:e.L,},}}));
  a.g.count.value += 1;
  a.g.ia = !1;
  return a;
};
Hc.prototype["delete"] = function() {
  this.g.o || Gc(this);
  this.g.ia && !this.g.ka && R("Object already scheduled for deletion");
  pc(this);
  rc(this.g);
  this.g.ka || (this.g.H = void 0, this.g.o = void 0);
};
Hc.prototype.isDeleted = function() {
  return !this.g.o;
};
Hc.prototype.deleteLater = function() {
  this.g.o || Gc(this);
  this.g.ia && !this.g.ka && R("Object already scheduled for deletion");
  fc.push(this);
  1 === fc.length && hc && hc(gc);
  this.g.ia = !0;
  return this;
};
Qc.prototype.Pb = function(a) {
  this.ob && (a = this.ob(a));
  return a;
};
Qc.prototype.Za = function(a) {
  this.W && this.W(a);
};
Qc.prototype.argPackAdvance = 8;
Qc.prototype.readValueFromPointer = Bc;
Qc.prototype.deleteObject = function(a) {
  if (null !== a) {
    a["delete"]();
  }
};
Qc.prototype.fromWireType = function(a) {
  function b() {
    return this.ya ? xc(this.i.N, {u:this.cc, o:c, L:this, H:a,}) : xc(this.i.N, {u:this, o:a,});
  }
  var c = this.Pb(a);
  if (!c) {
    return this.Za(a), null;
  }
  var d = uc(this.i, c);
  if (void 0 !== d) {
    if (0 === d.g.count.value) {
      return d.g.o = c, d.g.H = a, d.clone();
    }
    d = d.clone();
    this.Za(a);
    return d;
  }
  d = this.i.Ob(c);
  d = tc[d];
  if (!d) {
    return b.call(this);
  }
  d = this.xa ? d.Gb : d.pointerType;
  var e = sc(c, this.i, d.i);
  return null === e ? b.call(this) : this.ya ? xc(d.i.N, {u:d, o:e, L:this, H:a,}) : xc(d.i.N, {u:d, o:e,});
};
Vc = k.UnboundTypeError = cc("UnboundTypeError");
for (var Z, Wd = 0; 32 > Wd; ++Wd) {
  Kd.push(Array(Wd));
}
var Yd = {__syscall_fcntl64:function(a, b, c) {
  Xb = c;
  try {
    var d = Jb(a);
    switch(b) {
      case 0:
        var e = Yb();
        return 0 > e ? -28 : Lb(d, e).X;
      case 1:
      case 2:
        return 0;
      case 3:
        return d.flags;
      case 4:
        return e = Yb(), d.flags |= e, 0;
      case 5:
        return e = Yb(), G[e + 0 >> 1] = 2, 0;
      case 6:
      case 7:
        return 0;
      case 16:
      case 8:
        return -28;
      case 9:
        return J[Xd() >> 2] = 28, -1;
      default:
        return -28;
    }
  } catch (f) {
    if ("undefined" == typeof Wb || "ErrnoError" !== f.name) {
      throw f;
    }
    return -f.aa;
  }
}, __syscall_ioctl:function(a, b, c) {
  Xb = c;
  try {
    var d = Jb(a);
    switch(b) {
      case 21509:
        return d.s ? 0 : -59;
      case 21505:
        if (!d.s) {
          return -59;
        }
        if (d.s.V.Xb) {
          b = [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
          var e = Yb();
          J[e >> 2] = 25856;
          J[e + 4 >> 2] = 5;
          J[e + 8 >> 2] = 191;
          J[e + 12 >> 2] = 35387;
          for (var f = 0; 32 > f; f++) {
            D[e + f + 17 >> 0] = b[f] || 0;
          }
        }
        return 0;
      case 21510:
      case 21511:
      case 21512:
        return d.s ? 0 : -59;
      case 21506:
      case 21507:
      case 21508:
        if (!d.s) {
          return -59;
        }
        if (d.s.V.Yb) {
          for (e = Yb(), b = [], f = 0; 32 > f; f++) {
            b.push(D[e + f + 17 >> 0]);
          }
        }
        return 0;
      case 21519:
        if (!d.s) {
          return -59;
        }
        e = Yb();
        return J[e >> 2] = 0;
      case 21520:
        return d.s ? -28 : -59;
      case 21531:
        e = Yb();
        if (!d.m.Wb) {
          throw new N(59);
        }
        return d.m.Wb(d, b, e);
      case 21523:
        if (!d.s) {
          return -59;
        }
        d.s.V.Zb && (f = [24, 80], e = Yb(), G[e >> 1] = f[0], G[e + 2 >> 1] = f[1]);
        return 0;
      case 21524:
        return d.s ? 0 : -59;
      case 21515:
        return d.s ? 0 : -59;
      default:
        return -28;
    }
  } catch (g) {
    if ("undefined" == typeof Wb || "ErrnoError" !== g.name) {
      throw g;
    }
    return -g.aa;
  }
}, __syscall_openat:function(a, b, c, d) {
  Xb = d;
  try {
    b = b ? M(F, b) : "";
    var e = b;
    if ("/" === e.charAt(0)) {
      b = e;
    } else {
      var f = -100 === a ? "/" : Jb(a).path;
      if (0 == e.length) {
        throw new N(44);
      }
      b = Xa(f + "/" + e);
    }
    var g = d ? Yb() : 0;
    return Qb(b, c, g).X;
  } catch (l) {
    if ("undefined" == typeof Wb || "ErrnoError" !== l.name) {
      throw l;
    }
    return -l.aa;
  }
}, _embind_create_inheriting_constructor:function(a, b, c) {
  a = U(a);
  b = oc(b, "wrapper");
  c = S(c);
  var d = [].slice, e = b.i, f = e.N, g = e.A.N, l = e.A.constructor;
  a = $b(a, function() {
    e.A.mb.forEach(function(m) {
      if (this[m] === g[m]) {
        throw new dc(`Pure virtual function ${m} must be implemented in JavaScript`);
      }
    }.bind(this));
    Object.defineProperty(this, "__parent", {value:f});
    this.__construct.apply(this, d.call(arguments));
  });
  f.__construct = function() {
    this === f && R("Pass correct 'this' to __construct");
    var m = l.implement.apply(void 0, [this].concat(d.call(arguments)));
    pc(m);
    var t = m.g;
    m.notifyOnDestruction();
    t.ka = !0;
    Object.defineProperties(this, {g:{value:t}});
    yc(this);
    m = t.o;
    m = jc(e, m);
    ic.hasOwnProperty(m) ? R(`Tried to register registered instance: ${m}`) : ic[m] = this;
  };
  f.__destruct = function() {
    this === f && R("Pass correct 'this' to __destruct");
    pc(this);
    var m = this.g.o;
    m = jc(e, m);
    ic.hasOwnProperty(m) ? delete ic[m] : R(`Tried to unregister unregistered instance: ${m}`);
  };
  a.prototype = Object.create(f);
  for (var p in c) {
    a.prototype[p] = c[p];
  }
  return T(a);
}, _embind_finalize_value_object:function(a) {
  var b = zc[a];
  delete zc[a];
  var c = b.Ra, d = b.W, e = b.ab, f = e.map(g => g.Sb).concat(e.map(g => g.hc));
  V([a], f, g => {
    var l = {};
    e.forEach((p, m) => {
      var t = g[m], v = p.Qb, x = p.Rb, n = g[m + e.length], q = p.fc, u = p.ic;
      l[p.Mb] = {read:y => t.fromWireType(v(x, y)), write:(y, z) => {
        var A = [];
        q(u, y, n.toWireType(A, z));
        Ac(A);
      }};
    });
    return [{name:b.name, fromWireType:function(p) {
      var m = {}, t;
      for (t in l) {
        m[t] = l[t].read(p);
      }
      d(p);
      return m;
    }, toWireType:function(p, m) {
      for (var t in l) {
        if (!(t in m)) {
          throw new TypeError(`Missing field: "${t}"`);
        }
      }
      var v = c();
      for (t in l) {
        l[t].write(v, m[t]);
      }
      null !== p && p.push(d, v);
      return v;
    }, argPackAdvance:8, readValueFromPointer:Bc, K:d,}];
  });
}, _embind_register_bigint:function() {
}, _embind_register_bool:function(a, b, c, d, e) {
  var f = Ec(c);
  b = U(b);
  W(a, {name:b, fromWireType:function(g) {
    return !!g;
  }, toWireType:function(g, l) {
    return l ? d : e;
  }, argPackAdvance:8, readValueFromPointer:function(g) {
    if (1 === c) {
      var l = D;
    } else if (2 === c) {
      l = G;
    } else if (4 === c) {
      l = J;
    } else {
      throw new TypeError("Unknown boolean type size: " + b);
    }
    return this.fromWireType(l[g >> f]);
  }, K:null,});
}, _embind_register_class:function(a, b, c, d, e, f, g, l, p, m, t, v, x) {
  t = U(t);
  f = X(e, f);
  l && (l = X(g, l));
  m && (m = X(p, m));
  x = X(v, x);
  var n = Zb(t);
  Jc(n, function() {
    Wc(`Cannot construct ${t} due to unbound types`, [d]);
  });
  V([a, b, c], d ? [d] : [], function(q) {
    q = q[0];
    if (d) {
      var u = q.i;
      var y = u.N;
    } else {
      y = Hc.prototype;
    }
    q = $b(n, function() {
      if (Object.getPrototypeOf(this) !== z) {
        throw new bc("Use 'new' to construct " + t);
      }
      if (void 0 === A.$) {
        throw new bc(t + " has no accessible constructor");
      }
      var I = A.$[arguments.length];
      if (void 0 === I) {
        throw new bc(`Tried to invoke ctor of ${t} with invalid number of parameters (${arguments.length}) - expected (${Object.keys(A.$).toString()}) parameters instead!`);
      }
      return I.apply(this, arguments);
    });
    var z = Object.create(y, {constructor:{value:q},});
    q.prototype = z;
    var A = new Kc(t, q, z, x, u, f, l, m);
    A.A && (void 0 === A.A.qa && (A.A.qa = []), A.A.qa.push(A));
    u = new Qc(t, A, !0, !1);
    y = new Qc(t + "*", A, !1, !1);
    var H = new Qc(t + " const*", A, !1, !0);
    tc[a] = {pointerType:y, Gb:H};
    Rc(n, q);
    return [u, y, H];
  });
}, _embind_register_class_class_function:function(a, b, c, d, e, f, g) {
  var l = Yc(c, d);
  b = U(b);
  f = X(e, f);
  V([], [a], function(p) {
    function m() {
      Wc(`Cannot call ${t} due to unbound types`, l);
    }
    p = p[0];
    var t = `${p.name}.${b}`;
    b.startsWith("@@") && (b = Symbol[b.substring(2)]);
    var v = p.i.constructor;
    void 0 === v[b] ? (m.ha = c - 1, v[b] = m) : (Ic(v, b, t), v[b].B[c - 1] = m);
    V([], l, function(x) {
      x = Xc(t, [x[0], null].concat(x.slice(1)), null, f, g);
      void 0 === v[b].B ? (x.ha = c - 1, v[b] = x) : v[b].B[c - 1] = x;
      if (p.i.qa) {
        for (const n of p.i.qa) {
          n.constructor.hasOwnProperty(b) || (n.constructor[b] = x);
        }
      }
      return [];
    });
    return [];
  });
}, _embind_register_class_class_property:function(a, b, c, d, e, f, g, l) {
  b = U(b);
  f = X(e, f);
  V([], [a], function(p) {
    p = p[0];
    var m = `${p.name}.${b}`, t = {get() {
      Wc(`Cannot access ${m} due to unbound types`, [c]);
    }, enumerable:!0, configurable:!0};
    t.set = l ? () => {
      Wc(`Cannot access ${m} due to unbound types`, [c]);
    } : () => {
      R(`${m} is a read-only property`);
    };
    Object.defineProperty(p.i.constructor, b, t);
    V([], [c], function(v) {
      v = v[0];
      var x = {get() {
        return v.fromWireType(f(d));
      }, enumerable:!0};
      l && (l = X(g, l), x.set = n => {
        var q = [];
        l(d, v.toWireType(q, n));
        Ac(q);
      });
      Object.defineProperty(p.i.constructor, b, x);
      return [];
    });
    return [];
  });
}, _embind_register_class_constructor:function(a, b, c, d, e, f) {
  var g = Yc(b, c);
  e = X(d, e);
  V([], [a], function(l) {
    l = l[0];
    var p = `constructor ${l.name}`;
    void 0 === l.i.$ && (l.i.$ = []);
    if (void 0 !== l.i.$[b - 1]) {
      throw new bc(`Cannot register multiple constructors with identical number of parameters (${b - 1}) for class '${l.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
    }
    l.i.$[b - 1] = () => {
      Wc(`Cannot construct ${l.name} due to unbound types`, g);
    };
    V([], g, function(m) {
      m.splice(1, 0, null);
      l.i.$[b - 1] = Xc(p, m, null, e, f);
      return [];
    });
    return [];
  });
}, _embind_register_class_function:function(a, b, c, d, e, f, g, l) {
  var p = Yc(c, d);
  b = U(b);
  f = X(e, f);
  V([], [a], function(m) {
    function t() {
      Wc(`Cannot call ${v} due to unbound types`, p);
    }
    m = m[0];
    var v = `${m.name}.${b}`;
    b.startsWith("@@") && (b = Symbol[b.substring(2)]);
    l && m.i.mb.push(b);
    var x = m.i.N, n = x[b];
    void 0 === n || void 0 === n.B && n.className !== m.name && n.ha === c - 2 ? (t.ha = c - 2, t.className = m.name, x[b] = t) : (Ic(x, b, v), x[b].B[c - 2] = t);
    V([], p, function(q) {
      q = Xc(v, q, m, f, g);
      void 0 === x[b].B ? (q.ha = c - 2, x[b] = q) : x[b].B[c - 2] = q;
      return [];
    });
    return [];
  });
}, _embind_register_class_property:function(a, b, c, d, e, f, g, l, p, m) {
  b = U(b);
  e = X(d, e);
  V([], [a], function(t) {
    t = t[0];
    var v = `${t.name}.${b}`, x = {get() {
      Wc(`Cannot access ${v} due to unbound types`, [c, g]);
    }, enumerable:!0, configurable:!0};
    x.set = p ? () => {
      Wc(`Cannot access ${v} due to unbound types`, [c, g]);
    } : () => {
      R(v + " is a read-only property");
    };
    Object.defineProperty(t.i.N, b, x);
    V([], p ? [c, g] : [c], function(n) {
      var q = n[0], u = {get() {
        var z = Zc(this, t, v + " getter");
        return q.fromWireType(e(f, z));
      }, enumerable:!0};
      if (p) {
        p = X(l, p);
        var y = n[1];
        u.set = function(z) {
          var A = Zc(this, t, v + " setter"), H = [];
          p(m, A, y.toWireType(H, z));
          Ac(H);
        };
      }
      Object.defineProperty(t.i.N, b, u);
      return [];
    });
    return [];
  });
}, _embind_register_emval:function(a, b) {
  b = U(b);
  W(a, {name:b, fromWireType:function(c) {
    var d = S(c);
    $c(c);
    return d;
  }, toWireType:function(c, d) {
    return T(d);
  }, argPackAdvance:8, readValueFromPointer:Bc, K:null,});
}, _embind_register_enum:function(a, b, c, d) {
  function e() {
  }
  c = Ec(c);
  b = U(b);
  e.values = {};
  W(a, {name:b, constructor:e, fromWireType:function(f) {
    return this.constructor.values[f];
  }, toWireType:function(f, g) {
    return g.value;
  }, argPackAdvance:8, readValueFromPointer:ad(b, c, d), K:null,});
  Jc(b, e);
}, _embind_register_enum_value:function(a, b, c) {
  var d = oc(a, "enum");
  b = U(b);
  a = d.constructor;
  d = Object.create(d.constructor.prototype, {value:{value:c}, constructor:{value:$b(`${d.name}_${b}`, function() {
  })},});
  a.values[c] = d;
  a[b] = d;
}, _embind_register_float:function(a, b, c) {
  c = Ec(c);
  b = U(b);
  W(a, {name:b, fromWireType:function(d) {
    return d;
  }, toWireType:function(d, e) {
    return e;
  }, argPackAdvance:8, readValueFromPointer:bd(b, c), K:null,});
}, _embind_register_function:function(a, b, c, d, e, f) {
  var g = Yc(b, c);
  a = U(a);
  e = X(d, e);
  Jc(a, function() {
    Wc(`Cannot call ${a} due to unbound types`, g);
  }, b - 1);
  V([], g, function(l) {
    Rc(a, Xc(a, [l[0], null].concat(l.slice(1)), null, e, f), b - 1);
    return [];
  });
}, _embind_register_integer:function(a, b, c, d, e) {
  b = U(b);
  -1 === e && (e = 4294967295);
  e = Ec(c);
  var f = l => l;
  if (0 === d) {
    var g = 32 - 8 * c;
    f = l => l << g >>> g;
  }
  c = b.includes("unsigned") ? function(l, p) {
    return p >>> 0;
  } : function(l, p) {
    return p;
  };
  W(a, {name:b, fromWireType:f, toWireType:c, argPackAdvance:8, readValueFromPointer:cd(b, e, 0 !== d), K:null,});
}, _embind_register_memory_view:function(a, b, c) {
  function d(f) {
    f >>= 2;
    var g = K;
    return new e(g.buffer, g[f + 1], g[f]);
  }
  var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array,][b];
  c = U(c);
  W(a, {name:c, fromWireType:d, argPackAdvance:8, readValueFromPointer:d,}, {Ub:!0,});
}, _embind_register_std_string:function(a, b) {
  b = U(b);
  var c = "std::string" === b;
  W(a, {name:b, fromWireType:function(d) {
    var e = K[d >> 2], f = d + 4;
    if (c) {
      for (var g = f, l = 0; l <= e; ++l) {
        var p = f + l;
        if (l == e || 0 == F[p]) {
          g = g ? M(F, g, p - g) : "";
          if (void 0 === m) {
            var m = g;
          } else {
            m += String.fromCharCode(0), m += g;
          }
          g = p + 1;
        }
      }
    } else {
      m = Array(e);
      for (l = 0; l < e; ++l) {
        m[l] = String.fromCharCode(F[f + l]);
      }
      m = m.join("");
    }
    nc(d);
    return m;
  }, toWireType:function(d, e) {
    e instanceof ArrayBuffer && (e = new Uint8Array(e));
    var f = "string" == typeof e;
    f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array || R("Cannot pass non-string to std::string");
    var g = c && f ? eb(e) : e.length;
    var l = Nd(4 + g + 1), p = l + 4;
    K[l >> 2] = g;
    if (c && f) {
      fb(e, F, p, g + 1);
    } else {
      if (f) {
        for (f = 0; f < g; ++f) {
          var m = e.charCodeAt(f);
          255 < m && (nc(p), R("String has UTF-16 code units that do not fit in 8 bits"));
          F[p + f] = m;
        }
      } else {
        for (f = 0; f < g; ++f) {
          F[p + f] = e[f];
        }
      }
    }
    null !== d && d.push(nc, l);
    return l;
  }, argPackAdvance:8, readValueFromPointer:Bc, K:function(d) {
    nc(d);
  },});
}, _embind_register_std_wstring:function(a, b, c) {
  c = U(c);
  if (2 === b) {
    var d = ed;
    var e = fd;
    var f = gd;
    var g = () => wa;
    var l = 1;
  } else {
    4 === b && (d = hd, e = jd, f = kd, g = () => K, l = 2);
  }
  W(a, {name:c, fromWireType:function(p) {
    for (var m = K[p >> 2], t = g(), v, x = p + 4, n = 0; n <= m; ++n) {
      var q = p + 4 + n * b;
      if (n == m || 0 == t[q >> l]) {
        x = d(x, q - x), void 0 === v ? v = x : (v += String.fromCharCode(0), v += x), x = q + b;
      }
    }
    nc(p);
    return v;
  }, toWireType:function(p, m) {
    "string" != typeof m && R(`Cannot pass non-string to C++ string type ${c}`);
    var t = f(m), v = Nd(4 + t + b);
    K[v >> 2] = t >> l;
    e(m, v + 4, t + b);
    null !== p && p.push(nc, v);
    return v;
  }, argPackAdvance:8, readValueFromPointer:Bc, K:function(p) {
    nc(p);
  },});
}, _embind_register_value_object:function(a, b, c, d, e, f) {
  zc[a] = {name:U(b), Ra:X(c, d), W:X(e, f), ab:[],};
}, _embind_register_value_object_field:function(a, b, c, d, e, f, g, l, p, m) {
  zc[a].ab.push({Mb:U(b), Sb:c, Qb:X(d, e), Rb:f, hc:g, fc:X(l, p), ic:m,});
}, _embind_register_void:function(a, b) {
  b = U(b);
  W(a, {$b:!0, name:b, argPackAdvance:0, fromWireType:function() {
  }, toWireType:function() {
  },});
}, _emscripten_get_now_is_monotonic:() => !0, _emval_as:function(a, b, c) {
  a = S(a);
  b = oc(b, "emval::as");
  var d = [], e = T(d);
  K[c >> 2] = e;
  return b.toWireType(d, a);
}, _emval_call_method:function(a, b, c, d, e) {
  a = nd[a];
  b = S(b);
  c = md(c);
  var f = [];
  K[d >> 2] = T(f);
  return a(b, c, f, e);
}, _emval_call_void_method:function(a, b, c, d) {
  a = nd[a];
  b = S(b);
  c = md(c);
  a(b, c, null, d);
}, _emval_decref:$c, _emval_get_method_caller:function(a, b) {
  var c = pd(a, b), d = c[0];
  b = d.name + "_$" + c.slice(1).map(function(g) {
    return g.name;
  }).join("_") + "$";
  var e = qd[b];
  if (void 0 !== e) {
    return e;
  }
  var f = Array(a - 1);
  e = od((g, l, p, m) => {
    for (var t = 0, v = 0; v < a - 1; ++v) {
      f[v] = c[v + 1].readValueFromPointer(m + t), t += c[v + 1].argPackAdvance;
    }
    g = g[l].apply(g, f);
    for (v = 0; v < a - 1; ++v) {
      c[v + 1].Ib && c[v + 1].Ib(f[v]);
    }
    if (!d.$b) {
      return d.toWireType(p, g);
    }
  });
  return qd[b] = e;
}, _emval_get_property:function(a, b) {
  a = S(a);
  b = S(b);
  return T(a[b]);
}, _emval_incref:function(a) {
  4 < a && (Q.get(a).qb += 1);
}, _emval_new_array:function() {
  return T([]);
}, _emval_new_cstring:function(a) {
  return T(md(a));
}, _emval_new_object:function() {
  return T({});
}, _emval_run_destructors:function(a) {
  var b = S(a);
  Ac(b);
  $c(a);
}, _emval_set_property:function(a, b, c) {
  a = S(a);
  b = S(b);
  c = S(c);
  a[b] = c;
}, _emval_take_value:function(a, b) {
  a = oc(a, "_emval_take_value");
  a = a.readValueFromPointer(b);
  return T(a);
}, abort:() => {
  ta("");
}, beginPixelLocalStorageWEBGL:function(a, b, c) {
  (a = w[a].C.ca) && a.beginPixelLocalStorageWEBGL(k.HEAPU32.subarray(c, c + b));
}, decode_image:function(a, b, c) {
  var d = k.images;
  d || (d = new Map(), k.images = d);
  var e = new Image();
  d.set(a, e);
  b = k.HEAP8.subarray(b, b + c);
  c = new Uint8Array(c);
  c.set(b);
  e.src = URL.createObjectURL(new Blob([c], {type:"image/png"}));
  e.onload = function() {
    k._setWebImage(a, e.width, e.height);
  };
}, delete_image:function(a) {
  var b = k.images;
  b && b.get(a) && b.delete(a);
}, emscripten_asm_const_int:(a, b, c) => {
  rd.length = 0;
  var d;
  for (c >>= 2; d = F[b++];) {
    c += 105 != d & c, rd.push(105 == d ? J[c] : ya[c++ >> 1]), ++c;
  }
  return Ua[a].apply(null, rd);
}, emscripten_date_now:function() {
  return Date.now();
}, emscripten_get_now:() => performance.now(), emscripten_memcpy_big:(a, b, c) => F.copyWithin(a, b, b + c), emscripten_resize_heap:a => {
  var b = F.length;
  a >>>= 0;
  if (2147483648 < a) {
    return !1;
  }
  for (var c = 1; 4 >= c; c *= 2) {
    var d = b * (1 + 0.2 / c);
    d = Math.min(d, a + 100663296);
    var e = Math;
    d = Math.max(a, d);
    a: {
      e = e.min.call(e, 2147483648, d + (65536 - d % 65536) % 65536) - ua.buffer.byteLength + 65535 >>> 16;
      try {
        ua.grow(e);
        za();
        var f = 1;
        break a;
      } catch (g) {
      }
      f = void 0;
    }
    if (f) {
      return !0;
    }
  }
  return !1;
}, emscripten_webgl_enable_extension:function(a, b) {
  a = w[a];
  b = b ? M(F, b) : "";
  b.startsWith("GL_") && (b = b.substr(3));
  "WEBGL_draw_instanced_base_vertex_base_instance" == b && sd(Z);
  "WEBGL_multi_draw_instanced_base_vertex_base_instance" == b && td(Z);
  "WEBGL_multi_draw" == b && Gd(Z);
  return !!a.C.getExtension(b);
}, emscripten_webgl_get_current_context:function() {
  return r ? r.handle : 0;
}, emscripten_webgl_make_context_current:function(a) {
  return ja(a) ? 0 : -5;
}, enable_WEBGL_provoking_vertex:function(a) {
  a = w[a].C;
  a.nb = a.getExtension("WEBGL_provoking_vertex");
  return !!a.nb;
}, enable_WEBGL_shader_pixel_local_storage_coherent:function(a) {
  a = w[a].C;
  a.ca = a.getExtension("WEBGL_shader_pixel_local_storage");
  return !(!a.ca || !a.ca.isCoherent());
}, endPixelLocalStorageWEBGL:function(a, b, c) {
  (a = w[a].C.ca) && a.endPixelLocalStorageWEBGL(k.HEAPU32.subarray(c, c + b));
}, environ_get:(a, b) => {
  var c = 0;
  Jd().forEach(function(d, e) {
    var f = b + c;
    e = K[a + 4 * e >> 2] = f;
    for (f = 0; f < d.length; ++f) {
      D[e++ >> 0] = d.charCodeAt(f);
    }
    D[e >> 0] = 0;
    c += d.length + 1;
  });
  return 0;
}, environ_sizes_get:(a, b) => {
  var c = Jd();
  K[a >> 2] = c.length;
  var d = 0;
  c.forEach(function(e) {
    d += e.length + 1;
  });
  K[b >> 2] = d;
  return 0;
}, fd_close:function(a) {
  try {
    var b = Jb(a);
    if (null === b.X) {
      throw new N(8);
    }
    b.Oa && (b.Oa = null);
    try {
      b.m.close && b.m.close(b);
    } catch (c) {
      throw c;
    } finally {
      wb[b.X] = null;
    }
    b.X = null;
    return 0;
  } catch (c) {
    if ("undefined" == typeof Wb || "ErrnoError" !== c.name) {
      throw c;
    }
    return c.aa;
  }
}, fd_read:function(a, b, c, d) {
  try {
    a: {
      var e = Jb(a);
      a = b;
      for (var f, g = b = 0; g < c; g++) {
        var l = K[a >> 2], p = K[a + 4 >> 2];
        a += 8;
        var m = e, t = l, v = p, x = f, n = D;
        if (0 > v || 0 > x) {
          throw new N(28);
        }
        if (null === m.X) {
          throw new N(8);
        }
        if (1 === (m.flags & 2097155)) {
          throw new N(8);
        }
        if (16384 === (m.node.mode & 61440)) {
          throw new N(31);
        }
        if (!m.m.read) {
          throw new N(28);
        }
        var q = "undefined" != typeof x;
        if (!q) {
          x = m.position;
        } else if (!m.seekable) {
          throw new N(70);
        }
        var u = m.m.read(m, n, t, v, x);
        q || (m.position += u);
        var y = u;
        if (0 > y) {
          var z = -1;
          break a;
        }
        b += y;
        if (y < p) {
          break;
        }
        "undefined" !== typeof f && (f += y);
      }
      z = b;
    }
    K[d >> 2] = z;
    return 0;
  } catch (A) {
    if ("undefined" == typeof Wb || "ErrnoError" !== A.name) {
      throw A;
    }
    return A.aa;
  }
}, fd_seek:function(a, b, c, d, e) {
  b = c + 2097152 >>> 0 < 4194305 - !!b ? (b >>> 0) + 4294967296 * c : NaN;
  try {
    if (isNaN(b)) {
      return 61;
    }
    var f = Jb(a);
    Rb(f, b, d);
    Qa = [f.position >>> 0, (Pa = f.position, 1.0 <= +Math.abs(Pa) ? 0.0 < Pa ? +Math.floor(Pa / 4294967296.0) >>> 0 : ~~+Math.ceil((Pa - +(~~Pa >>> 0)) / 4294967296.0) >>> 0 : 0)];
    J[e >> 2] = Qa[0];
    J[e + 4 >> 2] = Qa[1];
    f.Oa && 0 === b && 0 === d && (f.Oa = null);
    return 0;
  } catch (g) {
    if ("undefined" == typeof Wb || "ErrnoError" !== g.name) {
      throw g;
    }
    return g.aa;
  }
}, fd_write:function(a, b, c, d) {
  try {
    a: {
      var e = Jb(a);
      a = b;
      for (var f, g = b = 0; g < c; g++) {
        var l = K[a >> 2], p = K[a + 4 >> 2];
        a += 8;
        var m = e, t = l, v = p, x = f, n = D;
        if (0 > v || 0 > x) {
          throw new N(28);
        }
        if (null === m.X) {
          throw new N(8);
        }
        if (0 === (m.flags & 2097155)) {
          throw new N(8);
        }
        if (16384 === (m.node.mode & 61440)) {
          throw new N(31);
        }
        if (!m.m.write) {
          throw new N(28);
        }
        m.seekable && m.flags & 1024 && Rb(m, 0, 2);
        var q = "undefined" != typeof x;
        if (!q) {
          x = m.position;
        } else if (!m.seekable) {
          throw new N(70);
        }
        var u = m.m.write(m, n, t, v, x, void 0);
        q || (m.position += u);
        var y = u;
        if (0 > y) {
          var z = -1;
          break a;
        }
        b += y;
        "undefined" !== typeof f && (f += y);
      }
      z = b;
    }
    K[d >> 2] = z;
    return 0;
  } catch (A) {
    if ("undefined" == typeof Wb || "ErrnoError" !== A.name) {
      throw A;
    }
    return A.aa;
  }
}, framebufferPixelLocalClearValuefvWEBGL:function(a, b, c, d, e, f) {
  (a = w[a].C.ca) && a.framebufferPixelLocalClearValuefvWEBGL(b, [c, d, e, f]);
}, framebufferTexturePixelLocalStorageWEBGL:function(a, b, c, d, e) {
  (a = w[a].C.ca) && a.framebufferTexturePixelLocalStorageWEBGL(b, zd[c], d, e);
}, getFramebufferPixelLocalStorageParameterivWEBGL:function(a, b, c) {
  return (a = w[a].C.ca) ? a.getFramebufferPixelLocalStorageParameterWEBGL(b, c) : 0;
}, glActiveTexture:function(a) {
  Z.activeTexture(a);
}, glAttachShader:function(a, b) {
  Z.attachShader(wd[a], Ad[b]);
}, glBindBuffer:function(a, b) {
  35051 == a ? Z.Ya = b : 35052 == a && (Z.Ma = b);
  Z.bindBuffer(a, vd[b]);
}, glBindBufferRange:function(a, b, c, d, e) {
  Z.bindBufferRange(a, b, vd[c], d, e);
}, glBindFramebuffer:function(a, b) {
  Z.bindFramebuffer(a, xd[b]);
}, glBindRenderbuffer:function(a, b) {
  Z.bindRenderbuffer(a, yd[b]);
}, glBindTexture:function(a, b) {
  Z.bindTexture(a, zd[b]);
}, glBindVertexArray:function(a) {
  Z.bindVertexArray(Bd[a]);
}, glBlendEquation:function(a) {
  Z.blendEquation(a);
}, glBlendFunc:function(a, b) {
  Z.blendFunc(a, b);
}, glBlitFramebuffer:function(a, b, c, d, e, f, g, l, p, m) {
  Z.blitFramebuffer(a, b, c, d, e, f, g, l, p, m);
}, glBufferData:function(a, b, c, d) {
  c && b ? Z.bufferData(a, F, d, c, b) : Z.bufferData(a, b, d);
}, glBufferSubData:function(a, b, c, d) {
  c && Z.bufferSubData(a, b, F, d, c);
}, glClear:function(a) {
  Z.clear(a);
}, glClearColor:function(a, b, c, d) {
  Z.clearColor(a, b, c, d);
}, glClearDepthf:function(a) {
  Z.clearDepth(a);
}, glClearStencil:function(a) {
  Z.clearStencil(a);
}, glColorMask:function(a, b, c, d) {
  Z.colorMask(!!a, !!b, !!c, !!d);
}, glCompileShader:function(a) {
  Z.compileShader(Ad[a]);
}, glCreateProgram:function() {
  var a = Ed(wd), b = Z.createProgram();
  b.name = a;
  b.Hc = b.Fc = b.Gc = 0;
  b.Ua = 1;
  wd[a] = b;
  return a;
}, glCreateShader:function(a) {
  var b = Ed(Ad);
  Ad[b] = Z.createShader(a);
  return b;
}, glCullFace:function(a) {
  Z.cullFace(a);
}, glDeleteBuffers:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = J[b + 4 * c >> 2], e = vd[d];
    e && (Z.deleteBuffer(e), e.name = 0, vd[d] = null, d == Z.Ya && (Z.Ya = 0), d == Z.Ma && (Z.Ma = 0));
  }
}, glDeleteFramebuffers:function(a, b) {
  for (var c = 0; c < a; ++c) {
    var d = J[b + 4 * c >> 2], e = xd[d];
    e && (Z.deleteFramebuffer(e), e.name = 0, xd[d] = null);
  }
}, glDeleteProgram:function(a) {
  if (a) {
    var b = wd[a];
    b ? (Z.deleteProgram(b), b.name = 0, wd[a] = null) : Y(1281);
  }
}, glDeleteRenderbuffers:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = J[b + 4 * c >> 2], e = yd[d];
    e && (Z.deleteRenderbuffer(e), e.name = 0, yd[d] = null);
  }
}, glDeleteShader:function(a) {
  if (a) {
    var b = Ad[a];
    b ? (Z.deleteShader(b), Ad[a] = null) : Y(1281);
  }
}, glDeleteTextures:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = J[b + 4 * c >> 2], e = zd[d];
    e && (Z.deleteTexture(e), e.name = 0, zd[d] = null);
  }
}, glDeleteVertexArrays:function(a, b) {
  for (var c = 0; c < a; c++) {
    var d = J[b + 4 * c >> 2];
    Z.deleteVertexArray(Bd[d]);
    Bd[d] = null;
  }
}, glDepthFunc:function(a) {
  Z.depthFunc(a);
}, glDepthMask:function(a) {
  Z.depthMask(!!a);
}, glDepthRangef:function(a, b) {
  Z.depthRange(a, b);
}, glDisable:function(a) {
  Z.disable(a);
}, glDrawArrays:function(a, b, c) {
  Z.drawArrays(a, b, c);
}, glDrawArraysInstanced:function(a, b, c, d) {
  Z.drawArraysInstanced(a, b, c, d);
}, glDrawBuffers:function(a, b) {
  for (var c = Kd[a], d = 0; d < a; d++) {
    c[d] = J[b + 4 * d >> 2];
  }
  Z.drawBuffers(c);
}, glDrawElements:function(a, b, c, d) {
  Z.drawElements(a, b, c, d);
}, glDrawElementsInstanced:function(a, b, c, d, e) {
  Z.drawElementsInstanced(a, b, c, d, e);
}, glEnable:function(a) {
  Z.enable(a);
}, glEnableVertexAttribArray:function(a) {
  Z.enableVertexAttribArray(a);
}, glFlush:function() {
  Z.flush();
}, glFramebufferRenderbuffer:function(a, b, c, d) {
  Z.framebufferRenderbuffer(a, b, c, yd[d]);
}, glFramebufferTexture2D:function(a, b, c, d, e) {
  Z.framebufferTexture2D(a, b, c, zd[d], e);
}, glFrontFace:function(a) {
  Z.frontFace(a);
}, glGenBuffers:function(a, b) {
  Ld(a, b, "createBuffer", vd);
}, glGenFramebuffers:function(a, b) {
  Ld(a, b, "createFramebuffer", xd);
}, glGenRenderbuffers:function(a, b) {
  Ld(a, b, "createRenderbuffer", yd);
}, glGenTextures:function(a, b) {
  Ld(a, b, "createTexture", zd);
}, glGenVertexArrays:function(a, b) {
  Ld(a, b, "createVertexArray", Bd);
}, glGenerateMipmap:function(a) {
  Z.generateMipmap(a);
}, glGetError:function() {
  var a = Z.getError() || Dd;
  Dd = 0;
  return a;
}, glGetIntegerv:function(a, b) {
  Md(a, b);
}, glGetString:function(a) {
  var b = Cd[a];
  if (!b) {
    switch(a) {
      case 7939:
        b = Z.getSupportedExtensions() || [];
        b = b.concat(b.map(function(d) {
          return "GL_" + d;
        }));
        b = Od(b.join(" "));
        break;
      case 7936:
      case 7937:
      case 37445:
      case 37446:
        (b = Z.getParameter(a)) || Y(1280);
        b = b && Od(b);
        break;
      case 7938:
        b = Od("OpenGL ES 3.0 (" + Z.getParameter(7938) + ")");
        break;
      case 35724:
        b = Z.getParameter(35724);
        var c = b.match(/^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/);
        null !== c && (3 == c[1].length && (c[1] += "0"), b = "OpenGL ES GLSL ES " + c[1] + " (" + b + ")");
        b = Od(b);
        break;
      default:
        Y(1280);
    }
    Cd[a] = b;
  }
  return b;
}, glGetUniformBlockIndex:function(a, b) {
  return Z.getUniformBlockIndex(wd[a], b ? M(F, b) : "");
}, glGetUniformLocation:function(a, b) {
  b = b ? M(F, b) : "";
  if (a = wd[a]) {
    var c = a, d = c.oa, e = c.vb, f;
    if (!d) {
      for (c.oa = d = {}, c.ub = {}, f = 0; f < Z.getProgramParameter(c, 35718); ++f) {
        var g = Z.getActiveUniform(c, f);
        var l = g.name;
        g = g.size;
        var p = Pd(l);
        p = 0 < p ? l.slice(0, p) : l;
        var m = c.Ua;
        c.Ua += g;
        e[p] = [g, m];
        for (l = 0; l < g; ++l) {
          d[m] = l, c.ub[m++] = p;
        }
      }
    }
    c = a.oa;
    d = 0;
    e = b;
    f = Pd(b);
    0 < f && (d = parseInt(b.slice(f + 1)) >>> 0, e = b.slice(0, f));
    if ((e = a.vb[e]) && d < e[0] && (d += e[1], c[d] = c[d] || Z.getUniformLocation(a, b))) {
      return d;
    }
  } else {
    Y(1281);
  }
  return -1;
}, glInvalidateFramebuffer:function(a, b, c) {
  for (var d = Kd[b], e = 0; e < b; e++) {
    d[e] = J[c + 4 * e >> 2];
  }
  Z.invalidateFramebuffer(a, d);
}, glLinkProgram:function(a) {
  a = wd[a];
  Z.linkProgram(a);
  a.oa = 0;
  a.vb = {};
}, glPixelStorei:function(a, b) {
  Z.pixelStorei(a, b);
}, glRenderbufferStorageMultisample:function(a, b, c, d, e) {
  Z.renderbufferStorageMultisample(a, b, c, d, e);
}, glScissor:function(a, b, c, d) {
  Z.scissor(a, b, c, d);
}, glShaderSource:function(a, b, c, d) {
  for (var e = "", f = 0; f < b; ++f) {
    var g = d ? J[d + 4 * f >> 2] : -1, l = J[c + 4 * f >> 2];
    g = l ? M(F, l, 0 > g ? void 0 : g) : "";
    e += g;
  }
  Z.shaderSource(Ad[a], e);
}, glStencilFunc:function(a, b, c) {
  Z.stencilFunc(a, b, c);
}, glStencilFuncSeparate:function(a, b, c, d) {
  Z.stencilFuncSeparate(a, b, c, d);
}, glStencilMask:function(a) {
  Z.stencilMask(a);
}, glStencilOp:function(a, b, c) {
  Z.stencilOp(a, b, c);
}, glStencilOpSeparate:function(a, b, c, d) {
  Z.stencilOpSeparate(a, b, c, d);
}, glTexParameteri:function(a, b, c) {
  Z.texParameteri(a, b, c);
}, glTexStorage2D:function(a, b, c, d, e) {
  Z.texStorage2D(a, b, c, d, e);
}, glTexSubImage2D:function(a, b, c, d, e, f, g, l, p) {
  if (Z.Ma) {
    Z.texSubImage2D(a, b, c, d, e, f, g, l, p);
  } else if (p) {
    var m = l - 5120;
    m = 0 == m ? D : 1 == m ? F : 2 == m ? G : 4 == m ? J : 6 == m ? xa : 5 == m || 28922 == m || 28520 == m || 30779 == m || 30782 == m ? K : wa;
    Z.texSubImage2D(a, b, c, d, e, f, g, l, m, p >> 31 - Math.clz32(m.BYTES_PER_ELEMENT));
  } else {
    Z.texSubImage2D(a, b, c, d, e, f, g, l, null);
  }
}, glUniform1i:function(a, b) {
  var c = Z, d = c.uniform1i;
  var e = Z.Hb;
  if (e) {
    var f = e.oa[a];
    "number" == typeof f && (e.oa[a] = f = Z.getUniformLocation(e, e.ub[a] + (0 < f ? "[" + f + "]" : "")));
    a = f;
  } else {
    Y(1282), a = void 0;
  }
  d.call(c, a, b);
}, glUniformBlockBinding:function(a, b, c) {
  a = wd[a];
  Z.uniformBlockBinding(a, b, c);
}, glUseProgram:function(a) {
  a = wd[a];
  Z.useProgram(a);
  Z.Hb = a;
}, glVertexAttribDivisor:function(a, b) {
  Z.vertexAttribDivisor(a, b);
}, glVertexAttribIPointer:function(a, b, c, d, e) {
  Z.vertexAttribIPointer(a, b, c, d, e);
}, glVertexAttribPointer:function(a, b, c, d, e, f) {
  Z.vertexAttribPointer(a, b, c, !!d, e, f);
}, glViewport:function(a, b, c, d) {
  Z.viewport(a, b, c, d);
}, provokingVertexWEBGL:function(a, b) {
  (a = w[a].C.nb) && a.provokingVertexWEBGL(b);
}, strftime_l:(a, b, c, d) => Td(a, b, c, d), upload_image:function(a, b) {
  var c = k.images;
  c && (b = c.get(b)) && (a = w[a].C, a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0), a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, b), a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1));
}};
(function() {
  function a(c) {
    C = c = c.exports;
    ua = C.memory;
    za();
    Aa = C.__indirect_function_table;
    Ca.unshift(C.__wasm_call_ctors);
    Fa--;
    k.monitorRunDependencies && k.monitorRunDependencies(Fa);
    if (0 == Fa && (null !== Ga && (clearInterval(Ga), Ga = null), Ha)) {
      var d = Ha;
      Ha = null;
      d();
    }
    return c;
  }
  var b = {env:Yd, wasi_snapshot_preview1:Yd,};
  Fa++;
  k.monitorRunDependencies && k.monitorRunDependencies(Fa);
  if (k.instantiateWasm) {
    try {
      return k.instantiateWasm(b, a);
    } catch (c) {
      ra("Module.instantiateWasm callback failed with error: " + c), ca(c);
    }
  }
  Oa(b, function(c) {
    a(c.instance);
  }).catch(ca);
  return {};
})();
var nc = a => (nc = C.free)(a), Nd = a => (Nd = C.malloc)(a);
k._setWebImage = (a, b, c) => (k._setWebImage = C.setWebImage)(a, b, c);
var Ra = k._ma_device__on_notification_unlocked = a => (Ra = k._ma_device__on_notification_unlocked = C.ma_device__on_notification_unlocked)(a);
k._ma_malloc_emscripten = (a, b) => (k._ma_malloc_emscripten = C.ma_malloc_emscripten)(a, b);
k._ma_free_emscripten = (a, b) => (k._ma_free_emscripten = C.ma_free_emscripten)(a, b);
var Sa = k._ma_device_process_pcm_frames_capture__webaudio = (a, b, c) => (Sa = k._ma_device_process_pcm_frames_capture__webaudio = C.ma_device_process_pcm_frames_capture__webaudio)(a, b, c), Ta = k._ma_device_process_pcm_frames_playback__webaudio = (a, b, c) => (Ta = k._ma_device_process_pcm_frames_playback__webaudio = C.ma_device_process_pcm_frames_playback__webaudio)(a, b, c), Xd = () => (Xd = C.__errno_location)(), mc = a => (mc = C.__getTypeName)(a);
k.__embind_initialize_bindings = () => (k.__embind_initialize_bindings = C._embind_initialize_bindings)();
k.dynCall_iiji = (a, b, c, d, e) => (k.dynCall_iiji = C.dynCall_iiji)(a, b, c, d, e);
k.dynCall_iiiji = (a, b, c, d, e, f) => (k.dynCall_iiiji = C.dynCall_iiiji)(a, b, c, d, e, f);
k.dynCall_iij = (a, b, c, d) => (k.dynCall_iij = C.dynCall_iij)(a, b, c, d);
k.dynCall_jii = (a, b, c) => (k.dynCall_jii = C.dynCall_jii)(a, b, c);
k.dynCall_vijj = (a, b, c, d, e, f) => (k.dynCall_vijj = C.dynCall_vijj)(a, b, c, d, e, f);
k.dynCall_jiji = (a, b, c, d, e) => (k.dynCall_jiji = C.dynCall_jiji)(a, b, c, d, e);
k.dynCall_viijii = (a, b, c, d, e, f, g) => (k.dynCall_viijii = C.dynCall_viijii)(a, b, c, d, e, f, g);
k.dynCall_iiiiij = (a, b, c, d, e, f, g) => (k.dynCall_iiiiij = C.dynCall_iiiiij)(a, b, c, d, e, f, g);
k.dynCall_iiiiijj = (a, b, c, d, e, f, g, l, p) => (k.dynCall_iiiiijj = C.dynCall_iiiiijj)(a, b, c, d, e, f, g, l, p);
k.dynCall_iiiiiijj = (a, b, c, d, e, f, g, l, p, m) => (k.dynCall_iiiiiijj = C.dynCall_iiiiiijj)(a, b, c, d, e, f, g, l, p, m);
k.___start_em_js = 513740;
k.___stop_em_js = 516495;
var Zd;
Ha = function $d() {
  Zd || ae();
  Zd || (Ha = $d);
};
function ae() {
  function a() {
    if (!Zd && (Zd = !0, k.calledRun = !0, !va)) {
      k.noFSInit || Tb || (Tb = !0, Sb(), k.stdin = k.stdin, k.stdout = k.stdout, k.stderr = k.stderr, k.stdin ? Vb("stdin", k.stdin) : Ob("/dev/tty", "/dev/stdin"), k.stdout ? Vb("stdout", null, k.stdout) : Ob("/dev/tty", "/dev/stdout"), k.stderr ? Vb("stderr", null, k.stderr) : Ob("/dev/tty1", "/dev/stderr"), Qb("/dev/stdin", 0), Qb("/dev/stdout", 1), Qb("/dev/stderr", 1));
      zb = !1;
      Va(Ca);
      aa(k);
      if (k.onRuntimeInitialized) {
        k.onRuntimeInitialized();
      }
      if (k.postRun) {
        for ("function" == typeof k.postRun && (k.postRun = [k.postRun]); k.postRun.length;) {
          var b = k.postRun.shift();
          Da.unshift(b);
        }
      }
      Va(Da);
    }
  }
  if (!(0 < Fa)) {
    if (k.preRun) {
      for ("function" == typeof k.preRun && (k.preRun = [k.preRun]); k.preRun.length;) {
        Ea();
      }
    }
    Va(Ba);
    0 < Fa || (k.setStatus ? (k.setStatus("Running..."), setTimeout(function() {
      setTimeout(function() {
        k.setStatus("");
      }, 1);
      a();
    }, 1)) : a());
  }
}
if (k.preInit) {
  for ("function" == typeof k.preInit && (k.preInit = [k.preInit]); 0 < k.preInit.length;) {
    k.preInit.pop()();
  }
}
ae();



  return moduleArg.ready
}

);
})();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Rive);

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"name":"@rive-app/webgl2","version":"2.27.2","description":"Rive\'s webgl2 based web api.","main":"rive.js","homepage":"https://rive.app","repository":{"type":"git","url":"https://github.com/rive-app/rive-wasm/tree/master/js"},"keywords":["rive","animation"],"author":"Rive","contributors":["Luigi Rosso <luigi@rive.app> (https://rive.app)","Maxwell Talbot <max@rive.app> (https://rive.app)","Arthur Vivian <arthur@rive.app> (https://rive.app)","Umberto Sonnino <umberto@rive.app> (https://rive.app)","Matthew Sullivan <matt.j.sullivan@gmail.com> (mailto:matt.j.sullivan@gmail.com)","Chris Dalton <chris@rive.app> (https://rive.app)"],"license":"MIT","files":["rive.js","rive.wasm","rive.js.map","rive.d.ts","rive_advanced.mjs.d.ts"],"typings":"rive.d.ts","dependencies":{},"browser":{"fs":false,"path":false}}');

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* reexport safe */ _Animation__WEBPACK_IMPORTED_MODULE_0__.Animation)
/* harmony export */ });
/* harmony import */ var _Animation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);



/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* binding */ Animation)
/* harmony export */ });
/**
 * Represents an animation that can be played on an Artboard.
 * Wraps animations and instances from the runtime and keeps track of playback state.
 *
 * The `Animation` class manages the state and behavior of a single animation instance,
 * including its current time, loop count, and ability to scrub to a specific time.
 *
 * The class provides methods to advance the animation, apply its interpolated keyframe
 * values to the Artboard, and clean up the underlying animation instance when the
 * animation is no longer needed.
 */
var Animation = /** @class */ (function () {
    /**
     * Constructs a new animation
     * @constructor
     * @param {any} animation: runtime animation object
     * @param {any} instance: runtime animation instance object
     */
    function Animation(animation, artboard, runtime, playing) {
        this.animation = animation;
        this.artboard = artboard;
        this.playing = playing;
        this.loopCount = 0;
        /**
         * The time to which the animation should move to on the next render.
         * If not null, the animation will scrub to this time instead of advancing by the given time.
         */
        this.scrubTo = null;
        this.instance = new runtime.LinearAnimationInstance(animation, artboard);
    }
    Object.defineProperty(Animation.prototype, "name", {
        /**
         * Returns the animation's name
         */
        get: function () {
            return this.animation.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "time", {
        /**
         * Returns the animation's name
         */
        get: function () {
            return this.instance.time;
        },
        /**
         * Sets the animation's current time
         */
        set: function (value) {
            this.instance.time = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "loopValue", {
        /**
         * Returns the animation's loop type
         */
        get: function () {
            return this.animation.loopValue;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animation.prototype, "needsScrub", {
        /**
         * Indicates whether the animation needs to be scrubbed.
         * @returns `true` if the animation needs to be scrubbed, `false` otherwise.
         */
        get: function () {
            return this.scrubTo !== null;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Advances the animation by the give time. If the animation needs scrubbing,
     * time is ignored and the stored scrub value is used.
     * @param time the time to advance the animation by if no scrubbing required
     */
    Animation.prototype.advance = function (time) {
        if (this.scrubTo === null) {
            this.instance.advance(time);
        }
        else {
            this.instance.time = 0;
            this.instance.advance(this.scrubTo);
            this.scrubTo = null;
        }
    };
    /**
     * Apply interpolated keyframe values to the artboard. This should be called after calling
     * .advance() on an animation instance so that new values are applied to properties.
     *
     * Note: This does not advance the artboard, which updates all objects on the artboard
     * @param mix - Mix value for the animation from 0 to 1
     */
    Animation.prototype.apply = function (mix) {
        this.instance.apply(mix);
    };
    /**
     * Deletes the backing Wasm animation instance; once this is called, this
     * animation is no more.
     */
    Animation.prototype.cleanup = function () {
        this.instance.delete();
    };
    return Animation;
}());



/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BLANK_URL: () => (/* reexport safe */ _sanitizeUrl__WEBPACK_IMPORTED_MODULE_1__.BLANK_URL),
/* harmony export */   registerTouchInteractions: () => (/* reexport safe */ _registerTouchInteractions__WEBPACK_IMPORTED_MODULE_0__.registerTouchInteractions),
/* harmony export */   sanitizeUrl: () => (/* reexport safe */ _sanitizeUrl__WEBPACK_IMPORTED_MODULE_1__.sanitizeUrl)
/* harmony export */ });
/* harmony import */ var _registerTouchInteractions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var _sanitizeUrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);




/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   registerTouchInteractions: () => (/* binding */ registerTouchInteractions)
/* harmony export */ });
var _this = undefined;
/**
 * Returns the clientX and clientY properties from touch or mouse events. Also
 * calls preventDefault() on the event if it is a touchstart or touchmove to prevent
 * scrolling the page on mobile devices
 * @param event - Either a TouchEvent or a MouseEvent
 * @returns - Coordinates of the clientX and clientY properties from the touch/mouse event
 */
var getClientCoordinates = function (event, isTouchScrollEnabled) {
    var _a, _b;
    if (["touchstart", "touchmove"].indexOf(event.type) > -1 &&
        ((_a = event.touches) === null || _a === void 0 ? void 0 : _a.length)) {
        // This flag, if false, prevents touch events on the canvas default behavior
        // which may prevent scrolling if a drag motion on the canvas is performed
        if (!isTouchScrollEnabled) {
            event.preventDefault();
        }
        return {
            clientX: event.touches[0].clientX,
            clientY: event.touches[0].clientY,
        };
    }
    else if (event.type === "touchend" &&
        ((_b = event.changedTouches) === null || _b === void 0 ? void 0 : _b.length)) {
        return {
            clientX: event.changedTouches[0].clientX,
            clientY: event.changedTouches[0].clientY,
        };
    }
    else {
        return {
            clientX: event.clientX,
            clientY: event.clientY,
        };
    }
};
/**
 * Registers mouse move/up/down callback handlers on the canvas to send meaningful coordinates to
 * the state machine pointer move/up/down functions based on cursor interaction
 */
var registerTouchInteractions = function (_a) {
    var canvas = _a.canvas, artboard = _a.artboard, _b = _a.stateMachines, stateMachines = _b === void 0 ? [] : _b, renderer = _a.renderer, rive = _a.rive, fit = _a.fit, alignment = _a.alignment, _c = _a.isTouchScrollEnabled, isTouchScrollEnabled = _c === void 0 ? false : _c, _d = _a.layoutScaleFactor, layoutScaleFactor = _d === void 0 ? 1.0 : _d;
    if (!canvas ||
        !stateMachines.length ||
        !renderer ||
        !rive ||
        !artboard ||
        typeof window === "undefined") {
        return null;
    }
    /**
     * After a touchend event, some browsers may fire synthetic mouse events
     * (mouseover, mousedown, mousemove, mouseup) if the touch interaction did not cause
     * any default action (such as scrolling).
     *
     * This is done to simulate the behavior of a mouse for applications that do not support
     * touch events.
     *
     * We're keeping track of the previous event to not send the synthetic mouse events if the
     * touch event was a click (touchstart -> touchend).
     *
     * This is only needed when `isTouchScrollEnabled` is false
     * When true, `preventDefault()` is called which prevents this behaviour.
     **/
    var _prevEventType = null;
    var _syntheticEventsActive = false;
    var processEventCallback = function (event) {
        // Exit early out of all synthetic mouse events
        // https://stackoverflow.com/questions/9656990/how-to-prevent-simulated-mouse-events-in-mobile-browsers
        // https://stackoverflow.com/questions/25572070/javascript-touchend-versus-click-dilemma
        if (_syntheticEventsActive && event instanceof MouseEvent) {
            // Synthetic event finished
            if (event.type == "mouseup") {
                _syntheticEventsActive = false;
            }
            return;
        }
        // Test if it's a "touch click". This could cause the browser to send
        // synthetic mouse events.
        _syntheticEventsActive =
            isTouchScrollEnabled &&
                event.type === "touchend" &&
                _prevEventType === "touchstart";
        _prevEventType = event.type;
        var boundingRect = event.currentTarget.getBoundingClientRect();
        var _a = getClientCoordinates(event, isTouchScrollEnabled), clientX = _a.clientX, clientY = _a.clientY;
        if (!clientX && !clientY) {
            return;
        }
        var canvasX = clientX - boundingRect.left;
        var canvasY = clientY - boundingRect.top;
        var forwardMatrix = rive.computeAlignment(fit, alignment, {
            minX: 0,
            minY: 0,
            maxX: boundingRect.width,
            maxY: boundingRect.height,
        }, artboard.bounds, layoutScaleFactor);
        var invertedMatrix = new rive.Mat2D();
        forwardMatrix.invert(invertedMatrix);
        var canvasCoordinatesVector = new rive.Vec2D(canvasX, canvasY);
        var transformedVector = rive.mapXY(invertedMatrix, canvasCoordinatesVector);
        var transformedX = transformedVector.x();
        var transformedY = transformedVector.y();
        transformedVector.delete();
        invertedMatrix.delete();
        canvasCoordinatesVector.delete();
        forwardMatrix.delete();
        switch (event.type) {
            /**
             * There's a 2px buffer for a hitRadius when translating the pointer coordinates
             * down to the state machine. In cases where the hitbox is about that much away
             * from the Artboard border, we don't have exact precision on determining pointer
             * exit. We're therefore adding to the translated coordinates on mouseout of a canvas
             * to ensure that we report the mouse has truly exited the hitarea.
             * https://github.com/rive-app/rive-cpp/blob/master/src/animation/state_machine_instance.cpp#L336
             *
             * We add/subtract 10000 to account for when the graphic goes beyond the canvas bound
             * due to for example, a fit: 'cover'. Not perfect, but helps reliably (for now) ensure
             * we report going out of bounds when the mouse is out of the canvas
             */
            case "mouseout":
                for (var _i = 0, stateMachines_1 = stateMachines; _i < stateMachines_1.length; _i++) {
                    var stateMachine = stateMachines_1[_i];
                    stateMachine.pointerMove(transformedX, transformedY);
                }
                break;
            // Pointer moving/hovering on the canvas
            case "touchmove":
            case "mouseover":
            case "mousemove": {
                for (var _b = 0, stateMachines_2 = stateMachines; _b < stateMachines_2.length; _b++) {
                    var stateMachine = stateMachines_2[_b];
                    stateMachine.pointerMove(transformedX, transformedY);
                }
                break;
            }
            // Pointer click initiated but not released yet on the canvas
            case "touchstart":
            case "mousedown": {
                for (var _c = 0, stateMachines_3 = stateMachines; _c < stateMachines_3.length; _c++) {
                    var stateMachine = stateMachines_3[_c];
                    stateMachine.pointerDown(transformedX, transformedY);
                }
                break;
            }
            // Pointer click released on the canvas
            case "touchend":
            case "mouseup": {
                for (var _d = 0, stateMachines_4 = stateMachines; _d < stateMachines_4.length; _d++) {
                    var stateMachine = stateMachines_4[_d];
                    stateMachine.pointerUp(transformedX, transformedY);
                }
                break;
            }
            default:
        }
    };
    var callback = processEventCallback.bind(_this);
    canvas.addEventListener("mouseover", callback);
    canvas.addEventListener("mouseout", callback);
    canvas.addEventListener("mousemove", callback);
    canvas.addEventListener("mousedown", callback);
    canvas.addEventListener("mouseup", callback);
    canvas.addEventListener("touchmove", callback, {
        passive: isTouchScrollEnabled,
    });
    canvas.addEventListener("touchstart", callback, {
        passive: isTouchScrollEnabled,
    });
    canvas.addEventListener("touchend", callback);
    return function () {
        canvas.removeEventListener("mouseover", callback);
        canvas.removeEventListener("mouseout", callback);
        canvas.removeEventListener("mousemove", callback);
        canvas.removeEventListener("mousedown", callback);
        canvas.removeEventListener("mouseup", callback);
        canvas.removeEventListener("touchmove", callback);
        canvas.removeEventListener("touchstart", callback);
        canvas.removeEventListener("touchend", callback);
    };
};


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BLANK_URL: () => (/* binding */ BLANK_URL),
/* harmony export */   sanitizeUrl: () => (/* binding */ sanitizeUrl)
/* harmony export */ });
// Reference: https://github.com/braintree/sanitize-url/tree/main
var invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im;
var htmlEntitiesRegex = /&#(\w+)(^\w|;)?/g;
var htmlCtrlEntityRegex = /&(newline|tab);/gi;
var ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
var urlSchemeRegex = /^.+(:|&colon;)/gim;
var relativeFirstCharacters = [".", "/"];
var BLANK_URL = "about:blank";
function isRelativeUrlWithoutProtocol(url) {
    return relativeFirstCharacters.indexOf(url[0]) > -1;
}
// adapted from https://stackoverflow.com/a/29824550/2601552
function decodeHtmlCharacters(str) {
    var removedNullByte = str.replace(ctrlCharactersRegex, "");
    return removedNullByte.replace(htmlEntitiesRegex, function (match, dec) {
        return String.fromCharCode(dec);
    });
}
function sanitizeUrl(url) {
    if (!url) {
        return BLANK_URL;
    }
    var sanitizedUrl = decodeHtmlCharacters(url)
        .replace(htmlCtrlEntityRegex, "")
        .replace(ctrlCharactersRegex, "")
        .trim();
    if (!sanitizedUrl) {
        return BLANK_URL;
    }
    if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
        return sanitizedUrl;
    }
    var urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex);
    if (!urlSchemeParseResults) {
        return sanitizedUrl;
    }
    var urlScheme = urlSchemeParseResults[0];
    if (invalidProtocolRegex.test(urlScheme)) {
        return BLANK_URL;
    }
    return sanitizedUrl;
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Alignment: () => (/* binding */ Alignment),
/* harmony export */   DataEnum: () => (/* binding */ DataEnum),
/* harmony export */   EventType: () => (/* binding */ EventType),
/* harmony export */   Fit: () => (/* binding */ Fit),
/* harmony export */   Layout: () => (/* binding */ Layout),
/* harmony export */   LoopType: () => (/* binding */ LoopType),
/* harmony export */   Rive: () => (/* binding */ Rive),
/* harmony export */   RiveEventType: () => (/* binding */ RiveEventType),
/* harmony export */   RiveFile: () => (/* binding */ RiveFile),
/* harmony export */   RuntimeLoader: () => (/* binding */ RuntimeLoader),
/* harmony export */   StateMachineInput: () => (/* binding */ StateMachineInput),
/* harmony export */   StateMachineInputType: () => (/* binding */ StateMachineInputType),
/* harmony export */   Testing: () => (/* binding */ Testing),
/* harmony export */   ViewModel: () => (/* binding */ ViewModel),
/* harmony export */   ViewModelInstance: () => (/* binding */ ViewModelInstance),
/* harmony export */   ViewModelInstanceBoolean: () => (/* binding */ ViewModelInstanceBoolean),
/* harmony export */   ViewModelInstanceColor: () => (/* binding */ ViewModelInstanceColor),
/* harmony export */   ViewModelInstanceEnum: () => (/* binding */ ViewModelInstanceEnum),
/* harmony export */   ViewModelInstanceList: () => (/* binding */ ViewModelInstanceList),
/* harmony export */   ViewModelInstanceNumber: () => (/* binding */ ViewModelInstanceNumber),
/* harmony export */   ViewModelInstanceString: () => (/* binding */ ViewModelInstanceString),
/* harmony export */   ViewModelInstanceTrigger: () => (/* binding */ ViewModelInstanceTrigger),
/* harmony export */   ViewModelInstanceValue: () => (/* binding */ ViewModelInstanceValue),
/* harmony export */   decodeAudio: () => (/* binding */ decodeAudio),
/* harmony export */   decodeFont: () => (/* binding */ decodeFont),
/* harmony export */   decodeImage: () => (/* binding */ decodeImage)
/* harmony export */ });
/* harmony import */ var _rive_advanced_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var package_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _animation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};




var RiveError = /** @class */ (function (_super) {
    __extends(RiveError, _super);
    function RiveError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isHandledError = true;
        return _this;
    }
    return RiveError;
}(Error));
// #regions helpers
var resolveErrorMessage = function (error) {
    return error && error.isHandledError
        ? error.message
        : "Problem loading file; may be corrupt!";
};
// #region layout
// Fit options for the canvas
var Fit;
(function (Fit) {
    Fit["Cover"] = "cover";
    Fit["Contain"] = "contain";
    Fit["Fill"] = "fill";
    Fit["FitWidth"] = "fitWidth";
    Fit["FitHeight"] = "fitHeight";
    Fit["None"] = "none";
    Fit["ScaleDown"] = "scaleDown";
    Fit["Layout"] = "layout";
})(Fit || (Fit = {}));
// Alignment options for the canvas
var Alignment;
(function (Alignment) {
    Alignment["Center"] = "center";
    Alignment["TopLeft"] = "topLeft";
    Alignment["TopCenter"] = "topCenter";
    Alignment["TopRight"] = "topRight";
    Alignment["CenterLeft"] = "centerLeft";
    Alignment["CenterRight"] = "centerRight";
    Alignment["BottomLeft"] = "bottomLeft";
    Alignment["BottomCenter"] = "bottomCenter";
    Alignment["BottomRight"] = "bottomRight";
})(Alignment || (Alignment = {}));
// Alignment options for Rive animations in a HTML canvas
var Layout = /** @class */ (function () {
    function Layout(params) {
        var _a, _b, _c, _d, _e, _f, _g;
        this.fit = (_a = params === null || params === void 0 ? void 0 : params.fit) !== null && _a !== void 0 ? _a : Fit.Contain;
        this.alignment = (_b = params === null || params === void 0 ? void 0 : params.alignment) !== null && _b !== void 0 ? _b : Alignment.Center;
        this.layoutScaleFactor = (_c = params === null || params === void 0 ? void 0 : params.layoutScaleFactor) !== null && _c !== void 0 ? _c : 1;
        this.minX = (_d = params === null || params === void 0 ? void 0 : params.minX) !== null && _d !== void 0 ? _d : 0;
        this.minY = (_e = params === null || params === void 0 ? void 0 : params.minY) !== null && _e !== void 0 ? _e : 0;
        this.maxX = (_f = params === null || params === void 0 ? void 0 : params.maxX) !== null && _f !== void 0 ? _f : 0;
        this.maxY = (_g = params === null || params === void 0 ? void 0 : params.maxY) !== null && _g !== void 0 ? _g : 0;
    }
    // Alternative constructor to build a Layout from an interface/object
    Layout.new = function (_a) {
        var fit = _a.fit, alignment = _a.alignment, minX = _a.minX, minY = _a.minY, maxX = _a.maxX, maxY = _a.maxY;
        console.warn("This function is deprecated: please use `new Layout({})` instead");
        return new Layout({ fit: fit, alignment: alignment, minX: minX, minY: minY, maxX: maxX, maxY: maxY });
    };
    /**
     * Makes a copy of the layout, replacing any specified parameters
     */
    Layout.prototype.copyWith = function (_a) {
        var fit = _a.fit, alignment = _a.alignment, layoutScaleFactor = _a.layoutScaleFactor, minX = _a.minX, minY = _a.minY, maxX = _a.maxX, maxY = _a.maxY;
        return new Layout({
            fit: fit !== null && fit !== void 0 ? fit : this.fit,
            alignment: alignment !== null && alignment !== void 0 ? alignment : this.alignment,
            layoutScaleFactor: layoutScaleFactor !== null && layoutScaleFactor !== void 0 ? layoutScaleFactor : this.layoutScaleFactor,
            minX: minX !== null && minX !== void 0 ? minX : this.minX,
            minY: minY !== null && minY !== void 0 ? minY : this.minY,
            maxX: maxX !== null && maxX !== void 0 ? maxX : this.maxX,
            maxY: maxY !== null && maxY !== void 0 ? maxY : this.maxY,
        });
    };
    // Returns fit for the Wasm runtime format
    Layout.prototype.runtimeFit = function (rive) {
        if (this.cachedRuntimeFit)
            return this.cachedRuntimeFit;
        var fit;
        if (this.fit === Fit.Cover)
            fit = rive.Fit.cover;
        else if (this.fit === Fit.Contain)
            fit = rive.Fit.contain;
        else if (this.fit === Fit.Fill)
            fit = rive.Fit.fill;
        else if (this.fit === Fit.FitWidth)
            fit = rive.Fit.fitWidth;
        else if (this.fit === Fit.FitHeight)
            fit = rive.Fit.fitHeight;
        else if (this.fit === Fit.ScaleDown)
            fit = rive.Fit.scaleDown;
        else if (this.fit === Fit.Layout)
            fit = rive.Fit.layout;
        else
            fit = rive.Fit.none;
        this.cachedRuntimeFit = fit;
        return fit;
    };
    // Returns alignment for the Wasm runtime format
    Layout.prototype.runtimeAlignment = function (rive) {
        if (this.cachedRuntimeAlignment)
            return this.cachedRuntimeAlignment;
        var alignment;
        if (this.alignment === Alignment.TopLeft)
            alignment = rive.Alignment.topLeft;
        else if (this.alignment === Alignment.TopCenter)
            alignment = rive.Alignment.topCenter;
        else if (this.alignment === Alignment.TopRight)
            alignment = rive.Alignment.topRight;
        else if (this.alignment === Alignment.CenterLeft)
            alignment = rive.Alignment.centerLeft;
        else if (this.alignment === Alignment.CenterRight)
            alignment = rive.Alignment.centerRight;
        else if (this.alignment === Alignment.BottomLeft)
            alignment = rive.Alignment.bottomLeft;
        else if (this.alignment === Alignment.BottomCenter)
            alignment = rive.Alignment.bottomCenter;
        else if (this.alignment === Alignment.BottomRight)
            alignment = rive.Alignment.bottomRight;
        else
            alignment = rive.Alignment.center;
        this.cachedRuntimeAlignment = alignment;
        return alignment;
    };
    return Layout;
}());

// Runtime singleton; use getInstance to provide a callback that returns the
// Rive runtime
var RuntimeLoader = /** @class */ (function () {
    // Class is never instantiated
    function RuntimeLoader() {
    }
    // Loads the runtime
    RuntimeLoader.loadRuntime = function () {
        _rive_advanced_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]({
            // Loads Wasm bundle
            locateFile: function () { return RuntimeLoader.wasmURL; },
        })
            .then(function (rive) {
            var _a;
            RuntimeLoader.runtime = rive;
            // Fire all the callbacks
            while (RuntimeLoader.callBackQueue.length > 0) {
                (_a = RuntimeLoader.callBackQueue.shift()) === null || _a === void 0 ? void 0 : _a(RuntimeLoader.runtime);
            }
        })
            .catch(function (error) {
            // Capture specific error details
            var errorDetails = {
                message: (error === null || error === void 0 ? void 0 : error.message) || "Unknown error",
                type: (error === null || error === void 0 ? void 0 : error.name) || "Error",
                // Some browsers may provide additional WebAssembly-specific details
                wasmError: error instanceof WebAssembly.CompileError ||
                    error instanceof WebAssembly.RuntimeError,
                originalError: error,
            };
            // Log detailed error for debugging
            console.debug("Rive WASM load error details:", errorDetails);
            // In case unpkg fails, or the wasm was not supported, we try to load the fallback module from jsdelivr.
            // This `rive_fallback.wasm` is compiled to support older architecture.
            // TODO: (Gordon): preemptively test browser support and load the correct wasm file. Then use jsdelvr only if unpkg fails.
            var backupJsdelivrUrl = "https://cdn.jsdelivr.net/npm/".concat(package_json__WEBPACK_IMPORTED_MODULE_1__.name, "@").concat(package_json__WEBPACK_IMPORTED_MODULE_1__.version, "/rive_fallback.wasm");
            if (RuntimeLoader.wasmURL.toLowerCase() !== backupJsdelivrUrl) {
                console.warn("Failed to load WASM from ".concat(RuntimeLoader.wasmURL, " (").concat(errorDetails.message, "), trying jsdelivr as a backup"));
                RuntimeLoader.setWasmUrl(backupJsdelivrUrl);
                RuntimeLoader.loadRuntime();
            }
            else {
                var errorMessage = [
                    "Could not load Rive WASM file from ".concat(RuntimeLoader.wasmURL, " or ").concat(backupJsdelivrUrl, "."),
                    "Possible reasons:",
                    "- Network connection is down",
                    "- WebAssembly is not supported in this environment",
                    "- The WASM file is corrupted or incompatible",
                    "\nError details:",
                    "- Type: ".concat(errorDetails.type),
                    "- Message: ".concat(errorDetails.message),
                    "- WebAssembly-specific error: ".concat(errorDetails.wasmError),
                    "\nTo resolve, you may need to:",
                    "1. Check your network connection",
                    "2. Set a new WASM source via RuntimeLoader.setWasmUrl()",
                    "3. Call RuntimeLoader.loadRuntime() again",
                ].join("\n");
                console.error(errorMessage);
            }
        });
    };
    // Provides a runtime instance via a callback
    RuntimeLoader.getInstance = function (callback) {
        // If it's not loading, start loading runtime
        if (!RuntimeLoader.isLoading) {
            RuntimeLoader.isLoading = true;
            RuntimeLoader.loadRuntime();
        }
        if (!RuntimeLoader.runtime) {
            RuntimeLoader.callBackQueue.push(callback);
        }
        else {
            callback(RuntimeLoader.runtime);
        }
    };
    // Provides a runtime instance via a promise
    RuntimeLoader.awaitInstance = function () {
        return new Promise(function (resolve) {
            return RuntimeLoader.getInstance(function (rive) { return resolve(rive); });
        });
    };
    // Manually sets the wasm url
    RuntimeLoader.setWasmUrl = function (url) {
        RuntimeLoader.wasmURL = url;
    };
    // Gets the current wasm url
    RuntimeLoader.getWasmUrl = function () {
        return RuntimeLoader.wasmURL;
    };
    // Flag to indicate that loading has started/completed
    RuntimeLoader.isLoading = false;
    // List of callbacks for the runtime that come in while loading
    RuntimeLoader.callBackQueue = [];
    // Path to the Wasm file; default path works for testing only;
    // if embedded wasm is used then this is never used.
    RuntimeLoader.wasmURL = "https://unpkg.com/".concat(package_json__WEBPACK_IMPORTED_MODULE_1__.name, "@").concat(package_json__WEBPACK_IMPORTED_MODULE_1__.version, "/rive.wasm");
    return RuntimeLoader;
}());

// #endregion
// #region state machines
var StateMachineInputType;
(function (StateMachineInputType) {
    StateMachineInputType[StateMachineInputType["Number"] = 56] = "Number";
    StateMachineInputType[StateMachineInputType["Trigger"] = 58] = "Trigger";
    StateMachineInputType[StateMachineInputType["Boolean"] = 59] = "Boolean";
})(StateMachineInputType || (StateMachineInputType = {}));
/**
 * An input for a state machine
 */
var StateMachineInput = /** @class */ (function () {
    function StateMachineInput(type, runtimeInput) {
        this.type = type;
        this.runtimeInput = runtimeInput;
    }
    Object.defineProperty(StateMachineInput.prototype, "name", {
        /**
         * Returns the name of the input
         */
        get: function () {
            return this.runtimeInput.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachineInput.prototype, "value", {
        /**
         * Returns the current value of the input
         */
        get: function () {
            return this.runtimeInput.value;
        },
        /**
         * Sets the value of the input
         */
        set: function (value) {
            this.runtimeInput.value = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Fires a trigger; does nothing on Number or Boolean input types
     */
    StateMachineInput.prototype.fire = function () {
        if (this.type === StateMachineInputType.Trigger) {
            this.runtimeInput.fire();
        }
    };
    /**
     * Deletes the input
     */
    StateMachineInput.prototype.delete = function () {
        this.runtimeInput = null;
    };
    return StateMachineInput;
}());

var RiveEventType;
(function (RiveEventType) {
    RiveEventType[RiveEventType["General"] = 128] = "General";
    RiveEventType[RiveEventType["OpenUrl"] = 131] = "OpenUrl";
})(RiveEventType || (RiveEventType = {}));
var StateMachine = /** @class */ (function () {
    /**
     * @constructor
     * @param stateMachine runtime state machine object
     * @param instance runtime state machine instance object
     */
    function StateMachine(stateMachine, runtime, playing, artboard) {
        this.stateMachine = stateMachine;
        this.playing = playing;
        this.artboard = artboard;
        /**
         * Caches the inputs from the runtime
         */
        this.inputs = [];
        this.instance = new runtime.StateMachineInstance(stateMachine, artboard);
        this.initInputs(runtime);
    }
    Object.defineProperty(StateMachine.prototype, "name", {
        get: function () {
            return this.stateMachine.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StateMachine.prototype, "statesChanged", {
        /**
         * Returns a list of state names that have changed on this frame
         */
        get: function () {
            var names = [];
            for (var i = 0; i < this.instance.stateChangedCount(); i++) {
                names.push(this.instance.stateChangedNameByIndex(i));
            }
            return names;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Advances the state machine instance by a given time.
     * @param time - the time to advance the animation by in seconds
     */
    StateMachine.prototype.advance = function (time) {
        this.instance.advance(time);
    };
    /**
     * Advances the state machine instance by a given time and apply changes to artboard.
     * @param time - the time to advance the animation by in seconds
     */
    StateMachine.prototype.advanceAndApply = function (time) {
        this.instance.advanceAndApply(time);
    };
    /**
     * Returns the number of events reported from the last advance call
     * @returns Number of events reported
     */
    StateMachine.prototype.reportedEventCount = function () {
        return this.instance.reportedEventCount();
    };
    /**
     * Returns a RiveEvent object emitted from the last advance call at the given index
     * of a list of potentially multiple events. If an event at the index is not found,
     * undefined is returned.
     * @param i index of the event reported in a list of potentially multiple events
     * @returns RiveEvent or extended RiveEvent object returned, or undefined
     */
    StateMachine.prototype.reportedEventAt = function (i) {
        return this.instance.reportedEventAt(i);
    };
    /**
     * Fetches references to the state machine's inputs and caches them
     * @param runtime an instance of the runtime; needed for the SMIInput types
     */
    StateMachine.prototype.initInputs = function (runtime) {
        // Fetch the inputs from the runtime if we don't have them
        for (var i = 0; i < this.instance.inputCount(); i++) {
            var input = this.instance.input(i);
            this.inputs.push(this.mapRuntimeInput(input, runtime));
        }
    };
    /**
     * Maps a runtime input to it's appropriate type
     * @param input
     */
    StateMachine.prototype.mapRuntimeInput = function (input, runtime) {
        if (input.type === runtime.SMIInput.bool) {
            return new StateMachineInput(StateMachineInputType.Boolean, input.asBool());
        }
        else if (input.type === runtime.SMIInput.number) {
            return new StateMachineInput(StateMachineInputType.Number, input.asNumber());
        }
        else if (input.type === runtime.SMIInput.trigger) {
            return new StateMachineInput(StateMachineInputType.Trigger, input.asTrigger());
        }
    };
    /**
     * Deletes the backing Wasm state machine instance; once this is called, this
     * state machine is no more.
     */
    StateMachine.prototype.cleanup = function () {
        this.inputs.forEach(function (input) {
            input.delete();
        });
        this.inputs.length = 0;
        this.instance.delete();
    };
    StateMachine.prototype.bindViewModelInstance = function (viewModelInstance) {
        if (viewModelInstance.runtimeInstance != null) {
            this.instance.bindViewModelInstance(viewModelInstance.runtimeInstance);
        }
    };
    return StateMachine;
}());
// #endregion
// #region animator
/**
 * Manages animation
 */
var Animator = /** @class */ (function () {
    /**
     * Constructs a new animator
     * @constructor
     * @param runtime Rive runtime; needed to instance animations & state machines
     * @param artboard the artboard that holds all animations and state machines
     * @param animations optional list of animations
     * @param stateMachines optional list of state machines
     */
    function Animator(runtime, artboard, eventManager, animations, stateMachines) {
        if (animations === void 0) { animations = []; }
        if (stateMachines === void 0) { stateMachines = []; }
        this.runtime = runtime;
        this.artboard = artboard;
        this.eventManager = eventManager;
        this.animations = animations;
        this.stateMachines = stateMachines;
    }
    /**
     * Adds animations and state machines by their names. If names are shared
     * between animations & state machines, then the first one found will be
     * created. Best not to use the same names for these in your Rive file.
     * @param animatable the name(s) of animations and state machines to add
     * @returns a list of names of the playing animations and state machines
     */
    Animator.prototype.add = function (animatables, playing, fireEvent) {
        if (fireEvent === void 0) { fireEvent = true; }
        animatables = mapToStringArray(animatables);
        // If animatables is empty, play or pause everything
        if (animatables.length === 0) {
            this.animations.forEach(function (a) { return (a.playing = playing); });
            this.stateMachines.forEach(function (m) { return (m.playing = playing); });
        }
        else {
            // Play/pause already instanced items, or create new instances
            var instancedAnimationNames = this.animations.map(function (a) { return a.name; });
            var instancedMachineNames = this.stateMachines.map(function (m) { return m.name; });
            for (var i = 0; i < animatables.length; i++) {
                var aIndex = instancedAnimationNames.indexOf(animatables[i]);
                var mIndex = instancedMachineNames.indexOf(animatables[i]);
                if (aIndex >= 0 || mIndex >= 0) {
                    if (aIndex >= 0) {
                        // Animation is instanced, play/pause it
                        this.animations[aIndex].playing = playing;
                    }
                    else {
                        // State machine is instanced, play/pause it
                        this.stateMachines[mIndex].playing = playing;
                    }
                }
                else {
                    // Try to create a new animation instance
                    var anim = this.artboard.animationByName(animatables[i]);
                    if (anim) {
                        var newAnimation = new _animation__WEBPACK_IMPORTED_MODULE_2__.Animation(anim, this.artboard, this.runtime, playing);
                        // Display the first frame of the specified animation
                        newAnimation.advance(0);
                        newAnimation.apply(1.0);
                        this.animations.push(newAnimation);
                    }
                    else {
                        // Try to create a new state machine instance
                        var sm = this.artboard.stateMachineByName(animatables[i]);
                        if (sm) {
                            var newStateMachine = new StateMachine(sm, this.runtime, playing, this.artboard);
                            this.stateMachines.push(newStateMachine);
                        }
                    }
                }
            }
        }
        // Fire play/paused events for animations
        if (fireEvent) {
            if (playing) {
                this.eventManager.fire({
                    type: EventType.Play,
                    data: this.playing,
                });
            }
            else {
                this.eventManager.fire({
                    type: EventType.Pause,
                    data: this.paused,
                });
            }
        }
        return playing ? this.playing : this.paused;
    };
    /**
     * Adds linear animations by their names.
     * @param animatables the name(s) of animations to add
     * @param playing whether animations should play on instantiation
     */
    Animator.prototype.initLinearAnimations = function (animatables, playing) {
        // Play/pause already instanced items, or create new instances
        // This validation is kept to maintain compatibility with current behavior.
        // But given that it this is called during artboard initialization
        // it should probably be safe to remove.
        var instancedAnimationNames = this.animations.map(function (a) { return a.name; });
        for (var i = 0; i < animatables.length; i++) {
            var aIndex = instancedAnimationNames.indexOf(animatables[i]);
            if (aIndex >= 0) {
                this.animations[aIndex].playing = playing;
            }
            else {
                // Try to create a new animation instance
                var anim = this.artboard.animationByName(animatables[i]);
                if (anim) {
                    var newAnimation = new _animation__WEBPACK_IMPORTED_MODULE_2__.Animation(anim, this.artboard, this.runtime, playing);
                    // Display the first frame of the specified animation
                    newAnimation.advance(0);
                    newAnimation.apply(1.0);
                    this.animations.push(newAnimation);
                }
                else {
                    console.error("Animation with name ".concat(animatables[i], " not found."));
                }
            }
        }
    };
    /**
     * Adds state machines by their names.
     * @param animatables the name(s) of state machines to add
     * @param playing whether state machines should play on instantiation
     */
    Animator.prototype.initStateMachines = function (animatables, playing) {
        // Play/pause already instanced items, or create new instances
        // This validation is kept to maintain compatibility with current behavior.
        // But given that it this is called during artboard initialization
        // it should probably be safe to remove.
        var instancedStateMachineNames = this.stateMachines.map(function (a) { return a.name; });
        for (var i = 0; i < animatables.length; i++) {
            var aIndex = instancedStateMachineNames.indexOf(animatables[i]);
            if (aIndex >= 0) {
                this.stateMachines[aIndex].playing = playing;
            }
            else {
                // Try to create a new state machine instance
                var sm = this.artboard.stateMachineByName(animatables[i]);
                if (sm) {
                    var newStateMachine = new StateMachine(sm, this.runtime, playing, this.artboard);
                    this.stateMachines.push(newStateMachine);
                    if (!playing) {
                        newStateMachine.advanceAndApply(0);
                    }
                }
                else {
                    console.warn("State Machine with name ".concat(animatables[i], " not found."));
                    // In order to maintain compatibility with current behavior, if a state machine is not found
                    // we look for an animation with the same name
                    this.initLinearAnimations([animatables[i]], playing);
                }
            }
        }
    };
    /**
     * Play the named animations/state machines
     * @param animatables the names of the animations/machines to play; plays all if empty
     * @returns a list of the playing items
     */
    Animator.prototype.play = function (animatables) {
        return this.add(animatables, true);
    };
    /**
     * Pauses named animations and state machines, or everything if nothing is
     * specified
     * @param animatables names of the animations and state machines to pause
     * @returns a list of names of the animations and state machines paused
     */
    Animator.prototype.pause = function (animatables) {
        return this.add(animatables, false);
    };
    /**
     * Set time of named animations
     * @param animations names of the animations to scrub
     * @param value time scrub value, a floating point number to which the playhead is jumped
     * @returns a list of names of the animations that were scrubbed
     */
    Animator.prototype.scrub = function (animatables, value) {
        var forScrubbing = this.animations.filter(function (a) {
            return animatables.includes(a.name);
        });
        forScrubbing.forEach(function (a) { return (a.scrubTo = value); });
        return forScrubbing.map(function (a) { return a.name; });
    };
    Object.defineProperty(Animator.prototype, "playing", {
        /**
         * Returns a list of names of all animations and state machines currently
         * playing
         */
        get: function () {
            return this.animations
                .filter(function (a) { return a.playing; })
                .map(function (a) { return a.name; })
                .concat(this.stateMachines.filter(function (m) { return m.playing; }).map(function (m) { return m.name; }));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animator.prototype, "paused", {
        /**
         * Returns a list of names of all animations and state machines currently
         * paused
         */
        get: function () {
            return this.animations
                .filter(function (a) { return !a.playing; })
                .map(function (a) { return a.name; })
                .concat(this.stateMachines.filter(function (m) { return !m.playing; }).map(function (m) { return m.name; }));
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Stops and removes all named animations and state machines
     * @param animatables animations and state machines to remove
     * @returns a list of names of removed items
     */
    Animator.prototype.stop = function (animatables) {
        var _this = this;
        animatables = mapToStringArray(animatables);
        // If nothing's specified, wipe them out, all of them
        var removedNames = [];
        // Stop everything
        if (animatables.length === 0) {
            removedNames = this.animations
                .map(function (a) { return a.name; })
                .concat(this.stateMachines.map(function (m) { return m.name; }));
            // Clean up before emptying the arrays
            this.animations.forEach(function (a) { return a.cleanup(); });
            this.stateMachines.forEach(function (m) { return m.cleanup(); });
            // Empty out the arrays
            this.animations.splice(0, this.animations.length);
            this.stateMachines.splice(0, this.stateMachines.length);
        }
        else {
            // Remove only the named animations/state machines
            var animationsToRemove = this.animations.filter(function (a) {
                return animatables.includes(a.name);
            });
            animationsToRemove.forEach(function (a) {
                a.cleanup();
                _this.animations.splice(_this.animations.indexOf(a), 1);
            });
            var machinesToRemove = this.stateMachines.filter(function (m) {
                return animatables.includes(m.name);
            });
            machinesToRemove.forEach(function (m) {
                m.cleanup();
                _this.stateMachines.splice(_this.stateMachines.indexOf(m), 1);
            });
            removedNames = animationsToRemove
                .map(function (a) { return a.name; })
                .concat(machinesToRemove.map(function (m) { return m.name; }));
        }
        this.eventManager.fire({
            type: EventType.Stop,
            data: removedNames,
        });
        // Return the list of animations removed
        return removedNames;
    };
    Object.defineProperty(Animator.prototype, "isPlaying", {
        /**
         * Returns true if at least one animation is active
         */
        get: function () {
            return (this.animations.reduce(function (acc, curr) { return acc || curr.playing; }, false) ||
                this.stateMachines.reduce(function (acc, curr) { return acc || curr.playing; }, false));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animator.prototype, "isPaused", {
        /**
         * Returns true if all animations are paused and there's at least one animation
         */
        get: function () {
            return (!this.isPlaying &&
                (this.animations.length > 0 || this.stateMachines.length > 0));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Animator.prototype, "isStopped", {
        /**
         * Returns true if there are no playing or paused animations/state machines
         */
        get: function () {
            return this.animations.length === 0 && this.stateMachines.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * If there are no animations or state machines, add the first one found
     * @returns the name of the animation or state machine instanced
     */
    Animator.prototype.atLeastOne = function (playing, fireEvent) {
        if (fireEvent === void 0) { fireEvent = true; }
        var instancedName;
        if (this.animations.length === 0 && this.stateMachines.length === 0) {
            if (this.artboard.animationCount() > 0) {
                // Add the first animation
                this.add([(instancedName = this.artboard.animationByIndex(0).name)], playing, fireEvent);
            }
            else if (this.artboard.stateMachineCount() > 0) {
                // Add the first state machine
                this.add([(instancedName = this.artboard.stateMachineByIndex(0).name)], playing, fireEvent);
            }
        }
        return instancedName;
    };
    /**
     * Checks if any animations have looped and if so, fire the appropriate event
     */
    Animator.prototype.handleLooping = function () {
        for (var _i = 0, _a = this.animations.filter(function (a) { return a.playing; }); _i < _a.length; _i++) {
            var animation = _a[_i];
            // Emit if the animation looped
            if (animation.loopValue === 0 && animation.loopCount) {
                animation.loopCount = 0;
                // This is a one-shot; if it has ended, delete the instance
                this.stop(animation.name);
            }
            else if (animation.loopValue === 1 && animation.loopCount) {
                this.eventManager.fire({
                    type: EventType.Loop,
                    data: { animation: animation.name, type: LoopType.Loop },
                });
                animation.loopCount = 0;
            }
            // Wasm indicates a loop at each time the animation
            // changes direction, so a full loop/lap occurs every
            // two loop counts
            else if (animation.loopValue === 2 && animation.loopCount > 1) {
                this.eventManager.fire({
                    type: EventType.Loop,
                    data: { animation: animation.name, type: LoopType.PingPong },
                });
                animation.loopCount = 0;
            }
        }
    };
    /**
     * Checks if states have changed in state machines and fires a statechange
     * event
     */
    Animator.prototype.handleStateChanges = function () {
        var statesChanged = [];
        for (var _i = 0, _a = this.stateMachines.filter(function (sm) { return sm.playing; }); _i < _a.length; _i++) {
            var stateMachine = _a[_i];
            statesChanged.push.apply(statesChanged, stateMachine.statesChanged);
        }
        if (statesChanged.length > 0) {
            this.eventManager.fire({
                type: EventType.StateChange,
                data: statesChanged,
            });
        }
    };
    Animator.prototype.handleAdvancing = function (time) {
        this.eventManager.fire({
            type: EventType.Advance,
            data: time,
        });
    };
    return Animator;
}());
// #endregion
// #region events
/**
 * Supported event types triggered in Rive
 */
var EventType;
(function (EventType) {
    EventType["Load"] = "load";
    EventType["LoadError"] = "loaderror";
    EventType["Play"] = "play";
    EventType["Pause"] = "pause";
    EventType["Stop"] = "stop";
    EventType["Loop"] = "loop";
    EventType["Draw"] = "draw";
    EventType["Advance"] = "advance";
    EventType["StateChange"] = "statechange";
    EventType["RiveEvent"] = "riveevent";
    EventType["AudioStatusChange"] = "audiostatuschange";
})(EventType || (EventType = {}));
/**
 * Looping types: one-shot, loop, and ping-pong
 */
var LoopType;
(function (LoopType) {
    LoopType["OneShot"] = "oneshot";
    LoopType["Loop"] = "loop";
    LoopType["PingPong"] = "pingpong";
})(LoopType || (LoopType = {}));
// Manages Rive events and listeners
var EventManager = /** @class */ (function () {
    function EventManager(listeners) {
        if (listeners === void 0) { listeners = []; }
        this.listeners = listeners;
    }
    // Gets listeners of specified type
    EventManager.prototype.getListeners = function (type) {
        return this.listeners.filter(function (e) { return e.type === type; });
    };
    // Adds a listener
    EventManager.prototype.add = function (listener) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    };
    /**
     * Removes a listener
     * @param listener the listener with the callback to be removed
     */
    EventManager.prototype.remove = function (listener) {
        // We can't simply look for the listener as it'll be a different instance to
        // one originally subscribed. Find all the listeners of the right type and
        // then check their callbacks which should match.
        for (var i = 0; i < this.listeners.length; i++) {
            var currentListener = this.listeners[i];
            if (currentListener.type === listener.type) {
                if (currentListener.callback === listener.callback) {
                    this.listeners.splice(i, 1);
                    break;
                }
            }
        }
    };
    /**
     * Clears all listeners of specified type, or every listener if no type is
     * specified
     * @param type the type of listeners to clear, or all listeners if not
     * specified
     */
    EventManager.prototype.removeAll = function (type) {
        var _this = this;
        if (!type) {
            this.listeners.splice(0, this.listeners.length);
        }
        else {
            this.listeners
                .filter(function (l) { return l.type === type; })
                .forEach(function (l) { return _this.remove(l); });
        }
    };
    // Fires an event
    EventManager.prototype.fire = function (event) {
        var eventListeners = this.getListeners(event.type);
        eventListeners.forEach(function (listener) { return listener.callback(event); });
    };
    return EventManager;
}());
// Manages a queue of tasks
var TaskQueueManager = /** @class */ (function () {
    function TaskQueueManager(eventManager) {
        this.eventManager = eventManager;
        this.queue = [];
    }
    // Adds a task top the queue
    TaskQueueManager.prototype.add = function (task) {
        this.queue.push(task);
    };
    // Processes all tasks in the queue
    TaskQueueManager.prototype.process = function () {
        while (this.queue.length > 0) {
            var task = this.queue.shift();
            if (task === null || task === void 0 ? void 0 : task.action) {
                task.action();
            }
            if (task === null || task === void 0 ? void 0 : task.event) {
                this.eventManager.fire(task.event);
            }
        }
    };
    return TaskQueueManager;
}());
// #endregion
// #region Audio
var SystemAudioStatus;
(function (SystemAudioStatus) {
    SystemAudioStatus[SystemAudioStatus["AVAILABLE"] = 0] = "AVAILABLE";
    SystemAudioStatus[SystemAudioStatus["UNAVAILABLE"] = 1] = "UNAVAILABLE";
})(SystemAudioStatus || (SystemAudioStatus = {}));
// Class to handle audio context availability and status changes
var AudioManager = /** @class */ (function (_super) {
    __extends(AudioManager, _super);
    function AudioManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._started = false;
        _this._enabled = false;
        _this._status = SystemAudioStatus.UNAVAILABLE;
        return _this;
    }
    AudioManager.prototype.delay = function (time) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, time); })];
            });
        });
    };
    AudioManager.prototype.timeout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (_, reject) { return setTimeout(reject, 50); })];
            });
        });
    };
    // Alerts animations on status changes and removes the listeners to avoid alerting twice.
    AudioManager.prototype.reportToListeners = function () {
        this.fire({ type: EventType.AudioStatusChange });
        this.removeAll();
    };
    /**
     * The audio context has been resolved.
     * Alert any listeners that we can now play audio.
     * Rive will now play audio at the configured volume.
     */
    AudioManager.prototype.enableAudio = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this._enabled) {
                    this._enabled = true;
                    this._status = SystemAudioStatus.AVAILABLE;
                    this.reportToListeners();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Check if we are able to play audio.
     *
     * We currently check the audio context, when resume() returns before a timeout we know that the
     * audio context is running and we can enable audio.
     */
    AudioManager.prototype.testAudio = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this._status === SystemAudioStatus.UNAVAILABLE &&
                            this._audioContext !== null)) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.race([this._audioContext.resume(), this.timeout()])];
                    case 2:
                        _b.sent();
                        this.enableAudio();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Establish audio for use with rive.
     * We both test if we can use audio intermittently and listen for user interaction.
     * The aim is to enable audio playback as soon as the browser allows this.
     */
    AudioManager.prototype._establishAudio = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._started) return [3 /*break*/, 5];
                        this._started = true;
                        if (!(typeof window == "undefined")) return [3 /*break*/, 1];
                        this.enableAudio();
                        return [3 /*break*/, 5];
                    case 1:
                        this._audioContext = new AudioContext();
                        this.listenForUserAction();
                        _a.label = 2;
                    case 2:
                        if (!(this._status === SystemAudioStatus.UNAVAILABLE)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.testAudio()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.delay(1000)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AudioManager.prototype.listenForUserAction = function () {
        var _this = this;
        // NOTE: AudioContexts are ready immediately if requested in a ui callback
        // we *could* re request one in this listener.
        var _clickListener = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // note this has "better" results than calling `await this.testAudio()`
                // as we force audio to be enabled in the current thread, rather than chancing
                // the thread to be passed over for some other async context
                this.enableAudio();
                return [2 /*return*/];
            });
        }); };
        // NOTE: we should test this on mobile/pads
        document.addEventListener("pointerdown", _clickListener, {
            once: true,
        });
    };
    /**
     * Establish the audio context for rive, this lets rive know that we can play audio.
     */
    AudioManager.prototype.establishAudio = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._establishAudio();
                return [2 /*return*/];
            });
        });
    };
    Object.defineProperty(AudioManager.prototype, "systemVolume", {
        get: function () {
            if (this._status === SystemAudioStatus.UNAVAILABLE) {
                // We do an immediate test to avoid depending on the delay of the running test
                this.testAudio();
                return 0;
            }
            return 1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AudioManager.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: false,
        configurable: true
    });
    return AudioManager;
}(EventManager));
var audioManager = new AudioManager();
var FakeResizeObserver = /** @class */ (function () {
    function FakeResizeObserver() {
    }
    FakeResizeObserver.prototype.observe = function () { };
    FakeResizeObserver.prototype.unobserve = function () { };
    FakeResizeObserver.prototype.disconnect = function () { };
    return FakeResizeObserver;
}());
var MyResizeObserver = globalThis.ResizeObserver || FakeResizeObserver;
/**
 * This class takes care of any observers that will be attached to an animation.
 * It should be treated as a singleton because observers are much more performant
 * when used for observing multiple elements by a single instance.
 */
var ObjectObservers = /** @class */ (function () {
    function ObjectObservers() {
        var _this = this;
        this._elementsMap = new Map();
        /**
         * Resize observers trigger both when the element changes its size and also when the
         * element is added or removed from the document.
         */
        this._onObservedEntry = function (entry) {
            var observed = _this._elementsMap.get(entry.target);
            if (observed !== null) {
                observed.onResize(entry.target.clientWidth == 0 || entry.target.clientHeight == 0);
            }
            else {
                _this._resizeObserver.unobserve(entry.target);
            }
        };
        this._onObserved = function (entries) {
            entries.forEach(_this._onObservedEntry);
        };
        this._resizeObserver = new MyResizeObserver(this._onObserved);
    }
    // Adds an observable element
    ObjectObservers.prototype.add = function (element, onResize) {
        var observed = {
            onResize: onResize,
            element: element,
        };
        this._elementsMap.set(element, observed);
        this._resizeObserver.observe(element);
        return observed;
    };
    // Removes an observable element
    ObjectObservers.prototype.remove = function (observed) {
        this._resizeObserver.unobserve(observed.element);
        this._elementsMap.delete(observed.element);
    };
    return ObjectObservers;
}());
var observers = new ObjectObservers();
var RiveFile = /** @class */ (function () {
    function RiveFile(params) {
        // Allow the runtime to automatically load assets hosted in Rive's runtime.
        this.enableRiveAssetCDN = true;
        this.referenceCount = 0;
        this.destroyed = false;
        this.src = params.src;
        this.buffer = params.buffer;
        if (params.assetLoader)
            this.assetLoader = params.assetLoader;
        this.enableRiveAssetCDN =
            typeof params.enableRiveAssetCDN == "boolean"
                ? params.enableRiveAssetCDN
                : true;
        // New event management system
        this.eventManager = new EventManager();
        if (params.onLoad)
            this.on(EventType.Load, params.onLoad);
        if (params.onLoadError)
            this.on(EventType.LoadError, params.onLoadError);
    }
    RiveFile.prototype.initData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, loader, _b;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.src) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, loadRiveFile(this.src)];
                    case 1:
                        _a.buffer = _d.sent();
                        _d.label = 2;
                    case 2:
                        if (this.destroyed) {
                            return [2 /*return*/];
                        }
                        if (this.assetLoader) {
                            loader = new this.runtime.CustomFileAssetLoader({
                                loadContents: this.assetLoader,
                            });
                        }
                        // Load the Rive file
                        _b = this;
                        return [4 /*yield*/, this.runtime.load(new Uint8Array(this.buffer), loader, this.enableRiveAssetCDN)];
                    case 3:
                        // Load the Rive file
                        _b.file = _d.sent();
                        if (this.destroyed) {
                            (_c = this.file) === null || _c === void 0 ? void 0 : _c.delete();
                            this.file = null;
                            return [2 /*return*/];
                        }
                        if (this.file !== null) {
                            this.eventManager.fire({
                                type: EventType.Load,
                                data: this,
                            });
                        }
                        else {
                            this.eventManager.fire({
                                type: EventType.LoadError,
                                data: null,
                            });
                            throw new Error(RiveFile.fileLoadErrorMessage);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    RiveFile.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // If no source file url specified, it's a bust
                        if (!this.src && !this.buffer) {
                            throw new Error(RiveFile.missingErrorMessage);
                        }
                        _a = this;
                        return [4 /*yield*/, RuntimeLoader.awaitInstance()];
                    case 1:
                        _a.runtime = _b.sent();
                        if (this.destroyed) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.initData()];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscribe to Rive-generated events
     * @param type the type of event to subscribe to
     * @param callback callback to fire when the event occurs
     */
    RiveFile.prototype.on = function (type, callback) {
        this.eventManager.add({
            type: type,
            callback: callback,
        });
    };
    /**
     * Unsubscribes from a Rive-generated event
     * @param type the type of event to unsubscribe from
     * @param callback the callback to unsubscribe
     */
    RiveFile.prototype.off = function (type, callback) {
        this.eventManager.remove({
            type: type,
            callback: callback,
        });
    };
    RiveFile.prototype.cleanup = function () {
        var _a;
        this.referenceCount -= 1;
        if (this.referenceCount <= 0) {
            this.removeAllRiveEventListeners();
            (_a = this.file) === null || _a === void 0 ? void 0 : _a.delete();
            this.file = null;
            this.destroyed = true;
        }
    };
    /**
     * Unsubscribes all Rive listeners from an event type, or everything if no type is
     * given
     * @param type the type of event to unsubscribe from, or all types if
     * undefined
     */
    RiveFile.prototype.removeAllRiveEventListeners = function (type) {
        this.eventManager.removeAll(type);
    };
    RiveFile.prototype.getInstance = function () {
        if (this.file !== null) {
            this.referenceCount += 1;
            return this.file;
        }
    };
    // Error message for missing source or buffer
    RiveFile.missingErrorMessage = "Rive source file or data buffer required";
    // Error message for file load error
    RiveFile.fileLoadErrorMessage = "The file failed to load";
    return RiveFile;
}());

var Rive = /** @class */ (function () {
    function Rive(params) {
        var _this = this;
        var _a;
        // Tracks if a Rive file is loaded
        this.loaded = false;
        // Tracks if a Rive file is destroyed
        this.destroyed = false;
        // Reference of an object that handles any observers for the animation
        this._observed = null;
        /**
         * Tracks if a Rive file is loaded; we need this in addition to loaded as some
         * commands (e.g. contents) can be called as soon as the file is loaded.
         * However, playback commands need to be queued and run in order once initial
         * animations and autoplay has been sorted out. This applies to play, pause,
         * and start.
         */
        this.readyForPlaying = false;
        // Runtime artboard
        this.artboard = null;
        // place to clear up event listeners
        this.eventCleanup = null;
        this.shouldDisableRiveListeners = false;
        this.automaticallyHandleEvents = false;
        // Allow the runtime to automatically load assets hosted in Rive's runtime.
        this.enableRiveAssetCDN = true;
        // Keep a local value of the set volume to update it asynchronously
        this._volume = 1;
        // Keep a local value of the set width to update it asynchronously
        this._artboardWidth = undefined;
        // Keep a local value of the set height to update it asynchronously
        this._artboardHeight = undefined;
        // Keep a local value of the device pixel ratio used in rendering and canvas/artboard resizing
        this._devicePixelRatioUsed = 1;
        // Whether the canvas element's size is 0
        this._hasZeroSize = false;
        // Audio event listener
        this._audioEventListener = null;
        // draw method bound to the class
        this._boundDraw = null;
        this._viewModelInstance = null;
        this._dataEnums = null;
        // Durations to generate a frame for the last second. Used for performance profiling.
        this.durations = [];
        this.frameTimes = [];
        this.frameCount = 0;
        this.isTouchScrollEnabled = false;
        this.onCanvasResize = function (hasZeroSize) {
            var toggledDisplay = _this._hasZeroSize !== hasZeroSize;
            _this._hasZeroSize = hasZeroSize;
            if (!hasZeroSize) {
                if (toggledDisplay) {
                    _this.resizeDrawingSurfaceToCanvas();
                }
            }
            else if (!_this._layout.maxX || !_this._layout.maxY) {
                _this.resizeToCanvas();
            }
        };
        /**
         * Used be draw to track when a second of active rendering time has passed.
         * Used for debugging purposes
         */
        this.renderSecondTimer = 0;
        this._boundDraw = this.draw.bind(this);
        this.canvas = params.canvas;
        if (params.canvas.constructor === HTMLCanvasElement) {
            this._observed = observers.add(this.canvas, this.onCanvasResize);
        }
        this.src = params.src;
        this.buffer = params.buffer;
        this.riveFile = params.riveFile;
        this.layout = (_a = params.layout) !== null && _a !== void 0 ? _a : new Layout();
        this.shouldDisableRiveListeners = !!params.shouldDisableRiveListeners;
        this.isTouchScrollEnabled = !!params.isTouchScrollEnabled;
        this.automaticallyHandleEvents = !!params.automaticallyHandleEvents;
        this.enableRiveAssetCDN =
            params.enableRiveAssetCDN === undefined
                ? true
                : params.enableRiveAssetCDN;
        // New event management system
        this.eventManager = new EventManager();
        if (params.onLoad)
            this.on(EventType.Load, params.onLoad);
        if (params.onLoadError)
            this.on(EventType.LoadError, params.onLoadError);
        if (params.onPlay)
            this.on(EventType.Play, params.onPlay);
        if (params.onPause)
            this.on(EventType.Pause, params.onPause);
        if (params.onStop)
            this.on(EventType.Stop, params.onStop);
        if (params.onLoop)
            this.on(EventType.Loop, params.onLoop);
        if (params.onStateChange)
            this.on(EventType.StateChange, params.onStateChange);
        if (params.onAdvance)
            this.on(EventType.Advance, params.onAdvance);
        /**
         * @deprecated Use camelCase'd versions instead.
         */
        if (params.onload && !params.onLoad)
            this.on(EventType.Load, params.onload);
        if (params.onloaderror && !params.onLoadError)
            this.on(EventType.LoadError, params.onloaderror);
        if (params.onplay && !params.onPlay)
            this.on(EventType.Play, params.onplay);
        if (params.onpause && !params.onPause)
            this.on(EventType.Pause, params.onpause);
        if (params.onstop && !params.onStop)
            this.on(EventType.Stop, params.onstop);
        if (params.onloop && !params.onLoop)
            this.on(EventType.Loop, params.onloop);
        if (params.onstatechange && !params.onStateChange)
            this.on(EventType.StateChange, params.onstatechange);
        /**
         * Asset loading
         */
        if (params.assetLoader)
            this.assetLoader = params.assetLoader;
        // Hook up the task queue
        this.taskQueue = new TaskQueueManager(this.eventManager);
        this.init({
            src: this.src,
            buffer: this.buffer,
            riveFile: this.riveFile,
            autoplay: params.autoplay,
            autoBind: params.autoBind,
            animations: params.animations,
            stateMachines: params.stateMachines,
            artboard: params.artboard,
            useOffscreenRenderer: params.useOffscreenRenderer,
        });
    }
    Object.defineProperty(Rive.prototype, "viewModelCount", {
        get: function () {
            return this.file.viewModelCount();
        },
        enumerable: false,
        configurable: true
    });
    // Alternative constructor to build a Rive instance from an interface/object
    Rive.new = function (params) {
        console.warn("This function is deprecated: please use `new Rive({})` instead");
        return new Rive(params);
    };
    // Event handler for when audio context becomes available
    Rive.prototype.onSystemAudioChanged = function () {
        this.volume = this._volume;
    };
    // Initializes the Rive object either from constructor or load()
    Rive.prototype.init = function (_a) {
        var _this = this;
        var src = _a.src, buffer = _a.buffer, riveFile = _a.riveFile, animations = _a.animations, stateMachines = _a.stateMachines, artboard = _a.artboard, _b = _a.autoplay, autoplay = _b === void 0 ? false : _b, _c = _a.useOffscreenRenderer, useOffscreenRenderer = _c === void 0 ? false : _c, _d = _a.autoBind, autoBind = _d === void 0 ? false : _d;
        if (this.destroyed) {
            return;
        }
        this.src = src;
        this.buffer = buffer;
        this.riveFile = riveFile;
        // If no source file url specified, it's a bust
        if (!this.src && !this.buffer && !this.riveFile) {
            throw new RiveError(Rive.missingErrorMessage);
        }
        // List of animations that should be initialized.
        var startingAnimationNames = mapToStringArray(animations);
        // List of state machines that should be initialized
        var startingStateMachineNames = mapToStringArray(stateMachines);
        // Ensure loaded is marked as false if loading new file
        this.loaded = false;
        this.readyForPlaying = false;
        // Ensure the runtime is loaded
        RuntimeLoader.awaitInstance()
            .then(function (runtime) {
            if (_this.destroyed) {
                return;
            }
            _this.runtime = runtime;
            _this.removeRiveListeners();
            _this.deleteRiveRenderer();
            // Get the canvas where you want to render the animation and create a renderer
            _this.renderer = _this.runtime.makeRenderer(_this.canvas, useOffscreenRenderer);
            // Initial size adjustment based on devicePixelRatio if no width/height are
            // specified explicitly
            if (!(_this.canvas.width || _this.canvas.height)) {
                _this.resizeDrawingSurfaceToCanvas();
            }
            // Load Rive data from a source uri or a data buffer
            _this.initData(artboard, startingAnimationNames, startingStateMachineNames, autoplay, autoBind)
                .then(function () { return _this.setupRiveListeners(); })
                .catch(function (e) {
                console.error(e);
            });
        })
            .catch(function (e) {
            console.error(e);
        });
    };
    /**
     * Setup Rive Listeners on the canvas
     * @param riveListenerOptions - Enables TouchEvent events on the canvas. Set to true to allow
     * touch scrolling on the canvas element on touch-enabled devices
     * i.e. { isTouchScrollEnabled: true }
     */
    Rive.prototype.setupRiveListeners = function (riveListenerOptions) {
        var _this = this;
        if (this.eventCleanup) {
            this.eventCleanup();
        }
        if (!this.shouldDisableRiveListeners) {
            var activeStateMachines = (this.animator.stateMachines || [])
                .filter(function (sm) { return sm.playing && _this.runtime.hasListeners(sm.instance); })
                .map(function (sm) { return sm.instance; });
            var touchScrollEnabledOption = this.isTouchScrollEnabled;
            if (riveListenerOptions &&
                "isTouchScrollEnabled" in riveListenerOptions) {
                touchScrollEnabledOption = riveListenerOptions.isTouchScrollEnabled;
            }
            this.eventCleanup = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.registerTouchInteractions)({
                canvas: this.canvas,
                artboard: this.artboard,
                stateMachines: activeStateMachines,
                renderer: this.renderer,
                rive: this.runtime,
                fit: this._layout.runtimeFit(this.runtime),
                alignment: this._layout.runtimeAlignment(this.runtime),
                isTouchScrollEnabled: touchScrollEnabledOption,
                layoutScaleFactor: this._layout.layoutScaleFactor,
            });
        }
    };
    /**
     * Remove Rive Listeners setup on the canvas
     */
    Rive.prototype.removeRiveListeners = function () {
        if (this.eventCleanup) {
            this.eventCleanup();
            this.eventCleanup = null;
        }
    };
    /**
     * If the instance has audio and the system audio is not ready
     * we hook the instance to the audio manager
     */
    Rive.prototype.initializeAudio = function () {
        var _this = this;
        var _a;
        // Initialize audio if needed
        if (audioManager.status == SystemAudioStatus.UNAVAILABLE) {
            if (((_a = this.artboard) === null || _a === void 0 ? void 0 : _a.hasAudio) && this._audioEventListener === null) {
                this._audioEventListener = {
                    type: EventType.AudioStatusChange,
                    callback: function () { return _this.onSystemAudioChanged(); },
                };
                audioManager.add(this._audioEventListener);
                audioManager.establishAudio();
            }
        }
    };
    Rive.prototype.initArtboardSize = function () {
        if (!this.artboard)
            return;
        // Use preset values if they are not undefined
        this._artboardWidth = this.artboard.width =
            this._artboardWidth || this.artboard.width;
        this._artboardHeight = this.artboard.height =
            this._artboardHeight || this.artboard.height;
    };
    // Initializes runtime with Rive data and preps for playing
    Rive.prototype.initData = function (artboardName, animationNames, stateMachineNames, autoplay, autoBind) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, msg;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        if (!(this.riveFile == null)) return [3 /*break*/, 2];
                        this.riveFile = new RiveFile({
                            src: this.src,
                            buffer: this.buffer,
                            enableRiveAssetCDN: this.enableRiveAssetCDN,
                            assetLoader: this.assetLoader,
                        });
                        return [4 /*yield*/, this.riveFile.init()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        // Check for riveFile in case it has been cleaned up while initializing;
                        if (!this.riveFile) {
                            throw new RiveError(Rive.cleanupErrorMessage);
                        }
                        this.file = this.riveFile.getInstance();
                        // Initialize and draw frame
                        this.initArtboard(artboardName, animationNames, stateMachineNames, autoplay, autoBind);
                        // Initialize the artboard size
                        this.initArtboardSize();
                        // Check for audio
                        this.initializeAudio();
                        // Everything's set up, emit a load event
                        this.loaded = true;
                        this.eventManager.fire({
                            type: EventType.Load,
                            data: (_a = this.src) !== null && _a !== void 0 ? _a : "buffer",
                        });
                        // Flag ready for playback commands and clear the task queue; this order
                        // is important or it may infinitely recurse
                        this.readyForPlaying = true;
                        this.taskQueue.process();
                        this.drawFrame();
                        return [2 /*return*/, Promise.resolve()];
                    case 3:
                        error_1 = _b.sent();
                        msg = resolveErrorMessage(error_1);
                        console.warn(msg);
                        this.eventManager.fire({ type: EventType.LoadError, data: msg });
                        return [2 /*return*/, Promise.reject(msg)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Initialize for playback
    Rive.prototype.initArtboard = function (artboardName, animationNames, stateMachineNames, autoplay, autoBind) {
        if (!this.file) {
            return;
        }
        // Fetch the artboard
        var rootArtboard = artboardName
            ? this.file.artboardByName(artboardName)
            : this.file.defaultArtboard();
        // Check we have a working artboard
        if (!rootArtboard) {
            var msg = "Invalid artboard name or no default artboard";
            console.warn(msg);
            this.eventManager.fire({ type: EventType.LoadError, data: msg });
            return;
        }
        this.artboard = rootArtboard;
        rootArtboard.volume = this._volume * audioManager.systemVolume;
        // Check that the artboard has at least 1 animation
        if (this.artboard.animationCount() < 1) {
            var msg = "Artboard has no animations";
            this.eventManager.fire({ type: EventType.LoadError, data: msg });
            throw msg;
        }
        // Initialize the animator
        this.animator = new Animator(this.runtime, this.artboard, this.eventManager);
        // Initialize the animations; as loaded hasn't happened yet, we need to
        // suppress firing the play/pause events until the load event has fired. To
        // do this we tell the animator to suppress firing events, and add event
        // firing to the task queue.
        var instanceNames;
        if (animationNames.length > 0 || stateMachineNames.length > 0) {
            instanceNames = animationNames.concat(stateMachineNames);
            this.animator.initLinearAnimations(animationNames, autoplay);
            this.animator.initStateMachines(stateMachineNames, autoplay);
        }
        else {
            instanceNames = [this.animator.atLeastOne(autoplay, false)];
        }
        // Queue up firing the playback events
        this.taskQueue.add({
            event: {
                type: autoplay ? EventType.Play : EventType.Pause,
                data: instanceNames,
            },
        });
        if (autoBind) {
            var viewModel = this.file.defaultArtboardViewModel(rootArtboard);
            if (viewModel !== null) {
                var runtimeInstance = viewModel.defaultInstance();
                if (runtimeInstance !== null) {
                    var viewModelInstance = new ViewModelInstance(runtimeInstance, null);
                    this.bindViewModelInstance(viewModelInstance);
                }
            }
        }
    };
    // Draws the current artboard frame
    Rive.prototype.drawFrame = function () {
        var _a, _b;
        if ((_a = document === null || document === void 0 ? void 0 : document.timeline) === null || _a === void 0 ? void 0 : _a.currentTime) {
            if (this.loaded && this.artboard && !this.frameRequestId) {
                this._boundDraw(document.timeline.currentTime);
                (_b = this.runtime) === null || _b === void 0 ? void 0 : _b.resolveAnimationFrame();
            }
        }
        else {
            this.startRendering();
        }
    };
    /**
     * Draw rendering loop; renders animation frames at the correct time interval.
     * @param time the time at which to render a frame
     */
    Rive.prototype.draw = function (time, onSecond) {
        var _a;
        // Clear the frameRequestId, as we're now rendering a fresh frame
        this.frameRequestId = null;
        var before = performance.now();
        // On the first pass, make sure lastTime has a valid value
        if (!this.lastRenderTime) {
            this.lastRenderTime = time;
        }
        // Handle the onSecond callback
        this.renderSecondTimer += time - this.lastRenderTime;
        if (this.renderSecondTimer > 5000) {
            this.renderSecondTimer = 0;
            onSecond === null || onSecond === void 0 ? void 0 : onSecond();
        }
        // Calculate the elapsed time between frames in seconds
        var elapsedTime = (time - this.lastRenderTime) / 1000;
        this.lastRenderTime = time;
        // - Advance non-paused animations by the elapsed number of seconds
        // - Advance any animations that require scrubbing
        // - Advance to the first frame even when autoplay is false
        var activeAnimations = this.animator.animations
            .filter(function (a) { return a.playing || a.needsScrub; })
            // The scrubbed animations must be applied first to prevent weird artifacts
            // if the playing animations conflict with the scrubbed animating attribuates.
            .sort(function (first) { return (first.needsScrub ? -1 : 1); });
        for (var _i = 0, activeAnimations_1 = activeAnimations; _i < activeAnimations_1.length; _i++) {
            var animation = activeAnimations_1[_i];
            animation.advance(elapsedTime);
            if (animation.instance.didLoop) {
                animation.loopCount += 1;
            }
            animation.apply(1.0);
        }
        // - Advance non-paused state machines by the elapsed number of seconds
        // - Advance to the first frame even when autoplay is false
        var activeStateMachines = this.animator.stateMachines.filter(function (a) { return a.playing; });
        for (var _b = 0, activeStateMachines_1 = activeStateMachines; _b < activeStateMachines_1.length; _b++) {
            var stateMachine = activeStateMachines_1[_b];
            // Check for events before the current frame's state machine advance
            var numEventsReported = stateMachine.reportedEventCount();
            if (numEventsReported) {
                for (var i = 0; i < numEventsReported; i++) {
                    var event_1 = stateMachine.reportedEventAt(i);
                    if (event_1) {
                        if (event_1.type === RiveEventType.OpenUrl) {
                            this.eventManager.fire({
                                type: EventType.RiveEvent,
                                data: event_1,
                            });
                            // Handle the event side effect if explicitly enabled
                            if (this.automaticallyHandleEvents) {
                                var newAnchorTag = document.createElement("a");
                                var _c = event_1, url = _c.url, target = _c.target;
                                var sanitizedUrl = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.sanitizeUrl)(url);
                                url && newAnchorTag.setAttribute("href", sanitizedUrl);
                                target && newAnchorTag.setAttribute("target", target);
                                if (sanitizedUrl && sanitizedUrl !== _utils__WEBPACK_IMPORTED_MODULE_3__.BLANK_URL) {
                                    newAnchorTag.click();
                                }
                            }
                        }
                        else {
                            this.eventManager.fire({
                                type: EventType.RiveEvent,
                                data: event_1,
                            });
                        }
                    }
                }
            }
            stateMachine.advanceAndApply(elapsedTime);
            // stateMachine.instance.apply(this.artboard);
        }
        // Once the animations have been applied to the artboard, advance it
        // by the elapsed time.
        if (this.animator.stateMachines.length == 0) {
            this.artboard.advance(elapsedTime);
        }
        var renderer = this.renderer;
        // Canvas must be wiped to prevent artifacts
        renderer.clear();
        renderer.save();
        // Update the renderer alignment if necessary
        this.alignRenderer();
        // Do not draw on 0 canvas size
        if (!this._hasZeroSize) {
            this.artboard.draw(renderer);
        }
        renderer.restore();
        renderer.flush();
        // Check for any animations that looped
        this.animator.handleLooping();
        // Check for any state machines that had a state change
        this.animator.handleStateChanges();
        // Report advanced time
        this.animator.handleAdvancing(elapsedTime);
        // Add duration to create frame to durations array
        this.frameCount++;
        var after = performance.now();
        this.frameTimes.push(after);
        this.durations.push(after - before);
        while (this.frameTimes[0] <= after - 1000) {
            this.frameTimes.shift();
            this.durations.shift();
        }
        (_a = this._viewModelInstance) === null || _a === void 0 ? void 0 : _a.handleCallbacks();
        // Calling requestAnimationFrame will rerun draw() at the correct rate:
        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations
        if (this.animator.isPlaying) {
            // Request a new rendering frame
            this.startRendering();
        }
        else if (this.animator.isPaused) {
            // Reset the end time so on playback it starts at the correct frame
            this.lastRenderTime = 0;
        }
        else if (this.animator.isStopped) {
            // Reset animation instances, artboard and time
            // TODO: implement this properly when we have instancing
            // this.initArtboard();
            // this.drawFrame();
            this.lastRenderTime = 0;
        }
    };
    /**
     * Align the renderer
     */
    Rive.prototype.alignRenderer = function () {
        var _a = this, renderer = _a.renderer, runtime = _a.runtime, _layout = _a._layout, artboard = _a.artboard;
        // Align things up safe in the knowledge we can restore if changed
        renderer.align(_layout.runtimeFit(runtime), _layout.runtimeAlignment(runtime), {
            minX: _layout.minX,
            minY: _layout.minY,
            maxX: _layout.maxX,
            maxY: _layout.maxY,
        }, artboard.bounds, this._devicePixelRatioUsed * _layout.layoutScaleFactor);
    };
    Object.defineProperty(Rive.prototype, "fps", {
        get: function () {
            return this.durations.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "frameTime", {
        get: function () {
            if (this.durations.length === 0) {
                return 0;
            }
            return (this.durations.reduce(function (a, b) { return a + b; }, 0) / this.durations.length).toFixed(4);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Cleans up all Wasm-generated objects that need to be manually destroyed:
     * artboard instances, animation instances, state machine instances,
     * renderer instance, file and runtime.
     *
     * Once this is called, you will need to initialise a new instance of the
     * Rive class
     */
    Rive.prototype.cleanup = function () {
        var _a, _b;
        this.destroyed = true;
        // Stop the renderer if it hasn't already been stopped.
        this.stopRendering();
        // Clean up any artboard, animation or state machine instances.
        this.cleanupInstances();
        // Remove from observer
        if (this._observed !== null) {
            observers.remove(this._observed);
        }
        this.removeRiveListeners();
        if (this.file) {
            (_a = this.riveFile) === null || _a === void 0 ? void 0 : _a.cleanup();
            this.file = null;
        }
        this.riveFile = null;
        this.deleteRiveRenderer();
        if (this._audioEventListener !== null) {
            audioManager.remove(this._audioEventListener);
            this._audioEventListener = null;
        }
        (_b = this._viewModelInstance) === null || _b === void 0 ? void 0 : _b.cleanup();
        this._viewModelInstance = null;
        this._dataEnums = null;
    };
    /**
     * Cleans up the Renderer object. Only call this API if you no longer
     * need to render Rive content in your session.
     */
    Rive.prototype.deleteRiveRenderer = function () {
        var _a;
        (_a = this.renderer) === null || _a === void 0 ? void 0 : _a.delete();
        this.renderer = null;
    };
    /**
     * Cleans up any Wasm-generated objects that need to be manually destroyed:
     * artboard instances, animation instances, state machine instances.
     *
     * Once this is called, things will need to be reinitialized or bad things
     * might happen.
     */
    Rive.prototype.cleanupInstances = function () {
        if (this.eventCleanup !== null) {
            this.eventCleanup();
        }
        // Delete all animation and state machine instances
        this.stop();
        if (this.artboard) {
            this.artboard.delete();
            this.artboard = null;
        }
    };
    /**
     * Tries to query the setup Artboard for a text run node with the given name.
     *
     * @param textRunName - Name of the text run node associated with a text object
     * @returns - TextValueRun node or undefined if the text run cannot be queried
     */
    Rive.prototype.retrieveTextRun = function (textRunName) {
        var _a;
        if (!textRunName) {
            console.warn("No text run name provided");
            return;
        }
        if (!this.artboard) {
            console.warn("Tried to access text run, but the Artboard is null");
            return;
        }
        var textRun = this.artboard.textRun(textRunName);
        if (!textRun) {
            console.warn("Could not access a text run with name '".concat(textRunName, "' in the '").concat((_a = this.artboard) === null || _a === void 0 ? void 0 : _a.name, "' Artboard. Note that you must rename a text run node in the Rive editor to make it queryable at runtime."));
            return;
        }
        return textRun;
    };
    /**
     * Returns a string from a given text run node name, or undefined if the text run
     * cannot be queried.
     *
     * @param textRunName - Name of the text run node associated with a text object
     * @returns - String value of the text run node or undefined
     */
    Rive.prototype.getTextRunValue = function (textRunName) {
        var textRun = this.retrieveTextRun(textRunName);
        return textRun ? textRun.text : undefined;
    };
    /**
     * Sets a text value for a given text run node name if possible
     *
     * @param textRunName - Name of the text run node associated with a text object
     * @param textRunValue - String value to set on the text run node
     */
    Rive.prototype.setTextRunValue = function (textRunName, textRunValue) {
        var textRun = this.retrieveTextRun(textRunName);
        if (textRun) {
            textRun.text = textRunValue;
        }
    };
    // Plays specified animations; if none specified, it unpauses everything.
    Rive.prototype.play = function (animationNames, autoplay) {
        var _this = this;
        animationNames = mapToStringArray(animationNames);
        // If the file's not loaded, queue up the play
        if (!this.readyForPlaying) {
            this.taskQueue.add({
                action: function () { return _this.play(animationNames, autoplay); },
            });
            return;
        }
        this.animator.play(animationNames);
        if (this.eventCleanup) {
            this.eventCleanup();
        }
        this.setupRiveListeners();
        this.startRendering();
    };
    // Pauses specified animations; if none specified, pauses all.
    Rive.prototype.pause = function (animationNames) {
        var _this = this;
        animationNames = mapToStringArray(animationNames);
        // If the file's not loaded, early out, nothing to pause
        if (!this.readyForPlaying) {
            this.taskQueue.add({
                action: function () { return _this.pause(animationNames); },
            });
            return;
        }
        if (this.eventCleanup) {
            this.eventCleanup();
        }
        this.animator.pause(animationNames);
    };
    Rive.prototype.scrub = function (animationNames, value) {
        var _this = this;
        animationNames = mapToStringArray(animationNames);
        // If the file's not loaded, early out, nothing to pause
        if (!this.readyForPlaying) {
            this.taskQueue.add({
                action: function () { return _this.scrub(animationNames, value); },
            });
            return;
        }
        // Scrub the animation time; we draw a single frame here so that if
        // nothing's currently playing, the scrubbed animation is still rendered/
        this.animator.scrub(animationNames, value || 0);
        this.drawFrame();
    };
    // Stops specified animations; if none specifies, stops them all.
    Rive.prototype.stop = function (animationNames) {
        var _this = this;
        animationNames = mapToStringArray(animationNames);
        // If the file's not loaded, early out, nothing to pause
        if (!this.readyForPlaying) {
            this.taskQueue.add({
                action: function () { return _this.stop(animationNames); },
            });
            return;
        }
        // If there is no artboard, this.animator will be undefined
        if (this.animator) {
            this.animator.stop(animationNames);
        }
        if (this.eventCleanup) {
            this.eventCleanup();
        }
    };
    /**
     * Resets the animation
     * @param artboard the name of the artboard, or default if none given
     * @param animations the names of animations for playback
     * @param stateMachines the names of state machines for playback
     * @param autoplay whether to autoplay when reset, defaults to false
     *
     */
    Rive.prototype.reset = function (params) {
        var _a, _b;
        // Get the current artboard, animations, state machines, and playback states
        var artBoardName = params === null || params === void 0 ? void 0 : params.artboard;
        var animationNames = mapToStringArray(params === null || params === void 0 ? void 0 : params.animations);
        var stateMachineNames = mapToStringArray(params === null || params === void 0 ? void 0 : params.stateMachines);
        var autoplay = (_a = params === null || params === void 0 ? void 0 : params.autoplay) !== null && _a !== void 0 ? _a : false;
        var autoBind = (_b = params === null || params === void 0 ? void 0 : params.autoBind) !== null && _b !== void 0 ? _b : false;
        // Stop everything and clean up
        this.cleanupInstances();
        // Reinitialize an artboard instance with the state
        this.initArtboard(artBoardName, animationNames, stateMachineNames, autoplay, autoBind);
        this.taskQueue.process();
    };
    // Loads a new Rive file, keeping listeners in place
    Rive.prototype.load = function (params) {
        this.file = null;
        // Stop all animations
        this.stop();
        // Reinitialize
        this.init(params);
    };
    Object.defineProperty(Rive.prototype, "layout", {
        /**
         * Returns the current layout. Note that layout should be treated as
         * immutable. If you want to change the layout, create a new one use the
         * layout setter
         */
        get: function () {
            return this._layout;
        },
        // Sets a new layout
        set: function (layout) {
            this._layout = layout;
            // If the maxX or maxY are 0, then set them to the canvas width and height
            if (!layout.maxX || !layout.maxY) {
                this.resizeToCanvas();
            }
            if (this.loaded && !this.animator.isPlaying) {
                this.drawFrame();
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Sets the layout bounds to the current canvas size; this is typically called
     * when the canvas is resized
     */
    Rive.prototype.resizeToCanvas = function () {
        this._layout = this.layout.copyWith({
            minX: 0,
            minY: 0,
            maxX: this.canvas.width,
            maxY: this.canvas.height,
        });
    };
    /**
     * Accounts for devicePixelRatio as a multiplier to render the size of the canvas drawing surface.
     * Uses the size of the backing canvas to set new width/height attributes. Need to re-render
     * and resize the layout to match the new drawing surface afterwards.
     * Useful function for consumers to include in a window resize listener.
     *
     * This method will set the {@link devicePixelRatioUsed} property.
     *
     * Optionally, you can provide a {@link customDevicePixelRatio} to provide a
     * custom value.
     */
    Rive.prototype.resizeDrawingSurfaceToCanvas = function (customDevicePixelRatio) {
        if (this.canvas instanceof HTMLCanvasElement && !!window) {
            var _a = this.canvas.getBoundingClientRect(), width = _a.width, height = _a.height;
            var dpr = customDevicePixelRatio || window.devicePixelRatio || 1;
            this.devicePixelRatioUsed = dpr;
            this.canvas.width = dpr * width;
            this.canvas.height = dpr * height;
            this.resizeToCanvas();
            this.drawFrame();
            if (this.layout.fit === Fit.Layout) {
                var scaleFactor = this._layout.layoutScaleFactor;
                this.artboard.width = width / scaleFactor;
                this.artboard.height = height / scaleFactor;
            }
        }
    };
    Object.defineProperty(Rive.prototype, "source", {
        // Returns the animation source, which may be undefined
        get: function () {
            return this.src;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "activeArtboard", {
        /**
         * Returns the name of the active artboard
         */
        get: function () {
            return this.artboard ? this.artboard.name : "";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "animationNames", {
        // Returns a list of animation names on the chosen artboard
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded || !this.artboard) {
                return [];
            }
            var animationNames = [];
            for (var i = 0; i < this.artboard.animationCount(); i++) {
                animationNames.push(this.artboard.animationByIndex(i).name);
            }
            return animationNames;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "stateMachineNames", {
        /**
         * Returns a list of state machine names from the current artboard
         */
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded || !this.artboard) {
                return [];
            }
            var stateMachineNames = [];
            for (var i = 0; i < this.artboard.stateMachineCount(); i++) {
                stateMachineNames.push(this.artboard.stateMachineByIndex(i).name);
            }
            return stateMachineNames;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the inputs for the specified instanced state machine, or an empty
     * list if the name is invalid or the state machine is not instanced
     * @param name the state machine name
     * @returns the inputs for the named state machine
     */
    Rive.prototype.stateMachineInputs = function (name) {
        // If the file's not loaded, early out, nothing to pause
        if (!this.loaded) {
            return;
        }
        var stateMachine = this.animator.stateMachines.find(function (m) { return m.name === name; });
        return stateMachine === null || stateMachine === void 0 ? void 0 : stateMachine.inputs;
    };
    // Returns the input with the provided name at the given path
    Rive.prototype.retrieveInputAtPath = function (name, path) {
        if (!name) {
            console.warn("No input name provided for path '".concat(path, "'"));
            return;
        }
        if (!this.artboard) {
            console.warn("Tried to access input: '".concat(name, "', at path: '").concat(path, "', but the Artboard is null"));
            return;
        }
        var input = this.artboard.inputByPath(name, path);
        if (!input) {
            console.warn("Could not access an input with name: '".concat(name, "', at path:'").concat(path, "'"));
            return;
        }
        return input;
    };
    /**
     * Set the boolean input with the provided name at the given path with value
     * @param input the state machine input name
     * @param value the value to set the input to
     * @param path the path the input is located at an artboard level
     */
    Rive.prototype.setBooleanStateAtPath = function (inputName, value, path) {
        var input = this.retrieveInputAtPath(inputName, path);
        if (!input)
            return;
        if (input.type === StateMachineInputType.Boolean) {
            input.asBool().value = value;
        }
        else {
            console.warn("Input with name: '".concat(inputName, "', at path:'").concat(path, "' is not a boolean"));
        }
    };
    /**
     * Set the number input with the provided name at the given path with value
     * @param input the state machine input name
     * @param value the value to set the input to
     * @param path the path the input is located at an artboard level
     */
    Rive.prototype.setNumberStateAtPath = function (inputName, value, path) {
        var input = this.retrieveInputAtPath(inputName, path);
        if (!input)
            return;
        if (input.type === StateMachineInputType.Number) {
            input.asNumber().value = value;
        }
        else {
            console.warn("Input with name: '".concat(inputName, "', at path:'").concat(path, "' is not a number"));
        }
    };
    /**
     * Fire the trigger with the provided name at the given path
     * @param input the state machine input name
     * @param path the path the input is located at an artboard level
     */
    Rive.prototype.fireStateAtPath = function (inputName, path) {
        var input = this.retrieveInputAtPath(inputName, path);
        if (!input)
            return;
        if (input.type === StateMachineInputType.Trigger) {
            input.asTrigger().fire();
        }
        else {
            console.warn("Input with name: '".concat(inputName, "', at path:'").concat(path, "' is not a trigger"));
        }
    };
    // Returns the TextValueRun object for the provided name at the given path
    Rive.prototype.retrieveTextAtPath = function (name, path) {
        if (!name) {
            console.warn("No text name provided for path '".concat(path, "'"));
            return;
        }
        if (!path) {
            console.warn("No path provided for text '".concat(name, "'"));
            return;
        }
        if (!this.artboard) {
            console.warn("Tried to access text: '".concat(name, "', at path: '").concat(path, "', but the Artboard is null"));
            return;
        }
        var text = this.artboard.textByPath(name, path);
        if (!text) {
            console.warn("Could not access text with name: '".concat(name, "', at path:'").concat(path, "'"));
            return;
        }
        return text;
    };
    /**
     * Retrieves the text value for a specified text run at a given path
     * @param textName The name of the text run
     * @param path The path to the text run within the artboard
     * @returns The text value of the text run, or undefined if not found
     *
     * @example
     * // Get the text value for a text run named "title" at one nested artboard deep
     * const titleText = riveInstance.getTextRunValueAtPath("title", "artboard1");
     *
     * @example
     * // Get the text value for a text run named "subtitle" within a nested group two artboards deep
     * const subtitleText = riveInstance.getTextRunValueAtPath("subtitle", "group/nestedGroup");
     *
     * @remarks
     * If the text run cannot be found at the specified path, a warning will be logged to the console.
     */
    Rive.prototype.getTextRunValueAtPath = function (textName, path) {
        var run = this.retrieveTextAtPath(textName, path);
        if (!run) {
            console.warn("Could not get text with name: '".concat(textName, "', at path:'").concat(path, "'"));
            return;
        }
        return run.text;
    };
    /**
     * Sets the text value for a specified text run at a given path
     * @param textName The name of the text run
     * @param value The new text value to set
     * @param path The path to the text run within the artboard
     * @returns void
     *
     * @example
     * // Set the text value for a text run named "title" at one nested artboard deep
     * riveInstance.setTextRunValueAtPath("title", "New Title", "artboard1");
     *
     * @example
     * // Set the text value for a text run named "subtitle" within a nested group two artboards deep
     * riveInstance.setTextRunValueAtPath("subtitle", "New Subtitle", "group/nestedGroup");
     *
     * @remarks
     * If the text run cannot be found at the specified path, a warning will be logged to the console.
     */
    Rive.prototype.setTextRunValueAtPath = function (textName, value, path) {
        var run = this.retrieveTextAtPath(textName, path);
        if (!run) {
            console.warn("Could not set text with name: '".concat(textName, "', at path:'").concat(path, "'"));
            return;
        }
        run.text = value;
    };
    Object.defineProperty(Rive.prototype, "playingStateMachineNames", {
        // Returns a list of playing machine names
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            return this.animator.stateMachines
                .filter(function (m) { return m.playing; })
                .map(function (m) { return m.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "playingAnimationNames", {
        // Returns a list of playing animation names
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            return this.animator.animations.filter(function (a) { return a.playing; }).map(function (a) { return a.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "pausedAnimationNames", {
        // Returns a list of paused animation names
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            return this.animator.animations
                .filter(function (a) { return !a.playing; })
                .map(function (a) { return a.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "pausedStateMachineNames", {
        /**
         *  Returns a list of paused machine names
         * @returns a list of state machine names that are paused
         */
        get: function () {
            // If the file's not loaded, we got nothing to return
            if (!this.loaded) {
                return [];
            }
            return this.animator.stateMachines
                .filter(function (m) { return !m.playing; })
                .map(function (m) { return m.name; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "isPlaying", {
        /**
         * @returns true if any animation is playing
         */
        get: function () {
            return this.animator.isPlaying;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "isPaused", {
        /**
         * @returns true if all instanced animations are paused
         */
        get: function () {
            return this.animator.isPaused;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "isStopped", {
        /**
         * @returns true if no animations are playing or paused
         */
        get: function () {
            return this.animator.isStopped;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "bounds", {
        /**
         * @returns the bounds of the current artboard, or undefined if the artboard
         * isn't loaded yet.
         */
        get: function () {
            return this.artboard ? this.artboard.bounds : undefined;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Subscribe to Rive-generated events
     * @param type the type of event to subscribe to
     * @param callback callback to fire when the event occurs
     */
    Rive.prototype.on = function (type, callback) {
        this.eventManager.add({
            type: type,
            callback: callback,
        });
    };
    /**
     * Unsubscribes from a Rive-generated event
     * @param type the type of event to unsubscribe from
     * @param callback the callback to unsubscribe
     */
    Rive.prototype.off = function (type, callback) {
        this.eventManager.remove({
            type: type,
            callback: callback,
        });
    };
    /**
     * Unsubscribes from a Rive-generated event
     * @deprecated
     * @param callback the callback to unsubscribe from
     */
    Rive.prototype.unsubscribe = function (type, callback) {
        console.warn("This function is deprecated: please use `off()` instead.");
        this.off(type, callback);
    };
    /**
     * Unsubscribes all Rive listeners from an event type, or everything if no type is
     * given
     * @param type the type of event to unsubscribe from, or all types if
     * undefined
     */
    Rive.prototype.removeAllRiveEventListeners = function (type) {
        this.eventManager.removeAll(type);
    };
    /**
     * Unsubscribes all listeners from an event type, or everything if no type is
     * given
     * @deprecated
     * @param type the type of event to unsubscribe from, or all types if
     * undefined
     */
    Rive.prototype.unsubscribeAll = function (type) {
        console.warn("This function is deprecated: please use `removeAllRiveEventListeners()` instead.");
        this.removeAllRiveEventListeners(type);
    };
    /**
     * Stops the rendering loop; this is different from pausing in that it doesn't
     * change the state of any animation. It stops rendering from occurring. This
     * is designed for situations such as when Rive isn't visible.
     *
     * The only way to start rendering again is to call `startRendering`.
     * Animations that are marked as playing will start from the position that
     * they would have been at if rendering had not been stopped.
     */
    Rive.prototype.stopRendering = function () {
        if (this.loaded && this.frameRequestId) {
            if (this.runtime.cancelAnimationFrame) {
                this.runtime.cancelAnimationFrame(this.frameRequestId);
            }
            else {
                cancelAnimationFrame(this.frameRequestId);
            }
            this.frameRequestId = null;
        }
    };
    /**
     * Starts the rendering loop if it has been previously stopped. If the
     * renderer is already active, then this will have zero effect.
     */
    Rive.prototype.startRendering = function () {
        if (this.loaded && this.artboard && !this.frameRequestId) {
            if (this.runtime.requestAnimationFrame) {
                this.frameRequestId = this.runtime.requestAnimationFrame(this._boundDraw);
            }
            else {
                this.frameRequestId = requestAnimationFrame(this._boundDraw);
            }
        }
    };
    /**
     * Enables frames-per-second (FPS) reporting for the runtime
     * If no callback is provided, Rive will append a fixed-position div at the top-right corner of
     * the page with the FPS reading
     * @param fpsCallback - Callback from the runtime during the RAF loop that supplies the FPS value
     */
    Rive.prototype.enableFPSCounter = function (fpsCallback) {
        this.runtime.enableFPSCounter(fpsCallback);
    };
    /**
     * Disables frames-per-second (FPS) reporting for the runtime
     */
    Rive.prototype.disableFPSCounter = function () {
        this.runtime.disableFPSCounter();
    };
    Object.defineProperty(Rive.prototype, "contents", {
        /**
         * Returns the contents of a Rive file: the artboards, animations, and state machines
         */
        get: function () {
            if (!this.loaded) {
                return undefined;
            }
            var riveContents = {
                artboards: [],
            };
            for (var i = 0; i < this.file.artboardCount(); i++) {
                var artboard = this.file.artboardByIndex(i);
                var artboardContents = {
                    name: artboard.name,
                    animations: [],
                    stateMachines: [],
                };
                for (var j = 0; j < artboard.animationCount(); j++) {
                    var animation = artboard.animationByIndex(j);
                    artboardContents.animations.push(animation.name);
                }
                for (var k = 0; k < artboard.stateMachineCount(); k++) {
                    var stateMachine = artboard.stateMachineByIndex(k);
                    var name_1 = stateMachine.name;
                    var instance = new this.runtime.StateMachineInstance(stateMachine, artboard);
                    var inputContents = [];
                    for (var l = 0; l < instance.inputCount(); l++) {
                        var input = instance.input(l);
                        inputContents.push({ name: input.name, type: input.type });
                    }
                    artboardContents.stateMachines.push({
                        name: name_1,
                        inputs: inputContents,
                    });
                }
                riveContents.artboards.push(artboardContents);
            }
            return riveContents;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "volume", {
        /**
         * Getter / Setter for the volume of the artboard
         */
        get: function () {
            if (this.artboard && this.artboard.volume !== this._volume) {
                this._volume = this.artboard.volume;
            }
            return this._volume;
        },
        set: function (value) {
            this._volume = value;
            if (this.artboard) {
                this.artboard.volume = value * audioManager.systemVolume;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "artboardWidth", {
        /**
         * The width of the artboard.
         *
         * This will return 0 if the artboard is not loaded yet and a custom
         * width has not been set.
         *
         * Do not set this value manually when using {@link resizeDrawingSurfaceToCanvas}
         * with a {@link Layout.fit} of {@link Fit.Layout}, as the artboard width is
         * automatically set.
         */
        get: function () {
            var _a;
            if (this.artboard) {
                return this.artboard.width;
            }
            return (_a = this._artboardWidth) !== null && _a !== void 0 ? _a : 0;
        },
        set: function (value) {
            this._artboardWidth = value;
            if (this.artboard) {
                this.artboard.width = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Rive.prototype, "artboardHeight", {
        /**
         * The height of the artboard.
         *
         * This will return 0 if the artboard is not loaded yet and a custom
         * height has not been set.
         *
         * Do not set this value manually when using {@link resizeDrawingSurfaceToCanvas}
         * with a {@link Layout.fit} of {@link Fit.Layout}, as the artboard height is
         * automatically set.
         */
        get: function () {
            var _a;
            if (this.artboard) {
                return this.artboard.height;
            }
            return (_a = this._artboardHeight) !== null && _a !== void 0 ? _a : 0;
        },
        set: function (value) {
            this._artboardHeight = value;
            if (this.artboard) {
                this.artboard.height = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Reset the artboard size to its original values.
     */
    Rive.prototype.resetArtboardSize = function () {
        if (this.artboard) {
            this.artboard.resetArtboardSize();
            this._artboardWidth = this.artboard.width;
            this._artboardHeight = this.artboard.height;
        }
        else {
            // If the artboard isn't loaded, we need to reset the custom width and height
            this._artboardWidth = undefined;
            this._artboardHeight = undefined;
        }
    };
    Object.defineProperty(Rive.prototype, "devicePixelRatioUsed", {
        /**
         * The device pixel ratio used in rendering and canvas/artboard resizing.
         *
         * This value will be overidden by the device pixel ratio used in
         * {@link resizeDrawingSurfaceToCanvas}. If you use that method, do not set this value.
         */
        get: function () {
            return this._devicePixelRatioUsed;
        },
        set: function (value) {
            this._devicePixelRatioUsed = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Initialize the data context with the view model instance.
     */
    Rive.prototype.bindViewModelInstance = function (viewModelInstance) {
        var _a;
        if (this.artboard && !this.destroyed) {
            if (viewModelInstance && viewModelInstance.runtimeInstance) {
                viewModelInstance.internalIncrementReferenceCount();
                (_a = this._viewModelInstance) === null || _a === void 0 ? void 0 : _a.cleanup();
                this._viewModelInstance = viewModelInstance;
                if (this.animator.stateMachines.length > 0) {
                    this.animator.stateMachines.forEach(function (stateMachine) {
                        return stateMachine.bindViewModelInstance(viewModelInstance);
                    });
                }
                else {
                    this.artboard.bindViewModelInstance(viewModelInstance.runtimeInstance);
                }
            }
        }
    };
    Object.defineProperty(Rive.prototype, "viewModelInstance", {
        get: function () {
            return this._viewModelInstance;
        },
        enumerable: false,
        configurable: true
    });
    Rive.prototype.viewModelByIndex = function (index) {
        var viewModel = this.file.viewModelByIndex(index);
        if (viewModel !== null) {
            return new ViewModel(viewModel);
        }
        return null;
    };
    Rive.prototype.viewModelByName = function (name) {
        var viewModel = this.file.viewModelByName(name);
        if (viewModel !== null) {
            return new ViewModel(viewModel);
        }
        return null;
    };
    Rive.prototype.enums = function () {
        if (this._dataEnums === null) {
            var dataEnums = this.file.enums();
            this._dataEnums = dataEnums.map(function (dataEnum) {
                return new DataEnum(dataEnum);
            });
        }
        return this._dataEnums;
    };
    Rive.prototype.defaultViewModel = function () {
        if (this.artboard) {
            var viewModel = this.file.defaultArtboardViewModel(this.artboard);
            if (viewModel) {
                return new ViewModel(viewModel);
            }
        }
        return null;
    };
    // Error message for missing source or buffer
    Rive.missingErrorMessage = "Rive source file or data buffer required";
    // Error message for removed rive file
    Rive.cleanupErrorMessage = "Attempt to use file after calling cleanup.";
    return Rive;
}());

var ViewModel = /** @class */ (function () {
    function ViewModel(viewModel) {
        this._viewModel = viewModel;
    }
    Object.defineProperty(ViewModel.prototype, "instanceCount", {
        get: function () {
            return this._viewModel.instanceCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewModel.prototype, "name", {
        get: function () {
            return this._viewModel.name;
        },
        enumerable: false,
        configurable: true
    });
    ViewModel.prototype.instanceByIndex = function (index) {
        var instance = this._viewModel.instanceByIndex(index);
        if (instance !== null) {
            return new ViewModelInstance(instance, null);
        }
        return null;
    };
    ViewModel.prototype.instanceByName = function (name) {
        var instance = this._viewModel.instanceByName(name);
        if (instance !== null) {
            return new ViewModelInstance(instance, null);
        }
        return null;
    };
    ViewModel.prototype.defaultInstance = function () {
        var runtimeInstance = this._viewModel.defaultInstance();
        if (runtimeInstance !== null) {
            return new ViewModelInstance(runtimeInstance, null);
        }
        return null;
    };
    ViewModel.prototype.instance = function () {
        var runtimeInstance = this._viewModel.instance();
        if (runtimeInstance !== null) {
            return new ViewModelInstance(runtimeInstance, null);
        }
        return null;
    };
    Object.defineProperty(ViewModel.prototype, "properties", {
        get: function () {
            return this._viewModel.getProperties();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewModel.prototype, "instanceNames", {
        get: function () {
            return this._viewModel.getInstanceNames();
        },
        enumerable: false,
        configurable: true
    });
    return ViewModel;
}());

var DataEnum = /** @class */ (function () {
    function DataEnum(dataEnum) {
        this._dataEnum = dataEnum;
    }
    Object.defineProperty(DataEnum.prototype, "name", {
        get: function () {
            return this._dataEnum.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DataEnum.prototype, "values", {
        get: function () {
            return this._dataEnum.values;
        },
        enumerable: false,
        configurable: true
    });
    return DataEnum;
}());

var PropertyType;
(function (PropertyType) {
    PropertyType["Number"] = "number";
    PropertyType["String"] = "string";
    PropertyType["Boolean"] = "boolean";
    PropertyType["Color"] = "color";
    PropertyType["Trigger"] = "trigger";
    PropertyType["Enum"] = "enum";
    PropertyType["List"] = "list";
})(PropertyType || (PropertyType = {}));
var ViewModelInstance = /** @class */ (function () {
    function ViewModelInstance(runtimeInstance, parent) {
        this._parents = [];
        this._children = [];
        this._viewModelInstances = new Map();
        this._propertiesWithCallbacks = [];
        this._referenceCount = 0;
        this._runtimeInstance = runtimeInstance;
        if (parent !== null) {
            this._parents.push(parent);
        }
    }
    Object.defineProperty(ViewModelInstance.prototype, "runtimeInstance", {
        get: function () {
            return this._runtimeInstance;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstance.prototype.handleCallbacks = function () {
        if (this._propertiesWithCallbacks.length !== 0) {
            this._propertiesWithCallbacks.forEach(function (property) {
                property.handleCallbacks();
            });
            this._propertiesWithCallbacks.forEach(function (property) {
                property.clearChanges();
            });
        }
        this._children.forEach(function (child) { return child.handleCallbacks(); });
    };
    ViewModelInstance.prototype.addParent = function (parent) {
        this._parents.push(parent);
        if (this._propertiesWithCallbacks.length > 0 || this._children.length > 0) {
            parent.addToViewModelCallbacks(this);
        }
    };
    ViewModelInstance.prototype.removeParent = function (parent) {
        var index = this._parents.indexOf(parent);
        if (index !== -1) {
            var parent_1 = this._parents[index];
            parent_1.removeFromViewModelCallbacks(this);
            this._parents.splice(index, 1);
        }
    };
    /*
     * method for internal use, it shouldn't be called externally
     */
    ViewModelInstance.prototype.addToPropertyCallbacks = function (property) {
        var _this = this;
        if (!this._propertiesWithCallbacks.includes(property)) {
            this._propertiesWithCallbacks.push(property);
            if (this._propertiesWithCallbacks.length > 0) {
                this._parents.forEach(function (parent) {
                    parent.addToViewModelCallbacks(_this);
                });
            }
        }
    };
    /*
     * method for internal use, it shouldn't be called externally
     */
    ViewModelInstance.prototype.removeFromPropertyCallbacks = function (property) {
        var _this = this;
        if (this._propertiesWithCallbacks.includes(property)) {
            this._propertiesWithCallbacks = this._propertiesWithCallbacks.filter(function (prop) { return prop !== property; });
            if (this._children.length === 0 &&
                this._propertiesWithCallbacks.length === 0) {
                this._parents.forEach(function (parent) {
                    parent.removeFromViewModelCallbacks(_this);
                });
            }
        }
    };
    /*
     * method for internal use, it shouldn't be called externally
     */
    ViewModelInstance.prototype.addToViewModelCallbacks = function (instance) {
        var _this = this;
        if (!this._children.includes(instance)) {
            this._children.push(instance);
            this._parents.forEach(function (parent) {
                parent.addToViewModelCallbacks(_this);
            });
        }
    };
    /*
     * method for internal use, it shouldn't be called externally
     */
    ViewModelInstance.prototype.removeFromViewModelCallbacks = function (instance) {
        var _this = this;
        if (this._children.includes(instance)) {
            this._children = this._children.filter(function (child) { return child !== instance; });
            if (this._children.length === 0 &&
                this._propertiesWithCallbacks.length === 0) {
                this._parents.forEach(function (parent) {
                    parent.removeFromViewModelCallbacks(_this);
                });
            }
        }
    };
    ViewModelInstance.prototype.clearCallbacks = function () {
        this._propertiesWithCallbacks.forEach(function (property) {
            property.clearCallbacks();
        });
    };
    ViewModelInstance.prototype.propertyFromPath = function (path, type) {
        var pathSegments = path.split("/");
        return this.propertyFromPathSegments(pathSegments, 0, type);
    };
    ViewModelInstance.prototype.viewModelFromPathSegments = function (pathSegments, index) {
        var viewModelInstance = this.internalViewModelInstance(pathSegments[index]);
        if (viewModelInstance !== null) {
            if (index == pathSegments.length - 1) {
                return viewModelInstance;
            }
            else {
                return viewModelInstance.viewModelFromPathSegments(pathSegments, index++);
            }
        }
        return null;
    };
    ViewModelInstance.prototype.propertyFromPathSegments = function (pathSegments, index, type) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        if (index < pathSegments.length - 1) {
            var viewModelInstance = this.internalViewModelInstance(pathSegments[index]);
            if (viewModelInstance !== null) {
                return viewModelInstance.propertyFromPathSegments(pathSegments, index + 1, type);
            }
            else {
                return null;
            }
        }
        var instance = null;
        switch (type) {
            case PropertyType.Number:
                instance = (_b = (_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.number(pathSegments[index])) !== null && _b !== void 0 ? _b : null;
                if (instance !== null) {
                    return new ViewModelInstanceNumber(instance, this);
                }
                break;
            case PropertyType.String:
                instance = (_d = (_c = this._runtimeInstance) === null || _c === void 0 ? void 0 : _c.string(pathSegments[index])) !== null && _d !== void 0 ? _d : null;
                if (instance !== null) {
                    return new ViewModelInstanceString(instance, this);
                }
                break;
            case PropertyType.Boolean:
                instance = (_f = (_e = this._runtimeInstance) === null || _e === void 0 ? void 0 : _e.boolean(pathSegments[index])) !== null && _f !== void 0 ? _f : null;
                if (instance !== null) {
                    return new ViewModelInstanceBoolean(instance, this);
                }
                break;
            case PropertyType.Color:
                instance = (_h = (_g = this._runtimeInstance) === null || _g === void 0 ? void 0 : _g.color(pathSegments[index])) !== null && _h !== void 0 ? _h : null;
                if (instance !== null) {
                    return new ViewModelInstanceColor(instance, this);
                }
                break;
            case PropertyType.Trigger:
                instance = (_k = (_j = this._runtimeInstance) === null || _j === void 0 ? void 0 : _j.trigger(pathSegments[index])) !== null && _k !== void 0 ? _k : null;
                if (instance !== null) {
                    return new ViewModelInstanceTrigger(instance, this);
                }
                break;
            case PropertyType.Enum:
                instance = (_m = (_l = this._runtimeInstance) === null || _l === void 0 ? void 0 : _l.enum(pathSegments[index])) !== null && _m !== void 0 ? _m : null;
                if (instance !== null) {
                    return new ViewModelInstanceEnum(instance, this);
                }
                break;
            case PropertyType.List:
                instance = (_p = (_o = this._runtimeInstance) === null || _o === void 0 ? void 0 : _o.list(pathSegments[index])) !== null && _p !== void 0 ? _p : null;
                if (instance !== null) {
                    return new ViewModelInstanceList(instance, this);
                }
                break;
        }
        return null;
    };
    ViewModelInstance.prototype.internalViewModelInstance = function (name) {
        var _a;
        if (this._viewModelInstances.has(name)) {
            return this._viewModelInstances.get(name);
        }
        var viewModelRuntimeInstance = (_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.viewModel(name);
        if (viewModelRuntimeInstance !== null) {
            var viewModelInstance = new ViewModelInstance(viewModelRuntimeInstance, this);
            viewModelInstance.internalIncrementReferenceCount();
            this._viewModelInstances.set(name, viewModelInstance);
            return viewModelInstance;
        }
        return null;
    };
    /**
     * method to access a property instance of type number belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the number property
     */
    ViewModelInstance.prototype.number = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Number);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a property instance of type string belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the string property
     */
    ViewModelInstance.prototype.string = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.String);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a property instance of type boolean belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the boolean property
     */
    ViewModelInstance.prototype.boolean = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Boolean);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a property instance of type color belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the ttrigger property
     */
    ViewModelInstance.prototype.color = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Color);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a property instance of type trigger belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the trigger property
     */
    ViewModelInstance.prototype.trigger = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Trigger);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a property instance of type enum belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the enum property
     */
    ViewModelInstance.prototype.enum = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.Enum);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a property instance of type list belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the list property
     */
    ViewModelInstance.prototype.list = function (path) {
        var viewmodelInstanceValue = this.propertyFromPath(path, PropertyType.List);
        return viewmodelInstanceValue;
    };
    /**
     * method to access a view model property instance belonging
     * to the view model instance or to a nested view model instance
     * @param path - path to the view model property
     */
    ViewModelInstance.prototype.viewModel = function (path) {
        var pathSegments = path.split("/");
        var parentViewModelInstance = pathSegments.length > 1
            ? this.viewModelFromPathSegments(pathSegments.slice(0, pathSegments.length - 1), 0)
            : this;
        if (parentViewModelInstance != null) {
            return parentViewModelInstance.internalViewModelInstance(pathSegments[pathSegments.length - 1]);
        }
        return null;
    };
    ViewModelInstance.prototype.internalReplaceViewModel = function (name, value) {
        var _a;
        if (value.runtimeInstance !== null) {
            var result = ((_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.replaceViewModel(name, value.runtimeInstance)) ||
                false;
            if (result) {
                value.internalIncrementReferenceCount();
                var oldInstance_1 = this.internalViewModelInstance(name);
                if (oldInstance_1 !== null) {
                    oldInstance_1.removeParent(this);
                    if (this._children.includes(oldInstance_1)) {
                        this._children = this._children.filter(function (child) { return child !== oldInstance_1; });
                    }
                    oldInstance_1.cleanup();
                }
                this._viewModelInstances.set(name, value);
                value.addParent(this);
            }
            return result;
        }
        return false;
    };
    /**
     * method to replace a view model property with another view model value
     * @param path - path to the view model property
     * @param value - view model that will replace the original
     */
    ViewModelInstance.prototype.replaceViewModel = function (path, value) {
        var _a;
        var pathSegments = path.split("/");
        var viewModelInstance = pathSegments.length > 1
            ? this.viewModelFromPathSegments(pathSegments.slice(0, pathSegments.length - 1), 0)
            : this;
        return ((_a = viewModelInstance === null || viewModelInstance === void 0 ? void 0 : viewModelInstance.internalReplaceViewModel(pathSegments[pathSegments.length - 1], value)) !== null && _a !== void 0 ? _a : false);
    };
    /*
     * method to add one to the reference counter of the instance.
     * Use if the file owning the reference is destroyed but the instance needs to stay around
     */
    ViewModelInstance.prototype.incrementReferenceCount = function () {
        var _a;
        this._referenceCount++;
        (_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.incrementReferenceCount();
    };
    /*
     * method to subtract one to the reference counter of the instance.
     * Use if incrementReferenceCount has been called
     */
    ViewModelInstance.prototype.decrementReferenceCount = function () {
        var _a;
        this._referenceCount--;
        (_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.decrementReferenceCount();
    };
    Object.defineProperty(ViewModelInstance.prototype, "properties", {
        get: function () {
            var _a;
            return (((_a = this._runtimeInstance) === null || _a === void 0 ? void 0 : _a.getProperties().map(function (prop) { return (__assign({}, prop)); })) || []);
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstance.prototype.internalIncrementReferenceCount = function () {
        this._referenceCount++;
    };
    ViewModelInstance.prototype.cleanup = function () {
        var _this = this;
        this._referenceCount--;
        if (this._referenceCount <= 0) {
            this._runtimeInstance = null;
            this.clearCallbacks();
            this._propertiesWithCallbacks = [];
            this._viewModelInstances.forEach(function (value) {
                value.cleanup();
            });
            this._viewModelInstances.clear();
            var children = __spreadArray([], this._children, true);
            this._children.length = 0;
            var parents = __spreadArray([], this._parents, true);
            this._parents.length = 0;
            children.forEach(function (child) {
                child.removeParent(_this);
            });
            parents.forEach(function (parent) {
                parent.removeFromViewModelCallbacks(_this);
            });
        }
    };
    return ViewModelInstance;
}());

var ViewModelInstanceValue = /** @class */ (function () {
    function ViewModelInstanceValue(instance, parent) {
        this.callbacks = [];
        this._viewModelInstanceValue = instance;
        this._parentViewModel = parent;
    }
    ViewModelInstanceValue.prototype.on = function (callback) {
        // Since we don't clean the changed flag for properties that don't have listeners,
        // we clean it the first time we add a listener to it
        if (this.callbacks.length === 0) {
            this._viewModelInstanceValue.clearChanges();
        }
        if (!this.callbacks.includes(callback)) {
            this.callbacks.push(callback);
            this._parentViewModel.addToPropertyCallbacks(this);
        }
    };
    ViewModelInstanceValue.prototype.off = function (callback) {
        if (!callback) {
            this.callbacks.length = 0;
        }
        else {
            this.callbacks = this.callbacks.filter(function (cb) { return cb !== callback; });
        }
        if (this.callbacks.length === 0) {
            this._parentViewModel.removeFromPropertyCallbacks(this);
        }
    };
    ViewModelInstanceValue.prototype.internalHandleCallback = function (callback) { };
    ViewModelInstanceValue.prototype.handleCallbacks = function () {
        var _this = this;
        if (this._viewModelInstanceValue.hasChanged) {
            this.callbacks.forEach(function (callback) {
                _this.internalHandleCallback(callback);
            });
        }
    };
    ViewModelInstanceValue.prototype.clearChanges = function () {
        this._viewModelInstanceValue.clearChanges();
    };
    ViewModelInstanceValue.prototype.clearCallbacks = function () {
        this.callbacks.length = 0;
    };
    Object.defineProperty(ViewModelInstanceValue.prototype, "name", {
        get: function () {
            return this._viewModelInstanceValue.name;
        },
        enumerable: false,
        configurable: true
    });
    return ViewModelInstanceValue;
}());

var ViewModelInstanceString = /** @class */ (function (_super) {
    __extends(ViewModelInstanceString, _super);
    function ViewModelInstanceString(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    Object.defineProperty(ViewModelInstanceString.prototype, "value", {
        get: function () {
            return this._viewModelInstanceValue.value;
        },
        set: function (val) {
            this._viewModelInstanceValue.value = val;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceString.prototype.internalHandleCallback = function (callback) {
        callback(this.value);
    };
    return ViewModelInstanceString;
}(ViewModelInstanceValue));

var ViewModelInstanceNumber = /** @class */ (function (_super) {
    __extends(ViewModelInstanceNumber, _super);
    function ViewModelInstanceNumber(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    Object.defineProperty(ViewModelInstanceNumber.prototype, "value", {
        get: function () {
            return this._viewModelInstanceValue.value;
        },
        set: function (val) {
            this._viewModelInstanceValue.value = val;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceNumber.prototype.internalHandleCallback = function (callback) {
        callback(this.value);
    };
    return ViewModelInstanceNumber;
}(ViewModelInstanceValue));

var ViewModelInstanceBoolean = /** @class */ (function (_super) {
    __extends(ViewModelInstanceBoolean, _super);
    function ViewModelInstanceBoolean(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    Object.defineProperty(ViewModelInstanceBoolean.prototype, "value", {
        get: function () {
            return this._viewModelInstanceValue.value;
        },
        set: function (val) {
            this._viewModelInstanceValue.value = val;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceBoolean.prototype.internalHandleCallback = function (callback) {
        callback(this.value);
    };
    return ViewModelInstanceBoolean;
}(ViewModelInstanceValue));

var ViewModelInstanceTrigger = /** @class */ (function (_super) {
    __extends(ViewModelInstanceTrigger, _super);
    function ViewModelInstanceTrigger(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    ViewModelInstanceTrigger.prototype.trigger = function () {
        return this._viewModelInstanceValue.trigger();
    };
    ViewModelInstanceTrigger.prototype.internalHandleCallback = function (callback) {
        callback();
    };
    return ViewModelInstanceTrigger;
}(ViewModelInstanceValue));

var ViewModelInstanceEnum = /** @class */ (function (_super) {
    __extends(ViewModelInstanceEnum, _super);
    function ViewModelInstanceEnum(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    Object.defineProperty(ViewModelInstanceEnum.prototype, "value", {
        get: function () {
            return this._viewModelInstanceValue.value;
        },
        set: function (val) {
            this._viewModelInstanceValue.value = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewModelInstanceEnum.prototype, "valueIndex", {
        get: function () {
            return this._viewModelInstanceValue
                .valueIndex;
        },
        set: function (val) {
            this._viewModelInstanceValue.valueIndex = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewModelInstanceEnum.prototype, "values", {
        get: function () {
            return this._viewModelInstanceValue.values;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceEnum.prototype.internalHandleCallback = function (callback) {
        callback(this.value);
    };
    return ViewModelInstanceEnum;
}(ViewModelInstanceValue));

var ViewModelInstanceList = /** @class */ (function (_super) {
    __extends(ViewModelInstanceList, _super);
    function ViewModelInstanceList(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    Object.defineProperty(ViewModelInstanceList.prototype, "length", {
        get: function () {
            return this._viewModelInstanceValue.size;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceList.prototype.addInstance = function (instance) {
        if (instance.runtimeInstance != null) {
            this._viewModelInstanceValue.addInstance(instance.runtimeInstance);
        }
    };
    ViewModelInstanceList.prototype.removeInstance = function (instance) {
        if (instance.runtimeInstance != null) {
            this._viewModelInstanceValue.removeInstance(instance.runtimeInstance);
        }
    };
    ViewModelInstanceList.prototype.removeInstanceAt = function (index) {
        this._viewModelInstanceValue.removeInstanceAt(index);
    };
    ViewModelInstanceList.prototype.instanceAt = function (index) {
        var runtimeInstance = this._viewModelInstanceValue.instanceAt(index);
        if (runtimeInstance != null) {
            var viewModelInstance = new ViewModelInstance(runtimeInstance, null);
            return viewModelInstance;
        }
        return null;
    };
    ViewModelInstanceList.prototype.internalHandleCallback = function (callback) {
        callback();
    };
    return ViewModelInstanceList;
}(ViewModelInstanceValue));

var ViewModelInstanceColor = /** @class */ (function (_super) {
    __extends(ViewModelInstanceColor, _super);
    function ViewModelInstanceColor(instance, parent) {
        return _super.call(this, instance, parent) || this;
    }
    Object.defineProperty(ViewModelInstanceColor.prototype, "value", {
        get: function () {
            return this._viewModelInstanceValue.value;
        },
        set: function (val) {
            this._viewModelInstanceValue.value = val;
        },
        enumerable: false,
        configurable: true
    });
    ViewModelInstanceColor.prototype.rgb = function (r, g, b) {
        this._viewModelInstanceValue.rgb(r, g, b);
    };
    ViewModelInstanceColor.prototype.rgba = function (r, g, b, a) {
        this._viewModelInstanceValue.argb(a, r, g, b);
    };
    ViewModelInstanceColor.prototype.argb = function (a, r, g, b) {
        this._viewModelInstanceValue.argb(a, r, g, b);
    };
    // Value 0 to 255
    ViewModelInstanceColor.prototype.alpha = function (a) {
        this._viewModelInstanceValue.alpha(a);
    };
    // Value 0 to 1
    ViewModelInstanceColor.prototype.opacity = function (o) {
        this._viewModelInstanceValue.alpha(Math.round(Math.max(0, Math.min(1, o)) * 255));
    };
    ViewModelInstanceColor.prototype.internalHandleCallback = function (callback) {
        callback(this.value);
    };
    return ViewModelInstanceColor;
}(ViewModelInstanceValue));

// Loads Rive data from a URI via fetch.
var loadRiveFile = function (src) { return __awaiter(void 0, void 0, void 0, function () {
    var req, res, buffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                req = new Request(src);
                return [4 /*yield*/, fetch(req)];
            case 1:
                res = _a.sent();
                return [4 /*yield*/, res.arrayBuffer()];
            case 2:
                buffer = _a.sent();
                return [2 /*return*/, buffer];
        }
    });
}); };
// #endregion
// #region utility functions
/*
 * Utility function to ensure an object is a string array
 */
var mapToStringArray = function (obj) {
    if (typeof obj === "string") {
        return [obj];
    }
    else if (obj instanceof Array) {
        return obj;
    }
    // If obj is undefined, return empty array
    return [];
};
// #endregion
// #region testing utilities
// Exports to only be used for tests
var Testing = {
    EventManager: EventManager,
    TaskQueueManager: TaskQueueManager,
};
// #endregion
// #region asset loaders
/**
 * Decodes bytes into an audio asset.
 *
 * Be sure to call `.unref()` on the audio once it is no longer needed. This
 * allows the engine to clean it up when it is not used by any more animations.
 */
var decodeAudio = function (bytes) {
    return new Promise(function (resolve) {
        return RuntimeLoader.getInstance(function (rive) {
            rive.decodeAudio(bytes, resolve);
        });
    });
};
/**
 * Decodes bytes into an image.
 *
 * Be sure to call `.unref()` on the image once it is no longer needed. This
 * allows the engine to clean it up when it is not used by any more animations.
 */
var decodeImage = function (bytes) {
    return new Promise(function (resolve) {
        return RuntimeLoader.getInstance(function (rive) {
            rive.decodeImage(bytes, resolve);
        });
    });
};
/**
 * Decodes bytes into a font.
 *
 * Be sure to call `.unref()` on the font once it is no longer needed. This
 * allows the engine to clean it up when it is not used by any more animations.
 */
var decodeFont = function (bytes) {
    return new Promise(function (resolve) {
        return RuntimeLoader.getInstance(function (rive) {
            rive.decodeFont(bytes, resolve);
        });
    });
};
// #endregion

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=rive.js.map