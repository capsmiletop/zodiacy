import { Box, VStack, Text } from '@chakra-ui/react'
import { useEffect } from 'react'

/**
 * Footer component with Brevo newsletter subscription form
 */
export default function Footer() {
  // Parse reCAPTCHA keys from environment variables
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LcyAFIsAAAAAALWg1GtWpx-L6wpmeDSR9P-BStT'
  
  // Check if we're on localhost
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '::1')

  useEffect(() => {
    // Function to hide reCAPTCHA domain errors
    const hideRecaptchaErrors = () => {
      // Hide error elements containing domain-related text
      const allElements = document.querySelectorAll('*')
      allElements.forEach((el) => {
        const text = (el.textContent || '').toLowerCase()
        const classList = Array.from(el.classList).join(' ').toLowerCase()
        const id = (el.id || '').toLowerCase()
        const style = (el as HTMLElement).style
        
        if (
          (text.includes('invalid domain') || 
           text.includes('dominio') || 
           text.includes('domain') || 
           text.includes('errore') || 
           text.includes('error for site owner') ||
           text.includes('site owner')) &&
          (classList.includes('error') || 
           classList.includes('errore') || 
           id.includes('error') || 
           id.includes('recaptcha') ||
           classList.includes('recaptcha'))
        ) {
          style.display = 'none'
          style.visibility = 'hidden'
          style.opacity = '0'
          style.height = '0'
          style.overflow = 'hidden'
        }
      })
      
      // Also hide reCAPTCHA error iframes and containers
      const recaptchaErrors = document.querySelectorAll(
        '[class*="grecaptcha-error"], [id*="recaptcha-error"], iframe[title*="recaptcha"], iframe[src*="recaptcha"], [class*="recaptcha-error"], [id*="grecaptcha"]'
      )
      recaptchaErrors.forEach((el) => {
        const style = (el as HTMLElement).style
        style.display = 'none'
        style.visibility = 'hidden'
        style.opacity = '0'
        style.height = '0'
        style.overflow = 'hidden'
      })
      
      // Hide any error messages in the form
      const errorPanels = document.querySelectorAll('.sib-form-message-panel, [class*="error"], [id*="error"]')
      errorPanels.forEach((panel) => {
        const text = (panel.textContent || '').toLowerCase()
        if (text.includes('invalid domain') || text.includes('dominio') || text.includes('error for site owner')) {
          const style = (panel as HTMLElement).style
          style.display = 'none'
          style.visibility = 'hidden'
        }
      })
    }
    
    // Run error hiding function periodically
    if (typeof window !== 'undefined') {
      setTimeout(hideRecaptchaErrors, 500)
      setTimeout(hideRecaptchaErrors, 1000)
      setTimeout(hideRecaptchaErrors, 2000)
      setTimeout(hideRecaptchaErrors, 5000)
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

    // Load reCAPTCHA script only if not on localhost
    if (!isLocalhost && !document.querySelector('script[src="https://www.google.com/recaptcha/api.js?hl=it"]')) {
      const script2 = document.createElement('script')
      script2.src = 'https://www.google.com/recaptcha/api.js?hl=it'
      
      // Handle reCAPTCHA errors gracefully - hide error messages if domain not allowed
      script2.onerror = () => {
        console.warn('reCAPTCHA failed to load - domain may not be authorized')
        hideRecaptchaErrors()
      }
      
      script2.onload = () => {
        // Set up error hiding after script loads
        setTimeout(hideRecaptchaErrors, 1000)
        setTimeout(hideRecaptchaErrors, 3000)
        
        // Watch for dynamically added error messages
        const observer = new MutationObserver(() => {
          hideRecaptchaErrors()
        })
        
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true
        })
        
        // Stop observing after 10 seconds
        setTimeout(() => observer.disconnect(), 10000)
      }
      
      document.body.appendChild(script2)
    }

    // Set up reCAPTCHA callback function
    if (typeof window !== 'undefined') {
      ;(window as any).handleCaptchaResponse = function() {
        const event = new Event('captchaChange')
        const captchaElement = document.getElementById('sib-captcha')
        if (captchaElement) {
          captchaElement.dispatchEvent(event)
        }
      }
    }
  }, [isLocalhost])

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
                        isLocalhost
                          ? ''
                          : `<div style="padding: 8px 0;">
                              <div class="sib-captcha sib-form-block">
                                <div class="form__entry entry_block">
                                  <div class="form__label-row ">
                                    <div class="g-recaptcha sib-visible-recaptcha" id="sib-captcha" data-sitekey="${siteKey}" data-callback="handleCaptchaResponse" style="direction:ltr"></div>
                                  </div>
                                  <label class="entry__error entry__error--primary" style="font-size:16px; text-align:left; font-family:Helvetica, sans-serif; color:#661d1d; background-color:#ffeded; border-radius:3px; border-color:#ff4949;"></label>
                                </div>
                              </div>
                            </div>`
                      }
                      <div style="padding: 8px 0;">
                        <div class="sib-form-block" style="text-align: left">
                          <button class="sib-form-block__button sib-form-block__button-with-loader" style="font-size:16px; text-align:left; font-weight:700; font-family:Helvetica, sans-serif; color:#FFFFFF; background-color:#3E4857; border-radius:3px; border-width:0px;" form="sib-form" type="submit">
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

        {/* Footer Text */}
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
