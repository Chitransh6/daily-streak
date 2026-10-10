import os, sys, time, json, urllib.request, glob, shutil
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright
U = "http://127.0.0.1:5173"; API = "http://127.0.0.1:5000/api"; tag = str(int(time.time()))[-6:]
EM = f"aarav{tag}@veloop.in"; PW = "Secret@123"
INIT = """(()=>{const d=document.createElement('div');d.style.cssText='position:fixed;z-index:999999;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:2px solid #10b981;background:rgba(16,185,129,.28);pointer-events:none;transition:transform .12s;left:-50px;top:-50px';
addEventListener('DOMContentLoaded',()=>document.body.appendChild(d));addEventListener('mousemove',e=>{d.style.left=e.clientX+'px';d.style.top=e.clientY+'px'});
addEventListener('mousedown',()=>d.style.transform='scale(.6)');addEventListener('mouseup',()=>d.style.transform='scale(1)')})()"""
CAP = """(t)=>{let d=document.getElementById('cap');if(!d){d=document.createElement('div');d.id='cap';d.style.cssText='position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:99999;background:rgba(17,24,39,.94);color:#fff;border-radius:12px;padding:10px 18px;font:600 15px Inter,system-ui,sans-serif;max-width:92vw;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.4)';document.body.appendChild(d);}d.textContent=t;}"""
PNL = """(h)=>{let d=document.getElementById('pnl');if(!d){d=document.createElement('div');d.id='pnl';d.style.cssText='position:fixed;top:72px;left:50%;transform:translateX(-50%);z-index:99999;background:#0b1020;color:#c7f9dd;border:1px solid #10b981;border-radius:12px;padding:12px 16px;font:12.5px/1.55 ui-monospace,monospace;width:min(780px,94vw);white-space:pre-wrap;box-shadow:0 12px 40px rgba(0,0,0,.5)';document.body.appendChild(d);}d.textContent=h;d.style.display=h?'block':'none';}"""
def cap(pg, t, s=2.2): print("CAP", t[:70], flush=True); pg.evaluate(CAP, t); pg.wait_for_timeout(int(s * 1000))
def show(pg, lines, s=4): pg.evaluate(PNL, "\n".join(lines)); pg.wait_for_timeout(int(s * 1000)); pg.evaluate(PNL, "")
def raw(pg, m, path, body=None, tok="__ls__"):
    return pg.evaluate("""async([m,u,b,t])=>{const h={'Content-Type':'application/json'};const tk=t==='__ls__'?localStorage.getItem('token'):t;if(tk)h.Authorization='Bearer '+tk;
    const r=await fetch(u,{method:m,headers:h,body:b?JSON.stringify(b):undefined});let j={};try{j=await r.json()}catch(e){}return {s:r.status,j}}""", [m, API + path, body, tok])
