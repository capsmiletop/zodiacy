import {
    Box,
    Heading,
    Card,
    VStack,
    HStack,
    Badge,
    Alert,
    Stat,
    SimpleGrid,
    Separator,
    Text,
} from '@chakra-ui/react'

interface ChartResultProps {
    result: any
}

/**
 * Converte i gradi astronomici in formato segno zodiacale
 * @param degrees - Gradi da 0 a 360
 * @returns Stringa formattata con gradi e segno zodiacale
 */
const formatDegrees = (degrees: number) => {
    const zodiacSigns = [
        'Ariete', 'Toro', 'Gemelli', 'Cancro', 'Leone', 'Vergine',
        'Bilancia', 'Scorpione', 'Sagittario', 'Capricorno', 'Acquario', 'Pesci'
    ]

    // Calcola in quale segno zodiacale si trova (ogni segno = 30°)
    const signIndex = Math.floor(degrees / 30)
    const signDegrees = degrees % 30
    const sign = zodiacSigns[signIndex] || 'Sconosciuto'

    return `${signDegrees.toFixed(2)}° ${sign}`
}

/**
 * Formatta i gradi per le case astrologiche
 * @param degrees - Gradi della casa
 * @returns Stringa formattata con i gradi
 */
const formatHouse = (degrees: number) => {
    return formatDegrees(degrees)
}

export default function ChartResult({ result }: ChartResultProps) {
    if (!result) return null

    return (
        <Box width="full" maxW="1000px">
            <Separator mb={6} />

            {result.error ? (
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Box>
                        <Alert.Title>Errore!</Alert.Title>
                        <Alert.Description>{result.error}</Alert.Description>
                    </Box>
                </Alert.Root>
            ) : (
                <VStack gap={6} align="stretch">
                    <Heading as="h3" size="md" textAlign="center" color="purple.600">
                        Carta Astrologica
                    </Heading>

                    {/* Angoli importanti */}
                    <Card.Root>
                        <Card.Header>
                            <Heading as="h4" size="sm">Angoli Principali</Heading>
                        </Card.Header>
                        <Card.Body>
                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                <Stat.Root>
                                    <Stat.Label>Ascendente</Stat.Label>
                                    <Stat.ValueText fontSize="lg">
                                        {formatDegrees(result.ascendant)}
                                    </Stat.ValueText>
                                </Stat.Root>

                                <Stat.Root>
                                    <Stat.Label>Medium Coeli (MC)</Stat.Label>
                                    <Stat.ValueText fontSize="lg">
                                        {formatDegrees(result.mediumCoeli)}
                                    </Stat.ValueText>
                                </Stat.Root>
                            </SimpleGrid>
                        </Card.Body>
                    </Card.Root>

                    {/* Posizioni dei pianeti */}
                    <Card.Root>
                        <Card.Header>
                            <Heading as="h4" size="sm">Posizioni Planetarie</Heading>
                        </Card.Header>
                        <Card.Body>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                                {Object.entries(result.planets).map(([planet, position]) => (
                                    <Box key={planet} p={3} bg="gray.50" borderRadius="md">
                                        <HStack justify="space-between">
                                            <Text fontWeight="semibold">{planet}</Text>
                                            <Badge colorScheme="blue" variant="subtle">
                                                {formatDegrees(position as number)}
                                            </Badge>
                                        </HStack>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Card.Body>
                    </Card.Root>

                    {/* Case astrologiche */}
                    <Card.Root>
                        <Card.Header>
                            <Heading as="h4" size="sm">Case Astrologiche</Heading>
                        </Card.Header>
                        <Card.Body>
                            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={3}>
                                {result.houses.map((house: number, index: number) => (
                                    <Box key={index} p={2} bg="orange.50" borderRadius="md" textAlign="center">
                                        <Text fontSize="sm" fontWeight="medium">Casa {index + 1}</Text>
                                        <Text fontSize="xs" color="gray.600">
                                            {formatHouse(house)}
                                        </Text>
                                    </Box>
                                ))}
                            </SimpleGrid>
                        </Card.Body>
                    </Card.Root>

                    {/* Dati tecnici */}
                    <Card.Root bg="gray.50">
                        <Card.Body>
                            <VStack gap={3}>
                                <Heading as="h4" size="sm" color="gray.700">
                                    Dati Tecnici Completi
                                </Heading>
                                <Box
                                    as="pre"
                                    fontSize="sm"
                                    p={4}
                                    bg="white"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                    overflow="auto"
                                    width="full"
                                    fontFamily="mono"
                                    maxH="300px"
                                >
                                    {JSON.stringify(result, null, 2)}
                                </Box>
                            </VStack>
                        </Card.Body>
                    </Card.Root>
                </VStack>
            )}
        </Box>
    )
}
