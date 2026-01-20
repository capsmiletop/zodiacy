import React, { useMemo, useEffect, useState } from 'react'
import {
    Box,
    Table,
    Text,
    Card,
    VStack,
    HStack,
    Textarea,
    Spinner,
    Button,
    ButtonGroup,
} from '@chakra-ui/react'
import { fetchTransitiSpecifici } from '../lib/api'

// Simboli astrologici
const PLANET_SYMBOLS = {
    'Sole': '☉',
    'Luna': '☽',
    'Mercurio': '☿',
    'Venere': '♀',
    'Marte': '♂',
    'Giove': '♃',
    'Saturno': '♄',
    'Urano': '♅',
    'Nettuno': '♆',
    'Plutone': '♇',
    'Chirone': '⚷',
    'Lilith': '⚸',
    'Nodo Nord': '☊',
    'Nodo Sud': '☋'
} as const

const SIGN_SYMBOLS = {
    'Ariete': '♈︎',
    'Toro': '♉︎',
    'Gemelli': '♊︎',
    'Cancro': '♋︎',
    'Leone': '♌︎',
    'Vergine': '♍︎',
    'Bilancia': '♎︎',
    'Scorpione': '♏︎',
    'Sagittario': '♐︎',
    'Capricorno': '♑︎',
    'Acquario': '♒︎',
    'Pesci': '♓︎',
    'Null': '○' // Simbolo per pianeti senza dati
} as const

const ASPECT_SYMBOLS = {
    'Congiunzione': '☌',
    'Sestile': '⚹',
    'Trigono': '△',
    'Quadratura': '□',
    'Opposizione': '☍'
} as const

// Ordine fisso dei pianeti per la tabella
const PLANET_ORDER = [
    'Plutone', 'Nettuno', 'Urano', 'Saturno', 'Giove',
    'Marte', 'Venere', 'Mercurio', 'Luna', 'Nodo Nord', 'Lilith', 'Chirone'
]

interface TransitTableProps {
    userName?: string
    startDate: string
    endDate: string
    natalChart: any
    onNotesChange?: (planetName: string, notes: string) => void
}

interface TransitData {
    planet: string
    houses: string[]
    aspects: AspectData[]
    notes: string
}

interface AspectData {
    type: string
    targetPlanet: string
    targetSign: string
    targetHouse: number
    periods: {
        startDate: string
        endDate: string
        exactDates: string[]
        isExact: boolean
        orbValues: number[]
    }[]
    // Proprietà di compatibilità per il codice esistente
    startDate: string
    endDate: string
    exactDates: string[]
    isExact: boolean
    orbValues: number[]
}

type ViewMode = 'table' | 'timeline'

/**
 * Componente per visualizzare la tabella dinamica dei transiti
 * Mostra i transiti planetari con aspetti, case e durate
 */
export default function TransitTable({
    userName = "Utente",
    startDate,
    endDate,
    natalChart,
    onNotesChange
}: TransitTableProps) {

    // State per i dati dei transiti calcolati
    const [transitData, setTransitData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [viewMode, setViewMode] = useState<ViewMode>('table')

    // Effetto per caricare i dati dei transiti quando cambiano le date o il tema natale
    useEffect(() => {
        const loadTransitData = async () => {
            if (!natalChart?.pianeti) {
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setError(null)

            try {
                // Calcoliamo i transiti per ogni giorno nel periodo specificato
                const dailyTransits: any = {}
                const start = new Date(startDate)
                const end = new Date(endDate)

                // Iteriamo giorno per giorno
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0] // YYYY-MM-DD format

                    try {
                        const dayTransits = await fetchTransitiSpecifici(dateStr, natalChart)
                        dailyTransits[dateStr] = dayTransits
                    } catch (err) {
                        console.warn(`Errore caricamento transiti per ${dateStr}:`, err)
                    }
                }

                setTransitData(dailyTransits)
            } catch (err) {
                console.error('Errore nel caricamento dei transiti:', err)
                setError('Errore nel caricamento dei transiti')
            } finally {
                setIsLoading(false)
            }
        }

        loadTransitData()
    }, [startDate, endDate, natalChart])

    // Calcola i dati dei transiti dal dataset giornaliero
    const processedTransitData = useMemo(() => {
        //console.log('TransitTable - transitData:', transitData)
        //console.log('TransitTable - natalChart:', natalChart)

        if (!transitData || !natalChart?.pianeti) {
            // Se non abbiamo dati, mostra comunque la struttura vuota
            return PLANET_ORDER.map(planetName => ({
                planet: planetName,
                houses: [],
                aspects: [],
                notes: ''
            }))
        }

        return PLANET_ORDER.map(planetName => {
            const planetData = calculatePlanetTransitsFromDaily(planetName, transitData, natalChart)
            //console.log(`TransitTable - ${planetName}:`, planetData)

            return {
                planet: planetName,
                houses: planetData.houses,
                aspects: planetData.aspects,
                notes: ''
            }
        })
    }, [transitData, natalChart])

    // Genera le colonne dinamiche basate sul periodo
    const timeColumns = useMemo(() => {
        return generateTimeColumns(startDate, endDate)
    }, [startDate, endDate])

    const dailyColumns = useMemo(() => {
        if (viewMode !== 'timeline') return []

        const columns = []
        const start = new Date(startDate)
        const end = new Date(endDate)

        const current = new Date(start)
        while (current <= end) {
            columns.push({
                date: current.toISOString().split('T')[0],
                day: current.getDate(),
                month: current.toLocaleDateString('it-IT', { month: 'short' }),
                isWeekend: [0, 6].includes(current.getDay())
            })
            current.setDate(current.getDate() + 1)
        }

        return columns
    }, [startDate, endDate, viewMode])

    // Mostra loading durante il caricamento
    if (isLoading) {
        return (
            <Card.Root w="full" maxW="100%" overflow="auto" variant="elevated">
                <Card.Body>
                    <VStack gap={4} align="center" py={8}>
                        <Spinner size="lg" />
                        <Text>Caricamento transiti in corso...</Text>
                        <Text fontSize="sm" color="gray.600">
                            Calcolo delle posizioni planetarie dal {startDate} al {endDate}
                        </Text>
                    </VStack>
                </Card.Body>
            </Card.Root>
        )
    }

    // Mostra errore se presente
    if (error) {
        return (
            <Card.Root w="full" maxW="100%" overflow="auto" variant="elevated">
                <Card.Body>
                    <VStack gap={4} align="center" py={8}>
                        <Text color="red.500" fontSize="lg">Errore nel caricamento</Text>
                        <Text color="red.400">{error}</Text>
                        <Text fontSize="sm" color="gray.600">
                            Controlla la connessione di rete e riprova
                        </Text>
                    </VStack>
                </Card.Body>
            </Card.Root>
        )
    }

    return (
        <Card.Root w="full" maxW="100%" overflow="auto" variant="elevated">
            <Card.Header>
                <VStack align="start" gap={3}>
                    <HStack justify="space-between" w="full">
                        <Text fontSize="xl" fontWeight="bold" color="blue.700">
                            📊 Tabella Transiti Planetari
                        </Text>
                        <HStack gap={4}>
                            {/* NUOVO: Toggle per modalità visualizzazione */}
                            <ButtonGroup size="sm" variant="outline">
                                <Button
                                    colorScheme={viewMode === 'table' ? 'blue' : 'gray'}
                                    variant={viewMode === 'table' ? 'solid' : 'outline'}
                                    onClick={() => setViewMode('table')}
                                >
                                    📋 Tabella
                                </Button>
                                <Button
                                    colorScheme={viewMode === 'timeline' ? 'green' : 'gray'}
                                    variant={viewMode === 'timeline' ? 'solid' : 'outline'}
                                    onClick={() => setViewMode('timeline')}
                                >
                                    📊 Timeline
                                </Button>
                            </ButtonGroup>

                            <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                {userName}
                            </Text>
                        </HStack>
                    </HStack>
                    <Text fontSize="md" color="gray.700">
                        Periodo: {formatDate(startDate)} - {formatDate(endDate)}
                        {viewMode === 'timeline' && (
                            <Text as="span" fontSize="sm" color="gray.500" ml={2}>
                                • {dailyColumns.length} giorni
                            </Text>
                        )}
                    </Text>
                    <HStack gap={4} fontSize="xs" color="gray.500">
                        <Text>♈♌♐ Fuoco</Text>
                        <Text>♉♍♑ Terra</Text>
                        <Text>♊♎♒ Aria</Text>
                        <Text>♋♏♓ Acqua</Text>
                    </HStack>
                </VStack>
            </Card.Header>

            <Card.Body p={0}>
                <Box
                    overflowX="auto"
                    w="full"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                >
                    {/* CONDIZIONALE: Renderizza tabella o timeline */}
                    {viewMode === 'table' ? (
                        <TransitTableView
                            processedTransitData={processedTransitData}
                            timeColumns={timeColumns}
                            onNotesChange={onNotesChange}
                        />
                    ) : (
                        <TransitTimelineView
                            processedTransitData={processedTransitData}
                            dailyColumns={dailyColumns}
                            transitData={transitData}
                        />
                    )}
                </Box>
            </Card.Body>
        </Card.Root>
    )
}

