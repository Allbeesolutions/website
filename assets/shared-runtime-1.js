/* Exact shared runtime extracted from repeated inline page code. */
/* cobe + phenomenon bundle (inlined for local file use) */
var CobeBundle=(()=>{var d=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var V=Object.getOwnPropertyNames;var G=Object.prototype.hasOwnProperty;var L=(t,e)=>{for(var i in e)d(t,i,{get:e[i],enumerable:!0})},Y=(t,e,i,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of V(e))!G.call(t,n)&&n!==i&&d(t,n,{get:()=>e[n],enumerable:!(s=I(e,n))||s.enumerable});return t};var K=t=>Y(d({},"__esModule",{value:!0}),t);var J={};L(J,{createGlobe:()=>j});var g=["x","y","z"],c=function(t){Object.assign(this,{uniforms:{},geometry:{vertices:[{x:0,y:0,z:0}]},mode:0,modifiers:{},attributes:[],multiplier:1,buffers:[]}),Object.assign(this,t),this.prepareProgram(),this.prepareUniforms(),this.prepareAttributes()};c.prototype.compileShader=function(t,e){var i=this.gl.createShader(t);return this.gl.shaderSource(i,e),this.gl.compileShader(i),i},c.prototype.prepareProgram=function(){var t=this.gl,e=this.vertex,i=this.fragment,s=t.createProgram();t.attachShader(s,this.compileShader(35633,e)),t.attachShader(s,this.compileShader(35632,i)),t.linkProgram(s),t.useProgram(s),this.program=s},c.prototype.prepareUniforms=function(){for(var t=Object.keys(this.uniforms),e=0;e<t.length;e+=1){var i=this.gl.getUniformLocation(this.program,t[e]);this.uniforms[t[e]].location=i}},c.prototype.prepareAttributes=function(){this.geometry.vertices!==void 0&&this.attributes.push({name:"aPosition",size:3}),this.geometry.normal!==void 0&&this.attributes.push({name:"aNormal",size:3}),this.attributeKeys=[];for(var t=0;t<this.attributes.length;t+=1)this.attributeKeys.push(this.attributes[t].name),this.prepareAttribute(this.attributes[t])},c.prototype.prepareAttribute=function(t){for(var e=this.geometry,i=this.multiplier,s=e.vertices,n=e.normal,r=new Float32Array(i*s.length*t.size),a=0;a<i;a+=1)for(var o=t.data&&t.data(a,i),f=a*s.length*t.size,l=0;l<s.length;l+=1)for(var h=0;h<t.size;h+=1){var u=this.modifiers[t.name];r[f]=u!==void 0?u(o,l,h,this):t.name==="aPosition"?s[l][g[h]]:t.name==="aNormal"?n[l][g[h]]:o[h],f+=1}this.attributes[this.attributeKeys.indexOf(t.name)].data=r,this.prepareBuffer(this.attributes[this.attributeKeys.indexOf(t.name)])},c.prototype.prepareBuffer=function(t){var e=t.data,i=t.name,s=t.size,n=this.gl.createBuffer();this.gl.bindBuffer(34962,n),this.gl.bufferData(34962,e,35044);var r=this.gl.getAttribLocation(this.program,i);this.gl.enableVertexAttribArray(r),this.gl.vertexAttribPointer(r,s,5126,!1,0,0),this.buffers[this.attributeKeys.indexOf(t.name)]={buffer:n,location:r,size:s}},c.prototype.render=function(t){var e=this,i=this.uniforms,s=this.multiplier,n=this.gl;n.useProgram(this.program);for(var r=0;r<this.buffers.length;r+=1){var a=this.buffers[r],o=a.location,f=a.buffer,l=a.size;n.enableVertexAttribArray(o),n.bindBuffer(34962,f),n.vertexAttribPointer(o,l,5126,!1,0,0)}Object.keys(t).forEach(function(h){i[h].value=t[h].value}),Object.keys(i).forEach(function(h){var u=i[h];e.uniformMap[u.type](u.location,u.value)}),n.drawArrays(this.mode,0,s*this.geometry.vertices.length),this.onRender&&this.onRender(this)},c.prototype.destroy=function(){for(var t=0;t<this.buffers.length;t+=1)this.gl.deleteBuffer(this.buffers[t].buffer);this.gl.deleteProgram(this.program),this.gl=null};var p=function(t){var e=this,i=t||{},s=i.canvas;s===void 0&&(s=document.querySelector("canvas"));var n=i.context;n===void 0&&(n={});var r=i.contextType;r===void 0&&(r="experimental-webgl");var a=i.settings;a===void 0&&(a={});var o=s.getContext(r,Object.assign({alpha:!1,antialias:!1},n));Object.assign(this,{gl:o,canvas:s,uniforms:{},instances:new Map,shouldRender:!0}),Object.assign(this,{devicePixelRatio:1,clearColor:[1,1,1,1],position:{x:0,y:0,z:2},clip:[.001,100]}),Object.assign(this,a),this.uniformMap={float:function(f,l){return o.uniform1f(f,l)},vec2:function(f,l){return o.uniform2fv(f,l)},vec3:function(f,l){return o.uniform3fv(f,l)},vec4:function(f,l){return o.uniform4fv(f,l)},mat2:function(f,l){return o.uniformMatrix2fv(f,!1,l)},mat3:function(f,l){return o.uniformMatrix3fv(f,!1,l)},mat4:function(f,l){return o.uniformMatrix4fv(f,!1,l)}},o.enable(o.DEPTH_TEST),o.depthFunc(o.LEQUAL),o.getContextAttributes().alpha===!1&&(o.clearColor.apply(o,this.clearColor),o.clearDepth(1)),this.onSetup&&this.onSetup(o),window.addEventListener("resize",function(){return e.resize()}),this.resize(),this.render()};p.prototype.resize=function(){var t=this.gl,e=this.canvas,i=this.devicePixelRatio,s=this.position;e.width=e.clientWidth*i,e.height=e.clientHeight*i;var n=t.drawingBufferWidth,r=t.drawingBufferHeight,a=n/r;t.viewport(0,0,n,r);var o=Math.tan(Math.PI/180*22.5),f=[1,0,0,0,0,1,0,0,0,0,1,0,s.x,s.y,(a<1?1:a)*-s.z,1];this.uniforms.uProjectionMatrix={type:"mat4",value:[.5/o,0,0,0,0,a/o*.5,0,0,0,0,-(this.clip[1]+this.clip[0])/(this.clip[1]-this.clip[0]),-1,0,0,-2*this.clip[1]*(this.clip[0]/(this.clip[1]-this.clip[0])),0]},this.uniforms.uViewMatrix={type:"mat4",value:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]},this.uniforms.uModelMatrix={type:"mat4",value:f}},p.prototype.toggle=function(t){t!==this.shouldRender&&(this.shouldRender=t!==void 0?t:!this.shouldRender,this.shouldRender&&this.render())},p.prototype.render=function(){var t=this;this.gl.clear(16640),this.instances.forEach(function(e){e.render(t.uniforms)}),this.onRender&&this.onRender(this),this.shouldRender&&requestAnimationFrame(function(){return t.render()})},p.prototype.add=function(t,e){e===void 0&&(e={uniforms:{}}),e.uniforms===void 0&&(e.uniforms={}),Object.assign(e.uniforms,JSON.parse(JSON.stringify(this.uniforms))),Object.assign(e,{gl:this.gl,uniformMap:this.uniformMap});var i=new c(e);return this.instances.set(t,i),i},p.prototype.remove=function(t){var e=this.instances.get(t);e!==void 0&&(e.destroy(),this.instances.delete(t))},p.prototype.destroy=function(){var t=this;this.instances.forEach(function(e,i){e.destroy(),t.instances.delete(i)}),this.toggle(!1)};var A=p;var M="phi",C="theta",E="mapSamples",R="mapBrightness",B="baseColor",P="markerColor",S="glowColor",m="markers",D="diffuse",b="devicePixelRatio",F="dark",Q="offset",T="scale",U="opacity",k="mapBaseBrightness",y={[M]:"A",[C]:"B",[E]:"l",[R]:"E",[B]:"R",[P]:"S",[S]:"y",[D]:"F",[F]:"G",[Q]:"x",[T]:"C",[U]:"H",[k]:"I"},{PI:v,sin:x,cos:w}=Math,z=t=>[].concat(...t.map(e=>{let[i,s]=e.location;i=i*v/180,s=s*v/180-v;let n=w(i);return[-n*w(s),x(i),n*x(s),e.size]}),[0,0,0,0]),j=(t,e)=>{let i=(r,a,o)=>({type:r,value:typeof e[a]>"u"?o:e[a]}),s=t.getContext("webgl")?"webgl":"experimental-webgl",n=new A({canvas:t,contextType:s,context:{alpha:!0,stencil:!1,antialias:!0,depth:!1,preserveDrawingBuffer:!1,...e.context},settings:{[b]:e[b]||1,onSetup:r=>{let a=r.RGB,o=r.UNSIGNED_BYTE,f=r.TEXTURE_2D,l=r.createTexture();r.bindTexture(f,l),r.texImage2D(f,0,a,1,1,0,a,o,new Uint8Array([0,0,0,0]));let h=new Image;h.onload=()=>{r.bindTexture(f,l),r.texImage2D(f,0,a,a,o,h),r.generateMipmap(f);let u=r.getParameter(r.CURRENT_PROGRAM),O=r.getUniformLocation(u,"J");r.texParameteri(f,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(f,r.TEXTURE_MAG_FILTER,r.NEAREST),r.uniform1i(O,0)},h.src="assets/images/inline/ae99f2f6769c4bdc.png"}}});return n.add("",{vertex:"attribute vec3 aPosition;uniform mat4 uProjectionMatrix;uniform mat4 uModelMatrix;uniform mat4 uViewMatrix;void main(){gl_Position=uProjectionMatrix*uModelMatrix*uViewMatrix*vec4(aPosition,1.);}",fragment:"precision highp float;uniform vec2 t,x;uniform vec3 R,S,y;uniform vec4 z[64];uniform float A,B,l,C,D,E,F,G,H,I;uniform sampler2D J;float K=1./l;mat3 L(float a,float b){float c=cos(a),d=cos(b),e=sin(a),f=sin(b);return mat3(d,f*e,-f*c,0.,c,e,f,d*-e,d*c);}vec3 w(vec3 c,out float v){c=c.xzy;float p=max(2.,floor(log2(2.236068*l*3.141593*(1.-c.z*c.z))*.72021));vec2 g=floor(pow(1.618034,p)/2.236068*vec2(1.,1.618034)+.5),d=fract((g+1.)*.618034)*6.283185-3.883222,e=-2.*g,f=vec2(atan(c.y,c.x),c.z-1.),q=floor(vec2(e.y*f.x-d.y*(f.y*l+1.),-e.x*f.x+d.x*(f.y*l+1.))/(d.x*e.y-e.x*d.y));float n=3.141593;vec3 r;for(float h=0.;h<4.;h+=1.){vec2 s=vec2(mod(h,2.),floor(h*.5));float j=dot(g,q+s);if(j>l)continue;float a=j,b=0.;if(a>=524288.)a-=524288.,b+=.803894;if(a>=262144.)a-=262144.,b+=.901947;if(a>=131072.)a-=131072.,b+=.950973;if(a>=65536.)a-=65536.,b+=.475487;if(a>=32768.)a-=32768.,b+=.737743;if(a>=16384.)a-=16384.,b+=.868872;if(a>=8192.)a-=8192.,b+=.934436;if(a>=4096.)a-=4096.,b+=.467218;if(a>=2048.)a-=2048.,b+=.733609;if(a>=1024.)a-=1024.,b+=.866804;if(a>=512.)a-=512.,b+=.433402;if(a>=256.)a-=256.,b+=.216701;if(a>=128.)a-=128.,b+=.108351;if(a>=64.)a-=64.,b+=.554175;if(a>=32.)a-=32.,b+=.777088;if(a>=16.)a-=16.,b+=.888544;if(a>=8.)a-=8.,b+=.944272;if(a>=4.)a-=4.,b+=.472136;if(a>=2.)a-=2.,b+=.236068;if(a>=1.)a-=1.,b+=.618034;float k=fract(b)*6.283185,i=1.-2.*j*K,m=sqrt(1.-i*i);vec3 o=vec3(cos(k)*m,sin(k)*m,i);float u=length(c-o);if(u<n)n=u,r=o;}v=n;return r.xzy;}void main(){vec2 b=(gl_FragCoord.xy/t*2.-1.)/C-x*vec2(1.,-1.)/t;b.x*=t.x/t.y;float c=dot(b,b);vec4 M=vec4(0.);float m=0.;if(c<=.64){for(int d=0;d<2;d++){vec4 e=vec4(0.);float a;vec3 u=vec3(0.,0.,1.),f=normalize(vec3(b,sqrt(.64-c)));f.z*=d>0?-1.:1.,u.z*=d>0?-1.:1.;vec3 g=f*L(B,A),h=w(g,a);float n=asin(h.y),i=acos(-h.x/cos(n));i=h.z<0.?-i:i;float N=max(texture2D(J,vec2(i*.5/3.141593,-(n/3.141593+.5))).x,I),O=smoothstep(8e-3,0.,a),j=dot(f,u),v=pow(j,F)*E,o=N*O*v,T=mix((1.-o)*pow(j,.4),o,G)+.1;e+=vec4(R*T,1.);int U=int(D);float p=0.;for(int k=0;k<64;k++){if(k>=U)break;vec4 q=z[k];vec3 r=q.xyz,P=r-g;float s=q.w;if(dot(P,P)>s*s*4.)continue;vec3 V=w(r,a);a=length(V-g),a<s?p+=smoothstep(s*.5,0.,a):0.;}p=min(1.,p*v),e.xyz=mix(e.xyz,S,p),e.xyz+=pow(1.-j,4.)*y,M+=e*(1.+(d>0?-H:H))/2.;}m=pow(dot(normalize(vec3(-b,sqrt(1.-c))),vec3(0.,0.,1.)),4.)*smoothstep(0.,1.,.2/(c-.64));}else{float Q=sqrt(.2/(c-.64));m=smoothstep(.5,1.,Q/(Q+1.));}gl_FragColor=M+vec4(m*y,m);}",uniforms:{t:{type:"vec2",value:[e.width,e.height]},A:i("float",M),B:i("float",C),l:i("float",E),E:i("float",R),I:i("float",k),R:i("vec3",B),S:i("vec3",P),F:i("float",D),y:i("vec3",S),G:i("float",F),z:{type:"vec4",value:z(e[m])},D:{type:"float",value:e[m].length},x:i("vec2",Q,[0,0]),C:i("float",T,1),H:i("float",U,1)},mode:4,geometry:{vertices:[{x:-100,y:100,z:0},{x:-100,y:-100,z:0},{x:100,y:100,z:0},{x:100,y:-100,z:0},{x:-100,y:-100,z:0},{x:100,y:100,z:0}]},onRender:({uniforms:r})=>{let a={};if(e.onRender){a=e.onRender(a)||a;for(let o in y)a[o]!==void 0&&(r[y[o]].value=a[o]);a[m]!==void 0&&(r.z.value=z(a[m]),r.D.value=a[m].length),a.width&&a.height&&(r.t.value=[a.width,a.height])}}}),n};return K(J);})();

