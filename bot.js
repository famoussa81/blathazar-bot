import { Client, GatewayIntentBits, Partials, PermissionsBitField, EmbedBuilder, SlashCommandBuilder, Routes, REST, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import 'dotenv/config';
import { runStealSetup, setupPreview } from './src/steal-an-egg/setup.js';

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID || "1541158872536842340";
const CLIENT_ID = process.env.CLIENT_ID || "1541159388155486228";
if(!TOKEN){ console.error("❌ DISCORD_TOKEN manquant dans .env"); process.exit(1); }
const ROLE_JOUEUR = "1541163433259696258";
const ROLE_MODO = "1541163441581199500";
const CHERCHE_ID = "1541163402230239294";
const GENERAL_ID = "1541163394999001119";
const BIENVENUE_ID = "1541158873304404122";
const REGLES_ID = "1541163370827481129";
const REGLES_MSG = "1541163453287370914";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.Reaction, Partials.User]
});

// === COMMANDES V2 - 20 COMMANDES ===
const commands = [
  new SlashCommandBuilder()
    .setName('setup-steal')
    .setDescription('[ADMIN] Configure le serveur Steal an Egg complet')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addStringOption(o => o.setName('action').setDescription('Prévisualiser ou appliquer').setRequired(true)
      .addChoices({ name: 'Preview', value: 'preview' }, { name: 'Apply', value: 'apply' }))
    .addBooleanOption(o => o.setName('archive_existing').setDescription('Déplacer les anciens salons dans une archive privée')),
  // GESTION PUISSANTE
  new SlashCommandBuilder().setName('annonce').setDescription('[MODO] Annonce + ping').addStringOption(o=>o.setName('titre').setDescription('Titre').setRequired(true)).addStringOption(o=>o.setName('message').setDescription('Message').setRequired(true)).addBooleanOption(o=>o.setName('ping').setDescription('Ping Joueur?')),
  new SlashCommandBuilder().setName('dmall').setDescription('[ADMIN] DM tout le serveur').addStringOption(o=>o.setName('message').setDescription('Message').setRequired(true)).addStringOption(o=>o.setName('confirmation').setDescription('CONFIRMER').setRequired(true)),
  new SlashCommandBuilder().setName('game').setDescription('[MODO] Game ce soir').addStringOption(o=>o.setName('heure').setDescription('21h').setRequired(true)).addStringOption(o=>o.setName('map').setDescription('Map').setRequired(false)).addStringOption(o=>o.setName('info').setDescription('Moddé/Chill').setRequired(false)),
  new SlashCommandBuilder().setName('ban').setDescription('[MODO] Ban').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison').setRequired(false)).addIntegerOption(o=>o.setName('jours').setDescription('Suppr msg jours 0-7').setRequired(false)),
  new SlashCommandBuilder().setName('kick').setDescription('[MODO] Kick').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison').setRequired(false)),
  new SlashCommandBuilder().setName('mute').setDescription('[MODO] Timeout').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addIntegerOption(o=>o.setName('minutes').setDescription('Minutes').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison').setRequired(false)),
  new SlashCommandBuilder().setName('unmute').setDescription('[MODO] Unmute').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)),
  new SlashCommandBuilder().setName('warn').setDescription('[MODO] Warn').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('raison').setDescription('Raison').setRequired(true)),
  new SlashCommandBuilder().setName('clear').setDescription('[MODO] Clear msgs').addIntegerOption(o=>o.setName('nombre').setDescription('1-100').setRequired(true)),
  new SlashCommandBuilder().setName('lock').setDescription('[MODO] Lock salon').addChannelOption(o=>o.setName('salon').setDescription('Salon').setRequired(false)),
  new SlashCommandBuilder().setName('unlock').setDescription('[MODO] Unlock').addChannelOption(o=>o.setName('salon').setDescription('Salon').setRequired(false)),
  new SlashCommandBuilder().setName('slowmode').setDescription('[MODO] Slowmode').addIntegerOption(o=>o.setName('secondes').setDescription('0-21600').setRequired(true)).addChannelOption(o=>o.setName('salon').setDescription('Salon').setRequired(false)),
  new SlashCommandBuilder().setName('role').setDescription('[MODO] Gère rôle').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addRoleOption(o=>o.setName('role').setDescription('Rôle').setRequired(true)).addStringOption(o=>o.setName('action').setDescription('add/remove').setRequired(true).addChoices({name:'add',value:'add'},{name:'remove',value:'remove'})),
  new SlashCommandBuilder().setName('nick').setDescription('[MODO] Change pseudo').addUserOption(o=>o.setName('membre').setDescription('Membre').setRequired(true)).addStringOption(o=>o.setName('pseudo').setDescription('Nouveau pseudo').setRequired(true)),
  new SlashCommandBuilder().setName('sondage').setDescription('[MODO] Sondage').addStringOption(o=>o.setName('question').setDescription('Question').setRequired(true)),
  new SlashCommandBuilder().setName('ticket').setDescription('[MODO] Panel tickets').addChannelOption(o=>o.setName('salon').setDescription('Salon panel').setRequired(false)),
  new SlashCommandBuilder().setName('backup').setDescription('[ADMIN] Backup serveur (JSON)'),
  // AMONG US
  new SlashCommandBuilder().setName('cherche').setDescription('Poster code').addStringOption(o=>o.setName('code').setDescription('Code').setRequired(true)).addStringOption(o=>o.setName('map').setDescription('Map').setRequired(false)).addIntegerOption(o=>o.setName('places').setDescription('Places').setRequired(false)),
  new SlashCommandBuilder().setName('lobby').setDescription('[MODO] Gère lobby vocal').addStringOption(o=>o.setName('action').setDescription('Action').setRequired(true).addChoices({name:'open',value:'open'},{name:'close',value:'close'},{name:'clear',value:'clear'},{name:'move-all',value:'move'})),
  new SlashCommandBuilder().setName('stats').setDescription('Stats serveur détaillées'),
  new SlashCommandBuilder().setName('top').setDescription('Top level/XP'),
  new SlashCommandBuilder().setName('help').setDescription('Aide complète'),
].map(c=>c.toJSON()).filter(c => process.env.ENABLE_LEGACY_AMONG_US === 'true' || !['game', 'cherche', 'lobby'].includes(c.name));

