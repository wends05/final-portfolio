# Portfolio user brief

Date: 2026-10-04
Scope: Documented portfolio goals and the initial storage discussion.
`[E]` means supported by the owner or project documents. `[A]` means an assumption to validate.

## Jobs

- `[E]` When updating the portfolio, the owner wants to present projects and skills so visitors can check their work and credentials. Source: [product intent](../intent.md).
- `[E]` When checking credentials, a visitor wants to find projects, demonstrated skills, and a CV without hunting through the site. Source: [product intent](../intent.md).

## Users

**Portfolio owner**

- `[E]` Goal: showcase their work and create or edit projects and skills. Source: [product intent](../intent.md).
- `[E]` Tool preference under consideration: use Bun for storage operations with Neon. Source: owner's request on 2026-10-04.
- Device context, proficiency, and current content-management friction have not been established in this discussion.

**Visitor checking credentials**

- `[E]` Goal: verify the owner's experience through projects, skills, and a downloadable CV. Source: [product intent](../intent.md).
- Device context and observed browsing behavior have not been established in this discussion.

## Mental model

- `[E]` The owner describes their storage as being in Neon and asks about using the Bun package to handle storage operations. Source: owner's request on 2026-10-04.
- The term storage needs clarification: files in a Neon Object Storage bucket, rows in Neon Postgres, or both. The documentation separates bucket keys from project data; this is a system distinction, not a confirmed statement of the owner's mental model.

## Assumptions and open questions

| Claim | Tag | Confidence | Impact | Validation |
| --- | --- | --- | --- | --- |
| This request concerns project image uploads to Neon Object Storage. | `[A]` | Medium | High | Ask the owner whether storage means files, database rows, or both before choosing implementation scope. |

The storage question was presented to the owner on 2026-10-04. No storage workflow or implementation scope has been accepted. Feature-specific journeys will belong with the feature's planning once the requested operations are known.

## Update: 2026-10-17

`[E]` The storage question no longer applies. The owner dropped the admin dashboard and the database: content, including images, lives in the repository and is edited by pull request ([decision 0019](../decisions/0019-static-site-content-in-repo.md)). Source: owner's decision on 2026-10-17. The owner's job "create or edit projects and skills" is now done by editing files, because the owner already works in the codebase.
