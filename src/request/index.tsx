import {
  IFetchConfigParams,
  ICheckoutData,
  IAuthHeaders,
  ICheckoutProps,
  IBillingProps,
  IBillingData,
  ICheckoutActionProps,
  ICustomerParams,
  ICustomer,
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

const getCustomerParams = (customer: ICustomer): ICustomerParams => {
  const result = {} as ICustomerParams
  if (customer.id) {
    result.customer = customer.id
  } else if (customer.email) {
    result.customer_email = customer.email
  }

  return result
}

export const prepareCheckoutData = (
  checkout: ICheckoutProps | string,
  props: ICheckoutActionProps
): ICheckoutData => {
  const defaultCancelUrl = window.location.href
  if (typeof checkout === 'string') {
    const result = {
      prices: [checkout],
      cancel_url: defaultCancelUrl,
    } as ICheckoutData

    if (props.success_url) {
      result.success_url = props.success_url
    }
    if (props.cancel_url) {
      result.cancel_url = props.cancel_url
    }
    if (props.return_url) {
      result.return_url = props.return_url
    }

    const customer = getCustomerParams(props.customer)
    for (const key in customer) {
      result[key] = customer[key]
    }

    return result
  } else {
    const result = {
      prices: typeof checkout === 'string' ? [checkout] : checkout.prices,
      cancel_url: window.location.href,
    } as ICheckoutData

    if (props.metadata && props.metadata.id) {
      result.id = props.metadata.id
    }

    const successUrl = checkout.success_url || props.success_url
    if (successUrl) {
      result.success_url = successUrl
    }

    const cancelUrl = checkout.cancel_url || props.cancel_url
    if (cancelUrl) {
      result.cancel_url = cancelUrl
    }

    const returnUrl = checkout.return_url || props.return_url
    if (returnUrl) {
      result.return_url = returnUrl
    }

    const customer = getCustomerParams(checkout.customer || props.customer)
    for (const key in customer) {
      result[key] = customer[key]
    }

    return result
  }
}

export const prepareBillingData = (props: IBillingProps): IBillingData => ({
  customer: props.customer,
  return_url: props.return_url || window.location.href,
})
