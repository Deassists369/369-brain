# PRE-BUILD CHECKLIST (MANDATORY)
# Complete EVERY item before writing ANY new code. No exceptions.
# Created: 27 Apr 2026 after CRM Phase 1 QA failure

## Before writing ANY new component or feature:

### 1. FIND THE REFERENCE
- [ ] Identified the closest existing working feature to what I'm building
- [ ] File path of reference: _______________

### 2. TRACE THE REFERENCE (end-to-end)
- [ ] Component file: where does data fetching happen?
- [ ] Query file: which file in libs/react-query/queries/ defines the hooks?
- [ ] Hook used: useCustomQuery / useCustomQueryV2 / useCustomMutationV2?
- [ ] Endpoint: where is the endpoint defined in endpoints.enum.ts?
- [ ] Auth: confirmed hooks go through axios client (no manual getCookie)
- [ ] Environment: confirmed base URL resolves correctly for local/QA/prod

### 3. CREATE BEFORE YOU CODE
- [ ] Created libs/react-query/queries/{module}.ts with named hooks
- [ ] Added endpoint to endpoints.enum.ts
- [ ] Exported from queries/index.ts
- [ ] Verified import path works: @deassists/react-query/queries/{module}

### 4. FIRST FILE REVIEW
- [ ] Built ONE component first
- [ ] Showed to Latha for pattern confirmation
- [ ] Got approval before building remaining components

### 5. BEFORE COMMIT
- [ ] npm run build:all passes
- [ ] No raw fetch() anywhere (grep verified)
- [ ] No getCookie in components (grep verified)
- [ ] No inline useCustomQuery with raw URLs (grep verified)
- [ ] No hardcoded values that should be enums or backend data
- [ ] Tested on QA URL, not just localhost

## Reference files for pattern matching:
- Auth module: libs/react-query/queries/account.ts
- Generic CRUD: libs/react-query/queries/model.ts
- Custom controller: libs/react-query/queries/leads.ts
- Endpoints: libs/shared/constants/endpoints.enum.ts
- Axios client: libs/shared/config/axios-client.ts
