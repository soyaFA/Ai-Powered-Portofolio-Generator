import React from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import type { PortfolioDocument } from '../../types/portfolio';
import { formatCoreStack, formatRepoLanguages } from '../../utils/portfolioHelpers';

interface TemplateProps {
  portfolio: PortfolioDocument;
}

export const MinimalTemplate: React.FC<TemplateProps> = ({ portfolio }) => {
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
    <div className="bg-[#FCFCFA] text-slate-900 border border-slate-200 rounded-xl px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-12">
        {/* Ultra-Clean Header & Intro */}
        <header className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <div className="font-display text-base font-bold text-slate-900">
                  {profile.name}
                </div>
                <div className="text-xs text-slate-500">
                  @{profile.login} · {careerTrack}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <a
                href={profile.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-slate-900"
              >
                GitHub
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              {customEmail && (
                <a
                  href={`mailto:${customEmail}`}
                  style={{ color: accentColor }}
                  className="hover:underline"
                >
                  Email
                </a>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-[1.15] text-balance">
              {aiContent.headline}
            </h1>
            <p className="text-base leading-relaxed text-slate-600">{aiContent.bio}</p>
            <p className="text-xs font-mono-tabular text-slate-500">
              {profile.publicRepos} repositories · {activity.totalStars} stars · Core Stack:{' '}
              {formatCoreStack(activity, languages)} · {activity.accountYears} yrs on GitHub
            </p>
          </div>
        </header>

        {/* Minimalist Chronological Work List */}
        <section className="space-y-6 border-t border-slate-200 pt-10">
          <h2 className="font-display text-sm font-bold text-slate-900">Projects</h2>
          <div className="space-y-8">
            {topRepos.map((repo) => {
              const narrative = aiContent.projectNarratives[repo.name];
              return (
                <article key={repo.id} className="space-y-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display text-lg font-bold text-slate-900 hover:underline inline-flex items-center gap-1"
                    >
                      {repo.name}
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </a>
                    <span className="font-mono-tabular text-xs text-slate-500">
                      {formatRepoLanguages(repo)} · {repo.stars} stars
                    </span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: accentColor }}>
                    {narrative?.technicalHighlight || 'Open Source Repository'}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {narrative?.impactSummary || repo.description}
                  </p>
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      Live Demo
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Compact Stack & Languages Footer */}
        <section className="space-y-4 border-t border-slate-200 pt-10">
          <h2 className="font-display text-sm font-bold text-slate-900">Stack & Focus</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{aiContent.pitchSummary}</p>
          <div className="text-xs font-medium text-slate-800 leading-6">
            {aiContent.highlightedSkills.join(' · ')}
          </div>
          <div className="text-xs font-mono-tabular text-slate-500 pt-1">
            Languages: {languages.map((l) => `${l.language} ${l.percentage}%`).join(' · ')}
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-6 flex items-center justify-between text-xs text-slate-400">
          <span>{profile.name}</span>
          <span>{customEmail || profile.htmlUrl}</span>
        </footer>
      </div>
    </div>
  );
};
