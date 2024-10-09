import { v4 as uuidv4 } from 'uuid';

interface License {
    id: string;
    date: Date;
}

const licenses: Record<string, License> = {};

const LicenseModel = {
    getLicense: (userId: string): License | undefined => {
        console.log(licenses);
        return licenses[userId];
    },

    createLicense: (userId: string): License => {
        const newLicenseId = uuidv4();
        licenses[userId] = { id: newLicenseId, date: new Date() };
        console.log(licenses);
        return licenses[userId];
    },

    isLicenseValid: (userId: string): boolean => {
        const license = licenses[userId];
        if (!license) return false;
        const currentDate = new Date();
        const licenseDate = new Date(license.date);
        console.log(licenses);
        return (currentDate.getTime() - licenseDate.getTime()) < (24 * 60 * 60 * 1000);
    },

    updateLicense: (userId: string): License => {
        const newLicenseId = uuidv4();
        licenses[userId] = { id: newLicenseId, date: new Date() };
        console.log(licenses);
        return licenses[userId];
    },
};

export default LicenseModel;
