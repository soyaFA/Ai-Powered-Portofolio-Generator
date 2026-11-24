import React from 'react';
import { ArrowUpRight, ExternalLink, Mail } from 'lucide-react';
import type { PortfolioDocument } from '../../types/portfolio';
import { formatRepoLanguages } from '../../utils/portfolioHelpers';

interface TemplateProps {
  portfolio: PortfolioDocument;
}

export const SpotlightTemplate: React.FC<TemplateProps> = ({ portfolio }) => {
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

  const effectiveAccent = accentColor === '#0F172A' ? '#F59E0B' : accentColor;

  return (
    <div className="bg-[#09090B] text-zinc-100 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Top Bar */}
      <div className="mx-auto max-w-5xl px-8 py-6 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
        <span className="font-editorial text-lg font-semibold tracking-tight text-white">
          {profile.name}
        </span>
        <div className="flex items-center gap-6 text-xs text-zinc-400">
          <a href="#obsidian-work" className="hover:text-white transition-colors">
            Selected Projects
          </a>
          <a href="#obsidian-stack" className="hover:text-white transition-colors">
            Capabilities
          </a>
          <a
            href={profile.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-zinc-200 hover:text-white"
          >
            GitHub
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* High-Contrast Dark Editorial Hero */}
      <div className="mx-auto max-w-5xl px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-zinc-400 mb-4">
              {careerTrack} · {profile.location || 'Remote'} ·{' '}
              {availableForHire ? 'Available for Hire' : 'Selected Archive'}
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl font-semibold leading-[1.1] tracking-tight text-white text-balance mb-6">
              {aiContent.headline}
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-zinc-300 max-w-2xl mb-8">
              {aiContent.bio}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={customEmail ? `mailto:${customEmail}` : profile.htmlUrl}
              target={customEmail ? undefined : '_blank'}
              rel={customEmail ? undefined : 'noopener noreferrer'}
              style={{ backgroundColor: effectiveAccent }}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-zinc-950 transition-opacity hover:opacity-90"
            >
              {customEmail ? (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  Start a Conversation
                </>
              ) : (
                <>
                  Explore GitHub
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </>
              )}
            </a>
            <span className="font-mono-tabular text-xs text-zinc-400">
              {activity.inferredFocus}
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <div className="aspect-square w-full max-w-[200px] mx-auto overflow-hidden rounded-xl border border-zinc-800 mb-6">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-5 text-center">
            <div>
              <div className="font-mono-tabular text-xl font-semibold text-white">
                {profile.publicRepos}
              </div>
              <div className="text-[11px] text-zinc-400">Repositories</div>
            </div>
            <div>
              <div className="font-mono-tabular text-xl font-semibold text-white">
                {activity.totalStars}
              </div>
              <div className="text-[11px] text-zinc-400">GitHub Stars</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Build Showcase */}
      {topRepos[0] && (
        <div className="border-y border-zinc-800 bg-zinc-900/40">
          <div className="mx-auto max-w-5xl px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-8 flex flex-col justify-between py-1">
              <div>
                <div className="font-mono-tabular text-xs text-zinc-400 mb-2">
                  01 · Flagship Build · {formatRepoLanguages(topRepos[0])}
                </div>
                <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-white mb-2">
                  {topRepos[0].name}
                </h2>
                <p
                  className="text-xs font-semibold mb-3"
                  style={{ color: effectiveAccent }}
                >
                  {aiContent.projectNarratives[topRepos[0].name]?.technicalHighlight ||
                    'Featured Architecture'}
                </p>
                <p className="text-sm leading-relaxed text-zinc-300 mb-6">
                  {aiContent.projectNarratives[topRepos[0].name]?.impactSummary ||
                    topRepos[0].description}
                </p>
              </div>
              <div className="flex items-center gap-6 text-xs font-semibold">
                <a
                  href={topRepos[0].htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-white hover:underline"
                >
                  Inspect Source
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                {topRepos[0].homepage && (
                  <a
                    href={topRepos[0].homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white"
                  >
                    Live Deployment
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 flex flex-col justify-between gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-mono-tabular text-2xl font-semibold text-white">
                    {topRepos[0].stars}
                  </div>
                  <div className="text-xs text-zinc-400">GitHub Stars</div>
                </div>
                <div>
                  <div className="font-mono-tabular text-2xl font-semibold text-white">
                    {topRepos[0].forks}
                  </div>
                  <div className="text-xs text-zinc-400">Forks</div>
                </div>
              </div>
              <div className="border-t border-zinc-800 pt-4 space-y-1.5">
                <div className="text-xs text-zinc-400">Topics & Stack</div>
                <div className="font-mono-tabular text-xs text-zinc-200 leading-5">
                  {topRepos[0].topics.length > 0
                    ? topRepos[0].topics.join(' · ')
                    : topRepos[0].language || 'Open Source'}
                </div>
              </div>
              <div className="border-t border-zinc-800 pt-3 font-mono-tabular text-xs text-zinc-500">
                Last push {new Date(topRepos[0].pushedAt || topRepos[0].updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Grid */}
      <div id="obsidian-work" className="mx-auto max-w-5xl px-8 py-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
          <h2 className="font-editorial text-2xl font-semibold text-white">
            Selected Works
          </h2>
          <span className="font-mono-tabular text-xs text-zinc-400">
            {activity.pushEventsCount} recent commits · {activity.accountYears} yrs tenure
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topRepos.slice(1).map((repo, idx) => {
            const narrative = aiContent.projectNarratives[repo.name];
            const num = String(idx + 2).padStart(2, '0');
            return (
              <article
                key={repo.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col justify-between gap-5 hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="font-mono-tabular text-xs text-zinc-400 mb-2">
                    {num} · {formatRepoLanguages(repo)} · {repo.stars} stars · {repo.forks}{' '}
                    forks
                  </div>
                  <h3 className="font-editorial text-xl font-semibold text-white mb-1.5">
                    {repo.name}
                  </h3>
                  <p
                    className="text-xs font-medium mb-3"
                    style={{ color: effectiveAccent }}
                  >
                    {narrative?.technicalHighlight ||
                      repo.topics.slice(0, 3).join(' · ') ||
                      'Engineering Build'}
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {narrative?.impactSummary || repo.description}
                  </p>
                </div>

                <div className="flex items-center gap-5 pt-4 border-t border-zinc-800/80 text-xs font-semibold">
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-zinc-200 hover:text-white"
                  >
                    Repository
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-zinc-400 hover:text-white"
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

      {/* Capabilities & Languages */}
      <div id="obsidian-stack" className="border-t border-zinc-800 bg-zinc-900/30">
        <div className="mx-auto max-w-5xl px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-editorial text-xl font-semibold text-white mb-3">
              Engineering Philosophy
            </h2>
            <p className="text-sm leading-relaxed text-zinc-400 mb-5">
              {aiContent.pitchSummary}
            </p>
            <div className="text-sm font-medium text-zinc-200 leading-7">
              {aiContent.highlightedSkills.map((skill, idx) => (
                <React.Fragment key={skill}>
                  <span>{skill}</span>
                  {idx < aiContent.highlightedSkills.length - 1 && (
                    <span className="mx-2 text-zinc-600" aria-hidden="true">
                      ·
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-editorial text-xl font-semibold text-white mb-4">
              Language Footprint
            </h2>
            <div className="space-y-3">
              {languages.map((lang) => (
                <div key={lang.language}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-200 font-medium">{lang.language}</span>
                    <span className="font-mono-tabular text-zinc-400">
                      {lang.percentage}% ({lang.repoCount} repos)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
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

      {/* Footer */}
      <div className="border-t border-zinc-800 px-8 py-6">
        <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <span>
            {profile.name} · @{profile.login}
          </span>
          <span>{customEmail || profile.blog || profile.htmlUrl}</span>
        </div>
      </div>
    </div>
  );
};
