# Socket Event Architecture

```mermaid
flowchart LR
	R[Receptionist] -- add-patient --> S[(Socket.IO Server)]
	R -- call-next --> S
	D[Doctor] -- consultation-started --> S
	D -- consultation-ended --> S
	R -- average-time-updated --> S
	S -- queue-updated --> P[Patient Display]
	S -- queue-updated --> T[Track Page]
	S -- consultation-update --> D
	S -- wait-time-recalculated --> P
	S -- token-called --> P
```

Event groups:

- `add-patient`, `call-next`, `average-time-updated` all broadcast `queue-updated`
- `consultation-started` and `consultation-ended` broadcast `consultation-update`
- `average-time-updated` also broadcasts `wait-time-recalculated`