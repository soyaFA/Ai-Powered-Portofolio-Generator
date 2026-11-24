import React from 'react';
import { ArrowUpRight, ExternalLink, GitFork, Star } from 'lucide-react';
import type { PortfolioDocument } from '../../types/portfolio';
import { formatCoreStack, formatRepoLanguages } from '../../utils/portfolioHelpers';

interface TemplateProps {
  portfolio: PortfolioDocument;
}

export const TerminalTemplate: React.FC<TemplateProps> = ({ portfolio }) => {
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
    <div className="bg-[#0B0F17] text-slate-100 border border-slate-800 rounded-xl overflow-hidden">
      {/* Top Architecture Header */}
      <div className="border-b border-slate-800 px-8 py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono-tabular text-sm font-semibold tracking-tight text-white">
            {profile.login}.dev
          </span>
          <span className="text-slate-600" aria-hidden="true">
            /
          </span>
          <span className="text-xs text-slate-400">{careerTrack}</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-400 font-mono-tabular">
          <a href="#sys-repos" className="hover:text-white transition-colors">
            Repositories
          </a>
          <a href="#sys-telemetry" className="hover:text-white transition-colors">
            Activity
          </a>
          <a
            href={profile.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline inline-flex items-center gap-1"
          >
            GitHub
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Systems Hero Grid */}
      <div className="mx-auto max-w-5xl px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-b border-slate-800">
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-mono-tabular text-slate-400 mb-3">
              {profile.location || 'Remote'} ·{' '}
              {availableForHire ? 'Available for Full-Time / Internship' : 'Archive'}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.12] text-balance mb-5">
              {aiContent.headline}
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-slate-300 max-w-2xl mb-7">
              {aiContent.bio}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={customEmail ? `mailto:${customEmail}` : profile.htmlUrl}
              target={customEmail ? undefined : '_blank'}
              rel={customEmail ? undefined : 'noopener noreferrer'}
              style={{ backgroundColor: accentColor }}
              className="rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              {customEmail ? 'Send Message' : 'Open GitHub Profile'}
            </a>
            <span className="font-mono-tabular text-xs text-slate-400">
              {activity.pushEventsCount} recent pushes · {activity.activeDaysLast30} active days (30d)
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-5">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-lg object-cover border border-slate-700"
            />
            <div>
              <div className="text-sm font-semibold text-white">{profile.name}</div>
              <div className="font-mono-tabular text-xs text-slate-400">@{profile.login}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
            <div>
              <div className="font-mono-tabular text-lg font-semibold text-white">
                {profile.publicRepos}
              </div>
              <div className="text-[11px] text-slate-400">Repositories</div>
            </div>
            <div>
              <div className="font-mono-tabular text-lg font-semibold text-white">
                {activity.totalStars}
              </div>
              <div className="text-[11px] text-slate-400">Total Stars</div>
            </div>
            <div>
              <div className="font-mono-tabular text-lg font-semibold text-white">
                {profile.followers}
              </div>
              <div className="text-[11px] text-slate-400">Followers</div>
            </div>
            <div>
              <div className="font-mono-tabular text-lg font-semibold text-white">
                {activity.accountYears}y
              </div>
              <div className="text-[11px] text-slate-400">Tenure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Telemetry & GitHub Activity Breakdown */}
      <div
        id="sys-telemetry"
        className="mx-auto max-w-5xl px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-slate-800 items-stretch"
      >
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <h2 className="font-mono-tabular text-sm font-semibold text-white mb-4">
              Language Footprint & Stack Inventory
            </h2>
            <p className="text-sm text-slate-400 mb-5">{aiContent.pitchSummary}</p>
            <div className="space-y-3 mb-6">
              {languages.map((lang) => (
                <div key={lang.language} className="grid grid-cols-12 items-center gap-3">
                  <span className="col-span-3 text-xs font-mono-tabular text-slate-200 truncate">
                    {lang.language}
                  </span>
                  <div className="col-span-7 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                    />
                  </div>
                  <span className="col-span-2 text-right text-xs font-mono-tabular text-slate-400">
                    {lang.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 text-xs font-mono-tabular text-slate-300 leading-6">
            {aiContent.highlightedSkills.join(' · ')}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between gap-5">
          <div>
            <h3 className="font-mono-tabular text-sm font-semibold text-white mb-1">
              GitHub Activity Telemetry
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated from public events & repository history
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
            <div>
              <div className="font-mono-tabular text-xl font-semibold text-white">
                {activity.pushEventsCount}
              </div>
              <div className="text-[11px] text-slate-400">Recent Push Events</div>
            </div>
            <div>
              <div className="font-mono-tabular text-xl font-semibold text-white">
                {activity.prEventsCount}
              </div>
              <div className="text-[11px] text-slate-400">Pull Request Events</div>
            </div>
            <div>
              <div className="font-mono-tabular text-xl font-semibold text-white">
                {activity.activeDaysLast30}d
              </div>
              <div className="text-[11px] text-slate-400">Active Days (30d)</div>
            </div>
            <div>
              <div className="font-mono-tabular text-xl font-semibold text-white">
                {activity.totalForks}
              </div>
              <div className="text-[11px] text-slate-400">Total Repo Forks</div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-3 font-mono-tabular text-xs text-slate-400">
            Core Stack: <span className="text-white">{formatCoreStack(activity, languages)}</span>
          </div>
        </div>
      </div>

      {/* Dense Repository Matrix */}
      <div id="sys-repos" className="mx-auto max-w-5xl px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-mono-tabular text-sm font-semibold text-white">
            Production & Open-Source Repositories
          </h2>
          <span className="font-mono-tabular text-xs text-slate-400">
            Showing top {topRepos.length} analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topRepos.map((repo) => {
            const narrative = aiContent.projectNarratives[repo.name];
            return (
              <article
                key={repo.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono-tabular text-xs text-slate-400">
                      {formatRepoLanguages(repo)}
                    </span>
                    <div className="flex items-center gap-3 font-mono-tabular text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {repo.stars}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        {repo.forks}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-mono-tabular text-base font-semibold text-white mb-1.5">
                    {repo.name}
                  </h3>
                  <p className="text-xs font-medium mb-2.5" style={{ color: accentColor }}>
                    {narrative?.technicalHighlight || 'Software Engineering Repository'}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-400 mb-4">
                    {narrative?.impactSummary || repo.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-mono-tabular">
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-200 hover:text-white"
                  >
                    git/repo
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                    >
                      live
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 px-8 py-5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tabular text-slate-500">
        <span>{profile.name}</span>
        <span>{customEmail || profile.htmlUrl}</span>
      </div>
    </div>
  );
};
