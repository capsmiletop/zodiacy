import { useEffect, useState } from 'react'
import {
  Box,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  Spinner
} from '@chakra-ui/react'

interface LocationInputProps {
  date: string
  onDataReceived: (data: {
    latitude?: number
    longitude?: number
    timezone?: string
    offset?: number
    dst?: boolean
  }) => void
}

const API_KEY = import.meta.env.VITE_REACT_APP_OPENCAGE_API_KEY

const LocationInput = ({ date, onDataReceived }: LocationInputProps) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ formatted: string }[]>([])
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.length >= 3) fetchSuggestions()
    }, 600)
    return () => clearTimeout(timeout)
  }, [query])

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${API_KEY}&limit=5`
      )
      const data = await res.json()
      setSuggestions(data.results || [])
    } catch {
      setError('Errore nel recupero suggerimenti.')
    }
  }

  const handleSearch = async () => {
    if (!selectedPlace || !date) return
    setLoading(true)
    setError('')
    setApiError('')
    try {
      const response = await fetch(
        `https://transity-backend.onrender.com/resolve-location?place=${encodeURIComponent(
          selectedPlace
        )}&date=${date}`
      )
      const result = await response.json()

      if (!result.latitude || !result.longitude || !result.timezone) {
        let msg = ''
        if (!result.latitude || !result.longitude) {
          msg += 'Coordinate non trovate. Inserisci manualmente.\n'
        }
        if (!result.timezone) {
          msg += 'Fuso orario non trovato. Inserisci manualmente.'
        }
        setApiError(msg.trim())
      }

      onDataReceived(result)
    } catch (err) {
      console.error('LocationInput: Errore durante il recupero dei dati:', err)
      setError('Errore durante il recupero dei dati.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box w="full">
      <VStack align="stretch" gap={3}>
        <Text fontSize="md" fontWeight="semibold" color="rgba(173, 216, 230, 0.9)">
          🌍 Ricerca Automatica Coordinate
        </Text>

        <Text fontSize="sm" color="rgba(255, 255, 255, 0.7)">
          Cerca una città per ottenere automaticamente coordinate e fuso orario (Location data via OpenCage)
        </Text>

        <Box position="relative">
          <Input
            placeholder="Digita una città: es. Roma, Milano, Napoli"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedPlace(null)
            }}
            bg="transparent"
            border="none"
            borderBottom="1px solid"
            borderColor="rgba(255, 255, 255, 0.3)"
            borderRadius="0"
            color="white"
            px={0}
            _placeholder={{ color: 'rgba(255, 255, 255, 0.5)' }}
            _focus={{
              outline: 'none',
              borderBottom: '1px solid',
              borderBottomColor: 'rgba(173, 216, 230, 0.6)',
              boxShadow: 'none'
            }}
            _hover={{
              borderBottomColor: 'rgba(255, 255, 255, 0.5)'
            }}
          />

          {/* Suggerimenti dropdown */}
          {suggestions.length > 0 && !selectedPlace && (
            <Card.Root
              position="absolute"
              top="100%"
              left={0}
              right={0}
              zIndex={10}
              mt={1}
              maxH="200px"
              overflowY="auto"
              bg="rgba(30, 35, 60, 0.95)"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.2)"
              borderRadius="md"
              boxShadow="lg"
            >
              <Card.Body p={2}>
                <VStack align="stretch" gap={1}>
                  <Text fontSize="xs" color="rgba(255, 255, 255, 0.6)" px={2} py={1}>
                    📍 Seleziona il luogo corretto:
                  </Text>
                  {suggestions.map((sug, i) => (
                    <Box
                      key={i}
                      onClick={() => {
                        setSelectedPlace(sug.formatted)
                        setQuery(sug.formatted)
                        setSuggestions([])
                      }}
                      cursor="pointer"
                      p={2}
                      borderRadius="sm"
                      _hover={{
                        bg: "rgba(173, 216, 230, 0.2)",
                        transform: "scale(1.01)",
                        borderColor: "rgba(173, 216, 230, 0.4)"
                      }}
                      transition="all 0.2s"
                      border="1px solid transparent"
                    >
                      <Text fontSize="sm" fontWeight="medium" color="white">
                        {sug.formatted}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Card.Body>
            </Card.Root>
          )}
        </Box>

        {/* Luogo selezionato */}
        {selectedPlace && (
          <Card.Root bg="rgba(30, 35, 60, 0.9)" border="1px solid" borderColor="rgba(255, 255, 255, 0.2)">
            <Card.Body p={3}>
              <HStack justify="space-between" align="center">
                <VStack align="start" gap={1}>
                  <HStack>
                    <Badge bg="rgba(76, 175, 80, 0.3)" color="rgba(255, 255, 255, 0.9)" border="1px solid" borderColor="rgba(76, 175, 80, 0.5)" size="sm">✓ Selezionato</Badge>
                  </HStack>
                  <Text fontSize="sm" fontWeight="medium" color="rgba(255, 255, 255, 0.9)">
                    {selectedPlace}
                  </Text>
                </VStack>

                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  bg="rgba(255, 255, 255, 0.1)"
                  border="1px solid"
                  borderColor="rgba(255, 255, 255, 0.3)"
                  color="white"
                  size="sm"
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'rgba(255, 255, 255, 0.5)'
                  }}
                  _disabled={{
                    opacity: 0.5,
                    cursor: 'not-allowed'
                  }}
                >
                  {loading ? (
                    <HStack gap={2}>
                      <Spinner size="xs" />
                      <Text>Caricamento...</Text>
                    </HStack>
                  ) : (
                    '🔍 Ottieni Coordinate'
                  )}
                </Button>
              </HStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Messaggi di stato */}
        {apiError && (
          <Card.Root bg="rgba(255, 165, 0, 0.1)" border="1px solid" borderColor="rgba(255, 165, 0, 0.3)">
            <Card.Body p={3}>
              <Text fontSize="sm" color="rgba(255, 255, 255, 0.9)" whiteSpace="pre-line">
                ⚠️ {apiError}
              </Text>
            </Card.Body>
          </Card.Root>
        )}

        {error && (
          <Card.Root bg="rgba(255, 0, 0, 0.1)" border="1px solid" borderColor="rgba(255, 0, 0, 0.3)">
            <Card.Body p={3}>
              <Text fontSize="sm" color="rgba(255, 255, 255, 0.9)">
                ❌ {error}
              </Text>
            </Card.Body>
          </Card.Root>
        )}

        <Text fontSize="xs" color="rgba(255, 255, 255, 0.5)" textAlign="center">
          💡 Tip: After selecting a location, click "Get Coordinates" to automatically fill in the fields below
        </Text>
      </VStack>
    </Box>
  )
}

export default LocationInput
