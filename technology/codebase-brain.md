# DeAssists — Codebase Brain
# Owner: Shon AJ | Brain: VEERABHADRA
# Updated: 2026-05-04

## MONOREPO STRUCTURE
Root: ~/deassists
apps/backend-nest/     NestJS API — port 8000
apps/cms-next/         Staff portal — port 4002
apps/website-next/     Public site — port 4001
libs/shared/           Shared enums, constants, helpers

## FILE INVENTORY (84 key files)

### backend-nest (84 files)
- app.controller.ts
- app.module.ts
- app.service.ts
- application.entity.ts
- base.entity.ts
- chargeable.entity.ts
- payment.entity.ts
- service-base.entity.ts
- user-document.entity.ts
- auth.guard.ts
- context.user.guard.ts
- organization.guard.ts
- roles.guard.ts
- scope.guard.ts
- lead.entity.ts
- lead-id.service.ts
- leads-routing.service.ts
- leads.controller.ts
- leads.module.ts
- leads.service.ts
- auth.middleware.ts
- accounts.controller.ts
- accounts.module.ts
- accounts.service.ts
- create-admin.dto.ts
- create-org-user.dto.ts
- create-user.dto.ts
- applications.controller.ts
- applications.module.ts
- applications.service.ts
- create-application.dto.ts
- create-course-application.dto.ts
- auth.controller.ts
- auth.module.ts
- auth.service.ts
- common.module.ts
- courses.controller.ts
- courses.module.ts
- courses.service.ts
- create-course.dto.ts
- dataservices.module.ts
- dashboard.controller.ts
- create-university.dto.ts
- model.controller.ts
- model.module.ts
- model.service.ts
- user.controller.ts
- metatags.controller.ts
- metatags.module.ts
- metatags.service.ts
- mongo.module.ts
- mongo.service.ts
- notification.controller.ts
- notification.module.ts
- notification.service.ts
- rent-reminder.module.ts
- rent-reminder.service.ts
- org.module.ts
- org.service.ts
- organization.controller.ts
- partners.controller.ts
- partners.module.ts
- partners.service.ts
- create-pendingfee.dto.ts
- pendingfee.controller.ts
- pendingfee.module.ts
- pendingfee.service.ts
- referral-cleanup.service.ts
- referral.module.ts
- create-review.dto.ts
- reviews.controller.ts
- reviews.module.ts
- reviews.service.ts
- service.controller.ts
- service.module.ts
- service.service.ts
- payment.service.ts
- stripe.controller.ts
- stripe.module.ts
- stripe.service.ts
- create-university.dto.ts
- university.controller.ts
- university.module.ts
- university.service.ts

## CRITICAL PATTERNS
- Entity files: .entity.ts (NEVER .schema.ts)
- @Prop from ../../types/mongoose.types
- NestJS modules: each feature has module/controller/service/entity
