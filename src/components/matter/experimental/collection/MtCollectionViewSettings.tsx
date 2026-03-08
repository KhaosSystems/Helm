import React from 'react';
import { ArrowLeft, Paperclip, Share2, X } from 'lucide-react';
import MtStack from '../../MtStack';
import { MtButton } from '../../MtButton';
import { MtInput } from '../../MtInput';
import { useMtCollection } from './MtCollectionContext';
import { MtCollectionViewSettingsState } from './MtCollection';

function MtSwitcher<T extends string>({ value, cases }: { value: T; cases: Partial<Record<T, React.ReactNode>> }) {
  return <>{cases[value] ?? null}</>;
}

type MenuPageId = string;

type MtDrawerMenuContextValue = {
  openPage: (id: MenuPageId) => void;
  goBack: () => void;
};

const MtDrawerMenuContext = React.createContext<MtDrawerMenuContextValue | null>(null);

interface MtDrawerMenuProps {
  children?: React.ReactNode;
  initialPageId?: MenuPageId;
  onClose?: () => void;
}

export interface MtDrawerMenuPageProps {
  id: MenuPageId;
  title: string;
  children?: React.ReactNode;
}

function isDrawerPageElement(child: React.ReactNode): child is React.ReactElement<MtDrawerMenuPageProps> {
  if (!React.isValidElement(child)) {
    return false;
  }

  const props = child.props as Partial<MtDrawerMenuPageProps>;
  return typeof props.id === 'string' && typeof props.title === 'string';
}

export function MtDrawerMenuPage({ children }: MtDrawerMenuPageProps) {
  return <>{children}</>;
}

function collectMenuPages(children: React.ReactNode) {
  const pageMap: Record<string, React.ReactElement<MtDrawerMenuPageProps>> = {};

  React.Children.forEach(children, (child) => {
    if (!isDrawerPageElement(child)) return;

    const pageProps = child.props;
    pageMap[pageProps.id] = child;
  });

  return pageMap;
}

export function MtDrawerMenu({ children, initialPageId = 'root', onClose }: MtDrawerMenuProps) {
  const pages = React.useMemo(() => collectMenuPages(children), [children]);
  const [history, setHistory] = React.useState<MenuPageId[]>([initialPageId]);

  React.useEffect(() => {
    setHistory([initialPageId]);
  }, [initialPageId]);

  const currentPageId = history[history.length - 1] ?? initialPageId;
  const currentPage = pages[currentPageId];
  const currentTitle = (currentPage?.props as MtDrawerMenuPageProps | undefined)?.title ?? 'View Settings';

  const openPage = React.useCallback(
    (id: MenuPageId) => {
      if (!pages[id]) return;
      setHistory((prev) => [...prev, id]);
    },
    [pages],
  );

  const goBack = React.useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const showBack = history.length > 1;

  return (
    <MtDrawerMenuContext.Provider value={{ openPage, goBack }}>
      <MtStack>
        <MtStack
          row
          justify="between"
          className={`p-2 pr-3 gap-2 border-b text-neutral-300 border-[#2A2A2A] ${showBack ? '' : 'pl-3'}`}
        >
          <MtStack row className="text-neutral-300" gap={2}>
            {showBack ? (
              <MtButton kind="icon" variant="ghost" onClick={goBack}>
                <ArrowLeft size={16} stroke="#8D8D8D" />
              </MtButton>
            ) : null}
            <span className="text-sm text-neutral-400">{currentTitle}</span>
          </MtStack>
          <MtButton kind="icon" variant="ghost" onClick={onClose}>
            <X size={16} stroke="#8D8D8D" />
          </MtButton>
        </MtStack>

        <MtSwitcher value={currentPageId} cases={{ [currentPageId]: currentPage }} />
      </MtStack>
    </MtDrawerMenuContext.Provider>
  );
}

export function MtDrawerMenuSection({ title, children }: { title?: string; children?: React.ReactNode }) {
  return (
    <MtStack gap={1} className="py-2 border-b border-[#2A2A2A]">
      {title && <small className="px-2">{title}</small>}
      {children}
    </MtStack>
  );
}

