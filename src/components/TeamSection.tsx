import React, { useState, useRef, useEffect } from 'react';
import { TEAM_MEMBERS } from '../data';
import { Github, Send, Sparkles, Terminal, Wrench, ShieldCheck, FlaskConical, History, UserCheck, Users, RotateCcw } from 'lucide-react';
import { TeamMember } from '../../shared/types';

const TeamAvatar: React.FC<{ name: string; avatarUrl?: string }> = ({ name, avatarUrl }) => {
  const initials = (name || 'SK')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || name.slice(0, 2).toUpperCase();

  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-3xl bg-gradient-to-br from-[#FFF8E1] to-[#FAF3DD] dark:from-[#151410] dark:to-[#1F1E18] border border-[#EBE4CF] dark:border-[#36342A] shadow-xs overflow-hidden shrink-0 relative flex items-center justify-center">
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={name}
          referrerPolicy="no-referrer"
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
            if (nextEl) nextEl.style.display = 'flex';
          }}
          className="w-full h-full object-cover"
        />
      )}
      <div 
        className="w-full h-full bg-[#FAF3DD] dark:bg-[#1F1E18] items-center justify-center text-lg sm:text-xl font-extrabold text-[#49473E] dark:text-[#F4EFE6] select-none"
        style={{ display: avatarUrl ? 'none' : 'flex' }}
      >
        {initials}
      </div>
    </div>
  );
};

type FilterType = 'all' | 'developer' | 'maintainer' | 'community';

