(function(){
  var q=new URLSearchParams(location.search),oid=q.get('order')||q.get('order_id')||'';
  if(oid){document.getElementById('order_id').value=oid;var n=document.getElementById('ordNote');n.style.display='block';n.textContent='Brief for order '+oid;}
  var form=document.getElementById('briefForm'),err=document.getElementById('err'),go=document.getElementById('go');
  function setupUpload(orderId,token){
    var box=document.getElementById('uploadBox'),input=document.getElementById('referenceFiles');
    var button=document.getElementById('uploadBtn'),status=document.getElementById('uploadStatus');
    box.classList.add('show');
    var savedTotal=0,retryFiles=null;
    input.addEventListener('change',function(){retryFiles=null;});
    button.addEventListener('click',async function(){
      var files=retryFiles||Array.from(input.files||[]);
      if(!files.length){status.textContent='Choose photos to upload.';return;}
      if(files.length>3 || files.some(function(file){return !['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>1536*1024||!file.size;})){
        status.textContent='Choose up to 3 JPG, PNG or WebP images, 1.5 MB each.';return;
      }
      button.disabled=true;
        for(var i=0;i<files.length;i++){
        status.textContent='Uploading photo '+(i+1)+' of '+files.length+'…';
        try{
          var data=await new Promise(function(resolve,reject){
            var reader=new FileReader();
            reader.onload=function(){resolve(String(reader.result).split(',')[1]||'');};
            reader.onerror=reject;reader.readAsDataURL(files[i]);
          });
          var response=await fetch('/api/reference-upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id:orderId,upload_token:token,filename:files[i].name,mime:files[i].type,data:data})});
          var result=await response.json();
          if(!response.ok||!result.ok||!result.id)throw new Error(result.error||'upload_failed');
          savedTotal++;
        }catch(e){
          retryFiles=files.slice(i);
          status.textContent=savedTotal+' photo'+(savedTotal===1?'':'s')+' saved. The next photo could not be saved. Retry the remaining '+retryFiles.length+' or send them on WhatsApp.';
          button.disabled=false;return;
        }
      }
      retryFiles=null;
      status.textContent=savedTotal+' photo'+(savedTotal===1?'':'s')+' saved with order '+orderId+'.';
      input.value='';button.disabled=true;
    });
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();err.classList.remove('show');
    if(form._gotcha.value)return; if(!form.checkValidity()){form.reportValidity();return;}
    var f=new FormData(form);
    var fields=['Names','Parents / Family','Venue','Address / Map','Time','Event Schedule','Theme / Colours','Language','Invitation Wording','RSVP / Contact','Social / Hashtag','Special Instructions'];
    var names=['names','parents','venue','address','time','schedule','theme','language','wording','rsvp','social','special'];
    var parts=['Order: '+f.get('order_id')]; for(var i=0;i<names.length;i++) parts.push(fields[i]+': '+(f.get(names[i])||'—'));
    var data={order_id:String(f.get('order_id')||''),name:String(f.get('name')||''),mobile:String(f.get('mobile')||''),event_type:String(f.get('event_type')||''),event_date:String(f.get('event_date')||''),notes:'DESIGN BRIEF · '+parts.join(' | ')};
    go.disabled=true;go.textContent='Submitting…';
    fetch('/api/design-brief',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json().catch(function(){return{};});})
      .then(function(res){if(res&&res.ok&&res.order_id){document.getElementById('card').style.display='none';document.getElementById('ok').classList.add('show');document.getElementById('ok').querySelector('p').textContent='Brief saved for order '+res.order_id+'. We will contact you soon.';document.querySelector('#ok a[href^="https://wa.me/"]').href='https://wa.me/918903607506?text='+encodeURIComponent('Reference images for order '+res.order_id);if(res.upload_token)setupUpload(res.order_id,res.upload_token);window.scrollTo({top:0,behavior:'smooth'});}else{err.textContent=res.error==='paid_order_required'?'This design brief is available only for a confirmed paid order. Please check your Order ID and mobile number.':res.error==='brief_closed'?'Your order is already in production. To change your brief, please contact our team on WhatsApp.':'Something went wrong. Please try again or contact us on WhatsApp.';err.classList.add('show');go.disabled=false;go.textContent='Submit Design Brief';}})
      .catch(function(){err.textContent='Network error. Please try again.';err.classList.add('show');go.disabled=false;go.textContent='Submit Design Brief';});
  });
})();
