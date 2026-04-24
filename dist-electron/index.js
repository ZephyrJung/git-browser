var Bl = Object.defineProperty;
var Cl = (t, e, r) => e in t ? Bl(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var Yn = (t, e, r) => Cl(t, typeof e != "symbol" ? e + "" : e, r);
import { app as wr, BrowserWindow as bs, ipcMain as ot, screen as Dl, dialog as Nl } from "electron";
import Fl from "node:path";
import { execSync as de, spawn as jl } from "child_process";
import At from "fs";
import xn from "path";
import Ul from "os";
import Ml from "buffer";
import zl from "crypto";
const Ll = {
  showHiddenFiles: !0,
  showLineNumbers: !0,
  theme: "light",
  defaultMode: "command",
  requireConfirmation: !0,
  maxRecentFiles: 10,
  credentials: {
    sshKeys: [],
    httpCredentials: []
  }
}, Ti = {
  settings: Ll,
  recentRepos: [],
  recentFiles: []
};
class Hl {
  constructor() {
    Yn(this, "storePath");
    Yn(this, "data");
    const e = xn.join(Ul.homedir(), ".config", "git-browser");
    At.existsSync(e) || At.mkdirSync(e, { recursive: !0 }), this.storePath = xn.join(e, "config.json"), this.data = this.load();
  }
  load() {
    try {
      if (!At.existsSync(this.storePath))
        return Ti;
      const e = At.readFileSync(this.storePath, "utf-8");
      return JSON.parse(e);
    } catch (e) {
      return console.error("Failed to load config, using default:", e), Ti;
    }
  }
  save() {
    try {
      At.writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save config:", e);
    }
  }
  getSettings() {
    return this.data.settings;
  }
  setSettings(e) {
    this.data.settings = e, this.save();
  }
  getRecentRepos() {
    return this.data.recentRepos;
  }
  addRecentRepo(e) {
    this.data.recentRepos = this.data.recentRepos.filter((r) => r !== e), this.data.recentRepos.unshift(e), this.data.recentRepos = this.data.recentRepos.slice(0, 10), this.save();
  }
  getRecentFiles() {
    return this.data.recentFiles || (this.data.recentFiles = []), this.data.recentFiles;
  }
  addRecentFile(e, r) {
    this.data.recentFiles || (this.data.recentFiles = []), this.data.recentFiles = this.data.recentFiles.filter((n) => n !== e), this.data.recentFiles.unshift(e), this.data.recentFiles = this.data.recentFiles.slice(0, r), this.save();
  }
}
const Fn = new Hl();
var vs = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, P = {}, pt = function(t) {
  if (t = t || {}, this.Promise = t.Promise || Promise, this.queues = /* @__PURE__ */ Object.create(null), this.domainReentrant = t.domainReentrant || !1, this.domainReentrant) {
    if (typeof process > "u" || typeof process.domain > "u")
      throw new Error(
        "Domain-reentrant locks require `process.domain` to exist. Please flip `opts.domainReentrant = false`, use a NodeJS version that still implements Domain, or install a browser polyfill."
      );
    this.domains = /* @__PURE__ */ Object.create(null);
  }
  this.timeout = t.timeout || pt.DEFAULT_TIMEOUT, this.maxOccupationTime = t.maxOccupationTime || pt.DEFAULT_MAX_OCCUPATION_TIME, this.maxExecutionTime = t.maxExecutionTime || pt.DEFAULT_MAX_EXECUTION_TIME, t.maxPending === 1 / 0 || Number.isInteger(t.maxPending) && t.maxPending >= 0 ? this.maxPending = t.maxPending : this.maxPending = pt.DEFAULT_MAX_PENDING;
};
pt.DEFAULT_TIMEOUT = 0;
pt.DEFAULT_MAX_OCCUPATION_TIME = 0;
pt.DEFAULT_MAX_EXECUTION_TIME = 0;
pt.DEFAULT_MAX_PENDING = 1e3;
pt.prototype.acquire = function(t, e, r, n) {
  if (Array.isArray(t))
    return this._acquireBatch(t, e, r, n);
  if (typeof e != "function")
    throw new Error("You must pass a function to execute");
  var a = null, i = null, o = null;
  typeof r != "function" && (n = r, r = null, o = new this.Promise(function(_, v) {
    a = _, i = v;
  })), n = n || {};
  var s = !1, l = null, f = null, c = null, u = this, d = function(_, v, S) {
    f && (clearTimeout(f), f = null), c && (clearTimeout(c), c = null), _ && (u.queues[t] && u.queues[t].length === 0 && delete u.queues[t], u.domainReentrant && delete u.domains[t]), s || (o ? v ? i(v) : a(S) : typeof r == "function" && r(v, S), s = !0), _ && u.queues[t] && u.queues[t].length > 0 && u.queues[t].shift()();
  }, h = function(_) {
    if (s)
      return d(_);
    l && (clearTimeout(l), l = null), u.domainReentrant && _ && (u.domains[t] = process.domain);
    var v = n.maxExecutionTime || u.maxExecutionTime;
    if (v && (c = setTimeout(function() {
      u.queues[t] && d(_, new Error("Maximum execution time is exceeded " + t));
    }, v)), e.length === 1) {
      var S = !1;
      try {
        e(function(k, O) {
          S || (S = !0, d(_, k, O));
        });
      } catch (k) {
        S || (S = !0, d(_, k));
      }
    } else
      u._promiseTry(function() {
        return e();
      }).then(function(k) {
        d(_, void 0, k);
      }, function(k) {
        d(_, k);
      });
  };
  u.domainReentrant && process.domain && (h = process.domain.bind(h));
  var w = n.maxPending || u.maxPending;
  if (!u.queues[t])
    u.queues[t] = [], h(!0);
  else if (u.domainReentrant && process.domain && process.domain === u.domains[t])
    h(!1);
  else if (u.queues[t].length >= w)
    d(!1, new Error("Too many pending tasks in queue " + t));
  else {
    var p = function() {
      h(!0);
    };
    n.skipQueue ? u.queues[t].unshift(p) : u.queues[t].push(p);
    var m = n.timeout || u.timeout;
    m && (l = setTimeout(function() {
      l = null, d(!1, new Error("async-lock timed out in queue " + t));
    }, m));
  }
  var y = n.maxOccupationTime || u.maxOccupationTime;
  if (y && (f = setTimeout(function() {
    u.queues[t] && d(!1, new Error("Maximum occupation time is exceeded in queue " + t));
  }, y)), o)
    return o;
};
pt.prototype._acquireBatch = function(t, e, r, n) {
  typeof r != "function" && (n = r, r = null);
  var a = this, i = function(s, l) {
    return function(f) {
      a.acquire(s, l, f, n);
    };
  }, o = t.reduceRight(function(s, l) {
    return i(l, s);
  }, e);
  if (typeof r == "function")
    o(r);
  else
    return new this.Promise(function(s, l) {
      o.length === 1 ? o(function(f, c) {
        f ? l(f) : s(c);
      }) : s(o());
    });
};
pt.prototype.isBusy = function(t) {
  return t ? !!this.queues[t] : Object.keys(this.queues).length > 0;
};
pt.prototype._promiseTry = function(t) {
  try {
    return this.Promise.resolve(t());
  } catch (e) {
    return this.Promise.reject(e);
  }
};
var Gl = pt, Wl = Gl, Wa = { exports: {} }, an = { exports: {} }, Ii;
function ql() {
  return Ii || (Ii = 1, typeof Object.create == "function" ? an.exports = function(e, r) {
    r && (e.super_ = r, e.prototype = Object.create(r.prototype, {
      constructor: {
        value: e,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }));
  } : an.exports = function(e, r) {
    if (r) {
      e.super_ = r;
      var n = function() {
      };
      n.prototype = r.prototype, e.prototype = new n(), e.prototype.constructor = e;
    }
  }), an.exports;
}
try {
  var Pi = require("util");
  if (typeof Pi.inherits != "function") throw "";
  Wa.exports = Pi.inherits;
} catch {
  Wa.exports = ql();
}
var Zl = Wa.exports, qa = { exports: {} };
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
(function(t, e) {
  var r = Ml, n = r.Buffer;
  function a(o, s) {
    for (var l in o)
      s[l] = o[l];
  }
  n.from && n.alloc && n.allocUnsafe && n.allocUnsafeSlow ? t.exports = r : (a(r, e), e.Buffer = i);
  function i(o, s, l) {
    return n(o, s, l);
  }
  i.prototype = Object.create(n.prototype), a(n, i), i.from = function(o, s, l) {
    if (typeof o == "number")
      throw new TypeError("Argument must not be a number");
    return n(o, s, l);
  }, i.alloc = function(o, s, l) {
    if (typeof o != "number")
      throw new TypeError("Argument must be a number");
    var f = n(o);
    return s !== void 0 ? typeof l == "string" ? f.fill(s, l) : f.fill(s) : f.fill(0), f;
  }, i.allocUnsafe = function(o) {
    if (typeof o != "number")
      throw new TypeError("Argument must be a number");
    return n(o);
  }, i.allocUnsafeSlow = function(o) {
    if (typeof o != "number")
      throw new TypeError("Argument must be a number");
    return r.SlowBuffer(o);
  };
})(qa, qa.exports);
var si = qa.exports, Vl = {}.toString, Xl = Array.isArray || function(t) {
  return Vl.call(t) == "[object Array]";
}, Ar = TypeError, xs = Object, Kl = Error, Yl = EvalError, Jl = RangeError, Ql = ReferenceError, Es = SyntaxError, tu = URIError, eu = Math.abs, ru = Math.floor, nu = Math.max, au = Math.min, iu = Math.pow, ou = Math.round, su = Number.isNaN || function(e) {
  return e !== e;
}, cu = su, fu = function(e) {
  return cu(e) || e === 0 ? e : e < 0 ? -1 : 1;
}, lu = Object.getOwnPropertyDescriptor, wn = lu;
if (wn)
  try {
    wn([], "length");
  } catch {
    wn = null;
  }
var $r = wn, pn = Object.defineProperty || !1;
if (pn)
  try {
    pn({}, "a", { value: 1 });
  } catch {
    pn = !1;
  }
var jn = pn, Jn, Bi;
function Ss() {
  return Bi || (Bi = 1, Jn = function() {
    if (typeof Symbol != "function" || typeof Object.getOwnPropertySymbols != "function")
      return !1;
    if (typeof Symbol.iterator == "symbol")
      return !0;
    var e = {}, r = Symbol("test"), n = Object(r);
    if (typeof r == "string" || Object.prototype.toString.call(r) !== "[object Symbol]" || Object.prototype.toString.call(n) !== "[object Symbol]")
      return !1;
    var a = 42;
    e[r] = a;
    for (var i in e)
      return !1;
    if (typeof Object.keys == "function" && Object.keys(e).length !== 0 || typeof Object.getOwnPropertyNames == "function" && Object.getOwnPropertyNames(e).length !== 0)
      return !1;
    var o = Object.getOwnPropertySymbols(e);
    if (o.length !== 1 || o[0] !== r || !Object.prototype.propertyIsEnumerable.call(e, r))
      return !1;
    if (typeof Object.getOwnPropertyDescriptor == "function") {
      var s = (
        /** @type {PropertyDescriptor} */
        Object.getOwnPropertyDescriptor(e, r)
      );
      if (s.value !== a || s.enumerable !== !0)
        return !1;
    }
    return !0;
  }), Jn;
}
var Qn, Ci;
function uu() {
  if (Ci) return Qn;
  Ci = 1;
  var t = typeof Symbol < "u" && Symbol, e = Ss();
  return Qn = function() {
    return typeof t != "function" || typeof Symbol != "function" || typeof t("foo") != "symbol" || typeof Symbol("bar") != "symbol" ? !1 : e();
  }, Qn;
}
var ta, Di;
function ks() {
  return Di || (Di = 1, ta = typeof Reflect < "u" && Reflect.getPrototypeOf || null), ta;
}
var ea, Ni;
function As() {
  if (Ni) return ea;
  Ni = 1;
  var t = xs;
  return ea = t.getPrototypeOf || null, ea;
}
var du = "Function.prototype.bind called on incompatible ", hu = Object.prototype.toString, wu = Math.max, pu = "[object Function]", Fi = function(e, r) {
  for (var n = [], a = 0; a < e.length; a += 1)
    n[a] = e[a];
  for (var i = 0; i < r.length; i += 1)
    n[i + e.length] = r[i];
  return n;
}, mu = function(e, r) {
  for (var n = [], a = r, i = 0; a < e.length; a += 1, i += 1)
    n[i] = e[a];
  return n;
}, gu = function(t, e) {
  for (var r = "", n = 0; n < t.length; n += 1)
    r += t[n], n + 1 < t.length && (r += e);
  return r;
}, yu = function(e) {
  var r = this;
  if (typeof r != "function" || hu.apply(r) !== pu)
    throw new TypeError(du + r);
  for (var n = mu(arguments, 1), a, i = function() {
    if (this instanceof a) {
      var c = r.apply(
        this,
        Fi(n, arguments)
      );
      return Object(c) === c ? c : this;
    }
    return r.apply(
      e,
      Fi(n, arguments)
    );
  }, o = wu(0, r.length - n.length), s = [], l = 0; l < o; l++)
    s[l] = "$" + l;
  if (a = Function("binder", "return function (" + gu(s, ",") + "){ return binder.apply(this,arguments); }")(i), r.prototype) {
    var f = function() {
    };
    f.prototype = r.prototype, a.prototype = new f(), f.prototype = null;
  }
  return a;
}, _u = yu, Rr = Function.prototype.bind || _u, ci = Function.prototype.call, fi = Function.prototype.apply, bu = typeof Reflect < "u" && Reflect && Reflect.apply, vu = Rr, xu = fi, Eu = ci, Su = bu, $s = Su || vu.call(Eu, xu), ku = Rr, Au = Ar, $u = ci, Ru = $s, li = function(e) {
  if (e.length < 1 || typeof e[0] != "function")
    throw new Au("a function is required");
  return Ru(ku, $u, e);
}, ra, ji;
function Ou() {
  if (ji) return ra;
  ji = 1;
  var t = li, e = $r, r;
  try {
    r = /** @type {{ __proto__?: typeof Array.prototype }} */
    [].__proto__ === Array.prototype;
  } catch (o) {
    if (!o || typeof o != "object" || !("code" in o) || o.code !== "ERR_PROTO_ACCESS")
      throw o;
  }
  var n = !!r && e && e(
    Object.prototype,
    /** @type {keyof typeof Object.prototype} */
    "__proto__"
  ), a = Object, i = a.getPrototypeOf;
  return ra = n && typeof n.get == "function" ? t([n.get]) : typeof i == "function" ? (
    /** @type {import('./get')} */
    function(s) {
      return i(s == null ? s : a(s));
    }
  ) : !1, ra;
}
var na, Ui;
function Rs() {
  if (Ui) return na;
  Ui = 1;
  var t = ks(), e = As(), r = Ou();
  return na = t ? function(a) {
    return t(a);
  } : e ? function(a) {
    if (!a || typeof a != "object" && typeof a != "function")
      throw new TypeError("getProto: not an object");
    return e(a);
  } : r ? function(a) {
    return r(a);
  } : null, na;
}
var aa, Mi;
function Tu() {
  if (Mi) return aa;
  Mi = 1;
  var t = Function.prototype.call, e = Object.prototype.hasOwnProperty, r = Rr;
  return aa = r.call(t, e), aa;
}
var j, Iu = xs, Pu = Kl, Bu = Yl, Cu = Jl, Du = Ql, Me = Es, Ne = Ar, Nu = tu, Fu = eu, ju = ru, Uu = nu, Mu = au, zu = iu, Lu = ou, Hu = fu, Os = Function, ia = function(t) {
  try {
    return Os('"use strict"; return (' + t + ").constructor;")();
  } catch {
  }
}, pr = $r, Gu = jn, oa = function() {
  throw new Ne();
}, Wu = pr ? function() {
  try {
    return arguments.callee, oa;
  } catch {
    try {
      return pr(arguments, "callee").get;
    } catch {
      return oa;
    }
  }
}() : oa, Ie = uu()(), et = Rs(), qu = As(), Zu = ks(), Ts = fi, Or = ci, Ce = {}, Vu = typeof Uint8Array > "u" || !et ? j : et(Uint8Array), ye = {
  __proto__: null,
  "%AggregateError%": typeof AggregateError > "u" ? j : AggregateError,
  "%Array%": Array,
  "%ArrayBuffer%": typeof ArrayBuffer > "u" ? j : ArrayBuffer,
  "%ArrayIteratorPrototype%": Ie && et ? et([][Symbol.iterator]()) : j,
  "%AsyncFromSyncIteratorPrototype%": j,
  "%AsyncFunction%": Ce,
  "%AsyncGenerator%": Ce,
  "%AsyncGeneratorFunction%": Ce,
  "%AsyncIteratorPrototype%": Ce,
  "%Atomics%": typeof Atomics > "u" ? j : Atomics,
  "%BigInt%": typeof BigInt > "u" ? j : BigInt,
  "%BigInt64Array%": typeof BigInt64Array > "u" ? j : BigInt64Array,
  "%BigUint64Array%": typeof BigUint64Array > "u" ? j : BigUint64Array,
  "%Boolean%": Boolean,
  "%DataView%": typeof DataView > "u" ? j : DataView,
  "%Date%": Date,
  "%decodeURI%": decodeURI,
  "%decodeURIComponent%": decodeURIComponent,
  "%encodeURI%": encodeURI,
  "%encodeURIComponent%": encodeURIComponent,
  "%Error%": Pu,
  "%eval%": eval,
  // eslint-disable-line no-eval
  "%EvalError%": Bu,
  "%Float16Array%": typeof Float16Array > "u" ? j : Float16Array,
  "%Float32Array%": typeof Float32Array > "u" ? j : Float32Array,
  "%Float64Array%": typeof Float64Array > "u" ? j : Float64Array,
  "%FinalizationRegistry%": typeof FinalizationRegistry > "u" ? j : FinalizationRegistry,
  "%Function%": Os,
  "%GeneratorFunction%": Ce,
  "%Int8Array%": typeof Int8Array > "u" ? j : Int8Array,
  "%Int16Array%": typeof Int16Array > "u" ? j : Int16Array,
  "%Int32Array%": typeof Int32Array > "u" ? j : Int32Array,
  "%isFinite%": isFinite,
  "%isNaN%": isNaN,
  "%IteratorPrototype%": Ie && et ? et(et([][Symbol.iterator]())) : j,
  "%JSON%": typeof JSON == "object" ? JSON : j,
  "%Map%": typeof Map > "u" ? j : Map,
  "%MapIteratorPrototype%": typeof Map > "u" || !Ie || !et ? j : et((/* @__PURE__ */ new Map())[Symbol.iterator]()),
  "%Math%": Math,
  "%Number%": Number,
  "%Object%": Iu,
  "%Object.getOwnPropertyDescriptor%": pr,
  "%parseFloat%": parseFloat,
  "%parseInt%": parseInt,
  "%Promise%": typeof Promise > "u" ? j : Promise,
  "%Proxy%": typeof Proxy > "u" ? j : Proxy,
  "%RangeError%": Cu,
  "%ReferenceError%": Du,
  "%Reflect%": typeof Reflect > "u" ? j : Reflect,
  "%RegExp%": RegExp,
  "%Set%": typeof Set > "u" ? j : Set,
  "%SetIteratorPrototype%": typeof Set > "u" || !Ie || !et ? j : et((/* @__PURE__ */ new Set())[Symbol.iterator]()),
  "%SharedArrayBuffer%": typeof SharedArrayBuffer > "u" ? j : SharedArrayBuffer,
  "%String%": String,
  "%StringIteratorPrototype%": Ie && et ? et(""[Symbol.iterator]()) : j,
  "%Symbol%": Ie ? Symbol : j,
  "%SyntaxError%": Me,
  "%ThrowTypeError%": Wu,
  "%TypedArray%": Vu,
  "%TypeError%": Ne,
  "%Uint8Array%": typeof Uint8Array > "u" ? j : Uint8Array,
  "%Uint8ClampedArray%": typeof Uint8ClampedArray > "u" ? j : Uint8ClampedArray,
  "%Uint16Array%": typeof Uint16Array > "u" ? j : Uint16Array,
  "%Uint32Array%": typeof Uint32Array > "u" ? j : Uint32Array,
  "%URIError%": Nu,
  "%WeakMap%": typeof WeakMap > "u" ? j : WeakMap,
  "%WeakRef%": typeof WeakRef > "u" ? j : WeakRef,
  "%WeakSet%": typeof WeakSet > "u" ? j : WeakSet,
  "%Function.prototype.call%": Or,
  "%Function.prototype.apply%": Ts,
  "%Object.defineProperty%": Gu,
  "%Object.getPrototypeOf%": qu,
  "%Math.abs%": Fu,
  "%Math.floor%": ju,
  "%Math.max%": Uu,
  "%Math.min%": Mu,
  "%Math.pow%": zu,
  "%Math.round%": Lu,
  "%Math.sign%": Hu,
  "%Reflect.getPrototypeOf%": Zu
};
if (et)
  try {
    null.error;
  } catch (t) {
    var Xu = et(et(t));
    ye["%Error.prototype%"] = Xu;
  }
var Ku = function t(e) {
  var r;
  if (e === "%AsyncFunction%")
    r = ia("async function () {}");
  else if (e === "%GeneratorFunction%")
    r = ia("function* () {}");
  else if (e === "%AsyncGeneratorFunction%")
    r = ia("async function* () {}");
  else if (e === "%AsyncGenerator%") {
    var n = t("%AsyncGeneratorFunction%");
    n && (r = n.prototype);
  } else if (e === "%AsyncIteratorPrototype%") {
    var a = t("%AsyncGenerator%");
    a && et && (r = et(a.prototype));
  }
  return ye[e] = r, r;
}, zi = {
  __proto__: null,
  "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
  "%ArrayPrototype%": ["Array", "prototype"],
  "%ArrayProto_entries%": ["Array", "prototype", "entries"],
  "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
  "%ArrayProto_keys%": ["Array", "prototype", "keys"],
  "%ArrayProto_values%": ["Array", "prototype", "values"],
  "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
  "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
  "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
  "%BooleanPrototype%": ["Boolean", "prototype"],
  "%DataViewPrototype%": ["DataView", "prototype"],
  "%DatePrototype%": ["Date", "prototype"],
  "%ErrorPrototype%": ["Error", "prototype"],
  "%EvalErrorPrototype%": ["EvalError", "prototype"],
  "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
  "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
  "%FunctionPrototype%": ["Function", "prototype"],
  "%Generator%": ["GeneratorFunction", "prototype"],
  "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
  "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
  "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
  "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
  "%JSONParse%": ["JSON", "parse"],
  "%JSONStringify%": ["JSON", "stringify"],
  "%MapPrototype%": ["Map", "prototype"],
  "%NumberPrototype%": ["Number", "prototype"],
  "%ObjectPrototype%": ["Object", "prototype"],
  "%ObjProto_toString%": ["Object", "prototype", "toString"],
  "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
  "%PromisePrototype%": ["Promise", "prototype"],
  "%PromiseProto_then%": ["Promise", "prototype", "then"],
  "%Promise_all%": ["Promise", "all"],
  "%Promise_reject%": ["Promise", "reject"],
  "%Promise_resolve%": ["Promise", "resolve"],
  "%RangeErrorPrototype%": ["RangeError", "prototype"],
  "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
  "%RegExpPrototype%": ["RegExp", "prototype"],
  "%SetPrototype%": ["Set", "prototype"],
  "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
  "%StringPrototype%": ["String", "prototype"],
  "%SymbolPrototype%": ["Symbol", "prototype"],
  "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
  "%TypedArrayPrototype%": ["TypedArray", "prototype"],
  "%TypeErrorPrototype%": ["TypeError", "prototype"],
  "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
  "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
  "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
  "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
  "%URIErrorPrototype%": ["URIError", "prototype"],
  "%WeakMapPrototype%": ["WeakMap", "prototype"],
  "%WeakSetPrototype%": ["WeakSet", "prototype"]
}, Tr = Rr, En = Tu(), Yu = Tr.call(Or, Array.prototype.concat), Ju = Tr.call(Ts, Array.prototype.splice), Li = Tr.call(Or, String.prototype.replace), Sn = Tr.call(Or, String.prototype.slice), Qu = Tr.call(Or, RegExp.prototype.exec), td = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, ed = /\\(\\)?/g, rd = function(e) {
  var r = Sn(e, 0, 1), n = Sn(e, -1);
  if (r === "%" && n !== "%")
    throw new Me("invalid intrinsic syntax, expected closing `%`");
  if (n === "%" && r !== "%")
    throw new Me("invalid intrinsic syntax, expected opening `%`");
  var a = [];
  return Li(e, td, function(i, o, s, l) {
    a[a.length] = s ? Li(l, ed, "$1") : o || i;
  }), a;
}, nd = function(e, r) {
  var n = e, a;
  if (En(zi, n) && (a = zi[n], n = "%" + a[0] + "%"), En(ye, n)) {
    var i = ye[n];
    if (i === Ce && (i = Ku(n)), typeof i > "u" && !r)
      throw new Ne("intrinsic " + e + " exists, but is not available. Please file an issue!");
    return {
      alias: a,
      name: n,
      value: i
    };
  }
  throw new Me("intrinsic " + e + " does not exist!");
}, Is = function(e, r) {
  if (typeof e != "string" || e.length === 0)
    throw new Ne("intrinsic name must be a non-empty string");
  if (arguments.length > 1 && typeof r != "boolean")
    throw new Ne('"allowMissing" argument must be a boolean');
  if (Qu(/^%?[^%]*%?$/, e) === null)
    throw new Me("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
  var n = rd(e), a = n.length > 0 ? n[0] : "", i = nd("%" + a + "%", r), o = i.name, s = i.value, l = !1, f = i.alias;
  f && (a = f[0], Ju(n, Yu([0, 1], f)));
  for (var c = 1, u = !0; c < n.length; c += 1) {
    var d = n[c], h = Sn(d, 0, 1), w = Sn(d, -1);
    if ((h === '"' || h === "'" || h === "`" || w === '"' || w === "'" || w === "`") && h !== w)
      throw new Me("property names with quotes must have matching quotes");
    if ((d === "constructor" || !u) && (l = !0), a += "." + d, o = "%" + a + "%", En(ye, o))
      s = ye[o];
    else if (s != null) {
      if (!(d in s)) {
        if (!r)
          throw new Ne("base intrinsic for " + e + " exists, but the property is not available.");
        return;
      }
      if (pr && c + 1 >= n.length) {
        var p = pr(s, d);
        u = !!p, u && "get" in p && !("originalValue" in p.get) ? s = p.get : s = s[d];
      } else
        u = En(s, d), s = s[d];
      u && !l && (ye[o] = s);
    }
  }
  return s;
}, Ps = Is, Bs = li, ad = Bs([Ps("%String.prototype.indexOf%")]), Cs = function(e, r) {
  var n = (
    /** @type {(this: unknown, ...args: unknown[]) => unknown} */
    Ps(e, !!r)
  );
  return typeof n == "function" && ad(e, ".prototype.") > -1 ? Bs(
    /** @type {const} */
    [n]
  ) : n;
}, sa, Hi;
function id() {
  if (Hi) return sa;
  Hi = 1;
  var t = Function.prototype.toString, e = typeof Reflect == "object" && Reflect !== null && Reflect.apply, r, n;
  if (typeof e == "function" && typeof Object.defineProperty == "function")
    try {
      r = Object.defineProperty({}, "length", {
        get: function() {
          throw n;
        }
      }), n = {}, e(function() {
        throw 42;
      }, null, r);
    } catch (_) {
      _ !== n && (e = null);
    }
  else
    e = null;
  var a = /^\s*class\b/, i = function(v) {
    try {
      var S = t.call(v);
      return a.test(S);
    } catch {
      return !1;
    }
  }, o = function(v) {
    try {
      return i(v) ? !1 : (t.call(v), !0);
    } catch {
      return !1;
    }
  }, s = Object.prototype.toString, l = "[object Object]", f = "[object Function]", c = "[object GeneratorFunction]", u = "[object HTMLAllCollection]", d = "[object HTML document.all class]", h = "[object HTMLCollection]", w = typeof Symbol == "function" && !!Symbol.toStringTag, p = !(0 in [,]), m = function() {
    return !1;
  };
  if (typeof document == "object") {
    var y = document.all;
    s.call(y) === s.call(document.all) && (m = function(v) {
      if ((p || !v) && (typeof v > "u" || typeof v == "object"))
        try {
          var S = s.call(v);
          return (S === u || S === d || S === h || S === l) && v("") == null;
        } catch {
        }
      return !1;
    });
  }
  return sa = e ? function(v) {
    if (m(v))
      return !0;
    if (!v || typeof v != "function" && typeof v != "object")
      return !1;
    try {
      e(v, null, r);
    } catch (S) {
      if (S !== n)
        return !1;
    }
    return !i(v) && o(v);
  } : function(v) {
    if (m(v))
      return !0;
    if (!v || typeof v != "function" && typeof v != "object")
      return !1;
    if (w)
      return o(v);
    if (i(v))
      return !1;
    var S = s.call(v);
    return S !== f && S !== c && !/^\[object HTML/.test(S) ? !1 : o(v);
  }, sa;
}
var ca, Gi;
function od() {
  if (Gi) return ca;
  Gi = 1;
  var t = id(), e = Object.prototype.toString, r = Object.prototype.hasOwnProperty, n = function(l, f, c) {
    for (var u = 0, d = l.length; u < d; u++)
      r.call(l, u) && (c == null ? f(l[u], u, l) : f.call(c, l[u], u, l));
  }, a = function(l, f, c) {
    for (var u = 0, d = l.length; u < d; u++)
      c == null ? f(l.charAt(u), u, l) : f.call(c, l.charAt(u), u, l);
  }, i = function(l, f, c) {
    for (var u in l)
      r.call(l, u) && (c == null ? f(l[u], u, l) : f.call(c, l[u], u, l));
  };
  function o(s) {
    return e.call(s) === "[object Array]";
  }
  return ca = function(l, f, c) {
    if (!t(f))
      throw new TypeError("iterator must be a function");
    var u;
    arguments.length >= 3 && (u = c), o(l) ? n(l, f, u) : typeof l == "string" ? a(l, f, u) : i(l, f, u);
  }, ca;
}
var fa, Wi;
function sd() {
  return Wi || (Wi = 1, fa = [
    "Float16Array",
    "Float32Array",
    "Float64Array",
    "Int8Array",
    "Int16Array",
    "Int32Array",
    "Uint8Array",
    "Uint8ClampedArray",
    "Uint16Array",
    "Uint32Array",
    "BigInt64Array",
    "BigUint64Array"
  ]), fa;
}
var la, qi;
function cd() {
  if (qi) return la;
  qi = 1;
  var t = sd(), e = typeof globalThis > "u" ? vs : globalThis;
  return la = function() {
    for (var n = [], a = 0; a < t.length; a++)
      typeof e[t[a]] == "function" && (n[n.length] = t[a]);
    return n;
  }, la;
}
var ua = { exports: {} }, da, Zi;
function fd() {
  if (Zi) return da;
  Zi = 1;
  var t = jn, e = Es, r = Ar, n = $r;
  return da = function(i, o, s) {
    if (!i || typeof i != "object" && typeof i != "function")
      throw new r("`obj` must be an object or a function`");
    if (typeof o != "string" && typeof o != "symbol")
      throw new r("`property` must be a string or a symbol`");
    if (arguments.length > 3 && typeof arguments[3] != "boolean" && arguments[3] !== null)
      throw new r("`nonEnumerable`, if provided, must be a boolean or null");
    if (arguments.length > 4 && typeof arguments[4] != "boolean" && arguments[4] !== null)
      throw new r("`nonWritable`, if provided, must be a boolean or null");
    if (arguments.length > 5 && typeof arguments[5] != "boolean" && arguments[5] !== null)
      throw new r("`nonConfigurable`, if provided, must be a boolean or null");
    if (arguments.length > 6 && typeof arguments[6] != "boolean")
      throw new r("`loose`, if provided, must be a boolean");
    var l = arguments.length > 3 ? arguments[3] : null, f = arguments.length > 4 ? arguments[4] : null, c = arguments.length > 5 ? arguments[5] : null, u = arguments.length > 6 ? arguments[6] : !1, d = !!n && n(i, o);
    if (t)
      t(i, o, {
        configurable: c === null && d ? d.configurable : !c,
        enumerable: l === null && d ? d.enumerable : !l,
        value: s,
        writable: f === null && d ? d.writable : !f
      });
    else if (u || !l && !f && !c)
      i[o] = s;
    else
      throw new e("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
  }, da;
}
var ha, Vi;
function ld() {
  if (Vi) return ha;
  Vi = 1;
  var t = jn, e = function() {
    return !!t;
  };
  return e.hasArrayLengthDefineBug = function() {
    if (!t)
      return null;
    try {
      return t([], "length", { value: 1 }).length !== 1;
    } catch {
      return !0;
    }
  }, ha = e, ha;
}
var wa, Xi;
function ud() {
  if (Xi) return wa;
  Xi = 1;
  var t = Is, e = fd(), r = ld()(), n = $r, a = Ar, i = t("%Math.floor%");
  return wa = function(s, l) {
    if (typeof s != "function")
      throw new a("`fn` is not a function");
    if (typeof l != "number" || l < 0 || l > 4294967295 || i(l) !== l)
      throw new a("`length` must be a positive 32-bit integer");
    var f = arguments.length > 2 && !!arguments[2], c = !0, u = !0;
    if ("length" in s && n) {
      var d = n(s, "length");
      d && !d.configurable && (c = !1), d && !d.writable && (u = !1);
    }
    return (c || u || !f) && (r ? e(
      /** @type {Parameters<define>[0]} */
      s,
      "length",
      l,
      !0,
      !0
    ) : e(
      /** @type {Parameters<define>[0]} */
      s,
      "length",
      l
    )), s;
  }, wa;
}
var pa, Ki;
function dd() {
  if (Ki) return pa;
  Ki = 1;
  var t = Rr, e = fi, r = $s;
  return pa = function() {
    return r(t, e, arguments);
  }, pa;
}
var Yi;
function hd() {
  return Yi || (Yi = 1, function(t) {
    var e = ud(), r = jn, n = li, a = dd();
    t.exports = function(o) {
      var s = n(arguments), l = 1 + o.length - (arguments.length - 1);
      return e(
        s,
        l > 0 ? l : 0,
        !0
      );
    }, r ? r(t.exports, "apply", { value: a }) : t.exports.apply = a;
  }(ua)), ua.exports;
}
var ma, Ji;
function wd() {
  if (Ji) return ma;
  Ji = 1;
  var t = Ss();
  return ma = function() {
    return t() && !!Symbol.toStringTag;
  }, ma;
}
var ga, Qi;
function pd() {
  if (Qi) return ga;
  Qi = 1;
  var t = od(), e = cd(), r = hd(), n = Cs, a = $r, i = Rs(), o = n("Object.prototype.toString"), s = wd()(), l = typeof globalThis > "u" ? vs : globalThis, f = e(), c = n("String.prototype.slice"), u = n("Array.prototype.indexOf", !0) || function(m, y) {
    for (var _ = 0; _ < m.length; _ += 1)
      if (m[_] === y)
        return _;
    return -1;
  }, d = { __proto__: null };
  s && a && i ? t(f, function(p) {
    var m = new l[p]();
    if (Symbol.toStringTag in m && i) {
      var y = i(m), _ = a(y, Symbol.toStringTag);
      if (!_ && y) {
        var v = i(y);
        _ = a(v, Symbol.toStringTag);
      }
      if (_ && _.get) {
        var S = r(_.get);
        d[
          /** @type {`$${import('.').TypedArrayName}`} */
          "$" + p
        ] = S;
      }
    }
  }) : t(f, function(p) {
    var m = new l[p](), y = m.slice || m.set;
    if (y) {
      var _ = (
        /** @type {import('./types').BoundSlice | import('./types').BoundSet} */
        // @ts-expect-error TODO FIXME
        r(y)
      );
      d[
        /** @type {`$${import('.').TypedArrayName}`} */
        "$" + p
      ] = _;
    }
  });
  var h = function(m) {
    var y = !1;
    return t(
      /** @type {Record<`\$${import('.').TypedArrayName}`, Getter>} */
      d,
      /** @type {(getter: Getter, name: `\$${import('.').TypedArrayName}`) => void} */
      function(_, v) {
        if (!y)
          try {
            "$" + _(m) === v && (y = /** @type {import('.').TypedArrayName} */
            c(v, 1));
          } catch {
          }
      }
    ), y;
  }, w = function(m) {
    var y = !1;
    return t(
      /** @type {Record<`\$${import('.').TypedArrayName}`, Getter>} */
      d,
      /** @type {(getter: Getter, name: `\$${import('.').TypedArrayName}`) => void} */
      function(_, v) {
        if (!y)
          try {
            _(m), y = /** @type {import('.').TypedArrayName} */
            c(v, 1);
          } catch {
          }
      }
    ), y;
  };
  return ga = function(m) {
    if (!m || typeof m != "object")
      return !1;
    if (!s) {
      var y = c(o(m), 8, -1);
      return u(f, y) > -1 ? y : y !== "Object" ? !1 : w(m);
    }
    return a ? h(m) : null;
  }, ga;
}
var ya, to;
function md() {
  if (to) return ya;
  to = 1;
  var t = pd();
  return ya = function(r) {
    return !!t(r);
  }, ya;
}
var gd = Ar, yd = Cs, _d = yd("TypedArray.prototype.buffer", !0), bd = md(), vd = _d || function(e) {
  if (!bd(e))
    throw new gd("Not a Typed Array");
  return e.buffer;
}, kt = si.Buffer, xd = Xl, Ed = vd, Sd = ArrayBuffer.isView || function(e) {
  try {
    return Ed(e), !0;
  } catch {
    return !1;
  }
}, kd = typeof Uint8Array < "u", Ds = typeof ArrayBuffer < "u" && typeof Uint8Array < "u", Ad = Ds && (kt.prototype instanceof Uint8Array || kt.TYPED_ARRAY_SUPPORT), $d = function(e, r) {
  if (kt.isBuffer(e))
    return e.constructor && !("isBuffer" in e) ? kt.from(e) : e;
  if (typeof e == "string")
    return kt.from(e, r);
  if (Ds && Sd(e)) {
    if (e.byteLength === 0)
      return kt.alloc(0);
    if (Ad) {
      var n = kt.from(e.buffer, e.byteOffset, e.byteLength);
      if (n.byteLength === e.byteLength)
        return n;
    }
    var a = e instanceof Uint8Array ? e : new Uint8Array(e.buffer, e.byteOffset, e.byteLength), i = kt.from(a);
    if (i.length === e.byteLength)
      return i;
  }
  if (kd && e instanceof Uint8Array)
    return kt.from(e);
  var o = xd(e);
  if (o)
    for (var s = 0; s < e.length; s += 1) {
      var l = e[s];
      if (typeof l != "number" || l < 0 || l > 255 || ~~l !== l)
        throw new RangeError("Array items must be numbers in the range 0-255.");
    }
  if (o || kt.isBuffer(e) && e.constructor && typeof e.constructor.isBuffer == "function" && e.constructor.isBuffer(e))
    return kt.from(e);
  throw new TypeError('The "data" argument must be a string, an Array, a Buffer, a Uint8Array, or a DataView.');
}, Rd = si.Buffer, Od = $d;
function Un(t, e) {
  this._block = Rd.alloc(t), this._finalSize = e, this._blockSize = t, this._len = 0;
}
Un.prototype.update = function(t, e) {
  t = Od(t, e || "utf8");
  for (var r = this._block, n = this._blockSize, a = t.length, i = this._len, o = 0; o < a; ) {
    for (var s = i % n, l = Math.min(a - o, n - s), f = 0; f < l; f++)
      r[s + f] = t[o + f];
    i += l, o += l, i % n === 0 && this._update(r);
  }
  return this._len += a, this;
};
Un.prototype.digest = function(t) {
  var e = this._len % this._blockSize;
  this._block[e] = 128, this._block.fill(0, e + 1), e >= this._finalSize && (this._update(this._block), this._block.fill(0));
  var r = this._len * 8;
  if (r <= 4294967295)
    this._block.writeUInt32BE(r, this._blockSize - 4);
  else {
    var n = (r & 4294967295) >>> 0, a = (r - n) / 4294967296;
    this._block.writeUInt32BE(a, this._blockSize - 8), this._block.writeUInt32BE(n, this._blockSize - 4);
  }
  this._update(this._block);
  var i = this._hash();
  return t ? i.toString(t) : i;
};
Un.prototype._update = function() {
  throw new Error("_update must be implemented by subclass");
};
var Td = Un, Id = Zl, Ns = Td, Pd = si.Buffer, Bd = [
  1518500249,
  1859775393,
  -1894007588,
  -899497514
], Cd = new Array(80);
function Ir() {
  this.init(), this._w = Cd, Ns.call(this, 64, 56);
}
Id(Ir, Ns);
Ir.prototype.init = function() {
  return this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878, this._e = 3285377520, this;
};
function Dd(t) {
  return t << 1 | t >>> 31;
}
function Nd(t) {
  return t << 5 | t >>> 27;
}
function Fd(t) {
  return t << 30 | t >>> 2;
}
function jd(t, e, r, n) {
  return t === 0 ? e & r | ~e & n : t === 2 ? e & r | e & n | r & n : e ^ r ^ n;
}
Ir.prototype._update = function(t) {
  for (var e = this._w, r = this._a | 0, n = this._b | 0, a = this._c | 0, i = this._d | 0, o = this._e | 0, s = 0; s < 16; ++s)
    e[s] = t.readInt32BE(s * 4);
  for (; s < 80; ++s)
    e[s] = Dd(e[s - 3] ^ e[s - 8] ^ e[s - 14] ^ e[s - 16]);
  for (var l = 0; l < 80; ++l) {
    var f = ~~(l / 20), c = Nd(r) + jd(f, n, a, i) + o + e[l] + Bd[f] | 0;
    o = i, i = a, a = Fd(n), n = r, r = c;
  }
  this._a = r + this._a | 0, this._b = n + this._b | 0, this._c = a + this._c | 0, this._d = i + this._d | 0, this._e = o + this._e | 0;
};
Ir.prototype._hash = function() {
  var t = Pd.allocUnsafe(20);
  return t.writeInt32BE(this._a | 0, 0), t.writeInt32BE(this._b | 0, 4), t.writeInt32BE(this._c | 0, 8), t.writeInt32BE(this._d | 0, 12), t.writeInt32BE(this._e | 0, 16), t;
};
var Ud = Ir, Fs = {};
/*! crc32.js (C) 2014-present SheetJS -- http://sheetjs.com */
(function(t) {
  (function(e) {
    e(typeof DO_NOT_EXPORT_CRC > "u" ? t : {});
  })(function(e) {
    e.version = "1.2.2";
    function r() {
      for (var g = 0, E = new Array(256), A = 0; A != 256; ++A)
        g = A, g = g & 1 ? -306674912 ^ g >>> 1 : g >>> 1, g = g & 1 ? -306674912 ^ g >>> 1 : g >>> 1, g = g & 1 ? -306674912 ^ g >>> 1 : g >>> 1, g = g & 1 ? -306674912 ^ g >>> 1 : g >>> 1, g = g & 1 ? -306674912 ^ g >>> 1 : g >>> 1, g = g & 1 ? -306674912 ^ g >>> 1 : g >>> 1, g = g & 1 ? -306674912 ^ g >>> 1 : g >>> 1, g = g & 1 ? -306674912 ^ g >>> 1 : g >>> 1, E[A] = g;
      return typeof Int32Array < "u" ? new Int32Array(E) : E;
    }
    var n = r();
    function a(g) {
      var E = 0, A = 0, $ = 0, I = typeof Int32Array < "u" ? new Int32Array(4096) : new Array(4096);
      for ($ = 0; $ != 256; ++$) I[$] = g[$];
      for ($ = 0; $ != 256; ++$)
        for (A = g[$], E = 256 + $; E < 4096; E += 256) A = I[E] = A >>> 8 ^ g[A & 255];
      var B = [];
      for ($ = 1; $ != 16; ++$) B[$ - 1] = typeof Int32Array < "u" ? I.subarray($ * 256, $ * 256 + 256) : I.slice($ * 256, $ * 256 + 256);
      return B;
    }
    var i = a(n), o = i[0], s = i[1], l = i[2], f = i[3], c = i[4], u = i[5], d = i[6], h = i[7], w = i[8], p = i[9], m = i[10], y = i[11], _ = i[12], v = i[13], S = i[14];
    function k(g, E) {
      for (var A = E ^ -1, $ = 0, I = g.length; $ < I; ) A = A >>> 8 ^ n[(A ^ g.charCodeAt($++)) & 255];
      return ~A;
    }
    function O(g, E) {
      for (var A = E ^ -1, $ = g.length - 15, I = 0; I < $; ) A = S[g[I++] ^ A & 255] ^ v[g[I++] ^ A >> 8 & 255] ^ _[g[I++] ^ A >> 16 & 255] ^ y[g[I++] ^ A >>> 24] ^ m[g[I++]] ^ p[g[I++]] ^ w[g[I++]] ^ h[g[I++]] ^ d[g[I++]] ^ u[g[I++]] ^ c[g[I++]] ^ f[g[I++]] ^ l[g[I++]] ^ s[g[I++]] ^ o[g[I++]] ^ n[g[I++]];
      for ($ += 15; I < $; ) A = A >>> 8 ^ n[(A ^ g[I++]) & 255];
      return ~A;
    }
    function x(g, E) {
      for (var A = E ^ -1, $ = 0, I = g.length, B = 0, N = 0; $ < I; )
        B = g.charCodeAt($++), B < 128 ? A = A >>> 8 ^ n[(A ^ B) & 255] : B < 2048 ? (A = A >>> 8 ^ n[(A ^ (192 | B >> 6 & 31)) & 255], A = A >>> 8 ^ n[(A ^ (128 | B & 63)) & 255]) : B >= 55296 && B < 57344 ? (B = (B & 1023) + 64, N = g.charCodeAt($++) & 1023, A = A >>> 8 ^ n[(A ^ (240 | B >> 8 & 7)) & 255], A = A >>> 8 ^ n[(A ^ (128 | B >> 2 & 63)) & 255], A = A >>> 8 ^ n[(A ^ (128 | N >> 6 & 15 | (B & 3) << 4)) & 255], A = A >>> 8 ^ n[(A ^ (128 | N & 63)) & 255]) : (A = A >>> 8 ^ n[(A ^ (224 | B >> 12 & 15)) & 255], A = A >>> 8 ^ n[(A ^ (128 | B >> 6 & 63)) & 255], A = A >>> 8 ^ n[(A ^ (128 | B & 63)) & 255]);
      return ~A;
    }
    e.table = n, e.bstr = k, e.buf = O, e.str = x;
  });
})(Fs);
var Xt = {};
(function(t) {
  var e = typeof Uint8Array < "u" && typeof Uint16Array < "u" && typeof Int32Array < "u";
  function r(i, o) {
    return Object.prototype.hasOwnProperty.call(i, o);
  }
  t.assign = function(i) {
    for (var o = Array.prototype.slice.call(arguments, 1); o.length; ) {
      var s = o.shift();
      if (s) {
        if (typeof s != "object")
          throw new TypeError(s + "must be non-object");
        for (var l in s)
          r(s, l) && (i[l] = s[l]);
      }
    }
    return i;
  }, t.shrinkBuf = function(i, o) {
    return i.length === o ? i : i.subarray ? i.subarray(0, o) : (i.length = o, i);
  };
  var n = {
    arraySet: function(i, o, s, l, f) {
      if (o.subarray && i.subarray) {
        i.set(o.subarray(s, s + l), f);
        return;
      }
      for (var c = 0; c < l; c++)
        i[f + c] = o[s + c];
    },
    // Join array of chunks to single array.
    flattenChunks: function(i) {
      var o, s, l, f, c, u;
      for (l = 0, o = 0, s = i.length; o < s; o++)
        l += i[o].length;
      for (u = new Uint8Array(l), f = 0, o = 0, s = i.length; o < s; o++)
        c = i[o], u.set(c, f), f += c.length;
      return u;
    }
  }, a = {
    arraySet: function(i, o, s, l, f) {
      for (var c = 0; c < l; c++)
        i[f + c] = o[s + c];
    },
    // Join array of chunks to single array.
    flattenChunks: function(i) {
      return [].concat.apply([], i);
    }
  };
  t.setTyped = function(i) {
    i ? (t.Buf8 = Uint8Array, t.Buf16 = Uint16Array, t.Buf32 = Int32Array, t.assign(t, n)) : (t.Buf8 = Array, t.Buf16 = Array, t.Buf32 = Array, t.assign(t, a));
  }, t.setTyped(e);
})(Xt);
var Pr = {}, Lt = {}, Ze = {}, Md = Xt, zd = 4, eo = 0, ro = 1, Ld = 2;
function Ve(t) {
  for (var e = t.length; --e >= 0; )
    t[e] = 0;
}
var Hd = 0, js = 1, Gd = 2, Wd = 3, qd = 258, ui = 29, Br = 256, mr = Br + 1 + ui, Fe = 30, di = 19, Us = 2 * mr + 1, pe = 15, _a = 16, Zd = 7, hi = 256, Ms = 16, zs = 17, Ls = 18, Za = (
  /* extra bits for each length code */
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
), mn = (
  /* extra bits for each distance code */
  [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
), Vd = (
  /* extra bits for each bit length code */
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
), Hs = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], Xd = 512, Gt = new Array((mr + 2) * 2);
Ve(Gt);
var fr = new Array(Fe * 2);
Ve(fr);
var gr = new Array(Xd);
Ve(gr);
var yr = new Array(qd - Wd + 1);
Ve(yr);
var wi = new Array(ui);
Ve(wi);
var kn = new Array(Fe);
Ve(kn);
function ba(t, e, r, n, a) {
  this.static_tree = t, this.extra_bits = e, this.extra_base = r, this.elems = n, this.max_length = a, this.has_stree = t && t.length;
}
var Gs, Ws, qs;
function va(t, e) {
  this.dyn_tree = t, this.max_code = 0, this.stat_desc = e;
}
function Zs(t) {
  return t < 256 ? gr[t] : gr[256 + (t >>> 7)];
}
function _r(t, e) {
  t.pending_buf[t.pending++] = e & 255, t.pending_buf[t.pending++] = e >>> 8 & 255;
}
function lt(t, e, r) {
  t.bi_valid > _a - r ? (t.bi_buf |= e << t.bi_valid & 65535, _r(t, t.bi_buf), t.bi_buf = e >> _a - t.bi_valid, t.bi_valid += r - _a) : (t.bi_buf |= e << t.bi_valid & 65535, t.bi_valid += r);
}
function jt(t, e, r) {
  lt(
    t,
    r[e * 2],
    r[e * 2 + 1]
    /*.Len*/
  );
}
function Vs(t, e) {
  var r = 0;
  do
    r |= t & 1, t >>>= 1, r <<= 1;
  while (--e > 0);
  return r >>> 1;
}
function Kd(t) {
  t.bi_valid === 16 ? (_r(t, t.bi_buf), t.bi_buf = 0, t.bi_valid = 0) : t.bi_valid >= 8 && (t.pending_buf[t.pending++] = t.bi_buf & 255, t.bi_buf >>= 8, t.bi_valid -= 8);
}
function Yd(t, e) {
  var r = e.dyn_tree, n = e.max_code, a = e.stat_desc.static_tree, i = e.stat_desc.has_stree, o = e.stat_desc.extra_bits, s = e.stat_desc.extra_base, l = e.stat_desc.max_length, f, c, u, d, h, w, p = 0;
  for (d = 0; d <= pe; d++)
    t.bl_count[d] = 0;
  for (r[t.heap[t.heap_max] * 2 + 1] = 0, f = t.heap_max + 1; f < Us; f++)
    c = t.heap[f], d = r[r[c * 2 + 1] * 2 + 1] + 1, d > l && (d = l, p++), r[c * 2 + 1] = d, !(c > n) && (t.bl_count[d]++, h = 0, c >= s && (h = o[c - s]), w = r[c * 2], t.opt_len += w * (d + h), i && (t.static_len += w * (a[c * 2 + 1] + h)));
  if (p !== 0) {
    do {
      for (d = l - 1; t.bl_count[d] === 0; )
        d--;
      t.bl_count[d]--, t.bl_count[d + 1] += 2, t.bl_count[l]--, p -= 2;
    } while (p > 0);
    for (d = l; d !== 0; d--)
      for (c = t.bl_count[d]; c !== 0; )
        u = t.heap[--f], !(u > n) && (r[u * 2 + 1] !== d && (t.opt_len += (d - r[u * 2 + 1]) * r[u * 2], r[u * 2 + 1] = d), c--);
  }
}
function Xs(t, e, r) {
  var n = new Array(pe + 1), a = 0, i, o;
  for (i = 1; i <= pe; i++)
    n[i] = a = a + r[i - 1] << 1;
  for (o = 0; o <= e; o++) {
    var s = t[o * 2 + 1];
    s !== 0 && (t[o * 2] = Vs(n[s]++, s));
  }
}
function Jd() {
  var t, e, r, n, a, i = new Array(pe + 1);
  for (r = 0, n = 0; n < ui - 1; n++)
    for (wi[n] = r, t = 0; t < 1 << Za[n]; t++)
      yr[r++] = n;
  for (yr[r - 1] = n, a = 0, n = 0; n < 16; n++)
    for (kn[n] = a, t = 0; t < 1 << mn[n]; t++)
      gr[a++] = n;
  for (a >>= 7; n < Fe; n++)
    for (kn[n] = a << 7, t = 0; t < 1 << mn[n] - 7; t++)
      gr[256 + a++] = n;
  for (e = 0; e <= pe; e++)
    i[e] = 0;
  for (t = 0; t <= 143; )
    Gt[t * 2 + 1] = 8, t++, i[8]++;
  for (; t <= 255; )
    Gt[t * 2 + 1] = 9, t++, i[9]++;
  for (; t <= 279; )
    Gt[t * 2 + 1] = 7, t++, i[7]++;
  for (; t <= 287; )
    Gt[t * 2 + 1] = 8, t++, i[8]++;
  for (Xs(Gt, mr + 1, i), t = 0; t < Fe; t++)
    fr[t * 2 + 1] = 5, fr[t * 2] = Vs(t, 5);
  Gs = new ba(Gt, Za, Br + 1, mr, pe), Ws = new ba(fr, mn, 0, Fe, pe), qs = new ba(new Array(0), Vd, 0, di, Zd);
}
function Ks(t) {
  var e;
  for (e = 0; e < mr; e++)
    t.dyn_ltree[e * 2] = 0;
  for (e = 0; e < Fe; e++)
    t.dyn_dtree[e * 2] = 0;
  for (e = 0; e < di; e++)
    t.bl_tree[e * 2] = 0;
  t.dyn_ltree[hi * 2] = 1, t.opt_len = t.static_len = 0, t.last_lit = t.matches = 0;
}
function Ys(t) {
  t.bi_valid > 8 ? _r(t, t.bi_buf) : t.bi_valid > 0 && (t.pending_buf[t.pending++] = t.bi_buf), t.bi_buf = 0, t.bi_valid = 0;
}
function Qd(t, e, r, n) {
  Ys(t), _r(t, r), _r(t, ~r), Md.arraySet(t.pending_buf, t.window, e, r, t.pending), t.pending += r;
}
function no(t, e, r, n) {
  var a = e * 2, i = r * 2;
  return t[a] < t[i] || t[a] === t[i] && n[e] <= n[r];
}
function xa(t, e, r) {
  for (var n = t.heap[r], a = r << 1; a <= t.heap_len && (a < t.heap_len && no(e, t.heap[a + 1], t.heap[a], t.depth) && a++, !no(e, n, t.heap[a], t.depth)); )
    t.heap[r] = t.heap[a], r = a, a <<= 1;
  t.heap[r] = n;
}
function ao(t, e, r) {
  var n, a, i = 0, o, s;
  if (t.last_lit !== 0)
    do
      n = t.pending_buf[t.d_buf + i * 2] << 8 | t.pending_buf[t.d_buf + i * 2 + 1], a = t.pending_buf[t.l_buf + i], i++, n === 0 ? jt(t, a, e) : (o = yr[a], jt(t, o + Br + 1, e), s = Za[o], s !== 0 && (a -= wi[o], lt(t, a, s)), n--, o = Zs(n), jt(t, o, r), s = mn[o], s !== 0 && (n -= kn[o], lt(t, n, s)));
    while (i < t.last_lit);
  jt(t, hi, e);
}
function Va(t, e) {
  var r = e.dyn_tree, n = e.stat_desc.static_tree, a = e.stat_desc.has_stree, i = e.stat_desc.elems, o, s, l = -1, f;
  for (t.heap_len = 0, t.heap_max = Us, o = 0; o < i; o++)
    r[o * 2] !== 0 ? (t.heap[++t.heap_len] = l = o, t.depth[o] = 0) : r[o * 2 + 1] = 0;
  for (; t.heap_len < 2; )
    f = t.heap[++t.heap_len] = l < 2 ? ++l : 0, r[f * 2] = 1, t.depth[f] = 0, t.opt_len--, a && (t.static_len -= n[f * 2 + 1]);
  for (e.max_code = l, o = t.heap_len >> 1; o >= 1; o--)
    xa(t, r, o);
  f = i;
  do
    o = t.heap[
      1
      /*SMALLEST*/
    ], t.heap[
      1
      /*SMALLEST*/
    ] = t.heap[t.heap_len--], xa(
      t,
      r,
      1
      /*SMALLEST*/
    ), s = t.heap[
      1
      /*SMALLEST*/
    ], t.heap[--t.heap_max] = o, t.heap[--t.heap_max] = s, r[f * 2] = r[o * 2] + r[s * 2], t.depth[f] = (t.depth[o] >= t.depth[s] ? t.depth[o] : t.depth[s]) + 1, r[o * 2 + 1] = r[s * 2 + 1] = f, t.heap[
      1
      /*SMALLEST*/
    ] = f++, xa(
      t,
      r,
      1
      /*SMALLEST*/
    );
  while (t.heap_len >= 2);
  t.heap[--t.heap_max] = t.heap[
    1
    /*SMALLEST*/
  ], Yd(t, e), Xs(r, l, t.bl_count);
}
function io(t, e, r) {
  var n, a = -1, i, o = e[0 * 2 + 1], s = 0, l = 7, f = 4;
  for (o === 0 && (l = 138, f = 3), e[(r + 1) * 2 + 1] = 65535, n = 0; n <= r; n++)
    i = o, o = e[(n + 1) * 2 + 1], !(++s < l && i === o) && (s < f ? t.bl_tree[i * 2] += s : i !== 0 ? (i !== a && t.bl_tree[i * 2]++, t.bl_tree[Ms * 2]++) : s <= 10 ? t.bl_tree[zs * 2]++ : t.bl_tree[Ls * 2]++, s = 0, a = i, o === 0 ? (l = 138, f = 3) : i === o ? (l = 6, f = 3) : (l = 7, f = 4));
}
function oo(t, e, r) {
  var n, a = -1, i, o = e[0 * 2 + 1], s = 0, l = 7, f = 4;
  for (o === 0 && (l = 138, f = 3), n = 0; n <= r; n++)
    if (i = o, o = e[(n + 1) * 2 + 1], !(++s < l && i === o)) {
      if (s < f)
        do
          jt(t, i, t.bl_tree);
        while (--s !== 0);
      else i !== 0 ? (i !== a && (jt(t, i, t.bl_tree), s--), jt(t, Ms, t.bl_tree), lt(t, s - 3, 2)) : s <= 10 ? (jt(t, zs, t.bl_tree), lt(t, s - 3, 3)) : (jt(t, Ls, t.bl_tree), lt(t, s - 11, 7));
      s = 0, a = i, o === 0 ? (l = 138, f = 3) : i === o ? (l = 6, f = 3) : (l = 7, f = 4);
    }
}
function th(t) {
  var e;
  for (io(t, t.dyn_ltree, t.l_desc.max_code), io(t, t.dyn_dtree, t.d_desc.max_code), Va(t, t.bl_desc), e = di - 1; e >= 3 && t.bl_tree[Hs[e] * 2 + 1] === 0; e--)
    ;
  return t.opt_len += 3 * (e + 1) + 5 + 5 + 4, e;
}
function eh(t, e, r, n) {
  var a;
  for (lt(t, e - 257, 5), lt(t, r - 1, 5), lt(t, n - 4, 4), a = 0; a < n; a++)
    lt(t, t.bl_tree[Hs[a] * 2 + 1], 3);
  oo(t, t.dyn_ltree, e - 1), oo(t, t.dyn_dtree, r - 1);
}
function rh(t) {
  var e = 4093624447, r;
  for (r = 0; r <= 31; r++, e >>>= 1)
    if (e & 1 && t.dyn_ltree[r * 2] !== 0)
      return eo;
  if (t.dyn_ltree[9 * 2] !== 0 || t.dyn_ltree[10 * 2] !== 0 || t.dyn_ltree[13 * 2] !== 0)
    return ro;
  for (r = 32; r < Br; r++)
    if (t.dyn_ltree[r * 2] !== 0)
      return ro;
  return eo;
}
var so = !1;
function nh(t) {
  so || (Jd(), so = !0), t.l_desc = new va(t.dyn_ltree, Gs), t.d_desc = new va(t.dyn_dtree, Ws), t.bl_desc = new va(t.bl_tree, qs), t.bi_buf = 0, t.bi_valid = 0, Ks(t);
}
function Js(t, e, r, n) {
  lt(t, (Hd << 1) + (n ? 1 : 0), 3), Qd(t, e, r);
}
function ah(t) {
  lt(t, js << 1, 3), jt(t, hi, Gt), Kd(t);
}
function ih(t, e, r, n) {
  var a, i, o = 0;
  t.level > 0 ? (t.strm.data_type === Ld && (t.strm.data_type = rh(t)), Va(t, t.l_desc), Va(t, t.d_desc), o = th(t), a = t.opt_len + 3 + 7 >>> 3, i = t.static_len + 3 + 7 >>> 3, i <= a && (a = i)) : a = i = r + 5, r + 4 <= a && e !== -1 ? Js(t, e, r, n) : t.strategy === zd || i === a ? (lt(t, (js << 1) + (n ? 1 : 0), 3), ao(t, Gt, fr)) : (lt(t, (Gd << 1) + (n ? 1 : 0), 3), eh(t, t.l_desc.max_code + 1, t.d_desc.max_code + 1, o + 1), ao(t, t.dyn_ltree, t.dyn_dtree)), Ks(t), n && Ys(t);
}
function oh(t, e, r) {
  return t.pending_buf[t.d_buf + t.last_lit * 2] = e >>> 8 & 255, t.pending_buf[t.d_buf + t.last_lit * 2 + 1] = e & 255, t.pending_buf[t.l_buf + t.last_lit] = r & 255, t.last_lit++, e === 0 ? t.dyn_ltree[r * 2]++ : (t.matches++, e--, t.dyn_ltree[(yr[r] + Br + 1) * 2]++, t.dyn_dtree[Zs(e) * 2]++), t.last_lit === t.lit_bufsize - 1;
}
Ze._tr_init = nh;
Ze._tr_stored_block = Js;
Ze._tr_flush_block = ih;
Ze._tr_tally = oh;
Ze._tr_align = ah;
function sh(t, e, r, n) {
  for (var a = t & 65535 | 0, i = t >>> 16 & 65535 | 0, o = 0; r !== 0; ) {
    o = r > 2e3 ? 2e3 : r, r -= o;
    do
      a = a + e[n++] | 0, i = i + a | 0;
    while (--o);
    a %= 65521, i %= 65521;
  }
  return a | i << 16 | 0;
}
var Qs = sh;
function ch() {
  for (var t, e = [], r = 0; r < 256; r++) {
    t = r;
    for (var n = 0; n < 8; n++)
      t = t & 1 ? 3988292384 ^ t >>> 1 : t >>> 1;
    e[r] = t;
  }
  return e;
}
var fh = ch();
function lh(t, e, r, n) {
  var a = fh, i = n + r;
  t ^= -1;
  for (var o = n; o < i; o++)
    t = t >>> 8 ^ a[(t ^ e[o]) & 255];
  return t ^ -1;
}
var tc = lh, pi = {
  2: "need dictionary",
  /* Z_NEED_DICT       2  */
  1: "stream end",
  /* Z_STREAM_END      1  */
  0: "",
  /* Z_OK              0  */
  "-1": "file error",
  /* Z_ERRNO         (-1) */
  "-2": "stream error",
  /* Z_STREAM_ERROR  (-2) */
  "-3": "data error",
  /* Z_DATA_ERROR    (-3) */
  "-4": "insufficient memory",
  /* Z_MEM_ERROR     (-4) */
  "-5": "buffer error",
  /* Z_BUF_ERROR     (-5) */
  "-6": "incompatible version"
  /* Z_VERSION_ERROR (-6) */
}, st = Xt, vt = Ze, ec = Qs, Jt = tc, uh = pi, Ae = 0, dh = 1, hh = 3, ae = 4, co = 5, Ut = 0, fo = 1, xt = -2, wh = -3, Ea = -5, ph = -1, mh = 1, on = 2, gh = 3, yh = 4, _h = 0, bh = 2, Mn = 8, vh = 9, xh = 15, Eh = 8, Sh = 29, kh = 256, Xa = kh + 1 + Sh, Ah = 30, $h = 19, Rh = 2 * Xa + 1, Oh = 15, M = 3, ee = 258, $t = ee + M + 1, Th = 32, zn = 42, Ka = 69, gn = 73, yn = 91, _n = 103, me = 113, cr = 666, tt = 1, Cr = 2, _e = 3, Xe = 4, Ih = 3;
function re(t, e) {
  return t.msg = uh[e], e;
}
function lo(t) {
  return (t << 1) - (t > 4 ? 9 : 0);
}
function te(t) {
  for (var e = t.length; --e >= 0; )
    t[e] = 0;
}
function Qt(t) {
  var e = t.state, r = e.pending;
  r > t.avail_out && (r = t.avail_out), r !== 0 && (st.arraySet(t.output, e.pending_buf, e.pending_out, r, t.next_out), t.next_out += r, e.pending_out += r, t.total_out += r, t.avail_out -= r, e.pending -= r, e.pending === 0 && (e.pending_out = 0));
}
function nt(t, e) {
  vt._tr_flush_block(t, t.block_start >= 0 ? t.block_start : -1, t.strstart - t.block_start, e), t.block_start = t.strstart, Qt(t.strm);
}
function z(t, e) {
  t.pending_buf[t.pending++] = e;
}
function or(t, e) {
  t.pending_buf[t.pending++] = e >>> 8 & 255, t.pending_buf[t.pending++] = e & 255;
}
function Ph(t, e, r, n) {
  var a = t.avail_in;
  return a > n && (a = n), a === 0 ? 0 : (t.avail_in -= a, st.arraySet(e, t.input, t.next_in, a, r), t.state.wrap === 1 ? t.adler = ec(t.adler, e, a, r) : t.state.wrap === 2 && (t.adler = Jt(t.adler, e, a, r)), t.next_in += a, t.total_in += a, a);
}
function rc(t, e) {
  var r = t.max_chain_length, n = t.strstart, a, i, o = t.prev_length, s = t.nice_match, l = t.strstart > t.w_size - $t ? t.strstart - (t.w_size - $t) : 0, f = t.window, c = t.w_mask, u = t.prev, d = t.strstart + ee, h = f[n + o - 1], w = f[n + o];
  t.prev_length >= t.good_match && (r >>= 2), s > t.lookahead && (s = t.lookahead);
  do
    if (a = e, !(f[a + o] !== w || f[a + o - 1] !== h || f[a] !== f[n] || f[++a] !== f[n + 1])) {
      n += 2, a++;
      do
        ;
      while (f[++n] === f[++a] && f[++n] === f[++a] && f[++n] === f[++a] && f[++n] === f[++a] && f[++n] === f[++a] && f[++n] === f[++a] && f[++n] === f[++a] && f[++n] === f[++a] && n < d);
      if (i = ee - (d - n), n = d - ee, i > o) {
        if (t.match_start = e, o = i, i >= s)
          break;
        h = f[n + o - 1], w = f[n + o];
      }
    }
  while ((e = u[e & c]) > l && --r !== 0);
  return o <= t.lookahead ? o : t.lookahead;
}
function be(t) {
  var e = t.w_size, r, n, a, i, o;
  do {
    if (i = t.window_size - t.lookahead - t.strstart, t.strstart >= e + (e - $t)) {
      st.arraySet(t.window, t.window, e, e, 0), t.match_start -= e, t.strstart -= e, t.block_start -= e, n = t.hash_size, r = n;
      do
        a = t.head[--r], t.head[r] = a >= e ? a - e : 0;
      while (--n);
      n = e, r = n;
      do
        a = t.prev[--r], t.prev[r] = a >= e ? a - e : 0;
      while (--n);
      i += e;
    }
    if (t.strm.avail_in === 0)
      break;
    if (n = Ph(t.strm, t.window, t.strstart + t.lookahead, i), t.lookahead += n, t.lookahead + t.insert >= M)
      for (o = t.strstart - t.insert, t.ins_h = t.window[o], t.ins_h = (t.ins_h << t.hash_shift ^ t.window[o + 1]) & t.hash_mask; t.insert && (t.ins_h = (t.ins_h << t.hash_shift ^ t.window[o + M - 1]) & t.hash_mask, t.prev[o & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = o, o++, t.insert--, !(t.lookahead + t.insert < M)); )
        ;
  } while (t.lookahead < $t && t.strm.avail_in !== 0);
}
function Bh(t, e) {
  var r = 65535;
  for (r > t.pending_buf_size - 5 && (r = t.pending_buf_size - 5); ; ) {
    if (t.lookahead <= 1) {
      if (be(t), t.lookahead === 0 && e === Ae)
        return tt;
      if (t.lookahead === 0)
        break;
    }
    t.strstart += t.lookahead, t.lookahead = 0;
    var n = t.block_start + r;
    if ((t.strstart === 0 || t.strstart >= n) && (t.lookahead = t.strstart - n, t.strstart = n, nt(t, !1), t.strm.avail_out === 0) || t.strstart - t.block_start >= t.w_size - $t && (nt(t, !1), t.strm.avail_out === 0))
      return tt;
  }
  return t.insert = 0, e === ae ? (nt(t, !0), t.strm.avail_out === 0 ? _e : Xe) : (t.strstart > t.block_start && (nt(t, !1), t.strm.avail_out === 0), tt);
}
function Sa(t, e) {
  for (var r, n; ; ) {
    if (t.lookahead < $t) {
      if (be(t), t.lookahead < $t && e === Ae)
        return tt;
      if (t.lookahead === 0)
        break;
    }
    if (r = 0, t.lookahead >= M && (t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + M - 1]) & t.hash_mask, r = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart), r !== 0 && t.strstart - r <= t.w_size - $t && (t.match_length = rc(t, r)), t.match_length >= M)
      if (n = vt._tr_tally(t, t.strstart - t.match_start, t.match_length - M), t.lookahead -= t.match_length, t.match_length <= t.max_lazy_match && t.lookahead >= M) {
        t.match_length--;
        do
          t.strstart++, t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + M - 1]) & t.hash_mask, r = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart;
        while (--t.match_length !== 0);
        t.strstart++;
      } else
        t.strstart += t.match_length, t.match_length = 0, t.ins_h = t.window[t.strstart], t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + 1]) & t.hash_mask;
    else
      n = vt._tr_tally(t, 0, t.window[t.strstart]), t.lookahead--, t.strstart++;
    if (n && (nt(t, !1), t.strm.avail_out === 0))
      return tt;
  }
  return t.insert = t.strstart < M - 1 ? t.strstart : M - 1, e === ae ? (nt(t, !0), t.strm.avail_out === 0 ? _e : Xe) : t.last_lit && (nt(t, !1), t.strm.avail_out === 0) ? tt : Cr;
}
function Pe(t, e) {
  for (var r, n, a; ; ) {
    if (t.lookahead < $t) {
      if (be(t), t.lookahead < $t && e === Ae)
        return tt;
      if (t.lookahead === 0)
        break;
    }
    if (r = 0, t.lookahead >= M && (t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + M - 1]) & t.hash_mask, r = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart), t.prev_length = t.match_length, t.prev_match = t.match_start, t.match_length = M - 1, r !== 0 && t.prev_length < t.max_lazy_match && t.strstart - r <= t.w_size - $t && (t.match_length = rc(t, r), t.match_length <= 5 && (t.strategy === mh || t.match_length === M && t.strstart - t.match_start > 4096) && (t.match_length = M - 1)), t.prev_length >= M && t.match_length <= t.prev_length) {
      a = t.strstart + t.lookahead - M, n = vt._tr_tally(t, t.strstart - 1 - t.prev_match, t.prev_length - M), t.lookahead -= t.prev_length - 1, t.prev_length -= 2;
      do
        ++t.strstart <= a && (t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + M - 1]) & t.hash_mask, r = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart);
      while (--t.prev_length !== 0);
      if (t.match_available = 0, t.match_length = M - 1, t.strstart++, n && (nt(t, !1), t.strm.avail_out === 0))
        return tt;
    } else if (t.match_available) {
      if (n = vt._tr_tally(t, 0, t.window[t.strstart - 1]), n && nt(t, !1), t.strstart++, t.lookahead--, t.strm.avail_out === 0)
        return tt;
    } else
      t.match_available = 1, t.strstart++, t.lookahead--;
  }
  return t.match_available && (n = vt._tr_tally(t, 0, t.window[t.strstart - 1]), t.match_available = 0), t.insert = t.strstart < M - 1 ? t.strstart : M - 1, e === ae ? (nt(t, !0), t.strm.avail_out === 0 ? _e : Xe) : t.last_lit && (nt(t, !1), t.strm.avail_out === 0) ? tt : Cr;
}
function Ch(t, e) {
  for (var r, n, a, i, o = t.window; ; ) {
    if (t.lookahead <= ee) {
      if (be(t), t.lookahead <= ee && e === Ae)
        return tt;
      if (t.lookahead === 0)
        break;
    }
    if (t.match_length = 0, t.lookahead >= M && t.strstart > 0 && (a = t.strstart - 1, n = o[a], n === o[++a] && n === o[++a] && n === o[++a])) {
      i = t.strstart + ee;
      do
        ;
      while (n === o[++a] && n === o[++a] && n === o[++a] && n === o[++a] && n === o[++a] && n === o[++a] && n === o[++a] && n === o[++a] && a < i);
      t.match_length = ee - (i - a), t.match_length > t.lookahead && (t.match_length = t.lookahead);
    }
    if (t.match_length >= M ? (r = vt._tr_tally(t, 1, t.match_length - M), t.lookahead -= t.match_length, t.strstart += t.match_length, t.match_length = 0) : (r = vt._tr_tally(t, 0, t.window[t.strstart]), t.lookahead--, t.strstart++), r && (nt(t, !1), t.strm.avail_out === 0))
      return tt;
  }
  return t.insert = 0, e === ae ? (nt(t, !0), t.strm.avail_out === 0 ? _e : Xe) : t.last_lit && (nt(t, !1), t.strm.avail_out === 0) ? tt : Cr;
}
function Dh(t, e) {
  for (var r; ; ) {
    if (t.lookahead === 0 && (be(t), t.lookahead === 0)) {
      if (e === Ae)
        return tt;
      break;
    }
    if (t.match_length = 0, r = vt._tr_tally(t, 0, t.window[t.strstart]), t.lookahead--, t.strstart++, r && (nt(t, !1), t.strm.avail_out === 0))
      return tt;
  }
  return t.insert = 0, e === ae ? (nt(t, !0), t.strm.avail_out === 0 ? _e : Xe) : t.last_lit && (nt(t, !1), t.strm.avail_out === 0) ? tt : Cr;
}
function Ct(t, e, r, n, a) {
  this.good_length = t, this.max_lazy = e, this.nice_length = r, this.max_chain = n, this.func = a;
}
var De;
De = [
  /*      good lazy nice chain */
  new Ct(0, 0, 0, 0, Bh),
  /* 0 store only */
  new Ct(4, 4, 8, 4, Sa),
  /* 1 max speed, no lazy matches */
  new Ct(4, 5, 16, 8, Sa),
  /* 2 */
  new Ct(4, 6, 32, 32, Sa),
  /* 3 */
  new Ct(4, 4, 16, 16, Pe),
  /* 4 lazy matches */
  new Ct(8, 16, 32, 32, Pe),
  /* 5 */
  new Ct(8, 16, 128, 128, Pe),
  /* 6 */
  new Ct(8, 32, 128, 256, Pe),
  /* 7 */
  new Ct(32, 128, 258, 1024, Pe),
  /* 8 */
  new Ct(32, 258, 258, 4096, Pe)
  /* 9 max compression */
];
function Nh(t) {
  t.window_size = 2 * t.w_size, te(t.head), t.max_lazy_match = De[t.level].max_lazy, t.good_match = De[t.level].good_length, t.nice_match = De[t.level].nice_length, t.max_chain_length = De[t.level].max_chain, t.strstart = 0, t.block_start = 0, t.lookahead = 0, t.insert = 0, t.match_length = t.prev_length = M - 1, t.match_available = 0, t.ins_h = 0;
}
function Fh() {
  this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = Mn, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new st.Buf16(Rh * 2), this.dyn_dtree = new st.Buf16((2 * Ah + 1) * 2), this.bl_tree = new st.Buf16((2 * $h + 1) * 2), te(this.dyn_ltree), te(this.dyn_dtree), te(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new st.Buf16(Oh + 1), this.heap = new st.Buf16(2 * Xa + 1), te(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new st.Buf16(2 * Xa + 1), te(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
}
function nc(t) {
  var e;
  return !t || !t.state ? re(t, xt) : (t.total_in = t.total_out = 0, t.data_type = bh, e = t.state, e.pending = 0, e.pending_out = 0, e.wrap < 0 && (e.wrap = -e.wrap), e.status = e.wrap ? zn : me, t.adler = e.wrap === 2 ? 0 : 1, e.last_flush = Ae, vt._tr_init(e), Ut);
}
function ac(t) {
  var e = nc(t);
  return e === Ut && Nh(t.state), e;
}
function jh(t, e) {
  return !t || !t.state || t.state.wrap !== 2 ? xt : (t.state.gzhead = e, Ut);
}
function ic(t, e, r, n, a, i) {
  if (!t)
    return xt;
  var o = 1;
  if (e === ph && (e = 6), n < 0 ? (o = 0, n = -n) : n > 15 && (o = 2, n -= 16), a < 1 || a > vh || r !== Mn || n < 8 || n > 15 || e < 0 || e > 9 || i < 0 || i > yh)
    return re(t, xt);
  n === 8 && (n = 9);
  var s = new Fh();
  return t.state = s, s.strm = t, s.wrap = o, s.gzhead = null, s.w_bits = n, s.w_size = 1 << s.w_bits, s.w_mask = s.w_size - 1, s.hash_bits = a + 7, s.hash_size = 1 << s.hash_bits, s.hash_mask = s.hash_size - 1, s.hash_shift = ~~((s.hash_bits + M - 1) / M), s.window = new st.Buf8(s.w_size * 2), s.head = new st.Buf16(s.hash_size), s.prev = new st.Buf16(s.w_size), s.lit_bufsize = 1 << a + 6, s.pending_buf_size = s.lit_bufsize * 4, s.pending_buf = new st.Buf8(s.pending_buf_size), s.d_buf = 1 * s.lit_bufsize, s.l_buf = 3 * s.lit_bufsize, s.level = e, s.strategy = i, s.method = r, ac(t);
}
function Uh(t, e) {
  return ic(t, e, Mn, xh, Eh, _h);
}
function Mh(t, e) {
  var r, n, a, i;
  if (!t || !t.state || e > co || e < 0)
    return t ? re(t, xt) : xt;
  if (n = t.state, !t.output || !t.input && t.avail_in !== 0 || n.status === cr && e !== ae)
    return re(t, t.avail_out === 0 ? Ea : xt);
  if (n.strm = t, r = n.last_flush, n.last_flush = e, n.status === zn)
    if (n.wrap === 2)
      t.adler = 0, z(n, 31), z(n, 139), z(n, 8), n.gzhead ? (z(
        n,
        (n.gzhead.text ? 1 : 0) + (n.gzhead.hcrc ? 2 : 0) + (n.gzhead.extra ? 4 : 0) + (n.gzhead.name ? 8 : 0) + (n.gzhead.comment ? 16 : 0)
      ), z(n, n.gzhead.time & 255), z(n, n.gzhead.time >> 8 & 255), z(n, n.gzhead.time >> 16 & 255), z(n, n.gzhead.time >> 24 & 255), z(n, n.level === 9 ? 2 : n.strategy >= on || n.level < 2 ? 4 : 0), z(n, n.gzhead.os & 255), n.gzhead.extra && n.gzhead.extra.length && (z(n, n.gzhead.extra.length & 255), z(n, n.gzhead.extra.length >> 8 & 255)), n.gzhead.hcrc && (t.adler = Jt(t.adler, n.pending_buf, n.pending, 0)), n.gzindex = 0, n.status = Ka) : (z(n, 0), z(n, 0), z(n, 0), z(n, 0), z(n, 0), z(n, n.level === 9 ? 2 : n.strategy >= on || n.level < 2 ? 4 : 0), z(n, Ih), n.status = me);
    else {
      var o = Mn + (n.w_bits - 8 << 4) << 8, s = -1;
      n.strategy >= on || n.level < 2 ? s = 0 : n.level < 6 ? s = 1 : n.level === 6 ? s = 2 : s = 3, o |= s << 6, n.strstart !== 0 && (o |= Th), o += 31 - o % 31, n.status = me, or(n, o), n.strstart !== 0 && (or(n, t.adler >>> 16), or(n, t.adler & 65535)), t.adler = 1;
    }
  if (n.status === Ka)
    if (n.gzhead.extra) {
      for (a = n.pending; n.gzindex < (n.gzhead.extra.length & 65535) && !(n.pending === n.pending_buf_size && (n.gzhead.hcrc && n.pending > a && (t.adler = Jt(t.adler, n.pending_buf, n.pending - a, a)), Qt(t), a = n.pending, n.pending === n.pending_buf_size)); )
        z(n, n.gzhead.extra[n.gzindex] & 255), n.gzindex++;
      n.gzhead.hcrc && n.pending > a && (t.adler = Jt(t.adler, n.pending_buf, n.pending - a, a)), n.gzindex === n.gzhead.extra.length && (n.gzindex = 0, n.status = gn);
    } else
      n.status = gn;
  if (n.status === gn)
    if (n.gzhead.name) {
      a = n.pending;
      do {
        if (n.pending === n.pending_buf_size && (n.gzhead.hcrc && n.pending > a && (t.adler = Jt(t.adler, n.pending_buf, n.pending - a, a)), Qt(t), a = n.pending, n.pending === n.pending_buf_size)) {
          i = 1;
          break;
        }
        n.gzindex < n.gzhead.name.length ? i = n.gzhead.name.charCodeAt(n.gzindex++) & 255 : i = 0, z(n, i);
      } while (i !== 0);
      n.gzhead.hcrc && n.pending > a && (t.adler = Jt(t.adler, n.pending_buf, n.pending - a, a)), i === 0 && (n.gzindex = 0, n.status = yn);
    } else
      n.status = yn;
  if (n.status === yn)
    if (n.gzhead.comment) {
      a = n.pending;
      do {
        if (n.pending === n.pending_buf_size && (n.gzhead.hcrc && n.pending > a && (t.adler = Jt(t.adler, n.pending_buf, n.pending - a, a)), Qt(t), a = n.pending, n.pending === n.pending_buf_size)) {
          i = 1;
          break;
        }
        n.gzindex < n.gzhead.comment.length ? i = n.gzhead.comment.charCodeAt(n.gzindex++) & 255 : i = 0, z(n, i);
      } while (i !== 0);
      n.gzhead.hcrc && n.pending > a && (t.adler = Jt(t.adler, n.pending_buf, n.pending - a, a)), i === 0 && (n.status = _n);
    } else
      n.status = _n;
  if (n.status === _n && (n.gzhead.hcrc ? (n.pending + 2 > n.pending_buf_size && Qt(t), n.pending + 2 <= n.pending_buf_size && (z(n, t.adler & 255), z(n, t.adler >> 8 & 255), t.adler = 0, n.status = me)) : n.status = me), n.pending !== 0) {
    if (Qt(t), t.avail_out === 0)
      return n.last_flush = -1, Ut;
  } else if (t.avail_in === 0 && lo(e) <= lo(r) && e !== ae)
    return re(t, Ea);
  if (n.status === cr && t.avail_in !== 0)
    return re(t, Ea);
  if (t.avail_in !== 0 || n.lookahead !== 0 || e !== Ae && n.status !== cr) {
    var l = n.strategy === on ? Dh(n, e) : n.strategy === gh ? Ch(n, e) : De[n.level].func(n, e);
    if ((l === _e || l === Xe) && (n.status = cr), l === tt || l === _e)
      return t.avail_out === 0 && (n.last_flush = -1), Ut;
    if (l === Cr && (e === dh ? vt._tr_align(n) : e !== co && (vt._tr_stored_block(n, 0, 0, !1), e === hh && (te(n.head), n.lookahead === 0 && (n.strstart = 0, n.block_start = 0, n.insert = 0))), Qt(t), t.avail_out === 0))
      return n.last_flush = -1, Ut;
  }
  return e !== ae ? Ut : n.wrap <= 0 ? fo : (n.wrap === 2 ? (z(n, t.adler & 255), z(n, t.adler >> 8 & 255), z(n, t.adler >> 16 & 255), z(n, t.adler >> 24 & 255), z(n, t.total_in & 255), z(n, t.total_in >> 8 & 255), z(n, t.total_in >> 16 & 255), z(n, t.total_in >> 24 & 255)) : (or(n, t.adler >>> 16), or(n, t.adler & 65535)), Qt(t), n.wrap > 0 && (n.wrap = -n.wrap), n.pending !== 0 ? Ut : fo);
}
function zh(t) {
  var e;
  return !t || !t.state ? xt : (e = t.state.status, e !== zn && e !== Ka && e !== gn && e !== yn && e !== _n && e !== me && e !== cr ? re(t, xt) : (t.state = null, e === me ? re(t, wh) : Ut));
}
function Lh(t, e) {
  var r = e.length, n, a, i, o, s, l, f, c;
  if (!t || !t.state || (n = t.state, o = n.wrap, o === 2 || o === 1 && n.status !== zn || n.lookahead))
    return xt;
  for (o === 1 && (t.adler = ec(t.adler, e, r, 0)), n.wrap = 0, r >= n.w_size && (o === 0 && (te(n.head), n.strstart = 0, n.block_start = 0, n.insert = 0), c = new st.Buf8(n.w_size), st.arraySet(c, e, r - n.w_size, n.w_size, 0), e = c, r = n.w_size), s = t.avail_in, l = t.next_in, f = t.input, t.avail_in = r, t.next_in = 0, t.input = e, be(n); n.lookahead >= M; ) {
    a = n.strstart, i = n.lookahead - (M - 1);
    do
      n.ins_h = (n.ins_h << n.hash_shift ^ n.window[a + M - 1]) & n.hash_mask, n.prev[a & n.w_mask] = n.head[n.ins_h], n.head[n.ins_h] = a, a++;
    while (--i);
    n.strstart = a, n.lookahead = M - 1, be(n);
  }
  return n.strstart += n.lookahead, n.block_start = n.strstart, n.insert = n.lookahead, n.lookahead = 0, n.match_length = n.prev_length = M - 1, n.match_available = 0, t.next_in = l, t.input = f, t.avail_in = s, n.wrap = o, Ut;
}
Lt.deflateInit = Uh;
Lt.deflateInit2 = ic;
Lt.deflateReset = ac;
Lt.deflateResetKeep = nc;
Lt.deflateSetHeader = jh;
Lt.deflate = Mh;
Lt.deflateEnd = zh;
Lt.deflateSetDictionary = Lh;
Lt.deflateInfo = "pako deflate (from Nodeca project)";
var $e = {}, Ln = Xt, oc = !0, sc = !0;
try {
  String.fromCharCode.apply(null, [0]);
} catch {
  oc = !1;
}
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch {
  sc = !1;
}
var br = new Ln.Buf8(256);
for (var Kt = 0; Kt < 256; Kt++)
  br[Kt] = Kt >= 252 ? 6 : Kt >= 248 ? 5 : Kt >= 240 ? 4 : Kt >= 224 ? 3 : Kt >= 192 ? 2 : 1;
br[254] = br[254] = 1;
$e.string2buf = function(t) {
  var e, r, n, a, i, o = t.length, s = 0;
  for (a = 0; a < o; a++)
    r = t.charCodeAt(a), (r & 64512) === 55296 && a + 1 < o && (n = t.charCodeAt(a + 1), (n & 64512) === 56320 && (r = 65536 + (r - 55296 << 10) + (n - 56320), a++)), s += r < 128 ? 1 : r < 2048 ? 2 : r < 65536 ? 3 : 4;
  for (e = new Ln.Buf8(s), i = 0, a = 0; i < s; a++)
    r = t.charCodeAt(a), (r & 64512) === 55296 && a + 1 < o && (n = t.charCodeAt(a + 1), (n & 64512) === 56320 && (r = 65536 + (r - 55296 << 10) + (n - 56320), a++)), r < 128 ? e[i++] = r : r < 2048 ? (e[i++] = 192 | r >>> 6, e[i++] = 128 | r & 63) : r < 65536 ? (e[i++] = 224 | r >>> 12, e[i++] = 128 | r >>> 6 & 63, e[i++] = 128 | r & 63) : (e[i++] = 240 | r >>> 18, e[i++] = 128 | r >>> 12 & 63, e[i++] = 128 | r >>> 6 & 63, e[i++] = 128 | r & 63);
  return e;
};
function cc(t, e) {
  if (e < 65534 && (t.subarray && sc || !t.subarray && oc))
    return String.fromCharCode.apply(null, Ln.shrinkBuf(t, e));
  for (var r = "", n = 0; n < e; n++)
    r += String.fromCharCode(t[n]);
  return r;
}
$e.buf2binstring = function(t) {
  return cc(t, t.length);
};
$e.binstring2buf = function(t) {
  for (var e = new Ln.Buf8(t.length), r = 0, n = e.length; r < n; r++)
    e[r] = t.charCodeAt(r);
  return e;
};
$e.buf2string = function(t, e) {
  var r, n, a, i, o = e || t.length, s = new Array(o * 2);
  for (n = 0, r = 0; r < o; ) {
    if (a = t[r++], a < 128) {
      s[n++] = a;
      continue;
    }
    if (i = br[a], i > 4) {
      s[n++] = 65533, r += i - 1;
      continue;
    }
    for (a &= i === 2 ? 31 : i === 3 ? 15 : 7; i > 1 && r < o; )
      a = a << 6 | t[r++] & 63, i--;
    if (i > 1) {
      s[n++] = 65533;
      continue;
    }
    a < 65536 ? s[n++] = a : (a -= 65536, s[n++] = 55296 | a >> 10 & 1023, s[n++] = 56320 | a & 1023);
  }
  return cc(s, n);
};
$e.utf8border = function(t, e) {
  var r;
  for (e = e || t.length, e > t.length && (e = t.length), r = e - 1; r >= 0 && (t[r] & 192) === 128; )
    r--;
  return r < 0 || r === 0 ? e : r + br[t[r]] > e ? r : e;
};
function Hh() {
  this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
}
var fc = Hh, lr = Lt, ur = Xt, Ya = $e, Ja = pi, Gh = fc, lc = Object.prototype.toString, Wh = 0, ka = 4, je = 0, uo = 1, ho = 2, qh = -1, Zh = 0, Vh = 8;
function ve(t) {
  if (!(this instanceof ve)) return new ve(t);
  this.options = ur.assign({
    level: qh,
    method: Vh,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: Zh,
    to: ""
  }, t || {});
  var e = this.options;
  e.raw && e.windowBits > 0 ? e.windowBits = -e.windowBits : e.gzip && e.windowBits > 0 && e.windowBits < 16 && (e.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new Gh(), this.strm.avail_out = 0;
  var r = lr.deflateInit2(
    this.strm,
    e.level,
    e.method,
    e.windowBits,
    e.memLevel,
    e.strategy
  );
  if (r !== je)
    throw new Error(Ja[r]);
  if (e.header && lr.deflateSetHeader(this.strm, e.header), e.dictionary) {
    var n;
    if (typeof e.dictionary == "string" ? n = Ya.string2buf(e.dictionary) : lc.call(e.dictionary) === "[object ArrayBuffer]" ? n = new Uint8Array(e.dictionary) : n = e.dictionary, r = lr.deflateSetDictionary(this.strm, n), r !== je)
      throw new Error(Ja[r]);
    this._dict_set = !0;
  }
}
ve.prototype.push = function(t, e) {
  var r = this.strm, n = this.options.chunkSize, a, i;
  if (this.ended)
    return !1;
  i = e === ~~e ? e : e === !0 ? ka : Wh, typeof t == "string" ? r.input = Ya.string2buf(t) : lc.call(t) === "[object ArrayBuffer]" ? r.input = new Uint8Array(t) : r.input = t, r.next_in = 0, r.avail_in = r.input.length;
  do {
    if (r.avail_out === 0 && (r.output = new ur.Buf8(n), r.next_out = 0, r.avail_out = n), a = lr.deflate(r, i), a !== uo && a !== je)
      return this.onEnd(a), this.ended = !0, !1;
    (r.avail_out === 0 || r.avail_in === 0 && (i === ka || i === ho)) && (this.options.to === "string" ? this.onData(Ya.buf2binstring(ur.shrinkBuf(r.output, r.next_out))) : this.onData(ur.shrinkBuf(r.output, r.next_out)));
  } while ((r.avail_in > 0 || r.avail_out === 0) && a !== uo);
  return i === ka ? (a = lr.deflateEnd(this.strm), this.onEnd(a), this.ended = !0, a === je) : (i === ho && (this.onEnd(je), r.avail_out = 0), !0);
};
ve.prototype.onData = function(t) {
  this.chunks.push(t);
};
ve.prototype.onEnd = function(t) {
  t === je && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = ur.flattenChunks(this.chunks)), this.chunks = [], this.err = t, this.msg = this.strm.msg;
};
function mi(t, e) {
  var r = new ve(e);
  if (r.push(t, !0), r.err)
    throw r.msg || Ja[r.err];
  return r.result;
}
function Xh(t, e) {
  return e = e || {}, e.raw = !0, mi(t, e);
}
function Kh(t, e) {
  return e = e || {}, e.gzip = !0, mi(t, e);
}
Pr.Deflate = ve;
Pr.deflate = mi;
Pr.deflateRaw = Xh;
Pr.gzip = Kh;
var Dr = {}, Ot = {}, sn = 30, Yh = 12, Jh = function(e, r) {
  var n, a, i, o, s, l, f, c, u, d, h, w, p, m, y, _, v, S, k, O, x, g, E, A, $;
  n = e.state, a = e.next_in, A = e.input, i = a + (e.avail_in - 5), o = e.next_out, $ = e.output, s = o - (r - e.avail_out), l = o + (e.avail_out - 257), f = n.dmax, c = n.wsize, u = n.whave, d = n.wnext, h = n.window, w = n.hold, p = n.bits, m = n.lencode, y = n.distcode, _ = (1 << n.lenbits) - 1, v = (1 << n.distbits) - 1;
  t:
    do {
      p < 15 && (w += A[a++] << p, p += 8, w += A[a++] << p, p += 8), S = m[w & _];
      e:
        for (; ; ) {
          if (k = S >>> 24, w >>>= k, p -= k, k = S >>> 16 & 255, k === 0)
            $[o++] = S & 65535;
          else if (k & 16) {
            O = S & 65535, k &= 15, k && (p < k && (w += A[a++] << p, p += 8), O += w & (1 << k) - 1, w >>>= k, p -= k), p < 15 && (w += A[a++] << p, p += 8, w += A[a++] << p, p += 8), S = y[w & v];
            r:
              for (; ; ) {
                if (k = S >>> 24, w >>>= k, p -= k, k = S >>> 16 & 255, k & 16) {
                  if (x = S & 65535, k &= 15, p < k && (w += A[a++] << p, p += 8, p < k && (w += A[a++] << p, p += 8)), x += w & (1 << k) - 1, x > f) {
                    e.msg = "invalid distance too far back", n.mode = sn;
                    break t;
                  }
                  if (w >>>= k, p -= k, k = o - s, x > k) {
                    if (k = x - k, k > u && n.sane) {
                      e.msg = "invalid distance too far back", n.mode = sn;
                      break t;
                    }
                    if (g = 0, E = h, d === 0) {
                      if (g += c - k, k < O) {
                        O -= k;
                        do
                          $[o++] = h[g++];
                        while (--k);
                        g = o - x, E = $;
                      }
                    } else if (d < k) {
                      if (g += c + d - k, k -= d, k < O) {
                        O -= k;
                        do
                          $[o++] = h[g++];
                        while (--k);
                        if (g = 0, d < O) {
                          k = d, O -= k;
                          do
                            $[o++] = h[g++];
                          while (--k);
                          g = o - x, E = $;
                        }
                      }
                    } else if (g += d - k, k < O) {
                      O -= k;
                      do
                        $[o++] = h[g++];
                      while (--k);
                      g = o - x, E = $;
                    }
                    for (; O > 2; )
                      $[o++] = E[g++], $[o++] = E[g++], $[o++] = E[g++], O -= 3;
                    O && ($[o++] = E[g++], O > 1 && ($[o++] = E[g++]));
                  } else {
                    g = o - x;
                    do
                      $[o++] = $[g++], $[o++] = $[g++], $[o++] = $[g++], O -= 3;
                    while (O > 2);
                    O && ($[o++] = $[g++], O > 1 && ($[o++] = $[g++]));
                  }
                } else if (k & 64) {
                  e.msg = "invalid distance code", n.mode = sn;
                  break t;
                } else {
                  S = y[(S & 65535) + (w & (1 << k) - 1)];
                  continue r;
                }
                break;
              }
          } else if (k & 64)
            if (k & 32) {
              n.mode = Yh;
              break t;
            } else {
              e.msg = "invalid literal/length code", n.mode = sn;
              break t;
            }
          else {
            S = m[(S & 65535) + (w & (1 << k) - 1)];
            continue e;
          }
          break;
        }
    } while (a < i && o < l);
  O = p >> 3, a -= O, p -= O << 3, w &= (1 << p) - 1, e.next_in = a, e.next_out = o, e.avail_in = a < i ? 5 + (i - a) : 5 - (a - i), e.avail_out = o < l ? 257 + (l - o) : 257 - (o - l), n.hold = w, n.bits = p;
}, wo = Xt, Be = 15, po = 852, mo = 592, go = 0, Aa = 1, yo = 2, Qh = [
  /* Length codes 257..285 base */
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  13,
  15,
  17,
  19,
  23,
  27,
  31,
  35,
  43,
  51,
  59,
  67,
  83,
  99,
  115,
  131,
  163,
  195,
  227,
  258,
  0,
  0
], t0 = [
  /* Length codes 257..285 extra */
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  16,
  17,
  17,
  17,
  17,
  18,
  18,
  18,
  18,
  19,
  19,
  19,
  19,
  20,
  20,
  20,
  20,
  21,
  21,
  21,
  21,
  16,
  72,
  78
], e0 = [
  /* Distance codes 0..29 base */
  1,
  2,
  3,
  4,
  5,
  7,
  9,
  13,
  17,
  25,
  33,
  49,
  65,
  97,
  129,
  193,
  257,
  385,
  513,
  769,
  1025,
  1537,
  2049,
  3073,
  4097,
  6145,
  8193,
  12289,
  16385,
  24577,
  0,
  0
], r0 = [
  /* Distance codes 0..29 extra */
  16,
  16,
  16,
  16,
  17,
  17,
  18,
  18,
  19,
  19,
  20,
  20,
  21,
  21,
  22,
  22,
  23,
  23,
  24,
  24,
  25,
  25,
  26,
  26,
  27,
  27,
  28,
  28,
  29,
  29,
  64,
  64
], n0 = function(e, r, n, a, i, o, s, l) {
  var f = l.bits, c = 0, u = 0, d = 0, h = 0, w = 0, p = 0, m = 0, y = 0, _ = 0, v = 0, S, k, O, x, g, E = null, A = 0, $, I = new wo.Buf16(Be + 1), B = new wo.Buf16(Be + 1), N = null, K = 0, It, yt, St;
  for (c = 0; c <= Be; c++)
    I[c] = 0;
  for (u = 0; u < a; u++)
    I[r[n + u]]++;
  for (w = f, h = Be; h >= 1 && I[h] === 0; h--)
    ;
  if (w > h && (w = h), h === 0)
    return i[o++] = 1 << 24 | 64 << 16 | 0, i[o++] = 1 << 24 | 64 << 16 | 0, l.bits = 1, 0;
  for (d = 1; d < h && I[d] === 0; d++)
    ;
  for (w < d && (w = d), y = 1, c = 1; c <= Be; c++)
    if (y <<= 1, y -= I[c], y < 0)
      return -1;
  if (y > 0 && (e === go || h !== 1))
    return -1;
  for (B[1] = 0, c = 1; c < Be; c++)
    B[c + 1] = B[c] + I[c];
  for (u = 0; u < a; u++)
    r[n + u] !== 0 && (s[B[r[n + u]]++] = u);
  if (e === go ? (E = N = s, $ = 19) : e === Aa ? (E = Qh, A -= 257, N = t0, K -= 257, $ = 256) : (E = e0, N = r0, $ = -1), v = 0, u = 0, c = d, g = o, p = w, m = 0, O = -1, _ = 1 << w, x = _ - 1, e === Aa && _ > po || e === yo && _ > mo)
    return 1;
  for (; ; ) {
    It = c - m, s[u] < $ ? (yt = 0, St = s[u]) : s[u] > $ ? (yt = N[K + s[u]], St = E[A + s[u]]) : (yt = 96, St = 0), S = 1 << c - m, k = 1 << p, d = k;
    do
      k -= S, i[g + (v >> m) + k] = It << 24 | yt << 16 | St | 0;
    while (k !== 0);
    for (S = 1 << c - 1; v & S; )
      S >>= 1;
    if (S !== 0 ? (v &= S - 1, v += S) : v = 0, u++, --I[c] === 0) {
      if (c === h)
        break;
      c = r[n + s[u]];
    }
    if (c > w && (v & x) !== O) {
      for (m === 0 && (m = w), g += d, p = c - m, y = 1 << p; p + m < h && (y -= I[p + m], !(y <= 0)); )
        p++, y <<= 1;
      if (_ += 1 << p, e === Aa && _ > po || e === yo && _ > mo)
        return 1;
      O = v & x, i[O] = w << 24 | p << 16 | g - o | 0;
    }
  }
  return v !== 0 && (i[g + v] = c - m << 24 | 64 << 16 | 0), l.bits = w, 0;
}, mt = Xt, Qa = Qs, Dt = tc, a0 = Jh, dr = n0, i0 = 0, uc = 1, dc = 2, _o = 4, o0 = 5, cn = 6, xe = 0, s0 = 1, c0 = 2, Et = -2, hc = -3, wc = -4, f0 = -5, bo = 8, pc = 1, vo = 2, xo = 3, Eo = 4, So = 5, ko = 6, Ao = 7, $o = 8, Ro = 9, Oo = 10, An = 11, Ht = 12, $a = 13, To = 14, Ra = 15, Io = 16, Po = 17, Bo = 18, Co = 19, fn = 20, ln = 21, Do = 22, No = 23, Fo = 24, jo = 25, Uo = 26, Oa = 27, Mo = 28, zo = 29, W = 30, mc = 31, l0 = 32, u0 = 852, d0 = 592, h0 = 15, w0 = h0;
function Lo(t) {
  return (t >>> 24 & 255) + (t >>> 8 & 65280) + ((t & 65280) << 8) + ((t & 255) << 24);
}
function p0() {
  this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new mt.Buf16(320), this.work = new mt.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
}
function gc(t) {
  var e;
  return !t || !t.state ? Et : (e = t.state, t.total_in = t.total_out = e.total = 0, t.msg = "", e.wrap && (t.adler = e.wrap & 1), e.mode = pc, e.last = 0, e.havedict = 0, e.dmax = 32768, e.head = null, e.hold = 0, e.bits = 0, e.lencode = e.lendyn = new mt.Buf32(u0), e.distcode = e.distdyn = new mt.Buf32(d0), e.sane = 1, e.back = -1, xe);
}
function yc(t) {
  var e;
  return !t || !t.state ? Et : (e = t.state, e.wsize = 0, e.whave = 0, e.wnext = 0, gc(t));
}
function _c(t, e) {
  var r, n;
  return !t || !t.state || (n = t.state, e < 0 ? (r = 0, e = -e) : (r = (e >> 4) + 1, e < 48 && (e &= 15)), e && (e < 8 || e > 15)) ? Et : (n.window !== null && n.wbits !== e && (n.window = null), n.wrap = r, n.wbits = e, yc(t));
}
function bc(t, e) {
  var r, n;
  return t ? (n = new p0(), t.state = n, n.window = null, r = _c(t, e), r !== xe && (t.state = null), r) : Et;
}
function m0(t) {
  return bc(t, w0);
}
var Ho = !0, Ta, Ia;
function g0(t) {
  if (Ho) {
    var e;
    for (Ta = new mt.Buf32(512), Ia = new mt.Buf32(32), e = 0; e < 144; )
      t.lens[e++] = 8;
    for (; e < 256; )
      t.lens[e++] = 9;
    for (; e < 280; )
      t.lens[e++] = 7;
    for (; e < 288; )
      t.lens[e++] = 8;
    for (dr(uc, t.lens, 0, 288, Ta, 0, t.work, { bits: 9 }), e = 0; e < 32; )
      t.lens[e++] = 5;
    dr(dc, t.lens, 0, 32, Ia, 0, t.work, { bits: 5 }), Ho = !1;
  }
  t.lencode = Ta, t.lenbits = 9, t.distcode = Ia, t.distbits = 5;
}
function vc(t, e, r, n) {
  var a, i = t.state;
  return i.window === null && (i.wsize = 1 << i.wbits, i.wnext = 0, i.whave = 0, i.window = new mt.Buf8(i.wsize)), n >= i.wsize ? (mt.arraySet(i.window, e, r - i.wsize, i.wsize, 0), i.wnext = 0, i.whave = i.wsize) : (a = i.wsize - i.wnext, a > n && (a = n), mt.arraySet(i.window, e, r - n, a, i.wnext), n -= a, n ? (mt.arraySet(i.window, e, r - n, n, 0), i.wnext = n, i.whave = i.wsize) : (i.wnext += a, i.wnext === i.wsize && (i.wnext = 0), i.whave < i.wsize && (i.whave += a))), 0;
}
function y0(t, e) {
  var r, n, a, i, o, s, l, f, c, u, d, h, w, p, m = 0, y, _, v, S, k, O, x, g, E = new mt.Buf8(4), A, $, I = (
    /* permutation of code lengths */
    [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
  );
  if (!t || !t.state || !t.output || !t.input && t.avail_in !== 0)
    return Et;
  r = t.state, r.mode === Ht && (r.mode = $a), o = t.next_out, a = t.output, l = t.avail_out, i = t.next_in, n = t.input, s = t.avail_in, f = r.hold, c = r.bits, u = s, d = l, g = xe;
  t:
    for (; ; )
      switch (r.mode) {
        case pc:
          if (r.wrap === 0) {
            r.mode = $a;
            break;
          }
          for (; c < 16; ) {
            if (s === 0)
              break t;
            s--, f += n[i++] << c, c += 8;
          }
          if (r.wrap & 2 && f === 35615) {
            r.check = 0, E[0] = f & 255, E[1] = f >>> 8 & 255, r.check = Dt(r.check, E, 2, 0), f = 0, c = 0, r.mode = vo;
            break;
          }
          if (r.flags = 0, r.head && (r.head.done = !1), !(r.wrap & 1) || /* check if zlib header allowed */
          (((f & 255) << 8) + (f >> 8)) % 31) {
            t.msg = "incorrect header check", r.mode = W;
            break;
          }
          if ((f & 15) !== bo) {
            t.msg = "unknown compression method", r.mode = W;
            break;
          }
          if (f >>>= 4, c -= 4, x = (f & 15) + 8, r.wbits === 0)
            r.wbits = x;
          else if (x > r.wbits) {
            t.msg = "invalid window size", r.mode = W;
            break;
          }
          r.dmax = 1 << x, t.adler = r.check = 1, r.mode = f & 512 ? Oo : Ht, f = 0, c = 0;
          break;
        case vo:
          for (; c < 16; ) {
            if (s === 0)
              break t;
            s--, f += n[i++] << c, c += 8;
          }
          if (r.flags = f, (r.flags & 255) !== bo) {
            t.msg = "unknown compression method", r.mode = W;
            break;
          }
          if (r.flags & 57344) {
            t.msg = "unknown header flags set", r.mode = W;
            break;
          }
          r.head && (r.head.text = f >> 8 & 1), r.flags & 512 && (E[0] = f & 255, E[1] = f >>> 8 & 255, r.check = Dt(r.check, E, 2, 0)), f = 0, c = 0, r.mode = xo;
        case xo:
          for (; c < 32; ) {
            if (s === 0)
              break t;
            s--, f += n[i++] << c, c += 8;
          }
          r.head && (r.head.time = f), r.flags & 512 && (E[0] = f & 255, E[1] = f >>> 8 & 255, E[2] = f >>> 16 & 255, E[3] = f >>> 24 & 255, r.check = Dt(r.check, E, 4, 0)), f = 0, c = 0, r.mode = Eo;
        case Eo:
          for (; c < 16; ) {
            if (s === 0)
              break t;
            s--, f += n[i++] << c, c += 8;
          }
          r.head && (r.head.xflags = f & 255, r.head.os = f >> 8), r.flags & 512 && (E[0] = f & 255, E[1] = f >>> 8 & 255, r.check = Dt(r.check, E, 2, 0)), f = 0, c = 0, r.mode = So;
        case So:
          if (r.flags & 1024) {
            for (; c < 16; ) {
              if (s === 0)
                break t;
              s--, f += n[i++] << c, c += 8;
            }
            r.length = f, r.head && (r.head.extra_len = f), r.flags & 512 && (E[0] = f & 255, E[1] = f >>> 8 & 255, r.check = Dt(r.check, E, 2, 0)), f = 0, c = 0;
          } else r.head && (r.head.extra = null);
          r.mode = ko;
        case ko:
          if (r.flags & 1024 && (h = r.length, h > s && (h = s), h && (r.head && (x = r.head.extra_len - r.length, r.head.extra || (r.head.extra = new Array(r.head.extra_len)), mt.arraySet(
            r.head.extra,
            n,
            i,
            // extra field is limited to 65536 bytes
            // - no need for additional size check
            h,
            /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
            x
          )), r.flags & 512 && (r.check = Dt(r.check, n, h, i)), s -= h, i += h, r.length -= h), r.length))
            break t;
          r.length = 0, r.mode = Ao;
        case Ao:
          if (r.flags & 2048) {
            if (s === 0)
              break t;
            h = 0;
            do
              x = n[i + h++], r.head && x && r.length < 65536 && (r.head.name += String.fromCharCode(x));
            while (x && h < s);
            if (r.flags & 512 && (r.check = Dt(r.check, n, h, i)), s -= h, i += h, x)
              break t;
          } else r.head && (r.head.name = null);
          r.length = 0, r.mode = $o;
        case $o:
          if (r.flags & 4096) {
            if (s === 0)
              break t;
            h = 0;
            do
              x = n[i + h++], r.head && x && r.length < 65536 && (r.head.comment += String.fromCharCode(x));
            while (x && h < s);
            if (r.flags & 512 && (r.check = Dt(r.check, n, h, i)), s -= h, i += h, x)
              break t;
          } else r.head && (r.head.comment = null);
          r.mode = Ro;
        case Ro:
          if (r.flags & 512) {
            for (; c < 16; ) {
              if (s === 0)
                break t;
              s--, f += n[i++] << c, c += 8;
            }
            if (f !== (r.check & 65535)) {
              t.msg = "header crc mismatch", r.mode = W;
              break;
            }
            f = 0, c = 0;
          }
          r.head && (r.head.hcrc = r.flags >> 9 & 1, r.head.done = !0), t.adler = r.check = 0, r.mode = Ht;
          break;
        case Oo:
          for (; c < 32; ) {
            if (s === 0)
              break t;
            s--, f += n[i++] << c, c += 8;
          }
          t.adler = r.check = Lo(f), f = 0, c = 0, r.mode = An;
        case An:
          if (r.havedict === 0)
            return t.next_out = o, t.avail_out = l, t.next_in = i, t.avail_in = s, r.hold = f, r.bits = c, c0;
          t.adler = r.check = 1, r.mode = Ht;
        case Ht:
          if (e === o0 || e === cn)
            break t;
        case $a:
          if (r.last) {
            f >>>= c & 7, c -= c & 7, r.mode = Oa;
            break;
          }
          for (; c < 3; ) {
            if (s === 0)
              break t;
            s--, f += n[i++] << c, c += 8;
          }
          switch (r.last = f & 1, f >>>= 1, c -= 1, f & 3) {
            case 0:
              r.mode = To;
              break;
            case 1:
              if (g0(r), r.mode = fn, e === cn) {
                f >>>= 2, c -= 2;
                break t;
              }
              break;
            case 2:
              r.mode = Po;
              break;
            case 3:
              t.msg = "invalid block type", r.mode = W;
          }
          f >>>= 2, c -= 2;
          break;
        case To:
          for (f >>>= c & 7, c -= c & 7; c < 32; ) {
            if (s === 0)
              break t;
            s--, f += n[i++] << c, c += 8;
          }
          if ((f & 65535) !== (f >>> 16 ^ 65535)) {
            t.msg = "invalid stored block lengths", r.mode = W;
            break;
          }
          if (r.length = f & 65535, f = 0, c = 0, r.mode = Ra, e === cn)
            break t;
        case Ra:
          r.mode = Io;
        case Io:
          if (h = r.length, h) {
            if (h > s && (h = s), h > l && (h = l), h === 0)
              break t;
            mt.arraySet(a, n, i, h, o), s -= h, i += h, l -= h, o += h, r.length -= h;
            break;
          }
          r.mode = Ht;
          break;
        case Po:
          for (; c < 14; ) {
            if (s === 0)
              break t;
            s--, f += n[i++] << c, c += 8;
          }
          if (r.nlen = (f & 31) + 257, f >>>= 5, c -= 5, r.ndist = (f & 31) + 1, f >>>= 5, c -= 5, r.ncode = (f & 15) + 4, f >>>= 4, c -= 4, r.nlen > 286 || r.ndist > 30) {
            t.msg = "too many length or distance symbols", r.mode = W;
            break;
          }
          r.have = 0, r.mode = Bo;
        case Bo:
          for (; r.have < r.ncode; ) {
            for (; c < 3; ) {
              if (s === 0)
                break t;
              s--, f += n[i++] << c, c += 8;
            }
            r.lens[I[r.have++]] = f & 7, f >>>= 3, c -= 3;
          }
          for (; r.have < 19; )
            r.lens[I[r.have++]] = 0;
          if (r.lencode = r.lendyn, r.lenbits = 7, A = { bits: r.lenbits }, g = dr(i0, r.lens, 0, 19, r.lencode, 0, r.work, A), r.lenbits = A.bits, g) {
            t.msg = "invalid code lengths set", r.mode = W;
            break;
          }
          r.have = 0, r.mode = Co;
        case Co:
          for (; r.have < r.nlen + r.ndist; ) {
            for (; m = r.lencode[f & (1 << r.lenbits) - 1], y = m >>> 24, _ = m >>> 16 & 255, v = m & 65535, !(y <= c); ) {
              if (s === 0)
                break t;
              s--, f += n[i++] << c, c += 8;
            }
            if (v < 16)
              f >>>= y, c -= y, r.lens[r.have++] = v;
            else {
              if (v === 16) {
                for ($ = y + 2; c < $; ) {
                  if (s === 0)
                    break t;
                  s--, f += n[i++] << c, c += 8;
                }
                if (f >>>= y, c -= y, r.have === 0) {
                  t.msg = "invalid bit length repeat", r.mode = W;
                  break;
                }
                x = r.lens[r.have - 1], h = 3 + (f & 3), f >>>= 2, c -= 2;
              } else if (v === 17) {
                for ($ = y + 3; c < $; ) {
                  if (s === 0)
                    break t;
                  s--, f += n[i++] << c, c += 8;
                }
                f >>>= y, c -= y, x = 0, h = 3 + (f & 7), f >>>= 3, c -= 3;
              } else {
                for ($ = y + 7; c < $; ) {
                  if (s === 0)
                    break t;
                  s--, f += n[i++] << c, c += 8;
                }
                f >>>= y, c -= y, x = 0, h = 11 + (f & 127), f >>>= 7, c -= 7;
              }
              if (r.have + h > r.nlen + r.ndist) {
                t.msg = "invalid bit length repeat", r.mode = W;
                break;
              }
              for (; h--; )
                r.lens[r.have++] = x;
            }
          }
          if (r.mode === W)
            break;
          if (r.lens[256] === 0) {
            t.msg = "invalid code -- missing end-of-block", r.mode = W;
            break;
          }
          if (r.lenbits = 9, A = { bits: r.lenbits }, g = dr(uc, r.lens, 0, r.nlen, r.lencode, 0, r.work, A), r.lenbits = A.bits, g) {
            t.msg = "invalid literal/lengths set", r.mode = W;
            break;
          }
          if (r.distbits = 6, r.distcode = r.distdyn, A = { bits: r.distbits }, g = dr(dc, r.lens, r.nlen, r.ndist, r.distcode, 0, r.work, A), r.distbits = A.bits, g) {
            t.msg = "invalid distances set", r.mode = W;
            break;
          }
          if (r.mode = fn, e === cn)
            break t;
        case fn:
          r.mode = ln;
        case ln:
          if (s >= 6 && l >= 258) {
            t.next_out = o, t.avail_out = l, t.next_in = i, t.avail_in = s, r.hold = f, r.bits = c, a0(t, d), o = t.next_out, a = t.output, l = t.avail_out, i = t.next_in, n = t.input, s = t.avail_in, f = r.hold, c = r.bits, r.mode === Ht && (r.back = -1);
            break;
          }
          for (r.back = 0; m = r.lencode[f & (1 << r.lenbits) - 1], y = m >>> 24, _ = m >>> 16 & 255, v = m & 65535, !(y <= c); ) {
            if (s === 0)
              break t;
            s--, f += n[i++] << c, c += 8;
          }
          if (_ && !(_ & 240)) {
            for (S = y, k = _, O = v; m = r.lencode[O + ((f & (1 << S + k) - 1) >> S)], y = m >>> 24, _ = m >>> 16 & 255, v = m & 65535, !(S + y <= c); ) {
              if (s === 0)
                break t;
              s--, f += n[i++] << c, c += 8;
            }
            f >>>= S, c -= S, r.back += S;
          }
          if (f >>>= y, c -= y, r.back += y, r.length = v, _ === 0) {
            r.mode = Uo;
            break;
          }
          if (_ & 32) {
            r.back = -1, r.mode = Ht;
            break;
          }
          if (_ & 64) {
            t.msg = "invalid literal/length code", r.mode = W;
            break;
          }
          r.extra = _ & 15, r.mode = Do;
        case Do:
          if (r.extra) {
            for ($ = r.extra; c < $; ) {
              if (s === 0)
                break t;
              s--, f += n[i++] << c, c += 8;
            }
            r.length += f & (1 << r.extra) - 1, f >>>= r.extra, c -= r.extra, r.back += r.extra;
          }
          r.was = r.length, r.mode = No;
        case No:
          for (; m = r.distcode[f & (1 << r.distbits) - 1], y = m >>> 24, _ = m >>> 16 & 255, v = m & 65535, !(y <= c); ) {
            if (s === 0)
              break t;
            s--, f += n[i++] << c, c += 8;
          }
          if (!(_ & 240)) {
            for (S = y, k = _, O = v; m = r.distcode[O + ((f & (1 << S + k) - 1) >> S)], y = m >>> 24, _ = m >>> 16 & 255, v = m & 65535, !(S + y <= c); ) {
              if (s === 0)
                break t;
              s--, f += n[i++] << c, c += 8;
            }
            f >>>= S, c -= S, r.back += S;
          }
          if (f >>>= y, c -= y, r.back += y, _ & 64) {
            t.msg = "invalid distance code", r.mode = W;
            break;
          }
          r.offset = v, r.extra = _ & 15, r.mode = Fo;
        case Fo:
          if (r.extra) {
            for ($ = r.extra; c < $; ) {
              if (s === 0)
                break t;
              s--, f += n[i++] << c, c += 8;
            }
            r.offset += f & (1 << r.extra) - 1, f >>>= r.extra, c -= r.extra, r.back += r.extra;
          }
          if (r.offset > r.dmax) {
            t.msg = "invalid distance too far back", r.mode = W;
            break;
          }
          r.mode = jo;
        case jo:
          if (l === 0)
            break t;
          if (h = d - l, r.offset > h) {
            if (h = r.offset - h, h > r.whave && r.sane) {
              t.msg = "invalid distance too far back", r.mode = W;
              break;
            }
            h > r.wnext ? (h -= r.wnext, w = r.wsize - h) : w = r.wnext - h, h > r.length && (h = r.length), p = r.window;
          } else
            p = a, w = o - r.offset, h = r.length;
          h > l && (h = l), l -= h, r.length -= h;
          do
            a[o++] = p[w++];
          while (--h);
          r.length === 0 && (r.mode = ln);
          break;
        case Uo:
          if (l === 0)
            break t;
          a[o++] = r.length, l--, r.mode = ln;
          break;
        case Oa:
          if (r.wrap) {
            for (; c < 32; ) {
              if (s === 0)
                break t;
              s--, f |= n[i++] << c, c += 8;
            }
            if (d -= l, t.total_out += d, r.total += d, d && (t.adler = r.check = /*UPDATE(state.check, put - _out, _out);*/
            r.flags ? Dt(r.check, a, d, o - d) : Qa(r.check, a, d, o - d)), d = l, (r.flags ? f : Lo(f)) !== r.check) {
              t.msg = "incorrect data check", r.mode = W;
              break;
            }
            f = 0, c = 0;
          }
          r.mode = Mo;
        case Mo:
          if (r.wrap && r.flags) {
            for (; c < 32; ) {
              if (s === 0)
                break t;
              s--, f += n[i++] << c, c += 8;
            }
            if (f !== (r.total & 4294967295)) {
              t.msg = "incorrect length check", r.mode = W;
              break;
            }
            f = 0, c = 0;
          }
          r.mode = zo;
        case zo:
          g = s0;
          break t;
        case W:
          g = hc;
          break t;
        case mc:
          return wc;
        case l0:
        default:
          return Et;
      }
  return t.next_out = o, t.avail_out = l, t.next_in = i, t.avail_in = s, r.hold = f, r.bits = c, (r.wsize || d !== t.avail_out && r.mode < W && (r.mode < Oa || e !== _o)) && vc(t, t.output, t.next_out, d - t.avail_out), u -= t.avail_in, d -= t.avail_out, t.total_in += u, t.total_out += d, r.total += d, r.wrap && d && (t.adler = r.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
  r.flags ? Dt(r.check, a, d, t.next_out - d) : Qa(r.check, a, d, t.next_out - d)), t.data_type = r.bits + (r.last ? 64 : 0) + (r.mode === Ht ? 128 : 0) + (r.mode === fn || r.mode === Ra ? 256 : 0), (u === 0 && d === 0 || e === _o) && g === xe && (g = f0), g;
}
function _0(t) {
  if (!t || !t.state)
    return Et;
  var e = t.state;
  return e.window && (e.window = null), t.state = null, xe;
}
function b0(t, e) {
  var r;
  return !t || !t.state || (r = t.state, !(r.wrap & 2)) ? Et : (r.head = e, e.done = !1, xe);
}
function v0(t, e) {
  var r = e.length, n, a, i;
  return !t || !t.state || (n = t.state, n.wrap !== 0 && n.mode !== An) ? Et : n.mode === An && (a = 1, a = Qa(a, e, r, 0), a !== n.check) ? hc : (i = vc(t, e, r, r), i ? (n.mode = mc, wc) : (n.havedict = 1, xe));
}
Ot.inflateReset = yc;
Ot.inflateReset2 = _c;
Ot.inflateResetKeep = gc;
Ot.inflateInit = m0;
Ot.inflateInit2 = bc;
Ot.inflate = y0;
Ot.inflateEnd = _0;
Ot.inflateGetHeader = b0;
Ot.inflateSetDictionary = v0;
Ot.inflateInfo = "pako inflate (from Nodeca project)";
var xc = {
  /* Allowed flush values; see deflate() and inflate() below for details */
  Z_NO_FLUSH: 0,
  Z_PARTIAL_FLUSH: 1,
  Z_SYNC_FLUSH: 2,
  Z_FULL_FLUSH: 3,
  Z_FINISH: 4,
  Z_BLOCK: 5,
  Z_TREES: 6,
  /* Return codes for the compression/decompression functions. Negative values
  * are errors, positive values are used for special but normal events.
  */
  Z_OK: 0,
  Z_STREAM_END: 1,
  Z_NEED_DICT: 2,
  Z_ERRNO: -1,
  Z_STREAM_ERROR: -2,
  Z_DATA_ERROR: -3,
  //Z_MEM_ERROR:     -4,
  Z_BUF_ERROR: -5,
  //Z_VERSION_ERROR: -6,
  /* compression levels */
  Z_NO_COMPRESSION: 0,
  Z_BEST_SPEED: 1,
  Z_BEST_COMPRESSION: 9,
  Z_DEFAULT_COMPRESSION: -1,
  Z_FILTERED: 1,
  Z_HUFFMAN_ONLY: 2,
  Z_RLE: 3,
  Z_FIXED: 4,
  Z_DEFAULT_STRATEGY: 0,
  /* Possible values of the data_type field (though see inflate()) */
  Z_BINARY: 0,
  Z_TEXT: 1,
  //Z_ASCII:                1, // = Z_TEXT (deprecated)
  Z_UNKNOWN: 2,
  /* The deflate compression method */
  Z_DEFLATED: 8
  //Z_NULL:                 null // Use -1 or null inline, depending on var type
};
function x0() {
  this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
}
var E0 = x0, Ue = Ot, hr = Xt, bn = $e, V = xc, ti = pi, S0 = fc, k0 = E0, Ec = Object.prototype.toString;
function Ee(t) {
  if (!(this instanceof Ee)) return new Ee(t);
  this.options = hr.assign({
    chunkSize: 16384,
    windowBits: 0,
    to: ""
  }, t || {});
  var e = this.options;
  e.raw && e.windowBits >= 0 && e.windowBits < 16 && (e.windowBits = -e.windowBits, e.windowBits === 0 && (e.windowBits = -15)), e.windowBits >= 0 && e.windowBits < 16 && !(t && t.windowBits) && (e.windowBits += 32), e.windowBits > 15 && e.windowBits < 48 && (e.windowBits & 15 || (e.windowBits |= 15)), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new S0(), this.strm.avail_out = 0;
  var r = Ue.inflateInit2(
    this.strm,
    e.windowBits
  );
  if (r !== V.Z_OK)
    throw new Error(ti[r]);
  if (this.header = new k0(), Ue.inflateGetHeader(this.strm, this.header), e.dictionary && (typeof e.dictionary == "string" ? e.dictionary = bn.string2buf(e.dictionary) : Ec.call(e.dictionary) === "[object ArrayBuffer]" && (e.dictionary = new Uint8Array(e.dictionary)), e.raw && (r = Ue.inflateSetDictionary(this.strm, e.dictionary), r !== V.Z_OK)))
    throw new Error(ti[r]);
}
Ee.prototype.push = function(t, e) {
  var r = this.strm, n = this.options.chunkSize, a = this.options.dictionary, i, o, s, l, f, c = !1;
  if (this.ended)
    return !1;
  o = e === ~~e ? e : e === !0 ? V.Z_FINISH : V.Z_NO_FLUSH, typeof t == "string" ? r.input = bn.binstring2buf(t) : Ec.call(t) === "[object ArrayBuffer]" ? r.input = new Uint8Array(t) : r.input = t, r.next_in = 0, r.avail_in = r.input.length;
  do {
    if (r.avail_out === 0 && (r.output = new hr.Buf8(n), r.next_out = 0, r.avail_out = n), i = Ue.inflate(r, V.Z_NO_FLUSH), i === V.Z_NEED_DICT && a && (i = Ue.inflateSetDictionary(this.strm, a)), i === V.Z_BUF_ERROR && c === !0 && (i = V.Z_OK, c = !1), i !== V.Z_STREAM_END && i !== V.Z_OK)
      return this.onEnd(i), this.ended = !0, !1;
    r.next_out && (r.avail_out === 0 || i === V.Z_STREAM_END || r.avail_in === 0 && (o === V.Z_FINISH || o === V.Z_SYNC_FLUSH)) && (this.options.to === "string" ? (s = bn.utf8border(r.output, r.next_out), l = r.next_out - s, f = bn.buf2string(r.output, s), r.next_out = l, r.avail_out = n - l, l && hr.arraySet(r.output, r.output, s, l, 0), this.onData(f)) : this.onData(hr.shrinkBuf(r.output, r.next_out))), r.avail_in === 0 && r.avail_out === 0 && (c = !0);
  } while ((r.avail_in > 0 || r.avail_out === 0) && i !== V.Z_STREAM_END);
  return i === V.Z_STREAM_END && (o = V.Z_FINISH), o === V.Z_FINISH ? (i = Ue.inflateEnd(this.strm), this.onEnd(i), this.ended = !0, i === V.Z_OK) : (o === V.Z_SYNC_FLUSH && (this.onEnd(V.Z_OK), r.avail_out = 0), !0);
};
Ee.prototype.onData = function(t) {
  this.chunks.push(t);
};
Ee.prototype.onEnd = function(t) {
  t === V.Z_OK && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = hr.flattenChunks(this.chunks)), this.chunks = [], this.err = t, this.msg = this.strm.msg;
};
function gi(t, e) {
  var r = new Ee(e);
  if (r.push(t, !0), r.err)
    throw r.msg || ti[r.err];
  return r.result;
}
function A0(t, e) {
  return e = e || {}, e.raw = !0, gi(t, e);
}
Dr.Inflate = Ee;
Dr.inflate = gi;
Dr.inflateRaw = A0;
Dr.ungzip = gi;
var $0 = Xt.assign, R0 = Pr, O0 = Dr, T0 = xc, Sc = {};
$0(Sc, R0, O0, T0);
var I0 = Sc;
const Go = (t, e) => function(...r) {
  const n = e.promiseModule;
  return new n((a, i) => {
    e.multiArgs ? r.push((...o) => {
      e.errorFirst ? o[0] ? i(o) : (o.shift(), a(o)) : a(o);
    }) : e.errorFirst ? r.push((o, s) => {
      o ? i(o) : a(s);
    }) : r.push(a), t.apply(this, r);
  });
};
var P0 = (t, e) => {
  e = Object.assign({
    exclude: [/.+(Sync|Stream)$/],
    errorFirst: !0,
    promiseModule: Promise
  }, e);
  const r = typeof t;
  if (!(t !== null && (r === "object" || r === "function")))
    throw new TypeError(`Expected \`input\` to be a \`Function\` or \`Object\`, got \`${t === null ? "null" : r}\``);
  const n = (i) => {
    const o = (s) => typeof s == "string" ? i === s : s.test(i);
    return e.include ? e.include.some(o) : !e.exclude.some(o);
  };
  let a;
  r === "function" ? a = function(...i) {
    return e.excludeMain ? t(...i) : Go(t, e).apply(this, i);
  } : a = Object.create(Object.getPrototypeOf(t));
  for (const i in t) {
    const o = t[i];
    a[i] = typeof o == "function" && n(i) ? Go(o, e) : o;
  }
  return a;
};
function Wo(t) {
  return Array.isArray(t) ? t : [t];
}
const ei = "", qo = " ", Pa = "\\", B0 = /^\s+$/, C0 = /(?:[^\\]|^)\\$/, D0 = /^\\!/, N0 = /^\\#/, F0 = /\r?\n/g, j0 = /^\.*\/|^\.+$/, Ba = "/";
let kc = "node-ignore";
typeof Symbol < "u" && (kc = Symbol.for("node-ignore"));
const Zo = kc, U0 = (t, e, r) => Object.defineProperty(t, e, { value: r }), M0 = /([0-z])-([0-z])/g, Ac = () => !1, z0 = (t) => t.replace(
  M0,
  (e, r, n) => r.charCodeAt(0) <= n.charCodeAt(0) ? e : ei
), L0 = (t) => {
  const { length: e } = t;
  return t.slice(0, e - e % 2);
}, H0 = [
  [
    // remove BOM
    // TODO:
    // Other similar zero-width characters?
    /^\uFEFF/,
    () => ei
  ],
  // > Trailing spaces are ignored unless they are quoted with backslash ("\")
  [
    // (a\ ) -> (a )
    // (a  ) -> (a)
    // (a ) -> (a)
    // (a \ ) -> (a  )
    /((?:\\\\)*?)(\\?\s+)$/,
    (t, e, r) => e + (r.indexOf("\\") === 0 ? qo : ei)
  ],
  // replace (\ ) with ' '
  // (\ ) -> ' '
  // (\\ ) -> '\\ '
  // (\\\ ) -> '\\ '
  [
    /(\\+?)\s/g,
    (t, e) => {
      const { length: r } = e;
      return e.slice(0, r - r % 2) + qo;
    }
  ],
  // Escape metacharacters
  // which is written down by users but means special for regular expressions.
  // > There are 12 characters with special meanings:
  // > - the backslash \,
  // > - the caret ^,
  // > - the dollar sign $,
  // > - the period or dot .,
  // > - the vertical bar or pipe symbol |,
  // > - the question mark ?,
  // > - the asterisk or star *,
  // > - the plus sign +,
  // > - the opening parenthesis (,
  // > - the closing parenthesis ),
  // > - and the opening square bracket [,
  // > - the opening curly brace {,
  // > These special characters are often called "metacharacters".
  [
    /[\\$.|*+(){^]/g,
    (t) => `\\${t}`
  ],
  [
    // > a question mark (?) matches a single character
    /(?!\\)\?/g,
    () => "[^/]"
  ],
  // leading slash
  [
    // > A leading slash matches the beginning of the pathname.
    // > For example, "/*.c" matches "cat-file.c" but not "mozilla-sha1/sha1.c".
    // A leading slash matches the beginning of the pathname
    /^\//,
    () => "^"
  ],
  // replace special metacharacter slash after the leading slash
  [
    /\//g,
    () => "\\/"
  ],
  [
    // > A leading "**" followed by a slash means match in all directories.
    // > For example, "**/foo" matches file or directory "foo" anywhere,
    // > the same as pattern "foo".
    // > "**/foo/bar" matches file or directory "bar" anywhere that is directly
    // >   under directory "foo".
    // Notice that the '*'s have been replaced as '\\*'
    /^\^*\\\*\\\*\\\//,
    // '**/foo' <-> 'foo'
    () => "^(?:.*\\/)?"
  ],
  // starting
  [
    // there will be no leading '/'
    //   (which has been replaced by section "leading slash")
    // If starts with '**', adding a '^' to the regular expression also works
    /^(?=[^^])/,
    function() {
      return /\/(?!$)/.test(this) ? "^" : "(?:^|\\/)";
    }
  ],
  // two globstars
  [
    // Use lookahead assertions so that we could match more than one `'/**'`
    /\\\/\\\*\\\*(?=\\\/|$)/g,
    // Zero, one or several directories
    // should not use '*', or it will be replaced by the next replacer
    // Check if it is not the last `'/**'`
    (t, e, r) => e + 6 < r.length ? "(?:\\/[^\\/]+)*" : "\\/.+"
  ],
  // normal intermediate wildcards
  [
    // Never replace escaped '*'
    // ignore rule '\*' will match the path '*'
    // 'abc.*/' -> go
    // 'abc.*'  -> skip this rule,
    //    coz trailing single wildcard will be handed by [trailing wildcard]
    /(^|[^\\]+)(\\\*)+(?=.+)/g,
    // '*.js' matches '.js'
    // '*.js' doesn't match 'abc'
    (t, e, r) => {
      const n = r.replace(/\\\*/g, "[^\\/]*");
      return e + n;
    }
  ],
  [
    // unescape, revert step 3 except for back slash
    // For example, if a user escape a '\\*',
    // after step 3, the result will be '\\\\\\*'
    /\\\\\\(?=[$.|*+(){^])/g,
    () => Pa
  ],
  [
    // '\\\\' -> '\\'
    /\\\\/g,
    () => Pa
  ],
  [
    // > The range notation, e.g. [a-zA-Z],
    // > can be used to match one of the characters in a range.
    // `\` is escaped by step 3
    /(\\)?\[([^\]/]*?)(\\*)($|\])/g,
    (t, e, r, n, a) => e === Pa ? `\\[${r}${L0(n)}${a}` : a === "]" && n.length % 2 === 0 ? `[${z0(r)}${n}]` : "[]"
  ],
  // ending
  [
    // 'js' will not match 'js.'
    // 'ab' will not match 'abc'
    /(?:[^*])$/,
    // WTF!
    // https://git-scm.com/docs/gitignore
    // changes in [2.22.1](https://git-scm.com/docs/gitignore/2.22.1)
    // which re-fixes #24, #38
    // > If there is a separator at the end of the pattern then the pattern
    // > will only match directories, otherwise the pattern can match both
    // > files and directories.
    // 'js*' will not match 'a.js'
    // 'js/' will not match 'a.js'
    // 'js' will match 'a.js' and 'a.js/'
    (t) => /\/$/.test(t) ? `${t}$` : `${t}(?=$|\\/$)`
  ],
  // trailing wildcard
  [
    /(\^|\\\/)?\\\*$/,
    (t, e) => `${e ? `${e}[^/]+` : "[^/]*"}(?=$|\\/$)`
  ]
], Vo = /* @__PURE__ */ Object.create(null), G0 = (t, e) => {
  let r = Vo[t];
  return r || (r = H0.reduce(
    (n, [a, i]) => n.replace(a, i.bind(t)),
    t
  ), Vo[t] = r), e ? new RegExp(r, "i") : new RegExp(r);
}, yi = (t) => typeof t == "string", W0 = (t) => t && yi(t) && !B0.test(t) && !C0.test(t) && t.indexOf("#") !== 0, q0 = (t) => t.split(F0);
class Z0 {
  constructor(e, r, n, a) {
    this.origin = e, this.pattern = r, this.negative = n, this.regex = a;
  }
}
const V0 = (t, e) => {
  const r = t;
  let n = !1;
  t.indexOf("!") === 0 && (n = !0, t = t.substr(1)), t = t.replace(D0, "!").replace(N0, "#");
  const a = G0(t, e);
  return new Z0(
    r,
    t,
    n,
    a
  );
}, X0 = (t, e) => {
  throw new e(t);
}, Zt = (t, e, r) => yi(t) ? t ? Zt.isNotRelative(t) ? r(
  `path should be a \`path.relative()\`d string, but got "${e}"`,
  RangeError
) : !0 : r("path must not be empty", TypeError) : r(
  `path must be a string, but got \`${e}\``,
  TypeError
), $c = (t) => j0.test(t);
Zt.isNotRelative = $c;
Zt.convert = (t) => t;
class K0 {
  constructor({
    ignorecase: e = !0,
    ignoreCase: r = e,
    allowRelativePaths: n = !1
  } = {}) {
    U0(this, Zo, !0), this._rules = [], this._ignoreCase = r, this._allowRelativePaths = n, this._initCache();
  }
  _initCache() {
    this._ignoreCache = /* @__PURE__ */ Object.create(null), this._testCache = /* @__PURE__ */ Object.create(null);
  }
  _addPattern(e) {
    if (e && e[Zo]) {
      this._rules = this._rules.concat(e._rules), this._added = !0;
      return;
    }
    if (W0(e)) {
      const r = V0(e, this._ignoreCase);
      this._added = !0, this._rules.push(r);
    }
  }
  // @param {Array<string> | string | Ignore} pattern
  add(e) {
    return this._added = !1, Wo(
      yi(e) ? q0(e) : e
    ).forEach(this._addPattern, this), this._added && this._initCache(), this;
  }
  // legacy
  addPattern(e) {
    return this.add(e);
  }
  //          |           ignored : unignored
  // negative |   0:0   |   0:1   |   1:0   |   1:1
  // -------- | ------- | ------- | ------- | --------
  //     0    |  TEST   |  TEST   |  SKIP   |    X
  //     1    |  TESTIF |  SKIP   |  TEST   |    X
  // - SKIP: always skip
  // - TEST: always test
  // - TESTIF: only test if checkUnignored
  // - X: that never happen
  // @param {boolean} whether should check if the path is unignored,
  //   setting `checkUnignored` to `false` could reduce additional
  //   path matching.
  // @returns {TestResult} true if a file is ignored
  _testOne(e, r) {
    let n = !1, a = !1;
    return this._rules.forEach((i) => {
      const { negative: o } = i;
      if (a === o && n !== a || o && !n && !a && !r)
        return;
      i.regex.test(e) && (n = !o, a = o);
    }), {
      ignored: n,
      unignored: a
    };
  }
  // @returns {TestResult}
  _test(e, r, n, a) {
    const i = e && Zt.convert(e);
    return Zt(
      i,
      e,
      this._allowRelativePaths ? Ac : X0
    ), this._t(i, r, n, a);
  }
  _t(e, r, n, a) {
    if (e in r)
      return r[e];
    if (a || (a = e.split(Ba)), a.pop(), !a.length)
      return r[e] = this._testOne(e, n);
    const i = this._t(
      a.join(Ba) + Ba,
      r,
      n,
      a
    );
    return r[e] = i.ignored ? i : this._testOne(e, n);
  }
  ignores(e) {
    return this._test(e, this._ignoreCache, !1).ignored;
  }
  createFilter() {
    return (e) => !this.ignores(e);
  }
  filter(e) {
    return Wo(e).filter(this.createFilter());
  }
  // @returns {TestResult}
  test(e) {
    return this._test(e, this._testCache, !0);
  }
}
const $n = (t) => new K0(t), Y0 = (t) => Zt(t && Zt.convert(t), t, Ac);
$n.isPathValid = Y0;
$n.default = $n;
var J0 = $n;
if (
  // Detect `process` so that it can run in browsers.
  typeof process < "u" && (process.env && process.env.IGNORE_TEST_WIN32 || process.platform === "win32")
) {
  const t = (r) => /^\\\\\?\\/.test(r) || /["<>|\u0000-\u001F]+/u.test(r) ? r : r.replace(/\\/g, "/");
  Zt.convert = t;
  const e = /^[a-z]:\//i;
  Zt.isNotRelative = (r) => e.test(r) || $c(r);
}
function Q0(t) {
  return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Nt(t, e, r) {
  return e = e instanceof RegExp ? e : new RegExp(Q0(e), "g"), t.replace(e, r);
}
var tw = {
  clean: function(e) {
    if (typeof e != "string")
      throw new Error("Expected a string, received: " + e);
    return e = Nt(e, "./", "/"), e = Nt(e, "..", "."), e = Nt(e, " ", "-"), e = Nt(e, /^[~^:?*\\\-]/g, ""), e = Nt(e, /[~^:?*\\]/g, "-"), e = Nt(e, /[~^:?*\\\-]$/g, ""), e = Nt(e, "@{", "-"), e = Nt(e, /\.$/g, ""), e = Nt(e, /\/$/g, ""), e = Nt(e, /\.lock$/g, ""), e;
  }
}, ew = tw, rw = function(t, e) {
  var r = t, n = e, a = r.length, i = n.length, o = !1, s = null, l = a + 1, f = [], c = [], u = [], d = "", h = -1, w = 0, p = 1, m, y, _ = function() {
    a >= i && (m = r, y = a, r = n, n = m, a = i, i = y, o = !0, l = a + 1);
  }, v = function(x, g, E) {
    return {
      x,
      y: g,
      k: E
    };
  }, S = function(x, g) {
    return {
      elem: x,
      t: g
    };
  }, k = function(x, g, E) {
    var A, $, I;
    for (g > E ? A = f[x - 1 + l] : A = f[x + 1 + l], I = Math.max(g, E), $ = I - x; $ < a && I < i && r[$] === n[I]; )
      ++$, ++I;
    return f[x + l] = c.length, c[c.length] = new v($, I, A), I;
  }, O = function(x) {
    var g, E, A;
    for (g = E = 0, A = x.length - 1; A >= 0; --A)
      for (; g < x[A].x || E < x[A].y; )
        x[A].y - x[A].x > E - g ? (o ? u[u.length] = new S(n[E], h) : u[u.length] = new S(n[E], p), ++E) : x[A].y - x[A].x < E - g ? (o ? u[u.length] = new S(r[g], p) : u[u.length] = new S(r[g], h), ++g) : (u[u.length] = new S(r[g], w), d += r[g], ++g, ++E);
  };
  return _(), {
    SES_DELETE: -1,
    SES_COMMON: 0,
    SES_ADD: 1,
    editdistance: function() {
      return s;
    },
    getlcs: function() {
      return d;
    },
    getses: function() {
      return u;
    },
    compose: function() {
      var x, g, E, A, $, I, B, N;
      for (x = i - a, g = a + i + 3, E = {}, B = 0; B < g; ++B)
        E[B] = -1, f[B] = -1;
      A = -1;
      do {
        for (++A, N = -A; N <= x - 1; ++N)
          E[N + l] = k(N, E[N - 1 + l] + 1, E[N + 1 + l]);
        for (N = x + A; N >= x + 1; --N)
          E[N + l] = k(N, E[N - 1 + l] + 1, E[N + 1 + l]);
        E[x + l] = k(x, E[x - 1 + l] + 1, E[x + 1 + l]);
      } while (E[x + l] !== i);
      for (s = x + 2 * A, $ = f[x + l], I = []; $ !== -1; )
        I[I.length] = new v(c[$].x, c[$].y, null), $ = c[$].k;
      O(I);
    }
  };
}, nw = rw;
function aw(t, e) {
  var r = new nw(t, e);
  r.compose();
  for (var n = r.getses(), a, i, o = t.length - 1, s = e.length - 1, l = n.length - 1; l >= 0; --l)
    n[l].t === r.SES_COMMON ? (i ? (i.chain = {
      file1index: o,
      file2index: s,
      chain: null
    }, i = i.chain) : (a = {
      file1index: o,
      file2index: s,
      chain: null
    }, i = a), o--, s--) : n[l].t === r.SES_DELETE ? o-- : n[l].t === r.SES_ADD && s--;
  var f = {
    file1index: -1,
    file2index: -1,
    chain: null
  };
  return i ? (i.chain = f, a) : f;
}
function Xo(t, e) {
  for (var r = [], n = t.length, a = e.length, i = aw(t, e); i !== null; i = i.chain) {
    var o = n - i.file1index - 1, s = a - i.file2index - 1;
    n = i.file1index, a = i.file2index, (o || s) && r.push({
      file1: [n + 1, o],
      file2: [a + 1, s]
    });
  }
  return r.reverse(), r;
}
function iw(t, e, r) {
  var n, a = Xo(e, t), i = Xo(e, r), o = [];
  function s(B, N) {
    o.push([B.file1[0], N, B.file1[1], B.file2[0], B.file2[1]]);
  }
  for (n = 0; n < a.length; n++)
    s(a[n], 0);
  for (n = 0; n < i.length; n++)
    s(i[n], 2);
  o.sort(function(B, N) {
    return B[0] - N[0];
  });
  var l = [], f = 0;
  function c(B) {
    B > f && (l.push([1, f, B - f]), f = B);
  }
  for (var u = 0; u < o.length; u++) {
    for (var d = u, h = o[u], w = h[0], p = w + h[2]; u < o.length - 1; ) {
      var m = o[u + 1], y = m[0];
      if (y > p) break;
      p = Math.max(p, y + m[2]), u++;
    }
    if (c(w), d == u)
      h[4] > 0 && l.push([h[1], h[3], h[4]]);
    else {
      var _ = {
        0: [t.length, -1, e.length, -1],
        2: [r.length, -1, e.length, -1]
      };
      for (n = d; n <= u; n++) {
        h = o[n];
        var v = h[1], S = _[v], k = h[0], O = k + h[2], x = h[3], g = x + h[4];
        S[0] = Math.min(x, S[0]), S[1] = Math.max(g, S[1]), S[2] = Math.min(k, S[2]), S[3] = Math.max(O, S[3]);
      }
      var E = _[0][0] + (w - _[0][2]), A = _[0][1] + (p - _[0][3]), $ = _[2][0] + (w - _[2][2]), I = _[2][1] + (p - _[2][3]);
      l.push([
        -1,
        E,
        A - E,
        w,
        p - w,
        $,
        I - $
      ]);
    }
    f = p;
  }
  return c(e.length), l;
}
function ow(t, e, r) {
  var n = [], a = [t, e, r], i = iw(t, e, r), o = [];
  function s() {
    o.length && n.push({
      ok: o
    }), o = [];
  }
  function l(h) {
    for (var w = 0; w < h.length; w++)
      o.push(h[w]);
  }
  function f(h) {
    if (h[2] != h[6]) return !0;
    for (var w = h[1], p = h[5], m = 0; m < h[2]; m++)
      if (t[m + w] != r[m + p]) return !0;
    return !1;
  }
  for (var c = 0; c < i.length; c++) {
    var u = i[c], d = u[0];
    d == -1 ? f(u) ? (s(), n.push({
      conflict: {
        a: t.slice(u[1], u[1] + u[2]),
        aIndex: u[1],
        o: e.slice(u[3], u[3] + u[4]),
        oIndex: u[3],
        b: r.slice(u[5], u[5] + u[6]),
        bIndex: u[5]
      }
    })) : l(a[0].slice(u[1], u[1] + u[2])) : l(a[d].slice(u[1], u[1] + u[2]));
  }
  return s(), n;
}
var sw = ow;
Object.defineProperty(P, "__esModule", { value: !0 });
function fe(t) {
  return t && typeof t == "object" && "default" in t ? t.default : t;
}
var vr = fe(Wl), Rc = fe(Ud), cw = fe(Fs), _i = fe(I0), fw = zl, un = fe(P0), lw = fe(J0), xr = fe(ew), uw = fe(sw);
class U extends Error {
  constructor(e) {
    super(e), this.caller = "";
  }
  toJSON() {
    return {
      code: this.code,
      data: this.data,
      caller: this.caller,
      message: this.message,
      stack: this.stack
    };
  }
  fromJSON(e) {
    const r = new U(e.message);
    return r.code = e.code, r.data = e.data, r.caller = e.caller, r.stack = e.stack, r;
  }
  get isIsomorphicGitError() {
    return !0;
  }
}
class Nr extends U {
  /**
   * @param {Array<string>} filepaths
   */
  constructor(e) {
    super(
      `Modifying the index is not possible because you have unmerged files: ${e.toString}. Fix them up in the work tree, and then use 'git add/rm as appropriate to mark resolution and make a commit.`
    ), this.code = this.name = Nr.code, this.data = { filepaths: e };
  }
}
Nr.code = "UnmergedPathsError";
class F extends U {
  /**
   * @param {string} message
   */
  constructor(e) {
    super(
      `An internal error caused this command to fail.

If you're not a developer, report the bug to the developers of the application you're using. If this is a bug in isomorphic-git then you should create a proper bug yourselves. The bug should include a minimal reproduction and details about the version and environment.

Please file a bug report at https://github.com/isomorphic-git/isomorphic-git/issues with this error message: ${e}`
    ), this.code = this.name = F.code, this.data = { message: e };
  }
}
F.code = "InternalError";
class Ke extends U {
  /**
   * @param {string} filepath
   */
  constructor(e) {
    super(`The filepath "${e}" contains unsafe character sequences`), this.code = this.name = Ke.code, this.data = { filepath: e };
  }
}
Ke.code = "UnsafeFilepathError";
class Mt {
  constructor(e) {
    this.buffer = e, this._start = 0;
  }
  eof() {
    return this._start >= this.buffer.length;
  }
  tell() {
    return this._start;
  }
  seek(e) {
    this._start = e;
  }
  slice(e) {
    const r = this.buffer.slice(this._start, this._start + e);
    return this._start += e, r;
  }
  toString(e, r) {
    const n = this.buffer.toString(e, this._start, this._start + r);
    return this._start += r, n;
  }
  write(e, r, n) {
    const a = this.buffer.write(e, this._start, r, n);
    return this._start += r, a;
  }
  copy(e, r, n) {
    const a = e.copy(this.buffer, this._start, r, n);
    return this._start += a, a;
  }
  readUInt8() {
    const e = this.buffer.readUInt8(this._start);
    return this._start += 1, e;
  }
  writeUInt8(e) {
    const r = this.buffer.writeUInt8(e, this._start);
    return this._start += 1, r;
  }
  readUInt16BE() {
    const e = this.buffer.readUInt16BE(this._start);
    return this._start += 2, e;
  }
  writeUInt16BE(e) {
    const r = this.buffer.writeUInt16BE(e, this._start);
    return this._start += 2, r;
  }
  readUInt32BE() {
    const e = this.buffer.readUInt32BE(this._start);
    return this._start += 4, e;
  }
  writeUInt32BE(e) {
    const r = this.buffer.writeUInt32BE(e, this._start);
    return this._start += 4, r;
  }
}
function Hn(t, e) {
  return -(t < e) || +(t > e);
}
function Oc(t, e) {
  return Hn(t.path, e.path);
}
function Tc(t) {
  let e = t > 0 ? t >> 12 : 0;
  e !== 4 && e !== 8 && e !== 10 && e !== 14 && (e = 8);
  let r = t & 511;
  return r & 73 ? r = 493 : r = 420, e !== 8 && (r = 0), (e << 12) + r;
}
const Ft = 2 ** 32;
function Ko(t, e, r, n) {
  if (t !== void 0 && e !== void 0)
    return [t, e];
  r === void 0 && (r = n.valueOf());
  const a = Math.floor(r / 1e3), i = (r - a * 1e3) * 1e6;
  return [a, i];
}
function ze(t) {
  const [e, r] = Ko(
    t.ctimeSeconds,
    t.ctimeNanoseconds,
    t.ctimeMs,
    t.ctime
  ), [n, a] = Ko(
    t.mtimeSeconds,
    t.mtimeNanoseconds,
    t.mtimeMs,
    t.mtime
  );
  return {
    ctimeSeconds: e % Ft,
    ctimeNanoseconds: r % Ft,
    mtimeSeconds: n % Ft,
    mtimeNanoseconds: a % Ft,
    dev: t.dev % Ft,
    ino: t.ino % Ft,
    mode: Tc(t.mode % Ft),
    uid: t.uid % Ft,
    gid: t.gid % Ft,
    // size of -1 happens over a BrowserFS HTTP Backend that doesn't serve Content-Length headers
    // (like the Karma webserver) because BrowserFS HTTP Backend uses HTTP HEAD requests to do fs.stat
    size: t.size > -1 ? t.size % Ft : 0
  };
}
function dw(t) {
  let e = "";
  for (const r of new Uint8Array(t))
    r < 16 && (e += "0"), e += r.toString(16);
  return e;
}
let Ca = null;
async function Vt(t) {
  return Ca === null && (Ca = await ww()), Ca ? Ic(t) : hw(t);
}
function hw(t) {
  return new Rc().update(t).digest("hex");
}
async function Ic(t) {
  const e = await crypto.subtle.digest("SHA-1", t);
  return dw(e);
}
async function ww() {
  try {
    return await Ic(new Uint8Array([])) === "da39a3ee5e6b4b0d3255bfef95601890afd80709";
  } catch {
  }
  return !1;
}
function pw(t) {
  return {
    assumeValid: !!(t & 32768),
    extended: !!(t & 16384),
    stage: (t & 12288) >> 12,
    nameLength: t & 4095
  };
}
function mw(t) {
  const e = t.flags;
  return e.extended = !1, e.nameLength = Math.min(Buffer.from(t.path).length, 4095), (e.assumeValid ? 32768 : 0) + (e.extended ? 16384 : 0) + ((e.stage & 3) << 12) + (e.nameLength & 4095);
}
class we {
  /*::
   _entries: Map<string, CacheEntry>
   _dirty: boolean // Used to determine if index needs to be saved to filesystem
   */
  constructor(e, r) {
    this._dirty = !1, this._unmergedPaths = r || /* @__PURE__ */ new Set(), this._entries = e || /* @__PURE__ */ new Map();
  }
  _addEntry(e) {
    if (e.flags.stage === 0)
      e.stages = [e], this._entries.set(e.path, e), this._unmergedPaths.delete(e.path);
    else {
      let r = this._entries.get(e.path);
      r || (this._entries.set(e.path, e), r = e), r.stages[e.flags.stage] = e, this._unmergedPaths.add(e.path);
    }
  }
  static async from(e) {
    if (Buffer.isBuffer(e))
      return we.fromBuffer(e);
    if (e === null)
      return new we(null);
    throw new F("invalid type passed to GitIndex.from");
  }
  static async fromBuffer(e) {
    if (e.length === 0)
      throw new F("Index file is empty (.git/index)");
    const r = new we(), n = new Mt(e), a = n.toString("utf8", 4);
    if (a !== "DIRC")
      throw new F(`Invalid dircache magic file number: ${a}`);
    const i = await Vt(e.slice(0, -20)), o = e.slice(-20).toString("hex");
    if (o !== i)
      throw new F(
        `Invalid checksum in GitIndex buffer: expected ${o} but saw ${i}`
      );
    const s = n.readUInt32BE();
    if (s !== 2)
      throw new F(`Unsupported dircache version: ${s}`);
    const l = n.readUInt32BE();
    let f = 0;
    for (; !n.eof() && f < l; ) {
      const c = {};
      c.ctimeSeconds = n.readUInt32BE(), c.ctimeNanoseconds = n.readUInt32BE(), c.mtimeSeconds = n.readUInt32BE(), c.mtimeNanoseconds = n.readUInt32BE(), c.dev = n.readUInt32BE(), c.ino = n.readUInt32BE(), c.mode = n.readUInt32BE(), c.uid = n.readUInt32BE(), c.gid = n.readUInt32BE(), c.size = n.readUInt32BE(), c.oid = n.slice(20).toString("hex");
      const u = n.readUInt16BE();
      c.flags = pw(u);
      const d = e.indexOf(0, n.tell() + 1) - n.tell();
      if (d < 1)
        throw new F(`Got a path length of: ${d}`);
      if (c.path = n.toString("utf8", d), c.path.includes("..\\") || c.path.includes("../"))
        throw new Ke(c.path);
      let h = 8 - (n.tell() - 12) % 8;
      for (h === 0 && (h = 8); h--; ) {
        const w = n.readUInt8();
        if (w !== 0)
          throw new F(
            `Expected 1-8 null characters but got '${w}' after ${c.path}`
          );
        if (n.eof())
          throw new F("Unexpected end of file");
      }
      c.stages = [], r._addEntry(c), f++;
    }
    return r;
  }
  get unmergedPaths() {
    return [...this._unmergedPaths];
  }
  get entries() {
    return [...this._entries.values()].sort(Oc);
  }
  get entriesMap() {
    return this._entries;
  }
  get entriesFlat() {
    return [...this.entries].flatMap((e) => e.stages.length > 1 ? e.stages.filter((r) => r) : e);
  }
  *[Symbol.iterator]() {
    for (const e of this.entries)
      yield e;
  }
  insert({ filepath: e, stats: r, oid: n, stage: a = 0 }) {
    r || (r = {
      ctimeSeconds: 0,
      ctimeNanoseconds: 0,
      mtimeSeconds: 0,
      mtimeNanoseconds: 0,
      dev: 0,
      ino: 0,
      mode: 0,
      uid: 0,
      gid: 0,
      size: 0
    }), r = ze(r);
    const i = Buffer.from(e), o = {
      ctimeSeconds: r.ctimeSeconds,
      ctimeNanoseconds: r.ctimeNanoseconds,
      mtimeSeconds: r.mtimeSeconds,
      mtimeNanoseconds: r.mtimeNanoseconds,
      dev: r.dev,
      ino: r.ino,
      // We provide a fallback value for `mode` here because not all fs
      // implementations assign it, but we use it in GitTree.
      // '100644' is for a "regular non-executable file"
      mode: r.mode || 33188,
      uid: r.uid,
      gid: r.gid,
      size: r.size,
      path: e,
      oid: n,
      flags: {
        assumeValid: !1,
        extended: !1,
        stage: a,
        nameLength: i.length < 4095 ? i.length : 4095
      },
      stages: []
    };
    this._addEntry(o), this._dirty = !0;
  }
  delete({ filepath: e }) {
    if (this._entries.has(e))
      this._entries.delete(e);
    else
      for (const r of this._entries.keys())
        r.startsWith(e + "/") && this._entries.delete(r);
    this._unmergedPaths.has(e) && this._unmergedPaths.delete(e), this._dirty = !0;
  }
  clear() {
    this._entries.clear(), this._dirty = !0;
  }
  has({ filepath: e }) {
    return this._entries.has(e);
  }
  render() {
    return this.entries.map((e) => `${e.mode.toString(8)} ${e.oid}    ${e.path}`).join(`
`);
  }
  static async _entryToBuffer(e) {
    const r = Buffer.from(e.path), n = Math.ceil((62 + r.length + 1) / 8) * 8, a = Buffer.alloc(n), i = new Mt(a), o = ze(e);
    return i.writeUInt32BE(o.ctimeSeconds), i.writeUInt32BE(o.ctimeNanoseconds), i.writeUInt32BE(o.mtimeSeconds), i.writeUInt32BE(o.mtimeNanoseconds), i.writeUInt32BE(o.dev), i.writeUInt32BE(o.ino), i.writeUInt32BE(o.mode), i.writeUInt32BE(o.uid), i.writeUInt32BE(o.gid), i.writeUInt32BE(o.size), i.write(e.oid, 20, "hex"), i.writeUInt16BE(mw(e)), i.write(e.path, r.length, "utf8"), a;
  }
  async toObject() {
    const e = Buffer.alloc(12), r = new Mt(e);
    r.write("DIRC", 4, "utf8"), r.writeUInt32BE(2), r.writeUInt32BE(this.entriesFlat.length);
    let n = [];
    for (const s of this.entries)
      if (n.push(we._entryToBuffer(s)), s.stages.length > 1)
        for (const l of s.stages)
          l && l !== s && n.push(we._entryToBuffer(l));
    n = await Promise.all(n);
    const a = Buffer.concat(n), i = Buffer.concat([e, a]), o = await Vt(i);
    return Buffer.concat([i, Buffer.from(o, "hex")]);
  }
}
function Rn(t, e, r = !0, n = !0) {
  const a = ze(t), i = ze(e);
  return r && a.mode !== i.mode || a.mtimeSeconds !== i.mtimeSeconds || a.ctimeSeconds !== i.ctimeSeconds || a.uid !== i.uid || a.gid !== i.gid || n && a.ino !== i.ino || a.size !== i.size;
}
let Da = null;
const Na = Symbol("IndexCache");
function gw() {
  return {
    map: /* @__PURE__ */ new Map(),
    stats: /* @__PURE__ */ new Map()
  };
}
async function yw(t, e, r) {
  const [n, a] = await Promise.all([
    t.lstat(e),
    t.read(e)
  ]), i = await we.from(a);
  r.map.set(e, i), r.stats.set(e, n);
}
async function _w(t, e, r) {
  const n = r.stats.get(e);
  if (n === void 0) return !0;
  if (n === null) return !1;
  const a = await t.lstat(e);
  return a === null ? !1 : Rn(n, a);
}
class Y {
  /**
   * Manages access to the Git index file, ensuring thread-safe operations and caching.
   *
   * @param {object} opts - Options for acquiring the Git index.
   * @param {FSClient} opts.fs - A file system implementation.
   * @param {string} opts.gitdir - The path to the `.git` directory.
   * @param {object} opts.cache - A shared cache object for storing index data.
   * @param {boolean} [opts.allowUnmerged=true] - Whether to allow unmerged paths in the index.
   * @param {function(GitIndex): any} closure - A function to execute with the Git index.
   * @returns {Promise<any>} The result of the closure function.
   * @throws {UnmergedPathsError} If unmerged paths exist and `allowUnmerged` is `false`.
   */
  static async acquire({ fs: e, gitdir: r, cache: n, allowUnmerged: a = !0 }, i) {
    n[Na] || (n[Na] = gw());
    const o = `${r}/index`;
    Da === null && (Da = new vr({ maxPending: 1 / 0 }));
    let s, l = [];
    return await Da.acquire(o, async () => {
      const f = n[Na];
      await _w(e, o, f) && await yw(e, o, f);
      const c = f.map.get(o);
      if (l = c.unmergedPaths, l.length && !a)
        throw new Nr(l);
      if (s = await i(c), c._dirty) {
        const u = await c.toObject();
        await e.write(o, u), f.stats.set(o, await e.lstat(o)), c._dirty = !1;
      }
    }), s;
  }
}
function On(t) {
  const e = Math.max(t.lastIndexOf("/"), t.lastIndexOf("\\"));
  return e > -1 && (t = t.slice(e + 1)), t;
}
function Se(t) {
  const e = Math.max(t.lastIndexOf("/"), t.lastIndexOf("\\"));
  return e === -1 ? "." : e === 0 ? "/" : t.slice(0, e);
}
function Pc(t) {
  const e = /* @__PURE__ */ new Map(), r = function(a) {
    if (!e.has(a)) {
      const i = {
        type: "tree",
        fullpath: a,
        basename: On(a),
        metadata: {},
        children: []
      };
      e.set(a, i), i.parent = r(Se(a)), i.parent && i.parent !== i && i.parent.children.push(i);
    }
    return e.get(a);
  }, n = function(a, i) {
    if (!e.has(a)) {
      const o = {
        type: "blob",
        fullpath: a,
        basename: On(a),
        metadata: i,
        // This recursively generates any missing parent folders.
        parent: r(Se(a)),
        children: []
      };
      o.parent && o.parent.children.push(o), e.set(a, o);
    }
    return e.get(a);
  };
  r(".");
  for (const a of t)
    n(a.path, a);
  return e;
}
function bw(t) {
  switch (t) {
    case 16384:
      return "tree";
    case 33188:
      return "blob";
    case 33261:
      return "blob";
    case 40960:
      return "blob";
    case 57344:
      return "commit";
  }
  throw new F(`Unexpected GitTree entry mode: ${t.toString(8)}`);
}
class vw {
  constructor({ fs: e, gitdir: r, cache: n }) {
    this.treePromise = Y.acquire(
      { fs: e, gitdir: r, cache: n },
      async function(i) {
        return Pc(i.entries);
      }
    );
    const a = this;
    this.ConstructEntry = class {
      constructor(o) {
        this._fullpath = o, this._type = !1, this._mode = !1, this._stat = !1, this._oid = !1;
      }
      async type() {
        return a.type(this);
      }
      async mode() {
        return a.mode(this);
      }
      async stat() {
        return a.stat(this);
      }
      async content() {
        return a.content(this);
      }
      async oid() {
        return a.oid(this);
      }
    };
  }
  async readdir(e) {
    const r = e._fullpath, a = (await this.treePromise).get(r);
    if (!a || a.type === "blob") return null;
    if (a.type !== "tree")
      throw new Error(`ENOTDIR: not a directory, scandir '${r}'`);
    const i = a.children.map((o) => o.fullpath);
    return i.sort(Hn), i;
  }
  async type(e) {
    return e._type === !1 && await e.stat(), e._type;
  }
  async mode(e) {
    return e._mode === !1 && await e.stat(), e._mode;
  }
  async stat(e) {
    if (e._stat === !1) {
      const n = (await this.treePromise).get(e._fullpath);
      if (!n)
        throw new Error(
          `ENOENT: no such file or directory, lstat '${e._fullpath}'`
        );
      const a = n.type === "tree" ? {} : ze(n.metadata);
      e._type = n.type === "tree" ? "tree" : bw(a.mode), e._mode = a.mode, n.type === "tree" ? e._stat = void 0 : e._stat = a;
    }
    return e._stat;
  }
  async content(e) {
  }
  async oid(e) {
    if (e._oid === !1) {
      const n = (await this.treePromise).get(e._fullpath);
      e._oid = n.metadata.oid;
    }
    return e._oid;
  }
}
const Gn = Symbol("GitWalkSymbol");
function Re() {
  const t = /* @__PURE__ */ Object.create(null);
  return Object.defineProperty(t, Gn, {
    value: function({ fs: e, gitdir: r, cache: n }) {
      return new vw({ fs: e, gitdir: r, cache: n });
    }
  }), Object.freeze(t), t;
}
class H extends U {
  /**
   * @param {string} what
   */
  constructor(e) {
    super(`Could not find ${e}.`), this.code = this.name = H.code, this.data = { what: e };
  }
}
H.code = "NotFoundError";
class ft extends U {
  /**
   * @param {string} oid
   * @param {'blob'|'commit'|'tag'|'tree'} actual
   * @param {'blob'|'commit'|'tag'|'tree'} expected
   * @param {string} [filepath]
   */
  constructor(e, r, n, a) {
    super(
      `Object ${e} ${a ? `at ${a}` : ""}was anticipated to be a ${n} but it is a ${r}.`
    ), this.code = this.name = ft.code, this.data = { oid: e, actual: r, expected: n, filepath: a };
  }
}
ft.code = "ObjectTypeError";
class ie extends U {
  /**
   * @param {string} value
   */
  constructor(e) {
    super(`Expected a 40-char hex object id but saw "${e}".`), this.code = this.name = ie.code, this.data = { value: e };
  }
}
ie.code = "InvalidOidError";
class Fr extends U {
  /**
   * @param {string} remote
   */
  constructor(e) {
    super(`Could not find a fetch refspec for remote "${e}". Make sure the config file has an entry like the following:
[remote "${e}"]
	fetch = +refs/heads/*:refs/remotes/origin/*
`), this.code = this.name = Fr.code, this.data = { remote: e };
  }
}
Fr.code = "NoRefspecError";
class Tn {
  constructor(e) {
    if (this.refs = /* @__PURE__ */ new Map(), this.parsedConfig = [], e) {
      let r = null;
      this.parsedConfig = e.trim().split(`
`).map((n) => {
        if (/^\s*#/.test(n))
          return { line: n, comment: !0 };
        const a = n.indexOf(" ");
        if (n.startsWith("^")) {
          const i = n.slice(1);
          return this.refs.set(r + "^{}", i), { line: n, ref: r, peeled: i };
        } else {
          const i = n.slice(0, a);
          return r = n.slice(a + 1), this.refs.set(r, i), { line: n, ref: r, oid: i };
        }
      });
    }
    return this;
  }
  static from(e) {
    return new Tn(e);
  }
  delete(e) {
    this.parsedConfig = this.parsedConfig.filter((r) => r.ref !== e), this.refs.delete(e);
  }
  toString() {
    return this.parsedConfig.map(({ line: e }) => e).join(`
`) + `
`;
  }
}
class In {
  constructor({ remotePath: e, localPath: r, force: n, matchPrefix: a }) {
    Object.assign(this, {
      remotePath: e,
      localPath: r,
      force: n,
      matchPrefix: a
    });
  }
  static from(e) {
    const [r, n, a, i, o] = e.match(/^(\+?)(.*?)(\*?):(.*?)(\*?)$/).slice(1), s = r === "+", l = a === "*";
    if (l !== (o === "*"))
      throw new F("Invalid refspec");
    return new In({
      remotePath: n,
      localPath: i,
      force: s,
      matchPrefix: l
    });
  }
  translate(e) {
    if (this.matchPrefix) {
      if (e.startsWith(this.remotePath))
        return this.localPath + e.replace(this.remotePath, "");
    } else if (e === this.remotePath) return this.localPath;
    return null;
  }
  reverseTranslate(e) {
    if (this.matchPrefix) {
      if (e.startsWith(this.localPath))
        return this.remotePath + e.replace(this.localPath, "");
    } else if (e === this.localPath) return this.remotePath;
    return null;
  }
}
class bi {
  constructor(e = []) {
    this.rules = e;
  }
  static from(e) {
    const r = [];
    for (const n of e)
      r.push(In.from(n));
    return new bi(r);
  }
  add(e) {
    const r = In.from(e);
    this.rules.push(r);
  }
  translate(e) {
    const r = [];
    for (const n of this.rules)
      for (const a of e) {
        const i = n.translate(a);
        i && r.push([a, i]);
      }
    return r;
  }
  translateOne(e) {
    let r = null;
    for (const n of this.rules) {
      const a = n.translate(e);
      a && (r = a);
    }
    return r;
  }
  localNamespaces() {
    return this.rules.filter((e) => e.matchPrefix).map((e) => e.localPath.replace(/\/$/, ""));
  }
}
function xw(t, e) {
  const r = t.replace(/\^\{\}$/, ""), n = e.replace(/\^\{\}$/, ""), a = -(r < n) || +(r > n);
  return a === 0 ? t.endsWith("^{}") ? 1 : -1 : a;
}
/*!
 * This code for `path.join` is directly copied from @zenfs/core/path for bundle size improvements.
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * Copyright (c) James Prevett and other ZenFS contributors.
 */
function Ew(t, e) {
  let r = "", n = 0, a = -1, i = 0, o = "\0";
  for (let s = 0; s <= t.length; ++s) {
    if (s < t.length) o = t[s];
    else {
      if (o === "/") break;
      o = "/";
    }
    if (o === "/") {
      if (!(a === s - 1 || i === 1)) if (i === 2) {
        if (r.length < 2 || n !== 2 || r.at(-1) !== "." || r.at(-2) !== ".") {
          if (r.length > 2) {
            const l = r.lastIndexOf("/");
            l === -1 ? (r = "", n = 0) : (r = r.slice(0, l), n = r.length - 1 - r.lastIndexOf("/")), a = s, i = 0;
            continue;
          } else if (r.length !== 0) {
            r = "", n = 0, a = s, i = 0;
            continue;
          }
        }
        e && (r += r.length > 0 ? "/.." : "..", n = 2);
      } else
        r.length > 0 ? r += "/" + t.slice(a + 1, s) : r = t.slice(a + 1, s), n = s - a - 1;
      a = s, i = 0;
    } else o === "." && i !== -1 ? ++i : i = -1;
  }
  return r;
}
function Sw(t) {
  if (!t.length) return ".";
  const e = t[0] === "/", r = t.at(-1) === "/";
  return t = Ew(t, !e), t.length ? (r && (t += "/"), e ? `/${t}` : t) : e ? "/" : r ? "./" : ".";
}
function R(...t) {
  if (t.length === 0) return ".";
  let e;
  for (let r = 0; r < t.length; ++r) {
    const n = t[r];
    n.length > 0 && (e === void 0 ? e = n : e += "/" + n);
  }
  return e === void 0 ? "." : Sw(e);
}
const kw = (t) => {
  if (typeof t == "number")
    return t;
  t = t.toLowerCase();
  let e = parseInt(t);
  return t.endsWith("k") && (e *= 1024), t.endsWith("m") && (e *= 1024 * 1024), t.endsWith("g") && (e *= 1024 * 1024 * 1024), e;
}, sr = (t) => {
  if (typeof t == "boolean")
    return t;
  if (t = t.trim().toLowerCase(), t === "true" || t === "yes" || t === "on") return !0;
  if (t === "false" || t === "no" || t === "off") return !1;
  throw Error(
    `Expected 'true', 'false', 'yes', 'no', 'on', or 'off', but got ${t}`
  );
}, Yo = {
  core: {
    filemode: sr,
    bare: sr,
    logallrefupdates: sr,
    symlinks: sr,
    ignorecase: sr,
    bigFileThreshold: kw
  }
}, Aw = /^\[([A-Za-z0-9-.]+)(?: "(.*)")?\]$/, $w = /^[A-Za-z0-9-.]+$/, Rw = /^([A-Za-z][A-Za-z-]*)(?: *= *(.*))?$/, Ow = /^[A-Za-z][A-Za-z-]*$/, Tw = /^(.*?)( *[#;].*)$/, Iw = (t) => {
  const e = Aw.exec(t);
  if (e != null) {
    const [r, n] = e.slice(1);
    return [r, n];
  }
  return null;
}, Pw = (t) => {
  const e = Rw.exec(t);
  if (e != null) {
    const [r, n = "true"] = e.slice(1), a = Bw(n), i = Cw(a);
    return [r, i];
  }
  return null;
}, Bw = (t) => {
  const e = Tw.exec(t);
  if (e == null)
    return t;
  const [r, n] = e.slice(1);
  return Jo(r) && Jo(n) ? `${r}${n}` : r;
}, Jo = (t) => (t.match(/(?:^|[^\\])"/g) || []).length % 2 !== 0, Cw = (t) => t.split("").reduce((e, r, n, a) => {
  const i = r === '"' && a[n - 1] !== "\\", o = r === "\\" && a[n + 1] === '"';
  return i || o ? e : e + r;
}, ""), Qo = (t) => t != null ? t.toLowerCase() : null, ri = (t, e, r) => [Qo(t), e, Qo(r)].filter((n) => n != null).join("."), ts = (t) => {
  const e = t.split("."), r = e.shift(), n = e.pop(), a = e.length ? e.join(".") : void 0;
  return {
    section: r,
    subsection: a,
    name: n,
    path: ri(r, a, n),
    sectionPath: ri(r, a, null),
    isSection: !!r
  };
}, Dw = (t, e) => t.reduce((r, n, a) => e(n) ? a : r, -1);
class vi {
  constructor(e) {
    let r = null, n = null;
    this.parsedConfig = e ? e.split(`
`).map((a) => {
      let i = null, o = null;
      const s = a.trim(), l = Iw(s), f = l != null;
      if (f)
        [r, n] = l;
      else {
        const u = Pw(s);
        u != null && ([i, o] = u);
      }
      const c = ri(r, n, i);
      return { line: a, isSection: f, section: r, subsection: n, name: i, value: o, path: c };
    }) : [];
  }
  static from(e) {
    return new vi(e);
  }
  async get(e, r = !1) {
    const n = ts(e).path, a = this.parsedConfig.filter((i) => i.path === n).map(({ section: i, name: o, value: s }) => {
      const l = Yo[i] && Yo[i][o];
      return l ? l(s) : s;
    });
    return r ? a : a.pop();
  }
  async getall(e) {
    return this.get(e, !0);
  }
  async getSubsections(e) {
    return this.parsedConfig.filter((r) => r.isSection && r.section === e).map((r) => r.subsection);
  }
  async deleteSection(e, r) {
    this.parsedConfig = this.parsedConfig.filter(
      (n) => !(n.section === e && n.subsection === r)
    );
  }
  async append(e, r) {
    return this.set(e, r, !0);
  }
  async set(e, r, n = !1) {
    const {
      section: a,
      subsection: i,
      name: o,
      path: s,
      sectionPath: l,
      isSection: f
    } = ts(e), c = Dw(
      this.parsedConfig,
      (u) => u.path === s
    );
    if (r == null)
      c !== -1 && this.parsedConfig.splice(c, 1);
    else if (c !== -1) {
      const u = this.parsedConfig[c], d = Object.assign({}, u, {
        name: o,
        value: r,
        modified: !0
      });
      n ? this.parsedConfig.splice(c + 1, 0, d) : this.parsedConfig[c] = d;
    } else {
      const u = this.parsedConfig.findIndex(
        (h) => h.path === l
      ), d = {
        section: a,
        subsection: i,
        name: o,
        value: r,
        modified: !0,
        path: s
      };
      if ($w.test(a) && Ow.test(o))
        if (u >= 0)
          this.parsedConfig.splice(u + 1, 0, d);
        else {
          const h = {
            isSection: f,
            section: a,
            subsection: i,
            modified: !0,
            path: l
          };
          this.parsedConfig.push(h, d);
        }
    }
  }
  toString() {
    return this.parsedConfig.map(({ line: e, section: r, subsection: n, name: a, value: i, modified: o = !1 }) => o ? a != null && i != null ? typeof i == "string" && /[#;]/.test(i) ? `	${a} = "${i}"` : `	${a} = ${i}` : n != null ? `[${r} "${n}"]` : `[${r}]` : e).join(`
`);
  }
}
class J {
  /**
   * Reads the Git configuration file from the specified `.git` directory.
   *
   * @param {object} opts - Options for reading the Git configuration.
   * @param {FSClient} opts.fs - A file system implementation.
   * @param {string} opts.gitdir - The path to the `.git` directory.
   * @returns {Promise<GitConfig>} A `GitConfig` object representing the parsed configuration.
   */
  static async get({ fs: e, gitdir: r }) {
    const n = await e.read(`${r}/config`, { encoding: "utf8" });
    return vi.from(n);
  }
  /**
   * Saves the provided Git configuration to the specified `.git` directory.
   *
   * @param {object} opts - Options for saving the Git configuration.
   * @param {FSClient} opts.fs - A file system implementation.
   * @param {string} opts.gitdir - The path to the `.git` directory.
   * @param {GitConfig} opts.config - The `GitConfig` object to save.
   * @returns {Promise<void>} Resolves when the configuration has been successfully saved.
   */
  static async save({ fs: e, gitdir: r, config: n }) {
    await e.write(`${r}/config`, n.toString(), {
      encoding: "utf8"
    });
  }
}
const dn = (t) => [
  `${t}`,
  `refs/${t}`,
  `refs/tags/${t}`,
  `refs/heads/${t}`,
  `refs/remotes/${t}`,
  `refs/remotes/${t}/HEAD`
], Nw = ["config", "description", "index", "shallow", "commondir"];
let Fa;
async function Yt(t, e) {
  return Fa === void 0 && (Fa = new vr()), Fa.acquire(t, e);
}
class T {
  /**
   * Updates remote refs based on the provided refspecs and options.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
   * @param {string} args.remote - The name of the remote.
   * @param {Map<string, string>} args.refs - A map of refs to their object IDs.
   * @param {Map<string, string>} args.symrefs - A map of symbolic refs.
   * @param {boolean} args.tags - Whether to fetch tags.
   * @param {string[]} [args.refspecs = undefined] - The refspecs to use.
   * @param {boolean} [args.prune = false] - Whether to prune stale refs.
   * @param {boolean} [args.pruneTags = false] - Whether to prune tags.
   * @returns {Promise<Object>} - An object containing pruned refs.
   */
  static async updateRemoteRefs({
    fs: e,
    gitdir: r,
    remote: n,
    refs: a,
    symrefs: i,
    tags: o,
    refspecs: s = void 0,
    prune: l = !1,
    pruneTags: f = !1
  }) {
    for (const m of a.values())
      if (!m.match(/[0-9a-f]{40}/))
        throw new ie(m);
    const c = await J.get({ fs: e, gitdir: r });
    if (!s) {
      if (s = await c.getall(`remote.${n}.fetch`), s.length === 0)
        throw new Fr(n);
      s.unshift(`+HEAD:refs/remotes/${n}/HEAD`);
    }
    const u = bi.from(s), d = /* @__PURE__ */ new Map();
    if (f) {
      const m = await T.listRefs({
        fs: e,
        gitdir: r,
        filepath: "refs/tags"
      });
      await T.deleteRefs({
        fs: e,
        gitdir: r,
        refs: m.map((y) => `refs/tags/${y}`)
      });
    }
    if (o) {
      for (const m of a.keys())
        if (m.startsWith("refs/tags") && !m.endsWith("^{}") && !await T.exists({ fs: e, gitdir: r, ref: m })) {
          const y = a.get(m);
          d.set(m, y);
        }
    }
    const h = u.translate([...a.keys()]);
    for (const [m, y] of h) {
      const _ = a.get(m);
      d.set(y, _);
    }
    const w = u.translate([...i.keys()]);
    for (const [m, y] of w) {
      const _ = i.get(m), v = u.translateOne(_);
      v && d.set(y, `ref: ${v}`);
    }
    const p = [];
    if (l) {
      for (const m of u.localNamespaces()) {
        const y = (await T.listRefs({
          fs: e,
          gitdir: r,
          filepath: m
        })).map((_) => `${m}/${_}`);
        for (const _ of y)
          d.has(_) || p.push(_);
      }
      p.length > 0 && await T.deleteRefs({ fs: e, gitdir: r, refs: p });
    }
    for (const [m, y] of d)
      await Yt(
        m,
        async () => e.write(R(r, m), `${y.trim()}
`, "utf8")
      );
    return { pruned: p };
  }
  /**
   * Writes a ref to the file system.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
   * @param {string} args.ref - The ref to write.
   * @param {string} args.value - The object ID to write.
   * @returns {Promise<void>}
   */
  // TODO: make this less crude?
  static async writeRef({ fs: e, gitdir: r, ref: n, value: a }) {
    if (!a.match(/[0-9a-f]{40}/))
      throw new ie(a);
    await Yt(
      n,
      async () => e.write(R(r, n), `${a.trim()}
`, "utf8")
    );
  }
  /**
   * Writes a symbolic ref to the file system.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
   * @param {string} args.ref - The ref to write.
   * @param {string} args.value - The target ref.
   * @returns {Promise<void>}
   */
  static async writeSymbolicRef({ fs: e, gitdir: r, ref: n, value: a }) {
    await Yt(
      n,
      async () => e.write(R(r, n), `ref: ${a.trim()}
`, "utf8")
    );
  }
  /**
   * Deletes a single ref.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
   * @param {string} args.ref - The ref to delete.
   * @returns {Promise<void>}
   */
  static async deleteRef({ fs: e, gitdir: r, ref: n }) {
    return T.deleteRefs({ fs: e, gitdir: r, refs: [n] });
  }
  /**
   * Deletes multiple refs.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
   * @param {string[]} args.refs - The refs to delete.
   * @returns {Promise<void>}
   */
  static async deleteRefs({ fs: e, gitdir: r, refs: n }) {
    await Promise.all(n.map((s) => e.rm(R(r, s))));
    let a = await Yt(
      "packed-refs",
      async () => e.read(`${r}/packed-refs`, { encoding: "utf8" })
    );
    const i = Tn.from(a), o = i.refs.size;
    for (const s of n)
      i.refs.has(s) && i.delete(s);
    i.refs.size < o && (a = i.toString(), await Yt(
      "packed-refs",
      async () => e.write(`${r}/packed-refs`, a, { encoding: "utf8" })
    ));
  }
  /**
   * Resolves a ref to its object ID.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
   * @param {string} args.ref - The ref to resolve.
   * @param {number} [args.depth = undefined] - The maximum depth to resolve symbolic refs.
   * @returns {Promise<string>} - The resolved object ID.
   */
  static async resolve({ fs: e, gitdir: r, ref: n, depth: a = void 0 }) {
    if (a !== void 0 && (a--, a === -1))
      return n;
    if (n.startsWith("ref: "))
      return n = n.slice(5), T.resolve({ fs: e, gitdir: r, ref: n, depth: a });
    if (n.length === 40 && /[0-9a-f]{40}/.test(n))
      return n;
    const i = await T.packedRefs({ fs: e, gitdir: r }), o = dn(n).filter((s) => !Nw.includes(s));
    for (const s of o) {
      const l = await Yt(
        s,
        async () => await e.read(`${r}/${s}`, { encoding: "utf8" }) || i.get(s)
      );
      if (l)
        return T.resolve({ fs: e, gitdir: r, ref: l.trim(), depth: a });
    }
    throw new H(n);
  }
  /**
   * Checks if a ref exists.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
   * @param {string} args.ref - The ref to check.
   * @returns {Promise<boolean>} - True if the ref exists, false otherwise.
   */
  static async exists({ fs: e, gitdir: r, ref: n }) {
    try {
      return await T.expand({ fs: e, gitdir: r, ref: n }), !0;
    } catch {
      return !1;
    }
  }
  /**
   * Expands a ref to its full name.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
   * @param {string} args.ref - The ref to expand.
   * @returns {Promise<string>} - The full ref name.
   */
  static async expand({ fs: e, gitdir: r, ref: n }) {
    if (n.length === 40 && /[0-9a-f]{40}/.test(n))
      return n;
    const a = await T.packedRefs({ fs: e, gitdir: r }), i = dn(n);
    for (const o of i)
      if (await Yt(
        o,
        async () => e.exists(`${r}/${o}`)
      ) || a.has(o)) return o;
    throw new H(n);
  }
  /**
   * Expands a ref against a provided map.
   *
   * @param {Object} args
   * @param {string} args.ref - The ref to expand.
   * @param {Map<string, string>} args.map - The map of refs.
   * @returns {Promise<string>} - The expanded ref.
   */
  static async expandAgainstMap({ ref: e, map: r }) {
    const n = dn(e);
    for (const a of n)
      if (await r.has(a)) return a;
    throw new H(e);
  }
  /**
   * Resolves a ref against a provided map.
   *
   * @param {Object} args
   * @param {string} args.ref - The ref to resolve.
   * @param {string} [args.fullref = args.ref] - The full ref name.
   * @param {number} [args.depth = undefined] - The maximum depth to resolve symbolic refs.
   * @param {Map<string, string>} args.map - The map of refs.
   * @returns {Object} - An object containing the full ref and its object ID.
   */
  static resolveAgainstMap({ ref: e, fullref: r = e, depth: n = void 0, map: a }) {
    if (n !== void 0 && (n--, n === -1))
      return { fullref: r, oid: e };
    if (e.startsWith("ref: "))
      return e = e.slice(5), T.resolveAgainstMap({ ref: e, fullref: r, depth: n, map: a });
    if (e.length === 40 && /[0-9a-f]{40}/.test(e))
      return { fullref: r, oid: e };
    const i = dn(e);
    for (const o of i) {
      const s = a.get(o);
      if (s)
        return T.resolveAgainstMap({
          ref: s.trim(),
          fullref: o,
          depth: n,
          map: a
        });
    }
    throw new H(e);
  }
  /**
   * Reads the packed refs file and returns a map of refs.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
   * @returns {Promise<Map<string, string>>} - A map of packed refs.
   */
  static async packedRefs({ fs: e, gitdir: r }) {
    const n = await Yt(
      "packed-refs",
      async () => e.read(`${r}/packed-refs`, { encoding: "utf8" })
    );
    return Tn.from(n).refs;
  }
  /**
   * Lists all refs matching a given filepath prefix.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
   * @param {string} args.filepath - The filepath prefix to match.
   * @returns {Promise<string[]>} - A sorted list of refs.
   */
  static async listRefs({ fs: e, gitdir: r, filepath: n }) {
    const a = T.packedRefs({ fs: e, gitdir: r });
    let i = null;
    try {
      i = await e.readdirDeep(`${r}/${n}`), i = i.map((o) => o.replace(`${r}/${n}/`, ""));
    } catch {
      i = [];
    }
    for (let o of (await a).keys())
      o.startsWith(n) && (o = o.replace(n + "/", ""), i.includes(o) || i.push(o));
    return i.sort(xw), i;
  }
  /**
   * Lists all branches, optionally filtered by remote.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
   * @param {string} [args.remote] - The remote to filter branches by.
   * @returns {Promise<string[]>} - A list of branch names.
   */
  static async listBranches({ fs: e, gitdir: r, remote: n }) {
    return n ? T.listRefs({
      fs: e,
      gitdir: r,
      filepath: `refs/remotes/${n}`
    }) : T.listRefs({ fs: e, gitdir: r, filepath: "refs/heads" });
  }
  /**
   * Lists all tags.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
   * @returns {Promise<string[]>} - A list of tag names.
   */
  static async listTags({ fs: e, gitdir: r }) {
    return (await T.listRefs({
      fs: e,
      gitdir: r,
      filepath: "refs/tags"
    })).filter((a) => !a.endsWith("^{}"));
  }
}
function Fw(t, e) {
  return Hn(es(t), es(e));
}
function es(t) {
  return t.mode === "040000" ? t.path + "/" : t.path;
}
function Bc(t) {
  switch (t) {
    case "040000":
      return "tree";
    case "100644":
      return "blob";
    case "100755":
      return "blob";
    case "120000":
      return "blob";
    case "160000":
      return "commit";
  }
  throw new F(`Unexpected GitTree entry mode: ${t}`);
}
function jw(t) {
  const e = [];
  let r = 0;
  for (; r < t.length; ) {
    const n = t.indexOf(32, r);
    if (n === -1)
      throw new F(
        `GitTree: Error parsing buffer at byte location ${r}: Could not find the next space character.`
      );
    const a = t.indexOf(0, r);
    if (a === -1)
      throw new F(
        `GitTree: Error parsing buffer at byte location ${r}: Could not find the next null character.`
      );
    let i = t.slice(r, n).toString("utf8");
    i === "40000" && (i = "040000");
    const o = Bc(i), s = t.slice(n + 1, a).toString("utf8");
    if (s.includes("\\") || s.includes("/"))
      throw new Ke(s);
    const l = t.slice(a + 1, a + 21).toString("hex");
    r = a + 21, e.push({ mode: i, path: s, oid: l, type: o });
  }
  return e;
}
function Uw(t) {
  if (typeof t == "number" && (t = t.toString(8)), t.match(/^0?4.*/)) return "040000";
  if (t.match(/^1006.*/)) return "100644";
  if (t.match(/^1007.*/)) return "100755";
  if (t.match(/^120.*/)) return "120000";
  if (t.match(/^160.*/)) return "160000";
  throw new F(`Could not understand file mode: ${t}`);
}
function Mw(t) {
  return !t.oid && t.sha && (t.oid = t.sha), t.mode = Uw(t.mode), t.type || (t.type = Bc(t.mode)), t;
}
class dt {
  constructor(e) {
    if (Buffer.isBuffer(e))
      this._entries = jw(e);
    else if (Array.isArray(e))
      this._entries = e.map(Mw);
    else
      throw new F("invalid type passed to GitTree constructor");
    this._entries.sort(Oc);
  }
  static from(e) {
    return new dt(e);
  }
  render() {
    return this._entries.map((e) => `${e.mode} ${e.type} ${e.oid}    ${e.path}`).join(`
`);
  }
  toObject() {
    const e = [...this._entries];
    return e.sort(Fw), Buffer.concat(
      e.map((r) => {
        const n = Buffer.from(r.mode.replace(/^0/, "")), a = Buffer.from(" "), i = Buffer.from(r.path, "utf8"), o = Buffer.from([0]), s = Buffer.from(r.oid, "hex");
        return Buffer.concat([n, a, i, o, s]);
      })
    );
  }
  /**
   * @returns {TreeEntry[]}
   */
  entries() {
    return this._entries;
  }
  *[Symbol.iterator]() {
    for (const e of this._entries)
      yield e;
  }
}
class Ye {
  /**
   * Wraps a raw object with a Git header.
   *
   * @param {Object} params - The parameters for wrapping.
   * @param {string} params.type - The type of the Git object (e.g., 'blob', 'tree', 'commit').
   * @param {Uint8Array} params.object - The raw object data to wrap.
   * @returns {Uint8Array} The wrapped Git object as a single buffer.
   */
  static wrap({ type: e, object: r }) {
    const n = `${e} ${r.length}\0`, a = n.length, i = a + r.length, o = new Uint8Array(i);
    for (let s = 0; s < a; s++)
      o[s] = n.charCodeAt(s);
    return o.set(r, a), o;
  }
  /**
   * Unwraps a Git object buffer into its type and raw object data.
   *
   * @param {Buffer|Uint8Array} buffer - The buffer containing the wrapped Git object.
   * @returns {{ type: string, object: Buffer }} An object containing the type and the raw object data.
   * @throws {InternalError} If the length specified in the header does not match the actual object length.
   */
  static unwrap(e) {
    const r = e.indexOf(32), n = e.indexOf(0), a = e.slice(0, r).toString("utf8"), i = e.slice(r + 1, n).toString("utf8"), o = e.length - (n + 1);
    if (parseInt(i) !== o)
      throw new F(
        `Length mismatch: expected ${i} bytes but got ${o} instead.`
      );
    return {
      type: a,
      object: Buffer.from(e.slice(n + 1))
    };
  }
}
async function Cc({ fs: t, gitdir: e, oid: r }) {
  const n = `objects/${r.slice(0, 2)}/${r.slice(2)}`, a = await t.read(`${e}/${n}`);
  return a ? { object: a, format: "deflated", source: n } : null;
}
function zw(t, e) {
  const r = new Mt(t), n = rs(r);
  if (n !== e.byteLength)
    throw new F(
      `applyDelta expected source buffer to be ${n} bytes but the provided buffer was ${e.length} bytes`
    );
  const a = rs(r);
  let i;
  const o = as(r, e);
  if (o.byteLength === a)
    i = o;
  else {
    i = Buffer.alloc(a);
    const s = new Mt(i);
    for (s.copy(o); !r.eof(); )
      s.copy(as(r, e));
    const l = s.tell();
    if (a !== l)
      throw new F(
        `applyDelta expected target buffer to be ${a} bytes but the resulting buffer was ${l} bytes`
      );
  }
  return i;
}
function rs(t) {
  let e = 0, r = 0, n = null;
  do
    n = t.readUInt8(), e |= (n & 127) << r, r += 7;
  while (n & 128);
  return e;
}
function ns(t, e, r) {
  let n = 0, a = 0;
  for (; r--; )
    e & 1 && (n |= t.readUInt8() << a), e >>= 1, a += 8;
  return n;
}
function as(t, e) {
  const r = t.readUInt8(), n = 128, a = 15, i = 112;
  if (r & n) {
    const o = ns(t, r & a, 4);
    let s = ns(t, (r & i) >> 4, 3);
    return s === 0 && (s = 65536), e.slice(o, o + s);
  } else
    return t.slice(r);
}
function Lw(t) {
  let e = [t];
  return {
    next() {
      return Promise.resolve({ done: e.length === 0, value: e.pop() });
    },
    return() {
      return e = [], {};
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
function Dc(t) {
  return t[Symbol.asyncIterator] ? t[Symbol.asyncIterator]() : t[Symbol.iterator] ? t[Symbol.iterator]() : t.next ? t : Lw(t);
}
class Nc {
  constructor(e) {
    if (typeof Buffer > "u")
      throw new Error("Missing Buffer dependency");
    this.stream = Dc(e), this.buffer = null, this.cursor = 0, this.undoCursor = 0, this.started = !1, this._ended = !1, this._discardedBytes = 0;
  }
  eof() {
    return this._ended && this.cursor === this.buffer.length;
  }
  tell() {
    return this._discardedBytes + this.cursor;
  }
  async byte() {
    if (!this.eof() && (this.started || await this._init(), !(this.cursor === this.buffer.length && (await this._loadnext(), this._ended))))
      return this._moveCursor(1), this.buffer[this.undoCursor];
  }
  async chunk() {
    if (!this.eof() && (this.started || await this._init(), !(this.cursor === this.buffer.length && (await this._loadnext(), this._ended))))
      return this._moveCursor(this.buffer.length), this.buffer.slice(this.undoCursor, this.cursor);
  }
  async read(e) {
    if (!this.eof())
      return this.started || await this._init(), this.cursor + e > this.buffer.length && (this._trim(), await this._accumulate(e)), this._moveCursor(e), this.buffer.slice(this.undoCursor, this.cursor);
  }
  async skip(e) {
    this.eof() || (this.started || await this._init(), this.cursor + e > this.buffer.length && (this._trim(), await this._accumulate(e)), this._moveCursor(e));
  }
  async undo() {
    this.cursor = this.undoCursor;
  }
  async _next() {
    this.started = !0;
    let { done: e, value: r } = await this.stream.next();
    return e && (this._ended = !0, !r) ? Buffer.alloc(0) : (r && (r = Buffer.from(r)), r);
  }
  _trim() {
    this.buffer = this.buffer.slice(this.undoCursor), this.cursor -= this.undoCursor, this._discardedBytes += this.undoCursor, this.undoCursor = 0;
  }
  _moveCursor(e) {
    this.undoCursor = this.cursor, this.cursor += e, this.cursor > this.buffer.length && (this.cursor = this.buffer.length);
  }
  async _accumulate(e) {
    if (this._ended) return;
    const r = [this.buffer];
    for (; this.cursor + e > Hw(r); ) {
      const n = await this._next();
      if (this._ended) break;
      r.push(n);
    }
    this.buffer = Buffer.concat(r);
  }
  async _loadnext() {
    this._discardedBytes += this.buffer.length, this.undoCursor = 0, this.cursor = 0, this.buffer = await this._next();
  }
  async _init() {
    this.buffer = await this._next();
  }
}
function Hw(t) {
  return t.reduce((e, r) => e + r.length, 0);
}
async function Gw(t, e) {
  const r = new Nc(t);
  let n = await r.read(4);
  if (n = n.toString("utf8"), n !== "PACK")
    throw new F(`Invalid PACK header '${n}'`);
  let a = await r.read(4);
  if (a = a.readUInt32BE(0), a !== 2)
    throw new F(`Invalid packfile version: ${a}`);
  let i = await r.read(4);
  if (i = i.readUInt32BE(0), !(i < 1))
    for (; !r.eof() && i--; ) {
      const o = r.tell(), { type: s, length: l, ofs: f, reference: c } = await Ww(r), u = new _i.Inflate();
      for (; !u.result; ) {
        const d = await r.chunk();
        if (!d) break;
        if (u.push(d, !1), u.err)
          throw new F(`Pako error: ${u.msg}`);
        if (u.result) {
          if (u.result.length !== l)
            throw new F(
              "Inflated object size is different from that stated in packfile."
            );
          await r.undo(), await r.read(d.length - u.strm.avail_in);
          const h = r.tell();
          await e({
            data: u.result,
            type: s,
            num: i,
            offset: o,
            end: h,
            reference: c,
            ofs: f
          });
        }
      }
    }
}
async function Ww(t) {
  let e = await t.byte();
  const r = e >> 4 & 7;
  let n = e & 15;
  if (e & 128) {
    let o = 4;
    do
      e = await t.byte(), n |= (e & 127) << o, o += 7;
    while (e & 128);
  }
  let a, i;
  if (r === 6) {
    let o = 0;
    a = 0;
    const s = [];
    do
      e = await t.byte(), a |= (e & 127) << o, o += 7, s.push(e);
    while (e & 128);
    i = Buffer.from(s);
  }
  return r === 7 && (i = await t.read(20)), { type: r, length: n, ofs: a, reference: i };
}
async function Fc(t) {
  return _i.inflate(t);
}
function qw(t) {
  const e = [];
  let r = 0, n = 0;
  do {
    r = t.readUInt8();
    const a = r & 127;
    e.push(a), n = r & 128;
  } while (n);
  return e.reduce((a, i) => a + 1 << 7 | i, -1);
}
function Zw(t, e) {
  let r = e, n = 4, a = null;
  do
    a = t.readUInt8(), r |= (a & 127) << n, n += 7;
  while (a & 128);
  return r;
}
class Le {
  constructor(e) {
    Object.assign(this, e), this.offsetCache = {};
  }
  static async fromIdx({ idx: e, getExternalRefDelta: r }) {
    const n = new Mt(e);
    if (n.slice(4).toString("hex") !== "ff744f63")
      return;
    const i = n.readUInt32BE();
    if (i !== 2)
      throw new F(
        `Unable to read version ${i} packfile IDX. (Only version 2 supported)`
      );
    if (e.byteLength > 2048 * 1024 * 1024)
      throw new F(
        "To keep implementation simple, I haven't implemented the layer 5 feature needed to support packfiles > 2GB in size."
      );
    n.seek(n.tell() + 4 * 255);
    const o = n.readUInt32BE(), s = [];
    for (let c = 0; c < o; c++) {
      const u = n.slice(20).toString("hex");
      s[c] = u;
    }
    n.seek(n.tell() + 4 * o);
    const l = /* @__PURE__ */ new Map();
    for (let c = 0; c < o; c++)
      l.set(s[c], n.readUInt32BE());
    const f = n.slice(20).toString("hex");
    return new Le({
      hashes: s,
      crcs: {},
      offsets: l,
      packfileSha: f,
      getExternalRefDelta: r
    });
  }
  static async fromPack({ pack: e, getExternalRefDelta: r, onProgress: n }) {
    const a = {
      1: "commit",
      2: "tree",
      3: "blob",
      4: "tag",
      6: "ofs-delta",
      7: "ref-delta"
    }, i = {}, o = e.slice(-20).toString("hex"), s = [], l = {}, f = /* @__PURE__ */ new Map();
    let c = null, u = null;
    await Gw([e], async ({ data: m, type: y, reference: _, offset: v, num: S }) => {
      c === null && (c = S);
      const k = Math.floor(
        (c - S) * 100 / c
      );
      k !== u && n && await n({
        phase: "Receiving objects",
        loaded: c - S,
        total: c
      }), u = k, y = a[y], ["commit", "tree", "blob", "tag"].includes(y) ? i[v] = {
        type: y,
        offset: v
      } : y === "ofs-delta" ? i[v] = {
        type: y,
        offset: v
      } : y === "ref-delta" && (i[v] = {
        type: y,
        offset: v
      });
    });
    const d = Object.keys(i).map(Number);
    for (const [m, y] of d.entries()) {
      const _ = m + 1 === d.length ? e.byteLength - 20 : d[m + 1], v = i[y], S = cw.buf(e.slice(y, _)) >>> 0;
      v.end = _, v.crc = S;
    }
    const h = new Le({
      pack: Promise.resolve(e),
      packfileSha: o,
      crcs: l,
      hashes: s,
      offsets: f,
      getExternalRefDelta: r
    });
    u = null;
    let w = 0;
    const p = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let m in i) {
      m = Number(m);
      const y = Math.floor(w * 100 / c);
      y !== u && n && await n({
        phase: "Resolving deltas",
        loaded: w,
        total: c
      }), w++, u = y;
      const _ = i[m];
      if (!_.oid)
        try {
          h.readDepth = 0, h.externalReadDepth = 0;
          const { type: v, object: S } = await h.readSlice({ start: m });
          p[h.readDepth] += 1;
          const k = await Vt(Ye.wrap({ type: v, object: S }));
          _.oid = k, s.push(k), f.set(k, m), l[k] = _.crc;
        } catch {
          continue;
        }
    }
    return s.sort(), h;
  }
  async toBuffer() {
    const e = [], r = (f, c) => {
      e.push(Buffer.from(f, c));
    };
    r("ff744f63", "hex"), r("00000002", "hex");
    const n = new Mt(Buffer.alloc(256 * 4));
    for (let f = 0; f < 256; f++) {
      let c = 0;
      for (const u of this.hashes)
        parseInt(u.slice(0, 2), 16) <= f && c++;
      n.writeUInt32BE(c);
    }
    e.push(n.buffer);
    for (const f of this.hashes)
      r(f, "hex");
    const a = new Mt(Buffer.alloc(this.hashes.length * 4));
    for (const f of this.hashes)
      a.writeUInt32BE(this.crcs[f]);
    e.push(a.buffer);
    const i = new Mt(Buffer.alloc(this.hashes.length * 4));
    for (const f of this.hashes)
      i.writeUInt32BE(this.offsets.get(f));
    e.push(i.buffer), r(this.packfileSha, "hex");
    const o = Buffer.concat(e), s = await Vt(o), l = Buffer.alloc(20);
    return l.write(s, "hex"), Buffer.concat([o, l]);
  }
  async load({ pack: e }) {
    this.pack = e;
  }
  async unload() {
    this.pack = null;
  }
  async read({ oid: e }) {
    if (!this.offsets.get(e)) {
      if (this.getExternalRefDelta)
        return this.externalReadDepth++, this.getExternalRefDelta(e);
      throw new F(`Could not read object ${e} from packfile`);
    }
    const r = this.offsets.get(e);
    return this.readSlice({ start: r });
  }
  async readSlice({ start: e }) {
    if (this.offsetCache[e])
      return Object.assign({}, this.offsetCache[e]);
    this.readDepth++;
    const r = {
      16: "commit",
      32: "tree",
      48: "blob",
      64: "tag",
      96: "ofs_delta",
      112: "ref_delta"
    }, n = await this.pack;
    if (!n)
      throw new F(
        "Could not read packfile data. The packfile may be missing, corrupted, or too large to read into memory."
      );
    const a = n.slice(e), i = new Mt(a), o = i.readUInt8(), s = o & 112;
    let l = r[s];
    if (l === void 0)
      throw new F("Unrecognized type: 0b" + s.toString(2));
    const f = o & 15;
    let c = f;
    o & 128 && (c = Zw(i, f));
    let d = null, h = null;
    if (l === "ofs_delta") {
      const p = qw(i), m = e - p;
      ({ object: d, type: l } = await this.readSlice({ start: m }));
    }
    if (l === "ref_delta") {
      const p = i.slice(20).toString("hex");
      ({ object: d, type: l } = await this.read({ oid: p }));
    }
    const w = a.slice(i.tell());
    if (h = Buffer.from(await Fc(w)), h.byteLength !== c)
      throw new F(
        `Packfile told us object would have length ${c} but it had length ${h.byteLength}`
      );
    return d && (h = Buffer.from(zw(h, d))), this.readDepth > 3 && (this.offsetCache[e] = { type: l, object: h }), { type: l, format: "content", object: h };
  }
}
const hn = Symbol("PackfileCache");
async function Vw({
  fs: t,
  filename: e,
  getExternalRefDelta: r,
  emitter: n,
  emitterPrefix: a
}) {
  const i = await t.read(e);
  return Le.fromIdx({ idx: i, getExternalRefDelta: r });
}
function xi({
  fs: t,
  cache: e,
  filename: r,
  getExternalRefDelta: n,
  emitter: a,
  emitterPrefix: i
}) {
  e[hn] || (e[hn] = /* @__PURE__ */ new Map());
  let o = e[hn].get(r);
  return o || (o = Vw({
    fs: t,
    filename: r,
    getExternalRefDelta: n,
    emitter: a,
    emitterPrefix: i
  }), e[hn].set(r, o)), o;
}
const is = 8 * 1024 * 1024;
async function Xw(t, { start: e = 0, end: r = t.length } = {}) {
  const n = fw.createHash("sha1");
  for (let a = e; a < r; a += is)
    n.update(t.subarray(a, Math.min(a + is, r)));
  return n.digest("hex");
}
async function Kw({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  format: a = "content",
  getExternalRefDelta: i
}) {
  let o = await t.readdir(R(r, "objects/pack"));
  o = o.filter((s) => s.endsWith(".idx"));
  for (const s of o) {
    const l = `${r}/objects/pack/${s}`, f = await xi({
      fs: t,
      cache: e,
      filename: l,
      getExternalRefDelta: i
    });
    if (f.error) throw new F(f.error);
    if (f.offsets.has(n)) {
      const c = l.replace(/idx$/, "pack");
      f.pack || (f.pack = t.read(c));
      const u = await f.pack;
      if (!u)
        throw f.pack = null, new F(
          `Could not read packfile at ${c}. The file may be missing, corrupted, or too large to read into memory.`
        );
      if (!f._checksumVerified) {
        const h = f.packfileSha, w = u.subarray(-20), p = Array.from(w).map((y) => y.toString(16).padStart(2, "0")).join("");
        if (p !== h)
          throw new F(
            `Packfile trailer mismatch: expected ${h}, got ${p}. The packfile may be corrupted.`
          );
        const m = await Xw(u, {
          start: 0,
          end: u.length - 20
        });
        if (m !== h)
          throw new F(
            `Packfile payload corrupted: calculated ${m} but expected ${h}. The packfile may have been tampered with.`
          );
        f._checksumVerified = !0;
      }
      const d = await f.read({ oid: n, getExternalRefDelta: i });
      return d.format = "content", d.source = `objects/pack/${s.replace(/idx$/, "pack")}`, d;
    }
  }
  return null;
}
async function G({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  format: a = "content"
}) {
  const i = (c) => G({ fs: t, cache: e, gitdir: r, oid: c });
  let o;
  if (n === "4b825dc642cb6eb9a060e54bf8d69288fbee4904" && (o = { format: "wrapped", object: Buffer.from("tree 0\0") }), o || (o = await Cc({ fs: t, gitdir: r, oid: n })), !o) {
    if (o = await Kw({
      fs: t,
      cache: e,
      gitdir: r,
      oid: n,
      getExternalRefDelta: i
    }), !o)
      throw new H(n);
    return o;
  }
  if (a === "deflated" || (o.format === "deflated" && (o.object = Buffer.from(await Fc(o.object)), o.format = "wrapped"), a === "wrapped"))
    return o;
  const s = await Vt(o.object);
  if (s !== n)
    throw new F(
      `SHA check failed! Expected ${n}, computed ${s}`
    );
  const { object: l, type: f } = Ye.unwrap(o.object);
  if (o.type = f, o.object = l, o.format = "content", a === "content")
    return o;
  throw new F(`invalid requested format "${a}"`);
}
class Tt extends U {
  /**
   * @param {'note'|'remote'|'tag'|'branch'} noun
   * @param {string} where
   * @param {boolean} canForce
   */
  constructor(e, r, n = !0) {
    super(
      `Failed to create ${e} at ${r} because it already exists.${n ? ` (Hint: use 'force: true' parameter to overwrite existing ${e}.)` : ""}`
    ), this.code = this.name = Tt.code, this.data = { noun: e, where: r, canForce: n };
  }
}
Tt.code = "AlreadyExistsError";
class jr extends U {
  /**
   * @param {'oids'|'refs'} nouns
   * @param {string} short
   * @param {string[]} matches
   */
  constructor(e, r, n) {
    super(
      `Found multiple ${e} matching "${r}" (${n.join(
        ", "
      )}). Use a longer abbreviation length to disambiguate them.`
    ), this.code = this.name = jr.code, this.data = { nouns: e, short: r, matches: n };
  }
}
jr.code = "AmbiguousError";
class Ur extends U {
  /**
   * @param {string[]} filepaths
   */
  constructor(e) {
    super(
      `Your local changes to the following files would be overwritten by checkout: ${e.join(
        ", "
      )}`
    ), this.code = this.name = Ur.code, this.data = { filepaths: e };
  }
}
Ur.code = "CheckoutConflictError";
class Mr extends U {
  /**
   * @param {string} oid
   * @param {number} parentCount
   */
  constructor(e, r) {
    super(
      `Cannot cherry-pick merge commit ${e}. Merge commits have ${r} parents and require specifying which parent to use as the base.`
    ), this.code = this.name = Mr.code, this.data = { oid: e, parentCount: r };
  }
}
Mr.code = "CherryPickMergeCommitError";
class zr extends U {
  /**
   * @param {string} oid
   */
  constructor(e) {
    super(
      `Cannot cherry-pick root commit ${e}. Root commits have no parents.`
    ), this.code = this.name = zr.code, this.data = { oid: e };
  }
}
zr.code = "CherryPickRootCommitError";
class Lr extends U {
  /**
   * @param {string} ref
   * @param {string} oid
   */
  constructor(e, r) {
    super(
      `Failed to checkout "${e}" because commit ${r} is not available locally. Do a git fetch to make the branch available locally.`
    ), this.code = this.name = Lr.code, this.data = { ref: e, oid: r };
  }
}
Lr.code = "CommitNotFetchedError";
class Hr extends U {
  constructor() {
    super("Empty response from git server."), this.code = this.name = Hr.code, this.data = {};
  }
}
Hr.code = "EmptyServerResponseError";
class Gr extends U {
  constructor() {
    super("A simple fast-forward merge was not possible."), this.code = this.name = Gr.code, this.data = {};
  }
}
Gr.code = "FastForwardError";
class Wr extends U {
  /**
   * @param {string} prettyDetails
   * @param {PushResult} result
   */
  constructor(e, r) {
    super(`One or more branches were not updated: ${e}`), this.code = this.name = Wr.code, this.data = { prettyDetails: e, result: r };
  }
}
Wr.code = "GitPushError";
class He extends U {
  /**
   * @param {number} statusCode
   * @param {string} statusMessage
   * @param {string} response
   */
  constructor(e, r, n) {
    super(`HTTP Error: ${e} ${r}`), this.code = this.name = He.code, this.data = { statusCode: e, statusMessage: r, response: n };
  }
}
He.code = "HttpError";
class oe extends U {
  /**
   * @param {'leading-slash'|'trailing-slash'|'directory'} [reason]
   */
  constructor(e) {
    let r = "invalid filepath";
    e === "leading-slash" || e === "trailing-slash" ? r = '"filepath" parameter should not include leading or trailing directory separators because these can cause problems on some platforms.' : e === "directory" && (r = '"filepath" should not be a directory.'), super(r), this.code = this.name = oe.code, this.data = { reason: e };
  }
}
oe.code = "InvalidFilepathError";
class Rt extends U {
  /**
   * @param {string} ref
   * @param {string} suggestion
   * @param {boolean} canForce
   */
  constructor(e, r) {
    super(
      `"${e}" would be an invalid git reference. (Hint: a valid alternative would be "${r}".)`
    ), this.code = this.name = Rt.code, this.data = { ref: e, suggestion: r };
  }
}
Rt.code = "InvalidRefNameError";
class qr extends U {
  /**
   * @param {number} depth
   */
  constructor(e) {
    super(`Maximum search depth of ${e} exceeded.`), this.code = this.name = qr.code, this.data = { depth: e };
  }
}
qr.code = "MaxDepthError";
class Je extends U {
  constructor() {
    super("Merges with conflicts are not supported yet."), this.code = this.name = Je.code, this.data = {};
  }
}
Je.code = "MergeNotSupportedError";
class Oe extends U {
  /**
   * @param {Array<string>} filepaths
   * @param {Array<string>} bothModified
   * @param {Array<string>} deleteByUs
   * @param {Array<string>} deleteByTheirs
   */
  constructor(e, r, n, a) {
    super(
      `Automatic merge failed with one or more merge conflicts in the following files: ${e.toString()}. Fix conflicts then commit the result.`
    ), this.code = this.name = Oe.code, this.data = { filepaths: e, bothModified: r, deleteByUs: n, deleteByTheirs: a };
  }
}
Oe.code = "MergeConflictError";
class at extends U {
  /**
   * @param {'author'|'committer'|'tagger'} role
   */
  constructor(e) {
    super(
      `No name was provided for ${e} in the argument or in the .git/config file.`
    ), this.code = this.name = at.code, this.data = { role: e };
  }
}
at.code = "MissingNameError";
class ut extends U {
  /**
   * @param {string} parameter
   */
  constructor(e) {
    super(
      `The function requires a "${e}" parameter but none was provided.`
    ), this.code = this.name = ut.code, this.data = { parameter: e };
  }
}
ut.code = "MissingParameterError";
class Zr extends U {
  /**
   * @param {Error[]} errors
   * @param {string} message
   */
  constructor(e) {
    super(
      'There are multiple errors that were thrown by the method. Please refer to the "errors" property to see more'
    ), this.code = this.name = Zr.code, this.data = { errors: e }, this.errors = e;
  }
}
Zr.code = "MultipleGitError";
class Te extends U {
  /**
   * @param {string} expected
   * @param {string} actual
   */
  constructor(e, r) {
    super(`Expected "${e}" but received "${r}".`), this.code = this.name = Te.code, this.data = { expected: e, actual: r };
  }
}
Te.code = "ParseError";
class Ge extends U {
  /**
   * @param {'not-fast-forward'|'tag-exists'} reason
   */
  constructor(e) {
    let r = "";
    e === "not-fast-forward" ? r = " because it was not a simple fast-forward" : e === "tag-exists" && (r = " because tag already exists"), super(`Push rejected${r}. Use "force: true" to override.`), this.code = this.name = Ge.code, this.data = { reason: e };
  }
}
Ge.code = "PushRejectedError";
class ne extends U {
  /**
   * @param {'shallow'|'deepen-since'|'deepen-not'|'deepen-relative'} capability
   * @param {'depth'|'since'|'exclude'|'relative'} parameter
   */
  constructor(e, r) {
    super(
      `Remote does not support the "${e}" so the "${r}" parameter cannot be used.`
    ), this.code = this.name = ne.code, this.data = { capability: e, parameter: r };
  }
}
ne.code = "RemoteCapabilityError";
class Vr extends U {
  /**
   * @param {string} preview
   * @param {string} response
   */
  constructor(e, r) {
    super(
      `Remote did not reply using the "smart" HTTP protocol. Expected "001e# service=git-upload-pack" but received: ${e}`
    ), this.code = this.name = Vr.code, this.data = { preview: e, response: r };
  }
}
Vr.code = "SmartHttpError";
class Xr extends U {
  /**
   * @param {string} url
   * @param {string} transport
   * @param {string} [suggestion]
   */
  constructor(e, r, n) {
    super(
      `Git remote "${e}" uses an unrecognized transport protocol: "${r}"`
    ), this.code = this.name = Xr.code, this.data = { url: e, transport: r, suggestion: n };
  }
}
Xr.code = "UnknownTransportError";
class Kr extends U {
  /**
   * @param {string} url
   */
  constructor(e) {
    super(`Cannot parse remote URL: "${e}"`), this.code = this.name = Kr.code, this.data = { url: e };
  }
}
Kr.code = "UrlParseError";
class Qe extends U {
  constructor() {
    super("The operation was canceled."), this.code = this.name = Qe.code, this.data = {};
  }
}
Qe.code = "UserCanceledError";
class Yr extends U {
  /**
   * @param {Array<string>} filepaths
   */
  constructor(e) {
    super(
      `Could not merge index: Entry for '${e}' is not up to date. Either reset the index entry to HEAD, or stage your unstaged changes.`
    ), this.code = this.name = Yr.code, this.data = { filepath: e };
  }
}
Yr.code = "IndexResetError";
class Jr extends U {
  /**
   * @param {string} ref
   */
  constructor(e) {
    super(
      `"${e}" does not point to any commit. You're maybe working on a repository with no commits yet. `
    ), this.code = this.name = Jr.code, this.data = { ref: e };
  }
}
Jr.code = "NoCommitError";
var jc = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  AlreadyExistsError: Tt,
  AmbiguousError: jr,
  CheckoutConflictError: Ur,
  CherryPickMergeCommitError: Mr,
  CherryPickRootCommitError: zr,
  CommitNotFetchedError: Lr,
  EmptyServerResponseError: Hr,
  FastForwardError: Gr,
  GitPushError: Wr,
  HttpError: He,
  InternalError: F,
  InvalidFilepathError: oe,
  InvalidOidError: ie,
  InvalidRefNameError: Rt,
  MaxDepthError: qr,
  MergeNotSupportedError: Je,
  MergeConflictError: Oe,
  MissingNameError: at,
  MissingParameterError: ut,
  MultipleGitError: Zr,
  NoRefspecError: Fr,
  NotFoundError: H,
  ObjectTypeError: ft,
  ParseError: Te,
  PushRejectedError: Ge,
  RemoteCapabilityError: ne,
  SmartHttpError: Vr,
  UnknownTransportError: Xr,
  UnsafeFilepathError: Ke,
  UrlParseError: Kr,
  UserCanceledError: Qe,
  UnmergedPathsError: Nr,
  IndexResetError: Yr,
  NoCommitError: Jr
});
function ni({ name: t, email: e, timestamp: r, timezoneOffset: n }) {
  return n = Yw(n), `${t} <${e}> ${r} ${n}`;
}
function Yw(t) {
  const e = Jw(Qw(t));
  t = Math.abs(t);
  const r = Math.floor(t / 60);
  t -= r * 60;
  let n = String(r), a = String(t);
  return n.length < 2 && (n = "0" + n), a.length < 2 && (a = "0" + a), (e === -1 ? "-" : "+") + n + a;
}
function Jw(t) {
  return Math.sign(t) || (Object.is(t, -0) ? -1 : 1);
}
function Qw(t) {
  return t === 0 ? t : -t;
}
function Wt(t) {
  return t = t.replace(/\r/g, ""), t = t.replace(/^\n+/, ""), t = t.replace(/\n+$/, "") + `
`, t;
}
function Pn(t) {
  const [, e, r, n, a] = t.match(
    /^(.*) <(.*)> (.*) (.*)$/
  );
  return {
    name: e,
    email: r,
    timestamp: Number(n),
    timezoneOffset: tp(a)
  };
}
function tp(t) {
  let [, e, r, n] = t.match(/(\+|-)(\d\d)(\d\d)/);
  return n = (e === "+" ? 1 : -1) * (Number(r) * 60 + Number(n)), ep(n);
}
function ep(t) {
  return t === 0 ? t : -t;
}
class ct {
  constructor(e) {
    if (typeof e == "string")
      this._tag = e;
    else if (Buffer.isBuffer(e))
      this._tag = e.toString("utf8");
    else if (typeof e == "object")
      this._tag = ct.render(e);
    else
      throw new F(
        "invalid type passed to GitAnnotatedTag constructor"
      );
  }
  static from(e) {
    return new ct(e);
  }
  static render(e) {
    return `object ${e.object}
type ${e.type}
tag ${e.tag}
tagger ${ni(e.tagger)}

${e.message}
${e.gpgsig ? e.gpgsig : ""}`;
  }
  justHeaders() {
    return this._tag.slice(0, this._tag.indexOf(`

`));
  }
  message() {
    const e = this.withoutSignature();
    return e.slice(e.indexOf(`

`) + 2);
  }
  parse() {
    return Object.assign(this.headers(), {
      message: this.message(),
      gpgsig: this.gpgsig()
    });
  }
  render() {
    return this._tag;
  }
  headers() {
    const e = this.justHeaders().split(`
`), r = [];
    for (const a of e)
      a[0] === " " ? r[r.length - 1] += `
` + a.slice(1) : r.push(a);
    const n = {};
    for (const a of r) {
      const i = a.slice(0, a.indexOf(" ")), o = a.slice(a.indexOf(" ") + 1);
      Array.isArray(n[i]) ? n[i].push(o) : n[i] = o;
    }
    return n.tagger && (n.tagger = Pn(n.tagger)), n.committer && (n.committer = Pn(n.committer)), n;
  }
  withoutSignature() {
    const e = Wt(this._tag);
    return e.indexOf(`
-----BEGIN PGP SIGNATURE-----`) === -1 ? e : e.slice(0, e.lastIndexOf(`
-----BEGIN PGP SIGNATURE-----`));
  }
  gpgsig() {
    if (this._tag.indexOf(`
-----BEGIN PGP SIGNATURE-----`) === -1) return;
    const e = this._tag.slice(
      this._tag.indexOf("-----BEGIN PGP SIGNATURE-----"),
      this._tag.indexOf("-----END PGP SIGNATURE-----") + 27
    );
    return Wt(e);
  }
  payload() {
    return this.withoutSignature() + `
`;
  }
  toObject() {
    return Buffer.from(this._tag, "utf8");
  }
  static async sign(e, r, n) {
    const a = e.payload();
    let { signature: i } = await r({ payload: a, secretKey: n });
    i = Wt(i);
    const o = a + i;
    return ct.from(o);
  }
}
function ja(t) {
  return t.trim().split(`
`).map((e) => " " + e).join(`
`) + `
`;
}
function rp(t) {
  return t.split(`
`).map((e) => e.replace(/^ /, "")).join(`
`);
}
class q {
  constructor(e) {
    if (typeof e == "string")
      this._commit = e;
    else if (Buffer.isBuffer(e))
      this._commit = e.toString("utf8");
    else if (typeof e == "object")
      this._commit = q.render(e);
    else
      throw new F("invalid type passed to GitCommit constructor");
  }
  static fromPayloadSignature({ payload: e, signature: r }) {
    const n = q.justHeaders(e), a = q.justMessage(e), i = Wt(
      n + `
gpgsig` + ja(r) + `
` + a
    );
    return new q(i);
  }
  static from(e) {
    return new q(e);
  }
  toObject() {
    return Buffer.from(this._commit, "utf8");
  }
  // Todo: allow setting the headers and message
  headers() {
    return this.parseHeaders();
  }
  // Todo: allow setting the headers and message
  message() {
    return q.justMessage(this._commit);
  }
  parse() {
    return Object.assign({ message: this.message() }, this.headers());
  }
  static justMessage(e) {
    return Wt(e.slice(e.indexOf(`

`) + 2));
  }
  static justHeaders(e) {
    return e.slice(0, e.indexOf(`

`));
  }
  parseHeaders() {
    const e = q.justHeaders(this._commit).split(`
`), r = [];
    for (const a of e)
      a[0] === " " ? r[r.length - 1] += `
` + a.slice(1) : r.push(a);
    const n = {
      parent: []
    };
    for (const a of r) {
      const i = a.slice(0, a.indexOf(" ")), o = a.slice(a.indexOf(" ") + 1);
      Array.isArray(n[i]) ? n[i].push(o) : n[i] = o;
    }
    return n.author && (n.author = Pn(n.author)), n.committer && (n.committer = Pn(n.committer)), n;
  }
  static renderHeaders(e) {
    let r = "";
    if (e.tree ? r += `tree ${e.tree}
` : r += `tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904
`, e.parent) {
      if (e.parent.length === void 0)
        throw new F("commit 'parent' property should be an array");
      for (const i of e.parent)
        r += `parent ${i}
`;
    }
    const n = e.author;
    r += `author ${ni(n)}
`;
    const a = e.committer || e.author;
    return r += `committer ${ni(a)}
`, e.gpgsig && (r += "gpgsig" + ja(e.gpgsig)), r;
  }
  static render(e) {
    return q.renderHeaders(e) + `
` + Wt(e.message);
  }
  render() {
    return this._commit;
  }
  withoutSignature() {
    const e = Wt(this._commit);
    if (e.indexOf(`
gpgsig`) === -1) return e;
    const r = e.slice(0, e.indexOf(`
gpgsig`)), n = e.slice(
      e.indexOf(`-----END PGP SIGNATURE-----
`) + 28
    );
    return Wt(r + `
` + n);
  }
  isolateSignature() {
    const e = this._commit.slice(
      this._commit.indexOf("-----BEGIN PGP SIGNATURE-----"),
      this._commit.indexOf("-----END PGP SIGNATURE-----") + 27
    );
    return rp(e);
  }
  static async sign(e, r, n) {
    const a = e.withoutSignature(), i = q.justMessage(e._commit);
    let { signature: o } = await r({ payload: a, secretKey: n });
    o = Wt(o);
    const l = q.justHeaders(e._commit) + `
gpgsig` + ja(o) + `
` + i;
    return q.from(l);
  }
}
async function We({ fs: t, cache: e, gitdir: r, oid: n }) {
  if (n === "4b825dc642cb6eb9a060e54bf8d69288fbee4904")
    return { tree: dt.from([]), oid: n };
  const { type: a, object: i } = await G({ fs: t, cache: e, gitdir: r, oid: n });
  if (a === "tag")
    return n = ct.from(i).parse().object, We({ fs: t, cache: e, gitdir: r, oid: n });
  if (a === "commit")
    return n = q.from(i).parse().tree, We({ fs: t, cache: e, gitdir: r, oid: n });
  if (a !== "tree")
    throw new ft(n, a, "tree");
  return { tree: dt.from(i), oid: n };
}
class np {
  constructor({ fs: e, gitdir: r, ref: n, cache: a }) {
    this.fs = e, this.cache = a, this.gitdir = r, this.mapPromise = (async () => {
      const o = /* @__PURE__ */ new Map();
      let s;
      try {
        s = await T.resolve({ fs: e, gitdir: r, ref: n });
      } catch (f) {
        f instanceof H && (s = "4b825dc642cb6eb9a060e54bf8d69288fbee4904");
      }
      const l = await We({ fs: e, cache: this.cache, gitdir: r, oid: s });
      return l.type = "tree", l.mode = "40000", o.set(".", l), o;
    })();
    const i = this;
    this.ConstructEntry = class {
      constructor(s) {
        this._fullpath = s, this._type = !1, this._mode = !1, this._stat = !1, this._content = !1, this._oid = !1;
      }
      async type() {
        return i.type(this);
      }
      async mode() {
        return i.mode(this);
      }
      async stat() {
        return i.stat(this);
      }
      async content() {
        return i.content(this);
      }
      async oid() {
        return i.oid(this);
      }
    };
  }
  async readdir(e) {
    const r = e._fullpath, { fs: n, cache: a, gitdir: i } = this, o = await this.mapPromise, s = o.get(r);
    if (!s) throw new Error(`No obj for ${r}`);
    const l = s.oid;
    if (!l) throw new Error(`No oid for obj ${JSON.stringify(s)}`);
    if (s.type !== "tree")
      return null;
    const { type: f, object: c } = await G({ fs: n, cache: a, gitdir: i, oid: l });
    if (f !== s.type)
      throw new ft(l, f, s.type);
    const u = dt.from(c);
    for (const d of u)
      o.set(R(r, d.path), d);
    return u.entries().map((d) => R(r, d.path));
  }
  async type(e) {
    if (e._type === !1) {
      const r = await this.mapPromise, { type: n } = r.get(e._fullpath);
      e._type = n;
    }
    return e._type;
  }
  async mode(e) {
    if (e._mode === !1) {
      const r = await this.mapPromise, { mode: n } = r.get(e._fullpath);
      e._mode = Tc(parseInt(n, 8));
    }
    return e._mode;
  }
  async stat(e) {
  }
  async content(e) {
    if (e._content === !1) {
      const r = await this.mapPromise, { fs: n, cache: a, gitdir: i } = this, s = r.get(e._fullpath).oid, { type: l, object: f } = await G({ fs: n, cache: a, gitdir: i, oid: s });
      l !== "blob" ? e._content = void 0 : e._content = new Uint8Array(f);
    }
    return e._content;
  }
  async oid(e) {
    if (e._oid === !1) {
      const n = (await this.mapPromise).get(e._fullpath);
      e._oid = n.oid;
    }
    return e._oid;
  }
}
function gt({ ref: t = "HEAD" } = {}) {
  const e = /* @__PURE__ */ Object.create(null);
  return Object.defineProperty(e, Gn, {
    value: function({ fs: r, gitdir: n, cache: a }) {
      return new np({ fs: r, gitdir: n, ref: t, cache: a });
    }
  }), Object.freeze(e), e;
}
class ap {
  constructor({ fs: e, dir: r, gitdir: n, cache: a }) {
    this.fs = e, this.cache = a, this.dir = r, this.gitdir = n, this.config = null;
    const i = this;
    this.ConstructEntry = class {
      constructor(s) {
        this._fullpath = s, this._type = !1, this._mode = !1, this._stat = !1, this._content = !1, this._oid = !1;
      }
      async type() {
        return i.type(this);
      }
      async mode() {
        return i.mode(this);
      }
      async stat() {
        return i.stat(this);
      }
      async content() {
        return i.content(this);
      }
      async oid() {
        return i.oid(this);
      }
    };
  }
  async readdir(e) {
    const r = e._fullpath, { fs: n, dir: a } = this, i = await n.readdir(R(a, r));
    return i === null ? null : i.map((o) => R(r, o));
  }
  async type(e) {
    return e._type === !1 && await e.stat(), e._type;
  }
  async mode(e) {
    return e._mode === !1 && await e.stat(), e._mode;
  }
  async stat(e) {
    if (e._stat === !1) {
      const { fs: r, dir: n } = this;
      let a = await r.lstat(`${n}/${e._fullpath}`);
      if (!a)
        throw new Error(
          `ENOENT: no such file or directory, lstat '${e._fullpath}'`
        );
      let i = a.isDirectory() ? "tree" : "blob";
      i === "blob" && !a.isFile() && !a.isSymbolicLink() && (i = "special"), e._type = i, a = ze(a), e._mode = a.mode, a.size === -1 && e._actualSize && (a.size = e._actualSize), e._stat = a;
    }
    return e._stat;
  }
  async content(e) {
    if (e._content === !1) {
      const { fs: r, dir: n, gitdir: a } = this;
      if (await e.type() === "tree")
        e._content = void 0;
      else {
        let i;
        if (await e.mode() >> 12 === 10)
          i = await r.readlink(`${n}/${e._fullpath}`);
        else {
          const s = await (await this._getGitConfig(r, a)).get("core.autocrlf");
          i = await r.read(`${n}/${e._fullpath}`, { autocrlf: s });
        }
        e._actualSize = i.length, e._stat && e._stat.size === -1 && (e._stat.size = e._actualSize), e._content = new Uint8Array(i);
      }
    }
    return e._content;
  }
  async oid(e) {
    if (e._oid === !1) {
      const r = this, { fs: n, gitdir: a, cache: i } = this;
      let o;
      await Y.acquire(
        { fs: n, gitdir: a, cache: i },
        async function(s) {
          const l = s.entriesMap.get(e._fullpath), f = await e.stat(), u = await (await r._getGitConfig(n, a)).get("core.filemode"), d = typeof process < "u" ? process.platform !== "win32" : !0;
          if (!l || Rn(f, l, u, d)) {
            const h = await e.content();
            h === void 0 ? o = void 0 : (o = await Vt(
              Ye.wrap({ type: "blob", object: h })
            ), l && o === l.oid && (!u || f.mode === l.mode) && Rn(f, l, u, d) && s.insert({
              filepath: e._fullpath,
              stats: f,
              oid: o
            }));
          } else
            o = l.oid;
        }
      ), e._oid = o;
    }
    return e._oid;
  }
  async _getGitConfig(e, r) {
    return this.config ? this.config : (this.config = await J.get({ fs: e, gitdir: r }), this.config);
  }
}
function tr() {
  const t = /* @__PURE__ */ Object.create(null);
  return Object.defineProperty(t, Gn, {
    value: function({ fs: e, dir: r, gitdir: n, cache: a }) {
      return new ap({ fs: e, dir: r, gitdir: n, cache: a });
    }
  }), Object.freeze(t), t;
}
function ip(t, e) {
  const r = e - t;
  return Array.from({ length: r }, (n, a) => t + a);
}
const Uc = typeof Array.prototype.flat > "u" ? (t) => t.reduce((e, r) => e.concat(r), []) : (t) => t.flat();
class op {
  constructor() {
    this.value = null;
  }
  consider(e) {
    e != null && (this.value === null ? this.value = e : e < this.value && (this.value = e));
  }
  reset() {
    this.value = null;
  }
}
function* sp(t) {
  const e = new op();
  let r;
  const n = [], a = t.length;
  for (let i = 0; i < a; i++)
    n[i] = t[i].next().value, n[i] !== void 0 && e.consider(n[i]);
  if (e.value !== null)
    for (; ; ) {
      const i = [];
      r = e.value, e.reset();
      for (let o = 0; o < a; o++)
        n[o] !== void 0 && n[o] === r ? (i[o] = n[o], n[o] = t[o].next().value) : i[o] = null, n[o] !== void 0 && e.consider(n[o]);
      if (yield i, e.value === null) return;
    }
}
async function se({
  fs: t,
  cache: e,
  dir: r,
  gitdir: n,
  trees: a,
  // @ts-ignore
  map: i = async (l, f) => f,
  // The default reducer is a flatmap that filters out undefineds.
  reduce: o = async (l, f) => {
    const c = Uc(f);
    return l !== void 0 && c.unshift(l), c;
  },
  // The default iterate function walks all children concurrently
  iterate: s = (l, f) => Promise.all([...f].map(l))
}) {
  const l = a.map(
    (h) => h[Gn]({ fs: t, dir: r, gitdir: n, cache: e })
  ), f = new Array(l.length).fill("."), c = ip(0, l.length), u = async (h) => {
    c.forEach((m) => {
      const y = h[m];
      h[m] = y && new l[m].ConstructEntry(y);
    });
    const p = (await Promise.all(
      c.map((m) => {
        const y = h[m];
        return y ? l[m].readdir(y) : [];
      })
    )).map((m) => (m === null ? [] : m)[Symbol.iterator]());
    return {
      entries: h,
      children: sp(p)
    };
  }, d = async (h) => {
    const { entries: w, children: p } = await u(h), m = w.find((_) => _ && _._fullpath)._fullpath, y = await i(m, w);
    if (y !== null) {
      let _ = await s(d, p);
      return _ = _.filter((v) => v !== void 0), o(y, _);
    }
  };
  return d(f);
}
async function ai(t, e) {
  const r = await t.readdir(e);
  r == null ? await t.rm(e) : r.length ? await Promise.all(
    r.map((n) => {
      const a = R(e, n);
      return t.lstat(a).then((i) => {
        if (i)
          return i.isDirectory() ? ai(t, a) : t.rm(a);
      });
    })
  ).then(() => t.rmdir(e)) : await t.rmdir(e);
}
function cp(t) {
  return fp(t) && os(t.then) && os(t.catch);
}
function fp(t) {
  return t && typeof t == "object";
}
function os(t) {
  return typeof t == "function";
}
function ss(t) {
  return cp(((r) => {
    try {
      return r.readFile().catch((n) => n);
    } catch (n) {
      return n;
    }
  })(t));
}
const cs = [
  "readFile",
  "writeFile",
  "mkdir",
  "rmdir",
  "unlink",
  "stat",
  "lstat",
  "readdir",
  "readlink",
  "symlink"
];
function fs(t, e) {
  if (ss(e))
    for (const r of cs)
      t[`_${r}`] = e[r].bind(e);
  else
    for (const r of cs)
      t[`_${r}`] = un(e[r].bind(e));
  ss(e) ? (e.cp && (t._cp = e.cp.bind(e)), e.rm ? t._rm = e.rm.bind(e) : e.rmdir.length > 1 ? t._rm = e.rmdir.bind(e) : t._rm = ai.bind(null, t)) : (e.cp && (t._cp = un(e.cp.bind(e))), e.rm ? t._rm = un(e.rm.bind(e)) : e.rmdir.length > 2 ? t._rm = un(e.rmdir.bind(e)) : t._rm = ai.bind(null, t));
}
class C {
  /**
   * Creates an instance of FileSystem.
   *
   * @param {Object} fs - A file system implementation to wrap.
   */
  constructor(e) {
    if (typeof e._original_unwrapped_fs < "u") return e;
    const r = Object.getOwnPropertyDescriptor(e, "promises");
    r && r.enumerable ? fs(this, e.promises) : fs(this, e), this._original_unwrapped_fs = e;
  }
  /**
   * Return true if a file exists, false if it doesn't exist.
   * Rethrows errors that aren't related to file existence.
   *
   * @param {string} filepath - The path to the file.
   * @param {Object} [options] - Additional options.
   * @returns {Promise<boolean>} - `true` if the file exists, `false` otherwise.
   */
  async exists(e, r = {}) {
    try {
      return await this._stat(e), !0;
    } catch (n) {
      if (n.code === "ENOENT" || n.code === "ENOTDIR" || (n.code || "").includes("ENS"))
        return !1;
      throw console.log('Unhandled error in "FileSystem.exists()" function', n), n;
    }
  }
  /**
   * Return the contents of a file if it exists, otherwise returns null.
   *
   * @param {string} filepath - The path to the file.
   * @param {Object} [options] - Options for reading the file.
   * @returns {Promise<Buffer|string|null>} - The file contents, or `null` if the file doesn't exist.
   */
  async read(e, r = {}) {
    try {
      let n = await this._readFile(e, r);
      if (r.autocrlf === "true")
        try {
          n = new TextDecoder("utf8", { fatal: !0 }).decode(n), n = n.replace(/\r\n/g, `
`), n = new TextEncoder().encode(n);
        } catch {
        }
      return typeof n != "string" && (n = Buffer.from(n)), n;
    } catch {
      return null;
    }
  }
  /**
   * Write a file (creating missing directories if need be) without throwing errors.
   *
   * @param {string} filepath - The path to the file.
   * @param {Buffer|Uint8Array|string} contents - The data to write.
   * @param {Object|string} [options] - Options for writing the file.
   * @returns {Promise<void>}
   */
  async write(e, r, n = {}) {
    try {
      await this._writeFile(e, r, n);
    } catch {
      await this.mkdir(Se(e)), await this._writeFile(e, r, n);
    }
  }
  /**
   * Make a directory (or series of nested directories) without throwing an error if it already exists.
   *
   * @param {string} filepath - The path to the directory.
   * @param {boolean} [_selfCall=false] - Internal flag to prevent infinite recursion.
   * @returns {Promise<void>}
   */
  async mkdir(e, r = !1) {
    try {
      await this._mkdir(e);
    } catch (n) {
      if (n === null || n.code === "EEXIST") return;
      if (r) throw n;
      if (n.code === "ENOENT") {
        const a = Se(e);
        if (a === "." || a === "/" || a === e) throw n;
        await this.mkdir(a), await this.mkdir(e, !0);
      }
    }
  }
  /**
   * Delete a file without throwing an error if it is already deleted.
   *
   * @param {string} filepath - The path to the file.
   * @returns {Promise<void>}
   */
  async rm(e) {
    try {
      await this._unlink(e);
    } catch (r) {
      if (r.code !== "ENOENT") throw r;
    }
  }
  /**
   * Delete a directory without throwing an error if it is already deleted.
   *
   * @param {string} filepath - The path to the directory.
   * @param {Object} [opts] - Options for deleting the directory.
   * @returns {Promise<void>}
   */
  async rmdir(e, r) {
    try {
      r && r.recursive ? await this._rm(e, r) : await this._rmdir(e);
    } catch (n) {
      if (n.code !== "ENOENT") throw n;
    }
  }
  /**
   * Read a directory without throwing an error is the directory doesn't exist
   *
   * @param {string} filepath - The path to the directory.
   * @returns {Promise<string[]|null>} - An array of file names, or `null` if the path is not a directory.
   */
  async readdir(e) {
    try {
      const r = await this._readdir(e);
      return r.sort(Hn), r;
    } catch (r) {
      return r.code === "ENOTDIR" ? null : [];
    }
  }
  /**
   * Return a flat list of all the files nested inside a directory
   *
   * Based on an elegant concurrent recursive solution from SO
   * https://stackoverflow.com/a/45130990/2168416
   *
   * @param {string} dir - The directory to read.
   * @returns {Promise<string[]>} - A flat list of all files in the directory.
   */
  async readdirDeep(e) {
    const r = await this._readdir(e);
    return (await Promise.all(
      r.map(async (a) => {
        const i = e + "/" + a;
        return (await this._stat(i)).isDirectory() ? this.readdirDeep(i) : i;
      })
    )).reduce((a, i) => a.concat(i), []);
  }
  /**
   * Return the Stats of a file/symlink if it exists, otherwise returns null.
   * Rethrows errors that aren't related to file existence.
   *
   * @param {string} filename - The path to the file or symlink.
   * @returns {Promise<Object|null>} - The stats object, or `null` if the file doesn't exist.
   */
  async lstat(e) {
    try {
      return await this._lstat(e);
    } catch (r) {
      if (r.code === "ENOENT" || (r.code || "").includes("ENS"))
        return null;
      throw r;
    }
  }
  /**
   * Reads the contents of a symlink if it exists, otherwise returns null.
   * Rethrows errors that aren't related to file existence.
   *
   * @param {string} filename - The path to the symlink.
   * @param {Object} [opts={ encoding: 'buffer' }] - Options for reading the symlink.
   * @returns {Promise<Buffer|null>} - The symlink target, or `null` if it doesn't exist.
   */
  async readlink(e, r = { encoding: "buffer" }) {
    try {
      const n = await this._readlink(e, r);
      return Buffer.isBuffer(n) ? n : Buffer.from(n);
    } catch (n) {
      if (n.code === "ENOENT" || (n.code || "").includes("ENS"))
        return null;
      throw n;
    }
  }
  /**
   * Write the contents of buffer to a symlink.
   *
   * @param {string} filename - The path to the symlink.
   * @param {Buffer} buffer - The symlink target.
   * @returns {Promise<void>}
   */
  async writelink(e, r) {
    return this._symlink(r.toString("utf8"), e);
  }
}
function b(t, e) {
  if (e === void 0)
    throw new ut(t);
}
function lp(t) {
  return t.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(t);
}
async function D({ fsp: t, dotgit: e }) {
  b("fsp", t), b("dotgit", e);
  const r = await t._stat(e).catch(() => ({ isFile: () => !1, isDirectory: () => !1 }));
  return r.isDirectory() ? e : r.isFile() ? t._readFile(e, "utf8").then((n) => n.trimRight().substr(8)).then((n) => lp(n) ? n : R(Se(e), n)) : e;
}
async function Bn(t, e) {
  return !t && !e ? !1 : t && !e || !t && e ? !0 : !(await t.type() === "tree" && await e.type() === "tree" || await t.type() === await e.type() && await t.mode() === await e.mode() && await t.oid() === await e.oid());
}
async function Mc({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  commit: n = "HEAD",
  cache: a = {}
}) {
  try {
    b("fs", t), b("dir", e), b("gitdir", r);
    const i = new C(t), o = [gt({ ref: n }), tr(), Re()];
    let s = [];
    const l = await D({ fsp: i, dotgit: r });
    await Y.acquire(
      { fs: i, gitdir: l, cache: a },
      async function(c) {
        s = c.unmergedPaths;
      }
    );
    const f = await se({
      fs: i,
      cache: a,
      dir: e,
      gitdir: l,
      trees: o,
      map: async function(c, [u, d, h]) {
        const w = !await Bn(d, h), p = s.includes(c), m = !await Bn(h, u);
        if (w || p)
          return u ? {
            path: c,
            mode: await u.mode(),
            oid: await u.oid(),
            type: await u.type(),
            content: await u.content()
          } : void 0;
        if (m) return !1;
        throw new Yr(c);
      }
    });
    await Y.acquire(
      { fs: i, gitdir: l, cache: a },
      async function(c) {
        for (const u of f)
          if (u !== !1) {
            if (!u) {
              await i.rmdir(`${e}/${u.path}`, { recursive: !0 }), c.delete({ filepath: u.path });
              continue;
            }
            if (u.type === "blob") {
              const d = new TextDecoder().decode(u.content);
              await i.write(`${e}/${u.path}`, d, {
                mode: u.mode
              }), c.insert({
                filepath: u.path,
                oid: u.oid,
                stage: 0
              });
            }
          }
      }
    );
  } catch (i) {
    throw i.caller = "git.abortMerge", i;
  }
}
class er {
  /**
   * Determines whether a given file is ignored based on `.gitignore` rules and exclusion files.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} args.dir - The working directory.
   * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
   * @param {string} args.filepath - The path of the file to check.
   * @returns {Promise<boolean>} - `true` if the file is ignored, `false` otherwise.
   */
  static async isIgnored({ fs: e, dir: r, gitdir: n = R(r, ".git"), filepath: a }) {
    if (On(a) === ".git") return !0;
    if (a === ".") return !1;
    let i = "";
    const o = R(n, "info", "exclude");
    await e.exists(o) && (i = await e.read(o, "utf8"));
    const s = [
      {
        gitignore: R(r, ".gitignore"),
        filepath: a
      }
    ], l = a.split("/").filter(Boolean);
    for (let c = 1; c < l.length; c++) {
      const u = l.slice(0, c).join("/"), d = l.slice(c).join("/");
      s.push({
        gitignore: R(r, u, ".gitignore"),
        filepath: d
      });
    }
    let f = !1;
    for (const c of s) {
      let u;
      try {
        u = await e.read(c.gitignore, "utf8");
      } catch (w) {
        if (w.code === "NOENT") continue;
      }
      const d = lw().add(i);
      d.add(u);
      const h = Se(c.filepath);
      if (h !== "." && d.ignores(h)) return !0;
      f ? f = !d.test(c.filepath).unignored : f = d.test(c.filepath).ignored;
    }
    return f;
  }
}
async function up({ fs: t, gitdir: e, object: r, format: n, oid: a }) {
  const i = `objects/${a.slice(0, 2)}/${a.slice(2)}`, o = `${e}/${i}`;
  await t.exists(o) || await t.write(o, r);
}
let Ua = null;
async function zc(t) {
  return Ua === null && (Ua = hp()), Ua ? dp(t) : _i.deflate(t);
}
async function dp(t) {
  const e = new CompressionStream("deflate"), r = new Blob([t]).stream().pipeThrough(e);
  return new Uint8Array(await new Response(r).arrayBuffer());
}
function hp() {
  try {
    return new CompressionStream("deflate").writable.close(), new Blob([]).stream().cancel(), !0;
  } catch {
    return !1;
  }
}
async function ht({
  fs: t,
  gitdir: e,
  type: r,
  object: n,
  format: a = "content",
  oid: i = void 0,
  dryRun: o = !1
}) {
  return a !== "deflated" && (a !== "wrapped" && (n = Ye.wrap({ type: r, object: n })), i = await Vt(n), n = Buffer.from(await zc(n))), o || await up({ fs: t, gitdir: e, object: n, format: "deflated", oid: i }), i;
}
function Lc(t) {
  let e;
  for (; ~(e = t.indexOf(92)); ) t[e] = 47;
  return t;
}
async function Hc({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  filepath: n,
  cache: a = {},
  force: i = !1,
  parallel: o = !0
}) {
  try {
    b("fs", t), b("dir", e), b("gitdir", r), b("filepath", n);
    const s = new C(t), l = await D({ fsp: s, dotgit: r });
    await Y.acquire(
      { fs: s, gitdir: l, cache: a },
      async (f) => {
        const u = await (await J.get({ fs: s, gitdir: l })).get("core.autocrlf");
        return ii({
          dir: e,
          gitdir: l,
          fs: s,
          filepath: n,
          index: f,
          force: i,
          parallel: o,
          autocrlf: u
        });
      }
    );
  } catch (s) {
    throw s.caller = "git.add", s;
  }
}
async function ii({
  dir: t,
  gitdir: e,
  fs: r,
  filepath: n,
  index: a,
  force: i,
  parallel: o,
  autocrlf: s
}) {
  n = Array.isArray(n) ? n : [n];
  const l = n.map(async (d) => {
    if (!i && await er.isIgnored({
      fs: r,
      dir: t,
      gitdir: e,
      filepath: d
    }))
      return;
    const h = await r.lstat(R(t, d));
    if (!h) throw new H(d);
    if (h.isDirectory()) {
      const w = await r.readdir(R(t, d));
      if (o) {
        const p = w.map(
          (m) => ii({
            dir: t,
            gitdir: e,
            fs: r,
            filepath: [R(d, m)],
            index: a,
            force: i,
            parallel: o,
            autocrlf: s
          })
        );
        await Promise.all(p);
      } else
        for (const p of w)
          await ii({
            dir: t,
            gitdir: e,
            fs: r,
            filepath: [R(d, p)],
            index: a,
            force: i,
            parallel: o,
            autocrlf: s
          });
    } else {
      const w = h.isSymbolicLink() ? await r.readlink(R(t, d)).then(Lc) : await r.read(R(t, d), { autocrlf: s });
      if (w === null) throw new H(d);
      const p = await ht({ fs: r, gitdir: e, type: "blob", object: w });
      a.insert({ filepath: d, stats: h, oid: p });
    }
  }), f = await Promise.allSettled(l), c = f.filter((d) => d.status === "rejected").map((d) => d.reason);
  if (c.length > 1)
    throw new Zr(c);
  if (c.length === 1)
    throw c[0];
  return f.filter((d) => d.status === "fulfilled" && d.value).map((d) => d.value);
}
async function Er({ fs: t, gitdir: e, path: r }) {
  return (await J.get({ fs: t, gitdir: e })).get(r);
}
function Gc(t, ...e) {
  for (const r of e)
    if (r)
      for (const n of Object.keys(r)) {
        const a = r[n];
        a !== void 0 && (t[n] = a);
      }
  return t;
}
async function ce({ fs: t, gitdir: e, author: r, commit: n }) {
  const a = Math.floor(Date.now() / 1e3), i = {
    name: await Er({ fs: t, gitdir: e, path: "user.name" }),
    email: await Er({ fs: t, gitdir: e, path: "user.email" }) || "",
    // author.email is allowed to be empty string
    timestamp: a,
    timezoneOffset: new Date(a * 1e3).getTimezoneOffset()
  }, o = Gc(
    {},
    i,
    n ? n.author : void 0,
    r
  );
  if (o.name !== void 0)
    return o;
}
async function ke({
  fs: t,
  gitdir: e,
  author: r,
  committer: n,
  commit: a
}) {
  const i = Math.floor(Date.now() / 1e3), o = {
    name: await Er({ fs: t, gitdir: e, path: "user.name" }),
    email: await Er({ fs: t, gitdir: e, path: "user.email" }) || "",
    // committer.email is allowed to be empty string
    timestamp: i,
    timezoneOffset: new Date(i * 1e3).getTimezoneOffset()
  }, s = Gc(
    {},
    o,
    a ? a.committer : void 0,
    r,
    n
  );
  if (s.name !== void 0)
    return s;
}
async function Wc({ fs: t, cache: e, gitdir: r, oid: n }) {
  const { type: a, object: i } = await G({ fs: t, cache: e, gitdir: r, oid: n });
  if (a === "tag")
    return n = ct.from(i).parse().object, Wc({ fs: t, cache: e, gitdir: r, oid: n });
  if (a !== "commit")
    throw new ft(n, a, "commit");
  return { commit: q.from(i), oid: n };
}
async function zt({ fs: t, cache: e, gitdir: r, oid: n }) {
  const { commit: a, oid: i } = await Wc({
    fs: t,
    cache: e,
    gitdir: r,
    oid: n
  });
  return {
    oid: i,
    commit: a.parse(),
    payload: a.withoutSignature()
  };
}
async function Qr({
  fs: t,
  cache: e,
  onSign: r,
  gitdir: n,
  message: a,
  author: i,
  committer: o,
  signingKey: s,
  amend: l = !1,
  dryRun: f = !1,
  noUpdateBranch: c = !1,
  ref: u,
  parent: d,
  tree: h
}) {
  let w = !1, p = !1;
  u || (p = !(await t.read(`${n}/HEAD`, { encoding: "utf8" })).startsWith("ref:"), u = await T.resolve({
    fs: t,
    gitdir: n,
    ref: "HEAD",
    depth: 2
  }));
  let m, y;
  try {
    m = await T.resolve({
      fs: t,
      gitdir: n,
      ref: u
    }), y = await zt({ fs: t, gitdir: n, oid: m, cache: {} });
  } catch {
    w = !0;
  }
  if (l && w)
    throw new Jr(u);
  const _ = l ? await ce({
    fs: t,
    gitdir: n,
    author: i,
    commit: y.commit
  }) : await ce({ fs: t, gitdir: n, author: i });
  if (!_) throw new at("author");
  const v = l ? await ke({
    fs: t,
    gitdir: n,
    author: _,
    committer: o,
    commit: y.commit
  }) : await ke({
    fs: t,
    gitdir: n,
    author: _,
    committer: o
  });
  if (!v) throw new at("committer");
  return Y.acquire(
    { fs: t, gitdir: n, cache: e, allowUnmerged: !1 },
    async function(S) {
      const O = Pc(S.entries).get(".");
      if (h || (h = await qc({ fs: t, gitdir: n, inode: O, dryRun: f })), d ? d = await Promise.all(
        d.map((E) => T.resolve({ fs: t, gitdir: n, ref: E }))
      ) : l ? d = y.commit.parent : d = m ? [m] : [], !a)
        if (l)
          a = y.commit.message;
        else
          throw new ut("message");
      let x = q.from({
        tree: h,
        parent: d,
        author: _,
        committer: v,
        message: a
      });
      s && (x = await q.sign(x, r, s));
      const g = await ht({
        fs: t,
        gitdir: n,
        type: "commit",
        object: x.toObject(),
        dryRun: f
      });
      return !c && !f && await T.writeRef({
        fs: t,
        gitdir: n,
        ref: p ? "HEAD" : u,
        value: g
      }), g;
    }
  );
}
async function qc({ fs: t, gitdir: e, inode: r, dryRun: n }) {
  const a = r.children;
  for (const l of a)
    l.type === "tree" && (l.metadata.mode = "040000", l.metadata.oid = await qc({ fs: t, gitdir: e, inode: l, dryRun: n }));
  const i = a.map((l) => ({
    mode: l.metadata.mode,
    path: l.basename,
    oid: l.metadata.oid,
    type: l.type
  })), o = dt.from(i);
  return await ht({
    fs: t,
    gitdir: e,
    type: "tree",
    object: o.toObject(),
    dryRun: n
  });
}
async function tn({ fs: t, cache: e, gitdir: r, oid: n, filepath: a }) {
  if (a.startsWith("/"))
    throw new oe("leading-slash");
  if (a.endsWith("/"))
    throw new oe("trailing-slash");
  const i = n, o = await We({ fs: t, cache: e, gitdir: r, oid: n }), s = o.tree;
  if (a === "")
    n = o.oid;
  else {
    const l = a.split("/");
    n = await Zc({
      fs: t,
      cache: e,
      gitdir: r,
      tree: s,
      pathArray: l,
      oid: i,
      filepath: a
    });
  }
  return n;
}
async function Zc({
  fs: t,
  cache: e,
  gitdir: r,
  tree: n,
  pathArray: a,
  oid: i,
  filepath: o
}) {
  const s = a.shift();
  for (const l of n)
    if (l.path === s) {
      if (a.length === 0)
        return l.oid;
      {
        const { type: f, object: c } = await G({
          fs: t,
          cache: e,
          gitdir: r,
          oid: l.oid
        });
        if (f !== "tree")
          throw new ft(i, f, "tree", o);
        return n = dt.from(c), Zc({
          fs: t,
          cache: e,
          gitdir: r,
          tree: n,
          pathArray: a,
          oid: i,
          filepath: o
        });
      }
    }
  throw new H(`file or directory found at "${i}:${o}"`);
}
async function rr({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  filepath: a = void 0
}) {
  a !== void 0 && (n = await tn({ fs: t, cache: e, gitdir: r, oid: n, filepath: a }));
  const { tree: i, oid: o } = await We({ fs: t, cache: e, gitdir: r, oid: n });
  return {
    oid: o,
    tree: i.entries()
  };
}
async function en({ fs: t, gitdir: e, tree: r }) {
  const n = dt.from(r).toObject();
  return await ht({
    fs: t,
    gitdir: e,
    type: "tree",
    object: n,
    format: "content"
  });
}
async function wp({
  fs: t,
  cache: e,
  onSign: r,
  gitdir: n,
  ref: a,
  oid: i,
  note: o,
  force: s,
  author: l,
  committer: f,
  signingKey: c
}) {
  let u;
  try {
    u = await T.resolve({ gitdir: n, fs: t, ref: a });
  } catch (y) {
    if (!(y instanceof H))
      throw y;
  }
  let h = (await rr({
    fs: t,
    cache: e,
    gitdir: n,
    oid: u || "4b825dc642cb6eb9a060e54bf8d69288fbee4904"
  })).tree;
  if (s)
    h = h.filter((y) => y.path !== i);
  else
    for (const y of h)
      if (y.path === i)
        throw new Tt("note", i);
  typeof o == "string" && (o = Buffer.from(o, "utf8"));
  const w = await ht({
    fs: t,
    gitdir: n,
    type: "blob",
    object: o,
    format: "content"
  });
  h.push({ mode: "100644", path: i, oid: w, type: "blob" });
  const p = await en({
    fs: t,
    gitdir: n,
    tree: h
  });
  return await Qr({
    fs: t,
    cache: e,
    onSign: r,
    gitdir: n,
    ref: a,
    tree: p,
    parent: u && [u],
    message: `Note added by 'isomorphic-git addNote'
`,
    author: l,
    committer: f,
    signingKey: c
  });
}
async function Vc({
  fs: t,
  onSign: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  ref: a = "refs/notes/commits",
  oid: i,
  note: o,
  force: s,
  author: l,
  committer: f,
  signingKey: c,
  cache: u = {}
}) {
  try {
    b("fs", t), b("gitdir", n), b("oid", i), b("note", o), c && b("onSign", e);
    const d = new C(t), h = await ce({ fs: d, gitdir: n, author: l });
    if (!h) throw new at("author");
    const w = await ke({
      fs: d,
      gitdir: n,
      author: h,
      committer: f
    });
    if (!w) throw new at("committer");
    const p = await D({ fsp: d, dotgit: n });
    return await wp({
      fs: d,
      cache: u,
      onSign: e,
      gitdir: p,
      ref: a,
      oid: i,
      note: o,
      force: s,
      author: h,
      committer: w,
      signingKey: c
    });
  } catch (d) {
    throw d.caller = "git.addNote", d;
  }
}
const pp = /(^|[/.])([/.]|$)|^@$|@{|[\x00-\x20\x7f~^:?*[\\]|\.lock(\/|$)/;
function Sr(t, e) {
  if (typeof t != "string")
    throw new TypeError("Reference name must be a string");
  return !pp.test(t) && !0;
}
async function Xc({ fs: t, gitdir: e, remote: r, url: n, force: a }) {
  if (!Sr(r))
    throw new Rt(r, xr.clean(r));
  const i = await J.get({ fs: t, gitdir: e });
  if (!a && (await i.getSubsections("remote")).includes(r) && n !== await i.get(`remote.${r}.url`))
    throw new Tt("remote", r);
  await i.set(`remote.${r}.url`, n), await i.set(
    `remote.${r}.fetch`,
    `+refs/heads/*:refs/remotes/${r}/*`
  ), await J.save({ fs: t, gitdir: e, config: i });
}
async function Kc({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  remote: n,
  url: a,
  force: i = !1
}) {
  try {
    b("fs", t), b("gitdir", r), b("remote", n), b("url", a);
    const o = new C(t), s = await D({ fsp: o, dotgit: r });
    return await Xc({
      fs: o,
      gitdir: s,
      remote: n,
      url: a,
      force: i
    });
  } catch (o) {
    throw o.caller = "git.addRemote", o;
  }
}
async function mp({
  fs: t,
  cache: e,
  onSign: r,
  gitdir: n,
  ref: a,
  tagger: i,
  message: o = a,
  gpgsig: s,
  object: l,
  signingKey: f,
  force: c = !1
}) {
  if (a = a.startsWith("refs/tags/") ? a : `refs/tags/${a}`, !c && await T.exists({ fs: t, gitdir: n, ref: a }))
    throw new Tt("tag", a);
  const u = await T.resolve({
    fs: t,
    gitdir: n,
    ref: l || "HEAD"
  }), { type: d } = await G({ fs: t, cache: e, gitdir: n, oid: u });
  let h = ct.from({
    object: u,
    type: d,
    tag: a.replace("refs/tags/", ""),
    tagger: i,
    message: o,
    gpgsig: s
  });
  f && (h = await ct.sign(h, r, f));
  const w = await ht({
    fs: t,
    gitdir: n,
    type: "tag",
    object: h.toObject()
  });
  await T.writeRef({ fs: t, gitdir: n, ref: a, value: w });
}
async function Yc({
  fs: t,
  onSign: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  ref: a,
  tagger: i,
  message: o = a,
  gpgsig: s,
  object: l,
  signingKey: f,
  force: c = !1,
  cache: u = {}
}) {
  try {
    b("fs", t), b("gitdir", n), b("ref", a), f && b("onSign", e);
    const d = new C(t), h = await D({ fsp: d, dotgit: n }), w = await ce({
      fs: d,
      gitdir: h,
      author: i
    });
    if (!w) throw new at("tagger");
    return await mp({
      fs: d,
      cache: u,
      onSign: e,
      gitdir: h,
      ref: a,
      tagger: w,
      message: o,
      gpgsig: s,
      object: l,
      signingKey: f,
      force: c
    });
  } catch (d) {
    throw d.caller = "git.annotatedTag", d;
  }
}
async function gp({
  fs: t,
  gitdir: e,
  ref: r,
  object: n,
  checkout: a = !1,
  force: i = !1
}) {
  if (!Sr(r))
    throw new Rt(r, xr.clean(r));
  const o = `refs/heads/${r}`;
  if (!i && await T.exists({ fs: t, gitdir: e, ref: o }))
    throw new Tt("branch", r, !1);
  let s;
  try {
    s = await T.resolve({ fs: t, gitdir: e, ref: n || "HEAD" });
  } catch {
  }
  s && await T.writeRef({ fs: t, gitdir: e, ref: o, value: s }), a && await T.writeSymbolicRef({
    fs: t,
    gitdir: e,
    ref: "HEAD",
    value: o
  });
}
async function Jc({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n,
  object: a,
  checkout: i = !1,
  force: o = !1
}) {
  try {
    b("fs", t), b("gitdir", r), b("ref", n);
    const s = new C(t), l = await D({ fsp: s, dotgit: r });
    return await gp({
      fs: s,
      gitdir: l,
      ref: n,
      object: a,
      checkout: i,
      force: o
    });
  } catch (s) {
    throw s.caller = "git.branch", s;
  }
}
const Qc = (t, e) => t === "." || e == null || e.length === 0 || e === "." ? !0 : e.length >= t.length ? e.startsWith(t) : t.startsWith(e);
async function Ei({
  fs: t,
  cache: e,
  onProgress: r,
  onPostCheckout: n,
  dir: a,
  gitdir: i,
  remote: o,
  ref: s,
  filepaths: l,
  noCheckout: f,
  noUpdateHead: c,
  dryRun: u,
  force: d,
  track: h = !0,
  nonBlocking: w = !1,
  batchSize: p = 100
}) {
  let m;
  if (n)
    try {
      m = await T.resolve({ fs: t, gitdir: i, ref: "HEAD" });
    } catch {
      m = "0000000000000000000000000000000000000000";
    }
  let y;
  try {
    y = await T.resolve({ fs: t, gitdir: i, ref: s });
  } catch (_) {
    if (s === "HEAD") throw _;
    const v = `${o}/${s}`;
    if (y = await T.resolve({
      fs: t,
      gitdir: i,
      ref: v
    }), h) {
      const S = await J.get({ fs: t, gitdir: i });
      await S.set(`branch.${s}.remote`, o), await S.set(`branch.${s}.merge`, `refs/heads/${s}`), await J.save({ fs: t, gitdir: i, config: S });
    }
    await T.writeRef({
      fs: t,
      gitdir: i,
      ref: `refs/heads/${s}`,
      value: y
    });
  }
  if (!f) {
    let _;
    try {
      _ = await yp({
        fs: t,
        cache: e,
        onProgress: r,
        dir: a,
        gitdir: i,
        ref: s,
        force: d,
        filepaths: l
      });
    } catch (x) {
      throw x instanceof H && x.data.what === y ? new Lr(s, y) : x;
    }
    const v = _.filter(([x]) => x === "conflict").map(([x, g]) => g);
    if (v.length > 0)
      throw new Ur(v);
    const S = _.filter(([x]) => x === "error").map(([x, g]) => g);
    if (S.length > 0)
      throw new F(S.join(", "));
    if (u) {
      n && await n({
        previousHead: m,
        newHead: y,
        type: l != null && l.length > 0 ? "file" : "branch"
      });
      return;
    }
    let k = 0;
    const O = _.length;
    if (await Y.acquire(
      { fs: t, gitdir: i, cache: e },
      async function(x) {
        await Promise.all(
          _.filter(
            ([g]) => g === "delete" || g === "delete-index"
          ).map(async function([g, E]) {
            const A = `${a}/${E}`;
            g === "delete" && await t.rm(A), x.delete({ filepath: E }), r && await r({
              phase: "Updating workdir",
              loaded: ++k,
              total: O
            });
          })
        );
      }
    ), await Y.acquire(
      { fs: t, gitdir: i, cache: e },
      async function(x) {
        for (const [g, E] of _)
          if (g === "rmdir" || g === "rmdir-index") {
            const A = `${a}/${E}`;
            try {
              g === "rmdir" && await t.rmdir(A), x.delete({ filepath: E }), r && await r({
                phase: "Updating workdir",
                loaded: ++k,
                total: O
              });
            } catch ($) {
              if ($.code === "ENOTEMPTY")
                console.log(
                  `Did not delete ${E} because directory is not empty`
                );
              else
                throw $;
            }
          }
      }
    ), await Promise.all(
      _.filter(([x]) => x === "mkdir" || x === "mkdir-index").map(async function([x, g]) {
        const E = `${a}/${g}`;
        await t.mkdir(E), r && await r({
          phase: "Updating workdir",
          loaded: ++k,
          total: O
        });
      })
    ), w) {
      const x = _.filter(
        ([E]) => E === "create" || E === "create-index" || E === "update" || E === "mkdir-index"
      ), g = await ls(
        "Update Working Dir",
        x.map(
          ([E, A, $, I, B]) => () => bp({ fs: t, cache: e, gitdir: i, dir: a }, [
            E,
            A,
            $,
            I,
            B
          ])
        ),
        r,
        p
      );
      await Y.acquire(
        { fs: t, gitdir: i, cache: e, allowUnmerged: !0 },
        async function(E) {
          await ls(
            "Update Index",
            g.map(
              ([A, $, I]) => () => _p({ index: E, fullpath: A, oid: $, stats: I })
            ),
            r,
            p
          );
        }
      );
    } else
      await Y.acquire(
        { fs: t, gitdir: i, cache: e, allowUnmerged: !0 },
        async function(x) {
          await Promise.all(
            _.filter(
              ([g]) => g === "create" || g === "create-index" || g === "update" || g === "mkdir-index"
            ).map(async function([g, E, A, $, I]) {
              const B = `${a}/${E}`;
              try {
                if (g !== "create-index" && g !== "mkdir-index") {
                  const { object: K } = await G({
                    fs: t,
                    cache: e,
                    gitdir: i,
                    oid: A
                  });
                  if (I && await t.rm(B), $ === 33188)
                    await t.write(B, K);
                  else if ($ === 33261)
                    await t.write(B, K, { mode: 511 });
                  else if ($ === 40960)
                    await t.writelink(B, K);
                  else
                    throw new F(
                      `Invalid mode 0o${$.toString(
                        8
                      )} detected in blob ${A}`
                    );
                }
                const N = await t.lstat(B);
                $ === 33261 && (N.mode = 493), g === "mkdir-index" && (N.mode = 57344), x.insert({
                  filepath: E,
                  stats: N,
                  oid: A
                }), r && await r({
                  phase: "Updating workdir",
                  loaded: ++k,
                  total: O
                });
              } catch (N) {
                console.log(N);
              }
            })
          );
        }
      );
    n && await n({
      previousHead: m,
      newHead: y,
      type: l != null && l.length > 0 ? "file" : "branch"
    });
  }
  if (!c) {
    const _ = await T.expand({ fs: t, gitdir: i, ref: s });
    _.startsWith("refs/heads") ? await T.writeSymbolicRef({
      fs: t,
      gitdir: i,
      ref: "HEAD",
      value: _
    }) : await T.writeRef({ fs: t, gitdir: i, ref: "HEAD", value: y });
  }
}
async function yp({
  fs: t,
  cache: e,
  onProgress: r,
  dir: n,
  gitdir: a,
  ref: i,
  force: o,
  filepaths: s
}) {
  let l = 0;
  return se({
    fs: t,
    cache: e,
    dir: n,
    gitdir: a,
    trees: [gt({ ref: i }), tr(), Re()],
    map: async function(f, [c, u, d]) {
      if (f === ".") return;
      if (s && !s.some((w) => Qc(f, w)))
        return null;
      switch (r && await r({ phase: "Analyzing workdir", loaded: ++l }), [!!d, !!c, !!u].map(Number).join("")) {
        case "000":
          return;
        case "001":
          return o && s && s.includes(f) ? ["delete", f] : void 0;
        case "010":
          switch (await c.type()) {
            case "tree":
              return ["mkdir", f];
            case "blob":
              return [
                "create",
                f,
                await c.oid(),
                await c.mode()
              ];
            case "commit":
              return [
                "mkdir-index",
                f,
                await c.oid(),
                await c.mode()
              ];
            default:
              return [
                "error",
                `new entry Unhandled type ${await c.type()}`
              ];
          }
        case "011":
          switch (`${await c.type()}-${await u.type()}`) {
            case "tree-tree":
              return;
            case "tree-blob":
            case "blob-tree":
              return ["conflict", f];
            case "blob-blob":
              return await c.oid() !== await u.oid() ? o ? [
                "update",
                f,
                await c.oid(),
                await c.mode(),
                await c.mode() !== await u.mode()
              ] : ["conflict", f] : await c.mode() !== await u.mode() ? o ? [
                "update",
                f,
                await c.oid(),
                await c.mode(),
                !0
              ] : ["conflict", f] : [
                "create-index",
                f,
                await c.oid(),
                await c.mode()
              ];
            case "commit-tree":
              return;
            case "commit-blob":
              return ["conflict", f];
            default:
              return ["error", `new entry Unhandled type ${c.type}`];
          }
        case "100":
          return ["delete-index", f];
        case "101":
          switch (await d.type()) {
            case "tree":
              return ["rmdir-index", f];
            case "blob":
              return await d.oid() !== await u.oid() ? o ? ["delete", f] : ["conflict", f] : ["delete", f];
            case "commit":
              return ["rmdir-index", f];
            default:
              return [
                "error",
                `delete entry Unhandled type ${await d.type()}`
              ];
          }
        case "110":
        case "111":
          switch (`${await d.type()}-${await c.type()}`) {
            case "tree-tree":
              return;
            case "blob-blob": {
              if (await d.oid() === await c.oid() && await d.mode() === await c.mode() && !o)
                return;
              if (u) {
                if (await u.oid() !== await d.oid() && await u.oid() !== await c.oid())
                  return o ? [
                    "update",
                    f,
                    await c.oid(),
                    await c.mode(),
                    await c.mode() !== await u.mode()
                  ] : ["conflict", f];
              } else if (o)
                return [
                  "update",
                  f,
                  await c.oid(),
                  await c.mode(),
                  await c.mode() !== await d.mode()
                ];
              return await c.mode() !== await d.mode() ? [
                "update",
                f,
                await c.oid(),
                await c.mode(),
                !0
              ] : await c.oid() !== await d.oid() ? [
                "update",
                f,
                await c.oid(),
                await c.mode(),
                !1
              ] : void 0;
            }
            case "tree-blob":
              return ["update-dir-to-blob", f, await c.oid()];
            case "blob-tree":
              return ["update-blob-to-tree", f];
            case "commit-commit":
              return [
                "mkdir-index",
                f,
                await c.oid(),
                await c.mode()
              ];
            default:
              return [
                "error",
                `update entry Unhandled type ${await d.type()}-${await c.type()}`
              ];
          }
      }
    },
    // Modify the default flat mapping
    reduce: async function(f, c) {
      return c = Uc(c), f ? f && f[0] === "rmdir" ? (c.push(f), c) : (c.unshift(f), c) : c;
    }
  });
}
async function _p({ index: t, fullpath: e, stats: r, oid: n }) {
  try {
    t.insert({
      filepath: e,
      stats: r,
      oid: n
    });
  } catch (a) {
    console.warn(`Error inserting ${e} into index:`, a);
  }
}
async function bp({ fs: t, cache: e, gitdir: r, dir: n }, [a, i, o, s, l]) {
  const f = `${n}/${i}`;
  if (a !== "create-index" && a !== "mkdir-index") {
    const { object: u } = await G({ fs: t, cache: e, gitdir: r, oid: o });
    if (l && await t.rm(f), s === 33188)
      await t.write(f, u);
    else if (s === 33261)
      await t.write(f, u, { mode: 511 });
    else if (s === 40960)
      await t.writelink(f, u);
    else
      throw new F(
        `Invalid mode 0o${s.toString(8)} detected in blob ${o}`
      );
  }
  const c = await t.lstat(f);
  return s === 33261 && (c.mode = 493), a === "mkdir-index" && (c.mode = 57344), [i, o, c];
}
async function ls(t, e, r, n) {
  const a = [];
  try {
    for (let i = 0; i < e.length; i += n) {
      const o = e.slice(i, i + n).map((l) => l());
      (await Promise.allSettled(o)).forEach((l) => {
        l.status === "fulfilled" && a.push(l.value);
      }), r && await r({
        phase: "Updating workdir",
        loaded: i + o.length,
        total: e.length
      });
    }
    return a;
  } catch (i) {
    console.error(`Error during ${t}: ${i}`);
  }
  return a;
}
async function Si({
  fs: t,
  onProgress: e,
  onPostCheckout: r,
  dir: n,
  gitdir: a = R(n, ".git"),
  remote: i = "origin",
  ref: o,
  filepaths: s,
  noCheckout: l = !1,
  noUpdateHead: f = o === void 0,
  dryRun: c = !1,
  force: u = !1,
  track: d = !0,
  cache: h = {},
  nonBlocking: w = !1,
  batchSize: p = 100
}) {
  try {
    b("fs", t), b("dir", n), b("gitdir", a);
    const m = o || "HEAD", y = new C(t), _ = await D({ fsp: y, dotgit: a });
    return await Ei({
      fs: y,
      cache: h,
      onProgress: e,
      onPostCheckout: r,
      dir: n,
      gitdir: _,
      remote: i,
      ref: m,
      filepaths: s,
      noCheckout: l,
      noUpdateHead: f,
      dryRun: c,
      force: u,
      track: d,
      nonBlocking: w,
      batchSize: p
    });
  } catch (m) {
    throw m.caller = "git.checkout", m;
  }
}
const Ma = /^.*(\r?\n|$)/gm;
function vp({ branches: t, contents: e }) {
  const r = t[1], n = t[2], a = e[0], i = e[1], o = e[2], s = i.match(Ma), l = a.match(Ma), f = o.match(Ma), c = uw(s, l, f), u = 7;
  let d = "", h = !0;
  for (const w of c)
    w.ok && (d += w.ok.join("")), w.conflict && (h = !1, d += `${"<".repeat(u)} ${r}
`, d += w.conflict.a.join(""), d += `${"=".repeat(u)}
`, d += w.conflict.b.join(""), d += `${">".repeat(u)} ${n}
`);
  return { cleanMerge: h, mergedText: d };
}
async function tf({
  fs: t,
  cache: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  index: a,
  ourOid: i,
  baseOid: o,
  theirOid: s,
  ourName: l = "ours",
  baseName: f = "base",
  theirName: c = "theirs",
  dryRun: u = !1,
  abortOnConflict: d = !0,
  mergeDriver: h
}) {
  const w = gt({ ref: i }), p = gt({ ref: o }), m = gt({ ref: s }), y = [], _ = [], v = [], S = [], k = await se({
    fs: t,
    cache: e,
    dir: r,
    gitdir: n,
    trees: [w, p, m],
    map: async function(O, [x, g, E]) {
      const A = On(O), $ = await Bn(x, g), I = await Bn(E, g);
      switch (`${$}-${I}`) {
        case "false-false":
          return {
            mode: await g.mode(),
            path: A,
            oid: await g.oid(),
            type: await g.type()
          };
        case "false-true":
          return !E && await x.type() === "tree" ? {
            mode: await x.mode(),
            path: A,
            oid: await x.oid(),
            type: await x.type()
          } : E ? {
            mode: await E.mode(),
            path: A,
            oid: await E.oid(),
            type: await E.type()
          } : void 0;
        case "true-false":
          return !x && await E.type() === "tree" ? {
            mode: await E.mode(),
            path: A,
            oid: await E.oid(),
            type: await E.type()
          } : x ? {
            mode: await x.mode(),
            path: A,
            oid: await x.oid(),
            type: await x.type()
          } : void 0;
        case "true-true": {
          if (x && E && await x.type() === "tree" && await E.type() === "tree")
            return {
              mode: await x.mode(),
              path: A,
              oid: await x.oid(),
              type: "tree"
            };
          if (x && E && await x.type() === "blob" && await E.type() === "blob")
            return xp({
              fs: t,
              gitdir: n,
              path: A,
              ours: x,
              base: g,
              theirs: E,
              ourName: l,
              baseName: f,
              theirName: c,
              mergeDriver: h
            }).then(async (B) => {
              if (B.cleanMerge)
                d || a.insert({ filepath: O, oid: B.mergeResult.oid, stage: 0 });
              else if (y.push(O), _.push(O), !d) {
                let N = "";
                g && await g.type() === "blob" && (N = await g.oid());
                const K = await x.oid(), It = await E.oid();
                a.delete({ filepath: O }), N && a.insert({ filepath: O, oid: N, stage: 1 }), a.insert({ filepath: O, oid: K, stage: 2 }), a.insert({ filepath: O, oid: It, stage: 3 });
              }
              return B.mergeResult;
            });
          if (g && !x && E && await g.type() === "blob" && await E.type() === "blob") {
            if (y.push(O), v.push(O), !d) {
              const B = await g.oid(), N = await E.oid();
              a.delete({ filepath: O }), a.insert({ filepath: O, oid: B, stage: 1 }), a.insert({ filepath: O, oid: N, stage: 3 });
            }
            return {
              mode: await E.mode(),
              oid: await E.oid(),
              type: "blob",
              path: A
            };
          }
          if (g && x && !E && await g.type() === "blob" && await x.type() === "blob") {
            if (y.push(O), S.push(O), !d) {
              const B = await g.oid(), N = await x.oid();
              a.delete({ filepath: O }), a.insert({ filepath: O, oid: B, stage: 1 }), a.insert({ filepath: O, oid: N, stage: 2 });
            }
            return {
              mode: await x.mode(),
              oid: await x.oid(),
              type: "blob",
              path: A
            };
          }
          if (g && !x && !E && (await g.type() === "blob" || await g.type() === "tree"))
            return;
          throw new Je();
        }
      }
    },
    /**
     * @param {TreeEntry} [parent]
     * @param {Array<TreeEntry>} children
     */
    reduce: y.length !== 0 && (!r || d) ? void 0 : async (O, x) => {
      const g = x.filter(Boolean);
      if (O && !(O && O.type === "tree" && g.length === 0 && O.path !== ".")) {
        if (g.length > 0 || O.path === "." && g.length === 0) {
          const A = new dt(g).toObject(), $ = await ht({
            fs: t,
            gitdir: n,
            type: "tree",
            object: A,
            dryRun: u
          });
          O.oid = $;
        }
        return O;
      }
    }
  });
  return y.length !== 0 ? (r && !d && await se({
    fs: t,
    cache: e,
    dir: r,
    gitdir: n,
    trees: [gt({ ref: k.oid })],
    map: async function(O, [x]) {
      const g = `${r}/${O}`;
      if (await x.type() === "blob") {
        const E = await x.mode(), A = new TextDecoder().decode(await x.content());
        await t.write(g, A, { mode: E });
      }
      return !0;
    }
  }), new Oe(
    y,
    _,
    v,
    S
  )) : k.oid;
}
async function xp({
  fs: t,
  gitdir: e,
  path: r,
  ours: n,
  base: a,
  theirs: i,
  ourName: o,
  theirName: s,
  baseName: l,
  dryRun: f,
  mergeDriver: c = vp
}) {
  const u = "blob";
  let d = "100755", h = "", w = "";
  a && await a.type() === "blob" && (d = await a.mode(), h = await a.oid(), w = Buffer.from(await a.content()).toString("utf8"));
  const p = d === await n.mode() ? await i.mode() : await n.mode();
  if (await n.oid() === await i.oid())
    return {
      cleanMerge: !0,
      mergeResult: { mode: p, path: r, oid: await n.oid(), type: u }
    };
  if (await n.oid() === h)
    return {
      cleanMerge: !0,
      mergeResult: { mode: p, path: r, oid: await i.oid(), type: u }
    };
  if (await i.oid() === h)
    return {
      cleanMerge: !0,
      mergeResult: { mode: p, path: r, oid: await n.oid(), type: u }
    };
  const m = Buffer.from(await n.content()).toString("utf8"), y = Buffer.from(await i.content()).toString("utf8"), { mergedText: _, cleanMerge: v } = await c({
    branches: [l, o, s],
    contents: [w, m, y],
    path: r
  }), S = await ht({
    fs: t,
    gitdir: e,
    type: "blob",
    object: Buffer.from(_, "utf8"),
    dryRun: f
  });
  return { cleanMerge: v, mergeResult: { mode: p, path: r, oid: S, type: u } };
}
const Ep = {
  stage: Re,
  workdir: tr
};
let za;
async function qe(t, e) {
  return za === void 0 && (za = new vr()), za.acquire(t, e);
}
async function Sp(t, e, r, n, a = null) {
  const i = R(r, n), o = await t.lstat(i);
  if (!o) throw new H(i);
  if (o.isDirectory())
    throw new F(
      `${i}: file expected, but found directory`
    );
  const s = a ? await Cc({ fs: t, gitdir: e, oid: a }) : void 0;
  let l = s ? a : void 0;
  return s || await qe({ fs: t, gitdir: e, currentFilepath: i }, async () => {
    const f = o.isSymbolicLink() ? await t.readlink(i).then(Lc) : await t.read(i);
    if (f === null) throw new H(i);
    l = await ht({ fs: t, gitdir: e, type: "blob", object: f });
  }), l;
}
async function kp({ fs: t, dir: e, gitdir: r, entries: n }) {
  async function a(i) {
    if (i.type === "tree") {
      if (!i.oid) {
        const o = await Promise.all(i.children.map(a));
        i.oid = await en({
          fs: t,
          gitdir: r,
          tree: o
        }), i.mode = 16384;
      }
    } else i.type === "blob" && (i.oid = await Sp(
      t,
      r,
      e,
      i.path,
      i.oid
    ), i.mode = 33188);
    return i.path = i.path.split("/").pop(), i;
  }
  return Promise.all(n.map(a));
}
async function us({
  fs: t,
  dir: e,
  gitdir: r,
  treePair: n
  // [TREE({ ref: 'HEAD' }), 'STAGE'] would be the equivalent of `git write-tree`
}) {
  const a = n[1] === "stage", i = n.map((h) => typeof h == "string" ? Ep[h]() : h), o = [], c = await se({
    fs: t,
    cache: {},
    dir: e,
    gitdir: r,
    trees: i,
    map: async (h, [w, p]) => {
      if (!(h === "." || await er.isIgnored({ fs: t, dir: e, gitdir: r, filepath: h })) && p)
        return (!w || await w.oid() !== await p.oid() && await p.oid() !== void 0) && o.push([w, p]), {
          mode: await p.mode(),
          path: h,
          oid: await p.oid(),
          type: await p.type()
        };
    },
    reduce: async (h, w) => (w = w.filter(Boolean), h ? (h.children = w, h) : w.length > 0 ? w : void 0),
    iterate: async (h, w) => {
      const p = [];
      for (const m of w) {
        const [y, _] = m;
        a ? _ && (await t.exists(`${e}/${_.toString()}`) ? p.push(m) : o.push([null, _])) : y && (_ ? p.push(m) : o.push([y, null]));
      }
      return p.length ? Promise.all(p.map(h)) : [];
    }
  });
  if (o.length === 0 || c.length === 0)
    return null;
  const d = (await kp({
    fs: t,
    dir: e,
    gitdir: r,
    entries: c
  })).filter(Boolean).map((h) => ({
    mode: h.mode,
    path: h.path,
    oid: h.oid,
    type: h.type
  }));
  return en({ fs: t, gitdir: r, tree: d });
}
async function ef({
  fs: t,
  dir: e,
  gitdir: r,
  stashCommit: n,
  parentCommit: a,
  wasStaged: i
}) {
  const o = [], s = [], l = await se({
    fs: t,
    cache: {},
    dir: e,
    gitdir: r,
    trees: [gt({ ref: a }), gt({ ref: n })],
    map: async (f, [c, u]) => {
      if (f === "." || await er.isIgnored({ fs: t, dir: e, gitdir: r, filepath: f }))
        return;
      const d = u ? await u.type() : await c.type();
      if (d !== "tree" && d !== "blob")
        return;
      if (!u && c) {
        const w = d === "tree" ? "rmdir" : "rm";
        return d === "tree" && o.push(f), d === "blob" && i && s.push({ filepath: f, oid: await c.oid() }), { method: w, filepath: f };
      }
      const h = await u.oid();
      if (!c || await c.oid() !== h)
        return d === "tree" ? { method: "mkdir", filepath: f } : (i && s.push({
          filepath: f,
          oid: h,
          stats: await t.lstat(R(e, f))
        }), {
          method: "write",
          filepath: f,
          oid: h
        });
    }
  });
  await qe({ fs: t, gitdir: r, dirRemoved: o, ops: l }, async () => {
    for (const f of l) {
      const c = R(e, f.filepath);
      switch (f.method) {
        case "rmdir":
          await t.rmdir(c);
          break;
        case "mkdir":
          await t.mkdir(c);
          break;
        case "rm":
          await t.rm(c);
          break;
        case "write":
          if (!o.some(
            (u) => c.startsWith(u)
          )) {
            const { object: u } = await G({
              fs: t,
              cache: {},
              gitdir: r,
              oid: f.oid
            });
            await t.exists(c) && await t.rm(c), await t.write(c, u);
          }
          break;
      }
    }
  }), await Y.acquire({ fs: t, gitdir: r, cache: {} }, async (f) => {
    s.forEach(({ filepath: c, stats: u, oid: d }) => {
      f.insert({ filepath: c, stats: u, oid: d });
    });
  });
}
async function ds({
  fs: t,
  cache: e,
  dir: r,
  gitdir: n,
  oid: a,
  dryRun: i = !1,
  noUpdateBranch: o = !1,
  abortOnConflict: s = !0,
  committer: l,
  mergeDriver: f
}) {
  const { commit: c, oid: u } = await zt({
    fs: t,
    cache: e,
    gitdir: n,
    oid: a
  });
  if (c.parent.length > 1)
    throw new Mr(u, c.parent.length);
  if (c.parent.length === 0)
    throw new zr(u);
  const d = await T.resolve({
    fs: t,
    gitdir: n,
    ref: "HEAD"
  }), { commit: h } = await zt({
    fs: t,
    cache: e,
    gitdir: n,
    oid: d
  }), w = c.parent[0], { commit: p } = await zt({
    fs: t,
    cache: e,
    gitdir: n,
    oid: w
  }), m = await Y.acquire(
    { fs: t, gitdir: n, cache: e, allowUnmerged: !1 },
    async (_) => tf({
      fs: t,
      cache: e,
      dir: r,
      gitdir: n,
      index: _,
      ourOid: h.tree,
      baseOid: p.tree,
      theirOid: c.tree,
      ourName: "HEAD",
      baseName: `parent of ${u.slice(0, 7)}`,
      theirName: u.slice(0, 7),
      dryRun: i,
      abortOnConflict: s,
      mergeDriver: f
    })
  );
  if (m instanceof Oe)
    throw m;
  const y = await Qr({
    fs: t,
    cache: e,
    gitdir: n,
    message: c.message,
    tree: m,
    parent: [d],
    // Single parent: current HEAD
    author: c.author,
    // Preserve original author
    committer: l,
    // New committer
    dryRun: i,
    noUpdateBranch: o
  });
  return r && !i && !o && await ef({
    fs: t,
    dir: r,
    gitdir: n,
    stashCommit: y,
    parentCommit: d,
    wasStaged: !0
  }), y;
}
async function rf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oid: n,
  cache: a = {},
  committer: i,
  dryRun: o = !1,
  noUpdateBranch: s = !1,
  abortOnConflict: l = !0,
  mergeDriver: f
}) {
  try {
    b("fs", t), b("gitdir", r), b("oid", n);
    const c = new C(t), u = await D({ fsp: c, dotgit: r }), { commit: d } = await zt({
      fs: c,
      cache: a,
      gitdir: u,
      oid: n
    });
    if (d.parent && d.parent.length > 1)
      return await ds({
        fs: c,
        cache: a,
        dir: e,
        gitdir: u,
        oid: n,
        dryRun: o,
        noUpdateBranch: s,
        abortOnConflict: l,
        committer: void 0,
        mergeDriver: f
      });
    const h = await ke({
      fs: c,
      gitdir: u,
      committer: i
    });
    if (!h)
      throw new at("committer");
    return await ds({
      fs: c,
      cache: a,
      dir: e,
      gitdir: u,
      oid: n,
      dryRun: o,
      noUpdateBranch: s,
      abortOnConflict: l,
      committer: h,
      mergeDriver: f
    });
  } catch (c) {
    throw c.caller = "git.cherryPick", c;
  }
}
const Ap = /^refs\/(heads\/|tags\/|remotes\/)?(.*)/;
function ge(t) {
  const e = Ap.exec(t);
  return e ? e[1] === "remotes/" && t.endsWith("/HEAD") ? e[2].slice(0, -5) : e[2] : t;
}
async function le({
  fs: t,
  gitdir: e,
  fullname: r = !1,
  test: n = !1
}) {
  const a = await T.resolve({
    fs: t,
    gitdir: e,
    ref: "HEAD",
    depth: 2
  });
  if (n)
    try {
      await T.resolve({ fs: t, gitdir: e, ref: a });
    } catch {
      return;
    }
  if (a.startsWith("refs/"))
    return r ? a : ge(a);
}
function $p(t) {
  return t = t.replace(/^git@([^:]+):/, "https://$1/"), t = t.replace(/^ssh:\/\//, "https://"), t;
}
function nf({ username: t = "", password: e = "" }) {
  return `Basic ${Buffer.from(`${t}:${e}`).toString("base64")}`;
}
async function rn(t, e) {
  const r = Dc(t);
  for (; ; ) {
    const { value: n, done: a } = await r.next();
    if (n && await e(n), a) break;
  }
  r.return && r.return();
}
async function Cn(t) {
  let e = 0;
  const r = [];
  await rn(t, (i) => {
    r.push(i), e += i.byteLength;
  });
  const n = new Uint8Array(e);
  let a = 0;
  for (const i of r)
    n.set(i, a), a += i.byteLength;
  return n;
}
function hs(t) {
  let e = t.match(/^https?:\/\/([^/]+)@/);
  if (e == null) return { url: t, auth: {} };
  e = e[1];
  const [r, n] = e.split(":");
  return t = t.replace(`${e}@`, ""), { url: t, auth: { username: r, password: n } };
}
function oi(t, e) {
  const r = e.toString(16);
  return "0".repeat(t - r.length) + r;
}
class X {
  static flush() {
    return Buffer.from("0000", "utf8");
  }
  static delim() {
    return Buffer.from("0001", "utf8");
  }
  static encode(e) {
    typeof e == "string" && (e = Buffer.from(e));
    const r = e.length + 4, n = oi(4, r);
    return Buffer.concat([Buffer.from(n, "utf8"), e]);
  }
  static streamReader(e) {
    const r = new Nc(e);
    return async function() {
      try {
        let a = await r.read(4);
        if (a == null) return !0;
        if (a = parseInt(a.toString("utf8"), 16), a === 0 || a === 1) return null;
        const i = await r.read(a - 4);
        return i ?? !0;
      } catch (a) {
        return e.error = a, !0;
      }
    };
  }
}
async function ws(t) {
  const e = {};
  let r;
  for (; r = await t(), r !== !0; ) {
    if (r === null) continue;
    r = r.toString("utf8").replace(/\n$/, "");
    const n = r.indexOf("=");
    if (n > -1) {
      const a = r.slice(0, n), i = r.slice(n + 1);
      e[a] = i;
    } else
      e[r] = !0;
  }
  return { protocolVersion: 2, capabilities2: e };
}
async function ps(t, { service: e }) {
  const r = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), i = X.streamReader(t);
  let o = await i();
  for (; o === null; ) o = await i();
  if (o === !0) throw new Hr();
  if (o.includes("version 2"))
    return ws(i);
  if (o.toString("utf8").replace(/\n$/, "") !== `# service=${e}`)
    throw new Te(`# service=${e}\\n`, o.toString("utf8"));
  let s = await i();
  for (; s === null; ) s = await i();
  if (s === !0) return { capabilities: r, refs: n, symrefs: a };
  if (s = s.toString("utf8"), s.includes("version 2"))
    return ws(i);
  const [l, f] = La(s, "\0", "\\x00");
  if (f.split(" ").map((c) => r.add(c)), l !== "0000000000000000000000000000000000000000 capabilities^{}") {
    const [c, u] = La(l, " ", " ");
    for (n.set(u, c); ; ) {
      const d = await i();
      if (d === !0) break;
      if (d !== null) {
        const [h, w] = La(d.toString("utf8"), " ", " ");
        n.set(w, h);
      }
    }
  }
  for (const c of r)
    if (c.startsWith("symref=")) {
      const u = c.match(/symref=([^:]+):(.*)/);
      u.length === 3 && a.set(u[1], u[2]);
    }
  return { protocolVersion: 1, capabilities: r, refs: n, symrefs: a };
}
function La(t, e, r) {
  const n = t.trim().split(e);
  if (n.length !== 2)
    throw new Te(
      `Two strings separated by '${r}'`,
      t.toString("utf8")
    );
  return n;
}
const ms = (t, e) => t.endsWith("?") ? `${t}${e}` : `${t}/${e.replace(/^https?:\/\//, "")}`, gs = (t, e) => {
  (e.username || e.password) && (t.Authorization = nf(e)), e.headers && Object.assign(t, e.headers);
}, Ha = async (t) => {
  try {
    const e = Buffer.from(await Cn(t.body)), r = e.toString("utf8");
    return { preview: r.length < 256 ? r : r.slice(0, 256) + "...", response: r, data: e };
  } catch {
    return {};
  }
};
class Dn {
  /**
   * Returns the capabilities of the GitRemoteHTTP class.
   *
   * @returns {Promise<string[]>} - An array of supported capabilities.
   */
  static async capabilities() {
    return ["discover", "connect"];
  }
  /**
   * Discovers references from a remote Git repository.
   *
   * @param {Object} args
   * @param {HttpClient} args.http - The HTTP client to use for requests.
   * @param {ProgressCallback} [args.onProgress] - Callback for progress updates.
   * @param {AuthCallback} [args.onAuth] - Callback for providing authentication credentials.
   * @param {AuthFailureCallback} [args.onAuthFailure] - Callback for handling authentication failures.
   * @param {AuthSuccessCallback} [args.onAuthSuccess] - Callback for handling successful authentication.
   * @param {string} [args.corsProxy] - Optional CORS proxy URL.
   * @param {string} args.service - The Git service (e.g., "git-upload-pack").
   * @param {string} args.url - The URL of the remote repository.
   * @param {Object<string, string>} args.headers - HTTP headers to include in the request.
   * @param {1 | 2} args.protocolVersion - The Git protocol version to use.
   * @returns {Promise<Object>} - The parsed response from the remote repository.
   * @throws {HttpError} - If the HTTP request fails.
   * @throws {SmartHttpError} - If the response cannot be parsed.
   * @throws {UserCanceledError} - If the user cancels the operation.
   */
  static async discover({
    http: e,
    onProgress: r,
    onAuth: n,
    onAuthSuccess: a,
    onAuthFailure: i,
    corsProxy: o,
    service: s,
    url: l,
    headers: f,
    protocolVersion: c
  }) {
    let { url: u, auth: d } = hs(l);
    const h = o ? ms(o, u) : u;
    (d.username || d.password) && (f.Authorization = nf(d)), c === 2 && (f["Git-Protocol"] = "version=2");
    let w, p, m = !1;
    do
      if (w = await e.request({
        onProgress: r,
        method: "GET",
        url: `${h}/info/refs?service=${s}`,
        headers: f
      }), p = !1, w.statusCode === 401 || w.statusCode === 203) {
        const y = m ? i : n;
        if (y) {
          if (d = await y(u, {
            ...d,
            headers: { ...f }
          }), d && d.cancel)
            throw new Qe();
          d && (gs(f, d), m = !0, p = !0);
        }
      } else w.statusCode === 200 && m && a && await a(u, d);
    while (p);
    if (w.statusCode !== 200) {
      const { response: y } = await Ha(w);
      throw new He(w.statusCode, w.statusMessage, y);
    }
    if (w.headers["content-type"] === `application/x-${s}-advertisement`) {
      const y = await ps(w.body, { service: s });
      return y.auth = d, y;
    } else {
      const { preview: y, response: _, data: v } = await Ha(w);
      try {
        const S = await ps([v], { service: s });
        return S.auth = d, S;
      } catch {
        throw new Vr(y, _);
      }
    }
  }
  /**
   * Connects to a remote Git repository and sends a request.
   *
   * @param {Object} args
   * @param {HttpClient} args.http - The HTTP client to use for requests.
   * @param {ProgressCallback} [args.onProgress] - Callback for progress updates.
   * @param {string} [args.corsProxy] - Optional CORS proxy URL.
   * @param {string} args.service - The Git service (e.g., "git-upload-pack").
   * @param {string} args.url - The URL of the remote repository.
   * @param {Object<string, string>} [args.headers] - HTTP headers to include in the request.
   * @param {any} args.body - The request body to send.
   * @param {any} args.auth - Authentication credentials.
   * @returns {Promise<GitHttpResponse>} - The HTTP response from the remote repository.
   * @throws {HttpError} - If the HTTP request fails.
   */
  static async connect({
    http: e,
    onProgress: r,
    corsProxy: n,
    service: a,
    url: i,
    auth: o,
    body: s,
    headers: l
  }) {
    const f = hs(i);
    f && (i = f.url), n && (i = ms(n, i)), l["content-type"] = `application/x-${a}-request`, l.accept = `application/x-${a}-result`, gs(l, o);
    const c = await e.request({
      onProgress: r,
      method: "POST",
      url: `${i}/${a}`,
      body: s,
      headers: l
    });
    if (c.statusCode !== 200) {
      const { response: u } = Ha(c);
      throw new He(c.statusCode, c.statusMessage, u);
    }
    return c;
  }
}
class Wn {
  /**
   * Determines the appropriate remote helper for the given URL.
   *
   * @param {Object} args
   * @param {string} args.url - The URL of the remote repository.
   * @returns {Object} - The remote helper class for the specified transport.
   * @throws {UrlParseError} - If the URL cannot be parsed.
   * @throws {UnknownTransportError} - If the transport is not supported.
   */
  static getRemoteHelperFor({ url: e }) {
    const r = /* @__PURE__ */ new Map();
    r.set("http", Dn), r.set("https", Dn);
    const n = Rp({ url: e });
    if (!n)
      throw new Kr(e);
    if (r.has(n.transport))
      return r.get(n.transport);
    throw new Xr(
      e,
      n.transport,
      n.transport === "ssh" ? $p(e) : void 0
    );
  }
}
function Rp({ url: t }) {
  if (t.startsWith("git@"))
    return {
      transport: "ssh",
      address: t
    };
  const e = t.match(/(\w+)(:\/\/|::)(.*)/);
  if (e !== null) {
    if (e[2] === "://")
      return {
        transport: e[1],
        address: e[0]
      };
    if (e[2] === "::")
      return {
        transport: e[1],
        address: e[3]
      };
  }
}
let he = null;
class kr {
  /**
   * Reads the `shallow` file in the Git repository and returns a set of object IDs (OIDs).
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
   * @returns {Promise<Set<string>>} - A set of shallow object IDs.
   */
  static async read({ fs: e, gitdir: r }) {
    he === null && (he = new vr());
    const n = R(r, "shallow"), a = /* @__PURE__ */ new Set();
    return await he.acquire(n, async function() {
      const i = await e.read(n, { encoding: "utf8" });
      if (i === null || i.trim() === "") return a;
      i.trim().split(`
`).map((o) => a.add(o));
    }), a;
  }
  /**
   * Writes a set of object IDs (OIDs) to the `shallow` file in the Git repository.
   * If the set is empty, the `shallow` file is removed.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
   * @param {Set<string>} args.oids - A set of shallow object IDs to write.
   * @returns {Promise<void>}
   */
  static async write({ fs: e, gitdir: r, oids: n }) {
    he === null && (he = new vr());
    const a = R(r, "shallow");
    if (n.size > 0) {
      const i = [...n].join(`
`) + `
`;
      await he.acquire(a, async function() {
        await e.write(a, i, {
          encoding: "utf8"
        });
      });
    } else
      await he.acquire(a, async function() {
        await e.rm(a);
      });
  }
}
async function Op({ fs: t, gitdir: e, oid: r }) {
  const n = `objects/${r.slice(0, 2)}/${r.slice(2)}`;
  return t.exists(`${e}/${n}`);
}
async function Tp({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  getExternalRefDelta: a
}) {
  let i = await t.readdir(R(r, "objects/pack"));
  i = i.filter((o) => o.endsWith(".idx"));
  for (const o of i) {
    const s = `${r}/objects/pack/${o}`, l = await xi({
      fs: t,
      cache: e,
      filename: s,
      getExternalRefDelta: a
    });
    if (l.error) throw new F(l.error);
    if (l.offsets.has(n))
      return !0;
  }
  return !1;
}
async function ys({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  format: a = "content"
}) {
  const i = (s) => G({ fs: t, cache: e, gitdir: r, oid: s });
  let o = await Op({ fs: t, gitdir: r, oid: n });
  return o || (o = await Tp({
    fs: t,
    cache: e,
    gitdir: r,
    oid: n,
    getExternalRefDelta: i
  })), o;
}
function Ip(t) {
  const a = "5041434b" + "00000002" + "00000000";
  return t.slice(0, 12).toString("hex") === a;
}
function af(t, e) {
  const r = t.map((n) => n.split("=", 1)[0]);
  return e.filter((n) => {
    const a = n.split("=", 1)[0];
    return r.includes(a);
  });
}
const qn = {
  name: "isomorphic-git",
  version: "1.37.5",
  agent: "git/isomorphic-git@1.37.5"
};
class vn {
  constructor() {
    this._queue = [];
  }
  write(e) {
    if (this._ended)
      throw Error("You cannot write to a FIFO that has already been ended!");
    if (this._waiting) {
      const r = this._waiting;
      this._waiting = null, r({ value: e });
    } else
      this._queue.push(e);
  }
  end() {
    if (this._ended = !0, this._waiting) {
      const e = this._waiting;
      this._waiting = null, e({ done: !0 });
    }
  }
  destroy(e) {
    this.error = e, this.end();
  }
  async next() {
    if (this._queue.length > 0)
      return { value: this._queue.shift() };
    if (this._ended)
      return { done: !0 };
    if (this._waiting)
      throw Error(
        "You cannot call read until the previous call to read has returned!"
      );
    return new Promise((e) => {
      this._waiting = e;
    });
  }
}
function Pp(t) {
  const e = t.indexOf("\r"), r = t.indexOf(`
`);
  return e === -1 && r === -1 ? -1 : e === -1 ? r + 1 : r === -1 ? e + 1 : r === e + 1 ? r + 1 : Math.min(e, r) + 1;
}
function of(t) {
  const e = new vn();
  let r = "";
  return (async () => (await rn(t, (n) => {
    for (n = n.toString("utf8"), r += n; ; ) {
      const a = Pp(r);
      if (a === -1) break;
      e.write(r.slice(0, a)), r = r.slice(a);
    }
  }), r.length > 0 && e.write(r), e.end()))(), e;
}
class sf {
  static demux(e) {
    const r = X.streamReader(e), n = new vn(), a = new vn(), i = new vn(), o = async function() {
      const s = await r();
      if (s === null) return o();
      if (s === !0) {
        n.end(), i.end(), e.error ? a.destroy(e.error) : a.end();
        return;
      }
      switch (s[0]) {
        case 1: {
          a.write(s.slice(1));
          break;
        }
        case 2: {
          i.write(s.slice(1));
          break;
        }
        case 3: {
          const l = s.slice(1);
          i.write(l), n.end(), i.end(), a.destroy(new Error(l.toString("utf8")));
          return;
        }
        default:
          n.write(s);
      }
      o();
    };
    return o(), {
      packetlines: n,
      packfile: a,
      progress: i
    };
  }
  // static mux ({
  //   protocol, // 'side-band' or 'side-band-64k'
  //   packetlines,
  //   packfile,
  //   progress,
  //   error
  // }) {
  //   const MAX_PACKET_LENGTH = protocol === 'side-band-64k' ? 999 : 65519
  //   let output = new PassThrough()
  //   packetlines.on('data', data => {
  //     if (data === null) {
  //       output.write(GitPktLine.flush())
  //     } else {
  //       output.write(GitPktLine.encode(data))
  //     }
  //   })
  //   let packfileWasEmpty = true
  //   let packfileEnded = false
  //   let progressEnded = false
  //   let errorEnded = false
  //   let goodbye = Buffer.concat([
  //     GitPktLine.encode(Buffer.from('010A', 'hex')),
  //     GitPktLine.flush()
  //   ])
  //   packfile
  //     .on('data', data => {
  //       packfileWasEmpty = false
  //       const buffers = splitBuffer(data, MAX_PACKET_LENGTH)
  //       for (const buffer of buffers) {
  //         output.write(
  //           GitPktLine.encode(Buffer.concat([Buffer.from('01', 'hex'), buffer]))
  //         )
  //       }
  //     })
  //     .on('end', () => {
  //       packfileEnded = true
  //       if (!packfileWasEmpty) output.write(goodbye)
  //       if (progressEnded && errorEnded) output.end()
  //     })
  //   progress
  //     .on('data', data => {
  //       const buffers = splitBuffer(data, MAX_PACKET_LENGTH)
  //       for (const buffer of buffers) {
  //         output.write(
  //           GitPktLine.encode(Buffer.concat([Buffer.from('02', 'hex'), buffer]))
  //         )
  //       }
  //     })
  //     .on('end', () => {
  //       progressEnded = true
  //       if (packfileEnded && errorEnded) output.end()
  //     })
  //   error
  //     .on('data', data => {
  //       const buffers = splitBuffer(data, MAX_PACKET_LENGTH)
  //       for (const buffer of buffers) {
  //         output.write(
  //           GitPktLine.encode(Buffer.concat([Buffer.from('03', 'hex'), buffer]))
  //         )
  //       }
  //     })
  //     .on('end', () => {
  //       errorEnded = true
  //       if (progressEnded && packfileEnded) output.end()
  //     })
  //   return output
  // }
}
async function Bp(t) {
  const { packetlines: e, packfile: r, progress: n } = sf.demux(t), a = [], i = [], o = [];
  let s = !1, l = !1;
  return new Promise((f, c) => {
    rn(e, (u) => {
      const d = u.toString("utf8").trim();
      if (d.startsWith("shallow")) {
        const h = d.slice(-41).trim();
        h.length !== 40 && c(new ie(h)), a.push(h);
      } else if (d.startsWith("unshallow")) {
        const h = d.slice(-41).trim();
        h.length !== 40 && c(new ie(h)), i.push(h);
      } else if (d.startsWith("ACK")) {
        const [, h, w] = d.split(" ");
        o.push({ oid: h, status: w }), w || (l = !0);
      } else d.startsWith("NAK") ? (s = !0, l = !0) : (l = !0, s = !0);
      l && (t.error ? c(t.error) : f({ shallows: a, unshallows: i, acks: o, nak: s, packfile: r, progress: n }));
    }).finally(() => {
      l || (t.error ? c(t.error) : f({ shallows: a, unshallows: i, acks: o, nak: s, packfile: r, progress: n }));
    });
  });
}
function Cp({
  capabilities: t = [],
  wants: e = [],
  haves: r = [],
  shallows: n = [],
  depth: a = null,
  since: i = null,
  exclude: o = []
}) {
  const s = [];
  e = [...new Set(e)];
  let l = ` ${t.join(" ")}`;
  for (const f of e)
    s.push(X.encode(`want ${f}${l}
`)), l = "";
  for (const f of n)
    s.push(X.encode(`shallow ${f}
`));
  a !== null && s.push(X.encode(`deepen ${a}
`)), i !== null && s.push(
    X.encode(`deepen-since ${Math.floor(i.valueOf() / 1e3)}
`)
  );
  for (const f of o)
    s.push(X.encode(`deepen-not ${f}
`));
  s.push(X.flush());
  for (const f of r)
    s.push(X.encode(`have ${f}
`));
  return s.push(X.encode(`done
`)), s;
}
async function ki({
  fs: t,
  cache: e,
  http: r,
  onProgress: n,
  onMessage: a,
  onAuth: i,
  onAuthSuccess: o,
  onAuthFailure: s,
  gitdir: l,
  ref: f,
  remoteRef: c,
  remote: u,
  url: d,
  corsProxy: h,
  depth: w = null,
  since: p = null,
  exclude: m = [],
  relative: y = !1,
  tags: _ = !1,
  singleBranch: v = !1,
  headers: S = {},
  prune: k = !1,
  pruneTags: O = !1
}) {
  const x = f || await le({ fs: t, gitdir: l, test: !0 }), g = await J.get({ fs: t, gitdir: l }), E = u || x && await g.get(`branch.${x}.remote`) || "origin", A = d || await g.get(`remote.${E}.url`);
  if (typeof A > "u")
    throw new ut("remote OR url");
  const $ = c || x && await g.get(`branch.${x}.merge`) || f || "HEAD";
  h === void 0 && (h = await g.get("http.corsProxy"));
  const I = Wn.getRemoteHelperFor({ url: A }), B = await I.discover({
    http: r,
    onAuth: i,
    onAuthSuccess: o,
    onAuthFailure: s,
    corsProxy: h,
    service: "git-upload-pack",
    url: A,
    headers: S,
    protocolVersion: 1
  }), N = B.auth, K = B.refs;
  if (K.size === 0)
    return {
      defaultBranch: null,
      fetchHead: null,
      fetchHeadDescription: null
    };
  if (w !== null && !B.capabilities.has("shallow"))
    throw new ne("shallow", "depth");
  if (p !== null && !B.capabilities.has("deepen-since"))
    throw new ne("deepen-since", "since");
  if (m.length > 0 && !B.capabilities.has("deepen-not"))
    throw new ne("deepen-not", "exclude");
  if (y === !0 && !B.capabilities.has("deepen-relative"))
    throw new ne("deepen-relative", "relative");
  const { oid: It, fullref: yt } = T.resolveAgainstMap({
    ref: $,
    map: K
  });
  for (const L of K.keys())
    L === yt || L === "HEAD" || L.startsWith("refs/heads/") || _ && L.startsWith("refs/tags/") || K.delete(L);
  const St = af(
    [...B.capabilities],
    [
      "multi_ack_detailed",
      "no-done",
      "side-band-64k",
      // Note: I removed 'thin-pack' option since our code doesn't "fatten" packfiles,
      // which is necessary for compatibility with git. It was the cause of mysterious
      // 'fatal: pack has [x] unresolved deltas' errors that plagued us for some time.
      // isomorphic-git is perfectly happy with thin packfiles in .git/objects/pack but
      // canonical git it turns out is NOT.
      "ofs-delta",
      `agent=${qn.agent}`
    ]
  );
  y && St.push("deepen-relative");
  const Zn = v ? [It] : K.values(), Vn = v ? [x] : await T.listRefs({
    fs: t,
    gitdir: l,
    filepath: "refs"
  });
  let wt = [];
  for (let L of Vn)
    try {
      L = await T.expand({ fs: t, gitdir: l, ref: L });
      const rt = await T.resolve({ fs: t, gitdir: l, ref: L });
      await ys({ fs: t, cache: e, gitdir: l, oid: rt }) && wt.push(rt);
    } catch {
    }
  wt = [...new Set(wt)];
  const Z = await kr.read({ fs: t, gitdir: l }), Pt = B.capabilities.has("shallow") ? [...Z] : [], it = Cp({
    capabilities: St,
    wants: Zn,
    haves: wt,
    shallows: Pt,
    depth: w,
    since: p,
    exclude: m
  }), nr = Buffer.from(await Cn(it)), ue = await I.connect({
    http: r,
    onProgress: n,
    corsProxy: h,
    service: "git-upload-pack",
    url: A,
    auth: N,
    body: [nr],
    headers: S
  }), Q = await Bp(ue.body);
  ue.headers && (Q.headers = ue.headers);
  for (const L of Q.shallows)
    if (!Z.has(L))
      try {
        const { object: rt } = await G({ fs: t, cache: e, gitdir: l, oid: L }), _t = new q(rt), Bt = await Promise.all(
          _t.headers().parent.map((ir) => ys({ fs: t, cache: e, gitdir: l, oid: ir }))
        );
        Bt.length === 0 || Bt.every((ir) => ir) || Z.add(L);
      } catch {
        Z.add(L);
      }
  for (const L of Q.unshallows)
    Z.delete(L);
  if (await kr.write({ fs: t, gitdir: l, oids: Z }), v) {
    const L = /* @__PURE__ */ new Map([[yt, It]]), rt = /* @__PURE__ */ new Map();
    let _t = 10, Bt = yt;
    for (; _t--; ) {
      const Kn = B.symrefs.get(Bt);
      if (Kn === void 0) break;
      rt.set(Bt, Kn), Bt = Kn;
    }
    const Xn = K.get(Bt);
    Xn && L.set(Bt, Xn);
    const { pruned: ir } = await T.updateRemoteRefs({
      fs: t,
      gitdir: l,
      remote: E,
      refs: L,
      symrefs: rt,
      tags: _,
      prune: k
    });
    k && (Q.pruned = ir);
  } else {
    const { pruned: L } = await T.updateRemoteRefs({
      fs: t,
      gitdir: l,
      remote: E,
      refs: K,
      symrefs: B.symrefs,
      tags: _,
      prune: k,
      pruneTags: O
    });
    k && (Q.pruned = L);
  }
  if (Q.HEAD = B.symrefs.get("HEAD"), Q.HEAD === void 0) {
    const { oid: L } = T.resolveAgainstMap({
      ref: "HEAD",
      map: K
    });
    for (const [rt, _t] of K.entries())
      if (rt !== "HEAD" && _t === L) {
        Q.HEAD = rt;
        break;
      }
  }
  const Pl = yt.startsWith("refs/tags") ? "tag" : "branch";
  if (Q.FETCH_HEAD = {
    oid: It,
    description: `${Pl} '${ge(yt)}' of ${A}`
  }, n || a) {
    const L = of(Q.progress);
    rn(L, async (rt) => {
      if (a && await a(rt), n) {
        const _t = rt.match(/([^:]*).*\((\d+?)\/(\d+?)\)/);
        _t && await n({
          phase: _t[1].trim(),
          loaded: parseInt(_t[2], 10),
          total: parseInt(_t[3], 10)
        });
      }
    });
  }
  const nn = Buffer.from(await Cn(Q.packfile));
  if (ue.body.error) throw ue.body.error;
  const Oi = nn.slice(-20).toString("hex"), ar = {
    defaultBranch: Q.HEAD,
    fetchHead: Q.FETCH_HEAD.oid,
    fetchHeadDescription: Q.FETCH_HEAD.description
  };
  if (Q.headers && (ar.headers = Q.headers), k && (ar.pruned = Q.pruned), Oi !== "" && !Ip(nn)) {
    ar.packfile = `objects/pack/pack-${Oi}.pack`;
    const L = R(l, ar.packfile);
    await t.write(L, nn);
    const rt = (Bt) => G({ fs: t, cache: e, gitdir: l, oid: Bt }), _t = await Le.fromPack({
      pack: nn,
      getExternalRefDelta: rt,
      onProgress: n
    });
    await t.write(L.replace(/\.pack$/, ".idx"), await _t.toBuffer());
  }
  return ar;
}
async function cf({
  fs: t,
  bare: e = !1,
  dir: r,
  gitdir: n = e ? r : R(r, ".git"),
  defaultBranch: a = "master"
}) {
  if (await t.exists(n + "/config")) return;
  let i = [
    "hooks",
    "info",
    "objects/info",
    "objects/pack",
    "refs/heads",
    "refs/tags"
  ];
  i = i.map((o) => n + "/" + o);
  for (const o of i)
    await t.mkdir(o);
  await t.write(
    n + "/config",
    `[core]
	repositoryformatversion = 0
	filemode = false
	bare = ${e}
` + (e ? "" : `	logallrefupdates = true
`) + `	symlinks = false
	ignorecase = true
`
  ), await t.write(n + "/HEAD", `ref: refs/heads/${a}
`);
}
async function Dp({
  fs: t,
  cache: e,
  http: r,
  onProgress: n,
  onMessage: a,
  onAuth: i,
  onAuthSuccess: o,
  onAuthFailure: s,
  onPostCheckout: l,
  dir: f,
  gitdir: c,
  url: u,
  corsProxy: d,
  ref: h,
  remote: w,
  depth: p,
  since: m,
  exclude: y,
  relative: _,
  singleBranch: v,
  noCheckout: S,
  noTags: k,
  headers: O,
  nonBlocking: x,
  batchSize: g = 100
}) {
  try {
    if (await cf({ fs: t, gitdir: c }), await Xc({ fs: t, gitdir: c, remote: w, url: u, force: !1 }), d) {
      const $ = await J.get({ fs: t, gitdir: c });
      await $.set("http.corsProxy", d), await J.save({ fs: t, gitdir: c, config: $ });
    }
    const { defaultBranch: E, fetchHead: A } = await ki({
      fs: t,
      cache: e,
      http: r,
      onProgress: n,
      onMessage: a,
      onAuth: i,
      onAuthSuccess: o,
      onAuthFailure: s,
      gitdir: c,
      ref: h,
      remote: w,
      corsProxy: d,
      depth: p,
      since: m,
      exclude: y,
      relative: _,
      singleBranch: v,
      headers: O,
      tags: !k
    });
    if (A === null) return;
    h = h || E, h = h.replace("refs/heads/", ""), await Ei({
      fs: t,
      cache: e,
      onProgress: n,
      onPostCheckout: l,
      dir: f,
      gitdir: c,
      ref: h,
      remote: w,
      noCheckout: S,
      nonBlocking: x,
      batchSize: g
    });
  } catch (E) {
    throw await t.rmdir(c, { recursive: !0, maxRetries: 10 }).catch(() => {
    }), E;
  }
}
async function ff({
  fs: t,
  http: e,
  onProgress: r,
  onMessage: n,
  onAuth: a,
  onAuthSuccess: i,
  onAuthFailure: o,
  onPostCheckout: s,
  dir: l,
  gitdir: f = R(l, ".git"),
  url: c,
  corsProxy: u = void 0,
  ref: d = void 0,
  remote: h = "origin",
  depth: w = void 0,
  since: p = void 0,
  exclude: m = [],
  relative: y = !1,
  singleBranch: _ = !1,
  noCheckout: v = !1,
  noTags: S = !1,
  headers: k = {},
  cache: O = {},
  nonBlocking: x = !1,
  batchSize: g = 100
}) {
  try {
    b("fs", t), b("http", e), b("gitdir", f), v || b("dir", l), b("url", c);
    const E = new C(t), A = await D({ fsp: E, dotgit: f });
    return await Dp({
      fs: E,
      cache: O,
      http: e,
      onProgress: r,
      onMessage: n,
      onAuth: a,
      onAuthSuccess: i,
      onAuthFailure: o,
      onPostCheckout: s,
      dir: l,
      gitdir: A,
      url: c,
      corsProxy: u,
      ref: d,
      remote: h,
      depth: w,
      since: p,
      exclude: m,
      relative: y,
      singleBranch: _,
      noCheckout: v,
      noTags: S,
      headers: k,
      nonBlocking: x,
      batchSize: g
    });
  } catch (E) {
    throw E.caller = "git.clone", E;
  }
}
async function lf({
  fs: t,
  onSign: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  message: a,
  author: i,
  committer: o,
  signingKey: s,
  amend: l = !1,
  dryRun: f = !1,
  noUpdateBranch: c = !1,
  ref: u,
  parent: d,
  tree: h,
  cache: w = {}
}) {
  try {
    b("fs", t), l || b("message", a), s && b("onSign", e);
    const p = new C(t), m = await D({ fsp: p, dotgit: n });
    return await Qr({
      fs: p,
      cache: w,
      onSign: e,
      gitdir: m,
      message: a,
      author: i,
      committer: o,
      signingKey: s,
      amend: l,
      dryRun: f,
      noUpdateBranch: c,
      ref: u,
      parent: d,
      tree: h
    });
  } catch (p) {
    throw p.caller = "git.commit", p;
  }
}
async function uf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  fullname: n = !1,
  test: a = !1
}) {
  try {
    b("fs", t), b("gitdir", r);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await le({
      fs: i,
      gitdir: o,
      fullname: n,
      test: a
    });
  } catch (i) {
    throw i.caller = "git.currentBranch", i;
  }
}
async function Np({ fs: t, gitdir: e, ref: r }) {
  if (r = r.startsWith("refs/heads/") ? r : `refs/heads/${r}`, !await T.exists({ fs: t, gitdir: e, ref: r }))
    throw new H(r);
  const a = await T.expand({ fs: t, gitdir: e, ref: r }), i = await le({ fs: t, gitdir: e, fullname: !0 });
  if (a === i) {
    const l = await T.resolve({ fs: t, gitdir: e, ref: a });
    await T.writeRef({ fs: t, gitdir: e, ref: "HEAD", value: l });
  }
  await T.deleteRef({ fs: t, gitdir: e, ref: a });
  const o = ge(r), s = await J.get({ fs: t, gitdir: e });
  await s.deleteSection("branch", o), await J.save({ fs: t, gitdir: e, config: s });
}
async function df({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n
}) {
  try {
    b("fs", t), b("ref", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await Np({
      fs: a,
      gitdir: i,
      ref: n
    });
  } catch (a) {
    throw a.caller = "git.deleteBranch", a;
  }
}
async function hf({ fs: t, dir: e, gitdir: r = R(e, ".git"), ref: n }) {
  try {
    b("fs", t), b("ref", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    await T.deleteRef({ fs: a, gitdir: i, ref: n });
  } catch (a) {
    throw a.caller = "git.deleteRef", a;
  }
}
async function Fp({ fs: t, gitdir: e, remote: r }) {
  const n = await J.get({ fs: t, gitdir: e });
  await n.deleteSection("remote", r), await J.save({ fs: t, gitdir: e, config: n });
}
async function wf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  remote: n
}) {
  try {
    b("fs", t), b("remote", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await Fp({
      fs: a,
      gitdir: i,
      remote: n
    });
  } catch (a) {
    throw a.caller = "git.deleteRemote", a;
  }
}
async function jp({ fs: t, gitdir: e, ref: r }) {
  r = r.startsWith("refs/tags/") ? r : `refs/tags/${r}`, await T.deleteRef({ fs: t, gitdir: e, ref: r });
}
async function pf({ fs: t, dir: e, gitdir: r = R(e, ".git"), ref: n }) {
  try {
    b("fs", t), b("ref", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await jp({
      fs: a,
      gitdir: i,
      ref: n
    });
  } catch (a) {
    throw a.caller = "git.deleteTag", a;
  }
}
async function Up({ fs: t, gitdir: e, oid: r }) {
  const n = r.slice(0, 2);
  return (await t.readdir(`${e}/objects/${n}`)).map((i) => `${n}${i}`).filter((i) => i.startsWith(r));
}
async function Mp({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  getExternalRefDelta: a
}) {
  const i = [];
  let o = await t.readdir(R(r, "objects/pack"));
  o = o.filter((s) => s.endsWith(".idx"));
  for (const s of o) {
    const l = `${r}/objects/pack/${s}`, f = await xi({
      fs: t,
      cache: e,
      filename: l,
      getExternalRefDelta: a
    });
    if (f.error) throw new F(f.error);
    for (const c of f.offsets.keys())
      c.startsWith(n) && i.push(c);
  }
  return i;
}
async function zp({ fs: t, cache: e, gitdir: r, oid: n }) {
  const a = (s) => G({ fs: t, cache: e, gitdir: r, oid: s }), i = await Up({ fs: t, gitdir: r, oid: n }), o = await Mp({
    fs: t,
    cache: e,
    gitdir: r,
    oid: n,
    getExternalRefDelta: a
  });
  for (const s of o)
    i.indexOf(s) === -1 && i.push(s);
  if (i.length === 1)
    return i[0];
  throw i.length > 1 ? new jr("oids", n, i) : new H(`an object matching "${n}"`);
}
async function mf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oid: n,
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("oid", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await zp({
      fs: i,
      cache: a,
      gitdir: o,
      oid: n
    });
  } catch (i) {
    throw i.caller = "git.expandOid", i;
  }
}
async function gf({ fs: t, dir: e, gitdir: r = R(e, ".git"), ref: n }) {
  try {
    b("fs", t), b("gitdir", r), b("ref", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await T.expand({
      fs: a,
      gitdir: i,
      ref: n
    });
  } catch (a) {
    throw a.caller = "git.expandRef", a;
  }
}
async function Ai({ fs: t, cache: e, gitdir: r, oids: n }) {
  const a = {}, i = n.length;
  let o = n.map((s, l) => ({ index: l, oid: s }));
  for (; o.length; ) {
    const s = /* @__PURE__ */ new Set();
    for (const { oid: f, index: c } of o)
      a[f] || (a[f] = /* @__PURE__ */ new Set()), a[f].add(c), a[f].size === i && s.add(f);
    if (s.size > 0)
      return [...s];
    const l = /* @__PURE__ */ new Map();
    for (const { oid: f, index: c } of o)
      try {
        const { object: u } = await G({ fs: t, cache: e, gitdir: r, oid: f }), d = q.from(u), { parent: h } = d.parseHeaders();
        for (const w of h)
          (!a[w] || !a[w].has(c)) && l.set(w + ":" + c, { oid: w, index: c });
      } catch {
      }
    o = Array.from(l.values());
  }
  return [];
}
async function yf({
  fs: t,
  cache: e,
  dir: r,
  gitdir: n,
  ours: a,
  theirs: i,
  fastForward: o = !0,
  fastForwardOnly: s = !1,
  dryRun: l = !1,
  noUpdateBranch: f = !1,
  abortOnConflict: c = !0,
  message: u,
  author: d,
  committer: h,
  signingKey: w,
  onSign: p,
  mergeDriver: m,
  allowUnrelatedHistories: y = !1
}) {
  a === void 0 && (a = await le({ fs: t, gitdir: n, fullname: !0 })), a = await T.expand({
    fs: t,
    gitdir: n,
    ref: a
  }), i = await T.expand({
    fs: t,
    gitdir: n,
    ref: i
  });
  const _ = await T.resolve({
    fs: t,
    gitdir: n,
    ref: a
  }), v = await T.resolve({
    fs: t,
    gitdir: n,
    ref: i
  }), S = await Ai({
    fs: t,
    cache: e,
    gitdir: n,
    oids: [_, v]
  });
  if (S.length !== 1)
    if (S.length === 0 && y)
      S.push("4b825dc642cb6eb9a060e54bf8d69288fbee4904");
    else
      throw new Je();
  const k = S[0];
  if (k === v)
    return {
      oid: _,
      alreadyMerged: !0
    };
  if (o && k === _)
    return !l && !f && await T.writeRef({ fs: t, gitdir: n, ref: a, value: v }), {
      oid: v,
      fastForward: !0
    };
  {
    if (s)
      throw new Gr();
    const O = await Y.acquire(
      { fs: t, gitdir: n, cache: e, allowUnmerged: !1 },
      async (g) => tf({
        fs: t,
        cache: e,
        dir: r,
        gitdir: n,
        index: g,
        ourOid: _,
        theirOid: v,
        baseOid: k,
        ourName: ge(a),
        baseName: "base",
        theirName: ge(i),
        dryRun: l,
        abortOnConflict: c,
        mergeDriver: m
      })
    );
    if (O instanceof Oe) throw O;
    return u || (u = `Merge branch '${ge(i)}' into ${ge(
      a
    )}`), {
      oid: await Qr({
        fs: t,
        cache: e,
        gitdir: n,
        message: u,
        ref: a,
        tree: O,
        parent: [_, v],
        author: d,
        committer: h,
        signingKey: w,
        onSign: p,
        dryRun: l,
        noUpdateBranch: f
      }),
      tree: O,
      mergeCommit: !0
    };
  }
}
async function _f({
  fs: t,
  cache: e,
  http: r,
  onProgress: n,
  onMessage: a,
  onAuth: i,
  onAuthSuccess: o,
  onAuthFailure: s,
  dir: l,
  gitdir: f,
  ref: c,
  url: u,
  remote: d,
  remoteRef: h,
  prune: w,
  pruneTags: p,
  fastForward: m,
  fastForwardOnly: y,
  corsProxy: _,
  singleBranch: v,
  headers: S,
  author: k,
  committer: O,
  signingKey: x
}) {
  try {
    if (!c) {
      const A = await le({ fs: t, gitdir: f });
      if (!A)
        throw new ut("ref");
      c = A;
    }
    const { fetchHead: g, fetchHeadDescription: E } = await ki({
      fs: t,
      cache: e,
      http: r,
      onProgress: n,
      onMessage: a,
      onAuth: i,
      onAuthSuccess: o,
      onAuthFailure: s,
      gitdir: f,
      corsProxy: _,
      ref: c,
      url: u,
      remote: d,
      remoteRef: h,
      singleBranch: v,
      headers: S,
      prune: w,
      pruneTags: p
    });
    await yf({
      fs: t,
      cache: e,
      gitdir: f,
      ours: c,
      theirs: g,
      fastForward: m,
      fastForwardOnly: y,
      message: `Merge ${E}`,
      author: k,
      committer: O,
      signingKey: x,
      dryRun: !1,
      noUpdateBranch: !1
    }), await Ei({
      fs: t,
      cache: e,
      onProgress: n,
      dir: l,
      gitdir: f,
      ref: c,
      remote: d,
      noCheckout: !1
    });
  } catch (g) {
    throw g.caller = "git.pull", g;
  }
}
async function bf({
  fs: t,
  http: e,
  onProgress: r,
  onMessage: n,
  onAuth: a,
  onAuthSuccess: i,
  onAuthFailure: o,
  dir: s,
  gitdir: l = R(s, ".git"),
  ref: f,
  url: c,
  remote: u,
  remoteRef: d,
  corsProxy: h,
  singleBranch: w,
  headers: p = {},
  cache: m = {}
}) {
  try {
    b("fs", t), b("http", e), b("gitdir", l);
    const y = {
      name: "",
      email: "",
      timestamp: Date.now(),
      timezoneOffset: 0
    }, _ = new C(t), v = await D({ fsp: _, dotgit: l });
    return await _f({
      fs: _,
      cache: m,
      http: e,
      onProgress: r,
      onMessage: n,
      onAuth: a,
      onAuthSuccess: i,
      onAuthFailure: o,
      dir: s,
      gitdir: v,
      ref: f,
      url: c,
      remote: u,
      remoteRef: d,
      fastForwardOnly: !0,
      corsProxy: h,
      singleBranch: w,
      headers: p,
      author: y,
      committer: y
    });
  } catch (y) {
    throw y.caller = "git.fastForward", y;
  }
}
async function vf({
  fs: t,
  http: e,
  onProgress: r,
  onMessage: n,
  onAuth: a,
  onAuthSuccess: i,
  onAuthFailure: o,
  dir: s,
  gitdir: l = R(s, ".git"),
  ref: f,
  remote: c,
  remoteRef: u,
  url: d,
  corsProxy: h,
  depth: w = null,
  since: p = null,
  exclude: m = [],
  relative: y = !1,
  tags: _ = !1,
  singleBranch: v = !1,
  headers: S = {},
  prune: k = !1,
  pruneTags: O = !1,
  cache: x = {}
}) {
  try {
    b("fs", t), b("http", e), b("gitdir", l);
    const g = new C(t), E = await D({ fsp: g, dotgit: l });
    return await ki({
      fs: g,
      cache: x,
      http: e,
      onProgress: r,
      onMessage: n,
      onAuth: a,
      onAuthSuccess: i,
      onAuthFailure: o,
      gitdir: E,
      ref: f,
      remote: c,
      remoteRef: u,
      url: d,
      corsProxy: h,
      depth: w,
      since: p,
      exclude: m,
      relative: y,
      tags: _,
      singleBranch: v,
      headers: S,
      prune: k,
      pruneTags: O
    });
  } catch (g) {
    throw g.caller = "git.fetch", g;
  }
}
async function xf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oids: n,
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("oids", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await Ai({
      fs: i,
      cache: a,
      gitdir: o,
      oids: n
    });
  } catch (i) {
    throw i.caller = "git.findMergeBase", i;
  }
}
async function Ef({ fs: t, filepath: e }) {
  if (await t.exists(R(e, ".git")))
    return e;
  {
    const r = Se(e);
    if (r === e)
      throw new H(`git root for ${e}`);
    return Ef({ fs: t, filepath: r });
  }
}
async function Sf({ fs: t, filepath: e }) {
  try {
    return b("fs", t), b("filepath", e), await Ef({ fs: new C(t), filepath: e });
  } catch (r) {
    throw r.caller = "git.findRoot", r;
  }
}
async function kf({ fs: t, dir: e, gitdir: r = R(e, ".git"), path: n }) {
  try {
    b("fs", t), b("gitdir", r), b("path", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await Er({
      fs: a,
      gitdir: i,
      path: n
    });
  } catch (a) {
    throw a.caller = "git.getConfig", a;
  }
}
async function Lp({ fs: t, gitdir: e, path: r }) {
  return (await J.get({ fs: t, gitdir: e })).getall(r);
}
async function Af({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  path: n
}) {
  try {
    b("fs", t), b("gitdir", r), b("path", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await Lp({
      fs: a,
      gitdir: i,
      path: n
    });
  } catch (a) {
    throw a.caller = "git.getConfigAll", a;
  }
}
async function $f({
  http: t,
  onAuth: e,
  onAuthSuccess: r,
  onAuthFailure: n,
  corsProxy: a,
  url: i,
  headers: o = {},
  forPush: s = !1
}) {
  try {
    b("http", t), b("url", i);
    const f = await Wn.getRemoteHelperFor({ url: i }).discover({
      http: t,
      onAuth: e,
      onAuthSuccess: r,
      onAuthFailure: n,
      corsProxy: a,
      service: s ? "git-receive-pack" : "git-upload-pack",
      url: i,
      headers: o,
      protocolVersion: 1
    }), c = {
      capabilities: [...f.capabilities]
    };
    for (const [u, d] of f.refs) {
      const h = u.split("/"), w = h.pop();
      let p = c;
      for (const m of h)
        p[m] = p[m] || {}, p = p[m];
      p[w] = d;
    }
    for (const [u, d] of f.symrefs) {
      const h = u.split("/"), w = h.pop();
      let p = c;
      for (const m of h)
        p[m] = p[m] || {}, p = p[m];
      p[w] = d;
    }
    return c;
  } catch (l) {
    throw l.caller = "git.getRemoteInfo", l;
  }
}
function Rf(t, e, r, n) {
  const a = [];
  for (const [i, o] of t.refs) {
    if (e && !i.startsWith(e)) continue;
    if (i.endsWith("^{}")) {
      if (n) {
        const l = i.replace("^{}", ""), f = a[a.length - 1], c = f.ref === l ? f : a.find((u) => u.ref === l);
        if (c === void 0)
          throw new Error("I did not expect this to happen");
        c.peeled = o;
      }
      continue;
    }
    const s = { ref: i, oid: o };
    r && t.symrefs.has(i) && (s.target = t.symrefs.get(i)), a.push(s);
  }
  return a;
}
async function Of({
  http: t,
  onAuth: e,
  onAuthSuccess: r,
  onAuthFailure: n,
  corsProxy: a,
  url: i,
  headers: o = {},
  forPush: s = !1,
  protocolVersion: l = 2
}) {
  try {
    b("http", t), b("url", i);
    const c = await Wn.getRemoteHelperFor({ url: i }).discover({
      http: t,
      onAuth: e,
      onAuthSuccess: r,
      onAuthFailure: n,
      corsProxy: a,
      service: s ? "git-receive-pack" : "git-upload-pack",
      url: i,
      headers: o,
      protocolVersion: l
    });
    if (c.protocolVersion === 2)
      return {
        protocolVersion: c.protocolVersion,
        capabilities: c.capabilities2
      };
    const u = {};
    for (const d of c.capabilities) {
      const [h, w] = d.split("=");
      w ? u[h] = w : u[h] = !0;
    }
    return {
      protocolVersion: 1,
      capabilities: u,
      refs: Rf(c, void 0, !0, !0)
    };
  } catch (f) {
    throw f.caller = "git.getRemoteInfo2", f;
  }
}
async function Hp({
  type: t,
  object: e,
  format: r = "content",
  oid: n = void 0
}) {
  return r !== "deflated" && (r !== "wrapped" && (e = Ye.wrap({ type: t, object: e })), n = await Vt(e)), { oid: n, object: e };
}
async function Tf({ object: t }) {
  try {
    b("object", t), typeof t == "string" ? t = Buffer.from(t, "utf8") : t instanceof Uint8Array || (t = new Uint8Array(t));
    const e = "blob", { oid: r, object: n } = await Hp({
      type: e,
      format: "content",
      object: t
    });
    return { oid: r, type: e, object: n, format: "wrapped" };
  } catch (e) {
    throw e.caller = "git.hashBlob", e;
  }
}
async function Gp({
  fs: t,
  cache: e,
  onProgress: r,
  dir: n,
  gitdir: a,
  filepath: i
}) {
  try {
    i = R(n, i);
    const o = await t.read(i), s = (f) => G({ fs: t, cache: e, gitdir: a, oid: f }), l = await Le.fromPack({
      pack: o,
      getExternalRefDelta: s,
      onProgress: r
    });
    return await t.write(i.replace(/\.pack$/, ".idx"), await l.toBuffer()), {
      oids: [...l.hashes]
    };
  } catch (o) {
    throw o.caller = "git.indexPack", o;
  }
}
async function If({
  fs: t,
  onProgress: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  filepath: a,
  cache: i = {}
}) {
  try {
    b("fs", t), b("dir", r), b("gitdir", r), b("filepath", a);
    const o = new C(t), s = await D({ fsp: o, dotgit: n });
    return await Gp({
      fs: o,
      cache: i,
      onProgress: e,
      dir: r,
      gitdir: s,
      filepath: a
    });
  } catch (o) {
    throw o.caller = "git.indexPack", o;
  }
}
async function Pf({
  fs: t,
  bare: e = !1,
  dir: r,
  gitdir: n = e ? r : R(r, ".git"),
  defaultBranch: a = "master"
}) {
  try {
    b("fs", t), b("gitdir", n), e || b("dir", r);
    const i = new C(t), o = await D({ fsp: i, dotgit: n });
    return await cf({
      fs: i,
      bare: e,
      dir: r,
      gitdir: o,
      defaultBranch: a
    });
  } catch (i) {
    throw i.caller = "git.init", i;
  }
}
async function Bf({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  ancestor: a,
  depth: i
}) {
  const o = await kr.read({ fs: t, gitdir: r });
  if (!n)
    throw new ut("oid");
  if (!a)
    throw new ut("ancestor");
  if (n === a) return !1;
  const s = [n], l = /* @__PURE__ */ new Set();
  let f = 0;
  for (; s.length; ) {
    if (f++ === i)
      throw new qr(i);
    const c = s.shift(), { type: u, object: d } = await G({
      fs: t,
      cache: e,
      gitdir: r,
      oid: c
    });
    if (u !== "commit")
      throw new ft(c, u, "commit");
    const h = q.from(d).parse();
    for (const w of h.parent)
      if (w === a) return !0;
    if (!o.has(c))
      for (const w of h.parent)
        l.has(w) || (s.push(w), l.add(w));
  }
  return !1;
}
async function Cf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oid: n,
  ancestor: a,
  depth: i = -1,
  cache: o = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("oid", n), b("ancestor", a);
    const s = new C(t), l = await D({ fsp: s, dotgit: r });
    return await Bf({
      fs: s,
      cache: o,
      gitdir: l,
      oid: n,
      ancestor: a,
      depth: i
    });
  } catch (s) {
    throw s.caller = "git.isDescendent", s;
  }
}
async function Df({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  filepath: n
}) {
  try {
    b("fs", t), b("dir", e), b("gitdir", r), b("filepath", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return er.isIgnored({
      fs: a,
      dir: e,
      gitdir: i,
      filepath: n
    });
  } catch (a) {
    throw a.caller = "git.isIgnored", a;
  }
}
async function Nf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  remote: n
}) {
  try {
    b("fs", t), b("gitdir", r);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return T.listBranches({
      fs: a,
      gitdir: i,
      remote: n
    });
  } catch (a) {
    throw a.caller = "git.listBranches", a;
  }
}
async function Wp({ fs: t, gitdir: e, ref: r, cache: n }) {
  if (r) {
    const a = await T.resolve({ gitdir: e, fs: t, ref: r }), i = [];
    return await Ff({
      fs: t,
      cache: n,
      gitdir: e,
      oid: a,
      filenames: i,
      prefix: ""
    }), i;
  } else
    return Y.acquire(
      { fs: t, gitdir: e, cache: n },
      async function(a) {
        return a.entries.map((i) => i.path);
      }
    );
}
async function Ff({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  filenames: a,
  prefix: i
}) {
  const { tree: o } = await rr({ fs: t, cache: e, gitdir: r, oid: n });
  for (const s of o)
    s.type === "tree" ? await Ff({
      fs: t,
      cache: e,
      gitdir: r,
      oid: s.oid,
      filenames: a,
      prefix: R(i, s.path)
    }) : a.push(R(i, s.path));
}
async function jf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n,
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await Wp({
      fs: i,
      cache: a,
      gitdir: o,
      ref: n
    });
  } catch (i) {
    throw i.caller = "git.listFiles", i;
  }
}
async function qp({ fs: t, cache: e, gitdir: r, ref: n }) {
  let a;
  try {
    a = await T.resolve({ gitdir: r, fs: t, ref: n });
  } catch (s) {
    if (s instanceof H)
      return [];
  }
  return (await rr({
    fs: t,
    cache: e,
    gitdir: r,
    oid: a
  })).tree.map((s) => ({
    target: s.path,
    note: s.oid
  }));
}
async function Uf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n = "refs/notes/commits",
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("ref", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await qp({
      fs: i,
      cache: a,
      gitdir: o,
      ref: n
    });
  } catch (i) {
    throw i.caller = "git.listNotes", i;
  }
}
async function Mf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  filepath: n
}) {
  try {
    b("fs", t), b("gitdir", r);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return T.listRefs({ fs: a, gitdir: i, filepath: n });
  } catch (a) {
    throw a.caller = "git.listRefs", a;
  }
}
async function Zp({ fs: t, gitdir: e }) {
  const r = await J.get({ fs: t, gitdir: e }), n = await r.getSubsections("remote");
  return Promise.all(
    n.map(async (i) => {
      const o = await r.get(`remote.${i}.url`);
      return { remote: i, url: o };
    })
  );
}
async function zf({ fs: t, dir: e, gitdir: r = R(e, ".git") }) {
  try {
    b("fs", t), b("gitdir", r);
    const n = new C(t), a = await D({ fsp: n, dotgit: r });
    return await Zp({
      fs: n,
      gitdir: a
    });
  } catch (n) {
    throw n.caller = "git.listRemotes", n;
  }
}
async function Vp(t) {
  const e = X.streamReader(t), r = [];
  let n;
  for (; n = await e(), n !== !0; ) {
    if (n === null) continue;
    n = n.toString("utf8").replace(/\n$/, "");
    const [a, i, ...o] = n.split(" "), s = { ref: i, oid: a };
    for (const l of o) {
      const [f, c] = l.split(":");
      f === "symref-target" ? s.target = c : f === "peeled" && (s.peeled = c);
    }
    r.push(s);
  }
  return r;
}
async function Xp({ prefix: t, symrefs: e, peelTags: r }) {
  const n = [];
  return n.push(X.encode(`command=ls-refs
`)), n.push(X.encode(`agent=${qn.agent}
`)), (r || e || t) && n.push(X.delim()), r && n.push(X.encode("peel")), e && n.push(X.encode("symrefs")), t && n.push(X.encode(`ref-prefix ${t}`)), n.push(X.flush()), n;
}
async function Lf({
  http: t,
  onAuth: e,
  onAuthSuccess: r,
  onAuthFailure: n,
  corsProxy: a,
  url: i,
  headers: o = {},
  forPush: s = !1,
  protocolVersion: l = 2,
  prefix: f,
  symrefs: c,
  peelTags: u
}) {
  try {
    b("http", t), b("url", i);
    const d = await Dn.discover({
      http: t,
      onAuth: e,
      onAuthSuccess: r,
      onAuthFailure: n,
      corsProxy: a,
      service: s ? "git-receive-pack" : "git-upload-pack",
      url: i,
      headers: o,
      protocolVersion: l
    });
    if (d.protocolVersion === 1)
      return Rf(d, f, c, u);
    const h = await Xp({ prefix: f, symrefs: c, peelTags: u }), w = await Dn.connect({
      http: t,
      auth: d.auth,
      headers: o,
      corsProxy: a,
      service: s ? "git-receive-pack" : "git-upload-pack",
      url: i,
      body: h
    });
    return Vp(w.body);
  } catch (d) {
    throw d.caller = "git.listServerRefs", d;
  }
}
async function Hf({ fs: t, dir: e, gitdir: r = R(e, ".git") }) {
  try {
    b("fs", t), b("gitdir", r);
    const n = new C(t), a = await D({ fsp: n, dotgit: r });
    return T.listTags({ fs: n, gitdir: a });
  } catch (n) {
    throw n.caller = "git.listTags", n;
  }
}
function Kp(t, e) {
  return t.committer.timestamp - e.committer.timestamp;
}
const Yp = "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391";
async function _s({ fs: t, cache: e, gitdir: r, oid: n, fileId: a }) {
  if (a === Yp) return;
  const i = n;
  let o;
  const s = await We({ fs: t, cache: e, gitdir: r, oid: n }), l = s.tree;
  return a === s.oid ? o = s.path : (o = await Gf({
    fs: t,
    cache: e,
    gitdir: r,
    tree: l,
    fileId: a,
    oid: i
  }), Array.isArray(o) && (o.length === 0 ? o = void 0 : o.length === 1 && (o = o[0]))), o;
}
async function Gf({
  fs: t,
  cache: e,
  gitdir: r,
  tree: n,
  fileId: a,
  oid: i,
  filepaths: o = [],
  parentPath: s = ""
}) {
  const l = n.entries().map(function(f) {
    let c;
    return f.oid === a ? (c = R(s, f.path), o.push(c)) : f.type === "tree" && (c = G({
      fs: t,
      cache: e,
      gitdir: r,
      oid: f.oid
    }).then(function({ object: u }) {
      return Gf({
        fs: t,
        cache: e,
        gitdir: r,
        tree: dt.from(u),
        fileId: a,
        oid: i,
        filepaths: o,
        parentPath: R(s, f.path)
      });
    })), c;
  });
  return await Promise.all(l), o;
}
async function Jp({
  fs: t,
  cache: e,
  gitdir: r,
  filepath: n,
  ref: a,
  depth: i,
  since: o,
  force: s,
  follow: l
}) {
  const f = typeof o > "u" ? void 0 : Math.floor(o.valueOf() / 1e3), c = [], u = await kr.read({ fs: t, gitdir: r }), d = await T.resolve({ fs: t, gitdir: r, ref: a }), h = [await zt({ fs: t, cache: e, gitdir: r, oid: d })];
  let w, p, m;
  function y(_) {
    m && n && c.push(_);
  }
  for (; h.length > 0; ) {
    const _ = h.pop();
    if (f !== void 0 && _.commit.committer.timestamp <= f)
      break;
    if (n) {
      let v;
      try {
        v = await tn({
          fs: t,
          cache: e,
          gitdir: r,
          oid: _.commit.tree,
          filepath: n
        }), p && w !== v && c.push(p), w = v, p = _, m = !0;
      } catch (S) {
        if (S instanceof H) {
          let k = l && w;
          if (k && (k = await _s({
            fs: t,
            cache: e,
            gitdir: r,
            oid: _.commit.tree,
            fileId: w
          }), k))
            if (Array.isArray(k)) {
              if (p) {
                const O = await _s({
                  fs: t,
                  cache: e,
                  gitdir: r,
                  oid: p.commit.tree,
                  fileId: w
                });
                if (Array.isArray(O))
                  if (k = k.filter((x) => O.indexOf(x) === -1), k.length === 1)
                    k = k[0], n = k, p && c.push(p);
                  else {
                    k = !1, p && c.push(p);
                    break;
                  }
              }
            } else
              n = k, p && c.push(p);
          if (!k) {
            if (m && w && (c.push(p), !s))
              break;
            if (!s && !l) throw S;
          }
          p = _, m = !1;
        } else throw S;
      }
    } else
      c.push(_);
    if (i !== void 0 && c.length === i) {
      y(_);
      break;
    }
    if (!u.has(_.oid))
      for (const v of _.commit.parent) {
        const S = await zt({ fs: t, cache: e, gitdir: r, oid: v });
        h.map((k) => k.oid).includes(S.oid) || h.push(S);
      }
    h.length === 0 && y(_), h.sort((v, S) => Kp(v.commit, S.commit));
  }
  return c;
}
async function Wf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  filepath: n,
  ref: a = "HEAD",
  depth: i,
  since: o,
  // Date
  force: s,
  follow: l,
  cache: f = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("ref", a);
    const c = new C(t), u = await D({ fsp: c, dotgit: r });
    return await Jp({
      fs: c,
      cache: f,
      gitdir: u,
      filepath: n,
      ref: a,
      depth: i,
      since: o,
      force: s,
      follow: l
    });
  } catch (c) {
    throw c.caller = "git.log", c;
  }
}
async function qf({
  fs: t,
  onSign: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  ours: a,
  theirs: i,
  fastForward: o = !0,
  fastForwardOnly: s = !1,
  dryRun: l = !1,
  noUpdateBranch: f = !1,
  abortOnConflict: c = !0,
  message: u,
  author: d,
  committer: h,
  signingKey: w,
  cache: p = {},
  mergeDriver: m,
  allowUnrelatedHistories: y = !1
}) {
  try {
    b("fs", t), w && b("onSign", e);
    const _ = new C(t), v = await D({ fsp: _, dotgit: n }), S = await ce({
      fs: _,
      gitdir: v,
      author: d
    });
    if (!S && (!s || !o))
      throw new at("author");
    const k = await ke({
      fs: _,
      gitdir: v,
      author: S,
      committer: h
    });
    if (!k && (!s || !o))
      throw new at("committer");
    return await yf({
      fs: _,
      cache: p,
      dir: r,
      gitdir: v,
      ours: a,
      theirs: i,
      fastForward: o,
      fastForwardOnly: s,
      dryRun: l,
      noUpdateBranch: f,
      abortOnConflict: c,
      message: u,
      author: S,
      committer: k,
      signingKey: w,
      onSign: e,
      mergeDriver: m,
      allowUnrelatedHistories: y
    });
  } catch (_) {
    throw _.caller = "git.merge", _;
  }
}
const Qp = {
  commit: 16,
  tree: 32,
  blob: 48,
  tag: 64,
  ofs_delta: 96,
  ref_delta: 112
};
async function Zf({
  fs: t,
  cache: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  oids: a
}) {
  const i = new Rc(), o = [];
  function s(c, u) {
    const d = Buffer.from(c, u);
    o.push(d), i.update(d);
  }
  async function l({ stype: c, object: u }) {
    const d = Qp[c];
    let h = u.length, w = h > 15 ? 128 : 0;
    const p = h & 15;
    h = h >>> 4;
    let m = (w | d | p).toString(16);
    for (s(m, "hex"); w; )
      w = h > 127 ? 128 : 0, m = w | h & 127, s(oi(2, m), "hex"), h = h >>> 7;
    s(Buffer.from(await zc(u)));
  }
  s("PACK"), s("00000002", "hex"), s(oi(8, a.length), "hex");
  for (const c of a) {
    const { type: u, object: d } = await G({ fs: t, cache: e, gitdir: n, oid: c });
    await l({ object: d, stype: u });
  }
  const f = i.digest();
  return o.push(f), o;
}
async function tm({ fs: t, cache: e, gitdir: r, oids: n, write: a }) {
  const i = await Zf({ fs: t, cache: e, gitdir: r, oids: n }), o = Buffer.from(await Cn(i)), l = `pack-${o.slice(-20).toString("hex")}.pack`;
  return a ? (await t.write(R(r, `objects/pack/${l}`), o), { filename: l }) : {
    filename: l,
    packfile: new Uint8Array(o)
  };
}
async function Vf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oids: n,
  write: a = !1,
  cache: i = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("oids", n);
    const o = new C(t), s = await D({ fsp: o, dotgit: r });
    return await tm({
      fs: o,
      cache: i,
      gitdir: s,
      oids: n,
      write: a
    });
  } catch (o) {
    throw o.caller = "git.packObjects", o;
  }
}
async function Xf({
  fs: t,
  http: e,
  onProgress: r,
  onMessage: n,
  onAuth: a,
  onAuthSuccess: i,
  onAuthFailure: o,
  dir: s,
  gitdir: l = R(s, ".git"),
  ref: f,
  url: c,
  remote: u,
  remoteRef: d,
  prune: h = !1,
  pruneTags: w = !1,
  fastForward: p = !0,
  fastForwardOnly: m = !1,
  corsProxy: y,
  singleBranch: _,
  headers: v = {},
  author: S,
  committer: k,
  signingKey: O,
  cache: x = {}
}) {
  try {
    b("fs", t), b("gitdir", l);
    const g = new C(t), E = await D({ fsp: g, dotgit: l }), A = await ce({
      fs: g,
      gitdir: E,
      author: S
    });
    if (!A) throw new at("author");
    const $ = await ke({
      fs: g,
      gitdir: E,
      author: A,
      committer: k
    });
    if (!$) throw new at("committer");
    return await _f({
      fs: g,
      cache: x,
      http: e,
      onProgress: r,
      onMessage: n,
      onAuth: a,
      onAuthSuccess: i,
      onAuthFailure: o,
      dir: s,
      gitdir: E,
      ref: f,
      url: c,
      remote: u,
      remoteRef: d,
      fastForward: p,
      fastForwardOnly: m,
      corsProxy: y,
      singleBranch: _,
      headers: v,
      author: A,
      committer: $,
      signingKey: O,
      prune: h,
      pruneTags: w
    });
  } catch (g) {
    throw g.caller = "git.pull", g;
  }
}
async function em({
  fs: t,
  cache: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  start: a,
  finish: i
}) {
  const o = await kr.read({ fs: t, gitdir: n }), s = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set();
  for (const u of a)
    s.add(await T.resolve({ fs: t, gitdir: n, ref: u }));
  for (const u of i)
    try {
      const d = await T.resolve({ fs: t, gitdir: n, ref: u });
      l.add(d);
    } catch {
    }
  const f = /* @__PURE__ */ new Set();
  async function c(u) {
    f.add(u);
    const { type: d, object: h } = await G({ fs: t, cache: e, gitdir: n, oid: u });
    if (d === "tag") {
      const p = ct.from(h).headers().object;
      return c(p);
    }
    if (d !== "commit")
      throw new ft(u, d, "commit");
    if (!o.has(u)) {
      const p = q.from(h).headers().parent;
      for (u of p)
        !l.has(u) && !f.has(u) && await c(u);
    }
  }
  for (const u of s)
    await c(u);
  return f;
}
async function Ga({
  fs: t,
  cache: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  oids: a
}) {
  const i = /* @__PURE__ */ new Set();
  async function o(s) {
    if (i.has(s)) return;
    i.add(s);
    const { type: l, object: f } = await G({ fs: t, cache: e, gitdir: n, oid: s });
    if (l === "tag") {
      const u = ct.from(f).headers().object;
      await o(u);
    } else if (l === "commit") {
      const u = q.from(f).headers().tree;
      await o(u);
    } else if (l === "tree") {
      const c = dt.from(f);
      for (const u of c)
        u.type === "blob" && i.add(u.oid), u.type === "tree" && await o(u.oid);
    }
  }
  for (const s of a)
    await o(s);
  return i;
}
async function rm(t) {
  const e = {};
  let r = "";
  const n = X.streamReader(t);
  let a = await n();
  for (; a !== !0; )
    a !== null && (r += a.toString("utf8") + `
`), a = await n();
  const i = r.toString("utf8").split(`
`);
  if (a = i.shift(), !a.startsWith("unpack "))
    throw new Te('unpack ok" or "unpack [error message]', a);
  e.ok = a === "unpack ok", e.ok || (e.error = a.slice(7)), e.refs = {};
  for (const o of i) {
    if (o.trim() === "") continue;
    const s = o.slice(0, 2), l = o.slice(3);
    let f = l.indexOf(" ");
    f === -1 && (f = l.length);
    const c = l.slice(0, f), u = l.slice(f + 1);
    e.refs[c] = {
      ok: s === "ok",
      error: u
    };
  }
  return e;
}
async function nm({
  capabilities: t = [],
  triplets: e = []
}) {
  const r = [];
  let n = `\0 ${t.join(" ")}`;
  for (const a of e)
    r.push(
      X.encode(
        `${a.oldoid} ${a.oid} ${a.fullRef}${n}
`
      )
    ), n = "";
  return r.push(X.flush()), r;
}
async function am({
  fs: t,
  cache: e,
  http: r,
  onProgress: n,
  onMessage: a,
  onAuth: i,
  onAuthSuccess: o,
  onAuthFailure: s,
  onPrePush: l,
  gitdir: f,
  ref: c,
  remoteRef: u,
  remote: d,
  url: h,
  force: w = !1,
  delete: p = !1,
  corsProxy: m,
  headers: y = {}
}) {
  const _ = c || await le({ fs: t, gitdir: f });
  if (typeof _ > "u")
    throw new ut("ref");
  const v = await J.get({ fs: t, gitdir: f });
  d = d || await v.get(`branch.${_}.pushRemote`) || await v.get("remote.pushDefault") || await v.get(`branch.${_}.remote`) || "origin";
  const S = h || await v.get(`remote.${d}.pushurl`) || await v.get(`remote.${d}.url`);
  if (typeof S > "u")
    throw new ut("remote OR url");
  const k = u || await v.get(`branch.${_}.merge`);
  if (typeof S > "u")
    throw new ut("remoteRef");
  m === void 0 && (m = await v.get("http.corsProxy"));
  const O = await T.expand({ fs: t, gitdir: f, ref: _ }), x = p ? "0000000000000000000000000000000000000000" : await T.resolve({ fs: t, gitdir: f, ref: O }), g = Wn.getRemoteHelperFor({ url: S }), E = await g.discover({
    http: r,
    onAuth: i,
    onAuthSuccess: o,
    onAuthFailure: s,
    corsProxy: m,
    service: "git-receive-pack",
    url: S,
    headers: y,
    protocolVersion: 1
  }), A = E.auth;
  let $;
  if (!k)
    $ = O;
  else
    try {
      $ = await T.expandAgainstMap({
        ref: k,
        map: E.refs
      });
    } catch (Z) {
      if (Z instanceof H)
        $ = k.startsWith("refs/") ? k : `refs/heads/${k}`;
      else
        throw Z;
    }
  const I = E.refs.get($) || "0000000000000000000000000000000000000000";
  if (l && !await l({
    remote: d,
    url: S,
    localRef: { ref: p ? "(delete)" : O, oid: x },
    remoteRef: { ref: $, oid: I }
  }))
    throw new Qe();
  const B = !E.capabilities.has("no-thin");
  let N = /* @__PURE__ */ new Set();
  if (!p) {
    const Z = [...E.refs.values()];
    let Pt = /* @__PURE__ */ new Set();
    if (I !== "0000000000000000000000000000000000000000") {
      const it = await Ai({
        fs: t,
        cache: e,
        gitdir: f,
        oids: [x, I]
      });
      for (const nr of it) Z.push(nr);
      B && (Pt = await Ga({ fs: t, cache: e, gitdir: f, oids: it }));
    }
    if (!Z.includes(x)) {
      const it = await em({
        fs: t,
        cache: e,
        gitdir: f,
        start: [x],
        finish: Z
      });
      N = await Ga({ fs: t, cache: e, gitdir: f, oids: it });
    }
    if (B) {
      try {
        const it = await T.resolve({
          fs: t,
          gitdir: f,
          ref: `refs/remotes/${d}/HEAD`,
          depth: 2
        }), { oid: nr } = await T.resolveAgainstMap({
          ref: it.replace(`refs/remotes/${d}/`, ""),
          fullref: it,
          map: E.refs
        }), ue = [nr];
        for (const Q of await Ga({ fs: t, cache: e, gitdir: f, oids: ue }))
          Pt.add(Q);
      } catch {
      }
      for (const it of Pt)
        N.delete(it);
    }
    if (x === I && (w = !0), !w) {
      if (O.startsWith("refs/tags") && I !== "0000000000000000000000000000000000000000")
        throw new Ge("tag-exists");
      if (x !== "0000000000000000000000000000000000000000" && I !== "0000000000000000000000000000000000000000" && !await Bf({
        fs: t,
        cache: e,
        gitdir: f,
        oid: x,
        ancestor: I,
        depth: -1
      }))
        throw new Ge("not-fast-forward");
    }
  }
  const K = af(
    [...E.capabilities],
    ["report-status", "side-band-64k", `agent=${qn.agent}`]
  ), It = await nm({
    capabilities: K,
    triplets: [{ oldoid: I, oid: x, fullRef: $ }]
  }), yt = p ? [] : await Zf({
    fs: t,
    cache: e,
    gitdir: f,
    oids: [...N]
  }), St = await g.connect({
    http: r,
    onProgress: n,
    corsProxy: m,
    service: "git-receive-pack",
    url: S,
    auth: A,
    headers: y,
    body: [...It, ...yt]
  }), { packfile: Zn, progress: Vn } = await sf.demux(St.body);
  if (a) {
    const Z = of(Vn);
    rn(Z, async (Pt) => {
      await a(Pt);
    });
  }
  const wt = await rm(Zn);
  if (St.headers && (wt.headers = St.headers), d && wt.ok && wt.refs[$].ok && !O.startsWith("refs/tags")) {
    const Z = `refs/remotes/${d}/${$.replace(
      "refs/heads",
      ""
    )}`;
    p ? await T.deleteRef({ fs: t, gitdir: f, ref: Z }) : await T.writeRef({ fs: t, gitdir: f, ref: Z, value: x });
  }
  if (wt.ok && Object.values(wt.refs).every((Z) => Z.ok))
    return wt;
  {
    const Z = Object.entries(wt.refs).filter(([Pt, it]) => !it.ok).map(([Pt, it]) => `
  - ${Pt}: ${it.error}`).join("");
    throw new Wr(Z, wt);
  }
}
async function Kf({
  fs: t,
  http: e,
  onProgress: r,
  onMessage: n,
  onAuth: a,
  onAuthSuccess: i,
  onAuthFailure: o,
  onPrePush: s,
  dir: l,
  gitdir: f = R(l, ".git"),
  ref: c,
  remoteRef: u,
  remote: d = "origin",
  url: h,
  force: w = !1,
  delete: p = !1,
  corsProxy: m,
  headers: y = {},
  cache: _ = {}
}) {
  try {
    b("fs", t), b("http", e), b("gitdir", f);
    const v = new C(t), S = await D({ fsp: v, dotgit: f });
    return await am({
      fs: v,
      cache: _,
      http: e,
      onProgress: r,
      onMessage: n,
      onAuth: a,
      onAuthSuccess: i,
      onAuthFailure: o,
      onPrePush: s,
      gitdir: S,
      ref: c,
      remoteRef: u,
      remote: d,
      url: h,
      force: w,
      delete: p,
      corsProxy: m,
      headers: y
    });
  } catch (v) {
    throw v.caller = "git.push", v;
  }
}
async function Yf({ fs: t, cache: e, gitdir: r, oid: n }) {
  const { type: a, object: i } = await G({ fs: t, cache: e, gitdir: r, oid: n });
  if (a === "tag")
    return n = ct.from(i).parse().object, Yf({ fs: t, cache: e, gitdir: r, oid: n });
  if (a !== "blob")
    throw new ft(n, a, "blob");
  return { oid: n, blob: new Uint8Array(i) };
}
async function Jf({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  filepath: a = void 0
}) {
  return a !== void 0 && (n = await tn({ fs: t, cache: e, gitdir: r, oid: n, filepath: a })), await Yf({
    fs: t,
    cache: e,
    gitdir: r,
    oid: n
  });
}
async function Qf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oid: n,
  filepath: a,
  cache: i = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("oid", n);
    const o = new C(t), s = await D({ fsp: o, dotgit: r });
    return await Jf({
      fs: o,
      cache: i,
      gitdir: s,
      oid: n,
      filepath: a
    });
  } catch (o) {
    throw o.caller = "git.readBlob", o;
  }
}
async function $i({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oid: n,
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("oid", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await zt({
      fs: i,
      cache: a,
      gitdir: o,
      oid: n
    });
  } catch (i) {
    throw i.caller = "git.readCommit", i;
  }
}
async function im({
  fs: t,
  cache: e,
  gitdir: r,
  ref: n = "refs/notes/commits",
  oid: a
}) {
  const i = await T.resolve({ gitdir: r, fs: t, ref: n }), { blob: o } = await Jf({
    fs: t,
    cache: e,
    gitdir: r,
    oid: i,
    filepath: a
  });
  return o;
}
async function tl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n = "refs/notes/commits",
  oid: a,
  cache: i = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("ref", n), b("oid", a);
    const o = new C(t), s = await D({ fsp: o, dotgit: r });
    return await im({
      fs: o,
      cache: i,
      gitdir: s,
      ref: n,
      oid: a
    });
  } catch (o) {
    throw o.caller = "git.readNote", o;
  }
}
async function el({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oid: n,
  format: a = "parsed",
  filepath: i = void 0,
  encoding: o = void 0,
  cache: s = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("oid", n);
    const l = new C(t), f = await D({ fsp: l, dotgit: r });
    i !== void 0 && (n = await tn({
      fs: l,
      cache: s,
      gitdir: f,
      oid: n,
      filepath: i
    }));
    const u = await G({
      fs: l,
      cache: s,
      gitdir: f,
      oid: n,
      format: a === "parsed" ? "content" : a
    });
    if (u.oid = n, a === "parsed")
      switch (u.format = "parsed", u.type) {
        case "commit":
          u.object = q.from(u.object).parse();
          break;
        case "tree":
          u.object = dt.from(u.object).entries();
          break;
        case "blob":
          o ? u.object = u.object.toString(o) : (u.object = new Uint8Array(u.object), u.format = "content");
          break;
        case "tag":
          u.object = ct.from(u.object).parse();
          break;
        default:
          throw new ft(
            u.oid,
            u.type,
            "blob|commit|tag|tree"
          );
      }
    else (u.format === "deflated" || u.format === "wrapped") && (u.type = u.format);
    return u;
  } catch (l) {
    throw l.caller = "git.readObject", l;
  }
}
async function om({ fs: t, cache: e, gitdir: r, oid: n }) {
  const { type: a, object: i } = await G({
    fs: t,
    cache: e,
    gitdir: r,
    oid: n,
    format: "content"
  });
  if (a !== "tag")
    throw new ft(n, a, "tag");
  const o = ct.from(i);
  return {
    oid: n,
    tag: o.parse(),
    payload: o.payload()
  };
}
async function rl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oid: n,
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("oid", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await om({
      fs: i,
      cache: a,
      gitdir: o,
      oid: n
    });
  } catch (i) {
    throw i.caller = "git.readTag", i;
  }
}
async function nl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oid: n,
  filepath: a = void 0,
  cache: i = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("oid", n);
    const o = new C(t), s = await D({ fsp: o, dotgit: r });
    return await rr({
      fs: o,
      cache: i,
      gitdir: s,
      oid: n,
      filepath: a
    });
  } catch (o) {
    throw o.caller = "git.readTree", o;
  }
}
async function al({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  filepath: n,
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("filepath", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    await Y.acquire(
      { fs: i, gitdir: o, cache: a },
      async function(s) {
        s.delete({ filepath: n });
      }
    );
  } catch (i) {
    throw i.caller = "git.remove", i;
  }
}
async function sm({
  fs: t,
  cache: e,
  onSign: r,
  gitdir: n,
  ref: a = "refs/notes/commits",
  oid: i,
  author: o,
  committer: s,
  signingKey: l
}) {
  let f;
  try {
    f = await T.resolve({ gitdir: n, fs: t, ref: a });
  } catch (w) {
    if (!(w instanceof H))
      throw w;
  }
  let u = (await rr({
    fs: t,
    cache: e,
    gitdir: n,
    oid: f || "4b825dc642cb6eb9a060e54bf8d69288fbee4904"
  })).tree;
  u = u.filter((w) => w.path !== i);
  const d = await en({
    fs: t,
    gitdir: n,
    tree: u
  });
  return await Qr({
    fs: t,
    cache: e,
    onSign: r,
    gitdir: n,
    ref: a,
    tree: d,
    parent: f && [f],
    message: `Note removed by 'isomorphic-git removeNote'
`,
    author: o,
    committer: s,
    signingKey: l
  });
}
async function il({
  fs: t,
  onSign: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  ref: a = "refs/notes/commits",
  oid: i,
  author: o,
  committer: s,
  signingKey: l,
  cache: f = {}
}) {
  try {
    b("fs", t), b("gitdir", n), b("oid", i);
    const c = new C(t), u = await D({ fsp: c, dotgit: n }), d = await ce({
      fs: c,
      gitdir: u,
      author: o
    });
    if (!d) throw new at("author");
    const h = await ke({
      fs: c,
      gitdir: u,
      author: d,
      committer: s
    });
    if (!h) throw new at("committer");
    return await sm({
      fs: c,
      cache: f,
      onSign: e,
      gitdir: u,
      ref: a,
      oid: i,
      author: d,
      committer: h,
      signingKey: l
    });
  } catch (c) {
    throw c.caller = "git.removeNote", c;
  }
}
async function cm({
  fs: t,
  gitdir: e,
  oldref: r,
  ref: n,
  checkout: a = !1
}) {
  if (!Sr(n))
    throw new Rt(n, xr.clean(n));
  if (!Sr(r))
    throw new Rt(r, xr.clean(r));
  const i = `refs/heads/${r}`, o = `refs/heads/${n}`;
  if (await T.exists({ fs: t, gitdir: e, ref: o }))
    throw new Tt("branch", n, !1);
  const l = await T.resolve({
    fs: t,
    gitdir: e,
    ref: i,
    depth: 1
  });
  await T.writeRef({ fs: t, gitdir: e, ref: o, value: l }), await T.deleteRef({ fs: t, gitdir: e, ref: i });
  const c = await le({
    fs: t,
    gitdir: e,
    fullname: !0
  }) === i;
  (a || c) && await T.writeSymbolicRef({
    fs: t,
    gitdir: e,
    ref: "HEAD",
    value: o
  });
}
async function ol({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n,
  oldref: a,
  checkout: i = !1
}) {
  try {
    b("fs", t), b("gitdir", r), b("ref", n), b("oldref", a);
    const o = new C(t), s = await D({ fsp: o, dotgit: r });
    return await cm({
      fs: o,
      gitdir: s,
      ref: n,
      oldref: a,
      checkout: i
    });
  } catch (o) {
    throw o.caller = "git.renameBranch", o;
  }
}
async function sl({ gitdir: t, type: e, object: r }) {
  return Vt(Ye.wrap({ type: e, object: r }));
}
async function cl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  filepath: n,
  ref: a,
  cache: i = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("filepath", n);
    const o = new C(t), s = await D({ fsp: o, dotgit: r });
    let l, f;
    try {
      l = await T.resolve({
        fs: o,
        gitdir: s,
        ref: a || "HEAD"
      });
    } catch (d) {
      if (a)
        throw d;
    }
    if (l)
      try {
        l = await tn({
          fs: o,
          cache: i,
          gitdir: s,
          oid: l,
          filepath: n
        });
      } catch {
        l = null;
      }
    let c = {
      ctime: /* @__PURE__ */ new Date(0),
      mtime: /* @__PURE__ */ new Date(0),
      dev: 0,
      ino: 0,
      mode: 0,
      uid: 0,
      gid: 0,
      size: 0
    };
    const u = e && await o.read(R(e, n));
    u && (f = await sl({
      gitdir: s,
      type: "blob",
      object: u
    }), l === f && (c = await o.lstat(R(e, n)))), await Y.acquire(
      { fs: o, gitdir: s, cache: i },
      async function(d) {
        d.delete({ filepath: n }), l && d.insert({ filepath: n, stats: c, oid: l });
      }
    );
  } catch (o) {
    throw o.caller = "git.reset", o;
  }
}
async function fl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n,
  depth: a
}) {
  try {
    b("fs", t), b("gitdir", r), b("ref", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await T.resolve({
      fs: i,
      gitdir: o,
      ref: n,
      depth: a
    });
  } catch (i) {
    throw i.caller = "git.resolveRef", i;
  }
}
async function ll({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  path: n,
  value: a,
  append: i = !1
}) {
  try {
    b("fs", t), b("gitdir", r), b("path", n);
    const o = new C(t), s = await D({ fsp: o, dotgit: r }), l = await J.get({ fs: o, gitdir: s });
    i ? await l.append(n, a) : await l.set(n, a), await J.save({ fs: o, gitdir: s, config: l });
  } catch (o) {
    throw o.caller = "git.setConfig", o;
  }
}
async function ul({ fs: t, gitdir: e, commit: r }) {
  const n = q.from(r).toObject();
  return await ht({
    fs: t,
    gitdir: e,
    type: "commit",
    object: n,
    format: "content"
  });
}
class Nn {
  // constructor removed
  static get timezoneOffsetForRefLogEntry() {
    const e = (/* @__PURE__ */ new Date()).getTimezoneOffset(), r = Math.abs(Math.floor(e / 60)), n = Math.abs(e % 60).toString().padStart(2, "0");
    return `${e > 0 ? "-" : "+"}${r.toString().padStart(2, "0")}${n}`;
  }
  static createStashReflogEntry(e, r, n) {
    const a = e.name.replace(/\s/g, ""), i = "0000000000000000000000000000000000000000", o = Math.floor(Date.now() / 1e3), s = Nn.timezoneOffsetForRefLogEntry;
    return `${i} ${r} ${a} ${e.email} ${o} ${s}	${n}
`;
  }
  static getStashReflogEntry(e, r = !1) {
    return e.split(`
`).filter((i) => i).reverse().map(
      (i, o) => r ? `stash@{${o}}: ${i.split("	")[1]}` : i
    );
  }
}
class qt {
  /**
   * Creates an instance of GitStashManager.
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} args.dir - The working directory.
   * @param {string}[args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
   */
  constructor({ fs: e, dir: r, gitdir: n = R(r, ".git") }) {
    Object.assign(this, {
      fs: e,
      dir: r,
      gitdir: n,
      _author: null
    });
  }
  /**
   * Gets the reference name for the stash.
   *
   * @returns {string} - The stash reference name.
   */
  static get refStash() {
    return "refs/stash";
  }
  /**
   * Gets the reference name for the stash reflogs.
   *
   * @returns {string} - The stash reflogs reference name.
   */
  static get refLogsStash() {
    return "logs/refs/stash";
  }
  /**
   * Gets the file path for the stash reference.
   *
   * @returns {string} - The file path for the stash reference.
   */
  get refStashPath() {
    return R(this.gitdir, qt.refStash);
  }
  /**
   * Gets the file path for the stash reflogs.
   *
   * @returns {string} - The file path for the stash reflogs.
   */
  get refLogsStashPath() {
    return R(this.gitdir, qt.refLogsStash);
  }
  /**
   * Retrieves the author information for the stash.
   *
   * @returns {Promise<Object>} - The author object.
   * @throws {MissingNameError} - If the author name is missing.
   */
  async getAuthor() {
    if (!this._author && (this._author = await ce({
      fs: this.fs,
      gitdir: this.gitdir,
      author: {}
    }), !this._author))
      throw new at("author");
    return this._author;
  }
  /**
   * Gets the SHA of a stash entry by its index.
   *
   * @param {number} refIdx - The index of the stash entry.
   * @param {string[]} [stashEntries] - Optional preloaded stash entries.
   * @returns {Promise<string|null>} - The SHA of the stash entry or `null` if not found.
   */
  async getStashSHA(e, r) {
    return await this.fs.exists(this.refStashPath) ? (r || await this.readStashReflogs({ parsed: !1 }))[e].split(" ")[1] : null;
  }
  /**
   * Writes a stash commit to the repository.
   *
   * @param {Object} args
   * @param {string} args.message - The commit message.
   * @param {string} args.tree - The tree object ID.
   * @param {string[]} args.parent - The parent commit object IDs.
   * @returns {Promise<string>} - The object ID of the written commit.
   */
  async writeStashCommit({ message: e, tree: r, parent: n }) {
    return ul({
      fs: this.fs,
      gitdir: this.gitdir,
      commit: {
        message: e,
        tree: r,
        parent: n,
        author: await this.getAuthor(),
        committer: await this.getAuthor()
      }
    });
  }
  /**
   * Reads a stash commit by its index.
   *
   * @param {number} refIdx - The index of the stash entry.
   * @returns {Promise<Object>} - The stash commit object.
   * @throws {InvalidRefNameError} - If the index is invalid.
   */
  async readStashCommit(e) {
    const r = await this.readStashReflogs({ parsed: !1 });
    if (e !== 0 && (e < 0 || e > r.length - 1))
      throw new Rt(
        `stash@${e}`,
        "number that is in range of [0, num of stash pushed]"
      );
    const n = await this.getStashSHA(e, r);
    return n ? zt({
      fs: this.fs,
      cache: {},
      gitdir: this.gitdir,
      oid: n
    }) : {};
  }
  /**
   * Writes a stash reference to the repository.
   *
   * @param {string} stashCommit - The object ID of the stash commit.
   * @returns {Promise<void>}
   */
  async writeStashRef(e) {
    return T.writeRef({
      fs: this.fs,
      gitdir: this.gitdir,
      ref: qt.refStash,
      value: e
    });
  }
  /**
   * Writes a reflog entry for a stash commit.
   *
   * @param {Object} args
   * @param {string} args.stashCommit - The object ID of the stash commit.
   * @param {string} args.message - The reflog message.
   * @returns {Promise<void>}
   */
  async writeStashReflogEntry({ stashCommit: e, message: r }) {
    const n = await this.getAuthor(), a = Nn.createStashReflogEntry(
      n,
      e,
      r
    ), i = this.refLogsStashPath;
    await qe({ filepath: i, entry: a }, async () => {
      const o = await this.fs.exists(i) ? await this.fs.read(i, "utf8") : "";
      await this.fs.write(i, o + a, "utf8");
    });
  }
  /**
   * Reads the stash reflogs.
   *
   * @param {Object} args
   * @param {boolean} [args.parsed=false] - Whether to parse the reflog entries.
   * @returns {Promise<string[]|Object[]>} - The reflog entries as strings or parsed objects.
   */
  async readStashReflogs({ parsed: e = !1 }) {
    if (!await this.fs.exists(this.refLogsStashPath))
      return [];
    const r = await this.fs.read(this.refLogsStashPath, "utf8");
    return Nn.getStashReflogEntry(r, e);
  }
}
async function dl({ fs: t, dir: e, gitdir: r, message: n = "" }) {
  const a = new qt({ fs: t, dir: e, gitdir: r });
  await a.getAuthor();
  const i = await le({
    fs: t,
    gitdir: r,
    fullname: !1
  }), o = await T.resolve({
    fs: t,
    gitdir: r,
    ref: "HEAD"
  }), l = (await $i({ fs: t, dir: e, gitdir: r, oid: o })).commit.message, f = [o];
  let c = null, u = gt({ ref: "HEAD" });
  const d = await us({
    fs: t,
    dir: e,
    gitdir: r,
    treePair: [gt({ ref: "HEAD" }), "stage"]
  });
  if (d) {
    const m = await a.writeStashCommit({
      message: `stash-Index: WIP on ${i} - ${(/* @__PURE__ */ new Date()).toISOString()}`,
      tree: d,
      parent: f
    });
    f.push(m), c = d, u = Re();
  }
  const h = await us({
    fs: t,
    dir: e,
    gitdir: r,
    treePair: [u, "workdir"]
  });
  if (h) {
    const m = await a.writeStashCommit({
      message: `stash-WorkDir: WIP on ${i} - ${(/* @__PURE__ */ new Date()).toISOString()}`,
      tree: h,
      parent: [f[f.length - 1]]
    });
    f.push(m), c = h;
  }
  if (!c || !d && !h)
    throw new H("changes, nothing to stash");
  const w = (n.trim() || `WIP on ${i}`) + `: ${o.substring(0, 7)} ${l}`;
  return { stashCommit: await a.writeStashCommit({
    message: w,
    tree: c,
    parent: f
  }), stashMsg: w, branch: i, stashMgr: a };
}
async function fm({ fs: t, dir: e, gitdir: r, message: n = "" }) {
  const { stashCommit: a, stashMsg: i, branch: o, stashMgr: s } = await dl({
    fs: t,
    dir: e,
    gitdir: r,
    message: n
  });
  return await s.writeStashRef(a), await s.writeStashReflogEntry({
    stashCommit: a,
    message: i
  }), await Si({
    fs: t,
    dir: e,
    gitdir: r,
    ref: o,
    track: !1,
    force: !0
    // force checkout to discard changes
  }), a;
}
async function lm({ fs: t, dir: e, gitdir: r, message: n = "" }) {
  const { stashCommit: a } = await dl({
    fs: t,
    dir: e,
    gitdir: r,
    message: n
  });
  return a;
}
async function hl({ fs: t, dir: e, gitdir: r, refIdx: n = 0 }) {
  const i = await new qt({ fs: t, dir: e, gitdir: r }).readStashCommit(n), { parent: o = null } = i.commit ? i.commit : {};
  if (!(!o || !Array.isArray(o)))
    for (let s = 0; s < o.length - 1; s++) {
      const f = (await zt({
        fs: t,
        cache: {},
        gitdir: r,
        oid: o[s + 1]
      })).commit.message.startsWith("stash-Index");
      await ef({
        fs: t,
        dir: e,
        gitdir: r,
        stashCommit: o[s + 1],
        parentCommit: o[s],
        wasStaged: f
      });
    }
}
async function wl({ fs: t, dir: e, gitdir: r, refIdx: n = 0 }) {
  const a = new qt({ fs: t, dir: e, gitdir: r });
  if (!(await a.readStashCommit(n)).commit)
    return;
  const o = a.refStashPath;
  await qe(o, async () => {
    await t.exists(o) && await t.rm(o);
  });
  const s = await a.readStashReflogs({ parsed: !1 });
  if (!s.length)
    return;
  s.splice(n, 1);
  const l = a.refLogsStashPath;
  await qe({ reflogEntries: s, stashReflogPath: l, stashMgr: a }, async () => {
    if (s.length) {
      await t.write(
        l,
        s.reverse().join(`
`) + `
`,
        "utf8"
      );
      const f = s[s.length - 1].split(" ")[1];
      await a.writeStashRef(f);
    } else
      await t.rm(l);
  });
}
async function um({ fs: t, dir: e, gitdir: r }) {
  return new qt({ fs: t, dir: e, gitdir: r }).readStashReflogs({ parsed: !0 });
}
async function dm({ fs: t, dir: e, gitdir: r }) {
  const n = new qt({ fs: t, dir: e, gitdir: r }), a = [n.refStashPath, n.refLogsStashPath];
  await qe(a, async () => {
    await Promise.all(
      a.map(async (i) => {
        if (await t.exists(i))
          return t.rm(i);
      })
    );
  });
}
async function hm({ fs: t, dir: e, gitdir: r, refIdx: n = 0 }) {
  await hl({ fs: t, dir: e, gitdir: r, refIdx: n }), await wl({ fs: t, dir: e, gitdir: r, refIdx: n });
}
async function pl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  op: n = "push",
  message: a = "",
  refIdx: i = 0
}) {
  b("fs", t), b("dir", e), b("gitdir", r), b("op", n);
  const o = {
    push: fm,
    apply: hl,
    drop: wl,
    list: um,
    clear: dm,
    pop: hm,
    create: lm
  }, s = ["apply", "drop", "pop"];
  try {
    const l = new C(t), f = await D({ fsp: l, dotgit: r });
    ["refs", "logs", "logs/refs"].map((d) => R(f, d)).forEach(async (d) => {
      await l.exists(d) || await l.mkdir(d);
    });
    const u = o[n];
    if (u) {
      if (s.includes(n) && i < 0)
        throw new Rt(
          `stash@${i}`,
          "number that is in range of [0, num of stash pushed]"
        );
      return await u({
        fs: l,
        dir: e,
        gitdir: f,
        message: a,
        refIdx: i
      });
    }
    throw new Error(`To be implemented: ${n}`);
  } catch (l) {
    throw l.caller = "git.stash", l;
  }
}
async function ml({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  filepath: n,
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("filepath", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    if (await er.isIgnored({
      fs: i,
      gitdir: o,
      dir: e,
      filepath: n
    }))
      return "ignored";
    const l = await wm({ fs: i, cache: a, gitdir: o }), f = await gl({
      fs: i,
      cache: a,
      gitdir: o,
      tree: l,
      path: n
    }), c = await Y.acquire(
      { fs: i, gitdir: o, cache: a },
      async function(m) {
        for (const y of m)
          if (y.path === n) return y;
        return null;
      }
    ), u = await i.lstat(R(e, n)), d = f !== null, h = c !== null, w = u !== null, p = async () => {
      if (h && !Rn(c, u))
        return c.oid;
      {
        const m = await i.read(R(e, n)), y = await sl({
          gitdir: o,
          type: "blob",
          object: m
        });
        return h && c.oid === y && u.size !== -1 && Y.acquire(
          { fs: i, gitdir: o, cache: a },
          async function(_) {
            _.insert({ filepath: n, stats: u, oid: y });
          }
        ), y;
      }
    };
    if (!d && !w && !h) return "absent";
    if (!d && !w && h) return "*absent";
    if (!d && w && !h) return "*added";
    if (!d && w && h)
      return await p() === c.oid ? "added" : "*added";
    if (d && !w && !h) return "deleted";
    if (d && !w && h)
      return f === c.oid, "*deleted";
    if (d && w && !h)
      return await p() === f ? "*undeleted" : "*undeletemodified";
    if (d && w && h) {
      const m = await p();
      return m === f ? m === c.oid ? "unmodified" : "*unmodified" : m === c.oid ? "modified" : "*modified";
    }
  } catch (i) {
    throw i.caller = "git.status", i;
  }
}
async function gl({ fs: t, cache: e, gitdir: r, tree: n, path: a }) {
  typeof a == "string" && (a = a.split("/"));
  const i = a.shift();
  for (const o of n)
    if (o.path === i) {
      if (a.length === 0)
        return o.oid;
      const { type: s, object: l } = await G({
        fs: t,
        cache: e,
        gitdir: r,
        oid: o.oid
      });
      if (s === "tree") {
        const f = dt.from(l);
        return gl({ fs: t, cache: e, gitdir: r, tree: f, path: a });
      }
      if (s === "blob")
        throw new ft(o.oid, s, "blob", a.join("/"));
    }
  return null;
}
async function wm({ fs: t, cache: e, gitdir: r }) {
  let n;
  try {
    n = await T.resolve({
      fs: t,
      gitdir: r,
      ref: "HEAD"
    });
  } catch (i) {
    if (i instanceof H)
      return [];
  }
  const { tree: a } = await rr({ fs: t, cache: e, gitdir: r, oid: n });
  return a;
}
async function yl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n = "HEAD",
  filepaths: a = ["."],
  filter: i,
  cache: o = {},
  ignored: s = !1
}) {
  try {
    b("fs", t), b("gitdir", r), b("ref", n);
    const l = new C(t), f = await D({ fsp: l, dotgit: r });
    return await se({
      fs: l,
      cache: o,
      dir: e,
      gitdir: f,
      trees: [gt({ ref: n }), tr(), Re()],
      map: async function(c, [u, d, h]) {
        if (!u && !h && d && !s && await er.isIgnored({
          fs: l,
          dir: e,
          filepath: c
        }) || !a.some((x) => Qc(c, x)))
          return null;
        if (i && !i(c))
          return;
        const [w, p, m] = await Promise.all([
          u && u.type(),
          d && d.type(),
          h && h.type()
        ]), y = [w, p, m].includes("blob");
        if ((w === "tree" || w === "special") && !y) return;
        if (w === "commit") return null;
        if ((p === "tree" || p === "special") && !y)
          return;
        if (m === "commit") return null;
        if ((m === "tree" || m === "special") && !y) return;
        const _ = w === "blob" ? await u.oid() : void 0, v = m === "blob" ? await h.oid() : void 0;
        let S;
        w !== "blob" && p === "blob" && m !== "blob" ? S = "42" : p === "blob" && (S = await d.oid());
        const k = [void 0, _, S, v], O = k.map((x) => k.indexOf(x));
        return O.shift(), [c, ...O];
      }
    });
  } catch (l) {
    throw l.caller = "git.statusMatrix", l;
  }
}
async function _l({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n,
  object: a,
  force: i = !1
}) {
  try {
    b("fs", t), b("gitdir", r), b("ref", n);
    const o = new C(t);
    if (n === void 0)
      throw new ut("ref");
    n = n.startsWith("refs/tags/") ? n : `refs/tags/${n}`;
    const s = await D({ fsp: o, dotgit: r }), l = await T.resolve({
      fs: o,
      gitdir: s,
      ref: a || "HEAD"
    });
    if (!i && await T.exists({ fs: o, gitdir: s, ref: n }))
      throw new Tt("tag", n);
    await T.writeRef({ fs: o, gitdir: s, ref: n, value: l });
  } catch (o) {
    throw o.caller = "git.tag", o;
  }
}
async function bl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  cache: n = {},
  filepath: a,
  oid: i,
  mode: o,
  add: s,
  remove: l,
  force: f
}) {
  try {
    b("fs", t), b("gitdir", r), b("filepath", a);
    const c = new C(t), u = await D({ fsp: c, dotgit: r });
    if (l)
      return await Y.acquire(
        { fs: c, gitdir: u, cache: n },
        async function(h) {
          if (!f) {
            const w = await c.lstat(R(e, a));
            if (w) {
              if (w.isDirectory())
                throw new oe("directory");
              return;
            }
          }
          h.has({ filepath: a }) && h.delete({
            filepath: a
          });
        }
      );
    let d;
    if (!i) {
      if (d = await c.lstat(R(e, a)), !d)
        throw new H(
          `file at "${a}" on disk and "remove" not set`
        );
      if (d.isDirectory())
        throw new oe("directory");
    }
    return await Y.acquire(
      { fs: c, gitdir: u, cache: n },
      async function(h) {
        if (!s && !h.has({ filepath: a }))
          throw new H(
            `file at "${a}" in index and "add" not set`
          );
        let w;
        if (i)
          w = {
            ctime: /* @__PURE__ */ new Date(0),
            mtime: /* @__PURE__ */ new Date(0),
            dev: 0,
            ino: 0,
            mode: o,
            uid: 0,
            gid: 0,
            size: 0
          };
        else {
          w = d;
          const p = w.isSymbolicLink() ? await c.readlink(R(e, a)) : await c.read(R(e, a));
          i = await ht({
            fs: c,
            gitdir: u,
            type: "blob",
            format: "content",
            object: p
          });
        }
        return h.insert({
          filepath: a,
          oid: i,
          stats: w
        }), i;
      }
    );
  } catch (c) {
    throw c.caller = "git.updateIndex", c;
  }
}
function vl() {
  try {
    return qn.version;
  } catch (t) {
    throw t.caller = "git.version", t;
  }
}
async function xl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  trees: n,
  map: a,
  reduce: i,
  iterate: o,
  cache: s = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("trees", n);
    const l = new C(t), f = await D({ fsp: l, dotgit: r });
    return await se({
      fs: l,
      cache: s,
      dir: e,
      gitdir: f,
      trees: n,
      map: a,
      reduce: i,
      iterate: o
    });
  } catch (l) {
    throw l.caller = "git.walk", l;
  }
}
async function El({ fs: t, dir: e, gitdir: r = R(e, ".git"), blob: n }) {
  try {
    b("fs", t), b("gitdir", r), b("blob", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await ht({
      fs: a,
      gitdir: i,
      type: "blob",
      object: n,
      format: "content"
    });
  } catch (a) {
    throw a.caller = "git.writeBlob", a;
  }
}
async function Sl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  commit: n
}) {
  try {
    b("fs", t), b("gitdir", r), b("commit", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await ul({
      fs: a,
      gitdir: i,
      commit: n
    });
  } catch (a) {
    throw a.caller = "git.writeCommit", a;
  }
}
async function kl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  type: n,
  object: a,
  format: i = "parsed",
  oid: o,
  encoding: s = void 0
}) {
  try {
    const l = new C(t), f = await D({ fsp: l, dotgit: r });
    if (i === "parsed") {
      switch (n) {
        case "commit":
          a = q.from(a).toObject();
          break;
        case "tree":
          a = dt.from(a).toObject();
          break;
        case "blob":
          a = Buffer.from(a, s);
          break;
        case "tag":
          a = ct.from(a).toObject();
          break;
        default:
          throw new ft(o || "", n, "blob|commit|tag|tree");
      }
      i = "content";
    }
    return o = await ht({
      fs: l,
      gitdir: f,
      type: n,
      object: a,
      oid: o,
      format: i
    }), o;
  } catch (l) {
    throw l.caller = "git.writeObject", l;
  }
}
async function Al({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n,
  value: a,
  force: i = !1,
  symbolic: o = !1
}) {
  try {
    b("fs", t), b("gitdir", r), b("ref", n), b("value", a);
    const s = new C(t);
    if (!Sr(n, !0))
      throw new Rt(n, xr.clean(n));
    const l = await D({ fsp: s, dotgit: r });
    if (!i && await T.exists({ fs: s, gitdir: l, ref: n }))
      throw new Tt("ref", n);
    o ? await T.writeSymbolicRef({
      fs: s,
      gitdir: l,
      ref: n,
      value: a
    }) : (a = await T.resolve({
      fs: s,
      gitdir: l,
      ref: a
    }), await T.writeRef({
      fs: s,
      gitdir: l,
      ref: n,
      value: a
    }));
  } catch (s) {
    throw s.caller = "git.writeRef", s;
  }
}
async function pm({ fs: t, gitdir: e, tag: r }) {
  const n = ct.from(r).toObject();
  return await ht({
    fs: t,
    gitdir: e,
    type: "tag",
    object: n,
    format: "content"
  });
}
async function $l({ fs: t, dir: e, gitdir: r = R(e, ".git"), tag: n }) {
  try {
    b("fs", t), b("gitdir", r), b("tag", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await pm({
      fs: a,
      gitdir: i,
      tag: n
    });
  } catch (a) {
    throw a.caller = "git.writeTag", a;
  }
}
async function Rl({ fs: t, dir: e, gitdir: r = R(e, ".git"), tree: n }) {
  try {
    b("fs", t), b("gitdir", r), b("tree", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await en({
      fs: a,
      gitdir: i,
      tree: n
    });
  } catch (a) {
    throw a.caller = "git.writeTree", a;
  }
}
var mm = {
  Errors: jc,
  STAGE: Re,
  TREE: gt,
  WORKDIR: tr,
  add: Hc,
  abortMerge: Mc,
  addNote: Vc,
  addRemote: Kc,
  annotatedTag: Yc,
  branch: Jc,
  cherryPick: rf,
  checkout: Si,
  clone: ff,
  commit: lf,
  getConfig: kf,
  getConfigAll: Af,
  setConfig: ll,
  currentBranch: uf,
  deleteBranch: df,
  deleteRef: hf,
  deleteRemote: wf,
  deleteTag: pf,
  expandOid: mf,
  expandRef: gf,
  fastForward: bf,
  fetch: vf,
  findMergeBase: xf,
  findRoot: Sf,
  getRemoteInfo: $f,
  getRemoteInfo2: Of,
  hashBlob: Tf,
  indexPack: If,
  init: Pf,
  isDescendent: Cf,
  isIgnored: Df,
  listBranches: Nf,
  listFiles: jf,
  listNotes: Uf,
  listRefs: Mf,
  listRemotes: zf,
  listServerRefs: Lf,
  listTags: Hf,
  log: Wf,
  merge: qf,
  packObjects: Vf,
  pull: Xf,
  push: Kf,
  readBlob: Qf,
  readCommit: $i,
  readNote: tl,
  readObject: el,
  readTag: rl,
  readTree: nl,
  remove: al,
  removeNote: il,
  renameBranch: ol,
  resetIndex: cl,
  updateIndex: bl,
  resolveRef: fl,
  status: ml,
  statusMatrix: yl,
  tag: _l,
  version: vl,
  walk: xl,
  writeBlob: El,
  writeCommit: Sl,
  writeObject: kl,
  writeRef: Al,
  writeTag: $l,
  writeTree: Rl,
  stash: pl
};
P.Errors = jc;
P.STAGE = Re;
P.TREE = gt;
P.WORKDIR = tr;
P.abortMerge = Mc;
P.add = Hc;
P.addNote = Vc;
P.addRemote = Kc;
P.annotatedTag = Yc;
P.branch = Jc;
P.checkout = Si;
P.cherryPick = rf;
P.clone = ff;
P.commit = lf;
P.currentBranch = uf;
var gm = P.default = mm;
P.deleteBranch = df;
P.deleteRef = hf;
P.deleteRemote = wf;
P.deleteTag = pf;
P.expandOid = mf;
P.expandRef = gf;
P.fastForward = bf;
P.fetch = vf;
P.findMergeBase = xf;
P.findRoot = Sf;
P.getConfig = kf;
P.getConfigAll = Af;
P.getRemoteInfo = $f;
P.getRemoteInfo2 = Of;
P.hashBlob = Tf;
P.indexPack = If;
P.init = Pf;
P.isDescendent = Cf;
P.isIgnored = Df;
P.listBranches = Nf;
P.listFiles = jf;
P.listNotes = Uf;
P.listRefs = Mf;
P.listRemotes = zf;
P.listServerRefs = Lf;
P.listTags = Hf;
P.log = Wf;
P.merge = qf;
P.packObjects = Vf;
P.pull = Xf;
P.push = Kf;
P.readBlob = Qf;
P.readCommit = $i;
P.readNote = tl;
P.readObject = el;
P.readTag = rl;
P.readTree = nl;
P.remove = al;
P.removeNote = il;
P.renameBranch = ol;
P.resetIndex = cl;
P.resolveRef = fl;
P.setConfig = ll;
P.stash = pl;
P.status = ml;
P.statusMatrix = yl;
P.tag = _l;
P.updateIndex = bl;
P.version = vl;
P.walk = xl;
P.writeBlob = El;
P.writeCommit = Sl;
P.writeObject = kl;
P.writeRef = Al;
P.writeTag = $l;
P.writeTree = Rl;
class ym {
  async getStatus(e) {
    try {
      const r = await gm.currentBranch({ fs: At, dir: e, gitdir: e + "/.git" }), a = de("git status --porcelain", { cwd: e, encoding: "utf-8" }).trim().split(`
`).filter((o) => o.trim()), i = {};
      for (const o of a) {
        let s = o.trim();
        if (!s) continue;
        s.startsWith('"') && s.endsWith('"') && (s = s.slice(1, -1));
        const l = s.substring(0, 2), f = l[0];
        let c = s.substring(2).trim();
        c.startsWith('"') && c.endsWith('"') && (c = c.slice(1, -1)), c = c.replace(/\\/g, "/");
        let u;
        l.includes("U") ? u = "conflict" : l === "??" || l.includes("A") ? u = "new" : l.includes("M") ? u = "modified" : l.includes("D") ? u = "deleted" : l.includes("R") ? u = "modified" : u = "normal";
        const d = f !== " " && f !== "?";
        i[c] = { status: u, staged: d };
      }
      return {
        branch: r || "",
        hasUncommittedChanges: a.length > 0,
        files: i
      };
    } catch (r) {
      return console.error("Failed to get git status:", r), {
        branch: "",
        hasUncommittedChanges: !1,
        files: {}
      };
    }
  }
  async getFileDiff(e, r) {
    try {
      const n = `${e}/${r}`, a = At.readFileSync(n, "utf-8");
      let i = a.split(`
`);
      if (a.endsWith(`
`) && (i = i.slice(0, -1)), de(`git ls-files --others --exclude-standard "${r}"`, {
        cwd: e,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"]
      }).trim())
        return i.map((u) => ({
          content: u,
          type: "added"
        }));
      let s;
      try {
        s = de(`git diff HEAD -- "${r}"`, {
          cwd: e,
          encoding: "utf-8",
          stdio: ["ignore", "pipe", "ignore"]
        });
      } catch (u) {
        s = u.stdout || "";
      }
      if (!s.trim())
        return i.map((u) => ({
          content: u,
          type: "unchanged"
        }));
      const l = Array(i.length).fill("unchanged"), f = s.split(`
`);
      let c = 0;
      for (const u of f) {
        if (u.startsWith("diff --git") || u.startsWith("index ") || u.startsWith("--- ") || u.startsWith("+++ ") || u.startsWith("@@ ")) {
          if (u.startsWith("@@ ")) {
            const d = u.match(/\+(\d+)(?:,\d+)?/);
            d && (c = parseInt(d[1], 10) - 1);
          }
          continue;
        }
        if (u.startsWith("+")) {
          const d = c;
          d < l.length && (l[d] = "added"), c++;
        } else u.startsWith("-") || c++;
      }
      return i.map((u, d) => ({
        content: u,
        type: l[d]
      }));
    } catch (n) {
      console.error("Failed to get file diff:", n);
      try {
        const a = `${e}/${r}`, i = At.readFileSync(a, "utf-8");
        let o = i.split(`
`);
        return i.endsWith(`
`) && (o = o.slice(0, -1)), o.map((s) => ({
          content: s,
          type: "unchanged"
        }));
      } catch {
        return [];
      }
    }
  }
  async getGitUserInfo(e) {
    let r = "", n = "";
    try {
      r = de("git config --get user.name", { cwd: e, encoding: "utf-8" }).trim();
    } catch {
    }
    try {
      n = de("git config --get user.email", { cwd: e, encoding: "utf-8" }).trim();
    } catch {
    }
    if (!r || !n) {
      if (!r)
        try {
          r = de("git config --global --get user.name", { encoding: "utf-8" }).trim();
        } catch {
        }
      if (!n)
        try {
          n = de("git config --global --get user.email", { encoding: "utf-8" }).trim();
        } catch {
        }
    }
    return { name: r, email: n };
  }
}
const Ri = new ym();
class _m {
  async listFiles(e, r) {
    return this.readDirectory(e, "", r);
  }
  readDirectory(e, r, n) {
    const a = At.readdirSync(e), i = [];
    for (const o of a) {
      if (o === "node_modules" || o === ".git" || o === ".gitignore" && !n || !n && o.startsWith("."))
        continue;
      const s = xn.join(e, o), l = At.statSync(s);
      let f = r ? xn.join(r, o) : o;
      if (f = f.replace(/\\/g, "/"), l.isDirectory()) {
        const c = this.readDirectory(s, f, n);
        i.push({
          name: o,
          path: f,
          isDirectory: !0,
          status: "normal",
          children: c
        });
      } else
        i.push({
          name: o,
          path: f,
          isDirectory: !1,
          status: "normal"
        });
    }
    return i.sort((o, s) => o.isDirectory === s.isDirectory ? o.name.localeCompare(s.name) : o.isDirectory ? -1 : 1), i;
  }
  async readFile(e) {
    return At.readFileSync(e, "utf-8");
  }
}
const Ol = new _m();
let bt, Tl = process.cwd();
function Il() {
  const t = process.platform === "win32", { width: e, height: r } = Dl.getPrimaryDisplay().workAreaSize, n = Math.round(e * 0.8), a = Math.round(r * 0.85);
  if (bt = new bs({
    width: n,
    height: a,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: t ? "hidden" : "default",
    frame: !t,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1
    }
  }), process.env.NODE_ENV === "development")
    bt.loadURL("http://localhost:5173"), bt.webContents.openDevTools();
  else {
    const i = Fl.join(wr.getAppPath(), "dist/index.html");
    bt.loadFile(i);
  }
  bt.on("closed", () => {
    bt = null;
  });
}
wr.whenReady().then(Il);
wr.on("window-all-closed", () => {
  process.platform !== "darwin" && wr.quit();
});
wr.on("activate", () => {
  bs.getAllWindows().length === 0 && Il();
});
ot.handle("get-settings", () => Fn.getSettings());
ot.handle("save-settings", (t, e) => (Fn.setSettings(e), !0));
ot.handle("read-file", async (t, e) => Ol.readFile(e));
ot.handle("list-files", async (t, e, r) => Ol.listFiles(e, r));
ot.handle("get-git-status", async (t, e) => Ri.getStatus(e));
ot.handle("execute-git-command", async (t, e, r) => new Promise((n) => {
  const a = process.platform === "win32", i = jl(a ? "cmd" : "bash", [
    a ? "/c" : "-c",
    r
  ], {
    cwd: e
  });
  let o = "", s = "", l = null;
  l = setTimeout(() => {
    i.kill(), n({
      success: !1,
      output: "命令执行超时（5分钟）。可能需要输入凭证，请先在命令行配置好 Git 凭证缓存。",
      error: "ETIMEDOUT"
    });
  }, 5 * 60 * 1e3), i.stdout.on("data", (f) => {
    o += f.toString();
  }), i.stderr.on("data", (f) => {
    s += f.toString();
  }), i.on("close", (f) => {
    l && clearTimeout(l);
    const c = (o + `
` + s).trim();
    n(f === 0 ? {
      success: !0,
      output: c
    } : {
      success: !1,
      output: c || `进程退出码 ${f}`,
      error: `Exit code ${f}`
    });
  }), i.on("error", (f) => {
    l && clearTimeout(l), n({
      success: !1,
      output: f.message,
      error: String(f)
    });
  });
}));
ot.handle("get-file-diff", async (t, e, r) => Ri.getFileDiff(e, r));
ot.handle("get-git-user-info", async (t, e) => {
  try {
    return await Ri.getGitUserInfo(e);
  } catch (r) {
    return console.error("Failed to get git user info:", r), { name: "", email: "" };
  }
});
ot.handle("get-current-repo-path", () => Tl);
ot.handle("get-platform", () => process.platform);
ot.handle("minimize-window", () => {
  bt && bt.minimize();
});
ot.handle("close-window", () => {
  bt && bt.close();
});
ot.handle("get-recent-files", () => Fn.getRecentFiles());
ot.handle("add-recent-file", (t, e, r) => (Fn.addRecentFile(e, r), !0));
ot.handle("select-folder", async () => {
  if (!bt) return "";
  const t = await Nl.showOpenDialog(bt, {
    properties: ["openDirectory"],
    title: "选择 Git 仓库文件夹"
  });
  return t.canceled || t.filePaths.length === 0 ? "" : t.filePaths[0];
});
ot.handle("set-current-repo-path", (t, e) => {
  Tl = e;
});
