# SDG Conversational Chatbot POC

This version keeps the existing chatbot shell and implements the step-driven conversational workflow described in the Streamlit screenshots.

## Flow

Login -> Business requirement -> Dummy vector search -> Clickable scenario cards -> Selected scenario -> Process steps -> Current step -> Dynamic input only when required -> Continue through steps -> Sample-data-ready completion.

## Local run

1. `npm install`
2. Copy `.env.example` to `.env`
3. Keep `VITE_USE_MOCK_API=true` for the dummy scenario search. Login uses the FastAPI `/login` API by default (`VITE_USE_MOCK_AUTH=false`).
4. `npm run dev`

Demo login defaults:
- Username: `testuser`
- Password: `Test@123`

## FastAPI login

Login is wired through `src/api/authApi.js` and `src/api/axiosClient.js`. By default (`VITE_USE_MOCK_AUTH=false`) the frontend calls `POST /login` on `VITE_API_BASE_URL` with query parameters `user_id` and `password`.

Example request:
`POST http://localhost:8000/login?user_id=<username>&password=<password>`

`axiosClient.js` also adds `X-API-Key` when `VITE_API_KEY` is configured. If the login API returns `access_token` or `token`, it is saved in `sessionStorage` and automatically sent as `Authorization: Bearer <token>` on subsequent API calls.

## Real scenario API

Set `VITE_USE_MOCK_API=false` and configure `VITE_SCENARIO_API_URL`. The service currently posts `{ query }` to that endpoint. Adjust only `src/services/scenarioMappingService/scenarioMappingService.js` when the final request/response contract is confirmed.

## Mock data

`src/mock/scenarioResponse/scenarioResponse.js` contains three matching scenarios and the detailed Donations workflow from the supplied screenshots, including input requirements for Create Donation sales order, Validate sales order in OTR, and Review exceptions in Resolution Cockpit.
