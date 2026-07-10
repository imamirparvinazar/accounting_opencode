import { Suspense, lazy } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

export function lazyPage(importFn) {
  const Component = lazy(importFn)
  return function LazyPage(props) {
    return (
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <Component {...props} />
      </Suspense>
    )
  }
}
