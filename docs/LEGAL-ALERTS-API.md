# Legal Change and Property Alerts API

These endpoints support the idea that Smart Dossier adapts when legal/process requirements change and warns users when a property needs urgent attention.

## Legal Change Impact

```http
GET /legal/updates
```

Returns the synthetic regulatory updates and sources used by the monitor.

```http
GET /legal/change-impact/:dossierId
```

Example:

```http
GET /legal/change-impact/49
```

Response fields:

- `hasImpact`
- `applicableUpdates[]`
- `additionalRequiredDocuments[]`
- `changedFields[]`
- `recommendedAction`
- `alert`

Use this in the frontend to show: "A new requirement applies to this dossier. Request these extra documents before advancing."

## Automatic Dossier Adaptation

Smart Dossier now adapts dossiers automatically after these backend actions:

- `POST /dossiers`
- `PATCH /dossiers/:id`
- `POST /dossiers/:id/documents`

When a legal update applies to the dossier phase, the backend appends the new required documents to `missingFieldsJson` and returns:

- `legalAdaptation.adapted`
- `legalAdaptation.requestedDocuments[]`
- `alerts.legalChangeImpact`
- `alerts.userAlerts[]`

The adaptation is broader than document requests. `alerts.legalChangeImpact.systemAdaptation` also tells the rest of the system how to react:

- `requiresWorkflowChange`
- `riskAdjustment`
- `deadlineAction`
- `processAction`
- `fieldActions[]`
- `documentActions[]`
- `operationalActions[]`

These effects are consumed by:

- `/process/:processType`, which returns legally adapted steps, required documents, critical-point status, legal updates, changed fields, and adjusted expected days.
- `/dashboard/stats`, which returns `legalImpacted`.
- `/dashboard/kanban`, where cards can include `legalChangeImpact`.
- Delay prediction, which raises risk and changes the recommended action when legal changes affect the current phase.
- Procedure generation, which includes the current legal updates in generated steps, documents, timeline, and risks.

Manual adaptation is still available:

```http
POST /legal/adapt-dossier/:dossierId
```

Use this if a scheduled legal monitor detects a new law and needs to re-check an existing dossier.

```http
GET /legal/dossier-alerts/:dossierId
```

Returns legal-change alerts and property alerts in one `userAlerts[]` array.

## Property Alerts

```http
GET /properties/watchlist/rules
```

Returns the synthetic property watchlist and rule-based alert definitions.

```http
GET /properties/:propertyNumber/alerts
```

Example:

```http
GET /properties/P-102%2F44/alerts
```

Response fields:

- `alerts[]`
- `severity`
- `type`
- `title`
- `message`
- `recommendedAction`
- `score`
- `reasons[]`

Use this in the frontend to show demolition, structural-risk, or public-project/expropriation alerts.

## Demo Orchestrator

```http
GET /demo/dossiers/:id/intelligence
```

This now also returns:

- `legalChangeImpact`
- `propertyAlerts`

That means the frontend can show summary, case memory, delay prediction, legal change impact, property alerts, and letter preview from one endpoint.
