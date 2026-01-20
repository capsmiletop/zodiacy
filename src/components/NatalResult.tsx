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
    Table,
    Tabs,
} from '@chakra-ui/react'
import TransitTable from './TransitTable'
import TransitDebugView from './TransitDebugView'

interface NatalResultProps {
    result: any
    monthlyTransits?: any
}

/**
 * Formatta le informazioni zodiacali in modo leggibile
 */
const formatZodiacInfo = (zodiacInfo: any) => {
    if (!zodiacInfo) return 'N/A'
    return `${zodiacInfo.formatted}`
}

/**
 * Estrae e formatta i dati planetari dai transiti mensili
 * @param monthData - Dati del mese che contengono le date come chiavi (es. "1/6", "15/6", "30/6")
 * @param planetName - Nome del pianeta
 */
const formatPlanetData = (monthData: any, planetName: string) => {
    if (!monthData) return 'No data'

    // monthData contiene date come chiavi, prendiamo l'ultima data disponibile
    const dates = Object.keys(monthData)
    if (dates.length === 0) return 'N/A'

    // Prendiamo l'ultima data del mese (di solito è quella più rappresentativa)
    const lastDate = dates[dates.length - 1]
    const dateData = monthData[lastDate]

    if (dateData && dateData[planetName]) {
        const planetData = dateData[planetName]
        if (planetData.zodiac) {
            //return `${planetData.zodiac.degree}° ${planetData.zodiac.sign}`
            return `${planetData.zodiac.formatted}`
        }
        if (planetData.longitude) {
            return `${parseFloat(planetData.longitude).toFixed(1)}°`
        }
    }

    return 'N/A'
}/**
 * Componente per visualizzare i risultati del tema natale
 * Include pianeti, case, aspetti e transiti mensili
 */
