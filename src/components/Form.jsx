import { useEffect, useState } from "react";
import styles from "./Form.module.css";
import Button from "./Button";
import ButtonBack from "./ButtonBack";
import { useUrlPosition } from "../hooks/useUrlPosition";
import DatePicker from "react-datepicker";
import Message from "./Message";
import "react-datepicker/dist/react-datepicker.css";
import { useCities } from "../contexts/CitiesContext";
import { useNavigate } from "react-router-dom";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
  const [cityName, setCityName] = useState("");
  const { createCity, isLoading } = useCities();
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default to today's date
  const [notes, setNotes] = useState("");
  const [lat, lng] = useUrlPosition();
  const [isLoadingGeoCoding, setIsLoadingGeoCoding] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [geoError, setGeoError] = useState(""); // Handle error message
  const navigate = useNavigate();

  useEffect(() => {
    if (!lat && !lng) return;
    async function fetchCityData() {
      setIsLoadingGeoCoding(true);
      setGeoError(""); // Reset error message
      try {
        const res = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lng}`);
        const data = await res.json();
        if (!res.ok) throw new Error("Data not loaded");

        if (!data.countryCode) {
          setGeoError("Could not determine country. Please try again.");
          return;
        }

        setCityName(data.city || data.locality || "");
        setCountry(data.countryCode);
        if (data.countryCode) {
          setEmoji(convertToEmoji(data.countryCode));
        }
      } catch (err) {
        console.error("Error fetching city data:", err);
        setGeoError("Error fetching city data. Please try again.");
      } finally {
        setIsLoadingGeoCoding(false);
      }
    }
    if (lat && lng) fetchCityData();
  }, [lat, lng]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;
    const newCity = {
      cityName,
      emoji,
      country,
      date,
      notes,
      position: { lat, lng },
    };
    // console.log(newCity);
    await createCity(newCity);
    navigate("/app/cities");
  }

  if (geoError) return <Message message={geoError} />;
  if (!lat && !lng)
    return (
      <Message message={"start by clicking on the map to get the location"} />
    );

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      {geoError && <Message message={geoError} />}{" "}
      {/* Display error message if any */}
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
          disabled={isLoadingGeoCoding} // Disable input while loading
        />
        <span className={styles.flag}>{emoji}</span>
      </div>
      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker
          id="date"
          selected={date}
          onChange={(date) => setDate(date)}
          dateFormat="dd/MM/yyyy"
        />
      </div>
      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>
      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <ButtonBack />
      </div>
    </form>
  );
}

export default Form;