if(typeof window!=='undefined' && typeof CobeBundle!=='undefined' && !window.createGlobe){window.createGlobe=CobeBundle.createGlobe;}

/* =====================================================================
   AllBee Solutions — Shared JS (production)
   Single config block. Real forms. No fake success. Accessibility-safe.
===================================================================== */

/* ─────────────────────────────────────────────────────────────────────
   CONFIG — change ONLY these values before going live
───────────────────────────────────────────────────────────────────── */
window.ALLBEE_CONFIG = window.ALLBEE_CONFIG || {
  // Forms use WhatsApp handoff, so no backend form ID is required
  formspreeId: '',

  // Analytics IDs (leave empty string '' to skip injection of that script)
  ga4Id: 'G-TEX4FWGJFQ',  // Add GA4 Measurement ID, e.g. 'G-XXXXXXXXXX'
  metaPixelId: '',  // Add Meta Pixel ID, numeric string
  clarityId: '',    // Add Microsoft Clarity project ID

  // Contact channels
  phonePrimary: '+918903607506',
  phoneWhatsApp: '918903607506',
  whatsappLink: 'https://wa.me/918903607506',
  email: 'contact@allbeesolutions.com',

  // Where form submissions redirect
  thankYouUrl: 'thank-you.html'
};

(function(){
  'use strict';
  const CFG = window.ALLBEE_CONFIG;
  const hasTrackingId = (v) => typeof v === 'string' && v.trim().length > 0;

  /* ─────────────────────────────────────────────────────────────────
     ANALYTICS — only inject if real IDs are present
  ───────────────────────────────────────────────────────────────── */
  function loadAnalytics(){
    // Google Analytics 4
    if (hasTrackingId(CFG.ga4Id)) {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CFG.ga4Id;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){ window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', CFG.ga4Id, { anonymize_ip: true });
    }
    // Meta Pixel
    if (hasTrackingId(CFG.metaPixelId)) {
      !function(f,b,e,v,n,t,s){
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
        t=b.createElement(e);t.async=!0;t.src=v;
        s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', CFG.metaPixelId);
      window.fbq('track', 'PageView');
    }
    // Microsoft Clarity
    if (hasTrackingId(CFG.clarityId)) {
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)
      })(window, document, 'clarity', 'script', CFG.clarityId);
    }
  }
  loadAnalytics();

  function trackEvent(name, params){
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    if (typeof window.fbq === 'function') window.fbq('trackCustom', name, params || {});
  }

  /* ─────────────────────────────────────────────────────────────────
     NAV — scroll style, active link, mobile toggle
  ───────────────────────────────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    // Esc closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     SCROLL PROGRESS BAR
  ───────────────────────────────────────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    const updateProgress = () => {
      const s = document.documentElement.scrollTop || document.body.scrollTop;
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (h > 0) progressBar.style.width = (s / h * 100) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ─────────────────────────────────────────────────────────────────
     MODAL (Free Counseling) — accessible, focus-trapped
  ───────────────────────────────────────────────────────────────── */
  const modalOverlay = document.getElementById('enrollModal');
  let lastFocusedBeforeModal = null;

  window.openModal = function(){
    if (!modalOverlay) return;
    lastFocusedBeforeModal = document.activeElement;
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstField = modalOverlay.querySelector('input, select, textarea, button');
    if (firstField) firstField.focus();
    trackEvent('open_counseling_modal');
  };

  window.closeModal = function(){
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
      lastFocusedBeforeModal.focus();
    }
  };

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) window.closeModal();
    });
    // Focus trap
    modalOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { window.closeModal(); return; }
      if (e.key !== 'Tab') return;
      const focusable = modalOverlay.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  window.AllBeeForms.init({CFG,trackEvent});

  /* ─────────────────────────────────────────────────────────────────
     AOS-LITE — IntersectionObserver-based fade-in
  ───────────────────────────────────────────────────────────────── */
  function observeAOS(){
    const els = document.querySelectorAll('[data-aos]:not(.aos-in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('aos-in'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = Math.min(parseFloat(entry.target.dataset.aosDelay || '0') * 1000, 220);
          setTimeout(() => entry.target.classList.add('aos-in'), delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  }

  /* ─────────────────────────────────────────────────────────────────
     COUNTER ANIMATION (counts up when in view)
  ───────────────────────────────────────────────────────────────── */
  function animateCounter(el){
    const raw = el.dataset.count;
    const target = parseInt(raw, 10);
    if (isNaN(target)) return;
    const original = el.textContent;
    const suffix = original.replace(/[0-9,]/g, '');
    const duration = 1400;
    const start = performance.now();
    function step(now){
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.floor(target * eased);
      el.textContent = value + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = target + suffix;
      return;
    }
    requestAnimationFrame(step);
  }
  function observeCounters(){
    const els = document.querySelectorAll('[data-count]');
    if (!('IntersectionObserver' in window)) {
      els.forEach(animateCounter);
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(el => obs.observe(el));
  }

  /* ─────────────────────────────────────────────────────────────────
     CUSTOM CURSOR — desktop, motion-allowed only (CSS already gates display)
  ───────────────────────────────────────────────────────────────── */
  function initCursor(){
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (reducedMotion || coarsePointer) return;

    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursorRing');
    if (!cursor || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0, raf = null;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    });
    function animRing(){
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      raf = requestAnimationFrame(animRing);
    }
    animRing();
    document.querySelectorAll('button, a, [role="button"], .why-card, .srv-card, .crs-card, .tm-card, .pricing-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '18px'; cursor.style.height = '18px';
        ring.style.width = '56px'; ring.style.height = '56px';
        ring.style.borderColor = 'rgba(220,165,12,0.7)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '10px'; cursor.style.height = '10px';
        ring.style.width = '36px'; ring.style.height = '36px';
        ring.style.borderColor = 'rgba(15,123,110,0.45)';
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     HERO PARTICLES (decorative, motion-allowed only)
  ───────────────────────────────────────────────────────────────── */
  function initHeroParticles(){
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const c = document.getElementById('heroParticles');
    if (!c) return;
    c.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;';
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      const sz = (2 + Math.random() * 3) + 'px';
      p.style.cssText = 'position:absolute;border-radius:50%;background:#0F7B6E;' +
        'left:' + (Math.random() * 100) + '%;width:' + sz + ';height:' + sz + ';' +
        'opacity:' + (0.3 + Math.random() * 0.35) + ';' +
        'animation:particleFloat ' + (8 + Math.random() * 10) + 's linear infinite;' +
        'animation-delay:' + (Math.random() * 8) + 's;';
      c.appendChild(p);
    }
    // Inject keyframes once
    if (!document.getElementById('particle-kf')) {
      const style = document.createElement('style');
      style.id = 'particle-kf';
      style.textContent = '@keyframes particleFloat{0%{transform:translateY(100vh) scale(0);opacity:0}5%{opacity:0.55}95%{opacity:0.2}100%{transform:translateY(-50px) scale(1);opacity:0}}';
      document.head.appendChild(style);
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     CHATBOT — rule-based KB, accessible
  ───────────────────────────────────────────────────────────────── */
  const KB = [
    { keys:['invitation','invitations','invite','digital invitation','e-invite','e invitation','allbee invitations','wedding card','nikah card'],
      reply:'💌 <strong>AllBee Invitations</strong> — premium digital invitations with 48 designs!<br><br>📄 <strong>PDF Invitation</strong> — from ₹299<br>🌐 <strong>Website Invitation</strong> — from ₹999<br>🎁 <strong>PDF + Website Combo</strong> — from ₹1,299<br><br>Browse designs: <strong>/invitation-samples</strong><br>Order now: <strong>/invitation</strong>' },
    { keys:['pdf invitation','website invitation','combo','pdf + website','which invitation','invitation type','types of invitation','invitation product'],
      reply:'We offer <strong>3 invitation products</strong>:<br><br>📄 <strong>PDF Invitation</strong> (from ₹299) — downloadable card, print &amp; WhatsApp ready<br>🌐 <strong>Website Invitation</strong> (from ₹999) — live invite site with RSVP, countdown &amp; maps<br>🎁 <strong>Combo</strong> (from ₹1,299) — card + website together (best value)<br><br>See all designs: <strong>/invitation-samples</strong>' },
    { keys:['package','packages','basic package','premium package','elite package','invitation price','invitation cost','invitation fee','invitation pricing'],
      reply:'Every invitation comes in <strong>3 packages</strong>:<br><br>⭐ <strong>Basic</strong> · 💎 <strong>Premium</strong> · 👑 <strong>Elite</strong><br><br>Pricing starts at ₹299 (PDF), ₹999 (Website) or ₹1,299 (Combo). Final package price is shown at checkout.<br><br>Order: <strong>/invitation</strong>' },
    { keys:['rsvp','whatsapp sharing','unlimited guests','mobile friendly','custom design','invitation feature','invitation features','countdown'],
      reply:'✨ <strong>Invitation features:</strong><br><br>✅ RSVP collection<br>✅ WhatsApp sharing<br>✅ Mobile friendly<br>✅ Unlimited guests<br>✅ Order tracking<br>✅ Custom design<br><br>Browse designs: <strong>/invitation-samples</strong>' },
    { keys:['how to order','order process','how does it work','how do i order','invitation steps','ordering','order invitation','place order','how to get invitation','draft','approve'],
      reply:'📝 <strong>How it works — 6 easy steps:</strong><br><br>1️⃣ Choose a template<br>2️⃣ Place your order<br>3️⃣ Submit your details<br>4️⃣ Receive your draft<br>5️⃣ Approve it<br>6️⃣ Get delivery 🎉<br><br>Start now: <strong>/invitation</strong>' },
    { keys:['track','track order','order status','where is my order','tracking','my order'],
      reply:'🔎 <strong>Track your invitation order</strong> anytime:<br><br>Visit <strong>/track-order</strong> and enter your mobile number to see live status &amp; updates.' },
    { keys:['course','courses','what course','offer','training','learn','class','program','all course'],
      reply:'We offer <strong>6 courses</strong> at AllBee Solutions:<br><br>' +
            '🐍 <strong>Python Programming</strong> — 40 Days — ₹2,999<br>' +
            '💻 <strong>MS-Office Advanced</strong> — 40 Days — ₹2,499<br>' +
            '🎨 <strong>Photoshop Advanced</strong> — 40 Days — ₹2,999<br>' +
            '💬 <strong>Spoken English</strong> — 45 Days — ₹2,999<br>' +
            '🖥️ <strong>Basic Computers</strong> — 30 Days — ₹1,799<br>' +
            '🔧 <strong>Hardware & Networking</strong> — 60 Days — ₹5,999<br<br><br>' +
            'WhatsApp to enroll: <strong>+91 89036 07506</strong> 🎓' },
    { keys:['fee','fees','cost','price','pricing','charge','how much','pay','emi','amount','rate'],
      reply:'💰 <strong>Course Fees:</strong><br><br>' +
            '🐍 Python — <strong>₹2,999</strong><br>' +
            '💻 MS-Office — <strong>₹2,499</strong><br>' +
            '🎨 Photoshop — <strong>₹2,999</strong><br>' +
            '💬 Spoken English — <strong>₹2,999</strong><br>' +
            '🖥️ Basic Computers — <strong>₹1,799</strong><br>' +
            '🔧 Hardware & Networking — <strong>₹5,999</strong><br><br>' +
            'EMI options available.' },
    { keys:['enroll','join','register','admission','signup','apply','start','begin'],
      reply:'📝 Enrolling is easy!<br><br>💬 WhatsApp: <strong>+91 89036 07506</strong><br>Or use the <strong>Enquire Now</strong> button.<br><br>Our team will guide you to choose the right course! 🚀' },
    { keys:['location','address','where','campus','office','nagore','visit'],
      reply:'📍 <strong>Our Campus:</strong><br><br>No.80, Noori Complex,<br>Nagore – 611 002, Tamil Nadu<br><br>Visit us <strong>Mon–Sat, 9 AM – 7 PM</strong>.' },
    { keys:['phone','contact','call','number','reach','whatsapp','mobile','email'],
      reply:'📞 <strong>+91 89036 07506</strong> (Call &amp; WhatsApp)<br>✉️ contact@allbeesolutions.com<br><br>Available Mon–Sat, 9 AM – 7 PM.' },
    { keys:['timing','time','hours','open','close','working','schedule'],
      reply:'⏰ <strong>Working Hours:</strong><br><br>Monday to Saturday<br>9:00 AM – 7:00 PM<br><br>Closed on Sundays. WhatsApp us anytime!' },
    { keys:['python'],
      reply:'🐍 <strong>Python Programming</strong><br>Duration: <strong>40 Days</strong> · Fee: <strong>₹2,999</strong><br><br>Build real programs — variables, loops, functions, file handling and mini projects. Beginner-friendly.' },
    { keys:['ms office','msoffice','excel','word','powerpoint','office'],
      reply:'💻 <strong>MS-Office Advanced</strong><br>Duration: <strong>40 Days</strong> · Fee: <strong>₹2,499</strong><br><br>Word, Excel, PowerPoint at an advanced level. Essential for office jobs, data entry, and admin roles.' },
    { keys:['photoshop','graphic','photo','editing','adobe'],
      reply:'🎨 <strong>Photoshop Advanced</strong><br>Duration: <strong>40 Days</strong> · Fee: <strong>₹2,999</strong><br><br>Photo editing, compositing, layout design, social-media creatives and print-ready work.' },
    { keys:['spoken english','english','communication','speak'],
      reply:'💬 <strong>Spoken English</strong><br>Duration: <strong>45 Days</strong> · Fee: <strong>₹2,999</strong><br><br>Grammar, conversation, pronunciation and professional communication.' },
    { keys:['basic computer','basic','beginner','computer basic','typing','first time'],
      reply:'🖥️ <strong>Basic Computers</strong><br>Duration: <strong>30 Days</strong> · Fee: <strong>₹1,799</strong><br><br>Zero to confident — typing, internet, email, file management, basic software.' },
    { keys:['hardware','networking','network','ccna','lan','router'],
      reply:'🔧 <strong>Hardware & Networking</strong><br>Duration: <strong>60 Days</strong> · Fee: <strong>₹5,999</strong><br><br>PC assembly, troubleshooting, LAN/WAN, routers and switches. Great for IT support careers.' },
    { keys:['service','services','web development','website','seo','digital marketing','social media','logo','branding'],
      reply:'🌐 <strong>Our Services:</strong><br><br>🌐 Website Design (from ₹9,999)<br>📈 SEO and campaign planning<br>📱 Social Media Management (from ₹999/mo)<br>🎨 Graphic Design & Branding<br>🎬 Reels production and promotion<br>🖥️ IT Support<br><br>Contact: 📞 +91 89036 07506' },
    { keys:['certificate','certified'],
      reply:'✅ Yes — every course includes an <strong>industry-recognised completion certificate</strong>. Great for your resume! 🏆' },
    { keys:['placement','job','career','hire','interview'],
      reply:'💼 <strong>Placement support included:</strong><br><br>✅ Resume preparation<br>✅ Mock interviews<br>✅ Job referrals<br>✅ Career guidance' },
    { keys:['online','offline','mode','remote'],
      reply:'🌍 We offer <strong>both modes</strong>!<br><br>🏫 Offline — Nagore campus<br>💻 Online — From anywhere in India' },
    { keys:['about','who','allbee','company','founded'],
      reply:'🐝 <strong>About AllBee Solutions</strong><br><br>Founded 2025 in Nagore, Tamil Nadu. IT Training Institute and Digital Marketing Agency.<br><br>✅ Practical training and project work<br>✅ Websites and growth services<br>✅ Ask us for current learner and client references' },
    { keys:['hi','hello','hai','hey','vanakkam','helo','good morning','good afternoon','good evening'],
      reply:'👋 Hello! Welcome to <strong>AllBee Solutions</strong>!<br><br>I can help with courses, fees, enrollment and services. What would you like to know?' },
    { keys:['thank','thanks','ok','okay','got it','great','nice','super','perfect'],
      reply:'You\'re welcome! 😊 Feel free to ask anything else. WhatsApp us anytime: <strong>+91 89036 07506</strong>' }
  ];
  function getBotReply(msg){
    const lower = msg.toLowerCase().trim();
    for (let i = 0; i < KB.length; i++) {
      const item = KB[i];
      for (let j = 0; j < item.keys.length; j++) {
        if (lower.indexOf(item.keys[j]) !== -1) return item.reply;
      }
    }
    return 'I\'m not sure about that, but our team can help.<br><br>📞 <strong>' + CFG.phonePrimary + '</strong><br>💬 WhatsApp: <strong>+' + CFG.phoneWhatsApp + '</strong><br>✉️ ' + CFG.email;
  }

  let chatOpen = false;
  window.toggleChat = function(){
    chatOpen = !chatOpen;
    const win = document.getElementById('chatWindow');
    const btn = document.getElementById('chatBtn');
    if (!win) return;
    win.classList.toggle('open', chatOpen);
    win.setAttribute('aria-hidden', String(!chatOpen));
    if (btn) btn.setAttribute('aria-expanded', String(chatOpen));
    if (chatOpen) {
      const input = document.getElementById('chatInput');
      if (input) setTimeout(() => input.focus(), 100);
      const dot = document.querySelector('#chatBtn .chat-notif');
      if (dot) dot.style.display = 'none';
      trackEvent('open_chat');
    }
  };
  window.sendQuick = function(msg){
    const input = document.getElementById('chatInput');
    if (input) input.value = msg;
    const q = document.getElementById('chatQuick');
    if (q) q.style.display = 'none';
    window.sendChat();
  };
  window.sendChat = function(){
    const input = document.getElementById('chatInput');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    addBubble(msg, 'user');
    const typing = document.getElementById('chatTyping');
    if (typing) typing.classList.add('show');
    scrollChatToBottom();
    setTimeout(() => {
      if (typing) typing.classList.remove('show');
      addBubble(getBotReply(msg), 'bot');
    }, 650);
  };
  function addBubble(text, type){
    const msgs = document.getElementById('chatMsgs');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'chat-bubble ' + type;
    if (type === 'user') div.textContent = text;
    else div.innerHTML = text;
    msgs.appendChild(div);
    scrollChatToBottom();
  }
  function scrollChatToBottom(){
    const msgs = document.getElementById('chatMsgs');
    if (!msgs) return;
    setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 50);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatOpen) window.toggleChat();
  });

  /* ─────────────────────────────────────────────────────────────────
     CONVERSION TRACKING — phone, WhatsApp clicks
  ───────────────────────────────────────────────────────────────── */
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('tel:')) trackEvent('click_phone', { phone: href });
    else if (href.indexOf('wa.me') !== -1) trackEvent('click_whatsapp', { url: href });
    else if (href.startsWith('mailto:')) trackEvent('click_email');
  });

  /* ─────────────────────────────────────────────────────────────────
     INIT — fire on DOM ready
  ───────────────────────────────────────────────────────────────── */
  function init(){
    observeAOS();
    observeCounters();
    initCursor();
    initHeroParticles();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


/* ─────────────────────────────────────────────────────────────────
   STARFALL AURORA (Three.js fragment shader, brand-recolored)
───────────────────────────────────────────────────────────────── */
(function(){
  function init(){
    var canvas = document.getElementById('sfCanvas');
    if (!canvas) return;
    if (typeof THREE === 'undefined') {
      // Three.js still loading — retry shortly
      return setTimeout(init, 100);
    }
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }
    var hero = canvas.parentElement;

    function size(){
      var r = hero.getBoundingClientRect();
      return { w: Math.max(1, Math.floor(r.width)), h: Math.max(1, Math.floor(r.height)) };
    }
    var s = size();

    var scene = new THREE.Scene();
    var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(s.w, s.h, false);

    var fragmentShader = [
      'uniform float iTime; uniform vec2 iResolution;',
      '#define NUM_OCTAVES 3',
      'float rand(vec2 n){ return fract(sin(dot(n, vec2(12.9898,4.1414)))*43758.5453); }',
      'float noise(vec2 p){ vec2 ip=floor(p); vec2 u=fract(p); u=u*u*(3.0-2.0*u);',
      '  float res=mix(mix(rand(ip),rand(ip+vec2(1.,0.)),u.x),',
      '                mix(rand(ip+vec2(0.,1.)),rand(ip+vec2(1.,1.)),u.x),u.y);',
      '  return res*res;',
      '}',
      'float fbm(vec2 x){ float v=0.0; float a=0.3; vec2 shift=vec2(100.);',
      '  mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));',
      '  for(int i=0;i<NUM_OCTAVES;++i){ v+=a*noise(x); x=rot*x*2.0+shift; a*=0.4; }',
      '  return v;',
      '}',
      'void main(){',
      '  vec2 p=((gl_FragCoord.xy)-iResolution.xy*0.5)/iResolution.y*mat2(6.,-4.,4.,6.);',
      '  vec4 o=vec4(0.);',
      '  float f=2.+fbm(p+vec2(iTime*5.,0.))*.5;',
      '  for(float i=0.;i++<35.;){',
      '    vec2 v=p+cos(i*i+(iTime+p.x*.08)*.025+i*vec2(13.,11.))*3.5;',
      '    float tailNoise=fbm(v+vec2(iTime*.5,i))*.3*(1.-(i/35.));',
      // — RECOLORED: teal base, rare gold streaks —
      '    float goldMix = smoothstep(0.72, 0.96, 0.5 + 0.5*sin(i*0.31 + iTime*0.45));',
      '    vec3 tealCol = vec3(0.06 + 0.18*sin(i*.2+iTime*.4),',
      '                        0.42 + 0.30*cos(i*.3+iTime*.5),',
      '                        0.38 + 0.22*sin(i*.4+iTime*.3));',
      '    vec3 goldCol = vec3(0.92, 0.66, 0.08);',
      '    vec4 auroraColors = vec4(mix(tealCol, goldCol, goldMix), 1.);',
      '    vec4 currentContribution = auroraColors * exp(sin(i*i+iTime*.8)) / length(max(v, vec2(v.x*f*.015, v.y*1.5)));',
      '    float thinnessFactor = smoothstep(0.,1.,i/35.)*.6;',
      '    o += currentContribution*(1.+tailNoise*.8)*thinnessFactor;',
      '  }',
      '  o = tanh(pow(o/100., vec4(1.6)));',
      '  gl_FragColor = o * 1.5;',
      '}'
    ].join('\n');

    var material = new THREE.ShaderMaterial({
      uniforms: { iTime:{value:0}, iResolution:{value: new THREE.Vector2(s.w, s.h)} },
      vertexShader: 'void main(){ gl_Position = vec4(position, 1.0); }',
      fragmentShader: fragmentShader,
    });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    var raf = null, t0 = performance.now();
    function loop(){
      raf = requestAnimationFrame(loop);
      material.uniforms.iTime.value = (performance.now() - t0) / 1000;
      renderer.render(scene, camera);
    }
    loop();

    function onResize(){
      var ns = size();
      renderer.setSize(ns.w, ns.h, false);
      material.uniforms.iResolution.value.set(ns.w, ns.h);
    }
    window.addEventListener('resize', onResize, { passive: true });

    // Pause when offscreen to save battery
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting) {
            if (!raf) loop();
          } else if (raf) {
            cancelAnimationFrame(raf); raf = null;
          }
        });
      }, { threshold: 0 }).observe(hero);
    }
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();


