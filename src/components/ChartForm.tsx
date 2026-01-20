import {
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

interface ChartFormProps {
    selectedDate: string
    selectedTime: string
    latitude: string
    longitude: string
    loading: boolean
    onDateChange: (date: string) => void
    onTimeChange: (time: string) => void
    onLatitudeChange: (lat: string) => void
    onLongitudeChange: (lng: string) => void
    onSubmit: () => void
}

export default function ChartForm({
    selectedDate,
    selectedTime,
    latitude,
    longitude,
    loading,
    onDateChange,
    onTimeChange,
    onLatitudeChange,
    onLongitudeChange,
    onSubmit,
}: ChartFormProps) {
    return (
        <Card.Root size="lg" boxShadow="xl" w="full" maxW="800px">
            <Card.Header>
                <Text fontSize="xl" fontWeight="bold" textAlign="center">
                    Calcolo Carta Astrologica
                </Text>
            </Card.Header>
            <Card.Body>
                <VStack gap={6}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} w="full">
                        <Field.Root>
                            <Field.Label>Data</Field.Label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => onDateChange(e.target.value)}
                                size="lg"
                            />
                        </Field.Root>

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
                            <Field.Label>Latitudine</Field.Label>
                            <Input
                                type="number"
                                step="0.000001"
                                placeholder="es. 45.4642"
                                value={latitude}
                                onChange={(e) => onLatitudeChange(e.target.value)}
                                size="lg"
                            />
                            <Field.HelperText>Latitudine del luogo di nascita</Field.HelperText>
                        </Field.Root>

                        <Field.Root>
                            <Field.Label>Longitudine</Field.Label>
                            <Input
                                type="number"
                                step="0.000001"
                                placeholder="es. 9.1900"
                                value={longitude}
                                onChange={(e) => onLongitudeChange(e.target.value)}
                                size="lg"
                            />
                            <Field.HelperText>Longitudine del luogo di nascita</Field.HelperText>
                        </Field.Root>
                    </SimpleGrid>

                    <Button
                        onClick={onSubmit}
                        disabled={loading || !latitude || !longitude}
                        colorScheme="purple"
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
                            'Calcola Carta Astrologica'
                        )}
                    </Button>
                </VStack>
            </Card.Body>
        </Card.Root>
    )
}
