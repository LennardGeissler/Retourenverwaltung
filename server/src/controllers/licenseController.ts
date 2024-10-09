import { Request, Response } from 'express';
import LicenseModel from '../models/licenseModel';

export const checkLicense = (req: Request, res: Response) => {
    const { userId } = req.body;

    if (LicenseModel.isLicenseValid(userId)) {
        const license = LicenseModel.getLicense(userId);
        return res.json({ valid: true, licenseId: license?.id });
    } else {
        const newLicense = LicenseModel.updateLicense(userId);
        return res.json({ valid: true, licenseId: newLicense.id });
    }
};
