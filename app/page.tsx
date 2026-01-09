'use client'

import { useState, useEffect } from 'react'
import { CalculationMode, ForwardCalculationInputs, ReverseCalculationInputs, TradeDetails } from '@/types'
import { DEFAULT_RISK_PERCENTAGE, DEFAULT_CASH_USAGE_PERCENTAGE } from '@/lib/calculations'
import { saveTradeToJournal, checkSimilarActiveTrade } from '@/lib/journal'
import { Navigation, ViewType } from '@/components/Navigation'
import { CalculatorView } from '@/components/views/CalculatorView'
import { DashboardView } from '@/components/views/DashboardView'
import { TradingDashboardView } from '@/components/views/TradingDashboardView'
import { JournalView } from '@/components/views/JournalView'
import { Settings } from '@/components/Settings'
import { TradeDetailsModal } from '@/components/TradeDetailsModal'
import { TradeChecklistModal } from '@/components/TradeChecklistModal'
import { Toast } from '@/components/Toast'
import { HeatWarningModal } from '@/components/HeatWarningModal'
import { calculateTotalHeat } from '@/components/AccountHeatDashboard'
import { CalculationResult } from '@/types'
import { isChecklistGatekeeperEnabled } from '@/lib/settings'

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('calculator')
  const [mode, setMode] = useState<CalculationMode>('forward')
  
  // Forward calculation inputs
  const [forwardInputs, setForwardInputs] = useState<ForwardCalculationInputs>({
    accountSize: '',
    riskPercentage: DEFAULT_RISK_PERCENTAGE.toString(),
    entryPrice: '',
    stopLossPrice: '',
    targetPrice: '',
    tradeType: 'long',
    excessLiquidity: '',
  })
  
  // Reverse calculation inputs
  const [reverseInputs, setReverseInputs] = useState<ReverseCalculationInputs>({
    availableCash: '',
    cashUsagePercentage: DEFAULT_CASH_USAGE_PERCENTAGE.toString(),
    entryPrice: '',
    tradeType: 'long',
    stopLossPrice: '',
    accountSize: '',
  })

  // Journal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null)
  const [journalRefresh, setJournalRefresh] = useState(0)

  const handleForwardInputChange = <K extends keyof ForwardCalculationInputs>(
    field: K,
    value: ForwardCalculationInputs[K]
  ) => {
    setForwardInputs(prev => ({ ...prev, [field]: value }))
  }

  const handleReverseInputChange = <K extends keyof ReverseCalculationInputs>(
    field: K,
    value: ReverseCalculationInputs[K]
  ) => {
    setReverseInputs(prev => ({ ...prev, [field]: value }))
  }

  // Calculate account balance from forward inputs or reverse inputs (if provided)
  const accountBalance = forwardInputs.accountSize 
    ? parseFloat(forwardInputs.accountSize) || null 
    : (reverseInputs.accountSize ? parseFloat(reverseInputs.accountSize) || null : null)

  // State for total heat calculation
  const [totalHeat, setTotalHeat] = useState<number | null>(null)
  const [showHeatWarning, setShowHeatWarning] = useState(false)
  const [pendingSave, setPendingSave] = useState<{
    result: CalculationResult
    inputs: ForwardCalculationInputs | ReverseCalculationInputs
  } | null>(null)
  
  // State for checklist modal
  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const [checklistComplete, setChecklistComplete] = useState(false)

  // Calculate total heat when account balance changes
  useEffect(() => {
    const calculateHeat = async () => {
      if (accountBalance) {
        const result = await calculateTotalHeat(accountBalance)
        setTotalHeat(result.totalHeat)
      } else {
        setTotalHeat(null)
      }
    }
    calculateHeat()
  }, [accountBalance, journalRefresh])

  const handleSaveToJournal = (result: CalculationResult, inputs: ForwardCalculationInputs | ReverseCalculationInputs) => {
    // Check if checklist gatekeeper is enabled
    const checklistEnabled = isChecklistGatekeeperEnabled()
    
    if (checklistEnabled && !checklistComplete) {
      // Show checklist modal first
      setPendingSave({ result, inputs })
      setShowChecklistModal(true)
      return
    }
    
    // After checklist is complete (or disabled), proceed with normal flow
    proceedWithSave(result, inputs)
  }

  const proceedWithSave = (result: CalculationResult, inputs: ForwardCalculationInputs | ReverseCalculationInputs) => {
    // Check if total heat exceeds threshold
    if (totalHeat !== null && totalHeat > 6) {
      // Show warning modal instead of preventing save
      setPendingSave({ result, inputs })
      setShowHeatWarning(true)
    } else {
      // Proceed directly if heat is acceptable
      setCurrentResult(result)
      setIsModalOpen(true)
    }
  }

  const handleChecklistComplete = () => {
    setChecklistComplete(true)
    setShowChecklistModal(false)
    
    // Proceed with save after checklist is complete
    if (pendingSave) {
      proceedWithSave(pendingSave.result, pendingSave.inputs)
      setPendingSave(null)
    }
  }

  const handleChecklistCancel = () => {
    setShowChecklistModal(false)
    setChecklistComplete(false)
    setPendingSave(null)
    setToast({
      message: 'Save cancelled. Complete the checklist to save trades.',
      type: 'warning'
    })
  }

  const handleProceedWithSave = () => {
    if (pendingSave) {
      setCurrentResult(pendingSave.result)
      setIsModalOpen(true)
      setPendingSave(null)
    }
  }

  const handleCancelSave = () => {
    setPendingSave(null)
    setToast({
      message: 'Save cancelled. Consider closing existing positions to reduce risk.',
      type: 'warning'
    })
  }

  const handleSaveTradeDetails = async (details: TradeDetails) => {
    if (!currentResult) return

    const entryPrice = mode === 'forward' 
      ? parseFloat((forwardInputs as ForwardCalculationInputs).entryPrice)
      : parseFloat((reverseInputs as ReverseCalculationInputs).entryPrice)
    
    const stopLossPrice = mode === 'forward'
      ? parseFloat((forwardInputs as ForwardCalculationInputs).stopLossPrice) || null
      : parseFloat((reverseInputs as ReverseCalculationInputs).stopLossPrice) || null

    const direction = mode === 'forward'
      ? (forwardInputs as ForwardCalculationInputs).tradeType
      : (reverseInputs as ReverseCalculationInputs).tradeType

    // Check for similar active trade
    const hasSimilar = await checkSimilarActiveTrade(details.ticker)
    
    const journalEntry = await saveTradeToJournal({
      ticker: details.ticker,
      setupType: details.setupType,
      entryPrice,
      stopLossPrice,
      positionSize: currentResult.maxShares,
      riskAmount: currentResult.maxLoss || null,
      direction,
      status: 'order',
      tradeValue: currentResult.tradeValue,
      rMultiple: currentResult.rMultiple,
      targetPrice: currentResult.targetPrice,
      potentialProfit: currentResult.potentialProfit,
    })

    setToast({
      message: hasSimilar 
        ? `Trade saved! ⚠️ Similar active trade exists for ${details.ticker}`
        : 'Trade saved to journal! ✅',
      type: hasSimilar ? 'warning' : 'success'
    })

    setIsModalOpen(false)
    setCurrentResult(null)
    setChecklistComplete(false) // Reset checklist completion for next trade
    // Trigger journal refresh
    setJournalRefresh(prev => prev + 1)
  }

  // Total heat is already calculated in state above

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        totalHeat={totalHeat}
      />
      
      {/* Main Content Area */}
      <main className={`
        lg:pl-64 
        pt-16 lg:pt-0
        min-h-screen
        transition-all duration-300
      `}>
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {/* Calculator View */}
          {currentView === 'calculator' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CalculatorView
                mode={mode}
                onModeChange={setMode}
                forwardInputs={forwardInputs}
                reverseInputs={reverseInputs}
                onForwardInputChange={handleForwardInputChange}
                onReverseInputChange={handleReverseInputChange}
                onSaveToJournal={handleSaveToJournal}
              />
            </div>
          )}

          {/* Dashboard View (Account Heat) */}
          {currentView === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <DashboardView
                accountBalance={accountBalance}
                refreshTrigger={journalRefresh}
              />
            </div>
          )}

          {/* Trading Dashboard View */}
          {currentView === 'trading-dashboard' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <TradingDashboardView
                accountBalance={accountBalance}
                refreshTrigger={journalRefresh}
                forwardInputs={forwardInputs}
              />
            </div>
          )}

          {/* Journal View */}
          {currentView === 'journal' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <JournalView
                refreshTrigger={journalRefresh}
              />
            </div>
          )}

          {/* Settings View */}
          {currentView === 'settings' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <Settings />
            </div>
          )}

          {/* Modals and Toasts - Always available */}
          {currentResult && (
            <TradeDetailsModal
              open={isModalOpen}
              onOpenChange={setIsModalOpen}
              onSave={handleSaveTradeDetails}
              result={currentResult}
              entryPrice={mode === 'forward' 
                ? parseFloat(forwardInputs.entryPrice) 
                : parseFloat(reverseInputs.entryPrice)}
              stopLossPrice={mode === 'forward'
                ? parseFloat(forwardInputs.stopLossPrice) || null
                : parseFloat(reverseInputs.stopLossPrice) || null}
              direction={mode === 'forward' ? forwardInputs.tradeType : reverseInputs.tradeType}
              positionSize={currentResult.maxShares}
            />
          )}

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          {/* Checklist Modal */}
          {pendingSave && (
            <TradeChecklistModal
              open={showChecklistModal}
              onComplete={handleChecklistComplete}
              onCancel={handleChecklistCancel}
              result={pendingSave.result}
              entryPrice={mode === 'forward' 
                ? parseFloat(forwardInputs.entryPrice) 
                : parseFloat(reverseInputs.entryPrice)}
              stopLossPrice={mode === 'forward'
                ? parseFloat(forwardInputs.stopLossPrice) || null
                : parseFloat(reverseInputs.stopLossPrice) || null}
              targetPrice={mode === 'forward'
                ? parseFloat(forwardInputs.targetPrice) || null
                : null}
              direction={mode === 'forward' ? forwardInputs.tradeType : reverseInputs.tradeType}
            />
          )}

          {totalHeat !== null && totalHeat > 6 && (
            <HeatWarningModal
              open={showHeatWarning}
              onOpenChange={setShowHeatWarning}
              totalHeat={totalHeat}
              onProceed={handleProceedWithSave}
              onCancel={handleCancelSave}
            />
          )}
        </div>
      </main>
    </div>
  )
}
