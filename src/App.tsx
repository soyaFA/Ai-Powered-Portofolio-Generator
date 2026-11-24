import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Navbar, type AppView } from './components/Navbar';
import { StudioView } from './components/StudioView';
import { TemplatesView } from './components/TemplatesView';
import { SavedView } from './components/SavedView';
import { AuthModal } from './components/AuthModal';
import { AuthGateView } from './components/AuthGateView';
import { ResetPasswordView } from './components/ResetPasswordView';
import { downloadPortfolioHtml } from './utils/exportHtml';
import { useAuth } from './hooks/useAuth';
import { usePortfolioBuilder } from './hooks/usePortfolioBuilder';
import { useSavedPortfolios } from './hooks/useSavedPortfolios';
import type { AuthUser, TemplateId } from './types/portfolio';

const VIEW_TO_PATH: Record<AppView, string> = {
  studio: '/studio',
  templates: '/templates',
  saved: '/saved',
};

function pathToView(pathname: string): AppView {
  if (pathname.startsWith('/templates')) return 'templates';
  if (pathname.startsWith('/saved')) return 'saved';
  return 'studio';
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const { authUser, setAuthUser, isCheckingAuth, logout } = useAuth();
  const builder = usePortfolioBuilder();
  const saved = useSavedPortfolios(authUser);


  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalNotice, setAuthModalNotice] = useState<string | null>(null);
  const [pendingSaveAfterAuth, setPendingSaveAfterAuth] = useState(false);

  const activeView: AppView = pathToView(location.pathname);
  const handleNavigate = useCallback(
    (view: AppView) => navigate(VIEW_TO_PATH[view]),
    [navigate]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const openAuthModalFresh = useCallback(() => {
    setPendingSaveAfterAuth(false);
    setAuthModalNotice(null);
    setAuthModalOpen(true);
  }, []);

  const saveCurrentPortfolio = useCallback(async () => {
    if (!builder.portfolio) return;
    try {
      const savedDoc = await saved.savePortfolio(builder.portfolio);
      if (savedDoc) builder.setPortfolio(savedDoc);
    } catch (err) {
      builder.setAiErrorMessage(
        err instanceof Error ? err.message : 'Failed to save portfolio.'
      );
    }
  }, [builder, saved]);

  const handleSavePortfolio = async () => {
    if (!builder.portfolio) return;
    if (!authUser) {
      setPendingSaveAfterAuth(true);
      setAuthModalNotice('Sign in or create an account to save this portfolio.');
      setAuthModalOpen(true);
      return;
    }
    await saveCurrentPortfolio();
  };

  const handleAuthSuccess = async (user: AuthUser) => {
    setAuthUser(user);
    setAuthModalOpen(false);
    setAuthModalNotice(null);
    if (pendingSaveAfterAuth && builder.portfolio) {
      setPendingSaveAfterAuth(false);
      await saveCurrentPortfolio();
    }
  };

  const handleLogout = () => {
    logout();
    builder.resetStudio();
    navigate(VIEW_TO_PATH.studio);
  };

  const handleDeletePortfolio = async (id: string) => {
    await saved.deletePortfolio(id);
    if (builder.portfolio?.id === id) {
      builder.setPortfolio({ ...builder.portfolio, id: '', userId: undefined });
    }
  };

  const handleSelectTemplate = (templateId: TemplateId) => {
    builder.setPreferredTemplate(templateId);
    if (builder.portfolio) {
      builder.setPortfolio({ ...builder.portfolio, templateId });
    }
    navigate(VIEW_TO_PATH.studio);
  };

  const handleTrySampleWithTemplate = (templateId: TemplateId) => {
    navigate(VIEW_TO_PATH.studio);
    void builder.analyzeUsername('gaearon', templateId);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  if (location.pathname.startsWith('/reset-password')) {
    return (
      <ResetPasswordView
        onGoToSignIn={() => navigate(VIEW_TO_PATH.studio)}
      />
    );
  }

  if (!authUser) {
    return (
      <AuthGateView
        onSuccess={(user) => {
          setAuthUser(user);
          navigate(VIEW_TO_PATH.studio);
        }}
      />
    );
  }

  const studioView = (
    <StudioView
      portfolio={builder.portfolio}
      preferredTemplate={builder.preferredTemplate}
      authUser={authUser}
      savedCount={saved.savedPortfolios.length}
      isAnalyzing={builder.isAnalyzing}
      isOptimizing={builder.isOptimizing}
      isSaving={saved.isSaving}
      errorMessage={builder.errorMessage}
      aiErrorMessage={builder.aiErrorMessage}
      saveFeedback={saved.saveFeedback}
      onSelectPreferredTemplate={builder.setPreferredTemplate}
      onAnalyzeUsername={builder.analyzeUsername}
      onOptimizeAI={builder.optimizeAI}
      onChangePortfolio={builder.setPortfolio}
      onSavePortfolio={handleSavePortfolio}
      onExportHtml={() =>
        builder.portfolio && downloadPortfolioHtml(builder.portfolio)
      }
      onResetStudio={builder.resetStudio}
      onOpenAuthModal={openAuthModalFresh}
      onNavigateToTemplates={() => navigate(VIEW_TO_PATH.templates)}
      onNavigateToSaved={() => navigate(VIEW_TO_PATH.saved)}
    />
  );

  const templatesView = (
    <TemplatesView
      activeTemplate={builder.portfolio?.templateId ?? builder.preferredTemplate}
      portfolio={builder.portfolio}
      onSelectTemplate={handleSelectTemplate}
      onTrySampleWithTemplate={handleTrySampleWithTemplate}
    />
  );

  const savedView = (
    <SavedView
      authUser={authUser}
      portfolios={saved.savedPortfolios}
      isLoading={saved.isLoadingSaved}
      onOpenAuthModal={openAuthModalFresh}
      onOpenPortfolio={(doc) => {
        builder.setPortfolio(doc);
        builder.setPreferredTemplate(doc.templateId);
        navigate(VIEW_TO_PATH.studio);
      }}
      onExportPortfolio={(doc) => downloadPortfolioHtml(doc)}
      onDeletePortfolio={handleDeletePortfolio}
      onGoToStudio={() => navigate(VIEW_TO_PATH.studio)}
    />
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        activeView={activeView}
        onNavigate={handleNavigate}
        savedCount={saved.savedPortfolios.length}
        authUser={authUser}
        onOpenAuthModal={openAuthModalFresh}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={studioView} />
          <Route path="/studio" element={studioView} />
          <Route path="/templates" element={templatesView} />
          <Route path="/saved" element={savedView} />
          <Route path="*" element={studioView} />
        </Routes>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        contextNotice={authModalNotice}
        defaultGithubUsername={builder.portfolio?.username ?? ''}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthModalNotice(null);
          setPendingSaveAfterAuth(false);
        }}
        onSuccess={handleAuthSuccess}
      />

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>Repo2Folio · GitHub Developer Portfolio Generator</span>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigate(VIEW_TO_PATH.templates)}
              className="hover:text-slate-900 cursor-pointer"
            >
              Templates
            </button>
            <button
              type="button"
              onClick={() => navigate(VIEW_TO_PATH.saved)}
              className="hover:text-slate-900 cursor-pointer"
            >
              Saved Portfolios
            </button>

          </div>
        </div>
      </footer>
    </div>
  );
}
