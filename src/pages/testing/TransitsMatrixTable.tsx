import React, { useMemo } from 'react'
import {
    Box,
    Table,
    Text,
    HStack,
    VStack,
} from '@chakra-ui/react'
import { Tooltip } from "../../components/ui/tooltip"
import { Transit, PeriodType } from './types'
import { PLANET_SYMBOLS, ASPECT_SYMBOLS } from './types'

interface MatrixCell {
    date: string
    hasTransit: boolean
    isExact: boolean
    orb: number
    transitData?: Transit
}

interface MatrixCellWithDuration {
    date: string
    periodStart: string
    periodEnd: string
    transits: Array<{
        transit: any
        overlap: number
        startOffset: number
        endOffset: number
    }>
}

interface AspectRow {
    planet: string
    aspect: string
    cells: MatrixCell[] | MatrixCellWithDuration[]
}

interface TransitsMatrixTableProps {
    transits: Transit[]
    periodType: PeriodType
    startDate: string
    endDate: string
    selectedPlanets: Set<string>
    selectedAspects: Set<string>
}

export const TransitsMatrixTable: React.FC<TransitsMatrixTableProps> = ({
    transits,
    periodType,
    startDate,
    endDate,
    selectedPlanets,
    selectedAspects
}) => {
    // Genera le date delle colonne
    const dateColumns = useMemo(() => {
        const start = new Date(startDate)
        const end = new Date(endDate)

        if (periodType === 'month') {
            // Logica semplice per giorni del mese
            const dates: string[] = []
            const current = new Date(start)
            while (current <= end) {
                dates.push(current.toISOString().split('T')[0])
                current.setDate(current.getDate() + 1)
            }
            return dates
        } else {
            // Per anno: periodi con inizio e fine
            const periods: Array<{ date: string; start: string; end: string }> = []
            const current = new Date(start)
            while (current <= end) {
                const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
                const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999)

                periods.push({
                    date: `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}`,
                    start: monthStart.toISOString(),
                    end: monthEnd.toISOString()
                })
                current.setMonth(current.getMonth() + 1)
            }
            return periods
        }
    }, [startDate, endDate, periodType])

    // Funzione helper per calcolare sovrapposizione (solo per anno)
    const calculateTransitOverlap = (
        transitStart: string,
        transitEnd: string,
        periodStart: string,
        periodEnd: string
    ) => {
        const tStart = new Date(transitStart).getTime()
        const tEnd = new Date(transitEnd).getTime()
        const pStart = new Date(periodStart).getTime()
        const pEnd = new Date(periodEnd).getTime()

        const overlapStart = Math.max(tStart, pStart)
        const overlapEnd = Math.min(tEnd, pEnd)

        if (overlapStart >= overlapEnd) {
            return { overlap: 0, startOffset: 0, endOffset: 0 }
        }

        const periodDuration = pEnd - pStart
        const overlapDuration = overlapEnd - overlapStart

        const startOffset = (overlapStart - pStart) / periodDuration
        const endOffset = (pEnd - overlapEnd) / periodDuration
        const overlap = overlapDuration / periodDuration

        return { overlap, startOffset, endOffset }
    }

    // Crea la matrice dei dati
    const matrixData = useMemo(() => {
        const matrix: AspectRow[] = []

        Array.from(selectedPlanets).forEach(planet => {
            Array.from(selectedAspects).forEach(aspect => {
                if (periodType === 'month') {
                    // LOGICA SEMPLICE PER MESE (come prima)
                    const cells: MatrixCell[] = (dateColumns as string[]).map(dateCol => {
                        const matchingTransits = transits.filter(transit => {
                            return transit.planet === planet &&
                                transit.aspect === aspect &&
                                transit.date === dateCol
                        })

                        const bestTransit = matchingTransits.reduce((best, current) => {
                            return !best || current.orb < best.orb ? current : best
                        }, null as Transit | null)

                        return {
                            date: dateCol,
                            hasTransit: !!bestTransit,
                            isExact: bestTransit?.isExact || false,
                            orb: bestTransit?.orb || 0,
                            transitData: bestTransit || undefined
                        }
                    })

                    matrix.push({ planet, aspect, cells })
                } else {
                    // LOGICA CON DURATE PER ANNO
                    const cells: MatrixCellWithDuration[] = (dateColumns as any[]).map(period => {
                        // Trova transiti che si sovrappongono con questo mese
                        const overlappingTransits = transits
                            .filter(transit =>
                                transit.planet === planet &&
                                transit.aspect === aspect
                            )
                            .map(transit => {
                                // Simula durata del transito (estendi il transito per più giorni)
                                const transitDate = new Date(transit.date)
                                const durationDays = Math.floor(Math.random() * 45) + 15 // 15-60 giorni
                                const startDate = new Date(transitDate.getTime() - (durationDays / 2) * 24 * 60 * 60 * 1000)
                                const endDate = new Date(transitDate.getTime() + (durationDays / 2) * 24 * 60 * 60 * 1000)

                                const overlap = calculateTransitOverlap(
                                    startDate.toISOString(),
                                    endDate.toISOString(),
                                    period.start,
                                    period.end
                                )

                                return {
                                    transit: {
                                        ...transit,
                                        startDate: startDate.toISOString(),
                                        endDate: endDate.toISOString(),
                                        exactDate: transit.date
                                    },
                                    ...overlap
                                }
                            })
                            .filter(item => item.overlap > 0)

                        return {
                            date: period.date,
                            periodStart: period.start,
                            periodEnd: period.end,
                            transits: overlappingTransits
                        }
                    })

                    matrix.push({ planet, aspect, cells })
                }
            })
        })

        return matrix
    }, [transits, selectedPlanets, selectedAspects, dateColumns, periodType])

    // Componente per cella semplice (mese)
    const SimpleMatrixCell: React.FC<{ cell: MatrixCell; periodType: PeriodType }> = ({ cell, }) => {
        if (!cell.hasTransit) {
            return <Box w="full" h="20px" bg="gray.100" />
        }

        const intensity = cell.isExact ? 1 : Math.max(0.3, 1 - (cell.orb / 2))
        const opacity = 0.4 + (intensity * 0.6)

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

        const aspectColor = getAspectColor(cell.transitData?.aspect || '')

        return (
            <Tooltip
                showArrow
                content={
                    <VStack gap={1} align="start">
                        <Text fontSize="sm" fontWeight="bold">
                            {cell.transitData?.aspect} a {cell.transitData?.targetPlanet}
                        </Text>
                        <Text fontSize="xs">
                            Orb: {cell.orb.toFixed(2)}°
                            {cell.isExact && ' (Esatto)'}
                        </Text>
                        <Text fontSize="xs">
                            {new Date(cell.date).toLocaleDateString('it-IT')}
                        </Text>
                    </VStack>
                }
            >
                <Box
                    w="full"
                    h="20px"
                    bg={aspectColor}
                    opacity={opacity}
                    borderRadius="sm"
                    border={cell.isExact ? "2px solid" : "1px solid"}
                    borderColor={cell.isExact ? aspectColor : "transparent"}
                    cursor="pointer"
                    _hover={{
                        transform: 'scale(1.05)',
                        zIndex: 1
                    }}
                    transition="all 0.2s"
                />
            </Tooltip>
        )
    }

    // Componente per cella con durata (anno)
    const DurationMatrixCell: React.FC<{
        cell: MatrixCellWithDuration
        periodType: PeriodType
    }> = ({ cell, }) => {
        if (cell.transits.length === 0) {
            return <Box w="full" h="20px" bg="gray.100" />
        }

        const mainTransit = cell.transits.reduce((best, current) =>
            current.overlap > best.overlap ? current : best
        )

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

        const aspectColor = getAspectColor(mainTransit.transit.aspect)
        const orbIntensity = mainTransit.transit.isExact ? 1 : Math.max(0.3, 1 - (mainTransit.transit.orb / 2))
        const opacity = 0.4 + (orbIntensity * 0.6)

        return (
            <Tooltip
                showArrow
                content={
                    <VStack gap={1} align="start">
                        <Text fontSize="sm" fontWeight="bold">
                            {mainTransit.transit.aspect} a {mainTransit.transit.targetPlanet}
                        </Text>
                        <Text fontSize="xs">
                            Durata: {Math.round(mainTransit.overlap * 100)}% del mese
                        </Text>
                        <Text fontSize="xs">
                            Orb: {mainTransit.transit.orb.toFixed(2)}°
                            {mainTransit.transit.isExact && ' (Esatto)'}
                        </Text>
                        <Text fontSize="xs">
                            {new Date(mainTransit.transit.startDate).toLocaleDateString('it-IT')} - {' '}
                            {new Date(mainTransit.transit.endDate).toLocaleDateString('it-IT')}
                        </Text>
                    </VStack>
                }
            >
                <Box
                    w="full"
                    h="20px"
                    position="relative"
                    bg="gray.100"
                    borderRadius="sm"
                    overflow="hidden"
                >
                    <Box
                        position="absolute"
                        left={`${mainTransit.startOffset * 100}%`}
                        right={`${mainTransit.endOffset * 100}%`}
                        top="0"
                        bottom="0"
                        bg={aspectColor}
                        opacity={opacity}
                        border={mainTransit.transit.isExact ? "2px solid" : "1px solid"}
                        borderColor={mainTransit.transit.isExact ? aspectColor : "transparent"}
                        borderRadius="sm"
                        cursor="pointer"
                        _hover={{
                            opacity: Math.min(1, opacity + 0.2),
                            transform: 'scaleY(1.1)'
                        }}
                        transition="all 0.2s"
                    />

                    {mainTransit.transit.isExact && mainTransit.transit.exactDate && (
                        <Box
                            position="absolute"
                            left={`${((new Date(mainTransit.transit.exactDate).getTime() - new Date(cell.periodStart).getTime()) /
                                (new Date(cell.periodEnd).getTime() - new Date(cell.periodStart).getTime())) * 100}%`}
                            top="0"
                            bottom="0"
                            w="2px"
                            bg="white"
                            opacity={0.9}
                        />
                    )}
                </Box>
            </Tooltip>
        )
    }

    const aspectsPerPlanet = selectedAspects.size

    // Header delle colonne
    const formatColumnHeader = (date: string | { date: string }) => {
        const dateStr = typeof date === 'string' ? date : date.date
        if (periodType === 'month') {
            const day = new Date(dateStr).getDate()
            return day.toString()
        } else {
            const [_, month] = dateStr.split('-')
            const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
                'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
            return monthNames[parseInt(month) - 1]
        }
    }


    return (
        <Box overflowX="auto">
            <Table.Root variant="line" size="sm">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader w="150px" bg="white" zIndex={2}>
                            Pianeta
                        </Table.ColumnHeader>
                        <Table.ColumnHeader w="100px" bg="white" zIndex={2}>
                            Aspetto
                        </Table.ColumnHeader>
                        {dateColumns.map((dateCol, _) => (
                            <Table.ColumnHeader key={typeof dateCol === 'string' ? dateCol : dateCol.date} w="40px" textAlign="center">
                                {formatColumnHeader(dateCol)}
                            </Table.ColumnHeader>
                        ))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {matrixData.map((row, rowIndex) => {
                        const isFirstRowOfPlanet = rowIndex % aspectsPerPlanet === 0
                        const planetIndex = Math.floor(rowIndex / aspectsPerPlanet)

                        return (
                            <React.Fragment key={`${row.planet}-${row.aspect}`}>
                                {isFirstRowOfPlanet && rowIndex > 0 && (
                                    <Table.Row>
                                        <Table.Cell
                                            colSpan={dateColumns.length + 2}
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

                                    <Table.Cell
                                        position="sticky"
                                        bg={planetIndex % 2 === 0 ? "white" : "blue.25"}
                                        zIndex={1}
                                        borderRight="1px solid"
                                        borderRightColor="gray.200"
                                        w="100px"
                                    >
                                        <HStack gap={2} justify="start">
                                            <Text fontSize="lg" fontWeight="bold">
                                                {ASPECT_SYMBOLS[row.aspect as keyof typeof ASPECT_SYMBOLS]}
                                            </Text>
                                            <Text fontSize="xs" fontWeight="medium">
                                                {row.aspect}
                                            </Text>
                                        </HStack>
                                    </Table.Cell>

                                    {row.cells.map((cell, cellIndex) => (
                                        <Table.Cell
                                            key={cellIndex}
                                            p={1}
                                            bg={planetIndex % 2 === 0 ? "white" : "blue.25"}
                                        >
                                            {periodType === 'month' ? (
                                                <SimpleMatrixCell cell={cell as MatrixCell} periodType={periodType} />
                                            ) : (
                                                <DurationMatrixCell cell={cell as MatrixCellWithDuration} periodType={periodType} />
                                            )}
                                        </Table.Cell>
                                    ))}
                                </Table.Row>
                            </React.Fragment>
                        )
                    })}
                </Table.Body>
            </Table.Root>

            {/* Legenda */}
            <Box mt={4} p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="bold" mb={2}>Legenda:</Text>
                <VStack gap={2} align="start">
                    <HStack gap={6} flexWrap="wrap">
                        <HStack gap={2}>
                            <Box w="20px" h="20px" bg="yellow.400" borderRadius="sm" />
                            <Text fontSize="xs">Congiunzione</Text>
                        </HStack>
                        <HStack gap={2}>
                            <Box w="20px" h="20px" bg="green.400" borderRadius="sm" />
                            <Text fontSize="xs">Sestile</Text>
                        </HStack>
                        <HStack gap={2}>
                            <Box w="20px" h="20px" bg="blue.400" borderRadius="sm" />
                            <Text fontSize="xs">Trigono</Text>
                        </HStack>
                        <HStack gap={2}>
                            <Box w="20px" h="20px" bg="red.400" borderRadius="sm" />
                            <Text fontSize="xs">Quadratura</Text>
                        </HStack>
                        <HStack gap={2}>
                            <Box w="20px" h="20px" bg="purple.400" borderRadius="sm" />
                            <Text fontSize="xs">Opposizione</Text>
                        </HStack>
                    </HStack>
                    <Text fontSize="xs" color="gray.600">
                        {periodType === 'month'
                            ? "• Intensità barra = precisione orb • Bordo spesso = aspetto esatto"
                            : "• Lunghezza barra = durata nel mese • Intensità = precisione orb • Linea bianca = momento esatto"
                        }
                    </Text>
                </VStack>
            </Box>
        </Box>
    )
}