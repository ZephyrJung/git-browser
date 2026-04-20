var Cl = Object.defineProperty;
var Dl = (t, e, r) => e in t ? Cl(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var Yn = (t, e, r) => Dl(t, typeof e != "symbol" ? e + "" : e, r);
import { app as hr, BrowserWindow as vs, ipcMain as gt, screen as Nl } from "electron";
import Fl from "node:path";
import { execSync as hn } from "child_process";
import kt from "fs";
import xn from "path";
import jl from "os";
import Ul from "buffer";
import Ml from "crypto";
const zl = {
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
  settings: zl,
  recentRepos: [],
  recentFiles: []
};
class Ll {
  constructor() {
    Yn(this, "storePath");
    Yn(this, "data");
    const e = xn.join(jl.homedir(), ".config", "git-browser");
    kt.existsSync(e) || kt.mkdirSync(e, { recursive: !0 }), this.storePath = xn.join(e, "config.json"), this.data = this.load();
  }
  load() {
    try {
      if (!kt.existsSync(this.storePath))
        return Ti;
      const e = kt.readFileSync(this.storePath, "utf-8");
      return JSON.parse(e);
    } catch (e) {
      return console.error("Failed to load config, using default:", e), Ti;
    }
  }
  save() {
    try {
      kt.writeFileSync(this.storePath, JSON.stringify(this.data, null, 2), "utf-8");
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
const Fn = new Ll();
var xs = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, P = {}, wt = function(t) {
  if (t = t || {}, this.Promise = t.Promise || Promise, this.queues = /* @__PURE__ */ Object.create(null), this.domainReentrant = t.domainReentrant || !1, this.domainReentrant) {
    if (typeof process > "u" || typeof process.domain > "u")
      throw new Error(
        "Domain-reentrant locks require `process.domain` to exist. Please flip `opts.domainReentrant = false`, use a NodeJS version that still implements Domain, or install a browser polyfill."
      );
    this.domains = /* @__PURE__ */ Object.create(null);
  }
  this.timeout = t.timeout || wt.DEFAULT_TIMEOUT, this.maxOccupationTime = t.maxOccupationTime || wt.DEFAULT_MAX_OCCUPATION_TIME, this.maxExecutionTime = t.maxExecutionTime || wt.DEFAULT_MAX_EXECUTION_TIME, t.maxPending === 1 / 0 || Number.isInteger(t.maxPending) && t.maxPending >= 0 ? this.maxPending = t.maxPending : this.maxPending = wt.DEFAULT_MAX_PENDING;
};
wt.DEFAULT_TIMEOUT = 0;
wt.DEFAULT_MAX_OCCUPATION_TIME = 0;
wt.DEFAULT_MAX_EXECUTION_TIME = 0;
wt.DEFAULT_MAX_PENDING = 1e3;
wt.prototype.acquire = function(t, e, r, n) {
  if (Array.isArray(t))
    return this._acquireBatch(t, e, r, n);
  if (typeof e != "function")
    throw new Error("You must pass a function to execute");
  var a = null, i = null, o = null;
  typeof r != "function" && (n = r, r = null, o = new this.Promise(function(_, v) {
    a = _, i = v;
  })), n = n || {};
  var s = !1, l = null, c = null, f = null, u = this, d = function(_, v, S) {
    c && (clearTimeout(c), c = null), f && (clearTimeout(f), f = null), _ && (u.queues[t] && u.queues[t].length === 0 && delete u.queues[t], u.domainReentrant && delete u.domains[t]), s || (o ? v ? i(v) : a(S) : typeof r == "function" && r(v, S), s = !0), _ && u.queues[t] && u.queues[t].length > 0 && u.queues[t].shift()();
  }, h = function(_) {
    if (s)
      return d(_);
    l && (clearTimeout(l), l = null), u.domainReentrant && _ && (u.domains[t] = process.domain);
    var v = n.maxExecutionTime || u.maxExecutionTime;
    if (v && (f = setTimeout(function() {
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
  if (y && (c = setTimeout(function() {
    u.queues[t] && d(!1, new Error("Maximum occupation time is exceeded in queue " + t));
  }, y)), o)
    return o;
};
wt.prototype._acquireBatch = function(t, e, r, n) {
  typeof r != "function" && (n = r, r = null);
  var a = this, i = function(s, l) {
    return function(c) {
      a.acquire(s, l, c, n);
    };
  }, o = t.reduceRight(function(s, l) {
    return i(l, s);
  }, e);
  if (typeof r == "function")
    o(r);
  else
    return new this.Promise(function(s, l) {
      o.length === 1 ? o(function(c, f) {
        c ? l(c) : s(f);
      }) : s(o());
    });
};
wt.prototype.isBusy = function(t) {
  return t ? !!this.queues[t] : Object.keys(this.queues).length > 0;
};
wt.prototype._promiseTry = function(t) {
  try {
    return this.Promise.resolve(t());
  } catch (e) {
    return this.Promise.reject(e);
  }
};
var Hl = wt, Gl = Hl, qa = { exports: {} }, nn = { exports: {} }, Ii;
function Wl() {
  return Ii || (Ii = 1, typeof Object.create == "function" ? nn.exports = function(e, r) {
    r && (e.super_ = r, e.prototype = Object.create(r.prototype, {
      constructor: {
        value: e,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }));
  } : nn.exports = function(e, r) {
    if (r) {
      e.super_ = r;
      var n = function() {
      };
      n.prototype = r.prototype, e.prototype = new n(), e.prototype.constructor = e;
    }
  }), nn.exports;
}
try {
  var Pi = require("util");
  if (typeof Pi.inherits != "function") throw "";
  qa.exports = Pi.inherits;
} catch {
  qa.exports = Wl();
}
var ql = qa.exports, Za = { exports: {} };
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
(function(t, e) {
  var r = Ul, n = r.Buffer;
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
    var c = n(o);
    return s !== void 0 ? typeof l == "string" ? c.fill(s, l) : c.fill(s) : c.fill(0), c;
  }, i.allocUnsafe = function(o) {
    if (typeof o != "number")
      throw new TypeError("Argument must be a number");
    return n(o);
  }, i.allocUnsafeSlow = function(o) {
    if (typeof o != "number")
      throw new TypeError("Argument must be a number");
    return r.SlowBuffer(o);
  };
})(Za, Za.exports);
var ci = Za.exports, Zl = {}.toString, Vl = Array.isArray || function(t) {
  return Zl.call(t) == "[object Array]";
}, kr = TypeError, Es = Object, Xl = Error, Kl = EvalError, Yl = RangeError, Jl = ReferenceError, Ss = SyntaxError, Ql = URIError, tu = Math.abs, eu = Math.floor, ru = Math.max, nu = Math.min, au = Math.pow, iu = Math.round, ou = Number.isNaN || function(e) {
  return e !== e;
}, su = ou, cu = function(e) {
  return su(e) || e === 0 ? e : e < 0 ? -1 : 1;
}, fu = Object.getOwnPropertyDescriptor, wn = fu;
if (wn)
  try {
    wn([], "length");
  } catch {
    wn = null;
  }
var Ar = wn, pn = Object.defineProperty || !1;
if (pn)
  try {
    pn({}, "a", { value: 1 });
  } catch {
    pn = !1;
  }
var jn = pn, Jn, Bi;
function ks() {
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
function lu() {
  if (Ci) return Qn;
  Ci = 1;
  var t = typeof Symbol < "u" && Symbol, e = ks();
  return Qn = function() {
    return typeof t != "function" || typeof Symbol != "function" || typeof t("foo") != "symbol" || typeof Symbol("bar") != "symbol" ? !1 : e();
  }, Qn;
}
var ta, Di;
function As() {
  return Di || (Di = 1, ta = typeof Reflect < "u" && Reflect.getPrototypeOf || null), ta;
}
var ea, Ni;
function $s() {
  if (Ni) return ea;
  Ni = 1;
  var t = Es;
  return ea = t.getPrototypeOf || null, ea;
}
var uu = "Function.prototype.bind called on incompatible ", du = Object.prototype.toString, hu = Math.max, wu = "[object Function]", Fi = function(e, r) {
  for (var n = [], a = 0; a < e.length; a += 1)
    n[a] = e[a];
  for (var i = 0; i < r.length; i += 1)
    n[i + e.length] = r[i];
  return n;
}, pu = function(e, r) {
  for (var n = [], a = r, i = 0; a < e.length; a += 1, i += 1)
    n[i] = e[a];
  return n;
}, mu = function(t, e) {
  for (var r = "", n = 0; n < t.length; n += 1)
    r += t[n], n + 1 < t.length && (r += e);
  return r;
}, gu = function(e) {
  var r = this;
  if (typeof r != "function" || du.apply(r) !== wu)
    throw new TypeError(uu + r);
  for (var n = pu(arguments, 1), a, i = function() {
    if (this instanceof a) {
      var f = r.apply(
        this,
        Fi(n, arguments)
      );
      return Object(f) === f ? f : this;
    }
    return r.apply(
      e,
      Fi(n, arguments)
    );
  }, o = hu(0, r.length - n.length), s = [], l = 0; l < o; l++)
    s[l] = "$" + l;
  if (a = Function("binder", "return function (" + mu(s, ",") + "){ return binder.apply(this,arguments); }")(i), r.prototype) {
    var c = function() {
    };
    c.prototype = r.prototype, a.prototype = new c(), c.prototype = null;
  }
  return a;
}, yu = gu, $r = Function.prototype.bind || yu, fi = Function.prototype.call, ra, ji;
function li() {
  return ji || (ji = 1, ra = Function.prototype.apply), ra;
}
var _u = typeof Reflect < "u" && Reflect && Reflect.apply, bu = $r, vu = li(), xu = fi, Eu = _u, Rs = Eu || bu.call(xu, vu), Su = $r, ku = kr, Au = fi, $u = Rs, ui = function(e) {
  if (e.length < 1 || typeof e[0] != "function")
    throw new ku("a function is required");
  return $u(Su, Au, e);
}, na, Ui;
function Ru() {
  if (Ui) return na;
  Ui = 1;
  var t = ui, e = Ar, r;
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
  return na = n && typeof n.get == "function" ? t([n.get]) : typeof i == "function" ? (
    /** @type {import('./get')} */
    function(s) {
      return i(s == null ? s : a(s));
    }
  ) : !1, na;
}
var aa, Mi;
function Os() {
  if (Mi) return aa;
  Mi = 1;
  var t = As(), e = $s(), r = Ru();
  return aa = t ? function(a) {
    return t(a);
  } : e ? function(a) {
    if (!a || typeof a != "object" && typeof a != "function")
      throw new TypeError("getProto: not an object");
    return e(a);
  } : r ? function(a) {
    return r(a);
  } : null, aa;
}
var ia, zi;
function Ou() {
  if (zi) return ia;
  zi = 1;
  var t = Function.prototype.call, e = Object.prototype.hasOwnProperty, r = $r;
  return ia = r.call(t, e), ia;
}
var j, Tu = Es, Iu = Xl, Pu = Kl, Bu = Yl, Cu = Jl, Ue = Ss, De = kr, Du = Ql, Nu = tu, Fu = eu, ju = ru, Uu = nu, Mu = au, zu = iu, Lu = cu, Ts = Function, oa = function(t) {
  try {
    return Ts('"use strict"; return (' + t + ").constructor;")();
  } catch {
  }
}, wr = Ar, Hu = jn, sa = function() {
  throw new De();
}, Gu = wr ? function() {
  try {
    return arguments.callee, sa;
  } catch {
    try {
      return wr(arguments, "callee").get;
    } catch {
      return sa;
    }
  }
}() : sa, Te = lu()(), et = Os(), Wu = $s(), qu = As(), Is = li(), Rr = fi, Be = {}, Zu = typeof Uint8Array > "u" || !et ? j : et(Uint8Array), ge = {
  __proto__: null,
  "%AggregateError%": typeof AggregateError > "u" ? j : AggregateError,
  "%Array%": Array,
  "%ArrayBuffer%": typeof ArrayBuffer > "u" ? j : ArrayBuffer,
  "%ArrayIteratorPrototype%": Te && et ? et([][Symbol.iterator]()) : j,
  "%AsyncFromSyncIteratorPrototype%": j,
  "%AsyncFunction%": Be,
  "%AsyncGenerator%": Be,
  "%AsyncGeneratorFunction%": Be,
  "%AsyncIteratorPrototype%": Be,
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
  "%Error%": Iu,
  "%eval%": eval,
  // eslint-disable-line no-eval
  "%EvalError%": Pu,
  "%Float16Array%": typeof Float16Array > "u" ? j : Float16Array,
  "%Float32Array%": typeof Float32Array > "u" ? j : Float32Array,
  "%Float64Array%": typeof Float64Array > "u" ? j : Float64Array,
  "%FinalizationRegistry%": typeof FinalizationRegistry > "u" ? j : FinalizationRegistry,
  "%Function%": Ts,
  "%GeneratorFunction%": Be,
  "%Int8Array%": typeof Int8Array > "u" ? j : Int8Array,
  "%Int16Array%": typeof Int16Array > "u" ? j : Int16Array,
  "%Int32Array%": typeof Int32Array > "u" ? j : Int32Array,
  "%isFinite%": isFinite,
  "%isNaN%": isNaN,
  "%IteratorPrototype%": Te && et ? et(et([][Symbol.iterator]())) : j,
  "%JSON%": typeof JSON == "object" ? JSON : j,
  "%Map%": typeof Map > "u" ? j : Map,
  "%MapIteratorPrototype%": typeof Map > "u" || !Te || !et ? j : et((/* @__PURE__ */ new Map())[Symbol.iterator]()),
  "%Math%": Math,
  "%Number%": Number,
  "%Object%": Tu,
  "%Object.getOwnPropertyDescriptor%": wr,
  "%parseFloat%": parseFloat,
  "%parseInt%": parseInt,
  "%Promise%": typeof Promise > "u" ? j : Promise,
  "%Proxy%": typeof Proxy > "u" ? j : Proxy,
  "%RangeError%": Bu,
  "%ReferenceError%": Cu,
  "%Reflect%": typeof Reflect > "u" ? j : Reflect,
  "%RegExp%": RegExp,
  "%Set%": typeof Set > "u" ? j : Set,
  "%SetIteratorPrototype%": typeof Set > "u" || !Te || !et ? j : et((/* @__PURE__ */ new Set())[Symbol.iterator]()),
  "%SharedArrayBuffer%": typeof SharedArrayBuffer > "u" ? j : SharedArrayBuffer,
  "%String%": String,
  "%StringIteratorPrototype%": Te && et ? et(""[Symbol.iterator]()) : j,
  "%Symbol%": Te ? Symbol : j,
  "%SyntaxError%": Ue,
  "%ThrowTypeError%": Gu,
  "%TypedArray%": Zu,
  "%TypeError%": De,
  "%Uint8Array%": typeof Uint8Array > "u" ? j : Uint8Array,
  "%Uint8ClampedArray%": typeof Uint8ClampedArray > "u" ? j : Uint8ClampedArray,
  "%Uint16Array%": typeof Uint16Array > "u" ? j : Uint16Array,
  "%Uint32Array%": typeof Uint32Array > "u" ? j : Uint32Array,
  "%URIError%": Du,
  "%WeakMap%": typeof WeakMap > "u" ? j : WeakMap,
  "%WeakRef%": typeof WeakRef > "u" ? j : WeakRef,
  "%WeakSet%": typeof WeakSet > "u" ? j : WeakSet,
  "%Function.prototype.call%": Rr,
  "%Function.prototype.apply%": Is,
  "%Object.defineProperty%": Hu,
  "%Object.getPrototypeOf%": Wu,
  "%Math.abs%": Nu,
  "%Math.floor%": Fu,
  "%Math.max%": ju,
  "%Math.min%": Uu,
  "%Math.pow%": Mu,
  "%Math.round%": zu,
  "%Math.sign%": Lu,
  "%Reflect.getPrototypeOf%": qu
};
if (et)
  try {
    null.error;
  } catch (t) {
    var Vu = et(et(t));
    ge["%Error.prototype%"] = Vu;
  }
var Xu = function t(e) {
  var r;
  if (e === "%AsyncFunction%")
    r = oa("async function () {}");
  else if (e === "%GeneratorFunction%")
    r = oa("function* () {}");
  else if (e === "%AsyncGeneratorFunction%")
    r = oa("async function* () {}");
  else if (e === "%AsyncGenerator%") {
    var n = t("%AsyncGeneratorFunction%");
    n && (r = n.prototype);
  } else if (e === "%AsyncIteratorPrototype%") {
    var a = t("%AsyncGenerator%");
    a && et && (r = et(a.prototype));
  }
  return ge[e] = r, r;
}, Li = {
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
}, Or = $r, En = Ou(), Ku = Or.call(Rr, Array.prototype.concat), Yu = Or.call(Is, Array.prototype.splice), Hi = Or.call(Rr, String.prototype.replace), Sn = Or.call(Rr, String.prototype.slice), Ju = Or.call(Rr, RegExp.prototype.exec), Qu = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g, td = /\\(\\)?/g, ed = function(e) {
  var r = Sn(e, 0, 1), n = Sn(e, -1);
  if (r === "%" && n !== "%")
    throw new Ue("invalid intrinsic syntax, expected closing `%`");
  if (n === "%" && r !== "%")
    throw new Ue("invalid intrinsic syntax, expected opening `%`");
  var a = [];
  return Hi(e, Qu, function(i, o, s, l) {
    a[a.length] = s ? Hi(l, td, "$1") : o || i;
  }), a;
}, rd = function(e, r) {
  var n = e, a;
  if (En(Li, n) && (a = Li[n], n = "%" + a[0] + "%"), En(ge, n)) {
    var i = ge[n];
    if (i === Be && (i = Xu(n)), typeof i > "u" && !r)
      throw new De("intrinsic " + e + " exists, but is not available. Please file an issue!");
    return {
      alias: a,
      name: n,
      value: i
    };
  }
  throw new Ue("intrinsic " + e + " does not exist!");
}, Ps = function(e, r) {
  if (typeof e != "string" || e.length === 0)
    throw new De("intrinsic name must be a non-empty string");
  if (arguments.length > 1 && typeof r != "boolean")
    throw new De('"allowMissing" argument must be a boolean');
  if (Ju(/^%?[^%]*%?$/, e) === null)
    throw new Ue("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
  var n = ed(e), a = n.length > 0 ? n[0] : "", i = rd("%" + a + "%", r), o = i.name, s = i.value, l = !1, c = i.alias;
  c && (a = c[0], Yu(n, Ku([0, 1], c)));
  for (var f = 1, u = !0; f < n.length; f += 1) {
    var d = n[f], h = Sn(d, 0, 1), w = Sn(d, -1);
    if ((h === '"' || h === "'" || h === "`" || w === '"' || w === "'" || w === "`") && h !== w)
      throw new Ue("property names with quotes must have matching quotes");
    if ((d === "constructor" || !u) && (l = !0), a += "." + d, o = "%" + a + "%", En(ge, o))
      s = ge[o];
    else if (s != null) {
      if (!(d in s)) {
        if (!r)
          throw new De("base intrinsic for " + e + " exists, but the property is not available.");
        return;
      }
      if (wr && f + 1 >= n.length) {
        var p = wr(s, d);
        u = !!p, u && "get" in p && !("originalValue" in p.get) ? s = p.get : s = s[d];
      } else
        u = En(s, d), s = s[d];
      u && !l && (ge[o] = s);
    }
  }
  return s;
}, Bs = Ps, Cs = ui, nd = Cs([Bs("%String.prototype.indexOf%")]), Ds = function(e, r) {
  var n = (
    /** @type {(this: unknown, ...args: unknown[]) => unknown} */
    Bs(e, !!r)
  );
  return typeof n == "function" && nd(e, ".prototype.") > -1 ? Cs(
    /** @type {const} */
    [n]
  ) : n;
}, ca, Gi;
function ad() {
  if (Gi) return ca;
  Gi = 1;
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
  }, s = Object.prototype.toString, l = "[object Object]", c = "[object Function]", f = "[object GeneratorFunction]", u = "[object HTMLAllCollection]", d = "[object HTML document.all class]", h = "[object HTMLCollection]", w = typeof Symbol == "function" && !!Symbol.toStringTag, p = !(0 in [,]), m = function() {
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
  return ca = e ? function(v) {
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
    return S !== c && S !== f && !/^\[object HTML/.test(S) ? !1 : o(v);
  }, ca;
}
var fa, Wi;
function id() {
  if (Wi) return fa;
  Wi = 1;
  var t = ad(), e = Object.prototype.toString, r = Object.prototype.hasOwnProperty, n = function(l, c, f) {
    for (var u = 0, d = l.length; u < d; u++)
      r.call(l, u) && (f == null ? c(l[u], u, l) : c.call(f, l[u], u, l));
  }, a = function(l, c, f) {
    for (var u = 0, d = l.length; u < d; u++)
      f == null ? c(l.charAt(u), u, l) : c.call(f, l.charAt(u), u, l);
  }, i = function(l, c, f) {
    for (var u in l)
      r.call(l, u) && (f == null ? c(l[u], u, l) : c.call(f, l[u], u, l));
  };
  function o(s) {
    return e.call(s) === "[object Array]";
  }
  return fa = function(l, c, f) {
    if (!t(c))
      throw new TypeError("iterator must be a function");
    var u;
    arguments.length >= 3 && (u = f), o(l) ? n(l, c, u) : typeof l == "string" ? a(l, c, u) : i(l, c, u);
  }, fa;
}
var la, qi;
function od() {
  return qi || (qi = 1, la = [
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
  ]), la;
}
var ua, Zi;
function sd() {
  if (Zi) return ua;
  Zi = 1;
  var t = od(), e = typeof globalThis > "u" ? xs : globalThis;
  return ua = function() {
    for (var n = [], a = 0; a < t.length; a++)
      typeof e[t[a]] == "function" && (n[n.length] = t[a]);
    return n;
  }, ua;
}
var da = { exports: {} }, ha, Vi;
function cd() {
  if (Vi) return ha;
  Vi = 1;
  var t = jn, e = Ss, r = kr, n = Ar;
  return ha = function(i, o, s) {
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
    var l = arguments.length > 3 ? arguments[3] : null, c = arguments.length > 4 ? arguments[4] : null, f = arguments.length > 5 ? arguments[5] : null, u = arguments.length > 6 ? arguments[6] : !1, d = !!n && n(i, o);
    if (t)
      t(i, o, {
        configurable: f === null && d ? d.configurable : !f,
        enumerable: l === null && d ? d.enumerable : !l,
        value: s,
        writable: c === null && d ? d.writable : !c
      });
    else if (u || !l && !c && !f)
      i[o] = s;
    else
      throw new e("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
  }, ha;
}
var wa, Xi;
function fd() {
  if (Xi) return wa;
  Xi = 1;
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
  }, wa = e, wa;
}
var pa, Ki;
function ld() {
  if (Ki) return pa;
  Ki = 1;
  var t = Ps, e = cd(), r = fd()(), n = Ar, a = kr, i = t("%Math.floor%");
  return pa = function(s, l) {
    if (typeof s != "function")
      throw new a("`fn` is not a function");
    if (typeof l != "number" || l < 0 || l > 4294967295 || i(l) !== l)
      throw new a("`length` must be a positive 32-bit integer");
    var c = arguments.length > 2 && !!arguments[2], f = !0, u = !0;
    if ("length" in s && n) {
      var d = n(s, "length");
      d && !d.configurable && (f = !1), d && !d.writable && (u = !1);
    }
    return (f || u || !c) && (r ? e(
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
  }, pa;
}
var ma, Yi;
function ud() {
  if (Yi) return ma;
  Yi = 1;
  var t = $r, e = li(), r = Rs;
  return ma = function() {
    return r(t, e, arguments);
  }, ma;
}
var Ji;
function dd() {
  return Ji || (Ji = 1, function(t) {
    var e = ld(), r = jn, n = ui, a = ud();
    t.exports = function(o) {
      var s = n(arguments), l = 1 + o.length - (arguments.length - 1);
      return e(
        s,
        l > 0 ? l : 0,
        !0
      );
    }, r ? r(t.exports, "apply", { value: a }) : t.exports.apply = a;
  }(da)), da.exports;
}
var ga, Qi;
function hd() {
  if (Qi) return ga;
  Qi = 1;
  var t = ks();
  return ga = function() {
    return t() && !!Symbol.toStringTag;
  }, ga;
}
var ya, to;
function wd() {
  if (to) return ya;
  to = 1;
  var t = id(), e = sd(), r = dd(), n = Ds, a = Ar, i = Os(), o = n("Object.prototype.toString"), s = hd()(), l = typeof globalThis > "u" ? xs : globalThis, c = e(), f = n("String.prototype.slice"), u = n("Array.prototype.indexOf", !0) || function(m, y) {
    for (var _ = 0; _ < m.length; _ += 1)
      if (m[_] === y)
        return _;
    return -1;
  }, d = { __proto__: null };
  s && a && i ? t(c, function(p) {
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
  }) : t(c, function(p) {
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
            f(v, 1));
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
            f(v, 1);
          } catch {
          }
      }
    ), y;
  };
  return ya = function(m) {
    if (!m || typeof m != "object")
      return !1;
    if (!s) {
      var y = f(o(m), 8, -1);
      return u(c, y) > -1 ? y : y !== "Object" ? !1 : w(m);
    }
    return a ? h(m) : null;
  }, ya;
}
var _a, eo;
function pd() {
  if (eo) return _a;
  eo = 1;
  var t = wd();
  return _a = function(r) {
    return !!t(r);
  }, _a;
}
var md = kr, gd = Ds, yd = gd("TypedArray.prototype.buffer", !0), _d = pd(), bd = yd || function(e) {
  if (!_d(e))
    throw new md("Not a Typed Array");
  return e.buffer;
}, St = ci.Buffer, vd = Vl, xd = bd, Ed = ArrayBuffer.isView || function(e) {
  try {
    return xd(e), !0;
  } catch {
    return !1;
  }
}, Sd = typeof Uint8Array < "u", Ns = typeof ArrayBuffer < "u" && typeof Uint8Array < "u", kd = Ns && (St.prototype instanceof Uint8Array || St.TYPED_ARRAY_SUPPORT), Ad = function(e, r) {
  if (St.isBuffer(e))
    return e.constructor && !("isBuffer" in e) ? St.from(e) : e;
  if (typeof e == "string")
    return St.from(e, r);
  if (Ns && Ed(e)) {
    if (e.byteLength === 0)
      return St.alloc(0);
    if (kd) {
      var n = St.from(e.buffer, e.byteOffset, e.byteLength);
      if (n.byteLength === e.byteLength)
        return n;
    }
    var a = e instanceof Uint8Array ? e : new Uint8Array(e.buffer, e.byteOffset, e.byteLength), i = St.from(a);
    if (i.length === e.byteLength)
      return i;
  }
  if (Sd && e instanceof Uint8Array)
    return St.from(e);
  var o = vd(e);
  if (o)
    for (var s = 0; s < e.length; s += 1) {
      var l = e[s];
      if (typeof l != "number" || l < 0 || l > 255 || ~~l !== l)
        throw new RangeError("Array items must be numbers in the range 0-255.");
    }
  if (o || St.isBuffer(e) && e.constructor && typeof e.constructor.isBuffer == "function" && e.constructor.isBuffer(e))
    return St.from(e);
  throw new TypeError('The "data" argument must be a string, an Array, a Buffer, a Uint8Array, or a DataView.');
}, $d = ci.Buffer, Rd = Ad;
function Un(t, e) {
  this._block = $d.alloc(t), this._finalSize = e, this._blockSize = t, this._len = 0;
}
Un.prototype.update = function(t, e) {
  t = Rd(t, e || "utf8");
  for (var r = this._block, n = this._blockSize, a = t.length, i = this._len, o = 0; o < a; ) {
    for (var s = i % n, l = Math.min(a - o, n - s), c = 0; c < l; c++)
      r[s + c] = t[o + c];
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
var Od = Un, Td = ql, Fs = Od, Id = ci.Buffer, Pd = [
  1518500249,
  1859775393,
  -1894007588,
  -899497514
], Bd = new Array(80);
function Tr() {
  this.init(), this._w = Bd, Fs.call(this, 64, 56);
}
Td(Tr, Fs);
Tr.prototype.init = function() {
  return this._a = 1732584193, this._b = 4023233417, this._c = 2562383102, this._d = 271733878, this._e = 3285377520, this;
};
function Cd(t) {
  return t << 1 | t >>> 31;
}
function Dd(t) {
  return t << 5 | t >>> 27;
}
function Nd(t) {
  return t << 30 | t >>> 2;
}
function Fd(t, e, r, n) {
  return t === 0 ? e & r | ~e & n : t === 2 ? e & r | e & n | r & n : e ^ r ^ n;
}
Tr.prototype._update = function(t) {
  for (var e = this._w, r = this._a | 0, n = this._b | 0, a = this._c | 0, i = this._d | 0, o = this._e | 0, s = 0; s < 16; ++s)
    e[s] = t.readInt32BE(s * 4);
  for (; s < 80; ++s)
    e[s] = Cd(e[s - 3] ^ e[s - 8] ^ e[s - 14] ^ e[s - 16]);
  for (var l = 0; l < 80; ++l) {
    var c = ~~(l / 20), f = Dd(r) + Fd(c, n, a, i) + o + e[l] + Pd[c] | 0;
    o = i, i = a, a = Nd(n), n = r, r = f;
  }
  this._a = r + this._a | 0, this._b = n + this._b | 0, this._c = a + this._c | 0, this._d = i + this._d | 0, this._e = o + this._e | 0;
};
Tr.prototype._hash = function() {
  var t = Id.allocUnsafe(20);
  return t.writeInt32BE(this._a | 0, 0), t.writeInt32BE(this._b | 0, 4), t.writeInt32BE(this._c | 0, 8), t.writeInt32BE(this._d | 0, 12), t.writeInt32BE(this._e | 0, 16), t;
};
var jd = Tr, js = {};
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
    var i = a(n), o = i[0], s = i[1], l = i[2], c = i[3], f = i[4], u = i[5], d = i[6], h = i[7], w = i[8], p = i[9], m = i[10], y = i[11], _ = i[12], v = i[13], S = i[14];
    function k(g, E) {
      for (var A = E ^ -1, $ = 0, I = g.length; $ < I; ) A = A >>> 8 ^ n[(A ^ g.charCodeAt($++)) & 255];
      return ~A;
    }
    function O(g, E) {
      for (var A = E ^ -1, $ = g.length - 15, I = 0; I < $; ) A = S[g[I++] ^ A & 255] ^ v[g[I++] ^ A >> 8 & 255] ^ _[g[I++] ^ A >> 16 & 255] ^ y[g[I++] ^ A >>> 24] ^ m[g[I++]] ^ p[g[I++]] ^ w[g[I++]] ^ h[g[I++]] ^ d[g[I++]] ^ u[g[I++]] ^ f[g[I++]] ^ c[g[I++]] ^ l[g[I++]] ^ s[g[I++]] ^ o[g[I++]] ^ n[g[I++]];
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
})(js);
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
    arraySet: function(i, o, s, l, c) {
      if (o.subarray && i.subarray) {
        i.set(o.subarray(s, s + l), c);
        return;
      }
      for (var f = 0; f < l; f++)
        i[c + f] = o[s + f];
    },
    // Join array of chunks to single array.
    flattenChunks: function(i) {
      var o, s, l, c, f, u;
      for (l = 0, o = 0, s = i.length; o < s; o++)
        l += i[o].length;
      for (u = new Uint8Array(l), c = 0, o = 0, s = i.length; o < s; o++)
        f = i[o], u.set(f, c), c += f.length;
      return u;
    }
  }, a = {
    arraySet: function(i, o, s, l, c) {
      for (var f = 0; f < l; f++)
        i[c + f] = o[s + f];
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
var Ir = {}, Lt = {}, qe = {}, Ud = Xt, Md = 4, ro = 0, no = 1, zd = 2;
function Ze(t) {
  for (var e = t.length; --e >= 0; )
    t[e] = 0;
}
var Ld = 0, Us = 1, Hd = 2, Gd = 3, Wd = 258, di = 29, Pr = 256, pr = Pr + 1 + di, Ne = 30, hi = 19, Ms = 2 * pr + 1, we = 15, ba = 16, qd = 7, wi = 256, zs = 16, Ls = 17, Hs = 18, Va = (
  /* extra bits for each length code */
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
), mn = (
  /* extra bits for each distance code */
  [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
), Zd = (
  /* extra bits for each bit length code */
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
), Gs = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], Vd = 512, Gt = new Array((pr + 2) * 2);
Ze(Gt);
var cr = new Array(Ne * 2);
Ze(cr);
var mr = new Array(Vd);
Ze(mr);
var gr = new Array(Wd - Gd + 1);
Ze(gr);
var pi = new Array(di);
Ze(pi);
var kn = new Array(Ne);
Ze(kn);
function va(t, e, r, n, a) {
  this.static_tree = t, this.extra_bits = e, this.extra_base = r, this.elems = n, this.max_length = a, this.has_stree = t && t.length;
}
var Ws, qs, Zs;
function xa(t, e) {
  this.dyn_tree = t, this.max_code = 0, this.stat_desc = e;
}
function Vs(t) {
  return t < 256 ? mr[t] : mr[256 + (t >>> 7)];
}
function yr(t, e) {
  t.pending_buf[t.pending++] = e & 255, t.pending_buf[t.pending++] = e >>> 8 & 255;
}
function ft(t, e, r) {
  t.bi_valid > ba - r ? (t.bi_buf |= e << t.bi_valid & 65535, yr(t, t.bi_buf), t.bi_buf = e >> ba - t.bi_valid, t.bi_valid += r - ba) : (t.bi_buf |= e << t.bi_valid & 65535, t.bi_valid += r);
}
function jt(t, e, r) {
  ft(
    t,
    r[e * 2],
    r[e * 2 + 1]
    /*.Len*/
  );
}
function Xs(t, e) {
  var r = 0;
  do
    r |= t & 1, t >>>= 1, r <<= 1;
  while (--e > 0);
  return r >>> 1;
}
function Xd(t) {
  t.bi_valid === 16 ? (yr(t, t.bi_buf), t.bi_buf = 0, t.bi_valid = 0) : t.bi_valid >= 8 && (t.pending_buf[t.pending++] = t.bi_buf & 255, t.bi_buf >>= 8, t.bi_valid -= 8);
}
function Kd(t, e) {
  var r = e.dyn_tree, n = e.max_code, a = e.stat_desc.static_tree, i = e.stat_desc.has_stree, o = e.stat_desc.extra_bits, s = e.stat_desc.extra_base, l = e.stat_desc.max_length, c, f, u, d, h, w, p = 0;
  for (d = 0; d <= we; d++)
    t.bl_count[d] = 0;
  for (r[t.heap[t.heap_max] * 2 + 1] = 0, c = t.heap_max + 1; c < Ms; c++)
    f = t.heap[c], d = r[r[f * 2 + 1] * 2 + 1] + 1, d > l && (d = l, p++), r[f * 2 + 1] = d, !(f > n) && (t.bl_count[d]++, h = 0, f >= s && (h = o[f - s]), w = r[f * 2], t.opt_len += w * (d + h), i && (t.static_len += w * (a[f * 2 + 1] + h)));
  if (p !== 0) {
    do {
      for (d = l - 1; t.bl_count[d] === 0; )
        d--;
      t.bl_count[d]--, t.bl_count[d + 1] += 2, t.bl_count[l]--, p -= 2;
    } while (p > 0);
    for (d = l; d !== 0; d--)
      for (f = t.bl_count[d]; f !== 0; )
        u = t.heap[--c], !(u > n) && (r[u * 2 + 1] !== d && (t.opt_len += (d - r[u * 2 + 1]) * r[u * 2], r[u * 2 + 1] = d), f--);
  }
}
function Ks(t, e, r) {
  var n = new Array(we + 1), a = 0, i, o;
  for (i = 1; i <= we; i++)
    n[i] = a = a + r[i - 1] << 1;
  for (o = 0; o <= e; o++) {
    var s = t[o * 2 + 1];
    s !== 0 && (t[o * 2] = Xs(n[s]++, s));
  }
}
function Yd() {
  var t, e, r, n, a, i = new Array(we + 1);
  for (r = 0, n = 0; n < di - 1; n++)
    for (pi[n] = r, t = 0; t < 1 << Va[n]; t++)
      gr[r++] = n;
  for (gr[r - 1] = n, a = 0, n = 0; n < 16; n++)
    for (kn[n] = a, t = 0; t < 1 << mn[n]; t++)
      mr[a++] = n;
  for (a >>= 7; n < Ne; n++)
    for (kn[n] = a << 7, t = 0; t < 1 << mn[n] - 7; t++)
      mr[256 + a++] = n;
  for (e = 0; e <= we; e++)
    i[e] = 0;
  for (t = 0; t <= 143; )
    Gt[t * 2 + 1] = 8, t++, i[8]++;
  for (; t <= 255; )
    Gt[t * 2 + 1] = 9, t++, i[9]++;
  for (; t <= 279; )
    Gt[t * 2 + 1] = 7, t++, i[7]++;
  for (; t <= 287; )
    Gt[t * 2 + 1] = 8, t++, i[8]++;
  for (Ks(Gt, pr + 1, i), t = 0; t < Ne; t++)
    cr[t * 2 + 1] = 5, cr[t * 2] = Xs(t, 5);
  Ws = new va(Gt, Va, Pr + 1, pr, we), qs = new va(cr, mn, 0, Ne, we), Zs = new va(new Array(0), Zd, 0, hi, qd);
}
function Ys(t) {
  var e;
  for (e = 0; e < pr; e++)
    t.dyn_ltree[e * 2] = 0;
  for (e = 0; e < Ne; e++)
    t.dyn_dtree[e * 2] = 0;
  for (e = 0; e < hi; e++)
    t.bl_tree[e * 2] = 0;
  t.dyn_ltree[wi * 2] = 1, t.opt_len = t.static_len = 0, t.last_lit = t.matches = 0;
}
function Js(t) {
  t.bi_valid > 8 ? yr(t, t.bi_buf) : t.bi_valid > 0 && (t.pending_buf[t.pending++] = t.bi_buf), t.bi_buf = 0, t.bi_valid = 0;
}
function Jd(t, e, r, n) {
  Js(t), yr(t, r), yr(t, ~r), Ud.arraySet(t.pending_buf, t.window, e, r, t.pending), t.pending += r;
}
function ao(t, e, r, n) {
  var a = e * 2, i = r * 2;
  return t[a] < t[i] || t[a] === t[i] && n[e] <= n[r];
}
function Ea(t, e, r) {
  for (var n = t.heap[r], a = r << 1; a <= t.heap_len && (a < t.heap_len && ao(e, t.heap[a + 1], t.heap[a], t.depth) && a++, !ao(e, n, t.heap[a], t.depth)); )
    t.heap[r] = t.heap[a], r = a, a <<= 1;
  t.heap[r] = n;
}
function io(t, e, r) {
  var n, a, i = 0, o, s;
  if (t.last_lit !== 0)
    do
      n = t.pending_buf[t.d_buf + i * 2] << 8 | t.pending_buf[t.d_buf + i * 2 + 1], a = t.pending_buf[t.l_buf + i], i++, n === 0 ? jt(t, a, e) : (o = gr[a], jt(t, o + Pr + 1, e), s = Va[o], s !== 0 && (a -= pi[o], ft(t, a, s)), n--, o = Vs(n), jt(t, o, r), s = mn[o], s !== 0 && (n -= kn[o], ft(t, n, s)));
    while (i < t.last_lit);
  jt(t, wi, e);
}
function Xa(t, e) {
  var r = e.dyn_tree, n = e.stat_desc.static_tree, a = e.stat_desc.has_stree, i = e.stat_desc.elems, o, s, l = -1, c;
  for (t.heap_len = 0, t.heap_max = Ms, o = 0; o < i; o++)
    r[o * 2] !== 0 ? (t.heap[++t.heap_len] = l = o, t.depth[o] = 0) : r[o * 2 + 1] = 0;
  for (; t.heap_len < 2; )
    c = t.heap[++t.heap_len] = l < 2 ? ++l : 0, r[c * 2] = 1, t.depth[c] = 0, t.opt_len--, a && (t.static_len -= n[c * 2 + 1]);
  for (e.max_code = l, o = t.heap_len >> 1; o >= 1; o--)
    Ea(t, r, o);
  c = i;
  do
    o = t.heap[
      1
      /*SMALLEST*/
    ], t.heap[
      1
      /*SMALLEST*/
    ] = t.heap[t.heap_len--], Ea(
      t,
      r,
      1
      /*SMALLEST*/
    ), s = t.heap[
      1
      /*SMALLEST*/
    ], t.heap[--t.heap_max] = o, t.heap[--t.heap_max] = s, r[c * 2] = r[o * 2] + r[s * 2], t.depth[c] = (t.depth[o] >= t.depth[s] ? t.depth[o] : t.depth[s]) + 1, r[o * 2 + 1] = r[s * 2 + 1] = c, t.heap[
      1
      /*SMALLEST*/
    ] = c++, Ea(
      t,
      r,
      1
      /*SMALLEST*/
    );
  while (t.heap_len >= 2);
  t.heap[--t.heap_max] = t.heap[
    1
    /*SMALLEST*/
  ], Kd(t, e), Ks(r, l, t.bl_count);
}
function oo(t, e, r) {
  var n, a = -1, i, o = e[0 * 2 + 1], s = 0, l = 7, c = 4;
  for (o === 0 && (l = 138, c = 3), e[(r + 1) * 2 + 1] = 65535, n = 0; n <= r; n++)
    i = o, o = e[(n + 1) * 2 + 1], !(++s < l && i === o) && (s < c ? t.bl_tree[i * 2] += s : i !== 0 ? (i !== a && t.bl_tree[i * 2]++, t.bl_tree[zs * 2]++) : s <= 10 ? t.bl_tree[Ls * 2]++ : t.bl_tree[Hs * 2]++, s = 0, a = i, o === 0 ? (l = 138, c = 3) : i === o ? (l = 6, c = 3) : (l = 7, c = 4));
}
function so(t, e, r) {
  var n, a = -1, i, o = e[0 * 2 + 1], s = 0, l = 7, c = 4;
  for (o === 0 && (l = 138, c = 3), n = 0; n <= r; n++)
    if (i = o, o = e[(n + 1) * 2 + 1], !(++s < l && i === o)) {
      if (s < c)
        do
          jt(t, i, t.bl_tree);
        while (--s !== 0);
      else i !== 0 ? (i !== a && (jt(t, i, t.bl_tree), s--), jt(t, zs, t.bl_tree), ft(t, s - 3, 2)) : s <= 10 ? (jt(t, Ls, t.bl_tree), ft(t, s - 3, 3)) : (jt(t, Hs, t.bl_tree), ft(t, s - 11, 7));
      s = 0, a = i, o === 0 ? (l = 138, c = 3) : i === o ? (l = 6, c = 3) : (l = 7, c = 4);
    }
}
function Qd(t) {
  var e;
  for (oo(t, t.dyn_ltree, t.l_desc.max_code), oo(t, t.dyn_dtree, t.d_desc.max_code), Xa(t, t.bl_desc), e = hi - 1; e >= 3 && t.bl_tree[Gs[e] * 2 + 1] === 0; e--)
    ;
  return t.opt_len += 3 * (e + 1) + 5 + 5 + 4, e;
}
function th(t, e, r, n) {
  var a;
  for (ft(t, e - 257, 5), ft(t, r - 1, 5), ft(t, n - 4, 4), a = 0; a < n; a++)
    ft(t, t.bl_tree[Gs[a] * 2 + 1], 3);
  so(t, t.dyn_ltree, e - 1), so(t, t.dyn_dtree, r - 1);
}
function eh(t) {
  var e = 4093624447, r;
  for (r = 0; r <= 31; r++, e >>>= 1)
    if (e & 1 && t.dyn_ltree[r * 2] !== 0)
      return ro;
  if (t.dyn_ltree[9 * 2] !== 0 || t.dyn_ltree[10 * 2] !== 0 || t.dyn_ltree[13 * 2] !== 0)
    return no;
  for (r = 32; r < Pr; r++)
    if (t.dyn_ltree[r * 2] !== 0)
      return no;
  return ro;
}
var co = !1;
function rh(t) {
  co || (Yd(), co = !0), t.l_desc = new xa(t.dyn_ltree, Ws), t.d_desc = new xa(t.dyn_dtree, qs), t.bl_desc = new xa(t.bl_tree, Zs), t.bi_buf = 0, t.bi_valid = 0, Ys(t);
}
function Qs(t, e, r, n) {
  ft(t, (Ld << 1) + (n ? 1 : 0), 3), Jd(t, e, r);
}
function nh(t) {
  ft(t, Us << 1, 3), jt(t, wi, Gt), Xd(t);
}
function ah(t, e, r, n) {
  var a, i, o = 0;
  t.level > 0 ? (t.strm.data_type === zd && (t.strm.data_type = eh(t)), Xa(t, t.l_desc), Xa(t, t.d_desc), o = Qd(t), a = t.opt_len + 3 + 7 >>> 3, i = t.static_len + 3 + 7 >>> 3, i <= a && (a = i)) : a = i = r + 5, r + 4 <= a && e !== -1 ? Qs(t, e, r, n) : t.strategy === Md || i === a ? (ft(t, (Us << 1) + (n ? 1 : 0), 3), io(t, Gt, cr)) : (ft(t, (Hd << 1) + (n ? 1 : 0), 3), th(t, t.l_desc.max_code + 1, t.d_desc.max_code + 1, o + 1), io(t, t.dyn_ltree, t.dyn_dtree)), Ys(t), n && Js(t);
}
function ih(t, e, r) {
  return t.pending_buf[t.d_buf + t.last_lit * 2] = e >>> 8 & 255, t.pending_buf[t.d_buf + t.last_lit * 2 + 1] = e & 255, t.pending_buf[t.l_buf + t.last_lit] = r & 255, t.last_lit++, e === 0 ? t.dyn_ltree[r * 2]++ : (t.matches++, e--, t.dyn_ltree[(gr[r] + Pr + 1) * 2]++, t.dyn_dtree[Vs(e) * 2]++), t.last_lit === t.lit_bufsize - 1;
}
qe._tr_init = rh;
qe._tr_stored_block = Qs;
qe._tr_flush_block = ah;
qe._tr_tally = ih;
qe._tr_align = nh;
function oh(t, e, r, n) {
  for (var a = t & 65535 | 0, i = t >>> 16 & 65535 | 0, o = 0; r !== 0; ) {
    o = r > 2e3 ? 2e3 : r, r -= o;
    do
      a = a + e[n++] | 0, i = i + a | 0;
    while (--o);
    a %= 65521, i %= 65521;
  }
  return a | i << 16 | 0;
}
var tc = oh;
function sh() {
  for (var t, e = [], r = 0; r < 256; r++) {
    t = r;
    for (var n = 0; n < 8; n++)
      t = t & 1 ? 3988292384 ^ t >>> 1 : t >>> 1;
    e[r] = t;
  }
  return e;
}
var ch = sh();
function fh(t, e, r, n) {
  var a = ch, i = n + r;
  t ^= -1;
  for (var o = n; o < i; o++)
    t = t >>> 8 ^ a[(t ^ e[o]) & 255];
  return t ^ -1;
}
var ec = fh, mi = {
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
}, ot = Xt, bt = qe, rc = tc, Jt = ec, lh = mi, ke = 0, uh = 1, dh = 3, ae = 4, fo = 5, Ut = 0, lo = 1, vt = -2, hh = -3, Sa = -5, wh = -1, ph = 1, an = 2, mh = 3, gh = 4, yh = 0, _h = 2, Mn = 8, bh = 9, vh = 15, xh = 8, Eh = 29, Sh = 256, Ka = Sh + 1 + Eh, kh = 30, Ah = 19, $h = 2 * Ka + 1, Rh = 15, M = 3, ee = 258, At = ee + M + 1, Oh = 32, zn = 42, Ya = 69, gn = 73, yn = 91, _n = 103, pe = 113, sr = 666, tt = 1, Br = 2, ye = 3, Ve = 4, Th = 3;
function re(t, e) {
  return t.msg = lh[e], e;
}
function uo(t) {
  return (t << 1) - (t > 4 ? 9 : 0);
}
function te(t) {
  for (var e = t.length; --e >= 0; )
    t[e] = 0;
}
function Qt(t) {
  var e = t.state, r = e.pending;
  r > t.avail_out && (r = t.avail_out), r !== 0 && (ot.arraySet(t.output, e.pending_buf, e.pending_out, r, t.next_out), t.next_out += r, e.pending_out += r, t.total_out += r, t.avail_out -= r, e.pending -= r, e.pending === 0 && (e.pending_out = 0));
}
function nt(t, e) {
  bt._tr_flush_block(t, t.block_start >= 0 ? t.block_start : -1, t.strstart - t.block_start, e), t.block_start = t.strstart, Qt(t.strm);
}
function z(t, e) {
  t.pending_buf[t.pending++] = e;
}
function ir(t, e) {
  t.pending_buf[t.pending++] = e >>> 8 & 255, t.pending_buf[t.pending++] = e & 255;
}
function Ih(t, e, r, n) {
  var a = t.avail_in;
  return a > n && (a = n), a === 0 ? 0 : (t.avail_in -= a, ot.arraySet(e, t.input, t.next_in, a, r), t.state.wrap === 1 ? t.adler = rc(t.adler, e, a, r) : t.state.wrap === 2 && (t.adler = Jt(t.adler, e, a, r)), t.next_in += a, t.total_in += a, a);
}
function nc(t, e) {
  var r = t.max_chain_length, n = t.strstart, a, i, o = t.prev_length, s = t.nice_match, l = t.strstart > t.w_size - At ? t.strstart - (t.w_size - At) : 0, c = t.window, f = t.w_mask, u = t.prev, d = t.strstart + ee, h = c[n + o - 1], w = c[n + o];
  t.prev_length >= t.good_match && (r >>= 2), s > t.lookahead && (s = t.lookahead);
  do
    if (a = e, !(c[a + o] !== w || c[a + o - 1] !== h || c[a] !== c[n] || c[++a] !== c[n + 1])) {
      n += 2, a++;
      do
        ;
      while (c[++n] === c[++a] && c[++n] === c[++a] && c[++n] === c[++a] && c[++n] === c[++a] && c[++n] === c[++a] && c[++n] === c[++a] && c[++n] === c[++a] && c[++n] === c[++a] && n < d);
      if (i = ee - (d - n), n = d - ee, i > o) {
        if (t.match_start = e, o = i, i >= s)
          break;
        h = c[n + o - 1], w = c[n + o];
      }
    }
  while ((e = u[e & f]) > l && --r !== 0);
  return o <= t.lookahead ? o : t.lookahead;
}
function _e(t) {
  var e = t.w_size, r, n, a, i, o;
  do {
    if (i = t.window_size - t.lookahead - t.strstart, t.strstart >= e + (e - At)) {
      ot.arraySet(t.window, t.window, e, e, 0), t.match_start -= e, t.strstart -= e, t.block_start -= e, n = t.hash_size, r = n;
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
    if (n = Ih(t.strm, t.window, t.strstart + t.lookahead, i), t.lookahead += n, t.lookahead + t.insert >= M)
      for (o = t.strstart - t.insert, t.ins_h = t.window[o], t.ins_h = (t.ins_h << t.hash_shift ^ t.window[o + 1]) & t.hash_mask; t.insert && (t.ins_h = (t.ins_h << t.hash_shift ^ t.window[o + M - 1]) & t.hash_mask, t.prev[o & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = o, o++, t.insert--, !(t.lookahead + t.insert < M)); )
        ;
  } while (t.lookahead < At && t.strm.avail_in !== 0);
}
function Ph(t, e) {
  var r = 65535;
  for (r > t.pending_buf_size - 5 && (r = t.pending_buf_size - 5); ; ) {
    if (t.lookahead <= 1) {
      if (_e(t), t.lookahead === 0 && e === ke)
        return tt;
      if (t.lookahead === 0)
        break;
    }
    t.strstart += t.lookahead, t.lookahead = 0;
    var n = t.block_start + r;
    if ((t.strstart === 0 || t.strstart >= n) && (t.lookahead = t.strstart - n, t.strstart = n, nt(t, !1), t.strm.avail_out === 0) || t.strstart - t.block_start >= t.w_size - At && (nt(t, !1), t.strm.avail_out === 0))
      return tt;
  }
  return t.insert = 0, e === ae ? (nt(t, !0), t.strm.avail_out === 0 ? ye : Ve) : (t.strstart > t.block_start && (nt(t, !1), t.strm.avail_out === 0), tt);
}
function ka(t, e) {
  for (var r, n; ; ) {
    if (t.lookahead < At) {
      if (_e(t), t.lookahead < At && e === ke)
        return tt;
      if (t.lookahead === 0)
        break;
    }
    if (r = 0, t.lookahead >= M && (t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + M - 1]) & t.hash_mask, r = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart), r !== 0 && t.strstart - r <= t.w_size - At && (t.match_length = nc(t, r)), t.match_length >= M)
      if (n = bt._tr_tally(t, t.strstart - t.match_start, t.match_length - M), t.lookahead -= t.match_length, t.match_length <= t.max_lazy_match && t.lookahead >= M) {
        t.match_length--;
        do
          t.strstart++, t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + M - 1]) & t.hash_mask, r = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart;
        while (--t.match_length !== 0);
        t.strstart++;
      } else
        t.strstart += t.match_length, t.match_length = 0, t.ins_h = t.window[t.strstart], t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + 1]) & t.hash_mask;
    else
      n = bt._tr_tally(t, 0, t.window[t.strstart]), t.lookahead--, t.strstart++;
    if (n && (nt(t, !1), t.strm.avail_out === 0))
      return tt;
  }
  return t.insert = t.strstart < M - 1 ? t.strstart : M - 1, e === ae ? (nt(t, !0), t.strm.avail_out === 0 ? ye : Ve) : t.last_lit && (nt(t, !1), t.strm.avail_out === 0) ? tt : Br;
}
function Ie(t, e) {
  for (var r, n, a; ; ) {
    if (t.lookahead < At) {
      if (_e(t), t.lookahead < At && e === ke)
        return tt;
      if (t.lookahead === 0)
        break;
    }
    if (r = 0, t.lookahead >= M && (t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + M - 1]) & t.hash_mask, r = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart), t.prev_length = t.match_length, t.prev_match = t.match_start, t.match_length = M - 1, r !== 0 && t.prev_length < t.max_lazy_match && t.strstart - r <= t.w_size - At && (t.match_length = nc(t, r), t.match_length <= 5 && (t.strategy === ph || t.match_length === M && t.strstart - t.match_start > 4096) && (t.match_length = M - 1)), t.prev_length >= M && t.match_length <= t.prev_length) {
      a = t.strstart + t.lookahead - M, n = bt._tr_tally(t, t.strstart - 1 - t.prev_match, t.prev_length - M), t.lookahead -= t.prev_length - 1, t.prev_length -= 2;
      do
        ++t.strstart <= a && (t.ins_h = (t.ins_h << t.hash_shift ^ t.window[t.strstart + M - 1]) & t.hash_mask, r = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart);
      while (--t.prev_length !== 0);
      if (t.match_available = 0, t.match_length = M - 1, t.strstart++, n && (nt(t, !1), t.strm.avail_out === 0))
        return tt;
    } else if (t.match_available) {
      if (n = bt._tr_tally(t, 0, t.window[t.strstart - 1]), n && nt(t, !1), t.strstart++, t.lookahead--, t.strm.avail_out === 0)
        return tt;
    } else
      t.match_available = 1, t.strstart++, t.lookahead--;
  }
  return t.match_available && (n = bt._tr_tally(t, 0, t.window[t.strstart - 1]), t.match_available = 0), t.insert = t.strstart < M - 1 ? t.strstart : M - 1, e === ae ? (nt(t, !0), t.strm.avail_out === 0 ? ye : Ve) : t.last_lit && (nt(t, !1), t.strm.avail_out === 0) ? tt : Br;
}
function Bh(t, e) {
  for (var r, n, a, i, o = t.window; ; ) {
    if (t.lookahead <= ee) {
      if (_e(t), t.lookahead <= ee && e === ke)
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
    if (t.match_length >= M ? (r = bt._tr_tally(t, 1, t.match_length - M), t.lookahead -= t.match_length, t.strstart += t.match_length, t.match_length = 0) : (r = bt._tr_tally(t, 0, t.window[t.strstart]), t.lookahead--, t.strstart++), r && (nt(t, !1), t.strm.avail_out === 0))
      return tt;
  }
  return t.insert = 0, e === ae ? (nt(t, !0), t.strm.avail_out === 0 ? ye : Ve) : t.last_lit && (nt(t, !1), t.strm.avail_out === 0) ? tt : Br;
}
function Ch(t, e) {
  for (var r; ; ) {
    if (t.lookahead === 0 && (_e(t), t.lookahead === 0)) {
      if (e === ke)
        return tt;
      break;
    }
    if (t.match_length = 0, r = bt._tr_tally(t, 0, t.window[t.strstart]), t.lookahead--, t.strstart++, r && (nt(t, !1), t.strm.avail_out === 0))
      return tt;
  }
  return t.insert = 0, e === ae ? (nt(t, !0), t.strm.avail_out === 0 ? ye : Ve) : t.last_lit && (nt(t, !1), t.strm.avail_out === 0) ? tt : Br;
}
function Bt(t, e, r, n, a) {
  this.good_length = t, this.max_lazy = e, this.nice_length = r, this.max_chain = n, this.func = a;
}
var Ce;
Ce = [
  /*      good lazy nice chain */
  new Bt(0, 0, 0, 0, Ph),
  /* 0 store only */
  new Bt(4, 4, 8, 4, ka),
  /* 1 max speed, no lazy matches */
  new Bt(4, 5, 16, 8, ka),
  /* 2 */
  new Bt(4, 6, 32, 32, ka),
  /* 3 */
  new Bt(4, 4, 16, 16, Ie),
  /* 4 lazy matches */
  new Bt(8, 16, 32, 32, Ie),
  /* 5 */
  new Bt(8, 16, 128, 128, Ie),
  /* 6 */
  new Bt(8, 32, 128, 256, Ie),
  /* 7 */
  new Bt(32, 128, 258, 1024, Ie),
  /* 8 */
  new Bt(32, 258, 258, 4096, Ie)
  /* 9 max compression */
];
function Dh(t) {
  t.window_size = 2 * t.w_size, te(t.head), t.max_lazy_match = Ce[t.level].max_lazy, t.good_match = Ce[t.level].good_length, t.nice_match = Ce[t.level].nice_length, t.max_chain_length = Ce[t.level].max_chain, t.strstart = 0, t.block_start = 0, t.lookahead = 0, t.insert = 0, t.match_length = t.prev_length = M - 1, t.match_available = 0, t.ins_h = 0;
}
function Nh() {
  this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = Mn, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new ot.Buf16($h * 2), this.dyn_dtree = new ot.Buf16((2 * kh + 1) * 2), this.bl_tree = new ot.Buf16((2 * Ah + 1) * 2), te(this.dyn_ltree), te(this.dyn_dtree), te(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new ot.Buf16(Rh + 1), this.heap = new ot.Buf16(2 * Ka + 1), te(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new ot.Buf16(2 * Ka + 1), te(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
}
function ac(t) {
  var e;
  return !t || !t.state ? re(t, vt) : (t.total_in = t.total_out = 0, t.data_type = _h, e = t.state, e.pending = 0, e.pending_out = 0, e.wrap < 0 && (e.wrap = -e.wrap), e.status = e.wrap ? zn : pe, t.adler = e.wrap === 2 ? 0 : 1, e.last_flush = ke, bt._tr_init(e), Ut);
}
function ic(t) {
  var e = ac(t);
  return e === Ut && Dh(t.state), e;
}
function Fh(t, e) {
  return !t || !t.state || t.state.wrap !== 2 ? vt : (t.state.gzhead = e, Ut);
}
function oc(t, e, r, n, a, i) {
  if (!t)
    return vt;
  var o = 1;
  if (e === wh && (e = 6), n < 0 ? (o = 0, n = -n) : n > 15 && (o = 2, n -= 16), a < 1 || a > bh || r !== Mn || n < 8 || n > 15 || e < 0 || e > 9 || i < 0 || i > gh)
    return re(t, vt);
  n === 8 && (n = 9);
  var s = new Nh();
  return t.state = s, s.strm = t, s.wrap = o, s.gzhead = null, s.w_bits = n, s.w_size = 1 << s.w_bits, s.w_mask = s.w_size - 1, s.hash_bits = a + 7, s.hash_size = 1 << s.hash_bits, s.hash_mask = s.hash_size - 1, s.hash_shift = ~~((s.hash_bits + M - 1) / M), s.window = new ot.Buf8(s.w_size * 2), s.head = new ot.Buf16(s.hash_size), s.prev = new ot.Buf16(s.w_size), s.lit_bufsize = 1 << a + 6, s.pending_buf_size = s.lit_bufsize * 4, s.pending_buf = new ot.Buf8(s.pending_buf_size), s.d_buf = 1 * s.lit_bufsize, s.l_buf = 3 * s.lit_bufsize, s.level = e, s.strategy = i, s.method = r, ic(t);
}
function jh(t, e) {
  return oc(t, e, Mn, vh, xh, yh);
}
function Uh(t, e) {
  var r, n, a, i;
  if (!t || !t.state || e > fo || e < 0)
    return t ? re(t, vt) : vt;
  if (n = t.state, !t.output || !t.input && t.avail_in !== 0 || n.status === sr && e !== ae)
    return re(t, t.avail_out === 0 ? Sa : vt);
  if (n.strm = t, r = n.last_flush, n.last_flush = e, n.status === zn)
    if (n.wrap === 2)
      t.adler = 0, z(n, 31), z(n, 139), z(n, 8), n.gzhead ? (z(
        n,
        (n.gzhead.text ? 1 : 0) + (n.gzhead.hcrc ? 2 : 0) + (n.gzhead.extra ? 4 : 0) + (n.gzhead.name ? 8 : 0) + (n.gzhead.comment ? 16 : 0)
      ), z(n, n.gzhead.time & 255), z(n, n.gzhead.time >> 8 & 255), z(n, n.gzhead.time >> 16 & 255), z(n, n.gzhead.time >> 24 & 255), z(n, n.level === 9 ? 2 : n.strategy >= an || n.level < 2 ? 4 : 0), z(n, n.gzhead.os & 255), n.gzhead.extra && n.gzhead.extra.length && (z(n, n.gzhead.extra.length & 255), z(n, n.gzhead.extra.length >> 8 & 255)), n.gzhead.hcrc && (t.adler = Jt(t.adler, n.pending_buf, n.pending, 0)), n.gzindex = 0, n.status = Ya) : (z(n, 0), z(n, 0), z(n, 0), z(n, 0), z(n, 0), z(n, n.level === 9 ? 2 : n.strategy >= an || n.level < 2 ? 4 : 0), z(n, Th), n.status = pe);
    else {
      var o = Mn + (n.w_bits - 8 << 4) << 8, s = -1;
      n.strategy >= an || n.level < 2 ? s = 0 : n.level < 6 ? s = 1 : n.level === 6 ? s = 2 : s = 3, o |= s << 6, n.strstart !== 0 && (o |= Oh), o += 31 - o % 31, n.status = pe, ir(n, o), n.strstart !== 0 && (ir(n, t.adler >>> 16), ir(n, t.adler & 65535)), t.adler = 1;
    }
  if (n.status === Ya)
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
  if (n.status === _n && (n.gzhead.hcrc ? (n.pending + 2 > n.pending_buf_size && Qt(t), n.pending + 2 <= n.pending_buf_size && (z(n, t.adler & 255), z(n, t.adler >> 8 & 255), t.adler = 0, n.status = pe)) : n.status = pe), n.pending !== 0) {
    if (Qt(t), t.avail_out === 0)
      return n.last_flush = -1, Ut;
  } else if (t.avail_in === 0 && uo(e) <= uo(r) && e !== ae)
    return re(t, Sa);
  if (n.status === sr && t.avail_in !== 0)
    return re(t, Sa);
  if (t.avail_in !== 0 || n.lookahead !== 0 || e !== ke && n.status !== sr) {
    var l = n.strategy === an ? Ch(n, e) : n.strategy === mh ? Bh(n, e) : Ce[n.level].func(n, e);
    if ((l === ye || l === Ve) && (n.status = sr), l === tt || l === ye)
      return t.avail_out === 0 && (n.last_flush = -1), Ut;
    if (l === Br && (e === uh ? bt._tr_align(n) : e !== fo && (bt._tr_stored_block(n, 0, 0, !1), e === dh && (te(n.head), n.lookahead === 0 && (n.strstart = 0, n.block_start = 0, n.insert = 0))), Qt(t), t.avail_out === 0))
      return n.last_flush = -1, Ut;
  }
  return e !== ae ? Ut : n.wrap <= 0 ? lo : (n.wrap === 2 ? (z(n, t.adler & 255), z(n, t.adler >> 8 & 255), z(n, t.adler >> 16 & 255), z(n, t.adler >> 24 & 255), z(n, t.total_in & 255), z(n, t.total_in >> 8 & 255), z(n, t.total_in >> 16 & 255), z(n, t.total_in >> 24 & 255)) : (ir(n, t.adler >>> 16), ir(n, t.adler & 65535)), Qt(t), n.wrap > 0 && (n.wrap = -n.wrap), n.pending !== 0 ? Ut : lo);
}
function Mh(t) {
  var e;
  return !t || !t.state ? vt : (e = t.state.status, e !== zn && e !== Ya && e !== gn && e !== yn && e !== _n && e !== pe && e !== sr ? re(t, vt) : (t.state = null, e === pe ? re(t, hh) : Ut));
}
function zh(t, e) {
  var r = e.length, n, a, i, o, s, l, c, f;
  if (!t || !t.state || (n = t.state, o = n.wrap, o === 2 || o === 1 && n.status !== zn || n.lookahead))
    return vt;
  for (o === 1 && (t.adler = rc(t.adler, e, r, 0)), n.wrap = 0, r >= n.w_size && (o === 0 && (te(n.head), n.strstart = 0, n.block_start = 0, n.insert = 0), f = new ot.Buf8(n.w_size), ot.arraySet(f, e, r - n.w_size, n.w_size, 0), e = f, r = n.w_size), s = t.avail_in, l = t.next_in, c = t.input, t.avail_in = r, t.next_in = 0, t.input = e, _e(n); n.lookahead >= M; ) {
    a = n.strstart, i = n.lookahead - (M - 1);
    do
      n.ins_h = (n.ins_h << n.hash_shift ^ n.window[a + M - 1]) & n.hash_mask, n.prev[a & n.w_mask] = n.head[n.ins_h], n.head[n.ins_h] = a, a++;
    while (--i);
    n.strstart = a, n.lookahead = M - 1, _e(n);
  }
  return n.strstart += n.lookahead, n.block_start = n.strstart, n.insert = n.lookahead, n.lookahead = 0, n.match_length = n.prev_length = M - 1, n.match_available = 0, t.next_in = l, t.input = c, t.avail_in = s, n.wrap = o, Ut;
}
Lt.deflateInit = jh;
Lt.deflateInit2 = oc;
Lt.deflateReset = ic;
Lt.deflateResetKeep = ac;
Lt.deflateSetHeader = Fh;
Lt.deflate = Uh;
Lt.deflateEnd = Mh;
Lt.deflateSetDictionary = zh;
Lt.deflateInfo = "pako deflate (from Nodeca project)";
var Ae = {}, Ln = Xt, sc = !0, cc = !0;
try {
  String.fromCharCode.apply(null, [0]);
} catch {
  sc = !1;
}
try {
  String.fromCharCode.apply(null, new Uint8Array(1));
} catch {
  cc = !1;
}
var _r = new Ln.Buf8(256);
for (var Kt = 0; Kt < 256; Kt++)
  _r[Kt] = Kt >= 252 ? 6 : Kt >= 248 ? 5 : Kt >= 240 ? 4 : Kt >= 224 ? 3 : Kt >= 192 ? 2 : 1;
_r[254] = _r[254] = 1;
Ae.string2buf = function(t) {
  var e, r, n, a, i, o = t.length, s = 0;
  for (a = 0; a < o; a++)
    r = t.charCodeAt(a), (r & 64512) === 55296 && a + 1 < o && (n = t.charCodeAt(a + 1), (n & 64512) === 56320 && (r = 65536 + (r - 55296 << 10) + (n - 56320), a++)), s += r < 128 ? 1 : r < 2048 ? 2 : r < 65536 ? 3 : 4;
  for (e = new Ln.Buf8(s), i = 0, a = 0; i < s; a++)
    r = t.charCodeAt(a), (r & 64512) === 55296 && a + 1 < o && (n = t.charCodeAt(a + 1), (n & 64512) === 56320 && (r = 65536 + (r - 55296 << 10) + (n - 56320), a++)), r < 128 ? e[i++] = r : r < 2048 ? (e[i++] = 192 | r >>> 6, e[i++] = 128 | r & 63) : r < 65536 ? (e[i++] = 224 | r >>> 12, e[i++] = 128 | r >>> 6 & 63, e[i++] = 128 | r & 63) : (e[i++] = 240 | r >>> 18, e[i++] = 128 | r >>> 12 & 63, e[i++] = 128 | r >>> 6 & 63, e[i++] = 128 | r & 63);
  return e;
};
function fc(t, e) {
  if (e < 65534 && (t.subarray && cc || !t.subarray && sc))
    return String.fromCharCode.apply(null, Ln.shrinkBuf(t, e));
  for (var r = "", n = 0; n < e; n++)
    r += String.fromCharCode(t[n]);
  return r;
}
Ae.buf2binstring = function(t) {
  return fc(t, t.length);
};
Ae.binstring2buf = function(t) {
  for (var e = new Ln.Buf8(t.length), r = 0, n = e.length; r < n; r++)
    e[r] = t.charCodeAt(r);
  return e;
};
Ae.buf2string = function(t, e) {
  var r, n, a, i, o = e || t.length, s = new Array(o * 2);
  for (n = 0, r = 0; r < o; ) {
    if (a = t[r++], a < 128) {
      s[n++] = a;
      continue;
    }
    if (i = _r[a], i > 4) {
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
  return fc(s, n);
};
Ae.utf8border = function(t, e) {
  var r;
  for (e = e || t.length, e > t.length && (e = t.length), r = e - 1; r >= 0 && (t[r] & 192) === 128; )
    r--;
  return r < 0 || r === 0 ? e : r + _r[t[r]] > e ? r : e;
};
function Lh() {
  this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
}
var lc = Lh, fr = Lt, lr = Xt, Ja = Ae, Qa = mi, Hh = lc, uc = Object.prototype.toString, Gh = 0, Aa = 4, Fe = 0, ho = 1, wo = 2, Wh = -1, qh = 0, Zh = 8;
function be(t) {
  if (!(this instanceof be)) return new be(t);
  this.options = lr.assign({
    level: Wh,
    method: Zh,
    chunkSize: 16384,
    windowBits: 15,
    memLevel: 8,
    strategy: qh,
    to: ""
  }, t || {});
  var e = this.options;
  e.raw && e.windowBits > 0 ? e.windowBits = -e.windowBits : e.gzip && e.windowBits > 0 && e.windowBits < 16 && (e.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new Hh(), this.strm.avail_out = 0;
  var r = fr.deflateInit2(
    this.strm,
    e.level,
    e.method,
    e.windowBits,
    e.memLevel,
    e.strategy
  );
  if (r !== Fe)
    throw new Error(Qa[r]);
  if (e.header && fr.deflateSetHeader(this.strm, e.header), e.dictionary) {
    var n;
    if (typeof e.dictionary == "string" ? n = Ja.string2buf(e.dictionary) : uc.call(e.dictionary) === "[object ArrayBuffer]" ? n = new Uint8Array(e.dictionary) : n = e.dictionary, r = fr.deflateSetDictionary(this.strm, n), r !== Fe)
      throw new Error(Qa[r]);
    this._dict_set = !0;
  }
}
be.prototype.push = function(t, e) {
  var r = this.strm, n = this.options.chunkSize, a, i;
  if (this.ended)
    return !1;
  i = e === ~~e ? e : e === !0 ? Aa : Gh, typeof t == "string" ? r.input = Ja.string2buf(t) : uc.call(t) === "[object ArrayBuffer]" ? r.input = new Uint8Array(t) : r.input = t, r.next_in = 0, r.avail_in = r.input.length;
  do {
    if (r.avail_out === 0 && (r.output = new lr.Buf8(n), r.next_out = 0, r.avail_out = n), a = fr.deflate(r, i), a !== ho && a !== Fe)
      return this.onEnd(a), this.ended = !0, !1;
    (r.avail_out === 0 || r.avail_in === 0 && (i === Aa || i === wo)) && (this.options.to === "string" ? this.onData(Ja.buf2binstring(lr.shrinkBuf(r.output, r.next_out))) : this.onData(lr.shrinkBuf(r.output, r.next_out)));
  } while ((r.avail_in > 0 || r.avail_out === 0) && a !== ho);
  return i === Aa ? (a = fr.deflateEnd(this.strm), this.onEnd(a), this.ended = !0, a === Fe) : (i === wo && (this.onEnd(Fe), r.avail_out = 0), !0);
};
be.prototype.onData = function(t) {
  this.chunks.push(t);
};
be.prototype.onEnd = function(t) {
  t === Fe && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = lr.flattenChunks(this.chunks)), this.chunks = [], this.err = t, this.msg = this.strm.msg;
};
function gi(t, e) {
  var r = new be(e);
  if (r.push(t, !0), r.err)
    throw r.msg || Qa[r.err];
  return r.result;
}
function Vh(t, e) {
  return e = e || {}, e.raw = !0, gi(t, e);
}
function Xh(t, e) {
  return e = e || {}, e.gzip = !0, gi(t, e);
}
Ir.Deflate = be;
Ir.deflate = gi;
Ir.deflateRaw = Vh;
Ir.gzip = Xh;
var Cr = {}, Rt = {}, on = 30, Kh = 12, Yh = function(e, r) {
  var n, a, i, o, s, l, c, f, u, d, h, w, p, m, y, _, v, S, k, O, x, g, E, A, $;
  n = e.state, a = e.next_in, A = e.input, i = a + (e.avail_in - 5), o = e.next_out, $ = e.output, s = o - (r - e.avail_out), l = o + (e.avail_out - 257), c = n.dmax, f = n.wsize, u = n.whave, d = n.wnext, h = n.window, w = n.hold, p = n.bits, m = n.lencode, y = n.distcode, _ = (1 << n.lenbits) - 1, v = (1 << n.distbits) - 1;
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
                  if (x = S & 65535, k &= 15, p < k && (w += A[a++] << p, p += 8, p < k && (w += A[a++] << p, p += 8)), x += w & (1 << k) - 1, x > c) {
                    e.msg = "invalid distance too far back", n.mode = on;
                    break t;
                  }
                  if (w >>>= k, p -= k, k = o - s, x > k) {
                    if (k = x - k, k > u && n.sane) {
                      e.msg = "invalid distance too far back", n.mode = on;
                      break t;
                    }
                    if (g = 0, E = h, d === 0) {
                      if (g += f - k, k < O) {
                        O -= k;
                        do
                          $[o++] = h[g++];
                        while (--k);
                        g = o - x, E = $;
                      }
                    } else if (d < k) {
                      if (g += f + d - k, k -= d, k < O) {
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
                  e.msg = "invalid distance code", n.mode = on;
                  break t;
                } else {
                  S = y[(S & 65535) + (w & (1 << k) - 1)];
                  continue r;
                }
                break;
              }
          } else if (k & 64)
            if (k & 32) {
              n.mode = Kh;
              break t;
            } else {
              e.msg = "invalid literal/length code", n.mode = on;
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
}, po = Xt, Pe = 15, mo = 852, go = 592, yo = 0, $a = 1, _o = 2, Jh = [
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
], Qh = [
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
], t0 = [
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
], e0 = [
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
], r0 = function(e, r, n, a, i, o, s, l) {
  var c = l.bits, f = 0, u = 0, d = 0, h = 0, w = 0, p = 0, m = 0, y = 0, _ = 0, v = 0, S, k, O, x, g, E = null, A = 0, $, I = new po.Buf16(Pe + 1), B = new po.Buf16(Pe + 1), N = null, K = 0, Tt, yt, Et;
  for (f = 0; f <= Pe; f++)
    I[f] = 0;
  for (u = 0; u < a; u++)
    I[r[n + u]]++;
  for (w = c, h = Pe; h >= 1 && I[h] === 0; h--)
    ;
  if (w > h && (w = h), h === 0)
    return i[o++] = 1 << 24 | 64 << 16 | 0, i[o++] = 1 << 24 | 64 << 16 | 0, l.bits = 1, 0;
  for (d = 1; d < h && I[d] === 0; d++)
    ;
  for (w < d && (w = d), y = 1, f = 1; f <= Pe; f++)
    if (y <<= 1, y -= I[f], y < 0)
      return -1;
  if (y > 0 && (e === yo || h !== 1))
    return -1;
  for (B[1] = 0, f = 1; f < Pe; f++)
    B[f + 1] = B[f] + I[f];
  for (u = 0; u < a; u++)
    r[n + u] !== 0 && (s[B[r[n + u]]++] = u);
  if (e === yo ? (E = N = s, $ = 19) : e === $a ? (E = Jh, A -= 257, N = Qh, K -= 257, $ = 256) : (E = t0, N = e0, $ = -1), v = 0, u = 0, f = d, g = o, p = w, m = 0, O = -1, _ = 1 << w, x = _ - 1, e === $a && _ > mo || e === _o && _ > go)
    return 1;
  for (; ; ) {
    Tt = f - m, s[u] < $ ? (yt = 0, Et = s[u]) : s[u] > $ ? (yt = N[K + s[u]], Et = E[A + s[u]]) : (yt = 96, Et = 0), S = 1 << f - m, k = 1 << p, d = k;
    do
      k -= S, i[g + (v >> m) + k] = Tt << 24 | yt << 16 | Et | 0;
    while (k !== 0);
    for (S = 1 << f - 1; v & S; )
      S >>= 1;
    if (S !== 0 ? (v &= S - 1, v += S) : v = 0, u++, --I[f] === 0) {
      if (f === h)
        break;
      f = r[n + s[u]];
    }
    if (f > w && (v & x) !== O) {
      for (m === 0 && (m = w), g += d, p = f - m, y = 1 << p; p + m < h && (y -= I[p + m], !(y <= 0)); )
        p++, y <<= 1;
      if (_ += 1 << p, e === $a && _ > mo || e === _o && _ > go)
        return 1;
      O = v & x, i[O] = w << 24 | p << 16 | g - o | 0;
    }
  }
  return v !== 0 && (i[g + v] = f - m << 24 | 64 << 16 | 0), l.bits = w, 0;
}, pt = Xt, ti = tc, Ct = ec, n0 = Yh, ur = r0, a0 = 0, dc = 1, hc = 2, bo = 4, i0 = 5, sn = 6, ve = 0, o0 = 1, s0 = 2, xt = -2, wc = -3, pc = -4, c0 = -5, vo = 8, mc = 1, xo = 2, Eo = 3, So = 4, ko = 5, Ao = 6, $o = 7, Ro = 8, Oo = 9, To = 10, An = 11, Ht = 12, Ra = 13, Io = 14, Oa = 15, Po = 16, Bo = 17, Co = 18, Do = 19, cn = 20, fn = 21, No = 22, Fo = 23, jo = 24, Uo = 25, Mo = 26, Ta = 27, zo = 28, Lo = 29, W = 30, gc = 31, f0 = 32, l0 = 852, u0 = 592, d0 = 15, h0 = d0;
function Ho(t) {
  return (t >>> 24 & 255) + (t >>> 8 & 65280) + ((t & 65280) << 8) + ((t & 255) << 24);
}
function w0() {
  this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new pt.Buf16(320), this.work = new pt.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
}
function yc(t) {
  var e;
  return !t || !t.state ? xt : (e = t.state, t.total_in = t.total_out = e.total = 0, t.msg = "", e.wrap && (t.adler = e.wrap & 1), e.mode = mc, e.last = 0, e.havedict = 0, e.dmax = 32768, e.head = null, e.hold = 0, e.bits = 0, e.lencode = e.lendyn = new pt.Buf32(l0), e.distcode = e.distdyn = new pt.Buf32(u0), e.sane = 1, e.back = -1, ve);
}
function _c(t) {
  var e;
  return !t || !t.state ? xt : (e = t.state, e.wsize = 0, e.whave = 0, e.wnext = 0, yc(t));
}
function bc(t, e) {
  var r, n;
  return !t || !t.state || (n = t.state, e < 0 ? (r = 0, e = -e) : (r = (e >> 4) + 1, e < 48 && (e &= 15)), e && (e < 8 || e > 15)) ? xt : (n.window !== null && n.wbits !== e && (n.window = null), n.wrap = r, n.wbits = e, _c(t));
}
function vc(t, e) {
  var r, n;
  return t ? (n = new w0(), t.state = n, n.window = null, r = bc(t, e), r !== ve && (t.state = null), r) : xt;
}
function p0(t) {
  return vc(t, h0);
}
var Go = !0, Ia, Pa;
function m0(t) {
  if (Go) {
    var e;
    for (Ia = new pt.Buf32(512), Pa = new pt.Buf32(32), e = 0; e < 144; )
      t.lens[e++] = 8;
    for (; e < 256; )
      t.lens[e++] = 9;
    for (; e < 280; )
      t.lens[e++] = 7;
    for (; e < 288; )
      t.lens[e++] = 8;
    for (ur(dc, t.lens, 0, 288, Ia, 0, t.work, { bits: 9 }), e = 0; e < 32; )
      t.lens[e++] = 5;
    ur(hc, t.lens, 0, 32, Pa, 0, t.work, { bits: 5 }), Go = !1;
  }
  t.lencode = Ia, t.lenbits = 9, t.distcode = Pa, t.distbits = 5;
}
function xc(t, e, r, n) {
  var a, i = t.state;
  return i.window === null && (i.wsize = 1 << i.wbits, i.wnext = 0, i.whave = 0, i.window = new pt.Buf8(i.wsize)), n >= i.wsize ? (pt.arraySet(i.window, e, r - i.wsize, i.wsize, 0), i.wnext = 0, i.whave = i.wsize) : (a = i.wsize - i.wnext, a > n && (a = n), pt.arraySet(i.window, e, r - n, a, i.wnext), n -= a, n ? (pt.arraySet(i.window, e, r - n, n, 0), i.wnext = n, i.whave = i.wsize) : (i.wnext += a, i.wnext === i.wsize && (i.wnext = 0), i.whave < i.wsize && (i.whave += a))), 0;
}
function g0(t, e) {
  var r, n, a, i, o, s, l, c, f, u, d, h, w, p, m = 0, y, _, v, S, k, O, x, g, E = new pt.Buf8(4), A, $, I = (
    /* permutation of code lengths */
    [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
  );
  if (!t || !t.state || !t.output || !t.input && t.avail_in !== 0)
    return xt;
  r = t.state, r.mode === Ht && (r.mode = Ra), o = t.next_out, a = t.output, l = t.avail_out, i = t.next_in, n = t.input, s = t.avail_in, c = r.hold, f = r.bits, u = s, d = l, g = ve;
  t:
    for (; ; )
      switch (r.mode) {
        case mc:
          if (r.wrap === 0) {
            r.mode = Ra;
            break;
          }
          for (; f < 16; ) {
            if (s === 0)
              break t;
            s--, c += n[i++] << f, f += 8;
          }
          if (r.wrap & 2 && c === 35615) {
            r.check = 0, E[0] = c & 255, E[1] = c >>> 8 & 255, r.check = Ct(r.check, E, 2, 0), c = 0, f = 0, r.mode = xo;
            break;
          }
          if (r.flags = 0, r.head && (r.head.done = !1), !(r.wrap & 1) || /* check if zlib header allowed */
          (((c & 255) << 8) + (c >> 8)) % 31) {
            t.msg = "incorrect header check", r.mode = W;
            break;
          }
          if ((c & 15) !== vo) {
            t.msg = "unknown compression method", r.mode = W;
            break;
          }
          if (c >>>= 4, f -= 4, x = (c & 15) + 8, r.wbits === 0)
            r.wbits = x;
          else if (x > r.wbits) {
            t.msg = "invalid window size", r.mode = W;
            break;
          }
          r.dmax = 1 << x, t.adler = r.check = 1, r.mode = c & 512 ? To : Ht, c = 0, f = 0;
          break;
        case xo:
          for (; f < 16; ) {
            if (s === 0)
              break t;
            s--, c += n[i++] << f, f += 8;
          }
          if (r.flags = c, (r.flags & 255) !== vo) {
            t.msg = "unknown compression method", r.mode = W;
            break;
          }
          if (r.flags & 57344) {
            t.msg = "unknown header flags set", r.mode = W;
            break;
          }
          r.head && (r.head.text = c >> 8 & 1), r.flags & 512 && (E[0] = c & 255, E[1] = c >>> 8 & 255, r.check = Ct(r.check, E, 2, 0)), c = 0, f = 0, r.mode = Eo;
        case Eo:
          for (; f < 32; ) {
            if (s === 0)
              break t;
            s--, c += n[i++] << f, f += 8;
          }
          r.head && (r.head.time = c), r.flags & 512 && (E[0] = c & 255, E[1] = c >>> 8 & 255, E[2] = c >>> 16 & 255, E[3] = c >>> 24 & 255, r.check = Ct(r.check, E, 4, 0)), c = 0, f = 0, r.mode = So;
        case So:
          for (; f < 16; ) {
            if (s === 0)
              break t;
            s--, c += n[i++] << f, f += 8;
          }
          r.head && (r.head.xflags = c & 255, r.head.os = c >> 8), r.flags & 512 && (E[0] = c & 255, E[1] = c >>> 8 & 255, r.check = Ct(r.check, E, 2, 0)), c = 0, f = 0, r.mode = ko;
        case ko:
          if (r.flags & 1024) {
            for (; f < 16; ) {
              if (s === 0)
                break t;
              s--, c += n[i++] << f, f += 8;
            }
            r.length = c, r.head && (r.head.extra_len = c), r.flags & 512 && (E[0] = c & 255, E[1] = c >>> 8 & 255, r.check = Ct(r.check, E, 2, 0)), c = 0, f = 0;
          } else r.head && (r.head.extra = null);
          r.mode = Ao;
        case Ao:
          if (r.flags & 1024 && (h = r.length, h > s && (h = s), h && (r.head && (x = r.head.extra_len - r.length, r.head.extra || (r.head.extra = new Array(r.head.extra_len)), pt.arraySet(
            r.head.extra,
            n,
            i,
            // extra field is limited to 65536 bytes
            // - no need for additional size check
            h,
            /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
            x
          )), r.flags & 512 && (r.check = Ct(r.check, n, h, i)), s -= h, i += h, r.length -= h), r.length))
            break t;
          r.length = 0, r.mode = $o;
        case $o:
          if (r.flags & 2048) {
            if (s === 0)
              break t;
            h = 0;
            do
              x = n[i + h++], r.head && x && r.length < 65536 && (r.head.name += String.fromCharCode(x));
            while (x && h < s);
            if (r.flags & 512 && (r.check = Ct(r.check, n, h, i)), s -= h, i += h, x)
              break t;
          } else r.head && (r.head.name = null);
          r.length = 0, r.mode = Ro;
        case Ro:
          if (r.flags & 4096) {
            if (s === 0)
              break t;
            h = 0;
            do
              x = n[i + h++], r.head && x && r.length < 65536 && (r.head.comment += String.fromCharCode(x));
            while (x && h < s);
            if (r.flags & 512 && (r.check = Ct(r.check, n, h, i)), s -= h, i += h, x)
              break t;
          } else r.head && (r.head.comment = null);
          r.mode = Oo;
        case Oo:
          if (r.flags & 512) {
            for (; f < 16; ) {
              if (s === 0)
                break t;
              s--, c += n[i++] << f, f += 8;
            }
            if (c !== (r.check & 65535)) {
              t.msg = "header crc mismatch", r.mode = W;
              break;
            }
            c = 0, f = 0;
          }
          r.head && (r.head.hcrc = r.flags >> 9 & 1, r.head.done = !0), t.adler = r.check = 0, r.mode = Ht;
          break;
        case To:
          for (; f < 32; ) {
            if (s === 0)
              break t;
            s--, c += n[i++] << f, f += 8;
          }
          t.adler = r.check = Ho(c), c = 0, f = 0, r.mode = An;
        case An:
          if (r.havedict === 0)
            return t.next_out = o, t.avail_out = l, t.next_in = i, t.avail_in = s, r.hold = c, r.bits = f, s0;
          t.adler = r.check = 1, r.mode = Ht;
        case Ht:
          if (e === i0 || e === sn)
            break t;
        case Ra:
          if (r.last) {
            c >>>= f & 7, f -= f & 7, r.mode = Ta;
            break;
          }
          for (; f < 3; ) {
            if (s === 0)
              break t;
            s--, c += n[i++] << f, f += 8;
          }
          switch (r.last = c & 1, c >>>= 1, f -= 1, c & 3) {
            case 0:
              r.mode = Io;
              break;
            case 1:
              if (m0(r), r.mode = cn, e === sn) {
                c >>>= 2, f -= 2;
                break t;
              }
              break;
            case 2:
              r.mode = Bo;
              break;
            case 3:
              t.msg = "invalid block type", r.mode = W;
          }
          c >>>= 2, f -= 2;
          break;
        case Io:
          for (c >>>= f & 7, f -= f & 7; f < 32; ) {
            if (s === 0)
              break t;
            s--, c += n[i++] << f, f += 8;
          }
          if ((c & 65535) !== (c >>> 16 ^ 65535)) {
            t.msg = "invalid stored block lengths", r.mode = W;
            break;
          }
          if (r.length = c & 65535, c = 0, f = 0, r.mode = Oa, e === sn)
            break t;
        case Oa:
          r.mode = Po;
        case Po:
          if (h = r.length, h) {
            if (h > s && (h = s), h > l && (h = l), h === 0)
              break t;
            pt.arraySet(a, n, i, h, o), s -= h, i += h, l -= h, o += h, r.length -= h;
            break;
          }
          r.mode = Ht;
          break;
        case Bo:
          for (; f < 14; ) {
            if (s === 0)
              break t;
            s--, c += n[i++] << f, f += 8;
          }
          if (r.nlen = (c & 31) + 257, c >>>= 5, f -= 5, r.ndist = (c & 31) + 1, c >>>= 5, f -= 5, r.ncode = (c & 15) + 4, c >>>= 4, f -= 4, r.nlen > 286 || r.ndist > 30) {
            t.msg = "too many length or distance symbols", r.mode = W;
            break;
          }
          r.have = 0, r.mode = Co;
        case Co:
          for (; r.have < r.ncode; ) {
            for (; f < 3; ) {
              if (s === 0)
                break t;
              s--, c += n[i++] << f, f += 8;
            }
            r.lens[I[r.have++]] = c & 7, c >>>= 3, f -= 3;
          }
          for (; r.have < 19; )
            r.lens[I[r.have++]] = 0;
          if (r.lencode = r.lendyn, r.lenbits = 7, A = { bits: r.lenbits }, g = ur(a0, r.lens, 0, 19, r.lencode, 0, r.work, A), r.lenbits = A.bits, g) {
            t.msg = "invalid code lengths set", r.mode = W;
            break;
          }
          r.have = 0, r.mode = Do;
        case Do:
          for (; r.have < r.nlen + r.ndist; ) {
            for (; m = r.lencode[c & (1 << r.lenbits) - 1], y = m >>> 24, _ = m >>> 16 & 255, v = m & 65535, !(y <= f); ) {
              if (s === 0)
                break t;
              s--, c += n[i++] << f, f += 8;
            }
            if (v < 16)
              c >>>= y, f -= y, r.lens[r.have++] = v;
            else {
              if (v === 16) {
                for ($ = y + 2; f < $; ) {
                  if (s === 0)
                    break t;
                  s--, c += n[i++] << f, f += 8;
                }
                if (c >>>= y, f -= y, r.have === 0) {
                  t.msg = "invalid bit length repeat", r.mode = W;
                  break;
                }
                x = r.lens[r.have - 1], h = 3 + (c & 3), c >>>= 2, f -= 2;
              } else if (v === 17) {
                for ($ = y + 3; f < $; ) {
                  if (s === 0)
                    break t;
                  s--, c += n[i++] << f, f += 8;
                }
                c >>>= y, f -= y, x = 0, h = 3 + (c & 7), c >>>= 3, f -= 3;
              } else {
                for ($ = y + 7; f < $; ) {
                  if (s === 0)
                    break t;
                  s--, c += n[i++] << f, f += 8;
                }
                c >>>= y, f -= y, x = 0, h = 11 + (c & 127), c >>>= 7, f -= 7;
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
          if (r.lenbits = 9, A = { bits: r.lenbits }, g = ur(dc, r.lens, 0, r.nlen, r.lencode, 0, r.work, A), r.lenbits = A.bits, g) {
            t.msg = "invalid literal/lengths set", r.mode = W;
            break;
          }
          if (r.distbits = 6, r.distcode = r.distdyn, A = { bits: r.distbits }, g = ur(hc, r.lens, r.nlen, r.ndist, r.distcode, 0, r.work, A), r.distbits = A.bits, g) {
            t.msg = "invalid distances set", r.mode = W;
            break;
          }
          if (r.mode = cn, e === sn)
            break t;
        case cn:
          r.mode = fn;
        case fn:
          if (s >= 6 && l >= 258) {
            t.next_out = o, t.avail_out = l, t.next_in = i, t.avail_in = s, r.hold = c, r.bits = f, n0(t, d), o = t.next_out, a = t.output, l = t.avail_out, i = t.next_in, n = t.input, s = t.avail_in, c = r.hold, f = r.bits, r.mode === Ht && (r.back = -1);
            break;
          }
          for (r.back = 0; m = r.lencode[c & (1 << r.lenbits) - 1], y = m >>> 24, _ = m >>> 16 & 255, v = m & 65535, !(y <= f); ) {
            if (s === 0)
              break t;
            s--, c += n[i++] << f, f += 8;
          }
          if (_ && !(_ & 240)) {
            for (S = y, k = _, O = v; m = r.lencode[O + ((c & (1 << S + k) - 1) >> S)], y = m >>> 24, _ = m >>> 16 & 255, v = m & 65535, !(S + y <= f); ) {
              if (s === 0)
                break t;
              s--, c += n[i++] << f, f += 8;
            }
            c >>>= S, f -= S, r.back += S;
          }
          if (c >>>= y, f -= y, r.back += y, r.length = v, _ === 0) {
            r.mode = Mo;
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
          r.extra = _ & 15, r.mode = No;
        case No:
          if (r.extra) {
            for ($ = r.extra; f < $; ) {
              if (s === 0)
                break t;
              s--, c += n[i++] << f, f += 8;
            }
            r.length += c & (1 << r.extra) - 1, c >>>= r.extra, f -= r.extra, r.back += r.extra;
          }
          r.was = r.length, r.mode = Fo;
        case Fo:
          for (; m = r.distcode[c & (1 << r.distbits) - 1], y = m >>> 24, _ = m >>> 16 & 255, v = m & 65535, !(y <= f); ) {
            if (s === 0)
              break t;
            s--, c += n[i++] << f, f += 8;
          }
          if (!(_ & 240)) {
            for (S = y, k = _, O = v; m = r.distcode[O + ((c & (1 << S + k) - 1) >> S)], y = m >>> 24, _ = m >>> 16 & 255, v = m & 65535, !(S + y <= f); ) {
              if (s === 0)
                break t;
              s--, c += n[i++] << f, f += 8;
            }
            c >>>= S, f -= S, r.back += S;
          }
          if (c >>>= y, f -= y, r.back += y, _ & 64) {
            t.msg = "invalid distance code", r.mode = W;
            break;
          }
          r.offset = v, r.extra = _ & 15, r.mode = jo;
        case jo:
          if (r.extra) {
            for ($ = r.extra; f < $; ) {
              if (s === 0)
                break t;
              s--, c += n[i++] << f, f += 8;
            }
            r.offset += c & (1 << r.extra) - 1, c >>>= r.extra, f -= r.extra, r.back += r.extra;
          }
          if (r.offset > r.dmax) {
            t.msg = "invalid distance too far back", r.mode = W;
            break;
          }
          r.mode = Uo;
        case Uo:
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
          r.length === 0 && (r.mode = fn);
          break;
        case Mo:
          if (l === 0)
            break t;
          a[o++] = r.length, l--, r.mode = fn;
          break;
        case Ta:
          if (r.wrap) {
            for (; f < 32; ) {
              if (s === 0)
                break t;
              s--, c |= n[i++] << f, f += 8;
            }
            if (d -= l, t.total_out += d, r.total += d, d && (t.adler = r.check = /*UPDATE(state.check, put - _out, _out);*/
            r.flags ? Ct(r.check, a, d, o - d) : ti(r.check, a, d, o - d)), d = l, (r.flags ? c : Ho(c)) !== r.check) {
              t.msg = "incorrect data check", r.mode = W;
              break;
            }
            c = 0, f = 0;
          }
          r.mode = zo;
        case zo:
          if (r.wrap && r.flags) {
            for (; f < 32; ) {
              if (s === 0)
                break t;
              s--, c += n[i++] << f, f += 8;
            }
            if (c !== (r.total & 4294967295)) {
              t.msg = "incorrect length check", r.mode = W;
              break;
            }
            c = 0, f = 0;
          }
          r.mode = Lo;
        case Lo:
          g = o0;
          break t;
        case W:
          g = wc;
          break t;
        case gc:
          return pc;
        case f0:
        default:
          return xt;
      }
  return t.next_out = o, t.avail_out = l, t.next_in = i, t.avail_in = s, r.hold = c, r.bits = f, (r.wsize || d !== t.avail_out && r.mode < W && (r.mode < Ta || e !== bo)) && xc(t, t.output, t.next_out, d - t.avail_out), u -= t.avail_in, d -= t.avail_out, t.total_in += u, t.total_out += d, r.total += d, r.wrap && d && (t.adler = r.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
  r.flags ? Ct(r.check, a, d, t.next_out - d) : ti(r.check, a, d, t.next_out - d)), t.data_type = r.bits + (r.last ? 64 : 0) + (r.mode === Ht ? 128 : 0) + (r.mode === cn || r.mode === Oa ? 256 : 0), (u === 0 && d === 0 || e === bo) && g === ve && (g = c0), g;
}
function y0(t) {
  if (!t || !t.state)
    return xt;
  var e = t.state;
  return e.window && (e.window = null), t.state = null, ve;
}
function _0(t, e) {
  var r;
  return !t || !t.state || (r = t.state, !(r.wrap & 2)) ? xt : (r.head = e, e.done = !1, ve);
}
function b0(t, e) {
  var r = e.length, n, a, i;
  return !t || !t.state || (n = t.state, n.wrap !== 0 && n.mode !== An) ? xt : n.mode === An && (a = 1, a = ti(a, e, r, 0), a !== n.check) ? wc : (i = xc(t, e, r, r), i ? (n.mode = gc, pc) : (n.havedict = 1, ve));
}
Rt.inflateReset = _c;
Rt.inflateReset2 = bc;
Rt.inflateResetKeep = yc;
Rt.inflateInit = p0;
Rt.inflateInit2 = vc;
Rt.inflate = g0;
Rt.inflateEnd = y0;
Rt.inflateGetHeader = _0;
Rt.inflateSetDictionary = b0;
Rt.inflateInfo = "pako inflate (from Nodeca project)";
var Ec = {
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
function v0() {
  this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
}
var x0 = v0, je = Rt, dr = Xt, bn = Ae, V = Ec, ei = mi, E0 = lc, S0 = x0, Sc = Object.prototype.toString;
function xe(t) {
  if (!(this instanceof xe)) return new xe(t);
  this.options = dr.assign({
    chunkSize: 16384,
    windowBits: 0,
    to: ""
  }, t || {});
  var e = this.options;
  e.raw && e.windowBits >= 0 && e.windowBits < 16 && (e.windowBits = -e.windowBits, e.windowBits === 0 && (e.windowBits = -15)), e.windowBits >= 0 && e.windowBits < 16 && !(t && t.windowBits) && (e.windowBits += 32), e.windowBits > 15 && e.windowBits < 48 && (e.windowBits & 15 || (e.windowBits |= 15)), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new E0(), this.strm.avail_out = 0;
  var r = je.inflateInit2(
    this.strm,
    e.windowBits
  );
  if (r !== V.Z_OK)
    throw new Error(ei[r]);
  if (this.header = new S0(), je.inflateGetHeader(this.strm, this.header), e.dictionary && (typeof e.dictionary == "string" ? e.dictionary = bn.string2buf(e.dictionary) : Sc.call(e.dictionary) === "[object ArrayBuffer]" && (e.dictionary = new Uint8Array(e.dictionary)), e.raw && (r = je.inflateSetDictionary(this.strm, e.dictionary), r !== V.Z_OK)))
    throw new Error(ei[r]);
}
xe.prototype.push = function(t, e) {
  var r = this.strm, n = this.options.chunkSize, a = this.options.dictionary, i, o, s, l, c, f = !1;
  if (this.ended)
    return !1;
  o = e === ~~e ? e : e === !0 ? V.Z_FINISH : V.Z_NO_FLUSH, typeof t == "string" ? r.input = bn.binstring2buf(t) : Sc.call(t) === "[object ArrayBuffer]" ? r.input = new Uint8Array(t) : r.input = t, r.next_in = 0, r.avail_in = r.input.length;
  do {
    if (r.avail_out === 0 && (r.output = new dr.Buf8(n), r.next_out = 0, r.avail_out = n), i = je.inflate(r, V.Z_NO_FLUSH), i === V.Z_NEED_DICT && a && (i = je.inflateSetDictionary(this.strm, a)), i === V.Z_BUF_ERROR && f === !0 && (i = V.Z_OK, f = !1), i !== V.Z_STREAM_END && i !== V.Z_OK)
      return this.onEnd(i), this.ended = !0, !1;
    r.next_out && (r.avail_out === 0 || i === V.Z_STREAM_END || r.avail_in === 0 && (o === V.Z_FINISH || o === V.Z_SYNC_FLUSH)) && (this.options.to === "string" ? (s = bn.utf8border(r.output, r.next_out), l = r.next_out - s, c = bn.buf2string(r.output, s), r.next_out = l, r.avail_out = n - l, l && dr.arraySet(r.output, r.output, s, l, 0), this.onData(c)) : this.onData(dr.shrinkBuf(r.output, r.next_out))), r.avail_in === 0 && r.avail_out === 0 && (f = !0);
  } while ((r.avail_in > 0 || r.avail_out === 0) && i !== V.Z_STREAM_END);
  return i === V.Z_STREAM_END && (o = V.Z_FINISH), o === V.Z_FINISH ? (i = je.inflateEnd(this.strm), this.onEnd(i), this.ended = !0, i === V.Z_OK) : (o === V.Z_SYNC_FLUSH && (this.onEnd(V.Z_OK), r.avail_out = 0), !0);
};
xe.prototype.onData = function(t) {
  this.chunks.push(t);
};
xe.prototype.onEnd = function(t) {
  t === V.Z_OK && (this.options.to === "string" ? this.result = this.chunks.join("") : this.result = dr.flattenChunks(this.chunks)), this.chunks = [], this.err = t, this.msg = this.strm.msg;
};
function yi(t, e) {
  var r = new xe(e);
  if (r.push(t, !0), r.err)
    throw r.msg || ei[r.err];
  return r.result;
}
function k0(t, e) {
  return e = e || {}, e.raw = !0, yi(t, e);
}
Cr.Inflate = xe;
Cr.inflate = yi;
Cr.inflateRaw = k0;
Cr.ungzip = yi;
var A0 = Xt.assign, $0 = Ir, R0 = Cr, O0 = Ec, kc = {};
A0(kc, $0, R0, O0);
var T0 = kc;
const Wo = (t, e) => function(...r) {
  const n = e.promiseModule;
  return new n((a, i) => {
    e.multiArgs ? r.push((...o) => {
      e.errorFirst ? o[0] ? i(o) : (o.shift(), a(o)) : a(o);
    }) : e.errorFirst ? r.push((o, s) => {
      o ? i(o) : a(s);
    }) : r.push(a), t.apply(this, r);
  });
};
var I0 = (t, e) => {
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
    return e.excludeMain ? t(...i) : Wo(t, e).apply(this, i);
  } : a = Object.create(Object.getPrototypeOf(t));
  for (const i in t) {
    const o = t[i];
    a[i] = typeof o == "function" && n(i) ? Wo(o, e) : o;
  }
  return a;
};
function qo(t) {
  return Array.isArray(t) ? t : [t];
}
const ri = "", Zo = " ", Ba = "\\", P0 = /^\s+$/, B0 = /(?:[^\\]|^)\\$/, C0 = /^\\!/, D0 = /^\\#/, N0 = /\r?\n/g, F0 = /^\.*\/|^\.+$/, Ca = "/";
let Ac = "node-ignore";
typeof Symbol < "u" && (Ac = Symbol.for("node-ignore"));
const Vo = Ac, j0 = (t, e, r) => Object.defineProperty(t, e, { value: r }), U0 = /([0-z])-([0-z])/g, $c = () => !1, M0 = (t) => t.replace(
  U0,
  (e, r, n) => r.charCodeAt(0) <= n.charCodeAt(0) ? e : ri
), z0 = (t) => {
  const { length: e } = t;
  return t.slice(0, e - e % 2);
}, L0 = [
  [
    // remove BOM
    // TODO:
    // Other similar zero-width characters?
    /^\uFEFF/,
    () => ri
  ],
  // > Trailing spaces are ignored unless they are quoted with backslash ("\")
  [
    // (a\ ) -> (a )
    // (a  ) -> (a)
    // (a ) -> (a)
    // (a \ ) -> (a  )
    /((?:\\\\)*?)(\\?\s+)$/,
    (t, e, r) => e + (r.indexOf("\\") === 0 ? Zo : ri)
  ],
  // replace (\ ) with ' '
  // (\ ) -> ' '
  // (\\ ) -> '\\ '
  // (\\\ ) -> '\\ '
  [
    /(\\+?)\s/g,
    (t, e) => {
      const { length: r } = e;
      return e.slice(0, r - r % 2) + Zo;
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
    () => Ba
  ],
  [
    // '\\\\' -> '\\'
    /\\\\/g,
    () => Ba
  ],
  [
    // > The range notation, e.g. [a-zA-Z],
    // > can be used to match one of the characters in a range.
    // `\` is escaped by step 3
    /(\\)?\[([^\]/]*?)(\\*)($|\])/g,
    (t, e, r, n, a) => e === Ba ? `\\[${r}${z0(n)}${a}` : a === "]" && n.length % 2 === 0 ? `[${M0(r)}${n}]` : "[]"
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
], Xo = /* @__PURE__ */ Object.create(null), H0 = (t, e) => {
  let r = Xo[t];
  return r || (r = L0.reduce(
    (n, [a, i]) => n.replace(a, i.bind(t)),
    t
  ), Xo[t] = r), e ? new RegExp(r, "i") : new RegExp(r);
}, _i = (t) => typeof t == "string", G0 = (t) => t && _i(t) && !P0.test(t) && !B0.test(t) && t.indexOf("#") !== 0, W0 = (t) => t.split(N0);
class q0 {
  constructor(e, r, n, a) {
    this.origin = e, this.pattern = r, this.negative = n, this.regex = a;
  }
}
const Z0 = (t, e) => {
  const r = t;
  let n = !1;
  t.indexOf("!") === 0 && (n = !0, t = t.substr(1)), t = t.replace(C0, "!").replace(D0, "#");
  const a = H0(t, e);
  return new q0(
    r,
    t,
    n,
    a
  );
}, V0 = (t, e) => {
  throw new e(t);
}, Zt = (t, e, r) => _i(t) ? t ? Zt.isNotRelative(t) ? r(
  `path should be a \`path.relative()\`d string, but got "${e}"`,
  RangeError
) : !0 : r("path must not be empty", TypeError) : r(
  `path must be a string, but got \`${e}\``,
  TypeError
), Rc = (t) => F0.test(t);
Zt.isNotRelative = Rc;
Zt.convert = (t) => t;
class X0 {
  constructor({
    ignorecase: e = !0,
    ignoreCase: r = e,
    allowRelativePaths: n = !1
  } = {}) {
    j0(this, Vo, !0), this._rules = [], this._ignoreCase = r, this._allowRelativePaths = n, this._initCache();
  }
  _initCache() {
    this._ignoreCache = /* @__PURE__ */ Object.create(null), this._testCache = /* @__PURE__ */ Object.create(null);
  }
  _addPattern(e) {
    if (e && e[Vo]) {
      this._rules = this._rules.concat(e._rules), this._added = !0;
      return;
    }
    if (G0(e)) {
      const r = Z0(e, this._ignoreCase);
      this._added = !0, this._rules.push(r);
    }
  }
  // @param {Array<string> | string | Ignore} pattern
  add(e) {
    return this._added = !1, qo(
      _i(e) ? W0(e) : e
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
      this._allowRelativePaths ? $c : V0
    ), this._t(i, r, n, a);
  }
  _t(e, r, n, a) {
    if (e in r)
      return r[e];
    if (a || (a = e.split(Ca)), a.pop(), !a.length)
      return r[e] = this._testOne(e, n);
    const i = this._t(
      a.join(Ca) + Ca,
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
    return qo(e).filter(this.createFilter());
  }
  // @returns {TestResult}
  test(e) {
    return this._test(e, this._testCache, !0);
  }
}
const $n = (t) => new X0(t), K0 = (t) => Zt(t && Zt.convert(t), t, $c);
$n.isPathValid = K0;
$n.default = $n;
var Y0 = $n;
if (
  // Detect `process` so that it can run in browsers.
  typeof process < "u" && (process.env && process.env.IGNORE_TEST_WIN32 || process.platform === "win32")
) {
  const t = (r) => /^\\\\\?\\/.test(r) || /["<>|\u0000-\u001F]+/u.test(r) ? r : r.replace(/\\/g, "/");
  Zt.convert = t;
  const e = /^[a-z]:\//i;
  Zt.isNotRelative = (r) => e.test(r) || Rc(r);
}
function J0(t) {
  return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Dt(t, e, r) {
  return e = e instanceof RegExp ? e : new RegExp(J0(e), "g"), t.replace(e, r);
}
var Q0 = {
  clean: function(e) {
    if (typeof e != "string")
      throw new Error("Expected a string, received: " + e);
    return e = Dt(e, "./", "/"), e = Dt(e, "..", "."), e = Dt(e, " ", "-"), e = Dt(e, /^[~^:?*\\\-]/g, ""), e = Dt(e, /[~^:?*\\]/g, "-"), e = Dt(e, /[~^:?*\\\-]$/g, ""), e = Dt(e, "@{", "-"), e = Dt(e, /\.$/g, ""), e = Dt(e, /\/$/g, ""), e = Dt(e, /\.lock$/g, ""), e;
  }
}, tw = Q0, ew = function(t, e) {
  var r = t, n = e, a = r.length, i = n.length, o = !1, s = null, l = a + 1, c = [], f = [], u = [], d = "", h = -1, w = 0, p = 1, m, y, _ = function() {
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
    for (g > E ? A = c[x - 1 + l] : A = c[x + 1 + l], I = Math.max(g, E), $ = I - x; $ < a && I < i && r[$] === n[I]; )
      ++$, ++I;
    return c[x + l] = f.length, f[f.length] = new v($, I, A), I;
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
        E[B] = -1, c[B] = -1;
      A = -1;
      do {
        for (++A, N = -A; N <= x - 1; ++N)
          E[N + l] = k(N, E[N - 1 + l] + 1, E[N + 1 + l]);
        for (N = x + A; N >= x + 1; --N)
          E[N + l] = k(N, E[N - 1 + l] + 1, E[N + 1 + l]);
        E[x + l] = k(x, E[x - 1 + l] + 1, E[x + 1 + l]);
      } while (E[x + l] !== i);
      for (s = x + 2 * A, $ = c[x + l], I = []; $ !== -1; )
        I[I.length] = new v(f[$].x, f[$].y, null), $ = f[$].k;
      O(I);
    }
  };
}, rw = ew;
function nw(t, e) {
  var r = new rw(t, e);
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
  var c = {
    file1index: -1,
    file2index: -1,
    chain: null
  };
  return i ? (i.chain = c, a) : c;
}
function Ko(t, e) {
  for (var r = [], n = t.length, a = e.length, i = nw(t, e); i !== null; i = i.chain) {
    var o = n - i.file1index - 1, s = a - i.file2index - 1;
    n = i.file1index, a = i.file2index, (o || s) && r.push({
      file1: [n + 1, o],
      file2: [a + 1, s]
    });
  }
  return r.reverse(), r;
}
function aw(t, e, r) {
  var n, a = Ko(e, t), i = Ko(e, r), o = [];
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
  var l = [], c = 0;
  function f(B) {
    B > c && (l.push([1, c, B - c]), c = B);
  }
  for (var u = 0; u < o.length; u++) {
    for (var d = u, h = o[u], w = h[0], p = w + h[2]; u < o.length - 1; ) {
      var m = o[u + 1], y = m[0];
      if (y > p) break;
      p = Math.max(p, y + m[2]), u++;
    }
    if (f(w), d == u)
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
    c = p;
  }
  return f(e.length), l;
}
function iw(t, e, r) {
  var n = [], a = [t, e, r], i = aw(t, e, r), o = [];
  function s() {
    o.length && n.push({
      ok: o
    }), o = [];
  }
  function l(h) {
    for (var w = 0; w < h.length; w++)
      o.push(h[w]);
  }
  function c(h) {
    if (h[2] != h[6]) return !0;
    for (var w = h[1], p = h[5], m = 0; m < h[2]; m++)
      if (t[m + w] != r[m + p]) return !0;
    return !1;
  }
  for (var f = 0; f < i.length; f++) {
    var u = i[f], d = u[0];
    d == -1 ? c(u) ? (s(), n.push({
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
var ow = iw;
Object.defineProperty(P, "__esModule", { value: !0 });
function fe(t) {
  return t && typeof t == "object" && "default" in t ? t.default : t;
}
var br = fe(Gl), Oc = fe(jd), sw = fe(js), bi = fe(T0), cw = Ml, ln = fe(I0), fw = fe(Y0), vr = fe(tw), lw = fe(ow);
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
class Dr extends U {
  /**
   * @param {Array<string>} filepaths
   */
  constructor(e) {
    super(
      `Modifying the index is not possible because you have unmerged files: ${e.toString}. Fix them up in the work tree, and then use 'git add/rm as appropriate to mark resolution and make a commit.`
    ), this.code = this.name = Dr.code, this.data = { filepaths: e };
  }
}
Dr.code = "UnmergedPathsError";
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
class Xe extends U {
  /**
   * @param {string} filepath
   */
  constructor(e) {
    super(`The filepath "${e}" contains unsafe character sequences`), this.code = this.name = Xe.code, this.data = { filepath: e };
  }
}
Xe.code = "UnsafeFilepathError";
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
function Tc(t, e) {
  return Hn(t.path, e.path);
}
function Ic(t) {
  let e = t > 0 ? t >> 12 : 0;
  e !== 4 && e !== 8 && e !== 10 && e !== 14 && (e = 8);
  let r = t & 511;
  return r & 73 ? r = 493 : r = 420, e !== 8 && (r = 0), (e << 12) + r;
}
const Nt = 2 ** 32;
function Yo(t, e, r, n) {
  if (t !== void 0 && e !== void 0)
    return [t, e];
  r === void 0 && (r = n.valueOf());
  const a = Math.floor(r / 1e3), i = (r - a * 1e3) * 1e6;
  return [a, i];
}
function Me(t) {
  const [e, r] = Yo(
    t.ctimeSeconds,
    t.ctimeNanoseconds,
    t.ctimeMs,
    t.ctime
  ), [n, a] = Yo(
    t.mtimeSeconds,
    t.mtimeNanoseconds,
    t.mtimeMs,
    t.mtime
  );
  return {
    ctimeSeconds: e % Nt,
    ctimeNanoseconds: r % Nt,
    mtimeSeconds: n % Nt,
    mtimeNanoseconds: a % Nt,
    dev: t.dev % Nt,
    ino: t.ino % Nt,
    mode: Ic(t.mode % Nt),
    uid: t.uid % Nt,
    gid: t.gid % Nt,
    // size of -1 happens over a BrowserFS HTTP Backend that doesn't serve Content-Length headers
    // (like the Karma webserver) because BrowserFS HTTP Backend uses HTTP HEAD requests to do fs.stat
    size: t.size > -1 ? t.size % Nt : 0
  };
}
function uw(t) {
  let e = "";
  for (const r of new Uint8Array(t))
    r < 16 && (e += "0"), e += r.toString(16);
  return e;
}
let Da = null;
async function Vt(t) {
  return Da === null && (Da = await hw()), Da ? Pc(t) : dw(t);
}
function dw(t) {
  return new Oc().update(t).digest("hex");
}
async function Pc(t) {
  const e = await crypto.subtle.digest("SHA-1", t);
  return uw(e);
}
async function hw() {
  try {
    return await Pc(new Uint8Array([])) === "da39a3ee5e6b4b0d3255bfef95601890afd80709";
  } catch {
  }
  return !1;
}
function ww(t) {
  return {
    assumeValid: !!(t & 32768),
    extended: !!(t & 16384),
    stage: (t & 12288) >> 12,
    nameLength: t & 4095
  };
}
function pw(t) {
  const e = t.flags;
  return e.extended = !1, e.nameLength = Math.min(Buffer.from(t.path).length, 4095), (e.assumeValid ? 32768 : 0) + (e.extended ? 16384 : 0) + ((e.stage & 3) << 12) + (e.nameLength & 4095);
}
class he {
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
      return he.fromBuffer(e);
    if (e === null)
      return new he(null);
    throw new F("invalid type passed to GitIndex.from");
  }
  static async fromBuffer(e) {
    if (e.length === 0)
      throw new F("Index file is empty (.git/index)");
    const r = new he(), n = new Mt(e), a = n.toString("utf8", 4);
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
    let c = 0;
    for (; !n.eof() && c < l; ) {
      const f = {};
      f.ctimeSeconds = n.readUInt32BE(), f.ctimeNanoseconds = n.readUInt32BE(), f.mtimeSeconds = n.readUInt32BE(), f.mtimeNanoseconds = n.readUInt32BE(), f.dev = n.readUInt32BE(), f.ino = n.readUInt32BE(), f.mode = n.readUInt32BE(), f.uid = n.readUInt32BE(), f.gid = n.readUInt32BE(), f.size = n.readUInt32BE(), f.oid = n.slice(20).toString("hex");
      const u = n.readUInt16BE();
      f.flags = ww(u);
      const d = e.indexOf(0, n.tell() + 1) - n.tell();
      if (d < 1)
        throw new F(`Got a path length of: ${d}`);
      if (f.path = n.toString("utf8", d), f.path.includes("..\\") || f.path.includes("../"))
        throw new Xe(f.path);
      let h = 8 - (n.tell() - 12) % 8;
      for (h === 0 && (h = 8); h--; ) {
        const w = n.readUInt8();
        if (w !== 0)
          throw new F(
            `Expected 1-8 null characters but got '${w}' after ${f.path}`
          );
        if (n.eof())
          throw new F("Unexpected end of file");
      }
      f.stages = [], r._addEntry(f), c++;
    }
    return r;
  }
  get unmergedPaths() {
    return [...this._unmergedPaths];
  }
  get entries() {
    return [...this._entries.values()].sort(Tc);
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
    }), r = Me(r);
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
    const r = Buffer.from(e.path), n = Math.ceil((62 + r.length + 1) / 8) * 8, a = Buffer.alloc(n), i = new Mt(a), o = Me(e);
    return i.writeUInt32BE(o.ctimeSeconds), i.writeUInt32BE(o.ctimeNanoseconds), i.writeUInt32BE(o.mtimeSeconds), i.writeUInt32BE(o.mtimeNanoseconds), i.writeUInt32BE(o.dev), i.writeUInt32BE(o.ino), i.writeUInt32BE(o.mode), i.writeUInt32BE(o.uid), i.writeUInt32BE(o.gid), i.writeUInt32BE(o.size), i.write(e.oid, 20, "hex"), i.writeUInt16BE(pw(e)), i.write(e.path, r.length, "utf8"), a;
  }
  async toObject() {
    const e = Buffer.alloc(12), r = new Mt(e);
    r.write("DIRC", 4, "utf8"), r.writeUInt32BE(2), r.writeUInt32BE(this.entriesFlat.length);
    let n = [];
    for (const s of this.entries)
      if (n.push(he._entryToBuffer(s)), s.stages.length > 1)
        for (const l of s.stages)
          l && l !== s && n.push(he._entryToBuffer(l));
    n = await Promise.all(n);
    const a = Buffer.concat(n), i = Buffer.concat([e, a]), o = await Vt(i);
    return Buffer.concat([i, Buffer.from(o, "hex")]);
  }
}
function Rn(t, e, r = !0, n = !0) {
  const a = Me(t), i = Me(e);
  return r && a.mode !== i.mode || a.mtimeSeconds !== i.mtimeSeconds || a.ctimeSeconds !== i.ctimeSeconds || a.uid !== i.uid || a.gid !== i.gid || n && a.ino !== i.ino || a.size !== i.size;
}
let Na = null;
const Fa = Symbol("IndexCache");
function mw() {
  return {
    map: /* @__PURE__ */ new Map(),
    stats: /* @__PURE__ */ new Map()
  };
}
async function gw(t, e, r) {
  const [n, a] = await Promise.all([
    t.lstat(e),
    t.read(e)
  ]), i = await he.from(a);
  r.map.set(e, i), r.stats.set(e, n);
}
async function yw(t, e, r) {
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
    n[Fa] || (n[Fa] = mw());
    const o = `${r}/index`;
    Na === null && (Na = new br({ maxPending: 1 / 0 }));
    let s, l = [];
    return await Na.acquire(o, async () => {
      const c = n[Fa];
      await yw(e, o, c) && await gw(e, o, c);
      const f = c.map.get(o);
      if (l = f.unmergedPaths, l.length && !a)
        throw new Dr(l);
      if (s = await i(f), f._dirty) {
        const u = await f.toObject();
        await e.write(o, u), c.stats.set(o, await e.lstat(o)), f._dirty = !1;
      }
    }), s;
  }
}
function On(t) {
  const e = Math.max(t.lastIndexOf("/"), t.lastIndexOf("\\"));
  return e > -1 && (t = t.slice(e + 1)), t;
}
function Ee(t) {
  const e = Math.max(t.lastIndexOf("/"), t.lastIndexOf("\\"));
  return e === -1 ? "." : e === 0 ? "/" : t.slice(0, e);
}
function Bc(t) {
  const e = /* @__PURE__ */ new Map(), r = function(a) {
    if (!e.has(a)) {
      const i = {
        type: "tree",
        fullpath: a,
        basename: On(a),
        metadata: {},
        children: []
      };
      e.set(a, i), i.parent = r(Ee(a)), i.parent && i.parent !== i && i.parent.children.push(i);
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
        parent: r(Ee(a)),
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
function _w(t) {
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
class bw {
  constructor({ fs: e, gitdir: r, cache: n }) {
    this.treePromise = Y.acquire(
      { fs: e, gitdir: r, cache: n },
      async function(i) {
        return Bc(i.entries);
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
      const a = n.type === "tree" ? {} : Me(n.metadata);
      e._type = n.type === "tree" ? "tree" : _w(a.mode), e._mode = a.mode, n.type === "tree" ? e._stat = void 0 : e._stat = a;
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
function $e() {
  const t = /* @__PURE__ */ Object.create(null);
  return Object.defineProperty(t, Gn, {
    value: function({ fs: e, gitdir: r, cache: n }) {
      return new bw({ fs: e, gitdir: r, cache: n });
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
class ct extends U {
  /**
   * @param {string} oid
   * @param {'blob'|'commit'|'tag'|'tree'} actual
   * @param {'blob'|'commit'|'tag'|'tree'} expected
   * @param {string} [filepath]
   */
  constructor(e, r, n, a) {
    super(
      `Object ${e} ${a ? `at ${a}` : ""}was anticipated to be a ${n} but it is a ${r}.`
    ), this.code = this.name = ct.code, this.data = { oid: e, actual: r, expected: n, filepath: a };
  }
}
ct.code = "ObjectTypeError";
class ie extends U {
  /**
   * @param {string} value
   */
  constructor(e) {
    super(`Expected a 40-char hex object id but saw "${e}".`), this.code = this.name = ie.code, this.data = { value: e };
  }
}
ie.code = "InvalidOidError";
class Nr extends U {
  /**
   * @param {string} remote
   */
  constructor(e) {
    super(`Could not find a fetch refspec for remote "${e}". Make sure the config file has an entry like the following:
[remote "${e}"]
	fetch = +refs/heads/*:refs/remotes/origin/*
`), this.code = this.name = Nr.code, this.data = { remote: e };
  }
}
Nr.code = "NoRefspecError";
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
class vi {
  constructor(e = []) {
    this.rules = e;
  }
  static from(e) {
    const r = [];
    for (const n of e)
      r.push(In.from(n));
    return new vi(r);
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
function vw(t, e) {
  const r = t.replace(/\^\{\}$/, ""), n = e.replace(/\^\{\}$/, ""), a = -(r < n) || +(r > n);
  return a === 0 ? t.endsWith("^{}") ? 1 : -1 : a;
}
/*!
 * This code for `path.join` is directly copied from @zenfs/core/path for bundle size improvements.
 * SPDX-License-Identifier: LGPL-3.0-or-later
 * Copyright (c) James Prevett and other ZenFS contributors.
 */
function xw(t, e) {
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
function Ew(t) {
  if (!t.length) return ".";
  const e = t[0] === "/", r = t.at(-1) === "/";
  return t = xw(t, !e), t.length ? (r && (t += "/"), e ? `/${t}` : t) : e ? "/" : r ? "./" : ".";
}
function R(...t) {
  if (t.length === 0) return ".";
  let e;
  for (let r = 0; r < t.length; ++r) {
    const n = t[r];
    n.length > 0 && (e === void 0 ? e = n : e += "/" + n);
  }
  return e === void 0 ? "." : Ew(e);
}
const Sw = (t) => {
  if (typeof t == "number")
    return t;
  t = t.toLowerCase();
  let e = parseInt(t);
  return t.endsWith("k") && (e *= 1024), t.endsWith("m") && (e *= 1024 * 1024), t.endsWith("g") && (e *= 1024 * 1024 * 1024), e;
}, or = (t) => {
  if (typeof t == "boolean")
    return t;
  if (t = t.trim().toLowerCase(), t === "true" || t === "yes" || t === "on") return !0;
  if (t === "false" || t === "no" || t === "off") return !1;
  throw Error(
    `Expected 'true', 'false', 'yes', 'no', 'on', or 'off', but got ${t}`
  );
}, Jo = {
  core: {
    filemode: or,
    bare: or,
    logallrefupdates: or,
    symlinks: or,
    ignorecase: or,
    bigFileThreshold: Sw
  }
}, kw = /^\[([A-Za-z0-9-.]+)(?: "(.*)")?\]$/, Aw = /^[A-Za-z0-9-.]+$/, $w = /^([A-Za-z][A-Za-z-]*)(?: *= *(.*))?$/, Rw = /^[A-Za-z][A-Za-z-]*$/, Ow = /^(.*?)( *[#;].*)$/, Tw = (t) => {
  const e = kw.exec(t);
  if (e != null) {
    const [r, n] = e.slice(1);
    return [r, n];
  }
  return null;
}, Iw = (t) => {
  const e = $w.exec(t);
  if (e != null) {
    const [r, n = "true"] = e.slice(1), a = Pw(n), i = Bw(a);
    return [r, i];
  }
  return null;
}, Pw = (t) => {
  const e = Ow.exec(t);
  if (e == null)
    return t;
  const [r, n] = e.slice(1);
  return Qo(r) && Qo(n) ? `${r}${n}` : r;
}, Qo = (t) => (t.match(/(?:^|[^\\])"/g) || []).length % 2 !== 0, Bw = (t) => t.split("").reduce((e, r, n, a) => {
  const i = r === '"' && a[n - 1] !== "\\", o = r === "\\" && a[n + 1] === '"';
  return i || o ? e : e + r;
}, ""), ts = (t) => t != null ? t.toLowerCase() : null, ni = (t, e, r) => [ts(t), e, ts(r)].filter((n) => n != null).join("."), es = (t) => {
  const e = t.split("."), r = e.shift(), n = e.pop(), a = e.length ? e.join(".") : void 0;
  return {
    section: r,
    subsection: a,
    name: n,
    path: ni(r, a, n),
    sectionPath: ni(r, a, null),
    isSection: !!r
  };
}, Cw = (t, e) => t.reduce((r, n, a) => e(n) ? a : r, -1);
class xi {
  constructor(e) {
    let r = null, n = null;
    this.parsedConfig = e ? e.split(`
`).map((a) => {
      let i = null, o = null;
      const s = a.trim(), l = Tw(s), c = l != null;
      if (c)
        [r, n] = l;
      else {
        const u = Iw(s);
        u != null && ([i, o] = u);
      }
      const f = ni(r, n, i);
      return { line: a, isSection: c, section: r, subsection: n, name: i, value: o, path: f };
    }) : [];
  }
  static from(e) {
    return new xi(e);
  }
  async get(e, r = !1) {
    const n = es(e).path, a = this.parsedConfig.filter((i) => i.path === n).map(({ section: i, name: o, value: s }) => {
      const l = Jo[i] && Jo[i][o];
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
      isSection: c
    } = es(e), f = Cw(
      this.parsedConfig,
      (u) => u.path === s
    );
    if (r == null)
      f !== -1 && this.parsedConfig.splice(f, 1);
    else if (f !== -1) {
      const u = this.parsedConfig[f], d = Object.assign({}, u, {
        name: o,
        value: r,
        modified: !0
      });
      n ? this.parsedConfig.splice(f + 1, 0, d) : this.parsedConfig[f] = d;
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
      if (Aw.test(a) && Rw.test(o))
        if (u >= 0)
          this.parsedConfig.splice(u + 1, 0, d);
        else {
          const h = {
            isSection: c,
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
    return xi.from(n);
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
const un = (t) => [
  `${t}`,
  `refs/${t}`,
  `refs/tags/${t}`,
  `refs/heads/${t}`,
  `refs/remotes/${t}`,
  `refs/remotes/${t}/HEAD`
], Dw = ["config", "description", "index", "shallow", "commondir"];
let ja;
async function Yt(t, e) {
  return ja === void 0 && (ja = new br()), ja.acquire(t, e);
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
    pruneTags: c = !1
  }) {
    for (const m of a.values())
      if (!m.match(/[0-9a-f]{40}/))
        throw new ie(m);
    const f = await J.get({ fs: e, gitdir: r });
    if (!s) {
      if (s = await f.getall(`remote.${n}.fetch`), s.length === 0)
        throw new Nr(n);
      s.unshift(`+HEAD:refs/remotes/${n}/HEAD`);
    }
    const u = vi.from(s), d = /* @__PURE__ */ new Map();
    if (c) {
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
    const i = await T.packedRefs({ fs: e, gitdir: r }), o = un(n).filter((s) => !Dw.includes(s));
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
    const a = await T.packedRefs({ fs: e, gitdir: r }), i = un(n);
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
    const n = un(e);
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
    const i = un(e);
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
    return i.sort(vw), i;
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
function Nw(t, e) {
  return Hn(rs(t), rs(e));
}
function rs(t) {
  return t.mode === "040000" ? t.path + "/" : t.path;
}
function Cc(t) {
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
function Fw(t) {
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
    const o = Cc(i), s = t.slice(n + 1, a).toString("utf8");
    if (s.includes("\\") || s.includes("/"))
      throw new Xe(s);
    const l = t.slice(a + 1, a + 21).toString("hex");
    r = a + 21, e.push({ mode: i, path: s, oid: l, type: o });
  }
  return e;
}
function jw(t) {
  if (typeof t == "number" && (t = t.toString(8)), t.match(/^0?4.*/)) return "040000";
  if (t.match(/^1006.*/)) return "100644";
  if (t.match(/^1007.*/)) return "100755";
  if (t.match(/^120.*/)) return "120000";
  if (t.match(/^160.*/)) return "160000";
  throw new F(`Could not understand file mode: ${t}`);
}
function Uw(t) {
  return !t.oid && t.sha && (t.oid = t.sha), t.mode = jw(t.mode), t.type || (t.type = Cc(t.mode)), t;
}
class ut {
  constructor(e) {
    if (Buffer.isBuffer(e))
      this._entries = Fw(e);
    else if (Array.isArray(e))
      this._entries = e.map(Uw);
    else
      throw new F("invalid type passed to GitTree constructor");
    this._entries.sort(Tc);
  }
  static from(e) {
    return new ut(e);
  }
  render() {
    return this._entries.map((e) => `${e.mode} ${e.type} ${e.oid}    ${e.path}`).join(`
`);
  }
  toObject() {
    const e = [...this._entries];
    return e.sort(Nw), Buffer.concat(
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
class Ke {
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
async function Dc({ fs: t, gitdir: e, oid: r }) {
  const n = `objects/${r.slice(0, 2)}/${r.slice(2)}`, a = await t.read(`${e}/${n}`);
  return a ? { object: a, format: "deflated", source: n } : null;
}
function Mw(t, e) {
  const r = new Mt(t), n = ns(r);
  if (n !== e.byteLength)
    throw new F(
      `applyDelta expected source buffer to be ${n} bytes but the provided buffer was ${e.length} bytes`
    );
  const a = ns(r);
  let i;
  const o = is(r, e);
  if (o.byteLength === a)
    i = o;
  else {
    i = Buffer.alloc(a);
    const s = new Mt(i);
    for (s.copy(o); !r.eof(); )
      s.copy(is(r, e));
    const l = s.tell();
    if (a !== l)
      throw new F(
        `applyDelta expected target buffer to be ${a} bytes but the resulting buffer was ${l} bytes`
      );
  }
  return i;
}
function ns(t) {
  let e = 0, r = 0, n = null;
  do
    n = t.readUInt8(), e |= (n & 127) << r, r += 7;
  while (n & 128);
  return e;
}
function as(t, e, r) {
  let n = 0, a = 0;
  for (; r--; )
    e & 1 && (n |= t.readUInt8() << a), e >>= 1, a += 8;
  return n;
}
function is(t, e) {
  const r = t.readUInt8(), n = 128, a = 15, i = 112;
  if (r & n) {
    const o = as(t, r & a, 4);
    let s = as(t, (r & i) >> 4, 3);
    return s === 0 && (s = 65536), e.slice(o, o + s);
  } else
    return t.slice(r);
}
function zw(t) {
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
function Nc(t) {
  return t[Symbol.asyncIterator] ? t[Symbol.asyncIterator]() : t[Symbol.iterator] ? t[Symbol.iterator]() : t.next ? t : zw(t);
}
class Fc {
  constructor(e) {
    if (typeof Buffer > "u")
      throw new Error("Missing Buffer dependency");
    this.stream = Nc(e), this.buffer = null, this.cursor = 0, this.undoCursor = 0, this.started = !1, this._ended = !1, this._discardedBytes = 0;
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
    for (; this.cursor + e > Lw(r); ) {
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
function Lw(t) {
  return t.reduce((e, r) => e + r.length, 0);
}
async function Hw(t, e) {
  const r = new Fc(t);
  let n = await r.read(4);
  if (n = n.toString("utf8"), n !== "PACK")
    throw new F(`Invalid PACK header '${n}'`);
  let a = await r.read(4);
  if (a = a.readUInt32BE(0), a !== 2)
    throw new F(`Invalid packfile version: ${a}`);
  let i = await r.read(4);
  if (i = i.readUInt32BE(0), !(i < 1))
    for (; !r.eof() && i--; ) {
      const o = r.tell(), { type: s, length: l, ofs: c, reference: f } = await Gw(r), u = new bi.Inflate();
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
            reference: f,
            ofs: c
          });
        }
      }
    }
}
async function Gw(t) {
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
async function jc(t) {
  return bi.inflate(t);
}
function Ww(t) {
  const e = [];
  let r = 0, n = 0;
  do {
    r = t.readUInt8();
    const a = r & 127;
    e.push(a), n = r & 128;
  } while (n);
  return e.reduce((a, i) => a + 1 << 7 | i, -1);
}
function qw(t, e) {
  let r = e, n = 4, a = null;
  do
    a = t.readUInt8(), r |= (a & 127) << n, n += 7;
  while (a & 128);
  return r;
}
class ze {
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
    for (let f = 0; f < o; f++) {
      const u = n.slice(20).toString("hex");
      s[f] = u;
    }
    n.seek(n.tell() + 4 * o);
    const l = /* @__PURE__ */ new Map();
    for (let f = 0; f < o; f++)
      l.set(s[f], n.readUInt32BE());
    const c = n.slice(20).toString("hex");
    return new ze({
      hashes: s,
      crcs: {},
      offsets: l,
      packfileSha: c,
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
    }, i = {}, o = e.slice(-20).toString("hex"), s = [], l = {}, c = /* @__PURE__ */ new Map();
    let f = null, u = null;
    await Hw([e], async ({ data: m, type: y, reference: _, offset: v, num: S }) => {
      f === null && (f = S);
      const k = Math.floor(
        (f - S) * 100 / f
      );
      k !== u && n && await n({
        phase: "Receiving objects",
        loaded: f - S,
        total: f
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
      const _ = m + 1 === d.length ? e.byteLength - 20 : d[m + 1], v = i[y], S = sw.buf(e.slice(y, _)) >>> 0;
      v.end = _, v.crc = S;
    }
    const h = new ze({
      pack: Promise.resolve(e),
      packfileSha: o,
      crcs: l,
      hashes: s,
      offsets: c,
      getExternalRefDelta: r
    });
    u = null;
    let w = 0;
    const p = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let m in i) {
      m = Number(m);
      const y = Math.floor(w * 100 / f);
      y !== u && n && await n({
        phase: "Resolving deltas",
        loaded: w,
        total: f
      }), w++, u = y;
      const _ = i[m];
      if (!_.oid)
        try {
          h.readDepth = 0, h.externalReadDepth = 0;
          const { type: v, object: S } = await h.readSlice({ start: m });
          p[h.readDepth] += 1;
          const k = await Vt(Ke.wrap({ type: v, object: S }));
          _.oid = k, s.push(k), c.set(k, m), l[k] = _.crc;
        } catch {
          continue;
        }
    }
    return s.sort(), h;
  }
  async toBuffer() {
    const e = [], r = (c, f) => {
      e.push(Buffer.from(c, f));
    };
    r("ff744f63", "hex"), r("00000002", "hex");
    const n = new Mt(Buffer.alloc(256 * 4));
    for (let c = 0; c < 256; c++) {
      let f = 0;
      for (const u of this.hashes)
        parseInt(u.slice(0, 2), 16) <= c && f++;
      n.writeUInt32BE(f);
    }
    e.push(n.buffer);
    for (const c of this.hashes)
      r(c, "hex");
    const a = new Mt(Buffer.alloc(this.hashes.length * 4));
    for (const c of this.hashes)
      a.writeUInt32BE(this.crcs[c]);
    e.push(a.buffer);
    const i = new Mt(Buffer.alloc(this.hashes.length * 4));
    for (const c of this.hashes)
      i.writeUInt32BE(this.offsets.get(c));
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
    const c = o & 15;
    let f = c;
    o & 128 && (f = qw(i, c));
    let d = null, h = null;
    if (l === "ofs_delta") {
      const p = Ww(i), m = e - p;
      ({ object: d, type: l } = await this.readSlice({ start: m }));
    }
    if (l === "ref_delta") {
      const p = i.slice(20).toString("hex");
      ({ object: d, type: l } = await this.read({ oid: p }));
    }
    const w = a.slice(i.tell());
    if (h = Buffer.from(await jc(w)), h.byteLength !== f)
      throw new F(
        `Packfile told us object would have length ${f} but it had length ${h.byteLength}`
      );
    return d && (h = Buffer.from(Mw(h, d))), this.readDepth > 3 && (this.offsetCache[e] = { type: l, object: h }), { type: l, format: "content", object: h };
  }
}
const dn = Symbol("PackfileCache");
async function Zw({
  fs: t,
  filename: e,
  getExternalRefDelta: r,
  emitter: n,
  emitterPrefix: a
}) {
  const i = await t.read(e);
  return ze.fromIdx({ idx: i, getExternalRefDelta: r });
}
function Ei({
  fs: t,
  cache: e,
  filename: r,
  getExternalRefDelta: n,
  emitter: a,
  emitterPrefix: i
}) {
  e[dn] || (e[dn] = /* @__PURE__ */ new Map());
  let o = e[dn].get(r);
  return o || (o = Zw({
    fs: t,
    filename: r,
    getExternalRefDelta: n,
    emitter: a,
    emitterPrefix: i
  }), e[dn].set(r, o)), o;
}
const os = 8 * 1024 * 1024;
async function Vw(t, { start: e = 0, end: r = t.length } = {}) {
  const n = cw.createHash("sha1");
  for (let a = e; a < r; a += os)
    n.update(t.subarray(a, Math.min(a + os, r)));
  return n.digest("hex");
}
async function Xw({
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
    const l = `${r}/objects/pack/${s}`, c = await Ei({
      fs: t,
      cache: e,
      filename: l,
      getExternalRefDelta: i
    });
    if (c.error) throw new F(c.error);
    if (c.offsets.has(n)) {
      const f = l.replace(/idx$/, "pack");
      c.pack || (c.pack = t.read(f));
      const u = await c.pack;
      if (!u)
        throw c.pack = null, new F(
          `Could not read packfile at ${f}. The file may be missing, corrupted, or too large to read into memory.`
        );
      if (!c._checksumVerified) {
        const h = c.packfileSha, w = u.subarray(-20), p = Array.from(w).map((y) => y.toString(16).padStart(2, "0")).join("");
        if (p !== h)
          throw new F(
            `Packfile trailer mismatch: expected ${h}, got ${p}. The packfile may be corrupted.`
          );
        const m = await Vw(u, {
          start: 0,
          end: u.length - 20
        });
        if (m !== h)
          throw new F(
            `Packfile payload corrupted: calculated ${m} but expected ${h}. The packfile may have been tampered with.`
          );
        c._checksumVerified = !0;
      }
      const d = await c.read({ oid: n, getExternalRefDelta: i });
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
  const i = (f) => G({ fs: t, cache: e, gitdir: r, oid: f });
  let o;
  if (n === "4b825dc642cb6eb9a060e54bf8d69288fbee4904" && (o = { format: "wrapped", object: Buffer.from("tree 0\0") }), o || (o = await Dc({ fs: t, gitdir: r, oid: n })), !o) {
    if (o = await Xw({
      fs: t,
      cache: e,
      gitdir: r,
      oid: n,
      getExternalRefDelta: i
    }), !o)
      throw new H(n);
    return o;
  }
  if (a === "deflated" || (o.format === "deflated" && (o.object = Buffer.from(await jc(o.object)), o.format = "wrapped"), a === "wrapped"))
    return o;
  const s = await Vt(o.object);
  if (s !== n)
    throw new F(
      `SHA check failed! Expected ${n}, computed ${s}`
    );
  const { object: l, type: c } = Ke.unwrap(o.object);
  if (o.type = c, o.object = l, o.format = "content", a === "content")
    return o;
  throw new F(`invalid requested format "${a}"`);
}
class Ot extends U {
  /**
   * @param {'note'|'remote'|'tag'|'branch'} noun
   * @param {string} where
   * @param {boolean} canForce
   */
  constructor(e, r, n = !0) {
    super(
      `Failed to create ${e} at ${r} because it already exists.${n ? ` (Hint: use 'force: true' parameter to overwrite existing ${e}.)` : ""}`
    ), this.code = this.name = Ot.code, this.data = { noun: e, where: r, canForce: n };
  }
}
Ot.code = "AlreadyExistsError";
class Fr extends U {
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
    ), this.code = this.name = Fr.code, this.data = { nouns: e, short: r, matches: n };
  }
}
Fr.code = "AmbiguousError";
class jr extends U {
  /**
   * @param {string[]} filepaths
   */
  constructor(e) {
    super(
      `Your local changes to the following files would be overwritten by checkout: ${e.join(
        ", "
      )}`
    ), this.code = this.name = jr.code, this.data = { filepaths: e };
  }
}
jr.code = "CheckoutConflictError";
class Ur extends U {
  /**
   * @param {string} oid
   * @param {number} parentCount
   */
  constructor(e, r) {
    super(
      `Cannot cherry-pick merge commit ${e}. Merge commits have ${r} parents and require specifying which parent to use as the base.`
    ), this.code = this.name = Ur.code, this.data = { oid: e, parentCount: r };
  }
}
Ur.code = "CherryPickMergeCommitError";
class Mr extends U {
  /**
   * @param {string} oid
   */
  constructor(e) {
    super(
      `Cannot cherry-pick root commit ${e}. Root commits have no parents.`
    ), this.code = this.name = Mr.code, this.data = { oid: e };
  }
}
Mr.code = "CherryPickRootCommitError";
class zr extends U {
  /**
   * @param {string} ref
   * @param {string} oid
   */
  constructor(e, r) {
    super(
      `Failed to checkout "${e}" because commit ${r} is not available locally. Do a git fetch to make the branch available locally.`
    ), this.code = this.name = zr.code, this.data = { ref: e, oid: r };
  }
}
zr.code = "CommitNotFetchedError";
class Lr extends U {
  constructor() {
    super("Empty response from git server."), this.code = this.name = Lr.code, this.data = {};
  }
}
Lr.code = "EmptyServerResponseError";
class Hr extends U {
  constructor() {
    super("A simple fast-forward merge was not possible."), this.code = this.name = Hr.code, this.data = {};
  }
}
Hr.code = "FastForwardError";
class Gr extends U {
  /**
   * @param {string} prettyDetails
   * @param {PushResult} result
   */
  constructor(e, r) {
    super(`One or more branches were not updated: ${e}`), this.code = this.name = Gr.code, this.data = { prettyDetails: e, result: r };
  }
}
Gr.code = "GitPushError";
class Le extends U {
  /**
   * @param {number} statusCode
   * @param {string} statusMessage
   * @param {string} response
   */
  constructor(e, r, n) {
    super(`HTTP Error: ${e} ${r}`), this.code = this.name = Le.code, this.data = { statusCode: e, statusMessage: r, response: n };
  }
}
Le.code = "HttpError";
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
class $t extends U {
  /**
   * @param {string} ref
   * @param {string} suggestion
   * @param {boolean} canForce
   */
  constructor(e, r) {
    super(
      `"${e}" would be an invalid git reference. (Hint: a valid alternative would be "${r}".)`
    ), this.code = this.name = $t.code, this.data = { ref: e, suggestion: r };
  }
}
$t.code = "InvalidRefNameError";
class Wr extends U {
  /**
   * @param {number} depth
   */
  constructor(e) {
    super(`Maximum search depth of ${e} exceeded.`), this.code = this.name = Wr.code, this.data = { depth: e };
  }
}
Wr.code = "MaxDepthError";
class Ye extends U {
  constructor() {
    super("Merges with conflicts are not supported yet."), this.code = this.name = Ye.code, this.data = {};
  }
}
Ye.code = "MergeNotSupportedError";
class Re extends U {
  /**
   * @param {Array<string>} filepaths
   * @param {Array<string>} bothModified
   * @param {Array<string>} deleteByUs
   * @param {Array<string>} deleteByTheirs
   */
  constructor(e, r, n, a) {
    super(
      `Automatic merge failed with one or more merge conflicts in the following files: ${e.toString()}. Fix conflicts then commit the result.`
    ), this.code = this.name = Re.code, this.data = { filepaths: e, bothModified: r, deleteByUs: n, deleteByTheirs: a };
  }
}
Re.code = "MergeConflictError";
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
class lt extends U {
  /**
   * @param {string} parameter
   */
  constructor(e) {
    super(
      `The function requires a "${e}" parameter but none was provided.`
    ), this.code = this.name = lt.code, this.data = { parameter: e };
  }
}
lt.code = "MissingParameterError";
class qr extends U {
  /**
   * @param {Error[]} errors
   * @param {string} message
   */
  constructor(e) {
    super(
      'There are multiple errors that were thrown by the method. Please refer to the "errors" property to see more'
    ), this.code = this.name = qr.code, this.data = { errors: e }, this.errors = e;
  }
}
qr.code = "MultipleGitError";
class Oe extends U {
  /**
   * @param {string} expected
   * @param {string} actual
   */
  constructor(e, r) {
    super(`Expected "${e}" but received "${r}".`), this.code = this.name = Oe.code, this.data = { expected: e, actual: r };
  }
}
Oe.code = "ParseError";
class He extends U {
  /**
   * @param {'not-fast-forward'|'tag-exists'} reason
   */
  constructor(e) {
    let r = "";
    e === "not-fast-forward" ? r = " because it was not a simple fast-forward" : e === "tag-exists" && (r = " because tag already exists"), super(`Push rejected${r}. Use "force: true" to override.`), this.code = this.name = He.code, this.data = { reason: e };
  }
}
He.code = "PushRejectedError";
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
class Zr extends U {
  /**
   * @param {string} preview
   * @param {string} response
   */
  constructor(e, r) {
    super(
      `Remote did not reply using the "smart" HTTP protocol. Expected "001e# service=git-upload-pack" but received: ${e}`
    ), this.code = this.name = Zr.code, this.data = { preview: e, response: r };
  }
}
Zr.code = "SmartHttpError";
class Vr extends U {
  /**
   * @param {string} url
   * @param {string} transport
   * @param {string} [suggestion]
   */
  constructor(e, r, n) {
    super(
      `Git remote "${e}" uses an unrecognized transport protocol: "${r}"`
    ), this.code = this.name = Vr.code, this.data = { url: e, transport: r, suggestion: n };
  }
}
Vr.code = "UnknownTransportError";
class Xr extends U {
  /**
   * @param {string} url
   */
  constructor(e) {
    super(`Cannot parse remote URL: "${e}"`), this.code = this.name = Xr.code, this.data = { url: e };
  }
}
Xr.code = "UrlParseError";
class Je extends U {
  constructor() {
    super("The operation was canceled."), this.code = this.name = Je.code, this.data = {};
  }
}
Je.code = "UserCanceledError";
class Kr extends U {
  /**
   * @param {Array<string>} filepaths
   */
  constructor(e) {
    super(
      `Could not merge index: Entry for '${e}' is not up to date. Either reset the index entry to HEAD, or stage your unstaged changes.`
    ), this.code = this.name = Kr.code, this.data = { filepath: e };
  }
}
Kr.code = "IndexResetError";
class Yr extends U {
  /**
   * @param {string} ref
   */
  constructor(e) {
    super(
      `"${e}" does not point to any commit. You're maybe working on a repository with no commits yet. `
    ), this.code = this.name = Yr.code, this.data = { ref: e };
  }
}
Yr.code = "NoCommitError";
var Uc = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  AlreadyExistsError: Ot,
  AmbiguousError: Fr,
  CheckoutConflictError: jr,
  CherryPickMergeCommitError: Ur,
  CherryPickRootCommitError: Mr,
  CommitNotFetchedError: zr,
  EmptyServerResponseError: Lr,
  FastForwardError: Hr,
  GitPushError: Gr,
  HttpError: Le,
  InternalError: F,
  InvalidFilepathError: oe,
  InvalidOidError: ie,
  InvalidRefNameError: $t,
  MaxDepthError: Wr,
  MergeNotSupportedError: Ye,
  MergeConflictError: Re,
  MissingNameError: at,
  MissingParameterError: lt,
  MultipleGitError: qr,
  NoRefspecError: Nr,
  NotFoundError: H,
  ObjectTypeError: ct,
  ParseError: Oe,
  PushRejectedError: He,
  RemoteCapabilityError: ne,
  SmartHttpError: Zr,
  UnknownTransportError: Vr,
  UnsafeFilepathError: Xe,
  UrlParseError: Xr,
  UserCanceledError: Je,
  UnmergedPathsError: Dr,
  IndexResetError: Kr,
  NoCommitError: Yr
});
function ai({ name: t, email: e, timestamp: r, timezoneOffset: n }) {
  return n = Kw(n), `${t} <${e}> ${r} ${n}`;
}
function Kw(t) {
  const e = Yw(Jw(t));
  t = Math.abs(t);
  const r = Math.floor(t / 60);
  t -= r * 60;
  let n = String(r), a = String(t);
  return n.length < 2 && (n = "0" + n), a.length < 2 && (a = "0" + a), (e === -1 ? "-" : "+") + n + a;
}
function Yw(t) {
  return Math.sign(t) || (Object.is(t, -0) ? -1 : 1);
}
function Jw(t) {
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
    timezoneOffset: Qw(a)
  };
}
function Qw(t) {
  let [, e, r, n] = t.match(/(\+|-)(\d\d)(\d\d)/);
  return n = (e === "+" ? 1 : -1) * (Number(r) * 60 + Number(n)), tp(n);
}
function tp(t) {
  return t === 0 ? t : -t;
}
class st {
  constructor(e) {
    if (typeof e == "string")
      this._tag = e;
    else if (Buffer.isBuffer(e))
      this._tag = e.toString("utf8");
    else if (typeof e == "object")
      this._tag = st.render(e);
    else
      throw new F(
        "invalid type passed to GitAnnotatedTag constructor"
      );
  }
  static from(e) {
    return new st(e);
  }
  static render(e) {
    return `object ${e.object}
type ${e.type}
tag ${e.tag}
tagger ${ai(e.tagger)}

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
    return st.from(o);
  }
}
function Ua(t) {
  return t.trim().split(`
`).map((e) => " " + e).join(`
`) + `
`;
}
function ep(t) {
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
gpgsig` + Ua(r) + `
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
    r += `author ${ai(n)}
`;
    const a = e.committer || e.author;
    return r += `committer ${ai(a)}
`, e.gpgsig && (r += "gpgsig" + Ua(e.gpgsig)), r;
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
    return ep(e);
  }
  static async sign(e, r, n) {
    const a = e.withoutSignature(), i = q.justMessage(e._commit);
    let { signature: o } = await r({ payload: a, secretKey: n });
    o = Wt(o);
    const l = q.justHeaders(e._commit) + `
gpgsig` + Ua(o) + `
` + i;
    return q.from(l);
  }
}
async function Ge({ fs: t, cache: e, gitdir: r, oid: n }) {
  if (n === "4b825dc642cb6eb9a060e54bf8d69288fbee4904")
    return { tree: ut.from([]), oid: n };
  const { type: a, object: i } = await G({ fs: t, cache: e, gitdir: r, oid: n });
  if (a === "tag")
    return n = st.from(i).parse().object, Ge({ fs: t, cache: e, gitdir: r, oid: n });
  if (a === "commit")
    return n = q.from(i).parse().tree, Ge({ fs: t, cache: e, gitdir: r, oid: n });
  if (a !== "tree")
    throw new ct(n, a, "tree");
  return { tree: ut.from(i), oid: n };
}
class rp {
  constructor({ fs: e, gitdir: r, ref: n, cache: a }) {
    this.fs = e, this.cache = a, this.gitdir = r, this.mapPromise = (async () => {
      const o = /* @__PURE__ */ new Map();
      let s;
      try {
        s = await T.resolve({ fs: e, gitdir: r, ref: n });
      } catch (c) {
        c instanceof H && (s = "4b825dc642cb6eb9a060e54bf8d69288fbee4904");
      }
      const l = await Ge({ fs: e, cache: this.cache, gitdir: r, oid: s });
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
    const { type: c, object: f } = await G({ fs: n, cache: a, gitdir: i, oid: l });
    if (c !== s.type)
      throw new ct(l, c, s.type);
    const u = ut.from(f);
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
      e._mode = Ic(parseInt(n, 8));
    }
    return e._mode;
  }
  async stat(e) {
  }
  async content(e) {
    if (e._content === !1) {
      const r = await this.mapPromise, { fs: n, cache: a, gitdir: i } = this, s = r.get(e._fullpath).oid, { type: l, object: c } = await G({ fs: n, cache: a, gitdir: i, oid: s });
      l !== "blob" ? e._content = void 0 : e._content = new Uint8Array(c);
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
function mt({ ref: t = "HEAD" } = {}) {
  const e = /* @__PURE__ */ Object.create(null);
  return Object.defineProperty(e, Gn, {
    value: function({ fs: r, gitdir: n, cache: a }) {
      return new rp({ fs: r, gitdir: n, ref: t, cache: a });
    }
  }), Object.freeze(e), e;
}
class np {
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
      i === "blob" && !a.isFile() && !a.isSymbolicLink() && (i = "special"), e._type = i, a = Me(a), e._mode = a.mode, a.size === -1 && e._actualSize && (a.size = e._actualSize), e._stat = a;
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
          const l = s.entriesMap.get(e._fullpath), c = await e.stat(), u = await (await r._getGitConfig(n, a)).get("core.filemode"), d = typeof process < "u" ? process.platform !== "win32" : !0;
          if (!l || Rn(c, l, u, d)) {
            const h = await e.content();
            h === void 0 ? o = void 0 : (o = await Vt(
              Ke.wrap({ type: "blob", object: h })
            ), l && o === l.oid && (!u || c.mode === l.mode) && Rn(c, l, u, d) && s.insert({
              filepath: e._fullpath,
              stats: c,
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
function Qe() {
  const t = /* @__PURE__ */ Object.create(null);
  return Object.defineProperty(t, Gn, {
    value: function({ fs: e, dir: r, gitdir: n, cache: a }) {
      return new np({ fs: e, dir: r, gitdir: n, cache: a });
    }
  }), Object.freeze(t), t;
}
function ap(t, e) {
  const r = e - t;
  return Array.from({ length: r }, (n, a) => t + a);
}
const Mc = typeof Array.prototype.flat > "u" ? (t) => t.reduce((e, r) => e.concat(r), []) : (t) => t.flat();
class ip {
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
function* op(t) {
  const e = new ip();
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
  map: i = async (l, c) => c,
  // The default reducer is a flatmap that filters out undefineds.
  reduce: o = async (l, c) => {
    const f = Mc(c);
    return l !== void 0 && f.unshift(l), f;
  },
  // The default iterate function walks all children concurrently
  iterate: s = (l, c) => Promise.all([...c].map(l))
}) {
  const l = a.map(
    (h) => h[Gn]({ fs: t, dir: r, gitdir: n, cache: e })
  ), c = new Array(l.length).fill("."), f = ap(0, l.length), u = async (h) => {
    f.forEach((m) => {
      const y = h[m];
      h[m] = y && new l[m].ConstructEntry(y);
    });
    const p = (await Promise.all(
      f.map((m) => {
        const y = h[m];
        return y ? l[m].readdir(y) : [];
      })
    )).map((m) => (m === null ? [] : m)[Symbol.iterator]());
    return {
      entries: h,
      children: op(p)
    };
  }, d = async (h) => {
    const { entries: w, children: p } = await u(h), m = w.find((_) => _ && _._fullpath)._fullpath, y = await i(m, w);
    if (y !== null) {
      let _ = await s(d, p);
      return _ = _.filter((v) => v !== void 0), o(y, _);
    }
  };
  return d(c);
}
async function ii(t, e) {
  const r = await t.readdir(e);
  r == null ? await t.rm(e) : r.length ? await Promise.all(
    r.map((n) => {
      const a = R(e, n);
      return t.lstat(a).then((i) => {
        if (i)
          return i.isDirectory() ? ii(t, a) : t.rm(a);
      });
    })
  ).then(() => t.rmdir(e)) : await t.rmdir(e);
}
function sp(t) {
  return cp(t) && ss(t.then) && ss(t.catch);
}
function cp(t) {
  return t && typeof t == "object";
}
function ss(t) {
  return typeof t == "function";
}
function cs(t) {
  return sp(((r) => {
    try {
      return r.readFile().catch((n) => n);
    } catch (n) {
      return n;
    }
  })(t));
}
const fs = [
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
function ls(t, e) {
  if (cs(e))
    for (const r of fs)
      t[`_${r}`] = e[r].bind(e);
  else
    for (const r of fs)
      t[`_${r}`] = ln(e[r].bind(e));
  cs(e) ? (e.cp && (t._cp = e.cp.bind(e)), e.rm ? t._rm = e.rm.bind(e) : e.rmdir.length > 1 ? t._rm = e.rmdir.bind(e) : t._rm = ii.bind(null, t)) : (e.cp && (t._cp = ln(e.cp.bind(e))), e.rm ? t._rm = ln(e.rm.bind(e)) : e.rmdir.length > 2 ? t._rm = ln(e.rmdir.bind(e)) : t._rm = ii.bind(null, t));
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
    r && r.enumerable ? ls(this, e.promises) : ls(this, e), this._original_unwrapped_fs = e;
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
      await this.mkdir(Ee(e)), await this._writeFile(e, r, n);
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
        const a = Ee(e);
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
    throw new lt(t);
}
function fp(t) {
  return t.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(t);
}
async function D({ fsp: t, dotgit: e }) {
  b("fsp", t), b("dotgit", e);
  const r = await t._stat(e).catch(() => ({ isFile: () => !1, isDirectory: () => !1 }));
  return r.isDirectory() ? e : r.isFile() ? t._readFile(e, "utf8").then((n) => n.trimRight().substr(8)).then((n) => fp(n) ? n : R(Ee(e), n)) : e;
}
async function Bn(t, e) {
  return !t && !e ? !1 : t && !e || !t && e ? !0 : !(await t.type() === "tree" && await e.type() === "tree" || await t.type() === await e.type() && await t.mode() === await e.mode() && await t.oid() === await e.oid());
}
async function zc({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  commit: n = "HEAD",
  cache: a = {}
}) {
  try {
    b("fs", t), b("dir", e), b("gitdir", r);
    const i = new C(t), o = [mt({ ref: n }), Qe(), $e()];
    let s = [];
    const l = await D({ fsp: i, dotgit: r });
    await Y.acquire(
      { fs: i, gitdir: l, cache: a },
      async function(f) {
        s = f.unmergedPaths;
      }
    );
    const c = await se({
      fs: i,
      cache: a,
      dir: e,
      gitdir: l,
      trees: o,
      map: async function(f, [u, d, h]) {
        const w = !await Bn(d, h), p = s.includes(f), m = !await Bn(h, u);
        if (w || p)
          return u ? {
            path: f,
            mode: await u.mode(),
            oid: await u.oid(),
            type: await u.type(),
            content: await u.content()
          } : void 0;
        if (m) return !1;
        throw new Kr(f);
      }
    });
    await Y.acquire(
      { fs: i, gitdir: l, cache: a },
      async function(f) {
        for (const u of c)
          if (u !== !1) {
            if (!u) {
              await i.rmdir(`${e}/${u.path}`, { recursive: !0 }), f.delete({ filepath: u.path });
              continue;
            }
            if (u.type === "blob") {
              const d = new TextDecoder().decode(u.content);
              await i.write(`${e}/${u.path}`, d, {
                mode: u.mode
              }), f.insert({
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
class tr {
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
    for (let f = 1; f < l.length; f++) {
      const u = l.slice(0, f).join("/"), d = l.slice(f).join("/");
      s.push({
        gitignore: R(r, u, ".gitignore"),
        filepath: d
      });
    }
    let c = !1;
    for (const f of s) {
      let u;
      try {
        u = await e.read(f.gitignore, "utf8");
      } catch (w) {
        if (w.code === "NOENT") continue;
      }
      const d = fw().add(i);
      d.add(u);
      const h = Ee(f.filepath);
      if (h !== "." && d.ignores(h)) return !0;
      c ? c = !d.test(f.filepath).unignored : c = d.test(f.filepath).ignored;
    }
    return c;
  }
}
async function lp({ fs: t, gitdir: e, object: r, format: n, oid: a }) {
  const i = `objects/${a.slice(0, 2)}/${a.slice(2)}`, o = `${e}/${i}`;
  await t.exists(o) || await t.write(o, r);
}
let Ma = null;
async function Lc(t) {
  return Ma === null && (Ma = dp()), Ma ? up(t) : bi.deflate(t);
}
async function up(t) {
  const e = new CompressionStream("deflate"), r = new Blob([t]).stream().pipeThrough(e);
  return new Uint8Array(await new Response(r).arrayBuffer());
}
function dp() {
  try {
    return new CompressionStream("deflate").writable.close(), new Blob([]).stream().cancel(), !0;
  } catch {
    return !1;
  }
}
async function dt({
  fs: t,
  gitdir: e,
  type: r,
  object: n,
  format: a = "content",
  oid: i = void 0,
  dryRun: o = !1
}) {
  return a !== "deflated" && (a !== "wrapped" && (n = Ke.wrap({ type: r, object: n })), i = await Vt(n), n = Buffer.from(await Lc(n))), o || await lp({ fs: t, gitdir: e, object: n, format: "deflated", oid: i }), i;
}
function Hc(t) {
  let e;
  for (; ~(e = t.indexOf(92)); ) t[e] = 47;
  return t;
}
async function Gc({
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
      async (c) => {
        const u = await (await J.get({ fs: s, gitdir: l })).get("core.autocrlf");
        return oi({
          dir: e,
          gitdir: l,
          fs: s,
          filepath: n,
          index: c,
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
async function oi({
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
    if (!i && await tr.isIgnored({
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
          (m) => oi({
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
          await oi({
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
      const w = h.isSymbolicLink() ? await r.readlink(R(t, d)).then(Hc) : await r.read(R(t, d), { autocrlf: s });
      if (w === null) throw new H(d);
      const p = await dt({ fs: r, gitdir: e, type: "blob", object: w });
      a.insert({ filepath: d, stats: h, oid: p });
    }
  }), c = await Promise.allSettled(l), f = c.filter((d) => d.status === "rejected").map((d) => d.reason);
  if (f.length > 1)
    throw new qr(f);
  if (f.length === 1)
    throw f[0];
  return c.filter((d) => d.status === "fulfilled" && d.value).map((d) => d.value);
}
async function xr({ fs: t, gitdir: e, path: r }) {
  return (await J.get({ fs: t, gitdir: e })).get(r);
}
function Wc(t, ...e) {
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
    name: await xr({ fs: t, gitdir: e, path: "user.name" }),
    email: await xr({ fs: t, gitdir: e, path: "user.email" }) || "",
    // author.email is allowed to be empty string
    timestamp: a,
    timezoneOffset: new Date(a * 1e3).getTimezoneOffset()
  }, o = Wc(
    {},
    i,
    n ? n.author : void 0,
    r
  );
  if (o.name !== void 0)
    return o;
}
async function Se({
  fs: t,
  gitdir: e,
  author: r,
  committer: n,
  commit: a
}) {
  const i = Math.floor(Date.now() / 1e3), o = {
    name: await xr({ fs: t, gitdir: e, path: "user.name" }),
    email: await xr({ fs: t, gitdir: e, path: "user.email" }) || "",
    // committer.email is allowed to be empty string
    timestamp: i,
    timezoneOffset: new Date(i * 1e3).getTimezoneOffset()
  }, s = Wc(
    {},
    o,
    a ? a.committer : void 0,
    r,
    n
  );
  if (s.name !== void 0)
    return s;
}
async function qc({ fs: t, cache: e, gitdir: r, oid: n }) {
  const { type: a, object: i } = await G({ fs: t, cache: e, gitdir: r, oid: n });
  if (a === "tag")
    return n = st.from(i).parse().object, qc({ fs: t, cache: e, gitdir: r, oid: n });
  if (a !== "commit")
    throw new ct(n, a, "commit");
  return { commit: q.from(i), oid: n };
}
async function zt({ fs: t, cache: e, gitdir: r, oid: n }) {
  const { commit: a, oid: i } = await qc({
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
async function Jr({
  fs: t,
  cache: e,
  onSign: r,
  gitdir: n,
  message: a,
  author: i,
  committer: o,
  signingKey: s,
  amend: l = !1,
  dryRun: c = !1,
  noUpdateBranch: f = !1,
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
    throw new Yr(u);
  const _ = l ? await ce({
    fs: t,
    gitdir: n,
    author: i,
    commit: y.commit
  }) : await ce({ fs: t, gitdir: n, author: i });
  if (!_) throw new at("author");
  const v = l ? await Se({
    fs: t,
    gitdir: n,
    author: _,
    committer: o,
    commit: y.commit
  }) : await Se({
    fs: t,
    gitdir: n,
    author: _,
    committer: o
  });
  if (!v) throw new at("committer");
  return Y.acquire(
    { fs: t, gitdir: n, cache: e, allowUnmerged: !1 },
    async function(S) {
      const O = Bc(S.entries).get(".");
      if (h || (h = await Zc({ fs: t, gitdir: n, inode: O, dryRun: c })), d ? d = await Promise.all(
        d.map((E) => T.resolve({ fs: t, gitdir: n, ref: E }))
      ) : l ? d = y.commit.parent : d = m ? [m] : [], !a)
        if (l)
          a = y.commit.message;
        else
          throw new lt("message");
      let x = q.from({
        tree: h,
        parent: d,
        author: _,
        committer: v,
        message: a
      });
      s && (x = await q.sign(x, r, s));
      const g = await dt({
        fs: t,
        gitdir: n,
        type: "commit",
        object: x.toObject(),
        dryRun: c
      });
      return !f && !c && await T.writeRef({
        fs: t,
        gitdir: n,
        ref: p ? "HEAD" : u,
        value: g
      }), g;
    }
  );
}
async function Zc({ fs: t, gitdir: e, inode: r, dryRun: n }) {
  const a = r.children;
  for (const l of a)
    l.type === "tree" && (l.metadata.mode = "040000", l.metadata.oid = await Zc({ fs: t, gitdir: e, inode: l, dryRun: n }));
  const i = a.map((l) => ({
    mode: l.metadata.mode,
    path: l.basename,
    oid: l.metadata.oid,
    type: l.type
  })), o = ut.from(i);
  return await dt({
    fs: t,
    gitdir: e,
    type: "tree",
    object: o.toObject(),
    dryRun: n
  });
}
async function Qr({ fs: t, cache: e, gitdir: r, oid: n, filepath: a }) {
  if (a.startsWith("/"))
    throw new oe("leading-slash");
  if (a.endsWith("/"))
    throw new oe("trailing-slash");
  const i = n, o = await Ge({ fs: t, cache: e, gitdir: r, oid: n }), s = o.tree;
  if (a === "")
    n = o.oid;
  else {
    const l = a.split("/");
    n = await Vc({
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
async function Vc({
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
        const { type: c, object: f } = await G({
          fs: t,
          cache: e,
          gitdir: r,
          oid: l.oid
        });
        if (c !== "tree")
          throw new ct(i, c, "tree", o);
        return n = ut.from(f), Vc({
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
async function er({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  filepath: a = void 0
}) {
  a !== void 0 && (n = await Qr({ fs: t, cache: e, gitdir: r, oid: n, filepath: a }));
  const { tree: i, oid: o } = await Ge({ fs: t, cache: e, gitdir: r, oid: n });
  return {
    oid: o,
    tree: i.entries()
  };
}
async function tn({ fs: t, gitdir: e, tree: r }) {
  const n = ut.from(r).toObject();
  return await dt({
    fs: t,
    gitdir: e,
    type: "tree",
    object: n,
    format: "content"
  });
}
async function hp({
  fs: t,
  cache: e,
  onSign: r,
  gitdir: n,
  ref: a,
  oid: i,
  note: o,
  force: s,
  author: l,
  committer: c,
  signingKey: f
}) {
  let u;
  try {
    u = await T.resolve({ gitdir: n, fs: t, ref: a });
  } catch (y) {
    if (!(y instanceof H))
      throw y;
  }
  let h = (await er({
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
        throw new Ot("note", i);
  typeof o == "string" && (o = Buffer.from(o, "utf8"));
  const w = await dt({
    fs: t,
    gitdir: n,
    type: "blob",
    object: o,
    format: "content"
  });
  h.push({ mode: "100644", path: i, oid: w, type: "blob" });
  const p = await tn({
    fs: t,
    gitdir: n,
    tree: h
  });
  return await Jr({
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
    committer: c,
    signingKey: f
  });
}
async function Xc({
  fs: t,
  onSign: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  ref: a = "refs/notes/commits",
  oid: i,
  note: o,
  force: s,
  author: l,
  committer: c,
  signingKey: f,
  cache: u = {}
}) {
  try {
    b("fs", t), b("gitdir", n), b("oid", i), b("note", o), f && b("onSign", e);
    const d = new C(t), h = await ce({ fs: d, gitdir: n, author: l });
    if (!h) throw new at("author");
    const w = await Se({
      fs: d,
      gitdir: n,
      author: h,
      committer: c
    });
    if (!w) throw new at("committer");
    const p = await D({ fsp: d, dotgit: n });
    return await hp({
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
      signingKey: f
    });
  } catch (d) {
    throw d.caller = "git.addNote", d;
  }
}
const wp = /(^|[/.])([/.]|$)|^@$|@{|[\x00-\x20\x7f~^:?*[\\]|\.lock(\/|$)/;
function Er(t, e) {
  if (typeof t != "string")
    throw new TypeError("Reference name must be a string");
  return !wp.test(t) && !0;
}
async function Kc({ fs: t, gitdir: e, remote: r, url: n, force: a }) {
  if (!Er(r))
    throw new $t(r, vr.clean(r));
  const i = await J.get({ fs: t, gitdir: e });
  if (!a && (await i.getSubsections("remote")).includes(r) && n !== await i.get(`remote.${r}.url`))
    throw new Ot("remote", r);
  await i.set(`remote.${r}.url`, n), await i.set(
    `remote.${r}.fetch`,
    `+refs/heads/*:refs/remotes/${r}/*`
  ), await J.save({ fs: t, gitdir: e, config: i });
}
async function Yc({
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
    return await Kc({
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
async function pp({
  fs: t,
  cache: e,
  onSign: r,
  gitdir: n,
  ref: a,
  tagger: i,
  message: o = a,
  gpgsig: s,
  object: l,
  signingKey: c,
  force: f = !1
}) {
  if (a = a.startsWith("refs/tags/") ? a : `refs/tags/${a}`, !f && await T.exists({ fs: t, gitdir: n, ref: a }))
    throw new Ot("tag", a);
  const u = await T.resolve({
    fs: t,
    gitdir: n,
    ref: l || "HEAD"
  }), { type: d } = await G({ fs: t, cache: e, gitdir: n, oid: u });
  let h = st.from({
    object: u,
    type: d,
    tag: a.replace("refs/tags/", ""),
    tagger: i,
    message: o,
    gpgsig: s
  });
  c && (h = await st.sign(h, r, c));
  const w = await dt({
    fs: t,
    gitdir: n,
    type: "tag",
    object: h.toObject()
  });
  await T.writeRef({ fs: t, gitdir: n, ref: a, value: w });
}
async function Jc({
  fs: t,
  onSign: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  ref: a,
  tagger: i,
  message: o = a,
  gpgsig: s,
  object: l,
  signingKey: c,
  force: f = !1,
  cache: u = {}
}) {
  try {
    b("fs", t), b("gitdir", n), b("ref", a), c && b("onSign", e);
    const d = new C(t), h = await D({ fsp: d, dotgit: n }), w = await ce({
      fs: d,
      gitdir: h,
      author: i
    });
    if (!w) throw new at("tagger");
    return await pp({
      fs: d,
      cache: u,
      onSign: e,
      gitdir: h,
      ref: a,
      tagger: w,
      message: o,
      gpgsig: s,
      object: l,
      signingKey: c,
      force: f
    });
  } catch (d) {
    throw d.caller = "git.annotatedTag", d;
  }
}
async function mp({
  fs: t,
  gitdir: e,
  ref: r,
  object: n,
  checkout: a = !1,
  force: i = !1
}) {
  if (!Er(r))
    throw new $t(r, vr.clean(r));
  const o = `refs/heads/${r}`;
  if (!i && await T.exists({ fs: t, gitdir: e, ref: o }))
    throw new Ot("branch", r, !1);
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
async function Qc({
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
    return await mp({
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
const tf = (t, e) => t === "." || e == null || e.length === 0 || e === "." ? !0 : e.length >= t.length ? e.startsWith(t) : t.startsWith(e);
async function Si({
  fs: t,
  cache: e,
  onProgress: r,
  onPostCheckout: n,
  dir: a,
  gitdir: i,
  remote: o,
  ref: s,
  filepaths: l,
  noCheckout: c,
  noUpdateHead: f,
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
  if (!c) {
    let _;
    try {
      _ = await gp({
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
      throw x instanceof H && x.data.what === y ? new zr(s, y) : x;
    }
    const v = _.filter(([x]) => x === "conflict").map(([x, g]) => g);
    if (v.length > 0)
      throw new jr(v);
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
      ), g = await us(
        "Update Working Dir",
        x.map(
          ([E, A, $, I, B]) => () => _p({ fs: t, cache: e, gitdir: i, dir: a }, [
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
          await us(
            "Update Index",
            g.map(
              ([A, $, I]) => () => yp({ index: E, fullpath: A, oid: $, stats: I })
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
  if (!f) {
    const _ = await T.expand({ fs: t, gitdir: i, ref: s });
    _.startsWith("refs/heads") ? await T.writeSymbolicRef({
      fs: t,
      gitdir: i,
      ref: "HEAD",
      value: _
    }) : await T.writeRef({ fs: t, gitdir: i, ref: "HEAD", value: y });
  }
}
async function gp({
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
    trees: [mt({ ref: i }), Qe(), $e()],
    map: async function(c, [f, u, d]) {
      if (c === ".") return;
      if (s && !s.some((w) => tf(c, w)))
        return null;
      switch (r && await r({ phase: "Analyzing workdir", loaded: ++l }), [!!d, !!f, !!u].map(Number).join("")) {
        case "000":
          return;
        case "001":
          return o && s && s.includes(c) ? ["delete", c] : void 0;
        case "010":
          switch (await f.type()) {
            case "tree":
              return ["mkdir", c];
            case "blob":
              return [
                "create",
                c,
                await f.oid(),
                await f.mode()
              ];
            case "commit":
              return [
                "mkdir-index",
                c,
                await f.oid(),
                await f.mode()
              ];
            default:
              return [
                "error",
                `new entry Unhandled type ${await f.type()}`
              ];
          }
        case "011":
          switch (`${await f.type()}-${await u.type()}`) {
            case "tree-tree":
              return;
            case "tree-blob":
            case "blob-tree":
              return ["conflict", c];
            case "blob-blob":
              return await f.oid() !== await u.oid() ? o ? [
                "update",
                c,
                await f.oid(),
                await f.mode(),
                await f.mode() !== await u.mode()
              ] : ["conflict", c] : await f.mode() !== await u.mode() ? o ? [
                "update",
                c,
                await f.oid(),
                await f.mode(),
                !0
              ] : ["conflict", c] : [
                "create-index",
                c,
                await f.oid(),
                await f.mode()
              ];
            case "commit-tree":
              return;
            case "commit-blob":
              return ["conflict", c];
            default:
              return ["error", `new entry Unhandled type ${f.type}`];
          }
        case "100":
          return ["delete-index", c];
        case "101":
          switch (await d.type()) {
            case "tree":
              return ["rmdir-index", c];
            case "blob":
              return await d.oid() !== await u.oid() ? o ? ["delete", c] : ["conflict", c] : ["delete", c];
            case "commit":
              return ["rmdir-index", c];
            default:
              return [
                "error",
                `delete entry Unhandled type ${await d.type()}`
              ];
          }
        case "110":
        case "111":
          switch (`${await d.type()}-${await f.type()}`) {
            case "tree-tree":
              return;
            case "blob-blob": {
              if (await d.oid() === await f.oid() && await d.mode() === await f.mode() && !o)
                return;
              if (u) {
                if (await u.oid() !== await d.oid() && await u.oid() !== await f.oid())
                  return o ? [
                    "update",
                    c,
                    await f.oid(),
                    await f.mode(),
                    await f.mode() !== await u.mode()
                  ] : ["conflict", c];
              } else if (o)
                return [
                  "update",
                  c,
                  await f.oid(),
                  await f.mode(),
                  await f.mode() !== await d.mode()
                ];
              return await f.mode() !== await d.mode() ? [
                "update",
                c,
                await f.oid(),
                await f.mode(),
                !0
              ] : await f.oid() !== await d.oid() ? [
                "update",
                c,
                await f.oid(),
                await f.mode(),
                !1
              ] : void 0;
            }
            case "tree-blob":
              return ["update-dir-to-blob", c, await f.oid()];
            case "blob-tree":
              return ["update-blob-to-tree", c];
            case "commit-commit":
              return [
                "mkdir-index",
                c,
                await f.oid(),
                await f.mode()
              ];
            default:
              return [
                "error",
                `update entry Unhandled type ${await d.type()}-${await f.type()}`
              ];
          }
      }
    },
    // Modify the default flat mapping
    reduce: async function(c, f) {
      return f = Mc(f), c ? c && c[0] === "rmdir" ? (f.push(c), f) : (f.unshift(c), f) : f;
    }
  });
}
async function yp({ index: t, fullpath: e, stats: r, oid: n }) {
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
async function _p({ fs: t, cache: e, gitdir: r, dir: n }, [a, i, o, s, l]) {
  const c = `${n}/${i}`;
  if (a !== "create-index" && a !== "mkdir-index") {
    const { object: u } = await G({ fs: t, cache: e, gitdir: r, oid: o });
    if (l && await t.rm(c), s === 33188)
      await t.write(c, u);
    else if (s === 33261)
      await t.write(c, u, { mode: 511 });
    else if (s === 40960)
      await t.writelink(c, u);
    else
      throw new F(
        `Invalid mode 0o${s.toString(8)} detected in blob ${o}`
      );
  }
  const f = await t.lstat(c);
  return s === 33261 && (f.mode = 493), a === "mkdir-index" && (f.mode = 57344), [i, o, f];
}
async function us(t, e, r, n) {
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
async function ki({
  fs: t,
  onProgress: e,
  onPostCheckout: r,
  dir: n,
  gitdir: a = R(n, ".git"),
  remote: i = "origin",
  ref: o,
  filepaths: s,
  noCheckout: l = !1,
  noUpdateHead: c = o === void 0,
  dryRun: f = !1,
  force: u = !1,
  track: d = !0,
  cache: h = {},
  nonBlocking: w = !1,
  batchSize: p = 100
}) {
  try {
    b("fs", t), b("dir", n), b("gitdir", a);
    const m = o || "HEAD", y = new C(t), _ = await D({ fsp: y, dotgit: a });
    return await Si({
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
      noUpdateHead: c,
      dryRun: f,
      force: u,
      track: d,
      nonBlocking: w,
      batchSize: p
    });
  } catch (m) {
    throw m.caller = "git.checkout", m;
  }
}
const za = /^.*(\r?\n|$)/gm;
function bp({ branches: t, contents: e }) {
  const r = t[1], n = t[2], a = e[0], i = e[1], o = e[2], s = i.match(za), l = a.match(za), c = o.match(za), f = lw(s, l, c), u = 7;
  let d = "", h = !0;
  for (const w of f)
    w.ok && (d += w.ok.join("")), w.conflict && (h = !1, d += `${"<".repeat(u)} ${r}
`, d += w.conflict.a.join(""), d += `${"=".repeat(u)}
`, d += w.conflict.b.join(""), d += `${">".repeat(u)} ${n}
`);
  return { cleanMerge: h, mergedText: d };
}
async function ef({
  fs: t,
  cache: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  index: a,
  ourOid: i,
  baseOid: o,
  theirOid: s,
  ourName: l = "ours",
  baseName: c = "base",
  theirName: f = "theirs",
  dryRun: u = !1,
  abortOnConflict: d = !0,
  mergeDriver: h
}) {
  const w = mt({ ref: i }), p = mt({ ref: o }), m = mt({ ref: s }), y = [], _ = [], v = [], S = [], k = await se({
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
            return vp({
              fs: t,
              gitdir: n,
              path: A,
              ours: x,
              base: g,
              theirs: E,
              ourName: l,
              baseName: c,
              theirName: f,
              mergeDriver: h
            }).then(async (B) => {
              if (B.cleanMerge)
                d || a.insert({ filepath: O, oid: B.mergeResult.oid, stage: 0 });
              else if (y.push(O), _.push(O), !d) {
                let N = "";
                g && await g.type() === "blob" && (N = await g.oid());
                const K = await x.oid(), Tt = await E.oid();
                a.delete({ filepath: O }), N && a.insert({ filepath: O, oid: N, stage: 1 }), a.insert({ filepath: O, oid: K, stage: 2 }), a.insert({ filepath: O, oid: Tt, stage: 3 });
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
          throw new Ye();
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
          const A = new ut(g).toObject(), $ = await dt({
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
    trees: [mt({ ref: k.oid })],
    map: async function(O, [x]) {
      const g = `${r}/${O}`;
      if (await x.type() === "blob") {
        const E = await x.mode(), A = new TextDecoder().decode(await x.content());
        await t.write(g, A, { mode: E });
      }
      return !0;
    }
  }), new Re(
    y,
    _,
    v,
    S
  )) : k.oid;
}
async function vp({
  fs: t,
  gitdir: e,
  path: r,
  ours: n,
  base: a,
  theirs: i,
  ourName: o,
  theirName: s,
  baseName: l,
  dryRun: c,
  mergeDriver: f = bp
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
  const m = Buffer.from(await n.content()).toString("utf8"), y = Buffer.from(await i.content()).toString("utf8"), { mergedText: _, cleanMerge: v } = await f({
    branches: [l, o, s],
    contents: [w, m, y],
    path: r
  }), S = await dt({
    fs: t,
    gitdir: e,
    type: "blob",
    object: Buffer.from(_, "utf8"),
    dryRun: c
  });
  return { cleanMerge: v, mergeResult: { mode: p, path: r, oid: S, type: u } };
}
const xp = {
  stage: $e,
  workdir: Qe
};
let La;
async function We(t, e) {
  return La === void 0 && (La = new br()), La.acquire(t, e);
}
async function Ep(t, e, r, n, a = null) {
  const i = R(r, n), o = await t.lstat(i);
  if (!o) throw new H(i);
  if (o.isDirectory())
    throw new F(
      `${i}: file expected, but found directory`
    );
  const s = a ? await Dc({ fs: t, gitdir: e, oid: a }) : void 0;
  let l = s ? a : void 0;
  return s || await We({ fs: t, gitdir: e, currentFilepath: i }, async () => {
    const c = o.isSymbolicLink() ? await t.readlink(i).then(Hc) : await t.read(i);
    if (c === null) throw new H(i);
    l = await dt({ fs: t, gitdir: e, type: "blob", object: c });
  }), l;
}
async function Sp({ fs: t, dir: e, gitdir: r, entries: n }) {
  async function a(i) {
    if (i.type === "tree") {
      if (!i.oid) {
        const o = await Promise.all(i.children.map(a));
        i.oid = await tn({
          fs: t,
          gitdir: r,
          tree: o
        }), i.mode = 16384;
      }
    } else i.type === "blob" && (i.oid = await Ep(
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
async function ds({
  fs: t,
  dir: e,
  gitdir: r,
  treePair: n
  // [TREE({ ref: 'HEAD' }), 'STAGE'] would be the equivalent of `git write-tree`
}) {
  const a = n[1] === "stage", i = n.map((h) => typeof h == "string" ? xp[h]() : h), o = [], f = await se({
    fs: t,
    cache: {},
    dir: e,
    gitdir: r,
    trees: i,
    map: async (h, [w, p]) => {
      if (!(h === "." || await tr.isIgnored({ fs: t, dir: e, gitdir: r, filepath: h })) && p)
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
  if (o.length === 0 || f.length === 0)
    return null;
  const d = (await Sp({
    fs: t,
    dir: e,
    gitdir: r,
    entries: f
  })).filter(Boolean).map((h) => ({
    mode: h.mode,
    path: h.path,
    oid: h.oid,
    type: h.type
  }));
  return tn({ fs: t, gitdir: r, tree: d });
}
async function rf({
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
    trees: [mt({ ref: a }), mt({ ref: n })],
    map: async (c, [f, u]) => {
      if (c === "." || await tr.isIgnored({ fs: t, dir: e, gitdir: r, filepath: c }))
        return;
      const d = u ? await u.type() : await f.type();
      if (d !== "tree" && d !== "blob")
        return;
      if (!u && f) {
        const w = d === "tree" ? "rmdir" : "rm";
        return d === "tree" && o.push(c), d === "blob" && i && s.push({ filepath: c, oid: await f.oid() }), { method: w, filepath: c };
      }
      const h = await u.oid();
      if (!f || await f.oid() !== h)
        return d === "tree" ? { method: "mkdir", filepath: c } : (i && s.push({
          filepath: c,
          oid: h,
          stats: await t.lstat(R(e, c))
        }), {
          method: "write",
          filepath: c,
          oid: h
        });
    }
  });
  await We({ fs: t, gitdir: r, dirRemoved: o, ops: l }, async () => {
    for (const c of l) {
      const f = R(e, c.filepath);
      switch (c.method) {
        case "rmdir":
          await t.rmdir(f);
          break;
        case "mkdir":
          await t.mkdir(f);
          break;
        case "rm":
          await t.rm(f);
          break;
        case "write":
          if (!o.some(
            (u) => f.startsWith(u)
          )) {
            const { object: u } = await G({
              fs: t,
              cache: {},
              gitdir: r,
              oid: c.oid
            });
            await t.exists(f) && await t.rm(f), await t.write(f, u);
          }
          break;
      }
    }
  }), await Y.acquire({ fs: t, gitdir: r, cache: {} }, async (c) => {
    s.forEach(({ filepath: f, stats: u, oid: d }) => {
      c.insert({ filepath: f, stats: u, oid: d });
    });
  });
}
async function hs({
  fs: t,
  cache: e,
  dir: r,
  gitdir: n,
  oid: a,
  dryRun: i = !1,
  noUpdateBranch: o = !1,
  abortOnConflict: s = !0,
  committer: l,
  mergeDriver: c
}) {
  const { commit: f, oid: u } = await zt({
    fs: t,
    cache: e,
    gitdir: n,
    oid: a
  });
  if (f.parent.length > 1)
    throw new Ur(u, f.parent.length);
  if (f.parent.length === 0)
    throw new Mr(u);
  const d = await T.resolve({
    fs: t,
    gitdir: n,
    ref: "HEAD"
  }), { commit: h } = await zt({
    fs: t,
    cache: e,
    gitdir: n,
    oid: d
  }), w = f.parent[0], { commit: p } = await zt({
    fs: t,
    cache: e,
    gitdir: n,
    oid: w
  }), m = await Y.acquire(
    { fs: t, gitdir: n, cache: e, allowUnmerged: !1 },
    async (_) => ef({
      fs: t,
      cache: e,
      dir: r,
      gitdir: n,
      index: _,
      ourOid: h.tree,
      baseOid: p.tree,
      theirOid: f.tree,
      ourName: "HEAD",
      baseName: `parent of ${u.slice(0, 7)}`,
      theirName: u.slice(0, 7),
      dryRun: i,
      abortOnConflict: s,
      mergeDriver: c
    })
  );
  if (m instanceof Re)
    throw m;
  const y = await Jr({
    fs: t,
    cache: e,
    gitdir: n,
    message: f.message,
    tree: m,
    parent: [d],
    // Single parent: current HEAD
    author: f.author,
    // Preserve original author
    committer: l,
    // New committer
    dryRun: i,
    noUpdateBranch: o
  });
  return r && !i && !o && await rf({
    fs: t,
    dir: r,
    gitdir: n,
    stashCommit: y,
    parentCommit: d,
    wasStaged: !0
  }), y;
}
async function nf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oid: n,
  cache: a = {},
  committer: i,
  dryRun: o = !1,
  noUpdateBranch: s = !1,
  abortOnConflict: l = !0,
  mergeDriver: c
}) {
  try {
    b("fs", t), b("gitdir", r), b("oid", n);
    const f = new C(t), u = await D({ fsp: f, dotgit: r }), { commit: d } = await zt({
      fs: f,
      cache: a,
      gitdir: u,
      oid: n
    });
    if (d.parent && d.parent.length > 1)
      return await hs({
        fs: f,
        cache: a,
        dir: e,
        gitdir: u,
        oid: n,
        dryRun: o,
        noUpdateBranch: s,
        abortOnConflict: l,
        committer: void 0,
        mergeDriver: c
      });
    const h = await Se({
      fs: f,
      gitdir: u,
      committer: i
    });
    if (!h)
      throw new at("committer");
    return await hs({
      fs: f,
      cache: a,
      dir: e,
      gitdir: u,
      oid: n,
      dryRun: o,
      noUpdateBranch: s,
      abortOnConflict: l,
      committer: h,
      mergeDriver: c
    });
  } catch (f) {
    throw f.caller = "git.cherryPick", f;
  }
}
const kp = /^refs\/(heads\/|tags\/|remotes\/)?(.*)/;
function me(t) {
  const e = kp.exec(t);
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
    return r ? a : me(a);
}
function Ap(t) {
  return t = t.replace(/^git@([^:]+):/, "https://$1/"), t = t.replace(/^ssh:\/\//, "https://"), t;
}
function af({ username: t = "", password: e = "" }) {
  return `Basic ${Buffer.from(`${t}:${e}`).toString("base64")}`;
}
async function en(t, e) {
  const r = Nc(t);
  for (; ; ) {
    const { value: n, done: a } = await r.next();
    if (n && await e(n), a) break;
  }
  r.return && r.return();
}
async function Cn(t) {
  let e = 0;
  const r = [];
  await en(t, (i) => {
    r.push(i), e += i.byteLength;
  });
  const n = new Uint8Array(e);
  let a = 0;
  for (const i of r)
    n.set(i, a), a += i.byteLength;
  return n;
}
function ws(t) {
  let e = t.match(/^https?:\/\/([^/]+)@/);
  if (e == null) return { url: t, auth: {} };
  e = e[1];
  const [r, n] = e.split(":");
  return t = t.replace(`${e}@`, ""), { url: t, auth: { username: r, password: n } };
}
function si(t, e) {
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
    const r = e.length + 4, n = si(4, r);
    return Buffer.concat([Buffer.from(n, "utf8"), e]);
  }
  static streamReader(e) {
    const r = new Fc(e);
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
async function ps(t) {
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
async function ms(t, { service: e }) {
  const r = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), i = X.streamReader(t);
  let o = await i();
  for (; o === null; ) o = await i();
  if (o === !0) throw new Lr();
  if (o.includes("version 2"))
    return ps(i);
  if (o.toString("utf8").replace(/\n$/, "") !== `# service=${e}`)
    throw new Oe(`# service=${e}\\n`, o.toString("utf8"));
  let s = await i();
  for (; s === null; ) s = await i();
  if (s === !0) return { capabilities: r, refs: n, symrefs: a };
  if (s = s.toString("utf8"), s.includes("version 2"))
    return ps(i);
  const [l, c] = Ha(s, "\0", "\\x00");
  if (c.split(" ").map((f) => r.add(f)), l !== "0000000000000000000000000000000000000000 capabilities^{}") {
    const [f, u] = Ha(l, " ", " ");
    for (n.set(u, f); ; ) {
      const d = await i();
      if (d === !0) break;
      if (d !== null) {
        const [h, w] = Ha(d.toString("utf8"), " ", " ");
        n.set(w, h);
      }
    }
  }
  for (const f of r)
    if (f.startsWith("symref=")) {
      const u = f.match(/symref=([^:]+):(.*)/);
      u.length === 3 && a.set(u[1], u[2]);
    }
  return { protocolVersion: 1, capabilities: r, refs: n, symrefs: a };
}
function Ha(t, e, r) {
  const n = t.trim().split(e);
  if (n.length !== 2)
    throw new Oe(
      `Two strings separated by '${r}'`,
      t.toString("utf8")
    );
  return n;
}
const gs = (t, e) => t.endsWith("?") ? `${t}${e}` : `${t}/${e.replace(/^https?:\/\//, "")}`, ys = (t, e) => {
  (e.username || e.password) && (t.Authorization = af(e)), e.headers && Object.assign(t, e.headers);
}, Ga = async (t) => {
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
    headers: c,
    protocolVersion: f
  }) {
    let { url: u, auth: d } = ws(l);
    const h = o ? gs(o, u) : u;
    (d.username || d.password) && (c.Authorization = af(d)), f === 2 && (c["Git-Protocol"] = "version=2");
    let w, p, m = !1;
    do
      if (w = await e.request({
        onProgress: r,
        method: "GET",
        url: `${h}/info/refs?service=${s}`,
        headers: c
      }), p = !1, w.statusCode === 401 || w.statusCode === 203) {
        const y = m ? i : n;
        if (y) {
          if (d = await y(u, {
            ...d,
            headers: { ...c }
          }), d && d.cancel)
            throw new Je();
          d && (ys(c, d), m = !0, p = !0);
        }
      } else w.statusCode === 200 && m && a && await a(u, d);
    while (p);
    if (w.statusCode !== 200) {
      const { response: y } = await Ga(w);
      throw new Le(w.statusCode, w.statusMessage, y);
    }
    if (w.headers["content-type"] === `application/x-${s}-advertisement`) {
      const y = await ms(w.body, { service: s });
      return y.auth = d, y;
    } else {
      const { preview: y, response: _, data: v } = await Ga(w);
      try {
        const S = await ms([v], { service: s });
        return S.auth = d, S;
      } catch {
        throw new Zr(y, _);
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
    const c = ws(i);
    c && (i = c.url), n && (i = gs(n, i)), l["content-type"] = `application/x-${a}-request`, l.accept = `application/x-${a}-result`, ys(l, o);
    const f = await e.request({
      onProgress: r,
      method: "POST",
      url: `${i}/${a}`,
      body: s,
      headers: l
    });
    if (f.statusCode !== 200) {
      const { response: u } = Ga(f);
      throw new Le(f.statusCode, f.statusMessage, u);
    }
    return f;
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
    const n = $p({ url: e });
    if (!n)
      throw new Xr(e);
    if (r.has(n.transport))
      return r.get(n.transport);
    throw new Vr(
      e,
      n.transport,
      n.transport === "ssh" ? Ap(e) : void 0
    );
  }
}
function $p({ url: t }) {
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
let de = null;
class Sr {
  /**
   * Reads the `shallow` file in the Git repository and returns a set of object IDs (OIDs).
   *
   * @param {Object} args
   * @param {FSClient} args.fs - A file system implementation.
   * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
   * @returns {Promise<Set<string>>} - A set of shallow object IDs.
   */
  static async read({ fs: e, gitdir: r }) {
    de === null && (de = new br());
    const n = R(r, "shallow"), a = /* @__PURE__ */ new Set();
    return await de.acquire(n, async function() {
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
    de === null && (de = new br());
    const a = R(r, "shallow");
    if (n.size > 0) {
      const i = [...n].join(`
`) + `
`;
      await de.acquire(a, async function() {
        await e.write(a, i, {
          encoding: "utf8"
        });
      });
    } else
      await de.acquire(a, async function() {
        await e.rm(a);
      });
  }
}
async function Rp({ fs: t, gitdir: e, oid: r }) {
  const n = `objects/${r.slice(0, 2)}/${r.slice(2)}`;
  return t.exists(`${e}/${n}`);
}
async function Op({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  getExternalRefDelta: a
}) {
  let i = await t.readdir(R(r, "objects/pack"));
  i = i.filter((o) => o.endsWith(".idx"));
  for (const o of i) {
    const s = `${r}/objects/pack/${o}`, l = await Ei({
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
async function _s({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  format: a = "content"
}) {
  const i = (s) => G({ fs: t, cache: e, gitdir: r, oid: s });
  let o = await Rp({ fs: t, gitdir: r, oid: n });
  return o || (o = await Op({
    fs: t,
    cache: e,
    gitdir: r,
    oid: n,
    getExternalRefDelta: i
  })), o;
}
function Tp(t) {
  const a = "5041434b" + "00000002" + "00000000";
  return t.slice(0, 12).toString("hex") === a;
}
function of(t, e) {
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
function Ip(t) {
  const e = t.indexOf("\r"), r = t.indexOf(`
`);
  return e === -1 && r === -1 ? -1 : e === -1 ? r + 1 : r === -1 ? e + 1 : r === e + 1 ? r + 1 : Math.min(e, r) + 1;
}
function sf(t) {
  const e = new vn();
  let r = "";
  return (async () => (await en(t, (n) => {
    for (n = n.toString("utf8"), r += n; ; ) {
      const a = Ip(r);
      if (a === -1) break;
      e.write(r.slice(0, a)), r = r.slice(a);
    }
  }), r.length > 0 && e.write(r), e.end()))(), e;
}
class cf {
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
async function Pp(t) {
  const { packetlines: e, packfile: r, progress: n } = cf.demux(t), a = [], i = [], o = [];
  let s = !1, l = !1;
  return new Promise((c, f) => {
    en(e, (u) => {
      const d = u.toString("utf8").trim();
      if (d.startsWith("shallow")) {
        const h = d.slice(-41).trim();
        h.length !== 40 && f(new ie(h)), a.push(h);
      } else if (d.startsWith("unshallow")) {
        const h = d.slice(-41).trim();
        h.length !== 40 && f(new ie(h)), i.push(h);
      } else if (d.startsWith("ACK")) {
        const [, h, w] = d.split(" ");
        o.push({ oid: h, status: w }), w || (l = !0);
      } else d.startsWith("NAK") ? (s = !0, l = !0) : (l = !0, s = !0);
      l && (t.error ? f(t.error) : c({ shallows: a, unshallows: i, acks: o, nak: s, packfile: r, progress: n }));
    }).finally(() => {
      l || (t.error ? f(t.error) : c({ shallows: a, unshallows: i, acks: o, nak: s, packfile: r, progress: n }));
    });
  });
}
function Bp({
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
  for (const c of e)
    s.push(X.encode(`want ${c}${l}
`)), l = "";
  for (const c of n)
    s.push(X.encode(`shallow ${c}
`));
  a !== null && s.push(X.encode(`deepen ${a}
`)), i !== null && s.push(
    X.encode(`deepen-since ${Math.floor(i.valueOf() / 1e3)}
`)
  );
  for (const c of o)
    s.push(X.encode(`deepen-not ${c}
`));
  s.push(X.flush());
  for (const c of r)
    s.push(X.encode(`have ${c}
`));
  return s.push(X.encode(`done
`)), s;
}
async function Ai({
  fs: t,
  cache: e,
  http: r,
  onProgress: n,
  onMessage: a,
  onAuth: i,
  onAuthSuccess: o,
  onAuthFailure: s,
  gitdir: l,
  ref: c,
  remoteRef: f,
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
  const x = c || await le({ fs: t, gitdir: l, test: !0 }), g = await J.get({ fs: t, gitdir: l }), E = u || x && await g.get(`branch.${x}.remote`) || "origin", A = d || await g.get(`remote.${E}.url`);
  if (typeof A > "u")
    throw new lt("remote OR url");
  const $ = f || x && await g.get(`branch.${x}.merge`) || c || "HEAD";
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
  const { oid: Tt, fullref: yt } = T.resolveAgainstMap({
    ref: $,
    map: K
  });
  for (const L of K.keys())
    L === yt || L === "HEAD" || L.startsWith("refs/heads/") || _ && L.startsWith("refs/tags/") || K.delete(L);
  const Et = of(
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
  y && Et.push("deepen-relative");
  const Zn = v ? [Tt] : K.values(), Vn = v ? [x] : await T.listRefs({
    fs: t,
    gitdir: l,
    filepath: "refs"
  });
  let ht = [];
  for (let L of Vn)
    try {
      L = await T.expand({ fs: t, gitdir: l, ref: L });
      const rt = await T.resolve({ fs: t, gitdir: l, ref: L });
      await _s({ fs: t, cache: e, gitdir: l, oid: rt }) && ht.push(rt);
    } catch {
    }
  ht = [...new Set(ht)];
  const Z = await Sr.read({ fs: t, gitdir: l }), It = B.capabilities.has("shallow") ? [...Z] : [], it = Bp({
    capabilities: Et,
    wants: Zn,
    haves: ht,
    shallows: It,
    depth: w,
    since: p,
    exclude: m
  }), rr = Buffer.from(await Cn(it)), ue = await I.connect({
    http: r,
    onProgress: n,
    corsProxy: h,
    service: "git-upload-pack",
    url: A,
    auth: N,
    body: [rr],
    headers: S
  }), Q = await Pp(ue.body);
  ue.headers && (Q.headers = ue.headers);
  for (const L of Q.shallows)
    if (!Z.has(L))
      try {
        const { object: rt } = await G({ fs: t, cache: e, gitdir: l, oid: L }), _t = new q(rt), Pt = await Promise.all(
          _t.headers().parent.map((ar) => _s({ fs: t, cache: e, gitdir: l, oid: ar }))
        );
        Pt.length === 0 || Pt.every((ar) => ar) || Z.add(L);
      } catch {
        Z.add(L);
      }
  for (const L of Q.unshallows)
    Z.delete(L);
  if (await Sr.write({ fs: t, gitdir: l, oids: Z }), v) {
    const L = /* @__PURE__ */ new Map([[yt, Tt]]), rt = /* @__PURE__ */ new Map();
    let _t = 10, Pt = yt;
    for (; _t--; ) {
      const Kn = B.symrefs.get(Pt);
      if (Kn === void 0) break;
      rt.set(Pt, Kn), Pt = Kn;
    }
    const Xn = K.get(Pt);
    Xn && L.set(Pt, Xn);
    const { pruned: ar } = await T.updateRemoteRefs({
      fs: t,
      gitdir: l,
      remote: E,
      refs: L,
      symrefs: rt,
      tags: _,
      prune: k
    });
    k && (Q.pruned = ar);
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
  const Bl = yt.startsWith("refs/tags") ? "tag" : "branch";
  if (Q.FETCH_HEAD = {
    oid: Tt,
    description: `${Bl} '${me(yt)}' of ${A}`
  }, n || a) {
    const L = sf(Q.progress);
    en(L, async (rt) => {
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
  const rn = Buffer.from(await Cn(Q.packfile));
  if (ue.body.error) throw ue.body.error;
  const Oi = rn.slice(-20).toString("hex"), nr = {
    defaultBranch: Q.HEAD,
    fetchHead: Q.FETCH_HEAD.oid,
    fetchHeadDescription: Q.FETCH_HEAD.description
  };
  if (Q.headers && (nr.headers = Q.headers), k && (nr.pruned = Q.pruned), Oi !== "" && !Tp(rn)) {
    nr.packfile = `objects/pack/pack-${Oi}.pack`;
    const L = R(l, nr.packfile);
    await t.write(L, rn);
    const rt = (Pt) => G({ fs: t, cache: e, gitdir: l, oid: Pt }), _t = await ze.fromPack({
      pack: rn,
      getExternalRefDelta: rt,
      onProgress: n
    });
    await t.write(L.replace(/\.pack$/, ".idx"), await _t.toBuffer());
  }
  return nr;
}
async function ff({
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
async function Cp({
  fs: t,
  cache: e,
  http: r,
  onProgress: n,
  onMessage: a,
  onAuth: i,
  onAuthSuccess: o,
  onAuthFailure: s,
  onPostCheckout: l,
  dir: c,
  gitdir: f,
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
    if (await ff({ fs: t, gitdir: f }), await Kc({ fs: t, gitdir: f, remote: w, url: u, force: !1 }), d) {
      const $ = await J.get({ fs: t, gitdir: f });
      await $.set("http.corsProxy", d), await J.save({ fs: t, gitdir: f, config: $ });
    }
    const { defaultBranch: E, fetchHead: A } = await Ai({
      fs: t,
      cache: e,
      http: r,
      onProgress: n,
      onMessage: a,
      onAuth: i,
      onAuthSuccess: o,
      onAuthFailure: s,
      gitdir: f,
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
    h = h || E, h = h.replace("refs/heads/", ""), await Si({
      fs: t,
      cache: e,
      onProgress: n,
      onPostCheckout: l,
      dir: c,
      gitdir: f,
      ref: h,
      remote: w,
      noCheckout: S,
      nonBlocking: x,
      batchSize: g
    });
  } catch (E) {
    throw await t.rmdir(f, { recursive: !0, maxRetries: 10 }).catch(() => {
    }), E;
  }
}
async function lf({
  fs: t,
  http: e,
  onProgress: r,
  onMessage: n,
  onAuth: a,
  onAuthSuccess: i,
  onAuthFailure: o,
  onPostCheckout: s,
  dir: l,
  gitdir: c = R(l, ".git"),
  url: f,
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
    b("fs", t), b("http", e), b("gitdir", c), v || b("dir", l), b("url", f);
    const E = new C(t), A = await D({ fsp: E, dotgit: c });
    return await Cp({
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
      url: f,
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
async function uf({
  fs: t,
  onSign: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  message: a,
  author: i,
  committer: o,
  signingKey: s,
  amend: l = !1,
  dryRun: c = !1,
  noUpdateBranch: f = !1,
  ref: u,
  parent: d,
  tree: h,
  cache: w = {}
}) {
  try {
    b("fs", t), l || b("message", a), s && b("onSign", e);
    const p = new C(t), m = await D({ fsp: p, dotgit: n });
    return await Jr({
      fs: p,
      cache: w,
      onSign: e,
      gitdir: m,
      message: a,
      author: i,
      committer: o,
      signingKey: s,
      amend: l,
      dryRun: c,
      noUpdateBranch: f,
      ref: u,
      parent: d,
      tree: h
    });
  } catch (p) {
    throw p.caller = "git.commit", p;
  }
}
async function df({
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
async function Dp({ fs: t, gitdir: e, ref: r }) {
  if (r = r.startsWith("refs/heads/") ? r : `refs/heads/${r}`, !await T.exists({ fs: t, gitdir: e, ref: r }))
    throw new H(r);
  const a = await T.expand({ fs: t, gitdir: e, ref: r }), i = await le({ fs: t, gitdir: e, fullname: !0 });
  if (a === i) {
    const l = await T.resolve({ fs: t, gitdir: e, ref: a });
    await T.writeRef({ fs: t, gitdir: e, ref: "HEAD", value: l });
  }
  await T.deleteRef({ fs: t, gitdir: e, ref: a });
  const o = me(r), s = await J.get({ fs: t, gitdir: e });
  await s.deleteSection("branch", o), await J.save({ fs: t, gitdir: e, config: s });
}
async function hf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n
}) {
  try {
    b("fs", t), b("ref", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await Dp({
      fs: a,
      gitdir: i,
      ref: n
    });
  } catch (a) {
    throw a.caller = "git.deleteBranch", a;
  }
}
async function wf({ fs: t, dir: e, gitdir: r = R(e, ".git"), ref: n }) {
  try {
    b("fs", t), b("ref", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    await T.deleteRef({ fs: a, gitdir: i, ref: n });
  } catch (a) {
    throw a.caller = "git.deleteRef", a;
  }
}
async function Np({ fs: t, gitdir: e, remote: r }) {
  const n = await J.get({ fs: t, gitdir: e });
  await n.deleteSection("remote", r), await J.save({ fs: t, gitdir: e, config: n });
}
async function pf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  remote: n
}) {
  try {
    b("fs", t), b("remote", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await Np({
      fs: a,
      gitdir: i,
      remote: n
    });
  } catch (a) {
    throw a.caller = "git.deleteRemote", a;
  }
}
async function Fp({ fs: t, gitdir: e, ref: r }) {
  r = r.startsWith("refs/tags/") ? r : `refs/tags/${r}`, await T.deleteRef({ fs: t, gitdir: e, ref: r });
}
async function mf({ fs: t, dir: e, gitdir: r = R(e, ".git"), ref: n }) {
  try {
    b("fs", t), b("ref", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await Fp({
      fs: a,
      gitdir: i,
      ref: n
    });
  } catch (a) {
    throw a.caller = "git.deleteTag", a;
  }
}
async function jp({ fs: t, gitdir: e, oid: r }) {
  const n = r.slice(0, 2);
  return (await t.readdir(`${e}/objects/${n}`)).map((i) => `${n}${i}`).filter((i) => i.startsWith(r));
}
async function Up({
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
    const l = `${r}/objects/pack/${s}`, c = await Ei({
      fs: t,
      cache: e,
      filename: l,
      getExternalRefDelta: a
    });
    if (c.error) throw new F(c.error);
    for (const f of c.offsets.keys())
      f.startsWith(n) && i.push(f);
  }
  return i;
}
async function Mp({ fs: t, cache: e, gitdir: r, oid: n }) {
  const a = (s) => G({ fs: t, cache: e, gitdir: r, oid: s }), i = await jp({ fs: t, gitdir: r, oid: n }), o = await Up({
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
  throw i.length > 1 ? new Fr("oids", n, i) : new H(`an object matching "${n}"`);
}
async function gf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oid: n,
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("oid", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await Mp({
      fs: i,
      cache: a,
      gitdir: o,
      oid: n
    });
  } catch (i) {
    throw i.caller = "git.expandOid", i;
  }
}
async function yf({ fs: t, dir: e, gitdir: r = R(e, ".git"), ref: n }) {
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
async function $i({ fs: t, cache: e, gitdir: r, oids: n }) {
  const a = {}, i = n.length;
  let o = n.map((s, l) => ({ index: l, oid: s }));
  for (; o.length; ) {
    const s = /* @__PURE__ */ new Set();
    for (const { oid: c, index: f } of o)
      a[c] || (a[c] = /* @__PURE__ */ new Set()), a[c].add(f), a[c].size === i && s.add(c);
    if (s.size > 0)
      return [...s];
    const l = /* @__PURE__ */ new Map();
    for (const { oid: c, index: f } of o)
      try {
        const { object: u } = await G({ fs: t, cache: e, gitdir: r, oid: c }), d = q.from(u), { parent: h } = d.parseHeaders();
        for (const w of h)
          (!a[w] || !a[w].has(f)) && l.set(w + ":" + f, { oid: w, index: f });
      } catch {
      }
    o = Array.from(l.values());
  }
  return [];
}
async function _f({
  fs: t,
  cache: e,
  dir: r,
  gitdir: n,
  ours: a,
  theirs: i,
  fastForward: o = !0,
  fastForwardOnly: s = !1,
  dryRun: l = !1,
  noUpdateBranch: c = !1,
  abortOnConflict: f = !0,
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
  }), S = await $i({
    fs: t,
    cache: e,
    gitdir: n,
    oids: [_, v]
  });
  if (S.length !== 1)
    if (S.length === 0 && y)
      S.push("4b825dc642cb6eb9a060e54bf8d69288fbee4904");
    else
      throw new Ye();
  const k = S[0];
  if (k === v)
    return {
      oid: _,
      alreadyMerged: !0
    };
  if (o && k === _)
    return !l && !c && await T.writeRef({ fs: t, gitdir: n, ref: a, value: v }), {
      oid: v,
      fastForward: !0
    };
  {
    if (s)
      throw new Hr();
    const O = await Y.acquire(
      { fs: t, gitdir: n, cache: e, allowUnmerged: !1 },
      async (g) => ef({
        fs: t,
        cache: e,
        dir: r,
        gitdir: n,
        index: g,
        ourOid: _,
        theirOid: v,
        baseOid: k,
        ourName: me(a),
        baseName: "base",
        theirName: me(i),
        dryRun: l,
        abortOnConflict: f,
        mergeDriver: m
      })
    );
    if (O instanceof Re) throw O;
    return u || (u = `Merge branch '${me(i)}' into ${me(
      a
    )}`), {
      oid: await Jr({
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
        noUpdateBranch: c
      }),
      tree: O,
      mergeCommit: !0
    };
  }
}
async function bf({
  fs: t,
  cache: e,
  http: r,
  onProgress: n,
  onMessage: a,
  onAuth: i,
  onAuthSuccess: o,
  onAuthFailure: s,
  dir: l,
  gitdir: c,
  ref: f,
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
    if (!f) {
      const A = await le({ fs: t, gitdir: c });
      if (!A)
        throw new lt("ref");
      f = A;
    }
    const { fetchHead: g, fetchHeadDescription: E } = await Ai({
      fs: t,
      cache: e,
      http: r,
      onProgress: n,
      onMessage: a,
      onAuth: i,
      onAuthSuccess: o,
      onAuthFailure: s,
      gitdir: c,
      corsProxy: _,
      ref: f,
      url: u,
      remote: d,
      remoteRef: h,
      singleBranch: v,
      headers: S,
      prune: w,
      pruneTags: p
    });
    await _f({
      fs: t,
      cache: e,
      gitdir: c,
      ours: f,
      theirs: g,
      fastForward: m,
      fastForwardOnly: y,
      message: `Merge ${E}`,
      author: k,
      committer: O,
      signingKey: x,
      dryRun: !1,
      noUpdateBranch: !1
    }), await Si({
      fs: t,
      cache: e,
      onProgress: n,
      dir: l,
      gitdir: c,
      ref: f,
      remote: d,
      noCheckout: !1
    });
  } catch (g) {
    throw g.caller = "git.pull", g;
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
  ref: c,
  url: f,
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
    return await bf({
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
      ref: c,
      url: f,
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
async function xf({
  fs: t,
  http: e,
  onProgress: r,
  onMessage: n,
  onAuth: a,
  onAuthSuccess: i,
  onAuthFailure: o,
  dir: s,
  gitdir: l = R(s, ".git"),
  ref: c,
  remote: f,
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
    return await Ai({
      fs: g,
      cache: x,
      http: e,
      onProgress: r,
      onMessage: n,
      onAuth: a,
      onAuthSuccess: i,
      onAuthFailure: o,
      gitdir: E,
      ref: c,
      remote: f,
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
async function Ef({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oids: n,
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("oids", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await $i({
      fs: i,
      cache: a,
      gitdir: o,
      oids: n
    });
  } catch (i) {
    throw i.caller = "git.findMergeBase", i;
  }
}
async function Sf({ fs: t, filepath: e }) {
  if (await t.exists(R(e, ".git")))
    return e;
  {
    const r = Ee(e);
    if (r === e)
      throw new H(`git root for ${e}`);
    return Sf({ fs: t, filepath: r });
  }
}
async function kf({ fs: t, filepath: e }) {
  try {
    return b("fs", t), b("filepath", e), await Sf({ fs: new C(t), filepath: e });
  } catch (r) {
    throw r.caller = "git.findRoot", r;
  }
}
async function Af({ fs: t, dir: e, gitdir: r = R(e, ".git"), path: n }) {
  try {
    b("fs", t), b("gitdir", r), b("path", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await xr({
      fs: a,
      gitdir: i,
      path: n
    });
  } catch (a) {
    throw a.caller = "git.getConfig", a;
  }
}
async function zp({ fs: t, gitdir: e, path: r }) {
  return (await J.get({ fs: t, gitdir: e })).getall(r);
}
async function $f({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  path: n
}) {
  try {
    b("fs", t), b("gitdir", r), b("path", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await zp({
      fs: a,
      gitdir: i,
      path: n
    });
  } catch (a) {
    throw a.caller = "git.getConfigAll", a;
  }
}
async function Rf({
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
    const c = await Wn.getRemoteHelperFor({ url: i }).discover({
      http: t,
      onAuth: e,
      onAuthSuccess: r,
      onAuthFailure: n,
      corsProxy: a,
      service: s ? "git-receive-pack" : "git-upload-pack",
      url: i,
      headers: o,
      protocolVersion: 1
    }), f = {
      capabilities: [...c.capabilities]
    };
    for (const [u, d] of c.refs) {
      const h = u.split("/"), w = h.pop();
      let p = f;
      for (const m of h)
        p[m] = p[m] || {}, p = p[m];
      p[w] = d;
    }
    for (const [u, d] of c.symrefs) {
      const h = u.split("/"), w = h.pop();
      let p = f;
      for (const m of h)
        p[m] = p[m] || {}, p = p[m];
      p[w] = d;
    }
    return f;
  } catch (l) {
    throw l.caller = "git.getRemoteInfo", l;
  }
}
function Of(t, e, r, n) {
  const a = [];
  for (const [i, o] of t.refs) {
    if (e && !i.startsWith(e)) continue;
    if (i.endsWith("^{}")) {
      if (n) {
        const l = i.replace("^{}", ""), c = a[a.length - 1], f = c.ref === l ? c : a.find((u) => u.ref === l);
        if (f === void 0)
          throw new Error("I did not expect this to happen");
        f.peeled = o;
      }
      continue;
    }
    const s = { ref: i, oid: o };
    r && t.symrefs.has(i) && (s.target = t.symrefs.get(i)), a.push(s);
  }
  return a;
}
async function Tf({
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
    const f = await Wn.getRemoteHelperFor({ url: i }).discover({
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
    if (f.protocolVersion === 2)
      return {
        protocolVersion: f.protocolVersion,
        capabilities: f.capabilities2
      };
    const u = {};
    for (const d of f.capabilities) {
      const [h, w] = d.split("=");
      w ? u[h] = w : u[h] = !0;
    }
    return {
      protocolVersion: 1,
      capabilities: u,
      refs: Of(f, void 0, !0, !0)
    };
  } catch (c) {
    throw c.caller = "git.getRemoteInfo2", c;
  }
}
async function Lp({
  type: t,
  object: e,
  format: r = "content",
  oid: n = void 0
}) {
  return r !== "deflated" && (r !== "wrapped" && (e = Ke.wrap({ type: t, object: e })), n = await Vt(e)), { oid: n, object: e };
}
async function If({ object: t }) {
  try {
    b("object", t), typeof t == "string" ? t = Buffer.from(t, "utf8") : t instanceof Uint8Array || (t = new Uint8Array(t));
    const e = "blob", { oid: r, object: n } = await Lp({
      type: e,
      format: "content",
      object: t
    });
    return { oid: r, type: e, object: n, format: "wrapped" };
  } catch (e) {
    throw e.caller = "git.hashBlob", e;
  }
}
async function Hp({
  fs: t,
  cache: e,
  onProgress: r,
  dir: n,
  gitdir: a,
  filepath: i
}) {
  try {
    i = R(n, i);
    const o = await t.read(i), s = (c) => G({ fs: t, cache: e, gitdir: a, oid: c }), l = await ze.fromPack({
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
async function Pf({
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
    return await Hp({
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
async function Bf({
  fs: t,
  bare: e = !1,
  dir: r,
  gitdir: n = e ? r : R(r, ".git"),
  defaultBranch: a = "master"
}) {
  try {
    b("fs", t), b("gitdir", n), e || b("dir", r);
    const i = new C(t), o = await D({ fsp: i, dotgit: n });
    return await ff({
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
async function Cf({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  ancestor: a,
  depth: i
}) {
  const o = await Sr.read({ fs: t, gitdir: r });
  if (!n)
    throw new lt("oid");
  if (!a)
    throw new lt("ancestor");
  if (n === a) return !1;
  const s = [n], l = /* @__PURE__ */ new Set();
  let c = 0;
  for (; s.length; ) {
    if (c++ === i)
      throw new Wr(i);
    const f = s.shift(), { type: u, object: d } = await G({
      fs: t,
      cache: e,
      gitdir: r,
      oid: f
    });
    if (u !== "commit")
      throw new ct(f, u, "commit");
    const h = q.from(d).parse();
    for (const w of h.parent)
      if (w === a) return !0;
    if (!o.has(f))
      for (const w of h.parent)
        l.has(w) || (s.push(w), l.add(w));
  }
  return !1;
}
async function Df({
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
    return await Cf({
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
async function Nf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  filepath: n
}) {
  try {
    b("fs", t), b("dir", e), b("gitdir", r), b("filepath", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return tr.isIgnored({
      fs: a,
      dir: e,
      gitdir: i,
      filepath: n
    });
  } catch (a) {
    throw a.caller = "git.isIgnored", a;
  }
}
async function Ff({
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
async function Gp({ fs: t, gitdir: e, ref: r, cache: n }) {
  if (r) {
    const a = await T.resolve({ gitdir: e, fs: t, ref: r }), i = [];
    return await jf({
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
async function jf({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  filenames: a,
  prefix: i
}) {
  const { tree: o } = await er({ fs: t, cache: e, gitdir: r, oid: n });
  for (const s of o)
    s.type === "tree" ? await jf({
      fs: t,
      cache: e,
      gitdir: r,
      oid: s.oid,
      filenames: a,
      prefix: R(i, s.path)
    }) : a.push(R(i, s.path));
}
async function Uf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n,
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await Gp({
      fs: i,
      cache: a,
      gitdir: o,
      ref: n
    });
  } catch (i) {
    throw i.caller = "git.listFiles", i;
  }
}
async function Wp({ fs: t, cache: e, gitdir: r, ref: n }) {
  let a;
  try {
    a = await T.resolve({ gitdir: r, fs: t, ref: n });
  } catch (s) {
    if (s instanceof H)
      return [];
  }
  return (await er({
    fs: t,
    cache: e,
    gitdir: r,
    oid: a
  })).tree.map((s) => ({
    target: s.path,
    note: s.oid
  }));
}
async function Mf({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  ref: n = "refs/notes/commits",
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("ref", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await Wp({
      fs: i,
      cache: a,
      gitdir: o,
      ref: n
    });
  } catch (i) {
    throw i.caller = "git.listNotes", i;
  }
}
async function zf({
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
async function qp({ fs: t, gitdir: e }) {
  const r = await J.get({ fs: t, gitdir: e }), n = await r.getSubsections("remote");
  return Promise.all(
    n.map(async (i) => {
      const o = await r.get(`remote.${i}.url`);
      return { remote: i, url: o };
    })
  );
}
async function Lf({ fs: t, dir: e, gitdir: r = R(e, ".git") }) {
  try {
    b("fs", t), b("gitdir", r);
    const n = new C(t), a = await D({ fsp: n, dotgit: r });
    return await qp({
      fs: n,
      gitdir: a
    });
  } catch (n) {
    throw n.caller = "git.listRemotes", n;
  }
}
async function Zp(t) {
  const e = X.streamReader(t), r = [];
  let n;
  for (; n = await e(), n !== !0; ) {
    if (n === null) continue;
    n = n.toString("utf8").replace(/\n$/, "");
    const [a, i, ...o] = n.split(" "), s = { ref: i, oid: a };
    for (const l of o) {
      const [c, f] = l.split(":");
      c === "symref-target" ? s.target = f : c === "peeled" && (s.peeled = f);
    }
    r.push(s);
  }
  return r;
}
async function Vp({ prefix: t, symrefs: e, peelTags: r }) {
  const n = [];
  return n.push(X.encode(`command=ls-refs
`)), n.push(X.encode(`agent=${qn.agent}
`)), (r || e || t) && n.push(X.delim()), r && n.push(X.encode("peel")), e && n.push(X.encode("symrefs")), t && n.push(X.encode(`ref-prefix ${t}`)), n.push(X.flush()), n;
}
async function Hf({
  http: t,
  onAuth: e,
  onAuthSuccess: r,
  onAuthFailure: n,
  corsProxy: a,
  url: i,
  headers: o = {},
  forPush: s = !1,
  protocolVersion: l = 2,
  prefix: c,
  symrefs: f,
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
      return Of(d, c, f, u);
    const h = await Vp({ prefix: c, symrefs: f, peelTags: u }), w = await Dn.connect({
      http: t,
      auth: d.auth,
      headers: o,
      corsProxy: a,
      service: s ? "git-receive-pack" : "git-upload-pack",
      url: i,
      body: h
    });
    return Zp(w.body);
  } catch (d) {
    throw d.caller = "git.listServerRefs", d;
  }
}
async function Gf({ fs: t, dir: e, gitdir: r = R(e, ".git") }) {
  try {
    b("fs", t), b("gitdir", r);
    const n = new C(t), a = await D({ fsp: n, dotgit: r });
    return T.listTags({ fs: n, gitdir: a });
  } catch (n) {
    throw n.caller = "git.listTags", n;
  }
}
function Xp(t, e) {
  return t.committer.timestamp - e.committer.timestamp;
}
const Kp = "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391";
async function bs({ fs: t, cache: e, gitdir: r, oid: n, fileId: a }) {
  if (a === Kp) return;
  const i = n;
  let o;
  const s = await Ge({ fs: t, cache: e, gitdir: r, oid: n }), l = s.tree;
  return a === s.oid ? o = s.path : (o = await Wf({
    fs: t,
    cache: e,
    gitdir: r,
    tree: l,
    fileId: a,
    oid: i
  }), Array.isArray(o) && (o.length === 0 ? o = void 0 : o.length === 1 && (o = o[0]))), o;
}
async function Wf({
  fs: t,
  cache: e,
  gitdir: r,
  tree: n,
  fileId: a,
  oid: i,
  filepaths: o = [],
  parentPath: s = ""
}) {
  const l = n.entries().map(function(c) {
    let f;
    return c.oid === a ? (f = R(s, c.path), o.push(f)) : c.type === "tree" && (f = G({
      fs: t,
      cache: e,
      gitdir: r,
      oid: c.oid
    }).then(function({ object: u }) {
      return Wf({
        fs: t,
        cache: e,
        gitdir: r,
        tree: ut.from(u),
        fileId: a,
        oid: i,
        filepaths: o,
        parentPath: R(s, c.path)
      });
    })), f;
  });
  return await Promise.all(l), o;
}
async function Yp({
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
  const c = typeof o > "u" ? void 0 : Math.floor(o.valueOf() / 1e3), f = [], u = await Sr.read({ fs: t, gitdir: r }), d = await T.resolve({ fs: t, gitdir: r, ref: a }), h = [await zt({ fs: t, cache: e, gitdir: r, oid: d })];
  let w, p, m;
  function y(_) {
    m && n && f.push(_);
  }
  for (; h.length > 0; ) {
    const _ = h.pop();
    if (c !== void 0 && _.commit.committer.timestamp <= c)
      break;
    if (n) {
      let v;
      try {
        v = await Qr({
          fs: t,
          cache: e,
          gitdir: r,
          oid: _.commit.tree,
          filepath: n
        }), p && w !== v && f.push(p), w = v, p = _, m = !0;
      } catch (S) {
        if (S instanceof H) {
          let k = l && w;
          if (k && (k = await bs({
            fs: t,
            cache: e,
            gitdir: r,
            oid: _.commit.tree,
            fileId: w
          }), k))
            if (Array.isArray(k)) {
              if (p) {
                const O = await bs({
                  fs: t,
                  cache: e,
                  gitdir: r,
                  oid: p.commit.tree,
                  fileId: w
                });
                if (Array.isArray(O))
                  if (k = k.filter((x) => O.indexOf(x) === -1), k.length === 1)
                    k = k[0], n = k, p && f.push(p);
                  else {
                    k = !1, p && f.push(p);
                    break;
                  }
              }
            } else
              n = k, p && f.push(p);
          if (!k) {
            if (m && w && (f.push(p), !s))
              break;
            if (!s && !l) throw S;
          }
          p = _, m = !1;
        } else throw S;
      }
    } else
      f.push(_);
    if (i !== void 0 && f.length === i) {
      y(_);
      break;
    }
    if (!u.has(_.oid))
      for (const v of _.commit.parent) {
        const S = await zt({ fs: t, cache: e, gitdir: r, oid: v });
        h.map((k) => k.oid).includes(S.oid) || h.push(S);
      }
    h.length === 0 && y(_), h.sort((v, S) => Xp(v.commit, S.commit));
  }
  return f;
}
async function qf({
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
  cache: c = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("ref", a);
    const f = new C(t), u = await D({ fsp: f, dotgit: r });
    return await Yp({
      fs: f,
      cache: c,
      gitdir: u,
      filepath: n,
      ref: a,
      depth: i,
      since: o,
      force: s,
      follow: l
    });
  } catch (f) {
    throw f.caller = "git.log", f;
  }
}
async function Zf({
  fs: t,
  onSign: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  ours: a,
  theirs: i,
  fastForward: o = !0,
  fastForwardOnly: s = !1,
  dryRun: l = !1,
  noUpdateBranch: c = !1,
  abortOnConflict: f = !0,
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
    const k = await Se({
      fs: _,
      gitdir: v,
      author: S,
      committer: h
    });
    if (!k && (!s || !o))
      throw new at("committer");
    return await _f({
      fs: _,
      cache: p,
      dir: r,
      gitdir: v,
      ours: a,
      theirs: i,
      fastForward: o,
      fastForwardOnly: s,
      dryRun: l,
      noUpdateBranch: c,
      abortOnConflict: f,
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
const Jp = {
  commit: 16,
  tree: 32,
  blob: 48,
  tag: 64,
  ofs_delta: 96,
  ref_delta: 112
};
async function Vf({
  fs: t,
  cache: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  oids: a
}) {
  const i = new Oc(), o = [];
  function s(f, u) {
    const d = Buffer.from(f, u);
    o.push(d), i.update(d);
  }
  async function l({ stype: f, object: u }) {
    const d = Jp[f];
    let h = u.length, w = h > 15 ? 128 : 0;
    const p = h & 15;
    h = h >>> 4;
    let m = (w | d | p).toString(16);
    for (s(m, "hex"); w; )
      w = h > 127 ? 128 : 0, m = w | h & 127, s(si(2, m), "hex"), h = h >>> 7;
    s(Buffer.from(await Lc(u)));
  }
  s("PACK"), s("00000002", "hex"), s(si(8, a.length), "hex");
  for (const f of a) {
    const { type: u, object: d } = await G({ fs: t, cache: e, gitdir: n, oid: f });
    await l({ object: d, stype: u });
  }
  const c = i.digest();
  return o.push(c), o;
}
async function Qp({ fs: t, cache: e, gitdir: r, oids: n, write: a }) {
  const i = await Vf({ fs: t, cache: e, gitdir: r, oids: n }), o = Buffer.from(await Cn(i)), l = `pack-${o.slice(-20).toString("hex")}.pack`;
  return a ? (await t.write(R(r, `objects/pack/${l}`), o), { filename: l }) : {
    filename: l,
    packfile: new Uint8Array(o)
  };
}
async function Xf({
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
    return await Qp({
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
async function Kf({
  fs: t,
  http: e,
  onProgress: r,
  onMessage: n,
  onAuth: a,
  onAuthSuccess: i,
  onAuthFailure: o,
  dir: s,
  gitdir: l = R(s, ".git"),
  ref: c,
  url: f,
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
    const $ = await Se({
      fs: g,
      gitdir: E,
      author: A,
      committer: k
    });
    if (!$) throw new at("committer");
    return await bf({
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
      ref: c,
      url: f,
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
async function tm({
  fs: t,
  cache: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  start: a,
  finish: i
}) {
  const o = await Sr.read({ fs: t, gitdir: n }), s = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set();
  for (const u of a)
    s.add(await T.resolve({ fs: t, gitdir: n, ref: u }));
  for (const u of i)
    try {
      const d = await T.resolve({ fs: t, gitdir: n, ref: u });
      l.add(d);
    } catch {
    }
  const c = /* @__PURE__ */ new Set();
  async function f(u) {
    c.add(u);
    const { type: d, object: h } = await G({ fs: t, cache: e, gitdir: n, oid: u });
    if (d === "tag") {
      const p = st.from(h).headers().object;
      return f(p);
    }
    if (d !== "commit")
      throw new ct(u, d, "commit");
    if (!o.has(u)) {
      const p = q.from(h).headers().parent;
      for (u of p)
        !l.has(u) && !c.has(u) && await f(u);
    }
  }
  for (const u of s)
    await f(u);
  return c;
}
async function Wa({
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
    const { type: l, object: c } = await G({ fs: t, cache: e, gitdir: n, oid: s });
    if (l === "tag") {
      const u = st.from(c).headers().object;
      await o(u);
    } else if (l === "commit") {
      const u = q.from(c).headers().tree;
      await o(u);
    } else if (l === "tree") {
      const f = ut.from(c);
      for (const u of f)
        u.type === "blob" && i.add(u.oid), u.type === "tree" && await o(u.oid);
    }
  }
  for (const s of a)
    await o(s);
  return i;
}
async function em(t) {
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
    throw new Oe('unpack ok" or "unpack [error message]', a);
  e.ok = a === "unpack ok", e.ok || (e.error = a.slice(7)), e.refs = {};
  for (const o of i) {
    if (o.trim() === "") continue;
    const s = o.slice(0, 2), l = o.slice(3);
    let c = l.indexOf(" ");
    c === -1 && (c = l.length);
    const f = l.slice(0, c), u = l.slice(c + 1);
    e.refs[f] = {
      ok: s === "ok",
      error: u
    };
  }
  return e;
}
async function rm({
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
async function nm({
  fs: t,
  cache: e,
  http: r,
  onProgress: n,
  onMessage: a,
  onAuth: i,
  onAuthSuccess: o,
  onAuthFailure: s,
  onPrePush: l,
  gitdir: c,
  ref: f,
  remoteRef: u,
  remote: d,
  url: h,
  force: w = !1,
  delete: p = !1,
  corsProxy: m,
  headers: y = {}
}) {
  const _ = f || await le({ fs: t, gitdir: c });
  if (typeof _ > "u")
    throw new lt("ref");
  const v = await J.get({ fs: t, gitdir: c });
  d = d || await v.get(`branch.${_}.pushRemote`) || await v.get("remote.pushDefault") || await v.get(`branch.${_}.remote`) || "origin";
  const S = h || await v.get(`remote.${d}.pushurl`) || await v.get(`remote.${d}.url`);
  if (typeof S > "u")
    throw new lt("remote OR url");
  const k = u || await v.get(`branch.${_}.merge`);
  if (typeof S > "u")
    throw new lt("remoteRef");
  m === void 0 && (m = await v.get("http.corsProxy"));
  const O = await T.expand({ fs: t, gitdir: c, ref: _ }), x = p ? "0000000000000000000000000000000000000000" : await T.resolve({ fs: t, gitdir: c, ref: O }), g = Wn.getRemoteHelperFor({ url: S }), E = await g.discover({
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
    throw new Je();
  const B = !E.capabilities.has("no-thin");
  let N = /* @__PURE__ */ new Set();
  if (!p) {
    const Z = [...E.refs.values()];
    let It = /* @__PURE__ */ new Set();
    if (I !== "0000000000000000000000000000000000000000") {
      const it = await $i({
        fs: t,
        cache: e,
        gitdir: c,
        oids: [x, I]
      });
      for (const rr of it) Z.push(rr);
      B && (It = await Wa({ fs: t, cache: e, gitdir: c, oids: it }));
    }
    if (!Z.includes(x)) {
      const it = await tm({
        fs: t,
        cache: e,
        gitdir: c,
        start: [x],
        finish: Z
      });
      N = await Wa({ fs: t, cache: e, gitdir: c, oids: it });
    }
    if (B) {
      try {
        const it = await T.resolve({
          fs: t,
          gitdir: c,
          ref: `refs/remotes/${d}/HEAD`,
          depth: 2
        }), { oid: rr } = await T.resolveAgainstMap({
          ref: it.replace(`refs/remotes/${d}/`, ""),
          fullref: it,
          map: E.refs
        }), ue = [rr];
        for (const Q of await Wa({ fs: t, cache: e, gitdir: c, oids: ue }))
          It.add(Q);
      } catch {
      }
      for (const it of It)
        N.delete(it);
    }
    if (x === I && (w = !0), !w) {
      if (O.startsWith("refs/tags") && I !== "0000000000000000000000000000000000000000")
        throw new He("tag-exists");
      if (x !== "0000000000000000000000000000000000000000" && I !== "0000000000000000000000000000000000000000" && !await Cf({
        fs: t,
        cache: e,
        gitdir: c,
        oid: x,
        ancestor: I,
        depth: -1
      }))
        throw new He("not-fast-forward");
    }
  }
  const K = of(
    [...E.capabilities],
    ["report-status", "side-band-64k", `agent=${qn.agent}`]
  ), Tt = await rm({
    capabilities: K,
    triplets: [{ oldoid: I, oid: x, fullRef: $ }]
  }), yt = p ? [] : await Vf({
    fs: t,
    cache: e,
    gitdir: c,
    oids: [...N]
  }), Et = await g.connect({
    http: r,
    onProgress: n,
    corsProxy: m,
    service: "git-receive-pack",
    url: S,
    auth: A,
    headers: y,
    body: [...Tt, ...yt]
  }), { packfile: Zn, progress: Vn } = await cf.demux(Et.body);
  if (a) {
    const Z = sf(Vn);
    en(Z, async (It) => {
      await a(It);
    });
  }
  const ht = await em(Zn);
  if (Et.headers && (ht.headers = Et.headers), d && ht.ok && ht.refs[$].ok && !O.startsWith("refs/tags")) {
    const Z = `refs/remotes/${d}/${$.replace(
      "refs/heads",
      ""
    )}`;
    p ? await T.deleteRef({ fs: t, gitdir: c, ref: Z }) : await T.writeRef({ fs: t, gitdir: c, ref: Z, value: x });
  }
  if (ht.ok && Object.values(ht.refs).every((Z) => Z.ok))
    return ht;
  {
    const Z = Object.entries(ht.refs).filter(([It, it]) => !it.ok).map(([It, it]) => `
  - ${It}: ${it.error}`).join("");
    throw new Gr(Z, ht);
  }
}
async function Yf({
  fs: t,
  http: e,
  onProgress: r,
  onMessage: n,
  onAuth: a,
  onAuthSuccess: i,
  onAuthFailure: o,
  onPrePush: s,
  dir: l,
  gitdir: c = R(l, ".git"),
  ref: f,
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
    b("fs", t), b("http", e), b("gitdir", c);
    const v = new C(t), S = await D({ fsp: v, dotgit: c });
    return await nm({
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
      ref: f,
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
async function Jf({ fs: t, cache: e, gitdir: r, oid: n }) {
  const { type: a, object: i } = await G({ fs: t, cache: e, gitdir: r, oid: n });
  if (a === "tag")
    return n = st.from(i).parse().object, Jf({ fs: t, cache: e, gitdir: r, oid: n });
  if (a !== "blob")
    throw new ct(n, a, "blob");
  return { oid: n, blob: new Uint8Array(i) };
}
async function Qf({
  fs: t,
  cache: e,
  gitdir: r,
  oid: n,
  filepath: a = void 0
}) {
  return a !== void 0 && (n = await Qr({ fs: t, cache: e, gitdir: r, oid: n, filepath: a })), await Jf({
    fs: t,
    cache: e,
    gitdir: r,
    oid: n
  });
}
async function tl({
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
    return await Qf({
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
async function Ri({
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
async function am({
  fs: t,
  cache: e,
  gitdir: r,
  ref: n = "refs/notes/commits",
  oid: a
}) {
  const i = await T.resolve({ gitdir: r, fs: t, ref: n }), { blob: o } = await Qf({
    fs: t,
    cache: e,
    gitdir: r,
    oid: i,
    filepath: a
  });
  return o;
}
async function el({
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
    return await am({
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
async function rl({
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
    const l = new C(t), c = await D({ fsp: l, dotgit: r });
    i !== void 0 && (n = await Qr({
      fs: l,
      cache: s,
      gitdir: c,
      oid: n,
      filepath: i
    }));
    const u = await G({
      fs: l,
      cache: s,
      gitdir: c,
      oid: n,
      format: a === "parsed" ? "content" : a
    });
    if (u.oid = n, a === "parsed")
      switch (u.format = "parsed", u.type) {
        case "commit":
          u.object = q.from(u.object).parse();
          break;
        case "tree":
          u.object = ut.from(u.object).entries();
          break;
        case "blob":
          o ? u.object = u.object.toString(o) : (u.object = new Uint8Array(u.object), u.format = "content");
          break;
        case "tag":
          u.object = st.from(u.object).parse();
          break;
        default:
          throw new ct(
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
async function im({ fs: t, cache: e, gitdir: r, oid: n }) {
  const { type: a, object: i } = await G({
    fs: t,
    cache: e,
    gitdir: r,
    oid: n,
    format: "content"
  });
  if (a !== "tag")
    throw new ct(n, a, "tag");
  const o = st.from(i);
  return {
    oid: n,
    tag: o.parse(),
    payload: o.payload()
  };
}
async function nl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  oid: n,
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("oid", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    return await im({
      fs: i,
      cache: a,
      gitdir: o,
      oid: n
    });
  } catch (i) {
    throw i.caller = "git.readTag", i;
  }
}
async function al({
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
    return await er({
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
async function il({
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
async function om({
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
  let c;
  try {
    c = await T.resolve({ gitdir: n, fs: t, ref: a });
  } catch (w) {
    if (!(w instanceof H))
      throw w;
  }
  let u = (await er({
    fs: t,
    cache: e,
    gitdir: n,
    oid: c || "4b825dc642cb6eb9a060e54bf8d69288fbee4904"
  })).tree;
  u = u.filter((w) => w.path !== i);
  const d = await tn({
    fs: t,
    gitdir: n,
    tree: u
  });
  return await Jr({
    fs: t,
    cache: e,
    onSign: r,
    gitdir: n,
    ref: a,
    tree: d,
    parent: c && [c],
    message: `Note removed by 'isomorphic-git removeNote'
`,
    author: o,
    committer: s,
    signingKey: l
  });
}
async function ol({
  fs: t,
  onSign: e,
  dir: r,
  gitdir: n = R(r, ".git"),
  ref: a = "refs/notes/commits",
  oid: i,
  author: o,
  committer: s,
  signingKey: l,
  cache: c = {}
}) {
  try {
    b("fs", t), b("gitdir", n), b("oid", i);
    const f = new C(t), u = await D({ fsp: f, dotgit: n }), d = await ce({
      fs: f,
      gitdir: u,
      author: o
    });
    if (!d) throw new at("author");
    const h = await Se({
      fs: f,
      gitdir: u,
      author: d,
      committer: s
    });
    if (!h) throw new at("committer");
    return await om({
      fs: f,
      cache: c,
      onSign: e,
      gitdir: u,
      ref: a,
      oid: i,
      author: d,
      committer: h,
      signingKey: l
    });
  } catch (f) {
    throw f.caller = "git.removeNote", f;
  }
}
async function sm({
  fs: t,
  gitdir: e,
  oldref: r,
  ref: n,
  checkout: a = !1
}) {
  if (!Er(n))
    throw new $t(n, vr.clean(n));
  if (!Er(r))
    throw new $t(r, vr.clean(r));
  const i = `refs/heads/${r}`, o = `refs/heads/${n}`;
  if (await T.exists({ fs: t, gitdir: e, ref: o }))
    throw new Ot("branch", n, !1);
  const l = await T.resolve({
    fs: t,
    gitdir: e,
    ref: i,
    depth: 1
  });
  await T.writeRef({ fs: t, gitdir: e, ref: o, value: l }), await T.deleteRef({ fs: t, gitdir: e, ref: i });
  const f = await le({
    fs: t,
    gitdir: e,
    fullname: !0
  }) === i;
  (a || f) && await T.writeSymbolicRef({
    fs: t,
    gitdir: e,
    ref: "HEAD",
    value: o
  });
}
async function sl({
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
    return await sm({
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
async function cl({ gitdir: t, type: e, object: r }) {
  return Vt(Ke.wrap({ type: e, object: r }));
}
async function fl({
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
    let l, c;
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
        l = await Qr({
          fs: o,
          cache: i,
          gitdir: s,
          oid: l,
          filepath: n
        });
      } catch {
        l = null;
      }
    let f = {
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
    u && (c = await cl({
      gitdir: s,
      type: "blob",
      object: u
    }), l === c && (f = await o.lstat(R(e, n)))), await Y.acquire(
      { fs: o, gitdir: s, cache: i },
      async function(d) {
        d.delete({ filepath: n }), l && d.insert({ filepath: n, stats: f, oid: l });
      }
    );
  } catch (o) {
    throw o.caller = "git.reset", o;
  }
}
async function ll({
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
async function ul({
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
async function dl({ fs: t, gitdir: e, commit: r }) {
  const n = q.from(r).toObject();
  return await dt({
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
    return dl({
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
      throw new $t(
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
    await We({ filepath: i, entry: a }, async () => {
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
async function hl({ fs: t, dir: e, gitdir: r, message: n = "" }) {
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
  }), l = (await Ri({ fs: t, dir: e, gitdir: r, oid: o })).commit.message, c = [o];
  let f = null, u = mt({ ref: "HEAD" });
  const d = await ds({
    fs: t,
    dir: e,
    gitdir: r,
    treePair: [mt({ ref: "HEAD" }), "stage"]
  });
  if (d) {
    const m = await a.writeStashCommit({
      message: `stash-Index: WIP on ${i} - ${(/* @__PURE__ */ new Date()).toISOString()}`,
      tree: d,
      parent: c
    });
    c.push(m), f = d, u = $e();
  }
  const h = await ds({
    fs: t,
    dir: e,
    gitdir: r,
    treePair: [u, "workdir"]
  });
  if (h) {
    const m = await a.writeStashCommit({
      message: `stash-WorkDir: WIP on ${i} - ${(/* @__PURE__ */ new Date()).toISOString()}`,
      tree: h,
      parent: [c[c.length - 1]]
    });
    c.push(m), f = h;
  }
  if (!f || !d && !h)
    throw new H("changes, nothing to stash");
  const w = (n.trim() || `WIP on ${i}`) + `: ${o.substring(0, 7)} ${l}`;
  return { stashCommit: await a.writeStashCommit({
    message: w,
    tree: f,
    parent: c
  }), stashMsg: w, branch: i, stashMgr: a };
}
async function cm({ fs: t, dir: e, gitdir: r, message: n = "" }) {
  const { stashCommit: a, stashMsg: i, branch: o, stashMgr: s } = await hl({
    fs: t,
    dir: e,
    gitdir: r,
    message: n
  });
  return await s.writeStashRef(a), await s.writeStashReflogEntry({
    stashCommit: a,
    message: i
  }), await ki({
    fs: t,
    dir: e,
    gitdir: r,
    ref: o,
    track: !1,
    force: !0
    // force checkout to discard changes
  }), a;
}
async function fm({ fs: t, dir: e, gitdir: r, message: n = "" }) {
  const { stashCommit: a } = await hl({
    fs: t,
    dir: e,
    gitdir: r,
    message: n
  });
  return a;
}
async function wl({ fs: t, dir: e, gitdir: r, refIdx: n = 0 }) {
  const i = await new qt({ fs: t, dir: e, gitdir: r }).readStashCommit(n), { parent: o = null } = i.commit ? i.commit : {};
  if (!(!o || !Array.isArray(o)))
    for (let s = 0; s < o.length - 1; s++) {
      const c = (await zt({
        fs: t,
        cache: {},
        gitdir: r,
        oid: o[s + 1]
      })).commit.message.startsWith("stash-Index");
      await rf({
        fs: t,
        dir: e,
        gitdir: r,
        stashCommit: o[s + 1],
        parentCommit: o[s],
        wasStaged: c
      });
    }
}
async function pl({ fs: t, dir: e, gitdir: r, refIdx: n = 0 }) {
  const a = new qt({ fs: t, dir: e, gitdir: r });
  if (!(await a.readStashCommit(n)).commit)
    return;
  const o = a.refStashPath;
  await We(o, async () => {
    await t.exists(o) && await t.rm(o);
  });
  const s = await a.readStashReflogs({ parsed: !1 });
  if (!s.length)
    return;
  s.splice(n, 1);
  const l = a.refLogsStashPath;
  await We({ reflogEntries: s, stashReflogPath: l, stashMgr: a }, async () => {
    if (s.length) {
      await t.write(
        l,
        s.reverse().join(`
`) + `
`,
        "utf8"
      );
      const c = s[s.length - 1].split(" ")[1];
      await a.writeStashRef(c);
    } else
      await t.rm(l);
  });
}
async function lm({ fs: t, dir: e, gitdir: r }) {
  return new qt({ fs: t, dir: e, gitdir: r }).readStashReflogs({ parsed: !0 });
}
async function um({ fs: t, dir: e, gitdir: r }) {
  const n = new qt({ fs: t, dir: e, gitdir: r }), a = [n.refStashPath, n.refLogsStashPath];
  await We(a, async () => {
    await Promise.all(
      a.map(async (i) => {
        if (await t.exists(i))
          return t.rm(i);
      })
    );
  });
}
async function dm({ fs: t, dir: e, gitdir: r, refIdx: n = 0 }) {
  await wl({ fs: t, dir: e, gitdir: r, refIdx: n }), await pl({ fs: t, dir: e, gitdir: r, refIdx: n });
}
async function ml({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  op: n = "push",
  message: a = "",
  refIdx: i = 0
}) {
  b("fs", t), b("dir", e), b("gitdir", r), b("op", n);
  const o = {
    push: cm,
    apply: wl,
    drop: pl,
    list: lm,
    clear: um,
    pop: dm,
    create: fm
  }, s = ["apply", "drop", "pop"];
  try {
    const l = new C(t), c = await D({ fsp: l, dotgit: r });
    ["refs", "logs", "logs/refs"].map((d) => R(c, d)).forEach(async (d) => {
      await l.exists(d) || await l.mkdir(d);
    });
    const u = o[n];
    if (u) {
      if (s.includes(n) && i < 0)
        throw new $t(
          `stash@${i}`,
          "number that is in range of [0, num of stash pushed]"
        );
      return await u({
        fs: l,
        dir: e,
        gitdir: c,
        message: a,
        refIdx: i
      });
    }
    throw new Error(`To be implemented: ${n}`);
  } catch (l) {
    throw l.caller = "git.stash", l;
  }
}
async function gl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  filepath: n,
  cache: a = {}
}) {
  try {
    b("fs", t), b("gitdir", r), b("filepath", n);
    const i = new C(t), o = await D({ fsp: i, dotgit: r });
    if (await tr.isIgnored({
      fs: i,
      gitdir: o,
      dir: e,
      filepath: n
    }))
      return "ignored";
    const l = await hm({ fs: i, cache: a, gitdir: o }), c = await yl({
      fs: i,
      cache: a,
      gitdir: o,
      tree: l,
      path: n
    }), f = await Y.acquire(
      { fs: i, gitdir: o, cache: a },
      async function(m) {
        for (const y of m)
          if (y.path === n) return y;
        return null;
      }
    ), u = await i.lstat(R(e, n)), d = c !== null, h = f !== null, w = u !== null, p = async () => {
      if (h && !Rn(f, u))
        return f.oid;
      {
        const m = await i.read(R(e, n)), y = await cl({
          gitdir: o,
          type: "blob",
          object: m
        });
        return h && f.oid === y && u.size !== -1 && Y.acquire(
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
      return await p() === f.oid ? "added" : "*added";
    if (d && !w && !h) return "deleted";
    if (d && !w && h)
      return c === f.oid, "*deleted";
    if (d && w && !h)
      return await p() === c ? "*undeleted" : "*undeletemodified";
    if (d && w && h) {
      const m = await p();
      return m === c ? m === f.oid ? "unmodified" : "*unmodified" : m === f.oid ? "modified" : "*modified";
    }
  } catch (i) {
    throw i.caller = "git.status", i;
  }
}
async function yl({ fs: t, cache: e, gitdir: r, tree: n, path: a }) {
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
        const c = ut.from(l);
        return yl({ fs: t, cache: e, gitdir: r, tree: c, path: a });
      }
      if (s === "blob")
        throw new ct(o.oid, s, "blob", a.join("/"));
    }
  return null;
}
async function hm({ fs: t, cache: e, gitdir: r }) {
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
  const { tree: a } = await er({ fs: t, cache: e, gitdir: r, oid: n });
  return a;
}
async function _l({
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
    const l = new C(t), c = await D({ fsp: l, dotgit: r });
    return await se({
      fs: l,
      cache: o,
      dir: e,
      gitdir: c,
      trees: [mt({ ref: n }), Qe(), $e()],
      map: async function(f, [u, d, h]) {
        if (!u && !h && d && !s && await tr.isIgnored({
          fs: l,
          dir: e,
          filepath: f
        }) || !a.some((x) => tf(f, x)))
          return null;
        if (i && !i(f))
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
        return O.shift(), [f, ...O];
      }
    });
  } catch (l) {
    throw l.caller = "git.statusMatrix", l;
  }
}
async function bl({
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
      throw new lt("ref");
    n = n.startsWith("refs/tags/") ? n : `refs/tags/${n}`;
    const s = await D({ fsp: o, dotgit: r }), l = await T.resolve({
      fs: o,
      gitdir: s,
      ref: a || "HEAD"
    });
    if (!i && await T.exists({ fs: o, gitdir: s, ref: n }))
      throw new Ot("tag", n);
    await T.writeRef({ fs: o, gitdir: s, ref: n, value: l });
  } catch (o) {
    throw o.caller = "git.tag", o;
  }
}
async function vl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  cache: n = {},
  filepath: a,
  oid: i,
  mode: o,
  add: s,
  remove: l,
  force: c
}) {
  try {
    b("fs", t), b("gitdir", r), b("filepath", a);
    const f = new C(t), u = await D({ fsp: f, dotgit: r });
    if (l)
      return await Y.acquire(
        { fs: f, gitdir: u, cache: n },
        async function(h) {
          if (!c) {
            const w = await f.lstat(R(e, a));
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
      if (d = await f.lstat(R(e, a)), !d)
        throw new H(
          `file at "${a}" on disk and "remove" not set`
        );
      if (d.isDirectory())
        throw new oe("directory");
    }
    return await Y.acquire(
      { fs: f, gitdir: u, cache: n },
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
          const p = w.isSymbolicLink() ? await f.readlink(R(e, a)) : await f.read(R(e, a));
          i = await dt({
            fs: f,
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
  } catch (f) {
    throw f.caller = "git.updateIndex", f;
  }
}
function xl() {
  try {
    return qn.version;
  } catch (t) {
    throw t.caller = "git.version", t;
  }
}
async function El({
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
    const l = new C(t), c = await D({ fsp: l, dotgit: r });
    return await se({
      fs: l,
      cache: s,
      dir: e,
      gitdir: c,
      trees: n,
      map: a,
      reduce: i,
      iterate: o
    });
  } catch (l) {
    throw l.caller = "git.walk", l;
  }
}
async function Sl({ fs: t, dir: e, gitdir: r = R(e, ".git"), blob: n }) {
  try {
    b("fs", t), b("gitdir", r), b("blob", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await dt({
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
async function kl({
  fs: t,
  dir: e,
  gitdir: r = R(e, ".git"),
  commit: n
}) {
  try {
    b("fs", t), b("gitdir", r), b("commit", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await dl({
      fs: a,
      gitdir: i,
      commit: n
    });
  } catch (a) {
    throw a.caller = "git.writeCommit", a;
  }
}
async function Al({
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
    const l = new C(t), c = await D({ fsp: l, dotgit: r });
    if (i === "parsed") {
      switch (n) {
        case "commit":
          a = q.from(a).toObject();
          break;
        case "tree":
          a = ut.from(a).toObject();
          break;
        case "blob":
          a = Buffer.from(a, s);
          break;
        case "tag":
          a = st.from(a).toObject();
          break;
        default:
          throw new ct(o || "", n, "blob|commit|tag|tree");
      }
      i = "content";
    }
    return o = await dt({
      fs: l,
      gitdir: c,
      type: n,
      object: a,
      oid: o,
      format: i
    }), o;
  } catch (l) {
    throw l.caller = "git.writeObject", l;
  }
}
async function $l({
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
    if (!Er(n, !0))
      throw new $t(n, vr.clean(n));
    const l = await D({ fsp: s, dotgit: r });
    if (!i && await T.exists({ fs: s, gitdir: l, ref: n }))
      throw new Ot("ref", n);
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
async function wm({ fs: t, gitdir: e, tag: r }) {
  const n = st.from(r).toObject();
  return await dt({
    fs: t,
    gitdir: e,
    type: "tag",
    object: n,
    format: "content"
  });
}
async function Rl({ fs: t, dir: e, gitdir: r = R(e, ".git"), tag: n }) {
  try {
    b("fs", t), b("gitdir", r), b("tag", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await wm({
      fs: a,
      gitdir: i,
      tag: n
    });
  } catch (a) {
    throw a.caller = "git.writeTag", a;
  }
}
async function Ol({ fs: t, dir: e, gitdir: r = R(e, ".git"), tree: n }) {
  try {
    b("fs", t), b("gitdir", r), b("tree", n);
    const a = new C(t), i = await D({ fsp: a, dotgit: r });
    return await tn({
      fs: a,
      gitdir: i,
      tree: n
    });
  } catch (a) {
    throw a.caller = "git.writeTree", a;
  }
}
var pm = {
  Errors: Uc,
  STAGE: $e,
  TREE: mt,
  WORKDIR: Qe,
  add: Gc,
  abortMerge: zc,
  addNote: Xc,
  addRemote: Yc,
  annotatedTag: Jc,
  branch: Qc,
  cherryPick: nf,
  checkout: ki,
  clone: lf,
  commit: uf,
  getConfig: Af,
  getConfigAll: $f,
  setConfig: ul,
  currentBranch: df,
  deleteBranch: hf,
  deleteRef: wf,
  deleteRemote: pf,
  deleteTag: mf,
  expandOid: gf,
  expandRef: yf,
  fastForward: vf,
  fetch: xf,
  findMergeBase: Ef,
  findRoot: kf,
  getRemoteInfo: Rf,
  getRemoteInfo2: Tf,
  hashBlob: If,
  indexPack: Pf,
  init: Bf,
  isDescendent: Df,
  isIgnored: Nf,
  listBranches: Ff,
  listFiles: Uf,
  listNotes: Mf,
  listRefs: zf,
  listRemotes: Lf,
  listServerRefs: Hf,
  listTags: Gf,
  log: qf,
  merge: Zf,
  packObjects: Xf,
  pull: Kf,
  push: Yf,
  readBlob: tl,
  readCommit: Ri,
  readNote: el,
  readObject: rl,
  readTag: nl,
  readTree: al,
  remove: il,
  removeNote: ol,
  renameBranch: sl,
  resetIndex: fl,
  updateIndex: vl,
  resolveRef: ll,
  status: gl,
  statusMatrix: _l,
  tag: bl,
  version: xl,
  walk: El,
  writeBlob: Sl,
  writeCommit: kl,
  writeObject: Al,
  writeRef: $l,
  writeTag: Rl,
  writeTree: Ol,
  stash: ml
};
P.Errors = Uc;
P.STAGE = $e;
P.TREE = mt;
P.WORKDIR = Qe;
P.abortMerge = zc;
P.add = Gc;
P.addNote = Xc;
P.addRemote = Yc;
P.annotatedTag = Jc;
P.branch = Qc;
P.checkout = ki;
P.cherryPick = nf;
P.clone = lf;
P.commit = uf;
P.currentBranch = df;
var mm = P.default = pm;
P.deleteBranch = hf;
P.deleteRef = wf;
P.deleteRemote = pf;
P.deleteTag = mf;
P.expandOid = gf;
P.expandRef = yf;
P.fastForward = vf;
P.fetch = xf;
P.findMergeBase = Ef;
P.findRoot = kf;
P.getConfig = Af;
P.getConfigAll = $f;
P.getRemoteInfo = Rf;
P.getRemoteInfo2 = Tf;
P.hashBlob = If;
P.indexPack = Pf;
P.init = Bf;
P.isDescendent = Df;
P.isIgnored = Nf;
P.listBranches = Ff;
P.listFiles = Uf;
P.listNotes = Mf;
P.listRefs = zf;
P.listRemotes = Lf;
P.listServerRefs = Hf;
P.listTags = Gf;
P.log = qf;
P.merge = Zf;
P.packObjects = Xf;
P.pull = Kf;
P.push = Yf;
P.readBlob = tl;
P.readCommit = Ri;
P.readNote = el;
P.readObject = rl;
P.readTag = nl;
P.readTree = al;
P.remove = il;
P.removeNote = ol;
P.renameBranch = sl;
P.resetIndex = fl;
P.resolveRef = ll;
P.setConfig = ul;
P.stash = ml;
P.status = gl;
P.statusMatrix = _l;
P.tag = bl;
P.updateIndex = vl;
P.version = xl;
P.walk = El;
P.writeBlob = Sl;
P.writeCommit = kl;
P.writeObject = Al;
P.writeRef = $l;
P.writeTag = Rl;
P.writeTree = Ol;
class gm {
  async getStatus(e) {
    try {
      const r = await mm.currentBranch({ fs: kt, dir: e, gitdir: e + "/.git" }), a = hn("git status --porcelain", { cwd: e, encoding: "utf-8" }).trim().split(`
`).filter((o) => o.trim()), i = {};
      for (const o of a) {
        const s = o.trim();
        if (!s) continue;
        const l = s.substring(0, 2);
        let c = s.substring(2).trim();
        c.startsWith('"') && c.endsWith('"') && (c = c.slice(1, -1)), c = c.replace(/\\/g, "/"), l.includes("U") ? i[c] = "conflict" : l === "??" || l.includes("A") ? i[c] = "new" : l.includes("M") ? i[c] = "modified" : l.includes("D") ? i[c] = "deleted" : l.includes("R") && (i[c] = "modified");
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
      const n = `${e}/${r}`, a = kt.readFileSync(n, "utf-8");
      let i = a.split(`
`);
      if (a.endsWith(`
`) && (i = i.slice(0, -1)), hn(`git ls-files --others --exclude-standard "${r}"`, {
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
        s = hn(`git diff HEAD -- "${r}"`, {
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
      const l = Array(i.length).fill("unchanged"), c = s.split(`
`);
      let f = 0;
      for (const u of c) {
        if (u.startsWith("diff --git") || u.startsWith("index ") || u.startsWith("--- ") || u.startsWith("+++ ") || u.startsWith("@@ ")) {
          if (u.startsWith("@@ ")) {
            const d = u.match(/\+(\d+)(?:,\d+)?/);
            d && (f = parseInt(d[1], 10) - 1);
          }
          continue;
        }
        if (u.startsWith("+")) {
          const d = f;
          d < l.length && (l[d] = "added"), f++;
        } else u.startsWith("-") || f++;
      }
      return i.map((u, d) => ({
        content: u,
        type: l[d]
      }));
    } catch (n) {
      console.error("Failed to get file diff:", n);
      try {
        const a = `${e}/${r}`, i = kt.readFileSync(a, "utf-8");
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
}
const Tl = new gm();
class ym {
  async listFiles(e, r) {
    return this.readDirectory(e, "", r);
  }
  readDirectory(e, r, n) {
    const a = kt.readdirSync(e), i = [];
    for (const o of a) {
      if (o === "node_modules" || o === ".git" || o === ".gitignore" && !n || !n && o.startsWith("."))
        continue;
      const s = xn.join(e, o), l = kt.statSync(s);
      let c = r ? xn.join(r, o) : o;
      if (c = c.replace(/\\/g, "/"), l.isDirectory()) {
        const f = this.readDirectory(s, c, n);
        i.push({
          name: o,
          path: c,
          isDirectory: !0,
          status: "normal",
          children: f
        });
      } else
        i.push({
          name: o,
          path: c,
          isDirectory: !1,
          status: "normal"
        });
    }
    return i.sort((o, s) => o.isDirectory === s.isDirectory ? o.name.localeCompare(s.name) : o.isDirectory ? -1 : 1), i;
  }
  async readFile(e) {
    return kt.readFileSync(e, "utf-8");
  }
}
const Il = new ym();
let Ft;
const _m = process.cwd();
function Pl() {
  const t = process.platform === "win32", { width: e, height: r } = Nl.getPrimaryDisplay().workAreaSize, n = Math.round(e * 0.8), a = Math.round(r * 0.85);
  if (Ft = new vs({
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
    Ft.loadURL("http://localhost:5173"), Ft.webContents.openDevTools();
  else {
    const i = Fl.join(hr.getAppPath(), "dist/index.html");
    Ft.loadFile(i);
  }
  Ft.on("closed", () => {
    Ft = null;
  });
}
hr.whenReady().then(Pl);
hr.on("window-all-closed", () => {
  process.platform !== "darwin" && hr.quit();
});
hr.on("activate", () => {
  vs.getAllWindows().length === 0 && Pl();
});
gt.handle("get-settings", () => Fn.getSettings());
gt.handle("save-settings", (t, e) => (Fn.setSettings(e), !0));
gt.handle("read-file", async (t, e) => Il.readFile(e));
gt.handle("list-files", async (t, e, r) => Il.listFiles(e, r));
gt.handle("get-git-status", async (t, e) => Tl.getStatus(e));
gt.handle("execute-git-command", async (t, e, r) => {
  try {
    return {
      success: !0,
      output: hn(r, {
        cwd: e,
        encoding: "utf-8",
        stdio: [null, "pipe", "pipe"]
      }).trim()
    };
  } catch (n) {
    return {
      success: !1,
      output: (n.stdout || n.stderr || n.message || String(n)).trim(),
      error: String(n)
    };
  }
});
gt.handle("get-file-diff", async (t, e, r) => Tl.getFileDiff(e, r));
gt.handle("get-current-repo-path", () => _m);
gt.handle("get-platform", () => process.platform);
gt.handle("minimize-window", () => {
  Ft && Ft.minimize();
});
gt.handle("close-window", () => {
  Ft && Ft.close();
});
gt.handle("get-recent-files", () => Fn.getRecentFiles());
gt.handle("add-recent-file", (t, e, r) => (Fn.addRecentFile(e, r), !0));
