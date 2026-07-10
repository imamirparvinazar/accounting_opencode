import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-danger-light flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-danger" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">خطایی رخ داد</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            {this.state.error?.message || 'مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-dark transition-colors"
          >
            <RefreshCw size={16} />
            تلاش مجدد
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
