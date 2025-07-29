# Security Policy

Stacklok takes security seriously! We appreciate your efforts to disclose your
findings responsibly and will make every effort to acknowledge your
contributions.

## Reporting a vulnerability

To report a security issue, please use the GitHub Security Advisory
["Report a Vulnerability"](https://github.com/stacklok/docs-website/security/advisories/new)
tab.

If you are unable to access GitHub you can also email us at
[security@stacklok.com](mailto:security@stacklok.com).

When reporting a vulnerability, please include:

- Steps to reproduce the issue
- Description of the potential impact
- Any additional context that would help us understand the issue

If you are only comfortable sharing under GPG, please start by sending an email
requesting a public PGP key to use for encryption.

### Contacting the Stacklok security team

Contact the team by sending email to
[security@stacklok.com](mailto:security@stacklok.com).

## About this project

This repository contains a documentation website built with Docusaurus. Security
vulnerabilities in this context are most likely to come from:

- Upstream dependencies (Node.js packages, Docusaurus framework)
- Build and deployment pipeline issues
- Content injection or cross-site scripting vulnerabilities
- Infrastructure or hosting configuration issues

## Disclosure process

Stacklok follows a responsible disclosure model for handling security
vulnerabilities.

### Private disclosure

We prefer that suspected vulnerabilities be reported privately to allow us time
to investigate and address the issue before public disclosure.

### Public disclosure

If you become aware of a publicly disclosed security vulnerability that affects
this documentation website, please email
[security@stacklok.com](mailto:security@stacklok.com) immediately so we can
assess the impact and take appropriate action.

## Response process

When a vulnerability is reported:

1. **Acknowledgment**: We will acknowledge receipt of your report within 2
   business days
2. **Assessment**: Our security team will assess the vulnerability and determine
   its impact
3. **Resolution**: We will work to address the issue, which may involve:
   - Updating dependencies
   - Modifying configuration
   - Coordinating with upstream projects
   - Implementing workarounds or mitigations
4. **Communication**: We will keep you informed of our progress and notify the
   community as appropriate

For vulnerabilities in upstream dependencies, our response timeline may depend
on fixes being available from the upstream maintainers.

## Community notification

Significant security updates will be communicated through:

- GitHub Security Advisories
- Updates to this documentation
- The [Stacklok Discord Server](https://discord.gg/stacklok)
