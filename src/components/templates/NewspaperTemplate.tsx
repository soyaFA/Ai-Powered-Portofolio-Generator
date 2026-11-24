import React from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import type { PortfolioDocument } from '../../types/portfolio';
import { formatRepoLanguages } from '../../utils/portfolioHelpers';

interface TemplateProps {
  portfolio: PortfolioDocument;
}

export const NewspaperTemplate: React.FC<TemplateProps> = ({ portfolio }) => {
  const {
    profile,
    topRepos,
    languages,
    activity,
    aiContent,
    careerTrack,
    accentColor,
    customEmail,
  } = portfolio;

  return (
    <div className="bg-[#F7F5F0] text-stone-900 border border-stone-300 rounded-xl px-6 sm:px-12 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Broadsheet Masthead */}
        <header className="border-b-2 border-stone-900 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tabular text-stone-600 border-b border-stone-300 pb-2 mb-4">
            <span>@{profile.login} · Engineering Dossier</span>
            <span>{profile.location || 'Remote'}</span>
            <span>{activity.accountYears} yrs on GitHub</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-stone-950">
                {profile.name}
              </h1>
              <p className="text-sm font-medium mt-1" style={{ color: accentColor }}>
                {careerTrack}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <a
                href={profile.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-stone-900 hover:underline"
              >
                GitHub
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              {customEmail && (
                <a href={`mailto:${customEmail}`} className="text-stone-700 hover:underline">
                  {customEmail}
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Lead Story + GitHub Ledger Column */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-stone-300 pb-8">
          <div className="lg:col-span-8 lg:border-r lg:border-stone-300 lg:pr-8 space-y-4">
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold leading-tight text-stone-950 text-balance">
              {aiContent.headline}
            </h2>
            <p className="text-base leading-relaxed text-stone-700">{aiContent.bio}</p>
            <p className="text-sm italic text-stone-600 border-t border-stone-200 pt-3">
              {aiContent.pitchSummary}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between gap-5">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-lg object-cover border border-stone-400 grayscale-[15%]"
              />
              <div className="text-xs text-stone-600 space-y-0.5">
                <div className="font-semibold text-stone-900">GitHub Ledger</div>
                <div className="font-mono-tabular">{profile.publicRepos} Public Repos</div>
                <div className="font-mono-tabular">{activity.totalStars} Stars Earned</div>
                <div className="font-mono-tabular">{activity.pushEventsCount} Recent Pushes</div>
              </div>
            </div>

            <div className="border-t border-stone-300 pt-3 space-y-2">
              <div className="text-xs font-semibold text-stone-900">Primary Stack</div>
              <div className="text-xs text-stone-700 leading-5">
                {aiContent.highlightedSkills.join(' · ')}
              </div>
            </div>
          </div>
        </section>

        {/* 3-Column Broadsheet Repository Columns */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-stone-900 pb-2">
            <h2 className="font-editorial text-xl font-bold text-stone-950">
              Published Engineering Repositories
            </h2>
            <span className="font-mono-tabular text-xs text-stone-600">
              {languages.map((l) => `${l.language} ${l.percentage}%`).slice(0, 3).join(' · ')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 pt-2">
            {topRepos.map((repo, idx) => {
              const narrative = aiContent.projectNarratives[repo.name];
              return (
                <article
                  key={repo.id}
                  className="flex flex-col justify-between border-b border-stone-300 pb-6"
                >
                  <div className="space-y-2">
                    <div className="font-mono-tabular text-[11px] text-stone-500">
                      No. {String(idx + 1).padStart(2, '0')} · {formatRepoLanguages(repo)} ·{' '}
                      {repo.stars}★
                    </div>
                    <h3 className="font-editorial text-lg font-bold text-stone-950">
                      {repo.name}
                    </h3>
                    <p className="text-xs font-semibold" style={{ color: accentColor }}>
                      {narrative?.technicalHighlight || 'Open Source Project'}
                    </p>
                    <p className="text-xs leading-relaxed text-stone-700">
                      {narrative?.impactSummary || repo.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-4 text-xs font-semibold text-stone-900">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:underline"
                    >
                      Repository
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    {repo.homepage && (
                      <a
                        href={repo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900"
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
  );
};
