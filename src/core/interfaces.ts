export type Strings = readonly string[]
export type Numbers = readonly number[]

export interface TimestampedMessage { readonly msg: string, readonly ts: number }
export type TimestampMessages = readonly TimestampedMessage[]
export type StringDictionary = { readonly [key: string]: string }