const rest = new REST({ version: '10' }).setToken(TOKEN);
async function deploy(){
  console.log(`Déploiement ${commands.length} commandes...`);
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  console.log(`✅ ${commands.length} commandes déployées`);
}
function isModo(m){ if(!m) return false; if(m.id==='1525984700018065452') return true; if(m.permissions.has(PermissionsBitField.Flags.Administrator)) return true; if(m.roles.cache.has(ROLE_MODO)) return true; return false; }
function isAdmin(m){ return m.permissions.has(PermissionsBitField.Flags.Administrator) || m.id==='1525984700018065452'; }

// === PERSISTANCE PUISSANTE ===
const DATA_DIR = process.env.DATA_DIR || path.resolve('bot-data');
try{ fs.mkdirSync(DATA_DIR, {recursive:true}); }catch{}
function loadMap(file, map){
  try{
    const p = path.join(DATA_DIR, file);
    if(fs.existsSync(p)){
      const j = JSON.parse(fs.readFileSync(p,'utf8'));
      for(const [k,v] of Object.entries(j)) map.set(k,v);
      console.log(`📂 Chargé ${file}: ${map.size} entrées`);
    }
  }catch(e){ console.log(`Load ${file} err`, e.message); }
}
function saveMap(file, map){
  try{
    const p = path.join(DATA_DIR, file);
    fs.writeFileSync(p, JSON.stringify(Object.fromEntries(map), null, 2));
  }catch(e){}
}
// Mémoires
const xp = new Map(); // userId -> {xp, lvl}
const warns = new Map(); // userId -> count
const joinTimes = []; // anti-raid
let logsChannelId = null;
loadMap('xp.json', xp);
loadMap('warns.json', warns);
loadMap('codes.json', new Map()); // test
// Auto-save toutes les 30s + auto-clean codes >2h
setInterval(()=>{
  saveMap('xp.json', xp);
  saveMap('warns.json', warns);
}, 30000);
setInterval(async ()=>{
  try{
    const g = client.guilds.cache.get(GUILD_ID);
    if(!g) return;
    const ch = g.channels.cache.get(CHERCHE_ID);
    if(!ch || !ch.isTextBased()) return;
    const msgs = await ch.messages.fetch({limit: 20});
    const now = Date.now();
    for(const [,m] of msgs){
      if(m.author.id===CLIENT_ID && now - m.createdTimestamp > 2*3600*1000){
        await m.delete().catch(()=>{});
        console.log(`🧹 Auto-clean code expiré ${m.id}`);
      }
    }
  }catch(e){}
}, 60000);
console.log(`💾 Persistance active: ${DATA_DIR}`);

