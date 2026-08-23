# Blathazar — Bot Discord Among Us ULTRA

Bot le plus puissant pour gérer un serveur Discord + serveur Among Us (20 max, scalable 1000+). 
Créé pour `among us` (ID: 1541158872536842340) — 22 commandes slash, AutoMod, tickets, logs, XP, anti-raid.

**Invite actuelle :** https://discord.gg/cpvXp3qHTm  
**Bot :** `blathazar#8002` (ID 1541159388155486228)

## ✨ Features

**Gestion puissante (Modo/Admin)**
- `/annonce`, `/game`, `/dmall` (DM masse safe 1.2s), `/ban`, `/kick`, `/mute`, `/unmute`, `/warn` (3 warns = timeout), `/clear`, `/lock`, `/unlock`, `/slowmode`, `/role`, `/nick`, `/sondage`, `/ticket`, `/backup`, `/lobby`

**Among Us**
- `/cherche code:ABCDEF map:Skeld` → poste + ping @Joueur dans #cherche-partie
- `/game heure:21h` → annonce + event vocal auto
- `/lobby open/close/clear/move-all` → gère les vocaux

**Auto**
- Anti-raid (5 joins/10s = lock), anti-spam, anti-lien, anti-insulte
- Logs `#📜・logs` (delete/edit/join/leave), autorole ✅, welcome, XP/level, auto-clean codes >2h, persistance `bot-data/`

## 🚀 Install (0€)

```bash
# 1. Clone
git clone https://github.com/famoussa81/blathazar-bot.git
cd blathazar-bot
pnpm install # ou npm install

# 2. Config
cp .env.example .env
# édite .env avec ton DISCORD_TOKEN (https://discord.com/developers/applications)

# 3. Lance
pnpm start # node bot.js
# ou pm2
pnpm add -g pm2
pm2 start bot.js --name blathazar
pm2 logs blathazar
```

## 🔑 .env

```
DISCORD_TOKEN=MTU0...
GUILD_ID=1541158872536842340
CLIENT_ID=1541159388155486228
```

## 📋 Commandes (22)

| Commande | Permission |
|---|---|
| /annonce, /game, /dmall, /ban, /kick, /mute, /unmute, /warn, /clear, /lock, /unlock, /slowmode, /role, /nick, /sondage, /ticket, /backup, /lobby | Modo/Admin |
| /cherche, /stats, /top, /help | Tous |

Seul `Modo`/`Admin` peut lancer les commandes puissantes.

## 🏗️ Architecture serveur

```
📋・ACCUEIL → 👋・bienvenue, 📜・règles
💬・TEXTE → 💬・général, 🔍・cherche-partie, 🤣・clips
🔊・VOCAL → 🔊・Lobby 1 (15), 🔊・Lobby 2 (15)
📜・logs (privé Modo)
```

## 🔒 Sécurité

- Token jamais commité (`.env` ignoré)
- `ADMIN` (8) mais check `isModo` sur chaque commande
- DM masse avec `CONFIRMER` + délai 1.2s + skip DM fermés

## 📄 Licence

MIT — Fork libre.
