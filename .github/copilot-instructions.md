# Copilot Instructions for Subscription Service

## Architecture Overview

This is a **NestJS-based subscription management backend** for a mobile app with integrated payment processing (YooKassa), QR code verification, and 1C ERP synchronization.

### Core Service Boundaries

- **Auth**: JWT-based authentication with phone/email verification via OTP (SMS/Email). Uses `bcrypt` for password hashing
- **Users**: User management with gender enum, reset tokens, and one-to-many relations to subscriptions
- **Subscriptions**: Time-based subscriptions with `SubscriptionPlan` entities. Links to payments via `paymentId` field
- **Payments**: YooKassa payment gateway integration with webhook handling. Statuses: `pending`, `succeeded`, `canceled`
- **QR**: Generates QR codes from subscription data, tracks usage via `CheckUsage` entity
- **1C Integration**: External ERP sync via HTTP API (user creation, QR validation)
- **Schedule**: Placeholder module (stub implementation)
- **Notifications/Mail/SMS**: Communication channels for verification codes and alerts

### Critical Data Flow

1. **Registration**: User submits phone/email → `VerificationService.createVerification()` generates 6-digit code → Code sent via `MailService`/`SmsService` → User verifies with `verifyCode()` → Creates user with hashed password
2. **Payment**: Create payment via `YooKassaService.createPayment()` → Store in `Payment` entity with `confirmationUrl` → User completes payment → Webhook calls `PaymentService.handleWebhook()` → Updates payment status → Activates subscription if status is `succeeded`
3. **QR Generation**: Subscription → `QrService.generateQr()` embeds `{subId, userId}` as JSON → Returns base64 image

## Development Workflow

### Essential Commands

```bash
# Start development server with hot reload
npm run start:dev

# Start Docker Postgres (required before running app)
docker-compose up -d

# Watch entity changes (does NOT auto-generate migrations)
npm run watch:entities

# Generate migration after entity changes
npm run migration:generate -- ./src/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Run tests
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
```

### Database Setup

- PostgreSQL via Docker Compose (credentials: `postgres/postgres`, DB: `subscription_app`)
- TypeORM with `synchronize: true` (⚠️ **MIGRATIONS SHOULD BE USED** per comment in `app.module.ts`)
- Entities auto-discovered via glob pattern: `src/**/*.entity.{ts,js}`
- Connection config in `src/config/typeorm.config.ts` using `AppDataSource`

### Environment Variables (Required)

```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=subscription_db
JWT_SECRET=dev_jwt
YOOKASSA_SHOP_ID=<your_shop_id>
YOOKASSA_SECRET_KEY=<your_secret>
APP_URL=http://localhost:3000
API_URL=http://localhost:3000
ONE_C_API_URL=<optional>
ONE_C_API_KEY=<optional>
```

## Project-Specific Conventions

### Entity Patterns

- All entities use **UUID primary keys** (`@PrimaryGeneratedColumn('uuid')`)
- Timestamps: `@CreateDateColumn()` and `@UpdateDateColumn()` standard on all entities
- Relations use `onDelete: 'CASCADE'` or `'SET NULL'` appropriately (e.g., `User.subscriptions`)
- **Commented-out code in entities**: Previous versions preserved as comments (see `subscription.entity.ts`, `payment.entity.ts`)

### DTO Validation

- Uses `class-validator` decorators: `@IsString()`, `@IsEmail()`, `@MinLength()`, `@IsIn()`, `@IsBoolean()`
- Global validation pipe in `main.ts`: `new ValidationPipe({ whitelist: true })`
- No Swagger decorators currently used (no `@ApiProperty` found in codebase)

### Service Injection Patterns

- Repository injection: `@InjectRepository(Entity) private repo: Repository<Entity>`
- Config values: `ConfigService.get('KEY')` or direct `process.env.KEY` (inconsistent)
- HTTP calls: `HttpService` from `@nestjs/axios` with `firstValueFrom(this.http.post(...))`

### Authentication Flow

- JWT Strategy extracts `{ sub: userId, phone }` from bearer token
- Guards: `JwtAuthGuard` extends `AuthGuard('jwt')`
- Password comparison: `bcrypt.compare(plaintext, hash)`
- Token generation: `jwtService.sign({ sub, phone })`

### YooKassa Integration Specifics

- **Idempotence keys**: Every payment uses `uuidv4()` to prevent duplicate charges
- **Webhook handling**: Matches `yookassaPaymentId` in `Payment` table, updates status, activates subscription on `succeeded`
- **Receipt requirement**: Hardcoded `customer.email` and VAT code (20%) in `createPayment()`
- **Auto-capture**: `capture: true` for immediate payment processing

### Known Issues & TODOs

- ⚠️ `synchronize: true` in production (should use migrations)
- ⚠️ `SubscriptionsService.getUserSubscriptions()` queries by subscription ID instead of user ID (bug)
- ⚠️ `VerificationService.createVerification()` returns `code` in response (dev-only, remove in production)
- Schedule module has stub implementations only
- CORS set to `origin: '*'` (tighten for production)

## Testing & API Exploration

- **Swagger UI**: `http://localhost:3000/api` (configured in `main.ts`)
- **No spec files found** for most services (only `app.controller.spec.ts`, `payments.service.spec.ts` exist)
- Test config: Jest with `ts-jest` transformer, coverage in `./coverage` directory

## Integration Points

- **1C ERP**: Optional HTTP API for user sync (`/users/sync`) and QR validation (`/qr/validate`) with `x-api-key` header
- **YooKassa**: Payment webhooks expected at `{API_URL}/webhooks/yookassa`
- **Twilio**: SMS service configured but implementation details not visible
- **Nodemailer**: Email service for verification codes

## File Organization

- **Controllers**: Thin layers, delegate to services
- **Services**: Business logic, repository operations
- **DTOs**: `dto/` folders in each module (create, update, verify patterns)
- **Entities**: `entities/` folders, TypeORM decorators
- **Config**: Centralized in `src/config/` (TypeORM, YooKassa)

## When Adding Features

1. Generate module: `nest g module feature-name`
2. Create entity with UUID PK and timestamps
3. Add repository injection in service
4. Use `class-validator` for DTOs
5. Register module in `app.module.ts` imports
6. Consider entity watch → migration generation flow
