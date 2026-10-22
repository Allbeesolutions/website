/* AllBee admin identity bootstrap. Legacy login is unchanged until the
   operator enables ADMIN_AUTH_MODE=totp, which uses HttpOnly signed sessions. */
(function () {
  'use strict';
  var current = null, pending = null, inputNode = null;
  function prepare(input) {
    if (pending) return pending;
    inputNode = input;
    pending = fetch('/api/health?admin_session=1', {cache:'no-store'}).then(function(r) {
      return r.json().then(function(d) { if (!r.ok) throw new Error(d.error || 'admin_auth_unavailable'); return d; });
    }).then(function(d) {
      current = d;
      if(d.mode === 'totp') {
        sessionStorage.removeItem('crm_pass');
        inputNode.placeholder = 'Password';
        inputNode.setAttribute('autocomplete','current-password');
        var username=document.createElement('input');
        username.type='text'; username.id='abAdminUsername'; username.placeholder='Admin username';
        username.autocomplete='username'; username.setAttribute('aria-label','Admin username');
        username.required=true;
        var otp=document.createElement('input');
        otp.type='text'; otp.id='abAdminOtp'; otp.placeholder='Six-digit authenticator code';
        otp.inputMode='numeric'; otp.autocomplete='one-time-code'; otp.maxLength=6;
        otp.setAttribute('aria-label','Authenticator code'); otp.required=true;
        // Copy stylesheet-backed presentation, never inline CSS text.
        for (const node of [username, otp]) {
          node.className=(inputNode.className+' ab-admin-auth-extra').trim();
          const styleKey=inputNode.getAttribute('data-ab-style');
          if (styleKey) node.setAttribute('data-ab-style',styleKey);
        }
        inputNode.parentNode.insertBefore(username,inputNode);
        inputNode.parentNode.insertBefore(otp,inputNode.nextSibling);
      }
      return d;
    }).catch(function(e){pending=null;throw e;});
    return pending;
  }
  async function signIn(pass,input) {
    var state = await prepare(input);
    if(state.mode!=='totp') return true;
    if(state.authenticated) return true;
    var user=document.getElementById('abAdminUsername');
    var otp=document.getElementById('abAdminOtp');
    var r=await fetch('/api/health?admin_session=1', { method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'login',username:user&&user.value.trim(),password:pass,code:otp&&otp.value.trim()})});
    var data=await r.json().catch(function(){return{};});
    if(!r.ok||!data.ok){var e=new Error('Admin login denied');e.code=r.status;throw e;}
    current.authenticated=true; current.scopes=data.scopes||[];
    input.value='';if(otp)otp.value='';
    return true;
  }
  async function signOut() {
    if(current&&current.mode==='totp') await fetch('/api/health?admin_session=1',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});
    sessionStorage.removeItem('crm_pass');
    location.reload();
  }
  function isMfa() { return current && current.mode==='totp'; }
  window.AllBeeAdminAuth = {prepare:prepare,signIn:signIn,signOut:signOut,isMfa:isMfa};
})();