export default function NatalResult({ result, monthlyTransits }: NatalResultProps) {
    if (!result) return null

    return (
        <Box width="full" maxW="1200px">
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
                <Tabs.Root defaultValue="planets" variant="enclosed">
                    <Tabs.List mb={6}>
                        <Tabs.Trigger value="planets">Pianeti</Tabs.Trigger>
                        <Tabs.Trigger value="houses">Case</Tabs.Trigger>
                        <Tabs.Trigger value="aspects">Aspetti</Tabs.Trigger>
                        {monthlyTransits && <Tabs.Trigger value="transits">Transiti Mensili</Tabs.Trigger>}
                        {monthlyTransits && <Tabs.Trigger value="transit-table">Tabella Transiti</Tabs.Trigger>}
                        {monthlyTransits && <Tabs.Trigger value="transit-debug">🔍 Debug Transiti</Tabs.Trigger>}
                    </Tabs.List>

                    {/* Tab Pianeti */}
                    <Tabs.Content value="planets">
                        <VStack gap={6} align="stretch">
                            <Heading as="h3" size="md" textAlign="center" color="green.600">
                                Posizioni Planetarie
                            </Heading>

                            {/* Angoli principali */}
                            <Card.Root>
                                <Card.Header>
                                    <Heading as="h4" size="sm">Angoli Principali</Heading>
                                </Card.Header>
                                <Card.Body>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                        <Stat.Root>
                                            <Stat.Label>Ascendente</Stat.Label>
                                            <Stat.ValueText fontSize="lg" color="orange.600">
                                                {formatZodiacInfo(result.ascendente?.zodiac)}
                                            </Stat.ValueText>
                                        </Stat.Root>

                                        <Stat.Root>
                                            <Stat.Label>Medio Coeli (MC)</Stat.Label>
                                            <Stat.ValueText fontSize="lg" color="orange.600">
                                                {formatZodiacInfo(result.medioCoeli?.zodiac)}
                                            </Stat.ValueText>
                                        </Stat.Root>
                                    </SimpleGrid>
                                </Card.Body>
                            </Card.Root>

                            {/* Pianeti */}
                            <Card.Root>
                                <Card.Header>
                                    <Heading as="h4" size="sm">Posizioni Planetarie nel Tema Natale</Heading>
                                </Card.Header>
                                <Card.Body>
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                                        {result.pianeti && Object.entries(result.pianeti).map(([planet, data]: [string, any]) => (
                                            <Box key={planet} p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                                                <VStack align="start" gap={2}>
                                                    <HStack>
                                                        <Text fontWeight="bold" fontSize="lg">{planet}</Text>
                                                        <Badge colorScheme="green" variant="solid">
                                                            Casa {data.house}
                                                        </Badge>
                                                    </HStack>
                                                    <Text fontSize="md" color="green.700">
                                                        📍 {formatZodiacInfo(data.zodiac)}
                                                    </Text>
                                                    {/*<Text fontSize="sm" color="gray.600">
                                                        🏠 {data.houseName}
                                                    </Text>
                                                    */}
                                                </VStack>
                                            </Box>
                                        ))}
                                    </SimpleGrid>
                                </Card.Body>
                            </Card.Root>
                        </VStack>
                    </Tabs.Content>

                    {/* Tab Case */}
                    <Tabs.Content value="houses">
                        <VStack gap={6} align="stretch">
                            <Heading as="h3" size="md" textAlign="center" color="purple.600">
                                Case Astrologiche
                            </Heading>

                            <Card.Root>
                                <Card.Body>
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                                        {result.case && Object.entries(result.case).map(([houseNum, houseData]: [string, any]) => (
                                            <Box key={houseNum} p={4} bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
                                                <VStack align="start" gap={2}>
                                                    <HStack>
                                                        <Text fontWeight="bold" fontSize="lg">Casa {houseNum}</Text>
                                                        <Badge colorScheme="purple" variant="outline">
                                                            {formatZodiacInfo(houseData.zodiac)}
                                                        </Badge>
                                                    </HStack>
                                                    {/*<Text fontSize="sm" color="gray.600">
                                                        {houseData.name}
                                                    </Text>*/}
                                                </VStack>
                                            </Box>
                                        ))}
                                    </SimpleGrid>
                                </Card.Body>
                            </Card.Root>
                        </VStack>
                    </Tabs.Content>

                    {/* Tab Aspetti */}
                    <Tabs.Content value="aspects">
                        <VStack gap={6} align="stretch">
                            <Heading as="h3" size="md" textAlign="center" color="blue.600">
                                Aspetti Planetari
                            </Heading>

                            <Card.Root>
                                <Card.Body>
                                    {result.aspetti && result.aspetti.length > 0 ? (
                                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                            {result.aspetti.map((aspectGroup: any, index: number) => (
                                                <Box key={index} p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                                                    <VStack align="start" gap={2}>
                                                        <HStack>
                                                            <Text fontWeight="semibold">{aspectGroup.planet1}</Text>
                                                            <Text>⟷</Text>
                                                            <Text fontWeight="semibold">{aspectGroup.planet2}</Text>
                                                        </HStack>
                                                        {aspectGroup.aspects.map((aspect: any, aspIndex: number) => (
                                                            <Badge key={aspIndex} colorScheme="blue" variant="subtle">
                                                                {aspect.type} ({aspect.orb}°)
                                                            </Badge>
                                                        ))}
                                                    </VStack>
                                                </Box>
                                            ))}
                                        </SimpleGrid>
                                    ) : (
                                        <Text textAlign="center" color="gray.500">
                                            Nessun aspetto significativo trovato
                                        </Text>
                                    )}
                                </Card.Body>
                            </Card.Root>
                        </VStack>
                    </Tabs.Content>

                    {/* Tab Transiti Mensili */}
                    {monthlyTransits && (
                        <Tabs.Content value="transits">
                            <VStack gap={6} align="stretch">
                                <Heading as="h3" size="md" textAlign="center" color="orange.600">
                                    Transiti Mensili ({monthlyTransits.periodo})
                                </Heading>



                                <Card.Root>
                                    <Card.Header>
                                        <Heading as="h4" size="sm">Tabella Riassuntiva Transiti</Heading>
                                    </Card.Header>
                                    <Card.Body>
                                        <Box overflowX="auto">
                                            <Table.Root size="sm" variant="outline">
                                                <Table.Header>
                                                    <Table.Row>
                                                        <Table.ColumnHeader>Mese</Table.ColumnHeader>
                                                        <Table.ColumnHeader>☉ Sole</Table.ColumnHeader>
                                                        <Table.ColumnHeader>☽ Luna</Table.ColumnHeader>
                                                        <Table.ColumnHeader>☿ Mercurio</Table.ColumnHeader>
                                                        <Table.ColumnHeader>♀ Venere</Table.ColumnHeader>
                                                        <Table.ColumnHeader>♂ Marte</Table.ColumnHeader>
                                                        <Table.ColumnHeader>♃ Giove</Table.ColumnHeader>
                                                        <Table.ColumnHeader>♄ Saturno</Table.ColumnHeader>
                                                        <Table.ColumnHeader>♅ Urano</Table.ColumnHeader>
                                                        <Table.ColumnHeader>♆ Nettuno</Table.ColumnHeader>
                                                        <Table.ColumnHeader>♇ Plutone</Table.ColumnHeader>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {monthlyTransits.transiti && Object.entries(monthlyTransits.transiti).map(([month, data]: [string, any]) => (
                                                        <Table.Row key={month}>
                                                            <Table.Cell fontWeight="semibold">{month}</Table.Cell>
                                                            <Table.Cell fontSize="sm">{formatPlanetData(data, 'Sole')}</Table.Cell>
                                                            <Table.Cell fontSize="sm">{formatPlanetData(data, 'Luna')}</Table.Cell>
                                                            <Table.Cell fontSize="sm">{formatPlanetData(data, 'Mercurio')}</Table.Cell>
                                                            <Table.Cell fontSize="sm">{formatPlanetData(data, 'Venere')}</Table.Cell>
                                                            <Table.Cell fontSize="sm">{formatPlanetData(data, 'Marte')}</Table.Cell>
                                                            <Table.Cell fontSize="sm">{formatPlanetData(data, 'Giove')}</Table.Cell>
                                                            <Table.Cell fontSize="sm">{formatPlanetData(data, 'Saturno')}</Table.Cell>
                                                            <Table.Cell fontSize="sm">{formatPlanetData(data, 'Urano')}</Table.Cell>
                                                            <Table.Cell fontSize="sm">{formatPlanetData(data, 'Nettuno')}</Table.Cell>
                                                            <Table.Cell fontSize="sm">{formatPlanetData(data, 'Plutone')}</Table.Cell>
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table.Root>
                                        </Box>
                                    </Card.Body>
                                </Card.Root>

                                {/* Vista dettagliata mensile */}
                                <Card.Root>
                                    <Card.Header>
                                        <Heading as="h4" size="sm">Dettagli Mensili</Heading>
                                    </Card.Header>
                                    <Card.Body>
                                        <VStack gap={4} align="stretch">
                                            {monthlyTransits.transiti && Object.entries(monthlyTransits.transiti).map(([month, monthData]: [string, any]) => (
                                                <Box key={month} p={4} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200">
                                                    <Heading as="h5" size="xs" mb={3} color="orange.700">
                                                        📅 {month}
                                                    </Heading>

                                                    {/* Itera attraverso le date del mese */}
                                                    <VStack gap={3} align="stretch">
                                                        {Object.entries(monthData).map(([date, dateData]: [string, any]) => (
                                                            <Box key={date} p={3} bg="white" borderRadius="sm" border="1px solid" borderColor="orange.300">
                                                                <Text fontSize="xs" fontWeight="bold" mb={2} color="orange.800">
                                                                    {date}
                                                                </Text>
                                                                <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} gap={2}>
                                                                    {Object.entries(dateData).map(([planetName, planetData]: [string, any]) => (
                                                                        <Box key={planetName} p={1} bg="orange.25" borderRadius="xs">
                                                                            <Text fontSize="xs" fontWeight="semibold" color="orange.900">
                                                                                {planetName}
                                                                            </Text>
                                                                            <Text fontSize="xs" color="gray.600">
                                                                                {planetData?.zodiac ? `${planetData.zodiac.degree}° ${planetData.zodiac.sign}` : 'N/A'}
                                                                            </Text>
                                                                        </Box>
                                                                    ))}
                                                                </SimpleGrid>
                                                            </Box>
                                                        ))}
                                                    </VStack>
                                                </Box>
                                            ))}
                                        </VStack>
                                    </Card.Body>
                                </Card.Root>
                            </VStack>
                        </Tabs.Content>
                    )}

                    {/* Tab Tabella Transiti */}
                    {monthlyTransits && (
                        <Tabs.Content value="transit-table">
                            <VStack gap={6} align="stretch">
                                <Heading as="h3" size="md" textAlign="center" color="purple.600">
                                    Tabella Dinamica Transiti
                                </Heading>

                                <TransitTable
                                    userName="Utente"
                                    startDate={monthlyTransits.periodo?.split(' - ')[0] || '2025-01-01'}
                                    endDate={monthlyTransits.periodo?.split(' - ')[1] || '2025-12-31'}
                                    natalChart={result}
                                    onNotesChange={(planetName, notes) => {
                                        console.log(`Note per ${planetName}:`, notes)
                                    }}
                                />
                            </VStack>
                        </Tabs.Content>
                    )}

                    {/* Tab Debug Transiti */}
                    {monthlyTransits && (
                        <Tabs.Content value="transit-debug">
                            <VStack gap={6} align="stretch">
                                <Heading as="h3" size="md" textAlign="center" color="purple.600">
                                    Debug Transiti Giornalieri
                                </Heading>

                                <TransitDebugView
                                    startDate={monthlyTransits.periodo?.split(' - ')[0] || '2025-01-01'}
                                    endDate={monthlyTransits.periodo?.split(' - ')[1] || '2025-12-31'}
                                    natalChart={result}
                                />
                            </VStack>
                        </Tabs.Content>
                    )}

                    {/* Dati tecnici */}
                    <Box mt={8}>
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
                    </Box>
                </Tabs.Root>
            )}
        </Box>
    )
}
