import { useState } from 'react'
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Card,
    Alert,
    Spinner,
    Image
} from '@chakra-ui/react'

interface WelcomeFormProps {
    onFormCompleted: () => void
}

/**
 * Componente per la pagina iniziale con Google Form
 * L'utente deve compilare il form prima di accedere all'applicazione
 */
export default function WelcomeForm({ onFormCompleted }: WelcomeFormProps) {
    const [formCompleted, setFormCompleted] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // URL del Google Form (placeholder per ora)
    const googleFormUrl = "https://forms.gle/ktCnyMy9F9p8tuPE9"

    const handleFormCompleted = () => {
        setFormCompleted(true)
        // Dopo un breve delay per mostrare il messaggio di conferma
        setTimeout(() => {
            onFormCompleted()
        }, 2000)
    }

    const handleIframeLoad = () => {
        setIsLoading(false)
    }

    return (
       <Box minH="100vh" bg="#1b203e" color="white">
            <VStack gap={8} align="center" justify="center" minH="100vh" p={8}>
                <Image
                  src="/Logo.png"
                  alt="Logo Zodiacy"
                  boxSize="120px"
                  objectFit="contain"
                />
                {/* Intestazione */}
                <VStack gap={4} textAlign="center" maxW="800px">
                    <Text
                        fontSize="4xl"
                        fontWeight="bold"
                        bgGradient="linear(to-r, blue.200, purple.300)"
                        bgClip="text"
                    >
                        🌟 Benvenuto su Zodiacy
                    </Text>
                    <Text fontSize="lg" color="gray.600" lineHeight="1.6">
                        Prima di accedere all'applicazione di calcolo astrologico "GetMyTransity",
                        ti diamo la possibilità di lasciarci la tua Mail per rimanere aggiornato sullo sviluppo di questa WebApp.
                    </Text>
                </VStack>

                {/* Card con il form */}
                <Card.Root
                    w="full"
                    maxW="600px"
                    variant="elevated"
                    shadow="2xl"
                    borderRadius="xl"
                >
                    <Card.Header>
                        <VStack gap={2} align="center">
                            <Text fontSize="xl" fontWeight="bold" color="blue.700">
                                Lascia qui sotto la tua Mail!
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                                Compila tutti i campi richiesti per restare aggiornato
                            </Text>
                        </VStack>
                    </Card.Header>

                    <Card.Body p={0}>
                        {/* Loading spinner durante il caricamento del form */}
                        {isLoading && (
                            <VStack gap={4} py={12}>
                                <Spinner size="xl" color="blue.500" />
                                <Text color="gray.600">Caricamento del questionario...</Text>
                            </VStack>
                        )}

                        {/* Google Form iframe */}
                        <Box
                            w="full"
                            h="600px"
                            borderRadius="md"
                            overflow="hidden"
                            display={isLoading ? 'none' : 'block'}
                        >
                            <iframe
                                src={googleFormUrl}
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                                title="Questionario Iniziale"
                                onLoad={handleIframeLoad}
                            >
                                Caricamento in corso...
                            </iframe>
                        </Box>

                        {/* Messaggio di istruzioni */}
                        {!isLoading && !formCompleted && (
                            <Box p={6} bg="blue.50" borderTop="1px solid" borderColor="blue.200">
                                <Alert.Root status="info" variant="subtle">
                                    <Alert.Indicator />
                                    <Box>
                                        <Alert.Title>Come procedere:</Alert.Title>
                                        <Alert.Description>
                                            1. Compila tutti i campi richiesti nel form qui sopra
                                            <br />
                                            2. Clicca su "Invia" nel form di Google
                                            <br />
                                            3. Se vuoi puoi anche ignorare il form e cliccare subito su "Vai alla WebApp GetMyTransity"
                                        </Alert.Description>
                                    </Box>
                                </Alert.Root>
                            </Box>
                        )}

                        {/* Messaggio di completamento */}
                        {formCompleted && (
                            <Box p={6} bg="green.50" borderTop="1px solid" borderColor="green.200">
                                <Alert.Root status="success" variant="subtle">
                                    <Alert.Indicator />
                                    <Box>
                                        <Alert.Title>Grazie!</Alert.Title>
                                        <Alert.Description>
                                            Il questionario è stato completato.
                                            Verrai reindirizzato all'applicazione tra pochi secondi...
                                        </Alert.Description>
                                    </Box>
                                </Alert.Root>
                            </Box>
                        )}
                    </Card.Body>

                    {/* Footer con bottone di conferma */}
                    {!isLoading && !formCompleted && (
                        <Card.Footer>
                            <HStack justify="space-between" w="full">
                                <Text fontSize="sm" color="gray.500">
                                    * Il questionario NON è obbligatorio per accedere all'applicazione
                                </Text>
                                <Button
                                    colorScheme="blue"
                                    size="lg"
                                    onClick={handleFormCompleted}
                                >
                                    Vai alla WebApp GetMyTransity ➡️
                                </Button>
                            </HStack>
                        </Card.Footer>
                    )}
                </Card.Root>

                {/* Footer con informazioni aggiuntive */}
                <VStack gap={2} textAlign="center" opacity={0.7}>
                    <Text fontSize="sm" color="gray.500">
                        I tuoi dati veranno esclusivamente usati per aggiornamenti su Zodiacy e la WebApp "GetMyTransity". Per cancellare i tuoi dati invia in qualsiasi momento una mail a info@zodiacy.com

                    </Text>
                    <Text fontSize="xs" color="gray.400">
                        Zodiacy © 2025
                    </Text>
                </VStack>
            </VStack>
        </Box>
    )
}
