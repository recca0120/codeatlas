import { z } from "zod";
import {
  type CountryData,
  CountryDataSchema,
  CountryInfoSchema,
} from "./data-output";
import { createHttpClient } from "./http";

export interface CountryLoadResult {
  countryName: string;
  countryFlag: string;
  countryData: CountryData;
}

export async function loadCountryData(
  countryCode: string,
  basePath: string,
): Promise<CountryLoadResult> {
  const http = createHttpClient(basePath);
  const allCountries = z
    .array(CountryInfoSchema)
    .parse(await http.get("data/countries.json").json());
  const config = allCountries.find((c) => c.code === countryCode);

  const countryName = config?.name || countryCode;
  const countryFlag = config?.flag || "";

  const countryData = CountryDataSchema.parse(
    await http.get(`data/${countryCode}.json`).json(),
  );

  return { countryName, countryFlag, countryData };
}
