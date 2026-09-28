# Red Sea Connect

Vite + React client for Red Sea Connect. Authentication and data access use Firebase Auth and Cloud Firestore.

## Run locally

1. Copy `.env.example` to `.env.local` and populate the Firebase web configuration.
2. In Firebase Authentication, enable Email/Password and Google (if desired), then add `localhost` and deployed domains to **Authorized domains**.
3. Configure the Google provider's authorized redirect domains in Firebase. The popup flow uses `authDomain`; no client secret belongs in this repository.
4. Run `npm install`, then `npm run dev`.

Run `npm run lint` for TypeScript validation and `npm run build` for a production bundle.

## Access control

The browser reads the Firebase custom claim `role`. Valid values are `CUSTOMER`, `PROVIDER`, `ADMIN`, `OPS_ADMIN`, `FINANCE_ADMIN`, and `SUPER_ADMIN`. Assign elevated roles only from a trusted server or Firebase Admin SDK. After changing a claim, refresh the user's ID token by signing out and in or calling `getIdToken(true)`.

Deploy `firestore.rules` before launch. The rules enforce the custom-claim model independently, so changing a profile document in the browser cannot grant elevated access. Populate catalogs and production data through a trusted administrative deployment process, never from the client.

## Secrets

Only `VITE_*` Firebase web configuration belongs in this client. Service-account credentials, OAuth client secrets, Firebase Admin configuration, and all AI/provider keys must stay in the server or function host's secret manager.
