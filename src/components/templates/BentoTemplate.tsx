import React from 'react';
import { ArrowUpRight, ExternalLink, Mail } from 'lucide-react';
import type { PortfolioDocument } from '../../types/portfolio';
import { formatRepoLanguages } from '../../utils/portfolioHelpers';

interface TemplateProps {
  portfolio: PortfolioDocument;
}

export const BentoTemplate: React.FC<TemplateProps> = ({ portfolio }) => {
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

  const leadRepo = topRepos[0];
  const secondaryRepos = topRepos.slice(1);

  return (
    <div className="bg-slate-50 text-slate-900 border border-slate-200 rounded-xl p-6 sm:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Swiss Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="font-display text-lg font-bold tracking-tight text-slate-900">
            {profile.name}
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <span>{careerTrack}</span>
            <a
              href={profile.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-900 hover:underline inline-flex items-center gap-1"
            >
              GitHub
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bento Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Primary Identity Bento Tile */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: accentColor }}>
                {availableForHire ? 'Available for Engineering Opportunities' : 'Developer Showcase'} ·{' '}
                {profile.location || 'Remote'}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-[1.12] text-balance mb-4">
                {aiContent.headline}
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600 mb-6">
                {aiContent.bio}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {customEmail ? (
                <a
                  href={`mailto:${customEmail}`}
                  style={{ backgroundColor: accentColor }}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Contact Me
                </a>
              ) : null}
              <a
                href={profile.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                github.com/{profile.login}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Portrait + Quick Telemetry Tile */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between gap-5">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <div className="font-display text-base font-bold text-slate-900">
                  {profile.name}
                </div>
                <div className="text-xs text-slate-500">{activity.inferredFocus}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-slate-900">
                  {profile.publicRepos}
                </div>
                <div className="text-xs text-slate-500">Public Repos</div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-slate-900">
                  {activity.totalStars}
                </div>
                <div className="text-xs text-slate-500">Total Stars</div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-slate-900">
                  {activity.pushEventsCount}
                </div>
                <div className="text-xs text-slate-500">Recent Pushes</div>
              </div>
              <div>
                <div className="font-mono-tabular text-2xl font-bold text-slate-900">
                  {activity.accountYears}y
                </div>
                <div className="text-xs text-slate-500">On GitHub</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Bento Row: Spotlight Project + Stack & Languages */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {leadRepo && (
            <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-8 flex flex-col justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-3">
                  Spotlight Project · {formatRepoLanguages(leadRepo)} ·{' '}
                  <span className="font-mono-tabular">{leadRepo.stars} stars</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-white mb-2">
                  {leadRepo.name}
                </h2>
                <p className="text-xs font-semibold text-blue-300 mb-3">
                  {aiContent.projectNarratives[leadRepo.name]?.technicalHighlight ||
                    'Featured Engineering Architecture'}
                </p>
                <p className="text-sm leading-relaxed text-slate-300 mb-6">
                  {aiContent.projectNarratives[leadRepo.name]?.impactSummary ||
                    leadRepo.description}
                </p>
              </div>
              <div className="flex items-center gap-5 text-xs font-semibold">
                <a
                  href={leadRepo.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white hover:underline"
                >
                  Source Repository
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                {leadRepo.homepage && (
                  <a
                    href={leadRepo.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
                  >
                    Live Demo
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 mb-2">
                Stack & Languages
              </h2>
              <p className="text-xs text-slate-500 mb-4">{aiContent.pitchSummary}</p>
              <div className="space-y-2.5 mb-5">
                {languages.slice(0, 4).map((lang) => (
                  <div key={lang.language}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-800">{lang.language}</span>
                      <span className="font-mono-tabular text-slate-500">{lang.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 text-xs font-medium text-slate-700 leading-6">
              {aiContent.highlightedSkills.join(' · ')}
            </div>
          </div>
        </div>

        {/* Lower Bento Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {secondaryRepos.map((repo) => {
            const narrative = aiContent.projectNarratives[repo.name];
            return (
              <article
                key={repo.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs text-slate-500 mb-2">
                    {formatRepoLanguages(repo)} ·{' '}
                    <span className="font-mono-tabular">{repo.stars} stars</span> ·{' '}
                    <span className="font-mono-tabular">{repo.forks} forks</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-1.5">
                    {repo.name}
                  </h3>
                  <p className="text-xs font-medium mb-2" style={{ color: accentColor }}>
                    {narrative?.technicalHighlight || 'Engineering Build'}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600 mb-4">
                    {narrative?.impactSummary || repo.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-900">
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    GitHub
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
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

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            {profile.name} (@{profile.login})
          </span>
          <span>{customEmail || profile.htmlUrl}</span>
        </div>
      </div>
    </div>
  );
};
