import {
  IFetchConfigParams,
  ICheckoutData,
  IAuthHeaders,
  ICheckoutProps,
  IBillingProps,
  IBillingData,
} from '../types'
import { URLS, METHODS } from '../constants'

const getAuthHeaders = (apiKey: string): IAuthHeaders => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${apiKey}`,
})
export const fetchConfig = async (
  apiKey: string,
  params: IFetchConfigParams
) => {
  let queryParams = [] as string[]
  for (const key in params) {
    const value = params[key]
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((val) => {
          queryParams.push(`${key}[]=${val}`)
        })
      } else {
        queryParams.push(`${key}=${value}`)
      }
    }
  }
  const queryString = queryParams.join('&')
  const url = queryString ? `${URLS.PRICING}?${queryString}` : URLS.PRICING

  const response = await fetch(url, {
    method: METHODS.GET,
    headers: getAuthHeaders(apiKey),
  })

  return response.json()
}

export const createSession = async (apiKey: string, data: ICheckoutData) => {
  const response = await fetch(URLS.CHECKOUT, {
    method: METHODS.POST,
    headers: getAuthHeaders(apiKey),
    body: JSON.stringify(data),
  })

  return response.json()
}

export const createBilling = async (apiKey: string, data: IBillingData) => {
  const response = await fetch(URLS.BILLING, {
    method: METHODS.POST,
    headers: getAuthHeaders(apiKey),
    body: JSON.stringify(data),
  })

  return response.json()
}

export const prepareCheckoutData = (props: ICheckoutProps): ICheckoutData => {
  const result = {
    prices: props.prices,
  } as ICheckoutData

  if (props.metadata && props.metadata.id) {
    result.id = props.metadata.id
  }
  if (props.success_url) {
    result.success_url = props.success_url
  }
  if (props.cancel_url) {
    result.cancel_url = props.cancel_url
  } else {
    result.cancel_url = window.location.href
  }
  if (props.return_url) {
    result.return_url = props.return_url
  }

  if (props.customer) {
    if (props.customer.id) {
      result.customer = props.customer.id
    } else if (props.customer.email) {
      result.customer_email = props.customer.email
    }
  }

  return result
}

export const prepareBillingData = (props: IBillingProps): IBillingData => {
  const result = {
    return_url: props.return_url || window.location.href,
  } as IBillingData

  if (props.customer) {
    result.customer = props.customer
  } else if (props.email) {
    result.email = props.email
  } else if (props.customer_email) {
    result.customer_email = props.customer_email
  }

  return result
}
