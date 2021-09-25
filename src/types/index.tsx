import * as React from 'react'
import { Stripe } from '@stripe/stripe-js'

export interface ICustomerParams {
  customer?: string
  customer_email?: string
  email?: string
}

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

type IMinCustomerParams = RequireAtLeastOne<
  ICustomerParams,
  'customer' | 'customer_email' | 'email'
>

export interface IFetchConfigParams extends ICustomerParams {
  [key: string]: string | string[]
  prices?: string[]
  id?: string
  session?: string
}

export interface ICheckoutActionProps extends ICustomerParams {
  api_key: string
  success_url?: string
  cancel_url?: string
  return_url?: string
  metadata: IMetadata
  isSubmitting: boolean
  setIsSubmitting: (isSubmiting: boolean) => void
  setError: (error: IPriceBlocsError | IError) => void
}

export interface ICheckoutProps {
  prices: [string]
}

export interface IBillingActionProps extends ICustomerParams {
  api_key: string
  return_url?: string
  isSubmitting: boolean
  setIsSubmitting: (isSubmiting: boolean) => void
  setError: (error: IPriceBlocsError | IError) => void
}

export interface IBillingProps extends ICustomerParams {
  return_url?: string
}

export type IBillingData = {
  return_url: string
} & IMinCustomerParams

export interface IMetadata {
  id: string
}

export interface ICheckoutData extends ICustomerParams {
  prices: [string]
  cancel_url: string
  success_url?: string
  return_url?: string
  id?: string
  session?: string
}

export interface ICheckoutProps extends ICheckoutData {
  metadata: IMetadata
}

export interface IPriceBlocsContextProps extends ICustomerParams {
  children: React.ReactNode | ((props: IPriceBlocsProviderValue) => any)
  api_key: string
  prices?: string[]
  success_url?: string
  cancel_url?: string
  return_url?: string
}

export interface IAdmin {
  clientKey: string
}

export interface IRecurring {
  interval: string
}

export interface IPrice {
  id: string
  currency: string
  recurring: IRecurring | null
}

export interface IProduct {
  id: string
  name: string
  description?: string
  prices?: IPrice[]
}

export interface IHighlight {
  price?: string
  product?: string
  label?: string
  style?: string
}

export interface IPresentation {
  interval?: string
  license?: string
}

export interface IColors {
  primary?: string
}

export interface ITheme {
  colors?: IColors
  license?: string
}

export interface IFormData {
  currencies: string[]
  currency: string
  intervals: string[]
  interval: string
  highlight: IHighlight
  theme: ITheme
  presentation: IPresentation
}

export interface IValues {
  admin: IAdmin
  form: IFormData
  products: IProduct[]
}

export interface IPriceBlocsError {
  statusCode: number
  error: string
  message: string
  type: string
  headers: {
    [key: string]: string
  }
  payload: {
    [key: string]: any
  }
  url: string
  method: string
  param: string
  docs: string
  chat: string
}

export interface IError {
  statusCode?: number
  message: string
}

export interface IPriceBlocsProviderValue {
  ready: boolean
  loading: boolean
  isSubmitting: boolean
  values?: IValues
  metadata?: IMetadata | null
  error?: IPriceBlocsError | IError
  setValues: (values: IValues) => void
  setFieldValue: (path: string, value: any) => any
  refetch: () => void
  checkout: ({ prices }: ICheckoutProps, stripe: Stripe | null) => void
  billing: (
    { customer, return_url }: IBillingProps,
    stripe: Stripe | null
  ) => void
}

export interface IPriceBlocsContext {
  Context: React.Context<null>
  ContextProvider: IPriceBlocsProvider | React.Provider<null>
  ContextConsumer: React.Consumer<null>
  useContext: () => IPriceBlocsProviderValue
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

export interface IProductConfig {
  [key: string]: {
    enabled: boolean
  } | null
}

export interface IFeature {
  title: string
  tooltip: string | null
  product_config: IProductConfig
}

export interface IFeatureGroup {
  title: string
  features: IFeature[]
}

export interface IFeatureTableHeader {
  id: string
  title: string
}

export interface IFeatureTableGroupColumn {
  header: string
  accessor?: string
}

export interface IFeatureTableGroupRowTitle {
  value: string
  tooltip: string
}

export interface IFeatureTableGroupRow {
  [key: string]: IProductConfig | null | IFeatureTableGroupRowTitle | boolean
}

export interface IFeatureTableGroup {
  columns: IFeatureTableGroupColumn[]
  rows: IFeatureTableGroupRow[]
}

export interface IProductsFeatureTable {
  header: IFeatureTableHeader[]
  groups: IFeatureTableGroup[]
}
