import { Box, Image, Center } from '@chakra-ui/react'

export default function Header() {
  return (
    <Box as="header" w="100%" py={6} bg="#1b203e">
      <Center>
        <Image
          src="/Logo.png"
          alt="Logo Zodiacy"
          boxSize="120px"
          objectFit="contain"
        />
      </Center>
    </Box>
  )
}
