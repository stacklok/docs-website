# Summary of changes

- Added a **Built-in agents** section in `docs/toolhive/guides-ui/playground.mdx` covering the **ToolHive Assistant** and the renamed **Skill Engineer** built-in agents (PR #2184).
- Added an **Enable installed skills** subsection in `docs/toolhive/guides-ui/playground.mdx` describing the new Skills picker on the composer toolbar (PR #2184).
- Updated the **Version** field copy in `docs/toolhive/guides-ui/skills-browse-install.mdx` to cover the new tag/digest auto-split behavior on paste (PR #2185).
- Added a **Build a skill from the Playground** section in `docs/toolhive/guides-ui/skills-build.mdx` and a new **Audit an installed skill** section in `docs/toolhive/guides-ui/skills-manage.mdx`, both pointing at the Skill Engineer agent.

Skipped (no doc impact this release):

- PR #2192 (chat virtualization) — internal performance change.
- PR #2206 (Flatpak Docker Desktop socket) — Flatpak isn't a documented install method.
- PR #2187 (skill deep-links) — broader `toolhive-gui://` deep-link surface isn't documented yet; covering only the new skill intents would be inconsistent. Worth a future follow-up.
