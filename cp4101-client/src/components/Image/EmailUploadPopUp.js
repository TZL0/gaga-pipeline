// EmailUploadPopUp.js
import React, { useState, useEffect } from 'react';
import { Button, PopUp } from '../common/index.js';
import { QRCodeCanvas } from 'qrcode.react';
import { FiPlus } from 'react-icons/fi';

const EmailUploadPopUp = ({
  isEmailUploadPopUpActive,
  setIsEmailUploadPopUpActive,
  addToImageGallery,
  getPullImageApi,
  setError,
}) => {
  const [code, setCode] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const generateRandomCode = (length = 8) => {
    const chars = 'abcdefghijkmnopqrstuvwxyz023456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result.toUpperCase();
  };

  useEffect(() => {
    if (isEmailUploadPopUpActive) {
      setCode(generateRandomCode());
    }
  }, [isEmailUploadPopUpActive]);

  const fetchImages = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(getPullImageApi(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        const errData = await response.json();
        setIsFetching(false);
        throw new Error('Error fetching images: ' + errData.error);
      }
      const data = await response.json();
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach((imgUrl) => {
          addToImageGallery(imgUrl);
        });
        setIsEmailUploadPopUpActive(false);
        setCode('');
      } else {
        throw new Error('No images found for this code.');
      }
    } catch (error) {
      setError(error.message);
    }
    setIsFetching(false);
  };

  if (!isEmailUploadPopUpActive) return null;

  const mailtoUrl = `mailto:gaga@tianze.li?subject=${encodeURIComponent(code)}`;

  return (
    <PopUp onClose={() => setIsEmailUploadPopUpActive(false)}>
      <div style={{ padding: '0 3rem', boxSizing: 'border-box' }}>
        <h2>Email Upload Instructions</h2>
        <p>
          Please send an email with the subject <strong>{code}</strong> to{' '}
          <a href="mailto:gaga@tianze.li">gaga@tianze.li</a>.
          <br />
          Attach your image files (JPG, PNG, HEIF) to the email.
        </p>
        <p>
          Scan the QR code below to open your default email client with the
          proper recipient and subject.
        </p>
        <div style={{ margin: '1rem auto', width: 'fit-content' }}>
          <QRCodeCanvas value={mailtoUrl} size={128} />
        </div>
        <p>
          Once the email is sent, fetch the images and add them to your
          gallery.
          <br />
          It may take a few minutes to import the images.
        </p>
        <Button onClick={fetchImages} disabled={isFetching} style={{ margin: '0 auto' }}>
          {isFetching ? 'Fetching...' : 'Fetch Images' } {!isFetching && <FiPlus />}
        </Button>
      </div>
    </PopUp>
  );
};

export default EmailUploadPopUp;