async function getLogsChannel(guild){
  if(logsChannelId) return guild.channels.cache.get(logsChannelId);
  let ch = guild.channels.cache.find(c=>c.name.includes('logs'));
  if(!ch){
    try{
      ch = await guild.channels.create({name:'📜・logs', type: ChannelType.GuildText, parent: guild.channels.cache.get(GENERAL_ID)?.parentId, permissionOverwrites:[{id: guild.roles.everyone.id, deny:[PermissionsBitField.Flags.ViewChannel]}, {id: ROLE_MODO, allow:[PermissionsBitField.Flags.ViewChannel]}]});
      console.log('Logs channel créé', ch.id);
    }catch(e){ console.log('logs create fail', e.message); return null; }
  }
  logsChannelId = ch.id;
  return ch;
}
async function log(guild, embed){
  const ch = await getLogsChannel(guild);
  if(ch) ch.send({embeds:[embed]}).catch(()=>{});
}

client.once('clientReady', async ()=>{
  console.log(`🟢 BOT ULTRA V2 : ${client.user.tag} | ${client.guilds.cache.size} guilds`);
  const g = client.guilds.cache.get(GUILD_ID);
  if(g){
    console.log(`→ ${g.name} | ${g.memberCount} membres | ${g.channels.cache.size} salons`);
    await getLogsChannel(g);
  }
});

