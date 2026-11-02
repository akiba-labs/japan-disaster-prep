# Japan Disaster Prep Check

Free household checklist for the emergency request (事前防災徹底のための緊急要請) issued by Japan's Disaster Management Agency (防災庁) on 2026-11-02: water (3 L per person per day), meals and portable-toilet uses (5 per person per day) for 3 days or a week, the gap against what you already have, the old quake standard (旧耐震, 建築確認 before 1981-06-01) check, and the five-point to-do list. English + Japanese.

Live: https://japan-disaster-prep.vercel.app

- API: `GET /api/check?adults=2&children=2&days=7&builtYear=1979&buildingType=wood` (keyless, CORS open), `/api/rules`, `/openapi.json`, `/llms.txt`
- MCP: `japan_disaster_prep_check` on https://free-agent-tools.vercel.app/mcp

Sources: the 緊急要請 text (Sankei / FNN), PM's Office 災害への備え, 防災庁 広報ぼうさい (toilet stock), MLIT 耐震化 and 新耐震木造住宅検証法, MoE pet disaster pamphlet, MAFF 家庭備蓄ポータル, GSI hazard map portal. Rules as of 2026-11-02.

**Disclaimer:** educational, not official and not engineering or safety advice; not affiliated with 防災庁 or any government body. It doesn't inspect buildings or predict disasters. Follow official alerts and your city.
