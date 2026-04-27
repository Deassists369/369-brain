# API Patterns — DeAssists Portal

# Source of truth for all API calls in cms-next

# Last updated: 27 April 2026

## THE 4-LAYER CHAIN (never skip a layer)

Component → Named Hook → Core Hook → Axios Client → Backend

- Component: imports ONLY named hooks (e.g. useLeadsList)

- Named Hook: lives in libs/react-query/queries/{module}.ts

- Core Hook: useCustomQueryV2 / useCustomMutationV2 / useCustomDelete

- Axios Client: libs/shared/config/axios-client.ts — handles auth automatically

  It calls getCookie internally. Components NEVER handle auth tokens.

## THE REFERENCE TABLE

| What you are building | Copy this file exactly |

|----------------------|------------------------|

| New module with custom controller | libs/react-query/queries/leads.ts |

| Standard CRUD collection | libs/react-query/queries/model.ts |

| Auth-related calls | libs/react-query/queries/account.ts |

Read the reference file before writing a single line.

## HOW TO ADD A NEW MODULE — 5 STEPS IN ORDER

Step 1 — Add to libs/shared/constants/endpoints.enum.ts:

  YOUR_MODULE = '/v1/your-module',

Step 2 — Create libs/react-query/queries/{module}.ts:

  import { useCustomQueryV2, useCustomMutationV2 } from '../src/index';

  import { Endpoints } from '@constants/endpoints.enum';

  const baseUrl = Endpoints.YOUR_MODULE.toString();

  export const useYourList = (params?: any) =>

    useCustomQueryV2(['yourModule', params], baseUrl, { params });

  export const useCreateYour = () =>

    useCustomMutationV2(baseUrl, 'POST');

  export const useUpdateYour = (id: string) =>

    useCustomMutationV2(`${baseUrl}/${id}`, 'PUT');

Step 3 — Export from libs/react-query/queries/indeom './your-module';

Step 4 — In component, import ONLY named hooks:

  import { useYourList, useCreateYour } from '@deassists/react-query/queries/your-module';

Step 5 — Use in component:

  const { data, isLoading } = useYourList({ page: 1 });

## CORE HOOKS — WHEN TO USE WHICH

| Hook | Use for | Data access |

|------|---------|-------------|

| useCustomQueryV2 | GET requests — new code | data directly |

| useCustomQuery | GET requests — legacy code | data?.data?.data |

| useCustomMutationV2 | POST / PUT | { mutate, isLoading } |

| useCustomDelete | DELETE | { mutate, isLoading } |

Prefer useCustomQueryV2 over useCustomQuery for all new code.

## LEADS MODULE — READY TO USE NOW

File: libs/react-query/queries/leads.ts

These hooks already exist. Import and use them directly.

useLeadsList(params)        GET /v1/leads

useLeadDetails(id)          GET /v1/leads/:id

useLeadQueues()             GET /v1/leads/queues

useLeadStats()              GET /v1/leads/stats

useCreateLead()             POST /v1/leads

useUpdateLead(id)           PUT /v1/leads/:id

useAddLeadComment(id)       POST /v1/leads/:id/comments

useLogCall(id)              POST /v1/leads/:id/call-log  ← Phase 2 uses this

## ANTI-PATTERNS — BLOCKED BY PRE-COMMIT GREP

These run before every commit. Any result = fix first.

grep -rn "await fetch(" apps/cms-next/components/ apps/cms-next/pages/

grep -rn "getCookie" apps/cms-next/components/ apps/cms-next/pages/

grep -rn "Authorization.*Bearer" apps/cms-next/components/ apps/cms-next/pages/

Why each is blocked:

- fetch() bypasses axios client — auth fails silently in QA and prod

- getCookie in components — manual auth, breaks when token rotates

- Authorization header manually set — axios client handles this, duplication causes bugs
