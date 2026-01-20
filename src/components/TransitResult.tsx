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
} from '@chakra-ui/react'

interface TransitResultProps {
    result: any
}

const getPlanetDisplayName = (planet: string) => {
    const planetNames = {
        'SE_SUN': 'Sole',
        'SE_MOON': 'Luna',
        'SE_MERCURY': 'Mercurio',
        'SE_VENUS': 'Venere',
        'SE_MARS': 'Marte',
        'SE_JUPITER': 'Giove',
        'SE_SATURN': 'Saturno',
        'SE_URANUS': 'Urano',
        'SE_NEPTUNE': 'Nettuno',
        'SE_PLUTO': 'Plutone'
    }
    return planetNames[planet as keyof typeof planetNames] || planet
}

const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    })
}

export default function TransitResult({ result }: TransitResultProps) {
    if (!result) return null

    return (
        <Box width="full" maxW="800px">
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
                    <Heading as="h3" size="md" textAlign="center" color="green.600">
                        Risultato del Transito
                    </Heading>

                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                        <Card.Root>
                            <Card.Body>
                                <Stat.Root>
                                    <Stat.Label>Pianeta</Stat.Label>
                                    <HStack>
                                        <Stat.ValueText fontSize="xl">
                                            {getPlanetDisplayName(result.planet)}
                                        </Stat.ValueText>
                                        <Badge colorScheme="orange" variant="solid">
                                            {result.planet}
                                        </Badge>
                                    </HStack>
                                </Stat.Root>
                            </Card.Body>
                        </Card.Root>

                        <Card.Root>
                            <Card.Body>
                                <Stat.Root>
                                    <Stat.Label>Data e Ora</Stat.Label>
                                    <Stat.ValueText fontSize="lg">
                                        {formatDateTime(result.datetime)}
                                    </Stat.ValueText>
                                </Stat.Root>
                            </Card.Body>
                        </Card.Root>

                        <Card.Root>
                            <Card.Body>
                                <Stat.Root>
                                    <Stat.Label>Giorno Giuliano</Stat.Label>
                                    <Stat.ValueText fontSize="xl">
                                        {result.jd?.toLocaleString()}
                                    </Stat.ValueText>
                                </Stat.Root>
                            </Card.Body>
                        </Card.Root>
                    </SimpleGrid>

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
