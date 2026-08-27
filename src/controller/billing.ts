import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";

const uid = (req: Request) => (req as any).user.id as string;

export const getBillingInfo = async (req: Request, res: Response) => {
  try {
    const billing = await prisma.billingInfo.findUnique({ where: { userId: uid(req) } });
    return res.status(200).json(billing);
  } catch (error) {
    logger.error(`Error getting billing info: ${error}`);
    return res.status(500).json({ message: "Unable to fetch delivery information" });
  }
};

export const saveBillingInfo = async (req: Request, res: Response) => {
  try {
    const { fullName, city, county, currentAddress, contact, country, zipCode } = req.body;
    const clean = (value: unknown, max = 200) => typeof value === "string" ? value.trim().slice(0, max) : "";
    const fullNameValue = clean(fullName, 120);
    const cityValue = clean(city, 100);
    const countyValue = clean(county, 100);
    const addressValue = clean(currentAddress, 300);
    const contactValue = clean(contact, 40);
    const countryValue = clean(country, 100);
    const zipValue = clean(zipCode, 30);
    if (!fullNameValue || !cityValue || !addressValue || !contactValue || !countryValue || !zipValue) {
      return res.status(400).json({ message: "Full name, city, address, ZIP/postal code, contact and country are required" });
    }
    const data = { fullName: fullNameValue, city: cityValue, county: countyValue, currentAddress: addressValue, contact: contactValue, country: countryValue, zipCode: zipValue };
    const billing = await prisma.billingInfo.upsert({
      where: { userId: uid(req) },
      update: data,
      create: { userId: uid(req), ...data },
    });
    return res.status(200).json(billing);
  } catch (error) {
    logger.error(`Error saving billing info: ${error}`);
    return res.status(500).json({ message: "Unable to save delivery information" });
  }
};
