import {
    Box,
    Button,
    Text,
    Card,
    VStack,
    HStack,
    Spinner,
    SimpleGrid,
    Input,
    Field,
} from '@chakra-ui/react'

/**
 * Props per il componente TransitForm
 */
interface TransitFormProps {
    selectedDate: string
    selectedTime: string
    selectedPlanet: string
    loading: boolean
    onDateChange: (date: string) => void
    onTimeChange: (time: string) => void
    onPlanetChange: (planet: string) => void
    onSubmit: () => void
}

/**
 * Lista dei pianeti disponibili per il calcolo dei transiti
 * Ogni pianeta ha un codice Swiss Ephemeris e un nome italiano
 */
const planets = [
    { value: 'SE_SUN', label: 'Sole' },
    { value: 'SE_MOON', label: 'Luna' },
    { value: 'SE_MERCURY', label: 'Mercurio' },
    { value: 'SE_VENUS', label: 'Venere' },
    { value: 'SE_MARS', label: 'Marte' },
    { value: 'SE_JUPITER', label: 'Giove' },
    { value: 'SE_SATURN', label: 'Saturno' },
    { value: 'SE_URANUS', label: 'Urano' },
    { value: 'SE_NEPTUNE', label: 'Nettuno' },
    { value: 'SE_PLUTO', label: 'Plutone' },
]

/**
 * Componente form per il calcolo dei transiti astronomici
 * Permette di selezionare data, ora e pianeta per il calcolo
 */
export default function TransitForm({
    selectedDate,
    selectedTime,
    selectedPlanet,
    loading,
    onDateChange,
    onTimeChange,
    onPlanetChange,
    onSubmit,
}: TransitFormProps) {
    return (
        <Card.Root size="lg" boxShadow="xl" w="full" maxW="800px">
            <Card.Header>
                <Text fontSize="xl" fontWeight="bold" textAlign="center">
                    Calcolo Transito
                </Text>
            </Card.Header>
            <Card.Body>
                <VStack gap={6}>
                    {/* Griglia responsiva per i campi di input */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w="full">
                        {/* Campo per la selezione della data */}
                        <Field.Root>
                            <Field.Label>Data</Field.Label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => onDateChange(e.target.value)}
                                size="lg"
                            />
                        </Field.Root>

                        {/* Campo per la selezione dell'ora */}
                        <Field.Root>
                            <Field.Label>Ora</Field.Label>
                            <Input
                                type="time"
                                value={selectedTime}
                                onChange={(e) => onTimeChange(e.target.value)}
                                size="lg"
                            />
                        </Field.Root>

                        <Field.Root>
                            <Field.Label>Pianeta</Field.Label>
                            <Box>
                                <select
                                    value={selectedPlanet}
                                    onChange={(e) => onPlanetChange(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '16px',
                                        border: '1px solid #d0d5dd',
                                        borderRadius: '8px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {planets.map((planet) => (
                                        <option key={planet.value} value={planet.value}>
                                            {planet.label}
                                        </option>
                                    ))}
                                </select>
                            </Box>
                        </Field.Root>
                    </SimpleGrid>

                    <Button
                        onClick={onSubmit}
                        disabled={loading}
                        colorScheme="blue"
                        size="lg"
                        width="full"
                        mt={4}
                    >
                        {loading ? (
                            <HStack>
                                <Spinner size="sm" />
                                <Text>Calcolo in corso...</Text>
                            </HStack>
                        ) : (
                            `Calcola Transito di ${planets.find(p => p.value === selectedPlanet)?.label}`
                        )}
                    </Button>
                </VStack>
            </Card.Body>
        </Card.Root>
    )
}
