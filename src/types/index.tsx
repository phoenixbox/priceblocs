import { Stripe } from '@stripe/stripe-js'

export interface IFetchConfigParams {
  prices?: string[]
  customer?: string
  email?: string
}

export interface ICheckoutProps {
  prices: [string]
}

export interface IMetadata {
  id: string
}

export interface ICheckoutData {
  prices: [string]
  cancel_url: string
  id?: string
  session?: string
}

export interface IPriceBlocsContextProps {
  children: React.ReactNode
  apiKey: string
  prices?: string[]
  customer?: string
  email?: string
}

export interface IAdmin {
  clientKey: string
}

export interface IValues {
  admin: IAdmin
}

export interface IErrors {
  config: Error
}

export interface IPriceBlocsProviderValue {
  ready: boolean
  loading: boolean
  isSubmitting: boolean
  values?: IValues
  metadata?: IMetadata | null
  errors?: IErrors
  setValues: (values: IValues) => void
  refetch: () => void
  checkout: ({ prices }: ICheckoutProps, stripe: Stripe | null) => void
}

export interface IPriceBlocsProvider extends React.FC {
  value?: IPriceBlocsProviderValue
  children?: React.ReactNode
}

export interface IStripeElementContextProps {
  setReady: (ready: boolean) => void
  ready: boolean
  clientKey: string
  children: React.ReactNode
  providerValue: IPriceBlocsProviderValue
  Provider: IPriceBlocsProvider
}

export interface IWithStripeContextProps {
  setReady: (ready: boolean) => void
  ready: boolean
  children: React.ReactNode
  providerValue: IPriceBlocsProviderValue
  Provider: IPriceBlocsProvider
}

export interface IAuthHeaders {
  [key: string]: string
}