/* ─────────────────────────────────────────────────────────────────
   ANIMATED CARDS STACK — scroll-driven transforms (vanilla port of
   framer-motion useScroll mapping). Offset: ["start center","end end"]
───────────────────────────────────────────────────────────────── */
(function(){
  function initStack(){
    var container = document.getElementById('acsScroll');
    var stage = document.getElementById('acsStage');
    if (!container || !stage) return;
    var cards = stage.querySelectorAll('.acs-card');
    var N = cards.length;
    if (!N) return;

    // Pre-read initial rotations
    var init = [];
    cards.forEach(function(c, i){
      init.push({
        el: c,
        rot0: parseFloat(c.dataset.rot || (-i + 90)),
        idx: parseInt(c.dataset.idx || i, 10)
      });
    });

    function update(){
      var rect = container.getBoundingClientRect();
      var vh = window.innerHeight;
      // framer: scrollYProgress 0 when container's start hits viewport center,
      // 1 when container's end hits viewport bottom
      var startY = rect.top - vh * 0.5;     // 0 progress point (negative once scrolled)
      var endY = rect.bottom - vh;          // 1 progress point
      var total = endY - startY;
      var p = 0;
      if (total > 0) p = (0 - startY) / total;
      p = Math.max(0, Math.min(1, p));

      init.forEach(function(o, i){
        var start = i / (N + 1);
        var end = (i + 1) / (N + 1);
        var rotStart = start - 1.5;
        var rotEnd = end / 1.5;

        // Y: progress in [start, end] maps to [0%, -180%]
        var y = 0;
        if (p <= start) y = 0;
        else if (p >= end) y = -180;
        else y = ((p - start) / (end - start)) * -180;

        // Rotation: progress in [rotStart, rotEnd] maps to [rot0, 0]
        var rot;
        if (p <= rotStart) rot = o.rot0;
        else if (p >= rotEnd) rot = 0;
        else rot = o.rot0 + (0 - o.rot0) * ((p - rotStart) / (rotEnd - rotStart));

        var z = i * 10;
        o.el.style.zIndex = String((N - i) * 10);
        o.el.style.top = (i * 8) + 'px';
        o.el.style.transform =
          'translateZ(' + z + 'px) translateY(' + y.toFixed(2) + '%) rotate(' + rot.toFixed(2) + 'deg)';
      });
    }

    var ticking = false;
    function onScroll(){
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function(){ update(); ticking = false; });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initStack);
  else initStack();
})();

