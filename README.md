# Blathazar — Steal an Egg Server Manager

Bot de gestion existant enrichi d'un installateur complet pour un serveur **Steal an Egg Notifier**. Il conserve les outils de modération utiles et peut créer/synchroniser les rôles, salons, permissions, Community, Welcome Screen et onboarding avec une seule commande.

**Invite actuelle :** https://discord.gg/cpvXp3qHTm  
**Bot :** `blathazar#8002` (ID 1541159388155486228)

## ✨ Features

**Steal an Egg — setup premium**
- `/setup-steal action:preview` affiche exactement ce qui sera configuré
- `/setup-steal action:apply archive_existing:true` configure le serveur et range les anciens salons dans une archive privée
- 25 rôles de notifications : raretés, MPS, Rifts, expériences et pets précis
- 21 salons : alertes, Ping Center, last-seen, Dr. Scramble, guides, FAQ, aide Senz V2 et staff
- onboarding à cinq questions et 24 choix inspiré du serveur notifier de référence
- Welcome Screen, messages d'accueil, règlement et permissions propres
- détection automatique du rôle géré de Senz V2
- snapshot JSON avant modification et fonctionnement idempotent sans doublons

**Gestion puissante (Modo/Admin)**
- `/annonce`, `/game`, `/dmall` (DM masse safe 1.2s), `/ban`, `/kick`, `/mute`, `/unmute`, `/warn` (3 warns = timeout), `/clear`, `/lock`, `/unlock`, `/slowmode`, `/role`, `/nick`, `/sondage`, `/ticket`, `/backup`, `/lobby`

**Among Us**
- `/cherche code:ABCDEF map:Skeld` → poste + ping @Joueur dans #cherche-partie
- `/game heure:21h` → annonce + event vocal auto
- `/lobby open/close/clear/move-all` → gère les vocaux

Ces trois commandes historiques sont masquées par défaut. Mets `ENABLE_LEGACY_AMONG_US=true` pour les réactiver.

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
SERVER_NAME=Steal an Egg Notifier
SERVER_DESCRIPTION=Real-time Steal an Egg alerts for rare eggs, Rifts and special events.
ENABLE_LEGACY_AMONG_US=false
ENABLE_PRIVILEGED_INTENTS=false
```

Ne mets jamais le token dans GitHub ou dans un message.

Laisse `ENABLE_PRIVILEGED_INTENTS=false` tant que **Server Members Intent** et **Message Content Intent** ne sont pas activés dans le Discord Developer Portal. Le setup Steal an Egg n'en dépend pas.

## 🥚 Configurer le serveur Steal an Egg

Une fois la nouvelle version déployée et Blathazar en ligne :

1. Lance `/setup-steal action:preview archive_existing:true`.
2. Vérifie le résumé privé.
3. Lance `/setup-steal action:apply archive_existing:true`.
4. Dans Senz V2, lance `/steal-an-egg-config` une seule fois et sélectionne les nouveaux salons.

Blathazar ne supprime aucun message, membre ou rôle existant. Avec `archive_existing:true`, les anciens salons sont déplacés dans `🗄️・ARCHIVES`, visible uniquement du staff.

## 🚀 Déploiement Katabump

Katabump garde déjà le bot en ligne : inutile d'ajouter PM2 à l'intérieur de son panel. Après fusion de la pull request :

1. Arrête temporairement Blathazar depuis le panel Katabump.
2. Mets à jour les fichiers depuis GitHub (ou utilise `git pull` dans la console si le dépôt est cloné).
3. Vérifie que le vrai fichier `.env` conserve `DISCORD_TOKEN`, `GUILD_ID` et `CLIENT_ID`.
4. Ajoute `SERVER_NAME=Steal an Egg Notifier` et `ENABLE_LEGACY_AMONG_US=false`.
5. Lance `npm install`, puis garde la commande de démarrage `npm start`.
6. Redémarre le service et vérifie les logs avant d'utiliser `/setup-steal`.

Ne remplace jamais le vrai `.env` par `.env.example` : ce dernier ne contient que des exemples.

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
