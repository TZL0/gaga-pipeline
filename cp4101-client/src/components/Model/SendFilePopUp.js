// SendFilePopUp.js
import React, { useState } from 'react';
import { Button, PopUp } from '../common/index.js';
import { FiSend } from 'react-icons/fi';

const SendFilePopUp = ({
    isSendFilePopUpActive,
    setIsSendFilePopUpActive,
    model,
    packModelFiles,
    getSendFileApi,
    setError,
    setSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendFile = async () => {
    if (!email) {
      alert('Please enter an email address.');
      return;
    }
    setIsSending(true);
    try {
      const zipBlob = await packModelFiles(model);
      if (!zipBlob) {
        throw new Error('No files available to send.');
      }
      
      const formData = new FormData();
      formData.append('email', email);
      const zipFile = new File([zipBlob], 'model.zip', { type: 'application/zip' });
      formData.append('file', zipFile);
      
      const response = await fetch(getSendFileApi(), {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error sending file');
      }
      
      setIsSendFilePopUpActive(false);
      setSuccess('The model has been sent successfully and will reach your email shortly.');
      setEmail('');
    } catch (error) {
      setError(error.message);
    }
    setIsSending(false);
  };

  if (!isSendFilePopUpActive) return null;

  return (
    <PopUp onClose={() => setIsSendFilePopUpActive(false)}>
      <h2>Send Your Model</h2>
      <p>Please enter your email address to receive the model zip file:</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        style={{
          width: '100%',
          padding: '0.5rem',
          margin: '1rem 0',
          fontSize: '1rem',
          boxSizing: 'border-box'
        }}
      />
      <Button onClick={handleSendFile} disabled={isSending}>
        {isSending ? 'Sending...' : 'Send'} {!isSending && <FiSend />}
      </Button>
    </PopUp>
  );
};

export default SendFilePopUp;
