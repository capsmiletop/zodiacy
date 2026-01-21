import { Box, Image, Center, VStack } from '@chakra-ui/react'

export default function Header() {
  return (
    <Box as="header" w="100%" py={6} bg="#1b203e">
      <Center>
        <VStack gap={6} align="center">
          <Image
            src="/Logo.png"
            alt="Zodiacy Logo"
            maxW={{ base: '200px', md: '250px', lg: '300px' }}
            w="auto"
            h="auto"
            objectFit="contain"
          />
          <Image
            src="/zodiacy.png"
            alt="Zodiac Wheel"
            maxW="300px"
            w="100%"
            h="auto"
            objectFit="contain"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(173, 216, 230, 0.5))',
              opacity: 0.9
            }}
          />
        </VStack>
      </Center>
    </Box>
  )
}
