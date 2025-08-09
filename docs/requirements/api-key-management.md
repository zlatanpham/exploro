# API Key Management Requirements Document

## Executive Summary

This document outlines the requirements for implementing an API key management system for the Exploro culinary planning application. The feature will enable external systems to programmatically interact with the platform to create and manage culinary data including ingredients, dishes, menus, and tags. A primary focus is preventing ingredient duplication by providing comprehensive listing capabilities before creation operations.

## Business Context and Problem Statement

### Current State

- The application uses session-based authentication via NextAuth.js for web users
- All data access requires user login through the web interface
- No programmatic access for external systems or automation
- Manual data entry leads to potential ingredient duplication
- No integration capability with external recipe management systems

### Business Needs

- Enable external recipe management systems to synchronize data
- Prevent ingredient duplication through pre-creation validation
- Support bulk import of dishes and ingredients from various sources
- Provide multi-tenant API access respecting organization boundaries
- Enable automation of menu planning and ingredient procurement
- Support integration with POS systems and inventory management

### Target Users

- Restaurant chains needing centralized menu management
- Recipe aggregation platforms requiring data synchronization
- Inventory management systems needing ingredient data
- Meal planning services integrating Vietnamese cuisine
- Food delivery platforms accessing menu information
- Nutritional analysis tools requiring ingredient details

## Stakeholder Analysis

### Primary Stakeholders

- **External System Integrators**: Need reliable API access for data synchronization
- **Restaurant Operators**: Require automated menu and inventory management
- **Platform Administrators**: Need to monitor and control API usage
- **Data Quality Team**: Require tools to prevent duplicate and inconsistent data

### Secondary Stakeholders

- **End Users**: Benefit from richer, more accurate culinary data
- **Support Team**: Need tools to troubleshoot integration issues
- **Finance Team**: May need usage data for API monetization
- **Compliance Team**: Ensure data privacy in multi-tenant environment

## Functional Requirements

### FR1: API Key Management

#### FR1.1: API Key Generation

- Users with admin role SHALL be able to generate API keys for their organization
- System SHALL generate cryptographically secure keys (minimum 32 characters)
- Each key SHALL be associated with a specific organization
- Users SHALL provide a descriptive name and purpose for each key
- System SHALL display the key only once upon creation
- Keys SHALL have configurable permissions (read, write, admin)

#### FR1.2: API Key Listing

- Admin users SHALL view all API keys for their organization
- List SHALL display: key name, permissions, creation date, last used, request count
- Key values SHALL be masked (showing only last 4 characters)
- System SHALL support filtering by status and permissions

#### FR1.3: API Key Revocation

- Admin users SHALL be able to revoke API keys immediately
- System SHALL log all revocation events with reason
- Revoked keys SHALL fail authentication with specific error code
- No reactivation of revoked keys SHALL be permitted

#### FR1.4: API Key Rotation

- System SHALL support key rotation without service interruption
- Optional automatic expiration dates (30, 60, 90 days, or custom)
- Email notifications 7 days before expiration
- Grace period allowing both old and new keys during rotation

### FR2: Culinary API Endpoints

#### FR2.1: List Ingredients Endpoint

**Endpoint**: `GET /api/v1/ingredients`

**Purpose**: Prevent duplication by allowing systems to check existing ingredients

**Functionality**:

- Return all ingredients visible to the organization
- Support search by Vietnamese and English names
- Filter by category (vegetables, meat, spices, etc.)
- Include seasonal availability information
- Support pagination for large datasets

**Query Parameters**:

- `search` (optional): Search in name_vi and name_en
- `category` (optional): Filter by ingredient category
- `seasonal` (optional): Filter seasonal ingredients
- `limit` (optional, default: 50, max: 200)
- `offset` (optional): For pagination

**Response Format**:

```json
{
  "ingredients": [
    {
      "id": "string",
      "name_vi": "string",
      "name_en": "string",
      "category": "string",
      "default_unit": "string",
      "current_price": "number",
      "price_updated_at": "ISO8601",
      "seasonal_flag": "boolean"
    }
  ],
  "total": "number",
  "limit": "number",
  "offset": "number"
}
```

#### FR2.2: Create Ingredient Endpoint

