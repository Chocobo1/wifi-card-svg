import { Button, Heading, Link, Pane, Paragraph } from 'evergreen-ui';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../src/images/wifi.png';
import { Settings } from './components/Settings';
import { WifiCard } from './components/WifiCard';
import './style.css';
import { Translations } from './translations';

function App() {
  const html = document.querySelector('html');
  const { t, i18n } = useTranslation();
  const firstLoad = useRef(true);
  const [settings, setSettings] = useState({
    // Network SSID name
    ssid: '',
    // Network password
    password: '',
    // Settings: Network encryption mode
    encryptionMode: 'WPA',
    // Settings: EAP Method
    eapMethod: 'PWD',
    // Settings: EAP identity
    eapIdentity: '',
    // Settings: Hide password on the printed card
    hidePassword: false,
    // Settings: Mark your network as hidden SSID
    hiddenSSID: false,
    // Settings: Portrait orientation
    portrait: false,
    // Settings: Additional cards
    additionalCards: 0,
    // Settings: Show tip (legend) on card
    hideTip: false,
    // Settings: Show QR code in svg format
    svgImage: true,
  });
  const [errors, setErrors] = useState({
    ssidError: '',
    passwordError: '',
    eapIdentityError: '',
  });

  const htmlDirection = (languageID) => {
    languageID = languageID || i18n.language;
    const rtl = Translations.filter((t) => t.id === languageID)[0]?.rtl;
    return rtl ? 'rtl' : 'ltr';
  };

  const onChangeLanguage = (language) => {
    html.style.direction = htmlDirection(language);
    i18n.changeLanguage(language);
  };

  const onPrint = () => {
    if (!settings.ssid.length) {
      setErrors({
        ...errors,
        ssidError: t('wifi.alert.name'),
      });
      return;
    }
    if (settings.password.length < 8 && settings.encryptionMode === 'WPA') {
      setErrors({
        ...errors,
        passwordError: t('wifi.alert.password.length.8'),
      });
      return;
    }
    if (settings.password.length < 5 && settings.encryptionMode === 'WEP') {
      setErrors({
        ...errors,
        passwordError: t('wifi.alert.password.length.5'),
      });
      return;
    }
    if (
      settings.password.length < 1 &&
      settings.encryptionMode === 'WPA2-EAP'
    ) {
      setErrors({
        ...errors,
        passwordError: t('wifi.alert.password'),
      });
      return;
    }
    if (
      settings.eapIdentity.length < 1 &&
      settings.encryptionMode === 'WPA2-EAP'
    ) {
      setErrors({
        ...errors,
        eapIdentityError: t('wifi.alert.eapIdentity'),
      });
      return;
    }
    document.title = 'WiFi Card - ' + settings.ssid;
    window.print();
  };

  const onSSIDChange = (ssid) => {
    setErrors({ ...errors, ssidError: '' });
    setSettings({ ...settings, ssid });
  };
  const onPasswordChange = (password) => {
    setErrors({ ...errors, passwordError: '' });
    setSettings({ ...settings, password });
  };
  const onEncryptionModeChange = (encryptionMode) => {
    setErrors({ ...errors, passwordError: '' });
    setSettings({ ...settings, encryptionMode });
  };
  const onEapMethodChange = (eapMethod) => {
    setSettings({ ...settings, eapMethod });
  };
  const onEapIdentityChange = (eapIdentity) => {
    setErrors({ ...errors, eapIdentityError: '' });
    setSettings({ ...settings, eapIdentity });
  };
  const onOrientationChange = (portrait) => {
    setSettings({ ...settings, portrait });
  };
  const onSvgImageChange = (svgImage) => {
    setSettings({ ...settings, svgImage });
  };
  const onHidePasswordChange = (hidePassword) => {
    setSettings({ ...settings, hidePassword });
  };
  const onHiddenSSIDChange = (hiddenSSID) => {
    setSettings({ ...settings, hiddenSSID });
  };
  const onAdditionalCardsChange = (additionalCardsStr) => {
    const amount = parseInt(additionalCardsStr);
    amount >= 0 && setSettings({ ...settings, additionalCards: amount });
  };
  const onHideTipChange = (hideTip) => {
    setSettings({ ...settings, hideTip });
  };
  const onFirstLoad = () => {
    html.style.direction = htmlDirection();
    firstLoad.current = false;
  };

  const onSaveImage = () => {
    if (settings.svgImage) {
      // modify svg headers
      const svg = document.getElementById('qrcode').cloneNode(true);
      svg.style = null;
      svg.removeAttribute('class');
      svg.removeAttribute('id');

      let svgSource = new XMLSerializer().serializeToString(svg);
      if (
        !svgSource.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
      ) {
        svgSource = svgSource.replace(
          /^<svg/,
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }

      const svgBlob = new Blob([svgSource], {
        type: 'image/svg+xml; charset=utf-8',
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = settings.ssid;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      return;
    }

    document.getElementById('qrcode').toBlob((blob) => {
      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = settings.ssid;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  };

  useEffect(() => {
    // Ensure the page direction is set properly on first load
    if (htmlDirection() === 'rtl') {
      html.style.direction = 'rtl';
    }
  });

  return (
    <Pane>
      <Pane display="flex">
        <img alt="icon" src={logo} width="32" height="32" />
        <Heading size={900} paddingRight={16} paddingLeft={16}>
          {t('title')}
        </Heading>
      </Pane>

      <Pane>
        <Paragraph marginTop={12}>{t('desc.use')}</Paragraph>

        <Paragraph marginTop={12}>
          {t('desc.privacy')}{' '}
          <Link href="https://github.com/Chocobo1/wifi-card-svg">
            {t('desc.source')}
          </Link>
          .
        </Paragraph>
      </Pane>

      <Pane>
        <WifiCard
          settings={settings}
          ssidError={errors.ssidError}
          passwordError={errors.passwordError}
          eapIdentityError={errors.eapIdentityError}
          onSSIDChange={onSSIDChange}
          onEapIdentityChange={onEapIdentityChange}
          onPasswordChange={onPasswordChange}
        />
      </Pane>

      <Settings
        settings={settings}
        firstLoad={firstLoad}
        onFirstLoad={onFirstLoad}
        onLanguageChange={onChangeLanguage}
        onEncryptionModeChange={onEncryptionModeChange}
        onEapMethodChange={onEapMethodChange}
        onOrientationChange={onOrientationChange}
        onHidePasswordChange={onHidePasswordChange}
        onHiddenSSIDChange={onHiddenSSIDChange}
        onAdditionalCardsChange={onAdditionalCardsChange}
        onHideTipChange={onHideTipChange}
        onSvgImageChange={onSvgImageChange}
      />

      <Button
        id="print"
        appearance="primary"
        height={40}
        marginRight={16}
        onClick={onPrint}
      >
        {t('button.print')}
      </Button>
      <Button
        id="saveImage"
        appearance="primary"
        height={40}
        marginRight={16}
        onClick={onSaveImage}
      >
        {t('button.saveImage')}
      </Button>
      <Pane id="print-area">
        {settings.additionalCards >= 0 &&
          [...Array(settings.additionalCards + 1)].map((el, idx) => (
            <WifiCard
              key={`card-nr-${idx}`}
              settings={settings}
              ssidError={errors.ssidError}
              passwordError={errors.passwordError}
              eapIdentityError={errors.eapIdentityError}
              onSSIDChange={onSSIDChange}
              onEapIdentityChange={onEapIdentityChange}
              onPasswordChange={onPasswordChange}
            />
          ))}
      </Pane>
    </Pane>
  );
}

export default App;
