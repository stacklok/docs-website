---
title: Authentication and authorization framework
description:
  Understanding ToolHive's authentication and authorization framework concepts.
sidebar_position: 50
---

This document explains the concepts behind ToolHive's authentication and
authorization framework, which secures MCP servers by verifying client identity
and controlling access to resources. You'll learn how these systems work
together, why they're designed this way, and the benefits of this approach.

## Understanding authentication vs. authorization

When you secure MCP servers, you need to understand the strong separation
between two critical security concepts:

- **Authentication (authN):** Verifying the identity of clients connecting to
  your MCP server ("Who are you?")
- **Authorization (authZ):** Determining what actions authenticated clients are
  allowed to perform ("What can you do?")

You should always perform authentication first, using a trusted identity
provider, and then apply authorization rules to determine what the authenticated
identity can do. ToolHive helps you follow this best practice by acting as a
gateway in front of your MCP servers. This approach lets you use proven identity
systems for authentication, while keeping your authorization policies clear,
flexible, and auditable. You don't need to add custom authentication or
authorization logic to every server—ToolHive handles it for you, consistently
and securely.

## ToolHive vs. MCP specification

The official Model Context Protocol (MCP) specification recommends OAuth
2.1-based authorization for HTTP transports, which can require each MCP server
to implement OAuth endpoints and manage tokens. ToolHive takes a different
approach: it centralizes authentication and authorization in its proxy layer,
using OIDC for authentication and Cedar for fine-grained authorization. This
means you don't need to implement OAuth flows or scope management in every
server—just configure ToolHive with your IdP and write clear policies. This
approach is more flexible, secure, and easier to manage for you and your team.

## Authentication framework

ToolHive uses OpenID Connect (OIDC), an identity layer built on top of OAuth
2.0, for authentication. OIDC is a widely adopted, interoperable protocol that
lets you connect ToolHive to any OIDC-compliant identity provider (IdP), such as
Google, GitHub, Microsoft Entra ID (Azure AD), Okta, Auth0, or even Kubernetes
service accounts. ToolHive never handles your raw passwords or credentials;
instead, it relies on signed identity tokens (usually JWTs) issued by your
trusted provider.

### Why use OIDC?

OIDC provides several key advantages for securing MCP servers:

- **Standard and interoperable:** You can connect ToolHive to any OIDC-compliant
  IdP without custom code, supporting both human users and automated services.
- **Proven and secure:** Authentication is delegated to battle-tested identity
  systems, which handle login UI, multi-factor authentication, and password
  storage.
- **Decoupled identity management:** You can use your existing SSO/IdP
  infrastructure, making onboarding and management seamless.
- **Flexible for users and services:** OIDC supports both interactive user login
  (for example, Google sign-in) and service-to-service authentication (for
  example, Kubernetes service account tokens).

### Real-world authentication scenarios

Understanding how OIDC works in practice helps you design better security for
your MCP servers:

**User login via Google (OIDC):** You can run an MCP server that requires
authentication using your Google credentials. ToolHive delegates login to
Google, receives a signed ID token, and uses it to authenticate you. This means
users get a familiar login experience while you benefit from Google's security
infrastructure.

**Service-to-service auth with Kubernetes:** If you run a microservice in a
Kubernetes cluster, it can present its service account token (an OIDC JWT) to
ToolHive. ToolHive validates the token using the cluster's OIDC issuer and JWKS
URL, enabling secure, automated authentication for your internal services.

### JWT-based authentication

ToolHive uses JSON Web Tokens (JWTs) for authentication. JWTs are compact,
self-contained tokens that securely transmit identity information. Each JWT has
three parts:

1. **Header:** Metadata about the token
2. **Payload:** Claims about the entity (typically you or your service)
3. **Signature:** Ensures the token hasn't been altered

### Authentication flow

The authentication process follows these steps:

1. **Token acquisition:** You obtain a JWT from your identity provider.
2. **Token presentation:** You include the JWT in your requests to ToolHive.
3. **Token validation:** ToolHive validates the JWT's signature, expiration, and
   claims.
4. **Identity extraction:** ToolHive extracts your identity information from the
   validated JWT.

```mermaid
flowchart TD
    Client -->|OIDC Token| ToolHive
    ToolHive -->|Validate Token| OIDC_Provider[OIDC Provider]
    ToolHive -->|Evaluate Cedar Policy| Cedar_Authorizer[Cedar Authorizer]
    Cedar_Authorizer -->|Permit| MCP_Server
    Cedar_Authorizer -->|Deny| Denied[403 Forbidden]
```

### Identity providers

ToolHive can integrate with any provider that supports OIDC, including:

- Google
- GitHub
- Microsoft Entra ID (Azure AD)
- Okta
- Auth0
- Kubernetes (service account tokens)

