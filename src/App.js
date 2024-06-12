import { useEffect, useState, useMemo } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [athleteData, setAthleteData] = useState([]);
  const [countries, setCountries] = useState(["ALL"]);
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [events, setEvents] = useState(["ALL"]);
  const [selectedEvent, setSelectedEvent] = useState("ALL");

  const sortMedals = (a, b) => {
    const medalOrder = { Gold: 1, Silver: 2, Bronze: 3 };
    return medalOrder[a.medal] - medalOrder[b.medal];
  };

  const groupBy = (data, selectedKey) => {
    const group = data.reduce((acc, entry) => {
      const key = entry[selectedKey];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry);
      return acc;
    }, {});

    const sortedGroupKeys = Object.keys(group).sort();

    return sortedGroupKeys.reduce((acc, key) => {
      acc[key] = group[key];
      return acc;
    }, {});
  };

  const getData = async () => {
    try {
      const result = await axios.get("http://localhost:5050/api/athletes");
      const data = result.data;
      const groupByCountry = groupBy(data, "country");
      const athleteEvents = [];
      const athleteCountries = [];
      Object.keys(groupByCountry).forEach((country) => {
        // Generating array of unique countries
        if (!countries.includes(country)) {
          athleteCountries.push(country);
        }
        groupByCountry[country] = groupBy(groupByCountry[country], "event");
        Object.keys(groupByCountry[country]).forEach((eventName) => {
          athleteEvents.push(eventName);
          groupByCountry[country][eventName].sort((a, b) => {
            return sortMedals(a, b);
          });
        });
      });
      // Setting countries and events and ensuring the values are unique
      setCountries((countries) => [...countries, ...new Set(athleteCountries)]);
      setEvents((events) => [...events, ...new Set(athleteEvents)]);

      setAthleteData(groupByCountry);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const filteredAthleteData = useMemo(() => {
    if (selectedCountry === "ALL" && selectedEvent === "ALL") {
      return athleteData;
    }

    if (selectedCountry === "ALL") {
      const countriesWithSelectedEvent = {};
      for (const country in athleteData) {
        if (athleteData[country][selectedEvent]) {
          countriesWithSelectedEvent[country] = {
            [selectedEvent]: athleteData[country][selectedEvent],
          };
        }
      }
      return countriesWithSelectedEvent;
    }

    if (selectedEvent === "ALL") {
      return { [selectedCountry]: athleteData[selectedCountry] };
    }

    return {
      [selectedCountry]: {
        [selectedEvent]: athleteData[selectedCountry][selectedEvent],
      },
    };
  }, [athleteData, selectedCountry, selectedEvent]);

  return (
    <div className="App">
      <div className="header">
        <label>Filter by Country: </label>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <label>Filter by Event:</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          {events.map((event) => (
            <option key={event} value={event}>
              {event}
            </option>
          ))}
        </select>
      </div>
      <div className="main">
        {Object.entries(filteredAthleteData).map(([country, events]) => (
          <div key={country}>
            <h1>{country}</h1>
            {Object.entries(events).map(([event, athletes]) => (
              <div key={event}>
                <h5>{event}</h5>
                {athletes &&
                  athletes.length > 0 &&
                  athletes.map(({ athlete, medal }, index) => (
                    <p key={index}>
                      {athlete} ({medal})
                    </p>
                  ))}
                {!athletes && (
                  <p class="warning">No athletes match this search</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
