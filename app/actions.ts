"use server"

// http://localhost:8000/api/?station_name=quinali&model_type=svr&datetime=2022-3-9 03
export async function getPrediction(date: string, time: string, modelType: string, station: string) {
  let url: URL;
  if (process.env.SERVER_URL) {
    url = new URL(process.env.SERVER_URL)
  } else {
    url = new URL(`/api/?station_name=${station}&model_type=${modelType}&datetime=${date + " " + time}`, "http://localhost:8000");
  }
}