This flexibility lets you use your existing identity infrastructure for both
users and services, reducing operational overhead and improving security.

## Authorization framework

After authentication, ToolHive enforces authorization using Amazon's Cedar
policy language. ToolHive acts as a gateway in front of MCP servers, handling
all authorization checks before requests reach the server logic. This means MCP
servers do not need to implement their own OAuth or custom authorization
logic—ToolHive centralizes and standardizes access control.

### Why Cedar for authorization?

Cedar provides several advantages for MCP server authorization:

- **Expressive and flexible:** Cedar supports both role-based (RBAC) and
  attribute-based (ABAC) access control patterns, letting you create policies
  that match your security requirements.
- **Formally verified:** Cedar's design has been formally verified for safety
  and security properties, reducing the risk of policy bugs.
- **Human-readable:** Cedar policies use clear, declarative syntax that's easy
  to read, write, and audit.
- **Policy enforcement point:** ToolHive blocks unauthorized requests before
  they reach the MCP server, reducing risk and simplifying server code.
- **Secure-by-default:** Authorization is explicit—if a request is not
  explicitly permitted, it is denied. Deny rules take precedence over permit
  rules (deny overrides).

### Authorization components

ToolHive's authorization framework consists of:

1. **Cedar authorizer:** Evaluates Cedar policies to determine if a request is
   authorized
2. **Authorization middleware:** Extracts information from MCP requests and uses
   the Cedar Authorizer
3. **Configuration:** A JSON or YAML file that specifies the Cedar policies and
   entities

### Authorization flow

When a request arrives at an MCP server with authorization enabled:

1. The JWT middleware authenticates the client and adds JWT claims to the
   request context
2. The authorization middleware extracts information from the request
   (principal, action, resource, and any arguments)
3. The Cedar authorizer evaluates policies to determine if the request is
   authorized
4. If authorized, the request proceeds; otherwise, a 403 Forbidden response is
   returned

```mermaid
flowchart TD
    Client -->|JWT| ToolHive
    ToolHive -->|Validate JWT| JWT_Middleware
    JWT_Middleware -->|Extract Claims| Authz_Middleware
    Authz_Middleware -->|Evaluate Cedar Policies| Cedar_Authorizer
    Cedar_Authorizer -->|Permit| MCP_Server
    Cedar_Authorizer -->|Deny| Denied[403 Forbidden]
```

## Security and operational benefits

ToolHive's authentication and authorization approach provides several key
benefits:

- **Separation of concerns:** Authentication and authorization are handled
  independently, following security best practices.
- **Integration with existing systems:** Use your existing identity
  infrastructure (SSO, IdPs, Kubernetes, etc.).
- **Centralized, flexible policy model:** Define precise, auditable access rules
  in a single place—no need to modify MCP server code.
- **Secure by default:** Requests are denied unless explicitly permitted by
  policy, with deny precedence for maximum safety.
- **Auditable and versionable:** Policies are clear, declarative, and can be
  tracked in version control for compliance and review.
- **Developer and operator friendly:** ToolHive acts as a smart proxy, so you
  don't need to implement complex OAuth or custom auth logic in every server.

## Client support for MCP server authentication

While ToolHive provides a robust authentication and authorization framework for
MCP servers, it's important to understand the current state of client support
across the ecosystem.

### Current limitations

Most AI coding clients and MCP client implementations do not currently support
authentication when connecting to MCP servers. This means that many popular AI
development tools expect MCP servers to be accessible without authentication,
which limits the security options available for production deployments.

### Expected evolution

As the official MCP specification matures and security becomes a higher priority
for production MCP deployments, we expect to see authentication support
implemented across major AI coding clients. The MCP specification already
includes provisions for OAuth 2.1-based authorization, and client
implementations are likely to adopt these standards over time.

### Current use cases

Today, MCP server authentication is primarily valuable for:

- **Custom AI applications and agent workflows:** If you're building your own AI
  application or agent system, you can implement MCP client authentication to
  work with ToolHive's secure MCP servers.
- **Kubernetes service account authentication:** For automated services running
  in Kubernetes clusters, service account tokens provide a secure way to
  authenticate with MCP servers without requiring interactive login flows.
- **Internal tooling and APIs:** Organizations building internal tools that
  consume MCP servers can implement authentication to secure access to sensitive
  resources and tools.

### Planning for the future

When designing your MCP server security strategy, consider that:

- Authentication support in popular AI coding clients will likely improve over
  time
- ToolHive's OIDC-based approach aligns with emerging standards and will be
  compatible with future client implementations
- You can start with authenticated MCP servers for internal use cases and
  gradually expand as client support improves

This evolving landscape means that while authentication capabilities exist
today, their practical application depends on your specific use case and client
requirements.

## Related information

- For detailed policy writing guidance, see
  [Cedar policies](./cedar-policies.mdcedar-policies.md)
