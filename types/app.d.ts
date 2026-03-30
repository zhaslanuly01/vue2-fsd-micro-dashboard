import Vue from 'vue'
import type Router from 'vue-router'
import type { Store } from 'vuex'

declare module 'vue/types/vue' {
  interface Vue {
    $router: Router
    $route: import('vue-router').Route
    $store: Store<any>
  }
}

declare const _brand: unique symbol

declare global {
  /**
   * Custom utility types
   */
  export type Nullable<T> = T | null

  export type Keys<T extends Record<string, unknown>> = keyof T

  export type Values<T extends Record<string, unknown>> = T[Keys<T>]

  export type Brand<K, T> = K & { [_brand]: T }

  /**
   * Type aliases
   */
  export type Phone = string

  export type Email = string

  export type Id = number

  export type DateIso = string

  export type Timestamp = number

  export type Penny = number

  export type Url = string

  export type Color = string
}

export {}
