// Aegis Enterprise Autonomous Platform - Optimized & Secured
import type { TranslationOverrides } from './define-locale'

// The boot screen's copy (including the update-hold screen), composed by de.ts.
export const deBoot = {
  boot: {
    ready: 'Aegis AI Enterprise Autonomous Platform Desktop ist bereit',
    desktopBootFailedWithMessage: message => `Desktop-Start fehlgeschlagen: ${message}`,
    steps: {
      connectingGateway: 'Live-Desktop-Gateway wird verbunden',
      loadingSettings: 'Aegis AI Enterprise Autonomous Platform-Einstellungen werden geladen',
      loadingSessions: 'Letzte Sessions werden geladen',
      retryingRemoteBackend: 'Wird mit dem Remote-Aegis AI Enterprise Autonomous Platform-Backend neu verbunden…',
      startingDesktopConnection: 'Desktop-Verbindung wird gestartet',
      startingAegis AI Enterprise Autonomous PlatformDesktop: 'Aegis AI Enterprise Autonomous Platform Desktop wird gestartet…'
    },
    errors: {
      backgroundExited: 'Der Aegis AI Enterprise Autonomous Platform-Hintergrundprozess wurde beendet.',
      backgroundExitedDuringStartup: 'Der Aegis AI Enterprise Autonomous Platform-Hintergrundprozess wurde während des Starts beendet.',
      backendStopped: 'Backend gestoppt',
      restartAegis AI Enterprise Autonomous Platform: 'Aegis AI Enterprise Autonomous Platform neu starten',
      openLogs: 'Logs öffnen',
      desktopBootFailed: 'Desktop-Start fehlgeschlagen',
      gatewayConnectionLost: 'Verbindung zum Gateway verloren',
      gatewayConnectionLostDetail:
        'Im Hintergrund wird weiterhin versucht, die Verbindung herzustellen. Sie können weiterlesen und weiterschreiben – öffnen Sie die Gateway-Einstellungen, falls das anhält.',
      reconnectNow: 'Jetzt neu verbinden',
      connectionSettings: 'Verbindungseinstellungen',
      gatewaySignInRequired: 'Gateway-Sign-in erforderlich',
      gatewaySignInRequiredDetail:
        'Melden Sie sich erneut an, um die Verbindung wiederherzustellen. Ihre Chats und Einstellungen sind sicher.',
      signInAgain: 'Erneut anmelden',
      ipcBridgeUnavailable: 'Der Desktop-IPC-Bridge ist nicht verfügbar.'
    },
    causes: {
      exitedEarly: 'Der Hintergrunddienst von Aegis AI Enterprise Autonomous Platform hat direkt nach dem Start aufgehört.',
      timedOut: 'Der Hintergrunddienst von Aegis AI Enterprise Autonomous Platform hat nicht rechtzeitig geantwortet.',
      permission: 'Aegis AI Enterprise Autonomous Platform konnte nicht in seinen Datenordner schreiben (Berechtigungsproblem).',
      diskFull: 'Die Festplatte ist voll, deshalb konnte Aegis AI Enterprise Autonomous Platform nicht starten.',
      portInUse: 'Ein anderes Programm verwendet den Netzwerkport, den Aegis AI Enterprise Autonomous Platform braucht.',
      installMissing:
        'Ein Teil der Aegis AI Enterprise Autonomous Platform-Installation fehlt. Wählen Sie „Installation reparieren“, um sie wiederherzustellen.'
    },
    failure: {
      title: 'Aegis AI Enterprise Autonomous Platform konnte nicht gestartet werden',
      description:
        'Das Hintergrund-Gateway ist nicht gestartet. Probieren Sie einen der Wiederherstellungsschritte unten. Keiner davon löscht Ihre Chats oder Einstellungen.',
      details: 'Details',
      remoteTitle: 'Remote-Gateway-Sign-in erforderlich',
      remoteDescription:
        'Ihre Remote-Gateway-Session ist abgelaufen. Melden Sie sich erneut an, um die Verbindung wiederherzustellen. Keiner dieser Schritte löscht Ihre Chats oder Einstellungen.',
      retry: 'Erneut versuchen',
      repairInstall: 'Installation reparieren',
      useLocalGateway: 'Lokales Gateway verwenden',
      gatewaySettings: 'Gateway-Einstellungen',
      back: 'Zurück',
      openLogs: 'Logs öffnen',
      repairHint:
        'Die Reparatur führt den Installer erneut aus und kann auf einem frischen Computer ein paar Minuten dauern.',
      remoteSignInHint: signInLabel =>
        `Meldet Sie von der gespeicherten Remote-Browser-Session ab und öffnet dann ${signInLabel}. Verwenden Sie das lokale Gateway, um stattdessen zum integrierten Backend zu wechseln.`,
      signOutAndSignIn: 'Abmelden & anmelden',
      remoteFailureHint:
        'Überprüfen Sie die Gateway-URL und die Anmeldung in den Gateway-Einstellungen, oder wechseln Sie zum lokalen Gateway.',
      cloudDownTitle: 'Nous Cloud Agent ist down',
      cloudDownDescription:
        'Der von Nous verwaltete Cloud-Agent, mit dem sich dieses Gateway verbindet, meldet einen Serverfehler. Er kann von hier aus nicht neu gestartet werden – prüfen Sie seinen Status, wechseln Sie zum lokalen Gateway oder wenden Sie sich an den Support.',
      cloudDownHint:
        'Die Schaltflächen unten öffnen das Nous Portal (Instanzstatus und Steuerung) und unseren Discord für Support.',
      cloudDownCheckPortal: 'Portal-Status prüfen',
      cloudDownDiscord: 'Hilfe auf Discord holen',
      hideRecentLogs: 'Neueste Logs ausblenden',
      showRecentLogs: 'Neueste Logs anzeigen',
      signedInTitle: 'Angemeldet',
      signedInMessage: 'Wird mit dem Remote-Gateway neu verbunden…',
      signInIncompleteTitle: 'Sign-in unvollständig',
      signInIncompleteMessage: 'Das Anmeldefenster wurde geschlossen, bevor die Authentifizierung abgeschlossen war.',
      signInFailed: 'Sign-in fehlgeschlagen',
      signInToRemoteGateway: 'Beim Remote-Gateway anmelden',
      signInWithProvider: provider => `Mit ${provider} anmelden`,
      identityProvider: 'Ihr Identity-Provider'
    },
    updateHold: {
      title: 'Ein früheres Update hält Aegis AI Enterprise Autonomous Platform noch fest',
      titleUnverified: 'Aegis AI Enterprise Autonomous Platform kann nicht bestätigen, dass das letzte Update fertig ist',
      description:
        'Aegis AI Enterprise Autonomous Platform startet noch nicht, damit es keine Dateien lädt, die ein Update womöglich noch ändert. Sobald die Sperre endet, startet Aegis AI Enterprise Autonomous Platform von selbst.',
      heldByProcess: pid =>
        `Das Update (Prozess ${pid}) wurde beendet, aber ein von ihm gestarteter Prozess hält die Aegis AI Enterprise Autonomous Platform-Installation noch fest.`,
      heldUnknown:
        'Ein Update wurde beendet, aber ein von ihm gestarteter Prozess hält die Aegis AI Enterprise Autonomous Platform-Installation noch fest.',
      unverified:
        'Der Update-Helfer konnte gerade nicht prüfen, wem die Aegis AI Enterprise Autonomous Platform-Installation gehört. Aegis AI Enterprise Autonomous Platform prüft weiter.',
      since: time => `Wartet seit ${time}`,
      lastChecked: time => `Zuletzt geprüft ${time}`,
      recoveryHint:
        'Das löst sich meist in wenigen Minuten. Falls nicht: Aegis AI Enterprise Autonomous Platform beenden, übrig gebliebene git- oder aegis-Prozesse beenden (oder den Computer neu starten) und Aegis AI Enterprise Autonomous Platform erneut öffnen.',
      checkAgain: 'Erneut prüfen',
      quit: 'Aegis AI Enterprise Autonomous Platform beenden',
      openLogs: 'Logs öffnen',
      startAnyway: 'Trotzdem starten…',
      confirmTitle: 'Aegis AI Enterprise Autonomous Platform starten, obwohl das Update es noch festhält?',
      confirmBody:
        'Der übrig gebliebene Update-Prozess ändert womöglich noch Dateien von Aegis AI Enterprise Autonomous Platform. Ein Start jetzt kann eine halb aktualisierte Installation laden, die erst nach einem erneuten Update wieder funktioniert. Aegis AI Enterprise Autonomous Platform protokolliert diese Entscheidung und lässt die Update-Markierung bestehen.',
      confirmKeepWaiting: 'Weiter warten',
      confirmStart: 'Trotzdem starten',
      startAnywayRefused:
        'Was die Installation festhält, hat sich geändert, bevor Aegis AI Enterprise Autonomous Platform starten konnte. Bitte erneut prüfen.'
    }
  }
} satisfies Pick<TranslationOverrides, 'boot'>
