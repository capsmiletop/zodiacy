import { Box, VStack, HStack, Text } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

/**
 * Footer component with Brevo newsletter subscription form and PayPal button placeholder
 * Positioned at the very bottom of all pages, less prominent
 */
export default function Footer() {
  const paypalButtonRef = useRef<HTMLDivElement>(null)
  const paypalInitializedRef = useRef(false)

  useEffect(() => {
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '::1')

    // Load Brevo form scripts only if not already loaded
    if (!document.querySelector('script[src="https://sibforms.com/forms/end-form/build/main.js"]')) {
      const script1 = document.createElement('script')
      script1.defer = true
      script1.src = 'https://sibforms.com/forms/end-form/build/main.js'
      document.body.appendChild(script1)
    }

    // reCAPTCHA sitekeys are domain-restricted; avoid loading on localhost to prevent console/UI errors
    if (!isLocalhost && !document.querySelector('script[src="https://www.google.com/recaptcha/api.js?hl=it"]')) {
      const script2 = document.createElement('script')
      script2.src = 'https://www.google.com/recaptcha/api.js?hl=it'
      document.body.appendChild(script2)
    }

    // Set up Brevo form configuration (only set once)
    if (typeof window !== 'undefined' && !(window as any).REQUIRED_CODE_ERROR_MESSAGE) {
      ;(window as any).REQUIRED_CODE_ERROR_MESSAGE = 'Scegli un prefisso paese'
      ;(window as any).LOCALE = 'it'
      ;(window as any).EMAIL_INVALID_MESSAGE = (window as any).SMS_INVALID_MESSAGE = "Le informazioni fornite non sono valide. Controlla il formato del campo e riprova."
      ;(window as any).REQUIRED_ERROR_MESSAGE = "Questo campo non può essere lasciato vuoto. "
      ;(window as any).GENERIC_INVALID_MESSAGE = "Le informazioni fornite non sono valide. Controlla il formato del campo e riprova."
      ;(window as any).translation = {
        common: {
          selectedList: '{quantity} lista selezionata',
          selectedLists: '{quantity} liste selezionate',
          selectedOption: '{quantity} selezionato',
          selectedOptions: '{quantity} selezionati',
        }
      }
      ;(window as any).AUTOHIDE = Boolean(0)
    }

    // Initialize PayPal button
    const initializePayPal = () => {
      // Prevent multiple initializations
      if (paypalInitializedRef.current) {
        return
      }

      // Wait a bit more to ensure DOM is ready
      setTimeout(() => {
        const container = paypalButtonRef.current || document.getElementById('paypal-button-container')
        if (!container) {
          console.warn('PayPal container not found, retrying...')
          setTimeout(initializePayPal, 500)
          return
        }

        // Hide fallback button first
        const fallbackButton = document.getElementById('paypal-fallback-button')
        if (fallbackButton) {
          fallbackButton.style.display = 'none'
        }

        // Clear any existing PayPal SDK content (but keep fallback button)
        // PayPal SDK adds elements with various IDs, so we need to be more specific
        const allChildren = Array.from(container.children)
        allChildren.forEach((child) => {
          // Only remove PayPal SDK elements, not the fallback button
          if (child.id !== 'paypal-fallback-button') {
            child.remove()
          }
        })
        
        // Also check for PayPal SDK iframes and divs
        const paypalElements = container.querySelectorAll('iframe, [data-paypal-button], [id*="paypal"], [class*="paypal"]')
        paypalElements.forEach((el) => {
          if (el.id !== 'paypal-fallback-button') {
            el.remove()
          }
        })

        if (typeof (window as any).paypal === 'undefined') {
          console.warn('PayPal SDK not loaded yet')
          if (fallbackButton) {
            fallbackButton.style.display = 'flex'
          }
          return
        }

        const paypal = (window as any).paypal
        const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'YOUR_CLIENT_ID'
        
        if (paypalClientId === 'YOUR_CLIENT_ID') {
          console.warn('PayPal Client ID not set. Please add VITE_PAYPAL_CLIENT_ID to your .env file')
          if (fallbackButton) {
            fallbackButton.style.display = 'flex'
          }
          return
        }
        
        try {
          paypalInitializedRef.current = true
          paypal.Buttons({
            createOrder: function (_data: any, actions: any) {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: '10.00',
                    currency_code: 'EUR'
                  }
                }]
              })
            },
            onApprove: function (_data: any, actions: any) {
              return actions.order.capture().then(function (details: any) {
                alert('Payment completed by ' + details.payer.name.given_name)
              })
            },
            onError: function (err: any) {
              console.error('PayPal error:', err)
              paypalInitializedRef.current = false
              if (fallbackButton) {
                fallbackButton.style.display = 'flex'
              }
            },
            style: {
              color: 'gold',
              shape: 'rect',
              label: 'pay',
              height: 40
            }
          }).render(container).catch((err: any) => {
            console.error('PayPal render error:', err)
            paypalInitializedRef.current = false
            if (fallbackButton) {
              fallbackButton.style.display = 'flex'
            }
          })
        } catch (error) {
          console.error('Error rendering PayPal button:', error)
          paypalInitializedRef.current = false
          if (fallbackButton) {
            fallbackButton.style.display = 'flex'
          }
        }
      }, 200)
    }

    // Load PayPal SDK and initialize button
    const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'YOUR_CLIENT_ID'
    
    if (!document.querySelector('script[src*="paypal.com/sdk/js"]')) {
      const paypalScript = document.createElement('script')
      paypalScript.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR`
      paypalScript.async = true
      
      paypalScript.onload = () => {
        console.log('PayPal SDK loaded')
        initializePayPal()
      }
      
      paypalScript.onerror = () => {
        console.error('Failed to load PayPal SDK')
        // Show placeholder button on error
        setTimeout(() => {
          const container = paypalButtonRef.current || document.getElementById('paypal-button-container')
          if (container) {
            container.innerHTML = `
              <div style="background-color: #FFC439; border-radius: 8px; padding: 12px 24px; cursor: pointer; text-align: center; width: 100%;">
                <span style="font-family: Arial, sans-serif; font-size: 18px; font-weight: 600; font-style: italic; color: #003087;">Pay</span>
                <span style="font-family: Arial, sans-serif; font-size: 18px; font-weight: 600; font-style: italic; color: #009CDE;">Pal</span>
              </div>
            `
          }
        }, 500)
      }
      
      document.body.appendChild(paypalScript)
    } else {
      // Script already loaded, try to initialize
      initializePayPal()
    }
  }, [])

  return (
    <Box
      as="footer"
      w="full"
      mt="auto"
      py={6}
      px={4}
      bg="#1b203e"
      borderTop="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
    >
      <VStack gap={6} align="center" maxW="1200px" mx="auto">
        {/* Brevo Newsletter Form and PayPal Button Container */}
        <HStack
          gap={8}
          align="flex-start"
          justify="center"
          flexWrap="wrap"
          w="full"
        >
          {/* Brevo Newsletter Form */}
                  <Box
            w="full"
            maxW="540px"
            dangerouslySetInnerHTML={{
              __html: `
                <style>
                  @font-face {
                    font-display: block;
                    font-family: Roboto;
                    src: url(https://assets.brevo.com/font/Roboto/Latin/normal/normal/7529907e9eaf8ebb5220c5f9850e3811.woff2) format("woff2"), url(https://assets.brevo.com/font/Roboto/Latin/normal/normal/25c678feafdc175a70922a116c9be3e7.woff) format("woff")
                  }
                  @font-face {
                    font-display: fallback;
                    font-family: Roboto;
                    font-weight: 600;
                    src: url(https://assets.brevo.com/font/Roboto/Latin/medium/normal/6e9caeeafb1f3491be3e32744bc30440.woff2) format("woff2"), url(https://assets.brevo.com/font/Roboto/Latin/medium/normal/71501f0d8d5aa95960f6475d5487d4c2.woff) format("woff")
                  }
                  @font-face {
                    font-display: fallback;
                    font-family: Roboto;
                    font-weight: 700;
                    src: url(https://assets.brevo.com/font/Roboto/Latin/bold/normal/3ef7cf158f310cf752d5ad08cd0e7e60.woff2) format("woff2"), url(https://assets.brevo.com/font/Roboto/Latin/bold/normal/ece3a1d82f18b60bcce0211725c476aa.woff) format("woff")
                  }
                  .sib-form {
                    text-align: center;
                    background-color: transparent;
                  }
                  .sib-form-container {
                    background-color: transparent;
                  }
                  #sib-container {
                    background-color: rgba(30, 35, 60, 0.5);
                    border-color: rgba(255, 255, 255, 0.1);
                  }
                  .sib-form-block p {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 14px;
                  }
                  .entry__label {
                    color: rgba(255, 255, 255, 0.8) !important;
                    font-size: 12px;
                  }
                  #sib-container .input {
                    background-color: white !important;
                    border: 1px solid #D1D5DB !important;
                    color: #1F2937 !important;
                    font-size: 14px;
                    padding: 10px 12px;
                    border-radius: 6px;
                    width: 100%;
                    box-sizing: border-box;
                  }
                  #sib-container .input::placeholder {
                    color: #9CA3AF !important;
                  }
                  #sib-container .input:focus {
                    outline: none;
                    border-color: #3B82F6 !important;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                  }
                  #sib-container input:-ms-input-placeholder {
                    text-align: left;
                    font-family: Helvetica, sans-serif;
                    color: #9CA3AF !important;
                  }
                  #sib-container input::placeholder {
                    text-align: left;
                    font-family: Helvetica, sans-serif;
                    color: #9CA3AF !important;
                  }
                  #sib-container textarea::placeholder {
                    text-align: left;
                    font-family: Helvetica, sans-serif;
                    color: #9CA3AF !important;
                  }
                  .sib-form-block__button {
                    background-color: rgba(62, 72, 87, 0.9) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    color: white !important;
                    font-size: 13px;
                    padding: 10px 20px;
                    border-radius: 4px;
                    border-width: 1px;
                    border-style: solid;
                    font-weight: 700;
                    cursor: pointer;
                  }
                  .sib-form-block__button:hover {
                    background-color: rgba(62, 72, 87, 1) !important;
                  }
                  .entry__specification {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 11px;
                  }
                  #sib-container a {
                    text-decoration: underline;
                    color: #2BB2FC;
                  }
                </style>
                <link rel="stylesheet" href="https://sibforms.com/forms/end-form/build/sib-styles.css">
                <div class="sib-form" style="text-align: center; background-color: transparent;">
                  <div id="sib-form-container" class="sib-form-container">
                    <div id="error-message" class="sib-form-message-panel" style="font-size:16px; text-align:left; font-family:Helvetica, sans-serif; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;max-width:540px;">
                      <div class="sib-form-message-panel__text sib-form-message-panel__text--center">
                        <svg viewBox="0 0 512 512" class="sib-icon sib-notification__icon">
                          <path d="M256 40c118.621 0 216 96.075 216 216 0 119.291-96.61 216-216 216-119.244 0-216-96.562-216-216 0-119.203 96.602-216 216-216m0-32C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm-11.49 120h22.979c6.823 0 12.274 5.682 11.99 12.5l-7 168c-.268 6.428-5.556 11.5-11.99 11.5h-8.979c-6.433 0-11.722-5.073-11.99-11.5l-7-168c-.283-6.818 5.167-12.5 11.99-12.5zM256 340c-15.464 0-28 12.536-28 28s12.536 28 28 28 28-12.536 28-28-12.536-28-28-28z" />
                        </svg>
                        <span class="sib-form-message-panel__inner-text">La tua iscrizione non può essere convalidata.</span>
                      </div>
                    </div>
                    <div></div>
                    <div id="success-message" class="sib-form-message-panel" style="font-size:16px; text-align:left; font-family:Helvetica, sans-serif; color:#085229; background-color:#e7faf0; border-radius:3px; border-color:#13ce66;max-width:540px;">
                      <div class="sib-form-message-panel__text sib-form-message-panel__text--center">
                        <svg viewBox="0 0 512 512" class="sib-icon sib-notification__icon">
                          <path d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 464c-118.664 0-216-96.055-216-216 0-118.663 96.055-216 216-216 118.664 0 216 96.055 216 216 0 118.663-96.055 216-216 216zm141.63-274.961L217.15 376.071c-4.705 4.667-12.303 4.637-16.97-.068l-85.878-86.572c-4.667-4.705-4.637-12.303.068-16.97l8.52-8.451c4.705-4.667 12.303-4.637 16.97.068l68.976 69.533 163.441-162.13c4.705-4.667 12.303-4.637 16.97.068l8.451 8.52c4.668 4.705 4.637 12.303-.068 16.97z" />
                        </svg>
                        <span class="sib-form-message-panel__inner-text">La tua iscrizione è avvenuta correttamente.</span>
                      </div>
                    </div>
                    <div></div>
                    <div id="sib-container" class="sib-container--large sib-container--vertical" style="text-align:center; background-color:rgba(30, 35, 60, 0.5); max-width:540px; border-radius:3px; border-width:1px; border-color:rgba(255, 255, 255, 0.1); border-style:solid; direction:ltr; padding: 16px;">
                      <form id="sib-form" method="POST" action="https://135a3268.sibforms.com/serve/MUIFALfFF33KQu1f5-XFV6nr6_-iSjS9K6rv8ggq7D6I0YHwYHkH8x2oBxSzA6M9M3nxN1GfaZN400--cABqaEbWLO8S97h8AI3yBR5CIM_niyVdxFUVah0Ccb_oGICkgLVLr1vNsz2Guase-h-Myi_RS4iYhG1REm4NErLFmZSr3zml-VShjxNRcIQ26p895EbTeh4Go6vH68Cmyg==" data-type="subscription">
                        <div style="padding: 8px 0;">
                          <div class="sib-form-block" style="font-size:20px; text-align:left; font-weight:700; font-family:Helvetica, sans-serif; color:rgba(255, 255, 255, 0.9); background-color:transparent; text-align:left">
                            <p>Iscriviti alla nostra Newsletter</p>
                          </div>
                        </div>
                        <div style="padding: 8px 0;">
                          <div class="sib-input sib-form-block">
                            <div class="form__entry entry_block">
                              <div class="form__label-row ">
                                <label class="entry__label" style="font-weight: 700; text-align:left; font-size:14px; text-align:left; font-weight:700; font-family:Helvetica, sans-serif; color:rgba(255, 255, 255, 0.8);" for="NOME" data-required="*">NOME</label>
                                <div class="entry__field">
                                  <input class="input " maxlength="200" type="text" id="NOME" name="NOME" autocomplete="off" placeholder="NOME" data-required="true" required style="background-color:white; border:1px solid #D1D5DB; color:#1F2937; padding: 10px 12px; border-radius: 6px; width: 100%;" />
                                </div>
                              </div>
                              <label class="entry__error entry__error--primary" style="font-size:16px; text-align:left; font-family:Helvetica, sans-serif; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                              <label class="entry__specification" style="font-size:12px; text-align:left; font-family:Helvetica, sans-serif; color:rgba(255, 255, 255, 0.5); text-align:left">
                                Indica il tuo nome
                              </label>
                            </div>
                          </div>
                        </div>
                        <div style="padding: 8px 0;">
                          <div class="sib-input sib-form-block">
                            <div class="form__entry entry_block">
                              <div class="form__label-row ">
                                <label class="entry__label" style="font-weight: 700; text-align:left; font-size:14px; text-align:left; font-weight:700; font-family:Helvetica, sans-serif; color:rgba(255, 255, 255, 0.8);" for="EMAIL" data-required="*">E-MAIL</label>
                                <div class="entry__field">
                                  <input class="input " type="text" id="EMAIL" name="EMAIL" autocomplete="off" placeholder="EMAIL" data-required="true" required style="background-color:white; border:1px solid #D1D5DB; color:#1F2937; padding: 10px 12px; border-radius: 6px; width: 100%;" />
                                </div>
                              </div>
                              <label class="entry__error entry__error--primary" style="font-size:16px; text-align:left; font-family:Helvetica, sans-serif; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                              <label class="entry__specification" style="font-size:12px; text-align:left; font-family:Helvetica, sans-serif; color:rgba(255, 255, 255, 0.5); text-align:left">
                                Indica il tuo indirizzo email per iscriverti. Es. abc@xyz.com
                              </label>
                            </div>
                          </div>
                        </div>
                        <div style="padding: 8px 0;">
                          <div class="sib-optin sib-form-block" data-required="true">
                            <div class="form__entry entry_mcq">
                              <div class="form__label-row ">
                                <label class="entry__label" style="font-weight: 700; text-align:left; font-size:14px; text-align:left; font-weight:700; font-family:Helvetica, sans-serif; color:rgba(255, 255, 255, 0.8);" for="OPT_IN" data-required="*">Conferma</label>
                                <div class="entry__choice" style="">
                                  <label>
                                    <input type="checkbox" class="input_replaced" value="1" id="OPT_IN" name="OPT_IN" required />
                                    <span class="checkbox checkbox_tick_positive" style="margin-left:"></span><span style="font-size:14px; text-align:left; font-family:Helvetica, sans-serif; color:rgba(255, 255, 255, 0.7); background-color:transparent;"><p>Accetto le condizioni generali e di ricevere novità e aggiornamenti da parte di Zodiacy.</p></span> </label>
                                </div>
                              </div>
                              <label class="entry__error entry__error--primary" style="font-size:16px; text-align:left; font-family:Helvetica, sans-serif; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                              <label class="entry__specification" style="font-size:12px; text-align:left; font-family:Helvetica, sans-serif; color:rgba(255, 255, 255, 0.5); text-align:left">
                                Puoi annullare l'iscrizione in qualsiasi momento utilizzando il link incluso nella nostra newsletter.
                              </label>
                            </div>
                          </div>
                        </div>
                        ${
                          (typeof window !== 'undefined' &&
                            (window.location.hostname === 'localhost' ||
                              window.location.hostname === '127.0.0.1' ||
                              window.location.hostname === '::1'))
                            ? ''
                            : `<div style="padding: 8px 0;">
                                <div class="g-recaptcha" data-sitekey="6LcgT0ssAAAAAM-6GqBOcvSJkpbLYu9Uk__6EoEM" data-callback="invisibleCaptchaCallback" data-size="invisible" onclick="executeCaptcha"></div>
                              </div>`
                        }
                        <div style="padding: 8px 0;">
                          <div class="sib-form-block" style="text-align: left">
                            <button class="sib-form-block__button sib-form-block__button-with-loader" style="font-size:16px; text-align:left; font-weight:700; font-family:Helvetica, sans-serif; color:#FFFFFF; background-color:#3E4857; border-radius:3px; border-width:0px; padding: 10px 20px;" form="sib-form" type="submit">
                              <svg class="icon clickable__icon progress-indicator__icon sib-hide-loader-icon" viewBox="0 0 512 512" style="">
                                <path d="M460.116 373.846l-20.823-12.022c-5.541-3.199-7.54-10.159-4.663-15.874 30.137-59.886 28.343-131.652-5.386-189.946-33.641-58.394-94.896-95.833-161.827-99.676C261.028 55.961 256 50.751 256 44.352V20.309c0-6.904 5.808-12.337 12.703-11.982 83.556 4.306 160.163 50.864 202.11 123.677 42.063 72.696 44.079 162.316 6.031 236.832-3.14 6.148-10.75 8.461-16.728 5.01z" />
                              </svg>
                              ISCRIVITI
                            </button>
                          </div>
                        </div>
                        <input type="text" name="email_address_check" value="" class="input--hidden">
                        <input type="hidden" name="locale" value="it">
                      </form>
                    </div>
                  </div>
                </div>
              `,
            }}
          />

          {/* PayPal Button */}
          <Box
            w="full"
            maxW="250px"
            textAlign="center"
          >
            <Text fontSize="xs" color="rgba(255, 255, 255, 0.7)" mb={3} fontWeight="medium">
              Supporta il progetto
            </Text>
            <Box
              ref={paypalButtonRef}
              id="paypal-button-container"
              w="full"
              minH="50px"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
            </Box>
            <style>{`
              #paypal-button-container iframe,
              #paypal-button-container > div {
                width: 100% !important;
              }
              #paypal-button-container .paypal-button,
              #paypal-button-container button {
                background-color: #FFC439 !important;
                border-radius: 8px !important;
                padding: 12px 24px !important;
                border: none !important;
                width: 100% !important;
              }
              #paypal-button-container .paypal-button:hover,
              #paypal-button-container button:hover {
                background-color: #FFB800 !important;
              }
            `}</style>
          </Box>
        </HStack>

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
      </VStack>
    </Box>
  )
}

