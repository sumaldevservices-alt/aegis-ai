/**
 * Which persisted keys are machine-level UI preferences (#145213).
 *
 * Only these leave localStorage for the machine's shared store, so native
 * Desktop and every browser that opens this machine's Webapp show the same
 * choices. Scoped families keep their scope inside the key name (a
 * `….profile.<name>` or per-connection suffix): only the location changes.
 *
 * Deliberately NOT here (they stay in this browser/window):
 * - credentials, grants and connection config: gateway registry, custom model
 *   endpoints, plugin decisions and preview-script grants, embed permissions;
 * - per-window or per-device runtime state: layout tree, open tiles and tabs,
 *   last route/session, scroll, zoom, pet and popout geometry, keep-awake;
 * - drafts, queues, journals and caches: composer queue, in-flight turns,
 *   pending/prepared submissions, previews, pricing, backend skin cache, the
 *   "provider configured" onboarding cache (each backend answers that itself);
 * - one-off notices: butterbar, update and real-profile prompts.
 */

const SHARED_KEYS: ReadonlySet<string> = new Set([
  // Appearance.
  'aegis-desktop-theme-v2',
  'aegis-desktop-mode-v1',
  'aegis-desktop-profile-themes-v1',
  'aegis-desktop-profile-modes-v1',
  'aegis-desktop-user-themes-v1',
  'aegis.desktop.backdrop.v1',
  'aegis.desktop.chat-text-scale.v1',
  'aegis.desktop.interfaceMode.v1',
  'aegis.desktop.textDirection',
  'aegis.desktop.translucency.v2',
  'aegis.desktop.user-bubble-transparency.v1',
  // Sessions sidebar and profile rail.
  'aegis.desktop.agentsGroupedByWorkspace',
  'aegis.desktop.profileColors',
  'aegis.desktop.profileOrder',
  'aegis.desktop.profileRailVisible',
  'aegis.desktop.sessionListDensity',
  'aegis.desktop.sessionOrder',
  'aegis.desktop.sessionOrder.manual',
  'aegis.desktop.showAllProfiles',
  'aegis.desktop.sidebarAgentsGrouped.allProfiles',
  'aegis.desktop.sidebarCardRows',
  'aegis.desktop.sidebarGrouping',
  'aegis.desktop.sidebarGrouping.allProfiles',
  'aegis.desktop.sidebarRowMeta',
  'aegis.desktop.sidebarShowAllSessions',
  'aegis.desktop.sidebarShowArchived',
  'aegis.desktop.sidebarSortKey',
  // Status bar.
  'aegis.desktop.statusbarHidden.v2',
  'aegis.desktop.statusbarVisible.v2',
  // Transcript and tools.
  'aegis.desktop.hideThreadTimeline',
  'aegis.desktop.reasoning.collapsedByDefault',
  'aegis.desktop.toolView.hideCodeDiffs',
  'aegis.desktop.toolView.technical',
  // Shell, panes and behaviour.
  'aegis.desktop.alwaysExternalLinks.v1',
  'aegis.desktop.capabilities.catalogCardView',
  'aegis.desktop.composerPopout.enabled',
  'aegis.desktop.composerPopout.gesturesEnabled',
  'aegis.desktop.files.showIgnored',
  'aegis.desktop.keybinds',
  'aegis.desktop.layoutPresets.v2',
  'aegis.desktop.panesFlipped',
  'aegis.desktop.tabStripDefault',
  'aegis.desktop.titlebarAppActions',
  // Guidance: what the user already skipped, saw or dismissed does not come
  // back in every new browser or origin (#145600).
  'aegis-onboarding-skipped-v1',
  'aegis.desktop.tips.last.v1',
  'aegis.desktop.tips.next.v1',
  'aegis.desktop.tips.retired.v1',
  'aegis.desktop.tips.rotation.v1',
  'aegis.desktop.tips.shownAt.v1',
  'aegis.desktop.tours.v1',
  // Sound and media.
  'aegis.desktop.autoSpeakReplies',
  'aegis.desktop.completionSoundVariantId',
  'aegis.desktop.hapticsMuted',
  'aegis.desktop.videoPlaybackSpeed',
  // Model picker.
  'aegis.desktop.collapsed-providers',
  'aegis.desktop.favorite-models',
  // visible-models is a diff against known-models: they only make sense together.
  'aegis.desktop.known-models',
  'aegis.desktop.model-presets',
  'aegis.desktop.visible-models'
])

/** Families whose scope rides in the key suffix (gateway aliases/order/collapsed). */
const SHARED_PREFIXES: readonly string[] = ['aegis.desktop.sidebar.gatewayGroups.v1.']

export function isSharedPreferenceKey(key: string): boolean {
  return SHARED_KEYS.has(key) || SHARED_PREFIXES.some(prefix => key.startsWith(prefix))
}
