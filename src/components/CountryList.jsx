import styles from "./CountryList.module.css";
import CountryItem from "./CountryItem";
import Spinner from "./Spinner";
import Message from "./Message";
import { useCities } from "../contexts/CitiesContext";

function CountryList() {
  const { cities, isLoading } = useCities();
  if (isLoading) return <Spinner />;

  if (cities.length === 0)
    return <Message message={"Cities are not loaded yet"} />;

  // Remove duplicates using filter method
  const countries = cities
    .map((city) => ({
      country: city.country,
      emoji: city.emoji || "🌍", // Add an emoji, if available, or fallback to a default
    }))
    .filter(
      (country, index, self) =>
        index === self.findIndex((c) => c.country === country.country)
    );

  return (
    <ul className={styles.countryList}>
      {countries.map((country) => (
        <CountryItem key={country.country} country={country} />
      ))}
    </ul>
  );
}

export default CountryList;