**Endpoint**: `POST /api/v1/ingredients`

**Functionality**:

- Create new ingredient if no duplicate exists
- Automatic duplicate detection based on name_vi
- Support batch creation (up to 50 ingredients)
- Record initial price in price history
- Validate required fields and data types

**Request Format**:

```json
{
  "ingredient": {
    "name_vi": "string (required)",
    "name_en": "string (optional)",
    "category": "string (required)",
    "default_unit": "string (required)",
    "current_price": "number (required)",
    "seasonal_flag": "boolean (optional)"
  }
}
```

**Duplicate Prevention**:

- Check exact match on name_vi (case-insensitive)
- Return existing ingredient if duplicate found
- Include `duplicate_found` flag in response

#### FR2.3: Update Ingredient Endpoint

**Endpoint**: `PUT /api/v1/ingredients/{id}`

**Functionality**:

- Update existing ingredient properties
- Track price changes in history
- Validate unit consistency with existing dishes
- Prevent name changes that create duplicates

#### FR2.4: List Dishes Endpoint

**Endpoint**: `GET /api/v1/dishes`

**Functionality**:

- Return dishes based on filters
- Include ingredient details for duplication checks
- Support multiple filter combinations
- Calculate total cost based on current prices

**Query Parameters**:

- `status` (optional): active, inactive, all
- `difficulty` (optional): easy, medium, hard
- `max_cook_time` (optional): Maximum cooking time in minutes
- `tags` (optional): Array of tag IDs
- `search` (optional): Search in names and descriptions
- `include_ingredients` (optional): Include full ingredient list

#### FR2.5: Create Dish Endpoint

**Endpoint**: `POST /api/v1/dishes`

**Functionality**:

- Create dish with ingredient associations
- Validate all ingredient IDs exist
- Support tag associations
- Calculate initial cost estimate
- Validate cooking times and servings

**Request Format**:

```json
{
  "dish": {
    "name_vi": "string (required)",
    "name_en": "string (optional)",
    "description_vi": "string (required)",
    "description_en": "string (optional)",
    "instructions_vi": "string (required)",
    "instructions_en": "string (optional)",
    "difficulty": "easy|medium|hard",
    "cook_time": "number (minutes)",
    "prep_time": "number (minutes)",
    "servings": "number",
    "image_url": "string (optional)",
    "source_url": "string (optional)"
  },
  "ingredients": [
    {
      "ingredient_id": "string",
      "quantity": "number",
      "unit": "string",
      "optional": "boolean",
      "notes": "string (optional)"
    }
  ],
  "tags": ["string"] (optional tag IDs)
}
```

#### FR2.6: Update Dish Endpoint

**Endpoint**: `PUT /api/v1/dishes/{id}`

**Functionality**:

- Update dish properties and associations
- Support partial updates
- Recalculate costs if ingredients change
- Maintain historical ingredient associations

#### FR2.7: List Menus Endpoint

**Endpoint**: `GET /api/v1/menus`

**Functionality**:

- Return menus for the organization
- Filter by date range and visibility
- Include dish details and costs
- Support menu sharing status

#### FR2.8: List Tags Endpoint

**Endpoint**: `GET /api/v1/tags`

**Functionality**:

- Return all available tags
- Filter by category (meal_type, cuisine, dietary)
- Support tag creation if not exists
- Include usage statistics

### FR3: Organization Context

#### FR3.1: Organization Scoping

- All API operations SHALL be scoped to the key's organization
- Cross-organization access SHALL be prevented
- Shared/public resources SHALL be explicitly marked
- Organization ID SHALL be automatically determined from API key

#### FR3.2: Multi-tenant Data Isolation

- Ingredients MAY be shared across organizations (future feature)
- Dishes and menus SHALL be organization-specific
- Tags SHALL be globally available
- Price history SHALL be organization-specific

## Non-Functional Requirements

### NFR1: Security Requirements

#### NFR1.1: Key Storage

- API keys SHALL be hashed using bcrypt (cost factor 12)
- Raw keys SHALL never be stored or logged
- Key hash SHALL be indexed for performance
- Database SHALL encrypt API key table at rest

#### NFR1.2: Authentication

