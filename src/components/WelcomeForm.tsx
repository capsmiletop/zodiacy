import {
    Box,
    VStack,
    Text,
    Button,
    Flex,
    Image
} from '@chakra-ui/react'

interface WelcomeFormProps {
    onFormCompleted: () => void
}

/**
 * Componente per la pagina iniziale di benvenuto
 */
export default function WelcomeForm({ onFormCompleted }: WelcomeFormProps) {
    const handleFormCompleted = () => {
        onFormCompleted()
    }

    return (
        <Box 
            minH="100vh" 
            bg="#1b203e" 
            color="white"
            position="relative"
            style={{
                backgroundImage: `url('/background-stars.png')`
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
                minH="20vh"
                align="center"
                justify="center"
                gap={8}
                p={{ base: 4, md: 8 }}
            >
                {/* Left Section - Zodiac Wheel */}
                <Flex
                    flex="1"
                    display="flex"
                    align="center"
                    justify="center"
                    position="relative"
                >
                    <Image
                        src="/zodiacy.png"
                        alt="Zodiac Wheel"
                        maxW={{ base: '250px', md: '350px', lg: '400px' }}
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
                            Benvenuto nell'applicazione di calcolo astrologico "GetMyTransity". 
                            Utilizza questa WebApp per calcolare il tuo tema natale e i transiti astrologici.
                        </Text>

                        {/* Access Button */}
                        <VStack gap={4} align="stretch" mt={4}>
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

        </Box>
    )
}
