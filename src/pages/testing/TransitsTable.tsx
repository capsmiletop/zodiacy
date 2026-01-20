import React, { useState, useEffect, useMemo } from 'react'
import {
    Text,
    Spinner,
    Alert,
    VStack,
    Card,
    CardBody,
    CardHeader,
    Heading,
    HStack,
    Button,
    Input,
    NativeSelect,
    Box,
    Field,
    Collapsible,
    IconButton,
} from '@chakra-ui/react'
import { Transit, PeriodType, ALL_PLANETS } from './types'
import { FaChevronUp, FaEdit } from 'react-icons/fa'
import { generateMockTransits } from './utils'
import { fetchTemaNatale, fetchTransitiSpecifici } from '../../lib/api'
import { PeriodSelector } from './PeriodSelector'
import { PlanetSelector } from './PlanetSelector'
import { TransitsTableView } from './TransitsView'
import { TransitsMatrixTable } from './TransitsMatrixTable'
import { AspectSelector } from './AspectSelection'
import { TransitsTimeline } from './TransitsTimeline'

type ViewMode = 'matrix' | 'list' | 'timeline'

interface BirthData {
    name: string
    birthDate: string
    birthTime: string
    birthPlace: string
    latitude: number
    longitude: number
    timezone: number
}

export const TransitsTable: React.FC = () => {
    // Stati per i controlli
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [periodType, setPeriodType] = useState<PeriodType>('month')
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedPlanets, setSelectedPlanets] = useState<Set<string>>(
        new Set(['Plutone', 'Nettuno', 'Urano', 'Saturno', 'Giove'])
    )
    const [selectedAspects, setSelectedAspects] = useState<Set<string>>(
        new Set(['Congiunzione', 'Sestile', 'Quadratura', 'Trigono', 'Opposizione'])
    )
    const [viewMode, setViewMode] = useState<ViewMode>('timeline')

    // Stati per i dati di nascita
    const [showBirthForm, setShowBirthForm] = useState(true)
    const [natalChart, setNatalChart] = useState<any>(null)
    const [_, setRealTransitData] = useState<any>(null)
    const [birthData, setBirthData] = useState<BirthData>({
        name: '',
        birthDate: '',
        birthTime: '',
        birthPlace: '',
        latitude: 0,
        longitude: 0,
        timezone: 2
    })

    // Stati per i dati
    const [transits, setTransits] = useState<Transit[]>([])

    // Città predefinite italiane
    const predefinedCities = [
        { name: 'Roma', lat: 41.9028, lng: 12.4964, timezone: 2 },
        { name: 'Milano', lat: 45.4642, lng: 9.1900, timezone: 2 },
        { name: 'Napoli', lat: 40.8518, lng: 14.2681, timezone: 2 },
        { name: 'Torino', lat: 45.0703, lng: 7.6869, timezone: 2 },
        { name: 'Palermo', lat: 38.1157, lng: 13.3613, timezone: 2 },
        { name: 'Genova', lat: 44.4056, lng: 8.9463, timezone: 2 },
        { name: 'Bologna', lat: 44.4949, lng: 11.3426, timezone: 2 },
        { name: 'Firenze', lat: 43.7696, lng: 11.2558, timezone: 2 },
        { name: 'Bari', lat: 41.1171, lng: 16.8719, timezone: 2 },
        { name: 'Catania', lat: 37.5079, lng: 15.0830, timezone: 2 }
    ]

    // Calcola le date di inizio e fine
    const { startDate, endDate } = useMemo(() => {
        if (periodType === 'year') {
            return {
                startDate: `${selectedYear}-01-01`,
                endDate: `${selectedYear}-12-31`
            }
        } else {
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
            return {
                startDate: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`,
                endDate: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${daysInMonth}`
            }
        }
    }, [periodType, selectedYear, selectedMonth])

    // Handlers per i dati di nascita
    const handleInputChange = (field: keyof BirthData, value: string | number) => {
        setBirthData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleCitySelect = (cityName: string) => {
        const city = predefinedCities.find(c => c.name === cityName)
        if (city) {
            setBirthData(prev => ({
                ...prev,
                birthPlace: city.name,
                latitude: city.lat,
                longitude: city.lng,
                timezone: city.timezone
            }))
        }
    }

    // Calcola tema natale
    const handleCalculateNatalChart = async () => {
        if (!birthData.name || !birthData.birthDate || !birthData.birthTime) {
            setError('Inserisci tutti i campi obbligatori')
            return
        }

        if (!birthData.birthPlace || birthData.latitude === 0 || birthData.longitude === 0) {
            setError('Seleziona una città o inserisci le coordinate')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const birthDateTime = `${birthData.birthDate}T${birthData.birthTime}:00`

            const chartData = {
                name: birthData.name,
                birthDate: birthDateTime,
                birthPlace: birthData.birthPlace,
                latitude: birthData.latitude,
                longitude: birthData.longitude,
                timezone: birthData.timezone
            }

            console.log('Calculating natal chart with data:', chartData)
            const natalChart = await fetchTemaNatale(chartData.birthDate, chartData.latitude, chartData.longitude, chartData.timezone)
            console.log('Natal chart calculated:', natalChart)

            setNatalChart(natalChart)
            setShowBirthForm(false)

            // Calcola immediatamente i transiti
            await fetchRealTransits(natalChart)

        } catch (err) {
            console.error('Errore nel calcolo del tema natale:', err)
            setError('Errore nel calcolo del tema natale. Riprova.')
        } finally {
            setLoading(false)
        }
    }

    // Fetch transiti reali
    const fetchRealTransits = async (chart: any = natalChart) => {
        if (!chart?.pianeti) {
            setError('Tema natale non disponibile')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const dailyTransits: any = {}
            const start = new Date(startDate)
            const end = new Date(endDate)

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0]

                try {
                    const dayTransits = await fetchTransitiSpecifici(dateStr, chart)
                    dailyTransits[dateStr] = dayTransits
                } catch (err) {
                    console.warn(`Errore caricamento transiti per ${dateStr}:`, err)
                }
            }

            setRealTransitData(dailyTransits)

            // Converti in formato Transit[]
            const convertedTransits = convertRealDataToTransits(dailyTransits)
            setTransits(convertedTransits)

        } catch (err) {
            console.error('Errore nel caricamento dei transiti reali:', err)
            setError('Errore nel caricamento dei transiti reali')
        } finally {
            setLoading(false)
        }
    }

    // Converti dati reali
    const convertRealDataToTransits = (dailyTransits: any): Transit[] => {
        const transits: Transit[] = []

        Object.entries(dailyTransits).forEach(([dateStr, dayData]: [string, any]) => {
            if (dayData?.aspettiDiTransito && Array.isArray(dayData.aspettiDiTransito)) {
                dayData.aspettiDiTransito.forEach((aspectGroup: any) => {
                    if (!selectedPlanets.has(aspectGroup.transitPlanet)) return

                    if (aspectGroup.aspects && Array.isArray(aspectGroup.aspects)) {
                        aspectGroup.aspects.forEach((aspect: any) => {
                            if (!selectedAspects.has(aspect.type)) return

                            const orbValue = parseFloat(aspect.orb)

                            if (orbValue <= 3) {
                                transits.push({
                                    date: dateStr,
                                    planet: aspectGroup.transitPlanet,
                                    aspect: aspect.type,
                                    targetPlanet: aspectGroup.natalPlanet,
                                    orb: orbValue,
                                    isExact: orbValue <= 0.01,
                                    id: `${dateStr}-${aspectGroup.transitPlanet}-${aspect.type}-${aspectGroup.natalPlanet}`,
                                    house: "test" // Placeholder, da calcolare se necessario
                                })
                            }
                        })
                    }
                })
            }
        })

        return transits
    }

    // Fetch mock transiti (fallback)
    const fetchMockTransits = async () => {
        setLoading(true)
        setError(null)

        try {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const mockTransits = generateMockTransits(
                startDate,
                endDate,
                Array.from(selectedPlanets),
                Array.from(selectedAspects),
                periodType === 'month' ? 20 : 10
            )

            setTransits(mockTransits)
        } catch (err) {
            console.error('Errore nel caricamento dei transiti:', err)
            setError('Errore nel caricamento dei transiti')
        } finally {
            setLoading(false)
        }
    }

    // Effetto per ricaricare i dati
    useEffect(() => {
        if (selectedPlanets.size > 0) {
            if (natalChart) {
                fetchRealTransits()
            } else {
                fetchMockTransits()
            }
        }
    }, [periodType, selectedYear, selectedMonth, selectedPlanets, selectedAspects, startDate, endDate])

    // Filtra i transiti
    const filteredTransits = useMemo(() =>
        transits.filter(transit =>
            selectedPlanets.has(transit.planet) && selectedAspects.has(transit.aspect)
        ),
        [transits, selectedPlanets, selectedAspects]
    )

    // Handlers esistenti
    const handlePlanetToggle = (planet: string) => {
        const newSelected = new Set(selectedPlanets)
        if (newSelected.has(planet)) {
            newSelected.delete(planet)
        } else {
            newSelected.add(planet)
        }
        setSelectedPlanets(newSelected)
    }

    const handleSelectAllPlanets = () => setSelectedPlanets(new Set(ALL_PLANETS))
    const handleSelectNone = () => setSelectedPlanets(new Set())
    const handleSelectSlowPlanets = () =>
        setSelectedPlanets(new Set(['Plutone', 'Nettuno', 'Urano', 'Saturno', 'Giove']))

    const handleAspectToggle = (aspect: string) => {
        const newSelected = new Set(selectedAspects)
        if (newSelected.has(aspect)) {
            newSelected.delete(aspect)
        } else {
            newSelected.add(aspect)
        }
        setSelectedAspects(newSelected)
    }

    const handleSelectAllAspects = () =>
        setSelectedAspects(new Set(['Congiunzione', 'Sestile', 'Quadratura', 'Trigono', 'Opposizione']))

    const handleSelectNoAspects = () => setSelectedAspects(new Set())

    const handleSelectHarmoniousAspects = () =>
        setSelectedAspects(new Set(['Congiunzione', 'Sestile', 'Trigono']))

    const handleSelectTenseAspects = () =>
        setSelectedAspects(new Set(['Quadratura', 'Opposizione']))

    return (
        <VStack gap={6} align="stretch">
            {/* Sezione Dati di Nascita */}
            <Card.Root>
                <CardHeader>
                    <HStack justify="space-between" align="center">
                        <VStack align="start" gap={1}>
                            <Heading size="md">
                                🌟 {natalChart ? 'Tema Natale Calcolato' : 'Inserisci Dati di Nascita'}
                            </Heading>
                            {natalChart && birthData.name && (
                                <Text fontSize="sm" color="gray.600">
                                    📊 Analisi per {birthData.name} - {birthData.birthPlace}
                                </Text>
                            )}
                        </VStack>

                        {natalChart && (
                            <IconButton
                                size="sm"
                                variant="outline"
                                onClick={() => setShowBirthForm(!showBirthForm)}
                            >
                                {showBirthForm ? <FaChevronUp /> : <FaEdit />}
                            </IconButton>
                        )}
                    </HStack>
                </CardHeader>

                <Collapsible.Root open={showBirthForm || !natalChart}>
                    <Collapsible.Content>
                        <CardBody>
                            <VStack gap={4} align="stretch">
                                {/* Nome */}
                                <Field.Root required>
                                    <Field.Label>Nome</Field.Label>
                                    <Input
                                        placeholder="Il tuo nome"
                                        value={birthData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                    />
                                </Field.Root>

                                {/* Data e ora di nascita */}
                                <HStack gap={4} align="stretch">
                                    <Field.Root required flex="1">
                                        <Field.Label>Data di nascita</Field.Label>
                                        <Input
                                            type="date"
                                            value={birthData.birthDate}
                                            onChange={(e) => handleInputChange("birthDate", e.target.value)}
                                        />
                                    </Field.Root>

                                    <Field.Root required flex="1">
                                        <Field.Label>Ora di nascita</Field.Label>
                                        <Input
                                            type="time"
                                            value={birthData.birthTime}
                                            onChange={(e) => handleInputChange("birthTime", e.target.value)}
                                        />
                                    </Field.Root>
                                </HStack>

                                {/* Città predefinite */}

                                <Field.Root>
                                    <Field.Label htmlFor="city-select">Città (selezione rapida)</Field.Label>

                                    <NativeSelect.Root>
                                        <NativeSelect.Field
                                            id="city-select"
                                            value={birthData.birthPlace || ""}
                                            onChange={(e) => handleCitySelect(e.target.value)}
                                            aria-label="Seleziona una città italiana"
                                        >
                                            {/* placeholder nativo */}
                                            <option value="" disabled hidden>
                                                Seleziona una città italiana
                                            </option>

                                            {predefinedCities.map((city) => (
                                                <option key={city.name} value={city.name}>
                                                    {city.name}
                                                </option>
                                            ))}
                                        </NativeSelect.Field>

                                        <NativeSelect.Indicator />
                                    </NativeSelect.Root>

                                    <Field.HelperText>
                                        Puoi scegliere una città dalla lista o inserirla manualmente.
                                    </Field.HelperText>
                                </Field.Root>

                                {/* Coordinate manuali */}
                                <VStack gap={3} align="stretch">
                                    <Field.Root>
                                        <Field.Label>Luogo di nascita</Field.Label>
                                        <Input
                                            placeholder="Città, Paese"
                                            value={birthData.birthPlace}
                                            onChange={(e) => handleInputChange("birthPlace", e.target.value)}
                                        />
                                    </Field.Root>

                                    <HStack gap={4} align="stretch">
                                        <Field.Root>
                                            <Field.Label>Latitudine</Field.Label>
                                            <Input
                                                type="number"
                                                step="0.0001"
                                                placeholder="es. 41.9028"
                                                value={birthData.latitude?.toString() || ""}
                                                onChange={(e) =>
                                                    handleInputChange("latitude", parseFloat(e.target.value) || 0)
                                                }
                                            />
                                        </Field.Root>

                                        <Field.Root>
                                            <Field.Label>Longitudine</Field.Label>
                                            <Input
                                                type="number"
                                                step="0.0001"
                                                placeholder="es. 12.4964"
                                                value={birthData.longitude?.toString() || ""}
                                                onChange={(e) =>
                                                    handleInputChange("longitude", parseFloat(e.target.value) || 0)
                                                }
                                            />
                                        </Field.Root>
                                    </HStack>
                                </VStack>


                                {/* Coordinate selezionate */}
                                {(birthData.latitude !== 0 || birthData.longitude !== 0) && (
                                    <Box p={3} bg="blue.50" borderRadius="md">
                                        <Text fontSize="sm" fontWeight="medium">
                                            📍 Coordinate: {birthData.latitude.toFixed(4)}, {birthData.longitude.toFixed(4)}
                                        </Text>
                                        <Text fontSize="xs" color="gray.600">
                                            {birthData.birthPlace} - {birthData.timezone}
                                        </Text>
                                    </Box>
                                )}

                                {/* Pulsante calcola */}
                                <Button
                                    colorScheme="blue"
                                    size="lg"
                                    onClick={handleCalculateNatalChart}
                                    loading={loading}
                                    loadingText="Calcolando..."
                                    disabled={!birthData.name || !birthData.birthDate || !birthData.birthTime}
                                >
                                    🔮 {natalChart ? 'Ricalcola Tema Natale' : 'Calcola Tema Natale'}
                                </Button>
                            </VStack>
                        </CardBody>
                    </Collapsible.Content>
                </Collapsible.Root>
            </Card.Root>
            {/* Controlli superiori */}
            <Card.Root>
                <CardBody>
                    <VStack gap={4} align="stretch">
                        <HStack justify="space-between" align="center">
                            <Heading size="md">Configurazione Transiti</Heading>

                            {/* Switcher visualizzazione */}
                            <HStack gap={2}>
                                <Button
                                    size="sm"
                                    variant={viewMode === 'matrix' ? 'solid' : 'outline'}
                                    colorScheme="blue"
                                    onClick={() => setViewMode('matrix')}
                                >
                                    Matrice
                                </Button>
                                <Button
                                    size="sm"
                                    variant={viewMode === 'list' ? 'solid' : 'outline'}
                                    colorScheme="blue"
                                    onClick={() => setViewMode('list')}
                                >
                                    Lista
                                </Button>
                                <Button
                                    size="sm"
                                    variant={viewMode === 'timeline' ? 'solid' : 'outline'}
                                    colorScheme="green"
                                    onClick={() => setViewMode('timeline')}
                                >
                                    Timeline
                                </Button>
                            </HStack>
                        </HStack>

                        {/* Controlli periodo */}
                        <PeriodSelector
                            periodType={periodType}
                            selectedYear={selectedYear}
                            selectedMonth={selectedMonth}
                            startDate={startDate}
                            endDate={endDate}
                            onPeriodTypeChange={setPeriodType}
                            onYearChange={setSelectedYear}
                            onMonthChange={setSelectedMonth}
                        />

                        {/* Selezione pianeti */}
                        <PlanetSelector
                            selectedPlanets={selectedPlanets}
                            onPlanetToggle={handlePlanetToggle}
                            onSelectAll={handleSelectAllPlanets}
                            onSelectNone={handleSelectNone}
                            onSelectSlowPlanets={handleSelectSlowPlanets}
                        />

                        <AspectSelector
                            selectedAspects={selectedAspects}
                            onAspectToggle={handleAspectToggle}
                            onSelectAll={handleSelectAllAspects}
                            onSelectNone={handleSelectNoAspects}
                            onSelectHarmonious={handleSelectHarmoniousAspects}
                            onSelectTense={handleSelectTenseAspects}
                        />
                    </VStack>
                </CardBody>
            </Card.Root>

            {/* Stato di caricamento */}
            {loading && (
                <Card.Root>
                    <CardBody>
                        <VStack gap={4} align="center" py={8}>
                            <Spinner size="lg" />
                            <Text>Caricamento transiti...</Text>
                            <Text fontSize="sm" color="gray.600">
                                Calcolo delle posizioni planetarie per {selectedPlanets.size} pianeti
                            </Text>
                        </VStack>
                    </CardBody>
                </Card.Root>
            )}

            {/* Errore */}
            {error && (
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Title>{error}</Alert.Title>
                </Alert.Root>
            )}

            {/* Tabella dei transiti */}
            {!loading && !error && (
                <Card.Root>
                    <CardBody p={viewMode === 'matrix' ? 2 : 4}>
                        {viewMode === 'matrix' && (
                            <TransitsMatrixTable
                                transits={filteredTransits}
                                periodType={periodType}
                                startDate={startDate}
                                endDate={endDate}
                                selectedPlanets={selectedPlanets}
                                selectedAspects={selectedAspects}
                            />
                        )}
                        {viewMode === 'timeline' && (
                            <TransitsTimeline
                                transits={filteredTransits}
                                periodType={periodType}
                                startDate={startDate}
                                endDate={endDate}
                                selectedPlanets={selectedPlanets}
                                selectedAspects={selectedAspects}
                            />
                        )}
                        {viewMode === 'list' && (
                            <TransitsTableView
                                transits={filteredTransits}
                            />
                        )}
                    </CardBody>
                </Card.Root>
            )}
        </VStack>
    )
}