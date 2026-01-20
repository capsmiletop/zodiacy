import React from 'react'
import {
    Box,
    Heading,
    Text,
    VStack,
    Card,
    CardBody,
    Button,
    HStack,
    Icon
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiTable, FiPlus, FiSettings, FiHome } from 'react-icons/fi'

const TestingHome: React.FC = () => {
    const testingRoutes = [
        {
            path: '/testing/transits-table',
            title: 'Tabella Transiti',
            description: 'Test della nuova tabella dei transiti con filtri per periodo',
            icon: FiTable,
            status: 'new'
        }
    ]

    return (
        <Box minH="100vh" bg="#1b203e" color="white">
            <Box maxW="6xl" mx="auto" p={6}>
                <VStack gap={8} align="stretch">
                    {/* Header con navigazione */}
                    <HStack justify="space-between" align="center">
                        <Box textAlign="center" flex={1}>
                            <Heading size="2xl" mb={4} color="white">
                                🧪 Area Testing
                            </Heading>
                            <Text fontSize="lg" color="gray.300">
                                Qui puoi testare le nuove funzionalità in sviluppo
                            </Text>
                        </Box>

                        <Button asChild variant="outline" borderColor="white" color="white" _hover={{ bg: "whiteAlpha.100" }}>
                            <RouterLink to="/">
                                <Icon as={FiHome} />
                                Torna alla Home
                            </RouterLink>
                        </Button>
                    </HStack>

                    <VStack gap={4} align="stretch">
                        {testingRoutes.map((route) => (
                            <Card.Root key={route.path} variant="outline" bg="whiteAlpha.100" borderColor="whiteAlpha.300">
                                <CardBody>
                                    <HStack gap={4}>
                                        <Box
                                            p={3}
                                            borderRadius="md"
                                            bg="blue.500"
                                            color="white"
                                        >
                                            <Icon as={route.icon} boxSize={6} />
                                        </Box>

                                        <VStack align="start" flex={1} gap={1}>
                                            <HStack>
                                                <Heading size="md" color="white">{route.title}</Heading>
                                                {route.status === 'new' && (
                                                    <Box
                                                        px={2}
                                                        py={1}
                                                        bg="green.500"
                                                        color="white"
                                                        borderRadius="md"
                                                        fontSize="xs"
                                                        fontWeight="bold"
                                                    >
                                                        NUOVO
                                                    </Box>
                                                )}
                                            </HStack>
                                            <Text color="gray.300">{route.description}</Text>
                                        </VStack>

                                        <Button asChild colorScheme="blue">
                                            <RouterLink to={route.path}>
                                                <Icon as={FiPlus} />
                                                Testa
                                            </RouterLink>
                                        </Button>
                                    </HStack>
                                </CardBody>
                            </Card.Root>
                        ))}
                    </VStack>

                    <Box mt={8} p={4} bg="yellow.500" color="black" borderRadius="md">
                        <HStack>
                            <Icon as={FiSettings} />
                            <Text fontSize="sm">
                                <strong>Nota:</strong> Questa è un'area di sviluppo. Le funzionalità qui presenti potrebbero non essere complete o stabili.
                            </Text>
                        </HStack>
                    </Box>
                </VStack>
            </Box>
        </Box>
    )
}

export default TestingHome