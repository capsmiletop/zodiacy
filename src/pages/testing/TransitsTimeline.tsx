import React, { useMemo } from 'react'
import {
    Box,
    Text,
    HStack,
    VStack,
    Table
} from '@chakra-ui/react'
import { Tooltip } from "../../components/ui/tooltip"
import { Transit, PeriodType, PLANET_SYMBOLS, ASPECT_SYMBOLS } from './types'

interface TransitsTimelineProps {
    transits: Transit[]
    periodType: PeriodType
    startDate: string
    endDate: string
    selectedPlanets: Set<string>
    selectedAspects: Set<string>
}

export const TransitsTimeline: React.FC<TransitsTimelineProps> = ({
    transits,
    periodType,
    startDate,
    endDate,
    selectedPlanets,
    selectedAspects
}) => {
    // Genera tutte le date del periodo
    const dateRange = useMemo(() => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const dates: string[] = []

        const current = new Date(start)
        while (current <= end) {
            dates.push(current.toISOString().split('T')[0])
            current.setDate(current.getDate() + 1)
        }
        return dates
    }, [startDate, endDate])

    const getAspectColor = (aspect: string) => {
        const colors = {
            'Congiunzione': '#F6E05E',
            'Sestile': '#48BB78',
            'Trigono': '#4299E1',
            'Quadratura': '#F56565',
            'Opposizione': '#9F7AEA'
        }
        return colors[aspect as keyof typeof colors] || '#A0AEC0'
    }

    type ExactPeriod = { startIndex: number; endIndex: number };

    type Period = {
        startIndex: number;
        endIndex: number;
        startDate: string;
        endDate: string;
        exactPeriods: ExactPeriod[];
        peakIndex: number;
        peakOrb: number;
        targetPlanet: string;
    };

    function findTransitPeriods(
        dateRange: string[],
        transitsForPlanetAspect: Transit[]
    ): Period[] {
        const periods: Period[] = [];

        // Mappa transiti per data
        const transitsByDate = new Map<string, Transit[]>();
        for (const t of transitsForPlanetAspect) {
            const arr = transitsByDate.get(t.date);
            if (arr) arr.push(t);
            else transitsByDate.set(t.date, [t]);
        }

        // Stato del periodo in corso (o null se non ce n'è uno)
        let currentPeriod:
            | {
                startIndex: number;
                startDate: string;
                targetPlanet: string;
                exactPeriods: ExactPeriod[];
                peakIndex: number;
                peakOrb: number;
            }
            | null = null;

        for (let index = 0; index < dateRange.length; index++) {
            const date = dateRange[index];
            const dayTransits = transitsByDate.get(date) ?? [];

            if (dayTransits.length > 0) {
                // Trova il transito "principale" (orb minimo) senza reduce
                let mainTransit = dayTransits[0];
                for (let i = 1; i < dayTransits.length; i++) {
                    if (dayTransits[i].orb < mainTransit.orb) {
                        mainTransit = dayTransits[i];
                    }
                }

                if (!currentPeriod) {
                    // Inizia nuovo periodo
                    currentPeriod = {
                        startIndex: index,
                        startDate: date,
                        targetPlanet: mainTransit.targetPlanet,
                        exactPeriods: [] as ExactPeriod[],
                        peakIndex: index,
                        peakOrb: mainTransit.orb,
                    };

                    // Periodo esatto iniziale
                    if (mainTransit.isExact) {
                        currentPeriod.exactPeriods.push({ startIndex: index, endIndex: index });
                    }
                } else {
                    // Aggiorna picco se l'orb è minore
                    if (mainTransit.orb < currentPeriod.peakOrb) {
                        currentPeriod.peakIndex = index;
                        currentPeriod.peakOrb = mainTransit.orb;
                        // opzionale: aggiorna anche targetPlanet se necessario:
                        // currentPeriod.targetPlanet = mainTransit.targetPlanet;
                    }

                    // Gestisci periodi esatti (estendi o crea nuovo)
                    if (mainTransit.isExact) {
                        const lastExact = currentPeriod.exactPeriods[currentPeriod.exactPeriods.length - 1];
                        if (lastExact && index === lastExact.endIndex + 1) {
                            lastExact.endIndex = index;
                        } else {
                            currentPeriod.exactPeriods.push({ startIndex: index, endIndex: index });
                        }
                    }
                }
            } else if (currentPeriod) {
                // Fine del periodo
                periods.push({
                    startIndex: currentPeriod.startIndex,
                    endIndex: index - 1,
                    startDate: currentPeriod.startDate,
                    endDate: dateRange[index - 1],
                    exactPeriods: currentPeriod.exactPeriods,
                    peakIndex: currentPeriod.peakIndex,
                    peakOrb: currentPeriod.peakOrb,
                    targetPlanet: currentPeriod.targetPlanet,
                });
                currentPeriod = null;
            }
        }

        // Se c'è un periodo aperto alla fine dell'iterazione, chiudilo
        if (currentPeriod) {
            periods.push({
                startIndex: currentPeriod.startIndex,
                endIndex: dateRange.length - 1,
                startDate: currentPeriod.startDate,
                endDate: dateRange[dateRange.length - 1],
                exactPeriods: currentPeriod.exactPeriods,
                peakIndex: currentPeriod.peakIndex,
                peakOrb: currentPeriod.peakOrb,
                targetPlanet: currentPeriod.targetPlanet,
            });
        }

        return periods;
    }


    // Crea i dati della timeline organizzati per pianeta
    const timelineData = useMemo(() => {
        const data: Array<{
            planet: string
            aspect: string
            periods: ReturnType<typeof findTransitPeriods>
        }> = []

        Array.from(selectedPlanets).forEach(planet => {
            Array.from(selectedAspects).forEach(aspect => {
                const periods = findTransitPeriods(
                    dateRange,
                    transits.filter(t => t.planet === planet && t.aspect === aspect)
                )

                data.push({ planet, aspect, periods })
            })
        })

        return data
    }, [transits, selectedPlanets, selectedAspects, dateRange])

    // Componente per timeline di un aspetto - VERSIONE SEMPLIFICATA
    const TimelineCell: React.FC<{
        periods: ReturnType<typeof findTransitPeriods>
        aspect: string
    }> = ({ periods, aspect }) => {
        const aspectColor = getAspectColor(aspect)

        return (
            <Box position="relative" h="40px" w="full">
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
                    {periods.map((period, periodIndex) => {
                        // CORREZIONE: Calcolo posizioni allineate con la griglia temporale
                        const startX = (period.startIndex / (dateRange.length - 1)) * 100
                        const endX = (period.endIndex / (dateRange.length - 1)) * 100
                        const peakX = (period.peakIndex / (dateRange.length - 1)) * 100

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
                                    const exactStartX = (exactPeriod.startIndex / (dateRange.length - 1)) * 100
                                    const exactEndX = (exactPeriod.endIndex / (dateRange.length - 1)) * 100

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
                                <Tooltip
                                    content={
                                        <VStack gap={1} align="start">
                                            <Text fontSize="sm" fontWeight="bold">
                                                🟢 Inizio {aspect}
                                            </Text>
                                            <Text fontSize="xs">
                                                {new Date(period.startDate).toLocaleDateString('it-IT')}
                                            </Text>
                                            <Text fontSize="xs">
                                                Target: {period.targetPlanet}
                                            </Text>
                                        </VStack>
                                    }
                                >
                                    <circle
                                        cx={`${startX}%`}
                                        cy="20"
                                        r="6"
                                        fill={aspectColor}
                                        stroke="green"
                                        strokeWidth="2"
                                        style={{ cursor: 'pointer' }}
                                    />
                                </Tooltip>

                                {/* Punto di picco (orb minimo) */}
                                <Tooltip
                                    content={
                                        <VStack gap={1} align="start">
                                            <Text fontSize="sm" fontWeight="bold">
                                                🎯 Picco {aspect}
                                            </Text>
                                            <Text fontSize="xs">
                                                {new Date(dateRange[period.peakIndex]).toLocaleDateString('it-IT')}
                                            </Text>
                                            <Text fontSize="xs">
                                                Orb minimo: {period.peakOrb.toFixed(1)}°
                                            </Text>
                                            <Text fontSize="xs">
                                                Target: {period.targetPlanet}
                                            </Text>
                                        </VStack>
                                    }
                                >
                                    <circle
                                        cx={`${peakX}%`}
                                        cy="20"
                                        r="8"
                                        fill={aspectColor}
                                        stroke="gold"
                                        strokeWidth="3"
                                        style={{ cursor: 'pointer' }}
                                    />
                                </Tooltip>

                                {/* Punto di fine */}
                                <Tooltip
                                    content={
                                        <VStack gap={1} align="start">
                                            <Text fontSize="sm" fontWeight="bold">
                                                🔴 Fine {aspect}
                                            </Text>
                                            <Text fontSize="xs">
                                                {new Date(period.endDate).toLocaleDateString('it-IT')}
                                            </Text>
                                            <Text fontSize="xs">
                                                Target: {period.targetPlanet}
                                            </Text>
                                        </VStack>
                                    }
                                >
                                    <circle
                                        cx={`${endX}%`}
                                        cy="20"
                                        r="6"
                                        fill={aspectColor}
                                        stroke="red"
                                        strokeWidth="2"
                                        style={{ cursor: 'pointer' }}
                                    />
                                </Tooltip>

                                {/* Simbolo del pianeta target sotto il picco */}
                                <text
                                    x={`${peakX}%`}
                                    y="34"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize="12"
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

    const aspectsPerPlanet = selectedAspects.size

    return (
        <Box overflowX="auto">
            {/* Tabella con timeline */}
            <Table.Root variant="line" size="sm">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader w="120px" position="sticky" left={0} bg="white" zIndex={2}>
                            Pianeta
                        </Table.ColumnHeader>
                        <Table.ColumnHeader w="120px" bg="white" zIndex={2}>
                            Aspetto
                        </Table.ColumnHeader>
                        <Table.ColumnHeader w="full" position="relative">
                            {/* Header Timeline con scala temporale integrata */}
                            <VStack gap={2} align="stretch">
                                <Text textAlign="center">Timeline</Text>

                                {/* Scala temporale nella header */}
                                <Box position="relative" h="60px">
                                    {/* Date inizio e fine */}
                                    <HStack justify="space-between" w="full" mb={2}>
                                        <Text fontSize="xs" fontWeight="bold" color="gray.600">
                                            {new Date(startDate).toLocaleDateString('it-IT')}
                                        </Text>
                                        <Text fontSize="xs" fontWeight="bold" color="gray.600">
                                            {new Date(endDate).toLocaleDateString('it-IT')}
                                        </Text>
                                    </HStack>

                                    {/* Griglia temporale */}
                                    <Box position="relative" h="40px" bg="gray.50" borderRadius="md" p={2}>
                                        <HStack justify="space-between" w="full" h="full">
                                            {periodType === 'month' ? (
                                                dateRange.map((date, index) => {
                                                    const day = new Date(date).getDate()
                                                    const isWeekend = [0, 6].includes(new Date(date).getDay())
                                                    const showLabel = index % Math.max(1, Math.floor(dateRange.length / 15)) === 0 || day === 1 || day === 15

                                                    // CORREZIONE: Posizione allineata con i transiti
                                                    const xPosition = (index / (dateRange.length - 1)) * 100

                                                    return (
                                                        <Box
                                                            key={date}
                                                            position="absolute"
                                                            left={`${xPosition}%`}
                                                            transform="translateX(-50%)"
                                                            textAlign="center"
                                                        >
                                                            <Box
                                                                w="1px"
                                                                h={showLabel ? "20px" : "10px"}
                                                                bg={isWeekend ? "red.300" : "gray.300"}
                                                                mx="auto"
                                                            />
                                                            {showLabel && (
                                                                <Text
                                                                    fontSize="xs"
                                                                    color={isWeekend ? "red.600" : "gray.600"}
                                                                    fontWeight={day === 1 ? "bold" : "normal"}
                                                                    mt={1}
                                                                >
                                                                    {day}
                                                                </Text>
                                                            )}
                                                        </Box>
                                                    )
                                                })
                                            ) : (
                                                // Per visualizzazione annuale - anche questa corretta
                                                Array.from({ length: 12 }, (_, i) => {
                                                    const xPosition = (i / 11) * 100 // 0 a 100% per 12 mesi
                                                    const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

                                                    return (
                                                        <Box
                                                            key={i}
                                                            position="absolute"
                                                            left={`${xPosition}%`}
                                                            transform="translateX(-50%)"
                                                            textAlign="center"
                                                        >
                                                            <Box w="2px" h="20px" bg="blue.400" mx="auto" />
                                                            <Text fontSize="xs" color="blue.600" fontWeight="bold" mt={1}>
                                                                {monthNames[i]}
                                                            </Text>
                                                        </Box>
                                                    )
                                                })
                                            )}
                                        </HStack>
                                    </Box>
                                </Box>
                            </VStack>
                        </Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {timelineData.map((row, rowIndex) => {
                        const isFirstRowOfPlanet = rowIndex % aspectsPerPlanet === 0
                        const planetIndex = Math.floor(rowIndex / aspectsPerPlanet)

                        return (
                            <React.Fragment key={`${row.planet}-${row.aspect}`}>
                                {/* Separatore tra pianeti */}
                                {isFirstRowOfPlanet && rowIndex > 0 && (
                                    <Table.Row>
                                        <Table.Cell
                                            colSpan={3}
                                            p={0}
                                            bg="gray.200"
                                            h="4px"
                                        />
                                    </Table.Row>
                                )}

                                <Table.Row
                                    bg={planetIndex % 2 === 0 ? "white" : "blue.25"}
                                    _hover={{
                                        bg: planetIndex % 2 === 0 ? "gray.50" : "blue.50"
                                    }}
                                >
                                    {/* Pianeta - solo per la prima riga */}
                                    {isFirstRowOfPlanet && (
                                        <Table.Cell
                                            position="sticky"
                                            left={0}
                                            bg={planetIndex % 2 === 0 ? "white" : "blue.25"}
                                            zIndex={1}
                                            borderRight="2px solid"
                                            borderRightColor="gray.300"
                                            rowSpan={aspectsPerPlanet}
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
                                                        {PLANET_SYMBOLS[row.planet as keyof typeof PLANET_SYMBOLS]}
                                                    </Text>
                                                </Box>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="bold"
                                                    color="blue.700"
                                                >
                                                    {row.planet}
                                                </Text>
                                            </VStack>
                                        </Table.Cell>
                                    )}

                                    {/* Aspetto */}
                                    <Table.Cell
                                        position="sticky"
                                        bg={planetIndex % 2 === 0 ? "white" : "blue.25"}
                                        zIndex={1}
                                        borderRight="1px solid"
                                        borderRightColor="gray.200"
                                        w="120px"
                                    >
                                        <HStack gap={2} justify="start">
                                            <Text fontSize="lg" fontWeight="bold" color={getAspectColor(row.aspect)}>
                                                {ASPECT_SYMBOLS[row.aspect as keyof typeof ASPECT_SYMBOLS]}
                                            </Text>
                                            <Text fontSize="xs" fontWeight="medium">
                                                {row.aspect}
                                            </Text>
                                        </HStack>
                                    </Table.Cell>

                                    {/* Timeline */}
                                    <Table.Cell
                                        p={2}
                                        bg={planetIndex % 2 === 0 ? "white" : "blue.25"}
                                    >
                                        <TimelineCell
                                            periods={row.periods}
                                            aspect={row.aspect}
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            </React.Fragment>
                        )
                    })}
                </Table.Body>
            </Table.Root>

            {/* Legenda aggiornata */}
            <Box mt={6} p={4} bg="gray.50" borderRadius="lg" border="2px solid" borderColor="gray.200">
                <Text fontSize="md" fontWeight="bold" mb={4}>Legenda Timeline:</Text>
                <VStack gap={4} align="start">
                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={2}>Aspetti:</Text>
                        <HStack gap={6} flexWrap="wrap">
                            <HStack gap={2}>
                                <Box w="20px" h="20px" bg="yellow.400" borderRadius="sm" />
                                <Text fontSize="xs">Congiunzione ☌</Text>
                            </HStack>
                            <HStack gap={2}>
                                <Box w="20px" h="20px" bg="green.400" borderRadius="sm" />
                                <Text fontSize="xs">Sestile ⚹</Text>
                            </HStack>
                            <HStack gap={2}>
                                <Box w="20px" h="20px" bg="blue.400" borderRadius="sm" />
                                <Text fontSize="xs">Trigono △</Text>
                            </HStack>
                            <HStack gap={2}>
                                <Box w="20px" h="20px" bg="red.400" borderRadius="sm" />
                                <Text fontSize="xs">Quadratura □</Text>
                            </HStack>
                            <HStack gap={2}>
                                <Box w="20px" h="20px" bg="purple.400" borderRadius="sm" />
                                <Text fontSize="xs">Opposizione ☍</Text>
                            </HStack>
                        </HStack>
                    </Box>

                    <Box>
                        <Text fontSize="sm" fontWeight="semibold" mb={2}>Simboli:</Text>
                        <HStack gap={8} flexWrap="wrap">
                            <HStack gap={2}>
                                <Box w="12px" h="12px" borderRadius="full" bg="blue.400" border="2px solid green" />
                                <Text fontSize="xs">🟢 Inizio transito</Text>
                            </HStack>
                            <HStack gap={2}>
                                <Box w="16px" h="16px" borderRadius="full" bg="blue.400" border="3px solid gold" />
                                <Text fontSize="xs">🎯 Picco (orb min)</Text>
                            </HStack>
                            <HStack gap={2}>
                                <Box w="12px" h="12px" borderRadius="full" bg="blue.400" border="2px solid red" />
                                <Text fontSize="xs">🔴 Fine transito</Text>
                            </HStack>
                            <HStack gap={2}>
                                <Box w="30px" h="4px" bg="black" />
                                <Text fontSize="xs">⚫ Periodo esatto</Text>
                            </HStack>
                        </HStack>
                    </Box>

                    <Text fontSize="xs" color="gray.600" fontStyle="italic">
                        • Linea colorata = durata del transito • Linea nera = periodo con aspetto esatto • Simbolo sotto = pianeta target
                    </Text>
                </VStack>
            </Box>
        </Box>
    )
}