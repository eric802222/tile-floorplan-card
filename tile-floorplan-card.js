const z = globalThis, I = z.ShadowRoot && (z.ShadyCSS === void 0 || z.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, L = /* @__PURE__ */ Symbol(), V = /* @__PURE__ */ new WeakMap();
let st = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== L) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (I && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = V.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && V.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const dt = (n) => new st(typeof n == "string" ? n : n + "", void 0, L), nt = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((i, s, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + n[r + 1], n[0]);
  return new st(e, n, L);
}, pt = (n, t) => {
  if (I) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), s = z.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = e.cssText, n.appendChild(i);
  }
}, W = I ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return dt(e);
})(n) : n;
const { is: ut, defineProperty: gt, getOwnPropertyDescriptor: $t, getOwnPropertyNames: ft, getOwnPropertySymbols: mt, getPrototypeOf: _t } = Object, T = globalThis, q = T.trustedTypes, bt = q ? q.emptyScript : "", yt = T.reactiveElementPolyfillSupport, S = (n, t) => n, D = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? bt : null;
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
} }, rt = (n, t) => !ut(n, t), J = { attribute: !0, type: String, converter: D, reflect: !1, useDefault: !1, hasChanged: rt };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), T.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let v = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = J) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), s = this.getPropertyDescriptor(t, i, e);
      s !== void 0 && gt(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: s, set: r } = $t(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: s, set(o) {
      const h = s?.call(this);
      r?.call(this, o), this.requestUpdate(t, h, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? J;
  }
  static _$Ei() {
    if (this.hasOwnProperty(S("elementProperties"))) return;
    const t = _t(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(S("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(S("properties"))) {
      const e = this.properties, i = [...ft(e), ...mt(e)];
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
      for (const s of i) e.unshift(W(s));
    } else t !== void 0 && e.push(W(t));
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
    return pt(t, this.constructor.elementStyles), t;
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
      const r = i.getPropertyOptions(s), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : D;
      this._$Em = s;
      const h = o.fromAttribute(e, r.type);
      this[s] = h ?? this._$Ej?.get(s) ?? h, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, s = !1, r) {
    if (t !== void 0) {
      const o = this.constructor;
      if (s === !1 && (r = this[t]), i ??= o.getPropertyOptions(t), !((i.hasChanged ?? rt)(r, e) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: s, wrapped: r }, o) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), r !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), s === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        const { wrapped: o } = r, h = this[s];
        o !== !0 || this._$AL.has(s) || h === void 0 || this.C(s, void 0, r, h);
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
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[S("elementProperties")] = /* @__PURE__ */ new Map(), v[S("finalized")] = /* @__PURE__ */ new Map(), yt?.({ ReactiveElement: v }), (T.reactiveElementVersions ??= []).push("2.1.2");
const B = globalThis, Y = (n) => n, N = B.trustedTypes, Z = N ? N.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, ot = "$lit$", f = `lit$${Math.random().toFixed(9).slice(2)}$`, at = "?" + f, vt = `<${at}>`, y = document, C = () => y.createComment(""), O = (n) => n === null || typeof n != "object" && typeof n != "function", F = Array.isArray, At = (n) => F(n) || typeof n?.[Symbol.iterator] == "function", H = `[ 	
\f\r]`, x = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, K = /-->/g, X = />/g, _ = RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Q = /'/g, tt = /"/g, lt = /^(?:script|style|textarea|title)$/i, wt = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), g = wt(1), w = /* @__PURE__ */ Symbol.for("lit-noChange"), c = /* @__PURE__ */ Symbol.for("lit-nothing"), et = /* @__PURE__ */ new WeakMap(), b = y.createTreeWalker(y, 129);
function ht(n, t) {
  if (!F(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Z !== void 0 ? Z.createHTML(t) : t;
}
const Et = (n, t) => {
  const e = n.length - 1, i = [];
  let s, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = x;
  for (let h = 0; h < e; h++) {
    const a = n[h];
    let d, p, l = -1, u = 0;
    for (; u < a.length && (o.lastIndex = u, p = o.exec(a), p !== null); ) u = o.lastIndex, o === x ? p[1] === "!--" ? o = K : p[1] !== void 0 ? o = X : p[2] !== void 0 ? (lt.test(p[2]) && (s = RegExp("</" + p[2], "g")), o = _) : p[3] !== void 0 && (o = _) : o === _ ? p[0] === ">" ? (o = s ?? x, l = -1) : p[1] === void 0 ? l = -2 : (l = o.lastIndex - p[2].length, d = p[1], o = p[3] === void 0 ? _ : p[3] === '"' ? tt : Q) : o === tt || o === Q ? o = _ : o === K || o === X ? o = x : (o = _, s = void 0);
    const $ = o === _ && n[h + 1].startsWith("/>") ? " " : "";
    r += o === x ? a + vt : l >= 0 ? (i.push(d), a.slice(0, l) + ot + a.slice(l) + f + $) : a + f + (l === -2 ? h : $);
  }
  return [ht(n, r + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class k {
  constructor({ strings: t, _$litType$: e }, i) {
    let s;
    this.parts = [];
    let r = 0, o = 0;
    const h = t.length - 1, a = this.parts, [d, p] = Et(t, e);
    if (this.el = k.createElement(d, i), b.currentNode = this.el.content, e === 2 || e === 3) {
      const l = this.el.content.firstChild;
      l.replaceWith(...l.childNodes);
    }
    for (; (s = b.nextNode()) !== null && a.length < h; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const l of s.getAttributeNames()) if (l.endsWith(ot)) {
          const u = p[o++], $ = s.getAttribute(l).split(f), M = /([.?@])?(.*)/.exec(u);
          a.push({ type: 1, index: r, name: M[2], strings: $, ctor: M[1] === "." ? St : M[1] === "?" ? Ct : M[1] === "@" ? Ot : j }), s.removeAttribute(l);
        } else l.startsWith(f) && (a.push({ type: 6, index: r }), s.removeAttribute(l));
        if (lt.test(s.tagName)) {
          const l = s.textContent.split(f), u = l.length - 1;
          if (u > 0) {
            s.textContent = N ? N.emptyScript : "";
            for (let $ = 0; $ < u; $++) s.append(l[$], C()), b.nextNode(), a.push({ type: 2, index: ++r });
            s.append(l[u], C());
          }
        }
      } else if (s.nodeType === 8) if (s.data === at) a.push({ type: 2, index: r });
      else {
        let l = -1;
        for (; (l = s.data.indexOf(f, l + 1)) !== -1; ) a.push({ type: 7, index: r }), l += f.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const i = y.createElement("template");
    return i.innerHTML = t, i;
  }
}
function E(n, t, e = n, i) {
  if (t === w) return t;
  let s = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const r = O(t) ? void 0 : t._$litDirective$;
  return s?.constructor !== r && (s?._$AO?.(!1), r === void 0 ? s = void 0 : (s = new r(n), s._$AT(n, e, i)), i !== void 0 ? (e._$Co ??= [])[i] = s : e._$Cl = s), s !== void 0 && (t = E(n, s._$AS(n, t.values), s, i)), t;
}
class xt {
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
    let r = b.nextNode(), o = 0, h = 0, a = i[0];
    for (; a !== void 0; ) {
      if (o === a.index) {
        let d;
        a.type === 2 ? d = new P(r, r.nextSibling, this, t) : a.type === 1 ? d = new a.ctor(r, a.name, a.strings, this, t) : a.type === 6 && (d = new kt(r, this, t)), this._$AV.push(d), a = i[++h];
      }
      o !== a?.index && (r = b.nextNode(), o++);
    }
    return b.currentNode = y, s;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class P {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, s) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = s, this._$Cv = s?.isConnected ?? !0;
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
    t = E(this, t, e), O(t) ? t === c || t == null || t === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : t !== this._$AH && t !== w && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : At(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== c && O(this._$AH) ? this._$AA.nextSibling.data = t : this.T(y.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, s = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = k.createElement(ht(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === s) this._$AH.p(e);
    else {
      const r = new xt(s, this), o = r.u(this.options);
      r.p(e), this.T(o), this._$AH = r;
    }
  }
  _$AC(t) {
    let e = et.get(t.strings);
    return e === void 0 && et.set(t.strings, e = new k(t)), e;
  }
  k(t) {
    F(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, s = 0;
    for (const r of t) s === e.length ? e.push(i = new P(this.O(C()), this.O(C()), this, this.options)) : i = e[s], i._$AI(r), s++;
    s < e.length && (this._$AR(i && i._$AB.nextSibling, s), e.length = s);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = Y(t).nextSibling;
      Y(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class j {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, s, r) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = c;
  }
  _$AI(t, e = this, i, s) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = E(this, t, e, 0), o = !O(t) || t !== this._$AH && t !== w, o && (this._$AH = t);
    else {
      const h = t;
      let a, d;
      for (t = r[0], a = 0; a < r.length - 1; a++) d = E(this, h[i + a], e, a), d === w && (d = this._$AH[a]), o ||= !O(d) || d !== this._$AH[a], d === c ? t = c : t !== c && (t += (d ?? "") + r[a + 1]), this._$AH[a] = d;
    }
    o && !s && this.j(t);
  }
  j(t) {
    t === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class St extends j {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === c ? void 0 : t;
  }
}
class Ct extends j {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== c);
  }
}
class Ot extends j {
  constructor(t, e, i, s, r) {
    super(t, e, i, s, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = E(this, t, e, 0) ?? c) === w) return;
    const i = this._$AH, s = t === c && i !== c || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== c && (i === c || s);
    s && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class kt {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    E(this, t);
  }
}
const Pt = B.litHtmlPolyfillSupport;
Pt?.(k, P), (B.litHtmlVersions ??= []).push("3.3.3");
const Mt = (n, t, e) => {
  const i = e?.renderBefore ?? t;
  let s = i._$litPart$;
  if (s === void 0) {
    const r = e?.renderBefore ?? null;
    i._$litPart$ = s = new P(t.insertBefore(C(), r), r, void 0, e ?? {});
  }
  return s._$AI(n), s;
};
const G = globalThis;
class A extends v {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Mt(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return w;
  }
}
A._$litElement$ = !0, A.finalized = !0, G.litElementHydrateSupport?.({ LitElement: A });
const zt = G.litElementPolyfillSupport;
zt?.({ LitElement: A });
(G.litElementVersions ??= []).push("4.2.2");
const R = Object.freeze({
  type: "custom:ha-floorplan-card",
  grid: { width: 20, height: 15, tile_size: 16, background: "" },
  show_grid: !1,
  objects: []
}), m = (n, t) => {
  const e = Number(n);
  return Number.isFinite(e) ? e : t;
};
function U(n = {}) {
  const t = n.grid || {};
  return {
    ...n,
    type: "custom:ha-floorplan-card",
    grid: {
      ...t,
      width: Math.max(1, m(t.width, R.grid.width)),
      height: Math.max(1, m(t.height, R.grid.height)),
      tile_size: Math.max(1, m(t.tile_size, R.grid.tile_size)),
      background: t.background || ""
    },
    show_grid: !!n.show_grid,
    objects: Array.isArray(n.objects) ? n.objects.map((e, i) => Nt(e, i)) : []
  };
}
function Nt(n = {}, t = 0) {
  return {
    ...n,
    id: n.id || `object-${t + 1}`,
    type: n.type || (n.entity_id ? "entity" : "virtual"),
    x: m(n.x, 0),
    y: m(n.y, 0),
    z: m(n.z, 0),
    width: Math.max(0.25, m(n.width, 1)),
    height: Math.max(0.25, m(n.height, 1)),
    images: { ...n.images || {} }
  };
}
function ct(n, t) {
  let e = n.images?.default || "";
  if (n.entity_id) {
    const i = t?.states?.[n.entity_id]?.state;
    i && n.images?.[i] && (e = n.images[i]);
  }
  for (const i of n.conditions || [])
    t?.states?.[i?.if?.entity_id]?.state === i?.if?.state && (e = i.image || e);
  return e;
}
function it(n, t = "tap") {
  const e = n[`${t}_action`];
  return e || (t === "tap" && n.entity_id ? { action: "toggle" } : { action: "none" });
}
function Ut(n, t) {
  return {
    ...n,
    x: Math.max(0, Math.min(n.x, t.width - n.width)),
    y: Math.max(0, Math.min(n.y, t.height - n.height))
  };
}
function Tt(n, t, e, i) {
  const s = i?.action || "none", r = i?.entity || e.entity_id;
  if (s === "toggle" && r) {
    const o = r.split(".")[0];
    t.callService(o, "toggle", { entity_id: r });
    return;
  }
  if (s === "call-service" && i.service) {
    const [o, h] = i.service.split(".");
    t.callService(o, h, {
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
class jt extends A {
  static properties = {
    hass: { attribute: !1 },
    config: { state: !0 }
  };
  static styles = nt`
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
    this.config = U(t);
  }
  static getConfigElement() {
    return document.createElement("ha-floorplan-card-editor");
  }
  static getStubConfig() {
    return structuredClone(U());
  }
  getCardSize() {
    return Math.max(1, Math.ceil((this.config?.grid?.height || 5) / 3));
  }
  _runAction(t) {
    Tt(this, this.hass, t, it(t));
  }
  _objectTemplate(t) {
    const e = this.config.grid, i = ct(t, this.hass);
    if (!i) return c;
    const s = [
      `left:${t.x / e.width * 100}%`,
      `top:${t.y / e.height * 100}%`,
      `width:${t.width / e.width * 100}%`,
      `height:${t.height / e.height * 100}%`,
      `z-index:${t.z}`,
      `background-image:url(${JSON.stringify(i)})`
    ].join(";");
    return it(t).action !== "none" ? g`<button class="object" style=${s} title=${t.name || t.id}
          aria-label=${t.name || t.id} @click=${() => this._runAction(t)}></button>` : g`<div class="object" style=${s} title=${t.name || t.id}></div>`;
  }
  render() {
    if (!this.config || !this.hass) return c;
    const { grid: t } = this.config, e = [...this.config.objects].sort((r, o) => r.z - o.z), i = [
      `aspect-ratio:${t.width}/${t.height}`,
      t.background ? `background-image:url(${JSON.stringify(t.background)})` : ""
    ].join(";"), s = [
      "background-image:linear-gradient(to right,rgba(0,0,0,.28) 1px,transparent 1px),linear-gradient(to bottom,rgba(0,0,0,.28) 1px,transparent 1px)",
      `background-size:${100 / t.width}% ${100 / t.height}%`
    ].join(";");
    return g`<ha-card>
      <div class="floorplan" style=${i}>
        ${e.map((r) => this._objectTemplate(r))}
        ${this.config.show_grid ? g`<div class="grid-lines" style=${s}></div>` : c}
      </div>
    </ha-card>`;
  }
}
class Ht extends A {
  static properties = {
    hass: { attribute: !1 },
    config: { state: !0 },
    _selected: { state: !0 }
  };
  static styles = nt`
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
    this.config = U(t), this._selected >= this.config.objects.length && (this._selected = void 0);
  }
  _emit(t = this.config) {
    this.config = U(t), this.dispatchEvent(new CustomEvent("config-changed", {
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
  _removeObject(t) {
    this._emit({ ...this.config, objects: this.config.objects.filter((e, i) => i !== t) }), this._selected = void 0;
  }
  _dragStart(t, e) {
    t.preventDefault(), this._selected = e;
    const i = this.renderRoot.querySelector(".stage"), s = this.config.objects[e], r = i.getBoundingClientRect(), o = { x: t.clientX, y: t.clientY, object: s, rect: r };
    t.currentTarget.setPointerCapture(t.pointerId);
    const h = (d) => {
      const p = (d.clientX - o.x) / o.rect.width * this.config.grid.width, l = (d.clientY - o.y) / o.rect.height * this.config.grid.height, u = Ut({ ...o.object, x: Math.round(o.object.x + p), y: Math.round(o.object.y + l) }, this.config.grid);
      this._updateObject(e, { x: u.x, y: u.y });
    }, a = () => {
      window.removeEventListener("pointermove", h), window.removeEventListener("pointerup", a);
    };
    window.addEventListener("pointermove", h), window.addEventListener("pointerup", a, { once: !0 });
  }
  _stageObject(t, e) {
    const { grid: i } = this.config, s = ct(t, this.hass), r = [
      `left:${t.x / i.width * 100}%`,
      `top:${t.y / i.height * 100}%`,
      `width:${t.width / i.width * 100}%`,
      `height:${t.height / i.height * 100}%`,
      `z-index:${t.z}`,
      s ? `background-image:url(${JSON.stringify(s)})` : ""
    ].join(";");
    return g`<button class="sprite ${this._selected === e ? "selected" : ""}"
      style=${r} title=${t.id} @pointerdown=${(o) => this._dragStart(o, e)}></button>`;
  }
  _objectForm(t, e) {
    const i = t.tap_action?.action || (t.entity_id ? "toggle" : "none");
    return g`<details ?open=${this._selected === e} @toggle=${(s) => {
      s.currentTarget.open && (this._selected = e);
    }}>
      <summary>${t.id} — (${t.x}, ${t.y})</summary>
      <div class="object-fields">
        <label class="span-2">ID<input .value=${t.id} @change=${(s) => this._updateObject(e, { id: s.target.value })}></label>
        <label class="span-2">Entity ID<input .value=${t.entity_id || ""} @change=${(s) => this._updateObject(e, { entity_id: s.target.value })}></label>
        ${["x", "y", "z", "width", "height"].map((s) => g`<label>${s}<input type="number" step=${s === "width" || s === "height" ? ".25" : "1"}
          .value=${String(t[s])} @change=${(r) => this._updateObject(e, { [s]: Number(r.target.value) })}></label>`)}
        <label class="span-2">Default image<input .value=${t.images?.default || ""} @change=${(s) => this._updateImage(e, "default", s.target.value)}></label>
        <label>On image<input .value=${t.images?.on || ""} @change=${(s) => this._updateImage(e, "on", s.target.value)}></label>
        <label>Off image<input .value=${t.images?.off || ""} @change=${(s) => this._updateImage(e, "off", s.target.value)}></label>
        <label class="span-2">Tap action<select .value=${i} @change=${(s) => this._updateObject(e, { tap_action: { ...t.tap_action, action: s.target.value } })}>
          ${["none", "toggle", "more-info", "call-service", "navigate", "url"].map((s) => g`<option value=${s}>${s}</option>`)}
        </select></label>
        ${i === "call-service" ? g`<label class="span-2">Service<input placeholder="light.turn_on" .value=${t.tap_action?.service || ""} @change=${(s) => this._updateObject(e, { tap_action: { ...t.tap_action, service: s.target.value } })}></label>` : c}
        ${i === "navigate" ? g`<label class="span-2">Navigation path<input .value=${t.tap_action?.navigation_path || ""} @change=${(s) => this._updateObject(e, { tap_action: { ...t.tap_action, navigation_path: s.target.value } })}></label>` : c}
        <button class="danger span-4" type="button" @click=${() => this._removeObject(e)}>Remove object</button>
      </div>
    </details>`;
  }
  render() {
    if (!this.config) return c;
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
      <div class="toolbar"><strong>Objects (${this.config.objects.length})</strong><button type="button" @click=${this._addObject}>Add object</button></div>
      <div class="objects">${this.config.objects.map((s, r) => this._objectForm(s, r))}</div>
    </div>`;
  }
}
customElements.get("ha-floorplan-card-editor") || customElements.define("ha-floorplan-card-editor", Ht);
customElements.get("ha-floorplan-card") || customElements.define("ha-floorplan-card", jt);
window.customCards = window.customCards || [];
window.customCards.some((n) => n.type === "ha-floorplan-card") || window.customCards.push({
  type: "ha-floorplan-card",
  name: "Tile Floorplan Card",
  description: "RPG-style floor plan with clickable Home Assistant entities",
  preview: !0
});