def line(r): return f"HTTP {r['s']}  {r['j'].get('code') or ('OK' if r['j'].get('success') else '')}  {r['j'].get('message','')}"
def scroll(pg, y, s=1.6): pg.evaluate(f"window.scrollTo({{top:{y},behavior:'smooth'}})"); pg.wait_for_timeout(int(s * 1000))
def typ(pg, sel, text): pg.locator(sel).press_sequentially(text, delay=35)
def theme(pg): pg.click('[aria-label="Toggle theme"]'); pg.wait_for_timeout(900)
def register_api(name, email):
    r = urllib.request.Request(API + "/auth/register", method="POST", data=json.dumps({"name": name, "email": email, "password": PW}).encode(), headers={"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(r))["token"]
def claim_api(tok):
    r = urllib.request.Request(API + "/daily-streak/claim", method="POST", data=b"{}", headers={"Content-Type": "application/json", "Authorization": "Bearer " + tok}); urllib.request.urlopen(r)
def ctx_for(p, name, w, h, token=None, th="light"):
    c = p.chromium.launch().new_context(viewport={"width": w, "height": h}, record_video_dir=f"vid_{name}", record_video_size={"width": w, "height": h})
    c.add_init_script(INIT)
    if token: c.add_init_script(f"localStorage.setItem('token','{token}');localStorage.setItem('theme','{th}')")
    else: c.add_init_script(f"localStorage.setItem('theme','{th}')")
    return c

def desktop(pg):
    pg.goto(U + "/login"); pg.wait_for_timeout(1000)
    cap(pg, "VELoop Rewards · Daily Streak (MERN) — Login & Sign up", 2.2)
    typ(pg, "input[type=email]", "demo@veloop.in"); typ(pg, "input[type=password]", "wrongpass")
    pg.get_by_role("button", name="Log in").click(); pg.wait_for_timeout(900)
    cap(pg, "Wrong credentials → rejected by the backend with a friendly message", 2.4)
    pg.fill("input[type=email]", ""); pg.fill("input[type=password]", "")
    pg.get_by_role("link", name="Sign up").click(); pg.wait_for_timeout(500)
    typ(pg, "input[placeholder='Full name']", "Aarav Sharma"); typ(pg, "input[type=email]", EM)
    typ(pg, "input[placeholder='Password (min 6)']", PW); typ(pg, "input[placeholder='Confirm password']", "Different1")
    pg.get_by_role("button", name="Sign up").click(); cap(pg, "Sign up validation: passwords must match", 2.2)
    pg.fill("input[placeholder='Confirm password']", PW); pg.wait_for_timeout(500)
    cap(pg, "New user signs up (JWT issued by the Express API)", 1.2); pg.get_by_role("button", name="Sign up").click()
    cap(pg, "Branded loader → skeleton → live data from GET /api/daily-streak", 1.8)
    pg.wait_for_selector("text=Claim reward"); cap(pg, "Backend decided: Day 1 is ready · streak, rewards, stats and wallet all come from MongoDB", 3)
    scroll(pg, 420); cap(pg, "Stats, Grand Reward (₹5 on Day 7) and 7 reward cards — all backend-configured", 2.6)
    scroll(pg, 800); cap(pg, "Card states are decided by the server: Today · Locked · Claimed · Missed", 2.6)
    scroll(pg, 0, 1.2)
    cap(pg, "Dark / Light mode toggle (preference is remembered)", 1.2); theme(pg); cap(pg, "Dark mode", 2); scroll(pg, 500); cap(pg, "Fully themed: cards, stats, countdown, modals", 2.2); scroll(pg, 0, 1); theme(pg)
    cap(pg, "Claim Day 1 → the CPA demo state appears (it does NOT grant the reward)", 1.2)
    pg.get_by_role("button", name="Claim reward").click(); pg.wait_for_selector("text=Preparing your reward"); pg.wait_for_timeout(2200)
    cap(pg, "Backend validates → credits wallet → writes transaction → UI refetches", 1.6)
    pg.wait_for_selector("text=Claimed"); cap(pg, "Day 1 ✓ Claimed · wallet 0 → 5 · next reward locked with a SERVER-driven countdown", 3.4)
    pg.reload(); pg.wait_for_selector("text=Claimed"); cap(pg, "Refresh → state persists (loaded from MongoDB, not React state)", 2.8)
    cap(pg, "Security tests against the live API", 0.8)
    r1 = raw(pg, "POST", "/daily-streak/claim", {"day": 7, "reward": 1000000, "streak": 7, "userId": "someoneElse"}); r2 = raw(pg, "POST", "/daily-streak/claim", {})
    r3 = raw(pg, "GET", "/daily-streak", None, ""); r4 = raw(pg, "GET", "/daily-streak", None, "forged.token.value")
    show(pg, ["① Fake day=7 + fake reward/streak/userId →", "   " + line(r1), "② Duplicate / early claim (timer not finished) →", "   " + line(r2),
              "③ No token →  " + line(r3), "④ Forged token →  " + line(r4)], 6.5)
    cap(pg, "Concurrency test: 6 simultaneous claims from one user", 0.8)
    t2 = register_api("Race User", f"race{tag}@v.in")
    rs = pg.evaluate("""async([u,t])=>Promise.all(Array.from({length:6},()=>fetch(u,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify({day:1})}).then(r=>r.status)))""", [API + "/daily-streak/claim", t2])
    show(pg, ["6 parallel POST /daily-streak/claim →", "   statuses: " + ", ".join(map(str, rs)), f"   successes: {rs.count(200)}   (expected exactly 1 — atomic update + unique index)"], 5.5)
    pg.get_by_role("button", name="History").click(); cap(pg, "Streak history — every claim has a reference ID tied to a wallet transaction", 3.2); pg.click('[aria-label="Close"]'); pg.wait_for_timeout(500)
    cap(pg, "Time passes: dev helper moves the last claim back 24h (device clock is irrelevant)", 1.4)
    raw(pg, "POST", "/dev/shift", {"hours": 24}); pg.reload(); pg.wait_for_selector("text=Ready to claim"); cap(pg, "Backend now says Day 2 is claimable", 2)
    pg.get_by_role("button", name="Claim reward").click(); pg.wait_for_timeout(3800); cap(pg, "Day 2 claimed: +10 VEs → wallet 15 · Day 3 locked with countdown", 3)
    cap(pg, "Missed-day test: user skips Day 3 and returns 60h later", 1.2)
    raw(pg, "POST", "/dev/shift", {"hours": 60}); pg.reload(); pg.wait_for_selector("text=has been reset")
    cap(pg, "Backend reset the streak → Day 1 available again", 3); scroll(pg, 700); theme(pg); cap(pg, "Day 3 is marked MISSED (shown here in dark mode)", 3.2); scroll(pg, 0, 1)
    pg.click('[aria-label="Log out"]'); pg.wait_for_selector("input[type=email]"); cap(pg, "Logout → login again with the same account", 1.8)
    typ(pg, "input[type=email]", EM); typ(pg, "input[type=password]", PW); pg.get_by_role("button", name="Log in").click(); pg.wait_for_selector("text=has been reset")
    cap(pg, "Streak state restored from MongoDB after re-login", 3); cap(pg, "Backend controls the streak. React controls the presentation.", 3)

with sync_playwright() as p:
    c = ctx_for(p, "desk", 1280, 720); pg = c.new_page()
    try: desktop(pg)
    except Exception as e: pg.screenshot(path="fail.png"); print("FAIL", e); raise
    finally: c.close()
print("desk ok")
