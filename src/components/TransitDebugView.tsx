import { useState } from 'react'
import {
    Box,
    Text,
    Card,
    VStack,
    HStack,
    Button,
    Accordion,
    Badge,
    Grid,
    Spinner,
    Code,
    Table,
} from '@chakra-ui/react'
import { fetchTransitiSpecifici } from '../lib/api'

interface TransitDebugViewProps {
    startDate: string
    endDate: string
    natalChart: any
}

interface DayTransitData {
    date: string
    data: any
    error?: string
}

export default function TransitDebugView({
    startDate,
    endDate,
    natalChart
}: TransitDebugViewProps) {
    const [transitData, setTransitData] = useState<DayTransitData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)

    const loadTransitData = async () => {
        if (!natalChart?.pianeti) return

        setIsLoading(true)
        setTransitData([])

        try {
            const results: DayTransitData[] = []
            const start = new Date(startDate)
            const end = new Date(endDate)

            // Limitiamo a max 30 giorni per il debug
            const maxDays = 30
            let dayCount = 0

            for (let d = new Date(start); d <= end && dayCount < maxDays; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0]

                try {
                    const dayTransits = await fetchTransitiSpecifici(dateStr, natalChart)
                    results.push({
                        date: dateStr,
                        data: dayTransits
                    })
                } catch (err) {
                    results.push({
                        date: dateStr,
                        data: null,
                        error: err instanceof Error ? err.message : 'Errore sconosciuto'
                    })
                }

                dayCount++
            }

            setTransitData(results)
        } catch (err) {
            console.error('Errore nel caricamento dei transiti:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const selectedData = transitData.find(d => d.date === selectedDate)

    return (
        <Card.Root>
            <Card.Header>
                <VStack align="start" gap={3}>
                    <HStack justify="space-between" w="full">
                        <Text fontSize="xl" fontWeight="bold" color="purple.700">
                            🔍 Debug Transiti Giornalieri
                        </Text>
                        <Button
                            onClick={loadTransitData}
                            loading={isLoading}
                            colorScheme="purple"
                            size="sm"
                        >
                            Carica Dati
                        </Button>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                        Visualizzazione dettagliata dei dati dei transiti dal server (max 30 giorni)
                    </Text>
                    <HStack gap={4} fontSize="xs" color="gray.500">
                        <Text>Periodo: {formatDate(startDate)} - {formatDate(endDate)}</Text>
                        <Badge colorScheme="blue">
                            {transitData.length} giorni caricati
                        </Badge>
                    </HStack>
                </VStack>
            </Card.Header>

            <Card.Body>
                {isLoading && (
                    <VStack gap={4} align="center" py={8}>
                        <Spinner size="lg" />
                        <Text>Caricamento dati di debug...</Text>
                    </VStack>
                )}

                {!isLoading && transitData.length === 0 && (
                    <VStack gap={4} align="center" py={8}>
                        <Text color="gray.500">
                            Nessun dato caricato. Clicca "Carica Dati" per iniziare.
                        </Text>
                    </VStack>
                )}

                {transitData.length > 0 && (
                    <Grid templateColumns="1fr 2fr" gap={6} h="600px">
                        {/* Lista delle date */}
                        <Box>
                            <Text fontSize="md" fontWeight="bold" mb={4}>
                                Date disponibili:
                            </Text>
                            <VStack align="stretch" gap={2} maxH="500px" overflowY="auto">
                                {transitData.map((dayData) => (
                                    <Button
                                        key={dayData.date}
                                        variant={selectedDate === dayData.date ? "solid" : "outline"}
                                        colorScheme={dayData.error ? "red" : "blue"}
                                        size="sm"
                                        onClick={() => setSelectedDate(dayData.date)}
                                        justifyContent="flex-start"
                                    >
                                        <VStack align="start" gap={0}>
                                            <Text fontSize="xs">
                                                {new Date(dayData.date).toLocaleDateString('it-IT')}
                                            </Text>
                                            {dayData.error ? (
                                                <Text fontSize="xs" color="red.300">
                                                    Errore
                                                </Text>
                                            ) : (
                                                <Text fontSize="xs" color="green.300">
                                                    {dayData.data?.aspettiDiTransito?.length || 0} aspetti
                                                </Text>
                                            )}
                                        </VStack>
                                    </Button>
                                ))}
                            </VStack>
                        </Box>

                        {/* Dettagli del giorno selezionato */}
                        <Box>
                            {selectedData ? (
                                <VStack align="stretch" gap={4}>
                                    <Text fontSize="md" fontWeight="bold">
                                        Dettagli per {formatDate(selectedData.date)}
                                    </Text>

                                    {selectedData.error ? (
                                        <Card.Root bg="red.50" borderColor="red.200">
                                            <Card.Body>
                                                <Text color="red.600" fontWeight="bold">
                                                    Errore: {selectedData.error}
                                                </Text>
                                            </Card.Body>
                                        </Card.Root>
                                    ) : (
                                        <VStack align="stretch" gap={4} maxH="500px" overflowY="auto">
                                            {/* Informazioni generali */}
                                            <Card.Root bg="blue.50" borderColor="blue.200">
                                                <Card.Header>
                                                    <Text fontWeight="bold" color="blue.700">
                                                        Informazioni Generali
                                                    </Text>
                                                </Card.Header>
                                                <Card.Body>
                                                    <VStack align="start" gap={2}>
                                                        <Text fontSize="sm">
                                                            <strong>Data:</strong> {selectedData.data?.data}
                                                        </Text>
                                                        <Text fontSize="sm">
                                                            <strong>JD:</strong> {selectedData.data?.jd}
                                                        </Text>
                                                        <Text fontSize="sm">
                                                            <strong>Aspetti trovati:</strong> {selectedData.data?.aspettiDiTransito?.length || 0}
                                                        </Text>
                                                    </VStack>
                                                </Card.Body>
                                            </Card.Root>

                                            {/* Posizioni dei transiti */}
                                            {selectedData.data?.posizioniTransiti && (
                                                <Card.Root bg="green.50" borderColor="green.200">
                                                    <Card.Header>
                                                        <Text fontWeight="bold" color="green.700">
                                                            Posizioni Transiti
                                                        </Text>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <Table.Root size="sm">
                                                            <Table.Header>
                                                                <Table.Row>
                                                                    <Table.ColumnHeader>Pianeta</Table.ColumnHeader>
                                                                    <Table.ColumnHeader>Longitudine</Table.ColumnHeader>
                                                                    <Table.ColumnHeader>Segno</Table.ColumnHeader>
                                                                    <Table.ColumnHeader>Gradi</Table.ColumnHeader>
                                                                </Table.Row>
                                                            </Table.Header>
                                                            <Table.Body>
                                                                {Object.entries(selectedData.data.posizioniTransiti).map(([planet, data]: [string, any]) => (
                                                                    <Table.Row key={planet}>
                                                                        <Table.Cell fontWeight="medium">{planet}</Table.Cell>
                                                                        <Table.Cell>{data.longitude}</Table.Cell>
                                                                        <Table.Cell>{data.zodiac?.sign || 'N/A'}</Table.Cell>
                                                                        <Table.Cell>{data.zodiac.formatted || 'N/A'}</Table.Cell>
                                                                    </Table.Row>
                                                                ))}
                                                            </Table.Body>
                                                        </Table.Root>
                                                    </Card.Body>
                                                </Card.Root>
                                            )}

                                            {/* Aspetti di transito */}
                                            {selectedData.data?.aspettiDiTransito && (
                                                <Card.Root bg="orange.50" borderColor="orange.200">
                                                    <Card.Header>
                                                        <Text fontWeight="bold" color="orange.700">
                                                            Aspetti di Transito ({selectedData.data.aspettiDiTransito.length})
                                                        </Text>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <VStack align="stretch" gap={2}>
                                                            {selectedData.data.aspettiDiTransito.map((aspect: any, index: number) => (
                                                                <Box key={index} p={3} bg="white" borderRadius="md" border="1px solid" borderColor="orange.200">
                                                                    <VStack align="start" gap={1}>
                                                                        <Text fontSize="sm" fontWeight="bold">
                                                                            {aspect.transitPlanet} → {aspect.natalPlanet}
                                                                        </Text>
                                                                        {aspect.aspects.map((asp: any, aspIndex: number) => (
                                                                            <HStack key={aspIndex} gap={2}>
                                                                                <Badge colorScheme="orange" size="sm">
                                                                                    {asp.type}
                                                                                </Badge>
                                                                                <Text fontSize="xs">
                                                                                    Orb: {asp.orb}° ({asp.degrees}°)
                                                                                </Text>
                                                                            </HStack>
                                                                        ))}
                                                                    </VStack>
                                                                </Box>
                                                            ))}
                                                        </VStack>
                                                    </Card.Body>
                                                </Card.Root>
                                            )}

                                            {/* JSON Raw (collassabile) */}
                                            <Accordion.Root collapsible>
                                                <Accordion.Item value="raw-json">
                                                    <Accordion.ItemTrigger>
                                                        <Text fontSize="sm" fontWeight="bold">
                                                            Dati Raw JSON
                                                        </Text>
                                                    </Accordion.ItemTrigger>
                                                    <Accordion.ItemContent>
                                                        <Box maxH="300px" overflowY="auto">
                                                            <Code fontSize="xs" p={4} bg="gray.100" borderRadius="md" display="block" whiteSpace="pre-wrap">
                                                                {JSON.stringify(selectedData.data, null, 2)}
                                                            </Code>
                                                        </Box>
                                                    </Accordion.ItemContent>
                                                </Accordion.Item>
                                            </Accordion.Root>
                                        </VStack>
                                    )}
                                </VStack>
                            ) : (
                                <Text color="gray.500" textAlign="center" py={8}>
                                    Seleziona una data dalla lista per visualizzare i dettagli
                                </Text>
                            )}
                        </Box>
                    </Grid>
                )}
            </Card.Body>
        </Card.Root>
    )
}
