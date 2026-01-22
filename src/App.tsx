import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { fetchTemaNatale, fetchTransitiMensili } from './lib/api'
import { Box, VStack, Flex , HStack, Button } from '@chakra-ui/react'
import { Header, NatalForm, NatalResult, WelcomeForm, Footer } from './components'

// Import delle pagine di testing
import TestingHome from './pages/testing/TestingHome'
import TransitsTableTest from './pages/testing/TransitsTableTest'

/**
 * Componente principale dell'applicazione Transity WebApp
 * Gestisce il routing e mostra le diverse sezioni dell'app
 */
function App() {
  const location = useLocation()
  const isTestingRoute = location.pathname.startsWith('/testing')
  const [showWelcome, setShowWelcome] = useState(!isTestingRoute)
  const [activeTab, setActiveTab] = useState('natal')

  // ====== STATI PER CALCOLO TEMA NATALE E TRANSITI ======
  const [natalResult, setNatalResult] = useState<any>(null)
  const [natalLoading, setNatalLoading] = useState(false)
  const [natalDate, setNatalDate] = useState('1990-01-01')
  const [natalTime, setNatalTime] = useState('12:00')
  const [natalLatitude, setNatalLatitude] = useState('')
  const [natalLongitude, setNatalLongitude] = useState('')
  const [natalTimezone, setNatalTimezone] = useState('1')
  const [monthlyTransits, setMonthlyTransits] = useState<any>(null)

  // ====== STATI PER CONTROLLO PERIODO TRANSITI ======
  const [transitStartDate, setTransitStartDate] = useState('')
  const [transitEndDate, setTransitEndDate] = useState('')

  const handleNatalClick = async () => {
    setNatalLoading(true)
    try {
      const dateTimeString = `${natalDate}T${natalTime}:00`
      const isoDate = new Date(dateTimeString).toISOString()

      const natalData = await fetchTemaNatale(
        isoDate,
        parseFloat(natalLatitude),
        parseFloat(natalLongitude),
        parseFloat(natalTimezone)
      )
      setNatalResult(natalData)

      if (transitStartDate && transitEndDate) {
        const transitsData = await fetchTransitiMensili(transitStartDate, transitEndDate)
        setMonthlyTransits(transitsData)
      }
    } catch (err: any) {
      console.error('Errore fetch tema natale:', err)
      setNatalResult({ error: err.message || 'Errore sconosciuto' })
    } finally {
      setNatalLoading(false)
    }
  }

  const handleWelcomeCompleted = () => {
    setShowWelcome(false)
  }

  // Componente per la pagina principale
  const MainApp = () => {
    if (showWelcome) {
      return (
        <Box minH="100vh" display="flex" flexDirection="column">
          <WelcomeForm onFormCompleted={handleWelcomeCompleted} />
          <Footer />
        </Box>
      )
    }

    return (
      <Box minH="100vh" bg="#1b203e" color="white" display="flex" flexDirection="column" 
        style={{
          backgroundImage: `url('/background-stars.png')`
        }}
      >
        <Flex direction="column" align="center" justify="flex-start" flex="1" p={8}>
          <VStack gap={8} align="center" w="full" maxW="1200px">
            <Header />

            <HStack gap={4} mb={4} flexWrap="wrap">
              <Button
                onClick={() => setActiveTab('natal')}
                colorScheme={activeTab === 'natal' ? 'blue' : 'gray'}
                variant={activeTab === 'natal' ? 'solid' : 'outline'}
                size="lg"
              >
                Calcolo Tema Natale e Transiti
              </Button>
            </HStack>

            {activeTab === 'natal' && (
              <>
                <NatalForm
                  selectedDate={natalDate}
                  selectedTime={natalTime}
                  latitude={natalLatitude}
                  longitude={natalLongitude}
                  timezone={natalTimezone}
                  transitStartDate={transitStartDate}
                  transitEndDate={transitEndDate}
                  loading={natalLoading}
                  onDateChange={setNatalDate}
                  onTimeChange={setNatalTime}
                  onLatitudeChange={setNatalLatitude}
                  onLongitudeChange={setNatalLongitude}
                  onTimezoneChange={setNatalTimezone}
                  onTransitStartDateChange={setTransitStartDate}
                  onTransitEndDateChange={setTransitEndDate}
                  onSubmit={handleNatalClick}
                />
                <NatalResult result={natalResult} monthlyTransits={monthlyTransits} />
              </>
            )}
          </VStack>
        </Flex>
        <Footer />
      </Box>
    )
  }

  return (
    <Routes>
      {/* Route principale */}
      <Route path="/" element={<MainApp />} />

      {/* Route di testing */}
      <Route path="/testing" element={<TestingHome />} />
      <Route path="/testing/transits-table" element={<TransitsTableTest />} />
    </Routes>
  )
}

export default App