- Bearer token authentication in Authorization header
- Constant-time comparison for key validation
- Failed authentication SHALL not reveal key existence
- Support for multiple authentication methods per endpoint

#### NFR1.3: Data Privacy

- API SHALL not expose data from other organizations
- Personal user information SHALL be excluded from responses
- Audit logs SHALL record access patterns
- GDPR compliance for data retention

### NFR2: Performance Requirements

#### NFR2.1: Response Times

- List endpoints: < 500ms for 95th percentile
- Create/update endpoints: < 1 second for 95th percentile
- Batch operations: < 5 seconds for 50 items
- Search operations: < 1 second with indexing

#### NFR2.2: Scalability

- Support 10,000+ ingredients per organization
- Handle 1,000 requests/minute across all endpoints
- Batch operations up to 50 items per request
- Concurrent request handling without data conflicts

### NFR3: Reliability Requirements

#### NFR3.1: Availability

- API SHALL maintain 99.5% uptime
- Graceful degradation for database issues
- Circuit breakers for external dependencies
- Health check endpoint for monitoring

#### NFR3.2: Data Consistency

- Ingredient creation SHALL be atomic
- Duplicate prevention SHALL be transactional
- Price history SHALL be append-only
- No partial dish creation on failure

### NFR4: Usability Requirements

#### NFR4.1: Documentation

- OpenAPI 3.0 specification
- Interactive API documentation (Swagger UI)
- Code examples in Python, JavaScript, cURL
- Integration guides for common use cases

#### NFR4.2: Error Handling

- Consistent error response format
- Specific error codes for common issues
- Helpful error messages with resolution hints
- Validation errors with field-level details

## Rate Limiting and Usage Tracking

### Rate Limits

- Standard tier: 1,000 requests/hour per API key
- Bulk operations: 100 requests/hour
- Search operations: 500 requests/hour
- Configurable limits per organization

### Usage Tracking

- Request count by endpoint and API key
- Response time percentiles
- Error rates and types
- Data volume metrics (items created/updated)

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1234567890
X-RateLimit-Resource: standard
```

## Data Models

### API Key Model

```prisma
model ApiKey {
  id              String    @id @default(cuid())
  organization_id String    @db.Uuid
  name            String    @db.VarChar(255)
  key_hash        String    @unique
  permissions     String[]  // ['read', 'write', 'admin']
  last_used_at    DateTime?
  expires_at      DateTime?
  is_active       Boolean   @default(true)
  created_by      String
  created_at      DateTime  @default(now())
  revoked_at      DateTime?
  revoked_by      String?
  revoke_reason   String?

  organization    Organization @relation(fields: [organization_id], references: [id])
  user            User         @relation(fields: [created_by], references: [id])
  usage_logs      ApiUsageLog[]

  @@index([organization_id])
  @@index([key_hash])
  @@index([expires_at])
}
```

### API Usage Log Model

```prisma
model ApiUsageLog {
  id              String    @id @default(cuid())
  api_key_id      String
  endpoint        String    @db.VarChar(255)
  method          String    @db.VarChar(10)
  status_code     Int
  response_time   Int       // milliseconds
  request_body    Json?     // for debugging failed requests
  error_message   String?
  ip_address      String?   @db.VarChar(45)
  user_agent      String?   @db.Text
  created_at      DateTime  @default(now())

  api_key         ApiKey    @relation(fields: [api_key_id], references: [id], onDelete: Cascade)

  @@index([api_key_id, created_at])
  @@index([endpoint, created_at])
  @@index([status_code, created_at])
}
```

## Error Response Format

### Standard Error Structure

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context",
      "suggestion": "How to resolve"
    },
    "request_id": "unique-request-id"
  }
}
```

### Error Codes

- `INVALID_API_KEY`: API key invalid or expired
- `PERMISSION_DENIED`: Insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `DUPLICATE_INGREDIENT`: Ingredient already exists
- `INGREDIENT_NOT_FOUND`: Referenced ingredient not found
- `VALIDATION_ERROR`: Request validation failed
- `ORGANIZATION_MISMATCH`: Resource belongs to different organization

## Integration Patterns

### Ingredient Deduplication Flow

