# Shipment API

Start JSON Server:

```bash
npm run dev
```

The dev lifecycle generates `shipments.json` when it does not exist.

The API is available at `http://localhost:3001`.

## Routes

```http
GET    /shipments?_page=1&_per_page=25
GET    /shipments/:id
PUT    /shipments/:id
POST   /shipments
DELETE /shipments/:id
GET    /statuses
```

JSON Server persists `POST`, `PUT`, and `DELETE` changes directly to
`shipments.json`. Run `npm run generate` to reset it with 100 generated
shipments.
