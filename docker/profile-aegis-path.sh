# shellcheck shell=sh
# Installed as /etc/profile.d/aegis.sh. Debian's /etc/profile resets PATH for
# every login shell (`bash -l`, `docker exec <c> bash -l`, ssh, the terminal
# tool's background `bash -lic`), dropping the image's ENV PATH dirs, so bare
# `aegis` exits 127 there. Put them back in the ENV PATH order; dirs a login
# PATH already lists keep their position.
for __aegis_p in /opt/data/.local/bin /opt/aegis/.venv/bin /opt/aegis/bin; do
    case ":$PATH:" in
        *":$__aegis_p:"*) ;;
        *) PATH="$__aegis_p:$PATH" ;;
    esac
done
unset __aegis_p
export PATH
