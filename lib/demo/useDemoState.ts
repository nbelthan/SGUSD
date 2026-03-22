'use client';

import { createContext, createElement, useContext, useCallback, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Transaction } from '@/types';
import { ACME_ACCOUNT, GLOBAL_LOGISTICS_ACCOUNT } from './accounts';

export type DemoStep = 'tax-refund' | 'mint' | 'watch-yield' | 'payout' | 'payroll' | 'wage-yield' | 'lending' | 'burn' | 'agent-wallet' | 'confirmation';

interface DemoState {
  currentStep: DemoStep;
  transactions: Transaction[];
  acmeAddress: `0x${string}`;
  receiverAddress: `0x${string}`;
}

type DemoAction =
  | { type: 'SET_STEP'; step: DemoStep }
  | { type: 'ADD_TRANSACTION'; transaction: Transaction }
  | { type: 'UPDATE_TRANSACTION'; txHash: `0x${string}`; status: Transaction['status'] }
  | { type: 'SET_ACME_ADDRESS'; address: `0x${string}` }
  | { type: 'SET_RECEIVER_ADDRESS'; address: `0x${string}` }
  | { type: 'RESET' };

const initialState: DemoState = {
  currentStep: 'tax-refund',
  transactions: [],
  acmeAddress: ACME_ACCOUNT.address,
  receiverAddress: GLOBAL_LOGISTICS_ACCOUNT.address,
};

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.transaction] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.txHash === action.txHash ? { ...tx, status: action.status } : tx
        ),
      };
    case 'SET_ACME_ADDRESS':
      return { ...state, acmeAddress: action.address };
    case 'SET_RECEIVER_ADDRESS':
      return { ...state, receiverAddress: action.address };
    case 'RESET':
      return { ...initialState, acmeAddress: state.acmeAddress, receiverAddress: state.receiverAddress };
    default:
      return state;
  }
}

interface DemoContextValue {
  state: DemoState;
  currentStep: DemoStep;
  transactions: Transaction[];
  acmeAccount: typeof ACME_ACCOUNT;
  receiverAccount: typeof GLOBAL_LOGISTICS_ACCOUNT;
  setStep: (step: DemoStep) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (txHash: `0x${string}`, status: Transaction['status']) => void;
  setAcmeAddress: (address: `0x${string}`) => void;
  setReceiverAddress: (address: `0x${string}`) => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, initialState);

  const setStep = useCallback((step: DemoStep) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const addTransaction = useCallback((transaction: Transaction) => {
    dispatch({ type: 'ADD_TRANSACTION', transaction });
  }, []);

  const updateTransaction = useCallback((txHash: `0x${string}`, status: Transaction['status']) => {
    dispatch({ type: 'UPDATE_TRANSACTION', txHash, status });
  }, []);

  const setAcmeAddress = useCallback((address: `0x${string}`) => {
    dispatch({ type: 'SET_ACME_ADDRESS', address });
  }, []);

  const setReceiverAddress = useCallback((address: `0x${string}`) => {
    dispatch({ type: 'SET_RECEIVER_ADDRESS', address });
  }, []);

  const resetDemo = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const acmeAccount = useMemo(
    () => ({ ...ACME_ACCOUNT, address: state.acmeAddress }),
    [state.acmeAddress]
  );

  const receiverAccount = useMemo(
    () => ({ ...GLOBAL_LOGISTICS_ACCOUNT, address: state.receiverAddress }),
    [state.receiverAddress]
  );

  const value = useMemo<DemoContextValue>(
    () => ({
      state,
      currentStep: state.currentStep,
      transactions: state.transactions,
      acmeAccount,
      receiverAccount,
      setStep,
      addTransaction,
      updateTransaction,
      setAcmeAddress,
      setReceiverAddress,
      resetDemo,
    }),
    [state, acmeAccount, receiverAccount, setStep, addTransaction, updateTransaction, setAcmeAddress, setReceiverAddress, resetDemo]
  );

  return createElement(DemoContext.Provider, { value }, children);
}

export function useDemoState(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoState must be used within a DemoProvider');
  }
  return context;
}
