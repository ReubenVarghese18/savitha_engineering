import { Component } from 'react';
import { captureError } from '../monitoring';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
    captureError(error, { componentStack: info?.componentStack });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center px-6 py-16">
        <div role="alert" className="max-w-xl w-full border-[3px] border-white p-8 sm:p-10 shadow-[8px_8px_0px_0px_#FF4D00]">
          <p className="font-mono text-xs tracking-[0.2em] text-[#FF4D00] mb-4">[ SYSTEM ERROR ]</p>
          <h1 className="font-brutal-head text-4xl sm:text-5xl uppercase leading-none mb-6">Something went wrong</h1>
          <p className="text-gray-300 mb-8 leading-relaxed">
            This page hit an unexpected problem. Reloading usually fixes it. If it keeps happening, call{' '}
            <a className="text-[#FF4D00] underline" href="tel:+918044464594">+91 8044464594</a> or email{' '}
            <a className="text-[#FF4D00] underline" href="mailto:info@savithaeng.com">info@savithaeng.com</a>.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#FF4D00] text-black font-black uppercase tracking-widest border-[3px] border-white cursor-pointer hover:bg-white transition-colors"
            >
              Reload page
            </button>
            <a
              href="/"
              className="px-6 py-3 text-white font-black uppercase tracking-widest border-[3px] border-white hover:bg-white hover:text-black transition-colors"
            >
              Go to home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
