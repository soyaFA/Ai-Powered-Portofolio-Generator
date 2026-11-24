import type { PortfolioDocument } from '../types/portfolio';
import { formatCoreStack, formatRepoLanguages } from './portfolioHelpers';

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function generateStandaloneHtml(portfolio: PortfolioDocument): string {
  const {
    profile,
    topRepos,
    languages,
    activity,
    aiContent,
    templateId,
    careerTrack,
    customEmail,
    accentColor,
  } = portfolio;

  const isDark =
    templateId === 'terminal' ||
    templateId === 'spotlight' ||
    templateId === 'matrix' ||
    templateId === 'slate';
  const isArchitect = templateId === 'architect' || templateId === 'splitdark';
  const isDarkSidebar = templateId === 'splitdark';
  const isSingleColumn = templateId === 'minimal' || templateId === 'matrix';

  const bg =
    templateId === 'terminal'
      ? '#0B0F17'
      : templateId === 'slate'
        ? '#090D16'
        : templateId === 'spotlight'
          ? '#09090B'
          : templateId === 'matrix'
            ? '#06090F'
            : templateId === 'editorial'
              ? '#FAF9F6'
              : templateId === 'newspaper'
                ? '#F7F5F0'
                : templateId === 'minimal'
                  ? '#FCFCFA'
                  : templateId === 'cards'
                    ? '#F1F5F9'
                    : templateId === 'architect' ||
                        templateId === 'blueprint' ||
                        templateId === 'splitdark'
                      ? '#FFFFFF'
                      : '#F8FAFC';

  const surface =
    templateId === 'terminal' || templateId === 'slate'
      ? '#111827'
      : templateId === 'spotlight'
        ? '#18181B'
        : templateId === 'matrix'
          ? '#0A0F1A'
          : '#FFFFFF';

  const border =
    templateId === 'terminal' || templateId === 'matrix' || templateId === 'slate'
      ? '#1E293B'
      : templateId === 'spotlight'
        ? '#27272A'
        : templateId === 'newspaper'
          ? '#D6D3D1'
          : '#E2E8F0';

  const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
  const textMuted = isDark ? '#A1A1AA' : '#475569';
  const resolvedAccent =
    templateId === 'spotlight' && accentColor === '#0F172A'
      ? '#F59E0B'
      : templateId === 'matrix' && accentColor === '#0F172A'
        ? '#10B981'
        : (templateId === 'slate' || templateId === 'splitdark') && accentColor === '#0F172A'
          ? '#38BDF8'
          : accentColor;

  const headingFont =
    templateId === 'editorial' || templateId === 'spotlight' || templateId === 'newspaper'
      ? "'Fraunces', Georgia, serif"
      : templateId === 'terminal' || templateId === 'matrix'
        ? "'JetBrains Mono', monospace"
        : "'Outfit', sans-serif";

  const projectsHtml = topRepos
    .map((repo, idx) => {
      const narrative = aiContent.projectNarratives[repo.name];
      const summary = narrative?.impactSummary || repo.description;
      const highlight =
        narrative?.technicalHighlight || `${repo.language || 'Code'} repository`;
      const indexLabel = String(idx + 1).padStart(2, '0');

      return `
      <article class="project-card">
        <div class="project-meta">
          <span>${indexLabel}. ${escapeHtml(formatRepoLanguages(repo))}</span>
          <span>&middot;</span>
          <span>${repo.stars} stars</span>
          <span>&middot;</span>
          <span>${repo.forks} forks</span>
        </div>
        <h3>${escapeHtml(repo.name)}</h3>
        <p class="highlight">${escapeHtml(highlight)}</p>
        <p class="summary">${escapeHtml(summary)}</p>
        <div class="project-links">
          <a href="${escapeHtml(repo.htmlUrl)}" target="_blank" rel="noopener noreferrer">Source on GitHub &rarr;</a>
          ${
            repo.homepage
              ? `<a href="${escapeHtml(repo.homepage)}" target="_blank" rel="noopener noreferrer">Live Demo &rarr;</a>`
              : ''
          }
        </div>
      </article>`;
    })
    .join('\n');

  const skillsHtml = aiContent.highlightedSkills
    .map((skill) => `<span>${escapeHtml(skill)}</span>`)
    .join(' <span class="sep">&middot;</span> ');

  const langBarsHtml = languages
    .map(
      (lang) => `
      <div class="lang-row">
        <div class="lang-head">
          <span>${escapeHtml(lang.language)}</span>
          <span>${lang.percentage}% (${lang.repoCount} repos)</span>
        </div>
        <div class="lang-track">
          <div class="lang-fill" style="width:${lang.percentage}%;background:${escapeHtml(lang.color)}"></div>
        </div>
      </div>`
    )
    .join('\n');

  if (isArchitect) {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(profile.name)} — ${escapeHtml(careerTrack)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; background: #FFFFFF; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6; }
    .split { display: grid; grid-template-columns: 340px 1fr; min-height: 100vh; }
    @media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
    aside { background: ${isDarkSidebar ? '#111114' : '#F8FAFC'}; color: ${isDarkSidebar ? '#F4F4F5' : '#0F172A'}; border-right: 1px solid ${isDarkSidebar ? '#27272A' : '#E2E8F0'}; padding: 40px 32px; display: flex; flex-direction: column; justify-content: space-between; gap: 32px; }
    .avatar-row { display: flex; align-items: center; gap: 16px; }
    .avatar-row img { width: 72px; height: 72px; border-radius: 12px; object-fit: cover; border: 1px solid ${isDarkSidebar ? '#3F3F46' : '#E2E8F0'}; }
    .avatar-row h1 { margin: 0; font-family: 'Outfit', sans-serif; font-size: 1.35rem; }
    .handle { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: ${isDarkSidebar ? '#A1A1AA' : '#64748B'}; }
    .track { color: ${resolvedAccent}; font-weight: 600; font-size: 0.85rem; margin-bottom: 8px; }
    .bio { font-size: 0.9rem; color: ${isDarkSidebar ? '#D4D4D8' : '#334155'}; }
    .section-label { font-family: 'Outfit', sans-serif; font-size: 0.78rem; font-weight: 700; margin: 20px 0 10px; }
    .skills-line { font-size: 0.82rem; color: ${isDarkSidebar ? '#D4D4D8' : '#334155'}; line-height: 1.8; }
    .sep { color: ${isDarkSidebar ? '#52525B' : '#CBD5E1'}; margin: 0 6px; }
    .lang-row { margin-bottom: 10px; }
    .lang-head { display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px; }
    .lang-track { height: 6px; background: ${isDarkSidebar ? '#27272A' : '#E2E8F0'}; border-radius: 999px; overflow: hidden; }
    .lang-fill { height: 100%; border-radius: 999px; }
    .btn { display: block; text-align: center; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-size: 0.82rem; font-weight: 600; margin-top: 8px; }
    .btn-primary { background: ${resolvedAccent}; color: ${isDarkSidebar ? '#09090B' : '#FFFFFF'}; }
    .btn-outline { border: 1px solid ${isDarkSidebar ? '#3F3F46' : '#CBD5E1'}; color: ${isDarkSidebar ? '#F4F4F5' : '#0F172A'}; background: ${isDarkSidebar ? '#18181B' : '#FFFFFF'}; }
    main { padding: 56px 48px; max-width: 920px; }
    @media (max-width: 640px) { main { padding: 32px 24px; } }
    .hero-title { font-family: 'Outfit', sans-serif; font-size: clamp(1.9rem, 3.5vw, 2.75rem); line-height: 1.12; margin: 8px 0 16px; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 28px 0; border-bottom: 1px solid #E2E8F0; margin-bottom: 40px; }
    @media (max-width: 640px) { .metrics { grid-template-columns: repeat(2, 1fr); } }
    .metric-val { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; font-weight: 700; }
    .metric-label { font-size: 0.78rem; color: #64748B; }
    .project-card { padding: 24px 0; border-bottom: 1px solid #E2E8F0; }
    .project-meta { display: flex; gap: 8px; font-size: 0.78rem; color: #64748B; font-family: 'JetBrains Mono', monospace; }
    .project-card h3 { margin: 6px 0; font-family: 'Outfit', sans-serif; font-size: 1.2rem; }
    .highlight { margin: 0 0 6px; font-size: 0.85rem; font-weight: 600; color: ${resolvedAccent}; }
    .summary { margin: 0 0 10px; font-size: 0.92rem; color: #475569; }
    .project-links { display: flex; gap: 16px; font-size: 0.82rem; font-weight: 600; }
    .project-links a { color: #0F172A; text-decoration: none; }
  </style>
</head>
<body>
  <div class="split">
    <aside>
      <div>
        <div class="avatar-row">
          <img src="${escapeHtml(profile.avatarUrl)}" alt="${escapeHtml(profile.name)}" />
          <div>
            <h1>${escapeHtml(profile.name)}</h1>
            <div class="handle">@${escapeHtml(profile.login)}</div>
          </div>
        </div>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid ${isDarkSidebar ? '#27272A' : '#E2E8F0'}">
          <div class="track">${escapeHtml(careerTrack)}</div>
          <p class="bio">${escapeHtml(aiContent.bio)}</p>
        </div>
        <div class="section-label">Core Capabilities</div>
        <div class="skills-line">${skillsHtml}</div>
        <div class="section-label">Language Footprint</div>
        ${langBarsHtml}
      </div>
      <div>
        ${customEmail ? `<a class="btn btn-primary" href="mailto:${escapeHtml(customEmail)}">${escapeHtml(customEmail)}</a>` : ''}
        <a class="btn btn-outline" href="${escapeHtml(profile.htmlUrl)}" target="_blank" rel="noopener noreferrer">github.com/${escapeHtml(profile.login)}</a>
      </div>
    </aside>
    <main>
      <div class="handle">${escapeHtml(activity.inferredFocus)} &middot; ${activity.accountYears} yrs on GitHub</div>
      <h2 class="hero-title">${escapeHtml(aiContent.headline)}</h2>
      <p style="color:#475569;margin-top:0">${escapeHtml(aiContent.pitchSummary)}</p>
      <div class="metrics">
        <div><div class="metric-val">${profile.publicRepos}</div><div class="metric-label">Public Repos</div></div>
        <div><div class="metric-val">${activity.totalStars}</div><div class="metric-label">Stars Earned</div></div>
        <div><div class="metric-val">${activity.pushEventsCount}</div><div class="metric-label">Recent Pushes</div></div>
        <div><div class="metric-val">${activity.activeDaysLast30}d</div><div class="metric-label">Active (30d)</div></div>
      </div>
      <h3 style="font-family:'Outfit',sans-serif;font-size:1.25rem;margin-bottom:8px">Engineering Work Index</h3>
      ${projectsHtml}
    </main>
  </div>
</body>
</html>`;
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(profile.name)} — ${escapeHtml(careerTrack)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      background: ${bg};
      color: ${textPrimary};
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .container { max-width: ${templateId === 'minimal' ? '760px' : '1080px'}; margin: 0 auto; padding: 48px 24px 80px; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid ${border};
      margin-bottom: 56px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .brand { font-family: ${headingFont}; font-weight: 700; font-size: 1.125rem; text-decoration: none; color: ${textPrimary}; }
    nav { display: flex; gap: 24px; font-size: 0.9rem; color: ${textMuted}; }
    nav a { color: inherit; text-decoration: none; }
    nav a:hover { color: ${textPrimary}; }
    .hero { display: grid; grid-template-columns: 1.5fr 0.8fr; gap: 40px; align-items: center; margin-bottom: 48px; }
    @media (max-width: 768px) { .hero { grid-template-columns: 1fr; } }
    .kicker { font-size: 0.85rem; color: ${resolvedAccent}; font-weight: 600; margin-bottom: 12px; }
    h1 { font-family: ${headingFont}; font-size: clamp(2rem, 4vw, 3.25rem); line-height: 1.12; margin: 0 0 18px; letter-spacing: -0.02em; }
    .bio { font-size: 1.05rem; color: ${textMuted}; margin: 0 0 24px; max-width: 62ch; }
    .cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-primary {
      display: inline-block; padding: 10px 20px; border-radius: 8px;
      background: ${resolvedAccent}; color: ${templateId === 'spotlight' || templateId === 'matrix' ? '#09090B' : '#FFFFFF'}; text-decoration: none; font-weight: 600; font-size: 0.9rem;
    }
    .btn-secondary {
      display: inline-block; padding: 10px 20px; border-radius: 8px;
      border: 1px solid ${border}; color: ${textPrimary}; text-decoration: none; font-weight: 600; font-size: 0.9rem;
    }
    .avatar-wrap img { width: 100%; max-width: 240px; aspect-ratio: 1; object-fit: cover; border-radius: 16px; border: 1px solid ${border}; display: block; margin-left: auto; }
    .metrics {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
      padding: 24px; background: ${surface}; border: 1px solid ${border}; border-radius: 12px; margin-bottom: 56px;
    }
    @media (max-width: 640px) { .metrics { grid-template-columns: repeat(2, 1fr); } }
    .metric-val { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; font-weight: 600; }
    .metric-label { font-size: 0.8rem; color: ${textMuted}; }
    .section-title { font-family: ${headingFont}; font-size: 1.5rem; margin: 0 0 24px; }
    .projects-grid { display: grid; grid-template-columns: repeat(${isSingleColumn ? 1 : 2}, 1fr); gap: 20px; margin-bottom: 56px; }
    @media (max-width: 768px) { .projects-grid { grid-template-columns: 1fr; } }
    .project-card {
      background: ${surface}; border: 1px solid ${border}; border-radius: 12px; padding: 24px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .project-meta { display: flex; gap: 8px; font-size: 0.8rem; color: ${textMuted}; font-family: 'JetBrains Mono', monospace; }
    .project-card h3 { margin: 0; font-family: ${headingFont}; font-size: 1.25rem; }
    .highlight { margin: 0; font-size: 0.9rem; font-weight: 600; color: ${resolvedAccent}; }
    .summary { margin: 0; font-size: 0.95rem; color: ${textMuted}; flex: 1; }
    .project-links { display: flex; gap: 16px; margin-top: 8px; font-size: 0.85rem; font-weight: 600; }
    .project-links a { color: ${textPrimary}; text-decoration: none; }
    .project-links a:hover { text-decoration: underline; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 56px; }
    @media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }
    .panel { background: ${surface}; border: 1px solid ${border}; border-radius: 12px; padding: 24px; }
    .lang-row { margin-bottom: 14px; }
    .lang-head { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px; }
    .lang-track { height: 6px; background: ${border}; border-radius: 999px; overflow: hidden; }
    .lang-fill { height: 100%; border-radius: 999px; }
    .skills-line { font-size: 0.95rem; color: ${textPrimary}; line-height: 2; }
    .sep { color: ${textMuted}; margin: 0 6px; }
    footer { border-top: 1px solid ${border}; padding-top: 24px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 0.85rem; color: ${textMuted}; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <a class="brand" href="#">${escapeHtml(profile.name)}</a>
      <nav>
        <a href="#work">Selected Work</a>
        <a href="#stack">Tech Stack</a>
        <a href="${escapeHtml(profile.htmlUrl)}" target="_blank" rel="noopener noreferrer">GitHub</a>
      </nav>
    </header>

    <section class="hero">
      <div>
        <div class="kicker">${escapeHtml(careerTrack)} &middot; ${escapeHtml(profile.location || 'Available Remotely')}</div>
        <h1>${escapeHtml(aiContent.headline)}</h1>
        <p class="bio">${escapeHtml(aiContent.bio)}</p>
        <div class="cta-row">
          ${
            customEmail
              ? `<a class="btn-primary" href="mailto:${escapeHtml(customEmail)}">Get in Touch</a>`
              : `<a class="btn-primary" href="${escapeHtml(profile.htmlUrl)}" target="_blank" rel="noopener noreferrer">View GitHub Profile</a>`
          }
          <a class="btn-secondary" href="#work">Explore Projects</a>
        </div>
      </div>
      <div class="avatar-wrap">
        <img src="${escapeHtml(profile.avatarUrl)}" alt="${escapeHtml(profile.name)}" />
      </div>
    </section>

    <section class="metrics">
      <div><div class="metric-val">${profile.publicRepos}</div><div class="metric-label">Public Repositories</div></div>
      <div><div class="metric-val">${activity.totalStars}</div><div class="metric-label">Total Stars</div></div>
      <div><div class="metric-val" style="font-size:1.15rem">${escapeHtml(formatCoreStack(activity, languages))}</div><div class="metric-label">Core Stack</div></div>
      <div><div class="metric-val">${activity.accountYears} yrs</div><div class="metric-label">GitHub Tenure</div></div>
    </section>

    <section id="work">
      <h2 class="section-title">Selected Engineering Work</h2>
      <div class="projects-grid">
        ${projectsHtml}
      </div>
    </section>

    <section id="stack" class="two-col">
      <div class="panel">
        <h2 class="section-title" style="font-size:1.2rem">Language Distribution</h2>
        ${langBarsHtml}
      </div>
      <div class="panel">
        <h2 class="section-title" style="font-size:1.2rem">Core Capabilities</h2>
        <p style="color:${textMuted};font-size:0.95rem;margin-top:0">${escapeHtml(aiContent.pitchSummary)}</p>
        <div class="skills-line">${skillsHtml}</div>
      </div>
    </section>

    <footer>
      <span>${escapeHtml(profile.name)} (@${escapeHtml(profile.login)})</span>
      <span>${customEmail ? escapeHtml(customEmail) : escapeHtml(profile.htmlUrl)}</span>
    </footer>
  </div>
</body>
</html>`;
}

export function downloadPortfolioHtml(portfolio: PortfolioDocument): void {
  const html = generateStandaloneHtml(portfolio);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${portfolio.username.toLowerCase()}-portfolio.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
