import React from 'react';
import { ArrowUpRight, ExternalLink, Mail } from 'lucide-react';
import type { PortfolioDocument } from '../../types/portfolio';
import { formatRepoLanguages } from '../../utils/portfolioHelpers';

interface TemplateProps {
  portfolio: PortfolioDocument;
}

export const SlateTemplate: React.FC<TemplateProps> = ({ portfolio }) => {
  const {
    profile,
    topRepos,
    languages,
    activity,
    aiContent,
    careerTrack,
    accentColor,
    customEmail,
    availableForHire,
  } = portfolio;

  const activeAccent = accentColor === '#0F172A' ? '#38BDF8' : accentColor;

  return (
    <div className="bg-[#090D16] text-slate-100 border border-slate-800 rounded-xl overflow-hidden">
      {/* Top Bar */}
      <div className="border-b border-slate-800/90 px-8 py-5 flex flex-wrap items-center justify-between gap-4">
        <span className="font-display text-base font-bold tracking-tight text-white">
          {profile.name}
        </span>
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span>{careerTrack}</span>
          <a
            href={profile.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-200 hover:text-white"
          >
            @{profile.login}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-12 space-y-12">
        {/* Hero Card */}
        <section className="rounded-2xl border border-slate-800 bg-[#111827] p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs font-semibold" style={{ color: activeAccent }}>
              {availableForHire ? 'Available for Software Engineering Roles' : 'Portfolio'} ·{' '}
              {profile.location || 'Remote'}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.12] text-balance">
              {aiContent.headline}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {aiContent.bio}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {customEmail && (
                <a
                  href={`mailto:${customEmail}`}
                  style={{ backgroundColor: activeAccent }}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-slate-950 hover:opacity-90"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact Me
                </a>
              )}
              <a
                href={profile.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                GitHub Profile
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center lg:items-end gap-4">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-28 h-28 rounded-2xl object-cover border border-slate-700"
            />
            <div className="grid grid-cols-3 gap-4 text-center w-full max-w-[260px] rounded-xl border border-slate-800 bg-[#090D16] p-3">
              <div>
                <div className="font-mono-tabular text-sm font-bold text-white">
                  {profile.publicRepos}
                </div>
                <div className="text-[10px] text-slate-400">Repos</div>
              </div>
              <div>
                <div className="font-mono-tabular text-sm font-bold text-white">
                  {activity.totalStars}
                </div>
                <div className="text-[10px] text-slate-400">Stars</div>
              </div>
              <div>
                <div className="font-mono-tabular text-sm font-bold text-white">
                  {activity.pushEventsCount}
                </div>
                <div className="text-[10px] text-slate-400">Pushes</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Column Featured Builds */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white">Featured Builds</h2>
            <span className="font-mono-tabular text-xs text-slate-400">
              Top {topRepos.length} Repositories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topRepos.map((repo) => {
              const narrative = aiContent.projectNarratives[repo.name];
              return (
                <article
                  key={repo.id}
                  className="rounded-xl border border-slate-800 bg-[#111827] p-6 flex flex-col justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-mono-tabular text-xs text-slate-400 gap-2">
                      <span className="truncate">{formatRepoLanguages(repo)}</span>
                      <span>
                        {repo.stars}★ · {repo.forks} forks
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">{repo.name}</h3>
                    <p className="text-xs font-medium" style={{ color: activeAccent }}>
                      {narrative?.technicalHighlight || 'Open Source Project'}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-400">
                      {narrative?.impactSummary || repo.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-slate-800 text-xs font-semibold">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white hover:underline"
                    >
                      Source
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    {repo.homepage && (
                      <a
                        href={repo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                      >
                        Demo
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Bottom Capability & Language Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-3">
            <h2 className="font-display text-base font-bold text-white">Engineering Stack</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{aiContent.pitchSummary}</p>
            <div className="text-xs font-medium text-slate-200 leading-6 pt-2 border-t border-slate-800">
              {aiContent.highlightedSkills.join(' · ')}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 space-y-3">
            <h2 className="font-display text-base font-bold text-white">Language Breakdown</h2>
            <div className="space-y-2.5">
              {languages.slice(0, 4).map((lang) => (
                <div key={lang.language}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-200">{lang.language}</span>
                    <span className="font-mono-tabular text-slate-400">{lang.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
