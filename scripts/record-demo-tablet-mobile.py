src = open("rec2.py").read().split("def desktop")[0]; exec(src)
def tablet(pg):
    pg.goto(U + "/daily-streak"); pg.wait_for_selector("text=Next reward unlocks in"); cap(pg, "Tablet layout (768px) · dark mode · live countdown from the server clock", 3)
    scroll(pg, 420); cap(pg, "Stats + Grand Reward + 4-column reward grid", 2.4); scroll(pg, 900); cap(pg, "Locked days show the countdown · claimed days are marked", 2.6)
    scroll(pg, 0, 1); theme(pg); cap(pg, "Switch to light mode on tablet", 2.2); scroll(pg, 600); cap(pg, "No overlap, no horizontal scrolling at any width (tested 320–1920px)", 2.8)
def mobile(pg):
    pg.goto(U + "/daily-streak"); pg.wait_for_selector("text=Claim reward"); cap(pg, "Mobile layout (390px) · light mode", 2.4)
    scroll(pg, 360); cap(pg, "2-column reward cards · Day 7 spans full width", 2.4); scroll(pg, 0, 1)
    theme(pg); cap(pg, "Dark mode on mobile", 2); pg.get_by_role("button", name="Claim reward").click(); pg.wait_for_selector("text=Preparing your reward")
    cap(pg, "Claim → CPA demo state", 2.4); pg.wait_for_selector("text=Claimed"); cap(pg, "Claimed ✓ · countdown to the next reward", 2.8)
    scroll(pg, 700); cap(pg, "Reward cards after claim", 2.4); scroll(pg, 3000); cap(pg, "Why keep your streak + trust footer", 2.4)
with sync_playwright() as p:
    t1 = register_api("Tab User", f"tab{tag}@v.in"); claim_api(t1); c = ctx_for(p, "tab", 768, 1024, t1, "dark"); pg = c.new_page(); tablet(pg); c.close()
    t2 = register_api("Mob User", f"mob{tag}@v.in"); c = ctx_for(p, "mob", 390, 780, t2, "light"); pg = c.new_page(); mobile(pg); c.close()
print("tab+mob ok")
