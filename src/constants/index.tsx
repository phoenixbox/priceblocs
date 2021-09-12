const API_ROOT =
  process.env.NODE_ENV === 'production'
    ? 'https://api.priceblocs.com'
    : 'http://localhost:9000'

export const URLS = {
  PRICING: `${API_ROOT}/v1/config/pricing`,
  CHECKOUT: `${API_ROOT}/v1/config/checkout`,
}

const POST = 'POST'
const GET = 'GET'

export const METHODS = {
  POST,
  GET,
}
