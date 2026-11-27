// Aegis Enterprise Autonomous Platform - Optimized & Secured
import { contextBridge, ipcRenderer, webFrame, webUtils } from 'electron'

import type { DesktopProfileRoute } from './desktop-profile'
import type { HudModifierApi, HudModifierStatus } from './hud-modifier-types'
import { customWindowControlsEnabled } from './window-controls'

// Which translucency the OS can back. Asked synchronously because the renderer
// needs it before its first paint, and answered by main because deciding it
// needs `os.release()` — a sandboxed preload may only require electron, events,
// timers and url, so importing node:os here throws before contextBridge runs
// and takes the ENTIRE bridge down with it (window.aegisDesktop undefined =>
// "Desktop IPC bridge is unavailable"). No reply means no glass, which degrades
// to an ordinary opaque window rather than a page thinned over nothing.
const translucencySupport = ipcRenderer.sendSync('aegis:translucency:support')
const hudWindowing = ipcRenderer.sendSync('aegis:hud:windowing')
const hudNativeDrag = hudWindowing?.nativeDrag === true

const launchFlags: { localModels?: boolean; assumeFreshInstall?: boolean } | undefined =
  ipcRenderer.sendSync('aegis:feature-flags')

// Local, sanitized skin payload for the first renderer theme paint. This does
// not wait on `gateway.ready`, so an unreachable remote primary cannot force
// the built-in palette over the skin configured on this machine.
const localSkin = ipcRenderer.sendSync('aegis:skin:local')

// This machine's UI preferences store (#145213), read before the first paint so
// a preference set in another window or in this machine's Webapp paints at once.
const uiPreferencesSnapshot = ipcRenderer.sendSync('aegis:ui-preferences:snapshot')

import { unwrapExpectedNotFound } from './api-expected-404'

