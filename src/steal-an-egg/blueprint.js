import { ChannelType, PermissionsBitField } from 'discord.js';

const P = PermissionsBitField.Flags;

export const BRAND = {
  name: process.env.SERVER_NAME?.trim() || null,
  description: process.env.SERVER_DESCRIPTION || 'Real-time Steal an Egg alerts for rare eggs, Rifts and special events.',
  color: 0x8b5cf6,
};

export const ROLE_SPECS = [
  { key: 'staff', name: '🛡️・Staff', color: 0x5865f2, hoist: true },
  { key: 'updates', name: '❗ Update Ping', color: 0xef4444 },
  { key: 'adminAbuse', name: '🔔 Admin Abuse Ping', color: 0xf97316 },
  { key: 'leaks', name: '👀 Leak Ping', color: 0x38bdf8 },
  { key: 'riftBoss', name: '🌀 Rift Boss Ping', color: 0x7c3aed },
  { key: 'riftBorn', name: '🌌 Rift Born Egg Ping', color: 0x8b5cf6 },
  { key: 'riftBeasts', name: '🐉 Rift Beasts Egg Ping', color: 0xa855f7 },
  { key: 'shatteredRift', name: '💥 Shattered Rift Egg Ping', color: 0xc084fc },
  { key: 'secret', name: '⚫ Secret Egg Ping', color: 0x2b2d31 },
  { key: 'eternal', name: '🟣 Eternal Egg Ping', color: 0x9333ea },
  { key: 'divine', name: '🟡 Divine Egg Ping', color: 0xfacc15 },
  { key: 'mps1m50m', name: '💵 1M–50M/s', color: 0x22c55e },
  { key: 'mps50m100m', name: '💵 50M–100M/s', color: 0x16a34a },
  { key: 'mps100m500m', name: '💰 100M–500M/s', color: 0xeab308 },
  { key: 'mps500m1b', name: '💰 500M–1B/s', color: 0xf59e0b },
  { key: 'mps1b', name: '💎 1B+/s', color: 0x06b6d4 },
  { key: 'archAngel', name: '👼 Arch Angel Ping', color: 0xfde68a },
  { key: 'worldBurner', name: '🔥 World Burner Ping', color: 0xdc2626 },
  { key: 'nightflame', name: '🌑 Nightflame Ping', color: 0x312e81 },
  { key: 'pegasus', name: '🪽 Pegasus Ping', color: 0xe0e7ff },
  { key: 'skeletonHorse', name: '💀 Skeleton Horse Ping', color: 0x64748b },
  { key: 'lunarDragon', name: '🐲 Eternal Lunar Dragon Ping', color: 0x6366f1 },
].map(role => ({ ...role, mentionable: role.key !== 'staff' }));

const readonly = (everyone, installer, notifier) => [
  { id: everyone, allow: [P.ViewChannel, P.ReadMessageHistory], deny: [P.SendMessages, P.CreatePublicThreads, P.CreatePrivateThreads] },
  { id: installer, allow: [P.ViewChannel, P.SendMessages, P.EmbedLinks, P.AttachFiles, P.ReadMessageHistory, P.ManageMessages, P.MentionEveryone] },
  ...(notifier ? [{ id: notifier, allow: [P.ViewChannel, P.SendMessages, P.EmbedLinks, P.AttachFiles, P.ReadMessageHistory, P.MentionEveryone] }] : []),
];

const writable = (everyone, installer) => [
  { id: everyone, allow: [P.ViewChannel, P.SendMessages, P.ReadMessageHistory], deny: [P.CreatePublicThreads, P.CreatePrivateThreads] },
  { id: installer, allow: [P.ViewChannel, P.SendMessages, P.EmbedLinks, P.AttachFiles, P.ReadMessageHistory, P.ManageMessages] },
];

const privateStaff = (everyone, installer, staff) => [
  { id: everyone, deny: [P.ViewChannel] },
  { id: installer, allow: [P.ViewChannel, P.SendMessages, P.EmbedLinks, P.ReadMessageHistory, P.ManageMessages] },
  { id: staff, allow: [P.ViewChannel, P.SendMessages, P.ReadMessageHistory, P.ManageMessages] },
];

