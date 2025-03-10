"use server"

// http://localhost:8000/api/?station_name=quinali&model_type=svr&datetime=2022-3-9 03
export async function getPrediction(date: string, time: string, modelType: string, station: string) {
  let url = process.env.SERVER_URL + "/api";

  const res = fetch(url, {
    method: "POST",
    body: JSON.stringify({
      station_name: station,
      model_type: modelType,
      datetime: `${date} ${time}`
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => res.json());

  return res;
}