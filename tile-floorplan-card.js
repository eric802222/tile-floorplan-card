const M = globalThis, B = M.ShadowRoot && (M.ShadyCSS === void 0 || M.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, J = /* @__PURE__ */ Symbol(), W = /* @__PURE__ */ new WeakMap();
let ot = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== J) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (B && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = W.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && W.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const mt = (n) => new ot(typeof n == "string" ? n : n + "", void 0, J), lt = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((i, s, r) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + n[r + 1], n[0]);
  return new ot(e, n, J);
}, ft = (n, t) => {
  if (B) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), s = M.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = e.cssText, n.appendChild(i);
  }
}, q = B ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return mt(e);
})(n) : n;
const { is: $t, defineProperty: _t, getOwnPropertyDescriptor: bt, getOwnPropertyNames: yt, getOwnPropertySymbols: vt, getPrototypeOf: wt } = Object, R = globalThis, Y = R.trustedTypes, At = Y ? Y.emptyScript : "", xt = R.reactiveElementPolyfillSupport, O = (n, t) => n, D = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? At : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, t) {
  let e = n;
  switch (t) {
    case Boolean:
      e = n !== null;
      break;
    case Number:
      e = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(n);
      } catch {
        e = null;
      }
  }
  return e;
} }, ht = (n, t) => !$t(n, t), Z = { attribute: !0, type: String, converter: D, reflect: !1, useDefault: !1, hasChanged: ht };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), R.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let v = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Z) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), s = this.getPropertyDescriptor(t, i, e);
      s !== void 0 && _t(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: s, set: r } = bt(this.prototype, t) ?? { get() {
      return this[e];
    }, set(a) {
      this[e] = a;
    } };
    return { get: s, set(a) {
      const l = s?.call(this);
      r?.call(this, a), this.requestUpdate(t, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Z;
  }
  static _$Ei() {
    if (this.hasOwnProperty(O("elementProperties"))) return;
    const t = wt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(O("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(O("properties"))) {
      const e = this.properties, i = [...yt(e), ...vt(e)];
      for (const s of i) this.createProperty(s, e[s]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, s] of e) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const s = this._$Eu(e, i);
      s !== void 0 && this._$Eh.set(s, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const s of i) e.unshift(q(s));
    } else t !== void 0 && e.push(q(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ft(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    const i = this.constructor.elementProperties.get(t), s = this.constructor._$Eu(t, i);
    if (s !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : D).toAttribute(e, i.type);
      this._$Em = t, r == null ? this.removeAttribute(s) : this.setAttribute(s, r), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, s = i._$Eh.get(t);
    if (s !== void 0 && this._$Em !== s) {
      const r = i.getPropertyOptions(s), a = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : D;
      this._$Em = s;
      const l = a.fromAttribute(e, r.type);
      this[s] = l ?? this._$Ej?.get(s) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, s = !1, r) {
    if (t !== void 0) {
      const a = this.constructor;
      if (s === !1 && (r = this[t]), i ??= a.getPropertyOptions(t), !((i.hasChanged ?? ht)(r, e) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(a._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: s, wrapped: r }, a) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, a ?? e ?? this[t]), r !== !0 || a !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), s === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [s, r] of this._$Ep) this[s] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, r] of i) {
        const { wrapped: a } = r, l = this[s];
        a !== !0 || this._$AL.has(s) || l === void 0 || this.C(s, void 0, r, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[O("elementProperties")] = /* @__PURE__ */ new Map(), v[O("finalized")] = /* @__PURE__ */ new Map(), xt?.({ ReactiveElement: v }), (R.reactiveElementVersions ??= []).push("2.1.2");
const F = globalThis, K = (n) => n, U = F.trustedTypes, X = U ? U.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, dt = "$lit$", $ = `lit$${Math.random().toFixed(9).slice(2)}$`, ct = "?" + $, Et = `<${ct}>`, y = document, C = () => y.createComment(""), k = (n) => n === null || typeof n != "object" && typeof n != "function", G = Array.isArray, St = (n) => G(n) || typeof n?.[Symbol.iterator] == "function", L = `[ 	
\f\r]`, S = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Q = /-->/g, tt = />/g, _ = RegExp(`>|${L}(?:([^\\s"'>=/]+)(${L}*=${L}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), et = /'/g, it = /"/g, pt = /^(?:script|style|textarea|title)$/i, Ot = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), g = Ot(1), A = /* @__PURE__ */ Symbol.for("lit-noChange"), p = /* @__PURE__ */ Symbol.for("lit-nothing"), st = /* @__PURE__ */ new WeakMap(), b = y.createTreeWalker(y, 129);
function gt(n, t) {
  if (!G(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return X !== void 0 ? X.createHTML(t) : t;
}
const Ct = (n, t) => {
  const e = n.length - 1, i = [];
  let s, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", a = S;
  for (let l = 0; l < e; l++) {
    const o = n[l];
    let c, h, d = -1, u = 0;
    for (; u < o.length && (a.lastIndex = u, h = a.exec(o), h !== null); ) u = a.lastIndex, a === S ? h[1] === "!--" ? a = Q : h[1] !== void 0 ? a = tt : h[2] !== void 0 ? (pt.test(h[2]) && (s = RegExp("</" + h[2], "g")), a = _) : h[3] !== void 0 && (a = _) : a === _ ? h[0] === ">" ? (a = s ?? S, d = -1) : h[1] === void 0 ? d = -2 : (d = a.lastIndex - h[2].length, c = h[1], a = h[3] === void 0 ? _ : h[3] === '"' ? it : et) : a === it || a === et ? a = _ : a === Q || a === tt ? a = S : (a = _, s = void 0);
    const f = a === _ && n[l + 1].startsWith("/>") ? " " : "";
    r += a === S ? o + Et : d >= 0 ? (i.push(c), o.slice(0, d) + dt + o.slice(d) + $ + f) : o + $ + (d === -2 ? l : f);
  }
  return [gt(n, r + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class N {
  constructor({ strings: t, _$litType$: e }, i) {
    let s;
    this.parts = [];
    let r = 0, a = 0;
    const l = t.length - 1, o = this.parts, [c, h] = Ct(t, e);
    if (this.el = N.createElement(c, i), b.currentNode = this.el.content, e === 2 || e === 3) {
      const d = this.el.content.firstChild;
      d.replaceWith(...d.childNodes);
    }
    for (; (s = b.nextNode()) !== null && o.length < l; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const d of s.getAttributeNames()) if (d.endsWith(dt)) {
          const u = h[a++], f = s.getAttribute(d).split($), P = /([.?@])?(.*)/.exec(u);
          o.push({ type: 1, index: r, name: P[2], strings: f, ctor: P[1] === "." ? Nt : P[1] === "?" ? zt : P[1] === "@" ? Pt : H }), s.removeAttribute(d);
        } else d.startsWith($) && (o.push({ type: 6, index: r }), s.removeAttribute(d));
        if (pt.test(s.tagName)) {
          const d = s.textContent.split($), u = d.length - 1;
          if (u > 0) {
            s.textContent = U ? U.emptyScript : "";
            for (let f = 0; f < u; f++) s.append(d[f], C()), b.nextNode(), o.push({ type: 2, index: ++r });
            s.append(d[u], C());
          }
        }
      } else if (s.nodeType === 8) if (s.data === ct) o.push({ type: 2, index: r });
      else {
        let d = -1;
        for (; (d = s.data.indexOf($, d + 1)) !== -1; ) o.push({ type: 7, index: r }), d += $.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const i = y.createElement("template");
    return i.innerHTML = t, i;
  }
}
function x(n, t, e = n, i) {
  if (t === A) return t;
  let s = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const r = k(t) ? void 0 : t._$litDirective$;
  return s?.constructor !== r && (s?._$AO?.(!1), r === void 0 ? s = void 0 : (s = new r(n), s._$AT(n, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = s : e._$Cl = s), s !== void 0 && (t = x(n, s._$AS(n, t.values), s, i)), t;
}
class kt {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: i } = this._$AD, s = (t?.creationScope ?? y).importNode(e, !0);
    b.currentNode = s;
    let r = b.nextNode(), a = 0, l = 0, o = i[0];
    for (; o !== void 0; ) {
      if (a === o.index) {
        let c;
        o.type === 2 ? c = new z(r, r.nextSibling, this, t) : o.type === 1 ? c = new o.ctor(r, o.name, o.strings, this, t) : o.type === 6 && (c = new Tt(r, this, t)), this._$AV.push(c), o = i[++l];
      }
      a !== o?.index && (r = b.nextNode(), a++);
    }
    return b.currentNode = y, s;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class z {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, s) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = s, this._$Cv = s?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = x(this, t, e), k(t) ? t === p || t == null || t === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : t !== this._$AH && t !== A && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : St(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== p && k(this._$AH) ? this._$AA.nextSibling.data = t : this.T(y.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, s = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = N.createElement(gt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === s) this._$AH.p(e);
    else {
      const r = new kt(s, this), a = r.u(this.options);
      r.p(e), this.T(a), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = st.get(t.strings);
    return e === void 0 && st.set(t.strings, e = new N(t)), e;
  }
  k(t) {
    G(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, s = 0;
    for (const r of t) s === e.length ? e.push(i = new z(this.O(C()), this.O(C()), this, this.options)) : i = e[s], i._$AI(r), s++;
    s < e.length && (this._$AR(i && i._$AB.nextSibling, s), e.length = s);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = K(t).nextSibling;
      K(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class H {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, s, r) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = p;
  }
  _$AI(t, e = this, i, s) {
    const r = this.strings;
    let a = !1;
    if (r === void 0) t = x(this, t, e, 0), a = !k(t) || t !== this._$AH && t !== A, a && (this._$AH = t);
    else {
      const l = t;
      let o, c;
      for (t = r[0], o = 0; o < r.length - 1; o++) c = x(this, l[i + o], e, o), c === A && (c = this._$AH[o]), a ||= !k(c) || c !== this._$AH[o], c === p ? t = p : t !== p && (t += (c ?? "") + r[o + 1]), this._$AH[o] = c;
    }
    a && !s && this.j(t);
  }
  j(t) {
    t === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Nt extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === p ? void 0 : t;
  }
}
class zt extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== p);
  }
}
class Pt extends H {
  constructor(t, e, i, s, r) {
    super(t, e, i, s, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = x(this, t, e, 0) ?? p) === A) return;
    const i = this._$AH, s = t === p && i !== p || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== p && (i === p || s);
    s && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Tt {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    x(this, t);
  }
}
const Mt = F.litHtmlPolyfillSupport;
Mt?.(N, z), (F.litHtmlVersions ??= []).push("3.3.3");
const jt = (n, t, e) => {
  const i = e?.renderBefore ?? t;
  let s = i._$litPart$;
  if (s === void 0) {
    const r = e?.renderBefore ?? null;
    i._$litPart$ = s = new z(t.insertBefore(C(), r), r, void 0, e ?? {});
  }
  return s._$AI(n), s;
};
const V = globalThis;
class w extends v {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = jt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return A;
  }
}
w._$litElement$ = !0, w.finalized = !0, V.litElementHydrateSupport?.({ LitElement: w });
const Ut = V.litElementPolyfillSupport;
Ut?.({ LitElement: w });
(V.litElementVersions ??= []).push("4.2.2");
const I = Object.freeze({
  type: "custom:ha-floorplan-card",
  grid: { width: 20, height: 15, tile_size: 16, background: "" },
  show_grid: !1,
  assets: [],
  objects: []
}), m = (n, t) => {
  const e = Number(n);
  return Number.isFinite(e) ? e : t;
};
function E(n = {}) {
  const t = n.grid || {};
  return {
    ...n,
    type: "custom:ha-floorplan-card",
    grid: {
      ...t,
      width: Math.max(1, m(t.width, I.grid.width)),
      height: Math.max(1, m(t.height, I.grid.height)),
      tile_size: Math.max(1, m(t.tile_size, I.grid.tile_size)),
      background: t.background || ""
    },
    show_grid: !!n.show_grid,
    assets: Array.isArray(n.assets) ? n.assets.map((e, i) => Rt(e, i)) : [],
    objects: Array.isArray(n.objects) ? n.objects.map((e, i) => Ht(e, i)) : []
  };
}
function Rt(n = {}, t = 0) {
  return {
    ...n,
    id: n.id || `asset-${t + 1}`,
    name: n.name || n.id || `Asset ${t + 1}`,
    width: Math.max(0.25, m(n.width, 1)),
    height: Math.max(0.25, m(n.height, 1)),
    images: { ...n.images || {} }
  };
}
function j(n, t = []) {
  const e = t.find((i) => i.id === n.asset_id);
  return e ? {
    ...e,
    ...n,
    images: { ...e.images, ...n.images },
    width: n.width ?? e.width,
    height: n.height ?? e.height
  } : n;
}
function Ht(n = {}, t = 0) {
  return {
    ...n,
    id: n.id || `object-${t + 1}`,
    type: n.type || (n.entity_id ? "entity" : "virtual"),
    x: m(n.x, 0),
    y: m(n.y, 0),
    z: m(n.z, 0),
    width: n.width === void 0 && n.asset_id ? void 0 : Math.max(0.25, m(n.width, 1)),
    height: n.height === void 0 && n.asset_id ? void 0 : Math.max(0.25, m(n.height, 1)),
    images: { ...n.images || {} }
  };
}
function ut(n, t) {
  let e = n.images?.default || "";
  if (n.entity_id) {
    const i = t?.states?.[n.entity_id]?.state;
    i && n.images?.[i] && (e = n.images[i]);
  }
  for (const i of n.conditions || [])
    t?.states?.[i?.if?.entity_id]?.state === i?.if?.state && (e = i.image || e);
  return e;
}
function nt(n, t = "tap") {
  const e = n[`${t}_action`];
  return e || (t === "tap" && n.entity_id ? { action: "toggle" } : { action: "none" });
}
function Lt(n, t) {
  return {
    ...n,
    x: Math.max(0, Math.min(n.x, t.width - n.width)),
    y: Math.max(0, Math.min(n.y, t.height - n.height))
  };
}
function It(n, t, e, i) {
  const s = i?.action || "none", r = i?.entity || e.entity_id;
  if (s === "toggle" && r) {
    const a = r.split(".")[0];
    t.callService(a, "toggle", { entity_id: r });
    return;
  }
  if (s === "call-service" && i.service) {
    const [a, l] = i.service.split(".");
    t.callService(a, l, {
      ...i.service_data || i.data || {},
      ...r ? { entity_id: r } : {}
    });
    return;
  }
  if (s === "more-info" && r) {
    n.dispatchEvent(new CustomEvent("hass-more-info", {
      bubbles: !0,
      composed: !0,
      detail: { entityId: r }
    }));
    return;
  }
  if (s === "navigate" && i.navigation_path) {
    history.pushState(null, "", i.navigation_path), window.dispatchEvent(new Event("location-changed"));
    return;
  }
  s === "url" && i.url_path && window.open(i.url_path, i.new_tab === !1 ? "_self" : "_blank");
}
class Dt extends w {
  static properties = {
    hass: { attribute: !1 },
    config: { state: !0 }
  };
  static styles = lt`
    :host { display: block; }
    ha-card { overflow: hidden; }
    .floorplan {
      position: relative;
      width: 100%;
      background-repeat: no-repeat;
      background-position: top left;
      background-size: 100% 100%;
      image-rendering: pixelated;
      overflow: hidden;
      touch-action: manipulation;
    }
    .object {
      position: absolute;
      display: block;
      padding: 0;
      border: 0;
      background-color: transparent;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      image-rendering: pixelated;
    }
    button.object { cursor: pointer; }
    .grid-lines {
      pointer-events: none;
      position: absolute;
      inset: 0;
      z-index: 100000;
    }
  `;
  setConfig(t) {
    if (!t?.grid) throw new Error("You need to define a grid with width and height");
    this.config = E(t);
  }
  static getConfigElement() {
    return document.createElement("ha-floorplan-card-editor");
  }
  static getStubConfig() {
    return structuredClone(E());
  }
  getCardSize() {
    return Math.max(1, Math.ceil((this.config?.grid?.height || 5) / 3));
  }
  _runAction(t) {
    It(this, this.hass, t, nt(t));
  }
  _objectTemplate(t) {
    t = j(t, this.config.assets);
    const e = this.config.grid, i = ut(t, this.hass);
    if (!i) return p;
    const s = [
      `left:${t.x / e.width * 100}%`,
      `top:${t.y / e.height * 100}%`,
      `width:${t.width / e.width * 100}%`,
      `height:${t.height / e.height * 100}%`,
      `z-index:${t.z}`,
      `background-image:url(${JSON.stringify(i)})`
    ].join(";");
    return nt(t).action !== "none" ? g`<button class="object" style=${s} title=${t.name || t.id}
          aria-label=${t.name || t.id} @click=${() => this._runAction(t)}></button>` : g`<div class="object" style=${s} title=${t.name || t.id}></div>`;
  }
  render() {
    if (!this.config || !this.hass) return p;
    const { grid: t } = this.config, e = [...this.config.objects].sort((r, a) => r.z - a.z), i = [
      `aspect-ratio:${t.width}/${t.height}`,
      t.background ? `background-image:url(${JSON.stringify(t.background)})` : ""
    ].join(";"), s = [
      "background-image:linear-gradient(to right,rgba(0,0,0,.28) 1px,transparent 1px),linear-gradient(to bottom,rgba(0,0,0,.28) 1px,transparent 1px)",
      `background-size:${100 / t.width}% ${100 / t.height}%`
    ].join(";");
    return g`<ha-card>
      <div class="floorplan" style=${i}>
        ${e.map((r) => this._objectTemplate(r))}
        ${this.config.show_grid ? g`<div class="grid-lines" style=${s}></div>` : p}
      </div>
    </ha-card>`;
  }
}
const rt = (n = []) => Object.fromEntries(
  n.map(({ name: t, value: e }) => [t, e])
), at = (n) => Object.entries(n).filter(([, t]) => t != null && t !== "").map(([t, e]) => ({
  name: t,
  type: typeof e == "number" ? "float" : typeof e == "boolean" ? "bool" : "string",
  value: typeof e == "object" ? JSON.stringify(e) : e
})), T = (n, t) => {
  if (typeof n != "string") return n ?? t;
  try {
    return JSON.parse(n);
  } catch {
    return t;
  }
};
function Bt(n) {
  const t = E(n), { grid: e } = t;
  return {
    type: "map",
    version: "1.10",
    tiledversion: "1.11.2",
    orientation: "orthogonal",
    renderorder: "right-down",
    width: e.width,
    height: e.height,
    tilewidth: e.tile_size,
    tileheight: e.tile_size,
    infinite: !1,
    nextlayerid: 3,
    nextobjectid: t.objects.length + 1,
    properties: at({
      ha_card_type: t.type,
      background: e.background,
      assets: t.assets
    }),
    layers: [
      ...e.background ? [{
        id: 1,
        name: "Background",
        type: "imagelayer",
        image: e.background,
        x: 0,
        y: 0,
        visible: !0,
        opacity: 1
      }] : [],
      {
        id: 2,
        name: "Home Assistant Objects",
        type: "objectgroup",
        draworder: "index",
        visible: !0,
        opacity: 1,
        objects: t.objects.map((i, s) => ({
          id: s + 1,
          name: i.id,
          class: i.type === "entity" ? "ha-entity" : "virtual",
          x: i.x * e.tile_size,
          y: i.y * e.tile_size,
          width: i.width * e.tile_size,
          height: i.height * e.tile_size,
          visible: i.visible !== !1,
          properties: at({
            entity_id: i.entity_id,
            asset_id: i.asset_id,
            z: i.z,
            images: i.images,
            conditions: i.conditions,
            tap_action: i.tap_action
          })
        }))
      }
    ]
  };
}
function Jt(n, t = {}) {
  if (!n || n.type !== "map") throw new Error("The selected file is not a Tiled JSON map");
  const e = rt(n.properties), i = Number(n.tilewidth || n.tileheight || t.grid?.tile_size || 16), s = (n.layers || []).find((l) => l.type === "imagelayer"), a = (n.layers || []).filter((l) => l.type === "objectgroup").flatMap((l) => (l.objects || []).map((o, c) => {
    const h = rt(o.properties);
    return {
      id: o.name || `object-${c + 1}`,
      type: o.class === "ha-entity" || h.entity_id ? "entity" : "virtual",
      entity_id: h.entity_id || "",
      asset_id: h.asset_id || "",
      x: Number(o.x || 0) / i,
      y: Number(o.y || 0) / i,
      z: Number(h.z ?? c),
      width: Number(o.width || i) / i,
      height: Number(o.height || i) / i,
      visible: o.visible !== !1,
      images: T(h.images, {}),
      conditions: T(h.conditions, void 0),
      tap_action: T(h.tap_action, void 0)
    };
  }));
  return E({
    ...t,
    grid: {
      ...t.grid,
      width: Number(n.width || t.grid?.width || 20),
      height: Number(n.height || t.grid?.height || 15),
      tile_size: i,
      background: e.background || s?.image || t.grid?.background || ""
    },
    assets: T(e.assets, t.assets || []),
    objects: a
  });
}
class Ft extends w {
  static properties = {
    hass: { attribute: !1 },
    config: { state: !0 },
    _selected: { state: !0 }
  };
  static styles = lt`
    :host { display: block; }
    .editor { display: grid; gap: 16px; padding: 8px 0; }
    .settings { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    label { display: grid; gap: 4px; font-size: 12px; }
    input, select, textarea, button { box-sizing: border-box; font: inherit; }
    input, select, textarea { width: 100%; padding: 8px; }
    .wide { grid-column: 1 / -1; }
    .stage {
      position: relative; width: 100%; overflow: hidden;
      border: 1px solid var(--divider-color); border-radius: 8px;
      background-repeat: no-repeat; background-size: 100% 100%; background-position: top left;
      image-rendering: pixelated; touch-action: none;
    }
    .grid { position: absolute; inset: 0; pointer-events: none; }
    .sprite {
      position: absolute; padding: 0; border: 1px dashed transparent;
      background: transparent center / contain no-repeat; image-rendering: pixelated;
      cursor: grab; touch-action: none;
    }
    .sprite.selected { border-color: var(--primary-color); background-color: color-mix(in srgb, var(--primary-color) 15%, transparent); }
    .toolbar, .row { display: flex; gap: 8px; align-items: center; }
    .toolbar { justify-content: space-between; }
    .objects { display: grid; gap: 10px; }
    .asset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
    .asset { display: grid; gap: 6px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 8px; }
    .asset img { width: 100%; height: 64px; object-fit: contain; image-rendering: pixelated; background: var(--secondary-background-color); }
    .asset button { width: 100%; }
    details { border: 1px solid var(--divider-color); border-radius: 8px; padding: 8px; }
    summary { cursor: pointer; }
    .object-fields { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    .object-fields .span-2 { grid-column: span 2; }
    .object-fields .span-4 { grid-column: 1 / -1; }
    .danger { color: var(--error-color); margin-left: auto; }
    .hint { color: var(--secondary-text-color); font-size: 12px; margin: 0; }
    @media (max-width: 520px) {
      .settings { grid-template-columns: 1fr; }
      .wide { grid-column: auto; }
      .object-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .object-fields .span-4 { grid-column: 1 / -1; }
    }
  `;
  setConfig(t) {
    this.config = E(t), this._selected >= this.config.objects.length && (this._selected = void 0);
  }
  _emit(t = this.config) {
    this.config = E(t), this.dispatchEvent(new CustomEvent("config-changed", {
      bubbles: !0,
      composed: !0,
      detail: { config: structuredClone(this.config) }
    }));
  }
  _setGrid(t, e) {
    this._emit({ ...this.config, grid: { ...this.config.grid, [t]: e } });
  }
  _updateObject(t, e) {
    const i = this.config.objects.map((s, r) => r === t ? { ...s, ...e } : s);
    this._emit({ ...this.config, objects: i });
  }
  _updateImage(t, e, i) {
    const s = this.config.objects[t];
    this._updateObject(t, { images: { ...s.images, [e]: i } });
  }
  _addObject() {
    const t = this.config.objects.length;
    this._emit({
      ...this.config,
      objects: [...this.config.objects, {
        id: `object-${t + 1}`,
        type: "entity",
        entity_id: "",
        x: 0,
        y: 0,
        z: t,
        width: 1,
        height: 1,
        images: { default: "" },
        tap_action: { action: "toggle" }
      }]
    }), this._selected = t;
  }
  _addAsset() {
    const t = this.config.assets.length;
    this._emit({ ...this.config, assets: [...this.config.assets, {
      id: `asset-${t + 1}`,
      name: `Asset ${t + 1}`,
      width: 1,
      height: 1,
      images: { default: "" }
    }] });
  }
  _updateAsset(t, e) {
    const i = this.config.assets[t].id, s = this.config.assets.map((a, l) => l === t ? { ...a, ...e } : a), r = e.id && e.id !== i ? this.config.objects.map((a) => a.asset_id === i ? { ...a, asset_id: e.id } : a) : this.config.objects;
    this._emit({ ...this.config, assets: s, objects: r });
  }
  _removeAsset(t) {
    this._emit({ ...this.config, assets: this.config.assets.filter((e, i) => i !== t) });
  }
  _placeAsset(t) {
    const e = this.config.objects.length;
    this._emit({ ...this.config, objects: [...this.config.objects, {
      id: `${t.id}-${e + 1}`,
      type: "virtual",
      asset_id: t.id,
      x: 0,
      y: 0,
      z: e,
      width: t.width,
      height: t.height,
      images: {}
    }] }), this._selected = e;
  }
  _downloadTiled() {
    const t = new Blob([JSON.stringify(Bt(this.config), null, 2)], { type: "application/json" }), e = URL.createObjectURL(t), i = document.createElement("a");
    i.href = e, i.download = "home-floorplan.tmj", i.click(), URL.revokeObjectURL(e);
  }
  async _importTiled(t) {
    const e = t.target.files?.[0];
    if (e)
      try {
        this._emit(Jt(JSON.parse(await e.text()), this.config)), this._selected = void 0;
      } catch (i) {
        alert(`Unable to import Tiled map: ${i.message}`);
      } finally {
        t.target.value = "";
      }
  }
  _removeObject(t) {
    this._emit({ ...this.config, objects: this.config.objects.filter((e, i) => i !== t) }), this._selected = void 0;
  }
  _dragStart(t, e) {
    t.preventDefault(), this._selected = e;
    const i = this.renderRoot.querySelector(".stage"), s = j(this.config.objects[e], this.config.assets), r = i.getBoundingClientRect(), a = { x: t.clientX, y: t.clientY, object: s, rect: r };
    t.currentTarget.setPointerCapture(t.pointerId);
    const l = (c) => {
      const h = (c.clientX - a.x) / a.rect.width * this.config.grid.width, d = (c.clientY - a.y) / a.rect.height * this.config.grid.height, u = Lt({ ...a.object, x: Math.round(a.object.x + h), y: Math.round(a.object.y + d) }, this.config.grid);
      this._updateObject(e, { x: u.x, y: u.y });
    }, o = () => {
      window.removeEventListener("pointermove", l), window.removeEventListener("pointerup", o);
    };
    window.addEventListener("pointermove", l), window.addEventListener("pointerup", o, { once: !0 });
  }
  _stageObject(t, e) {
    t = j(t, this.config.assets);
    const { grid: i } = this.config, s = ut(t, this.hass), r = [
      `left:${t.x / i.width * 100}%`,
      `top:${t.y / i.height * 100}%`,
      `width:${t.width / i.width * 100}%`,
      `height:${t.height / i.height * 100}%`,
      `z-index:${t.z}`,
      s ? `background-image:url(${JSON.stringify(s)})` : ""
    ].join(";");
    return g`<button class="sprite ${this._selected === e ? "selected" : ""}"
      style=${r} title=${t.id} @pointerdown=${(a) => this._dragStart(a, e)}></button>`;
  }
  _objectForm(t, e) {
    const i = j(t, this.config.assets), s = t.tap_action?.action || (t.entity_id ? "toggle" : "none");
    return g`<details ?open=${this._selected === e} @toggle=${(r) => {
      r.currentTarget.open && (this._selected = e);
    }}>
      <summary>${t.id} — (${t.x}, ${t.y})</summary>
      <div class="object-fields">
        <label class="span-2">ID<input .value=${t.id} @change=${(r) => this._updateObject(e, { id: r.target.value })}></label>
        <label class="span-2">Entity ID<input .value=${t.entity_id || ""} @change=${(r) => this._updateObject(e, { entity_id: r.target.value })}></label>
        ${["x", "y", "z", "width", "height"].map((r) => g`<label>${r}<input type="number" step=${r === "width" || r === "height" ? ".25" : "1"}
          .value=${String(i[r] ?? "")} @change=${(a) => this._updateObject(e, { [r]: Number(a.target.value) })}></label>`)}
        <label class="span-2">Asset<select .value=${t.asset_id || ""} @change=${(r) => this._updateObject(e, { asset_id: r.target.value })}>
          <option value="">None</option>${this.config.assets.map((r) => g`<option value=${r.id}>${r.name}</option>`)}
        </select></label>
        <label class="span-2">Default image<input .value=${t.images?.default || ""} @change=${(r) => this._updateImage(e, "default", r.target.value)}></label>
        <label>On image<input .value=${t.images?.on || ""} @change=${(r) => this._updateImage(e, "on", r.target.value)}></label>
        <label>Off image<input .value=${t.images?.off || ""} @change=${(r) => this._updateImage(e, "off", r.target.value)}></label>
        <label class="span-2">Tap action<select .value=${s} @change=${(r) => this._updateObject(e, { tap_action: { ...t.tap_action, action: r.target.value } })}>
          ${["none", "toggle", "more-info", "call-service", "navigate", "url"].map((r) => g`<option value=${r}>${r}</option>`)}
        </select></label>
        ${s === "call-service" ? g`<label class="span-2">Service<input placeholder="light.turn_on" .value=${t.tap_action?.service || ""} @change=${(r) => this._updateObject(e, { tap_action: { ...t.tap_action, service: r.target.value } })}></label>` : p}
        ${s === "navigate" ? g`<label class="span-2">Navigation path<input .value=${t.tap_action?.navigation_path || ""} @change=${(r) => this._updateObject(e, { tap_action: { ...t.tap_action, navigation_path: r.target.value } })}></label>` : p}
        <button class="danger span-4" type="button" @click=${() => this._removeObject(e)}>Remove object</button>
      </div>
    </details>`;
  }
  render() {
    if (!this.config) return p;
    const { grid: t } = this.config, e = [
      `aspect-ratio:${t.width}/${t.height}`,
      t.background ? `background-image:url(${JSON.stringify(t.background)})` : ""
    ].join(";"), i = [
      "background-image:linear-gradient(to right,rgba(0,0,0,.25) 1px,transparent 1px),linear-gradient(to bottom,rgba(0,0,0,.25) 1px,transparent 1px)",
      `background-size:${100 / t.width}% ${100 / t.height}%`
    ].join(";");
    return g`<div class="editor">
      <div class="settings">
        <label>Grid width<input type="number" min="1" .value=${String(t.width)} @change=${(s) => this._setGrid("width", Number(s.target.value))}></label>
        <label>Grid height<input type="number" min="1" .value=${String(t.height)} @change=${(s) => this._setGrid("height", Number(s.target.value))}></label>
        <label>Tile size<input type="number" min="1" .value=${String(t.tile_size)} @change=${(s) => this._setGrid("tile_size", Number(s.target.value))}></label>
        <label>Show grid<input type="checkbox" .checked=${this.config.show_grid} @change=${(s) => this._emit({ ...this.config, show_grid: s.target.checked })}></label>
        <label class="wide">Background URL<input .value=${t.background} @change=${(s) => this._setGrid("background", s.target.value)}></label>
      </div>
      <p class="hint">Drag objects on the preview. Positions snap to the 16×16 logical grid.</p>
      <div class="stage" style=${e}>
        ${this.config.objects.map((s, r) => this._stageObject(s, r))}
        <div class="grid" style=${i}></div>
      </div>
      <div class="toolbar"><strong>Asset library (${this.config.assets.length})</strong><button type="button" @click=${this._addAsset}>Add asset</button></div>
      <div class="asset-grid">${this.config.assets.map((s, r) => g`
        <div class="asset">
          ${s.images?.default ? g`<img src=${s.images.default} alt=${s.name}>` : g`<div class="hint">No image</div>`}
          <input aria-label="Asset ID" .value=${s.id} @change=${(a) => this._updateAsset(r, { id: a.target.value })}>
          <input aria-label="Asset name" .value=${s.name} @change=${(a) => this._updateAsset(r, { name: a.target.value })}>
          <input aria-label="Asset image" placeholder="Image URL" .value=${s.images?.default || ""} @change=${(a) => this._updateAsset(r, { images: { ...s.images, default: a.target.value } })}>
          <div class="row"><input aria-label="Asset width" type="number" min=".25" step=".25" .value=${String(s.width)} @change=${(a) => this._updateAsset(r, { width: Number(a.target.value) })}>
          <input aria-label="Asset height" type="number" min=".25" step=".25" .value=${String(s.height)} @change=${(a) => this._updateAsset(r, { height: Number(a.target.value) })}></div>
          <button type="button" @click=${() => this._placeAsset(s)}>Place</button>
          <button class="danger" type="button" @click=${() => this._removeAsset(r)}>Remove</button>
        </div>`)}
      </div>
      <div class="toolbar"><strong>Tiled</strong><div class="row">
        <label><span class="hint">Import .tmj</span><input type="file" accept=".tmj,.json,application/json" @change=${this._importTiled}></label>
        <button type="button" @click=${this._downloadTiled}>Export .tmj</button>
      </div></div>
      <div class="toolbar"><strong>Objects (${this.config.objects.length})</strong><button type="button" @click=${this._addObject}>Add object</button></div>
      <div class="objects">${this.config.objects.map((s, r) => this._objectForm(s, r))}</div>
    </div>`;
  }
}
customElements.get("ha-floorplan-card-editor") || customElements.define("ha-floorplan-card-editor", Ft);
customElements.get("ha-floorplan-card") || customElements.define("ha-floorplan-card", Dt);
window.customCards = window.customCards || [];
window.customCards.some((n) => n.type === "ha-floorplan-card") || window.customCards.push({
  type: "ha-floorplan-card",
  name: "Tile Floorplan Card",
  description: "RPG-style floor plan with clickable Home Assistant entities",
  preview: !0
});