/* ─────────────────────────────────────────────────────────────────
   CTA GOLD PARTICLES — generate floating glowing dots
───────────────────────────────────────────────────────────────── */
(function(){
  function spawnCtaParticles(){
    var c = document.getElementById('ctaParticles');
    if (!c) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var COUNT = 28;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < COUNT; i++){
      var p = document.createElement('div');
      p.className = 'cta-particle';
      var size = (2 + Math.random() * 4).toFixed(1);
      var dur = (7 + Math.random() * 9).toFixed(1);
      var delay = (Math.random() * 12).toFixed(1);
      var dx = ((Math.random() - 0.5) * 120).toFixed(0);
      p.style.left = (Math.random() * 100) + '%';
      p.style.setProperty('--s', size + 'px');
      p.style.setProperty('--d', dur + 's');
      p.style.setProperty('--de', '-' + delay + 's');
      p.style.setProperty('--dx', dx + 'px');
      frag.appendChild(p);
    }
    c.appendChild(frag);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', spawnCtaParticles);
  else spawnCtaParticles();
})();

/* ─────────────────────────────────────────────────────────────────
   FOOTER SOCIAL — gold sparks burst upward on hover
───────────────────────────────────────────────────────────────── */
(function(){
  function attachSparks(){
    var icons = document.querySelectorAll('.footer-social a');
    if (!icons.length) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    icons.forEach(function(icon){
      var burstActive = false;
      function burst(){
        if (burstActive) return;
        burstActive = true;
        var count = 7;
        for (var i = 0; i < count; i++){
          (function(j){
            setTimeout(function(){
              var s = document.createElement('span');
              s.className = 'spark';
              var dx = ((Math.random() - 0.5) * 36).toFixed(0);
              var dy = (-(40 + Math.random() * 40)).toFixed(0);
              s.style.setProperty('--dx', dx + 'px');
              s.style.setProperty('--dy', dy + 'px');
              icon.appendChild(s);
              setTimeout(function(){ if (s.parentNode) s.parentNode.removeChild(s); }, 1000);
            }, j * 50);
          })(i);
        }
        setTimeout(function(){ burstActive = false; }, 350);
      }
      icon.addEventListener('mouseenter', burst);
      icon.addEventListener('focus', burst);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachSparks);
  else attachSparks();
})();


/* ─────────────────────────────────────────────────────────────────
   STACK FIX v3.1: ensure first (top) card animates first.
   Re-runs after initial init and OVERRIDES the prior listener.
───────────────────────────────────────────────────────────────── */
(function(){
  function init(){
    var container = document.getElementById('acsScroll');
    var stage = document.getElementById('acsStage');
    if (!container || !stage) return;
    var cards = Array.prototype.slice.call(stage.querySelectorAll('.acs-card'));
    var N = cards.length;
    if (!N) return;

    // Pre-read initial rotations
    var data = cards.map(function(c, i){
      return {
        el: c,
        rot0: parseFloat(c.dataset.rot != null ? c.dataset.rot : (-i + 6)),
        i: i
      };
    });

    // Set up initial layered stack — first card on top, slight cascade
    data.forEach(function(o){
      o.el.style.zIndex = String((N - o.i) * 10);
      // Initial offset to make the stack visible before scroll
      o.el.style.transform =
        'translateY(' + (o.i * 6) + 'px) translateX(' + (o.i * -2) + 'px) ' +
        'rotate(' + o.rot0.toFixed(2) + 'deg)';
    });

    // Scroll progress mapping framer's ["start center", "end end"]
    function progress(){
      var rect = container.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = rect.height - vh * 0.5;
      if (total <= 0) return 0;
      var p = (vh * 0.5 - rect.top) / total;
      return Math.max(0, Math.min(1, p));
    }

    function update(){
      var p = progress();
      data.forEach(function(o){
        var i = o.i;
        // Range: each card occupies 1/(N+1) of the scroll
        var start = i / (N + 1);
        var end = (i + 1) / (N + 1);
        var rotStart = Math.max(0, start - 0.15);
        var rotEnd = end * 0.85;

        // Y: 0% at start of range → -180% at end (move up & away)
        var y = 0;
        if (p <= start) y = 0;
        else if (p >= end) y = -180;
        else y = ((p - start) / (end - start)) * -180;

        // Rotation: rot0 → 0 across [rotStart, rotEnd]
        var rot;
        if (p <= rotStart) rot = o.rot0;
        else if (p >= rotEnd) rot = 0;
        else rot = o.rot0 + (0 - o.rot0) * ((p - rotStart) / (rotEnd - rotStart));

        // Slight X cascade only while still in stack
        var stillStacked = p < start;
        var dx = stillStacked ? (i * -2) : 0;
        var dyBase = stillStacked ? (i * 6) : 0;

        o.el.style.transform =
          'translateY(calc(' + dyBase + 'px + ' + y.toFixed(2) + '%)) ' +
          'translateX(' + dx + 'px) ' +
          'rotate(' + rot.toFixed(2) + 'deg)';
      });
    }

    // Override any prior scroll listeners by re-binding with capture priority.
    var ticking = false;
    function onScroll(){
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function(){ update(); ticking = false; });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }
  // Run after the original stack init has finished
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 80); });
  } else {
    setTimeout(init, 80);
  }
})();


