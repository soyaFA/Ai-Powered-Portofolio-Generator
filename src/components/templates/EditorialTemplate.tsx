import React from 'react';
import { ArrowUpRight, ExternalLink, Mail } from 'lucide-react';
import type { PortfolioDocument } from '../../types/portfolio';
import { formatCoreStack, formatRepoLanguages } from '../../utils/portfolioHelpers';

interface TemplateProps {
  portfolio: PortfolioDocument;
}

export const EditorialTemplate: React.FC<TemplateProps> = ({ portfolio }) => {
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
    <div className="bg-[#FAF9F6] text-slate-900 border border-stone-200 rounded-xl overflow-hidden">
      {/* Portfolio internal header */}
      <div className="mx-auto max-w-5xl px-8 pt-10 pb-6 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <span className="font-editorial text-lg font-semibold tracking-tight text-slate-900">
          {profile.name}
        </span>
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <a href="#editorial-work" className="hover:text-slate-900 transition-colors">
            Selected Work
          </a>
          <a href="#editorial-craft" className="hover:text-slate-900 transition-colors">
            Capabilities
          </a>
          <a
            href={profile.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
          >
            GitHub
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Editorial Split Hero */}
      <div className="mx-auto max-w-5xl px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-stone-500 mb-4">
              {careerTrack} · {profile.location || 'Remote'} ·{' '}
              {availableForHire ? 'Open to Engineering Roles' : 'Portfolio Archive'}
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.12] tracking-tight text-slate-900 text-balance mb-6">
              {aiContent.headline}
            </h1>
            <p className="text-base leading-relaxed text-slate-600 max-w-2xl mb-8">
              {aiContent.bio}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {customEmail ? (
              <a
                href={`mailto:${customEmail}`}
                style={{ backgroundColor: accentColor }}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Mail className="w-4 h-4" />
                Contact Directly
              </a>
            ) : (
              <a
                href={profile.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: accentColor }}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Explore GitHub
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
            <span className="text-sm text-stone-500">
              @{profile.login} · {activity.inferredFocus}
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-end">
          <div className="aspect-square w-full max-w-[260px] lg:max-w-none overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
            <img
              src={profile.avatarUrl}
              alt={`${profile.name} portrait`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Full-width KPI strip below hero */}
      <div className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <div className="font-mono-tabular text-2xl font-semibold text-slate-900">
              {profile.publicRepos}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">Public Repositories</div>
          </div>
          <div>
            <div className="font-mono-tabular text-2xl font-semibold text-slate-900">
              {activity.totalStars}
            </div>
            <div className="text-xs text-stone-500 mt-0.5">GitHub Stars Earned</div>
          </div>
          <div>
            <div className="font-mono-tabular text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
              {formatCoreStack(activity, languages)}
            </div>
            <div className="text-xs text-stone-500 mt-1">Core Stack</div>
          </div>
          <div>
            <div className="font-mono-tabular text-2xl font-semibold text-slate-900">
              {activity.accountYears} yrs
            </div>
            <div className="text-xs text-stone-500 mt-0.5">Active Engineering</div>
          </div>
        </div>
      </div>

      {/* Selected Engineering Case Studies */}
      <div id="editorial-work" className="mx-auto max-w-5xl px-8 py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-10">
          <h2 className="font-editorial text-2xl font-semibold text-slate-900">
            Selected Engineering Case Studies
          </h2>
          <span className="text-xs text-stone-500">
            Ranked by commit recency, impact & documentation
          </span>
        </div>

        {/* Lead Case Study with structured GitHub telemetry */}
        {topRepos[0] && (
          <div className="mb-12 rounded-xl border border-stone-200 bg-white p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <div className="text-xs text-stone-500 mb-2">
                  01. Featured Repository · {formatRepoLanguages(topRepos[0])}
                </div>
                <h3 className="font-editorial text-2xl font-semibold text-slate-900 mb-2">
                  {topRepos[0].name}
                </h3>
                <p className="text-sm font-medium mb-3" style={{ color: accentColor }}>
                  {aiContent.projectNarratives[topRepos[0].name]?.technicalHighlight ||
                    'Primary Open-Source Architecture'}
                </p>
                <p className="text-sm leading-relaxed text-slate-600 mb-5">
                  {aiContent.projectNarratives[topRepos[0].name]?.impactSummary ||
                    topRepos[0].description}
                </p>
              </div>
              <div className="flex items-center gap-5 text-sm font-medium">
                <a
                  href={topRepos[0].htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-900 hover:underline"
                >
                  Inspect Repository
                  <ArrowUpRight className="w-4 h-4" />
                </a>
                {topRepos[0].homepage && (
                  <a
                    href={topRepos[0].homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900"
                  >
                    Live Deployment
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-stone-200 pt-5 lg:pt-0 lg:pl-8 flex flex-col justify-between gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-mono-tabular text-xl font-semibold text-slate-900">
                    {topRepos[0].stars}
                  </div>
                  <div className="text-xs text-stone-500">Stars</div>
                </div>
                <div>
                  <div className="font-mono-tabular text-xl font-semibold text-slate-900">
                    {topRepos[0].forks}
                  </div>
                  <div className="text-xs text-stone-500">Forks</div>
                </div>
              </div>
              <div className="border-t border-stone-100 pt-4 space-y-1.5">
                <div className="text-xs font-medium text-stone-500">Repository Topics</div>
                <div className="text-xs font-mono-tabular text-slate-800 leading-5">
                  {topRepos[0].topics.length > 0
                    ? topRepos[0].topics.join(' · ')
                    : topRepos[0].language || 'Open Source'}
                </div>
              </div>
              <div className="text-xs font-mono-tabular text-stone-500">
                Updated {new Date(topRepos[0].pushedAt || topRepos[0].updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        {/* Remaining Case Studies in clean 2-column monograph */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
          {topRepos.slice(1).map((repo, index) => {
            const narrative = aiContent.projectNarratives[repo.name];
            const num = String(index + 2).padStart(2, '0');
            return (
              <article
                key={repo.id}
                className="flex flex-col justify-between pb-8 border-b border-stone-200"
              >
                <div>
                  <div className="text-xs text-stone-500 mb-2">
                    {num}. {formatRepoLanguages(repo)} ·{' '}
                    <span className="font-mono-tabular">{repo.stars} stars</span> ·{' '}
                    <span className="font-mono-tabular">{repo.forks} forks</span>
                  </div>
                  <h3 className="font-editorial text-xl font-semibold text-slate-900 mb-1.5">
                    {repo.name}
                  </h3>
                  <p className="text-xs font-medium mb-2.5" style={{ color: accentColor }}>
                    {narrative?.technicalHighlight || repo.topics.slice(0, 3).join(' · ') || 'Repository'}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-600 mb-4">
                    {narrative?.impactSummary || repo.description}
                  </p>
                </div>
                <div className="flex items-center gap-5 text-xs font-semibold text-slate-900">
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    View Code
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
      </div>

      {/* Capabilities & Language Matrix */}
      <div id="editorial-craft" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-editorial text-xl font-semibold text-slate-900 mb-3">
              Engineering Approach
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 mb-5">{aiContent.pitchSummary}</p>
            <div className="text-sm font-medium text-slate-900 leading-7">
              {aiContent.highlightedSkills.map((skill, idx) => (
                <React.Fragment key={skill}>
                  <span>{skill}</span>
                  {idx < aiContent.highlightedSkills.length - 1 && (
                    <span className="mx-2 text-stone-300" aria-hidden="true">
                      ·
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-editorial text-xl font-semibold text-slate-900 mb-4">
              Codebase Language Breakdown
            </h2>
            <div className="space-y-3">
              {languages.map((lang) => (
                <div key={lang.language}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-800">{lang.language}</span>
                    <span className="font-mono-tabular text-stone-500">
                      {lang.percentage}% ({lang.repoCount} repos)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
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
      </div>

      {/* Quiet Footer */}
      <div className="border-t border-stone-200 bg-[#FAF9F6] px-8 py-6">
        <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
          <span>
            {profile.name} · @{profile.login}
          </span>
          <span>{customEmail || profile.blog || profile.htmlUrl}</span>
        </div>
      </div>
    </div>
  );
};