1. Search existing ingredients by name
2. Compare with fuzzy matching for variations
3. Present potential matches to external system
4. Create only if no suitable match exists
5. Return existing ingredient ID if match confirmed

### Bulk Import Pattern

1. Validate all items in batch
2. Check for duplicates within batch
3. Check for duplicates in database
4. Create all items in transaction
5. Return success/failure for each item

### Menu Synchronization

1. Fetch existing menus for date range
2. Compare with external menu data
3. Update changed items only
4. Maintain audit trail of changes
5. Notify of conflicts requiring resolution

## Success Metrics

### Adoption Metrics

- Number of active API integrations
- Volume of data created via API vs web interface
- Reduction in duplicate ingredients
- Time saved in data entry

### Quality Metrics

- Duplicate prevention success rate
- Data validation error rates
- API error rates by endpoint
- Average response times

### Business Metrics

- Increase in dish database size
- Improvement in ingredient price accuracy
- Menu planning efficiency gains
- Partner satisfaction scores

## Implementation Considerations

### Phase 1: Foundation (Weeks 1-4)

1. API key generation and management UI
2. Authentication middleware
3. Ingredient list and create endpoints
4. Basic rate limiting
5. Usage logging

### Phase 2: Core Features (Weeks 5-8)

1. Remaining CRUD endpoints
2. Duplicate prevention logic
3. Batch operations
4. Comprehensive error handling
5. API documentation

### Phase 3: Enhancement (Weeks 9-12)

1. Advanced search capabilities
2. Fuzzy matching for duplicates
3. Usage analytics dashboard
4. Performance optimization
5. Integration examples

## Security Considerations

### Threat Model

- API key theft through insecure storage
- Data exfiltration through list endpoints
- Denial of service through batch operations
- Cross-organization data leakage

### Mitigation Strategies

- Mandatory HTTPS for all API calls
- IP allowlisting option per API key
- Request signing for sensitive operations
- Anomaly detection for usage patterns
- Regular security audits

## Testing Requirements

### Unit Tests

- API key generation and validation
- Permission checking logic
- Duplicate detection algorithms
- Data transformation logic

### Integration Tests

- End-to-end API workflows
- Multi-organization isolation
- Rate limiting behavior
- Error scenarios

### Performance Tests

- Load testing for concurrent requests
- Batch operation limits
- Database query optimization
- Cache effectiveness

## Assumptions and Constraints

### Assumptions

- External systems can handle pagination
- API users understand REST principles
- Organizations have unique ingredient naming
- Price updates are not high-frequency

### Constraints

- Must maintain backward compatibility
- Cannot modify existing tRPC endpoints
- Must respect existing permission model
- Performance impact on web interface minimal

## Dependencies

### Technical Dependencies

- NextAuth.js for user authentication
- tRPC for internal API structure
- PostgreSQL with Prisma ORM
- Redis for rate limiting (optional)
- OpenAPI tooling for documentation

### External Dependencies

- Email service for notifications
- Monitoring service for API metrics
- CDN for API documentation hosting

## Risks and Mitigation

### Risk 1: Ingredient Name Conflicts

- **Impact**: Duplicate ingredients despite prevention
- **Mitigation**: Fuzzy matching, manual review queue, merge capability

### Risk 2: API Abuse

- **Impact**: System overload, data quality issues
- **Mitigation**: Strict rate limits, anomaly detection, API key quotas

### Risk 3: Integration Complexity

- **Impact**: Low adoption due to difficulty
- **Mitigation**: Comprehensive docs, SDKs, support channel

## Future Enhancements

1. **GraphQL API**: Flexible querying for complex data needs
2. **Webhook Events**: Real-time notifications for data changes
3. **AI-Powered Matching**: Smart ingredient deduplication
4. **Nutrition API**: Automated nutritional analysis
5. **Image Recognition**: Dish recognition from photos
6. **Multi-language Support**: Extended language options
7. **Marketplace**: Ingredient supplier integration

## Approval and Sign-off

This requirements document requires approval from:

- Product Owner
- Technical Lead
- Security Officer
- Operations Manager

---

Document Version: 1.0  
Date: 2025-08-09  
Author: Business Analyst  
Status: Draft
