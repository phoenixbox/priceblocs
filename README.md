# PriceBlocs

PriceBlocs makes it easy for developers to add in payments and billing management to their products through a set of context hooks and components.

## Getting started

- [API Keys] - Sign up for [PriceBlocs](https://priceblocs.com) and get your API keys.
- [Test mode] - For local development you'll need to enable test mode

Our first set of components and hooks are compatible with React, examples of which you can see below.

### Install

- PriceBlocs is available via npm

```
npm i --save priceblocs
```

### Workflow

There are 3 steps to adding prices and checkout to your app:

- [Setup](#setup)
  - Wrap any part of your app with an authenticated PriceBlocs HOC
  - Pass an `api_key`, `prices` and whatever other configuration options you need
- [Present](#present)
  - Access your fetched data via context hooks and use it to present purchase options to your customers
- [Checkout](#checkout)
  - Attach the `checkout` function to any of your price CTA actions to initiate a new checkout session

#### Setup

- Import `PriceBlocs` and initialize it with both:
  - `api_key`: your PriceBlocs account API key
  - `prices`: your set of prices you want to show to customers
- You can also pass additional checkout configuration options like a customer id / email

```javascript
import { PriceBlocs } from 'priceblocs'

export default () => {
  const props = {
    api_key: 'YOUR_PRICE_BLOCS_API_KEY',
    prices: ['p_123', 'p_456'],
    email: 'some.customer@email.com',
  }

  return (
    <PriceBlocs {...props}>
      {({ loading, values }) => {
        if (loading) {
          return <Loader />
        } else if (values && values.products && values.products.length > 0) {
          return <PricingTable />
        } else {
          return <span />
        }
      }}
    </PriceBlocs>
  )
}
```

##### Props

**Required**

| Key     | String | Description                     |
| ------- | ------ | ------------------------------- |
| api_key | string | Your PriceBlocs account API key |

**Optional**

| Key          | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| prices       | Array of prices to fetch                                     |
| success_url  | Redirect location after a successful checkout                |
| cancel_url   | Redirect location if a user cancels current checkout session |
| return_url   | The url of the location                                      |
| presentation | The url of the location                                      |

#### Present

- Once initialized, you will be able to access your fetched data via the `usePriceBlocsContext` context hook
- There are a variety of fields to help you present, update and initiate checkout

| Key           | Type     | Description                                                               |
| ------------- | -------- | ------------------------------------------------------------------------- |
| values        | Object   | Core pricing resources like products and featureGroups etc.               |
| form          | Object   | Form state values like currencies and intervals to help with presentation |
| checkout      | Function | Start a checkout session                                                  |
| setFieldValue | Function | Update any of the context values                                          |

```javascript
import { usePriceBlocsContext, getActiveProductPrice } from 'priceblocs'

const PricingTable = () => {
  const {
    values: { products },
    /**
     * Initial context will come with some default values based on the prices you have fetched
     * (e.g )
     */
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

#### Checkout

- Use the `checkout` function from context to start a checkout session by passing a single price as an argument

```javascript
const { checkout } = usePriceBlocsContext()

<button onClick={() => checkout({ prices: [price.id] })}>Buy Now</button>
```