// Componente per una singola riga di transito
function TransitRow({
    transit,
    timeColumns,
    rowIndex,
    onNotesChange
}: {
    transit: TransitData
    timeColumns: any[]
    rowIndex: number
    onNotesChange?: (planetName: string, notes: string) => void
}) {
    const maxAspects = Math.max(1, transit.aspects.length)

    return (
        <>
            {Array.from({ length: maxAspects }, (_, aspectIndex) => (
                <Table.Row key={`${transit.planet}-${aspectIndex}`} bg={rowIndex % 2 === 0 ? 'gray.50' : 'white'}>
                    {/* Colonna Pianeta - solo per la prima riga del pianeta */}
                    {aspectIndex === 0 && (
                        <Table.Cell
                            rowSpan={maxAspects}
                            position="sticky"
                            left={0}
                            bg={rowIndex % 2 === 0 ? 'gray.50' : 'white'}
                            zIndex={1}
                            borderRight="2px solid"
                            borderColor="gray.300"
                            minH="60px"
                            p={3}
                            verticalAlign="middle"
                        >
                            <HStack>
                                <Text fontSize="lg">
                                    {PLANET_SYMBOLS[transit.planet as keyof typeof PLANET_SYMBOLS] || '○'}
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                    {transit.planet}
                                </Text>
                            </HStack>
                        </Table.Cell>
                    )}

                    {/* Colonna Casa - solo per la prima riga del pianeta */}
                    {aspectIndex === 0 && (
                        <Table.Cell
                            rowSpan={maxAspects}
                            position="sticky"
                            left="120px"
                            bg={rowIndex % 2 === 0 ? 'gray.50' : 'white'}
                            zIndex={1}
                            borderRight="2px solid"
                            borderColor="gray.300"
                            minH="60px"
                            p={3}
                            verticalAlign="middle"
                        >
                            <VStack align="start" gap={1}>
                                {transit.houses.length > 0 ? (
                                    transit.houses.map((house, hIndex) => (
                                        <Text
                                            key={hIndex}
                                            fontSize="sm"
                                            fontWeight="medium"
                                            color={house.includes('(natale)') ? 'purple.700' : 'blue.700'}
                                            px={2}
                                            py={1}
                                            bg={house.includes('(natale)') ? 'purple.50' : 'blue.50'}
                                            borderRadius="md"
                                            border="1px solid"
                                            borderColor={house.includes('(natale)') ? 'purple.200' : 'blue.200'}
                                            title={house.includes('(natale)') ? 'Casa natale' : 'Casa di transito'}
                                        >
                                            {house}
                                        </Text>
                                    ))
                                ) : (
                                    <Text fontSize="xs" color="gray.400" fontStyle="italic">
                                        N/A
                                    </Text>
                                )}
                            </VStack>
                        </Table.Cell>
                    )}

                    {/* Colonna Aspetto */}
                    <Table.Cell
                        position="sticky"
                        left="220px"
                        bg={rowIndex % 2 === 0 ? 'gray.50' : 'white'}
                        zIndex={1}
                        borderRight="2px solid"
                        borderColor="gray.300"
                        w="100px"
                        minH="60px"
                        p={3}
                        verticalAlign="middle"
                    >
                        {transit.aspects[aspectIndex] && (
                            <VStack align="start" gap={0}>
                                <HStack gap={1}>
                                    <Text fontSize="lg" color={getAspectColor(transit.aspects[aspectIndex].type)}>
                                        {ASPECT_SYMBOLS[transit.aspects[aspectIndex].type as keyof typeof ASPECT_SYMBOLS] || '○'}
                                    </Text>
                                    <Text fontSize="xs" color="gray.700">
                                        {PLANET_SYMBOLS[transit.aspects[aspectIndex].targetPlanet as keyof typeof PLANET_SYMBOLS] || transit.aspects[aspectIndex].targetPlanet}
                                    </Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.500">
                                    <Text as="span" color={getSignColor(transit.aspects[aspectIndex].targetSign)}>
                                        {SIGN_SYMBOLS[transit.aspects[aspectIndex].targetSign as keyof typeof SIGN_SYMBOLS] || transit.aspects[aspectIndex].targetSign}
                                    </Text>
                                    {' '}
                                    <Text as="span" color="gray.600">
                                        {transit.aspects[aspectIndex].targetHouse}ª
                                    </Text>
                                </Text>
                            </VStack>
                        )}
                    </Table.Cell>

                    {/* Colonne temporali */}
                    {timeColumns.map((col, colIndex) => (
                        <Table.Cell key={colIndex} textAlign="center" position="relative" h="60px" minH="60px">
                            {transit.aspects[aspectIndex] && (
                                <AspectTimeline
                                    aspect={transit.aspects[aspectIndex]}
                                    timeColumn={col}
                                />
                            )}
                        </Table.Cell>
                    ))}

                    {/* Colonna Note - solo per la prima riga del pianeta */}
                    {aspectIndex === 0 && (
                        <Table.Cell
                            rowSpan={maxAspects}
                            position="sticky"
                            right={0}
                            bg={rowIndex % 2 === 0 ? 'gray.50' : 'white'}
                            zIndex={1}
                            borderLeft="2px solid"
                            borderColor="gray.300"
                            minH="60px"
                            p={3}
                            verticalAlign="middle"
                        >
                            <Textarea
                                placeholder="Note personali..."
                                size="sm"
                                value={transit.notes}
                                onChange={(e) => onNotesChange?.(transit.planet, e.target.value)}
                                resize="none"
                                rows={2}
                            />
                        </Table.Cell>
                    )}
                </Table.Row>
            ))}
        </>
    )
}

