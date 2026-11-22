#!/usr/bin/env bash
# Implementation of the check-version composite action (action.yml in this folder), used
# by the merge-protect and publish-images workflows.
#
# frontend/package.json is the source of truth for the app version, and version branches
# are named after it (vX.Y.Z). A version is "released" once it's on main, and main's
# version only moves forward, so any version <= main's has been released.
#
# Usage (run from the repo root; also works locally):
#   .github/actions/check-version/check-version.sh matches <branch>
#       Fails unless <branch> is a version branch (vX.Y.Z) that matches
#       frontend/package.json's version.
#   .github/actions/check-version/check-version.sh unreleased <branch>
#       Fails if the version branch <branch> has already been released to main.
#       Fetches origin/main to compare against its frontend/package.json version.

set -euo pipefail

VERSION_BRANCH_PATTERN='^v[0-9]+\.[0-9]+\.[0-9]+$'

error() {
  # Formatted as a GitHub Actions error annotation so it shows up on the run summary
  echo "::error::$1"
  exit 1
}

require_version_branch() {
  if [[ ! "$1" =~ $VERSION_BRANCH_PATTERN ]]; then
    error "$1 is not a version branch (e.g. v1.2.3)."
  fi
}

# Succeeds if $1 is newer than $2, comparing as versions (so 1.0.10 > 1.0.9)
is_newer() {
  [[ "$1" != "$2" && "$(printf '%s\n%s\n' "$1" "$2" | sort -V | tail -n1)" == "$1" ]]
}

check_matches() {
  local branch="$1"
  require_version_branch "$branch"

  local package_version
  package_version=$(jq -r '.version' frontend/package.json)
  if [[ "$package_version" != "${branch#v}" ]]; then
    error "The version in frontend/package.json ($package_version) does not match the branch $branch. Update package.json and package-lock.json to ${branch#v}."
  fi
}

check_unreleased() {
  local branch="$1"
  require_version_branch "$branch"

  git fetch --no-tags --depth=1 --quiet origin main
  local released
  released=$(git show origin/main:frontend/package.json | jq -r '.version')

  if ! is_newer "${branch#v}" "$released"; then
    local major minor patch
    IFS=. read -r major minor patch <<< "$released"
    error "$branch has already been released (main is at v$released), so it can't be changed. Put follow-up changes on a new version branch, e.g. v$major.$minor.$((patch + 1))."
  fi
}

case "${1:-}" in
  matches) check_matches "${2:?branch required}" ;;
  unreleased) check_unreleased "${2:?branch required}" ;;
  *)
    echo "Usage: $0 {matches|unreleased} <branch>" >&2
    exit 2
    ;;
esac