client.on('guildMemberAdd', async m=>{
  if(m.guild.id!==GUILD_ID) return;
  // anti-raid : 5 joins en 10s = lock
  joinTimes.push(Date.now());
  const recent = joinTimes.filter(t=>Date.now()-t<10000);
  if(recent.length>=5){
    const g=m.guild;
    g.channels.cache.forEach(ch=>{
      if(ch.isTextBased()) ch.permissionOverwrites.edit(g.roles.everyone, {SendMessages:false}).catch(()=>{});
    });
    log(g, new EmbedBuilder().setTitle('🚨 ANTI-RAID').setDescription(`5 arrivées en 10s - serveur verrouillé !`).setColor(0xFF0000));
  }
  // autorole + welcome
  try{ await m.roles.add(ROLE_JOUEUR); }catch{}
  const ch = m.guild.channels.cache.get(BIENVENUE_ID);
  if(ch) ch.send(`Bienvenue ${m} 👨‍🚀 ! Lis <#${REGLES_ID}> !`).catch(()=>{});
  log(m.guild, new EmbedBuilder().setTitle('📥 Arrivée').setDescription(`${m.user.tag} (${m.id})`).setColor(0x2ECC71).setTimestamp());
  setTimeout(()=>{ const idx=joinTimes.indexOf(recent[0]); if(idx>-1) joinTimes.splice(idx,1); },10000);
});
client.on('guildMemberRemove', m=>{
  if(m.guild.id!==GUILD_ID) return;
  log(m.guild, new EmbedBuilder().setTitle('📤 Départ').setDescription(`${m.user.tag}`).setColor(0xFF3B30).setTimestamp());
});
client.on('messageDelete', async msg=>{
  if(!msg.guild || msg.guild.id!==GUILD_ID || msg.author?.bot) return;
  log(msg.guild, new EmbedBuilder().setTitle('🗑️ Message supprimé').setDescription(`**${msg.author?.tag}** dans ${msg.channel}\n\`\`\`${(msg.content||'[embed/image]')?.slice(0,1000)}\`\`\``).setColor(0xFF3B30).setTimestamp());
});
client.on('messageUpdate', async (oldMsg, newMsg)=>{
  if(!newMsg.guild || newMsg.guild.id!==GUILD_ID || newMsg.author?.bot) return;
  if(oldMsg.content===newMsg.content) return;
  log(newMsg.guild, new EmbedBuilder().setTitle('✏️ Message édité').setDescription(`**${newMsg.author.tag}** dans ${newMsg.channel}\n**Avant:** ${oldMsg.content?.slice(0,500)}\n**Après:** ${newMsg.content?.slice(0,500)}`).setColor(0x0096FF).setTimestamp());
});
client.on('messageReactionAdd', async (reaction, user)=>{
  if(user.bot) return;
  try{
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.id===REGLES_MSG && reaction.emoji.name==='✅'){
      const g = reaction.message.guild;
      const member = await g.members.fetch(user.id);
      await member.roles.add(ROLE_JOUEUR);
      console.log(`Autorole Joueur -> ${user.tag}`);
    }
  }catch(e){}
});
client.on('messageCreate', async msg=>{
  if(msg.author.bot || !msg.guild || msg.guild.id!==GUILD_ID) return;
  // XP level
  const data = xp.get(msg.author.id) || {xp:0, lvl:0};
  data.xp += Math.floor(Math.random()*7)+5;
  const need = (data.lvl+1)*300;
  if(data.xp >= need){
    data.lvl++; data.xp=0;
    msg.channel.send(`🎉 ${msg.author} passe **niveau ${data.lvl}** !`).then(m=>setTimeout(()=>m.delete().catch(()=>{}),10000));
  }
  xp.set(msg.author.id, data);
  // AutoMod
  const c = msg.content.toLowerCase();
  const bad = ['ntm','fdp','connard','salope','pute','negro','nègre'];
  if(bad.some(w=>c.includes(w))){
    await msg.delete().catch(()=>{});
    const w = (warns.get(msg.author.id)||0)+1; warns.set(msg.author.id, w);
    msg.channel.send(`⚠️ ${msg.author} insulte → warn ${w}/3`).then(m=>setTimeout(()=>m.delete().catch(()=>{}),5000));
    if(w>=3) msg.member.timeout(10*60*1000,'3 warns').catch(()=>{});
    log(msg.guild, new EmbedBuilder().setTitle('🤬 AutoMod insulte').setDescription(`${msg.author.tag}: ${msg.content.slice(0,500)}`).setColor(0xFF0000));
    return;
  }
  if((c.includes('discord.gg')||c.includes('discord.com/invite')) && !isModo(msg.member)){
    await msg.delete().catch(()=>{}); msg.channel.send(`${msg.author} pas de pub !`).then(m=>setTimeout(()=>m.delete().catch(()=>{}),5000)); return;
  }
  // Spam
  if(!global._spam) global._spam=new Map();
  const now=Date.now(); const arr=global._spam.get(msg.author.id)||[]; arr.push(now);
  const rec=arr.filter(t=>now-t<5000); global._spam.set(msg.author.id, rec);
  if(rec.length>=5){ await msg.member.timeout(5*60*1000,'Spam').catch(()=>{}); msg.channel.send(`🔇 ${msg.author} spam → mute 5min`).then(m=>setTimeout(()=>m.delete().catch(()=>{}),8000)); global._spam.set(msg.author.id,[]); }
});

