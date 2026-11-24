import React from 'react';
import { ArrowUpRight, ExternalLink, Mail } from 'lucide-react';
import type { PortfolioDocument } from '../../types/portfolio';
import { formatCoreStack, formatRepoLanguages } from '../../utils/portfolioHelpers';

interface TemplateProps {
  portfolio: PortfolioDocument;
}

export const CardsTemplate: React.FC<TemplateProps> = ({ portfolio }) => {
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

  const langColorMap = new Map(languages.map((l) => [l.language, l.color]));

  return (
    <div className="bg-slate-100 text-slate-900 border border-slate-200 rounded-xl p-6 sm:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Clean Developer Header Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
            <div className="space-y-1.5">
              <div className="text-xs font-semibold" style={{ color: accentColor }}>
                {careerTrack} · @{profile.login}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {profile.name}
              </h1>
              <p className="text-sm text-slate-600 max-w-xl leading-relaxed">{aiContent.bio}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {customEmail && (
              <a
                href={`mailto:${customEmail}`}
                style={{ backgroundColor: accentColor }}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                <Mail className="w-3.5 h-3.5" />
                Hire / Contact
              </a>
            )}
            <a
              href={profile.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
            >
              GitHub
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* Scorecard Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs text-slate-500">Public Repositories</div>
            <div className="font-mono-tabular text-2xl font-bold text-slate-900 mt-1">
              {profile.publicRepos}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs text-slate-500">Total GitHub Stars</div>
            <div className="font-mono-tabular text-2xl font-bold text-slate-900 mt-1">
              {activity.totalStars}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs text-slate-500">Core Stack</div>
            <div className="font-mono-tabular text-lg sm:text-xl font-bold text-slate-900 mt-1.5 leading-snug">
              {formatCoreStack(activity, languages)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="text-xs text-slate-500">Active Days (30d)</div>
            <div className="font-mono-tabular text-2xl font-bold text-slate-900 mt-1">
              {activity.activeDaysLast30}d
            </div>
          </div>
        </section>

        {/* 3-Column Modular Repository Deck */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-bold text-slate-900">
              {aiContent.headline}
            </h2>
            <span className="text-xs text-slate-500">
              {aiContent.highlightedSkills.slice(0, 5).join(' · ')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topRepos.map((repo) => {
              const narrative = aiContent.projectNarratives[repo.name];
              const barColor =
                (repo.language && langColorMap.get(repo.language)) || accentColor;

              return (
                <article
                  key={repo.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="h-1.5 w-full" style={{ backgroundColor: barColor }} />
                    <div className="p-6 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono-tabular text-slate-500 gap-2">
                        <span className="truncate">{formatRepoLanguages(repo)}</span>
                        <span>
                          {repo.stars} stars · {repo.forks} forks
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        {repo.name}
                      </h3>
                      <p className="text-xs font-semibold" style={{ color: accentColor }}>
                        {narrative?.technicalHighlight || 'Software Repository'}
                      </p>
                      <p className="text-xs leading-relaxed text-slate-600">
                        {narrative?.impactSummary || repo.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-semibold">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-900 hover:underline"
                    >
                      View Repo
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    {repo.homepage && (
                      <a
                        href={repo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900"
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