const RenderRoleBadges: React.FC<{ role?: string; type?: string }> = ({ role = '' }) => {
  const parts = (role || '').split('+').map((p) => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border shadow-2xs bg-amber-500/15 text-amber-950 dark:text-amber-300 border-amber-500/30 font-bold">
        <Sparkles className="w-3 h-3" />
        <span>Contributor</span>
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {parts.map((part, idx) => {
        let badgeStyle = 'bg-amber-500/15 text-amber-950 dark:text-amber-300 border-amber-500/30';
        let icon = <Sparkles className="w-3 h-3" />;

        if (part.includes('Founder')) {
          badgeStyle = 'bg-amber-500/30 text-amber-950 dark:text-amber-200 border-amber-500/60 font-black tracking-wide';
          icon = <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />;
        } else if (part.includes('Owner')) {
          badgeStyle = 'bg-amber-500/25 text-amber-950 dark:text-amber-200 border-amber-500/50 font-extrabold';
          icon = <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />;
        } else if (part.includes('Core Developer')) {
          badgeStyle = 'bg-amber-500/20 text-amber-950 dark:text-amber-300 border-amber-500/40 font-extrabold';
          icon = <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />;
        } else if (part.includes('Developer')) {
          badgeStyle = 'bg-sky-500/20 text-sky-950 dark:text-sky-300 border-sky-500/40 font-bold';
          icon = <Terminal className="w-3 h-3 text-sky-600 dark:text-sky-400" />;
        } else if (part.includes('Maintainer') && !part.includes('Ex-')) {
          badgeStyle = 'bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border-emerald-500/40 font-bold';
          icon = <Wrench className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
        } else if (part.includes('Moderator')) {
          badgeStyle = 'bg-purple-500/20 text-purple-950 dark:text-purple-300 border-purple-500/40 font-bold';
          icon = <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />;
        } else if (part.includes('Tester')) {
          badgeStyle = 'bg-rose-500/20 text-rose-950 dark:text-rose-300 border-rose-500/40 font-bold';
          icon = <FlaskConical className="w-3 h-3 text-rose-600 dark:text-rose-400" />;
        } else if (part.includes('Coordinator')) {
          badgeStyle = 'bg-indigo-500/20 text-indigo-950 dark:text-indigo-300 border-indigo-500/40 font-bold';
          icon = <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />;
        } else if (part.includes('Ex-')) {
          badgeStyle = 'bg-zinc-500/20 text-zinc-800 dark:text-zinc-400 border-zinc-500/30 font-semibold';
          icon = <History className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />;
        }

        return (
          <span
            key={idx}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border shadow-2xs ${badgeStyle}`}
          >
            {icon}
            <span>{part}</span>
          </span>
        );
      })}
    </div>
  );
};

export const TeamSection: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const members = TEAM_MEMBERS;

  const humanMembers = members.filter((m) => {
    const handle = (m.handle || '').toLowerCase();
    const id = (m.id || '').toLowerCase();
    const name = (m.name || '').toLowerCase();
    const role = (m.role || '').toLowerCase();
    const isBot = handle.includes('bot') || id.includes('bot') || name.includes('bot') || role.includes('bot') || role === 'lady';

    return !isBot;
  });

  const filteredMembers = humanMembers.filter((m) => {
    const role = (m.role || '');

    // Role category filter
    if (filter === 'all') return true;
    if (filter === 'developer') {
      return m.type === 'core' || m.type === 'developer' || role.includes('Developer');
    }
    if (filter === 'maintainer') {
      return m.type === 'maintainer' || (role.includes('Maintainer') && !role.includes('Ex-'));
    }
    if (filter === 'community') {
      return (
        m.type === 'moderator' ||
        m.type === 'tester' ||
        m.type === 'ex' ||
        role.includes('Moderator') ||
        role.includes('Tester') ||
        role.includes('Ex-')
      );
    }
    return true;
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  const categories: { id: FilterType; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'all',
      label: 'All Members',
      icon: <UserCheck className="w-4 h-4" />,
      count: humanMembers.length,
    },
    {
      id: 'developer',
      label: 'Developers',
      icon: <Terminal className="w-4 h-4" />,
      count: humanMembers.filter((m) => m.type === 'core' || m.type === 'developer' || (m.role || '').includes('Developer')).length,
    },
    {
      id: 'maintainer',
      label: 'Maintainers',
      icon: <Wrench className="w-4 h-4" />,
      count: humanMembers.filter((m) => m.type === 'maintainer' || ((m.role || '').includes('Maintainer') && !(m.role || '').includes('Ex-'))).length,
    },
    {
      id: 'community',
      label: 'Community & QA',
      icon: <ShieldCheck className="w-4 h-4" />,
      count: humanMembers.filter(
        (m) =>
          m.type === 'moderator' ||
          m.type === 'tester' ||
          m.type === 'ex' ||
          (m.role || '').includes('Moderator') ||
          (m.role || '').includes('Tester') ||
          (m.role || '').includes('Ex-')
      ).length,
    },
  ];

  return (
    <section ref={sectionRef} className="py-6 sm:py-10 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
      {/* Role Category Toggles */}
      <div className="flex justify-start md:justify-center items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center justify-center min-h-[44px] gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE694] shrink-0 ${
              filter === cat.id
                ? 'bg-[#FDE694] text-[#121212] border-[#EBE4CF] dark:border-transparent shadow-xs scale-102 font-extrabold'
                : 'bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] hover:border-[#FDE694] border-[#EBE4CF] dark:border-[#2C2A22]'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
            <span
              className={`ml-0.5 px-2 py-0.5 text-[10px] sm:text-xs rounded-full font-extrabold ${
                filter === cat.id
                  ? 'bg-[#121212]/10 text-[#121212]'
                  : 'bg-[#EBE4CF] dark:bg-[#2B2921] text-[#49473E] dark:text-[#BDB8A4]'
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid Container */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 sm:py-20 px-6 bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] rounded-3xl border border-[#EBE4CF] dark:border-[#2C2A22] shadow-xs flex flex-col items-center justify-center space-y-5">
          {/* Illustration Container */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[#FDE694]/20 rounded-full blur-xl transform scale-125" />
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#FFF8E1] to-[#FAF0CF] dark:from-[#1C1A14] dark:to-[#151410] border border-[#EBE4CF] dark:border-[#36342A] flex items-center justify-center text-[#121212] dark:text-[#FDE694] shadow-sm relative z-10">
              <Users size={40} className="stroke-[1.5]" />
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-[#121212] dark:text-[#F4EFE6] tracking-tight">
              No Members Found
            </h3>
            <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
              We couldn't find any team members or maintainers matching the selected filter. Try resetting your filter to view the entire core team.
            </p>
          </div>

          <button
            onClick={() => setFilter('all')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-[#FDE694] text-[#121212] hover:bg-[#FCE076] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>Show All Team Members</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id || member.handle || member.name}
              style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 250px' }}
              className="bg-gradient-to-b from-[#FFFDF7] to-[#FAF5E6] dark:from-[#181712] dark:to-[#12110D] rounded-3xl p-5 sm:p-6 border border-[#EBE4CF] dark:border-[#2C2A22] hover:border-[#FDE694]/60 dark:hover:border-[#FDE694]/40 shadow-xs hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ease-out flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-4 items-start">
                  <TeamAvatar name={member.name} avatarUrl={member.avatarUrl} />
                  <div className="flex flex-col flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg sm:text-xl font-extrabold text-[#49473E] dark:text-[#F4EFE6] break-words line-clamp-1">
                        {member.name}
                      </h3>
                    </div>

                    <div className="mt-2">
                      <RenderRoleBadges role={member.role} type={member.type} />
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-[#787567] dark:text-[#BDB8A4] mt-1 truncate">
                      {member.handle}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#EBE4CF]/60 dark:border-[#36342A]/60 text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
                  {member.bio || 'Core contributor to the SKY smartphone project.'}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[#EBE4CF]/40 dark:border-[#36342A]/40">
                {member.githubUrl && (
                  <a
                    href={member.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center min-h-[44px] gap-2 px-3.5 py-2 rounded-xl bg-[#FFF8E1] dark:bg-[#1C1A14] text-xs font-bold text-[#49473E] dark:text-[#F4EFE6] hover:text-[#121212] dark:hover:text-[#FDE694] hover:bg-[#FDE694]/30 border border-[#EBE4CF] dark:border-[#2C2A22] transition-colors active:scale-95"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {member.telegramUrl && (
                  <a
                    href={member.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center min-h-[44px] gap-2 px-3.5 py-2 rounded-xl bg-[#FFF8E1] dark:bg-[#1C1A14] text-xs font-bold text-[#49473E] dark:text-[#F4EFE6] hover:text-[#121212] dark:hover:text-[#FDE694] hover:bg-[#FDE694]/30 border border-[#EBE4CF] dark:border-[#2C2A22] transition-colors active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Telegram</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TeamSection;
