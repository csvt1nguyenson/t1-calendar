const fs = require("fs");
const axios = require("axios");
const { createEvents } = require("ics");

const API_KEY = "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z";

const LEAGUE_IDS = [
  "98767991310872058", // LCK
  "98767991325878492", // MSI
  "98767975604431411"  // Worlds
].join(",");

async function main() {
  const response = await axios.get(
    "https://esports-api.lolesports.com/persisted/gw/getSchedule",
    {
      headers: {
        "x-api-key": API_KEY
      },
      params: {
        hl: "en-US",
        leagueId: LEAGUE_IDS
      }
    }
  );

  const events = response.data.data.schedule.events || [];

  const t1Matches = events.filter(event => {
    const teams = event.match?.teams || [];

    return teams.some(team =>
      team.code === "T1" || team.name?.toLowerCase() === "t1"
    );
  });

  const calendarEvents = t1Matches.map(event => {
    const start = new Date(event.startTime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const teams = event.match.teams.map(t => t.name).join(" vs ");

    return {
      title: `T1: ${teams}`,
      description: `${event.league.name} - ${event.blockName || ""}`,
      location: "LoL Esports",
      start: [
        start.getUTCFullYear(),
        start.getUTCMonth() + 1,
        start.getUTCDate(),
        start.getUTCHours(),
        start.getUTCMinutes()
      ],
      end: [
        end.getUTCFullYear(),
        end.getUTCMonth() + 1,
        end.getUTCDate(),
        end.getUTCHours(),
        end.getUTCMinutes()
      ],
      startInputType: "utc",
      endInputType: "utc",
      alarms: [
        {
          action: "display",
          description: "T1 sắp thi đấu",
          trigger: {
            minutes: 30,
            before: true
          }
        }
      ]
    };
  });

  createEvents(calendarEvents, (error, value) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    fs.writeFileSync("t1.ics", value);
    console.log(`Đã tạo t1.ics với ${calendarEvents.length} trận.`);
  });
}

main();
