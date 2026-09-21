import fs from 'fs/promises';
import path from 'path';
import { ChannelType, EmbedBuilder, PermissionsBitField, REST } from 'discord.js';
import { BRAND, makeChannelSpecs, ONBOARDING, ROLE_SPECS } from './blueprint.js';

const P = PermissionsBitField.Flags;
const REASON = 'Blathazar Steal an Egg server setup';

const clean = value => value.toLowerCase().replace(/[^a-z0-9]/g, '');

async function snapshot(guild, rest) {
  let onboarding = null;
  try { onboarding = await rest.get(`/guilds/${guild.id}/onboarding`); } catch {}
  const data = {
    createdAt: new Date().toISOString(),
    guild: { id: guild.id, name: guild.name, description: guild.description, features: guild.features },
    roles: guild.roles.cache.filter(r => !r.managed).map(r => ({ id: r.id, name: r.name, position: r.position })),
    channels: guild.channels.cache.map(c => ({ id: c.id, name: c.name, type: c.type, parentId: c.parentId, position: c.position })),
    onboarding,
  };
  const dir = path.resolve(process.env.DATA_DIR || 'bot-data', 'snapshots');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${guild.id}-${Date.now()}.json`);
  await fs.writeFile(file, JSON.stringify(data, null, 2));
  return file;
}

async function roleUpsert(guild, spec) {
  let role = guild.roles.cache.find(r => !r.managed && clean(r.name) === clean(spec.name));
  const payload = { name: spec.name, color: spec.color, hoist: spec.hoist || false, mentionable: spec.mentionable || false, reason: REASON };
  role = role ? await role.edit(payload) : await guild.roles.create(payload);
  return role;
}

async function categoryUpsert(guild, spec) {
  let channel = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && clean(c.name) === clean(spec.name));
  const payload = { name: spec.name, type: ChannelType.GuildCategory, permissionOverwrites: spec.perms, reason: REASON };
  return channel ? channel.edit(payload) : guild.channels.create(payload);
}

async function textUpsert(guild, spec, parent) {
  let channel = guild.channels.cache.find(c => c.type === ChannelType.GuildText && clean(c.name) === clean(spec.name));
  const payload = {
    name: spec.name, type: ChannelType.GuildText, parent: parent.id, topic: spec.topic,
    rateLimitPerUser: spec.slowmode || 0, permissionOverwrites: spec.perms, reason: REASON,
  };
  return channel ? channel.edit(payload) : guild.channels.create(payload);
}

async function archiveOldChannels(guild, keepIds, staffRoleId, installerId) {
  let archive = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && clean(c.name) === clean('🗄️・ARCHIVES'));
  if (!archive) {
    archive = await guild.channels.create({
      name: '🗄️・ARCHIVES', type: ChannelType.GuildCategory, reason: REASON,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [P.ViewChannel] },
        { id: installerId, allow: [P.ViewChannel, P.ManageChannels] },
        { id: staffRoleId, allow: [P.ViewChannel, P.ReadMessageHistory] },
      ],
    });
  }
  keepIds.add(archive.id);
  const old = guild.channels.cache.filter(c => !keepIds.has(c.id) && c.id !== archive.id && !c.isThread());
  for (const [, channel] of old) {
    if (channel.type === ChannelType.GuildCategory) continue;
    await channel.setParent(archive.id, { lockPermissions: true, reason: REASON }).catch(() => null);
  }
  for (const [, channel] of old.filter(c => c.type === ChannelType.GuildCategory)) {
    if (channel.children.cache.size === 0) await channel.delete(REASON).catch(() => null);
  }
  return old.size;
}

const promptPayload = (roleIds, channelIds) => ONBOARDING.map(prompt => ({
  type: 0, title: prompt.title, single_select: false, required: false, in_onboarding: true,
  options: prompt.options.map(option => ({
    title: option.title, description: option.description,
    emoji_id: null, emoji_name: option.emoji, emoji_animated: false,
    role_ids: option.roleKeys.map(key => roleIds[key]),
    channel_ids: option.channelKeys.map(key => channelIds[key]),
  })),
}));

async function configureDiscord(rest, guild, channels, roleIds, channelIds) {
  await rest.patch(`/guilds/${guild.id}`, {
    reason: REASON,
    body: {
      ...(BRAND.name ? { name: BRAND.name } : {}),
      description: BRAND.description,
      features: [...new Set([...guild.features, 'COMMUNITY'])],
      rules_channel_id: channels.rules.id,
      public_updates_channel_id: channels.announcements.id,
      safety_alerts_channel_id: channels.modLogs.id,
      preferred_locale: 'en-US',
      verification_level: 1,
      explicit_content_filter: 2,
      default_message_notifications: 1,
    },
  });
  await rest.patch(`/guilds/${guild.id}/welcome-screen`, {
    reason: REASON,
    body: {
      enabled: true,
      description: 'Real-time Steal an Egg alerts. Choose your pings and get notified instantly.',
      welcome_channels: [
        { channel_id: channels.welcome.id, description: 'Start here and choose your alerts', emoji_id: null, emoji_name: '👋' },
        { channel_id: channels.rules.id, description: 'Read the short safety rules', emoji_id: null, emoji_name: '📜' },
        { channel_id: channels.eggNotifier.id, description: 'Live rare egg alerts', emoji_id: null, emoji_name: '🥚' },
        { channel_id: channels.riftNotifier.id, description: 'Live Rift alerts', emoji_id: null, emoji_name: '🌀' },
        { channel_id: channels.help.id, description: 'Get notifier help', emoji_id: null, emoji_name: '❓' },
      ],
    },
  });
  const defaults = ['welcome', 'rules', 'announcements', 'commands', 'help', 'bugs', 'suggestions', 'feedback'];
  await rest.put(`/guilds/${guild.id}/onboarding`, {
    reason: REASON,
    body: {
      prompts: promptPayload(roleIds, channelIds),
      default_channel_ids: defaults.map(key => channelIds[key]),
      enabled: true,
      mode: 1,
    },
  });
}

function welcomeEmbed(guildName) {
  return new EmbedBuilder().setColor(BRAND.color).setTitle(`🥚 Welcome to ${BRAND.name || guildName}`)
    .setDescription('Get fast, clean and customizable **Steal an Egg** alerts. Open **Channels & Roles** and choose exactly what should ping you.')
    .addFields(
      { name: '1・Choose your alerts', value: 'Select Rift, rarity, MPS and specific-pet pings.' },
      { name: '2・Enable role mentions', value: 'You will only receive the notifications you selected.' },
      { name: '3・Join quickly', value: 'Use the notifier join information as soon as a valuable spawn appears.' },
    ).setFooter({ text: 'Blathazar • STEAL-EGG-WELCOME' });
}

function rulesEmbed() {
  return new EmbedBuilder().setColor(BRAND.color).setTitle('📜 Rules & account safety').setDescription([
    '**1.** No scams, fake links or misleading alerts.',
    '**2.** Never share your Roblox cookie, Discord token or password.',
    '**3.** No spam, mass mentions, harassment or NSFW content.',
    '**4.** Keep support channels related to the notifier.',
    '**5.** Discord and Roblox Terms of Service always apply.',
    '',
    'Staff will **never** ask for your password or authentication cookie.',
  ].join('\n')).setFooter({ text: 'Blathazar • STEAL-EGG-RULES' });
}

async function ensureEmbed(channel, marker, embed) {
  const messages = await channel.messages.fetch({ limit: 25 });
  const old = messages.find(m => m.author.id === channel.client.user.id && m.embeds.some(e => e.footer?.text?.includes(marker)));
  const message = old ? await old.edit({ embeds: [embed] }) : await channel.send({ embeds: [embed] });
  await message.pin().catch(() => null);
}

export async function setupPreview(interaction) {
  const senzRole = interaction.guild.roles.cache.find(r => r.managed && /senz/i.test(r.name));
  return interaction.reply({
    ephemeral: true,
    embeds: [new EmbedBuilder().setColor(BRAND.color).setTitle('🥚 Steal an Egg setup preview')
      .setDescription('Blathazar will configure the server without deleting messages, roles or members.')
      .addFields(
        { name: 'Structure', value: `${ROLE_SPECS.length} synchronized roles • 5 categories • 17 text channels` },
        { name: 'Onboarding', value: 'Rifts • general notifications • rarity • MPS • specific pets' },
        { name: 'Existing channels', value: interaction.options.getBoolean('archive_existing') ? 'Moved to a private archive; nothing is permanently deleted.' : 'Preserved in their current position.' },
        { name: 'Senz V2', value: senzRole ? `Detected: <@&${senzRole.id}>` : 'Not detected automatically. Its output channels can still be selected afterward.' },
        { name: 'Apply', value: 'Run `/setup-steal action:apply` when ready.' },
      )],
  });
}

export async function runStealSetup(interaction, token) {
  if (!interaction.memberPermissions?.has(P.Administrator)) return interaction.reply({ content: '❌ Administrator only.', ephemeral: true });
  const installer = await interaction.guild.members.fetchMe();
  if (!installer.permissions.has(P.Administrator)) return interaction.reply({ content: '❌ Blathazar needs Administrator temporarily to enable Community and onboarding.', ephemeral: true });
  if (!interaction.deferred) await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild;
  const rest = new REST({ version: '10' }).setToken(token);
  await guild.roles.fetch();
  await guild.channels.fetch();
  const backupFile = await snapshot(guild, rest);
  await interaction.editReply('⏳ Creating notification roles…');

  const roleIds = {};
  for (const spec of ROLE_SPECS) roleIds[spec.key] = (await roleUpsert(guild, spec)).id;
  const senzRole = process.env.SENZ_ROLE_ID
    ? guild.roles.cache.get(process.env.SENZ_ROLE_ID)
    : guild.roles.cache.find(r => r.managed && /senz/i.test(r.name));
  const specs = makeChannelSpecs({
    everyoneId: guild.roles.everyone.id, installerId: installer.id,
    notifierRoleId: senzRole?.id, staffRoleId: roleIds.staff,
  });

  const channelIds = {};
  const channels = {};
  const keepIds = new Set();
  for (const categorySpec of specs) {
    const category = await categoryUpsert(guild, categorySpec);
    channelIds[categorySpec.key] = category.id; channels[categorySpec.key] = category; keepIds.add(category.id);
    for (const childSpec of categorySpec.children) {
      const child = await textUpsert(guild, { ...childSpec, perms: childSpec.perms || categorySpec.perms }, category);
      channelIds[childSpec.key] = child.id; channels[childSpec.key] = child; keepIds.add(child.id);
    }
  }

  await interaction.editReply('⏳ Configuring Community, welcome screen and onboarding…');
  await configureDiscord(rest, guild, channels, roleIds, channelIds);
  await ensureEmbed(channels.welcome, 'STEAL-EGG-WELCOME', welcomeEmbed(guild.name));
  await ensureEmbed(channels.rules, 'STEAL-EGG-RULES', rulesEmbed());

  let archived = 0;
  if (interaction.options.getBoolean('archive_existing')) {
    archived = await archiveOldChannels(guild, keepIds, roleIds.staff, installer.id);
  }
  await channels.botLogs.send({
    embeds: [new EmbedBuilder().setColor(0x22c55e).setTitle('✅ Steal an Egg setup completed')
      .setDescription(`Configured by <@${interaction.user.id}>. Snapshot: \`${path.basename(backupFile)}\``)
      .addFields({ name: 'Senz V2', value: senzRole ? `Detected: <@&${senzRole.id}>` : 'Not detected — run its own configuration command once.' })
      .setTimestamp()],
  });

  return interaction.editReply({
    content: '',
    embeds: [new EmbedBuilder().setColor(0x22c55e).setTitle('✅ Server configured successfully')
      .setDescription('Roles, channels, permissions, Community settings, welcome screen and onboarding are ready.')
      .addFields(
        { name: 'Existing content', value: archived ? `${archived} old channels/categories processed into the private archive.` : 'Preserved.' },
        { name: 'Senz V2', value: senzRole ? 'Detected and authorized in notifier channels.' : 'Run `/steal-an-egg-config` once and select the new channels.' },
        { name: 'Security', value: 'The pre-setup structure was saved before any changes.' },
      )],
  });
}