export function makeChannelSpecs({ everyoneId, installerId, notifierRoleId, staffRoleId }) {
  return [
    {
      key: 'info', name: '📌・SERVER INFO', type: ChannelType.GuildCategory,
      children: [
        { key: 'welcome', name: '👋・welcome', topic: 'Start here and choose your Steal an Egg alerts.', perms: readonly(everyoneId, installerId, notifierRoleId) },
        { key: 'rules', name: '📜・rules', topic: 'Short rules and account-safety information.', perms: readonly(everyoneId, installerId, notifierRoleId) },
        { key: 'announcements', name: '📢・announcements', topic: 'Important service and game updates.', perms: readonly(everyoneId, installerId, notifierRoleId) },
      ],
    },
    {
      key: 'notifiers', name: '📡・NOTIFIERS', type: ChannelType.GuildCategory,
      children: [
        { key: 'eggNotifier', name: '🥚・egg-notifier', topic: 'Live rare egg and pet detections.', perms: readonly(everyoneId, installerId, notifierRoleId) },
        { key: 'riftNotifier', name: '🌀・rift-notifier', topic: 'Live Rift, Rift Boss and Rift Machine alerts.', perms: readonly(everyoneId, installerId, notifierRoleId) },
        { key: 'adminAbuse', name: '✨・admin-abuse', topic: 'Admin Abuse and special-event alerts.', perms: readonly(everyoneId, installerId, notifierRoleId) },
        { key: 'leaks', name: '👀・leaks', topic: 'Verified leaks and previews only.', perms: readonly(everyoneId, installerId, notifierRoleId) },
      ],
    },
    {
      key: 'tracker', name: '📊・TRACKER', type: ChannelType.GuildCategory,
      children: [
        { key: 'lastSeen', name: '🕒・last-seen', topic: 'Latest detected eggs and pets.', perms: readonly(everyoneId, installerId, notifierRoleId) },
        { key: 'predictions', name: '🔮・egg-predictions', topic: 'Estimated spawn timings and predictions.', perms: readonly(everyoneId, installerId, notifierRoleId) },
      ],
    },
    {
      key: 'support', name: '🧰・SUPPORT', type: ChannelType.GuildCategory,
      children: [
        { key: 'commands', name: '🤖・bot-commands', topic: 'Bot commands only.', perms: writable(everyoneId, installerId), slowmode: 5 },
        { key: 'help', name: '❓・help', topic: 'Help with pings and notifier settings.', perms: writable(everyoneId, installerId), slowmode: 10 },
        { key: 'bugs', name: '🐛・bug-reports', topic: 'Report missing or inaccurate alerts.', perms: writable(everyoneId, installerId), slowmode: 30 },
        { key: 'suggestions', name: '💡・suggestions', topic: 'Suggest notifier improvements.', perms: writable(everyoneId, installerId), slowmode: 30 },
        { key: 'feedback', name: '📨・notifier-feedback', topic: 'Share feedback about alert quality.', perms: writable(everyoneId, installerId), slowmode: 30 },
      ],
    },
    {
      key: 'staff', name: '🔒・STAFF', type: ChannelType.GuildCategory,
      perms: privateStaff(everyoneId, installerId, staffRoleId),
      children: [
        { key: 'staffChat', name: '💬・staff-chat', topic: 'Private staff coordination.' },
        { key: 'botLogs', name: '🤖・bot-logs', topic: 'Blathazar and notifier logs.' },
        { key: 'modLogs', name: '📋・mod-logs', topic: 'Moderation and security logs.' },
      ],
    },
  ];
}

const option = (title, description, emoji, roleKeys, channelKeys) => ({ title, description, emoji, roleKeys, channelKeys });

export const ONBOARDING = [
  {
    title: 'Choose the Rift pings you would like to receive!',
    options: [
      option('Rift Boss', 'Rift openings and boss availability.', '🌀', ['riftBoss'], ['riftNotifier']),
      option('Rift Born Egg', 'Rift Born egg alerts.', '🌌', ['riftBorn'], ['riftNotifier']),
      option('Rift Beasts Egg', 'Rift Beasts egg alerts.', '🐉', ['riftBeasts'], ['riftNotifier']),
      option('Shattered Rift Egg', 'Shattered Rift egg alerts.', '💥', ['shatteredRift'], ['riftNotifier']),
    ],
  },
  {
    title: 'Choose the general notifications you want!',
    options: [
      option('Admin Abuse', 'Special admin-hosted events.', '🔔', ['adminAbuse'], ['adminAbuse']),
      option('Updates', 'Important game and notifier updates.', '❗', ['updates'], ['announcements']),
      option('Leaks', 'Verified previews and leaks.', '👀', ['leaks'], ['leaks']),
    ],
  },
  {
    title: 'Choose the egg rarities you want to be pinged for!',
    options: [
      option('Secret Egg', 'Receive Secret egg alerts.', '⚫', ['secret'], ['eggNotifier']),
      option('Eternal Egg', 'Receive Eternal egg alerts.', '🟣', ['eternal'], ['eggNotifier']),
      option('Divine Egg', 'Receive Divine egg alerts.', '🟡', ['divine'], ['eggNotifier']),
    ],
  },
  {
    title: 'Choose the Money-Per-Second ranges you want!',
    options: [
      option('1M–50M/s', 'Entry high-value alerts.', '💵', ['mps1m50m'], ['eggNotifier']),
      option('50M–100M/s', 'Strong-value alerts.', '💵', ['mps50m100m'], ['eggNotifier']),
      option('100M–500M/s', 'Very high-value alerts.', '💰', ['mps100m500m'], ['eggNotifier']),
      option('500M–1B/s', 'Elite-value alerts.', '💰', ['mps500m1b'], ['eggNotifier']),
      option('1B+/s', 'Only the biggest detections.', '💎', ['mps1b'], ['eggNotifier']),
    ],
  },
  {
    title: 'Choose any specific pets you want to follow!',
    options: [
      option('Arch Angel', 'Ping when Arch Angel is detected.', '👼', ['archAngel'], ['eggNotifier']),
      option('World Burner', 'Ping when World Burner is detected.', '🔥', ['worldBurner'], ['eggNotifier']),
      option('Nightflame', 'Ping when Nightflame is detected.', '🌑', ['nightflame'], ['eggNotifier']),
      option('Pegasus', 'Ping when Pegasus is detected.', '🪽', ['pegasus'], ['eggNotifier']),
      option('Skeleton Horse', 'Ping when Skeleton Horse is detected.', '💀', ['skeletonHorse'], ['eggNotifier']),
      option('Eternal Lunar Dragon', 'Ping when Eternal Lunar Dragon is detected.', '🐲', ['lunarDragon'], ['eggNotifier']),
    ],
  },
];
