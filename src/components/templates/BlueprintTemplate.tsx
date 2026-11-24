import React from 'react';
import { ArrowUpRight, ExternalLink, Mail, MapPin } from 'lucide-react';
import type { PortfolioDocument } from '../../types/portfolio';
import { formatRepoLanguages } from '../../utils/portfolioHelpers';

interface TemplateProps {
  portfolio: PortfolioDocument;
}

export const BlueprintTemplate: React.FC<TemplateProps> = ({ portfolio }) => {
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

  return (
    <div className="bg-white text-slate-900 border border-slate-200 rounded-xl overflow-hidden">
      {/* Top Recruiter Spec Sheet Banner */}
      <div className="border-b border-slate-200 bg-slate-50 px-8 py-8 sm:px-12">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-xl object-cover border border-slate-300 shrink-0"
            />
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {profile.name}
              </h1>
              <p className="text-sm font-semibold mt-0.5" style={{ color: accentColor }}>
                {careerTrack}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5">
                <span className="font-mono-tabular">@{profile.login}</span>
                {profile.location && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {profile.location}
                    </span>
                  </>
                )}
                <span>·</span>
                <span>{availableForHire ? 'Available for Engineering Roles' : 'Portfolio'}</span>
              </div>
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
                Email
              </a>
            )}
            <a
              href={profile.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
            >
              GitHub Profile
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-8 py-10 sm:px-12 space-y-10">
        {/* Executive Engineering Summary */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-8 border-b border-slate-200">
          <div className="md:col-span-3">
            <h2 className="font-display text-xs font-bold tracking-wide text-slate-500">
              Engineering Summary
            </h2>
          </div>
          <div className="md:col-span-9 space-y-3">
            <h3 className="font-display text-xl font-bold text-slate-900 leading-snug">
              {aiContent.headline}
            </h3>
            <p className="text-sm leading-relaxed text-slate-700">{aiContent.bio}</p>
            <p className="text-xs text-slate-500">{aiContent.pitchSummary}</p>
          </div>
        </section>

        {/* Technical Skills & Language Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-8 border-b border-slate-200">
          <div className="md:col-span-3">
            <h2 className="font-display text-xs font-bold tracking-wide text-slate-500">
              Skills & Languages
            </h2>
          </div>
          <div className="md:col-span-9 space-y-5">
            <div className="text-sm font-medium text-slate-900 leading-7">
              {aiContent.highlightedSkills.join(' · ')}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <div>
                <div className="font-mono-tabular text-lg font-bold text-slate-900">
                  {profile.publicRepos}
                </div>
                <div className="text-[11px] text-slate-500">Public Repos</div>
              </div>
              <div>
                <div className="font-mono-tabular text-lg font-bold text-slate-900">
                  {activity.totalStars}
                </div>
                <div className="text-[11px] text-slate-500">Stars Earned</div>
              </div>
              <div>
                <div className="font-mono-tabular text-lg font-bold text-slate-900">
                  {activity.pushEventsCount}
                </div>
                <div className="text-[11px] text-slate-500">Recent Pushes</div>
              </div>
              <div>
                <div className="font-mono-tabular text-lg font-bold text-slate-900">
                  {activity.accountYears} yrs
                </div>
                <div className="text-[11px] text-slate-500">GitHub Tenure</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {languages.slice(0, 4).map((lang) => (
                <div key={lang.language}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-800">{lang.language}</span>
                    <span className="font-mono-tabular text-slate-500">
                      {lang.percentage}% ({lang.repoCount})
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
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

        {/* Chronological Project Experience */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <h2 className="font-display text-xs font-bold tracking-wide text-slate-500">
              Selected Projects
            </h2>
          </div>
          <div className="md:col-span-9 divide-y divide-slate-200">
            {topRepos.map((repo) => {
              const narrative = aiContent.projectNarratives[repo.name];
              return (
                <article key={repo.id} className="py-5 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {repo.name}
                    </h3>
                    <span className="font-mono-tabular text-xs text-slate-500">
                      {formatRepoLanguages(repo)} · {repo.stars} stars · {repo.forks} forks
                    </span>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: accentColor }}>
                    {narrative?.technicalHighlight || 'Software Engineering Build'}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {narrative?.impactSummary || repo.description}
                  </p>
                  <div className="flex items-center gap-4 pt-1 text-xs font-semibold">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-900 hover:underline"
                    >
                      Source Code
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    {repo.homepage && (
                      <a
                        href={repo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
                      >
                        Live Demo
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
