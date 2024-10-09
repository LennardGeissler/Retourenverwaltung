import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const LicenseCheck: React.FC<{ onLicenseValid: () => void }> = ({ onLicenseValid }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [valid, setValid] = useState<boolean | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
        } else {
            const newUserId = uuidv4();
            localStorage.setItem('userId', newUserId);
            setUserId(newUserId);
        }
    }, []);

    useEffect(() => {
        const checkLicense = async () => {
            if (!userId) return;

            try {
                const response = await fetch(`http://${import.meta.env.VITE_SERVER}:${import.meta.env.VITE_PORT}/api/license/check-license`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId }),
                });

                if (!response.ok) {
                    throw new Error('Lizenzüberprüfung fehlgeschlagen');
                }

                const data = await response.json();
                setValid(data.valid);
                setMessage(`Lizenz-ID: ${data.licenseId}`);
                onLicenseValid();
            } catch (error) {
                setValid(false);
                setMessage('Ein unbekannter Fehler ist aufgetreten.');
            }
        };

        checkLicense();
    }, [userId, onLicenseValid]);

    if (valid === null) {
        return <p>Überprüfe die Lizenz...</p>;
    }

    if (valid) {
        return <p>Lizenz gültig: {message}</p>;
    }

    return <h3>Zugriff verweigert: {message}</h3>;
};

export default LicenseCheck;
