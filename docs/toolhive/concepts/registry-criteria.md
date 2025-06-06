---
title: 'Registry criteria'
description: Criteria for adding MCP servers to the ToolHive registry
sidebar_position: 50
---

The ToolHive registry maintains a curated list of MCP servers that meet specific
criteria. We aim to establish a curated, community-auditable list of
high-quality MCP servers through clear, observable, and objective criteria. Here
are the criteria for adding an MCP server to the ToolHive registry:

## Heuristics

### Open source requirements

- Must be fully open source with no exceptions
- Source code must be publicly accessible
- Must use an acceptable open source license (see
  [Acceptable licenses](#acceptable-licenses) below)

### Security

- Software provenance verification (Sigstore, GitHub Attestations)
- SLSA compliance level assessment
- Pinned dependencies and GitHub Actions
- Published Software Bill of Materials (SBOMs)

### Continuous integration

- Automated dependency updates (Dependabot, Renovate, etc.)
- Automated security scanning
- CVE monitoring
- Code linting and quality checks

### Repository metrics

- Repository stars and forks
- Commit frequency and recency
- Contributor activity
- Issue and pull request statistics

### API compliance

- Full MCP API specification support
- Implementation of all required endpoints (tools, resources, etc.)
- Protocol version compatibility

### Tool stability

- Version consistency
- Breaking change frequency
- Backward compatibility maintenance

### Code quality

- Presence of automated tests
- Test coverage percentage
- Quality CI/CD implementation
- Code review practices

### Documentation

- Basic project documentation
- API documentation
- Deployment and operation guides
- Regular documentation updates

### Release process

- Established CI-based release process
- Regular release cadence
- Semantic versioning compliance
- Maintained changelog

### Community health

#### Responsiveness

- Active maintainer engagement
- Regular commit activity
- Timely issue and pull request responses (issues open 3-4 weeks without
  response is a red flag)
- Bug resolution rate
- User support quality

#### Community strength

- Project backing (individual vs. organizational)
- Number of active maintainers
- Contributor diversity
- Corporate or foundation support
- Governance model maturity

### Security requirements

#### Authentication and authorization

- Secure authentication mechanisms
- Proper authorization controls
- Standard security protocol support (OAuth, TLS)

#### Data protection

- Encryption for data in transit and at rest
- Proper sensitive information handling

#### Security practices

- Clear incident response channels
- Security issue reporting mechanisms (email, GHSA, etc.)

## Future considerations

### Automated vs manual checks

- Balance between automated checks (e.g., CI/CD, security scans) and manual
  reviews (e.g., community health, documentation quality)
- Automated checks for basic compliance (e.g., license, API support)
- Manual reviews for nuanced aspects (e.g., community strength, documentation
  quality)

### Scoring system

- **Required**: Essential attributes (significant penalty if missing)
- **Expected**: Typical well-executed project attributes (moderate score impact)
- **Recommended**: Good practice indicators (positive contribution)
- **Bonus**: Excellence demonstrators (pure positive, no penalty for absence)

### Tiered classifications

- "Verified" vs "Experimental/Community" designations
- Minimum threshold requirements (stars, maintainers, community indicators)
- Regular re-evaluation frequency for automated checks

## Acceptable licenses

The following open source licenses are accepted for MCP servers in the ToolHive
registry:

### Permissive licenses

Licenses such as Apache-2.0, MIT, BSD-2-Clause, and BSD-3-Clause allow maximum
flexibility for integration, modification, and redistribution with minimal
restrictions, making MCP servers accessible across all project types and
commercial applications.

### Excluded licenses

We exclude copyleft and restrictive licenses such as AGPL, GPL2, and GPL3 to
ensure MCP servers can be freely integrated into various commercial and open
source projects without legal complications or viral licensing requirements.