function TransitTableView({
    processedTransitData,
    timeColumns,
    onNotesChange
}: {
    processedTransitData: TransitData[]
    timeColumns: any[]
    onNotesChange?: (planetName: string, notes: string) => void
}) {
    return (
        <Table.Root
            size="sm"
            variant="outline"
            style={{ minWidth: `${Math.max(800, timeColumns.length * 80)}px` }}
        >
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader
                        w="120px"
                        position="sticky"
                        left={0}
                        bg="white"
                        zIndex={2}
                        borderRight="2px solid"
                        borderColor="gray.300"
                        minH="50px"
                        p={3}
                    >
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                            Pianeta in transito
                        </Text>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                        w="100px"
                        position="sticky"
                        left="120px"
                        bg="white"
                        zIndex={2}
                        borderRight="2px solid"
                        borderColor="gray.300"
                        minH="50px"
                        p={3}
                    >
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                            Casa Natale
                        </Text>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                        w="100px"
                        position="sticky"
                        left="220px"
                        bg="white"
                        zIndex={2}
                        borderRight="2px solid"
                        borderColor="gray.300"
                        minH="50px"
                        p={3}
                    >
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                            Aspetto
                        </Text>
                    </Table.ColumnHeader>
                    {timeColumns.map((col, index) => (
                        <Table.ColumnHeader
                            key={index}
                            w="80px"
                            textAlign="center"
                            borderRight="1px solid"
                            borderColor="gray.200"
                            minH="50px"
                            p={2}
                            bg="gray.50"
                        >
                            <VStack gap={0}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.700">
                                    {col.month}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    {col.year}
                                </Text>
                            </VStack>
                        </Table.ColumnHeader>
                    ))}
                    <Table.ColumnHeader
                        w="200px"
                        position="sticky"
                        right={0}
                        bg="white"
                        zIndex={2}
                        borderLeft="2px solid"
                        borderColor="gray.300"
                        minH="50px"
                        p={3}
                    >
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                            Note
                        </Text>
                    </Table.ColumnHeader>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {processedTransitData.map((transit, rowIndex) => (
                    <TransitRow
                        key={transit.planet}
                        transit={transit}
                        timeColumns={timeColumns}
                        rowIndex={rowIndex}
                        onNotesChange={onNotesChange}
                    />
                ))}
            </Table.Body>
        </Table.Root>
    )
}

