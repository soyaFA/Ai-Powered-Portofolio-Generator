import React, { useState } from 'react';
import { ArrowUpRight, ExternalLink, Mail, MapPin } from 'lucide-react';
import type { PortfolioDocument } from '../../types/portfolio';
import { formatRepoLanguages } from '../../utils/portfolioHelpers';

interface TemplateProps {
  portfolio: PortfolioDocument;
}

export const ArchitectTemplate: React.FC<TemplateProps> = ({ portfolio }) => {
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

  const [langFilter, setLangFilter] = useState<string>('All');
  const uniqueLanguages = [
    'All',
    ...Array.from(
      new Set(
        topRepos.flatMap((r) =>
          r.repoLanguages && r.repoLanguages.length > 0
            ? r.repoLanguages.slice(0, 2)
            : r.language
              ? [r.language]
              : []
        )
      )
    ),
  ];

  const visibleRepos =
    langFilter === 'All'
      ? topRepos
      : topRepos.filter(
          (r) =>
            r.language === langFilter ||
            (r.repoLanguages && r.repoLanguages.includes(langFilter))
        );

  return (
    <div className="bg-white text-slate-900 border border-slate-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[760px]">
        {/* Sticky Left Architectural Dossier Column */}
        <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-8 sm:p-10 flex flex-col justify-between gap-10">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                  {profile.name}
                </h1>
                <p className="font-mono-tabular text-xs text-slate-500 mt-0.5">
                  @{profile.login}
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-6">
              <div className="text-xs font-semibold" style={{ color: accentColor }}>
                {careerTrack}
              </div>
              <p className="text-sm leading-relaxed text-slate-700">{aiContent.bio}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                {profile.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.location}
                  </span>
                )}
                <span>·</span>
                <span>
                  {availableForHire ? 'Open for Engineering Roles' : 'Portfolio Archive'}
                </span>
              </div>
            </div>

            {/* Technical Stack Inventory */}
            <div className="space-y-3 border-t border-slate-200 pt-6">
              <h2 className="font-display text-xs font-bold tracking-wide text-slate-900">
                Core Capabilities
              </h2>
              <div className="text-xs text-slate-700 leading-6">
                {aiContent.highlightedSkills.map((skill, idx) => (
                  <React.Fragment key={skill}>
                    <span className="font-medium">{skill}</span>
                    {idx < aiContent.highlightedSkills.length - 1 && (
                      <span className="mx-2 text-slate-300" aria-hidden="true">
                        ·
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Language Footprint */}
            <div className="space-y-3 border-t border-slate-200 pt-6">
              <h2 className="font-display text-xs font-bold tracking-wide text-slate-900">
                Language Footprint
              </h2>
              <div className="space-y-2.5">
                {languages.slice(0, 5).map((lang) => (
                  <div key={lang.language}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">{lang.language}</span>
                      <span className="font-mono-tabular text-slate-500">
                        {lang.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Left Column CTA Footer */}
          <div className="border-t border-slate-200 pt-6 flex flex-col gap-2.5">
            {customEmail && (
              <a
                href={`mailto:${customEmail}`}
                style={{ backgroundColor: accentColor }}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
              >
                <Mail className="w-3.5 h-3.5" />
                {customEmail}
              </a>
            )}
            <a
              href={profile.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              github.com/{profile.login}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </aside>

        {/* Right Scrollable Engineering Dossier */}
        <div className="lg:col-span-8 p-8 sm:p-12 space-y-12">
          {/* Headline & Philosophy */}
          <section className="space-y-4 border-b border-slate-200 pb-10">
            <p className="text-xs font-mono-tabular text-slate-500">
              {activity.inferredFocus} · {activity.accountYears} yrs on GitHub
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-[1.12] text-balance">
              {aiContent.headline}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              {aiContent.pitchSummary}
            </p>

            {/* Clean 4-column Architectural Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-slate-900">
                  {profile.publicRepos}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Public Repos</div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-slate-900">
                  {activity.totalStars}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Stars Earned</div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-slate-900">
                  {activity.pushEventsCount}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Recent Pushes</div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-slate-900">
                  {activity.activeDaysLast30}d
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Active (30d)</div>
              </div>
            </div>
          </section>

          {/* Filterable Architectural Repository Index */}
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-display text-xl font-bold text-slate-900">
                Engineering Work Index
              </h3>

              {uniqueLanguages.length > 2 && (
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                  {uniqueLanguages.slice(0, 5).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLangFilter(lang)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                        langFilter === lang
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
              {visibleRepos.map((repo, idx) => {
                const narrative = aiContent.projectNarratives[repo.name];
                const num = String(idx + 1).padStart(2, '0');
                return (
                  <article
                    key={repo.id}
                    className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-start"
                  >
                    <div className="sm:col-span-3">
                      <div className="font-mono-tabular text-xs text-slate-400 mb-1">
                        {num} · {formatRepoLanguages(repo)}
                      </div>
                      <div className="font-mono-tabular text-xs text-slate-500">
                        {repo.stars} stars · {repo.forks} forks
                      </div>
                    </div>

                    <div className="sm:col-span-7 space-y-1.5">
                      <h4 className="font-display text-lg font-bold text-slate-900">
                        {repo.name}
                      </h4>
                      <p className="text-xs font-semibold" style={{ color: accentColor }}>
                        {narrative?.technicalHighlight ||
                          repo.topics.slice(0, 3).join(' · ') ||
                          'Engineering Repository'}
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {narrative?.impactSummary || repo.description}
                      </p>
                    </div>

                    <div className="sm:col-span-2 flex sm:flex-col sm:items-end gap-3 text-xs font-semibold">
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-900 hover:underline whitespace-nowrap"
                      >
                        Code
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 whitespace-nowrap"
                        >
                          Live
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