/* ─── v3.2: nav hover gravity particles ─── */
(function(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function spawn(host){
    var s = document.createElement('span');
    s.className = 'nav-spark';
    var x = (15 + Math.random() * 70);                 // % across link
    var dx = ((Math.random() - 0.5) * 30).toFixed(0);  // sideways drift
    var dy = (50 + Math.random() * 30).toFixed(0);     // fall distance
    var dur = (1.0 + Math.random() * 0.7).toFixed(2);
    s.style.setProperty('--x', x + '%');
    s.style.setProperty('--dx', dx + 'px');
    s.style.setProperty('--dy', dy + 'px');
    s.style.setProperty('--d', dur + 's');
    host.appendChild(s);
    setTimeout(function(){ if (s.parentNode) s.parentNode.removeChild(s); }, dur * 1000 + 60);
  }

  function attach(){
    var links = document.querySelectorAll('#navbar .nav-links a, #navbar .nav-cta-btn');
    links.forEach(function(link){
      if (link.dataset.sparkBound === '1') return;
      link.dataset.sparkBound = '1';

      var iv = null;
      function start(){
        if (iv) return;
        spawn(link);  // immediate first spark
        iv = setInterval(function(){ spawn(link); }, 90);
      }
      function stop(){
        if (iv){ clearInterval(iv); iv = null; }
      }
      link.addEventListener('mouseenter', start);
      link.addEventListener('mouseleave', stop);
      link.addEventListener('focus', start);
      link.addEventListener('blur', stop);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();


/* ─── v3.3: re-bind stack with pin-window progress mapping ─── */
(function(){
  function init(){
    var container = document.getElementById('acsScroll');
    var sticky    = container && container.querySelector('.acs-sticky');
    var stage     = document.getElementById('acsStage');
    if (!container || !sticky || !stage) return;
    var cards = Array.prototype.slice.call(stage.querySelectorAll('.acs-card'));
    var N = cards.length;
    if (!N) return;

    var data = cards.map(function(c, i){
      return { el: c, rot0: parseFloat(c.dataset.rot != null ? c.dataset.rot : (-i + 6)), i: i };
    });

    data.forEach(function(o){
      o.el.style.zIndex = String((N - o.i) * 10);
      o.el.style.transform =
        'translateY(' + (o.i * 6) + 'px) translateX(' + (o.i * -2) + 'px) ' +
        'rotate(' + o.rot0.toFixed(2) + 'deg)';
    });

    // Progress = fraction of pin-window completed
    function progress(){
      var rect = container.getBoundingClientRect();
      var stickyH = sticky.offsetHeight;
      var pinDuration = rect.height - stickyH;
      if (pinDuration <= 0) return 0;
      // Pin begins when rect.top == 0; ends when rect.top == -pinDuration
      if (rect.top >= 0) return 0;
      if (rect.top <= -pinDuration) return 1;
      return -rect.top / pinDuration;
    }

    function update(){
      var p = progress();
      data.forEach(function(o){
        var i = o.i;
        // Each card occupies 1/N of the pin window
        var start = i / N;
        var end = (i + 1) / N;
        var rotStart = Math.max(0, start - 0.12);
        var rotEnd = end * 0.85;

        var y = 0;
        if (p <= start) y = 0;
        else if (p >= end) y = -180;
        else y = ((p - start) / (end - start)) * -180;

        var rot;
        if (p <= rotStart) rot = o.rot0;
        else if (p >= rotEnd) rot = 0;
        else rot = o.rot0 + (0 - o.rot0) * ((p - rotStart) / (rotEnd - rotStart));

        var stillStacked = p < start;
        var dx = stillStacked ? (i * -2) : 0;
        var dyBase = stillStacked ? (i * 6) : 0;

        o.el.style.transform =
          'translateY(calc(' + dyBase + 'px + ' + y.toFixed(2) + '%)) ' +
          'translateX(' + dx + 'px) ' +
          'rotate(' + rot.toFixed(2) + 'deg)';
      });
    }

    var ticking = false;
    function onScroll(){
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function(){ update(); ticking = false; });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }
  // Run last (after earlier stack inits)
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(init, 120); });
  else setTimeout(init, 120);
})();


/* ─── Testimonials marquee: duplicate children for seamless loop ─── */
(function(){
  function init(){
    var track = document.getElementById('tmTrack');
    if (!track || track.dataset.dup === '1') return;
    track.dataset.dup = '1';
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function(node){
      var clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


/* ─── 1. PARTICLE HERO canvas (falling/rising particles, gold-tinted) ─── */
(function(){
  function init(){
    var canvas = document.getElementById('phCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var W = 0, H = 0, particles = [];
    function resize(){
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      initParticles();
    }
    function makeParticle(){
      var p = {
        reset: function(){
          this.x = Math.random() * W;
          this.y = Math.random() * H;
          this.speed = Math.random() / 5 + 0.1;
          this.opacity = 1;
          this.fadeDelay = Math.random() * 600 + 100;
          this.fadeStart = Date.now() + this.fadeDelay;
          this.fadingOut = false;
          this.gold = Math.random() < 0.18; // ~18% gold particles
        },
        update: function(){
          this.y -= this.speed;
          if (this.y < 0) this.reset();
          if (!this.fadingOut && Date.now() > this.fadeStart) this.fadingOut = true;
          if (this.fadingOut) {
            this.opacity -= 0.008;
            if (this.opacity <= 0) this.reset();
          }
        },
        draw: function(){
          if (this.gold) {
            ctx.fillStyle = 'rgba(' + Math.floor(220+Math.random()*30) + ',' + Math.floor(165+Math.random()*30) + ', 60,' + this.opacity + ')';
          } else {
            ctx.fillStyle = 'rgba(' + (255 - Math.random()*128) + ', 255, 255,' + this.opacity + ')';
          }
          ctx.fillRect(this.x, this.y, 0.5, Math.random() * 2 + 1);
        }
      };
      p.reset();
      p.y = Math.random() * H;
      return p;
    }
    function initParticles(){
      var count = Math.floor((W * H) / 6000);
      particles = [];
      for (var i = 0; i < count; i++) particles.push(makeParticle());
    }
    function frame(){
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      requestAnimationFrame(frame);
    }
    resize();
    frame();
    window.addEventListener('resize', resize, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ─── 2. ZOOM PARALLAX (Inside AllBee on index) ─── */
(function(){
  function init(){
    var scroll = document.getElementById('zpScroll');
    if (!scroll) return;
    var slots = scroll.querySelectorAll('.zp-slot');
    // Scale targets matching the React demo
    var scales = [4, 5, 6, 5, 6, 8, 9];
    function progress(){
      var rect = scroll.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = rect.height - vh; // scroll distance while pinned
      if (total <= 0) return 0;
      var scrolled = -rect.top;
      return Math.max(0, Math.min(1, scrolled / total));
    }
    function update(){
      var p = progress();
      slots.forEach(function(slot, i){
        var to = scales[i % scales.length] || 4;
        var s = 1 + (to - 1) * p;
        var frame = slot.querySelector('.zp-frame');
        if (frame) frame.style.transform = 'scale(' + s.toFixed(3) + ')';
      });
    }
    var tick = false;
    function onScroll(){ if (tick) return; tick = true; requestAnimationFrame(function(){ update(); tick=false; }); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ─── 3. RECOGNITION image-tiles fan reveal (when in viewport) ─── */
(function(){
  function init(){
    var stage = document.getElementById('rtStage');
    if (!stage) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          stage.classList.add('is-spread');
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(stage);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


/* ─── CTA rising gold particle field ─── */
(function(){
  function init(){
    var canvas = document.getElementById('ctaGold');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var W=0,H=0,parts=[];
    function makeP(){
      return {
        reset:function(initial){
          this.x = Math.random()*W;
          this.y = initial ? Math.random()*H : H + Math.random()*40;
          this.r = Math.random()*1.8 + 0.6;
          this.sp = Math.random()*0.5 + 0.25;
          this.drift = (Math.random()-0.5)*0.3;
          this.life = 0;
          this.maxLife = Math.random()*260 + 160;
          this.glow = Math.random()<0.25;
          this.baseA = Math.random()*0.5 + 0.4;
        },
        update:function(){
          this.y -= this.sp;
          this.x += this.drift;
          this.life++;
          if (this.y < -10 || this.life > this.maxLife) this.reset(false);
        },
        draw:function(){
          var fade = 1 - (this.life/this.maxLife);
          var a = this.baseA * fade;
          if (this.glow){
            var g = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*6);
            g.addColorStop(0,'rgba(255,213,79,'+(a*0.9)+')');
            g.addColorStop(1,'rgba(220,165,12,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(this.x,this.y,this.r*6,0,Math.PI*2); ctx.fill();
          }
          ctx.fillStyle = 'rgba('+(220+Math.random()*35)+','+(170+Math.random()*40)+','+(40+Math.random()*40)+','+a+')';
          ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fill();
        }
      };
    }
    function resize(){
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      var count = Math.max(40, Math.floor(W/8));
      parts = [];
      for (var i=0;i<count;i++){ var p=makeP(); p.reset(true); parts.push(p); }
    }
    function frame(){
      ctx.clearRect(0,0,W,H);
      for (var i=0;i<parts.length;i++){ parts[i].update(); parts[i].draw(); }
      requestAnimationFrame(frame);
    }
    resize(); frame();
    window.addEventListener('resize', resize, {passive:true});
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();


/* ─── Services waitlist hero: submit → loading → success + confetti ─── */
function wlSubmit(e){
  e.preventDefault();
  var email = document.getElementById('wlEmail');
  var btn = document.getElementById('wlBtn');
  var form = document.getElementById('wlForm');
  var success = document.getElementById('wlSuccess');
  if (!email || !email.value) return false;
  btn.classList.add('is-loading'); btn.textContent = 'Sending…';
  setTimeout(function(){
    form.style.opacity = '0'; form.style.transform = 'scale(.95)'; form.style.pointerEvents = 'none';
    success.classList.add('show');
    wlConfetti();
    // open WhatsApp with the captured intent
    var url = 'https://wa.me/918903607506?text=' + encodeURIComponent('Hi AllBee! I want a free quote. My email: ' + email.value);
    setTimeout(function(){ window.open(url, '_blank', 'noopener'); }, 600);
  }, 1200);
  return false;
}
function wlConfetti(){
  var canvas = document.getElementById('wlConfetti');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
  var colors = ['#1FB8A5','#0F7B6E','#DCA50C','#FFD54F','#fff'];
  var parts = [];
  for (var i=0;i<60;i++){
    parts.push({ x:canvas.width/2, y:canvas.height/2,
      vx:(Math.random()-0.5)*13, vy:(Math.random()-2)*11, life:100,
      color:colors[Math.floor(Math.random()*colors.length)], size:Math.random()*4+2 });
  }
  (function anim(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (!parts.length) return;
    for (var i=0;i<parts.length;i++){
      var p=parts[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.5; p.life-=2;
      ctx.fillStyle=p.color; ctx.globalAlpha=Math.max(0,p.life/100);
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      if (p.life<=0){ parts.splice(i,1); i--; }
    }
    ctx.globalAlpha=1;
    requestAnimationFrame(anim);
  })();
}


/* ─── Services hero rising gold embers ─── */
(function(){
  function init(){
    var c=document.getElementById('wlEmbers'); if(!c) return;
    var ctx=c.getContext('2d'), W=0,H=0,p=[];
    function mk(init){return {
      x:Math.random()*W, y:init?Math.random()*H:H+Math.random()*40,
      r:Math.random()*2+0.6, sp:Math.random()*0.7+0.3, dr:(Math.random()-0.5)*0.4,
      life:0, max:Math.random()*280+160, glow:Math.random()<0.3, a:Math.random()*0.5+0.45,
      flick:Math.random()*0.04+0.01, ph:Math.random()*6.28 };}
    function resize(){ W=c.width=c.offsetWidth; H=c.height=c.offsetHeight;
      var n=Math.max(50,Math.floor(W/7)); p=[]; for(var i=0;i<n;i++){var q=mk(true);p.push(q);} }
    function frame(){
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<p.length;i++){var e=p[i];
        e.y-=e.sp; e.x+=e.dr+Math.sin(e.life*e.flick+e.ph)*0.3; e.life++;
        if(e.y<-10||e.life>e.max){ p[i]=mk(false); continue; }
        var fade=1-(e.life/e.max), a=e.a*fade;
        if(e.glow){ var g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,e.r*7);
          g.addColorStop(0,'rgba(255,200,70,'+(a*0.9)+')'); g.addColorStop(1,'rgba(220,165,12,0)');
          ctx.fillStyle=g; ctx.beginPath(); ctx.arc(e.x,e.y,e.r*7,0,6.28); ctx.fill(); }
        ctx.fillStyle='rgba('+(235+Math.random()*20)+','+(175+Math.random()*45)+','+(40+Math.random()*50)+','+a+')';
        ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,6.28); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    resize(); frame(); window.addEventListener('resize',resize,{passive:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();


/* ─── Start Today rising gold embers (services) ─── */
(function(){
  function init(){
    var c=document.getElementById('ctaEmbers'); if(!c) return;
    var ctx=c.getContext('2d'),W=0,H=0,p=[];
    function mk(init){return {x:Math.random()*W,y:init?Math.random()*H:H+Math.random()*40,
      r:Math.random()*2+0.6,sp:Math.random()*0.7+0.3,dr:(Math.random()-0.5)*0.4,life:0,
      max:Math.random()*280+160,glow:Math.random()<0.3,a:Math.random()*0.5+0.45,
      flick:Math.random()*0.04+0.01,ph:Math.random()*6.28};}
    function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;
      var n=Math.max(40,Math.floor(W/8));p=[];for(var i=0;i<n;i++)p.push(mk(true));}
    function frame(){ctx.clearRect(0,0,W,H);
      for(var i=0;i<p.length;i++){var e=p[i];e.y-=e.sp;e.x+=e.dr+Math.sin(e.life*e.flick+e.ph)*0.3;e.life++;
        if(e.y<-10||e.life>e.max){p[i]=mk(false);continue;}
        var fade=1-(e.life/e.max),a=e.a*fade;
        if(e.glow){var g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,e.r*7);
          g.addColorStop(0,'rgba(255,200,70,'+(a*0.9)+')');g.addColorStop(1,'rgba(220,165,12,0)');
          ctx.fillStyle=g;ctx.beginPath();ctx.arc(e.x,e.y,e.r*7,0,6.28);ctx.fill();}
        ctx.fillStyle='rgba('+(235+Math.random()*20)+','+(175+Math.random()*45)+','+(40+Math.random()*50)+','+a+')';
        ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,6.28);ctx.fill();}
      requestAnimationFrame(frame);}
    resize();frame();window.addEventListener('resize',resize,{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();


/* ─── About: particle text effect (teal/gold) cycling AllBee words ─── */
(function(){
  function init(){
    var canvas=document.getElementById('ptxCanvas'); if(!canvas) return;
    var ctx=canvas.getContext('2d');
    var W=canvas.width=1000, H=canvas.height=500;
    function fit(){ var r=canvas.getBoundingClientRect(); W=canvas.width=Math.max(800,Math.floor(r.width)); H=canvas.height=Math.max(420,Math.floor(r.height)); }
    fit();
    var words=["AllBee","LEARN","GROW","SUCCEED","SINCE 2025"];
    var palette=[[31,184,165],[220,165,12],[95,218,199],[255,213,79]];
    var pixelSteps=6, particles=[], frame=0, wi=0;
    function rndPos(x,y,mag){ var rx=Math.random()*W, ry=Math.random()*H, dx=rx-x, dy=ry-y, m=Math.sqrt(dx*dx+dy*dy)||1; return {x:x+dx/m*mag,y:y+dy/m*mag}; }
    function P(){ this.pos={x:0,y:0};this.vel={x:0,y:0};this.acc={x:0,y:0};this.tgt={x:0,y:0};
      this.close=100;this.maxS=1;this.maxF=0.1;this.size=4;this.kill=false;
      this.sc={r:0,g:0,b:0};this.tc={r:0,g:0,b:0};this.cw=0;this.cb=0.01; }
    P.prototype.move=function(){ var pm=1, d=Math.sqrt(Math.pow(this.pos.x-this.tgt.x,2)+Math.pow(this.pos.y-this.tgt.y,2));
      if(d<this.close) pm=d/this.close;
      var tx=this.tgt.x-this.pos.x, ty=this.tgt.y-this.pos.y, m=Math.sqrt(tx*tx+ty*ty);
      if(m>0){tx=tx/m*this.maxS*pm; ty=ty/m*this.maxS*pm;}
      var sx=tx-this.vel.x, sy=ty-this.vel.y, sm=Math.sqrt(sx*sx+sy*sy);
      if(sm>0){sx=sx/sm*this.maxF; sy=sy/sm*this.maxF;}
      this.acc.x+=sx; this.acc.y+=sy; this.vel.x+=this.acc.x; this.vel.y+=this.acc.y;
      this.pos.x+=this.vel.x; this.pos.y+=this.vel.y; this.acc.x=0; this.acc.y=0; };
    P.prototype.draw=function(){ if(this.cw<1) this.cw=Math.min(this.cw+this.cb,1);
      var r=Math.round(this.sc.r+(this.tc.r-this.sc.r)*this.cw),
          g=Math.round(this.sc.g+(this.tc.g-this.sc.g)*this.cw),
          b=Math.round(this.sc.b+(this.tc.b-this.sc.b)*this.cw);
      ctx.fillStyle='rgb('+r+','+g+','+b+')'; ctx.fillRect(this.pos.x,this.pos.y,2.5,2.5); };
    P.prototype.doKill=function(){ if(!this.kill){ var p=rndPos(W/2,H/2,(W+H)/2); this.tgt.x=p.x; this.tgt.y=p.y;
      this.sc={r:this.sc.r+(this.tc.r-this.sc.r)*this.cw,g:this.sc.g+(this.tc.g-this.sc.g)*this.cw,b:this.sc.b+(this.tc.b-this.sc.b)*this.cw};
      this.tc={r:0,g:0,b:0}; this.cw=0; this.kill=true; } };
    function nextWord(word){
      var oc=document.createElement('canvas'); oc.width=W; oc.height=H; var octx=oc.getContext('2d');
      octx.fillStyle='white'; octx.font='bold '+Math.floor(W*0.13)+'px Georgia, serif';
      octx.textAlign='center'; octx.textBaseline='middle'; octx.fillText(word, W/2, H/2);
      var px=octx.getImageData(0,0,W,H).data;
      var col=palette[Math.floor(Math.random()*palette.length)], nc={r:col[0],g:col[1],b:col[2]};
      var idx=0, coords=[];
      for(var i=0;i<px.length;i+=pixelSteps*4) coords.push(i);
      for(var i=coords.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)); var t=coords[i];coords[i]=coords[j];coords[j]=t;}
      for(var c=0;c<coords.length;c++){ var pi=coords[c]; if(px[pi+3]>0){
        var x=(pi/4)%W, y=Math.floor(pi/4/W), part;
        if(idx<particles.length){ part=particles[idx]; part.kill=false; idx++; }
        else { part=new P(); var rp=rndPos(W/2,H/2,(W+H)/2); part.pos.x=rp.x; part.pos.y=rp.y;
          part.maxS=Math.random()*6+4; part.maxF=part.maxS*0.05; part.size=Math.random()*2+2; part.cb=Math.random()*0.0275+0.0025; particles.push(part); }
        part.sc={r:part.sc.r+(part.tc.r-part.sc.r)*part.cw,g:part.sc.g+(part.tc.g-part.sc.g)*part.cw,b:part.sc.b+(part.tc.b-part.sc.b)*part.cw};
        part.tc=nc; part.cw=0; part.tgt.x=x; part.tgt.y=y;
      }}
      for(var k=idx;k<particles.length;k++) particles[k].doKill();
    }
    nextWord(words[0]);
    (function anim(){ ctx.fillStyle='rgba(4,16,14,0.12)'; ctx.fillRect(0,0,W,H);
      for(var i=particles.length-1;i>=0;i--){ var p=particles[i]; p.move(); p.draw();
        if(p.kill && (p.pos.x<0||p.pos.x>W||p.pos.y<0||p.pos.y>H)) particles.splice(i,1); }
      frame++; if(frame%240===0){ wi=(wi+1)%words.length; nextWord(words[wi]); }
      requestAnimationFrame(anim);
    })();
    window.addEventListener('resize', function(){ fit(); nextWord(words[wi]); }, {passive:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();


/* ─── Team showcase hover sync ─── */
function tsHover(id){
  document.querySelectorAll('.ts-photo').forEach(function(el){
    el.classList.toggle('is-active', id && el.dataset.id===id);
    el.classList.toggle('is-dim', id && el.dataset.id!==id);
  });
  document.querySelectorAll('.ts-row').forEach(function(el){
    el.classList.toggle('is-active', id && el.dataset.id===id);
    el.classList.toggle('is-dim', id && el.dataset.id!==id);
  });
}


/* ─── About Start Today gold embers ─── */
(function(){
  function init(){
    var c=document.getElementById('ctaGoldAbout'); if(!c) return;
    var ctx=c.getContext('2d'),W=0,H=0,p=[];
    function mk(init){return {x:Math.random()*W,y:init?Math.random()*H:H+Math.random()*40,
      r:Math.random()*2+0.6,sp:Math.random()*0.7+0.3,dr:(Math.random()-0.5)*0.4,life:0,
      max:Math.random()*280+160,glow:Math.random()<0.3,a:Math.random()*0.5+0.45,
      flick:Math.random()*0.04+0.01,ph:Math.random()*6.28};}
    function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;
      var n=Math.max(40,Math.floor(W/8));p=[];for(var i=0;i<n;i++)p.push(mk(true));}
    function frame(){ctx.clearRect(0,0,W,H);
      for(var i=0;i<p.length;i++){var e=p[i];e.y-=e.sp;e.x+=e.dr+Math.sin(e.life*e.flick+e.ph)*0.3;e.life++;
        if(e.y<-10||e.life>e.max){p[i]=mk(false);continue;}
        var fade=1-(e.life/e.max),a=e.a*fade;
        if(e.glow){var g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,e.r*7);
          g.addColorStop(0,'rgba(255,200,70,'+(a*0.9)+')');g.addColorStop(1,'rgba(220,165,12,0)');
          ctx.fillStyle=g;ctx.beginPath();ctx.arc(e.x,e.y,e.r*7,0,6.28);ctx.fill();}
        ctx.fillStyle='rgba('+(235+Math.random()*20)+','+(175+Math.random()*45)+','+(40+Math.random()*50)+','+a+')';
        ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,6.28);ctx.fill();}
      requestAnimationFrame(frame);}
    resize();frame();window.addEventListener('resize',resize,{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();


/* ─── Floating icons cursor repulsion ─── */
(function(){
  function init(){
    var field=document.querySelector('.fih-field'); if(!field) return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches) return;
    var icons=[].slice.call(field.querySelectorAll('.fih-icon'));
    var hero=document.querySelector('.fih-hero'); if(!hero || !icons.length) return;
    var mx=-9999,my=-9999,raf=null,visible=false;
    hero.addEventListener('mousemove',function(e){ mx=e.clientX; my=e.clientY; });
    hero.addEventListener('mouseleave',function(){ mx=-9999; my=-9999; });
    var st=icons.map(function(){return {x:0,y:0,vx:0,vy:0};});
    function loop(){
      if(!visible || document.hidden){ raf=null; return; }
      for(var i=0;i<icons.length;i++){
        var el=icons[i], r=el.getBoundingClientRect();
        var cx=r.left+r.width/2, cy=r.top+r.height/2;
        var dx=mx-cx, dy=my-cy, dist=Math.sqrt(dx*dx+dy*dy);
        var tx=0,ty=0;
        if(dist<150){ var ang=Math.atan2(dy,dx), force=(1-dist/150)*50; tx=-Math.cos(ang)*force; ty=-Math.sin(ang)*force; }
        var s=st[i];
        s.vx=(tx-s.x)*0.18; s.vy=(ty-s.y)*0.18; s.x+=s.vx; s.y+=s.vy;
        el.style.marginLeft=s.x.toFixed(2)+'px'; el.style.marginTop=s.y.toFixed(2)+'px';
      }
      raf=requestAnimationFrame(loop);
    }
    function update(){
      if(visible && !document.hidden && raf===null) raf=requestAnimationFrame(loop);
      else if((!visible || document.hidden) && raf!==null){ cancelAnimationFrame(raf); raf=null; }
    }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(entries){ visible=entries[0].isIntersecting; update(); }).observe(hero);
    } else { visible=true; update(); }
    document.addEventListener('visibilitychange',update);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();


/* ─── Contact hero: cobe globe + gold embers ─── */
(function(){
  function embers(){
    var c=document.getElementById('ctEmbers'); if(!c) return;
    var ctx=c.getContext('2d'),W=0,H=0,p=[];
    function mk(init){return {x:Math.random()*W,y:init?Math.random()*H:H+Math.random()*40,
      r:Math.random()*2+0.6,sp:Math.random()*0.7+0.3,dr:(Math.random()-0.5)*0.4,life:0,
      max:Math.random()*280+160,glow:Math.random()<0.3,a:Math.random()*0.5+0.45,
      flick:Math.random()*0.04+0.01,ph:Math.random()*6.28};}
    function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;
      var n=Math.max(40,Math.floor(W/9));p=[];for(var i=0;i<n;i++)p.push(mk(true));}
    function frame(){ctx.clearRect(0,0,W,H);
      for(var i=0;i<p.length;i++){var e=p[i];e.y-=e.sp;e.x+=e.dr+Math.sin(e.life*e.flick+e.ph)*0.3;e.life++;
        if(e.y<-10||e.life>e.max){p[i]=mk(false);continue;}
        var fade=1-(e.life/e.max),a=e.a*fade;
        if(e.glow){var g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,e.r*7);
          g.addColorStop(0,'rgba(255,200,70,'+(a*0.9)+')');g.addColorStop(1,'rgba(220,165,12,0)');
          ctx.fillStyle=g;ctx.beginPath();ctx.arc(e.x,e.y,e.r*7,0,6.28);ctx.fill();}
        ctx.fillStyle='rgba('+(235+Math.random()*20)+','+(175+Math.random()*45)+','+(40+Math.random()*50)+','+a+')';
        ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,6.28);ctx.fill();}
      requestAnimationFrame(frame);}
    resize();frame();window.addEventListener('resize',resize,{passive:true});
  }
  function globe(){
    var canvas=document.getElementById('ctGlobe'); if(!canvas||typeof createGlobe!=='function') return;
    var phi=0, width=0, paused=false, phiOff=0, thetaOff=0, drag={phi:0,theta:0}, ptr=null;
    var markers=[
      {location:[10.77,79.85]},   // Nagore / Tamil Nadu (home)
      {location:[13.08,80.27]},   // Chennai
      {location:[12.97,77.59]},   // Bengaluru
      {location:[19.09,72.87]},   // Mumbai
      {location:[28.61,77.20]},   // Delhi
      {location:[1.36,103.99]},   // Singapore
      {location:[25.20,55.27]},   // Dubai
      {location:[51.50,-0.12]},   // London
      {location:[40.71,-74.00]},  // New York
      {location:[1.29,103.85]}
    ];
    var arcs=[
      {from:[10.77,79.85],to:[13.08,80.27]},
      {from:[10.77,79.85],to:[12.97,77.59]},
      {from:[10.77,79.85],to:[19.09,72.87]},
      {from:[10.77,79.85],to:[25.20,55.27]},
      {from:[10.77,79.85],to:[1.36,103.99]},
      {from:[10.77,79.85],to:[51.50,-0.12]}
    ];
    function onResize(){ width=canvas.offsetWidth; }
    window.addEventListener('resize',onResize); onResize();
    canvas.addEventListener('pointerdown',function(e){ ptr={x:e.clientX,y:e.clientY}; canvas.style.cursor='grabbing'; paused=true; });
    window.addEventListener('pointerup',function(){ if(ptr){phiOff+=drag.phi; thetaOff+=drag.theta; drag={phi:0,theta:0};} ptr=null; canvas.style.cursor='grab'; paused=false; },{passive:true});
    window.addEventListener('pointermove',function(e){ if(ptr){ drag={phi:(e.clientX-ptr.x)/300, theta:(e.clientY-ptr.y)/1000}; } },{passive:true});
    var g=createGlobe(canvas,{
      devicePixelRatio:Math.min(window.devicePixelRatio||1,2),
      width:width*2, height:width*2,
      phi:0, theta:0.25, dark:0, diffuse:1.4,
      mapSamples:16000, mapBrightness:9,
      baseColor:[1,1,1], markerColor:[0.06,0.48,0.43], glowColor:[0.88,0.95,0.93],
      markerElevation:0.02,
      markers:markers.map(function(m){return {location:m.location,size:0.045};}),
      arcs:arcs.map(function(a){return {from:a.from,to:a.to};}),
      arcColor:[0.86,0.65,0.05], arcWidth:0.8, arcHeight:0.32, opacity:0.85,
      onRender:function(state){
        if(!paused) phi+=0.004;
        state.phi=phi+phiOff+drag.phi;
        state.theta=0.25+thetaOff+drag.theta;
        state.width=width*2; state.height=width*2;
      }
    });
    setTimeout(function(){ canvas.style.opacity='1'; },120);
  }
  function init(){
    embers();
    if(!document.getElementById('ctGlobe')) return;
    var cg=(typeof createGlobe==='function')?createGlobe:(window.createGlobe);
    if(typeof cg==='function'){ if(typeof createGlobe!=='function'){window.createGlobe=cg;} globe(); }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
