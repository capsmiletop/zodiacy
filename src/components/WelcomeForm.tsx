import { useState } from 'react'
import {
    Box,
    VStack,
    Text,
    Button,
    Card,
    Input,
    Checkbox,
    Field,
    Flex,
    Image
} from '@chakra-ui/react'

interface WelcomeFormProps {
    onFormCompleted: () => void
}

/**
 * Componente per la pagina iniziale con form email
 * L'utente può lasciare la sua email per rimanere aggiornato
 */
export default function WelcomeForm({ onFormCompleted }: WelcomeFormProps) {
    const [email, setEmail] = useState('')
    const [consent, setConsent] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // URL del Google Form
    const googleFormUrl = "https://forms.gle/ktCnyMy9F9p8tuPE9"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !consent) return

        setIsSubmitting(true)
        
        // Invia i dati al Google Form (qui potresti implementare una chiamata API)
        // Per ora, apriamo semplicemente il Google Form in una nuova finestra
        try {
            // Simula l'invio (in produzione, invieresti i dati al Google Form via API)
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Opzionalmente, apri il Google Form in una nuova finestra
            window.open(googleFormUrl, '_blank')
            
            setIsSubmitting(false)
        } catch (error) {
            console.error('Errore durante l\'invio:', error)
            setIsSubmitting(false)
        }
    }

    const handleFormCompleted = () => {
        onFormCompleted()
    }

    return (
        <Box 
            minH="100vh" 
            bg="#1b203e" 
            color="white"
            position="relative"
            overflow="hidden"
            style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
            }}
        >
            {/* ZODIACY Logo - Positioned 30px from top, centered on mobile */}
            <Flex
                justify={{ base: 'center' }}
                align="center"
                w="full"
                mt="30px"
                mb={{ base: 2, md: 4 }}
            >
                <Image
                    src="/Logo.png"
                    alt="Zodiacy Logo"
                    maxW={{ base: '200px', md: '250px', lg: '300px' }}
                    w="auto"
                    h="auto"
                    objectFit="contain"
                />
            </Flex>

            <Flex
                direction={{ base: 'column', lg: 'row' }}
                minH="100vh"
                align="center"
                justify="center"
                gap={8}
                p={{ base: 4, md: 8 }}
            >
                {/* Left Section - Zodiac Wheel (Desktop only) */}
                <Flex
                    flex="1"
                    display={{ base: 'none', lg: 'flex' }}
                    align="center"
                    justify="center"
                    position="relative"
                >
                    <Image
                        src="/zodiac.png"
                        alt="Zodiac Wheel"
                        maxW="600px"
                        w="100%"
                        h="auto"
                        objectFit="contain"
                        style={{
                            filter: 'drop-shadow(0 0 30px rgba(173, 216, 230, 0.5))',
                            opacity: 0.9
                        }}
                    />
                </Flex>

                {/* Right Section - Content Block */}
                <Box
                    flex="1"
                    maxW={{ base: '100%', lg: '600px' }}
                    w="full"
                >
                    <VStack gap={6} align="stretch">
                        <Text
                            fontSize={{ base: 'sm', md: 'md' }}
                            color="rgba(255, 255, 255, 0.9)"
                            lineHeight="1.6"
                        >
                            Prima di accedere all'applicazione di calcolo astrologico "GetMyTransity", ti diamo la possibilità di lasciarci la tua Mail per rimanere aggiornato sullo sviluppo di questa WebApp.
                        </Text>

                        {/* Content Card */}
                        <Card.Root
                            bg="rgba(30, 35, 60, 0.9)"
                            borderRadius="xl"
                            border="1px solid"
                            borderColor="rgba(255, 255, 255, 0.1)"
                            p={{ base: 6, md: 8 }}
                            w="full"
                        >
                            <VStack gap={6} align="stretch">
                                {/* Title */}
                                <Text
                                    fontSize={{ base: 'lg', md: 'xl' }}
                                    fontWeight="bold"
                                    color="white"
                                >
                                    Lascia qui sotto la tua Mail!
                                </Text>
                                
                                {/* Subtitle */}
                                <Text
                                    fontSize={{ base: 'xs', md: 'sm' }}
                                    color="rgba(255, 255, 255, 0.7)"
                                >
                                    Compila tutti i campi richiesti per restare aggiornato
                                </Text>

                                {/* Email Form */}
                                <form onSubmit={handleSubmit}>
                                    <VStack gap={5} align="stretch">
                                        <Field.Root>
                                            <Field.Label color="rgba(255, 255, 255, 0.9)">
                                                Indirizzo E-Mail*:
                                            </Field.Label>
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="esempio@email.com"
                                                bg="transparent"
                                                border="none"
                                                borderTop="none"
                                                borderLeft="none"
                                                borderRight="none"
                                                borderBottom="1px solid"
                                                borderColor="rgba(255, 255, 255, 0.3)"
                                                borderRadius="0"
                                                color="white"
                                                px={0}
                                                outline="none"
                                                _placeholder={{ color: 'rgba(255, 255, 255, 0.5)' }}
                                                _focus={{
                                                    outline: 'none',
                                                    borderTop: 'none',
                                                    borderLeft: 'none',
                                                    borderRight: 'none',
                                                    borderBottom: '1px solid',
                                                    borderBottomColor: 'rgba(173, 216, 230, 0.6)',
                                                    boxShadow: 'none'
                                                }}
                                                _focusVisible={{
                                                    outline: 'none',
                                                    boxShadow: 'none'
                                                }}
                                                _hover={{
                                                    borderBottomColor: 'rgba(255, 255, 255, 0.5)'
                                                }}
                                                size="lg"
                                                required
                                            />
                                        </Field.Root>

                                        <Checkbox.Root
                                            checked={consent}
                                            onCheckedChange={(details) => setConsent(details.checked as boolean)}
                                            colorPalette="blue"
                                            size="lg"
                                        >
                                            <Checkbox.HiddenInput />
                                            <Checkbox.Control
                                                borderRadius="full"
                                                w="20px"
                                                h="20px"
                                            />
                                            <Checkbox.Label>
                                                <Text fontSize="sm" color="rgba(255, 255, 255, 0.9)">
                                                    Accetti che questa Mail venga salvata tramite questo Google Form e venga esclusivamente usata per tenerti aggiornato su contenuti Zodiacy, tra cui la WebApp "GetMyTransity"?
                                                </Text>
                                            </Checkbox.Label>
                                        </Checkbox.Root>

                                        <Button
                                            type="submit"
                                            w="full"
                                            size="lg"
                                            bg="rgba(255, 255, 255, 0.1)"
                                            border="1px solid"
                                            borderColor="rgba(255, 255, 255, 0.3)"
                                            color="white"
                                            borderRadius="md"
                                            _hover={{
                                                bg: 'rgba(255, 255, 255, 0.2)',
                                                borderColor: 'rgba(255, 255, 255, 0.5)'
                                            }}
                                            loading={isSubmitting}
                                            loadingText="Invio in corso..."
                                        >
                                            Submit
                                        </Button>
                                    </VStack>
                                </form>

                            </VStack>
                        </Card.Root>
                        {/* Disclaimer and Access Button */}
                        <VStack gap={4} align="stretch" mt={4}>
                            <Text
                                fontSize="sm"
                                color="rgba(255, 255, 255, 0.6)"
                                textAlign="center"
                            >
                                * Il questionario NON è obbligatorio per accedere all'applicazione
                            </Text>

                            <Button
                                onClick={handleFormCompleted}
                                w="full"
                                size="lg"
                                bg="rgba(255, 255, 255, 0.1)"
                                border="1px solid"
                                borderColor="rgba(255, 255, 255, 0.3)"
                                color="white"
                                _hover={{
                                    bg: 'rgba(255, 255, 255, 0.2)',
                                    borderColor: 'rgba(255, 255, 255, 0.5)'
                                }}
                            >
                                Vai alla WebApp GetMyTransity ➡️
                            </Button>
                        </VStack>
                    </VStack>
                </Box>
            </Flex>

            {/* Footer */}
            <VStack
                gap={2}
                mt="40px"
                pb="60px"
                px={{ base: 2, md: 0 }}
                align="center"
            >
                <Text
                    fontSize={{ base: 'xs', md: 'sm' }}
                    color="rgba(255, 255, 255, 0.3)"
                    textAlign="center"
                >
                    I tuoi dati verranno esclusivamente usati per aggiornamenti su Zodiacy e la WebApp "GetMyTransity".
                </Text>
                <Text
                    fontSize={{ base: 'xs', md: 'sm' }}
                    color="rgba(255, 255, 255, 0.3)"
                    textAlign="center"
                >
                    Per cancellare i tuoi dati invia in qualsiasi momento una mail a info@zodiacy.com
                </Text>
                <Text fontSize="xm" color="gray.400">
                        Zodiacy © 2026
                </Text>
            </VStack>
        </Box>
    )
}