function TimelineAspectRow({
    aspect,
    dailyColumns,
    transitData
}: {
    aspect: AspectData
    dailyColumns: any[]
    transitData: any
}) {
    // Convertiamo i periodi di AspectData nel formato simile a TransitsTimeline
    console.log(transitData[0])
    const convertedPeriods = useMemo(() => {
        return aspect.periods.map(period => {

            // Trova gli indici corrispondenti nelle colonne giornaliere
            const dailyColsArr = Array.isArray(dailyColumns) ? dailyColumns : []
            const startIndex = dailyColsArr.findIndex(col => col.date === period.startDate)
            const endIndex = dailyColsArr.findIndex(col => col.date === period.endDate)

            // Trova il picco (giorno con orb minimo)
            let peakIndex = startIndex
            let peakOrb = period.orbValues[0] || 999

            period.orbValues.forEach((orb, dayOffset) => {
                if (orb < peakOrb) {
                    peakOrb = orb
                    peakIndex = startIndex + dayOffset
                }
            })

            // Trova i periodi esatti
            const exactPeriods: Array<{ startIndex: number, endIndex: number }> = []
            let exactStart = -1

            period.orbValues.forEach((orb, dayOffset) => {
                const currentIndex = startIndex + dayOffset
                const isExact = orb <= 0.01

                if (isExact && exactStart === -1) {
                    exactStart = currentIndex
                } else if (!isExact && exactStart !== -1) {
                    exactPeriods.push({ startIndex: exactStart, endIndex: currentIndex - 1 })
                    exactStart = -1
                }
            })

            // Chiudi l'ultimo periodo esatto se necessario
            if (exactStart !== -1) {
                exactPeriods.push({ startIndex: exactStart, endIndex: endIndex })
            }

            return {
                startIndex: Math.max(0, startIndex),
                endIndex: Math.min(dailyColumns.length - 1, endIndex),
                startDate: period.startDate,
                endDate: period.endDate,
                exactPeriods,
                peakIndex: Math.max(0, Math.min(dailyColumns.length - 1, peakIndex)),
                peakOrb,
                targetPlanet: aspect.targetPlanet
            }
        }).filter(p => p.startIndex >= 0 && p.endIndex >= 0)
    }, [aspect, dailyColumns])

    const getAspectColor = (aspectType: string) => {
        const colors = {
            'Congiunzione': '#F6E05E',
            'Sestile': '#48BB78',
            'Trigono': '#4299E1',
            'Quadratura': '#F56565',
            'Opposizione': '#9F7AEA'
        }
        return colors[aspectType as keyof typeof colors] || '#A0AEC0'
    }

    const aspectColor = getAspectColor(aspect.type)

    return (
        <Box position="relative" w="full" h="full">
            <svg width="100%" height="40" style={{ overflow: 'visible' }}>
                {/* Linea di base */}
                <line
                    x1="0"
                    y1="20"
                    x2="100%"
                    y2="20"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                />

                {/* Periodi di transito */}
                {convertedPeriods.map((period, periodIndex) => {
                    const startX = (period.startIndex / (dailyColumns.length - 1)) * 100
                    const endX = (period.endIndex / (dailyColumns.length - 1)) * 100
                    const peakX = (period.peakIndex / (dailyColumns.length - 1)) * 100

                    return (
                        <g key={periodIndex}>
                            {/* Linea principale del transito */}
                            <line
                                x1={`${startX}%`}
                                y1="20"
                                x2={`${endX}%`}
                                y2="20"
                                stroke={aspectColor}
                                strokeWidth="4"
                                opacity="0.6"
                            />

                            {/* Segmenti esatti in nero */}
                            {period.exactPeriods.map((exactPeriod, exactIndex) => {
                                const exactStartX = (exactPeriod.startIndex / (dailyColumns.length - 1)) * 100
                                const exactEndX = (exactPeriod.endIndex / (dailyColumns.length - 1)) * 100

                                return (
                                    <line
                                        key={exactIndex}
                                        x1={`${exactStartX}%`}
                                        y1="20"
                                        x2={`${exactEndX}%`}
                                        y2="20"
                                        stroke="black"
                                        strokeWidth="6"
                                    />
                                )
                            })}

                            {/* Punto di inizio */}
                            <circle
                                cx={`${startX}%`}
                                cy="20"
                                r="4"
                                fill={aspectColor}
                                stroke="green"
                                strokeWidth="2"
                                style={{ cursor: 'pointer' }}
                            >
                                <title>
                                    🟢 Inizio {aspect.type} {aspect.targetPlanet} - {new Date(period.startDate).toLocaleDateString('it-IT')}
                                </title>
                            </circle>

                            {/* Punto di picco (orb minimo) */}
                            <circle
                                cx={`${peakX}%`}
                                cy="20"
                                r="6"
                                fill={aspectColor}
                                stroke="gold"
                                strokeWidth="3"
                                style={{ cursor: 'pointer' }}
                            >
                                <title>
                                    🎯 Picco {aspect.type} {aspect.targetPlanet} - {new Date(dailyColumns[period.peakIndex]?.date || period.startDate).toLocaleDateString('it-IT')} - Orb: {period.peakOrb.toFixed(1)}°
                                </title>
                            </circle>

                            {/* Punto di fine */}
                            <circle
                                cx={`${endX}%`}
                                cy="20"
                                r="4"
                                fill={aspectColor}
                                stroke="red"
                                strokeWidth="2"
                                style={{ cursor: 'pointer' }}
                            >
                                <title>
                                    🔴 Fine {aspect.type} {aspect.targetPlanet} - {new Date(period.endDate).toLocaleDateString('it-IT')}
                                </title>
                            </circle>

                            {/* Simbolo del pianeta target sotto il picco */}
                            <text
                                x={`${peakX}%`}
                                y="34"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize="10"
                                fontWeight="bold"
                                fill="#2D3748"
                                style={{
                                    userSelect: 'none',
                                    pointerEvents: 'none'
                                }}
                            >
                                {PLANET_SYMBOLS[period.targetPlanet as keyof typeof PLANET_SYMBOLS] || period.targetPlanet.charAt(0)}
                            </text>
                        </g>
                    )
                })}
            </svg>
        </Box>
    )
}


