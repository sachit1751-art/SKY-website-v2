import { TEAM_MEMBERS } from './src/data';
const humanMembers = TEAM_MEMBERS.filter((m) => {
    const handle = (m.handle || '').toLowerCase();
    const id = (m.id || '').toLowerCase();
    const name = (m.name || '').toLowerCase();
    const role = (m.role || '').toLowerCase();
    return !handle.includes('bot') && !id.includes('bot') && !name.includes('bot') && !role.includes('bot') && role !== 'lady';
});

humanMembers.forEach((m, i) => {
    console.log(`${i + 1}: ${m.name}`);
});