export function MtDrawerMenuItem({
  icon,
  label,
  trailing,
  onClick,
  disabled,
  active,
  submenu,
}: {
  icon?: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  submenu?: MenuPageId;
}) {
  const menu = React.useContext(MtDrawerMenuContext);

  return (
    <MtButton
      variant="ghost"
      className={`flex row items-center justify-between w-full ${active ? 'bg-neutral-700/50! text-neutral-100!' : ''}`}
      onClick={() => {
        onClick?.();
        if (submenu) {
          menu?.openPage(submenu);
        }
      }}
      disabled={disabled}
    >
      <div className="flex flex-row items-center gap-3">
        {icon}
        {label}
      </div>
      {trailing ? <div className="flex flex-row items-center gap-3 text-neutral-500">{trailing}</div> : null}
    </MtButton>
  );
}

export function MtCollectionViewSettings() {
  const context = useMtCollection();
  const properties = context?.properties ?? [];
  const currentView = context?.currentView ?? null;
  const viewNameInputRef = React.useRef<HTMLInputElement>(null);
  const defaultVisiblePropertyIds = properties.map((property) => property.id);
  const visiblePropertyIds = currentView?.settings?.visiblePropertyIds ?? defaultVisiblePropertyIds;
  const LayoutSettingsMenuComponent = currentView?.layout.SettingsMenu;

  React.useEffect(() => {
    if (context?.focusViewNameEditor) {
      viewNameInputRef.current?.focus();
      viewNameInputRef.current?.select();
    }
  }, [context?.focusViewNameEditor]);

  const setCurrentViewSettings = (settingsPatch: Record<string, unknown>) => {
    if (!context || !currentView) {
      return;
    }

    context.setCurrentView({
      ...currentView,
      settings: {
        ...(currentView.settings ?? {}),
        ...settingsPatch,
      },
    });
  };

  const renderedLayoutMenu =
    currentView && context && LayoutSettingsMenuComponent
      ? LayoutSettingsMenuComponent({
          currentView,
          properties,
          viewSettings: {
            ...(currentView.settings ?? {}),
            visiblePropertyIds,
          },
          setViewSettings: (settings: Partial<MtCollectionViewSettingsState>) => setCurrentViewSettings(settings),
          setCurrentView: context.setCurrentView,
        })
      : null;

  const layoutRootSections: React.ReactNode[] = [];
  const layoutPages: React.ReactElement<MtDrawerMenuPageProps>[] = [];

  const collectLayoutMenuParts = (children: React.ReactNode) => {
    React.Children.forEach(children, (child) => {
      if (isDrawerPageElement(child)) {
        layoutPages.push(child);
        return;
      }

      if (!React.isValidElement(child)) {
        return;
      }

      if (child.type === React.Fragment) {
        collectLayoutMenuParts((child.props as { children?: React.ReactNode }).children);
        return;
      }

      layoutRootSections.push(child);
    });
  };

  if (renderedLayoutMenu) {
    collectLayoutMenuParts(renderedLayoutMenu);
  }

  return (
    <MtDrawerMenu
      initialPageId={context?.viewSettingsPageId ?? 'root'}
      onClose={() => {
        context?.setShowViewSettings(false);
        context?.setViewSettingsPageId('root');
        context?.setFocusViewNameEditor(false);
      }}
    >
      <MtDrawerMenuPage id="root" title="View Settings">
        <MtDrawerMenuSection title="View">
          <div className="px-2">
            <MtInput
              ref={viewNameInputRef}
              value={currentView?.name ?? ''}
              onChange={(event) => {
                if (!context || !currentView) {
                  return;
                }

                context.setCurrentView({
                  ...currentView,
                  name: event.target.value,
                });
              }}
              placeholder="View name"
              className="w-full px-2!"
              variant="ghost"
            />
          </div>
        </MtDrawerMenuSection>

        {layoutRootSections}

        <MtDrawerMenuSection>
          <MtDrawerMenuItem icon={<Paperclip size={14} />} label="Copy link to view" disabled />
          <MtDrawerMenuItem icon={<Share2 size={14} />} label="Shareing & Permissions" disabled />
        </MtDrawerMenuSection>
      </MtDrawerMenuPage>

      {layoutPages}
    </MtDrawerMenu>
  );
}

MtDrawerMenu.Page = MtDrawerMenuPage;
