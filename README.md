# PriceBlocs [beta]

PriceBlocs makes it easy for developers to add in payments and billing management to their products through a set of context hooks and components.

- [Getting Started](#getting-started)
- [Workflow](#workflow)
- [API](#api)

## Getting started

- API Keys - Sign up for [PriceBlocs](https://priceblocs.com) and get your publishable API keys.
- Test mode - Enable test mode from within the app to use test Stripe resources for local development.
- [Install](#install) - Add `priceblocs` to your project

Our first set of components and hooks are compatible with React, examples of which you can see below.

### Install

- PriceBlocs is available via npm

```
npm i --save priceblocs
```

## Workflow

There are 3 steps to adding prices and checkout to your app:

- [Setup](#setup)
  - Wrap any part of your app with an authenticated PriceBlocs HOC
  - Pass an `api_key` and a set of `prices
    - Additional checkout and customer [configuration options](#props) can also be passed
- [Present](#present)
  - Access your fetched data via context hooks and use it to present purchase options to your customers
- [Checkout](#checkout)
  - Attach the `checkout` function to any of your price CTA actions to initiate a new checkout session

### Setup

- Import `PriceBlocs` and initialize it with both:
  - `api_key`: your PriceBlocs publishable API key
    - Use your `PB_pk_live_*` API key for live Stripe resources and checkout
    - Use your `PB_pk_test_*` API key for live Stripe resources and checkout
  - `prices`: set of prices you want to show to customers (live)
- You can also pass additional checkout configuration options like a customer id / email

##### API keys

- Your PriceBlocs account can have both live and test API key sets
- Each set of API keys has both a public and secret key
- Only public keys should be used for client side requests - they can perform read but not write operations to Stripe
- Only `livemode: true` keys can initiate live Stripe checkout charges
- Your connected Stripe account must have `charges_enabled` in order to initiate a checkout session
  - To achieve this, you will need to go throught the Stripe onboarding prompts within the app

| Key name       | Livemode | Audience |
| -------------- | -------- | -------- |
| `PB_sk_live_*` | true     | Secret   |
| `PB_pk_live_*` | true     | Public   |
| `PB_sk_test_*` | false    | Secret   |
| `PB_pk_test_*` | false    | Public   |

```javascript
import { PriceBlocs } from 'priceblocs'

export default () => {
  const props = {
    api_key: 'PB_pk_test_oYQN',
    prices: ['p_123', 'p_456'],
  }

  return (
    <PriceBlocs {...props}>
      {({ loading, values }) => {
        if (loading) {
          return <Loader />
        } else if (values && values.products && values.products.length > 0) {
          return <PricingTable />
        }
        return null
      }}
    </PriceBlocs>
  )
}
```

#### Props

| Key          | Required | Type   | Description                                                                                                                                                                    | Example                       |
| ------------ | -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| api_key      | Yes      | String | One of your PriceBlocs publishable API key                                                                                                                                     | PB_pk_test_sRADszm...         |
| prices       | Yes      | Array  | Array of Stripe price ids to fetch                                                                                                                                             | ['p_123', 'p_456']            |
| success_url  | No       | String | Redirect location after a successful checkout                                                                                                                                  | https://your-site.com/success |
| cancel_url   | No       | String | Redirect location if a user cancels their current checkout session                                                                                                             | https://your-site.com/cancel  |
| customer     | No       | String | Stripe customer id                                                                                                                                                             | cu_123                        |
| email        | No       | String | Email for your customer customer. If there is a matching customer within you Stripe account, we will use this to initiate the checkout session in the context of that customer | some.one@email.com            |
| presentation | No       | Object | Control the presentation of the response                                                                                                                                       | {order: 'desc'}               |

### Present

- Once initialized, you will be able to access your fetched data via the `usePriceBlocsContext` context hook
- There are a variety of fields to help you present, update and initiate checkout

| Key                             | Type     | Description                                                               |
| ------------------------------- | -------- | ------------------------------------------------------------------------- |
| [values](#values-api)           | Object   | Core pricing resources like products and featureGroups etc.               |
| [form](#form-api)               | Object   | Form state values like currencies and intervals to help with presentation |
| [checkout](#checkout)           | Function | Start a checkout session                                                  |
| [billing](#billing)             | Function | Start a billing portal session for the provided customer                  |
| [setFieldValue](#setfieldvalue) | Function | Update any of the context values                                          |

```javascript
import { usePriceBlocsContext, getActiveProductPrice } from 'priceblocs'

const PricingTable = () => {
  const {
    values: { products },
    form: { currency, interval },
    checkout,
  } = usePriceBlocsContext()

  return (
    <div>
      <ul>
        {products.map((product, productIx) => {
          const price = getActiveProductPrice(product, { currency, interval })
          return (
            <li key={product.id}>
              <div>
                <div>{product.name}</div>
                <div>{product.description}</div>
              </div>
              <button onClick={() => checkout({ prices: [price.id] })}>
                Buy Now
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
```

### Checkout

- Use the `checkout` function from context to start a checkout session by passing a single price or collection of prices as an argument

```javascript
const { checkout } = usePriceBlocsContext()

// Single price
<button onClick={() => checkout(price.id)}>Buy Now</button>
// Price collection
<button onClick={() => checkout({prices: [price.id]})}>Buy Now</button>
```

### Billing

- Use the `billing` function from context to start a new Stripe billing portal session
- A valid customer id is required to start a new session
- By default, we will use the customer in context if you have initiated PriceBlocs with a valid customer
- Otherwise you can pass a customer parameter into the billing call

```javascript
const { billing } = usePriceBlocsContext()

// Use default customer if present
<button onClick={billing}>Manage billing</button>
// Provide a customer to the billing call
<button onClick={() => billing({ customer: 'cus_123' })}>Manage billing</button>
```

### setFieldValue

- You can use the `setFieldValue` function to update any of the state in context
- This can be useful for updating values such as the `interval` or `currency` within the `form` state to assist with presentation logic
- You can pass a dot path to target nested fields for updates

```javascript
const {
  setFieldValue,
} = usePriceBlocsContext()

<button onClick={() => setFieldValue('form.interval', 'month')}>Show monthly prices</button>
```

## API

### Context & Hooks

| Key                  | Type     | Description       |
| -------------------- | -------- | ----------------- |
| PriceBlocs           | HOC      | Context container |
| usePriceBlocsContext | Function | Context hook      |

### Utils

| Key                      | Type     | Description                                                                      |
| ------------------------ | -------- | -------------------------------------------------------------------------------- |
| getActiveProductPrice    | Function | Get the product price based on the current form values for interval and currency |
| getProductFeatures       | Function | Get all features for the provided product                                        |
| getProductsFeaturesTable | Function | Generate a feature table representation for products in context                  |

### Constants

| Key                    | Type   | Description                                  | Example   |
| ---------------------- | ------ | -------------------------------------------- | --------- |
| RECURRING_INTERVALS    | Object | A mapping of the 4 recurring intervals       | 'month'   |
| INTERVAL_LABELS_MAP    | Object | A mapping of each interval to it's label     | 'monthly' |
| INTERVAL_SHORTHAND_MAP | Object | A mapping of each interval to it's shorthand | 'mo'      |

### Schema

#### Values API

| Key                                  | Description                |
| ------------------------------------ | -------------------------- |
| [products](#product-api)             | An array of products       |
| [featureGroups](#feature-groups-api) | An array of feature groups |

---

#### Product API

This shape is closely aligned to the [Stripe products API](https://stripe.com/docs/api/products/object)

| Key                  | Description                |
| -------------------- | -------------------------- |
| name                 | Name of the product        |
| description          | Description of the product |
| [prices](#price-api) | Array of Stripe prices     |

---

#### Price API

- This shape is closely aligned to the [Stripe prices API](https://stripe.com/docs/api/pricess/object)

| Key                                | Description                                  |
| ---------------------------------- | -------------------------------------------- |
| id                                 | Stripe price id                              |
| unit_amount                        | Unit amount for the price                    |
| currency                           | Stripe price id                              |
| product                            | Stripe product id which the price belongs to |
| [formatted](#price-formatting-api) | Formatted price values                       |
| symbol                             | Currency symbol for this price               |

#### Price formatting API

- We format the unit_amount of each price so you don't have to.
- This also includes formatting them for a variery of different intervals (day, week, month, year)
- Each formatted interval is accessible under the `intervals` key

| Key         | Description                                                                                                        | Example                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| unit_amount | Formatted version of the unit amount                                                                               | 12000 -> $120.00                                                 |
| intervals   | Price formatted for different intervals [day, week, month, year]. e.g a yearly price presented as a per month cost | { day: "$0.33", week: "$2.31", month: "$10.00", year: "$120.00"} |

---

#### Form API

| Key                                    | Description                                             | Example             |
| -------------------------------------- | ------------------------------------------------------- | ------------------- |
| interval                               | The default interval based on prices in config response | 'month'             |
| intervals                              | Set of intervals for prices in response                 | ['month', 'year']   |
| currency                               | The default currency based on prices in config response | 'usd'               |
| currencies                             | Set of intervals for prices in response                 | ['usd','eur']       |
| [presentation](#form-presentation-api) | Presentation values for form                            | {interval: "month"} |

#### Form presentation API

| Key      | Description                                                                                                                                                                 | Example |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| interval | The interval presentation interval. For example 'month' will present all amounts in terms of per month pricing, so a $120 per year price will be presented as $10 per month | 'month' |