contextBridge.exposeInMainWorld('aegisDesktop', {
  glassSupported: translucencySupport?.glass === true,
  translucencySupported: translucencySupport?.translucency === true,
  // Launch-flag fact: the app was started with --local, so the renderer may
  // show the local-models surfaces. Static for the window's lifetime.
  localModelsEnabled: launchFlags?.localModels === true,
  // Dev-only launch fact: an unpackaged app started with --fresh-install, so
  // onboarding treats this launch as a fresh install. Always false when packaged.
  assumeFreshInstall: launchFlags?.assumeFreshInstall === true,
  localSkin: localSkin && typeof localSkin === 'object' ? localSkin : null,
  uiPreferences: {
    snapshot: uiPreferencesSnapshot && typeof uiPreferencesSnapshot === 'object' ? uiPreferencesSnapshot : null,
    read: () => ipcRenderer.invoke('aegis:ui-preferences:read'),
    write: payload => ipcRenderer.invoke('aegis:ui-preferences:write', payload),
    onChanged: callback => {
      const listener = (_event, snapshot) => callback(snapshot)
      ipcRenderer.on('aegis:ui-preferences:changed', listener)

      return () => ipcRenderer.removeListener('aegis:ui-preferences:changed', listener)
    }
  },
  getConnection: (profile, opts) => ipcRenderer.invoke('aegis:connection', profile, opts),
  // Loopback origin that hosts YouTube's player for the file:// renderer.
  getEmbedHostOrigin: () => ipcRenderer.invoke('aegis:embed-host:origin'),
  // Registry-scoped backend resolution: { connectionId, profile } → descriptor.
  getConnectionFor: payload => ipcRenderer.invoke('aegis:connection:for', payload),
  getProfileRoutes: profiles => ipcRenderer.invoke('aegis:plugin-profile-routes', profiles),
  revalidateConnection: () => ipcRenderer.invoke('aegis:connection:revalidate'),
  getGatewayWsUrl: profile => ipcRenderer.invoke('aegis:gateway:ws-url', profile),
  // Registry-scoped fresh WS URL: { connectionId, profile } → result shape of
  // getGatewayWsUrl, minted against that connection's backend.
  getGatewayWsUrlFor: payload => ipcRenderer.invoke('aegis:gateway:ws-url-for', payload),
  // { connectionId, profile, pluginId, path } → one-use local plugin socket URL, null, or { refused: 'permission' }.
  getPluginWsUrl: payload => ipcRenderer.invoke('aegis:plugin:ws-url', payload),
  // Union agent roster across every registered connection.
  getAgentRoster: () => ipcRenderer.invoke('aegis:agents:roster'),
  openSessionWindow: (sessionId, opts) => ipcRenderer.invoke('aegis:window:openSession', sessionId, opts),
  openSessionInTerminal: (sessionId, opts) => ipcRenderer.invoke('aegis:window:openInTerminal', sessionId, opts),
  openWindow: (options?: DesktopProfileRoute) => ipcRenderer.invoke('aegis:window:openInstance', options),
  openBrowserWindow: tabId => ipcRenderer.invoke('aegis:window:openBrowser', tabId),
  windowRelay: {
    send: payload => ipcRenderer.send('aegis:window:relay', payload),
    onMessage: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('aegis:window:relay', listener)

      return () => ipcRenderer.removeListener('aegis:window:relay', listener)
    }
  },
  onBrowserPopoutClosed: callback => {
    const listener = (_event, tabId) => callback(tabId)
    ipcRenderer.on('aegis:browser-popout:closed', listener)

    return () => ipcRenderer.removeListener('aegis:browser-popout:closed', listener)
  },
  claimAmbientCue: key => ipcRenderer.invoke('aegis:ambient:claim', key),
  windowControls: {
    custom: customWindowControlsEnabled(),
    minimize: () => ipcRenderer.send('aegis:window-control', 'minimize'),
    toggleMaximize: () => ipcRenderer.send('aegis:window-control', 'toggle-maximize'),
    close: () => ipcRenderer.send('aegis:window-control', 'close')
  },
  wakeIndicator: {
    getState: () => ipcRenderer.invoke('aegis:wake-indicator:get'),
    setState: state => ipcRenderer.send('aegis:wake-indicator:set', state),
    onState: callback => {
      const listener = (_event, state) => callback(state)
      ipcRenderer.on('aegis:wake-indicator:state', listener)

      return () => ipcRenderer.removeListener('aegis:wake-indicator:state', listener)
    }
  },
  chatOnboarding: {
    size: mode => ipcRenderer.send('aegis:window:size', mode)
  },
  petOverlay: {
    // Main renderer → main process: window lifecycle + drag. `request` is
    // `{ bounds, screen }`; resolves with the screen bounds it actually used.
    open: request => ipcRenderer.invoke('aegis:pet-overlay:open', request),
    close: () => ipcRenderer.invoke('aegis:pet-overlay:close'),
    setBounds: bounds => ipcRenderer.send('aegis:pet-overlay:set-bounds', bounds),
    setIgnoreMouse: ignore => ipcRenderer.send('aegis:pet-overlay:ignore-mouse', ignore),
    // Flip the overlay focusable (and focus it) while the composer needs keys.
    setFocusable: focusable => ipcRenderer.send('aegis:pet-overlay:set-focusable', focusable),
    // Main renderer → overlay (forwarded by main): push the latest pet state.
    pushState: payload => ipcRenderer.send('aegis:pet-overlay:state', payload),
    // Overlay → main renderer (forwarded by main): pop back in / composer submit.
    control: payload => ipcRenderer.send('aegis:pet-overlay:control', payload),
    // Overlay subscribes to state pushes.
    onState: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('aegis:pet-overlay:state', listener)

      return () => ipcRenderer.removeListener('aegis:pet-overlay:state', listener)
    },
    // Main renderer subscribes to overlay control messages.
    onControl: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('aegis:pet-overlay:control', listener)

      return () => ipcRenderer.removeListener('aegis:pet-overlay:control', listener)
    }
  },
  // HUD mode: the chrome-free floating chat. A full app renderer (own gateway)
  // sized as a floating bar, so it mounts the real composer. Main owns the
  // window; `onChanged` keeps every window's toggle truthful.
  hud: {
    nativeDrag: hudNativeDrag,
    windowing: {
      clientPlacement: hudWindowing?.clientPlacement !== false,
      controlDrag: hudWindowing?.controlDrag === true,
      nativeDrag: hudNativeDrag,
      solid: hudWindowing?.solid === true,
      workspaceTransfer: hudWindowing?.workspaceTransfer === true
    },
    open: request => ipcRenderer.invoke('aegis:hud:open', request),
    close: () => ipcRenderer.invoke('aegis:hud:close'),
    setIgnoreMouse: ignore => ipcRenderer.send('aegis:hud:ignore-mouse', ignore),
    beginMove: () => ipcRenderer.send('aegis:hud:begin-move'),
    endMove: () => ipcRenderer.send('aegis:hud:end-move'),
    moveBy: delta => ipcRenderer.send('aegis:hud:move-by', delta),
    setWorkspaceTransfer: transferring => ipcRenderer.send('aegis:hud:workspace-transfer', transferring),
    setBounds: bounds => ipcRenderer.send('aegis:hud:set-bounds', bounds),
    resetLayout: () => ipcRenderer.invoke('aegis:hud:reset-layout'),
    // Whether the band covers the window below the bar. Main pairs it with the
    // user's translucency setting to decide the native frost (macOS vibrancy /
    // Windows 11 DWM backdrop) — see hudFrostFor.
    setFrost: showing => ipcRenderer.invoke('aegis:hud:frost', showing),
    // The HUD tells main which session it is on; main hands that back to the
    // app window when the HUD closes, so the app can re-home onto it.
    setSession: sessionId => ipcRenderer.send('aegis:hud:session', sessionId),
    onGoto: callback => {
      const listener = (_event, sessionId) => callback(sessionId)
      ipcRenderer.on('aegis:hud:goto', listener)

      return () => ipcRenderer.removeListener('aegis:hud:goto', listener)
    },
    onChanged: callback => {
      const listener = (_event, state) => callback(state)
      ipcRenderer.on('aegis:hud:changed', listener)

      return () => ipcRenderer.removeListener('aegis:hud:changed', listener)
    },
    // Linux only, and silent elsewhere: where the cursor is, in page
    // coordinates, or null when it has left the window. Stands in for the
    // mousemove that `setIgnoreMouseEvents(true, { forward: true })` delivers on
    // macOS and Windows but not here.
    onCursor: callback => {
      const listener = (_event, point) => callback(point)
      ipcRenderer.on('aegis:hud:cursor', listener)

      return () => ipcRenderer.removeListener('aegis:hud:cursor', listener)
    },
    // Main's game-overlay watch: whether a fullscreen app (a game) is under
    // the HUD, so the renderer can step back to the low-opacity overlay
    // treatment while one owns the screen.
    onGameOverlay: callback => {
      const listener = (_event, state) => callback(state)
      ipcRenderer.on('aegis:hud:game-overlay', listener)

      return () => ipcRenderer.removeListener('aegis:hud:game-overlay', listener)
    }
  },
  hudModifier: {
    getSettings: () => ipcRenderer.invoke('aegis:hud-modifier:settings:get'),
    setEnabled: enabled => ipcRenderer.invoke('aegis:hud-modifier:settings:set', enabled),
    openPermissionSettings: () => ipcRenderer.invoke('aegis:hud-modifier:permission'),
    onStatus: callback => {
      const listener = (_event: Electron.IpcRendererEvent, status: HudModifierStatus) => callback(status)
      ipcRenderer.on('aegis:hud-modifier:status', listener)

      return () => ipcRenderer.removeListener('aegis:hud-modifier:status', listener)
    }
  } satisfies HudModifierApi,
  // macOS native screenshot gesture; captures require a main-issued request.
  screenshot:
    process.platform === 'darwin'
      ? {
          getSettings: () => ipcRenderer.invoke('aegis:screenshot:settings:get'),
          setEnabled: enabled => ipcRenderer.invoke('aegis:screenshot:settings:set', enabled),
          openPermissionSettings: kind => ipcRenderer.invoke('aegis:screenshot:permission', kind),
          capture: requestId => ipcRenderer.invoke('aegis:screenshot:capture', requestId),
          onStatus: callback => {
            const listener = (_event, status) => callback(status)
            ipcRenderer.on('aegis:screenshot:status', listener)

            return () => ipcRenderer.removeListener('aegis:screenshot:status', listener)
          },
          onRequest: callback => {
            const channel = 'aegis:screenshot:request'
            const listener = (_event, requestId) => callback(requestId)

            if (ipcRenderer.listenerCount(channel) === 0) {
              ipcRenderer.send('aegis:screenshot:subscribe', true)
            }

            ipcRenderer.on(channel, listener)

            return () => {
              ipcRenderer.removeListener(channel, listener)

              if (ipcRenderer.listenerCount(channel) === 0) {
                ipcRenderer.send('aegis:screenshot:subscribe', false)
              }
            }
          }
        }
      : undefined,
  // Quick Entry: the global-hotkey mini composer window. Main owns the OS
  // shortcut + the persisted preference; the quick window only captures text
  // and hands it back, and the primary renderer submits it through the normal
  // prompt path.
  quickEntry: {
    getSettings: () => ipcRenderer.invoke('aegis:quick-entry:settings:get'),
    setSettings: patch => ipcRenderer.invoke('aegis:quick-entry:settings:set', patch),
    // Invoke returns the delivery result so the draft is not lost (#85590).
    submit: payload => ipcRenderer.invoke('aegis:quick-entry:submit', payload),
    // Main cannot invoke the primary renderer, so it receives this ack (#85590).
    ackSubmit: (correlationId, result) => ipcRenderer.send('aegis:quick-entry:ack', { correlationId, result }),
    dismiss: () => ipcRenderer.send('aegis:quick-entry:dismiss'),
    // Primary renderer → main → quick window: gateway connection state + the
    // recent-session options the target picker offers. Main caches the latest
    // payload so a freshly spawned quick window starts from truth.
    pushState: payload => ipcRenderer.send('aegis:quick-entry:state', payload),
    // Quick window subscribes to those pushes.
    onState: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('aegis:quick-entry:state', listener)

      return () => ipcRenderer.removeListener('aegis:quick-entry:state', listener)
    },
    // Main → primary renderer: a submit captured by the quick window.
    onSubmit: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('aegis:quick-entry:submit', listener)

      return () => ipcRenderer.removeListener('aegis:quick-entry:submit', listener)
    },
    // Main → quick window: you were just summoned (reset draft + refocus).
    onShown: callback => {
      const listener = () => callback()
      ipcRenderer.on('aegis:quick-entry:shown', listener)

      return () => ipcRenderer.removeListener('aegis:quick-entry:shown', listener)
    },
    // Main → quick window: the outcome of a submit whose relay already timed
    // out. Delivery is now KNOWN — reconcile the unknown state instead of
    // leaving the user to resend a prompt that may already be delivered.
    onLateResult: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('aegis:quick-entry:late-result', listener)

      return () => ipcRenderer.removeListener('aegis:quick-entry:late-result', listener)
    }
  },
  getBootProgress: () => ipcRenderer.invoke('aegis:boot-progress:get'),
  getConnectionConfig: profile => ipcRenderer.invoke('aegis:connection-config:get', profile),
  saveConnectionConfig: payload => ipcRenderer.invoke('aegis:connection-config:save', payload),
  applyConnectionConfig: payload => ipcRenderer.invoke('aegis:connection-config:apply', payload),
  testConnectionConfig: payload => ipcRenderer.invoke('aegis:connection-config:test', payload),
  // Plugin SDK host.setProfileBackend / clearProfileBackend: main confirms
  // natively before a plugin's backend serves, or stops serving, a profile.
  setProfileBackend: payload => ipcRenderer.invoke('aegis:profile-backend:set', payload),
  confirmSetProfileBackend: payload => ipcRenderer.invoke('aegis:profile-backend:confirm-set', payload),
  clearProfileBackend: payload => ipcRenderer.invoke('aegis:profile-backend:clear', payload),
  confirmClearProfileBackend: payload => ipcRenderer.invoke('aegis:profile-backend:confirm-clear', payload),
  // Opt-in OS-keychain encryption for stored gateway secrets (default off —
  // see secret-storage-policy.ts). get never touches the OS keychain.
  getSecretStorageEncryption: () => ipcRenderer.invoke('aegis:secret-storage:get'),
  setSecretStorageEncryption: (on: boolean) => ipcRenderer.invoke('aegis:secret-storage:set', on),
  // v2 multi-connection registry: named agent sources (local / remote / cloud / ssh).
  connections: {
    list: () => ipcRenderer.invoke('aegis:connections:list'),
    save: payload => ipcRenderer.invoke('aegis:connections:save', payload),
    remove: id => ipcRenderer.invoke('aegis:connections:remove', id),
    setPrimary: id => ipcRenderer.invoke('aegis:connections:set-primary', id),
    setLaunchMode: mode => ipcRenderer.invoke('aegis:connections:set-launch-mode', mode),
    setLastUsed: id => ipcRenderer.invoke('aegis:connections:set-last-used', id),
    test: id => ipcRenderer.invoke('aegis:connections:test', id),
    updateManaged: id => ipcRenderer.invoke('aegis:connections:update-managed', id),
    // Fan out `aegis update` to every eligible registered connection.
    // Optional excludeIds skips rows the caller updates through another path.
    updateAll: options => ipcRenderer.invoke('aegis:connections:update-all', options),
    // Registry lifecycle push (main → renderer): a connection was removed or
    // materially edited, so secondaries scoped to it must be disposed (and,
    // for edits, re-dialed at the new target).
    onChanged: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('aegis:connections:changed', listener)

      return () => ipcRenderer.removeListener('aegis:connections:changed', listener)
    }
  },
  sshConfigHosts: () => ipcRenderer.invoke('aegis:ssh-config:hosts'),
  sshResolveHost: host => ipcRenderer.invoke('aegis:ssh-config:resolve', host),
  probeConnectionConfig: remoteUrl => ipcRenderer.invoke('aegis:connection-config:probe', remoteUrl),
  // `options` lets a registry-editor draft sign in BEFORE it is saved: the
  // main process settles the draft's connection id up front so the login
  // window writes into the per-connection cookie jar the saved entry will
  // read (not the legacy shared jar an unsaved URL would fall back to).
  oauthLoginConnectionConfig: (remoteUrl, options) =>
    ipcRenderer.invoke('aegis:connection-config:oauth-login', remoteUrl, options),
  oauthLogoutConnectionConfig: remoteUrl => ipcRenderer.invoke('aegis:connection-config:oauth-logout', remoteUrl),
  // Aegis AI Enterprise Autonomous Platform Cloud: one portal login powers discovery + silent per-agent sign-in
  // (cloud-auto-discovery Phase 3).
  cloud: {
    status: () => ipcRenderer.invoke('aegis:cloud:status'),
    login: () => ipcRenderer.invoke('aegis:cloud:login'),
    logout: () => ipcRenderer.invoke('aegis:cloud:logout'),
    discover: org => ipcRenderer.invoke('aegis:cloud:discover', org),
    agentSignIn: dashboardUrl => ipcRenderer.invoke('aegis:cloud:agent-sign-in', dashboardUrl)
  },
  profile: {
    getDefault: () => ipcRenderer.invoke('aegis:profile:default:get'),
    setDefault: (route: DesktopProfileRoute) => ipcRenderer.invoke('aegis:profile:default:set', route),
    onDefaultChanged: (callback: (route: DesktopProfileRoute | null) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, route: DesktopProfileRoute | null) => callback(route)
      ipcRenderer.on('aegis:profile:default:changed', listener)

      return () => ipcRenderer.removeListener('aegis:profile:default:changed', listener)
    },
    get: () => ipcRenderer.invoke('aegis:profile:get'),
    remember: name => ipcRenderer.invoke('aegis:profile:remember', name),
    importConnections: (record: Record<string, string>) =>
      ipcRenderer.invoke('aegis:profile:connections:import', record),
    rememberConnection: (connectionId: string, profile: string) =>
      ipcRenderer.invoke('aegis:profile:connections:remember', connectionId, profile),
    set: name => ipcRenderer.invoke('aegis:profile:set', name)
  },
  // The handler resolves an expected 404 with a sentinel instead of rejecting
  // (Electron logs a stack for every rejected invoke). Turn it back into the
  // rejection the renderer expects — see electron/api-expected-404.ts.
  api: request => ipcRenderer.invoke('aegis:api', request).then(unwrapExpectedNotFound),
  notify: payload => ipcRenderer.invoke('aegis:notify', payload),
  notifySupported: () => ipcRenderer.invoke('aegis:notify:supported'),
  claimStartupLatency: () => ipcRenderer.invoke('aegis:startup-latency:claim'),
  requestMicrophoneAccess: () => ipcRenderer.invoke('aegis:requestMicrophoneAccess'),
  readWindowBelow: () => ipcRenderer.invoke('aegis:window:readBelow'),
  readFileDataUrl: filePath => ipcRenderer.invoke('aegis:readFileDataUrl', filePath),
  readFileDataUrlForAttach: filePath => ipcRenderer.invoke('aegis:readFileDataUrlForAttach', filePath),
  dataUrlReadMax: {
    get: () => ipcRenderer.invoke('aegis:data-url-read-max:get'),
    set: maxMb => ipcRenderer.invoke('aegis:data-url-read-max:set', maxMb)
  },
  readFileText: filePath => ipcRenderer.invoke('aegis:readFileText', filePath),
  readPluginSource: (filePath: string) => ipcRenderer.invoke('aegis:readPluginSource', filePath),
  selectPaths: options => ipcRenderer.invoke('aegis:selectPaths', options),
  selectSavePath: options => ipcRenderer.invoke('aegis:selectSavePath', options),
  saveTextFileAs: request => ipcRenderer.invoke('aegis:saveTextFileAs', request),
  writeClipboard: text => ipcRenderer.invoke('aegis:writeClipboard', text),
  readClipboard: () => ipcRenderer.invoke('aegis:readClipboard'),
  saveGatewayFile: payload => ipcRenderer.invoke('aegis:saveGatewayFile', payload),
  saveImageFromUrl: url => ipcRenderer.invoke('aegis:saveImageFromUrl', url),
  contextMenuEdit: command => ipcRenderer.invoke('aegis:context-menu:edit', command),
  contextMenuCopyImage: () => ipcRenderer.invoke('aegis:context-menu:copy-image'),
  contextMenuSpellcheck: action => ipcRenderer.invoke('aegis:context-menu:spellcheck', action),
  contextMenuGuestAddWord: payload => ipcRenderer.invoke('aegis:context-menu:guest-add-word', payload),
  spellcheckDictionary: (op, word) => ipcRenderer.invoke('aegis:spellcheck:dictionary', { op, word }),
  onContextMenuSpellcheck: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('aegis:context-menu-spellcheck', listener)

    return () => ipcRenderer.removeListener('aegis:context-menu-spellcheck', listener)
  },
  saveImageBuffer: (data, ext, name) => ipcRenderer.invoke('aegis:saveImageBuffer', { data, ext, name }),
  capturePreview: payload => ipcRenderer.invoke('aegis:capturePreview', payload),
  savePastedText: text => ipcRenderer.invoke('aegis:savePastedText', { text }),
  saveClipboardImage: () => ipcRenderer.invoke('aegis:saveClipboardImage'),
  getPathForFile: file => {
    try {
      return webUtils.getPathForFile(file) || ''
    } catch {
      return ''
    }
  },
  normalizePreviewTarget: (target, baseDir) => ipcRenderer.invoke('aegis:normalizePreviewTarget', target, baseDir),
  watchPreviewFile: url => ipcRenderer.invoke('aegis:watchPreviewFile', url),
  watchDirectory: dir => ipcRenderer.invoke('aegis:watchDirectory', dir),
  stopPreviewFileWatch: id => ipcRenderer.invoke('aegis:stopPreviewFileWatch', id),
  setActiveWork: payload => ipcRenderer.send('aegis:active-work', payload),
  scheduleStreamWorkWake: (token, delayMs) => ipcRenderer.send('aegis:stream-work-wake', { token, delayMs }),
  onStreamWorkWake: callback => {
    const listener = (_event, token) => callback(token)
    ipcRenderer.on('aegis:stream-work-ready', listener)

    return () => ipcRenderer.removeListener('aegis:stream-work-ready', listener)
  },
  setTitleBarTheme: payload => ipcRenderer.send('aegis:titlebar-theme', payload),
  setNativeTheme: mode => ipcRenderer.send('aegis:native-theme', mode),
  setTranslucency: payload => ipcRenderer.send('aegis:translucency', payload),
  setKeepAwake: mode => ipcRenderer.send('aegis:keep-awake', mode),
  // Once per computer, after a timed sleep interrupted a turn with keep-awake off.
  onKeepAwakeOffer: callback => {
    const listener = () => callback()
    ipcRenderer.on('aegis:keep-awake-offer', listener)

    return () => ipcRenderer.removeListener('aegis:keep-awake-offer', listener)
  },
  minimizeToTray: {
    get: () => ipcRenderer.invoke('aegis:minimize-to-tray:get'),
    set: on => ipcRenderer.invoke('aegis:minimize-to-tray:set', on),
    onChanged: callback => {
      const listener = (_event, status) => callback(status)
      ipcRenderer.on('aegis:minimize-to-tray:changed', listener)

      return () => ipcRenderer.removeListener('aegis:minimize-to-tray:changed', listener)
    }
  },
  setDisableF12: blocked => ipcRenderer.send('aegis:devtools:disable-f12', blocked),
  setF12ShortcutActive: active => ipcRenderer.send('aegis:f12ShortcutActive', Boolean(active)),
  onF12Shortcut: callback => {
    const listener = (_event, input) => callback(input)
    ipcRenderer.on('aegis:f12-shortcut', listener)

    return () => ipcRenderer.removeListener('aegis:f12-shortcut', listener)
  },
  setPreviewShortcutActive: active => ipcRenderer.send('aegis:previewShortcutActive', Boolean(active)),
  setPreviewGuestHidden: (webContentsId, hidden) =>
    ipcRenderer.send('aegis:preview-guest-hidden', { webContentsId, hidden: Boolean(hidden) }),
  beginPreviewGuestActivity: webContentsId => ipcRenderer.invoke('aegis:preview-guest-activity:begin', webContentsId),
  endPreviewGuestActivity: token => ipcRenderer.invoke('aegis:preview-guest-activity:end', token),
  executePreviewGuestScript: (token, code) => ipcRenderer.invoke('aegis:preview-guest-activity:script', token, code),
  syncPreviewSignins: request => ipcRenderer.invoke('aegis:preview-signins:sync', request),
  migratePreviewSigninsForProfile: (request: { oldProfile: string; newProfile: string }) =>
    ipcRenderer.invoke('aegis:preview-signins:profile-renamed', request),
  dropPreviewSigninsForProfile: (request: { profile: string }) =>
    ipcRenderer.invoke('aegis:preview-signins:profile-deleted', request),
  openExternal: url => ipcRenderer.invoke('aegis:openExternal', url),
  freeTierChallenge: {
    // Load the account service's challenge page in a hidden window (revealed
    // only if the page asks for the human). Resolves with how it ended.
    run: request => ipcRenderer.invoke('aegis:freeTierChallenge:run', request)
  },
  mcpOauth: {
    // One-shot loopback listener for MCP OAuth against remote backends: bind
    // on this machine, hand redirectUri to mcp.servers.oauth.start, then wait
    // for the provider redirect and relay code/state via oauth.callback.
    listen: () => ipcRenderer.invoke('aegis:mcp-oauth:listen'),
    wait: (id, timeoutMs) => ipcRenderer.invoke('aegis:mcp-oauth:wait', id, timeoutMs),
    cancel: id => ipcRenderer.invoke('aegis:mcp-oauth:cancel', id)
  },
  openPreviewInBrowser: url => ipcRenderer.invoke('aegis:openPreviewInBrowser', url),
  reachPreviewUrl: url => ipcRenderer.invoke('aegis:preview:reach', url),
  setActiveConnectionRoute: route => ipcRenderer.send('aegis:connection:active-route', route),
  fetchLinkTitle: url => ipcRenderer.invoke('aegis:fetchLinkTitle', url),
  resolveFavicon: url => ipcRenderer.invoke('aegis:resolveFavicon', url),
  sanitizeWorkspaceCwd: cwd => ipcRenderer.invoke('aegis:workspace:sanitize', cwd),
  settings: {
    getDefaultProjectDir: () => ipcRenderer.invoke('aegis:setting:defaultProjectDir:get'),
    setDefaultProjectDir: dir => ipcRenderer.invoke('aegis:setting:defaultProjectDir:set', dir),
    pickDefaultProjectDir: () => ipcRenderer.invoke('aegis:setting:defaultProjectDir:pick')
  },
  preparedSubmissions: {
    read: () => ipcRenderer.invoke('aegis:prepared-submissions:read'),
    update: (key, entry) => ipcRenderer.invoke('aegis:prepared-submissions:update', key, entry),
    compareAndSet: (key, expected, entry) =>
      ipcRenderer.invoke('aegis:prepared-submissions:compare-and-set', key, expected, entry)
  },
  zoom: {
    // Current zoom of this window, as { level, percent }.
    get: () => ipcRenderer.invoke('aegis:zoom:get'),
    // Synchronous zoom factor (1 = 100%). Coordinate math needs it in the
    // same tick as the event it converts, so no IPC round-trip here.
    factor: () => webFrame.getZoomFactor(),
    setPercent: percent => ipcRenderer.send('aegis:zoom:set-percent', percent),
    // Fires on every zoom change, including the Ctrl/Cmd +/-/0 shortcuts,
    // so the settings UI can stay in sync with the keyboard.
    onChanged: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('aegis:zoom:changed', listener)

      return () => ipcRenderer.removeListener('aegis:zoom:changed', listener)
    }
  },
  revealLogs: () => ipcRenderer.invoke('aegis:logs:reveal'),
  getRecentLogs: () => ipcRenderer.invoke('aegis:logs:recent'),
  // Fire-and-forget: persists a renderer error-boundary catch (with component
  // stack) to desktop.log so crashes survive the window (#79428).
  reportRendererError: report => ipcRenderer.send('aegis:logs:renderer-error', report),
  logLine: (line: string): void => ipcRenderer.send('aegis:logs:renderer-line', line),
  readDir: dirPath => ipcRenderer.invoke('aegis:fs:readDir', dirPath),
  gitRoot: startPath => ipcRenderer.invoke('aegis:fs:gitRoot', startPath),
  revealPath: targetPath => ipcRenderer.invoke('aegis:fs:reveal', targetPath),
  openDir: dirPath => ipcRenderer.invoke('aegis:fs:openDir', dirPath),
  desktopPluginsRoot: () => ipcRenderer.invoke('aegis:fs:desktopPluginsRoot'),
  reconcileDesktopPlugins: async () => (await ipcRenderer.invoke('aegis:fs:reconcileDesktopPlugins')).published,
  reconcileDesktopPluginsReport: () => ipcRenderer.invoke('aegis:fs:reconcileDesktopPlugins'),
  logsRoot: (profile?: string) => ipcRenderer.invoke('aegis:fs:logsRoot', profile),
  renamePath: (targetPath, newName) => ipcRenderer.invoke('aegis:fs:rename', targetPath, newName),
  writeTextFile: (filePath, content) => ipcRenderer.invoke('aegis:fs:writeText', filePath, content),
  trashPath: targetPath => ipcRenderer.invoke('aegis:fs:trash', targetPath),
  pluginFiles: {
    request: (pluginId, labels) => ipcRenderer.invoke('aegis:pluginFiles:request', pluginId, labels),
    grants: pluginId => ipcRenderer.invoke('aegis:pluginFiles:grants', pluginId),
    revoke: (pluginId, folderId) => ipcRenderer.invoke('aegis:pluginFiles:revoke', pluginId, folderId),
    op: (pluginId, request) => ipcRenderer.invoke('aegis:pluginFiles:op', pluginId, request),
    onChanged: callback => {
      const listener = (_event, change) => callback(change)
      ipcRenderer.on('aegis:pluginFiles:changed', listener)

      return () => ipcRenderer.removeListener('aegis:pluginFiles:changed', listener)
    }
  },
  git: {
    worktreeList: repoPath => ipcRenderer.invoke('aegis:git:worktreeList', repoPath),
    worktreeAdd: (repoPath, options) => ipcRenderer.invoke('aegis:git:worktreeAdd', repoPath, options),
    worktreeRemove: (repoPath, worktreePath, options) =>
      ipcRenderer.invoke('aegis:git:worktreeRemove', repoPath, worktreePath, options),
    branchSwitch: (repoPath, branch) => ipcRenderer.invoke('aegis:git:branchSwitch', repoPath, branch),
    branchList: repoPath => ipcRenderer.invoke('aegis:git:branchList', repoPath),
    baseBranchList: repoPath => ipcRenderer.invoke('aegis:git:baseBranchList', repoPath),
    repoStatus: repoPath => ipcRenderer.invoke('aegis:git:repoStatus', repoPath),
    fileDiff: (repoPath, filePath) => ipcRenderer.invoke('aegis:git:fileDiff', repoPath, filePath),
    scanRepos: (roots, options) => ipcRenderer.invoke('aegis:git:scanRepos', roots, options),
    review: {
      list: (repoPath, scope, baseRef) => ipcRenderer.invoke('aegis:git:review:list', repoPath, scope, baseRef),
      diff: (repoPath, filePath, scope, baseRef, staged) =>
        ipcRenderer.invoke('aegis:git:review:diff', repoPath, filePath, scope, baseRef, staged),
      stage: (repoPath, filePath) => ipcRenderer.invoke('aegis:git:review:stage', repoPath, filePath),
      unstage: (repoPath, filePath) => ipcRenderer.invoke('aegis:git:review:unstage', repoPath, filePath),
      revert: (repoPath, filePath) => ipcRenderer.invoke('aegis:git:review:revert', repoPath, filePath),
      revParse: (repoPath, ref) => ipcRenderer.invoke('aegis:git:review:revParse', repoPath, ref),
      commit: (repoPath, message, push) => ipcRenderer.invoke('aegis:git:review:commit', repoPath, message, push),
      commitContext: repoPath => ipcRenderer.invoke('aegis:git:review:commitContext', repoPath),
      push: repoPath => ipcRenderer.invoke('aegis:git:review:push', repoPath),
      shipInfo: repoPath => ipcRenderer.invoke('aegis:git:review:shipInfo', repoPath),
      prList: (repoPath, branches, numbers) =>
        ipcRenderer.invoke('aegis:git:review:prList', repoPath, branches, numbers),
      createPr: repoPath => ipcRenderer.invoke('aegis:git:review:createPr', repoPath)
    }
  },
  terminal: {
    attach: id => ipcRenderer.invoke('aegis:terminal:attach', id),
    cwd: id => ipcRenderer.invoke('aegis:terminal:cwd', id),
    dispose: id => ipcRenderer.invoke('aegis:terminal:dispose', id),
    resize: (id, size) => ipcRenderer.invoke('aegis:terminal:resize', id, size),
    start: options => ipcRenderer.invoke('aegis:terminal:start', options),
    write: (id, data) => ipcRenderer.invoke('aegis:terminal:write', id, data),
    onData: (id, callback) => {
      const channel = `aegis:terminal:${id}:data`
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, listener)

      return () => ipcRenderer.removeListener(channel, listener)
    },
    onExit: (id, callback) => {
      const channel = `aegis:terminal:${id}:exit`
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on(channel, listener)

      return () => ipcRenderer.removeListener(channel, listener)
    }
  },
  onClosePreviewRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('aegis:close-preview-requested', listener)

    return () => ipcRenderer.removeListener('aegis:close-preview-requested', listener)
  },
  onPreviewNav: callback => {
    const listener = (_event, command) => callback(command)
    ipcRenderer.on('aegis:preview-nav', listener)

    return () => ipcRenderer.removeListener('aegis:preview-nav', listener)
  },
  onOpenFolderRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('aegis:open-folder-requested', listener)

    return () => ipcRenderer.removeListener('aegis:open-folder-requested', listener)
  },
  onOpenUpdatesRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('aegis:open-updates', listener)

    return () => ipcRenderer.removeListener('aegis:open-updates', listener)
  },
  onDeepLink: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('aegis:deep-link', listener)

    return () => ipcRenderer.removeListener('aegis:deep-link', listener)
  },
  signalDeepLinkReady: () => ipcRenderer.invoke('aegis:deep-link-ready'),
  probePluginRepo: payload => ipcRenderer.invoke('aegis:plugin:probe', payload),
  installDesktopPlugin: payload => ipcRenderer.invoke('aegis:plugin:installDesktop', payload),
  removeDesktopPlugin: payload => ipcRenderer.invoke('aegis:plugin:removeDesktop', payload),
  onWindowStateChanged: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('aegis:window-state-changed', listener)

    return () => ipcRenderer.removeListener('aegis:window-state-changed', listener)
  },
  onFocusSession: callback => {
    const listener = (_event, sessionId) => callback(sessionId)
    ipcRenderer.on('aegis:focus-session', listener)

    return () => ipcRenderer.removeListener('aegis:focus-session', listener)
  },
  onNotificationAction: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('aegis:notification-action', listener)

    return () => ipcRenderer.removeListener('aegis:notification-action', listener)
  },
  onNotificationActivate: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('aegis:notification-activate', listener)

    return () => ipcRenderer.removeListener('aegis:notification-activate', listener)
  },
  onExternalOpenFailed: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('aegis:external-open-failed', listener)

    return () => ipcRenderer.removeListener('aegis:external-open-failed', listener)
  },
  onPreviewFileChanged: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('aegis:preview-file-changed', listener)

    return () => ipcRenderer.removeListener('aegis:preview-file-changed', listener)
  },
  onBackendExit: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('aegis:backend-exit', listener)

    return () => ipcRenderer.removeListener('aegis:backend-exit', listener)
  },
  // Soft gateway-mode apply finished tearing down the primary backend. Renderer
  // should wipe session lists + re-dial without a window reload. `detail.profile`
  // names the one profile whose route moved (a plugin's setProfileBackend).
  onConnectionApplied: callback => {
    const listener = (_event, detail) => callback(detail && typeof detail === 'object' ? detail : {})
    ipcRenderer.on('aegis:connection:applied', listener)

    return () => ipcRenderer.removeListener('aegis:connection:applied', listener)
  },
  onPowerResume: callback => {
    const listener = () => callback()
    ipcRenderer.on('aegis:power-resume', listener)

    return () => ipcRenderer.removeListener('aegis:power-resume', listener)
  },
  // AC ↔ battery transitions; renderers slow their backstop polls on battery.
  getOnBattery: () => ipcRenderer.invoke('aegis:power-battery:get'),
  onBatteryChanged: callback => {
    const listener = (_event, onBattery) => callback(Boolean(onBattery))
    ipcRenderer.on('aegis:power-battery', listener)

    return () => ipcRenderer.removeListener('aegis:power-battery', listener)
  },
  // Whether the user is at this computer, by the OS idle clock where one is trustworthy.
  presence: {
    get: () => ipcRenderer.invoke('aegis:presence:get'),
    onChange: callback => {
      const listener = (_event, snapshot) => callback(snapshot)
      ipcRenderer.on('aegis:presence', listener)

      return () => ipcRenderer.removeListener('aegis:presence', listener)
    }
  },
  onBootProgress: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('aegis:boot-progress', listener)

    return () => ipcRenderer.removeListener('aegis:boot-progress', listener)
  },
  // First-launch bootstrap progress -- emitted by the install.ps1 stage
  // runner in main.ts (apps/desktop/electron/bootstrap-runner.ts).
  // Renderer's install overlay subscribes to live events and queries the
  // current snapshot via getBootstrapState() to recover after a devtools
  // reload mid-bootstrap.
  getBootstrapState: () => ipcRenderer.invoke('aegis:bootstrap:get'),
  probeLocalBackend: () => ipcRenderer.invoke('aegis:local-backend:probe'),
  continueBootstrapLocal: () => ipcRenderer.invoke('aegis:bootstrap:continue-local'),
  recycleBackend: profile => ipcRenderer.invoke('aegis:backend:recycle', profile),
  resetBootstrap: () => ipcRenderer.invoke('aegis:bootstrap:reset'),
  updateHold: {
    recheck: () => ipcRenderer.invoke('aegis:update-hold:recheck'),
    quit: () => ipcRenderer.invoke('aegis:update-hold:quit'),
    startAnyway: (request: { holdId: string; confirmed: true }) =>
      ipcRenderer.invoke('aegis:update-hold:start-anyway', request)
  },
  repairBootstrap: () => ipcRenderer.invoke('aegis:bootstrap:repair'),
  cancelBootstrap: () => ipcRenderer.invoke('aegis:bootstrap:cancel'),
  onBootstrapEvent: callback => {
    const listener = (_event, payload) => callback(payload)
    ipcRenderer.on('aegis:bootstrap:event', listener)

    return () => ipcRenderer.removeListener('aegis:bootstrap:event', listener)
  },
  getVersion: (scope?: { connectionId?: string; profile?: string }) => ipcRenderer.invoke('aegis:version', scope),
  relaunchApp: () => ipcRenderer.invoke('aegis:app:relaunch'),
  getMachineProfile: () => ipcRenderer.invoke('aegis:machine:profile'),
  getRemoteDisplayReason: () => ipcRenderer.invoke('aegis:get-remote-display-reason'),
  uninstall: {
    summary: () => ipcRenderer.invoke('aegis:uninstall:summary'),
    run: mode => ipcRenderer.invoke('aegis:uninstall:run', { mode }),
    openAppsSettings: () => ipcRenderer.invoke('aegis:uninstall:openAppsSettings')
  },
  updates: {
    check: opts => ipcRenderer.invoke('aegis:updates:check', opts),
    apply: opts => ipcRenderer.invoke('aegis:updates:apply', opts),
    setChannel: name => ipcRenderer.invoke('aegis:updates:channel:set', name),
    onProgress: callback => {
      const listener = (_event, payload) => callback(payload)
      ipcRenderer.on('aegis:updates:progress', listener)

      return () => ipcRenderer.removeListener('aegis:updates:progress', listener)
    },
    takePendingRun: () => ipcRenderer.invoke('aegis:updates:metric:take'),
    ackPendingRun: sent => ipcRenderer.invoke('aegis:updates:metric:ack', sent),
    onPendingRun: callback => {
      const listener = () => callback()
      ipcRenderer.on('aegis:updates:metric:pending', listener)

      return () => ipcRenderer.removeListener('aegis:updates:metric:pending', listener)
    }
  },
  desktopMetrics: {
    setEnabled: (on, profile) => ipcRenderer.invoke('aegis:desktop-metrics:set-enabled', on, profile),
    takeRendererCrashes: () => ipcRenderer.invoke('aegis:desktop-metrics:crash:take'),
    ackRendererCrashes: sent => ipcRenderer.invoke('aegis:desktop-metrics:crash:ack', sent)
  },
  themes: {
    fetchMarketplace: id => ipcRenderer.invoke('aegis:vscode-theme:fetch', id),
    searchMarketplace: query => ipcRenderer.invoke('aegis:vscode-theme:search', query)
  },
  // Find-in-page (Ctrl/Cmd+F): delegates to Electron's
  // webContents.findInPage on the IPC sender's window so a Cmd+F pressed
  // in a secondary session window searches THAT window, not the primary.
  // `onFoundInPage` returns the unsubscribe fn; the renderer wires it via
  // `initFindInPageListener` in store/find-in-page.ts and tears it down
  // when the FindBar unmounts.
  findInPage: (query, options) => ipcRenderer.invoke('aegis:find-in-page', query, options),
  stopFindInPage: () => ipcRenderer.invoke('aegis:stop-find-in-page'),
  onFoundInPage: callback => {
    const listener = (_event, result) => callback(result)
    ipcRenderer.on('aegis:found-in-page', listener)

    return () => ipcRenderer.removeListener('aegis:found-in-page', listener)
  },
  // Main-process `before-input-event` forwards Ctrl/Cmd+F here so renderer
  // can open the FindBar even when the GTK compositor has already grabbed
  // the chord at the windowing layer (#81727).
  onOpenFindBarRequested: callback => {
    const listener = () => callback()
    ipcRenderer.on('aegis:open-find-bar', listener)

    return () => ipcRenderer.removeListener('aegis:open-find-bar', listener)
  }
})
