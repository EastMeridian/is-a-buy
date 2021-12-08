import {
  AppBar,
  Card,
  CardContent,
  Grid,
  Toolbar,
  Typography,
} from "@mui/material";
import { AGENTS } from "./agents";

import data from "scraper/results.json";
import { SearchInput } from "./SearchInput";

console.log(data);

export enum Signal {
  STRONG_BUY = "STRONG_BUY",
  BUY = "BUY",
  HOLD = "HOLD",
  SELL = "SELL",
  STRONG_SELL = "STRONG_SELL",
}

const mapSignalToColor: Record<string, string> = {
  [Signal.STRONG_SELL]: "#c0392b",
  [Signal.SELL]: "#e74c3c",
  [Signal.HOLD]: "#7f8c8d",
  [Signal.BUY]: "#2ecc71",
  [Signal.STRONG_BUY]: "#27ae60",
  default: "#ecf0f1",
};

const formated = Object.entries(data).map(([symbol, value]) => {
  return {
    data: (value as Array<any>).filter(({ status }: any) => status !== "error"),
    symbol,
  };
});

function App() {
  console.log(formated);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f1f2f5",
      }}
    >
      <AppBar>
        <Toolbar>
          <SearchInput />
        </Toolbar>
      </AppBar>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "6rem 2rem 2rem 2rem",
          backgroundColor: "#f1f2f5",
        }}
      >
        {formated.map(({ symbol, data }) => (
          <div key={symbol} style={{ marginBottom: "4rem" }}>
            <Typography variant="h2">{symbol}</Typography>
            <Grid container rowSpacing={2} columnSpacing={2}>
              {data.map(
                ({
                  agentName,
                  source,
                  signal,
                  lastUpdateDate,
                  lastUpdateInfo,
                }) => (
                  <Grid item key={agentName} xs={4}>
                    <Card
                      sx={{
                        minWidth: "20rem",
                        height: "16rem",
                        display: "flex",
                      }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <img
                            src={AGENTS[agentName].logo}
                            alt={agentName}
                            style={{
                              height: "3rem",
                              maxWidth: "10rem",
                              objectFit: "contain",
                              borderRadius: "0.5rem",
                            }}
                          />
                          <Typography
                            color={"white"}
                            variant="h6"
                            style={{
                              backgroundColor:
                                mapSignalToColor[signal || "default"],
                              padding: "0.25rem 1rem",
                              borderRadius: "0.25rem",
                              textTransform: "capitalize",
                              boxShadow:
                                "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
                            }}
                          >
                            {signal?.replace("_", " ").toLowerCase() ||
                              "Unknow"}
                          </Typography>
                        </div>
                        <div style={{ fontSize: "1rem" }}>
                          last update:
                          {!!lastUpdateDate
                            ? new Date(lastUpdateDate).toString()
                            : lastUpdateInfo}
                        </div>
                        <div style={{ fontSize: "0.75rem" }}>
                          source:
                          <a href={source} target="_blank" rel="noreferrer">
                            {source}
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              )}
            </Grid>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
