import { TeamMember, SpecCategory, CoreValue, CommunityChannel, RomItem, FAQItem } from '../shared/types';

export const SPEC_CATEGORIES: SpecCategory[] = [
  {
    id: 'display',
    title: 'Display',
    tagline: '6.79" FHD+ IPS LCD, 90Hz',
    highlights: [
      { label: 'Screen Size', value: '6.79" FHD+', description: '1080 × 2460 pixels resolution with ~396 ppi density' },
      { label: 'Refresh Rate', value: '90Hz', description: 'AdaptiveSync dynamic refresh rate support' },
      { label: 'Panel Type', value: 'IPS LCD', description: 'Large immersive screen with rich contrast' },
      { label: 'Protection', value: 'Gorilla Glass', description: 'Corning Gorilla Glass front protection' }
    ],
    details: '6.79-inch FHD+ (1080 × 2460) IPS LCD display featuring a 90Hz AdaptiveSync refresh rate and Corning Gorilla Glass protection for smooth scrolling and reliable daily durability.'
  },
  {
    id: 'performance',
    title: 'Processor & GPU',
    tagline: 'Snapdragon 4 Gen 2 (4nm) + Adreno 613',
    highlights: [
      { label: 'Processor', value: 'Snapdragon 4 Gen 2', description: 'Qualcomm SM4450 4nm octa-core architecture' },
      { label: 'CPU Cores', value: '2x 2.20GHz + 6x 1.95GHz', description: 'Cortex-A78 & Cortex-A55 performance cores' },
      { label: 'GPU', value: 'Adreno 613', description: 'Qualcomm Adreno graphics processing unit' },
      { label: 'Network', value: '5G Dual SIM', description: 'High-speed 5G cellular connectivity' }
    ],
    details: 'Powered by Qualcomm Snapdragon 4 Gen 2 (SM4450) built on an energy-efficient 4nm process, paired with Adreno 613 GPU for smooth everyday multitasking, efficient thermals, and high-speed 5G connectivity.'
  },
  {
    id: 'camera',
    title: 'Camera System',
    tagline: '50MP Dual Rear + 8MP Front',
    highlights: [
      { label: 'Main Camera', value: '50MP', description: 'High-resolution primary wide sensor with PDAF' },
      { label: 'Depth Sensor', value: '2MP', description: 'Auxiliary depth sensor for portrait mode' },
      { label: 'Front Camera', value: '8MP', description: 'Crisp selfie and video calling camera' },
      { label: 'Video Capture', value: '1080p @ 30fps', description: 'Full HD video recording support' }
    ],
    details: '50MP high-resolution primary camera paired with a 2MP depth sensor, alongside an 8MP front selfie camera supporting 1080p video recording at 30fps.'
  },
  {
    id: 'battery',
    title: 'Battery & Power',
    tagline: '5000mAh with 18W Charging',
    highlights: [
      { label: 'Capacity', value: '5000mAh', description: 'High-capacity battery for all-day usage' },
      { label: 'Charging', value: '18W', description: 'Fast charging support via USB-C' },
      { label: 'Port Type', value: 'USB-C', description: 'Reversible USB Type-C 2.0 interface' },
      { label: 'Endurance', value: 'All-Day', description: 'Extended battery life for media and work' }
    ],
    details: 'Massive 5000mAh battery providing reliable all-day battery endurance, supported by 18W fast charging over USB Type-C.'
  },
  {
    id: 'storage',
    title: 'Memory & Storage',
    tagline: 'Up to 8GB RAM + 256GB Storage',
    highlights: [
      { label: 'RAM', value: '4GB / 6GB / 8GB', description: 'LPDDR4X high-speed unified memory' },
      { label: 'Storage', value: '128GB / 256GB', description: 'High-speed internal storage options' },
      { label: 'Expandable', value: '+ microSDXC', description: 'Dedicated expandable microSD card storage' },
      { label: 'Multitasking', value: 'RAM Extension', description: 'Smooth app retention and fast caching' }
    ],
    details: 'Configurable with 4GB, 6GB, or 8GB of RAM and 128GB or 256GB of internal storage, with dedicated expandable storage support via microSDXC card.'
  },
  {
    id: 'protection',
    title: 'Protection & Connectivity',
    tagline: 'Gorilla Glass, IP53, IR Blaster & 3.5mm',
    highlights: [
      { label: 'Protection', value: 'Gorilla Glass + IP53', description: 'Dust and splash resistant rating' },
      { label: 'Biometrics', value: 'Side Fingerprint', description: 'Fast power-key fingerprint sensor' },
      { label: 'Audio & IR', value: '3.5mm + IR Blaster', description: 'Dedicated headphone jack and infrared remote' },
      { label: 'Device Tree', value: 'sm4450-sky', description: 'Open-source device repository source' }
    ],
    details: 'Built with Corning Gorilla Glass front protection, IP53 dust and splash resistance, side-mounted fingerprint scanner, 3.5mm headphone jack, built-in IR blaster, and USB Type-C.'
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  // Community Owner
  {
    "id": "amit_owner",
    "name": "Amit",
    "role": "Founder + Developer",
    "type": "core",
    "handle": "@amitsharma0706",
    "avatarUrl": "/admins/amitsharma0706/pfp.jpg",
    "telegramUrl": "https://t.me/amitsharma0706",
    "bio": "Founder and primary architect of the SKY project. He established the development team, pioneered the custom ROM journey, and successfully led crowdfunding initiatives for the main device tree and AOSPA development."
  },
  // Core Developers
  {
    "id": "lostark13",
    "name": "Tushar Bharti",
    "role": "Core Developer + Maintainer",
    "type": "core",
    "handle": "@lostark13",
    "avatarUrl": "/admins/lostark13/pfp.jpg",
    "githubUrl": "https://github.com/lostark13",
    "telegramUrl": "https://t.me/lostark13",
    "bio": "Core developer handling device trees, kernel architecture, Lineage/Bliss builds, and overall SKY project development."
  },
  {
    "id": "redducc",
    "name": "Sushmit",
    "role": "Core Developer + Maintainer",
    "type": "core",
    "handle": "@redducc",
    "avatarUrl": "/admins/redducc/pfp.jpg",
    "githubUrl": "https://github.com/redducc",
    "telegramUrl": "https://t.me/redducc",
    "bio": "Core developer maintaining DT/kernel work, PenguinOS, Paranoid Android, and core system builds for SKY."
  },

  // Developers & Developer + Maintainers
  {
    "id": "topexguy",
    "name": "Sarim Rasool (TopexGuy)",
    "role": "Developer + Maintainer",
    "type": "developer",
    "handle": "@TopexGuy",
    "avatarUrl": "/admins/TopexGuy/pfp.jpg",
    "githubUrl": "https://github.com/TopexGuy",
    "telegramUrl": "https://t.me/theToplexy",
    "bio": "Developer & Maintainer contributing development work to MGLRU, OSS Kernel, PixelOS, VoltageOS, and iode."
  },
  {
    "id": "kaif_00z",
    "name": "kAiF",
    "role": "Developer + Maintainer + Co-Coordinator",
    "type": "developer",
    "handle": "@kAiF_00z",
    "avatarUrl": "/admins/kAiF_00z/pfp.jpg",
    "githubUrl": "https://github.com/kAiF_00z",
    "telegramUrl": "https://t.me/kAiF_00z",
    "bio": "Developer & Maintainer for SKY project ecosystem, Project Infinity X, and ASCP."
  },
  {
    "id": "someone3_124",
    "name": "Sachit",
    "role": "Project Owner + Developer",
    "type": "developer",
    "handle": "@someone3_124",
    "avatarUrl": "/admins/Sachit/pfp.jpg",
    "githubUrl": "https://github.com/sachit1751-art",
    "telegramUrl": "https://t.me/someone3_124",
    "bio": "Developer who built the SKY website and digital platform, application architecture, UI components, and animations."
  },
  {
    "id": "jendermine",
    "name": "Jendermine",
    "role": "Developer + Maintainer",
    "type": "developer",
    "handle": "@jendermine",
    "avatarUrl": "/admins/jendermine/pfp.jpg",
    "githubUrl": "https://github.com/jendermine",
    "telegramUrl": "https://t.me/jendermine",
    "bio": "Active developer and maintainer for PixelOS, audio HAL, and camera pipeline integrations."
  },
  {
    "id": "sheshuv",
    "name": "Sheshu Vadrevu",
    "role": "Developer",
    "type": "developer",
    "handle": "@sheshuv",
    "githubUrl": "https://github.com/sheshuv",
    "telegramUrl": "https://t.me/sheshuv",
    "bio": "Developer contributing to recovery tree, low-level tooling, and SKY core implementations."
  },
  {
    "id": "zi00duck",
    "name": "Bruch (Donald)",
    "role": "Developer",
    "type": "developer",
    "handle": "@zi00duck",
    "avatarUrl": "/admins/zi00duck/pfp.jpg",
    "githubUrl": "https://github.com/zi00duck",
    "telegramUrl": "https://t.me/zi00duck",
    "bio": "Developer focused on custom recovery builds and low-level development."
  },
  {
    "id": "wtfxetra",
    "name": "X E T R A",
    "role": "Developer",
    "type": "developer",
    "handle": "@wtfxetra",
    "avatarUrl": "/admins/wtfxetra/pfp.jpg",
    "githubUrl": "https://github.com/wtfxetra",
    "telegramUrl": "https://t.me/wtfxetra",
    "bio": "Developer contributing to SKY web interface."
  },

  // Maintainers & Maintainer + Moderators
  {
    "id": "altafyafai",
    "name": "Altaf Yafai",
    "role": "Maintainer + Moderator",
    "type": "maintainer",
    "handle": "@AltafYafai",
    "avatarUrl": "/admins/AltafYafai/pfp.jpg",
    "githubUrl": "https://github.com/AltafYafai",
    "telegramUrl": "https://t.me/AltafYafai786",
     bio: "Device maintainer and community moderator across SKY support groups."
  },
  {
    "id": "arrowsploit",
    "name": "Arrowsploit",
    "role": "Maintainer",
    "type": "maintainer",
    "handle": "@arrowsploit",
    "avatarUrl": "/admins/arrowsploit/pfp.jpg",
    "githubUrl": "https://github.com/arrowsploit",
    "telegramUrl": "https://t.me/arrowsploit",
    "bio": "Official maintainer for AxionAOSP and SKY device releases."
  },
  {
    "id": "lua_c8xd",
    "name": "Lua",
    "role": "Maintainer",
    "type": "maintainer",
    "handle": "@C8_XD",
    "telegramUrl": "https://t.me/C8_XD",
    "bio": "Official maintainer for LunarisAOSP on Redmi 12 5G / POCO M6 Pro 5G."
  },
  {
    "id": "sanamrajneesh",
    "name": "S R",
    "role": "Maintainer",
    "type": "maintainer",
    "handle": "@sanamrajneesh",
    "avatarUrl": "/admins/sanamrajneesh/pfp.jpg",
    "githubUrl": "https://github.com/sanamrajneesh",
    "telegramUrl": "https://t.me/sanamrajneesh",
    "bio": "Maintainer for Shutterburg and custom ROM builds."
  },
  {
    "id": "solocaptainblaze",
    "name": "Dhanush [Dattebayoo]",
    "role": "Maintainer",
    "type": "maintainer",
    "handle": "@solocaptainblaze",
    "avatarUrl": "/admins/solocaptainblaze/pfp.jpg",
    "githubUrl": "https://github.com/solocaptainblaze",
    "telegramUrl": "https://t.me/solocaptainblaze",
    "bio": "Official maintainer for EverestOS on SKY."
  },
  {
    "id": "chenriquelira",
    "name": "Henrique",
    "role": "Maintainer",
    "type": "maintainer",
    "handle": "@chenriquelira",
    "githubUrl": "https://github.com/chenriquelira",
    "telegramUrl": "https://t.me/chenriquelira",
    "bio": "Official maintainer for SKY project releases."
  },
  {
    "id": "mijumourya",
    "name": "Mourya Baruah",
    "role": "Maintainer",
    "type": "maintainer",
    "handle": "@Mijumourya",
    "avatarUrl": "/admins/Mijumourya/pfp.jpg",
    "githubUrl": "https://github.com/Mijumourya",
    "telegramUrl": "https://t.me/Mijumourya",
    "bio": "Official maintainer for crDroid and Project Blaze."
  },
  {
    "id": "xprateek",
    "name": "Prateek",
    "role": "Maintainer",
    "type": "maintainer",
    "handle": "@xprateek",
    "avatarUrl": "/admins/xprateek/pfp.jpg",
    "githubUrl": "https://github.com/xprateek",
    "telegramUrl": "https://t.me/xprateek",
    "bio": "Official maintainer for SKY device builds."
  },
  {
    "id": "makhk",
    "name": "Hari [HK]",
    "role": "Maintainer",
    "type": "maintainer",
    "handle": "@makhk",
    "avatarUrl": "/admins/makhk/pfp.jpg",
    "githubUrl": "https://github.com/makhk",
    "telegramUrl": "https://t.me/makhk",
    "bio": "Official maintainer for SKY project builds."
  },

  // Moderators
  {
    "id": "vedvery5",
    "name": "Vedant Ghadi",
    "role": "Moderator",
    "type": "moderator",
    "handle": "@Vedvery5",
    "avatarUrl": "/admins/Vedvery5/pfp.jpg",
    "githubUrl": "https://github.com/Vedvery5",
    "telegramUrl": "https://t.me/Vedvery5",
    "bio": "Community moderator for SKY channels and social platforms."
  },

  // Ex-Maintainers
  {
    "id": "hipexscape",
    "name": "Atarashii (Atrashi)",
    "role": "Ex-Maintainer",
    "type": "ex",
    "handle": "@hipexscape",
    "avatarUrl": "/admins/hipexscape/pfp.jpg",
    "githubUrl": "https://github.com/hipexscape",
    "telegramUrl": "https://t.me/hipexscape",
    "bio": "Former recovery maintainer for the SKY project."
  },
  {
    "id": "suvojeet_sengupta",
    "name": "Suvojeet Sengupta",
    "role": "Ex-Maintainer",
    "type": "ex",
    "handle": "@suvojeet_sengupta",
    "avatarUrl": "/admins/suvojeet_sengupta/pfp.jpg",
    "githubUrl": "https://github.com/suvojeet_sengupta",
    "telegramUrl": "https://t.me/suvojeet_sengupta",
    "bio": "Former device maintainer for SKY project releases."
  },
  {
    "id": "venkat3620",
    "name": "Venkat3620",
    "role": "Ex-Maintainer",
    "type": "ex",
    "handle": "@Venkat3620",
    "telegramUrl": "https://t.me/Venkat3620",
    "bio": "Former maintainer for kernel updates and PenguinOS release builds."
  },

  // Testers
  {
    "id": "mo_faza",
    "name": "mo_faza",
    "role": "Tester",
    "type": "tester",
    "handle": "@mo_faza",
    "telegramUrl": "https://t.me/mo_faza",
    "bio": "Recurring build tester providing QA feedback and logcat analyses."
  },
  {
    "id": "agnes",
    "name": "Agnes",
    "role": "Tester",
    "type": "tester",
    "handle": "@Agnes",
    "telegramUrl": "https://t.me/Agnes",
    "bio": "Dedicated build tester across SKY custom ROM updates."
  },
  {
    "id": "sagarp3",
    "name": "Sagar (Sagarp3)",
    "role": "Tester",
    "type": "tester",
    "handle": "@Sagarp3",
    "telegramUrl": "https://t.me/Sagarp3",
    "bio": "Build tester for ROM stability, camera testing, and performance verification."
  }
];

export const CORE_VALUES: CoreValue[] = [
  {
    title: 'Openness',
    description: '100% transparent codebases and hardware architecture. No hidden backdoors, no telemetry tracking, and zero proprietary lock-in.'
  },
  {
    title: 'Development',
    description: 'Empowering developers with full root privileges, unlocked bootloaders, and comprehensive hardware documentation from day one.'
  },
  {
    title: 'Community',
    description: 'Built by enthusiasts, for enthusiasts. Project direction and features are discussed and voted on directly by our active global community.'
  },
  {
    title: 'People First',
    description: 'Technology should serve humans, not harvest them. SKY is designed with privacy as an absolute right, not a premium addon.'
  }
];

export const COMMUNITY_CHANNELS: CommunityChannel[] = [
  {
    name: 'GitHub Repository',
    description: 'Explore our open-source codebase, contribute code, and view issue trackers.',
    url: 'https://github.com/sm4450-development',
    icon: 'github',
    badge: '100% Open Source'
  },
  {
    name: 'Telegram Community',
    description: 'Join the main discussion group with thousands of active SKY developers and users.',
    url: 'https://t.me/Redmi125GSupport',
    icon: 'telegram',
    badge: 'Active Group'
  },
  {
    name: 'Announcement Channel',
    description: 'Stay updated with official device announcements, progress updates, and releases.',
    url: 'https://t.me/Redmi125GChannel',
    icon: 'chat',
    badge: 'Official Updates'
  },
  {
    name: 'Developer Network',
    description: 'Collaborate with device maintainers, test builds, and contribute hardware drivers.',
    url: 'https://t.me/Redmi125GSupport',
    icon: 'globe',
    badge: 'Contributors'
  }
];

export const COMMUNITY_FAQS: FAQItem[] = [
  {
    id: 'bootloader-unlock',
    question: 'How do I unlock the bootloader on Redmi 12 5G / Poco M6 Pro 5G (sky)?',
    answer: 'Enable Developer Options on your device by tapping "Build Number" 7 times in Settings > About Phone. Next, enable "OEM Unlocking" and "USB Debugging". Link your account in "Mi Unlock Status", reboot into Fastboot mode (Power + Volume Down), and execute the unlock utility on your PC. Unlocking wipes your internal storage, so make sure to backup beforehand.',
    category: 'flashing',
    tags: ['Bootloader', 'Fastboot', 'Unlock', 'Setup']
  },
  {
    id: 'clean-flash-vs-dirty-flash',
    question: 'What is the difference between a Clean Flash and a Dirty Flash?',
    answer: 'A Clean Flash involves wiping System, Vendor, Product, Data, and formatting Data (typing "yes" in recovery) before installing a new ROM. This is mandatory when switching between different ROMs or upgrading major Android versions. A Dirty Flash (only flashing the ROM zip + wiping Dalvik/Cache) is only safe when updating to a newer build of the exact same ROM.',
    category: 'flashing',
    tags: ['Recovery', 'Format Data', 'Wiping', 'Updates']
  },
  {
    id: 'gapps-vs-vanilla',
    question: 'What is the difference between GApps and Vanilla ROM builds?',
    answer: 'GApps builds come pre-packaged with core Google Mobile Services, Play Store, and setup wizard. Vanilla builds are de-googled and strictly contain open-source AOSP components. Vanilla builds offer lighter resource usage and battery savings; you can flash third-party GApps (such as NikGApps Core). For Vanilla builds, after flashing the ROM and wiping/formatting data, reboot to recovery again, flash the GApps package, and reboot to system.',
    category: 'compatibility',
    tags: ['Google Play', 'Vanilla', 'GApps', 'microG']
  },
  {
    id: 'firmware-requirement',
    question: 'Do I need to flash a specific firmware (FW) before flashing custom ROMs?',
    answer: 'Yes! Most custom ROMs for "sky" require the latest stable HyperOS / MIUI firmware base for modem, Bluetooth, and vendor partition compatibility. Check each ROM\'s release notes or maintainer instructions to verify if a matching firmware zip must be flashed prior to installing the ROM.',
    category: 'compatibility',
    tags: ['Firmware', 'Modem', 'HyperOS', 'Vendor']
  },
  {
    id: 'play-integrity-banking',
    question: 'Do banking apps and UPI work on custom ROMs for SKY?',
    answer: 'Most official builds include verified Play Integrity (Device / Basic integrity) fingerprints out-of-the-box, allowing Google Wallet and banking apps to operate seamlessly. If using an unofficial build or rooting with KernelSU/Magisk/APatch, ensure you configure Zygisk and PlayIntegrityFix modules to pass attestation checks.',
    category: 'general',
    tags: ['Banking', 'Play Integrity', 'UPI', 'SafetyNet', 'Root']
  },
  {
    id: 'bootloop-fix',
    question: 'My device is stuck in a bootloop after flashing. What should I do?',
    answer: '1. Ensure you formatted data in recovery (Format Data > type "yes")—a dirty flash from a previous ROM is the #1 cause of bootloops.\n2. Verify you flashed the recommended Recovery (TWRP / OrangeFox / OFOX) compatible with Android 15/16/17.\n3. If your storage is encrypted, flash the ROM zip and reboot directly to recovery once before booting system.',
    category: 'troubleshooting',
    tags: ['Bootloop', 'Recovery', 'Format Data', 'Fastboot']
  },
  {
    id: 'report-bugs',
    question: 'How do I properly report bugs to ROM maintainers?',
    answer: 'When reporting bugs on Telegram or GitHub: always provide your current ROM version, Kernel version, clean flash confirmation, steps to reproduce, and attach a logcat (`adb logcat -d > logcat.txt`) captured right when the issue occurs. Avoid pinging maintainers without logs.',
    category: 'troubleshooting',
    tags: ['Bug Report', 'Logcat', 'Maintainers', 'Telegram']
  },
  {
    id: 'custom-kernels',
    question: 'Can I flash custom kernels on custom ROMs?',
    answer: 'You can flash custom kernels designed specifically for codename "sky" running Qualcomm Snapdragon 4 Gen 2 (SM4450). Always make a full boot & dtbo backup in recovery prior to flashing any third-party kernel, and ensure the kernel matches your ROM\'s Android version (A15 / A16 / A17).',
    category: 'compatibility',
    tags: ['Kernel', 'Snapdragon 4 Gen 2', 'Overclock', 'SM4450']
  }
];

export const AOSP_ROMS: RomItem[] = [
  {
    id: '5zLphMrBZpQEYesFaJQh',
    name: 'AxionAOSP v2.7',
    androidVersion: 'Android 16',
    status: 'Unofficial',
    maintainer: 'Arrowsploit',
    maintainerUrl: 'https://t.me/arrowsploit',
    maintainerHandle: '@arrowsploit',
    url: 'https://sourceforge.net/projects/arrowsploit-s-android-project/files/RMX1821/lineage-20.0-20230711-UNOFFICIAL-RMX1821.zip/download',
    description: 'Build date: 28th Jun, 2026 | Rom Status : Beta [Hotfix Update] | Fixed SystemWide Vibration Issue.',
    changelog: [
      'OTA Pushed',
      'ROM flash guide included',
      'Please report with logs if you are facing any bugs'
    ],
    createdAt: '2026-08-06T10:59:28.920Z',
    isPinned: true,
    logoUrl: 'https://i.ibb.co/dsmbQMtN/image.jpg',
    extraLinks: [],
    downloadCount: 1540,
    stabilityTrends: [85, 88, 82, 90, 92],
    batteryEfficiency: 3
  },
  {
    id: '7VDdekQOdbKThaCZOZkG',
    name: 'Project Infinity X',
    androidVersion: 'Android 16',
    status: 'Official',
    maintainer: 'kAiF',
    maintainerUrl: 'https://t.me/kAiF_00z',
    maintainerHandle: '@kAiF_00z',
    url: 'https://projectinfinity-x.com/downloads/sky',
    description: 'New Release of Project Infinity X v3.12 for Redmi 12 5G / Poco M6 Pro 5G (sky) is Up! | Variants: GAPPS & Vanilla | Size: 1.35 GB (Vanilla) / 1.66 GB (Gapps)',
    changelog: [
      'Updated to v3.12 source base',
      'Both Vanilla & GApps builds available',
      'Optimized kernel memory management'
    ],
    createdAt: '2026-08-07T10:10:42.180Z',
    logoUrl: 'https://i.ibb.co/TDRZjk0J/image.jpg',
    extraLinks: [
      {
        url: 'https://t.me/ProjectInfinityX',
        label: 'Telegram Community'
      }
    ],
    downloadCount: 2890,
    batteryEfficiency: 4
  },
  {
    id: '8aoau6TPNm1i8T0HG9H0',
    name: 'ASCP',
    androidVersion: 'Android 17',
    status: 'Official',
    maintainer: 'kAiF',
    maintainerUrl: 'https://t.me/kAiF_00z',
    maintainerHandle: '@kAiF_00z',
    url: 'https://sourceforge.net/projects/project-ascp/files/sky/ASCP-v6.1-sky-OFFICIAL-20260723-1919.zip/download',
    description: 'ASCP Stable v6.1 for Redmi 12 5G / Poco M6 Pro 5G (sky). Clean and high-efficiency daily driver build.',
    changelog: [
      'ASCP Version 6.1 stable release',
      'Android 17 base integration',
      'Enhanced battery longevity curves'
    ],
    createdAt: '2026-08-06T10:44:19.731Z',
    logoUrl: 'https://i.ibb.co/cXyzZhBQ/image.jpg',
    extraLinks: [
      {
        label: 'Maintainer Profile',
        url: 'https://t.me/kAiF_00z'
      }
    ],
    downloadCount: 3120,
    batteryEfficiency: 4
  },
  {
    id: 'D8MWSZNL4mk53RMPLdQx',
    name: 'PenguinOS 1.0 Beta',
    androidVersion: 'Android 17',
    status: 'Official',
    maintainer: 'sushmit (@redducc)',
    maintainerUrl: 'https://t.me/redducc',
    maintainerHandle: '@redducc',
    url: 'https://sourceforge.net/projects/penguinos/files/sky/celerity/PenguinOS-celerity-20260802-sky-beta.zip/download',
    description: 'PenguinOS 1.0 Beta available for Redmi 12 5G / Poco M6 Pro (sky) | Version: Celerity (Seventeen) | Build Date: 2-August-2026 | Size: 1.8 GB (GApps)',
    changelog: [
      'Version: Celerity (Seventeen)',
      'GApps package built-in',
      'Upstreamed audio HAL and camera pipeline',
      'Credits: @jendermine, @Venkat3620, @AltafYafai'
    ],
    isPinned: true,
    createdAt: '2026-08-06T10:43:14.878Z',
    logoUrl: 'https://i.ibb.co/8kpd7mq/image.jpg',
    extraLinks: [],
    downloadCount: 950,
    batteryEfficiency: 2
  },
  {
    id: 'GDV9R5HmdI79AI89Z2bg',
    name: 'MistOS',
    androidVersion: 'Android 16',
    status: 'Unofficial',
    maintainer: '@TopexGuy X @AltafYafai',
    maintainerUrl: 'https://t.me/theToplexy',
    maintainerHandle: '@theToplexy',
    url: 'https://t.me/theToplexy/8721/47604',
    description: 'Release Date: 02/05/2026 | Note: Flash latest FW after flash.',
    changelog: [
      'Dirty Flash supported',
      'OSS Kernel + KSUN integration',
      'April Security Patch',
      'Latest OSS trees changes'
    ],
    createdAt: '2026-08-09T02:09:05.573Z',
    logoUrl: 'https://i.ibb.co/tTBMcF11/image.jpg',
    extraLinks: [
      {
        label: 'Community Discussion',
        url: 'https://t.me/theToplexy/75/45940'
      }
    ],
    downloadCount: 1200,
    batteryEfficiency: 3
  },
  {
    id: 'KevTTy5YbbUP30VTw0X8',
    name: 'PiXEL-OS',
    androidVersion: 'Android 16',
    status: 'Official',
    maintainer: 'TopexGuy',
    maintainerUrl: 'https://t.me/theToplexy',
    maintainerHandle: '@TopexGuy',
    url: 'https://sourceforge.net/projects/skyroms/files/PixelOS_sky-16.2-20260729-1641.zip/download',
    description: 'Release Date: 01/08/2026 | PixelOS v16.2 with Google Pixel experience and smooth stock gestures.',
    changelog: [
      'Firmware Included in zip',
      'Upstreamed 5.10.257 Kernel',
      'Dropped Pre-Root (Use LKM)',
      'June Security Patch'
    ],
    createdAt: '2026-08-06T08:40:05.354Z',
    logoUrl: 'https://i.ibb.co/LXkm6pbW/image.jpg',
    extraLinks: [
      {
        url: 'https://t.me/theToplexy/1/56900',
        label: 'Support Group'
      },
      {
        url: 'https://t.me/Redmi125gChannel',
        label: 'Device Updates'
      }
    ],
    downloadCount: 4500,
    batteryEfficiency: 4
  },
  {
    id: 'TB0hwdaULyL5co4YL6n7',
    name: 'iode-7.7',
    androidVersion: 'Android 16',
    status: 'Unofficial',
    maintainer: '@TopexGuy',
    maintainerUrl: 'https://t.me/theToplexy',
    maintainerHandle: '@TopexGuy',
    url: 'https://sourceforge.net/projects/skyroms/files/iode-7.7-20260805-sky.zip/download',
    description: 'Release Date: 07/08/2026 | De-Googled privacy-first OS with microG support and built-in ad/tracker blocker.',
    changelog: [
      'Firmware Included in build',
      'Upstreamed 5.10.257 Kernel',
      'Signed + User Build',
      'June Security Patch',
      'Built-in tracker blocker engine'
    ],
    createdAt: '2026-08-10T10:54:38.808Z',
    logoUrl: 'https://i.ibb.co/MkYwkgxw/image.jpg',
    extraLinks: [
      {
        label: 'Support Us',
        url: 'https://t.me/theToplexy/1/56900'
      }
    ],
    downloadCount: 890,
    batteryEfficiency: 3
  },
  {
    id: 'cgSYLW0sNEG5LCTWo98Q',
    name: 'Project Sakura',
    androidVersion: 'Android 16',
    status: 'Official',
    maintainer: 'Project Sakura Team',
    maintainerUrl: 'https://t.me/ProjectSakuraArchives',
    maintainerHandle: '@ProjectSakura',
    url: 'https://t.me/ProjectSakuraArchives/12/372',
    description: 'New Update for Poco M6 Pro 5G / Redmi 12 5G (sky) is here! | Version: 16.3.0 | Date: 2026/07/19',
    changelog: [
      'Version 16.3.0 maintenance release',
      'Sakura custom settings redesign',
      'Improved thermals during extended gaming',
      'Sub-second app launch optimizations'
    ],
    createdAt: '2026-08-06T11:02:19.678Z',
    logoUrl: 'https://i.ibb.co/hxCRQzKg/image.jpg',
    extraLinks: [
      {
        label: 'Support Group',
        url: 'https://t.me/theToplexy'
      },
      {
        label: 'Follow for Updates',
        url: 'https://t.me/ProjectSakuraAnnouncements'
      }
    ],
    downloadCount: 3400,
    batteryEfficiency: 3
  },
  {
    id: 'rcTDKwiVE4MLOc2bjsAl',
    name: 'VoltageOS',
    androidVersion: 'Android 16',
    status: 'Official',
    maintainer: 'TopexGuy',
    maintainerUrl: 'https://t.me/theToplexy',
    maintainerHandle: '@TopexGuy',
    url: 'https://t.me/theToplexy/8721/69614',
    description: 'Release Date: 20/07/2026 | VoltageOS built for optimal responsiveness and battery balance on Redmi 12 5G / POCO M6 Pro 5G.',
    changelog: [
      'Dirty flash compatible',
      'Firmware Included in installer',
      'Upstreamed OSS Kernel',
      'Dropped Pre-Root (Use LKM)',
      'July Security Patch'
    ],
    createdAt: '2026-08-06T10:46:58.498Z',
    logoUrl: 'https://i.ibb.co/2YgZmRZp/image.jpg',
    extraLinks: [
      {
        label: 'Support Group',
        url: 'https://t.me/theToplexy/1/14293'
      },
      {
        label: 'Device Updates',
        url: 'https://t.me/Redmi125gChannel'
      }
    ],
    downloadCount: 2200,
    batteryEfficiency: 4
  },
  {
    id: 'rdGN7khVO44ynwbaHwVN',
    name: 'CrDroid',
    androidVersion: 'Android 16',
    status: 'Official',
    maintainer: 'Mourya Baruah',
    maintainerUrl: 'https://t.me/mourya',
    maintainerHandle: '@mourya',
    url: 'https://sourceforge.net/projects/mourya-sky/files/crdroid/crDroidAndroid-16.0-20260528-sky-v12.10-userdebug.zip/download',
    description: 'Maintainer: Mourya Baruah | Variant: user (Monthly) | Size: 1.28 GiB | Rich personalization and performance toggles.',
    changelog: [
      'Revamped GameSpace overlay and performance profiles',
      'Added 2 new Pulse renderer styles - Particle & Waveform',
      'Added new Pulse Bass haptics vibration mode',
      'Upstreamed crDroid 12.10 core'
    ],
    createdAt: '2026-08-06T11:00:40.414Z',
    logoUrl: 'https://i.ibb.co/nMxxXvy8/image.jpg',
    extraLinks: [],
    downloadCount: 3800,
    batteryEfficiency: 3
  },
  {
    id: 'ye5h68gD9bbxFZ6WRS84',
    name: 'LunarisAOSP 3.12',
    androidVersion: 'Android 16',
    status: 'Unofficial',
    maintainer: '@C8_XD',
    maintainerUrl: 'https://t.me/C8_XD',
    maintainerHandle: '@C8_XD',
    url: 'https://cdn.luasup.xyz/sky/Lunaris/Lunaris-AOSP-sky-Community-3.12-VANILLA-2026071014.zip',
    description: 'LunarisAOSP 3.12 - QPR2 - unOFFICIAL | Android 16 | Build type: Gapps / Vanilla | Release date: 10 - 07 - 2026',
    changelog: [
      'Initial build QPR2 base',
      'July Security Patch',
      'Clean Flash & Dirty Flash supported',
      'OSS Kernel added + KSUN included',
      'Double tap to wake (DT2W) active',
      'User + Signed Build'
    ],
    isPinned: true,
    createdAt: '2026-08-06T10:58:24.082Z',
    logoUrl: 'https://i.ibb.co/k6P0rDnX/image.jpg',
    extraLinks: [
      {
        label: 'Global Support',
        url: 'https://t.me/Skyglobalupdates'
      },
      {
        label: 'Device Support Group',
        url: 'https://t.me/Redmi125GSupport'
      },
      {
        label: 'Updates Channel',
        url: 'https://t.me/Redmi125GChannel'
      }
    ],
    downloadCount: 5200,
    batteryEfficiency: 4
  },
  {
    id: 'eos-v3-6-sky-unofficial',
    name: '/e/OS v3.6',
    androidVersion: 'Android 16',
    status: 'Unofficial',
    maintainer: 'TopexGuy',
    maintainerUrl: 'https://t.me/TheToplexy',
    maintainerHandle: '@TopexGuy',
    url: 'https://sourceforge.net/projects/skyroms/files/e-3.6-a16-20260220-UNOFFICIAL-sky.zip/download',
    description: 'Release Date: 23/02/2026 | /e/OS v3.6 Unofficial for Redmi 12 5G / POCO M6 Pro 5G (sky). Privacy-oriented, de-googled mobile operating system with microG services, Enforcing + Signed + User build, and Dolby Audio support.',
    changelog: [
      'Clean Flash Required',
      'Enforcing + Signed + User',
      "Feb'26 Security Patch",
      'Dolby Added',
      'Credits: Thanks to @lostark13 for base tree, @mo_faza, @Sagarp3 for testing'
    ],
    createdAt: '2026-02-23T00:00:00.000Z',
    extraLinks: [
      {
        label: 'Support Group (@TheToplexy)',
        url: 'https://t.me/TheToplexy'
      },
      {
        label: 'Device Updates (@Redmi125gChannel)',
        url: 'https://t.me/Redmi125gChannel'
      },
      {
        label: 'Device Support (@Redmi125gSupport)',
        url: 'https://t.me/Redmi125gSupport'
      }
    ],
    downloadCount: 1680,
    batteryEfficiency: 4
  }
];