client.on('interactionCreate', async inter=>{
  if(inter.isButton()){
    if(inter.customId==='ticket_create'){
      const guild=inter.guild;
      const ch = await guild.channels.create({name:`🎫・ticket-${inter.user.username}`, type: ChannelType.GuildText, parent: guild.channels.cache.get(GENERAL_ID)?.parentId, permissionOverwrites:[
        {id: guild.roles.everyone.id, deny:[PermissionsBitField.Flags.ViewChannel]},
        {id: inter.user.id, allow:[PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]},
        {id: ROLE_MODO, allow:[PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]}
      ]});
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_close').setLabel('Fermer ticket').setStyle(ButtonStyle.Danger));
      await ch.send({content:`${inter.user} ticket ouvert ! <@&${ROLE_MODO}> arrive`, components:[row]});
      await inter.reply({content:`✅ Ticket créé : ${ch}`, ephemeral:true});
    }
    if(inter.customId==='ticket_close'){
      await inter.reply({content:'Fermeture dans 3s...'});
      setTimeout(()=> inter.channel.delete().catch(()=>{}),3000);
    }
    return;
  }
  if(!inter.isChatInputCommand() || inter.guildId!==GUILD_ID) return;
  if(inter.commandName==='setup-steal'){
    try{
      const action=inter.options.getString('action');
      if(action==='preview') return setupPreview(inter);
      return runStealSetup(inter, TOKEN);
    }catch(e){
      console.error('setup-steal', e);
      if(inter.replied||inter.deferred) return inter.editReply({content:`❌ Setup arrêté sans suppression: ${e.message}`, embeds:[]}).catch(()=>{});
      return inter.reply({content:`❌ Setup arrêté sans suppression: ${e.message}`, ephemeral:true}).catch(()=>{});
    }
  }
  const m = inter.member;
  try{
    if(inter.commandName==='annonce'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo only', ephemeral:true});
      const t=inter.options.getString('titre'), msg=inter.options.getString('message'), ping=inter.options.getBoolean('ping')??true;
      const e=new EmbedBuilder().setTitle(`📢 ${t}`).setDescription(msg).setColor(0xC51111).setFooter({text:`Par ${inter.user.tag}`}).setTimestamp();
      await inter.reply({content:'✅ Envoyé', ephemeral:true});
      const ch=inter.guild.channels.cache.get(GENERAL_ID);
      await ch.send({content: ping?`<@&${ROLE_JOUEUR}>`:'' , embeds:[e]});
      log(inter.guild, new EmbedBuilder().setTitle('📢 Annonce').setDescription(`Par ${inter.user.tag}: ${t}`).setColor(0xC51111));
    }
    else if(inter.commandName==='dmall'){
      if(!isAdmin(m)) return inter.reply({content:'❌ ADMIN only', ephemeral:true});
      const msg=inter.options.getString('message'), conf=inter.options.getString('confirmation');
      if(conf!=='CONFIRMER') return inter.reply({content:'Tape CONFIRMER', ephemeral:true});
      await inter.deferReply({ephemeral:true});
      await inter.guild.members.fetch();
      const targets=inter.guild.members.cache.filter(x=>!x.user.bot && x.roles.cache.has(ROLE_JOUEUR));
      let ok=0,fail=0;
      await inter.editReply(`📤 DM à ${targets.size} membres (1.2s/délai)...`);
      for(const [,mem] of targets){
        try{ await mem.send(`📩 **${inter.guild.name}**\n\n${msg}\n\n*DM staff - https://discord.gg/cpvXp3qHTm*`); ok++; }catch{ fail++; }
        await new Promise(r=>setTimeout(r,1200));
      }
      await inter.followUp({content:`✅ Fini: ${ok} OK, ${fail} fermés`, ephemeral:true});
      log(inter.guild, new EmbedBuilder().setTitle('📤 DMALL').setDescription(`Par ${inter.user.tag}: ${ok} OK`).setColor(0x9B59FF));
    }
    else if(inter.commandName==='game'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const h=inter.options.getString('heure'), map=inter.options.getString('map')||'Skeld', info=inter.options.getString('info')||'Chill';
      const e=new EmbedBuilder().setTitle(`🎮 GAME CE SOIR - ${h}`).setDescription(`**Map:** ${map}\n**Mode:** ${info}\n👉 <#${CHERCHE_ID}>\n👉 Vocal 🔊`).setColor(0x38FEDC).setThumbnail('https://cdn.akamai.steamstatic.com/steam/apps/945360/capsule_616x353.jpg').setFooter({text:`Host ${inter.user.tag}`}).setTimestamp();
      await inter.reply({content:`<@&${ROLE_JOUEUR}> 🔔`, embeds:[e]});
      try{
        const start=new Date(); const hh=parseInt(h); if(!isNaN(hh)){ start.setHours(hh,0,0,0); if(start<new Date()) start.setDate(start.getDate()+1); }
        await inter.guild.scheduledEvents.create({name:`Among Us ${map} ${h}`, scheduledStartTime:start, scheduledEndTime:new Date(start.getTime()+2*3600000), privacyLevel:2, entityType:3, entityMetadata:{location:'Vocal'}, description:info}).catch(()=>{});
      }catch{}
    }
    else if(inter.commandName==='cherche'){
      const code=inter.options.getString('code').toUpperCase(), map=inter.options.getString('map')||'Skeld', places=inter.options.getInteger('places')||0;
      const e=new EmbedBuilder().setTitle(`🔍 CODE: ${code}`).setDescription(`**Map:** ${map}\n**Places:** ${places?places+'/15':'Ouvert'}\n**Host:** ${inter.user}`).setColor(0x2ECC71).setTimestamp();
      const ch=inter.guild.channels.cache.get(CHERCHE_ID);
      await ch.send({content:`<@&${ROLE_JOUEUR}> Nouveau code !`, embeds:[e]});
      await inter.reply({content:`✅ Code ${code} posté`, ephemeral:true});
    }
    else if(inter.commandName==='ban'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const u=inter.options.getUser('membre'), r=inter.options.getString('raison')||'Aucune', d=inter.options.getInteger('jours')||0;
      await inter.guild.members.ban(u.id, {reason:r, deleteMessageDays:d}).catch(e=>{throw e});
      await inter.reply({embeds:[new EmbedBuilder().setTitle('🔨 BAN').setDescription(`${u.tag} banni - ${r}`).setColor(0xFF0000)]});
      log(inter.guild, new EmbedBuilder().setTitle('🔨 Ban').setDescription(`${u.tag} par ${inter.user.tag} - ${r}`).setColor(0xFF0000));
    }
    else if(inter.commandName==='kick'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const u=inter.options.getUser('membre'), r=inter.options.getString('raison')||'Aucune';
      const mem=await inter.guild.members.fetch(u.id); await mem.kick(r);
      await inter.reply({content:`👢 ${u.tag} kick - ${r}`});
    }
    else if(inter.commandName==='mute'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const u=inter.options.getUser('membre'), mins=inter.options.getInteger('minutes'), r=inter.options.getString('raison')||'Mute';
      const mem=await inter.guild.members.fetch(u.id); await mem.timeout(mins*60*1000, r);
      await inter.reply({content:`🔇 ${u.tag} mute ${mins}min`});
    }
    else if(inter.commandName==='unmute'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const u=inter.options.getUser('membre'); const mem=await inter.guild.members.fetch(u.id); await mem.timeout(null);
      await inter.reply({content:`🔊 ${u.tag} unmute`});
    }
    else if(inter.commandName==='warn'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const u=inter.options.getUser('membre'), r=inter.options.getString('raison');
      const c=(warns.get(u.id)||0)+1; warns.set(u.id,c);
      await inter.reply({content:`⚠️ ${u} warn ${c}/3 - ${r}`});
      if(c>=3){ const mem=await inter.guild.members.fetch(u.id).catch(()=>null); if(mem) await mem.timeout(10*60*1000,'3 warns').catch(()=>{}); }
      log(inter.guild, new EmbedBuilder().setTitle('⚠️ Warn').setDescription(`${u.tag} par ${inter.user.tag} - ${r} (${c}/3)`).setColor(0xFFA500));
    }
    else if(inter.commandName==='clear'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const n=inter.options.getInteger('nombre'); if(n<1||n>100) return inter.reply({content:'1-100',ephemeral:true});
      await inter.channel.bulkDelete(n,true); await inter.reply({content:`🧹 ${n} supprimés`, ephemeral:true});
    }
    else if(inter.commandName==='lock'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const ch=inter.options.getChannel('salon')||inter.channel; await ch.permissionOverwrites.edit(inter.guild.roles.everyone,{SendMessages:false}); await inter.reply({content:`🔒 ${ch} lock`});
    }
    else if(inter.commandName==='unlock'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const ch=inter.options.getChannel('salon')||inter.channel; await ch.permissionOverwrites.edit(inter.guild.roles.everyone,{SendMessages:null}); await inter.reply({content:`🔓 ${ch} unlock`});
    }
    else if(inter.commandName==='slowmode'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const s=inter.options.getInteger('secondes'), ch=inter.options.getChannel('salon')||inter.channel; await ch.setRateLimitPerUser(s); await inter.reply({content:`🐢 ${ch} slowmode ${s}s`});
    }
    else if(inter.commandName==='role'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const u=inter.options.getUser('membre'), r=inter.options.getRole('role'), act=inter.options.getString('action');
      const mem=await inter.guild.members.fetch(u.id);
      if(act==='add') await mem.roles.add(r); else await mem.roles.remove(r);
      await inter.reply({content:`${act==='add'?'✅':'❌'} ${r} ${act} à ${u.tag}`, ephemeral:true});
    }
    else if(inter.commandName==='nick'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const u=inter.options.getUser('membre'), pseudo=inter.options.getString('pseudo');
      const mem=await inter.guild.members.fetch(u.id); await mem.setNickname(pseudo);
      await inter.reply({content:`✏️ Pseudo ${u.tag} → ${pseudo}`});
    }
    else if(inter.commandName==='sondage'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const q=inter.options.getString('question');
      const e=new EmbedBuilder().setTitle('📊 SONDAGE').setDescription(q).setColor(0x0096FF).setFooter({text:`Par ${inter.user.tag}`});
      const msg=await inter.reply({embeds:[e], fetchReply:true}); await msg.react('✅'); await msg.react('❌'); await msg.react('🤷');
    }
    else if(inter.commandName==='ticket'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const ch=inter.options.getChannel('salon')||inter.channel;
      const e=new EmbedBuilder().setTitle('🎫 SUPPORT').setDescription('Clique pour ouvrir un ticket privé avec le staff').setColor(0x0096FF);
      const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_create').setLabel('Ouvrir ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫'));
      await ch.send({embeds:[e], components:[row]}); await inter.reply({content:`✅ Panel ticket dans ${ch}`, ephemeral:true});
    }
    else if(inter.commandName==='backup'){
      if(!isAdmin(m)) return inter.reply({content:'❌ ADMIN', ephemeral:true});
      const g=inter.guild;
      const data={name:g.name, roles:g.roles.cache.map(r=>({name:r.name,color:r.color})), channels:g.channels.cache.map(c=>({name:c.name,type:c.type,parent:c.parentId})), created: new Date().toISOString()};
      const buf=Buffer.from(JSON.stringify(data,null,2));
      await inter.reply({content:'💾 Backup JSON', files:[{attachment:buf, name:`backup-${g.id}.json`}]});
    }
    else if(inter.commandName==='lobby'){
      if(!isModo(m)) return inter.reply({content:'❌ Modo', ephemeral:true});
      const act=inter.options.getString('action'); const g=inter.guild;
      if(act==='open'){ g.channels.cache.filter(c=>c.type===2).forEach(c=>c.permissionOverwrites.edit(g.roles.everyone,{Connect:true}).catch(()=>{})); await inter.reply({content:'🔓 Lobbies ouverts'}); }
      else if(act==='close'){ g.channels.cache.filter(c=>c.type===2).forEach(c=>c.permissionOverwrites.edit(g.roles.everyone,{Connect:false}).catch(()=>{})); await inter.reply({content:'🔒 Lobbies fermés'}); }
      else if(act==='clear'){ const ch=inter.guild.channels.cache.filter(c=>c.type===2); for(const [,c] of ch){ for(const [,mem] of c.members) await mem.voice.disconnect().catch(()=>{}); } await inter.reply({content:'🧹 Vocaux vidés'}); }
      else if(act==='move'){ const vocs=[...g.channels.cache.filter(c=>c.type===2).values()]; if(vocs.length>=2){ const src=vocs[0], dst=vocs[1]; for(const [,mem] of src.members) await mem.voice.setChannel(dst).catch(()=>{}); await inter.reply({content:`↗️ Déplacés ${src.name} → ${dst.name}`}); } else await inter.reply({content:'Pas assez de vocaux'}); }
    }
    else if(inter.commandName==='stats'){
      const g=inter.guild; await g.members.fetch();
      const e=new EmbedBuilder().setTitle('📊 STATS ULTRA').setDescription(`**Membres:** ${g.memberCount}\n**Joueurs:** ${g.members.cache.filter(x=>x.roles.cache.has(ROLE_JOUEUR)).size}\n**Modos:** ${g.members.cache.filter(x=>x.roles.cache.has(ROLE_MODO)).size}\n**Salons:** ${g.channels.cache.size}\n**Boosts:** ${g.premiumSubscriptionCount}\n**Créé:** <t:${Math.floor(g.createdTimestamp/1000)}:R>\n**XP tracked:** ${xp.size} users\n**Warns:** ${warns.size}`).setColor(0x9B59FF);
      await inter.reply({embeds:[e]});
    }
    else if(inter.commandName==='top'){
      const sorted=[...xp.entries()].sort((a,b)=> b[1].lvl - a[1].lvl || b[1].xp - a[1].xp).slice(0,10);
      const desc= sorted.length? sorted.map(([id,d],i)=>`**${i+1}.** <@${id}> - lvl **${d.lvl}** (${d.xp}xp)`).join('\n') : 'Pas encore de XP';
      await inter.reply({embeds:[new EmbedBuilder().setTitle('🏆 TOP LEVEL').setDescription(desc).setColor(0xF1C40F)]});
    }
    else if(inter.commandName==='help'){
      const e=new EmbedBuilder().setTitle('🤖 BLATHAZAR V2 ULTRA').setDescription(
`**GESTION PUISSANTE (Modo/Admin):**
\`/annonce\` \`/game\` \`/dmall\` (ADMIN) \`/ban /kick /mute /unmute /warn\`
\`/clear /lock /unlock /slowmode /role /nick\`
\`/sondage /ticket /backup /lobby\`

**AMONG US (tous):**
\`/cherche\` \`/stats /top\`

**AUTO:** anti-raid, logs \`<#logs>\`, XP/level, autorole ✅, welcome, anti-spam/insulte/lien`).setColor(0x2ECC71);
      await inter.reply({embeds:[e], ephemeral:true});
    }
  }catch(e){
    console.error(e);
    if(inter.replied||inter.deferred) inter.followUp({content:`❌ ${e.message}`, ephemeral:true}).catch(()=>{});
    else inter.reply({content:`❌ ${e.message}`, ephemeral:true}).catch(()=>{});
  }
});

await deploy();
client.login(TOKEN);