function TransitTimelineView({
    processedTransitData,
    dailyColumns,
    transitData
}: {
    processedTransitData: TransitData[]
    dailyColumns: any[]
    transitData: any
}) {
    const aspectsPerPlanet = 5 // Numero massimo di aspetti da mostrare per pianeta

    return (
        <Table.Root
            size="sm"
            variant="outline"
            left="10px"
        >
            <Table.Header>
                <Table.Row>
                    {/* Colonna Pianeta */}
                    <Table.ColumnHeader
                        w="120px"
                        position="sticky"
                        left={0}
                        bg="white"
                        zIndex={2}
                        borderRight="2px solid"
                        borderColor="gray.300"
                        minH="80px"
                        p={3}
                        textAlign='center'
                    >
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                            Pianeta
                        </Text>
                    </Table.ColumnHeader>

                    {/* Colonna Aspetto */}
                    <Table.ColumnHeader
                        w="120px"
                        position="sticky"
                        bg="white"
                        zIndex={2}
                        borderRight="2px solid"
                        borderColor="gray.300"
                        minH="80px"
                        p={3}
                        textAlign='center'
                    >
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                            Aspetto
                        </Text>
                    </Table.ColumnHeader>

                    {/* Header Timeline con mesi invece di giorni */}
                    <Table.ColumnHeader
                        position="relative"
                        borderRight="1px solid"
                        borderColor="gray.200"
                        minH="80px"
                        p={2}
                        bg="gray.50"
                    >
                        <VStack gap={2} align="stretch">
                            <Text fontSize="sm" fontWeight="bold" textAlign="center">
                                Timeline Mensile
                            </Text>

                            {/* Date di inizio e fine */}
                            <HStack justify="space-between" w="full" mb={2}>
                                <Text fontSize="xs" fontWeight="bold" color="gray.600">
                                    {dailyColumns[0] ? new Date(dailyColumns[0].date).toLocaleDateString('it-IT') : ''}
                                </Text>
                                <Text fontSize="xs" fontWeight="bold" color="gray.600">
                                    {dailyColumns[dailyColumns.length - 1] ? new Date(dailyColumns[dailyColumns.length - 1].date).toLocaleDateString('it-IT') : ''}
                                </Text>
                            </HStack>

                            {/* Griglia temporale con mesi */}
                            <Box position="relative" h="40px" bg="gray.50" borderRadius="md" p={2}>
                                {/* Genera i marcatori dei mesi */}
                                {dailyColumns.reduce((months: any[], col, index) => {
                                    const currentMonth = new Date(col.date).getMonth()
                                    const currentYear = new Date(col.date).getFullYear()

                                    // Controlla se è il primo giorno del mese o il primo elemento
                                    const isFirstOfMonth = new Date(col.date).getDate() === 1 || index === 0

                                    if (isFirstOfMonth) {
                                        const xPosition = (index / (dailyColumns.length - 1)) * 100
                                        const monthName = new Date(col.date).toLocaleDateString('it-IT', {
                                            month: 'short'
                                        })

                                        months.push(
                                            <Box
                                                key={`${currentYear}-${currentMonth}`}
                                                position="absolute"
                                                left={`${xPosition}%`}
                                                transform="translateX(-50%)"
                                                textAlign="center"
                                            >
                                                <Box
                                                    w="2px"
                                                    h="20px"
                                                    bg="blue.400"
                                                    mx="auto"
                                                />
                                                <Text
                                                    fontSize="xs"
                                                    color="blue.600"
                                                    fontWeight="bold"
                                                    mt={1}
                                                >
                                                    {monthName}
                                                </Text>
                                                {/* Mostra l'anno solo per gennaio o primo mese */}
                                                {(currentMonth === 0 || index === 0) && (
                                                    <Text
                                                        fontSize="xs"
                                                        color="gray.500"
                                                        fontWeight="normal"
                                                    >
                                                        {currentYear}
                                                    </Text>
                                                )}
                                            </Box>
                                        )
                                    }

                                    return months
                                }, [])}
                            </Box>
                        </VStack>
                    </Table.ColumnHeader>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {processedTransitData.map((transit, planetIndex) => {
                    const maxAspects = Math.max(1, Math.min(aspectsPerPlanet, transit.aspects.length))

                    return (
                        <React.Fragment key={transit.planet}>
                            {/* Separatore tra pianeti */}
                            {planetIndex > 0 && (
                                <Table.Row>
                                    <Table.Cell
                                        colSpan={3}
                                        p={0}
                                        bg="gray.200"
                                        h="4px"
                                    />
                                </Table.Row>
                            )}

                            {Array.from({ length: maxAspects }, (_, aspectIndex) => (
                                <Table.Row
                                    key={`${transit.planet}-${aspectIndex}`}
                                    bg={planetIndex % 2 === 0 ? 'white' : 'blue.25'}
                                    _hover={{
                                        bg: planetIndex % 2 === 0 ? 'gray.50' : 'blue.50'
                                    }}
                                >
                                    {/* Colonna Pianeta - solo per la prima riga */}
                                    {aspectIndex === 0 && (
                                        <Table.Cell
                                            rowSpan={maxAspects}
                                            position="sticky"
                                            left={0}
                                            bg={planetIndex % 2 === 0 ? 'white' : 'blue.25'}
                                            zIndex={1}
                                            borderRight="2px solid"
                                            borderRightColor="gray.300"
                                            minH="40px"
                                            p={3}
                                            verticalAlign="middle"
                                            textAlign="center"
                                            w="120px"

                                        >
                                            <VStack gap={2}>
                                                <Box
                                                    p={2}
                                                    borderRadius="full"
                                                    bg={planetIndex % 2 === 0 ? "blue.100" : "white"}
                                                    border="2px solid"
                                                    borderColor="blue.300"
                                                >
                                                    <Text fontSize="xl" fontWeight="bold">
                                                        {PLANET_SYMBOLS[transit.planet as keyof typeof PLANET_SYMBOLS] || '○'}
                                                    </Text>
                                                </Box>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="bold"
                                                    color="blue.700"
                                                >
                                                    {transit.planet}
                                                </Text>
                                            </VStack>
                                        </Table.Cell>
                                    )}

                                    {/* Colonna Aspetto */}
                                    <Table.Cell
                                        position="sticky"
                                        left="120px"
                                        bg={planetIndex % 2 === 0 ? 'white' : 'blue.25'}
                                        zIndex={1}
                                        borderRight="2px solid"
                                        borderRightColor="gray.300"
                                        minH="40px"
                                        p={2}
                                        verticalAlign="middle"
                                        textAlign="center"
                                        w="120px"
                                    >
                                        {transit.aspects[aspectIndex] && (
                                            <VStack gap={0}>
                                                <HStack gap={1} justify="center">
                                                    <Text fontSize="lg" fontWeight="bold" color={getAspectColor(transit.aspects[aspectIndex].type)}>
                                                        {ASPECT_SYMBOLS[transit.aspects[aspectIndex].type as keyof typeof ASPECT_SYMBOLS]}
                                                    </Text>
                                                    <Text fontSize="xs" fontWeight="medium">
                                                        {transit.aspects[aspectIndex].type}
                                                    </Text>
                                                </HStack>
                                                <HStack gap={1} justify="center">
                                                    <Text fontSize="sm">
                                                        {SIGN_SYMBOLS[transit.aspects[aspectIndex].targetSign as keyof typeof SIGN_SYMBOLS] || transit.aspects[aspectIndex].targetSign}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {transit.aspects[aspectIndex].targetHouse}ª
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        )}
                                    </Table.Cell>

                                    {/* Timeline giornaliera */}
                                    <Table.Cell
                                        p={1}
                                        bg={planetIndex % 2 === 0 ? 'white' : 'blue.25'}
                                        position="relative"
                                        h="40px"
                                    >
                                        {transit.aspects[aspectIndex] && (
                                            <TimelineAspectRow
                                                aspect={transit.aspects[aspectIndex]}
                                                dailyColumns={dailyColumns}
                                                transitData={transitData}
                                            />
                                        )}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </React.Fragment>
                    )
                })}
            </Table.Body>
        </Table.Root>
    )
}
// Funzioni helper
{/*function calculateIntermediateHouses(startHouse: number, endHouse: number): number[] {
    const houses: number[] = []

    if (startHouse === endHouse) {
        return [startHouse]
    }

    // Calcola il percorso più breve tra le case considerando la natura circolare (1-12)
    let current = startHouse
    houses.push(current)

    // Determina la direzione più breve
    let forward = 0
    let backward = 0

    // Calcola distanza in avanti
    let temp = startHouse
    while (temp !== endHouse) {
        temp = temp === 12 ? 1 : temp + 1
        forward++
        if (forward > 12) break // Sicurezza per evitare loop infiniti
    }

    // Calcola distanza all'indietro
    temp = startHouse
    while (temp !== endHouse) {
        temp = temp === 1 ? 12 : temp - 1
        backward++
        if (backward > 12) break // Sicurezza per evitare loop infiniti
    }

    // Usa il percorso più breve
    const useForward = forward <= backward

    console.log(`Calcolo case intermedie da ${startHouse} a ${endHouse}: forward=${forward}, backward=${backward}, useForward=${useForward}`)

    if (useForward) {
        // Vai in avanti
        while (current !== endHouse) {
            current = current === 12 ? 1 : current + 1
            houses.push(current)
        }
    } else {
        // Vai all'indietro
        while (current !== endHouse) {
            current = current === 1 ? 12 : current - 1
            houses.push(current)
        }
    }

    return houses
}*/}

function calculateHouseFromLongitude(longitude: number, natalHouses: any): number {
    // Converte la longitudine in gradi assoluti (0-360)
    const normalizedLongitude = longitude >= 0 ? longitude : longitude + 360

    // Debug dettagliato dei dati delle case natali
    //console.log('calculateHouseFromLongitude - DEBUG natalHouses:', natalHouses)
    //console.log('calculateHouseFromLongitude - typeof natalHouses:', typeof natalHouses)
    //console.log('calculateHouseFromLongitude - Object.keys(natalHouses):', natalHouses ? Object.keys(natalHouses) : 'null')

    // Estrae le cuspidi delle case e le converte in gradi
    const houseCusps: { house: number, degrees: number }[] = []

    if (natalHouses) {
        for (let i = 1; i <= 12; i++) {
            const houseData = natalHouses[i]
            //console.log(`Casa ${i}:`, houseData)
            if (houseData && houseData.cusp) {
                const houseDegrees = parseFloat(houseData.cusp)
                const normalizedHouseDegrees = houseDegrees >= 0 ? houseDegrees : houseDegrees + 360
                houseCusps.push({ house: i, degrees: normalizedHouseDegrees })
                //console.log(`✓ Casa ${i} aggiunta: ${houseDegrees}° -> ${normalizedHouseDegrees}°`)
            } else {
                //console.log(`✗ Casa ${i} saltata:`, houseData)
            }
        }
    } else {
        console.warn('natalHouses è null o undefined!')
    }

    // Ordina le cuspidi per gradi
    houseCusps.sort((a, b) => a.degrees - b.degrees)

    //console.log(`Calcolo casa per longitudine ${longitude}°:`, {
    //    normalizedLongitude,
    //    totalHouseCusps: houseCusps.length,
    //    allHouseCusps: houseCusps,
    //    sampleCusps: houseCusps.slice(0, 3) // Solo le prime 3 per riferimento
    //})
    if (houseCusps.length === 0) {
        console.warn('Nessuna cuspide di casa trovata!')
        return 1
    }

    // Trova in quale casa cade la longitudine
    for (let i = 0; i < houseCusps.length; i++) {
        const currentCusp = houseCusps[i]
        const nextCusp = houseCusps[(i + 1) % houseCusps.length]

        //console.log(`Controllo casa ${currentCusp.house}: da ${currentCusp.degrees}° a ${nextCusp.degrees}°`)

        // Gestisce il caso in cui attraversiamo lo 0° (fine Pesci -> inizio Ariete)
        if (currentCusp.degrees > nextCusp.degrees) {
            // La casa attraversa lo 0°
            //console.log(`Casa ${currentCusp.house} attraversa lo 0°: ${currentCusp.degrees}° -> ${nextCusp.degrees}°`)
            if (normalizedLongitude >= currentCusp.degrees || normalizedLongitude < nextCusp.degrees) {
                //console.log(`✓ Longitudine ${normalizedLongitude}° trovata in casa ${currentCusp.house}`)
                return currentCusp.house
            }
        } else {
            // Casa normale senza attraversamento dello 0°
            if (normalizedLongitude >= currentCusp.degrees && normalizedLongitude < nextCusp.degrees) {
                //console.log(`✓ Longitudine ${normalizedLongitude}° trovata in casa ${currentCusp.house}`)
                return currentCusp.house
            }
        }
    }

    console.warn(`Nessuna casa trovata per longitudine ${normalizedLongitude}°, restituisco casa 1`)
    // Fallback: se non trova nulla, restituisce 1
    return 1
}

function calculatePlanetTransitsFromDaily(planetName: string, dailyTransits: any, natalChart: any): {
    houses: string[]
    aspects: AspectData[]
} {
    const houses: string[] = []
    const aspects: AspectData[] = []

    console.log(`calculatePlanetTransitsFromDaily - ${planetName}:`, {
        dailyTransitsCount: Object.keys(dailyTransits || {}).length,
        hasAspects: dailyTransits ? (Object.values(dailyTransits)[0] as any)?.aspettiDiTransito?.length : 0,
        natalPlanets: natalChart?.pianeti ? Object.keys(natalChart.pianeti) : null,
        natalHouses: natalChart?.case ? Object.keys(natalChart.case) : null
    })
    //console.log('calculatePlanetTransitsFromDaily - dailyTransits:', dailyTransits)

    // Se abbiamo i dati dei transiti giornalieri, estraiamo le informazioni
    if (dailyTransits && natalChart?.pianeti) {
        // Calcola le case attraversate dal pianeta durante il periodo
        const transitHouses = new Set<string>()

        // Ottieni le date ordinate
        const sortedDates = Object.keys(dailyTransits).sort()
        const firstDate = sortedDates[0]
        const lastDate = sortedDates[sortedDates.length - 1]

        console.log(`${planetName} - Analisi periodo dal ${firstDate} al ${lastDate}`)

        // Analizza TUTTI i giorni per tracciare correttamente le case attraversate
        // (importante per catturare moti retrogradi e oscillazioni)
        sortedDates.forEach((dateStr: string) => {
            const dayData = dailyTransits[dateStr]
            if (dayData?.posizioniTransiti?.[planetName]?.longitude) {
                const longitude = parseFloat(dayData.posizioniTransiti[planetName].longitude)
                const house = calculateHouseFromLongitude(longitude, natalChart.case)

                if (house && house !== 0) {
                    transitHouses.add(`${house}ª`)
                    //console.log(`${planetName} - ${dateStr}: ${longitude}° -> casa ${house}ª`)
                }
            }
        })

        // Itera attraverso tutti i giorni per trovare gli aspetti
        // Prima raccogliamo tutti gli aspetti per data
        const dailyAspects: { [date: string]: { [aspectKey: string]: any } } = {}

        Object.entries(dailyTransits).forEach(([dateStr, dayData]: [string, any]) => {
            if (dayData && typeof dayData === 'object' && dayData.aspettiDiTransito && Array.isArray(dayData.aspettiDiTransito)) {
                dayData.aspettiDiTransito.forEach((aspectGroup: any) => {
                    if (aspectGroup.transitPlanet === planetName && aspectGroup.aspects && Array.isArray(aspectGroup.aspects)) {
                        aspectGroup.aspects.forEach((aspect: any) => {
                            const natalPlanetData = natalChart.pianeti[aspectGroup.natalPlanet]
                            if (natalPlanetData) {
                                const aspectKey = `${aspect.type}-${aspectGroup.natalPlanet}`
                                const orbValue = parseFloat(aspect.orb)

                                if (!dailyAspects[dateStr]) {
                                    dailyAspects[dateStr] = {}
                                }

                                dailyAspects[dateStr][aspectKey] = {
                                    type: aspect.type,
                                    targetPlanet: aspectGroup.natalPlanet,
                                    targetSign: natalPlanetData.zodiac?.sign || '',
                                    targetHouse: parseInt(natalPlanetData.house) || 0,
                                    orb: orbValue,
                                    isExact: orbValue <= 1
                                }
                            }
                        })
                    }
                })
            }
        })

        // Ora analizza i periodi continui per ogni tipo di aspetto
        const aspectGroups: { [aspectKey: string]: AspectData } = {}

        // Per ogni tipo di aspetto, trova i periodi continui
        const allAspectKeys = new Set<string>()
        Object.values(dailyAspects).forEach(dayAspects => {
            Object.keys(dayAspects).forEach(key => allAspectKeys.add(key))
        })

        allAspectKeys.forEach(aspectKey => {
            const periods: {
                startDate: string
                endDate: string
                exactDates: string[]
                isExact: boolean
                orbValues: number[]
            }[] = []

            let currentPeriod: {
                startDate: string
                endDate: string
                exactDates: string[]
                isExact: boolean
                orbValues: number[]
            } | null = null

            // Trova il primo aspetto per ottenere le informazioni base
            let firstAspectInfo: any = null
            for (const dateStr of sortedDates) {
                const dayAspect = dailyAspects[dateStr]?.[aspectKey]
                if (dayAspect) {
                    firstAspectInfo = dayAspect
                    break
                }
            }

            if (!firstAspectInfo) return // Skip se non troviamo info dell'aspetto

            sortedDates.forEach(dateStr => {
                const dayAspect = dailyAspects[dateStr]?.[aspectKey]

                if (dayAspect) {
                    // Aspetto presente in questo giorno
                    if (!currentPeriod) {
                        // Inizia un nuovo periodo
                        currentPeriod = {
                            startDate: dateStr,
                            endDate: dateStr,
                            exactDates: dayAspect.isExact ? [dateStr] : [],
                            isExact: dayAspect.isExact,
                            orbValues: [dayAspect.orb]
                        }
                    } else {
                        // Continua il periodo esistente
                        currentPeriod.endDate = dateStr
                        currentPeriod.orbValues.push(dayAspect.orb)
                        if (dayAspect.isExact) {
                            currentPeriod.exactDates.push(dateStr)
                            currentPeriod.isExact = true
                        }
                    }
                } else {
                    // Aspetto non presente in questo giorno
                    if (currentPeriod) {
                        // Chiudi il periodo corrente
                        periods.push(currentPeriod)
                        currentPeriod = null
                    }
                }
            })

            // Chiudi l'ultimo periodo se ancora aperto
            if (currentPeriod) {
                periods.push(currentPeriod)
            }

            // Crea l'AspectData unificato se abbiamo periodi
            if (periods.length > 0) {
                // Calcola le proprietà globali dall'insieme di tutti i periodi
                const allExactDates = periods.flatMap(p => p.exactDates)
                const allOrbValues = periods.flatMap(p => p.orbValues)
                const isExactOverall = periods.some(p => p.isExact)
                const globalStartDate = periods[0].startDate
                const globalEndDate = periods[periods.length - 1].endDate

                aspectGroups[aspectKey] = {
                    type: firstAspectInfo.type,
                    targetPlanet: firstAspectInfo.targetPlanet,
                    targetSign: firstAspectInfo.targetSign,
                    targetHouse: firstAspectInfo.targetHouse,
                    periods: periods,
                    // Proprietà di compatibilità
                    startDate: globalStartDate,
                    endDate: globalEndDate,
                    exactDates: allExactDates,
                    isExact: isExactOverall,
                    orbValues: allOrbValues
                }
            }
        })

        // Aggiungi tutti gli aspetti (uno per tipo) all'array finale
        aspects.push(...Object.values(aspectGroups))

        // Converti il Set in array ordinato
        const sortedHouses = Array.from(transitHouses).sort((a, b) => {
            const numA = parseInt(a.replace('ª', '').replace(' (natale)', ''))
            const numB = parseInt(b.replace('ª', '').replace(' (natale)', ''))
            return numA - numB
        })

        houses.push(...sortedHouses)

        // Se non abbiamo trovato case di transito, aggiungi almeno la casa natale
        if (houses.length === 0) {
            const natalPlanetData = natalChart.pianeti[planetName]
            if (natalPlanetData && natalPlanetData.house) {
                houses.push(`${natalPlanetData.house}ª (natale)`)
            }
        }

        // Log finale del risultato
        console.log(`${planetName} - RISULTATO FINALE:`, {
            caseUniche: Array.from(transitHouses).sort(),
            totaleCase: transitHouses.size,
            aspetti: aspects.length
        })
    } else if (natalChart?.pianeti) {
        // Se abbiamo solo i dati natali, mostra almeno la casa natale
        const natalPlanetData = natalChart.pianeti[planetName]
        if (natalPlanetData && natalPlanetData.house) {
            houses.push(`${natalPlanetData.house}ª (natale)`)
        }
    }

    return { houses, aspects }
}

function generateTimeColumns(startDate: string, endDate: string) {
    const columns = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    const current = new Date(start)
    while (current <= end) {
        columns.push({
            month: current.toLocaleDateString('it-IT', { month: 'short' }),
            year: current.getFullYear().toString(),
            startDate: new Date(current),
            endDate: new Date(current.getFullYear(), current.getMonth() + 1, 0)
        })
        current.setMonth(current.getMonth() + 1)
    }

    return columns
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

function getAspectColor(aspectType: string): string {
    const colors = {
        'Congiunzione': 'yellow.400',
        'Sestile': 'green.400',
        'Trigono': 'blue.400',
        'Quadratura': 'red.400',
        'Opposizione': 'purple.400'
    }
    return colors[aspectType as keyof typeof colors] || 'gray.400'
}

// Funzione per determinare il colore del segno zodiacale
function getSignColor(sign: string): string {
    const fireElements = ['Ariete', 'Leone', 'Sagittario']
    const earthElements = ['Toro', 'Vergine', 'Capricorno']
    const airElements = ['Gemelli', 'Bilancia', 'Acquario']
    const waterElements = ['Cancro', 'Scorpione', 'Pesci']

    if (fireElements.includes(sign)) return 'red.500'
    if (earthElements.includes(sign)) return 'green.500'
    if (airElements.includes(sign)) return 'blue.500'
    if (waterElements.includes(sign)) return 'cyan.500'
    return 'gray.500'
}

function AspectTimeline({ aspect, timeColumn }: { aspect: AspectData, timeColumn: any }) {
    // Calcola se questo aspetto ha almeno un periodo attivo in questo periodo temporale
    const hasActivePeriods = aspect.periods.some(period => {
        const periodStart = new Date(period.startDate)
        const periodEnd = new Date(period.endDate)
        return !(periodEnd < timeColumn.startDate || periodStart > timeColumn.endDate)
    })

    if (!hasActivePeriods) return null

    // Etichetta con pianeta, segno e casa (es.: ♄-♍-7a) - solo per tooltip
    const aspectLabel = `${PLANET_SYMBOLS[aspect.targetPlanet as keyof typeof PLANET_SYMBOLS] || aspect.targetPlanet}-${SIGN_SYMBOLS[aspect.targetSign as keyof typeof SIGN_SYMBOLS] || aspect.targetSign}-${aspect.targetHouse}ª`

    // Funzione per determinare lo spessore basato sull'orb specifico
    const getLineThickness = (orbValue: number) => {
        // 0-0.5: linea grossa (aspetto quasi esatto)
        if (orbValue >= 0 && orbValue <= 0.5) {
            return "3px"
        }
        // 0.5-1: linea media (aspetto in tolleranza)
        else if (orbValue > 0.5 && orbValue <= 1) {
            return "1px"
        }
        // >1: nessuna linea (aspetto fuori tolleranza)
        else {
            return "0px"
        }
    }

    const getHeightThickness = (orbValue: number) => {
        // 0-0.5: altezza grossa (aspetto quasi esatto)
        if (orbValue >= 0 && orbValue <= 0.5) {
            return "60%"
        }
        // 0.5-1: altezza media (aspetto in tolleranza)
        else if (orbValue > 0.5 && orbValue <= 1) {
            return "30%"
        }
        // >1: nessuna altezza (aspetto fuori tolleranza)
        else {
            return "0%"
        }
    }

    return (
        <Box position="relative" w="100%" h="100%">
            {/* Per ogni periodo, disegna linee verticali giorno per giorno */}
            {aspect.periods.map((period, periodIndex) => {
                const periodStart = new Date(period.startDate)
                const periodEnd = new Date(period.endDate)

                // Verifica se questo periodo è attivo in questa colonna temporale
                if (periodEnd < timeColumn.startDate || periodStart > timeColumn.endDate) {
                    return null
                }

                // Calcola le date che cadono in questa colonna temporale
                const colStart = timeColumn.startDate.getTime()
                const colEnd = timeColumn.endDate.getTime()
                const colDuration = colEnd - colStart

                return (
                    <Box key={periodIndex}>
                        {/* Disegna una linea verticale per ogni giorno del periodo */}
                        {period.orbValues.map((orbValue, dayIndex) => {
                            // Calcola la data di questo giorno (assumendo che orbValues sia in ordine cronologico)
                            const currentDate = new Date(periodStart)
                            currentDate.setDate(currentDate.getDate() + dayIndex)

                            // Verifica se questo giorno cade nella colonna temporale corrente
                            if (currentDate < timeColumn.startDate || currentDate > timeColumn.endDate) {
                                return null
                            }

                            // Calcola la posizione percentuale nella colonna
                            const dayPercent = ((currentDate.getTime() - colStart) / colDuration) * 100
                            const lineThickness = getLineThickness(orbValue)
                            const heightThickness = getHeightThickness(orbValue)

                            // Non disegnare nulla se l'orb è fuori tolleranza
                            if (lineThickness === "0px") {
                                return null
                            }

                            // DEBUG SPECIFICO PER PLUTONE
                            if (aspect.targetPlanet === 'Plutone') {
                                console.log(`🔍 PLUTONE ${aspect.type} - ${currentDate.toISOString().split('T')[0]}:`, {
                                    orb: orbValue.toFixed(3),
                                    thickness: lineThickness,
                                    dayPercent: dayPercent.toFixed(1),
                                    timeColumn: `${timeColumn.month} ${timeColumn.year}`
                                })
                            }

                            return (
                                <Box
                                    key={`${periodIndex}-${dayIndex}`}
                                    position="absolute"
                                    top="20%"
                                    left={`${dayPercent}%`}
                                    width={lineThickness}
                                    height={heightThickness}
                                    bg={getAspectColor(aspect.type)}
                                    borderRadius="full"
                                    transform="translateX(-50%)"
                                    title={`${aspect.type} ${aspectLabel} - ${currentDate.toLocaleDateString('it-IT')}: orb ${orbValue.toFixed(2)}°`}
                                    zIndex={1}
                                />
                            )
                        })}
                    </Box>
                )
            })}
        </Box>
    )
}
