import { TextDecoder, TextEncoder } from 'util';

import { indexedDB, IDBKeyRange } from 'fake-indexeddb';

// jsdom does not provide TextEncoder/TextDecoder, which @trustwallet/wallet-core
// (via protobufjs) needs at import time. Polyfill them from Node's util module.
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
}

if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}

globalThis.indexedDB = indexedDB;
globalThis.IDBKeyRange = IDBKeyRange;

// Mock for localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) =>
      // Need to handle empty string values correctly
      key in store ? store[key] : null
    ),
    setItem: jest.fn((key: string, value: string) => {
      // Handle undefined value which gets converted to string "undefined"
      store[key] = value === undefined ? 'undefined' : value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock global localStorage. The jsdom environment already provides `window`
// (which is non-configurable under jest-environment-jsdom 30+, so it must not
// be redefined); only `localStorage` needs to be replaced with the spyable mock
// that the storage code and tests rely on.
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true,
});

if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
}

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});
